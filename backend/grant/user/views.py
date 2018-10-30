from animal_case import animalify
from flask import Blueprint, g, jsonify
from flask_yoloapi import endpoint, parameter

from .models import User, SocialMedia, Avatar, users_schema, user_schema, db
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


@blueprint.route("/<user_identity>", methods=["PUT"])
@endpoint.api(
    parameter('displayName', type=str, required=False),
    parameter('title', type=str, required=False),
    parameter('socialMedias', type=list, required=False),
    parameter('avatar', type=dict, required=False)
)
def update_user(user_identity, display_name, title, social_medias, avatar):
    user = User.get_by_email_or_account_address(email_address=user_identity, account_address=user_identity)
    if not user:
        return {"message": "User with that address or email not found"}, 404

    if display_name is not None:
        user.display_name = display_name

    if title is not None:
        user.title = title

    if social_medias is not None:
        sm_query = SocialMedia.query.filter_by(user_id=user.id)
        sm_query.delete()
        for social_media in social_medias:
            sm = SocialMedia(social_media_link=social_media.get("link"), user_id=user.id)
            db.session.add(sm)

    if avatar is not None:
        Avatar.query.filter_by(user_id=user.id).delete()
        avatar_link = avatar.get('link')
        if avatar_link:
            avatar_obj = Avatar(image_url=avatar_link, user_id=user.id)
            db.session.add(avatar_obj)

    db.session.commit()

    result = user_schema.dump(user)
    return result
