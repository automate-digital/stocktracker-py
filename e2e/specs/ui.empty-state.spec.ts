import { test, expect, request } from '@playwright/test';
import { StockPortfolioPage } from '../pages/StockPortfolioPage';

const API_BASE = 'http://127.0.0.1:5001';

async function clearPortfolio(ctx: request.APIRequestContext) {
  const res = await ctx.get(`${API_BASE}/portfolio`);
  const portfolio = await res.json();
  const tickers = Object.keys(portfolio || {});
  for (const t of tickers) {
    await ctx.delete(`${API_BASE}/holding`, { form: { ticker: t } });
  }
}

test.describe('UI empty state and add flow', () => {
  test('shows empty portfolio then adds a holding', async ({ page, request }) => {
    await clearPortfolio(request);

    const portfolio = new StockPortfolioPage(page);
    await portfolio.goto();

    // Expect no items to start
    await expect(portfolio.items).toHaveCount(0);

    // Add a holding
    const ticker = 'PWTUI1';
    const units = '1';
    await portfolio.addHolding(ticker, units);

    // Verify appears
    const row = portfolio.rowForTicker(ticker);
    await expect(row).toHaveCount(1);
    await expect(row).toContainText(units);
  });
});
