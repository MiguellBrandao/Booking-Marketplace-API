# Seed de Teste - Cenário Completo de Bookings

Data de execucao (UTC): 2026-03-09 00:12:00

## Utilizadores ficticios criados
- Host (com listings): Host Demo Listings | host.listings.20260308210636@example.com | password: `HostDemo123!`
- Guest 1: Guest One Demo | guest.one.20260308210636@example.com | password: `GuestOne123!`
- Guest 2: Guest Two Demo | guest.two.20260308210636@example.com | password: `GuestTwo123!`

## Dados criados
- Listings do host:
  - ID 6: Loft Premium Lisboa (Lisbon, EUR 145, active)
  - ID 7: Studio Ribeira Porto (Porto, EUR 95, active)
- Availability blocks (listing 6):
  - ID 3: 2026-04-10T12:00:00.000Z -> 2026-04-12T10:00:00.000Z (Maintenance window)
  - ID 4: 2026-05-01T12:00:00.000Z -> 2026-05-03T10:00:00.000Z (Owner stay)
- Bookings criados:
  - ID 6 (Guest 1) -> confirmado
  - ID 7 (Guest 2) -> cancelado (Guest changed plans)
  - ID 8 (Guest 2) -> pendente
  - ID 9 (Guest 1) -> pendente
  - ID 10 (Guest 1) -> pendente

## Testes executados
- `POST /auth/signup` e `POST /auth/signin` para 3 utilizadores: OK
- `POST /listings` (2 listings) com host: OK
- `POST /availabilityblocks` (2 blocks) com host: OK
- `POST /bookings` com 2 guests: OK
- `PATCH /bookings/confirm` (booking 6): OK
- `PATCH /bookings/cancel` pelo dono da booking (booking 7): OK
- `PATCH /bookings/cancel` por outro guest (booking 8): esperado 403, recebido 403 (OK)
- `GET /bookings` como host: 5 bookings retornados (OK)
- `GET /bookings?search=Guest One`: 3 bookings (OK)
- `GET /bookings?search=confirmed`: 1 booking (OK)
- `GET /bookings` como guest sem listings: 0 bookings (OK)
- Teste de bloqueio de datas (intervalo EXATO do block): esperado 409, recebido 409 (OK)
- Teste de bloqueio de datas (intervalo SOBREPOSTO ao block): esperado 409, recebido 409 (OK)

## Correcao aplicada no backend
- Arquivo alterado: `backend/src/modules/availabilityBlocks/availabilityBlocks.service.ts`
- Ajuste: `findAvailabilityBlocksForBooking` passou a usar regra de sobreposicao de intervalos:
  - `ab.startDate < :endDate`
  - `ab.endDate > :startDate`
- Cobertura adicional:
  - `backend/src/modules/availabilityBlocks/availabilityBlocks.service.spec.ts` ganhou teste para validar a query de sobreposicao.
- Testes automatizados executados:
  - `pnpm --filter @booking-marketplace/backend test -- availabilityBlocks bookings`
  - Resultado: `7/7 suites` e `17/17 testes` a passar.

## Resultado final
- Fluxo validado com sucesso apos correcao.
- Resultado geral: OK.
