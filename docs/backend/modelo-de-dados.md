# Modelo de Dados (estado atual do codigo)

## Tabelas principais

### Users
Campos:
- `id` (PK, int)
- `email` (unique)
- `password`
- `name`
- `hashedRefreshToken` (nullable)
- `createdAt`, `updatedAt`

Relacoes:
- 1:N com `Listings` (`host`)
- 1:N com `Bookings` (`guest`)

### Listings
Campos:
- `id` (PK, int)
- `host` (FK para `Users`)
- `title`
- `description` (nullable)
- `city`
- `pricePerNight`
- `currency`
- `status` (`active` | `inactive`)
- `createdAt`, `updatedAt`

Indices:
- indice em `host`
- indice em `status`

Relacoes:
- 1:N com `AvailabilityBlocks`
- 1:N com `Bookings`

### AvailabilityBlocks
Campos:
- `id` (PK, int)
- `listing` (FK para `Listings`)
- `startDate` (timestamptz)
- `endDate` (timestamptz)
- `reason`
- `createdAt`

Indices:
- indice em `listing`
- indice em `startDate`
- indice em `endDate`

Regra de negocio em service:
- bloqueios nao podem sobrepor para o mesmo listing

### Bookings
Campos:
- `id` (PK, int)
- `listing` (FK para `Listings`)
- `guest` (FK para `Users`)
- `startDate` (timestamptz)
- `endDate` (timestamptz)
- `status` (`pending` | `confirmed` | `cancelled` | `expired`)
- `totalAmount`
- `currency`
- `expiresAt` (timestamptz)
- `canceledAt` (nullable)
- `cancelReason` (nullable)
- `expiredAt` (nullable)
- `createdAt`, `updatedAt`

Indices e constraints:
- indice composto `IDX_bookings_listing_status_period` (`listing`, `status`, `startDate`, `endDate`)
- indice em `listing`
- indice em `guest`
- indice em `status`
- indice em `expiresAt`
- check `startDate < endDate`
- check: se `status = pending`, `expiresAt` deve estar preenchido

## Regras de consistencia
- Overbooking prevenido na confirmacao via transacao + lock pessimista.
- Expiracao de pendentes feita por job com update condicional por status/prazo.
- Datas sao armazenadas em `timestamptz`.
