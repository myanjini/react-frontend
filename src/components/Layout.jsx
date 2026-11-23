import { NavLink, Outlet, useNavigate } from 'react-router';
import { useAuth } from '../auth/useAuth';

export default function Layout() {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate('/');
  }

  return (
    <div className="app">
      <header className="topbar">
        <strong>도서 관리</strong>
        <nav>
          <NavLink to="/" end>도서 목록</NavLink>
          {user && <NavLink to="/books/new">도서 등록</NavLink>}
          {user && <NavLink to="/loans">내 대여</NavLink>}
          {isAdmin && <NavLink to="/dashboard">관제 대시보드</NavLink>}
        </nav>
        <div className="account">
          {user ? (
            <>
              <span>{user.email} ({user.role})</span>
              <button onClick={handleLogout}>로그아웃</button>
            </>
          ) : (
            <>
              <NavLink to="/login">로그인</NavLink>
              <NavLink to="/signup">회원가입</NavLink>
            </>
          )}
        </div>
      </header>
      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}
