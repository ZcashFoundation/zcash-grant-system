from flask import Blueprint
from grant import JSONResponse


from .models import Comment, comments_schema

blueprint = Blueprint("comment", __name__, url_prefix="/api/comment")


@blueprint.route("/", methods=["GET"])
def get_comments():
    all_comments = Comment.query.all()
    result = comments_schema.dump(all_comments)
    return JSONResponse(result)
