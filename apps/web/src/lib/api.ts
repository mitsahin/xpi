import {
  getStoredAccessToken,
  getStoredRefreshToken,
  useAppStore,
} from "../store";

const BASE = import.meta.env.VITE_API_URL || "/api";

export type AuthUser = {
  id: string;
  email: string;
  displayName: string;
  timezone: string;
  xp: number;
  level: number;
  hearts: number;
  dailyXpGoal: number;
};

export type PublicLesson = {
  id: string;
  slug: string;
  title: string;
  description: string;
  unitOrder: number;
  lessonOrder: number;
  xpReward: number;
  estimatedMinutes: number;
  locked: boolean;
  completed: boolean;
  stars: number;
  hasActiveSession?: boolean;
};

export type QuestionType =
  | "MCQ"
  | "FILL_BLANK"
  | "TRANSLATE"
  | "LISTEN"
  | "MATCH";

export type QuestionPayload = {
  id: string;
  type: QuestionType;
  prompt: string;
  options?: string[] | null;
  pairs?: { left: string[]; right: string[] } | null;
  speakText?: string | null;
  locale?: string | null;
  hint?: string | null;
};

export type LessonSessionState = {
  sessionId: string;
  lessonId: string;
  status: string;
  currentIndex: number;
  totalQuestions: number;
  heartsRemaining: number;
  correctCount: number;
  incorrectCount: number;
  question?: QuestionPayload | null;
};

export type StreakSummary = {
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string | null;
  todayXp: number;
  dailyXpGoal: number;
  goalMet: boolean;
  freezesAvailable: number;
  freezesUsed: number;
};

export type TokenPair = {
  accessToken: string;
  refreshToken: string;
  /** @deprecated alias of accessToken */
  token: string;
  expiresIn: number;
  tokenType: "Bearer";
};

export class ApiError extends Error {
  status: number;
  code?: string;
  offline?: boolean;

  constructor(
    message: string,
    opts?: { status?: number; code?: string; offline?: boolean }
  ) {
    super(message);
    this.name = "ApiError";
    this.status = opts?.status ?? 0;
    this.code = opts?.code;
    this.offline = opts?.offline;
  }
}

type AuthResponse = TokenPair & { user: AuthUser };

let refreshInFlight: Promise<boolean> | null = null;

async function tryRefresh(): Promise<boolean> {
  if (refreshInFlight) return refreshInFlight;
  refreshInFlight = (async () => {
    const refreshToken = getStoredRefreshToken();
    if (!refreshToken) return false;
    try {
      const res = await fetch(`${BASE}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
        credentials: "include",
      });
      const data = (await res.json().catch(() => ({}))) as Partial<AuthResponse>;
      if (!res.ok || !data.accessToken) return false;
      useAppStore
        .getState()
        .setTokens(data.accessToken, data.refreshToken ?? refreshToken);
      return true;
    } catch {
      return false;
    } finally {
      refreshInFlight = null;
    }
  })();
  return refreshInFlight;
}

async function request<T>(
  path: string,
  init?: RequestInit,
  opts?: { skipAuthRetry?: boolean }
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(init?.headers as Record<string, string>),
  };
  const t = getStoredAccessToken();
  if (t) headers.Authorization = `Bearer ${t}`;

  let res: Response;
  try {
    res = await fetch(`${BASE}${path}`, {
      ...init,
      headers,
      credentials: "include",
    });
  } catch {
    useAppStore.getState().setApiHealthy(false);
    throw new ApiError(
      "Can't reach the x-pi API. Is it running on :4000?",
      { status: 0, code: "NETWORK", offline: true }
    );
  }

  if (res.status === 401 && !opts?.skipAuthRetry && !path.startsWith("/auth/")) {
    const ok = await tryRefresh();
    if (ok) return request<T>(path, init, { skipAuthRetry: true });
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new ApiError(data.error || res.statusText || "Request failed", {
      status: res.status,
      code: data.code,
    });
  }
  return data as T;
}

export const api = {
  health: async () => {
    try {
      const res = await fetch(`${BASE}/health`, { credentials: "include" });
      const data = await res.json().catch(() => ({}));
      const ok = res.ok && data?.ok === true;
      useAppStore.getState().setApiHealthy(ok);
      return { ok, ...(data as object) } as { ok: boolean; service?: string };
    } catch {
      useAppStore.getState().setApiHealthy(false);
      return { ok: false as const };
    }
  },
  register: (body: {
    email: string;
    password: string;
    displayName: string;
    timezone?: string;
  }) =>
    request<AuthResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  login: (body: { email: string; password: string }) =>
    request<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  refresh: (refreshToken: string) =>
    request<AuthResponse>(
      "/auth/refresh",
      { method: "POST", body: JSON.stringify({ refreshToken }) },
      { skipAuthRetry: true }
    ),
  logout: async () => {
    const refreshToken = getStoredRefreshToken();
    try {
      await request(
        "/auth/logout",
        {
          method: "POST",
          body: JSON.stringify({ refreshToken }),
        },
        { skipAuthRetry: true }
      );
    } catch {
      /* best-effort */
    }
  },
  me: () => request<{ user: AuthUser }>("/auth/me"),
  stats: () =>
    request<{
      user: AuthUser;
      streak: StreakSummary;
      levelProgress: {
        level: number;
        current: number;
        next: number;
        progress: number;
      };
    }>("/me/stats"),
  lessons: () => request<{ lessons: PublicLesson[] }>("/lessons"),
  activeSession: (lessonId: string) =>
    request<{ session: LessonSessionState | null }>(
      `/lessons/${lessonId}/active`
    ),
  startLesson: (lessonId: string, opts?: { forceNew?: boolean }) =>
    request<{ session: LessonSessionState; resumed: boolean }>(
      `/lessons/${lessonId}/start`,
      {
        method: "POST",
        body: JSON.stringify({ forceNew: opts?.forceNew === true }),
      }
    ),
  answer: (
    sessionId: string,
    body: { questionId: string; answer: unknown; responseMs?: number }
  ) =>
    request<{
      correct: boolean;
      expected?: string | string[] | Record<string, string>;
      explanation?: string | null;
      heartsRemaining: number;
      sessionComplete: boolean;
      xpEarned?: number;
      leveledUp?: boolean;
      newLevel?: number;
      streak?: StreakSummary;
      session?: LessonSessionState;
    }>(`/lessons/sessions/${sessionId}/answer`, {
      method: "POST",
      body: JSON.stringify(body),
    }),
  reviews: () =>
    request<{
      reviews: Array<{
        cardId: string;
        prompt: string;
        type: QuestionType;
        options?: string[] | null;
        hint?: string | null;
      }>;
    }>("/me/reviews"),
  answerReview: (
    cardId: string,
    body: { answer: unknown; responseMs?: number }
  ) =>
    request<{
      correct: boolean;
      expected?: string | string[];
      xpEarned?: number;
    }>(`/me/reviews/${cardId}/answer`, {
      method: "POST",
      body: JSON.stringify(body),
    }),
};
