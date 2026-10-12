"use client";

import { useId } from "react";

/** Streak flame in the app's palette (peach → pink by day, pink → lavender at night via --flame-* tokens).
    Pale and still when the streak is 0; flickers gently otherwise (off with reduced motion). */
export function StreakFlame({ size = 18, lit = true, className }: { size?: number; lit?: boolean; className?: string }) {
  const id = "f" + useId().replace(/[^a-zA-Z0-9]/g, "");
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" className={`block flex-none overflow-visible ${lit ? "flame-lit" : "opacity-45 grayscale"} ${className ?? ""}`}>
      <defs>
        <linearGradient id={`${id}o`} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="var(--flame-b)" />
          <stop offset="1" stopColor="var(--flame-a)" />
        </linearGradient>
        <linearGradient id={`${id}i`} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#FFFFFF" />
          <stop offset="1" stopColor="var(--flame-core)" />
        </linearGradient>
      </defs>
      <g className="flame-body">
        <path
          d="M12 2.2 C 13.4 5.8 18.2 8.3 18.2 14 C 18.2 18.6 15.4 21.8 12 21.8 C 8.5 21.8 5.8 18.9 5.8 15.3 C 5.8 12.3 7.5 10.4 8.8 9.1 C 9 11.2 9.9 12.6 11 13.1 C 10.3 9.4 10.8 5.4 12 2.2 Z"
          fill={`url(#${id}o)`}
        />
        <path
          d="M12.2 11.8 C 13.1 14 15.2 15 15.2 17.5 C 15.2 19.5 13.8 20.7 12.1 20.7 C 10.4 20.7 9 19.6 9 17.9 C 9 16.1 10.4 15.2 11.3 14 C 11.6 13.3 11.9 12.6 12.2 11.8 Z"
          fill={`url(#${id}i)`}
        />
        <ellipse cx="9.4" cy="12.6" rx="1" ry="2.1" fill="#fff" opacity=".45" transform="rotate(20 9.4 12.6)" />
      </g>
    </svg>
  );
}
