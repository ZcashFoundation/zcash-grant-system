from flask import Blueprint, request

from .models import User, users_schema
from ..proposal.models import Proposal, proposal_team
from grant import JSONResponse

blueprint = Blueprint('user', __name__, url_prefix='/api/v1/users')


@blueprint.route("/", methods=["GET"])
def get_users():
    proposal_query = request.args.get('proposalId')
    proposal = Proposal.query.filter_by(proposal_id=proposal_query).first()
    if not proposal:
        users = User.query.all()
    else:
        users = User.query.join(proposal_team).join(Proposal)\
            .filter(proposal_team.c.proposal_id == proposal.id).all()
    result = users_schema.dump(users)
    return JSONResponse(result)
