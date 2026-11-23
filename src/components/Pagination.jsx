export default function Pagination({ total, skip, limit, onChange }) {
  const page = Math.floor(skip / limit) + 1;
  const lastPage = Math.max(1, Math.ceil(total / limit));
  return (
    <nav className="pagination" aria-label="페이지 이동">
      <button disabled={page <= 1} onClick={() => onChange(skip - limit)}>
        이전
      </button>
      <span>
        {page} / {lastPage} 페이지 (전체 {total}권)
      </span>
      <button disabled={page >= lastPage} onClick={() => onChange(skip + limit)}>
        다음
      </button>
    </nav>
  );
}
