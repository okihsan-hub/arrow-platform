"""update_releases table

Revision ID: 0009_update_releases
Revises: 0008_license_requests
Create Date: 2026-06-19
"""

from __future__ import annotations

import sqlalchemy as sa
from alembic import op

revision = "0009_update_releases"
down_revision = "0008_license_requests"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "update_releases",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("app_name", sa.String(128), nullable=False),
        sa.Column("version", sa.String(64), nullable=False),
        sa.Column("channel", sa.String(32), nullable=False, server_default="stable"),
        sa.Column("force_update", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column("min_supported_version", sa.String(64), nullable=False),
        sa.Column("download_url", sa.Text(), nullable=True),
        sa.Column("sha256", sa.String(128), nullable=True),
        sa.Column("release_notes", sa.Text(), nullable=True),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("ix_update_releases_app_name", "update_releases", ["app_name"])


def downgrade() -> None:
    op.drop_index("ix_update_releases_app_name", table_name="update_releases")
    op.drop_table("update_releases")
