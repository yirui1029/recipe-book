
import '@/global.css';

import { Platform } from 'react-native';

// Palette principale Recipe-Book
export const RecipeColors = {
  primary: '#506B5D',
  text: '#354F43',
  background: '#F8F0DF',
  surface: '#FFF9ED',
  secondary: '#A9BDAA',
  border: '#DCCFB8',
  accent: '#B77C55',
  danger: '#A84B43',
} as const;

// Thèmes utilisés par les composants Expo
export const Colors = {
  light: {
    text: RecipeColors.text,
    background: RecipeColors.background,
    backgroundElement: RecipeColors.surface,
    backgroundSelected: RecipeColors.secondary,
    textSecondary: '#718075',
    primary: RecipeColors.primary,
    border: RecipeColors.border,
  },
  dark: {
    text: '#F8F0DF',
    background: '#1D2B25',
    backgroundElement: '#2B3D33',
    backgroundSelected: '#40594A',
    textSecondary: '#B8C9B9',
    primary: '#A9BDAA',
    border: '#506B5D',
  },
} as const;

export type ThemeColor =
  keyof typeof Colors.light & keyof typeof Colors.dark;

// Polices
export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

// Espacements Expo existants
export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

// Espacements Recipe-Book
export const RecipeSpacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

// Arrondis Recipe-Book
export const RecipeRadius = {
  sm: 12,
  md: 18,
  lg: 24,
  pill: 999,
} as const;

// Constantes de mise en page
export const BottomTabInset =
  Platform.select({ ios: 50, android: 80 }) ?? 0;

export const MaxContentWidth = 800;

export const disabled = { opacity: 0.6 };
