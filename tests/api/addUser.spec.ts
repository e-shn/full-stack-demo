import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

function uniqueEmail() {
  return `api.user+${Date.now()}@example.com`;
}

async function deleteUser(request: any, email: string) {
  await request.delete(`${BASE_URL}/api/users`, {
    data: { email },
  }).catch(() => { /* best-effort cleanup */ });
}

test('Add user via API returns created user with correct fields @smoke', async ({ request }) => {
  const email = uniqueEmail();
  const payload = {
    firstName: 'John',
    lastName: 'Smith',
    email,
    password: 'SecurePass123!',
  };

  const response = await request.post(`${BASE_URL}/api/users`, { data: payload });

  try {
    expect(response.status()).toBe(201);

    const body = await response.json();
    expect(body).toMatchObject({
      firstName: payload.firstName,
      lastName: payload.lastName,
      email: payload.email,
    });
    expect(body).not.toHaveProperty('password');
    expect(body.id).toBeTruthy();
  } finally {
    await deleteUser(request, email);
  }
});

test('Add user via API returns 409 for duplicate email', async ({ request }) => {
  const email = uniqueEmail();
  const payload = {
    firstName: 'John',
    lastName: 'Smith',
    email,
    password: 'SecurePass123!',
  };

  const first = await request.post(`${BASE_URL}/api/users`, { data: payload });
  expect(first.status()).toBe(201);

  try {
    const duplicate = await request.post(`${BASE_URL}/api/users`, { data: payload });
    expect(duplicate.status()).toBe(409);

    const body = await duplicate.json();
    expect(body.message || body.error).toMatch(/email.*already (exists|taken|in use)/i);
  } finally {
    await deleteUser(request, email);
  }
});

test('Add user via API returns 400 when required fields are missing', async ({ request }) => {
  const response = await request.post(`${BASE_URL}/api/users`, {
    data: { firstName: 'OnlyFirst' },
  });

  expect(response.status()).toBe(400);

  const body = await response.json();
  expect(body.message || body.error || body.errors).toBeTruthy();
});

test('Add user via API returns 400 for invalid email format', async ({ request }) => {
  const response = await request.post(`${BASE_URL}/api/users`, {
    data: {
      firstName: 'John',
      lastName: 'Smith',
      email: 'not-an-email',
      password: 'SecurePass123!',
    },
  });

  expect(response.status()).toBe(400);

  const body = await response.json();
  expect(body.message || body.error || body.errors).toBeTruthy();
});
