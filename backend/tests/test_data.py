import json
import random

from grant.proposal.models import CATEGORIES

message = {
    "sig": "0x7b3a85e9f158c2ae2a9ffba986a7dcb9108cf8ea9691080f80eadb506719f14925c89777aade3fabc5f9730ea389abdf7ffb0da16babdf1a1ea710b1e998cb891c",
    "data": {
        "domain": {
            "name": "Grant.io",
            "version": 1,
            "chainId": 1543277948575
        },
        "types": {
            "authorization": [
                {
                    "name": "Message Proof",
                    "type": "string"
                },
                {
                    "name": "Time",
                    "type": "string"
                }
            ],
            "EIP712Domain": [
                {
                    "name": "name",
                    "type": "string"
            },
            {
                "name": "version",
                "type": "string"
            },
            {
                "name": "chainId",
                "type": "uint256"
            }
        ]
    },
    "message": {
        "message": "I am proving the identity of 0x6bEeA1Cef016c23e292381b6FcaeC092960e41aa on Grant.io",
        "time": "Tue, 27 Nov 2018 19:02:04 GMT"
    },
    "primaryType": "authorization"
}
}

test_user = {
    "accountAddress": '0x6bEeA1Cef016c23e292381b6FcaeC092960e41aa',
    "displayName": 'Groot',
    "emailAddress": 'iam@groot.com',
    "title": 'I am Groot!',
    "avatar": {
        "link": 'https://some-bucket-name.s3.amazonaws.com/avatars/1.b0be8bf740ce419a80ea9e1f55974ce1.png'
    },
    "socialMedias": [
        {
            "link": 'https://github.com/groot'
        }
    ],
    "signedMessage": message["sig"],
    "rawTypedData": json.dumps(message["data"])
}

test_team = [test_user]

milestones = [
    {
        "title": "All the money straightaway",
        "description": "cool stuff with it",
        "date": "June 2019",
        "payoutPercent": "100",
        "immediatePayout": False
    }
]

test_proposal = {
    "team": test_team,
    "crowdFundContractAddress": "0x20000",
    "content": "## My Proposal",
    "title": "Give Me Money",
    "milestones": milestones,
    "category": random.choice(CATEGORIES)
}

milestones = [
    {
        "title": "All the money straightaway",
        "description": "cool stuff with it",
        "date": "June 2019",
        "payoutPercent": "100",
        "immediatePayout": False
    }
]
