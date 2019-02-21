from dateutil.parser import parse
from decimal import Decimal
from flask import Blueprint, g, request
from flask_yoloapi import endpoint, parameter
from grant.comment.models import Comment, comment_schema, comments_schema
from grant.email.send import send_email
from grant.milestone.models import Milestone
from grant.settings import EXPLORER_URL, PROPOSAL_STAKING_AMOUNT
from grant.user.models import User
from grant.rfp.models import RFP
from grant.utils.auth import (
    requires_auth,
    requires_team_member_auth,
    requires_arbiter_auth,
    requires_email_verified_auth,
    get_authed_user,
    internal_webhook
)
from grant.utils.exceptions import ValidationException
from grant.utils.misc import is_email, make_url, from_zat
from grant.utils.enums import ProposalStatus, ProposalStage, ContributionStatus
from grant.utils import pagination
from grant.task.jobs import ProposalDeadline
from sqlalchemy import or_
from datetime import datetime

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
@endpoint.api()
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
@endpoint.api(
    parameter('page', type=int, required=False),
    parameter('filters', type=list, required=False),
    parameter('search', type=str, required=False),
    parameter('sort', type=str, required=False)
)
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
@endpoint.api()
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
    return None, 200


@blueprint.route("/<proposal_id>/comments", methods=["POST"])
@requires_email_verified_auth
@endpoint.api(
    parameter('comment', type=str, required=True),
    parameter('parentCommentId', type=int, required=False)
)
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

    # TODO: Email proposal team if top-level comment
    if not parent:
        for member in proposal.team:
            send_email(member.email_address, 'proposal_comment', {
                'author': g.current_user,
                'proposal': proposal,
                'comment_url': make_url(f'/proposal/{proposal.id}?tab=discussions&comment={comment.id}'),
                'author_url': make_url(f'/profile/{comment.author.id}'),
            })
    # Email parent comment creator, if it's not themselves
    if parent and parent.author.id != comment.author.id:
        send_email(parent.author.email_address, 'comment_reply', {
            'author': g.current_user,
            'proposal': proposal,
            'comment_url': make_url(f'/proposal/{proposal.id}?tab=discussions&comment={comment.id}'),
            'author_url': make_url(f'/profile/{comment.author.id}'),
        })

    return dumped_comment, 201


@blueprint.route("/", methods=["GET"])
@endpoint.api(
    parameter('page', type=int, required=False),
    parameter('filters', type=list, required=False),
    parameter('search', type=str, required=False),
    parameter('sort', type=str, required=False)
)
def get_proposals(page, filters, search, sort):
    filters_workaround = request.args.getlist('filters[]')
    page = pagination.proposal(
        schema=proposals_schema,
        query=Proposal.query.filter_by(status=ProposalStatus.LIVE),
        page=page,
        filters=filters_workaround,
        search=search,
        sort=sort,
    )
    return page


@blueprint.route("/drafts", methods=["POST"])
@requires_email_verified_auth
@endpoint.api(
    parameter('rfpId', type=int),
)
def make_proposal_draft(rfp_id):
    proposal = Proposal.create(status=ProposalStatus.DRAFT)
    proposal.team.append(g.current_user)

    if rfp_id:
        rfp = RFP.query.filter_by(id=rfp_id).first()
        if not rfp:
            return {"message": "The request this proposal was made for doesn’t exist"}, 400
        proposal.category = rfp.category
        if rfp.matching:
            proposal.contribution_matching = 1.0
        rfp.proposals.append(proposal)
        db.session.add(rfp)

    db.session.add(proposal)
    db.session.commit()
    return proposal_schema.dump(proposal), 201


@blueprint.route("/drafts", methods=["GET"])
@requires_auth
@endpoint.api()
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
@endpoint.api(
    parameter('title', type=str),
    parameter('brief', type=str),
    parameter('category', type=str),
    parameter('content', type=str),
    parameter('target', type=str),
    parameter('payoutAddress', type=str),
    parameter('deadlineDuration', type=int),
    parameter('milestones', type=list)
)
def update_proposal(milestones, proposal_id, **kwargs):
    # Update the base proposal fields
    try:
        g.current_proposal.update(**kwargs)
    except ValidationException as e:
        return {"message": "{}".format(str(e))}, 400
    db.session.add(g.current_proposal)
    # Delete & re-add milestones
    [db.session.delete(x) for x in g.current_proposal.milestones]
    if milestones:
        for i, mdata in enumerate(milestones):
            m = Milestone(
                title=mdata["title"],
                content=mdata["content"],
                date_estimated=datetime.fromtimestamp(mdata["dateEstimated"]),
                payout_percent=str(mdata["payoutPercent"]),
                immediate_payout=mdata["immediatePayout"],
                proposal_id=g.current_proposal.id,
                index=i
            )
            db.session.add(m)

    # Commit
    db.session.commit()
    return proposal_schema.dump(g.current_proposal), 200


@blueprint.route("/<proposal_id>/rfp", methods=["DELETE"])
@requires_team_member_auth
@endpoint.api()
def unlink_proposal_from_rfp(proposal_id):
    g.current_proposal.rfp_id = None
    db.session.add(g.current_proposal)
    db.session.commit()
    return proposal_schema.dump(g.current_proposal), 200


@blueprint.route("/<proposal_id>", methods=["DELETE"])
@requires_team_member_auth
@endpoint.api()
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
    return None, 202


@blueprint.route("/<proposal_id>/submit_for_approval", methods=["PUT"])
@requires_team_member_auth
@endpoint.api()
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
@endpoint.api()
def get_proposal_stake(proposal_id):
    if g.current_proposal.status != ProposalStatus.STAKING:
        return None, 400
    contribution = g.current_proposal.get_staking_contribution(g.current_user.id)
    if contribution:
        return proposal_contribution_schema.dump(contribution)
    return None, 404


@blueprint.route("/<proposal_id>/publish", methods=["PUT"])
@requires_team_member_auth
@endpoint.api()
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
@endpoint.api()
def get_proposal_updates(proposal_id):
    proposal = Proposal.query.filter_by(id=proposal_id).first()
    if proposal:
        dumped_proposal = proposal_schema.dump(proposal)
        return dumped_proposal["updates"]
    else:
        return {"message": "No proposal matching id"}, 404


@blueprint.route("/<proposal_id>/updates/<update_id>", methods=["GET"])
@endpoint.api()
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
@requires_team_member_auth
@endpoint.api(
    parameter('title', type=str, required=True),
    parameter('content', type=str, required=True)
)
def post_proposal_update(proposal_id, title, content):
    update = ProposalUpdate(
        proposal_id=g.current_proposal.id,
        title=title,
        content=content
    )
    db.session.add(update)
    db.session.commit()

    # Send email to all contributors (even if contribution failed)
    contributions = ProposalContribution.query.filter_by(proposal_id=proposal_id).all()
    for c in contributions:
        send_email(c.user.email_address, 'contribution_update', {
            'proposal': g.current_proposal,
            'proposal_update': update,
            'update_url': make_url(f'/proposals/{proposal_id}?tab=updates&update={update.id}'),
        })

    dumped_update = proposal_update_schema.dump(update)
    return dumped_update, 201


@blueprint.route("/<proposal_id>/invite", methods=["POST"])
@requires_team_member_auth
@endpoint.api(
    parameter('address', type=str, required=True)
)
def post_proposal_team_invite(proposal_id, address):
    invite = ProposalTeamInvite(
        proposal_id=proposal_id,
        address=address
    )
    db.session.add(invite)
    db.session.commit()

    # Send email
    # TODO: Move this to some background task / after request action
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
@endpoint.api()
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
    return None, 202


@blueprint.route("/<proposal_id>/contributions", methods=["GET"])
@endpoint.api()
def get_proposal_contributions(proposal_id):
    proposal = Proposal.query.filter_by(id=proposal_id).first()
    if not proposal:
        return {"message": "No proposal matching id"}, 404

    top_contributions = ProposalContribution.query \
        .filter_by(
            proposal_id=proposal_id,
            status=ContributionStatus.CONFIRMED,
            staking=False,
        ) \
        .order_by(ProposalContribution.amount.desc()) \
        .limit(5) \
        .all()
    latest_contributions = ProposalContribution.query \
        .filter_by(
            proposal_id=proposal_id,
            status=ContributionStatus.CONFIRMED,
            staking=False,
        ) \
        .order_by(ProposalContribution.date_created.desc()) \
        .limit(5) \
        .all()

    return {
        'top': proposal_proposal_contributions_schema.dump(top_contributions),
        'latest': proposal_proposal_contributions_schema.dump(latest_contributions),
    }


@blueprint.route("/<proposal_id>/contributions/<contribution_id>", methods=["GET"])
@endpoint.api()
def get_proposal_contribution(proposal_id, contribution_id):
    proposal = Proposal.query.filter_by(id=proposal_id).first()
    if proposal:
        contribution = ProposalContribution.query.filter_by(id=contribution_id).first()
        if contribution:
            return proposal_contribution_schema.dump(contribution)
        else:
            return {"message": "No contribution matching id"}
    else:
        return {"message": "No proposal matching id"}, 404


@blueprint.route("/<proposal_id>/contributions", methods=["POST"])
@requires_auth
@endpoint.api(
    parameter('amount', type=str, required=True)
)
def post_proposal_contribution(proposal_id, amount):
    proposal = Proposal.query.filter_by(id=proposal_id).first()
    if not proposal:
        return {"message": "No proposal matching id"}, 404

    code = 200
    contribution = ProposalContribution \
        .get_existing_contribution(g.current_user.id, proposal_id, amount)

    if not contribution:
        code = 201
        contribution = proposal.create_contribution(g.current_user.id, amount)

    dumped_contribution = proposal_contribution_schema.dump(contribution)
    return dumped_contribution, code


# Can't use <proposal_id> since webhook doesn't know proposal id
@blueprint.route("/contribution/<contribution_id>/confirm", methods=["POST"])
@internal_webhook
@endpoint.api(
    parameter('to', type=str, required=True),
    parameter('amount', type=str, required=True),
    parameter('txid', type=str, required=True),
)
def post_contribution_confirmation(contribution_id, to, amount, txid):
    contribution = ProposalContribution.query.filter_by(
        id=contribution_id).first()

    if not contribution:
        # TODO: Log in sentry
        print(f'Unknown contribution {contribution_id} confirmed with txid {txid}')
        return {"message": "No contribution matching id"}, 404

    if contribution.status == ContributionStatus.CONFIRMED:
        # Duplicates can happen, just return ok
        return None, 200

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
            'tx_explorer_url': f'{EXPLORER_URL}transactions/{txid}',
            'fully_staked': contribution.proposal.is_staked,
            'stake_target': str(PROPOSAL_STAKING_AMOUNT.normalize()),
        })

    else:
        # Send to the user
        send_email(contribution.user.email_address, 'contribution_confirmed', {
            'contribution': contribution,
            'proposal': contribution.proposal,
            'tx_explorer_url': f'{EXPLORER_URL}transactions/{txid}',
        })

        # Send to the full proposal gang
        for member in contribution.proposal.team:
            send_email(member.email_address, 'proposal_contribution', {
                'proposal': contribution.proposal,
                'contribution': contribution,
                'contributor': contribution.user,
                'funded': contribution.proposal.funded,
                'proposal_url': make_url(f'/proposals/{contribution.proposal.id}'),
                'contributor_url': make_url(f'/profile/{contribution.user.id}'),
            })

    # TODO: Once we have a task queuer in place, queue emails to everyone

    # on funding target reached.
    contribution.proposal.set_funded_when_ready()

    db.session.commit()
    return None, 200


@blueprint.route("/contribution/<contribution_id>", methods=["DELETE"])
@requires_auth
@endpoint.api()
def delete_proposal_contribution(contribution_id):
    contribution = contribution = ProposalContribution.query.filter_by(
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
    return None, 202


# request MS payout
@blueprint.route("/<proposal_id>/milestone/<milestone_id>/request", methods=["PUT"])
@requires_team_member_auth
@endpoint.api()
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
@endpoint.api()
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
@endpoint.api(
    parameter('reason', type=str, required=True),
)
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
