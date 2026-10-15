import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { HelperText, Text, useTheme } from 'react-native-paper';
import { Field, FormScreen } from '@/components/form';
import { useAccountsStore } from '@/stores/accountsStore';
import { negative, positive } from '@/theme';
import { parseNumber } from '@/utils/currency';

export default function EditAccounts() {
  const theme = useTheme();
  const accounts = useAccountsStore((s) => s.accounts);
  const [drafts, setDrafts] = useState(accounts.map((a) => ({ ...a, pct: String(a.targetPercent) })));
  const [error, setError] = useState<string>();
  const [saving, setSaving] = useState(false);

  const total = drafts.reduce((acc, d) => acc + (parseNumber(d.pct) ?? 0), 0);

  const update = (i: number, patch: Partial<(typeof drafts)[number]>) => {
    setError(undefined);
    setDrafts((ds) => ds.map((d, j) => (j === i ? { ...d, ...patch } : d)));
  };

  const save = async () => {
    if (drafts.some((d) => !d.name.trim())) return setError('Every account needs a name');
    const pcts = drafts.map((d) => parseNumber(d.pct));
    if (pcts.some((p) => p === null || p < 0 || !Number.isInteger(p))) return setError('Use whole percentages');
    if (total !== 100) return setError(`Percentages must total 100% (now ${total}%)`);
    setSaving(true);
    await useAccountsStore.getState().saveAccounts(
      drafts.map(({ pct, ...a }) => ({ ...a, name: a.name.trim(), targetPercent: parseNumber(pct) ?? 0 })),
    );
    router.back();
  };

  return (
    <FormScreen onSave={save} saving={saving}>
      {drafts.map((d, i) => (
        <View key={d.id} style={styles.row}>
          <View style={{ flex: 2 }}>
            <Field label="Account name" value={d.name} onChangeText={(t) => update(i, { name: t })} />
          </View>
          <View style={{ flex: 1 }}>
            <Field label="%" value={d.pct} onChangeText={(t) => update(i, { pct: t })} numeric />
          </View>
        </View>
      ))}
      <View style={[styles.total, { backgroundColor: theme.colors.elevation.level2 }]}>
        <Text variant="titleMedium">Total</Text>
        <Text
          variant="titleLarge"
          style={{ fontWeight: '700', color: total === 100 ? positive(theme) : negative(theme) }}
        >
          {total}%
        </Text>
      </View>
      {error ? (
        <HelperText type="error" visible>
          {error}
        </HelperText>
      ) : null}
    </FormScreen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 12 },
  total: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderRadius: 14 },
});
