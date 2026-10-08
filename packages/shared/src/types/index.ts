export type QuestionType = "MCQ" | "FILL_BLANK";

export type LessonSessionStatus = "IN_PROGRESS" | "COMPLETED" | "ABANDONED";

export type SrsCardState = "NEW" | "LEARNING" | "REVIEW" | "RELEARNING";

export interface AuthUser {
  id: string;
  email: string;
  displayName: string;
  timezone: string;
  xp: number;
  level: number;
  hearts: number;
  dailyXpGoal: number;
}

export interface PublicLesson {
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
}

export interface QuestionPayload {
  id: string;
  type: QuestionType;
  prompt: string;
  options?: string[] | null;
  hint?: string | null;
}

export interface LessonSessionState {
  sessionId: string;
  lessonId: string;
  status: LessonSessionStatus;
  currentIndex: number;
  totalQuestions: number;
  heartsRemaining: number;
  correctCount: number;
  incorrectCount: number;
  question?: QuestionPayload | null;
}

export interface StreakSummary {
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string | null;
  todayXp: number;
  dailyXpGoal: number;
  goalMet: boolean;
}

export interface AnswerResult {
  correct: boolean;
  expected?: string | string[];
  explanation?: string | null;
  heartsRemaining: number;
  sessionComplete: boolean;
  xpEarned?: number;
  leveledUp?: boolean;
  newLevel?: number;
  streak?: StreakSummary;
  session?: LessonSessionState;
}

export interface DailyQueueItem {
  kind: "LESSON" | "SRS_REVIEW";
  id: string;
  title: string;
  subtitle: string;
  dueAt?: string | null;
  xpReward: number;
}

export interface SrsReviewItem {
  cardId: string;
  prompt: string;
  type: QuestionType;
  options?: string[] | null;
  hint?: string | null;
}
