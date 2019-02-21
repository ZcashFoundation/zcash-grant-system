import datetime

from functools import reduce
from grant.extensions import ma, db
from grant.utils.ma_fields import UnixDate
from sqlalchemy.orm import raiseload

HIDDEN_CONTENT = '~~comment removed by admin~~'


class Comment(db.Model):
    __tablename__ = "comment"

    id = db.Column(db.Integer(), primary_key=True)
    date_created = db.Column(db.DateTime)
    content = db.Column(db.Text, nullable=False)
    hidden = db.Column(db.Boolean, nullable=False, default=False, server_default=db.text("FALSE"))
    reported = db.Column(db.Boolean, nullable=True, default=False, server_default=db.text("FALSE"))

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

    def report(self, reported: bool):
        self.reported = reported
        db.session.add(self)

    def hide(self, hidden: bool):
        self.hidden = hidden
        db.session.add(self)


# are all of the replies hidden?
def all_hidden(replies):
    return reduce(lambda ah, r: ah and r.hidden, replies, True)


# remove replies that are hidden and have all hidden children or no children
def filter_dead(replies):
    return [x for x in replies if not (x.hidden and all_hidden(x.replies))]


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
            "replies",
            "reported",
            "hidden",
        )

    content = ma.Method("get_content")
    date_created = UnixDate(attribute='date_created')
    author = ma.Nested("UserSchema")
    # custome handling of replies, was: replies = ma.Nested("CommentSchema", many=True)
    replies = ma.Method("get_replies")

    def get_content(self, obj):
        return HIDDEN_CONTENT if obj.hidden else obj.content

    # filter out "dead" comments
    def get_replies(self, obj):
        return comments_schema.dump(filter_dead(obj.replies))


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
            "reported",
            "hidden",
        )

    proposal = ma.Nested(
        "ProposalSchema",
        exclude=[
            "team",
            "milestones",
            "content",
            "invites",
            "updates",
        ]
    )

    content = ma.Method("get_content")
    date_created = UnixDate(attribute='date_created')

    def get_content(self, obj):
        return HIDDEN_CONTENT if obj.hidden else obj.content


user_comment_schema = UserCommentSchema()
user_comments_schema = UserCommentSchema(many=True)


class AdminCommentSchema(ma.Schema):
    class Meta:
        model = Comment
        fields = (
            "id",
            "user_id",
            "author",
            "proposal",
            "proposal_id",
            "content",
            "date_created",
            "reported",
            "hidden",
        )

    proposal = ma.Nested(
        "ProposalSchema",
        only=[
            "proposal_id",
            "title",
            "brief"
        ]
    )
    author = ma.Nested(
        "SelfUserSchema",
        only=[
            "userid",
            "email_address",
            "display_name",
            "title",
            "avatar",
        ]
    )
    date_created = UnixDate(attribute='date_created')


admin_comment_schema = AdminCommentSchema()
admin_comments_schema = AdminCommentSchema(many=True)
