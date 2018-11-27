import datetime

from grant.extensions import ma, db
from grant.utils.misc import dt_to_unix


class Comment(db.Model):
    __tablename__ = "comment"

    id = db.Column(db.Integer(), primary_key=True)
    date_created = db.Column(db.DateTime)
    content = db.Column(db.Text, nullable=False)

    proposal_id = db.Column(db.Integer, db.ForeignKey("proposal.id"), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)

    def __init__(self, proposal_id, user_id, content):
        self.proposal_id = proposal_id
        self.user_id = user_id
        self.content = content
        self.date_created = datetime.datetime.now()


class CommentSchema(ma.Schema):
    class Meta:
        model = Comment
        # Fields to expose
        fields = (
            "user_id",
            "content",
            "proposal_id",
            "date_created",
        )

    date_created = ma.Method("get_date_created")

    def get_date_created(self, obj):
        return dt_to_unix(obj.date_created)


comment_schema = CommentSchema()
comments_schema = CommentSchema(many=True)
