/* ═══════════════════════════════════════════
   DRAGON BALL UNIVERSE — app.js
   ═══════════════════════════════════════════ */

// ══════════════════════════════════════
// STATE
// ══════════════════════════════════════
let lang       = 'es';
let chars      = [];
let lastRandom = null;
let acIdx      = -1;
let currentChar = null;   // the full char object currently shown in bio

// DOM refs
const inp        = document.getElementById('searchInput');
const drop       = document.getElementById('dropdown');
const bioWrap    = document.getElementById('bioWrap');
const hint       = document.getElementById('hint');
const initLoader = document.getElementById('initLoader');

// ══════════════════════════════════════
// AUDIO
// ══════════════════════════════════════
const sfxKame = new Audio('kamehameha.m4a');
sfxKame.preload = 'auto';

const sfxTransform = new Audio('transformacion.m4a');
sfxTransform.preload = 'auto';

function playKame() {
  sfxKame.currentTime = 0;
  sfxKame.play().catch(() => {});
}

function playTransform() {
  sfxTransform.currentTime = 0;
  sfxTransform.play().catch(() => {});
}

// ══════════════════════════════════════
// TRANSLATIONS
// ══════════════════════════════════════
const T = {
  es: {
    title:'Dragon Ball', subtitle:'Universo — Explora cada guerrero',
    search:'Buscar guerrero...', random:'Aleatorio',
    initLoad:'Cargando guerreros...', charLoad:'Buscando guerrero...',
    lang:'🇬🇧 English',
    desc:'Descripción', transforms:'Transformaciones',
    power:'Ki base', maxPower:'Ki máximo',
    race:'Raza', gender:'Género', origin:'Planeta', affil:'Afiliación',
    noResults:'Sin resultados',
    hint:'Escribe un nombre para buscar un guerrero',
    trDesc:'Descripción de la transformación',
    trKi:'Ki de transformación',
    loading:'Cargando...',
  },
  en: {
    title:'Dragon Ball', subtitle:'Universe — Explore every warrior',
    search:'Search warrior...', random:'Random',
    initLoad:'Loading warriors...', charLoad:'Finding warrior...',
    lang:'🇪🇸 Español',
    desc:'Description', transforms:'Transformations',
    power:'Base Ki', maxPower:'Max Ki',
    race:'Race', gender:'Gender', origin:'Planet', affil:'Affiliation',
    noResults:'No results',
    hint:'Type a name to search for a warrior',
    trDesc:'Transformation description',
    trKi:'Transformation Ki',
    loading:'Loading...',
  }
};
const t = k => T[lang][k] || k;

// ══════════════════════════════════════
// CANVAS BACKGROUND ANIMATION
// ══════════════════════════════════════
(function initCanvas() {
  const canvas = document.getElementById('bgCanvas');
  const ctx    = canvas.getContext('2d');
  let W = canvas.width  = window.innerWidth;
  let H = canvas.height = window.innerHeight;
  let T = 0;

  window.addEventListener('resize', () => {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  });

  // ── DRAGON BALLS ──
  const balls = Array.from({length:7}, (_,i) => ({
    stars: i+1,
    x: Math.random()*W, y: Math.random()*H,
    r: 18 + Math.random()*22,
    vx: (Math.random()-.5)*.35, vy: (Math.random()-.5)*.35,
    opacity: .07 + Math.random()*.1,
    phase: Math.random()*Math.PI*2,
  }));

  // ── ENERGY STREAKS ──
  const streaks = Array.from({length:14}, () => ({
    x: Math.random()*W, y: Math.random()*H,
    len: 60+Math.random()*140, angle: Math.random()*Math.PI*2,
    speed: .25+Math.random()*.5, opacity:0,
    maxOp: .04+Math.random()*.06, fade: 1,
    color: Math.random()<.5 ? '255,215,0' : '255,107,0',
  }));

  // ── DRAGON BALL HELPERS ──
  function drawBall(b) {
    const op = b.opacity + Math.sin(T*.018+b.phase)*.012;
    const r  = b.r;
    ctx.save(); ctx.globalAlpha=op; ctx.translate(b.x,b.y);
    const gw=ctx.createRadialGradient(0,0,r*.2,0,0,r*2.2);
    gw.addColorStop(0,'rgba(255,215,0,.3)'); gw.addColorStop(1,'rgba(255,107,0,0)');
    ctx.fillStyle=gw; ctx.beginPath(); ctx.arc(0,0,r*2.2,0,Math.PI*2); ctx.fill();
    const gr=ctx.createRadialGradient(-r*.3,-r*.3,r*.05,0,0,r);
    gr.addColorStop(0,'#fff8dc'); gr.addColorStop(.35,'#FFD700');
    gr.addColorStop(.75,'#FF6B00'); gr.addColorStop(1,'#cc3300');
    ctx.fillStyle=gr; ctx.beginPath(); ctx.arc(0,0,r,0,Math.PI*2); ctx.fill();
    ctx.globalAlpha=op*.55;
    const sh=ctx.createRadialGradient(-r*.3,-r*.35,0,-r*.3,-r*.35,r*.55);
    sh.addColorStop(0,'rgba(255,255,255,.55)'); sh.addColorStop(1,'transparent');
    ctx.fillStyle=sh; ctx.beginPath(); ctx.arc(0,0,r,0,Math.PI*2); ctx.fill();
    ctx.globalAlpha=op*.85; ctx.fillStyle='rgba(140,20,0,.85)';
    drawStars(ctx,b.stars,r);
    ctx.restore();
  }

  function drawStars(ctx,count,r){
    getStarPos(count,r).forEach(([sx,sy])=>{
      ctx.beginPath();
      for(let i=0;i<5;i++){
        const a=(i*4*Math.PI/5)-Math.PI/2, a2=a+2*Math.PI/5;
        const ro=r*.13, ri=r*.055;
        if(i===0) ctx.moveTo(sx+ro*Math.cos(a),sy+ro*Math.sin(a));
        else       ctx.lineTo(sx+ro*Math.cos(a),sy+ro*Math.sin(a));
        ctx.lineTo(sx+ri*Math.cos(a2),sy+ri*Math.sin(a2));
      }
      ctx.closePath(); ctx.fill();
    });
  }

  function getStarPos(n,r){
    const s=r*.32;
    switch(n){
      case 1:return[[0,0]];
      case 2:return[[-s*.5,0],[s*.5,0]];
      case 3:return[[0,-s*.5],[s*.45,s*.3],[-s*.45,s*.3]];
      case 4:return[[-s*.4,-s*.4],[s*.4,-s*.4],[-s*.4,s*.4],[s*.4,s*.4]];
      case 5:return[[0,-s*.55],[s*.52,-.17*s],[-s*.52,-.17*s],[.32*s,.44*s],[-.32*s,.44*s]];
      case 6:return[[0,-s*.55],[s*.52,-.17*s],[-s*.52,-.17*s],[.32*s,.44*s],[-.32*s,.44*s],[0,.1*s]];
      case 7:return[[0,0],[0,-s*.55],[s*.52,-.17*s],[-s*.52,-.17*s],[.32*s,.44*s],[-.32*s,.44*s],[0,.58*s]];
      default:return[[0,0]];
    }
  }

  // ── MAIN TICK ──
  function tick() {
    T++;
    ctx.clearRect(0,0,W,H);

    // 1. Energy streaks
    streaks.forEach(s=>{
      s.opacity += .002*s.fade;
      if(s.opacity>=s.maxOp) s.fade=-1;
      if(s.opacity<=0){
        s.fade=1; s.x=Math.random()*W; s.y=Math.random()*H;
        s.angle=Math.random()*Math.PI*2; s.len=60+Math.random()*140;
      }
      ctx.save(); ctx.globalAlpha=Math.max(0,s.opacity);
      const sg=ctx.createLinearGradient(s.x,s.y,s.x+Math.cos(s.angle)*s.len,s.y+Math.sin(s.angle)*s.len);
      sg.addColorStop(0,`rgba(${s.color},0)`);
      sg.addColorStop(.5,`rgba(${s.color},1)`);
      sg.addColorStop(1,`rgba(${s.color},0)`);
      ctx.strokeStyle=sg; ctx.lineWidth=1.5;
      ctx.beginPath(); ctx.moveTo(s.x,s.y);
      ctx.lineTo(s.x+Math.cos(s.angle)*s.len,s.y+Math.sin(s.angle)*s.len);
      ctx.stroke(); ctx.restore();
      s.x+=Math.cos(s.angle)*s.speed; s.y+=Math.sin(s.angle)*s.speed;
    });

    // 2. Dragon Balls
    balls.forEach(b=>{
      drawBall(b);
      b.x+=b.vx; b.y+=b.vy;
      if(b.x<-b.r*3)  b.x=W+b.r*3;
      if(b.x>W+b.r*3) b.x=-b.r*3;
      if(b.y<-b.r*3)  b.y=H+b.r*3;
      if(b.y>H+b.r*3) b.y=-b.r*3;
    });

    requestAnimationFrame(tick);
  }
  tick();
})();

// ══════════════════════════════════════
// API — LOAD FROM BOTH SOURCES
// ══════════════════════════════════════
async function loadAll() {
  initLoader.style.display = 'flex';
  hint.style.display = 'none';
  chars = [];

  // ── Source 1: dragonball-api.com (paginated) ──
  try {
    let page = 1;
    while (page <= 10) {
      const res   = await fetch(`https://dragonball-api.com/api/characters?limit=58&page=${page}`);
      const data  = await res.json();
      const items = data.items || data.characters || data;
      if (!items || !items.length) break;
      chars.push(...items.map(normalise1));
      const meta = data.meta || {};
      if (!meta.totalPages || page >= meta.totalPages) break;
      page++;
    }
  } catch(e) { console.error('API1 error:', e); }

  // ── Source 2: dragonballapi.com (DB / DBZ / DBGT / DBS) ──
  const endpoints2 = [
    'https://www.dragonballapi.com/api/dragonball',
    'https://www.dragonballapi.com/api/dragonballz',
    'https://www.dragonballapi.com/api/dragonballgt',
    'https://www.dragonballapi.com/api/dragonballsuper',
  ];

  const existingNames = new Set(chars.map(c => c.name.toLowerCase().trim()));

  await Promise.allSettled(endpoints2.map(async url => {
    try {
      const res  = await fetch(url);
      const data = await res.json();
      const items = Array.isArray(data) ? data : (data.characters || data.results || []);
      items.forEach(c => {
        const norm = normalise2(c);
        if (!norm.name) return;
        // deduplicate by name
        if (!existingNames.has(norm.name.toLowerCase().trim())) {
          existingNames.add(norm.name.toLowerCase().trim());
          chars.push(norm);
        }
      });
    } catch(e) { /* endpoint unavailable, skip silently */ }
  }));

  // Sort alphabetically
  chars.sort((a,b) => a.name.localeCompare(b.name));

  initLoader.style.display = 'none';
  hint.style.display = '';
  console.log(`✅ Total characters loaded: ${chars.length}`);
}

/** Normalise a character from dragonball-api.com */
function normalise1(c) {
  return {
    id:          c.id || c._id,
    name:        c.name || '?',
    race:        c.race || '',
    gender:      c.gender || '',
    ki:          c.ki,
    maxKi:       c.maxKi,
    affiliation: c.affiliation || '',
    image:       c.image || '',
    description: c.description || '',
    originPlanet:c.originPlanet || null,
    transformations: c.transformations || [],
    _src: 1,
  };
}

/** Normalise a character from dragonballapi.com */
function normalise2(c) {
  return {
    id:          `s2_${c.id || Math.random()}`,
    name:        c.name || c.nombre || '',
    race:        c.race || c.raza || '',
    gender:      c.genre || c.gender || c.genero || '',
    ki:          c.ki || null,
    maxKi:       c.maxKi || null,
    affiliation: c.affiliation || '',
    image:       c.image || c.imagen || '',
    description: c.description || c.descripcion || '',
    originPlanet:c.planet ? { name: c.planet } : null,
    transformations: (c.transformations || []).map(t => ({
      name:  t.title || t.name || t.nombre || '',
      image: t.image || t.imagen || '',
    })),
    _src: 2,
  };
}

async function fetchOne(id) {
  // Source 2 characters have full data already in the chars array
  if (String(id).startsWith('s2_')) {
    return chars.find(c => c.id === id) || {};
  }
  const res = await fetch(`https://dragonball-api.com/api/characters/${id}`);
  const c   = await res.json();
  return normalise1(c);
}

// ══════════════════════════════════════
// TRANSFORMATION DETAIL MODAL
// ══════════════════════════════════════

/**
 * Fetch full transformation data.
 * dragonball-api.com: each transformation has its own endpoint at /api/transformations/:id
 * For source-2 chars we only have inline data (name + image), so we return what we have.
 */
async function fetchTransformation(tr) {
  // If the transformation object already has a description (from detailed fetch), use it
  if (tr.description) return tr;
  // If it has an id, try the API
  if (tr.id) {
    try {
      const res  = await fetch(`https://dragonball-api.com/api/transformations/${tr.id}`);
      const data = await res.json();
      return {
        id:          data.id,
        name:        data.name        || tr.name,
        image:       data.image       || tr.image,
        ki:          data.ki          || null,
        description: data.description || '',
      };
    } catch(e) { /* fall through */ }
  }
  return tr;
}

function openTransformModal(tr, charName) {
  // Remove any existing modal
  const old = document.getElementById('trModal');
  if (old) old.remove();

  const modal = document.createElement('div');
  modal.id = 'trModal';
  modal.className = 'tr-modal-overlay';

  modal.innerHTML = `
    <div class="tr-modal" id="trModalCard">
      <button class="tr-modal-close" id="trModalClose">✕</button>
      <div class="tr-modal-inner">
        <div class="tr-modal-img-wrap">
          <img src="${tr.image || ''}" alt="${tr.name}" onerror="this.style.opacity='.1'">
        </div>
        <div class="tr-modal-body">
          <div class="tr-modal-from">${charName}</div>
          <div class="tr-modal-name">${tr.name}</div>
          ${tr.ki ? `<div class="tr-modal-ki-wrap">
            <span class="tr-modal-ki-label">${t('trKi')}</span>
            <span class="tr-modal-ki-val">${fmtKi(tr.ki)}</span>
          </div>` : ''}
          <div class="tr-modal-desc-wrap">
            ${tr.description
              ? `<p class="tr-modal-desc">${tr.description}</p>`
              : `<p class="tr-modal-no-desc">—</p>`}
          </div>
        </div>
      </div>
    </div>`;

  document.body.appendChild(modal);

  // Animate in
  requestAnimationFrame(() => modal.classList.add('open'));

  // Close handlers
  document.getElementById('trModalClose').onclick = closeTransformModal;
  modal.addEventListener('pointerdown', e => {
    if (e.target === modal) closeTransformModal();
  });
}

async function showTransformation(tr, charName) {
  // Fire transformation animation, then open modal (and fetch in parallel)
  const fetchPromise = (!tr.description && tr.id) ? fetchTransformation(tr) : Promise.resolve(tr);

  fireTransformAnimation(tr, charName, async () => {
    openTransformModal(tr, charName);

    if (!tr.description && tr.id) {
      const desc = document.querySelector('.tr-modal-desc-wrap');
      if (desc) desc.innerHTML = `<p class="tr-modal-loading"><span class="tr-spinner"></span>${t('loading')}</p>`;

      const full = await fetchPromise;
      const descWrap = document.querySelector('.tr-modal-desc-wrap');
      if (descWrap) {
        descWrap.innerHTML = full.description
          ? `<p class="tr-modal-desc">${full.description}</p>`
          : `<p class="tr-modal-no-desc">—</p>`;
      }
      if (full.ki && !tr.ki) {
        const kiWrap = document.querySelector('.tr-modal-ki-wrap');
        if (!kiWrap) {
          const nameEl = document.querySelector('.tr-modal-name');
          if (nameEl) {
            const kiDiv = document.createElement('div');
            kiDiv.className = 'tr-modal-ki-wrap';
            kiDiv.innerHTML = `<span class="tr-modal-ki-label">${t('trKi')}</span><span class="tr-modal-ki-val">${fmtKi(full.ki)}</span>`;
            nameEl.insertAdjacentElement('afterend', kiDiv);
          }
        }
      }
    }
  });
}

// ══════════════════════════════════════
// TRANSFORMATION ANIMATION
// ══════════════════════════════════════
function fireTransformAnimation(tr, charName, onDone) {
  if (document.getElementById('trAnim')) return;

  const W = window.innerWidth;
  const H = window.innerHeight;
  const cx = W / 2, cy = H / 2;

  /* ── Overlay + canvas ── */
  const overlay = document.createElement('div');
  overlay.id = 'trAnim';
  overlay.style.cssText = `
    position:fixed;inset:0;z-index:60000;
    background:rgba(0,0,0,0);pointer-events:all;
    display:flex;align-items:center;justify-content:center;
  `;

  const canvas = document.createElement('canvas');
  canvas.width = W; canvas.height = H;
  canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;';
  overlay.appendChild(canvas);

  /* ── Name label ── */
  const label = document.createElement('div');
  label.style.cssText = `
    position:absolute;top:50%;left:50%;
    transform:translate(-50%,-50%);
    text-align:center;pointer-events:none;
    opacity:0;transition:opacity .15s;
    z-index:2;
  `;
  label.innerHTML = `
    <div style="font-family:'Bangers',cursive;font-size:clamp(1rem,4vw,2.2rem);
      letter-spacing:5px;color:#fff;text-transform:uppercase;
      text-shadow:0 0 20px rgba(255,215,0,1),0 0 50px rgba(255,150,0,.9),0 0 100px rgba(255,80,0,.6);
      margin-bottom:.3rem;opacity:.7;">${charName}</div>
    <div style="font-family:'Bangers',cursive;font-size:clamp(2rem,8vw,5rem);
      letter-spacing:6px;color:#FFD700;text-transform:uppercase;
      background:linear-gradient(135deg,#fff 0%,#FFD700 35%,#FF6B00 70%,#FF2200 100%);
      -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;
      text-shadow:none;filter:drop-shadow(0 0 30px rgba(255,215,0,1)) drop-shadow(0 0 60px rgba(255,107,0,.8));
      animation:trNamePulse .2s ease-in-out infinite alternate;">${tr.name}</div>
  `;
  // inject keyframe if not present
  if (!document.getElementById('trAnimStyles')) {
    const st = document.createElement('style');
    st.id = 'trAnimStyles';
    st.textContent = `
      @keyframes trNamePulse {
        from{filter:drop-shadow(0 0 20px rgba(255,215,0,.9)) drop-shadow(0 0 40px rgba(255,107,0,.6));}
        to  {filter:drop-shadow(0 0 45px rgba(255,215,0,1))  drop-shadow(0 0 90px rgba(255,107,0,1)) drop-shadow(0 0 140px rgba(255,50,0,.7));}
      }
    `;
    document.head.appendChild(st);
  }
  overlay.appendChild(label);
  document.body.appendChild(overlay);
  playTransform();
  const ctx = canvas.getContext('2d');

  /* ── Colour palette picked from transformation ── */
  // Gold/orange for Saiyan, blue/white for SSB, green for Namek, etc.
  // We pick by name keywords
  const nm = (tr.name || '').toLowerCase();
  let auraHue = 45;   // gold default
  let auraHue2 = 20;
  if (nm.includes('blue') || nm.includes('ssb') || nm.includes('god blue') || nm.includes('azul')) { auraHue=200; auraHue2=210; }
  else if (nm.includes('red') || nm.includes('rojo') || nm.includes('kaioken'))  { auraHue=0;   auraHue2=15;  }
  else if (nm.includes('green') || nm.includes('verde') || nm.includes('piccolo')){ auraHue=115; auraHue2=140; }
  else if (nm.includes('purple') || nm.includes('morado') || nm.includes('hit')) { auraHue=280; auraHue2=300; }
  else if (nm.includes('white') || nm.includes('blanco') || nm.includes('ultra'))  { auraHue=200; auraHue2=180; }
  else if (nm.includes('rose') || nm.includes('rosé') || nm.includes('pink'))    { auraHue=320; auraHue2=340; }

  /* ── Particles ── */
  const particles = [];
  function spawnParticle() {
    const angle = Math.random() * Math.PI * 2;
    const dist  = 30 + Math.random() * Math.min(W, H) * .45;
    particles.push({
      x: cx + Math.cos(angle) * dist,
      y: cy + Math.sin(angle) * dist,
      tx: cx + (Math.random() - .5) * 60,
      ty: cy + (Math.random() - .5) * 60,
      r: 1.5 + Math.random() * 4,
      alpha: .7 + Math.random() * .3,
      speed: 4 + Math.random() * 8,
      trail: [],
    });
  }

  /* ── Lightning bolts ── */
  const bolts = [];
  function spawnBolt() {
    const angle = Math.random() * Math.PI * 2;
    const len   = 80 + Math.random() * 180;
    bolts.push({
      x: cx, y: cy,
      angle, len,
      life: 1, decay: .08 + Math.random() * .1,
      segs: Math.floor(4 + Math.random() * 5),
      width: .5 + Math.random() * 2,
    });
  }

  /* ── Shockwave rings ── */
  const rings = [];
  function spawnRing(r0 = 0) {
    rings.push({ r: r0, maxR: 200 + Math.random() * 200, alpha: .9, speed: 8 + Math.random() * 6 });
  }

  /* ── Ground cracks (simple lines from center) ── */
  const cracks = Array.from({ length: 12 }, (_, i) => ({
    angle: (i / 12) * Math.PI * 2 + (Math.random() - .5) * .3,
    len: 0,
    maxLen: 80 + Math.random() * 160,
    speed: 6 + Math.random() * 8,
    alpha: 0,
  }));

  /* ── Phases ── */
  // 0: charge(60f)  1: burst(20f)  2: peak(50f)  3: flash(15f)  4: fadeout(30f)
  let phase = 0, frame = 0;
  let raf2;

  function drawLightning(x, y, angle, len, segs, alpha, width) {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = `hsl(${auraHue},100%,85%)`;
    ctx.lineWidth = width;
    ctx.shadowColor = `hsl(${auraHue},100%,70%)`;
    ctx.shadowBlur = 12;
    ctx.beginPath();
    let px = x, py = y;
    for (let i = 0; i < segs; i++) {
      const frac = (i + 1) / segs;
      const ex = x + Math.cos(angle) * len * frac + (Math.random() - .5) * 28;
      const ey = y + Math.sin(angle) * len * frac + (Math.random() - .5) * 28;
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      ctx.lineTo(ex, ey);
      px = ex; py = ey;
    }
    ctx.stroke();
    ctx.restore();
  }

  function tick2() {
    ctx.clearRect(0, 0, W, H);
    frame++;

    /* ══ PHASE 0 — CHARGE ══ */
    if (phase === 0) {
      const prog = frame / 60;

      // dark vignette build
      const vig = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(W, H) * .8);
      vig.addColorStop(0, 'transparent');
      vig.addColorStop(1, `rgba(0,0,0,${prog * .7})`);
      ctx.fillStyle = vig; ctx.fillRect(0, 0, W, H);

      // ground cracks grow
      cracks.forEach(c => {
        c.len = Math.min(c.maxLen, c.len + c.speed * prog * 1.5);
        c.alpha = Math.min(.6, c.alpha + .04);
        ctx.save();
        ctx.globalAlpha = c.alpha * prog;
        ctx.strokeStyle = `hsl(${auraHue},90%,65%)`;
        ctx.lineWidth = 1.2;
        ctx.shadowColor = `hsl(${auraHue},100%,70%)`;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + Math.cos(c.angle) * c.len, cy + Math.sin(c.angle) * c.len);
        ctx.stroke();
        ctx.restore();
      });

      // spawn + draw particles
      if (frame % 2 === 0) spawnParticle();
      if (frame % 8 === 0) spawnBolt();

      particles.forEach((p, i) => {
        const dx = p.tx - p.x, dy = p.ty - p.y, d = Math.hypot(dx, dy);
        if (d < p.speed) { particles.splice(i, 1); return; }
        p.trail.push({ x: p.x, y: p.y });
        if (p.trail.length > 7) p.trail.shift();
        p.x += (dx / d) * p.speed; p.y += (dy / d) * p.speed;
        p.trail.forEach((tp, ti) => {
          ctx.save(); ctx.globalAlpha = p.alpha * (ti / p.trail.length) * .35;
          ctx.fillStyle = `hsl(${auraHue},100%,75%)`;
          ctx.beginPath(); ctx.arc(tp.x, tp.y, p.r * (ti / p.trail.length), 0, Math.PI * 2); ctx.fill();
          ctx.restore();
        });
        ctx.save(); ctx.globalAlpha = p.alpha;
        const pg = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 2.2);
        pg.addColorStop(0, '#fff'); pg.addColorStop(.5, `hsl(${auraHue},100%,70%)`); pg.addColorStop(1, 'transparent');
        ctx.fillStyle = pg; ctx.beginPath(); ctx.arc(p.x, p.y, p.r * 2.2, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
      });

      bolts.forEach((b, i) => {
        b.life -= b.decay;
        if (b.life <= 0) { bolts.splice(i, 1); return; }
        drawLightning(b.x, b.y, b.angle, b.len, b.segs, b.life * .7, b.width);
      });

      // inner aura glow (growing)
      const auraR = 40 + prog * 80;
      const ag = ctx.createRadialGradient(cx, cy, 0, cx, cy, auraR * 2.5);
      ag.addColorStop(0, `hsla(${auraHue},100%,85%,${.3 + prog * .3})`);
      ag.addColorStop(.4, `hsla(${auraHue},100%,60%,${.15 + prog * .15})`);
      ag.addColorStop(1, 'transparent');
      ctx.fillStyle = ag; ctx.beginPath(); ctx.arc(cx, cy, auraR * 2.5, 0, Math.PI * 2); ctx.fill();

      // screen shake on last 10 frames
      if (frame > 50) {
        const s = (frame - 50) / 10 * 8;
        document.body.style.transform = `translate(${(Math.random()-.5)*s}px,${(Math.random()-.5)*s}px)`;
      }

      if (frame >= 60) { phase = 1; frame = 0; spawnRing(0); spawnRing(20); spawnRing(40); }

    /* ══ PHASE 1 — BURST ══ */
    } else if (phase === 1) {
      const prog = frame / 20;

      // full white flash building
      ctx.fillStyle = `rgba(255,255,255,${prog * .9})`;
      ctx.fillRect(0, 0, W, H);

      // aura explosion
      const auraR2 = 80 + prog * 250;
      const ag2 = ctx.createRadialGradient(cx, cy, 0, cx, cy, auraR2);
      ag2.addColorStop(0, `hsla(${auraHue},100%,95%,${1 - prog * .5})`);
      ag2.addColorStop(.3, `hsla(${auraHue},100%,70%,${.8 - prog * .4})`);
      ag2.addColorStop(1, 'transparent');
      ctx.fillStyle = ag2; ctx.beginPath(); ctx.arc(cx, cy, auraR2, 0, Math.PI * 2); ctx.fill();

      rings.forEach(r => {
        r.r += r.speed; r.alpha -= .04;
        if (r.alpha <= 0) return;
        ctx.save(); ctx.globalAlpha = r.alpha;
        ctx.strokeStyle = `hsl(${auraHue},100%,80%)`;
        ctx.lineWidth = 3;
        ctx.shadowColor = `hsl(${auraHue},100%,70%)`;
        ctx.shadowBlur = 20;
        ctx.beginPath(); ctx.arc(cx, cy, r.r, 0, Math.PI * 2); ctx.stroke();
        ctx.restore();
      });

      document.body.style.transform = `translate(${(Math.random()-.5)*14}px,${(Math.random()-.5)*14}px)`;

      if (frame >= 20) { phase = 2; frame = 0; label.style.opacity = '1'; spawnRing(); spawnRing(60); }

    /* ══ PHASE 2 — PEAK AURA ══ */
    } else if (phase === 2) {
      const prog = frame / 50;

      // fading white bg
      ctx.fillStyle = `rgba(255,255,255,${Math.max(0, .9 - prog * 1.8)})`;
      ctx.fillRect(0, 0, W, H);

      // dark vignette
      const vig3 = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(W, H) * .7);
      vig3.addColorStop(0, 'transparent');
      vig3.addColorStop(1, `rgba(0,0,0,${prog * .6})`);
      ctx.fillStyle = vig3; ctx.fillRect(0, 0, W, H);

      // pulsing aura columns (vertical streaks like DB transformations)
      const pulse = Math.sin(frame * .35) * .3;
      for (let i = 0; i < 3; i++) {
        const colH = (H * (.4 + i * .15 + pulse * .08));
        const colW = 55 - i * 12;
        const cx2  = cx + (i - 1) * 28;
        const cg = ctx.createLinearGradient(cx2, cy + colH * .5, cx2, cy - colH * .5);
        cg.addColorStop(0, 'transparent');
        cg.addColorStop(.3, `hsla(${auraHue},100%,75%,${.15 + (1-prog)*.25})`);
        cg.addColorStop(.5, `hsla(${auraHue2},100%,85%,${.35 + (1-prog)*.35})`);
        cg.addColorStop(.7, `hsla(${auraHue},100%,75%,${.15 + (1-prog)*.25})`);
        cg.addColorStop(1, 'transparent');
        ctx.fillStyle = cg;
        ctx.fillRect(cx2 - colW/2, cy - colH/2, colW, colH);
      }

      // aura halo
      const haloR = 120 + Math.sin(frame * .25) * 25;
      const hg = ctx.createRadialGradient(cx, cy, 0, cx, cy, haloR * 2);
      hg.addColorStop(0, `hsla(${auraHue},100%,90%,.35)`);
      hg.addColorStop(.35, `hsla(${auraHue},100%,65%,.2)`);
      hg.addColorStop(.7, `hsla(${auraHue2},100%,50%,.08)`);
      hg.addColorStop(1, 'transparent');
      ctx.fillStyle = hg; ctx.beginPath(); ctx.arc(cx, cy, haloR * 2, 0, Math.PI * 2); ctx.fill();

      // outer energy ring
      const eRing = 90 + Math.sin(frame * .3) * 20;
      ctx.save();
      ctx.globalAlpha = .55;
      ctx.strokeStyle = `hsl(${auraHue},100%,80%)`;
      ctx.lineWidth = 2.5;
      ctx.shadowColor = `hsl(${auraHue},100%,70%)`;
      ctx.shadowBlur = 18;
      ctx.beginPath(); ctx.arc(cx, cy, eRing, 0, Math.PI * 2); ctx.stroke();
      ctx.restore();

      // lightning bolts
      if (frame % 5 === 0) spawnBolt();
      bolts.forEach((b, i) => {
        b.life -= b.decay;
        if (b.life <= 0) { bolts.splice(i, 1); return; }
        drawLightning(b.x, b.y, b.angle, b.len * .7, b.segs, b.life * .6, b.width);
      });

      rings.forEach(r => {
        r.r += r.speed; r.alpha -= .02;
        if (r.alpha <= 0) return;
        ctx.save(); ctx.globalAlpha = r.alpha * (1 - prog);
        ctx.strokeStyle = `hsl(${auraHue},100%,80%)`;
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(cx, cy, r.r, 0, Math.PI * 2); ctx.stroke();
        ctx.restore();
      });

      // ground cracks (lingering)
      cracks.forEach(c => {
        ctx.save(); ctx.globalAlpha = c.alpha * (1 - prog * .8);
        ctx.strokeStyle = `hsl(${auraHue},80%,60%)`; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(cx, cy);
        ctx.lineTo(cx + Math.cos(c.angle) * c.len, cy + Math.sin(c.angle) * c.len);
        ctx.stroke(); ctx.restore();
      });

      // gentle screen shake at start
      if (frame < 10) {
        const s = (1 - frame / 10) * 6;
        document.body.style.transform = `translate(${(Math.random()-.5)*s}px,${(Math.random()-.5)*s}px)`;
      } else {
        document.body.style.transform = '';
      }

      if (frame >= 50) { phase = 3; frame = 0; }

    /* ══ PHASE 3 — FADE OUT ══ */
    } else if (phase === 3) {
      const prog = frame / 30;

      // fade everything to black
      ctx.fillStyle = `rgba(0,0,0,${prog})`;
      ctx.fillRect(0, 0, W, H);

      label.style.opacity = `${1 - prog}`;

      if (frame >= 30) {
        cancelAnimationFrame(raf2);
        document.body.style.transform = '';
        sfxTransform.pause();
        sfxTransform.currentTime = 0;
        overlay.remove();
        onDone();
        return;
      }
    }

    raf2 = requestAnimationFrame(tick2);
  }

  raf2 = requestAnimationFrame(tick2);
  // safety timeout 6s
  setTimeout(() => {
    document.body.style.transform = '';
    sfxTransform.pause();
    sfxTransform.currentTime = 0;
    if (document.getElementById('trAnim')) { overlay.remove(); onDone(); }
  }, 6000);
}

function closeTransformModal() {
  const modal = document.getElementById('trModal');
  if (!modal) return;
  modal.classList.remove('open');
  modal.classList.add('closing');
  setTimeout(() => modal.remove(), 280);
}

// Close modal on Escape
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeTransformModal();
});

// ══════════════════════════════════════
// BIO PANEL
// ══════════════════════════════════════
async function showBio(id) {
  hint.style.display       = 'none';
  bioWrap.innerHTML        = '';
  bioWrap.style.display    = 'flex';
  bioWrap.className        = 'loading';
  bioWrap.innerHTML        = `<div class="spinner"></div><p>${t('charLoad')}</p>`;

  try {
    const c  = await fetchOne(id);
    currentChar = c;                   // ← save for language re-render
    bioWrap.className     = '';
    bioWrap.style.display = 'block';
    renderBio(c);
    setTimeout(() => bioWrap.scrollIntoView({behavior:'smooth',block:'start'}), 60);
  } catch(e) {
    bioWrap.innerHTML = `<p style="text-align:center;color:var(--muted);padding:3rem">Error cargando personaje</p>`;
    console.error(e);
  }
}

function renderBio(c) {
  const ki    = fmtKi(c.ki);
  const maxKi = fmtKi(c.maxKi);

  const chips = [
    [t('race'),   c.race],
    [t('gender'), c.gender],
    [t('origin'), c.originPlanet?.name || c.planet || ''],
    [t('affil'),  c.affiliation],
  ].filter(([,v]) => v)
   .map(([k,v]) => `<span class="chip"><strong>${k}:</strong> ${v}</span>`)
   .join('');

  const trHTML = c.transformations?.length
    ? `<div class="bio-section">
        <h3>${t('transforms')}</h3>
        <div class="bio-transforms">
          ${c.transformations.map((tr, i) => {
            const trData = JSON.stringify(tr).replace(/"/g, '&quot;');
            return `<div class="tr-item tr-clickable" data-tr-idx="${i}" title="${tr.name}">
              <div class="tr-item-img-wrap">
                <img src="${tr.image||''}" alt="${tr.name}" onerror="this.style.opacity='.1'">
                <div class="tr-item-overlay">
                  <span class="tr-item-overlay-icon">🔍</span>
                </div>
              </div>
              <span>${tr.name}</span>
              ${tr.ki ? `<span class="tr-item-ki">${fmtKi(tr.ki)}</span>` : ''}
            </div>`;
          }).join('')}
        </div>
       </div>`
    : '';

  bioWrap.innerHTML = `
    <div class="bio-card">
      <button class="bio-close" id="bioCloseBtn">✕</button>
      <div class="bio-top">
        <div class="bio-img-wrap">
          <img src="${c.image||''}" alt="${c.name}" onerror="this.style.opacity='.15'">
        </div>
        <div class="bio-core">
          <div class="bio-name">${c.name}</div>
          <div class="bio-race">${c.race||''}</div>
          <div class="bio-ki">
            <div class="bio-ki-box">
              <span class="bio-ki-label">${t('power')}</span>
              <span class="bio-ki-val">${ki}</span>
            </div>
            <div class="bio-ki-box">
              <span class="bio-ki-label">${t('maxPower')}</span>
              <span class="bio-ki-val">${maxKi}</span>
            </div>
          </div>
          <div class="bio-chips">${chips}</div>
        </div>
      </div>
      ${c.description
        ? `<div class="bio-section">
            <h3>${t('desc')}</h3>
            <p class="bio-desc">${c.description}</p>
           </div>`
        : ''}
      ${trHTML}
    </div>`;

  // Close button
  document.getElementById('bioCloseBtn').onclick = closeBio;

  // Transformation click handlers
  if (c.transformations?.length) {
    bioWrap.querySelectorAll('.tr-clickable').forEach(el => {
      el.addEventListener('click', () => {
        const idx = parseInt(el.dataset.trIdx);
        const tr  = c.transformations[idx];
        showTransformation(tr, c.name);
      });
    });
  }
}

function closeBio() {
  currentChar           = null;
  bioWrap.innerHTML     = '';
  bioWrap.style.display = 'none';
  hint.style.display    = '';
  inp.value             = '';
  closeDrop();
}

// ══════════════════════════════════════
// DROPDOWN
// ══════════════════════════════════════
function openDrop(query) {
  acIdx = -1;
  const q = query.trim().toLowerCase();
  if (!q) { closeDrop(); return; }

  const matches = chars.filter(c => c.name?.toLowerCase().includes(q)).slice(0,8);

  if (!matches.length) {
    drop.innerHTML = `<div class="dd-empty">🐉 ${t('noResults')}</div>`;
  } else {
    drop.innerHTML = matches.map((c,i) => {
      const id = c.id || c._id;
      const nm = hlStr(c.name, query.trim());
      return `<div class="dd-item" data-id="${id}" data-i="${i}">
        <img class="dd-img" src="${c.image||''}" alt="${c.name}" onerror="this.style.opacity='.1'">
        <div class="dd-info">
          <div class="dd-name">${nm}</div>
          <div class="dd-race">${c.race||'—'}</div>
        </div>
        <span class="dd-arrow">›</span>
      </div>`;
    }).join('');

  }

  drop.classList.add('open');
}

function closeDrop() {
  drop.classList.remove('open');
  drop.innerHTML = '';
  acIdx = -1;
}

function hlStr(name, q) {
  if (!q) return name;
  const esc = q.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
  return name.replace(new RegExp(`(${esc})`,'gi'),'<mark>$1</mark>');
}

// ══════════════════════════════════════
// DROPDOWN EVENTS
// ══════════════════════════════════════

// Flag: user pressed down inside dropdown, don't close on blur
let dropPointerDown = false;

// Step 1: mark that pointer went down inside dropdown
drop.addEventListener('pointerdown', e => {
  e.preventDefault();         // stop input from blurring
  e.stopPropagation();        // stop document listener from firing
  dropPointerDown = true;
});

// Step 2: on pointerup inside dropdown, find the item and select it
drop.addEventListener('pointerup', e => {
  dropPointerDown = false;
  const item = e.target.closest('.dd-item');
  if (!item) return;
  const id = item.dataset.id;
  inp.value = '';
  closeDrop();
  showBio(id);
});

// Input: open/close dropdown + hide bio while typing
inp.addEventListener('input', function() {
  if (this.value.trim()) {
    // Just hide bio while typing — keep innerHTML + currentChar intact
    bioWrap.style.display = 'none';
    hint.style.display    = 'none';
    openDrop(this.value);
  } else {
    closeDrop();
    if (currentChar) {
      bioWrap.className     = '';
      bioWrap.style.display = 'block';
      hint.style.display    = 'none';
      renderBio(currentChar);  // re-render with current language
    } else {
      hint.style.display    = '';
      bioWrap.style.display = 'none';
    }
  }
});

// Blur: close dropdown only if not clicking inside it
inp.addEventListener('blur', () => {
  if (dropPointerDown) return;
  setTimeout(() => {
    if (!dropPointerDown) closeDrop();
  }, 100);
});

// Keyboard navigation
inp.addEventListener('keydown', function(e) {
  const items = drop.querySelectorAll('.dd-item');
  if (e.key === 'ArrowDown') {
    e.preventDefault();
    acIdx = Math.min(acIdx + 1, items.length - 1);
    setActive(items);
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    acIdx = Math.max(acIdx - 1, 0);
    setActive(items);
  } else if (e.key === 'Enter') {
    e.preventDefault();
    const target = acIdx >= 0 ? items[acIdx] : items.length === 1 ? items[0] : null;
    if (target) { inp.value = ''; closeDrop(); showBio(target.dataset.id); }
  } else if (e.key === 'Escape') {
    closeDrop(); inp.value = '';
  }
});

// Close on click outside
document.addEventListener('pointerdown', e => {
  if (!e.target.closest('.search-wrap')) {
    dropPointerDown = false;
    closeDrop();
  }
});

function setActive(items) {
  items.forEach((el,i) => el.classList.toggle('active', i===acIdx));
  if (items[acIdx]) items[acIdx].scrollIntoView({block:'nearest'});
}

// ══════════════════════════════════════
// RANDOM + KAMEHAMEHA ANIMATION
// ══════════════════════════════════════
document.getElementById('btnRandom').addEventListener('click', function() {
  if (!chars.length || document.getElementById('kameOverlay')) return;

  this.style.transform = 'scale(.88) rotate(-6deg)';
  setTimeout(() => this.style.transform = '', 250);

  let pick;
  do { pick = chars[Math.floor(Math.random() * chars.length)]; }
  while (pick === lastRandom && chars.length > 1);
  lastRandom = pick;
  closeDrop();
  inp.value = '';

  fireKamehameha(pick, () => showBio(pick.id || pick._id));
});

function fireKamehameha(character, onDone) {
  const W = window.innerWidth;
  const H = window.innerHeight;

  /* ── BUILD OVERLAY ── */
  const overlay = document.createElement('div');
  overlay.id = 'kameOverlay';
  overlay.innerHTML = `
    <canvas id="kameCanvas"></canvas>
    <div id="kameUI">
      <div id="kameChargeRing"></div>
      <div id="kameOrb"></div>
    </div>
    <div id="kameLabel">
      <div id="kameLabelJP">かめはめ波！！</div>
      <div id="kameLabelEN">KAMEHAMEHA!!</div>
    </div>
    <div id="kameCharName">${character.name.toUpperCase()}</div>
    <div id="kameFlash"></div>
  `;
  document.body.appendChild(overlay);

  const canvas = document.getElementById('kameCanvas');
  const ctx    = canvas.getContext('2d');
  canvas.width  = W;
  canvas.height = H;

  const cx = W / 2, cy = H / 2;

  /* ── PHASES: charge(120f) → scream(40f) → fire → impact(30f) → fade ── */
  let phase    = 'charge';
  let frame    = 0;
  let beamProgress = 0;   // 0→1 across screen
  let impactT  = 0;
  let fadeT    = 0;
  let particles = [];
  let debris    = [];

  // ── Particle helpers ──
  function addKiParticle() {
    const angle = Math.random() * Math.PI * 2;
    const dist  = 100 + Math.random() * (Math.min(W,H) * .38);
    particles.push({
      x: cx + Math.cos(angle)*dist, y: cy + Math.sin(angle)*dist,
      tx: cx, ty: cy,
      r: 1.5 + Math.random()*5,
      hue: 190 + Math.random()*40,
      speed: 3.5 + Math.random()*5,
      alpha: .8 + Math.random()*.2,
      trail: [],
    });
  }

  function addDebris(x, y) {
    for (let i = 0; i < 8; i++) {
      const a = Math.random()*Math.PI*2;
      const s = 3 + Math.random()*9;
      debris.push({ x, y, vx: Math.cos(a)*s, vy: Math.sin(a)*s,
        r: 2+Math.random()*5, alpha: 1, hue: 190+Math.random()*60 });
    }
  }

  // ── Draw helpers ──
  function drawOrb(progress) {
    const r = 45 + Math.sin(frame*.22)*15 + progress*30;
    // outer halo layers
    [r*4, r*2.5, r*1.5].forEach((hr, i) => {
      const a = [.06,.13,.25][i];
      const g = ctx.createRadialGradient(cx,cy,0,cx,cy,hr);
      g.addColorStop(0, `hsla(210,100%,75%,${a})`);
      g.addColorStop(1, 'transparent');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx,cy,hr,0,Math.PI*2); ctx.fill();
    });
    // core
    const cg = ctx.createRadialGradient(cx-r*.25,cy-r*.25,r*.05, cx,cy,r);
    cg.addColorStop(0,   '#ffffff');
    cg.addColorStop(.25, '#b8e0ff');
    cg.addColorStop(.6,  '#4090ff');
    cg.addColorStop(1,   '#1030cc');
    ctx.fillStyle = cg; ctx.beginPath(); ctx.arc(cx,cy,r,0,Math.PI*2); ctx.fill();
    // specular
    const sg = ctx.createRadialGradient(cx-r*.3,cy-r*.35,0, cx-r*.3,cy-r*.35,r*.6);
    sg.addColorStop(0,'rgba(255,255,255,.7)'); sg.addColorStop(1,'transparent');
    ctx.fillStyle = sg; ctx.beginPath(); ctx.arc(cx,cy,r,0,Math.PI*2); ctx.fill();
  }

  function drawBeam(progress) {
    const startX = 0;
    const endX   = W * progress;
    const t      = frame * .025;
    // beam wobble height
    const h  = 52 + Math.sin(t*3.1)*8 + Math.cos(t*5.7)*5;

    // far glow
    const fg = ctx.createLinearGradient(cx,cy-h*3,cx,cy+h*3);
    fg.addColorStop(0,'transparent'); fg.addColorStop(.5,'rgba(80,160,255,.09)'); fg.addColorStop(1,'transparent');
    ctx.fillStyle=fg; ctx.fillRect(startX, cy-h*3, endX, h*6);

    // mid glow
    const mg = ctx.createLinearGradient(cx,cy-h*1.8,cx,cy+h*1.8);
    mg.addColorStop(0,'transparent'); mg.addColorStop(.5,'rgba(120,190,255,.22)'); mg.addColorStop(1,'transparent');
    ctx.fillStyle=mg; ctx.fillRect(startX, cy-h*1.8, endX, h*3.6);

    // core beam
    const bg = ctx.createLinearGradient(cx,cy-h,cx,cy+h);
    bg.addColorStop(0,  'rgba(180,225,255,.65)');
    bg.addColorStop(.18,'rgba(120,190,255,.92)');
    bg.addColorStop(.5, 'rgba(255,255,255,1)');
    bg.addColorStop(.82,'rgba(120,190,255,.92)');
    bg.addColorStop(1,  'rgba(180,225,255,.65)');
    ctx.fillStyle=bg; ctx.fillRect(startX, cy-h, endX, h*2);

    // energy lines inside
    ctx.save(); ctx.globalAlpha=.35;
    for (let i=0;i<4;i++) {
      const ly = cy + (Math.sin(t*4+i*1.6)*h*.55);
      const lg = ctx.createLinearGradient(startX,0,endX,0);
      lg.addColorStop(0,'transparent'); lg.addColorStop(.3,'#aaddff');
      lg.addColorStop(.7,'#ffffff'); lg.addColorStop(1,'transparent');
      ctx.strokeStyle=lg; ctx.lineWidth=1.5+Math.sin(t*6+i)*1;
      ctx.beginPath(); ctx.moveTo(startX,ly); ctx.lineTo(endX,ly); ctx.stroke();
    }
    ctx.restore();

    // sparkles
    ctx.save();
    for (let i=0;i<14;i++) {
      const sx = startX + Math.random()*endX;
      const sy = cy + (Math.random()-.5)*h*1.8;
      const sr = .5 + Math.random()*2.5;
      ctx.globalAlpha = Math.random()*.9;
      ctx.fillStyle='#fff';
      ctx.beginPath(); ctx.arc(sx,sy,sr,0,Math.PI*2); ctx.fill();
    }
    ctx.restore();

    // origin burst
    const og = ctx.createRadialGradient(cx,cy,0,cx,cy,h*1.4);
    og.addColorStop(0,'rgba(255,255,255,.9)');
    og.addColorStop(.4,'rgba(150,200,255,.5)');
    og.addColorStop(1,'transparent');
    ctx.fillStyle=og; ctx.beginPath(); ctx.arc(cx,cy,h*1.4,0,Math.PI*2); ctx.fill();
  }

  function drawImpact(ix, t) {
    const pulse = Math.sin(t*.35)*15;
    // shockwave rings
    for (let i=0;i<4;i++) {
      const rr = (t*6+i*35) % 180;
      ctx.save(); ctx.globalAlpha = Math.max(0,(1-rr/180)*.55);
      ctx.strokeStyle=`hsl(${200+i*15},100%,75%)`;
      ctx.lineWidth=3-i*.5;
      ctx.beginPath(); ctx.arc(ix,cy,rr,0,Math.PI*2); ctx.stroke();
      ctx.restore();
    }
    // core explosion
    const er = 60 + pulse;
    const eg = ctx.createRadialGradient(ix,cy,0,ix,cy,er*2.5);
    eg.addColorStop(0,'rgba(255,255,255,1)');
    eg.addColorStop(.2,'rgba(200,230,255,.95)');
    eg.addColorStop(.5,'rgba(80,160,255,.6)');
    eg.addColorStop(.85,'rgba(30,80,200,.15)');
    eg.addColorStop(1,'transparent');
    ctx.fillStyle=eg; ctx.beginPath(); ctx.arc(ix,cy,er*2.5,0,Math.PI*2); ctx.fill();
    // spikes
    ctx.save();
    for (let i=0;i<12;i++) {
      const a = (i/12)*Math.PI*2 + t*.04;
      const sl = 45 + Math.sin(t*.3+i)*25 + pulse;
      const x2 = ix + Math.cos(a)*sl, y2 = cy + Math.sin(a)*sl;
      const sg = ctx.createLinearGradient(ix,cy,x2,y2);
      sg.addColorStop(0,'rgba(255,255,255,.9)'); sg.addColorStop(1,'transparent');
      ctx.strokeStyle=sg; ctx.lineWidth=2.5-i*.1; ctx.globalAlpha=.7;
      ctx.beginPath(); ctx.moveTo(ix,cy); ctx.lineTo(x2,y2); ctx.stroke();
    }
    ctx.restore();
  }

  function tick() {
    ctx.clearRect(0,0,W,H);
    frame++;

    /* ── CHARGE (120 frames ~2s) ── */
    if (phase === 'charge') {
      const prog = frame/120;
      // dark vignette
      const vig = ctx.createRadialGradient(cx,cy,0,cx,cy,Math.max(W,H)*.75);
      vig.addColorStop(0,'transparent');
      vig.addColorStop(1,`rgba(0,0,15,${.3+prog*.4})`);
      ctx.fillStyle=vig; ctx.fillRect(0,0,W,H);

      if (frame%2===0) addKiParticle();

      // particles with trails
      particles = particles.filter(p => {
        const dx=p.tx-p.x, dy=p.ty-p.y, d=Math.sqrt(dx*dx+dy*dy);
        if (d < p.speed+2) { addDebris(cx,cy); return false; }
        p.trail.push({x:p.x,y:p.y});
        if (p.trail.length>8) p.trail.shift();
        p.x+=(dx/d)*p.speed; p.y+=(dy/d)*p.speed;
        // trail
        p.trail.forEach((tp,i)=>{
          ctx.save(); ctx.globalAlpha=p.alpha*(i/p.trail.length)*.4;
          ctx.fillStyle=`hsl(${p.hue},100%,75%)`;
          ctx.beginPath(); ctx.arc(tp.x,tp.y,p.r*(i/p.trail.length),0,Math.PI*2); ctx.fill();
          ctx.restore();
        });
        // particle
        ctx.save(); ctx.globalAlpha=p.alpha;
        const pg=ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,p.r*2);
        pg.addColorStop(0,'#fff'); pg.addColorStop(.5,`hsl(${p.hue},100%,70%)`); pg.addColorStop(1,'transparent');
        ctx.fillStyle=pg; ctx.beginPath(); ctx.arc(p.x,p.y,p.r*2,0,Math.PI*2); ctx.fill();
        ctx.restore();
        return true;
      });

      // debris at orb
      debris = debris.filter(d=>{
        d.x+=d.vx; d.y+=d.vy; d.vx*=.88; d.vy*=.88; d.alpha-=.03;
        if(d.alpha<=0) return false;
        ctx.save(); ctx.globalAlpha=d.alpha;
        ctx.fillStyle=`hsl(${d.hue},100%,70%)`;
        ctx.beginPath(); ctx.arc(d.x,d.y,d.r,0,Math.PI*2); ctx.fill();
        ctx.restore();
        return true;
      });

      drawOrb(prog);

      if (frame >= 120) {
        phase='scream'; frame=0;
        document.getElementById('kameLabel').classList.add('show');
        document.getElementById('kameCharName').classList.add('show');
      }

    /* ── SCREAM (50 frames ~0.8s) ── */
    } else if (phase === 'scream') {
      const prog = frame/50;
      // screen shake
      const shk = (1-prog)*6;
      ctx.save(); ctx.translate((Math.random()-.5)*shk,(Math.random()-.5)*shk);

      const vig2=ctx.createRadialGradient(cx,cy,0,cx,cy,Math.max(W,H)*.7);
      vig2.addColorStop(0,'transparent'); vig2.addColorStop(1,'rgba(0,0,20,.7)');
      ctx.fillStyle=vig2; ctx.fillRect(0,0,W,H);

      if(frame%2===0) addKiParticle();
      particles=particles.filter(p=>{
        const dx=p.tx-p.x,dy=p.ty-p.y,d=Math.sqrt(dx*dx+dy*dy);
        if(d<p.speed+2){return false;}
        p.x+=(dx/d)*p.speed*1.4; p.y+=(dy/d)*p.speed*1.4;
        ctx.save(); ctx.globalAlpha=p.alpha;
        const pg=ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,p.r*2);
        pg.addColorStop(0,'#fff'); pg.addColorStop(.5,`hsl(${p.hue},100%,70%)`); pg.addColorStop(1,'transparent');
        ctx.fillStyle=pg; ctx.beginPath(); ctx.arc(p.x,p.y,p.r*2,0,Math.PI*2); ctx.fill();
        ctx.restore(); return true;
      });
      drawOrb(1+prog*.5);
      ctx.restore();

      if (frame>=50) { phase='fire'; frame=0;
        document.getElementById('kameUI').style.display='none';
        document.getElementById('kameLabel').classList.add('fire');
      }

    /* ── FIRE ── */
    } else if (phase === 'fire') {
      beamProgress = Math.min(1, beamProgress + .012);
      const eased  = 1 - Math.pow(1-beamProgress, 3);

      // screen flash at start
      if(frame<8){ ctx.fillStyle=`rgba(200,230,255,${.5*(1-frame/8)})`; ctx.fillRect(0,0,W,H); }

      drawBeam(eased);

      // debris fading
      debris=debris.filter(d=>{
        d.x+=d.vx; d.y+=d.vy; d.alpha-=.02;
        if(d.alpha<=0) return false;
        ctx.save(); ctx.globalAlpha=d.alpha;
        ctx.fillStyle=`hsl(${d.hue},100%,75%)`;
        ctx.beginPath(); ctx.arc(d.x,d.y,d.r,0,Math.PI*2); ctx.fill();
        ctx.restore(); return true;
      });

      if(beamProgress>=1){ phase='impact'; frame=0; impactT=0; addDebris(W*.94,cy); addDebris(W*.94,cy); }

    /* ── IMPACT ── */
    } else if (phase === 'impact') {
      impactT=frame;
      drawBeam(1);
      drawImpact(W*.94, impactT);

      // screen shake
      if(frame<15){
        const s=(15-frame)/15*12;
        ctx.save(); ctx.translate((Math.random()-.5)*s,(Math.random()-.5)*s); ctx.restore();
        document.body.style.transform=`translate(${(Math.random()-.5)*s}px,${(Math.random()-.5)*s}px)`;
      } else {
        document.body.style.transform='';
      }

      debris=debris.filter(d=>{
        d.x+=d.vx; d.y+=d.vy; d.vy+=.15; d.alpha-=.016;
        if(d.alpha<=0) return false;
        ctx.save(); ctx.globalAlpha=d.alpha;
        ctx.fillStyle=`hsl(${d.hue},100%,75%)`;
        ctx.beginPath(); ctx.arc(d.x,d.y,d.r,0,Math.PI*2); ctx.fill();
        ctx.restore(); return true;
      });

      if(frame>=30){ phase='fade'; frame=0; document.getElementById('kameFlash').classList.add('on'); }

    /* ── FADE ── */
    } else if (phase === 'fade') {
      fadeT=frame;
      if(frame>=35){ cancelAnimationFrame(raf); document.body.style.transform=''; overlay.remove(); onDone(); return; }
    }

    raf = requestAnimationFrame(tick);
  }

  playKame();
  raf = requestAnimationFrame(tick);
  // safety
  setTimeout(()=>{ document.body.style.transform=''; if(document.getElementById('kameOverlay')){overlay.remove();onDone();}},8000);
}

// ══════════════════════════════════════
// LANGUAGE TOGGLE  ← re-renders bio if open
// ══════════════════════════════════════
document.getElementById('btnLang').addEventListener('click', () => {
  lang = lang === 'es' ? 'en' : 'es';

  // Static UI strings
  document.getElementById('titleText').textContent    = t('title');
  document.getElementById('subtitleText').textContent = t('subtitle');
  document.getElementById('randomLabel').textContent  = t('random');
  document.getElementById('langLabel').textContent    = t('lang');
  document.getElementById('hintText').textContent     = t('hint');
  document.getElementById('initText').textContent     = t('initLoad');
  inp.placeholder = t('search');

  // Re-render bio with new language whether visible or hidden
  if (currentChar) {
    bioWrap.className     = '';
    bioWrap.style.display = 'block';
    hint.style.display    = 'none';
    renderBio(currentChar);
  }
});

// ══════════════════════════════════════
// SCROLL TOP
// ══════════════════════════════════════
window.addEventListener('scroll', () => {
  document.getElementById('scrollTop').classList.toggle('show', scrollY > 300);
});

// ══════════════════════════════════════
// UTILITIES
// ══════════════════════════════════════
function fmtKi(v) {
  if (!v) return '?';
  const n = typeof v === 'string' ? parseInt(v.replace(/,/g,'')) : v;
  if (isNaN(n)) return v;
  if (n >= 1e12) return (n/1e12).toFixed(1)+'T';
  if (n >= 1e9)  return (n/1e9).toFixed(1)+'B';
  if (n >= 1e6)  return (n/1e6).toFixed(1)+'M';
  if (n >= 1e3)  return (n/1e3).toFixed(1)+'K';
  return n;
}

// ══════════════════════════════════════
// INIT
// ══════════════════════════════════════
loadAll();