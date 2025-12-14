import { Button } from '@/components/Button';
import { Checkbox } from '@/components/Checkbox';
import { TextInput } from '@/components/TextInput';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useProfile } from '@/hooks/useProfile';
import { UserProfile } from '@/types';
import { BodyArea, Equipment, Intensity } from '@/types/exercise';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
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

// Equipment options for profile (excludes 'none' - bodyweight exercises are always available)
const EQUIPMENT: Equipment[] = [
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

export default function ProfileScreen() {
  const { profile, loading, saveProfile } = useProfile();
  const [name, setName] = useState('');
  const [targetBodyAreas, setTargetBodyAreas] = useState<BodyArea[]>([]);
  const [intensity, setIntensity] = useState<Intensity | null>(null);
  const [equipmentAccess, setEquipmentAccess] = useState<Equipment[]>([]);
  const [daysPerWeek, setDaysPerWeek] = useState<number | null>(null);
  const [maxMinutesPerDay, setMaxMinutesPerDay] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setName(profile.name);
      setTargetBodyAreas(profile.targetBodyAreas || []);
      setIntensity(profile.intensity || null);
      setEquipmentAccess(profile.equipmentAccess || []);
      setDaysPerWeek(profile.daysPerWeek || null);
      setMaxMinutesPerDay(profile.maxMinutesPerDay || null);
    }
  }, [profile]);

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

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Name Required', 'Please enter your name or nickname.');
      return;
    }

    if (targetBodyAreas.length === 0) {
      Alert.alert('Selection Required', 'Please select at least one target body area.');
      return;
    }

    if (!intensity) {
      Alert.alert('Selection Required', 'Please select an intensity level.');
      return;
    }

    if (equipmentAccess.length === 0) {
      Alert.alert('Selection Required', 'Please select at least one equipment option. Bodyweight exercises are always available.');
      return;
    }

    if (!daysPerWeek || !maxMinutesPerDay) {
      Alert.alert('Selection Required', 'Please select both days per week and minutes per day.');
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
        targetBodyAreas,
        intensity,
        equipmentAccess,
        daysPerWeek,
        maxMinutesPerDay,
        maxMinutesPerWeek: daysPerWeek * maxMinutesPerDay,
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

        {/* Target Body Areas */}
        <ThemedView style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Target Body Areas
          </ThemedText>
          <ThemedText style={styles.sectionDescription}>
            Select all body areas you want to focus on.
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

        {/* Intensity */}
        <ThemedView style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Intensity Level
          </ThemedText>
          <ThemedText style={styles.sectionDescription}>
            Select your preferred intensity level.
          </ThemedText>
          {INTENSITIES.map((intensityOption) => (
            <Checkbox
              key={intensityOption}
              label={intensityLabels[intensityOption]}
              checked={intensity === intensityOption}
              onToggle={() => setIntensity(intensityOption)}
            />
          ))}
        </ThemedView>

        {/* Equipment Access */}
        <ThemedView style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Equipment Access
          </ThemedText>
          <ThemedText style={styles.sectionDescription}>
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

        {/* Days Per Week */}
        <ThemedView style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Days Per Week
          </ThemedText>
          <ThemedText style={styles.sectionDescription}>
            How many days per week can you exercise?
          </ThemedText>
          <View style={styles.optionsGrid}>
            {[2, 3, 4, 5, 6, 7].map((days) => (
              <Checkbox
                key={`days-${days}`}
                label={`${days} ${days === 1 ? 'day' : 'days'}`}
                checked={daysPerWeek === days}
                onToggle={() => setDaysPerWeek(days)}
              />
            ))}
          </View>
        </ThemedView>

        {/* Max Minutes Per Day */}
        <ThemedView style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Maximum Minutes Per Day
          </ThemedText>
          <ThemedText style={styles.sectionDescription}>
            How much time can you dedicate per day?
          </ThemedText>
          <View style={styles.optionsGrid}>
            {[15, 20, 30, 45, 60].map((minutes) => (
              <Checkbox
                key={`minutes-${minutes}`}
                label={`${minutes} minutes`}
                checked={maxMinutesPerDay === minutes}
                onToggle={() => setMaxMinutesPerDay(minutes)}
              />
            ))}
          </View>
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
  optionsGrid: {
    gap: 8,
  },
});

