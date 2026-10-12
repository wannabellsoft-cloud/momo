"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { MASCOT_ALT, momoSvg, momoViewBox, type MascotState } from "./momo-character";

export { MASCOT_STATES, type MascotState } from "./momo-character";

export const MASCOT_SIZES = { xs: 40, sm: 64, md: 120, lg: 200, xl: 320 } as const;

export interface MomoMascotProps {
  state?: MascotState;
  size?: keyof typeof MASCOT_SIZES;
  /** Exact pixel size; overrides `size`. */
  px?: number;
  /** Per-state motion (breathing, blinking, waving…). Off automatically with reduced motion and while offscreen. */
  animated?: boolean;
  /** Pill, heart, note, blanket, sparkles… Off → Momo's pose and face only. */
  showProps?: boolean;
  /** Defaults to a Thai description of the state. Pass "" when the text next to Momo carries the meaning. */
  alt?: string;
  className?: string;
}

/** Pauses CSS animation while the element is offscreen, so idle loops never render out of view. */
function useOnscreen<T extends Element>(enabled: boolean) {
  const ref = useRef<T>(null);
  const [on, setOn] = useState(true);
  useEffect(() => {
    const el = ref.current;
    if (!enabled || !el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(([e]) => setOn(e.isIntersecting), { rootMargin: "40px" });
    io.observe(el);
    return () => io.disconnect();
  }, [enabled]);
  return [ref, on] as const;
}

const svgId = (raw: string) => "m" + raw.replace(/[^a-zA-Z0-9]/g, "");

/** Momo — the one character used everywhere. Layered inline SVG + CSS motion (globals.css "Momo 2.5D"). */
export function MomoMascot({ state = "idle", size = "md", px, animated = true, showProps = true, alt, className }: MomoMascotProps) {
  const id = svgId(useId());
  const dim = px ?? MASCOT_SIZES[size];
  const [ref, onscreen] = useOnscreen<SVGSVGElement>(animated);
  const html = useMemo(() => momoSvg(state, id, { props: showProps }), [state, id, showProps]);
  const label = alt ?? MASCOT_ALT[state];
  return (
    <svg
      ref={ref}
      viewBox={momoViewBox()}
      xmlns="http://www.w3.org/2000/svg"
      role={label ? "img" : undefined}
      aria-label={label || undefined}
      aria-hidden={label ? undefined : true}
      data-state={state}
      data-animated={animated && onscreen ? "true" : "false"}
      className={`momo25 flex-none select-none ${className ?? ""}`}
      style={{ width: dim, height: dim }}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

/** Momo's face (head crop) for avatars and chrome. Static. */
export function MomoAvatar({ px, state = "idle", className, alt = "" }: { px: number; state?: MascotState; className?: string; alt?: string }) {
  const id = svgId(useId());
  const html = useMemo(() => momoSvg(state, id, { props: false }), [state, id]);
  return (
    <svg
      viewBox={momoViewBox("head")}
      xmlns="http://www.w3.org/2000/svg"
      role={alt ? "img" : undefined}
      aria-label={alt || undefined}
      aria-hidden={alt ? undefined : true}
      data-animated="false"
      className={`momo25 flex-none select-none ${className ?? ""}`}
      style={{ width: px, height: px }}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
