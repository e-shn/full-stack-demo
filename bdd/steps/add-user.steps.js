const { Given, When, Then } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');

Given('I have valid unique user details', async function () {
  this.newUser = {
    firstName: 'Sam',
    lastName: 'Taylor',
    email: `sam.taylor+${Date.now()}@example.com`,
    password: 'SecurePass123!',
  };
});

When('I create a new user through the create-user form', async function () {
  await this.page.goto('/users/new');

  await this.page.getByLabel('First Name').fill(this.newUser.firstName);
  await this.page.getByLabel('Last Name').fill(this.newUser.lastName);
  await this.page.getByLabel('Email').fill(this.newUser.email);
  await this.page.getByLabel('Password').fill(this.newUser.password);

  await this.page.getByRole('button', { name: 'Create User' }).click();
});

Then('I should be redirected to the user list', async function () {
  await expect(this.page).toHaveURL(/\/users/);
});

Then('I should see the new user in the list with the correct name and email', async function () {
  const userRow = this.page.locator('#users-tbody tr').filter({ hasText: this.newUser.email });
  await expect(userRow).toBeVisible();
  await expect(userRow).toContainText(this.newUser.firstName);
  await expect(userRow).toContainText(this.newUser.lastName);
});

Then('the new user should be shown as a regular user', async function () {
  const userRow = this.page.locator('#users-tbody tr').filter({ hasText: this.newUser.email });
  await expect(userRow).toContainText('user');
});
