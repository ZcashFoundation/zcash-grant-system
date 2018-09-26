from flask_testing import TestCase

from grant.app import create_app, db


class BaseTestConfig(TestCase):

    def create_app(self):
        app = create_app()
        app.config.from_object('tests.settings')
        return app

    def setUp(self):
        self.app = self.create_app().test_client()
        db.create_all()

    def tearDown(self):
        db.session.remove()
        db.drop_all()
