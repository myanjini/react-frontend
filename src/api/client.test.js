import { describe, expect, it } from 'vitest';
import { toAssetUrl } from './client';

describe('toAssetUrl', () => {
  it('경로에는 API 주소를 붙인다', () => {
    expect(toAssetUrl('/covers/a.png')).toBe('http://api.test/covers/a.png');
  });

  it('완전한 주소는 그대로 둔다', () => {
    const url = 'https://bucket.s3.ap-northeast-2.amazonaws.com/covers/a.png';
    expect(toAssetUrl(url)).toBe(url);
  });

  it('값이 없으면 null을 돌려준다', () => {
    expect(toAssetUrl(null)).toBeNull();
  });
});
