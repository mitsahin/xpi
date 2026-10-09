import { useSyncExternalStore } from "react";
import { SKILLS } from "./data";

const STORAGE_KEY = "walky-talky-state-v1";

export type WalkyState = {
  xp: number;
  level: number;
  streak: number;
  freezeCount: number;
  completedSkillIds: string[];
  lastPlayedDate: string | null;
};

const DEFAULT_STATE: WalkyState = {
  xp: 0,
  level: 1,
  streak: 0,
  freezeCount: 1,
  completedSkillIds: [],
  lastPlayedDate: null,
};

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function levelFromXp(xp: number) {
  return Math.max(1, Math.floor(xp / 100) + 1);
}

function load(): WalkyState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_STATE };
    const parsed = JSON.parse(raw) as Partial<WalkyState>;
    return {
      ...DEFAULT_STATE,
      ...parsed,
      completedSkillIds: Array.isArray(parsed.completedSkillIds)
        ? parsed.completedSkillIds
        : [],
      level: levelFromXp(parsed.xp ?? 0),
    };
  } catch {
    return { ...DEFAULT_STATE };
  }
}

let state = typeof localStorage !== "undefined" ? load() : { ...DEFAULT_STATE };
const listeners = new Set<() => void>();

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* ignore quota */
  }
}

function setState(patch: Partial<WalkyState> | ((s: WalkyState) => WalkyState)) {
  state = typeof patch === "function" ? patch(state) : { ...state, ...patch };
  state.level = levelFromXp(state.xp);
  persist();
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return state;
}

export function useWalkyStore() {
  return useSyncExternalStore(subscribe, getSnapshot, () => DEFAULT_STATE);
}

export function skillStatus(skillId: string, completed: string[]): "locked" | "active" | "completed" {
  if (completed.includes(skillId)) return "completed";
  const idx = SKILLS.findIndex((s) => s.id === skillId);
  if (idx <= 0) return "active";
  const prev = SKILLS[idx - 1];
  return completed.includes(prev.id) ? "active" : "locked";
}

export function completeSkill(skillId: string, xpGain = 25) {
  setState((s) => {
    if (s.completedSkillIds.includes(skillId)) return s;
    const today = todayKey();
    let streak = s.streak;
    if (s.lastPlayedDate !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yKey = yesterday.toISOString().slice(0, 10);
      if (s.lastPlayedDate === yKey) streak += 1;
      else if (s.lastPlayedDate == null) streak = 1;
      else streak = 1;
    }
    return {
      ...s,
      xp: s.xp + xpGain,
      streak,
      lastPlayedDate: today,
      completedSkillIds: [...s.completedSkillIds, skillId],
    };
  });
}

export function awardXp(xpGain: number) {
  setState((s) => {
    const today = todayKey();
    let streak = s.streak;
    if (s.lastPlayedDate !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yKey = yesterday.toISOString().slice(0, 10);
      if (s.lastPlayedDate === yKey || s.lastPlayedDate == null) {
        streak = s.lastPlayedDate == null ? 1 : streak + 1;
      } else {
        streak = 1;
      }
    }
    return {
      ...s,
      xp: s.xp + xpGain,
      streak,
      lastPlayedDate: today,
    };
  });
}

export function useFreeze() {
  setState((s) =>
    s.freezeCount > 0 ? { ...s, freezeCount: s.freezeCount - 1 } : s
  );
}

export function addFreeze(n = 1) {
  setState((s) => ({ ...s, freezeCount: s.freezeCount + n }));
}

export function resetWalkyDemo() {
  setState({ ...DEFAULT_STATE });
}
