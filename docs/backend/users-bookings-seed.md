# Test Seed - Complete Booking Scenario

Execution timestamp (UTC): 2026-03-09 00:12:00

## Fictional Users Created
- Host (owns listings): Host Demo Listings | host.listings.20260308210636@example.com | password: `HostDemo123!`
- Guest 1: Guest One Demo | guest.one.20260308210636@example.com | password: `GuestOne123!`
- Guest 2: Guest Two Demo | guest.two.20260308210636@example.com | password: `GuestTwo123!`

## Data Created
- Host listings:
  - ID 6: Loft Premium Lisboa (Lisbon, EUR 145, active)
  - ID 7: Studio Ribeira Porto (Porto, EUR 95, active)
- Availability blocks (listing 6):
  - ID 3: 2026-04-10T12:00:00.000Z -> 2026-04-12T10:00:00.000Z (Maintenance window)
  - ID 4: 2026-05-01T12:00:00.000Z -> 2026-05-03T10:00:00.000Z (Owner stay)
- Bookings created:
  - ID 6 (Guest 1) -> confirmed
  - ID 7 (Guest 2) -> cancelled (Guest changed plans)
  - ID 8 (Guest 2) -> pending
  - ID 9 (Guest 1) -> pending
  - ID 10 (Guest 1) -> pending

## Tests Executed
- `POST /auth/signup` and `POST /auth/signin` for 3 users: OK
- `POST /listings` (2 listings) as host: OK
- `POST /availabilityblocks` (2 blocks) as host: OK
- `POST /bookings` as 2 guests: OK
- `PATCH /bookings/confirm` (booking 6): OK
- `PATCH /bookings/cancel` by booking owner (booking 7): OK
- `PATCH /bookings/cancel` by another guest (booking 8): expected 403, received 403 (OK)
- `GET /bookings` as host: 5 bookings returned (OK)
- `GET /bookings?search=Guest One`: 3 bookings (OK)
- `GET /bookings?search=confirmed`: 1 booking (OK)
- `GET /bookings` as guest without owned listings: 0 bookings (OK)
- Blocked date validation (EXACT block range): expected 409, received 409 (OK)
- Blocked date validation (OVERLAPPING block range): expected 409, received 409 (OK)

## Backend Fix Applied
- File changed: `backend/src/modules/availabilityBlocks/availabilityBlocks.service.ts`
- Change: `findAvailabilityBlocksForBooking` now uses overlap logic:
  - `ab.startDate < :endDate`
  - `ab.endDate > :startDate`
- Additional coverage:
  - `backend/src/modules/availabilityBlocks/availabilityBlocks.service.spec.ts` received a test validating the overlap query.
- Automated tests executed:
  - `pnpm --filter @booking-marketplace/backend test -- availabilityBlocks bookings`
  - Result: `7/7 suites` and `17/17 tests` passing.

## Final Result
- End-to-end flow validated successfully after the fix.
- Overall result: OK.
