import pyotp
from flask_security.utils import hash_password, verify_password
from .misc import gen_random_code

BACKUP_CODE_COUNT = 16
ISSUER = 'Zcash Grants'


def gen_backup_code():
    return f'{gen_random_code(5)}-{gen_random_code(5)}'.lower()


def gen_backup_codes():
    return [gen_backup_code() for x in range(BACKUP_CODE_COUNT)]


def hash_backup_codes(codes):
    return [hash_password(c) for c in codes]


def serialize_backup_codes(codes: tuple):
    hashed = hash_backup_codes(codes)
    return ','.join(hashed)


def deserialize_backup_codes(codes: str):
    return codes.split(',')


def verify_and_update_backup_codes(code: str, serialized_codes: str):
    hashed = deserialize_backup_codes(serialized_codes)
    for i, hc in enumerate(hashed):
        if verify_password(code, hc):
            del hashed[i]
            return ','.join(hashed)

    return None


def gen_otp_secret():
    return pyotp.random_base32()


def verify_totp(secret: str, code: str):
    totp = pyotp.TOTP(secret)
    return totp.verify(code)


def gen_uri(secret: str, email: str):
    return pyotp.totp.TOTP(secret).provisioning_uri(email, issuer_name=ISSUER)
