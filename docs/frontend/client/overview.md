# Client Frontend Overview

## Purpose
This repository currently prioritizes the host/admin experience. The client-facing area is minimal and mostly limited to authentication entry points.

## Current Scope
- Public authentication pages (`login` and `signup`)
- Global app shell (`layout.tsx`) with theme provider, tooltip provider, and React Query provider
- Root route placeholder page (`/`)
- Shared auth/session behavior used across the app

## Current Public Routes
- `app/page.tsx`
- `app/(public)/auth/login/page.tsx`
- `app/(public)/auth/signup/page.tsx`

## Notes About Protected Routes
- Protected routes exist under `app/(private)/*`, but they are currently admin-oriented (`/admin/*`) and listing-management focused.
- Route access is controlled by `frontend/proxy.ts` using the refresh-token cookie.

## Tech Stack
- Next.js (App Router)
- TypeScript
- shadcn/ui
- React Query (`@tanstack/react-query`)
- Zustand
- React Hook Form + Standard Schema resolver
- next-themes
