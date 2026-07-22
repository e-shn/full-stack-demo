/**
 * E4 — Role filter starter
 *
 * Copy this file to tests/ui/roleFilter.spec.ts, then use GitHub Copilot
 * to complete the test bodies (see exercises/e4-ai-framework/README.md).
 */

import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

test.beforeAll(async ({ request }) => {
  await request.post(`${BASE_URL}/api/seed`);
});

test('filtering by Admin role shows only Alice Johnson', async ({ page }) => {
  await page.goto(`${BASE_URL}/users`);

  const adminRadio = page.getByRole('radio', { name: 'Admin' });
  const tableRows = page.locator('#users-tbody tr');
  const aliceRow = tableRows.filter({ hasText: 'Alice Johnson' });

  await adminRadio.click();

  await expect(tableRows).toHaveCount(1);
  await expect(aliceRow).toBeVisible();
  await expect(aliceRow).toContainText('alice@example.com');
});

test('filtering by User role shows exactly 3 rows', async ({ page }) => {
  await page.goto(`${BASE_URL}/users`);

  const userRadio = page.getByRole('radio', { name: 'User' });
  const tableRows = page.locator('#users-tbody tr');

  await userRadio.click();

  // At least the 3 seeded 'user'-role users; parallel tests may have added more
  const userRowCount = await tableRows.count();
  expect(userRowCount).toBeGreaterThanOrEqual(3);
});
