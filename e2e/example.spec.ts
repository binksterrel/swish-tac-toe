import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
  await page.goto('http://localhost:3000/');

  // Expect a title "to contain" a substring.
  // Note: Depending on the app, the title might be different.
  // This is just to verify Playwright runs.
  await expect(page).toHaveTitle(/Swish Tac Toe/i);
});
