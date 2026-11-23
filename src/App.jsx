import { Route, Routes } from 'react-router';
import Layout from './components/Layout';
import BookDetailPage from './pages/BookDetailPage';
import BookListPage from './pages/BookListPage';
import NotFoundPage from './pages/NotFoundPage';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<BookListPage />} />
        <Route path="books/:bookId" element={<BookDetailPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
