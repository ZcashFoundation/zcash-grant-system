import json
from mock import patch

from grant.proposal.models import Proposal
from grant.user.models import SocialMedia, Avatar
from ..config import BaseUserConfig
from ..test_data import test_proposal, test_user


class TestProposalContributionAPI(BaseUserConfig):

    def test_create_proposal_contribution(self):
        self.login_default_user()
        proposal_res = self.app.post(
            "/api/v1/proposals/drafts",
            data=json.dumps(test_proposal),
            content_type='application/json'
        )
        proposal_json = proposal_res.json
        proposal_id = proposal_json["proposalId"]

        contribution = {
            "txId": "0x12345",
            "fromAddress": "0x23456",
            "amount": "1.2345"
        }

        contribution_res = self.app.post(
            "/api/v1/proposals/{}/contributions".format(proposal_id),
            data=json.dumps(contribution),
            content_type='application/json'
        )
        res = contribution_res.json
        exp = contribution

        def eq(k):
            self.assertEqual(exp[k], res[k])
        eq("txId")
        eq("fromAddress")
        eq("amount")
        self.assertEqual(proposal_id, res["proposalId"])

    def test_get_proposal_contribution(self):
        self.login_default_user()
        proposal_res = self.app.post(
            "/api/v1/proposals/drafts",
            data=json.dumps(test_proposal),
            content_type='application/json'
        )
        proposal_json = proposal_res.json
        proposal_id = proposal_json["proposalId"]

        contribution = {
            "txId": "0x12345",
            "fromAddress": "0x23456",
            "amount": "1.2345"
        }

        self.app.post(
            "/api/v1/proposals/{}/contributions".format(proposal_id),
            data=json.dumps(contribution),
            content_type='application/json'
        )

        contribution_res = self.app.get(
            "/api/v1/proposals/{0}/contributions/{1}".format(proposal_id, contribution["txId"])
        )
        res = contribution_res.json
        exp = contribution

        def eq(k):
            self.assertEqual(exp[k], res[k])
        eq("txId")
        eq("fromAddress")
        eq("amount")
        self.assertEqual(proposal_id, res["proposalId"])

    def test_get_proposal_contributions(self):
        self.login_default_user()
        proposal_res = self.app.post(
            "/api/v1/proposals/drafts",
            data=json.dumps(test_proposal),
            content_type='application/json'
        )
        proposal_json = proposal_res.json
        proposal_id = proposal_json["proposalId"]

        contribution = {
            "txId": "0x12345",
            "fromAddress": "0x23456",
            "amount": "1.2345"
        }

        self.app.post(
            "/api/v1/proposals/{}/contributions".format(proposal_id),
            data=json.dumps(contribution),
            content_type='application/json'
        )

        contributions_res = self.app.get(
            "/api/v1/proposals/{0}/contributions".format(proposal_id)
        )
        res = contributions_res.json[0]
        exp = contribution

        def eq(k):
            self.assertEqual(exp[k], res[k])
        eq("txId")
        eq("fromAddress")
        eq("amount")
        self.assertEqual(proposal_id, res["proposalId"])
