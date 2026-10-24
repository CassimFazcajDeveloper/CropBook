import { router } from 'expo-router';
import { useCropId } from '@/components/CropContext';
import { useMemo } from 'react';
import { RecordList } from '@/components/RecordList';
import { sumBy, useFarmStore } from '@/stores/farmStore';
import { formatMK, formatQty } from '@/utils/currency';
import { formatDate } from '@/utils/dates';

export default function InputsTab() {
  const id = useCropId();
  const cropId = Number(id);
  const all = useFarmStore((s) => s.inputs);
  const rows = useMemo(() => all.filter((r) => r.cropId === cropId), [all, cropId]);
  const { deleteRecord, restoreRecord } = useFarmStore.getState();

  return (
    <RecordList
      data={rows}
      noun="input"
      totalLabel="Total inputs"
      totalValue={formatMK(sumBy(rows, (r) => r.cost))}
      empty={{ emoji: '🧪', title: 'No inputs yet', hint: 'Record seed, fertiliser or pesticide purchases with the + button.' }}
      toRow={(r) => ({
        id: r.id,
        title: r.item,
        subtitle: [formatDate(r.datePurchased), r.quantity ? `${formatQty(r.quantity)} ${r.unit}`.trim() : '', r.note]
          .filter(Boolean)
          .join(' · '),
        amount: formatMK(r.cost),
      })}
      onAdd={() => router.push({ pathname: '/form/input', params: { cropId: id } })}
      onEdit={(r) => router.push({ pathname: '/form/input', params: { cropId: id, id: String(r.id) } })}
      onDelete={(r) => deleteRecord('inputs', r)}
      onUndo={(r) => restoreRecord('inputs', r)}
    />
  );
}
