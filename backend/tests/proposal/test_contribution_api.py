import json
from mock import patch

from grant.proposal.models import Proposal
from grant.utils.enums import ProposalStatus
from ..config import BaseProposalCreatorConfig
from ..test_data import test_proposal
from ..mocks import mock_request

mock_contribution_addresses = mock_request({
    'transparent': 't123',
    'sprout': 'z123',
    'memo': '123',
})


class TestProposalContributionAPI(BaseProposalCreatorConfig):
    @patch('requests.get', side_effect=mock_contribution_addresses)
    def test_create_proposal_contribution(self, mock_blockchain_get):
        self.login_default_user()

        contribution = {
            "amount": "1.2345"
        }

        post_res = self.app.post(
            "/api/v1/proposals/{}/contributions".format(self.proposal.id),
            data=json.dumps(contribution),
            content_type='application/json'
        )

        self.assertStatus(post_res, 201)

    @patch('requests.get', side_effect=mock_contribution_addresses)
    def test_create_duplicate_contribution(self, mock_blockchain_get):
        self.login_default_user()

        contribution = {
            "amount": "1.2345"
        }

        post_res = self.app.post(
            "/api/v1/proposals/{}/contributions".format(self.proposal.id),
            data=json.dumps(contribution),
            content_type='application/json'
        )

        self.assertStatus(post_res, 201)

        dupe_res = self.app.post(
            "/api/v1/proposals/{}/contributions".format(self.proposal.id),
            data=json.dumps(contribution),
            content_type='application/json'
        )
        self.assert200(dupe_res)
        self.assertEqual(dupe_res.json['id'], post_res.json['id'])

    @patch('requests.get', side_effect=mock_contribution_addresses)
    def test_get_proposal_contribution(self, mock_blockchain_get):
        self.login_default_user()

        contribution = {
            "amount": "1.2345"
        }

        post_res = self.app.post(
            "/api/v1/proposals/{}/contributions".format(self.proposal.id),
            data=json.dumps(contribution),
            content_type='application/json'
        )
        contribution_id = post_res.json['id']

        contribution_res = self.app.get(
            f'/api/v1/proposals/{self.proposal.id}/contributions/{contribution_id}'
        )

        contribution = contribution_res.json
        self.assertEqual(contribution['id'], contribution_id)
        self.assertEqual(contribution['status'], ProposalStatus.PENDING)
