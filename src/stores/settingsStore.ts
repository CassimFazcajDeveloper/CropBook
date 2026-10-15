import { create } from 'zustand';
import { settingsRepo } from '../db/repository';

export type ThemeMode = 'system' | 'light' | 'dark';
const MODES: ThemeMode[] = ['system', 'light', 'dark'];

interface SettingsState {
  themeMode: ThemeMode;
  load: () => Promise<void>;
  setThemeMode: (mode: ThemeMode) => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  themeMode: 'system',

  async load() {
    const saved = await settingsRepo.get('themeMode');
    if (saved && (MODES as string[]).includes(saved)) set({ themeMode: saved as ThemeMode });
  },

  async setThemeMode(mode) {
    set({ themeMode: mode });
    await settingsRepo.set('themeMode', mode);
  },
}));
