import { test, expect, request } from '@playwright/test';

const API_BASE = 'http://127.0.0.1:5001';

async function clearPortfolio(ctx: request.APIRequestContext) {
  const res = await ctx.get(`${API_BASE}/portfolio`);
  const portfolio = await res.json();
  const tickers = Object.keys(portfolio || {});
  for (const t of tickers) {
    await ctx.delete(`${API_BASE}/holding`, { form: { ticker: t } });
  }
}

test.describe('API validation and behaviors', () => {
  test('rejects invalid ticker format', async ({ request }) => {
    await clearPortfolio(request);
    const res = await request.post(`${API_BASE}/holding`, {
      form: { ticker: 'BAD$$', units: 5 }
    });
    expect(res.status()).toBe(400);
  });

  test('rejects non-integer units', async ({ request }) => {
    await clearPortfolio(request);
    const res = await request.post(`${API_BASE}/holding`, {
      form: { ticker: 'PWTST1', units: 'abc' }
    });
    expect(res.status()).toBe(400);
  });

  test('delete returns 404 for non-existent ticker', async ({ request }) => {
    await clearPortfolio(request);
    const res = await request.delete(`${API_BASE}/holding`, {
      form: { ticker: 'NOTFOUND' }
    });
    expect(res.status()).toBe(404);
  });

  test('adding same ticker replaces units', async ({ request }) => {
    await clearPortfolio(request);
    const ticker = 'PWTST2';
    const res1 = await request.post(`${API_BASE}/holding`, {
      form: { ticker, units: 5 }
    });
    expect(res1.status()).toBe(201);

    const res2 = await request.post(`${API_BASE}/holding`, {
      form: { ticker, units: 10 }
    });
    expect(res2.status()).toBe(201);

    const getRes = await request.get(`${API_BASE}/portfolio`);
    const portfolio = await getRes.json();
    expect(portfolio).toHaveProperty(ticker, 10);
  });
});
