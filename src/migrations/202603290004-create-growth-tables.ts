import { QueryInterface } from 'sequelize';

export async function up(queryInterface: QueryInterface) {
  await queryInterface.sequelize.query(`
    CREATE TABLE IF NOT EXISTS recommendation_candidates (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      candidate_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      score NUMERIC(8, 2) NOT NULL DEFAULT 0,
      source VARCHAR(64) NOT NULL DEFAULT 'seed',
      shown_at TIMESTAMPTZ NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
}

export async function down(queryInterface: QueryInterface) {
  await queryInterface.sequelize.query(`
    DROP TABLE IF EXISTS recommendation_candidates;
  `);
}
