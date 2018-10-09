from flask import Blueprint, request

from grant import JSONResponse
from .models import User, users_schema, user_schema, db
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

@blueprint.route("/", methods=["POST"])
def create_user():
    incoming = request.get_json()
    account_address = incoming["accountAddress"]
    email_address = incoming["emailAddress"]
    display_name = incoming["displayName"]
    title = incoming["title"]

    # TODO: Move create and validation stuff into User model
    existing_user = User.query.filter(
            (User.account_address == account_address) | (User.email_address == email_address)).first()
    if existing_user:
        return JSONResponse(
            message="User with that address or email already exists",
            _statusCode=400)

    # TODO: Handle avatar & social stuff too
    user = User(
        account_address=account_address,
        email_address=email_address,
        display_name=display_name,
        title=title
    )
    db.session.add(user)
    db.session.flush()
    db.session.commit()

    result = user_schema.dump(user)
    return JSONResponse(result)