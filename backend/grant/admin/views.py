from functools import wraps
from flask import Blueprint, g, session, request
from flask_yoloapi import endpoint, parameter
from hashlib import sha256
from uuid import uuid4
from flask_cors import CORS, cross_origin
from sqlalchemy import func, or_

from grant.extensions import db
from grant.user.models import User, users_schema, user_schema
from grant.proposal.models import (
    Proposal,
    ProposalContribution,
    proposals_schema,
    proposal_schema,
    user_proposal_contributions_schema,
    PENDING
)
from grant.comment.models import Comment, comments_schema, user_comments_schema
from grant.email.send import generate_email
from .example_emails import example_email_args


blueprint = Blueprint('admin', __name__, url_prefix='/api/v1/admin')


admin_auth = {
    "username": "admin",
    "password": "79994491a17ec1d817fb0330303ea88880835961fbab1d12329f5d720602fbb3",
    "salt": "ad01deb1ccba4d0e8b831ed3d1e82c10"
}


def auth_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        if 'username' in session:
            return f(*args, **kwargs)
        else:
            return {"message": "Authentication required"}, 401

    return decorated


@blueprint.route("/checklogin", methods=["GET"])
@endpoint.api()
def loggedin():
    if 'username' in session:
        return {"isLoggedIn": True}
    if 'username' not in session:
        return {"isLoggedIn": False}


@blueprint.route("/login", methods=["POST"])
@endpoint.api(
    parameter('username', type=str, required=False),
    parameter('password', type=str, required=False),
)
def login(username, password):
    pass_salt = ('%s%s' % (password, admin_auth['salt'])).encode('utf-8')
    pass_hash = sha256(pass_salt).hexdigest()
    if username == admin_auth['username'] and pass_hash == admin_auth['password']:
        session['username'] = username
        return {"isLoggedIn": True}
    else:
        return {"message": "Username or password incorrect."}, 401


@blueprint.route("/logout", methods=["GET"])
@endpoint.api()
def logout():
    del session['username']
    return {"isLoggedIn": False}


@blueprint.route("/stats", methods=["GET"])
@endpoint.api()
@auth_required
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


# USERS


@blueprint.route('/users/<id>', methods=['DELETE'])
@endpoint.api()
@auth_required
def delete_user(id):
    return {"message": "Not implemented."}, 400


@blueprint.route("/users", methods=["GET"])
@endpoint.api()
@auth_required
def get_users():
    users = User.query.all()
    result = users_schema.dump(users)
    return result


@blueprint.route('/users/<id>', methods=['GET'])
@endpoint.api()
@auth_required
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
@auth_required
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
@auth_required
def get_proposal(id):
    proposal = Proposal.query.filter(Proposal.id == id).first()
    if proposal:
        return proposal_schema.dump(proposal)
    return {"message": "Could not find proposal with id %s" % id}, 404


@blueprint.route('/proposals/<id>', methods=['DELETE'])
@endpoint.api()
@auth_required
def delete_proposal(id):
    return {"message": "Not implemented."}, 400


@blueprint.route('/proposals/<id>/approve', methods=['PUT'])
@endpoint.api(
    parameter('isApprove', type=bool, required=True),
    parameter('rejectReason', type=str, required=False)
)
@auth_required
def approve_proposal(id, is_approve, reject_reason=None):
    proposal = Proposal.query.filter_by(id=id).first()
    if proposal:
        proposal.approve_pending(is_approve, reject_reason)
        db.session.commit()
        return proposal_schema.dump(proposal)

    return {"message": "Not implemented."}, 400


# EMAIL


@blueprint.route('/email/example/<type>', methods=['GET'])
@cross_origin(supports_credentials=True)
@endpoint.api()
@auth_required
def get_email_example(type):
    email = generate_email(type, example_email_args.get(type))
    if email['info'].get('subscription'):
        # Unserializable, so remove
        email['info'].pop('subscription', None)
    return email
