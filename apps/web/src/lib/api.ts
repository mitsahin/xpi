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

function token() {
  return localStorage.getItem("xpi_token");
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(init?.headers as Record<string, string>),
  };
  const t = token();
  if (t) headers.Authorization = `Bearer ${t}`;
  const res = await fetch(`${BASE}${path}`, { ...init, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || res.statusText);
  return data as T;
}

export const api = {
  register: (body: {
    email: string;
    password: string;
    displayName: string;
    timezone?: string;
  }) =>
    request<{ token: string; user: AuthUser }>("/auth/register", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  login: (body: { email: string; password: string }) =>
    request<{ token: string; user: AuthUser }>("/auth/login", {
      method: "POST",
      body: JSON.stringify(body),
    }),
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
