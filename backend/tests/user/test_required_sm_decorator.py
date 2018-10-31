import json

from ..config import BaseTestConfig

account_address = '0xcd2a3d9f938e13cd947ec05abc7fe734df8dd826'

message = {
    "sig": "0x4355c47d63924e8a72e509b65029052eb6c299d53a04e167c5775fd466751c9d07299936d304c153f6443dfa05f40ff007d72911b6f72307f996231605b915621c",
    "data": {"types": {"EIP712Domain": [{"name": "name", "type": "string"}, {"name": "version", "type": "string"},
                                        {"name": "chainId", "type": "uint256"},
                                        {"name": "verifyingContract", "type": "address"}],
                       "Person": [{"name": "name", "type": "string"}, {"name": "wallet", "type": "address"}],
                       "Mail": [{"name": "from", "type": "Person"}, {"name": "to", "type": "Person"},
                                {"name": "contents", "type": "string"}]}, "primaryType": "Mail",
             "domain": {"name": "Ether Mail", "version": "1", "chainId": 1,
                        "verifyingContract": "0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC"},
             "message": {"from": {"name": "Cow", "wallet": "0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826"},
                         "to": {"name": "Bob", "wallet": "0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB"},
                         "contents": "Hello, Bob!"}}

}

user = {
    "accountAddress": account_address,
    "displayName": 'Groot',
    "emailAddress": 'iam@groot.com',
    "title": 'I am Groot!',
    "avatar": {
        "link": 'https://avatars2.githubusercontent.com/u/1393943?s=400&v=4'
    },
    "socialMedias": [
        {
            "link": 'https://github.com/groot'
        }
    ]
}


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
