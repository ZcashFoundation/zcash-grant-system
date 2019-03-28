from datetime import datetime
from decimal import Decimal
from grant.extensions import ma, db
from sqlalchemy.ext.hybrid import hybrid_property
from grant.utils.enums import RFPStatus
from grant.utils.misc import dt_to_unix, gen_random_id
from grant.utils.enums import Category


class RFP(db.Model):
    __tablename__ = "rfp"

    id = db.Column(db.Integer(), primary_key=True)
    date_created = db.Column(db.DateTime)

    title = db.Column(db.String(255), nullable=False)
    brief = db.Column(db.String(255), nullable=False)
    content = db.Column(db.Text, nullable=False)
    category = db.Column(db.String(255), nullable=False)
    status = db.Column(db.String(255), nullable=False)
    matching = db.Column(db.Boolean, default=False, nullable=False)
    _bounty = db.Column("bounty", db.String(255), nullable=True)
    date_closes = db.Column(db.DateTime, nullable=True)
    date_opened = db.Column(db.DateTime, nullable=True)
    date_closed = db.Column(db.DateTime, nullable=True)

    # Relationships
    proposals = db.relationship(
        "Proposal",
        backref="rfp",
        lazy=True,
        cascade="all, delete-orphan",
    )
    accepted_proposals = db.relationship(
        "Proposal",
        lazy=True,
        primaryjoin="and_(Proposal.rfp_id==RFP.id, Proposal.status=='LIVE')",
        cascade="all, delete-orphan",
    )

    @hybrid_property
    def bounty(self):
        return self._bounty

    @bounty.setter
    def bounty(self, bounty: str):
        if bounty and Decimal(bounty) > 0:
            self._bounty = bounty
        else:
            self._bounty = None

    def __init__(
        self,
        title: str,
        brief: str,
        content: str,
        category: str,
        bounty: str,
        date_closes: datetime,
        matching: bool = False,
        status: str = RFPStatus.DRAFT,
    ):
        assert RFPStatus.includes(status)
        assert Category.includes(category)
        self.id = gen_random_id(RFP)
        self.date_created = datetime.now()
        self.title = title[:255]
        self.brief = brief[:255]
        self.content = content
        self.category = category
        self.bounty = bounty
        self.date_closes = date_closes
        self.matching = matching
        self.status = status


class RFPSchema(ma.Schema):
    class Meta:
        model = RFP
        # Fields to expose
        fields = (
            "id",
            "title",
            "brief",
            "content",
            "category",
            "status",
            "matching",
            "bounty",
            "date_created",
            "date_closes",
            "date_opened",
            "date_closed",
            "accepted_proposals",
        )

    status = ma.Method("get_status")
    date_closes = ma.Method("get_date_closes")
    date_opened = ma.Method("get_date_opened")
    date_closed = ma.Method("get_date_closed")
    accepted_proposals = ma.Nested("ProposalSchema", many=True, exclude=["rfp"])

    def get_status(self, obj):
        # Force it into closed state if date_closes is in the past
        if obj.date_closes and obj.date_closes <= datetime.today():
            return RFPStatus.CLOSED
        return obj.status

    def get_date_closes(self, obj):
        return dt_to_unix(obj.date_closes) if obj.date_closes else None

    def get_date_opened(self, obj):
        return dt_to_unix(obj.date_opened) if obj.date_opened else None

    def get_date_closed(self, obj):
        return dt_to_unix(obj.date_closed) if obj.date_closed else None


rfp_schema = RFPSchema()
rfps_schema = RFPSchema(many=True)


class AdminRFPSchema(ma.Schema):
    class Meta:
        model = RFP
        # Fields to expose
        fields = (
            "id",
            "title",
            "brief",
            "content",
            "category",
            "status",
            "matching",
            "bounty",
            "date_created",
            "date_closes",
            "date_opened",
            "date_closed",
            "proposals",
        )

    status = ma.Method("get_status")
    date_created = ma.Method("get_date_created")
    date_closes = ma.Method("get_date_closes")
    date_opened = ma.Method("get_date_opened")
    date_closed = ma.Method("get_date_closed")
    proposals = ma.Nested("ProposalSchema", many=True, exclude=["rfp"])

    def get_status(self, obj):
        # Force it into closed state if date_closes is in the past
        if obj.date_closes and obj.date_closes <= datetime.today():
            return RFPStatus.CLOSED
        return obj.status

    def get_date_created(self, obj):
        return dt_to_unix(obj.date_created)

    def get_date_closes(self, obj):
        return dt_to_unix(obj.date_closes) if obj.date_closes else None

    def get_date_opened(self, obj):
        return dt_to_unix(obj.date_opened) if obj.date_opened else None

    def get_date_closed(self, obj):
        return dt_to_unix(obj.date_closes) if obj.date_closes else None


admin_rfp_schema = AdminRFPSchema()
admin_rfps_schema = AdminRFPSchema(many=True)
