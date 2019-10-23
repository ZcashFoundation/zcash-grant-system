from enum import Enum

from grant.utils.exceptions import ValidationException


# NOTE: custom migration required if order or bit changes meaning
class EmailSubscription(Enum):
    MY_COMMENT_REPLY = {
        'bit': 0,
        'key': 'my_comment_reply'
    }
    MY_PROPOSAL_APPROVAL = {
        'bit': 1,
        'key': 'my_proposal_approval'
    }
    MY_PROPOSAL_CONTRIBUTION = {
        'bit': 2,
        'key': 'my_proposal_contribution'
    }
    MY_PROPOSAL_FUNDED = {
        'bit': 3,
        'key': 'my_proposal_funded'
    }
    MY_PROPOSAL_REFUND = {
        'bit': 4,
        'key': 'my_proposal_refund'
    }
    MY_PROPOSAL_COMMENT = {
        'bit': 5,
        'key': 'my_proposal_comment'
    }
    FUNDED_PROPOSAL_CONTRIBUTION = {
        'bit': 6,
        'key': 'funded_proposal_contribution'
    }
    FUNDED_PROPOSAL_FUNDED = {
        'bit': 7,
        'key': 'funded_proposal_funded'
    }
    FUNDED_PROPOSAL_CANCELED = {
        'bit': 8,
        'key': 'funded_proposal_canceled'
    }
    FUNDED_PROPOSAL_UPDATE = {
        'bit': 9,
        'key': 'funded_proposal_update'
    }
    FUNDED_PROPOSAL_PAYOUT_REQUEST = {
        'bit': 10,
        'key': 'funded_proposal_payout_request'
    }
    ARBITER = {
        'bit': 11,
        'key': 'arbiter'
    }
    ADMIN_APPROVAL = {
        'bit': 12,
        'key': 'admin_approval'
    }
    ADMIN_ARBITER = {
        'bit': 13,
        'key': 'admin_arbiter'
    }
    ADMIN_PAYOUT = {
        'bit': 14,
        'key': 'admin_payout'
    }
    FOLLOWED_PROPOSAL = {
        'bit': 15,
        'key': 'followed_proposal'
    }


def is_email_sub_key(k: str):
    for s in EmailSubscription:
        if s.value['key'] == k:
            return True
    return False


def get_default_email_subscriptions():
    settings = {}
    for s in EmailSubscription:
        settings[s.value['key']] = True
    return settings


def validate_email_subscriptions(subs: dict):
    for k in subs:
        if not is_email_sub_key(k):
            raise ValidationException('Invalid email_subcriptions key: {}'.format(k))


def email_subscriptions_to_dict(bits: int):
    settings = {}
    for s in EmailSubscription:
        settings[s.value['key']] = get_bitmap_state(bits, s.value['bit'])
    return settings


def email_subscriptions_to_bits(subs: dict):
    validate_email_subscriptions(subs)
    settings = 0
    for s in EmailSubscription:
        sk = s.value['key']
        si = s.value['bit']
        if sk not in subs:
            raise ValidationException('Missing email_subscriptions key: {}'.format(sk))
        settings = set_bitmap_state(settings, si, subs[sk])
    return settings


def is_subscribed(user_subs: dict, sub: EmailSubscription):
    return user_subs[sub.value['key']]


def get_bitmap_state(bitmap: int, nth: int):
    return bitmap & (1 << nth) > 0


def set_bitmap_state(bitmap: int, nth: int, is_on: bool):
    if is_on:
        bitmap |= (1 << nth)
    else:
        bitmap &= ~(1 << nth)
    return bitmap
