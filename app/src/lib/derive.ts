import { addMin, atTime, dayKey, isNight } from "./date";
import { LOW_THRESHOLD, SUPPLY_WARN_DAYS, TABLETS_PER_BOX, left, type MomoData } from "./store";
import type { MomoState } from "@/components/momo/MomoBunny";

export type DayStatus = "taken" | "pending" | "upcoming" | "missed" | "future" | "untracked";

/** Follow-up times (HH:mm) for today, while no dose is recorded. */
export function followUpTimes(s: MomoData): string[] {
  const { follow, maxFollowUps, remind } = s.settings;
  if (!follow) return [];
  return Array.from({ length: maxFollowUps }, (_, k) => addMin(remind, follow * (k + 1)));
}

export function dayStatus(s: MomoData, key: string, now: Date): DayStatus {
  const today = dayKey(now);
  if (key > today) return "future";
  if (s.doses[key]) return "taken";
  if (key === today) return now >= atTime(now, s.settings.remind) ? "pending" : "upcoming";
  if (key < s.trackingSince) return "untracked";
  return "missed";
}

export function derive(s: MomoData, now: Date) {
  const today = dayKey(now);
  const todayDose = s.doses[today];
  const status = dayStatus(s, today, now);
  const pending = status === "pending";
  const sweet = s.settings.voice === "sweet";
  const call = s.settings.call;

  const opened = s.packs.reduce((a, p) => a + left(p), 0);
  const low = opened < LOW_THRESHOLD;
  const noStock = low && s.reserve === 0;
  const perDay = Math.max(1, s.settings.qty);
  const supplyDays = Math.floor((opened + s.reserve * TABLETS_PER_BOX) / perDay);
  const openedDays = Math.floor(opened / perDay);
  const supplyLow = supplyDays < SUPPLY_WARN_DAYS;

  // Momo's mood follows real events (display only — never changes dose or stock records).
  // "Missed": still no record an hour after the last reminder of the day.
  const lastCallMin = (s.settings.follow ? s.settings.follow * s.settings.maxFollowUps : 0) + 60;
  const missedNow = pending && now.getTime() >= atTime(now, s.settings.remind).getTime() + lastCallMin * 60_000;
  const night = isNight(now);
  const homeMomo: MomoState =
    noStock && !todayDose ? "nostock"
    : todayDose ? "taken"
    : missedNow ? "missed"
    : pending ? "reminder"
    : low || supplyLow ? "refill"
    : night ? "sleep"
    : "idle";
  const bubble =
    homeMomo === "taken" ? (sweet ? `เย้ วันนี้${call}ดูแลตัวเองแล้ว ♡` : "วันนี้บันทึกเรียบร้อยแล้ว")
    : homeMomo === "missed" ? (sweet ? `วันนี้ยังไม่มีบันทึกนะ โมโม่เป็นห่วงน้า ♡` : "วันนี้ยังไม่มีบันทึกการกินยา")
    : homeMomo === "reminder" ? (sweet ? `${call}า ได้เวลากินยาแล้วน้า ♡` : `ถึงเวลากินยาแล้ว ${call}`)
    : homeMomo === "nostock" ? (pending ? "ได้เวลากินยาแล้วน้า แล้วยาก็ใกล้หมดด้วยนะ" : "ยาใกล้หมดแล้วน้า โมโม่ช่วยเตือนให้เตรียมเพิ่มนะ")
    : homeMomo === "refill" ? (sweet ? "ยาเหลือน้อยแล้วน้า โมโม่จดโน้ตไว้ให้แล้ว ✎" : "ยาเหลือน้อย เตรียมเพิ่มได้เลย")
    : homeMomo === "sleep" ? (sweet ? `ฝันดีน้า${call} โมโม่จะเตือนตอน ${s.settings.remind} น. ☾` : `เตือนครั้งถัดไป ${s.settings.remind} น.`)
    : sweet ? `โมโม่อยู่ตรงนี้นะ เจอกันตอน ${s.settings.remind} น้า` : `เตือนครั้งถัดไป ${s.settings.remind} น.`;

  // Next reminder: today's reminder, else the next follow-up still ahead, else tomorrow.
  let nextReminder: string;
  if (todayDose) nextReminder = `พรุ่งนี้ ${s.settings.remind} น.`;
  else if (!pending) nextReminder = `วันนี้ ${s.settings.remind} น.`;
  else if (!s.settings.follow) nextReminder = "ปิดการเตือนซ้ำอยู่";
  else {
    const nf = followUpTimes(s).find((t) => atTime(now, t) > now);
    nextReminder = nf ? `เตือนซ้ำ ${nf} น.` : `พรุ่งนี้ ${s.settings.remind} น.`;
  }

  const refillTitle = s.reserve > 0 ? "ยาในแผงเหลือน้อยแล้ว" : "ยาใกล้หมด และไม่มีกล่องสำรอง";
  const refillBody = s.reserve > 0 ? `เหลือ ${opened} เม็ด · เตรียมเปิดกล่องใหม่ได้เลยนะ` : `เหลือ ${opened} เม็ด · ไปซื้อหรือรับยาเพิ่มเร็ว ๆ นี้นะ`;

  return { today, todayDose, status, pending, sweet, call, opened, low, noStock, supplyDays, openedDays, supplyLow, homeMomo, bubble, nextReminder, refillTitle, refillBody };
}

/* ─── Momo's voice (Design System “Voice”). Rotate without repeating the last line. ─── */
export const VOICE = {
  reminder: (call: string) => [`${call}า ได้เวลากินยาแล้วน้า 🐰💕`, `ติ๊กต็อก ๆ ได้เวลาแล้วนะ${call}`, "โมโม่มาเตือนแล้วน้า ถึงเวลาดูแลตัวเองแล้ว ♡", `${call}จ๋า ได้เวลาแล้วนะ โมโม่รออยู่ตรงนี้`],
  follow: () => ["โมโม่แวะมาถามนิดนึง กินยาไปหรือยังเอ่ย?", "ถ้ากินแล้ว กดบอกโมโม่หน่อยน้า", "โมโม่ยังรออยู่นะ ไม่รีบ ๆ", "ถ้ากินไปแล้ว แตะบันทึกได้เลยนะ"],
  taken: (call: string) => [`เย้ วันนี้${call}ดูแลตัวเองแล้ว ♡`, "เก่งมากเลย โมโม่จดไว้ให้แล้วนะ", "บันทึกแล้วน้า วันนี้เรียบร้อย ♡", "โมโม่ดีใจด้วยน้า"],
  bedtime: () => ["พักผ่อนเยอะ ๆ นะ ฝันดีน้า 🌙", "วันนี้เหนื่อยแล้ว นอนหลับฝันดีนะ", "โมโม่ไปนอนก่อนน้า เจอกันพรุ่งนี้ ♡"],
} as const;

const lastPick: Record<string, number> = {};
export function pickLine(kind: keyof typeof VOICE, call: string): string {
  const lines = VOICE[kind](call);
  let i = Math.floor(Math.random() * lines.length);
  if (lines.length > 1 && i === lastPick[kind]) i = (i + 1) % lines.length;
  lastPick[kind] = i;
  return lines[i];
}

/** Notification title/body for a reminder kind, honouring voice + lock-screen privacy. */
export function notificationCopy(s: MomoData, kind: "remind" | "follow" | "bedtime", rotate = true) {
  const { call, voice, privacy, qty } = s.settings;
  const sweet = voice === "sweet";
  const title =
    kind === "bedtime" ? (rotate ? pickLine("bedtime", call) : VOICE.bedtime()[0])
    : kind === "follow" ? (rotate ? pickLine("follow", call) : VOICE.follow()[0])
    : sweet ? (rotate ? pickLine("reminder", call) : `${call}า ได้เวลากินยาแล้วน้า 🐰`)
    : `ถึงเวลากินยาแล้ว ${call}`;
  const body = kind === "bedtime" ? "ราตรีสวัสดิ์จากโมโม่" : privacy ? "แตะเพื่อเปิดโมโม่" : `Pristiq 50 mg · ${qty} เม็ด`;
  return { title, body };
}

/** System (OS) notification: the OS draws the card, so we make the content fuller —
    title "Momo", then Momo's line, a detail line, and the tap hint (as in the design):
      Momo
      แพรวาา ได้เวลากินยาแล้วน้า 🐰💕
      ถึงเวลาดูแลตัวเองแล้ว · 08:00 น.
      แตะเพื่อเปิดโมโม่
    The drug name only appears when lock-screen privacy is off. */
export function systemNotificationCopy(s: MomoData, kind: "remind" | "follow" | "bedtime") {
  const { privacy, qty, remind } = s.settings;
  const { title: line } = notificationCopy(s, kind);
  const detail =
    kind === "bedtime" ? "ราตรีสวัสดิ์จากโมโม่ 🌙"
    : kind === "follow" ? (privacy ? "ถ้าดูแลตัวเองแล้ว กดบันทึกให้โมโม่หน่อยน้า" : `Pristiq 50 mg · ${qty} เม็ด · ถ้ากินแล้วกดบันทึกได้เลย`)
    : privacy ? `เตือนประจำวัน · ${remind} น.` : `Pristiq 50 mg · ${qty} เม็ด · ${remind} น.`;
  // iOS already adds "from Momo" under a Home Screen app's notification, so the title is the reminder
  // itself (not "Momo" again) and the body carries the details.
  return { title: line, body: `${detail}\nแตะเพื่อเปิดโมโม่` };
}
