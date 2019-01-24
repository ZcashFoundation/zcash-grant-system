# Fake objects must be classes. Should stub out model properties.
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
    target = "100"


class FakeContribution(object):
    id = 123
    amount = '12.5'
    proposal_id = 123
    user_id = 123


class FakeUpdate(object):
    id = 123
    title = 'Example update'
    content = 'Example example example example\n\nExample example example example'
    proposal_id = 123


user = FakeUser()
proposal = FakeProposal()
contribution = FakeContribution()
update = FakeUpdate()

example_email_args = {
    'signup': {
        'display_name': user.display_name,
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
    'change_email': {
        'display_name': user.display_name,
        'confirm_url': 'http://someconfirmurl.com',
    },
    'change_email_old': {
        'display_name': user.display_name,
        'contact_url': 'http://somecontacturl.com',
    },
    'change_password': {
        'display_name': user.display_name,
        'recover_url': 'http://somerecoverurl.com',
        'contact_url': 'http://somecontacturl.com',
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
    'proposal_contribution': {
        'proposal': proposal,
        'contribution': contribution,
        'contributor': user,
        'funded': '50',
        'proposal_url': 'http://someproposal.com',
        'contributor_url': 'http://someuser.com',
    },
    'proposal_comment': {
        'author': user,
        'proposal': proposal,
        'preview': 'Blah blah blah blah blah...',
        'comment_url': 'http://somecomment.com',
        'author_url': 'http://someuser.com',
    },
    'contribution_confirmed': {
        'proposal': proposal,
        'contribution': contribution,
        'tx_explorer_url': 'http://someblockexplorer.com/tx/271857129857192579125',
    },
    'contribution_update': {
        'proposal': proposal,
        'proposal_update': update,
        'preview': 'Blah blah blah blah blah blah blah blah blah blah blah blah blah blah...',
        'update_url': 'http://someupdate.com',
    },
    'comment_reply': {
        'author': user,
        'proposal': proposal,
        'preview': 'Blah blah blah blah blah...',
        'comment_url': 'http://somecomment.com',
        'author_url': 'http://someuser.com',
    },
}
