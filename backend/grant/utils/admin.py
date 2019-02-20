from functools import wraps
from .auth import get_authed_user, throw_on_banned
from hashlib import sha256

from flask import session
from grant.settings import SECRET_KEY
from grant.user.models import User


def admin_login(email, password):
    existing_user = User.get_by_email(email)
    if not existing_user:
        return False
    if not existing_user.check_password(password):
        return False
    throw_on_banned(existing_user)
    existing_user.login()
    return True


def admin_logout():
    User.logout_current_user()
    return True


def admin_is_authed():
    user = get_authed_user()
    return user and user.is_admin


def admin_is_2fa_authed():
    return 'admin_2fa_authed' in session


def admin_auth_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        user = get_authed_user()
        throw_on_banned(user)
        if admin_is_authed() and admin_is_2fa_authed():
            return f(*args, **kwargs)
        else:
            return {"message": "Authentication required"}, 401

    return decorated
