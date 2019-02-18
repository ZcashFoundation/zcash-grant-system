# -*- coding: utf-8 -*-
"""The app module, containing the app factory function."""
import sentry_sdk
from animal_case import animalify
from flask import Flask, Response, jsonify
from flask_cors import CORS
from flask_security import SQLAlchemyUserDatastore
from flask_sslify import SSLify
from sentry_sdk.integrations.flask import FlaskIntegration

from grant import commands, proposal, user, comment, milestone, admin, email, blockchain, task, rfp
from grant.extensions import bcrypt, migrate, db, ma, security
from grant.settings import SENTRY_RELEASE, ENV
from grant.utils.auth import AuthException, handle_auth_error, get_authed_user


class JSONResponse(Response):
    @classmethod
    def force_type(cls, rv, environ=None):
        if isinstance(rv, dict) or isinstance(rv, list) or isinstance(rv, tuple):
            rv = jsonify(animalify(rv))
        elif rv is None:
            rv = jsonify(data=None), 204

        return super(JSONResponse, cls).force_type(rv, environ)


def create_app(config_objects=["grant.settings"]):
    app = Flask(__name__.split(".")[0])
    app.response_class = JSONResponse

    # Return validation errors as JSON

    @app.errorhandler(422)
    @app.errorhandler(400)
    def handle_error(err):
        headers = err.data.get("headers", None)
        messages = err.data.get("messages", ["Invalid request."])
        if headers:
            return jsonify({"errors": messages}), err.code, headers
        else:
            return jsonify({"errors": messages}), err.code

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

    # handle all AuthExceptions thusly
    # NOTE: testing mode does not honor this handler, and instead returns the generic 500 response
    app.register_error_handler(AuthException, handle_auth_error)

    @app.after_request
    def grantio_authed(response):
        response.headers["X-Grantio-Authed"] = 'yes' if get_authed_user() else 'no'
        return response

    return app


def register_extensions(app):
    """Register Flask extensions."""
    bcrypt.init_app(app)
    db.init_app(app)
    migrate.init_app(app, db)
    ma.init_app(app)
    user_datastore = SQLAlchemyUserDatastore(db, user.models.User, user.models.Role)
    security.init_app(app, datastore=user_datastore, register_blueprint=False)

    # supports_credentials for session cookies
    CORS(app, supports_credentials=True, expose_headers='X-Grantio-Authed')
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
    app.register_blueprint(blockchain.views.blueprint)
    app.register_blueprint(task.views.blueprint)
    app.register_blueprint(rfp.views.blueprint)


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
    app.cli.add_command(proposal.commands.create_proposals)
    app.cli.add_command(user.commands.delete_user)
    app.cli.add_command(admin.commands.gen_admin_auth)
    app.cli.add_command(task.commands.create_task)
