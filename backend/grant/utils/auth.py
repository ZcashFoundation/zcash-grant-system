from functools import wraps
from datetime import datetime, timedelta

import sentry_sdk
from flask import request, g, jsonify, session, current_app
from flask_security.core import current_user
from flask_security.utils import logout_user
from grant.settings import BLOCKCHAIN_API_SECRET


class AuthException(Exception):
    pass


# use with app.register_error_handler (app.py)
def handle_auth_error(e):
    return jsonify(message=str(e)), 403


def get_authed_user():
    return current_user if current_user.is_authenticated and not current_user.banned else None


def throw_on_banned(user):
    if user.banned:
        raise AuthException("You are banned")


def is_auth_fresh(minutes: int=20):
    if 'last_login_time' in session:
        last = session['last_login_time']
        now = datetime.now()
        return now - last < timedelta(minutes=minutes)


def is_email_verified():
    user = get_authed_user()
    return user.email_verification.has_verified


def auth_user(email, password):
    from grant.user.models import User

    existing_user = User.get_by_email(email)
    if not existing_user:
        raise AuthException("No user exists with that email")
    if not existing_user.check_password(password):
        raise AuthException("Invalid password")
    throw_on_banned(existing_user)
    existing_user.login()
    session['last_login_time'] = datetime.now()
    return existing_user


def logout_current_user():
    logout_user()


def refresh_auth(password):
    user = get_authed_user()
    if not user:
        raise AuthException("Not logged in")
    if not user.check_password(password):
        raise AuthException("Bad password")
    session['last_login_time'] = datetime.now()
    return True


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
        from grant.user.models import User

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
        from grant.proposal.models import Proposal

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
        from grant.proposal.models import Proposal

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
            current_app.logger.warn('Internal webhook missing "Authorization" header')
            return jsonify(message="Invalid 'Authorization' header"), 403
        if BLOCKCHAIN_API_SECRET not in secret:
            current_app.logger.warn(f'Internal webhook provided invalid "Authorization" header: {secret}')
            return jsonify(message="Invalid 'Authorization' header"), 403
        return f(*args, **kwargs)

    return decorated
