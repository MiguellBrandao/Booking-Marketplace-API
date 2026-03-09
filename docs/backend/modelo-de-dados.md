# Data Model (Current Code State)

## Main Tables

### Users
Fields:
- `id` (PK, int)
- `email` (unique)
- `password`
- `name`
- `hashedRefreshToken` (nullable)
- `createdAt`, `updatedAt`

Relations:
- 1:N with `Listings` (`host`)
- 1:N with `Bookings` (`guest`)

### Listings
Fields:
- `id` (PK, int)
- `host` (FK -> `Users`)
- `title`
- `description` (nullable)
- `city`
- `pricePerNight`
- `currency`
- `status` (`active` | `inactive`)
- `createdAt`, `updatedAt`

Indexes:
- index on `host`
- index on `status`

Relations:
- 1:N with `AvailabilityBlocks`
- 1:N with `Bookings`

### AvailabilityBlocks
Fields:
- `id` (PK, int)
- `listing` (FK -> `Listings`)
- `startDate` (`timestamptz`)
- `endDate` (`timestamptz`)
- `reason`
- `createdAt`

Indexes:
- index on `listing`
- index on `startDate`
- index on `endDate`

Service-level business rule:
- blocks cannot overlap for the same listing

### Bookings
Fields:
- `id` (PK, int)
- `listing` (FK -> `Listings`)
- `guest` (FK -> `Users`)
- `startDate` (`timestamptz`)
- `endDate` (`timestamptz`)
- `status` (`pending` | `confirmed` | `cancelled` | `expired`)
- `totalAmount`
- `currency`
- `expiresAt` (`timestamptz`)
- `canceledAt` (nullable)
- `cancelReason` (nullable)
- `expiredAt` (nullable)
- `createdAt`, `updatedAt`

Indexes and constraints:
- composite index `IDX_bookings_listing_status_period` on (`listing`, `status`, `startDate`, `endDate`)
- index on `listing`
- index on `guest`
- index on `status`
- index on `expiresAt`
- check constraint: `startDate < endDate`
- check constraint: if `status = pending`, `expiresAt` must be present

## Consistency Rules
- Overbooking is prevented at confirmation time with transaction + pessimistic locking.
- Pending expiration is handled by jobs with conditional status/time updates.
- Dates are stored as `timestamptz`.
