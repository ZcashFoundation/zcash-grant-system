import copy
import json

from animal_case import animalify
from grant.proposal.models import Proposal
from grant.user.models import User, user_schema, db
from mock import patch

from ..config import BaseUserConfig
from ..test_data import test_team, test_proposal, test_user


class TestAPI(BaseUserConfig):
    @patch('grant.email.send.send_email')
    def test_create_user(self, mock_send_email):
        mock_send_email.return_value.ok = True
        # Delete the user config user
        db.session.delete(self.user)
        db.session.commit()

        self.app.post(
            "/api/v1/users/",
            data=json.dumps(test_user),
            content_type='application/json'
        )

        # User
        user_db = User.get_by_identifier(account_address=test_user["accountAddress"])
        self.assertEqual(user_db.display_name, test_user["displayName"])
        self.assertEqual(user_db.title, test_user["title"])
        self.assertEqual(user_db.account_address, test_user["accountAddress"])

    def test_get_all_users(self):
        users_get_resp = self.app.get(
            "/api/v1/users/"
        )
        users_json = users_get_resp.json
        self.assertEqual(users_json[0]["displayName"], self.user.display_name)

    def test_get_single_user_by_email(self):
        users_get_resp = self.app.get(
            "/api/v1/users/{}".format(self.user.email_address)
        )

        users_json = users_get_resp.json
        self.assertEqual(users_json["avatar"]["imageUrl"], self.user.avatar.image_url)
        self.assertEqual(users_json["socialMedias"][0]["service"], 'GITHUB')
        self.assertEqual(users_json["socialMedias"][0]["username"], 'groot')
        self.assertEqual(users_json["socialMedias"][0]["link"], self.user.social_medias[0].social_media_link)
        self.assertEqual(users_json["displayName"], self.user.display_name)
    
    def test_get_single_user_by_account_address(self):
        users_get_resp = self.app.get(
            "/api/v1/users/{}".format(self.user.account_address)
        )

        users_json = users_get_resp.json
        self.assertEqual(users_json["avatar"]["imageUrl"], self.user.avatar.image_url)
        self.assertEqual(users_json["socialMedias"][0]["service"], 'GITHUB')
        self.assertEqual(users_json["socialMedias"][0]["username"], 'groot')
        self.assertEqual(users_json["socialMedias"][0]["link"], self.user.social_medias[0].social_media_link)
        self.assertEqual(users_json["displayName"], self.user.display_name)

    def test_create_user_duplicate_400(self):
        # self.user is identical to test_user, should throw
        response = self.app.post(
            "/api/v1/users/",
            data=json.dumps(test_user),
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
