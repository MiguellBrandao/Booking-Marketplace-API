"use client";

import { useMutation } from "@tanstack/react-query";
import { login, LoginPayload, logout, signup, type SignupPayload } from "@/lib/api/auth";

export function useSignup() {
  return useMutation({
    mutationFn: (payload: SignupPayload) => signup(payload),
  });
}

export function useLogin() {
  return useMutation({
    mutationFn: (payload: LoginPayload) => login(payload),
  });
}

export function useLogout() {
  return useMutation({
    mutationFn: () => {
      return logout();
    }
  });
}
