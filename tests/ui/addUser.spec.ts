import { test, expect } from '@playwright/test';
import { CreateUserPage } from '../pages/CreateUserPage';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

const testUser = {
  firstName: 'Jane',
  lastName: 'Doe',
  email: `jane.doe+${Date.now()}@example.com`,
  password: 'SecurePass123!',
};

test.afterEach(async ({ request }) => {
  // Cleanup: delete user by email via API if endpoint exists
  await request.delete(`${BASE_URL}/api/users`, {
    data: { email: testUser.email },
  }).catch(() => { /* ignore if cleanup endpoint not available */ });
});

test('Add user via UI saves first name, last name and email correctly @smoke', async ({ page }) => {
  const createUserPage = new CreateUserPage(page);
  await createUserPage.goto();

  await createUserPage.fillForm(testUser.firstName, testUser.lastName, testUser.email, testUser.password);
  await createUserPage.submit();

  // Should navigate to user list or user detail page
  await expect(page).toHaveURL(/\/users/);

  // Confirm all three fields are visible in the saved record
  await expect(page.getByText(testUser.firstName, { exact: true })).toBeVisible();
  await expect(page.getByText(testUser.lastName, { exact: true })).toBeVisible();
  await expect(page.getByText(testUser.email)).toBeVisible();
});

test('Add user via UI shows error for duplicate email', async ({ page, request }) => {
  // Pre-create user via API so we have a known duplicate
  await request.post(`${BASE_URL}/api/users`, {
    data: {
      firstName: testUser.firstName,
      lastName: testUser.lastName,
      email: testUser.email,
      password: testUser.password,
    },
  });

  const createUserPage = new CreateUserPage(page);
  await createUserPage.goto();

  await createUserPage.fillForm(testUser.firstName, testUser.lastName, testUser.email, testUser.password);
  await createUserPage.submit();

  const alert = await createUserPage.getAlert();
  await expect(alert).toBeVisible();
  await expect(alert).toContainText(/email.*already (exists|taken|in use)/i);
});

test('Add user via UI Create User button is disabled until all fields are filled', async ({ page }) => {
  const createUserPage = new CreateUserPage(page);
  await createUserPage.goto();

  const submitBtn = createUserPage.createUserButton;

  // E1-E: button starts disabled — all fields are empty
  await expect(submitBtn).toBeDisabled();

  // Filling fields one-by-one — still disabled until ALL four have values
  await createUserPage.firstNameInput.fill(testUser.firstName);
  await expect(submitBtn).toBeDisabled();

  await createUserPage.lastNameInput.fill(testUser.lastName);
  await expect(submitBtn).toBeDisabled();

  await createUserPage.emailInput.fill(testUser.email);
  await expect(submitBtn).toBeDisabled();

  // Password is the last required field — only now the button enables
  await createUserPage.passwordInput.fill(testUser.password);
  await expect(submitBtn).toBeEnabled();
});
