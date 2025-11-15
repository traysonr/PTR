import { Exercise, BodyArea, Intensity, Equipment, Goal } from '@/types/exercise';
import { UserProfile } from '@/types';
import { Routine, RoutineExerciseSlot } from '@/types/routine';
import { EXERCISES } from '@/data/exercises';

/**
 * Estimates exercise duration in minutes from timeToComplete string
 */
function estimateExerciseMinutes(exercise: Exercise): number {
  if (exercise.timeToComplete) {
    const match = exercise.timeToComplete.match(/(\d+)/);
    if (match) {
      const num = parseInt(match[1], 10);
      // If range like "3–5 minutes", take the average; otherwise use the number
      const rangeMatch = exercise.timeToComplete.match(/(\d+)[–-](\d+)/);
      if (rangeMatch) {
        const min = parseInt(rangeMatch[1], 10);
        const max = parseInt(rangeMatch[2], 10);
        return Math.round((min + max) / 2);
      }
      return num;
    }
  }
  // Default fallback: 3 minutes per exercise
  return 3;
}

/**
 * Checks if exercise equipment is compatible with user's equipment access
 */
function isEquipmentCompatible(exercise: Exercise, userEquipment: Equipment[]): boolean {
  if (exercise.equipment.length === 0 || exercise.equipment.includes('none')) {
    return true; // Exercise requires no equipment
  }
  // Check if user has at least one of the required equipment
  return exercise.equipment.some((eq) => userEquipment.includes(eq));
}

/**
 * Checks if exercise intensity is within user's range
 */
function isIntensityInRange(exercise: Exercise, min: Intensity, max: Intensity): boolean {
  const intensityOrder: Intensity[] = ['low', 'medium', 'high'];
  const exerciseLevel = intensityOrder.indexOf(exercise.intensity);
  const minLevel = intensityOrder.indexOf(min);
  const maxLevel = intensityOrder.indexOf(max);
  return exerciseLevel >= minLevel && exerciseLevel <= maxLevel;
}

/**
 * Gets primary body area for an exercise (first one, or most relevant)
 */
function getPrimaryBodyArea(exercise: Exercise): BodyArea {
  return exercise.bodyAreas[0] || 'core';
}

/**
 * Checks if exercise body areas intersect with target areas
 */
function matchesBodyAreas(exercise: Exercise, targetAreas: BodyArea[]): boolean {
  return exercise.bodyAreas.some((area) => targetAreas.includes(area));
}

/**
 * Generates a routine from a user profile
 */
export function generateRoutineFromProfile(
  profile: UserProfile,
  allExercises: Exercise[] = EXERCISES
): Routine {
  // Step 1: Filter candidate exercises
  const candidates = allExercises.filter((exercise) => {
    // Body areas must intersect
    if (!matchesBodyAreas(exercise, profile.targetBodyAreas)) {
      return false;
    }
    // Equipment must be compatible
    if (!isEquipmentCompatible(exercise, profile.equipmentAccess)) {
      return false;
    }
    // Intensity must be in range
    if (!isIntensityInRange(exercise, profile.intensityMin, profile.intensityMax)) {
      return false;
    }
    return true;
  });

  if (candidates.length === 0) {
    throw new Error('No exercises match your profile criteria. Please adjust your preferences.');
  }

  // Step 2: Prefer exercises with pain_management and posture goals for upper_back, neck, lower_back
  const priorityAreas: BodyArea[] = ['upper_back', 'neck', 'lower_back'];
  const hasPriorityAreas = profile.targetBodyAreas.some((area) => priorityAreas.includes(area));
  
  const prioritizedCandidates = [...candidates].sort((a, b) => {
    if (!hasPriorityAreas) return 0;
    
    const aHasPriorityGoals = a.goals.some((goal) => ['pain_management', 'posture'].includes(goal));
    const bHasPriorityGoals = b.goals.some((goal) => ['pain_management', 'posture'].includes(goal));
    
    if (aHasPriorityGoals && !bHasPriorityGoals) return -1;
    if (!aHasPriorityGoals && bHasPriorityGoals) return 1;
    return 0;
  });

  // Step 3: Calculate target exercises needed
  const maxPerDayMinutes = profile.maxMinutesPerDay;
  const days = profile.daysPerWeek;
  const targetWeeklyMinutes = profile.maxMinutesPerWeek || days * maxPerDayMinutes;
  
  // Estimate total minutes we need across all exercises
  // We'll select enough exercises to roughly meet the weekly target
  const selectedExercises: Exercise[] = [];
  let estimatedTotalMinutes = 0;
  const usedExerciseIds = new Set<string>();

  for (const exercise of prioritizedCandidates) {
    if (usedExerciseIds.has(exercise.id)) continue;
    
    const minutes = estimateExerciseMinutes(exercise);
    if (estimatedTotalMinutes + minutes <= targetWeeklyMinutes * 1.2) {
      // Allow up to 20% over target to ensure we have enough variety
      selectedExercises.push(exercise);
      usedExerciseIds.add(exercise.id);
      estimatedTotalMinutes += minutes;
    }
    
    // Stop if we have enough exercises for the week
    if (selectedExercises.length >= days * 3) break; // Roughly 3 exercises per day max
    if (estimatedTotalMinutes >= targetWeeklyMinutes) break;
  }

  // Ensure we have at least a few exercises
  if (selectedExercises.length === 0) {
    // Fallback: take top 5-7 exercises
    selectedExercises.push(...prioritizedCandidates.slice(0, Math.max(5, days)));
  }

  // Step 4: Distribute exercises across 7-day template
  // Only schedule on profile.daysPerWeek days, spaced evenly
  const trainingDays: number[] = [];
  const step = Math.floor(7 / days);
  for (let i = 0; i < days; i++) {
    trainingDays.push(i * step);
  }
  // Ensure we don't exceed 7 days
  trainingDays.forEach((day, idx) => {
    if (day >= 7) trainingDays[idx] = 6;
  });

  const slots: RoutineExerciseSlot[] = [];
  let exerciseIndex = 0;
  let slotIdCounter = 1;

  for (const dayIndex of trainingDays) {
    let dayMinutes = 0;
    const dayExercises: Exercise[] = [];
    const dayBodyAreas: BodyArea[] = []; // Track body areas used in this day to avoid back-to-back

    // Try to fill the day up to maxPerDayMinutes
    while (dayMinutes < maxPerDayMinutes && exerciseIndex < selectedExercises.length) {
      // Try to find an exercise that doesn't repeat the last body area
      let nextExercise: Exercise | null = null;
      let nextIndex = exerciseIndex;

      for (let i = exerciseIndex; i < selectedExercises.length; i++) {
        const candidate = selectedExercises[i];
        const candidateMinutes = estimateExerciseMinutes(candidate);
        
        if (dayMinutes + candidateMinutes > maxPerDayMinutes * 1.1) continue; // Don't exceed too much
        
        // Prefer exercises that target different body areas
        const candidatePrimaryArea = getPrimaryBodyArea(candidate);
        const lastArea = dayBodyAreas.length > 0 ? dayBodyAreas[dayBodyAreas.length - 1] : null;
        
        if (!lastArea || candidatePrimaryArea !== lastArea) {
          nextExercise = candidate;
          nextIndex = i;
          break;
        }
      }

      // If no non-repeating exercise found, use the next one anyway
      if (!nextExercise) {
        nextExercise = selectedExercises[exerciseIndex];
        nextIndex = exerciseIndex;
      }

      const minutes = estimateExerciseMinutes(nextExercise);
      if (dayMinutes + minutes <= maxPerDayMinutes * 1.1) {
        dayExercises.push(nextExercise);
        dayMinutes += minutes;
        dayBodyAreas.push(getPrimaryBodyArea(nextExercise));
        
        // Move this exercise to the front and increment index
        [selectedExercises[exerciseIndex], selectedExercises[nextIndex]] = [
          selectedExercises[nextIndex],
          selectedExercises[exerciseIndex],
        ];
        exerciseIndex++;
      } else {
        break; // Can't fit more exercises in this day
      }
    }

    // Create slots for this day
    dayExercises.forEach((exercise, order) => {
      slots.push({
        id: `slot-${slotIdCounter++}`,
        exerciseId: exercise.id,
        dayIndex,
        order,
        estimatedMinutes: estimateExerciseMinutes(exercise),
      });
    });
  }

  // Step 5: Calculate totals
  const totalWeeklyMinutes = slots.reduce((sum, slot) => sum + slot.estimatedMinutes, 0);
  const exerciseIds = [...new Set(slots.map((s) => s.exerciseId))];

  // Step 6: Generate routine name
  const areaNames = profile.targetBodyAreas
    .slice(0, 3)
    .map((area) => {
      const labels: Record<BodyArea, string> = {
        neck: 'Neck',
        upper_back: 'Upper Back',
        lower_back: 'Lower Back',
        shoulder: 'Shoulder',
        hip: 'Hip',
        knee: 'Knee',
        ankle: 'Ankle',
        wrist: 'Wrist',
        elbow: 'Elbow',
        core: 'Core',
      };
      return labels[area];
    })
    .join(' & ');
  const routineName = areaNames ? `${areaNames} – Starter` : 'Custom Routine';

  const now = new Date().toISOString();

  return {
    id: `routine-${Date.now()}`,
    name: routineName,
    description: `Auto-generated routine for ${days} days/week, ${totalWeeklyMinutes} minutes/week`,
    createdAt: now,
    updatedAt: now,
    profileSnapshot: { ...profile },
    exerciseIds,
    slots,
    daysPerWeek: days,
    totalWeeklyMinutes,
    maxMinutesPerDay: maxPerDayMinutes,
  };
}

