import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { deleteBook, getBook, uploadCover } from '../api/books';
import { toAssetUrl } from '../api/client';
import { useAuth } from '../auth/useAuth';
import ErrorMessage from '../components/ErrorMessage';

const ALLOWED_EXT = ['.jpg', '.jpeg', '.png'];
const MAX_BYTES = 2 * 1024 * 1024;

// 업로드 전에 브라우저에서 미리 확인합니다. 사용자 편의를 위한 검사이며
// 최종 판단(415, 413, 422)은 백엔드가 합니다.
function precheckCover(file) {
  const name = file.name.toLowerCase();
  if (!ALLOWED_EXT.some((ext) => name.endsWith(ext))) return 'jpg, jpeg, png 파일만 올릴 수 있습니다.';
  if (file.size === 0) return '빈 파일입니다.';
  if (file.size > MAX_BYTES) return '2MB 이하 파일만 올릴 수 있습니다.';
  return null;
}

export default function BookDetailPage() {
  const { bookId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [book, setBook] = useState(null);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    getBook(bookId, controller.signal)
      .then(setBook)
      .catch((err) => {
        if (err.name !== 'CanceledError') setError(err);
      });
    return () => controller.abort();
  }, [bookId]);

  async function run(action, successMessage) {
    setBusy(true);
    setError(null);
    setNotice('');
    try {
      await action();
      if (successMessage) setNotice(successMessage);
    } catch (err) {
      setError(err);
    } finally {
      setBusy(false);
    }
  }

  function handleDelete() {
    if (!window.confirm(`"${book.title}" 도서를 삭제할까요? 되돌릴 수 없습니다.`)) return;
    run(async () => {
      await deleteBook(book.id);
      navigate('/', { replace: true });
    });
  }

  function handleCoverChange(event) {
    const file = event.target.files?.[0];
    event.target.value = ''; // 같은 파일을 다시 고를 수 있게 비웁니다.
    if (!file) return;
    const problem = precheckCover(file);
    if (problem) {
      setError({ message: problem });
      return;
    }
    run(async () => setBook(await uploadCover(book.id, file)), '표지를 바꿨습니다.');
  }

  if (error && !book) return <ErrorMessage error={error} />;
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

        <ErrorMessage error={error} />
        {notice && <p className="notice">{notice}</p>}

        {user ? (
          <div className="actions">
            <Link className="button" to={`/books/${book.id}/edit`}>수정</Link>
            <label className="button">
              표지 올리기
              <input type="file" accept=".jpg,.jpeg,.png" hidden onChange={handleCoverChange} />
            </label>
            <button className="danger" onClick={handleDelete} disabled={busy}>삭제</button>
          </div>
        ) : (
          <p className="muted">수정은 로그인 후 사용할 수 있습니다.</p>
        )}
      </div>
    </section>
  );
}
