// 도서 폼의 값 변환과 검증 규칙입니다. 화면과 분리해 두면 따로 테스트하기 쉽습니다.
export const EMPTY_FORM = { title: '', author_id: '', price: '', isbn: '' };

// 화면 입력값(문자열)을 API 본문(JSON)으로 바꿉니다.
export function toPayload(form) {
  return {
    title: form.title.trim(),
    author_id: Number(form.author_id),
    price: Number(form.price),
    isbn: form.isbn.trim() === '' ? null : form.isbn.trim(),
  };
}

// 수정할 때는 바뀐 필드만 보냅니다 (PATCH).
export function diff(original, payload) {
  const changes = {};
  if (payload.title !== original.title) changes.title = payload.title;
  if (payload.author_id !== original.author?.id) changes.author_id = payload.author_id;
  if (payload.price !== original.price) changes.price = payload.price;
  if (payload.isbn !== (original.isbn ?? null)) changes.isbn = payload.isbn;
  return changes;
}

// 백엔드 규칙과 같은 기준으로 먼저 확인해 사용자에게 빠르게 알려 줍니다.
export function validate(form) {
  const errors = {};
  const title = form.title.trim();
  if (title.length < 1 || title.length > 100) errors.title = '제목은 1~100자로 입력합니다.';
  if (!form.author_id) errors.author_id = '저자를 고릅니다.';
  const price = Number(form.price);
  if (form.price === '' || !Number.isInteger(price) || price < 0 || price > 1_000_000)
    errors.price = '가격은 0~1,000,000 사이의 정수입니다.';
  if (form.isbn.trim() && !/^\d{13}$/.test(form.isbn.trim())) errors.isbn = 'ISBN은 숫자 13자리입니다.';
  return errors;
}
