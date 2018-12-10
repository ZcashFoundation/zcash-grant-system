from dateutil.parser import parse
from functools import wraps
import ast

from flask import Blueprint, g
from flask_yoloapi import endpoint, parameter
from sqlalchemy.exc import IntegrityError

from grant.comment.models import Comment, comment_schema, comments_schema
from grant.milestone.models import Milestone
from grant.user.models import User, SocialMedia, Avatar
from grant.email.send import send_email
from grant.utils.auth import requires_sm, requires_team_member_auth
from grant.utils.exceptions import ValidationException
from grant.utils.misc import is_email
from .models import(
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
    db
)
import traceback

blueprint = Blueprint("proposal", __name__, url_prefix="/api/v1/proposals")


@blueprint.route("/<proposal_id>", methods=["GET"])
@endpoint.api()
def get_proposal(proposal_id):
    proposal = Proposal.query.filter_by(id=proposal_id).first()
    if proposal:
        dumped_proposal = proposal_schema.dump(proposal)
        return dumped_proposal
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
@requires_sm
@endpoint.api(
    parameter('comment', type=str, required=True),
    parameter('parentCommentId', type=int, required=False)
)
def post_proposal_comments(proposal_id, comment, parent_comment_id, signed_message, raw_typed_data):
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
            Proposal.query.filter_by(status="LIVE", stage=stage)
                .order_by(Proposal.date_created.desc())
                .all()
        )
    else:
        proposals = Proposal.query.order_by(Proposal.date_created.desc()).all()
    dumped_proposals = proposals_schema.dump(proposals)
    return dumped_proposals
    # except Exception as e:
    #     print(e)
    #     print(traceback.format_exc())
    #     return {"message": "Oops! Something went wrong."}, 500


@blueprint.route("/drafts", methods=["POST"])
@requires_sm
@endpoint.api()
def make_proposal_draft():
    proposal = Proposal.create(status="DRAFT")
    proposal.team.append(g.current_user)
    db.session.add(proposal)
    db.session.commit()
    return proposal_schema.dump(proposal), 201


@blueprint.route("/drafts", methods=["GET"])
@requires_sm
@endpoint.api()
def get_proposal_drafts():
    proposals = (
        Proposal.query
        .filter_by(status="DRAFT")
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
    parameter('trustees', type=list),
    parameter('deadlineDuration', type=int),
    parameter('voteDuration', type=int),
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
def delete_proposal_draft(proposal_id):
    if g.current_proposal.status != 'DRAFT':
        return {"message": "Cannot delete non-draft proposals"}, 400
    db.session.delete(g.current_proposal)
    db.session.commit()
    return None, 202


@blueprint.route("/<proposal_id>/publish", methods=["PUT"])
@requires_team_member_auth
@endpoint.api(
    parameter('contractAddress', type=str, required=True)
)
def publish_proposal(proposal_id, contract_address):
    try:
        g.current_proposal.proposal_address = contract_address
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
            return update
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
            'proposal': g.current_proposal
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
    if proposal:
        dumped_proposal = proposal_schema.dump(proposal)
        return dumped_proposal["contributions"]
    else:
        return {"message": "No proposal matching id"}, 404


@blueprint.route("/<proposal_id>/contributions/<contribution_id>", methods=["GET"])
@endpoint.api()
def get_proposal_contribution(proposal_id, contribution_id):
    proposal = Proposal.query.filter_by(id=proposal_id).first()
    if proposal:
        contribution = ProposalContribution.query.filter_by(tx_id=contribution_id).first()
        if contribution:
            return proposal_contribution_schema.dump(contribution)
        else:
            return {"message": "No contribution matching id"}
    else:
        return {"message": "No proposal matching id"}, 404


@blueprint.route("/<proposal_id>/contributions", methods=["POST"])
@requires_sm
@endpoint.api(
    parameter('txId', type=str, required=True),
    parameter('fromAddress', type=str, required=True),
    parameter('amount', type=str, required=True)
)
def post_proposal_contribution(proposal_id, tx_id, from_address, amount):
    proposal = Proposal.query.filter_by(id=proposal_id).first()
    if proposal:
        contribution = ProposalContribution(
            tx_id=tx_id,
            proposal_id=proposal_id,
            user_id=g.current_user.id,
            from_address=from_address,
            amount=amount
        )
        db.session.add(contribution)
        db.session.commit()
        dumped_contribution = proposal_contribution_schema.dump(contribution)
        return dumped_contribution, 201
    return {"message": "No proposal matching id"}, 404
