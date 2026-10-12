"use client";

import { isNative } from "./native";

/* Install-to-Home-Screen helpers.
   iOS Safari has no install prompt: we show steps (Share → Add to Home Screen).
   Chromium (Android/desktop) fires `beforeinstallprompt`; we keep it for a one-tap install button. */

type BeforeInstallPromptEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: "accepted" | "dismissed" }> };

let deferred: BeforeInstallPromptEvent | null = null;
if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferred = e as BeforeInstallPromptEvent;
  });
}

export function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return isNative() || window.matchMedia("(display-mode: standalone)").matches || (navigator as Navigator & { standalone?: boolean }).standalone === true;
}

export function isIOS(): boolean {
  if (typeof navigator === "undefined") return false;
  return /iPhone|iPad|iPod/.test(navigator.userAgent) || (navigator.userAgent.includes("Macintosh") && navigator.maxTouchPoints > 1);
}

export const canPromptInstall = () => !!deferred;

export async function promptInstall(): Promise<boolean> {
  if (!deferred) return false;
  await deferred.prompt();
  const { outcome } = await deferred.userChoice;
  deferred = null;
  return outcome === "accepted";
}

/** Show the install step: iPhone/iPad in Safari, or any browser that offers an install prompt. */
export function shouldOfferInstall(): boolean {
  return !isStandalone() && (isIOS() || canPromptInstall());
}
