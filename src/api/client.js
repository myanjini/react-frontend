import axios from 'axios';
import { toApiError, ApiError, NETWORK_ERROR_MESSAGE } from './errors';
import { tokenStore } from '../auth/tokenStore';
import { recordRequest } from '../dashboard/telemetry';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// 요청 인터셉터: 토큰을 붙이고 시작 시각을 기록합니다.
api.interceptors.request.use((config) => {
  const token = tokenStore.getAccess();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  config.metadata = { startedAt: performance.now() };
  return config;
});

function record(config, status) {
  if (!config?.metadata) return;
  recordRequest({
    time: Date.now(),
    method: (config.method ?? 'get').toUpperCase(),
    path: config.url,
    status,
    durationMs: Math.round(performance.now() - config.metadata.startedAt),
  });
}

// 이 경로들은 401이 나와도 재발급을 시도하지 않습니다.
const NO_RETRY_PATHS = ['/auth/token', '/auth/refresh', '/auth/signup', '/auth/logout'];

// 리프레시 요청이 동시에 여러 번 나가지 않도록 하나의 Promise를 공유합니다.
let refreshPromise = null;

async function refreshAccessToken() {
  const refreshToken = tokenStore.getRefresh();
  if (!refreshToken) throw new Error('NO_REFRESH_TOKEN');
  // 인터셉터가 없는 기본 axios로 보내 무한 반복을 막습니다.
  const { data } = await axios.post(`${API_BASE_URL}/auth/refresh`, {
    refresh_token: refreshToken,
  });
  tokenStore.save(data);
  return data.access_token;
}

// 재발급에 실패했을 때 로그인 상태를 지우는 일을 AuthProvider에 맡기기 위한 연결 고리입니다.
let onAuthExpired = () => {};
export function setOnAuthExpired(handler) {
  onAuthExpired = handler;
}

// 응답 인터셉터: 기록을 남기고, 401이면 한 번만 재발급 후 다시 보냅니다.
api.interceptors.response.use(
  (response) => {
    record(response.config, response.status);
    return response;
  },
  async (error) => {
    // 화면을 떠나 취소한 요청은 오류가 아니므로 그대로 넘깁니다.
    if (axios.isCancel(error)) throw error;

    const { config, response } = error;
    record(config, response?.status ?? 0);

    if (!response) {
      throw new ApiError({ status: 0, code: 'NETWORK_ERROR', message: NETWORK_ERROR_MESSAGE });
    }

    const canRetry = !NO_RETRY_PATHS.includes(config.url) && !config._retried;
    if (response.status === 401 && canRetry && tokenStore.getRefresh()) {
      config._retried = true;
      try {
        refreshPromise ??= refreshAccessToken().finally(() => {
          refreshPromise = null;
        });
        await refreshPromise;
        return api(config); // 새 토큰으로 원래 요청을 다시 보냅니다.
      } catch {
        tokenStore.clear();
        onAuthExpired();
      }
    }

    throw toApiError(response.status, response.data, response.headers);
  },
);

// 백엔드가 돌려준 표지 주소를 화면에서 열 수 있는 주소로 바꿉니다.
// - /covers/abc.png 같은 경로: API 주소를 앞에 붙입니다.
// - https://...처럼 완전한 주소(백엔드가 S3에 파일을 저장한 경우): 그대로 씁니다.
export function toAssetUrl(path) {
  if (!path) return null;
  if (/^https?:\/\//.test(path)) return path;
  return `${API_BASE_URL}${path}`;
}
