"""remove linkedin social_media items

Revision ID: 332a15eba9d8
Revises: 7c7cecfe5e6c
Create Date: 2019-02-23 19:51:16.284007

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '332a15eba9d8'
down_revision = '7c7cecfe5e6c'
branch_labels = None
depends_on = None


def upgrade():
    connection = op.get_bind()
    connection.execute("DELETE FROM social_media WHERE service = 'LINKEDIN'")


def downgrade():
    # there is no going back, all your precious linkedin profiles are gone now
    pass
