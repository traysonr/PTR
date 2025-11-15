import React, { useState } from 'react';
import { StyleSheet, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/Button';
import { Checkbox } from '@/components/Checkbox';
import { TextInput } from '@/components/TextInput';
import { useProfile } from '@/hooks/useProfile';
import { BodyPart, Goal, Intensity } from '@/types';
import { storageService } from '@/services/storage';

const BODY_PARTS: BodyPart[] = ['neck', 'lower-back', 'shoulders', 'knees', 'hips', 'ankles'];
const GOALS: Goal[] = ['pain-reduction', 'strength', 'mobility', 'post-surgery-rehab'];
const INTENSITIES: Intensity[] = ['light', 'moderate', 'high'];

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

export default function OnboardingScreen() {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [painAreas, setPainAreas] = useState<BodyPart[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [preferredIntensity, setPreferredIntensity] = useState<Intensity | null>(null);
  const [loading, setLoading] = useState(false);
  const { saveProfile } = useProfile();

  const togglePainArea = (area: BodyPart) => {
    setPainAreas((prev) =>
      prev.includes(area) ? prev.filter((a) => a !== area) : [...prev, area]
    );
  };

  const toggleGoal = (goal: Goal) => {
    setGoals((prev) =>
      prev.includes(goal) ? prev.filter((g) => g !== goal) : [...prev, goal]
    );
  };

  const handleNext = () => {
    if (step === 1 && !name.trim()) {
      Alert.alert('Name Required', 'Please enter your name or nickname.');
      return;
    }
    if (step === 2 && painAreas.length === 0) {
      Alert.alert('Selection Required', 'Please select at least one area of focus.');
      return;
    }
    if (step === 3 && goals.length === 0) {
      Alert.alert('Selection Required', 'Please select at least one goal.');
      return;
    }
    if (step === 4 && !preferredIntensity) {
      Alert.alert('Selection Required', 'Please select your preferred intensity.');
      return;
    }

    if (step < 4) {
      setStep(step + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = async () => {
    setLoading(true);
    try {
      const now = new Date().toISOString();
      const profile = {
        id: `user-${Date.now()}`,
        name: name.trim(),
        painAreas,
        goals,
        preferredIntensity: preferredIntensity!,
        createdAt: now,
        updatedAt: now,
      };

      const success = await saveProfile(profile);
      if (success) {
        await storageService.setOnboardingComplete(true);
        // Request notification permissions after onboarding
        // TODO: This will be handled in the notification hook when first scheduling
        router.replace('/(tabs)');
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
          Let's set up your profile to personalize your physical therapy journey.
        </ThemedText>

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

        {step === 2 && (
          <ThemedView style={styles.step}>
            <ThemedText type="subtitle" style={styles.stepTitle}>
              Which areas need focus?
            </ThemedText>
            <ThemedText style={styles.stepDescription}>
              Select all areas where you experience pain or want to focus on.
            </ThemedText>
            {BODY_PARTS.map((area) => (
              <Checkbox
                key={area}
                label={bodyPartLabels[area]}
                checked={painAreas.includes(area)}
                onToggle={() => togglePainArea(area)}
              />
            ))}
          </ThemedView>
        )}

        {step === 3 && (
          <ThemedView style={styles.step}>
            <ThemedText type="subtitle" style={styles.stepTitle}>
              What are your goals?
            </ThemedText>
            <ThemedText style={styles.stepDescription}>
              Select all goals that apply to you.
            </ThemedText>
            {GOALS.map((goal) => (
              <Checkbox
                key={goal}
                label={goalLabels[goal]}
                checked={goals.includes(goal)}
                onToggle={() => toggleGoal(goal)}
              />
            ))}
          </ThemedView>
        )}

        {step === 4 && (
          <ThemedView style={styles.step}>
            <ThemedText type="subtitle" style={styles.stepTitle}>
              Preferred Intensity
            </ThemedText>
            <ThemedText style={styles.stepDescription}>
              What level of intensity are you comfortable with?
            </ThemedText>
            {INTENSITIES.map((intensity) => (
              <Checkbox
                key={intensity}
                label={intensityLabels[intensity]}
                checked={preferredIntensity === intensity}
                onToggle={() => setPreferredIntensity(intensity)}
              />
            ))}
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
            title={step === 4 ? 'Complete' : 'Next'}
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

