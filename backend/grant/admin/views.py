from functools import wraps
from flask import Blueprint, request
from flask_yoloapi import endpoint, parameter
from hashlib import sha256
from uuid import uuid4
from sqlalchemy import func, or_

from grant.extensions import db
from grant.utils.admin import admin_auth_required, admin_is_authed, admin_login, admin_logout
from grant.user.models import User, users_schema
from grant.proposal.models import Proposal, proposals_schema, proposal_schema, PENDING
from grant.comment.models import Comment, comments_schema
from grant.email.send import generate_email
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
        .filter(Proposal.status == PENDING) \
        .scalar()
    return {
        "userCount": user_count,
        "proposalCount": proposal_count,
        "proposalPendingCount": proposal_pending_count,
    }


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
    for user in result:
        user_proposals = Proposal.query.filter(Proposal.team.any(id=user['userid'])).all()
        user['proposals'] = proposals_schema.dump(user_proposals)
        user_comments = Comment.query.filter(Comment.user_id == user['userid']).all()
        user['comments'] = comments_schema.dump(user_comments)
    return result


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
    return {"message": "Could not find proposal with id %s" % id}, 404


@blueprint.route('/proposals/<id>', methods=['DELETE'])
@endpoint.api()
@admin_auth_required
def delete_proposal(id):
    return {"message": "Not implemented."}, 400


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


@blueprint.route('/email/example/<type>', methods=['GET'])
@endpoint.api()
@admin_auth_required
def get_email_example(type):
    email = generate_email(type, example_email_args.get(type))
    if email['info'].get('subscription'):
        # Unserializable, so remove
        email['info'].pop('subscription', None)
    return email
