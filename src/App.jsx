import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router';
import RequireAuth from './auth/RequireAuth';
import Layout from './components/Layout';
import BookDetailPage from './pages/BookDetailPage';
import BookFormPage from './pages/BookFormPage';
import BookListPage from './pages/BookListPage';
import LoginPage from './pages/LoginPage';
import MyLoansPage from './pages/MyLoansPage';
import NotFoundPage from './pages/NotFoundPage';
import SignupPage from './pages/SignupPage';

// 차트 라이브러리가 큰 대시보드는 처음 열 때만 따로 내려받습니다.
const DashboardPage = lazy(() => import('./dashboard/DashboardPage'));

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<BookListPage />} />
        <Route path="books/:bookId" element={<BookDetailPage />} />
        <Route path="books/new" element={<RequireAuth><BookFormPage /></RequireAuth>} />
        <Route path="books/:bookId/edit" element={<RequireAuth><BookFormPage /></RequireAuth>} />
        <Route path="loans" element={<RequireAuth><MyLoansPage /></RequireAuth>} />
        <Route
          path="dashboard"
          element={
            <RequireAuth adminOnly>
              <Suspense fallback={<p className="muted">대시보드를 불러오는 중입니다.</p>}>
                <DashboardPage />
              </Suspense>
            </RequireAuth>
          }
        />
        <Route path="login" element={<LoginPage />} />
        <Route path="signup" element={<SignupPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
