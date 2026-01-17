import { Page, Locator } from '@playwright/test';

export class StockPortfolioPage {
  readonly page: Page;
  readonly newTicker: Locator;
  readonly newUnits: Locator;
  readonly addButton: Locator;
  readonly items: Locator;
  readonly valuationLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.newTicker = page.getByTestId('new-ticker');
    this.newUnits = page.getByTestId('new-units');
    this.addButton = page.getByText('add', { exact: true });
    this.items = page.locator('[data-test="portfolio-item"]');
    // Click the actual link instead of the containing span
    this.valuationLink = page.getByRole('link', { name: 'Get Valuation' });
  }

  async goto() {
    await this.page.goto('/');
  }

  async addHolding(ticker: string, units: string | number) {
    await this.newTicker.fill(ticker);
    await this.newUnits.fill(String(units));
    await this.addButton.click();
  }

  rowForTicker(ticker: string): Locator {
    return this.items.filter({ hasText: ticker });
  }

  async deleteHolding(ticker: string) {
    const row = this.rowForTicker(ticker);
    await row.waitFor({ state: 'visible' });
    this.page.once('dialog', dlg => dlg.accept());
    await row.getByText('delete', { exact: true }).click();
  }

  async goToValuation() {
    await this.valuationLink.click();
    await this.page.waitForURL('**/valuation');
  }
}
