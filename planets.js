/* ═══════════════════════════════════════════
   DRAGON BALL — planets.js  v10
   · dragon_ball_intro.m4a  → intro "TOCA PARA CONTINUAR"
   · dragon_ball_intro2.m4a → modo batalla épica
   · kamehameha.m4a         → botón ALEATORIO
   · transformacion.m4a     → al abrir bio + transformaciones
   · volar.m4a              → viaje a planeta
   ═══════════════════════════════════════════ */

(function () {
  'use strict';

  /* ══════════════════════════════════════
     AUDIOS — todos desde carpeta audios/
  ══════════════════════════════════════ */
  function mkAudio(src, vol) {
    const a = new Audio('audios/' + src);
    a.preload = 'auto';
    a.volume  = vol || 0.75;
    return a;
  }

  const sfxIntro     = mkAudio('dragon_ball_intro.m4a',  0.15);
  const sfxBattle    = mkAudio('dragon_ball_intro2.m4a', 0.05);
  const sfxKame      = mkAudio('kamehameha.m4a',         0.8);
  const sfxTransform = mkAudio('transformacion.m4a',     0.8);
  const sfxVolar     = mkAudio('volar.m4a',              0.8);

  function play(sfx) { try { sfx.currentTime = 0; sfx.play().catch(()=>{}); } catch(e){} }
  function stop(sfx) { try { sfx.pause(); sfx.currentTime = 0; } catch(e){} }

  /* ══════════════════════════════════════
     PATCH app.js AUDIO REFS
  ══════════════════════════════════════ */
  document.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById('btnRandom');
    if (btn) {
      btn.addEventListener('click', () => { play(sfxKame); }, true);
    }
  });

  window.addEventListener('load', ()=>{
    try {
      if(typeof playKame !== 'undefined'){
        window.playKame = function(){ play(sfxKame); };
      }
      if(typeof playTransform !== 'undefined'){
        window.playTransform = function(){ play(sfxTransform); };
      }
    } catch(e){}
  });

  /* ══════════════════════════════════════
     PLANET DATA
  ══════════════════════════════════════ */
  const PLANETS = [
    {
      key:'tierra', label:'Planeta Tierra', tag:'SISTEMA SOLAR · SECTOR 7G',
      img:'img/planeta_tierra.png', color:'#78b8ff', R:80, G:160, B:255,
      stats:[{l:'Sistema',v:'Solar'},{l:'Gravedad',v:'10x Estándar'},{l:'Atmósfera',v:'Oxígeno/Nitrógeno'},{l:'Estado',v:'✅ Habitado'}],
      desc:'La Tierra es el escenario principal de Dragon Ball. Ha sido el centro de batallas que han decidido el destino de universos enteros. Sus guerreros han alcanzado poderes extraordinarios gracias al entrenamiento constante.',
      chars:['Goku','Krillin','Yamcha','Ten Shin Han','Gohan','Piccolo','Vegeta','Bulma','Androide 18','Maestro Roshi'],
    },
    {
      key:'vegeta', label:'Planeta Vegeta', tag:'SISTEMA SAIYAN · SECTOR NORTE',
      img:'img/planeta_vegeta.png', color:'#FF8040', R:255, G:75, B:10,
      stats:[{l:'Raza',v:'Saiyans'},{l:'Gravedad',v:'10x la Tierra'},{l:'Destructor',v:'Freezer'},{l:'Estado',v:'💥 Destruido'}],
      desc:'Cuna de la orgullosa raza guerrera Saiyan. Destruido por Freezer de un solo golpe. Su legado vive en cada transformación Super Saiyan.',
      chars:['Vegeta','Bardock','Rey Vegeta','Broly','Raditz','Nappa','Paragus','Goku (Kakarotto)'],
    },
    {
      key:'namek', label:'Planeta Namek', tag:'SECTOR 9045 · UNIVERSO 7',
      img:'img/planeta_namek.png', color:'#44ff88', R:40, G:220, B:90,
      stats:[{l:'Raza',v:'Namekianos'},{l:'Soles',v:'3 Soles'},{l:'Dragón',v:'Porunga'},{l:'Estado',v:'⚠️ Nuevo Namek'}],
      desc:'Iluminado por tres soles, hogar de los Namekianos. Sus Esferas del Dragón son gobernadas por Porunga. Escenario épico de la batalla contra Freezer.',
      chars:['Piccolo','Nail','Guru','Dende','Kami','Cargo','Moori','Lord Slug'],
    },
    {
      key:'sadala', label:'Planeta Sadala', tag:'UNIVERSO 6 · SECTOR OMEGA',
      img:'img/planeta_sadala.png', color:'#c8ff40', R:160, G:255, B:30,
      stats:[{l:'Universo',v:'Universo 6'},{l:'Raza',v:'Saiyans U6'},{l:'Estado',v:'✅ Habitado'},{l:'Rival',v:'Planeta Vegeta'}],
      desc:'Hogar de los Saiyans del Universo 6 que usan sus poderes para el bien. A diferencia del U7, combaten el crimen y protegen a los débiles.',
      chars:['Cabba','Caulifla','Kale','Renso','Beets'],
    },
    {
      key:'yardrat', label:'Planeta Yardrat', tag:'GALAXIA DEL NORTE · CUADRANTE ESTE',
      img:'img/planeta_yardrat.png', color:'#ff60c0', R:220, G:50, B:180,
      stats:[{l:'Raza',v:'Yardratians'},{l:'Técnica',v:'Transmisión Instantánea'},{l:'Estado',v:'✅ Habitado'}],
      desc:'Donde Goku aprendió la Transmisión Instantánea tras la batalla en Namek. Los Yardratians dominan técnicas espirituales sin igual.',
      chars:['Goku','Steth','Pybara'],
    },
  ];

  function getChars() { return (typeof chars !== 'undefined' && chars.length) ? chars : []; }
  function fmtKiC(v) {
    if(!v) return '?';
    const n = typeof v==='string' ? parseInt(v.replace(/,/g,'')) : Number(v);
    if(isNaN(n)) return String(v).slice(0,8);
    if(n>=1e12) return (n/1e12).toFixed(1)+'T';
    if(n>=1e9)  return (n/1e9).toFixed(1)+'B';
    if(n>=1e6)  return (n/1e6).toFixed(1)+'M';
    if(n>=1e3)  return (n/1e3).toFixed(1)+'K';
    return n;
  }
  function parseKiNum(v) {
    if(!v) return Math.random()*1000;
    const s = String(v).replace(/,/g,'').toUpperCase();
    const n = parseFloat(s);
    if(isNaN(n)) return Math.random()*1000;
    if(s.includes('T')) return n*1e12; if(s.includes('B')) return n*1e9;
    if(s.includes('M')) return n*1e6;  if(s.includes('K')) return n*1e3;
    return n;
  }

  /* ══════════════════════════════════════
     INTRO — bolas orbitando + audio intro
  ══════════════════════════════════════ */
  const introEl = document.createElement('div');
  introEl.id = 'dbIntro';

  const introStars = document.createElement('canvas');
  introStars.id = 'introStarsCanvas';
  introEl.appendChild(introStars);

  const ringsDiv = document.createElement('div');
  ringsDiv.id = 'introRings';
  [380,520,680].forEach((s,i)=>{
    const r=document.createElement('div'); r.className='i-ring';
    r.style.cssText=`width:${s}px;height:${s}px;animation-delay:${i*2}s;animation-duration:${6+i*1.5}s`;
    ringsDiv.appendChild(r);
  });
  introEl.appendChild(ringsDiv);

  const orbitCanvas = document.createElement('canvas');
  orbitCanvas.id = 'dbOrbitCanvas';
  introEl.appendChild(orbitCanvas);

  const titleEl = document.createElement('div'); titleEl.id='introTitle'; titleEl.textContent='Dragon Ball Universe';
  const subEl   = document.createElement('div'); subEl.id='introSub';   subEl.textContent='Universo · Sistema Solar';
  const hintEl  = document.createElement('div'); hintEl.id='introHint'; hintEl.textContent='— TOCA PARA CONTINUAR —';
  introEl.appendChild(titleEl); introEl.appendChild(subEl); introEl.appendChild(hintEl);
  document.body.appendChild(introEl);

  // Stars
  const sc = introStars.getContext('2d');
  function resizeIS(){ introStars.width=window.innerWidth; introStars.height=window.innerHeight; }
  resizeIS(); window.addEventListener('resize', resizeIS);
  const iStars = Array.from({length:280},()=>({x:Math.random(),y:Math.random(),r:Math.random()*1.6,a:.1+Math.random()*.9,ph:Math.random()*Math.PI*2,gold:Math.random()<.07}));
  let isf=0;
  function drawIS(){
    isf++;
    sc.clearRect(0,0,introStars.width,introStars.height);
    iStars.forEach(s=>{
      sc.save(); sc.globalAlpha=s.a*(.3+.7*Math.sin(isf*.02+s.ph));
      sc.fillStyle=s.gold?'#FFD700':'#fff';
      sc.beginPath(); sc.arc(s.x*introStars.width,s.y*introStars.height,s.r,0,Math.PI*2); sc.fill(); sc.restore();
    });
    if(introEl.isConnected) requestAnimationFrame(drawIS);
  }
  drawIS();

  // Orbit
  const oc=orbitCanvas.getContext('2d');
  const OW=320,OH=180; orbitCanvas.width=OW; orbitCanvas.height=OH;
  orbitCanvas.style.cssText='display:block;margin:0 auto;';
  const OCX=OW/2,OCY=OH/2,ORBIT_RX=128,ORBIT_RY=52,BALL_R=14;
  let orbitAngle=0,phaseTimer=0,orbitPhase=0,launched=false,hintShown=false;
  const balls=Array.from({length:7},(_,i)=>({stars:i+1,angle:Math.random()*Math.PI*2,targetAngle:(i/7)*Math.PI*2-Math.PI/2,alpha:0,scale:0}));

  function getStarPos(n,r){
    const s=r*.32;
    switch(n){
      case 1:return[[0,0]]; case 2:return[[-s*.5,0],[s*.5,0]];
      case 3:return[[0,-s*.5],[s*.45,s*.3],[-s*.45,s*.3]];
      case 4:return[[-s*.4,-s*.4],[s*.4,-s*.4],[-s*.4,s*.4],[s*.4,s*.4]];
      case 5:return[[0,-s*.55],[s*.52,-.17*s],[-s*.52,-.17*s],[.32*s,.44*s],[-.32*s,.44*s]];
      case 6:return[[0,-s*.55],[s*.52,-.17*s],[-s*.52,-.17*s],[.32*s,.44*s],[-.32*s,.44*s],[0,.1*s]];
      case 7:return[[0,0],[0,-s*.55],[s*.52,-.17*s],[-s*.52,-.17*s],[.32*s,.44*s],[-.32*s,.44*s],[0,.58*s]];
      default:return[[0,0]];
    }
  }

  function drawSingleBall(ctx,n,x,y,r,alpha,scale){
    ctx.save(); ctx.globalAlpha=alpha; ctx.translate(x,y); ctx.scale(scale,scale);
    const gw=ctx.createRadialGradient(0,0,r*.3,0,0,r*2.5);
    gw.addColorStop(0,'rgba(255,215,0,.35)'); gw.addColorStop(1,'rgba(255,107,0,0)');
    ctx.fillStyle=gw; ctx.beginPath(); ctx.arc(0,0,r*2.5,0,Math.PI*2); ctx.fill();
    const gr=ctx.createRadialGradient(-r*.3,-r*.3,r*.05,0,0,r);
    gr.addColorStop(0,'#fff8dc'); gr.addColorStop(.35,'#FFD700'); gr.addColorStop(.75,'#FF6B00'); gr.addColorStop(1,'#cc3300');
    ctx.fillStyle=gr; ctx.beginPath(); ctx.arc(0,0,r,0,Math.PI*2); ctx.fill();
    const sh=ctx.createRadialGradient(-r*.3,-r*.36,0,-r*.3,-r*.36,r*.55);
    sh.addColorStop(0,'rgba(255,255,255,.6)'); sh.addColorStop(1,'transparent');
    ctx.fillStyle=sh; ctx.beginPath(); ctx.arc(0,0,r,0,Math.PI*2); ctx.fill();
    ctx.fillStyle='rgba(140,20,0,.88)'; ctx.globalAlpha=alpha*.9;
    getStarPos(n,r).forEach(([sx,sy])=>{
      ctx.beginPath();
      for(let i=0;i<5;i++){
        const a=(i*4*Math.PI/5)-Math.PI/2,a2=a+2*Math.PI/5,ro=r*.13,ri=r*.055;
        if(i===0)ctx.moveTo(sx+ro*Math.cos(a),sy+ro*Math.sin(a)); else ctx.lineTo(sx+ro*Math.cos(a),sy+ro*Math.sin(a));
        ctx.lineTo(sx+ri*Math.cos(a2),sy+ri*Math.sin(a2));
      }
      ctx.closePath(); ctx.fill();
    });
    ctx.restore();
  }

  let prevT=0;
  function tickOrbit(dt){
    oc.clearRect(0,0,OW,OH);
    if(orbitPhase===0){
      phaseTimer+=dt;
      const prog=Math.min(1,phaseTimer/1.3), eased=1-Math.pow(1-prog,3);
      balls.forEach(b=>{
        b.alpha=eased; b.scale=.4+eased*.6;
        let diff=b.targetAngle-b.angle;
        while(diff>Math.PI) diff-=Math.PI*2; while(diff<-Math.PI) diff+=Math.PI*2;
        b.angle+=diff*eased*.11;
      });
      oc.save(); oc.globalAlpha=.07*eased; oc.strokeStyle='#FFD700'; oc.lineWidth=1;
      oc.beginPath(); oc.ellipse(OCX,OCY,ORBIT_RX,ORBIT_RY,0,0,Math.PI*2); oc.stroke(); oc.restore();
      balls.forEach(b=>{ const x=OCX+Math.cos(b.angle+orbitAngle)*ORBIT_RX, y=OCY+Math.sin(b.angle+orbitAngle)*ORBIT_RY; drawSingleBall(oc,b.stars,x,y,BALL_R,b.alpha,b.scale); });
      if(prog>=1){
        orbitPhase=1; phaseTimer=0;
        setTimeout(()=>{
          titleEl.classList.add('show');
          setTimeout(()=>subEl.classList.add('show'),350);
          setTimeout(()=>{
            hintEl.classList.add('show');
            if(!hintShown){ hintShown=true; play(sfxIntro); }
          },800);
        },80);
      }
    } else {
      orbitAngle+=dt*.52;
      oc.save(); oc.globalAlpha=.09; oc.strokeStyle='#FFD700'; oc.lineWidth=1;
      oc.beginPath(); oc.ellipse(OCX,OCY,ORBIT_RX,ORBIT_RY,0,0,Math.PI*2); oc.stroke(); oc.restore();
      balls.forEach(b=>{ const x=OCX+Math.cos(b.angle+orbitAngle)*ORBIT_RX, y=OCY+Math.sin(b.angle+orbitAngle)*ORBIT_RY; drawSingleBall(oc,b.stars,x,y,BALL_R,1,1); });
    }
  }

  function orbitLoop(t){ const dt=Math.min((t-prevT)*.001,.05); prevT=t; tickOrbit(dt); if(!launched) requestAnimationFrame(orbitLoop); }
  requestAnimationFrame(t=>{ prevT=t; orbitLoop(t); });

  function exitIntro(){
    if(launched) return; launched=true;
    stop(sfxIntro);
    introEl.classList.add('hiding');
    setTimeout(()=>{ introEl.style.display='none'; launchPanels(); },900);
  }
  introEl.addEventListener('click', exitIntro);
  document.addEventListener('keydown', e=>{ if(e.key===' '||e.key==='Enter') exitIntro(); });

  /* ══════════════════════════════════════
     PANEL PLANETAS — derecha
  ══════════════════════════════════════ */
  const planetPanel = document.createElement('div');
  planetPanel.id = 'planetPanel';
  document.body.appendChild(planetPanel);

  const ppTitle = document.createElement('div');
  ppTitle.id = 'planetPanelTitle'; ppTitle.textContent='PLANETAS';
  planetPanel.appendChild(ppTitle);

  PLANETS.forEach(p=>{
    const card=document.createElement('div'); card.className='pp-planet';
    card.addEventListener('mouseenter',()=>{ card.style.background=`rgba(${p.R},${p.G},${p.B},.07)`; card.style.borderColor=`rgba(${p.R},${p.G},${p.B},.35)`; });
    card.addEventListener('mouseleave',()=>{ card.style.background=''; card.style.borderColor=''; });
    const imgWrap=document.createElement('div'); imgWrap.className='pp-planet-img-wrap';
    const glow=document.createElement('div'); glow.className='pp-planet-glow';
    glow.style.background=`radial-gradient(circle,rgba(${p.R},${p.G},${p.B},.55) 0%,transparent 70%)`;
    imgWrap.appendChild(glow);
    const img=document.createElement('img'); img.className='pp-planet-img'; img.src=p.img; img.alt=p.label;
    img.onerror=()=>{ img.style.display='none'; const fb=document.createElement('div'); fb.style.cssText=`width:100%;height:100%;border-radius:50%;background:radial-gradient(circle at 35% 35%,rgba(255,255,255,.3),rgba(${p.R},${p.G},${p.B},.8));`; imgWrap.appendChild(fb); };
    imgWrap.appendChild(img);
    const info=document.createElement('div'); info.className='pp-planet-info';
    const nm=document.createElement('div'); nm.className='pp-planet-name'; nm.style.color=p.color; nm.textContent=p.label.replace('Planeta ','');
    const sb=document.createElement('div'); sb.className='pp-planet-sub'; sb.textContent=p.tag.split('·')[0].trim();
    info.appendChild(nm); info.appendChild(sb);
    const arrow=document.createElement('span'); arrow.className='pp-planet-arrow'; arrow.textContent='›';
    card.appendChild(imgWrap); card.appendChild(info); card.appendChild(arrow);
    card.addEventListener('click',()=>startTravel(p));
    planetPanel.appendChild(card);
  });

  /* ══════════════════════════════════════
     BOTÓN COMBATE FLOTANTE — izquierda
  ══════════════════════════════════════ */
  const combatBtn = document.createElement('button');
  combatBtn.id = 'combatFloatBtn';
  combatBtn.innerHTML = '⚔';
  combatBtn.title = 'Combate';
  document.body.appendChild(combatBtn);

  /* ══════════════════════════════════════
     OVERLAY SELECTOR DE COMBATE
  ══════════════════════════════════════ */
  const combatOverlay = document.createElement('div');
  combatOverlay.id = 'combatSelectorOverlay';
  combatOverlay.innerHTML = `
    <div id="combatSelectorCard">
      <button id="combatSelectorClose">✕</button>
      <div id="csoTitle">⚔ COMBATE</div>
      <div id="csoSub">Elige tus guerreros</div>
      <div id="csoSlots">
        <div class="cso-slot">
          <div class="cso-label">GUERRERO 1</div>
          <div class="cso-avatar" id="csoAvatarA"><span>?</span></div>
          <div class="cso-name"  id="csoNameA">—</div>
          <div class="cso-ki"    id="csoKiA"></div>
          <div style="position:relative;width:100%">
            <input id="csoInputA" class="cso-input" placeholder="Buscar guerrero 1...">
            <div id="csoDropA" class="cso-drop"></div>
          </div>
          <button class="cso-rand" id="csoRandA">🎲 Aleatorio</button>
        </div>
        <div id="csoVS">VS</div>
        <div class="cso-slot">
          <div class="cso-label">GUERRERO 2</div>
          <div class="cso-avatar" id="csoAvatarB"><span>?</span></div>
          <div class="cso-name"  id="csoNameB">—</div>
          <div class="cso-ki"    id="csoKiB"></div>
          <div style="position:relative;width:100%">
            <input id="csoInputB" class="cso-input" placeholder="Buscar guerrero 2...">
            <div id="csoDropB" class="cso-drop"></div>
          </div>
          <button class="cso-rand" id="csoRandB">🎲 Aleatorio</button>
        </div>
      </div>
      <button id="csoFightBtn">⚡ ¡¡ LUCHAR !!</button>
    </div>`;
  document.body.appendChild(combatOverlay);

  combatBtn.addEventListener('click', () => {
    combatOverlay.classList.add('open');
    const list = getChars();
    if (list.length >= 2) {
      if (!fighterA) randomFighter('A');
      if (!fighterB) randomFighter('B');
    }
  });

  document.getElementById('combatSelectorClose').addEventListener('click', () => {
    combatOverlay.classList.remove('open');
  });
  combatOverlay.addEventListener('pointerdown', e => {
    if (e.target === combatOverlay) combatOverlay.classList.remove('open');
  });

  let fighterA=null, fighterB=null;

  function setCombatFighter(slot, char){
    if(slot==='A'){
      fighterA=char;
      document.getElementById('csoAvatarA').innerHTML=char.image?`<img src="${char.image}" onerror="this.style.opacity='.1'">`:'<span>?</span>';
      document.getElementById('csoNameA').textContent=char.name;
      document.getElementById('csoKiA').textContent=char.maxKi?`Ki: ${fmtKiC(char.maxKi)}`:'';
    } else {
      fighterB=char;
      document.getElementById('csoAvatarB').innerHTML=char.image?`<img src="${char.image}" onerror="this.style.opacity='.1'">`:'<span>?</span>';
      document.getElementById('csoNameB').textContent=char.name;
      document.getElementById('csoKiB').textContent=char.maxKi?`Ki: ${fmtKiC(char.maxKi)}`:'';
    }
  }

  function randomFighter(slot){
    const list=getChars(); if(!list.length) return;
    let pick;
    do{ pick=list[Math.floor(Math.random()*list.length)]; }
    while(list.length>1&&((slot==='A'&&pick===fighterB)||(slot==='B'&&pick===fighterA)));
    setCombatFighter(slot,pick);
  }

  document.getElementById('csoRandA').addEventListener('click',()=>randomFighter('A'));
  document.getElementById('csoRandB').addEventListener('click',()=>randomFighter('B'));

  document.getElementById('csoFightBtn').addEventListener('click',()=>{
    if(!fighterA) randomFighter('A');
    if(!fighterB) randomFighter('B');
    combatOverlay.classList.remove('open');
    setTimeout(startEpicBattle, 150);
  });

  function buildCsoDrop(inputId, dropId, slot){
    const inp  = document.getElementById(inputId);
    const drop = document.getElementById(dropId);
    let pointer = false;
    inp.addEventListener('input', ()=>{
      const q=inp.value.trim().toLowerCase();
      if(!q){ drop.innerHTML=''; drop.classList.remove('open'); return; }
      const list=getChars();
      const matches=list.filter(c=>c.name?.toLowerCase().includes(q)).slice(0,6);
      if(!matches.length){ drop.innerHTML=''; drop.classList.remove('open'); return; }
      drop.innerHTML=matches.map(c=>
        `<div class="cso-drop-item" data-id="${c.id||c._id}">
           <img src="${c.image||''}" class="cso-drop-img" onerror="this.style.opacity='.1'">
           <span>${c.name}</span>
         </div>`
      ).join('');
      drop.classList.add('open');
      drop.querySelectorAll('.cso-drop-item').forEach(el=>{
        el.addEventListener('pointerdown',()=>pointer=true);
        el.addEventListener('click',()=>{
          const char=list.find(c=>(c.id||c._id)==el.dataset.id);
          if(char){ setCombatFighter(slot,char); inp.value=''; drop.innerHTML=''; drop.classList.remove('open'); }
          pointer=false;
        });
      });
    });
    inp.addEventListener('blur',()=>setTimeout(()=>{
      if(!pointer){ drop.innerHTML=''; drop.classList.remove('open'); }
      pointer=false;
    },120));
  }
  buildCsoDrop('csoInputA','csoDropA','A');
  buildCsoDrop('csoInputB','csoDropB','B');

  /* ══════════════════════════════════════
     EPIC BATTLE MODE — pantalla completa
  ══════════════════════════════════════ */
  function startEpicBattle(){
    if(!fighterA||!fighterB) return;

    const kA=parseKiNum(fighterA.maxKi||fighterA.ki);
    const kB=parseKiNum(fighterB.maxKi||fighterB.ki);
    const rA=kA*(0.8+Math.random()*0.4);
    const rB=kB*(0.8+Math.random()*0.4);
    const diff=Math.abs(rA-rB);
    const draw=diff<(kA+kB)*.04;
    const winner=draw?null:(rA>rB?fighterA:fighterB);
    const loser=draw?null:(rA>rB?fighterB:fighterA);

    const overlay=document.createElement('div');
    overlay.id='battleOverlay';

    const battleCanvas=document.createElement('canvas');
    battleCanvas.id='battleCanvas';
    overlay.appendChild(battleCanvas);

    overlay.innerHTML+=`
      <div id="battleContent">
        <div id="battlePhaseLabel"></div>
        <div id="battleFighters">
          <div class="bf-side" id="bfA">
            <div class="bf-aura" id="bfAuraA"></div>
            <img class="bf-img" id="bfImgA" src="${fighterA.image||''}" onerror="this.style.opacity='.15'">
            <div class="bf-name" id="bfNameA">${fighterA.name.toUpperCase()}</div>
            <div class="bf-ki"   id="bfKiA">${fmtKiC(fighterA.maxKi||fighterA.ki)}</div>
            <div class="bf-bar-wrap"><div class="bf-bar" id="bfBarA"></div></div>
          </div>
          <div id="bfVS">VS</div>
          <div class="bf-side" id="bfB">
            <div class="bf-aura" id="bfAuraB"></div>
            <img class="bf-img" id="bfImgB" src="${fighterB.image||''}" onerror="this.style.opacity='.15'">
            <div class="bf-name" id="bfNameB">${fighterB.name.toUpperCase()}</div>
            <div class="bf-ki"   id="bfKiB">${fmtKiC(fighterB.maxKi||fighterB.ki)}</div>
            <div class="bf-bar-wrap"><div class="bf-bar" id="bfBarB"></div></div>
          </div>
        </div>
        <div id="battleResult"></div>
        <button id="battleClose">✕ CERRAR</button>
      </div>`;

    document.body.appendChild(overlay);
    requestAnimationFrame(()=> overlay.classList.add('open'));

    play(sfxBattle);

    const bc=document.getElementById('battleCanvas');
    const bctx=bc.getContext('2d');
    bc.width=window.innerWidth; bc.height=window.innerHeight;
    const BW=bc.width, BH=bc.height;

    const colA=[80,140,255], colB=[255,60,20];
    document.getElementById('bfAuraA').style.background=`radial-gradient(circle,rgba(${colA.join(',')}, .5) 0%,transparent 70%)`;
    document.getElementById('bfAuraB').style.background=`radial-gradient(circle,rgba(${colB.join(',')}, .5) 0%,transparent 70%)`;

    const pts=[];
    function spawnPts(n,side){
      const col=side==='A'?colA:colB;
      for(let i=0;i<n;i++){
        const a=Math.random()*Math.PI*2,s=2+Math.random()*6;
        pts.push({x:side==='A'?BW*.25:BW*.75, y:BH*.45, vx:Math.cos(a)*s, vy:Math.sin(a)*s-Math.random()*3, r:1+Math.random()*4, alpha:1, decay:.02+Math.random()*.025, col});
      }
    }

    const sparks=[];
    function spawnSparks(n){
      for(let i=0;i<n;i++){
        const a=Math.random()*Math.PI*2,s=3+Math.random()*10;
        sparks.push({x:BW/2,y:BH*.45,vx:Math.cos(a)*s,vy:Math.sin(a)*s,r:1.5+Math.random()*4,alpha:1,decay:.025+Math.random()*.03});
      }
    }

    let phase=0, phaseT=0, battleRaf;
    const PHASES=['PREPARACIÓN','ATAQUE','¡¡CHOQUE!!','RESULTADO'];
    const phaseDurations=[80,90,60,0];
    let barA=50, barB=50;
    let resultShown=false;

    document.getElementById('bfBarA').style.width='50%';
    document.getElementById('bfBarB').style.width='50%';

    function battleTick(){
      phaseT++;
      bctx.clearRect(0,0,BW,BH);

      const bg=bctx.createRadialGradient(BW/2,BH/2,0,BW/2,BH/2,Math.max(BW,BH)*.8);
      bg.addColorStop(0,'rgba(10,0,30,.0)'); bg.addColorStop(1,'rgba(0,0,10,.85)');
      bctx.fillStyle=bg; bctx.fillRect(0,0,BW,BH);

      if(phase===0){
        document.getElementById('battlePhaseLabel').textContent=PHASES[0];
        if(phaseT%4===0) spawnPts(4,'A');
        if(phaseT%4===0) spawnPts(4,'B');
        if(phaseT>=phaseDurations[0]){ phase=1; phaseT=0; }

      } else if(phase===1){
        document.getElementById('battlePhaseLabel').textContent=PHASES[1];
        if(phaseT%3===0){ spawnPts(6,'A'); spawnPts(6,'B'); }
        const t=phaseT/phaseDurations[1];
        if(draw){
          barA=50; barB=50;
        } else if(winner===fighterA){
          barA=50+t*35; barB=50-t*35;
        } else {
          barA=50-t*35; barB=50+t*35;
        }
        document.getElementById('bfBarA').style.width=Math.max(10,barA)+'%';
        document.getElementById('bfBarB').style.width=Math.max(10,barB)+'%';
        document.getElementById('bfBarA').style.background=barA>=barB?'linear-gradient(90deg,#FFD700,#FF6B00)':'linear-gradient(90deg,#FF2200,#660000)';
        document.getElementById('bfBarB').style.background=barB>=barA?'linear-gradient(90deg,#FFD700,#FF6B00)':'linear-gradient(90deg,#FF2200,#660000)';
        if(phaseT>=phaseDurations[1]){ phase=2; phaseT=0; }

      } else if(phase===2){
        document.getElementById('battlePhaseLabel').textContent=PHASES[2];
        if(phaseT<15) spawnSparks(12+phaseT*2);
        if(phaseT%2===0){ spawnPts(8,'A'); spawnPts(8,'B'); }
        const shk=(1-phaseT/phaseDurations[2])*8;
        document.getElementById('battleContent').style.transform=
          phaseT<30?`translate(${(Math.random()-.5)*shk}px,${(Math.random()-.5)*shk}px)`:'';
        if(phaseT===1){
          bctx.fillStyle='rgba(255,255,255,.7)'; bctx.fillRect(0,0,BW,BH);
        }
        if(phaseT>=phaseDurations[2]){ phase=3; phaseT=0; document.getElementById('battleContent').style.transform=''; }

      } else if(phase===3){
        if(!resultShown){
          resultShown=true;
          document.getElementById('battlePhaseLabel').textContent=PHASES[3];
          const resEl=document.getElementById('battleResult');
          if(draw){
            resEl.innerHTML='<span class="br-draw">¡¡ EMPATE ÉPICO !!</span>';
          } else {
            resEl.innerHTML=`<span class="br-winner">🏆 ${winner.name.toUpperCase()} GANA</span><br><span class="br-loser">⚔ ${loser.name.toUpperCase()} ha sido derrotado</span>`;
            const winSide=winner===fighterA?'bfA':'bfB';
            document.getElementById(winSide).classList.add('bf-winner');
            const loseSide=loser===fighterA?'bfA':'bfB';
            document.getElementById(loseSide).classList.add('bf-loser');
          }
          resEl.classList.add('show');
          document.getElementById('battleClose').classList.add('show');
        }
        if(phaseT%5===0){ spawnPts(2,'A'); spawnPts(2,'B'); }
      }

      for(let i=pts.length-1;i>=0;i--){
        const p=pts[i];
        p.x+=p.vx; p.y+=p.vy; p.vx*=.93; p.vy=p.vy*.93+.08; p.alpha-=p.decay;
        if(p.alpha<=0){ pts.splice(i,1); continue; }
        bctx.save(); bctx.globalAlpha=p.alpha;
        const pg=bctx.createRadialGradient(p.x,p.y,0,p.x,p.y,p.r*2.5);
        pg.addColorStop(0,`rgba(${p.col.join(',')},1)`); pg.addColorStop(.5,`rgba(${p.col.join(',')}, .6)`); pg.addColorStop(1,'transparent');
        bctx.fillStyle=pg; bctx.beginPath(); bctx.arc(p.x,p.y,p.r*2.5,0,Math.PI*2); bctx.fill(); bctx.restore();
      }
      for(let i=sparks.length-1;i>=0;i--){
        const s=sparks[i];
        s.x+=s.vx; s.y+=s.vy; s.vx*=.9; s.vy*=.9; s.alpha-=s.decay;
        if(s.alpha<=0){ sparks.splice(i,1); continue; }
        bctx.save(); bctx.globalAlpha=s.alpha;
        const sg=bctx.createRadialGradient(s.x,s.y,0,s.x,s.y,s.r*2.5);
        sg.addColorStop(0,'rgba(255,255,220,1)'); sg.addColorStop(.4,'rgba(255,215,0,.8)'); sg.addColorStop(1,'transparent');
        bctx.fillStyle=sg; bctx.beginPath(); bctx.arc(s.x,s.y,s.r*2.5,0,Math.PI*2); bctx.fill(); bctx.restore();
      }

      battleRaf=requestAnimationFrame(battleTick);
    }
    battleRaf=requestAnimationFrame(battleTick);

    document.getElementById('battleClose').addEventListener('click',()=>{
      cancelAnimationFrame(battleRaf);
      stop(sfxBattle);
      document.getElementById('battleContent').style.transform='';
      overlay.classList.remove('open');
      setTimeout(()=>overlay.remove(),400);
    });
  }

  /* ══════════════════════════════════════
     LAUNCH PANELS
  ══════════════════════════════════════ */
  function launchPanels(){
    planetPanel.classList.add('active');
    combatBtn.classList.add('active');
    const tryFill=()=>{
      const list=getChars();
      if(list.length>=2){ randomFighter('A'); randomFighter('B'); }
      else setTimeout(tryFill,600);
    };
    setTimeout(tryFill,800);
  }

  /* ══════════════════════════════════════
     TRAVEL ANIMATION — solo audio volar
  ══════════════════════════════════════ */
  const travelOverlay=document.createElement('div');
  travelOverlay.id='travelOverlay';
  travelOverlay.innerHTML=`
    <canvas id="travelCanvas"></canvas>
    <div id="travelUI">
      <div id="travelPlanetTag"></div>
      <div id="travelPlanetImgWrap"><img id="travelPlanetImg" src="" alt=""></div>
      <div id="travelPlanetName"></div>
    </div>`;
  document.body.appendChild(travelOverlay);
  let travelRaf=null;

  function startTravel(planet){
    document.getElementById('travelPlanetName').textContent=planet.label;
    document.getElementById('travelPlanetName').style.color=planet.color;
    document.getElementById('travelPlanetName').style.textShadow=`0 0 40px rgba(${planet.R},${planet.G},${planet.B},.7)`;
    document.getElementById('travelPlanetTag').textContent=planet.tag;
    document.getElementById('travelPlanetImg').src=planet.img;
    travelOverlay.classList.add('open');
    document.body.style.overflow='hidden';
    play(sfxVolar); // ← solo volar, sin transformacion

    const canvas=document.getElementById('travelCanvas');
    const ctx=canvas.getContext('2d');
    canvas.width=window.innerWidth; canvas.height=window.innerHeight;
    const W=canvas.width,H=canvas.height,CX=W/2,CY=H/2;
    const stars=Array.from({length:500},()=>{
      const angle=Math.random()*Math.PI*2, dist=10+Math.random()*Math.min(W,H)*.1;
      return{angle,dist,speed:1+Math.random()*3,r:.5+Math.random()*1.5,
             hue:Math.random()<.15?`${planet.R},${planet.G},${planet.B}`:'255,255,255'};
    });
    let frame=0,uiShown=false;

    function travelTick(){
      frame++;
      ctx.clearRect(0,0,W,H);
      const prog=frame/160, eased=prog<.5?2*prog*prog:1-Math.pow(-2*prog+2,2)/2;
      const bg=ctx.createRadialGradient(CX,CY,0,CX,CY,Math.max(W,H)*.8);
      bg.addColorStop(0,'rgba(0,0,10,.0)'); bg.addColorStop(1,'rgba(0,0,10,.95)');
      ctx.fillStyle=bg; ctx.fillRect(0,0,W,H);
      const ws=eased<.65?eased/.65:1-(eased-.65)/.35;
      stars.forEach(s=>{
        s.dist+=s.speed*(2+ws*28); if(s.dist>Math.max(W,H)) s.dist=5+Math.random()*20;
        const x0=CX+Math.cos(s.angle)*s.dist,y0=CY+Math.sin(s.angle)*s.dist;
        const len=s.speed*(4+ws*60),x1=CX+Math.cos(s.angle)*(s.dist-len),y1=CY+Math.sin(s.angle)*(s.dist-len);
        const alpha=Math.min(1,.15+ws*.85);
        const lg=ctx.createLinearGradient(x1,y1,x0,y0);
        lg.addColorStop(0,`rgba(${s.hue},0)`); lg.addColorStop(1,`rgba(${s.hue},${alpha})`);
        ctx.save(); ctx.strokeStyle=lg; ctx.lineWidth=s.r*(1+ws*1.5);
        ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x0,y0); ctx.stroke(); ctx.restore();
      });
      if(eased>.55){
        const ap=(eased-.55)/.45;
        const aura=ctx.createRadialGradient(CX,CY,0,CX,CY,280*ap);
        aura.addColorStop(0,`rgba(${planet.R},${planet.G},${planet.B},${ap*.35})`);
        aura.addColorStop(1,'transparent');
        ctx.fillStyle=aura; ctx.beginPath(); ctx.arc(CX,CY,280*ap,0,Math.PI*2); ctx.fill();
      }
      if(eased>.6&&!uiShown){ uiShown=true;
        document.getElementById('travelPlanetTag').classList.add('show');
        document.getElementById('travelPlanetImgWrap').classList.add('show');
        setTimeout(()=>document.getElementById('travelPlanetName').classList.add('show'),200);
      }
      if(frame<160){ travelRaf=requestAnimationFrame(travelTick); }
      else{ cancelAnimationFrame(travelRaf); stop(sfxVolar); setTimeout(()=>{ closeTravelOverlay(); openDetail(planet); },600); }
    }
    if(travelRaf) cancelAnimationFrame(travelRaf);
    travelRaf=requestAnimationFrame(travelTick);
    setTimeout(()=>{ if(travelOverlay.classList.contains('open')){ stop(sfxVolar); closeTravelOverlay(); openDetail(planet); }},6000);
  }

  function closeTravelOverlay(){
    travelOverlay.classList.remove('open');
    ['travelPlanetTag','travelPlanetImgWrap','travelPlanetName'].forEach(id=>document.getElementById(id).classList.remove('show'));
    document.body.style.overflow='';
    if(travelRaf){ cancelAnimationFrame(travelRaf); travelRaf=null; }
  }

  /* ══════════════════════════════════════
     PLANET DETAIL — SIN audio transformacion
  ══════════════════════════════════════ */
  const detailEl=document.createElement('div');
  detailEl.id='planetDetailOverlay';
  detailEl.innerHTML=`
    <div id="pdCard">
      <div id="pdImgWrap"><div id="pdImgAura"></div><img id="pdImg" src="" alt=""></div>
      <div id="pdInfo">
        <div id="pdTag"></div><div id="pdName"></div>
        <div id="pdStats"></div><p id="pdDesc"></p>
        <div id="pdCharsTitle">GUERREROS CONOCIDOS</div><div id="pdChars"></div>
      </div>
      <button id="pdClose">✕</button>
    </div>`;
  document.body.appendChild(detailEl);
  document.getElementById('pdClose').addEventListener('click',closeDetail);
  detailEl.addEventListener('pointerdown',e=>{ if(e.target===detailEl) closeDetail(); });
  document.addEventListener('keydown',e=>{ if(e.key==='Escape') closeDetail(); });

  function openDetail(p){
    // Sin play(sfxTransform) — solo se abre el detalle
    const img=document.getElementById('pdImg'); img.src=p.img; img.alt=p.label;
    img.onerror=()=>{ img.style.display='none'; document.getElementById('pdImgWrap').style.background=`radial-gradient(circle at 50% 50%,rgba(${p.R},${p.G},${p.B},.4) 0%,rgba(2,0,10,.95) 70%)`; };
    document.getElementById('pdImgAura').style.background=`radial-gradient(circle,rgba(${p.R},${p.G},${p.B},.45) 0%,transparent 68%)`;
    document.getElementById('pdTag').textContent=p.tag;
    document.getElementById('pdName').textContent=p.label;
    document.getElementById('pdName').style.color=p.color;
    document.getElementById('pdName').style.textShadow=`0 0 30px rgba(${p.R},${p.G},${p.B},.5)`;
    document.getElementById('pdStats').innerHTML=p.stats.map(s=>`<div class="pd-stat"><strong>${s.l}:</strong> ${s.v}</div>`).join('');
    document.getElementById('pdDesc').textContent=p.desc;
    document.getElementById('pdChars').innerHTML=p.chars.map(c=>`<span class="pd-char" data-char="${c}">${c}</span>`).join('');
    document.querySelectorAll('.pd-char').forEach(chip=>{
      chip.addEventListener('click',()=>{
        closeDetail(); setTimeout(()=>{ const inp=document.getElementById('searchInput'); if(inp){ inp.value=chip.dataset.char; inp.dispatchEvent(new Event('input',{bubbles:true})); inp.focus(); } },320);
      });
    });
    detailEl.classList.add('open'); document.body.style.overflow='hidden';
  }
  function closeDetail(){ detailEl.classList.remove('open'); document.body.style.overflow=''; }

  /* ══════════════════════════════════════
     RAYOS AMARILLOS — hover transformaciones
  ══════════════════════════════════════ */
  (()=>{
    const lc=document.createElement('canvas'); lc.id='trLightningCanvas'; document.body.appendChild(lc);
    const lCtx=lc.getContext('2d');
    function resizeL(){ lc.width=window.innerWidth; lc.height=window.innerHeight; }
    resizeL(); window.addEventListener('resize',resizeL);
    const bolts=[];
    function makeBolt(cx,cy,angle){ return{cx,cy,angle:angle!==undefined?angle:Math.random()*Math.PI*2,len:40+Math.random()*100,segs:Math.floor(3+Math.random()*5),life:1,decay:.055+Math.random()*.075,width:.7+Math.random()*2,white:Math.random()<.18}; }
    function drawBoltPath(b){ lCtx.beginPath(); lCtx.moveTo(b.cx,b.cy); for(let i=0;i<b.segs;i++){ const frac=(i+1)/b.segs; lCtx.lineTo(b.cx+Math.cos(b.angle)*b.len*frac+(Math.random()-.5)*26,b.cy+Math.sin(b.angle)*b.len*frac+(Math.random()-.5)*26); } }
    function drawBolt(b){ const col=b.white?'220,240,255':'255,215,0',glow=b.white?'180,220,255':'255,165,0'; lCtx.save(); lCtx.globalAlpha=b.life*.7; lCtx.strokeStyle=`rgba(${glow},${b.life*.45})`; lCtx.lineWidth=b.width*3.5; lCtx.shadowColor=b.white?'#c8e0ff':'#FFD700'; lCtx.shadowBlur=14; drawBoltPath(b); lCtx.stroke(); lCtx.globalAlpha=b.life; lCtx.strokeStyle=`rgba(${col},${b.life})`; lCtx.lineWidth=b.width; lCtx.shadowBlur=5; drawBoltPath(b); lCtx.stroke(); lCtx.restore(); }
    function spawnBurst(cx,cy,n){ for(let i=0;i<(n||8);i++) bolts.push(makeBolt(cx,cy)); }
    function spawnDrizzle(cx,cy){ bolts.push(makeBolt(cx+(Math.random()-.5)*80,cy+(Math.random()-.5)*35,-Math.PI/2+(Math.random()-.5)*1.9)); }
    let lRunning=false;
    function lLoop(){ lCtx.clearRect(0,0,lc.width,lc.height); for(let i=bolts.length-1;i>=0;i--){ bolts[i].life-=bolts[i].decay; if(bolts[i].life<=0){bolts.splice(i,1);continue;} drawBolt(bolts[i]); } if(bolts.length>0) requestAnimationFrame(lLoop); else lRunning=false; }
    function startL(){ if(!lRunning){lRunning=true;lLoop();} }
    let curTr=null,drizzleT=null;
    document.addEventListener('mouseover',e=>{ const el=e.target.closest('.tr-clickable'); if(!el||el===curTr) return; curTr=el; const r=el.getBoundingClientRect(); spawnBurst(r.left+r.width/2,r.top+r.height/2,10); startL(); clearInterval(drizzleT); drizzleT=setInterval(()=>{ if(!curTr||!document.contains(curTr)){clearInterval(drizzleT);return;} const r2=curTr.getBoundingClientRect(); spawnDrizzle(r2.left+r2.width/2,r2.top+r2.height/2); startL(); },55); });
    document.addEventListener('mouseout',e=>{ if(e.target.closest('.tr-clickable')){curTr=null;clearInterval(drizzleT);} });
    document.addEventListener('click',e=>{ const el=e.target.closest('.tr-clickable'); if(!el) return; const r=el.getBoundingClientRect(); spawnBurst(r.left+r.width/2,r.top+r.height/2,14); startL(); });
  })();

})();