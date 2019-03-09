import datetime

from grant.extensions import ma, db
from grant.utils.enums import MilestoneStage
from grant.utils.exceptions import ValidationException
from grant.utils.ma_fields import UnixDate
from grant.utils.misc import gen_random_id


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
    # TODO: change to estimated_duration (sec or ms) -- FE can calc from dates on draft
    date_estimated = db.Column(db.DateTime, nullable=False)

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
            date_estimated: datetime,
            payout_percent: str,
            immediate_payout: bool,
            stage: str = MilestoneStage.IDLE,
            proposal_id=int,
    ):
        self.id = gen_random_id(Milestone)
        self.title = title
        self.content = content
        self.stage = stage
        self.date_estimated = date_estimated
        self.payout_percent = payout_percent
        self.immediate_payout = immediate_payout
        self.proposal_id = proposal_id
        self.date_created = datetime.datetime.now()
        self.index = index

    @staticmethod
    def make(milestones, proposal):
        if milestones:
            # Delete & re-add milestones
            [db.session.delete(x) for x in proposal.milestones]
            for i, milestone_data in enumerate(milestones):
                print(milestone_data)
                m = Milestone(
                    title=milestone_data["title"],
                    content=milestone_data["content"],
                    date_estimated=datetime.datetime.fromtimestamp(milestone_data["date_estimated"]),
                    payout_percent=str(milestone_data["payout_percent"]),
                    immediate_payout=milestone_data["immediate_payout"],
                    proposal_id=proposal.id,
                    index=i
                )
                db.session.add(m)

    @staticmethod
    def validate(milestone):
        if len(milestone.title) > 60:
            raise ValidationException("Milestone title must be no more than 60 chars")

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
            self.date_requested = datetime.datetime.now()
            self.stage = MilestoneStage.ACCEPTED
            self.date_accepted = datetime.datetime.now()
            db.session.add(self)
            db.session.flush()

    def accept_request(self, arbiter_id: int):
        if self.stage != MilestoneStage.REQUESTED:
            raise MilestoneException(f'Cannot accept payout request for milestone at {self.stage} stage')
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
        )

    date_created = UnixDate(attribute='date_created')
    date_estimated = UnixDate(attribute='date_estimated')
    date_requested = UnixDate(attribute='date_requested')
    date_rejected = UnixDate(attribute='date_rejected')
    date_accepted = UnixDate(attribute='date_accepted')
    date_paid = UnixDate(attribute='date_paid')


milestone_schema = MilestoneSchema()
milestones_schema = MilestoneSchema(many=True)
