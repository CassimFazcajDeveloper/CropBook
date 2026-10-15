import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useMemo } from 'react';
import { View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { RecordList } from '@/components/RecordList';
import { Money } from '@/components/ui';
import { balanceOf, useAccountsStore } from '@/stores/accountsStore';
import { useFarmStore } from '@/stores/farmStore';
import { formatMK } from '@/utils/currency';
import { formatDate } from '@/utils/dates';

export default function AccountDetail() {
  const theme = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const accountId = Number(id);
  const account = useAccountsStore((s) => s.accounts.find((a) => a.id === accountId));
  const allAllocations = useAccountsStore((s) => s.allocations);
  const sales = useFarmStore((s) => s.sales);
  const crops = useFarmStore((s) => s.crops);
  const rows = useMemo(() => allAllocations.filter((a) => a.accountId === accountId), [allAllocations, accountId]);
  const { deleteAllocation, restoreAllocation } = useAccountsStore.getState();

  const saleLabel = (saleId: number | null) => {
    const sale = sales.find((s) => s.id === saleId);
    if (!sale) return 'Manual amount';
    const crop = crops.find((c) => c.id === sale.cropId);
    return `${crop ? `${crop.emoji} ${crop.name}` : 'Sale'} · ${formatDate(sale.date)}`;
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <Stack.Screen options={{ title: account?.name ?? 'Account' }} />
      <View style={{ marginHorizontal: 16, marginTop: 8, padding: 20, borderRadius: 20, backgroundColor: theme.colors.primaryContainer, gap: 4 }}>
        <Text variant="labelLarge" style={{ color: theme.colors.onPrimaryContainer }}>
          Balance · target {account?.targetPercent ?? 0}%
        </Text>
        <Money value={balanceOf(allAllocations, accountId)} variant="displaySmall" color={theme.colors.onPrimaryContainer} />
      </View>
      <RecordList
        data={rows}
        noun="allocation"
        totalLabel="History"
        totalValue={formatMK(rows.reduce((a, r) => a + r.amount, 0))}
        empty={{ emoji: '🪙', title: 'No allocations yet', hint: 'Use “Allocate sale” to split income into your accounts.' }}
        toRow={(r) => ({
          id: r.id,
          title: saleLabel(r.saleId),
          subtitle: [formatDate(r.date), r.note].filter(Boolean).join(' · '),
          amount: formatMK(r.amount),
        })}
        onAdd={() => router.push('/form/allocate')}
        onDelete={deleteAllocation}
        onUndo={restoreAllocation}
      />
    </View>
  );
}
