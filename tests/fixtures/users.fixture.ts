import { test as base } from '@playwright/test';
import { randomUUID } from 'node:crypto';

type User = {
  id:        number;
  firstName: string;
  lastName:  string;
  email:     string;
  role:      string;
};

type UserFixtures = {
  /** Resets the in-memory database to its 5-user seed state before the test. */
  seedDatabase: void;
  /** Creates a unique user via the API and deletes them after the test (even on failure). */
  createdUser: User;
};

/**
 * Extended test object that adds two fixtures:
 *
 *   seedDatabase — call POST /api/seed to restore known starting data.
 *   createdUser  — get a freshly created User object; cleanup is automatic.
 *
 * Usage:
 *   import { test, expect } from '../fixtures/users.fixture';
 *
 *   test('my test', async ({ createdUser, page }) => {
 *     // createdUser.email is unique to this test run
 *   });
 */
export const test = base.extend<UserFixtures>({
  // auto: false means the fixture only runs when a test actually requests it
  seedDatabase: [async ({ request }, use) => {
    await request.post('/api/seed');
    await use();
  }, { auto: false }],

  createdUser: async ({ request }, use, testInfo) => {
    const email = `fixture.user+${testInfo.workerIndex}-${Date.now()}-${randomUUID()}@example.com`;

    const res  = await request.post('/api/users', {
      data: { firstName: 'Fixture', lastName: 'User', email, password: 'TestPass123!' },
    });
    const user: User = await res.json();

    // Hand the user to the test
    await use(user);

    // Teardown — runs even if the test fails
    await request.delete('/api/users', { data: { email } }).catch(() => {});
  },
});

export { expect } from '@playwright/test';
