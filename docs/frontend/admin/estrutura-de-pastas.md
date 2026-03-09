# Estrutura de Pastas - Admin Side

```text
frontend/
  app/
    (public)/
      auth/
        login/page.tsx
        forgot-password/page.tsx
    (private)/
      dashboard/page.tsx
      listings/
        page.tsx
        new/page.tsx
        [id]/edit/page.tsx
      availability-blocks/
        page.tsx
        new/page.tsx
        [id]/edit/page.tsx
      bookings/
        page.tsx
        [id]/page.tsx

  components/
    admin/
    forms/
    ui/

  hooks/
    use-admin-listings.ts
    use-admin-bookings.ts
    use-admin-availability-blocks.ts

  lib/
    api/
      admin-listings.ts
      admin-bookings.ts
      admin-availability-blocks.ts
      health.ts

  stores/
    auth-store.ts
    filters-store.ts
    ui-store.ts
```

## Convencoes
- autenticacao em `app/(public)/auth/*` (sem `(auth)`)
- paginas internas somente em `app/(private)/*`
- hooks com React Query por dominio funcional
