import { useState } from 'react';
import { useNavigate } from 'react-router';
import { signup } from '../api/auth';
import ErrorMessage from '../components/ErrorMessage';

export default function SignupPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '', confirm: '' });
  const [error, setError] = useState(null);

  function handleChange(event) {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (form.password !== form.confirm) {
      setError({ message: '비밀번호 확인이 일치하지 않습니다.' });
      return;
    }
    try {
      await signup(form.email.trim(), form.password);
      navigate('/login', { replace: true });
    } catch (err) {
      setError(err.status === 409 ? { message: '이미 가입된 이메일입니다.' } : err);
    }
  }

  return (
    <section className="narrow">
      <h1>회원가입</h1>
      <form className="form" onSubmit={handleSubmit}>
        <label>
          이메일
          <input name="email" type="email" autoComplete="email" value={form.email} onChange={handleChange} required />
        </label>
        <label>
          비밀번호
          <input name="password" type="password" autoComplete="new-password" value={form.password} onChange={handleChange} required />
        </label>
        <label>
          비밀번호 확인
          <input name="confirm" type="password" autoComplete="new-password" value={form.confirm} onChange={handleChange} required />
        </label>
        <ErrorMessage error={error} />
        <button type="submit">가입하기</button>
      </form>
    </section>
  );
}
