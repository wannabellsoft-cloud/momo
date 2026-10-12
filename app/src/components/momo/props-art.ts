// Momo's 2.5D props as vectors, in the soft matte "clay" style of the reference props (gold bell and
// alarm clock). Pure SVG strings so they work both inside Momo's effect layer and as standalone icons.
// Every id is prefixed so several copies can live on one page.

const GOLD = { hi: "#FFF0C2", mid: "#FFD36E", lo: "#E9A93E", deep: "#C98724", inside: "#B9782A" };

function goldDefs(id: string) {
  return `<radialGradient id="${id}g" cx=".32" cy=".24" r=".95"><stop offset="0" stop-color="${GOLD.hi}"/><stop offset=".38" stop-color="${GOLD.mid}"/><stop offset=".82" stop-color="${GOLD.lo}"/><stop offset="1" stop-color="${GOLD.deep}"/></radialGradient>
    <linearGradient id="${id}r" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFD978"/><stop offset=".55" stop-color="${GOLD.lo}"/><stop offset="1" stop-color="${GOLD.deep}"/></linearGradient>
    <radialGradient id="${id}k" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="${GOLD.hi}"/><stop offset=".6" stop-color="${GOLD.mid}"/><stop offset="1" stop-color="${GOLD.lo}"/></radialGradient>
    <filter id="${id}b" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="1.6"/></filter>`;
}

/** Bell, viewBox 0 0 100 100. */
export function bellArt(id: string) {
  return `<defs>${goldDefs(id)}</defs>
    <g transform="rotate(-10 50 55)">
    <path d="M50 14 C 33 14 25.5 27 24.6 44 C 23.8 59 21.5 68 14 76 C 11.5 78.7 13 83 17 83 H83 C 87 83 88.5 78.7 86 76 C 78.5 68 76.2 59 75.4 44 C 74.5 27 67 14 50 14 Z" fill="url(#${id}g)"/>
    <path d="M71 30 C 75 38 75.6 52 76.4 62 C 77 69 80 74 85 78" stroke="${GOLD.deep}" stroke-opacity=".35" stroke-width="5" fill="none" filter="url(#${id}b)"/>
    <ellipse cx="50" cy="81.5" rx="41" ry="8" fill="url(#${id}r)"/>
    <ellipse cx="50" cy="82.6" rx="33" ry="5.4" fill="${GOLD.inside}"/>
    <ellipse cx="50" cy="81.4" rx="30" ry="3.6" fill="#9A6220" opacity=".55"/>
    <circle cx="50" cy="87" r="7.6" fill="url(#${id}k)"/>
    <circle cx="47.6" cy="84.8" r="2" fill="#fff" opacity=".6"/>
    <path d="M9 81.5 C 10 87 21 91 50 91 C 79 91 90 87 91 81.5 C 91 86.6 84 92.5 50 92.5 C 16 92.5 9 86.6 9 81.5 Z" fill="${GOLD.deep}" opacity=".65"/>
    <path d="M13 79 C 25 75.2 75 75.2 87 79" stroke="#FFE9A8" stroke-width="2" stroke-linecap="round" fill="none" opacity=".85"/>
    <path d="M37 21 C 30 28 28.5 40 28 52" stroke="#fff" stroke-width="6" stroke-linecap="round" fill="none" opacity=".55" filter="url(#${id}b)"/>
    <ellipse cx="38" cy="26" rx="4" ry="6" fill="#fff" opacity=".6" transform="rotate(28 38 26)"/>
    <path d="M44 14.5 C 44 9.6 46.6 7 50 7 C 53.4 7 56 9.6 56 14.5 Z" fill="url(#${id}k)"/>
    <circle cx="50" cy="7.5" r="5.2" fill="url(#${id}k)"/>
    <circle cx="48.4" cy="5.8" r="1.6" fill="#fff" opacity=".75"/>
    </g>`;
}

/** Alarm clock showing three o'clock, viewBox 0 0 100 100. */
export function alarmArt(id: string) {
  const ticks = Array.from({ length: 12 }, (_, i) => {
    const a = (i * Math.PI) / 6;
    const r1 = i % 3 ? 20.5 : 19, r2 = 23;
    const x1 = 50 + r1 * Math.sin(a), y1 = 57 - r1 * Math.cos(a), x2 = 50 + r2 * Math.sin(a), y2 = 57 - r2 * Math.cos(a);
    return `<path d="M${x1.toFixed(2)} ${y1.toFixed(2)} L${x2.toFixed(2)} ${y2.toFixed(2)}" stroke="#8B8178" stroke-width="${i % 3 ? 1.6 : 2.6}" stroke-linecap="round"/>`;
  }).join("");
  const bellCap = (x: number, rot: number) => `<g transform="translate(${x} 21) rotate(${rot})">
      <path d="M-13 6 C -13 -4 -7.5 -10 0 -10 C 7.5 -10 13 -4 13 6 C 13 7.6 11.6 8.4 10 8.4 H-10 C -11.6 8.4 -13 7.6 -13 6 Z" fill="url(#${id}g)"/>
      <ellipse cx="-4.5" cy="-4" rx="3" ry="2" fill="#fff" opacity=".6" transform="rotate(-25 -4.5 -4)"/>
      <circle cx="0" cy="-11.5" r="3" fill="url(#${id}k)"/></g>`;
  return `<defs>${goldDefs(id)}
      <radialGradient id="${id}f" cx=".42" cy=".36" r=".75"><stop offset="0" stop-color="#FFFFFF"/><stop offset=".8" stop-color="#FAF5EE"/><stop offset="1" stop-color="#EADFD2"/></radialGradient></defs>
    <g transform="translate(29 88) rotate(30)"><rect x="-4" y="-9" width="8" height="14" rx="4" fill="url(#${id}r)"/></g>
    <g transform="translate(71 88) rotate(-30)"><rect x="-4" y="-9" width="8" height="14" rx="4" fill="url(#${id}r)"/></g>
    ${bellCap(27, -28)}${bellCap(73, 28)}
    <circle cx="50" cy="22" r="4" fill="url(#${id}k)"/>
    <circle cx="50" cy="57" r="33" fill="url(#${id}g)"/>
    <path d="M74 36 C 82 46 83 62 76 74" stroke="${GOLD.deep}" stroke-opacity=".35" stroke-width="6" fill="none" filter="url(#${id}b)"/>
    <circle cx="50" cy="57" r="26.5" fill="${GOLD.lo}" opacity=".55"/>
    <circle cx="50" cy="57.6" r="25.5" fill="url(#${id}f)"/>
    ${ticks}
    <path d="M50 57 L50 38.5" stroke="#4E4640" stroke-width="3" stroke-linecap="round"/>
    <path d="M50 57 L64 57" stroke="#4E4640" stroke-width="3.4" stroke-linecap="round"/>
    <circle cx="50" cy="57" r="3.2" fill="#4E4640"/><circle cx="49.2" cy="56.2" r="1" fill="#fff" opacity=".6"/>
    <path d="M30 40 C 25 46 23.5 54 24.5 61" stroke="#fff" stroke-width="5" stroke-linecap="round" fill="none" opacity=".5" filter="url(#${id}b)"/>
    <ellipse cx="33" cy="36" rx="3.6" ry="5.4" fill="#fff" opacity=".55" transform="rotate(40 33 36)"/>`;
}

/** Standalone <svg> markup for a prop (used by the React <PropArt /> and the effect layer). */
export function propSvg(name: "bell" | "alarm", id: string, attrs = "") {
  return `<svg viewBox="0 0 100 100" ${attrs}>${name === "bell" ? bellArt(id) : alarmArt(id)}</svg>`;
}
