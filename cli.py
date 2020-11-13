from app.app import App


def main():
    commands = ['q', 'a', 'r', 'v']
    print()

    while True:
        print_portfolio()
        print('options: (a)dd/update holding, (r)emove holding, (q)uit, (v)aluation')
        selection = input('Please select a valid option: ')

        command = selection.strip()[0]
        if command not in commands:
            continue

        if command == 'q':
            break
        elif command == 'a':
            add()
        elif command == 'r':
            remove()
        elif command == 'v':
            value()


def print_portfolio():
    if not app.have_holdings():
        print('PORTFOLIO HAS NO HOLDINGS.')
    else:
        portfolio = app.get_portfolio()
        print('Current portfolio:')
        for holding in portfolio:
            print(f'{holding} :\t{portfolio[holding]}')
    print()


def add():
    print('Enter holding in format \'TICKER #\' (e.g. \'AAPL 10\'): ')
    new_holding = input().upper()
    print()
    try:
        holding = new_holding.split()
        app.add_holding(holding[0], int(holding[1]))
    except IndexError:
        print('Both ticker and a number required separated by a space.')
    except ValueError as e:
        print(e, '\n')
        return
    except OSError as e:
        print('Unexpected problem occurred')
        print(e, '\n')


def remove():
    print('Enter TICKER of holding to remove: ')
    ticker = input().upper()
    print()
    try:
        app.remove_holding(ticker)
    except ValueError as e:
        print('Ticker not recognised.')
        print(e, '\n')
        return


def value():
    try:
        valuation = app.get_portfolio_valuation()
        print(f'Current value of portfolio: {valuation}')
    except OSError as e:
        print('Unexpected problem occurred')
        print(e, '\n')
    print()


if __name__ == '__main__':
    data_store_filename = 'main-port.csv'
    try:
        app = App(data_store_filename)
    except ValueError as err:
        raise SystemExit(err)
    main()
