'use strict';
const CATCOL={'Supermercado':'#16A34A','Transporte':'#2563EB','Restaurantes':'#F97316','Suscripciones':'#7C3AED','Compras':'#DB2777','Salud':'#DC2626','Ocio':'#0891B2','Hogar':'#CA8A04','Sin categoría':'#94A3B8'};
const CARDCOL=['#2563EB','#0D9488','#7C3AED','#F59E0B'];
const $=s=>document.querySelector(s), eur=n=>new Intl.NumberFormat('es-ES',{style:'currency',currency:'EUR'}).format(n||0);
const MES=['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
const ls={get:k=>{try{return localStorage.getItem(k)}catch(e){return null}},set:(k,v)=>{try{localStorage.setItem(k,v)}catch(e){}}};
const S={tab:'home',data:null,demo:false,ym:null,filt:'Todas',q:'',cfg:{url:ls.get('url')||'',token:ls.get('token')||''}};
const now=new Date();S.ym=now.getFullYear()*12+now.getMonth();
const ymOf=f=>+f.slice(0,4)*12+(+f.slice(5,7)-1);
const col=c=>CATCOL[c]||'#64748B';
const cards=()=>[...new Set(S.data.gastos.map(g=>g.t))];
const ccol=t=>CARDCOL[cards().indexOf(t)%CARDCOL.length];
const inM=ym=>S.data.gastos.filter(g=>ymOf(g.f)===ym);
const sum=a=>a.reduce((s,g)=>s+g.i,0);
const byCat=a=>{const m={};a.forEach(g=>m[g.cat]=(m[g.cat]||0)+g.i);return Object.entries(m).sort((x,y)=>y[1]-x[1])};
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

function demo(){const cats=['Supermercado','Transporte','Restaurantes','Suscripciones','Compras','Salud','Ocio','Hogar'];
 const sh=[['Mercadona','Supermercado',[18,60]],['Carrefour','Supermercado',[20,80]],['Metro','Transporte',[8,25]],['Uber','Transporte',[6,18]],['La Tagliatella','Restaurantes',[20,60]],['Netflix','Suscripciones',[13,13]],['Spotify','Suscripciones',[11,11]],['Zara','Compras',[20,70]],['Farmacia','Salud',[6,30]],['Cine','Ocio',[10,30]],['Ikea','Hogar',[15,90]]];
 let seed=7;const rnd=()=>(seed=seed*16807%2147483647)/2147483647;const g=[];let r=2;
 for(let m=5;m>=0;m--)for(let k=0;k<22;k++){const x=sh[Math.floor(rnd()*sh.length)];const d=new Date(now.getFullYear(),now.getMonth()-m,1+Math.floor(rnd()*27));if(d>now)continue;
  const t=rnd()<.4?'Compartida':(rnd()<.5?'Julene':'Pareja');g.push({r:r++,f:d.toISOString().slice(0,10),c:x[0],i:Math.round((x[2][0]+rnd()*(x[2][1]-x[2][0]))*100)/100,t,cat:x[1]})}
 g.push({r:r++,f:now.toISOString().slice(0,10),c:'Kiosko Pepe',i:4.5,t:'Julene',cat:'Sin categoría'});
 g.sort((a,b)=>b.f.localeCompare(a.f));
 return{gastos:g,cats,lim:{Supermercado:350,Transporte:80,Restaurantes:150,Suscripciones:40,Compras:120,Salud:50,Ocio:80,Hogar:100}}}

async function load(){
 if(!S.cfg.url){S.data=demo();S.demo=true;return render()}
 try{const r=await fetch(S.cfg.url+'?token='+encodeURIComponent(S.cfg.token),{redirect:'follow'});const j=await r.json();
  if(j.error)throw new Error(j.error);S.data=j;S.demo=false;ls.set('cache',JSON.stringify(j))}
 catch(e){const c=ls.get('cache');if(c){S.data=JSON.parse(c);S.demo=false;S.offline=true}else{S.data=demo();S.demo=true;S.err=String(e.message||e)}}
 render()}

function render(){
 if(!S.data)return;
 const v={home:home,mov:mov,pres:pres,tend:tend}[S.tab]();
 const mm=S.ym%12,yy=Math.floor(S.ym/12);
 $('#app').innerHTML=`<header><div class="top"><h1>Gastos</h1><button class="ib" onclick="cfg()">⚙</button></div>
 <div class="month"><button onclick="mv(-1)">‹</button><b>${MES[mm]} ${yy}</b><button onclick="mv(1)">›</button></div></header>
 <main>${S.demo?`<div class="demo">Datos de ejemplo${S.err?' · error: '+esc(S.err):' · conecta tu Sheet en ⚙'}</div>`:''}${S.offline?'<div class="demo">Sin conexión · mostrando los últimos datos guardados</div>':''}${v}</main>`;
 $('#nav').innerHTML=[['home','●','Inicio'],['mov','☰','Movimientos'],['pres','◎','Presupuestos'],['tend','▤','Tendencias']].map(t=>`<button class="${S.tab===t[0]?'on':''}" onclick="go('${t[0]}')"><span>${t[1]}</span>${t[2]}</button>`).join('')}
window.go=t=>{S.tab=t;render();scrollTo(0,0)};
window.mv=d=>{S.ym+=d;render()};

function donut(ents,tot){let off=0;const R=62,C=2*Math.PI*R;
 const seg=ents.map(([c,v])=>{const l=v/tot*C;const s=`<circle cx="85" cy="85" r="${R}" fill="none" stroke="${col(c)}" stroke-width="26" stroke-dasharray="${l} ${C-l}" stroke-dashoffset="${-off}"/>`;off+=l;return s}).join('');
 return`<svg width="170" height="170" viewBox="0 0 170 170"><circle cx="85" cy="85" r="${R}" fill="none" stroke="var(--line)" stroke-width="26"/>${seg}</svg>`}

function home(){
 const a=inM(S.ym),p=inM(S.ym-1),tot=sum(a),ptot=sum(p),cs=byCat(a);
 const dl=ptot?Math.round((tot-ptot)/ptot*100):null;
 const per=cards().map(t=>({t,v:sum(a.filter(g=>g.t===t))}));
 const lim=Object.values(S.data.lim).reduce((s,x)=>s+(+x||0),0);
 return`<div class="card"><h2>Total del mes</h2><div><span class="total">${eur(tot)}</span>${dl===null?'':`<span class="delta ${dl>0?'up':'dn'}">${dl>0?'▲':'▼'} ${Math.abs(dl)}%</span>`}</div>
 <div class="sub">${a.length} movimientos${ptot?` · mes anterior ${eur(ptot)}`:''}</div>
 <div class="split">${per.map(x=>`<i style="width:${tot?x.v/tot*100:0}%;background:${ccol(x.t)}"></i>`).join('')}</div>
 <div class="chips">${per.map(x=>`<div class="chip" style="background:${ccol(x.t)}18;color:${ccol(x.t)}"><small>${esc(x.t).toUpperCase()}</small><b>${eur(x.v)}</b></div>`).join('')}</div></div>
 ${lim?`<div class="card"><h2>Presupuesto</h2><div style="display:flex;justify-content:space-between"><b>${eur(tot)} de ${eur(lim)}</b><span class="sub">${lim-tot>=0?'quedan '+eur(lim-tot):'te pasas '+eur(tot-lim)}</span></div><div class="bar" style="margin-top:8px"><i style="width:${Math.min(100,tot/lim*100)}%;background:${tot>lim?'#DC2626':tot>lim*.8?'#F59E0B':'#16A34A'}"></i></div></div>`:''}
 <div class="card"><h2>Gasto por categoría</h2>${tot?`<div class="donutw"><div class="donut">${donut(cs,tot)}<div class="mid"><span class="sub">${esc(cs[0][0])}</span><b>${Math.round(cs[0][1]/tot*100)}%</b></div></div>
 <div class="leg">${cs.map(([c,v])=>`<div onclick="fc('${esc(c)}')"><i class="dot" style="background:${col(c)}"></i><span class="n">${esc(c)}</span><span class="v">${eur(v)}</span><span class="p">${Math.round(v/tot*100)}%</span></div>`).join('')}</div></div>`:'<div class="empty">Sin gastos este mes</div>'}</div>`}
window.fc=c=>{S.filt=c;go('mov')};

function mov(){
 const cats=['Todas',...new Set([...S.data.cats,'Sin categoría'])];
 let a=inM(S.ym).filter(g=>(S.filt==='Todas'||g.cat===S.filt)&&(!S.q||(g.c+g.cat+g.t).toLowerCase().includes(S.q.toLowerCase())));
 a.sort((x,y)=>y.f.localeCompare(x.f)||y.r-x.r);
 const sin=inM(S.ym).filter(g=>g.cat==='Sin categoría').length;
 let h=`<div class="card" style="padding:12px"><input type="search" placeholder="Buscar comercio…" value="${esc(S.q)}" oninput="sq(this.value)"><div class="fchips">${cats.map(c=>`<button class="${S.filt===c?'on':''}" onclick="fc('${esc(c)}')">${esc(c)}</button>`).join('')}</div>
 <div class="sub">${a.length} movimientos · ${eur(sum(a))}${sin?` · <b style="color:#B45309">${sin} sin categoría</b>`:''}</div></div>`;
 let last='';a.forEach(g=>{if(g.f!==last){last=g.f;const d=new Date(g.f+'T12:00');h+=`<div class="day">${d.toLocaleDateString('es-ES',{weekday:'long',day:'numeric',month:'short'})}</div>`}
  h+=`<button class="mv" onclick="pick(${g.r})"><div class="ic" style="background:${col(g.cat)}22;color:${col(g.cat)}">${esc(g.cat.slice(0,2)).toUpperCase()}</div><div class="t"><b>${esc(g.c)}</b><small>${esc(g.cat)} · <span style="color:${ccol(g.t)}">${esc(g.t)}</span></small></div><div class="a">${eur(g.i)}</div></button>`});
 return h+(a.length?'':'<div class="empty">Nada por aquí</div>')}
window.sq=v=>{S.q=v;const p=$('input[type=search]'),pos=p.selectionStart;render();const n=$('input[type=search]');n.focus();n.setSelectionRange(pos,pos)};
window.pick=r=>{const g=S.data.gastos.find(x=>x.r===r);const cs=[...S.data.cats];
 $('#modal').innerHTML=`<div class="sheet" onclick="if(event.target===this)this.remove()"><div><h3>${esc(g.c)} · ${eur(g.i)}</h3><div class="sub">Elige la categoría${S.demo?' (en modo demo no se guarda)':''}</div>
 <div class="opt">${cs.map(c=>`<button onclick="setcat(${r},'${esc(c)}')" style="background:${col(c)}${g.cat===c?'':'22'};color:${g.cat===c?'#fff':col(c)}">${esc(c)}</button>`).join('')}</div></div></div>`};
window.setcat=async(r,c)=>{const g=S.data.gastos.find(x=>x.r===r);const old=g.cat;g.cat=c;$('#modal').innerHTML='';render();
 if(S.demo)return;
 try{const res=await fetch(S.cfg.url,{method:'POST',body:JSON.stringify({token:S.cfg.token,accion:'categoria',fila:r,categoria:c})});const t=await res.text();if(t!=='ok')throw 0;ls.set('cache',JSON.stringify(S.data))}
 catch(e){g.cat=old;render();alert('No se pudo guardar el cambio')}};

function pres(){
 const a=inM(S.ym),m=Object.fromEntries(byCat(a)),L=S.data.lim;
 const rows=S.data.cats.map(c=>({c,v:m[c]||0,l:+L[c]||0}));
 return`<div class="card"><h2>Presupuesto por categoría</h2>${rows.map(x=>{const p=x.l?x.v/x.l:0,k=!x.l?'#94A3B8':p>1?'#DC2626':p>.8?'#F59E0B':'#16A34A';
  return`<div class="brow"><div class="l"><b><i class="dot" style="display:inline-block;background:${col(x.c)};margin-right:6px"></i>${esc(x.c)}</b><span>${eur(x.v)}${x.l?` <span class="sub">/ ${eur(x.l)}</span>`:''}</span></div>
  <div class="bar"><i style="width:${Math.min(100,p*100)}%;background:${k}"></i></div>${x.l&&p>1?`<div class="sub" style="color:#DC2626;margin-top:4px">Te pasas ${eur(x.v-x.l)}</div>`:''}</div>`}).join('')}</div>
 <div class="note">Los límites se editan en la pestaña Presupuestos del Sheet.</div>`}

function tend(){
 const ms=[];for(let k=5;k>=0;k--)ms.push(S.ym-k);const cs=cards();
 const data=ms.map(y=>({y,by:cs.map(t=>sum(inM(y).filter(g=>g.t===t)))}));
 const mx=Math.max(1,...data.map(d=>d.by.reduce((s,x)=>s+x,0)));const H=170,W=100/ms.length;
 const bars=data.map((d,i)=>{let y=H;return d.by.map((v,j)=>{const h=v/mx*(H-20);y-=h;return`<rect x="${i*W+W*.18}%" y="${y}" width="${W*.64}%" height="${Math.max(0,h)}" rx="3" fill="${CARDCOL[j%4]}"/>`}).join('')+`<text x="${i*W+W/2}%" y="${H+16}" text-anchor="middle" font-size="11" fill="var(--mut)">${MES[d.y%12].slice(0,3)}</text>`}).join('');
 const a=byCat(inM(S.ym)),p=Object.fromEntries(byCat(inM(S.ym-1)));
 return`<div class="card"><h2>Últimos 6 meses</h2><svg width="100%" height="${H+24}">${bars}</svg>
 <div class="chips" style="margin-top:4px">${cs.map((t,j)=>`<span class="sub"><i class="dot" style="display:inline-block;background:${CARDCOL[j%4]};margin-right:5px"></i>${esc(t)}</span>`).join('')}</div></div>
 <div class="card"><h2>Frente al mes anterior</h2>${a.length?a.map(([c,v])=>{const o=p[c]||0,d=v-o;return`<div class="brow" style="display:flex;justify-content:space-between"><span><i class="dot" style="display:inline-block;background:${col(c)};margin-right:6px"></i>${esc(c)}</span><span><b>${eur(v)}</b> <span class="delta ${d>0?'up':'dn'}">${d>0?'+':''}${eur(d)}</span></span></div>`}).join(''):'<div class="empty">Sin datos</div>'}</div>`}

window.cfg=()=>{$('#modal').innerHTML=`<div class="sheet" onclick="if(event.target===this)this.remove()"><div><h3>Conexión con el Sheet</h3>
 <div class="note">URL de la aplicación web de Apps Script y tu clave. Se guardan solo en este móvil.</div>
 <input type="text" id="cu" placeholder="https://script.google.com/macros/s/…/exec" value="${esc(S.cfg.url)}"><input type="password" id="ct" placeholder="Clave (TOKEN)" value="${esc(S.cfg.token)}">
 <button class="btn" onclick="savecfg()">Guardar y recargar</button></div></div>`};
window.savecfg=()=>{S.cfg.url=$('#cu').value.trim();S.cfg.token=$('#ct').value.trim();ls.set('url',S.cfg.url);ls.set('token',S.cfg.token);$('#modal').innerHTML='';S.err=null;load()};
if('serviceWorker'in navigator)navigator.serviceWorker.register('sw.js').catch(()=>{});
load();
