import { Button } from '@/components/Button';
import { ExerciseCard } from '@/components/ExerciseCard';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useExercises } from '@/hooks/useExercises';
import { useRoutines } from '@/hooks/useRoutines';
import { RoutineExerciseSlot } from '@/types';
import { BodyArea, Exercise } from '@/types/exercise';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Modal, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

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

export default function DayFlowScreen() {
  const { id, dayIndex: dayIndexParam } = useLocalSearchParams<{ id: string; dayIndex: string }>();
  const dayIndex = parseInt(dayIndexParam || '0', 10);
  const { routines, saveRoutine, isLoading } = useRoutines();
  const { allExercises, getExerciseById } = useExercises();

  const [routine, setRoutine] = useState(routines.find((r) => r.id === id));
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
        <ThemedText>Loading...</ThemedText>
      </ThemedView>
    );
  }

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
    saveRoutine(updatedRoutine);
    setShowExerciseSelector(false);
    setSwapSlot(null);
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

  const daySlots = getSlotsByDay(dayIndex);
  const dayTotalMinutes = daySlots.reduce((sum, slot) => sum + slot.estimatedMinutes, 0);

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <ThemedText type="title" style={styles.title}>
          Day {dayIndex + 1}
        </ThemedText>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {daySlots.length === 0 ? (
          <View style={styles.emptyState}>
            <ThemedText style={styles.emptyText}>Rest Day</ThemedText>
            <ThemedText style={styles.emptySubtext}>
              No exercises scheduled for this day.
            </ThemedText>
          </View>
        ) : (
          <>
            <View style={styles.summaryCard}>
              <ThemedText type="subtitle" style={styles.summaryTitle}>
                Day Overview
              </ThemedText>
              <ThemedText style={styles.summaryText}>
                {daySlots.length} exercise{daySlots.length > 1 ? 's' : ''} • {dayTotalMinutes} minutes total
              </ThemedText>
            </View>

            <ThemedText type="subtitle" style={styles.sectionTitle}>
              Exercises
            </ThemedText>

            {daySlots.map((slot) => {
              const exercise = getExerciseById(slot.exerciseId);
              if (!exercise) return null;

              return (
                <View key={slot.id} style={styles.exerciseCard}>
                  <ExerciseCard exercise={exercise} showDescription={true} mode="day" />
                  <View style={styles.exerciseMeta}>
                    <ThemedText style={styles.exerciseTime}>
                      Estimated time: {slot.estimatedMinutes} minutes
                    </ThemedText>
                  </View>
                  <View style={styles.swapButtonWrapper}>
                    <Button
                      title="Swap"
                      onPress={() => handleSwapExercise(slot)}
                      variant="outline"
                      style={styles.swapButton}
                    />
                  </View>
                </View>
              );
            })}
          </>
        )}
      </ScrollView>

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
              {getSwapCandidates().length === 0 ? (
                <ThemedText style={styles.noCandidates}>
                  No suitable replacement exercises found.
                </ThemedText>
              ) : (
                getSwapCandidates().map((exercise) => (
                  <TouchableOpacity
                    key={exercise.id}
                    onPress={() => handleSelectReplacement(exercise)}
                    style={styles.exerciseOption}
                  >
                    <ExerciseCard exercise={exercise} showDescription={false} />
                  </TouchableOpacity>
                ))
              )}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
  },
  placeholder: {
    width: 32,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
    opacity: 0.5,
  },
  emptySubtext: {
    fontSize: 14,
    opacity: 0.5,
  },
  summaryCard: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  summaryTitle: {
    fontSize: 18,
    marginBottom: 8,
  },
  summaryText: {
    fontSize: 14,
    opacity: 0.7,
  },
  sectionTitle: {
    fontSize: 20,
    marginBottom: 16,
  },
  exerciseCard: {
    marginBottom: 20,
  },
  exerciseMeta: {
    marginTop: 12,
    marginBottom: 12,
  },
  exerciseTime: {
    fontSize: 14,
    opacity: 0.7,
    fontStyle: 'italic',
  },
  swapButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    alignSelf: 'flex-start',
  },
  swapButtonWrapper: {
    alignItems: 'flex-end',
    marginTop: 4,
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
  noCandidates: {
    textAlign: 'center',
    padding: 20,
    opacity: 0.6,
  },
});

