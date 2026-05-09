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
  }
};
const t = k => T[lang][k] || k;

// ══════════════════════════════════════
// CANVAS BACKGROUND ANIMATION
// ══════════════════════════════════════
(function initCanvas() {
  const canvas = document.getElementById('bgCanvas');
  const ctx    = canvas.getContext('2d');

  // Dragon balls floating in background
  const balls = Array.from({length: 7}, (_, i) => ({
    stars: i + 1,
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
    r: 18 + Math.random() * 22,
    vx: (Math.random() - .5) * .4,
    vy: (Math.random() - .5) * .4,
    opacity: .08 + Math.random() * .1,
    phase: Math.random() * Math.PI * 2,
  }));

  // Energy streaks
  const streaks = Array.from({length: 12}, () => ({
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
    len: 60 + Math.random() * 120,
    angle: Math.random() * Math.PI * 2,
    speed: .3 + Math.random() * .5,
    opacity: 0,
    maxOp: .04 + Math.random() * .06,
    fade: Math.random() < .5 ? 1 : -1,
    color: Math.random() < .5 ? '255,215,0' : '255,107,0',
  }));

  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  function drawBall(b) {
    const pulse = Math.sin(Date.now() * .001 + b.phase) * .015;
    const op    = b.opacity + pulse;
    const r     = b.r;

    ctx.save();
    ctx.globalAlpha = op;
    ctx.translate(b.x, b.y);

    // Glow
    const glow = ctx.createRadialGradient(0,0,r*.2,0,0,r*2.2);
    glow.addColorStop(0, 'rgba(255,215,0,.3)');
    glow.addColorStop(1, 'rgba(255,107,0,0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(0,0,r*2.2,0,Math.PI*2);
    ctx.fill();

    // Ball gradient
    const grad = ctx.createRadialGradient(-r*.3,-r*.3,r*.05,0,0,r);
    grad.addColorStop(0, '#fff8dc');
    grad.addColorStop(.35, '#FFD700');
    grad.addColorStop(.75, '#FF6B00');
    grad.addColorStop(1,   '#cc3300');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(0,0,r,0,Math.PI*2);
    ctx.fill();

    // Shine
    ctx.globalAlpha = op * .6;
    const shine = ctx.createRadialGradient(-r*.3,-r*.35,0,-r*.3,-r*.35,r*.55);
    shine.addColorStop(0,'rgba(255,255,255,.55)');
    shine.addColorStop(1,'rgba(255,255,255,0)');
    ctx.fillStyle = shine;
    ctx.beginPath();
    ctx.arc(0,0,r,0,Math.PI*2);
    ctx.fill();

    // Stars
    ctx.globalAlpha = op * .85;
    ctx.fillStyle = 'rgba(140,20,0,.85)';
    drawStars(ctx, b.stars, r);

    ctx.restore();
  }

  function drawStars(ctx, count, r) {
    const positions = getStarPositions(count, r);
    positions.forEach(([sx,sy]) => {
      ctx.beginPath();
      for (let i=0; i<5; i++) {
        const a  = (i*4*Math.PI/5) - Math.PI/2;
        const a2 = a + 2*Math.PI/5;
        const ro = r * .13, ri = r * .055;
        if (i===0) ctx.moveTo(sx + ro*Math.cos(a), sy + ro*Math.sin(a));
        else        ctx.lineTo(sx + ro*Math.cos(a), sy + ro*Math.sin(a));
        ctx.lineTo(sx + ri*Math.cos(a2), sy + ri*Math.sin(a2));
      }
      ctx.closePath();
      ctx.fill();
    });
  }

  function getStarPositions(n, r) {
    const s = r * .32;
    switch(n) {
      case 1: return [[0,0]];
      case 2: return [[-s*.5,0],[s*.5,0]];
      case 3: return [[0,-s*.5],[s*.45,s*.3],[-s*.45,s*.3]];
      case 4: return [[-s*.4,-s*.4],[s*.4,-s*.4],[-s*.4,s*.4],[s*.4,s*.4]];
      case 5: return [[0,-s*.55],[s*.52,-.17*s],[-s*.52,-.17*s],[.32*s,.44*s],[-.32*s,.44*s]];
      case 6: return [[0,-s*.55],[s*.52,-.17*s],[-s*.52,-.17*s],[.32*s,.44*s],[-.32*s,.44*s],[0,.1*s]];
      case 7: return [[0,0],[0,-s*.55],[s*.52,-.17*s],[-s*.52,-.17*s],[.32*s,.44*s],[-.32*s,.44*s],[0,.58*s]];
      default: return [[0,0]];
    }
  }

  function tick() {
    ctx.clearRect(0,0,canvas.width,canvas.height);

    // Streaks
    streaks.forEach(s => {
      s.opacity += .002 * s.fade;
      if (s.opacity >= s.maxOp) s.fade = -1;
      if (s.opacity <= 0) {
        s.fade = 1;
        s.x = Math.random() * canvas.width;
        s.y = Math.random() * canvas.height;
        s.angle = Math.random() * Math.PI * 2;
        s.len = 60 + Math.random() * 120;
      }
      ctx.save();
      ctx.globalAlpha = Math.max(0,s.opacity);
      const grad = ctx.createLinearGradient(
        s.x, s.y,
        s.x + Math.cos(s.angle)*s.len,
        s.y + Math.sin(s.angle)*s.len
      );
      grad.addColorStop(0, `rgba(${s.color},0)`);
      grad.addColorStop(.5,`rgba(${s.color},1)`);
      grad.addColorStop(1, `rgba(${s.color},0)`);
      ctx.strokeStyle = grad;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(s.x, s.y);
      ctx.lineTo(s.x+Math.cos(s.angle)*s.len, s.y+Math.sin(s.angle)*s.len);
      ctx.stroke();
      ctx.restore();
      s.x += Math.cos(s.angle)*s.speed;
      s.y += Math.sin(s.angle)*s.speed;
    });

    // Dragon balls
    balls.forEach(b => {
      drawBall(b);
      b.x += b.vx; b.y += b.vy;
      if (b.x < -b.r*3)  b.x = canvas.width  + b.r*3;
      if (b.x > canvas.width  + b.r*3) b.x = -b.r*3;
      if (b.y < -b.r*3)  b.y = canvas.height + b.r*3;
      if (b.y > canvas.height + b.r*3) b.y = -b.r*3;
    });

    requestAnimationFrame(tick);
  }
  tick();
})();

// ══════════════════════════════════════
// API
// ══════════════════════════════════════
async function loadAll() {
  initLoader.style.display = 'flex';
  hint.style.display = 'none';
  chars = [];
  let page = 1;
  try {
    while (page <= 5) {
      const res   = await fetch(`https://dragonball-api.com/api/characters?limit=58&page=${page}`);
      const data  = await res.json();
      const items = data.items || data.characters || data;
      if (!items || !items.length) break;
      chars.push(...items);
      const meta = data.meta || {};
      if (!meta.totalPages || page >= meta.totalPages) break;
      page++;
    }
  } catch(e) { console.error(e); }
  initLoader.style.display = 'none';
  hint.style.display = '';
}

async function fetchOne(id) {
  const res = await fetch(`https://dragonball-api.com/api/characters/${id}`);
  return res.json();
}

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
    [t('origin'), c.originPlanet?.name || c.planet],
    [t('affil'),  c.affiliation],
  ].filter(([,v]) => v)
   .map(([k,v]) => `<span class="chip"><strong>${k}:</strong> ${v}</span>`)
   .join('');

  const trHTML = c.transformations?.length
    ? `<div class="bio-section">
        <h3>${t('transforms')}</h3>
        <div class="bio-transforms">
          ${c.transformations.map(tr=>`
            <div class="tr-item">
              <img src="${tr.image||''}" alt="${tr.name}" onerror="this.style.display='none'">
              <span>${tr.name}</span>
            </div>`).join('')}
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

  // Close button inside innerHTML — attach via JS (no inline onclick needed)
  document.getElementById('bioCloseBtn').addEventListener('click', closeBio);
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

// ── Event delegation on the dropdown container (single listener, no blur conflict) ──
drop.addEventListener('pointerdown', e => {
  e.preventDefault(); // prevent input blur
  const item = e.target.closest('.dd-item');
  if (!item) return;
  const id = item.dataset.id;
  inp.value = '';
  closeDrop();
  showBio(id);
});

// ── Input events ──
inp.addEventListener('input', function() {
  this.value.trim() ? openDrop(this.value) : closeDrop();
});

inp.addEventListener('blur', () => {
  // Small delay so delegation pointerdown fires first
  setTimeout(closeDrop, 200);
});

// Keyboard nav in dropdown
inp.addEventListener('keydown', function(e) {
  const items = drop.querySelectorAll('.dd-item');
  if (e.key === 'ArrowDown') {
    e.preventDefault();
    acIdx = Math.min(acIdx+1, items.length-1);
    setActive(items);
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    acIdx = Math.max(acIdx-1, 0);
    setActive(items);
  } else if (e.key === 'Enter') {
    e.preventDefault();
    const target = acIdx >= 0 ? items[acIdx] : items.length === 1 ? items[0] : null;
    if (target) { inp.value=''; closeDrop(); showBio(target.dataset.id); }
  } else if (e.key === 'Escape') {
    closeDrop(); inp.value = '';
  }
});

// Close on click outside the whole search-wrap
document.addEventListener('pointerdown', e => {
  if (!e.target.closest('.search-wrap')) closeDrop();
});

function setActive(items) {
  items.forEach((el,i) => el.classList.toggle('active', i===acIdx));
  if (items[acIdx]) items[acIdx].scrollIntoView({block:'nearest'});
}

// ══════════════════════════════════════
// RANDOM
// ══════════════════════════════════════
document.getElementById('btnRandom').addEventListener('click', function() {
  if (!chars.length) return;
  this.style.transform = 'scale(.9) rotate(-5deg)';
  setTimeout(() => this.style.transform='', 200);
  spawnBurst(this);

  let pick;
  do { pick = chars[Math.floor(Math.random()*chars.length)]; }
  while (pick === lastRandom && chars.length > 1);
  lastRandom = pick;

  closeDrop();
  inp.value = '';
  showBio(pick.id || pick._id);
});

function spawnBurst(btn) {
  const r = btn.getBoundingClientRect();
  const el = document.createElement('div');
  el.className  = 'ki-burst';
  el.style.left = (r.left + r.width/2)  + 'px';
  el.style.top  = (r.top  + r.height/2 + scrollY) + 'px';
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 700);
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

  // If bio is currently visible, re-render it with new language
  if (currentChar) {
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