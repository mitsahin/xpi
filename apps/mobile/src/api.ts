import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

function defaultBase() {
  if (process.env.EXPO_PUBLIC_API_URL) return process.env.EXPO_PUBLIC_API_URL;
  // Android emulator reaches host machine via 10.0.2.2
  if (Platform.OS === "android") return "http://10.0.2.2:4000";
  return "http://localhost:4000";
}

const BASE = defaultBase();

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

export type LessonSessionState = {
  sessionId: string;
  lessonId: string;
  status: string;
  currentIndex: number;
  totalQuestions: number;
  heartsRemaining: number;
  correctCount: number;
  incorrectCount: number;
  question?: {
    id: string;
    type: QuestionType;
    prompt: string;
    options?: string[] | null;
    pairs?: { left: string[]; right: string[] } | null;
    speakText?: string | null;
    locale?: string | null;
    hint?: string | null;
  } | null;
};

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(init?.headers as Record<string, string>),
  };
  const t = await AsyncStorage.getItem("xpi_token");
  if (t) headers.Authorization = `Bearer ${t}`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 20_000);
  try {
    const res = await fetch(`${BASE}${path}`, {
      ...init,
      headers,
      signal: controller.signal,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || res.statusText);
    return data as T;
  } catch (e) {
    if (e instanceof Error && e.name === "AbortError") {
      throw new Error("Request timed out");
    }
    throw e;
  } finally {
    clearTimeout(timer);
  }
}

export type AuthTokens = {
  accessToken?: string;
  refreshToken?: string;
  /** @deprecated alias of accessToken */
  token: string;
  user: AuthUser;
};

export const api = {
  login: (body: { email: string; password: string }) =>
    request<AuthTokens>("/auth/login", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  register: (body: {
    email: string;
    password: string;
    displayName: string;
    timezone?: string;
  }) =>
    request<AuthTokens>("/auth/register", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  refresh: (refreshToken: string) =>
    request<AuthTokens>("/auth/refresh", {
      method: "POST",
      body: JSON.stringify({ refreshToken }),
    }),
  me: () => request<{ user: AuthUser }>("/auth/me"),
  stats: () =>
    request<{
      user: AuthUser;
      streak: {
        currentStreak: number;
        longestStreak: number;
        todayXp: number;
        dailyXpGoal: number;
        goalMet: boolean;
        freezesAvailable: number;
        freezesUsed: number;
      };
    }>("/me/stats"),
  lessons: () => request<{ lessons: PublicLesson[] }>("/lessons"),
  startLesson: (id: string, opts?: { forceNew?: boolean }) =>
    request<{ session: LessonSessionState; resumed: boolean }>(
      `/lessons/${id}/start`,
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
      heartsRemaining: number;
      sessionComplete: boolean;
      xpEarned?: number;
      leveledUp?: boolean;
      newLevel?: number;
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
        pairs?: { left: string[]; right: string[] } | null;
        speakText?: string | null;
        locale?: string | null;
        hint?: string | null;
      }>;
    }>("/me/reviews"),
  answerReview: (
    cardId: string,
    body: { answer: unknown; responseMs?: number }
  ) =>
    request<{
      correct: boolean;
      expected?: string | string[] | Record<string, string>;
      xpEarned?: number;
    }>(`/me/reviews/${cardId}/answer`, {
      method: "POST",
      body: JSON.stringify(body),
    }),
};
