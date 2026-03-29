# Database Bootstrap

This folder contains the first-pass PostgreSQL bootstrap files for `codex/backend`.

## Files

- `init.sql`: initialize a fresh database schema directly

## Beginner Guide

If you are a beginner, use this order:

1. Install PostgreSQL on your machine.
2. Open PostgreSQL command line or a GUI tool such as pgAdmin.
3. Create a new database named `half_destiny_app`.
4. In `codex/backend`, copy `.env.example` to `.env`.
5. Edit `.env` and fill in:
   - `DB_HOST`
   - `DB_PORT`
   - `DB_NAME`
   - `DB_USER`
   - `DB_PASSWORD`
6. Open terminal in `codex/backend`.
7. Run:

```powershell
npm install
```

8. Choose one of these initialization methods:

Method A: direct SQL bootstrap

```powershell
psql -h 127.0.0.1 -U postgres -d half_destiny_app -f .\database\init.sql
```

Method B: migration runner

```powershell
npm run db:migrate
```

9. Start backend:

```powershell
npm run dev
```

10. Check health endpoint:

```powershell
http://127.0.0.1:3020/health
```

## Migration Commands

- Run all pending migrations:

```powershell
npm run db:migrate
```

- Roll back the latest migration:

```powershell
npm run db:migrate:down
```

- Check migration status:

```powershell
npm run db:status
```

## Notes

- This is a clean bootstrap for a new standalone app backend.
- It does not touch the mini-program database.
- The migration runner stores executed records in `schema_migrations`.
- For a fresh local environment, prefer the migration runner.
