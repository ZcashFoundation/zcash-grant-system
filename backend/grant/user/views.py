from flask import Blueprint, request

from grant import JSONResponse
from .models import User, users_schema, user_schema
from ..proposal.models import Proposal, proposal_team

blueprint = Blueprint('user', __name__, url_prefix='/api/v1/users')


@blueprint.route("/", methods=["GET"])
def get_users():
    proposal_query = request.args.get('proposalId')
    proposal = Proposal.query.filter_by(proposal_id=proposal_query).first()
    if not proposal:
        users = User.query.all()
    else:
        users = User.query.join(proposal_team).join(Proposal) \
            .filter(proposal_team.c.proposal_id == proposal.id).all()
    result = users_schema.dump(users)
    return JSONResponse(result)


@blueprint.route("/<user_identity>", methods=["GET"])
def get_user(user_identity):
    user = User.query.filter(
        (User.account_address == user_identity) | (User.email_address == user_identity)).first()
    if user:
        result = user_schema.dump(user)
        return JSONResponse(result)
    else:
        return JSONResponse(
            message="User with account_address or user_identity matching {} not found".format(user_identity),
            _statusCode=404)
