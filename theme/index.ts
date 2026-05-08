export const colors = {
  // — Core palette —
  background: '#F7F5F2',
  backgroundSecondary: '#EFEBDE',

  surface: '#FFFFFF',
  surfaceDeep: '#111111',

  textPrimary: '#2D261F',
  textSecondary: '#6E675F',
  textTertiary: '#A8A4A0',

  sage: '#7A9E7E',
  sageDeep: '#5E7661',

  gold: '#C8A46B',
  accent: '#C84C4C',

  borderSoft: '#E8E3DC',

  shadow: 'rgba(0,0,0,0.06)',

  glass: 'rgba(255,255,255,0.45)',
  glassBorder: 'rgba(255,255,255,0.25)',

  white: '#FFFFFF',
  black: '#1A1A1A',

  // — Legacy aliases — backward compat with existing screens —
  blackSoft: '#1A1A1A',
  grayOrganic: '#A8A4A0',
  redAccent: '#C84C4C',
  beige: '#EFEBDE',
  text: '#1A1A1A',
  card: '#FFFFFF',
  gray: '#A8A4A0',
  softGray: '#E8E3DC',
  shadowSoft: 'rgba(0,0,0,0.04)',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const radius = {
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  full: 999,
};

export const typography = {
  hero: {
    fontSize: 42,
    lineHeight: 50,
    fontWeight: '700' as const,
  },
  h1: {
    fontSize: 32,
    lineHeight: 38,
    fontWeight: '700' as const,
  },
  h2: {
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '600' as const,
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400' as const,
  },
  caption: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500' as const,
  },
};

export const shadows = {
  soft: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
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
};
