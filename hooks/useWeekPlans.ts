import { useState, useEffect, useCallback } from 'react';
import { WeekPlan, ScheduleStyle, Exercise, ScheduledSession } from '@/types';
import { storageService } from '@/services/storage';

export function useWeekPlans() {
  const [activePlan, setActivePlan] = useState<WeekPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    loadActivePlan();
  }, []);

  const loadActivePlan = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const plan = await storageService.getActiveWeekPlan();
      setActivePlan(plan);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load week plan'));
    } finally {
      setLoading(false);
    }
  }, []);

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
        const start = new Date(startDate);
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
          const date = new Date(plan.startDate);
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
        const date = new Date(plan.startDate);
        date.setDate(date.getDate() + i);
        const dateString = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
        dailyTotals[dateString] = 0;
      }

      // Distribute exercises
      selectedExercises.forEach((exercise, index) => {
        const exerciseDuration = exercise.duration || 10; // Default 10 minutes if not specified

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

  return {
    activePlan,
    loading,
    error,
    createWeekPlan,
    updateWeekPlan,
    deleteWeekPlan,
    reloadActivePlan: loadActivePlan,
    autoPopulateSchedule,
  };
}

