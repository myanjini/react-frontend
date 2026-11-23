import { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { getBook } from '../api/books';
import { toAssetUrl } from '../api/client';
import ErrorMessage from '../components/ErrorMessage';

export default function BookDetailPage() {
  const { bookId } = useParams(); // 주소의 :bookId 값 (문자열)
  const [book, setBook] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    getBook(bookId, controller.signal)
      .then(setBook)
      .catch((err) => {
        if (err.name !== 'CanceledError') setError(err);
      });
    return () => controller.abort();
  }, [bookId]);

  if (error) return <ErrorMessage error={error} />;
  if (!book) return <p className="muted">불러오는 중입니다.</p>;

  return (
    <section className="detail">
      <div className="cover">
        {book.cover_url ? (
          <img src={toAssetUrl(book.cover_url)} alt={`${book.title} 표지`} />
        ) : (
          <div className="cover-empty">표지 없음</div>
        )}
      </div>
      <div>
        <h1>{book.title}</h1>
        <dl className="meta">
          <dt>저자</dt>
          <dd>{book.author?.name}</dd>
          <dt>가격</dt>
          <dd>{book.price.toLocaleString('ko-KR')}원</dd>
          <dt>ISBN</dt>
          <dd>{book.isbn ?? '-'}</dd>
        </dl>
      </div>
    </section>
  );
}
