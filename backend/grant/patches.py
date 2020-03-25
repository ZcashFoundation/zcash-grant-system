from werkzeug import http, wrappers

from grant.werkzeug_http_fork import dump_cookie


def patch_werkzeug_set_samesite():
    http.dump_cookie = dump_cookie
    wrappers.base_response.dump_cookie = dump_cookie
