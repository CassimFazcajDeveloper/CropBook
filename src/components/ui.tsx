import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { Card, Text, useTheme } from 'react-native-paper';
import { cardBg, negative, positive } from '../theme';
import { formatMK } from '../utils/currency';

export function Money({
  value,
  variant = 'titleLarge',
  signed = false,
  color,
}: {
  value: number;
  variant?: 'displaySmall' | 'headlineMedium' | 'headlineSmall' | 'titleLarge' | 'titleMedium' | 'bodyLarge';
  signed?: boolean;
  color?: string;
}) {
  const theme = useTheme();
  const tint = color ?? (signed ? (value < 0 ? negative(theme) : positive(theme)) : theme.colors.onSurface);
  return (
    <Text variant={variant} style={{ color: tint, fontWeight: '700', fontVariant: ['tabular-nums'] }} numberOfLines={1} adjustsFontSizeToFit>
      {formatMK(value)}
    </Text>
  );
}

export function Stat({ label, value, signed, big }: { label: string; value: number; signed?: boolean; big?: boolean }) {
  const theme = useTheme();
  return (
    <View style={styles.stat}>
      <Text variant="labelMedium" style={{ color: theme.colors.onSurfaceVariant }}>
        {label}
      </Text>
      <Money value={value} signed={signed} variant={big ? 'headlineSmall' : 'titleMedium'} />
    </View>
  );
}

export function TotalsRow({ sales, costs, net }: { sales: number; costs: number; net: number }) {
  return (
    <View style={styles.row}>
      <Stat label="Sales" value={sales} />
      <Stat label="Costs" value={costs} />
      <Stat label="Net" value={net} signed />
    </View>
  );
}

export function SectionCard({
  title,
  right,
  children,
  onPress,
  style,
}: {
  title?: string;
  right?: ReactNode;
  children: ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}) {
  const theme = useTheme();
  return (
    <Card mode="contained" style={[styles.card, { backgroundColor: cardBg(theme) }, style]} onPress={onPress}>
      <Card.Content style={{ gap: 12 }}>
        {title ? (
          <View style={styles.titleRow}>
            <Text variant="titleMedium" style={{ fontWeight: '600' }}>
              {title}
            </Text>
            {right}
          </View>
        ) : null}
        {children}
      </Card.Content>
    </Card>
  );
}

export function EmptyState({ emoji, title, hint }: { emoji: string; title: string; hint: string }) {
  const theme = useTheme();
  return (
    <View style={styles.empty}>
      <Text style={{ fontSize: 48 }}>{emoji}</Text>
      <Text variant="titleMedium" style={{ fontWeight: '600', textAlign: 'center' }}>
        {title}
      </Text>
      <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, textAlign: 'center' }}>
        {hint}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  stat: { flex: 1, gap: 2 },
  row: { flexDirection: 'row', gap: 12 },
  card: { borderRadius: 20 },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  empty: { alignItems: 'center', justifyContent: 'center', gap: 8, padding: 32, paddingTop: 48 },
});
