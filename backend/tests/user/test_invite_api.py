import json
from mock import patch

from grant.proposal.models import Proposal, ProposalTeamInvite, db
from grant.user.models import SocialMedia, Avatar
from ..config import BaseProposalCreatorConfig
from ..test_data import test_proposal, test_user


class TestAPI(BaseProposalCreatorConfig):
    def test_get_user_invites_by_email(self):
        invite = ProposalTeamInvite(
            proposal_id=self.proposal.id,
            address=self.user.email_address
        )
        db.session.add(invite)
        db.session.commit()

        invites_res = self.app.get(
            "/api/v1/users/{}/invites".format(self.user.email_address),
            headers=self.headers
        )
        self.assertStatus(invites_res, 200)
        self.assertEqual(invites_res.json[0]['address'], self.user.email_address)
        self.assertEqual(invites_res.json[0]['proposal']['proposalId'], self.proposal.id)

    # Should fail if not authorized
    def test_no_auth_get_user_invites(self):
        invites_res = self.app.get(
            "/api/v1/users/{}/invites".format(self.user.email_address)
        )
        self.assertStatus(invites_res, 401)

    def test_put_user_invite_response_accept(self):
        proposal_id = self.other_proposal.id
        invite = ProposalTeamInvite(
            proposal_id=proposal_id,
            address=self.user.email_address
        )
        db.session.add(invite)
        db.session.commit()

        invites_res = self.app.put(
            "/api/v1/users/{}/invites/{}/respond".format(self.user.id, invite.id),
            headers=self.headers,
            data=json.dumps({"response": True}),
            content_type='application/json'
        )
        self.assertStatus(invites_res, 200)

        # Make sure we made the team, coach
        proposal = Proposal.query.filter_by(id=proposal_id).first()
        self.assertTrue(len(proposal.team) == 2)  # TODO: More thorough check than length

    def test_put_user_invite_response_reject(self):
        proposal_id = self.other_proposal.id
        invite = ProposalTeamInvite(
            proposal_id=proposal_id,
            address=self.user.email_address
        )
        db.session.add(invite)
        db.session.commit()

        invites_res = self.app.put(
            "/api/v1/users/{}/invites/{}/respond".format(self.user.id, invite.id),
            headers=self.headers,
            data=json.dumps({"response": False}),
            content_type='application/json'
        )
        self.assertStatus(invites_res, 200)

        # Make sure we made the team, coach
        proposal = Proposal.query.filter_by(id=proposal_id).first()
        self.assertTrue(len(proposal.team) == 1)  # TODO: More thorough check than length

    def test_no_auth_put_user_invite_response(self):
        proposal_id = self.other_proposal.id
        invite = ProposalTeamInvite(
            proposal_id=proposal_id,
            address=self.user.email_address
        )
        db.session.add(invite)
        db.session.commit()

        invites_res = self.app.put(
            "/api/v1/users/{}/invites/{}/respond".format(self.user.id, invite.id),
            data=json.dumps({"response": True}),
            content_type='application/json'
        )
        self.assertStatus(invites_res, 401)

    def test_invalid_invite_put_user_invite_response(self):
        invites_res = self.app.put(
            "/api/v1/users/{}/invites/1234567890/respond".format(self.user.id),
            headers=self.headers,
            data=json.dumps({"response": True}),
            content_type='application/json'
        )
        self.assertStatus(invites_res, 404)
