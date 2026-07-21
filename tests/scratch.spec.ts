/**
 * E3 — Codegen practice
 *
 * Copy this file to tests/ui/codegen.spec.ts to run it.
 *
 * BEFORE filling in this file, run:
 *   npx playwright codegen http://localhost:3000
 *
 * Use the generated locators to complete each TODO below.
 * Goal: every locator should come from codegen — no manual XPath or CSS.
 */

import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

test('service name link is visible on the users page', async ({ page }) => {
  await page.goto(`${BASE_URL}/users`);

  // TODO: paste the locator codegen generated for the "User Directory" nav link
  const serviceLink = page.getByRole('link', { name: 'User Directory' });
  await expect(serviceLink).toBeVisible();
});

test('Add User link navigates to the create form', async ({ page }) => {
  await page.goto(`${BASE_URL}/users`);

  // TODO: paste the codegen locator for the "+ Add User" link, then click it
  await page.getByRole('link', { name: '+ Add User' }).click();

  await expect(page).toHaveURL(/\/users\/new/);
});

test('Admin radio button filters the table', async ({ page }) => {
  await page.goto(`${BASE_URL}/users`);

  // TODO: paste the codegen locator for the Admin radio button, then click it
  await page.getByTestId('filter-admin').check()

  // TODO: assert only 1 row is visible after filtering
  await expect(page.locator('#users-tbody tr')).toHaveCount(1);
});

test('LLM Generate Response button is visible', async ({ page }) => {
  await page.goto(`${BASE_URL}/llm`);

  // TODO: paste the codegen locator for the "Generate Response" button
  const btn = page.getByTestId('ask-btn');
  await expect(btn).toBeVisible();
  await expect(btn).toBeEnabled();
});
