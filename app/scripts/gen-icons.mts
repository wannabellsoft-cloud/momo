// Renders the PWA icons, notification art, plus the iOS app icon and launch splash when ios/ exists,
// from Momo's rendered poses in public/mascot/ (run `npm run mascot` first). Run: npm run icons
import { chromium } from "playwright-core";
import { existsSync, mkdirSync, readFileSync } from "node:fs";
import type { MascotState } from "../src/components/momo/momo-character.ts";

const OUT = new URL("../public/icons/", import.meta.url).pathname;
const IOS = new URL("../ios/App/App/Assets.xcassets/", import.meta.url).pathname;
mkdirSync(OUT, { recursive: true });

const BG = "linear-gradient(160deg, #FFE9DC 0%, #FFD3D3 55%, #F6B3C6 100%)"; // peach → pink, like the board's app icon
const MASCOT = new URL("../public/mascot/", import.meta.url).pathname;
type Pose = MascotState | "icon";
const uri = (pose: Pose) => `data:image/webp;base64,${readFileSync(MASCOT + pose + ".webp").toString("base64")}`;
const art = (pose: Pose, px: number) => `<img src="${uri(pose)}" width="${px}" height="${px}" style="display:block">`;

// [path, size, background, html]
const ICONS: [string, number, string, (size: number) => string][] = [];
// "Momo" on top, Momo's face (idle pose) filling the lower part, like the profile picture.
// `inset` shrinks everything into the centre (maskable icons keep content inside the safe zone).
const FONT = `data:font/woff2;base64,${readFileSync(new URL("../src/fonts/anuphan-latin-700-normal.woff2", import.meta.url)).toString("base64")}`;
const appIcon = (size: number, inset = 1) => {
  const S = size * inset;
  const img = S * 1.6; // idle.webp: character is 368 of 440 px wide → character ≈ 1.34 S (ears and body cropped, like the profile picture)
  return `<style>@font-face{font-family:A;src:url(${FONT}) format("woff2");font-weight:700}</style>
    <div style="position:relative;width:${S}px;height:${S}px;overflow:${inset < 1 ? "visible" : "hidden"}">
      <div style="position:absolute;left:0;right:0;top:${S * 0.045}px;text-align:center;font:700 ${S * 0.2}px/1 A;letter-spacing:-.01em;color:#7A3B4E;text-shadow:0 ${S * 0.008}px 0 rgba(255,255,255,.7)">Momo</div>
      <img src="${uri("idle")}" style="position:absolute;width:${img}px;height:${img}px;left:${(S - img) / 2}px;top:${S * 0.25 - img * (131 / 440)}px">
    </div>`;
};
for (const [f, size] of [["icon-192.png", 192], ["icon-512.png", 512], ["apple-touch-icon.png", 180], ["icon-maskable-512.png", 512]] as const) {
  ICONS.push([OUT + f, size, BG, f.includes("maskable") ? (s) => appIcon(s, 0.8) : (s) => appIcon(s)]);
}
ICONS.push([OUT + "badge-96.png", 96, "transparent", (s) => art("idle", s)]);
if (existsSync(IOS)) {
  // App Store icons must be opaque; the splash is one square image iOS crops to fit.
  ICONS.push([IOS + "AppIcon.appiconset/AppIcon-512@2x.png", 1024, BG, (s) => appIcon(s)]);
  for (const f of ["splash-2732x2732.png", "splash-2732x2732-1.png", "splash-2732x2732-2.png"]) ICONS.push([IOS + "Splash.imageset/" + f, 2732, "#FFFAF6", (s) => art("idle", Math.round(s * 0.3))]);
}

// System notification art (Chromium shows `icon` + a large `image`; iOS shows the app icon).
const NOTIF: [string, MascotState][] = [["remind", "reminder"], ["follow", "idle"], ["bedtime", "sleeping"]];
const EXTRA: { file: string; w: number; h: number; html: string }[] = [];
for (const [kind, state] of NOTIF) {
  EXTRA.push({ file: OUT + `notif-${kind}.png`, w: 192, h: 192, html: `<div style="width:192px;height:192px;border-radius:50%;background:${BG};display:flex;align-items:center;justify-content:center;overflow:hidden">${art(state, 172)}</div>` });
  EXTRA.push({
    file: OUT + `notif-banner-${kind}.png`, w: 720, h: 360,
    html: `<div style="position:relative;width:720px;height:360px;overflow:hidden;background:linear-gradient(135deg,#FFEDE3 0%,#FFFAF6 52%,#FFE3EA 100%);display:flex;align-items:center;justify-content:center">
      <div style="position:absolute;width:300px;height:300px;border-radius:50%;background:#FFE6D9;"></div>
      <div style="position:absolute;left:80px;top:60px;width:120px;height:44px;border-radius:24px;background:#fff;opacity:.8"></div>
      <div style="position:absolute;right:90px;top:250px;width:90px;height:34px;border-radius:24px;background:#fff;opacity:.7"></div>
      ${[[120, 230, 30], [590, 80, 26], [620, 270, 20], [170, 120, 18], [520, 190, 16]].map(([x, y, f]) => `<div style="position:absolute;left:${x}px;top:${y}px;font:800 ${f}px sans-serif;color:#FFBFC7">♥</div>`).join("")}
      <div style="position:relative">${art(state, 300)}</div></div>`,
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
