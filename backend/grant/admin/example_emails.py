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
    'proposal_approved': {
        'proposal': proposal,
        'proposal_url': 'http://someproposal.com',
        'admin_note': 'This proposal was the hottest stuff our team has seen yet. We look forward to throwing the fat stacks at you.',
    },
    'proposal_rejected': {
        'proposal': proposal,
        'proposal_url': 'http://someproposal.com',
        'admin_note': 'We think that you’ve asked for too much money for the project you’ve proposed, and for such an inexperienced team. Feel free to change your target amount, or elaborate on why you need so much money, and try applying again.',
    },
}
