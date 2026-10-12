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
- Mascot and icons: `src/components/momo/` (see "Mascot" below).
- Domain rules (HANDOFF §2): `src/lib/store.ts`. Taking a dose and removing a tablet are separate records, the blister uses snake order, there is one dose per day, restore/undo are audited, and opening a box creates two packs without deleting the old ones. `src/lib/derive.ts` covers refill, supply and next-reminder logic plus Momo's notification copy.

## Reminders

`src/components/ReminderEngine.tsx` sends the daily reminder, up to 2 follow-ups (only while no dose is recorded) and the optional bedtime note. It shows them as Momo's in-app banner when the app is in front, and through the service worker (`public/sw.js`) otherwise. Dismissing or tapping a notification never records a dose.

Limitation: there is no push server, so reminders only fire while Momo is open or still alive in the background. On iPhone the app must be added to the Home Screen first (iOS 16.4+). Reliable delivery to a fully closed app needs Web Push: VAPID keys, a small server that stores the subscription and sends on a schedule, and a `push` handler in `sw.js`.

## Mascot (Momo, floppy-ear bunny)

Momo's look comes from a rendered pose sheet, `assets-src/momo-sheet.png` (a transparent PNG with 10 poses). `npm run mascot` runs `scripts/slice-mascot.py`, which needs Pillow:

- It cuts each pose into `public/mascot/<state>.webp` (440×440, each about 18 KB), plus `icon.webp` and `avatar.webp`.
- Every pose keeps the same scale and the feet sit on the same line, so Momo never changes size between states.
- It then re-renders the app icons and the notification art.

To change Momo's look, replace the sheet (same pose order: idle, squint (unused), reminder, happy, missed, sleeping, refill, loading, success, icon) and re-run.

`MomoMascot` draws the pose image plus animated SVG effects from `src/components/momo/momo-character.ts`: bell, hearts, "…" bubble, Zz and moon, "!", confetti, sparkles and loading dots. If an image fails to load, it falls back to the drawn vector Momo from the same file.

```tsx
<MomoMascot state="reminder" size="md" />   // idle · reminder · happy · missed · sleeping · refill · loading · success
<MomoMascot state="happy" px={62} animated={false} showProps={false} alt="" />
<MomoAvatar px={48} />                        // face crop, static
```

- **Sizes:** `xs` 40 · `sm` 64 · `md` 120 · `lg` 200 · `xl` 320, or `px`.
- **Accessibility:** the alt text is a Thai description of the state. Pass `alt=""` when nearby text carries the meaning.
- **Motion:** CSS only, animating `transform` and `opacity` on the whole pose and on each effect ("Momo 2.5D" block in `globals.css`). States:
  - idle: breathing
  - reminder: hugs the capsule, gentle rock, ringing bell
  - happy: hop and heartbeat
  - missed: slow sway and "…" dots
  - sleeping: slow breathing and drifting Zz
  - refill: gentle rock with a "!" badge
  - loading: float
  - success: jump with arms up and confetti
- **No wasted rendering:** motion only runs on `data-animated="true"`. The component turns it off when `animated={false}`, when Momo is offscreen (IntersectionObserver) and for avatars. "ลดการเคลื่อนไหว" and `prefers-reduced-motion` stop all of it.
- **No Rive:** there is no real Rive asset, so none is used. To move to Rive later, keep the `MomoMascot` API and swap the inner renderer.
- **Real events** (`homeMomo` in `src/lib/derive.ts`, display only):
  - dose recorded → happy (success right after tapping)
  - due → reminder
  - still no record an hour after the last follow-up → missed
  - low stock → refill
  - night with nothing pending → sleeping
  - otherwise → idle
- **Old state names:** `MomoBunny` maps the app's situation names (taken, nostock, error…) onto these states.
- **Icons:** the app icon is the winking capsule-hug pose on peach-pink. `npm run icons` renders the app icons, badge, notification images and iOS icon/splash from `public/mascot/`.
- **Limits:** a pose is one image, so ears and arms can't move on their own, and there is no blink (the squint pose doesn't line up with idle). Rigged limbs would need the art split into layers, e.g. in Rive.

## Sounds

`src/lib/sound.ts` synthesizes everything with Web Audio, so no audio files ship:
- **Notification tones:** กรุ๊งกริ๊ง, ป๊อปฟอง, ปุ๊กปิ๊ก (chosen in Momo's profile). They play with the in-app banner. System notifications use the phone's sound.
- **Tap sounds:** `SoundLayer` plays a soft tap for every button. Set `data-sound="success|toggle|back|giggle|none"` on an element to override it.
- **Greeting:** a chime, then Momo says hello using the device's Thai voice (higher pitch), once per launch. iOS only allows audio after a tap, so the greeting plays on the first tap. The page uses the "ambient" audio session, so the silent switch mutes Momo.
- **Momo's voice, same on every device:** recorded clips in `public/voice/` take priority over device text-to-speech. Generate them once on any computer with internet access:
  ```bash
  pip install edge-tts
  npm run voice        # Premwadee (Microsoft neural, female), cute pitch → public/voice/*.mp3
  git add public/voice && git commit -m "Momo voice" && git push
  ```
  Lines live in `src/lib/voice-lines.ts`. Any clip can be replaced with a real recording of the same file name. Without clips, Momo uses the best female Thai voice on the device (picker in Momo's profile).

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
