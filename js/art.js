/* little fox — procedural illustration kit.
   Everything visual on the site (scoops, fox scoops, cones, cups, treats, floaties) is drawn here as SVG,
   seeded so the same flavor always gets the same scoop. */
window.Art = (() => {
  let uid = 0;
  const uidf = p => `${p}${(++uid).toString(36)}`;

  /* ---------- seeded random ---------- */
  function hash(s) { let h = 2166136261 >>> 0; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  function rng(seed) {
    let a = typeof seed === 'number' ? seed : hash(String(seed));
    return () => { a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  }

  /* ---------- color ---------- */
  function hexToHsl(hex) {
    const n = parseInt(hex.slice(1), 16), r = (n >> 16 & 255) / 255, g = (n >> 8 & 255) / 255, b = (n & 255) / 255;
    const mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2; let h = 0, s = 0;
    if (mx !== mn) { const d = mx - mn; s = l > .5 ? d / (2 - mx - mn) : d / (mx + mn);
      h = mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; h *= 60; }
    return [h, s, l];
  }
  function hslToHex(h, s, l) {
    h = ((h % 360) + 360) % 360; s = Math.min(1, Math.max(0, s)); l = Math.min(1, Math.max(0, l));
    const k = n => (n + h / 30) % 12, a = s * Math.min(l, 1 - l);
    const f = n => Math.round(255 * (l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)))));
    return '#' + [f(0), f(8), f(4)].map(x => x.toString(16).padStart(2, '0')).join('');
  }
  function shift(hex, dl = 0, ds = 0, dh = 0) { const [h, s, l] = hexToHsl(hex); return hslToHex(h + dh, s + ds, l + dl); }
  const tone = base => ({ base, shade: shift(base, -.12, .06, -5), deep: shift(base, -.24, .04, -8), light: shift(base, .1, -.02, 3) });

  const SPRINK = ['#E2643B', '#4455A1', '#5FB59A', '#F7C948', '#F06A80', '#B98AD8', '#FFFFFF'];
  const INK = '#21172A';

  /* ---------- scoop geometry (local box 240 × ~210, skirt line y=128) ---------- */
  function body(r) {
    const L = 22, R = 218, Y = 128;
    let d = `M${L},${Y} C${L - 5},${Y - 64} 64,26 120,26 C176,26 ${R + 5},${Y - 64} ${R},${Y}`;
    const n = 6, w = (R - L) / n, bumps = [];
    for (let i = 0; i < n; i++) {
      const x0 = R - i * w, x1 = x0 - w, dep = 16 + r() * 12;
      d += ` C${(x0 + 3).toFixed(1)},${(Y + dep).toFixed(1)} ${(x1 - 3).toFixed(1)},${(Y + dep).toFixed(1)} ${x1.toFixed(1)},${Y}`;
      bumps.push({ x: (x0 + x1) / 2, y: Y + dep * .74 });
    }
    return { d: d + 'Z', bumps };
  }
  const inside = (x, y) => { const dx = (x - 120) / 90, dy = (y - 124) / 90; return dx * dx + dy * dy < 1 && y < 138 && y > 40; };
  function pts(n, r, gap) {
    const out = []; let g = 0;
    while (out.length < n && g++ < 600) {
      const x = 30 + r() * 180, y = 36 + r() * 106;
      if (inside(x, y) && out.every(p => Math.hypot(p.x - x, p.y - y) > gap)) out.push({ x, y });
    }
    return out;
  }
  const f1 = v => v.toFixed(1);

  function drip(x, y, len, c, hi) {
    return `<g class="drip"><path d="M${f1(x - 6.5)},${f1(y - 12)} V${f1(y + len)} a6.5,6.5 0 0 0 13,0 V${f1(y - 12)} Z" fill="${c}"/>` +
      `<circle cx="${f1(x)}" cy="${f1(y + len + 1)}" r="8.4" fill="${c}"/><circle cx="${f1(x - 3)}" cy="${f1(y + len - 2)}" r="2.2" fill="${hi}" opacity=".7"/></g>`;
  }

  function mixins(list, r) {
    return list.map(([type, c]) => {
      switch (type) {
        case 'chips': return pts(8, r, 19).map(p => `<rect x="${f1(p.x - 5)}" y="${f1(p.y - 4)}" width="${f1(9 + r() * 4)}" height="${f1(7 + r() * 3)}" rx="2.4" fill="${c}" transform="rotate(${f1(r() * 90 - 45)} ${f1(p.x)} ${f1(p.y)})"/>`).join('');
        case 'chunks': return pts(5, r, 27).map(p => { const w = 13 + r() * 8, h = 11 + r() * 6;
          return `<g transform="rotate(${f1(r() * 60 - 30)} ${f1(p.x)} ${f1(p.y)})"><rect x="${f1(p.x - w / 2)}" y="${f1(p.y - h / 2)}" width="${f1(w)}" height="${f1(h)}" rx="4" fill="${shift(c, -.14)}"/><rect x="${f1(p.x - w / 2)}" y="${f1(p.y - h / 2)}" width="${f1(w)}" height="${f1(h - 3.5)}" rx="4" fill="${c}"/></g>`; }).join('');
        case 'specks': return pts(30, r, 7).map(p => `<circle cx="${f1(p.x)}" cy="${f1(p.y)}" r="${f1(1.3 + r() * 1.4)}" fill="${c}" opacity=".8"/>`).join('');
        case 'sprinkles': return pts(18, r, 13).map((p, i) => `<rect x="${f1(p.x - 6)}" y="${f1(p.y - 2.1)}" width="12" height="4.2" rx="2.1" fill="${SPRINK[i % SPRINK.length]}" transform="rotate(${f1(r() * 180)} ${f1(p.x)} ${f1(p.y)})"/>`).join('');
        case 'blobs': return pts(5, r, 26).map(p => { const rr = 7 + r() * 5;
          return `<circle cx="${f1(p.x)}" cy="${f1(p.y)}" r="${f1(rr)}" fill="${c}"/><circle cx="${f1(p.x - rr * .35)}" cy="${f1(p.y - rr * .35)}" r="${f1(rr * .3)}" fill="#fff" opacity=".75"/>`; }).join('');
        case 'swirl': { const y = 72 + r() * 28, a = 18 + r() * 10;
          const d = `M8,${f1(y + 18)} C48,${f1(y - a)} 88,${f1(y + a + 14)} 128,${f1(y + 2)} S196,${f1(y - 14)} 238,${f1(y + 26)}`;
          return `<path d="${d}" stroke="${c}" stroke-width="13" fill="none" stroke-linecap="round"/><path d="${d}" transform="translate(-1 -4)" stroke="${shift(c, .16)}" stroke-width="3.2" fill="none" stroke-linecap="round" opacity=".55"/>`; }
        case 'drizzle': { const y = 58 + r() * 14;
          return `<path d="M34,${f1(y + 12)} Q62,${f1(y - 10)} 88,${f1(y + 10)} T142,${f1(y + 4)} T206,${f1(y + 16)}" stroke="${c}" stroke-width="5.5" fill="none" stroke-linecap="round"/>`; }
        default: return '';
      }
    }).join('');
  }

  /* ---------- fox parts ---------- */
  function foxEars(t) {
    const ear = `<path d="M44,72 C34,42 32,14 39,3 C43,-3 50,-2 56,2 C74,14 90,25 104,35 Z" fill="${t.shade}"/>` +
      `<path d="M52,60 C46,40 45,22 48,13 C51,10 54,10 57,13 C69,23 79,30 89,38 Z" fill="${INK}" opacity=".88"/>` +
      `<path d="M55,46 C53,36 52,27 54,21" stroke="#FFF3E6" stroke-width="3" fill="none" stroke-linecap="round" opacity=".7"/>`;
    return `<g class="fx-ear-l"><g class="fx-ear">${ear}</g></g><g class="fx-ear-r" transform="matrix(-1 0 0 1 240 0)"><g class="fx-ear">${ear}</g></g>`;
  }
  const foxMask = () =>
    `<path d="M10,126 C30,96 64,92 90,106 C102,113 112,121 120,127 C128,121 138,113 150,106 C176,92 210,96 230,126 L232,170 L8,170 Z" fill="#FFF6EA"/>` +
    `<path d="M10,126 C30,96 64,92 90,106 C102,113 112,121 120,127 C128,121 138,113 150,106 C176,92 210,96 230,126 L232,170 L8,170 Z" fill="#E9DCCB" transform="translate(12 18)" opacity=".7"/>`;
  function foxFace() {
    const eye = (cx) => `<g class="fx-eye"><ellipse cx="${cx}" cy="95" rx="7.6" ry="9.6" fill="${INK}"/><circle cx="${cx - 2.6}" cy="91.2" r="2.7" fill="#fff"/></g>`;
    return `<g class="fx-face">` +
      `<ellipse cx="66" cy="117" rx="12" ry="6.5" fill="#F58C8C" opacity=".5"/><ellipse cx="174" cy="117" rx="12" ry="6.5" fill="#F58C8C" opacity=".5"/>` +
      `<g class="fx-eyes">${eye(90)}${eye(150)}</g>` +
      `<g class="fx-sleep" opacity="0"><path d="M81,96 q9,7 18,0" stroke="${INK}" stroke-width="3.4" fill="none" stroke-linecap="round"/><path d="M141,96 q9,7 18,0" stroke="${INK}" stroke-width="3.4" fill="none" stroke-linecap="round"/></g>` +
      `<path d="M110.5,114 Q120,109.5 129.5,114 Q127,122.5 120,125.5 Q113,122.5 110.5,114 Z" fill="${INK}"/><ellipse cx="116.5" cy="114.6" rx="3" ry="1.6" fill="#fff" opacity=".55"/>` +
      `<path d="M112.5,131 q3.75,5 7.5,0 q3.75,5 7.5,0" stroke="${INK}" stroke-width="2.6" fill="none" stroke-linecap="round"/>` +
      `</g>`;
  }

  /* ---------- scoop ---------- */
  function scoop(o) {
    const { color, mix = [], seed = color, fox = false, drips = fox ? 0 : 2 } = o;
    const r = rng(seed + (fox ? 'fox' : ''));
    const t = tone(color), { d, bumps } = body(r), clip = uidf('sc');
    let s = '';
    if (fox) s += foxEars(t);
    const pool = bumps.slice(1, -1).sort(() => r() - .5).slice(0, drips);
    s += pool.map(b => drip(b.x, b.y, 14 + r() * 32, t.shade, t.light)).join('');
    s += `<clipPath id="${clip}"><path d="${d}"/></clipPath>`;
    s += `<path d="${d}" fill="${t.shade}"/><g clip-path="url(#${clip})">`;
    s += `<path d="${d}" fill="${t.base}" transform="translate(-9 -13)"/>`;
    for (let k = 0; k < (fox ? 0 : 3); k++) {
      const x = 58 + r() * 112, y = 56 + r() * 48, w = 16 + r() * 18;
      s += `<path d="M${f1(x)},${f1(y)} q${f1(w / 2)},7 ${f1(w)},0" stroke="${t.shade}" stroke-width="3.4" fill="none" stroke-linecap="round" opacity=".5"/>`;
    }
    s += fox ? foxMask() : mixins(mix, r);
    s += `<ellipse cx="80" cy="60" rx="25" ry="12" transform="rotate(-28 80 60)" fill="${t.light}" opacity=".9"/>`;
    s += `<circle cx="55" cy="86" r="5" fill="${t.light}" opacity=".85"/></g>`;
    if (fox) s += foxFace();
    return s;
  }

  /* ---------- bases ---------- */
  function cone() {
    const p = uidf('wf'), g = uidf('cg');
    const shape = 'M34,10 L206,10 L131,280 Q120,304 109,280 Z';
    return `<defs><pattern id="${p}" width="24" height="24" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">` +
      `<rect width="24" height="24" fill="#E39A4A"/><rect x="3" y="3" width="18" height="18" rx="4" fill="#EDB063"/><rect x="5" y="5" width="9" height="6" rx="3" fill="#F6C885" opacity=".7"/></pattern>` +
      `<linearGradient id="${g}" x1="0" x2="1"><stop offset="0" stop-color="#fff" stop-opacity=".16"/><stop offset=".45" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#5a2400" stop-opacity=".32"/></linearGradient></defs>` +
      `<path d="${shape}" fill="url(#${p})"/><path d="${shape}" fill="url(#${g})"/>` +
      `<rect x="24" y="0" width="192" height="32" rx="16" fill="#DB9145"/><rect x="24" y="0" width="192" height="32" rx="16" fill="url(#${p})" opacity=".5"/>` +
      `<rect x="24" y="0" width="192" height="32" rx="16" fill="url(#${g})"/><path d="M42,8 H198" stroke="#FFD99E" stroke-width="3" stroke-linecap="round" opacity=".75"/>`;
  }
  function cup(color = '#CCA1CA') {
    const g = uidf('cu'); const t = tone(color);
    return `<defs><linearGradient id="${g}" x1="0" x2="1"><stop offset="0" stop-color="#fff" stop-opacity=".22"/><stop offset=".4" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#2a0030" stop-opacity=".22"/></linearGradient></defs>` +
      `<path d="M30,14 L210,14 L190,182 Q188,196 174,196 L66,196 Q52,196 50,182 Z" fill="${t.base}"/>` +
      `<path d="M30,14 L210,14 L190,182 Q188,196 174,196 L66,196 Q52,196 50,182 Z" fill="url(#${g})"/>` +
      `<path d="M44,62 Q120,74 196,62" stroke="${t.light}" stroke-width="4" fill="none" opacity=".6"/>` +
      `<text x="120" y="128" text-anchor="middle" font-family="Mr Dafoe, cursive" font-size="52" fill="${INK}" transform="rotate(-7 120 120)">little fox</text>` +
      `<rect x="20" y="0" width="200" height="30" rx="15" fill="${t.light}"/><rect x="20" y="20" width="200" height="10" rx="5" fill="${t.shade}" opacity=".5"/>`;
  }

  /* ---------- stacks ---------- */
  const STEP = 94;
  function stackGeom(n, base) { const rimY = 112 + (n - 1) * STEP; return { rimY, H: rimY + (base === 'cup' ? 200 : 306) }; }
  function scoopAt(sc, i, rimY) {
    const y = rimY - 112 - i * STEP;
    return `<g class="scoop-pos" transform="translate(0 ${y})"><g class="scoop${sc.fox ? ' scoop-fox' : ''}" data-i="${i}">${scoop(sc)}</g></g>`;
  }
  function stack({ scoops, base = 'cone', cls = '', label = '', slots = scoops.length, cupColor }) {
    const { rimY, H } = stackGeom(slots, base);
    let s = `<svg class="stack ${cls}" viewBox="-6 -4 252 ${H + 8}" ${label ? `role="img" aria-label="${label}"` : 'aria-hidden="true"'} overflow="visible">`;
    s += `<g class="stack-base" transform="translate(0 ${rimY})"><g class="stack-base-in">${base === 'cup' ? cup(cupColor) : cone()}</g></g>`;
    s += `<g class="stack-scoops">${scoops.map((sc, i) => scoopAt(sc, i, rimY)).join('')}</g></svg>`;
    return s;
  }
  function single(sc, opts = {}) {
    const fox = sc.fox;
    return `<svg class="${opts.cls || 'scoop-solo'}" viewBox="0 ${fox ? -6 : 18} 240 ${fox ? 214 : 196}" aria-hidden="true" overflow="visible"><g class="scoop${fox ? ' scoop-fox' : ''}">${scoop(sc)}</g></svg>`;
  }

  /* ---------- floaties & icons (60×60) ---------- */
  const ICONS = {
    strawberry: `<path d="M30,55 C14,47 5,31 9,20 C13,11 24,11 30,16 C36,11 47,11 51,20 C55,31 46,47 30,55Z" fill="#E8394E"/><path d="M30,55 C40,48 50,36 50,24 C52,34 46,46 30,55Z" fill="#B91E37" opacity=".6"/>` +
      [[20, 24], [30, 28], [40, 24], [24, 36], [36, 36], [30, 44], [18, 31], [42, 31]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="1.6" ry="2.4" fill="#FFD66B"/>`).join('') +
      `<path d="M17,15 L27,11 L30,3 L33,11 L43,15 L34,17 L30,23 L26,17Z" fill="#4CA35A"/><path d="M30,4 Q32,0 36,-1" stroke="#3E8A4B" stroke-width="2.5" fill="none" stroke-linecap="round"/>`,
    cherry: `<path d="M30,26 Q34,10 46,4" stroke="#4A7A2E" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M44,5 Q54,2 56,10 Q48,12 44,5Z" fill="#5DBB6A"/><circle cx="28" cy="38" r="16" fill="#D7263D"/><circle cx="34" cy="44" r="11" fill="#A9152B" opacity=".45"/><ellipse cx="21" cy="31" rx="5" ry="3.4" fill="#fff" opacity=".7" transform="rotate(-30 21 31)"/>`,
    leaf: `<path d="M6,54 C8,26 28,8 56,6 C54,32 36,52 6,54Z" fill="#5DBB8A"/><path d="M6,54 C8,26 28,8 56,6 C46,22 30,40 6,54Z" fill="#7CD3A4"/><path d="M10,50 Q30,30 50,12" stroke="#3E9A6E" stroke-width="2.2" fill="none" stroke-linecap="round"/>`,
    choc: `<path d="M12,16 L46,10 L52,42 L18,50 Z" fill="#4A2A1C"/><path d="M12,16 L46,10 L48,20 L15,26 Z" fill="#6B3F2A"/><path d="M18,30 L46,25 M20,40 L48,34 M29,13 L34,47" stroke="#2E170E" stroke-width="2.4"/>`,
    honey: `<path d="M30,4 L52,17 L52,43 L30,56 L8,43 L8,17 Z" fill="#E9A02A"/><path d="M30,12 L45,21 L45,39 L30,48 L15,39 L15,21 Z" fill="#F7C24A"/><path d="M30,12 L45,21 L30,30 L15,21 Z" fill="#FFE08A" opacity=".7"/>`,
    lemon: `<circle cx="30" cy="30" r="25" fill="#F2C94C"/><circle cx="30" cy="30" r="21" fill="#FFF3B5"/><circle cx="30" cy="30" r="18" fill="#F7E27C"/>` +
      Array.from({ length: 8 }, (_, i) => { const a = i * Math.PI / 4; return `<path d="M30,30 L${f1(30 + Math.cos(a) * 17)},${f1(30 + Math.sin(a) * 17)}" stroke="#FFF3B5" stroke-width="2.4"/>`; }).join(''),
    bean: `<ellipse cx="30" cy="30" rx="17" ry="24" fill="#5A3825" transform="rotate(25 30 30)"/><path d="M24,10 Q36,30 24,50" stroke="#2E1A10" stroke-width="3" fill="none" transform="rotate(25 30 30)"/><ellipse cx="22" cy="20" rx="4" ry="7" fill="#fff" opacity=".18" transform="rotate(25 30 30)"/>`,
    sprinkle: c => `<rect x="10" y="24" width="40" height="12" rx="6" fill="${c}" transform="rotate(-30 30 30)"/><rect x="14" y="26" width="18" height="3.5" rx="1.75" fill="#fff" opacity=".45" transform="rotate(-30 30 30)"/>`,
    spark: c => `<path d="M30,2 C32,22 38,28 58,30 C38,32 32,38 30,58 C28,38 22,32 2,30 C22,28 28,22 30,2Z" fill="${c}"/>`,
    peach: `<circle cx="30" cy="33" r="21" fill="#FF9F73"/><path d="M30,14 Q22,30 30,54" stroke="#E07043" stroke-width="2.5" fill="none" opacity=".6"/><circle cx="38" cy="38" r="12" fill="#FF7F57" opacity=".5"/><path d="M31,14 Q40,4 52,8 Q44,18 31,14Z" fill="#5DBB6A"/>`,
    blueberry: `<circle cx="30" cy="32" r="20" fill="#4C4AA8"/><circle cx="36" cy="38" r="12" fill="#2F2D7A" opacity=".5"/><path d="M24,16 L30,20 L36,16 L33,24 L27,24 Z" fill="#2A2866"/><ellipse cx="22" cy="26" rx="5" ry="3" fill="#fff" opacity=".35"/>`,
    lavender: `<path d="M30,58 Q30,34 30,8" stroke="#5E8C5A" stroke-width="2.6" fill="none"/>` + [[30, 10], [25, 16], [35, 18], [26, 24], [34, 27], [27, 33], [33, 36]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="4" ry="5.5" fill="#9C7FD9"/>`).join(''),
    waffle: `<path d="M8,48 L30,6 L52,48 Z" fill="#EDB063"/><path d="M14,36 L46,36 M19,26 L41,26 M22,46 L36,16 M38,46 L24,16" stroke="#C98436" stroke-width="2.6"/>`
  };
  function icon(name, arg) { const v = ICONS[name]; return `<svg viewBox="0 0 60 60" aria-hidden="true" overflow="visible">${typeof v === 'function' ? v(arg) : v}</svg>`; }

  /* ---------- treats ---------- */
  function cake() {
    const drips = [46, 68, 92, 118, 142, 168, 194, 214].map((x, i) => { const l = 14 + ((i * 37) % 26); return `<path d="M${x - 7},100 V${100 + l} a7,7 0 0 0 14,0 V100 Z" fill="#4A2A1C"/>`; }).join('');
    const spr = Array.from({ length: 16 }, (_, i) => { const x = 54 + ((i * 53) % 150), y = 80 + ((i * 29) % 22); return `<rect x="${x}" y="${y}" width="10" height="3.6" rx="1.8" fill="${SPRINK[i % 6]}" transform="rotate(${(i * 47) % 180} ${x + 5} ${y + 2})"/>`; }).join('');
    return `<svg viewBox="0 0 260 262" aria-hidden="true" overflow="visible">` +
      `<ellipse cx="130" cy="240" rx="124" ry="20" fill="#000" opacity=".12"/><ellipse cx="130" cy="232" rx="126" ry="22" fill="#FFF8EC"/><ellipse cx="130" cy="228" rx="112" ry="16" fill="#F1E2C8"/>` +
      `<path d="M30,96 V196 A100,30 0 0 0 230,196 V96 Z" fill="#5A3424"/>` +
      `<path d="M30,150 A100,30 0 0 0 230,150 V164 A100,30 0 0 1 30,164 Z" fill="#FBEED7"/>` +
      `<path d="M30,96 V150 A100,30 0 0 0 230,150 V96 Z" fill="#CCA1CA"/>` +
      `<path d="M180,96 V226 A100,30 0 0 0 230,196 V96 Z" fill="#000" opacity=".1"/>` +
      `<text x="130" y="210" text-anchor="middle" font-family="Mr Dafoe, cursive" font-size="34" fill="#FBEED7">celebrate</text>` +
      `<ellipse cx="130" cy="96" rx="100" ry="30" fill="#4A2A1C"/>${drips}<ellipse cx="130" cy="92" rx="92" ry="25" fill="#5E3626"/>${spr}` +
      `<rect x="122" y="30" width="16" height="62" rx="4" fill="#FBEED7"/><path d="M122,40 L138,34 M122,52 L138,46 M122,64 L138,58 M122,76 L138,70" stroke="#E2643B" stroke-width="4"/>` +
      `<path class="flame" d="M130,2 C141,15 141,26 130,30 C119,26 119,15 130,2Z" fill="#FFB637"/><path d="M130,13 C134,19 134,25 130,27 C126,25 126,19 130,13Z" fill="#FFF0B5"/></svg>`;
  }
  function taco() {
    const p = uidf('tw');
    const spr = Array.from({ length: 12 }, (_, i) => { const x = 40 + ((i * 47) % 180), y = 104 + ((i * 13) % 14); return `<rect x="${x}" y="${y}" width="10" height="3.6" rx="1.8" fill="${SPRINK[i % 6]}" transform="rotate(${(i * 61) % 180} ${x + 5} ${y + 2})"/>`; }).join('');
    return `<svg viewBox="0 0 260 230" aria-hidden="true" overflow="visible"><defs><pattern id="${p}" width="20" height="20" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="20" height="20" fill="#E39A4A"/><rect x="3" y="3" width="14" height="14" rx="3" fill="#EDB063"/></pattern></defs>` +
      `<ellipse cx="130" cy="214" rx="96" ry="12" fill="#000" opacity=".12"/>` +
      `<path d="M28,100 C30,40 80,34 102,62 C112,30 150,26 166,58 C186,28 236,40 232,100 Z" fill="#E98AA0"/><path d="M28,100 C30,44 78,40 98,66 C110,36 148,32 162,62 C180,36 224,44 222,96 Z" fill="#F6A9B9"/>` +
      `<ellipse cx="64" cy="62" rx="16" ry="8" fill="#FFD3DC" transform="rotate(-24 64 62)"/><ellipse cx="128" cy="44" rx="13" ry="6" fill="#FFD3DC" transform="rotate(-10 128 44)"/>` +
      `<circle cx="84" cy="66" r="7" fill="#C3253F"/><circle cx="178" cy="62" r="6" fill="#C3253F"/>` +
      `<path d="M20,98 A110,110 0 0 0 240,98 Z" fill="url(#${p})"/><path d="M20,98 A110,110 0 0 0 240,98 Z" fill="#5a2400" opacity=".08"/>` +
      `<path d="M20,98 A110,110 0 0 0 23,128 Q60,140 80,122 Q100,140 130,126 Q160,142 182,122 Q210,140 237,128 A110,110 0 0 0 240,98 Z" fill="#4A2A1C"/>${spr}` +
      `<path d="M30,100 H230" stroke="#FFD99E" stroke-width="3" stroke-linecap="round" opacity=".7"/></svg>`;
  }
  function pint() {
    return `<svg viewBox="0 0 240 250" aria-hidden="true" overflow="visible"><ellipse cx="120" cy="232" rx="86" ry="12" fill="#000" opacity=".12"/>` +
      `<path d="M40,60 L200,60 L188,222 Q120,236 52,222 Z" fill="#FBEED7"/><path d="M150,60 L200,60 L188,222 Q170,226 150,228 Z" fill="#000" opacity=".07"/>` +
      `<path d="M44,110 L196,110 L190,182 L50,182 Z" fill="#4455A1"/><text x="120" y="160" text-anchor="middle" font-family="Mr Dafoe, cursive" font-size="44" fill="#FBEED7" transform="rotate(-6 120 150)">little fox</text>` +
      `<g class="pint-lid"><path d="M74,26 C70,4 74,-6 80,-6 C88,-6 96,10 100,24Z" fill="#E2643B"/><path d="M166,26 C170,4 166,-6 160,-6 C152,-6 144,10 140,24Z" fill="#E2643B"/>` +
      `<path d="M80,18 C78,6 80,0 82,0 C86,2 90,10 92,20Z" fill="${INK}" opacity=".85"/><path d="M160,18 C162,6 160,0 158,0 C154,2 150,10 148,20Z" fill="${INK}" opacity=".85"/>` +
      `<ellipse cx="120" cy="60" rx="86" ry="18" fill="#CCA1CA"/><rect x="34" y="34" width="172" height="28" rx="12" fill="#CCA1CA"/><ellipse cx="120" cy="36" rx="86" ry="18" fill="#E6CDE4"/></g></svg>`;
  }
  function giftcard() {
    return `<svg viewBox="0 0 280 220" aria-hidden="true" overflow="visible"><g transform="rotate(-8 140 110)">` +
      `<rect x="26" y="30" width="228" height="148" rx="18" fill="#000" opacity=".12" transform="translate(6 10)"/>` +
      `<rect x="26" y="30" width="228" height="148" rx="18" fill="#4455A1"/>` +
      Array.from({ length: 30 }, (_, i) => `<circle cx="${44 + (i % 10) * 22}" cy="${48 + Math.floor(i / 10) * 22}" r="2.4" fill="#FBEED7" opacity=".22"/>`).join('') +
      `<text x="46" y="150" font-family="Mr Dafoe, cursive" font-size="46" fill="#FBEED7">little fox</text>` +
      `<text x="234" y="62" text-anchor="end" font-family="Bricolage Grotesque, sans-serif" font-weight="800" font-size="15" letter-spacing="2" fill="#CCA1CA">E-GIFT</text>` +
      `<g transform="translate(168 76) scale(.34)">${scoop({ color: '#E2643B', fox: true, seed: 'gift', drips: 0 })}</g></g></svg>`;
  }

  return { scoop, single, stack, stackGeom, scoopAt, cone, cup, icon, cake, taco, pint, giftcard, tone, shift, rng, SPRINK, STEP };
})();
