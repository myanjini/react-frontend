import { Bar, BarChart, CartesianGrid, Cell, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import ChartTooltip from './ChartTooltip';
import { countByStatusClass } from './metrics';

// 상태 묶음마다 의미가 정해진 상태 색을 씁니다. 막대 위 숫자와 축 이름이 함께 나오므로
// 색만으로 구분하지 않습니다.
const COLOR = {
  '2xx': 'var(--status-good)',
  '3xx': 'var(--series-1)',
  '4xx': 'var(--status-warning)',
  '5xx': 'var(--status-critical)',
  '연결 실패': 'var(--status-serious)',
};

export default function StatusDistribution({ records, title }) {
  const data = countByStatusClass(records);
  return (
    <article className="panel">
      <h2>{title}</h2>
      <div className="chart">
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={data} margin={{ top: 20, right: 16, bottom: 0, left: 0 }} barCategoryGap="30%">
            <CartesianGrid stroke="var(--grid)" vertical={false} />
            <XAxis dataKey="name" stroke="var(--text-muted)" tick={{ fontSize: 12 }} />
            <YAxis allowDecimals={false} stroke="var(--text-muted)" tick={{ fontSize: 12 }} width={40} />
            <Tooltip content={<ChartTooltip unit="건" />} cursor={{ fill: 'var(--hover)' }} />
            <Bar dataKey="count" radius={[4, 4, 0, 0]} isAnimationActive={false}>
              {data.map((entry) => (
                <Cell key={entry.name} fill={COLOR[entry.name]} />
              ))}
              <LabelList dataKey="count" position="top" fill="var(--text-secondary)" fontSize={12} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </article>
  );
}
