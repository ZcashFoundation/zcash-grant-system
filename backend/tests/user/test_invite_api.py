import json

from grant.proposal.models import ProposalTeamInvite, db
from ..config import BaseProposalCreatorConfig


class TestUserInviteAPI(BaseProposalCreatorConfig):
    def test_get_user_invites_by_email(self):
        invite = ProposalTeamInvite(
            proposal_id=self.proposal.id,
            address=self.user.email_address
        )
        db.session.add(invite)
        db.session.commit()

        self.login_default_user()

        invites_res = self.app.get(
            "/api/v1/users/{}/invites".format(self.user.email_address),
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
        invite = ProposalTeamInvite(
            proposal_id=self.other_proposal.id,
            address=self.user.email_address
        )
        db.session.add(invite)
        db.session.commit()
        invite_id = invite.id

        self.login_default_user()
        invites_res = self.app.put(
            "/api/v1/users/{}/invites/{}/respond".format(self.user.id, invite_id),
            data=json.dumps({"response": True}),
            content_type='application/json'
        )
        self.assertStatus(invites_res, 200)

        # Make sure we made the team, coach
        self.assertTrue(len(self.other_proposal.team) == 2)  # TODO: More thorough check than length

    def test_put_user_invite_response_reject(self):
        invite = ProposalTeamInvite(
            proposal_id=self.other_proposal.id,
            address=self.user.email_address
        )
        db.session.add(invite)
        db.session.commit()
        invite_id = invite.id

        self.login_default_user()
        invites_res = self.app.put(
            "/api/v1/users/{}/invites/{}/respond".format(self.user.id, invite_id),
            data=json.dumps({"response": False}),
            content_type='application/json'
        )
        self.assertStatus(invites_res, 200)

        # Make sure we made the team, coach
        self.assertTrue(len(self.other_proposal.team) == 1)  # TODO: More thorough check than length

    def test_no_auth_put_user_invite_response(self):
        invite = ProposalTeamInvite(
            proposal_id=self.other_proposal.id,
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
        self.login_default_user()
        invites_res = self.app.put(
            "/api/v1/users/{}/invites/1234567890/respond".format(self.user.id),
            data=json.dumps({"response": True}),
            content_type='application/json'
        )
        self.assertStatus(invites_res, 404)
