# -*- coding: utf-8 -*-
"""Create an application instance."""
from grant.app import create_app
from grant.blockchain.bootstrap import send_bootstrap_data

app = create_app()

@app.before_first_request
def bootstrap_watcher():
  send_bootstrap_data()
