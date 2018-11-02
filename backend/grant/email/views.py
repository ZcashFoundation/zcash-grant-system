from flask import Blueprint, jsonify
from animal_case import animalify
from flask_yoloapi import endpoint, parameter

from .models import EmailVerification, db


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
def unsubscribe_email():
    ev = EmailVerification.query.filter_by(code=code).first()
    if ev:    
        return {"message": "Not yet implemented"}, 500
    else:
        return {"message": "Invalid email code"}, 400
