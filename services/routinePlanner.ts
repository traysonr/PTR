import { EXERCISES } from '@/data/exercises';
import { UserProfile } from '@/types';
import { BodyArea, Equipment, Exercise, Intensity } from '@/types/exercise';
import { Routine, RoutineExerciseSlot } from '@/types/routine';

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
 * Bodyweight exercises (equipment: ['none']) are always allowed regardless of user equipment
 */
function isEquipmentCompatible(exercise: Exercise, userEquipment: Equipment[]): boolean {
  // Bodyweight exercises (only 'none') are always allowed
  const requiresOnlyBodyweight =
    exercise.equipment.length === 1 && exercise.equipment[0] === 'none';
  
  if (requiresOnlyBodyweight) {
    return true;
  }
  
  // For exercises requiring equipment, check if user has at least one compatible item
  return exercise.equipment.some((eq) => userEquipment.includes(eq));
}

/**
 * Checks if exercise intensity matches user's preferred intensity
 * Allows some tolerance: if user prefers 'medium', also consider 'low' and 'high' if needed
 */
function isIntensityCompatible(exercise: Exercise, userIntensity: Intensity): boolean {
  // Prefer exact match
  if (exercise.intensity === userIntensity) {
    return true;
  }
  
  // Allow tolerance: if user prefers medium, also allow low/high
  // This ensures we have enough exercises to meet time targets
  const intensityOrder: Intensity[] = ['low', 'medium', 'high'];
  const exerciseLevel = intensityOrder.indexOf(exercise.intensity);
  const userLevel = intensityOrder.indexOf(userIntensity);
  
  // Allow adjacent levels (within 1 step)
  return Math.abs(exerciseLevel - userLevel) <= 1;
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
    // Intensity must be compatible
    if (!isIntensityCompatible(exercise, profile.intensity)) {
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
  // We'll select enough exercises to meet the weekly target (with some buffer for variety)
  const selectedExercises: Exercise[] = [];
  let estimatedTotalMinutes = 0;
  const usedExerciseIds = new Set<string>();

  // Select exercises until we have enough to meet the target
  // Allow up to 30% over target to ensure we have enough variety and can distribute properly
  const maxTotalMinutes = targetWeeklyMinutes * 1.3;
  
  for (const exercise of prioritizedCandidates) {
    if (usedExerciseIds.has(exercise.id)) continue;
    
    const minutes = estimateExerciseMinutes(exercise);
    
    // Add exercise if we haven't exceeded the buffer limit
    if (estimatedTotalMinutes + minutes <= maxTotalMinutes) {
      selectedExercises.push(exercise);
      usedExerciseIds.add(exercise.id);
      estimatedTotalMinutes += minutes;
    }
    
    // Stop if we have enough exercises to meet the target (with some buffer)
    // We need at least enough to fill each day, so aim for targetWeeklyMinutes
    if (estimatedTotalMinutes >= targetWeeklyMinutes) {
      // But continue if we have very few exercises (need variety)
      if (selectedExercises.length >= days * 2) {
        break;
      }
    }
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

  // Calculate target minutes per day to reach weekly target
  const targetMinutesPerDay = Math.floor(targetWeeklyMinutes / days);
  // Allow some flexibility: aim for target, but respect maxPerDayMinutes as hard limit
  const idealMinutesPerDay = Math.min(targetMinutesPerDay, maxPerDayMinutes);

  const slots: RoutineExerciseSlot[] = [];
  let exerciseIndex = 0;
  let slotIdCounter = 1;
  let totalWeeklyMinutesSoFar = 0;

  const maxExercisesPerDay = 4;
  const minExercisesPerDay = 2;
  const maxRepsPerExercise = 4;

  for (const dayIndex of trainingDays) {
    // Calculate remaining minutes needed to reach weekly target
    const remainingWeeklyMinutes = targetWeeklyMinutes - totalWeeklyMinutesSoFar;
    const remainingDays = trainingDays.length - trainingDays.indexOf(dayIndex);
    const targetForThisDay = remainingDays > 0 
      ? Math.min(Math.ceil(remainingWeeklyMinutes / remainingDays), maxPerDayMinutes)
      : Math.min(idealMinutesPerDay, maxPerDayMinutes);

    // Try different combinations of (numExercises, repsPerExercise) to find the best fit
    interface DayConfig {
      exercises: Exercise[];
      reps: number;
      totalMinutes: number;
    }

    let bestConfig: DayConfig | null = null;
    let bestDiff = Infinity;

    // Test combinations: 2-4 unique exercises, 1-4 reps each
    for (let numExercises = minExercisesPerDay; numExercises <= maxExercisesPerDay; numExercises++) {
      // Check if we have enough exercises available
      if (exerciseIndex + numExercises > selectedExercises.length) {
        // Try to fill with available exercises, reusing if needed
        if (exerciseIndex >= selectedExercises.length && selectedExercises.length < numExercises) {
          continue;
        }
      }

      for (let repsPerExercise = 1; repsPerExercise <= maxRepsPerExercise; repsPerExercise++) {
        // Pick exercises for this configuration
        const candidateExercises: Exercise[] = [];
        let tempIndex = exerciseIndex;
        
        for (let i = 0; i < numExercises; i++) {
          if (tempIndex < selectedExercises.length) {
            candidateExercises.push(selectedExercises[tempIndex]);
            tempIndex++;
          } else {
            // Reuse earlier exercises if we run out
            const reuseIdx = i % selectedExercises.length;
            if (!candidateExercises.includes(selectedExercises[reuseIdx])) {
              candidateExercises.push(selectedExercises[reuseIdx]);
            }
          }
        }

        if (candidateExercises.length < minExercisesPerDay) continue;

        // Calculate total time for this configuration
        const totalMinutes = candidateExercises.reduce((sum, ex) => {
          return sum + estimateExerciseMinutes(ex) * repsPerExercise;
        }, 0);

        // Skip if exceeds daily max
        if (totalMinutes > maxPerDayMinutes * 1.1) continue;

        // Calculate how close to target
        const diff = Math.abs(totalMinutes - targetForThisDay);
        
        // Prefer configurations that are closer to target
        // Also slightly prefer fewer exercises (simpler) if difference is similar
        const adjustedDiff = diff + (numExercises * 0.1);
        
        if (adjustedDiff < bestDiff) {
          bestDiff = adjustedDiff;
          bestConfig = {
            exercises: candidateExercises,
            reps: repsPerExercise,
            totalMinutes,
          };
        }
      }
    }

    // Fallback: if no valid config found, use 2 exercises with 1 rep each
    if (!bestConfig) {
      const fallbackExercises: Exercise[] = [];
      for (let i = 0; i < 2 && exerciseIndex + i < selectedExercises.length; i++) {
        fallbackExercises.push(selectedExercises[exerciseIndex + i]);
      }
      if (fallbackExercises.length === 0 && selectedExercises.length > 0) {
        fallbackExercises.push(selectedExercises[0], selectedExercises[Math.min(1, selectedExercises.length - 1)]);
      }
      bestConfig = {
        exercises: fallbackExercises,
        reps: 1,
        totalMinutes: fallbackExercises.reduce((sum, ex) => sum + estimateExerciseMinutes(ex), 0),
      };
    }

    // Update exercise index to mark these as "used"
    exerciseIndex += bestConfig.exercises.length;

    // Generate blocked schedule: AAAA BBBB CCCC DDDD
    const scheduledExercises: Exercise[] = [];
    for (const exercise of bestConfig.exercises) {
      for (let rep = 0; rep < bestConfig.reps; rep++) {
        scheduledExercises.push(exercise);
      }
    }

    const dayMinutes = bestConfig.totalMinutes;
    totalWeeklyMinutesSoFar += dayMinutes;

    // Create slots for this day based on the blocked sequence
    scheduledExercises.forEach((exercise, order) => {
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
  const routineName = areaNames || 'Custom Routine';

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

