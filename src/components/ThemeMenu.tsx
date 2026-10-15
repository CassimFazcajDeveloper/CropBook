import { useState } from 'react';
import { IconButton, Menu, useTheme } from 'react-native-paper';
import { useSettingsStore, type ThemeMode } from '../stores/settingsStore';
import { headerTint } from '../theme';

const OPTIONS: { mode: ThemeMode; label: string; icon: string }[] = [
  { mode: 'system', label: 'Follow phone', icon: 'cellphone' },
  { mode: 'light', label: 'Light', icon: 'white-balance-sunny' },
  { mode: 'dark', label: 'Dark', icon: 'weather-night' },
];

export function ThemeMenu() {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const themeMode = useSettingsStore((s) => s.themeMode);
  const setThemeMode = useSettingsStore((s) => s.setThemeMode);

  return (
    <Menu
      visible={open}
      onDismiss={() => setOpen(false)}
      anchorPosition="bottom"
      anchor={
        <IconButton
          icon="theme-light-dark"
          iconColor={headerTint(theme)}
          onPress={() => setOpen(true)}
          accessibilityLabel="Change theme"
        />
      }
    >
      {OPTIONS.map((o) => (
        <Menu.Item
          key={o.mode}
          leadingIcon={o.icon}
          trailingIcon={themeMode === o.mode ? 'check' : undefined}
          title={o.label}
          onPress={() => {
            setOpen(false);
            setThemeMode(o.mode);
          }}
        />
      ))}
    </Menu>
  );
}
