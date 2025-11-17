import { ScheduledSession } from '@/types';
import * as Notifications from 'expo-notifications';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

const REMINDER_HOURS = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19];
const REMINDER_MINUTE = 43;

const createReminderTimes = (dateString: string): Date[] => {
  const [year, month, day] = dateString.split('-').map(Number);
  return REMINDER_HOURS.map((hour) => new Date(year, month - 1, day, hour, REMINDER_MINUTE, 0, 0));
};

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

  async scheduleReminderSeries(dateString: string): Promise<void> {
    const now = new Date();
    const reminderTimes = createReminderTimes(dateString);

    for (const triggerTime of reminderTimes) {
      if (triggerTime <= now) continue;

      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'have you worked out yet??? =)',
          body: 'Tap to open your calendar and start your routine.',
          data: { targetTab: 'calendar', scheduledDate: dateString },
        },
        trigger: triggerTime,
      });
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
  async rescheduleAllNotifications(sessions: ScheduledSession[]): Promise<void> {
    try {
      // Cancel all existing notifications
      await this.cancelAllNotifications();

      // Check permissions first
      const hasPermissions = await this.hasPermissions();
      if (!hasPermissions) {
        console.log('Notification permissions not granted, skipping scheduling');
        return;
      }

      const uniqueDates = Array.from(new Set(sessions.map((session) => session.date)));
      uniqueDates.sort();

      for (const dateString of uniqueDates) {
        await this.scheduleReminderSeries(dateString);
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

