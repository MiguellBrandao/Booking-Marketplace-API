# Visao Geral - Client Side

## Objetivo
Frontend publico para usuarios finais (host/guest) consumirem a plataforma.

## Escopo
- home e descoberta de listings
- detalhes do listing
- fluxo de booking
- area autenticada do usuario (meus bookings, meus listings)
- configuracoes de conta

## Rotas base
- `app/(public)/`
- `app/(public)/listings`
- `app/(public)/listings/[id]`
- `app/(public)/auth/login`
- `app/(public)/auth/signup`
- `app/(private)/my/bookings`
- `app/(private)/my/listings`
- `app/(private)/my/listings/new`
- `app/(private)/my/listings/[id]/edit`
- `app/(private)/account/profile`

## Stack
- Next.js + App Router
- shadcn/ui
- zod + react-hook-form
- @tanstack/react-query
- zustand
- date-fns
