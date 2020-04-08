import warnings
from datetime import timedelta, datetime
from time import time, gmtime

from werkzeug._compat import to_bytes, string_types, text_type, PY2, integer_types
from werkzeug._internal import _make_cookie_domain, _cookie_quote
from werkzeug.urls import iri_to_uri


def dump_cookie(
        key,
        value="",
        max_age=None,
        expires=None,
        path="/",
        domain=None,
        secure=False,
        httponly=False,
        charset="utf-8",
        sync_expires=True,
        max_size=4093,
        samesite=None,
):
    """Creates a new Set-Cookie header without the ``Set-Cookie`` prefix
    The parameters are the same as in the cookie Morsel object in the
    Python standard library but it accepts unicode data, too.

    On Python 3 the return value of this function will be a unicode
    string, on Python 2 it will be a native string.  In both cases the
    return value is usually restricted to ascii as the vast majority of
    values are properly escaped, but that is no guarantee.  If a unicode
    string is returned it's tunneled through latin1 as required by
    PEP 3333.

    The return value is not ASCII safe if the key contains unicode
    characters.  This is technically against the specification but
    happens in the wild.  It's strongly recommended to not use
    non-ASCII values for the keys.

    :param max_age: should be a number of seconds, or `None` (default) if
                    the cookie should last only as long as the client's
                    browser session.  Additionally `timedelta` objects
                    are accepted, too.
    :param expires: should be a `datetime` object or unix timestamp.
    :param path: limits the cookie to a given path, per default it will
                 span the whole domain.
    :param domain: Use this if you want to set a cross-domain cookie. For
                   example, ``domain=".example.com"`` will set a cookie
                   that is readable by the domain ``www.example.com``,
                   ``foo.example.com`` etc. Otherwise, a cookie will only
                   be readable by the domain that set it.
    :param secure: The cookie will only be available via HTTPS
    :param httponly: disallow JavaScript to access the cookie.  This is an
                     extension to the cookie standard and probably not
                     supported by all browsers.
    :param charset: the encoding for unicode values.
    :param sync_expires: automatically set expires if max_age is defined
                         but expires not.
    :param max_size: Warn if the final header value exceeds this size. The
        default, 4093, should be safely `supported by most browsers
        <cookie_>`_. Set to 0 to disable this check.
    :param samesite: Limits the scope of the cookie such that it will only
                     be attached to requests if those requests are "same-site".

    .. _`cookie`: http://browsercookielimits.squawky.net/
    """
    key = to_bytes(key, charset)
    value = to_bytes(value, charset)

    if path is not None:
        path = iri_to_uri(path, charset)
    domain = _make_cookie_domain(domain)
    if isinstance(max_age, timedelta):
        max_age = (max_age.days * 60 * 60 * 24) + max_age.seconds
    if expires is not None:
        if not isinstance(expires, string_types):
            expires = cookie_date(expires)
    elif max_age is not None and sync_expires:
        expires = to_bytes(cookie_date(time() + max_age))

    samesite = samesite.title() if samesite else None
    if samesite not in ("Strict", "Lax", 'None', None):
        raise ValueError("invalid SameSite value; must be 'Strict', 'Lax', 'None', or None")

    buf = [key + b"=" + _cookie_quote(value)]

    # XXX: In theory all of these parameters that are not marked with `None`
    # should be quoted.  Because stdlib did not quote it before I did not
    # want to introduce quoting there now.
    for k, v, q in (
            (b"Domain", domain, True),
            (b"Expires", expires, False),
            (b"Max-Age", max_age, False),
            (b"Secure", secure, None),
            (b"HttpOnly", httponly, None),
            (b"Path", path, False),
            (b"SameSite", samesite, False),
    ):
        if q is None:
            if v:
                buf.append(k)
            continue

        if v is None:
            continue

        tmp = bytearray(k)
        if not isinstance(v, (bytes, bytearray)):
            v = to_bytes(text_type(v), charset)
        if q:
            v = _cookie_quote(v)
        tmp += b"=" + v
        buf.append(bytes(tmp))

    # The return value will be an incorrectly encoded latin1 header on
    # Python 3 for consistency with the headers object and a bytestring
    # on Python 2 because that's how the API makes more sense.
    rv = b"; ".join(buf)
    if not PY2:
        rv = rv.decode("latin1")

    # Warn if the final value of the cookie is less than the limit. If the
    # cookie is too large, then it may be silently ignored, which can be quite
    # hard to debug.
    cookie_size = len(rv)

    if max_size and cookie_size > max_size:
        value_size = len(value)
        warnings.warn(
            'The "{key}" cookie is too large: the value was {value_size} bytes'
            " but the header required {extra_size} extra bytes. The final size"
            " was {cookie_size} bytes but the limit is {max_size} bytes."
            " Browsers may silently ignore cookies larger than this.".format(
                key=key,
                value_size=value_size,
                extra_size=cookie_size - value_size,
                cookie_size=cookie_size,
                max_size=max_size,
            ),
            stacklevel=2,
        )

    return rv


def cookie_date(expires=None):
    """Formats the time to ensure compatibility with Netscape's cookie
    standard.

    Accepts a floating point number expressed in seconds since the epoch in, a
    datetime object or a timetuple.  All times in UTC.  The :func:`parse_date`
    function can be used to parse such a date.

    Outputs a string in the format ``Wdy, DD-Mon-YYYY HH:MM:SS GMT``.

    :param expires: If provided that date is used, otherwise the current.
    """
    return _dump_date(expires, "-")


def _dump_date(d, delim):
    """Used for `http_date` and `cookie_date`."""
    if d is None:
        d = gmtime()
    elif isinstance(d, datetime):
        d = d.utctimetuple()
    elif isinstance(d, (integer_types, float)):
        d = gmtime(d)
    return "%s, %02d%s%s%s%s %02d:%02d:%02d GMT" % (
        ("Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun")[d.tm_wday],
        d.tm_mday,
        delim,
        (
            "Jan",
            "Feb",
            "Mar",
            "Apr",
            "May",
            "Jun",
            "Jul",
            "Aug",
            "Sep",
            "Oct",
            "Nov",
            "Dec",
        )[d.tm_mon - 1],
        delim,
        str(d.tm_year),
        d.tm_hour,
        d.tm_min,
        d.tm_sec,
    )