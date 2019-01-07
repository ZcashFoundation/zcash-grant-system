import requests
import json
from grant.settings import BLOCKCHAIN_REST_API_URL, BLOCKCHAIN_API_SECRET

def handleRes(res):
  j = res.json()
  if j.get('error'):
    raise Exception('Blockchain API Error: {}'.format(j['error']))
  return j['data']

def blockchainGet(path, params):
  res = requests.get(
    f'{BLOCKCHAIN_REST_API_URL}{path}',
    headers={ 'authorization': BLOCKCHAIN_API_SECRET },
    params=params,
  )
  return handleRes(res)

def blockchainPost(path, data):
  res = requests.post(
    f'{BLOCKCHAIN_REST_API_URL}{path}',
    headers={ 'authorization': BLOCKCHAIN_API_SECRET },
    data=json.dumps(data),
  )
  return handleRes(res)
