// Momo design tokens — TypeScript source of truth. CSS variables live in momo-tokens.css.
export const palette = {
  pink: { 50: '#FFF3F7', 100: '#FFDCE9', 200: '#FFC2D7', 300: '#F9A3C1', 400: '#F47FA7', 600: '#C4466F', 700: '#A8385C', 800: '#8E2E4D' },
  cream: { 50: '#FFFCF8', 100: '#FFF8F2', 200: '#F8EEE4' },
  sky: { 100: '#E3F1FC', 300: '#B8DEFA', 700: '#2D5F86' },
  mint: { 100: '#DDF3E8', 300: '#A9E0C4', 700: '#2C7651' },
  lavender: { 100: '#E9E1FF', 300: '#C9BBF7', 600: '#7360D0', 700: '#5E4CB8' },
  butter: { 100: '#FFF0BD', 700: '#80570A' },
  rose: { 200: '#EBDDE3', 400: '#B6A3AD', 600: '#7D6571', 900: '#674454' },
  white: '#FFFFFF',
} as const;

export const color = {
  light: {
    bg: { app: palette.cream[100], subtle: palette.pink[50] },
    surface: { card: '#FFFFFF', soft: palette.pink[100], secondary: palette.lavender[100], info: palette.sky[100] },
    text: { primary: palette.rose[900], secondary: palette.rose[600], disabled: palette.rose[400], onAction: '#FFFFFF', accent: palette.pink[700] },
    border: { subtle: '#F3E4EA', default: palette.rose[200], strong: '#D7BFCA' },
    action: {
      primary: { default: palette.pink[600], hover: palette.pink[700], pressed: palette.pink[800] },
      secondary: { default: palette.lavender[600], hover: palette.lavender[700] },
      soft: { bg: palette.pink[100], fg: palette.pink[700] },
      disabled: { bg: '#F1E7EB', fg: palette.rose[400] },
    },
    status: {
      success: { bg: palette.mint[100], fg: palette.mint[700] },
      warning: { bg: palette.butter[100], fg: palette.butter[700] },
      error: { bg: '#FFE4E8', fg: '#AE3A55' },
      info: { bg: palette.sky[100], fg: palette.sky[700] },
    },
    dose: {
      taken: { bg: palette.mint[100], fg: palette.mint[700], icon: 'check' },
      pending: { bg: palette.butter[100], fg: palette.butter[700], icon: 'clock' },
      missed: { bg: palette.lavender[100], fg: palette.lavender[700], icon: 'info' },
      refill: { bg: palette.butter[100], fg: palette.butter[700], icon: 'alert' },
    },
    tablet: { foil: '#E7E2E5', pill: '#FFFFFF', next: palette.pink[400], used: '#F7F3F5' },
    focusRing: palette.lavender[600],
  },
  dark: {
    bg: { app: '#22181D', subtle: '#2A1E24' },
    surface: { card: '#33252C', soft: '#4A2B3A', secondary: '#352E4D', info: '#22364A' },
    text: { primary: '#FCEFF4', secondary: '#D3BCC7', disabled: '#8C7480', onAction: '#3A1426', accent: '#FF9DBF' },
    border: { subtle: '#3F2E37', default: '#523C47', strong: '#6B5260' },
    action: { primary: { default: '#F59AB9', hover: '#F8B0C8', pressed: '#E987A9' }, secondary: { default: '#C9BBF7', hover: '#D8CEFA' } },
    status: { success: { bg: '#1F3B2F', fg: '#A9E0C4' }, warning: { bg: '#3D321A', fg: '#FFE08A' }, error: { bg: '#44222C', fg: '#FFB3C3' }, info: { bg: '#22364A', fg: '#B8DEFA' } },
    focusRing: '#C9BBF7',
  },
} as const;

export const font = { sans: '"LINE Seed Sans TH", "Anuphan", "IBM Plex Sans Thai", "Noto Sans Thai", -apple-system, sans-serif' };
export const type = {
  display:  { size: 34, line: 44, weight: 800, tracking: -0.2 },
  headingXL:{ size: 28, line: 38, weight: 800, tracking: -0.1 },
  headingLG:{ size: 22, line: 32, weight: 800, tracking: 0 },
  headingMD:{ size: 18, line: 28, weight: 800, tracking: 0 },
  bodyLG:   { size: 17, line: 28, weight: 400, tracking: 0 },
  body:     { size: 15, line: 24, weight: 400, tracking: 0 },
  bodySM:   { size: 13, line: 20, weight: 400, tracking: 0.1 },
  caption:  { size: 12, line: 18, weight: 400, tracking: 0.2 },
  button:   { size: 17, line: 24, weight: 800, tracking: 0 },
  numeric:  { size: 40, line: 44, weight: 800, tracking: -0.5, features: 'tnum' },
} as const;

export const space = { 1: 4, 2: 8, 3: 12, 4: 16, 5: 20, 6: 24, 8: 32, 10: 40, 12: 48 } as const;
export const radius = { sm: 12, md: 16, lg: 20, card: 24, hero: 28, pill: 999 } as const;
export const shadow = {
  button: '0 4px 12px -4px rgba(196,70,111,.45)',
  card: '0 1px 2px rgba(103,68,84,.04), 0 8px 24px -12px rgba(103,68,84,.16)',
  float: '0 12px 32px -12px rgba(103,68,84,.28)',
  modal: '0 -8px 40px -12px rgba(103,68,84,.30)',
  overlay: 'rgba(62,36,48,.32)',
} as const;
export const motion = {
  duration: { fast: 150, base: 240, slow: 350, idleLoop: 3400 },
  easing: { out: [0.22, 1, 0.36, 1], soft: [0.4, 0, 0.2, 1], spring: [0.34, 1.56, 0.64, 1] },
  spring: { sheet: { type: 'spring', stiffness: 380, damping: 34 }, heart: { type: 'spring', stiffness: 500, damping: 14 } },
} as const;
export const layout = { touchMin: 44, screenPadding: 20, navHeight: 64, sheetHandle: { w: 40, h: 5 } } as const;
