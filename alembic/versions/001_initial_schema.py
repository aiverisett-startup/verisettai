"""Initial schema for accounts, contracts, and ledger_entries

Revision ID: 001_initial_schema
Revises: 
Create Date: 2026-09-06 12:00:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa


revision: str = '001_initial_schema'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


from sqlalchemy.dialects.postgresql import JSONB as PG_JSONB

json_type = sa.JSON().with_variant(PG_JSONB(), 'postgresql')


def upgrade() -> None:
    # accounts table
    op.create_table(
        'accounts',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('api_key_hash', sa.String(length=128), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('role', sa.String(length=50), nullable=False, server_default='dual'),
        sa.Column('balance_cents', sa.BigInteger(), nullable=False, server_default='0'),
        sa.Column('frozen_cents', sa.BigInteger(), nullable=False, server_default='0'),
        sa.Column('currency', sa.String(length=10), nullable=False, server_default='USD'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.CheckConstraint('balance_cents >= 0', name='chk_balance_non_negative'),
        sa.CheckConstraint('frozen_cents >= 0', name='chk_frozen_non_negative'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_accounts_api_key_hash', 'accounts', ['api_key_hash'], unique=True)

    # contracts table
    op.create_table(
        'contracts',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('payer_id', sa.String(length=36), nullable=False),
        sa.Column('worker_id', sa.String(length=36), nullable=True),
        sa.Column('amount_cents', sa.BigInteger(), nullable=False),
        sa.Column('fee_cents', sa.BigInteger(), nullable=False, server_default='0'),
        sa.Column('status', sa.String(length=50), nullable=False, server_default='DRAFT'),
        sa.Column('assertion_type', sa.String(length=50), nullable=False),
        sa.Column('assertion_payload', json_type, nullable=False),
        sa.Column('result_payload', json_type, nullable=True),
        sa.Column('timeout_seconds', sa.Integer(), nullable=False, server_default='300'),
        sa.Column('expires_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('settled_at', sa.DateTime(timezone=True), nullable=True),
        sa.CheckConstraint('amount_cents > 0', name='chk_contract_amount_positive'),
        sa.CheckConstraint('fee_cents >= 0', name='chk_contract_fee_non_negative'),
        sa.ForeignKeyConstraint(['payer_id'], ['accounts.id'], ondelete='RESTRICT'),
        sa.ForeignKeyConstraint(['worker_id'], ['accounts.id'], ondelete='RESTRICT'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_contracts_status', 'contracts', ['status'], unique=False)
    op.create_index('ix_contracts_payer_id', 'contracts', ['payer_id'], unique=False)
    op.create_index('ix_contracts_worker_id', 'contracts', ['worker_id'], unique=False)
    op.create_index('ix_contracts_expires_at', 'contracts', ['expires_at'], unique=False)

    # ledger_entries table
    op.create_table(
        'ledger_entries',
        sa.Column('entry_id', sa.String(length=36), nullable=False),
        sa.Column('contract_id', sa.String(length=36), nullable=True),
        sa.Column('from_account', sa.String(length=36), nullable=False),
        sa.Column('to_account', sa.String(length=36), nullable=False),
        sa.Column('amount_cents', sa.BigInteger(), nullable=False),
        sa.Column('entry_type', sa.String(length=50), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.CheckConstraint('amount_cents > 0', name='chk_ledger_amount_positive'),
        sa.ForeignKeyConstraint(['contract_id'], ['contracts.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['from_account'], ['accounts.id'], ondelete='RESTRICT'),
        sa.ForeignKeyConstraint(['to_account'], ['accounts.id'], ondelete='RESTRICT'),
        sa.PrimaryKeyConstraint('entry_id')
    )
    op.create_index('ix_ledger_from_account', 'ledger_entries', ['from_account'], unique=False)
    op.create_index('ix_ledger_to_account', 'ledger_entries', ['to_account'], unique=False)
    op.create_index('ix_ledger_contract_id', 'ledger_entries', ['contract_id'], unique=False)
    op.create_index('ix_ledger_entry_type', 'ledger_entries', ['entry_type'], unique=False)


def downgrade() -> None:
    op.drop_table('ledger_entries')
    op.drop_table('contracts')
    op.drop_table('accounts')
