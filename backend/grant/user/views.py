import validators
from animal_case import keys_to_snake_case
from flask import Blueprint, g, current_app
from marshmallow import fields
from validate_email import validate_email
from webargs import validate

import grant.utils.auth as auth
from grant.comment.models import Comment, user_comments_schema
from grant.email.models import EmailRecovery
from grant.ccr.models import CCR, ccrs_schema
from grant.extensions import limiter
from grant.parser import query, body
from grant.proposal.models import (
    Proposal,
    ProposalTeamInvite,
    invites_with_proposal_schema,
    user_proposal_contributions_schema,
    user_proposals_schema,
    user_proposal_arbiters_schema
)
from grant.proposal.models import ProposalContribution
from grant.utils.enums import ProposalStatus, ContributionStatus
from grant.utils.exceptions import ValidationException
from grant.utils.requests import validate_blockchain_get
from grant.utils.social import verify_social, get_social_login_url, VerifySocialException
from grant.utils.upload import remove_avatar, sign_avatar_upload, AvatarException
from .models import (
    User,
    SocialMedia,
    Avatar,
    self_user_schema,
    user_schema,
    user_settings_schema,
    db
)

blueprint = Blueprint('user', __name__, url_prefix='/api/v1/users')


@blueprint.route("/me", methods=["GET"])
@auth.requires_auth
def get_me():
    dumped_user = self_user_schema.dump(g.current_user)
    return dumped_user


@blueprint.route("/<user_id>", methods=["GET"])
@query({
    "withProposals": fields.Bool(required=False, missing=None),
    "withComments": fields.Bool(required=False, missing=None),
    "withFunded": fields.Bool(required=False, missing=None),
    "withPending": fields.Bool(required=False, missing=None),
    "withArbitrated": fields.Bool(required=False, missing=None),
    "withRequests": fields.Bool(required=False, missing=None)

})
def get_user(user_id, with_proposals, with_comments, with_funded, with_pending, with_arbitrated, with_requests):
    user = User.get_by_id(user_id)
    if user:
        result = user_schema.dump(user)
        authed_user = auth.get_authed_user()
        is_self = authed_user and authed_user.id == user.id
        if with_requests:
            requests = CCR.get_by_user(user)
            requests_dump = ccrs_schema.dump(requests)
            result["requests"] = requests_dump
        if with_proposals:
            proposals = Proposal.get_by_user(user)
            proposals_dump = user_proposals_schema.dump(proposals)
            result["proposals"] = proposals_dump
        if with_funded:
            contributions = ProposalContribution.get_by_userid(user_id)
            if not authed_user or user.id != authed_user.id:
                contributions = [c for c in contributions if c.status == ContributionStatus.CONFIRMED]
                contributions = [c for c in contributions if not c.private]
            contributions = [c for c in contributions if c.proposal.status == ProposalStatus.LIVE]
            contributions_dump = user_proposal_contributions_schema.dump(contributions)
            result["contributions"] = contributions_dump
        if with_comments:
            comments = Comment.get_by_user(user)
            comments_dump = user_comments_schema.dump(comments)
            result["comments"] = comments_dump
        if with_pending and is_self:
            pending_proposals = Proposal.get_by_user(user, [
                ProposalStatus.STAKING,
                ProposalStatus.PENDING,
                ProposalStatus.APPROVED,
                ProposalStatus.REJECTED,
            ])
            pending_proposals_dump = user_proposals_schema.dump(pending_proposals)
            result["pendingProposals"] = pending_proposals_dump
            pending_ccrs = CCR.get_by_user(user, [
                ProposalStatus.STAKING,
                ProposalStatus.PENDING,
                ProposalStatus.APPROVED,
                ProposalStatus.REJECTED,
            ])
            pending_ccrs_dump = ccrs_schema.dump(pending_ccrs)
            result["pendingRequests"] = pending_ccrs_dump
        if with_arbitrated and is_self:
            result["arbitrated"] = user_proposal_arbiters_schema.dump(user.arbiter_proposals)

        return result
    else:
        message = "User with id matching {} not found".format(user_id)
        return {"message": message}, 404


@blueprint.route("/", methods=["POST"])
@limiter.limit("30/day;5/minute")
@body({
    "emailAddress": fields.Str(required=True, validate=lambda e: validate_email(e)),
    "password": fields.Str(required=True),
    "displayName": fields.Str(required=True, validate=validate.Length(min=2, max=50)),
    "title": fields.Str(required=True, validate=validate.Length(min=2, max=50)),
})
def create_user(
        email_address,
        password,
        display_name,
        title
):
    existing_user = User.get_by_email(email_address)
    if existing_user:
        return {"message": "User with that email already exists"}, 409

    user = User.create(
        email_address=email_address,
        password=password,
        display_name=display_name,
        title=title
    )
    user.login()
    result = self_user_schema.dump(user)
    return result, 201


@blueprint.route("/auth", methods=["POST"])
@limiter.limit("30/hour;5/minute")
@body({
    "email": fields.Str(required=True),
    "password": fields.Str(required=True)
})
def auth_user(email, password):
    authed_user = auth.auth_user(email, password)
    return self_user_schema.dump(authed_user)


@blueprint.route("/me/password", methods=["PUT"])
@auth.requires_auth
@body({
    "currentPassword": fields.Str(required=True),
    "password": fields.Str(required=True)
})
def update_user_password(current_password, password):
    if not g.current_user.check_password(current_password):
        return {"message": "Current password incorrect"}, 403
    g.current_user.set_password(password)
    return {"message": "ok"}, 200


@blueprint.route("/me/email", methods=["PUT"])
@auth.requires_auth
@body({
    "email": fields.Str(required=True, validate=lambda e: validate_email(e)),
    "password": fields.Str(required=True)
})
def update_user_email(email, password):
    if not g.current_user.check_password(password):
        return {"message": "Password is incorrect"}, 403
    current_app.logger.info(
        f"Updating userId: {g.current_user.id} with current email: {g.current_user.email_address} to new email: {email}"
    )
    g.current_user.set_email(email)
    return {"message": "ok"}, 200


@blueprint.route("/me/resend-verification", methods=["PUT"])
@auth.requires_auth
def resend_email_verification():
    g.current_user.send_verification_email()
    return {"message": "ok"}, 200


@blueprint.route("/logout", methods=["POST"])
@auth.requires_auth
def logout_user():
    auth.logout_current_user()
    return {"message": "ok"}, 200


@blueprint.route("/social/<service>/authurl", methods=["GET"])
@auth.requires_auth
def get_user_social_auth_url(service):
    try:
        return {"url": get_social_login_url(service)}

    except VerifySocialException as e:
        return {"message": str(e)}, 400


@blueprint.route("/social/<service>/verify", methods=["POST"])
@auth.requires_auth
@body({
    "code": fields.Str(required=True)
})
def verify_user_social(service, code):
    try:
        # 1. verify with 3rd party
        username = verify_social(service, code)
        # 2. remove existing username/service
        sm_other_db = SocialMedia.query.filter_by(service=service, username=username).first()
        if sm_other_db:
            db.session.delete(sm_other_db)
        # 3. remove existing for authed user/service
        sm_self_db = SocialMedia.query.filter_by(service=service, user_id=g.current_user.id).first()
        if sm_self_db:
            db.session.delete(sm_self_db)
        # 4. set this users verified social item
        sm = SocialMedia(service=service, username=username, user_id=g.current_user.id)
        db.session.add(sm)
        db.session.commit()
        return {"username": username}, 200

    except VerifySocialException as e:
        return {"message": str(e)}, 400


@blueprint.route("/recover", methods=["POST"])
@limiter.limit("10/day;2/minute")
@body({
    "email": fields.Str(required=True)
})
def recover_user(email):
    existing_user = User.get_by_email(email)
    if not existing_user:
        return {"message": "No user exists with that email"}, 400
    auth.throw_on_banned(existing_user)
    existing_user.send_recovery_email()
    return {"message": "ok"}, 200


@blueprint.route("/recover/<code>", methods=["POST"])
@body({
    "password": fields.Str(required=True)
})
def recover_email(code, password):
    er = EmailRecovery.query.filter_by(code=code).first()
    if er:
        if er.is_expired():
            return {"message": "Reset code expired"}, 401
        auth.throw_on_banned(er.user)
        er.user.set_password(password)
        db.session.delete(er)
        db.session.commit()
        return {"message": "ok"}, 200

    return {"message": "Invalid reset code"}, 400


@blueprint.route("/avatar", methods=["POST"])
@limiter.limit("20/day;3/minute")
@auth.requires_auth
@body({
    "mimetype": fields.Str(required=True)
})
def upload_avatar(mimetype):
    user = g.current_user
    try:
        signed_post = sign_avatar_upload(mimetype, user.id)
        return signed_post
    except AvatarException as e:
        return {"message": str(e)}, 400


@blueprint.route("/avatar", methods=["DELETE"])
@auth.requires_auth
@body({
    "url": fields.Str(required=True)
})
def delete_avatar(url):
    user = g.current_user
    remove_avatar(url, user.id)


@blueprint.route("/<user_id>", methods=["PUT"])
@auth.requires_auth
@auth.requires_same_user_auth
@body({
    "displayName": fields.Str(required=True, validate=lambda d: 2 <= len(d) <= 60),
    "title": fields.Str(required=True, validate=lambda t: 2 <= len(t) <= 60),
    "socialMedias": fields.List(fields.Dict(), required=True),
    "avatar": fields.Str(required=True, allow_none=True, validate=lambda d: validators.url(d))
})
def update_user(user_id, display_name, title, social_medias, avatar):
    user = g.current_user

    if display_name is not None:
        user.display_name = display_name

    if title is not None:
        user.title = title

    # only allow deletions here, check for absent items
    db_socials = SocialMedia.query.filter_by(user_id=user.id).all()
    new_socials = list(map(lambda s: s['service'], social_medias))
    for social in db_socials:
        if social.service not in new_socials:
            db.session.delete(social)

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
    result = self_user_schema.dump(user)
    return result


@blueprint.route("/<user_id>/invites", methods=["GET"])
@auth.requires_same_user_auth
def get_user_invites(user_id):
    invites = ProposalTeamInvite.get_pending_for_user(g.current_user)
    return invites_with_proposal_schema.dump(invites)


@blueprint.route("/<user_id>/invites/<invite_id>/respond", methods=["PUT"])
@auth.requires_same_user_auth
@body({
    "response": fields.Bool(required=True)
})
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
    return {"message": "ok"}, 200


@blueprint.route("/<user_id>/settings", methods=["GET"])
@auth.requires_same_user_auth
def get_user_settings(user_id):
    return user_settings_schema.dump(g.current_user.settings)


@blueprint.route("/<user_id>/settings", methods=["PUT"])
@auth.requires_same_user_auth
@body({
    "emailSubscriptions": fields.Dict(required=False, missing=None),
    "refundAddress": fields.Str(required=False, missing=None,
                                validate=lambda r: validate_blockchain_get('/validate/address', {'address': r})),
    "tipJarAddress": fields.Str(required=False, missing=None,
                                validate=lambda r: validate_blockchain_get('/validate/address', {'address': r})),
    "tipJarViewKey": fields.Str(required=False, missing=None)  # TODO: add viewkey validation here
})
def set_user_settings(user_id, email_subscriptions, refund_address, tip_jar_address, tip_jar_view_key):
    if email_subscriptions:
        try:
            email_subscriptions = keys_to_snake_case(email_subscriptions)
            g.current_user.settings.email_subscriptions = email_subscriptions
        except ValidationException as e:
            return {"message": str(e)}, 400

    if refund_address == '' and g.current_user.settings.refund_address:
        return {"message": "Refund address cannot be unset, only changed"}, 400
    if refund_address:
        g.current_user.settings.refund_address = refund_address

    # TODO: is additional validation needed similar to refund_address?
    if tip_jar_address is not None:
        g.current_user.settings.tip_jar_address = tip_jar_address
    if tip_jar_view_key is not None:
        g.current_user.settings.tip_jar_view_key = tip_jar_view_key

    db.session.commit()
    return user_settings_schema.dump(g.current_user.settings)


@blueprint.route("/<user_id>/arbiter/<proposal_id>", methods=["PUT"])
@auth.requires_same_user_auth
@body({
    "isAccept": fields.Bool(required=False, missing=None)
})
def set_user_arbiter(user_id, proposal_id, is_accept):
    try:
        proposal = Proposal.query.filter_by(id=int(proposal_id)).first()
        if not proposal:
            return {"message": "No such proposal"}, 404

        if is_accept:
            proposal.arbiter.accept_nomination(g.current_user.id)
            return {"message": "Accepted nomination"}, 200
        else:
            proposal.arbiter.reject_nomination(g.current_user.id)
            return {"message": "Rejected nomination"}, 200

    except ValidationException as e:
        return {"message": str(e)}, 400
