import json
import random

from grant.proposal.models import Proposal, CATEGORIES
from ..config import BaseTestConfig

milestones = [
    {
        "title": "All the money straightaway",
        "description": "cool stuff with it",
        "date": "June 2019",
        "payoutPercent": "100",
        "immediatePayout": False
    }
]
proposal = {
    "accountAddress": "0x1",
    "crowdFundContractAddress": "0x20000",
    "content": "## My Proposal",
    "title": "Give Me Money",
    "milestones": milestones,
    "category": random.choice(CATEGORIES)
}


class TestAPI(BaseTestConfig):
    def test_create_new_proposal(self):
        self.assertIsNone(Proposal.query.filter_by(
            proposal_id=proposal["crowdFundContractAddress"]
        ).first())

        self.app.post(
            "/api/v1/proposals/",
            data=json.dumps(proposal),
            content_type='application/json'
        )

        self.assertEqual(Proposal.query.filter_by(
            proposal_id=proposal["crowdFundContractAddress"]
        ).first().title, proposal["title"])

    def test_create_new_proposal_comment(self):
        proposal_res = self.app.post(
            "/api/v1/proposals/",
            data=json.dumps(proposal),
            content_type='application/json'
        )
        proposal_json = proposal_res.json
        proposal_id = proposal_json["proposalId"]
        proposal_author_id = proposal_json["author"]["userid"]

        comment_res = self.app.post(
            "/api/proposals/{}/comments".format(proposal_id),
            data=json.dumps({
                "authorId": proposal_author_id,
                "content": "What a comment"
            }),
            content_type='application/json'
        )

        self.assertTrue(comment_res.json)
