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
from grant.user.models import User, admin_users_schema, admin_user_schema
from grant.rfp.models import RFP, admin_rfp_schema, admin_rfps_schema
from grant.utils.admin import admin_auth_required, admin_is_authed, admin_login, admin_logout
from grant.utils.enums import ProposalStatus
from grant.utils import pagination
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
    proposal_no_arbiter_count = db.session.query(func.count(Proposal.id)) \
        .filter(Proposal.status == ProposalStatus.LIVE) \
        .filter(Proposal.arbiter_id == None) \
        .scalar()
    return {
        "userCount": user_count,
        "proposalCount": proposal_count,
        "proposalPendingCount": proposal_pending_count,
        "proposalNoArbiterCount": proposal_no_arbiter_count,
    }


# USERS


@blueprint.route('/users/<user_id>', methods=['DELETE'])
@endpoint.api()
@admin_auth_required
def delete_user(user_id):
    user = User.query.filter(User.id == user_id).first()
    if not user:
        return {"message": "No user matching that id"}, 404

    db.session.delete(user)
    db.session.commit()
    return None, 200


@blueprint.route("/users", methods=["GET"])
@endpoint.api()
@admin_auth_required
def get_users():
    users = User.query.all()
    result = admin_users_schema.dump(users)
    return result


@blueprint.route('/users/<id>', methods=['GET'])
@endpoint.api()
@admin_auth_required
def get_user(id):
    user_db = User.query.filter(User.id == id).first()
    if user_db:
        user = admin_user_schema.dump(user_db)
        user_proposals = Proposal.query.filter(Proposal.team.any(id=user['userid'])).all()
        user['proposals'] = proposals_schema.dump(user_proposals)
        user_comments = Comment.get_by_user(user_db)
        user['comments'] = user_comments_schema.dump(user_comments)
        contributions = ProposalContribution.get_by_userid(user_db.id)
        contributions_dump = user_proposal_contributions_schema.dump(contributions)
        user["contributions"] = contributions_dump
        return user
    return {"message": f"Could not find user with id {id}"}, 404


# ARBITERS


@blueprint.route("/arbiters", methods=["GET"])
@endpoint.api(
    parameter('search', type=str, required=False),
)
@admin_auth_required
def get_arbiters(search):
    results = []
    error = None
    if len(search) < 3:
        error = 'search query must be at least 3 characters long'
    else:
        users = User.query.filter(
            User.email_address.ilike(f'%{search}%') | User.display_name.ilike(f'%{search}%')
        ).all()
        results = admin_users_schema.dump(users)

    return {
        'results': results,
        'search': search,
        'error': error
    }


@blueprint.route('/arbiters', methods=['PUT'])
@endpoint.api(
    parameter('proposalId', type=int, required=True),
    parameter('userId', type=int, required=True)
)
@admin_auth_required
def set_arbiter(proposal_id, user_id):
    proposal = Proposal.query.filter(Proposal.id == proposal_id).first()
    if not proposal:
        return {"message": "Proposal not found"}, 404

    user = User.query.filter(User.id == user_id).first()
    if not user:
        return {"message": "User not found"}, 404

    proposal.arbiter_id = user.id
    db.session.add(proposal)
    db.session.commit()
    return {
        'proposal': proposal_schema.dump(proposal),
        'user': admin_user_schema.dump(user)
    }, 200


# PROPOSALS


@blueprint.route("/proposals", methods=["GET"])
@endpoint.api(
    parameter('page', type=int, required=False),
    parameter('filters', type=list, required=False),
    parameter('search', type=str, required=False),
    parameter('sort', type=str, required=False)
)
@admin_auth_required
def get_proposals(page, filters, search, sort):
    filters_workaround = request.args.getlist('filters[]')
    page = pagination.proposal(
        schema=proposals_schema,
        query=Proposal.query,
        page=page,
        filters=filters_workaround,
        search=search,
        sort=sort,
    )
    return page


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
