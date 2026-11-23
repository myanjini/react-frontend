import { api } from './client';

export async function signup(email, password) {
  const { data } = await api.post('/auth/signup', { email, password });
  return data;
}

// OAuth2 Password Flow: JSON이 아니라 폼 형식으로 보내야 합니다.
export async function login(email, password) {
  const form = new URLSearchParams();
  form.append('username', email); // 이 백엔드는 username 칸에 이메일을 받습니다.
  form.append('password', password);
  const { data } = await api.post('/auth/token', form);
  return data; // { access_token, refresh_token, token_type }
}

export async function fetchMe() {
  const { data } = await api.get('/auth/me');
  return data; // { id, email, role }
}

export async function logout(refreshToken) {
  await api.post('/auth/logout', { refresh_token: refreshToken });
}
