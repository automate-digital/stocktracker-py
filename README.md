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
7. Please be aware that the standard AlphaVantage API access is limited to 5 calls per minute; so expect to see some intermittent failures when issuing a series of requests in quick succession.

## Backend

### Setup

Requires Python3.

Install project dependencies:

    pip install -r requirements.txt

The project also requires api access to <https://www.alphavantage.co/>. To set this up:
-   Sign-up for a free api key here: <https://www.alphavantage.co/support/#api-key>   
    - Look for the key to be displayed on screen as soon as you submit your details.
-   Then add the api key as an environment variable named `ALPHAVANTAGE_APIKEY`

### Server

To run the API server:

    $ python api.py

The API endpoint is exposed on `http://localhost:5000`

### API Spec

The following operations are supported:

    POST /holding
    - requires key/values for keys: 'ticker' and 'units'

    DELETE /holding
    - requires key: 'ticker'

    GET /portfolio

    GET /valuation

Example usage:

    $ curl -X POST -d "ticker=ms&units=10"  http://localhost:5000/holding
    $ curl http://localhost:5000/portfolio
    {"MS":10}
    $ curl http://localhost:5000/valuation
    {"valuation":990.5}
    $ curl -X DELETE -d "ticker=ms"  http://localhost:5000/holding
    $ curl http://localhost:5000/portfolio
    {}

## Frontend

### Setup

Requires Node.js

Install project dependencies:

    $ cd web-ui
    $ npm i

### Web Server

Run the Dev server:

    $ npm run serve

Access the Web app at `http://localhost:8080`

### CLI

To run the CLI:

    $ python cli.py
