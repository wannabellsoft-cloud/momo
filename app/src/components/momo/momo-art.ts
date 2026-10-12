// Momo mascot vector art (ported from project/momo-kit.js). Pure string builders — no React —
// so scripts/gen-icons.mts can reuse them. `id` prefixes gradient/filter ids to keep them unique per instance.

export const MOMO_STATES = ["idle", "reminder", "waiting", "taken", "refill", "nostock", "sleep", "welcome", "loading", "error"] as const;
export type MomoState = (typeof MOMO_STATES)[number];

const INK = "#3A2A2F";
const HEART = "M100 178 C 66 158, 64 130, 84 127 C 93 126, 99 132, 100 137 C 101 132, 107 126, 116 127 C 136 130, 134 158, 100 178Z";
const EAR = "M78 58 C 62 22, 30 30, 26 64 C 22 98, 30 132, 44 140 C 56 146, 62 128, 64 108 C 66 90, 74 74, 82 66 Z";
const EAR_INNER = "M72 64 C 60 42, 41 45, 38 68 C 35 94, 41 118, 48 126 C 53 130, 55 118, 56 104 C 57 90, 63 78, 73 70 Z";

function eyes(kind: "happy" | "sleep" | "open") {
  if (kind === "happy") return `<g class="eyes"><path d="M73 102 q7 -8 14 0" stroke="${INK}" stroke-width="3.2" fill="none" stroke-linecap="round"/><path d="M113 102 q7 -8 14 0" stroke="${INK}" stroke-width="3.2" fill="none" stroke-linecap="round"/></g>`;
  if (kind === "sleep") return `<g class="eyes"><path d="M73 101 q7 6 14 0" stroke="${INK}" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M113 101 q7 6 14 0" stroke="${INK}" stroke-width="3" fill="none" stroke-linecap="round"/></g>`;
  return `<g class="eyes blink"><ellipse cx="80" cy="100" rx="5.6" ry="6.6" fill="${INK}"/><ellipse cx="120" cy="100" rx="5.6" ry="6.6" fill="${INK}"/><circle cx="82.2" cy="97.4" r="1.9" fill="#fff"/><circle cx="122.2" cy="97.4" r="1.9" fill="#fff"/><circle cx="78.4" cy="102.6" r=".9" fill="#fff" opacity=".7"/><circle cx="118.4" cy="102.6" r=".9" fill="#fff" opacity=".7"/></g>`;
}

function mouth(kind: "o" | "big" | "smile") {
  if (kind === "o") return `<ellipse cx="100" cy="117" rx="2.6" ry="3" fill="#9B6B6F"/>`;
  if (kind === "big") return `<path d="M93 114 q7 9 14 0 q-7 3 -14 0z" fill="#E77E9C"/>`;
  return `<path d="M100 113.5 q-2.6 4.8 -6.6 2.8 M100 113.5 q2.6 4.8 6.6 2.8" stroke="#9B6B6F" stroke-width="1.8" fill="none" stroke-linecap="round"/>`;
}

export function momoSvgMarkup(state: MomoState, crop: "head" | undefined, id: string) {
  const fur = `url(#${id}fur)`;
  const arm = (cx: number, cy: number, rot: number) =>
    `<ellipse cx="${cx}" cy="${cy}" rx="11" ry="15" transform="rotate(${rot} ${cx} ${cy})" fill="${fur}" stroke="#E2C2A6" stroke-width="1"/>`;

  const prop = () => {
    switch (state) {
      case "reminder":
        return `<g class="wiggle">
          <circle cx="83" cy="128" r="7" fill="#F590B0"/><circle cx="117" cy="128" r="7" fill="#F590B0"/>
          <path d="M84 176 l-5 7 M116 176 l5 7" stroke="#E7799C" stroke-width="4" stroke-linecap="round"/>
          <circle cx="100" cy="153" r="25" fill="#F7A2BE"/><circle cx="100" cy="153" r="19" fill="#FFFDFB"/>
          <g stroke="#D9C3CC" stroke-width="1.6" stroke-linecap="round"><path d="M100 137v3M100 166v3M84 153h3M113 153h3"/></g>
          <path d="M100 153 V142 M100 153 L108 157" stroke="#674454" stroke-width="2.4" stroke-linecap="round"/><circle cx="100" cy="153" r="2" fill="#F47FA7"/></g>
          ${arm(75, 156, 28)}${arm(125, 156, -28)}`;
      case "waiting":
        return `<g class="beat"><path d="${HEART}" transform="translate(50 82) scale(.5)" fill="#F590B0"/></g>${arm(86, 160, 40)}${arm(114, 160, -40)}`;
      case "taken":
        return `<defs><radialGradient id="${id}hg" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#FFC2D5"/><stop offset="1" stop-color="#EE7FA3"/></radialGradient></defs>
          <g class="beat"><path d="${HEART}" fill="url(#${id}hg)"/><ellipse cx="88" cy="137" rx="6" ry="3.5" fill="#fff" opacity=".55" transform="rotate(-30 88 137)"/></g>
          ${arm(78, 150, 50)}${arm(122, 150, -50)}`;
      case "refill":
        return `<g><rect x="68" y="138" width="64" height="42" rx="9" fill="#FFFFFF" stroke="#F2C3D3" stroke-width="2"/>
          <rect x="64" y="132" width="72" height="12" rx="6" fill="#FFE1EB" stroke="#F2C3D3" stroke-width="2"/>
          <path d="M100 148v22M89 159h22" stroke="#F47FA7" stroke-width="6" stroke-linecap="round"/></g>
          ${arm(70, 152, 10)}${arm(130, 152, -10)}`;
      case "nostock":
        return `<g transform="rotate(-6 100 156)"><rect x="76" y="130" width="48" height="56" rx="6" fill="#FFFDF7" stroke="#EADBC2" stroke-width="2"/>
          <rect x="90" y="126" width="20" height="8" rx="3" fill="#F7A2BE"/>
          <g stroke="#D8C6B0" stroke-width="2.2" stroke-linecap="round"><path d="M84 146h22M84 156h30M84 166h18"/></g>
          <circle cx="113" cy="146" r="3" fill="#F47FA7"/></g>
          ${arm(76, 160, 30)}${arm(124, 160, -30)}`;
      case "sleep":
        return `<path d="M30 152 C 58 136, 142 136, 170 152 L 174 188 Q 100 198 26 188 Z" fill="#FFC7D9"/>
          <path d="M30 152 C 58 136, 142 136, 170 152" stroke="#FFE3EC" stroke-width="7" fill="none" stroke-linecap="round"/>
          <g fill="#FFE8F0"><circle cx="62" cy="172" r="3"/><circle cx="96" cy="166" r="3"/><circle cx="132" cy="174" r="3"/><circle cx="80" cy="186" r="2.4"/><circle cx="148" cy="164" r="2.4"/><circle cx="116" cy="188" r="2.4"/></g>
          <g class="zz" fill="#A99BD9" font-family="sans-serif" font-weight="800"><text x="150" y="70" font-size="16">z</text><text x="162" y="56" font-size="11">z</text></g>`;
      case "welcome":
        return `${arm(76, 152, 22)}<g class="wave">${arm(166, 126, -50)}</g>`;
      case "error":
        return `<g><circle cx="160" cy="54" r="15" fill="#FFFFFF" stroke="#E9E1FF" stroke-width="2"/><text x="160" y="61" font-size="19" text-anchor="middle" font-family="sans-serif" font-weight="800" fill="#8C7BD6">?</text></g>${arm(76, 152, 22)}${arm(124, 152, -22)}`;
      default:
        return `${arm(76, 152, 22)}${arm(124, 152, -22)}`;
    }
  };

  const eye = state === "taken" || state === "welcome" ? "happy" : state === "sleep" ? "sleep" : "open";
  const mo = state === "error" ? "o" : state === "taken" || state === "welcome" ? "big" : "smile";
  const tilt = state === "error" ? "rotate(-7 100 110)" : "";
  const head = crop === "head";
  const earL = `<path d="${EAR}" fill="${fur}" stroke="#E2C2A6" stroke-width="1"/><path d="${EAR_INNER}" fill="url(#${id}inner)" opacity=".9"/>`;

  return `<defs>
      <radialGradient id="${id}fur" cx=".42" cy=".34" r=".78"><stop offset="0" stop-color="#FFF8EF"/><stop offset=".62" stop-color="#F6E2CD"/><stop offset="1" stop-color="#E6C5A7"/></radialGradient>
      <linearGradient id="${id}inner" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFD9E4"/><stop offset="1" stop-color="#F6A9C0"/></linearGradient>
      <filter id="${id}fuzz" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="2" seed="4" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="2.6"/></filter>
    </defs>
    ${head ? "" : '<ellipse cx="100" cy="193" rx="54" ry="5.5" fill="#B9927A" opacity=".18"/>'}
    <g class="${state === "loading" ? "bounce" : ""}"><g class="breathe">
      <g filter="url(#${id}fuzz)">
        ${head ? "" : `<ellipse cx="100" cy="153" rx="50" ry="40" fill="${fur}" stroke="#E2C2A6" stroke-width="1"/>
        <ellipse cx="73" cy="186" rx="17" ry="10" fill="${fur}" stroke="#E2C2A6" stroke-width="1"/><ellipse cx="127" cy="186" rx="17" ry="10" fill="${fur}" stroke="#E2C2A6" stroke-width="1"/>`}
        <g transform="${tilt}">
          <g class="earL">${earL}</g>
          <g transform="translate(200 0) scale(-1 1)"><g class="earR">${earL}</g></g>
          <ellipse cx="100" cy="99" rx="60" ry="50" fill="${fur}" stroke="#E2C2A6" stroke-width="1"/>
          <path d="M90 52 q6 -9 10 -2 q5 -8 11 1" fill="#FBEBDC" stroke="#E2C2A6" stroke-width="1"/>
        </g>
      </g>
      ${head ? "" : '<ellipse cx="62" cy="190" rx="6" ry="3.4" fill="#F6B3C6"/><ellipse cx="138" cy="190" rx="6" ry="3.4" fill="#F6B3C6"/>'}
      <g transform="${tilt}">
        <ellipse cx="70" cy="113" rx="10" ry="6" fill="#F7A3BC" opacity=".42"/><ellipse cx="130" cy="113" rx="10" ry="6" fill="#F7A3BC" opacity=".42"/>
        ${eyes(eye)}
        <path d="M95.5 107.5 q4.5 -2.2 9 0 q-1.2 4.2 -4.5 5.3 q-3.3 -1.1 -4.5 -5.3z" fill="#EF8AA8"/>
        ${mouth(mo)}
      </g>
      ${head ? "" : prop()}
    </g></g>`;
}

export const momoViewBox = (crop?: "head") => (crop === "head" ? "16 22 168 132" : "0 0 200 200");
