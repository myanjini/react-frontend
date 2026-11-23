// 브라우저에서 보낸 API 요청의 결과를 최근 200건까지 기억합니다.
// 관제 대시보드가 이 기록으로 응답 시간과 상태 코드 분포를 그립니다.
const MAX_RECORDS = 200;
let records = [];
const listeners = new Set();

export function recordRequest(entry) {
  records = [...records, entry].slice(-MAX_RECORDS);
  listeners.forEach((listener) => listener());
}

export function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getRecords() {
  return records;
}
