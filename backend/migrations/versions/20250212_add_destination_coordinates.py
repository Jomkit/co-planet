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
    """Create or backfill trip/activity tables with destination columns.

    This revision doubles as the initial migration. On a fresh database it
    creates the tables with the new columns. On existing databases that were
    created without Alembic, it adds the missing destination columns and
    ensures the activity table exists.
    """
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    existing_tables = inspector.get_table_names()

    # Create tables if they do not exist (fresh install)
    if 'trip' not in existing_tables:
        op.create_table(
            'trip',
            sa.Column('id', sa.Integer(), primary_key=True),
            sa.Column('name', sa.String(length=100), nullable=False),
            sa.Column('destination', sa.String(length=200), nullable=True),
            sa.Column('destination_place_name', sa.String(length=255), nullable=True),
            sa.Column('destination_lat', sa.Float(), nullable=True),
            sa.Column('destination_lng', sa.Float(), nullable=True),
            sa.Column('destination_mapbox_id', sa.String(length=100), nullable=True),
            sa.Column('start_date', sa.Date(), nullable=True),
            sa.Column('end_date', sa.Date(), nullable=True),
            sa.Column('summary', sa.Text(), nullable=True),
            sa.Column('people', sa.Text(), nullable=True),
            sa.Column('created_at', sa.DateTime(), nullable=True),
        )
    else:
        # Add destination columns if they are missing (upgrade existing DB)
        columns = {col['name'] for col in inspector.get_columns('trip')}
        with op.batch_alter_table('trip', schema=None) as batch_op:
            if 'destination_place_name' not in columns:
                batch_op.add_column(sa.Column('destination_place_name', sa.String(length=255), nullable=True))
            if 'destination_lat' not in columns:
                batch_op.add_column(sa.Column('destination_lat', sa.Float(), nullable=True))
            if 'destination_lng' not in columns:
                batch_op.add_column(sa.Column('destination_lng', sa.Float(), nullable=True))
            if 'destination_mapbox_id' not in columns:
                batch_op.add_column(sa.Column('destination_mapbox_id', sa.String(length=100), nullable=True))

    if 'activity' not in existing_tables:
        op.create_table(
            'activity',
            sa.Column('id', sa.Integer(), primary_key=True),
            sa.Column('trip_id', sa.Integer(), nullable=False),
            sa.Column('name', sa.String(length=100), nullable=False),
            sa.Column('type', sa.String(length=50), nullable=True),
            sa.Column('date', sa.DateTime(), nullable=True),
            sa.Column('location', sa.String(length=200), nullable=True),
            sa.Column('notes', sa.Text(), nullable=True),
            sa.Column('status', sa.String(length=20), nullable=True, default='planned'),
            sa.ForeignKeyConstraint(['trip_id'], ['trip.id'], ),
        )


def downgrade():
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    existing_tables = inspector.get_table_names()

    if 'activity' in existing_tables:
        op.drop_table('activity')

    if 'trip' in existing_tables:
        columns = {col['name'] for col in inspector.get_columns('trip')}
        with op.batch_alter_table('trip', schema=None) as batch_op:
            if 'destination_mapbox_id' in columns:
                batch_op.drop_column('destination_mapbox_id')
            if 'destination_lng' in columns:
                batch_op.drop_column('destination_lng')
            if 'destination_lat' in columns:
                batch_op.drop_column('destination_lat')
            if 'destination_place_name' in columns:
                batch_op.drop_column('destination_place_name')
        # Drop the base table to leave a clean slate when downgrading initial revision
        op.drop_table('trip')
