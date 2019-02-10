from flask import Blueprint
from flask_yoloapi import endpoint

from .models import EmailVerification, db
from grant.utils.enums import ProposalArbiterStatus

blueprint = Blueprint("email", __name__, url_prefix="/api/v1/email")


@blueprint.route("/<code>/verify", methods=["POST"])
@endpoint.api()
def verify_email(code):
    ev = EmailVerification.query.filter_by(code=code).first()
    if ev:
        ev.has_verified = True
        db.session.commit()
        return {"message": "Email verified"}, 200

    return {"message": "Invalid email code"}, 400


@blueprint.route("/<code>/unsubscribe", methods=["POST"])
@endpoint.api()
def unsubscribe_email(code):
    ev = EmailVerification.query.filter_by(code=code).first()
    if ev:
        ev.user.settings.unsubscribe_emails()
        db.session.commit()
        return {"message": "Unsubscribed from all emails"}, 200

    return {"message": "Invalid email code"}, 400


@blueprint.route("/<code>/arbiter/<proposal_id>", methods=["POST"])
@endpoint.api()
def accept_arbiter(code, proposal_id):
    ev = EmailVerification.query.filter_by(code=code).first()
    if ev:
        # 1. check that the user has a nomination for this proposal
        for ap in ev.user.arbiter_proposals:
            if ap.proposal_id == int(proposal_id):
                ap.accept_nomination(ev.user.id)
                return {"message": "You are now the Arbiter"}, 200
            return {"message": "No nomination for this code"}, 404

    return {"message": "Invalid email code"}, 400
