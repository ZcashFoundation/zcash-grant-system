# Fake objects must be classes. Should stub out model properties.
class FakeUser(object):
    id = 123
    email_address = 'example@example.com'
    display_name = 'Example User'
    title = 'Email Example Dude'


class FakeMilestone(object):
    id = 123
    index = 0
    title = 'Example Milestone'


class FakeProposal(object):
    id = 123
    title = 'Example proposal'
    brief = 'This is an example proposal'
    content = 'Example example example example'
    target = "100"
    current_milestone = FakeMilestone()


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
milestone = FakeMilestone()
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
        # 'contributor': None,
        'funded': '50',
        'proposal_url': 'http://someproposal.com',
        'contributor_url': 'http://someuser.com',
        # 'contributor_url': None,
    },
    'proposal_comment': {
        'author': user,
        'proposal': proposal,
        'comment_url': 'http://somecomment.com',
        'author_url': 'http://someuser.com',
    },
    'proposal_failed': {
        'proposal': proposal,
    },
    'proposal_canceled': {
        'proposal': proposal,
        'support_url': 'http://linktosupport.com',
    },
    'contribution_confirmed': {
        'proposal': proposal,
        'contribution': contribution,
        'tx_explorer_url': 'http://someblockexplorer.com/tx/271857129857192579125',
    },
    'contribution_update': {
        'proposal': proposal,
        'proposal_update': update,
        'update_url': 'http://someupdate.com',
    },
    'contribution_refunded': {
        'proposal': proposal,
        'contribution': contribution,
        'tx_explorer_url': 'http://someblockexplorer.com/tx/271857129857192579125',
    },
    'contribution_proposal_failed': {
        'proposal': proposal,
        'contribution': contribution,
        'refund_address': 'ztqdzvnK2SE27FCWg69EdissCBn7twnfd1XWLrftiZaT4rSFCkp7eQGQDSWXBF43sM5cyA4c8qyVjBP9Cf4zTcFJxf71ve8',
        'account_settings_url': 'http://accountsettingsurl.com/',
    },
    'contribution_proposal_canceled': {
        'proposal': proposal,
        'contribution': contribution,
        'refund_address': 'ztqdzvnK2SE27FCWg69EdissCBn7twnfd1XWLrftiZaT4rSFCkp7eQGQDSWXBF43sM5cyA4c8qyVjBP9Cf4zTcFJxf71ve8',
        'account_settings_url': 'http://accountsettingsurl.com/',
    },
    'contribution_expired': {
        'proposal': proposal,
        'contribution': contribution,
        'contact_url': 'http://somecontacturl.com',
        'profile_url': 'http://someprofile.com',
        'proposal_url': 'http://someproposal.com',
    },
    'comment_reply': {
        'author': user,
        'proposal': proposal,
        'comment_url': 'http://somecomment.com',
        'author_url': 'http://someuser.com',
    },
    'proposal_arbiter': {
        'proposal': proposal,
        'proposal_url': 'http://zfnd.org/proposals/999',
        'accept_url': 'http://zfnd.org/email/arbiter?code=blah&proposalId=999',
    },
    'milestone_request': {
        'proposal': proposal,
        'proposal_milestones_url': 'http://zfnd.org/proposals/999-my-proposal?tab=milestones',
    },
    'milestone_deadline': {
        'proposal': proposal,
        'proposal_milestones_url': 'http://zfnd.org/proposals/999-my-proposal?tab=milestones',
    },
    'milestone_reject': {
        'proposal': proposal,
        'admin_note': 'We noticed that the tests were failing for the features outlined in this milestone. Please address these issues.',
        'proposal_milestones_url': 'http://zfnd.org/proposals/999-my-proposal?tab=milestones',
    },
    'milestone_accept': {
        'proposal': proposal,
        'amount': '33',
        'proposal_milestones_url': 'http://zfnd.org/proposals/999-my-proposal?tab=milestones',
    },
    'milestone_paid': {
        'proposal': proposal,
        'milestone': milestone,
        'amount': '33',
        'tx_explorer_url': 'http://someblockexplorer.com/tx/271857129857192579125',
        'proposal_milestones_url': 'http://zfnd.org/proposals/999-my-proposal?tab=milestones',
    },
    'admin_approval': {
        'proposal': proposal,
        'proposal_url': 'https://grants-admin.zfnd.org/proposals/999',
    },
    'admin_arbiter': {
        'proposal': proposal,
        'proposal_url': 'https://grants-admin.zfnd.org/proposals/999',
    },
    'admin_payout': {
        'proposal': proposal,
        'proposal_url': 'https://grants-admin.zfnd.org/proposals/999',
    },
    'followed_proposal_milestone': {
        "proposal": proposal,
        "milestone": milestone,
        "proposal_url": "http://someproposal.com",
    },
    'followed_proposal_update': {
        "proposal": proposal,
        "proposal_url": "http://someproposal.com",
    },
}
