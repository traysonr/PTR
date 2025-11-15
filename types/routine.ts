import type { Exercise, BodyArea } from './exercise';
import type { UserProfile } from './index';

export interface RoutineExerciseSlot {
  id: string; // unique per slot
  exerciseId: string; // id from EXERCISES
  dayIndex: number; // 0–6 (0 = consistent weekday index)
  order: number; // position within the day
  estimatedMinutes: number;
}

export interface Routine {
  id: string;
  name: string; // e.g. "Posture & Upper Back – Starter"
  description?: string;
  createdAt: string;
  updatedAt: string;

  profileSnapshot: UserProfile; // copy of profile used to generate this routine
  exerciseIds: string[]; // distinct exercise ids used in this routine
  slots: RoutineExerciseSlot[]; // scheduled placement across the 7-day template

  daysPerWeek: number;
  totalWeeklyMinutes: number;
  maxMinutesPerDay: number;
}

