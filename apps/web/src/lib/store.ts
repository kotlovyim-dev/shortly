import { create } from "zustand";
import type { CurrentUserResponse } from "@/features/auth/types/auth.types";

interface AuthState {
    user: CurrentUserResponse | null;
    setUser: (user: CurrentUserResponse | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    setUser: (user) => set({ user }),
}));
