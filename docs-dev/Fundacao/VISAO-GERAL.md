# Visão Geral (guia interno)

## Objetivo deste projeto (para teu CV backend)
Construir um **backend de Marketplace de Reservas** (tipo “Airbnb do que quiseres”) que prove domínio em:

- **Concorrência e consistência** (evitar overbooking em cenários reais).
- **Transações + locks no Postgres** (garantias fortes com dados reais).
- **Jobs/Fila** (expirar reservas pendentes, enviar notificações, rotinas).
- **Estados e regras de negócio** (state machine clara e auditável).
- **API com fluxos fáceis de demonstrar** (endpoints que contam a história em entrevista).

> Nota: isto é um guia para ti (Miguel) construíres. Não é documentação pública “bonita”.

---

## Escopo recomendado

### MVP (o que tens de entregar)
1) **Listings**
- criar/listar/editar (host)
- ver detalhes e disponibilidade

2) **Bookings**
- criar reserva (guest) -> fica `PENDING`
- confirmar reserva (simula pagamento ok) -> `CONFIRMED`
- cancelar (guest/host com regras simples) -> `CANCELED`
- expirar automaticamente `PENDING` -> `EXPIRED` (via job)

3) **Disponibilidade**
- bloquear datas indisponíveis (host)
- validar intervalos ao reservar

4) **Concorrência**
- garantir que duas reservas simultâneas **não** confirmam para o mesmo intervalo.

5) **Autenticação**
- JWT + refresh (mínimo)
- roles: `HOST` e `GUEST` (um user pode ser os dois)

### Nice-to-have (só se sobrar tempo)
- chat listing↔booking
- reviews
- search avançado (full-text / geofiltro)
- idempotency keys para “confirm booking”
- observabilidade avançada (tracing, metrics)
- cache (Redis) em endpoints de leitura

---

## Decisões técnicas (sugestão)
- **NestJS** (REST) + **TypeORM** + **Postgres**
- **Redis + BullMQ** para fila (jobs)
- **Docker Compose**: api + postgres + redis
- **class-validator** + DTOs
- **Swagger** via `@nestjs/swagger`
- **Migrations** (TypeORM migrations) — nada de `synchronize`

---

## Conceitos e vocabulário (para não te perderes)
- **Listing**: anúncio (o “produto” reservado).
- **Availability Block**: intervalo bloqueado/indisponível pelo host.
- **Booking**: reserva feita por guest.
- **Hold**: reserva `PENDING` por um tempo curto (ex.: 15 min).
- **Overbooking**: duas reservas confirmadas para o mesmo intervalo.
- **Idempotência**: repetir request sem duplicar efeito (importante em confirmação/pagamento).
- **State machine**: estados + transições válidas (e bloqueios).

---

## Como vais demonstrar isto numa entrevista (storyline rápida)
1) “Tenho listings e bookings com state machine (PENDING/CONFIRMED/CANCELED/EXPIRED).”  
2) “O ponto principal é evitar overbooking: na confirmação uso transação + lock no Postgres.”  
3) “Uso BullMQ para expirar pendentes automaticamente e para tarefas assíncronas.”  
4) “Tenho endpoints simples para demo: criar listing, criar booking, confirmar, simular concorrência.”

---

## Regras de negócio mínimas (para manter simples e forte)
- Um booking nasce `PENDING` com `expiresAt` (ex.: agora + 15 min)
- Só `PENDING` pode virar `CONFIRMED`
- `PENDING` pode virar `EXPIRED` automaticamente por job
- `CONFIRMED` pode virar `CANCELED` (com política simples)
- Não existe `CONFIRMED` se há conflito de datas com outro `CONFIRMED` no mesmo listing

---

## Checklist de qualidade (para repo ficar “currículo-ready”)
- Docker Compose funcional em 1 comando
- migrations + seeds
- testes de integração (inclui teste de concorrência)
- Swagger com exemplos
- CI no GitHub Actions a rodar lint + tests
- README curto (depois) com como correr e como demo
