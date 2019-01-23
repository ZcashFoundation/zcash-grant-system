import json

from grant.email.models import EmailVerification
from grant.user.models import db
from mock import patch

from ..config import BaseUserConfig
from ..test_data import test_user


class TestEmailAPI(BaseUserConfig):
    @patch('grant.email.send.send_email')
    def create_user(self, mock_send_email):
        mock_send_email.return_value.ok = True
        # Delete the user config user
        db.session.delete(self.user)
        db.session.commit()

        create_resp = self.app.post(
            "/api/v1/users/",
            data=json.dumps(test_user),
            content_type='application/json'
        )
        self.assertStatus(create_resp, 201)
        created_id = create_resp.json['userid']
        ev = EmailVerification.query.filter_by(user_id=created_id).first()
        return ev.code

    def test_verify(self):
        code = self.create_user()
        resp = self.app.post('/api/v1/email/{}/verify'.format(code))
        self.assertStatus(resp, 200)

    def test_verify_bad_code(self):
        resp = self.app.post('/api/v1/email/{}/verify'.format('12345'))
        self.assertStatus(resp, 400)

    def test_unsubscribe(self):
        code = self.create_user()
        resp = self.app.post('/api/v1/email/{}/unsubscribe'.format(code))
        self.assertStatus(resp, 200)

        ev = EmailVerification.query.filter_by(code=code).first()
        for k, v in ev.user.settings.email_subscriptions.items():
            self.assertFalse(v)

    def test_unsubscribe_bad_code(self):
        resp = self.app.post('/api/v1/email/{}/unsubscribe'.format('12345'))
        self.assertStatus(resp, 400)
