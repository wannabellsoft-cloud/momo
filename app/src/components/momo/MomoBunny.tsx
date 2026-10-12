"use client";

import { useId, useState } from "react";
import { momoSvgMarkup, momoViewBox, type MomoState } from "./momo-art";
import type { MascotState } from "./mascot-manifest";
import { MomoAvatar, MomoMascot } from "./MomoMascot";

/* Momo mascot — vector placeholder ported from project/momo-kit.js.
   To ship real plush renders, drop transparent PNG/WebP files in public/momo/ and
   list them here, e.g. { idle: "/momo/momo-idle.png", "idle-head": "/momo/momo-idle-head.png" }.
   Missing or failing images fall back to the vector art. */
export const MOMO_RENDERS: Partial<Record<string, string>> = {};

export { MOMO_STATES, type MomoState } from "./momo-art";

type Props = {
  state?: MomoState;
  crop?: "head";
  /** Freeze all mascot motion (also applied globally by the reduce-motion setting). */
  still?: boolean;
  size: number;
  className?: string;
};

/** Original vector Momo — now only the last-resort fallback for MomoMascot. */
export function MomoVector({ state = "idle", crop, still, size, className }: Props) {
  const id = "m" + useId().replace(/[^a-zA-Z0-9]/g, "");
  const key = state + (crop ? "-" + crop : "");
  const src = MOMO_RENDERS[key] ?? MOMO_RENDERS[state];
  const [failed, setFailed] = useState<string | null>(null);

  if (src && failed !== src) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt="" aria-hidden="true" width={size} height={size} className={className} style={{ width: size, height: size, objectFit: "contain" }} onError={() => setFailed(src)} />;
  }
  return (
    <svg
      viewBox={momoViewBox(crop)}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={`momo-svg${still ? " still" : ""}${className ? " " + className : ""}`}
      style={{ width: size, height: size, flex: "none" }}
      dangerouslySetInnerHTML={{ __html: momoSvgMarkup(state, crop, id) }}
    />
  );
}

/* ─── Compatibility adapter ─────────────────────────────────────────────
   Existing screens use the original state names; they now render the 3D-style MomoMascot. */
export const TO_MASCOT: Record<MomoState, MascotState> = {
  idle: "waiting",
  reminder: "reminder",
  waiting: "waiting",
  taken: "success",
  refill: "refill",
  nostock: "noStock",
  sleep: "sleep",
  welcome: "welcome",
  loading: "question",
  error: "question",
};

/** Decorative Momo (the text next to Momo carries the meaning, so alt is empty). */
export function MomoBunny({ state = "idle", crop, still, size, className }: Props) {
  if (crop === "head") return <MomoAvatar px={size} className={className} />;
  return <MomoMascot state={TO_MASCOT[state]} px={size} alt="" animate={!still} className={`${state === "loading" ? "mascot-bounce " : ""}${className ?? ""}`} />;
}
