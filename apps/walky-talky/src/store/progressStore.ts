import { create } from "zustand";
import { persist } from "zustand/middleware";
import { PATH_NODES } from "../data/lessons";

export type NodeStatus = "locked" | "active" | "completed";

type LessonProgress = {
  stars: number;
  completed: boolean;
};

type ProgressState = {
  streak: number;
  level: number;
  xp: number;
  streakFreeze: number;
  lastPracticeDate: string | null;
  activeNodeId: string;
  nodes: Record<string, LessonProgress>;
  completeLesson: (nodeId: string, stars: number) => void;
  addXp: (amount: number) => void;
  useStreakFreeze: () => boolean;
};

const STORAGE_KEY = "walky-talky-progress";

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function bumpStreak(last: string | null, currentStreak: number): number {
  if (!last) return 1;
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const y = yesterday.toISOString().slice(0, 10);
  const t = todayISO();
  if (last === t) return currentStreak;
  if (last === y) return currentStreak + 1;
  return 1;
}

export const useProgressStore = create<ProgressState>()(
  persist(
    (set, get) => ({
      streak: 0,
      level: 1,
      xp: 0,
      streakFreeze: 2,
      lastPracticeDate: null,
      activeNodeId: PATH_NODES[0]?.id ?? "1",
      nodes: {},

      completeLesson: (nodeId: string, stars: number) => {
        set((state) => {
          const newStreak = bumpStreak(state.lastPracticeDate, state.streak);
          const nodes = {
            ...state.nodes,
            [nodeId]: {
              stars: Math.max(state.nodes[nodeId]?.stars ?? 0, stars),
              completed: true,
            },
          };
          const idx = PATH_NODES.findIndex((n) => n.id === nodeId);
          const next = PATH_NODES[idx + 1];
          const xpGain = 10 + stars * 5;
          let level = state.level;
          let xp = state.xp + xpGain;
          while (xp >= level * 50) {
            xp -= level * 50;
            level += 1;
          }
          return {
            nodes,
            streak: newStreak,
            lastPracticeDate: todayISO(),
            activeNodeId: next?.id ?? nodeId,
            level,
            xp,
          };
        });
      },

      addXp: (amount: number) => {
        set((state) => {
          let level = state.level;
          let xp = state.xp + amount;
          while (xp >= level * 50) {
            xp -= level * 50;
            level += 1;
          }
          return { level, xp };
        });
      },

      useStreakFreeze: () => {
        const { streakFreeze } = get();
        if (streakFreeze <= 0) return false;
        set({ streakFreeze: streakFreeze - 1 });
        return true;
      },
    }),
    { name: STORAGE_KEY },
  ),
);

export function resolveNodeStatus(
  nodeId: string,
  nodes: Record<string, LessonProgress>,
): NodeStatus {
  const idx = PATH_NODES.findIndex((n) => n.id === nodeId);
  if (idx < 0) return "locked";
  if (nodes[nodeId]?.completed) return "completed";

  const firstIncompleteIdx = PATH_NODES.findIndex((n) => !nodes[n.id]?.completed);
  if (firstIncompleteIdx < 0) return "completed";
  if (idx === firstIncompleteIdx) return "active";
  if (idx < firstIncompleteIdx) return "completed";
  return "locked";
}
