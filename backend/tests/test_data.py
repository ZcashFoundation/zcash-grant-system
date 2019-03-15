from grant.utils.enums import Category
from .mocks import mock_request

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
        "dateEstimated": 1549505307,
        "payoutPercent": "100",
        "immediatePayout": False
    }
]

test_proposal = {
    "team": test_team,
    "content": "## My Proposal",
    "title": "Give Me Money",
    "brief": "$$$",
    "milestones": milestones,
    "category": Category.ACCESSIBILITY,
    "target": "123.456",
    "payoutAddress": "123",
    "deadlineDuration": 100
}

test_comment = {
    "comment": "Test comment"
}

test_comment_large = {
    "comment": """
    aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa
    aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa
    aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa
    aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa
    aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa
    aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa
    aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa
    aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa
    aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa
    aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa
    aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa
    aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa
    aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa
    aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa
    aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa
    """
}

test_reply = {
    "comment": "Test reply"
    # Fill in parentCommentId in test
}

mock_contribution_addresses = mock_request({
    'transparent': 't123',
    'sprout': 'z123',
    'memo': '123',
})

mock_valid_address = mock_request({
    'valid': True,
})

mock_invalid_address = mock_request({
    'valid': False,
})


def mock_blockchain_api_requests(path, **kwargs):
    if '/contribution/addresses' in path:
        return mock_contribution_addresses()
    if '/validate/address' in path:
        return mock_valid_address()
    raise Exception('No mock data defined for path {}'.format(path))
