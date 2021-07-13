"""empty message

Revision ID: 91b16dc2fd74
Revises: d03c91f3038d
Create Date: 2021-02-01 17:00:23.721765

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '91b16dc2fd74'
down_revision = 'd03c91f3038d'
branch_labels = None
depends_on = None


def upgrade():
# ### commands auto generated by Alembic - please adjust! ###
    op.add_column('proposal', sa.Column('funded_by_zomg', sa.Boolean(), nullable=True))
    # ### end Alembic commands ###


def downgrade():
# ### commands auto generated by Alembic - please adjust! ###
    op.drop_column('proposal', 'funded_by_zomg')
    # ### end Alembic commands ###
