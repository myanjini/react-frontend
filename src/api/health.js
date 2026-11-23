import { API_BASE_URL } from './client';

// 헬스 체크는 Fetch API로 직접 호출합니다.
// 503도 의미 있는 응답이므로 상태 코드와 본문을 함께 돌려줍니다.
export async function checkHealth(signal) {
  const startedAt = performance.now();
  try {
    const response = await fetch(`${API_BASE_URL}/health`, { signal, cache: 'no-store' });
    const body = await response.json().catch(() => null);
    return {
      reachable: true,
      httpStatus: response.status,
      status: body?.status ?? 'unknown',
      database: body?.database ?? 'unknown',
      durationMs: Math.round(performance.now() - startedAt),
      checkedAt: Date.now(),
    };
  } catch (error) {
    if (error.name === 'AbortError') throw error;
    return {
      reachable: false,
      httpStatus: 0,
      status: 'unreachable',
      database: 'unknown',
      durationMs: null,
      checkedAt: Date.now(),
    };
  }
}
