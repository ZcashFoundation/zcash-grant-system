import copy
import json
from datetime import datetime, timedelta

from animal_case import animalify
from grant.email.subscription_settings import get_default_email_subscriptions
from grant.user.models import User, user_schema, db
from mock import patch

from ..config import BaseUserConfig
from ..test_data import test_user


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
        # should not be able to add social
        self.assertFalse(user_db.social_medias)

    def test_get_single_user_by_id(self):
        users_get_resp = self.app.get(
            "/api/v1/users/{}".format(self.user.id)
        )

        users_json = users_get_resp.json
        self.assertEqual(users_json["avatar"]["imageUrl"], self.user.avatar.image_url)
        self.assertEqual(users_json["socialMedias"][0]["service"], 'GITHUB')
        self.assertEqual(users_json["socialMedias"][0]["username"], 'groot')
        self.assertEqual(users_json["socialMedias"][0]["url"], 'https://github.com/groot')
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
        # should have session cookie now
        me_resp = self.app.get(
            "/api/v1/users/me"
        )
        self.assert200(me_resp)

    def test_me_get_includes_email_address(self):
        self.login_default_user()
        me_resp = self.app.get(
            "/api/v1/users/me"
        )
        self.assert200(me_resp)
        self.assertIsNotNone(me_resp.json['emailAddress'])

    def test_user_auth_required_fail(self):
        me_resp = self.app.get(
            "/api/v1/users/me",
        )
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
        # self.assert500(user_auth_resp)
        # self.assertIn('Invalid pass', user_auth_resp.json['data'])

    def test_user_auth_bad_email(self):
        user_auth_resp = self.app.post(
            "/api/v1/users/auth",
            data=json.dumps({
                "email": "bademail@bad.com",
                "password": "somepassword"
            }),
            content_type="application/json"
        )
        self.assert403(user_auth_resp)
        self.assertTrue(user_auth_resp.json['message'] is not None)
        # self.assert500(user_auth_resp)
        # self.assertIn('No user', user_auth_resp.json['data'])

    def test_user_auth_banned(self):
        self.user.set_banned(True, 'reason for banning')
        user_auth_resp = self.app.post(
            "/api/v1/users/auth",
            data=json.dumps({
                "email": self.user.email_address,
                "password": self.user_password
            }),
            content_type="application/json"
        )
        # in test mode we get 500s instead of 403
        self.assert403(user_auth_resp)
        self.assertIn('banned', user_auth_resp.json['message'])

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
        updated_user["avatar"] = ''
        updated_user["socialMedias"] = []

        user_update_resp = self.app.put(
            "/api/v1/users/{}".format(self.user.id),
            data=json.dumps(updated_user),
            content_type='application/json'
        )
        self.assert200(user_update_resp, user_update_resp.json)

        user_json = user_update_resp.json
        print(user_json)
        self.assertFalse(user_json["avatar"])
        self.assertFalse(len(user_json["socialMedias"]))
        self.assertEqual(user_json["displayName"], updated_user["displayName"])
        self.assertEqual(user_json["title"], updated_user["title"])
        mock_remove_avatar.assert_called_with(test_user["avatar"]["link"], self.user.id)

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

    @patch('grant.email.send.send_email')
    def test_recover_user_banned(self, mock_send_email):
        mock_send_email.return_value.ok = True
        self.user.set_banned(True, 'Reason for banning')
        # 1. request reset email
        response = self.app.post(
            "/api/v1/users/recover",
            data=json.dumps({'email': self.user.email_address}),
            content_type='application/json'
        )
        # 404 outside testing mode
        self.assertStatus(response, 403)
        print(response.json)
        self.assertIn('banned', response.json['message'])

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

    @patch('grant.email.send.send_email')
    def test_recover_user_code_banned(self, mock_send_email):
        mock_send_email.return_value.ok = True

        # 1. request reset email
        response = self.app.post(
            "/api/v1/users/recover",
            data=json.dumps({'email': self.user.email_address}),
            content_type='application/json'
        )

        self.assertStatus(response, 200)
        er = self.user.email_recovery
        code = er.code

        self.user.set_banned(True, "Reason")

        # 2. reset password
        new_password = 'n3wp455w3rd'
        reset_resp = self.app.post(
            f"/api/v1/users/recover/{code}",
            data=json.dumps({'password': new_password}),
            content_type='application/json'
        )
        # 403 outside of testing mode
        self.assertStatus(reset_resp, 403)
        self.assertIn('banned', reset_resp.json['message'])

    @patch('grant.user.views.verify_social')
    def test_user_verify_social(self, mock_verify_social):
        mock_verify_social.return_value = 'billy'
        self.login_default_user()

        verify_social_resp = self.app.post(
            "/api/v1/users/social/GITHUB/verify",
            data=json.dumps({"code": '12345'}),
            content_type='application/json'
        )
        self.assert200(verify_social_resp)
        self.assertEqual(verify_social_resp.json["username"], 'billy')

        get_user_resp = self.app.get(
            "/api/v1/users/{}".format(self.user.id)
        )

        users_json = get_user_resp.json
        self.assertEqual(users_json["socialMedias"][0]["service"], 'GITHUB')
        self.assertEqual(users_json["socialMedias"][0]["username"], 'billy')
        self.assertEqual(users_json["socialMedias"][0]["url"], 'https://github.com/billy')

    def test_user_verify_social_no_auth(self):
        verify_social_resp = self.app.post(
            "/api/v1/users/social/GITHUB/verify",
            data=json.dumps({"code": '12345'}),
            content_type='application/json'
        )
        self.assert401(verify_social_resp)

    @patch('grant.user.views.get_social_login_url')
    def test_user_social_authurl(self, mock_get_social_login_url):
        expected_url = 'https://fake.login?token=12345'
        mock_get_social_login_url.return_value = expected_url
        self.login_default_user()
        social_authurl_resp = self.app.get(
            "/api/v1/users/social/SERVICE/authurl"
        )
        self.assert200(social_authurl_resp)
        self.assertEqual(social_authurl_resp.json["url"], expected_url)

    def test_get_user_settings_auth_required(self):
        resp = self.app.get(
            "/api/v1/users/{}/settings".format(self.user.id)
        )
        self.assert401(resp)

    def test_get_user_settings(self):
        self.login_default_user()
        resp = self.app.get(
            "/api/v1/users/{}/settings".format(self.user.id)
        )
        self.assert200(resp)
        self.assertIsNotNone(resp.json['emailSubscriptions'])

    def test_put_user_settings_auth_required(self):
        resp = self.app.put(
            "/api/v1/users/{}/settings".format(self.user.id),
            data=json.dumps({'emailSubscriptions': {}}),
            content_type='application/json'
        )
        self.assert401(resp)

    def test_put_user_settings_email_subscriptions(self):
        self.login_default_user()
        subs = animalify(get_default_email_subscriptions())
        subs['myCommentReply'] = False
        resp = self.app.put(
            "/api/v1/users/{}/settings".format(self.user.id),
            data=json.dumps({'emailSubscriptions': subs}),
            content_type='application/json'
        )
        self.assert200(resp)
        self.assertIsNotNone(resp.json['emailSubscriptions'])
        self.maxDiff = None
        self.assertEquals(resp.json['emailSubscriptions'], subs)

    def test_put_user_settings_email_subscriptions_bad_key(self):
        self.login_default_user()
        subs = animalify(get_default_email_subscriptions())
        subs['badKey'] = False
        resp = self.app.put(
            "/api/v1/users/{}/settings".format(self.user.id),
            data=json.dumps({'emailSubscriptions': subs}),
            content_type='application/json'
        )
        self.assert400(resp)
