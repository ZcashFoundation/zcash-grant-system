from flask import render_template, Markup, current_app

from grant.extensions import mail
from .subscription_settings import EmailSubscription, is_subscribed

default_template_args = {
    'home_url': 'https://grant.io',
    'account_url': 'https://grant.io/user',
    'email_settings_url': 'https://grant.io/user/settings',
    'unsubscribe_url': 'https://grant.io/unsubscribe',
}


def signup_info(email_args):
    return {
        'subject': 'Confirm your email on Grant.io',
        'title': 'Welcome to Grant.io!',
        'preview': 'Welcome to Grant.io, we just need to confirm your email address.',
    }


def team_invite_info(email_args):
    return {
        'subject': '{} has invited you to a project'.format(email_args['inviter'].display_name),
        'title': 'You’ve been invited!',
        'preview': 'You’ve been invited to the "{}" project team'.format(email_args['proposal'].title)
    }


def recover_info(email_args):
    return {
        'subject': 'Grant.io account recovery',
        'title': 'Grant.io account recovery',
        'preview': 'Use the link to recover your account.'
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


def contribution_confirmed(email_args):
    return {
        'subject': 'Your contribution has been confirmed!',
        'title': 'Contribution confirmed',
        'preview': 'Your {} ZEC contribution to {} has been confirmed!'.format(
            email_args['contribution'].amount,
            email_args['proposal'].title
        ),
    }


get_info_lookup = {
    'signup': signup_info,
    'team_invite': team_invite_info,
    'recover': recover_info,
    'proposal_approved': proposal_approved,
    'proposal_rejected': proposal_rejected,
    'contribution_confirmed': contribution_confirmed,
}


def generate_email(type, email_args, info):
    body_text = render_template('emails/%s.txt' % (type), args=email_args)
    body_html = render_template('emails/%s.html' % (type), args=email_args)

    html = render_template('emails/template.html', args={
        **default_template_args,
        **info,
        'body': Markup(body_html),
    })
    text = render_template('emails/template.txt', args={
        **default_template_args,
        **info,
        'body': body_text,
    })

    return {
        'info': info,
        'html': html,
        'text': text
    }


def send_email(to, type, email_args):
    if current_app and current_app.config.get("TESTING"):
        return

    info = get_info_lookup[type](email_args)
    if 'subscription' in info and 'user' in email_args:
        user = email_args['user']
        sub = info['subscription']
        if not is_subscribed(user.settings.email_subscriptions, sub):
            print(f'Ignoring send_email to {to} of type {type} because user is unsubscribed.')
            return

    try:
        email = generate_email(type, email_args, info)
        res = mail.send_email(
            to_email=to,
            subject=email['info']['subject'],
            text=email['text'],
            html=email['html'],
        )
        print('Just sent an email to %s of type %s, response code: %s' % (to, type, res.status_code))
    except Exception as e:
        print('An error occured while sending an email to %s - %s: %s' % (to, e.__class__.__name__, e))
