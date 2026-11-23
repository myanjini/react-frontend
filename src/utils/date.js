// 백엔드는 UTC로 저장합니다. 화면에서는 사용자의 시간대로 보여 줍니다.
// 시간대 표시(Z 또는 +09:00)가 없는 문자열은 브라우저가 현지 시각으로 해석하므로
// UTC임을 나타내는 Z를 붙여 줍니다.
const dateFormat = new Intl.DateTimeFormat('ko-KR', { dateStyle: 'medium', timeStyle: 'short' });

export function parseServerDate(iso) {
  const hasZone = /(Z|[+-]\d{2}:\d{2})$/.test(iso);
  return new Date(hasZone ? iso : `${iso}Z`);
}

export function formatDate(iso) {
  if (!iso) return '-';
  return dateFormat.format(parseServerDate(iso));
}
