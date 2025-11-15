import { useState, useEffect, useCallback } from 'react';
import { notificationService } from '@/services/notifications';
import { storageService } from '@/services/storage';
import { ScheduledSession, Exercise } from '@/types';

export function useNotifications() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initializeNotifications();
  }, []);

  const initializeNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const enabled = await storageService.getNotificationsEnabled();
      setNotificationsEnabled(enabled);

      if (enabled) {
        const permission = await notificationService.hasPermissions();
        setHasPermission(permission);
      } else {
        setHasPermission(false);
      }
    } catch (error) {
      console.error('Error initializing notifications:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const requestPermissions = useCallback(async (): Promise<boolean> => {
    try {
      const granted = await notificationService.requestPermissions();
      setHasPermission(granted);
      
      if (granted) {
        await storageService.setNotificationsEnabled(true);
        setNotificationsEnabled(true);
      }
      
      return granted;
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
      return false;
    }
  }, []);

  const enableNotifications = useCallback(async () => {
    try {
      await storageService.setNotificationsEnabled(true);
      setNotificationsEnabled(true);
      const granted = await requestPermissions();
      return granted;
    } catch (error) {
      console.error('Error enabling notifications:', error);
      return false;
    }
  }, [requestPermissions]);

  const disableNotifications = useCallback(async () => {
    try {
      await storageService.setNotificationsEnabled(false);
      setNotificationsEnabled(false);
      await notificationService.cancelAllNotifications();
      return true;
    } catch (error) {
      console.error('Error disabling notifications:', error);
      return false;
    }
  }, []);

  const scheduleSessionNotifications = useCallback(
    async (session: ScheduledSession, exercise: Exercise): Promise<string[]> => {
      if (!notificationsEnabled || !hasPermission) {
        return [];
      }

      try {
        return await notificationService.scheduleSessionNotifications(session, exercise);
      } catch (error) {
        console.error('Error scheduling session notifications:', error);
        return [];
      }
    },
    [notificationsEnabled, hasPermission]
  );

  const rescheduleAllNotifications = useCallback(
    async (sessions: ScheduledSession[], exercises: Exercise[]): Promise<void> => {
      if (!notificationsEnabled || !hasPermission) {
        return;
      }

      try {
        await notificationService.rescheduleAllNotifications(sessions, exercises);
      } catch (error) {
        console.error('Error rescheduling all notifications:', error);
      }
    },
    [notificationsEnabled, hasPermission]
  );

  return {
    hasPermission,
    notificationsEnabled,
    loading,
    requestPermissions,
    enableNotifications,
    disableNotifications,
    scheduleSessionNotifications,
    rescheduleAllNotifications,
    reload: initializeNotifications,
  };
}

