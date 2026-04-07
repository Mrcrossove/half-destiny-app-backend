import { QueryInterface } from 'sequelize';

export async function up(queryInterface: QueryInterface) {
  await queryInterface.sequelize.query(`
    ALTER TABLE user_profiles
      ADD COLUMN IF NOT EXISTS birth_time VARCHAR(16) NULL,
      ADD COLUMN IF NOT EXISTS current_luck_pillar VARCHAR(16) NULL,
      ADD COLUMN IF NOT EXISTS year_pillar VARCHAR(16) NULL,
      ADD COLUMN IF NOT EXISTS month_pillar VARCHAR(16) NULL,
      ADD COLUMN IF NOT EXISTS day_pillar VARCHAR(16) NULL,
      ADD COLUMN IF NOT EXISTS hour_pillar VARCHAR(16) NULL,
      ADD COLUMN IF NOT EXISTS day_element VARCHAR(16) NULL,
      ADD COLUMN IF NOT EXISTS body_strength VARCHAR(32) NULL,
      ADD COLUMN IF NOT EXISTS bazi_report TEXT NULL,
      ADD COLUMN IF NOT EXISTS last_bazi_calculated_at TIMESTAMPTZ NULL;
  `);

  await queryInterface.sequelize.query(`
    CREATE TABLE IF NOT EXISTS murron_cache (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      request_type VARCHAR(32) NOT NULL,
      cache_key TEXT NOT NULL,
      response_payload JSONB NULL,
      response_text TEXT NOT NULL DEFAULT '',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await queryInterface.sequelize.query(`
    CREATE INDEX IF NOT EXISTS idx_murron_cache_lookup
    ON murron_cache (user_id, request_type, created_at DESC);
  `);
}

export async function down(queryInterface: QueryInterface) {
  await queryInterface.sequelize.query(`
    DROP TABLE IF EXISTS murron_cache;
  `);

  await queryInterface.sequelize.query(`
    ALTER TABLE user_profiles
      DROP COLUMN IF EXISTS last_bazi_calculated_at,
      DROP COLUMN IF EXISTS bazi_report,
      DROP COLUMN IF EXISTS body_strength,
      DROP COLUMN IF EXISTS day_element,
      DROP COLUMN IF EXISTS hour_pillar,
      DROP COLUMN IF EXISTS day_pillar,
      DROP COLUMN IF EXISTS month_pillar,
      DROP COLUMN IF EXISTS year_pillar,
      DROP COLUMN IF EXISTS current_luck_pillar,
      DROP COLUMN IF EXISTS birth_time;
  `);
}
