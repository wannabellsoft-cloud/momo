"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { atTime, dayKey } from "@/lib/date";
import { followUpTimes, notificationCopy } from "@/lib/derive";
import { isNative, onNotificationTap, rescheduleNative } from "@/lib/native";
import { playTone, registerServiceWorker, showSystemNotification } from "@/lib/notify";
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
    const { title, body } = notificationCopy(s, e.kind);
    if (document.visibilityState === "visible") {
      useUI.getState().showBanner({ title, body, kind: e.kind });
      playTone(s.settings.tone);
    } else {
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

export function ReminderEngine() {
  useNativeSchedule();
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
