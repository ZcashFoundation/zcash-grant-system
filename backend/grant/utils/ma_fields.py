from grant.extensions import ma
from .misc import dt_to_unix


class UnixDate(ma.Field):
    def _serialize(self, value, attr, obj, **kwargs):
        return dt_to_unix(value) if value else None
