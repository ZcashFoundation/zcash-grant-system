# -*- coding: utf-8 -*-
"""Application configuration.

Most configuration is set via environment variables.

For local development, use a .env file to set
environment variables.
"""
import subprocess
from environs import Env


def git_revision_short_hash():
    try:
        return subprocess.check_output(['git', 'rev-parse', '--short', 'HEAD'])
    except subprocess.CalledProcessError:
        return 0


env = Env()
env.read_env()

ENV = env.str("FLASK_ENV", default="production")
DEBUG = ENV == "development"
SITE_URL = env.str('SITE_URL', default='https://grant.io')
AUTH_URL = env.str('AUTH_URL', default='https://eip-712.herokuapp.com')
CROWD_FUND_FACTORY_URL = env.str('CROWD_FUND_FACTORY_URL', default=None)
CROWD_FUND_URL = env.str('CROWD_FUND_URL', default=None)
SQLALCHEMY_DATABASE_URI = env.str("DATABASE_URL")
QUEUES = ["default"]
SECRET_KEY = env.str("SECRET_KEY")
BCRYPT_LOG_ROUNDS = env.int("BCRYPT_LOG_ROUNDS", default=13)
DEBUG_TB_ENABLED = DEBUG
DEBUG_TB_INTERCEPT_REDIRECTS = False
CACHE_TYPE = "simple"  # Can be "memcached", "redis", etc.
SQLALCHEMY_TRACK_MODIFICATIONS = False
SENDGRID_API_KEY = env.str("SENDGRID_API_KEY", default="")
SENDGRID_DEFAULT_FROM = "noreply@grant.io"
ETHEREUM_PROVIDER = "http"
ETHEREUM_ENDPOINT_URI = env.str("ETHEREUM_ENDPOINT_URI")
SENTRY_DSN = env.str("SENTRY_DSN", default=None)
SENTRY_RELEASE = env.str("SENTRY_RELEASE", default=git_revision_short_hash())
MAX_CONTENT_LENGTH = 5 * 1024 * 1024  # 5MB (limits file uploads, raises RequestEntityTooLarge)
AWS_ACCESS_KEY_ID = env.str("AWS_ACCESS_KEY_ID")
AWS_SECRET_ACCESS_KEY = env.str("AWS_SECRET_ACCESS_KEY")
AWS_DEFAULT_REGION = env.str("AWS_DEFAULT_REGION")
S3_BUCKET = env.str("S3_BUCKET")
