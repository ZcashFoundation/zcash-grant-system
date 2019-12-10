
import json
import datetime
from ..config import BaseProposalCreatorConfig
from grant.rfp.models import RFP, RFPStatus, db, Category


class TestRfpApi(BaseProposalCreatorConfig):
    def test_rfp_like(self):
        rfp = RFP(
            title="title",
            brief="brief",
            content="content",
            date_closes=datetime.datetime(2030, 1, 1),
            bounty="10",
            status=RFPStatus.DRAFT,
        )
        rfp_id = rfp.id
        db.session.add(rfp)
        db.session.commit()

        # not logged in
        resp = self.app.put(
            f"/api/v1/rfps/{rfp_id}/like",
            data=json.dumps({"isLiked": True}),
            content_type="application/json",
        )
        self.assert401(resp)

        # logged in, but rfp does not exist
        self.login_default_user()
        resp = self.app.put(
            "/api/v1/rfps/123456789/like",
            data=json.dumps({"isLiked": True}),
            content_type="application/json",
        )
        self.assert404(resp)

        # RFP is not live
        resp = self.app.put(
            f"/api/v1/rfps/{rfp_id}/like",
            data=json.dumps({"isLiked": True}),
            content_type="application/json",
        )
        self.assert404(resp)
        self.assertEqual(resp.json["message"], "RFP is not live")

        # set RFP live, test like
        rfp = RFP.query.get(rfp_id)
        rfp.status = RFPStatus.LIVE
        db.session.add(rfp)
        db.session.commit()

        resp = self.app.put(
            f"/api/v1/rfps/{rfp_id}/like",
            data=json.dumps({"isLiked": True}),
            content_type="application/json",
        )
        self.assert200(resp)
        rfp = RFP.query.get(rfp_id)
        self.assertTrue(self.user in rfp.likes)
        resp = self.app.get(
            f"/api/v1/rfps/{rfp_id}"
        )
        self.assert200(resp)
        self.assertEqual(resp.json["authedLiked"], True)
        self.assertEqual(resp.json["likesCount"], 1)

        # test unliking
        resp = self.app.put(
            f"/api/v1/rfps/{rfp_id}/like",
            data=json.dumps({"isLiked": False}),
            content_type="application/json",
        )
        self.assert200(resp)
        rfp = RFP.query.get(rfp_id)
        self.assertTrue(self.user not in rfp.likes)
        resp = self.app.get(
            f"/api/v1/rfps/{rfp_id}"
        )
        self.assert200(resp)
        self.assertEqual(resp.json["authedLiked"], False)
        self.assertEqual(resp.json["likesCount"], 0)

