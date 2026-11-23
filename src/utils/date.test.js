import { describe, expect, it } from 'vitest';
import { formatDate, parseServerDate } from './date';

describe('parseServerDate', () => {
  it('시간대 표시가 없으면 UTC로 해석한다', () => {
    expect(parseServerDate('2026-11-23T06:58:12').toISOString()).toBe('2026-11-23T06:58:12.000Z');
  });

  it('시간대 표시가 있으면 그대로 해석한다', () => {
    expect(parseServerDate('2026-11-23T15:58:12+09:00').toISOString()).toBe('2026-11-23T06:58:12.000Z');
  });
});

describe('formatDate', () => {
  it('UTC 시각을 한국 시간으로 표시한다', () => {
    expect(formatDate('2026-11-23T06:58:12')).toContain('오후 3:58');
  });

  it('값이 없으면 -를 표시한다', () => {
    expect(formatDate(null)).toBe('-');
  });
});
