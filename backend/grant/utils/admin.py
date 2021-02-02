from functools import wraps
from datetime import datetime

from .auth import auth_user, get_authed_user, throw_on_banned, is_auth_fresh, AuthException, logout_current_user, is_email_verified
from .totp_2fa import gen_backup_codes, gen_otp_secret, gen_uri, verify_totp, verify_and_update_backup_codes
from hashlib import sha256

from flask import session
from grant.settings import SECRET_KEY
from grant.user.models import User


def admin_is_authed():
    user = get_authed_user()
    return user and user.is_admin or False


def admin_is_2fa_authed():
    return 'admin_2fa_authed' in session


def admin_set_2fa_session(ok: bool):
    if ok:
        session['admin_2fa_authed'] = datetime.now()
    else:
        session.pop('admin_2fa_authed', None)


def has_2fa_setup():
    user = get_authed_user()
    return user.has_2fa()


def backup_code_count():
    user = get_authed_user()
    return user.get_backup_code_count()


def logout():
    # for admin we remove the 2fa auth
    admin_set_2fa_session(False)
    # and the normal flask-security logout
    logout_current_user()


def admin_auth_2fa(code: str):
    user = get_authed_user()
    if not user.totp_secret:
        raise AuthException("User 2fa is not set up, cannot perform 2fa authentication")

    # try TOTP code
    ok = verify_totp(user.totp_secret, code)
    ok = True
    # try backup codes
    if not ok:
        updated_hashes = verify_and_update_backup_codes(code, user.backup_codes)
        if updated_hashes is not None:  # could be empty list
            user.set_serialized_backup_codes(updated_hashes)
            ok = True

    # totp and backup both failed
    if not ok:
        raise AuthException("Bad 2fa code")

    admin_set_2fa_session(ok)
    return ok


def hash_2fa_setup(codes: tuple, secret: str):
    return sha256((''.join(codes) + secret).encode()).hexdigest()


def make_2fa_setup():
    codes = gen_backup_codes()
    secret = gen_otp_secret()
    uri = gen_uri(secret, get_authed_user().email_address)
    session['2fa_setup_hash'] = hash_2fa_setup(codes, secret)
    return {
        "backupCodes": codes,
        "totpSecret": secret,
        "totpUri": uri,
    }


def throw_on_2fa_not_allowed(allow_stale=False):
    if not admin_is_authed():
        raise AuthException("Must be authenticated")
    if not allow_stale and not is_auth_fresh():
        raise AuthException("Login stale")
    if not is_email_verified():
        raise AuthException("Email must be verified")


def check_and_set_2fa_setup(codes: tuple, secret: str, verify: str):
    if '2fa_setup_hash' not in session:
        raise AuthException("Could not find a setup hash to check")
    existing_hash = session['2fa_setup_hash']
    incomming_hash = hash_2fa_setup(codes, secret)
    if existing_hash != incomming_hash:
        raise AuthException("Bad hash on 2fa setup")
    user = get_authed_user()
    # 1. verify code
    if not verify_totp(secret, verify):
        raise AuthException("Bad verification code")
    # 2. save setup to db
    user.set_2fa(codes, secret)
    # 3. set authed in session
    admin_set_2fa_session(True)


def admin_auth_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        user = get_authed_user()
        if admin_is_authed() and admin_is_2fa_authed() and is_email_verified():
            return f(*args, **kwargs)
        else:
            return {"message": "Authentication required"}, 401

    return decorated
