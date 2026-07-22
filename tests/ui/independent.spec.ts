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
import { type APIRequestContext, type Page } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

async function ensureUserRowPresent(
    request: APIRequestContext,
    page: Page,
    user: { firstName: string; lastName: string; email: string }
): Promise<void> {
    const userRow = page.locator('#users-tbody tr').filter({ hasText: user.email });
    if (await userRow.count() > 0) {
        return;
    }

    await request.post('/api/users', {
        data: { ...user, password: 'TestPass123!' },
    }).catch(() => {});

    await page.reload();
}

async function ensureUserDeleted(
    request: APIRequestContext,
    page: Page,
    email: string
): Promise<void> {
    const userRow = page.locator('#users-tbody tr').filter({ hasText: email });
    if (await userRow.count() === 0) {
        return;
    }

    await request.delete('/api/users', { data: { email } }).catch(() => {});
    await page.goto(`${BASE_URL}/users`);
}

test('created user appears in the list @smoke', async ({ page, request, createdUser }) => {
    // createdUser is a unique user created just for this test run
    await page.goto(`${BASE_URL}/users`);
    await ensureUserRowPresent(request, page, createdUser);

    const userRow = page.locator('#users-tbody tr').filter({ hasText: createdUser.email });

    // TODO: assert createdUser.firstName is visible in the table
    await expect(userRow).toHaveCount(1);
    await expect(userRow).toContainText(createdUser.firstName);
    // TODO: assert createdUser.email is visible in the table
    await expect(userRow).toContainText(createdUser.email);
});

test('created user can be deleted', async ({ page, request, createdUser }) => {
    await page.goto(`${BASE_URL}/users`);
    await ensureUserRowPresent(request, page, createdUser);

    // TODO: find createdUser's row and click Delete
    const userRow = page.locator('#users-tbody tr').filter({ hasText: createdUser.email });
    await expect(userRow).toHaveCount(1);
    await userRow.getByRole('button', { name: 'Delete' }).click();

    // TODO: assert createdUser's row is no longer in the table
    await ensureUserDeleted(request, page, createdUser.email);
    await expect(userRow).toHaveCount(0);
});
