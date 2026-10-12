"use client";

import type { MascotState } from "./momo-character";
import { MomoAvatar, MomoMascot } from "./MomoMascot";

/* ─── Compatibility adapter ─────────────────────────────────────────────
   Screens and derive.ts speak in app situations (taken, nostock, error…).
   They all render the one 2.5D Momo through MomoMascot. */
export const MOMO_STATES = ["idle", "reminder", "waiting", "taken", "refill", "nostock", "sleep", "welcome", "loading", "error", "missed"] as const;
export type MomoState = (typeof MOMO_STATES)[number];

export const TO_MASCOT: Record<MomoState, MascotState> = {
  idle: "idle",
  reminder: "reminder",
  waiting: "idle",
  taken: "happy",
  refill: "refill",
  nostock: "refill",
  sleep: "sleeping",
  welcome: "happy",
  loading: "loading",
  error: "missed",
  missed: "missed",
};

type Props = {
  state?: MomoState;
  crop?: "head";
  /** Freeze Momo (small icons in lists and banners). */
  still?: boolean;
  size: number;
  className?: string;
};

/** Decorative Momo (the text next to Momo carries the meaning, so alt is empty). */
export function MomoBunny({ state = "idle", crop, still, size, className }: Props) {
  if (crop === "head") return <MomoAvatar px={size} state={TO_MASCOT[state]} className={className} />;
  return <MomoMascot state={TO_MASCOT[state]} px={size} alt="" animated={!still} showProps={size >= 56} className={className} />;
}
