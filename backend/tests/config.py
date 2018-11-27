from flask_testing import TestCase

from grant.app import create_app
from grant.user.models import User, SocialMedia, db, Avatar
from .test_data import test_user, message


class BaseTestConfig(TestCase):

    def create_app(self):
        app = create_app()
        app.config.from_object('tests.settings')
        return app

    def setUp(self):
        db.drop_all()
        self.app = self.create_app().test_client()
        db.create_all()

    def tearDown(self):
        db.session.remove()
        db.drop_all()
    
    def assertStatus(self, response, status_code, message=None):
        """
        Overrides TestCase's default to print out response JSON.
        """

        message = message or 'HTTP Status %s expected but got %s. Response json: %s' \
                             % (status_code, response.status_code, response.json)
        self.assertEqual(response.status_code, status_code, message)

    assert_status = assertStatus

class BaseUserConfig(BaseTestConfig):
    headers = {
        "MsgSignature": message["sig"],
        "RawTypedData": message["data"]
    }

    def setUp(self):
        super(BaseUserConfig, self).setUp()
        self.user = User.create(
            account_address=test_user["accountAddress"],
            email_address=test_user["emailAddress"],
            display_name=test_user["displayName"],
            title=test_user["title"],
            _send_email=False
        )
        sm = SocialMedia(social_media_link=test_user['socialMedias'][0]['link'], user_id=self.user.id)
        db.session.add(sm)
        avatar = Avatar(image_url=test_user["avatar"]["link"], user_id=self.user.id)
        db.session.add(avatar)
        db.session.commit()

    def remove_default_user(self):
        User.query.filter_by(id=self.user.id).delete()
        db.session.commit()
