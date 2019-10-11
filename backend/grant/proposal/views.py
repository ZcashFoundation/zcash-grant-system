from decimal import Decimal
from datetime import datetime

from flask import Blueprint, g, request, current_app
from marshmallow import fields, validate
from sqlalchemy import or_
from sentry_sdk import capture_message
from webargs import validate

from grant.extensions import limiter
from grant.comment.models import Comment, comment_schema, comments_schema
from grant.email.send import send_email
from grant.milestone.models import Milestone
from grant.parser import body, query, paginated_fields
from grant.rfp.models import RFP
from grant.settings import PROPOSAL_STAKING_AMOUNT
from grant.task.jobs import ProposalDeadline
from grant.user.models import User
from grant.utils import pagination
from grant.utils.auth import (
    requires_auth,
    requires_team_member_auth,
    requires_arbiter_auth,
    requires_email_verified_auth,
    get_authed_user,
    internal_webhook
)
from grant.utils.enums import Category
from grant.utils.enums import ProposalStatus, ProposalStage, ContributionStatus, RFPStatus
from grant.utils.exceptions import ValidationException
from grant.utils.misc import is_email, make_url, from_zat, make_explore_url
from .models import (
    Proposal,
    proposals_schema,
    proposal_schema,
    ProposalUpdate,
    proposal_update_schema,
    ProposalContribution,
    proposal_contribution_schema,
    proposal_team,
    ProposalTeamInvite,
    proposal_team_invite_schema,
    proposal_proposal_contributions_schema,
    db,
)

blueprint = Blueprint("proposal", __name__, url_prefix="/api/v1/proposals")


@blueprint.route("/<proposal_id>", methods=["GET"])
def get_proposal(proposal_id):
    proposal = Proposal.query.filter_by(id=proposal_id).first()
    if proposal:
        if proposal.status != ProposalStatus.LIVE:
            if proposal.status == ProposalStatus.DELETED:
                return {"message": "Proposal was deleted"}, 404
            authed_user = get_authed_user()
            team_ids = list(x.id for x in proposal.team)
            if not authed_user or authed_user.id not in team_ids:
                return {"message": "User cannot view this proposal"}, 404
        return proposal_schema.dump(proposal)
    else:
        return {"message": "No proposal matching id"}, 404


@blueprint.route("/<proposal_id>/comments", methods=["GET"])
@query(paginated_fields)
def get_proposal_comments(proposal_id, page, filters, search, sort):
    # only using page, currently
    filters_workaround = request.args.getlist('filters[]')
    page = pagination.comment(
        schema=comments_schema,
        query=Comment.query.filter_by(proposal_id=proposal_id, parent_comment_id=None, hidden=False),
        page=page,
        filters=filters_workaround,
        search=search,
        sort=sort,
    )
    return page


@blueprint.route("/<proposal_id>/comments/<comment_id>/report", methods=["PUT"])
@requires_email_verified_auth
def report_proposal_comment(proposal_id, comment_id):
    # Make sure proposal exists
    proposal = Proposal.query.filter_by(id=proposal_id).first()
    if not proposal:
        return {"message": "No proposal matching id"}, 404

    comment = Comment.query.filter_by(id=comment_id).first()
    if not comment:
        return {"message": "Comment doesn’t exist"}, 404

    comment.report(True)
    db.session.commit()
    return {"message": "ok"}, 200


@blueprint.route("/<proposal_id>/comments", methods=["POST"])
@limiter.limit("30/hour;2/minute")
@requires_email_verified_auth
@body({
    "comment": fields.Str(required=True, validate=validate.Length(max=5000)),
    "parentCommentId": fields.Int(required=False, missing=None),
})
def post_proposal_comments(proposal_id, comment, parent_comment_id):
    # Make sure proposal exists
    proposal = Proposal.query.filter_by(id=proposal_id).first()
    if not proposal:
        return {"message": "No proposal matching id"}, 404

    # Make sure the parent comment exists
    parent = None
    if parent_comment_id:
        parent = Comment.query.filter_by(id=parent_comment_id).first()
        if not parent:
            return {"message": "Parent comment doesn’t exist"}, 400

    # Make sure user has verified their email
    if not g.current_user.email_verification.has_verified:
        return {"message": "Please confirm your email before commenting"}, 401

    # Make sure user is not silenced
    if g.current_user.silenced:
        return {"message": "Your account has been silenced, commenting is disabled."}, 403

    # Make the comment
    comment = Comment(
        proposal_id=proposal_id,
        user_id=g.current_user.id,
        parent_comment_id=parent_comment_id,
        content=comment
    )
    db.session.add(comment)
    db.session.commit()
    dumped_comment = comment_schema.dump(comment)

    # Email proposal team if top-level comment
    if not parent:
        for member in proposal.team:
            send_email(member.email_address, 'proposal_comment', {
                'author': g.current_user,
                'proposal': proposal,
                'comment_url': make_url(f'/proposals/{proposal.id}?tab=discussions&comment={comment.id}'),
                'author_url': make_url(f'/profile/{comment.author.id}'),
            })
    # Email parent comment creator, if it's not themselves
    if parent and parent.author.id != comment.author.id:
        send_email(parent.author.email_address, 'comment_reply', {
            'author': g.current_user,
            'proposal': proposal,
            'comment_url': make_url(f'/proposals/{proposal.id}?tab=discussions&comment={comment.id}'),
            'author_url': make_url(f'/profile/{comment.author.id}'),
        })

    return dumped_comment, 201


@blueprint.route("/", methods=["GET"])
@query(paginated_fields)
def get_proposals(page, filters, search, sort):
    filters_workaround = request.args.getlist('filters[]')
    query = Proposal.query.filter_by(status=ProposalStatus.LIVE) \
        .filter(Proposal.stage != ProposalStage.CANCELED) \
        .filter(Proposal.stage != ProposalStage.FAILED)
    page = pagination.proposal(
        schema=proposals_schema,
        query=query,
        page=page,
        filters=filters_workaround,
        search=search,
        sort=sort,
    )
    return page


@blueprint.route("/drafts", methods=["POST"])
@limiter.limit("10/hour;3/minute")
@requires_email_verified_auth
@body({
    "rfpId": fields.Int(required=False, missing=None)
})
def make_proposal_draft(rfp_id):
    proposal = Proposal.create(status=ProposalStatus.DRAFT)
    proposal.team.append(g.current_user)

    if rfp_id:
        rfp = RFP.query.filter_by(id=rfp_id).first()
        if not rfp:
            return {"message": "The request this proposal was made for doesn’t exist"}, 400
        if datetime.now() > rfp.date_closes:
            return {"message": "The request this proposal was made for has expired"}, 400
        if rfp.status == RFPStatus.CLOSED:
            return {"message": "The request this proposal was made for has been closed"}, 400
        proposal.category = rfp.category
        rfp.proposals.append(proposal)
        db.session.add(rfp)

    db.session.add(proposal)
    db.session.commit()
    return proposal_schema.dump(proposal), 201


@blueprint.route("/drafts", methods=["GET"])
@requires_auth
def get_proposal_drafts():
    proposals = (
        Proposal.query
            .filter(or_(
            Proposal.status == ProposalStatus.DRAFT,
            Proposal.status == ProposalStatus.REJECTED,
        ))
            .join(proposal_team)
            .filter(proposal_team.c.user_id == g.current_user.id)
            .order_by(Proposal.date_created.desc())
            .all()
    )
    return proposals_schema.dump(proposals), 200


@blueprint.route("/<proposal_id>", methods=["PUT"])
@requires_team_member_auth
@body({
    # Length checks are to prevent database errors, not actual user limits imposed
    "title": fields.Str(required=True),
    "brief": fields.Str(required=True),
    "category": fields.Str(required=True, validate=validate.OneOf(choices=Category.list() + [''])),
    "content": fields.Str(required=True),
    "target": fields.Str(required=True),
    "payoutAddress": fields.Str(required=True),
    "deadlineDuration": fields.Int(required=True),
    "milestones": fields.List(fields.Dict(), required=True),
    "rfpOptIn": fields.Bool(required=False, missing=None),
})
def update_proposal(milestones, proposal_id, rfp_opt_in, **kwargs):
    # Update the base proposal fields
    try:
        if g.current_proposal.status not in [ProposalStatus.DRAFT,
                                             ProposalStatus.REJECTED]:
            raise ValidationException(
               f"Proposal with status: {g.current_proposal.status} are not authorized for updates"
            )
        g.current_proposal.update(**kwargs)
    except ValidationException as e:
        return {"message": "{}".format(str(e))}, 400
    db.session.add(g.current_proposal)

    # twiddle rfp opt-in (modifies proposal matching and/or bounty)
    if rfp_opt_in is not None:
        g.current_proposal.update_rfp_opt_in(rfp_opt_in)

    Milestone.make(milestones, g.current_proposal)

    # Commit
    db.session.commit()
    return proposal_schema.dump(g.current_proposal), 200


@blueprint.route("/<proposal_id>/rfp", methods=["DELETE"])
@requires_team_member_auth
def unlink_proposal_from_rfp(proposal_id):
    g.current_proposal.rfp_id = None
    # this will zero matching and bounty
    g.current_proposal.update_rfp_opt_in(False)
    g.current_proposal.rfp_opt_in = None
    db.session.add(g.current_proposal)
    db.session.commit()
    return proposal_schema.dump(g.current_proposal), 200


@blueprint.route("/<proposal_id>", methods=["DELETE"])
@requires_team_member_auth
def delete_proposal(proposal_id):
    deleteable_statuses = [
        ProposalStatus.DRAFT,
        ProposalStatus.PENDING,
        ProposalStatus.APPROVED,
        ProposalStatus.REJECTED,
        ProposalStatus.STAKING,
    ]
    status = g.current_proposal.status
    if status not in deleteable_statuses:
        return {"message": "Cannot delete proposals with %s status" % status}, 400
    db.session.delete(g.current_proposal)
    db.session.commit()
    return {"message": "ok"}, 202


@blueprint.route("/<proposal_id>/submit_for_approval", methods=["PUT"])
@requires_team_member_auth
def submit_for_approval_proposal(proposal_id):
    try:
        g.current_proposal.submit_for_approval()
    except ValidationException as e:
        return {"message": "{}".format(str(e))}, 400
    db.session.add(g.current_proposal)
    db.session.commit()
    return proposal_schema.dump(g.current_proposal), 200


@blueprint.route("/<proposal_id>/stake", methods=["GET"])
@requires_team_member_auth
def get_proposal_stake(proposal_id):
    if g.current_proposal.status != ProposalStatus.STAKING:
        return {"message": "ok"}, 400
    contribution = g.current_proposal.get_staking_contribution(g.current_user.id)
    if contribution:
        return proposal_contribution_schema.dump(contribution)
    return {"message": "ok"}, 404


@blueprint.route("/<proposal_id>/publish", methods=["PUT"])
@requires_team_member_auth
def publish_proposal(proposal_id):
    try:
        g.current_proposal.publish()
    except ValidationException as e:
        return {"message": "{}".format(str(e))}, 400
    db.session.add(g.current_proposal)

    task = ProposalDeadline(g.current_proposal)
    task.make_task()

    db.session.commit()
    return proposal_schema.dump(g.current_proposal), 200


@blueprint.route("/<proposal_id>/updates", methods=["GET"])
def get_proposal_updates(proposal_id):
    proposal = Proposal.query.filter_by(id=proposal_id).first()
    if proposal:
        dumped_proposal = proposal_schema.dump(proposal)
        return dumped_proposal["updates"]
    else:
        return {"message": "No proposal matching id"}, 404


@blueprint.route("/<proposal_id>/updates/<update_id>", methods=["GET"])
def get_proposal_update(proposal_id, update_id):
    proposal = Proposal.query.filter_by(id=proposal_id).first()
    if proposal:
        update = ProposalUpdate.query.filter_by(proposal_id=proposal.id, id=update_id).first()
        if update:
            return proposal_update_schema.dump(update)
        else:
            return {"message": "No update matching id"}
    else:
        return {"message": "No proposal matching id"}, 404


@blueprint.route("/<proposal_id>/updates", methods=["POST"])
@limiter.limit("5/day;1/minute")
@requires_team_member_auth
@body({
    "title": fields.Str(required=True, validate=validate.Length(min=3, max=60)),
    "content": fields.Str(required=True, validate=validate.Length(min=5, max=10000)),
})
def post_proposal_update(proposal_id, title, content):
    update = ProposalUpdate(
        proposal_id=g.current_proposal.id,
        title=title,
        content=content
    )
    db.session.add(update)
    db.session.commit()

    # Send email to all contributors
    for u in g.current_proposal.contributors:
        send_email(u.email_address, 'contribution_update', {
            'proposal': g.current_proposal,
            'proposal_update': update,
            'update_url': make_url(f'/proposals/{proposal_id}?tab=updates&update={update.id}'),
        })

    dumped_update = proposal_update_schema.dump(update)
    return dumped_update, 201


@blueprint.route("/<proposal_id>/invite", methods=["POST"])
@limiter.limit("30/day;10/minute")
@requires_team_member_auth
@body({
    "address": fields.Str(required=True, validate=validate.Length(max=255)),
})
def post_proposal_team_invite(proposal_id, address):
    for u in g.current_proposal.team:
        if address == u.email_address:
            return {"message": f"Cannot invite members already on the team"}, 400

    existing_invite = ProposalTeamInvite.query.filter_by(
        proposal_id=proposal_id,
        address=address
    ).first()
    if existing_invite:
        return {"message": f"You've already invited {address}"}, 400

    invite = ProposalTeamInvite(
        proposal_id=proposal_id,
        address=address
    )
    db.session.add(invite)
    db.session.commit()

    # Send email
    email = address
    user = User.get_by_email(email_address=address)
    if user:
        email = user.email_address
    if is_email(email):
        send_email(email, 'team_invite', {
            'user': user,
            'inviter': g.current_user,
            'proposal': g.current_proposal,
            'invite_url': make_url(
                f'/profile/{user.id}?tab=invites' if user else '/auth')
        })

    return proposal_team_invite_schema.dump(invite), 201


@blueprint.route("/<proposal_id>/invite/<id_or_address>", methods=["DELETE"])
@requires_team_member_auth
def delete_proposal_team_invite(proposal_id, id_or_address):
    invite = ProposalTeamInvite.query.filter(
        (ProposalTeamInvite.id == id_or_address) |
        (ProposalTeamInvite.address == id_or_address)
    ).first()
    if not invite:
        return {"message": "No invite found given {}".format(id_or_address)}, 404
    if invite.accepted:
        return {"message": "Cannot delete an invite that has been accepted"}, 403

    db.session.delete(invite)
    db.session.commit()
    return {"message": "ok"}, 202


@blueprint.route("/<proposal_id>/contributions", methods=["GET"])
def get_proposal_contributions(proposal_id):
    proposal = Proposal.query.filter_by(id=proposal_id).first()
    if not proposal:
        return {"message": "No proposal matching id"}, 404

    top_contributions = ProposalContribution.query.filter_by(
        proposal_id=proposal_id,
        status=ContributionStatus.CONFIRMED,
        staking=False,
    ).order_by(
        ProposalContribution.amount.desc()
    ).limit(
        5
    ).all()
    latest_contributions = ProposalContribution.query.filter_by(
        proposal_id=proposal_id,
        status=ContributionStatus.CONFIRMED,
        staking=False,
    ).order_by(
        ProposalContribution.date_created.desc()
    ).limit(
        5
    ).all()

    return {
        'top': proposal_proposal_contributions_schema.dump(top_contributions),
        'latest': proposal_proposal_contributions_schema.dump(latest_contributions),
    }


@blueprint.route("/<proposal_id>/contributions/<contribution_id>", methods=["GET"])
def get_proposal_contribution(proposal_id, contribution_id):
    proposal = Proposal.query.filter_by(id=proposal_id).first()
    if not proposal:
        return {"message": "No proposal matching id"}, 404

    contribution = ProposalContribution.query.filter_by(id=contribution_id).first()
    if not contribution:
        return {"message": "No contribution matching id"}, 404

    return proposal_contribution_schema.dump(contribution)


@blueprint.route("/<proposal_id>/contributions", methods=["POST"])
@limiter.limit("30/day;10/hour;2/minute")
@body({
    "amount": fields.Str(required=True, validate=lambda p: 0.0001 <= float(p) <= 1000000),
    "private": fields.Bool(required=False, missing=True)
})
def post_proposal_contribution(proposal_id, amount, private):
    proposal = Proposal.query.filter_by(id=proposal_id).first()
    if not proposal:
        return {"message": "No proposal matching id"}, 404

    code = 200
    user = get_authed_user()
    contribution = None

    if user:
        contribution = ProposalContribution \
            .get_existing_contribution(user.id, proposal_id, amount, private)

    if not contribution:
        code = 201
        contribution = proposal.create_contribution(
            amount=amount,
            private=private,
            user_id=user.id if user else None,
        )

    dumped_contribution = proposal_contribution_schema.dump(contribution)
    return dumped_contribution, code


# Can't use <proposal_id> since webhook doesn't know proposal id
@blueprint.route("/contribution/<contribution_id>/confirm", methods=["POST"])
@internal_webhook
@body({
    "to": fields.Str(required=True),
    "amount": fields.Str(required=True),
    "txid": fields.Str(required=True),
})
def post_contribution_confirmation(contribution_id, to, amount, txid):
    contribution = ProposalContribution.query.filter_by(
        id=contribution_id).first()

    if not contribution:
        msg = f'Unknown contribution {contribution_id} confirmed with txid {txid}, amount {amount}'
        capture_message(msg)
        current_app.logger.warn(msg)
        return {"message": "No contribution matching id"}, 404

    if contribution.status == ContributionStatus.CONFIRMED:
        # Duplicates can happen, just return ok
        return {"message": "ok"}, 200

    # Convert to whole zcash coins from zats
    zec_amount = str(from_zat(int(amount)))

    contribution.confirm(tx_id=txid, amount=zec_amount)
    db.session.add(contribution)
    db.session.flush()

    if contribution.proposal.status == ProposalStatus.STAKING:
        contribution.proposal.set_pending_when_ready()

        # email progress of staking, partial or complete
        send_email(contribution.user.email_address, 'staking_contribution_confirmed', {
            'contribution': contribution,
            'proposal': contribution.proposal,
            'tx_explorer_url': make_explore_url(txid),
            'fully_staked': contribution.proposal.is_staked,
            'stake_target': str(PROPOSAL_STAKING_AMOUNT.normalize()),
        })

    else:
        # Send to the user
        if contribution.user:
            send_email(contribution.user.email_address, 'contribution_confirmed', {
                'contribution': contribution,
                'proposal': contribution.proposal,
                'tx_explorer_url': make_explore_url(txid),
            })

        # Send to the full proposal gang
        for member in contribution.proposal.team:
            send_email(member.email_address, 'proposal_contribution', {
                'proposal': contribution.proposal,
                'contribution': contribution,
                'contributor': contribution.user,
                'funded': contribution.proposal.funded,
                'proposal_url': make_url(f'/proposals/{contribution.proposal.id}'),
                'contributor_url': make_url(f'/profile/{contribution.user.id}') if contribution.user else '',
            })

    # on funding target reached.
    contribution.proposal.set_funded_when_ready()

    db.session.commit()
    return {"message": "ok"}, 200


@blueprint.route("/contribution/<contribution_id>", methods=["DELETE"])
@requires_auth
def delete_proposal_contribution(contribution_id):
    contribution = ProposalContribution.query.filter_by(
        id=contribution_id).first()
    if not contribution:
        return {"message": "No contribution matching id"}, 404

    if contribution.status == ContributionStatus.CONFIRMED:
        return {"message": "Cannot delete confirmed contributions"}, 400

    if contribution.user_id != g.current_user.id:
        return {"message": "Must be the user of the contribution to delete it"}, 403

    contribution.status = ContributionStatus.DELETED
    db.session.add(contribution)
    db.session.commit()
    return {"message": "ok"}, 202


# request MS payout
@blueprint.route("/<proposal_id>/milestone/<milestone_id>/request", methods=["PUT"])
@requires_team_member_auth
def request_milestone_payout(proposal_id, milestone_id):
    if not g.current_proposal.is_funded:
        return {"message": "Proposal is not fully funded"}, 400
    for ms in g.current_proposal.milestones:
        if ms.id == int(milestone_id):
            ms.request_payout(g.current_user.id)
            db.session.add(ms)
            db.session.commit()
            # email ARBITER to review payout request
            send_email(g.current_proposal.arbiter.user.email_address, 'milestone_request', {
                'proposal': g.current_proposal,
                'proposal_milestones_url': make_url(f'/proposals/{g.current_proposal.id}?tab=milestones'),
            })
            return proposal_schema.dump(g.current_proposal), 200

    return {"message": "No milestone matching id"}, 404


# accept MS payout (arbiter)
@blueprint.route("/<proposal_id>/milestone/<milestone_id>/accept", methods=["PUT"])
@requires_arbiter_auth
def accept_milestone_payout_request(proposal_id, milestone_id):
    if not g.current_proposal.is_funded:
        return {"message": "Proposal is not fully funded"}, 400
    for ms in g.current_proposal.milestones:
        if ms.id == int(milestone_id):
            ms.accept_request(g.current_user.id)
            db.session.add(ms)
            db.session.commit()
            # email TEAM that payout request accepted
            amount = Decimal(ms.payout_percent) * Decimal(g.current_proposal.target) / 100
            for member in g.current_proposal.team:
                send_email(member.email_address, 'milestone_accept', {
                    'proposal': g.current_proposal,
                    'amount': amount,
                    'proposal_milestones_url': make_url(f'/proposals/{g.current_proposal.id}?tab=milestones'),
                })
            return proposal_schema.dump(g.current_proposal), 200

    return {"message": "No milestone matching id"}, 404


# reject MS payout (arbiter) (reason)
@blueprint.route("/<proposal_id>/milestone/<milestone_id>/reject", methods=["PUT"])
@requires_arbiter_auth
@body({
    "reason": fields.Str(required=True, validate=validate.Length(min=2, max=200)),
})
def reject_milestone_payout_request(proposal_id, milestone_id, reason):
    if not g.current_proposal.is_funded:
        return {"message": "Proposal is not fully funded"}, 400
    for ms in g.current_proposal.milestones:
        if ms.id == int(milestone_id):
            ms.reject_request(g.current_user.id, reason)
            db.session.add(ms)
            db.session.commit()
            # email TEAM that payout request was rejected
            for member in g.current_proposal.team:
                send_email(member.email_address, 'milestone_reject', {
                    'proposal': g.current_proposal,
                    'admin_note': reason,
                    'proposal_milestones_url': make_url(f'/proposals/{g.current_proposal.id}?tab=milestones'),
                })
            return proposal_schema.dump(g.current_proposal), 200

    return {"message": "No milestone matching id"}, 404
