import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ChipGroup, DateField, Field, FormScreen } from '@/components/form';
import { useFarmStore } from '@/stores/farmStore';
import { HARVEST_UNITS, type HarvestUnit } from '@/types';
import { parseNumber } from '@/utils/currency';
import { todayISO } from '@/utils/dates';

export default function HarvestForm() {
  const { cropId, id } = useLocalSearchParams<{ cropId: string; id?: string }>();
  const existing = useFarmStore((s) => s.harvests.find((r) => String(r.id) === id));
  const { addRecord, updateRecord } = useFarmStore.getState();

  const [quantity, setQuantity] = useState(existing ? String(existing.quantity) : '');
  const [unit, setUnit] = useState<HarvestUnit>(existing?.unit ?? 'kg');
  const [date, setDate] = useState(existing?.date ?? todayISO());
  const [note, setNote] = useState(existing?.note ?? '');
  const [error, setError] = useState<string>();

  const save = async () => {
    const qty = parseNumber(quantity);
    if (qty === null || qty <= 0) return setError('Enter how much you harvested');
    const row = { cropId: Number(cropId), date, quantity: qty, unit, note: note.trim() };
    if (existing) await updateRecord('harvests', { ...row, id: existing.id });
    else await addRecord('harvests', row);
    router.back();
  };

  return (
    <>
      <Stack.Screen options={{ title: existing ? 'Edit harvest' : 'New harvest' }} />
      <FormScreen onSave={save}>
        <Field label="Quantity" value={quantity} onChangeText={(t) => { setQuantity(t); setError(undefined); }} numeric error={error} autoFocus={!existing} />
        <ChipGroup label="Unit" options={HARVEST_UNITS} value={unit} onChange={setUnit} />
        <DateField label="Date" value={date} onChange={setDate} />
        <Field label="Note (optional)" value={note} onChangeText={setNote} multiline />
      </FormScreen>
    </>
  );
}
