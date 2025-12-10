"""add origin fields and round trip flag

Revision ID: add_origin_roundtrip
Revises: add_destination_coordinates
Create Date: 2025-03-05
"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = 'add_origin_roundtrip'
down_revision = 'add_destination_coordinates'
branch_labels = None
depends_on = None


def upgrade():
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    columns = {col['name'] for col in inspector.get_columns('trip')}

    with op.batch_alter_table('trip', schema=None) as batch_op:
        if 'origin' not in columns:
            batch_op.add_column(sa.Column('origin', sa.String(length=200), nullable=True))
        if 'origin_place_name' not in columns:
            batch_op.add_column(sa.Column('origin_place_name', sa.String(length=255), nullable=True))
        if 'origin_lat' not in columns:
            batch_op.add_column(sa.Column('origin_lat', sa.Float(), nullable=True))
        if 'origin_lng' not in columns:
            batch_op.add_column(sa.Column('origin_lng', sa.Float(), nullable=True))
        if 'origin_mapbox_id' not in columns:
            batch_op.add_column(sa.Column('origin_mapbox_id', sa.String(length=100), nullable=True))
        if 'is_round_trip' not in columns:
            batch_op.add_column(sa.Column('is_round_trip', sa.Boolean(), nullable=False, server_default=sa.false()))

    # Remove server_default after data backfill to avoid future NULL insertions relying on server
    with op.batch_alter_table('trip', schema=None) as batch_op:
        batch_op.alter_column('is_round_trip', server_default=None)


def downgrade():
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    columns = {col['name'] for col in inspector.get_columns('trip')}

    with op.batch_alter_table('trip', schema=None) as batch_op:
        if 'is_round_trip' in columns:
            batch_op.drop_column('is_round_trip')
        if 'origin_mapbox_id' in columns:
            batch_op.drop_column('origin_mapbox_id')
        if 'origin_lng' in columns:
            batch_op.drop_column('origin_lng')
        if 'origin_lat' in columns:
            batch_op.drop_column('origin_lat')
        if 'origin_place_name' in columns:
            batch_op.drop_column('origin_place_name')
        if 'origin' in columns:
            batch_op.drop_column('origin')

