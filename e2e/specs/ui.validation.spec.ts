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

test.describe('UI validation: invalid units do not add holding', () => {
  test('rejects non-numeric units from UI', async ({ page, request }) => {
    await clearPortfolio(request);

    const portfolio = new StockPortfolioPage(page);
    await portfolio.goto();

    const ticker = 'UIVAL';
    const invalidUnits = 'abc';

    await portfolio.addHolding(ticker, invalidUnits);

    // Verify no row appears for the invalid addition
    await expect(portfolio.rowForTicker(ticker)).toHaveCount(0);
  });
});
