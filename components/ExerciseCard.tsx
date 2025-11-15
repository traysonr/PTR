import React from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';
import { Exercise, BodyPart, Goal, Intensity } from '@/types';

interface ExerciseCardProps {
  exercise: Exercise;
  onPress?: () => void;
  showDescription?: boolean;
}

const bodyPartLabels: Record<BodyPart, string> = {
  neck: 'Neck',
  'lower-back': 'Lower Back',
  shoulders: 'Shoulders',
  knees: 'Knees',
  hips: 'Hips',
  ankles: 'Ankles',
};

const goalLabels: Record<Goal, string> = {
  'pain-reduction': 'Pain Reduction',
  strength: 'Strength',
  mobility: 'Mobility',
  'post-surgery-rehab': 'Post-Surgery Rehab',
};

const intensityLabels: Record<Intensity, string> = {
  light: 'Light',
  moderate: 'Moderate',
  high: 'High',
};

export function ExerciseCard({ exercise, onPress, showDescription = true }: ExerciseCardProps) {
  const content = (
    <ThemedView style={styles.card}>
      <View style={styles.header}>
        <ThemedText type="defaultSemiBold" style={styles.title}>
          {exercise.name}
        </ThemedText>
        <ThemedText style={styles.bodyPart}>{bodyPartLabels[exercise.bodyPart]}</ThemedText>
      </View>

      {showDescription && (
        <ThemedText style={styles.description} numberOfLines={3}>
          {exercise.description}
        </ThemedText>
      )}

      <View style={styles.tags}>
        {exercise.goal.map((g) => (
          <View key={g} style={styles.tag}>
            <ThemedText style={styles.tagText}>{goalLabels[g]}</ThemedText>
          </View>
        ))}
        <View style={[styles.tag, styles.intensityTag]}>
          <ThemedText style={styles.tagText}>{intensityLabels[exercise.intensity]}</ThemedText>
        </View>
      </View>

      {(exercise.equipment || exercise.duration || exercise.sets || exercise.reps) && (
        <View style={styles.meta}>
          {exercise.equipment && (
            <ThemedText style={styles.metaText}>Equipment: {exercise.equipment}</ThemedText>
          )}
          {exercise.duration && (
            <ThemedText style={styles.metaText}>Duration: {exercise.duration} min</ThemedText>
          )}
          {(exercise.sets || exercise.reps) && (
            <ThemedText style={styles.metaText}>
              {exercise.sets} sets × {exercise.reps} reps
            </ThemedText>
          )}
        </View>
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
  bodyPart: {
    fontSize: 14,
    opacity: 0.7,
    marginLeft: 12,
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

