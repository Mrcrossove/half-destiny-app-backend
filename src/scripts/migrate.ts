import fs from 'fs';
import path from 'path';
import { QueryInterface } from 'sequelize';
import { sequelize } from '../config/database';

type MigrationModule = {
  up: (queryInterface: QueryInterface) => Promise<void>;
  down: (queryInterface: QueryInterface) => Promise<void>;
};

type MigrationRecord = {
  id: string;
  name: string;
  executed_at: Date;
};

const MIGRATIONS_DIR = path.resolve(__dirname, '..', 'migrations');

async function ensureSchemaMigrationsTable() {
  await sequelize.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name VARCHAR(255) NOT NULL UNIQUE,
      executed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
}

async function listAppliedMigrations(): Promise<MigrationRecord[]> {
  const [rows] = await sequelize.query(`
    SELECT id, name, executed_at
    FROM schema_migrations
    ORDER BY executed_at ASC, name ASC
  `);
  return rows as MigrationRecord[];
}

function listMigrationFiles() {
  return fs
    .readdirSync(MIGRATIONS_DIR)
    .filter((file) => file.endsWith('.ts') || file.endsWith('.js'))
    .sort((a, b) => a.localeCompare(b));
}

async function loadMigration(fileName: string): Promise<MigrationModule> {
  const fullPath = path.join(MIGRATIONS_DIR, fileName);
  const mod = (await import(fullPath)) as Partial<MigrationModule>;

  if (typeof mod.up !== 'function' || typeof mod.down !== 'function') {
    throw new Error(`Invalid migration module: ${fileName}`);
  }

  return mod as MigrationModule;
}

async function migrateUp() {
  await ensureSchemaMigrationsTable();
  const applied = await listAppliedMigrations();
  const appliedNames = new Set(applied.map((item) => item.name));
  const files = listMigrationFiles();

  for (const file of files) {
    if (appliedNames.has(file)) {
      console.log(`[migrate] skip applied migration: ${file}`);
      continue;
    }

    const migration = await loadMigration(file);
    console.log(`[migrate] applying: ${file}`);
    await migration.up(sequelize.getQueryInterface());
    await sequelize.query(`INSERT INTO schema_migrations (name) VALUES (:name)`, {
      replacements: { name: file }
    });
    console.log(`[migrate] applied: ${file}`);
  }
}

async function migrateDown() {
  await ensureSchemaMigrationsTable();
  const applied = await listAppliedMigrations();
  const latest = applied[applied.length - 1];

  if (!latest) {
    console.log('[migrate] no applied migrations to roll back');
    return;
  }

  const migration = await loadMigration(latest.name);
  console.log(`[migrate] rolling back: ${latest.name}`);
  await migration.down(sequelize.getQueryInterface());
  await sequelize.query(`DELETE FROM schema_migrations WHERE name = :name`, {
    replacements: { name: latest.name }
  });
  console.log(`[migrate] rolled back: ${latest.name}`);
}

async function printStatus() {
  await ensureSchemaMigrationsTable();
  const applied = await listAppliedMigrations();
  const appliedNames = new Set(applied.map((item) => item.name));
  const files = listMigrationFiles();

  console.log('Migration status:');
  for (const file of files) {
    console.log(`${appliedNames.has(file) ? '[x]' : '[ ]'} ${file}`);
  }
}

async function main() {
  const command = String(process.argv[2] || 'status').trim();

  try {
    await sequelize.authenticate();
    if (command === 'up') {
      await migrateUp();
    } else if (command === 'down') {
      await migrateDown();
    } else if (command === 'status') {
      await printStatus();
    } else {
      throw new Error(`Unknown migrate command: ${command}`);
    }
  } finally {
    await sequelize.close();
  }
}

main().catch((error) => {
  console.error('[migrate] failed', error);
  process.exit(1);
});
