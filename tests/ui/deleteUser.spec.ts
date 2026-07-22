/**
 * E5 — Delete user starter
 *
 * Copy this file to tests/ui/deleteUser.spec.ts, then complete the TODOs.
 *
 * Useful locators:
 *   page.locator('#users-tbody tr').filter({ hasText: 'alice@example.com' })
 *   page.getByRole('status')   ← the green success message
 */

import { test, expect } from '../fixtures/users.fixture';
import { randomUUID } from 'node:crypto';
import { type APIRequestContext, type Page } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

function uniqueEmail(prefix: string): string {
    return `${prefix}+${Date.now()}-${randomUUID()}@example.com`;
}

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

    await page.goto(`${BASE_URL}/users`);
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

test('deleting a user succeeds and may show confirmation @smoke', async ({ page, request, createdUser }) => {
    await page.goto(`${BASE_URL}/users`);
    await ensureUserRowPresent(request, page, createdUser);

    const userRow = page.locator('#users-tbody tr').filter({ hasText: createdUser.email });
    await expect(userRow).toHaveCount(1);
    await userRow.getByRole('button', { name: 'Delete' }).click();

        await ensureUserDeleted(request, page, createdUser.email);
        await expect(userRow).toHaveCount(0);

        const statusText = (await page.getByRole('status').textContent()) || '';
        if (statusText.length > 0) {
                await expect(page.getByRole('status')).toContainText(
                    `User "${createdUser.firstName} ${createdUser.lastName}" was deleted successfully.`
                );
        }
});

test('deleting a user removes the row from the table', async ({ page, request, createdUser }) => {
    await page.goto(`${BASE_URL}/users`);
    await ensureUserRowPresent(request, page, createdUser);

    const userRow = page.locator('#users-tbody tr').filter({ hasText: createdUser.email });
    await expect(userRow).toHaveCount(1);
    await userRow.getByRole('button', { name: 'Delete' }).click();

    await ensureUserDeleted(request, page, createdUser.email);
    await expect(userRow).toHaveCount(0);
});

test('deleted user no longer appears in API results', async ({ page, request, createdUser }) => {
    await page.goto(`${BASE_URL}/users`);
    await ensureUserRowPresent(request, page, createdUser);

    const userRow = page.locator('#users-tbody tr').filter({ hasText: createdUser.email });
    await expect(userRow).toHaveCount(1);
    await userRow.getByRole('button', { name: 'Delete' }).click();

    await ensureUserDeleted(request, page, createdUser.email);
    await expect(userRow).toHaveCount(0);

    const usersRes = await request.get('/api/users');
    expect(usersRes.ok()).toBe(true);
    const users = await usersRes.json();
    expect(users.some((u: { email: string }) => u.email === createdUser.email)).toBe(false);
});

test('User can be created and deleted immediately', async ({ page, request }) => {
    const email = uniqueEmail('create.delete');
    const password = 'SecurePass123!';
    await request.post('/api/users', {
        data: { firstName: 'Test', lastName: 'User', email, password },
    });

    await page.goto(`${BASE_URL}/users`);

    const newUserRow = page.locator('#users-tbody tr').filter({ hasText: email });
    await expect(newUserRow).toHaveCount(1);

    await newUserRow.getByRole('button', { name: 'Delete' }).click();
    await ensureUserDeleted(request, page, email);
    await expect(newUserRow).toHaveCount(0);
});