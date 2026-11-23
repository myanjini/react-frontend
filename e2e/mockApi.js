// 브라우저가 보내는 API 요청을 가로채 가짜 응답을 돌려줍니다. 백엔드 없이도 E2E 테스트가 돌아갑니다.
const API = 'http://127.0.0.1:8000';

const book = { id: 1, title: '파이썬 입문', price: 18000, isbn: null, author: { id: 1, name: '홍길동' }, cover_url: null };

function json(route, body, status = 200) {
  return route.fulfill({
    status,
    contentType: 'application/json',
    headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': '*' },
    body: JSON.stringify(body),
  });
}

export async function mockApi(page) {
  await page.route(`${API}/**`, (route) => {
    const request = route.request();
    const { pathname } = new URL(request.url());
    if (request.method() === 'OPTIONS') return json(route, {}); // 사전 요청 허락
    if (pathname === '/authors') return json(route, [book.author]);
    if (pathname === '/books') return json(route, { items: [book], total: 1, skip: 0, limit: 10 });
    if (pathname === '/books/1') return json(route, book);
    if (pathname === '/auth/token') {
      return json(route, { access_token: 'access-1', refresh_token: 'refresh-1', token_type: 'bearer' });
    }
    if (pathname === '/auth/me') return json(route, { id: 7, email: 'reader@example.com', role: 'user' });
    return json(route, { code: 'NOT_FOUND', message: '없음' }, 404);
  });
}
