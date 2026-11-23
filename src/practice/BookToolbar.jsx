import SearchBox from './SearchBox';

// 검색과 정렬 입력을 한곳에 모은 컴포넌트입니다. 값은 부모가 가지고, 바뀐 값만 알려 줍니다.
export default function BookToolbar({ keyword, onKeywordChange, sort, onSortChange }) {
  return (
    <div>
      <SearchBox keyword={keyword} onChange={onKeywordChange} />
      <select value={sort} onChange={(e) => onSortChange(e.target.value)}>
        <option value="id">등록순</option>
        <option value="price">가격 낮은 순</option>
        <option value="-price">가격 높은 순</option>
      </select>
    </div>
  );
}
