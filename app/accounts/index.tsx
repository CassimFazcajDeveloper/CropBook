import { router, Stack } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Button, Card, IconButton, ProgressBar, Text, useTheme } from 'react-native-paper';
import { useShallow } from 'zustand/react/shallow';
import { Money, SectionCard, Stat } from '@/components/ui';
import { balanceOf, useAccountsStore } from '@/stores/accountsStore';
import { sumBy, useFarmStore } from '@/stores/farmStore';
import { headerTint } from '@/theme';

const ICONS = ['🚜', '💎', '👤', '🏦', '📦', '🎯'];

export default function AccountsScreen() {
  const theme = useTheme();
  const sales = useFarmStore((s) => s.sales);
  const { accounts, allocations } = useAccountsStore(
    useShallow((s) => ({ accounts: s.accounts, allocations: s.allocations })),
  );
  const totalSales = sumBy(sales, (s) => s.total);
  const allocated = sumBy(allocations, (a) => a.amount);
  const unallocated = totalSales - allocated;

  return (
    <>
      <Stack.Screen
        options={{
          headerRight: () => (
            <IconButton icon="tune-variant" iconColor={headerTint(theme)} accessibilityLabel="Edit accounts" onPress={() => router.push('/form/accounts')} />
          ),
        }}
      />
      <ScrollView contentContainerStyle={styles.container}>
        <Card mode="contained" style={[styles.hero, { backgroundColor: theme.colors.primaryContainer }]}>
          <Card.Content style={{ gap: 8 }}>
            <Text variant="labelLarge" style={{ color: theme.colors.onPrimaryContainer }}>
              Unallocated sales
            </Text>
            <Money value={unallocated} variant="displaySmall" color={theme.colors.onPrimaryContainer} />
            <Text variant="bodySmall" style={{ color: theme.colors.onPrimaryContainer }}>
              Total sales minus everything already split into accounts.
            </Text>
            <Button mode="contained" icon="call-split" style={{ marginTop: 8 }} contentStyle={{ height: 48 }} onPress={() => router.push('/form/allocate')}>
              Allocate sale
            </Button>
          </Card.Content>
        </Card>

        <SectionCard>
          <View style={styles.row}>
            <Stat label="Total generated" value={totalSales} />
            <Stat label="Allocated" value={allocated} />
          </View>
        </SectionCard>

        <Text variant="titleMedium" style={styles.heading}>
          Accounts
        </Text>
        {accounts.map((a, i) => {
          const balance = balanceOf(allocations, a.id);
          const share = allocated > 0 ? balance / allocated : 0;
          return (
            <SectionCard
              key={a.id}
              onPress={() => router.push({ pathname: '/accounts/[id]', params: { id: String(a.id) } })}
            >
              <View style={styles.accountRow}>
                <Text style={{ fontSize: 32 }}>{ICONS[i % ICONS.length]}</Text>
                <View style={{ flex: 1 }}>
                  <Text variant="titleMedium" style={{ fontWeight: '600' }}>
                    {a.name}
                  </Text>
                  <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                    Target {a.targetPercent}% · actual {Math.round(share * 100)}%
                  </Text>
                </View>
                <Money value={balance} variant="titleLarge" />
              </View>
              <ProgressBar progress={Math.min(1, share)} color={theme.colors.primary} style={styles.bar} />
            </SectionCard>
          );
        })}
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 12, paddingBottom: 40 },
  hero: { borderRadius: 24 },
  row: { flexDirection: 'row', gap: 12 },
  heading: { fontWeight: '600', marginTop: 8, marginLeft: 4 },
  accountRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  bar: { height: 6, borderRadius: 3 },
});
