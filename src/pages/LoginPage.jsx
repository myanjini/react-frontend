import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { useAuth } from '../auth/useAuth';
import ErrorMessage from '../components/ErrorMessage';

// 로그인 뒤 돌아갈 주소는 앱 내부 경로만 허용합니다 (열린 리디렉션 방지).
function safeRedirect(path) {
  return typeof path === 'string' && path.startsWith('/') && !path.startsWith('//') ? path : '/';
}

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await login(email.trim(), password);
      navigate(safeRedirect(location.state?.from), { replace: true });
    } catch (err) {
      if (err.status === 401) {
        // 이메일과 비밀번호 중 무엇이 틀렸는지 알려 주지 않습니다.
        setError({ message: '이메일 또는 비밀번호가 올바르지 않습니다.' });
      } else if (err.status === 429) {
        const minutes = err.retryAfter ? Math.ceil(err.retryAfter / 60) : 15;
        setError({ message: `로그인 시도가 너무 많습니다. 약 ${minutes}분 뒤에 다시 시도해 주세요.` });
      } else {
        setError(err);
      }
    } finally {
      setPassword(''); // 실패하든 성공하든 비밀번호 입력값은 지웁니다.
      setSubmitting(false);
    }
  }

  return (
    <section className="narrow">
      <h1>로그인</h1>
      <form className="form" onSubmit={handleSubmit}>
        <label>
          이메일
          <input type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <label>
          비밀번호
          <input
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>
        <ErrorMessage error={error} />
        <button type="submit" disabled={submitting}>로그인</button>
      </form>
      <p className="muted">
        계정이 없다면 <Link to="/signup">회원가입</Link>을 먼저 합니다.
      </p>
    </section>
  );
}
