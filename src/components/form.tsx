import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import type { ReactNode } from 'react';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { Button, Dialog, HelperText, Portal, Text, TextInput, TouchableRipple, useTheme } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { formatDate, fromISODate, toISODate } from '../utils/dates';

export function FormScreen({
  children,
  onSave,
  saving,
  onDelete,
  saveLabel = 'Save',
}: {
  children: ReactNode;
  onSave: () => void;
  saving?: boolean;
  onDelete?: () => void;
  saveLabel?: string;
}) {
  const insets = useSafeAreaInsets();
  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
        {children}
      </ScrollView>
      <View style={[styles.footer, { paddingBottom: 12 + insets.bottom }]}>
        {onDelete ? (
          <Button mode="outlined" icon="delete-outline" onPress={onDelete} style={{ flex: 1 }} contentStyle={styles.btn}>
            Delete
          </Button>
        ) : null}
        <Button mode="contained" onPress={onSave} loading={saving} disabled={saving} style={{ flex: 2 }} contentStyle={styles.btn}>
          {saveLabel}
        </Button>
      </View>
    </KeyboardAvoidingView>
  );
}

export function Field({
  label,
  value,
  onChangeText,
  error,
  numeric,
  multiline,
  prefix,
  autoFocus,
  placeholder,
}: {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  error?: string;
  numeric?: boolean;
  multiline?: boolean;
  prefix?: string;
  autoFocus?: boolean;
  placeholder?: string;
}) {
  return (
    <View>
      <TextInput
        mode="outlined"
        label={label}
        value={value}
        onChangeText={onChangeText}
        keyboardType={numeric ? 'decimal-pad' : 'default'}
        multiline={multiline}
        autoFocus={autoFocus}
        placeholder={placeholder}
        error={!!error}
        left={prefix ? <TextInput.Affix text={prefix} /> : undefined}
        style={multiline ? { minHeight: 80 } : undefined}
        outlineStyle={{ borderRadius: 12 }}
      />
      {error ? (
        <HelperText type="error" visible>
          {error}
        </HelperText>
      ) : null}
    </View>
  );
}

export function DateField({ label, value, onChange }: { label: string; value: string; onChange: (iso: string) => void }) {
  const [open, setOpen] = useState(false);
  const onPicked = (e: DateTimePickerEvent, d?: Date) => {
    setOpen(false);
    if (e.type === 'set' && d) onChange(toISODate(d));
  };
  return (
    <View>
      <TouchableRipple onPress={() => setOpen(true)} borderless style={{ borderRadius: 12 }}>
        <View pointerEvents="none">
          <TextInput
            mode="outlined"
            label={label}
            value={formatDate(value)}
            editable={false}
            right={<TextInput.Icon icon="calendar" />}
            outlineStyle={{ borderRadius: 12 }}
          />
        </View>
      </TouchableRipple>
      {open ? <DateTimePicker value={fromISODate(value)} mode="date" onChange={onPicked} maximumDate={new Date(2100, 0, 1)} /> : null}
    </View>
  );
}

export function ChipGroup<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: readonly T[];
  value: T;
  onChange: (v: T) => void;
}) {
  const theme = useTheme();
  return (
    <View style={{ gap: 8 }}>
      <Text variant="labelLarge" style={{ color: theme.colors.onSurfaceVariant }}>
        {label}
      </Text>
      <View style={styles.chips}>
        {options.map((o) => {
          const selected = o === value;
          return (
            <TouchableRipple
              key={o}
              onPress={() => onChange(o)}
              borderless
              style={[
                styles.chip,
                {
                  backgroundColor: selected ? theme.colors.secondaryContainer : 'transparent',
                  borderColor: selected ? theme.colors.secondaryContainer : theme.colors.outline,
                },
              ]}
            >
              <Text
                variant="labelLarge"
                style={{ color: selected ? theme.colors.onSecondaryContainer : theme.colors.onSurfaceVariant }}
              >
                {selected ? '✓ ' : ''}
                {o}
              </Text>
            </TouchableRipple>
          );
        })}
      </View>
    </View>
  );
}

export function ConfirmDialog({
  visible,
  title,
  message,
  confirmLabel = 'Delete',
  onConfirm,
  onDismiss,
}: {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onDismiss: () => void;
}) {
  const theme = useTheme();
  return (
    <Portal>
      <Dialog visible={visible} onDismiss={onDismiss}>
        <Dialog.Title>{title}</Dialog.Title>
        <Dialog.Content>
          <Text variant="bodyMedium">{message}</Text>
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={onDismiss}>Cancel</Button>
          <Button onPress={onConfirm} textColor={theme.colors.error}>
            {confirmLabel}
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
}

const styles = StyleSheet.create({
  body: { padding: 16, gap: 12 },
  footer: { flexDirection: 'row', gap: 12, paddingHorizontal: 16, paddingTop: 12 },
  btn: { height: 52 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8 },
});
