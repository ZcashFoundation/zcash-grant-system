from flask import Blueprint, g
from flask_yoloapi import endpoint, parameter

blueprint = Blueprint("rfp", __name__, url_prefix="/api/v1/rfp")


# @blueprint.route("/", methods=["GET"])
# @endpoint.api(
#     parameter('stage', type=str, required=False)
# )
# def get_rfps(stage):


# @blueprint.route("/<rfp_id>", methods=["GET"])
# @endpoint.api()
# def get_rfp(rfp_id):
