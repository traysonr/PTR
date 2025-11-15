import React, { useEffect } from 'react';
import { StyleSheet, ScrollView, View, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/Button';
import { ExerciseCard } from '@/components/ExerciseCard';
import { useProfile } from '@/hooks/useProfile';
import { useScheduledExercises } from '@/hooks/useScheduledExercises';
import { useNotifications } from '@/hooks/useNotifications';
import { storageService } from '@/services/storage';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColor } from '@/hooks/use-theme-color';

export default function HomeScreen() {
  const { profile, loading: profileLoading } = useProfile();
  const { getTodaySessions, getWeeklyOverview, loading: sessionsLoading } = useScheduledExercises();
  const { requestPermissions } = useNotifications();

  const todaySessions = getTodaySessions();
  const weeklyOverview = getWeeklyOverview();

  useEffect(() => {
    // Check if user needs onboarding
    const checkOnboarding = async () => {
      const onboardingComplete = await storageService.getOnboardingComplete();
      const profileExists = await storageService.getProfile();
      
      if (!onboardingComplete || !profileExists) {
        router.replace('/onboarding');
      } else {
        // Request notification permissions when app loads (after onboarding)
        await requestPermissions();
      }
    };
    
    checkOnboarding();
  }, []);

  if (profileLoading || sessionsLoading) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>Loading...</ThemedText>
      </ThemedView>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (dateString === today.toISOString().split('T')[0]) {
      return 'Today';
    } else if (dateString === tomorrow.toISOString().split('T')[0]) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Welcome Section */}
        <View style={styles.header}>
          <ThemedText type="title" style={styles.welcomeTitle}>
            Welcome back{profile?.name ? `, ${profile.name}` : ''}! 👋
          </ThemedText>
        </View>

        {/* Today's Plan */}
        <ThemedView style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Today's Plan
          </ThemedText>
          {todaySessions.length > 0 ? (
            <View style={styles.exercisesList}>
              {todaySessions.map(({ exercise, session }) => (
                <ExerciseCard key={session.id} exercise={exercise} showDescription={false} />
              ))}
            </View>
          ) : (
            <ThemedView style={styles.emptyState}>
              <ThemedText style={styles.emptyText}>No exercises scheduled for today.</ThemedText>
              <Button
                title="Browse Exercises"
                onPress={() => router.push('/(tabs)/catalog')}
                variant="outline"
                style={styles.emptyButton}
              />
            </ThemedView>
          )}
        </ThemedView>

        {/* Weekly Overview */}
        {weeklyOverview.length > 0 && (
          <ThemedView style={styles.section}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              This Week
            </ThemedText>
            <View style={styles.weeklyList}>
              {weeklyOverview.slice(0, 7).map((day) => (
                <View key={day.date} style={styles.weeklyItem}>
                  <ThemedText style={styles.weeklyDate}>{formatDate(day.date)}</ThemedText>
                  <ThemedText style={styles.weeklyCount}>
                    {day.exercises.length} {day.exercises.length === 1 ? 'exercise' : 'exercises'}
                  </ThemedText>
                </View>
              ))}
            </View>
          </ThemedView>
        )}

        {/* Quick Actions */}
        <ThemedView style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Quick Actions
          </ThemedText>
          <View style={styles.actionsGrid}>
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => router.push('/(tabs)/calendar')}
            >
              <Ionicons name="calendar-outline" size={32} color="#007AFF" />
              <ThemedText style={styles.actionText}>View Calendar</ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => router.push('/(tabs)/catalog')}
            >
              <Ionicons name="list-outline" size={32} color="#007AFF" />
              <ThemedText style={styles.actionText}>Browse Exercises</ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => router.push('/(tabs)/profile')}
            >
              <Ionicons name="person-outline" size={32} color="#007AFF" />
              <ThemedText style={styles.actionText}>Edit Profile</ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => router.push('/(tabs)/settings')}
            >
              <Ionicons name="settings-outline" size={32} color="#007AFF" />
              <ThemedText style={styles.actionText}>Settings</ThemedText>
            </TouchableOpacity>
          </View>
        </ThemedView>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingTop: 60,
  },
  header: {
    marginBottom: 24,
  },
  welcomeTitle: {
    fontSize: 28,
  },
  section: {
    marginBottom: 32,
    padding: 16,
    borderRadius: 12,
    // TODO: Add subtle background/border for visual separation
  },
  sectionTitle: {
    marginBottom: 16,
    fontSize: 20,
  },
  exercisesList: {
    gap: 12,
  },
  emptyState: {
    padding: 24,
    alignItems: 'center',
  },
  emptyText: {
    marginBottom: 16,
    opacity: 0.7,
    textAlign: 'center',
  },
  emptyButton: {
    minWidth: 150,
  },
  weeklyList: {
    gap: 12,
  },
  weeklyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    // TODO: Add background color for better visibility
  },
  weeklyDate: {
    fontSize: 16,
    fontWeight: '500',
  },
  weeklyCount: {
    fontSize: 14,
    opacity: 0.7,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionCard: {
    flex: 1,
    minWidth: '45%',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
    // TODO: Add proper themed background color
    minHeight: 100,
  },
  actionText: {
    marginTop: 8,
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '500',
  },
});
