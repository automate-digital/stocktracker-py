import { test, expect, request } from '@playwright/test';

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

test.describe('API valuation endpoint', () => {
  test('returns valuation; exact value under mock mode', async ({ request }) => {
    await clearPortfolio(request);

    const ticker = 'PWTST2';
    const units = 2;

    const addRes = await request.post(`${API_BASE}/holding`, {
      form: { ticker, units }
    });
    expect(addRes.status()).toBe(201);

    const valRes = await request.get(`${API_BASE}/valuation`);
    expect(valRes.status()).toBe(200);
    const body = await valRes.json();
    expect(body).toHaveProperty('valuation');

    const valuation = body.valuation as number;
    if (MOCK_MODE) {
      // share_pricing returns 123.45 when MOCK_PRICES=1; 2 * 123.45 = 246.9
      expect(valuation).toBeCloseTo(246.9, 2);
    } else {
      expect(typeof valuation).toBe('number');
    }
  });
});
