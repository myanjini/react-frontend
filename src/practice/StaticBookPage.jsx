import { useEffect, useState } from 'react';
import AddBookForm from './AddBookForm';
import BookTable from './BookTable';
import BookToolbar from './BookToolbar';
import { loadSampleBooks } from './sampleBooks';

const SORTERS = {
  id: (a, b) => a.id - b.id,
  price: (a, b) => a.price - b.price,
  '-price': (a, b) => b.price - a.price,
};

export default function StaticBookPage() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  // 처음 그린 뒤 한 번 데이터를 불러옵니다.
  useEffect(() => {
    let ignore = false;
    loadSampleBooks().then((items) => {
      if (!ignore) {
        setBooks(items);
        setLoading(false);
      }
    });
    // 정리 함수: 화면이 사라지면 늦게 도착한 결과를 무시합니다.
    return () => {
      ignore = true;
    };
  }, []);

  // books가 바뀔 때마다 브라우저 탭 제목을 맞춥니다.
  useEffect(() => {
    document.title = `도서 관리 (${books.length}권)`;
  }, [books.length]);
  const [keyword, setKeyword] = useState('');
  const [sort, setSort] = useState('id');

  // 자식(BookRow)에서 일어난 삭제를 부모가 처리합니다. 상태는 가진 쪽에서만 바꿉니다.
  function handleDelete(bookId) {
    setBooks((prev) => prev.filter((b) => b.id !== bookId));
  }

  function handleAdd(book) {
    // 기존 배열을 고치지 않고 새 배열로 바꿔 끼웁니다.
    const nextId = Math.max(0, ...books.map((b) => b.id)) + 1;
    setBooks((prev) => [...prev, { ...book, id: nextId, isbn: null }]);
  }

  // filter는 새 배열을 돌려주므로 sort로 정렬해도 원본 데이터가 바뀌지 않습니다.
  const visible = books
    .filter((book) => book.title.includes(keyword.trim()))
    .sort(SORTERS[sort]);

  return (
    <main>
      <h1>도서 목록</h1>
      <AddBookForm onAdd={handleAdd} />
      <BookToolbar keyword={keyword} onKeywordChange={setKeyword} sort={sort} onSortChange={setSort} />
      {loading && <p>불러오는 중입니다.</p>}
      {!loading && (visible.length === 0 ? <p>조건에 맞는 도서가 없습니다.</p> : <BookTable books={visible} onDelete={handleDelete} />)}
      <p>
        전체 {books.length}권 중 {visible.length}권 표시
      </p>
    </main>
  );
}
