import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useRef } from 'react';
import { Animated, Image, StyleSheet, View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';

export const LOGO_SIZE = 288;

export function LaunchScreen({ error }: { error: string | null }) {
  const theme = useTheme();
  const fade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fade, { toValue: 1, duration: 450, delay: 150, useNativeDriver: true }).start();
  }, [fade]);

  return (
    <View
      style={[styles.root, { backgroundColor: theme.colors.background }]}
      onLayout={() => SplashScreen.hideAsync().catch(() => {})}
    >
      <Image source={require('../../assets/splash-icon.png')} style={styles.logo} />
      <Animated.View style={[styles.caption, { opacity: fade }]}>
        <Text variant="headlineSmall" style={{ fontWeight: '700', color: theme.colors.onBackground }}>
          Sa'ad CropBook
        </Text>
        {error ? (
          <Text variant="bodySmall" style={{ color: theme.colors.error, textAlign: 'center' }}>
            {error}
          </Text>
        ) : (
          <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
            Farm records & profit
          </Text>
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  logo: { width: LOGO_SIZE, height: LOGO_SIZE },
  caption: {
    position: 'absolute',
    top: '50%',
    marginTop: 72,
    left: 24,
    right: 24,
    alignItems: 'center',
    gap: 4,
  },
});
