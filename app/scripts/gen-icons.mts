// Renders the PWA icons, notification art, plus the iOS app icon and launch splash when ios/ exists,
// from the 2.5D Momo master (src/components/momo/momo-character.ts). Run: npm run icons
import { chromium } from "playwright-core";
import { existsSync, mkdirSync } from "node:fs";
import { momoSvg, momoViewBox, type MascotState } from "../src/components/momo/momo-character.ts";

const OUT = new URL("../public/icons/", import.meta.url).pathname;
const IOS = new URL("../ios/App/App/Assets.xcassets/", import.meta.url).pathname;
mkdirSync(OUT, { recursive: true });

const BG = "linear-gradient(160deg, #FFE9DC 0%, #FFD3D3 55%, #F6B3C6 100%)"; // peach → pink, like the board's app icon
const art = (state: MascotState, px: number, opts: { crop?: "head"; props?: boolean; floating?: boolean; wink?: boolean } = {}) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${momoViewBox(opts.crop)}" width="${px}" height="${px}" style="display:block;overflow:visible">${momoSvg(state, "i" + state, { props: opts.props ?? false, floating: opts.floating, eyes: opts.wink ? "wink" : undefined })}</svg>`;

// [path, size, background, html]
const ICONS: [string, number, string, (size: number) => string][] = [];
// Winking Momo hugging the capsule (the board's app icon).
const appIcon = (size: number) => `<div style="margin-top:${Math.round(size * 0.07)}px">${art("reminder", Math.round(size * 0.86), { crop: "head", props: true, floating: false, wink: true })}</div>`;
for (const [f, size] of [["icon-192.png", 192], ["icon-512.png", 512], ["apple-touch-icon.png", 180], ["icon-maskable-512.png", 512]] as const) {
  ICONS.push([OUT + f, size, BG, f.includes("maskable") ? (s) => `<div style="margin-top:${Math.round(s * 0.06)}px">${art("reminder", Math.round(s * 0.8), { crop: "head", props: true, floating: false, wink: true })}</div>` : appIcon]);
}
ICONS.push([OUT + "badge-96.png", 96, "transparent", (s) => art("idle", s, { crop: "head" })]);
if (existsSync(IOS)) {
  // App Store icons must be opaque; the splash is one square image iOS crops to fit.
  ICONS.push([IOS + "AppIcon.appiconset/AppIcon-512@2x.png", 1024, BG, appIcon]);
  for (const f of ["splash-2732x2732.png", "splash-2732x2732-1.png", "splash-2732x2732-2.png"]) ICONS.push([IOS + "Splash.imageset/" + f, 2732, "#FFFAF6", (s) => art("idle", Math.round(s * 0.3))]);
}

// System notification art (Chromium shows `icon` + a large `image`; iOS shows the app icon).
const NOTIF: [string, MascotState][] = [["remind", "reminder"], ["follow", "idle"], ["bedtime", "sleeping"]];
const EXTRA: { file: string; w: number; h: number; html: string }[] = [];
for (const [kind, state] of NOTIF) {
  EXTRA.push({ file: OUT + `notif-${kind}.png`, w: 192, h: 192, html: `<div style="width:192px;height:192px;border-radius:50%;background:${BG};display:flex;align-items:center;justify-content:center;overflow:hidden">${art(state, 172, { props: true })}</div>` });
  EXTRA.push({
    file: OUT + `notif-banner-${kind}.png`, w: 720, h: 360,
    html: `<div style="position:relative;width:720px;height:360px;overflow:hidden;background:linear-gradient(135deg,#FFEDE3 0%,#FFFAF6 52%,#FFE3EA 100%);display:flex;align-items:center;justify-content:center">
      <div style="position:absolute;width:300px;height:300px;border-radius:50%;background:#FFE6D9;"></div>
      <div style="position:absolute;left:80px;top:60px;width:120px;height:44px;border-radius:24px;background:#fff;opacity:.8"></div>
      <div style="position:absolute;right:90px;top:250px;width:90px;height:34px;border-radius:24px;background:#fff;opacity:.7"></div>
      ${[[120, 230, 30], [590, 80, 26], [620, 270, 20], [170, 120, 18], [520, 190, 16]].map(([x, y, f]) => `<div style="position:absolute;left:${x}px;top:${y}px;font:800 ${f}px sans-serif;color:#FFBFC7">♥</div>`).join("")}
      <div style="position:relative">${art(state, 300, { props: true })}</div></div>`,
  });
}

const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH ?? "/opt/pw-browsers/chromium-1194/chrome-linux/chrome" });
const page = await browser.newPage();
for (const [file, size, bg, html] of ICONS) {
  await page.setViewportSize({ width: size, height: size });
  await page.setContent(`<html><body style="margin:0;width:${size}px;height:${size}px;background:${bg};display:flex;align-items:center;justify-content:center;overflow:hidden">${html(size)}</body></html>`);
  await page.screenshot({ path: file, omitBackground: bg === "transparent" });
  console.log("wrote", file.replace(new URL("..", import.meta.url).pathname, ""));
}
for (const x of EXTRA) {
  await page.setViewportSize({ width: x.w, height: x.h });
  await page.setContent(`<html><body style="margin:0;background:transparent">${x.html}</body></html>`);
  await page.waitForLoadState("networkidle");
  await page.screenshot({ path: x.file, omitBackground: true });
  console.log("wrote", x.file.replace(new URL("..", import.meta.url).pathname, ""));
}
await browser.close();
