/* little fox — site interactions */
(() => {
  'use strict';
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const FINE = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const lum = hex => { const n = parseInt(hex.slice(1), 16); return (n >> 16) * .299 + (n >> 8 & 255) * .587 + (n & 255) * .114; };
  const isLight = hex => lum(hex) > 150;

  const F = id => FLAVORS.find(f => f.id === id);
  const sc = (f, extra = {}) => ({ color: f.scoop, mix: f.mix, seed: f.id, ...extra });
  const at = (svg, x, y, w, h = w) => svg.replace('<svg ', `<svg x="${x}" y="${y}" width="${w}" height="${h}" `);
  const iconAt = (name, x, y, s, arg) => at(Art.icon(name, arg), x, y, s);
  const locText = f => f.loc === 'both' ? 'cardiff + oceanside' : 'oceanside only';

  const HERO_SCOOPS = [sc(F('lavender-haze'), { seed: 'hero-a' }), sc(F('berrily-good'), { seed: 'hero-b' }), { color: '#E2643B', fox: true, seed: 'hero-fox' }];

  /* =====================================================
     BUILD — everything visual is generated from Art + data
     ===================================================== */
  // hero floaties: [icon, x%, y%, size(vw), depth, rotation, arg]
  const FLOATIES = [
    ['strawberry', 13, 30, 5, .7, -18], ['cherry', 64, 11, 3.6, 1.2, 14], ['leaf', 22, 64, 4.2, .9, 30], ['choc', 76, 64, 3.8, .55, -12],
    ['honey', 85, 36, 3.2, 1.3, 8], ['lemon', 5, 57, 3.4, .4, 0], ['sprinkle', 34, 19, 2.4, 1.6, 30, '#F7C948'], ['sprinkle', 61, 82, 2.2, 1.5, -40, '#9CCEBF'],
    ['sprinkle', 63, 29, 2, 1.8, 60, '#F06A80'], ['spark', 31, 45, 1.8, 2, 0, '#FBEED7'], ['spark', 70, 47, 1.5, 2.2, 0, '#F7D46E'], ['blueberry', 90, 75, 3, .7, 0],
    ['sprinkle', 58, 84, 2.2, 1.2, 20, '#FBEED7']
  ];
  $('.hero-floaties').innerHTML = FLOATIES.map(([i, x, y, s, d, r, a]) =>
    `<span class="fl" data-depth="${d}" style="left:${x}%;top:${y}%;--s:calc(${s}vw + 14px)"><span class="fl-in" style="transform:rotate(${r}deg)">${Art.icon(i, a)}</span></span>`).join('');

  // crossing marquee bands
  const BAND_A = [['off-beat', 'strawberry'], ['from scratch', 'waffle'], ['local farms', 'cherry'], ['small batch', 'leaf'], ['big feelings', 'honey'], ['since 2020', 'lemon']];
  const a = BAND_A.map(([t, ic], i) => `<span class="band-item">${i % 2 ? `<em>${t}</em>` : t}${Art.icon(ic)}</span>`).join('');
  const b = FLAVORS.filter(f => !f.plant).slice(0, 12).map((f, i) =>
    `<span class="band-item">${i % 2 ? `<em>${f.name.toLowerCase()}</em>` : f.name.toLowerCase()}${Art.single({ color: f.scoop, mix: f.mix, seed: f.id + 'band', drips: 0 })}</span>`).join('');
  $('.band-a .band-track').innerHTML = a + a;
  $('.band-b .band-track').innerHTML = b + b;

  // story
  $$('.ico[data-icon="fox"]').forEach(e => { e.innerHTML = Art.single({ color: '#E2643B', fox: true, seed: 'ico-fox' }); });
  $$('.ico[data-icon="cone"]').forEach(e => { e.innerHTML = Art.stack({ scoops: [sc(F('berrily-good'), { seed: 'ico', drips: 0 })] }); });
  const shell = `<path d="M0,0 L12,-12 L24,0 L36,-12 L48,0 L60,-12 L72,0 C72,40 56,62 36,62 C16,62 0,40 0,0 Z" fill="#FFF8EC"/><path d="M8,10 C12,38 24,52 40,54" stroke="#EAD6B8" stroke-width="5" fill="none" stroke-linecap="round"/>`;
  const PILLAR = {
    egg: `<svg viewBox="0 0 200 200" aria-hidden="true"><ellipse cx="96" cy="190" rx="62" ry="8" fill="#000" opacity=".08"/>` +
      `<g class="egg-top"><g transform="translate(96 62) rotate(24) scale(1.15 -1.15)">${shell}</g></g>` +
      `<g class="egg-yolk"><circle cx="98" cy="122" r="21" fill="#FFB637"/><circle cx="91" cy="115" r="6" fill="#FFE08A"/></g>` +
      `<path d="M98,80 V92 M84,84 L88,95 M112,84 L108,95" stroke="#21172A" stroke-width="3" stroke-linecap="round" opacity=".35"/>` +
      `<g transform="translate(26 150) rotate(-14)">${shell}</g></svg>`,
    farm: `<svg viewBox="0 0 200 200" aria-hidden="true">${iconAt('leaf', 100, 36, 76)}${iconAt('peach', 116, 0, 56)}${iconAt('strawberry', 26, 40, 112)}${iconAt('blueberry', 120, 114, 58)}</svg>`,
    spark: `<svg viewBox="0 0 200 200" aria-hidden="true">${at(Art.stack({ scoops: [sc(F('rbf'), { seed: 'pillar' })], base: 'cup', cupColor: '#FBEED7' }), 46, 22, 108, 170)}` +
      `${iconAt('spark', 8, 26, 34, '#FBEED7')}${iconAt('spark', 162, 50, 24, '#21172A')}${iconAt('bean', 148, 118, 44)}${iconAt('lemon', 8, 112, 44)}${iconAt('lavender', 142, -4, 46)}</svg>`
  };
  $$('.pillar-art').forEach(e => { e.innerHTML = PILLAR[e.dataset.art] || ''; });
  const FRIENDS = ['JR Organics', 'The Ecology Center', 'Swell Soda', 'Necessity Coffee', 'Black Hat Sourdough', 'Equal Exchange', 'Santa Barbara Chocolate'];
  const fr = FRIENDS.map((n, i) => `<span>${i % 2 ? `<b>${n}</b>` : n}<i>✦</i></span>`).join('');
  $('.ticker-track').innerHTML = fr + fr;

  // flavor lab panels
  const LAB_FL = {
    'banana-pancake': [['choc'], ['honey'], ['spark', '#FFF6D8']],
    'london-fog': [['leaf'], ['spark', '#FFFFFF'], ['waffle']],
    'golden-hour': [['lemon'], ['spark', '#FFF1CF'], ['leaf']],
    'rbf': [['cherry'], ['spark', '#FBEED7'], ['sprinkle', '#FBEED7']],
    'lavender-haze': [['lavender'], ['lemon'], ['spark', '#FFFFFF']],
    'cyprus-grove': [['blueberry'], ['leaf'], ['blueberry']],
    'peach-please': [['peach'], ['leaf'], ['peach']],
    'decaf': [['bean'], ['choc'], ['bean']]
  };
  const FL_POS = [{ x: '6%', y: '14%', s: '14%' }, { x: '78%', y: '26%', s: '11%' }, { x: '14%', y: '70%', s: '10%' }];
  const showcase = FLAVORS.filter(f => f.show);
  const labOut = $('.lab-outro');
  showcase.forEach((f, i) => {
    const words = f.name.split(' ');
    const nameHTML = words.length > 1 ? `${words.slice(0, -1).join(' ')} <em>${words.at(-1)}</em>` : `<em>${f.name}</em>`;
    const cup = i % 2 === 1;
    const art = Art.stack({ scoops: [sc(f, { seed: f.id + 'a' }), sc(f)], base: cup ? 'cup' : 'cone', cupColor: cup ? '#FBEED7' : undefined, label: `${f.name} ice cream` });
    const fls = (LAB_FL[f.id] || []).map(([ic, arg], k) => `<span class="lp-fl" style="--x:${FL_POS[k].x};--y:${FL_POS[k].y};--s:${FL_POS[k].s}">${Art.icon(ic, arg)}</span>`).join('');
    labOut.insertAdjacentHTML('beforebegin', `
      <article class="lab-panel lp" data-bg="${f.bg}" data-ink="${f.ink}" style="--bg-p:${f.bg};--ink-p:${f.ink}">
        <div class="lp-copy">
          <p class="lp-num"><b>${String(i + 1).padStart(2, '0')}</b>${locText(f)}</p>
          <h3 class="lp-name">${nameHTML}</h3>
          <p class="lp-tag">“${f.tag}”</p>
          <ul class="lp-ing">${f.ing.map(x => `<li>${x}</li>`).join('')}</ul>
          <div class="lp-tags">${f.gf ? '<span>gluten-free</span>' : ''}${f.v ? '<span>plant-based</span>' : ''}<span>made from scratch</span></div>
        </div>
        <div class="lp-art">
          <div class="lp-ring"></div>
          <span class="lp-ghost script" aria-hidden="true">${words.at(-1).toLowerCase()}</span>
          <div class="lp-cone${cup ? ' is-cup' : ''}">${art}</div>
          ${fls}
        </div>
      </article>`);
  });
  $('.lab-total').textContent = String(showcase.length).padStart(2, '0');
  $('.lab-intro-art').innerHTML = [
    [F('golden-hour'), 'cone', '6%', '4%', '26%', -12], [F('cake'), 'cup', '40%', '22%', '30%', 6, '#CCA1CA'], [F('cyprus-grove'), 'cone', '74%', '0%', '22%', 14]
  ].map(([f, base, x, y, s, r, cupColor], k) => `<div class="lia" style="--x:${x};--y:${y};--s:${s};transform:rotate(${r}deg)">${Art.stack({ scoops: [sc(f, { seed: f.id + 'intro' + k })], base, cupColor })}</div>`).join('') +
    `<div class="lia" style="--x:76%;--y:66%;--s:18%">${Art.single({ color: '#E2643B', fox: true, seed: 'intro-fox' })}</div>` +
    `<div class="lia" style="--x:30%;--y:80%;--s:8%">${Art.icon('spark', '#E2643B')}</div><div class="lia" style="--x:2%;--y:66%;--s:7%">${Art.icon('cherry')}</div>`;

  // full board
  const board = $('.board-list');
  board.innerHTML = FLAVORS.map((f, i) => `
    <li class="row" tabindex="0" data-id="${f.id}" data-gf="${f.gf ? 1 : 0}" data-v="${f.v ? 1 : 0}" data-loc="${f.loc}" style="--c:${f.bg};--ci:${f.ink}">
      <span class="row-n">${String(i + 1).padStart(2, '0')}</span>
      <span class="row-name">${f.name}${f.plant ? '<span class="pb">plant-based</span>' : ''}</span>
      <span class="row-ing">${f.ing.join(' + ')}</span>
      <span class="row-meta">${f.gf ? '<span>gf</span>' : ''}${f.v ? '<span>v</span>' : ''}<span>${f.loc === 'both' ? 'cardiff + oceanside' : 'oceanside'}</span></span>
      <span class="row-tag">“${f.tag}”</span>
    </li>`).join('');
  const match = (row, k) => k === 'all' || (k === 'gf' && row.dataset.gf === '1') || (k === 'v' && row.dataset.v === '1') ||
    (k === 'oce') || (k === 'car' && row.dataset.loc === 'both');
  const rows = $$('.row', board);
  $$('.filters .chip').forEach(c => { c.querySelector('sup').textContent = rows.filter(r => match(r, c.dataset.filter)).length; });

  // stack-it chips
  const STACK_IDS = ['banana-pancake', 'hollywood', 'london-fog', 'golden-hour', 'berrily-good', 'cake', 'rbf', 'lavender-haze', 'cooler', 'cyprus-grove', 'peach-please', 'decaf'];
  $('.stack-chips').innerHTML = STACK_IDS.map(id => { const f = F(id); return `<button type="button" class="schip" data-id="${id}" style="--c:${f.scoop}"><i></i>${f.name}</button>`; }).join('');
  const STACK_MAX = 4;
  const stackGeo = Art.stackGeom(STACK_MAX, 'cone');
  $('.stack-stage').insertAdjacentHTML('beforeend', Art.stack({ scoops: [], slots: STACK_MAX, label: 'Your custom cone' }));

  // treats
  const TREAT = { cake: Art.cake, taco: Art.taco, pint: Art.pint, gift: Art.giftcard };
  $$('.treat-art').forEach(e => { e.innerHTML = TREAT[e.dataset.art](); });

  // map
  const pin = (x, y, color, seed, label, flip) => `
    <g class="pin" transform="translate(${x} ${y})">
      <circle class="pin-pulse" r="10" fill="#21172A" opacity=".25"/><circle r="6" fill="#21172A"/>
      <path d="M0,-6 V-26" stroke="#21172A" stroke-width="3"/>
      <g class="pin-fox" transform="translate(-30 -86) scale(.25)">${Art.scoop({ color, fox: true, seed })}</g>
      <g transform="translate(${flip ? -112 : 36} -58)"><rect width="78" height="30" rx="15" fill="#21172A"/><text x="39" y="20" text-anchor="middle" font-family="Fraunces, serif" font-style="italic" font-size="15" fill="#FBEED7">${label}</text></g>
    </g>`;
  const ROUTE = 'M206,118 C214,170 200,200 222,250 C244,300 236,350 256,400 C270,436 266,452 276,474';
  $('.map').innerHTML = `<svg viewBox="0 0 400 560" preserveAspectRatio="xMidYMid meet" overflow="visible">
    <defs><pattern id="mapdots" width="14" height="14" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1.2" fill="#FBEED7" opacity=".16"/></pattern></defs>
    <rect x="-900" y="-600" width="2200" height="1800" fill="#4455A1"/><rect x="-900" y="-600" width="2200" height="1800" fill="url(#mapdots)"/>
    <g class="waves" stroke="#93A2E2" stroke-width="2.4" fill="none" stroke-linecap="round" opacity=".6">
      ${[[40, 90], [96, 150], [26, 232], [112, 300], [48, 382], [124, 452], [36, 512], [20, 160], [-60, 300], [-40, 450], [80, 40]].map(([x, y]) => `<path d="M${x},${y} q8,-6 16,0 t16,0 t16,0"/>`).join('')}
    </g>
    <text x="70" y="330" transform="rotate(-78 70 330)" font-family="Fraunces, serif" font-style="italic" font-size="28" fill="#FBEED7" opacity=".55">the pacific</text>
    <path d="M178,-700 C182,-200 176,40 186,110 C194,170 172,200 196,250 C218,300 208,350 232,400 C248,440 240,500 270,1300 L1400,1300 L1400,-700 Z" fill="#FBEED7"/>
    <path d="M178,-700 C182,-200 176,40 186,110 C194,170 172,200 196,250 C218,300 208,350 232,400 C248,440 240,500 270,1300" fill="none" stroke="#F1DDB8" stroke-width="12"/>
    <ellipse cx="226" cy="300" rx="16" ry="6" fill="#8D9CDD" transform="rotate(28 226 300)"/><ellipse cx="262" cy="440" rx="12" ry="5" fill="#8D9CDD" transform="rotate(20 262 440)"/>
    <g font-family="Bricolage Grotesque, sans-serif" font-weight="700" font-size="10" letter-spacing="2.4" fill="#21172A" opacity=".45">
      <text x="296" y="150">OCEANSIDE</text><text x="282" y="262">CARLSBAD</text><text x="300" y="372">ENCINITAS</text><text x="318" y="470">CARDIFF</text>
    </g>
    <path class="route" d="${ROUTE}" fill="none" stroke="#E2643B" stroke-width="3.2" stroke-dasharray="1 9" stroke-linecap="round"/>
    <g transform="translate(244 316)"><rect x="-17" y="-12" width="34" height="24" rx="8" fill="#FBEED7" stroke="#21172A" stroke-width="2"/><text y="5" text-anchor="middle" font-family="Bricolage Grotesque, sans-serif" font-weight="800" font-size="12" fill="#21172A">101</text></g>
    ${pin(206, 118, '#E2643B', 'pin-o', 'oceanside', true)}
    ${pin(276, 474, '#CCA1CA', 'pin-c', 'cardiff', true)}
    <g class="traveler"><circle r="13" fill="#E2643B" stroke="#FBEED7" stroke-width="3"/><circle cx="-4" cy="-2" r="2" fill="#21172A"/><circle cx="4" cy="-2" r="2" fill="#21172A"/><path d="M-2,3 h4 l-2,2z" fill="#21172A"/></g>
    <g transform="translate(34 40)" fill="#FBEED7"><path d="M0,-18 L7,4 L0,0 L-7,4 Z"/><text y="22" text-anchor="middle" font-family="Bricolage Grotesque, sans-serif" font-weight="800" font-size="12">N</text></g>
  </svg>`;

  // the pack
  const PACK = ['#CCA1CA', '#9CCEBF', '#F7D46E', '#4455A1', '#F6A9B9', '#FBEED7', '#B48863', '#C7B2E8', '#9CCEBF'];
  $('.pack-row').innerHTML = PACK.map((c, i) => `<div class="pack-fox">${Art.single({ color: c, fox: true, seed: 'pack' + i })}</div>`).join('');

  // menu scoops + loader sprinkles
  $('.menu-scoops').innerHTML = [[F('golden-hour'), 50, 2, 36], [F('berrily-good'), 8, 34, 30], [F('cyprus-grove'), 46, 58, 26]]
    .map(([f, x, y, w]) => `<div style="position:absolute;left:${x}%;top:${y}%;width:${w}%">${Art.single(sc(f, { seed: f.id + 'menu' }))}</div>`).join('') +
    `<div style="position:absolute;left:14%;top:2%;width:20%">${Art.single({ color: '#E2643B', fox: true, seed: 'menu-fox' })}</div>`;
  const ldR = Art.rng('loader');
  $('.ld-sprinkles').innerHTML = Array.from({ length: 22 }, (_, i) =>
    `<span style="position:absolute;left:${(ldR() * 96).toFixed(1)}%;top:${(ldR() * 92).toFixed(1)}%;width:${16 + ldR() * 14}px;transform:rotate(${ldR() * 180}deg)">${Art.icon('sprinkle', Art.SPRINK[i % 6])}</span>`).join('');

  // drip dividers (fixed 1600-wide art, sliced to fit)
  $$('.drips').forEach((el, k) => {
    const c = el.dataset.color, r = Art.rng('drips' + k), W = 1600, n = 16;
    let d = `M-20,0 H${W + 20} V16 `;
    for (let i = n; i > 0; i--) { const x0 = i * W / n, x1 = (i - 1) * W / n; d += `Q${(x0 + x1) / 2},${30 + r() * 16} ${x1},16 `; }
    let s = `<svg viewBox="0 0 ${W} 220" preserveAspectRatio="xMidYMin slice"><path d="${d}V0Z" fill="${c}"/>`;
    for (let i = 0; i < 22; i++) {
      const x = (i + .5 + (r() - .5) * .5) * W / 22, w = 12 + r() * 20, len = 40 + r() * (r() > .7 ? 150 : 80), f = 9;
      s += `<g class="dr"><path d="M${x - w / 2 - f},18 Q${x - w / 2},18 ${x - w / 2},${18 + f} V${len} A${w / 2},${w / 2} 0 0 0 ${x + w / 2},${len} V${18 + f} Q${x + w / 2},18 ${x + w / 2 + f},18 Z" fill="${c}"/>` +
        `<circle cx="${x}" cy="${len + 1}" r="${w / 2 + 2.5}" fill="${c}"/></g>`;
    }
    el.innerHTML = s + '</svg>';
  });

  /* ---------- open / closed (shop hours are Pacific time) ---------- */
  function laMinutes() {
    const parts = new Intl.DateTimeFormat('en-US', { timeZone: 'America/Los_Angeles', hour: 'numeric', minute: 'numeric', hourCycle: 'h23' }).formatToParts(new Date());
    return (+parts.find(p => p.type === 'hour').value) * 60 + (+parts.find(p => p.type === 'minute').value);
  }
  function updateOpen() {
    const m = laMinutes(), s = SHOPS.oce, open = m >= s.open && m < s.close, soon = open && s.close - m <= 45;
    const nav = open ? (soon ? 'closing soon' : 'open now') : (m < s.open ? 'opens 11:30am' : 'closed · back 11:30am');
    $('.open-text').textContent = nav;
    $('.nav-open .dot').classList.toggle('closed', !open);
    $$('.shop-status').forEach(el => {
      el.classList.toggle('closed', !open);
      el.querySelector('span').textContent = open ? (soon ? 'closing soon — last scoops till 9pm' : 'open right now — till 9pm') : (m < s.open ? 'opening today at 11:30am' : 'closed for tonight — back tomorrow at 11:30am');
    });
  }
  updateOpen(); setInterval(updateOpen, 60000);

  /* ---------- newsletter (front-end only; wire to the email provider before launch) ---------- */
  $('.news-form').addEventListener('submit', e => {
    e.preventDefault();
    const input = $('#news-email'), msg = $('.news-msg');
    if (!input.checkValidity() || !input.value) { msg.textContent = 'hmm, that email looks a little melted. try again?'; input.focus(); return; }
    msg.textContent = "you're in the pack! cool news incoming."; input.value = '';
    if (window.gsap) gsap.fromTo(msg, { y: 12, opacity: 0 }, { y: 0, opacity: 1, duration: .6, ease: 'back.out(2)' });
  });

  /* =====================================================
     NO-GSAP FALLBACK
     ===================================================== */
  const heroStack = $('.hero-stack');
  heroStack.style.aspectRatio = '252 / 614';
  if (!window.gsap || !window.ScrollTrigger) {
    heroStack.innerHTML = Art.stack({ scoops: HERO_SCOOPS, label: 'A waffle cone with lavender and strawberry scoops, topped with a fox-faced scoop' });
    $('#loader').remove(); $('#ld-fly').remove(); document.body.classList.remove('is-loading');
    return;
  }
  gsap.registerPlugin(ScrollTrigger);
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  scrollTo(0, 0);

  /* ---------- smooth scroll ---------- */
  let lenis = null;
  if (window.Lenis && !RM) {
    lenis = new Lenis({ duration: 1.15, easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)), smoothWheel: true });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(t => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    lenis.stop();
  }
  const scrollToTarget = (target, opts = {}) => {
    const el = typeof target === 'string' ? (target === '#top' ? 0 : $(target)) : target;
    if (el === null) return;
    if (lenis) lenis.scrollTo(el, { duration: 1.6, ...opts });
    else (el === 0 ? scrollTo({ top: 0, behavior: RM ? 'auto' : 'smooth' }) : el.scrollIntoView({ behavior: RM ? 'auto' : 'smooth' }));
  };

  /* ---------- helpers ---------- */
  function splitWords(el) {
    if (el.dataset.split) return $$('.wi', el);
    const walk = node => [...node.childNodes].forEach(n => {
      if (n.nodeType === 3) {
        const frag = document.createDocumentFragment();
        n.textContent.split(/(\s+)/).forEach(p => {
          if (!p) return;
          if (/^\s+$/.test(p)) { frag.append(' '); return; }
          const w = document.createElement('span'); w.className = 'w';
          const i = document.createElement('span'); i.className = 'wi'; i.textContent = p;
          w.append(i); frag.append(w);
        });
        n.replaceWith(frag);
      } else if (n.nodeType === 1 && !n.matches('.ico, br, svg')) walk(n);
    });
    walk(el); el.dataset.split = '1';
    return $$('.wi', el);
  }

  /* ---------- fox life: eyes follow the pointer, blinks, ear wiggles ---------- */
  const pointer = { x: innerWidth / 2, y: innerHeight / 2, vx: 0 };
  let eyeQueued = false;
  function trackEyes() {
    eyeQueued = false;
    $$('.fx-eyes').forEach(g => {
      const r = g.getBoundingClientRect();
      if (r.bottom < -50 || r.top > innerHeight + 50 || !r.width) return;
      const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
      const dx = pointer.x - cx, dy = pointer.y - cy, d = Math.hypot(dx, dy) || 1, k = Math.min(1, d / 260);
      gsap.to(g, { x: dx / d * 4 * k, y: dy / d * 3.4 * k, duration: .35, overwrite: 'auto' });
    });
  }
  function blink(scope = document) {
    const eyes = $$('.fx-eye', scope);
    if (eyes.length) gsap.to(eyes, { scaleY: .08, transformOrigin: '50% 50%', duration: .07, yoyo: true, repeat: 1, ease: 'power1.in' });
  }
  function wiggle(scope) {
    const ears = $$('.fx-ear', scope);
    if (!ears.length) return;
    gsap.set(ears, { transformOrigin: '58% 80%' });
    gsap.to(ears, { keyframes: { rotation: [-14, 10, -6, 0], easeEach: 'sine.inOut' }, duration: .7, overwrite: 'auto' });
  }
  setInterval(() => {
    const foxes = $$('.scoop-fox').filter(s => { const r = s.getBoundingClientRect(); return r.top < innerHeight && r.bottom > 0; });
    foxes.forEach(f => { if (Math.random() < .5) gsap.delayedCall(Math.random() * 1.2, () => blink(f)); });
  }, 2600);

  /* ---------- cursor ---------- */
  const cursor = $('.cursor'), label = $('.cursor-label');
  if (FINE && !RM) {
    document.documentElement.classList.add('has-cursor');
    const dx = gsap.quickTo('.cursor-dot', 'x', { duration: .08 }), dy = gsap.quickTo('.cursor-dot', 'y', { duration: .08 });
    const rx = gsap.quickTo('.cursor-ring', 'x', { duration: .45, ease: 'power3' }), ry = gsap.quickTo('.cursor-ring', 'y', { duration: .45, ease: 'power3' });
    addEventListener('pointermove', e => { dx(e.clientX); dy(e.clientY); rx(e.clientX); ry(e.clientY); cursor.classList.add('on'); }, { passive: true });
    document.addEventListener('pointerleave', () => cursor.classList.remove('on'));
    document.addEventListener('pointerover', e => {
      const t = e.target.closest('[data-cursor]');
      cursor.classList.toggle('label', !!t);
      if (t) label.textContent = t.dataset.cursor;
      const panel = e.target.closest('.lab-panel');
      const sec = e.target.closest('[data-nav]');
      const light = panel ? isLight(panel.dataset.ink) : sec?.dataset.nav === 'light';
      cursor.classList.toggle('light', !!light);
    });
  }
  addEventListener('pointermove', e => {
    pointer.vx = e.clientX - pointer.x; pointer.x = e.clientX; pointer.y = e.clientY;
    if (!eyeQueued) { eyeQueued = true; requestAnimationFrame(trackEyes); }
  }, { passive: true });

  /* ---------- magnetic buttons + tilt cards ---------- */
  if (FINE && !RM) {
    $$('[data-magnetic]').forEach(el => {
      el.addEventListener('pointermove', e => { const r = el.getBoundingClientRect(); gsap.to(el, { x: (e.clientX - r.left - r.width / 2) * .3, y: (e.clientY - r.top - r.height / 2) * .35, duration: .4, ease: 'power3' }); });
      el.addEventListener('pointerleave', () => gsap.to(el, { x: 0, y: 0, duration: .9, ease: 'elastic.out(1, .35)' }));
    });
    $$('[data-tilt]').forEach(el => {
      el.addEventListener('pointermove', e => {
        const r = el.getBoundingClientRect(), px = (e.clientX - r.left) / r.width - .5, py = (e.clientY - r.top) / r.height - .5;
        gsap.to(el, { rotationY: px * 12, rotationX: -py * 10, transformPerspective: 900, duration: .5, ease: 'power3' });
      });
      el.addEventListener('pointerleave', () => gsap.to(el, { rotationY: 0, rotationX: 0, duration: 1, ease: 'elastic.out(1, .4)' }));
    });
  }

  /* ---------- nav ---------- */
  const nav = $('.nav');
  let navTheme = 'light', labActive = false;
  const setNav = t => { if (t !== navTheme) { navTheme = t; nav.dataset.theme = t; } };
  const navTriggers = () => $$('[data-nav]').forEach(s => ScrollTrigger.create({
    trigger: s, start: 'top 40px', end: 'bottom 40px',
    onToggle: self => { if (self.isActive && !(s.id === 'lab' && labActive)) setNav(s.dataset.nav); }
  }));
  if (lenis) {
    let lastY = 0;
    lenis.on('scroll', ({ scroll }) => {
      if (document.body.classList.contains('menu-open')) return;
      nav.classList.toggle('is-hidden', scroll > lastY && scroll > innerHeight * .6);
      lastY = scroll;
    });
  }

  /* ---------- menu ---------- */
  const menu = $('#menu'), burger = $('.burger');
  let menuOpen = false;
  function toggleMenu(force) {
    menuOpen = force ?? !menuOpen;
    const r = burger.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    burger.setAttribute('aria-expanded', menuOpen); menu.setAttribute('aria-hidden', !menuOpen);
    document.body.classList.toggle('menu-open', menuOpen);
    nav.classList.remove('is-hidden');
    if (menuOpen) {
      lenis?.stop(); menu.classList.add('open');
      gsap.fromTo(menu, { clipPath: `circle(0px at ${cx}px ${cy}px)` }, { clipPath: `circle(${Math.hypot(innerWidth, innerHeight) * 1.05}px at ${cx}px ${cy}px)`, duration: RM ? 0 : .9, ease: 'expo.inOut' });
      gsap.fromTo('.menu-links a', { yPercent: 60, opacity: 0 }, { yPercent: 0, opacity: 1, duration: .8, stagger: .045, ease: 'expo.out', delay: RM ? 0 : .25 });
      gsap.fromTo('.menu-scoops > div', { scale: 0, rotation: -30 }, { scale: 1, rotation: 0, duration: 1, stagger: .08, ease: 'back.out(1.8)', delay: .35 });
      gsap.fromTo('.menu-foot p', { y: 20, opacity: 0 }, { y: 0, opacity: 1, stagger: .05, delay: .45, duration: .6 });
    } else {
      gsap.to(menu, { clipPath: `circle(0px at ${cx}px ${cy}px)`, duration: RM ? 0 : .7, ease: 'expo.inOut', onComplete: () => menu.classList.remove('open') });
      lenis?.start();
    }
  }
  burger.addEventListener('click', () => toggleMenu());
  addEventListener('keydown', e => { if (e.key === 'Escape' && menuOpen) toggleMenu(false); });
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const id = a.getAttribute('href');
    if (id.length < 2) return;
    e.preventDefault();
    if (menuOpen) toggleMenu(false);
    scrollToTarget(id);
  });

  /* =====================================================
     HERO
     ===================================================== */
  const ripple = window.Ripple ? Ripple($('.hero-gl'), { scale: .75, still: RM }) : null;
  const hero = $('.hero');
  if (ripple) {
    ripple.start();
    addEventListener('pointermove', e => { if (scrollY < innerHeight) ripple.pointer(e.clientX, e.clientY, Math.abs(pointer.vx) + 4); }, { passive: true });
    ScrollTrigger.create({ trigger: hero, start: 'top bottom', end: 'bottom top', onToggle: s => s.isActive ? ripple.start() : ripple.stop() });
  }

  function heroIntro() {
    const tl = gsap.timeline();
    tl.to(ripple?.state || {}, { fade: 1, duration: 1.4, ease: 'power2.out' }, 0)
      .fromTo('.hw-line', { clipPath: 'inset(-10% 100% -20% 0)' }, { clipPath: 'inset(-10% 0% -20% 0)', duration: 1.8, ease: 'power3.inOut' }, 0)
      .fromTo('.hw-line', { yPercent: 8 }, { yPercent: 0, duration: 1.8, ease: 'power3.out' }, 0)
      .fromTo('.fl', { scale: 0 }, { scale: 1, duration: 1.1, stagger: { each: .05, from: 'center' }, ease: 'back.out(2.2)' }, .3)
      .fromTo('.hero-sticker', { scale: 0, rotation: -120, opacity: 0 }, { scale: 1, rotation: 0, opacity: 1, duration: 1.2, ease: 'back.out(1.8)' }, .6)
      .fromTo(['.hero-tl', '.hero-shops', '.hero-lede', '.hero-scroll'], { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 1, stagger: .08, ease: 'expo.out' }, .7)
      .fromTo('.nav > *', { y: -30, opacity: 0 }, { y: 0, opacity: 1, duration: 1, stagger: .08, ease: 'expo.out' }, .5);
    return tl;
  }

  function heroLive() {
    const stackSvg = $('.hero-stack .stack');
    // floaties bob + mouse parallax
    $$('.fl').forEach((fl, i) => {
      const d = +fl.dataset.depth, inner = fl.firstElementChild;
      gsap.to(inner, { y: '+=' + (8 + d * 6), rotation: '+=' + (i % 2 ? 8 : -8), duration: 2.4 + i * .17, yoyo: true, repeat: -1, ease: 'sine.inOut' });
      fl._qx = gsap.quickTo(fl, 'x', { duration: 1.2, ease: 'power3' });
      gsap.to(fl, { y: -d * 160, ease: 'none', scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true } });
    });
    const sx = gsap.quickTo(stackSvg, 'x', { duration: 1.2, ease: 'power3' }), sr = gsap.quickTo(stackSvg, 'rotation', { duration: 1.2, ease: 'power3' });
    hero.addEventListener('pointermove', e => {
      const px = e.clientX / innerWidth - .5;
      sx(px * 30); sr(px * 4);
      $$('.fl').forEach(fl => fl._qx(-px * 60 * +fl.dataset.depth));
    });
    gsap.set(stackSvg, { transformOrigin: '50% 100%' });
    hero.querySelector('.hero-stack').addEventListener('pointerenter', () => wiggle(hero));
    // drips breathe
    gsap.to($$('.drip', stackSvg), { scaleY: 1.18, transformOrigin: '50% 0%', duration: 2.2, yoyo: true, repeat: -1, ease: 'sine.inOut', stagger: .4 });
    // scroll out
    const st = { trigger: hero, start: 'top top', end: 'bottom top', scrub: true };
    gsap.to('.hw-line', { yPercent: -40, ease: 'none', scrollTrigger: st });
    gsap.to('.hero-stack', { y: () => -innerHeight * .1, scale: .9, ease: 'none', scrollTrigger: st });
    gsap.to(['.hero-tl', '.hero-lede', '.hero-shops', '.hero-scroll'], { y: -80, opacity: 0, ease: 'none', scrollTrigger: { ...st, end: '40% top' } });
    gsap.to('.hero-sticker', { y: -200, rotation: 180, ease: 'none', scrollTrigger: st });
  }

  /* =====================================================
     LOADER — scoops stack up, the fox wakes, then everything melts away
     ===================================================== */
  const loader = $('#loader'), fly = $('#ld-fly');
  fly.innerHTML = Art.stack({ scoops: HERO_SCOOPS, cls: 'ld-stack', label: 'A waffle cone with lavender and strawberry scoops, topped with a fox-faced scoop' });
  const flyScoops = $$('.scoop', fly), flyBase = $('.stack-base-in', fly);
  const STATUS = [[0, 'preheating the waffle iron…'], [18, 'separating eggs by hand…'], [40, 'churning the cream…'], [64, 'raiding the local farms…'], [88, 'waking up the fox…']];

  const pageReady = Promise.all([
    document.fonts ? document.fonts.ready : Promise.resolve(),
    document.readyState === 'complete' ? Promise.resolve() : new Promise(r => addEventListener('load', r, { once: true }))
  ]);

  function drop(el) {
    return gsap.timeline()
      .fromTo(el, { y: -1200, rotation: gsap.utils.random(-14, 14), opacity: 1 }, { y: 0, rotation: 0, duration: .6, ease: 'power3.in' })
      .to(el, { scaleY: .8, scaleX: 1.1, transformOrigin: '50% 80%', duration: .08, ease: 'power1.out' })
      .to(el, { scaleY: 1, scaleX: 1, duration: .9, ease: 'elastic.out(1, .32)' })
      .fromTo(flyBase, { y: 0 }, { y: 10, duration: .08, yoyo: true, repeat: 1, ease: 'power1.out' }, .6);
  }

  function runLoader() {
    gsap.set(flyScoops, { opacity: 0 });
    const fox = flyScoops[2];
    gsap.set($('.fx-eyes', fox), { opacity: 0 }); gsap.set($('.fx-sleep', fox), { opacity: 1 });
    const num = $('.ld-num'), txt = $('.ld-text');
    const p = { v: 0 }; let dropped = 0, si = 0;
    const thresholds = [26, 58, 100];
    const onUpdate = () => {
      const v = Math.round(p.v);
      num.textContent = v;
      while (si < STATUS.length && v >= STATUS[si][0]) { txt.textContent = STATUS[si][1]; si++; }
      while (dropped < 3 && v >= thresholds[dropped]) drop(flyScoops[dropped++]);
    };
    gsap.from('.ld-top, .ld-bottom', { opacity: 0, y: 20, duration: .8, ease: 'expo.out' });
    gsap.from('.ld-sprinkles span', { scale: 0, rotation: '+=180', duration: 1, stagger: .03, ease: 'back.out(2)' });
    gsap.to('.ld-sprinkles span', { y: '+=30', duration: 3, ease: 'sine.inOut', yoyo: true, repeat: -1, stagger: { each: .15, from: 'random' } });
    const tl = gsap.timeline();
    tl.from(flyBase, { y: 700, rotation: 8, duration: 1, ease: 'expo.out' })
      .to(p, { v: 84, duration: 2.4, ease: 'power1.inOut', onUpdate }, .2);
    return tl.then(() => pageReady).then(() => new Promise(res => {
      gsap.timeline({ onComplete: res })
        .to(p, { v: 100, duration: .6, ease: 'power2.out', onUpdate })
        .add(() => { txt.textContent = 'oh hey!'; }, '+=.7')
        .to($('.fx-sleep', fox), { opacity: 0, duration: .1 })
        .fromTo($('.fx-eyes', fox), { opacity: 0, scaleY: .1 }, { opacity: 1, scaleY: 1, transformOrigin: '50% 50%', duration: .35, ease: 'back.out(3)' }, '<')
        .add(() => wiggle(fox), '<')
        .add(() => blink(fox), '+=.45')
        .to({}, { duration: .55 });
    }));
  }

  function melt() {
    return new Promise(res => {
      const W = innerWidth, H = innerHeight, n = Math.max(6, Math.round(W / 84));
      const drips = Array.from({ length: n }, (_, i) => ({ x: (i + .5) * W / n + (Math.random() - .5) * 26, w: 16 + Math.random() * 24, k: .45 + Math.random() * .9 }));
      const maxL = H * .55, f = 9;
      const path = q => {
        const y0 = H * Math.pow(q, 1.7) * 1.02;
        let d = `M0,${H + 2} L0,${y0.toFixed(1)}`;
        drips.forEach(dr => {
          const L = Math.max(f + 1, Math.min(maxL, dr.k * maxL * Math.sin(Math.min(1, q * 1.5) * Math.PI / 2))), l = dr.x - dr.w / 2, r = dr.x + dr.w / 2;
          d += ` L${(l - f).toFixed(1)},${y0.toFixed(1)} Q${l.toFixed(1)},${y0.toFixed(1)} ${l.toFixed(1)},${(y0 + f).toFixed(1)} L${l.toFixed(1)},${(y0 + L).toFixed(1)}` +
            ` A${(dr.w / 2).toFixed(1)},${(dr.w / 2).toFixed(1)} 0 0 0 ${r.toFixed(1)},${(y0 + L).toFixed(1)} L${r.toFixed(1)},${(y0 + f).toFixed(1)} Q${r.toFixed(1)},${y0.toFixed(1)} ${(r + f).toFixed(1)},${y0.toFixed(1)}`;
        });
        return `path('${d} L${W},${y0.toFixed(1)} L${W},${H + 2} Z')`;
      };
      const canClip = CSS.supports('clip-path', "path('M0 0 L1 1 Z')");
      const st = { q: 0 };
      gsap.to(st, {
        q: 1, duration: RM ? .01 : 1.7, ease: 'power1.inOut',
        onUpdate: () => { if (canClip) loader.style.clipPath = path(st.q); else loader.style.opacity = 1 - st.q; },
        onComplete: () => { loader.remove(); res(); }
      });
    });
  }

  function flyToHero() {
    const to = heroStack.getBoundingClientRect(), from = fly.getBoundingClientRect();
    gsap.set(fly, { left: from.left, top: from.top, height: from.height, xPercent: 0, yPercent: 0, x: 0, y: 0, transform: 'none' });
    return gsap.to(fly, {
      left: to.left, top: to.top, height: to.height, duration: RM ? .01 : 1.5, ease: 'expo.inOut',
      onComplete: () => {
        const svg = $('.stack', fly);
        svg.classList.remove('ld-stack');
        heroStack.appendChild(svg); fly.remove();
      }
    });
  }

  /* =====================================================
     SECTIONS
     ===================================================== */
  function sections() {
    const mm = gsap.matchMedia();
    // flavor lab
    const lab = $('#lab'), track = $('.lab-track'), panels = $$('.lab-panel', track);
    const labNum = $('.lab-count b'), labName = $('.lab-name'), labBar = $('.lab-bar i');
    mm.add('(min-width: 900px)', () => {
      const dist = () => track.scrollWidth - innerWidth;
      const n = panels.length;
      const colors = gsap.timeline({ paused: true });
      panels.forEach((p, i) => { if (i) colors.to(lab, { backgroundColor: p.dataset.bg, color: p.dataset.ink, duration: .5, ease: 'none' }, i - .75); });
      colors.set({}, {}, n - 1);
      let last = -1;
      const tween = gsap.to(track, {
        x: () => -dist(), ease: 'none',
        scrollTrigger: {
          trigger: lab, start: 'top top', end: () => '+=' + dist(), pin: true, scrub: .8, invalidateOnRefresh: true, anticipatePin: 1,
          onToggle: s => { labActive = s.isActive; },
          onUpdate: s => {
            colors.progress(s.progress);
            labBar.style.transform = `scaleX(${s.progress})`;
            const idx = Math.round(s.progress * (n - 1));
            if (idx !== last) {
              last = idx;
              const p = panels[idx];
              setNav(isLight(p.dataset.ink) ? 'light' : 'dark');
              labNum.textContent = String(Math.min(showcase.length, Math.max(0, idx))).padStart(2, '0');
              labName.textContent = p.classList.contains('lp') ? $('.lp-name', p).textContent : (idx ? 'the full board ↓' : 'the flavor lab');
            }
          }
        }
      });
      panels.forEach(p => {
        const base = { trigger: p, containerAnimation: tween, start: 'left right', end: 'right left', scrub: true };
        const cone = $('.lp-cone', p);
        if (cone) gsap.fromTo(cone, { rotation: 14, xPercent: 40 }, { rotation: -10, xPercent: -30, ease: 'none', scrollTrigger: base });
        const ghost = $('.lp-ghost', p);
        if (ghost) gsap.fromTo(ghost, { xPercent: -10, yPercent: -50 }, { xPercent: -90, yPercent: -50, ease: 'none', scrollTrigger: base });
        $$('.lp-fl', p).forEach((fl, k) => gsap.fromTo(fl, { y: 120 * (k + 1), rotation: -40 }, { y: -120 * (k + 1), rotation: 40, ease: 'none', scrollTrigger: base }));
        const ring = $('.lp-ring', p);
        if (ring) gsap.fromTo(ring, { scale: .6 }, { scale: 1.15, ease: 'none', scrollTrigger: base });
        const name = $('.lp-name', p);
        if (name) {
          const w = splitWords(name);
          gsap.fromTo(w, { yPercent: 110 }, { yPercent: 0, stagger: .07, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: p, containerAnimation: tween, start: 'left 55%', toggleActions: 'play none none reverse' } });
          gsap.from($$('.lp-tag, .lp-ing li, .lp-tags span, .lp-num', p), { y: 30, opacity: 0, stagger: .04, duration: .8, ease: 'expo.out', scrollTrigger: { trigger: p, containerAnimation: tween, start: 'left 45%', toggleActions: 'play none none reverse' } });
        }
      });
      $$('.lia').forEach((l, i) => gsap.to(l, { y: i % 2 ? 18 : -18, rotation: i % 2 ? '+=5' : '-=5', duration: 2.2 + i * .3, yoyo: true, repeat: -1, ease: 'sine.inOut' }));
      return () => gsap.set(lab, { clearProps: 'backgroundColor,color' });
    });
    mm.add('(max-width: 899px)', () => {
      gsap.set('.lp-ghost', { xPercent: -50, yPercent: -50 });
      panels.forEach(p => {
        const cone = $('.lp-cone', p);
        if (cone) gsap.from(cone, { scale: .6, rotation: -14, duration: 1.2, ease: 'back.out(1.6)', scrollTrigger: { trigger: p, start: 'top 70%' } });
        const name = $('.lp-name', p);
        if (name) gsap.fromTo(splitWords(name), { yPercent: 110 }, { yPercent: 0, stagger: .07, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: name, start: 'top 85%' } });
        ScrollTrigger.create({ trigger: p, start: 'top 40px', end: 'bottom 40px', onToggle: s => s.isActive && setNav(isLight(p.dataset.ink) ? 'light' : 'dark') });
      });
    });


    // headings: words rise
    $$('.story-cols, .board h2, .stackit h2, .treats h2, .shops h2, .pack h2, .news-title, .lab-intro h2, .lab-outro h2').forEach(el => {
      if (el.classList.contains('story-cols')) return;
      const words = splitWords(el);
      gsap.fromTo(words, { yPercent: 110 }, { yPercent: 0, duration: 1.1, stagger: .06, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 85%' } });
    });
    $$('[data-reveal], .stack-sub, .pack-sub, .news-sub, .board-head .filters, .eyebrow').forEach(el => {
      gsap.from(el, { y: 36, opacity: 0, duration: 1.1, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 90%' } });
    });

    // bands: velocity-reactive marquee
    const bands = $$('.band').map(b => ({ el: b, track: $('.band-track', b), dir: +b.dataset.speed, x: 0 }));
    gsap.ticker.add((t, dt) => {
      const v = lenis ? Math.abs(lenis.velocity) : 0;
      bands.forEach(b => {
        const half = b.track.scrollWidth / 2; if (!half) return;
        b.x -= b.dir * (0.06 + Math.min(v, 40) * .012) * dt;
        b.x = ((b.x % half) + half) % half;
        gsap.set(b.track, { x: b.dir > 0 ? -b.x : b.x - half });
      });
    });
    gsap.fromTo('.band-a', { rotation: -7 }, { rotation: -3, ease: 'none', scrollTrigger: { trigger: '.xband', start: 'top bottom', end: 'bottom top', scrub: true } });
    gsap.fromTo('.band-b', { rotation: 6 }, { rotation: 2, ease: 'none', scrollTrigger: { trigger: '.xband', start: 'top bottom', end: 'bottom top', scrub: true } });

    // drips stretch as you scroll past
    $$('.drips').forEach(d => {
      gsap.fromTo($$('.dr', d), { scaleY: .25 }, { scaleY: 1, transformOrigin: '50% 0%', ease: 'none', stagger: { each: .02, from: 'random' }, scrollTrigger: { trigger: d, start: 'top 95%', end: 'top 25%', scrub: .6 } });
    });

    // statement fills word by word
    const st = $('.statement');
    const parts = [];
    [...st.childNodes].forEach(n => {
      if (n.nodeType === 3) {
        const frag = document.createDocumentFragment();
        n.textContent.split(/(\s+)/).forEach(p => { if (!p) return; if (/^\s+$/.test(p)) frag.append(' '); else { const s = document.createElement('span'); s.className = 'sw'; s.textContent = p; frag.append(s); parts.push(s); } });
        n.replaceWith(frag);
      } else if (n.nodeType === 1) { n.classList.add('sw'); parts.push(n); }
    });
    gsap.to(parts, { opacity: 1, stagger: .1, ease: 'none', scrollTrigger: { trigger: st, start: 'top 78%', end: 'bottom 45%', scrub: .5 } });
    gsap.from('.statement .ico', { scale: 0, rotation: -40, duration: 1, ease: 'back.out(2)', stagger: .2, scrollTrigger: { trigger: st, start: 'top 60%' } });

    // pillars
    gsap.from('.pillar', { y: 160, rotation: (i) => [-6, 3, 7][i], opacity: 0, duration: 1.4, stagger: .12, ease: 'expo.out', scrollTrigger: { trigger: '.pillars', start: 'top 85%' } });
    $$('.pillar-art').forEach((p, i) => gsap.to(p.firstElementChild, { y: -12, rotation: i % 2 ? 4 : -4, duration: 2.6 + i * .3, yoyo: true, repeat: -1, ease: 'sine.inOut' }));
    gsap.to('.egg-yolk', { y: 26, duration: 1.4, ease: 'bounce.out', repeat: -1, repeatDelay: 1.2 });

    // board
    ScrollTrigger.batch(rows, { start: 'top 92%', onEnter: els => gsap.fromTo(els, { y: 40, opacity: 0 }, { y: 0, opacity: 1, stagger: .04, duration: .9, ease: 'expo.out', overwrite: true }) });
    $$('.filters .chip').forEach(c => c.addEventListener('click', () => {
      $$('.filters .chip').forEach(x => x.classList.toggle('is-on', x === c));
      const k = c.dataset.filter;
      const show = rows.filter(r => match(r, k));
      rows.forEach(r => r.classList.toggle('is-hidden', !show.includes(r)));
      gsap.fromTo(show, { y: 24, opacity: 0 }, { y: 0, opacity: 1, stagger: .025, duration: .6, ease: 'expo.out', overwrite: true });
      ScrollTrigger.refresh();
    }));
    const prev = $('.board-preview'), prevArt = $('.bp-art'), prevTag = $('.bp-tag'), cache = {};
    if (FINE) {
      const px = gsap.quickTo(prev, 'x', { duration: .55, ease: 'power3' }), py = gsap.quickTo(prev, 'y', { duration: .55, ease: 'power3' });
      const pr = gsap.quickTo(prev, 'rotation', { duration: .8, ease: 'power3' });
      gsap.set(prev, { xPercent: -50, yPercent: -60, scale: .4 });
      board.addEventListener('pointermove', e => { px(e.clientX + 150); py(e.clientY); pr(gsap.utils.clamp(-14, 14, pointer.vx * .8)); });
      rows.forEach(r => r.addEventListener('pointerenter', () => {
        const f = F(r.dataset.id);
        prevArt.innerHTML = cache[f.id] ||= Art.stack({ scoops: [sc(f, { seed: f.id + 'pv' })], base: 'cup', cupColor: '#FBEED7' });
        prevTag.textContent = f.tag;
        gsap.to(prev, { opacity: 1, scale: 1, duration: .5, ease: 'back.out(2)', overwrite: 'auto' });
        gsap.fromTo($('.scoop', prevArt), { y: -60, scaleY: 1.2 }, { y: 0, scaleY: 1, duration: .6, ease: 'bounce.out', transformOrigin: '50% 100%' });
      }));
      board.addEventListener('pointerleave', () => gsap.to(prev, { opacity: 0, scale: .4, duration: .35, ease: 'power3.in', overwrite: 'auto' }));
    }
    rows.forEach(r => {
      const toggle = () => { r.classList.toggle('is-open'); };
      r.addEventListener('click', () => { if (!FINE) toggle(); });
      r.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); } });
    });

    // stack it
    stackGame();

    // treats, shops
    gsap.from('.treat', { y: 140, rotation: i => [-5, 4, -3, 6][i % 4], opacity: 0, duration: 1.3, stagger: .1, ease: 'expo.out', scrollTrigger: { trigger: '.treat-grid', start: 'top 85%' } });
    gsap.from('.shop, .map', { y: 100, opacity: 0, duration: 1.2, stagger: .12, ease: 'expo.out', scrollTrigger: { trigger: '.shops-grid', start: 'top 85%' } });
    const route = $('.map .route'), trav = $('.map .traveler');
    if (route && trav) {
      const len = route.getTotalLength(), place = q => { const pt = route.getPointAtLength(q * len); trav.setAttribute('transform', `translate(${pt.x} ${pt.y})`); };
      place(0);
      ScrollTrigger.create({ trigger: '.shops', start: 'top 70%', end: 'bottom 40%', scrub: true, onUpdate: s => place(s.progress) });
    }
    gsap.to('.map .waves path', { x: 14, duration: 2.4, yoyo: true, repeat: -1, ease: 'sine.inOut', stagger: { each: .2, from: 'random' } });
    gsap.to('.map .pin-pulse', { scale: 2.4, opacity: 0, transformOrigin: '50% 50%', duration: 1.8, repeat: -1, ease: 'power1.out', stagger: .9 });
    gsap.to('.map .pin-fox', { y: -6, duration: 1.4, yoyo: true, repeat: -1, ease: 'sine.inOut', stagger: .5 });

    // the pack pops up
    const foxes = $$('.pack-fox');
    gsap.set(foxes, { yPercent: 42 });
    gsap.fromTo(foxes, { yPercent: 110 }, { yPercent: 42, duration: 1.1, ease: 'back.out(1.6)', stagger: { each: .07, from: 'center' }, scrollTrigger: { trigger: '.pack-row', start: 'top 95%' } });
    foxes.forEach(f => f.addEventListener('pointerenter', () => {
      gsap.timeline().to(f, { yPercent: 20, duration: .25, ease: 'power2.out' }).to(f, { yPercent: 42, duration: .8, ease: 'bounce.out' });
      wiggle(f); blink(f);
    }));

    // footer goo wordmark (needs the script font to measure drip points)
    (document.fonts ? document.fonts.load('470px "Mr Dafoe"') : Promise.resolve()).then(footerWord, footerWord);
  }

  /* ---------- stack it game ---------- */
  function stackGame() {
    const stage = $('.stack-stage'), svg = $('.stack', stage), g = $('.stack-scoops', svg), readout = $('.stack-readout');
    const picks = []; let ears = false, busy = false;
    const NAMES = ['', 'the solo act.', 'the double date.', 'the triple threat.', 'the full send.'];
    const say = () => {
      if (!picks.length) { readout.innerHTML = '<b>your cone is empty.</b> tragic, honestly.'; return; }
      readout.innerHTML = `<b>${NAMES[picks.length]}</b> ${picks.map(f => f.name).join(' + ')}${ears ? ' — now with ears.' : '.'}${picks.length === STACK_MAX ? ' respect.' : ''}`;
    };
    const wobble = () => gsap.fromTo(svg, { rotation: -4 }, { rotation: 0, duration: 1.1, ease: 'elastic.out(1, .3)', transformOrigin: '50% 100%' });
    const redrawTop = (fox) => {
      const top = g.lastElementChild; if (!top) return;
      const i = picks.length - 1, f = picks[i];
      const inner = $('.scoop', top);
      inner.innerHTML = Art.scoop(sc(f, { seed: f.id + i, fox }));
      inner.classList.toggle('scoop-fox', fox);
      if (fox) { gsap.from($$('.fx-ear', inner), { scale: 0, transformOrigin: '58% 90%', duration: .7, ease: 'back.out(3)', stagger: .08 }); gsap.from($('.fx-face', inner), { opacity: 0, duration: .3 }); }
    };
    function add(f) {
      if (busy) return;
      if (picks.length >= STACK_MAX) { wobble(); readout.innerHTML = '<b>whoa there.</b> four scoops is the legal limit. (lick it clean to start over.)'; return; }
      if (ears) redrawTop(false);
      const i = picks.length; picks.push(f);
      g.insertAdjacentHTML('beforeend', Art.scoopAt(sc(f, { seed: f.id + i, fox: ears }), i, stackGeo.rimY));
      const el = $('.scoop', g.lastElementChild);
      gsap.timeline()
        .fromTo(el, { y: -1100, rotation: gsap.utils.random(-20, 20) }, { y: 0, rotation: 0, duration: .55, ease: 'power3.in' })
        .to(el, { scaleY: .78, scaleX: 1.12, transformOrigin: '50% 80%', duration: .08 })
        .to(el, { scaleY: 1, scaleX: 1, duration: .9, ease: 'elastic.out(1, .3)' })
        .add(wobble, .55);
      say();
    }
    $$('.schip').forEach(c => c.addEventListener('click', () => add(F(c.dataset.id))));
    $('[data-act="ears"]').addEventListener('click', e => {
      if (!picks.length) { readout.innerHTML = '<b>ears need a scoop</b> to sit on. pick a flavor first!'; return; }
      ears = !ears; redrawTop(ears); e.currentTarget.textContent = ears ? 'remove fox ears' : 'add fox ears'; say();
    });
    $('[data-act="reset"]').addEventListener('click', () => {
      if (!picks.length || busy) return;
      busy = true;
      gsap.to($$('.scoop', g).reverse(), {
        y: -1100, rotation: () => gsap.utils.random(-50, 50), duration: .6, stagger: .07, ease: 'power3.in',
        onComplete: () => { g.innerHTML = ''; picks.length = 0; ears = false; busy = false; $('[data-act="ears"]').textContent = 'add fox ears'; say(); }
      });
    });
    // auto-demo the first time it scrolls into view
    ScrollTrigger.create({ trigger: stage, start: 'top 65%', once: true, onEnter: () => {
      if (picks.length) return;
      add(F('golden-hour'));
      gsap.delayedCall(.6, () => add(F('lavender-haze')));
    } });
  }

  /* ---------- footer: a gooey wordmark that drips forever ---------- */
  function footerWord() {
    const wrap = $('.foot-word');
    const W = 2000, H = 620, FS = 470, BASE = 400;
    // find where the letters touch bottom by rasterizing the wordmark
    const cv = document.createElement('canvas'); cv.width = W; cv.height = H;
    const ctx = cv.getContext('2d');
    ctx.font = `${FS}px "Mr Dafoe"`; ctx.textAlign = 'center'; ctx.fillText('little fox', W / 2, BASE);
    const data = ctx.getImageData(0, 0, W, H).data, alpha = (x, y) => data[(y * W + x) * 4 + 3];
    let minX = W, maxX = 0, maxY = 0, minY = H;
    const lows = [];
    for (let x = 0; x < W; x += 3) {
      let top = -1;
      for (let y = 0; y < H; y++) if (alpha(x, y) > 128) { top = y; break; }
      if (top < 0) continue;
      minY = Math.min(minY, top);
      for (let y = H - 1; y > 0; y--) if (alpha(x, y) > 128) { lows.push({ x, y }); minX = Math.min(minX, x); maxX = Math.max(maxX, x); maxY = Math.max(maxY, y); break; }
    }
    // local minima of the lower outline = natural drip points
    const pts = lows.filter((p, i) => i > 2 && i < lows.length - 3 && p.y >= lows[i - 3].y && p.y >= lows[i + 3].y && p.y > BASE - 40)
      .filter((p, i, arr) => !i || p.x - arr[i - 1].x > 30);
    const r = Art.rng('foot');
    const drops = pts.map((p, i) => `<ellipse class="fd" cx="${p.x}" cy="${p.y - 6}" rx="0" ry="0" data-i="${i}"/>`).join('');
    const vbX = Math.max(0, minX - 30), vbW = Math.min(W, maxX + 30) - vbX;
    const vbY = Math.max(0, minY - 14);
    wrap.innerHTML = `<svg viewBox="${vbX} ${vbY} ${vbW} ${maxY + 200 - vbY}" aria-hidden="true">
      <defs><filter id="goo" x="-10%" y="-10%" width="120%" height="140%"><feGaussianBlur in="SourceGraphic" stdDeviation="7" result="b"/>
      <feColorMatrix in="b" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 26 -11" result="g"/><feComposite in="SourceGraphic" in2="g" operator="atop"/></filter></defs>
      <g filter="url(#goo)" fill="#FBEED7"><text x="${W / 2}" y="${BASE}" text-anchor="middle" font-family="Mr Dafoe, cursive" font-size="${FS}">little fox</text>${drops}</g></svg>`;
    const tls = $$('.fd', wrap).map(c => {
      const len = 120 + r() * 160, big = 18 + r() * 10, y0 = +c.getAttribute('cy');
      return gsap.timeline({ repeat: -1, repeatDelay: r() * 2, delay: r() * 2.5, paused: true })
        .to(c, { attr: { rx: big, ry: big * 1.15, cy: y0 + big * .7 }, duration: 1.6, ease: 'sine.inOut' })
        .to(c, { attr: { cy: y0 + big + len, rx: big * .6, ry: big * .95 }, duration: .95, ease: 'power2.in' })
        .to(c, { attr: { rx: 0, ry: 0 }, duration: .18 })
        .set(c, { attr: { cy: y0 } });
    });
    ScrollTrigger.create({ trigger: wrap, start: 'top bottom', end: 'bottom top', onToggle: s => tls.forEach(t => s.isActive ? t.play() : t.pause()) });
    gsap.from(wrap, { yPercent: 30, opacity: 0, duration: 1.4, ease: 'expo.out', scrollTrigger: { trigger: wrap, start: 'top 95%' } });
  }

  /* =====================================================
     BOOT
     ===================================================== */
  async function boot() {
    gsap.set('.nav > *', { opacity: 0 });
    gsap.set(['.hero-tl', '.hero-shops', '.hero-lede', '.hero-scroll', '.hero-sticker'], { opacity: 0 });
    gsap.set('.fl', { scale: 0 });
    gsap.set('.hw-line', { clipPath: 'inset(-10% 100% -20% 0)' });
    sections();
    navTriggers();
    if (ScrollTrigger.sort) ScrollTrigger.sort();
    if (RM) {
      await pageReady;
      gsap.set(flyScoops, { opacity: 1 });
      flyToHero().progress(1);
      loader.remove();
    } else {
      await runLoader();
      flyToHero();
      gsap.delayedCall(.25, () => heroIntro());
      await melt();
    }
    document.body.classList.remove('is-loading');
    scrollTo(0, 0);
    lenis?.scrollTo(0, { immediate: true, force: true });
    if (RM) heroIntro().progress(1);
    lenis?.start();
    ScrollTrigger.refresh();
    heroLive();
    setNav('light');
  }
  boot();
  document.fonts?.ready.then(() => ScrollTrigger.refresh());
})();
