import { Button } from '@/components/Button';
import { ExerciseCard } from '@/components/ExerciseCard';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useExercises } from '@/hooks/useExercises';
import { useRoutines } from '@/hooks/useRoutines';
import { RoutineExerciseSlot } from '@/types';
import { BodyArea, Exercise, Goal, Intensity } from '@/types/exercise';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useLayoutEffect, useState } from 'react';
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

const goalLabels: Record<Goal, string> = {
  pain_management: 'Pain Management',
  strength: 'Strength',
  mobility: 'Mobility',
  posture: 'Posture',
  endurance: 'Endurance',
};

const intensityLabels: Record<Intensity, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
};

export default function DayFlowScreen() {
  const { id, dayIndex: dayIndexParam } = useLocalSearchParams<{ id: string; dayIndex: string }>();
  const dayIndex = parseInt(dayIndexParam || '0', 10);
  const { routines, saveRoutine, isLoading } = useRoutines();
  const { allExercises, getExerciseById } = useExercises();
  const navigation = useNavigation();

  const [routine, setRoutine] = useState(routines.find((r) => r.id === id));
  const [swapSlot, setSwapSlot] = useState<RoutineExerciseSlot | null>(null);
  const [showExerciseSelector, setShowExerciseSelector] = useState(false);

  useEffect(() => {
    const found = routines.find((r) => r.id === id);
    if (found) {
      setRoutine(found);
    }
  }, [id, routines]);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: `Day ${dayIndex + 1}`,
    });
  }, [navigation, dayIndex]);

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

    // Swap all instances of this exercise in the day
    const updatedSlots = routine.slots.map((s) =>
      s.dayIndex === dayIndex && s.exerciseId === swapSlot.exerciseId
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

  // Get unique exercises in the order they first appear
  const uniqueExerciseIds: string[] = [];
  const exerciseIdToFirstSlot: Record<string, RoutineExerciseSlot> = {};
  daySlots.forEach((slot) => {
    if (!uniqueExerciseIds.includes(slot.exerciseId)) {
      uniqueExerciseIds.push(slot.exerciseId);
      exerciseIdToFirstSlot[slot.exerciseId] = slot;
    }
  });

  const uniqueExerciseCount = uniqueExerciseIds.length;
  const letters = ['A', 'B', 'C', 'D', 'E', 'F'];
  
  // Calculate pattern format (e.g., "ABCABC")
  const patternRepeats = uniqueExerciseCount > 0 ? Math.floor(daySlots.length / uniqueExerciseCount) : 0;
  const basePattern = letters.slice(0, uniqueExerciseCount).join('');
  
  let patternLabel = '';
  if (uniqueExerciseCount === 1) {
    patternLabel = 'A'.repeat(daySlots.length);
  } else if (uniqueExerciseCount === 2) {
    patternLabel = 'ABABAB';
  } else if (uniqueExerciseCount === 3) {
    patternLabel = 'ABCABC';
  } else if (uniqueExerciseCount === 4) {
    patternLabel = 'AABBCCDD';
  } else {
    // For other counts, repeat the base pattern
    patternLabel = basePattern.repeat(patternRepeats > 0 ? patternRepeats : 1);
  }

  return (
    <ThemedView style={styles.container}>
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
                {uniqueExerciseCount} exercise{uniqueExerciseCount > 1 ? 's' : ''} • {dayTotalMinutes} minutes total
              </ThemedText>
              <ThemedText style={styles.summaryFormat}>
                Format: {patternLabel}
              </ThemedText>
            </View>

            <ThemedText type="subtitle" style={styles.sectionTitle}>
              Exercises
            </ThemedText>

            {uniqueExerciseIds.map((exerciseId, idx) => {
              const exercise = getExerciseById(exerciseId);
              if (!exercise) return null;
              const letter = letters[idx] || '?';
              const firstSlot = exerciseIdToFirstSlot[exerciseId];
              const bodyAreasText = exercise.bodyAreas.map((area) => bodyAreaLabels[area]).join(', ');

              return (
                <View key={exerciseId} style={styles.exerciseCard}>
                  <ThemedView style={styles.exerciseCardInner}>
                    <ThemedText type="defaultSemiBold" style={styles.exerciseTitle}>
                      {letter}. {exercise.name}
                    </ThemedText>
                    <ThemedText style={styles.exerciseBodyAreas}>
                      {bodyAreasText}
                    </ThemedText>
                    
                    {exercise.description && (
                      <ThemedText style={styles.exerciseDescription}>
                        {exercise.description}
                      </ThemedText>
                    )}

                    <View style={styles.exerciseTags}>
                      {exercise.goals.map((g) => (
                        <View key={g} style={styles.exerciseTag}>
                          <ThemedText style={styles.exerciseTagText}>{goalLabels[g]}</ThemedText>
                        </View>
                      ))}
                      <View style={[styles.exerciseTag, styles.intensityTag]}>
                        <ThemedText style={styles.exerciseTagText}>{intensityLabels[exercise.intensity]}</ThemedText>
                      </View>
                    </View>

                    {(exercise.equipment.length > 0 ||
                      exercise.sets ||
                      exercise.reps ||
                      exercise.holdTime) && (
                      <View style={styles.exerciseMetaInfo}>
                        {exercise.equipment.length > 0 && exercise.equipment[0] !== 'none' && (
                          <ThemedText style={styles.exerciseMetaText}>
                            Equipment: {exercise.equipment.map((eq) => {
                              const equipmentLabels: Record<string, string> = {
                                none: 'None',
                                dumbbells: 'Dumbbells',
                                exercise_ball: 'Exercise Ball',
                                resistance_band: 'Resistance Band',
                                chair: 'Chair',
                                step: 'Step',
                                foam_roll: 'Foam Roll',
                              };
                              return equipmentLabels[eq] || eq;
                            }).join(', ')}
                          </ThemedText>
                        )}
                        {exercise.sets && (
                          <ThemedText style={styles.exerciseMetaText}>
                            Sets: {exercise.sets.match(/(\d+)[–-](\d+)/) ? exercise.sets.match(/(\d+)[–-](\d+)/)![2] : exercise.sets.match(/(\d+)/)?.[1] || exercise.sets}
                          </ThemedText>
                        )}
                        {exercise.reps && (
                          <ThemedText style={styles.exerciseMetaText}>
                            Reps: {exercise.reps.match(/(\d+)[–-](\d+)/) ? exercise.reps.match(/(\d+)[–-](\d+)/)![2] : exercise.reps.match(/(\d+)/)?.[1] || exercise.reps}
                          </ThemedText>
                        )}
                        {exercise.holdTime && (
                          <ThemedText style={styles.exerciseMetaText}>Hold: {exercise.holdTime}</ThemedText>
                        )}
                      </View>
                    )}
                    
                    {exercise.notes && (
                      <ThemedText style={styles.exerciseNotes}>Note: {exercise.notes}</ThemedText>
                    )}

                    <View style={styles.exerciseMeta}>
                      <ThemedText style={styles.exerciseTime}>
                        Estimated time: {firstSlot.estimatedMinutes} minutes
                      </ThemedText>
                    </View>
                    <View style={styles.swapButtonWrapper}>
                      <Button
                        title="Swap"
                        onPress={() => handleSwapExercise(firstSlot)}
                        variant="outline"
                        style={styles.swapButton}
                      />
                    </View>
                  </ThemedView>
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
    marginBottom: 4,
  },
  summaryFormat: {
    fontSize: 14,
    opacity: 0.7,
    fontStyle: 'italic',
  },
  sectionTitle: {
    fontSize: 20,
    marginBottom: 16,
  },
  exerciseCard: {
    marginBottom: 20,
  },
  exerciseCardInner: {
    padding: 16,
    borderRadius: 12,
  },
  exerciseTitle: {
    fontSize: 18,
    marginBottom: 4,
  },
  exerciseBodyAreas: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 12,
  },
  exerciseDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
    opacity: 0.8,
  },
  exerciseTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  exerciseTag: {
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  intensityTag: {
    backgroundColor: '#fff3e0',
  },
  exerciseTagText: {
    fontSize: 12,
    color: '#1976d2',
    fontWeight: '500',
  },
  exerciseMetaInfo: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 8,
  },
  exerciseMetaText: {
    fontSize: 12,
    opacity: 0.6,
  },
  exerciseNotes: {
    fontSize: 12,
    opacity: 0.6,
    fontStyle: 'italic',
    marginTop: 8,
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

