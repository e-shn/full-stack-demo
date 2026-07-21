/**
 * E5 — Delete user starter
 *
 * Copy this file to tests/ui/deleteUser.spec.ts, then complete the TODOs.
 *
 * Useful locators:
 *   page.locator('#users-tbody tr').filter({ hasText: 'alice@example.com' })
 *   page.getByRole('status')   ← the green success message
 */

import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

test.beforeEach(async ({ request }) => {
    // Reset to seed data before each test so deletes don't cascade
    await request.post(`${BASE_URL}/api/seed`);
});

test.afterEach(async ({ request }) => {
    // Re-seed after each test so parallel workers don't see stale deletions
    await request.post(`${BASE_URL}/api/seed`);
});

test('deleting a user shows a confirmation message @smoke', async ({ page }) => {
    await page.goto(`${BASE_URL}/users`);

    // TODO: find Alice Johnson's row and click her Delete button
    // TODO: assert the status message contains her name and "deleted"
    const aliceRow = page.locator('#users-tbody tr').filter({ hasText: 'alice@example.com' });
    const deleteBtn = aliceRow.getByRole('button', { name: 'Delete' });
    await deleteBtn.click();
    const status = page.getByRole('status');
    await expect(status).toContainText('User "Alice Johnson" was deleted successfully.');
});

test('deleting a user removes the row from the table', async ({ page }) => {
    await page.goto(`${BASE_URL}/users`);

    // TODO: delete Alice Johnson
    // TODO: assert her row is no longer visible in the table
    const aliceRow = page.locator('#users-tbody tr').filter({ hasText: 'alice@example.com' });
    const deleteBtn = aliceRow.getByRole('button', { name: 'Delete' });
    await deleteBtn.click();
    await expect(aliceRow).toHaveCount(0);
});

// TODO (stretch): assert the Total Users count decreases by 1 after deletion
test('Total Users count decreases by 1 after deletion', async ({ page }) => {
    await page.goto(`${BASE_URL}/users`);

    // Get the initial count of users
    const initialCount = await page.getByTestId('user-count').textContent();
    const initialTotalUsersCount = parseInt(initialCount || '0');

    // Delete Alice Johnson
    const aliceRow = page.locator('#users-tbody tr').filter({ hasText: 'alice@example.com' });
    const deleteBtn = aliceRow.getByRole('button', { name: 'Delete' });
    await deleteBtn.click();

    // Get the new count of users
    await expect(aliceRow).toHaveCount(0); // Ensure Alice's row is gone before checking the count
    const newCount = await page.getByTestId('user-count').textContent();
    const newTotalUsersCount = parseInt(newCount || '0');

    // Assert that the count has decreased by 1
    expect(newTotalUsersCount).toBe(initialTotalUsersCount - 1);
});

test('User can be created and deleted immediately', async ({ page }) => {
    await page.goto(`${BASE_URL}/users/new`);

    // Fill in the form to create a new user
    await page.getByLabel('First Name').fill('Test');
    await page.getByLabel('Last Name').fill('User');
    await page.getByLabel('Email').fill('test@email.com');
    await page.getByLabel('Password').fill('password123!');
    await page.getByRole('button', { name: 'Create User' }).click();

    // Assert that the new user appears in the table
    const newUserRow = page.locator('#users-tbody tr').filter({ hasText: 'test@email.com' });
    await expect(newUserRow).toHaveCount(1);

    // Delete the new user
    const deleteBtn = newUserRow.getByRole('button', { name: 'Delete' });
    await deleteBtn.click();
    const status = page.getByText('User "Test User" was deleted successfully.');
    await expect(status).toBeVisible();
    await expect(newUserRow).toHaveCount(0);
});