import copy
import json
import random

from grant.proposal.models import CATEGORIES
from grant.user.models import User
from ..config import BaseTestConfig

milestones = [
    {
        "title": "All the money straightaway",
        "description": "cool stuff with it",
        "date": "June 2019",
        "payoutPercent": "100",
        "immediatePayout": False
    }
]

team = [
    {
        "accountAddress": "0x1",
        "displayName": 'Groot',
        "emailAddress": 'iam@groot.com',
        "title": 'I am Groot!',
        "avatar": {
            "link": 'https://avatars2.githubusercontent.com/u/1393943?s=400&v=4'
        },
        "socialMedias": [
            {
                "link": 'https://github.com/groot'
            }
        ]
    }
]

proposal = {
    "team": team,
    "crowdFundContractAddress": "0x20000",
    "content": "## My Proposal",
    "title": "Give Me Money",
    "milestones": milestones,
    "category": random.choice(CATEGORIES)
}


class TestAPI(BaseTestConfig):
    def test_create_new_user_via_proposal_by_account_address(self):
        proposal_by_account = copy.deepcopy(proposal)
        del proposal_by_account["team"][0]["emailAddress"]

        self.app.post(
            "/api/v1/proposals/",
            data=json.dumps(proposal_by_account),
            content_type='application/json'
        )

        # User
        user_db = User.query.filter_by(account_address=proposal_by_account["team"][0]["accountAddress"]).first()
        self.assertEqual(user_db.display_name, proposal_by_account["team"][0]["displayName"])
        self.assertEqual(user_db.title, proposal_by_account["team"][0]["title"])
        self.assertEqual(user_db.account_address, proposal_by_account["team"][0]["accountAddress"])

    def test_create_new_user_via_proposal_by_email(self):
        proposal_by_email = copy.deepcopy(proposal)
        del proposal_by_email["team"][0]["accountAddress"]

        self.app.post(
            "/api/v1/proposals/",
            data=json.dumps(proposal_by_email),
            content_type='application/json'
        )

        # User
        user_db = User.query.filter_by(email_address=proposal_by_email["team"][0]["emailAddress"]).first()
        self.assertEqual(user_db.display_name, proposal_by_email["team"][0]["displayName"])
        self.assertEqual(user_db.title, proposal_by_email["team"][0]["title"])

    def test_get_all_users(self):
        self.app.post(
            "/api/v1/proposals/",
            data=json.dumps(proposal),
            content_type='application/json'
        )
        users_get_resp = self.app.get(
            "/api/v1/users/"
        )

        users_json = users_get_resp.json
        self.assertEqual(users_json[0]["displayName"], team[0]["displayName"])

    def test_get_user_associated_with_proposal(self):
        self.app.post(
            "/api/v1/proposals/",
            data=json.dumps(proposal),
            content_type='application/json'
        )

        data = {
            'proposalId': proposal["crowdFundContractAddress"]
        }

        users_get_resp = self.app.get(
            "/api/v1/users/",
            query_string=data
        )

        users_json = users_get_resp.json
        self.assertEqual(users_json[0]["displayName"], team[0]["displayName"])
