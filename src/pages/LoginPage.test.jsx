import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { describe, expect, it, vi } from 'vitest';
import { ApiError } from '../api/errors';
import { AuthContext } from '../auth/useAuth';
import LoginPage from './LoginPage';

// 실제 AuthProvider 대신 원하는 login 함수를 넣은 Context로 감싸서 화면만 시험합니다.
function renderLogin(login) {
  return render(
    <MemoryRouter>
      <AuthContext.Provider value={{ login, user: null, isAdmin: false, initializing: false }}>
        <LoginPage />
      </AuthContext.Provider>
    </MemoryRouter>,
  );
}

async function submit(email, password) {
  await userEvent.type(screen.getByLabelText('이메일'), email);
  await userEvent.type(screen.getByLabelText('비밀번호'), password);
  await userEvent.click(screen.getByRole('button', { name: '로그인' }));
}

describe('LoginPage', () => {
  it('입력한 이메일과 비밀번호로 login을 호출한다', async () => {
    const login = vi.fn().mockResolvedValue({ id: 1 });
    renderLogin(login);
    await submit(' reader@example.com ', 'secret-1234');
    expect(login).toHaveBeenCalledWith('reader@example.com', 'secret-1234');
  });

  it('401이면 어느 칸이 틀렸는지 알려 주지 않는 메시지를 보여 주고 비밀번호를 지운다', async () => {
    const login = vi.fn().mockRejectedValue(new ApiError({ status: 401, code: 'INVALID_CREDENTIALS', message: 'x' }));
    renderLogin(login);
    await submit('reader@example.com', 'wrong');
    expect(await screen.findByRole('alert')).toHaveTextContent('이메일 또는 비밀번호가 올바르지 않습니다.');
    expect(screen.getByLabelText('비밀번호')).toHaveValue('');
  });

  it('429이면 Retry-After로 잠금 시간을 안내한다', async () => {
    const error = new ApiError({ status: 429, code: 'TOO_MANY_ATTEMPTS', message: 'x', retryAfter: 600 });
    renderLogin(vi.fn().mockRejectedValue(error));
    await submit('reader@example.com', 'wrong');
    expect(await screen.findByRole('alert')).toHaveTextContent('약 10분 뒤에');
  });
});
