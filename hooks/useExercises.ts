import { useMemo, useState, useCallback } from 'react';
import { Exercise, BodyPart, Goal } from '@/types';
import exercisesData from '@/data/exercises.json';

const exercises: Exercise[] = exercisesData as Exercise[];

export function useExercises() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBodyPart, setSelectedBodyPart] = useState<BodyPart | null>(null);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);

  // Filter exercises based on search and filters
  const filteredExercises = useMemo(() => {
    let filtered = exercises;

    // Filter by body part
    if (selectedBodyPart) {
      filtered = filtered.filter((e) => e.bodyPart === selectedBodyPart);
    }

    // Filter by goal
    if (selectedGoal) {
      filtered = filtered.filter((e) => e.goal.includes(selectedGoal));
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (e) =>
          e.name.toLowerCase().includes(query) ||
          e.description.toLowerCase().includes(query) ||
          (e.equipment && e.equipment.toLowerCase().includes(query))
      );
    }

    return filtered;
  }, [searchQuery, selectedBodyPart, selectedGoal]);

  const clearFilters = useCallback(() => {
    setSearchQuery('');
    setSelectedBodyPart(null);
    setSelectedGoal(null);
  }, []);

  const getExerciseById = useCallback((id: string): Exercise | undefined => {
    return exercises.find((e) => e.id === id);
  }, []);

  return {
    exercises: filteredExercises,
    allExercises: exercises,
    searchQuery,
    setSearchQuery,
    selectedBodyPart,
    setSelectedBodyPart,
    selectedGoal,
    setSelectedGoal,
    clearFilters,
    getExerciseById,
  };
}

