import { useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { Divider, FAB, List, Snackbar, Text, useTheme } from 'react-native-paper';
import { EmptyState } from './ui';

export interface RecordRow {
  id: number;
  title: string;
  subtitle: string;
  amount: string;
  amountColor?: string;
}

export function RecordList<T extends { id: number }>({
  data,
  toRow,
  totalLabel,
  totalValue,
  empty,
  onAdd,
  onEdit,
  onDelete,
  onUndo,
  noun,
}: {
  data: T[];
  toRow: (item: T) => RecordRow;
  totalLabel: string;
  totalValue: string;
  empty: { emoji: string; title: string; hint: string };
  onAdd: () => void;
  onEdit?: (item: T) => void;
  onDelete: (item: T) => Promise<void>;
  onUndo: (item: T) => Promise<void>;
  noun: string;
}) {
  const theme = useTheme();
  const [deleted, setDeleted] = useState<T | null>(null);

  const remove = async (item: T) => {
    await onDelete(item);
    setDeleted(item);
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      {data.length > 0 ? (
        <View style={[styles.total, { backgroundColor: theme.colors.secondaryContainer }]}>
          <Text variant="labelLarge" style={{ color: theme.colors.onSecondaryContainer }}>
            {totalLabel} · {data.length} {data.length === 1 ? 'entry' : 'entries'}
          </Text>
          <Text variant="titleMedium" style={{ color: theme.colors.onSecondaryContainer, fontWeight: '700' }}>
            {totalValue}
          </Text>
        </View>
      ) : null}
      <FlatList
        data={data}
        keyExtractor={(item) => String(item.id)}
        ItemSeparatorComponent={() => <Divider style={{ marginLeft: 16 }} />}
        contentContainerStyle={{ paddingBottom: 96, flexGrow: 1 }}
        ListEmptyComponent={<EmptyState {...empty} />}
        renderItem={({ item }) => {
          const row = toRow(item);
          return (
            <List.Item
              title={row.title}
              description={row.subtitle}
              titleStyle={{ fontWeight: '600' }}
              descriptionNumberOfLines={2}
              onPress={onEdit ? () => onEdit(item) : undefined}
              onLongPress={() => remove(item)}
              right={() => (
                <Text
                  variant="titleMedium"
                  style={[styles.amount, { color: row.amountColor ?? theme.colors.onSurface }]}
                >
                  {row.amount}
                </Text>
              )}
            />
          );
        }}
      />
      <FAB icon="plus" style={styles.fab} onPress={onAdd} label={data.length === 0 ? `Add ${noun}` : undefined} />
      <Snackbar
        visible={deleted !== null}
        onDismiss={() => setDeleted(null)}
        duration={5000}
        action={{
          label: 'Undo',
          onPress: () => {
            if (deleted) onUndo(deleted);
            setDeleted(null);
          },
        }}
      >
        {`${noun[0].toUpperCase()}${noun.slice(1)} deleted`}
      </Snackbar>
    </View>
  );
}

const styles = StyleSheet.create({
  total: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 4,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 14,
  },
  amount: { alignSelf: 'center', fontWeight: '700', fontVariant: ['tabular-nums'] },
  fab: { position: 'absolute', right: 16, bottom: 16 },
});
