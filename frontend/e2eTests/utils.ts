import { Page } from '@playwright/test';

interface LoginToCodezapProps {
  page: Page;
  username: string;
  password: string;
}

export const loginToCodezap = async ({ page, username, password }: LoginToCodezapProps) => {
  await page.goto('/');
  await page.getByRole('link', { name: '로그인', exact: true }).getByRole('button').click();
  await page
    .locator('div')
    .filter({ hasText: /^아이디 \(닉네임\)$/ })
    .locator('div')
    .click();
  await page.locator('input[type="text"]').fill(username);
  await page.locator('input[type="text"]').press('Tab');
  await page.locator('input[type="password"]').fill(password);
  await page.locator('form').getByRole('button', { name: '로그인' }).click();
};

interface WaitForSuccessProps {
  page: Page;
  url: string;
}

export const waitForSuccess = async ({ page, url }: WaitForSuccessProps) => {
  await page.waitForResponse((response) => response.url().includes(url) && response.status() === 200);
};
