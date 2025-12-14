import { Button } from '@/components/Button';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useExercises } from '@/hooks/useExercises';
import { useProfile } from '@/hooks/useProfile';
import { useRoutines } from '@/hooks/useRoutines';
import { useWeekPlans } from '@/hooks/useWeekPlans';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { router } from 'expo-router';
import React, { useCallback, useMemo } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';

// Helper function to estimate exercise minutes from timeToComplete
function estimateExerciseMinutes(exercise: any): number {
  if (exercise?.timeToComplete) {
    const match = exercise.timeToComplete.match(/(\d+)/);
    if (match) {
      const num = parseInt(match[1], 10);
      // If range like "3–5 minutes", take the average; otherwise use the number
      const rangeMatch = exercise.timeToComplete.match(/(\d+)[–-](\d+)/);
      if (rangeMatch) {
        const min = parseInt(rangeMatch[1], 10);
        const max = parseInt(rangeMatch[2], 10);
        return Math.round((min + max) / 2);
      }
      return num;
    }
  }
  // Default fallback: 3 minutes per exercise
  return 3;
}

export default function HomeScreen() {
  const { profile, loading: profileLoading } = useProfile();
  const { activeRoutine, isLoading: routinesLoading, reloadRoutines } = useRoutines();
  const { weekPlans, activePlan, loading: planLoading, reloadActivePlan } = useWeekPlans();
  const { getExerciseById } = useExercises();

  useFocusEffect(
    useCallback(() => {
      reloadRoutines();
      reloadActivePlan();
    }, [reloadRoutines, reloadActivePlan])
  );

  // Get today's date string
  const getTodayDateString = (): string => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Get today's sessions from all week plans
  const todaySessions = useMemo(() => {
    const todayString = getTodayDateString();
    const sessions: Array<{ session: { id: string; exerciseId: string; date: string; createdAt: string }; exercise: any }> = [];
    
    weekPlans.forEach((plan) => {
      plan.scheduledSessions
        .filter((session) => session.date === todayString)
        .forEach((session) => {
          const exercise = getExerciseById(session.exerciseId);
          if (exercise) {
            sessions.push({ session, exercise });
          }
        });
    });
    
    return sessions;
  }, [weekPlans, getExerciseById]);

  // Get weekly overview from week plans
  const weeklyOverview = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const overview: Array<{ date: string; totalMinutes: number }> = [];
    
    for (let weekOffset = 0; weekOffset < 3; weekOffset++) {
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() + weekOffset * 7);
      weekStart.setHours(0, 0, 0, 0);
      
      for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
        const date = new Date(weekStart);
        date.setDate(weekStart.getDate() + dayOffset);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const dateString = `${year}-${month}-${day}`;
        
        let totalMinutes = 0;
        weekPlans.forEach((plan) => {
          plan.scheduledSessions
            .filter((session) => session.date === dateString)
            .forEach((session) => {
              const exercise = getExerciseById(session.exerciseId);
              if (exercise) {
                totalMinutes += estimateExerciseMinutes(exercise);
              }
            });
        });
        
        if (totalMinutes > 0) {
          overview.push({ date: dateString, totalMinutes });
        }
      }
    }
    
    return overview;
  }, [weekPlans, getExerciseById]);

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
                  {activeRoutine.slots ? [...new Set(activeRoutine.slots.map((s) => s.exerciseId))].length : 0} exercises
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
          {todaySessions.length > 0 ? (() => {
            // Get unique exercises in the order they first appear
            const uniqueExercises: Array<{ exercise: any; letter: string }> = [];
            const seenIds = new Set<string>();
            const letters = ['A', 'B', 'C', 'D', 'E', 'F'];
            
            todaySessions.forEach(({ exercise }) => {
              if (!seenIds.has(exercise.id)) {
                seenIds.add(exercise.id);
                uniqueExercises.push({
                  exercise,
                  letter: letters[uniqueExercises.length] || '?',
                });
              }
            });

            const count = uniqueExercises.length;
            
            // Determine pattern label
            let patternLabel = '';
            if (count === 1) {
              patternLabel = 'A'.repeat(todaySessions.length);
            } else if (count === 2) {
              patternLabel = 'ABABAB';
            } else if (count === 3) {
              patternLabel = 'ABCABC';
            } else if (count === 4) {
              patternLabel = 'AABBCCDD';
            } else {
              const basePattern = letters.slice(0, count).join('');
              const patternRepeats = Math.floor(todaySessions.length / count);
              patternLabel = basePattern.repeat(patternRepeats > 0 ? patternRepeats : 1);
            }

            return (
              <View>
                <ThemedText style={styles.summaryHeadline}>
                  {count} exercise{count > 1 ? 's' : ''} in an {patternLabel} format:
                </ThemedText>
                <View style={styles.exerciseSummaryList}>
                  {uniqueExercises.map(({ exercise, letter }) => (
                    <ThemedText key={exercise.id} style={styles.exerciseSummaryItem}>
                      ({letter}) {exercise.name}
                    </ThemedText>
                  ))}
                </View>
              </View>
            );
          })() : (
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
                    {day.totalMinutes} min
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
  summaryHeadline: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    opacity: 0.8,
  },
  exerciseSummaryList: {
    gap: 8,
  },
  exerciseSummaryItem: {
    fontSize: 16,
    marginLeft: 8,
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
