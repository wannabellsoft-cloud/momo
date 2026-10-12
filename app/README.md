# Momo 🐰 — app

The production PWA built from the Claude Design handoff in `../project` (the prototype is `Momo Prototype.dc.html`, the specs are in `HANDOFF.md`). Momo is a local-first medication companion for Praewa. All data stays on the device.

Stack: Next.js 16 (App Router, static export) · React 19 · TypeScript · Tailwind CSS v4 · zustand (persisted to `localStorage`).

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # static site in out/ (deploy to any static host)
npm run lint && npm run typecheck
npm run icons      # re-render public/icons/* from the mascot art (uses Playwright Chromium)
```

## Deploy / test on a phone

Service workers and notifications need HTTPS, so test on a real device from a deployed URL.

- **GitHub Pages:** `.github/workflows/deploy-pages.yml` builds `app/` on every push to `main` and publishes it. Turn it on once under repo **Settings → Pages → Source: GitHub Actions**. Project repos are served at `https://<user>.github.io/<repo>/` (the workflow sets `NEXT_PUBLIC_BASE_PATH` for you). A `<user>.github.io` repo is served at the root.
- **Vercel / Netlify / Cloudflare Pages:** root directory `app`, build command `npm run build`, output directory `out`.

On iPhone: open the URL in Safari → Share → **Add to Home Screen** → open Momo from the icon → Settings → **อนุญาต** notifications.

## Map from design to code

| Design screen | Code |
|---|---|
| 01 Splash · 02 Onboarding | `src/components/Welcome.tsx` (shown until onboarding is finished; the last step can load demo data) |
| 03 Home | `src/app/page.tsx` |
| 04 Interactive blister | `src/app/blister/page.tsx` |
| 05 Dose confirmation | `src/components/DoseSheet.tsx` (global bottom sheet) |
| 06 History | `src/app/history/page.tsx` |
| 07 Inventory · 08 Open new box | `src/app/inventory/page.tsx`, `src/app/inventory/open-box/page.tsx` |
| 09 Reminder settings · 10 Momo profile | `src/app/settings/page.tsx`, `src/app/settings/profile/page.tsx` |
| 11 Empty states | `src/components/EmptyState.tsx`, used in context (no packs, no history, no reserve) |
| 12 Error · offline | `src/components/SaveError.tsx` (failed save + retry), offline chip on Home |

- Tokens: `src/app/globals.css` holds `project/tokens/momo-tokens.css` (light and dark) plus a few app tokens for values the prototype used without a name. Components use them through Tailwind's `bg-(--token)` syntax, so dark mode works everywhere.
- Mascot and icons: `src/components/momo/` is a 1:1 port of `momo-kit.js`. To use real plush renders, add PNGs to `public/momo/` and list them in `MOMO_RENDERS` in `MomoBunny.tsx`.
- Domain rules (HANDOFF §2): `src/lib/store.ts`. Taking a dose and removing a tablet are separate records, the blister uses snake order, there is one dose per day, restore/undo are audited, and opening a box creates two packs without deleting the old ones. `src/lib/derive.ts` covers refill, supply and next-reminder logic plus Momo's notification copy.

## Reminders

`src/components/ReminderEngine.tsx` sends the daily reminder, up to 2 follow-ups (only while no dose is recorded) and the optional bedtime note. It shows them as Momo's in-app banner when the app is in front, and through the service worker (`public/sw.js`) otherwise. Dismissing or tapping a notification never records a dose.

Limitation: there is no push server, so reminders only fire while Momo is open or still alive in the background. On iPhone the app must be added to the Home Screen first (iOS 16.4+). Reliable delivery to a fully closed app needs Web Push: VAPID keys, a small server that stores the subscription and sends on a schedule, and a `push` handler in `sw.js`.

## Sounds

`src/lib/sound.ts` synthesizes everything with Web Audio, so no audio files ship:
- **Notification tones:** กรุ๊งกริ๊ง, ป๊อปฟอง, ปุ๊กปิ๊ก (chosen in Momo's profile). They play with the in-app banner. System notifications use the phone's sound.
- **Tap sounds:** `SoundLayer` plays a soft tap for every button. Set `data-sound="success|toggle|back|giggle|none"` on an element to override it.
- **Greeting:** a chime, then Momo says hello using the device's Thai voice (higher pitch), once per launch. iOS only allows audio after a tap, so the greeting plays on the first tap. The page uses the "ambient" audio session, so the silent switch mutes Momo.

## iOS app (Capacitor, paused)

`capacitor.config.ts` and `ios/` hold an iOS shell around the same static build. In the app, reminders are scheduled with iOS for the next 14 days (`src/lib/native.ts`), so they fire even when Momo is closed. Building it needs a Mac with Xcode and an Apple Developer account:

```bash
npm run ios:sync   # next build + copy into ios/
npm run ios:open   # open in Xcode → set Team → Run / Archive
```

## Fonts

The design's typeface is **LINE Seed Sans TH**. This repo does not include it. The only copy reachable from this environment was an unofficial npm repackage whose embedded licence points to a Dalton Maag EULA. Until the official files are added, the app uses **Anuphan** (OFL, self-hosted in `src/fonts/`), the design's first fallback. To switch, download LINE Seed Sans TH from seed.line.me, put the Regular and ExtraBold `.woff2` files in `src/fonts/`, and add `url("../fonts/…")` sources to the two `LINE Seed Sans TH` `@font-face` rules at the top of `globals.css`.

## Not done yet

- Storage is `localStorage` rather than IndexedDB/Dexie as HANDOFF suggests. The data is small, and the store's `persist` storage can be swapped in one place.
- One reminder time per day. The data model allows more, but the UI and the one-dose-per-day rule assume one.
