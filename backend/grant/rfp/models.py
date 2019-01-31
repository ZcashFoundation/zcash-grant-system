import datetime
from grant.extensions import ma, db
from grant.utils.enums import RFPStatus
from grant.utils.misc import dt_to_unix


class RFP(db.Model):
    __tablename__ = "rfp"

    id = db.Column(db.Integer(), primary_key=True)
    date_created = db.Column(db.DateTime)

    title = db.Column(db.String(255), nullable=False)
    brief = db.Column(db.String(255), nullable=False)
    content = db.Column(db.Text, nullable=False)
    category = db.Column(db.String(255), nullable=False)
    status = db.Column(db.String(255), nullable=False)

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

    def __init__(
        self,
        title: str,
        brief: str,
        content: str,
        category: str,
        status: str = RFPStatus.DRAFT,
    ):
        self.date_created = datetime.datetime.now()
        self.title = title
        self.brief = brief
        self.content = content
        self.category = category
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
            "date_created",
            "accepted_proposals",
        )

    date_created = ma.Method("get_date_created")
    accepted_proposals = ma.Nested("ProposalSchema", many=True, exclude=["rfp"])

    def get_date_created(self, obj):
        return dt_to_unix(obj.date_created)

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
            "date_created",
            "proposals",
        )

    date_created = ma.Method("get_date_created")
    proposals = ma.Nested("ProposalSchema", many=True, exclude=["rfp"])

    def get_date_created(self, obj):
        return dt_to_unix(obj.date_created)

admin_rfp_schema = AdminRFPSchema()
admin_rfps_schema = AdminRFPSchema(many=True)
