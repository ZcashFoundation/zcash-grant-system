from flask import Blueprint, request
from flask import Blueprint, request
from flask_yoloapi import endpoint, parameter
from grant.comment.models import Comment, user_comments_schema
from grant.email.send import generate_email
from grant.extensions import db
from grant.proposal.models import (
    Proposal,
    ProposalContribution,
    proposals_schema,
    proposal_schema,
    user_proposal_contributions_schema,
)
from grant.user.models import User, users_schema, user_schema
from grant.rfp.models import RFP, admin_rfp_schema, admin_rfps_schema
from grant.utils.admin import admin_auth_required, admin_is_authed, admin_login, admin_logout
from grant.utils.enums import ProposalStatus
from sqlalchemy import func, or_

from .example_emails import example_email_args

blueprint = Blueprint('admin', __name__, url_prefix='/api/v1/admin')


@blueprint.route("/checklogin", methods=["GET"])
@endpoint.api()
def loggedin():
    return {"isLoggedIn": admin_is_authed()}


@blueprint.route("/login", methods=["POST"])
@endpoint.api(
    parameter('username', type=str, required=False),
    parameter('password', type=str, required=False),
)
def login(username, password):
    if admin_login(username, password):
        return {"isLoggedIn": True}
    else:
        return {"message": "Username or password incorrect."}, 401


@blueprint.route("/logout", methods=["GET"])
@endpoint.api()
def logout():
    admin_logout()
    return {"isLoggedIn": False}


@blueprint.route("/stats", methods=["GET"])
@endpoint.api()
@admin_auth_required
def stats():
    user_count = db.session.query(func.count(User.id)).scalar()
    proposal_count = db.session.query(func.count(Proposal.id)).scalar()
    proposal_pending_count = db.session.query(func.count(Proposal.id)) \
        .filter(Proposal.status == ProposalStatus.PENDING) \
        .scalar()
    return {
        "userCount": user_count,
        "proposalCount": proposal_count,
        "proposalPendingCount": proposal_pending_count,
    }


# USERS


@blueprint.route('/users/<id>', methods=['DELETE'])
@endpoint.api()
@admin_auth_required
def delete_user(id):
    return {"message": "Not implemented."}, 400


@blueprint.route("/users", methods=["GET"])
@endpoint.api()
@admin_auth_required
def get_users():
    users = User.query.all()
    result = users_schema.dump(users)
    return result


@blueprint.route('/users/<id>', methods=['GET'])
@endpoint.api()
@admin_auth_required
def get_user(id):
    user_db = User.query.filter(User.id == id).first()
    if user_db:
        user = user_schema.dump(user_db)
        user_proposals = Proposal.query.filter(Proposal.team.any(id=user['userid'])).all()
        user['proposals'] = proposals_schema.dump(user_proposals)
        user_comments = Comment.get_by_user(user_db)
        user['comments'] = user_comments_schema.dump(user_comments)
        contributions = ProposalContribution.get_by_userid(user_db.id)
        contributions_dump = user_proposal_contributions_schema.dump(contributions)
        user["contributions"] = contributions_dump
        return user
    return {"message": f"Could not find user with id {id}"}, 404


# PROPOSALS


@blueprint.route("/proposals", methods=["GET"])
@endpoint.api()
@admin_auth_required
def get_proposals():
    # endpoint.api doesn't seem to handle GET query array input
    status_filters = request.args.getlist('statusFilters[]')
    or_filter = or_(Proposal.status == v for v in status_filters)
    proposals = Proposal.query.filter(or_filter) \
        .order_by(Proposal.date_created.desc()) \
        .all()
    # TODO: return partial data for list
    dumped_proposals = proposals_schema.dump(proposals)
    return dumped_proposals


@blueprint.route('/proposals/<id>', methods=['GET'])
@endpoint.api()
@admin_auth_required
def get_proposal(id):
    proposal = Proposal.query.filter(Proposal.id == id).first()
    if proposal:
        return proposal_schema.dump(proposal)
    return {"message": f"Could not find proposal with id {id}"}, 404


@blueprint.route('/proposals/<id>', methods=['DELETE'])
@endpoint.api()
@admin_auth_required
def delete_proposal(id):
    return {"message": "Not implemented."}, 400


@blueprint.route('/proposals/<id>', methods=['PUT'])
@endpoint.api(
    parameter('contributionMatching', type=float, required=False, default=None)
)
@admin_auth_required
def update_proposal(id, contribution_matching):
    proposal = Proposal.query.filter(Proposal.id == id).first()
    if proposal:
        if contribution_matching is not None:
            # enforce 1 or 0 for now
            if contribution_matching == 0.0 or contribution_matching == 1.0:
                proposal.contribution_matching = contribution_matching
                # TODO: trigger check if funding target reached OR make sure
                # job schedule checks for funding completion include matching funds
            else:
                return {"message": f"Bad value for contributionMatching: {contribution_matching}"}, 400

        db.session.commit()
        return proposal_schema.dump(proposal)

    return {"message": f"Could not find proposal with id {id}"}, 404


@blueprint.route('/proposals/<id>/approve', methods=['PUT'])
@endpoint.api(
    parameter('isApprove', type=bool, required=True),
    parameter('rejectReason', type=str, required=False)
)
@admin_auth_required
def approve_proposal(id, is_approve, reject_reason=None):
    proposal = Proposal.query.filter_by(id=id).first()
    if proposal:
        proposal.approve_pending(is_approve, reject_reason)
        db.session.commit()
        return proposal_schema.dump(proposal)

    return {"message": "Not implemented."}, 400


# EMAIL


@blueprint.route('/email/example/<type>', methods=['GET'])
@endpoint.api()
@admin_auth_required
def get_email_example(type):
    email = generate_email(type, example_email_args.get(type))
    if email['info'].get('subscription'):
        # Unserializable, so remove
        email['info'].pop('subscription', None)
    return email


# Requests for Proposal


@blueprint.route('/rfps', methods=['GET'])
@endpoint.api()
@admin_auth_required
def get_rfps():
    rfps = RFP.query.all()
    return admin_rfps_schema.dump(rfps)


@blueprint.route('/rfps', methods=['POST'])
@endpoint.api(
    parameter('title', type=str),
    parameter('brief', type=str),
    parameter('content', type=str),
    parameter('category', type=str),
)
@admin_auth_required
def create_rfp(title, brief, content, category):
    rfp = RFP(
        title=title,
        brief=brief,
        content=content,
        category=category,
    )
    db.session.add(rfp)
    db.session.commit()
    return admin_rfp_schema.dump(rfp), 201


@blueprint.route('/rfps/<rfp_id>', methods=['GET'])
@endpoint.api()
@admin_auth_required
def get_rfp(rfp_id):
    rfp = RFP.query.filter(RFP.id == rfp_id).first()
    if not rfp:
        return {"message": "No RFP matching that id"}, 404

    return admin_rfp_schema.dump(rfp)


@blueprint.route('/rfps/<rfp_id>', methods=['PUT'])
@endpoint.api(
    parameter('title', type=str),
    parameter('brief', type=str),
    parameter('content', type=str),
    parameter('category', type=str),
    parameter('status', type=str),
)
@admin_auth_required
def update_rfp(rfp_id, title, brief, content, category, status):
    rfp = RFP.query.filter(RFP.id == rfp_id).first()
    if not rfp:
        return {"message": "No RFP matching that id"}, 404

    rfp.title = title
    rfp.brief = brief
    rfp.content = content
    rfp.category = category
    rfp.status = status

    db.session.add(rfp)
    db.session.commit()
    return admin_rfp_schema.dump(rfp)


@blueprint.route('/rfps/<rfp_id>', methods=['DELETE'])
@endpoint.api()
@admin_auth_required
def delete_rfp(rfp_id):
    rfp = RFP.query.filter(RFP.id == rfp_id).first()
    if not rfp:
        return {"message": "No RFP matching that id"}, 404

    db.session.delete(rfp)
    db.session.commit()
    return None, 200
