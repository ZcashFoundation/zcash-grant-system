from flask import Blueprint
from flask_yoloapi import endpoint

from .models import Milestone, milestones_schema

blueprint = Blueprint('milestone', __name__, url_prefix='/api/v1/milestones')

# Unused
# @blueprint.route("/", methods=["GET"])
# @endpoint.api()
# def get_milestones():
#     milestones = Milestone.query.all()
#     result = milestones_schema.dump(milestones)
#     return result
