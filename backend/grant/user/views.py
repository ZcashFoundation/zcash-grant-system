from flask import Blueprint, g, request
from flask_yoloapi import endpoint, parameter

from grant.comment.models import Comment, user_comments_schema
from grant.proposal.models import (
    Proposal,
    proposals_schema,
    proposal_team,
    ProposalTeamInvite,
    invites_with_proposal_schema,
    user_proposals_schema
)
from grant.utils.auth import requires_auth, requires_same_user_auth
from grant.utils.upload import remove_avatar, sign_avatar_upload, AvatarException

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
        users = (
            User.query
            .join(proposal_team)
            .join(Proposal)
            .filter(proposal_team.c.proposal_id == proposal.id)
            .all()
        )
    result = users_schema.dump(users)
    return result


@blueprint.route("/me", methods=["GET"])
@requires_auth
@endpoint.api()
def get_me():
    dumped_user = user_schema.dump(g.current_user)
    return dumped_user


@blueprint.route("/<user_id>", methods=["GET"])
@endpoint.api(
    parameter("withProposals", type=bool, required=False),
    parameter("withComments", type=bool, required=False),
    parameter("withFunded", type=bool, required=False)
)
def get_user(user_id, with_proposals, with_comments, with_funded):
    user = User.get_by_id(user_id)
    if user:
        result = user_schema.dump(user)
        if with_proposals:
            proposals = Proposal.get_by_user(user)
            proposals_dump = user_proposals_schema.dump(proposals)
            result["createdProposals"] = proposals_dump
        if with_funded:
            contributions = Proposal.get_by_user_contribution(user)
            contributions_dump = user_proposals_schema.dump(contributions)
            result["fundedProposals"] = contributions_dump
        if with_comments:
            comments = Comment.get_by_user(user)
            comments_dump = user_comments_schema.dump(comments)
            result["comments"] = comments_dump
        return result
    else:
        message = "User with id matching {} not found".format(user_id)
        return {"message": message}, 404


@blueprint.route("/", methods=["POST"])
@endpoint.api(
    parameter('emailAddress', type=str, required=True),
    parameter('password', type=str, required=True),
    parameter('displayName', type=str, required=True),
    parameter('title', type=str, required=True)
)
def create_user(
        email_address,
        password,
        display_name,
        title
):
    existing_user = User.get_by_email(email_address)
    if existing_user:
        return {"message": "User with that email already exists"}, 409

    # TODO: Handle avatar & social stuff too
    user = User.create(
        email_address=email_address,
        password=password,
        display_name=display_name,
        title=title
    )
    result = user_schema.dump(user)
    return result, 201


@blueprint.route("/auth", methods=["POST"])
@endpoint.api(
    parameter('email', type=str, required=True),
    parameter('password', type=str, required=True)
)
def auth_user(email, password):
    existing_user = User.get_by_email(email)
    if not existing_user:
        return {"message": "No user exists with that email"}, 400

    if not existing_user.check_password(password):
        return {"message": "Invalid password"}, 403
    else:
        existing_user.login()
    return user_schema.dump(existing_user)


@blueprint.route("/avatar", methods=["POST"])
@requires_auth
@endpoint.api(
    parameter('mimetype', type=str, required=True)
)
def upload_avatar(mimetype):
    user = g.current_user
    try:
        signed_post = sign_avatar_upload(mimetype, user.id)
        return signed_post
    except AvatarException as e:
        return {"message": str(e)}, 400


@blueprint.route("/avatar", methods=["DELETE"])
@requires_auth
@endpoint.api(
    parameter('url', type=str, required=True)
)
def delete_avatar(url):
    user = g.current_user
    remove_avatar(url, user.id)


@blueprint.route("/<user_id>", methods=["PUT"])
@requires_auth
@requires_same_user_auth
@endpoint.api(
    parameter('displayName', type=str, required=True),
    parameter('title', type=str, required=True),
    parameter('socialMedias', type=list, required=True),
    parameter('avatar', type=str, required=True)
)
def update_user(user_id, display_name, title, social_medias, avatar):
    user = g.current_user

    if display_name is not None:
        user.display_name = display_name

    if title is not None:
        user.title = title

    db_socials = SocialMedia.query.filter_by(user_id=user.id).all()
    for db_social in db_socials:
        db.session.delete(db_social)
    if social_medias is not None:
        for social_media in social_medias:
            sm = SocialMedia(social_media_link=social_media, user_id=user.id)
            db.session.add(sm)

    db_avatar = Avatar.query.filter_by(user_id=user.id).first()
    if db_avatar:
        db.session.delete(db_avatar)
    if avatar:
        new_avatar = Avatar(image_url=avatar, user_id=user.id)
        db.session.add(new_avatar)

    old_avatar_url = db_avatar and db_avatar.image_url
    if old_avatar_url and old_avatar_url != avatar:
        remove_avatar(old_avatar_url, user.id)

    db.session.commit()
    result = user_schema.dump(user)
    return result


@blueprint.route("/<user_id>/invites", methods=["GET"])
@requires_same_user_auth
@endpoint.api()
def get_user_invites(user_id):
    invites = ProposalTeamInvite.get_pending_for_user(g.current_user)
    return invites_with_proposal_schema.dump(invites)


@blueprint.route("/<user_id>/invites/<invite_id>/respond", methods=["PUT"])
@requires_same_user_auth
@endpoint.api(
    parameter('response', type=bool, required=True)
)
def respond_to_invite(user_id, invite_id, response):
    invite = ProposalTeamInvite.query.filter_by(id=invite_id).first()
    if not invite:
        return {"message": "No invite found with id {}".format(invite_id)}, 404

    invite.accepted = response
    db.session.add(invite)

    if invite.accepted:
        invite.proposal.team.append(g.current_user)
        db.session.add(invite)

    db.session.commit()
    return None, 200
