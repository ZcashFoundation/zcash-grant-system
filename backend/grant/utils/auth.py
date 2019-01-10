import ast
import json
from functools import wraps

import requests
from flask_security.core import current_user
from flask import request, g, jsonify
import sentry_sdk

from grant.settings import SECRET_KEY, BLOCKCHAIN_API_SECRET
from ..proposal.models import Proposal
from ..user.models import User


def get_authed_user():
    return current_user if current_user.is_authenticated else None


def requires_auth(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        if not current_user.is_authenticated:
            return jsonify(message="Authentication is required to access this resource"), 401
        g.current_user = current_user
        with sentry_sdk.configure_scope() as scope:
            scope.user = {
                "id": current_user.id,
            }
        return f(*args, **kwargs)
    return decorated


def requires_same_user_auth(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        user_id = kwargs["user_id"]
        if not user_id:
            return jsonify(message="Decorator requires_same_user_auth requires path variable <user_id>"), 500

        user = User.get_by_id(user_id=user_id)
        if not user:
            return jsonify(message="Could not find user with id {}".format(user_id)), 403

        if user.id != g.current_user.id:
            return jsonify(message="You are not authorized to modify this user"), 403

        return f(*args, **kwargs)

    return requires_auth(decorated)


def requires_team_member_auth(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        proposal_id = kwargs["proposal_id"]
        if not proposal_id:
            return jsonify(message="Decorator requires_team_member_auth requires path variable <proposal_id>"), 500

        proposal = Proposal.query.filter_by(id=proposal_id).first()
        if not proposal:
            return jsonify(message="No proposal exists with id {}".format(proposal_id)), 404

        if not g.current_user in proposal.team:
            return jsonify(message="You are not authorized to modify this proposal"), 403

        g.current_proposal = proposal
        return f(*args, **kwargs)

    return requires_auth(decorated)

def internal_webhook(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        secret = request.headers.get('authorization')
        if not secret:
            print('Internal webhook missing "Authorization" header')
            return jsonify(message="Invalid 'Authorization' header"), 403
        if BLOCKCHAIN_API_SECRET not in secret:
            print(f'Internal webhook provided invalid "Authorization" header: {secret}')
            return jsonify(message="Invalid 'Authorization' header"), 403
        return f(*args, **kwargs)
    return decorated
