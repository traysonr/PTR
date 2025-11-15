// User Profile Types
export type BodyPart = 
  | 'neck' 
  | 'lower-back' 
  | 'shoulders' 
  | 'knees' 
  | 'hips' 
  | 'ankles';

export type Goal = 
  | 'pain-reduction' 
  | 'strength' 
  | 'mobility' 
  | 'post-surgery-rehab';

export type Intensity = 'light' | 'moderate' | 'high';

export interface UserProfile {
  id: string;
  name: string;
  painAreas: BodyPart[];
  goals: Goal[];
  preferredIntensity: Intensity;
  createdAt: string;
  updatedAt: string;
}

// Exercise Types - Re-export from exercise.ts
export { Exercise, BodyArea, Intensity as ExerciseIntensity, Goal as ExerciseGoal, Equipment } from './exercise';

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

