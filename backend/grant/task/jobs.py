from datetime import datetime, timedelta

from grant.extensions import db
from grant.email.send import send_email, EmailSender
from grant.utils.enums import ProposalStage, ContributionStatus
from grant.utils.misc import make_url
from flask import current_app


class ProposalReminder:
    JOB_TYPE = 1

    def __init__(self, proposal_id):
        self.proposal_id = proposal_id

    def blobify(self):
        return {"proposal_id": self.proposal_id}

    def make_task(self):
        from .models import Task
        task = Task(
            job_type=self.JOB_TYPE,
            blob=self.blobify(),
            execute_after=datetime.now()
        )
        db.session.add(task)
        db.session.commit()

    @staticmethod
    def process_task(task):
        assert task.job_type == 1, "Job type: {} is incorrect for ProposalReminder".format(task.job_type)
        from grant.proposal.models import Proposal
        proposal = Proposal.query.filter_by(id=task.blob["proposal_id"]).first()
        print(proposal)
        task.completed = True
        db.session.add(task)
        db.session.commit()


class ProposalDeadline:
    JOB_TYPE = 2

    def __init__(self, proposal):
        self.proposal = proposal

    def blobify(self):
        return {
            "proposal_id": self.proposal.id,
        }

    def make_task(self):
        from .models import Task
        task = Task(
            job_type=self.JOB_TYPE,
            blob=self.blobify(),
            execute_after=self.proposal.date_published + timedelta(seconds=self.proposal.deadline_duration),
        )
        db.session.add(task)
        db.session.commit()

    @staticmethod
    def process_task(task):
        from grant.proposal.models import Proposal
        proposal = Proposal.query.filter_by(id=task.blob["proposal_id"]).first()

        # If it was deleted, canceled, or successful, just noop out
        if not proposal or proposal.is_funded or proposal.stage != ProposalStage.FUNDING_REQUIRED:
            return

        # Otherwise, mark it as failed and inform everyone
        proposal.stage = ProposalStage.FAILED
        db.session.add(proposal)
        db.session.commit()

        # Send emails to team & contributors
        email_sender = EmailSender(current_app._get_current_object())
        for u in proposal.team:
            email_sender.add(u.email_address, 'proposal_failed', {
                'proposal': proposal,
            })
        for u in proposal.contributors:
            email_sender.add(u.email_address, 'contribution_proposal_failed', {
                'proposal': proposal,
                'refund_address': u.settings.refund_address,
                'account_settings_url': make_url('/profile/settings?tab=account')
            })
        email_sender.start()


class ContributionExpired:
    JOB_TYPE = 3

    def __init__(self, contribution):
        self.contribution = contribution

    def blobify(self):
        return {
            "contribution_id": self.contribution.id,
        }

    def make_task(self):
        from .models import Task
        task = Task(
            job_type=self.JOB_TYPE,
            blob=self.blobify(),
            execute_after=self.contribution.date_created + timedelta(hours=24),
        )
        db.session.add(task)
        db.session.commit()

    @staticmethod
    def process_task(task):
        from grant.proposal.models import ProposalContribution
        contribution = ProposalContribution.query.filter_by(id=task.blob["contribution_id"]).first()

        # If it's missing or not pending, noop out
        if not contribution or contribution.status != ContributionStatus.PENDING:
            return

        # Otherwise, inform the user (if not anonymous)
        if contribution.user:
            send_email(contribution.user.email_address, 'contribution_expired', {
                'contribution': contribution,
                'proposal': contribution.proposal,
                'contact_url': make_url('/contact'),
                'profile_url': make_url(f'/profile/{contribution.user.id}'),
                'proposal_url': make_url(f'/proposals/{contribution.proposal.id}'),
            })


JOBS = {
    1: ProposalReminder.process_task,
    2: ProposalDeadline.process_task,
    3: ContributionExpired.process_task,
}
