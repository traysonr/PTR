import { useState, useEffect, useCallback } from 'react';
import { UserProfile } from '@/types';
import { storageService } from '@/services/storage';

export function useProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Load profile on mount
  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await storageService.getProfile();
      setProfile(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load profile'));
    } finally {
      setLoading(false);
    }
  }, []);

  const saveProfile = useCallback(async (profileData: UserProfile) => {
    try {
      setError(null);
      await storageService.saveProfile(profileData);
      setProfile(profileData);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to save profile'));
      return false;
    }
  }, []);

  const deleteProfile = useCallback(async () => {
    try {
      setError(null);
      await storageService.deleteProfile();
      setProfile(null);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to delete profile'));
      return false;
    }
  }, []);

  return {
    profile,
    loading,
    error,
    saveProfile,
    deleteProfile,
    reloadProfile: loadProfile,
  };
}

