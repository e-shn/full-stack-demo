/**
 * E6 — Page Object Model
 *
 * Copy this file to tests/ui/pom.spec.ts to run it.
 * NOTE: import paths below are written for tests/ui/ — TypeScript errors
 *       in the exercises/ folder are expected and resolve once copied.
 *
 * BEFORE running this file, complete tests/pages/CreateUserPage.ts:
 *   - Add the missing locators (lastName, email, password, submitButton, formAlert)
 *   - Implement fillForm(), submit(), and getAlert()
 *
 * Reference: tests/pages/UsersListPage.ts shows the complete pattern.
 */

import { test, expect } from '@playwright/test';
import { CreateUserPage } from '../pages/CreateUserPage'; // resolves after copying to tests/ui/
import { randomUUID } from 'node:crypto';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

function uniqueEmail(prefix: string): string {
    return `${prefix}+${Date.now()}-${randomUUID()}@example.com`;
}

test('create user via POM — happy path @smoke', async ({ page }) => {
    const testUser = {
        firstName: 'Pom',
        lastName: 'Test',
        email: uniqueEmail('pom.test'),
        password: 'SecurePass123!',
    };
    const createPage = new CreateUserPage(page);
    await createPage.goto();

    // TODO: call createPage.fillForm(testUser)
    await createPage.fillForm(testUser.firstName, testUser.lastName, testUser.email, testUser.password);
    // TODO: call createPage.submit()
    await createPage.submit();

    await expect(page).toHaveURL(/\/users/);
    const createdRow = page.locator('#users-tbody tr').filter({ hasText: testUser.email });
    await expect(createdRow).toHaveCount(1);
    await expect(createdRow).toContainText(testUser.firstName);
});

test('create user POM — duplicate email shows alert', async ({ page, request }) => {
    const testUser = {
        firstName: 'Pom',
        lastName: 'Test',
        email: uniqueEmail('pom.test'),
        password: 'SecurePass123!',
    };
    // Pre-create the user so the second attempt is a duplicate
    const preCreate = await request.post(`${BASE_URL}/api/users`, { data: testUser });
    expect(preCreate.status()).toBe(201);

    const createPage = new CreateUserPage(page);
    await createPage.goto();

    // TODO: call createPage.fillForm(testUser)
    await createPage.fillForm(testUser.firstName, testUser.lastName, testUser.email, testUser.password);
    // TODO: call createPage.submit()
    await createPage.submit();

    // TODO: use createPage.getAlert() to assert the duplicate-email error message
    await expect(createPage.getAlert()).toBeVisible();
    await expect(createPage.getAlert()).toContainText('email already exists');
});

test('create user POM — submit button starts disabled', async ({ page }) => {
    const testUser = {
        firstName: 'Pom',
        lastName: 'Test',
        email: uniqueEmail('pom.test'),
        password: 'SecurePass123!',
    };
    const createPage = new CreateUserPage(page);
    await createPage.goto();

    // TODO: assert createPage.submitButton is disabled
    await expect(createPage.createUserButton).toBeDisabled();
    // TODO: call createPage.fillForm(testUser)
    await createPage.fillForm(testUser.firstName, testUser.lastName, testUser.email, testUser.password);
    // TODO: assert createPage.submitButton is now enabled
    await expect(createPage.createUserButton).toBeEnabled();
});
