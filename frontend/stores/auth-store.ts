import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type AuthState = {
  accessToken: string | null;
  setTokens: (tokens: { accessToken: string }) => void;
  clear: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      setTokens: ({ accessToken }) => set({ accessToken }),
      clear: () => set({ accessToken: null }),
    }),
    {
      name: "auth-store",
      storage: createJSONStorage(() => sessionStorage),
    },
  ),
);