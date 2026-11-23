export default function KpiCard({ title, value, unit, hint, children }) {
  return (
    <article className="kpi">
      <h3>{title}</h3>
      {/* value를 넘기지 않은 카드(상태 카드)는 숫자 칸을 그리지 않습니다. */}
      {value !== undefined && (
        <p className="kpi-value">
          {value ?? '-'}
          {value !== null && unit && <small> {unit}</small>}
        </p>
      )}
      {children}
      {hint && <p className="kpi-hint">{hint}</p>}
    </article>
  );
}
