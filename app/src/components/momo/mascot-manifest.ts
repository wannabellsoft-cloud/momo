// Momo mascot — asset manifest.
//
// Images in public/mascot/momo/ are renders of Momo's 3D model (Meshy "Blush Bunny", textured,
// unrigged) made with scripts/mascot/render-states.mjs: one standing pose, camera angle/lean per
// state, and pastel props (clock, heart, med box, note, blanket…) drawn on top. Transparent
// 768×768 WebP (avatar 512). Re-render when the model changes: `npm run mascot:render`.
// Users can switch between the 3D Momo and the original drawn (vector) Momo in Momo's profile.
export type MascotStyle = "3d" | "vector";
export const MASCOT_DEFAULT_STYLE: MascotStyle = "3d";

export const MASCOT_STATES = ["welcome", "reminder", "waiting", "success", "refill", "noStock", "sleep", "question", "celebrate"] as const;
export type MascotState = (typeof MASCOT_STATES)[number];

export const MASCOT_ASSETS: Record<MascotState | "avatar", { src: string; px: number }> = {
  welcome: { src: "/mascot/momo/welcome.webp", px: 768 },
  reminder: { src: "/mascot/momo/reminder.webp", px: 768 },
  waiting: { src: "/mascot/momo/waiting.webp", px: 768 },
  success: { src: "/mascot/momo/success.webp", px: 768 },
  refill: { src: "/mascot/momo/refill.webp", px: 768 },
  noStock: { src: "/mascot/momo/noStock.webp", px: 768 },
  sleep: { src: "/mascot/momo/sleep.webp", px: 768 },
  question: { src: "/mascot/momo/question.webp", px: 768 },
  celebrate: { src: "/mascot/momo/celebrate.webp", px: 768 },
  avatar: { src: "/mascot/momo/avatar.webp", px: 512 },
};

/** Used when a state's file is missing or fails to load. */
export const MASCOT_FALLBACK: MascotState = "waiting";

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
