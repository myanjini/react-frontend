// 백엔드 오류 응답을 화면에서 쓰기 쉬운 하나의 모양으로 바꿉니다.
// 백엔드 AppError 형식: {"code": "...", "message": "..."}
// FastAPI 기본 검증 오류(422) 형식: {"detail": [{"loc": [...], "msg": "...", "type": "..."}]}
export class ApiError extends Error {
  constructor({ status, code, message, fields = {}, retryAfter = null }) {
    super(message);
    this.name = 'ApiError';
    this.status = status; // HTTP 상태 코드, 네트워크 오류면 0
    this.code = code; // 백엔드 오류 코드 (예: DUPLICATE_ISBN)
    this.fields = fields; // 입력 칸별 오류 메시지 { title: '...' }
    this.retryAfter = retryAfter; // 429 응답의 Retry-After(초)
  }
}

const STATUS_MESSAGES = {
  400: '요청 형식이 올바르지 않습니다.',
  401: '로그인이 필요합니다.',
  403: '이 작업을 할 권한이 없습니다.',
  404: '요청한 대상을 찾을 수 없습니다.',
  409: '현재 상태에서는 처리할 수 없는 요청입니다.',
  413: '파일이 너무 큽니다.',
  415: '지원하지 않는 파일 형식입니다.',
  422: '입력값을 확인해 주세요.',
  429: '요청이 너무 많습니다. 잠시 후 다시 시도해 주세요.',
  500: '서버에서 오류가 발생했습니다.',
  503: '서비스를 일시적으로 사용할 수 없습니다.',
};

export function toApiError(status, body, headers = {}) {
  const retryAfterRaw = headers['retry-after'];
  const retryAfter = retryAfterRaw ? Number(retryAfterRaw) : null;

  // 1) 백엔드가 직접 만든 오류
  if (body && typeof body.code === 'string') {
    return new ApiError({ status, code: body.code, message: body.message, retryAfter });
  }

  // 2) FastAPI 검증 오류: 칸 이름별로 메시지를 모읍니다.
  if (body && Array.isArray(body.detail)) {
    const fields = {};
    for (const item of body.detail) {
      const name = item.loc?.[item.loc.length - 1];
      if (name !== undefined && !fields[name]) fields[name] = item.msg;
    }
    return new ApiError({ status, code: 'VALIDATION_ERROR', message: STATUS_MESSAGES[422], fields });
  }

  // 3) detail이 문자열인 경우 (FastAPI HTTPException 기본 형식)
  if (body && typeof body.detail === 'string') {
    return new ApiError({ status, code: `HTTP_${status}`, message: body.detail, retryAfter });
  }

  // 4) 그 밖의 경우: 상태 코드로 기본 메시지를 고릅니다.
  return new ApiError({
    status,
    code: `HTTP_${status}`,
    message: STATUS_MESSAGES[status] ?? '알 수 없는 오류가 발생했습니다.',
    retryAfter,
  });
}

export const NETWORK_ERROR_MESSAGE =
  '서버에 연결할 수 없습니다. 백엔드 실행 여부와 CORS 설정을 확인해 주세요.';
