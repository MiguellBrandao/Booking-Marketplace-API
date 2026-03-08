# Estrutura de Pastas - Client Side

```text
frontend/
  app/
    (public)/
      page.tsx
      listings/
        page.tsx
        [id]/page.tsx
      auth/
        login/page.tsx
        signup/page.tsx
    (private)/
      my/
        bookings/page.tsx
        listings/
          page.tsx
          new/page.tsx
          [id]/edit/page.tsx
      account/
        profile/page.tsx

  components/
    public/
    booking/
    listing/
    forms/
    ui/

  hooks/
    use-public-listings.ts
    use-my-bookings.ts
    use-my-listings.ts

  lib/
    api/
      public-listings.ts
      bookings.ts
      my-listings.ts
      auth.ts

  stores/
    auth-store.ts
    booking-flow-store.ts
```

## Convencoes
- rotas abertas em `app/(public)/*`
- area autenticada em `app/(private)/*`
- `auth` dentro de `(public)`
