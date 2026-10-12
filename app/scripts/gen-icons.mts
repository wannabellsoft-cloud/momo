// Renders the PWA icons, plus the iOS app icon and launch splash when ios/ exists, from Momo's
// vector art (Design System “App icon”: Momo's head on Pink Light, no text). Run: npm run icons
import { chromium } from "playwright-core";
import { existsSync, mkdirSync, readFileSync } from "node:fs";
import { momoSvgMarkup, momoViewBox } from "../src/components/momo/momo-art.ts";
import { MASCOT_DEFAULT_STYLE } from "../src/components/momo/mascot-manifest.ts";

const OUT = new URL("../public/icons/", import.meta.url).pathname;
const IOS = new URL("../ios/App/App/Assets.xcassets/", import.meta.url).pathname;
mkdirSync(OUT, { recursive: true });

// [path, size, background, art scale (share of the canvas the art occupies), art]
type Art = "head" | "welcome";
const ICONS: [string, number, string, number, Art?][] = [
  ["icon-192.png", 192, "#FFDCE9", 1],
  ["icon-512.png", 512, "#FFDCE9", 1],
  ["apple-touch-icon.png", 180, "#FFDCE9", 1],
  ["icon-maskable-512.png", 512, "#FFDCE9", 0.78], // keep inside the maskable safe zone
  ["badge-96.png", 96, "transparent", 1],
].map(([f, ...r]) => [OUT + f, ...r] as [string, number, string, number]);
// System notification art (Chromium shows `icon` + a large `image`; iOS shows the app icon).
// Uses the mascot renders in public/mascot/momo/ (or the vector art when MASCOT_DEFAULT_STYLE is "vector").
const MASCOT_DIR = new URL("../public/mascot/momo/", import.meta.url).pathname;
const mascotUri = (state: string) => `data:image/webp;base64,${readFileSync(MASCOT_DIR + state + ".webp").toString("base64")}`;
const NOTIF: [string, string][] = [["remind", "reminder"], ["follow", "waiting"], ["bedtime", "sleep"]];
const EXTRA: { file: string; w: number; h: number; html: string }[] = [];
for (const [kind, state] of NOTIF) {
  const vectorState = { reminder: "reminder", waiting: "waiting", sleep: "sleep" }[state] as "reminder" | "waiting" | "sleep";
  const art = (px: number) => MASCOT_DEFAULT_STYLE === "vector"
    ? `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${momoViewBox()}" width="${px}" height="${px}">${momoSvgMarkup(vectorState, undefined, "n")}</svg>`
    : `<img src="${mascotUri(state)}" width="${px}" height="${px}" style="display:block;object-fit:contain">`;
  EXTRA.push({ file: OUT + `notif-${kind}.png`, w: 192, h: 192, html: `<div style="width:192px;height:192px;border-radius:50%;background:#FFDCE9;display:flex;align-items:center;justify-content:center;overflow:hidden">${art(170)}</div>` });
  EXTRA.push({
    file: OUT + `notif-banner-${kind}.png`, w: 720, h: 360,
    html: `<div style="position:relative;width:720px;height:360px;overflow:hidden;background:linear-gradient(135deg,#FFE3EE 0%,#FFF3F7 52%,#F1EBFF 100%);display:flex;align-items:center;justify-content:center">
      <div style="position:absolute;width:300px;height:300px;border-radius:50%;background:#FFDCE9;"></div>
      <div style="position:absolute;left:80px;top:60px;width:120px;height:44px;border-radius:24px;background:#fff;opacity:.8"></div>
      <div style="position:absolute;right:90px;top:250px;width:90px;height:34px;border-radius:24px;background:#fff;opacity:.7"></div>
      ${[[120, 230, 30], [590, 80, 26], [620, 270, 20], [170, 120, 18], [520, 190, 16]].map(([x, y, f]) => `<div style="position:absolute;left:${x}px;top:${y}px;font:800 ${f}px sans-serif;color:#F9A3C1">♥</div>`).join("")}
      <div style="position:relative">${art(290)}</div></div>`,
  });
}
if (existsSync(IOS)) {
  // App Store icons must be opaque; the splash is one square image iOS crops to fit.
  ICONS.push([IOS + "AppIcon.appiconset/AppIcon-512@2x.png", 1024, "#FFDCE9", 1]);
  for (const f of ["splash-2732x2732.png", "splash-2732x2732-1.png", "splash-2732x2732-2.png"]) ICONS.push([IOS + "Splash.imageset/" + f, 2732, "#FFDCE9", 0.3, "welcome"]);
}

const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH ?? "/opt/pw-browsers/chromium-1194/chrome-linux/chrome" });
const page = await browser.newPage();
for (const [file, size, bg, scale, art = "head"] of ICONS) {
  const px = Math.round(size * scale);
  const svg = art === "head"
    ? `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${momoViewBox("head")}" width="${px}" height="${px}">${momoSvgMarkup("idle", "head", "i")}</svg>`
    : `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${momoViewBox()}" width="${px}" height="${px}">${momoSvgMarkup("welcome", undefined, "i")}</svg>`;
  await page.setViewportSize({ width: size, height: size });
  await page.setContent(`<html><body style="margin:0;width:${size}px;height:${size}px;background:${bg};display:flex;align-items:center;justify-content:center">${svg}</body></html>`);
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
