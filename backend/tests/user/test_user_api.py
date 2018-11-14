import copy
import json

from animal_case import animalify
from grant.proposal.models import Proposal
from grant.user.models import User, user_schema
from mock import patch

from ..config import BaseUserConfig
from ..test_data import test_team, test_proposal, test_user


class TestAPI(BaseUserConfig):
    # TODO create second signed message default user 
    # @patch('grant.email.send.send_email')
    # def test_create_new_user_via_proposal_by_account_address(self, mock_send_email):
    #     mock_send_email.return_value.ok = True
    #     self.remove_default_user()
    #     proposal_by_account = copy.deepcopy(test_proposal)
    #     del proposal_by_account["team"][0]["emailAddress"]
    # 
    #     resp = self.app.post(
    #         "/api/v1/proposals/",
    #         data=json.dumps(proposal_by_account),
    #         headers=self.headers,
    #         content_type='application/json'
    #     )
    # 
    #     self.assertEqual(resp, 201)
    # 
    #     # User
    #     user_db = User.query.filter_by(account_address=proposal_by_account["team"][0]["accountAddress"]).first()
    #     self.assertEqual(user_db.display_name, proposal_by_account["team"][0]["displayName"])
    #     self.assertEqual(user_db.title, proposal_by_account["team"][0]["title"])
    #     self.assertEqual(user_db.account_address, proposal_by_account["team"][0]["accountAddress"])

    # TODO create second signed message default user
    # def test_create_new_user_via_proposal_by_email(self):
    #     self.remove_default_user()
    #     proposal_by_email = copy.deepcopy(test_proposal)
    #     del proposal_by_email["team"][0]["accountAddress"]
    # 
    #     resp = self.app.post(
    #         "/api/v1/proposals/",
    #         data=json.dumps(proposal_by_email),
    #         headers=self.headers,
    #         content_type='application/json'
    #     )
    # 
    #     self.assertEqual(resp, 201)
    # 
    #     # User
    #     user_db = User.query.filter_by(email_address=proposal_by_email["team"][0]["emailAddress"]).first()
    #     self.assertEqual(user_db.display_name, proposal_by_email["team"][0]["displayName"])
    #     self.assertEqual(user_db.title, proposal_by_email["team"][0]["title"])

    def test_associate_user_via_proposal_by_email(self):
        proposal_by_email = copy.deepcopy(test_proposal)
        del proposal_by_email["team"][0]["accountAddress"]

        resp = self.app.post(
            "/api/v1/proposals/",
            data=json.dumps(proposal_by_email),
            headers=self.headers,
            content_type='application/json'
        )
        self.assertEqual(resp.status_code, 201)

        # User
        user_db = User.query.filter_by(email_address=proposal_by_email["team"][0]["emailAddress"]).first()
        self.assertEqual(user_db.display_name, proposal_by_email["team"][0]["displayName"])
        self.assertEqual(user_db.title, proposal_by_email["team"][0]["title"])
        proposal_db = Proposal.query.filter_by(
            proposal_address=test_proposal["crowdFundContractAddress"]
        ).first()
        self.assertEqual(proposal_db.team[0].id, user_db.id)

    def test_associate_user_via_proposal_by_email_when_user_already_exists(self):
        proposal_by_user_email = copy.deepcopy(test_proposal)
        del proposal_by_user_email["team"][0]["accountAddress"]

        resp = self.app.post(
            "/api/v1/proposals/",
            data=json.dumps(proposal_by_user_email),
            headers=self.headers,
            content_type='application/json'
        )
        self.assertEqual(resp.status_code, 201)

        # User
        self.assertEqual(self.user.display_name, proposal_by_user_email["team"][0]["displayName"])
        self.assertEqual(self.user.title, proposal_by_user_email["team"][0]["title"])
        proposal_db = Proposal.query.filter_by(
            proposal_address=test_proposal["crowdFundContractAddress"]
        ).first()
        self.assertEqual(proposal_db.team[0].id, self.user.id)

        new_proposal_by_email = copy.deepcopy(test_proposal)
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
            proposal_address=test_proposal["crowdFundContractAddress"]
        ).first()
        self.assertEqual(proposal_db.team[0].id, user_db.id)

    def test_get_all_users(self):
        self.app.post(
            "/api/v1/proposals/",
            data=json.dumps(test_proposal),
            content_type='application/json'
        )
        users_get_resp = self.app.get(
            "/api/v1/users/"
        )

        users_json = users_get_resp.json
        self.assertEqual(users_json[0]["displayName"], test_team[0]["displayName"])

    def test_get_user_associated_with_proposal(self):
        self.app.post(
            "/api/v1/proposals/",
            data=json.dumps(test_proposal),
            content_type='application/json'
        )

        data = {
            'proposalId': test_proposal["crowdFundContractAddress"]
        }

        users_get_resp = self.app.get(
            "/api/v1/users/",
            query_string=data
        )

        users_json = users_get_resp.json
        self.assertEqual(users_json[0]["avatar"]["imageUrl"], test_team[0]["avatar"]["link"])
        self.assertEqual(users_json[0]["socialMedias"][0]["socialMediaLink"], test_team[0]["socialMedias"][0]["link"])
        self.assertEqual(users_json[0]["displayName"], test_user["displayName"])

    def test_get_single_user(self):
        self.app.post(
            "/api/v1/proposals/",
            data=json.dumps(test_proposal),
            content_type='application/json'
        )

        users_get_resp = self.app.get(
            "/api/v1/users/{}".format(test_proposal["team"][0]["emailAddress"])
        )

        users_json = users_get_resp.json
        self.assertEqual(users_json["avatar"]["imageUrl"], test_team[0]["avatar"]["link"])
        self.assertEqual(users_json["socialMedias"][0]["socialMediaLink"], test_team[0]["socialMedias"][0]["link"])
        self.assertEqual(users_json["displayName"], test_team[0]["displayName"])

    @patch('grant.email.send.send_email')
    def test_create_user(self, mock_send_email):
        mock_send_email.return_value.ok = True

        self.app.post(
            "/api/v1/users/",
            data=json.dumps(test_team[0]),
            content_type='application/json'
        )

        # User
        user_db = User.get_by_identifier(account_address=test_team[0]["accountAddress"])
        self.assertEqual(user_db.display_name, test_team[0]["displayName"])
        self.assertEqual(user_db.title, test_team[0]["title"])
        self.assertEqual(user_db.account_address, test_team[0]["accountAddress"])

    @patch('grant.email.send.send_email')
    def test_create_user_duplicate_400(self, mock_send_email):
        mock_send_email.return_value.ok = True
        self.test_create_user()

        response = self.app.post(
            "/api/v1/users/",
            data=json.dumps(test_team[0]),
            content_type='application/json'
        )

        self.assertEqual(response.status_code, 409)

    def test_update_user_remove_social_and_avatar(self):
        updated_user = animalify(copy.deepcopy(user_schema.dump(self.user)))
        updated_user["displayName"] = 'new display name'
        updated_user["avatar"] = {}
        updated_user["socialMedias"] = []

        user_update_resp = self.app.put(
            "/api/v1/users/{}".format(self.user.account_address),
            data=json.dumps(updated_user),
            headers=self.headers,
            content_type='application/json'
        )
        self.assert200(user_update_resp)

        user_json = user_update_resp.json
        self.assertFalse(user_json["avatar"])
        self.assertFalse(len(user_json["socialMedias"]))
        self.assertEqual(user_json["displayName"], updated_user["displayName"])
        self.assertEqual(user_json["title"], updated_user["title"])

    def test_update_user_400_when_required_param_not_passed(self):
        updated_user = animalify(copy.deepcopy(user_schema.dump(self.user)))
        updated_user["displayName"] = 'new display name'
        del updated_user["avatar"]
        user_update_resp = self.app.put(
            "/api/v1/users/{}".format(self.user.account_address),
            data=json.dumps(updated_user),
            headers=self.headers,
            content_type='application/json'
        )
        self.assert400(user_update_resp)
