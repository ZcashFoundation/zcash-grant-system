import json

from grant.proposal.models import Proposal, db
from grant.utils.enums import ProposalStatus
from ..config import BaseUserConfig
from ..test_data import test_comment, test_reply, test_comment_large


class TestProposalCommentAPI(BaseUserConfig):
    def test_unauthorized_create_new_proposal_comment(self):
        # no login
        proposal = Proposal(status=ProposalStatus.LIVE)
        db.session.add(proposal)
        db.session.commit()

        comment_res = self.app.post(
            "/api/v1/proposals/{}/comments".format(proposal.id),
            data=json.dumps(test_comment),
            content_type='application/json'
        )
        self.assertStatus(comment_res, 401)

    def test_create_new_proposal_comment(self):
        self.login_default_user()
        proposal = Proposal(status=ProposalStatus.LIVE)
        db.session.add(proposal)
        db.session.commit()

        comment_res = self.app.post(
            "/api/v1/proposals/{}/comments".format(proposal.id),
            data=json.dumps(test_comment),
            content_type='application/json'
        )
        self.assertStatus(comment_res, 201)

    def test_invalid_proposal_id_create_comment(self):
        self.login_default_user()
        comment_res = self.app.post(
            "/api/v1/proposals/12345/comments",
            data=json.dumps(test_comment),
            content_type='application/json'
        )
        self.assertStatus(comment_res, 404)

    def test_create_new_proposal_comment_reply(self):
        self.login_default_user()
        proposal = Proposal(status=ProposalStatus.LIVE)
        db.session.add(proposal)
        db.session.commit()
        proposal_id = proposal.id

        comment_res = self.app.post(
            "/api/v1/proposals/{}/comments".format(proposal_id),
            data=json.dumps(test_comment),
            content_type='application/json'
        )
        self.assertStatus(comment_res, 201)

        test_reply_copy = test_reply.copy()
        test_reply_copy["parentCommentId"] = comment_res.json["id"]
        reply_res = self.app.post(
            "/api/v1/proposals/{}/comments".format(proposal_id),
            data=json.dumps(test_reply_copy),
            content_type='application/json'
        )
        self.assertStatus(reply_res, 201)
        self.assertEqual(
            reply_res.json["parentCommentId"],
            comment_res.json["id"]
        )

    def test_invalid_parent_comment_id_create_reply(self):
        self.login_default_user()
        proposal = Proposal(status=ProposalStatus.LIVE)
        db.session.add(proposal)
        db.session.commit()
        proposal_id = proposal.id

        comment_res = self.app.post(
            "/api/v1/proposals/{}/comments".format(proposal_id),
            data=json.dumps(test_comment),
            content_type='application/json'
        )
        self.assertStatus(comment_res, 201)

        test_reply_copy = test_reply.copy()
        test_reply_copy["parentCommentId"] = comment_res.json["id"] + 1
        reply_res = self.app.post(
            "/api/v1/proposals/{}/comments".format(proposal_id),
            data=json.dumps(test_reply_copy),
            content_type='application/json'
        )
        self.assertStatus(reply_res, 400)

    def test_create_new_proposal_comment_fails_with_no_verification(self):
        self.login_default_user()
        self.mark_user_not_verified()

        proposal = Proposal(
            status="LIVE"
        )
        db.session.add(proposal)
        db.session.commit()
        proposal_id = proposal.id

        comment_res = self.app.post(
            "/api/v1/proposals/{}/comments".format(proposal_id),
            data=json.dumps(test_comment),
            content_type='application/json'
        )

        self.assertStatus(comment_res, 403)

    def test_create_new_proposal_comment_fails_with_large_comment(self):
        self.login_default_user()

        proposal = Proposal(
            status="LIVE"
        )
        db.session.add(proposal)
        db.session.commit()
        proposal_id = proposal.id

        comment_res = self.app.post(
            "/api/v1/proposals/{}/comments".format(proposal_id),
            data=json.dumps(test_comment_large),
            content_type='application/json'
        )

        self.assertStatus(comment_res, 400)

    def test_create_new_proposal_comment_fails_with_silenced_user(self):
        self.login_default_user()
        self.user.set_silenced(True)

        proposal = Proposal(
            status="LIVE"
        )
        db.session.add(proposal)
        db.session.commit()
        proposal_id = proposal.id

        comment_res = self.app.post(
            "/api/v1/proposals/{}/comments".format(proposal_id),
            data=json.dumps(test_comment),
            content_type='application/json'
        )

        self.assertStatus(comment_res, 403)
        self.assertIn('silenced', comment_res.json['message'])
