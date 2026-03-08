export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";
import { useAuthStore } from "@/stores/auth-store";

export async function apiFetch<T>(path: string, init?: RequestInit, withAuth: boolean = false): Promise<T> {
  const accessToken = useAuthStore.getState().accessToken;
  const res = await fetch(`${API_URL}${path}`, {
    credentials: "include",
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
      ...(withAuth && accessToken
        ? { Authorization: `Bearer ${accessToken}` }
        : {}),
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.message ?? "Erro na requisição");
  }

  return res.json() as Promise<T>;
}
