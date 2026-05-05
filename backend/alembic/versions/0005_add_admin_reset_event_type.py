"""add admin_reset_devices event type

Revision ID: 0005_add_admin_reset_event_type
Revises: 0004_license_events
Create Date: 2026-05-05

"""

from __future__ import annotations

from alembic import op


revision = "0005_add_admin_reset_event_type"
down_revision = "0004_license_events"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # PostgreSQL enum: add value (cannot be removed in downgrade).
    op.execute("ALTER TYPE license_event_type ADD VALUE IF NOT EXISTS 'admin_reset_devices'")


def downgrade() -> None:
    # no-op (Postgres enums can't easily drop values)
    pass

