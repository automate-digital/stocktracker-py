import os
from datetime import datetime


def get_share_price(api_client, ticker, valuation_date):
    # Deterministic test mode: always return a fixed price
    if os.environ.get('MOCK_PRICES', ''):
        return 123.45
    try:
        time_series_data = api_client.get_time_series_daily(ticker)
        stringified_date = valuation_date.isoformat()
        return _lookup_price(stringified_date, time_series_data)
    except OSError:
        raise
    except KeyError:
        raise ValueError('Price not found for valuation date.')


def _lookup_price(valuation_date, time_series_data):
    day = _find_prior_trading_date(valuation_date, time_series_data)
    try:
        price = time_series_data['Time Series (Daily)'][day]['4. close']
        return float(price)
    except KeyError:
        raise


def _find_prior_trading_date(valuation_date, time_series_data):
    prior_dates = _get_prior_dates(valuation_date, time_series_data)
    if prior_dates:
        closest_prior_date = max(prior_dates,
                                 key=lambda d: _days_diff(d, valuation_date))
        return closest_prior_date
    else:
        return None


def _get_prior_dates(valuation_date, time_series_data):
    if time_series_data.get('Time Series (Daily)', False):
        dates = list(time_series_data['Time Series (Daily)'].keys())
        prior = filter(lambda d: _days_diff(d, valuation_date) < 0, dates)
        return list(prior)
    else:
        return []


def _days_diff(d1, d2):
    d1 = datetime.strptime(d1, '%Y-%m-%d')
    d2 = datetime.strptime(d2, '%Y-%m-%d')
    return (d1 - d2).days
