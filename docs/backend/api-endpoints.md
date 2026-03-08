# API Endpoints (estado atual do codigo)

## Observacoes gerais
- Base URL: sem prefixo global
- Swagger: `GET /docs`
- Autenticacao: Bearer token em rotas protegidas

## Health
- `GET /health`

## Auth
- `POST /auth/signup`
  - body: `email`, `password`, `name`a
  - resposta: `accessToken`, `refreshToken`
- `POST /auth/signin`
  - body: `email`, `password`
  - resposta: `accessToken`, `refreshToken`
- `POST /auth/refresh`
  - body: `refreshToken`
  - resposta: novo `accessToken`, novo `refreshToken`
- `POST /auth/logout` (protegido)
  - resposta: `{ "ok": true }`

## Listings (todas protegidas por AuthGuard)
- `GET /listings/`
  - query opcional: `city`, `minPrice`, `maxPrice`, `page`, `limit`
- `GET /listings/my`
- `GET /listings/:id`
- `POST /listings/`
  - body: `title`, `description`, `city`, `pricePerNight`, `currency`, `status`
- `PATCH /listings/:id`
  - body parcial com campos editaveis

## Availability Blocks (todas protegidas por AuthGuard)
- `GET /availabilityblocks/`
  - query: `listingId` (obrigatorio), `startDate?`, `endDate?`
- `POST /availabilityblocks/`
  - body: `listingId`, `startDate`, `endDate`, `reason`
- `PATCH /availabilityblocks/:id`
  - body parcial: `startDate?`, `endDate?`, `reason?`
- `DELETE /availabilityblocks/:id`

## Bookings (todas protegidas por AuthGuard)
- `GET /bookings/`
  - visivel apenas para o owner dos listings
  - query opcional: `search` (id do booking, status, nome/email do guest, titulo/cidade do listing)
- `POST /bookings/`
  - body: `listingId`, `startDate`, `endDate`, `currency`
  - cria booking em `pending`
- `PATCH /bookings/confirm`
  - body: `id`
  - confirma booking com transacao + lock
  - resposta: `{ "ok": true }`
- `PATCH /bookings/cancel`
  - body: `id`, `reason?`
  - cancela booking do proprio guest

## Erros de dominio comuns
- `400`: payload invalido
- `401`: token ausente/invalido
- `403`: sem permissao
- `404`: recurso nao encontrado
- `409`: conflito de estado ou periodo
- `410`: booking expirado na confirmacao

## Validacao de concorrencia
A confirmacao usa:
1. lock pessimista no booking
2. lock pessimista no listing
3. checagem de overlap contra bookings `confirmed`
4. commit apenas se nao houver conflito
