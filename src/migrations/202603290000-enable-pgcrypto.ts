import { QueryInterface } from 'sequelize';

export async function up(queryInterface: QueryInterface) {
  await queryInterface.sequelize.query(`
    CREATE EXTENSION IF NOT EXISTS "pgcrypto";
  `);
}

export async function down(_queryInterface: QueryInterface) {
  // Intentionally left empty.
  // We do not drop pgcrypto automatically because it may be shared by other objects.
}
