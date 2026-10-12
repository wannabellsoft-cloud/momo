/* Momo kit — <momo-bunny> mascot + <momo-icon> icon set.
   Swap in real renders: window.MOMO_RENDERS = { idle: 'assets/momo-idle.png', reminder: '...', ... }
   or set src="..." on a single <momo-bunny>. Vector art is the fallback. */
(function () {
  const INK = '#3A2A2F';
  const HEART = 'M100 178 C 66 158, 64 130, 84 127 C 93 126, 99 132, 100 137 C 101 132, 107 126, 116 127 C 136 130, 134 158, 100 178Z';
  const STATES = ['idle', 'reminder', 'waiting', 'taken', 'refill', 'nostock', 'sleep', 'welcome', 'loading', 'error'];

  function eyes(kind) {
    if (kind === 'happy') return `<g class="eyes"><path d="M73 102 q7 -8 14 0" stroke="${INK}" stroke-width="3.2" fill="none" stroke-linecap="round"/><path d="M113 102 q7 -8 14 0" stroke="${INK}" stroke-width="3.2" fill="none" stroke-linecap="round"/></g>`;
    if (kind === 'sleep') return `<g class="eyes"><path d="M73 101 q7 6 14 0" stroke="${INK}" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M113 101 q7 6 14 0" stroke="${INK}" stroke-width="3" fill="none" stroke-linecap="round"/></g>`;
    return `<g class="eyes blink"><ellipse cx="80" cy="100" rx="5.6" ry="6.6" fill="${INK}"/><ellipse cx="120" cy="100" rx="5.6" ry="6.6" fill="${INK}"/><circle cx="82.2" cy="97.4" r="1.9" fill="#fff"/><circle cx="122.2" cy="97.4" r="1.9" fill="#fff"/><circle cx="78.4" cy="102.6" r=".9" fill="#fff" opacity=".7"/><circle cx="118.4" cy="102.6" r=".9" fill="#fff" opacity=".7"/></g>`;
  }
  function mouth(kind) {
    if (kind === 'o') return `<ellipse cx="100" cy="117" rx="2.6" ry="3" fill="#9B6B6F"/>`;
    if (kind === 'big') return `<path d="M93 114 q7 9 14 0 q-7 3 -14 0z" fill="#E77E9C"/>`;
    return `<path d="M100 113.5 q-2.6 4.8 -6.6 2.8 M100 113.5 q2.6 4.8 6.6 2.8" stroke="#9B6B6F" stroke-width="1.8" fill="none" stroke-linecap="round"/>`;
  }
  const arm = (cx, cy, rot, cls = '') => `<ellipse class="${cls}" cx="${cx}" cy="${cy}" rx="11" ry="15" transform="rotate(${rot} ${cx} ${cy})" fill="url(#fur)" stroke="#E2C2A6" stroke-width="1"/>`;

  function prop(state) {
    switch (state) {
      case 'reminder': return `<g class="wiggle">
        <circle cx="83" cy="128" r="7" fill="#F590B0"/><circle cx="117" cy="128" r="7" fill="#F590B0"/>
        <path d="M84 176 l-5 7 M116 176 l5 7" stroke="#E7799C" stroke-width="4" stroke-linecap="round"/>
        <circle cx="100" cy="153" r="25" fill="#F7A2BE"/><circle cx="100" cy="153" r="19" fill="#FFFDFB"/>
        <g stroke="#D9C3CC" stroke-width="1.6" stroke-linecap="round"><path d="M100 137v3M100 166v3M84 153h3M113 153h3"/></g>
        <path d="M100 153 V142 M100 153 L108 157" stroke="#674454" stroke-width="2.4" stroke-linecap="round"/><circle cx="100" cy="153" r="2" fill="#F47FA7"/></g>
        ${arm(75, 156, 28)}${arm(125, 156, -28)}`;
      case 'waiting': return `<g class="beat"><path d="${HEART}" transform="translate(50 82) scale(.5)" fill="#F590B0"/></g>${arm(86, 160, 40)}${arm(114, 160, -40)}`;
      case 'taken': return `<defs><radialGradient id="hg" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#FFC2D5"/><stop offset="1" stop-color="#EE7FA3"/></radialGradient></defs>
        <g class="beat"><path d="${HEART}" fill="url(#hg)"/><ellipse cx="88" cy="137" rx="6" ry="3.5" fill="#fff" opacity=".55" transform="rotate(-30 88 137)"/></g>
        ${arm(78, 150, 50)}${arm(122, 150, -50)}`;
      case 'refill': return `<g><rect x="68" y="138" width="64" height="42" rx="9" fill="#FFFFFF" stroke="#F2C3D3" stroke-width="2"/>
        <rect x="64" y="132" width="72" height="12" rx="6" fill="#FFE1EB" stroke="#F2C3D3" stroke-width="2"/>
        <path d="M100 148v22M89 159h22" stroke="#F47FA7" stroke-width="6" stroke-linecap="round"/></g>
        ${arm(70, 152, 10)}${arm(130, 152, -10)}`;
      case 'nostock': return `<g transform="rotate(-6 100 156)"><rect x="76" y="130" width="48" height="56" rx="6" fill="#FFFDF7" stroke="#EADBC2" stroke-width="2"/>
        <rect x="90" y="126" width="20" height="8" rx="3" fill="#F7A2BE"/>
        <g stroke="#D8C6B0" stroke-width="2.2" stroke-linecap="round"><path d="M84 146h22M84 156h30M84 166h18"/></g>
        <circle cx="113" cy="146" r="3" fill="#F47FA7"/></g>
        ${arm(76, 160, 30)}${arm(124, 160, -30)}`;
      case 'sleep': return `<path d="M30 152 C 58 136, 142 136, 170 152 L 174 188 Q 100 198 26 188 Z" fill="#FFC7D9"/>
        <path d="M30 152 C 58 136, 142 136, 170 152" stroke="#FFE3EC" stroke-width="7" fill="none" stroke-linecap="round"/>
        <g fill="#FFE8F0"><circle cx="62" cy="172" r="3"/><circle cx="96" cy="166" r="3"/><circle cx="132" cy="174" r="3"/><circle cx="80" cy="186" r="2.4"/><circle cx="148" cy="164" r="2.4"/><circle cx="116" cy="188" r="2.4"/></g>
        <g class="zz" fill="#A99BD9" font-family="sans-serif" font-weight="800"><text x="150" y="70" font-size="16">z</text><text x="162" y="56" font-size="11">z</text></g>`;
      case 'welcome': return `${arm(76, 152, 22)}<g class="wave">${arm(166, 126, -50)}</g>`;
      case 'error': return `<g><circle cx="160" cy="54" r="15" fill="#FFFFFF" stroke="#E9E1FF" stroke-width="2"/><text x="160" y="61" font-size="19" text-anchor="middle" font-family="sans-serif" font-weight="800" fill="#8C7BD6">?</text></g>${arm(76, 152, 22)}${arm(124, 152, -22)}`;
      default: return `${arm(76, 152, 22)}${arm(124, 152, -22)}`;
    }
  }

  function svg(state, crop) {
    const eye = state === 'taken' || state === 'welcome' ? 'happy' : state === 'sleep' ? 'sleep' : 'open';
    const mo = state === 'error' ? 'o' : state === 'taken' || state === 'welcome' ? 'big' : 'smile';
    const vb = crop === 'head' ? '16 22 168 132' : '0 0 200 200';
    const tilt = state === 'error' ? 'rotate(-7 100 110)' : '';
    const showProp = crop !== 'head';
    return `<svg viewBox="${vb}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Momo ${state}">
    <defs>
      <radialGradient id="fur" cx=".42" cy=".34" r=".78"><stop offset="0" stop-color="#FFF8EF"/><stop offset=".62" stop-color="#F6E2CD"/><stop offset="1" stop-color="#E6C5A7"/></radialGradient>
      <linearGradient id="inner" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFD9E4"/><stop offset="1" stop-color="#F6A9C0"/></linearGradient>
      <filter id="fuzz" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="2" seed="4" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="2.6"/></filter>
    </defs>
    ${crop === 'head' ? '' : '<ellipse cx="100" cy="193" rx="54" ry="5.5" fill="#B9927A" opacity=".18"/>'}
    <g class="${state === 'loading' ? 'bounce' : ''}">
    <g class="breathe">
      <g filter="url(#fuzz)">
        ${crop === 'head' ? '' : `<ellipse cx="100" cy="153" rx="50" ry="40" fill="url(#fur)" stroke="#E2C2A6" stroke-width="1"/>
        <ellipse cx="73" cy="186" rx="17" ry="10" fill="url(#fur)" stroke="#E2C2A6" stroke-width="1"/><ellipse cx="127" cy="186" rx="17" ry="10" fill="url(#fur)" stroke="#E2C2A6" stroke-width="1"/>`}
        <g transform="${tilt}">
          <g class="earL"><path d="M78 58 C 62 22, 30 30, 26 64 C 22 98, 30 132, 44 140 C 56 146, 62 128, 64 108 C 66 90, 74 74, 82 66 Z" fill="url(#fur)" stroke="#E2C2A6" stroke-width="1"/>
            <path d="M72 64 C 60 42, 41 45, 38 68 C 35 94, 41 118, 48 126 C 53 130, 55 118, 56 104 C 57 90, 63 78, 73 70 Z" fill="url(#inner)" opacity=".9"/></g>
          <g transform="translate(200 0) scale(-1 1)"><g class="earR"><path d="M78 58 C 62 22, 30 30, 26 64 C 22 98, 30 132, 44 140 C 56 146, 62 128, 64 108 C 66 90, 74 74, 82 66 Z" fill="url(#fur)" stroke="#E2C2A6" stroke-width="1"/>
            <path d="M72 64 C 60 42, 41 45, 38 68 C 35 94, 41 118, 48 126 C 53 130, 55 118, 56 104 C 57 90, 63 78, 73 70 Z" fill="url(#inner)" opacity=".9"/></g></g>
          <ellipse cx="100" cy="99" rx="60" ry="50" fill="url(#fur)" stroke="#E2C2A6" stroke-width="1"/>
          <path d="M90 52 q6 -9 10 -2 q5 -8 11 1" fill="#FBEBDC" stroke="#E2C2A6" stroke-width="1"/>
        </g>
      </g>
      ${crop === 'head' ? '' : '<ellipse cx="62" cy="190" rx="6" ry="3.4" fill="#F6B3C6"/><ellipse cx="138" cy="190" rx="6" ry="3.4" fill="#F6B3C6"/>'}
      <g transform="${tilt}">
        <ellipse cx="70" cy="113" rx="10" ry="6" fill="#F7A3BC" opacity=".42"/><ellipse cx="130" cy="113" rx="10" ry="6" fill="#F7A3BC" opacity=".42"/>
        ${eyes(eye)}
        <path d="M95.5 107.5 q4.5 -2.2 9 0 q-1.2 4.2 -4.5 5.3 q-3.3 -1.1 -4.5 -5.3z" fill="#EF8AA8"/>
        ${mouth(mo)}
      </g>
      ${showProp ? prop(state) : ''}
    </g></g></svg>`;
  }

  const CSS = `:host{display:block;width:100%;height:100%;line-height:0}
  svg,img{width:100%;height:100%;display:block;overflow:visible}img{object-fit:contain}
  .breathe{transform-origin:100px 192px;animation:br 3.4s ease-in-out infinite}
  .blink{transform-box:fill-box;transform-origin:center;animation:bl 5s infinite}
  .earL{transform-origin:78px 62px;animation:ear 4.4s ease-in-out infinite}
  .earR{transform-origin:78px 62px;animation:ear 4.4s ease-in-out .3s infinite}
  .wave{transform-origin:146px 146px;animation:wv 1.6s ease-in-out infinite}
  .wiggle{transform-origin:100px 153px;animation:wg 2.4s ease-in-out infinite}
  .beat{transform-box:fill-box;transform-origin:center;animation:bt 1.8s ease-in-out infinite}
  .bounce{animation:bo 1.1s ease-in-out infinite}
  .zz{animation:zz 3s ease-in-out infinite}
  @keyframes br{50%{transform:scale(1.008,1.022)}}
  @keyframes bl{0%,92%,100%{transform:scaleY(1)}95%{transform:scaleY(.12)}}
  @keyframes ear{50%{transform:rotate(-3deg)}}
  @keyframes wv{0%,100%{transform:rotate(0)}50%{transform:rotate(-16deg)}}
  @keyframes wg{0%,70%,100%{transform:rotate(0)}76%{transform:rotate(-6deg)}82%{transform:rotate(6deg)}88%{transform:rotate(-4deg)}94%{transform:rotate(3deg)}}
  @keyframes bt{0%,100%{transform:scale(1)}15%{transform:scale(1.07)}30%{transform:scale(1)}}
  @keyframes bo{0%,100%{transform:translateY(0)}50%{transform:translateY(-7px)}}
  @keyframes zz{0%,100%{opacity:.5;transform:translateY(0)}50%{opacity:1;transform:translateY(-3px)}}
  :host([still]) *{animation:none!important}
  @media (prefers-reduced-motion:reduce){*{animation:none!important}}`;

  class MomoBunny extends HTMLElement {
    static get observedAttributes() { return ['state', 'crop', 'src', 'still']; }
    connectedCallback() { if (!this.shadowRoot) this.attachShadow({ mode: 'open' }); this.render(); }
    attributeChangedCallback() { if (this.shadowRoot) this.render(); }
    render() {
      const state = STATES.includes(this.getAttribute('state')) ? this.getAttribute('state') : 'idle';
      const crop = this.getAttribute('crop');
      const key = state + (crop ? '-' + crop : '');
      if (this._key === key + (this.getAttribute('src') || '')) return;
      this._key = key + (this.getAttribute('src') || '');
      const src = this.getAttribute('src') || (window.MOMO_RENDERS && (window.MOMO_RENDERS[key] || window.MOMO_RENDERS[state]));
      this.shadowRoot.innerHTML = `<style>${CSS}</style>` + (src ? `<img alt="Momo ${state}" src="${src}">` : svg(state, crop));
      const img = this.shadowRoot.querySelector('img');
      if (img) img.onerror = () => { this.shadowRoot.innerHTML = `<style>${CSS}</style>` + svg(state, crop); };
    }
  }
  if (!customElements.get('momo-bunny')) customElements.define('momo-bunny', MomoBunny);

  const I = {
    home: '<path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
    blister: '<rect x="3" y="4" width="18" height="16" rx="4"/><circle cx="8.5" cy="9.5" r="2"/><circle cx="15.5" cy="9.5" r="2"/><circle cx="8.5" cy="15" r="2"/><circle cx="15.5" cy="15" r="2"/>',
    calendar: '<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M3 10h18M8 3v4M16 3v4"/>',
    box: '<path d="M21 8 12 3 3 8v8l9 5 9-5z"/><path d="m3 8 9 5 9-5M12 13v8"/>',
    settings: '<path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12M20 18h0"/><circle cx="16" cy="6" r="2"/><circle cx="10" cy="12" r="2"/><circle cx="18" cy="18" r="2"/>',
    bell: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
    left: '<path d="m15 18-6-6 6-6"/>', right: '<path d="m9 18 6-6-6-6"/>',
    check: '<path d="M20 6 9 17l-5-5"/>', plus: '<path d="M12 5v14M5 12h14"/>', minus: '<path d="M5 12h14"/>', x: '<path d="M18 6 6 18M6 6l12 12"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    alert: '<path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/><path d="M12 9v4M12 17h.01"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 16v-4M12 8h.01"/>',
    wifioff: '<path d="m2 2 20 20M8.5 16.4a5 5 0 0 1 7 0M5 12.9a10 10 0 0 1 5.2-2.8M19 12.9a10 10 0 0 0-2.3-1.6M2 8.8a15 15 0 0 1 4.2-2.6M22 8.8a15 15 0 0 0-11.3-3.8M12 20h.01"/>',
    moon: '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9z"/>',
    heart: '<path d="M19 14c1.5-1.5 3-3.2 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.8 0-3 .5-4.5 2-1.5-1.5-2.7-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4 3 5.5l7 7z"/>',
    pill: '<path d="m10.5 20.5-7-7a5 5 0 0 1 7-7l7 7a5 5 0 0 1-7 7z"/><path d="m8.5 8.5 7 7"/>',
    pin: '<path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/>',
    undo: '<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/>',
    bag: '<path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><path d="M3 6h18M16 10a4 4 0 0 1-8 0"/>',
    lock: '<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
    refresh: '<path d="M21 12a9 9 0 1 1-3-6.7L21 8"/><path d="M21 3v5h-5"/>',
    arrow: '<path d="M5 12h14M12 5l7 7-7 7"/>',
    swap: '<path d="M7 16V4m0 0L3 8m4-4 4 4M17 8v12m0 0 4-4m-4 4-4-4"/>',
    sparkle: '<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6"/>',
    volume: '<path d="M11 5 6 9H2v6h4l5 4z"/><path d="M15.5 8.5a5 5 0 0 1 0 7M19 5a10 10 0 0 1 0 14"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
    list: '<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>',
    eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>'
  };
  class MomoIcon extends HTMLElement {
    static get observedAttributes() { return ['name', 'size', 'stroke']; }
    connectedCallback() { this.render(); }
    attributeChangedCallback() { this.render(); }
    render() {
      const s = this.getAttribute('size') || 22, w = this.getAttribute('stroke') || 2;
      this.style.display = 'inline-flex'; this.style.lineHeight = '0';
      this.innerHTML = `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${I[this.getAttribute('name')] || ''}</svg>`;
    }
  }
  if (!customElements.get('momo-icon')) customElements.define('momo-icon', MomoIcon);
})();
