from dateutil.parser import parse
from functools import wraps

from flask import Blueprint, g
from flask_yoloapi import endpoint, parameter
from sqlalchemy.exc import IntegrityError

from grant.comment.models import Comment, comment_schema
from grant.milestone.models import Milestone
from grant.user.models import User, SocialMedia, Avatar
from grant.utils.auth import requires_sm, requires_team_member_auth
from grant.utils.exceptions import ValidationException
from .models import Proposal, proposals_schema, proposal_schema, ProposalUpdate, proposal_update_schema, proposal_team, db

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
    if proposal:
        dumped_proposal = proposal_schema.dump(proposal)
        return {
            "proposalId": proposal_id,
            "totalComments": len(dumped_proposal["comments"]),
            "comments": dumped_proposal["comments"]
        }
    else:
        return {"message": "No proposal matching id"}, 404


@blueprint.route("/<proposal_id>/comments", methods=["POST"])
@requires_sm
@endpoint.api(
    parameter('content', type=str, required=True)
)
def post_proposal_comments(proposal_id, user_id, content):
    proposal = Proposal.query.filter_by(id=proposal_id).first()
    if proposal:
        comment = Comment(
            proposal_id=proposal_id,
            user_id=g.current_user.id,
            content=content
        )
        db.session.add(comment)
        db.session.commit()
        dumped_comment = comment_schema.dump(comment)
        return dumped_comment, 201
    else:
        return {"message": "No proposal matching id"}, 404


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
@requires_sm
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
