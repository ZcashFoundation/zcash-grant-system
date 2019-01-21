from flask import Blueprint, g
from flask_yoloapi import endpoint

from grant.utils.auth import internal_webhook
from grant.blockchain.bootstrap import send_bootstrap_data

blueprint = Blueprint("blockchain", __name__, url_prefix="/api/v1/blockchain")

@blueprint.route("/bootstrap", methods=["GET"])
@internal_webhook
@endpoint.api()
def get_bootstrap_info():
  print('Bootstrap data requested from blockchain watcher microservice...')
  send_bootstrap_data()
  return True
