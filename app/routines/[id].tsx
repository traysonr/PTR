import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, View, TouchableOpacity, Alert, Modal, Platform } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/Button';
import { useRoutines } from '@/hooks/useRoutines';
import { useExercises } from '@/hooks/useExercises';
import { useWeekPlans } from '@/hooks/useWeekPlans';
import { useNotifications } from '@/hooks/useNotifications';
import { RoutineExerciseSlot } from '@/types';
import { Exercise, BodyArea } from '@/types/exercise';
import { EXERCISES } from '@/data/exercises';
import { Ionicons } from '@expo/vector-icons';
import { ExerciseCard } from '@/components/ExerciseCard';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const bodyAreaLabels: Record<BodyArea, string> = {
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

export default function RoutineDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { routines, saveRoutine, isLoading } = useRoutines();
  const { allExercises, getExerciseById } = useExercises();
  const { createWeekPlanFromRoutine } = useWeekPlans();
  const { scheduleSessionNotifications } = useNotifications();

  const [routine, setRoutine] = useState(routines.find((r) => r.id === id));
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedStartDate, setSelectedStartDate] = useState(new Date());
  const [swapSlot, setSwapSlot] = useState<RoutineExerciseSlot | null>(null);
  const [showExerciseSelector, setShowExerciseSelector] = useState(false);

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

  const handleSwapExercise = (slot: RoutineExerciseSlot) => {
    setSwapSlot(slot);
    setShowExerciseSelector(true);
  };

  const handleSelectReplacement = (exercise: Exercise) => {
    if (!swapSlot) return;

    const updatedSlots = routine.slots.map((s) =>
      s.id === swapSlot.id
        ? {
            ...s,
            exerciseId: exercise.id,
            estimatedMinutes: estimateExerciseMinutes(exercise),
          }
        : s
    );

    const updatedExerciseIds = [...new Set(updatedSlots.map((s) => s.exerciseId))];

    const updatedRoutine = {
      ...routine,
      slots: updatedSlots,
      exerciseIds: updatedExerciseIds,
      updatedAt: new Date().toISOString(),
    };

    setRoutine(updatedRoutine);
    setShowExerciseSelector(false);
    setSwapSlot(null);
  };

  const handleMoveToDay = (slot: RoutineExerciseSlot, targetDayIndex: number) => {
    if (slot.dayIndex === targetDayIndex) return;

    const slotsForTargetDay = routine.slots.filter((s) => s.dayIndex === targetDayIndex);
    const newOrder = slotsForTargetDay.length;

    const updatedSlots = routine.slots.map((s) => {
      if (s.id === slot.id) {
        return { ...s, dayIndex: targetDayIndex, order: newOrder };
      }
      // Update order for slots in the source day
      if (s.dayIndex === slot.dayIndex && s.order > slot.order) {
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
          // Schedule notifications
          await scheduleSessionNotifications(weekPlan.scheduledSessions);
          
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

  // Filter exercises for swap selector (similar body areas and time)
  const getSwapCandidates = (): Exercise[] => {
    if (!swapSlot) return [];

    const currentExercise = getExerciseById(swapSlot.exerciseId);
    if (!currentExercise) return allExercises;

    const currentMinutes = swapSlot.estimatedMinutes;
    const currentAreas = currentExercise.bodyAreas;

    return allExercises.filter((exercise) => {
      const exerciseMinutes = estimateExerciseMinutes(exercise);
      const hasMatchingArea = exercise.bodyAreas.some((area) => currentAreas.includes(area));
      const timeDiff = Math.abs(exerciseMinutes - currentMinutes);
      
      return hasMatchingArea && timeDiff <= 5; // Within 5 minutes
    });
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
          7-Day Schedule
        </ThemedText>

        {[0, 1, 2, 3, 4, 5, 6].map((dayIndex) => {
          const daySlots = getSlotsByDay(dayIndex);
          const dayTotalMinutes = daySlots.reduce((sum, slot) => sum + slot.estimatedMinutes, 0);

          return (
            <View key={dayIndex} style={styles.daySection}>
              <View style={styles.dayHeader}>
                <ThemedText type="subtitle" style={styles.dayLabel}>
                  {DAY_LABELS[dayIndex]}
                </ThemedText>
                {daySlots.length > 0 && (
                  <ThemedText style={styles.dayTotal}>{dayTotalMinutes} min</ThemedText>
                )}
              </View>

              {daySlots.length === 0 ? (
                <ThemedText style={styles.restDay}>Rest Day</ThemedText>
              ) : (
                daySlots.map((slot) => {
                  const exercise = getExerciseById(slot.exerciseId);
                  if (!exercise) return null;

                  return (
                    <View key={slot.id} style={styles.slotCard}>
                      <View style={styles.slotHeader}>
                        <View style={styles.slotInfo}>
                          <ThemedText style={styles.exerciseName}>{exercise.name}</ThemedText>
                          <ThemedText style={styles.exerciseAreas}>
                            {exercise.bodyAreas.map((area) => bodyAreaLabels[area]).join(', ')}
                          </ThemedText>
                        </View>
                        <ThemedText style={styles.slotMinutes}>
                          {slot.estimatedMinutes} min
                        </ThemedText>
                      </View>

                      <View style={styles.slotActions}>
                        <Button
                          title="Swap"
                          onPress={() => handleSwapExercise(slot)}
                          variant="outline"
                          style={styles.actionButton}
                        />
                        <View style={styles.moveButtons}>
                          {[0, 1, 2, 3, 4, 5, 6]
                            .filter((d) => d !== dayIndex)
                            .slice(0, 3)
                            .map((targetDay) => (
                              <Button
                                key={targetDay}
                                title={DAY_LABELS[targetDay]}
                                onPress={() => handleMoveToDay(slot, targetDay)}
                                variant="outline"
                                style={styles.moveButton}
                              />
                            ))}
                        </View>
                      </View>
                    </View>
                  );
                })
              )}
            </View>
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

      {/* Exercise Selector Modal */}
      <Modal
        visible={showExerciseSelector}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowExerciseSelector(false)}
      >
        <ThemedView style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <ThemedText type="subtitle">Select Replacement Exercise</ThemedText>
              <TouchableOpacity onPress={() => setShowExerciseSelector(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalScroll}>
              {getSwapCandidates().map((exercise) => (
                <TouchableOpacity
                  key={exercise.id}
                  onPress={() => handleSelectReplacement(exercise)}
                  style={styles.exerciseOption}
                >
                  <ExerciseCard exercise={exercise} showDescription={false} />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </ThemedView>
      </Modal>
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
  daySection: {
    marginBottom: 24,
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  dayLabel: {
    fontSize: 18,
  },
  dayTotal: {
    fontSize: 14,
    opacity: 0.7,
  },
  restDay: {
    opacity: 0.5,
    fontStyle: 'italic',
    paddingVertical: 12,
  },
  slotCard: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginBottom: 12,
  },
  slotHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  slotInfo: {
    flex: 1,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  exerciseAreas: {
    fontSize: 13,
    opacity: 0.7,
  },
  slotMinutes: {
    fontSize: 14,
    fontWeight: '500',
  },
  slotActions: {
    marginTop: 8,
    gap: 8,
  },
  actionButton: {
    minWidth: 100,
  },
  moveButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  moveButton: {
    flex: 1,
  },
  confirmButton: {
    marginTop: 24,
    marginBottom: 40,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalScroll: {
    flex: 1,
  },
  exerciseOption: {
    marginBottom: 12,
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

