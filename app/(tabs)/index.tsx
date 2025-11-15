import React from 'react';
import { StyleSheet, ScrollView, View, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/Button';
import { ExerciseCard } from '@/components/ExerciseCard';
import { useProfile } from '@/hooks/useProfile';
import { useRoutines } from '@/hooks/useRoutines';
import { useScheduledExercises } from '@/hooks/useScheduledExercises';
import { useWeekPlans } from '@/hooks/useWeekPlans';
import { ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function HomeScreen() {
  const { profile, loading: profileLoading } = useProfile();
  const { activeRoutine, isLoading: routinesLoading } = useRoutines();
  const { activePlan, loading: planLoading } = useWeekPlans();
  const { getTodaySessions, getWeeklyOverview } = useScheduledExercises();

  const todaySessions = getTodaySessions() || [];
  const weeklyOverview = getWeeklyOverview() || [];

  if (profileLoading || routinesLoading || planLoading) {
    return (
      <ThemedView style={styles.container}>
        <ActivityIndicator size="large" style={styles.loader} />
      </ThemedView>
    );
  }

  // State 1: No profile
  if (!profile) {
    return (
      <ThemedView style={styles.container}>
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.emptyContent}>
          <ThemedText type="title" style={styles.emptyTitle}>
            Welcome to PTR! 👋
          </ThemedText>
          <ThemedText style={styles.emptyDescription}>
            Create your profile to get started with personalized physical therapy routines.
          </ThemedText>
          <Button
            title="Create Your Profile"
            onPress={() => router.push('/onboarding')}
            style={styles.ctaButton}
          />
        </ScrollView>
      </ThemedView>
    );
  }

  // State 2: Profile exists but no routines
  if (!activeRoutine) {
    return (
      <ThemedView style={styles.container}>
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
          <View style={styles.header}>
            <ThemedText type="title" style={styles.welcomeTitle}>
              Welcome back, {profile.name}! 👋
            </ThemedText>
          </View>

          <View style={styles.profileSummary}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              Your Profile
            </ThemedText>
            <View style={styles.summaryItem}>
              <Ionicons name="body-outline" size={20} color="#007AFF" />
              <ThemedText style={styles.summaryText}>
                {profile.targetBodyAreas?.length || 0} target areas
              </ThemedText>
            </View>
            <View style={styles.summaryItem}>
              <Ionicons name="calendar-outline" size={20} color="#007AFF" />
              <ThemedText style={styles.summaryText}>
                {profile.daysPerWeek || 0} days/week
              </ThemedText>
            </View>
            <View style={styles.summaryItem}>
              <Ionicons name="time-outline" size={20} color="#007AFF" />
              <ThemedText style={styles.summaryText}>
                {profile.maxMinutesPerDay || 0} min/day
              </ThemedText>
            </View>
          </View>

          <View style={styles.emptyState}>
            <ThemedText type="subtitle" style={styles.emptyTitle}>
              Ready to Start?
            </ThemedText>
            <ThemedText style={styles.emptyDescription}>
              Generate your first personalized routine based on your profile preferences.
            </ThemedText>
            <Button
              title="Generate Your First Routine"
              onPress={() => router.push('/(tabs)/routines')}
              style={styles.ctaButton}
            />
          </View>
        </ScrollView>
      </ThemedView>
    );
  }

  // State 3: Routine exists but no active WeekPlan
  if (!activePlan) {
    return (
      <ThemedView style={styles.container}>
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
          <View style={styles.header}>
            <ThemedText type="title" style={styles.welcomeTitle}>
              Welcome back, {profile.name}! 👋
            </ThemedText>
          </View>

          <View style={styles.routineSummary}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              {activeRoutine.name}
            </ThemedText>
            <ThemedText style={styles.routineDescription}>{activeRoutine.description}</ThemedText>
            <View style={styles.routineMeta}>
              <View style={styles.metaItem}>
                <Ionicons name="calendar-outline" size={16} color="#666" />
                <ThemedText style={styles.metaText}>{activeRoutine.daysPerWeek} days/week</ThemedText>
              </View>
              <View style={styles.metaItem}>
                <Ionicons name="time-outline" size={16} color="#666" />
                <ThemedText style={styles.metaText}>
                  {activeRoutine.totalWeeklyMinutes} min/week
                </ThemedText>
              </View>
              <View style={styles.metaItem}>
                <Ionicons name="fitness-outline" size={16} color="#666" />
                <ThemedText style={styles.metaText}>
                  {activeRoutine.exerciseIds?.length || 0} exercises
                </ThemedText>
              </View>
            </View>
          </View>

          <View style={styles.emptyState}>
            <ThemedText type="subtitle" style={styles.emptyTitle}>
              Start This Routine
            </ThemedText>
            <ThemedText style={styles.emptyDescription}>
              Review and edit your routine, then set a start date to schedule it on your calendar.
            </ThemedText>
            <Button
              title="Start This Routine"
              onPress={() => router.push(`/routines/${activeRoutine.id}`)}
              style={styles.ctaButton}
            />
          </View>
        </ScrollView>
      </ThemedView>
    );
  }

  // State 4: Active WeekPlan / scheduled sessions exist
  const formatDate = (dateString: string) => {
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayYear = today.getFullYear();
    const todayMonth = String(today.getMonth() + 1).padStart(2, '0');
    const todayDay = String(today.getDate()).padStart(2, '0');
    const todayString = `${todayYear}-${todayMonth}-${todayDay}`;

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowString = `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, '0')}-${String(tomorrow.getDate()).padStart(2, '0')}`;

    if (dateString === todayString) {
      return 'Today';
    } else if (dateString === tomorrowString) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <ThemedText type="title" style={styles.welcomeTitle}>
            Welcome back, {profile.name}! 👋
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
                title="Go to Calendar"
                onPress={() => router.push('/(tabs)/calendar')}
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
            <Button
              title="View Full Calendar"
              onPress={() => router.push('/(tabs)/calendar')}
              variant="outline"
              style={styles.viewCalendarButton}
            />
          </ThemedView>
        )}
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
  emptyContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loader: {
    marginTop: 100,
  },
  header: {
    marginBottom: 24,
  },
  welcomeTitle: {
    fontSize: 28,
  },
  emptyTitle: {
    marginBottom: 16,
    textAlign: 'center',
  },
  emptyDescription: {
    marginBottom: 32,
    textAlign: 'center',
    opacity: 0.7,
    fontSize: 16,
    lineHeight: 24,
  },
  ctaButton: {
    minWidth: 200,
  },
  profileSummary: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#f5f5f5',
    marginBottom: 32,
  },
  section: {
    marginBottom: 32,
    padding: 16,
    borderRadius: 12,
  },
  sectionTitle: {
    marginBottom: 16,
    fontSize: 20,
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  summaryText: {
    fontSize: 16,
    fontWeight: '500',
  },
  routineSummary: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginBottom: 32,
  },
  routineDescription: {
    marginTop: 8,
    marginBottom: 12,
    opacity: 0.7,
    fontSize: 14,
  },
  routineMeta: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 13,
    opacity: 0.7,
  },
  emptyState: {
    padding: 24,
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: '#f5f5f5',
  },
  emptyText: {
    marginBottom: 16,
    opacity: 0.7,
    textAlign: 'center',
  },
  emptyButton: {
    minWidth: 150,
  },
  exercisesList: {
    gap: 12,
  },
  weeklyList: {
    gap: 12,
    marginBottom: 16,
  },
  weeklyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  weeklyDate: {
    fontSize: 16,
    fontWeight: '500',
  },
  weeklyCount: {
    fontSize: 14,
    opacity: 0.7,
  },
  viewCalendarButton: {
    marginTop: 8,
  },
});
