# Booking Marketplace API

Booking marketplace backend built with NestJS, TypeORM, and PostgreSQL.
The project covers JWT authentication with refresh token, listing management, availability blocks, and the booking lifecycle.
It also includes a BullMQ/Redis queue for automatic expiration of pending bookings and integration tests to validate concurrent behavior.

## What this project demonstrates

- Modular NestJS organization (auth, listings, availability blocks, bookings, health).
- Authentication flow with access token + refresh token, with hashed refresh token persisted per user.
- Availability rules with overlap prevention for listing blocks.
- Booking confirmation with transaction + pessimistic locking to prevent overbooking under concurrency.
- Asynchronous processing with BullMQ to expire pending bookings.
- Unit and e2e test coverage for critical flows (including concurrency).

## Core features

- User signup, signin, refresh, and logout (`/auth`).
- Partial CRUD for listings owned by authenticated hosts.
- Paginated listing search with filters (`city`, `minPrice`, `maxPrice`, pagination).
- Create/read/update/delete availability blocks by the listing owner.
- Create pending booking, confirm booking, and cancel booking.
- Automatic expiration of overdue `pending` bookings via recurring background job.
- Health check for PostgreSQL and Redis.

## Stack and dependencies

- Node.js 22
- NestJS 11
- TypeORM 0.3
- PostgreSQL (`pg`)
- Redis + BullMQ (`@nestjs/bullmq`, `bullmq`)
- JWT (`@nestjs/jwt`)
- Validation and serialization (`class-validator`, `class-transformer`)
- Swagger (`@nestjs/swagger`, `swagger-ui-express`)
- Testing (`jest`, `supertest`)
- Docker Compose (app + postgres + redis)

## Running locally

### Prerequisites

- Node.js 22+
- npm
- PostgreSQL 16+
- Redis 7+
- Docker + Docker Compose (optional)

### Docker setup

```bash
docker compose up
```

This compose stack starts:

- API at `http://localhost:3000`
- PostgreSQL at `localhost:5432`
- Redis at `localhost:6379`

Note: the `app` service runs `npm install && npm run start:dev` inside the container.

### Non-Docker setup

1. Install dependencies:

```bash
npm install
```

2. Create `.env` from `.env.example` and adjust values.

3. Make sure PostgreSQL and Redis are running with matching credentials.

4. Start in development mode:

```bash
npm run start:dev
```

### Environment variables

Variables defined in `.env.example`:

- `PORT`: API HTTP port.
- `DB_HOST`: PostgreSQL host.
- `DB_PORT`: PostgreSQL port.
- `DB_USER`: PostgreSQL user.
- `DB_PASSWORD`: PostgreSQL password.
- `DB_NAME`: database name.
- `REDIS_HOST`: Redis host (used by BullMQ and health check).
- `REDIS_PORT`: Redis port.
- `JWT_ACCESS_SECRET`: access token secret.
- `JWT_REFRESH_SECRET`: refresh token secret.
- `JWT_ACCESS_EXPIRES`: access token expiration (example: `15m`).
- `JWT_REFRESH_EXPIRES`: refresh token expiration (example: `7d`).

### Start API (dev/prod)

- Development: `npm run start:dev`
- Build: `npm run build`
- Production: `npm run start:prod`

## API documentation

### Swagger

With the API running:

- `http://localhost:3000/docs`

Configured in `src/main.ts`.

### Main endpoints (summary)

Auth:

- `POST /auth/signup`
- `POST /auth/signin`
- `POST /auth/refresh`
- `POST /auth/logout` (Bearer)

Listings (Bearer required for all):

- `GET /listings`
- `GET /listings/my`
- `GET /listings/:id`
- `POST /listings`
- `PATCH /listings/:id`

Availability Blocks (Bearer required for all):

- `GET /availabilityblocks`
- `POST /availabilityblocks`
- `PATCH /availabilityblocks/:id`
- `DELETE /availabilityblocks/:id`

Bookings (Bearer required for all):

- `POST /bookings`
- `PATCH /bookings/confirm`
- `PATCH /bookings/cancel`

Health:

- `GET /health`

## Architecture decisions and code structure

Main structure:

```text
src/
  app.module.ts
  main.ts
  database/
    database.module.ts
    migrations/   (empty)
    seeds/        (empty)
  common/
    interceptors/serialize.interceptor.ts
  modules/
    auth/
    users/
    listings/
    availabilityBlocks/
    bookings/
    health/
```

How code is organized:

- Controllers: `src/modules/*/*.controller.ts`
- Services (business rules): `src/modules/*/*.service.ts`
- TypeORM entities: `src/modules/*/*.entity.ts`
- DTOs and validation: `src/modules/*/dtos/*.ts`
- Jobs/scheduler/worker: `src/modules/bookings/bookings-jobs.scheduler.ts`, `src/modules/bookings/bookings.processor.ts`, `src/modules/bookings/bookings-expire.service.ts`
- JWT guard: `src/modules/auth/guards/auth.guard.ts`

## Concurrency and consistency (overbooking prevention)

Implemented mechanism:

- `confirmBooking` uses an explicit transaction through `queryRunner`.
- Acquires pessimistic write lock (`pessimistic_write`) on the booking being confirmed.
- Acquires pessimistic write lock on the related listing.
- Before confirming, checks for overlapping bookings already in `CONFIRMED` status.
- If conflict exists, throws `ConflictException`.

Where in code:

- `src/modules/bookings/bookings.service.ts` in `confirmBooking`.
- Overlap condition: `b.startDate < :endDate` and `b.endDate > :startDate`.

Test evidence:

- `test/bookings-confirmation-concurrency.e2e-spec.ts` validates that under simultaneous requests, only one confirmation succeeds when there is a conflict.

## Jobs / Queue

What runs in background:

- Recurring job `expire-pending-sweep` every 30 seconds.
- Updates `PENDING` bookings with `expiresAt < NOW()` to `EXPIRED`, setting `expiredAt`.

Where implemented:

- Scheduler: `src/modules/bookings/bookings-jobs.scheduler.ts`
- Processor: `src/modules/bookings/bookings.processor.ts`
- Expiration logic: `src/modules/bookings/bookings-expire.service.ts`

How to test:

- Run `npm run test:e2e` (includes `bookings-expire.e2e-spec.ts`).
- Or create an expired `pending` booking and call `BookingsExpireService.expireDuePendingBookings()` in test/instrumentation.

## Tests

Commands:

- Unit tests: `npm run test`
- E2E/integration tests: `npm run test:e2e`
- Coverage: `npm run test:cov`

Coverage observed in this repository:

- Auth (signup/signin/refresh and failures)
- Listings and filters/pagination
- Availability blocks (authorization and overlap)
- Bookings (create/cancel, expiration, and confirmation concurrency)
- BullMQ jobs (scheduler + processor)
- Health check

Status validated locally in this repository:

- `npm run test` passed (13 suites, 29 tests).
- `npm run test:e2e -- --runInBand` passed (6 suites, 13 tests).

## Troubleshooting

- `401 Unauthorized` on protected routes: confirm `Authorization: Bearer <access_token>` header and matching `JWT_ACCESS_SECRET`.
- DB/Redis connection failures at startup: verify `DB_*` and `REDIS_*` values in `.env` and running services.
- Old data affecting tests: tests use `TRUNCATE ... CASCADE`; ensure DB permissions and connectivity.
- Unexpected schema issues: project currently uses `synchronize: true`; entity changes affect schema on startup.
- Port already in use (`3000`, `5432`, `6379`): adjust `.env`/`docker-compose.yml` or free local ports.

## Notes / TODO

- No CI pipeline exists in the repository (`.github/workflows` missing).
- `src/database/migrations` and `src/database/seeds` exist but contain no files.
- No npm scripts exist for generating/running migrations and seeds; if you want versioned DB changes, these need to be added.
