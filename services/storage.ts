import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserProfile, ScheduledSession, WeekPlan, Routine } from '@/types';

// Storage Keys
const STORAGE_KEYS = {
  PROFILE: '@ptr:profile',
  SCHEDULED_SESSIONS: '@ptr:scheduled_sessions',
  WEEK_PLANS: '@ptr:week_plans',
  ACTIVE_WEEK_PLAN: '@ptr:active_week_plan',
  ROUTINES: '@ptr:routines',
  ACTIVE_ROUTINE_ID: '@ptr:active_routine_id',
  ONBOARDING_COMPLETE: '@ptr:onboarding_complete',
  NOTIFICATIONS_ENABLED: '@ptr:notifications_enabled',
} as const;

// Profile Storage Service
export const storageService = {
  // Profile Operations
  async saveProfile(profile: UserProfile): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
    } catch (error) {
      console.error('Error saving profile:', error);
      throw error;
    }
  },

  async getProfile(): Promise<UserProfile | null> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.PROFILE);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error getting profile:', error);
      return null;
    }
  },

  async deleteProfile(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.PROFILE);
    } catch (error) {
      console.error('Error deleting profile:', error);
      throw error;
    }
  },

  async hasProfile(): Promise<boolean> {
    try {
      const profile = await this.getProfile();
      return profile !== null;
    } catch (error) {
      console.error('Error checking profile:', error);
      return false;
    }
  },

  // Scheduled Sessions Operations
  async saveScheduledSessions(sessions: ScheduledSession[]): Promise<void> {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.SCHEDULED_SESSIONS,
        JSON.stringify(sessions)
      );
    } catch (error) {
      console.error('Error saving scheduled sessions:', error);
      throw error;
    }
  },

  async getScheduledSessions(): Promise<ScheduledSession[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.SCHEDULED_SESSIONS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting scheduled sessions:', error);
      return [];
    }
  },

  async addScheduledSession(session: ScheduledSession): Promise<void> {
    try {
      const sessions = await this.getScheduledSessions();
      sessions.push(session);
      await this.saveScheduledSessions(sessions);
    } catch (error) {
      console.error('Error adding scheduled session:', error);
      throw error;
    }
  },

  async removeScheduledSession(sessionId: string): Promise<void> {
    try {
      const sessions = await this.getScheduledSessions();
      const filtered = sessions.filter((s) => s.id !== sessionId);
      await this.saveScheduledSessions(filtered);
    } catch (error) {
      console.error('Error removing scheduled session:', error);
      throw error;
    }
  },

  async clearAllScheduledSessions(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.SCHEDULED_SESSIONS);
    } catch (error) {
      console.error('Error clearing scheduled sessions:', error);
      throw error;
    }
  },

  // Onboarding Status
  async setOnboardingComplete(complete: boolean): Promise<void> {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.ONBOARDING_COMPLETE,
        JSON.stringify(complete)
      );
    } catch (error) {
      console.error('Error setting onboarding status:', error);
      throw error;
    }
  },

  async getOnboardingComplete(): Promise<boolean> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.ONBOARDING_COMPLETE);
      return data ? JSON.parse(data) : false;
    } catch (error) {
      console.error('Error getting onboarding status:', error);
      return false;
    }
  },

  // Notifications Preference
  async setNotificationsEnabled(enabled: boolean): Promise<void> {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.NOTIFICATIONS_ENABLED,
        JSON.stringify(enabled)
      );
    } catch (error) {
      console.error('Error setting notifications preference:', error);
      throw error;
    }
  },

  async getNotificationsEnabled(): Promise<boolean> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.NOTIFICATIONS_ENABLED);
      if (data === null) return true; // Default to enabled
      return JSON.parse(data);
    } catch (error) {
      console.error('Error getting notifications preference:', error);
      return true;
    }
  },

  // Week Plans Operations
  async saveWeekPlan(weekPlan: WeekPlan): Promise<void> {
    try {
      const plans = await this.getWeekPlans();
      const index = plans.findIndex((p) => p.id === weekPlan.id);
      if (index >= 0) {
        plans[index] = weekPlan;
      } else {
        plans.push(weekPlan);
      }
      await AsyncStorage.setItem(STORAGE_KEYS.WEEK_PLANS, JSON.stringify(plans));
    } catch (error) {
      console.error('Error saving week plan:', error);
      throw error;
    }
  },

  async getWeekPlans(): Promise<WeekPlan[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.WEEK_PLANS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting week plans:', error);
      return [];
    }
  },

  async getWeekPlanById(planId: string): Promise<WeekPlan | null> {
    try {
      const plans = await this.getWeekPlans();
      return plans.find((p) => p.id === planId) || null;
    } catch (error) {
      console.error('Error getting week plan:', error);
      return null;
    }
  },

  async getActiveWeekPlan(): Promise<WeekPlan | null> {
    try {
      const activePlanId = await AsyncStorage.getItem(STORAGE_KEYS.ACTIVE_WEEK_PLAN);
      if (!activePlanId) return null;
      return await this.getWeekPlanById(activePlanId);
    } catch (error) {
      console.error('Error getting active week plan:', error);
      return null;
    }
  },

  async setActiveWeekPlan(planId: string | null): Promise<void> {
    try {
      if (planId) {
        await AsyncStorage.setItem(STORAGE_KEYS.ACTIVE_WEEK_PLAN, planId);
      } else {
        await AsyncStorage.removeItem(STORAGE_KEYS.ACTIVE_WEEK_PLAN);
      }
    } catch (error) {
      console.error('Error setting active week plan:', error);
      throw error;
    }
  },

  async deleteWeekPlan(planId: string): Promise<void> {
    try {
      const plans = await this.getWeekPlans();
      const filtered = plans.filter((p) => p.id !== planId);
      await AsyncStorage.setItem(STORAGE_KEYS.WEEK_PLANS, JSON.stringify(filtered));
      
      // If this was the active plan, clear it
      const activePlanId = await AsyncStorage.getItem(STORAGE_KEYS.ACTIVE_WEEK_PLAN);
      if (activePlanId === planId) {
        await this.setActiveWeekPlan(null);
      }
    } catch (error) {
      console.error('Error deleting week plan:', error);
      throw error;
    }
  },

  // Routines Operations
  async saveRoutine(routine: Routine): Promise<void> {
    try {
      const routines = await this.getRoutines();
      const index = routines.findIndex((r) => r.id === routine.id);
      if (index >= 0) {
        routines[index] = routine;
      } else {
        routines.push(routine);
      }
      await AsyncStorage.setItem(STORAGE_KEYS.ROUTINES, JSON.stringify(routines));
    } catch (error) {
      console.error('Error saving routine:', error);
      throw error;
    }
  },

  async getRoutines(): Promise<Routine[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.ROUTINES);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting routines:', error);
      return [];
    }
  },

  async getRoutineById(routineId: string): Promise<Routine | null> {
    try {
      const routines = await this.getRoutines();
      return routines.find((r) => r.id === routineId) || null;
    } catch (error) {
      console.error('Error getting routine:', error);
      return null;
    }
  },

  async getActiveRoutineId(): Promise<string | null> {
    try {
      const activeId = await AsyncStorage.getItem(STORAGE_KEYS.ACTIVE_ROUTINE_ID);
      return activeId || null;
    } catch (error) {
      console.error('Error getting active routine ID:', error);
      return null;
    }
  },

  async setActiveRoutineId(routineId: string | null): Promise<void> {
    try {
      if (routineId) {
        await AsyncStorage.setItem(STORAGE_KEYS.ACTIVE_ROUTINE_ID, routineId);
      } else {
        await AsyncStorage.removeItem(STORAGE_KEYS.ACTIVE_ROUTINE_ID);
      }
    } catch (error) {
      console.error('Error setting active routine ID:', error);
      throw error;
    }
  },

  async deleteRoutine(routineId: string): Promise<void> {
    try {
      const routines = await this.getRoutines();
      const filtered = routines.filter((r) => r.id !== routineId);
      await AsyncStorage.setItem(STORAGE_KEYS.ROUTINES, JSON.stringify(filtered));

      // If this was the active routine, clear it
      const activeId = await this.getActiveRoutineId();
      if (activeId === routineId) {
        await this.setActiveRoutineId(null);
      }
    } catch (error) {
      console.error('Error deleting routine:', error);
      throw error;
    }
  },

  /**
   * Delete a routine and any week plans created from it (plans with plan.routineId === routineId).
   * This keeps Calendar/Home consistent when a routine is removed.
   */
  async deleteRoutineCascade(
    routineId: string
  ): Promise<{ removedWeekPlanIds: string[]; remainingWeekPlans: WeekPlan[] }> {
    try {
      // Delete routine itself
      await this.deleteRoutine(routineId);

      // Remove associated week plans (calendar schedules) for that routine
      const plans = await this.getWeekPlans();
      // Some older plans may not have routineId populated, but still follow the id format:
      // `plan-routine-${routine.id}-${timestamp}`
      const routinePlanIdPrefix = `plan-routine-${routineId}-`;
      const removed = plans.filter(
        (p) => p.routineId === routineId || p.id.startsWith(routinePlanIdPrefix)
      );
      const remaining = plans.filter(
        (p) => p.routineId !== routineId && !p.id.startsWith(routinePlanIdPrefix)
      );

      if (removed.length > 0) {
        await AsyncStorage.setItem(STORAGE_KEYS.WEEK_PLANS, JSON.stringify(remaining));

        // If the active plan was removed, clear it
        const activePlanId = await AsyncStorage.getItem(STORAGE_KEYS.ACTIVE_WEEK_PLAN);
        if (activePlanId && removed.some((p) => p.id === activePlanId)) {
          await AsyncStorage.removeItem(STORAGE_KEYS.ACTIVE_WEEK_PLAN);
        }
      }

      return { removedWeekPlanIds: removed.map((p) => p.id), remainingWeekPlans: remaining };
    } catch (error) {
      console.error('Error deleting routine cascade:', error);
      throw error;
    }
  },

  /**
   * Remove any week plans that reference routines that no longer exist.
   * This prevents "ghost" calendar schedules after routines are deleted or data gets out of sync.
   */
  async cleanupOrphanWeekPlans(): Promise<WeekPlan[]> {
    try {
      const routines = await this.getRoutines();
      const routineIds = new Set(routines.map((r) => r.id));

      const plans = await this.getWeekPlans();
      const isOrphan = (plan: WeekPlan) => {
        if (plan.routineId) {
          return !routineIds.has(plan.routineId);
        }

        // Heuristic for older routine-based plans missing routineId
        if (plan.id.startsWith('plan-routine-')) {
          const parts = plan.id.split('-');
          // id looks like: plan-routine-<routineId>-<timestamp>
          // routineId itself contains hyphens, so recover by stripping prefix + last segment
          const prefix = 'plan-routine-';
          const withoutPrefix = plan.id.slice(prefix.length); // <routineId>-<timestamp>
          const lastDash = withoutPrefix.lastIndexOf('-');
          if (lastDash > 0) {
            const inferredRoutineId = withoutPrefix.slice(0, lastDash);
            return !routineIds.has(inferredRoutineId);
          }
        }

        return false;
      };

      const remaining = plans.filter((p) => !isOrphan(p));

      if (remaining.length !== plans.length) {
        await AsyncStorage.setItem(STORAGE_KEYS.WEEK_PLANS, JSON.stringify(remaining));

        // Clear active week plan if it no longer exists
        const activePlanId = await AsyncStorage.getItem(STORAGE_KEYS.ACTIVE_WEEK_PLAN);
        if (activePlanId && !remaining.some((p) => p.id === activePlanId)) {
          await AsyncStorage.removeItem(STORAGE_KEYS.ACTIVE_WEEK_PLAN);
        }
      }

      return remaining;
    } catch (error) {
      console.error('Error cleaning up orphan week plans:', error);
      // If cleanup fails, fall back to current state
      return await this.getWeekPlans();
    }
  },

  // Clear all data (useful for development/reset)
  async clearAll(): Promise<void> {
    try {
      await AsyncStorage.multiRemove(Object.values(STORAGE_KEYS));
    } catch (error) {
      console.error('Error clearing all data:', error);
      throw error;
    }
  },
};

/**
 * Reset app to onboarding state - clears all user data and returns to onboarding
 * Developer tool for testing the onboarding flow
 */
export async function resetAppForOnboarding(): Promise<void> {
  try {
    // Clear everything relevant to onboarding + routines/weekly plans
    await AsyncStorage.multiRemove([
      '@ptr:profile',
      '@ptr:onboarding_complete',
      '@ptr:routines',
      '@ptr:active_routine_id',
      '@ptr:scheduled_sessions',
      '@ptr:week_plans',
      '@ptr:active_week_plan',
      '@ptr:notifications_enabled',
    ]);
  } catch (e) {
    console.error('Failed to reset app for onboarding:', e);
    throw e;
  }
}

