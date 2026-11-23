import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { listBooks } from '../api/books';
import { checkHealth } from '../api/health';
import HealthPanel from './HealthPanel';
import KpiCard from './KpiCard';
import LogAnalyzer from './LogAnalyzer';
import StatusBadge from './StatusBadge';
import StatusDistribution from './StatusDistribution';
import { average, errorRate, healthLevel, percentile } from './metrics';
import { useTelemetry } from './useTelemetry';

const HEALTH_INTERVAL_MS = 10_000;
const KPI_INTERVAL_MS = 60_000;
const HISTORY_SIZE = 30;

const clock = new Intl.DateTimeFormat('ko-KR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

export default function DashboardPage() {
  const records = useTelemetry();

  // 폴링: refetchInterval마다 다시 요청합니다. TanStack Query는 앞 요청이 끝나기 전에
  // 다음 요청을 겹쳐 보내지 않고, 탭이 보이지 않으면 쉬며, 화면을 떠나면 멈춥니다.
  const { data: latest } = useQuery({
    queryKey: ['health'],
    queryFn: ({ signal }) => checkHealth(signal),
    refetchInterval: HEALTH_INTERVAL_MS,
    staleTime: 0,
  });

  // limit=1로 요청하면 목록 대신 total 값만 가볍게 얻을 수 있습니다.
  const { data: bookTotal = null } = useQuery({
    queryKey: ['books', 'total'],
    queryFn: ({ signal }) => listBooks({ limit: 1 }, signal).then((page) => page.total),
    refetchInterval: KPI_INTERVAL_MS,
  });

  // 새 점검 결과가 도착할 때마다 이력에 붙이고 최근 30개만 남깁니다.
  const [history, setHistory] = useState([]);
  useEffect(() => {
    if (!latest) return;
    setHistory((prev) =>
      prev.at(-1)?.checkedAt === latest.checkedAt ? prev : [...prev, latest].slice(-HISTORY_SIZE),
    );
  }, [latest]);

  const level = healthLevel(latest);
  // records가 바뀔 때만 다시 계산합니다. 다른 상태가 바뀌어 다시 그려질 때는 이전 결과를 씁니다.
  const stats = useMemo(() => {
    const durations = records.map((r) => r.durationMs);
    return { avg: average(durations), p95: percentile(durations, 95), rate: errorRate(records) };
  }, [records]);

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>도서 서비스 관제 대시보드</h1>
        <p className="muted">
          헬스 체크 {HEALTH_INTERVAL_MS / 1000}초 간격, 마지막 갱신{' '}
          {latest ? clock.format(latest.checkedAt) : '-'}
        </p>
      </header>

      <div className="kpi-row">
        <KpiCard title="API 상태" hint={latest ? `HTTP ${latest.httpStatus || '응답 없음'}` : null}>
          <StatusBadge level={level} />
        </KpiCard>
        <KpiCard title="데이터베이스" hint={latest?.database}>
          <StatusBadge level={latest ? (latest.database === 'ok' ? 'good' : 'critical') : 'unknown'} />
        </KpiCard>
        <KpiCard title="등록 도서" value={bookTotal === null ? null : bookTotal.toLocaleString('ko-KR')} unit="권" />
        <KpiCard
          title="브라우저 측정 응답 시간"
          value={stats.avg}
          unit="ms"
          hint={`p95 ${stats.p95 ?? '-'} ms, 최근 ${records.length}건`}
        />
        <KpiCard
          title="오류율 (5xx, 연결 실패)"
          value={stats.rate === null ? null : stats.rate.toFixed(1)}
          unit="%"
          hint="이 브라우저에서 보낸 요청 기준"
        />
      </div>

      <div className="grid-2">
        <HealthPanel history={history} />
        <StatusDistribution records={records} title="브라우저 요청 상태 코드 분포" />
      </div>

      <LogAnalyzer />
    </div>
  );
}
