import datetime

from grant.extensions import ma, db
from grant.utils.misc import dt_to_unix


class Comment(db.Model):
    __tablename__ = "comment"

    id = db.Column(db.Integer(), primary_key=True)
    date_created = db.Column(db.DateTime)

    content = db.Column(db.Text, nullable=False)

    proposal_id = db.Column(db.Integer, db.ForeignKey("proposal.id"), nullable=False)
    author_id = db.Column(db.Integer, db.ForeignKey("author.id"), nullable=False)

    def __init__(self, proposal_id, author_id, content):
        self.proposal_id = proposal_id
        self.author_id = author_id
        self.content = content
        self.date_created = datetime.datetime.now()


class CommentSchema(ma.Schema):
    class Meta:
        model = Comment
        # Fields to expose
        fields = (
            "author_id",
            "content",
            "proposal_id",
            "date_created",
            "body",
        )

    body = ma.Method("get_body")

    date_created = ma.Method("get_date_created")

    def get_body(self, obj):
        return obj.content

    def get_date_created(self, obj):
        return dt_to_unix(obj.date_created)


comment_schema = CommentSchema()
comments_schema = CommentSchema(many=True)
