# -*- coding: utf-8 -*-
"""The app module, containing the app factory function."""
import logging
import traceback

import sentry_sdk
from animal_case import animalify
from flask import Flask, Response, jsonify, request, current_app, g
from flask_cors import CORS
from flask_security import SQLAlchemyUserDatastore
from flask_sslify import SSLify
from sentry_sdk.integrations.flask import FlaskIntegration
from sentry_sdk.integrations.logging import LoggingIntegration
from grant import (
    commands,
    proposal,
    user,
    ccr,
    comment,
    milestone,
    admin,
    email,
    blockchain,
    task,
    rfp,
    e2e,
    home
)
from grant.extensions import bcrypt, migrate, db, ma, security, limiter
from grant.settings import SENTRY_RELEASE, ENV, E2E_TESTING, DEBUG, CORS_DOMAINS
from grant.utils.auth import AuthException, handle_auth_error, get_authed_user
from grant.utils.exceptions import ValidationException


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

    @app.after_request
    def send_emails(response):
        if 'email_sender' in g:
            # starting email sender
            g.email_sender.start()
        return response

    # Return validation errors
    @app.errorhandler(ValidationException)
    def handle_validation_error(err):
        return jsonify({"message": str(err)}), 400

    @app.errorhandler(422)
    @app.errorhandler(400)
    def handle_error(err):
        headers = err.data.get("headers", None)
        messages = err.data.get("messages", "Invalid request.")
        error_message = "Something was wrong with your request"
        if type(messages) == dict:
            if 'json' in messages:
                error_message = messages['json'][0]
            else:
                current_app.logger.warn(
                    f"Unexpected error occurred: {messages}"
                )
        if headers:
            return jsonify({"message": error_message}), err.code, headers
        else:
            return jsonify({"message": error_message}), err.code

    @app.errorhandler(404)
    def handle_notfound_error(err):
        error_message = "Unknown route '{} {}'".format(request.method, request.path)
        return jsonify({"message": error_message}), 404

    @app.errorhandler(429)
    def handle_limit_error(err):
        app.logger.warn(f'Rate limited request to {request.method} {request.path} from ip {request.remote_addr}')
        return jsonify({"message": "You’ve done that too many times, please wait and try again later"}), 429

    @app.errorhandler(Exception)
    def handle_exception(err):
        sentry_sdk.capture_exception(err)
        app.logger.debug(traceback.format_exc())
        app.logger.debug("Uncaught exception at {} {}, see above for traceback".format(request.method, request.path))
        return jsonify({"message": "Something went wrong"}), 500

    for conf in config_objects:
        app.config.from_object(conf)
    app.url_map.strict_slashes = False
    register_extensions(app)
    register_blueprints(app)
    register_shellcontext(app)
    register_commands(app)

    if not (app.config.get("TESTING") or E2E_TESTING):
        sentry_logging = LoggingIntegration(
            level=logging.INFO,
            event_level=logging.ERROR
        )
        sentry_sdk.init(
            environment=ENV,
            release=SENTRY_RELEASE,
            integrations=[FlaskIntegration(), sentry_logging]
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
    limiter.init_app(app)
    user_datastore = SQLAlchemyUserDatastore(db, user.models.User, user.models.Role)
    security.init_app(app, datastore=user_datastore, register_blueprint=False)

    # supports_credentials for session cookies, on cookie domains (if set)
    origins = CORS_DOMAINS.split(',')
    CORS(app, supports_credentials=True, expose_headers='X-Grantio-Authed', origins=origins)
    SSLify(app)
    return None


def register_blueprints(app):
    """Register Flask blueprints."""
    app.register_blueprint(ccr.views.blueprint)
    app.register_blueprint(comment.views.blueprint)
    app.register_blueprint(proposal.views.blueprint)
    app.register_blueprint(user.views.blueprint)
    app.register_blueprint(milestone.views.blueprint)
    app.register_blueprint(admin.views.blueprint)
    app.register_blueprint(email.views.blueprint)
    app.register_blueprint(blockchain.views.blueprint)
    app.register_blueprint(task.views.blueprint)
    app.register_blueprint(rfp.views.blueprint)
    app.register_blueprint(home.views.blueprint)
    if E2E_TESTING and DEBUG:
        print('Warning: e2e end-points are open, this should only be the case for development or testing')
        app.register_blueprint(e2e.views.blueprint)


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
    app.cli.add_command(commands.reset_db_chain_data)
    app.cli.add_command(proposal.commands.create_proposal)
    app.cli.add_command(proposal.commands.create_proposals)
    app.cli.add_command(proposal.commands.retire_v1_proposals)
    app.cli.add_command(user.commands.set_admin)
    app.cli.add_command(user.commands.mangle_users)
    app.cli.add_command(task.commands.create_task)
