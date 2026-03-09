# Backend Overview

## Purpose
The backend provides the booking marketplace API with a focus on:
- JWT authentication with refresh-token cookies
- Booking lifecycle management (`pending`, `confirmed`, `cancelled`, `expired`)
- Overbooking prevention with transactions and pessimistic locks
- Asynchronous expiration of pending bookings via BullMQ

## Stack
- NestJS 11
- TypeORM + PostgreSQL
- Redis + BullMQ
- Swagger at `/docs`

## Current Structure
```text
backend/
  src/
    app.module.ts
    main.ts
    database/
    common/
    modules/
      auth/
      users/
      listings/
      availabilityBlocks/
      bookings/
      health/
  test/
  package.json
```

## Core Business Flow
1. A guest creates a booking in `pending` status with `expiresAt` (15 minutes).
2. Confirmation runs inside a transaction (`QueryRunner`) with pessimistic locks.
3. If a date overlap exists with a `confirmed` booking, the API returns conflict.
4. A recurring job expires overdue pending bookings.

## Environment and Running
Main scripts (monorepo):
- `pnpm --filter @booking-marketplace/backend start:dev`
- `pnpm --filter @booking-marketplace/backend test`
- `pnpm --filter @booking-marketplace/backend test:e2e`

Important environment variables:
- `PORT`
- `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`
- `REDIS_HOST`, `REDIS_PORT`
- `JWT_ACCESS_SECRET`
- `JWT_REFRESH_SECRET`
- `JWT_ACCESS_EXPIRES`
- `REFRESH_COOKIE_NAME`, `REFRESH_COOKIE_MAX_AGE_MS`
- `CORS_ORIGIN`

## Important Current Behavior
- There is no global `/api` prefix. Routes are directly exposed as `/auth`, `/listings`, `/bookings`, etc.
- TypeORM currently runs with `synchronize: true` (no migrations yet in this phase).
