from flask import Blueprint, jsonify
from animal_case import animalify

from .models import Comment, comments_schema

blueprint = Blueprint("comment", __name__, url_prefix="/api/v1/comment")


@blueprint.route("/", methods=["GET"])
def get_comments():
    all_comments = Comment.query.all()
    result = comments_schema.dump(all_comments)
    return jsonify(animalify(result))
