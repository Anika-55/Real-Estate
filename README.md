# RealState Backend

Production-ready Node.js backend scaffold using:
- Express.js
- TypeScript
- Prisma ORM
- PostgreSQL

## Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Compile TypeScript to `dist/`
- `npm run start` - Run compiled production build
- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:migrate` - Create and apply migrations in development

## Project Structure

```
src/
  config/
  controllers/
  middlewares/
  routes/
  services/
  types/
  utils/
```

## Quick Start

1. Copy environment values from `.env.example` (or update `.env`).
2. Ensure PostgreSQL is running and `DATABASE_URL` is valid.
3. Generate Prisma client:
   - `npm run prisma:generate`
4. Run migrations:
   - `npm run prisma:migrate`
5. Start development server:
   - `npm run dev`

## API Endpoints

- `GET /` - Service welcome response
- `GET /api/v1/health` - Health check with DB probe
- `GET /api/v1/users` - List users
- `POST /api/v1/users` - Create user (`email`, `fullName`)

