// Momo's recorded lines. Audio lives in public/voice/<id>.mp3 (generate with `npm run voice`,
// or replace any file with a real recording of the same name). Momo only ever speaks with these
// clips: a line without one stays silent (no device text-to-speech).
export const VOICE_LINES = {
  "greet-morning": "อรุณสวัสดิ์ แพรวา โมโม่มาแล้วน้า",
  "greet-afternoon": "สวัสดีแพรวา โมโม่คิดถึงจังเลย",
  "greet-evening": "สวัสดีตอนเย็นน้า แพรวา",
  "greet-night": "สวัสดีแพรวา ใกล้เวลานอนแล้วน้า",
} as const;

export type VoiceLineId = keyof typeof VOICE_LINES;

export function greetingId(now = new Date()): VoiceLineId {
  const h = now.getHours();
  if (h < 11) return "greet-morning";
  if (h < 17) return "greet-afternoon";
  if (h < 21) return "greet-evening";
  return "greet-night";
}

/* ─── What Momo says when tapped (affectionate only, never about whether a dose was taken) ─── */
export const HOME_TAP_LINES = ["ปุ๊กปิ๊ก ♡", "จิ้มโมโม่ทำไมน้า~ ♡", "กอดหน่อยได้ไหม ♡", "โมโม่อยู่ตรงนี้นะ", "วันนี้ก็เป็นวันที่ดีน้า ✦", "แพรวาน่ารักที่สุดเลย ♡", "ฮึบ! สู้ ๆ น้า"];
export const STOCK_TAP_LINES = ["โมโม่นับยาให้ทุกเม็ดเลยน้า ✎", "ยาอยู่ครบ โมโม่ดูแลให้ ♡", "เปิดกล่องใหม่เมื่อไหร่ บอกโมโม่ด้วยนะ", "นับยาทีไร โมโม่ตั้งใจสุด ๆ เลย ✦", "ปุ๊กปิ๊ก ♡"];
export const HISTORY_TAP_LINES = ["โมโม่จดไว้ให้ครบเลยนะ ✎", "ดูแลตัวเองทุกวัน เก่งมากเลยน้า ♡", "วันไหนลืมก็ไม่เป็นไรนะ ค่อย ๆ ไป ♡", "ปฏิทินสวยขึ้นทุกวันเลย ✦", "โมโม่ภูมิใจในแพรวาจัง ♡"];

/* ─── What Momo says when something happens. Toasts with these texts are spoken automatically. ─── */
export const TAKEN_LINES = (call: string) => [`เย้ วันนี้${call}ดูแลตัวเองแล้ว ♡`, "เก่งมากเลย โมโม่จดไว้ให้แล้วนะ", "บันทึกแล้วน้า วันนี้เรียบร้อย ♡", "โมโม่ดีใจด้วยน้า"];
export const SAY = {
  takenPlain: "บันทึกการกินยาแล้ว",
  alreadyTaken: "วันนี้บันทึกไปแล้วนะ ไม่ต้องกินซ้ำ",
  removed: "แกะเม็ดออกแล้ว ไม่ได้นับเป็นการกินยานะ",
  restored: "แก้ไขแล้ว เม็ดนี้กลับเข้าแผงนะ",
  backfill: "บันทึกย้อนหลังแล้ว ขอบคุณที่บอกโมโม่นะ",
  noReserve: "ยังไม่มีกล่องสำรอง เพิ่มกล่องก่อนนะ",
  // spoken only (their toasts, if any, carry details like pack names)
  boxOpened: "เปิดกล่องใหม่แล้ว โมโม่เพิ่มแผงยาให้แล้วน้า ♡",
  levelUp: "เย้ สนิทกันขึ้นแล้วน้า ♡",
  reserveAdded: ["เติมสต็อกแล้ว ขอบคุณน้า ♡", "เพิ่มกล่องสำรองแล้ว โมโม่นับไว้ให้นะ", "ยาพร้อมแล้ว อุ่นใจขึ้นเยอะเลย ♡"],
} as const;

/** Every line Momo can say aloud (Praewa's name filled in), for `npm run voice`. */
export function spokenLines(call = "แพรวา"): string[] {
  const all = [...HOME_TAP_LINES, ...STOCK_TAP_LINES, ...HISTORY_TAP_LINES, ...TAKEN_LINES(call), ...Object.values(SAY).flat()];
  return [...new Set(all.map(speakable))];
}

/** The words to speak: no hearts, sparkles or emoji, single spaces. */
export function speakable(text: string): string {
  return text.replace(/[☀-➿\u{1F300}-\u{1FAFF}~️]/gu, "").replace(/\s+/g, " ").trim();
}

/** Clip file id for a line: the same words give the same id however the line is decorated. */
export function clipId(text: string): string {
  let h = 0x811c9dc5;
  for (const ch of speakable(text)) {
    h ^= ch.codePointAt(0)!;
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return `l-${h.toString(16).padStart(8, "0")}`;
}
