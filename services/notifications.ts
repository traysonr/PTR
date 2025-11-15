import * as Notifications from 'expo-notifications';
import { ScheduledSession, Exercise } from '@/types';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export const notificationService = {
  // Request permissions
  async requestPermissions(): Promise<boolean> {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      return finalStatus === 'granted';
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
      return false;
    }
  },

  // Check if permissions are granted
  async hasPermissions(): Promise<boolean> {
    try {
      const { status } = await Notifications.getPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Error checking notification permissions:', error);
      return false;
    }
  },

  // Schedule a notification for a session
  async scheduleSessionNotifications(
    session: ScheduledSession,
    exercise: Exercise
  ): Promise<string[]> {
    const notificationIds: string[] = [];

    try {
      const sessionDate = new Date(session.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      sessionDate.setHours(0, 0, 0, 0);

      // Only schedule if session is in the future and within 3 weeks
      const threeWeeksFromNow = new Date();
      threeWeeksFromNow.setDate(threeWeeksFromNow.getDate() + 21);
      
      if (sessionDate < today || sessionDate > threeWeeksFromNow) {
        return notificationIds;
      }

      // Schedule day-before notification (7pm the day before)
      const dayBefore = new Date(sessionDate);
      dayBefore.setDate(dayBefore.getDate() - 1);
      dayBefore.setHours(19, 0, 0, 0); // 7pm

      if (dayBefore > new Date()) {
        const dayBeforeId = await Notifications.scheduleNotificationAsync({
          content: {
            title: 'PT Session Tomorrow! 🏋️',
            body: `Don't forget: ${exercise.name} is scheduled for tomorrow.`,
            data: { sessionId: session.id, type: 'day-before' },
          },
          trigger: dayBefore,
        });
        notificationIds.push(dayBeforeId);
      }

      // Schedule day-of notification (9am on the day)
      const dayOf = new Date(sessionDate);
      dayOf.setHours(9, 0, 0, 0); // 9am

      if (dayOf > new Date()) {
        const dayOfId = await Notifications.scheduleNotificationAsync({
          content: {
            title: 'Time for Your PT Session! 💪',
            body: `${exercise.name} is scheduled for today.`,
            data: { sessionId: session.id, type: 'day-of' },
          },
          trigger: dayOf,
        });
        notificationIds.push(dayOf);
      }

      return notificationIds;
    } catch (error) {
      console.error('Error scheduling notifications:', error);
      return notificationIds;
    }
  },

  // Cancel all notifications for a session
  async cancelSessionNotifications(notificationIds: string[]): Promise<void> {
    try {
      for (const id of notificationIds) {
        await Notifications.cancelScheduledNotificationAsync(id);
      }
    } catch (error) {
      console.error('Error canceling notifications:', error);
    }
  },

  // Cancel all scheduled notifications
  async cancelAllNotifications(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Error canceling all notifications:', error);
    }
  },

  // Reschedule all notifications based on current sessions
  async rescheduleAllNotifications(
    sessions: ScheduledSession[],
    exercises: Exercise[]
  ): Promise<void> {
    try {
      // Cancel all existing notifications
      await this.cancelAllNotifications();

      // Check permissions first
      const hasPermissions = await this.hasPermissions();
      if (!hasPermissions) {
        console.log('Notification permissions not granted, skipping scheduling');
        return;
      }

      // Get exercise map for quick lookup
      const exerciseMap = new Map(exercises.map((e) => [e.id, e]));

      // Schedule notifications for all sessions
      for (const session of sessions) {
        const exercise = exerciseMap.get(session.exerciseId);
        if (exercise) {
          await this.scheduleSessionNotifications(session, exercise);
        }
      }
    } catch (error) {
      console.error('Error rescheduling all notifications:', error);
    }
  },

  // Get all scheduled notifications (for debugging)
  async getAllScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
    try {
      return await Notifications.getAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Error getting scheduled notifications:', error);
      return [];
    }
  },
};

