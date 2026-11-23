import { useEffect, useState } from 'react';
import { getBook, listBooks } from '../api/books';
import { checkHealth } from '../api/health';

// S6-P21 실습: API 함수로 백엔드를 호출해 결과를 확인합니다.
export default function ApiCheck() {
  const [log, setLog] = useState([]);
  const write = (line) => setLog((prev) => [...prev, line]);

  useEffect(() => {
    const controller = new AbortController();
    (async () => {
      const health = await checkHealth(controller.signal);
      write(`헬스 체크: ${health.status} / DB ${health.database} / ${health.durationMs}ms`);

      const page = await listBooks({ sort: '-price', limit: 3 }, controller.signal);
      write(`가장 비싼 3권: ${page.items.map((b) => b.title).join(', ')} (전체 ${page.total}권)`);

      try {
        await getBook(999999, controller.signal);
      } catch (err) {
        write(`없는 도서 조회: status=${err.status}, code=${err.code}, message=${err.message}`);
      }
    })().catch((err) => {
      if (err.name !== 'CanceledError' && err.name !== 'AbortError') write(`실패: ${err.message}`);
    });
    return () => controller.abort();
  }, []);

  return <pre>{log.join('\n')}</pre>;
}
