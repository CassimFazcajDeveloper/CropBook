import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Chip } from 'react-native-paper';
import { DateField, Field, FormScreen } from '@/components/form';
import { useFarmStore } from '@/stores/farmStore';
import { parseMoney, parseNumber } from '@/utils/currency';
import { todayISO } from '@/utils/dates';

const ITEMS = ['Seed', 'Fertiliser', 'Pesticide', 'Herbicide', 'Manure', 'Fuel'];
const UNITS = ['kg', 'bags', 'litres', 'packets', 'pcs'];

export default function InputForm() {
  const { cropId, id } = useLocalSearchParams<{ cropId: string; id?: string }>();
  const existing = useFarmStore((s) => s.inputs.find((r) => String(r.id) === id));
  const { addRecord, updateRecord } = useFarmStore.getState();

  const [item, setItem] = useState(existing?.item ?? '');
  const [quantity, setQuantity] = useState(existing?.quantity ? String(existing.quantity) : '');
  const [unit, setUnit] = useState(existing?.unit ?? 'kg');
  const [cost, setCost] = useState(existing ? String(existing.cost) : '');
  const [date, setDate] = useState(existing?.datePurchased ?? todayISO());
  const [note, setNote] = useState(existing?.note ?? '');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const save = async () => {
    const e: Record<string, string> = {};
    const qty = parseNumber(quantity);
    const money = parseMoney(cost);
    if (!item.trim()) e.item = 'What did you buy?';
    if (quantity.trim() && (qty === null || qty < 0)) e.quantity = 'Enter a valid quantity';
    if (money === null || money < 0) e.cost = 'Enter the cost in kwacha';
    setErrors(e);
    if (Object.keys(e).length) return;
    const row = {
      cropId: Number(cropId),
      item: item.trim(),
      quantity: qty ?? 0,
      unit: unit.trim(),
      cost: money ?? 0,
      datePurchased: date,
      note: note.trim(),
    };
    if (existing) await updateRecord('inputs', { ...row, id: existing.id });
    else await addRecord('inputs', row);
    router.back();
  };

  return (
    <>
      <Stack.Screen options={{ title: existing ? 'Edit input' : 'New input' }} />
      <FormScreen onSave={save}>
        <Field label="Item" value={item} onChangeText={setItem} error={errors.item} placeholder="e.g. Seed" />
        <View style={styles.chips}>
          {ITEMS.map((i) => (
            <Chip key={i} compact selected={item === i} onPress={() => setItem(i)}>
              {i}
            </Chip>
          ))}
        </View>
        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Field label="Quantity" value={quantity} onChangeText={setQuantity} numeric error={errors.quantity} />
          </View>
          <View style={{ flex: 1 }}>
            <Field label="Unit" value={unit} onChangeText={setUnit} />
          </View>
        </View>
        <View style={styles.chips}>
          {UNITS.map((u) => (
            <Chip key={u} compact selected={unit === u} onPress={() => setUnit(u)}>
              {u}
            </Chip>
          ))}
        </View>
        <Field label="Cost" value={cost} onChangeText={setCost} numeric prefix="MK" error={errors.cost} />
        <DateField label="Date purchased" value={date} onChange={setDate} />
        <Field label="Note (optional)" value={note} onChangeText={setNote} multiline />
      </FormScreen>
    </>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 12 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
});
