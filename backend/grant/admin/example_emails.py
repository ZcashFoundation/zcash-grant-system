class FakeUser(object):
  id = 123
  email_address = 'example@example.com'
  display_name = 'Example User'
  title = 'Email Example Dude'

class FakeProposal(object):
  id = 123
  title = 'Example proposal'
  brief = 'This is an example proposal'
  content = 'Example example example example'

user = FakeUser()
proposal = FakeProposal()

example_email_args = {
  'signup': {
    'confirm_url': 'http://someconfirmurl.com',
  },
  'team_invite': {
    'inviter': user,
    'proposal': proposal,
    'invite_url': 'http://someinviteurl.com',
  },
  'recover': {
    'recover_url': 'http://somerecoveryurl.com',
  },
}
