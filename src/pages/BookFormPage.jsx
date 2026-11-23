import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { createAuthor, listAuthors } from '../api/authors';
import { useAuth } from '../auth/useAuth';
import { createBook, getBook, updateBook } from '../api/books';
import ErrorMessage from '../components/ErrorMessage';

const EMPTY_FORM = { title: '', author_id: '', price: '', isbn: '' };

// 화면 입력값(문자열)을 API 본문(JSON)으로 바꿉니다.
function toPayload(form) {
  return {
    title: form.title.trim(),
    author_id: Number(form.author_id),
    price: Number(form.price),
    isbn: form.isbn.trim() === '' ? null : form.isbn.trim(),
  };
}

// 수정할 때는 바뀐 필드만 보냅니다 (PATCH).
function diff(original, payload) {
  const changes = {};
  if (payload.title !== original.title) changes.title = payload.title;
  if (payload.author_id !== original.author?.id) changes.author_id = payload.author_id;
  if (payload.price !== original.price) changes.price = payload.price;
  if (payload.isbn !== (original.isbn ?? null)) changes.isbn = payload.isbn;
  return changes;
}

// 백엔드 규칙과 같은 기준으로 먼저 확인해 사용자에게 빠르게 알려 줍니다.
function validate(form) {
  const errors = {};
  const title = form.title.trim();
  if (title.length < 1 || title.length > 100) errors.title = '제목은 1~100자로 입력합니다.';
  if (!form.author_id) errors.author_id = '저자를 고릅니다.';
  const price = Number(form.price);
  if (form.price === '' || !Number.isInteger(price) || price < 0 || price > 1_000_000)
    errors.price = '가격은 0~1,000,000 사이의 정수입니다.';
  if (form.isbn.trim() && !/^\d{13}$/.test(form.isbn.trim())) errors.isbn = 'ISBN은 숫자 13자리입니다.';
  return errors;
}

export default function BookFormPage() {
  const { bookId } = useParams(); // 있으면 수정, 없으면 등록
  const isEdit = Boolean(bookId);
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
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
