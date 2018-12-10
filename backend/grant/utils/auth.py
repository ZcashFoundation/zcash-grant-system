import ast
import json
from functools import wraps

import requests
from flask import request, g, jsonify
from itsdangerous import SignatureExpired, BadSignature
from itsdangerous import TimedJSONWebSignatureSerializer as Serializer
import sentry_sdk

from grant.settings import SECRET_KEY
from ..proposal.models import Proposal
from ..user.models import User

TWO_WEEKS = 1209600


def generate_token(user, expiration=TWO_WEEKS):
    s = Serializer(SECRET_KEY, expires_in=expiration)
    token = s.dumps({
        'id': user.id,
        'email': user.email,
    }).decode('utf-8')
    return token


def verify_token(token):
    s = Serializer(SECRET_KEY)
    try:
        data = s.loads(token)
    except (BadSignature, SignatureExpired):
        return None
    return data


# Custom exception for bad auth
class BadSignatureException(Exception):
    pass


def verify_signed_auth(signature, typed_data):
    loaded_typed_data = ast.literal_eval(typed_data)
    if loaded_typed_data['domain']['name'] != 'Grant.io':
        raise BadSignatureException("Signature is not for Grant.io")
    # TODO - implement new auth scheme
    url = 'AUTH_URL' + "/message/recover"
    payload = json.dumps({"sig": signature, "data": loaded_typed_data})
    headers = {'content-type': 'application/json'}
    response = requests.request("POST", url, data=payload, headers=headers)
    json_response = response.json()
    recovered_address = json_response.get('recoveredAddress')
    if not recovered_address:
        raise BadSignatureException("Authorization signature is invalid")

    return recovered_address


# Decorator that requires you to have EIP-712 message signature headers for auth
def requires_sm(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        # TODO - implemnent new auth scheme
        return jsonify(message="TODO - utils/auth.py - implement new auth scheme"), 401

        # signature = request.headers.get('MsgSignature', None)
        # typed_data = request.headers.get('RawTypedData', None)

        # if typed_data and signature:
        #     try:
        #         auth_address = verify_signed_auth(signature, typed_data)
        #     except BadSignatureException:
        #         return jsonify(message="Invalid auth message signature"), 401

        #     user = User.get_by_identifier(account_address=auth_address)
        #     if not user:
        #         return jsonify(message="No user exists with address: {}".format(auth_address)), 401

        #     g.current_user = user
        #     with sentry_sdk.configure_scope() as scope:
        #         scope.user = {
        #             "id": user.id,
        #         }
        #     return f(*args, **kwargs)

        # return jsonify(message="Authentication is required to access this resource"), 401

    return decorated

# Decorator that requires you to be the user you're interacting with
def requires_same_user_auth(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        user_identity = kwargs["user_identity"]
        if not user_identity:
            return jsonify(message="Decorator requires_same_user_auth requires path variable <user_identity>"), 500

        user = User.get_by_identifier(account_address=user_identity, email_address=user_identity)
        if not user:
            return jsonify(message="Could not find user with identity {}".format(user_identity)), 403

        if user.id != g.current_user.id:
            return jsonify(message="You are not authorized to modify this user"), 403

        return f(*args, **kwargs)

    return requires_sm(decorated)


# Decorator that requires you to be a team member of a proposal to access
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

    return requires_sm(decorated)
