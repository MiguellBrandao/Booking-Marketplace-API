import { apiFetch } from "@/lib/api/client";

export type AuthResponse = {
  accessToken: string;
};

export type SignupPayload = {
  name: string;
  email: string;
  password: string;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export function signup(payload: SignupPayload) {
  return apiFetch<AuthResponse>("/auth/signup", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function login(payload: LoginPayload) {
  return apiFetch<AuthResponse>("/auth/signin", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function refresh() {
  return apiFetch<AuthResponse>("/auth/refresh", {
    method: "POST",
  });
}

export function logout(accessToken?: string | null) {
  return apiFetch<{ ok: boolean }>("/auth/logout", {
    method: "POST",
    headers: accessToken
      ? {
          Authorization: `Bearer ${accessToken}`,
        }
      : undefined,
  }, true);
}
