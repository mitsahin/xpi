import { create } from "zustand";
import type { AuthUser, StreakSummary } from "./lib/api";

const ACCESS_KEY = "walky-talky:token";
const REFRESH_KEY = "walky-talky:refresh";

type AppState = {
  token: string | null;
  refreshToken: string | null;
  user: AuthUser | null;
  streak: StreakSummary | null;
  apiHealthy: boolean | null;
  setAuth: (accessToken: string, user: AuthUser, refreshToken?: string | null) => void;
  setTokens: (accessToken: string, refreshToken?: string | null) => void;
  setUser: (user: AuthUser) => void;
  setStreak: (streak: StreakSummary) => void;
  setApiHealthy: (ok: boolean | null) => void;
  logout: () => void;
};

const savedAccess = localStorage.getItem(ACCESS_KEY);
const savedRefresh = localStorage.getItem(REFRESH_KEY);

export const useAppStore = create<AppState>((set) => ({
  token: savedAccess,
  refreshToken: savedRefresh,
  user: null,
  streak: null,
  apiHealthy: null,
  setAuth: (accessToken, user, refreshToken) => {
    localStorage.setItem(ACCESS_KEY, accessToken);
    if (refreshToken) localStorage.setItem(REFRESH_KEY, refreshToken);
    set({
      token: accessToken,
      user,
      refreshToken: refreshToken ?? localStorage.getItem(REFRESH_KEY),
    });
  },
  setTokens: (accessToken, refreshToken) => {
    localStorage.setItem(ACCESS_KEY, accessToken);
    if (refreshToken) localStorage.setItem(REFRESH_KEY, refreshToken);
    set({
      token: accessToken,
      refreshToken: refreshToken ?? localStorage.getItem(REFRESH_KEY),
    });
  },
  setUser: (user) => set({ user }),
  setStreak: (streak) => set({ streak }),
  setApiHealthy: (ok) => set({ apiHealthy: ok }),
  logout: () => {
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
    set({ token: null, refreshToken: null, user: null, streak: null });
  },
}));

export function getStoredAccessToken() {
  return localStorage.getItem(ACCESS_KEY);
}

export function getStoredRefreshToken() {
  return localStorage.getItem(REFRESH_KEY);
}
