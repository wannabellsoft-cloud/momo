"use client";

import { useId, useState } from "react";
import { momoSvgMarkup, momoViewBox, type MomoState } from "./momo-art";

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

/** Decorative mascot. Always aria-hidden — the message next to Momo carries the meaning. */
export function MomoBunny({ state = "idle", crop, still, size, className }: Props) {
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
