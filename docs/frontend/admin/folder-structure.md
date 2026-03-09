# Admin Frontend Folder Structure

```text
frontend/
  app/
    layout.tsx
    page.tsx
    (public)/
      auth/
        login/page.tsx
        signup/page.tsx
    (private)/
      admin/
        dashboard/page.tsx
        listings/
          page.tsx
          new/page.tsx
          [id]/edit/page.tsx
        bookings/page.tsx
      listings/
        [id]/page.tsx

  components/
    app-sidebar.tsx
    nav-main.tsx
    mode-toggle.tsx
    listing-form.tsx
    availability-block-form-dialog.tsx
    admin/
      dashboard/
        booking-trend-card.tsx
        revenue-trend-card.tsx
        summary-cards.tsx
        bookings-panels.tsx
        types.ts
        utils.ts
    ui/
      *

  hooks/
    use-auth.ts
    use-listings.ts
    use-bookings.ts
    use-availability-blocks.ts

  lib/
    api/
      client.ts
      auth.ts
      listings.ts
      bookings.ts
      availability-blocks.ts
    schemas/
      auth.schema.ts
      listing.schema.ts
      availability-block.schema.ts

  providers/
    react-query-provider.tsx

  stores/
    auth-store.ts

  proxy.ts
```

## Conventions
- Public auth pages live in `app/(public)/auth/*`.
- Protected pages live in `app/(private)/*` and are gated by `proxy.ts`.
- Admin navigation entry points are under `/admin/*`.
- Listing details are served from `/listings/[id]` and include availability block management.
- Domain hooks wrap API modules and keep UI components focused on rendering.
