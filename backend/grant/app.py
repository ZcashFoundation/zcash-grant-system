# -*- coding: utf-8 -*-
"""The app module, containing the app factory function."""
from flask import Flask
from flask_cors import CORS
from flask_sslify import SSLify
from sentry_sdk.integrations.flask import FlaskIntegration
import sentry_sdk

from grant import commands, proposal, user, comment, milestone, admin, email, web3 as web3module
from grant.extensions import bcrypt, migrate, db, ma, mail, web3
from grant.settings import SENTRY_RELEASE, ENV


def create_app(config_objects=["grant.settings"]):
    app = Flask(__name__.split(".")[0])
    for conf in config_objects:
        app.config.from_object(conf)
    app.url_map.strict_slashes = False
    register_extensions(app)
    register_blueprints(app)
    register_shellcontext(app)
    register_commands(app)
    if not app.config.get("TESTING"):
        sentry_sdk.init(
            environment=ENV,
            release=SENTRY_RELEASE,
            integrations=[FlaskIntegration()]
        )
    return app


def register_extensions(app):
    """Register Flask extensions."""
    bcrypt.init_app(app)
    db.init_app(app)
    migrate.init_app(app, db)
    ma.init_app(app)
    mail.init_app(app)
    web3.init_app(app)

    CORS(app)
    SSLify(app)
    return None


def register_blueprints(app):
    """Register Flask blueprints."""
    app.register_blueprint(comment.views.blueprint)
    app.register_blueprint(proposal.views.blueprint)
    app.register_blueprint(user.views.blueprint)
    app.register_blueprint(milestone.views.blueprint)
    app.register_blueprint(admin.views.blueprint)
    app.register_blueprint(email.views.blueprint)
    # Only add these routes locally
    if ENV == 'development':
        app.register_blueprint(web3module.dev_contracts.blueprint)


def register_shellcontext(app):
    """Register shell context objects."""

    def shell_context():
        """Shell context objects."""
        return {"db": db}

    app.shell_context_processor(shell_context)


def register_commands(app):
    """Register Click commands."""
    app.cli.add_command(commands.test)
    app.cli.add_command(commands.lint)
    app.cli.add_command(commands.clean)
    app.cli.add_command(commands.urls)

    app.cli.add_command(proposal.commands.create_proposal)
    app.cli.add_command(user.commands.delete_user)
