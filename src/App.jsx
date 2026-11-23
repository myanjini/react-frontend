import { useState } from 'react';
import AddBookForm from './practice/AddBookForm';
import BookTable from './practice/BookTable';
import SearchBox from './practice/SearchBox';
import { SAMPLE_PAGE } from './practice/sampleBooks';

const SORTERS = {
  id: (a, b) => a.id - b.id,
  price: (a, b) => a.price - b.price,
  '-price': (a, b) => b.price - a.price,
};

export default function App() {
  const [books, setBooks] = useState(SAMPLE_PAGE.items);
  const [keyword, setKeyword] = useState('');
  const [sort, setSort] = useState('id');

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
      <SearchBox keyword={keyword} onChange={setKeyword} />
      <select value={sort} onChange={(e) => setSort(e.target.value)}>
        <option value="id">등록순</option>
        <option value="price">가격 낮은 순</option>
        <option value="-price">가격 높은 순</option>
      </select>
      {visible.length === 0 ? <p>조건에 맞는 도서가 없습니다.</p> : <BookTable books={visible} />}
      <p>
        전체 {books.length}권 중 {visible.length}권 표시
      </p>
    </main>
  );
}
