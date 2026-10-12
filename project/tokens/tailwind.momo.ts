// Tailwind preset mapping semantic CSS variables (momo-tokens.css) → utilities. Pair with shadcn/ui by aliasing its vars below.
import type { Config } from 'tailwindcss';
const v = (n: string) => `var(--${n})`;
export default {
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      fontFamily: { sans: v('font-sans').split(',') },
      colors: {
        bg: { app: v('bg-app'), subtle: v('bg-subtle') },
        surface: { card: v('surface-card'), soft: v('surface-soft'), secondary: v('surface-secondary'), info: v('surface-info') },
        ink: { DEFAULT: v('text-primary'), muted: v('text-secondary'), disabled: v('text-disabled'), accent: v('text-accent') },
        line: { subtle: v('border-subtle'), DEFAULT: v('border-default'), strong: v('border-strong') },
        action: { DEFAULT: v('action-primary'), hover: v('action-primary-hover'), pressed: v('action-primary-pressed'), secondary: v('action-secondary'), soft: v('action-soft') },
        success: { bg: v('success-bg'), fg: v('success-fg') }, warning: { bg: v('warning-bg'), fg: v('warning-fg') },
        error: { bg: v('error-bg'), fg: v('error-fg') }, info: { bg: v('info-bg'), fg: v('info-fg') },
        dose: { taken: v('dose-taken-bg'), pending: v('dose-pending-bg'), missed: v('dose-missed-bg') },
      },
      fontSize: {
        display: ['34px', { lineHeight: '44px', fontWeight: '800' }], 'h-xl': ['28px', { lineHeight: '38px', fontWeight: '800' }],
        'h-lg': ['22px', { lineHeight: '32px', fontWeight: '800' }], 'h-md': ['18px', { lineHeight: '28px', fontWeight: '800' }],
        'body-lg': ['17px', '28px'], body: ['15px', '24px'], 'body-sm': ['13px', '20px'], caption: ['12px', '18px'],
        button: ['17px', { lineHeight: '24px', fontWeight: '800' }], numeric: ['40px', { lineHeight: '44px', fontWeight: '800' }],
      },
      borderRadius: { sm: '12px', md: '16px', lg: '20px', card: '24px', hero: '28px', pill: '999px' },
      boxShadow: { button: v('shadow-button'), card: v('shadow-card'), float: v('shadow-float'), modal: v('shadow-modal') },
      transitionDuration: { fast: '150ms', base: '240ms', slow: '350ms' },
      transitionTimingFunction: { out: 'cubic-bezier(.22,1,.36,1)', spring: 'cubic-bezier(.34,1.56,.64,1)' },
      spacing: { safe: 'env(safe-area-inset-bottom)' },
    },
  },
} satisfies Partial<Config>;

/* shadcn/ui alias (globals.css):
:root{ --background:var(--bg-app); --foreground:var(--text-primary); --card:var(--surface-card); --primary:var(--action-primary);
  --primary-foreground:var(--text-on-action); --secondary:var(--surface-secondary); --muted:var(--bg-subtle); --muted-foreground:var(--text-secondary);
  --border:var(--border-default); --ring:var(--action-secondary); --radius:24px; }
   Note: shadcn expects HSL channels by default — use the v4 "color" format or wrap with hsl() accordingly. */
