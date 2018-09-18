import datetime

from grant.extensions import ma, db

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


class MilestoneSchema(ma.Schema):
    class Meta:
        model = Milestone
        # Fields to expose
        fields = (
            "title",
            "body",
            "content",
            "stage",
            "date_estimated",
            "payout_percent",
            "immediate_payout",
            "date_created",
        )

    body = ma.Method("get_body")

    def get_body(self, obj):
        return obj.content


milestone_schema = MilestoneSchema()
milestones_schema = MilestoneSchema(many=True)
