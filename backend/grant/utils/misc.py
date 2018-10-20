import datetime
import time

epoch = datetime.datetime.utcfromtimestamp(0)


def dt_from_ms(ms):
    return datetime.datetime.utcfromtimestamp(ms / 1000.0)


def dt_to_ms(dt):
    delta = dt - epoch
    return int(delta.total_seconds() * 1000)


def dt_to_unix(dt):
    return int(time.mktime(dt.timetuple()))
