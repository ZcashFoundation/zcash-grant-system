import json

from flask import Blueprint, jsonify

blueprint = Blueprint('dev-contracts', __name__, url_prefix='/dev-contracts')


@blueprint.route("/CrowdFundFactory.json", methods=["GET"])
def factory():
    with open("../contract/build/contracts/CrowdFundFactory.json", "r") as read_file:
        crowd_fund_factory_json = json.load(read_file)
    return jsonify(crowd_fund_factory_json)


@blueprint.route("/CrowdFund.json", methods=["GET"])
def crowd_find():
    with open("../contract/build/contracts/CrowdFund.json", "r") as read_file:
        crowd_fund_json = json.load(read_file)
    return jsonify(crowd_fund_json)
