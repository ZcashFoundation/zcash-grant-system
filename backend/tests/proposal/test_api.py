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
        self.assertEqual(resp.json['status'], ProposalStatus.PENDING)

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

    def test_get_archived_proposal(self):
        self.login_default_user()

        bad_id = '111111111111'
        resp = self.app.get(
            f"/api/v1/proposals/{bad_id}/archive"
        )
        self.assert404(resp)

        resp = self.app.get(
            f"/api/v1/proposals/{self.proposal.id}/archive"
        )
        self.assert401(resp)

        self.proposal.status = ProposalStatus.ARCHIVED
        resp = self.app.get(
            f"/api/v1/proposals/{self.proposal.id}/archive"
        )
        self.assert200(resp)
        self.assertEqual(self.proposal.id, resp.json["proposalId"])

    # /
    def test_get_proposals(self):
        self.proposal.status = ProposalStatus.LIVE
        resp = self.app.get("/api/v1/proposals/")
        self.assert200(resp)

    def test_get_proposals_does_not_include_team_member_email_addresses(self):
        self.proposal.status = ProposalStatus.LIVE
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
        self.assertEquals(resp.json["message"], "Cannot like a proposal that's not live or in discussion")

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

    def test_resolve_changes_discussion(self):
        self.login_default_user()

        self.proposal.status = ProposalStatus.DISCUSSION
        self.proposal.changes_requested_discussion = True
        self.proposal.changes_requested_discussion_reason = 'test'

        resp = self.app.put(
            f"/api/v1/proposals/{self.proposal.id}/resolve"
        )
        self.assert200(resp)
        self.assertEqual(resp.json['changesRequestedDiscussion'], False)
        self.assertIsNone(resp.json['changesRequestedDiscussionReason'])

        proposal = Proposal.query.get(self.proposal.id)
        self.assertEqual(proposal.changes_requested_discussion, False)
        self.assertIsNone(proposal.changes_requested_discussion_reason)

    def test_resolve_changes_discussion_wrong_status_fail(self):
        # resolve should fail if proposal is not in a DISCUSSION state
        self.login_default_user()
        self.proposal.status = ProposalStatus.PENDING
        self.proposal.changes_requested_discussion = True
        self.proposal.changes_requested_discussion_reason = 'test'

        # resolve changes
        resp = self.app.put(
            f"/api/v1/proposals/{self.proposal.id}/resolve"
        )
        self.assert400(resp)

    def test_resolve_changes_discussion_bad_proposal_fail(self):
        # resolve should fail if bad proposal id is provided
        self.login_default_user()
        bad_id = '111111111111'
        # resolve changes
        resp = self.app.put(
            f"/api/v1/proposals/{bad_id}/resolve"
        )
        self.assert404(resp)

    def test_resolve_changes_discussion_no_changes_requested_fail(self):
        # resolve should fail if changes are not requested on the proposal
        self.login_default_user()
        self.proposal.status = ProposalStatus.DISCUSSION
        self.proposal.changes_requested_discussion = False
        self.proposal.changes_requested_discussion_reason = None

        # resolve changes
        resp = self.app.put(
            f"/api/v1/proposals/{self.proposal.id}/resolve"
        )
        self.assert400(resp)

    def test_make_proposal_live_draft(self):
        # user should be able to make live draft of a proposal
        self.login_default_user()
        self.proposal.status = ProposalStatus.DISCUSSION

        draft_resp = self.app.post(
            f"/api/v1/proposals/{self.proposal.id}/draft"
        )
        self.assertStatus(draft_resp, 201)
        self.assertIsNone(draft_resp.json['liveDraftId'])
        self.assertEqual(draft_resp.json['status'], ProposalStatus.LIVE_DRAFT)

        proposal = Proposal.query.get(self.proposal.id)
        draft = Proposal.query.get(draft_resp.json['proposalId'])
        draft_id = draft.id

        self.assertEqual(draft.live_draft_parent_id, proposal.id)
        self.assertEqual(proposal.live_draft, draft)

        # live draft id should be included in the parent proposal json response
        proposal_resp = self.app.get(
            f"/api/v1/proposals/{self.proposal.id}"
        )
        self.assert200(proposal_resp)
        self.assertEqual(proposal_resp.json['liveDraftId'], draft_id)

        # if endpoint is called again, the same live draft should be returned
        resp = self.app.post(
            f"/api/v1/proposals/{self.proposal.id}/draft"
        )
        self.assertStatus(resp, 201)
        self.assertEqual(resp.json['status'], ProposalStatus.LIVE_DRAFT)
        self.assertEqual(resp.json['proposalId'], draft_id)

        # check milestones were copied

        for i, ms in enumerate(draft_resp.json['milestones']):
            title_draft = ms['title']
            title_proposal = proposal_resp.json['milestones'][i]['title']

            self.assertEqual(title_draft, title_proposal)

    def test_make_proposal_live_draft_bad_status_fail(self):
        # making live draft should fail if not in a DISCUSSION status
        self.login_default_user()
        resp = self.app.post(
            f"/api/v1/proposals/{self.proposal.id}/draft"
        )
        self.assert404(resp)

    @patch('requests.get', side_effect=mock_blockchain_api_requests)
    def test_publish_live_draft(self, mock_get):
        # user should be able to publish live draft of a proposal
        self.login_default_user()
        self.proposal.status = ProposalStatus.DISCUSSION

        # double check to make sure there are no proposal revisions
        self.assertEqual(len(self.proposal.revisions), 0)

        # create live draft
        draft_resp = self.app.post(
            f"/api/v1/proposals/{self.proposal.id}/draft"
        )

        # check the two proposals have been related correctly
        self.assertStatus(draft_resp, 201)
        self.assertNotEqual(draft_resp.json['proposalId'], self.proposal.id)
        draft = Proposal.query.get(draft_resp.json['proposalId'])
        draft_id = draft.id

        # update live draft title
        new_draft_title = 'This is a test for live drafts!'
        draft.title = new_draft_title

        # update live draft first milestone title
        new_milestone_title = 'This is a test renaming a milestone title'
        first_draft_milestone = draft.milestones[0]
        first_draft_milestone.title = new_milestone_title

        # persist changes
        db.session.add(first_draft_milestone)
        db.session.add(draft)
        db.session.commit()

        # publish live draft
        resp = self.app.put(
            f"/api/v1/proposals/{draft_id}/publish/live"
        )
        self.assert200(resp)
        self.assertEqual(resp.json['proposalId'], self.proposal.id)

        # check to see the changes have been copied to the proposal
        proposal = Proposal.query.get(self.proposal.id)
        self.assertEqual(proposal.title, new_draft_title)
        self.assertEqual(proposal.milestones[0].title, new_milestone_title)

        # check the draft has been archived
        self.assertIsNone(proposal.live_draft)
        old_live_draft = Proposal.query.get(draft_id)
        self.assertEqual(old_live_draft.status, ProposalStatus.ARCHIVED)

        # check the proposal revision was added
        self.assertEqual(len(self.proposal.revisions), 1)

        # check the proposal revision was created correctly
        revision = self.proposal.revisions[0]
        self.assertEqual(revision.author, self.user)
        self.assertEqual(revision.proposal, self.proposal)
        self.assertEqual(revision.proposal_archive_id, draft_id)
        self.assertIsNone(revision.proposal_archive_parent_id)
        self.assertGreater(len(revision.changes), 0)
        self.assertEqual(revision.revision_index, 0)


    def test_publish_live_draft_bad_status_fail(self):
        # publishing a live draft without a LIVE_DRAFT status should fail
        self.login_default_user()
        resp = self.app.put(
            f"/api/v1/proposals/{self.proposal.id}/publish/live"
        )
        self.assert403(resp)

    def test_publish_live_draft_bad_parent_fail(self):
        # publishing a live draft without a valid parent should fail
        self.login_default_user()
        self.proposal.status = ProposalStatus.LIVE_DRAFT
        db.session.add(self.proposal)
        db.session.commit()
        resp = self.app.put(
            f"/api/v1/proposals/{self.proposal.id}/publish/live"
        )
        self.assert404(resp)

        # publishing a live draft with an invalid parent should fail
        self.proposal.live_draft_parent_id = 111111111111
        resp = self.app.put(
            f"/api/v1/proposals/{self.proposal.id}/publish/live"
        )
        self.assert404(resp)

    @patch('requests.get', side_effect=mock_blockchain_api_requests)
    def test_1_get_proposal_revisions(self, mock_get):
        # user should be able to publish live draft of a proposal
        self.login_default_user()
        self.proposal.status = ProposalStatus.DISCUSSION

        # double check to make sure there are no proposal revisions
        self.assertEqual(len(self.proposal.revisions), 0)

        # create live draft
        draft1_resp = self.app.post(
            f"/api/v1/proposals/{self.proposal.id}/draft"
        )

        self.assertStatus(draft1_resp, 201)
        draft1 = Proposal.query.get(draft1_resp.json['proposalId'])
        draft1_id = draft1.id

        # set new title and save
        draft1.title = 'draft 1 title'
        db.session.add(draft1)
        db.session.commit()

        # publish live draft1
        resp = self.app.put(
            f"/api/v1/proposals/{draft1_id}/publish/live"
        )
        self.assert200(resp)

        # make sure proposal revision was created as expected
        self.assertEqual(len(self.proposal.revisions), 1)

        # create second live draft
        draft2_resp = self.app.post(
            f"/api/v1/proposals/{self.proposal.id}/draft"
        )
        self.assertStatus(draft2_resp, 201)
        draft2 = Proposal.query.get(draft2_resp.json['proposalId'])
        draft2_id = draft2.id

        # set new title and save
        draft2.title = 'draft 2 title'
        db.session.add(draft2)
        db.session.commit()

        # publish live draft2
        resp = self.app.put(
            f"/api/v1/proposals/{draft2_id}/publish/live"
        )
        self.assert200(resp)

        # make sure proposal revision was created as expected
        self.assertEqual(len(self.proposal.revisions), 2)

        # finally, call the revisions API and make sure it returns the two revisions as expected
        revisions_resp = self.app.get(
            f"/api/v1/proposals/{self.proposal.id}/revisions"
        )
        revisions = revisions_resp.json
        self.assertEqual(len(revisions), 2)

        revision1 = revisions[0]
        revision2 = revisions[1]

        # check revision 1 data
        self.assertEqual(revision1["proposalId"], self.proposal.id)
        self.assertEqual(revision1["proposalArchiveId"], draft1_id)
        self.assertIsNone(revision1["proposalArchiveParentId"])
        self.assertGreater(len(revision1["changes"]), 0)
        self.assertEqual(revision1["revisionIndex"], 0)

        # check revision 2 data
        self.assertEqual(revision2["proposalId"], self.proposal.id)
        self.assertEqual(revision2["proposalArchiveId"], draft2_id)
        self.assertEqual(revision2["proposalArchiveParentId"], draft1_id)
        self.assertGreater(len(revision2["changes"]), 0)
        self.assertEqual(revision2["revisionIndex"], 1)
