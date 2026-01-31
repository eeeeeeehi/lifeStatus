export type ISODate = string; // "YYYY-MM-DD"

export type Goal = {
  id: string;
  title: string;
  createdAt: number;
};

export type ActionItem = {
  id: string;
  goalId: string;
  title: string;
  createdAt: number;
};

export type DailyActionLog = {
  id: string;
  date: ISODate;
  actionId: string;
  done: boolean;
  doneAt?: number;
};

export type StatsKey = 
  | "action" 
  | "consistency" 
  | "focus" 
  | "planning" 
  | "selfControl" 
  | "learning" 
  | "social";

export type CharacterState = {
  level: number;
  exp: number;        // total exp
  stats: Record<StatsKey, number>; // 0..100, float allowed
  lastUpdatedAt: number;
};

export type AppState = {
  version: number;
  goal: Goal | null;
  actions: ActionItem[]; // max 3
  logs: DailyActionLog[]; // bounded
  character: CharacterState;
  streak: number; // consecutive days
  seenOnboarding: boolean;
};

// Initial State Factory
export function createInitialState(): AppState {
  return {
    version: 1,
    goal: null,
    actions: [],
    logs: [],
    character: {
      level: 1,
      exp: 0,
      stats: {
        action: 0,
        consistency: 0,
        focus: 0,
        planning: 0,
        selfControl: 0,
        learning: 0,
        social: 0
      },
      lastUpdatedAt: Date.now()
    },
    streak: 0,
    seenOnboarding: false
  };
}
