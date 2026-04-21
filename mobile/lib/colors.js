/**
 * NutriSnap Design Tokens — matches the web app's neon dark theme.
 */

export const Colors = {
  // ─── Backgrounds ───
  bg:        '#08080f',
  bgCard:    'rgba(255,255,255,0.04)',
  bgCardSolid: '#111118',
  bgInput:   'rgba(255,255,255,0.06)',
  bgGlass:   'rgba(255,255,255,0.05)',
  bgOverlay: 'rgba(0,0,0,0.85)',

  // ─── Borders ───
  border:       'rgba(255,255,255,0.06)',
  borderLight:  'rgba(255,255,255,0.10)',
  borderAccent: 'rgba(0,212,255,0.25)',

  // ─── Neon Accents ───
  neonBlue:   '#00d4ff',
  neonPurple: '#a855f7',
  neonGreen:  '#22c55e',
  neonOrange: '#f97316',
  neonPink:   '#ec4899',
  neonTeal:   '#14b8a6',

  // ─── Gradients (start → end) ───
  gradientBlue:   ['#00d4ff', '#a855f7'],
  gradientOrange: ['#f97316', '#ef4444'],
  gradientGreen:  ['#22c55e', '#14b8a6'],
  gradientPink:   ['#ec4899', '#a855f7'],

  // ─── Text ───
  text:     '#ffffff',
  textSec:  '#9ca3af',   // dark-300
  textMuted:'#6b7280',   // dark-400
  textDim:  '#4b5563',   // dark-500
  textDark: '#0a0a0f',

  // ─── Semantic ───
  error:   '#ef4444',
  errorBg: 'rgba(239,68,68,0.08)',
  success: '#22c55e',
};

export const Fonts = {
  regular:  { fontWeight: '400' },
  medium:   { fontWeight: '500' },
  semibold: { fontWeight: '600' },
  bold:     { fontWeight: '700' },
  display:  { fontWeight: '800', letterSpacing: -0.3 },
};

export const Radius = {
  sm:  10,
  md:  16,
  lg:  20,
  xl:  24,
  full: 999,
};
