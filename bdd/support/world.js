const { setWorldConstructor, setDefaultTimeout, Before, After } = require('@cucumber/cucumber');
const { chromium } = require('@playwright/test');

setDefaultTimeout(60 * 1000);

class CustomWorld {
  constructor() {
    this.baseUrl = process.env.BASE_URL || 'http://localhost:3000';
    this.browser = null;
    this.context = null;
    this.page = null;
    this.newUser = null;
  }
}

setWorldConstructor(CustomWorld);

Before(async function () {
  this.browser = await chromium.launch({ headless: true });
  this.context = await this.browser.newContext({ baseURL: this.baseUrl });
  this.page = await this.context.newPage();
});

After(async function () {
  await this.page?.close();
  await this.context?.close();
  await this.browser?.close();
});
