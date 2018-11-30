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
from grant.utils.auth import requires_sm, requires_same_user_auth, verify_signed_auth, BadSignatureException
from grant.utils.upload import save_avatar, send_upload, remove_avatar
from grant.web3.proposal import read_user_proposal
from grant.settings import UPLOAD_URL
from .models import User, SocialMedia, Avatar, users_schema, user_schema, db

blueprint = Blueprint('user', __name__, url_prefix='/api/v1/users')


def populate_user_proposals_cfs(proposals):
    for p in proposals:
        proposal_contract = read_user_proposal(p['proposal_address'])
        if proposal_contract:
            p['target'] = proposal_contract['target']
            p['funded'] = proposal_contract['funded']
        else:
            p['target'] = None
    filtered_proposals = list(filter(lambda p: p['target'] is not None, proposals))
    return filtered_proposals


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
@requires_sm
@endpoint.api()
def get_me():
    dumped_user = user_schema.dump(g.current_user)
    return dumped_user


@blueprint.route("/<user_identity>", methods=["GET"])
@endpoint.api(
    parameter("withProposals", type=bool, required=False),
    parameter("withComments", type=bool, required=False),
    parameter("withFunded", type=bool, required=False)
)
def get_user(user_identity, with_proposals, with_comments, with_funded):
    user = User.get_by_identifier(email_address=user_identity, account_address=user_identity)
    if user:
        result = user_schema.dump(user)
        if with_proposals:
            proposals = Proposal.get_by_user(user)
            proposals_dump = user_proposals_schema.dump(proposals)
            result["createdProposals"] = populate_user_proposals_cfs(proposals_dump)
        if with_funded:
            contributions = Proposal.get_by_user_contribution(user)
            contributions_dump = user_proposals_schema.dump(contributions)
            result["fundedProposals"] = populate_user_proposals_cfs(contributions_dump)
        if with_comments:
            comments = Comment.get_by_user(user)
            comments_dump = user_comments_schema.dump(comments)
            result["comments"] = comments_dump
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
    return result, 201


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


@blueprint.route("/avatar", methods=["POST"])
@requires_sm
@endpoint.api()
def upload_avatar():
    user = g.current_user
    if 'file' not in request.files:
        return {"message": "No file in post"}, 400
    file = request.files['file']
    if file.filename == '':
        return {"message": "No selected file"}, 400
    try:
        filename = save_avatar(file, user.id)
        return {"url": "{0}/api/v1/users/avatar/{1}".format(UPLOAD_URL, filename)}
    except Exception as e:
        return {"message": str(e)}, 400


@blueprint.route("/avatar/<filename>", methods=["GET"])
def get_avatar(filename):
    return send_upload(filename)


@blueprint.route("/avatar", methods=["DELETE"])
@requires_sm
@endpoint.api(
    parameter('url', type=str, required=True)
)
def delete_avatar(url):
    user = g.current_user
    remove_avatar(url, user.id)


@blueprint.route("/<user_identity>", methods=["PUT"])
@requires_sm
@requires_same_user_auth
@endpoint.api(
    parameter('displayName', type=str, required=True),
    parameter('title', type=str, required=True),
    parameter('socialMedias', type=list, required=True),
    parameter('avatar', type=str, required=True)
)
def update_user(user_identity, display_name, title, social_medias, avatar):
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
        if old_avatar_url and old_avatar_url != new_avatar.image_url:
            remove_avatar(old_avatar_url, user.id)

    db.session.commit()
    result = user_schema.dump(user)
    return result


@blueprint.route("/<user_identity>/invites", methods=["GET"])
@requires_same_user_auth
@endpoint.api()
def get_user_invites(user_identity):
    invites = ProposalTeamInvite.get_pending_for_user(g.current_user)
    return invites_with_proposal_schema.dump(invites)


@blueprint.route("/<user_identity>/invites/<invite_id>/respond", methods=["PUT"])
@requires_same_user_auth
@endpoint.api(
    parameter('response', type=bool, required=True)
)
def respond_to_invite(user_identity, invite_id, response):
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
