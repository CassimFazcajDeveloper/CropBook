import { router, Stack } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Card, IconButton, Text, useTheme } from 'react-native-paper';
import { useShallow } from 'zustand/react/shallow';
import { ThemeMenu } from '@/components/ThemeMenu';
import { Money, SectionCard, Stat, TotalsRow } from '@/components/ui';
import { balanceOf, useAccountsStore } from '@/stores/accountsStore';
import { cropTotals, useFarmStore } from '@/stores/farmStore';
import { cardBg, headerTint } from '@/theme';
import { formatDate, todayISO } from '@/utils/dates';

export default function Dashboard() {
  const theme = useTheme();
  const { crops, inputs, activities, sales } = useFarmStore(
    useShallow((s) => ({ crops: s.crops, inputs: s.inputs, activities: s.activities, sales: s.sales })),
  );
  const { accounts, allocations } = useAccountsStore(
    useShallow((s) => ({ accounts: s.accounts, allocations: s.allocations })),
  );

  const totals = useMemo(() => cropTotals({ inputs, activities, sales }), [inputs, activities, sales]);
  const allocated = allocations.reduce((a, r) => a + r.amount, 0);
  const balanceByName = (name: string) => {
    const acc = accounts.find((a) => a.name.toLowerCase() === name.toLowerCase());
    return acc ? balanceOf(allocations, acc.id) : 0;
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerRight: () => (
            <View style={{ flexDirection: 'row' }}>
              <ThemeMenu />
              <IconButton
                icon="wallet-outline"
                iconColor={headerTint(theme)}
                onPress={() => router.push('/accounts')}
                accessibilityLabel="Profit First"
              />
            </View>
          ),
        }}
      />
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.greeting}>
          <Text variant="headlineSmall" style={{ fontWeight: '700' }}>
            Hello Saad 👋
          </Text>
          <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
            Welcome back · {formatDate(todayISO())}
          </Text>
        </View>
        <SectionCard title="All crops">
          <TotalsRow {...totals} />
        </SectionCard>

        <SectionCard
          title="Profit First"
          onPress={() => router.push('/accounts')}
          right={<Text variant="labelLarge" style={{ color: theme.colors.primary }}>Open ›</Text>}
        >
          <View style={styles.row}>
            <Stat label="Total generated" value={totals.sales} big />
            <Stat label="Unallocated sales" value={totals.sales - allocated} big />
          </View>
          <View style={styles.row}>
            <Stat label="Back to farm" value={balanceByName('Operations')} />
            <Stat label="Paid to me" value={balanceByName('My Salary')} />
            <Stat label="Profit" value={balanceByName('Profit')} />
          </View>
        </SectionCard>

        <Text variant="titleMedium" style={styles.heading}>
          Crops
        </Text>
        <View style={styles.grid}>
          {crops.map((crop) => {
            const t = cropTotals({ inputs, activities, sales }, crop.id);
            return (
              <Card
                key={crop.id}
                mode="contained"
                style={[styles.cropCard, { backgroundColor: cardBg(theme) }]}
                onPress={() => router.push({ pathname: '/crop/[id]', params: { id: String(crop.id) } })}
              >
                <Card.Content style={{ gap: 6 }}>
                  <Text style={{ fontSize: 40 }}>{crop.emoji}</Text>
                  <Text variant="titleMedium" numberOfLines={1} style={{ fontWeight: '600' }}>
                    {crop.name}
                  </Text>
                  <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
                    Net
                  </Text>
                  <Money value={t.net} signed variant="titleMedium" />
                </Card.Content>
              </Card>
            );
          })}
          <Pressable
            onPress={() => router.push('/form/crop')}
            style={({ pressed }) => [
              styles.cropCard,
              styles.addCard,
              { borderColor: theme.colors.outline, opacity: pressed ? 0.6 : 1 },
            ]}
            accessibilityRole="button"
          >
            <Text style={{ fontSize: 32, color: theme.colors.primary }}>＋</Text>
            <Text variant="titleMedium" style={{ color: theme.colors.primary, fontWeight: '600' }}>
              Add crop
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 16, paddingBottom: 40 },
  row: { flexDirection: 'row', gap: 12 },
  heading: { fontWeight: '600', marginTop: 4, marginLeft: 4 },
  greeting: { gap: 2, marginLeft: 4 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 12 },
  cropCard: { width: '48.5%', borderRadius: 20, minHeight: 150 },
  addCard: { borderWidth: 1.5, borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center', gap: 4 },
});
