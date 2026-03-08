# Visao Geral - Admin Side

## Objetivo
Frontend interno para operacao da plataforma de reservas.

## Escopo
- autenticacao admin
- dashboard com indicadores operacionais
- gestao de listings
- gestao de availability blocks
- acompanhamento e acao sobre bookings
- pagina de health/diagnostico

## Rotas
- `app/(public)/auth/login`
- `app/(public)/auth/forgot-password`
- `app/(private)/dashboard`
- `app/(private)/listings`
- `app/(private)/listings/new`
- `app/(private)/listings/[id]/edit`
- `app/(private)/availability-blocks`
- `app/(private)/availability-blocks/new`
- `app/(private)/availability-blocks/[id]/edit`
- `app/(private)/bookings`
- `app/(private)/bookings/[id]`
- `app/(private)/health`

## Stack
- Next.js + App Router
- shadcn/ui
- zod + react-hook-form
- @tanstack/react-query
- zustand
- date-fns
