import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

/**
 * E9 — Testing a non-deterministic (AI) feature.
 *
 * GET /api/users/:id/summary returns a natural-language summary whose WORDING
 * varies between calls (offline mock — no API key needed). Tests must NOT
 * assert on exact text. Instead assert on:
 *   • Response shape and HTTP status
 *   • Key facts are always present (name, email, role)
 *   • Valid JSON
 *   • Wording genuinely varies across multiple calls
 *
 * See EXERCISES.md § E9 for stretch goals (LLM-as-judge, safety checks).
 */

test.describe('GET /api/users/:id/summary', () => {

  test.beforeAll(async ({ request }) => {
    await request.post(`${BASE_URL}/api/seed`);
  });

  test('returns 200 with the expected JSON shape @smoke', async ({ request }) => {
    const res  = await request.get(`${BASE_URL}/api/users/1/summary`);
    expect(res.status()).toBe(200);

    const body = await res.json();
    expect(body).toHaveProperty('summary');
    expect(body).toHaveProperty('keyFacts');
    expect(typeof body.summary).toBe('string');
    expect(body.summary.length).toBeGreaterThan(0);
    expect(Array.isArray(body.keyFacts)).toBe(true);
  });

  test('keyFacts always includes the full name', async ({ request }) => {
    const { keyFacts } = await request.get(`${BASE_URL}/api/users/1/summary`).then(r => r.json());
    // Assert on facts — NOT on the summary sentence wording
    expect(keyFacts).toContain('Alice Johnson');
  });

  test('keyFacts always includes the email address', async ({ request }) => {
    const { keyFacts } = await request.get(`${BASE_URL}/api/users/1/summary`).then(r => r.json());
    expect(keyFacts).toContain('alice@example.com');
  });

  test('keyFacts always includes the role', async ({ request }) => {
    const { keyFacts } = await request.get(`${BASE_URL}/api/users/1/summary`).then(r => r.json());
    expect(keyFacts).toContain('admin');
  });

  test('summary text varies across multiple calls (non-deterministic)', async ({ request }) => {
    // Call the endpoint 10 times; with 3 templates we expect at least 2 distinct variants
    const summaries = await Promise.all(
      Array.from({ length: 10 }, () =>
        request.get(`${BASE_URL}/api/users/1/summary`).then(r => r.json()).then(b => b.summary)
      )
    );
    expect(new Set(summaries).size).toBeGreaterThan(1);
  });

  test('returns 404 for a non-existent user', async ({ request }) => {
    const res = await request.get(`${BASE_URL}/api/users/9999/summary`);
    expect(res.status()).toBe(404);
  });

  // ── Stretch goals (TODO for grads) ───────────────────────────────────────
  // TODO: assert that summary text does not contain any offensive/unsafe words
  // TODO: LLM-as-judge — score the summary quality and expect score >= 0.7
  // TODO: call the endpoint for multiple users and assert their names appear
  //       in their respective summaries

});
