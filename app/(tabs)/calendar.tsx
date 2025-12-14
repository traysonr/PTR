import { Button } from '@/components/Button';
import { ExerciseCard } from '@/components/ExerciseCard';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useExercises } from '@/hooks/useExercises';
import { useNotifications } from '@/hooks/useNotifications';
import { useRoutines } from '@/hooks/useRoutines';
import { useWeekPlans } from '@/hooks/useWeekPlans';
import { ScheduledSession, WeekPlan } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Animated, FlatList, Modal, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

export default function CalendarScreen() {
  const { allExercises, getExerciseById } = useExercises();
  const {
    weekPlans,
    activePlan,
    loading: planLoading,
    updateWeekPlan,
    deleteWeekPlan,
    reloadActivePlan,
  } = useWeekPlans();
  const { routines, activeRoutine } = useRoutines();
  const { rescheduleAllNotifications } = useNotifications();

  useFocusEffect(
    useCallback(() => {
      reloadActivePlan();
    }, [reloadActivePlan])
  );

  // Get today's date in local timezone (YYYY-MM-DD format)
  const getTodayDateString = (): string => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [showExerciseSelector, setShowExerciseSelector] = useState(false);
  const [selectedDay, setSelectedDay] = useState<string | null>(null); // For user-schedule mode
  const [currentMonthDate, setCurrentMonthDate] = useState(new Date());

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const formatDateKey = (date: Date): string => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const parseDateLocal = (value: string): Date => {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
};

const dayMs = 1000 * 60 * 60 * 24;

const generateMonthMatrix = (monthDate: Date, todayString: string) => {
  const firstOfMonth = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
  const startOfGrid = new Date(firstOfMonth);
  const startDay = firstOfMonth.getDay();
  startOfGrid.setDate(firstOfMonth.getDate() - startDay);

  const matrix: Array<
    Array<{ dateString: string; displayNumber: number; isCurrentMonth: boolean; isToday: boolean }>
  > = [];

  const cursor = new Date(startOfGrid);

  for (let week = 0; week < 6; week++) {
    const weekRow: Array<{
      dateString: string;
      displayNumber: number;
      isCurrentMonth: boolean;
      isToday: boolean;
    }> = [];

    for (let day = 0; day < 7; day++) {
      const dateString = formatDateKey(cursor);
      weekRow.push({
        dateString,
        displayNumber: cursor.getDate(),
        isCurrentMonth: cursor.getMonth() === monthDate.getMonth(),
        isToday: dateString === todayString,
      });
      cursor.setDate(cursor.getDate() + 1);
    }

    matrix.push(weekRow);
  }

  return matrix;
};

const formatMonthLabel = (date: Date) => {
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
};

type CalendarDay = {
  dateString: string;
  displayNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
};

type CalendarDayCellProps = {
  day: CalendarDay;
  hasSessions: boolean;
  onPress: () => void;
};

const CalendarDayCell = ({ day, hasSessions, onPress }: CalendarDayCellProps) => {
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    let loop: Animated.CompositeAnimation | null = null;
    if (hasSessions) {
      loop = Animated.loop(
        Animated.sequence([
          Animated.timing(scale, { toValue: 1.05, duration: 900, useNativeDriver: true }),
          Animated.timing(scale, { toValue: 1, duration: 900, useNativeDriver: true }),
        ])
      );
      loop.start();
    }
    return () => {
      if (loop) {
        loop.stop();
      }
      scale.setValue(1);
    };
  }, [hasSessions, scale]);

  return (
    <TouchableOpacity
      style={styles.dayCellTouchable}
      activeOpacity={0.85}
      onPress={onPress}
      disabled={!hasSessions}
    >
      <Animated.View
        style={[
          styles.dayCell,
          !day.isCurrentMonth && styles.dayCellOutside,
          day.isToday && styles.dayCellToday,
          hasSessions && styles.dayCellActive,
          hasSessions && { transform: [{ scale }] },
        ]}
      >
        <ThemedText
          style={[
            styles.dayCellText,
            !day.isCurrentMonth && styles.dayCellTextOutside,
            hasSessions && styles.dayCellTextActive,
          ]}
        >
          {day.displayNumber}
        </ThemedText>
      </Animated.View>
    </TouchableOpacity>
  );
  };

  // Get sessions for a specific date from the active plan
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
      const mergedPlans = weekPlans.map((plan) => (plan.id === updatedPlan.id ? updatedPlan : plan));
      await rescheduleAllNotifications(mergedPlans.flatMap((plan) => plan.scheduledSessions));
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
          const mergedPlans = weekPlans.map((plan) => (plan.id === updatedPlan.id ? updatedPlan : plan));
          await rescheduleAllNotifications(mergedPlans.flatMap((plan) => plan.scheduledSessions));
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

  useEffect(() => {
    if (activePlan) {
      setCurrentMonthDate(parseDateLocal(activePlan.startDate));
    }
  }, [activePlan?.startDate]);

  const describeScheduleStyle = (style?: string) => {
    switch (style) {
      case 'auto-populate':
        return '🤖 Auto Populate';
      case 'live-logging':
        return '📝 Live Logging';
      default:
        return '📅 User Schedule';
    }
  };

  const hasSessionsOnDate = (dateString: string): boolean => {
    return weekPlans.some((plan) => plan.scheduledSessions.some((session) => session.date === dateString));
  };

  const findPlanForDate = (dateString: string): WeekPlan | null => {
    const target = parseDateLocal(dateString);
    for (const plan of weekPlans) {
      const start = parseDateLocal(plan.startDate);
      const end = parseDateLocal(plan.endDate);
      if (target >= start && target <= end) {
        return plan;
      }
    }
    return null;
  };

  const todayString = getTodayDateString();
  const monthMatrix = useMemo(
    () => generateMonthMatrix(currentMonthDate, todayString),
    [currentMonthDate, todayString]
  );

  if (planLoading) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>Loading...</ThemedText>
      </ThemedView>
    );
  }

  const handleChangeMonth = (direction: 'prev' | 'next') => {
    setCurrentMonthDate((prev) => {
      const nextMonth = new Date(prev);
      nextMonth.setMonth(prev.getMonth() + (direction === 'next' ? 1 : -1), 1);
      return nextMonth;
    });
  };

  const handleOpenDay = (dateString: string) => {
    const planForDate = findPlanForDate(dateString);
    if (!planForDate) {
      Alert.alert('No Routine', 'No routine is scheduled for this day.');
      return;
    }

    const target = parseDateLocal(dateString);
    const start = parseDateLocal(planForDate.startDate);
    const dayIndex = Math.round((target.getTime() - start.getTime()) / dayMs);

    if (dayIndex < 0 || dayIndex > 6) {
      Alert.alert('Outside Plan Window', 'This date is outside the selected routine week.');
      return;
    }

    const routineForPlan = planForDate.routineId
      ? routines.find((routine) => routine.id === planForDate.routineId) || null
      : activeRoutine;

    if (!routineForPlan) {
      Alert.alert('Missing Routine', 'The routine for this plan is no longer available.');
      return;
    }

    router.push(`/routines/${routineForPlan.id}/day/${dayIndex}`);
  };

  const handleAddRoutine = () => {
    router.push('/routines');
  };

  const handleClearPlan = () => {
    if (weekPlans.length === 0) return;
    Alert.alert('Clear Calendar', 'This will delete all scheduled routines from the calendar.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear',
        style: 'destructive',
        onPress: async () => {
          await Promise.all(weekPlans.map((plan) => deleteWeekPlan(plan.id)));
          setCurrentMonthDate(new Date());
          await rescheduleAllNotifications([]);
        },
      },
    ]);
  };

  const scheduleLabel =
    weekPlans.length === 0
      ? 'No routines scheduled'
      : weekPlans.length === 1
        ? describeScheduleStyle(weekPlans[0].scheduleStyle)
        : `${weekPlans.length} routines scheduled`;

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.monthScroll} contentContainerStyle={styles.monthScrollContent}>
      <View style={styles.header}>
        <ThemedText type="title" style={styles.title}>
            Monthly Schedule
        </ThemedText>
          <View style={styles.monthControls}>
            <TouchableOpacity style={styles.monthButton} onPress={() => handleChangeMonth('prev')}>
              <Ionicons name="chevron-back" size={20} color="#007AFF" />
            </TouchableOpacity>
            <ThemedText style={styles.monthTitle}>{formatMonthLabel(currentMonthDate)}</ThemedText>
            <TouchableOpacity style={styles.monthButton} onPress={() => handleChangeMonth('next')}>
              <Ionicons name="chevron-forward" size={20} color="#007AFF" />
            </TouchableOpacity>
          </View>
          <ThemedText style={styles.scheduleStyleBadge}>{scheduleLabel}</ThemedText>
          <View style={styles.headerButtons}>
            <TouchableOpacity style={styles.addRoutineButton} onPress={handleAddRoutine}>
              <Ionicons name="add-circle-outline" size={18} color="#007AFF" />
              <ThemedText style={styles.addRoutineText}>Add Routine</ThemedText>
            </TouchableOpacity>
            {weekPlans.length > 0 && (
              <TouchableOpacity style={styles.clearButton} onPress={handleClearPlan}>
                <Ionicons name="trash-outline" size={16} color="#d9534f" />
                <ThemedText style={styles.clearButtonText}>Clear</ThemedText>
              </TouchableOpacity>
            )}
          </View>
      </View>

        <View style={styles.calendarContainer}>
          <View style={styles.dayLabelsRow}>
            {DAY_LABELS.map((label) => (
              <ThemedText key={label} style={styles.dayLabelText}>
                {label}
              </ThemedText>
            ))}
          </View>
          {monthMatrix.map((week, weekIndex) => (
            <View key={`week-${weekIndex}`} style={styles.weekRow}>
              {week.map((day) => {
                const hasSessions = hasSessionsOnDate(day.dateString);
          return (
                  <CalendarDayCell
                    key={day.dateString}
                    day={day}
                    hasSessions={hasSessions}
                    onPress={() => handleOpenDay(day.dateString)}
                  />
                    );
                  })}
                </View>
          ))}
                </View>
      </ScrollView>

      {/* Exercise Selection for User Schedule */}
      {activePlan?.scheduleStyle === 'user-schedule' && selectedDay && (
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
      {activePlan?.scheduleStyle === 'live-logging' && showExerciseSelector && (
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
      {activePlan?.scheduleStyle === 'live-logging' && (
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
  monthScroll: {
    flex: 1,
  },
  monthScrollContent: {
    paddingBottom: 40,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  title: {
    fontSize: 28,
  },
  monthControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 12,
  },
  monthButton: {
    padding: 6,
    borderRadius: 20,
    backgroundColor: '#f0f4ff',
  },
  monthTitle: {
    fontSize: 18,
    fontWeight: '600',
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
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 12,
  },
  addRoutineButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#e6f0ff',
  },
  addRoutineText: {
    color: '#007AFF',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#fdecea',
  },
  clearButtonText: {
    color: '#d9534f',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
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
  calendarContainer: {
    paddingHorizontal: 12,
    paddingTop: 12,
  },
  dayLabelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    marginBottom: 6,
  },
  dayLabelText: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    opacity: 0.6,
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  dayCellTouchable: {
    flex: 1,
    alignItems: 'center',
  },
  dayCell: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
  },
  dayCellOutside: {
    backgroundColor: '#fafafa',
  },
  dayCellToday: {
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  dayCellActive: {
    backgroundColor: '#d4f7d0',
  },
  dayCellText: {
    fontSize: 14,
    fontWeight: '600',
  },
  dayCellTextOutside: {
    opacity: 0.4,
  },
  dayCellTextActive: {
    color: '#0a5c24',
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
  modalSubtitle: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 8,
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
