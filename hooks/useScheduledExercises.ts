import exercisesData from '@/data/exercises.json';
import { storageService } from '@/services/storage';
import { DaySchedule, Exercise, ScheduledSession } from '@/types';
import { useCallback, useEffect, useState } from 'react';

// Load exercises from seed data
const exercises: Exercise[] = exercisesData as Exercise[];

export function useScheduledExercises() {
  const [sessions, setSessions] = useState<ScheduledSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Load sessions on mount
  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await storageService.getScheduledSessions();
      setSessions(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load sessions'));
    } finally {
      setLoading(false);
    }
  }, []);

  const addSession = useCallback(async (exerciseId: string, date: string) => {
    try {
      setError(null);
      const newSession: ScheduledSession = {
        id: `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        exerciseId,
        date,
        createdAt: new Date().toISOString(),
      };
      
      await storageService.addScheduledSession(newSession);
      setSessions((prev) => [...prev, newSession]);
      return newSession;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to add session'));
      return null;
    }
  }, []);

  const removeSession = useCallback(async (sessionId: string) => {
    try {
      setError(null);
      await storageService.removeScheduledSession(sessionId);
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to remove session'));
      return false;
    }
  }, []);

  const clearAllSessions = useCallback(async () => {
    try {
      setError(null);
      await storageService.clearAllScheduledSessions();
      setSessions([]);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to clear sessions'));
      return false;
    }
  }, []);

  // Get exercise by ID
  const getExerciseById = useCallback((exerciseId: string): Exercise | undefined => {
    return exercises.find((e) => e.id === exerciseId);
  }, []);

  // Get sessions for a specific date
  const getSessionsForDate = useCallback(
    (date: string): Array<{ session: ScheduledSession; exercise: Exercise }> => {
      return sessions
        .filter((s) => s.date === date)
        .map((session) => ({
          session,
          exercise: getExerciseById(session.exerciseId)!,
        }))
        .filter((item) => item.exercise !== undefined);
    },
    [sessions, getExerciseById]
  );

  // Get today's sessions (in local timezone)
  const getTodaySessions = useCallback((): Array<{ session: ScheduledSession; exercise: Exercise }> => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const todayString = `${year}-${month}-${day}`;
    return getSessionsForDate(todayString);
  }, [getSessionsForDate]);

  // Get all exercises
  const getAllExercises = useCallback((): Exercise[] => {
    return exercises;
  }, []);

  // Check if a date is within the 3-week planning window
  const isDateWithinPlanningWindow = useCallback((date: string): boolean => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const threeWeeksFromNow = new Date();
    threeWeeksFromNow.setDate(threeWeeksFromNow.getDate() + 21);
    
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);
    
    return targetDate >= today && targetDate <= threeWeeksFromNow;
  }, []);

  // Get weekly overview (sessions grouped by week, in local timezone)
  const getWeeklyOverview = useCallback((): DaySchedule[] => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const weeks: DaySchedule[] = [];
    
    for (let weekOffset = 0; weekOffset < 3; weekOffset++) {
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() + weekOffset * 7);
      weekStart.setHours(0, 0, 0, 0);
      
      for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
        const date = new Date(weekStart);
        date.setDate(weekStart.getDate() + dayOffset);
        // Format in local timezone
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const dateString = `${year}-${month}-${day}`;
        
        const dateSessions = getSessionsForDate(dateString);
        if (dateSessions.length > 0) {
          weeks.push({
            date: dateString,
            exercises: dateSessions.map((item) => ({
              sessionId: item.session.id,
              exercise: item.exercise,
            })),
          });
        }
      }
    }
    
    return weeks;
  }, [getSessionsForDate]);

  return {
    sessions,
    loading,
    error,
    addSession,
    removeSession,
    clearAllSessions,
    reloadSessions: loadSessions,
    getExerciseById,
    getSessionsForDate,
    getTodaySessions,
    getAllExercises,
    isDateWithinPlanningWindow,
    getWeeklyOverview,
  };
}

