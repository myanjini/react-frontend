import { defineConfig, devices } from '@playwright/test';

// 실제 브라우저로 화면을 끝까지 조작하는 E2E 테스트 설정입니다.
export default defineConfig({
  testDir: './e2e',
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: 'http://localhost:5174',
    trace: 'on-first-retry', // 실패한 테스트를 다시 돌릴 때 기록을 남겨 원인을 찾습니다.
    // 사내망처럼 브라우저를 내려받을 수 없는 환경에서만 이미 설치된 Chromium 경로를 지정합니다.
    launchOptions: { executablePath: process.env.PW_CHROMIUM_PATH || undefined },
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  // 테스트 전에 개발 서버를 띄웁니다. 이미 떠 있으면 그대로 씁니다.
  webServer: {
    command: 'npm run dev -- --port 5174 --strictPort',
    url: 'http://localhost:5174',
    reuseExistingServer: !process.env.CI,
  },
});
