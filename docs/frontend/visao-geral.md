# Visao Geral do Frontend

## Objetivo
Construir frontend com Next.js + shadcn/ui para consumir a API de reservas, cobrindo fluxo de:
- autenticacao
- listagem de anuncios
- criacao/confirmacao/cancelamento de booking
- visualizacao de bloqueios de disponibilidade

## Stack base
- Next.js (App Router)
- React
- shadcn/ui
- Tailwind CSS

## Bibliotecas obrigatorias para a camada de app
- `zod`
- `react-hook-form`
- `@tanstack/react-query`
- `zustand`
- `date-fns`

## Como rodar
- `pnpm --filter @booking-marketplace/frontend dev`
- app local em `http://localhost:3000`

## Integracao com backend
Definir `NEXT_PUBLIC_API_URL`, por exemplo:
- `http://localhost:3001`
