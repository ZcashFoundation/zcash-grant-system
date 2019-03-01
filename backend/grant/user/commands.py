import click
from flask.cli import with_appcontext

from .models import User, db


# @click.command()
# @click.argument('identity')
# @with_appcontext
# def delete_user(identity):
#     print(identity)
#     if str.isdigit(identity):
#         user = User.get_by_id(identity)
#     else:
#         user = User.get_by_email(identity)
#
#     if user:
#         db.session.delete(user)
#         db.session.commit()
#         click.echo(f'Succesfully deleted {user.display_name} (uid {user.id})')
#     else:
#         raise click.BadParameter('Invalid user identity. Must be a userid, ' \
#                                  'account address, or email address of an ' \
#                                  'existing user.')


@click.command()
@click.argument('identity')
@with_appcontext
def set_admin(identity):
    print("Setting admin to user with identity: " + identity)
    if str.isdigit(identity):
        user = User.get_by_id(identity)
    else:
        user = User.get_by_email(identity)

    if user:
        user.set_admin(True)
        db.session.add(user)
        db.session.commit()
        click.echo(f'Successfully set {user.display_name} (uid {user.id}) to admin')
    else:
        raise click.BadParameter('''Invalid user identity. Must be a userid, 
                                 'account address, or email address of an  
                                 'existing user.''')
