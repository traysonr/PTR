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

  // Pattern templates for how exercises are performed within a day.
  // Indexes refer to positions in the day's unique exercise list.
  const patternsByCount: Record<number, number[][]> = {
    // 2 exercises → ABABAB
    2: [[0, 1, 0, 1, 0, 1]],
    // 3 exercises → ABCABC
    3: [[0, 1, 2, 0, 1, 2]],
    // 4 exercises → AABBCCDD
    4: [[0, 0, 1, 1, 2, 2, 3, 3]],
  };

  for (const dayIndex of trainingDays) {
    let dayMinutes = 0;

    // Calculate remaining minutes needed to reach weekly target
    const remainingWeeklyMinutes = targetWeeklyMinutes - totalWeeklyMinutesSoFar;
    const remainingDays = trainingDays.length - trainingDays.indexOf(dayIndex);
    const targetForThisDay = remainingDays > 0 
      ? Math.min(Math.ceil(remainingWeeklyMinutes / remainingDays), maxPerDayMinutes)
      : Math.min(idealMinutesPerDay, maxPerDayMinutes);

    // Decide how many unique exercises this day will use (2–4),
    // based on remaining available exercises.
    const availableExercises = selectedExercises.length - exerciseIndex;
    const possibleSizes = [2, 3, 4].filter(
      (size) => size <= availableExercises && size <= maxExercisesPerDay
    );
    const groupSize =
      possibleSizes.length > 0
        ? possibleSizes[Math.floor(Math.random() * possibleSizes.length)]
        : Math.min(maxExercisesPerDay, Math.max(minExercisesPerDay, availableExercises || minExercisesPerDay));

    // Pick that many unique exercises for this day
    const dayExercises: Exercise[] = [];
    for (let i = 0; i < groupSize && exerciseIndex < selectedExercises.length; i++, exerciseIndex++) {
      dayExercises.push(selectedExercises[exerciseIndex]);
    }

    // If we still have fewer than the minimum, re-use earlier candidates
    let reuseIndex = 0;
    while (dayExercises.length < minExercisesPerDay && dayExercises.length < maxExercisesPerDay) {
      const candidate = selectedExercises[reuseIndex % selectedExercises.length];
      if (!dayExercises.includes(candidate)) {
        dayExercises.push(candidate);
      }
      reuseIndex++;
    }

    const uniqueCount = dayExercises.length;

    // Build the in-day pattern sequence (e.g., ABABAB, ABCABC, AABBCCDD)
    let scheduledExercises: Exercise[] = [...dayExercises];

    if (uniqueCount >= 2 && patternsByCount[uniqueCount]) {
      const templates = patternsByCount[uniqueCount];
      const baseTemplate = templates[Math.floor(Math.random() * templates.length)];

      const sequence: Exercise[] = [];
      let seqMinutes = 0;

      // Repeat the base pattern as many times as we can without exceeding
      // the daily cap too much, aiming for the target minutes.
      outer: while (true) {
        for (const idx of baseTemplate) {
          const ex = dayExercises[idx];
          const minutes = estimateExerciseMinutes(ex);
          if (seqMinutes + minutes > maxPerDayMinutes * 1.1) {
            break outer;
          }
          sequence.push(ex);
          seqMinutes += minutes;
        }

        // Stop if we've reached or are close to the target for this day
        if (seqMinutes >= targetForThisDay * 0.9) {
          break;
        }
      }

      if (sequence.length > 0) {
        scheduledExercises = sequence;
        dayMinutes = seqMinutes;
      } else {
        // Fallback: single pass of unique exercises
        const fallback: Exercise[] = [];
        let fbMinutes = 0;
        for (const ex of dayExercises) {
          const minutes = estimateExerciseMinutes(ex);
          if (fbMinutes + minutes > maxPerDayMinutes * 1.1) break;
          fallback.push(ex);
          fbMinutes += minutes;
        }
        if (fallback.length > 0) {
          scheduledExercises = fallback;
          dayMinutes = fbMinutes;
        }
      }
    }

    totalWeeklyMinutesSoFar += dayMinutes;

    // Create slots for this day based on the pattern sequence
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

