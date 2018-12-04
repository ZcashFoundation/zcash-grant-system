from flask import render_template, Markup, current_app

from grant.extensions import mail

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

get_info_lookup = {
    'signup': signup_info,
    'team_invite': team_invite_info
}


def send_email(to, type, email_args):
    if current_app and current_app.config.get("TESTING"):
        return

    try:
        info = get_info_lookup[type](email_args)
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

        res = mail.send_email(
            to_email=to,
            subject=info['subject'],
            text=text,
            html=html,
        )
        print('Just sent an email to %s of type %s, response code: %s' % (to, type, res.status_code))
    except Exception as e:
        print('An error occured while sending an email to %s - %s: %s' % (to, e.__class__.__name__, e))
