import json
import random

from grant.proposal.models import Proposal, CATEGORIES
from grant.user.models import User, SocialMedia
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

team = [
    {
        "accountAddress": "0x1",
        "displayName": 'Groot',
        "emailAddress": 'iam@groot.com',
        "title": 'I am Groot!',
        "avatar": {
            "link": 'https://avatars2.githubusercontent.com/u/1393943?s=400&v=4'
        },
        "socialMedias": [
            {
                "link": 'https://github.com/groot'
            }
        ]
    }
]

proposal = {
    "team": team,
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

        proposal_db = Proposal.query.filter_by(
            proposal_id=proposal["crowdFundContractAddress"]
        ).first()
        self.assertEqual(proposal_db.title, proposal["title"])

        # User
        user_db = User.query.filter_by(email_address=team[0]["emailAddress"]).first()
        self.assertEqual(user_db.display_name, team[0]["displayName"])
        self.assertEqual(user_db.title, team[0]["title"])
        self.assertEqual(user_db.account_address, team[0]["accountAddress"])

        # SocialMedia
        social_media_db = SocialMedia.query.filter_by(social_media_link=team[0]["socialMedias"][0]["link"]).first()
        self.assertTrue(social_media_db)

        # Avatar
        self.assertEqual(user_db.avatar.image_url, team[0]["avatar"]["link"])

    def test_create_new_proposal_comment(self):
        proposal_res = self.app.post(
            "/api/v1/proposals/",
            data=json.dumps(proposal),
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
