import { useState } from 'react';
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
  const [asTable, setAsTable] = useState(false);
  const summary = data.map((d) => `${d.name} ${d.count}건`).join(', ');

  return (
    <article className="panel">
      <div className="panel-head">
        <h2>{title}</h2>
        {/* 차트를 볼 수 없는 사용자와 정확한 값이 필요한 사용자를 위해 표 보기를 제공합니다. */}
        <button type="button" aria-pressed={asTable} onClick={() => setAsTable((v) => !v)}>
          {asTable ? '차트로 보기' : '표로 보기'}
        </button>
      </div>
      {asTable ? (
        <table className="table">
          <thead>
            <tr>
              <th>상태 코드</th>
              <th className="num">건수</th>
            </tr>
          </thead>
          <tbody>
            {data.map((d) => (
              <tr key={d.name}>
                <td>{d.name}</td>
                <td className="num">{d.count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        // 차트 전체를 하나의 그림으로 보고, 화면 낭독기에는 요약 문장을 읽어 줍니다.
        <div className="chart" role="img" aria-label={`${title}: ${summary}`}>
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
      )}
    </article>
  );
}
