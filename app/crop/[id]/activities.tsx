import { router, useLocalSearchParams } from 'expo-router';
import { useMemo } from 'react';
import { RecordList } from '@/components/RecordList';
import { sumBy, useFarmStore } from '@/stores/farmStore';
import { formatMK } from '@/utils/currency';
import { formatDate } from '@/utils/dates';

export default function ActivitiesTab() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const cropId = Number(id);
  const all = useFarmStore((s) => s.activities);
  const rows = useMemo(() => all.filter((r) => r.cropId === cropId), [all, cropId]);
  const { deleteRecord, restoreRecord } = useFarmStore.getState();

  return (
    <RecordList
      data={rows}
      noun="activity"
      totalLabel="Total activities"
      totalValue={formatMK(sumBy(rows, (r) => r.cost))}
      empty={{ emoji: '🚜', title: 'No activities yet', hint: 'Log tilling, planting, weeding, spraying and labour costs.' }}
      toRow={(r) => ({
        id: r.id,
        title: r.type,
        subtitle: [formatDate(r.date), r.description, r.note].filter(Boolean).join(' · '),
        amount: formatMK(r.cost),
      })}
      onAdd={() => router.push({ pathname: '/form/activity', params: { cropId: id } })}
      onEdit={(r) => router.push({ pathname: '/form/activity', params: { cropId: id, id: String(r.id) } })}
      onDelete={(r) => deleteRecord('activities', r)}
      onUndo={(r) => restoreRecord('activities', r)}
    />
  );
}
