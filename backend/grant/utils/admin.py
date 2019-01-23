from functools import wraps
from hashlib import sha256

from flask import session
from grant.settings import SECRET_KEY, ADMIN_PASS_HASH

admin_auth = {
    "username": "admin",
    "password": ADMIN_PASS_HASH,
    "salt": SECRET_KEY
}


def generate_admin_password_hash(password, salt=None):
    if not salt:
        salt = admin_auth['salt']  # do this in body to catch testing patch
    pass_salt = ('%s%s' % (password, salt)).encode('utf-8')
    pass_hash = sha256(pass_salt).hexdigest()
    return pass_hash


def admin_login(username, password):
    pass_hash = generate_admin_password_hash(password)
    if username == admin_auth['username'] and pass_hash == admin_auth['password']:
        session['admin_username'] = username
        return True
    return False


def admin_logout():
    del session['admin_username']
    return True


def admin_is_authed():
    return 'admin_username' in session


def admin_auth_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        if admin_is_authed():
            return f(*args, **kwargs)
        else:
            return {"message": "Authentication required"}, 401

    return decorated
