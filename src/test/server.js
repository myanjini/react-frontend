import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

export const API = 'http://api.test'; // .env.test의 VITE_API_BASE_URL

export const authors = [
  { id: 1, name: '홍길동' },
  { id: 2, name: '김철수' },
];

export const books = Array.from({ length: 23 }, (_, i) => ({
  id: i + 1,
  title: i % 2 ? `FastAPI 실전 ${i + 1}` : `파이썬 입문 ${i + 1}`,
  price: 10000 + i * 1000,
  isbn: null,
  author: authors[i % 2],
  cover_url: null,
}));

// 백엔드 대신 응답할 가짜 API입니다. 요청 형식은 실제 백엔드와 같게 맞춥니다.
export const handlers = [
  http.get(`${API}/authors`, () => HttpResponse.json(authors)),
  http.get(`${API}/books`, ({ request }) => {
    const url = new URL(request.url);
    const q = url.searchParams.get('q') ?? '';
    const skip = Number(url.searchParams.get('skip') ?? 0);
    const limit = Number(url.searchParams.get('limit') ?? 10);
    const items = books.filter((b) => b.title.includes(q));
    return HttpResponse.json({ items: items.slice(skip, skip + limit), total: items.length, skip, limit });
  }),
];

export const server = setupServer(...handlers);
