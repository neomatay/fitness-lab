/**
 * 全局状态：用户体征信息 + 训练日历 + 主题偏好 + 引导状态
 * Zustand + localStorage 持久化，下次打开免重复输入
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Gender, Goal, TrainLevel, TrainTime } from '../lib/diet';

export type Theme = 'light' | 'dark';

/** 一周七天（0=周日 … 6=周六，与 JS Date.getDay() 一致） */
export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6;
export const WEEKDAY_LABELS = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

export interface Profile {
  gender: Gender;
  heightCm: number;
  weightKg: number;
  age: number;
  goal: Goal;
  trainTime: TrainTime;
  trainLevel: TrainLevel;
}

interface AppState {
  // 主题
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (t: Theme) => void;

  // 首次引导
  isOnboarded: boolean;
  completeOnboarding: () => void;
  resetOnboarding: () => void;

  // 用户体征
  profile: Profile;
  setProfile: (p: Partial<Profile>) => void;

  // 训练日历（哪几天训练）
  trainingDays: Weekday[];
  setTrainingDays: (days: Weekday[]) => void;
  toggleTrainingDay: (day: Weekday) => void;

  // 今日手动切换（覆盖日历判定）：undefined=按日历，true=强制训练日，false=强制休息日
  todayOverride: boolean | undefined;
  setTodayOverride: (v: boolean | undefined) => void;

  // 有氧参数
  cardio: {
    enabled: boolean;
    restHR: number;
    exerciseHR: number;
    weeklyHours: number;
  };
  setCardio: (c: Partial<AppState['cardio']>) => void;

  // 配额手动覆盖
  override: {
    carbPerKg?: number;
    proteinPerKg?: number;
  };
  setOverride: (o: Partial<AppState['override']>) => void;
}

const DEFAULT_PROFILE: Profile = {
  gender: '男',
  heightCm: 175,
  weightKg: 75,
  age: 30,
  goal: '减脂',
  trainTime: '午饭前练',
  trainLevel: '有基础',
};

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      theme: 'dark',
      toggleTheme: () => set((s) => ({ theme: s.theme === 'dark' ? 'light' : 'dark' })),
      setTheme: (theme) => set({ theme }),

      isOnboarded: false,
      completeOnboarding: () => set({ isOnboarded: true }),
      resetOnboarding: () => set({ isOnboarded: false, todayOverride: undefined }),

      profile: DEFAULT_PROFILE,
      setProfile: (p) => set((s) => ({ profile: { ...s.profile, ...p } })),

      // 默认周一/三/五训练
      trainingDays: [1, 3, 5],
      setTrainingDays: (trainingDays) => set({ trainingDays }),
      toggleTrainingDay: (day) =>
        set((s) => ({
          trainingDays: s.trainingDays.includes(day)
            ? s.trainingDays.filter((d) => d !== day)
            : [...s.trainingDays, day],
        })),

      todayOverride: undefined,
      setTodayOverride: (todayOverride) => set({ todayOverride }),

      cardio: {
        enabled: false,
        restHR: 60,
        exerciseHR: 120,
        weeklyHours: 2,
      },
      setCardio: (c) => set((s) => ({ cardio: { ...s.cardio, ...c } })),

      override: {},
      setOverride: (o) => set((s) => ({ override: { ...s.override, ...o } })),
    }),
    {
      name: 'fitness-lab-store',
    },
  ),
);

/** 判定今天是否为训练日：手动覆盖优先，否则按训练日历 */
export function isTrainingDay(state: AppState, now: Date = new Date()): boolean {
  if (state.todayOverride !== undefined) return state.todayOverride;
  if (state.trainingDays.length === 0) return true; // 没设日历 → 默认训练日
  return state.trainingDays.includes(now.getDay() as Weekday);
}
