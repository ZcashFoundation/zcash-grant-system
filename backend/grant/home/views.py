from datetime import datetime

from flask import Blueprint
from sqlalchemy import or_

from grant.proposal.models import Proposal, proposals_schema
from grant.rfp.models import RFP, rfps_schema
from grant.utils.enums import ProposalStatus, ProposalStage, RFPStatus

blueprint = Blueprint("home", __name__, url_prefix="/api/v1/home")


@blueprint.route("/latest", methods=["GET"])
def get_home_content():
    latest_proposals = (
        Proposal.query.filter_by(status=ProposalStatus.LIVE)
        .filter(Proposal.stage != ProposalStage.CANCELED)
        .filter(Proposal.stage != ProposalStage.FAILED)
        .order_by(Proposal.date_created.desc())
        .limit(3)
        .all()
    )
    latest_rfps = (
        RFP.query.filter_by(status=RFPStatus.LIVE)
        .filter(or_(RFP.date_closes == None, RFP.date_closes > datetime.now()))
        .order_by(RFP.date_opened)
        .limit(3)
        .all()
    )

    return {
        "latest_proposals": proposals_schema.dump(latest_proposals),
        "latest_rfps": rfps_schema.dump(latest_rfps),
    }
