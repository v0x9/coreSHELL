import { create } from 'zustand';

export type ThemeName = 'dark' | 'light' | 'matrix' | 'vaporwave' | 'cartoon';

interface ThemeState {
  theme: ThemeName;
  setTheme: (theme: ThemeName) => void;
  backgroundIntensity: number;
  setBackgroundIntensity: (val: number) => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  theme: 'dark',
  setTheme: (theme) => set({ theme }),
  backgroundIntensity: 1.0,
  setBackgroundIntensity: (val) => set({ backgroundIntensity: val }),
}));
