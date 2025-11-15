import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, View, FlatList, Alert, Modal, TouchableOpacity } from 'react-native';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { ExerciseCard } from '@/components/ExerciseCard';
import { Button } from '@/components/Button';
import { Checkbox } from '@/components/Checkbox';
import { TextInput } from '@/components/TextInput';
import { useExercises } from '@/hooks/useExercises';
import { useWeekPlans } from '@/hooks/useWeekPlans';
import { useNotifications } from '@/hooks/useNotifications';
import { WeekPlan, ScheduleStyle, ScheduledSession } from '@/types';
import { Exercise } from '@/types/exercise';
import { Ionicons } from '@expo/vector-icons';

export default function CalendarScreen() {
  const { allExercises, getExerciseById } = useExercises();
  const {
    activePlan,
    loading: planLoading,
    createWeekPlan,
    updateWeekPlan,
    autoPopulateSchedule,
  } = useWeekPlans();
  const { scheduleSessionNotifications, rescheduleAllNotifications } = useNotifications();

  // Get today's date in local timezone (YYYY-MM-DD format)
  const getTodayDateString = (): string => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // State for new plan creation
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [selectedStartDate, setSelectedStartDate] = useState<string>(getTodayDateString());
  const [selectedExerciseIds, setSelectedExerciseIds] = useState<string[]>([]);
  const [scheduleStyle, setScheduleStyle] = useState<ScheduleStyle>('user-schedule');
  const [timeWindow, setTimeWindow] = useState({ minMinutes: 15, maxMinutes: 60 });
  const [showExerciseSelector, setShowExerciseSelector] = useState(false);
  const [selectedDay, setSelectedDay] = useState<string | null>(null); // For user-schedule mode

  // Generate the 7 days of the week from start date
  const generateWeekDates = (startDate: string): string[] => {
    const dates: string[] = [];
    const start = new Date(startDate);

    for (let i = 0; i < 7; i++) {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      dates.push(`${year}-${month}-${day}`);
    }

    return dates;
  };

  // Get sessions for a specific date from the active plan
  const getSessionsForDate = (date: string): Array<{ session: ScheduledSession; exercise: Exercise }> => {
    if (!activePlan) return [];

    return activePlan.scheduledSessions
      .filter((s) => s.date === date)
      .map((session) => ({
        session,
        exercise: getExerciseById(session.exerciseId)!,
      }))
      .filter((item) => item.exercise !== undefined);
  };

  // Check if a session is completed (for live-logging mode)
  const isSessionCompleted = (sessionId: string): boolean => {
    return activePlan?.completedSessions.includes(sessionId) || false;
  };

  const formatDateDisplay = (dateString: string) => {
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    const today = getTodayDateString();

    if (dateString === today) {
      return 'Today';
    } else {
      return date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      });
    }
  };

  const formatDateHeader = (dateString: string) => {
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });
  };

  // Create new week plan
  const handleCreatePlan = async () => {
    if (selectedExerciseIds.length === 0) {
      Alert.alert('Selection Required', 'Please select at least one exercise for your week.');
      return;
    }

    const plan = await createWeekPlan(
      selectedStartDate,
      scheduleStyle,
      selectedExerciseIds,
      scheduleStyle === 'auto-populate' ? timeWindow : undefined
    );

    if (plan) {
      // If auto-populate, generate the schedule
      if (scheduleStyle === 'auto-populate') {
        const sessions = autoPopulateSchedule(plan, allExercises);
        plan.scheduledSessions = sessions;
        await updateWeekPlan(plan);

        // Schedule notifications for all sessions
        for (const session of sessions) {
          const exercise = getExerciseById(session.exerciseId);
          if (exercise) {
            await scheduleSessionNotifications(session, exercise);
          }
        }
      }

      setShowPlanModal(false);
      setSelectedExerciseIds([]);
      Alert.alert('Success', 'Week plan created!');
    } else {
      Alert.alert('Error', 'Failed to create week plan. Please try again.');
    }
  };

  // Add exercise to specific day (user-schedule mode or live-logging mode)
  const handleAddExerciseToDay = async (exerciseId: string, date: string, isCompleted = false) => {
    if (!activePlan) return;

    const newSession: ScheduledSession = {
      id: `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      exerciseId,
      date,
      createdAt: new Date().toISOString(),
    };

    const updatedPlan: WeekPlan = {
      ...activePlan,
      scheduledSessions: [...activePlan.scheduledSessions, newSession],
      completedSessions:
        isCompleted || activePlan.scheduleStyle === 'live-logging'
          ? [...activePlan.completedSessions, newSession.id]
          : activePlan.completedSessions,
      updatedAt: new Date().toISOString(),
    };

    const success = await updateWeekPlan(updatedPlan);
    if (success) {
      const exercise = getExerciseById(exerciseId);
      if (exercise && activePlan.scheduleStyle !== 'live-logging') {
        // Only schedule notifications for pre-planned sessions, not live-logged ones
        await scheduleSessionNotifications(newSession, exercise);
      }
      setShowExerciseSelector(false);
      setSelectedDay(null);
      if (activePlan.scheduleStyle === 'live-logging') {
        Alert.alert('Success', 'Exercise logged!');
      } else {
        Alert.alert('Success', 'Exercise added!');
      }
    }
  };

  // Remove exercise from day
  const handleRemoveExercise = async (sessionId: string) => {
    if (!activePlan) return;

    Alert.alert('Remove Exercise', 'Are you sure you want to remove this exercise?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          const updatedPlan: WeekPlan = {
            ...activePlan,
            scheduledSessions: activePlan.scheduledSessions.filter((s) => s.id !== sessionId),
            completedSessions: activePlan.completedSessions.filter((id) => id !== sessionId),
            updatedAt: new Date().toISOString(),
          };

          await updateWeekPlan(updatedPlan);
          // Reschedule all notifications
          await rescheduleAllNotifications(
            updatedPlan.scheduledSessions,
            allExercises.filter((e) => updatedPlan.selectedExerciseIds.includes(e.id))
          );
        },
      },
    ]);
  };

  // Toggle exercise completion (live-logging mode)
  const handleToggleCompletion = async (sessionId: string) => {
    if (!activePlan || activePlan.scheduleStyle !== 'live-logging') return;

    const isCompleted = activePlan.completedSessions.includes(sessionId);
    const updatedCompletedSessions = isCompleted
      ? activePlan.completedSessions.filter((id) => id !== sessionId)
      : [...activePlan.completedSessions, sessionId];

    const updatedPlan: WeekPlan = {
      ...activePlan,
      completedSessions: updatedCompletedSessions,
      updatedAt: new Date().toISOString(),
    };

    await updateWeekPlan(updatedPlan);
  };

  // Toggle exercise selection
  const toggleExerciseSelection = (exerciseId: string) => {
    setSelectedExerciseIds((prev) =>
      prev.includes(exerciseId) ? prev.filter((id) => id !== exerciseId) : [...prev, exerciseId]
    );
  };

  if (planLoading) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>Loading...</ThemedText>
      </ThemedView>
    );
  }

  // No active plan - show plan creation modal
  if (!activePlan) {
    const weekDates = generateWeekDates(selectedStartDate);

    return (
      <ThemedView style={styles.container}>
        <View style={styles.header}>
          <ThemedText type="title" style={styles.title}>
            Plan Your Week
          </ThemedText>
          <ThemedText style={styles.subtitle}>
            Create a new week plan to get started
          </ThemedText>
        </View>

        <View style={styles.emptyState}>
          <Ionicons name="calendar-outline" size={64} color="#999" />
          <ThemedText style={styles.emptyText}>
            No week plan active. Create a new plan to start scheduling exercises.
          </ThemedText>
          <Button title="Create Week Plan" onPress={() => setShowPlanModal(true)} style={styles.emptyButton} />
        </View>

        {/* Plan Creation Modal */}
        <Modal visible={showPlanModal} animationType="slide" presentationStyle="pageSheet">
          <ThemedView style={styles.modalContainer}>
            <ScrollView contentContainerStyle={styles.modalContent}>
              <View style={styles.modalHeader}>
                <ThemedText type="title" style={styles.modalTitle}>
                  Create Week Plan
                </ThemedText>
                <Button
                  title="Close"
                  variant="outline"
                  onPress={() => setShowPlanModal(false)}
                  style={styles.closeButton}
                />
              </View>

              {/* Start Date Selection */}
              <ThemedView style={styles.section}>
                <ThemedText type="subtitle" style={styles.sectionTitle}>
                  Start Date
                </ThemedText>
                <ThemedText style={styles.sectionDescription}>
                  Select the first day of your week (today or later)
                </ThemedText>
                <TextInput
                  value={selectedStartDate}
                  onChangeText={setSelectedStartDate}
                  placeholder="YYYY-MM-DD"
                  label="Start Date"
                />
              </ThemedView>

              {/* Exercise Selection */}
              <ThemedView style={styles.section}>
                <ThemedText type="subtitle" style={styles.sectionTitle}>
                  Select Exercises
                </ThemedText>
                <ThemedText style={styles.sectionDescription}>
                  Choose exercises for this week ({selectedExerciseIds.length} selected)
                </ThemedText>
                <Button
                  title="Select Exercises"
                  variant="outline"
                  onPress={() => setShowExerciseSelector(true)}
                  style={styles.selectButton}
                />
              </ThemedView>

              {/* Schedule Style Selection */}
              <ThemedView style={styles.section}>
                <ThemedText type="subtitle" style={styles.sectionTitle}>
                  Schedule Style
                </ThemedText>

                <Checkbox
                  label="Auto Populate - App distributes exercises automatically within time limits"
                  checked={scheduleStyle === 'auto-populate'}
                  onToggle={() => setScheduleStyle('auto-populate')}
                />
                <Checkbox
                  label="Live Logging - Log exercises as you complete them throughout the week"
                  checked={scheduleStyle === 'live-logging'}
                  onToggle={() => setScheduleStyle('live-logging')}
                />
                <Checkbox
                  label="User Schedule - Manually assign exercises to specific days"
                  checked={scheduleStyle === 'user-schedule'}
                  onToggle={() => setScheduleStyle('user-schedule')}
                />

                {scheduleStyle === 'auto-populate' && (
                  <View style={styles.timeWindowSection}>
                    <ThemedText style={styles.timeWindowLabel}>Daily Time Window (minutes)</ThemedText>
                    <View style={styles.timeWindowInputs}>
                      <View style={styles.timeInputContainer}>
                        <ThemedText style={styles.timeInputLabel}>Min:</ThemedText>
                        <TextInput
                          value={String(timeWindow.minMinutes)}
                          onChangeText={(text) =>
                            setTimeWindow({ ...timeWindow, minMinutes: parseInt(text) || 15 })
                          }
                          keyboardType="numeric"
                          style={styles.timeInput}
                        />
                      </View>
                      <View style={styles.timeInputContainer}>
                        <ThemedText style={styles.timeInputLabel}>Max:</ThemedText>
                        <TextInput
                          value={String(timeWindow.maxMinutes)}
                          onChangeText={(text) =>
                            setTimeWindow({ ...timeWindow, maxMinutes: parseInt(text) || 60 })
                          }
                          keyboardType="numeric"
                          style={styles.timeInput}
                        />
                      </View>
                    </View>
                  </View>
                )}
              </ThemedView>

              <Button title="Create Plan" onPress={handleCreatePlan} style={styles.createButton} />
            </ScrollView>
          </ThemedView>
        </Modal>

        {/* Exercise Selection Modal */}
        <Modal visible={showExerciseSelector} animationType="slide" presentationStyle="pageSheet">
          <ThemedView style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <ThemedText type="title" style={styles.modalTitle}>
                Select Exercises
              </ThemedText>
              <Button
                title="Done"
                variant="outline"
                onPress={() => setShowExerciseSelector(false)}
                style={styles.closeButton}
              />
            </View>
            <FlatList
              data={allExercises}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => toggleExerciseSelection(item.id)}
                  style={styles.exerciseSelectItem}
                >
                  <Checkbox
                    label={item.name}
                    checked={selectedExerciseIds.includes(item.id)}
                    onToggle={() => toggleExerciseSelection(item.id)}
                  />
                  <ThemedText style={styles.exerciseBodyPart}>
                    {item.bodyAreas.map((area) => {
                      const areaLabels: Record<string, string> = {
                        neck: 'Neck',
                        upper_back: 'Upper Back',
                        lower_back: 'Lower Back',
                        shoulder: 'Shoulder',
                        hip: 'Hip',
                        knee: 'Knee',
                        ankle: 'Ankle',
                        wrist: 'Wrist',
                        elbow: 'Elbow',
                        core: 'Core',
                      };
                      return areaLabels[area] || area;
                    }).join(', ')}
                  </ThemedText>
                </TouchableOpacity>
              )}
              contentContainerStyle={styles.modalListContent}
            />
          </ThemedView>
        </Modal>
      </ThemedView>
    );
  }

  // Active plan exists - show week view
  const weekDates = generateWeekDates(activePlan.startDate);

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText type="title" style={styles.title}>
          Your Week Plan
        </ThemedText>
        <ThemedText style={styles.subtitle}>
          {formatDateHeader(activePlan.startDate)} - {formatDateHeader(activePlan.endDate)}
        </ThemedText>
        <ThemedText style={styles.scheduleStyleBadge}>
          {activePlan.scheduleStyle === 'auto-populate' && '🤖 Auto Populate'}
          {activePlan.scheduleStyle === 'live-logging' && '📝 Live Logging'}
          {activePlan.scheduleStyle === 'user-schedule' && '📅 User Schedule'}
        </ThemedText>
      </View>

      <ScrollView style={styles.weekView} contentContainerStyle={styles.weekContent}>
        {weekDates.map((date) => {
          const daySessions = getSessionsForDate(date);
          const totalTime = daySessions.reduce((sum, item) => {
            return sum + (item.exercise.duration || 10);
          }, 0);

          return (
            <ThemedView key={date} style={styles.dayCard}>
              <View style={styles.dayHeader}>
                <ThemedText type="subtitle" style={styles.dayTitle}>
                  {formatDateHeader(date)}
                </ThemedText>
                {activePlan.scheduleStyle === 'user-schedule' && (
                  <Button
                    title="Add"
                    onPress={() => {
                      setSelectedDay(date);
                      setShowExerciseSelector(true);
                    }}
                    style={styles.addDayButton}
                  />
                )}
              </View>
              <ThemedText style={styles.daySubtitle}>{formatDateDisplay(date)}</ThemedText>
              {daySessions.length > 0 && (
                <ThemedText style={styles.totalTime}>Total: {totalTime} min</ThemedText>
              )}

              {daySessions.length > 0 ? (
                <View style={styles.sessionsList}>
                  {daySessions.map(({ session, exercise }) => {
                    const isCompleted =
                      activePlan.scheduleStyle === 'live-logging' && isSessionCompleted(session.id);

                    return (
                      <View key={session.id} style={styles.sessionCard}>
                        {activePlan.scheduleStyle === 'live-logging' && (
                          <TouchableOpacity
                            onPress={() => handleToggleCompletion(session.id)}
                            style={styles.completionCheckbox}
                          >
                            <Ionicons
                              name={isCompleted ? 'checkbox' : 'square-outline'}
                              size={24}
                              color={isCompleted ? '#34c759' : '#999'}
                            />
                          </TouchableOpacity>
                        )}
                        <View style={styles.sessionContent}>
                          <ExerciseCard exercise={exercise} showDescription={false} />
                          {(activePlan.scheduleStyle === 'user-schedule' ||
                            activePlan.scheduleStyle === 'auto-populate') && (
                            <Button
                              title="Remove"
                              variant="danger"
                              onPress={() => handleRemoveExercise(session.id)}
                              style={styles.removeButton}
                            />
                          )}
                        </View>
                      </View>
                    );
                  })}
                </View>
              ) : (
                <View style={styles.emptyDay}>
                  <ThemedText style={styles.emptyDayText}>No exercises scheduled</ThemedText>
                  {activePlan.scheduleStyle === 'user-schedule' && (
                    <Button
                      title="Add Exercise"
                      variant="outline"
                      onPress={() => {
                        setSelectedDay(date);
                        setShowExerciseSelector(true);
                      }}
                      style={styles.addDayButton}
                    />
                  )}
                </View>
              )}
            </ThemedView>
          );
        })}
      </ScrollView>

      {/* Exercise Selection for User Schedule */}
      {activePlan.scheduleStyle === 'user-schedule' && selectedDay && (
        <Modal visible={showExerciseSelector} animationType="slide" presentationStyle="pageSheet">
          <ThemedView style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <ThemedText type="title" style={styles.modalTitle}>
                Add Exercise - {formatDateHeader(selectedDay)}
              </ThemedText>
              <Button
                title="Close"
                variant="outline"
                onPress={() => {
                  setShowExerciseSelector(false);
                  setSelectedDay(null);
                }}
                style={styles.closeButton}
              />
            </View>
            <FlatList
              data={allExercises.filter((e) => activePlan.selectedExerciseIds.includes(e.id))}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View style={styles.modalExerciseItem}>
                  <ExerciseCard exercise={item} showDescription={false} />
                  <Button
                    title="Add"
                    onPress={() => handleAddExerciseToDay(item.id, selectedDay)}
                    style={styles.addExerciseButton}
                  />
                </View>
              )}
              contentContainerStyle={styles.modalListContent}
            />
          </ThemedView>
        </Modal>
      )}

      {/* Live Logging - Exercise Selection */}
      {activePlan.scheduleStyle === 'live-logging' && showExerciseSelector && (
        <Modal visible={showExerciseSelector} animationType="slide" presentationStyle="pageSheet">
          <ThemedView style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <ThemedText type="title" style={styles.modalTitle}>
                Log Exercise
              </ThemedText>
              <Button
                title="Close"
                variant="outline"
                onPress={() => setShowExerciseSelector(false)}
                style={styles.closeButton}
              />
            </View>
            <ThemedText style={styles.liveLoggingHelp}>
              Select an exercise you completed today. You can log exercises multiple times.
            </ThemedText>
            <FlatList
              data={allExercises.filter((e) => activePlan.selectedExerciseIds.includes(e.id))}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View style={styles.modalExerciseItem}>
                  <ExerciseCard exercise={item} />
                  <Button
                    title="Log Completed"
                    onPress={async () => {
                      const today = getTodayDateString();
                      await handleAddExerciseToDay(item.id, today, true);
                      setShowExerciseSelector(false);
                    }}
                    style={styles.addExerciseButton}
                  />
                </View>
              )}
              contentContainerStyle={styles.modalListContent}
            />
          </ThemedView>
        </Modal>
      )}

      {/* Floating action button for live logging */}
      {activePlan.scheduleStyle === 'live-logging' && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => setShowExerciseSelector(true)}
        >
          <Ionicons name="add" size={32} color="#fff" />
        </TouchableOpacity>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  title: {
    fontSize: 28,
  },
  subtitle: {
    fontSize: 14,
    opacity: 0.7,
    marginTop: 4,
  },
  scheduleStyleBadge: {
    fontSize: 12,
    opacity: 0.6,
    marginTop: 4,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    opacity: 0.7,
    marginTop: 16,
    marginBottom: 24,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  emptyButton: {
    minWidth: 150,
  },
  weekView: {
    flex: 1,
  },
  weekContent: {
    padding: 20,
  },
  dayCard: {
    marginBottom: 20,
    padding: 16,
    borderRadius: 12,
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  dayTitle: {
    fontSize: 18,
    flex: 1,
  },
  daySubtitle: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 8,
  },
  totalTime: {
    fontSize: 12,
    opacity: 0.6,
    marginBottom: 12,
  },
  sessionsList: {
    gap: 12,
  },
  sessionCard: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  completionCheckbox: {
    marginTop: 8,
  },
  sessionContent: {
    flex: 1,
  },
  removeButton: {
    marginTop: 8,
    minWidth: 100,
  },
  emptyDay: {
    padding: 20,
    alignItems: 'center',
  },
  emptyDayText: {
    fontSize: 14,
    opacity: 0.5,
    marginBottom: 12,
  },
  addDayButton: {
    minWidth: 80,
  },
  modalContainer: {
    flex: 1,
    paddingTop: 60,
  },
  modalContent: {
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 24,
    flex: 1,
  },
  closeButton: {
    minWidth: 80,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    marginBottom: 8,
    fontSize: 20,
  },
  sectionDescription: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 12,
  },
  selectButton: {
    marginTop: 8,
  },
  timeWindowSection: {
    marginTop: 16,
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
  },
  timeWindowLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  timeWindowInputs: {
    flexDirection: 'row',
    gap: 16,
  },
  timeInputContainer: {
    flex: 1,
  },
  timeInputLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  timeInput: {
    marginBottom: 0,
  },
  createButton: {
    marginTop: 24,
    marginBottom: 32,
  },
  exerciseSelectItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  exerciseBodyPart: {
    fontSize: 12,
    opacity: 0.6,
  },
  modalListContent: {
    padding: 20,
  },
  modalExerciseItem: {
    marginBottom: 16,
  },
  addExerciseButton: {
    marginTop: 8,
    minWidth: 100,
  },
  liveLoggingHelp: {
    fontSize: 14,
    opacity: 0.7,
    paddingHorizontal: 20,
    paddingVertical: 12,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
});
