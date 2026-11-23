import { useEffect, useState } from 'react';
import { api } from '../api/client';

// S6-P20 실습: axios 인스턴스로 요청하고 오류가 ApiError로 통일되는지 확인합니다.
export default function ApiCheck() {
  const [log, setLog] = useState([]);
  const write = (line) => setLog((prev) => [...prev, line]);

  useEffect(() => {
    const controller = new AbortController();
    (async () => {
      const { data } = await api.get('/books', { params: { sort: '-price', limit: 3 }, signal: controller.signal });
      write(`가장 비싼 3권: ${data.items.map((b) => b.title).join(', ')} (전체 ${data.total}권)`);
      try {
        await api.get('/books/999999', { signal: controller.signal });
      } catch (err) {
        write(`없는 도서 조회: status=${err.status}, code=${err.code}, message=${err.message}`);
      }
    })().catch((err) => {
      if (err.name !== 'CanceledError') write(`실패: ${err.message}`);
    });
    return () => controller.abort();
  }, []);

  return <pre>{log.join('\n')}</pre>;
}
