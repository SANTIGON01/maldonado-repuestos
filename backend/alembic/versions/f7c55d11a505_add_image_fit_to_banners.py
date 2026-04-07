"""add image_fit to banners

Revision ID: f7c55d11a505
Revises: 57c4a551a50d
Create Date: 2026-04-07 12:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = 'f7c55d11a505'
down_revision: Union[str, None] = '57c4a551a50d'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        'banners',
        sa.Column(
            'image_fit',
            sa.String(length=20),
            server_default='cover',
            nullable=False,
        ),
    )


def downgrade() -> None:
    op.drop_column('banners', 'image_fit')
