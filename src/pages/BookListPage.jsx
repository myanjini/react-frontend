import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { listBooks } from '../api/books';
import ErrorMessage from '../components/ErrorMessage';

// P22 첫 버전: 첫 페이지 10권만 보여 줍니다. 검색과 페이지 이동은 P23에서 추가합니다.
export default function BookListPage() {
  const [page, setPage] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    listBooks({ limit: 10 }, controller.signal)
      .then(setPage)
      .catch((err) => {
        if (err.name !== 'CanceledError') setError(err);
      });
    return () => controller.abort();
  }, []);

  if (error) return <ErrorMessage error={error} />;
  if (!page) return <p className="muted">불러오는 중입니다.</p>;

  return (
    <section>
      <h1>도서 목록</h1>
      <table className="table">
        <thead>
          <tr>
            <th>번호</th>
            <th>제목</th>
            <th>저자</th>
            <th className="num">가격</th>
          </tr>
        </thead>
        <tbody>
          {page.items.map((book) => (
            <tr key={book.id}>
              <td>{book.id}</td>
              <td>
                <Link to={`/books/${book.id}`}>{book.title}</Link>
              </td>
              <td>{book.author?.name}</td>
              <td className="num">{book.price.toLocaleString('ko-KR')}원</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="muted">전체 {page.total}권</p>
    </section>
  );
}
