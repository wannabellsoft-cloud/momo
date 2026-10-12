"use client";

import Image from "next/image";
import { useState } from "react";
import { BASE } from "@/lib/base";
import { MASCOT_ALT, MASCOT_ASSETS, MASCOT_FALLBACK, type MascotState } from "./mascot-manifest";
import { MomoVector } from "./MomoBunny";

export type { MascotState } from "./mascot-manifest";

const SIZES = { sm: 56, md: 112, lg: 170, hero: 220 } as const;

export interface MomoMascotProps {
  state: MascotState;
  size?: keyof typeof SIZES;
  /** Exact pixel size; overrides `size`. */
  px?: number;
  className?: string;
  /** Load eagerly (above-the-fold hero). Everything else is lazy. */
  priority?: boolean;
  /** Defaults to a Thai description of the pose. Pass "" when the mascot is purely decorative. */
  alt?: string;
  /** soft: edges fade into the card (default) · tile: rounded square · circle: avatar-style. */
  variant?: "soft" | "tile" | "circle";
  /** Gentle breathing. Off automatically with reduced motion. */
  animate?: boolean;
}

const VARIANT = {
  soft: "mascot-soft",
  tile: "rounded-[28%]",
  circle: "rounded-full",
} as const;

/** Momo as an image (3D-style art). Reserved square box → no layout shift.
    Missing state → fallback state → original vector Momo. */
export function MomoMascot({ state, size = "md", px, className, priority, alt, variant = "soft", animate = true }: MomoMascotProps) {
  const dim = px ?? SIZES[size];
  const [failed, setFailed] = useState<Set<string>>(() => new Set());
  const use: MascotState | null = !failed.has(state) ? state : !failed.has(MASCOT_FALLBACK) ? MASCOT_FALLBACK : null;

  return (
    <span className={`relative inline-block flex-none ${animate ? "mascot-breathe" : ""} ${className ?? ""}`} style={{ width: dim, height: dim }}>
      {use ? (
        <Image
          key={use}
          src={BASE + MASCOT_ASSETS[use].src}
          alt={alt ?? MASCOT_ALT[state]}
          width={dim}
          height={dim}
          sizes={`${dim}px`}
          priority={priority}
          loading={priority ? undefined : "lazy"}
          draggable={false}
          className={`block h-full w-full object-cover select-none ${VARIANT[variant]}`}
          onError={() => setFailed((f) => new Set(f).add(use))}
        />
      ) : (
        <MomoVector state="idle" size={dim} still={!animate} />
      )}
    </span>
  );
}

/** Circular face for avatars, notification and app chrome. */
export function MomoAvatar({ px, className, alt = "" }: { px: number; className?: string; alt?: string }) {
  const [failed, setFailed] = useState(false);
  if (failed) return <MomoVector crop="head" still size={px} className={className} />;
  return (
    <Image
      src={BASE + MASCOT_ASSETS.avatar.src}
      alt={alt}
      width={px}
      height={px}
      sizes={`${px}px`}
      loading="lazy"
      draggable={false}
      className={`block flex-none rounded-full object-cover select-none ${className ?? ""}`}
      style={{ width: px, height: px }}
      onError={() => setFailed(true)}
    />
  );
}
