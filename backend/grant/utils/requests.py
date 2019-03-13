import requests
from grant.settings import BLOCKCHAIN_REST_API_URL, BLOCKCHAIN_API_SECRET, E2E_TESTING


### REST API ###

def handle_res(res):
    j = res.json()
    if j.get('error'):
        raise Exception('Blockchain API Error: {}'.format(j['error']))
    return j['data']


def blockchain_get(path, params=None):
    if E2E_TESTING:
        return blockchain_rest_e2e(path, params)
    res = requests.get(
        f'{BLOCKCHAIN_REST_API_URL}{path}',
        headers={'authorization': BLOCKCHAIN_API_SECRET},
        params=params,
    )
    return handle_res(res)


def blockchain_post(path, data=None):
    if E2E_TESTING:
        return blockchain_rest_e2e(path, data)
    res = requests.post(
        f'{BLOCKCHAIN_REST_API_URL}{path}',
        headers={'authorization': BLOCKCHAIN_API_SECRET},
        json=data,
    )
    return handle_res(res)


def blockchain_rest_e2e(path, data):
    if '/bootstrap' in path:
        return {
            'startHeight': 123,
            'currentHeight': 456,
        }
    if '/contribution/addresses' in path:
        return {
            'transparent': 't123',
        }

    raise Exception(f'blockchain_post_e2e does not recognize path: {path}')
