export default function BookRow({ book }) {
  return (
    <tr>
      <td>{book.id}</td>
      <td>{book.title}</td>
      <td>{book.author?.name}</td>
      <td>{book.price.toLocaleString('ko-KR')}원</td>
    </tr>
  );
}
