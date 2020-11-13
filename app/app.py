from datetime import date

from app.portfolio_manager import PortfolioMgr
from app.datastore import DataStore
from app.api_client import ApiClient


class App:

    def __init__(self, data_filename):
        try:
            self._portfolio = PortfolioMgr(DataStore(data_filename), ApiClient())
        except ValueError:
            raise
        self._app_date = date.today()

    def have_holdings(self):
        return not self._portfolio.portfolio_is_empty()

    def add_holding(self, ticker, share_count):
        self._portfolio.add_holding(ticker, share_count)

    def remove_holding(self, ticker):
        self._portfolio.remove_holding(ticker)

    def get_date(self):
        return self._app_date

    def set_date(self, app_date):
        if type(app_date) != date:
            raise ValueError("App date not of date type: {}".format(app_date))
        self._app_date = app_date

    def get_portfolio(self):
        return self._portfolio.get_holdings()

    def get_portfolio_valuation(self):
        return self._portfolio.get_valuation(self._app_date)
