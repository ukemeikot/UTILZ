import { useEffect, useMemo } from 'react';
import { useFonts } from 'expo-font';
import * as SystemUI from 'expo-system-ui';
import { StatusBar } from 'expo-status-bar';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { staticTheme, useAppTheme } from '../src/constants/theme';
import { useSettingsStore } from '../src/store/settingsStore';

void SplashScreen.preventAutoHideAsync();

SplashScreen.setOptions({
  duration: 350,
  fade: true,
});

export default function RootLayout() {
  const theme = useAppTheme();
  const hydrated = useSettingsStore((state) => state.hydrated);
  const hydrateSettings = useSettingsStore((state) => state.hydrate);
  const [loaded, error] = useFonts(staticTheme.fonts.assets);
  const stackScreenOptions = useMemo(
    () => ({
      headerShown: false,
      contentStyle: {
        backgroundColor: theme.colors.background.app,
      },
    }),
    [theme.colors.background.app],
  );

  useEffect(() => {
    void hydrateSettings();
  }, [hydrateSettings]);

  useEffect(() => {
    if (error) {
      throw error;
    }
  }, [error]);

  useEffect(() => {
    void SystemUI.setBackgroundColorAsync(theme.colors.background.app);
  }, [theme.colors.background.app]);

  useEffect(() => {
    if (loaded && hydrated) {
      void SplashScreen.hideAsync();
    }
  }, [hydrated, loaded]);

  if (!loaded || !hydrated) {
    return null;
  }

  return (
    <KeyboardProvider>
      <SafeAreaProvider>
        <StatusBar
          animated
          backgroundColor={theme.colors.background.app}
          style={theme.isDark ? 'light' : 'dark'}
          translucent={false}
        />
        <Stack screenOptions={stackScreenOptions}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="+not-found" />
        </Stack>
      </SafeAreaProvider>
    </KeyboardProvider>
  );
}
