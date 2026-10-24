import { router } from 'expo-router';
import { useCropId } from '@/components/CropContext';
import { useMemo } from 'react';
import { useTheme } from 'react-native-paper';
import { RecordList } from '@/components/RecordList';
import { useAccountsStore } from '@/stores/accountsStore';
import { sumBy, useFarmStore } from '@/stores/farmStore';
import { positive } from '@/theme';
import { formatMK, formatQty } from '@/utils/currency';
import { formatDate } from '@/utils/dates';

export default function SalesTab() {
  const theme = useTheme();
  const id = useCropId();
  const cropId = Number(id);
  const all = useFarmStore((s) => s.sales);
  const rows = useMemo(() => all.filter((r) => r.cropId === cropId), [all, cropId]);
  const { deleteRecord, restoreRecord } = useFarmStore.getState();

  return (
    <RecordList
      data={rows}
      noun="sale"
      totalLabel="Total sales"
      totalValue={formatMK(sumBy(rows, (r) => r.total))}
      empty={{ emoji: '💰', title: 'No sales yet', hint: 'Record what you sold, at what price and to whom.' }}
      toRow={(r) => ({
        id: r.id,
        title: `${formatQty(r.quantity)} ${r.unit} × ${formatMK(r.pricePerUnit)}`,
        subtitle: [formatDate(r.date), r.buyer, r.note].filter(Boolean).join(' · '),
        amount: formatMK(r.total),
        amountColor: positive(theme),
      })}
      onAdd={() => router.push({ pathname: '/form/sale', params: { cropId: id } })}
      onEdit={(r) => router.push({ pathname: '/form/sale', params: { cropId: id, id: String(r.id) } })}
      onDelete={async (r) => {
        await deleteRecord('sales', r);
        await useAccountsStore.getState().load();
      }}
      onUndo={(r) => restoreRecord('sales', r)}
    />
  );
}
