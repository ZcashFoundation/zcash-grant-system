import datetime

from grant.extensions import ma, db
from grant.utils.exceptions import ValidationException
from grant.utils.misc import dt_to_unix

NOT_REQUESTED = 'NOT_REQUESTED'
ONGOING_VOTE = 'ONGOING_VOTE'
PAID = 'PAID'
MILESTONE_STAGES = [NOT_REQUESTED, ONGOING_VOTE, PAID]


class Milestone(db.Model):
    __tablename__ = "milestone"

    id = db.Column(db.Integer(), primary_key=True)
    date_created = db.Column(db.DateTime, nullable=False)

    title = db.Column(db.String(255), nullable=False)
    content = db.Column(db.Text, nullable=False)
    stage = db.Column(db.String(255), nullable=False)
    payout_percent = db.Column(db.String(255), nullable=False)
    immediate_payout = db.Column(db.Boolean)

    date_estimated = db.Column(db.DateTime, nullable=False)

    proposal_id = db.Column(db.Integer, db.ForeignKey("proposal.id"), nullable=False)

    def __init__(
            self,
            title: str,
            content: str,
            date_estimated: datetime,
            payout_percent: str,
            immediate_payout: bool,
            stage: str = NOT_REQUESTED,
            proposal_id=int
    ):
        self.title = title
        self.content = content
        self.stage = stage
        self.date_estimated = date_estimated
        self.payout_percent = payout_percent
        self.immediate_payout = immediate_payout
        self.proposal_id = proposal_id
        self.date_created = datetime.datetime.now()

    @staticmethod
    def validate(milestone):
        if len(milestone.title) > 60:
            raise ValidationException("Milestone title must be no more than 60 chars")


class MilestoneSchema(ma.Schema):
    class Meta:
        model = Milestone
        # Fields to expose
        fields = (
            "title",
            "content",
            "stage",
            "date_estimated",
            "payout_percent",
            "immediate_payout",
            "date_created",
        )

    date_created = ma.Method("get_date_created")
    date_estimated = ma.Method("get_date_estimated")

    def get_date_created(self, obj):
        return dt_to_unix(obj.date_created)

    def get_date_estimated(self, obj):
        return dt_to_unix(obj.date_estimated) if obj.date_estimated else None


milestone_schema = MilestoneSchema()
milestones_schema = MilestoneSchema(many=True)
