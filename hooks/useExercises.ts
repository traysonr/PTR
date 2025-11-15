import { useMemo, useState, useCallback } from 'react';
import { Exercise, BodyArea, Goal, Equipment } from '@/types/exercise';
import { EXERCISES } from '@/data/exercises';

export function useExercises() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBodyAreas, setSelectedBodyAreas] = useState<BodyArea[]>([]);
  const [selectedGoals, setSelectedGoals] = useState<Goal[]>([]);
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment[]>([]);
  const [showAllBodyAreas, setShowAllBodyAreas] = useState(true);
  const [showAllGoals, setShowAllGoals] = useState(true);
  const [showAllEquipment, setShowAllEquipment] = useState(true);

  // Filter exercises based on search and filters
  const filteredExercises = useMemo(() => {
    let filtered = EXERCISES;

    // Filter by body areas (if any selected)
    if (!showAllBodyAreas && selectedBodyAreas.length > 0) {
      filtered = filtered.filter((e) =>
        e.bodyAreas.some((area) => selectedBodyAreas.includes(area))
      );
    }

    // Filter by goals (if any selected)
    if (!showAllGoals && selectedGoals.length > 0) {
      filtered = filtered.filter((e) =>
        e.goals.some((goal) => selectedGoals.includes(goal))
      );
    }

    // Filter by equipment (if any selected)
    if (!showAllEquipment && selectedEquipment.length > 0) {
      filtered = filtered.filter((e) =>
        e.equipment.some((eq) => selectedEquipment.includes(eq))
      );
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (e) =>
          e.name.toLowerCase().includes(query) ||
          e.description.toLowerCase().includes(query) ||
          e.equipment.some((eq) => eq.toLowerCase().includes(query))
      );
    }

    return filtered;
  }, [searchQuery, selectedBodyAreas, selectedGoals, selectedEquipment, showAllBodyAreas, showAllGoals, showAllEquipment]);

  const toggleBodyArea = useCallback((area: BodyArea) => {
    setShowAllBodyAreas(false);
    setSelectedBodyAreas((prev) =>
      prev.includes(area) ? prev.filter((a) => a !== area) : [...prev, area]
    );
  }, []);

  const toggleGoal = useCallback((goal: Goal) => {
    setShowAllGoals(false);
    setSelectedGoals((prev) =>
      prev.includes(goal) ? prev.filter((g) => g !== goal) : [...prev, goal]
    );
  }, []);

  const toggleEquipment = useCallback((equipment: Equipment) => {
    setShowAllEquipment(false);
    setSelectedEquipment((prev) =>
      prev.includes(equipment)
        ? prev.filter((e) => e !== equipment)
        : [...prev, equipment]
    );
  }, []);

  const setAllBodyAreas = useCallback((showAll: boolean) => {
    setShowAllBodyAreas(showAll);
    if (showAll) {
      setSelectedBodyAreas([]);
    }
  }, []);

  const setAllGoals = useCallback((showAll: boolean) => {
    setShowAllGoals(showAll);
    if (showAll) {
      setSelectedGoals([]);
    }
  }, []);

  const setAllEquipment = useCallback((showAll: boolean) => {
    setShowAllEquipment(showAll);
    if (showAll) {
      setSelectedEquipment([]);
    }
  }, []);

  const clearFilters = useCallback(() => {
    setSearchQuery('');
    setSelectedBodyAreas([]);
    setSelectedGoals([]);
    setSelectedEquipment([]);
    setShowAllBodyAreas(true);
    setShowAllGoals(true);
    setShowAllEquipment(true);
  }, []);

  const getExerciseById = useCallback((id: string): Exercise | undefined => {
    return EXERCISES.find((e) => e.id === id);
  }, []);

  return {
    exercises: filteredExercises,
    allExercises: EXERCISES,
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
    getExerciseById,
  };
}

