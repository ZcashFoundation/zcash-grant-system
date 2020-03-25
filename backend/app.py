# -*- coding: utf-8 -*-
"""Create an application instance."""
from grant.patches import patch_werkzeug_set_samesite
patch_werkzeug_set_samesite()
from grant.app import create_app
app = create_app()
