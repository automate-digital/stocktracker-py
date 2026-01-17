import { Page, Locator } from '@playwright/test';

export class PortfolioValuationPage {
  readonly page: Page;
  readonly portfolioValue: Locator;
  readonly failureMessage: Locator;
  readonly portfolioLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.portfolioValue = page.getByTestId('portfolio-value');
    this.failureMessage = page.locator('#failure-message');
    this.portfolioLink = page.getByRole('link', { name: 'View Portfolio' });
  }

  async waitForValueOrFailureVisible() {
    await this.portfolioValue.or(this.failureMessage).waitFor({ state: 'visible', timeout: 30000 });
  }

  async goToPortfolio() {
    await this.portfolioLink.click();
    await this.page.waitForURL('**/');
  }
}
