from grant.utils.enums import ProposalStatus
from grant.utils.admin import generate_admin_password_hash
from mock import patch

from ..config import BaseProposalCreatorConfig
from ..test_data import mock_blockchain_api_requests


plaintext_mock_password = "p4ssw0rd"
mock_admin_auth = {
    "username": "admin",
    "password": "20cc8f433a1d6400aed9850504c33bfe51ace17ed15d62b0e046b9d7bc4b893b",
    "salt": "s4lt"
}


class TestAdminAPI(BaseProposalCreatorConfig):
    @patch.dict('grant.utils.admin.admin_auth', mock_admin_auth)
    def login_admin(self):
        return self.app.post(
            "/api/v1/admin/login",
            data={
                "username": mock_admin_auth["username"],
                "password": plaintext_mock_password
            }
        )

    @patch.dict('grant.utils.admin.admin_auth', mock_admin_auth)
    def test_generate_password_hash(self):
        # default salt
        res = generate_admin_password_hash(plaintext_mock_password)
        self.assertEqual(res, mock_admin_auth['password'])
        # specific salt
        res = generate_admin_password_hash(plaintext_mock_password, mock_admin_auth['salt'])
        self.assertEqual(res, mock_admin_auth['password'])
        # bad salt
        res = generate_admin_password_hash(plaintext_mock_password, 'badsalt')
        self.assertNotEqual(res, mock_admin_auth['password'])
        # bad pass
        res = generate_admin_password_hash('badpassword', mock_admin_auth['salt'])
        self.assertNotEqual(res, mock_admin_auth['password'])

    def test_login(self):
        resp = self.login_admin()
        self.assert200(resp)

    def test_checklogin_loggedin(self):
        self.login_admin()
        resp = self.app.get("/api/v1/admin/checklogin")
        self.assert200(resp)
        self.assertTrue(resp.json["isLoggedIn"])

    def test_checklogin_loggedout(self):
        resp = self.app.get("/api/v1/admin/checklogin")
        self.assert200(resp)
        self.assertFalse(resp.json["isLoggedIn"])

    def test_logout(self):
        self.login_admin()
        resp = self.app.get("/api/v1/admin/logout")
        self.assert200(resp)
        self.assertFalse(resp.json["isLoggedIn"])
        cl_resp = self.app.get("/api/v1/admin/checklogin")
        self.assertFalse(cl_resp.json["isLoggedIn"])

    def test_get_users(self):
        self.login_admin()
        resp = self.app.get("/api/v1/admin/users")
        self.assert200(resp)
        # 2 users created by BaseProposalCreatorConfig
        self.assertEqual(len(resp.json), 2)

    def test_get_proposals(self):
        self.login_admin()
        resp = self.app.get("/api/v1/admin/proposals")
        self.assert200(resp)
        # 2 proposals created by BaseProposalCreatorConfig
        self.assertEqual(len(resp.json), 2)

    def test_update_proposal(self):
        self.login_admin()
        # set to 1 (on)
        resp_on = self.app.put(f"/api/v1/admin/proposals/{self.proposal.id}", data={"contributionMatching": 1})
        self.assert200(resp_on)
        self.assertEqual(resp_on.json['contributionMatching'], 1)
        resp_off = self.app.put(f"/api/v1/admin/proposals/{self.proposal.id}", data={"contributionMatching": 0})
        self.assert200(resp_off)
        self.assertEqual(resp_off.json['contributionMatching'], 0)

    def test_update_proposal_no_auth(self):
        resp = self.app.put(f"/api/v1/admin/proposals/{self.proposal.id}", data={"contributionMatching": 1})
        self.assert401(resp)

    def test_update_proposal_bad_matching(self):
        self.login_admin()
        resp = self.app.put(f"/api/v1/admin/proposals/{self.proposal.id}", data={"contributionMatching": 2})
        self.assert400(resp)

    @patch('requests.get', side_effect=mock_blockchain_api_requests)
    def test_approve_proposal(self, mock_get):
        self.login_admin()

        # proposal needs to be PENDING
        self.proposal.status = ProposalStatus.PENDING

        # approve
        resp = self.app.put(
            "/api/v1/admin/proposals/{}/approve".format(self.proposal.id),
            data={"isApprove": True}
        )
        self.assert200(resp)
        self.assertEqual(resp.json["status"], ProposalStatus.APPROVED)

    @patch('requests.get', side_effect=mock_blockchain_api_requests)
    def test_reject_proposal(self, mock_get):
        self.login_admin()

        # proposal needs to be PENDING
        self.proposal.status = ProposalStatus.PENDING

        # reject
        resp = self.app.put(
            "/api/v1/admin/proposals/{}/approve".format(self.proposal.id),
            data={"isApprove": False, "rejectReason": "Funnzies."}
        )
        self.assert200(resp)
        self.assertEqual(resp.json["status"], ProposalStatus.REJECTED)
        self.assertEqual(resp.json["rejectReason"], "Funnzies.")
