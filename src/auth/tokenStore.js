// 토큰 보관소
// - 액세스 토큰: 메모리(모듈 변수)에만 둡니다. 새로고침하면 사라집니다.
// - 리프레시 토큰: sessionStorage에 둡니다. 탭을 닫으면 사라집니다.
// 저장 위치를 이렇게 고른 이유는 교안의 "프론트엔드 개발 보안" 단원에서 다룹니다.
const REFRESH_KEY = 'book-admin.refresh';

let accessToken = null;

export const tokenStore = {
  getAccess: () => accessToken,
  getRefresh: () => sessionStorage.getItem(REFRESH_KEY),
  save({ access_token, refresh_token }) {
    accessToken = access_token;
    if (refresh_token) sessionStorage.setItem(REFRESH_KEY, refresh_token);
  },
  clear() {
    accessToken = null;
    sessionStorage.removeItem(REFRESH_KEY);
  },
};
