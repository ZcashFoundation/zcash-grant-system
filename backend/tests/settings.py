"""Settings module for test app."""
ENV = 'development'
TESTING = True
SQLALCHEMY_DATABASE_URI = 'sqlite:////tmp/test.db'
SECRET_KEY = 'not-so-secret-in-tests'
BCRYPT_LOG_ROUNDS = 4  # For faster tests; needs at least 4 to avoid "ValueError: Invalid rounds"
DEBUG_TB_ENABLED = False
CACHE_TYPE = 'simple'  # Can be "memcached", "redis", etc.
SQLALCHEMY_TRACK_MODIFICATIONS = False
WTF_CSRF_ENABLED = False  # Allows form testing

AWS_ACCESS_KEY_ID = "your-user-access-key"
AWS_SECRET_ACCESS_KEY = "your-user-secret-access-key"
AWS_DEFAULT_REGION = "us-west-2"
S3_BUCKET = "your-bucket-name"
