from datetime import datetime, timedelta

from grant.extensions import db
from grant.email.send import send_email
from grant.utils.enums import ProposalStage
from grant.utils.misc import make_url


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
        # TODO - replace with email
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

        # If it was deleted or successful, just noop out
        if not proposal or proposal.is_funded:
            return
        
        # Otherwise, mark it as failed and inform everyone
        proposal.stage = ProposalStage.FAILED
        db.session.add(proposal)
        db.session.commit()

        # TODO: Bulk-send emails instead of one per email
        for u in proposal.team:
            send_email(u.email_address, 'proposal_failed', {
                'proposal': proposal,
            })
        for c in proposal.contributions:
            send_email(c.user.email_address, 'contribution_proposal_failed', {
                'contribution': c,
                'proposal': proposal,
                'refund_address': c.user.settings.refund_address,
                'account_settings_url': make_url('/profile/settings?tab=account')
            })


JOBS = {
    1: ProposalReminder.process_task,
    2: ProposalDeadline.process_task,
}
