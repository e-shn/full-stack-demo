/**
 * E8 — Break the App (the false-green lesson)
 *
 * Copy this file to tests/ui/breakApp.spec.ts to run it.
 *
 * STEP 1 — Run the suite with the app in its normal state:
 *   npm start
 *   npx playwright test tests/ui/breakApp.spec.ts
 *   → all tests should be GREEN
 *
 * STEP 2 — Break the app and run again:
 *   DEMO_BREAK=1 npm start
 *   npx playwright test tests/ui/breakApp.spec.ts --trace on
 *   → tests should go RED
 *
 * STEP 3 — Open the trace to see exactly what failed:
 *   npx playwright show-trace test-results/<folder>/trace.zip
 *
 * STEP 4 — Restore and confirm green:
 *   npm start   (no DEMO_BREAK)
 */

import { test, expect } from '@playwright/test';
import { CreateUserPage } from '../pages/CreateUserPage';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

test('Create User button exists with the correct label', async ({ page }) => {
  await page.goto(`${BASE_URL}/users/new`);

  // This assertion WILL FAIL when DEMO_BREAK=1 — that's the point.
  // The button label changes to "Add User", so getByRole finds nothing.
  const btn = page.getByRole('button', { name: 'Create User' });
  await expect(btn).toBeVisible();
});

test('Create User button is disabled on an empty form', async ({ page }) => {
  await page.goto(`${BASE_URL}/users/new`);

  // TODO: locate the Create User button and assert it is disabled
  const createUserPage = new CreateUserPage(page);
  const submitBtn = createUserPage.createUserButton;
  await expect(submitBtn).toBeDisabled();
});

test('Create User button enables once all fields are filled', async ({ page }) => {
  await page.goto(`${BASE_URL}/users/new`);

  const createUserPage = new CreateUserPage(page);
  const submitBtn = createUserPage.createUserButton;

  // TODO: fill in all four fields
  await createUserPage.firstNameInput.fill('John');
  await createUserPage.lastNameInput.fill('Doe');
  await createUserPage.emailInput.fill(`john.doe+${Date.now()}@example.com`);
  await createUserPage.passwordInput.fill('SecurePass123!');

  // TODO: assert the button is now enabled
  await expect(submitBtn).toBeEnabled();
});
