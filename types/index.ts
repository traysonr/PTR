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

// Exercise Types
export interface Exercise {
  id: string;
  name: string;
  bodyPart: BodyPart;
  goal: Goal[];
  description: string;
  equipment?: string;
  intensity: Intensity;
  duration?: number; // in minutes
  sets?: number;
  reps?: number;
}

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

