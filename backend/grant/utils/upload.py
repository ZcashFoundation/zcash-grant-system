import os
import re
from hashlib import md5
from werkzeug.utils import secure_filename
from flask import send_from_directory
from grant.settings import UPLOAD_DIRECTORY

IMAGE_MIME_TYPES = set(['image/png', 'image/jpg', 'image/gif'])
AVATAR_MAX_SIZE = 2 * 1024 * 1024  # 2MB


class FileValidationException(Exception):
    pass


def allowed_avatar_file(file):
    if file.mimetype not in IMAGE_MIME_TYPES:
        raise FileValidationException("Unacceptable file type: {0}".format(file.mimetype))
    file.seek(0, os.SEEK_END)
    size = file.tell()
    file.seek(0)
    if size > AVATAR_MAX_SIZE:
        raise FileValidationException(
            "File size is too large ({0}KB), max size is {1}KB".format(size / 1024, AVATAR_MAX_SIZE / 1024)
        )
    return True


def hash_file(file):
    hasher = md5()
    buf = file.read()
    hasher.update(buf)
    file.seek(0)
    return hasher.hexdigest()


def save_avatar(file, user_id):
    if file and allowed_avatar_file(file):
        ext = file.mimetype.replace('image/', '')
        filename = "{0}.{1}.{2}".format(user_id, hash_file(file), ext)
        file.save(os.path.join(UPLOAD_DIRECTORY, filename))
        return filename


def remove_avatar(url, user_id):
    match = re.search(r'/api/v1/users/avatar/(\d+.\w+.\w+)', url)
    if match:
        filename = match.group(1)
        if filename.startswith(str(user_id) + '.'):
            os.remove(os.path.join(UPLOAD_DIRECTORY, filename))


def send_upload(filename):
    return send_from_directory(UPLOAD_DIRECTORY, secure_filename(filename))
