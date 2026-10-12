"use client";

import { useId } from "react";

/** Closeness (ความสนิท) colours per tier — pale blush → deep rose, the last tier gets a gold rim. */
const TONES = [
  ["#FFD9E3", "#F7A9C2"],
  ["#FFC4D4", "#F28AB0"],
  ["#FFADC4", "#E8689A"],
  ["#FF97B4", "#D24F82"],
  ["#FF8FAE", "#C23D72"],
] as const;

/** Momo's closeness logo: a heart wearing Momo's floppy ears, with the level inside. */
export function BondBadge({ level, tier, size = 40 }: { level: number; tier: number; size?: number }) {
  const id = "b" + useId().replace(/[^a-zA-Z0-9]/g, "");
  const [hi, lo] = TONES[Math.min(tier, TONES.length - 1)];
  const top = tier >= TONES.length - 1;
  const HEART = "M24 42 C 11 33.5 5 25.5 5 17.5 C 5 11.6 9.4 7.5 14.6 7.5 C 18.6 7.5 22 10 24 13.6 C 26 10 29.4 7.5 33.4 7.5 C 38.6 7.5 43 11.6 43 17.5 C 43 25.5 37 33.5 24 42 Z";
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true" className="block flex-none overflow-visible">
      <defs>
        <linearGradient id={`${id}h`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={hi} />
          <stop offset="1" stopColor={lo} />
        </linearGradient>
        <linearGradient id={`${id}e`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFFFFF" />
          <stop offset="1" stopColor="#F3E3DA" />
        </linearGradient>
      </defs>
      {/* Momo's floppy ears hanging behind the heart's lobes */}
      {[-1, 1].map((k) => (
        <g key={k} transform={`translate(${24 + k * 15} 7.5) rotate(${-k * 20})`}>
          <path d="M0 0 C 5.5 0 6.4 9 5.6 16 C 5 21.5 1.8 24.5 0 24.5 C -1.8 24.5 -5 21.5 -5.6 16 C -6.4 9 -5.5 0 0 0 Z" fill={`url(#${id}e)`} stroke="#EBD3C8" strokeWidth=".8" />
          <path d="M0 8 C 2.6 8 3 14 2.6 18 C 2.2 21 1 22 0 22 C -1 22 -2.2 21 -2.6 18 C -3 14 -2.6 8 0 8 Z" fill="#FFBFC7" opacity=".9" transform={`translate(${k * 0.8} 0)`} />
        </g>
      ))}
      <path d={HEART} fill={`url(#${id}h)`} stroke={top ? "#F6C76B" : "#FFFFFF"} strokeWidth={top ? 2.2 : 1.6} />
      <ellipse cx="15" cy="15" rx="4.6" ry="3" fill="#fff" opacity=".55" transform="rotate(-30 15 15)" />
      <text x="24" y="30" textAnchor="middle" fontSize={level >= 10 ? 13 : 15} fontWeight="800" fill="#fff" style={{ fontFamily: "inherit" }}>
        {level}
      </text>
      {top && <path d="M41 4 l1.3 3.2 3.2 1.3 -3.2 1.3 -1.3 3.2 -1.3 -3.2 -3.2 -1.3 3.2 -1.3z" fill="#F6C76B" />}
    </svg>
  );
}
