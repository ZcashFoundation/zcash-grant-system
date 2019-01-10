from dateutil.parser import parse
from functools import wraps
import ast

from flask import Blueprint, g
from flask_yoloapi import endpoint, parameter
from sqlalchemy.exc import IntegrityError
from sqlalchemy import or_

from grant.comment.models import Comment, comment_schema, comments_schema
from grant.milestone.models import Milestone
from grant.user.models import User, SocialMedia, Avatar
from grant.email.send import send_email
from grant.utils.auth import requires_auth, requires_team_member_auth, get_authed_user, internal_webhook
from grant.utils.exceptions import ValidationException
from grant.utils.misc import is_email, make_url, from_zat
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
    DRAFT,
    PENDING,
    APPROVED,
    REJECTED,
    LIVE,
    DELETED,
    CONFIRMED,
)
import traceback

blueprint = Blueprint("proposal", __name__, url_prefix="/api/v1/proposals")


@blueprint.route("/<proposal_id>", methods=["GET"])
@endpoint.api()
def get_proposal(proposal_id):
    proposal = Proposal.query.filter_by(id=proposal_id).first()
    if proposal:
        if proposal.status != LIVE:
            if proposal.status == DELETED:
                return {"message": "Proposal was deleted"}, 404
            authed_user = get_authed_user()
            team_ids = list(x.id for x in proposal.team)
            if not authed_user or authed_user.id not in team_ids:
                return {"message": "User cannot view this proposal"}, 404
        return proposal_schema.dump(proposal)
    else:
        return {"message": "No proposal matching id"}, 404


@blueprint.route("/<proposal_id>/comments", methods=["GET"])
@endpoint.api()
def get_proposal_comments(proposal_id):
    proposal = Proposal.query.filter_by(id=proposal_id).first()
    if not proposal:
        return {"message": "No proposal matching id"}, 404

    # Only pull top comments, replies will be attached to them
    comments = Comment.query.filter_by(proposal_id=proposal_id, parent_comment_id=None)
    num_comments = Comment.query.filter_by(proposal_id=proposal_id).count()
    return {
        "proposalId": proposal_id,
        "totalComments": num_comments,
        "comments": comments_schema.dump(comments)
    }


@blueprint.route("/<proposal_id>/comments", methods=["POST"])
@requires_auth
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
    if parent_comment_id:
        parent = Comment.query.filter_by(id=parent_comment_id).first()
        if not parent:
            return {"message": "Parent comment doesn’t exist"}, 400

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
    return dumped_comment, 201


@blueprint.route("/", methods=["GET"])
@endpoint.api(
    parameter('stage', type=str, required=False)
)
def get_proposals(stage):
    if stage:
        proposals = (
            Proposal.query.filter_by(status=LIVE, stage=stage)
            .order_by(Proposal.date_created.desc())
            .all()
        )
    else:
        proposals = (
            Proposal.query.filter_by(status=LIVE)
            .order_by(Proposal.date_created.desc())
            .all()
        )
    dumped_proposals = proposals_schema.dump(proposals)
    return dumped_proposals
    # except Exception as e:
    #     print(e)
    #     print(traceback.format_exc())
    #     return {"message": "Oops! Something went wrong."}, 500


@blueprint.route("/drafts", methods=["POST"])
@requires_auth
@endpoint.api()
def make_proposal_draft():
    proposal = Proposal.create(status="DRAFT")
    proposal.team.append(g.current_user)
    db.session.add(proposal)
    db.session.commit()
    return proposal_schema.dump(proposal), 201


@blueprint.route("/drafts", methods=["GET"])
@requires_auth
@endpoint.api()
def get_proposal_drafts():
    proposals = (
        Proposal.query
        .filter(or_(Proposal.status == DRAFT, Proposal.status == REJECTED))
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
        return {"message": "Invalid proposal parameters: {}".format(str(e))}, 400
    db.session.add(g.current_proposal)

    # Delete & re-add milestones
    [db.session.delete(x) for x in g.current_proposal.milestones]
    if milestones:
        for mdata in milestones:
            m = Milestone(
                title=mdata["title"],
                content=mdata["content"],
                date_estimated=parse(mdata["dateEstimated"]),
                payout_percent=str(mdata["payoutPercent"]),
                immediate_payout=mdata["immediatePayout"],
                proposal_id=g.current_proposal.id
            )
            db.session.add(m)

    # Commit
    db.session.commit()
    return proposal_schema.dump(g.current_proposal), 200


@blueprint.route("/<proposal_id>", methods=["DELETE"])
@requires_team_member_auth
@endpoint.api()
def delete_proposal(proposal_id):
    deleteable_statuses = [DRAFT, PENDING, APPROVED, REJECTED]
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
        return {"message": "Invalid proposal parameters: {}".format(str(e))}, 400
    db.session.add(g.current_proposal)
    db.session.commit()
    return proposal_schema.dump(g.current_proposal), 200


@blueprint.route("/<proposal_id>/publish", methods=["PUT"])
@requires_team_member_auth
@endpoint.api()
def publish_proposal(proposal_id):
    try:
        g.current_proposal.publish()
    except ValidationException as e:
        return {"message": "Invalid proposal parameters: {}".format(str(e))}, 400
    db.session.add(g.current_proposal)
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
            'invite_url': make_url(f'/profile/{user.id}' if user else '/auth')
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
        .filter_by(proposal_id=proposal_id, status=CONFIRMED) \
        .order_by(ProposalContribution.amount.desc()) \
        .limit(5) \
        .all()
    latest_contributions = ProposalContribution.query \
        .filter_by(proposal_id=proposal_id, status=CONFIRMED) \
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
        contribution = ProposalContribution(
            proposal_id=proposal_id,
            user_id=g.current_user.id,
            amount=amount
        )
        db.session.add(contribution)
        db.session.commit()

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
    contribution = contribution = ProposalContribution.query.filter_by(
        id=contribution_id).first()

    if not contribution:
        # TODO: Log in sentry
        print(f'Unknown contribution {contribution_id} confirmed with txid {txid}')
        return {"message": "No contribution matching id"}, 404

    # Convert to whole zcash coins from zats
    zec_amount = str(from_zat(int(amount)))

    contribution.confirm(tx_id=txid, amount=zec_amount)
    db.session.add(contribution)
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

    if contribution.status == CONFIRMED:
        return {"message": "Cannot delete confirmed contributions"}, 400

    if contribution.user_id != g.current_user.id:
        return {"message": "Must be the user of the contribution to delete it"}, 403

    contribution.status = DELETED
    db.session.add(contribution)
    db.session.commit()
    return None, 202
