import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { useQueryClient } from '@tanstack/react-query';
import { createAuthor, listAuthors } from '../api/authors';
import { useAuth } from '../auth/useAuth';
import { createBook, getBook, updateBook } from '../api/books';
import ErrorMessage from '../components/ErrorMessage';
import { EMPTY_FORM, diff, toPayload, validate } from './bookForm';

export default function BookFormPage() {
  const { bookId } = useParams(); // 있으면 수정, 없으면 등록
  const isEdit = Boolean(bookId);
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const queryClient = useQueryClient();
  const [newAuthor, setNewAuthor] = useState('');
  const [authorError, setAuthorError] = useState(null);

  const [authors, setAuthors] = useState([]);
  const [original, setOriginal] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    const tasks = [listAuthors({}, controller.signal).then(setAuthors)];
    if (isEdit) {
      tasks.push(
        getBook(bookId, controller.signal).then((book) => {
          setOriginal(book);
          setForm({
            title: book.title,
            author_id: String(book.author?.id ?? ''),
            price: String(book.price),
            isbn: book.isbn ?? '',
          });
        }),
      );
    }
    Promise.all(tasks).catch((err) => {
      if (err.name !== 'CanceledError') setError(err);
    });
    return () => controller.abort();
  }, [bookId, isEdit]);

  // 관리자만 저자를 등록할 수 있습니다(일반 사용자는 백엔드가 403으로 거절).
  async function handleAddAuthor() {
    const name = newAuthor.trim();
    if (!name) return;
    setAuthorError(null);
    try {
      const author = await createAuthor(name);
      setAuthors((prev) => [...prev, author]);
      queryClient.invalidateQueries({ queryKey: ['authors'] }); // 목록 화면의 저자 선택 상자도 갱신
      setForm((prev) => ({ ...prev, author_id: String(author.id) })); // 새 저자를 바로 선택
      setNewAuthor('');
    } catch (err) {
      setAuthorError(err.status === 409 ? { message: '이미 등록된 저자입니다.' } : err);
    }
  }

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const errors = validate(form);
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setSaving(true);
    setError(null);
    try {
      const payload = toPayload(form);
      const saved = isEdit ? await updateBook(bookId, diff(original, payload)) : await createBook(payload);
      // 목록과 상세 캐시를 낡은 것으로 표시해 다음에 볼 때 새로 불러오게 합니다.
      queryClient.invalidateQueries({ queryKey: ['books'] });
      navigate(`/books/${saved.id}`);
    } catch (err) {
      setError(err);
      setFieldErrors(err.fields ?? {}); // 422 응답의 칸별 메시지
    } finally {
      setSaving(false);
    }
  }

  return (
    <section>
      <h1>{isEdit ? '도서 수정' : '도서 등록'}</h1>
      <form className="form" onSubmit={handleSubmit} noValidate>
        <label>
          제목
          <input name="title" value={form.title} onChange={handleChange} maxLength={100} />
          {fieldErrors.title && <small className="error">{fieldErrors.title}</small>}
        </label>
        <label>
          저자
          <select name="author_id" value={form.author_id} onChange={handleChange}>
            <option value="">저자를 고르세요</option>
            {authors.map((author) => (
              <option key={author.id} value={author.id}>
                {author.name}
              </option>
            ))}
          </select>
          {fieldErrors.author_id && <small className="error">{fieldErrors.author_id}</small>}
        </label>
        {isAdmin && (
          <div className="toolbar">
            <input placeholder="목록에 없는 저자 이름" value={newAuthor} onChange={(e) => setNewAuthor(e.target.value)} />
            <button type="button" onClick={handleAddAuthor}>
              저자 추가
            </button>
            <ErrorMessage error={authorError} />
          </div>
        )}
        <label>
          가격(원)
          <input name="price" type="number" min="0" max="1000000" value={form.price} onChange={handleChange} />
          {fieldErrors.price && <small className="error">{fieldErrors.price}</small>}
        </label>
        <label>
          ISBN (선택)
          <input name="isbn" inputMode="numeric" value={form.isbn} onChange={handleChange} maxLength={13} />
          {fieldErrors.isbn && <small className="error">{fieldErrors.isbn}</small>}
        </label>
        <ErrorMessage error={error} />
        <button type="submit" disabled={saving}>
          {saving ? '저장 중' : '저장'}
        </button>
      </form>
    </section>
  );
}
