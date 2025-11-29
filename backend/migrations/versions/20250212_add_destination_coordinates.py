"""add destination coordinates

Revision ID: add_destination_coordinates
Revises: 
Create Date: 2025-02-12
"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = 'add_destination_coordinates'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    with op.batch_alter_table('trip', schema=None) as batch_op:
        batch_op.add_column(sa.Column('destination_place_name', sa.String(length=255), nullable=True))
        batch_op.add_column(sa.Column('destination_lat', sa.Float(), nullable=True))
        batch_op.add_column(sa.Column('destination_lng', sa.Float(), nullable=True))
        batch_op.add_column(sa.Column('destination_mapbox_id', sa.String(length=100), nullable=True))


def downgrade():
    with op.batch_alter_table('trip', schema=None) as batch_op:
        batch_op.drop_column('destination_mapbox_id')
        batch_op.drop_column('destination_lng')
        batch_op.drop_column('destination_lat')
        batch_op.drop_column('destination_place_name')
