export const colors = {
  // — Core palette —
  background: '#F7F5F2',
  backgroundSecondary: '#EFEBDE',

  surface: '#FFFFFF',
  surfaceDeep: '#111111',
  surfaceDark: '#0F0E0C',       // interaction screen dark bg

  textPrimary: '#2D261F',
  textSecondary: '#6E675F',
  textTertiary: '#A8A4A0',

  sage: '#7A9E7E',
  sageDeep: '#5E7661',

  gold: '#C8A46B',
  goldSoft: 'rgba(200, 164, 107, 0.20)',     // shared soft glow
  goldBorder: 'rgba(200, 164, 107, 0.45)',   // card borders

  accent: '#C84C4C',

  teal: '#5DCAA5',              // plans — paz theme
  coral: '#E07B5A',             // plans — coragem theme + error

  borderSoft: '#E8E3DC',

  shadow: 'rgba(0,0,0,0.06)',

  glass: 'rgba(255,255,255,0.45)',
  glassBorder: 'rgba(255,255,255,0.25)',

  // CinematicVerseCard warm gradient
  cardWarmTop: '#FDFAF4',
  cardWarmBottom: '#FAF7EF',

  // BottomNav
  navInactive: '#C2BDB8',

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

// Dark-surface overlay tokens — interaction screen, plans reflection box, etc.
export const dark = {
  bg: '#0F0E0C',
  surface: 'rgba(255,255,255,0.06)',
  surfaceActive: 'rgba(200,76,76,0.14)',
  border: 'rgba(255,255,255,0.08)',
  borderSoft: 'rgba(255,255,255,0.07)',
  backdrop: 'rgba(0,0,0,0.35)',
  text: 'rgba(255,255,255,0.88)',
  textStrong: 'rgba(255,255,255,0.92)',
  textMid: 'rgba(255,255,255,0.82)',
  textWeak: 'rgba(255,255,255,0.55)',
  textFaint: 'rgba(255,255,255,0.35)',
  textGhost: 'rgba(255,255,255,0.30)',
  sageSurface: 'rgba(122,158,126,0.08)',
  sageBorder: 'rgba(122,158,126,0.30)',
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

// Animation durations in ms — use these constants instead of raw numbers
export const animation = {
  fast: 150,       // micro interactions: scale, quick fades
  normal: 320,     // standard transitions: reply fades, opacity in
  cinematic: 700,  // entrance animations: CinematicVerseCard
  modalIn: 260,    // modal slide in
  modalOut: 220,   // modal slide out
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
  glow: {
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.28,
    shadowRadius: 22,
    elevation: 10,
  },
};
