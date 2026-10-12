// Momo 3D-style mascot — asset manifest.
//
// TEMPORARY ART: these files are square crops of the concept sheet from the
// "Momo Claude Implementation Assets" pack (momo_original_concept_sheet.png). They are raster
// concept references, NOT transparent production renders, 3D models or animations. They keep
// their original cream background and are shown as soft tiles. When clean transparent
// renders exist, drop them into public/mascot/momo/ with the same names (or update the paths
// here) — the MomoMascot API does not change.
export const MASCOT_STATES = ["welcome", "reminder", "waiting", "success", "refill", "noStock", "sleep", "question", "celebrate"] as const;
export type MascotState = (typeof MASCOT_STATES)[number];

export const MASCOT_ASSETS: Record<MascotState | "avatar", { src: string; px: number }> = {
  welcome: { src: "/mascot/momo/welcome.webp", px: 170 },
  reminder: { src: "/mascot/momo/reminder.webp", px: 170 },
  waiting: { src: "/mascot/momo/waiting.webp", px: 440 },
  success: { src: "/mascot/momo/success.webp", px: 170 },
  refill: { src: "/mascot/momo/refill.webp", px: 186 },
  noStock: { src: "/mascot/momo/noStock.webp", px: 164 },
  sleep: { src: "/mascot/momo/sleep.webp", px: 176 },
  question: { src: "/mascot/momo/question.webp", px: 168 },
  celebrate: { src: "/mascot/momo/celebrate.webp", px: 166 },
  avatar: { src: "/mascot/momo/avatar.webp", px: 330 },
};

/** Used when a state's file is missing or fails to load. */
export const MASCOT_FALLBACK: MascotState = "waiting";
export const MASCOT_PRODUCTION_READY = false;

export const MASCOT_ALT: Record<MascotState | "avatar", string> = {
  welcome: "โมโม่โบกมือทักทาย",
  reminder: "โมโม่ถือนาฬิกาปลุกสีชมพู",
  waiting: "โมโม่กอดหัวใจสีชมพู",
  success: "โมโม่ยิ้มกอดหัวใจ",
  refill: "โมโม่ถือกล่องยา",
  noStock: "โมโม่ถือโน้ตซื้อของ",
  sleep: "โมโม่นอนหลับใต้ผ้าห่ม",
  question: "โมโม่ทำหน้าสงสัย",
  celebrate: "โมโม่ชูมือดีใจ",
  avatar: "โมโม่",
};
