import React, { useState } from 'react';
import { StyleSheet, ScrollView, Alert, ActivityIndicator, View } from 'react-native';
import { router } from 'expo-router';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/Button';
import { Checkbox } from '@/components/Checkbox';
import { TextInput } from '@/components/TextInput';
import { useProfile } from '@/hooks/useProfile';
import { useRoutines } from '@/hooks/useRoutines';
import { BodyArea, Intensity, Equipment } from '@/types/exercise';
import { storageService } from '@/services/storage';

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

const EQUIPMENT: Equipment[] = [
  'none',
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

export default function OnboardingScreen() {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [targetBodyAreas, setTargetBodyAreas] = useState<BodyArea[]>([]);
  const [intensityMin, setIntensityMin] = useState<Intensity | null>(null);
  const [intensityMax, setIntensityMax] = useState<Intensity | null>(null);
  const [equipmentAccess, setEquipmentAccess] = useState<Equipment[]>([]);
  const [daysPerWeek, setDaysPerWeek] = useState<number | null>(null);
  const [maxMinutesPerDay, setMaxMinutesPerDay] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const { saveProfile } = useProfile();
  const { createRoutineFromProfile } = useRoutines();

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
    if (currentStep === 1 && !name.trim()) {
      Alert.alert('Name Required', 'Please enter your name or nickname.');
      return false;
    }
    if (currentStep === 2 && targetBodyAreas.length === 0) {
      Alert.alert('Selection Required', 'Please select at least one target body area.');
      return false;
    }
    if (currentStep === 3 && (!intensityMin || !intensityMax)) {
      Alert.alert('Selection Required', 'Please select both minimum and maximum intensity.');
      return false;
    }
    if (currentStep === 4 && equipmentAccess.length === 0) {
      Alert.alert('Selection Required', 'Please select at least one equipment option (including "None").');
      return false;
    }
    if (currentStep === 5 && (!daysPerWeek || !maxMinutesPerDay)) {
      Alert.alert('Selection Required', 'Please select both days per week and minutes per day.');
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (!validateStep(step)) {
      return;
    }

    if (step < 5) {
      setStep(step + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = async () => {
    if (!validateStep(5)) {
      return;
    }

    setLoading(true);
    try {
      const now = new Date().toISOString();
      
      // Ensure equipment includes 'none' if no other equipment is selected
      const finalEquipment = equipmentAccess.length === 0 ? ['none'] : equipmentAccess;
      if (!finalEquipment.includes('none') && finalEquipment.length > 0) {
        finalEquipment.push('none'); // Always include 'none' as fallback
      }

      const profile = {
        id: 'default',
        name: name.trim(),
        targetBodyAreas,
        intensityMin: intensityMin!,
        intensityMax: intensityMax!,
        equipmentAccess: finalEquipment,
        daysPerWeek: daysPerWeek!,
        maxMinutesPerDay: maxMinutesPerDay!,
        maxMinutesPerWeek: daysPerWeek! * maxMinutesPerDay!,
        createdAt: now,
        updatedAt: now,
      };

      const success = await saveProfile(profile);
      if (success) {
        await storageService.setOnboardingComplete(true);
        
        // Auto-generate routine from profile
        try {
          const routine = await createRoutineFromProfile(profile);
          // Navigate to routines tab to review the generated routine
          router.replace('/(tabs)/routines');
        } catch (routineError) {
          console.error('Error creating routine:', routineError);
          Alert.alert(
            'Routine Creation Error',
            'Profile saved, but routine generation failed. You can generate a routine later from the Routines tab.'
          );
          router.replace('/(tabs)/routines');
        }
      } else {
        Alert.alert('Error', 'Failed to save profile. Please try again.');
      }
    } catch (error) {
      Alert.alert('Error', 'An error occurred. Please try again.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <ThemedText type="title" style={styles.title}>
          Welcome to PTR
        </ThemedText>
        <ThemedText style={styles.subtitle}>
          Let's create your personalized physical therapy routine.
        </ThemedText>

        {/* Step 1: Name */}
        {step === 1 && (
          <ThemedView style={styles.step}>
            <ThemedText type="subtitle" style={styles.stepTitle}>
              What's your name?
            </ThemedText>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Enter your name or nickname"
              label="Name / Nickname"
            />
          </ThemedView>
        )}

        {/* Step 2: Target Body Areas */}
        {step === 2 && (
          <ThemedView style={styles.step}>
            <ThemedText type="subtitle" style={styles.stepTitle}>
              Target Body Areas
            </ThemedText>
            <ThemedText style={styles.stepDescription}>
              Select all body areas you want to focus on. We recommend emphasizing: Neck, Upper Back, Lower Back, Hip, Shoulder, Core, Knee.
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

        {/* Step 3: Intensity Range */}
        {step === 3 && (
          <ThemedView style={styles.step}>
            <ThemedText type="subtitle" style={styles.stepTitle}>
              Intensity Range
            </ThemedText>
            <ThemedText style={styles.stepDescription}>
              Select your preferred intensity range. The app will choose exercises within this range.
            </ThemedText>
            <ThemedText style={styles.subSectionTitle}>Minimum Intensity</ThemedText>
            {INTENSITIES.map((intensity) => (
              <Checkbox
                key={`min-${intensity}`}
                label={intensityLabels[intensity]}
                checked={intensityMin === intensity}
                onToggle={() => setIntensityMin(intensity)}
              />
            ))}
            <ThemedText style={[styles.subSectionTitle, { marginTop: 24 }]}>
              Maximum Intensity
            </ThemedText>
            {INTENSITIES.map((intensity) => (
              <Checkbox
                key={`max-${intensity}`}
                label={intensityLabels[intensity]}
                checked={intensityMax === intensity}
                onToggle={() => setIntensityMax(intensity)}
              />
            ))}
            {intensityMin && intensityMax && (
              <ThemedText style={styles.validationHint}>
                Selected range: {intensityLabels[intensityMin]} to {intensityLabels[intensityMax]}
              </ThemedText>
            )}
          </ThemedView>
        )}

        {/* Step 4: Equipment Access */}
        {step === 4 && (
          <ThemedView style={styles.step}>
            <ThemedText type="subtitle" style={styles.stepTitle}>
              Equipment Access
            </ThemedText>
            <ThemedText style={styles.stepDescription}>
              Select all equipment you have access to. The app will prioritize exercises using your available equipment.
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

        {/* Step 5: Time Availability */}
        {step === 5 && (
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
            title={step === 5 ? 'Complete Setup' : 'Next'}
            onPress={handleNext}
            loading={loading}
            style={styles.nextButton}
          />
        </ThemedView>

        <ThemedView style={styles.progressContainer}>
          {[1, 2, 3, 4, 5].map((s) => (
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
