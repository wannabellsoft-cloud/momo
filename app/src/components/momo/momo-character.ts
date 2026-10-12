// Momo 2.5D — character master (single source of truth for shape, colour, expressions and props).
//
// A vector re-creation of the reference sheet ("Momo — Your Friendly Medication Buddy"): a soft
// cream mochi/sprout with two sage leaves. The reference itself is a flat raster and cannot be rigged,
// so Momo is redrawn as layered SVG — every part is its own group (class names below) so CSS can
// animate it. Pure string builders (no React): used by <MomoMascot /> and scripts/gen-icons.mts.
//
// Layers (back → front): shadow · feet · arms(back) · body · body-shade · leaves · cheeks · eyes ·
// brows · mouth · arms(front) · props.   viewBox 0 0 200 200, ground at y≈184.

export const MASCOT_STATES = ["idle", "reminder", "happy", "missed", "sleeping", "refill", "loading", "success"] as const;
export type MascotState = (typeof MASCOT_STATES)[number];

export const MOMO_COLORS = {
  cream: "#FFF9F3",
  peach: "#FFDCCB",
  pink: "#FFBFC7",
  sage: "#A8CFAF",
  brown: "#59443D",
  background: "#FFFAF6",
} as const;

export const MASCOT_ALT: Record<MascotState, string> = {
  idle: "โมโม่ยิ้มอยู่",
  reminder: "โมโม่ถือแคปซูลยาและโบกมือเตือน",
  happy: "โมโม่ยิ้มกอดหัวใจ",
  missed: "โมโม่ทำหน้าเป็นห่วง",
  sleeping: "โมโม่นอนหลับห่มผ้า",
  refill: "โมโม่ถือโน้ตรายการซื้อยา",
  loading: "โมโม่ลอยตัวรออยู่",
  success: "โมโม่กระโดดดีใจ",
};

const C = MOMO_COLORS;
const BODY = "M100 44 C 143 44 168 74 170 112 C 172 148 163 176 128 178.5 C 112 179.5 88 179.5 72 178.5 C 37 176 28 148 30 112 C 32 74 57 44 100 44 Z";
const HEART = "M100 178 C 66 158, 64 130, 84 127 C 93 126, 99 132, 100 137 C 101 132, 107 126, 116 127 C 136 130, 134 158, 100 178Z";

type Arm = { cx: number; cy: number; rot: number; rx?: number; ry?: number; cls?: string; origin?: [number, number] };
type Pose = {
  eyes: "open" | "happy" | "sleep" | "worried";
  mouth: "smile" | "open" | "worried" | "sleep" | "o";
  brows?: boolean;
  armsBack?: Arm[];
  armsFront?: Arm[];
  propsBehindArms?: (id: string) => string;
  props?: (id: string) => string;
};

const restL: Arm = { cx: 40, cy: 144, rot: 22, rx: 12, ry: 15.5, cls: "m-arm-l", origin: [48, 132] };
const restR: Arm = { cx: 160, cy: 144, rot: -22, rx: 12, ry: 15.5, cls: "m-arm-r", origin: [152, 132] };

const sparkle = (x: number, y: number, s: number, c: string, cls = "m-spark") =>
  `<path class="${cls}" style="transform-origin:${x}px ${y}px" d="M${x} ${y - s}Q${x + s * 0.18} ${y - s * 0.18} ${x + s} ${y}Q${x + s * 0.18} ${y + s * 0.18} ${x} ${y + s}Q${x - s * 0.18} ${y + s * 0.18} ${x - s} ${y}Q${x - s * 0.18} ${y - s * 0.18} ${x} ${y - s}Z" fill="${c}"/>`;
// Note: never put a CSS transform-origin/animation on an element that has an SVG transform attribute —
// CSS transforms replace it. Animate a wrapping <g> instead.
const heart = (cx: number, cy: number, s: number, fill: string, cls = "") =>
  `<g class="${cls}" style="transform-origin:${cx}px ${cy}px"><path d="${HEART}" transform="translate(${cx - 100 * s} ${cy - 152 * s}) scale(${s})" fill="${fill}"/></g>`;
const motion = (x: number, y: number, c = "#F6C76B") => `<g class="m-motion" stroke="${c}" stroke-width="3" stroke-linecap="round" fill="none"><path d="M${x} ${y}l6 -7M${x + 5} ${y + 9}l9 -2M${x - 5} ${y - 4}l1 -9"/></g>`;

const POSES: Record<MascotState, Pose> = {
  idle: { eyes: "open", mouth: "smile", armsFront: [restL, restR], props: () => motion(150, 54) },
  reminder: {
    eyes: "open",
    mouth: "open",
    armsFront: [
      restL,
      { cx: 84, cy: 150, rot: 10, rx: 12, ry: 11 },
      { cx: 172, cy: 106, rot: -32, rx: 11, ry: 15.5, cls: "m-arm-wave", origin: [158, 124] },
    ],
    propsBehindArms: (id) => `<g class="m-prop" style="transform-origin:100px 146px"><g transform="translate(100 146) rotate(-32)">
        <rect x="-22" y="-10" width="44" height="20" rx="10" fill="url(#${id}pillW)" stroke="#F1D9D9" stroke-width="1.2"/>
        <path d="M-12 -10 H0 V10 H-12 A10 10 0 0 1 -12 -10 Z" fill="url(#${id}pillP)"/>
        <rect x="-16" y="-6.5" width="12" height="3.4" rx="1.7" fill="#fff" opacity=".55"/></g></g>`,
    props: () => `<g class="m-ring" style="transform-origin:160px 40px"><path d="M152 46 a8 8 0 0 1 16 0 v6 l3 4 h-22 l3 -4z" fill="#FFD27A"/><circle cx="160" cy="59" r="3" fill="#F2B84B"/></g>` + motion(176, 66, "#F6C76B"),
  },
  happy: {
    eyes: "happy",
    mouth: "open",
    armsBack: [],
    propsBehindArms: (id) => heart(100, 146, 0.62, `url(#${id}heart)`, "m-prop m-beat"),
    armsFront: [
      { cx: 78, cy: 148, rot: 30, rx: 12, ry: 12 },
      { cx: 122, cy: 148, rot: -30, rx: 12, ry: 12 },
    ],
    props: () => sparkle(46, 66, 6, "#F6C76B") + sparkle(158, 56, 5, C.pink) + motion(150, 74),
  },
  missed: {
    eyes: "worried",
    mouth: "worried",
    brows: true,
    armsFront: [
      { cx: 88, cy: 160, rot: 20, rx: 11, ry: 11 },
      { cx: 112, cy: 160, rot: -20, rx: 11, ry: 11 },
    ],
    props: () => `<g class="m-float-slow"><path d="M146 36 h28 a10 10 0 0 1 10 10 v6 a10 10 0 0 1 -10 10 h-18 l-8 7 v-7 h-2 a10 10 0 0 1 -10 -10 v-6 a10 10 0 0 1 10 -10z" fill="#fff" stroke="#E7DDF6" stroke-width="1.5"/>
      <g fill="#A99BD9"><circle class="m-dot" cx="152" cy="49" r="2.6"/><circle class="m-dot d2" cx="160" cy="49" r="2.6"/><circle class="m-dot d3" cx="168" cy="49" r="2.6"/></g></g>`,
  },
  sleeping: {
    eyes: "sleep",
    mouth: "sleep",
    armsBack: [],
    props: (id) => `<g class="m-prop"><path d="M18 146 C 58 130, 142 130, 182 146 L 186 196 L 14 196 Z" fill="url(#${id}blanket)"/>
        <path d="M18 146 C 58 130, 142 130, 182 146" stroke="#F1ECFF" stroke-width="7" fill="none" stroke-linecap="round"/>
        <g fill="#F4F0FF" opacity=".9"><circle cx="54" cy="162" r="2.6"/><circle cx="92" cy="156" r="2.6"/><circle cx="132" cy="164" r="2.6"/><circle cx="74" cy="180" r="2.2"/><circle cx="152" cy="178" r="2.2"/><circle cx="112" cy="184" r="2.2"/></g></g>
      <g class="m-zz" fill="#A99BD9" font-family="sans-serif" font-weight="800"><text x="144" y="52" font-size="17">z</text><text x="158" y="38" font-size="12">z</text><text x="168" y="27" font-size="8">z</text></g>
      <path class="m-spark" style="transform-origin:42px 42px" d="M42 30 A12 12 0 1 0 54 46 A9 12 0 1 1 42 30Z" fill="#F9D774"/>`,
  },
  refill: {
    eyes: "open",
    mouth: "smile",
    propsBehindArms: () => `<g class="m-prop" style="transform-origin:156px 138px"><g transform="translate(158 136) rotate(8)">
        <rect x="-19" y="-24" width="38" height="48" rx="6" fill="#E8CDB6"/><rect x="-15" y="-19" width="30" height="40" rx="3.5" fill="#FFFDF8"/>
        <rect x="-7" y="-27" width="14" height="7" rx="3" fill="#C9A98E"/>
        <g stroke-linecap="round" stroke-width="2"><path d="M-10 -10 l3 3 l5 -6" stroke="#7FB58A" fill="none"/><path d="M-10 2 l3 3 l5 -6" stroke="#7FB58A" fill="none"/><path d="M1 -9 h9 M1 3 h9 M-9 14 h18" stroke="#D9C7B6"/></g>
        <rect x="2" y="10" width="9" height="4.6" rx="2.3" fill="#FF9DAE" transform="rotate(-20 6 12)"/></g></g>
      <g class="m-ring" style="transform-origin:172px 40px"><circle cx="172" cy="40" r="11" fill="#FF8C93"/><path d="M172 33 v9" stroke="#fff" stroke-width="3" stroke-linecap="round"/><circle cx="172" cy="46" r="1.8" fill="#fff"/></g>`,
    armsFront: [restL, { cx: 146, cy: 148, rot: -10, rx: 11.5, ry: 12 }],
  },
  loading: {
    eyes: "open",
    mouth: "o",
    armsFront: [restL, restR],
    props: () => `<g fill="${C.sage}"><circle class="m-dot" cx="88" cy="196" r="3"/><circle class="m-dot d2" cx="100" cy="196" r="3"/><circle class="m-dot d3" cx="112" cy="196" r="3"/></g>`,
  },
  success: {
    eyes: "happy",
    mouth: "open",
    armsFront: [
      { cx: 36, cy: 104, rot: -32, rx: 12, ry: 16, cls: "m-arm-up-l", origin: [46, 122] },
      { cx: 164, cy: 104, rot: 32, rx: 12, ry: 16, cls: "m-arm-up-r", origin: [154, 122] },
    ],
    props: () =>
      [[28, 50, "#FFBFC7"], [172, 60, "#B8DEFA"], [22, 106, "#FFE08A"], [178, 112, "#C9BBF7"], [44, 26, "#A8CFAF"], [154, 22, "#FFBFC7"]]
        .map(([x, y, c], i) => (i % 2 ? `<g class="m-conf"><rect x="${x}" y="${y}" width="7" height="3.4" rx="1.7" fill="${c}" transform="rotate(${30 * i} ${x} ${y})"/></g>` : `<circle class="m-conf" cx="${x}" cy="${y}" r="3.2" fill="${c}"/>`))
        .join("") + sparkle(34, 76, 6.5, "#F6C76B") + sparkle(168, 84, 6, C.pink) + heart(152, 40, 0.2, "#FF9DB0", "m-beat"),
  },
};

function arm(a: Arm, id: string) {
  const rx = a.rx ?? 11.5, ry = a.ry ?? 16;
  const origin = a.origin ? ` style="transform-origin:${a.origin[0]}px ${a.origin[1]}px"` : "";
  return `<g class="m-arm ${a.cls ?? ""}"${origin}><ellipse filter="url(#${id}limbShadow)" cx="${a.cx}" cy="${a.cy}" rx="${rx}" ry="${ry}" transform="rotate(${a.rot} ${a.cx} ${a.cy})" fill="url(#${id}limb)"/>
    <ellipse cx="${a.cx - 2}" cy="${a.cy - ry * 0.35}" rx="${rx * 0.45}" ry="${ry * 0.3}" transform="rotate(${a.rot} ${a.cx} ${a.cy})" fill="#fff" opacity=".55"/></g>`;
}

function eyes(kind: Pose["eyes"]) {
  const ink = C.brown;
  if (kind === "happy") return `<g class="m-eyes"><path d="M77 104 q7 -9 14 0" stroke="${ink}" stroke-width="3.6" fill="none" stroke-linecap="round"/><path d="M109 104 q7 -9 14 0" stroke="${ink}" stroke-width="3.6" fill="none" stroke-linecap="round"/></g>`;
  if (kind === "sleep") return `<g class="m-eyes"><path d="M77 102 q7 6 14 0" stroke="${ink}" stroke-width="3.2" fill="none" stroke-linecap="round"/><path d="M109 102 q7 6 14 0" stroke="${ink}" stroke-width="3.2" fill="none" stroke-linecap="round"/></g>`;
  const dy = kind === "worried" ? 2 : 0;
  return `<g class="m-eyes m-blink" style="transform-origin:100px ${102 + dy}px">
    <ellipse cx="84" cy="${102 + dy}" rx="5.4" ry="7" fill="${ink}"/><ellipse cx="116" cy="${102 + dy}" rx="5.4" ry="7" fill="${ink}"/>
    <circle cx="85.8" cy="${98.6 + dy}" r="1.9" fill="#fff"/><circle cx="117.8" cy="${98.6 + dy}" r="1.9" fill="#fff"/></g>`;
}

function mouth(kind: Pose["mouth"]) {
  const ink = C.brown;
  if (kind === "open") return `<g class="m-mouth"><path d="M92 113 Q100 126 108 113 Z" fill="#B9505F"/><ellipse cx="100" cy="119.5" rx="4.2" ry="2.4" fill="#FF97A6"/></g>`;
  if (kind === "worried") return `<path class="m-mouth" d="M94 120 q6 -5 12 0" stroke="${ink}" stroke-width="2.6" fill="none" stroke-linecap="round"/>`;
  if (kind === "sleep") return `<ellipse class="m-mouth" cx="100" cy="117" rx="2.6" ry="2" fill="${ink}" opacity=".75"/>`;
  if (kind === "o") return `<ellipse class="m-mouth" cx="100" cy="117" rx="3.2" ry="3.6" fill="#B9505F"/>`;
  return `<path class="m-mouth" d="M94 113.5 q6 6.5 12 0" stroke="${ink}" stroke-width="2.8" fill="none" stroke-linecap="round"/>`;
}

function defs(id: string) {
  return `<defs>
    <radialGradient id="${id}body" cx=".38" cy=".3" r=".85"><stop offset="0" stop-color="#FFFFFF"/><stop offset=".5" stop-color="${C.cream}"/><stop offset=".82" stop-color="#FBEBE0"/><stop offset="1" stop-color="#F1DCCF"/></radialGradient>
    <linearGradient id="${id}shade" x1="0" y1="0" x2="0" y2="1"><stop offset=".6" stop-color="${C.peach}" stop-opacity="0"/><stop offset="1" stop-color="${C.peach}" stop-opacity=".5"/></linearGradient>
    <radialGradient id="${id}limb" cx=".4" cy=".3" r=".9"><stop offset="0" stop-color="#FFFFFF"/><stop offset=".6" stop-color="${C.cream}"/><stop offset="1" stop-color="#EFD8CB"/></radialGradient>
    <linearGradient id="${id}leaf" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#C6E3C9"/><stop offset=".6" stop-color="${C.sage}"/><stop offset="1" stop-color="#86B48F"/></linearGradient>
    <radialGradient id="${id}heart" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#FFD2D8"/><stop offset="1" stop-color="#FF8C9F"/></radialGradient>
    <linearGradient id="${id}pillP" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFA6B4"/><stop offset="1" stop-color="#F26C84"/></linearGradient>
    <linearGradient id="${id}pillW" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFFFFF"/><stop offset="1" stop-color="#F6ECEC"/></linearGradient>
    <linearGradient id="${id}blanket" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#E4DCFA"/><stop offset="1" stop-color="#C9BCF0"/></linearGradient>
    <filter id="${id}limbShadow" x="-40%" y="-40%" width="180%" height="180%"><feDropShadow dx="0" dy="1.6" stdDeviation="1.6" flood-color="#C99A86" flood-opacity=".45"/></filter>
    <filter id="${id}soft" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="2.2"/></filter>
    <filter id="${id}blur" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="5"/></filter>
  </defs>`;
}

/** Inner SVG markup for a state. `id` keeps gradient ids unique per instance. */
export function momoSvg(state: MascotState, id: string, opts: { props?: boolean } = {}) {
  const p = POSES[state];
  const showProps = opts.props !== false;
  const body = `
    <g class="m-leaves" transform="translate(0 7)">
      <g class="m-leaf-l" style="transform-origin:100px 38px"><path d="M99 39 C 90 24 74 18 64 24 C 64 37 80 45 99 39 Z" fill="url(#${id}leaf)"/><path d="M97 37 C 86 30 76 27 68 26" stroke="#fff" stroke-opacity=".5" stroke-width="1.4" fill="none" stroke-linecap="round"/></g>
      <g class="m-leaf-r" style="transform-origin:100px 38px"><path d="M101 39 C 108 22 124 13 138 18 C 140 33 122 44 101 39 Z" fill="url(#${id}leaf)"/><path d="M103 37 C 113 28 124 22 134 20" stroke="#fff" stroke-opacity=".5" stroke-width="1.4" fill="none" stroke-linecap="round"/></g>
    </g>
    <path class="m-body" d="${BODY}" fill="url(#${id}body)"/>
    <path d="${BODY}" fill="url(#${id}shade)"/>
    <ellipse cx="72" cy="70" rx="18" ry="11" fill="#fff" opacity=".75" filter="url(#${id}soft)"/>
    <g class="m-cheeks" filter="url(#${id}soft)"><ellipse cx="64" cy="117" rx="12" ry="7.5" fill="${C.pink}" opacity=".85"/><ellipse cx="136" cy="117" rx="12" ry="7.5" fill="${C.pink}" opacity=".85"/></g>
    ${eyes(p.eyes)}
    ${p.brows ? `<g class="m-brows" stroke="${C.brown}" stroke-width="2.6" stroke-linecap="round"><path d="M76 92 L88 88"/><path d="M124 92 L112 88"/></g>` : ""}
    ${mouth(p.mouth)}`;

  return `${defs(id)}
  <ellipse class="m-shadow" cx="100" cy="184" rx="54" ry="7" fill="#B8917F" opacity=".22" filter="url(#${id}soft)"/>
  <g class="m-all"><g class="m-breathe" style="transform-origin:100px 180px">
    <g class="m-feet" filter="url(#${id}limbShadow)"><ellipse cx="78" cy="178" rx="18" ry="9.5" fill="url(#${id}limb)"/><ellipse cx="122" cy="178" rx="18" ry="9.5" fill="url(#${id}limb)"/></g>
    ${(p.armsBack ?? []).map((a) => arm(a, id)).join("")}
    ${body}
    ${showProps && p.propsBehindArms ? p.propsBehindArms(id) : ""}
    ${(p.armsFront ?? []).map((a) => arm(a, id)).join("")}
  </g></g>
  ${showProps && p.props ? `<g class="m-props">${p.props(id)}</g>` : ""}`;
}

export const momoViewBox = (crop?: "head") => (crop === "head" ? "26 14 148 148" : "0 0 200 200");
