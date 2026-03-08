# Estrutura de Pastas do Frontend

Estrutura recomendada para evolucao do projeto:

```text
frontend/
  app/
    (public)/
      page.tsx
    (auth)/
      login/page.tsx
      signup/page.tsx
    dashboard/
      page.tsx
    listings/
      page.tsx
      [id]/page.tsx
    bookings/
      page.tsx
    layout.tsx
    globals.css

  components/
    ui/                 # componentes shadcn
    forms/              # formularios com RHF + Zod
    layout/
    bookings/
    listings/

  providers/
    react-query-provider.tsx

  lib/
    api/
      client.ts
      listings.ts
      bookings.ts
      auth.ts
    schemas/
      auth.schema.ts
      booking.schema.ts
    utils.ts

  hooks/
    use-auth.ts
    use-create-booking.ts

  stores/
    auth-store.ts
    booking-store.ts

  types/
    api.ts
```

## Convencoes
- `app/*`: roteamento e paginas (Server Components por padrao).
- `components/forms/*`: formularios com `react-hook-form` + `zodResolver`.
- `lib/api/*`: funcoes de fetch desacopladas da UI.
- `hooks/*`: encapsular `useQuery` e `useMutation`.
- `stores/*`: estado global simples com Zustand.
