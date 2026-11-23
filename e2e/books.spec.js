import { expect, test } from '@playwright/test';
import { mockApi } from './mockApi';

test.beforeEach(async ({ page }) => {
  await mockApi(page);
});

test('목록에서 도서를 눌러 상세 화면으로 이동한다', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: '파이썬 입문' }).click();
  await expect(page).toHaveURL(/\/books\/1$/);
  await expect(page.getByRole('heading', { name: '파이썬 입문' })).toBeVisible();
  await expect(page.getByText('18,000원')).toBeVisible();
});

test('로그인하면 상단에 이메일이 보이고 로그인 화면을 벗어난다', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('이메일').fill('reader@example.com');
  await page.getByLabel('비밀번호').fill('secret-1234');
  await page.getByRole('button', { name: '로그인' }).click();
  await expect(page.getByText('reader@example.com (user)')).toBeVisible();
  await expect(page).toHaveURL('http://localhost:5174/');
});

test('로그인하지 않고 내 대여 화면에 가면 로그인 화면으로 보낸다', async ({ page }) => {
  await page.goto('/loans');
  await expect(page).toHaveURL(/\/login$/);
});
