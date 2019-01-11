from grant.utils.exceptions import ValidationException

# this list defines the order of the user_settings.email_subscriptions bitmask
# always add new to the end or it will mess up current settings
EMAIL_SUBSCRIPTIONS = [
    'my_comment_reply',  # user got a reply to their comment
    'my_proposal_approval',  # approved/rejected
    'my_proposal_contribution',  # receives contribution
    'my_proposal_funded',  # funded or expired
    'my_proposal_refund',  # refunded
    'my_proposal_comment',  # comments posted
    'funded_proposal_funded',  # funded or expired
    'funded_proposal_canceled',  # proposal canceled
    'funded_proposal_update',  # update posted
    'funded_proposal_payout_request',  # milestone payment req
]


def get_default_email_subscriptions():
    settings = {}
    for k in EMAIL_SUBSCRIPTIONS:
        settings[k] = True
    return settings


def validate_email_subscriptions(subs: dict):
    for k in subs:
        if k not in EMAIL_SUBSCRIPTIONS:
            raise ValidationException('Invalid email_subcriptions key: {}'.format(k))


def email_subscriptions_to_dict(bits: int):
    settings = {}
    for i, k in enumerate(EMAIL_SUBSCRIPTIONS):
        settings[k] = get_bitmap(bits, i)
    return settings


def email_subscriptions_to_bits(subs: dict):
    validate_email_subscriptions(subs)
    settings = 0
    for i, k in enumerate(EMAIL_SUBSCRIPTIONS):
        settings = set_bitmap(settings, i, subs[k])
    return settings


def get_bitmap(bitmap, nth):
    return bitmap & (1 << nth) > 0


def set_bitmap(bitmap, nth, is_on):
    if is_on:
        bitmap |= (1 << nth)
    else:
        bitmap &= ~(1 << nth)
    return bitmap
