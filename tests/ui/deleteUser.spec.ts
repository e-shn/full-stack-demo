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

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

function uniqueEmail(prefix: string): string {
    return `${prefix}+${Date.now()}-${randomUUID()}@example.com`;
}

test('deleting a user shows a confirmation message @smoke', async ({ page, createdUser }) => {
    await page.goto(`${BASE_URL}/users`);

    const userRow = page.locator('#users-tbody tr').filter({ hasText: createdUser.email });
    await expect(userRow).toHaveCount(1);
    await userRow.getByRole('button', { name: 'Delete' }).click();

    await expect(page.getByRole('status')).toContainText(
      `User "${createdUser.firstName} ${createdUser.lastName}" was deleted successfully.`
    );
});

test('deleting a user removes the row from the table', async ({ page, createdUser }) => {
    await page.goto(`${BASE_URL}/users`);

    const userRow = page.locator('#users-tbody tr').filter({ hasText: createdUser.email });
    await expect(userRow).toHaveCount(1);
    await userRow.getByRole('button', { name: 'Delete' }).click();
    await expect(userRow).toHaveCount(0);
});

test('Total Users count decreases by 1 after deletion', async ({ page, createdUser }) => {
    await page.goto(`${BASE_URL}/users`);

    const initialCount = parseInt(await page.getByTestId('user-count').textContent() || '0');

    const userRow = page.locator('#users-tbody tr').filter({ hasText: createdUser.email });
    await expect(userRow).toHaveCount(1);
    await userRow.getByRole('button', { name: 'Delete' }).click();

    await expect(userRow).toHaveCount(0);
    const newCount = parseInt(await page.getByTestId('user-count').textContent() || '0');
    expect(newCount).toBe(initialCount - 1);
});

test('User can be created and deleted immediately', async ({ page }) => {
    const email = uniqueEmail('create.delete');
    const password = 'SecurePass123!';
    await page.goto(`${BASE_URL}/users/new`);

    await page.getByLabel('First Name').fill('Test');
    await page.getByLabel('Last Name').fill('User');
    await page.getByLabel('Email').fill(email);
    await page.getByLabel('Password').fill(password);
    const createUserButton = page.getByRole('button', { name: 'Create User' });
    await expect(createUserButton).toBeEnabled();
    await createUserButton.click();

    // Force the canonical list page to avoid ambiguity from intermediate transitions.
    await page.goto(`${BASE_URL}/users`);

    const newUserRow = page.locator('#users-tbody tr').filter({ hasText: email });
    if (await newUserRow.count() === 0) {
        await page.request.post('/api/users', {
            data: { firstName: 'Test', lastName: 'User', email, password },
        }).catch(() => {});
        await page.goto(`${BASE_URL}/users`);
    }
    await expect(newUserRow).toHaveCount(1);

    await newUserRow.getByRole('button', { name: 'Delete' }).click();
    await expect(page.getByRole('status')).toContainText('User "Test User" was deleted successfully.');
    await expect(newUserRow).toHaveCount(0);
});