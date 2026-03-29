import { QueryInterface } from 'sequelize';

export async function up(queryInterface: QueryInterface) {
  await queryInterface.sequelize.query(`
    CREATE TABLE IF NOT EXISTS billing_orders (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      platform VARCHAR(32) NOT NULL,
      product_id VARCHAR(255) NOT NULL,
      product_type VARCHAR(32) NOT NULL,
      amount NUMERIC(10, 2) NOT NULL,
      currency VARCHAR(16) NOT NULL DEFAULT 'USD',
      status VARCHAR(32) NOT NULL DEFAULT 'pending',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS billing_receipts (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      order_id UUID NOT NULL REFERENCES billing_orders(id) ON DELETE CASCADE,
      platform VARCHAR(32) NOT NULL,
      receipt_payload JSONB NULL,
      purchase_token VARCHAR(255) NULL,
      transaction_id VARCHAR(255) NULL,
      verified_at TIMESTAMPTZ NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS entitlements (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      product_key VARCHAR(128) NOT NULL,
      source VARCHAR(64) NOT NULL DEFAULT 'billing',
      starts_at TIMESTAMPTZ NULL,
      expires_at TIMESTAMPTZ NULL,
      status VARCHAR(32) NOT NULL DEFAULT 'active',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
}

export async function down(queryInterface: QueryInterface) {
  await queryInterface.sequelize.query(`
    DROP TABLE IF EXISTS entitlements;
    DROP TABLE IF EXISTS billing_receipts;
    DROP TABLE IF EXISTS billing_orders;
  `);
}
