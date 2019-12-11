from datetime import datetime, timedelta
from decimal import Decimal

from sqlalchemy import or_
from sqlalchemy.ext.hybrid import hybrid_property

from grant.email.send import send_email
from grant.extensions import ma, db
from grant.utils.enums import CCRStatus
from grant.utils.exceptions import ValidationException
from grant.utils.misc import make_admin_url, gen_random_id, dt_to_unix


def default_content():
    return """# Overview

What you think should be accomplished


# Approach

How you expect a proposing team to accomplish your request


# Deliverable

The end result of a proposal the fulfills this request
"""


class CCR(db.Model):
    __tablename__ = "ccr"

    id = db.Column(db.Integer(), primary_key=True)
    date_created = db.Column(db.DateTime)

    title = db.Column(db.String(255), nullable=True)
    brief = db.Column(db.String(255), nullable=True)
    content = db.Column(db.Text, nullable=True)
    status = db.Column(db.String(255), nullable=False)
    _target = db.Column("target", db.String(255), nullable=True)
    reject_reason = db.Column(db.String())

    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    author = db.relationship("User", back_populates="ccrs")

    rfp_id = db.Column(db.Integer, db.ForeignKey("rfp.id"), nullable=True)
    rfp = db.relationship("RFP", back_populates="ccr")

    @staticmethod
    def get_by_user(user, statuses=[CCRStatus.LIVE]):
        status_filter = or_(CCR.status == v for v in statuses)
        return CCR.query \
            .filter(CCR.user_id == user.id) \
            .filter(status_filter) \
            .all()

    @staticmethod
    def create(**kwargs):
        ccr = CCR(
            **kwargs
        )
        db.session.add(ccr)
        db.session.flush()
        return ccr

    @hybrid_property
    def target(self):
        return self._target

    @target.setter
    def target(self, target: str):
        if target and Decimal(target) > 0:
            self._target = target
        else:
            self._target = None

    def __init__(
            self,
            user_id: int,
            title: str = '',
            brief: str = '',
            content: str = default_content(),
            target: str = '0',
            status: str = CCRStatus.DRAFT,
    ):
        assert CCRStatus.includes(status)
        self.id = gen_random_id(CCR)
        self.date_created = datetime.now()
        self.title = title[:255]
        self.brief = brief[:255]
        self.content = content
        self.target = target
        self.status = status
        self.user_id = user_id

    def update(
            self,
            title: str = '',
            brief: str = '',
            content: str = '',
            target: str = '0',
    ):
        self.title = title[:255]
        self.brief = brief[:255]
        self.content = content[:300000]
        self._target = target[:255] if target != '' and target else '0'

    # state: status (DRAFT || REJECTED) -> (PENDING || STAKING)
    def submit_for_approval(self):
        self.validate_publishable()
        allowed_statuses = [CCRStatus.DRAFT, CCRStatus.REJECTED]
        # specific validation
        if self.status not in allowed_statuses:
            raise ValidationException(f"CCR status must be draft or rejected to submit for approval")
        self.set_pending()

    def send_admin_email(self, type: str):
        from grant.user.models import User
        admins = User.get_admins()
        for a in admins:
            send_email(a.email_address, type, {
                'user': a,
                'ccr': self,
                'ccr_url': make_admin_url(f'/ccrs/{self.id}'),
            })

    # state: status DRAFT -> PENDING
    def set_pending(self):
        self.send_admin_email('admin_approval_ccr')
        self.status = CCRStatus.PENDING
        db.session.add(self)
        db.session.flush()

    def validate_publishable(self):
        # Require certain fields
        required_fields = ['title', 'content', 'brief', 'target']
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

    # state: status PENDING -> (LIVE || REJECTED)
    def approve_pending(self, is_approve, reject_reason=None):
        from grant.rfp.models import RFP
        self.validate_publishable()
        # specific validation
        if not self.status == CCRStatus.PENDING:
            raise ValidationException(f"CCR must be pending to approve or reject")

        if is_approve:
            self.status = CCRStatus.LIVE
            rfp = RFP(
                title=self.title,
                brief=self.brief,
                content=self.content,
                bounty=self._target,
                date_closes=datetime.now() + timedelta(days=90),
            )
            db.session.add(self)
            db.session.add(rfp)
            db.session.flush()
            self.rfp_id = rfp.id
            db.session.add(rfp)
            db.session.flush()

            # for emails
            db.session.commit()

            send_email(self.author.email_address, 'ccr_approved', {
                'user': self.author,
                'ccr': self,
                'admin_note': f'Congratulations! Your Request has been accepted. There may be a delay between acceptance and final posting as required by the Zcash Foundation.'
            })
            return rfp.id
        else:
            if not reject_reason:
                raise ValidationException("Please provide a reason for rejecting the ccr")
            self.status = CCRStatus.REJECTED
            self.reject_reason = reject_reason
            # for emails
            db.session.add(self)
            db.session.commit()
            send_email(self.author.email_address, 'ccr_rejected', {
                'user': self.author,
                'ccr': self,
                'admin_note': reject_reason
            })
            return None


class CCRSchema(ma.Schema):
    class Meta:
        model = CCR
        # Fields to expose
        fields = (
            "author",
            "id",
            "title",
            "brief",
            "ccr_id",
            "content",
            "status",
            "target",
            "date_created",
            "reject_reason",
            "rfp"
        )

    rfp = ma.Nested("RFPSchema")
    date_created = ma.Method("get_date_created")
    author = ma.Nested("UserSchema")
    ccr_id = ma.Method("get_ccr_id")

    def get_date_created(self, obj):
        return dt_to_unix(obj.date_created)

    def get_ccr_id(self, obj):
        return obj.id


ccr_schema = CCRSchema()
ccrs_schema = CCRSchema(many=True)
