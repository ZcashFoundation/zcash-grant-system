import getpass

import click
from grant.settings import SECRET_KEY
from grant.utils.admin import generate_admin_password_hash


@click.command()
def gen_admin_auth():
    """Generate admin authentication password hash (ADMIN_PASS_HASH)"""
    sk_mask_middle = (len(SECRET_KEY) - 2) * '*'
    sk_mask = f'{SECRET_KEY[0]}{sk_mask_middle}{SECRET_KEY[-1]}'
    print(f'\nEnter SECRET_KEY for target environment or hit enter to use current ({sk_mask})\n')
    salt = getpass.getpass('SECRET_KEY (salt):')
    if not salt:
        print('using default SECRET_KEY for salt')
        salt = SECRET_KEY
    password = getpass.getpass('Admin Password:')
    pass_hash = generate_admin_password_hash(password, salt)
    print(f'Please set environment variable\n\n\tADMIN_PASS_HASH={pass_hash}\n')
