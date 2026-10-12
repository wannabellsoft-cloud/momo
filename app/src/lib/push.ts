"use client";

import { BASE } from "./base";
import { dayKey } from "./date";
import { systemNotificationCopy } from "./derive";
import { isNative } from "./native";
import type { MomoData } from "./store";

/* Web Push client: reminders that arrive even when Momo is closed (server: src/server/push.ts).
   - Needs the installed Home Screen app on iPhone (iOS 16.4+), notification permission and the
     /api/push routes (Vercel with QStash configured). Everywhere else this quietly does nothing and
     the in-app ReminderEngine keeps working as before.
   - The schedule is re-synced whenever the reminder settings change (and once a day);
     recording or undoing today's dose pauses / resumes today's reminders. */

const STATE_KEY = "momo:push"; // { endpoint, sig, day }
const api = (p: string) => `${BASE}/api/push/${p}/`;

type Saved = { endpoint: string; sig: string; day: string };
function readSaved(): Saved | null {
  try {
    return JSON.parse(localStorage.getItem(STATE_KEY) ?? "null");
  } catch {
    return null;
  }
}
function writeSaved(v: Saved | null) {
  try {
    if (v) localStorage.setItem(STATE_KEY, JSON.stringify(v));
    else localStorage.removeItem(STATE_KEY);
  } catch {}
}

/** Server reminders are set up on this device. ReminderEngine then leaves system notifications to them. */
export const pushActive = () => !!readSaved();

export function pushSupported() {
  if (typeof window === "undefined" || isNative()) return false;
  return "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;
}

function b64ToBytes(b64: string) {
  const s = atob(b64.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(b64.length / 4) * 4, "="));
  return Uint8Array.from(s, (c) => c.charCodeAt(0));
}
function bytesToB64(buf: ArrayBuffer | null) {
  if (!buf) return "";
  return btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function serverKey(): Promise<string | null> {
  try {
    const r = await fetch(api("key"), { cache: "no-store" });
    if (!r.ok) return null;
    const j = (await r.json()) as { enabled: boolean; publicKey?: string };
    return j.enabled ? (j.publicKey ?? null) : null;
  } catch {
    return null; // static host / offline
  }
}

async function subscription(publicKey: string, create: boolean) {
  const reg = await navigator.serviceWorker.ready;
  let sub = await reg.pushManager.getSubscription();
  if (sub && bytesToB64(sub.options.applicationServerKey) !== publicKey) {
    await sub.unsubscribe().catch(() => {}); // server key changed → subscribe again
    sub = null;
  }
  if (!sub && create) sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: b64ToBytes(publicKey) });
  return sub;
}

function payload(s: MomoData, sub: PushSubscription) {
  const { remind, follow, maxFollowUps, bedtime, bedTime } = s.settings;
  return {
    subscription: sub.toJSON(),
    tz: Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Bangkok",
    remind,
    follow,
    maxFollowUps,
    bedtime,
    bedTime,
    copy: { remind: systemNotificationCopy(s, "remind"), follow: systemNotificationCopy(s, "follow"), bedtime: systemNotificationCopy(s, "bedtime") },
    takenToday: !!s.doses[dayKey(new Date())],
  };
}

/** Subscribe (when `create`, e.g. from a tap) and push the current schedule to the server if it changed.
    Returns "on" when server reminders are active on this device. */
export async function syncPush(s: MomoData, opts: { create?: boolean; force?: boolean } = {}): Promise<"on" | "off" | "unavailable"> {
  if (!pushSupported() || Notification.permission !== "granted") return "unavailable";
  const key = await serverKey();
  if (!key) return "unavailable";
  try {
    const sub = await subscription(key, !!opts.create || pushActive());
    if (!sub) return "off";
    const body = payload(s, sub);
    const { takenToday, ...rest } = body;
    const sig = JSON.stringify(rest);
    const today = dayKey(new Date());
    const saved = readSaved();
    if (!opts.force && saved?.endpoint === sub.endpoint && saved.sig === sig && saved.day === today) return "on";
    const r = await fetch(api("sync"), { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...body, takenToday }) });
    if (!r.ok) return "unavailable";
    writeSaved({ endpoint: sub.endpoint, sig, day: today });
    return "on";
  } catch {
    return "unavailable";
  }
}

/** Today's dose recorded / undone → pause / resume today's server reminders. */
export async function pushTaken(taken: boolean) {
  const saved = readSaved();
  if (!saved) return;
  try {
    await fetch(api("taken"), { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ endpoint: saved.endpoint, taken }) });
  } catch {}
}

/** Send a real push through the server right now (the Settings test button). */
export async function testPush(title: string, body: string) {
  if (!pushActive()) return false;
  try {
    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.getSubscription();
    if (!sub) return false;
    const r = await fetch(api("test"), { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ subscription: sub.toJSON(), title, body }) });
    return r.ok && ((await r.json()) as { ok: boolean }).ok;
  } catch {
    return false;
  }
}

export async function disablePush() {
  const saved = readSaved();
  writeSaved(null);
  try {
    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.getSubscription();
    await sub?.unsubscribe();
    if (saved) await fetch(api("unsubscribe"), { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ endpoint: saved.endpoint }) });
  } catch {}
}
