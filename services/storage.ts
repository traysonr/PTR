import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserProfile, ScheduledSession } from '@/types';

// Storage Keys
const STORAGE_KEYS = {
  PROFILE: '@ptr:profile',
  SCHEDULED_SESSIONS: '@ptr:scheduled_sessions',
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

