from flask import Blueprint, g
from flask_yoloapi import endpoint, parameter

from grant.proposal.models import Proposal, proposal_team
from grant.utils.auth import requires_sm, requires_same_user_auth, verify_signed_auth, BadSignatureException
from .models import User, SocialMedia, Avatar, users_schema, user_schema, db

blueprint = Blueprint('user', __name__, url_prefix='/api/v1/users')


@blueprint.route("/", methods=["GET"])
@endpoint.api(
    parameter('proposalId', type=str, required=False)
)
def get_users(proposal_id):
    proposal = Proposal.query.filter_by(id=proposal_id).first()
    if not proposal:
        users = User.query.all()
    else:
        users = User.query.join(proposal_team).join(Proposal) \
            .filter(proposal_team.c.proposal_id == proposal.id).all()
    result = users_schema.dump(users)
    return result


@blueprint.route("/me", methods=["GET"])
@requires_sm
@endpoint.api()
def get_me():
    dumped_user = user_schema.dump(g.current_user)
    return dumped_user


@blueprint.route("/<user_identity>", methods=["GET"])
@endpoint.api()
def get_user(user_identity):
    user = User.get_by_identifier(email_address=user_identity, account_address=user_identity)
    if user:
        result = user_schema.dump(user)
        return result
    else:
        message = "User with account_address or user_identity matching {} not found".format(user_identity)
        return {"message": message}, 404


@blueprint.route("/", methods=["POST"])
@endpoint.api(
    parameter('accountAddress', type=str, required=True),
    parameter('emailAddress', type=str, required=True),
    parameter('displayName', type=str, required=True),
    parameter('title', type=str, required=True),
    parameter('signedMessage', type=str, required=True),
    parameter('rawTypedData', type=str, required=True)
)
def create_user(
        account_address,
        email_address,
        display_name,
        title,
        signed_message,
        raw_typed_data
):
    existing_user = User.get_by_identifier(email_address=email_address, account_address=account_address)
    if existing_user:
        return {"message": "User with that address or email already exists"}, 409

    # Handle signature
    try:
        sig_address = verify_signed_auth(signed_message, raw_typed_data)
        if sig_address.lower() != account_address.lower():
            return {
                       "message": "Message signature address ({sig_address}) doesn't match account_address ({account_address})".format(
                           sig_address=sig_address,
                           account_address=account_address
                       )
                   }, 400
    except BadSignatureException:
        return {"message": "Invalid message signature"}, 400

    # TODO: Handle avatar & social stuff too
    user = User.create(
        account_address=account_address,
        email_address=email_address,
        display_name=display_name,
        title=title
    )
    result = user_schema.dump(user)
    return result


@blueprint.route("/auth", methods=["POST"])
@endpoint.api(
    parameter('accountAddress', type=str, required=True),
    parameter('signedMessage', type=str, required=True),
    parameter('rawTypedData', type=str, required=True)
)
def auth_user(account_address, signed_message, raw_typed_data):
    existing_user = User.get_by_identifier(account_address=account_address)
    if not existing_user:
        return {"message": "No user exists with that address"}, 400

    try:
        sig_address = verify_signed_auth(signed_message, raw_typed_data)
        if sig_address.lower() != account_address.lower():
            return {
                       "message": "Message signature address ({sig_address}) doesn't match account_address ({account_address})".format(
                           sig_address=sig_address,
                           account_address=account_address
                       )
                   }, 400
    except BadSignatureException:
        return {"message": "Invalid message signature"}, 400

    return user_schema.dump(existing_user)


@blueprint.route("/<user_identity>", methods=["PUT"])
@requires_sm
@requires_same_user_auth
@endpoint.api(
    parameter('displayName', type=str, required=True),
    parameter('title', type=str, required=True),
    parameter('socialMedias', type=list, required=True),
    parameter('avatar', type=dict, required=True)
)
def update_user(user_identity, display_name, title, social_medias, avatar):
    user = g.current_user

    if display_name is not None:
        user.display_name = display_name

    if title is not None:
        user.title = title

    if social_medias is not None:
        SocialMedia.query.filter_by(user_id=user.id).delete()
        for social_media in social_medias:
            sm = SocialMedia(social_media_link=social_media.get("link"), user_id=user.id)
            db.session.add(sm)
    else:
        SocialMedia.query.filter_by(user_id=user.id).delete()

    if avatar is not None:
        Avatar.query.filter_by(user_id=user.id).delete()
        avatar_link = avatar.get('link')
        if avatar_link:
            avatar_obj = Avatar(image_url=avatar_link, user_id=user.id)
            db.session.add(avatar_obj)
    else:
        Avatar.query.filter_by(user_id=user.id).delete()

    db.session.commit()
    result = user_schema.dump(user)
    return result
