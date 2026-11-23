import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import { listAuthors } from '../api/authors';
import { listBooks } from '../api/books';
import ErrorMessage from '../components/ErrorMessage';
import Pagination from '../components/Pagination';

const PAGE_SIZE = 10;
const SORT_OPTIONS = [
  { value: 'id', label: '등록순' },
  { value: 'price', label: '가격 낮은 순' },
  { value: '-price', label: '가격 높은 순' },
];

export default function BookListPage() {
  // 검색 조건을 URL에 두면 새로고침, 뒤로 가기, 주소 공유에도 화면이 유지됩니다.
  const [searchParams, setSearchParams] = useSearchParams();
  const sort = searchParams.get('sort') ?? 'id';
  const skip = Number(searchParams.get('skip') ?? 0);
  const author = searchParams.get('author') ?? '';

  const q = searchParams.get('q') ?? '';
  const [keyword, setKeyword] = useState(q);

  const [authors, setAuthors] = useState([]);
  const [page, setPage] = useState(null); // { items, total, skip, limit }
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  function updateParams(changes) {
    const next = new URLSearchParams(searchParams);
    for (const [key, value] of Object.entries(changes)) {
      if (value === '' || value === null || value === undefined) next.delete(key);
      else next.set(key, String(value));
    }
    setSearchParams(next);
  }

  // 검색 버튼(또는 Enter)을 누르면 URL에 반영하고 첫 페이지부터 다시 봅니다.
  function handleSearch(event) {
    event.preventDefault();
    updateParams({ q: keyword.trim(), skip: '' });
  }

  // 저자 선택 상자에 쓸 목록은 처음 한 번만 불러옵니다.
  useEffect(() => {
    const controller = new AbortController();
    listAuthors({}, controller.signal)
      .then(setAuthors)
      .catch(() => {}); // 저자 목록이 없어도 목록 화면은 쓸 수 있으므로 조용히 넘어갑니다.
    return () => controller.abort();
  }, []);

  // URL의 검색 조건이 바뀔 때마다 목록을 다시 불러옵니다.
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    listBooks({ q, author, sort, skip, limit: PAGE_SIZE }, controller.signal)
      .then(setPage)
      .catch((err) => {
        if (err.name !== 'CanceledError') setError(err);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    // 조건이 바뀌거나 화면을 떠나면 이전 요청을 취소합니다.
    return () => controller.abort();
  }, [q, author, sort, skip]);

  return (
    <section>
      <h1>도서 목록</h1>
      <form className="toolbar" onSubmit={handleSearch}>
        <input
          type="search"
          placeholder="제목으로 검색"
          maxLength={50}
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />
        <button type="submit">검색</button>
        <select value={author} onChange={(e) => updateParams({ author: e.target.value, skip: '' })}>
          <option value="">모든 저자</option>
          {authors.map((a) => (
            <option key={a.id} value={a.name}>
              {a.name}
            </option>
          ))}
        </select>
        <select value={sort} onChange={(e) => updateParams({ sort: e.target.value, skip: '' })}>
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </form>

      <ErrorMessage error={error} />
      {loading && <p className="muted">불러오는 중입니다.</p>}

      {page && !loading && page.items.length === 0 && <p>조건에 맞는 도서가 없습니다.</p>}
      {page && page.items.length > 0 && (
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
      )}
      {page && (
        <Pagination
          total={page.total}
          skip={page.skip}
          limit={page.limit}
          onChange={(nextSkip) => updateParams({ skip: nextSkip })}
        />
      )}
    </section>
  );
}
