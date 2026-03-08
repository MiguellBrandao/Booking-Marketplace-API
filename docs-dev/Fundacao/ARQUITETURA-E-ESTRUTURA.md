# Arquitetura e Estrutura do Projeto (guia interno)

## Objetivo da estrutura
- Manter **simples**, mas com separação suficiente para crescer.
- Tornar fácil localizar: **endpoint → use-case → transação/lock → persistência**.
- Evitar “service gigante” e controllers com lógica.

---

## Estrutura de pastas sugerida

```
src/
  app.module.ts
  main.ts

  config/
    env.schema.ts
    configuration.ts

  common/
    auth/
      auth.module.ts
      guards/
      decorators/
      strategies/
      dto/
    errors/
      domain-errors.ts
      http-exception.filter.ts
    database/
      typeorm.config.ts
    observability/
      logger.ts
      request-id.middleware.ts
    utils/

  modules/
    users/
      users.module.ts
      users.controller.ts
      users.service.ts
      entities/
      dto/

    listings/
      listings.module.ts
      controllers/
      dto/
      entities/
      services/
      repositories/

    availability/
      availability.module.ts
      controllers/
      dto/
      entities/
      services/
      repositories/

    bookings/
      bookings.module.ts
      controllers/
      dto/
      entities/
      services/          # use-cases aqui dentro
      repositories/
      jobs/              # processors/queues
      policies/          # cancel policy etc
      domain/            # enums/state machine helpers

    payments/            # opcional (simulação)
      ...

  migrations/
  seeds/
  test/
```

> Dica: se não quiseres separar tanto no começo, mantém `controllers/ dto/ entities/ services/ repositories/` por módulo. O importante é a disciplina.

---

## Convenções (para não virar caos)

### Controllers
- Só: validação de input (DTO), auth/roles, chamar use-case/service.
- Nada de “if/else de domínio” em controller.

### Services (use-cases)
- Um service por caso de uso importante:
  - `CreateBookingService`
  - `ConfirmBookingService`
  - `CancelBookingService`
  - `ExpirePendingBookingsService` (job)
- Aqui entra a **transação/lock** quando for necessário.

### Repositories
- Se usares TypeORM Repository diretamente, ok.
- Quando começar a ficar complexo, cria “repositórios” com métodos claros:
  - `findConflictingConfirmedBookings(listingId, start, end, runner?)`
  - `lockListingRow(listingId, runner)` (quando fizer sentido)

### DTOs
- `CreateBookingDto`, `ConfirmBookingDto`, `UpdateListingDto`, etc.
- Sempre `class-validator`, e converte datas para `Date` num pipe (ou valida como ISO string e converte no service).

### Domain helpers
- Enum de estados:
  - `BookingStatus = PENDING | CONFIRMED | CANCELED | EXPIRED`
- Funções puras:
  - `assertTransition(from, to)`
  - `isOverlapping(aStart, aEnd, bStart, bEnd)` (não confies só no app; a verdade final vem do DB)

---

## Como o fluxo deveria parecer (mental model)
**Request → Controller → Use-case(Service) → Transaction/Lock (se necessário) → Repository → DB → Response**

Exemplo: Confirmar booking
1) Controller: valida token, chama `ConfirmBookingService`
2) Service:
   - abre transação (QueryRunner)
   - lock no que precisa (ex.: listing + booking row)
   - verifica conflito
   - atualiza status para `CONFIRMED`
   - commita
3) Publica job/evento (assíncrono) depois do commit

---

## Transações no TypeORM (padrão recomendado)
- Para qualquer operação crítica (confirmar/cancelar com impacto em consistência), usa `QueryRunner`.
- Evita misturar `repository.save()` fora do runner dentro da mesma operação crítica.

Pseudo-padrão (para te guiar):
- `const runner = dataSource.createQueryRunner()`
- `await runner.connect()`
- `await runner.startTransaction()`
- faz tudo com `runner.manager`
- `await runner.commitTransaction()`
- `await runner.rollbackTransaction()` em erro
- `await runner.release()` no finally

---

## Observabilidade mínima (vale muito)
- `request-id` middleware: gera e injeta um ID por request.
- Logger estruturado (pino/winston) com `requestId`, `userId`, `listingId`.

---

## Padrões de endpoints (consistência)
- `GET /listings` com paginação `?page=1&limit=20`
- `GET /listings/:id`
- `POST /listings`
- `POST /bookings`
- `POST /bookings/:id/confirm`
- `POST /bookings/:id/cancel`
- `GET /bookings/my` (do guest)
- `GET /host/bookings` (do host)

---

## “Do’s and Don’ts” rápidos
✅ Do:
- guarda regras importantes no service (use-case)
- migrações sempre
- locks/transações nas transições críticas
- jobs para expiração e notificações

❌ Don’t:
- confiar em “check antes do save” sem lock (vai dar race condition)
- fazer lógica de estado no controller
- usar `synchronize: true` em projetos sérios
