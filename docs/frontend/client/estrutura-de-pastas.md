# Client Frontend Folder Structure

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
      admin/...
      listings/[id]/page.tsx

  components/
    login-form.tsx
    signup-form.tsx
    theme-provider.tsx
    mode-toggle.tsx
    ui/*

  hooks/
    use-auth.ts

  lib/
    api/
      client.ts
      auth.ts
    schemas/
      auth.schema.ts

  stores/
    auth-store.ts

  providers/
    react-query-provider.tsx

  proxy.ts
```

## Conventions
- Public access points are inside `app/(public)/*`.
- Authentication state is managed with Zustand (`auth-store`) and refresh cookie checks.
- The current protected app surface is admin-first; dedicated end-user client modules are not yet separated.
