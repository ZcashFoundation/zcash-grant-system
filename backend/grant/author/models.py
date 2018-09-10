from grant.comment.models import Comment
from grant.extensions import ma, db
from grant.proposal.models import Proposal


class Author(db.Model):
    __tablename__ = "author"

    id = db.Column(db.Integer(), primary_key=True)
    account_address = db.Column(db.String(255), unique=True)
    proposals = db.relationship(Proposal, backref="author", lazy=True)
    comments = db.relationship(Comment, backref="author", lazy=True)
    avatar = db.Column(db.String(255), unique=False, nullable=True)

    # TODO - add create and validate methods

    def __init__(self, account_address, avatar=None):
        self.account_address = account_address
        self.avatar = avatar


class AuthorSchema(ma.Schema):
    class Meta:
        model = Author
        # Fields to expose
        fields = ("account_address", "userid", "title", "avatar")

    userid = ma.Method("get_userid")
    title = ma.Method("get_title")
    avatar = ma.Method("get_avatar")

    def get_userid(self, obj):
        return obj.id

    def get_title(self, obj):
        return ""

    def get_avatar(self, obj):
        return "https://forum.getmonero.org/uploads/profile/small_no_picture.jpg"


author_schema = AuthorSchema()
authors_schema = AuthorSchema(many=True)
