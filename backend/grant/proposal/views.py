from datetime import datetime

from flask import Blueprint, request
from sqlalchemy.exc import IntegrityError

from grant import JSONResponse
from grant.author.models import Author
from grant.comment.models import Comment, comment_schema
from grant.milestone.models import Milestone
from .models import Proposal, proposals_schema, proposal_schema, db

blueprint = Blueprint("proposal", __name__, url_prefix="/api/v1/proposals")


def __adjust_dumped_proposal(proposal):
    cur_author = proposal["author"]
    proposal["team"] = [cur_author]
    return proposal


@blueprint.route("/<proposal_id>", methods=["GET"])
def get_proposal(proposal_id):
    proposal = Proposal.query.filter_by(proposal_id=proposal_id).first()
    if proposal:
        dumped_proposal = proposal_schema.dump(proposal)
        return JSONResponse(__adjust_dumped_proposal(dumped_proposal))
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
        author_id = incoming["authorId"]
        content = incoming["content"]
        author = Author.query.filter_by(id=author_id).first()

        if author:
            comment = Comment(
                proposal_id=proposal_id,
                author_id=author_id,
                content=content
            )

            db.session.add(comment)
            db.session.commit()
            dumped_comment = comment_schema.dump(comment)
            return JSONResponse(dumped_comment, _statusCode=201)

        else:
            return JSONResponse(message="No author matching id", _statusCode=404)
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
    results = map(__adjust_dumped_proposal, proposals_schema.dump(proposals))
    return JSONResponse(results)


@blueprint.route("/", methods=["POST"])
def make_proposal():
    from grant.author.models import Author

    incoming = request.get_json()

    account_address = incoming["accountAddress"]
    proposal_id = incoming["crowdFundContractAddress"]
    content = incoming["content"]
    title = incoming["title"]
    milestones = incoming["milestones"]
    category = incoming["category"]

    author = Author.query.filter_by(account_address=account_address).first()

    if not author:
        author = Author(account_address=account_address)
        db.session.add(author)
        db.session.commit()

    proposal = Proposal.create(
        stage="FUNDING_REQUIRED",
        proposal_id=proposal_id,
        content=content,
        title=title,
        author_id=author.id,
        category=category
    )

    db.session.add(proposal)
    db.session.commit()

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
