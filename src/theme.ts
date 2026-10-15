import { MD3DarkTheme, MD3LightTheme, type MD3Theme } from 'react-native-paper';

const roundness = 4;

export const lightTheme: MD3Theme = {
  ...MD3LightTheme,
  roundness,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#3B6B35',
    onPrimary: '#FFFFFF',
    primaryContainer: '#BCF0AE',
    onPrimaryContainer: '#002201',
    secondary: '#7A5A3A',
    onSecondary: '#FFFFFF',
    secondaryContainer: '#F5DDC2',
    onSecondaryContainer: '#2C1700',
    tertiary: '#38656A',
    tertiaryContainer: '#BCEBF0',
    onTertiaryContainer: '#002023',
    error: '#BA1A1A',
    background: '#F8FAF2',
    onBackground: '#1A1C18',
    surface: '#F8FAF2',
    onSurface: '#1A1C18',
    surfaceVariant: '#DFE4D7',
    onSurfaceVariant: '#43483F',
    outline: '#73796E',
    outlineVariant: '#C3C8BC',
    elevation: {
      level0: 'transparent',
      level1: '#EEF3E6',
      level2: '#E8EFE0',
      level3: '#E2EADA',
      level4: '#E0E9D8',
      level5: '#DCE6D3',
    },
  },
};

export const darkTheme: MD3Theme = {
  ...MD3DarkTheme,
  roundness,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#A1D494',
    onPrimary: '#0A390B',
    primaryContainer: '#235020',
    onPrimaryContainer: '#BCF0AE',
    secondary: '#E3C1A0',
    onSecondary: '#422B11',
    secondaryContainer: '#5B4126',
    onSecondaryContainer: '#FFDDBE',
    tertiary: '#A0CFD4',
    tertiaryContainer: '#1F4D52',
    onTertiaryContainer: '#BCEBF0',
    error: '#FFB4AB',
    background: '#121410',
    onBackground: '#E2E3DC',
    surface: '#121410',
    onSurface: '#E2E3DC',
    surfaceVariant: '#43483F',
    onSurfaceVariant: '#C3C8BC',
    outline: '#8D9387',
    outlineVariant: '#43483F',
    elevation: {
      level0: 'transparent',
      level1: '#1A1E17',
      level2: '#1F241B',
      level3: '#24291F',
      level4: '#252B20',
      level5: '#292F23',
    },
  },
};

export const headerBg = (theme: MD3Theme) => (theme.dark ? theme.colors.primaryContainer : theme.colors.primary);
export const headerTint = (theme: MD3Theme) => (theme.dark ? theme.colors.onPrimaryContainer : theme.colors.onPrimary);

export const cardBg = (theme: MD3Theme) => (theme.dark ? '#2B4D27' : '#C5E5B8');

export const positive = (theme: MD3Theme) => (theme.dark ? '#8FD685' : '#2E7D32');
export const negative = (theme: MD3Theme) => theme.colors.error;
