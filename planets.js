/* ═══════════════════════════════════════════
   DRAGON BALL — planets.js  v2
   Planetas flotando libres en el espacio
   ═══════════════════════════════════════════ */

(function initPlanetSystem() {

  // ══════════════════════════════════════
  // PLANET DATA
  // ══════════════════════════════════════
  const PLANET_DATA = {
    db: {
      name:      'Planeta Tierra',
      tag:       'PLANETA DB · SISTEMA SOLAR',
      img:       'img/Planeta.png',
      auraColor: 'rgba(60,140,255,.3)',
      bgFrom:    'rgba(10,20,60,.98)',
      size:      88,           // px en pantalla
      // posición relativa en % de la ventana — zona derecha media
      baseX: 72, baseY: 28,
      floatAmp:  12,
      floatDur:  4.2,
      floatDelay:0,
      spinDur:   28,
    },
    vegeta: {
      name:      'Planeta Vegeta',
      tag:       'PLANETA VEGETA · SISTEMA SAIYAN',
      img:       'img/planeta_vegeta.png',
      auraColor: 'rgba(255,60,0,.32)',
      bgFrom:    'rgba(40,10,5,.98)',
      size:      74,
      baseX: 82, baseY: 52,
      floatAmp:  9,
      floatDur:  5.5,
      floatDelay:1.4,
      spinDur:   22,
      spinReverse: true,
    },
    namek: {
      name:      'Planeta Namek',
      tag:       'PLANETA NAMEK · SECTOR 9045',
      img:       'img/planeta_namek.png',
      auraColor: 'rgba(40,220,90,.3)',
      bgFrom:    'rgba(5,25,10,.98)',
      size:      80,
      baseX: 68, baseY: 60,
      floatAmp:  14,
      floatDur:  6.0,
      floatDelay:2.8,
      spinDur:   35,
    },
  };

  const PLANET_CHARS = {
    db:     ['Goku','Krillin','Yamcha','Ten Shin Han','Piccolo','Gohan','Videl','Androide 18','Bulma','Maestro Roshi'],
    vegeta: ['Vegeta','Goku (Kakarotto)','Raditz','Nappa','Broly','Rey Vegeta','Bardock','Paragus'],
    namek:  ['Piccolo','Nail','Guru','Dende','Kami','Cargo','Moori','Lord Slug'],
  };

  const PLANET_STATS = {
    db: [
      { label:'Sistema',    value:'Solar' },
      { label:'Gravedad',   value:'10x Estándar' },
      { label:'Atmósfera',  value:'Oxígeno-Nitrógeno' },
      { label:'Superficie', value:'Tierra · Océanos' },
      { label:'Estado',     value:'✅ Habitado' },
    ],
    vegeta: [
      { label:'Raza',       value:'Saiyans' },
      { label:'Gravedad',   value:'10x Tierra' },
      { label:'Estado',     value:'💥 Destruido' },
      { label:'Destructor', value:'Freezer' },
      { label:'Rey',        value:'Rey Vegeta' },
    ],
    namek: [
      { label:'Raza',    value:'Namekianos' },
      { label:'Soles',   value:'3 Soles' },
      { label:'Esferas', value:'Esferas Namek' },
      { label:'Estado',  value:'⚠️ Destruido / Nuevo Namek' },
      { label:'Creador', value:'Gran Anciano' },
    ],
  };

  const PLANET_DESC = {
    db:     'La Tierra es el planeta principal donde transcurre gran parte de las aventuras de Dragon Ball. Hogar de guerreros humanos, Saiyans adaptados y los famosos Dragones Eternos invocados por las Esferas del Dragón. A pesar de su aparente normalidad, ha sido escenario de batallas que han decidido el destino del universo.',
    vegeta: 'El Planeta Vegeta fue el hogar de la poderosa raza guerrera de los Saiyans. Gobernado por el Rey Vegeta y bajo la dictadura de Freezer, fue destruido con un solo golpe del Señor del Universo. Solo unos pocos Saiyans sobrevivieron: Goku, Vegeta, Raditz, Nappa y Broly. Su herencia vive en cada transformación Super Saiyan.',
    namek:  'Planeta Namek es el mundo natal de los Namekianos, creadores de sus propias Esferas del Dragón. Iluminado por tres soles, su superficie es de un verde vibrante. Fue escenario de la épica batalla contra Freezer. Tras su destrucción, los Namekianos fueron transportados temporalmente a la Tierra hasta crear el Nuevo Namek.',
  };

  // ══════════════════════════════════════
  // BUILD FLOATING PLANETS DOM
  // ══════════════════════════════════════
  const container = document.createElement('div');
  container.id = 'floatingPlanets';
  document.body.appendChild(container);

  Object.entries(PLANET_DATA).forEach(([key, p]) => {
    const s = p.size;

    const wrap = document.createElement('div');
    wrap.className = 'fp-planet';
    wrap.dataset.planet = key;

    // Position
    wrap.style.cssText = `
      left: ${p.baseX}%;
      top:  ${p.baseY}%;
      transform: translate(-50%, -50%);
    `;

    // Float animation via CSS custom keyframes injected per-planet
    const animName = `fpFloat_${key}`;
    if (!document.getElementById(`style_${animName}`)) {
      const st = document.createElement('style');
      st.id = `style_${animName}`;
      st.textContent = `
        @keyframes ${animName} {
          0%,100% { transform: translate(-50%, calc(-50% + 0px)); }
          50%     { transform: translate(-50%, calc(-50% - ${p.floatAmp}px)); }
        }
        .fp-planet[data-planet="${key}"] {
          animation: ${animName} ${p.floatDur}s ease-in-out infinite;
          animation-delay: -${p.floatDelay}s;
        }
      `;
      document.head.appendChild(st);
    }

    // Spin animation
    const spinName = `fpSpin_${key}`;
    if (!document.getElementById(`style_${spinName}`)) {
      const st2 = document.createElement('style');
      st2.id = `style_${spinName}`;
      st2.textContent = `
        @keyframes ${spinName} {
          from { transform: rotate(0deg); }
          to   { transform: rotate(${p.spinReverse ? '-' : ''}360deg); }
        }
        .fp-planet[data-planet="${key}"] .fp-img {
          animation: ${spinName} ${p.spinDur}s linear infinite;
        }
      `;
      document.head.appendChild(st2);
    }

    wrap.innerHTML = `
      <div class="fp-img-wrap" style="width:${s}px;height:${s}px;">
        <div class="fp-glow" style="inset:-${s*.35}px;"></div>
        <img class="fp-img" src="${p.img}" alt="${p.name}"
             style="width:${s}px;height:${s}px;"
             onerror="this.style.opacity='.15'">
      </div>
      <span class="fp-label">${p.name}</span>
    `;

    container.appendChild(wrap);

    // Click → warp → detail
    wrap.addEventListener('click', () => {
      // ki burst
      const rect = wrap.getBoundingClientRect();
      const burst = document.createElement('div');
      burst.className = 'ki-burst';
      burst.style.left = (rect.left + rect.width  / 2) + 'px';
      burst.style.top  = (rect.top  + rect.height / 2) + 'px';
      document.body.appendChild(burst);
      setTimeout(() => burst.remove(), 700);

      fireWarp(key, () => openPlanetDetail(key));
    });
  });


  // ══════════════════════════════════════
  // WARP ANIMATION
  // ══════════════════════════════════════
  // Build warp DOM if not exists
  if (!document.getElementById('warpOverlay')) {
    const wo = document.createElement('div');
    wo.id = 'warpOverlay';
    wo.innerHTML = `
      <canvas id="warpCanvas"></canvas>
      <div id="warpLabel">
        <div id="warpPlanetName"></div>
        <div id="warpSubtitle">Viajando al destino...</div>
      </div>`;
    document.body.appendChild(wo);
  }

  function fireWarp(planetKey, onDone) {
    const overlay = document.getElementById('warpOverlay');
    const canvas  = document.getElementById('warpCanvas');
    const nameEl  = document.getElementById('warpPlanetName');
    const data    = PLANET_DATA[planetKey];

    nameEl.textContent = data.name.toUpperCase();
    overlay.classList.add('active');

    const W = canvas.width  = window.innerWidth;
    const H = canvas.height = window.innerHeight;
    const cx = W / 2, cy = H / 2;
    const ctx = canvas.getContext('2d');

    const streaks = Array.from({length: 300}, () => {
      const angle = Math.random() * Math.PI * 2;
      const dist  = 5 + Math.random() * Math.min(W, H) * .06;
      return {
        x: cx + Math.cos(angle) * dist,
        y: cy + Math.sin(angle) * dist,
        angle,
        len: 0,
        maxLen: 100 + Math.random() * 700,
        speed:  1.5 + Math.random() * 3,
        width:  .3 + Math.random() * 1.4,
        col:    Math.random() < .3 ? '255,215,0' : Math.random() < .5 ? '120,190,255' : '255,200,200',
        alpha:  .4 + Math.random() * .6,
      };
    });

    let frame = 0;
    const TOTAL = 115;
    let raf;

    function tick() {
      frame++;
      const prog  = Math.min(1, frame / TOTAL);
      const eased = prog < .5 ? 2*prog*prog : -1 + (4-2*prog)*prog;

      ctx.fillStyle = `rgba(0,0,8,${.2 + eased * .18})`;
      ctx.fillRect(0, 0, W, H);

      const vig = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(W,H)*.75);
      vig.addColorStop(0,'rgba(0,0,0,0)');
      vig.addColorStop(1,`rgba(0,0,12,${.55*eased})`);
      ctx.fillStyle = vig; ctx.fillRect(0,0,W,H);

      streaks.forEach(s => {
        s.len = Math.min(s.maxLen, s.len + s.speed * (1 + eased * 9));
        const ex = s.x + Math.cos(s.angle) * s.len;
        const ey = s.y + Math.sin(s.angle) * s.len;
        const g  = ctx.createLinearGradient(s.x, s.y, ex, ey);
        g.addColorStop(0, `rgba(${s.col},0)`);
        g.addColorStop(.5,`rgba(${s.col},${s.alpha * eased})`);
        g.addColorStop(1, `rgba(255,255,255,${s.alpha * eased})`);
        ctx.save();
        ctx.strokeStyle = g;
        ctx.lineWidth   = s.width + eased * 1.8;
        ctx.beginPath(); ctx.moveTo(s.x, s.y); ctx.lineTo(ex, ey); ctx.stroke();
        ctx.restore();
      });

      // White flash at end
      if (prog > .72) {
        const fp = (prog - .72) / .28;
        const fg = ctx.createRadialGradient(cx,cy,0,cx,cy,Math.max(W,H));
        fg.addColorStop(0,`rgba(255,255,255,${fp*.92})`);
        fg.addColorStop(.35,`rgba(200,220,255,${fp*.55})`);
        fg.addColorStop(1,'transparent');
        ctx.fillStyle = fg; ctx.fillRect(0,0,W,H);
      }

      if (frame === 38) overlay.classList.add('show-label');

      if (frame >= TOTAL) {
        cancelAnimationFrame(raf);
        overlay.classList.remove('active','show-label');
        ctx.clearRect(0,0,W,H);
        onDone();
        return;
      }
      raf = requestAnimationFrame(tick);
    }

    raf = requestAnimationFrame(tick);
    setTimeout(() => {
      overlay.classList.remove('active','show-label');
      if (raf) cancelAnimationFrame(raf);
      onDone();
    }, 3500);
  }


  // ══════════════════════════════════════
  // PLANET DETAIL OVERLAY
  // ══════════════════════════════════════
  if (!document.getElementById('planetDetailOverlay')) {
    const pd = document.createElement('div');
    pd.id = 'planetDetailOverlay';
    pd.innerHTML = `
      <canvas id="planetDetailBg"></canvas>
      <button id="planetDetailClose">✕ VOLVER</button>
      <div id="planetDetailContent">
        <div id="planetDetailLeft">
          <div id="planetDetailImgWrap">
            <div id="planetDetailAura"></div>
            <img id="planetDetailImg" src="" alt="">
          </div>
        </div>
        <div id="planetDetailRight">
          <div id="planetDetailTag"></div>
          <h2 id="planetDetailName"></h2>
          <div id="planetDetailStats"></div>
          <p id="planetDetailDesc"></p>
          <div id="planetDetailCharacters"></div>
        </div>
      </div>`;
    document.body.appendChild(pd);
  }

  let detailBgRaf = null;

  function startDetailBg(planetKey) {
    if (detailBgRaf) cancelAnimationFrame(detailBgRaf);
    const canvas = document.getElementById('planetDetailBg');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    const W = canvas.width, H = canvas.height;
    const data = PLANET_DATA[planetKey];

    const stars = Array.from({length:220}, () => ({
      x: Math.random()*W, y: Math.random()*H,
      r: Math.random()*1.8,
      a: .1+Math.random()*.9,
      ph: Math.random()*Math.PI*2,
    }));

    let frame = 0;
    function loop() {
      frame++;
      ctx.clearRect(0,0,W,H);

      const bg = ctx.createRadialGradient(W*.3,H*.2,0,W*.5,H*.5,Math.max(W,H));
      bg.addColorStop(0, data.bgFrom);
      bg.addColorStop(1, '#010104');
      ctx.fillStyle = bg; ctx.fillRect(0,0,W,H);

      stars.forEach(s => {
        ctx.save();
        ctx.globalAlpha = s.a * (.45 + .55*Math.sin(frame*.022+s.ph));
        ctx.fillStyle = '#fff';
        ctx.beginPath(); ctx.arc(s.x,s.y,s.r,0,Math.PI*2); ctx.fill();
        ctx.restore();
      });

      const ng = ctx.createRadialGradient(W*.72,H*.28,0,W*.72,H*.28,W*.48);
      ng.addColorStop(0, data.auraColor.replace(/[\d.]+\)$/, '.05)'));
      ng.addColorStop(1,'transparent');
      ctx.fillStyle = ng; ctx.fillRect(0,0,W,H);

      detailBgRaf = requestAnimationFrame(loop);
    }
    loop();
  }

  function openPlanetDetail(planetKey) {
    const overlay = document.getElementById('planetDetailOverlay');
    const data    = PLANET_DATA[planetKey];
    if (!overlay || !data) return;

    overlay.setAttribute('data-planet', planetKey);

    document.getElementById('planetDetailImg').src = data.img;
    document.getElementById('planetDetailImg').alt = data.name;
    document.getElementById('planetDetailAura').style.background =
      `radial-gradient(circle, ${data.auraColor} 0%, transparent 70%)`;
    document.getElementById('planetDetailTag').textContent  = data.tag;
    document.getElementById('planetDetailName').textContent = data.name;

    document.getElementById('planetDetailStats').innerHTML =
      PLANET_STATS[planetKey].map(s =>
        `<div class="pd-stat"><strong>${s.label}:</strong> ${s.value}</div>`
      ).join('');

    document.getElementById('planetDetailDesc').textContent = PLANET_DESC[planetKey];

    const charsEl = document.getElementById('planetDetailCharacters');
    const chars   = PLANET_CHARS[planetKey] || [];
    charsEl.innerHTML = chars.length
      ? `<h3>GUERREROS CONOCIDOS</h3>
         <div class="pd-char-list">
           ${chars.map(c => `<span class="pd-char-chip" data-char="${c}">${c}</span>`).join('')}
         </div>`
      : '';

    charsEl.querySelectorAll('.pd-char-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const name = chip.dataset.char;
        closePlanetDetail();
        setTimeout(() => {
          const inp = document.getElementById('searchInput');
          if (inp) { inp.value = name; inp.dispatchEvent(new Event('input',{bubbles:true})); inp.focus(); }
        }, 300);
      });
    });

    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    startDetailBg(planetKey);
  }

  function closePlanetDetail() {
    const overlay = document.getElementById('planetDetailOverlay');
    if (!overlay) return;
    overlay.classList.remove('open');
    document.body.style.overflow = '';
    if (detailBgRaf) { cancelAnimationFrame(detailBgRaf); detailBgRaf = null; }
  }

  // Close button
  document.addEventListener('click', e => {
    if (e.target.id === 'planetDetailClose') closePlanetDetail();
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closePlanetDetail();
  });

  // Resize
  window.addEventListener('resize', () => {
    ['warpCanvas','planetDetailBg'].forEach(id => {
      const c = document.getElementById(id);
      if (c) { c.width = window.innerWidth; c.height = window.innerHeight; }
    });
  });

})();