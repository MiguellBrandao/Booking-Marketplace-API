# API Endpoints e Fluxos (MVP) — guia interno

## Objetivo
Definir endpoints que:
- contem a história do sistema
- são fáceis de demonstrar
- deixam claro onde entram locks, transações, jobs e regras de estado

---

## Convenções gerais
- Base URL: `/api`
- Autenticação: `Authorization: Bearer <token>`
- Paginação: `?page=1&limit=20`
- Datas: ISO 8601 (ex.: `2026-02-11T00:00:00Z`)
- Intervalos: `startDate` inclusivo, `endDate` exclusivo

Erros:
- 400: validação/DTO
- 401: sem auth
- 403: sem permissão (host vs guest)
- 404: recurso inexistente
- 409: conflito (ex.: overbooking / transição inválida)
- 422: regra de negócio (opcional; podes usar 409/400 também)

---

## Auth (mínimo)
### POST `/auth/register`
Body:
- `email`, `password`, `name`
Resposta:
- `accessToken`, `refreshToken`

### POST `/auth/login`
Body:
- `email`, `password`
Resposta:
- `accessToken`, `refreshToken`

### POST `/auth/refresh`
Body:
- `refreshToken`
Resposta:
- `accessToken`, `refreshToken` (rotacionado)

---

## Listings (host)
### POST `/listings`
Role: HOST
Body:
- `title`, `description`, `city`, `pricePerNight`, `currency`
Resposta:
- listing completo

### GET `/listings`
Public
Query (opcional):
- `city`, `minPrice`, `maxPrice`, `page`, `limit`
Resposta:
- lista paginada

### GET `/listings/:id`
Public
Resposta:
- listing + resumo de disponibilidade (opcional)

### PATCH `/listings/:id`
Role: HOST (dono do listing)
Body:
- campos editáveis
Resposta:
- listing atualizado

---

## Availability Blocks (host)
### POST `/listings/:id/availability/blocks`
Role: HOST (dono)
Body:
- `startDate`, `endDate`, `reason?`
Regras:
- `startDate < endDate`
- não aceitar bloco que “cruza” outro bloco existente (opcional no MVP)
Resposta:
- bloco criado

### GET `/listings/:id/availability/blocks`
Role: HOST (dono) ou Admin (se tiveres)
Resposta:
- lista de blocos

### DELETE `/availability/blocks/:blockId`
Role: HOST (dono do listing do block)
Resposta:
- 204

---

## Bookings (guest)
### POST `/bookings`
Role: GUEST
Body:
- `listingId`, `startDate`, `endDate`
Comportamento:
- cria booking `PENDING`
- define `expiresAt = now + 15min`
- calcula `totalAmount` (ex.: noites * pricePerNight)
Resposta:
- booking

Validações:
- listing existe e está ACTIVE
- intervalo válido
- não pode conflitar com `availability_blocks`
- (opcional) não conflitar já com `CONFIRMED` na criação — mas lembra: a garantia final é na confirmação

### GET `/bookings/my`
Role: GUEST
Resposta:
- bookings do guest, paginado, com filtros por status

---

## Confirmar / Cancelar booking (onde a mágica acontece)
### POST `/bookings/:id/confirm`
Role: GUEST (dono do booking)
Body (opcional):
- `paymentMethod` (simulado)
Comportamento recomendado (alto nível):
1) abre transação
2) valida booking está `PENDING` e não expirou
3) faz lock no que precisa (ex.: `listing` row e/ou booking row)
4) verifica conflitos com bookings `CONFIRMED` do mesmo listing no intervalo
5) se ok: muda status para `CONFIRMED`
6) commit
7) enfileira job de notificação (assíncrono)

Erros:
- 404 se booking não existe
- 409 se booking não está em `PENDING`
- 409 se expirou
- 409 se conflito (overbooking)

Resposta:
- booking confirmado

### POST `/bookings/:id/cancel`
Role: GUEST (dono) ou HOST (dono do listing)
Body:
- `reason`
Comportamento:
- se `PENDING`: cancelar direto
- se `CONFIRMED`: aplicar política simples (ex.: se faltam <24h, sem reembolso)
- atualizar status `CANCELED`, set `canceledAt`

Erros:
- 409 transição inválida (ex.: já expired/canceled)
- 403 se não for dono/host

Resposta:
- booking cancelado

---

## Endpoints do host (gestão)
### GET `/host/bookings`
Role: HOST
Query:
- `status`, `listingId`, `page`, `limit`
Resposta:
- bookings das listings do host

---

## Fluxos de demo (para tu fazeres na entrevista)

### Fluxo A: “happy path”
1) Host cria listing
2) Guest cria booking (`PENDING`)
3) Guest confirma booking (`CONFIRMED`)
4) Host vê booking confirmado em `/host/bookings`

### Fluxo B: Expiração automática
1) Guest cria booking (`PENDING`, expiresAt em 15 min)
2) Job roda e marca como `EXPIRED`
3) Guest tenta confirmar e recebe 409

### Fluxo C: Overbooking (concorrência)
1) Dois guests criam bookings `PENDING` para mesmo listing e intervalo
2) Ambos tentam confirmar ao mesmo tempo
3) Apenas 1 confirma; o outro recebe 409 conflito

> O Fluxo C é o teu “showcase”. Depois, nos MDs de concorrência/locks, tu vais implementar isso corretamente.

---

## Observações práticas
- Para facilitar demo de concorrência, cria um endpoint de teste (apenas em dev), por exemplo:
  - `POST /dev/simulate/confirm-race?bookingA=...&bookingB=...`
- Ou faz um script `scripts/race-confirm.ts` que dispara 2 requests em paralelo.

---

## Contratos de resposta (simplificados)
Booking (exemplo):
- `id`, `listingId`, `guestId`, `startDate`, `endDate`
- `status`, `expiresAt`, `totalAmount`, `currency`
- `createdAt`, `updatedAt`
