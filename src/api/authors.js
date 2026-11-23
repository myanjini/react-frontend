import { api } from './client';

export async function listAuthors({ skip = 0, limit = 100 } = {}, signal) {
  const { data } = await api.get('/authors', { params: { skip, limit }, signal });
  return data;
}

export async function createAuthor(name) {
  const { data } = await api.post('/authors', { name });
  return data;
}
