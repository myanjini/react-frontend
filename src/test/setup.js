import '@testing-library/jest-dom/vitest'; // toBeInTheDocument 같은 DOM 전용 검사 함수
import { cleanup } from '@testing-library/react';
import axios from 'axios';
import { afterAll, afterEach, beforeAll } from 'vitest';
import { api } from '../api/client';
import { server } from './server';

// 날짜 표시 테스트가 컴퓨터마다 달라지지 않도록 시간대를 고정합니다.
process.env.TZ = 'Asia/Seoul';

// jsdom의 XMLHttpRequest는 CORS 검사를 흉내 내서 가짜 응답을 막습니다.
// 테스트에서는 axios가 fetch로 요청하게 바꿔 MSW가 응답을 그대로 넘겨주게 합니다.
api.defaults.adapter = 'fetch';
axios.defaults.adapter = 'fetch';

// 가짜 API 서버를 켜고, 처리하지 않은 요청이 있으면 테스트를 실패시킵니다.
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => {
  cleanup();
  server.resetHandlers(); // 테스트 안에서 바꾼 응답을 원래대로 되돌립니다.
});
afterAll(() => server.close());
