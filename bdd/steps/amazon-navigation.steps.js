const { Given, Then } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');

Given('I begin on the Amazon homepage', async function () {
  await this.page.goto('https://www.amazon.co.uk');
});

Then('I should be able to click on the accept cookie button', async function () {
  const acceptButton = this.page.locator('#sp-cc-accept');
  if (await acceptButton.isVisible()) {
    await acceptButton.click();
  }
});

Then('click on the {string} link', async function (linkText) {
  await this.page.getByRole('link', { name: linkText, exact: true }).first().click();
});

Then('click on the {string} link on the left', async function (linkText) {
  await this.page
    .locator('#zg-left-col, [data-csa-c-slot-id="left-pane"], .zg_browseRoot, nav')
    .getByRole('link', { name: linkText })
    .first()
    .click();
});

Then('click on the back button', async function () {
  await this.page.goBack();
});

Then('click on back again', async function () {
  await this.page.goBack();
});

Then('arrive back on the homepage', async function () {
  await expect(this.page).toHaveURL(/amazon\.co\.uk/);
  await expect(this.page.locator('#nav-logo-sprites, #nav-belt')).toBeVisible();
});
