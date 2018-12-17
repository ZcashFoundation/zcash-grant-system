import json
from flask_testing import TestCase

from grant.app import create_app
from grant.user.models import User, SocialMedia, db, Avatar
from grant.proposal.models import Proposal
from .test_data import test_user, test_other_user, test_proposal, message


class BaseTestConfig(TestCase):

    def create_app(self):
        app = create_app(['grant.settings', 'tests.settings'])
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
                             % (status_code, response.status_code, response.json or response.data)
        self.assertEqual(response.status_code, status_code, message)

    assert_status = assertStatus


class BaseUserConfig(BaseTestConfig):
    def setUp(self):
        super(BaseUserConfig, self).setUp()
        self._user = User.create(
            email_address=test_user["emailAddress"],
            password=test_user["password"],
            display_name=test_user["displayName"],
            title=test_user["title"],
        )
        sm = SocialMedia(social_media_link=test_user['socialMedias'][0]['link'], user_id=self._user.id)
        db.session.add(sm)
        avatar = Avatar(image_url=test_user["avatar"]["link"], user_id=self._user.id)
        db.session.add(avatar)
        self.user_password = test_user["password"]

        self.other_user = User.create(
            email_address=test_other_user["emailAddress"],
            password=test_other_user["password"],
            display_name=test_other_user["displayName"],
            title=test_other_user["title"]
        )
        db.session.commit()
        self._user_id = self._user.id

    # always return fresh (avoid detached instance issues)
    @property
    def user(self):
        return User.query.filter_by(id=self._user_id).first()

    def login_default_user(self, cust_pass=None):
        return self.app.post(
            "/api/v1/users/auth",
            data=json.dumps({
                "email": self.user.email_address,
                "password": cust_pass or self.user_password
            }),
            content_type="application/json"
        )

    def remove_default_user(self):
        User.query.filter_by(id=self.user.id).delete()
        db.session.commit()


class BaseProposalCreatorConfig(BaseUserConfig):
    def setUp(self):
        super().setUp()
        self._proposal = Proposal.create(
            status="DRAFT",
            title=test_proposal["title"],
            content=test_proposal["content"],
            brief=test_proposal["brief"],
            category=test_proposal["category"],
            target=test_proposal["target"],
            payout_address=test_proposal["payoutAddress"],
            trustees=test_proposal["trustees"][0],
            deadline_duration=test_proposal["deadlineDuration"],
            vote_duration=test_proposal["voteDuration"]
        )
        self._proposal.team.append(self.user)
        db.session.add(self._proposal)

        self._other_proposal = Proposal.create(status="DRAFT")
        self._other_proposal.team.append(self.other_user)
        db.session.add(self._other_proposal)
        db.session.commit()
        self._proposal_id = self._proposal.id
        self._other_proposal_id = self._other_proposal.id

    # always return fresh (avoid detached instance issues)
    @property
    def proposal(self):
        return Proposal.query.filter_by(id=self._proposal_id).first()

    @property
    def other_proposal(self):
        return Proposal.query.filter_by(id=self._other_proposal_id).first()
