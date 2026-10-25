'use strict';

/* =====================================================
   PALETA DE COLORES
   Cada categoría → [fondo suave, color intenso]
   Tipos de tarjeta: cielo=Julene, menta=Pareja, lavanda=Compartida
   ===================================================== */
const CATPAL = {
  'Supermercado':  ['#BFE6D8','#2F8F72'],
  'Transporte':    ['#BFDDF3','#3C86C4'],
  'Restaurantes':  ['#F8D2BE','#D9733F'],
  'Suscripciones': ['#CBC3F0','#6C5FC7'],
  'Compras':       ['#F3C6D8','#C9578A'],
  'Salud':         ['#D3E3C0','#5E8A3A'],
  'Ocio':          ['#F5E6B0','#A8861F'],
  'Hogar':         ['#E4D9C8','#8A7656'],
  'Sin categoría': ['#E8E6E0','#7A8094'],
};
const TYPEPAL = {
  'Julene':     ['#BFDDF3','#3C86C4'],  // cielo
  'Pareja':     ['#BFE6D8','#2F8F72'],  // menta
  'Compartida': ['#CBC3F0','#6C5FC7'],  // lavanda
};
const DEFAULT_PAL = ['#E8E6E0','#7A8094'];

// Color intenso de categoría (para puntos y texto)
const col  = c => (CATPAL[c] || DEFAULT_PAL)[1];
// Color de fondo suave de categoría
const cbg  = c => (CATPAL[c] || DEFAULT_PAL)[0];
// Color intenso de tipo de tarjeta
const ccol = t => (TYPEPAL[t] || DEFAULT_PAL)[1];
// Color de fondo suave de tipo de tarjeta
const cbgt = t => (TYPEPAL[t] || DEFAULT_PAL)[0];

/* =====================================================
   ICONOS NAV — SVG inline (stroke, no fill)
   ===================================================== */
const ICONS = {
  home: `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`,
  mov:  `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>`,
  pres: `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/></svg>`,
  tend: `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>`
};

/* =====================================================
   UTILIDADES
   ===================================================== */
const $ = s => document.querySelector(s);
const eur = n => new Intl.NumberFormat('es-ES',{style:'currency',currency:'EUR'}).format(n||0);
const MES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
const ls = {
  get: k => { try { return localStorage.getItem(k) } catch(e) { return null } },
  set: (k,v) => { try { localStorage.setItem(k,v) } catch(e) {} }
};
const esc = s => String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

/* =====================================================
   ESTADO DE LA APP
   ===================================================== */
const S = {
  tab:'home', data:null, demo:false, ym:null,
  filt:'Todas', q:'',
  cfg:{url:ls.get('url')||'', token:ls.get('token')||''}
};
const now = new Date();
S.ym = now.getFullYear()*12 + now.getMonth();

const ymOf = f => +f.slice(0,4)*12 + (+f.slice(5,7)-1);
const cards = () => [...new Set(S.data.gastos.map(g=>g.t))];
const inM   = ym => S.data.gastos.filter(g=>ymOf(g.f)===ym);
const sum   = a  => a.reduce((s,g)=>s+g.i, 0);
const byCat = a  => { const m={}; a.forEach(g=>m[g.cat]=(m[g.cat]||0)+g.i); return Object.entries(m).sort((x,y)=>y[1]-x[1]); };

/* =====================================================
   DATOS DE DEMO (sin cambios de lógica)
   ===================================================== */
function demo() {
  const cats = ['Supermercado','Transporte','Restaurantes','Suscripciones','Compras','Salud','Ocio','Hogar'];
  const sh = [
    ['Mercadona','Supermercado',[18,60]],['Carrefour','Supermercado',[20,80]],
    ['Metro','Transporte',[8,25]],['Uber','Transporte',[6,18]],
    ['La Tagliatella','Restaurantes',[20,60]],['Netflix','Suscripciones',[13,13]],
    ['Spotify','Suscripciones',[11,11]],['Zara','Compras',[20,70]],
    ['Farmacia','Salud',[6,30]],['Cine','Ocio',[10,30]],['Ikea','Hogar',[15,90]]
  ];
  let seed = 7;
  const rnd = () => (seed = seed*16807%2147483647)/2147483647;
  const g = []; let r = 2;
  for (let m = 5; m >= 0; m--) {
    for (let k = 0; k < 22; k++) {
      const x = sh[Math.floor(rnd()*sh.length)];
      const d = new Date(now.getFullYear(), now.getMonth()-m, 1+Math.floor(rnd()*27));
      if (d > now) continue;
      const t = rnd()<.4 ? 'Compartida' : (rnd()<.5 ? 'Julene' : 'Pareja');
      g.push({r:r++, f:d.toISOString().slice(0,10), c:x[0], i:Math.round((x[2][0]+rnd()*(x[2][1]-x[2][0]))*100)/100, t, cat:x[1]});
    }
  }
  g.push({r:r++, f:now.toISOString().slice(0,10), c:'Kiosko Pepe', i:4.5, t:'Julene', cat:'Sin categoría'});
  g.sort((a,b) => b.f.localeCompare(a.f));
  return {
    gastos: g, cats,
    lim:{Supermercado:350,Transporte:80,Restaurantes:150,Suscripciones:40,Compras:120,Salud:50,Ocio:80,Hogar:100}
  };
}

/* =====================================================
   CARGA DE DATOS (lógica intacta)
   ===================================================== */
async function load() {
  if (!S.cfg.url) { S.data = demo(); S.demo = true; return render(); }
  try {
    const r = await fetch(S.cfg.url+'?token='+encodeURIComponent(S.cfg.token), {redirect:'follow'});
    const j = await r.json();
    if (j.error) throw new Error(j.error);
    S.data = j; S.demo = false;
    ls.set('cache', JSON.stringify(j));
  } catch(e) {
    const c = ls.get('cache');
    if (c) { S.data = JSON.parse(c); S.demo = false; S.offline = true; }
    else   { S.data = demo(); S.demo = true; S.err = String(e.message||e); }
  }
  render();
}

/* =====================================================
   RENDER PRINCIPAL
   ===================================================== */
function render() {
  if (!S.data) return;
  const v = {home, mov, pres, tend}[S.tab]();
  const mm = S.ym%12, yy = Math.floor(S.ym/12);

  $('#app').innerHTML = `
    <header>
      <!-- Esferas decorativas de fondo -->
      <div class="hdr-deco" aria-hidden="true">
        <div class="hdr-c1"></div>
        <div class="hdr-c2"></div>
        <div class="hdr-c3"></div>
      </div>
      <div class="hdr-content">
        <div class="top">
          <h1>Gastos</h1>
          <button class="ib" onclick="cfg()" aria-label="Ajustes">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="3"/>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
            </svg>
          </button>
        </div>
        <div class="month">
          <button onclick="mv(-1)" aria-label="Mes anterior">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <div class="month-pill">
            <span class="month-name">${MES[mm]}</span>
            <span class="month-year">${yy}</span>
          </div>
          <button onclick="mv(1)" aria-label="Mes siguiente">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
        </div>
      </div>
      <!-- Ola orgánica de transición al fondo de la app -->
      <svg class="hdr-wave" viewBox="0 0 480 52" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M0,36 C100,12 180,46 300,22 C380,8 430,36 480,26 L480,52 L0,52 Z" style="fill:var(--bg)"/>
      </svg>
    </header>
    <main>
      ${S.demo ? `<div class="demo">Datos de ejemplo${S.err ? ' · error: '+esc(S.err) : ' · conecta tu Sheet en ⚙'}</div>` : ''}
      ${S.offline ? '<div class="demo">Sin conexión · mostrando los últimos datos guardados</div>' : ''}
      ${v}
    </main>`;

  $('#nav').innerHTML = [
    ['home', 'Inicio',   ICONS.home],
    ['mov',  'Movim.',   ICONS.mov],
    ['pres', 'Presup.',  ICONS.pres],
    ['tend', 'Tendenc.', ICONS.tend]
  ].map(([id, label, icon]) =>
    `<button class="${S.tab===id?'on':''}" onclick="go('${id}')" aria-label="${label}">
       <span>${icon}</span>${label}
     </button>`
  ).join('');

  // Animar contador principal tras pintar el DOM
  requestAnimationFrame(animateCounters);
}

window.go = t => { S.tab=t; render(); scrollTo(0,0); };
window.mv = d => { S.ym+=d; render(); };

/* =====================================================
   ANIMACIÓN DE CONTADOR
   Busca elementos con data-count y anima el número
   con ease-out cúbico durante 650ms
   ===================================================== */
function animateCounters() {
  document.querySelectorAll('[data-count]').forEach(el => {
    // Respeta prefers-reduced-motion
    if (matchMedia('(prefers-reduced-motion:reduce)').matches) {
      el.textContent = eur(+el.dataset.count);
      return;
    }
    const target = +el.dataset.count;
    const dur = 650;
    const start = performance.now();
    const tick = t => {
      const p = Math.min(1, (t-start)/dur);
      const ease = 1 - Math.pow(1-p, 3);
      el.textContent = eur(target * ease);
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
}

/* =====================================================
   DONUT SVG
   Segmentos con stroke-linecap:round, clase .dseg
   para animación CSS de fade en carga
   ===================================================== */
function donut(ents, tot) {
  let off = 0;
  const R = 62, C = 2*Math.PI*R;
  const seg = ents.map(([c, v], i) => {
    const l = v/tot*C;
    // Pequeño gap entre segmentos sustrayendo 6 unidades de arco
    const dash = Math.max(0, l-6);
    const s = `<circle
      cx="85" cy="85" r="${R}" fill="none"
      stroke="${col(c)}" stroke-width="22"
      stroke-linecap="round"
      stroke-dasharray="${dash} ${C-dash}"
      stroke-dashoffset="${-off}"
      class="dseg"
      style="animation-delay:${i*60}ms"/>`;
    off += l;
    return s;
  }).join('');
  return `<svg class="donut-svg" width="170" height="170" viewBox="0 0 170 170">
    <circle cx="85" cy="85" r="${R}" fill="none" stroke="var(--line)" stroke-width="22"/>
    ${seg}
  </svg>`;
}

/* =====================================================
   PESTAÑA INICIO
   ===================================================== */
function home() {
  const a = inM(S.ym), p = inM(S.ym-1);
  const tot = sum(a), ptot = sum(p);
  const cs = byCat(a);
  const dl = ptot ? Math.round((tot-ptot)/ptot*100) : null;
  const per = cards().map(t => ({t, v:sum(a.filter(g=>g.t===t))}));
  const lim = Object.values(S.data.lim).reduce((s,x)=>s+(+x||0), 0);

  // Color y degradado de la barra de presupuesto global
  const usoCol  = tot>lim ? 'var(--over)' : tot>lim*.8 ? 'var(--warn)' : 'var(--ok)';
  const usoGrad = tot>lim
    ? 'linear-gradient(90deg,var(--over-s),var(--over))'
    : tot>lim*.8
      ? 'linear-gradient(90deg,var(--warn-s),var(--warn))'
      : 'linear-gradient(90deg,var(--ok-s),var(--ok))';
  const usoPct = lim ? Math.min(100, tot/lim*100) : 0;

  return `
  <div class="card">
    <h2>Total del mes</h2>
    <div style="display:flex;align-items:baseline;gap:4px;flex-wrap:wrap">
      <span class="total" data-count="${tot}">${eur(tot)}</span>
      ${dl===null ? '' : `<span class="delta ${dl>0?'up':'dn'}">${dl>0?'▲':'▼'} ${Math.abs(dl)}%</span>`}
    </div>
    <div class="sub">${a.length} movimiento${a.length!==1?'s':''}${ptot ? ` · mes anterior ${eur(ptot)}` : ''}</div>
    ${per.length ? `
    <div class="split">
      ${per.map(x=>`<i style="flex:${tot?x.v/tot*100:.1};background:${ccol(x.t)}"></i>`).join('')}
    </div>
    <div class="chips">
      ${per.map(x=>`
      <div class="chip" style="background:${cbgt(x.t)};color:${ccol(x.t)}">
        <small>${esc(x.t).toUpperCase()}</small>
        <b>${eur(x.v)}</b>
      </div>`).join('')}
    </div>` : ''}
  </div>

  ${lim ? `
  <div class="card">
    <h2>Presupuesto global</h2>
    <div class="bud-nums">
      <b style="color:${usoCol}">${eur(tot)}</b>
      <span>de ${eur(lim)} · ${lim-tot>=0
        ? 'quedan <b>'+eur(lim-tot)+'</b>'
        : 'te pasas <b>'+eur(tot-lim)+'</b>'}</span>
    </div>
    <div class="bar-wrap">
      <div class="bar"><i style="width:${usoPct}%;background:${usoGrad}"></i></div>
      <div class="bar-mark" style="left:80%"></div>
    </div>
  </div>` : ''}

  <div class="card">
    <h2>Gasto por categoría</h2>
    ${tot ? `
    <div class="donutw">
      <div class="donut">
        ${donut(cs, tot)}
        <div class="mid">
          <span class="mid-cat">${esc(cs[0][0])}</span>
          <span class="mid-val">${Math.round(cs[0][1]/tot*100)}%</span>
        </div>
      </div>
      <div class="leg">
        ${cs.map(([c,v])=>`
        <div onclick="fc('${esc(c)}')">
          <i class="dot" style="background:${col(c)}"></i>
          <span class="n">${esc(c)}</span>
          <span class="v">${eur(v)}</span>
          <span class="p">${Math.round(v/tot*100)}%</span>
        </div>`).join('')}
      </div>
    </div>` : '<div class="empty">Sin gastos este mes</div>'}
  </div>`;
}
window.fc = c => { S.filt=c; go('mov'); };

/* =====================================================
   PESTAÑA MOVIMIENTOS
   ===================================================== */
function mov() {
  const cats = ['Todas', ...new Set([...S.data.cats, 'Sin categoría'])];
  let a = inM(S.ym).filter(g =>
    (S.filt==='Todas' || g.cat===S.filt) &&
    (!S.q || (g.c+g.cat+g.t).toLowerCase().includes(S.q.toLowerCase()))
  );
  a.sort((x,y) => y.f.localeCompare(x.f) || y.r-x.r);
  const sin = inM(S.ym).filter(g=>g.cat==='Sin categoría').length;

  let h = `
  <div class="card" style="padding:14px">
    <input type="search" placeholder="Buscar comercio…" value="${esc(S.q)}" oninput="sq(this.value)">
    <div class="fchips">
      ${cats.map(c=>`<button class="${S.filt===c?'on':''}" onclick="fc('${esc(c)}')">${esc(c)}</button>`).join('')}
    </div>
    <div class="sub" style="margin-top:2px">
      ${a.length} movimiento${a.length!==1?'s':''} · ${eur(sum(a))}
      ${sin ? ` · <b style="color:var(--warn)">${sin} sin categoría</b>` : ''}
    </div>
  </div>`;

  let last = '';
  a.forEach(g => {
    if (g.f !== last) {
      last = g.f;
      const d = new Date(g.f+'T12:00');
      h += `<div class="day">${d.toLocaleDateString('es-ES',{weekday:'long',day:'numeric',month:'short'})}</div>`;
    }
    // Iniciales de categoría para el avatar
    const ini = g.cat === 'Sin categoría' ? '?' : g.cat.slice(0,2).toUpperCase();
    h += `<button class="mv" onclick="pick(${g.r})">
      <div class="ic" style="background:${cbg(g.cat)};color:${col(g.cat)}">${ini}</div>
      <div class="t">
        <b>${esc(g.c)}</b>
        <small>${esc(g.cat)} · <span style="color:${ccol(g.t)};font-weight:600">${esc(g.t)}</span></small>
      </div>
      <div class="a">${eur(g.i)}</div>
    </button>`;
  });

  return h + (a.length ? '' : '<div class="empty">Nada por aquí</div>');
}

window.sq = v => {
  S.q = v;
  const p = $('input[type=search]'), pos = p.selectionStart;
  render();
  const n = $('input[type=search]');
  n.focus(); n.setSelectionRange(pos, pos);
};

/* Bottom sheet de selección de categoría */
window.pick = r => {
  const g = S.data.gastos.find(x=>x.r===r);
  const cs = [...S.data.cats];
  $('#modal').innerHTML = `
  <div class="sheet" onclick="if(event.target===this)this.remove()">
    <div>
      <div class="sheet-handle"></div>
      <h3>${esc(g.c)}</h3>
      <div class="sub">${eur(g.i)} · ${g.f}${S.demo ? ' · en modo demo no se guarda' : ''}</div>
      <div class="opt">
        ${cs.map(c=>`
        <button onclick="setcat(${r},'${esc(c)}')"
          style="background:${g.cat===c ? col(c) : cbg(c)};color:${g.cat===c ? '#fff' : col(c)}">
          ${esc(c)}
        </button>`).join('')}
      </div>
    </div>
  </div>`;
};

window.setcat = async(r, c) => {
  const g = S.data.gastos.find(x=>x.r===r);
  const old = g.cat;
  g.cat = c;
  $('#modal').innerHTML = '';
  render();
  if (S.demo) return;
  try {
    const res = await fetch(S.cfg.url, {method:'POST', body:JSON.stringify({token:S.cfg.token, accion:'categoria', fila:r, categoria:c})});
    const t = await res.text();
    if (t !== 'ok') throw 0;
    ls.set('cache', JSON.stringify(S.data));
  } catch(e) {
    g.cat = old; render(); alert('No se pudo guardar el cambio');
  }
};

/* =====================================================
   PESTAÑA PRESUPUESTOS
   ===================================================== */
function pres() {
  const a = inM(S.ym), m = Object.fromEntries(byCat(a)), L = S.data.lim;
  const rows = S.data.cats.map(c => ({c, v:m[c]||0, l:+L[c]||0}));

  return `
  <div class="card">
    <h2>Presupuesto por categoría</h2>
    ${rows.map(x => {
      const p = x.l ? x.v/x.l : 0;
      const pct = Math.min(100, p*100);
      let barGrad, msg, msgCol;
      if (!x.l) {
        barGrad = 'var(--line)'; msg = 'Sin límite definido'; msgCol = 'var(--mut)';
      } else if (p > 1) {
        barGrad = 'linear-gradient(90deg,var(--over-s),var(--over))';
        msg = `Te pasas ${eur(x.v-x.l)}`; msgCol = 'var(--over)';
      } else if (p > .8) {
        barGrad = 'linear-gradient(90deg,var(--warn-s),var(--warn))';
        msg = `Te quedan ${eur(x.l-x.v)}`; msgCol = 'var(--warn)';
      } else {
        barGrad = 'linear-gradient(90deg,var(--ok-s),var(--ok))';
        msg = `Te quedan ${eur(x.l-x.v)}`; msgCol = 'var(--ok)';
      }
      return `
      <div class="brow">
        <div class="l">
          <b style="display:flex;align-items:center;gap:7px">
            <i class="dot" style="background:${col(x.c)}"></i>${esc(x.c)}
          </b>
          <span style="font-variant-numeric:tabular-nums">
            ${eur(x.v)}${x.l ? ` <span class="sub">/ ${eur(x.l)}</span>` : ''}
          </span>
        </div>
        <div class="bar-wrap">
          <div class="bar"><i style="width:${pct}%;background:${barGrad}"></i></div>
          ${x.l && p < 1 ? `<div class="bar-mark" style="left:80%"></div>` : ''}
        </div>
        ${x.l ? `<div class="brow-msg" style="color:${msgCol}">${msg}</div>` : ''}
      </div>`;
    }).join('')}
  </div>
  <div class="note">Los límites se editan en la pestaña Presupuestos del Sheet.</div>`;
}

/* =====================================================
   PESTAÑA TENDENCIAS
   ===================================================== */
function tend() {
  const ms = [];
  for (let k = 5; k >= 0; k--) ms.push(S.ym-k);
  const cs = cards();
  const data = ms.map(y => ({y, by:cs.map(t=>sum(inM(y).filter(g=>g.t===t)))}));
  const mx = Math.max(1, ...data.map(d=>d.by.reduce((s,x)=>s+x, 0)));
  const H = 160, W = 100/ms.length;

  // Barras apiladas con esquinas redondeadas
  const bars = data.map((d, i) => {
    let yOff = H;
    const rects = d.by.map((v, j) => {
      const h = v/mx*(H-20);
      yOff -= h;
      // Color intenso del tipo correspondiente
      const fill = ccol(cs[j]);
      return h > 1
        ? `<rect x="${i*W+W*.15}%" y="${yOff}" width="${W*.7}%" height="${Math.max(0,h)}" rx="5" fill="${fill}" opacity="0.88"/>`
        : '';
    }).join('');
    const label = `<text x="${i*W+W/2}%" y="${H+16}" text-anchor="middle" font-size="11" fill="var(--mut)" font-family="Inter,system-ui">${MES[d.y%12].slice(0,3)}</text>`;
    return rects + label;
  }).join('');

  const a = byCat(inM(S.ym)), p = Object.fromEntries(byCat(inM(S.ym-1)));

  return `
  <div class="card">
    <h2>Últimos 6 meses</h2>
    <svg width="100%" height="${H+24}" style="overflow:visible">${bars}</svg>
    <div class="tend-legend">
      ${cs.map(t=>`<span><i class="dot" style="background:${ccol(t)}"></i>${esc(t)}</span>`).join('')}
    </div>
  </div>
  <div class="card">
    <h2>Frente al mes anterior</h2>
    ${a.length ? a.map(([c,v]) => {
      const o = p[c]||0, d = v-o;
      return `
      <div class="brow" style="display:flex;justify-content:space-between;align-items:center">
        <span style="display:flex;align-items:center;gap:7px">
          <i class="dot" style="background:${col(c)}"></i>${esc(c)}
        </span>
        <span style="display:flex;align-items:center;gap:6px">
          <b style="font-variant-numeric:tabular-nums">${eur(v)}</b>
          <span class="delta ${d>0?'up':'dn'}">${d>0?'+':''}${eur(d)}</span>
        </span>
      </div>`;
    }).join('') : '<div class="empty">Sin datos</div>'}
  </div>`;
}

/* =====================================================
   MODAL DE AJUSTES (conexión con el Sheet)
   ===================================================== */
window.cfg = () => {
  $('#modal').innerHTML = `
  <div class="sheet" onclick="if(event.target===this)this.remove()">
    <div>
      <div class="sheet-handle"></div>
      <h3>Conexión con el Sheet</h3>
      <div class="note">URL de la aplicación web de Apps Script y tu clave. Se guardan solo en este dispositivo.</div>
      <input type="text" id="cu" placeholder="https://script.google.com/macros/s/…/exec" value="${esc(S.cfg.url)}">
      <input type="password" id="ct" placeholder="Clave (TOKEN)" value="${esc(S.cfg.token)}">
      <button class="btn" onclick="savecfg()">Guardar y recargar</button>
    </div>
  </div>`;
};

window.savecfg = () => {
  S.cfg.url   = $('#cu').value.trim();
  S.cfg.token = $('#ct').value.trim();
  ls.set('url', S.cfg.url);
  ls.set('token', S.cfg.token);
  $('#modal').innerHTML = '';
  S.err = null;
  load();
};

if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(()=>{});
load();
