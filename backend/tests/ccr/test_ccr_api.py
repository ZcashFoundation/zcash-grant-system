import json

from grant.ccr.models import CCR, db
from grant.utils.enums import CCRStatus
from ..config import BaseCCRCreatorConfig
from ..test_data import test_ccr


class TestCCRApi(BaseCCRCreatorConfig):

    def test_get_ccr(self):
        self.login_default_user()

        # bad ccr id should 404
        resp = self.app.get(
            "/api/v1/ccrs/1111111111"
        )
        self.assert404(resp)

        # ccr id should work if user is author
        ccr_id = self.ccr.id
        resp = self.app.get(
            f"/api/v1/ccrs/{ccr_id}"
        )
        self.assert200(resp)
        self.assertEqual(resp.json["ccrId"], ccr_id)

        # ccr id should fail if user is not author
        self.login_other_user()
        resp = self.app.get(
            f"/api/v1/ccrs/{ccr_id}"
        )
        self.assert404(resp)

        # ccr should be available to anyone if it's live
        ccr = CCR.query.get(ccr_id)
        ccr.status = CCRStatus.LIVE
        db.session.add(ccr)
        db.session.commit()
        resp = self.app.get(
            f"/api/v1/ccrs/{ccr_id}"
        )
        self.assert200(resp)
        self.assertEqual(resp.json["ccrId"], ccr_id)

        # ccr should 404 if it's deleted
        ccr = CCR.query.get(ccr_id)
        ccr.status = CCRStatus.DELETED
        db.session.add(ccr)
        db.session.commit()
        resp = self.app.get(
            f"/api/v1/ccrs/{ccr_id}"
        )
        self.assert404(resp)

    def test_make_ccr_draft(self):
        self.login_default_user()
        resp = self.app.post(
            "/api/v1/ccrs/drafts",
        )
        self.assertStatus(resp, 201)

        ccr_db = CCR.query.filter_by(id=resp.json['ccrId'])
        self.assertIsNotNone(ccr_db)

    def test_get_ccr_drafts(self):
        # should return drafts if they exist
        self.login_default_user()
        resp = self.app.get(
            "api/v1/ccrs/drafts"
        )
        self.assert200(resp)
        self.assertEqual(len(resp.json), 1)

        # should return no drafts if they don't exist
        self.login_other_user()
        resp = self.app.get(
            "api/v1/ccrs/drafts"
        )
        self.assert200(resp)
        self.assertEqual(len(resp.json), 0)

    def test_make_ccr_draft_no_auth(self):
        resp = self.app.post(
            "/api/v1/ccrs/drafts"
        )
        self.assert401(resp)

    def test_delete_ccr(self):
        ccr_id = self.ccr.id
        self.login_default_user()

        # ccr should exist
        ccr = CCR.query.get(ccr_id)
        self.assertIsNotNone(ccr)

        # author should be able to delete ccr
        resp = self.app.delete(
            f"/api/v1/ccrs/{ccr_id}"
        )
        self.assertStatus(resp, 202)

        # ccr should no longer exist
        ccr = CCR.query.get(ccr_id)
        self.assertIsNone(ccr)

    def test_update_ccr(self):
        new_title = "Updated!"
        new_ccr = test_ccr.copy()
        new_ccr["title"] = new_title

        self.login_default_user()
        resp = self.app.put(
            "/api/v1/ccrs/{}".format(self.ccr.id),
            data=json.dumps(new_ccr),
            content_type='application/json'
        )
        self.assert200(resp)
        self.assertEqual(resp.json["title"], new_title)
        self.assertEqual(self.ccr.title, new_title)

        # updates to live ccr should fail
        self.ccr.status = CCRStatus.LIVE
        db.session.add(self.ccr)
        db.session.commit()

        resp = self.app.put(
            f"/api/v1/ccrs/{self.ccr.id}",
            data=json.dumps(new_ccr),
            content_type='application/json'
        )
        self.assert400(resp)

    def test_submit_for_approval_ccr(self):
        ccr_id = self.ccr.id

        # ccr should not be pending
        ccr = CCR.query.get(ccr_id)
        self.assertTrue(ccr.status != CCRStatus.PENDING)

        # author should be able to submit for approval
        self.login_default_user()
        resp = self.app.put(
            f"/api/v1/ccrs/{ccr_id}/submit_for_approval"
        )
        self.assert200(resp)

        # ccr should be pending
        ccr = CCR.query.get(ccr_id)
        self.assertTrue(ccr.status == CCRStatus.PENDING)
