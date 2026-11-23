import { QueryClient } from '@tanstack/react-query';

// 앱 전체가 함께 쓰는 서버 상태 캐시입니다.
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000, // 30초 동안은 캐시를 최신으로 보고 다시 요청하지 않습니다.
      refetchOnWindowFocus: false,
      // 4xx는 다시 보내도 결과가 같으므로 재시도하지 않고, 연결 실패와 5xx만 한 번 더 시도합니다.
      retry: (failureCount, error) => failureCount < 1 && (!error.status || error.status >= 500),
    },
  },
});
