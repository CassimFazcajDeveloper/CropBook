import { router, Stack, useLocalSearchParams } from 'expo-router';
import TopTabs from 'expo-router/js-top-tabs';
import { useMemo } from 'react';
import { View } from 'react-native';
import { IconButton, Text, useTheme } from 'react-native-paper';
import { useShallow } from 'zustand/react/shallow';
import { EmptyState, TotalsRow } from '@/components/ui';
import { cropTotals, useFarmStore } from '@/stores/farmStore';
import { headerTint } from '@/theme';

export default function CropLayout() {
  const theme = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const cropId = Number(id);
  const { crop, inputs, activities, sales } = useFarmStore(
    useShallow((s) => ({
      crop: s.crops.find((c) => c.id === cropId),
      inputs: s.inputs,
      activities: s.activities,
      sales: s.sales,
    })),
  );
  const totals = useMemo(() => cropTotals({ inputs, activities, sales }, cropId), [inputs, activities, sales, cropId]);

  if (!crop) {
    return <EmptyState emoji="🌾" title="Crop not found" hint="It may have been deleted." />;
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <Stack.Screen
        options={{
          title: `${crop.emoji}  ${crop.name}`,
          headerRight: () => (
            <IconButton
              icon="pencil-outline"
              iconColor={headerTint(theme)}
              accessibilityLabel="Edit crop"
              onPress={() => router.push({ pathname: '/form/crop', params: { id: String(crop.id) } })}
            />
          ),
        }}
      />
      <View style={{ marginHorizontal: 16, marginBottom: 8, padding: 16, borderRadius: 20, backgroundColor: theme.colors.primaryContainer }}>
        <Text variant="labelMedium" style={{ color: theme.colors.onPrimaryContainer, marginBottom: 6 }}>
          {crop.name} summary
        </Text>
        <TotalsRow {...totals} />
      </View>
      <TopTabs
        screenOptions={{
          tabBarStyle: { backgroundColor: theme.colors.background, elevation: 0, shadowOpacity: 0 },
          tabBarIndicatorStyle: { backgroundColor: theme.colors.primary, height: 3, borderRadius: 3 },
          tabBarActiveTintColor: theme.colors.primary,
          tabBarInactiveTintColor: theme.colors.onSurfaceVariant,
          tabBarLabelStyle: { fontWeight: '600', textTransform: 'none', fontSize: 14 },
          tabBarItemStyle: { paddingHorizontal: 0 },
          sceneStyle: { backgroundColor: theme.colors.background },
        }}
      >
        <TopTabs.Screen name="index" options={{ title: 'Inputs' }} />
        <TopTabs.Screen name="activities" options={{ title: 'Activities' }} />
        <TopTabs.Screen name="harvest" options={{ title: 'Harvest' }} />
        <TopTabs.Screen name="sales" options={{ title: 'Sales' }} />
      </TopTabs>
    </View>
  );
}
