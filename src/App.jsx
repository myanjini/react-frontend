import { Route, Routes } from 'react-router';
import RequireAuth from './auth/RequireAuth';
import Layout from './components/Layout';
import DashboardPage from './dashboard/DashboardPage';
import BookDetailPage from './pages/BookDetailPage';
import BookFormPage from './pages/BookFormPage';
import BookListPage from './pages/BookListPage';
import LoginPage from './pages/LoginPage';
import MyLoansPage from './pages/MyLoansPage';
import NotFoundPage from './pages/NotFoundPage';
import SignupPage from './pages/SignupPage';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<BookListPage />} />
        <Route path="books/:bookId" element={<BookDetailPage />} />
        <Route path="books/new" element={<RequireAuth><BookFormPage /></RequireAuth>} />
        <Route path="books/:bookId/edit" element={<RequireAuth><BookFormPage /></RequireAuth>} />
        <Route path="loans" element={<RequireAuth><MyLoansPage /></RequireAuth>} />
        <Route path="dashboard" element={<RequireAuth adminOnly><DashboardPage /></RequireAuth>} />
        <Route path="login" element={<LoginPage />} />
        <Route path="signup" element={<SignupPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
