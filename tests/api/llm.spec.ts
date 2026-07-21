/**
 * E9 — Testing the LLM Demo endpoint
 *
 * Copy this file to tests/api/llm.spec.ts to run it.
 *
 * The endpoint: GET /api/llm/ask
 * Response shape:
 *   {
 *     question:      string   // always "What is the capital of Ireland?"
 *     response:      string   // varies each call
 *     responseIndex: number   // 1–15
 *     totalVariants: number   // always 15
 *     model:         string   // "mock-llm-v1"
 *   }
 *
 * Rules:
 *   ✅ Assert on shape, key facts, and numeric ranges
 *   ❌ Do NOT assert on the exact wording of "response"
 *
 * Also see: tests/api/summary.spec.ts for the same pattern on /api/users/:id/summary
 */

import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

test.beforeEach(async ({ request }) => {
  await request.post(`${BASE_URL}/api/seed`);
});

test('GET /api/llm/ask returns 200 with the correct shape @smoke', async ({ request }) => {
  const res = await request.get(`${BASE_URL}/api/llm/ask`);

  // TODO: assert status is 200
  expect(res.status()).toBe(200);
  // TODO: parse the body and assert it has: question, response, responseIndex, totalVariants, model
  const body = await res.json();
  expect(body).toHaveProperty('question');
  expect(body).toHaveProperty('response');
  expect(body).toHaveProperty('responseIndex');
  expect(body).toHaveProperty('totalVariants');
  expect(body).toHaveProperty('model');
});

test('question is always "What is the capital of Ireland?"', async ({ request }) => {
  const { question } = await request.get(`${BASE_URL}/api/llm/ask`).then(r => r.json());

  // TODO: assert question equals the expected string exactly
  expect(question).toBe('What is the capital of Ireland?');
});

test('response always mentions Dublin', async ({ request }) => {
  const { response } = await request.get(`${BASE_URL}/api/llm/ask`).then(r => r.json());

  // TODO: assert response contains "Dublin" (case-insensitive)
  expect(response.toLowerCase()).toContain('dublin');
});

test('responseIndex is between 1 and totalVariants', async ({ request }) => {
  const { responseIndex, totalVariants } = await request.get(`${BASE_URL}/api/llm/ask`).then(r => r.json());

  expect(responseIndex).toBeGreaterThanOrEqual(1);
  expect(responseIndex).toBeLessThanOrEqual(totalVariants);
  expect(totalVariants).toBe(15);
});

test('response wording varies across multiple calls', async ({ request }) => {
  // Call the endpoint 10 times and collect the responses
  const responses = await Promise.all(
    Array.from({ length: 10 }, () =>
      request.get(`${BASE_URL}/api/llm/ask`).then(r => r.json()).then(b => b.response)
    )
  );

  // TODO: assert that more than 1 distinct response was returned
  // Hint: new Set(responses).size > 1
  expect(new Set(responses).size).toBeGreaterThan(1);
});

// TODO (stretch): assert response length is between 50 and 300 characters
// TODO (stretch): assert response does not contain any offensive words
test('Response length is between 50 and 300 characters', async ({ request }) => {
  const { response } = await request.get(`${BASE_URL}/api/llm/ask`).then(r => r.json());

  expect(response.length).toBeGreaterThanOrEqual(50);
  expect(response.length).toBeLessThanOrEqual(300);
});

test('Response does not contain offensive words', async ({ request }) => {
  const { response } = await request.get(`${BASE_URL}/api/llm/ask`).then(r => r.json());

  // List of offensive words to check for
  const offensiveWords = ['offensiveWord1', 'offensiveWord2', 'offensiveWord3']; // Replace with actual words

  // Check if any offensive word is present in the response
  const containsOffensiveWord = offensiveWords.some(word => response.toLowerCase().includes(word.toLowerCase()));

  expect(containsOffensiveWord).toBe(false);
});

// get an LLM-as-judge score for the tone
// test('LLM-as-judge score for tone is >= 0.7', async ({ request }) => {
//   const { response } = await request.get(`${BASE_URL}/api/llm/ask`).then(r => r.json());

//   // Call the LLM-as-judge endpoint to get a score for the tone
//   const judgeRes = await request.post(`${BASE_URL}/api/llm/judge`, {
//     data: { text: response, criteria: 'tone' }
//   });
//   const { score } = await judgeRes.json();

//   expect(score).toBeGreaterThanOrEqual(0.7);
// });