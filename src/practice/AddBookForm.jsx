import { useState } from 'react';

const EMPTY = { title: '', author: '', price: '' };

// 입력 칸의 값을 state와 연결한 제어 컴포넌트입니다.
export default function AddBookForm({ onAdd }) {
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState('');

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleSubmit(event) {
    event.preventDefault(); // 페이지 새로고침을 막습니다.
    const price = Number(form.price); // 입력값은 항상 문자열이므로 숫자로 바꿉니다.
    if (!form.title.trim() || !form.author.trim()) {
      setError('제목과 저자를 입력합니다.');
      return;
    }
    if (form.price === '' || !Number.isInteger(price) || price < 0) {
      setError('가격은 0 이상의 정수입니다.');
      return;
    }
    onAdd({ title: form.title.trim(), author: { name: form.author.trim() }, price });
    setForm(EMPTY);
    setError('');
  }

  return (
    <form onSubmit={handleSubmit}>
      <input name="title" placeholder="제목" value={form.title} onChange={handleChange} />
      <input name="author" placeholder="저자" value={form.author} onChange={handleChange} />
      <input name="price" type="number" placeholder="가격" value={form.price} onChange={handleChange} />
      <button type="submit">추가</button>
      {error && <p role="alert">{error}</p>}
    </form>
  );
}
