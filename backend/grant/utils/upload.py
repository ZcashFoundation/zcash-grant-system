import re
import uuid

import boto3
from flask import current_app

IMAGE_MIME_TYPES = set(['image/png', 'image/jpg', 'image/gif'])
AVATAR_MAX_SIZE = 2 * 1024 * 1024  # 2MB


class AvatarException(Exception):
    pass


def allowed_avatar_type(mimetype):
    if mimetype not in IMAGE_MIME_TYPES:
        raise AvatarException("Unacceptable file type: {0}".format(mimetype))
    return True


def extract_avatar_filename(url):
    match = re.search(r'avatars/(\d+\.\w+\.\w+)$', url)
    if match:
        return match.group(1)
    else:
        raise AvatarException("Unable to extract avatar filename from %s" % url)


def construct_avatar_url(filename):
    S3_BUCKET = current_app.config['S3_BUCKET']
    return "https://%s.s3.amazonaws.com/avatars/%s" % (S3_BUCKET, filename)


def remove_avatar(url, user_id):
    S3_BUCKET = current_app.config['S3_BUCKET']
    filename = extract_avatar_filename(url)
    user_match = re.search(r'^(\d+)\.\w+\.\w+$', filename)
    if user_match and user_match.group(1) == str(user_id):
        s3 = boto3.resource('s3')
        s3.Object(S3_BUCKET, 'avatars/' + filename).delete()


def sign_avatar_upload(mimetype, user_id):
    S3_BUCKET = current_app.config['S3_BUCKET']
    if mimetype and allowed_avatar_type(mimetype):
        ext = mimetype.replace('image/', '')
        filename = "{0}.{1}.{2}".format(user_id, uuid.uuid4().hex, ext)
        key = "avatars/" + filename
        s3 = boto3.client('s3')
        presigned_post = s3.generate_presigned_post(
            Bucket=S3_BUCKET,
            Key=key,
            Fields={"acl": "public-read", "Content-Type": mimetype},
            Conditions=[
                {"acl": "public-read"},
                {"Content-Type": mimetype},
                ["content-length-range", 0, AVATAR_MAX_SIZE]
            ],
            ExpiresIn=3600
        )
        return {
            "data": presigned_post,
            "url": construct_avatar_url(filename)
        }
