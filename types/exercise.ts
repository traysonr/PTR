export type BodyArea =
  | 'neck'
  | 'upper_back'
  | 'lower_back'
  | 'shoulder'
  | 'hip'
  | 'knee'
  | 'ankle'
  | 'wrist'
  | 'elbow'
  | 'core';

export type Intensity = 'low' | 'medium' | 'high';

export type Goal =
  | 'pain_management'
  | 'strength'
  | 'mobility'
  | 'posture'
  | 'endurance';

export type Equipment =
  | 'none'
  | 'dumbbells'
  | 'exercise_ball'
  | 'resistance_band'
  | 'chair'
  | 'step'
  | 'foam_roll';

export interface Exercise {
  id: string;
  name: string;
  description: string;
  bodyAreas: BodyArea[];
  intensity: Intensity;
  goals: Goal[];
  equipment: Equipment[];
  reps?: string;
  holdTime?: string;
  sets?: string;
  timeToComplete?: string;
  notes?: string;
  progressions?: string[]; // ids of harder variations
  regressions?: string[]; // ids of easier variations
}

