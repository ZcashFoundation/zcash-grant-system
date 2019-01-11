import json
from mock import patch
from ..config import BaseTestConfig

from grant.email.subscription_settings import (
    email_subscriptions_to_bits,
    email_subscriptions_to_dict,
    EMAIL_SUBSCRIPTIONS
)

test_dict = {
    'my_comment_reply': True,  # 1
    'my_proposal_approval': False,
    'my_proposal_contribution': False,
    'my_proposal_funded': False,
    'my_proposal_refund': False,
    'my_proposal_comment': False,
    'funded_proposal_funded': False,
    'funded_proposal_canceled': False,
    'funded_proposal_update': True,  # 256
    'funded_proposal_payout_request': True,  # 512
}
test_bits = 512 + 256 + 1


class TestEmailSubscriptionSettings(BaseTestConfig):
    def test_email_subscriptions_to_bits(self):
        res = email_subscriptions_to_bits(test_dict)
        self.assertEquals(res, test_bits)

    def test_email_subscriptions_to_dict(self):
        res = email_subscriptions_to_dict(test_bits)
        self.maxDiff = None
        self.assertEquals(res, test_dict)
