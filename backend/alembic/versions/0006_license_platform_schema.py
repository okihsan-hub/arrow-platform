"""Arrow Bilişim license platform — admin_users, customers, licenses, license_devices

Revision ID: 0006_license_platform
Revises: 0005_add_admin_reset_event_type
Create Date: 2026-05-19

Yeni kurulum için önerilir. Eski `licenses` tablosu varsa kaldırılıp yeniden oluşturulur (geliştirme).
"""

from __future__ import annotations

import sqlalchemy as sa
from alembic import op

revision = "0006_license_platform"
down_revision = "0005_add_admin_reset_event_type"
branch_labels = None
depends_on = None


def upgrade() -> None:
    bind = op.get_bind()
    is_pg = bind.dialect.name == "postgresql"

    if is_pg:
        op.execute("DROP TABLE IF EXISTS license_events CASCADE")
        op.execute("DROP TABLE IF EXISTS activation_nonces CASCADE")
        op.execute("DROP TABLE IF EXISTS license_devices CASCADE")
        op.execute("DROP TABLE IF EXISTS licenses CASCADE")
    else:
        op.execute("DROP TABLE IF EXISTS license_events")
        op.execute("DROP TABLE IF EXISTS activation_nonces")
        op.execute("DROP TABLE IF EXISTS license_devices")
        op.execute("DROP TABLE IF EXISTS licenses")

    op.create_table(
        "admin_users",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("email", sa.String(255), nullable=False),
        sa.Column("password_hash", sa.String(255), nullable=False),
        sa.Column("full_name", sa.String(255), nullable=False),
        sa.Column("role", sa.String(32), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.text("1")),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("ix_admin_users_email", "admin_users", ["email"], unique=True)

    op.create_table(
        "customers",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("company_name", sa.String(255), nullable=False),
        sa.Column("contact_name", sa.String(255), nullable=True),
        sa.Column("email", sa.String(255), nullable=True),
        sa.Column("phone", sa.String(64), nullable=True),
        sa.Column("tax_number", sa.String(64), nullable=True),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
    )

    op.create_table(
        "licenses",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("license_key", sa.String(32), nullable=False),
        sa.Column("customer_id", sa.Integer(), sa.ForeignKey("customers.id"), nullable=False),
        sa.Column("plan", sa.String(32), nullable=False),
        sa.Column("status", sa.String(32), nullable=False),
        sa.Column("starts_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("max_devices", sa.Integer(), nullable=False, server_default="1"),
        sa.Column("features", sa.JSON(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("ix_licenses_license_key", "licenses", ["license_key"], unique=True)
    op.create_index("ix_licenses_customer_id", "licenses", ["customer_id"])

    op.create_table(
        "license_devices",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("license_id", sa.Integer(), sa.ForeignKey("licenses.id"), nullable=False),
        sa.Column("device_id", sa.String(128), nullable=False),
        sa.Column("device_name", sa.String(255), nullable=False),
        sa.Column("app_version", sa.String(64), nullable=True),
        sa.Column("first_activated_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("last_seen_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.text("1")),
        sa.UniqueConstraint("license_id", "device_id", name="uq_license_device"),
    )
    op.create_index("ix_license_devices_license_id", "license_devices", ["license_id"])


def downgrade() -> None:
    op.drop_table("license_devices")
    op.drop_index("ix_licenses_customer_id", table_name="licenses")
    op.drop_index("ix_licenses_license_key", table_name="licenses")
    op.drop_table("licenses")
    op.drop_table("customers")
    op.drop_index("ix_admin_users_email", table_name="admin_users")
    op.drop_table("admin_users")
