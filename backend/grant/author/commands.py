import click
from flask.cli import with_appcontext

from .models import Author, db


@click.command()
@click.argument('account_address')
@with_appcontext
def create_author(account_address):
    author = Author(account_address)
    db.session.add(author)
    db.session.commit()
