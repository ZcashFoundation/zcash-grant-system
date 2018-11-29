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
        "link": 'https://avatars2.githubusercontent.com/u/1393943?s=400&v=4'
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

test_other_user = {
    "accountAddress": "0xA65AD9c6006fe8948E75EC0861A1BAbaD8168DE0",
    "displayName": 'Faketoshi',
    "emailAddress": 'fake@toshi.com',
    "title": 'The Real Fake Satoshi'
    # TODO make signed messages for this for more tests
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

test_comment_message = {
    "sig": "0x08d5922e48e44229a764d85000558ac9a603ee2ce6a4439a211de4c64a7c3e782efeea90d63760dafb155af53c1dadcec10dac682e1fff8df1b4f40f9fcf08891b",
    "data": {
        "domain": {
            "name": "Grant.io",
            "version": 1,
            "chainId": 1543277948575
        },
        "types": {
            "comment": [
                {
                    "name": "Comment",
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
            "comment": "Test comment"
        },
        "primaryType": "comment"
    }
}

test_comment = {
    "signedMessage": test_comment_message["sig"],
    "rawTypedData": json.dumps(test_comment_message["data"]),
    "comment": test_comment_message["data"]["message"]["comment"]
}

test_reply_message = {
    "sig": "0x08d5922e48e44229a764d85000558ac9a603ee2ce6a4439a211de4c64a7c3e782efeea90d63760dafb155af53c1dadcec10dac682e1fff8df1b4f40f9fcf08891b",
    "data": {
        "domain": {
            "name": "Grant.io",
            "version": 1,
            "chainId": 1543277948575
        },
        "types": {
            "comment": [
                {
                    "name": "Comment",
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
            "comment": "Test reply"
        },
        "primaryType": "comment"
    }
}

test_reply = {
    "signedMessage": test_reply_message["sig"],
    "rawTypedData": json.dumps(test_reply_message["data"]),
    "comment": test_reply_message["data"]["message"]["comment"]
    # Fill in parentCommentId in test
}
