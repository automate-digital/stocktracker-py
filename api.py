from flask import Flask, Response, request, abort
from functools import wraps
from app.app import App

# Init
DATA_STORE_FILENAME = 'main-port.csv'
api = Flask(__name__)


@api.route('/portfolio', methods=['GET'])
def _get_portfolio():
    try:
        app = App(DATA_STORE_FILENAME)
        return app.get_portfolio() if app.have_holdings() else {}
    except ValueError:
        abort(500)


@api.route('/valuation', methods=['GET'])
def _get_valuation():
    try:
        app = App(DATA_STORE_FILENAME)
        return {'valuation': app.get_portfolio_valuation()}
    except OSError as e:
        abort(500)


@api.route('/holding', methods=['POST'])
def _add_holding():
    app = App(DATA_STORE_FILENAME)
    try:
        ticker, units = request.form['ticker'].upper(), int(request.form['units'])
        app.add_holding(ticker, units)
        return Response('', status=201)
    except ValueError:
        abort(400)
    except OSError as e:
        abort(500)


@api.route('/holding', methods=['DELETE'])
def _delete_holding():
    app = App(DATA_STORE_FILENAME)
    try:
        ticker = request.form['ticker'].upper()
        app.remove_holding(ticker)
        return Response('', status=204)
    except ValueError:
        abort(404)
    except OSError as e:
        abort(500)


def http_exception_handler(api):
    handle_http_exception = api.handle_http_exception

    @wraps(handle_http_exception)
    def ret_val(exception):
        exc = handle_http_exception(exception)
        return '', exc.code

    return ret_val


# Override with generic error handler
api.handle_http_exception = http_exception_handler(api)

if __name__ == '__main__':
    api.run()
