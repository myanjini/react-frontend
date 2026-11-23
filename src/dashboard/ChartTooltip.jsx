// Recharts 기본 툴팁 대신 대시보드 색에 맞춘 툴팁을 씁니다.
export default function ChartTooltip({ active, payload, label, unit = '' }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="chart-tooltip">
      <div className="muted">{label}</div>
      <strong>
        {payload[0].value}
        {unit}
      </strong>
    </div>
  );
}
