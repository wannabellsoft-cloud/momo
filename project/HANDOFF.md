# Momo — Developer Handoff

Stack: Next.js (App Router) · React · TypeScript · Tailwind · shadcn/ui · Lucide · Motion for React.
Sources: `tokens/momo-tokens.css` (CSS vars, light + dark), `tokens/momo-tokens.ts`, `tokens/tailwind.momo.ts`, `momo-kit.js` (reference mascot + icon paths), `Momo Prototype.dc.html` (behaviour reference).

---

## 1. Setup

```bash
npx create-next-app momo --ts --tailwind --app
npx shadcn@latest init        # then alias shadcn vars → Momo vars (see tailwind.momo.ts footer)
npm i lucide-react motion next-pwa
```

- `app/globals.css`: `@import "../tokens/momo-tokens.css";` then `html{background:var(--bg-app);color:var(--text-primary);font-family:var(--font-sans)}`.
- `<html lang="th" data-theme="light">`; theme toggle sets `data-theme="dark"`.
- Self-host LINE Seed Sans TH (Regular 400, ExtraBold 800) with `next/font/local`; the CDN URLs in the tokens file are for prototyping only. Fallback chain: Anuphan → IBM Plex Sans Thai → Noto Sans Thai → system.
- PWA: `manifest.json` with `display: standalone`, `theme_color #FFDCE9`, `background_color #FFF8F2`, icons from the app-icon artwork (180/192/512, maskable). iOS Web Push needs the app installed to the Home Screen (iOS 16.4+); request permission only from a user tap.
- Safe areas: `padding-bottom: calc(22px + env(safe-area-inset-bottom))` for the floating nav; `viewport-fit=cover`.

Icon mapping (momo-kit → Lucide): home→House, blister→Grid2x2 (custom pill grid recommended), calendar→Calendar, box→Package, settings→SlidersHorizontal, bell→Bell, pill→Pill, check→Check, clock→Clock, alert→TriangleAlert, info→Info, heart→Heart, pin→MapPin, undo→RotateCcw, bag→ShoppingBag, lock→Lock, wifioff→WifiOff, moon→Moon, refresh→RefreshCw. Stroke 2, `absoluteStrokeWidth`.

Mascot: ship real renders as transparent PNG/WebP per state (`idle reminder waiting taken refill nostock sleep welcome loading error`, plus `-head`). Light and dark variants share art; only the backdrop changes. In the prototype, set `window.MOMO_RENDERS = { idle: 'assets/momo-idle.png', … }` before `momo-kit.js` loads to swap the vector placeholders.

---

## 2. Data model

Medication consumption and physical tablet removal are separate records.

```ts
type LocationId = 'bedroom' | 'workspace' | string;
type Tablet = { index: number; removed: boolean; removedAt?: string; doseId?: string };   // index 0–14 = snake order
type Pack   = { id: string; label: 'A'|'B'|string; boxId: string; location: LocationId; tablets: Tablet[]; openedAt: string; archivedAt?: string };
type Dose   = { id: string; date: string /* YYYY-MM-DD local */; takenAt: string; packId?: string; tabletIndex?: number; source: 'tablet'|'backfill' };
type Schedule = { times: string[] /* ['08:00'] */; quantity: number; followUpMins: 0|15|30|60; maxFollowUps: number };
type InventoryTx = { id: string; at: string; kind: 'add_box'|'remove_box'|'open_box'; delta: number; note?: string; packIds?: string[] };
type AuditEntry  = { id: string; at: string; action: 'dose'|'remove_only'|'restore'|'undo_dose'|'move'|'backfill'; packId?: string; tabletIndex?: number; before: unknown; after: unknown };
type Settings = { privacyLockScreen: boolean; bedtimeMessage: { enabled: boolean; time: string }; callName: string; voice: 'sweet'|'plain'; tone: 'bell'|'pop'|'off'; reduceMotion: boolean; storageMode: 'separate'|'combined' };
```

Rules
- Snake order: grid position of index `i` → `row = ⌊i/5⌋`, `col = row % 2 === 0 ? i % 5 : 4 − i % 5`. Next suggested tablet = lowest `index` with `removed === false`.
- One dose per scheduled slot per day. When a dose exists for the slot, “กินเม็ดนี้แล้ว” is disabled; only “แกะออก” is allowed.
- Dismissing or ignoring a notification never creates a Dose.
- Restoring a tablet linked to today’s dose also removes that Dose (with audit). Restoring an older tablet leaves the historical Dose intact.
- Opening a box: `reserve −= 1`, create two packs (next letters), assign locations, write one `open_box` tx. Existing packs are never deleted; empty packs auto-archive and are hidden from the selector.
- Combined storage mode sets all active packs to one location; separate mode lets each pack keep its own.
- Refill: `opened = Σ unremoved tablets`. If `opened < 7` → reserve > 0 ? “prepare/open new box” : “buy/obtain more”. Supply days = `⌊(opened + reserve × 30) / dosesPerDay⌋`; warn under 14 days.
- No LOT / EXP fields.
- Storage: IndexedDB (Dexie) local-first; sync optional. All timestamps ISO with offset; “day” computed in the device time zone.

---

## 3. Component specification

All components read semantic tokens only. Touch targets ≥ 44×44. Focus: `box-shadow: var(--focus-ring)`.

| Component | Anatomy | Props | Variants / states | A11y | Tokens |
|---|---|---|---|---|---|
| MomoHeroCard | surface, status Badge, mascot (170px), SpeechBubble, decorative circle | `state`, `message`, `status` | reminder · waiting · taken · idle · nostock | mascot `aria-hidden`; message is real text | surface-soft, radius-hero |
| MomoSpeechBubble | bubble, tail (radius 6 corner) | `children`, `tail: 'left'|'right'` | default · compact | never the only carrier of critical info | surface-card, shadow-card, body 15/800 |
| MedicationCard | name, generic + dose + time, icon tile | `name`, `generic`, `qty`, `time` | default · compact | heading level 2 for name | surface-card, radius-card |
| BlisterPack | foil surface, 3 rows × BlisterTablet, row arrows, legend | `pack`, `onTabletPress` | full · mini (12px dots, in sheet) | `role="grid"`, rows `role="row"` | tablet-foil, radius-lg |
| BlisterTablet | pill dome or empty cavity, status glyph, number | `index`, `status: next|in|taken|removed` | 4 states + pressed (scale .96) + focus | `aria-label="เม็ดที่ 5 ถัดไป ยังอยู่ในแผง"`; status = shape + icon + label | tablet-*, dose-taken, dose-missed |
| PackSelector | horizontal tabs: label, location, remaining | `packs`, `value`, `onChange` | selected · default · empty (hidden) | `role="tablist"`/`tab`, `aria-selected` | action-primary, surface-info |
| DailyStatusCard | icon, status label, time | `status`, `time` | taken · pending · upcoming · missed | text label always present | dose-* |
| InventorySummaryCard | label, numeric, sub-note, progress | `opened`, `reserve`, `packs` | normal · low (butter bar) | numbers announced with unit | success-*, numeric 40/800 |
| RefillAlertCard | mascot (56px), title, body, chevron | `reserve`, `opened` | has-reserve (refill) · no-reserve (nostock) | `role="status"`; not color-only (alert icon) | refill-* |
| CalendarDay | number, status glyph, selection ring | `date`, `status`, `selected` | taken · pending · missed (dashed) · future · today | `aria-label="7 ตุลาคม ไม่มีบันทึก"` | dose-*, radius 14 |
| DoseHistoryItem | icon, status, time + pack/tablet | `dose` | taken · missed · pending · backfilled | — | dose-* |
| ReminderSettingsCard | rows: time input, stepper, segmented, switch | `schedule`, `onChange` | — | labels bound to inputs; switch `role="switch"` | surface-card |
| PrimaryButton | label (+ optional icon) | `size: lg(56)|md(48)`, `loading`, `disabled` | default · hover · pressed · focus · disabled · loading | native `<button>`, `aria-busy` when loading | action-primary*, shadow-button, button 17/800 |
| SecondaryButton | label | `tone: soft|outline|lavender` | same as primary | — | action-soft, border-default, action-secondary |
| IconButton | 44–48px circle, icon | `icon`, `label` | default · pressed · focus | `aria-label` required | surface-card, shadow-float |
| BottomNavigation | 5 items: icon pill + label | `active` | active (pink pill) · default | `<nav aria-label>`, `aria-current="page"` | shadow-float, radius 26 |
| ConfirmationBottomSheet | handle, mini blister, pack + tablet, question, radio (dose / remove-only), date, time, warning, confirm, cancel | `pack`, `tabletIndex`, `doseExists` | new · already-taken · out-of-order · detail/correction | `role="dialog" aria-modal`, focus trap, Esc/swipe closes | shadow-modal, radius-hero top |
| Toast | mini mascot, message | `message`, `mascot` | success · info | `aria-live="polite"`, 2.6s, pauses on hover/focus | shadow-float |
| Badge | icon + label pill | `tone` | taken · pending · missed · refill · neutral | — | dose-*, caption 12/800 |
| Input | label, field, helper/error | `label`, `error`, `type` | default · focus (lavender ring) · error · disabled | `aria-describedby` for helper/error | border-default, focus-ring, error-fg |
| NumberStepper | − value + | `min`, `max`, `value` | default · at-min/max (disabled side) | buttons labelled “เพิ่ม/ลด”; value `aria-live` | lavender-* |
| SegmentedControl | track + segments | `options`, `value` | selected · default | `role="radiogroup"` | bg-subtle, surface-card |
| Modal | centered card, title, body, actions | `open`, `onClose` | info · confirm | dialog semantics, focus trap | shadow-modal, overlay |
| SkeletonLoader | blocks matching layout | `variant` | card · list · calendar | `aria-busy` on region; reduced motion = static | bg-subtle |
| EmptyState | mascot in tinted circle, title, body, CTA | `kind` | no-history · no-packs · no-reserve · offline · error | heading + actionable button | radius-hero |

Responsive: designed at 393pt; content max-width 480 on tablets/desktop, centered. Cards never fix height; Dynamic Type up to 200% wraps labels.

---

## 4. Interaction specification

| Trigger | Result |
|---|---|
| Home “บันทึกว่ากินยาแล้ว” | Opens sheet for next tablet of the active pack (fallback: any pack with tablets; none → toast + link to open box) |
| Tap unremoved tablet | Sheet: choice defaults to “กินเม็ดนี้แล้ว”; if a dose exists today → choice locked to “แกะออก” + notice; if not the next in order → gentle note |
| Confirm “กินแล้ว” | Tablet removed + Dose created + audit · sheet closes (240ms) · heart bounce + toast · Home switches to taken state |
| Confirm “แกะออก” | Tablet removed, no Dose · audit · toast states it was not counted |
| Tap removed tablet | Detail sheet: “เม็ดนี้ยังอยู่ในแผง” (restore) · “แกะออกแล้ว แต่ไม่ได้กิน” (undo dose) — both audited |
| Pack tab | Switches grid; location chip cycles bedroom → workspace → bag (audited) |
| History day | Shows detail; missed day offers “กินแล้ว แต่ลืมบันทึก” (backfill, no tablet) and never suggests extra doses |
| Reserve stepper | ±1 box, inventory tx logged |
| Open new box | Requires reserve ≥ 1 · choose location per pack · creates 2 packs · navigates to Blister on the first new pack |
| Notification tap | Opens Home; app never auto-records |
| Follow-up | Fires at reminder + interval while no dose, max 2; cancelled once a dose is recorded |
| Offline | All recording works locally; chip “ออฟไลน์อยู่”; sync on reconnect |
| Save error | Keeps previous data; retry shows loading mascot, then toast |

Motion (Motion for React):
```tsx
<motion.div initial={{ y: '105%' }} animate={{ y: 0 }} exit={{ y: '105%' }} transition={{ type: 'spring', stiffness: 380, damping: 34 }} />
<motion.span animate={{ scale: [1, 1.07, 1] }} transition={{ duration: 0.45 }} />   // heart, once
const reduce = useReducedMotion() || settings.reduceMotion;  // replace loops with opacity fades ≤150ms
```

---

## 5. Notification copy

Use the variations in the Design System “Voice” section. Rotate randomly without repeating the previous one. Lock-screen body when `privacyLockScreen` is on: “แตะเพื่อเปิดโมโม่” (no drug name). Bedtime message is opt-in and never references whether a dose was taken.

## 6. Demo data

The prototype uses sample data (today = 12 Oct 2026 08:15, Pack A 5 left, Pack B 1 left, 1 reserve box, 7 Oct without a record). Label any demo build “ข้อมูลตัวอย่าง · Demo data”.
