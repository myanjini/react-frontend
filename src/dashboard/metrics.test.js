import { describe, expect, it } from 'vitest';
import { countByStatusClass, countPerMinute, errorRate, healthLevel, normalizePath, parseRequestLogs, percentile, summarizeByPath } from './metrics';

describe('기본 통계', () => {
  it('p95는 정렬한 값에서 95번째 위치의 값이다', () => {
    const values = Array.from({ length: 100 }, (_, i) => i + 1); // 1~100
    expect(percentile(values, 95)).toBe(95);
    expect(percentile([], 95)).toBeNull();
  });

  it('오류율은 5xx와 연결 실패(0)만 센다', () => {
    const records = [{ status: 200 }, { status: 404 }, { status: 500 }, { status: 0 }];
    expect(errorRate(records)).toBe(50);
  });

  it('상태 코드를 묶음별로 센다', () => {
    const counts = countByStatusClass([{ status: 200 }, { status: 201 }, { status: 409 }, { status: 0 }]);
    expect(counts).toEqual([
      { name: '2xx', count: 2 },
      { name: '3xx', count: 0 },
      { name: '4xx', count: 1 },
      { name: '5xx', count: 0 },
      { name: '연결 실패', count: 1 },
    ]);
  });
});

describe('로그 분석', () => {
  it('숫자 경로를 {id}로 묶는다', () => {
    expect(normalizePath('/books/12/cover?x=1')).toBe('/books/{id}/cover');
  });

  it('JSON Lines에서 요청 로그만 골라내고 나머지 줄은 센다', () => {
    const text = [
      'INFO:     Started server process',
      '{"time":"2026-11-23T09:15:01","logger":"app.request","method":"GET","path":"/books/1","status":200,"duration_ms":12}',
      '{"time":"2026-11-23T09:15:30","logger":"app.request","method":"GET","path":"/books/2","status":500,"duration_ms":40}',
      '{"time":"2026-11-23T09:16:02","logger":"app.other","message":"x"}',
    ].join('\n');
    const { entries, invalid } = parseRequestLogs(text);
    expect(entries).toHaveLength(2);
    expect(invalid).toBe(1);
    expect(countPerMinute(entries)).toEqual([{ minute: '09:15', count: 2 }]);
    expect(summarizeByPath(entries)[0]).toMatchObject({ api: 'GET /books/{id}', count: 2, errors: 1 });
  });
});

describe('healthLevel', () => {
  it('응답 없음과 5xx는 장애, DB 이상은 주의다', () => {
    expect(healthLevel({ reachable: false })).toBe('critical');
    expect(healthLevel({ reachable: true, httpStatus: 503, status: 'error', database: 'unreachable' })).toBe('critical');
    expect(healthLevel({ reachable: true, httpStatus: 200, status: 'ok', database: 'slow' })).toBe('warning');
    expect(healthLevel({ reachable: true, httpStatus: 200, status: 'ok', database: 'ok' })).toBe('good');
  });
});
