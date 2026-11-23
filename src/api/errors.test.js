import { describe, expect, it } from 'vitest';
import { ApiError, toApiError } from './errors';

describe('toApiError', () => {
  it('백엔드 AppError 형식에서 code와 message를 꺼낸다', () => {
    const error = toApiError(409, { code: 'DUPLICATE_ISBN', message: '이미 등록된 ISBN입니다.' });
    expect(error).toBeInstanceOf(ApiError);
    expect(error.status).toBe(409);
    expect(error.code).toBe('DUPLICATE_ISBN');
    expect(error.message).toBe('이미 등록된 ISBN입니다.');
  });

  it('FastAPI 검증 오류를 칸 이름별 메시지로 바꾼다', () => {
    const body = {
      detail: [
        { loc: ['body', 'title'], msg: 'String should have at least 1 character', type: 'string_too_short' },
        { loc: ['body', 'price'], msg: 'Input should be greater than or equal to 0', type: 'greater_than_equal' },
      ],
    };
    const error = toApiError(422, body);
    expect(error.code).toBe('VALIDATION_ERROR');
    expect(error.fields).toEqual({
      title: 'String should have at least 1 character',
      price: 'Input should be greater than or equal to 0',
    });
  });

  it('알 수 없는 형식이면 상태 코드별 기본 메시지를 쓴다', () => {
    expect(toApiError(500, null).message).toBe('서버에서 오류가 발생했습니다.');
    expect(toApiError(418, 'teapot').message).toBe('알 수 없는 오류가 발생했습니다.');
  });

  it('429 응답의 Retry-After 헤더를 숫자로 읽는다', () => {
    const error = toApiError(429, { code: 'TOO_MANY_ATTEMPTS', message: '잠김' }, { 'retry-after': '900' });
    expect(error.retryAfter).toBe(900);
  });
});
