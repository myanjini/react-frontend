// 백엔드 GET /books 응답(BookPage)과 같은 모양의 샘플 데이터
export const SAMPLE_PAGE = {
  items: [
    { id: 1, title: '파이썬 입문', price: 18000, isbn: null, author: { id: 1, name: '홍길동' } },
    { id: 2, title: 'FastAPI 실전', price: 32000, isbn: '9791100000011', author: { id: 2, name: '김철수' } },
    { id: 3, title: '데이터베이스 첫걸음', price: 21000, isbn: null, author: { id: 1, name: '홍길동' } },
    { id: 4, title: 'React 시작하기', price: 27000, isbn: null, author: { id: 3, name: '이영희' } },
  ],
  total: 4,
  skip: 0,
  limit: 10,
};

// 네트워크 요청 대신 시간이 걸리는 작업을 흉내 냅니다. (S6에서 실제 API로 바꿉니다.)
export function loadSampleBooks(delayMs = 800) {
  return new Promise((resolve) => setTimeout(() => resolve(SAMPLE_PAGE.items), delayMs));
}
