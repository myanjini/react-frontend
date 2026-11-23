import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { deleteBook, getBook, uploadCover } from '../api/books';
import { toAssetUrl } from '../api/client';
import { borrowBook } from '../api/loans';
import { useAuth } from '../auth/useAuth';
import ErrorMessage from '../components/ErrorMessage';
import { precheckCover } from '../utils/cover';

export default function BookDetailPage() {
  const { bookId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const detailKey = ['books', 'detail', bookId];
  const [notice, setNotice] = useState('');
  const [localError, setLocalError] = useState(null);

  const { data: book, error: loadError } = useQuery({
    queryKey: detailKey,
    queryFn: ({ signal }) => getBook(bookId, signal),
  });

  // 서버 데이터를 바꾸는 요청은 useMutation으로 다룹니다.
  const borrow = useMutation({
    mutationFn: () => borrowBook(book.id),
    onSuccess: () => {
      setNotice('대여했습니다. 내 대여 화면에서 확인할 수 있습니다.');
      queryClient.invalidateQueries({ queryKey: ['loans'] }); // 내 대여 목록 캐시를 낡은 것으로 표시
    },
  });
  const remove = useMutation({
    mutationFn: () => deleteBook(book.id),
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: detailKey });
      queryClient.invalidateQueries({ queryKey: ['books', 'list'] });
      navigate('/', { replace: true });
    },
  });
  const cover = useMutation({
    mutationFn: (file) => uploadCover(book.id, file),
    onSuccess: (updated) => {
      queryClient.setQueryData(detailKey, updated); // 응답으로 받은 최신 정보를 바로 캐시에
      setNotice('표지를 바꿨습니다.');
    },
  });

  const busy = borrow.isPending || remove.isPending || cover.isPending;
  const error = localError ?? borrow.error ?? remove.error ?? cover.error;

  function start(mutation, variables) {
    setNotice('');
    setLocalError(null);
    [borrow, remove, cover].forEach((m) => m.reset()); // 이전 오류 메시지를 지웁니다.
    mutation.mutate(variables);
  }

  function handleDelete() {
    if (!window.confirm(`"${book.title}" 도서를 삭제할까요? 되돌릴 수 없습니다.`)) return;
    start(remove);
  }

  function handleCoverChange(event) {
    const file = event.target.files?.[0];
    event.target.value = ''; // 같은 파일을 다시 고를 수 있게 비웁니다.
    if (!file) return;
    const problem = precheckCover(file);
    if (problem) {
      setLocalError({ message: problem });
      return;
    }
    start(cover, file);
  }

  if (loadError) return <ErrorMessage error={loadError} />;
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
            <button onClick={() => start(borrow)} disabled={busy}>대여하기</button>
            <Link className="button" to={`/books/${book.id}/edit`}>수정</Link>
            <label className="button">
              표지 올리기
              <input type="file" accept=".jpg,.jpeg,.png" hidden onChange={handleCoverChange} />
            </label>
            <button className="danger" onClick={handleDelete} disabled={busy}>삭제</button>
          </div>
        ) : (
          <p className="muted">대여와 수정은 로그인 후 사용할 수 있습니다.</p>
        )}
      </div>
    </section>
  );
}
