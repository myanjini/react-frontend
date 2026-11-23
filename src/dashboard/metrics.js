// 대시보드 지표 계산 함수 모음. 화면 코드와 분리해 두면 따로 검증하기 쉽습니다.

export function percentile(values, p) {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.ceil((p / 100) * sorted.length) - 1;
  return sorted[Math.max(0, index)];
}

export function average(values) {
  if (values.length === 0) return null;
  return Math.round(values.reduce((sum, v) => sum + v, 0) / values.length);
}

// 상태 코드를 2xx, 4xx 같은 묶음으로 나눕니다. 0은 응답을 받지 못한 경우입니다.
export function statusClass(status) {
  if (!status) return '연결 실패';
  return `${Math.floor(status / 100)}xx`;
}

export const STATUS_CLASS_ORDER = ['2xx', '3xx', '4xx', '5xx', '연결 실패'];

export function countByStatusClass(records) {
  const counts = Object.fromEntries(STATUS_CLASS_ORDER.map((key) => [key, 0]));
  for (const record of records) counts[statusClass(record.status)] += 1;
  return STATUS_CLASS_ORDER.map((name) => ({ name, count: counts[name] }));
}

export function errorRate(records) {
  if (records.length === 0) return null;
  const errors = records.filter((r) => !r.status || r.status >= 500).length;
  return (errors / records.length) * 100;
}

// /books/12/cover -> /books/{id}/cover 처럼 숫자 경로를 묶어 같은 API로 집계합니다.
export function normalizePath(path = '') {
  return path.split('?')[0].replace(/\/\d+(?=\/|$)/g, '/{id}');
}

// JSON Lines(한 줄에 JSON 하나) 로그를 읽어 요청 로그만 골라냅니다.
export function parseRequestLogs(text) {
  const entries = [];
  let invalid = 0;
  for (const line of text.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    try {
      const entry = JSON.parse(trimmed);
      if (entry.logger === 'app.request' && typeof entry.status === 'number') entries.push(entry);
    } catch {
      invalid += 1; // JSON이 아닌 줄(서버 시작 메시지 등)은 건너뜁니다.
    }
  }
  return { entries, invalid };
}

export function summarizeByPath(entries) {
  const groups = new Map();
  for (const entry of entries) {
    const key = `${entry.method} ${normalizePath(entry.path)}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(entry);
  }
  return [...groups.entries()]
    .map(([api, items]) => {
      const durations = items.map((i) => i.duration_ms);
      return {
        api,
        count: items.length,
        errors: items.filter((i) => i.status >= 500).length,
        avgMs: average(durations),
        p95Ms: percentile(durations, 95),
      };
    })
    .sort((a, b) => b.p95Ms - a.p95Ms);
}

export function countPerMinute(entries) {
  const buckets = new Map();
  for (const entry of entries) {
    const minute = String(entry.time).slice(0, 16); // "2026-11-23T09:15"
    buckets.set(minute, (buckets.get(minute) ?? 0) + 1);
  }
  return [...buckets.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([minute, count]) => ({ minute: minute.slice(11), count }));
}

// 헬스 체크 한 건을 정상, 주의, 장애로 판정합니다.
export function healthLevel(check) {
  if (!check) return 'unknown';
  if (!check.reachable || check.httpStatus >= 500) return 'critical';
  if (check.status !== 'ok' || check.database !== 'ok') return 'warning';
  return 'good';
}
