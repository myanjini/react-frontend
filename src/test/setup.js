import '@testing-library/jest-dom/vitest'; // toBeInTheDocument 같은 DOM 전용 검사 함수
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// 날짜 표시 테스트가 컴퓨터마다 달라지지 않도록 시간대를 고정합니다.
process.env.TZ = 'Asia/Seoul';

afterEach(() => cleanup());
