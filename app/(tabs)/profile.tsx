import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, View, Alert } from 'react-native';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/Button';
import { Checkbox } from '@/components/Checkbox';
import { TextInput } from '@/components/TextInput';
import { useProfile } from '@/hooks/useProfile';
import { BodyPart, Goal, Intensity, UserProfile } from '@/types';
import { router } from 'expo-router';

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

export default function ProfileScreen() {
  const { profile, loading, saveProfile } = useProfile();
  const [name, setName] = useState('');
  const [painAreas, setPainAreas] = useState<BodyPart[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [preferredIntensity, setPreferredIntensity] = useState<Intensity | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setName(profile.name);
      setPainAreas(profile.painAreas);
      setGoals(profile.goals);
      setPreferredIntensity(profile.preferredIntensity);
    }
  }, [profile]);

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

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Name Required', 'Please enter your name or nickname.');
      return;
    }

    if (painAreas.length === 0) {
      Alert.alert('Selection Required', 'Please select at least one area of focus.');
      return;
    }

    if (goals.length === 0) {
      Alert.alert('Selection Required', 'Please select at least one goal.');
      return;
    }

    if (!preferredIntensity) {
      Alert.alert('Selection Required', 'Please select your preferred intensity.');
      return;
    }

    if (!profile) {
      Alert.alert('Error', 'Profile not found. Please complete onboarding first.');
      router.replace('/onboarding');
      return;
    }

    setSaving(true);
    try {
      const updatedProfile: UserProfile = {
        ...profile,
        name: name.trim(),
        painAreas,
        goals,
        preferredIntensity,
        updatedAt: new Date().toISOString(),
      };

      const success = await saveProfile(updatedProfile);
      if (success) {
        Alert.alert('Success', 'Profile updated successfully!');
      } else {
        Alert.alert('Error', 'Failed to save profile. Please try again.');
      }
    } catch (error) {
      Alert.alert('Error', 'An error occurred. Please try again.');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>Loading...</ThemedText>
      </ThemedView>
    );
  }

  if (!profile) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>No profile found. Please complete onboarding.</ThemedText>
        <Button title="Go to Onboarding" onPress={() => router.replace('/onboarding')} />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <ThemedText type="title" style={styles.title}>
          Edit Profile
        </ThemedText>

        {/* Name */}
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Enter your name or nickname"
          label="Name / Nickname"
        />

        {/* Pain Areas */}
        <ThemedView style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Areas of Focus
          </ThemedText>
          <ThemedText style={styles.sectionDescription}>
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

        {/* Goals */}
        <ThemedView style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Goals
          </ThemedText>
          <ThemedText style={styles.sectionDescription}>
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

        {/* Intensity */}
        <ThemedView style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Preferred Intensity
          </ThemedText>
          <ThemedText style={styles.sectionDescription}>
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

        <Button
          title="Save Changes"
          onPress={handleSave}
          loading={saving}
          style={styles.saveButton}
        />
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
  title: {
    marginBottom: 24,
    fontSize: 28,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    marginBottom: 8,
    fontSize: 20,
  },
  sectionDescription: {
    marginBottom: 16,
    opacity: 0.7,
    fontSize: 14,
  },
  saveButton: {
    marginTop: 16,
    marginBottom: 32,
  },
});

