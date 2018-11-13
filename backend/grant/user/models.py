from sqlalchemy import func
from grant.comment.models import Comment
from grant.email.models import EmailVerification
from grant.extensions import ma, db
from grant.utils.misc import make_url
from grant.email.send import send_email


class SocialMedia(db.Model):
    __tablename__ = "social_media"

    id = db.Column(db.Integer(), primary_key=True)
    # TODO replace this with something proper
    social_media_link = db.Column(db.String(255), unique=False, nullable=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)

    def __init__(self, social_media_link, user_id):
        self.social_media_link = social_media_link
        self.user_id = user_id


class Avatar(db.Model):
    __tablename__ = "avatar"

    id = db.Column(db.Integer(), primary_key=True)
    image_url = db.Column(db.String(255), unique=False, nullable=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    user = db.relationship("User", back_populates="avatar")

    def __init__(self, image_url, user_id):
        self.image_url = image_url
        self.user_id = user_id


class User(db.Model):
    __tablename__ = "user"

    id = db.Column(db.Integer(), primary_key=True)
    email_address = db.Column(db.String(255), unique=True, nullable=True)
    account_address = db.Column(db.String(255), unique=True, nullable=True)
    display_name = db.Column(db.String(255), unique=False, nullable=True)
    title = db.Column(db.String(255), unique=False, nullable=True)

    social_medias = db.relationship(SocialMedia, backref="user", lazy=True)
    comments = db.relationship(Comment, backref="user", lazy=True)
    avatar = db.relationship(Avatar, uselist=False, back_populates="user")
    email_verification = db.relationship(EmailVerification, uselist=False, back_populates="user", lazy=True)

    # TODO - add create and validate methods

    def __init__(self, email_address=None, account_address=None, display_name=None, title=None):
        if not email_address and not account_address:
            raise ValueError("Either email_address or account_address is required to create a user")

        self.email_address = email_address
        self.account_address = account_address
        self.display_name = display_name
        self.title = title

    @staticmethod
    def create(email_address=None, account_address=None, display_name=None, title=None, _send_email=True):
        user = User(
            account_address=account_address,
            email_address=email_address,
            display_name=display_name,
            title=title
        )
        db.session.add(user)
        db.session.flush()

        # Setup & send email verification
        ev = EmailVerification(user_id=user.id)
        db.session.add(ev)
        db.session.commit()

        if send_email:
            send_email(user.email_address, 'signup', {
                'display_name': user.display_name,
                'confirm_url': make_url(f'/email/verify?code={ev.code}')
            })

        return user

    @staticmethod
    def get_by_identifier(email_address: str = None, account_address: str = None):
        if not email_address and not account_address:
            raise ValueError("Either email_address or account_address is required to get a user")

        return User.query.filter(
            (func.lower(User.account_address) == func.lower(account_address)) |
            (func.lower(User.email_address) == func.lower(email_address))
        ).first()

class UserSchema(ma.Schema):
    class Meta:
        model = User
        # Fields to expose
        fields = (
            "account_address",
            "title",
            "email_address",
            "social_medias",
            "avatar",
            "display_name",
            "userid"

        )

    social_medias = ma.Nested("SocialMediaSchema", many=True)
    avatar = ma.Nested("AvatarSchema")
    userid = ma.Method("get_userid")

    def get_userid(self, obj):
        return obj.id


user_schema = UserSchema()
users_schema = UserSchema(many=True)


class SocialMediaSchema(ma.Schema):
    class Meta:
        model = SocialMedia
        # Fields to expose
        fields = ("social_media_link",)


social_media_schema = SocialMediaSchema()
social_media_schemas = SocialMediaSchema(many=True)


class AvatarSchema(ma.Schema):
    class Meta:
        model = SocialMedia
        # Fields to expose
        fields = ("image_url",)


avatar_schema = AvatarSchema()
avatar_schemas = AvatarSchema(many=True)
