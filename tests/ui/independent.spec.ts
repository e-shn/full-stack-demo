/**
 * E7 — Test independence starter
 *
 * Copy this file to tests/ui/independent.spec.ts, then complete the TODOs.
 * NOTE: import paths below are written for tests/ui/ — TypeScript errors
 *       in the exercises/ folder are expected and resolve once copied.
 *
 * Notice: no afterEach cleanup — the fixture handles it automatically.
 */

import { test, expect } from '../fixtures/users.fixture'; // resolves after copying to tests/ui/

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

test.beforeEach(async ({ request }) => {
  await request.post(`${BASE_URL}/api/seed`);
});

test('created user appears in the list @smoke', async ({ page, createdUser }) => {
    // createdUser is a unique user created just for this test run
    await page.goto(`${BASE_URL}/users`);

    // TODO: assert createdUser.firstName is visible in the table
    await expect(page.getByText(createdUser.firstName, { exact: true })).toBeVisible();
    // TODO: assert createdUser.email is visible in the table
    await expect(page.getByText(createdUser.email, { exact: true })).toBeVisible();
});

test('created user can be deleted', async ({ page, createdUser }) => {
    await page.goto(`${BASE_URL}/users`);

    // TODO: find createdUser's row and click Delete
    const userRow = page.locator('#users-tbody tr').filter({ hasText: createdUser.email });
    await expect(userRow).toBeVisible();
    await userRow.getByRole('button', { name: 'Delete' }).click();

    // TODO: assert the status message confirms the deletion
    await expect(page.getByRole('status')).toContainText(`User "${createdUser.firstName} ${createdUser.lastName}" was deleted successfully.`);
    // TODO: assert createdUser's row is no longer in the table
    await expect(userRow).toHaveCount(0);
});
