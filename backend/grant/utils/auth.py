from functools import wraps

import sentry_sdk
from flask import request, g, jsonify
from flask_security.core import current_user
from grant.proposal.models import Proposal
from grant.settings import BLOCKCHAIN_API_SECRET
from grant.user.models import User


class AuthException(Exception):
    pass


# use with: @blueprint.errorhandler(AuthException)
def handle_auth_error(e):
    return jsonify(message=str(e)), 403


def get_authed_user():
    return current_user if current_user.is_authenticated else None


def throw_on_banned(user):
    if user.banned:
        raise AuthException("You are banned")


def requires_auth(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        if not current_user.is_authenticated:
            return jsonify(message="Authentication is required to access this resource"), 401
        throw_on_banned(current_user)
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


def requires_email_verified_auth(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        if not g.current_user.email_verification.has_verified:
            return jsonify(message="Please confirm your email."), 403
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

        if g.current_user not in proposal.team:
            return jsonify(message="You are not authorized to modify this proposal"), 403

        g.current_proposal = proposal
        return f(*args, **kwargs)

    return requires_email_verified_auth(decorated)


def requires_arbiter_auth(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        proposal_id = kwargs["proposal_id"]
        if not proposal_id:
            return jsonify(message="Decorator requires_arbiter_auth requires path variable <proposal_id>"), 500

        proposal = Proposal.query.filter_by(id=proposal_id).first()
        if not proposal:
            return jsonify(message="No proposal exists with id {}".format(proposal_id)), 404

        if g.current_user != proposal.arbiter.user:
            return jsonify(message="You are not arbiter this proposal"), 403

        g.current_proposal = proposal
        return f(*args, **kwargs)

    return requires_email_verified_auth(decorated)


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
