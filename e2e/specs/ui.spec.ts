import { test, expect } from '@playwright/test';
import { StockPortfolioPage } from '../pages/StockPortfolioPage';
import { PortfolioValuationPage } from '../pages/PortfolioValuationPage';

// UI is served at http://localhost:8080 via webServer

test.describe('Web UI portfolio flow', () => {
  test('add and delete a holding from UI', async ({ page }) => {
    const portfolio = new StockPortfolioPage(page);
    await portfolio.goto();

    // Add a holding
    const ticker = 'MS';
    const units = '3';
    await portfolio.addHolding(ticker, units);

    // Verify appears in list
    const row = portfolio.rowForTicker(ticker);
    await expect(row).toHaveCount(1);
    await expect(row).toContainText(units);

    // Navigate to valuation page
    await portfolio.goToValuation();
    const valuation = new PortfolioValuationPage(page);

    // Either a value shows or a failure message (AlphaVantage quota). Assert one of them.
    await valuation.waitForValueOrFailureVisible();

    // Return to portfolio and delete
    await valuation.goToPortfolio();
    await portfolio.deleteHolding(ticker);

    // Verify removed
    await expect(portfolio.rowForTicker(ticker)).toHaveCount(0);
  });
});
