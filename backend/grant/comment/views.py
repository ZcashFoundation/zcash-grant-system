from flask import Blueprint
from flask_yoloapi import endpoint

from .models import Comment, comments_schema

blueprint = Blueprint("comment", __name__, url_prefix="/api/v1/comment")

# Unused
# @blueprint.route("/", methods=["GET"])
# @endpoint.api()
# def get_comments():
#     all_comments = Comment.query.all()
#     result = comments_schema.dump(all_comments)
#     return result
