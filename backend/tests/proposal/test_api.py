import json
from mock import patch

from grant.proposal.models import Proposal
from ..config import BaseProposalCreatorConfig
from ..test_data import test_proposal, test_user


class TestProposalAPI(BaseProposalCreatorConfig):
    def test_create_new_draft(self):
        self.login_default_user()
        resp = self.app.post(
            "/api/v1/proposals/drafts",
        )
        self.assertStatus(resp, 201)

        proposal_db = Proposal.query.filter_by(id=resp.json['proposalId'])
        self.assertIsNotNone(proposal_db)

    def test_no_auth_create_new_draft(self):
        resp = self.app.post(
            "/api/v1/proposals/drafts"
        )
        self.assert401(resp)

    def test_update_proposal_draft(self):
        new_title = "Updated!"
        new_proposal = test_proposal.copy()
        new_proposal["title"] = new_title

        self.login_default_user()
        resp = self.app.put(
            "/api/v1/proposals/{}".format(self.proposal.id),
            data=json.dumps(new_proposal),
            content_type='application/json'
        )

        self.assert200(resp)
        self.assertEqual(resp.json["title"], new_title)
        self.assertEqual(self.proposal.title, new_title)

    def test_no_auth_update_proposal_draft(self):
        new_title = "Updated!"
        new_proposal = test_proposal.copy()
        new_proposal["title"] = new_title

        resp = self.app.put(
            "/api/v1/proposals/{}".format(self.proposal.id),
            data=json.dumps(new_proposal),
            content_type='application/json'
        )
        self.assert401(resp)

    def test_invalid_proposal_update_proposal_draft(self):
        new_title = "Updated!"
        new_proposal = test_proposal.copy()
        new_proposal["title"] = new_title

        self.login_default_user()
        resp = self.app.put(
            "/api/v1/proposals/12345",
            data=json.dumps(new_proposal),
            content_type='application/json'
        )
        self.assert404(resp)

    def test_publish_proposal_draft(self):
        self.login_default_user()
        resp = self.app.put(
            "/api/v1/proposals/{}/publish".format(self.proposal.id),
            data=json.dumps({"contractAddress": "0x0"}),
            content_type='application/json'
        )
        self.assert200(resp)

    def test_no_auth_publish_proposal_draft(self):
        resp = self.app.put(
            "/api/v1/proposals/{}/publish".format(self.proposal.id),
            data=json.dumps({"contractAddress": "0x0"}),
            content_type='application/json'
        )
        self.assert401(resp)

    def test_invalid_proposal_publish_proposal_draft(self):
        self.login_default_user()
        resp = self.app.put(
            "/api/v1/proposals/12345/publish",
            data=json.dumps({"contractAddress": "0x0"}),
            content_type='application/json'
        )
        self.assert404(resp)
