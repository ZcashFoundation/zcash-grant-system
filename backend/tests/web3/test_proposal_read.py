import copy
import json
import time

from grant.extensions import web3
from ..config import BaseTestConfig
from grant.web3.proposal import read_proposal
from flask_web3 import current_web3
import eth_tester.backends.pyevm.main as py_evm_main

# increase gas limit on eth-tester
# https://github.com/ethereum/web3.py/issues/1013
# https://gitter.im/ethereum/py-evm?at=5b7eb68c4be56c5918854337
py_evm_main.GENESIS_GAS_LIMIT = 10000000


class TestWeb3ProposalRead(BaseTestConfig):
    def create_app(self):
        self.real_app = BaseTestConfig.create_app(self)
        return self.real_app

    def setUp(self):
        BaseTestConfig.setUp(self)
        # the following will properly configure web3 with test config
        web3.init_app(self.real_app)
        with open("../contract/build/contracts/CrowdFundFactory.json", "r") as read_file:
            crowd_fund_factory_json = json.load(read_file)
        with open("../contract/build/contracts/CrowdFund.json", "r") as read_file:
            self.crowd_fund_json = json.load(read_file)
        current_web3.eth.defaultAccount = current_web3.eth.accounts[0]
        CrowdFundFactory = current_web3.eth.contract(
            abi=crowd_fund_factory_json['abi'], bytecode=crowd_fund_factory_json['bytecode'])
        tx_hash = CrowdFundFactory.constructor().transact()
        tx_receipt = current_web3.eth.waitForTransactionReceipt(tx_hash)
        self.crowd_fund_factory = current_web3.eth.contract(
            address=tx_receipt.contractAddress,
            abi=crowd_fund_factory_json['abi']
        )

    def get_mock_proposal_read(self, contributors=[]):
        mock_proposal_read = {
            "immediateFirstMilestonePayout": True,
            "amountVotingForRefund": "0",
            "beneficiary": current_web3.eth.accounts[0],
            # "deadline": 1541706179000,
            "milestoneVotingPeriod": 3600000,
            "isRaiseGoalReached": False,
            "balance": "0",
            "milestones": [
                {
                    "index": 0,
                    "state": "WAITING",
                    "amount": "5000000000000000000",
                    "amountAgainstPayout": "0",
                    "percentAgainstPayout": 0,
                    "payoutRequestVoteDeadline": 0,
                    "isPaid": False,
                    "isImmediatePayout": True
                }
            ],
            "trustees": [
                current_web3.eth.accounts[0]
            ],
            "contributors": [],
            "target": "5000000000000000000",
            "isFrozen": False,
            "funded": "0",
            "percentFunded": 0,
            "percentVotingForRefund": 0
        }
        for c in contributors:
            mock_proposal_read['contributors'].append({
                "address": current_web3.eth.accounts[c[0]],
                "contributionAmount": str(c[1] * 1000000000000000000),
                "refundVote": False,
                "refunded": False,
                "milestoneNoVotes": [
                    False
                ]
            })
        return mock_proposal_read

    def create_crowd_fund(self):
        tx_hash = self.crowd_fund_factory.functions.createCrowdFund(
            5000000000000000000,             # ethAmount
            current_web3.eth.accounts[0],    # payout
            [current_web3.eth.accounts[0]],  # trustees
            [5000000000000000000],           # milestone amounts
            60,                              # duration (minutes)
            60,                              # voting period (minutes)
            True                             # immediate first milestone payout
        ).transact()
        tx_receipt = current_web3.eth.waitForTransactionReceipt(tx_hash)
        tx_events = self.crowd_fund_factory.events.ContractCreated().processReceipt(tx_receipt)
        contract_address = tx_events[0]['args']['newAddress']
        return contract_address

    def fund_crowd_fund(self, address):
        contract = current_web3.eth.contract(address=address, abi=self.crowd_fund_json['abi'])
        accts = current_web3.eth.accounts
        for c in [[5, 1], [6, 1], [7, 3]]:
            tx_hash = contract.functions.contribute().transact({
                "from": accts[c[0]],
                "value": c[1] * 1000000000000000000
            })
            current_web3.eth.waitForTransactionReceipt(tx_hash)

    def test_proposal_read_new(self):
        contract_address = self.create_crowd_fund()
        proposal_read = read_proposal(contract_address)
        deadline = proposal_read.pop('deadline')
        deadline_diff = deadline - time.time() * 1000
        self.assertGreater(60000, deadline_diff)
        self.assertGreater(deadline_diff, 58000)
        self.maxDiff = None
        self.assertEqual(proposal_read, self.get_mock_proposal_read())

    def test_proposal_funded(self):
        contract_address = self.create_crowd_fund()
        self.fund_crowd_fund(contract_address)
        proposal_read = read_proposal(contract_address)
        expected = self.get_mock_proposal_read([[5, 1], [6, 1], [7, 3]])
        expected['funded'] = expected['target']
        expected['balance'] = expected['target']
        expected['isRaiseGoalReached'] = True
        expected['percentFunded'] = 100
        deadline = proposal_read.pop('deadline')
        deadline_diff = deadline - time.time() * 1000
        self.assertGreater(60000, deadline_diff)
        self.assertGreater(deadline_diff, 50000)
        self.maxDiff = None
        self.assertEqual(proposal_read, expected)
