import click
from flask.cli import with_appcontext

from .models import User, db, SocialMedia
from grant.task.models import Task
from grant.settings import STAGING_PASSWORD


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


@click.command()
@with_appcontext
def mangle_users():
    if STAGING_PASSWORD:
        print("Mangling all users")
        for i, user in enumerate(User.query.all()):
            user.email_address = "random" + str(i) + "@grant.io"
            user.password = STAGING_PASSWORD
            # DELETE TOTP SECRET
            user.totp_secret = None
            # DELETE BACKUP CODES
            user.backup_codes = None
            db.session.add(user)

        # DELETE ALL TASKS
        for task in Task.query.all():
            db.session.delete(task)

        # REMOVE ALL SOCIAL MEDIA
        for social in SocialMedia.query.all():
            db.session.delete(social)

        db.session.commit()
