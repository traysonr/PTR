import { Button } from '@/components/Button';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useExercises } from '@/hooks/useExercises';
import { useNotifications } from '@/hooks/useNotifications';
import { useRoutines } from '@/hooks/useRoutines';
import { useWeekPlans } from '@/hooks/useWeekPlans';
import { RoutineExerciseSlot } from '@/types';
import { Exercise } from '@/types/exercise';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Modal, Platform, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

export default function RoutineDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { routines, saveRoutine, isLoading } = useRoutines();
  const { allExercises, getExerciseById } = useExercises();
  const { createWeekPlanFromRoutine } = useWeekPlans();
  const { scheduleSessionNotifications } = useNotifications();

  const [routine, setRoutine] = useState(routines.find((r) => r.id === id));
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedStartDate, setSelectedStartDate] = useState(new Date());

  useEffect(() => {
    const found = routines.find((r) => r.id === id);
    if (found) {
      setRoutine(found);
    }
  }, [id, routines]);

  if (!routine || isLoading) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>Loading routine...</ThemedText>
      </ThemedView>
    );
  }

  // Swap functionality moved to Day Flow screen


  const handleMoveExercise = (slot: RoutineExerciseSlot, direction: 'up' | 'down') => {
    const currentDayIndex = slot.dayIndex;
    let targetDayIndex: number;

    if (direction === 'up') {
      targetDayIndex = Math.max(0, currentDayIndex - 1);
    } else {
      targetDayIndex = Math.min(6, currentDayIndex + 1);
    }

    if (targetDayIndex === currentDayIndex) return;

    const slotsForTargetDay = routine.slots.filter((s) => s.dayIndex === targetDayIndex);
    const newOrder = slotsForTargetDay.length;

    const updatedSlots = routine.slots.map((s) => {
      if (s.id === slot.id) {
        return { ...s, dayIndex: targetDayIndex, order: newOrder };
      }
      // Update order for slots in the source day
      if (s.dayIndex === currentDayIndex && s.order > slot.order) {
        return { ...s, order: s.order - 1 };
      }
      // Update order for slots in the target day that come after
      if (s.dayIndex === targetDayIndex && s.order >= newOrder) {
        return { ...s, order: s.order + 1 };
      }
      return s;
    });

    const updatedRoutine = {
      ...routine,
      slots: updatedSlots,
      updatedAt: new Date().toISOString(),
    };

    setRoutine(updatedRoutine);
    saveRoutine(updatedRoutine);
  };

  const handleMoveDayGroup = (dayIndex: number, direction: 'up' | 'down') => {
    const targetDayIndex = direction === 'up' ? Math.max(0, dayIndex - 1) : Math.min(6, dayIndex + 1);
    if (targetDayIndex === dayIndex) return;

    const updatedSlots = routine.slots.map((slot) => {
      if (slot.dayIndex === dayIndex) {
        return { ...slot, dayIndex: targetDayIndex };
      }
      return slot;
    });

    // Re-normalize order within each day
    const reorderedSlots: RoutineExerciseSlot[] = [];
    for (let d = 0; d < 7; d++) {
      const slotsForDay = updatedSlots
        .filter((s) => s.dayIndex === d)
        .sort((a, b) => a.order - b.order)
        .map((s, idx) => ({ ...s, order: idx }));
      reorderedSlots.push(...slotsForDay);
    }

    const updatedRoutine = {
      ...routine,
      slots: reorderedSlots,
      updatedAt: new Date().toISOString(),
    };

    setRoutine(updatedRoutine);
    saveRoutine(updatedRoutine);
  };

  const handleNavigateToDayFlow = (dayIndex: number) => {
    router.push(`/routines/${id}/day/${dayIndex}`);
  };

  const handleConfirmAndStart = async () => {
    if (!routine) return;

    // Save any changes to the routine
    await saveRoutine(routine);

    // Show date picker
    setShowDatePicker(true);
  };

  const handleDateSelected = async (event: DateTimePickerEvent, date?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    
    if (event.type === 'set' && date) {
      if (Platform.OS === 'ios') {
        setShowDatePicker(false);
      }
      
      setSelectedStartDate(date);
      
      // Convert date to YYYY-MM-DD format
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const startDateString = `${year}-${month}-${day}`;

      try {
        const weekPlan = await createWeekPlanFromRoutine(routine, startDateString);
        if (weekPlan) {
          // Schedule notifications for all sessions
          for (const session of weekPlan.scheduledSessions) {
            const exercise = getExerciseById(session.exerciseId);
            if (exercise) {
              await scheduleSessionNotifications(session, exercise);
            }
          }
          
          Alert.alert('Success', 'Your routine has been scheduled!', [
            { text: 'OK', onPress: () => router.push('/(tabs)/calendar') },
          ]);
        } else {
          Alert.alert('Error', 'Failed to create week plan. Please try again.');
        }
      } catch (error) {
        console.error('Error creating week plan:', error);
        Alert.alert('Error', 'An error occurred. Please try again.');
      }
    } else if (event.type === 'dismissed') {
      setShowDatePicker(false);
    }
  };

  const getSlotsByDay = (dayIndex: number): RoutineExerciseSlot[] => {
    return routine.slots
      .filter((s) => s.dayIndex === dayIndex)
      .sort((a, b) => a.order - b.order);
  };

  const estimateExerciseMinutes = (exercise: Exercise): number => {
    if (exercise.timeToComplete) {
      const match = exercise.timeToComplete.match(/(\d+)/);
      if (match) {
        const num = parseInt(match[1], 10);
        const rangeMatch = exercise.timeToComplete.match(/(\d+)[–-](\d+)/);
        if (rangeMatch) {
          const min = parseInt(rangeMatch[1], 10);
          const max = parseInt(rangeMatch[2], 10);
          return Math.round((min + max) / 2);
        }
        return num;
      }
    }
    return 3;
  };

  const getDaySummary = (
    dayIndex: number
  ): { headline: string; lines: string[]; totalMinutes: number } => {
    const daySlots = getSlotsByDay(dayIndex);
    if (daySlots.length === 0) {
      return { headline: 'Rest day', lines: [], totalMinutes: 0 };
    }

    const dayTotalMinutes = daySlots.reduce((sum, slot) => sum + slot.estimatedMinutes, 0);

    // Unique exercises in the order they first appear
    const uniqueExerciseIds: string[] = [];
    daySlots.forEach((slot) => {
      if (!uniqueExerciseIds.includes(slot.exerciseId)) {
        uniqueExerciseIds.push(slot.exerciseId);
      }
    });

    const count = uniqueExerciseIds.length;

    let patternLabel = 'pattern';
    if (count === 2) patternLabel = 'ABABAB format';
    else if (count === 3) patternLabel = 'ABCABC format';
    else if (count === 4) patternLabel = 'AABBCCDD format';

    const headline = `${count} exercise${count > 1 ? 's' : ''} in an ${patternLabel}:`;

    const letters = ['A', 'B', 'C', 'D'];
    const lines = uniqueExerciseIds.map((id, idx) => {
      const exercise = getExerciseById(id);
      const letter = letters[idx] || '?';
      return `(${letter}) ${exercise ? exercise.name : 'Exercise'}`;
    });

    return { headline, lines, totalMinutes: dayTotalMinutes };
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <ThemedText type="title" style={styles.title}>
            {routine.name}
          </ThemedText>
          <ThemedText style={styles.description}>{routine.description}</ThemedText>
        </View>

        <View style={styles.summary}>
          <View style={styles.summaryItem}>
            <Ionicons name="calendar-outline" size={20} color="#007AFF" />
            <ThemedText style={styles.summaryText}>
              {routine.daysPerWeek} days/week
            </ThemedText>
          </View>
          <View style={styles.summaryItem}>
            <Ionicons name="time-outline" size={20} color="#007AFF" />
            <ThemedText style={styles.summaryText}>
              {routine.totalWeeklyMinutes} min/week
            </ThemedText>
          </View>
          <View style={styles.summaryItem}>
            <Ionicons name="fitness-outline" size={20} color="#007AFF" />
            <ThemedText style={styles.summaryText}>
              {routine.exerciseIds.length} exercises
            </ThemedText>
          </View>
        </View>

        <ThemedText type="subtitle" style={styles.sectionTitle}>
          Weekly Schedule
        </ThemedText>

        {[0, 1, 2, 3, 4, 5, 6].map((dayIndex) => {
          const daySlots = getSlotsByDay(dayIndex);
          const summary = getDaySummary(dayIndex);

          return (
            <TouchableOpacity
              key={dayIndex}
              style={styles.dayCard}
              onPress={() => handleNavigateToDayFlow(dayIndex)}
              activeOpacity={0.7}
            >
              <View style={styles.dayCardHeader}>
                <View style={styles.dayCardTitleRow}>
                  <ThemedText type="subtitle" style={styles.dayNumber}>
                    Day {dayIndex + 1}
                  </ThemedText>
                  {daySlots.length > 0 && (
                    <View style={styles.dayControls}>
                      <ThemedText style={styles.dayTotalMinutes}>
                        {summary.totalMinutes} min
                      </ThemedText>
                      <View style={styles.dayMoveArrows}>
                        <TouchableOpacity
                          onPress={(e) => {
                            e.stopPropagation();
                            handleMoveDayGroup(dayIndex, 'up');
                          }}
                          disabled={dayIndex === 0}
                          style={[
                            styles.arrowButton,
                            dayIndex === 0 && styles.arrowButtonDisabled,
                          ]}
                        >
                          <Ionicons
                            name="chevron-up"
                            size={18}
                            color={dayIndex === 0 ? '#ccc' : '#007AFF'}
                          />
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={(e) => {
                            e.stopPropagation();
                            handleMoveDayGroup(dayIndex, 'down');
                          }}
                          disabled={dayIndex === 6}
                          style={[
                            styles.arrowButton,
                            dayIndex === 6 && styles.arrowButtonDisabled,
                          ]}
                        >
                          <Ionicons
                            name="chevron-down"
                            size={18}
                            color={dayIndex === 6 ? '#ccc' : '#007AFF'}
                          />
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}
                </View>
                <ThemedText style={styles.daySummary}>{summary.headline}</ThemedText>
                {summary.lines.map((line) => (
                  <ThemedText key={line} style={styles.dayLine}>
                    {line}
                  </ThemedText>
                ))}
              </View>

              <View style={styles.dayCardFooter}>
                <Ionicons name="chevron-forward" size={20} color="#007AFF" />
                <ThemedText style={styles.viewDetailsText}>View details</ThemedText>
              </View>
            </TouchableOpacity>
          );
        })}

        <Button
          title="Confirm & Set Start Date"
          onPress={handleConfirmAndStart}
          style={styles.confirmButton}
        />
      </ScrollView>

      {/* Date Picker Modal */}
      {showDatePicker && (
        <>
          {Platform.OS === 'ios' && (
            <Modal
              visible={showDatePicker}
              transparent={true}
              animationType="slide"
              onRequestClose={() => setShowDatePicker(false)}
            >
              <View style={styles.datePickerModal}>
                <View style={styles.datePickerContent}>
                  <View style={styles.datePickerHeader}>
                    <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                      <ThemedText style={styles.datePickerCancel}>Cancel</ThemedText>
                    </TouchableOpacity>
                    <ThemedText type="subtitle">Select Start Date</ThemedText>
                    <TouchableOpacity
                      onPress={() => handleDateSelected({ type: 'set' } as DateTimePickerEvent, selectedStartDate)}
                    >
                      <ThemedText style={styles.datePickerDone}>Done</ThemedText>
                    </TouchableOpacity>
                  </View>
                  <DateTimePicker
                    value={selectedStartDate}
                    mode="date"
                    display="spinner"
                    minimumDate={new Date()}
                    onChange={(event, date) => {
                      if (date) {
                        setSelectedStartDate(date);
                      }
                    }}
                  />
                </View>
              </View>
            </Modal>
          )}
          {Platform.OS === 'android' && (
            <DateTimePicker
              value={selectedStartDate}
              mode="date"
              display="default"
              minimumDate={new Date()}
              onChange={handleDateSelected}
            />
          )}
        </>
      )}

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
    paddingTop: 20,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    marginBottom: 8,
  },
  description: {
    opacity: 0.7,
    fontSize: 16,
  },
  summary: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 32,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#f5f5f5',
  },
  summaryItem: {
    alignItems: 'center',
    gap: 4,
  },
  summaryText: {
    fontSize: 14,
    fontWeight: '600',
  },
  sectionTitle: {
    marginBottom: 16,
    fontSize: 20,
  },
  dayCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  dayCardHeader: {
    marginBottom: 12,
  },
  dayCardTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  dayNumber: {
    fontSize: 18,
    fontWeight: '600',
  },
  dayTotalMinutes: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
  },
  dayControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dayMoveArrows: {
    flexDirection: 'column',
  },
  daySummary: {
    fontSize: 13,
    opacity: 0.7,
    lineHeight: 18,
  },
  dayLine: {
    fontSize: 13,
    opacity: 0.7,
  },
  exercisesList: {
    marginBottom: 12,
  },
  exerciseRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  exerciseInfo: {
    flex: 1,
    marginRight: 12,
  },
  exerciseNameCompact: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2,
  },
  exerciseMinutesCompact: {
    fontSize: 12,
    opacity: 0.6,
  },
  moveArrows: {
    flexDirection: 'column',
    gap: 4,
  },
  arrowButton: {
    padding: 4,
  },
  arrowButtonDisabled: {
    opacity: 0.3,
  },
  dayCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  viewDetailsText: {
    fontSize: 14,
    color: '#007AFF',
    marginLeft: 4,
  },
  confirmButton: {
    marginTop: 24,
    marginBottom: 40,
  },
  datePickerModal: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  datePickerContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 20,
  },
  datePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  datePickerCancel: {
    color: '#007AFF',
    fontSize: 16,
  },
  datePickerDone: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

