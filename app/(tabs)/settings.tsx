import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, View, Alert } from 'react-native';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/Button';
import { useNotifications } from '@/hooks/useNotifications';
import { useScheduledExercises } from '@/hooks/useScheduledExercises';
import { storageService } from '@/services/storage';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { TouchableOpacity } from 'react-native';

export default function SettingsScreen() {
  const {
    hasPermission,
    notificationsEnabled,
    enableNotifications,
    disableNotifications,
    requestPermissions,
    loading: notificationsLoading,
  } = useNotifications();

  const { clearAllSessions, sessions } = useScheduledExercises();
  const [clearing, setClearing] = useState(false);

  const handleToggleNotifications = async () => {
    if (notificationsEnabled) {
      await disableNotifications();
      Alert.alert('Notifications Disabled', 'You will no longer receive reminders.');
    } else {
      const granted = await enableNotifications();
      if (!granted) {
        Alert.alert(
          'Permissions Required',
          'Please enable notifications in your device settings to receive reminders.'
        );
      }
    }
  };

  const handleClearAllPlans = () => {
    Alert.alert(
      'Clear All Plans',
      'Are you sure you want to clear all scheduled exercises? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            setClearing(true);
            try {
              const success = await clearAllSessions();
              if (success) {
                Alert.alert('Success', 'All scheduled exercises have been cleared.');
              } else {
                Alert.alert('Error', 'Failed to clear plans. Please try again.');
              }
            } catch (error) {
              Alert.alert('Error', 'An error occurred. Please try again.');
              console.error(error);
            } finally {
              setClearing(false);
            }
          },
        },
      ]
    );
  };

  const handleRequestPermissions = async () => {
    const granted = await requestPermissions();
    if (granted) {
      Alert.alert('Success', 'Notification permissions granted!');
    } else {
      Alert.alert(
        'Permissions Denied',
        'Please enable notifications in your device settings to receive reminders.'
      );
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <ThemedText type="title" style={styles.title}>
          Settings
        </ThemedText>

        {/* Notifications Section */}
        <ThemedView style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Notifications
          </ThemedText>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <ThemedText style={styles.settingLabel}>Enable Notifications</ThemedText>
              <ThemedText style={styles.settingDescription}>
                Receive reminders for scheduled exercises
              </ThemedText>
            </View>
            <TouchableOpacity
              style={[
                styles.toggle,
                notificationsEnabled && styles.toggleActive,
              ]}
              onPress={handleToggleNotifications}
              disabled={notificationsLoading}
            >
              <View
                style={[
                  styles.toggleThumb,
                  notificationsEnabled && styles.toggleThumbActive,
                ]}
              />
            </TouchableOpacity>
          </View>

          {!hasPermission && (
            <View style={styles.permissionWarning}>
              <Ionicons name="warning-outline" size={20} color="#ff9500" />
              <ThemedText style={styles.warningText}>
                Notification permissions are not granted. Tap below to request permissions.
              </ThemedText>
              <Button
                title="Request Permissions"
                onPress={handleRequestPermissions}
                variant="outline"
                style={styles.permissionButton}
              />
            </View>
          )}

          {hasPermission && notificationsEnabled && (
            <View style={styles.permissionSuccess}>
              <Ionicons name="checkmark-circle-outline" size={20} color="#34c759" />
              <ThemedText style={styles.successText}>
                Notifications are enabled. You'll receive reminders the day before and on the day of
                scheduled exercises.
              </ThemedText>
            </View>
          )}
        </ThemedView>

        {/* Data Management Section */}
        <ThemedView style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Data Management
          </ThemedText>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <ThemedText style={styles.settingLabel}>Clear All Plans</ThemedText>
              <ThemedText style={styles.settingDescription}>
                Remove all scheduled exercises from your calendar. Your profile will not be affected.
              </ThemedText>
              <ThemedText style={styles.settingMeta}>
                {sessions.length} {sessions.length === 1 ? 'exercise' : 'exercises'} currently
                scheduled
              </ThemedText>
            </View>
            <Button
              title="Clear All"
              variant="danger"
              onPress={handleClearAllPlans}
              loading={clearing}
              style={styles.clearButton}
            />
          </View>
        </ThemedView>

        {/* About Section */}
        <ThemedView style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            About
          </ThemedText>

          <View style={styles.aboutItem}>
            <ThemedText style={styles.aboutLabel}>App Name</ThemedText>
            <ThemedText style={styles.aboutValue}>PTR - Physical Therapy Reminder</ThemedText>
          </View>

          <View style={styles.aboutItem}>
            <ThemedText style={styles.aboutLabel}>Version</ThemedText>
            <ThemedText style={styles.aboutValue}>1.0.0</ThemedText>
          </View>

          <View style={styles.aboutItem}>
            <ThemedText style={styles.aboutLabel}>Planning Window</ThemedText>
            <ThemedText style={styles.aboutValue}>Up to 3 weeks ahead</ThemedText>
          </View>
        </ThemedView>

        {/* Development Notes */}
        <ThemedView style={styles.section}>
          <ThemedText style={styles.devNote}>
            💡 This app stores all data locally on your device. Future updates may include cloud
            sync and additional features.
          </ThemedText>
        </ThemedView>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  title: {
    marginBottom: 24,
    fontSize: 28,
  },
  section: {
    marginBottom: 32,
    padding: 16,
    borderRadius: 12,
    // TODO: Add background/border for visual separation
  },
  sectionTitle: {
    marginBottom: 16,
    fontSize: 20,
  },
  settingItem: {
    marginBottom: 24,
  },
  settingInfo: {
    marginBottom: 12,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 4,
  },
  settingMeta: {
    fontSize: 12,
    opacity: 0.5,
    marginTop: 4,
  },
  toggle: {
    width: 50,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#ccc',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  toggleActive: {
    backgroundColor: '#34c759',
  },
  toggleThumb: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#fff',
    alignSelf: 'flex-start',
  },
  toggleThumbActive: {
    alignSelf: 'flex-end',
  },
  permissionWarning: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#fff3e0',
    marginTop: 12,
    gap: 8,
  },
  warningText: {
    flex: 1,
    fontSize: 14,
    color: '#e65100',
  },
  permissionButton: {
    marginTop: 8,
  },
  permissionSuccess: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#e8f5e9',
    marginTop: 12,
    gap: 8,
  },
  successText: {
    flex: 1,
    fontSize: 14,
    color: '#2e7d32',
  },
  clearButton: {
    marginTop: 8,
    minWidth: 100,
  },
  aboutItem: {
    marginBottom: 16,
  },
  aboutLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  aboutValue: {
    fontSize: 14,
    opacity: 0.7,
  },
  devNote: {
    fontSize: 13,
    opacity: 0.7,
    lineHeight: 20,
    fontStyle: 'italic',
  },
});

