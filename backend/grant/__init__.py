import copy
import re

from flask import jsonify


def _camel_dict(dict_obj, deep=True):
    converted_dict_obj = {}
    for snake_case_k in dict_obj:
        camel_case_k = re.sub('_([a-z])', lambda match: match.group(1).upper(), snake_case_k)
        value = dict_obj[snake_case_k]

        if type(value) == dict and deep:
            converted_dict_obj[camel_case_k] = camel(**value)
        elif type(value) == list and deep:
            converted_list_items = []
            for item in value:
                converted_list_items.append(camel(**item))
            converted_dict_obj[camel_case_k] = converted_list_items
        else:
            converted_dict_obj[camel_case_k] = dict_obj[snake_case_k]
    return converted_dict_obj


def camel(dict_or_list_obj=None, **kwargs):
    dict_or_list_obj = kwargs if kwargs else dict_or_list_obj
    deep = True
    if type(dict_or_list_obj) == dict:
        return _camel_dict(dict_obj=dict_or_list_obj, deep=deep)
    elif type(dict_or_list_obj) == list or type(dict_or_list_obj) == tuple or type(dict_or_list_obj) == map:
        return list(map(_camel_dict, list(dict_or_list_obj)))
    else:
        raise ValueError("type {} is not supported!".format(type(dict_or_list_obj)))


"""
    JSONResponse allows several argument formats:
        1. JSONResponse([{"userId": 1, "name": "John" }, {"userId": 2, "name": "Dave" }])
        2. JSONResponse(result=[my_results])

    JSONResponse does not accept the following:
        1. Intermixed positional and keyword arguments: JSONResponse(some_data, wow=True)
            1a. The exception to this is _statusCode, which is allowed to be mixed. 
                An HTTP Status code should be set here by the caller, or 200 will be used.
        1. Multiple positional arguments: JSONResponse(some_data, other_data)
"""


# TODO - use something standard. Insane that it's so hard to camelCase JSON output
def JSONResponse(*args, **kwargs):
    if args:
        if len(args) > 1:
            raise ValueError("Only one positional arg supported")

    if kwargs.get("_statusCode"):
        status = copy.copy(kwargs["_statusCode"])
        del kwargs["_statusCode"]
    else:
        status = 200

    if args and kwargs:
        raise ValueError("Only positional args or keyword args supported, not both")

    if not kwargs and not args:
        # TODO add log. This should never happen
        return jsonify({}), 500

    if kwargs:
        return jsonify(camel(**kwargs)), status

    else:
        return jsonify(camel(args[0])), status
