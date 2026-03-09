# Bibliotecas e Exemplos (Frontend)

## Instalar bibliotecas obrigatorias
```bash
pnpm --filter @booking-marketplace/frontend add zod react-hook-form @hookform/resolvers @tanstack/react-query zustand date-fns
```

## 1) Zod + React Hook Form
Exemplo de schema e formulario de login:

```tsx
// lib/schemas/auth.schema.ts
import { z } from "zod";

export const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
});

export type LoginInput = z.infer<typeof loginSchema>;
```

```tsx
// components/forms/login-form.tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginInput } from "@/lib/schemas/auth.schema";

export function LoginForm() {
  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  return (
    <form onSubmit={form.handleSubmit((data) => console.log(data))}>
      <input {...form.register("email")} placeholder="Email" />
      <input {...form.register("password")} type="password" placeholder="Password" />
      <button type="submit">Entrar</button>
    </form>
  );
}
```

## 2) React Query
Provider no App Router:

```tsx
// providers/react-query-provider.tsx
"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

export function ReactQueryProvider({ children }: { children: React.ReactNode }) {
  const [client] = useState(() => new QueryClient());
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
```

```tsx
// app/layout.tsx (trecho)
import { ReactQueryProvider } from "@/providers/react-query-provider";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <ReactQueryProvider>{children}</ReactQueryProvider>
      </body>
    </html>
  );
}
```

## 3) Zustand
Store global para auth:

```ts
// stores/auth-store.ts
import { create } from "zustand";

type AuthState = {
  accessToken: string | null;
  setAccessToken: (token: string | null) => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  setAccessToken: (token) => set({ accessToken: token }),
}));
```

## 4) date-fns
Formatacao de datas de booking:

```ts
import { format } from "date-fns";

export function formatBookingDate(value: string | Date) {
  return format(new Date(value), "dd/MM/yyyy HH:mm");
}
```

## 5) Exemplo de hook com React Query

```ts
// hooks/use-listings.ts
import { useQuery } from "@tanstack/react-query";

async function fetchListings() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/listings/`, {
    headers: {
      Authorization: `Bearer TOKEN_AQUI`,
    },
  });

  if (!res.ok) throw new Error("Falha ao carregar listings");
  return res.json();
}

export function useListings() {
  return useQuery({
    queryKey: ["listings"],
    queryFn: fetchListings,
  });
}
```

## Bibliotecas opcionais recomendadas
- `axios` (cliente HTTP)
- `@tanstack/react-query-devtools` (inspecao de cache)
- `sonner` (toasts)
- `next-themes` (tema)
