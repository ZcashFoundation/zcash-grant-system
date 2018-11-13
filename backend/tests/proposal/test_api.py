import json

from grant.proposal.models import Proposal
from grant.user.models import SocialMedia, Avatar
from ..config import BaseUserConfig
from ..test_data import test_proposal


class TestAPI(BaseUserConfig):
    def test_create_new_proposal(self):
        self.assertIsNone(Proposal.query.filter_by(
            proposal_address=test_proposal["crowdFundContractAddress"]
        ).first())

        resp = self.app.post(
            "/api/v1/proposals/",
            data=json.dumps(test_proposal),
            headers=self.headers,
            content_type='application/json'
        )
        self.assertEqual(resp.status_code, 201)

        proposal_db = Proposal.query.filter_by(
            proposal_address=test_proposal["crowdFundContractAddress"]
        ).first()
        self.assertEqual(proposal_db.title, test_proposal["title"])

        # SocialMedia
        social_media_db = SocialMedia.query.filter_by(user_id=self.user.id).first()
        self.assertTrue(social_media_db)

        # Avatar
        avatar = Avatar.query.filter_by(user_id=self.user.id).first()
        self.assertTrue(avatar)

    def test_create_new_proposal_comment(self):
        proposal_res = self.app.post(
            "/api/v1/proposals/",
            data=json.dumps(test_proposal),
            headers=self.headers,
            content_type='application/json'
        )
        proposal_json = proposal_res.json
        proposal_id = proposal_json["proposalId"]
        proposal_user_id = proposal_json["team"][0]["userid"]

        comment_res = self.app.post(
            "/api/v1/proposals/{}/comments".format(proposal_id),
            data=json.dumps({
                "userId": proposal_user_id,
                "content": "What a comment"
            }),
            content_type='application/json'
        )

        self.assertTrue(comment_res.json)

    def test_create_new_proposal_duplicate(self):
        self.app.post(
            "/api/v1/proposals/",
            data=json.dumps(test_proposal),
            headers=self.headers,
            content_type='application/json'
        )

        proposal_res2 = self.app.post(
            "/api/v1/proposals/",
            data=json.dumps(test_proposal),
            headers=self.headers,
            content_type='application/json'
        )

        self.assertEqual(proposal_res2.status_code, 409)
