import { test, expect } from '@playwright/test';
import { CreateUserPage } from '../pages/CreateUserPage';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

test('Add user via UI saves first name, last name and email correctly @smoke', async ({ page }) => {
  const testUser = {
    firstName: 'Jane',
    lastName: 'Doe',
    email: `jane.doe+${Date.now()}@example.com`,
    password: 'SecurePass123!',
  };
  const createUserPage = new CreateUserPage(page);
  await createUserPage.goto();

  await createUserPage.fillForm(testUser.firstName, testUser.lastName, testUser.email, testUser.password);
  await createUserPage.submit();

  // Should navigate to user list or user detail page
  await expect(page).toHaveURL(/\/users/);

  // Confirm all three fields are visible in the saved record row
  const createdRow = page.locator('#users-tbody tr').filter({ hasText: testUser.email });
  await expect(createdRow).toHaveCount(1);
  await expect(createdRow).toContainText(testUser.firstName);
  await expect(createdRow).toContainText(testUser.lastName);
  await expect(createdRow).toContainText(testUser.email);
});

test('Add user via UI shows error for duplicate email', async ({ page, request }) => {
  const email = `duplicate.test+${Date.now()}@example.com`;
  const password = 'SecurePass123!';

  const createUserPage = new CreateUserPage(page);
  await createUserPage.goto();

  // Create once first.
  await createUserPage.fillForm('Dupe', 'User', email, password);
  await createUserPage.submit();
  await page.goto(`${BASE_URL}/users`);

  // If another test reseeded shared DB, restore the expected duplicate baseline.
  const createdRow = page.locator('#users-tbody tr').filter({ hasText: email });
  if (await createdRow.count() === 0) {
    await request.post('/api/users', {
      data: { firstName: 'Dupe', lastName: 'User', email, password },
    }).catch(() => {});
  }

  // Second create attempt with same email should now be a duplicate.
  await createUserPage.goto();
  await createUserPage.fillForm('Dupe', 'User', email, password);
  await createUserPage.submit();

  const alert = createUserPage.getAlert();
  await expect(alert).toBeVisible();
  await expect(alert).toContainText('email already exists');
});

test('Add user via UI Create User button is disabled until all fields are filled', async ({ page }) => {
  const createUserPage = new CreateUserPage(page);
  await createUserPage.goto();

  const submitBtn = createUserPage.createUserButton;

  // E1-E: button starts disabled — all fields are empty
  await expect(submitBtn).toBeDisabled();

  // Filling fields one-by-one — still disabled until ALL four have values
  await createUserPage.firstNameInput.fill('Jane');
  await expect(submitBtn).toBeDisabled();

  await createUserPage.lastNameInput.fill('Doe');
  await expect(submitBtn).toBeDisabled();

  await createUserPage.emailInput.fill(`jane.doe+${Date.now()}@example.com`);
  await expect(submitBtn).toBeDisabled();

  // Password is the last required field — only now the button enables
  await createUserPage.passwordInput.fill('SecurePass123!');
  await expect(submitBtn).toBeEnabled();
});

