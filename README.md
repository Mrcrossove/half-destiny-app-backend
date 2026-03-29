# Half Destiny Backend

Standalone backend for the Half Destiny iOS and Android app.

## Goals

- Do not affect the existing mini-program backend.
- Use a new database.
- Preserve core product experience aligned with the mini-program.
- Add native-app-specific capabilities: Apple login, Google login, app-store billing, legal flows, and account deletion.

## Suggested stack

- Node.js
- Express
- TypeScript
- PostgreSQL
- Sequelize

## Quick start

1. Copy `.env.example` to `.env`
2. Create a PostgreSQL database
3. Install dependencies with `npm install`
4. Run migrations with `npm run db:migrate`
5. Start the backend with `npm run dev`

## Phase 1 scope

- Project skeleton
- Config and database bootstrap
- Auth, user, billing, legal, feedback, and safety route scaffolds
- Core models and placeholder service layer

## Next steps

- Implement migrations
- Add real auth flows
- Add Apple/Google purchase verification
- Add account deletion scheduler
- Add recommendation and report logic
