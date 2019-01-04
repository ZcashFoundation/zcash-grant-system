import datetime
from typing import List
from sqlalchemy import func

from grant.comment.models import Comment
from grant.extensions import ma, db
from grant.utils.misc import dt_to_unix
from grant.utils.exceptions import ValidationException

DRAFT = 'DRAFT'
PENDING = 'PENDING'
APPROVED = 'APPROVED'
REJECTED = 'REJECTED'
LIVE = 'LIVE'
DELETED = 'DELETED'
STATUSES = [DRAFT, PENDING, APPROVED, REJECTED, LIVE, DELETED]

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


class ProposalTeamInvite(db.Model):
    __tablename__ = "proposal_team_invite"

    id = db.Column(db.Integer(), primary_key=True)
    date_created = db.Column(db.DateTime)

    proposal_id = db.Column(db.Integer, db.ForeignKey("proposal.id"), nullable=False)
    address = db.Column(db.String(255), nullable=False)
    accepted = db.Column(db.Boolean)

    def __init__(self, proposal_id: int, address: str, accepted: bool = None):
        self.proposal_id = proposal_id
        self.address = address
        self.accepted = accepted
        self.date_created = datetime.datetime.now()

    @staticmethod
    def get_pending_for_user(user):
        return ProposalTeamInvite.query.filter(
            ProposalTeamInvite.accepted == None,
            (func.lower(user.email_address) == func.lower(ProposalTeamInvite.address))
        ).all()


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


class ProposalContribution(db.Model):
    __tablename__ = "proposal_contribution"

    tx_id = db.Column(db.String(255), primary_key=True)
    date_created = db.Column(db.DateTime, nullable=False)

    proposal_id = db.Column(db.Integer, db.ForeignKey("proposal.id"), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=True)
    from_address = db.Column(db.String(255), nullable=False)
    amount = db.Column(db.String(255), nullable=False)  # in eth

    def __init__(
        self,
        tx_id: str,
        proposal_id: int,
        user_id: int,
        from_address: str,
        amount: str
    ):
        self.tx_id = tx_id
        self.proposal_id = proposal_id
        self.user_id = user_id
        self.from_address = from_address
        self.amount = amount
        self.date_created = datetime.datetime.now()


class Proposal(db.Model):
    __tablename__ = "proposal"

    id = db.Column(db.Integer(), primary_key=True)
    date_created = db.Column(db.DateTime)

    # Content info
    status = db.Column(db.String(255), nullable=False)
    title = db.Column(db.String(255), nullable=False)
    brief = db.Column(db.String(255), nullable=False)
    stage = db.Column(db.String(255), nullable=False)
    content = db.Column(db.Text, nullable=False)
    category = db.Column(db.String(255), nullable=False)
    date_approved = db.Column(db.DateTime)
    date_published = db.Column(db.DateTime)
    reject_reason = db.Column(db.String(255))

    # Payment info
    target = db.Column(db.String(255), nullable=False)
    payout_address = db.Column(db.String(255), nullable=False)
    deadline_duration = db.Column(db.Integer(), nullable=False)

    # Relations
    team = db.relationship("User", secondary=proposal_team)
    comments = db.relationship(Comment, backref="proposal", lazy=True, cascade="all, delete-orphan")
    updates = db.relationship(ProposalUpdate, backref="proposal", lazy=True, cascade="all, delete-orphan")
    contributions = db.relationship(ProposalContribution, backref="proposal", lazy=True, cascade="all, delete-orphan")
    milestones = db.relationship("Milestone", backref="proposal", lazy=True, cascade="all, delete-orphan")
    invites = db.relationship(ProposalTeamInvite, backref="proposal", lazy=True, cascade="all, delete-orphan")

    def __init__(
            self,
            status: str = 'DRAFT',
            title: str = '',
            brief: str = '',
            content: str = '',
            stage: str = '',
            target: str = '0',
            payout_address: str = '',
            deadline_duration: int = 5184000,  # 60 days
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
        self.deadline_duration = deadline_duration
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

    def validate_publishable(self):
        # Require certain fields
        # TODO: I'm an idiot, make this a loop.
        if not self.title:
            raise ValidationException("Proposal must have a title")
        if not self.content:
            raise ValidationException("Proposal must have content")
        if not self.brief:
            raise ValidationException("Proposal must have a brief")
        if not self.category:
            raise ValidationException("Proposal must have a category")
        if not self.target:
            raise ValidationException("Proposal must have a target amount")
        if not self.payout_address:
            raise ValidationException("Proposal must have a payout address")
        # Then run through regular validation
        Proposal.validate(vars(self))

    @staticmethod
    def create(**kwargs):
        Proposal.validate(kwargs)
        return Proposal(
            **kwargs
        )

    @staticmethod
    def get_by_user(user):
        return Proposal.query \
            .join(proposal_team) \
            .filter(proposal_team.c.user_id == user.id) \
            .all()

    @staticmethod
    def get_by_user_contribution(user):
        return Proposal.query \
            .join(ProposalContribution) \
            .filter(ProposalContribution.user_id == user.id) \
            .order_by(ProposalContribution.date_created.desc()) \
            .all()

    def update(
        self,
        title: str = '',
        brief: str = '',
        category: str = '',
        content: str = '',
        target: str = '0',
        payout_address: str = '',
        deadline_duration: int = 5184000  # 60 days
    ):
        self.title = title
        self.brief = brief
        self.category = category
        self.content = content
        self.target = target
        self.payout_address = payout_address
        self.deadline_duration = deadline_duration
        Proposal.validate(vars(self))

    def submit_for_approval(self):
        self.validate_publishable()
        # specific validation
        if not self.status == DRAFT:
            raise ValidationException("Proposal status must be {} to submit for approval".format(DRAFT))

        self.status = PENDING

    def approve_pending(self, is_approve, reject_reason=None):
        self.validate_publishable()
        # specific validation
        if not self.status == PENDING:
            raise ValidationException("Proposal status must be {} to approve or reject".format(PENDING))

        if is_approve:
            self.status = APPROVED
        else:
            if not reject_reason:
                raise ValidationException("Please provide a reason for rejecting the proposal")
            self.status = REJECTED
            self.reject_reason = reject_reason

    def publish(self):
        self.validate_publishable()
        # specific validation
        if not self.status == APPROVED:
            raise ValidationException("Proposal status must be {}".format(APPROVED))

        self.date_published = datetime.datetime.now()
        self.status = LIVE


class ProposalSchema(ma.Schema):
    class Meta:
        model = Proposal
        # Fields to expose
        fields = (
            "stage",
            "status",
            "date_created",
            "date_approved",
            "date_published",
            "reject_reason",
            "title",
            "brief",
            "proposal_id",
            "target",
            "content",
            "comments",
            "updates",
            "contributions",
            "milestones",
            "category",
            "team",
            "payout_address",
            "deadline_duration",
            "invites"
        )

    date_created = ma.Method("get_date_created")
    date_approved = ma.Method("get_date_approved")
    date_published = ma.Method("get_date_published")
    proposal_id = ma.Method("get_proposal_id")

    comments = ma.Nested("CommentSchema", many=True)
    updates = ma.Nested("ProposalUpdateSchema", many=True)
    contributions = ma.Nested("ProposalContributionSchema", many=True)
    team = ma.Nested("UserSchema", many=True)
    milestones = ma.Nested("MilestoneSchema", many=True)
    invites = ma.Nested("ProposalTeamInviteSchema", many=True)

    def get_proposal_id(self, obj):
        return obj.id

    def get_date_created(self, obj):
        return dt_to_unix(obj.date_created)

    def get_date_approved(self, obj):
        return dt_to_unix(obj.date_approved) if obj.date_approved else None

    def get_date_published(self, obj):
        return dt_to_unix(obj.date_published) if obj.date_published else None


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


class ProposalTeamInviteSchema(ma.Schema):
    class Meta:
        model = ProposalTeamInvite
        fields = (
            "id",
            "date_created",
            "address",
            "accepted"
        )

    date_created = ma.Method("get_date_created")

    def get_date_created(self, obj):
        return dt_to_unix(obj.date_created)


proposal_team_invite_schema = ProposalTeamInviteSchema()
proposal_team_invites_schema = ProposalTeamInviteSchema(many=True)

# TODO: Find a way to extend ProposalTeamInviteSchema instead of redefining


class InviteWithProposalSchema(ma.Schema):
    class Meta:
        model = ProposalTeamInvite
        fields = (
            "id",
            "date_created",
            "address",
            "accepted",
            "proposal"
        )

    date_created = ma.Method("get_date_created")
    proposal = ma.Nested("ProposalSchema")

    def get_date_created(self, obj):
        return dt_to_unix(obj.date_created)


invite_with_proposal_schema = InviteWithProposalSchema()
invites_with_proposal_schema = InviteWithProposalSchema(many=True)


class ProposalContributionSchema(ma.Schema):
    class Meta:
        model = ProposalContribution
        # Fields to expose
        fields = (
            "id",
            "tx_id",
            "proposal_id",
            "user_id",
            "from_address",
            "amount",
            "date_created",
        )
    id = ma.Method("get_id")
    date_created = ma.Method("get_date_created")

    def get_id(self, obj):
        return obj.tx_id

    def get_date_created(self, obj):
        return dt_to_unix(obj.date_created)


proposal_contribution_schema = ProposalContributionSchema()
proposals_contribution_schema = ProposalContributionSchema(many=True)


class UserProposalSchema(ma.Schema):
    class Meta:
        model = Proposal
        # Fields to expose
        fields = (
            "proposal_id",
            "title",
            "brief",
            "date_created",
            "team",
        )
    date_created = ma.Method("get_date_created")
    proposal_id = ma.Method("get_proposal_id")
    team = ma.Nested("UserSchema", many=True)

    def get_proposal_id(self, obj):
        return obj.id

    def get_date_created(self, obj):
        return dt_to_unix(obj.date_created) * 1000


user_proposal_schema = UserProposalSchema()
user_proposals_schema = UserProposalSchema(many=True)
