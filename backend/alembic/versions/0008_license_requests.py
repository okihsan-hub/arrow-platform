"""license_requests table

Revision ID: 0008_license_requests
Revises: 0007_license_renew_requests
Create Date: 2026-06-05
"""

from __future__ import annotations

import sqlalchemy as sa
from alembic import op

revision = "0008_license_requests"
down_revision = "0007_license_renew_requests"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "license_requests",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("request_code", sa.String(16), nullable=False),
        sa.Column("status", sa.String(32), nullable=False, server_default="pending"),
        sa.Column("company_name", sa.String(255), nullable=False),
        sa.Column("contact_name", sa.String(255), nullable=False),
        sa.Column("contact_position", sa.String(255), nullable=True),
        sa.Column("email", sa.String(255), nullable=False),
        sa.Column("phone", sa.String(64), nullable=False),
        sa.Column("tax_number", sa.String(64), nullable=True),
        sa.Column("machine_code", sa.String(128), nullable=False),
        sa.Column("device_name", sa.String(255), nullable=False),
        sa.Column("app_version", sa.String(64), nullable=False),
        sa.Column("deployment_mode", sa.String(16), nullable=False),
        sa.Column("requested_plan", sa.String(32), nullable=True),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("license_key", sa.String(32), nullable=True),
        sa.Column("customer_id", sa.Integer(), sa.ForeignKey("customers.id"), nullable=True),
        sa.Column("reviewed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("reviewed_by_admin_id", sa.Integer(), sa.ForeignKey("admin_users.id"), nullable=True),
        sa.Column("rejection_reason", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.UniqueConstraint("request_code", name="uq_license_request_code"),
    )
    op.create_index("ix_license_requests_request_code", "license_requests", ["request_code"])
    op.create_index("ix_license_requests_status", "license_requests", ["status"])
    op.create_index("ix_license_requests_customer_id", "license_requests", ["customer_id"])


def downgrade() -> None:
    op.drop_index("ix_license_requests_customer_id", table_name="license_requests")
    op.drop_index("ix_license_requests_status", table_name="license_requests")
    op.drop_index("ix_license_requests_request_code", table_name="license_requests")
    op.drop_table("license_requests")
