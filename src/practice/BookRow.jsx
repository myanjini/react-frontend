export default function BookRow({ book, onDelete }) {
  return (
    <tr>
      <td>{book.id}</td>
      <td>{book.title}</td>
      <td>{book.author?.name}</td>
      <td>{book.price.toLocaleString('ko-KR')}원</td>
      <td>
        <button type="button" onClick={() => onDelete(book.id)}>
          삭제
        </button>
      </td>
    </tr>
  );
}
