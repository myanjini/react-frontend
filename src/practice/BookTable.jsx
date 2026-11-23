import BookRow from './BookRow';

export default function BookTable({ books, onDelete }) {
  return (
    <table>
      <thead>
        <tr>
          <th>번호</th>
          <th>제목</th>
          <th>저자</th>
          <th>가격</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {books.map((book) => (
          <BookRow key={book.id} book={book} onDelete={onDelete} />
        ))}
      </tbody>
    </table>
  );
}
