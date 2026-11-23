import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';

// 화면 컴포넌트가 필요로 하는 Query 캐시와 라우터를 갖춰 그립니다.
// 테스트마다 새 캐시를 만들어 서로 영향을 주지 않게 하고, 재시도는 끕니다.
export function renderWithProviders(ui, { route = '/', path = '/' } = {}) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[route]}>
        <Routes>
          <Route path={path} element={ui} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}
