import { Button } from '@/components/Button';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useProfile } from '@/hooks/useProfile';
import { useRoutines } from '@/hooks/useRoutines';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

export default function RoutinesScreen() {
  const { routines, activeRoutine, isLoading, createRoutineFromProfile, setActiveRoutine } =
    useRoutines();
  const { profile } = useProfile();
  const [generating, setGenerating] = useState(false);

  const handleGenerateRoutine = async () => {
    if (!profile) {
      Alert.alert('Profile Required', 'Please create a profile first.');
      router.push('/(tabs)/profile');
      return;
    }

    setGenerating(true);
    try {
      const routine = await createRoutineFromProfile();
      router.push(`/routines/${routine.id}`);
    } catch (error) {
      Alert.alert('Error', 'Failed to generate routine. Please try again.');
      console.error(error);
    } finally {
      setGenerating(false);
    }
  };

  if (isLoading) {
    return (
      <ThemedView style={styles.container}>
        <ActivityIndicator size="large" style={styles.loader} />
      </ThemedView>
    );
  }

  if (routines.length === 0) {
    return (
      <ThemedView style={styles.container}>
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.emptyContent}>
          <ThemedText type="title" style={styles.emptyTitle}>
            No Routines Yet
          </ThemedText>
          <ThemedText style={styles.emptyDescription}>
            Create your first routine to get started. We'll generate a personalized 7-day routine
            based on your profile preferences.
          </ThemedText>
          <Button
            title="Generate Your First Routine"
            onPress={handleGenerateRoutine}
            loading={generating}
            style={styles.generateButton}
          />
        </ScrollView>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <ThemedText type="title" style={styles.title}>
            Routines
          </ThemedText>
          <Button
            title="New Routine"
            onPress={handleGenerateRoutine}
            loading={generating}
            variant="outline"
            style={styles.newButton}
          />
        </View>

        <View style={styles.routinesList}>
          {routines.map((routine) => (
            <TouchableOpacity
              key={routine.id}
              style={[
                styles.routineCard,
                activeRoutine?.id === routine.id && styles.routineCardActive,
              ]}
              onPress={() => router.push(`/routines/${routine.id}`)}
            >
              <View style={styles.routineHeader}>
                <View style={styles.routineInfo}>
                  <ThemedText type="subtitle" style={styles.routineName}>
                    {routine.name}
                  </ThemedText>
                  {activeRoutine?.id === routine.id && (
                    <View style={styles.activeBadge}>
                      <ThemedText style={styles.activeBadgeText}>Active</ThemedText>
                    </View>
                  )}
                </View>
                <Ionicons name="chevron-forward" size={20} color="#666" />
              </View>

              <ThemedText style={styles.routineDescription}>{routine.description}</ThemedText>

              <View style={styles.routineMeta}>
                <View style={styles.metaItem}>
                  <Ionicons name="calendar-outline" size={16} color="#666" />
                  <ThemedText style={styles.metaText}>{routine.daysPerWeek} days/week</ThemedText>
                </View>
                <View style={styles.metaItem}>
                  <Ionicons name="time-outline" size={16} color="#666" />
                  <ThemedText style={styles.metaText}>
                    {routine.totalWeeklyMinutes} min/week
                  </ThemedText>
                </View>
                <View style={styles.metaItem}>
                  <Ionicons name="fitness-outline" size={16} color="#666" />
                  <ThemedText style={styles.metaText}>
                    {[...new Set(routine.slots.map((s) => s.exerciseId))].length} exercises
                  </ThemedText>
                </View>
              </View>

              {activeRoutine?.id !== routine.id && (
                <Button
                  title="Set as Active"
                  onPress={() => setActiveRoutine(routine.id)}
                  variant="outline"
                  style={styles.setActiveButton}
                />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
  },
  newButton: {
    minWidth: 120,
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
  generateButton: {
    minWidth: 200,
  },
  routinesList: {
    gap: 16,
  },
  routineCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginBottom: 16,
  },
  routineCardActive: {
    borderColor: '#007AFF',
    backgroundColor: '#f0f7ff',
  },
  routineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  routineInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  routineName: {
    fontSize: 18,
    fontWeight: '600',
  },
  activeBadge: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  activeBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  routineDescription: {
    marginBottom: 12,
    opacity: 0.7,
    fontSize: 14,
  },
  routineMeta: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
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
  setActiveButton: {
    marginTop: 8,
  },
});

