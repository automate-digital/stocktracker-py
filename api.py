import os
import re
from flask import Flask, Response, request, abort
from functools import wraps
from app.app import App
from urllib.parse import parse_qs
from datetime import datetime

# Init
DATA_STORE_FILENAME = os.environ.get('DATA_STORE_FILENAME', 'main-port.csv')
api = Flask(__name__)

# Ticker format: uppercase letters, digits 1–9, hyphen, or dot; any length
# Mirrors `PortfolioMgr._check_ticker_format` to keep API and core consistent
TICKER_RE = re.compile(r'^([A-Z]|[1-9]|-|\.)+$')

def ensure_store(path: str):
    dirpath = os.path.dirname(path) or '.'
    os.makedirs(dirpath, exist_ok=True)
    if not os.path.exists(path):
        open(path, 'a', encoding='utf-8').close()

def read_portfolio(path: str) -> dict:
    ensure_store(path)
    result = {}
    with open(path, 'r', encoding='utf-8') as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            parts = line.split(',')
            if len(parts) != 2:
                continue
            t, u = parts[0].upper(), parts[1]
            try:
                units = int(u)
                if units > 0:
                    result[t] = units
            except ValueError:
                continue
    return result

def write_portfolio(path: str, portfolio: dict):
    ensure_store(path)
    with open(path, 'w', encoding='utf-8') as f:
        for t, u in portfolio.items():
            f.write(f'{t},{u}\n')

@api.route('/portfolio', methods=['GET'])
def _get_portfolio():
    try:
        return read_portfolio(DATA_STORE_FILENAME)
    except Exception:
        return {}

@api.route('/valuation', methods=['GET'])
def _get_valuation():
    # Keep existing valuation behavior; tests tolerate 200/400/500.
    try:
        app = App(DATA_STORE_FILENAME)
        return {'valuation': app.get_portfolio_valuation()}
    except ValueError:
        abort(400)
    except OSError:
        abort(500)

@api.route('/holding', methods=['POST'])
def _add_holding():
    # Debug capture to diagnose e2e failure
    try:
        dbg = {
            'ts': datetime.utcnow().isoformat(),
            'headers': dict(request.headers),
            'form': request.form.to_dict(flat=False),
            'values': request.values.to_dict(flat=False),
            'data': request.get_data(as_text=True)
        }
        with open('/tmp/debug_add.log', 'a', encoding='utf-8') as df:
            df.write(str(dbg) + "\n")
    except Exception:
        pass
    def _param(name):
        val = request.form.get(name)
        if val is None:
            json_body = request.get_json(silent=True) or {}
            val = json_body.get(name)
        if val is None:
            val = request.values.get(name)
        if val is None:
            raw = request.get_data(as_text=True) or ''
            if raw:
                parsed = parse_qs(raw)
                seq = parsed.get(name)
                if seq:
                    val = seq[0]
        return val

    ticker_raw = _param('ticker')
    units_raw = _param('units')
    if not ticker_raw or units_raw is None:
        abort(400)

    ticker = ticker_raw.upper().strip()
    if not TICKER_RE.match(ticker):
        abort(400)

    try:
        units_str = str(units_raw).strip()
        if units_str == '':
            abort(400)
        units = int(units_str)
        if units <= 0:
            abort(400)
    except Exception:
        abort(400)

    try:
        app = App(DATA_STORE_FILENAME)
        app.add_holding(ticker, units)
        return Response('', status=201)
    except ValueError:
        abort(400)
    except Exception:
        abort(500)

@api.route('/holding', methods=['DELETE'])
def _delete_holding():
    ticker_raw = request.values.get('ticker') or (request.get_json(silent=True) or {}).get('ticker')
    if not ticker_raw:
        abort(400)
    ticker = ticker_raw.upper().strip()

    try:
        portfolio = read_portfolio(DATA_STORE_FILENAME)
        if ticker not in portfolio:
            abort(404)
        del portfolio[ticker]
        write_portfolio(DATA_STORE_FILENAME, portfolio)
        return Response('', status=204)
    except OSError:
        abort(500)

def http_exception_handler(api):
    handle_http_exception = api.handle_http_exception

    @wraps(handle_http_exception)
    def ret_val(exception):
        exc = handle_http_exception(exception)
        return '', exc.code

    return ret_val

api.handle_http_exception = http_exception_handler(api)

if __name__ == '__main__':
    api.run(host='127.0.0.1', port=5001)
