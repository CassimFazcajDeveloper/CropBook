import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ChipGroup, DateField, Field, FormScreen } from '@/components/form';
import { useFarmStore } from '@/stores/farmStore';
import { ACTIVITY_TYPES, type ActivityType } from '@/types';
import { parseMoney } from '@/utils/currency';
import { todayISO } from '@/utils/dates';

export default function ActivityForm() {
  const { cropId, id } = useLocalSearchParams<{ cropId: string; id?: string }>();
  const existing = useFarmStore((s) => s.activities.find((r) => String(r.id) === id));
  const { addRecord, updateRecord } = useFarmStore.getState();

  const [type, setType] = useState<ActivityType>(existing?.type ?? 'Land tilling');
  const [description, setDescription] = useState(existing?.description ?? '');
  const [cost, setCost] = useState(existing ? String(existing.cost) : '');
  const [date, setDate] = useState(existing?.date ?? todayISO());
  const [note, setNote] = useState(existing?.note ?? '');
  const [error, setError] = useState<string>();
  const [saving, setSaving] = useState(false);

  const save = async () => {
    const money = parseMoney(cost);
    if (money === null || money < 0) return setError('Enter the cost in kwacha');
    setSaving(true);
    const row = { cropId: Number(cropId), type, description: description.trim(), cost: money, date, note: note.trim() };
    if (existing) await updateRecord('activities', { ...row, id: existing.id });
    else await addRecord('activities', row);
    router.back();
  };

  return (
    <>
      <Stack.Screen options={{ title: existing ? 'Edit activity' : 'New activity' }} />
      <FormScreen onSave={save} saving={saving}>
        <ChipGroup label="Type" options={ACTIVITY_TYPES} value={type} onChange={setType} />
        <Field label="Description" value={description} onChangeText={setDescription} placeholder="e.g. 3 workers, half day" />
        <Field label="Cost" value={cost} onChangeText={(t) => { setCost(t); setError(undefined); }} numeric prefix="MK" error={error} />
        <DateField label="Date" value={date} onChange={setDate} />
        <Field label="Note (optional)" value={note} onChangeText={setNote} multiline />
      </FormScreen>
    </>
  );
}
