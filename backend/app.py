# -*- coding: utf-8 -*-
"""Create an application instance."""
from flask import request
from grant.app import create_app
from grant.blockchain.bootstrap import send_bootstrap_data

app = create_app()


@app.before_first_request
def bootstrap_watcher():
    # Don't call bootstrap if the first request to us was bootstrap
    if 'blockchain/bootstrap' in request.path:
        return

    try:
        send_bootstrap_data()
    except:
        print('Failed to send bootstrap data, watcher must be offline')
