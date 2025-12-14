import { Button } from '@/components/Button';
import { Checkbox } from '@/components/Checkbox';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { RoutineProfileInput, useRoutines } from '@/hooks/useRoutines';
import { BodyArea, Equipment, Intensity } from '@/types/exercise';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';

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

const INTENSITIES: Intensity[] = ['low', 'medium', 'high'];

// Equipment options for routine (excludes 'none' - bodyweight exercises are always available)
const EQUIPMENT: Equipment[] = [
  'dumbbells',
  'exercise_ball',
  'resistance_band',
  'chair',
  'step',
  'foam_roll',
];

const DAYS_PER_WEEK_OPTIONS = [2, 3, 4, 5, 6, 7];
const MINUTES_PER_DAY_OPTIONS = [15, 20, 30, 45, 60];

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

export default function NewRoutineScreen() {
  const [step, setStep] = useState(1);
  const [targetBodyAreas, setTargetBodyAreas] = useState<BodyArea[]>([]);
  const [intensity, setIntensity] = useState<Intensity | null>(null);
  const [equipmentAccess, setEquipmentAccess] = useState<Equipment[]>([]);
  const [daysPerWeek, setDaysPerWeek] = useState<number | null>(null);
  const [maxMinutesPerDay, setMaxMinutesPerDay] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const { createRoutineFromCustomInput } = useRoutines();

  const toggleBodyArea = (area: BodyArea) => {
    setTargetBodyAreas((prev) =>
      prev.includes(area) ? prev.filter((a) => a !== area) : [...prev, area]
    );
  };

  const toggleEquipment = (equipment: Equipment) => {
    setEquipmentAccess((prev) =>
      prev.includes(equipment)
        ? prev.filter((e) => e !== equipment)
        : [...prev, equipment]
    );
  };

  const validateStep = (currentStep: number): boolean => {
    if (currentStep === 1 && targetBodyAreas.length === 0) {
      Alert.alert('Selection Required', 'Please select at least one target body area.');
      return false;
    }
    if (currentStep === 2 && !intensity) {
      Alert.alert('Selection Required', 'Please select an intensity level.');
      return false;
    }
    if (currentStep === 3 && equipmentAccess.length === 0) {
      Alert.alert('Selection Required', 'Please select at least one equipment option. Bodyweight exercises are always available.');
      return false;
    }
    if (currentStep === 4 && (!daysPerWeek || !maxMinutesPerDay)) {
      Alert.alert('Selection Required', 'Please select both days per week and minutes per day.');
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (!validateStep(step)) {
      return;
    }

    if (step < 4) {
      setStep(step + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = async () => {
    if (!validateStep(4)) {
      return;
    }

    setLoading(true);
    try {
      const input: RoutineProfileInput = {
        targetBodyAreas,
        intensity: intensity!,
        equipmentAccess,
        daysPerWeek: daysPerWeek!,
        maxMinutesPerDay: maxMinutesPerDay!,
        maxMinutesPerWeek: daysPerWeek! * maxMinutesPerDay!,
      };

      const routine = await createRoutineFromCustomInput(input);
      router.replace(`/routines/${routine.id}`);
    } catch (error) {
      Alert.alert('Error', 'Failed to create routine. Please try again.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <ThemedText type="title" style={styles.title}>
          New Routine – Custom Settings
        </ThemedText>
        <ThemedText style={styles.subtitle}>
          Configure settings for this routine. This won't change your main profile.
        </ThemedText>

        {/* Step 1: Target Body Areas */}
        {step === 1 && (
          <ThemedView style={styles.step}>
            <ThemedText type="subtitle" style={styles.stepTitle}>
              Target Body Areas
            </ThemedText>
            <ThemedText style={styles.stepDescription}>
              Select all body areas you want to focus on for this routine.
            </ThemedText>
            {BODY_AREAS.map((area) => (
              <Checkbox
                key={area}
                label={bodyAreaLabels[area]}
                checked={targetBodyAreas.includes(area)}
                onToggle={() => toggleBodyArea(area)}
              />
            ))}
          </ThemedView>
        )}

        {/* Step 2: Intensity Level */}
        {step === 2 && (
          <ThemedView style={styles.step}>
            <ThemedText type="subtitle" style={styles.stepTitle}>
              Select Intensity Level
            </ThemedText>
            <ThemedText style={styles.stepDescription}>
              Choose your preferred intensity level for this routine.
            </ThemedText>
            {INTENSITIES.map((intensityOption) => (
              <Checkbox
                key={intensityOption}
                label={intensityLabels[intensityOption]}
                checked={intensity === intensityOption}
                onToggle={() => setIntensity(intensityOption)}
              />
            ))}
            {intensity && (
              <ThemedText style={styles.validationHint}>
                Selected: {intensityLabels[intensity]}
              </ThemedText>
            )}
          </ThemedView>
        )}

        {/* Step 3: Equipment Access */}
        {step === 3 && (
          <ThemedView style={styles.step}>
            <ThemedText type="subtitle" style={styles.stepTitle}>
              Equipment Access
            </ThemedText>
            <ThemedText style={styles.stepDescription}>
              Select all equipment you have access to. Bodyweight exercises are always available regardless of your selections.
            </ThemedText>
            {EQUIPMENT.map((equipment) => (
              <Checkbox
                key={equipment}
                label={equipmentLabels[equipment]}
                checked={equipmentAccess.includes(equipment)}
                onToggle={() => toggleEquipment(equipment)}
              />
            ))}
          </ThemedView>
        )}

        {/* Step 4: Time Availability */}
        {step === 4 && (
          <ThemedView style={styles.step}>
            <ThemedText type="subtitle" style={styles.stepTitle}>
              Time Availability
            </ThemedText>
            <ThemedText style={styles.stepDescription}>
              How many days per week can you exercise, and how much time per day?
            </ThemedText>
            <ThemedText style={styles.subSectionTitle}>Days Per Week</ThemedText>
            <View style={styles.optionsGrid}>
              {DAYS_PER_WEEK_OPTIONS.map((days) => (
                <Checkbox
                  key={`days-${days}`}
                  label={`${days} ${days === 1 ? 'day' : 'days'}`}
                  checked={daysPerWeek === days}
                  onToggle={() => setDaysPerWeek(days)}
                />
              ))}
            </View>
            <ThemedText style={[styles.subSectionTitle, { marginTop: 24 }]}>
              Maximum Minutes Per Day
            </ThemedText>
            <View style={styles.optionsGrid}>
              {MINUTES_PER_DAY_OPTIONS.map((minutes) => (
                <Checkbox
                  key={`minutes-${minutes}`}
                  label={`${minutes} minutes`}
                  checked={maxMinutesPerDay === minutes}
                  onToggle={() => setMaxMinutesPerDay(minutes)}
                />
              ))}
            </View>
            {daysPerWeek && maxMinutesPerDay && (
              <ThemedText style={styles.validationHint}>
                Weekly target: ~{daysPerWeek * maxMinutesPerDay} minutes across {daysPerWeek} days
              </ThemedText>
            )}
          </ThemedView>
        )}

        <ThemedView style={styles.buttonContainer}>
          {step > 1 && (
            <Button
              title="Back"
              variant="outline"
              onPress={() => setStep(step - 1)}
              style={styles.backButton}
            />
          )}
          <Button
            title={step === 4 ? 'Create Routine' : 'Next'}
            onPress={handleNext}
            loading={loading}
            style={styles.nextButton}
          />
        </ThemedView>

        <ThemedView style={styles.progressContainer}>
          {[1, 2, 3, 4].map((s) => (
            <ThemedView
              key={s}
              style={[styles.progressDot, s <= step && styles.progressDotActive]}
            />
          ))}
        </ThemedView>
      </ScrollView>
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
    paddingTop: 60,
  },
  title: {
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    marginBottom: 32,
    textAlign: 'center',
    opacity: 0.7,
    fontSize: 16,
  },
  step: {
    marginBottom: 32,
  },
  stepTitle: {
    marginBottom: 8,
  },
  stepDescription: {
    marginBottom: 16,
    opacity: 0.7,
  },
  subSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 12,
  },
  optionsGrid: {
    gap: 8,
  },
  validationHint: {
    marginTop: 12,
    fontSize: 14,
    opacity: 0.6,
    fontStyle: 'italic',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  backButton: {
    flex: 1,
  },
  nextButton: {
    flex: 1,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginTop: 24,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ccc',
  },
  progressDotActive: {
    backgroundColor: '#007AFF',
  },
});

