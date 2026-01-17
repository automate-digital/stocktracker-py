import { test, expect, request } from '@playwright/test';

const API_BASE = 'http://127.0.0.1:5001';

// Utility to ensure clean state for a ticker
async function ensureDeleted(ctx: request.APIRequestContext, ticker: string) {
  await ctx.delete(`${API_BASE}/holding`, {
    form: { ticker }
  });
}

// Choose a valid ticker
const TICKER = 'IBM';

test.describe('API portfolio operations', () => {
  test('add, get, valuation, delete', async ({ request }) => {
    // Clean start
    await ensureDeleted(request, TICKER);

    // Add holding
    const addRes = await request.post(`${API_BASE}/holding`, {
      form: { ticker: TICKER, units: 5 }
    });
    expect(addRes.status()).toBe(201);

    // Get portfolio
    const getRes = await request.get(`${API_BASE}/portfolio`);
    expect(getRes.status()).toBe(200);
    const portfolio = await getRes.json();
    expect(portfolio).toHaveProperty(TICKER, 5);

    // Valuation (may hit AlphaVantage quota; assert shape)
    const valRes = await request.get(`${API_BASE}/valuation`);
    expect([200, 400, 500]).toContain(valRes.status());
    if (valRes.status() === 200) {
      const body = await valRes.json();
      expect(body).toHaveProperty('valuation');
      expect(typeof body.valuation).toBe('number');
    }

    // Delete holding
    const delRes = await request.delete(`${API_BASE}/holding`, {
      form: { ticker: TICKER }
    });
    expect([204, 404]).toContain(delRes.status());

    // Confirm deletion
    const checkRes = await request.get(`${API_BASE}/portfolio`);
    const portfolioAfter = await checkRes.json();
    expect(portfolioAfter[TICKER]).toBeUndefined();
  });
});
