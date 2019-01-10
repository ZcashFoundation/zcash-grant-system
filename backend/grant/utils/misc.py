import datetime
import time
import random
import string
import re
from grant.settings import SITE_URL

epoch = datetime.datetime.utcfromtimestamp(0)


def dt_from_ms(ms):
    return datetime.datetime.utcfromtimestamp(ms / 1000.0)


def dt_to_ms(dt):
    delta = dt - epoch
    return int(delta.total_seconds() * 1000)


def dt_to_unix(dt):
    return int(time.mktime(dt.timetuple()))

def gen_random_code(length=32):
  return ''.join(
    [random.choice(string.ascii_letters + string.digits) for n in range(length)]
  )

def make_url(path: str):
  return f'{SITE_URL}{path}'

def is_email(email: str):
  return bool(re.match(r"[^@]+@[^@]+\.[^@]+", email))

def from_zat(zat: int):
  return zat / 100000000

def to_zat(zec: float):
  return zec * 100000000
