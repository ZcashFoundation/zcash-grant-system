import datetime
from typing import List

from grant.comment.models import Comment
from grant.extensions import ma, db
from grant.utils.misc import dt_to_unix
from grant.utils.exceptions import ValidationException

DRAFT = 'DRAFT'
PENDING = 'PENDING'
LIVE = 'LIVE'
DELETED = 'DELETED'
STATUSES = [DRAFT, PENDING, LIVE, DELETED]

FUNDING_REQUIRED = 'FUNDING_REQUIRED'
COMPLETED = 'COMPLETED'
PROPOSAL_STAGES = [FUNDING_REQUIRED, COMPLETED]

DAPP = "DAPP"
DEV_TOOL = "DEV_TOOL"
CORE_DEV = "CORE_DEV"
COMMUNITY = "COMMUNITY"
DOCUMENTATION = "DOCUMENTATION"
ACCESSIBILITY = "ACCESSIBILITY"
CATEGORIES = [DAPP, DEV_TOOL, CORE_DEV, COMMUNITY, DOCUMENTATION, ACCESSIBILITY]


proposal_team = db.Table(
    'proposal_team', db.Model.metadata,
    db.Column('user_id', db.Integer, db.ForeignKey('user.id')),
    db.Column('proposal_id', db.Integer, db.ForeignKey('proposal.id'))
)


class ProposalUpdate(db.Model):
    __tablename__ = "proposal_update"

    id = db.Column(db.Integer(), primary_key=True)
    date_created = db.Column(db.DateTime)

    proposal_id = db.Column(db.Integer, db.ForeignKey("proposal.id"), nullable=False)
    title = db.Column(db.String(255), nullable=False)
    content = db.Column(db.Text, nullable=False)

    def __init__(self, proposal_id: int, title: str, content: str):
        self.proposal_id = proposal_id
        self.title = title
        self.content = content
        self.date_created = datetime.datetime.now()


class Proposal(db.Model):
    __tablename__ = "proposal"

    id = db.Column(db.Integer(), primary_key=True)
    date_created = db.Column(db.DateTime)

    # Database info
    status = db.Column(db.String(255), nullable=False)
    title = db.Column(db.String(255), nullable=False)
    brief = db.Column(db.String(255), nullable=False)
    stage = db.Column(db.String(255), nullable=False)
    content = db.Column(db.Text, nullable=False)
    category = db.Column(db.String(255), nullable=False)

    # Contract info
    target = db.Column(db.BigInteger, nullable=False)
    payout_address = db.Column(db.String(255), nullable=False)
    trustees = db.Column(db.String(1024), nullable=False)
    deadline_duration = db.Column(db.Integer(), nullable=False)
    vote_duration = db.Column(db.Integer(), nullable=False)
    proposal_address = db.Column(db.String(255), unique=True, nullable=True)

    # Relations
    team = db.relationship("User", secondary=proposal_team)
    comments = db.relationship(Comment, backref="proposal", lazy=True)
    updates = db.relationship(ProposalUpdate, backref="proposal", lazy=True)
    milestones = db.relationship("Milestone", backref="proposal", lazy=True)

    def __init__(
            self,
            status: str = 'DRAFT',
            title: str = '',
            brief: str = '',
            content: str = '',
            stage: str = '',
            target: str = '0',
            payout_address: str = '',
            trustees: List[str] = [],
            deadline_duration: int = 5184000, # 60 days
            vote_duration: int = 604800, # 7 days
            proposal_address: str = None,
            category: str = ''
    ):
        self.date_created = datetime.datetime.now()
        self.status = status
        self.title = title
        self.brief = brief
        self.content = content
        self.category = category
        self.target = target
        self.payout_address = payout_address
        self.trustees = ','.join(trustees)
        self.proposal_address = proposal_address
        self.deadline_duration = deadline_duration
        self.vote_duration = vote_duration
        self.stage = stage

    @staticmethod
    def validate(proposal):
        title = proposal.get('title')
        stage = proposal.get('stage')
        category = proposal.get('category')
        if title and len(title) > 60:
            raise ValidationException("Proposal title cannot be longer than 60 characters")
        if stage and stage not in PROPOSAL_STAGES:
            raise ValidationException("Proposal stage {} not in {}".format(stage, PROPOSAL_STAGES))
        if category and category not in CATEGORIES:
            raise ValidationException("Category {} not in {}".format(category, CATEGORIES))

    @staticmethod
    def create(**kwargs):
        Proposal.validate(kwargs)
        return Proposal(
            **kwargs
        )

    def publish(self):
        # Require certain fields
        if not self.title:
            raise ValidationException("Proposal must have a title")
        if not self.content:
            raise ValidationException("Proposal must have content")
        if not self.proposal_address:
            raise ValidationException("Proposal must a contract address")

        # Then run through regular validation
        Proposal.validate(vars(self))
        self.status = 'LIVE'

        


class ProposalSchema(ma.Schema):
    class Meta:
        model = Proposal
        # Fields to expose
        fields = (
            "stage",
            "date_created",
            "title",
            "proposal_id",
            "proposal_address",
            "body",
            "comments",
            "updates",
            "milestones",
            "category",
            "team"
        )

    date_created = ma.Method("get_date_created")
    proposal_id = ma.Method("get_proposal_id")
    body = ma.Method("get_body")

    comments = ma.Nested("CommentSchema", many=True)
    updates = ma.Nested("ProposalUpdateSchema", many=True)
    team = ma.Nested("UserSchema", many=True)
    milestones = ma.Nested("MilestoneSchema", many=True)

    def get_body(self, obj):
        return obj.content

    def get_proposal_id(self, obj):
        return obj.id

    def get_date_created(self, obj):
        return dt_to_unix(obj.date_created)


proposal_schema = ProposalSchema()
proposals_schema = ProposalSchema(many=True)


class ProposalUpdateSchema(ma.Schema):
    class Meta:
        model = ProposalUpdate
        # Fields to expose
        fields = (
            "update_id",
            "date_created",
            "proposal_id",
            "title",
            "content"
        )

    date_created = ma.Method("get_date_created")
    proposal_id = ma.Method("get_proposal_id")
    update_id = ma.Method("get_update_id")

    def get_update_id(self, obj):
        return obj.id

    def get_proposal_id(self, obj):
        return obj.proposal_id

    def get_date_created(self, obj):
        return dt_to_unix(obj.date_created)


proposal_update_schema = ProposalUpdateSchema()
proposals_update_schema = ProposalUpdateSchema(many=True)
