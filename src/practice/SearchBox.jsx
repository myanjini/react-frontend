export default function SearchBox({ keyword, onChange }) {
  return (
    <input
      type="search"
      placeholder="제목으로 검색"
      value={keyword}
      onChange={(event) => onChange(event.target.value)}
    />
  );
}
