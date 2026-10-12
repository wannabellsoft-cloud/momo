"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { BASE } from "@/lib/base";
import { MASCOT_ALT, MASCOT_STATES, momoFx, momoSvg, momoViewBox, type MascotState } from "./momo-character";

export { MASCOT_STATES, type MascotState } from "./momo-character";

export const MASCOT_SIZES = { xs: 40, sm: 64, md: 120, lg: 200, xl: 320 } as const;

/** Rendered Momo, one transparent WebP per state (scripts/slice-mascot.py). */
const pic = (state: MascotState) => `${BASE}/mascot/${state}.webp`;

export interface MomoMascotProps {
  state?: MascotState;
  size?: keyof typeof MASCOT_SIZES;
  /** Exact pixel size; overrides `size`. */
  px?: number;
  /** Per-state motion (breathing, hopping, floating…). Off automatically with reduced motion and while offscreen. */
  animated?: boolean;
  /** Floating effects (bell, sparkles, Zz, bubbles…). Held props are part of the pose. */
  showProps?: boolean;
  /** Defaults to a Thai description of the state. Pass "" when the text next to Momo carries the meaning. */
  alt?: string;
  className?: string;
  /** Load eagerly (above-the-fold hero). */
  priority?: boolean;
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

// Warm the cache with every pose once (≈170 KB in total) so a state change never shows a blank frame.
let preloaded = false;
function preloadPoses() {
  if (preloaded || typeof window === "undefined") return;
  preloaded = true;
  const go = () => MASCOT_STATES.forEach((s) => { const i = new Image(); i.decoding = "async"; i.src = pic(s); });
  if ("requestIdleCallback" in window) window.requestIdleCallback(go);
  else setTimeout(go, 1200);
}

const svgId = (raw: string) => "m" + raw.replace(/[^a-zA-Z0-9]/g, "");

/** Momo — the one character used everywhere: rendered pose image + animated SVG effects.
    Falls back to the drawn vector Momo if an image can't load. */
export function MomoMascot({ state = "idle", size = "md", px, animated = true, showProps = true, alt, className, priority }: MomoMascotProps) {
  const id = svgId(useId());
  const dim = px ?? MASCOT_SIZES[size];
  const [ref, onscreen] = useOnscreen<HTMLSpanElement>(animated);
  const [failed, setFailed] = useState<MascotState | null>(null);
  const fx = useMemo(() => (showProps ? momoFx(state, id) : ""), [state, id, showProps]);
  const vector = useMemo(() => (failed === state ? momoSvg(state, id, { props: showProps }) : ""), [failed, state, id, showProps]);
  const label = alt ?? MASCOT_ALT[state];
  useEffect(preloadPoses, []);

  return (
    <span
      ref={ref}
      role={label ? "img" : undefined}
      aria-label={label || undefined}
      aria-hidden={label ? undefined : true}
      data-state={state}
      data-animated={animated && onscreen ? "true" : "false"}
      className={`momo25 momo-pic relative inline-block flex-none select-none ${className ?? ""}`}
      style={{ width: dim, height: dim }}
    >
      {vector ? (
        <svg viewBox={momoViewBox()} className="block h-full w-full" aria-hidden="true" dangerouslySetInnerHTML={{ __html: vector }} />
      ) : (
        <>
          <span className="m-shadow" aria-hidden="true" />
          <span className="m-all">
            <span className="m-breathe">
              {/* eslint-disable-next-line @next/next/no-img-element -- static export; tiny pre-sized WebP */}
              <img
                key={state}
                src={pic(state)}
                alt=""
                width={dim}
                height={dim}
                draggable={false}
                decoding="async"
                loading={priority ? "eager" : "lazy"}
                onError={() => setFailed(state)}
              />
            </span>
          </span>
          {fx && <svg viewBox="0 0 200 200" className="m-fx" aria-hidden="true" dangerouslySetInnerHTML={{ __html: fx }} />}
        </>
      )}
    </span>
  );
}

/** Momo's face for avatars and chrome. Static. */
export function MomoAvatar({ px, className, alt = "" }: { px: number; state?: MascotState; className?: string; alt?: string }) {
  const id = svgId(useId());
  const [failed, setFailed] = useState(false);
  if (failed)
    return (
      <svg viewBox={momoViewBox("head")} aria-hidden="true" className={`flex-none ${className ?? ""}`} style={{ width: px, height: px }} dangerouslySetInnerHTML={{ __html: momoSvg("idle", id, { props: false }) }} />
    );
  return (
    // eslint-disable-next-line @next/next/no-img-element -- static export; tiny pre-sized WebP
    <img
      src={`${BASE}/mascot/avatar.webp`}
      alt={alt}
      aria-hidden={alt ? undefined : true}
      width={px}
      height={px}
      draggable={false}
      decoding="async"
      className={`block flex-none rounded-full bg-(--surface-soft) object-cover select-none ${className ?? ""}`}
      style={{ width: px, height: px }}
      onError={() => setFailed(true)}
    />
  );
}
