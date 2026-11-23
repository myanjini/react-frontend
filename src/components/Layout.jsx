import { NavLink, Outlet } from 'react-router';

export default function Layout() {
  return (
    <div className="app">
      <header className="topbar">
        <strong>도서 관리</strong>
        <nav>
          <NavLink to="/" end>도서 목록</NavLink>
        </nav>
      </header>
      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}
