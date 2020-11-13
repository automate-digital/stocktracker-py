import os
import requests


class ApiClient:

    BASE_URL = 'https://www.alphavantage.co/query?'
    SEARCH_ATTRS = {'function': 'SYMBOL_SEARCH', 'keywords': '', 'apikey': ''}
    TIME_SERIES_DAILY_ATTRS = \
        {'function': 'TIME_SERIES_DAILY', 'symbol': '', 'apikey': ''}
    API_KEY_ENV_VAR = 'ALPHAVANTAGE_APIKEY'

    def __init__(self, api_key=None):
        if api_key:
            self._api_key = api_key
        else:
            self._api_key = os.environ.get(self.API_KEY_ENV_VAR, None)
            if not self._api_key:
                raise ValueError('AlphaVantage key not found.')

    def is_ticker_found(self, ticker):
        results_json = self._do_get_request('search', ticker)
        if results_json.get('bestMatches', False):
            return results_json['bestMatches'][0]['1. symbol'] == ticker
        else:
            return False

    def get_time_series_daily(self, ticker):
        return self._do_get_request('time-series-daily', ticker)

    def _do_get_request(self, fn, ticker):
        params = self._get_params(fn, ticker)
        results_json = self._get(self.BASE_URL, params)
        return results_json

    def _get_params(self, operation, ticker):
        if operation == 'search':
            attr_template = self.SEARCH_ATTRS.copy()
            return self._set_params(attr_template, 'keywords', ticker)
        elif operation == 'time-series-daily':
            attr_template = self.TIME_SERIES_DAILY_ATTRS.copy()
            return self._set_params(attr_template, 'symbol', ticker)
        else:
            raise ValueError('Cannot get params for unknown API operation')

    def _set_params(self, attributes, symbol_attr_name, ticker):
        attributes['apikey'] = self._api_key
        attributes[symbol_attr_name] = ticker
        return attributes

    @staticmethod
    def _get(url, params):
        try:
            response_json = requests.get(url, params=params).json()
            ApiClient._check_error_responses(response_json)
            return response_json
        except (OSError):
            raise

    @staticmethod
    def _check_error_responses(response):
        if response.get('Error Message', None):
            raise OSError(response['Error Message'])
        if response.get('Note', None):
            raise OSError(response['Note'])
