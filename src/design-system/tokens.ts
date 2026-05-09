// Design tokens — extracted from theme/index.ts and recurring patterns in app screens.
// Single source of truth for the design system. Screens can continue using theme/ directly;
// new components should import from here.

export const color = {
  // Backgrounds
  background:   '#F7F5F2',
  beige:        '#EFEBDE',
  surface:      '#FFFFFF',
  surfaceDeep:  '#111111',

  // Text
  textPrimary:   '#2D261F',
  textSecondary: '#6E675F',
  textTertiary:  '#A8A4A0',

  // Brand
  sage:     '#7A9E7E',
  sageDeep: '#5E7661',
  gold:     '#C8A46B',
  accent:   '#C84C4C',

  // Borders
  borderSoft: '#E8E3DC',

  // Utilities
  white: '#FFFFFF',
  black: '#1A1A1A',
} as const;

export const space = {
  xs:  4,
  sm:  8,
  md:  16,
  lg:  24,
  xl:  32,
  xxl: 48,
} as const;

export const radius = {
  sm:   8,
  md:   16,
  lg:   24,
  xl:   32,
  full: 999,
} as const;

export const font = {
  // Family names — require useFonts to be loaded in _layout
  bold:     'Inter_700Bold',
  semiBold: 'Inter_600SemiBold',
  regular:  'Inter_400Regular',
  light:    'Inter_300Light',

  // Scale — px values used across screens
  size: {
    xs:   10,
    sm:   13,
    md:   15,
    body: 16,
    lg:   18,
    xl:   24,
    h1:   32,
    hero: 40,
  },
} as const;

export const shadow = {
  soft: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 20,
    elevation: 8,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.10,
    shadowRadius: 30,
    elevation: 12,
  },
} as const;
