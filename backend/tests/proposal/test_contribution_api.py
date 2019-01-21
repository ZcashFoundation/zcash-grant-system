import json
from mock import patch

from grant.proposal.models import Proposal
from grant.user.models import SocialMedia, Avatar
from grant.utils.requests import blockchain_get
from ..config import BaseUserConfig
from ..test_data import test_proposal, test_user
from ..mocks import mock_request

mock_contribution_addresses = mock_request({
    'transparent': 't123',
    'sprout': 'z123',
    'memo': '123',
})

class TestProposalContributionAPI(BaseUserConfig):
    @patch('requests.get', side_effect=mock_contribution_addresses)
    def test_create_proposal_contribution(self, mock_blockchain_get):
        self.login_default_user()
        proposal_res = self.app.post(
            "/api/v1/proposals/drafts",
            data=json.dumps(test_proposal),
            content_type='application/json'
        )
        proposal_json = proposal_res.json
        proposal_id = proposal_json["proposalId"]

        contribution = {
            "amount": "1.2345"
        }

        post_res = self.app.post(
            "/api/v1/proposals/{}/contributions".format(proposal_id),
            data=json.dumps(contribution),
            content_type='application/json'
        )

        self.assertStatus(post_res, 201)

    @patch('requests.get', side_effect=mock_contribution_addresses)
    def test_create_duplicate_contribution(self, mock_blockchain_get):
        self.login_default_user()
        proposal_res = self.app.post(
            "/api/v1/proposals/drafts",
            data=json.dumps(test_proposal),
            content_type='application/json'
        )
        proposal_json = proposal_res.json
        proposal_id = proposal_json["proposalId"]

        contribution = {
            "amount": "1.2345"
        }

        post_res = self.app.post(
            "/api/v1/proposals/{}/contributions".format(proposal_id),
            data=json.dumps(contribution),
            content_type='application/json'
        )

        self.assertStatus(post_res, 201)

        dupe_res = self.app.post(
            "/api/v1/proposals/{}/contributions".format(proposal_id),
            data=json.dumps(contribution),
            content_type='application/json'
        )
        self.assert200(dupe_res)
        self.assertEqual(dupe_res.json['id'], post_res.json['id'])

    @patch('requests.get', side_effect=mock_contribution_addresses)
    def test_get_proposal_contribution(self, mock_blockchain_get):
        self.login_default_user()
        proposal_res = self.app.post(
            "/api/v1/proposals/drafts",
            data=json.dumps(test_proposal),
            content_type='application/json'
        )
        proposal_json = proposal_res.json
        proposal_id = proposal_json["proposalId"]

        contribution = {
            "amount": "1.2345"
        }

        post_res = self.app.post(
            "/api/v1/proposals/{}/contributions".format(proposal_id),
            data=json.dumps(contribution),
            content_type='application/json'
        )
        contribution_id = post_res.json['id']

        contribution_res = self.app.get(
            f'/api/v1/proposals/{proposal_id}/contributions/{contribution_id}'
        )

        contribution = contribution_res.json
        self.assertEqual(contribution['id'], contribution_id)
        self.assertEqual(contribution['status'], 'PENDING')
