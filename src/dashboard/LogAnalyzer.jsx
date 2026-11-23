import { memo, useMemo, useState } from 'react';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import ChartTooltip from './ChartTooltip';
import StatusDistribution from './StatusDistribution';
import { countPerMinute, parseRequestLogs, summarizeByPath } from './metrics';

const MAX_FILE_BYTES = 20 * 1024 * 1024;

// 요청 기록이 늘 때마다 대시보드 전체가 다시 그려집니다. props가 없는 이 컴포넌트는
// memo로 감싸 부모가 다시 그려져도 건너뛰게 합니다.
function LogAnalyzer() {
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  async function handleFile(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_FILE_BYTES) {
      setError('20MB 이하의 로그 파일만 분석합니다.');
      return;
    }
    setError('');
    // 파일은 서버로 보내지 않고 브라우저 안에서만 읽습니다.
    const text = await file.text();
    setResult({ fileName: file.name, ...parseRequestLogs(text) });
  }

  const summary = useMemo(() => {
    if (!result) return null;
    return {
      perMinute: countPerMinute(result.entries),
      byPath: summarizeByPath(result.entries).slice(0, 10),
      records: result.entries.map((e) => ({ status: e.status })),
    };
  }, [result]);

  return (
    <section className="log-analyzer">
      <h2>백엔드 요청 로그 분석</h2>
      <p className="muted">
        docker compose logs api --no-log-prefix 명령으로 저장한 JSON Lines 로그 파일을 고릅니다.
      </p>
      <input type="file" accept=".log,.jsonl,.txt" onChange={handleFile} />
      {error && <p className="error">{error}</p>}

      {result && summary && (
        <>
          <p className="muted">
            {result.fileName}: 요청 로그 {result.entries.length}건, 건너뛴 줄 {result.invalid}건
          </p>
          <div className="grid-2">
            <article className="panel">
              <h2>분당 요청 수</h2>
              <div className="chart">
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={summary.perMinute} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
                    <CartesianGrid stroke="var(--grid)" vertical={false} />
                    <XAxis dataKey="minute" stroke="var(--text-muted)" tick={{ fontSize: 12 }} minTickGap={30} />
                    <YAxis allowDecimals={false} stroke="var(--text-muted)" tick={{ fontSize: 12 }} width={40} />
                    <Tooltip content={<ChartTooltip unit="건" />} cursor={{ stroke: 'var(--text-muted)' }} />
                    <Line
                      type="monotone"
                      dataKey="count"
                      stroke="var(--series-1)"
                      strokeWidth={2}
                      dot={false}
                      isAnimationActive={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </article>
            <StatusDistribution records={summary.records} title="로그 상태 코드 분포" />
          </div>

          <article className="panel">
            <h2>느린 API 상위 10개 (p95 기준)</h2>
            <table className="table">
              <thead>
                <tr>
                  <th>API</th>
                  <th className="num">요청 수</th>
                  <th className="num">5xx</th>
                  <th className="num">평균(ms)</th>
                  <th className="num">p95(ms)</th>
                </tr>
              </thead>
              <tbody>
                {summary.byPath.map((row) => (
                  <tr key={row.api}>
                    <td>
                      <code>{row.api}</code>
                    </td>
                    <td className="num">{row.count}</td>
                    <td className="num">{row.errors}</td>
                    <td className="num">{row.avgMs}</td>
                    <td className="num">{row.p95Ms}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </article>
        </>
      )}
    </section>
  );
}

export default memo(LogAnalyzer);
