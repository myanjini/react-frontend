import axios from 'axios';
import { toApiError, ApiError, NETWORK_ERROR_MESSAGE } from './errors';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// 응답 인터셉터: 모든 실패를 ApiError 하나로 통일합니다.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // 화면을 떠나 취소한 요청은 오류가 아니므로 그대로 넘깁니다.
    if (axios.isCancel(error)) throw error;

    const { response } = error;
    if (!response) {
      throw new ApiError({ status: 0, code: 'NETWORK_ERROR', message: NETWORK_ERROR_MESSAGE });
    }
    throw toApiError(response.status, response.data, response.headers);
  },
);

// 백엔드가 돌려준 /covers/... 같은 경로를 화면에서 열 수 있는 주소로 바꿉니다.
export function toAssetUrl(path) {
  if (!path) return null;
  return `${API_BASE_URL}${path}`;
}
