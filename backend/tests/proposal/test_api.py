import json

from mock import patch

from grant.proposal.models import Proposal, db
from grant.settings import PROPOSAL_STAKING_AMOUNT
from grant.utils.enums import ProposalStatus
from ..config import BaseProposalCreatorConfig
from ..test_data import test_proposal, mock_blockchain_api_requests, mock_invalid_address


# Used when a test mocks request.get in multiple ways
def mock_contribution_addresses_and_valid_address(path):
    if path == '/contribution/addresses':
        return mock_valid_address
    else:
        return mock_contribution_addresses


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
        print(resp)
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

    @patch('requests.get', side_effect=mock_blockchain_api_requests)
    def test_update_live_proposal_fails(self, mock_get):
        self.login_default_user()
        self.proposal.status = ProposalStatus.APPROVED
        resp = self.app.put("/api/v1/proposals/{}/publish".format(self.proposal.id))
        self.assert200(resp)
        self.assertEqual(resp.json["status"], "LIVE")

        resp = self.app.put(
            "/api/v1/proposals/{}".format(self.proposal.id),
            data=json.dumps(test_proposal),
            content_type='application/json'
        )
        self.assert400(resp)

    def test_update_pending_proposal_fails(self):
        self.login_default_user()
        self.proposal.status = ProposalStatus.PENDING
        db.session.add(self.proposal)
        db.session.commit()
        resp = self.app.get("/api/v1/proposals/{}".format(self.proposal.id))
        self.assert200(resp)
        self.assertEqual(resp.json["status"], "PENDING")
        resp = self.app.put(
            "/api/v1/proposals/{}".format(self.proposal.id),
            data=json.dumps(test_proposal),
            content_type='application/json'
        )
        self.assert400(resp)

    def test_update_rejected_proposal_succeeds(self):
        self.login_default_user()
        self.proposal.status = ProposalStatus.REJECTED
        db.session.add(self.proposal)
        db.session.commit()
        resp = self.app.get("/api/v1/proposals/{}".format(self.proposal.id))
        self.assert200(resp)
        self.assertEqual(resp.json["status"], "REJECTED")
        resp = self.app.put(
            "/api/v1/proposals/{}".format(self.proposal.id),
            data=json.dumps(test_proposal),
            content_type='application/json'
        )
        self.assert200(resp)

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

    # /submit_for_approval
    @patch('requests.get', side_effect=mock_blockchain_api_requests)
    def test_proposal_draft_submit_for_approval(self, mock_get):
        self.login_default_user()
        resp = self.app.put("/api/v1/proposals/{}/submit_for_approval".format(self.proposal.id))
        self.assert200(resp)
        self.assertEqual(resp.json['status'], ProposalStatus.STAKING)

    @patch('requests.get', side_effect=mock_blockchain_api_requests)
    def test_no_auth_proposal_draft_submit_for_approval(self, mock_get):
        resp = self.app.put("/api/v1/proposals/{}/submit_for_approval".format(self.proposal.id))
        self.assert401(resp)

    @patch('requests.get', side_effect=mock_blockchain_api_requests)
    def test_invalid_proposal_draft_submit_for_approval(self, mock_get):
        self.login_default_user()
        resp = self.app.put("/api/v1/proposals/12345/submit_for_approval")
        self.assert404(resp)

    @patch('requests.get', side_effect=mock_blockchain_api_requests)
    def test_invalid_status_proposal_draft_submit_for_approval(self, mock_get):
        self.login_default_user()
        self.proposal.status = ProposalStatus.PENDING  # should be ProposalStatus.DRAFT
        resp = self.app.put("/api/v1/proposals/{}/submit_for_approval".format(self.proposal.id))
        self.assert400(resp)

    @patch('requests.get', side_effect=mock_invalid_address)
    def test_invalid_address_proposal_draft_submit_for_approval(self, mock_get):
        self.login_default_user()
        resp = self.app.put("/api/v1/proposals/{}/submit_for_approval".format(self.proposal.id))
        self.assert400(resp)

    # /stake
    @patch('requests.get', side_effect=mock_blockchain_api_requests)
    def test_proposal_stake(self, mock_get):
        self.login_default_user()
        self.proposal.status = ProposalStatus.STAKING
        resp = self.app.get(f"/api/v1/proposals/{self.proposal.id}/stake")
        print(resp)
        self.assert200(resp)
        self.assertEquals(resp.json['amount'], str(PROPOSAL_STAKING_AMOUNT.normalize()))

    @patch('requests.get', side_effect=mock_blockchain_api_requests)
    def test_proposal_stake_no_auth(self, mock_get):
        self.proposal.status = ProposalStatus.STAKING
        resp = self.app.get(f"/api/v1/proposals/{self.proposal.id}/stake")
        print(resp)
        self.assert401(resp)

    @patch('requests.get', side_effect=mock_blockchain_api_requests)
    def test_proposal_stake_bad_status(self, mock_get):
        self.login_default_user()
        self.proposal.status = ProposalStatus.PENDING  # should be staking
        resp = self.app.get(f"/api/v1/proposals/{self.proposal.id}/stake")
        print(resp)
        self.assert400(resp)

    @patch('requests.get', side_effect=mock_blockchain_api_requests)
    def test_proposal_stake_funded(self, mock_get):
        self.login_default_user()
        # fake stake contribution with confirmation
        self.stake_proposal()
        resp = self.app.get(f"/api/v1/proposals/{self.proposal.id}/stake")
        print(resp)
        self.assert400(resp)

    # /publish
    @patch('requests.get', side_effect=mock_blockchain_api_requests)
    def test_publish_proposal_approved(self, mock_get):
        self.login_default_user()
        # proposal needs to be APPROVED
        self.proposal.status = ProposalStatus.APPROVED
        resp = self.app.put("/api/v1/proposals/{}/publish".format(self.proposal.id))
        self.assert200(resp)

    @patch('requests.get', side_effect=mock_blockchain_api_requests)
    def test_no_auth_publish_proposal(self, mock_get):
        resp = self.app.put("/api/v1/proposals/{}/publish".format(self.proposal.id))
        self.assert401(resp)

    @patch('requests.get', side_effect=mock_blockchain_api_requests)
    def test_invalid_proposal_publish_proposal(self, mock_get):
        self.login_default_user()
        resp = self.app.put("/api/v1/proposals/12345/publish")
        self.assert404(resp)

    @patch('requests.get', side_effect=mock_blockchain_api_requests)
    def test_invalid_status_proposal_publish_proposal(self, mock_get):
        self.login_default_user()
        self.proposal.status = ProposalStatus.PENDING  # should be ProposalStatus.APPROVED
        resp = self.app.put("/api/v1/proposals/{}/publish".format(self.proposal.id))
        self.assert400(resp)

    @patch('requests.get', side_effect=mock_blockchain_api_requests)
    def test_not_verified_email_address_publish_proposal(self, mock_get):
        self.login_default_user()
        self.mark_user_not_verified()
        self.proposal.status = "DRAFT"
        resp = self.app.put("/api/v1/proposals/{}/publish".format(self.proposal.id))
        self.assert403(resp)

    # /
    def test_get_proposals(self):
        self.test_publish_proposal_approved()
        resp = self.app.get("/api/v1/proposals/")
        self.assert200(resp)

    def test_get_proposals_does_not_include_team_member_email_addresses(self):
        self.test_publish_proposal_approved()
        resp = self.app.get("/api/v1/proposals/")
        self.assert200(resp)
        for each_proposal in resp.json['items']:
            for team_member in each_proposal["team"]:
                self.assertIsNone(team_member.get('email_address'))


    def test_follow_proposal(self):
        # not logged in
        resp = self.app.put(
            f"/api/v1/proposals/{self.proposal.id}/follow",
            data=json.dumps({"isFollow": True}),
            content_type="application/json",
        )
        self.assert401(resp)

        # logged in
        self.login_default_user()
        self.proposal.status = ProposalStatus.LIVE

        resp = self.app.get(f"/api/v1/proposals/{self.proposal.id}")
        self.assert200(resp)
        self.assertEqual(resp.json["authedFollows"], False)

        # follow
        resp = self.app.put(
            f"/api/v1/proposals/{self.proposal.id}/follow",
            data=json.dumps({"isFollow": True}),
            content_type="application/json",
        )
        self.assert200(resp)

        resp = self.app.get(f"/api/v1/proposals/{self.proposal.id}")
        self.assert200(resp)
        self.assertEqual(resp.json["authedFollows"], True)

        self.assertEqual(self.proposal.followers[0].id, self.user.id)
        self.assertEqual(self.user.followed_proposals[0].id, self.proposal.id)

        # un-follow
        resp = self.app.put(
            f"/api/v1/proposals/{self.proposal.id}/follow",
            data=json.dumps({"isFollow": False}),
            content_type="application/json",
        )
        self.assert200(resp)

        resp = self.app.get(f"/api/v1/proposals/{self.proposal.id}")
        self.assert200(resp)
        self.assertEqual(resp.json["authedFollows"], False)

        self.assertEqual(len(self.proposal.followers), 0)
        self.assertEqual(len(self.user.followed_proposals), 0)

    def test_like_proposal(self):
        # not logged in
        resp = self.app.put(
            f"/api/v1/proposals/{self.proposal.id}/like",
            data=json.dumps({"isLiked": True}),
            content_type="application/json",
        )
        self.assert401(resp)

        # logged in
        self.login_default_user()

        # proposal not yet live
        resp = self.app.put(
            f"/api/v1/proposals/{self.proposal.id}/like",
            data=json.dumps({"isLiked": True}),
            content_type="application/json",
        )
        self.assert404(resp)
        self.assertEquals(resp.json["message"], "Cannot like a proposal that's not live")

        # proposal is live
        self.proposal.status = ProposalStatus.LIVE
        resp = self.app.put(
            f"/api/v1/proposals/{self.proposal.id}/like",
            data=json.dumps({"isLiked": True}),
            content_type="application/json",
        )
        self.assert200(resp)
        self.assertTrue(self.user in self.proposal.likes)

        resp = self.app.get(
            f"/api/v1/proposals/{self.proposal.id}"
        )
        self.assert200(resp)
        self.assertEqual(resp.json["authedLiked"], True)
        self.assertEqual(resp.json["likesCount"], 1)

        # test unliking a proposal
        resp = self.app.put(
            f"/api/v1/proposals/{self.proposal.id}/like",
            data=json.dumps({"isLiked": False}),
            content_type="application/json",
        )
        self.assert200(resp)
        self.assertTrue(self.user not in self.proposal.likes)

        resp = self.app.get(
            f"/api/v1/proposals/{self.proposal.id}"
        )
        self.assert200(resp)
        self.assertEqual(resp.json["authedLiked"], False)
        self.assertEqual(resp.json["likesCount"], 0)
