import copy
import json

from grant.proposal.models import Proposal
from grant.user.models import User
from ..config import BaseTestConfig
from ..test_data import team, proposal
from mock import patch


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
            proposal_address=proposal["crowdFundContractAddress"]
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
            proposal_address=proposal["crowdFundContractAddress"]
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
            proposal_address=proposal["crowdFundContractAddress"]
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
        print(users_json)
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

    @patch('grant.email.send.send_email')
    def test_create_user(self, mock_send_email):
        mock_send_email.return_value.ok = True

        self.app.post(
            "/api/v1/users/",
            data=json.dumps(team[0]),
            content_type='application/json'
        )

        # User
        user_db = User.get_by_identifier(account_address=team[0]["accountAddress"])
        self.assertEqual(user_db.display_name, team[0]["displayName"])
        self.assertEqual(user_db.title, team[0]["title"])
        self.assertEqual(user_db.account_address, team[0]["accountAddress"])

    @patch('grant.email.send.send_email')
    def test_create_user_duplicate_400(self, mock_send_email):
        mock_send_email.return_value.ok = True
        self.test_create_user()

        response = self.app.post(
            "/api/v1/users/",
            data=json.dumps(team[0]),
            content_type='application/json'
        )

        self.assertEqual(response.status_code, 409)

    def test_update_user_remove_social_and_avatar(self):
        self.app.post(
            "/api/v1/proposals/",
            data=json.dumps(proposal),
            content_type='application/json'
        )

        updated_user = copy.deepcopy(team[0])
        updated_user['displayName'] = 'Billy'
        updated_user['title'] = 'Commander'
        updated_user['socialMedias'] = []
        updated_user['avatar'] = {}

        user_update_resp = self.app.put(
            "/api/v1/users/{}".format(proposal["team"][0]["accountAddress"]),
            data=json.dumps(updated_user),
            content_type='application/json'
        )

        users_json = user_update_resp.json
        self.assertFalse(users_json["avatar"])
        self.assertFalse(len(users_json["socialMedias"]))
        self.assertEqual(users_json["displayName"], updated_user["displayName"])
        self.assertEqual(users_json["title"], updated_user["title"])

    def test_update_user(self):
        self.app.post(
            "/api/v1/proposals/",
            data=json.dumps(proposal),
            content_type='application/json'
        )

        updated_user = copy.deepcopy(team[0])
        updated_user['displayName'] = 'Billy'
        updated_user['title'] = 'Commander'
        updated_user['socialMedias'] = [
            {
                "link": "https://github.com/billyman"
            }
        ]
        updated_user['avatar'] = {
            "link": "https://x.io/avatar.png"
        }

        user_update_resp = self.app.put(
            "/api/v1/users/{}".format(proposal["team"][0]["accountAddress"]),
            data=json.dumps(updated_user),
            content_type='application/json'
        )

        users_json = user_update_resp.json
        self.assertEqual(users_json["avatar"]["imageUrl"], updated_user["avatar"]["link"])
        self.assertEqual(users_json["socialMedias"][0]["socialMediaLink"], updated_user["socialMedias"][0]["link"])
        self.assertEqual(users_json["displayName"], updated_user["displayName"])
        self.assertEqual(users_json["title"], updated_user["title"])
