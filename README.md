# Stock Tracker App

This application allows a user to compose a portfolio of stock holdings.

It supports the following capabilities:   
- Add a holding by providing the ticker symbol plus the number of units.  
- Remove a holding for a given ticker.  
- View the current portfolio.
- Query the total value of the portfolio.

Notes:
1. The format of supported stock tickers is a series of uppercase letters, plus an optional hyphen and/or dot and/or number, examples being: AAPL, BF-B, VOD.LON, VOW3.DE   
2. Only one holding per ticker is supported. If a holding with an existing ticker is added, then the new number of units replaces the amount for that ticker.   
3. Stock prices based on the daily closing price from the prior (most recent) trading day.   
4. The portfolio is saved each time it is changed.   
5. This is a single-user application; there is no end user authentication.   
6. The application integrates with the following API: https://www.alphavantage.co/ (see below for setting up API access)
7. Please be aware that the standard AlphaVantage API access is limited to 25 requests per day. If you run out of this quota, you may need to create a new one.

## Quick Start

### Prerequisites
- Python 3.9+
- Node.js 14+

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd stocktracker-py
   ```

2. **Set up Python virtual environment**
   ```bash
   python3 -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install Python dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up AlphaVantage API key**
   - Sign up for a free API key: https://www.alphavantage.co/support/#api-key
   - Set the environment variable:
   ```bash
   export ALPHAVANTAGE_APIKEY="your-api-key-here"
   ```
   
   To make it permanent, add to `~/.bashrc` or `~/.bash_profile`:
   ```bash
   echo 'export ALPHAVANTAGE_APIKEY="your-api-key-here"' >> ~/.bashrc
   source ~/.bashrc
   ```

5. **Install Node.js dependencies**
   ```bash
   npm install
   cd web-ui && npm install && cd ..
   ```

### Running the Application

#### Option 1: CLI (Command Line Interface)
```bash
# Make sure venv is activated
source venv/bin/activate
python3 cli.py
```

#### Option 2: Web UI
**Terminal 1 - Start the API server:**
```bash
source venv/bin/activate
python3 api.py
```

**Terminal 2 - Start the Web UI:**
```bash
cd web-ui
npm run serve
```

Access the app at `http://localhost:8080`

#### Option 3: Run Tests
```bash
# Ensure Python venv exists and deps are installed
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Install Node dependencies (root and web-ui)
npm install
cd web-ui && npm install && cd ..

# Install Playwright browsers (first time only)
npm run prepare

# Run all tests (API server and Web UI start automatically)
npm run test:e2e
```

Notes:
- The Playwright test runner automatically starts the Flask API using your project virtual environment at `venv/bin/python` (if present) and launches the Vue dev server. You do not need to manually start these during tests.
- Tests run in deterministic "mock" mode by default (no real price lookups or ticker validation required). To run against real data, see Modes below.

## Backend

### API Server

To run the API server:

    $ python3 api.py

The API endpoint is exposed on `http://127.0.0.1:5001`

### API Spec

The following operations are supported:

    POST /holding
    - requires key/values for keys: 'ticker' and 'units'

    DELETE /holding
    - requires key: 'ticker'

    GET /portfolio

    GET /valuation

Example usage:

    $ curl -X POST -d "ticker=ms&units=10"  http://127.0.0.1:5001/holding
    $ curl http://127.0.0.1:5001/portfolio
    {"MS":10}
    $ curl http://127.0.0.1:5001/valuation
    {"valuation":990.5}
    $ curl -X DELETE -d "ticker=ms"  http://127.0.0.1:5001/holding
    $ curl http://127.0.0.1:5001/portfolio

## Test Approach & Automation

### Proposed Test Strategy
- **Unit Tests (Python):** Cover `PortfolioMgr`, `share_pricing`, and `api_client` with isolated logic and mocks for AlphaVantage. Use `pytest` and `responses` to stub HTTP calls. Focus on ticker validation, pricing lookup, datastore persistence, and error handling.
- **API Functional Tests:** Validate Flask endpoints (`/holding`, `/portfolio`, `/valuation`) for happy-path and error cases, including input validation and HTTP status codes. Automate with Playwright's `request` fixture for speed and concise assertions.
- **Web UI Integration (E2E):** Drive the Vue app via browser, asserting portfolio interactions (add/delete) and valuation rendering. Run against the dev server with proxy to the API to exercise real integrations.
- **Test Design:**
    - Deterministic inputs and cleanup to avoid state leaks in `main-port.csv`.
    - Avoid brittle UI selectors by using `data-test` attributes (already present).
    - Keep valuation assertions resilient due to AlphaVantage quota by validating visible outcomes (value or failure message), and prefer API tests for valuation correctness.
- **Non-Functional:** Add smoke checks into CI, cache dependencies, and gate merges with required checks.

### Playwright TypeScript Tests

#### Modes
- Fast & reliable (default): deterministic prices, no external ticker search
    ```bash
    npm run test:e2e
    ```
- Real data (AlphaVantage)
    ```bash
    export ALPHAVANTAGE_APIKEY="<your-key>"
    export DISABLE_TICKER_VALIDATION="0"
    export MOCK_PRICES="0"
    npm run test:e2e
    ```

#### Run specific tests
```bash
# API
npm run test:api
npm run test:api:validation
npm run test:api:valuation

# UI
npm run test:ui
npm run test:ui:more
npm run test:ui:valuation
```

#### Debugging & UI runner
```bash
npm run test:e2e:ui      # interactive runner
npm run test:e2e:headed  # visible browser
npm run test:e2e:debug   # step‑through with Inspector
```

#### Page Object Model (POM)
- Page objects: [e2e/pages/StockPortfolioPage.ts](e2e/pages/StockPortfolioPage.ts), [e2e/pages/PortfolioValuationPage.ts](e2e/pages/PortfolioValuationPage.ts)
- Specs: [e2e/specs](e2e/specs)

#### Common issues
- UI shows "Problem getting response from server": in real mode check your `ALPHAVANTAGE_APIKEY` and rate limits. Fast mode avoids this.
- `ModuleNotFoundError`: Make sure your Python virtual environment is activated (`source venv/bin/activate`)
- Port conflicts: Ensure ports 5001 (API) and 8080 (UI) are available

## Troubleshooting

**Python module not found errors:**
```bash
source venv/bin/activate  # Activate virtual environment
pip install -r requirements.txt  # Reinstall dependencies
```

If tests fail with `ModuleNotFoundError: No module named 'flask'` during API startup, ensure the virtual environment exists at `venv/` and dependencies are installed. The test runner prefers `venv/bin/python` automatically.

**Web UI dev server not found or fails to start:**
```bash
npm install
cd web-ui && npm install && cd ..
```
Then re-run the tests.

**AlphaVantage API quota exceeded:**
- The free tier allows 25 requests per day
- Use mock mode for testing: `npm run test:e2e` (default)
- Or create a new API key

**Tests failing:**
- Ensure virtual environment is activated
- Verify API key is set: `echo $ALPHAVANTAGE_APIKEY`
- Check that all dependencies are installed
