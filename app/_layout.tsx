import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SystemUI from 'expo-system-ui';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { LaunchScreen } from '@/components/LaunchScreen';
import { initDb } from '@/db/client';
import { useAccountsStore } from '@/stores/accountsStore';
import { useFarmStore } from '@/stores/farmStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { darkTheme, headerBg, headerTint, lightTheme } from '@/theme';

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const scheme = useColorScheme();
  const themeMode = useSettingsStore((s) => s.themeMode);
  const isDark = themeMode === 'system' ? scheme === 'dark' : themeMode === 'dark';
  const theme = isDark ? darkTheme : lightTheme;
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const loadFarm = useFarmStore((s) => s.loadAll);
  const loadAccounts = useAccountsStore((s) => s.load);
  const loadSettings = useSettingsStore((s) => s.load);

  useEffect(() => {
    SystemUI.setBackgroundColorAsync(theme.colors.background).catch(() => {});
  }, [theme]);

  useEffect(() => {
    const minDelay = new Promise((r) => setTimeout(r, 1400));
    initDb()
      .then(() => Promise.all([loadFarm(), loadAccounts(), loadSettings(), minDelay]))
      .then(() => setReady(true))
      .catch((e: unknown) => setError(String(e)));
  }, [loadFarm, loadAccounts, loadSettings]);

  return (
    <SafeAreaProvider>
      <PaperProvider theme={theme}>
        <StatusBar style={ready || theme.dark ? 'light' : 'dark'} />
        {ready ? (
          <Stack
            screenOptions={{
              headerStyle: { backgroundColor: headerBg(theme) },
              headerTintColor: headerTint(theme),
              headerShadowVisible: false,
              contentStyle: { backgroundColor: theme.colors.background },
            }}
          >
            <Stack.Screen name="index" options={{ title: 'Sa\'ad CropBook' }} />
            <Stack.Screen name="crop/[id]" options={{ title: '' }} />
            <Stack.Screen name="accounts/index" options={{ title: 'Profit First' }} />
            <Stack.Screen name="accounts/[id]" options={{ title: '' }} />
            <Stack.Screen name="form/crop" options={{ presentation: 'modal', title: 'Crop' }} />
            <Stack.Screen name="form/input" options={{ presentation: 'modal', title: 'Input' }} />
            <Stack.Screen name="form/activity" options={{ presentation: 'modal', title: 'Activity' }} />
            <Stack.Screen name="form/harvest" options={{ presentation: 'modal', title: 'Harvest' }} />
            <Stack.Screen name="form/sale" options={{ presentation: 'modal', title: 'Sale' }} />
            <Stack.Screen name="form/allocate" options={{ presentation: 'modal', title: 'Allocate' }} />
            <Stack.Screen name="form/accounts" options={{ presentation: 'modal', title: 'Edit accounts' }} />
          </Stack>
        ) : (
          <LaunchScreen error={error} />
        )}
      </PaperProvider>
    </SafeAreaProvider>
  );
}
