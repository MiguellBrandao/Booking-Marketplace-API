# Visao Geral do Backend

## Objetivo
O backend implementa a API de marketplace de reservas com foco em:
- autenticacao JWT com refresh token
- ciclo de vida de booking (`pending`, `confirmed`, `cancelled`, `expired`)
- prevencao de overbooking com transacao e lock pessimista
- expiracao assincrona de bookings pendentes via BullMQ

## Stack
- NestJS 11
- TypeORM + PostgreSQL
- Redis + BullMQ
- Swagger em `/docs`

## Estrutura atual
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

## Fluxo de negocio principal
1. Guest cria booking em `pending` com `expiresAt` (15 min).
2. Confirmacao roda em transacao (`QueryRunner`) com lock pessimista.
3. Se houver conflito de periodo com booking `confirmed`, retorna conflito.
4. Job recorrente expira bookings pendentes vencidos.

## Ambiente e execucao
Scripts principais (monorepo):
- `pnpm --filter @booking-marketplace/backend start:dev`
- `pnpm --filter @booking-marketplace/backend test`
- `pnpm --filter @booking-marketplace/backend test:e2e`

Variaveis relevantes:
- `PORT`
- `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`
- `REDIS_HOST`, `REDIS_PORT`
- `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`
- `JWT_ACCESS_EXPIRES`, `JWT_REFRESH_EXPIRES`

## Estado atual importante
- Nao existe prefixo global `/api`; as rotas estao diretamente em `/auth`, `/listings`, etc.
- O `synchronize: true` esta habilitado no TypeORM (nao usa migrations nesta fase).
