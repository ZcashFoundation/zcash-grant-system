import json

from ..config import BaseTestConfig
from ..test_data import user, message


class TestRequiredSignedMessageDecorator(BaseTestConfig):
    def test_required_sm_aborts_without_data_and_sig_headers(self):
        self.app.post(
            "/api/v1/users/",
            data=json.dumps(user),
            content_type='application/json'
        )

        response = self.app.get(
            "/api/v1/users/me",
            headers={
                "MsgSignature": message["sig"],
                # "RawTypedData: message["data"]
            }
        )

        self.assert401(response)

        response = self.app.get(
            "/api/v1/users/me",
            headers={
                # "MsgSignature": message["sig"],
                "RawTypedData": message["data"]
            }
        )

        self.assert401(response)

    def test_required_sm_aborts_without_existing_user(self):
        # We don't create the user here to test a failure case
        # self.app.post(
        #     "/api/v1/users/",
        #     data=json.dumps(user),
        #     content_type='application/json'
        # )

        response = self.app.get(
            "/api/v1/users/me",
            headers={
                "MsgSignature": message["sig"],
                "RawTypedData": message["data"]
            }
        )

        self.assert401(response)

    def test_required_sm_decorator_authorizes_when_recovered_address_matches_existing_user(self):
        self.app.post(
            "/api/v1/users/",
            data=json.dumps(user),
            content_type='application/json'
        )

        response = self.app.get(
            "/api/v1/users/me",
            headers={
                "MsgSignature": message["sig"],
                "RawTypedData": message["data"]
            }
        )

        response_json = response.json

        self.assert200(response)
        self.assertEqual(response_json["displayName"], user["displayName"])
