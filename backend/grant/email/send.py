from flask_sendgrid import SendGrid
from flask import render_template, Markup
from grant.utils.misc import log_error
from grant.extensions import mail

default_template_args = {
  'home_url': 'https://grant.io',
  'account_url': 'https://grant.io/user',
  'email_settings_url': 'https://grant.io/user/settings',
  'unsubscribe_url': 'https://grant.io/unsubscribe',
}

email_template_args = {
  'signup': {
    'subject': 'Confirm your email on Grant.io',
    'title': 'Welcome to Grant.io!',
    'preview': 'Welcome to Grant.io, we just need to confirm your email address.',
  },
}

def send_email(to, type, email_args):
  try:
    body_text = render_template('emails/%s.txt'%(type), args=email_args)
    body_html = render_template('emails/%s.html'%(type), args=email_args)

    html = render_template('emails/template.html', args={
      **default_template_args,
      **email_template_args[type],
      'body': Markup(body_html),
    })
    text = render_template('emails/template.txt', args={
      **default_template_args,
      **email_template_args[type],
      'body': body_text,
    })

    res = mail.send_email(
      to_email=to,
      subject=email_template_args[type]['subject'],
      text=text,
      html=html,
    )
    print('Just sent an email to %s of type %s, response code: %s'%(to, type, res.status_code))
  except Exception as e:
    log_error('An error occured while sending an email to %s - %s: %s'%(to, e.__class__.__name__,e))
