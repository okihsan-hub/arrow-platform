"""license events

Revision ID: 0004_license_events
Revises: 0003_activation_nonces
Create Date: 2026-05-05

"""

from __future__ import annotations

from alembic import op
import sqlalchemy as sa


revision = "0004_license_events"
down_revision = "0003_activation_nonces"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "license_events",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("event_type", sa.Enum("activation", "validation", name="license_event_type"), nullable=False),
        sa.Column("license_key_masked", sa.String(length=64), nullable=False),
        sa.Column("device_id", sa.String(length=128), nullable=False),
        sa.Column("ip", sa.String(length=64), nullable=True),
        sa.Column("success", sa.Boolean(), nullable=False),
        sa.Column("reason", sa.String(length=64), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
    )


def downgrade() -> None:
    op.drop_table("license_events")
    op.execute("DROP TYPE IF EXISTS license_event_type")

