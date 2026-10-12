import { bellArt } from "./props-art";

// Momo 2.5D — character master (single source of truth for shape, colour, expressions and props).
//
// A vector re-creation of the reference board ("Momo — Your Friendly Medication Buddy", floppy-ear
// version): a soft cream mochi bunny with long floppy ears. The board is a flat raster and cannot be
// rigged, so Momo is redrawn as layered SVG — every part is its own group (class names below) so CSS
// can animate it. Pure string builders (no React): used by <MomoMascot /> and scripts/gen-icons.mts.
//
// Layers (back → front): shadow · feet · body · body-shade · cheeks · ear-shadows · ears ·
// eyes · brows · mouth · props(behind hands) · arms · props.   viewBox 0 0 200 200, ground at y≈184.

export const MASCOT_STATES = ["idle", "reminder", "happy", "missed", "sleeping", "refill", "loading", "success"] as const;
export type MascotState = (typeof MASCOT_STATES)[number];

export const MOMO_COLORS = {
  cream: "#FFF9F3",
  peach: "#FFDCCB",
  pink: "#FFBFC7",
  sage: "#A8CFAF",
  sky: "#A9D4FF",
  brown: "#59443D",
  background: "#FFFAF6",
} as const;

export const MASCOT_ALT: Record<MascotState, string> = {
  idle: "โมโม่ยิ้มอยู่",
  reminder: "โมโม่กอดแคปซูลยามาเตือน",
  happy: "โมโม่ยิ้มกอดหัวใจ",
  missed: "โมโม่ทำหน้าเป็นห่วง",
  sleeping: "โมโม่นอนหลับห่มผ้า",
  refill: "โมโม่ถือโน้ตรายการซื้อยา",
  loading: "โมโม่ลอยตัวรออยู่",
  success: "โมโม่กระโดดดีใจ",
};

const C = MOMO_COLORS;
const INK = "#4A2F2B";
const BODY = "M100 38 C 146 38 174 72 176 116 C 178 152 166 176 134 179 C 116 180.5 84 180.5 66 179 C 34 176 22 152 24 116 C 26 72 54 38 100 38 Z";
const EAR_L = "M69 68.5 C 51 61.6 29 70.2 18 92.6 C 5 116.7 2 144.2 10 159.7 C 16 170.9 33 170.9 38 159.7 C 43 146.8 44 127.9 48 112.4 C 52 96.9 58 80.6 69 68.5 Z";
const EAR_L_PINK = "M46 116.7 C 39 132.2 27 147.6 21 158 C 25 165.7 34 164.8 38 158 C 43 145.9 45 130.4 46 116.7 Z";
const HEART = "M100 178 C 66 158, 64 130, 84 127 C 93 126, 99 132, 100 137 C 101 132, 107 126, 116 127 C 136 130, 134 158, 100 178Z";
const mirror = (d: string) => d.replace(/(-?\d+(?:\.\d+)?) (-?\d+(?:\.\d+)?)/g, (_, x, y) => `${200 - Number(x)} ${y}`);

type Arm = { cx: number; cy: number; rot: number; rx?: number; ry?: number; cls?: string; origin?: [number, number] };
export type Pose = {
  eyes: "open" | "happy" | "sleep" | "worried" | "wink";
  mouth: "smile" | "open" | "worried" | "sleep" | "o";
  brows?: boolean;
  arms?: Arm[];
  propsBehindArms?: (id: string) => string;
  props?: (id: string) => string;
};

const restL: Arm = { cx: 72, cy: 162, rot: 24, rx: 13, ry: 14, cls: "m-arm-l", origin: [76, 150] };
const restR: Arm = { cx: 128, cy: 162, rot: -24, rx: 13, ry: 14, cls: "m-arm-r", origin: [124, 150] };

const sparkle = (x: number, y: number, s: number, c: string, cls = "m-spark") =>
  `<path class="${cls}" style="transform-origin:${x}px ${y}px" d="M${x} ${y - s}Q${x + s * 0.18} ${y - s * 0.18} ${x + s} ${y}Q${x + s * 0.18} ${y + s * 0.18} ${x} ${y + s}Q${x - s * 0.18} ${y + s * 0.18} ${x - s} ${y}Q${x - s * 0.18} ${y - s * 0.18} ${x} ${y - s}Z" fill="${c}"/>`;
// Note: never put a CSS transform-origin/animation on an element that has an SVG transform attribute —
// CSS transforms replace it. Animate a wrapping <g> instead.
const heart = (cx: number, cy: number, s: number, fill: string, cls = "") =>
  `<g class="${cls}" style="transform-origin:${cx}px ${cy}px"><path d="${HEART}" transform="translate(${cx - 100 * s} ${cy - 152 * s}) scale(${s})" fill="${fill}"/></g>`;
// "Pop" lines (the little dashes around Momo on the board).
const pops = (x: number, y: number, c = "#F6C76B", flip = false) => {
  const k = flip ? -1 : 1;
  return `<g class="m-motion" stroke="${c}" stroke-width="3.2" stroke-linecap="round" fill="none"><path d="M${x} ${y}l${-4 * k} -9M${x + 9 * k} ${y + 2}l${2 * k} -10M${x - 8 * k} ${y + 8}l${-8 * k} -4"/></g>`;
};

const POSES: Record<MascotState, Pose> = {
  idle: { eyes: "open", mouth: "open", arms: [restL, restR], props: () => pops(36, 44, "#F6C76B", true) + pops(170, 50) },
  reminder: {
    eyes: "open",
    mouth: "open",
    propsBehindArms: (id) => `<g class="m-prop" style="transform-origin:100px 154px"><g transform="translate(100 154) rotate(-30) scale(1.08)">
        <rect x="-25" y="-12" width="50" height="24" rx="12" fill="url(#${id}pillW)"/>
        <path d="M-13 -12 H2 V12 H-13 A12 12 0 0 1 -13 -12 Z" fill="url(#${id}pillP)"/>
        <rect x="-19" y="-8" width="15" height="4" rx="2" fill="#fff" opacity=".6"/></g></g>`,
    arms: [
      { cx: 80, cy: 172, rot: 30, rx: 12, ry: 11.5 },
      { cx: 129, cy: 151, rot: -40, rx: 12, ry: 11.5 },
    ],
    props: (id) => `<g class="m-ring" style="transform-origin:167px 14px"><svg x="147" y="10" width="40" height="40" viewBox="0 0 100 100" overflow="visible">${bellArt(id + "bell")}</svg></g>` + pops(30, 50, "#F6C76B", true),
  },
  happy: {
    eyes: "happy",
    mouth: "open",
    propsBehindArms: (id) => heart(100, 150, 0.5, `url(#${id}heart)`, "m-prop m-beat"),
    arms: [
      { cx: 80, cy: 156, rot: 34, rx: 13, ry: 12.5 },
      { cx: 120, cy: 156, rot: -34, rx: 13, ry: 12.5 },
    ],
    props: () => heart(30, 70, 0.14, "#FF8FA3", "m-beat") + heart(40, 52, 0.1, "#FFB3C1", "m-beat") + pops(166, 46),
  },
  missed: {
    eyes: "worried",
    mouth: "worried",
    brows: true,
    arms: [
      { cx: 84, cy: 168, rot: 20, rx: 12, ry: 11 },
      { cx: 116, cy: 168, rot: -20, rx: 12, ry: 11 },
    ],
    props: () => `<g class="m-float-slow"><path d="M146 28 h30 a11 11 0 0 1 11 11 v6 a11 11 0 0 1 -11 11 h-18 l-9 8 v-8 h-3 a11 11 0 0 1 -11 -11 v-6 a11 11 0 0 1 11 -11z" fill="#fff" stroke="#E7DDF6" stroke-width="1.5"/>
      <g fill="#8E7FD0"><circle class="m-dot" cx="153" cy="42" r="2.8"/><circle class="m-dot d2" cx="161" cy="42" r="2.8"/><circle class="m-dot d3" cx="169" cy="42" r="2.8"/></g></g>`,
  },
  sleeping: {
    eyes: "sleep",
    mouth: "sleep",
    props: (id) => `<g class="m-prop"><path d="M10 142 C 54 126, 146 126, 190 142 L 194 196 L 6 196 Z" fill="url(#${id}blanket)"/>
        <path d="M10 142 C 54 126, 146 126, 190 142" stroke="#C7CCF7" stroke-width="7" fill="none" stroke-linecap="round"/>
        <path d="M30 160 C 70 150, 130 150, 170 160" stroke="#fff" stroke-opacity=".25" stroke-width="4" fill="none" stroke-linecap="round"/></g>
      <g class="m-zz" fill="#8E7FD0" font-family="sans-serif" font-weight="800"><text x="140" y="44" font-size="18">Z</text><text x="157" y="30" font-size="13">z</text><text x="168" y="19" font-size="9">z</text></g>
      <path class="m-spark" style="transform-origin:36px 40px" d="M36 27 A13 13 0 1 0 49 44 A10 13 0 1 1 36 27Z" fill="#F9D774"/>`,
  },
  refill: {
    eyes: "open",
    mouth: "open",
    propsBehindArms: () => `<g class="m-prop" style="transform-origin:150px 146px"><g transform="translate(150 144) rotate(10)">
        <rect x="-21" y="-27" width="42" height="54" rx="6" fill="#9C8F96"/><rect x="-17" y="-22" width="34" height="45" rx="3.5" fill="#FFFFFF"/>
        <rect x="-8" y="-30" width="16" height="8" rx="3" fill="#E28A8F"/>
        <g stroke-linecap="round" stroke-linejoin="round" stroke-width="2.6" fill="none"><path d="M-12 -11 l3 3 l5 -6" stroke="#5B8DEF"/><path d="M-12 3 l3 3 l5 -6" stroke="#5B8DEF"/><path d="M1 -9 h10 M1 5 h10 M-11 16 h20" stroke="#B9C7E6"/></g>
        <rect x="3" y="-16" width="11" height="5.5" rx="2.75" fill="#F26C84" transform="rotate(-30 8 -13)"/></g></g>
      <g class="m-ring" style="transform-origin:170px 28px"><circle cx="170" cy="28" r="12" fill="#FF6F76"/><path d="M170 20 v10" stroke="#fff" stroke-width="3.4" stroke-linecap="round"/><circle cx="170" cy="35" r="2" fill="#fff"/></g>` + pops(30, 50, "#F6C76B", true),
    arms: [restL, { cx: 136, cy: 156, rot: -20, rx: 12.5, ry: 12.5 }],
  },
  loading: {
    eyes: "open",
    mouth: "o",
    arms: [restL, restR],
    props: () => `<g fill="${C.pink}"><circle class="m-dot" cx="86" cy="197" r="3.2"/><circle class="m-dot d2" cx="100" cy="197" r="3.2"/><circle class="m-dot d3" cx="114" cy="197" r="3.2"/></g>`,
  },
  success: {
    eyes: "happy",
    mouth: "open",
    arms: [
      { cx: 40, cy: 112, rot: -36, rx: 12.5, ry: 15, cls: "m-arm-up-l", origin: [52, 128] },
      { cx: 160, cy: 112, rot: 36, rx: 12.5, ry: 15, cls: "m-arm-up-r", origin: [148, 128] },
    ],
    props: () =>
      [[24, 46, "#FFBFC7"], [176, 58, "#A9D4FF"], [16, 100, "#FFE08A"], [184, 100, "#C9BBF7"], [44, 22, "#A8CFAF"], [156, 18, "#FF8FA3"]]
        .map(([x, y, c], i) => (i % 2 ? `<g class="m-conf"><rect x="${x}" y="${y}" width="8" height="3.6" rx="1.8" fill="${c}" transform="rotate(${30 * i} ${x} ${y})"/></g>` : `<circle class="m-conf" cx="${x}" cy="${y}" r="3.4" fill="${c}"/>`))
        .join("") + sparkle(28, 72, 6.5, "#F6C76B") + sparkle(172, 80, 6, C.pink) + heart(160, 34, 0.18, "#FF8FA3", "m-beat"),
  },
};

function arm(a: Arm, id: string) {
  const rx = a.rx ?? 12.5, ry = a.ry ?? 14;
  const origin = a.origin ? ` style="transform-origin:${a.origin[0]}px ${a.origin[1]}px"` : "";
  return `<g class="m-arm ${a.cls ?? ""}"${origin}><ellipse filter="url(#${id}limbShadow)" cx="${a.cx}" cy="${a.cy}" rx="${rx}" ry="${ry}" transform="rotate(${a.rot} ${a.cx} ${a.cy})" fill="url(#${id}limb)"/>
    <ellipse cx="${a.cx - 2.5}" cy="${a.cy - ry * 0.38}" rx="${rx * 0.38}" ry="${ry * 0.22}" transform="rotate(${a.rot} ${a.cx} ${a.cy})" fill="#fff" opacity=".8"/></g>`;
}

const EYE_Y = 110;
function eye(cx: number, cy: number, id: string) {
  return `<ellipse cx="${cx}" cy="${cy}" rx="7.6" ry="9.8" fill="url(#${id}eye)"/><ellipse cx="${cx + 2.4}" cy="${cy - 3.8}" rx="2.8" ry="3.1" fill="#fff"/><circle cx="${cx - 2.4}" cy="${cy + 4}" r="1.2" fill="#fff" opacity=".75"/>`;
}
function eyes(kind: Pose["eyes"], id: string) {
  const arc = (x: number, up: boolean) => `<path d="M${x - 8} ${EYE_Y + 2} q8 ${up ? -10 : 7} 16 0" stroke="${INK}" stroke-width="3.8" fill="none" stroke-linecap="round"/>`;
  if (kind === "happy") return `<g class="m-eyes">${arc(77, true)}${arc(123, true)}</g>`;
  if (kind === "sleep") return `<g class="m-eyes">${arc(77, false)}${arc(123, false)}</g>`;
  if (kind === "wink") return `<g class="m-eyes">${eye(77, EYE_Y, id)}<path d="M116 ${EYE_Y - 4} l14 4 l-14 4" stroke="${INK}" stroke-width="3.8" fill="none" stroke-linecap="round" stroke-linejoin="round"/></g>`;
  const dy = kind === "worried" ? 3 : 0;
  return `<g class="m-eyes m-blink" style="transform-origin:100px ${EYE_Y + dy}px">${eye(77, EYE_Y + dy, id)}${eye(123, EYE_Y + dy, id)}</g>`;
}

function mouth(kind: Pose["mouth"]) {
  if (kind === "open") return `<g class="m-mouth"><path d="M90.5 119.5 Q100 121.6 109.5 119.5 Q109 134 100 134 Q91 134 90.5 119.5 Z" fill="#A9433F"/><path d="M93.8 129.6 Q100 124.6 106.2 129.6 Q104 134 100 134 Q96 134 93.8 129.6 Z" fill="#FF8F98"/></g>`;
  if (kind === "worried") return `<path class="m-mouth" d="M94 128 q6 -5 12 0" stroke="${INK}" stroke-width="2.8" fill="none" stroke-linecap="round"/>`;
  if (kind === "sleep") return `<path class="m-mouth" d="M96 123 q4 4 8 0" stroke="${INK}" stroke-width="2.4" fill="none" stroke-linecap="round"/>`;
  if (kind === "o") return `<ellipse class="m-mouth" cx="100" cy="125" rx="3.8" ry="4.4" fill="#A9433F"/>`;
  return `<path class="m-mouth" d="M93 122 q7 7 14 0" stroke="${INK}" stroke-width="2.8" fill="none" stroke-linecap="round"/>`;
}

function defs(id: string) {
  return `<defs>
    <radialGradient id="${id}body" cx=".4" cy=".26" r=".88"><stop offset="0" stop-color="#FFFFFF"/><stop offset=".48" stop-color="${C.cream}"/><stop offset=".8" stop-color="#F7E8E0"/><stop offset="1" stop-color="#EBD5CB"/></radialGradient>
    <linearGradient id="${id}shade" x1="0" y1="0" x2="0" y2="1"><stop offset=".58" stop-color="${C.peach}" stop-opacity="0"/><stop offset="1" stop-color="#EFC3B4" stop-opacity=".55"/></linearGradient>
    <linearGradient id="${id}ear" x1=".2" y1="0" x2=".7" y2="1"><stop offset="0" stop-color="#FFFFFF"/><stop offset=".55" stop-color="${C.cream}"/><stop offset="1" stop-color="#EDD8CE"/></linearGradient>
    <linearGradient id="${id}earPink" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${C.pink}" stop-opacity="0"/><stop offset=".55" stop-color="${C.pink}" stop-opacity=".85"/><stop offset="1" stop-color="#F7A3B0"/></linearGradient>
    <radialGradient id="${id}limb" cx=".4" cy=".3" r=".85"><stop offset="0" stop-color="#FFFFFF"/><stop offset=".5" stop-color="${C.cream}"/><stop offset=".85" stop-color="#F1DDD3"/><stop offset="1" stop-color="#E3C6BA"/></radialGradient>
    <radialGradient id="${id}eye" cx=".45" cy=".35" r=".75"><stop offset="0" stop-color="#6B4038"/><stop offset=".7" stop-color="${INK}"/><stop offset="1" stop-color="#2E1B19"/></radialGradient>
    <radialGradient id="${id}heart" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#FFB0AE"/><stop offset="1" stop-color="#F0505C"/></radialGradient>
    <linearGradient id="${id}pillP" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FF8C9B"/><stop offset="1" stop-color="#E5465E"/></linearGradient>
    <linearGradient id="${id}pillW" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFFFFF"/><stop offset="1" stop-color="#EDE3E3"/></linearGradient>
    <linearGradient id="${id}blanket" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9DA6EE"/><stop offset="1" stop-color="#7D86DA"/></linearGradient>
    <filter id="${id}limbShadow" x="-40%" y="-40%" width="180%" height="180%"><feDropShadow dx="0" dy="2" stdDeviation="1.8" flood-color="#C9A091" flood-opacity=".45"/></filter>
    <filter id="${id}soft" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="2.4"/></filter>
    <filter id="${id}blur" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="4"/></filter>
  </defs>`;
}

function ear(side: "l" | "r", id: string) {
  const m = (d: string) => (side === "l" ? d : mirror(d));
  const root = side === "l" ? "63px 66px" : "137px 66px";
  return `<g class="m-ear-${side}" style="transform-origin:${root}"><path d="${m(EAR_L)}" fill="url(#${id}ear)" filter="url(#${id}limbShadow)"/>
    <path d="${m(EAR_L_PINK)}" fill="url(#${id}earPink)" filter="url(#${id}soft)"/>
    <path d="${m("M61 70.2 C 47 66.8 31 75.4 23 94.3")}" stroke="#fff" stroke-width="5" stroke-linecap="round" fill="none" opacity=".8" filter="url(#${id}soft)"/></g>`;
}

/** Inner SVG markup for a state. `id` keeps gradient ids unique per instance.
    props: false → pose and face only · floating: false → keep held props (pill, heart, note) but drop bells, sparkles, bubbles. */
export function momoSvg(state: MascotState, id: string, opts: { props?: boolean; floating?: boolean; eyes?: Pose["eyes"] } = {}) {
  const p = POSES[state];
  const showProps = opts.props !== false;
  const showFloating = showProps && opts.floating !== false;
  return `${defs(id)}
  <ellipse class="m-shadow" cx="100" cy="185" rx="62" ry="7" fill="#B8917F" opacity=".22" filter="url(#${id}soft)"/>
  <g class="m-all"><g class="m-breathe" style="transform-origin:100px 182px">
    <g class="m-feet" filter="url(#${id}limbShadow)"><ellipse cx="76" cy="179" rx="17" ry="9.5" fill="url(#${id}limb)"/><ellipse cx="124" cy="179" rx="17" ry="9.5" fill="url(#${id}limb)"/></g>
    <path class="m-body" d="${BODY}" fill="url(#${id}body)"/>
    <path d="${BODY}" fill="url(#${id}shade)"/>
    <ellipse cx="88" cy="58" rx="22" ry="11" fill="#fff" opacity=".85" filter="url(#${id}blur)"/>
    <g class="m-cheeks" filter="url(#${id}blur)"><ellipse cx="63" cy="128" rx="12.5" ry="8.5" fill="${C.pink}"/><ellipse cx="137" cy="128" rx="12.5" ry="8.5" fill="${C.pink}"/></g>
    <g filter="url(#${id}blur)" opacity=".5"><path d="M64 68 C 56 88, 52 122, 46 158" stroke="#D9B8AA" stroke-width="8" fill="none"/><path d="M136 68 C 144 88, 148 122, 154 158" stroke="#D9B8AA" stroke-width="8" fill="none"/></g>
    <g class="m-ears">${ear("l", id)}${ear("r", id)}</g>
    ${eyes(opts.eyes ?? p.eyes, id)}
    ${p.brows ? `<g class="m-brows" stroke="${INK}" stroke-width="2.8" stroke-linecap="round"><path d="M68 97 L82 93"/><path d="M132 97 L118 93"/></g>` : ""}
    ${mouth(p.mouth)}
    ${showProps && p.propsBehindArms ? p.propsBehindArms(id) : ""}
    ${(p.arms ?? []).map((a) => arm(a, id)).join("")}
  </g></g>
  ${showFloating && p.props ? `<g class="m-props">${p.props(id)}</g>` : ""}`;
}

export const momoViewBox = (crop?: "head") => (crop === "head" ? "20 28 160 160" : "0 0 200 200");

/** Only the floating effects of a state (bell, Zz, sparkles, bubbles, confetti…), drawn over the
    rendered Momo images in the same 0 0 200 200 box. */
export function momoFx(state: MascotState, id: string) {
  const p = POSES[state];
  return p.props ? `${defs(id)}<g class="m-props">${p.props(id)}</g>` : "";
}
