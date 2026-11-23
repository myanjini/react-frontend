import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';
import { API, server } from '../test/server';
import { renderWithProviders } from '../test/renderWithProviders';
import BookListPage from './BookListPage';

describe('BookListPage', () => {
  it('첫 페이지 10권과 전체 권수를 보여 준다', async () => {
    renderWithProviders(<BookListPage />);
    expect(await screen.findByText('파이썬 입문 1')).toBeInTheDocument();
    const rows = within(screen.getByRole('table')).getAllByRole('row');
    expect(rows).toHaveLength(11); // 머리글 1행 + 도서 10행
    expect(screen.getByText('1 / 3 페이지 (전체 23권)')).toBeInTheDocument();
  });

  it('검색하면 조건에 맞는 도서만 보여 준다', async () => {
    renderWithProviders(<BookListPage />);
    await screen.findByText('파이썬 입문 1');
    await userEvent.type(screen.getByPlaceholderText('제목으로 검색'), 'FastAPI');
    await userEvent.click(screen.getByRole('button', { name: '검색' }));
    expect(await screen.findByText('1 / 2 페이지 (전체 11권)')).toBeInTheDocument();
    expect(screen.queryByText('파이썬 입문 1')).not.toBeInTheDocument();
  });

  it('URL의 조건으로 시작한다', async () => {
    renderWithProviders(<BookListPage />, { route: '/?skip=20' });
    expect(await screen.findByText('3 / 3 페이지 (전체 23권)')).toBeInTheDocument();
  });

  it('서버 오류를 사용자에게 알린다', async () => {
    // 이 테스트에서만 /books가 500을 돌려주게 바꿉니다.
    server.use(http.get(`${API}/books`, () => HttpResponse.json({ code: 'INTERNAL', message: '서버 오류' }, { status: 500 })));
    renderWithProviders(<BookListPage />);
    expect(await screen.findByRole('alert')).toHaveTextContent('서버 오류');
  });
});
