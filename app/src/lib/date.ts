// Date helpers. A "day" is always computed in the device time zone (HANDOFF §2).

export const TH_MONTHS = ["มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน", "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"];
export const TH_MONTHS_SHORT = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];
export const TH_WEEKDAYS = ["อาทิตย์", "จันทร์", "อังคาร", "พุธ", "พฤหัสบดี", "ศุกร์", "เสาร์"];
export const TH_WEEKDAYS_SHORT = ["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"];

const pad = (n: number) => String(n).padStart(2, "0");

/** YYYY-MM-DD in local time. */
export function dayKey(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function parseDayKey(key: string): Date {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(d: Date, n: number): Date {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

/** HH:mm in local time. */
export function hm(d: Date): string {
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function addMin(time: string, m: number): string {
  const [h, mm] = time.split(":").map(Number);
  const t = (((h * 60 + mm + m) % 1440) + 1440) % 1440;
  return `${pad(Math.floor(t / 60))}:${pad(t % 60)}`;
}

/** Date at the given HH:mm on the same local day as `base`. */
export function atTime(base: Date, time: string): Date {
  const [h, m] = time.split(":").map(Number);
  const d = new Date(base);
  d.setHours(h, m, 0, 0);
  return d;
}

/** Combine a day key and HH:mm into an ISO string with the local offset. */
export function isoAt(day: string, time: string): string {
  const d = parseDayKey(day);
  const [h, m] = time.split(":").map(Number);
  d.setHours(h, m, 0, 0);
  const off = -d.getTimezoneOffset();
  const sign = off >= 0 ? "+" : "-";
  return `${day}T${pad(h)}:${pad(m)}:00${sign}${pad(Math.floor(Math.abs(off) / 60))}:${pad(Math.abs(off) % 60)}`;
}

export function nowIso(): string {
  const d = new Date();
  return isoAt(dayKey(d), hm(d));
}

/** "วันจันทร์ 12 ตุลาคม" */
export function thLongDay(d: Date): string {
  return `วัน${TH_WEEKDAYS[d.getDay()]} ${d.getDate()} ${TH_MONTHS[d.getMonth()]}`;
}

/** "12 ต.ค. 2026" — Gregorian year, as in the design. */
export function thShortDate(d: Date): string {
  return `${d.getDate()} ${TH_MONTHS_SHORT[d.getMonth()]} ${d.getFullYear()}`;
}

/** "12 ต.ค. 2026 · 08:15" from an ISO string. */
export function thStamp(iso: string): string {
  const d = new Date(iso);
  return `${thShortDate(d)} · ${hm(d)}`;
}

/** Night = 18:00–05:59 local time (moon greeting, night theme). */
export function isNight(d: Date): boolean {
  const h = d.getHours();
  return h >= 18 || h < 6;
}
