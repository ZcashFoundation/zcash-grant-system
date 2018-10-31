from flask import Blueprint, jsonify
from animal_case import animalify


from .models import Milestone, milestones_schema

blueprint = Blueprint('milestone', __name__, url_prefix='/api/v1/milestones')


@blueprint.route("/", methods=["GET"])
def get_users():
    milestones = Milestone.query.all()
    result = milestones_schema.dump(milestones)
    return jsonify(animalify(result))
