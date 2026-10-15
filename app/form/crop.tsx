import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Text, TouchableRipple, useTheme } from 'react-native-paper';
import { ConfirmDialog, Field, FormScreen } from '@/components/form';
import { useAccountsStore } from '@/stores/accountsStore';
import { useFarmStore } from '@/stores/farmStore';

const EMOJIS = [
  '🍅', '🧅', '🌽', '🥔', '🥕', '🥬', '🥦', '🫑', '🌶️', '🍆', '🥒', '🧄',
  '🫘', '🥜', '🌻', '🌾', '🍠', '🎃', '🍉', '🍌', '🍍', '🥭', '🍊', '🍋',
  '🍓', '🫛', '🥑', '☕', '🌿', '🌱', '🍃', '🚜',
];

export default function CropForm() {
  const theme = useTheme();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const existing = useFarmStore((s) => s.crops.find((c) => String(c.id) === id));
  const { addCrop, updateCrop, deleteCrop } = useFarmStore.getState();

  const [name, setName] = useState(existing?.name ?? '');
  const [emoji, setEmoji] = useState(existing?.emoji ?? '🌱');
  const [error, setError] = useState<string>();
  const [saving, setSaving] = useState(false);
  const [confirm, setConfirm] = useState(false);

  const save = async () => {
    if (!name.trim()) return setError('Give the crop a name');
    setSaving(true);
    if (existing) await updateCrop({ ...existing, name: name.trim(), emoji });
    else await addCrop(name, emoji);
    router.back();
  };

  const remove = async () => {
    if (!existing) return;
    setConfirm(false);
    await deleteCrop(existing.id);
    await useAccountsStore.getState().load();
    router.dismissAll();
  };

  return (
    <>
      <Stack.Screen options={{ title: existing ? 'Edit crop' : 'New crop' }} />
      <FormScreen onSave={save} saving={saving} onDelete={existing ? () => setConfirm(true) : undefined}>
        <View style={[styles.preview, { backgroundColor: theme.colors.primaryContainer }]}>
          <Text style={{ fontSize: 56 }}>{emoji}</Text>
        </View>
        <Field label="Crop name" value={name} onChangeText={(t) => { setName(t); setError(undefined); }} error={error} autoFocus={!existing} />
        <Text variant="labelLarge" style={{ color: theme.colors.onSurfaceVariant, marginTop: 4 }}>
          Icon
        </Text>
        <View style={styles.grid}>
          {EMOJIS.map((e) => (
            <TouchableRipple
              key={e}
              onPress={() => setEmoji(e)}
              borderless
              style={[
                styles.emoji,
                { backgroundColor: e === emoji ? theme.colors.secondaryContainer : theme.colors.elevation.level1 },
              ]}
            >
              <Text style={{ fontSize: 26 }}>{e}</Text>
            </TouchableRipple>
          ))}
        </View>
      </FormScreen>
      <ConfirmDialog
        visible={confirm}
        title={`Delete ${existing?.name ?? 'crop'}?`}
        message="This permanently removes the crop and all its inputs, activities, harvests and sales."
        onConfirm={remove}
        onDismiss={() => setConfirm(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  preview: { alignSelf: 'center', width: 96, height: 96, borderRadius: 48, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  emoji: { width: 48, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
});
