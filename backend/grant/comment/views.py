from flask import Blueprint, g

from grant.utils.auth import requires_auth
from grant.parser import body
from marshmallow import fields
from .models import Comment, db, comment_schema

blueprint = Blueprint("comment", __name__, url_prefix="/api/v1/comment")


@blueprint.route("/<comment_id>/like", methods=["PUT"])
@requires_auth
@body({"isLiked": fields.Bool(required=True)})
def like_comment(comment_id, is_liked):

    user = g.current_user
    # Make sure comment exists
    comment = Comment.query.filter_by(id=comment_id).first()
    if not comment:
        return {"message": "No comment matching id"}, 404

    comment.like(user, is_liked)
    db.session.commit()

    return comment_schema.dump(comment), 201

