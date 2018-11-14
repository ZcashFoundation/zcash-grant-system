# -*- coding: utf-8 -*-
"""Application configuration.

Most configuration is set via environment variables.

For local development, use a .env file to set
environment variables.
"""
from environs import Env

env = Env()
env.read_env()

ENV = env.str("FLASK_ENV", default="production")
DEBUG = ENV == "development"
SITE_URL = env.str('SITE_URL', default='https://grant.io')
AUTH_URL = env.str('AUTH_URL', default='https://eip-712.herokuapp.com')
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
