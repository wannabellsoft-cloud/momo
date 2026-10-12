// Renders the PWA / Apple icons from Momo's vector art (Design System “App icon”:
// Momo's head on Pink Light, no text). Run: npm run icons
import { chromium } from "playwright-core";
import { mkdirSync } from "node:fs";
import { momoSvgMarkup, momoViewBox } from "../src/components/momo/momo-art.ts";

const OUT = new URL("../public/icons/", import.meta.url).pathname;
mkdirSync(OUT, { recursive: true });

// [file, size, background, head scale (share of the canvas the head occupies)]
const ICONS: [string, number, string, number][] = [
  ["icon-192.png", 192, "#FFDCE9", 1],
  ["icon-512.png", 512, "#FFDCE9", 1],
  ["apple-touch-icon.png", 180, "#FFDCE9", 1],
  ["icon-maskable-512.png", 512, "#FFDCE9", 0.78], // keep inside the maskable safe zone
  ["badge-96.png", 96, "transparent", 1],
];

const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH ?? "/opt/pw-browsers/chromium-1194/chrome-linux/chrome" });
const page = await browser.newPage();
for (const [file, size, bg, scale] of ICONS) {
  const head = Math.round(size * scale);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${momoViewBox("head")}" width="${head}" height="${head}">${momoSvgMarkup("idle", "head", "i")}</svg>`;
  await page.setViewportSize({ width: size, height: size });
  await page.setContent(`<html><body style="margin:0;width:${size}px;height:${size}px;background:${bg};display:flex;align-items:center;justify-content:center">${svg}</body></html>`);
  await page.screenshot({ path: OUT + file, omitBackground: bg === "transparent" });
  console.log("wrote", file);
}
await browser.close();
