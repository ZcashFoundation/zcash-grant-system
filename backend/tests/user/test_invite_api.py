import json
from mock import patch

from grant.proposal.models import Proposal, ProposalTeamInvite, db
from grant.user.models import SocialMedia, Avatar
from ..config import BaseProposalCreatorConfig
from ..test_data import test_proposal, test_user


class TestAPI(BaseProposalCreatorConfig):
  def test_get_user_invites_by_address(self):
    invite = ProposalTeamInvite(
      proposal_id=self.proposal.id,
      address=self.user.account_address
    )
    db.session.add(invite)
    db.session.commit()

    invites_res = self.app.get(
      "/api/v1/users/{}/invites".format(self.user.account_address),
      headers=self.headers
    )
    self.assertStatus(invites_res, 200)
    self.assertEqual(invites_res.json[0]['address'], self.user.account_address)
    self.assertEqual(invites_res.json[0]['proposal']['proposalId'], self.proposal.id)

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

  # TODO: Make a second user in self.other_user for use with stuff like this
  # def test_put_user_invite_response_positive(self):
  #   proposal_id = self.proposal.id
  #   invite = ProposalTeamInvite(
  #     proposal_id=proposal_id,
  #     address=self.user.account_address
  #   )
  #   db.session.add(invite)
  #   db.session.commit()

  #   invites_res = self.app.put(
  #     "/api/v1/users/{}/invites/{}/respond".format(self.user.account_address, invite.id),
  #     headers=self.headers,
  #     data=json.dumps({ "response": True }),
  #     content_type='application/json'
  #   )
  #   self.assertStatus(invites_res, 200)

  #   # Make sure we made the team, coach
  #   proposal = Proposal.query.filter_by(id=proposal_id).first()
  #   self.assertTrue(False, msg=str(proposal.team))
