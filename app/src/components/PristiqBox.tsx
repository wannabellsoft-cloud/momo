"use client";

import { useId } from "react";

/** Pristiq 50 mg box with a blister in front — a soft 2.5D vector drawn after the real packaging
    (yellow box, white front panel, purple lettering, pink tablets in silver foil). */
export function PristiqBox({ width = 128, className, title }: { width?: number; className?: string; title?: string }) {
  const id = "p" + useId().replace(/[^a-zA-Z0-9]/g, "");
  const purple = "#5B2A86";
  return (
    <svg
      viewBox="0 0 160 130"
      width={width}
      height={(width * 130) / 160}
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      className={`block flex-none overflow-visible ${className ?? ""}`}
    >
      <defs>
        <linearGradient id={`${id}top`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#FFE07A" />
          <stop offset="1" stopColor="#F7C63C" />
        </linearGradient>
        <linearGradient id={`${id}side`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#F2B92B" />
          <stop offset="1" stopColor="#DE9E17" />
        </linearGradient>
        <linearGradient id={`${id}front`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFFFFF" />
          <stop offset="1" stopColor="#F3EEF4" />
        </linearGradient>
        <linearGradient id={`${id}band`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFD54F" />
          <stop offset="1" stopColor="#F5BE2E" />
        </linearGradient>
        <linearGradient id={`${id}foil`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#F4F4F7" />
          <stop offset=".5" stopColor="#C9CAD3" />
          <stop offset="1" stopColor="#E6E7EC" />
        </linearGradient>
        <radialGradient id={`${id}tab`} cx=".38" cy=".3" r=".9">
          <stop offset="0" stopColor="#FFE3E0" />
          <stop offset=".6" stopColor="#F4B9B2" />
          <stop offset="1" stopColor="#DE9C97" />
        </radialGradient>
        <filter id={`${id}soft`} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" />
        </filter>
      </defs>

      {/* ground shadow */}
      <ellipse cx="80" cy="121" rx="70" ry="7" fill="#7A5A6E" opacity=".18" filter={`url(#${id}soft)`} />

      {/* box: top, right side, front */}
      <path d="M20 26 L34 12 L148 12 L134 26 Z" fill={`url(#${id}top)`} />
      <path d="M134 26 L148 12 L148 74 L134 88 Z" fill={`url(#${id}side)`} />
      <rect x="20" y="26" width="114" height="62" rx="2.5" fill={`url(#${id}front)`} />
      {/* yellow band with the strength, like the real box */}
      <path d="M104 26 H131.5 a2.5 2.5 0 0 1 2.5 2.5 V85.5 a2.5 2.5 0 0 1 -2.5 2.5 H104 Z" fill={`url(#${id}band)`} />
      <rect x="20" y="26" width="114" height="5" fill="#F7C63C" opacity=".85" />

      {/* lettering */}
      <text x="62" y="39" textAnchor="middle" fontSize="4.3" fontWeight="800" fill={purple}>PRESCRIPTION ONLY MEDICINE</text>
      <text x="62" y="44.5" textAnchor="middle" fontSize="3.2" fontWeight="700" fill={purple} opacity=".85">KEEP OUT OF REACH OF CHILDREN</text>
      {/* simplified four-colour mark */}
      <g transform="translate(29 51)">
        <rect width="5.5" height="5.5" rx="1" fill="#7B3FA0" />
        <rect x="6" width="5.5" height="5.5" rx="1" fill="#3E8FD1" />
        <rect y="6" width="5.5" height="5.5" rx="1" fill="#F2B92B" />
        <rect x="6" y="6" width="5.5" height="5.5" rx="1" fill="#4FB27A" />
      </g>
      <text x="44" y="61" fontSize="14.5" fontWeight="800" fill={purple} letterSpacing="-.3">Pristiq</text>
      <text x="45" y="68" fontSize="5.4" fontWeight="700" fontStyle="italic" fill="#7B3FA0">desvenlafaxine</text>
      <text x="119" y="62" textAnchor="middle" fontSize="13" fontWeight="800" fill={purple}>50<tspan fontSize="5.5" dx="1">mg</tspan></text>

      {/* blister in front, tilted */}
      <g transform="translate(4 86) rotate(-5)">
        <rect width="92" height="34" rx="7" fill={`url(#${id}foil)`} stroke="#B7B8C2" strokeWidth=".8" />
        <rect x="3" y="3" width="86" height="28" rx="5" fill="none" stroke="#FFFFFF" strokeOpacity=".6" strokeWidth="1" />
        {[0, 1].map((r) =>
          [0, 1, 2, 3, 4].map((c) => (
            <g key={`${r}${c}`} transform={`translate(${10 + c * 17.5} ${5.5 + r * 12.5})`}>
              <rect width="12" height="10" rx="3.2" fill="#000" opacity=".12" transform="translate(.8 1.4)" />
              <rect width="12" height="10" rx="3.2" fill={`url(#${id}tab)`} />
              <rect x="2.2" y="2" width="4.2" height="2.2" rx="1.1" fill="#fff" opacity=".7" />
            </g>
          )),
        )}
      </g>
    </svg>
  );
}
