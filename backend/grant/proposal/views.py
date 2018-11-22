from datetime import datetime

from flask import Blueprint, g
from flask_yoloapi import endpoint, parameter
from sqlalchemy.exc import IntegrityError

from grant.comment.models import Comment, comment_schema
from grant.milestone.models import Milestone
from grant.user.models import User, SocialMedia, Avatar
from grant.utils.auth import requires_sm, requires_team_member_auth
from grant.web3.proposal import read_proposal, validate_contribution_tx
from .models import(
    Proposal,
    proposals_schema,
    proposal_schema,
    ProposalUpdate,
    proposal_update_schema,
    ProposalContribution,
    proposal_contribution_schema,
    db
)

blueprint = Blueprint("proposal", __name__, url_prefix="/api/v1/proposals")


@blueprint.route("/<proposal_id>", methods=["GET"])
@endpoint.api()
def get_proposal(proposal_id):
    proposal = Proposal.query.filter_by(id=proposal_id).first()
    if proposal:
        dumped_proposal = proposal_schema.dump(proposal)
        proposal_contract = read_proposal(dumped_proposal['proposal_address'])
        if not proposal_contract:
            return {"message": "Proposal retired"}, 404
        dumped_proposal['crowd_fund'] = proposal_contract
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
            Proposal.query.filter_by(stage=stage)
            .order_by(Proposal.date_created.desc())
            .all()
        )
    else:
        proposals = Proposal.query.order_by(Proposal.date_created.desc()).all()
    dumped_proposals = proposals_schema.dump(proposals)
    for p in dumped_proposals:
        proposal_contract = read_proposal(p['proposal_address'])
        p['crowd_fund'] = proposal_contract
    filtered_proposals = list(filter(lambda p: p['crowd_fund'] is not None, dumped_proposals))
    return filtered_proposals


@blueprint.route("/", methods=["POST"])
@requires_sm
@endpoint.api(
    parameter('crowdFundContractAddress', type=str, required=True),
    parameter('content', type=str, required=True),
    parameter('title', type=str, required=True),
    parameter('milestones', type=list, required=True),
    parameter('category', type=str, required=True),
    parameter('team', type=list, required=True)
)
def make_proposal(crowd_fund_contract_address, content, title, milestones, category, team):
    existing_proposal = Proposal.query.filter_by(proposal_address=crowd_fund_contract_address).first()
    if existing_proposal:
        return {"message": "Oops! Something went wrong."}, 409

    proposal = Proposal.create(
        stage="FUNDING_REQUIRED",
        proposal_address=crowd_fund_contract_address,
        content=content,
        title=title,
        category=category
    )

    db.session.add(proposal)

    if not len(team) > 0:
        return {"message": "Team must be at least 1"}, 400

    for team_member in team:
        account_address = team_member.get("accountAddress")
        display_name = team_member.get("displayName")
        email_address = team_member.get("emailAddress")
        title = team_member.get("title")
        user = User.query.filter(
            (User.account_address == account_address) | (User.email_address == email_address)).first()
        if not user:
            user = User(
                account_address=account_address,
                email_address=email_address,
                display_name=display_name,
                title=title
            )
            db.session.add(user)
            db.session.flush()

            avatar_data = team_member.get("avatar")
            if avatar_data:
                avatar = Avatar(image_url=avatar_data.get('link'), user_id=user.id)
                db.session.add(avatar)

            social_medias = team_member.get("socialMedias")
            if social_medias:
                for social_media in social_medias:
                    sm = SocialMedia(social_media_link=social_media.get("link"), user_id=user.id)
                    db.session.add(sm)

        proposal.team.append(user)

    for each_milestone in milestones:
        m = Milestone(
            title=each_milestone["title"],
            content=each_milestone["description"],
            date_estimated=datetime.strptime(each_milestone["date"], '%B %Y'),
            payout_percent=str(each_milestone["payoutPercent"]),
            immediate_payout=each_milestone["immediatePayout"],
            proposal_id=proposal.id
        )

        db.session.add(m)

    try:
        db.session.commit()
    except IntegrityError as e:
        print(e)
        return {"message": "Oops! Something went wrong."}, 409

    results = proposal_schema.dump(proposal)
    return results, 201


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
