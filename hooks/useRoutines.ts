import { useState, useEffect, useCallback } from 'react';
import { Routine } from '@/types';
import { UserProfile } from '@/types';
import { storageService } from '@/services/storage';
import { generateRoutineFromProfile } from '@/services/routinePlanner';
import { useProfile } from './useProfile';

export function useRoutines() {
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [activeRoutine, setActiveRoutine] = useState<Routine | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { profile } = useProfile();

  // Load routines and active routine
  useEffect(() => {
    const loadRoutines = async () => {
      try {
        setIsLoading(true);
        const allRoutines = await storageService.getRoutines();
        setRoutines(allRoutines);

        const activeId = await storageService.getActiveRoutineId();
        if (activeId) {
          const active = allRoutines.find((r) => r.id === activeId) || null;
          setActiveRoutine(active);
        } else {
          setActiveRoutine(null);
        }
      } catch (error) {
        console.error('Error loading routines:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadRoutines();
  }, []);

  const createRoutineFromProfile = useCallback(
    async (profileOverride?: UserProfile): Promise<Routine> => {
      const profileToUse = profileOverride || profile;
      if (!profileToUse) {
        throw new Error('No profile available. Please complete onboarding first.');
      }

      try {
        const routine = generateRoutineFromProfile(profileToUse);
        await storageService.saveRoutine(routine);
        await storageService.setActiveRoutineId(routine.id);

        // Update local state
        setRoutines((prev) => {
          const existing = prev.findIndex((r) => r.id === routine.id);
          if (existing >= 0) {
            const updated = [...prev];
            updated[existing] = routine;
            return updated;
          }
          return [...prev, routine];
        });
        setActiveRoutine(routine);

        return routine;
      } catch (error) {
        console.error('Error creating routine:', error);
        throw error;
      }
    },
    [profile]
  );

  const saveRoutine = useCallback(async (routine: Routine): Promise<void> => {
    try {
      const updatedRoutine = {
        ...routine,
        updatedAt: new Date().toISOString(),
      };
      await storageService.saveRoutine(updatedRoutine);

      // Update local state
      setRoutines((prev) => {
        const index = prev.findIndex((r) => r.id === routine.id);
        if (index >= 0) {
          const updated = [...prev];
          updated[index] = updatedRoutine;
          return updated;
        }
        return [...prev, updatedRoutine];
      });

      // Update active routine if it's the one being saved
      if (activeRoutine?.id === routine.id) {
        setActiveRoutine(updatedRoutine);
      }
    } catch (error) {
      console.error('Error saving routine:', error);
      throw error;
    }
  }, [activeRoutine]);

  const setActiveRoutineId = useCallback(async (id: string | null): Promise<void> => {
    try {
      await storageService.setActiveRoutineId(id);
      if (id) {
        const routine = routines.find((r) => r.id === id) || null;
        setActiveRoutine(routine);
      } else {
        setActiveRoutine(null);
      }
    } catch (error) {
      console.error('Error setting active routine:', error);
      throw error;
    }
  }, [routines]);

  const deleteRoutine = useCallback(async (id: string): Promise<void> => {
    try {
      await storageService.deleteRoutine(id);

      // Update local state
      setRoutines((prev) => prev.filter((r) => r.id !== id));
      if (activeRoutine?.id === id) {
        setActiveRoutine(null);
      }
    } catch (error) {
      console.error('Error deleting routine:', error);
      throw error;
    }
  }, [activeRoutine]);

  return {
    routines,
    activeRoutine,
    isLoading,
    createRoutineFromProfile,
    saveRoutine,
    setActiveRoutine: setActiveRoutineId,
    deleteRoutine,
  };
}

