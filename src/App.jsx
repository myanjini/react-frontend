import BookTable from './practice/BookTable';
import { SAMPLE_PAGE } from './practice/sampleBooks';

export default function App() {
  return (
    <main>
      <h1>도서 목록</h1>
      <BookTable books={SAMPLE_PAGE.items} />
      <p>전체 {SAMPLE_PAGE.total}권</p>
    </main>
  );
}
