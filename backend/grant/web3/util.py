import requests
from web3.providers.base import JSONBaseProvider
from web3.utils.contracts import prepare_transaction, find_matching_fn_abi
from web3 import EthereumTesterProvider
from grant.settings import ETHEREUM_ENDPOINT_URI
from hexbytes import HexBytes
from eth_abi import decode_abi
from web3.utils.abi import get_abi_output_types, map_abi_data
from web3.utils.normalizers import BASE_RETURN_NORMALIZERS


def call_array(fn):
    results = []
    no_error = True
    index = 0
    while no_error:
        try:
            results.append(fn(index).call())
            index += 1
        except Exception:
            no_error = False
    return results


def make_key(method, args):
    return method + "".join(list(map(lambda z: str(z), args))) if args else method


def tester_batch(calls, contract):
    # fallback to sync calls for eth-tester instead of implementing batching
    results = {}
    for call in calls:
        method, args = call
        args = args if args else ()
        results[make_key(method, args)] = contract.functions[method](*args).call()
    return results


def batch(node_address, params):
    base_provider = JSONBaseProvider()
    request_data = b'[' + b','.join(
        [base_provider.encode_rpc_request('eth_call', p) for p in params]
    ) + b']'
    r = requests.post(node_address, data=request_data, headers={'Content-Type': 'application/json'})
    responses = base_provider.decode_rpc_response(r.content)
    return responses


def batch_call(w3, address, abi, calls, contract):
    # TODO: use web3py batching once its added
    # this implements batched rpc calls using web3py helper methods
    # web3py doesn't support this out-of-box yet
    # issue: https://github.com/ethereum/web3.py/issues/832
    if type(w3.providers[0]) is EthereumTesterProvider:
        return tester_batch(calls, contract)
    inputs = []
    for c in calls:
        name, args = c
        tx = {"from": w3.eth.defaultAccount, "to": address}
        prepared = prepare_transaction(address, w3, name, abi, None, tx, args)
        inputs.append([prepared, 'latest'])
    responses = batch(ETHEREUM_ENDPOINT_URI, inputs)
    results = {}
    for r in zip(calls, responses):
        result = HexBytes(r[1]['result'])
        fn_id, args = r[0]
        fn_abi = find_matching_fn_abi(abi, fn_id, args)
        output_types = get_abi_output_types(fn_abi)
        output_data = decode_abi(output_types, result)
        normalized_data = map_abi_data(BASE_RETURN_NORMALIZERS, output_types, output_data)
        key = make_key(fn_id, args)
        if len(normalized_data) == 1:
            results[key] = normalized_data[0]
        else:
            results[key] = normalized_data

    return results
