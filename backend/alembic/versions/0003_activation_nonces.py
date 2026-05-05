"""activation nonces

Revision ID: 0003_activation_nonces
Revises: 0002_licenses
Create Date: 2026-05-05

"""

from __future__ import annotations

from alembic import op
import sqlalchemy as sa


revision = "0003_activation_nonces"
down_revision = "0002_licenses"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "activation_nonces",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("nonce", sa.String(length=128), nullable=False),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.UniqueConstraint("nonce", name="uq_activation_nonces_nonce"),
    )


def downgrade() -> None:
    op.drop_table("activation_nonces")

