import click
from flask.cli import with_appcontext

from .models import User, db


@click.command()
@click.argument('identity')
@with_appcontext
def delete_user(identity):
    print(identity)
    user = None
    if str.isdigit(identity):
        user = User.get_by_id(identity)
    else:
        user = User.get_by_email(identity)

    if user:
        db.session.delete(user)
        db.session.commit()
        click.echo(f'Succesfully deleted {user.display_name} (uid {user.id})')
    else:
        raise click.BadParameter('Invalid user identity. Must be a userid, ' \
                                 'account address, or email address of an ' \
                                 'existing user.')
