import { router } from 'expo-router';
import { useCropId } from '@/components/CropContext';
import { useMemo } from 'react';
import { RecordList } from '@/components/RecordList';
import { useFarmStore } from '@/stores/farmStore';
import { formatQty } from '@/utils/currency';
import { formatDate } from '@/utils/dates';

export default function HarvestTab() {
  const id = useCropId();
  const cropId = Number(id);
  const all = useFarmStore((s) => s.harvests);
  const rows = useMemo(() => all.filter((r) => r.cropId === cropId), [all, cropId]);
  const { deleteRecord, restoreRecord } = useFarmStore.getState();

  const total = useMemo(() => {
    const byUnit = new Map<string, number>();
    for (const r of rows) byUnit.set(r.unit, (byUnit.get(r.unit) ?? 0) + r.quantity);
    return [...byUnit].map(([u, q]) => `${formatQty(q)} ${u}`).join(' · ') || '0';
  }, [rows]);

  return (
    <RecordList
      data={rows}
      noun="harvest"
      totalLabel="Harvested"
      totalValue={total}
      empty={{ emoji: '🧺', title: 'Nothing harvested yet', hint: 'Record each picking or harvest with the + button.' }}
      toRow={(r) => ({
        id: r.id,
        title: formatDate(r.date),
        subtitle: r.note,
        amount: `${formatQty(r.quantity)} ${r.unit}`,
      })}
      onAdd={() => router.push({ pathname: '/form/harvest', params: { cropId: id } })}
      onEdit={(r) => router.push({ pathname: '/form/harvest', params: { cropId: id, id: String(r.id) } })}
      onDelete={(r) => deleteRecord('harvests', r)}
      onUndo={(r) => restoreRecord('harvests', r)}
    />
  );
}
