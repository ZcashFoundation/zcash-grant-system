import requests
from flask import current_app

from grant.settings import BLOCKCHAIN_REST_API_URL, BLOCKCHAIN_API_SECRET, E2E_TESTING
from grant.utils.exceptions import ValidationException


### REST API ###

def handle_res(res):
    j = res.json()
    if j.get('error'):
        raise Exception('Blockchain API Error: {}'.format(j['error']))
    return j['data']


def blockchain_get(path, params=None):
    if E2E_TESTING:
        return blockchain_rest_e2e(path, params)
    try:
        res = requests.get(
            f'{BLOCKCHAIN_REST_API_URL}{path}',
            headers={'authorization': BLOCKCHAIN_API_SECRET},
            params=params,
        )
        return handle_res(res)
    except Exception as e:
        current_app.logger.error(f"Unable to contact node: {e}")
        raise e


def validate_blockchain_get(path, params=None):
    if path == '/validate/address' and params and params['address'] and params['address'][0] == 't':
        raise ValidationException('T addresses are not allowed')

    try:
        res = blockchain_get(path, params)
    except Exception:
        raise ValidationException('Unable to validate zcash address right now, try again later')
    if not res.get('valid'):
        raise ValidationException('Invalid Zcash address')

    return True


def blockchain_post(path, data=None):
    if E2E_TESTING:
        return blockchain_rest_e2e(path, data)
    try:
        res = requests.post(
            f'{BLOCKCHAIN_REST_API_URL}{path}',
            headers={'authorization': BLOCKCHAIN_API_SECRET},
            json=data,
        )
        return handle_res(res)
    except Exception as e:
        current_app.logger.error(f"Unable to contact node: {e}")
        raise e


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
