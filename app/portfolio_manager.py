import os
import re
from decimal import Decimal

import app.share_pricing as pricing


class PortfolioMgr:

    def __init__(self, datastore, api_client):
        self._datastore = datastore
        self._holdings = datastore.load()
        self._api_client = api_client

    def portfolio_is_empty(self):
        return len(self._holdings) == 0

    def add_holding(self, ticker, share_count):
        self._validate_share_count(share_count)
        self._validate_ticker(ticker)
        self._holdings[ticker] = share_count
        self._datastore.save(self.get_holdings())

    def remove_holding(self, ticker):
        if ticker not in self.get_holdings():
            raise ValueError('Ticker {} not found'.format(ticker))

        del self.get_holdings()[ticker]
        self._datastore.save(self.get_holdings())

    def get_holdings(self):
        return self._holdings

    def get_share_count(self, ticker):
        share_count = self.get_holdings().get(ticker, 0)
        return share_count

    def get_valuation(self, date):
        total_value = 0
        for ticker in self.get_holdings():
            price = pricing.get_share_price(self._api_client, ticker, date)
            units = self.get_share_count(ticker)
            total_value += round(Decimal(price) * Decimal(units), 2)
        return float(total_value)

    def _validate_ticker(self, ticker):
        self._check_ticker_format(ticker)
        # Allow tests to disable external validation
        if os.environ.get('DISABLE_TICKER_VALIDATION', ''):
            return
        try:
            if self._api_client.is_ticker_found(ticker):
                return
            else:
                raise ValueError('Ticker {} not found'.format(ticker))
        except OSError:
            raise

    @staticmethod
    def _validate_share_count(share_count):
        if not isinstance(share_count, int):
            raise ValueError('Count not a number {}'.format(share_count))

    @staticmethod
    def _check_ticker_format(ticker):
        if not bool(re.match('^([A-Z]|[1-9]|-|\\.)+$', ticker)):
            raise ValueError('Invalid ticker format: \'{}\''
                             .format(ticker))
