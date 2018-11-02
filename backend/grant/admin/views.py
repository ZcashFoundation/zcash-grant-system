from functools import wraps
from flask import Blueprint, g, jsonify, session
from flask_yoloapi import endpoint, parameter
from hashlib import sha256
from uuid import uuid4
from flask_cors import CORS, cross_origin
from sqlalchemy import func

from grant.extensions import db
from grant.user.models import User, users_schema
from grant.proposal.models import Proposal, proposals_schema
from grant.comment.models import Comment, comments_schema


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
@cross_origin(supports_credentials=True)
@endpoint.api()
def loggedin():
    if 'username' in session:
        return {"isLoggedIn": True}
    if 'username' not in session:
        return {"isLoggedIn": False}


@blueprint.route("/login", methods=["POST"])
@cross_origin(supports_credentials=True)
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
@cross_origin(supports_credentials=True)
@endpoint.api()
def logout():
    del session['username']
    return {"isLoggedIn": False}


@blueprint.route("/stats", methods=["GET"])
@cross_origin(supports_credentials=True)
@endpoint.api()
@auth_required
def stats():
    user_count = db.session.query(func.count(User.id)).scalar()
    proposal_count = db.session.query(func.count(Proposal.id)).scalar()
    return {
        "userCount": user_count,
        "proposalCount": proposal_count
    }


@blueprint.route('/users/<id>', methods=['DELETE'])
@cross_origin(supports_credentials=True)
@endpoint.api()
@auth_required
def delete_user(id):
    return {"message": "Not implemented."}, 400


@blueprint.route("/users", methods=["GET"])
@cross_origin(supports_credentials=True)
@endpoint.api()
@auth_required
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
@cross_origin(supports_credentials=True)
@endpoint.api()
@auth_required
def get_proposals():
    proposals = Proposal.query.order_by(Proposal.date_created.desc()).all()
    dumped_proposals = proposals_schema.dump(proposals)
    return dumped_proposals


@blueprint.route('/proposals/<id>', methods=['DELETE'])
@cross_origin(supports_credentials=True)
@endpoint.api()
@auth_required
def delete_proposal(id):
    return {"message": "Not implemented."}, 400
