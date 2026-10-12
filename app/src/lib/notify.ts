"use client";

import { BASE } from "./base";
import { isNative, nativePermission, requestNativePermission, showNativeNow } from "./native";

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

/** Accurate permission, including the iOS app (async there). */
export async function checkNotificationPermission(): Promise<Permission> {
  if (isNative()) return nativePermission().catch(() => "default" as const);
  return notificationPermission();
}

export async function requestNotificationPermission(): Promise<Permission> {
  if (isNative()) return requestNativePermission().catch(() => "default" as const);
  if (!("Notification" in window)) return "unsupported";
  try {
    return await Notification.requestPermission();
  } catch {
    return Notification.permission;
  }
}

export function registerServiceWorker() {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;
  if (process.env.NODE_ENV !== "production" || isNative()) return; // no SW in dev or inside the iOS app
  navigator.serviceWorker.register(`${BASE}/sw.js`, { scope: `${BASE}/` }).catch(() => {});
}

export async function showSystemNotification(title: string, body: string, opts: { tag: string; silent: boolean }) {
  if (isNative()) return showNativeNow(title, body).then(() => true, () => false);
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

export { playTone } from "./sound";
