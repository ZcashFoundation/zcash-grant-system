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
    "displayName": 'Groot',
    "emailAddress": 'iam@groot.com',
    "password": "p4ssw0rd",
    "title": 'I am Groot!',
    "avatar": {
        "link": 'https://your-bucket-name.s3.amazonaws.com/avatars/1.b0be8bf740ce419a80ea9e1f55974ce1.png'
    },
    "socialMedias": [
        {
            "service": 'GITHUB',
            "username": 'groot'
        }
    ]
}

test_team = [test_user]

test_other_user = {
    "displayName": 'Faketoshi',
    "emailAddress": 'fake@toshi.com',
    "title": 'The Real Fake Satoshi',
    "password": 'n4k0m0t0'
}

milestones = [
    {
        "title": "All the money straightaway",
        "content": "cool stuff with it",
        "dateEstimated": "Fri, 30 Nov 2018 01:42:23 GMT",
        "payoutPercent": "100",
        "immediatePayout": False
    }
]

test_proposal = {
    "team": test_team,
    "crowdFundContractAddress": "0x20000",
    "content": "## My Proposal",
    "title": "Give Me Money",
    "brief": "$$$",
    "milestones": milestones,
    "category": random.choice(CATEGORIES),
    "target": "123.456",
    "payoutAddress": "123",
    "deadlineDuration": 100
}

test_comment = {
    "comment": "Test comment"
}

test_reply = {
    "comment": "Test reply"
    # Fill in parentCommentId in test
}
