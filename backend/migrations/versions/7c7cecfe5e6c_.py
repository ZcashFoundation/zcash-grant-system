"""Convert REFUNDING stage to FAILED

Revision ID: 7c7cecfe5e6c
Revises: 3514aaf4648f
Create Date: 2019-02-22 13:15:44.997884

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '7c7cecfe5e6c'
down_revision = '3514aaf4648f'
branch_labels = None
depends_on = None


def upgrade():
  connection = op.get_bind()
  connection.execute("UPDATE proposal SET stage = 'FAILED' WHERE stage = 'REFUNDING'")


def downgrade():
  connection = op.get_bind()
  connection.execute("UPDATE proposal SET stage = 'REFUNDING' WHERE stage = 'FAILED'")