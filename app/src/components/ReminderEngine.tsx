"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { atTime, dayKey } from "@/lib/date";
import { followUpTimes, notificationCopy, systemNotificationCopy } from "@/lib/derive";
import { isNative, onNotificationTap, rescheduleNative } from "@/lib/native";
import { playTone, registerServiceWorker, showSystemNotification } from "@/lib/notify";
import { pushActive, pushTaken, syncPush } from "@/lib/push";
import { useMomo } from "@/lib/store";
import { useUI } from "@/lib/ui";

const FIRED_KEY = "momo:fired";
const LATE_WINDOW_MS = 60 * 60 * 1000; // still worth sending if we were asleep ≤ 60 min

type Ev = { key: string; kind: "remind" | "follow" | "bedtime"; at: Date };

function readFired(today: string): Set<string> {
  try {
    const v = JSON.parse(localStorage.getItem(FIRED_KEY) ?? "{}");
    return new Set(v.date === today ? v.keys : []);
  } catch {
    return new Set();
  }
}
function writeFired(today: string, keys: Set<string>) {
  try {
    localStorage.setItem(FIRED_KEY, JSON.stringify({ date: today, keys: [...keys] }));
  } catch {}
}

/** Fires today's reminder, follow-ups (max 2, only while no dose is recorded) and the optional bedtime note. */
function tick() {
  const s = useMomo.getState();
  if (!s.onboarded) return;
  const now = new Date();
  const today = dayKey(now);
  const fired = readFired(today);
  const taken = !!s.doses[today];
  const { remind, bedtime, bedTime } = s.settings;

  const events: Ev[] = [];
  if (!taken) {
    events.push({ key: `remind@${remind}`, kind: "remind", at: atTime(now, remind) });
    followUpTimes(s).forEach((t) => {
      if (t > remind) events.push({ key: `follow@${t}`, kind: "follow", at: atTime(now, t) });
    });
  }
  if (bedtime) events.push({ key: `bedtime@${bedTime}`, kind: "bedtime", at: atTime(now, bedTime) });

  const due = events.filter((e) => e.at <= now && now.getTime() - e.at.getTime() < LATE_WINDOW_MS && !fired.has(e.key));
  if (!due.length) return;
  // If several dose reminders piled up while asleep, send only the latest one.
  const doseDue = due.filter((e) => e.kind !== "bedtime").sort((a, b) => +a.at - +b.at);
  const send = [...doseDue.slice(-1), ...due.filter((e) => e.kind === "bedtime")];
  due.forEach((e) => fired.add(e.key));
  writeFired(today, fired);

  for (const e of send) {
    if (document.visibilityState === "visible") {
      const { title, body } = notificationCopy(s, e.kind);
      useUI.getState().showBanner({ title, body, kind: e.kind });
      playTone(s.settings.tone);
    } else if (!pushActive()) {
      // with Web Push on, the server sends this one (it also arrives when Momo is closed)
      const { title, body } = systemNotificationCopy(s, e.kind);
      void showSystemNotification(title, body, { tag: `momo-${e.kind}`, silent: s.settings.tone === "off", kind: e.kind });
    }
  }
}

/** iOS app: hand the next 14 days of reminders to the OS, re-planned whenever doses or settings change. */
function useNativeSchedule() {
  const router = useRouter();
  useEffect(() => {
    if (!isNative()) return;
    let t: ReturnType<typeof setTimeout> | undefined;
    const plan = () => {
      clearTimeout(t);
      t = setTimeout(() => void rescheduleNative(useMomo.getState()), 400);
    };
    plan();
    const unsub = useMomo.subscribe((s, prev) => {
      if (s.doses !== prev.doses || s.settings !== prev.settings || s.onboarded !== prev.onboarded) plan();
    });
    const offTap = onNotificationTap(() => router.push("/"));
    document.addEventListener("visibilitychange", plan); // new day / permission changed in iOS Settings
    return () => {
      clearTimeout(t);
      unsub();
      offTap();
      document.removeEventListener("visibilitychange", plan);
    };
  }, [router]);
}

/** Web Push: keep the server schedule in step with the settings, and pause it once today's dose is in. */
function useWebPush() {
  useEffect(() => {
    if (isNative()) return;
    let t: ReturnType<typeof setTimeout> | undefined;
    const resync = () => {
      clearTimeout(t);
      t = setTimeout(() => void syncPush(useMomo.getState(), { create: true }), 1200);
    };
    resync();
    const unsub = useMomo.subscribe((s, prev) => {
      const today = dayKey(new Date());
      if (!!s.doses[today] !== !!prev.doses[today]) void pushTaken(!!s.doses[today]);
      const a = s.settings, b = prev.settings;
      if (a.remind !== b.remind || a.follow !== b.follow || a.maxFollowUps !== b.maxFollowUps || a.bedtime !== b.bedtime || a.bedTime !== b.bedTime || a.privacy !== b.privacy || a.qty !== b.qty || a.voice !== b.voice || s.onboarded !== prev.onboarded) resync();
    });
    document.addEventListener("visibilitychange", resync); // new day → refresh once
    return () => {
      clearTimeout(t);
      unsub();
      document.removeEventListener("visibilitychange", resync);
    };
  }, []);
}

export function ReminderEngine() {
  useNativeSchedule();
  useWebPush();
  useEffect(() => {
    if (isNative()) return; // iOS delivers scheduled notifications itself
    registerServiceWorker();
    tick();
    const id = setInterval(tick, 15_000);
    document.addEventListener("visibilitychange", tick);
    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", tick);
    };
  }, []);
  return null;
}
