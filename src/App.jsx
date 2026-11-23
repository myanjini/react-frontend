import { useState } from 'react';
import BookTable from './practice/BookTable';
import SearchBox from './practice/SearchBox';
import { SAMPLE_PAGE } from './practice/sampleBooks';

export default function App() {
  // 입력한 검색어를 state로 기억합니다. 값이 바뀌면 App이 다시 그려집니다.
  const [keyword, setKeyword] = useState('');
  const visible = SAMPLE_PAGE.items.filter((book) => book.title.includes(keyword.trim()));

  return (
    <main>
      <h1>도서 목록</h1>
      <SearchBox keyword={keyword} onChange={setKeyword} />
      <BookTable books={visible} />
      <p>
        전체 {SAMPLE_PAGE.total}권 중 {visible.length}권 표시
      </p>
    </main>
  );
}
