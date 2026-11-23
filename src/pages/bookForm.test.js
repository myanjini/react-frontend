import { describe, expect, it } from 'vitest';
import { diff, toPayload, validate } from './bookForm';

const valid = { title: ' 파이썬 입문 ', author_id: '1', price: '18000', isbn: '' };

describe('validate', () => {
  it('올바른 입력이면 오류가 없다', () => {
    expect(validate(valid)).toEqual({});
  });

  it('백엔드 BookCreate 규칙과 같은 기준으로 검사한다', () => {
    const errors = validate({ title: '', author_id: '', price: '-1', isbn: '123' });
    expect(Object.keys(errors).sort()).toEqual(['author_id', 'isbn', 'price', 'title']);
  });

  it('가격 상한은 1,000,000이다', () => {
    expect(validate({ ...valid, price: '1000000' }).price).toBeUndefined();
    expect(validate({ ...valid, price: '1000001' }).price).toBeDefined();
  });
});

describe('toPayload', () => {
  it('문자열 입력을 API 본문 형식으로 바꾼다', () => {
    expect(toPayload(valid)).toEqual({ title: '파이썬 입문', author_id: 1, price: 18000, isbn: null });
  });
});

describe('diff', () => {
  it('바뀐 필드만 담는다', () => {
    const original = { title: '파이썬 입문', author: { id: 1, name: '홍길동' }, price: 18000, isbn: null };
    expect(diff(original, toPayload({ ...valid, price: '20000' }))).toEqual({ price: 20000 });
  });
});
