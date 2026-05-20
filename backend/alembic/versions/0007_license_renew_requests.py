"""license_renew_requests table

Revision ID: 0007_license_renew_requests
Revises: 0006_license_platform
Create Date: 2026-05-20
"""

from __future__ import annotations

import sqlalchemy as sa
from alembic import op

revision = "0007_license_renew_requests"
down_revision = "0006_license_platform"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "license_renew_requests",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("external_id", sa.String(64), nullable=False),
        sa.Column("status", sa.String(32), nullable=False, server_default="pending"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("requested_period", sa.String(32), nullable=False),
        sa.Column("requested_period_label", sa.String(64), nullable=True),
        sa.Column("note", sa.Text(), nullable=True),
        sa.Column("contact_phone", sa.String(64), nullable=True),
        sa.Column("license_key_masked", sa.String(64), nullable=True),
        sa.Column("license_key", sa.String(32), nullable=True),
        sa.Column("license_id", sa.Integer(), sa.ForeignKey("licenses.id"), nullable=True),
        sa.Column("customer_name", sa.String(255), nullable=True),
        sa.Column("device_name", sa.String(255), nullable=True),
        sa.Column("device_id", sa.String(128), nullable=True),
        sa.Column("client_license_status", sa.String(64), nullable=True),
        sa.Column("plan", sa.String(64), nullable=True),
        sa.Column("imported_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("processed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("processed_by_admin_id", sa.Integer(), sa.ForeignKey("admin_users.id"), nullable=True),
        sa.UniqueConstraint("external_id", name="uq_license_renew_external_id"),
    )
    op.create_index("ix_license_renew_requests_external_id", "license_renew_requests", ["external_id"])
    op.create_index("ix_license_renew_requests_license_id", "license_renew_requests", ["license_id"])
    op.create_index("ix_license_renew_requests_status", "license_renew_requests", ["status"])


def downgrade() -> None:
    op.drop_index("ix_license_renew_requests_status", table_name="license_renew_requests")
    op.drop_index("ix_license_renew_requests_license_id", table_name="license_renew_requests")
    op.drop_index("ix_license_renew_requests_external_id", table_name="license_renew_requests")
    op.drop_table("license_renew_requests")
