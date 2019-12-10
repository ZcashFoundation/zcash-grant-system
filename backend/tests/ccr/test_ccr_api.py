import json

from grant.ccr.models import CCR
from ..config import BaseCCRCreatorConfig
from ..test_data import test_ccr


class TestCCRApi(BaseCCRCreatorConfig):

    def test_create_new_draft(self):
        self.login_default_user()
        resp = self.app.post(
            "/api/v1/ccrs/drafts",
        )
        self.assertStatus(resp, 201)

        ccr_db = CCR.query.filter_by(id=resp.json['ccrId'])
        self.assertIsNotNone(ccr_db)

    def test_no_auth_create_new_draft(self):
        resp = self.app.post(
            "/api/v1/ccrs/drafts"
        )
        self.assert401(resp)

    def test_update_CCR_draft(self):
        new_title = "Updated!"
        new_ccr = test_ccr.copy()
        new_ccr["title"] = new_title

        self.login_default_user()
        resp = self.app.put(
            "/api/v1/ccrs/{}".format(self.ccr.id),
            data=json.dumps(new_ccr),
            content_type='application/json'
        )
        print(resp)
        self.assert200(resp)
        self.assertEqual(resp.json["title"], new_title)
        self.assertEqual(self.ccr.title, new_title)
