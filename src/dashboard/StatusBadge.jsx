// 상태는 색만으로 구분하지 않고 모양과 글자를 함께 보여 줍니다.
const STATUS = {
  good: { label: '정상', shape: '●' },
  warning: { label: '주의', shape: '▲' },
  critical: { label: '장애', shape: '■' },
  unknown: { label: '확인 중', shape: '○' },
};

export default function StatusBadge({ level, text }) {
  const status = STATUS[level] ?? STATUS.unknown;
  return (
    <span className={`status status-${level}`}>
      <span aria-hidden="true">{status.shape}</span> {text ?? status.label}
    </span>
  );
}
