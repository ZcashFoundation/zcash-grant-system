import copy
import json
import random

from grant.proposal.models import CATEGORIES
from grant.proposal.models import Proposal
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

    def test_associate_user_via_proposal_by_email(self):
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
        proposal_db = Proposal.query.filter_by(
            proposal_id=proposal["crowdFundContractAddress"]
        ).first()
        self.assertEqual(proposal_db.team[0].id, user_db.id)

    def test_associate_user_via_proposal_by_email_when_user_already_exists(self):
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
        proposal_db = Proposal.query.filter_by(
            proposal_id=proposal["crowdFundContractAddress"]
        ).first()
        self.assertEqual(proposal_db.team[0].id, user_db.id)

        new_proposal_by_email = copy.deepcopy(proposal)
        new_proposal_by_email["crowdFundContractAddress"] = "0x2222"
        del new_proposal_by_email["team"][0]["accountAddress"]

        self.app.post(
            "/api/v1/proposals/",
            data=json.dumps(new_proposal_by_email),
            content_type='application/json'
        )

        user_db = User.query.filter_by(email_address=new_proposal_by_email["team"][0]["emailAddress"]).first()
        self.assertEqual(user_db.display_name, new_proposal_by_email["team"][0]["displayName"])
        self.assertEqual(user_db.title, new_proposal_by_email["team"][0]["title"])
        proposal_db = Proposal.query.filter_by(
            proposal_id=proposal["crowdFundContractAddress"]
        ).first()
        self.assertEqual(proposal_db.team[0].id, user_db.id)

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
        self.assertEqual(users_json[0]["avatar"]["imageUrl"], team[0]["avatar"]["link"])
        self.assertEqual(users_json[0]["socialMedias"][0]["socialMediaLink"], team[0]["socialMedias"][0]["link"])
        self.assertEqual(users_json[0]["displayName"], team[0]["displayName"])

    def test_get_single_user(self):
        self.app.post(
            "/api/v1/proposals/",
            data=json.dumps(proposal),
            content_type='application/json'
        )

        users_get_resp = self.app.get(
            "/api/v1/users/{}".format(proposal["team"][0]["emailAddress"])
        )

        users_json = users_get_resp.json
        self.assertEqual(users_json["avatar"]["imageUrl"], team[0]["avatar"]["link"])
        self.assertEqual(users_json["socialMedias"][0]["socialMediaLink"], team[0]["socialMedias"][0]["link"])
        self.assertEqual(users_json["displayName"], team[0]["displayName"])
