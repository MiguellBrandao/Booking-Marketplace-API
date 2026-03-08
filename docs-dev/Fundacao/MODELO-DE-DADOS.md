# Modelo de Dados (TypeORM + Postgres) — guia interno

## Princípios
- O DB é a última linha de defesa: **índices, constraints e transações**.
- Evitar modelagem “bonita mas fraca”: o objetivo é suportar concorrência e regras.

---

## Entidades MVP (sugestão)

### users
Campos:
- `id (uuid)`
- `email (unique)`
- `passwordHash`
- `name`
- `roles` (opção A: enum array; opção B: tabela user_roles)
- `createdAt`, `updatedAt`

Índices:
- unique(email)

### listings
Campos:
- `id (uuid)`
- `hostId (fk users)`
- `title`
- `description`
- `city`
- `pricePerNight` (numeric)
- `currency` (ex.: BRL/EUR)
- `status` (ACTIVE/INACTIVE)
- `createdAt`, `updatedAt`

Índices:
- `index(hostId)`
- `index(city)` (se fores filtrar por cidade)
- `index(status)`

### availability_blocks
(Intervalos bloqueados/indisponíveis, por exemplo manutenção, já reservado externamente, etc.)
Campos:
- `id (uuid)`
- `listingId (fk listings)`
- `startDate` (timestamp/date)
- `endDate` (timestamp/date)  **end exclusivo recomendado**
- `reason` (optional)
- `createdAt`

Índices:
- `index(listingId, startDate, endDate)`

Constraints úteis:
- `CHECK (startDate < endDate)`

### bookings
Campos:
- `id (uuid)`
- `listingId (fk listings)`
- `guestId (fk users)`
- `startDate`
- `endDate`  **end exclusivo**
- `status` (PENDING/CONFIRMED/CANCELED/EXPIRED)
- `totalAmount` (numeric)
- `currency`
- `expiresAt` (timestamp)  (só usado quando PENDING)
- `canceledAt` (nullable)
- `cancelReason` (nullable)
- `createdAt`, `updatedAt`

Índices:
- `index(listingId)`
- `index(guestId)`
- `index(status)`
- `index(expiresAt)` (para job de expiração)

Constraints úteis:
- `CHECK (startDate < endDate)`
- `CHECK ((status != 'PENDING') OR (expiresAt IS NOT NULL))` (opcional)

---

## Ponto crucial: evitar overbooking (modelagem / estratégia)

### Regra final
“Para um listing, não pode existir **mais de um booking CONFIRMED** que sobreponha o mesmo intervalo.”

Há 3 abordagens comuns; para MVP com TypeORM:
1) **Transação + lock pessimista** (mais fácil de explicar e implementar)
2) **Exclusion constraint com range types** (muito elegante, mas mais avançado)
3) **Unique key artificial por dia** (explode linhas e dá trabalho)

Recomendação para teu MVP:
- **A1: lock no listing row** + verificar conflitos dentro da transação antes de confirmar.

Porquê?
- Explicável em entrevista
- Implementação direta
- Funciona bem sem features avançadas

---

## Datas e timezone (para não dar bugs chatos)
- Salva datas em UTC (timestamp with time zone).
- Decide se reservas são por “noites” (date) ou por hora (timestamp).
  - Para “Airbnb-like”, podes usar **date** (check-in/check-out).
  - Para geral (serviços), usa timestamp.
- Mantém **end exclusivo**:
  - Ex.: start = 10, end = 12 reserva [10,12)
  - Isso evita conflito falso quando alguém sai no mesmo instante que outro entra.

---

## Seeds (para desenvolvimento rápido)
Cria seeds para:
- 2 hosts
- 3 listings por host
- 3 guests
- alguns availability_blocks
- 1 booking CONFIRMED (para testar conflito)
- 1 booking PENDING com expiresAt curto (para testar job)

---

## Observação sobre pagamentos (opcional)
Se quiseres simular pagamento sem integrar nada:
- tabela `payments` ligada a booking
- mas para o MVP, podes confirmar booking “como se pagamento deu ok” e guardar um `paymentReference` simples.

Se fizeres `payments`:
Campos:
- `id`, `bookingId`, `status (INITIATED/PAID/FAILED/REFUNDED)`, `provider`, `providerRef`, `createdAt`
Índices:
- `unique(provider, providerRef)` (idempotência externa)

---

## Checklist de migrations
- cria schema inicial (users/listings/availability_blocks/bookings)
- cria índices e checks (principalmente datas)
- valida FK cascade (normalmente `RESTRICT` em bookings; `CASCADE` só onde fizer sentido)
