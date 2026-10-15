import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, HelperText, List, RadioButton, SegmentedButtons, Text, useTheme } from 'react-native-paper';
import { DateField, Field, FormScreen } from '@/components/form';
import { EmptyState, Money } from '@/components/ui';
import { splitByPercent, useAccountsStore } from '@/stores/accountsStore';
import { useFarmStore } from '@/stores/farmStore';
import { negative } from '@/theme';
import { formatMK, parseMoney } from '@/utils/currency';
import { formatDate, todayISO } from '@/utils/dates';

export default function AllocateForm() {
  const theme = useTheme();
  const sales = useFarmStore((s) => s.sales);
  const crops = useFarmStore((s) => s.crops);
  const accounts = useAccountsStore((s) => s.accounts);
  const allocations = useAccountsStore((s) => s.allocations);

  const openSales = useMemo(() => {
    const used = new Map<number, number>();
    for (const a of allocations) if (a.saleId !== null) used.set(a.saleId, (used.get(a.saleId) ?? 0) + a.amount);
    return sales
      .map((s) => ({ sale: s, remaining: s.total - (used.get(s.id) ?? 0) }))
      .filter((x) => x.remaining > 0);
  }, [sales, allocations]);

  const [source, setSource] = useState<'sale' | 'amount'>(openSales.length ? 'sale' : 'amount');
  const [saleId, setSaleId] = useState<number | null>(null);
  const [amountText, setAmountText] = useState('');
  const [parts, setParts] = useState<string[]>(accounts.map(() => ''));
  const [date, setDate] = useState(todayISO());
  const [note, setNote] = useState('');
  const [error, setError] = useState<string>();
  const [saving, setSaving] = useState(false);

  const amount = parseMoney(amountText) ?? 0;
  const partValues = parts.map((p) => parseMoney(p) ?? 0);
  const partsTotal = partValues.reduce((a, b) => a + b, 0);
  const diff = amount - partsTotal;

  const suggest = (value: number) => {
    setParts(splitByPercent(value, accounts).map(String));
    setError(undefined);
  };

  const pickSale = (id: number, remaining: number) => {
    setSaleId(id);
    setAmountText(String(remaining));
    suggest(remaining);
  };

  const cropOf = (cropId: number) => crops.find((c) => c.id === cropId);

  const save = async () => {
    if (source === 'sale' && saleId === null) return setError('Pick a sale to allocate');
    if (amount <= 0) return setError('Enter an amount to allocate');
    if (partValues.some((v) => v < 0)) return setError('Amounts cannot be negative');
    if (diff !== 0) return setError(`Split must add up to ${formatMK(amount)}`);
    setSaving(true);
    await useAccountsStore.getState().addAllocations(
      accounts
        .map((a, i) => ({
          accountId: a.id,
          amount: partValues[i],
          date,
          saleId: source === 'sale' ? saleId : null,
          note: note.trim(),
        }))
        .filter((r) => r.amount > 0),
    );
    router.back();
  };

  return (
    <FormScreen onSave={save} saving={saving} saveLabel="Save allocation">
      <SegmentedButtons
        value={source}
        onValueChange={(v) => {
          setSource(v as 'sale' | 'amount');
          setSaleId(null);
          setError(undefined);
        }}
        buttons={[
          { value: 'sale', label: 'From a sale', icon: 'receipt-text-outline' },
          { value: 'amount', label: 'Enter amount', icon: 'cash' },
        ]}
      />

      {source === 'sale' ? (
        openSales.length === 0 ? (
          <EmptyState emoji="✅" title="All sales allocated" hint="Record a new sale, or enter an amount manually." />
        ) : (
          <View style={[styles.list, { borderColor: theme.colors.outlineVariant }]}>
            {openSales.map(({ sale, remaining }) => {
              const crop = cropOf(sale.cropId);
              return (
                <List.Item
                  key={sale.id}
                  title={`${crop?.emoji ?? ''} ${crop?.name ?? 'Sale'} · ${formatMK(remaining)}`}
                  description={`${formatDate(sale.date)}${remaining < sale.total ? ` · of ${formatMK(sale.total)}` : ''}${sale.buyer ? ` · ${sale.buyer}` : ''}`}
                  onPress={() => pickSale(sale.id, remaining)}
                  left={() => (
                    <RadioButton
                      value={String(sale.id)}
                      status={saleId === sale.id ? 'checked' : 'unchecked'}
                      onPress={() => pickSale(sale.id, remaining)}
                    />
                  )}
                />
              );
            })}
          </View>
        )
      ) : (
        <Field
          label="Amount to allocate"
          value={amountText}
          onChangeText={(t) => {
            setAmountText(t);
            suggest(parseMoney(t) ?? 0);
          }}
          numeric
          prefix="MK"
        />
      )}

      {amount > 0 ? (
        <>
          <View style={styles.headerRow}>
            <Text variant="titleMedium" style={{ fontWeight: '600' }}>
              Split
            </Text>
            <Button compact icon="restore" onPress={() => suggest(amount)}>
              Reset to %
            </Button>
          </View>
          {accounts.map((a, i) => (
            <Field
              key={a.id}
              label={`${a.name} (${a.targetPercent}%)`}
              value={parts[i]}
              onChangeText={(t) => {
                setError(undefined);
                setParts((ps) => ps.map((p, j) => (j === i ? t : p)));
              }}
              numeric
              prefix="MK"
            />
          ))}
          <View style={[styles.summary, { backgroundColor: theme.colors.elevation.level2 }]}>
            <Text variant="labelLarge">{diff === 0 ? 'Fully split' : diff > 0 ? 'Left to split' : 'Over by'}</Text>
            <Money value={Math.abs(diff)} variant="titleMedium" color={diff === 0 ? undefined : negative(theme)} />
          </View>
          <DateField label="Date" value={date} onChange={setDate} />
          <Field label="Note (optional)" value={note} onChangeText={setNote} />
        </>
      ) : null}

      {error ? (
        <HelperText type="error" visible>
          {error}
        </HelperText>
      ) : null}
    </FormScreen>
  );
}

const styles = StyleSheet.create({
  list: { borderWidth: 1, borderRadius: 14, overflow: 'hidden' },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
  summary: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderRadius: 14 },
});
