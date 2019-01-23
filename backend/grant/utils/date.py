import math


def get_quarter_formatted(date):
    return "Q" + str(math.ceil(date.date_created.month / 3.)) + " " + str(date.date_created.year)
