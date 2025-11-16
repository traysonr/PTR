import { BodyArea, Equipment, Exercise, Goal, Intensity } from '@/types/exercise';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';

interface ExerciseCardProps {
  exercise: Exercise;
  onPress?: () => void;
  showDescription?: boolean;
  // Optional mode to tweak how meta information is rendered
  // 'default' – show full meta (time, raw sets/reps)
  // 'day' – used in Day Flow: hide time, collapse ranges to max values
  mode?: 'default' | 'day';
}

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

const equipmentLabels: Record<Equipment, string> = {
  none: 'None',
  dumbbells: 'Dumbbells',
  exercise_ball: 'Exercise Ball',
  resistance_band: 'Resistance Band',
  chair: 'Chair',
  step: 'Step',
  foam_roll: 'Foam Roll',
};

function getMaxFromRange(value: string): string {
  const rangeMatch = value.match(/(\d+)[–-](\d+)/);
  if (rangeMatch) {
    return rangeMatch[2];
  }
  const numberMatch = value.match(/(\d+)/);
  if (numberMatch) {
    return numberMatch[1];
  }
  return value;
}

export function ExerciseCard({
  exercise,
  onPress,
  showDescription = true,
  mode = 'default',
}: ExerciseCardProps) {
  const content = (
    <ThemedView style={styles.card}>
      <View style={styles.header}>
        <ThemedText type="defaultSemiBold" style={styles.title}>
          {exercise.name}
        </ThemedText>
        <ThemedText style={styles.bodyAreas}>
          {exercise.bodyAreas.map((area) => bodyAreaLabels[area]).join(', ')}
        </ThemedText>
      </View>

      {showDescription && (
        <ThemedText style={styles.description} numberOfLines={3}>
          {exercise.description}
        </ThemedText>
      )}

      <View style={styles.tags}>
        {exercise.goals.map((g) => (
          <View key={g} style={styles.tag}>
            <ThemedText style={styles.tagText}>{goalLabels[g]}</ThemedText>
          </View>
        ))}
        <View style={[styles.tag, styles.intensityTag]}>
          <ThemedText style={styles.tagText}>{intensityLabels[exercise.intensity]}</ThemedText>
        </View>
      </View>

      {(exercise.equipment.length > 0 ||
        exercise.timeToComplete ||
        exercise.sets ||
        exercise.reps ||
        exercise.holdTime) && (
        <View style={styles.meta}>
          {exercise.equipment.length > 0 && exercise.equipment[0] !== 'none' && (
            <ThemedText style={styles.metaText}>
              Equipment: {exercise.equipment.map((eq) => equipmentLabels[eq]).join(', ')}
            </ThemedText>
          )}
          {exercise.timeToComplete && mode === 'default' && (
            <ThemedText style={styles.metaText}>Time: {exercise.timeToComplete}</ThemedText>
          )}
          {exercise.sets && (
            <ThemedText style={styles.metaText}>
              {mode === 'day'
                ? `Sets: ${getMaxFromRange(exercise.sets)}`
                : `Sets: ${exercise.sets}`}
            </ThemedText>
          )}
          {exercise.reps && (
            <ThemedText style={styles.metaText}>
              {mode === 'day'
                ? `Reps: ${getMaxFromRange(exercise.reps)}`
                : `Reps: ${exercise.reps}`}
            </ThemedText>
          )}
          {exercise.holdTime && (
            <ThemedText style={styles.metaText}>Hold: {exercise.holdTime}</ThemedText>
          )}
        </View>
      )}
      {exercise.notes && (
        <ThemedText style={styles.notes}>Note: {exercise.notes}</ThemedText>
      )}
    </ThemedView>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    marginVertical: 8,
    borderRadius: 12,
    // TODO: Add shadow/elevation for better visual separation
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    flex: 1,
  },
  bodyAreas: {
    fontSize: 14,
    opacity: 0.7,
    marginLeft: 12,
    flex: 1,
    textAlign: 'right',
  },
  notes: {
    fontSize: 12,
    opacity: 0.6,
    fontStyle: 'italic',
    marginTop: 8,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
    opacity: 0.8,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  tag: {
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  intensityTag: {
    backgroundColor: '#fff3e0',
  },
  tagText: {
    fontSize: 12,
    color: '#1976d2',
    fontWeight: '500',
  },
  meta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 8,
  },
  metaText: {
    fontSize: 12,
    opacity: 0.6,
  },
});

