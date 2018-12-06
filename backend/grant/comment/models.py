import datetime
from sqlalchemy.orm import raiseload

from grant.extensions import ma, db
from grant.utils.misc import dt_to_unix


class Comment(db.Model):
    __tablename__ = "comment"

    id = db.Column(db.Integer(), primary_key=True)
    date_created = db.Column(db.DateTime)
    content = db.Column(db.Text, nullable=False)

    parent_comment_id = db.Column(db.Integer, db.ForeignKey("comment.id"), nullable=True)
    proposal_id = db.Column(db.Integer, db.ForeignKey("proposal.id"), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)

    author = db.relationship("User", back_populates="comments")
    replies = db.relationship("Comment")

    def __init__(self, proposal_id, user_id, parent_comment_id, content):
        self.proposal_id = proposal_id
        self.user_id = user_id
        self.parent_comment_id = parent_comment_id
        self.content = content
        self.date_created = datetime.datetime.now()

    @staticmethod
    def get_by_user(user):
        return Comment.query \
            .options(raiseload(Comment.replies)) \
            .filter(Comment.user_id == user.id) \
            .order_by(Comment.date_created.desc()) \
            .all()


class CommentSchema(ma.Schema):
    class Meta:
        model = Comment
        # Fields to expose
        fields = (
            "id",
            "proposal_id",
            "author",
            "content",
            "parent_comment_id",
            "date_created",
            "replies"
        )

    date_created = ma.Method("get_date_created")
    author = ma.Nested("UserSchema", exclude=["email_address"])
    replies = ma.Nested("CommentSchema", many=True)

    def get_date_created(self, obj):
        return dt_to_unix(obj.date_created)


comment_schema = CommentSchema()
comments_schema = CommentSchema(many=True)


class UserCommentSchema(ma.Schema):
    class Meta:
        model = Comment
        fields = (
            "id",
            "proposal",
            "content",
            "date_created",
        )
    proposal = ma.Nested(
        "ProposalSchema",
        exclude=[
            "comments",
            "contributions",
            "team",
            "milestones",
            "content",
            "invites",
            "trustees",
            "updates"
        ]
    )
    date_created = ma.Method("get_date_created")

    def get_date_created(self, obj):
        return dt_to_unix(obj.date_created) * 1000


user_comment_schema = UserCommentSchema()
user_comments_schema = UserCommentSchema(many=True)
