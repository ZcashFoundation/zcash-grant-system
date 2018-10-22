from animal_case import animalify
from flask import Blueprint, g, jsonify
from flask_yoloapi import endpoint, parameter

from .models import User, users_schema, user_schema, db
from ..email.send import send_email
from ..proposal.models import Proposal, proposal_team
from ..utils.auth import requires_sm

blueprint = Blueprint('user', __name__, url_prefix='/api/v1/users')


@blueprint.route("/", methods=["GET"])
@endpoint.api(
    parameter('proposalId', type=str, required=False)
)
def get_users(proposal_id):
    proposal = Proposal.query.filter_by(proposal_id=proposal_id).first()
    if not proposal:
        users = User.query.all()
    else:
        users = User.query.join(proposal_team).join(Proposal) \
            .filter(proposal_team.c.proposal_id == proposal.id).all()
    result = users_schema.dump(users)
    return result


@blueprint.route("/me", methods=["GET"])
@requires_sm
def get_me():
    dumped_user = user_schema.dump(g.current_user)
    return jsonify(animalify(dumped_user))


@blueprint.route("/<user_identity>", methods=["GET"])
def get_user(user_identity):
    user = User.get_by_email_or_account_address(email_address=user_identity, account_address=user_identity)
    if user:
        result = user_schema.dump(user)
        return jsonify(animalify(result))
    else:
        return jsonify(
            message="User with account_address or user_identity matching {} not found".format(user_identity)), 404


@blueprint.route("/", methods=["POST"])
@endpoint.api(
    parameter('accountAddress', type=str, required=True),
    parameter('emailAddress', type=str, required=True),
    parameter('displayName', type=str, required=True),
    parameter('title', type=str, required=True),
)
def create_user(account_address, email_address, display_name, title):
    existing_user = User.get_by_email_or_account_address(email_address=email_address, account_address=account_address)
    if existing_user:
        return {"message": "User with that address or email already exists"}, 409

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

    send_email(email_address, 'signup', {
        'display_name': display_name,
        # TODO: Make this dynamic
        'confirm_url': 'https://grant.io/user/confirm',
    })

    result = user_schema.dump(user)
    return result
