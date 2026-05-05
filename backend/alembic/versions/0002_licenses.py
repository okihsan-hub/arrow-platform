"""licenses

Revision ID: 0002_licenses
Revises: 0001_init
Create Date: 2026-05-05

"""

from __future__ import annotations

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision = "0002_licenses"
down_revision = "0001_init"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "licenses",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("customer_id", sa.Integer(), sa.ForeignKey("users.id", ondelete="RESTRICT"), nullable=False),
        sa.Column("reseller_id", sa.Integer(), sa.ForeignKey("users.id", ondelete="SET NULL"), nullable=True),
        sa.Column("product_name", sa.String(length=128), nullable=False),
        sa.Column("license_key", sa.String(length=64), nullable=False),
        sa.Column("status", sa.Enum("active", "suspended", "expired", "cancelled", name="license_status"), nullable=False),
        sa.Column("starts_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("max_devices", sa.Integer(), nullable=False),
        sa.Column("bound_devices", postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
    )
    op.create_index("ix_licenses_customer_id", "licenses", ["customer_id"], unique=False)
    op.create_index("ix_licenses_reseller_id", "licenses", ["reseller_id"], unique=False)
    op.create_index("ix_licenses_license_key", "licenses", ["license_key"], unique=True)


def downgrade() -> None:
    op.drop_index("ix_licenses_license_key", table_name="licenses")
    op.drop_index("ix_licenses_reseller_id", table_name="licenses")
    op.drop_index("ix_licenses_customer_id", table_name="licenses")
    op.drop_table("licenses")
    op.execute("DROP TYPE IF EXISTS license_status")

