import { create } from "zustand";
import type { AuthUser, StreakSummary } from "./lib/api";

type AppState = {
  token: string | null;
  user: AuthUser | null;
  streak: StreakSummary | null;
  setAuth: (token: string, user: AuthUser) => void;
  setUser: (user: AuthUser) => void;
  setStreak: (streak: StreakSummary) => void;
  logout: () => void;
};

const saved = localStorage.getItem("xpi_token");

export const useAppStore = create<AppState>((set) => ({
  token: saved,
  user: null,
  streak: null,
  setAuth: (token, user) => {
    localStorage.setItem("xpi_token", token);
    set({ token, user });
  },
  setUser: (user) => set({ user }),
  setStreak: (streak) => set({ streak }),
  logout: () => {
    localStorage.removeItem("xpi_token");
    set({ token: null, user: null, streak: null });
  },
}));
