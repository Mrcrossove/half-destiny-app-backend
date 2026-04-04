import { QueryInterface } from 'sequelize';

export async function up(queryInterface: QueryInterface) {
  await queryInterface.sequelize.query(`
    ALTER TABLE user_profiles
      ADD COLUMN IF NOT EXISTS height_cm INTEGER NULL,
      ADD COLUMN IF NOT EXISTS job VARCHAR(120) NULL,
      ADD COLUMN IF NOT EXISTS school VARCHAR(160) NULL,
      ADD COLUMN IF NOT EXISTS mbti VARCHAR(16) NULL,
      ADD COLUMN IF NOT EXISTS constellation VARCHAR(32) NULL,
      ADD COLUMN IF NOT EXISTS interests TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
      ADD COLUMN IF NOT EXISTS photos TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
  `);
}

export async function down(queryInterface: QueryInterface) {
  await queryInterface.sequelize.query(`
    ALTER TABLE user_profiles
      DROP COLUMN IF EXISTS photos,
      DROP COLUMN IF EXISTS interests,
      DROP COLUMN IF EXISTS constellation,
      DROP COLUMN IF EXISTS mbti,
      DROP COLUMN IF EXISTS school,
      DROP COLUMN IF EXISTS job,
      DROP COLUMN IF EXISTS height_cm;
  `);
}
