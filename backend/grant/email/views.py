from flask import Blueprint
from flask_yoloapi import endpoint, parameter

from .models import EmailVerification, EmailRecovery, db


blueprint = Blueprint("email", __name__, url_prefix="/api/v1/email")


@blueprint.route("/<code>/verify", methods=["POST"])
@endpoint.api()
def verify_email(code):
    ev = EmailVerification.query.filter_by(code=code).first()
    if ev:
        ev.has_verified = True
        db.session.commit()
        return {"message": "Email verified"}, 200
    else:
        return {"message": "Invalid email code"}, 400


@blueprint.route("/<code>/unsubscribe", methods=["POST"])
@endpoint.api()
def unsubscribe_email(code):
    ev = EmailVerification.query.filter_by(code=code).first()
    if ev:
        return {"message": "Not yet implemented"}, 500
    else:
        return {"message": "Invalid email code"}, 400


@blueprint.route("/<code>/recover", methods=["POST"])
@endpoint.api(
    parameter('password', type=str, required=True),
)
def recover_email(code, password):
    er = EmailRecovery.query.filter_by(code=code).first()
    if er:
        if er.is_expired():
            return {"message": "Reset code expired"}, 401
        er.user.set_password(password)
        db.session.delete(er)
        db.session.commit()
        return None, 200

    return {"message": "Invalid reset code"}, 400
