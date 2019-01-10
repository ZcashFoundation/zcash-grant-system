import requests
import json
from grant.settings import BLOCKCHAIN_REST_API_URL, BLOCKCHAIN_API_SECRET

### REST API ###

def handle_res(res):
    j = res.json()
    if j.get('error'):
        raise Exception('Blockchain API Error: {}'.format(j['error']))
    return j['data']

def blockchain_get(path, params = None):
    res = requests.get(
        f'{BLOCKCHAIN_REST_API_URL}{path}',
        headers={ 'authorization': BLOCKCHAIN_API_SECRET },
        params=params,
    )
    return handle_res(res)

def blockchain_post(path, data = None):
    res = requests.post(
        f'{BLOCKCHAIN_REST_API_URL}{path}',
        headers={ 'authorization': BLOCKCHAIN_API_SECRET },
        data=json.dumps(data),
    )
    return handle_res(res)
