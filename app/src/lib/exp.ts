import { addDays, dayKey } from "./date";
import type { Dose, MomoData } from "./store";

/* Momo's EXP & level — a reward layer computed from the dose history (never stored, so it can't drift
   and never touches medication or stock records).

   Per recorded day:
     +10  recorded at all                     (+5 only when back-filled without a time)
     +10  on time  (within 30 min of the reminder) · +5 close (within 90 min)
     +2 × streak   for each consecutive day before it, capped at +10
   No points are taken away for a missed day; the streak just restarts and Momo sulks a little. */

export const EXP_RULES = { base: 10, backfill: 5, onTime: 10, close: 5, onTimeMin: 30, closeMin: 90, streakStep: 2, streakMax: 10 } as const;

export type DoseExp = { total: number; base: number; timing: number; streak: number; onTime: "on-time" | "close" | "late" | "unknown" };

const toMin = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};

function scoreDose(d: Dose, remind: string, streakBefore: number): DoseExp {
  const R = EXP_RULES;
  if (!d.time) return { total: R.backfill, base: R.backfill, timing: 0, streak: 0, onTime: "unknown" };
  const diff = Math.abs(toMin(d.time) - toMin(remind));
  const onTime = diff <= R.onTimeMin ? "on-time" : diff <= R.closeMin ? "close" : "late";
  const timing = onTime === "on-time" ? R.onTime : onTime === "close" ? R.close : 0;
  const streak = Math.min(streakBefore * R.streakStep, R.streakMax);
  return { total: R.base + timing + streak, base: R.base, timing, streak, onTime };
}

/** Cumulative EXP needed to reach level n (n ≥ 1): 0, 50, 150, 300, 500, 750… */
export const expForLevel = (n: number) => 25 * n * (n - 1);

export type Tier = { from: number; name: string; badge: "sprout" | "star" | "sparkles" };
export const TIERS: Tier[] = [
  { from: 1, name: "ต้นอ่อนน้อย", badge: "sprout" },
  { from: 5, name: "ดาวดวงน้อย", badge: "star" },
  { from: 10, name: "เพื่อนซี้โมโม่", badge: "sparkles" },
];

export type Mood = "happy" | "ok" | "sulky";

export function momoExp(s: MomoData, now: Date) {
  const remind = s.settings.remind;
  const days = Object.keys(s.doses).sort();
  let exp = 0;
  let run = 0;
  let prev: string | null = null;
  const perDay: Record<string, DoseExp> = {};
  for (const k of days) {
    run = prev && dayKey(addDays(new Date(prev + "T12:00:00"), 1)) === k ? run + 1 : 0;
    const sc = scoreDose(s.doses[k], remind, run);
    perDay[k] = sc;
    exp += sc.total;
    prev = k;
  }

  let level = 1;
  while (exp >= expForLevel(level + 1)) level++;
  const floor = expForLevel(level), next = expForLevel(level + 1);
  const tier = [...TIERS].reverse().find((t) => level >= t.from) ?? TIERS[0];

  // current streak: consecutive recorded days ending today (or yesterday, while today is still open)
  const today = dayKey(now);
  const yesterday = dayKey(addDays(now, -1));
  let streak = 0;
  for (let d = s.doses[today] ? now : addDays(now, -1); s.doses[dayKey(d)]; d = addDays(d, -1)) streak++;

  // Momo's mood: sulks after a forgotten day until today's dose is in; beams on a streak.
  const missedYesterday = yesterday >= s.trackingSince && !s.doses[yesterday] && days.length > 0;
  const mood: Mood = s.doses[today] ? (streak >= 3 ? "happy" : "ok") : missedYesterday ? "sulky" : "ok";

  return {
    exp,
    level,
    tier,
    inLevel: exp - floor,
    toNext: next - floor,
    progress: (exp - floor) / (next - floor),
    streak,
    mood,
    missedYesterday,
    today: perDay[today] ?? null,
  };
}
