import json

from ..config import BaseProposalCreatorConfig

test_update = {
    "title": "Update Title",
    "content": "Update content."
}


def post_update(self, proposal_id):
    return self.app.post(
        "/api/v1/proposals/{}/updates".format(proposal_id),
        data=json.dumps(test_update),
        content_type='application/json'
    )


class TestProposalUpdateAPI(BaseProposalCreatorConfig):
    def test_unauthorized_create_new_proposal_update(self):
        # no login
        update_res = post_update(self, self.proposal.id)
        self.assertStatus(update_res, 401)

    def test_nonteam_create_new_proposal_update(self):
        # login non-team member user
        self.login_other_user()

        update_res = post_update(self, self.proposal.id)
        self.assertStatus(update_res, 403)

    def test_create_new_proposal_update_invalid_proposal(self):
        self.login_default_user()

        update_res = post_update(self, '12345')
        self.assertStatus(update_res, 404)

    def test_create_new_proposal_update(self):
        self.login_default_user()

        update_res = post_update(self, self.proposal.id)
        self.assertStatus(update_res, 201)

        self.assertEquals(update_res.json["title"], test_update["title"])

    def test_get_proposal_updates(self):
        self.login_default_user()

        update_res = post_update(self, self.proposal.id)
        self.assertStatus(update_res, 201)

        get_res = self.app.get("/api/v1/proposals/{}/updates".format(self.proposal.id))

        self.assertEquals(get_res.json[0]["title"], test_update["title"])

    def test_get_proposal_update(self):
        self.login_default_user()

        update_res = post_update(self, self.proposal.id)
        self.assertStatus(update_res, 201)

        update_id = update_res.json["updateId"]

        get_res = self.app.get(
            "/api/v1/proposals/{}/updates/{}".format(self.proposal.id, update_id)
        )

        self.assertEquals(get_res.json["title"], test_update["title"])
