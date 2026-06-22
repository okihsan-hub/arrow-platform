"""update_releases — package metadata columns (Faz 3)

Revision ID: 0010_update_release_package_fields
Revises: 0009_update_releases
Create Date: 2026-06-19
"""

from __future__ import annotations

import sqlalchemy as sa
from alembic import op

revision = "0010_update_release_package_fields"
down_revision = "0009_update_releases"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("update_releases", sa.Column("file_size_bytes", sa.Integer(), nullable=True))
    op.add_column("update_releases", sa.Column("uploaded_file_name", sa.String(512), nullable=True))
    op.add_column("update_releases", sa.Column("published_at", sa.DateTime(timezone=True), nullable=True))
    op.add_column("update_releases", sa.Column("release_status", sa.String(32), nullable=True))

    op.execute(sa.text("UPDATE update_releases SET release_status = 'published' WHERE release_status IS NULL"))

    bind = op.get_bind()
    if bind.dialect.name == "sqlite":
        with op.batch_alter_table("update_releases") as batch_op:
            batch_op.alter_column(
                "release_status",
                existing_type=sa.String(32),
                nullable=False,
                server_default="draft",
            )
    else:
        op.alter_column(
            "update_releases",
            "release_status",
            existing_type=sa.String(32),
            nullable=False,
            server_default="draft",
        )


def downgrade() -> None:
    bind = op.get_bind()
    if bind.dialect.name == "sqlite":
        with op.batch_alter_table("update_releases") as batch_op:
            batch_op.drop_column("release_status")
            batch_op.drop_column("published_at")
            batch_op.drop_column("uploaded_file_name")
            batch_op.drop_column("file_size_bytes")
    else:
        op.drop_column("update_releases", "release_status")
        op.drop_column("update_releases", "published_at")
        op.drop_column("update_releases", "uploaded_file_name")
        op.drop_column("update_releases", "file_size_bytes")
