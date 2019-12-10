import datetime

from grant.extensions import ma, db
from grant.utils.enums import MilestoneStage
from grant.utils.exceptions import ValidationException
from grant.utils.ma_fields import UnixDate
from grant.utils.misc import gen_random_id
from grant.task.jobs import MilestoneDeadline


class MilestoneException(Exception):
    pass


class Milestone(db.Model):
    __tablename__ = "milestone"

    id = db.Column(db.Integer(), primary_key=True)
    index = db.Column(db.Integer(), nullable=False)
    date_created = db.Column(db.DateTime, nullable=False)

    title = db.Column(db.String(255), nullable=False)
    content = db.Column(db.Text, nullable=False)
    payout_percent = db.Column(db.String(255), nullable=False)
    immediate_payout = db.Column(db.Boolean)
    date_estimated = db.Column(db.DateTime, nullable=True)
    days_estimated = db.Column(db.String(255), nullable=True)

    stage = db.Column(db.String(255), nullable=False)

    date_requested = db.Column(db.DateTime, nullable=True)
    requested_user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=True)

    date_rejected = db.Column(db.DateTime, nullable=True)
    reject_reason = db.Column(db.String(255))
    reject_arbiter_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=True)

    date_accepted = db.Column(db.DateTime, nullable=True)
    accept_arbiter_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=True)

    date_paid = db.Column(db.DateTime, nullable=True)
    paid_tx_id = db.Column(db.String(255))

    proposal_id = db.Column(db.Integer, db.ForeignKey("proposal.id"), nullable=False)

    def __init__(
            self,
            index: int,
            title: str,
            content: str,
            days_estimated: str,
            payout_percent: str,
            immediate_payout: bool,
            stage: str = MilestoneStage.IDLE,
            proposal_id=int,
    ):
        self.id = gen_random_id(Milestone)
        self.title = title[:255]
        self.content = content[:255]
        self.stage = stage
        self.days_estimated = days_estimated[:255]
        self.payout_percent = payout_percent[:255]
        self.immediate_payout = immediate_payout
        self.proposal_id = proposal_id
        self.date_created = datetime.datetime.now()
        self.index = index


    @staticmethod
    def make(milestones_data, proposal):
        if milestones_data:
            # Delete & re-add milestones
            [db.session.delete(x) for x in proposal.milestones]
            for i, milestone_data in enumerate(milestones_data):
                m = Milestone(
                    title=milestone_data["title"][:255],
                    content=milestone_data["content"][:255],
                    days_estimated=str(milestone_data["days_estimated"])[:255],
                    payout_percent=str(milestone_data["payout_percent"])[:255],
                    immediate_payout=milestone_data["immediate_payout"],
                    proposal_id=proposal.id,
                    index=i
                )
                db.session.add(m)

    #  The purpose of this method is to set the `date_estimated` property on all milestones in a proposal. This works
    #  by figuring out a starting point for each milestone  (the `base_date` below) and adding `days_estimated`.
    #
    #  As proposal creators now estimate their milestones in days (instead of picking months), this method allows us to
    #  keep `date_estimated` in sync throughout the lifecycle of a proposal. For example, if a user misses their
    #  first milestone deadline by a week, this method would take the actual completion date of that milestone and
    #  adjust the `date_estimated` of the remaining milestones accordingly.
    #
    @staticmethod
    def set_v2_date_estimates(proposal):
        if not proposal.date_approved:
            raise MilestoneException(f'Cannot estimate milestone dates because proposal has no date_approved set')

        # The milestone being actively worked on
        current_milestone = proposal.current_milestone

        if current_milestone.stage == MilestoneStage.PAID:
            raise MilestoneException(f'Cannot estimate milestone dates because they are all completed')

        # The starting point for `date_estimated` calculation for each uncompleted milestone
        # We add `days_estimated` to `base_date` to calculate `date_estimated`
        base_date = None

        for index, milestone in enumerate(proposal.milestones):
            if index == 0:
                # If it's the first milestone, use the proposal approval date as a `base_date`
                base_date = proposal.date_approved

            if milestone.date_paid:
                # If milestone has been paid, set `base_date` for the next milestone and noop out
                base_date = milestone.date_paid
                continue

            days_estimated = milestone.days_estimated if not milestone.immediate_payout else "0"
            date_estimated = base_date + datetime.timedelta(days=int(days_estimated))
            milestone.date_estimated = date_estimated

            # Set the `base_date` for the next milestone using the estimate completion date of the current milestone
            base_date = date_estimated
            db.session.add(milestone)

        # Skip task creation if current milestone has an immediate payout
        if current_milestone.immediate_payout:
            return

        # Create MilestoneDeadline task for the current milestone so arbiters will be alerted if the deadline is missed
        task = MilestoneDeadline(proposal, current_milestone)
        task.make_task()

    def request_payout(self, user_id: int):
        if self.stage not in [MilestoneStage.IDLE, MilestoneStage.REJECTED]:
            raise MilestoneException(f'Cannot request payout for milestone at {self.stage} stage')
        self.stage = MilestoneStage.REQUESTED
        self.date_requested = datetime.datetime.now()
        self.requested_user_id = user_id

    def reject_request(self, arbiter_id: int, reason: str):
        if self.stage != MilestoneStage.REQUESTED:
            raise MilestoneException(f'Cannot reject payout request for milestone at {self.stage} stage')
        self.stage = MilestoneStage.REJECTED
        self.date_rejected = datetime.datetime.now()
        self.reject_reason = reason
        self.reject_arbiter_id = arbiter_id

    def accept_immediate(self):
        if self.immediate_payout and self.index == 0:
            self.proposal.send_admin_email('admin_payout')
            self.date_requested = datetime.datetime.now()
            self.stage = MilestoneStage.ACCEPTED
            self.date_accepted = datetime.datetime.now()
            db.session.add(self)
            db.session.flush()

    def accept_request(self, arbiter_id: int):
        if self.stage != MilestoneStage.REQUESTED:
            raise MilestoneException(f'Cannot accept payout request for milestone at {self.stage} stage')
        self.proposal.send_admin_email('admin_payout')
        self.stage = MilestoneStage.ACCEPTED
        self.date_accepted = datetime.datetime.now()
        self.accept_arbiter_id = arbiter_id

    def mark_paid(self, tx_id: str):
        if self.stage != MilestoneStage.ACCEPTED:
            raise MilestoneException(f'Cannot pay a milestone at {self.stage} stage')
        self.stage = MilestoneStage.PAID
        self.date_paid = datetime.datetime.now()
        self.paid_tx_id = tx_id


class MilestoneSchema(ma.Schema):
    class Meta:
        model = Milestone
        # Fields to expose
        fields = (
            "title",
            "index",
            "id",
            "content",
            "stage",
            "payout_percent",
            "immediate_payout",
            "reject_reason",
            "paid_tx_id",
            "date_created",
            "date_estimated",
            "date_requested",
            "date_rejected",
            "date_accepted",
            "date_paid",
            "days_estimated"
        )

    date_created = UnixDate(attribute='date_created')
    date_estimated = UnixDate(attribute='date_estimated')
    date_requested = UnixDate(attribute='date_requested')
    date_rejected = UnixDate(attribute='date_rejected')
    date_accepted = UnixDate(attribute='date_accepted')
    date_paid = UnixDate(attribute='date_paid')


milestone_schema = MilestoneSchema()
milestones_schema = MilestoneSchema(many=True)
