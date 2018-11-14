import json

from grant.proposal.models import Proposal
from grant.user.models import SocialMedia, Avatar
from ..config import BaseUserConfig
from ..test_data import test_proposal, test_user


class TestAPI(BaseUserConfig):
    def test_create_new_draft(self):
        resp = self.app.post(
            "/api/v1/proposals/drafts",
            data=json.dumps({}),
            headers=self.headers,
            content_type='application/json'
        )
        self.assertEqual(resp.status_code, 201)

        proposal_db = Proposal.query.filter_by(id=resp.json['proposalId'])
        self.assertIsNotNone(proposal_db)

    def test_create_new_proposal_comment(self):
        proposal = Proposal(
            status="LIVE"
        )

        comment_res = self.app.post(
            "/api/v1/proposals/{}/comments".format(proposal.id),
            data=json.dumps({ "content": "What a comment" }),
            headers=self.headers,
            content_type='application/json'
        )

        self.assertTrue(comment_res.json)
