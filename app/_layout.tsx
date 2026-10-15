import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SystemUI from 'expo-system-ui';
import { useEffect, useState } from 'react';
import { useColorScheme, View } from 'react-native';
import { ActivityIndicator, PaperProvider, Text } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { initDb } from '@/db/client';
import { useAccountsStore } from '@/stores/accountsStore';
import { useFarmStore } from '@/stores/farmStore';
import { darkTheme, lightTheme } from '@/theme';

export default function RootLayout() {
  const scheme = useColorScheme();
  const theme = scheme === 'dark' ? darkTheme : lightTheme;
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const loadFarm = useFarmStore((s) => s.loadAll);
  const loadAccounts = useAccountsStore((s) => s.load);

  useEffect(() => {
    SystemUI.setBackgroundColorAsync(theme.colors.background).catch(() => {});
  }, [theme]);

  useEffect(() => {
    initDb()
      .then(() => Promise.all([loadFarm(), loadAccounts()]))
      .then(() => setReady(true))
      .catch((e: unknown) => setError(String(e)));
  }, [loadFarm, loadAccounts]);

  return (
    <SafeAreaProvider>
      <PaperProvider theme={theme}>
        <StatusBar style={theme.dark ? 'light' : 'dark'} />
        {ready ? (
          <Stack
            screenOptions={{
              headerStyle: { backgroundColor: theme.colors.background },
              headerTintColor: theme.colors.onBackground,
              headerShadowVisible: false,
              contentStyle: { backgroundColor: theme.colors.background },
            }}
          >
            <Stack.Screen name="index" options={{ title: 'Saad CropBook' }} />
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
          <View
            style={{
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: theme.colors.background,
              padding: 24,
            }}
          >
            {error ? <Text style={{ color: theme.colors.error }}>{error}</Text> : <ActivityIndicator />}
          </View>
        )}
      </PaperProvider>
    </SafeAreaProvider>
  );
}
