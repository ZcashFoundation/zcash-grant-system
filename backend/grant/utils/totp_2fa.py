import pyotp
from flask_security.utils import hash_password, verify_password
from .misc import gen_random_code


def gen_backup_code():
    return f'{gen_random_code(5)}-{gen_random_code(5)}'.lower()


def gen_backup_codes():
    return [gen_backup_code() for x in range(16)]


def hash_backup_codes(codes):
    return [hash_password(c) for c in codes]


def verify_and_update_backup_codes(code: str, hashed_codes):
    for i, hc in enumerate(hashed_codes):
        if verify_password(code, hc):
            del hashed_codes[i]
            return hashed_codes

    return None


def gen_otp_secret():
    return pyotp.random_base32()


def verify_totp(secret: str, code: str):
    totp = pyotp.TOTP(secret)
    return totp.verify(code)
