import { useState } from 'react';
import BookTable from './practice/BookTable';
import SearchBox from './practice/SearchBox';
import { SAMPLE_PAGE } from './practice/sampleBooks';

const SORTERS = {
  id: (a, b) => a.id - b.id,
  price: (a, b) => a.price - b.price,
  '-price': (a, b) => b.price - a.price,
};

export default function App() {
  const [keyword, setKeyword] = useState('');
  const [sort, setSort] = useState('id');

  // filter는 새 배열을 돌려주므로 sort로 정렬해도 원본 데이터가 바뀌지 않습니다.
  const visible = SAMPLE_PAGE.items
    .filter((book) => book.title.includes(keyword.trim()))
    .sort(SORTERS[sort]);

  return (
    <main>
      <h1>도서 목록</h1>
      <SearchBox keyword={keyword} onChange={setKeyword} />
      <select value={sort} onChange={(e) => setSort(e.target.value)}>
        <option value="id">등록순</option>
        <option value="price">가격 낮은 순</option>
        <option value="-price">가격 높은 순</option>
      </select>
      {visible.length === 0 ? <p>조건에 맞는 도서가 없습니다.</p> : <BookTable books={visible} />}
      <p>
        전체 {SAMPLE_PAGE.total}권 중 {visible.length}권 표시
      </p>
    </main>
  );
}
