import { storageService } from '@/services/storage';
import { Routine, ScheduleStyle, ScheduledSession, WeekPlan } from '@/types';
import { Exercise } from '@/types/exercise';
import { useCallback, useEffect, useState } from 'react';

const parseDate = (value: string): Date => {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
};

export function useWeekPlans() {
  const [weekPlans, setWeekPlans] = useState<WeekPlan[]>([]);
  const [activePlan, setActivePlan] = useState<WeekPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadPlans = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      // Clean up any orphan plans (routine deleted but plan still exists)
      const plans = await storageService.cleanupOrphanWeekPlans();
      const active = await storageService.getActiveWeekPlan();
      setWeekPlans(plans);
      setActivePlan(active);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load week plans'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPlans();
  }, [loadPlans]);

  const createWeekPlan = useCallback(
    async (
      startDate: string,
      scheduleStyle: ScheduleStyle,
      selectedExerciseIds: string[],
      dailyTimeWindow?: { minMinutes: number; maxMinutes: number }
    ): Promise<WeekPlan | null> => {
      try {
        setError(null);

        // Calculate end date (7 days after start)
        const start = parseDate(startDate);
        const end = new Date(start);
        end.setDate(end.getDate() + 6); // 7 days total (0-6 = 7 days)
        const endDate = `${end.getFullYear()}-${String(end.getMonth() + 1).padStart(2, '0')}-${String(end.getDate()).padStart(2, '0')}`;

        const now = new Date().toISOString();
        const plan: WeekPlan = {
          id: `plan-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          startDate,
          endDate,
          scheduleStyle,
          selectedExerciseIds,
          dailyTimeWindow,
          scheduledSessions: [],
          completedSessions: [],
          createdAt: now,
          updatedAt: now,
        };

        await storageService.saveWeekPlan(plan);
        await storageService.setActiveWeekPlan(plan.id);
        setWeekPlans((prev) => [...prev.filter((p) => p.id !== plan.id), plan]);
        setActivePlan(plan);
        return plan;
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to create week plan'));
        return null;
      }
    },
    []
  );

  const updateWeekPlan = useCallback(async (plan: WeekPlan): Promise<boolean> => {
    try {
      setError(null);
      plan.updatedAt = new Date().toISOString();
      await storageService.saveWeekPlan(plan);
      setWeekPlans((prev) => prev.map((p) => (p.id === plan.id ? plan : p)));
      if (plan.id === activePlan?.id) {
        setActivePlan(plan);
      }
      return true;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to update week plan'));
      return false;
    }
  }, [activePlan]);

  const deleteWeekPlan = useCallback(async (planId: string): Promise<boolean> => {
    try {
      setError(null);
      await storageService.deleteWeekPlan(planId);
      setWeekPlans((prev) => prev.filter((p) => p.id !== planId));
      if (planId === activePlan?.id) {
        setActivePlan(null);
      }
      return true;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to delete week plan'));
      return false;
    }
  }, [activePlan]);

  // Auto-populate: Distribute exercises across the week within time constraints
  const autoPopulateSchedule = useCallback(
    (plan: WeekPlan, exercises: Exercise[]): ScheduledSession[] => {
      if (!plan.dailyTimeWindow) {
        // If no time window specified, evenly distribute exercises across days
        const sessions: ScheduledSession[] = [];
        const selectedExercises = exercises.filter((e) => plan.selectedExerciseIds.includes(e.id));
        
        selectedExercises.forEach((exercise, index) => {
          const dayIndex = index % 7;
          const date = parseDate(plan.startDate);
          date.setDate(date.getDate() + dayIndex);
          const dateString = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
          
          sessions.push({
            id: `session-${Date.now()}-${index}`,
            exerciseId: exercise.id,
            date: dateString,
            createdAt: new Date().toISOString(),
          });
        });
        
        return sessions;
      }

      // With time window: distribute exercises to fit within min/max per day
      const sessions: ScheduledSession[] = [];
      const selectedExercises = exercises.filter((e) => plan.selectedExerciseIds.includes(e.id));
      const dailyTotals: { [date: string]: number } = {}; // Track total minutes per day

      // Initialize daily totals
      for (let i = 0; i < 7; i++) {
        const date = parseDate(plan.startDate);
        date.setDate(date.getDate() + i);
        const dateString = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
        dailyTotals[dateString] = 0;
      }

      // Distribute exercises
      selectedExercises.forEach((exercise, index) => {
        // Parse timeToComplete (e.g., "3–5 minutes" or "5–7 minutes")
      const timeMatch = exercise.timeToComplete?.match(/(\d+)/);
      const exerciseDuration = timeMatch ? parseInt(timeMatch[1]) : 5; // Default 5 minutes if not specified

        // Find day with least time that can fit this exercise
        let bestDate: string | null = null;
        let minTime = Infinity;

        for (const dateString in dailyTotals) {
          const currentTotal = dailyTotals[dateString];
          const wouldBeTotal = currentTotal + exerciseDuration;

          // Check if this day can fit the exercise within max window
          if (wouldBeTotal <= plan.dailyTimeWindow!.maxMinutes) {
            if (currentTotal < minTime) {
              minTime = currentTotal;
              bestDate = dateString;
            }
          }
        }

        // If no day can fit, find the day with the least total time
        if (!bestDate) {
          for (const dateString in dailyTotals) {
            if (dailyTotals[dateString] < minTime) {
              minTime = dailyTotals[dateString];
              bestDate = dateString;
            }
          }
        }

        if (bestDate) {
          sessions.push({
            id: `session-${Date.now()}-${index}-${Math.random().toString(36).substr(2, 9)}`,
            exerciseId: exercise.id,
            date: bestDate,
            createdAt: new Date().toISOString(),
          });
          dailyTotals[bestDate] += exerciseDuration;
        }
      });

      return sessions;
    },
    []
  );

  /**
   * Convert a Routine to a WeekPlan
   */
  const createWeekPlanFromRoutine = useCallback(
    async (routine: Routine, startDate: string): Promise<WeekPlan | null> => {
      try {
        setError(null);

        // Calculate end date (7 days after start)
        const start = parseDate(startDate);
        const end = new Date(start);
        end.setDate(end.getDate() + 6); // 7 days total (0-6 = 7 days)
        const endDate = `${end.getFullYear()}-${String(end.getMonth() + 1).padStart(2, '0')}-${String(end.getDate()).padStart(2, '0')}`;

        // Convert routine slots to scheduled sessions
        const scheduledSessions: ScheduledSession[] = routine.slots.map((slot) => {
          const slotDate = new Date(start);
          slotDate.setDate(start.getDate() + slot.dayIndex);
          const dateString = `${slotDate.getFullYear()}-${String(slotDate.getMonth() + 1).padStart(2, '0')}-${String(slotDate.getDate()).padStart(2, '0')}`;

          return {
            id: `session-${slot.id}`,
            exerciseId: slot.exerciseId,
            date: dateString,
            createdAt: new Date().toISOString(),
          };
        });

        const now = new Date().toISOString();
        const plan: WeekPlan = {
          id: `plan-routine-${routine.id}-${Date.now()}`,
          startDate,
          endDate,
          scheduleStyle: 'user-schedule', // Routine-based plans are user-scheduled
          routineId: routine.id,
          selectedExerciseIds: routine.exerciseIds,
          dailyTimeWindow: {
            minMinutes: Math.max(15, routine.maxMinutesPerDay - 10),
            maxMinutes: routine.maxMinutesPerDay,
          },
          scheduledSessions,
          completedSessions: [],
          createdAt: now,
          updatedAt: now,
        };

        await storageService.saveWeekPlan(plan);
        await storageService.setActiveWeekPlan(plan.id);
        setWeekPlans((prev) => [...prev.filter((p) => p.id !== plan.id), plan]);
        setActivePlan(plan);
        return plan;
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to create week plan from routine'));
        return null;
      }
    },
    []
  );

  return {
    weekPlans,
    activePlan,
    loading,
    error,
    createWeekPlan,
    createWeekPlanFromRoutine,
    updateWeekPlan,
    deleteWeekPlan,
    reloadActivePlan: loadPlans,
    autoPopulateSchedule,
  };
}

