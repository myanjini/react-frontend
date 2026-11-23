import { api } from './client';

export async function borrowBook(bookId) {
  const { data } = await api.post('/loans', { book_id: bookId });
  return data;
}

export async function returnLoan(loanId) {
  const { data } = await api.post(`/loans/${loanId}/return`);
  return data;
}

export async function listMyLoans(signal) {
  const { data } = await api.get('/loans/me', { signal });
  return data;
}
