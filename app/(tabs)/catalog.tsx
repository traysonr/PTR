import React, { useState } from 'react';
import { StyleSheet, ScrollView, View, FlatList, TouchableOpacity } from 'react-native';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { ExerciseCard } from '@/components/ExerciseCard';
import { TextInput } from '@/components/TextInput';
import { Button } from '@/components/Button';
import { useExercises } from '@/hooks/useExercises';
import { BodyPart, Goal } from '@/types';
import { Ionicons } from '@expo/vector-icons';
// TODO: Add proper picker component - for now using simple buttons

const BODY_PARTS: BodyPart[] = ['neck', 'lower-back', 'shoulders', 'knees', 'hips', 'ankles'];
const GOALS: Goal[] = ['pain-reduction', 'strength', 'mobility', 'post-surgery-rehab'];

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

export default function CatalogScreen() {
  const {
    exercises,
    searchQuery,
    setSearchQuery,
    selectedBodyPart,
    setSelectedBodyPart,
    selectedGoal,
    setSelectedGoal,
    clearFilters,
  } = useExercises();

  const [showFilters, setShowFilters] = useState(false);

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText type="title" style={styles.title}>
          Exercise Catalog
        </ThemedText>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search exercises..."
          style={styles.searchInput}
        />
        <Button
          title={showFilters ? 'Hide Filters' : 'Filters'}
          variant="outline"
          onPress={() => setShowFilters(!showFilters)}
          style={styles.filterToggleButton}
        />
      </View>

      {/* Filters */}
      {showFilters && (
        <ThemedView style={styles.filtersContainer}>
          <ThemedText style={styles.filterSectionTitle}>Body Part</ThemedText>
          <View style={styles.filterButtons}>
            <TouchableOpacity
              style={[
                styles.filterButton,
                !selectedBodyPart && styles.filterButtonActive,
              ]}
              onPress={() => setSelectedBodyPart(null)}
            >
              <ThemedText
                style={[
                  styles.filterButtonText,
                  !selectedBodyPart && styles.filterButtonTextActive,
                ]}
              >
                All
              </ThemedText>
            </TouchableOpacity>
            {BODY_PARTS.map((part) => (
              <TouchableOpacity
                key={part}
                style={[
                  styles.filterButton,
                  selectedBodyPart === part && styles.filterButtonActive,
                ]}
                onPress={() =>
                  setSelectedBodyPart(selectedBodyPart === part ? null : part)
                }
              >
                <ThemedText
                  style={[
                    styles.filterButtonText,
                    selectedBodyPart === part && styles.filterButtonTextActive,
                  ]}
                >
                  {bodyPartLabels[part]}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </View>

          <ThemedText style={styles.filterSectionTitle}>Goal</ThemedText>
          <View style={styles.filterButtons}>
            <TouchableOpacity
              style={[
                styles.filterButton,
                !selectedGoal && styles.filterButtonActive,
              ]}
              onPress={() => setSelectedGoal(null)}
            >
              <ThemedText
                style={[
                  styles.filterButtonText,
                  !selectedGoal && styles.filterButtonTextActive,
                ]}
              >
                All
              </ThemedText>
            </TouchableOpacity>
            {GOALS.map((goal) => (
              <TouchableOpacity
                key={goal}
                style={[
                  styles.filterButton,
                  selectedGoal === goal && styles.filterButtonActive,
                ]}
                onPress={() => setSelectedGoal(selectedGoal === goal ? null : goal)}
              >
                <ThemedText
                  style={[
                    styles.filterButtonText,
                    selectedGoal === goal && styles.filterButtonTextActive,
                  ]}
                >
                  {goalLabels[goal]}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </View>

          {(selectedBodyPart || selectedGoal || searchQuery) && (
            <Button
              title="Clear All Filters"
              variant="outline"
              onPress={clearFilters}
              style={styles.clearAllButton}
            />
          )}
        </ThemedView>
      )}

      {/* Exercise List */}
      <FlatList
        data={exercises}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ExerciseCard exercise={item} />}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <ThemedText style={styles.emptyText}>
              No exercises found. Try adjusting your filters or search.
            </ThemedText>
          </View>
        }
        ListHeaderComponent={
          <ThemedText style={styles.resultCount}>
            {exercises.length} {exercises.length === 1 ? 'exercise' : 'exercises'} found
          </ThemedText>
        }
      />
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
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 16,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    marginBottom: 0,
  },
  filterToggleButton: {
    minWidth: 80,
  },
  filtersContainer: {
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 12,
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 12,
  },
  filterButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#f5f5f5',
  },
  filterButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  filterButtonTextActive: {
    color: '#fff',
  },
  clearAllButton: {
    marginTop: 8,
  },
  listContent: {
    padding: 20,
    paddingTop: 0,
  },
  resultCount: {
    marginBottom: 16,
    fontSize: 14,
    opacity: 0.7,
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    opacity: 0.7,
    textAlign: 'center',
  },
});

