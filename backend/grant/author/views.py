from flask import Blueprint

from .models import Author, authors_schema
from grant import JSONResponse

blueprint = Blueprint('author', __name__, url_prefix='/api/v1/authors')


@blueprint.route("/", methods=["GET"])
def get_authors():
    all_authors = Author.query.all()
    result = authors_schema.dump(all_authors)
    return JSONResponse(result)
