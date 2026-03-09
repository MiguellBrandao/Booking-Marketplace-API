# API Endpoints (Current Code State)

## General Notes
- Base URL: no global prefix
- Swagger: `GET /docs`
- Protected routes: Bearer token required
- Refresh flow: refresh token is handled through an HTTP-only cookie

## Health
- `GET /health`

## Auth
- `POST /auth/signup`
  - Body: `name`, `email`, `password`
  - Response: `{ accessToken }`
  - Side effect: sets refresh-token cookie

- `POST /auth/signin`
  - Body: `email`, `password`
  - Response: `{ accessToken }`
  - Side effect: sets refresh-token cookie

- `POST /auth/refresh`
  - Body: none
  - Response: `{ accessToken }`
  - Requirement: valid refresh-token cookie
  - Side effect: rotates/refreshes refresh-token cookie

- `POST /auth/logout` (protected)
  - Response: `{ "ok": true }`
  - Side effect: clears refresh-token cookie

## Listings (all protected)
- `GET /listings`
  - Optional query: `city`, `minPrice`, `maxPrice`, `page`, `limit`
  - Response: paginated object `{ data, page, limit, total, totalPages }`

- `GET /listings/my`
  - Response: array of listings owned by the authenticated host

- `GET /listings/:id`
  - Response: listing by id

- `POST /listings`
  - Body: `title`, `description`, `city`, `pricePerNight`, `currency`, `status`
  - Response: created listing

- `PATCH /listings/:id`
  - Body: partial listing fields
  - Response: updated listing

## Availability Blocks (all protected)
- `GET /availabilityblocks`
  - Query: `listingId` (required), `startDate?`, `endDate?`
  - Response: array of blocks

- `POST /availabilityblocks`
  - Body: `listingId`, `startDate`, `endDate`, `reason`
  - Response: created block

- `PATCH /availabilityblocks/:id`
  - Body: `startDate?`, `endDate?`, `reason?`
  - Response: updated block

- `DELETE /availabilityblocks/:id`
  - Response: `{ "ok": true }`

## Bookings (all protected)
- `GET /bookings`
  - Visibility: only bookings from listings owned by the authenticated host
  - Optional query: `search`
  - Search fields: booking id, status, guest name/email, listing title/city
  - Response: array of bookings

- `POST /bookings`
  - Body: `listingId`, `startDate`, `endDate`, `currency`
  - Behavior: creates booking in `pending` status
  - Response: created booking

- `PATCH /bookings/confirm`
  - Body: `id`
  - Behavior: confirms pending booking with transaction + pessimistic lock
  - Response: `{ "ok": true }`

- `PATCH /bookings/cancel`
  - Body: `id`, `reason?`
  - Behavior: cancels booking as the guest owner
  - Response: updated booking

## Common Domain Errors
- `400`: invalid payload
- `401`: missing/invalid authentication
- `403`: permission denied
- `404`: resource not found
- `409`: state/date-range conflict
- `410`: booking expired during confirmation

## Concurrency Validation in Booking Confirmation
The confirmation flow uses:
1. Pessimistic lock on booking row
2. Pessimistic lock on listing row
3. Overlap check against `confirmed` bookings
4. Commit only if there is no conflict
