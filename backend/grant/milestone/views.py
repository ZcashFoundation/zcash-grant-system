from flask import Blueprint

from grant import JSONResponse
from .models import Milestone, milestones_schema

blueprint = Blueprint('milestone', __name__, url_prefix='/api/milestones')


@blueprint.route("/", methods=["GET"])
def get_authors():
    milestones = Milestone.query.all()
    result = milestones_schema.dump(milestones)
    return JSONResponse(result)
