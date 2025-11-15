import React, { useState } from 'react';
import { StyleSheet, ScrollView, View, FlatList, TouchableOpacity } from 'react-native';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { ExerciseCard } from '@/components/ExerciseCard';
import { TextInput } from '@/components/TextInput';
import { Button } from '@/components/Button';
import { useExercises } from '@/hooks/useExercises';
import { BodyArea, Goal, Equipment } from '@/types/exercise';
import { Ionicons } from '@expo/vector-icons';

const BODY_AREAS: BodyArea[] = [
  'neck',
  'upper_back',
  'lower_back',
  'shoulder',
  'hip',
  'knee',
  'ankle',
  'wrist',
  'elbow',
  'core',
];

const GOALS: Goal[] = [
  'pain_management',
  'strength',
  'mobility',
  'posture',
  'endurance',
];

const EQUIPMENT: Equipment[] = [
  'none',
  'dumbbells',
  'exercise_ball',
  'resistance_band',
  'chair',
  'step',
  'foam_roll',
];

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

const equipmentLabels: Record<Equipment, string> = {
  none: 'None',
  dumbbells: 'Dumbbells',
  exercise_ball: 'Exercise Ball',
  resistance_band: 'Resistance Band',
  chair: 'Chair',
  step: 'Step',
  foam_roll: 'Foam Roll',
};

export default function CatalogScreen() {
  const {
    exercises,
    searchQuery,
    setSearchQuery,
    selectedBodyAreas,
    toggleBodyArea,
    showAllBodyAreas,
    setAllBodyAreas,
    selectedGoals,
    toggleGoal,
    showAllGoals,
    setAllGoals,
    selectedEquipment,
    toggleEquipment,
    showAllEquipment,
    setAllEquipment,
    clearFilters,
  } = useExercises();

  const [showFilters, setShowFilters] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    bodyArea: true,
    goal: true,
    equipment: true,
  });

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
          <ScrollView 
            style={styles.filtersScrollView}
            nestedScrollEnabled
            showsVerticalScrollIndicator={false}
          >
            {/* Body Area Section */}
            <TouchableOpacity
              style={styles.sectionHeader}
              onPress={() =>
                setExpandedSections((prev) => ({
                  ...prev,
                  bodyArea: !prev.bodyArea,
                }))
              }
            >
              <ThemedText style={styles.filterSectionTitle}>Body Area</ThemedText>
              <Ionicons
                name={expandedSections.bodyArea ? 'chevron-up' : 'chevron-down'}
                size={20}
                color="#666"
              />
            </TouchableOpacity>
            {expandedSections.bodyArea && (
              <View style={styles.filterButtons}>
            <TouchableOpacity
              style={[
                styles.filterButton,
                showAllBodyAreas && styles.filterButtonActive,
              ]}
              onPress={() => setAllBodyAreas(true)}
            >
              <ThemedText
                style={[
                  styles.filterButtonText,
                  showAllBodyAreas && styles.filterButtonTextActive,
                ]}
              >
                All
              </ThemedText>
            </TouchableOpacity>
            {BODY_AREAS.map((area) => (
              <TouchableOpacity
                key={area}
                style={[
                  styles.filterButton,
                  !showAllBodyAreas && selectedBodyAreas.includes(area) && styles.filterButtonActive,
                ]}
                onPress={() => toggleBodyArea(area)}
              >
                <ThemedText
                  style={[
                    styles.filterButtonText,
                    !showAllBodyAreas && selectedBodyAreas.includes(area) && styles.filterButtonTextActive,
                  ]}
                >
                  {bodyAreaLabels[area]}
                </ThemedText>
              </TouchableOpacity>
            ))}
            </View>
            )}

            {/* Goal Section */}
            <TouchableOpacity
              style={styles.sectionHeader}
              onPress={() =>
                setExpandedSections((prev) => ({
                  ...prev,
                  goal: !prev.goal,
                }))
              }
            >
              <ThemedText style={styles.filterSectionTitle}>Goal</ThemedText>
              <Ionicons
                name={expandedSections.goal ? 'chevron-up' : 'chevron-down'}
                size={20}
                color="#666"
              />
            </TouchableOpacity>
            {expandedSections.goal && (
              <View style={styles.filterButtons}>
            <TouchableOpacity
              style={[
                styles.filterButton,
                showAllGoals && styles.filterButtonActive,
              ]}
              onPress={() => setAllGoals(true)}
            >
              <ThemedText
                style={[
                  styles.filterButtonText,
                  showAllGoals && styles.filterButtonTextActive,
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
                  !showAllGoals && selectedGoals.includes(goal) && styles.filterButtonActive,
                ]}
                onPress={() => toggleGoal(goal)}
              >
                <ThemedText
                  style={[
                    styles.filterButtonText,
                    !showAllGoals && selectedGoals.includes(goal) && styles.filterButtonTextActive,
                  ]}
                >
                  {goalLabels[goal]}
                </ThemedText>
              </TouchableOpacity>
            ))}
            </View>
            )}

            {/* Equipment Section */}
            <TouchableOpacity
              style={styles.sectionHeader}
              onPress={() =>
                setExpandedSections((prev) => ({
                  ...prev,
                  equipment: !prev.equipment,
                }))
              }
            >
              <ThemedText style={styles.filterSectionTitle}>Equipment</ThemedText>
              <Ionicons
                name={expandedSections.equipment ? 'chevron-up' : 'chevron-down'}
                size={20}
                color="#666"
              />
            </TouchableOpacity>
            {expandedSections.equipment && (
              <View style={styles.filterButtons}>
            <TouchableOpacity
              style={[
                styles.filterButton,
                showAllEquipment && styles.filterButtonActive,
              ]}
              onPress={() => setAllEquipment(true)}
            >
              <ThemedText
                style={[
                  styles.filterButtonText,
                  showAllEquipment && styles.filterButtonTextActive,
                ]}
              >
                All
              </ThemedText>
            </TouchableOpacity>
            {EQUIPMENT.map((equipment) => (
              <TouchableOpacity
                key={equipment}
                style={[
                  styles.filterButton,
                  !showAllEquipment && selectedEquipment.includes(equipment) && styles.filterButtonActive,
                ]}
                onPress={() => toggleEquipment(equipment)}
              >
                <ThemedText
                  style={[
                    styles.filterButtonText,
                    !showAllEquipment && selectedEquipment.includes(equipment) && styles.filterButtonTextActive,
                  ]}
                >
                  {equipmentLabels[equipment]}
                </ThemedText>
              </TouchableOpacity>
            ))}
            </View>
            )}

            {/* Action Buttons */}
            <View style={styles.filterActions}>
              {(!showAllBodyAreas || !showAllGoals || !showAllEquipment || searchQuery) && (
                <Button
                  title="Clear All Filters"
                  variant="outline"
                  onPress={clearFilters}
                  style={styles.actionButton}
                />
              )}
              <Button
                title="Apply Filters"
                onPress={() => setShowFilters(false)}
                style={styles.actionButton}
              />
            </View>
          </ScrollView>
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
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 12,
    maxHeight: 500,
    overflow: 'hidden',
  },
  filtersScrollView: {
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    marginTop: 8,
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  filterButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
    marginTop: 12,
  },
  filterActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
    marginBottom: 8,
  },
  actionButton: {
    flex: 1,
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

