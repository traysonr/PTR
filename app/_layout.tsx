import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useSegments, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { storageService } from '@/services/storage';
import { ThemedView } from '@/components/themed-view';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const segments = useSegments();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkProfile = async () => {
      try {
        const hasProfile = await storageService.hasProfile();
        const inAuthGroup = segments[0] === 'onboarding';

        if (!hasProfile && !inAuthGroup) {
          // No profile and not on onboarding, redirect to onboarding
          router.replace('/onboarding');
        } else if (hasProfile && inAuthGroup) {
          // Has profile but on onboarding, redirect to tabs
          router.replace('/(tabs)');
        }
      } catch (error) {
        console.error('Error checking profile:', error);
      } finally {
        setIsChecking(false);
      }
    };

    checkProfile();
  }, [segments, router]);

  if (isChecking) {
    return (
      <ThemedView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </ThemedView>
    );
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="onboarding" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
        <Stack.Screen name="routines/[id]" options={{ headerShown: true, title: 'Routine Details' }} />
        <Stack.Screen name="settings/exercise-catalog" options={{ headerShown: true, title: 'Exercise Catalog' }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
