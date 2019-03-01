import functools

from animal_case import animalify
from webargs.core import dict2schema
from webargs.flaskparser import FlaskParser, abort
from marshmallow import fields

try:
    from collections.abc import Mapping
except ImportError:
    from collections import Mapping


class Parser(FlaskParser):
    DEFAULT_VALIDATION_STATUS = 400

    def use_kwargs(self, *args, **kwargs):

        kwargs["as_kwargs"] = True
        return self.use_args(*args, **kwargs)

    def use_args(
            self,
            argmap,
            req=None,
            locations=None,
            as_kwargs=False,
            validate=None,
            error_status_code=None,
            error_headers=None,
    ):
        locations = locations or self.locations
        request_obj = req
        # Optimization: If argmap is passed as a dictionary, we only need
        # to generate a Schema once
        if isinstance(argmap, Mapping):
            argmap = dict2schema(argmap)()

        def decorator(func):
            req_ = request_obj

            @functools.wraps(func)
            def wrapper(*args, **kwargs):
                req_obj = req_

                if not req_obj:
                    req_obj = self.get_request_from_view_args(func, args, kwargs)
                # NOTE: At this point, argmap may be a Schema, or a callable
                parsed_args = self.parse(
                    argmap,
                    req=req_obj,
                    locations=locations,
                    validate=validate,
                    error_status_code=error_status_code,
                    error_headers=error_headers,
                )
                if as_kwargs:
                    # !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
                    # ONLY CHANGE FROM ORIGINAL
                    kwargs.update(animalify(parsed_args, types='snake'))
                    # !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
                    return func(*args, **kwargs)
                else:
                    # Add parsed_args after other positional arguments
                    new_args = args + (parsed_args,)
                    return func(*new_args, **kwargs)

            wrapper.__wrapped__ = func
            return wrapper

        return decorator

    def handle_invalid_json_error(self, error, req, *args, **kwargs):
        print(error)
        abort(400, exc=error, messages={"json": ["Invalid JSON body."]})


parser = Parser()
use_args = parser.use_args
use_kwargs = parser.use_kwargs

# default kwargs
query = functools.partial(use_kwargs, locations=("query",))
body = functools.partial(use_kwargs, locations=("json",))

paginated_fields = {
    "page": fields.Int(required=False, missing=None),
    "filters": fields.List(fields.Str(), required=False, missing=None),
    "search": fields.Str(required=False, missing=None),
    "sort": fields.Str(required=False, missing=None)
}