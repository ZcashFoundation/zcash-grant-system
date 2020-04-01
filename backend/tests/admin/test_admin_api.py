import json
from grant.utils.enums import ProposalStatus, CCRStatus
import grant.utils.admin as admin
from grant.utils import totp_2fa
from grant.user.models import admin_user_schema
from grant.proposal.models import proposal_schema, db, Proposal
from grant.ccr.models import CCR
from mock import patch

from ..config import BaseProposalCreatorConfig, BaseCCRCreatorConfig
from ..test_data import mock_blockchain_api_requests, test_ccr

json_checklogin = {
    "isLoggedIn": False,
    "is2faAuthed": False,
}
json_checklogin_true = {
    "isLoggedIn": True,
    "is2faAuthed": True,
}
json_2fa = {
    "isLoginFresh": True,
    "has2fa": False,
    "is2faAuthed": False,
    "backupCodeCount": 0,
    "isEmailVerified": True,
}


class TestAdminAPI(BaseProposalCreatorConfig):

    def p(self, path, data):
        return self.app.post(path, data=json.dumps(data), content_type="application/json")

    def login_admin(self):
        # set admin
        self.user.set_admin(True)
        db.session.commit()

        # login
        r = self.p("/api/v1/admin/login", {
            "username": self.user.email_address,
            "password": self.user_password
        })
        self.assert200(r)

        # 2fa on the natch
        r = self.app.get("/api/v1/admin/2fa")
        self.assert200(r)

        # ... init
        r = self.app.get("/api/v1/admin/2fa/init")
        self.assert200(r)

        codes = r.json['backupCodes']
        secret = r.json['totpSecret']
        uri = r.json['totpUri']

        # ... enable/verify
        r = self.p("/api/v1/admin/2fa/enable", {
            "backupCodes": codes,
            "totpSecret": secret,
            "verifyCode": totp_2fa.current_totp(secret)
        })
        self.assert200(r)
        return r

    def r(self, method, path, data=None):
        if not data:
            return method(path)

        return method(path, data=data)

    def assert_autherror(self, resp, contains):
        # this should be 403
        self.assert403(resp)
        print(f'...check that [{resp.json["message"]}] contains [{contains}]')
        self.assertTrue(contains in resp.json['message'])

    # happy path (mostly)
    def test_admin_2fa_setup_flow(self):
        # 1. initial checklogin
        r = self.app.get("/api/v1/admin/checklogin")
        self.assert200(r)
        self.assertEqual(json_checklogin, r.json, msg="initial login")

        def send_login():
            return self.p("/api/v1/admin/login", {
                "username": self.user.email_address,
                "password": self.user_password
            })

        # 2. login attempt (is_admin = False)
        r = send_login()
        self.assert401(r)

        # 3. make user admin
        self.user.set_admin(True)
        db.session.commit()

        # 4. login again
        r = send_login()
        self.assert200(r)
        json_checklogin['isLoggedIn'] = True
        self.assertEqual(json_checklogin, r.json, msg="login again")

        # 5. get 2fa state (fresh login)
        r = self.app.get("/api/v1/admin/2fa")
        self.assert200(r)
        self.assertEqual(json_2fa, r.json, msg="get 2fa state")

        # 6. get 2fa setup
        r = self.app.get("/api/v1/admin/2fa/init")
        self.assert200(r)
        self.assertTrue('backupCodes' in r.json)
        self.assertTrue('totpSecret' in r.json)
        self.assertTrue('totpUri' in r.json)

        codes = r.json['backupCodes']
        secret = r.json['totpSecret']
        uri = r.json['totpUri']

        # 7. enable 2fa (bad hash)
        r = self.p("/api/v1/admin/2fa/enable", {
            "backupCodes": ['bad-code'],
            "totpSecret": "BADSECRET",
            "verifyCode": "123456"
        })
        self.assert_autherror(r, 'Bad hash')

        # 8. enable 2fa (bad verification code)
        r = self.p("/api/v1/admin/2fa/enable", {
            "backupCodes": codes,
            "totpSecret": secret,
            "verifyCode": "123456"
        })
        self.assert_autherror(r, 'Bad verification code')

        # 9. enable 2fa (success)
        r = self.p("/api/v1/admin/2fa/enable", {
            "backupCodes": codes,
            "totpSecret": secret,
            "verifyCode": totp_2fa.current_totp(secret)
        })
        self.assert200(r)
        json_2fa['has2fa'] = True
        json_2fa['is2faAuthed'] = True
        json_2fa['backupCodeCount'] = 16
        self.assertEquals(json_2fa, r.json)

        # 10. check login (logged in)
        r = self.app.get("/api/v1/admin/checklogin")
        self.assert200(r)
        self.assertEqual(json_checklogin_true, r.json, msg="checklogin - logged in")

        # 11. 2fa state (logged in & verified)
        r = self.app.get("/api/v1/admin/2fa")
        self.assert200(r)
        self.assertEqual(json_2fa, r.json, msg="get 2fa state (logged in)")

        # 12. logout
        r = self.app.get("/api/v1/admin/logout")
        self.assert200(r)
        json_checklogin['isLoggedIn'] = False
        self.assertEquals(json_checklogin, r.json)

        # 13. 2fa state (logged out)
        r = self.app.get("/api/v1/admin/2fa")
        self.assert403(r)

        # 14. 2fa verify (fail; logged out)
        r = self.p("/api/v1/admin/2fa/verify", {'verifyCode': totp_2fa.current_totp(secret)})
        self.assert_autherror(r, 'Must be auth')

        # 15. login
        r = send_login()
        self.assert200(r)

        # 16. check login (logged in, not verified)
        r = self.app.get("/api/v1/admin/checklogin")
        self.assert200(r)
        json_checklogin['isLoggedIn'] = True
        self.assertEqual(json_checklogin, r.json, msg="checklogin - logged in, not verified")

        # 17. 2fa state (logged in, not verified)
        r = self.app.get("/api/v1/admin/2fa")
        self.assert200(r)
        json_2fa['is2faAuthed'] = False
        self.assertEqual(json_2fa, r.json, msg="get 2fa state (logged in, not verified)")

        # 18. 2fa verify (success: logged in)
        r = self.p("/api/v1/admin/2fa/verify", {'verifyCode': totp_2fa.current_totp(secret)})
        self.assert200(r)
        json_2fa['is2faAuthed'] = True
        self.assertEqual(json_2fa, r.json)

        # 19. check login (natural login and verify)
        r = self.app.get("/api/v1/admin/checklogin")
        self.assert200(r)
        self.assertEqual(json_checklogin_true, r.json, msg="checklogin - logged in")

        # 20. logout
        r = self.app.get("/api/v1/admin/logout")
        self.assert200(r)

        # 21. login
        r = send_login()
        self.assert200(r)

        # 22. 2fa verify (use backup code)
        r = self.p("/api/v1/admin/2fa/verify", {'verifyCode': codes[0]})
        self.assert200(r)
        json_2fa['is2faAuthed'] = True
        json_2fa['backupCodeCount'] = json_2fa['backupCodeCount'] - 1
        self.assertEqual(json_2fa, r.json)

        # 23. logout
        r = self.app.get("/api/v1/admin/logout")
        self.assert200(r)

        # 24. login
        r = send_login()
        self.assert200(r)

        # 25. 2fa verify (fail: re-use backup code)
        r = self.p("/api/v1/admin/2fa/verify", {'verifyCode': codes[0]})
        self.assert_autherror(r, 'Bad 2fa code')

        # Here ends the epic of Loginomesh.

    def test_get_users(self):
        self.login_admin()
        resp = self.app.get("/api/v1/admin/users")
        self.assert200(resp)
        print(resp.json)
        # 2 users created by BaseProposalCreatorConfig
        self.assertEqual(len(resp.json['items']), 2)

    def test_get_proposals(self):
        self.login_admin()
        resp = self.app.get("/api/v1/admin/proposals")
        self.assert200(resp)
        # 2 proposals created by BaseProposalCreatorConfig
        self.assertEqual(len(resp.json['items']), 2)

    def test_open_proposal_for_discussion_accept(self):
        # an admin should be able to open a proposal for discussion
        self.login_admin()

        # proposal needs to be PENDING
        self.proposal.status = ProposalStatus.PENDING

        # approve open for discussion
        resp = self.app.put(
            f"/api/v1/admin/proposals/{self.proposal.id}/discussion",
            data=json.dumps({"isOpenForDiscussion": True})
        )

        self.assert200(resp)
        self.assertEqual(resp.json["status"], ProposalStatus.DISCUSSION)

        proposal = Proposal.query.get(self.proposal.id)
        self.assertEqual(proposal.status, ProposalStatus.DISCUSSION)

    def test_open_proposal_for_discussion_reject(self):
        # an admin should be able to reject opening a proposal for discussion
        reject_reason = "this is a test"

        self.login_admin()

        # proposal needs to be PENDING
        self.proposal.status = ProposalStatus.PENDING

        # disapprove open for discussion
        resp = self.app.put(
            f"/api/v1/admin/proposals/{self.proposal.id}/discussion",
            data=json.dumps({"isOpenForDiscussion": False, "rejectReason": reject_reason})
        )

        self.assert200(resp)
        self.assertEqual(resp.json["status"], ProposalStatus.REJECTED)
        self.assertEqual(resp.json["rejectReason"], reject_reason)

        proposal = Proposal.query.get(self.proposal.id)
        self.assertEqual(proposal.status, ProposalStatus.REJECTED)
        self.assertEqual(proposal.reject_reason, reject_reason)

    def test_open_proposal_for_discussion_bad_proposal_id_fail(self):
        # request should fail if a bad proposal id is provided
        bad_proposal_id = "11111111111111111111"
        self.login_admin()

        # approve open for discussion
        resp = self.app.put(
            f"/api/v1/admin/proposals/{bad_proposal_id}/discussion",
            data=json.dumps({"isOpenForDiscussion": True})
        )
        self.assert404(resp)

    def test_open_proposal_for_discussion_not_admin_fail(self):
        # request should fail if user is not an admin
        self.login_default_user()

        # proposal needs to be PENDING
        self.proposal.status = ProposalStatus.PENDING

        # approve open for discussion
        resp = self.app.put(
            f"/api/v1/admin/proposals/{self.proposal.id}/discussion",
            data=json.dumps({"isOpenForDiscussion": True})
        )
        self.assert401(resp)

    def test_open_proposal_for_discussion_not_pending_fail(self):
        # request should fail if proposal is not in PENDING state
        self.login_admin()

        self.proposal.status = ProposalStatus.DISCUSSION

        # approve open for discussion
        resp = self.app.put(
            f"/api/v1/admin/proposals/{self.proposal.id}/discussion",
            data=json.dumps({"isOpenForDiscussion": True})
        )
        self.assert400(resp)

    def test_open_proposal_for_discussion_no_reject_reason_fail(self):
        # denying opening a proposal for discussion should fail if no reason is provided
        self.login_admin()

        # proposal needs to be PENDING
        self.proposal.status = ProposalStatus.PENDING

        # disapprove open for discussion
        resp = self.app.put(
            f"/api/v1/admin/proposals/{self.proposal.id}/discussion",
            data=json.dumps({"isOpenForDiscussion": False})
        )
        self.assert400(resp)

    def test_accept_proposal_with_funding(self):
        self.login_admin()

        # proposal needs to be DISCUSSION
        self.proposal.status = ProposalStatus.DISCUSSION

        # approve
        resp = self.app.put(
            "/api/v1/admin/proposals/{}/accept".format(self.proposal.id),
            data=json.dumps({"isAccepted": True, "withFunding": True})
        )
        print(resp.json)
        self.assert200(resp)
        self.assertEqual(resp.json["status"], ProposalStatus.LIVE)
        self.assertEqual(resp.json["acceptedWithFunding"], True)
        self.assertEqual(resp.json["target"], resp.json["contributionBounty"])

        # milestones should have estimated dates
        for milestone in resp.json["milestones"]:
            self.assertIsNotNone(milestone["dateEstimated"])

    def test_accept_proposal_without_funding(self):
        self.login_admin()

        # proposal needs to be DISCUSSION
        self.proposal.status = ProposalStatus.DISCUSSION

        # approve
        resp = self.app.put(
            "/api/v1/admin/proposals/{}/accept".format(self.proposal.id),
            data=json.dumps({"isAccepted": True, "withFunding": False})
        )
        print(resp.json)
        self.assert200(resp)
        self.assertEqual(resp.json["status"], ProposalStatus.LIVE)
        self.assertEqual(resp.json["acceptedWithFunding"], False)
        self.assertEqual(resp.json["contributionBounty"], "0")

        # milestones should not have estimated dates
        for milestone in resp.json["milestones"]:
            self.assertIsNone(milestone["dateEstimated"])

    def test_accept_proposal_changes_requested(self):
        # an admin should be able to request changes on a proposal
        reason = "this is a test"
        self.login_admin()

        # proposal needs to be DISCUSSION
        self.proposal.status = ProposalStatus.DISCUSSION

        # approve
        resp = self.app.put(
            "/api/v1/admin/proposals/{}/accept".format(self.proposal.id),
            data=json.dumps({"isAccepted": False, "changesRequestedReason": reason})
        )

        self.assert200(resp)
        self.assertEqual(resp.json["status"], ProposalStatus.DISCUSSION)
        self.assertEqual(resp.json["changesRequestedDiscussion"], True)
        self.assertEqual(resp.json["changesRequestedDiscussionReason"], reason)

        proposal = Proposal.query.get(self.proposal.id)
        self.assertEqual(proposal.status, ProposalStatus.DISCUSSION)
        self.assertEqual(proposal.changes_requested_discussion, True)
        self.assertEqual(proposal.changes_requested_discussion_reason, reason)

    def test_accept_proposal_changes_requested_no_reason_provided_fail(self):
        # requesting changes to a proposal without providing a reason should fail
        self.login_admin()

        # proposal needs to be DISCUSSION
        self.proposal.status = ProposalStatus.DISCUSSION

        # approve
        resp = self.app.put(
            "/api/v1/admin/proposals/{}/accept".format(self.proposal.id),
            data=json.dumps({"isAccepted": False})
        )

        self.assert400(resp)

    def test_accept_proposal_changes_requested_not_discussion_fail(self):
        # requesting changes on a proposal not in DISCUSSION should fail
        self.login_admin()
        self.proposal.status = ProposalStatus.PENDING

        # disapprove
        resp = self.app.put(
            "/api/v1/admin/proposals/{}/accept".format(self.proposal.id),
            data=json.dumps({"isAccepted": False, "changesRequestedReason": "test"})
        )

        self.assert400(resp)

    def test_accept_proposal_not_discussion_fail(self):
        # accepting a proposal not in DISCUSSION should fail
        self.login_admin()
        self.proposal.status = ProposalStatus.PENDING

        # approve
        resp = self.app.put(
            "/api/v1/admin/proposals/{}/accept".format(self.proposal.id),
            data=json.dumps({"isAccepted": True, "withFunding": True})
        )

        self.assert400(resp)

    def test_resolve_changes_discussion(self):
        # an admin should be able to resolve discussion changes
        self.login_admin()
        self.proposal.status = ProposalStatus.DISCUSSION
        self.proposal.changes_requested_discussion = True
        self.proposal.changes_requested_discussion_reason = 'test'

        # resolve changes
        resp = self.app.put(
            f"/api/v1/admin/proposals/{self.proposal.id}/resolve"
        )
        self.assert200(resp)
        self.assertEqual(resp.json['changesRequestedDiscussion'], False)
        self.assertIsNone(resp.json['changesRequestedDiscussionReason'])

    def test_resolve_changes_discussion_wrong_status_fail(self):
        # resolve should fail if proposal is not in a DISCUSSION state
        self.login_admin()
        self.proposal.status = ProposalStatus.PENDING
        self.proposal.changes_requested_discussion = True
        self.proposal.changes_requested_discussion_reason = 'test'

        # resolve changes
        resp = self.app.put(
            f"/api/v1/admin/proposals/{self.proposal.id}/resolve"
        )
        self.assert400(resp)

    def test_resolve_changes_discussion_bad_proposal_fail(self):
        # resolve should fail if bad proposal id is provided
        self.login_admin()
        bad_id = '111111111111'
        # resolve changes
        resp = self.app.put(
            f"/api/v1/admin/proposals/{bad_id}/resolve"
        )
        self.assert404(resp)

    def test_resolve_changes_discussion_no_changes_requested_fail(self):
        # resolve should fail if changes are not requested on the proposal
        self.login_admin()
        self.proposal.status = ProposalStatus.DISCUSSION
        self.proposal.changes_requested_discussion = False
        self.proposal.changes_requested_discussion_reason = None

        # resolve changes
        resp = self.app.put(
            f"/api/v1/admin/proposals/{self.proposal.id}/resolve"
        )
        self.assert400(resp)

    def test_change_proposal_to_accepted_with_funding(self):
        self.login_admin()

        # proposal needs to be DISCUSSION
        self.proposal.status = ProposalStatus.DISCUSSION

        # accept without funding
        resp = self.app.put(
            "/api/v1/admin/proposals/{}/accept".format(self.proposal.id),
            data=json.dumps({"isAccepted": True, "withFunding": False})
        )
        self.assert200(resp)
        self.assertEqual(resp.json["acceptedWithFunding"], False)

        # change to accepted with funding
        resp = self.app.put(
            f"/api/v1/admin/proposals/{self.proposal.id}/accept/fund"
        )
        self.assert200(resp)
        self.assertEqual(resp.json["acceptedWithFunding"], True)

        # milestones should have estimated dates
        for milestone in resp.json["milestones"]:
            self.assertIsNotNone(milestone["dateEstimated"])

        # should fail if proposal is already accepted with funding
        resp = self.app.put(
            f"/api/v1/admin/proposals/{self.proposal.id}/accept/fund"
        )
        self.assert404(resp)
        self.assertEqual(resp.json['message'], "Proposal already accepted with funding.")
        self.proposal.accepted_with_funding = False

        # should fail if proposal is not version two
        self.proposal.version = ''
        resp = self.app.put(
            f"/api/v1/admin/proposals/{self.proposal.id}/accept/fund"
        )
        self.assert404(resp)
        self.assertEqual(resp.json['message'], "Only version two proposals can be accepted with funding")
        self.proposal.version = '2'

        # should failed if proposal is not LIVE or APPROVED
        self.proposal.status = ProposalStatus.DISCUSSION
        self.proposal.accepted_with_funding = False
        resp = self.app.put(
            f"/api/v1/admin/proposals/{self.proposal.id}/accept/fund"
        )
        self.assert404(resp)
        self.assertEqual(resp.json["message"], 'Only live or approved proposals can be modified by this endpoint')

    def test_reject_proposal_discussion(self):
        self.login_admin()

        # proposal needs to be PENDING
        self.proposal.status = ProposalStatus.PENDING

        # reject
        resp = self.app.put(
            "/api/v1/admin/proposals/{}/discussion".format(self.proposal.id),
            data=json.dumps({"isOpenForDiscussion": False, "rejectReason": "Funnzies."})
        )
        self.assert200(resp)
        self.assertEqual(resp.json["status"], ProposalStatus.REJECTED)
        self.assertEqual(resp.json["rejectReason"], "Funnzies.")

    def test_reject_permanently_proposal(self):
        rejected = {
            "rejectReason": "test"
        }
        self.login_admin()

        # no reject reason should 400
        resp = self.app.put(
            f"/api/v1/admin/proposals/{self.proposal.id}/reject_permanently",
            content_type='application/json'
        )
        self.assert400(resp)

        # bad proposal id should 404
        resp = self.app.put(
            f"/api/v1/admin/proposals/111111111/reject_permanently",
            data=json.dumps(rejected),
            content_type='application/json'
        )
        self.assert404(resp)

        # bad status should 401
        resp = self.app.put(
            f"/api/v1/admin/proposals/{self.proposal.id}/reject_permanently",
            data=json.dumps(rejected),
            content_type='application/json'
        )
        self.assert401(resp)

        self.proposal.status = ProposalStatus.PENDING

        # should go through
        resp = self.app.put(
            f"/api/v1/admin/proposals/{self.proposal.id}/reject_permanently",
            data=json.dumps(rejected),
            content_type='application/json'
        )
        self.assert200(resp)

        self.assertEqual(resp.json["status"], ProposalStatus.REJECTED_PERMANENTLY)
        self.assertEqual(resp.json["rejectReason"], rejected["rejectReason"])

    @patch('grant.email.send.send_email')
    def test_nominate_arbiter(self, mock_send_email):
        mock_send_email.return_value.ok = True
        self.login_admin()

        self.proposal.status = ProposalStatus.LIVE
        self.proposal.accepted_with_funding = True

        # nominate arbiter
        resp = self.app.put(
            "/api/v1/admin/arbiters",
            data=json.dumps({
                'proposalId': self.proposal.id,
                'userId': self.other_user.id
            })
        )
        self.assert200(resp)

    def test_create_rfp_succeeds(self):
        self.login_admin()

        resp = self.app.post(
            "/api/v1/admin/rfps",
            data=json.dumps({
                "brief": "Some brief",
                "category": "CORE_DEV",
                "content": "CONTENT",
                "dateCloses": 1553980004,
                "status": "DRAFT",
                "title": "TITLE"
            })
        )
        self.assert200(resp)

    def test_get_ccrs(self):
        create_ccr(self)

        # non-admins should fail
        resp = self.app.get(
            "/api/v1/admin/ccrs"
        )
        self.assert401(resp)

        # admins should be able to retrieve ccrs
        self.login_admin()
        resp = self.app.get(
            "/api/v1/admin/ccrs"
        )
        self.assert200(resp)
        self.assertEqual(resp.json["total"], 1)

    def test_delete_ccr(self):
        ccr_json = create_ccr(self)
        ccr_id = ccr_json["ccrId"]
        fake_id = '11111111111111'
        self.login_admin()

        # bad CCR id should 404
        resp = self.app.delete(
            f"/api/v1/admin/ccrs/{fake_id}"
        )
        self.assert404(resp)

        # good CCR id should 200
        resp = self.app.delete(
            f"/api/v1/admin/ccrs/{ccr_id}"
        )
        self.assert200(resp)

        # ccr should be deleted
        resp = self.app.get(
            "/api/v1/admin/ccrs"
        )
        self.assert200(resp)
        self.assertEqual(resp.json["total"], 0)

    def test_get_ccr(self):
        ccr_json = create_ccr(self)
        ccr_id = ccr_json["ccrId"]
        fake_id = '11111111111111'
        self.login_admin()

        # bad ccr id should 404
        resp = self.app.get(
            f"/api/v1/admin/ccrs/{fake_id}"
        )
        self.assert404(resp)

        # good ccr id should 200
        resp = self.app.get(
            f"/api/v1/admin/ccrs/{ccr_id}"
        )
        self.assert200(resp)
        self.assertEqual(resp.json, ccr_json)

    def test_approve_ccr(self):
        ccr1_json = create_ccr(self)
        ccr1_id = ccr1_json["ccrId"]
        ccr2_json = create_ccr(self)
        ccr2_id = ccr2_json["ccrId"]
        fake_id = '11111111111111'
        accepted = {"isAccepted": True}
        rejected = {
            "isAccepted": False,
            "rejectReason": "test"
        }

        submit_ccr(self, ccr1_id)
        submit_ccr(self, ccr2_id)
        self.login_admin()

        # bad ccr id should 404
        resp = self.app.put(
            f"/api/v1/admin/ccrs/{fake_id}/accept",
            data=json.dumps(accepted),
            content_type='application/json'
        )
        self.assert404(resp)

        # good ccr id that's accepted should be live
        resp = self.app.put(
            f"/api/v1/admin/ccrs/{ccr1_id}/accept",
            data=json.dumps(accepted),
            content_type='application/json'
        )
        self.assertStatus(resp, 201)
        ccr = CCR.query.get(ccr1_id)
        self.assertEqual(ccr.status, CCRStatus.LIVE)

        # good ccr id that's rejected should be rejected
        resp = self.app.put(
            f"/api/v1/admin/ccrs/{ccr2_id}/accept",
            data=json.dumps(rejected),
            content_type='application/json'
        )
        self.assert200(resp)
        ccr = CCR.query.get(ccr2_id)
        self.assertEqual(ccr.status, CCRStatus.REJECTED)
        self.assertEqual(ccr.reject_reason, rejected["rejectReason"])

    def test_reject_permanently_ccr(self):
        ccr_json = create_ccr(self)
        ccr_id = ccr_json["ccrId"]
        rejected = {
            "rejectReason": "test"
        }
        self.login_admin()

        # no reject reason should 400
        resp = self.app.put(
            f"/api/v1/admin/ccrs/{ccr_id}/reject_permanently",
            content_type='application/json'
        )
        self.assert400(resp)

        # bad ccr id should 404
        resp = self.app.put(
            f"/api/v1/admin/ccrs/111111111/reject_permanently",
            data=json.dumps(rejected),
            content_type='application/json'
        )
        self.assert404(resp)

        # bad status should 401
        resp = self.app.put(
            f"/api/v1/admin/ccrs/{ccr_id}/reject_permanently",
            data=json.dumps(rejected),
            content_type='application/json'
        )
        self.assert401(resp)

        submit_ccr(self, ccr_id)

        # should go through
        resp = self.app.put(
            f"/api/v1/admin/ccrs/{ccr_id}/reject_permanently",
            data=json.dumps(rejected),
            content_type='application/json'
        )
        self.assert200(resp)

        self.assertEqual(resp.json["status"], CCRStatus.REJECTED_PERMANENTLY)
        self.assertEqual(resp.json["rejectReason"], rejected["rejectReason"])


def create_ccr(self):
    # create CCR draft
    self.login_default_user()
    resp = self.app.post(
        "/api/v1/ccrs/drafts",
    )
    ccr_id = resp.json['ccrId']
    self.assertStatus(resp, 201)

    # save CCR
    new_ccr = test_ccr.copy()
    resp = self.app.put(
        f"/api/v1/ccrs/{ccr_id}",
        data=json.dumps(new_ccr),
        content_type='application/json'
    )
    self.assertStatus(resp, 200)
    return resp.json


def submit_ccr(self, ccr_id):
    self.login_default_user()
    resp = self.app.put(
        f"/api/v1/ccrs/{ccr_id}/submit_for_approval"
    )
    self.assert200(resp)
    return resp.json

