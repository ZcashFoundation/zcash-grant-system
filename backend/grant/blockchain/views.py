from flask import Blueprint
from flask_yoloapi import endpoint
from grant.blockchain.bootstrap import send_bootstrap_data
from grant.utils.auth import internal_webhook

blueprint = Blueprint("blockchain", __name__, url_prefix="/api/v1/blockchain")


@blueprint.route("/bootstrap", methods=["GET"])
@internal_webhook
@endpoint.api()
def get_bootstrap_info():
    print('Bootstrap data requested from blockchain watcher microservice...')
    send_bootstrap_data()
    return True
