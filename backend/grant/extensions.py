# -*- coding: utf-8 -*-
"""Extensions module. Each extension is initialized in the app factory located in app.py."""
from flask_bcrypt import Bcrypt
from flask_marshmallow import Marshmallow
from flask_migrate import Migrate
from flask_sqlalchemy import SQLAlchemy
from flask_sendgrid import SendGrid

bcrypt = Bcrypt()
db = SQLAlchemy()
migrate = Migrate()
ma = Marshmallow()
mail = SendGrid()
