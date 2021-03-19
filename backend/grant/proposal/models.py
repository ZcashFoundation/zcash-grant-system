import datetime
import json
from decimal import Decimal, ROUND_DOWN
from functools import reduce
from typing import Optional

from marshmallow import post_dump
from sqlalchemy import func, or_, select, ForeignKey
from sqlalchemy.ext.hybrid import hybrid_property
from sqlalchemy.orm import column_property

from grant.comment.models import Comment
from grant.email.send import send_email
from grant.extensions import ma, db
from grant.milestone.models import Milestone
from grant.settings import PROPOSAL_STAKING_AMOUNT, PROPOSAL_TARGET_MAX
from grant.task.jobs import ContributionExpired
from grant.utils.enums import (
    ProposalStatus,
    ProposalStage,
    ContributionStatus,
    ProposalArbiterStatus,
    MilestoneStage,
    ProposalChange
)
from grant.utils.exceptions import ValidationException
from grant.utils.misc import dt_to_unix, make_url, make_admin_url, gen_random_id
from grant.utils.requests import blockchain_get
from grant.utils.stubs import anonymous_user
from grant.utils.validate import is_z_address_valid

proposal_team = db.Table(
    'proposal_team', db.Model.metadata,
    db.Column('user_id', db.Integer, db.ForeignKey('user.id')),
    db.Column('proposal_id', db.Integer, db.ForeignKey('proposal.id'))
)

proposal_follower = db.Table(
    "proposal_follower",
    db.Model.metadata,
    db.Column("user_id", db.Integer, db.ForeignKey("user.id")),
    db.Column("proposal_id", db.Integer, db.ForeignKey("proposal.id")),
)

proposal_liker = db.Table(
    "proposal_liker",
    db.Model.metadata,
    db.Column("user_id", db.Integer, db.ForeignKey("user.id")),
    db.Column("proposal_id", db.Integer, db.ForeignKey("proposal.id")),
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
        self.address = address[:255]
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
        self.id = gen_random_id(ProposalUpdate)
        self.proposal_id = proposal_id
        self.title = title[:255]
        self.content = content
        self.date_created = datetime.datetime.now()


class ProposalContribution(db.Model):
    __tablename__ = "proposal_contribution"

    id = db.Column(db.Integer(), primary_key=True)
    date_created = db.Column(db.DateTime, nullable=False)

    proposal_id = db.Column(db.Integer, db.ForeignKey("proposal.id"), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=True)
    status = db.Column(db.String(255), nullable=False)
    amount = db.Column(db.String(255), nullable=False)
    tx_id = db.Column(db.String(255), nullable=True)
    refund_tx_id = db.Column(db.String(255), nullable=True)
    staking = db.Column(db.Boolean, nullable=False)
    private = db.Column(db.Boolean, nullable=False, default=False, server_default='true')

    user = db.relationship("User")

    def __init__(
            self,
            proposal_id: int,
            amount: str,
            user_id: int = None,
            staking: bool = False,
            private: bool = True,
    ):
        self.proposal_id = proposal_id
        self.amount = amount
        self.user_id = user_id
        self.staking = staking
        self.private = private
        self.date_created = datetime.datetime.now()
        self.status = ContributionStatus.PENDING

    @staticmethod
    def get_existing_contribution(user_id: int, proposal_id: int, amount: str, private: bool = False):
        return ProposalContribution.query.filter_by(
            user_id=user_id,
            proposal_id=proposal_id,
            amount=amount,
            private=private,
            status=ContributionStatus.PENDING,
        ).first()

    @staticmethod
    def get_by_userid(user_id):
        return ProposalContribution.query \
            .filter(ProposalContribution.user_id == user_id) \
            .filter(ProposalContribution.status != ContributionStatus.DELETED) \
            .filter(ProposalContribution.staking == False) \
            .order_by(ProposalContribution.date_created.desc()) \
            .all()

    @staticmethod
    def validate(contribution):
        proposal_id = contribution.get('proposal_id')
        user_id = contribution.get('user_id')
        status = contribution.get('status')
        amount = contribution.get('amount')
        tx_id = contribution.get('tx_id')

        # Proposal ID (must belong to an existing proposal)
        if proposal_id:
            proposal = Proposal.query.filter(Proposal.id == proposal_id).first()
            if not proposal:
                raise ValidationException('No proposal matching that ID')
            contribution.proposal_id = proposal_id
        else:
            raise ValidationException('Proposal ID is required')
        # User ID (must belong to an existing user)
        if user_id:
            from grant.user.models import User

            user = User.query.filter(User.id == user_id).first()
            if not user:
                raise ValidationException('No user matching that ID')
            contribution.user_id = user_id
        else:
            raise ValidationException('User ID is required')
        # Status (must be in list of statuses)
        if status:
            if not ContributionStatus.includes(status):
                raise ValidationException('Invalid status')
            contribution.status = status
        else:
            raise ValidationException('Status is required')
        # Amount (must be a Decimal parseable)
        if amount:
            try:
                contribution.amount = str(Decimal(amount))
            except:
                raise ValidationException('Amount must be a number')
        else:
            raise ValidationException('Amount is required')

    def confirm(self, tx_id: str, amount: str):
        self.status = ContributionStatus.CONFIRMED
        self.tx_id = tx_id
        self.amount = amount

    @hybrid_property
    def refund_address(self):
        return self.user.settings.refund_address if self.user else None


class ProposalArbiter(db.Model):
    __tablename__ = "proposal_arbiter"

    id = db.Column(db.Integer(), primary_key=True)
    proposal_id = db.Column(db.Integer, db.ForeignKey("proposal.id"), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=True)
    status = db.Column(db.String(255), nullable=False)

    proposal = db.relationship("Proposal", lazy=True, back_populates="arbiter")
    user = db.relationship("User", uselist=False, lazy=True, back_populates="arbiter_proposals")

    def __init__(self, proposal_id: int, user_id: int = None, status: str = ProposalArbiterStatus.MISSING):
        self.id = gen_random_id(ProposalArbiter)
        self.proposal_id = proposal_id
        self.user_id = user_id
        self.status = status

    def accept_nomination(self, user_id: int):
        if self.user_id == user_id:
            self.status = ProposalArbiterStatus.ACCEPTED
            db.session.add(self)
            db.session.commit()
            return
        raise ValidationException('User not nominated for arbiter')

    def reject_nomination(self, user_id: int):
        if self.user_id == user_id:
            self.status = ProposalArbiterStatus.MISSING
            self.user = None
            db.session.add(self)
            db.session.commit()
            return
        raise ValidationException('User is not arbiter')


class ProposalRevision(db.Model):
    __tablename__ = "proposal_revision"

    id = db.Column(db.Integer(), primary_key=True)
    date_created = db.Column(db.DateTime)

    # user who submitted the changes
    author_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    author = db.relationship("User", uselist=False, lazy=True)

    # the proposal these changes are associated with
    proposal_id = db.Column(db.Integer, db.ForeignKey("proposal.id"), nullable=False)
    proposal = db.relationship("Proposal", foreign_keys=[proposal_id], back_populates="revisions")

    # the archived proposal id associated with these changes
    proposal_archive_id = db.Column(db.Integer, db.ForeignKey("proposal.id"), nullable=False)

    # the detected changes as a JSON string
    changes = db.Column(db.Text, nullable=False)

    # the placement of this revision in the total revisions
    revision_index = db.Column(db.Integer)

    def __init__(self, author, proposal_id: int, proposal_archive_id: int, changes: str, revision_index: int):
        self.id = gen_random_id(ProposalRevision)
        self.date_created = datetime.datetime.now()
        self.author = author
        self.proposal_id = proposal_id
        self.proposal_archive_id = proposal_archive_id
        self.changes = changes
        self.revision_index = revision_index

    @staticmethod
    def calculate_milestone_changes(old_milestones, new_milestones):
        changes = []
        old_length = len(old_milestones)
        new_length = len(new_milestones)

        # determine the longer milestone collection so we can enumerate it
        long_ms = None
        short_ms = None
        if old_length >= new_length:
            long_ms = old_milestones
            short_ms = new_milestones
        else:
            long_ms = new_milestones
            short_ms = old_milestones

        # detect whether we're adding or removing milestones
        is_adding = False
        is_removing = False
        if old_length > new_length:
            is_removing = True
        if new_length > old_length:
            is_adding = True

        for i, ms in enumerate(long_ms):
            compare_ms = short_ms[i] if len(short_ms) - 1 >= i else None

            # when compare milestone doesn't exist, the current milestone is either being added or removed
            if not compare_ms:
                if is_adding:
                    changes.append({"type": ProposalChange.MILESTONE_ADD, "milestone_index": i})
                if is_removing:
                    changes.append({"type": ProposalChange.MILESTONE_REMOVE, "milestone_index": i})
                continue

            if ms.days_estimated != compare_ms.days_estimated:
                changes.append({"type": ProposalChange.MILESTONE_EDIT_DAYS, "milestone_index": i})

            if ms.immediate_payout != compare_ms.immediate_payout:
                changes.append({"type": ProposalChange.MILESTONE_EDIT_IMMEDIATE_PAYOUT, "milestone_index": i})

            if ms.payout_percent != compare_ms.payout_percent:
                changes.append({"type": ProposalChange.MILESTONE_EDIT_PERCENT, "milestone_index": i})

            if ms.content != compare_ms.content:
                changes.append({"type": ProposalChange.MILESTONE_EDIT_CONTENT, "milestone_index": i})

            if ms.title != compare_ms.title:
                changes.append({"type": ProposalChange.MILESTONE_EDIT_TITLE, "milestone_index": i})

        return changes

    @staticmethod
    def calculate_proposal_changes(old_proposal, new_proposal):
        proposal_changes = []

        if old_proposal.brief != new_proposal.brief:
            proposal_changes.append({"type": ProposalChange.PROPOSAL_EDIT_BRIEF})

        if old_proposal.content != new_proposal.content:
            proposal_changes.append({"type": ProposalChange.PROPOSAL_EDIT_CONTENT})

        if old_proposal.target != new_proposal.target:
            proposal_changes.append({"type": ProposalChange.PROPOSAL_EDIT_TARGET})

        if old_proposal.title != new_proposal.title:
            proposal_changes.append({"type": ProposalChange.PROPOSAL_EDIT_TITLE})

        milestone_changes = ProposalRevision.calculate_milestone_changes(old_proposal.milestones,
                                                                         new_proposal.milestones)

        return proposal_changes + milestone_changes


def default_proposal_content():
    return """# Applicant background

Summarize you and/or your team’s background and experience. Demonstrate that you have the skills and expertise necessary for the project that you’re proposing. Institutional bona fides are not required, but we want to hear about your track record.

# Motivation and overview

What are your high-level goals? Why are they important? How is your project connected to [ZF’s mission](https://www.zfnd.org/about/#mission) and priorities? Whose needs will it serve?

# Technical approach

Dive into the _how_ of your project. Describe your approaches, components, workflows, methodology, etc. Bullet points and diagrams are appreciated!

# Execution risks

What obstacles do you expect? What is most likely to go wrong? Which unknown factors or dependencies could jeopardize success? What are your contingency plans? Will subsequent activities be required to maximize impact?

# Downsides

What are the negative ramifications if your project is successful? Consider usability, stability, privacy, integrity, availability, decentralization, interoperability, maintainability, technical debt, requisite education, etc.

# Evaluation plan

What will your project look like if successful? How will we be able to tell? Include quantifiable metrics if possible.

# Tasks and schedule

What is your timeline for the project? Include concrete milestones and the major tasks required to complete each milestone.

# Budget and justification

How much funding do you need, and how will it be allocated (e.g., compensation for your effort, specific equipment, specific external services)? Specify a total cost, break it up into budget items, and explain the rationale for each. Feel free to present multiple options in terms of scope and cost.

"""


class Proposal(db.Model):
    __tablename__ = "proposal"

    id = db.Column(db.Integer(), primary_key=True)
    date_created = db.Column(db.DateTime)
    rfp_id = db.Column(db.Integer(), db.ForeignKey('rfp.id'), nullable=True)
    version = db.Column(db.String(255), nullable=True)

    # Content info
    status = db.Column(db.String(255), nullable=False)
    title = db.Column(db.String(255), nullable=False)
    brief = db.Column(db.String(255), nullable=False)
    stage = db.Column(db.String(255), nullable=False)
    content = db.Column(db.Text, nullable=False, default=default_proposal_content())
    category = db.Column(db.String(255), nullable=True)
    date_approved = db.Column(db.DateTime)
    date_published = db.Column(db.DateTime)
    reject_reason = db.Column(db.String())
    kyc_approved = db.Column(db.Boolean(), nullable=True, default=False)
    funded_by_zomg = db.Column(db.Boolean(), nullable=True, default=False)

    accepted_with_funding = db.Column(db.Boolean(), nullable=True)
    changes_requested_discussion = db.Column(db.Boolean(), nullable=True)
    changes_requested_discussion_reason = db.Column(db.String(255), nullable=True)

    # Payment info
    target = db.Column(db.String(255), nullable=False)
    payout_address = db.Column(db.String(255), nullable=False)
    deadline_duration = db.Column(db.Integer(), nullable=True)
    contribution_matching = db.Column(db.Float(), nullable=False, default=0, server_default=db.text("0"))
    contribution_bounty = db.Column(db.String(255), nullable=False, default='0', server_default=db.text("'0'"))
    rfp_opt_in = db.Column(db.Boolean(), nullable=True)
    contributed = db.column_property()
    tip_jar_address = db.Column(db.String(255), nullable=True)
    tip_jar_view_key = db.Column(db.String(255), nullable=True)

    # Relations
    team = db.relationship("User", secondary=proposal_team)
    comments = db.relationship(Comment, backref="proposal", lazy=True, cascade="all, delete-orphan")
    updates = db.relationship(ProposalUpdate, backref="proposal", lazy=True, cascade="all, delete-orphan")
    contributions = db.relationship(ProposalContribution, backref="proposal", lazy=True, cascade="all, delete-orphan")
    milestones = db.relationship("Milestone", backref="proposal",
                                 order_by="asc(Milestone.index)", lazy=True, cascade="all, delete-orphan")
    invites = db.relationship(ProposalTeamInvite, backref="proposal", lazy=True, cascade="all, delete-orphan")
    arbiter = db.relationship(ProposalArbiter, uselist=False, back_populates="proposal", cascade="all, delete-orphan")
    followers = db.relationship(
        "User", secondary=proposal_follower, back_populates="followed_proposals"
    )
    followers_count = column_property(
        select([func.count(proposal_follower.c.proposal_id)])
            .where(proposal_follower.c.proposal_id == id)
            .correlate_except(proposal_follower)
    )
    likes = db.relationship(
        "User", secondary=proposal_liker, back_populates="liked_proposals"
    )
    likes_count = column_property(
        select([func.count(proposal_liker.c.proposal_id)])
            .where(proposal_liker.c.proposal_id == id)
            .correlate_except(proposal_liker)
    )
    live_draft_parent_id = db.Column(db.Integer, ForeignKey('proposal.id'))
    live_draft = db.relationship("Proposal", uselist=False,
                                 backref=db.backref('live_draft_parent', remote_side=[id], uselist=False))

    revisions = db.relationship(ProposalRevision, foreign_keys=[ProposalRevision.proposal_id], lazy=True,
                                cascade="all, delete-orphan")

    def __init__(
            self,
            status: str = ProposalStatus.DRAFT,
            title: str = '',
            brief: str = '',
            content: str = default_proposal_content(),
            stage: str = ProposalStage.PREVIEW,
            target: str = '0',
            payout_address: str = '',
            deadline_duration: int = 5184000,  # 60 days
            category: str = ''
    ):
        self.id = gen_random_id(Proposal)
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
        self.version = '2'
        self.funded_by_zomg = True

    @staticmethod
    def simple_validate(proposal):
        # Validate fields to be database save-able.
        # Stricter validation is done in validate_publishable.
        stage = proposal.get('stage')

        if stage and not ProposalStage.includes(stage):
            raise ValidationException("Proposal stage {} is not a valid stage".format(stage))

    def validate_publishable_milestones(self):
        payout_total = 0.0
        for i, milestone in enumerate(self.milestones):

            if milestone.immediate_payout and i != 0:
                raise ValidationException("Only the first milestone can have an immediate payout")

            if len(milestone.title) > 60:
                raise ValidationException("Milestone title cannot be longer than 60 chars")

            if len(milestone.content) > 200:
                raise ValidationException("Milestone content cannot be longer than 200 chars")

            try:
                p = float(milestone.payout_percent)
                if not p.is_integer():
                    raise ValidationException("Milestone payout percents must be whole numbers, no decimals")
                if p <= 0 or p > 100:
                    raise ValidationException("Milestone payout percent must be greater than zero")
            except ValueError:
                raise ValidationException("Milestone payout percent must be a number")

            payout_total += p

        if payout_total != 100.0:
            raise ValidationException("Payout percentages of milestones must add up to exactly 100%")

    def validate_publishable(self):
        self.validate_publishable_milestones()

        # Require certain fields
        required_fields = ['title', 'content', 'brief', 'target', 'payout_address']
        for field in required_fields:
            if not hasattr(self, field):
                raise ValidationException("Proposal must have a {}".format(field))

        # Stricter limits on certain fields
        if len(self.title) > 60:
            raise ValidationException("Proposal title cannot be longer than 60 characters")
        if len(self.brief) > 140:
            raise ValidationException("Brief cannot be longer than 140 characters")
        if len(self.content) > 250000:
            raise ValidationException("Content cannot be longer than 250,000 characters")
        if Decimal(self.target) > PROPOSAL_TARGET_MAX:
            raise ValidationException("Target cannot be more than {} USD".format(PROPOSAL_TARGET_MAX))
        if Decimal(self.target) < 0:
            raise ValidationException("Target cannot be less than 0")
        if not self.target.isdigit():
            raise ValidationException("Target must be a whole number")
        if self.deadline_duration > 7776000:
            raise ValidationException("Deadline duration cannot be more than 90 days")

        # Validate payout address
        if not is_z_address_valid(self.payout_address):
            raise ValidationException("Payout address is not a valid z address")

        # Validate tip jar address
        if self.tip_jar_address and not is_z_address_valid(self.tip_jar_address):
            raise ValidationException("Tip address is not a valid z address")

        # Then run through regular validation
        Proposal.simple_validate(vars(self))

    def validate_milestone_days(self):
        for milestone in self.milestones:
            if milestone.immediate_payout:
                continue

            try:
                p = float(milestone.days_estimated)
                if not p.is_integer():
                    raise ValidationException("Milestone days estimated must be whole numbers, no decimals")
                if p <= 0:
                    raise ValidationException("Milestone days estimated must be greater than zero")
                if p > 365:
                    raise ValidationException("Milestone days estimated must be less than 365")

            except ValueError:
                raise ValidationException("Milestone days estimated must be a number")
        return

    @staticmethod
    def create(**kwargs):
        Proposal.simple_validate(kwargs)
        proposal = Proposal(
            **kwargs
        )

        # arbiter needs proposal.id
        db.session.add(proposal)
        db.session.flush()

        arbiter = ProposalArbiter(proposal_id=proposal.id)
        db.session.add(arbiter)

        return proposal

    @staticmethod
    def get_by_user(user, statuses=[ProposalStatus.LIVE, ProposalStatus.DISCUSSION]):
        status_filter = or_(Proposal.status == v for v in statuses)
        return Proposal.query \
            .join(proposal_team) \
            .filter(proposal_team.c.user_id == user.id) \
            .filter(status_filter) \
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
            tip_jar_address: Optional[str] = None,
            deadline_duration: int = 5184000  # 60 days
    ):
        self.title = title[:255]
        self.brief = brief[:255]
        self.category = category
        self.content = content[:300000]
        self.target = target[:255] if target != '' else '0'
        self.payout_address = payout_address[:255]
        self.tip_jar_address = tip_jar_address[:255] if tip_jar_address is not None else None
        self.deadline_duration = deadline_duration
        Proposal.simple_validate(vars(self))

    def update_rfp_opt_in(self, opt_in: bool):
        self.rfp_opt_in = opt_in

    def create_contribution(
            self,
            amount,
            user_id: int = None,
            staking: bool = False,
            private: bool = True,
    ):
        contribution = ProposalContribution(
            proposal_id=self.id,
            amount=amount,
            user_id=user_id,
            staking=staking,
            private=private
        )
        db.session.add(contribution)
        db.session.flush()
        if user_id:
            task = ContributionExpired(contribution)
            task.make_task()
        db.session.commit()
        return contribution

    def get_staking_contribution(self, user_id: int):
        contribution = None
        remaining = PROPOSAL_STAKING_AMOUNT - Decimal(self.amount_staked)
        # check funding
        if remaining > 0:
            # find pending contribution for any user of remaining amount
            contribution = ProposalContribution.query.filter_by(
                proposal_id=self.id,
                status=ProposalStatus.PENDING,
                staking=True,
            ).first()
            if not contribution:
                contribution = self.create_contribution(
                    user_id=user_id,
                    amount=str(remaining.normalize()),
                    staking=True,
                )

        return contribution

    def send_admin_email(self, type: str):
        from grant.user.models import User
        admins = User.get_admins()
        for a in admins:
            send_email(a.email_address, type, {
                'user': a,
                'proposal': self,
                'proposal_url': make_admin_url(f'/proposals/{self.id}'),
            })

    # state: status (DRAFT || REJECTED) -> (PENDING)
    def submit_for_approval(self):
        self.validate_publishable()
        self.validate_milestone_days()
        allowed_statuses = [ProposalStatus.DRAFT, ProposalStatus.REJECTED]
        # specific validation
        if self.status not in allowed_statuses:
            raise ValidationException(f"Proposal status must be draft or rejected to submit for approval")
        self.set_pending()

    def set_pending_when_ready(self):
        if self.status == ProposalStatus.STAKING and self.is_staked:
            self.set_pending()

    # state: status STAKING -> PENDING
    def set_pending(self):
        self.send_admin_email('admin_approval')
        self.status = ProposalStatus.PENDING
        db.session.add(self)
        db.session.flush()

    # approve a proposal moving from PENDING to DISCUSSION status
    # state: status PENDING -> (DISCUSSION || REJECTED)
    def approve_discussion(self, is_open_for_discussion, reject_reason=None):
        if not self.status == ProposalStatus.PENDING:
            raise ValidationException("Proposal must be pending to open for public discussion")

        if is_open_for_discussion:
            self.status = ProposalStatus.DISCUSSION
            for t in self.team:
                send_email(t.email_address, 'proposal_approved_discussion', {
                    'user': t,
                    'proposal': self,
                    'proposal_url': make_url(f'/proposals/{self.id}')
                })
        else:
            if not reject_reason:
                raise ValidationException("Please provide a reason for rejecting the proposal")
            self.status = ProposalStatus.REJECTED
            self.reject_reason = reject_reason
            for t in self.team:
                send_email(t.email_address, 'proposal_rejected', {
                    'user': t,
                    'proposal': self,
                    'proposal_url': make_url(f'/proposals/{self.id}'),
                    'admin_note': reject_reason
                })

    # request changes for a proposal with a DISCUSSION status
    def request_changes_discussion(self, reason):
        if self.status != ProposalStatus.DISCUSSION:
            raise ValidationException("Proposal does not have a DISCUSSION status")
        if not reason:
            raise ValidationException("Please provide a reason for requesting changes")

        self.changes_requested_discussion = True
        self.changes_requested_discussion_reason = reason
        for t in self.team:
            send_email(t.email_address, 'proposal_rejected_discussion', {
                'user': t,
                'proposal': self,
                'proposal_url': make_url(f'/proposals/{self.id}'),
                'admin_note': reason
            })

    # mark a request changes as resolve for a proposal with a DISCUSSION status
    def resolve_changes_discussion(self):
        if self.status != ProposalStatus.DISCUSSION:
            raise ValidationException("Proposal does not have a DISCUSSION status")

        if not self.changes_requested_discussion:
            raise ValidationException("Proposal does not have changes requested")

        self.changes_requested_discussion = False
        self.changes_requested_discussion_reason = None

    # state: status DISCUSSION -> (LIVE)
    def accept_proposal(self, with_funding):
        self.validate_publishable()
        # specific validation
        if not self.status == ProposalStatus.DISCUSSION:
            raise ValidationException(f"Proposal must have a DISCUSSION status to approve or reject")

        self.status = ProposalStatus.LIVE
        self.date_approved = datetime.datetime.now()
        self.accepted_with_funding = with_funding

        # also update date_published and stage since publish() is no longer called by user
        self.date_published = datetime.datetime.now()
        self.stage = ProposalStage.WIP

        if with_funding:
            self.fully_fund_contibution_bounty()
        for t in self.team:
            if with_funding:
                admin_note = 'Congratulations! Your proposal has been accepted with funding from the Zcash Foundation.'
                send_email(t.email_address, 'proposal_approved', {
                    'user': t,
                    'proposal': self,
                    'proposal_url': make_url(f'/proposals/{self.id}'),
                    'admin_note': admin_note
                })
            else:
                admin_note = '''
                We've chosen to list your proposal on ZF Grants, but we won't be funding your proposal at this time. 
                Your proposal can still receive funding from the community in the form of tips if you have set a tip address for your proposal. 
                If you have not yet done so, you can do this from the actions dropdown at your proposal.
                '''
                send_email(t.email_address, 'proposal_approved_without_funding', {
                    'user': t,
                    'proposal': self,
                    'proposal_url': make_url(f'/proposals/{self.id}'),
                    'admin_note': admin_note
                })

    def update_proposal_with_funding(self):
        self.accepted_with_funding = True
        self.fully_fund_contibution_bounty()

    # state: status APPROVE -> LIVE, stage PREVIEW -> FUNDING_REQUIRED
    def publish(self):
        self.validate_publishable()
        # specific validation
        if not self.status == ProposalStatus.APPROVED:
            raise ValidationException(f"Proposal status must be approved")
        self.date_published = datetime.datetime.now()
        self.status = ProposalStatus.LIVE
        self.stage = ProposalStage.WIP

    def set_contribution_bounty(self, bounty: str):
        # do not allow changes on funded/WIP proposals
        if self.is_funded:
            raise ValidationException("Cannot change contribution bounty on fully-funded proposal")
        # wrap in Decimal so it throws for non-decimal strings
        self.contribution_bounty = str(Decimal(bounty))
        db.session.add(self)
        db.session.flush()

    def fully_fund_contibution_bounty(self):
        self.set_contribution_bounty(self.target)

    def cancel(self):
        if self.status != ProposalStatus.LIVE:
            raise ValidationException("Cannot cancel a proposal until it's live")

        self.stage = ProposalStage.CANCELED
        db.session.add(self)
        db.session.flush()

        # Send emails to team & contributors
        for u in self.team:
            send_email(u.email_address, 'proposal_canceled', {
                'proposal': self,
                'support_url': make_url('/contact'),
            })
        for u in self.contributors:
            send_email(u.email_address, 'contribution_proposal_canceled', {
                'proposal': self,
                'refund_address': u.settings.refund_address,
                'account_settings_url': make_url('/profile/settings?tab=account')
            })

    def follow(self, user, is_follow):
        if is_follow:
            self.followers.append(user)
        else:
            self.followers.remove(user)
        db.session.flush()

    def like(self, user, is_liked):
        if is_liked:
            self.likes.append(user)
        else:
            self.likes.remove(user)
        db.session.flush()

    def send_follower_email(self, type: str, email_args={}, url_suffix=""):
        for u in self.followers:
            send_email(
                u.email_address,
                type,
                {
                    "user": u,
                    "proposal": self,
                    "proposal_url": make_url(f"/proposals/{self.id}{url_suffix}"),
                    **email_args,
                },
            )

    @hybrid_property
    def contributed(self):
        contributions = ProposalContribution.query \
            .filter_by(proposal_id=self.id, status=ContributionStatus.CONFIRMED, staking=False) \
            .all()
        funded = reduce(lambda prev, c: prev + Decimal(c.amount), contributions, 0)
        return str(funded)

    @hybrid_property
    def amount_staked(self):
        contributions = ProposalContribution.query \
            .filter_by(proposal_id=self.id, status=ContributionStatus.CONFIRMED, staking=True) \
            .all()
        amount = reduce(lambda prev, c: prev + Decimal(c.amount), contributions, 0)
        return str(amount)

    @hybrid_property
    def funded(self):
        target = Decimal(self.target)
        # apply matching multiplier
        funded = Decimal(self.contributed) * Decimal(1 + self.contribution_matching)
        # apply bounty
        if self.contribution_bounty:
            funded = funded + Decimal(self.contribution_bounty)
        # if funded > target, just set as target
        if funded > target:
            return str(target.quantize(Decimal('.001'), rounding=ROUND_DOWN))

        return str(funded.quantize(Decimal('.001'), rounding=ROUND_DOWN))

    @hybrid_property
    def is_staked(self):
        return True

    @hybrid_property
    def is_funded(self):
        return self.is_staked and Decimal(self.funded) >= Decimal(self.target)

    @hybrid_property
    def is_failed(self):
        if not self.status == ProposalStatus.LIVE or not self.date_published:
            return False
        if self.stage == ProposalStage.FAILED or self.stage == ProposalStage.CANCELED:
            return True
        deadline = self.date_published + datetime.timedelta(seconds=self.deadline_duration)
        passed = deadline < datetime.datetime.now()
        return passed and not self.is_funded

    @hybrid_property
    def current_milestone(self):
        if self.milestones:
            for ms in self.milestones:
                if ms.stage != MilestoneStage.PAID:
                    return ms
            return self.milestones[-1]  # return last one if all PAID
        return None

    @hybrid_property
    def contributors(self):
        d = {c.user.id: c.user for c in self.contributions if c.user and c.status == ContributionStatus.CONFIRMED}
        return d.values()

    @hybrid_property
    def authed_follows(self):
        from grant.utils.auth import get_authed_user

        authed = get_authed_user()
        if not authed:
            return False
        res = (
            db.session.query(proposal_follower)
                .filter_by(user_id=authed.id, proposal_id=self.id)
                .count()
        )
        if res:
            return True
        return False

    @hybrid_property
    def authed_liked(self):
        from grant.utils.auth import get_authed_user

        authed = get_authed_user()
        if not authed:
            return False
        res = (
            db.session.query(proposal_liker)
                .filter_by(user_id=authed.id, proposal_id=self.id)
                .count()
        )
        if res:
            return True
        return False

    @hybrid_property
    def get_tip_jar_view_key(self):
        from grant.utils.auth import get_authed_user

        authed = get_authed_user()
        if authed not in self.team:
            return None
        else:
            return self.tip_jar_view_key

    # make a LIVE_DRAFT proposal by copying the relevant fields from an existing proposal
    @staticmethod
    def make_live_draft(proposal):
        live_draft_proposal = Proposal.create(
            title=proposal.title,
            brief=proposal.brief,
            content=proposal.content,
            target=proposal.target,
            payout_address=proposal.payout_address,
            status=ProposalStatus.LIVE_DRAFT
        )
        live_draft_proposal.tip_jar_address = proposal.tip_jar_address
        live_draft_proposal.changes_requested_discussion_reason = proposal.changes_requested_discussion_reason
        live_draft_proposal.rfp_opt_in = proposal.rfp_opt_in
        live_draft_proposal.team = proposal.team

        db.session.add(live_draft_proposal)

        Milestone.clone(proposal, live_draft_proposal)

        return live_draft_proposal

    # port changes made in LIVE_DRAFT proposal to self and delete the draft
    def consume_live_draft(self, author):
        if self.status != ProposalStatus.DISCUSSION:
            raise ValidationException("Proposal is not open for public review")

        live_draft = self.live_draft
        revision_changes = ProposalRevision.calculate_proposal_changes(self, live_draft)

        if len(revision_changes) == 0:
            if live_draft.rfp_opt_in == self.rfp_opt_in \
                    and live_draft.payout_address == self.payout_address \
                    and live_draft.tip_jar_address == self.tip_jar_address \
                    and live_draft.team == self.team:

                raise ValidationException("Live draft does not appear to have any changes")
            else:
                # cover special cases where properties not tracked in revisions have changed:
                self.rfp_opt_in = live_draft.rfp_opt_in
                self.payout_address = live_draft.payout_address
                self.tip_jar_address = live_draft.tip_jar_address
                self.team = live_draft.team
                self.live_draft = None
                db.session.add(self)
                db.session.delete(live_draft)
                return False

        # if this is the first revision, create a base revision that's a snapshot of the original proposal
        if len(self.revisions) == 0:
            base_draft = self.make_live_draft(self)
            base_draft.status = ProposalStatus.ARCHIVED
            base_draft.invites = []

            db.session.add(base_draft)

            base_revision = ProposalRevision(
                author=author,
                proposal_id=self.id,
                proposal_archive_id=base_draft.id,
                changes=json.dumps([]),
                revision_index=0
            )
            self.revisions.append(base_revision)

        revision_index = len(self.revisions)

        revision = ProposalRevision(
            author=author,
            proposal_id=self.id,
            proposal_archive_id=live_draft.id,
            changes=json.dumps(revision_changes),
            revision_index=revision_index
        )

        self.title = live_draft.title
        self.brief = live_draft.brief
        self.content = live_draft.content
        self.target = live_draft.target
        self.payout_address = live_draft.payout_address
        self.tip_jar_address = live_draft.tip_jar_address
        self.rfp_opt_in = live_draft.rfp_opt_in
        self.team = live_draft.team
        self.invites = []
        self.live_draft = None

        self.revisions.append(revision)

        db.session.add(self)

        # copy milestones
        Milestone.clone(live_draft, self)

        # archive live draft
        live_draft.status = ProposalStatus.ARCHIVED
        live_draft.invites = []
        db.session.add(live_draft)
        return True


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
            "contributed",
            "is_staked",
            "is_failed",
            "funded",
            "content",
            "updates",
            "milestones",
            "current_milestone",
            "team",
            "payout_address",
            "deadline_duration",
            "contribution_matching",
            "contribution_bounty",
            "invites",
            "rfp",
            "rfp_opt_in",
            "arbiter",
            "accepted_with_funding",
            "is_version_two",
            "authed_follows",
            "followers_count",
            "authed_liked",
            "likes_count",
            "tip_jar_address",
            "tip_jar_view_key",
            "changes_requested_discussion",
            "changes_requested_discussion_reason",
            "live_draft_id",
            "kyc_approved",
            "funded_by_zomg"
        )

    date_created = ma.Method("get_date_created")
    date_approved = ma.Method("get_date_approved")
    date_published = ma.Method("get_date_published")
    proposal_id = ma.Method("get_proposal_id")
    is_version_two = ma.Method("get_is_version_two")
    tip_jar_view_key = ma.Method("get_tip_jar_view_key")
    live_draft_id = ma.Method("get_live_draft_id")
    funded_by_zomg = ma.Method("get_funded_by_zomg")

    updates = ma.Nested("ProposalUpdateSchema", many=True)
    team = ma.Nested("UserSchema", many=True)
    milestones = ma.Nested("MilestoneSchema", many=True)
    current_milestone = ma.Nested("MilestoneSchema")
    invites = ma.Nested("ProposalTeamInviteSchema", many=True)
    rfp = ma.Nested("RFPSchema", exclude=["accepted_proposals"])
    arbiter = ma.Nested("ProposalArbiterSchema", exclude=["proposal"])

    def get_funded_by_zomg(self, obj):
        if obj.funded_by_zomg is None:
            return False
        elif obj.funded_by_zomg is False:
            return False
        else:
            return True

    def get_proposal_id(self, obj):
        return obj.id

    def get_date_created(self, obj):
        return dt_to_unix(obj.date_created)

    def get_date_approved(self, obj):
        return dt_to_unix(obj.date_approved) if obj.date_approved else None

    def get_date_published(self, obj):
        return dt_to_unix(obj.date_published) if obj.date_published else None

    def get_is_version_two(self, obj):
        return True if obj.version == '2' else False

    def get_tip_jar_view_key(self, obj):
        return obj.get_tip_jar_view_key

    def get_live_draft_id(self, obj):
        return obj.live_draft.id if obj.live_draft else None


proposal_schema = ProposalSchema()
proposals_schema = ProposalSchema(many=True)
user_fields = [
    "proposal_id",
    "status",
    "title",
    "brief",
    "target",
    "is_staked",
    "funded",
    "contribution_matching",
    "date_created",
    "date_approved",
    "date_published",
    "reject_reason",
    "changes_requested_discussion_reason",
    "team",
    "accepted_with_funding",
    "is_version_two",
    "authed_follows",
    "authed_liked"
]
user_proposal_schema = ProposalSchema(only=user_fields)
user_proposals_schema = ProposalSchema(many=True, only=user_fields)


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


class ProposalRevisionSchema(ma.Schema):
    class Meta:
        model = ProposalRevision
        # Fields to expose
        fields = (
            "revision_id",
            "date_created",
            "author",
            "proposal_id",
            "proposal_archive_id",
            "changes",
            "revision_index"
        )

    revision_id = ma.Method("get_revision_id")
    date_created = ma.Method("get_date_created")
    changes = ma.Method("get_changes")

    author = ma.Nested("UserSchema")

    def get_revision_id(self, obj):
        return obj.id

    def get_date_created(self, obj):
        return dt_to_unix(obj.date_created)

    def get_changes(self, obj):
        return json.loads(obj.changes)


proposal_revision_schema = ProposalRevisionSchema()
proposals_revisions_schema = ProposalRevisionSchema(many=True)


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
            "proposal",
            "user",
            "status",
            "tx_id",
            "amount",
            "date_created",
            "addresses",
            "is_anonymous",
            "private"
        )

    proposal = ma.Nested("ProposalSchema")
    user = ma.Nested("UserSchema", default=anonymous_user)
    date_created = ma.Method("get_date_created")
    addresses = ma.Method("get_addresses")
    is_anonymous = ma.Method("get_is_anonymous")

    def get_date_created(self, obj):
        return dt_to_unix(obj.date_created)

    def get_addresses(self, obj):
        # Omit 'memo' and 'sprout' for now
        # NOTE: Add back in 'sapling' when ready
        addresses = blockchain_get('/contribution/addresses', {'contributionId': obj.id})
        return {
            'transparent': addresses['transparent'],
        }

    def get_is_anonymous(self, obj):
        return not obj.user_id or obj.private

    @post_dump
    def stub_anonymous_user(self, data):
        if 'user' in data and data['user'] is None or data['private']:
            data['user'] = anonymous_user
        return data


proposal_contribution_schema = ProposalContributionSchema()
proposal_contributions_schema = ProposalContributionSchema(many=True)
user_proposal_contribution_schema = ProposalContributionSchema(exclude=['user', 'addresses'])
user_proposal_contributions_schema = ProposalContributionSchema(many=True, exclude=['user', 'addresses'])
proposal_proposal_contribution_schema = ProposalContributionSchema(exclude=['proposal', 'addresses'])
proposal_proposal_contributions_schema = ProposalContributionSchema(many=True, exclude=['proposal', 'addresses'])


class AdminProposalContributionSchema(ma.Schema):
    class Meta:
        model = ProposalContribution
        # Fields to expose
        fields = (
            "id",
            "proposal",
            "user",
            "status",
            "tx_id",
            "amount",
            "date_created",
            "addresses",
            "refund_address",
            "refund_tx_id",
            "staking",
            "private",
        )

    proposal = ma.Nested("ProposalSchema")
    user = ma.Nested("UserSchema")
    date_created = ma.Method("get_date_created")
    addresses = ma.Method("get_addresses")

    def get_date_created(self, obj):
        return dt_to_unix(obj.date_created)

    def get_addresses(self, obj):
        return blockchain_get('/contribution/addresses', {'contributionId': obj.id})


admin_proposal_contribution_schema = AdminProposalContributionSchema()
admin_proposal_contributions_schema = AdminProposalContributionSchema(many=True)


class ProposalArbiterSchema(ma.Schema):
    class Meta:
        model = ProposalArbiter
        fields = (
            "id",
            "user",
            "proposal",
            "status"
        )

    user = ma.Nested("UserSchema")  # , exclude=['arbiter_proposals'] (if UserSchema ever includes it)
    proposal = ma.Nested("ProposalSchema", exclude=['arbiter'])


user_proposal_arbiter_schema = ProposalArbiterSchema(exclude=['user'])
user_proposal_arbiters_schema = ProposalArbiterSchema(many=True, exclude=['user'])
