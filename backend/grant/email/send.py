import sendgrid
from flask import render_template, Markup, current_app
from grant.settings import SENDGRID_API_KEY, SENDGRID_DEFAULT_FROM, UI
from grant.utils.misc import make_url
from python_http_client import HTTPError
from sendgrid.helpers.mail import Email, Mail, Content

from .subscription_settings import EmailSubscription, is_subscribed

default_template_args = {
    'home_url': make_url('/'),
    'account_url': make_url('/profile'),
    'email_settings_url': make_url('/profile/settings?tab=emails'),
    'unsubscribe_url': make_url('/profile/settings?tab=emails'),
}


def signup_info(email_args):
    return {
        'subject': 'Confirm your email on {}'.format(UI['NAME']),
        'title': 'Welcome to {}!'.format(UI['NAME']),
        'preview': 'Welcome to {}, we just need to confirm your email address.'.format(UI['NAME']),
    }


def team_invite_info(email_args):
    return {
        'subject': '{} has invited you to a project'.format(email_args['inviter'].display_name),
        'title': 'You’ve been invited!',
        'preview': 'You’ve been invited to the "{}" project team'.format(email_args['proposal'].title)
    }


def recover_info(email_args):
    return {
        'subject': '{} account recovery'.format(UI['NAME']),
        'title': '{} account recovery'.format(UI['NAME']),
        'preview': 'Use the link to recover your account.'
    }


def change_email_info(email_args):
    return {
        'subject': 'Confirm your new email',
        'title': 'Confirm your email',
        'preview': 'Click the link inside to confirm your new email'
    }


def change_email_old_info(email_args):
    return {
        'subject': 'Your email has been changed',
        'title': 'Email changed',
        'preview': 'Your email address has been updated on {}'.format(UI['NAME']),
    }


def change_password_info(email_args):
    return {
        'subject': 'Your password has been changed',
        'title': 'Password changed',
        'preview': 'This is just a confirmation of your recent password change'
    }


def proposal_approved(email_args):
    return {
        'subject': 'Your proposal has been approved!',
        'title': 'Your proposal has been approved',
        'preview': 'Start raising funds for {} now'.format(email_args['proposal'].title),
        'subscription': EmailSubscription.MY_PROPOSAL_APPROVAL
    }


def proposal_rejected(email_args):
    return {
        'subject': 'Your proposal has been rejected',
        'title': 'Your proposal has been rejected',
        'preview': '{} has been rejected'.format(email_args['proposal'].title),
        'subscription': EmailSubscription.MY_PROPOSAL_APPROVAL
    }


def proposal_contribution(email_args):
    return {
        'subject': 'You just got a contribution!',
        'title': 'You just got a contribution',
        'preview': '{} just contributed {} to your proposal {}'.format(
            email_args['contributor'].display_name,
            email_args['contribution'].amount,
            email_args['proposal'].title,
        ),
        'subscription': EmailSubscription.MY_PROPOSAL_FUNDED,
    }


def proposal_comment(email_args):
    return {
        'subject': 'New comment from {}'.format(email_args['author'].display_name),
        'title': 'You got a comment',
        'preview': '{} has added a comment to your proposal {}'.format(
            email_args['author'].display_name,
            email_args['proposal'].title,
        ),
        'subscription': EmailSubscription.MY_PROPOSAL_COMMENT,
    }


def proposal_failed(email_args):
    return {
        'subject': 'Your proposal failed to get funding',
        'title': 'Proposal failed',
        'preview': 'Your proposal entitled {} failed to get enough funding by the deadline'.format(
            email_args['proposal'].title,
        ),
        'subscription': EmailSubscription.MY_PROPOSAL_FUNDED,
    }


def proposal_canceled(email_args):
    return {
        'subject': 'Your proposal has been canceled',
        'title': 'Proposal canceled',
        'preview': 'Your proposal entitled {} has been canceled, and your contributors will be refunded'.format(
            email_args['proposal'].title,
        ),
    }


def staking_contribution_confirmed(email_args):
    subject = 'Your proposal has been staked!' if \
        email_args['fully_staked'] else \
        'Partial staking contribution confirmed'
    return {
        'subject': subject,
        'title': 'Staking contribution confirmed',
        'preview': 'Your {} ZEC staking contribution to {} has been confirmed!'.format(
            email_args['contribution'].amount,
            email_args['proposal'].title
        ),
        'subscription': EmailSubscription.MY_PROPOSAL_FUNDED,
    }


def contribution_confirmed(email_args):
    return {
        'subject': 'Your contribution has been confirmed!',
        'title': 'Contribution confirmed',
        'preview': 'Your {} ZEC contribution to {} has been confirmed!'.format(
            email_args['contribution'].amount,
            email_args['proposal'].title
        ),
        'subscription': EmailSubscription.FUNDED_PROPOSAL_CONTRIBUTION,
    }


def contribution_update(email_args):
    return {
        'subject': 'The {} team posted an update'.format(email_args['proposal'].title),
        'title': 'New update',
        'preview': 'The {} team has posted a new update entitled "{}"'.format(
            email_args['proposal'].title,
            email_args['proposal_update'].title,
        ),
        'subscription': EmailSubscription.FUNDED_PROPOSAL_UPDATE,
    }


def contribution_refunded(email_args):
    return {
        'subject': 'Your contribution has been refunded!',
        'title': 'Contribution refunded',
        'preview': 'Your recent contribution to {} has been refunded!'.format(
            email_args['proposal'].title
        ),
        'subscription': EmailSubscription.FUNDED_PROPOSAL_CONTRIBUTION,
    }


def contribution_proposal_failed(email_args):
    return {
        'subject': 'A proposal you contributed to failed to get funding',
        'title': 'Proposal failed',
        'preview': 'The proposal entitled {} failed to get funding, here’s how to get a refund'.format(
            email_args['proposal'].title,
        ),
        'subscription': EmailSubscription.FUNDED_PROPOSAL_FUNDED,
    }


def contribution_proposal_canceled(email_args):
    return {
        'subject': 'A proposal you contributed to has been canceled',
        'title': 'Proposal canceled',
        'preview': 'The proposal entitled {} has been canceled, here’s how to get a refund'.format(
            email_args['proposal'].title,
        ),
        'subscription': EmailSubscription.FUNDED_PROPOSAL_FUNDED,
    }


def comment_reply(email_args):
    return {
        'subject': 'New reply from {}'.format(email_args['author'].display_name),
        'title': 'You got a reply',
        'preview': '{} has replied to a comment you posted'.format(email_args['author'].display_name),
        'subscription': EmailSubscription.MY_COMMENT_REPLY,
    }


def proposal_arbiter(email_args):
    return {
        'subject': f'You have been nominated for arbiter of {email_args["proposal"].title}',
        'title': f'Arbiter Nomination',
        'preview': f'Congratulations, you have been nominated for arbiter of {email_args["proposal"].title}!',
        'subscription': EmailSubscription.ARBITER,
    }


def milestone_request(email_args):
    p = email_args['proposal']
    ms = p.current_milestone
    return {
        'subject': f'Payout request for {p.title} - {ms.title} has been made',
        'title': f'Milestone payout requested',
        'preview': f'A payout request for milestone {ms.title} has been made.',
        'subscription': EmailSubscription.ARBITER,
    }


def milestone_reject(email_args):
    p = email_args['proposal']
    ms = p.current_milestone
    return {
        'subject': f'Payout rejected for {p.title} - {ms.title}',
        'title': f'Milestone payout rejected',
        'preview': f'The payout for milestone {ms.title} has been rejected.',
        'subscription': EmailSubscription.MY_PROPOSAL_APPROVAL,
    }


def milestone_accept(email_args):
    p = email_args['proposal']
    a = email_args['amount']
    ms = p.current_milestone
    return {
        'subject': f'Payout approved for {p.title} - {ms.title}!',
        'title': f'Milestone payout approved',
        'preview': f'The payout of {a} ZEC for milestone {ms.title} has been approved.',
        'subscription': EmailSubscription.MY_PROPOSAL_APPROVAL,
    }


def milestone_paid(email_args):
    p = email_args['proposal']
    a = email_args['amount']
    ms = p.current_milestone
    return {
        'subject': f'{p.title} - {ms.title} has been paid!',
        'title': f'Milestone paid',
        'preview': f'The milestone {ms.title} payout of {a} ZEC has been paid!',
        'subscription': EmailSubscription.MY_PROPOSAL_FUNDED,
    }


get_info_lookup = {
    'signup': signup_info,
    'team_invite': team_invite_info,
    'recover': recover_info,
    'change_email': change_email_info,
    'change_email_old': change_email_old_info,
    'change_password': change_password_info,
    'proposal_approved': proposal_approved,
    'proposal_rejected': proposal_rejected,
    'proposal_contribution': proposal_contribution,
    'proposal_comment': proposal_comment,
    'proposal_failed': proposal_failed,
    'proposal_canceled': proposal_canceled,
    'staking_contribution_confirmed': staking_contribution_confirmed,
    'contribution_confirmed': contribution_confirmed,
    'contribution_update': contribution_update,
    'contribution_refunded': contribution_refunded,
    'contribution_proposal_failed': contribution_proposal_failed,
    'contribution_proposal_canceled': contribution_proposal_canceled,
    'comment_reply': comment_reply,
    'proposal_arbiter': proposal_arbiter,
    'milestone_request': milestone_request,
    'milestone_reject': milestone_reject,
    'milestone_accept': milestone_accept,
    'milestone_paid': milestone_paid
}


def generate_email(type, email_args, user=None):
    info = get_info_lookup[type](email_args)
    body_text = render_template(
        'emails/%s.txt' % (type),
        args=email_args,
        UI=UI,
    )
    body_html = render_template(
        'emails/%s.html' % (type),
        args=email_args,
        UI=UI,
    )

    template_args = { **default_template_args }
    if user:
        template_args['unsubscribe_url'] = make_url('/email/unsubscribe?code={}'.format(user.email_verification.code))


    html = render_template(
        'emails/template.html',
        args={
            **template_args,
            **info,
            'body': Markup(body_html),
        },
        UI=UI,
    )
    text = render_template(
        'emails/template.txt',
        args={
            **template_args,
            **info,
            'body': body_text,
        },
        UI=UI,
    )

    return {
        'info': info,
        'html': html,
        'text': text
    }


def send_email(to, type, email_args):
    if current_app and current_app.config.get("TESTING"):
        return

    from grant.user.models import User
    user = User.get_by_email(to)
    info = get_info_lookup[type](email_args)

    if user and 'subscription' in info:
        sub = info['subscription']
        if user and not is_subscribed(user.settings.email_subscriptions, sub):
            print(f'Ignoring send_email to {to} of type {type} because user is unsubscribed.')
            return

    try:
        email = generate_email(type, email_args, user)
        sg = sendgrid.SendGridAPIClient(apikey=SENDGRID_API_KEY)

        mail = Mail(
            from_email=Email(SENDGRID_DEFAULT_FROM),
            to_email=Email(to),
            subject=email['info']['subject'],
        )
        mail.add_content(Content('text/plain', email['text']))
        mail.add_content(Content('text/html', email['html']))

        res = sg.client.mail.send.post(request_body=mail.get())
        print('Just sent an email to %s of type %s, response code: %s' % (to, type, res.status_code))
    except HTTPError as e:
        print('An HTTP error occured while sending an email to %s - %s: %s' % (to, e.__class__.__name__, e))
        print(e.body)
    except Exception as e:
        print('An unknown error occured while sending an email to %s - %s: %s' % (to, e.__class__.__name__, e))
