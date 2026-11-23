import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import ChartTooltip from './ChartTooltip';
import StatusBadge from './StatusBadge';
import { healthLevel } from './metrics';

const timeFormat = new Intl.DateTimeFormat('ko-KR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

export default function HealthPanel({ history }) {
  const data = history
    .filter((c) => c.durationMs !== null)
    .map((c) => ({ time: timeFormat.format(c.checkedAt), ms: c.durationMs }));

  return (
    <article className="panel">
      <h2>헬스 체크 이력</h2>
      {/* 최근 점검 결과를 한 칸씩 나열합니다. 칸에 마우스를 올리면 시각과 결과가 보입니다. */}
      <div className="strip" role="list" aria-label="최근 헬스 체크 결과">
        {history.map((check) => {
          const level = healthLevel(check);
          return (
            <span
              key={check.checkedAt}
              role="listitem"
              className={`strip-cell status-bg-${level}`}
              title={`${timeFormat.format(check.checkedAt)} ${check.status} / DB ${check.database}`}
            />
          );
        })}
      </div>
      <div className="legend">
        <StatusBadge level="good" /> <StatusBadge level="warning" text="주의(DB 이상)" />{' '}
        <StatusBadge level="critical" text="장애(응답 없음, 5xx)" />
      </div>

      <h3>헬스 체크 응답 시간 (ms)</h3>
      <div className="chart">
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={data} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
            <CartesianGrid stroke="var(--grid)" vertical={false} />
            <XAxis dataKey="time" stroke="var(--text-muted)" tick={{ fontSize: 12 }} minTickGap={40} />
            <YAxis stroke="var(--text-muted)" tick={{ fontSize: 12 }} width={40} />
            <Tooltip content={<ChartTooltip unit=" ms" />} cursor={{ stroke: 'var(--text-muted)' }} />
            <Line
              type="monotone"
              dataKey="ms"
              stroke="var(--series-1)"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </article>
  );
}
