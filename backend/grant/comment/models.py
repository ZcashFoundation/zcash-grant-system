import datetime

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


class CommentSchema(ma.Schema):
    class Meta:
        model = Comment
        # Fields to expose
        fields = (
            "author",
            "content",
            "proposal_id",
            "parent_comment_id",
            "date_created",
            "body",
            "replies"
        )

    body = ma.Method("get_body")
    date_created = ma.Method("get_date_created")
    author = ma.Nested("UserSchema", exclude=["email_address"])
    replies = ma.Nested("CommentSchema", many=True)

    def get_body(self, obj):
        return obj.content

    def get_date_created(self, obj):
        return dt_to_unix(obj.date_created)


comment_schema = CommentSchema()
comments_schema = CommentSchema(many=True)
