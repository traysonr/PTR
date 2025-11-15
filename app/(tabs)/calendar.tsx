import React, { useState } from 'react';
import { StyleSheet, ScrollView, View, FlatList, Alert, Modal, TouchableOpacity } from 'react-native';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { ExerciseCard } from '@/components/ExerciseCard';
import { Button } from '@/components/Button';
import { useScheduledExercises } from '@/hooks/useScheduledExercises';
import { useExercises } from '@/hooks/useExercises';
import { useNotifications } from '@/hooks/useNotifications';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function CalendarScreen() {
  const {
    sessions,
    getSessionsForDate,
    addSession,
    removeSession,
    getAllExercises,
    isDateWithinPlanningWindow,
    reloadSessions: reloadSessionsHook,
  } = useScheduledExercises();
  
  const { allExercises } = useExercises();
  const { scheduleSessionNotifications, rescheduleAllNotifications } = useNotifications();
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [showExerciseModal, setShowExerciseModal] = useState(false);

  // Generate dates for the next 3 weeks
  const generateDates = () => {
    const dates: string[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < 21; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date.toISOString().split('T')[0]);
    }

    return dates;
  };

  const dates = generateDates();
  const selectedDateSessions = getSessionsForDate(selectedDate);

  const handleAddExercise = async (exerciseId: string) => {
    if (!isDateWithinPlanningWindow(selectedDate)) {
      Alert.alert(
        'Date Out of Range',
        'You can only schedule exercises up to 3 weeks ahead.'
      );
      return;
    }

    // Check if exercise is already scheduled for this date
    const alreadyScheduled = selectedDateSessions.some(
      (item) => item.exercise.id === exerciseId
    );

    if (alreadyScheduled) {
      Alert.alert('Already Scheduled', 'This exercise is already scheduled for this date.');
      return;
    }

    const newSession = await addSession(exerciseId, selectedDate);
    if (newSession) {
      const exercise = allExercises.find((e) => e.id === exerciseId);
      if (exercise) {
        // Schedule notifications for this new session
        await scheduleSessionNotifications(newSession, exercise);
      }
      setShowExerciseModal(false);
      Alert.alert('Success', 'Exercise added to your calendar!');
    } else {
      Alert.alert('Error', 'Failed to add exercise. Please try again.');
    }
  };

  const handleRemoveExercise = async (sessionId: string) => {
    Alert.alert(
      'Remove Exercise',
      'Are you sure you want to remove this exercise from your calendar?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            const success = await removeSession(sessionId);
            if (success) {
              // Reload sessions and reschedule notifications
              reloadSessionsHook();
              // Use a timeout to ensure state is updated
              setTimeout(async () => {
                const updatedSessions = sessions.filter((s) => s.id !== sessionId);
                await rescheduleAllNotifications(updatedSessions, allExercises);
              }, 100);
            }
          },
        },
      ]
    );
  };

  const formatDateDisplay = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (dateString === today.toISOString().split('T')[0]) {
      return 'Today';
    } else if (dateString === tomorrow.toISOString().split('T')[0]) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      });
    }
  };

  const formatDateHeader = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText type="title" style={styles.title}>
          Calendar
        </ThemedText>
        <ThemedText style={styles.subtitle}>
          Plan your exercises up to 3 weeks ahead
        </ThemedText>
      </View>

      {/* Date Selector */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.dateScrollView}
        contentContainerStyle={styles.dateScrollContent}
      >
        {dates.map((date) => {
          const isSelected = date === selectedDate;
          const sessionCount = getSessionsForDate(date).length;

          return (
            <TouchableOpacity
              key={date}
              style={[styles.dateButton, isSelected && styles.dateButtonSelected]}
              onPress={() => setSelectedDate(date)}
            >
              <ThemedText
                style={[
                  styles.dateButtonText,
                  isSelected && styles.dateButtonTextSelected,
                ]}
              >
                {formatDateDisplay(date)}
              </ThemedText>
              {sessionCount > 0 && (
                <View style={styles.dateBadge}>
                  <ThemedText style={styles.dateBadgeText}>{sessionCount}</ThemedText>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Selected Date Sessions */}
      <View style={styles.sessionsContainer}>
        <View style={styles.dateHeader}>
          <ThemedText type="subtitle" style={styles.dateHeaderText}>
            {formatDateHeader(selectedDate)}
          </ThemedText>
          <Button
            title="Add Exercise"
            onPress={() => setShowExerciseModal(true)}
            style={styles.addButton}
          />
        </View>

        {selectedDateSessions.length > 0 ? (
          <FlatList
            data={selectedDateSessions}
            keyExtractor={(item) => item.session.id}
            renderItem={({ item }) => (
              <View style={styles.exerciseWrapper}>
                <ExerciseCard exercise={item.exercise} />
                <Button
                  title="Remove"
                  variant="danger"
                  onPress={() => handleRemoveExercise(item.session.id)}
                  style={styles.removeButton}
                />
              </View>
            )}
            contentContainerStyle={styles.listContent}
          />
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="calendar-outline" size={64} color="#999" />
            <ThemedText style={styles.emptyText}>
              No exercises scheduled for this day.
            </ThemedText>
            <Button
              title="Add Exercise"
              onPress={() => setShowExerciseModal(true)}
              style={styles.emptyButton}
            />
          </View>
        )}
      </View>

      {/* Exercise Selection Modal */}
      <Modal
        visible={showExerciseModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowExerciseModal(false)}
      >
        <ThemedView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <ThemedText type="title" style={styles.modalTitle}>
              Select Exercise
            </ThemedText>
            <Button
              title="Close"
              variant="outline"
              onPress={() => setShowExerciseModal(false)}
              style={styles.closeButton}
            />
          </View>

          <FlatList
            data={allExercises}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.modalExerciseItem}>
                <ExerciseCard exercise={item} showDescription={false} />
                <Button
                  title="Add"
                  onPress={() => handleAddExercise(item.id)}
                  style={styles.addExerciseButton}
                />
              </View>
            )}
            contentContainerStyle={styles.modalListContent}
          />
        </ThemedView>
      </Modal>
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
  subtitle: {
    fontSize: 14,
    opacity: 0.7,
    marginTop: 4,
  },
  dateScrollView: {
    maxHeight: 80,
    marginBottom: 16,
  },
  dateScrollContent: {
    paddingHorizontal: 20,
    gap: 12,
  },
  dateButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 80,
    position: 'relative',
  },
  dateButtonSelected: {
    backgroundColor: '#007AFF',
  },
  dateButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  dateButtonTextSelected: {
    color: '#fff',
  },
  dateBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#ff3b30',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  dateBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  sessionsContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  dateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  dateHeaderText: {
    fontSize: 18,
    flex: 1,
  },
  addButton: {
    minWidth: 120,
  },
  listContent: {
    paddingBottom: 20,
  },
  exerciseWrapper: {
    marginBottom: 16,
  },
  removeButton: {
    marginTop: 8,
    minWidth: 100,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    opacity: 0.7,
    marginTop: 16,
    marginBottom: 24,
    textAlign: 'center',
  },
  emptyButton: {
    minWidth: 150,
  },
  modalContainer: {
    flex: 1,
    paddingTop: 60,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 24,
    flex: 1,
  },
  closeButton: {
    minWidth: 80,
  },
  modalListContent: {
    padding: 20,
  },
  modalExerciseItem: {
    marginBottom: 16,
  },
  addExerciseButton: {
    marginTop: 8,
    minWidth: 100,
  },
});

