/* ═══════════════════════════════════════════
   DRAGON BALL — planets.js  v12
   · dragon_ball_intro.m4a  → al cargar página Y al mostrar "TOCA PARA CONTINUAR"
   · dragon_ball_intro2.m4a → batalla épica
   · kamehameha.m4a         → botón ALEATORIO
   · transformacion.m4a     → transformaciones de personaje
   · volar.m4a              → viaje a planeta
   ═══════════════════════════════════════════ */

(function () {
  'use strict';

  /* ══════════════════════════════════════
     AUDIOS
  ══════════════════════════════════════ */
  function mkAudio(src, vol) {
    const a = new Audio('audios/' + src);
    a.preload = 'auto'; a.volume = vol || 0.75; return a;
  }
  const sfxIntro     = mkAudio('dragon_ball_intro.m4a',  0.3);
  sfxIntro.loop = true;
  const sfxBattle    = mkAudio('dragon_ball_intro2.m4a', 0.05);
  const sfxKame      = mkAudio('kamehameha.m4a',         0.8);
  const sfxTransform = mkAudio('transformacion.m4a',     0.8);
  const sfxVolar     = mkAudio('volar.m4a',              0.8);

  function _rawPlay(sfx) { try { sfx.currentTime = 0; sfx.play().catch(()=>{}); } catch(e){} }
  function _rawStop(sfx) { try { sfx.pause(); sfx.currentTime = 0; } catch(e){} }

  /* ── MUTE global ── */
  let globalMuted = false;
  function setMute(muted) {
    globalMuted = muted;
    sfxIntro.muted = muted;   /* solo silencia la música de fondo */
    if (muted) sfxIntro.pause();
    else if (_introWasPlaying && _activeSecondary === 0) sfxIntro.play().catch(()=>{});
    const btn = document.getElementById('dbMuteBtn');
    if (btn) {
      btn.textContent = muted ? '🔇' : '🔊';
      btn.title       = muted ? 'Activar música' : 'Silenciar música';
    }
  }

  /* ── Duck / resume intro ──────────────────────────────────────────
     Cuando suena cualquier sfx secundario (batalla, kame, transform,
     volar) el intro se pausa. Cuando ese sfx termina, el intro reanuda.
     Un contador evita reanudar antes de que acaben todos los activos.
  ──────────────────────────────────────────────────────────────────── */
  let _activeSecondary = 0;
  let _introWasPlaying = false;
  const SECONDARY_SFX = [sfxBattle, sfxKame, sfxTransform, sfxVolar];

  function _duckIntro() {
    _activeSecondary++;
    if (!sfxIntro.paused) {
      _introWasPlaying = true;
      sfxIntro.pause();   /* pausa sin resetear → reanuda donde estaba */
    }
  }
  function _resumeIntro() {
    _activeSecondary = Math.max(0, _activeSecondary - 1);
    if (_activeSecondary === 0 && _introWasPlaying && !globalMuted) {
      sfxIntro.play().catch(()=>{});
    }
  }

  SECONDARY_SFX.forEach(sfx => {
    sfx.addEventListener('ended', _resumeIntro);
    sfx.addEventListener('pause', () => {
      /* stop() hace pause+currentTime=0; lo tratamos como fin */
      if (sfx.currentTime === 0) _resumeIntro();
    });
  });

  function play(sfx) {
    if (sfx === sfxIntro && globalMuted) return;  /* intro silenciada */
    if (SECONDARY_SFX.includes(sfx)) _duckIntro();
    _rawPlay(sfx);
  }
  function stop(sfx) {
    _rawStop(sfx);
  }

  /* ── Audio intro: suena al hacer clic para entrar (exitIntro) ── */
  let introPlayed = false;
  function tryPlayIntro() {
    if (introPlayed) return;
    introPlayed = true;
    _introWasPlaying = true;
    if (!globalMuted) sfxIntro.play().catch(()=>{});
  }

  /* Patch app.js audio refs */
  document.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById('btnRandom');
    if (btn) btn.addEventListener('click', () => play(sfxKame), true);
  });
  window.addEventListener('load', () => {
    try {
      if (typeof playKame      !== 'undefined') window.playKame      = () => play(sfxKame);
      if (typeof playTransform !== 'undefined') window.playTransform = () => play(sfxTransform);
    } catch(e){}
  });

  /* ══════════════════════════════════════
     PLANET DATA
  ══════════════════════════════════════ */
  /* ── Personajes inventados (no están en la API) con bio propia ──
     Se mezclan con los nombres de la API en cada planeta.
     El panel de detalle del planeta muestra chips clicables;
     los que son objetos con .bio se muestran en un mini-modal local
     en lugar de buscarlos en la API. ── */
  const EXTRA_CHARS = {
    /* ══ TIERRA ══ */
    'Chi-Chi': {
      name:'Chi-Chi', race:'Humana', ki:'850', maxKi:'1.200',
      image:'https://dragonball-api.com/characters/gohan.webp', /* placeholder */
      affiliation:'Familia Son',
      description:'Hija del Rey Gyuma y esposa de Goku, Chi-Chi es una guerrera de élite que renunció a la batalla para criar a sus hijos con mano de hierro. Su dominio del ki interno supera al de muchos Z Fighters, aunque jamás lo ha demostrado públicamente. Custodia los secretos del Monte Fry-pan con un poder oculto que ni el propio Goku conoce.'
    },
    'Androide 17': {
      name:'Androide 17', race:'Androide', ki:'320.000.000', maxKi:'3.2 Billion',
      image:'https://dragonball-api.com/characters/gohan.webp',
      affiliation:'Z Fighter',
      description:'Hermano gemelo del Androide 18 y guardabosques del Parque Natural de la Isla Sur. Modificado por el Dr. Gero con un reactor de energía infinita, 17 combina la frialdad del metal con una voluntad irrompible. Su ki ilimitado le permite mantener la pelea durante semanas sin cansarse, algo que ni los dioses han logrado igualar.'
    },
    'Maestro Roshi': {
      name:'Maestro Roshi', race:'Humano', ki:'180.000', maxKi:'1.8 Million',
      image:'https://dragonball-api.com/characters/gohan.webp',
      affiliation:'Z Fighter',
      description:'El Guerrero Tortuga Inmortal lleva tres siglos perfeccionando las artes marciales en su isla. Creador de la Kamehameha, técnica que tardó 50 años en dominar, Roshi oculta bajo su apariencia de anciano excéntrico un poder que sacudió las bases del Torneo de Artes Marciales. Su máxima forma es capaz de rivalizar con semidioses.'
    },
    'Videl': {
      name:'Videl', race:'Humana', ki:'45.000', maxKi:'90.000',
      image:'https://dragonball-api.com/characters/gohan.webp',
      affiliation:'Z Fighter',
      description:'Hija del autoproclamado héroe Hercule, Videl descubrió la verdad del mundo oculto de los ki-luchadores gracias a Gohan. Tras aprender a volar y controlar su energía, se convirtió en una guerrera por derecho propio. Su determinación feroz y su sentido de la justicia la hacen tan peligrosa como cualquier Z Fighter.'
    },
    'Pan': {
      name:'Pan', race:'Saiyan / Humana', ki:'50.000.000', maxKi:'800 Million',
      image:'https://dragonball-api.com/characters/gohan.webp',
      affiliation:'Z Fighter',
      description:'Nieta de Goku y primera mestiza de cuarto de sangre Saiyan en alcanzar el vuelo. Pan nunca transformó en Super Saiyan, pero su potencial latente supera al de muchos guerreros completos. Dicen que en sus sueños combate en torneos de dimensiones que aún no existen.'
    },
    'Goten': {
      name:'Goten', race:'Saiyan / Humano', ki:'40.000.000', maxKi:'5 Billion',
      image:'https://dragonball-api.com/characters/gohan.webp',
      affiliation:'Z Fighter',
      description:'Segundo hijo de Goku, Goten alcanzó la transformación Super Saiyan a los 7 años, convirtiéndose en el guerrero más joven de la historia en lograrlo. Junto a Trunks forma el equipo de fusión Gotenks, cuyo poder es capaz de desafiar a rivales de nivel divino.'
    },
    'Trunks': {
      name:'Trunks', race:'Saiyan / Humano', ki:'55.000.000', maxKi:'8 Billion',
      image:'https://dragonball-api.com/characters/gohan.webp',
      affiliation:'Z Fighter',
      description:'Hijo de Vegeta y Bulma, Trunks existe en dos líneas temporales: el del presente, travieso y despreocupado; y el del futuro, forjado en la guerra contra los Androides. Ambos comparten el mismo potencial explosivo que lo sitúa entre los guerreros más prometedores del Universo 7.'
    },
    /* ══ PLANETA VEGETA ══ */
    'Bardock': {
      name:'Bardock', race:'Saiyan', ki:'10.000', maxKi:'180.000',
      image:'https://dragonball-api.com/characters/gohan.webp',
      affiliation:'Ejército de Freezer',
      description:'Padre de Goku y guerrero de rango bajo, Bardock fue el primer Saiyan en rebelarse contra Freezer al ver su destino en una visión del futuro. Murió enfrentando al tirano en solitario, pero su grito de batalla retumbó en cada transformación Super Saiyan que vendría después. Su espíritu indomable es el origen de todo lo que Goku es.'
    },
    'Rey Vegeta': {
      name:'Rey Vegeta', race:'Saiyan', ki:'18.000', maxKi:'18.000',
      image:'https://dragonball-api.com/characters/gohan.webp',
      affiliation:'Realeza Saiyan',
      description:'Monarca del Planeta Vegeta y padre del Príncipe Vegeta, el Rey Vegeta gobernó con orgullo y puño de hierro a la raza guerrera más temida de la galaxia. Aunque servía bajo las órdenes de Freezer, jamás dobló la rodilla en su corazón. Murió intentando salvar a su pueblo, su último acto fue de un rey auténtico.'
    },
    'Nappa': {
      name:'Nappa', race:'Saiyan', ki:'4.000', maxKi:'4.200',
      image:'https://dragonball-api.com/characters/gohan.webp',
      affiliation:'Ejército de Freezer',
      description:'General élite del Ejército Saiyan y compañero de Vegeta durante años, Nappa era el brazo destructor del dúo. Su poder de combate sin transformación bastó para eliminar a varios Z Fighters en minutos. Vegeta lo eliminó sin dudar al volverse un estorbo, un final digno de la ley Saiyan.'
    },
    'Broly': {
      name:'Broly', race:'Saiyan', ki:'1.4 Billion', maxKi:'11 Quintillion',
      image:'https://dragonball-api.com/characters/gohan.webp',
      affiliation:'Ninguna',
      description:'El Saiyan Legendario, nacido con un poder que aterrorizó incluso al Rey Vegeta nada más nacer. Criado en un planeta desértico por su padre Paragus, su ki se multiplicó hasta niveles que ningún instrumento puede medir. En su forma Legendario Super Saiyan, su aura verde destruye planetas sin que él mueva un dedo.'
    },
    'Paragus': {
      name:'Paragus', race:'Saiyan', ki:'8.500', maxKi:'9.000',
      image:'https://dragonball-api.com/characters/gohan.webp',
      affiliation:'Ninguna',
      description:'Padre de Broly y antiguo soldado de élite del Ejército Saiyan, Paragus sobrevivió a la destrucción del Planeta Vegeta y dedicó su vida a controlar el poder desmedido de su hijo. Calculador y frío, construyó un imperio de control mental para usar a Broly como arma definitiva de venganza.'
    },
    'Raditz': {
      name:'Raditz', race:'Saiyan', ki:'1.200', maxKi:'1.500',
      image:'https://dragonball-api.com/characters/gohan.webp',
      affiliation:'Ejército de Freezer',
      description:'El hermano mayor de Goku y el primer antagonista de Dragon Ball Z. Raditz llegó a la Tierra para reclamar a su hermano como conquistador, sin imaginar que encontraría resistencia. Aunque fue derrotado, su llegada desencadenó la cadena de eventos que llevaría a los Saiyans a convertirse en los defensores del universo.'
    },
    /* ══ NAMEK ══ */
    'Nail': {
      name:'Nail', race:'Namekiano', ki:'42.000', maxKi:'42.000',
      image:'https://dragonball-api.com/characters/picolo_normal.webp',
      affiliation:'Guerreros de Namek',
      description:'El guerrero más poderoso de Namek antes de la llegada de los Z Fighters. Guardián personal del Gran Patriarca, Nail se fusionó con Piccolo para darle la ventaja que necesitaba contra Freezer. Su espíritu sigue vivo dentro de Piccolo, aportando calma y sabiduría namekiana en los momentos más críticos.'
    },
    'Guru': {
      name:'Guru', race:'Namekiano', ki:'10', maxKi:'10',
      image:'https://dragonball-api.com/characters/picolo_normal.webp',
      affiliation:'Líderes de Namek',
      description:'El Gran Patriarca de los Namekianos y progenitor de toda su especie actual. Guru pasó siglos meditando y canalizando el ki del planeta Namek en sus Esferas del Dragón. Su poder espiritual era tan inmenso que al morir todo Namek tembló. Su último acto fue liberar el potencial oculto de Krillin y Gohan.'
    },
    'Dende': {
      name:'Dende', race:'Namekiano', ki:'500', maxKi:'1.000',
      image:'https://dragonball-api.com/characters/picolo_normal.webp',
      affiliation:'Z Fighter',
      description:'El joven namekiano que guió a Krillin y Gohan hasta las Esferas del Dragón en Namek y más tarde se convirtió en el nuevo Dios de la Tierra. Dende posee el don de la curación, capaz de restaurar cualquier herida instantáneamente. Su bondad y valentía han salvado a los Z Fighters en incontables ocasiones.'
    },
    'Lord Slug': {
      name:'Lord Slug', race:'Namekiano Oscuro', ki:'3.500.000', maxKi:'3.500.000',
      image:'https://dragonball-api.com/characters/picolo_normal.webp',
      affiliation:'Ninguna',
      description:'Un Super Namekiano corrupto exiliado de su planeta por practicar las artes oscuras del ki. Slug conquistó decenas de mundos durante siglos, usando su capacidad de regeneración y su tamaño colosal para aplastar ejércitos enteros. Su encuentro con Goku fue la primera vez en milenios que alguien le puso en jaque.'
    },
    'Cargo': {
      name:'Cargo', race:'Namekiano', ki:'200', maxKi:'200',
      image:'https://dragonball-api.com/characters/picolo_normal.webp',
      affiliation:'Aldea Namekiana',
      description:'Joven namekiano de una de las aldeas del planeta, Cargo poseía un don natural para sentir el ki ajeno desde grandes distancias. Su muerte a manos de Dodoria fue el detonante que encendió la furia de Gohan y Krillin. Aunque su vida fue breve, su espíritu encarna la inocencia de Namek antes de la guerra.'
    },
    'Moori': {
      name:'Moori', race:'Namekiano', ki:'1.500', maxKi:'1.500',
      image:'https://dragonball-api.com/characters/picolo_normal.webp',
      affiliation:'Líderes Namekianos',
      description:'Anciano jefe de una de las principales aldeas de Namek y guardián de una de las Esferas del Dragón. Moori resistió la tortura de las Fuerzas de Freezer sin revelar el paradero de las esferas. Tras la guerra, se convirtió en uno de los líderes del Nuevo Namek, portando la memoria de los caídos.'
    },
    /* ══ SADALA ══ */
    'Cabba': {
      name:'Cabba', race:'Saiyan U6', ki:'38.000.000', maxKi:'3.5 Billion',
      image:'https://dragonball-api.com/characters/vegeta_normal.webp',
      affiliation:'Guerreros del Universo 6',
      description:'El primer Saiyan del Universo 6 en conocer a Vegeta, quien le enseñó la transformación Super Saiyan. Cabba es un guerrero noble que usa su fuerza para proteger al débil, todo lo contrario al estereotipo de su raza. Su respeto hacia Vegeta es tan profundo que lo considera su maestro y modelo a seguir.'
    },
    'Caulifla': {
      name:'Caulifla', race:'Saiyan U6', ki:'45.000.000', maxKi:'6 Billion',
      image:'https://dragonball-api.com/characters/vegeta_normal.webp',
      affiliation:'Guerreros del Universo 6',
      description:'La Saiyan más poderosa del Universo 6 y líder de su propia banda de guerreros. Caulifla alcanzó la transformación Super Saiyan 2 en horas, un logro que a otros les lleva décadas. Su instinto de combate es tan agudo que aprende nuevas técnicas simplemente viéndolas una vez.'
    },
    'Kale': {
      name:'Kale', race:'Saiyan U6', ki:'40.000.000', maxKi:'9 Billion',
      image:'https://dragonball-api.com/characters/vegeta_normal.webp',
      affiliation:'Guerreros del Universo 6',
      description:'La encarnación del Super Saiyan Legendario en el Universo 6. Tímida y reservada en su estado normal, Kale desata un poder devastador e incontrolable al transformarse. Su berserker dorada rivaliza con la de Broly, y su vínculo con Caulifla es el único ancla que la mantiene conectada al mundo real.'
    },
    'Renso': {
      name:'Renso', race:'Saiyan U6', ki:'35.000.000', maxKi:'1.2 Billion',
      image:'https://dragonball-api.com/characters/vegeta_normal.webp',
      affiliation:'Guerreros del Universo 6',
      description:'Hermano mayor de Caulifla y antiguo capitán del equipo de élite del Universo 6. Una lesión en combate lo alejó del campo de batalla, pero su leyenda sigue viva entre los guerreros de Sadala. Fue él quien reconoció el potencial de Cabba y lo recomendó para representar al universo en el Torneo del Poder.'
    },
    'Beets': {
      name:'Beets', race:'Saiyan U6', ki:'1.200', maxKi:'1.200',
      image:'https://dragonball-api.com/characters/vegeta_normal.webp',
      affiliation:'Ejército del Universo 6',
      description:'Soldado Saiyan de bajo rango del Universo 6 y compañero de misión de Cabba. Beets carecía del talento natural de sus compañeros, pero compensaba con disciplina y un ki sorprendentemente estable para su nivel. Murió en misión antes del Torneo del Poder, pero su nombre sigue grabado en los registros del ejército de Sadala.'
    },
    /* ══ YARDRAT ══ */
    'Steth': {
      name:'Steth', race:'Yardratiano', ki:'200.000', maxKi:'200.000',
      image:'https://dragonball-api.com/characters/gohan.webp',
      affiliation:'Pueblo Yardrat',
      description:'El sabio que recibió a Goku tras su victoria en Namek y le enseñó los fundamentos de las técnicas espirituales Yardrat. Steth lleva 400 años estudiando el movimiento del ki entre dimensiones y puede teletransportarse a cualquier punto del universo conocido sin necesidad de una señal. Su cuerpo es casi completamente energía condensada.'
    },
    'Pybara': {
      name:'Pybara', race:'Yardratiano', ki:'350.000', maxKi:'350.000',
      image:'https://dragonball-api.com/characters/gohan.webp',
      affiliation:'Pueblo Yardrat',
      description:'El gran maestro espiritual de Yardrat, considerado el mayor experto en técnicas de ki del universo conocido. Fue Pybara quien completó el adiestramiento de Goku en la Transmisión Instantánea y más tarde entrenó a Vegeta en la técnica del Hakai espiritual. Sus enseñanzas cambiaron el curso de la historia del Universo 7.'
    },
  };

  /* Función para obtener bio de personaje extra por nombre */
  function getExtraChar(name) {
    return EXTRA_CHARS[name] || null;
  }

  const PLANETS = [
    { key:'tierra', label:'Planeta Tierra', tag:'SISTEMA SOLAR · SECTOR 7G',
      img:'img/planeta_tierra.png', color:'#78b8ff', R:80, G:160, B:255,
      stats:[{l:'Sistema',v:'Solar'},{l:'Gravedad',v:'10x Estándar'},{l:'Atmósfera',v:'Oxígeno/Nitrógeno'},{l:'Estado',v:'✅ Habitado'}],
      desc:'La Tierra es el escenario principal de Dragon Ball. Escenario de las batallas más épicas del Universo 7, ha sido defendida por los Guerreros Z contra amenazas cósmicas que ningún otro planeta habría sobrevivido.',
      chars:['Goku','Gohan','Vegeta','Piccolo','Krillin','Bulma','Trunks','Goten','Chi-Chi','Videl','Pan','Yamcha','Ten Shin Han','Maestro Roshi','Androide 17','Androide 18','Celula'] },
    { key:'vegeta', label:'Planeta Vegeta', tag:'SISTEMA SAIYAN · SECTOR NORTE',
      img:'img/planeta_vegeta.png', color:'#FF8040', R:255, G:75, B:10,
      stats:[{l:'Raza',v:'Saiyans'},{l:'Gravedad',v:'10x la Tierra'},{l:'Destructor',v:'Freezer'},{l:'Estado',v:'💥 Destruido'}],
      desc:'Cuna de la orgullosa raza guerrera Saiyan, destruida por Freezer en un instante. Su legado vive en cada transformación Super Saiyan y en el rugido de batalla de quienes llevan sangre Saiyan en sus venas.',
      chars:['Vegeta','Bardock','Rey Vegeta','Broly','Raditz','Nappa','Paragus','Goku'] },
    { key:'namek', label:'Planeta Namek', tag:'SECTOR 9045 · UNIVERSO 7',
      img:'img/planeta_namek.png', color:'#44ff88', R:40, G:220, B:90,
      stats:[{l:'Raza',v:'Namekianos'},{l:'Soles',v:'3 Soles'},{l:'Dragón',v:'Porunga'},{l:'Estado',v:'⚠️ Nuevo Namek'}],
      desc:'Iluminado eternamente por tres soles, Namek fue el campo de batalla más brutal del Universo 7. Sus Esferas del Dragón, gobernadas por Porunga, tienen el poder de conceder tres deseos y revivir a grupos enteros.',
      chars:['Piccolo','Nail','Guru','Dende','Cargo','Moori','Lord Slug','Freezer','Zarbon','Dodoria','Ginyu'] },
    { key:'sadala', label:'Planeta Sadala', tag:'UNIVERSO 6 · SECTOR OMEGA',
      img:'img/planeta_sadala.png', color:'#c8ff40', R:160, G:255, B:30,
      stats:[{l:'Universo',v:'Universo 6'},{l:'Raza',v:'Saiyans U6'},{l:'Estado',v:'✅ Habitado'},{l:'Rival',v:'Planeta Vegeta'}],
      desc:'El hogar de los Saiyans del Universo 6, una raza que usa su poder para proteger en lugar de conquistar. Sadala es el espejo de lo que el Planeta Vegeta pudo haber sido si la historia hubiera tomado otro camino.',
      chars:['Cabba','Caulifla','Kale','Renso','Beets'] },
    { key:'yardrat', label:'Planeta Yardrat', tag:'GALAXIA DEL NORTE · CUADRANTE ESTE',
      img:'img/planeta_yardrat.png', color:'#ff60c0', R:220, G:50, B:180,
      stats:[{l:'Raza',v:'Yardratians'},{l:'Técnica',v:'Transmisión Instantánea'},{l:'Ki',v:'Espiritual Avanzado'},{l:'Estado',v:'✅ Habitado'}],
      desc:'Un mundo de aspecto modesto que esconde los secretos más avanzados del manejo del ki en el universo. Sus habitantes dominan técnicas espirituales que ni los dioses comprenden del todo. Goku pasó aquí un año aprendiendo la Transmisión Instantánea.',
      chars:['Goku','Steth','Pybara'] },
  ];

  function getChars() { return (typeof chars !== 'undefined' && chars.length) ? chars : []; }
  function fmtKiC(v) {
    if (!v) return '?';
    const n = typeof v==='string' ? parseInt(v.replace(/,/g,'')) : Number(v);
    if (isNaN(n)) return String(v).slice(0,8);
    if (n>=1e12) return (n/1e12).toFixed(1)+'T';
    if (n>=1e9)  return (n/1e9).toFixed(1)+'B';
    if (n>=1e6)  return (n/1e6).toFixed(1)+'M';
    if (n>=1e3)  return (n/1e3).toFixed(1)+'K';
    return n;
  }
  function parseKiNum(v) {
    if (!v) return Math.random()*1000;
    const s = String(v).replace(/,/g,'').toUpperCase();
    const n = parseFloat(s);
    if (isNaN(n)) return Math.random()*1000;
    if (s.includes('T')) return n*1e12;
    if (s.includes('B')) return n*1e9;
    if (s.includes('M')) return n*1e6;
    if (s.includes('K')) return n*1e3;
    return n;
  }

  /* ══════════════════════════════════════
     INTRO
  ══════════════════════════════════════ */
  const introEl = document.createElement('div'); introEl.id = 'dbIntro';
  const introStars = document.createElement('canvas'); introStars.id = 'introStarsCanvas';
  introEl.appendChild(introStars);
  const ringsDiv = document.createElement('div'); ringsDiv.id = 'introRings';
  [380,520,680].forEach((s,i)=>{
    const r=document.createElement('div'); r.className='i-ring';
    r.style.cssText=`width:${s}px;height:${s}px;animation-delay:${i*2}s;animation-duration:${6+i*1.5}s`;
    ringsDiv.appendChild(r);
  });
  introEl.appendChild(ringsDiv);
  const orbitCanvas = document.createElement('canvas'); orbitCanvas.id = 'dbOrbitCanvas';
  introEl.appendChild(orbitCanvas);
  const titleEl = document.createElement('div'); titleEl.id='introTitle'; titleEl.textContent='Dragon Ball Universe';
  const subEl   = document.createElement('div'); subEl.id='introSub';   subEl.textContent='Universo · Sistema Solar';
  const hintEl  = document.createElement('div'); hintEl.id='introHint'; hintEl.textContent='— TOCA PARA CONTINUAR —';
  introEl.appendChild(titleEl); introEl.appendChild(subEl); introEl.appendChild(hintEl);
  document.body.appendChild(introEl);

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
        if(i===0) ctx.moveTo(sx+ro*Math.cos(a),sy+ro*Math.sin(a));
        else ctx.lineTo(sx+ro*Math.cos(a),sy+ro*Math.sin(a));
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
      balls.forEach(b=>{ const x=OCX+Math.cos(b.angle+orbitAngle)*ORBIT_RX,y=OCY+Math.sin(b.angle+orbitAngle)*ORBIT_RY; drawSingleBall(oc,b.stars,x,y,BALL_R,b.alpha,b.scale); });
      if(prog>=1){
        orbitPhase=1; phaseTimer=0;
        setTimeout(()=>{
          titleEl.classList.add('show');
          setTimeout(()=>subEl.classList.add('show'),350);
          setTimeout(()=>{
            hintEl.classList.add('show');
            hintShown = true;
          },800);
        },80);
      }
    } else {
      orbitAngle+=dt*.52;
      oc.save(); oc.globalAlpha=.09; oc.strokeStyle='#FFD700'; oc.lineWidth=1;
      oc.beginPath(); oc.ellipse(OCX,OCY,ORBIT_RX,ORBIT_RY,0,0,Math.PI*2); oc.stroke(); oc.restore();
      balls.forEach(b=>{ const x=OCX+Math.cos(b.angle+orbitAngle)*ORBIT_RX,y=OCY+Math.sin(b.angle+orbitAngle)*ORBIT_RY; drawSingleBall(oc,b.stars,x,y,BALL_R,1,1); });
    }
  }

  function orbitLoop(t){ const dt=Math.min((t-prevT)*.001,.05); prevT=t; tickOrbit(dt); if(!launched) requestAnimationFrame(orbitLoop); }
  requestAnimationFrame(t=>{ prevT=t; orbitLoop(t); });

  function exitIntro(){
    if(launched) return; launched=true;
    tryPlayIntro();           /* ← suena al hacer clic para entrar */
    introEl.classList.add('hiding');
    setTimeout(()=>{ introEl.style.display='none'; launchPanels(); },900);
  }
  introEl.addEventListener('click', exitIntro);
  document.addEventListener('keydown', e=>{ if(e.key===' '||e.key==='Enter') exitIntro(); });

  /* ══════════════════════════════════════
     PANEL PLANETAS — derecha
  ══════════════════════════════════════ */
  const planetPanel = document.createElement('div'); planetPanel.id = 'planetPanel';
  document.body.appendChild(planetPanel);
  const ppTitle = document.createElement('div'); ppTitle.id='planetPanelTitle'; ppTitle.textContent='PLANETAS';
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
     BOTÓN COMBATE FLOTANTE
  ══════════════════════════════════════ */
  const combatBtn = document.createElement('button');
  combatBtn.id = 'combatFloatBtn'; combatBtn.innerHTML = '⚔'; combatBtn.title = 'Combate';
  document.body.appendChild(combatBtn);

  /* ══════════════════════════════════════
     OVERLAY SELECTOR DE COMBATE
     — imagen completa del personaje, sin círculo
  ══════════════════════════════════════ */
  const combatOverlay = document.createElement('div');
  combatOverlay.id = 'combatSelectorOverlay';
  combatOverlay.innerHTML = `
    <div id="combatSelectorCard">
      <button id="combatSelectorClose">✕</button>
      <div id="csoHeader">
        <div id="csoTitle">⚔ COMBATE</div>
        <div id="csoSub">Elige tus guerreros y que empiece la batalla</div>
      </div>
      <div id="csoArena">

        <!-- FIGHTER A -->
        <div class="cso-fighter" id="csoFighterA">
          <div class="cso-fighter-spotlight" id="csoSpotA"></div>
          <div class="cso-fighter-img-wrap" id="csoWrapA">
            <img class="cso-fighter-img" id="csoImgA" src="" alt="" style="display:none">
            <div class="cso-fighter-placeholder" id="csoPH_A">?</div>
          </div>
          <div class="cso-fighter-label">GUERRERO 1</div>
          <div class="cso-fighter-name" id="csoNameA">— ELIGE —</div>
          <div class="cso-fighter-ki"   id="csoKiA"></div>
          <div class="cso-controls">
            <div class="cso-search-wrap">
              <input class="cso-input" id="csoInputA" placeholder="Buscar...">
              <div class="cso-drop" id="csoDropA"></div>
            </div>
            <button class="cso-rand" id="csoRandA">🎲 Aleatorio</button>
          </div>
        </div>

        <!-- VS -->
        <div id="csoVSBlock">
          <div id="csoVS">VS</div>
        </div>

        <!-- FIGHTER B -->
        <div class="cso-fighter" id="csoFighterB">
          <div class="cso-fighter-spotlight" id="csoSpotB"></div>
          <div class="cso-fighter-img-wrap" id="csoWrapB">
            <img class="cso-fighter-img" id="csoImgB" src="" alt="" style="display:none">
            <div class="cso-fighter-placeholder" id="csoPH_B">?</div>
          </div>
          <div class="cso-fighter-label">GUERRERO 2</div>
          <div class="cso-fighter-name" id="csoNameB">— ELIGE —</div>
          <div class="cso-fighter-ki"   id="csoKiB"></div>
          <div class="cso-controls">
            <div class="cso-search-wrap">
              <input class="cso-input" id="csoInputB" placeholder="Buscar...">
              <div class="cso-drop" id="csoDropB"></div>
            </div>
            <button class="cso-rand" id="csoRandB">🎲 Aleatorio</button>
          </div>
        </div>

      </div>
      <button id="csoFightBtn">
        <span class="cso-fight-bg"></span>
        <span class="cso-fight-sparks">
          <span></span><span></span><span></span><span></span><span></span><span></span>
        </span>
        <span class="cso-fight-content">
          <span class="cso-fight-icon">⚡</span>
          <span class="cso-fight-text">¡¡ LUCHAR !!</span>
          <span class="cso-fight-icon">⚡</span>
        </span>
        <span class="cso-fight-shine"></span>
      </button>
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
  document.getElementById('combatSelectorClose').addEventListener('click', () => combatOverlay.classList.remove('open'));
  combatOverlay.addEventListener('pointerdown', e => { if (e.target === combatOverlay) combatOverlay.classList.remove('open'); });

  let fighterA=null, fighterB=null;

  function setCombatFighter(slot, char){
    const imgEl  = document.getElementById(`csoImg${slot}`);
    const phEl   = document.getElementById(`csoPH_${slot}`);
    const nameEl = document.getElementById(`csoName${slot}`);
    const kiEl   = document.getElementById(`csoKi${slot}`);
    const spotEl = document.getElementById(`csoSpot${slot}`);

    if (slot==='A') fighterA=char; else fighterB=char;

    if (char.image) {
      imgEl.src = char.image;
      imgEl.style.display = 'block';
      phEl.style.display  = 'none';
      imgEl.onerror = () => { imgEl.style.display='none'; phEl.style.display='flex'; };
    } else {
      imgEl.style.display = 'none';
      phEl.style.display  = 'flex';
    }
    nameEl.textContent = char.name.toUpperCase();
    kiEl.textContent   = char.maxKi ? `Ki: ${fmtKiC(char.maxKi)}` : (char.ki ? `Ki: ${fmtKiC(char.ki)}` : '');

    /* spotlight color: A = azul, B = rojo-naranja */
    const col = slot==='A' ? '80,160,255' : '255,80,20';
    spotEl.style.background = `radial-gradient(ellipse 80% 60% at 50% 100%, rgba(${col},.55) 0%, transparent 75%)`;
  }

  function randomFighter(slot){
    const list=getChars(); if(!list.length) return;
    let pick;
    do { pick=list[Math.floor(Math.random()*list.length)]; }
    while(list.length>1&&((slot==='A'&&pick===fighterB)||(slot==='B'&&pick===fighterA)));
    setCombatFighter(slot,pick);
  }

  document.getElementById('csoRandA').addEventListener('click', ()=>randomFighter('A'));
  document.getElementById('csoRandB').addEventListener('click', ()=>randomFighter('B'));

  /* ── LUCHAR: animación de viaje → batalla ── */
  document.getElementById('csoFightBtn').addEventListener('click', ()=>{
    if (!fighterA) randomFighter('A');
    if (!fighterB) randomFighter('B');
    combatOverlay.classList.remove('open');
    setTimeout(() => travelToBattle(startEpicBattle), 150);
  });

  function buildCsoDrop(inputId, dropId, slot){
    const inp=document.getElementById(inputId), drop=document.getElementById(dropId);
    let pointer=false;
    inp.addEventListener('input', ()=>{
      const q=inp.value.trim().toLowerCase();
      if(!q){ drop.innerHTML=''; drop.classList.remove('open'); return; }
      const list=getChars();
      const matches=list.filter(c=>c.name?.toLowerCase().includes(q)).slice(0,7);
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
    inp.addEventListener('blur',()=>setTimeout(()=>{ if(!pointer){drop.innerHTML='';drop.classList.remove('open');} pointer=false; },120));
  }
  buildCsoDrop('csoInputA','csoDropA','A');
  buildCsoDrop('csoInputB','csoDropB','B');

  /* ══════════════════════════════════════
     ANIMACIÓN VIAJE AL RING DE COMBATE
     Warp de estrellas + texto antes de la batalla
  ══════════════════════════════════════ */
  function travelToBattle(onReady) {
    const trav = document.createElement('div');
    trav.id = 'battleTravelOverlay';
    trav.style.cssText = `
      position:fixed;inset:0;z-index:98500;background:#000;
      display:flex;align-items:center;justify-content:center;overflow:hidden;
    `;

    const cv = document.createElement('canvas');
    cv.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;';
    trav.appendChild(cv);

    /* Texto central */
    const label = document.createElement('div');
    label.style.cssText = `
      position:absolute;font-family:'Bangers',cursive;
      font-size:clamp(1.2rem,5vw,3rem);letter-spacing:8px;
      color:#FFD700;text-shadow:0 0 30px rgba(255,215,0,.9),0 0 60px rgba(255,107,0,.6);
      text-transform:uppercase;opacity:0;transition:opacity .5s;
      bottom:22%;left:50%;transform:translateX(-50%);white-space:nowrap;
      text-align:center;
    `;
    label.textContent = '⚡ AL RING DE COMBATE ⚡';
    trav.appendChild(label);

    /* Nombres de los luchadores */
    const fighters = document.createElement('div');
    fighters.style.cssText = `
      position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);
      display:flex;align-items:center;gap:clamp(1rem,4vw,3rem);
      opacity:0;transition:opacity .4s .15s;pointer-events:none;
      flex-wrap:wrap;justify-content:center;
    `;
    fighters.innerHTML = `
      <span style="font-family:'Bangers',cursive;font-size:clamp(1rem,4vw,2.2rem);letter-spacing:4px;
        color:#5090ff;text-shadow:0 0 20px rgba(80,144,255,.9);white-space:nowrap;">
        ${fighterA ? fighterA.name.toUpperCase() : '???'}
      </span>
      <span style="font-family:'Bangers',cursive;font-size:clamp(1.5rem,6vw,3rem);letter-spacing:6px;
        color:#FF4400;text-shadow:0 0 25px rgba(255,68,0,.9);animation:vsPulse 1s ease-in-out infinite alternate;">
        VS
      </span>
      <span style="font-family:'Bangers',cursive;font-size:clamp(1rem,4vw,2.2rem);letter-spacing:4px;
        color:#ff5014;text-shadow:0 0 20px rgba(255,80,20,.9);white-space:nowrap;">
        ${fighterB ? fighterB.name.toUpperCase() : '???'}
      </span>
    `;
    trav.appendChild(fighters);

    document.body.appendChild(trav);

    cv.width  = window.innerWidth;
    cv.height = window.innerHeight;
    const ctx = cv.getContext('2d');
    const W = cv.width, H = cv.height, CX = W/2, CY = H/2;

    const stars = Array.from({length:600}, () => {
      const a = Math.random()*Math.PI*2;
      const d = 5 + Math.random()*Math.min(W,H)*.1;
      return { a, d, spd: 1.5+Math.random()*4, r: .5+Math.random()*1.5,
               hue: Math.random()<.25 ? '255,70,0' : Math.random()<.5 ? '255,215,0' : '255,255,255' };
    });

    let frame = 0, labelShown = false, fightersShown = false;
    const TOTAL_FRAMES = 160;

    function tick() {
      frame++;
      const prog  = Math.min(1, frame / TOTAL_FRAMES);
      /* ws: velocidad warp — sube rápido, baja al final */
      const ws    = prog < .6 ? prog / .6 : 1 - (prog - .6) / .4;

      ctx.clearRect(0,0,W,H);
      ctx.fillStyle = '#000'; ctx.fillRect(0,0,W,H);

      stars.forEach(s => {
        s.d += s.spd * (3 + ws * 40);
        if (s.d > Math.max(W,H)) s.d = 3 + Math.random()*20;
        const x0 = CX + Math.cos(s.a)*s.d;
        const y0 = CY + Math.sin(s.a)*s.d;
        const len = s.spd*(5 + ws*90);
        const x1 = CX + Math.cos(s.a)*(s.d-len);
        const y1 = CY + Math.sin(s.a)*(s.d-len);
        const lg = ctx.createLinearGradient(x1,y1,x0,y0);
        lg.addColorStop(0, `rgba(${s.hue},0)`);
        lg.addColorStop(1, `rgba(${s.hue},${Math.min(1,.15+ws*.85)})`);
        ctx.save();
        ctx.strokeStyle = lg;
        ctx.lineWidth   = s.r * (1 + ws*2.5);
        ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x0,y0); ctx.stroke();
        ctx.restore();
      });

      /* Destello central al máximo warp */
      if (ws > .85) {
        const flare = ctx.createRadialGradient(CX,CY,0,CX,CY,220*(ws-.85)/.15);
        flare.addColorStop(0, `rgba(255,200,100,${(ws-.85)*.4})`);
        flare.addColorStop(1, 'transparent');
        ctx.fillStyle = flare;
        ctx.beginPath(); ctx.arc(CX,CY,220,0,Math.PI*2); ctx.fill();
      }

      if (prog > .25 && !fightersShown) { fightersShown = true; fighters.style.opacity = '1'; }
      if (prog > .45 && !labelShown)    { labelShown = true;    label.style.opacity    = '1'; }

      if (frame < TOTAL_FRAMES) {
        requestAnimationFrame(tick);
      } else {
        label.style.opacity    = '0';
        fighters.style.opacity = '0';
        setTimeout(() => { trav.remove(); onReady(); }, 300);
      }
    }

    play(sfxVolar);
    requestAnimationFrame(tick);
  }

  /* ══════════════════════════════════════
     EPIC BATTLE — 15 segundos, barras
     se vacían completamente al morir
     Fondo: ring_lucha.jpg
  ══════════════════════════════════════ */
  function startEpicBattle(){
    if(!fighterA||!fighterB) return;
    stop(sfxVolar);

    const kA = parseKiNum(fighterA.maxKi||fighterA.ki);
    const kB = parseKiNum(fighterB.maxKi||fighterB.ki);
    /* Resultado determinístico con algo de azar */
    const rA = kA*(0.75+Math.random()*0.5);
    const rB = kB*(0.75+Math.random()*0.5);
    const draw   = Math.abs(rA-rB) < (kA+kB)*.03;
    const winner = draw ? null : (rA>rB ? fighterA : fighterB);
    const loser  = draw ? null : (rA>rB ? fighterB : fighterA);

    /* ── Overlay ── */
    const overlay = document.createElement('div'); overlay.id='battleOverlay';

    /* Canvas de partículas (encima del ring) */
    const battleCanvas = document.createElement('canvas'); battleCanvas.id='battleCanvas';
    overlay.appendChild(battleCanvas);

    /* ── FONDO: imagen del ring de lucha ── */
    const ringBg = document.createElement('div');
    ringBg.id = 'battleRingBg';
    overlay.appendChild(ringBg);

    /* Oscurecedor semitransparente sobre el ring para que resalten los personajes */
    const ringDim = document.createElement('div');
    ringDim.style.cssText = `
      position:absolute;inset:0;z-index:1;
      background:linear-gradient(to bottom,rgba(0,0,10,.45) 0%,rgba(0,0,10,.25) 40%,rgba(0,0,10,.7) 100%);
      pointer-events:none;
    `;
    overlay.appendChild(ringDim);

    overlay.innerHTML += `
      <div id="battleContent">
        <div id="battleTimerBar"><div id="battleTimerFill"></div></div>
        <div id="battlePhaseLabel"></div>
        <div id="battleFighters">
          <div class="bf-side" id="bfA">
            <div class="bf-aura" id="bfAuraA"></div>
            <img class="bf-img" id="bfImgA" src="${fighterA.image||''}" onerror="this.style.opacity='.12'">
            <div class="bf-name">${fighterA.name.toUpperCase()}</div>
            <div class="bf-ki">${fmtKiC(fighterA.maxKi||fighterA.ki)}</div>
            <div class="bf-bar-wrap"><div class="bf-bar" id="bfBarA" style="width:100%"></div></div>
          </div>
          <div id="bfVS">VS</div>
          <div class="bf-side" id="bfB">
            <div class="bf-aura" id="bfAuraB"></div>
            <img class="bf-img" id="bfImgB" src="${fighterB.image||''}" onerror="this.style.opacity='.12'">
            <div class="bf-name">${fighterB.name.toUpperCase()}</div>
            <div class="bf-ki">${fmtKiC(fighterB.maxKi||fighterB.ki)}</div>
            <div class="bf-bar-wrap"><div class="bf-bar" id="bfBarB" style="width:100%"></div></div>
          </div>
        </div>
        <div id="battleResult"></div>
        <button id="battleClose">✕ CERRAR</button>
      </div>`;

    document.body.appendChild(overlay);
    requestAnimationFrame(()=>overlay.classList.add('open'));
    play(sfxBattle);

    /* Canvas partículas */
    const bc=document.getElementById('battleCanvas');
    const bctx=bc.getContext('2d');
    bc.width=window.innerWidth; bc.height=window.innerHeight;
    const BW=bc.width, BH=bc.height;

    const colA=[80,140,255], colB=[255,60,20];
    document.getElementById('bfAuraA').style.background=`radial-gradient(circle,rgba(${colA.join(',')}, .55) 0%,transparent 70%)`;
    document.getElementById('bfAuraB').style.background=`radial-gradient(circle,rgba(${colB.join(',')}, .55) 0%,transparent 70%)`;

    /* ── Lógica de barras ──
       La batalla dura BATTLE_DURATION ms en total.
       Dividida en 3 fases: prep (15%), fight (70%), result (15%).
       Durante fight las barras bajan: el perdedor llega a 0, el ganador queda en 20-40%.
       En empate ambos llegan a ~5%.
    */
    const BATTLE_DURATION = 15000; // 15 segundos
    const PHASE_PREP_END   = BATTLE_DURATION * 0.15;
    const PHASE_FIGHT_END  = BATTLE_DURATION * 0.85;

    let barA=100, barB=100;
    const targetBarWinner = draw ? 5 : 20 + Math.random()*20;
    const targetBarLoser  = 0;
    const targetBarA = draw ? 5 : (winner===fighterA ? targetBarWinner : targetBarLoser);
    const targetBarB = draw ? 5 : (winner===fighterB ? targetBarWinner : targetBarLoser);

    const pts=[], sparks=[];
    function spawnPts(n,side){
      const col=side==='A'?colA:colB;
      for(let i=0;i<n;i++){
        const a=Math.random()*Math.PI*2,s=2+Math.random()*6;
        pts.push({x:side==='A'?BW*.25:BW*.75,y:BH*.45,vx:Math.cos(a)*s,vy:Math.sin(a)*s-Math.random()*3,r:1+Math.random()*4,alpha:1,decay:.018+Math.random()*.022,col});
      }
    }
    function spawnSparks(n){
      for(let i=0;i<n;i++){
        const a=Math.random()*Math.PI*2,s=3+Math.random()*10;
        sparks.push({x:BW/2,y:BH*.45,vx:Math.cos(a)*s,vy:Math.sin(a)*s,r:1.5+Math.random()*4,alpha:1,decay:.022+Math.random()*.028});
      }
    }

    let startTime=null, resultShown=false, battleRaf;
    const timerFill  = document.getElementById('battleTimerFill');
    const phaseLabel = document.getElementById('battlePhaseLabel');

    function battleTick(ts){
      if(!startTime) startTime=ts;
      const elapsed    = ts - startTime;
      const totalProg  = Math.min(1, elapsed / BATTLE_DURATION);

      /* Timer bar */
      timerFill.style.width = (100*(1-totalProg))+'%';
      timerFill.style.background = totalProg < 0.5
        ? 'linear-gradient(90deg,#00ff88,#FFD700)'
        : totalProg < 0.8
          ? 'linear-gradient(90deg,#FFD700,#FF6B00)'
          : 'linear-gradient(90deg,#FF2200,#660000)';

      bctx.clearRect(0,0,BW,BH);

      /* FASE 1 — PREPARACIÓN */
      if(elapsed < PHASE_PREP_END){
        phaseLabel.textContent='⚡ PREPARACIÓN';
        if(Math.random()<.5) spawnPts(3,'A');
        if(Math.random()<.5) spawnPts(3,'B');
        barA=100; barB=100;

      /* FASE 2 — COMBATE */
      } else if(elapsed < PHASE_FIGHT_END){
        const fightProgress = (elapsed - PHASE_PREP_END) / (PHASE_FIGHT_END - PHASE_PREP_END);
        phaseLabel.textContent = fightProgress < 0.5 ? '🔥 ¡¡ATAQUE!!' : '💥 ¡¡CHOQUE!!';

        barA = 100 + (targetBarA - 100) * fightProgress;
        barB = 100 + (targetBarB - 100) * fightProgress;

        const intensity = Math.floor(2 + fightProgress*8);
        if(Math.random()<.7) spawnPts(intensity,'A');
        if(Math.random()<.7) spawnPts(intensity,'B');

        if(fightProgress > 0.45 && fightProgress < 0.55){
          if(Math.random()<.2) spawnSparks(8);
        }
        if(fightProgress > 0.48 && fightProgress < 0.52){
          const shk=(0.52-fightProgress)*20;
          document.getElementById('battleContent').style.transform=
            `translate(${(Math.random()-.5)*shk}px,${(Math.random()-.5)*shk}px)`;
        } else {
          document.getElementById('battleContent').style.transform='';
        }

        document.getElementById('bfBarA').style.width = Math.max(0,barA)+'%';
        document.getElementById('bfBarB').style.width = Math.max(0,barB)+'%';
        document.getElementById('bfBarA').style.background = barA > 40
          ? 'linear-gradient(90deg,#FFD700,#FF6B00)'
          : barA > 15
            ? 'linear-gradient(90deg,#FF8000,#FF2200)'
            : 'linear-gradient(90deg,#FF0000,#440000)';
        document.getElementById('bfBarB').style.background = barB > 40
          ? 'linear-gradient(90deg,#FFD700,#FF6B00)'
          : barB > 15
            ? 'linear-gradient(90deg,#FF8000,#FF2200)'
            : 'linear-gradient(90deg,#FF0000,#440000)';

      /* FASE 3 — RESULTADO */
      } else {
        document.getElementById('bfBarA').style.width = Math.max(0,targetBarA)+'%';
        document.getElementById('bfBarB').style.width = Math.max(0,targetBarB)+'%';
        document.getElementById('battleContent').style.transform='';

        if(!resultShown){
          resultShown=true;
          phaseLabel.textContent='🏆 RESULTADO';
          const resEl=document.getElementById('battleResult');
          if(draw){
            resEl.innerHTML='<span class="br-draw">¡¡ EMPATE ÉPICO !!</span>';
          } else {
            resEl.innerHTML=`<span class="br-winner">🏆 ${winner.name.toUpperCase()} GANA</span><br><span class="br-loser">💀 ${loser.name.toUpperCase()} ha sido derrotado</span>`;
            document.getElementById(winner===fighterA?'bfA':'bfB').classList.add('bf-winner');
            document.getElementById(loser===fighterA?'bfA':'bfB').classList.add('bf-loser');
          }
          resEl.classList.add('show');
          document.getElementById('battleClose').classList.add('show');
        }
        if(Math.random()<.25) spawnPts(2,'A');
        if(Math.random()<.25) spawnPts(2,'B');
      }

      /* Dibujar partículas */
      for(let i=pts.length-1;i>=0;i--){
        const p=pts[i];
        p.x+=p.vx; p.y+=p.vy; p.vx*=.93; p.vy=p.vy*.93+.08; p.alpha-=p.decay;
        if(p.alpha<=0){pts.splice(i,1);continue;}
        bctx.save(); bctx.globalAlpha=p.alpha;
        const pg=bctx.createRadialGradient(p.x,p.y,0,p.x,p.y,p.r*2.5);
        pg.addColorStop(0,`rgba(${p.col.join(',')},1)`); pg.addColorStop(.5,`rgba(${p.col.join(',')}, .6)`); pg.addColorStop(1,'transparent');
        bctx.fillStyle=pg; bctx.beginPath(); bctx.arc(p.x,p.y,p.r*2.5,0,Math.PI*2); bctx.fill(); bctx.restore();
      }
      for(let i=sparks.length-1;i>=0;i--){
        const s=sparks[i];
        s.x+=s.vx; s.y+=s.vy; s.vx*=.9; s.vy*=.9; s.alpha-=s.decay;
        if(s.alpha<=0){sparks.splice(i,1);continue;}
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

    /* ── Botón mute/unmute ── */
    const muteBtn = document.createElement('button');
    muteBtn.id        = 'dbMuteBtn';
    muteBtn.textContent = '🔊';
    muteBtn.title     = 'Silenciar';
    muteBtn.addEventListener('click', () => setMute(!globalMuted));
    document.body.appendChild(muteBtn);

    const tryFill=()=>{
      const list=getChars();
      if(list.length>=2){ randomFighter('A'); randomFighter('B'); }
      else setTimeout(tryFill,600);
    };
    setTimeout(tryFill,800);
  }

  /* ══════════════════════════════════════
     TRAVEL ANIMATION (planetas)
  ══════════════════════════════════════ */
  const travelOverlay=document.createElement('div'); travelOverlay.id='travelOverlay';
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
    play(sfxVolar);

    const canvas=document.getElementById('travelCanvas');
    const ctx=canvas.getContext('2d');
    canvas.width=window.innerWidth; canvas.height=window.innerHeight;
    const W=canvas.width,H=canvas.height,CX=W/2,CY=H/2;
    const stars=Array.from({length:500},()=>{
      const angle=Math.random()*Math.PI*2,dist=10+Math.random()*Math.min(W,H)*.1;
      return{angle,dist,speed:1+Math.random()*3,r:.5+Math.random()*1.5,hue:Math.random()<.15?`${planet.R},${planet.G},${planet.B}`:'255,255,255'};
    });
    let frame=0,uiShown=false;

    function travelTick(){
      frame++;
      ctx.clearRect(0,0,W,H);
      const prog=frame/160,eased=prog<.5?2*prog*prog:1-Math.pow(-2*prog+2,2)/2;
      const bg=ctx.createRadialGradient(CX,CY,0,CX,CY,Math.max(W,H)*.8);
      bg.addColorStop(0,'rgba(10,0,30,.0)'); bg.addColorStop(1,'rgba(0,0,10,.88)');
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
        aura.addColorStop(0,`rgba(${planet.R},${planet.G},${planet.B},${ap*.35})`); aura.addColorStop(1,'transparent');
        ctx.fillStyle=aura; ctx.beginPath(); ctx.arc(CX,CY,280*ap,0,Math.PI*2); ctx.fill();
      }
      if(eased>.6&&!uiShown){
        uiShown=true;
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
     PLANET DETAIL
  ══════════════════════════════════════ */
  const detailEl=document.createElement('div'); detailEl.id='planetDetailOverlay';
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
    const img=document.getElementById('pdImg'); img.src=p.img; img.alt=p.label;
    img.onerror=()=>{ img.style.display='none'; document.getElementById('pdImgWrap').style.background=`radial-gradient(circle at 50% 50%,rgba(${p.R},${p.G},${p.B},.4) 0%,rgba(2,0,10,.95) 70%)`; };
    document.getElementById('pdImgAura').style.background=`radial-gradient(circle,rgba(${p.R},${p.G},${p.B},.45) 0%,transparent 68%)`;
    document.getElementById('pdTag').textContent=p.tag;
    document.getElementById('pdName').textContent=p.label;
    document.getElementById('pdName').style.color=p.color;
    document.getElementById('pdName').style.textShadow=`0 0 30px rgba(${p.R},${p.G},${p.B},.5)`;
    document.getElementById('pdStats').innerHTML=p.stats.map(s=>`<div class="pd-stat"><strong>${s.l}:</strong> ${s.v}</div>`).join('');
    document.getElementById('pdDesc').textContent=p.desc;
    document.getElementById('pdChars').innerHTML=p.chars.map(c=>{
      const isExtra = !!getExtraChar(c);
      return `<span class="pd-char${isExtra?' pd-char-extra':''}" data-char="${c}">${c}${isExtra?' ✦':''}</span>`;
    }).join('');
    document.querySelectorAll('.pd-char').forEach(chip=>{
      chip.addEventListener('click',()=>{
        const charName = chip.dataset.char;
        const extra = getExtraChar(charName);
        if (extra) {
          /* Personaje inventado → mini-modal local */
          openExtraCharModal(extra);
        } else {
          /* Personaje de la API → búsqueda normal */
          closeDetail();
          setTimeout(()=>{ const inp=document.getElementById('searchInput'); if(inp){ inp.value=charName; inp.dispatchEvent(new Event('input',{bubbles:true})); inp.focus(); }},320);
        }
      });
    });
    detailEl.classList.add('open'); document.body.style.overflow='hidden';
  }
  function closeDetail(){ detailEl.classList.remove('open'); document.body.style.overflow=''; }

  /* ── Mini-modal para personajes inventados ── */
  function openExtraCharModal(char) {
    /* Eliminar si ya existe */
    const old = document.getElementById('extraCharModal');
    if (old) old.remove();

    const modal = document.createElement('div');
    modal.id = 'extraCharModal';
    modal.style.cssText = `
      position:fixed;inset:0;z-index:95500;
      display:flex;align-items:center;justify-content:center;
      background:rgba(0,0,12,.82);backdrop-filter:blur(10px);
      padding:1.5rem;animation:pdOpen .35s cubic-bezier(.34,1.2,.64,1);
    `;

    const kiVal = char.maxKi && char.maxKi !== '0' ? char.maxKi : (char.ki || '?');
    const kiBase = char.ki && char.ki !== '0' ? char.ki : '?';

    modal.innerHTML = `
      <div style="
        position:relative;max-width:660px;width:100%;
        background:linear-gradient(145deg,rgba(8,8,22,.99),rgba(14,10,26,.99));
        border:1.5px solid rgba(255,215,0,.25);border-radius:24px;overflow:hidden;
        box-shadow:0 40px 100px rgba(0,0,0,.85),inset 0 1px 0 rgba(255,215,0,.08);
        animation:pdOpen .35s cubic-bezier(.34,1.2,.64,1);
      ">
        <div style="position:absolute;top:0;left:0;right:0;height:3px;
          background:linear-gradient(90deg,transparent,#FFD700,#FF6B00,#FFD700,transparent);
          background-size:200%;animation:pdFlow 3s linear infinite;border-radius:24px 24px 0 0;"></div>
        <button id="extraCharClose" style="
          position:absolute;top:1rem;right:1rem;width:34px;height:34px;border-radius:50%;
          border:1.5px solid rgba(255,255,255,.18);background:rgba(0,0,0,.55);
          color:rgba(255,255,255,.65);font-size:1rem;cursor:pointer;
          display:flex;align-items:center;justify-content:center;transition:all .22s;z-index:10;
        ">✕</button>
        <div style="display:flex;align-items:stretch;flex-wrap:wrap;">
          <div style="
            flex-shrink:0;width:200px;min-height:240px;
            background:radial-gradient(ellipse at 50% 80%,rgba(255,107,0,.12) 0%,rgba(2,0,10,.95) 70%);
            display:flex;align-items:center;justify-content:center;padding:1.5rem 1rem;
            position:relative;
          ">
            <div style="position:absolute;inset:0;border-radius:50%;
              background:radial-gradient(circle,rgba(255,215,0,.1) 0%,transparent 65%);
              animation:auraPulse 2.5s ease-in-out infinite;pointer-events:none;"></div>
            <div style="
              width:130px;height:130px;border-radius:50%;
              background:linear-gradient(135deg,rgba(255,215,0,.15),rgba(255,107,0,.08));
              border:2px solid rgba(255,215,0,.2);
              display:flex;align-items:center;justify-content:center;
              font-size:3.5rem;position:relative;z-index:2;
              box-shadow:0 0 30px rgba(255,107,0,.2);
            ">⚔</div>
          </div>
          <div style="flex:1;min-width:200px;padding:1.8rem 1.6rem;display:flex;flex-direction:column;gap:.7rem;
            border-left:1px solid rgba(255,215,0,.08);overflow-y:auto;max-height:75vh;">
            <div style="font-family:'Rajdhani',sans-serif;font-size:.65rem;letter-spacing:5px;
              text-transform:uppercase;color:rgba(255,215,0,.4);">GUERRERO · BIO CLASIFICADA</div>
            <div style="font-family:'Bangers',cursive;font-size:clamp(1.6rem,4vw,2.4rem);
              letter-spacing:3px;line-height:1;
              background:linear-gradient(135deg,#FFD700,#FF6B00);
              -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;">
              ${char.name}
            </div>
            <div style="display:flex;flex-wrap:wrap;gap:.4rem;">
              <div style="padding:.3rem .85rem;border-radius:50px;border:1px solid rgba(255,215,0,.18);
                background:rgba(255,215,0,.04);font-family:'Rajdhani',sans-serif;font-size:.75rem;
                letter-spacing:1.5px;text-transform:uppercase;color:rgba(240,230,200,.72);">
                <strong style="color:#FFD700;margin-right:.3em;">Raza:</strong>${char.race}
              </div>
              <div style="padding:.3rem .85rem;border-radius:50px;border:1px solid rgba(255,215,0,.18);
                background:rgba(255,215,0,.04);font-family:'Rajdhani',sans-serif;font-size:.75rem;
                letter-spacing:1.5px;text-transform:uppercase;color:rgba(240,230,200,.72);">
                <strong style="color:#FFD700;margin-right:.3em;">Ki Base:</strong>${kiBase}
              </div>
              <div style="padding:.3rem .85rem;border-radius:50px;border:1px solid rgba(255,215,0,.18);
                background:rgba(255,215,0,.04);font-family:'Rajdhani',sans-serif;font-size:.75rem;
                letter-spacing:1.5px;text-transform:uppercase;color:rgba(240,230,200,.72);">
                <strong style="color:#FFD700;margin-right:.3em;">Ki Máx:</strong>${kiVal}
              </div>
              <div style="padding:.3rem .85rem;border-radius:50px;border:1px solid rgba(255,215,0,.18);
                background:rgba(255,215,0,.04);font-family:'Rajdhani',sans-serif;font-size:.75rem;
                letter-spacing:1.5px;text-transform:uppercase;color:rgba(240,230,200,.72);">
                <strong style="color:#FFD700;margin-right:.3em;">Afiliación:</strong>${char.affiliation}
              </div>
            </div>
            <p style="font-family:'Rajdhani',sans-serif;font-size:.97rem;line-height:1.8;
              color:rgba(240,230,200,.7);border-left:2px solid rgba(255,215,0,.15);padding-left:1rem;
              margin-top:.2rem;">
              ${char.description}
            </p>
            <div style="font-family:'Rajdhani',sans-serif;font-size:.65rem;letter-spacing:3px;
              text-transform:uppercase;color:rgba(255,107,0,.4);margin-top:auto;padding-top:.5rem;
              border-top:1px solid rgba(255,255,255,.05);">
              ✦ Expediente confidencial — Clasificación Omega
            </div>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    const closeBtn = document.getElementById('extraCharClose');
    closeBtn.addEventListener('click', () => modal.remove());
    modal.addEventListener('pointerdown', e => { if (e.target === modal) modal.remove(); });
    document.addEventListener('keydown', function escExtra(e) {
      if (e.key === 'Escape') { modal.remove(); document.removeEventListener('keydown', escExtra); }
    });
  }

  /* ══════════════════════════════════════
     RAYOS — hover transformaciones
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