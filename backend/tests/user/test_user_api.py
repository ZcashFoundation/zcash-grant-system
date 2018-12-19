import copy
import json
from datetime import datetime, timedelta

from animal_case import animalify
from grant.proposal.models import Proposal
from grant.user.models import User, user_schema, db
from mock import patch, Mock

from ..config import BaseUserConfig
from ..test_data import test_team, test_proposal, test_user


class TestUserAPI(BaseUserConfig):
    @patch('grant.email.send.send_email')
    def test_create_user(self, mock_send_email):
        mock_send_email.return_value.ok = True
        # Delete the user config user
        db.session.delete(self.user)
        db.session.commit()

        response = self.app.post(
            "/api/v1/users/",
            data=json.dumps(test_user),
            content_type='application/json'
        )
        self.assertStatus(response, 201)

        # User
        user_db = User.get_by_email(test_user["emailAddress"])
        self.assertEqual(user_db.display_name, test_user["displayName"])
        self.assertEqual(user_db.title, test_user["title"])
        self.assertEqual(user_db.email_address, test_user["emailAddress"])

    def test_get_all_users(self):
        users_get_resp = self.app.get(
            "/api/v1/users/"
        )
        self.assert200(users_get_resp)
        users_json = users_get_resp.json
        self.assertEqual(users_json[0]["displayName"], self.user.display_name)

    def test_get_single_user_by_id(self):
        users_get_resp = self.app.get(
            "/api/v1/users/{}".format(self.user.id)
        )

        users_json = users_get_resp.json
        self.assertEqual(users_json["avatar"]["imageUrl"], self.user.avatar.image_url)
        self.assertEqual(users_json["socialMedias"][0]["service"], 'GITHUB')
        self.assertEqual(users_json["socialMedias"][0]["username"], 'groot')
        self.assertEqual(users_json["socialMedias"][0]["url"], self.user.social_medias[0].social_media_link)
        self.assertEqual(users_json["displayName"], self.user.display_name)

    def test_user_auth_success(self):
        user_auth_resp = self.app.post(
            "/api/v1/users/auth",
            data=json.dumps({
                "email": self.user.email_address,
                "password": self.user_password
            }),
            content_type="application/json"
        )
        print(user_auth_resp.headers)
        self.assertEqual(user_auth_resp.json['emailAddress'], self.user.email_address)
        self.assertEqual(user_auth_resp.json['displayName'], self.user.display_name)

    def test_user_auth_required(self):
        login_resp = self.app.post(
            "/api/v1/users/auth",
            data=json.dumps({
                "email": self.user.email_address,
                "password": self.user_password
            }),
            content_type="application/json"
        )
        print(login_resp.headers)
        # should have session cookie now
        me_resp = self.app.get(
            "/api/v1/users/me",
            data=json.dumps({
                "email": self.user.email_address,
                "password": self.user_password
            }),
            content_type="application/json"
        )
        print(me_resp.headers)
        self.assert200(me_resp)

    def test_user_auth_required_fail(self):
        me_resp = self.app.get(
            "/api/v1/users/me",
            data=json.dumps({
                "email": self.user.email_address,
                "password": self.user_password
            }),

            content_type="application/json"
        )
        print(me_resp.json)
        print(me_resp.headers)
        self.assert401(me_resp)

    def test_user_auth_bad_password(self):
        user_auth_resp = self.app.post(
            "/api/v1/users/auth",
            data=json.dumps({
                "email": self.user.email_address,
                "password": "badpassword"
            }),
            content_type="application/json"
        )
        self.assert403(user_auth_resp)
        self.assertTrue(user_auth_resp.json['message'] is not None)

    def test_user_auth_bad_email(self):
        user_auth_resp = self.app.post(
            "/api/v1/users/auth",
            data=json.dumps({
                "email": "bademail@bad.com",
                "password": "somepassword"
            }),
            content_type="application/json"
        )
        self.assert400(user_auth_resp)
        self.assertTrue(user_auth_resp.json['message'] is not None)

    def test_create_user_duplicate_400(self):
        # self.user is identical to test_user, should throw
        response = self.app.post(
            "/api/v1/users/",
            data=json.dumps(test_user),
            content_type='application/json'
        )

        self.assertEqual(response.status_code, 409)

    @patch('grant.user.views.remove_avatar')
    def test_update_user_remove_social_and_avatar(self, mock_remove_avatar):
        self.login_default_user()
        updated_user = animalify(copy.deepcopy(user_schema.dump(self.user)))
        updated_user["displayName"] = 'new display name'
        updated_user["avatar"] = {}
        updated_user["socialMedias"] = []

        user_update_resp = self.app.put(
            "/api/v1/users/{}".format(self.user.id),
            data=json.dumps(updated_user),
            content_type='application/json'
        )
        self.assert200(user_update_resp, user_update_resp.json)

        user_json = user_update_resp.json
        self.assertFalse(user_json["avatar"])
        self.assertFalse(len(user_json["socialMedias"]))
        self.assertEqual(user_json["displayName"], updated_user["displayName"])
        self.assertEqual(user_json["title"], updated_user["title"])
        mock_remove_avatar.assert_called_with(test_user["avatar"]["link"], 1)

    def test_update_user_400_when_required_param_not_passed(self):
        self.login_default_user()
        updated_user = animalify(copy.deepcopy(user_schema.dump(self.user)))
        updated_user["displayName"] = 'new display name'
        del updated_user["avatar"]
        user_update_resp = self.app.put(
            "/api/v1/users/{}".format(self.user.id),
            data=json.dumps(updated_user),
            content_type='application/json'
        )
        self.assert400(user_update_resp)

    @patch('grant.email.send.send_email')
    def test_recover_user(self, mock_send_email):
        mock_send_email.return_value.ok = True

        # 1. request reset email
        response = self.app.post(
            "/api/v1/users/recover",
            data=json.dumps({'email': self.user.email_address}),
            content_type='application/json'
        )

        self.assertStatus(response, 200)
        er = self.user.email_recovery
        self.assertIsNotNone(er)
        created_diff = datetime.now() - er.date_created
        self.assertAlmostEqual(created_diff.seconds, 0)
        code = er.code

        # 2. reset password
        new_password = 'n3wp455w3rd'
        reset_resp = self.app.post(
            "/api/v1/users/recover/{}".format(code),
            data=json.dumps({'password': new_password}),
            content_type='application/json'
        )
        self.assertStatus(reset_resp, 200)

        # 3. check new password
        login_resp = self.login_default_user(new_password)
        self.assertStatus(login_resp, 200)

    @patch('grant.email.send.send_email')
    @patch('grant.email.models.datetime')
    def test_recover_user_code_expired(self, mock_datetime, mock_send_email):
        mock_send_email.return_value.ok = True
        code_create_time = datetime(year=2020, month=1, day=1, hour=1)
        mock_datetime.now.return_value = code_create_time

        # 1. request reset email
        response = self.app.post(
            "/api/v1/users/recover",
            data=json.dumps({'email': self.user.email_address}),
            content_type='application/json'
        )
        self.assertStatus(response, 200)
        er = self.user.email_recovery
        self.assertEqual(er.date_created, code_create_time)
        code = er.code

        # expire (pass time)
        mock_datetime.now.return_value = code_create_time + timedelta(minutes=61)

        # 2. attempt reset password
        reset_resp = self.app.post(
            "/api/v1/users/recover/{}".format(code),
            data=json.dumps({'password': 'n3wp455w3rd'}),
            content_type='application/json'
        )
        self.assertStatus(reset_resp, 401)
        self.assertIsNotNone(reset_resp.json['message'])

    def test_recover_user_no_user(self):
        response = self.app.post(
            "/api/v1/users/recover",
            data=json.dumps({'email': 'notinthe@system.com'}),
            content_type='application/json'
        )

        self.assertStatus(response, 400)
        self.assertIsNone(self.user.email_recovery)

    def test_recover_user_no_code(self):
        new_password = 'n3wp455w3rd'
        reset_resp = self.app.post(
            "/api/v1/users/recover/12345",
            data=json.dumps({'password': 'n3wp455w3rd'}),
            content_type='application/json'
        )
        self.assertStatus(reset_resp, 400)
        self.assertIsNotNone(reset_resp.json['message'])
