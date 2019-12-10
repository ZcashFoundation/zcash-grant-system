from flask import Blueprint, g
from sqlalchemy import or_

from grant.utils.enums import RFPStatus
from grant.utils.auth import requires_auth
from grant.parser import body
from .models import RFP, rfp_schema, rfps_schema, db
from marshmallow import fields

blueprint = Blueprint("rfp", __name__, url_prefix="/api/v1/rfps")


@blueprint.route("/", methods=["GET"])
def get_rfps():
    rfps = RFP.query \
        .filter(or_(
        RFP.status == RFPStatus.LIVE,
        RFP.status == RFPStatus.CLOSED,
    )) \
        .order_by(RFP.date_created.desc()) \
        .all()
    return rfps_schema.dump(rfps)


@blueprint.route("/<rfp_id>", methods=["GET"])
def get_rfp(rfp_id):
    rfp = RFP.query.filter_by(id=rfp_id).first()
    if not rfp or rfp.status == RFPStatus.DRAFT:
        return {"message": "No RFP with that ID"}, 404
    return rfp_schema.dump(rfp)


@blueprint.route("/<rfp_id>/like", methods=["PUT"])
@requires_auth
@body({"isLiked": fields.Bool(required=True)})
def like_rfp(rfp_id, is_liked):
    user = g.current_user
    # Make sure rfp exists
    rfp = RFP.query.filter_by(id=rfp_id).first()
    if not rfp:
        return {"message": "No RFP matching id"}, 404
    if not rfp.status == RFPStatus.LIVE:
        return {"message": "RFP is not live"}, 404

    rfp.like(user, is_liked)
    db.session.commit()
    return {"message": "ok"}, 200
