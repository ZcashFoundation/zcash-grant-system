import json
from mock import patch

from grant.proposal.models import Proposal, ProposalTeamInvite, db
from ..config import BaseProposalCreatorConfig
from ..test_data import test_proposal, test_user


class TestAPI(BaseProposalCreatorConfig):
    def test_create_invite_by_email_address(self):
        invite_res = self.app.post(
            "/api/v1/proposals/{}/invite".format(self.proposal.id),
            data=json.dumps({"address": "test@test.test"}),
            headers=self.headers,
            content_type='application/json'
        )
        self.assertStatus(invite_res, 201)

    # Rejects if not authorized
    def test_no_auth_create_invite_fails(self):
        invite_res = self.app.post(
            "/api/v1/proposals/{}/invite".format(self.proposal.id),
            data=json.dumps({"address": "0x8B0B72F8bDE212991135668922fD5acE557DE6aB"}),
            content_type='application/json'
        )
        self.assertStatus(invite_res, 401)

    # Rejects if non-existant proposal id
    def test_invalid_proposal_create_invite_fails(self):
        invite_res = self.app.post(
            "/api/v1/proposals/12345/invite",
            data=json.dumps({"address": "0x8B0B72F8bDE212991135668922fD5acE557DE6aB"}),
            headers=self.headers,
            content_type='application/json'
        )
        self.assertStatus(invite_res, 404)

    def test_delete_invite(self):
        address = "0x8B0B72F8bDE212991135668922fD5acE557DE6aB"
        invite = ProposalTeamInvite(
            proposal_id=self.proposal.id,
            address="0x8B0B72F8bDE212991135668922fD5acE557DE6aB"
        )
        db.session.add(invite)
        db.session.commit()

        delete_res = self.app.delete(
            "/api/v1/proposals/{}/invite/{}".format(self.proposal.id, address),
            headers=self.headers
        )
        self.assertStatus(delete_res, 202)

    # Rejects if unknown proposal
    def test_invalid_invite_delete_invite(self):
        delete_res = self.app.delete(
            "/api/v1/proposals/{}/invite/12345".format(self.proposal),
            headers=self.headers
        )
        self.assertStatus(delete_res, 404)

    # Rejects if not authorized
    def test_no_auth_delete_invite_fails(self):
        delete_res = self.app.delete(
            "/api/v1/proposals/{}/invite/12345".format(self.proposal)
        )
        self.assertStatus(delete_res, 401)

    # Rejects if the invite was already accepted
    def test_accepted_invite_delete_invite(self):
        address = "0x8B0B72F8bDE212991135668922fD5acE557DE6aB"
        invite = ProposalTeamInvite(
            proposal_id=self.proposal.id,
            address="0x8B0B72F8bDE212991135668922fD5acE557DE6aB",
            accepted=True
        )
        db.session.add(invite)
        db.session.commit()

        delete_res = self.app.delete(
            "/api/v1/proposals/{}/invite/{}".format(self.proposal.id, address),
            headers=self.headers
        )
        self.assertStatus(delete_res, 403)
