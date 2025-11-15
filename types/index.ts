// User Profile Types
// Note: BodyPart, Goal (old profile goal), Intensity (old profile intensity) are deprecated
// New profile uses BodyArea, ExerciseGoal, ExerciseIntensity from exercise.ts

import { BodyArea, Intensity, Equipment } from './exercise';

export interface UserProfile {
  id: string; // e.g. 'default'
  name: string;
  targetBodyAreas: BodyArea[]; // Use BodyArea from exercise types
  intensityMin: Intensity; // 'low' | 'medium' | 'high'
  intensityMax: Intensity;
  equipmentAccess: Equipment[]; // subset of the Exercise equipment union
  daysPerWeek: number; // e.g. 2–7
  maxMinutesPerDay: number; // e.g. 20, 30, 45
  maxMinutesPerWeek?: number; // optional, default = daysPerWeek * maxMinutesPerDay
  createdAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp
}

// Exercise Types - Re-export from exercise.ts
export { Exercise, BodyArea, Intensity as ExerciseIntensity, Goal as ExerciseGoal, Equipment } from './exercise';

// Routine Types - Re-export from routine.ts
export { Routine, RoutineExerciseSlot } from './routine';

// Scheduled Session Types
export interface ScheduledSession {
  id: string;
  exerciseId: string;
  date: string; // ISO date string (YYYY-MM-DD)
  createdAt: string;
}

// Calendar/Planning Types
export interface DaySchedule {
  date: string; // ISO date string (YYYY-MM-DD)
  exercises: Array<{
    sessionId: string;
    exercise: Exercise;
  }>;
}

// Schedule Style Types
export type ScheduleStyle = 'auto-populate' | 'live-logging' | 'user-schedule';

export interface WeekPlan {
  id: string;
  startDate: string; // ISO date string (YYYY-MM-DD) - first day of the week
  endDate: string; // ISO date string (YYYY-MM-DD) - last day of the week (7 days after start)
  scheduleStyle: ScheduleStyle;
  selectedExerciseIds: string[]; // Exercises selected for this week
  dailyTimeWindow?: {
    minMinutes: number; // Minimum total exercise time per day
    maxMinutes: number; // Maximum total exercise time per day
  };
  scheduledSessions: ScheduledSession[]; // For user-schedule and auto-populate modes
  completedSessions: string[]; // Session IDs that have been completed (for live-logging)
  createdAt: string;
  updatedAt: string;
}

