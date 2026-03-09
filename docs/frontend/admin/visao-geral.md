# Admin Frontend Overview

## Purpose
The admin frontend is the internal workspace for hosts to manage listings, availability blocks, and booking operations.

## Current Scope
- Authentication (`login` and `signup`)
- Dashboard with KPI cards, booking/revenue charts, and operational panels
- Listing CRUD flows (create, edit, list)
- Listing details with availability block CRUD (create, edit, delete with confirmation)
- Booking monitoring with search and status summaries
- Theme switching (light/dark/system) in admin headers

## Route Map (Current Implementation)
- `app/(public)/auth/login`
- `app/(public)/auth/signup`
- `app/(private)/admin/dashboard`
- `app/(private)/admin/listings`
- `app/(private)/admin/listings/new`
- `app/(private)/admin/listings/[id]/edit`
- `app/(private)/listings/[id]` (listing details + availability blocks)
- `app/(private)/admin/bookings`

## Architecture Notes
- Route protection is enforced by `frontend/proxy.ts` using the refresh-token cookie.
- API communication is centralized in `frontend/lib/api/*` with a shared `apiFetch` client.
- Data fetching and mutations use React Query hooks in `frontend/hooks/*`.
- Auth access token is stored in `zustand` (`frontend/stores/auth-store.ts`) with session storage persistence.
- The dashboard is split into reusable components under `frontend/components/admin/dashboard/*`.

## Tech Stack
- Next.js (App Router)
- TypeScript
- shadcn/ui
- React Query (`@tanstack/react-query`)
- Zustand
- React Hook Form + Standard Schema resolver
- date-fns
- Recharts
- next-themes
