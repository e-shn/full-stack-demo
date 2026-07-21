/**
 * E11 — CI/CD smoke tests
 *
 * Copy this file to tests/smoke.spec.ts to run it.
 *
 * These are the tests that run in the GitHub Actions pipeline.
 * They must always pass — they are the minimum bar for a green build.
 *
 * After completing the TODOs, push to GitHub and check the Actions tab.
 * The workflow file is at: .github/workflows/e2e.yml
 */

import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

test('GET /health returns { status: "ok" } @smoke', async ({ request }) => {
  const res = await request.get(`${BASE_URL}/health`);

  // TODO: assert status is 200
  // TODO: assert the body equals { status: 'ok' }
});

test('users page loads and shows a heading @smoke', async ({ page }) => {
  await page.goto(`${BASE_URL}/users`);

  // TODO: assert the main heading is visible
  // TODO: assert the user table is visible (use getByTestId)
});

test('create user form is reachable @smoke', async ({ page }) => {
  await page.goto(`${BASE_URL}/users/new`);

  // TODO: assert the "Create User" button is visible
  // TODO: assert it is disabled on an empty form
});

test('LLM demo page loads @smoke', async ({ page }) => {
  await page.goto(`${BASE_URL}/llm`);

  // TODO: assert the "Generate Response" button is visible and enabled
});

test('API: GET /api/users returns an array of users @smoke', async ({ request }) => {
  const res  = await request.get(`${BASE_URL}/api/users`);

  // TODO: assert status is 200
  // TODO: assert the body is an array with at least 1 user
  // TODO: assert the first user has firstName, lastName, and email properties
});
