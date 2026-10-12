"use client";

import { useId, type CSSProperties, type ReactNode } from "react";

/* Animated illustrations for the Stock screen (Claude Design "Stock Cards Momo v3").
   Colours come from the --inv-* tokens (light/dark); motion classes are in globals.css and stop with
   reduced motion. Each SVG fills its card band ("xMidYMax slice") like the prototype. */

const v = (name: string) => `var(--${name})`;
const vars = (o: Record<string, string | number>) => o as CSSProperties;

function Band({ h, children, className, align = "xMid" }: { h: number; children: ReactNode; className?: string; align?: "xMid" | "xMax" }) {
  return (
    <svg viewBox={`0 0 390 ${h}`} preserveAspectRatio={`${align}YMax slice`} aria-hidden="true" className={`absolute inset-0 block h-full w-full ${className ?? ""}`}>
      {children}
    </svg>
  );
}

function rng(seed: number) {
  let s = seed;
  return () => (s = (s * 9301 + 49297) % 233280) / 233280;
}

function Cloud({ x, y, s, d, dl }: { x: number; y: number; s: number; d: number; dl: number }) {
  return (
    <g className="inv-drift" style={vars({ "--d": `${d}s`, "--dl": `${dl}s` })}>
      <g transform={`translate(${x},${y}) scale(${s})`} fill="#fff">
        <ellipse cx="0" cy="8" rx="30" ry="11" />
        <circle cx="-12" cy="2" r="12" />
        <circle cx="8" cy="-3" r="16" />
      </g>
    </g>
  );
}

/** Header sky: sun, drifting clouds and breeze by day; twinkling stars, moon and comets at night. */
export function SkyHeader() {
  const id = "s" + useId().replace(/[^a-zA-Z0-9]/g, "");
  const r = rng(7);
  const stars = Array.from({ length: 30 }, (_, i) => ({ i, cx: r() * 390, cy: 6 + r() * 114, rr: 0.7 + r() * 1.3, d: 2 + r() * 3, dl: -r() * 4 }));
  const rays = Array.from({ length: 10 }, (_, i) => {
    const t = (i * Math.PI) / 5;
    return { i, x1: 354 + Math.cos(t) * 24, y1: 112 + Math.sin(t) * 24, x2: 354 + Math.cos(t) * 31, y2: 112 + Math.sin(t) * 31 };
  });
  const sky = (
    <defs>
      <linearGradient id={`${id}sky`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" style={{ stopColor: v("inv-sky-top") }} />
        <stop offset="1" style={{ stopColor: v("inv-sky-bot") }} />
      </linearGradient>
      <linearGradient id={`${id}tail`} x1="0" y1="1" x2="1" y2="0">
        <stop offset="0" stopColor="#fff" stopOpacity="1" />
        <stop offset="1" stopColor="#fff" stopOpacity="0" />
      </linearGradient>
    </defs>
  );
  const hill = <path d="M0 126 Q 110 104 230 124 T 390 120 V150 H0Z" style={{ fill: v("inv-hill") }} />;
  return (
    <>
      <Band h={150} className="inv-day" align="xMax">
        {sky}
        <rect width="390" height="150" fill={`url(#${id}sky)`} />
        <circle cx="354" cy="112" r="36" fill="#ffe08a" opacity=".35" />
        <g className="inv-spin">{rays.map((x) => <line key={x.i} {...x} stroke="#ffc35a" strokeWidth="3" strokeLinecap="round" />)}</g>
        <circle cx="354" cy="112" r="18" fill="#ffd166" />
        <Cloud x={60} y={40} s={0.9} d={26} dl={-6} />
        <Cloud x={0} y={70} s={0.6} d={34} dl={-22} />
        <path className="inv-wind" d="M150 92 q40 -12 80 0 t80 0" fill="none" stroke="rgba(255,255,255,.9)" strokeWidth="2" strokeLinecap="round" />
        <path className="inv-wind" style={vars({ "--dl": "-2s" })} d="M120 110 q40 -10 80 0 t90 -4" fill="none" stroke="rgba(255,255,255,.7)" strokeWidth="2" strokeLinecap="round" />
        {hill}
      </Band>
      <Band h={150} className="inv-night" align="xMax">
        {sky}
        <rect width="390" height="150" fill={`url(#${id}sky)`} />
        {stars.map((s) => (
          <circle key={s.i} className="inv-twinkle" style={vars({ "--d": `${s.d}s`, "--dl": `${s.dl}s` })} cx={s.cx} cy={s.cy} r={s.rr} fill="#fff7d6" />
        ))}
        <g className="inv-moon">
          <circle cx="352" cy="100" r="26" fill="#fff3c4" opacity=".12" />
          <circle cx="352" cy="100" r="16" fill="#fff3c4" />
          <circle cx="359" cy="95" r="13" fill="#332760" />
        </g>
        {[[400, 6, 7, -1], [330, -6, 9, -5.5]].map(([x, y, d, dl]) => (
          <g key={x} transform={`translate(${x},${y})`}>
            <g className="inv-comet" style={vars({ "--d": `${d}s`, "--dl": `${dl}s` })}>
              <line x1="0" y1="0" x2="54" y2="-27" stroke={`url(#${id}tail)`} strokeWidth="2.4" strokeLinecap="round" />
              <circle cx="0" cy="0" r="2.6" fill="#fff" />
            </g>
          </g>
        ))}
        {hill}
      </Band>
    </>
  );
}

export type Slot = "in" | "next" | "taken" | "removed";

/** Mini blister of the current pack (snake order), tablets bobbing, the next one pulsing. */
export function MiniBlister({ slots }: { slots: Slot[] }) {
  const x0 = 236, y0 = 26, gap = 28;
  return (
    <Band h={138}>
      <rect x={x0 - 18} y={y0 - 18} width={gap * 4 + 36} height={gap * 2 + 36} rx="18" style={{ fill: v("inv-bl-plate") }} />
      {slots.map((st, i) => {
        const row = Math.floor(i / 5), col = row === 1 ? 4 - (i % 5) : i % 5;
        const cx = x0 + col * gap, cy = y0 + row * gap;
        return (
          <g key={i}>
            <circle cx={cx} cy={cy} r="11" style={{ fill: v("inv-bl-slot") }} />
            {st === "taken" && <path d={`M${cx - 5} ${cy} l3.5 3.5 l6.5 -7`} style={{ stroke: v("inv-bl-ok") }} strokeWidth="2.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />}
            {st === "removed" && <path d={`M${cx - 4.5} ${cy} h9`} style={{ stroke: v("inv-bl-gone") }} strokeWidth="2.4" strokeLinecap="round" />}
            {st === "next" && <circle className="inv-pulse" cx={cx} cy={cy} r="11" fill="none" style={{ stroke: v("inv-bl-ring") }} strokeWidth="2.5" />}
            {(st === "in" || st === "next") && (
              <g className="inv-bob" style={vars({ "--dl": `${-i * 0.17}s` })}>
                <circle cx={cx} cy={cy} r="9" style={{ fill: v("inv-bl-shade") }} />
                <circle cx={cx - 1} cy={cy - 1.5} r="7.5" style={{ fill: v("inv-bl-pill") }} />
                <circle cx={cx - 3} cy={cy - 4} r="2" fill="#fff" opacity=".9" />
              </g>
            )}
          </g>
        );
      })}
      <path className="inv-sparkle" d="M206 18 l2 5 l5 2 l-5 2 l-2 5 l-2 -5 l-5 -2 l5 -2z" style={{ fill: v("inv-bl-ring") }} />
      <path className="inv-sparkle" style={vars({ "--d": "3s", "--dl": "-1.2s", fill: v("inv-bl-ok") })} d="M376 100 l1.5 4 l4 1.5 l-4 1.5 l-1.5 4 l-1.5 -4 l-4 -1.5 l4 -1.5z" />
    </Band>
  );
}

/** One Pristiq 50 mg box (white front, yellow band, purple lettering) seen at 3/4, front-left corner at x,y. */
function PristiqCarton() {
  const W = 52, H = 30, D = 7, x = 0, y = 0;
  return (
    <g>
      <path d={`M${x} ${y} L${x + D} ${y - D} H${x + W + D} L${x + W} ${y} Z`} fill="#FFDA6B" />
      <path d={`M${x + W} ${y} L${x + W + D} ${y - D} V${y + H - D} L${x + W} ${y + H} Z`} fill="#E3A82C" />
      <rect x={x} y={y} width={W} height={H} rx="1.5" fill="#FFFFFF" />
      <rect x={x} y={y + H - 6} width={W} height="6" fill="#F1ECF3" opacity=".7" />
      <rect x={x + W * 0.72} y={y} width={W * 0.28} height={H} fill="#FFCF45" />
      <rect x={x} y={y} width={W} height="2.4" fill="#F7C63C" />
      <text x={x + 3} y={y + 7.4} fontSize="3.4" fontWeight="800" fill="#5B2A86">PRESCRIPTION ONLY</text>
      <g transform={`translate(${x + 3} ${y + 12})`}>
        <rect width="2.6" height="2.6" rx=".5" fill="#7B3FA0" /><rect x="2.9" width="2.6" height="2.6" rx=".5" fill="#3E8FD1" />
        <rect y="2.9" width="2.6" height="2.6" rx=".5" fill="#F2B92B" /><rect x="2.9" y="2.9" width="2.6" height="2.6" rx=".5" fill="#4FB27A" />
      </g>
      <text x={x + 9.5} y={y + 17.4} fontSize="7.6" fontWeight="800" fill="#5B2A86" letterSpacing="-.2">Pristiq</text>
      <text x={x + 10} y={y + 22} fontSize="3.2" fontWeight="700" fontStyle="italic" fill="#7B3FA0">desvenlafaxine</text>
      <text x={x + W * 0.86} y={y + 18} textAnchor="middle" fontSize="6.4" fontWeight="800" fill="#5B2A86">50</text>
      <text x={x + W * 0.86} y={y + 22.4} textAnchor="middle" fontSize="2.8" fontWeight="800" fill="#5B2A86">mg</text>
    </g>
  );
}

/** Reserve boxes: real-looking Pristiq boxes stacked like cartons on a shelf (3 · 2 · 1, then "+n"),
    centred in the band. No boxes → a short note instead. */
export function BoxStack({ n }: { n: number }) {
  const W = 52, D = 7, step = 60, rowH = 37, cx = 195, base = 112 - 30; // front top of the bottom row
  // centred stack for any count: 1 · 2 · 3, then 3+1, 3+2, 3+2+1
  const shown = Math.min(n, 6);
  const rows = shown === 0 ? [] : shown <= 2 ? [shown === 1 ? [0] : [-0.5, 0.5]] : [[-1, 0, 1], ...(shown === 4 ? [[0]] : shown >= 5 ? [[-0.5, 0.5]] : []), ...(shown === 6 ? [[0]] : [])];
  const pos: [number, number][] = rows.flatMap((r, ri) => r.map((k) => [cx + k * step - (W + D) / 2, base - ri * rowH] as [number, number]));
  return (
    <>
      <Band h={124}>
        <rect x="105" y="112" width="180" height="5" rx="2.5" style={{ fill: v("inv-shelf") }} />
        {pos.map(([x, y], i) => (
          // keyed by slot: only a newly added box drops in; others slide when the stack re-centres
          <g key={`b${i}`} style={{ transform: `translate(${x}px, ${y}px)`, transition: "transform 450ms cubic-bezier(.3,1.3,.5,1)" }}>
            <g className="inv-drop">
              <g className="inv-squish" style={vars({ "--dl": `${-i * 0.4}s` })}>
                <PristiqCarton />
              </g>
            </g>
          </g>
        ))}
        {n > 6 && (
          <text x="296" y="108" fontSize="15" fontWeight="800" style={{ fill: v("inv-dash") }}>
            +{n - 6}
          </text>
        )}
      </Band>
      {n === 0 && (
        <div className="absolute inset-x-0 top-0 bottom-[14px] flex flex-col items-center justify-center text-center">
          <span className="text-[15px] leading-[22px] font-extrabold text-(--inv-box-title)">ยังไม่มีกล่องสำรอง</span>
          <span className="text-[13px] leading-[19px] text-(--inv-box-meta)">ได้ยามาเพิ่มแล้ว กด + ด้านล่างได้เลยนะ</span>
        </div>
      )}
    </>
  );
}
