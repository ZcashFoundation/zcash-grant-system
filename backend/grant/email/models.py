from grant.extensions import ma, db
from grant.utils.misc import gen_random_code

class EmailVerification(db.Model):
    __tablename__ = "email_verification"

    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), primary_key=True)
    code = db.Column(db.String(255), unique=True, nullable=False)
    has_verified = db.Column(db.Boolean)

    user = db.relationship("User", back_populates="email_verification")

    def __init__(self, user_id: int):
        self.user_id = user_id
        self.code = gen_random_code(32)
        self.has_verified = False

class EmailVerificationSchema(ma.Schema):
    class Meta:
        model = EmailVerification
        # Fields to expose
        fields = (
            "user_id",
            "code",
            "has_verified"
        )

email_verification_schema = EmailVerificationSchema()