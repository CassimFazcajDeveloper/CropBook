import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { ChipGroup, DateField, Field, FormScreen } from '@/components/form';
import { Money } from '@/components/ui';
import { useFarmStore } from '@/stores/farmStore';
import { HARVEST_UNITS, type HarvestUnit } from '@/types';
import { parseMoney, parseNumber } from '@/utils/currency';
import { todayISO } from '@/utils/dates';

export default function SaleForm() {
  const theme = useTheme();
  const { cropId, id } = useLocalSearchParams<{ cropId: string; id?: string }>();
  const existing = useFarmStore((s) => s.sales.find((r) => String(r.id) === id));
  const { addRecord, updateRecord } = useFarmStore.getState();

  const [quantity, setQuantity] = useState(existing ? String(existing.quantity) : '');
  const [unit, setUnit] = useState<HarvestUnit>(existing?.unit ?? 'kg');
  const [price, setPrice] = useState(existing ? String(existing.pricePerUnit) : '');
  const [date, setDate] = useState(existing?.date ?? todayISO());
  const [buyer, setBuyer] = useState(existing?.buyer ?? '');
  const [note, setNote] = useState(existing?.note ?? '');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const qty = parseNumber(quantity);
  const ppu = parseMoney(price);
  const total = qty !== null && ppu !== null ? Math.round(qty * ppu) : 0;

  const save = async () => {
    const e: Record<string, string> = {};
    if (qty === null || qty <= 0) e.quantity = 'Enter the quantity sold';
    if (ppu === null || ppu < 0) e.price = 'Enter the price per unit';
    setErrors(e);
    if (Object.keys(e).length) return;
    const row = {
      cropId: Number(cropId),
      date,
      quantity: qty ?? 0,
      unit,
      pricePerUnit: ppu ?? 0,
      total,
      buyer: buyer.trim(),
      note: note.trim(),
    };
    if (existing) await updateRecord('sales', { ...row, id: existing.id });
    else await addRecord('sales', row);
    router.back();
  };

  return (
    <>
      <Stack.Screen options={{ title: existing ? 'Edit sale' : 'New sale' }} />
      <FormScreen onSave={save}>
        <Field label="Quantity" value={quantity} onChangeText={setQuantity} numeric error={errors.quantity} autoFocus={!existing} />
        <ChipGroup label="Unit" options={HARVEST_UNITS} value={unit} onChange={setUnit} />
        <Field label={`Price per ${unit.replace(/s$/, '')}`} value={price} onChangeText={setPrice} numeric prefix="MK" error={errors.price} />
        <View style={[styles.total, { backgroundColor: theme.colors.primaryContainer }]}>
          <Text variant="labelLarge" style={{ color: theme.colors.onPrimaryContainer }}>
            Total
          </Text>
          <Money value={total} variant="headlineSmall" color={theme.colors.onPrimaryContainer} />
        </View>
        <DateField label="Date" value={date} onChange={setDate} />
        <Field label="Buyer (optional)" value={buyer} onChangeText={setBuyer} />
        <Field label="Note (optional)" value={note} onChangeText={setNote} multiline />
      </FormScreen>
    </>
  );
}

const styles = StyleSheet.create({
  total: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderRadius: 14 },
});
