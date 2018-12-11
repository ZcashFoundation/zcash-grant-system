from sqlalchemy import func
from sqlalchemy.ext.hybrid import hybrid_property
from flask_security import UserMixin, RoleMixin
from flask_security.utils import hash_password, verify_and_update_password, login_user, logout_user
from werkzeug.security import generate_password_hash, check_password_hash
from grant.comment.models import Comment
from grant.email.models import EmailVerification
from grant.extensions import ma, db, security
from grant.utils.misc import make_url
from grant.utils.upload import extract_avatar_filename, construct_avatar_url
from grant.utils.social import get_social_info_from_url
from grant.email.send import send_email


class RolesUsers(db.Model):
    __tablename__ = 'roles_users'
    id = db.Column(db.Integer(), primary_key=True)
    user_id = db.Column('user_id', db.Integer(), db.ForeignKey('user.id'))
    role_id = db.Column('role_id', db.Integer(), db.ForeignKey('role.id'))


class Role(db.Model, RoleMixin):
    __tablename__ = 'role'
    id = db.Column(db.Integer(), primary_key=True)
    name = db.Column(db.String(80), unique=True)
    description = db.Column(db.String(255))


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
    _image_url = db.Column("image_url", db.String(255), unique=False, nullable=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    user = db.relationship("User", back_populates="avatar")

    @hybrid_property
    def image_url(self):
        return construct_avatar_url(self._image_url)

    @image_url.setter
    def image_url(self, image_url):
        self._image_url = extract_avatar_filename(image_url)

    def __init__(self, image_url, user_id):
        self.image_url = image_url
        self.user_id = user_id


class User(db.Model, UserMixin):
    __tablename__ = "user"

    id = db.Column(db.Integer(), primary_key=True)
    email_address = db.Column(db.String(255), unique=True, nullable=False)
    password = db.Column(db.String(255), unique=False, nullable=False)
    display_name = db.Column(db.String(255), unique=False, nullable=True)
    title = db.Column(db.String(255), unique=False, nullable=True)
    active = db.Column(db.Boolean, default=True)

    social_medias = db.relationship(SocialMedia, backref="user", lazy=True, cascade="all, delete-orphan")
    comments = db.relationship(Comment, backref="user", lazy=True)
    avatar = db.relationship(Avatar, uselist=False, back_populates="user", cascade="all, delete-orphan")
    email_verification = db.relationship(EmailVerification, uselist=False,
                                         back_populates="user", lazy=True, cascade="all, delete-orphan")
    roles = db.relationship('Role', secondary='roles_users',
                            backref=db.backref('users', lazy='dynamic'))

    # TODO - add create and validate methods

    def __init__(
        self,
        email_address,
        password,
        active,
        roles,
        display_name=None,
        title=None,
    ):
        self.email_address = email_address
        self.display_name = display_name
        self.title = title
        self.password = password

    @staticmethod
    def create(email_address=None, password=None, display_name=None, title=None, _send_email=True):
        user = security.datastore.create_user(
            email_address=email_address,
            password=hash_password(password),
            display_name=display_name,
            title=title
        )
        security.datastore.commit()

        # Setup & send email verification
        ev = EmailVerification(user_id=user.id)
        db.session.add(ev)
        db.session.commit()

        if _send_email:
            send_email(user.email_address, 'signup', {
                'display_name': user.display_name,
                'confirm_url': make_url(f'/email/verify?code={ev.code}')
            })

        return user

    @staticmethod
    def get_by_id(user_id: int):
        return security.datastore.get_user(user_id)

    @staticmethod
    def get_by_email(email_address: str):
        return security.datastore.get_user(email_address)

    def check_password(self, password: str):
        return verify_and_update_password(password, self)

    def login(self):
        login_user(self)
        security.datastore.commit()


class UserSchema(ma.Schema):
    class Meta:
        model = User
        # Fields to expose
        fields = (
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
        fields = (
            "url",
            "service",
            "username",
        )
    url = ma.Method("get_url")
    service = ma.Method("get_service")
    username = ma.Method("get_username")

    def get_url(self, obj):
        return obj.social_media_link

    def get_service(self, obj):
        info = get_social_info_from_url(obj.social_media_link)
        return info['service']

    def get_username(self, obj):
        info = get_social_info_from_url(obj.social_media_link)
        return info['username']


social_media_schema = SocialMediaSchema()
social_media_schemas = SocialMediaSchema(many=True)


class AvatarSchema(ma.Schema):
    class Meta:
        model = SocialMedia
        # Fields to expose
        fields = ("image_url",)


avatar_schema = AvatarSchema()
avatar_schemas = AvatarSchema(many=True)
