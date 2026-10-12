// Renders the PWA icons, plus the iOS app icon and launch splash when ios/ exists, from Momo's
// vector art (Design System “App icon”: Momo's head on Pink Light, no text). Run: npm run icons
import { chromium } from "playwright-core";
import { existsSync, mkdirSync } from "node:fs";
import { momoSvgMarkup, momoViewBox } from "../src/components/momo/momo-art.ts";

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
await browser.close();
