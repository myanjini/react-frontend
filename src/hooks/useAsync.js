import { useCallback, useEffect, useState } from 'react';

// 비동기 함수 fn(signal)을 실행하고 data, error, loading 상태를 돌려줍니다.
// deps가 바뀌면 다시 실행하고, 이전 요청은 취소합니다. reload()로 다시 불러올 수 있습니다.
export function useAsync(fn, deps) {
  const [state, setState] = useState({ data: undefined, error: null, loading: true });
  const [version, setVersion] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setState((prev) => ({ ...prev, loading: true, error: null }));
    fn(controller.signal)
      .then((data) => {
        if (!controller.signal.aborted) setState({ data, error: null, loading: false });
      })
      .catch((error) => {
        if (!controller.signal.aborted && error.name !== 'CanceledError') {
          setState((prev) => ({ ...prev, error, loading: false }));
        }
      });
    return () => controller.abort();
    // fn은 렌더링마다 새로 만들어지므로 의존성에서 뺍니다. 다시 실행할 조건은 deps로 정합니다.
  }, [...deps, version]); // eslint-disable-line react-hooks/exhaustive-deps

  const reload = useCallback(() => setVersion((v) => v + 1), []);
  return { ...state, reload };
}
