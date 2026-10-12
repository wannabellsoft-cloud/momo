"use client";

import { BASE } from "./base";

/* Local notifications.
   - The reminder engine (ReminderEngine.tsx) runs while Momo is open or alive in the background
     and shows notifications through the service worker so they also appear when the PWA is
     installed to the Home Screen (iOS 16.4+).
   - No push server: a fully closed app cannot be woken up. That needs Web Push (see README).
   - Dismissing or ignoring a notification never records a dose. */

export type Permission = NotificationPermission | "unsupported";

export function notificationPermission(): Permission {
  if (typeof window === "undefined" || !("Notification" in window)) return "unsupported";
  return Notification.permission;
}

export async function requestNotificationPermission(): Promise<Permission> {
  if (!("Notification" in window)) return "unsupported";
  try {
    return await Notification.requestPermission();
  } catch {
    return Notification.permission;
  }
}

export function registerServiceWorker() {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;
  if (process.env.NODE_ENV !== "production") return; // keep dev free of stale caches
  navigator.serviceWorker.register(`${BASE}/sw.js`, { scope: `${BASE}/` }).catch(() => {});
}

export async function showSystemNotification(title: string, body: string, opts: { tag: string; silent: boolean }) {
  if (notificationPermission() !== "granted") return false;
  const options: NotificationOptions = { body, tag: opts.tag, silent: opts.silent, icon: `${BASE}/icons/icon-192.png`, badge: `${BASE}/icons/badge-96.png`, data: { url: `${BASE}/` } };
  try {
    const reg = "serviceWorker" in navigator ? await navigator.serviceWorker.getRegistration() : undefined;
    if (reg) await reg.showNotification(title, options);
    else new Notification(title, options);
    return true;
  } catch {
    return false;
  }
}

/* ─── Tone: a soft two-note chime, synthesized so no audio files ship. ─── */
let ctx: AudioContext | null = null;
export function playTone(kind: "bell" | "pop" | "off") {
  if (kind === "off" || typeof window === "undefined") return;
  try {
    ctx ??= new AudioContext();
    const notes = kind === "bell" ? [1318.5, 1760] : [880];
    notes.forEach((f, i) => {
      const t = ctx!.currentTime + i * 0.12;
      const o = ctx!.createOscillator();
      const g = ctx!.createGain();
      o.type = kind === "bell" ? "sine" : "triangle";
      o.frequency.value = f;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.18, t + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, t + (kind === "bell" ? 0.6 : 0.15));
      o.connect(g).connect(ctx!.destination);
      o.start(t);
      o.stop(t + 0.7);
    });
  } catch {
    /* audio unavailable */
  }
}
