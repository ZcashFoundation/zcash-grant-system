import ast
import json
from functools import wraps

import requests
from flask import request, g, jsonify
from itsdangerous import SignatureExpired, BadSignature
from itsdangerous import TimedJSONWebSignatureSerializer as Serializer

from grant.settings import SECRET_KEY, AUTH_URL
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


def requires_auth(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization', None)
        if token:
            string_token = token.encode('ascii', 'ignore')
            user = verify_token(string_token)
            if user:
                g.current_user = user
                return f(*args, **kwargs)

        return jsonify(message="Authentication is required to access this resource"), 401

    return decorated


def requires_sm(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        typed_data = request.headers.get('RawTypedData', None)
        signature = request.headers.get('MsgSignature', None)

        if typed_data and signature:
            loaded_typed_data = ast.literal_eval(typed_data)
            url = AUTH_URL + "/message/recover"
            payload = json.dumps({"sig": signature, "data": loaded_typed_data})
            headers = {'content-type': 'application/json'}
            response = requests.request("POST", url, data=payload, headers=headers)
            json_response = response.json()
            recovered_address = json_response.get('recoveredAddress')

            if not recovered_address:
                return jsonify(message="No user exists with address: {}".format(recovered_address)), 401

            user = User.get_by_email_or_account_address(account_address=recovered_address)
            if not user:
                return jsonify(message="No user exists with address: {}".format(recovered_address)), 401

            g.current_user = user
            return f(*args, **kwargs)

        return jsonify(message="Authentication is required to access this resource"), 401

    return decorated
