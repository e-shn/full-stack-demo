import { type Page, type Locator } from '@playwright/test';

/**
 * Page Object Model for the Create User page (/users/new).
 *
 * TODO: Add the remaining locators and methods to complete this POM.
 * Hint: use page.getByLabel(), page.getByRole(), page.getByTestId()
 */
export class CreateUserPage {
  readonly page: Page;

  // TODO: add locators for the other fields and the submit button
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly createUserButton: Locator;
  readonly formAlert: Locator;
  readonly errorSummary: Locator;


  constructor(page: Page) {
    this.page = page;
    this.firstNameInput = page.getByLabel('First Name');

    // TODO: assign the remaining locators here
    this.lastNameInput = page.getByLabel('Last Name');
    this.emailInput = page.getByLabel('Email');
    this.passwordInput = page.getByLabel('Password');
    this.createUserButton = page.getByRole('button', { name: 'Create User' });
    this.formAlert = page.getByRole('alert');
    this.errorSummary = page.getByTestId('error-summary');
  }

  async goto() {
    await this.page.goto('/users/new');
  }

  // TODO: add a fillForm() method that accepts user details and fills in all fields
  async fillForm(firstName: string, lastName: string, email: string, password: string):
    Promise<void> {
    await this.firstNameInput.fill(firstName);
    await this.lastNameInput.fill(lastName);
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
  }

  // TODO: add a submit() method that clicks the Create User button
  async submit(): Promise<void> {
    await this.createUserButton.click();
  }

  // TODO: add a getAlert() method that returns the alert element for error checking
  getAlert(): Locator {
    return this.formAlert;
  }
}
