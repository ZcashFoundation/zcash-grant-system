import time

import requests
from flask_web3 import current_web3

from grant.settings import CROWD_FUND_URL
from .util import batch_call, call_array, RpcError

crowd_fund_abi = None


def get_crowd_fund_abi():
    global crowd_fund_abi
    if crowd_fund_abi:
        return crowd_fund_abi

    crowd_fund_json = requests.get(CROWD_FUND_URL).json()
    crowd_fund_abi = crowd_fund_json['abi']
    return crowd_fund_abi


def read_proposal(address):
    if not address:
        return None

    current_web3.eth.defaultAccount = '0x537680D921C000fC52Af9962ceEb4e359C50F424' if not current_web3.eth.accounts else \
        current_web3.eth.accounts[0]
    crowd_fund_abi = get_crowd_fund_abi()
    contract = current_web3.eth.contract(address=address, abi=crowd_fund_abi)

    crowd_fund = {}
    methods = [
        "immediateFirstMilestonePayout",
        "raiseGoal",
        "amountVotingForRefund",
        "beneficiary",
        "deadline",
        "milestoneVotingPeriod",
        "frozen",
        "isRaiseGoalReached",
    ]

    # batched
    calls = list(map(lambda x: [x, None], methods))
    try:
        crowd_fund = batch_call(current_web3, address, crowd_fund_abi, calls, contract)
    # catch dead contracts here
    except RpcError:
        return None

    # balance (sync)
    crowd_fund['balance'] = current_web3.eth.getBalance(address)

    # arrays (sync)
    crowd_fund['milestones'] = call_array(contract.functions.milestones)
    crowd_fund['trustees'] = call_array(contract.functions.trustees)
    contributor_list = call_array(contract.functions.contributorList)

    # make milestones
    def make_ms(enum_ms):
        index = enum_ms[0]
        ms = enum_ms[1]
        is_immediate = index == 0 and crowd_fund['immediateFirstMilestonePayout']
        deadline = ms[2] * 1000
        amount_against = ms[1]
        pct_against = round(amount_against * 100 / crowd_fund['raiseGoal'])
        paid = ms[3]
        state = 'WAITING'
        if crowd_fund["isRaiseGoalReached"] and deadline > 0:
            if paid:
                state = 'PAID'
            elif deadline > time.time() * 1000:
                state = 'ACTIVE'
            elif pct_against >= 50:
                state = 'REJECTED'
            else:
                state = 'PAID'
        return {
            "index": index,
            "state": state,
            "amount": str(ms[0]),
            "amountAgainstPayout": str(amount_against),
            "percentAgainstPayout": pct_against,
            "payoutRequestVoteDeadline": deadline,
            "isPaid": paid,
            "isImmediatePayout": is_immediate
        }

    crowd_fund['milestones'] = list(map(make_ms, enumerate(crowd_fund['milestones'])))

    # contributor calls (batched)
    contributors_calls = list(map(lambda c_addr: ['contributors', (c_addr,)], contributor_list))
    contrib_votes_calls = []
    for c_addr in contributor_list:
        for msi in range(len(crowd_fund['milestones'])):
            contrib_votes_calls.append(['getContributorMilestoneVote', (c_addr, msi)])
    derived_calls = contributors_calls + contrib_votes_calls
    derived_results = batch_call(current_web3, address, crowd_fund_abi, derived_calls, contract)

    # make contributors
    contributors = []
    for contrib_address in contributor_list:
        contrib_raw = derived_results['contributors' + contrib_address]

        def get_no_vote(i):
            return derived_results['getContributorMilestoneVote' + contrib_address + str(i)]

        no_votes = list(map(get_no_vote, range(len(crowd_fund['milestones']))))

        contrib = {
            "address": contrib_address,
            "contributionAmount": str(contrib_raw[0]),
            "refundVote": contrib_raw[1],
            "refunded": contrib_raw[2],
            "milestoneNoVotes": no_votes,
        }
        contributors.append(contrib)
    crowd_fund['contributors'] = contributors

    # massage names and numbers
    crowd_fund['target'] = crowd_fund.pop('raiseGoal')
    crowd_fund['isFrozen'] = crowd_fund.pop('frozen')
    crowd_fund['deadline'] = crowd_fund['deadline'] * 1000
    crowd_fund['milestoneVotingPeriod'] = crowd_fund['milestoneVotingPeriod'] * 60 * 1000
    if crowd_fund['isRaiseGoalReached']:
        crowd_fund['funded'] = crowd_fund['target']
        crowd_fund['percentFunded'] = 100
    else:
        crowd_fund['funded'] = crowd_fund['balance']
        crowd_fund['percentFunded'] = round(crowd_fund['balance'] * 100 / crowd_fund['target'])
    crowd_fund['percentVotingForRefund'] = round(crowd_fund['amountVotingForRefund'] * 100 / crowd_fund['target'])

    bn_keys = ['amountVotingForRefund', 'balance', 'funded', 'target']
    for k in bn_keys:
        crowd_fund[k] = str(crowd_fund[k])

    return crowd_fund


def read_user_proposal(address):
    current_web3.eth.defaultAccount = '0x537680D921C000fC52Af9962ceEb4e359C50F424' if not current_web3.eth.accounts else \
        current_web3.eth.accounts[0]
    crowd_fund_abi = get_crowd_fund_abi()
    contract = current_web3.eth.contract(address=address, abi=crowd_fund_abi)

    crowd_fund = {}
    methods = [
        "raiseGoal",
    ]

    # batched
    calls = list(map(lambda x: [x, None], methods))
    try:
        crowd_fund = batch_call(current_web3, address, crowd_fund_abi, calls, contract)
    # catch dead contracts here
    except RpcError:
        return None

    # balance (sync)
    crowd_fund['balance'] = current_web3.eth.getBalance(address)
    crowd_fund['target'] = str(crowd_fund.pop('raiseGoal'))
    crowd_fund['funded'] = str(crowd_fund.pop('balance'))

    return crowd_fund


def validate_contribution_tx(tx_id, from_address, to_address, amount):
    amount_wei = current_web3.toWei(amount, 'ether')
    tx = current_web3.eth.getTransaction(tx_id)
    if tx:
        if from_address.lower() == tx.get("from").lower() and \
                to_address == tx.get("to") and \
                amount_wei == tx.get("value"):
            return True
    return False
