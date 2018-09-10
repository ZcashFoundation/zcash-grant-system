import datetime

import time
from contextlib import closing

from requests import get
from requests.exceptions import RequestException




def simple_get(url):
    """
    Attempts to get the content at `url` by making an HTTP GET request.
    If the content-type of response is some kind of HTML/XML, return the
    text content, otherwise return None.
    """
    try:
        with closing(get(url, stream=True)) as resp:
            if is_good_response(resp):
                return resp.content
            else:
                return None

    except RequestException as e:
        log_error("Error during requests to {0} : {1}".format(url, str(e)))
        return None


def is_good_response(resp):
    """
    Returns True if the response seems to be HTML, False otherwise.
    """
    content_type = resp.headers["Content-Type"].lower()
    return (
            resp.status_code == 200
            and content_type is not None
            and content_type.find("html") > -1
    )


def log_error(e):
    """
    It is always a good idea to log errors.
    This function just prints them, but you can
    make it do anything.
    """
    print(e)


def strip_number_formatting_from_string(string: str) -> str:
    return string.replace(",", "").replace(".", "").replace(" ", "").strip()


def convert_monero_to_piconero(monero_string: str) -> int:
    monero_string = strip_number_formatting_from_string(monero_string)
    for _ in range(11):
        monero_string += "0"
    return int(monero_string)


def convert_piconero_to_monero(piconero_string: str) -> str:
    reversed_piconero = piconero_string[::-1]
    added_decimal = reversed_piconero[:13] + "." + reversed_piconero[13:]
    unreversed_piconero = added_decimal[::-1]
    return unreversed_piconero


def convert_string_money_to_float(money_string: str) -> float:
    reversed_money_string = money_string[::-1]
    added_decimal = reversed_money_string[:2] + "." + reversed_money_string[2:]
    unreversed_money_string = added_decimal[::-1]
    return float(unreversed_money_string)


epoch = datetime.datetime.utcfromtimestamp(0)


def dt_from_ms(ms):
    return datetime.datetime.utcfromtimestamp(ms / 1000.0)


def dt_to_ms(dt):
    delta = dt - epoch
    return int(delta.total_seconds() * 1000)


def dt_to_unix(dt):
    return int(time.mktime(dt.timetuple()))
