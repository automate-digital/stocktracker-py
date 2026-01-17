import { test, expect, request } from '@playwright/test';
import { StockPortfolioPage } from '../pages/StockPortfolioPage';
import { PortfolioValuationPage } from '../pages/PortfolioValuationPage';

const API_BASE = 'http://127.0.0.1:5001';
const MOCK_MODE = process.env.MOCK_PRICES === '1';

async function clearPortfolio(ctx: request.APIRequestContext) {
  const res = await ctx.get(`${API_BASE}/portfolio`);
  const portfolio = await res.json();
  const tickers = Object.keys(portfolio || {});
  for (const t of tickers) {
    await ctx.delete(`${API_BASE}/holding`, { form: { ticker: t } });
  }
}

test.describe('UI valuation page', () => {
  test('shows valuation; exact formatted value under mock mode', async ({ page, request }) => {
    await clearPortfolio(request);

    const portfolio = new StockPortfolioPage(page);
    await portfolio.goto();

    const ticker = 'MS';
    const units = '2';
    await portfolio.addHolding(ticker, units);

    await portfolio.goToValuation();
    const valuation = new PortfolioValuationPage(page);
    await valuation.waitForValueOrFailureVisible();

    if (MOCK_MODE) {
      // 2 * 123.45 = 246.90, formatted to 2dp without thousands separators
      await expect(valuation.portfolioValue).toHaveText('246.90');
    } else {
      // In real mode, assert either value or failure visible
      await expect(valuation.portfolioValue.or(valuation.failureMessage)).toBeVisible();
    }
  });
});
