import { api } from './client';

// GET /books?q=&author=&sort=&skip=&limit=  ->  { items, total, skip, limit }
export async function listBooks({ q, author, sort = 'id', skip = 0, limit = 10 } = {}, signal) {
  const params = { sort, skip, limit };
  if (q) params.q = q;
  if (author) params.author = author;
  const { data } = await api.get('/books', { params, signal });
  return data;
}

export async function getBook(bookId, signal) {
  const { data } = await api.get(`/books/${bookId}`, { signal });
  return data;
}

// 본문: { title, author_id, price, isbn }
export async function createBook(payload) {
  const { data } = await api.post('/books', payload);
  return data;
}

// 본문: 바꿀 필드만 보냅니다 (PATCH)
export async function updateBook(bookId, changes) {
  const { data } = await api.patch(`/books/${bookId}`, changes);
  return data;
}

export async function deleteBook(bookId) {
  await api.delete(`/books/${bookId}`); // 성공 시 204, 본문 없음
}

// multipart/form-data, 필드 이름 file
export async function uploadCover(bookId, file) {
  const form = new FormData();
  form.append('file', file);
  const { data } = await api.post(`/books/${bookId}/cover`, form);
  return data;
}
