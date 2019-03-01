from flask import Blueprint
from sqlalchemy import or_

from grant.utils.enums import RFPStatus
from .models import RFP, rfp_schema, rfps_schema

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
