from datetime import datetime

from flask import Blueprint, request
from sqlalchemy.exc import IntegrityError

from grant import JSONResponse
from grant.comment.models import Comment, comment_schema
from grant.milestone.models import Milestone
from grant.user.models import User, SocialMedia, Avatar
from .models import Proposal, proposals_schema, proposal_schema, db

blueprint = Blueprint("proposal", __name__, url_prefix="/api/v1/proposals")


@blueprint.route("/<proposal_id>", methods=["GET"])
def get_proposal(proposal_id):
    proposal = Proposal.query.filter_by(proposal_id=proposal_id).first()
    if proposal:
        dumped_proposal = proposal_schema.dump(proposal)
        return JSONResponse(dumped_proposal)
    else:
        return JSONResponse(message="No proposal matching id", _statusCode=404)


@blueprint.route("/<proposal_id>/comments", methods=["GET"])
def get_proposal_comments(proposal_id):
    proposal = Proposal.query.filter_by(proposal_id=proposal_id).first()
    if proposal:
        dumped_proposal = proposal_schema.dump(proposal)
        return JSONResponse(
            proposal_id=proposal_id,
            total_comments=len(dumped_proposal["comments"]),
            comments=dumped_proposal["comments"]
        )
    else:
        return JSONResponse(message="No proposal matching id", _statusCode=404)


@blueprint.route("/<proposal_id>/comments", methods=["POST"])
def post_proposal_comments(proposal_id):
    proposal = Proposal.query.filter_by(proposal_id=proposal_id).first()
    if proposal:
        incoming = request.get_json()
        user_id = incoming["userId"]
        content = incoming["content"]
        user = User.query.filter_by(id=user_id).first()

        if user:
            comment = Comment(
                proposal_id=proposal_id,
                user_id=user_id,
                content=content
            )
            db.session.add(comment)
            db.session.commit()
            dumped_comment = comment_schema.dump(comment)
            return JSONResponse(dumped_comment, _statusCode=201)

        else:
            return JSONResponse(message="No user matching id", _statusCode=404)
    else:
        return JSONResponse(message="No proposal matching id", _statusCode=404)


@blueprint.route("/", methods=["GET"])
def get_proposals():
    stage = request.args.get("stage")
    if stage:
        proposals = (
            Proposal.query.filter_by(stage=stage)
                .order_by(Proposal.date_created.desc())
                .all()
        )
    else:
        proposals = Proposal.query.order_by(Proposal.date_created.desc()).all()
    dumped_proposals = proposals_schema.dump(proposals)
    return JSONResponse(dumped_proposals)


@blueprint.route("/", methods=["POST"])
def make_proposal():
    from grant.user.models import User

    incoming = request.get_json()

    proposal_id = incoming["crowdFundContractAddress"]
    content = incoming["content"]
    title = incoming["title"]
    milestones = incoming["milestones"]
    category = incoming["category"]

    proposal = Proposal.create(
        stage="FUNDING_REQUIRED",
        proposal_id=proposal_id,
        content=content,
        title=title,
        category=category
    )

    db.session.add(proposal)

    team = incoming["team"]
    if not len(team) > 0:
        return JSONResponse(message="Team must be at least 1", _statusCode=400)

    for team_member in team:
        account_address = team_member.get("accountAddress")
        display_name = team_member.get("displayName")
        email_address = team_member.get("emailAddress")
        title = team_member.get("title")
        user = User.query.filter((User.account_address == account_address) | (User.email_address == email_address)).first()
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
        return JSONResponse(message="Proposal with that hash already exists", _statusCode=409)

    results = proposal_schema.dump(proposal)
    return JSONResponse(results, _statusCode=201)
