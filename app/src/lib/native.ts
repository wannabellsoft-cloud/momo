"use client";

/* iOS app (Capacitor) only. In the native app, reminders are handed to iOS as scheduled local
   notifications, so they fire on time even when Momo is closed or offline. Every time doses or
   settings change we cancel and re-plan the next 14 days (iOS keeps at most 64 pending). */
import { Capacitor } from "@capacitor/core";
import { Haptics, ImpactStyle } from "@capacitor/haptics";
import { LocalNotifications } from "@capacitor/local-notifications";
import { addDays, atTime, dayKey } from "./date";
import { followUpTimes, notificationCopy } from "./derive";
import type { MomoData } from "./store";

export const isNative = () => Capacitor.isNativePlatform();

const DAYS_AHEAD = 14;
let nextId = 1;

/** Build the reminder plan: daily reminder + follow-ups for days without a dose, and the optional bedtime note. */
export function planNotifications(s: MomoData, now = new Date()) {
  const out: { id: number; title: string; body: string; at: Date; kind: string }[] = [];
  if (!s.onboarded) return out;
  const follows = followUpTimes(s).filter((t) => t > s.settings.remind);
  for (let d = 0; d < DAYS_AHEAD; d++) {
    const day = addDays(now, d);
    const taken = !!s.doses[dayKey(day)];
    const add = (kind: "remind" | "follow" | "bedtime", time: string) => {
      const at = atTime(day, time);
      if (at <= now) return;
      const { title, body } = notificationCopy(s, kind);
      out.push({ id: nextId++, title, body, at, kind });
    };
    if (!taken) {
      add("remind", s.settings.remind);
      follows.forEach((t) => add("follow", t));
    }
    if (s.settings.bedtime) add("bedtime", s.settings.bedTime);
  }
  return out;
}

export async function rescheduleNative(s: MomoData) {
  if (!isNative()) return;
  try {
    const pending = await LocalNotifications.getPending();
    if (pending.notifications.length) await LocalNotifications.cancel({ notifications: pending.notifications.map((n) => ({ id: n.id })) });
    const perm = await LocalNotifications.checkPermissions();
    if (perm.display !== "granted") return;
    const plan = planNotifications(s);
    if (!plan.length) return;
    await LocalNotifications.schedule({
      notifications: plan.map((n) => ({
        id: n.id,
        title: n.title,
        body: n.body,
        schedule: { at: n.at, allowWhileIdle: true },
        threadIdentifier: "momo",
        extra: { kind: n.kind },
      })),
    });
  } catch {
    /* plugin unavailable — nothing scheduled */
  }
}

export async function nativePermission(): Promise<NotificationPermission> {
  const p = await LocalNotifications.checkPermissions();
  return p.display === "granted" ? "granted" : p.display === "denied" ? "denied" : "default";
}

export async function requestNativePermission(): Promise<NotificationPermission> {
  const p = await LocalNotifications.requestPermissions();
  return p.display === "granted" ? "granted" : p.display === "denied" ? "denied" : "default";
}

export async function showNativeNow(title: string, body: string) {
  await LocalNotifications.schedule({ notifications: [{ id: 900000 + Math.floor(Math.random() * 99999), title, body, schedule: { at: new Date(Date.now() + 1000) } }] });
}

/** Tapping a notification opens Momo on Home. It never records a dose. */
export function onNotificationTap(cb: () => void) {
  const h = LocalNotifications.addListener("localNotificationActionPerformed", cb);
  return () => void h.then((x) => x.remove());
}

export function tapFeedback() {
  if (isNative()) void Haptics.impact({ style: ImpactStyle.Light }).catch(() => {});
}
