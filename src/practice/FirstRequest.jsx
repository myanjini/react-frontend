import { useEffect, useState } from 'react';

// S5 실습: 다른 출처(127.0.0.1:8000)의 백엔드에 첫 요청을 보내 CORS 동작을 관찰합니다.
export default function FirstRequest() {
  const [message, setMessage] = useState('요청 전');

  useEffect(() => {
    fetch('http://127.0.0.1:8000/books?limit=3')
      .then((response) => response.json())
      .then((page) => setMessage(`도서 ${page.total}권을 받았습니다.`))
      .catch((error) => setMessage(`실패: ${error.message}`));
  }, []);

  return <p>백엔드 연결 확인: {message}</p>;
}
