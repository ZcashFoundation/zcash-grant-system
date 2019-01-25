import datetime
from grant.extensions import ma, db
from grant.utils.enums import RFPStatus


rfp_proposal = db.Table(
    'rfp_proposal', db.Model.metadata,
    db.Column('rfp_id', db.Integer, db.ForeignKey('user.id')),
    db.Column('proposal_id', db.Integer, db.ForeignKey('proposal.id'), unique=True)
)


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
    proposals = db.relationship("Proposal", secondary=rfp_proposal)

    def __init__(
        self,
        title: str,
        brief: str,
        content: str,
        status: str = RFPStatus.DRAFT,
    ):
        self.date_created = datetime.datetime.now()
        self.title = title
        self.brief = brief
        self.content = content
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
            "status",
            "proposals"
        )

    proposals = ma.Nested("ProposalSchema", many=True)

rfp_schema = RFPSchema()
rfps_schema = RFPSchema(many=True)
