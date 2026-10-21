/* =====================================================================
   LE AIR HOCKEY DU COMPLEXE

   Une table au néon, dans le hall, juste à gauche de l'arcade. On y joue
   contre Fonfon (trois niveaux) ou contre un autre joueur en ligne.

   EN LIGNE, UN SEUL DES DEUX CALCULE. Le plus petit identifiant tient la
   table : il fait rouler le palet et envoie l'état trente fois par
   seconde. L'autre n'envoie que la position de son poussoir et dessine
   ce qu'on lui dit. Chacun se voit EN BAS de la table : celui d'en face
   reçoit tout retourné.

   Rien ne s'y gagne ni ne s'y perd : c'est un jeu pour le plaisir, donc
   aucun euro ne transite ici.
   ===================================================================== */
(function(){
'use strict';
const TW=100, TH=170;              /* la table, en unités */
const BUT=34;                      /* largeur des buts */
const RM=7.5, RP=4.6;              /* rayons poussoir / palet */
const VMAX=230, GAGNE=7;
const NIV={facile:{v:85,react:0.28,att:0.45,nom:'Facile'},moyen:{v:135,react:0.16,att:0.7,nom:'Moyen'},
           fort:{v:190,react:0.08,att:0.95,nom:'Fort'}};

let el=null, cv=null, g=null, OPT=null, raf=0, actif=false;
let S=null;                        /* l'état de la partie */
let ECH=1, OX=0, OY=0;             /* passage table -> écran */
let doigt=null;                    /* position visée par le doigt, en unités */
let NET=null;                      /* la partie en ligne */

/* ---------------- le son, synthétisé ---------------- */
let AC=null;
function bip(f,d,vol,type){try{if(!AC)AC=new (window.AudioContext||window.webkitAudioContext)();
  const o=AC.createOscillator(),v=AC.createGain();o.type=type||'square';o.frequency.value=f;
  v.gain.value=vol||0.05;v.gain.exponentialRampToValueAtTime(0.0001,AC.currentTime+(d||0.08));
  o.connect(v);v.connect(AC.destination);o.start();o.stop(AC.currentTime+(d||0.08));}catch(x){}}
const vib=(n)=>{try{navigator.vibrate&&navigator.vibrate(n);}catch(x){}};

/* ---------------- l'habillage ---------------- */
const CSS=`
#ah{position:fixed;inset:0;z-index:20;background:radial-gradient(80% 60% at 50% 40%,#0e1a34,#05070e);
  display:flex;flex-direction:column;font-family:'Baloo 2','Trebuchet MS',system-ui,sans-serif;color:#e8f4ff;
  touch-action:none;-webkit-user-select:none;user-select:none}
#ah[hidden]{display:none}
#ah .hd{flex:none;display:flex;align-items:center;gap:10px;padding:calc(env(safe-area-inset-top,0px) + 10px) 12px 6px}
#ah .sc{flex:1;display:flex;align-items:center;justify-content:center;gap:12px}
#ah .sc .j{display:flex;flex-direction:column;align-items:center;min-width:0;max-width:34vw}
#ah .sc .j small{font:800 11px 'Baloo 2',sans-serif;letter-spacing:1.5px;opacity:.75;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100%}
#ah .sc .j b{font:800 34px 'Baloo 2',sans-serif;line-height:1}
#ah .sc .j.moi b{color:#5ae8ff;text-shadow:0 0 14px rgba(90,232,255,.7)}
#ah .sc .j.lui b{color:#ff5ab0;text-shadow:0 0 14px rgba(255,90,176,.7)}
#ah .sc i{font-style:normal;font:800 18px 'Baloo 2';opacity:.5}
#ah .x{flex:none;width:40px;height:40px;border-radius:12px;border:1px solid rgba(90,232,255,.5);background:rgba(10,20,40,.8);color:#5ae8ff;font:800 17px 'Baloo 2'}
#ah canvas{flex:1;min-height:0;width:100%;display:block}
#ah .ov{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;padding:20px;background:rgba(3,6,14,.72);backdrop-filter:blur(3px)}
#ah .ov[hidden]{display:none}
#ah .bx{width:100%;max-width:360px;text-align:center}
#ah .bx h2{margin:0;font:800 30px 'Baloo 2';letter-spacing:2px;color:#e8f4ff;text-shadow:0 0 12px #5ae8ff,0 0 26px #ff5ab0}
#ah .bx p{margin:4px 0 14px;font:700 14px 'Baloo 2';color:#9ab8d8}
#ah .bx .lb{font:800 11px 'Baloo 2';letter-spacing:2px;color:#7a98b8;margin:12px 0 6px;text-align:left}
#ah .niv{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}
#ah button.b{-webkit-appearance:none;appearance:none;border:1px solid rgba(90,232,255,.4);border-radius:14px;background:rgba(14,28,56,.9);
  color:#e8f4ff;padding:11px 6px;font:800 15px 'Baloo 2';line-height:1.1}
#ah button.b small{display:block;font-size:11px;color:#8ab0d0}
#ah button.b.on{border-color:#5ae8ff;box-shadow:0 0 14px rgba(90,232,255,.4)}
#ah button.go{display:block;width:100%;margin-top:12px;border:0;border-radius:16px;padding:13px;font:800 18px 'Baloo 2';
  color:#06101e;background:linear-gradient(#8af0ff,#3ac8f0);box-shadow:0 4px 0 #1a7a9a}
#ah button.go.rose{background:linear-gradient(#ff9ad0,#ff4aa0);box-shadow:0 4px 0 #9a1a5a;color:#2a0616}
#ah button.go:active{transform:translateY(3px);box-shadow:0 1px 0 #1a7a9a}
#ah .att{display:flex;justify-content:center;gap:6px;margin:16px 0 6px}
#ah .att i{width:10px;height:10px;border-radius:50%;background:#5ae8ff;animation:ahP 1s infinite}
#ah .att i:nth-child(2){animation-delay:.2s}#ah .att i:nth-child(3){animation-delay:.4s}
@keyframes ahP{0%,100%{opacity:.2;transform:scale(.7)}50%{opacity:1;transform:scale(1)}}
#ah .cd{position:absolute;left:0;right:0;top:44%;text-align:center;font:800 80px 'Baloo 2';color:#fff;
  text-shadow:0 0 20px #5ae8ff,0 0 40px #ff5ab0;pointer-events:none}
#ah .cd[hidden]{display:none}
`;

function monter(){
  if(el)return;
  const st=document.createElement('style');st.textContent=CSS;document.head.appendChild(st);
  el=document.createElement('div');el.id='ah';el.hidden=true;
  el.innerHTML='<div class="hd"><div class="sc"><div class="j lui"><small id="ahN2">FONFON</small><b id="ahS2">0</b></div><i>–</i>'+
    '<div class="j moi"><small id="ahN1">TOI</small><b id="ahS1">0</b></div></div><button class="x" id="ahX" aria-label="Quitter">✕</button></div>'+
    '<canvas id="ahCv"></canvas><div class="cd" id="ahCd" hidden></div><div class="ov" id="ahOv"></div>';
  document.body.appendChild(el);
  cv=el.querySelector('#ahCv');g=cv.getContext('2d');
  el.querySelector('#ahX').onclick=()=>{if(S&&S.phase==='jeu'&&!confirmerQuit())return;fermer();};
  const pos=(ev)=>{const r=cv.getBoundingClientRect(),dpr=cv.width/r.width;
    return {x:((ev.clientX-r.left)*dpr-OX)/ECH, y:((ev.clientY-r.top)*dpr-OY)/ECH};};
  cv.addEventListener('pointerdown',ev=>{ev.preventDefault();try{cv.setPointerCapture(ev.pointerId);}catch(x){}doigt=pos(ev);});
  cv.addEventListener('pointermove',ev=>{if(doigt||ev.pointerType==='mouse')doigt=pos(ev);});
  cv.addEventListener('pointerup',()=>{});
  addEventListener('resize',()=>{if(actif)cadrer();});
}
let quitArme=0;
function confirmerQuit(){const t=Date.now();if(t-quitArme<2500)return true;quitArme=t;
  const cd=el.querySelector('#ahCd');cd.style.fontSize='22px';cd.textContent='Touche ✕ encore pour quitter';cd.hidden=false;
  setTimeout(()=>{cd.hidden=true;cd.style.fontSize='';},2200);return false;}

function cadrer(){
  const r=cv.getBoundingClientRect(),dpr=Math.min(2.5,window.devicePixelRatio||1);
  cv.width=Math.round(r.width*dpr);cv.height=Math.round(r.height*dpr);
  const m=14*dpr;
  ECH=Math.min((cv.width-2*m)/TW,(cv.height-2*m)/TH);
  OX=(cv.width-TW*ECH)/2;OY=(cv.height-TH*ECH)/2;
}

/* ---------------- la partie ---------------- */
function nouvelle(mode,niv){
  S={mode:mode,niv:niv||'moyen',s1:0,s2:0,phase:'pret',t:0,
     p:{x:TW/2,y:TH/2,vx:0,vy:0},
     m1:{x:TW/2,y:TH-22,vx:0,vy:0},       /* moi, en bas */
     m2:{x:TW/2,y:22,vx:0,vy:0},          /* l'autre, en haut */
     bot:{tx:TW/2,ty:22,lag:0},tr:[],flash:0,cd:0};
  majScore();
}
function engager(versBas){
  S.p.x=TW/2;S.p.y=TH/2+(versBas?-14:14);S.p.vx=0;S.p.vy=0;S.tr=[];
  S.phase='cd';S.cd=1.6;
}
function majScore(){
  el.querySelector('#ahS1').textContent=S.s1;el.querySelector('#ahS2').textContent=S.s2;
}
function borne(m,bas){
  const y0=bas?TH/2+RM:RM, y1=bas?TH-RM:TH/2-RM;
  m.x=Math.max(RM,Math.min(TW-RM,m.x));m.y=Math.max(y0,Math.min(y1,m.y));
}
function bouger(m,tx,ty,vmax,dt,bas){
  const ox=m.x, oy=m.y;
  const dx=tx-m.x, dy=ty-m.y, d=Math.hypot(dx,dy), pas=vmax*dt;
  if(d>pas){m.x+=dx/d*pas;m.y+=dy/d*pas;}else{m.x=tx;m.y=ty;}
  borne(m,bas);
  m.vx=(m.x-ox)/Math.max(dt,1e-3);m.vy=(m.y-oy)/Math.max(dt,1e-3);
}
function choc(m){
  const p=S.p, dx=p.x-m.x, dy=p.y-m.y, d=Math.hypot(dx,dy), R=RM+RP;
  if(d>=R||d===0)return false;
  const nx=dx/d, ny=dy/d;
  p.x=m.x+nx*R;p.y=m.y+ny*R;
  const rvx=p.vx-m.vx, rvy=p.vy-m.vy, vn=rvx*nx+rvy*ny;
  if(vn<0){p.vx-=1.9*vn*nx;p.vy-=1.9*vn*ny;}
  p.vx+=m.vx*0.35;p.vy+=m.vy*0.35;
  const v=Math.hypot(p.vx,p.vy);if(v>VMAX){p.vx*=VMAX/v;p.vy*=VMAX/v;}
  bip(520+Math.min(400,v*1.5),0.05,0.06);vib(8);
  return true;
}
/* LE PALET : il glisse, rebondit sur les bandes, et entre dans les buts
   s'il passe dans l'ouverture. Sous-pas pour ne jamais traverser. */
function rouler(dt){
  const p=S.p, n=Math.max(1,Math.ceil(Math.hypot(p.vx,p.vy)*dt/2));
  const h=dt/n;
  for(let i=0;i<n;i++){
    p.x+=p.vx*h;p.y+=p.vy*h;
    if(p.x<RP){p.x=RP;p.vx=Math.abs(p.vx)*0.92;bip(300,0.03,0.03);}
    if(p.x>TW-RP){p.x=TW-RP;p.vx=-Math.abs(p.vx)*0.92;bip(300,0.03,0.03);}
    const dansBut=Math.abs(p.x-TW/2)<BUT/2-RP*0.3;
    if(p.y<RP){if(dansBut){if(p.y<-RP)return 'bas';}else{p.y=RP;p.vy=Math.abs(p.vy)*0.92;bip(300,0.03,0.03);}}
    if(p.y>TH-RP){if(dansBut){if(p.y>TH+RP)return 'haut';}else{p.y=TH-RP;p.vy=-Math.abs(p.vy)*0.92;bip(300,0.03,0.03);}}
    choc(S.m1);choc(S.m2);
  }
  const f=Math.exp(-0.32*dt);p.vx*=f;p.vy*=f;
  return null;
}
/* FONFON : il garde son but, puis attaque quand le palet traîne chez lui. */
function bot(dt){
  const N=NIV[S.niv]||NIV.moyen, p=S.p, b=S.bot, m=S.m2;
  b.lag-=dt;
  if(b.lag<=0){b.lag=N.react;
    if(p.y<TH/2+6&&(Math.abs(p.vy)<70||p.vy<0)&&p.y>m.y-2){
      /* attaque : se place derrière le palet, vise le but d'en bas */
      if(Math.random()<N.att){b.tx=p.x+(p.x-TW/2)*0.15;b.ty=p.y-RM*0.6;}
      else{b.tx=p.x;b.ty=Math.max(RM,p.y-RM-RP-3);}
    }else if(p.vy<0){
      /* défense : se met sur la trajectoire */
      const t=(m.y-p.y)/p.vy;let x=p.x+p.vx*Math.max(0,t);
      for(let k=0;k<4;k++){if(x<RP)x=2*RP-x;if(x>TW-RP)x=2*(TW-RP)-x;}
      b.tx=TW/2+(x-TW/2)*0.85;b.ty=20;
    }else{b.tx=TW/2+(p.x-TW/2)*0.35;b.ty=18;}
  }
  bouger(m,b.tx,b.ty,N.v,dt,false);
}
function but(cote){
  if(cote==='haut'){S.s2++;}else{S.s1++;}
  majScore();S.flash=1;S.flashCote=cote;
  bip(cote==='bas'?880:220,0.25,0.08,'sawtooth');vib(cote==='bas'?[30,40,30]:60);
  if(S.s1>=GAGNE||S.s2>=GAGNE){S.phase='fin';fin();return;}
  engager(cote==='bas');
}

/* ---------------- le dessin ---------------- */
function T(x){return OX+x*ECH;}function U(y){return OY+y*ECH;}
function dessiner(){
  g.setTransform(1,0,0,1,0,0);g.clearRect(0,0,cv.width,cv.height);
  const e=ECH;
  /* les bandes */
  g.save();g.shadowColor='#5ae8ff';g.shadowBlur=18;g.fillStyle='#0a1830';
  rr(T(-5),U(-5),(TW+10)*e,(TH+10)*e,14*e/8);g.fill();g.restore();
  g.strokeStyle='#5ae8ff';g.lineWidth=2.4;rr(T(-5),U(-5),(TW+10)*e,(TH+10)*e,14*e/8);g.stroke();
  /* la surface : bleu glacé, trous d'air */
  const sf=g.createLinearGradient(0,U(0),0,U(TH));sf.addColorStop(0,'#cfeeff');sf.addColorStop(.5,'#e8f8ff');sf.addColorStop(1,'#cfeeff');
  g.fillStyle=sf;g.fillRect(T(0),U(0),TW*e,TH*e);
  g.fillStyle='rgba(60,120,170,.18)';
  for(let y=6;y<TH;y+=8)for(let x=6;x<TW;x+=8)g.fillRect(T(x)-0.8,U(y)-0.8,1.6,1.6);
  /* les lignes */
  g.lineWidth=Math.max(1.5,e*0.7);
  g.strokeStyle='rgba(255,60,140,.75)';g.beginPath();g.moveTo(T(0),U(TH/2));g.lineTo(T(TW),U(TH/2));g.stroke();
  g.beginPath();g.arc(T(TW/2),U(TH/2),14*e,0,7);g.stroke();
  g.strokeStyle='rgba(40,140,220,.6)';
  g.beginPath();g.arc(T(TW/2),U(0),22*e,0,Math.PI);g.stroke();
  g.beginPath();g.arc(T(TW/2),U(TH),22*e,Math.PI,0);g.stroke();
  /* les buts */
  g.fillStyle='#04070e';g.fillRect(T(TW/2-BUT/2),U(-5),BUT*e,5*e+1);g.fillRect(T(TW/2-BUT/2),U(TH)-1,BUT*e,5*e+1);
  g.fillStyle='#ff5ab0';g.fillRect(T(TW/2-BUT/2),U(-1.2),BUT*e,1.2*e);
  g.fillStyle='#5ae8ff';g.fillRect(T(TW/2-BUT/2),U(TH),BUT*e,1.2*e);
  /* le logo au centre */
  g.save();g.globalAlpha=.09;g.fillStyle='#1a4a7a';g.font='800 '+(9*e)+'px "Baloo 2",sans-serif';g.textAlign='center';g.textBaseline='middle';
  g.fillText('BATTLE DOCK',T(TW/2),U(TH/2));g.restore();
  /* flash de but */
  if(S.flash>0){g.fillStyle=(S.flashCote==='bas'?'rgba(90,232,255,':'rgba(255,90,176,')+(S.flash*0.35)+')';g.fillRect(T(0),U(0),TW*e,TH*e);}
  /* la traînée du palet */
  for(let i=0;i<S.tr.length;i++){const q=S.tr[i];g.fillStyle='rgba(255,230,80,'+(i/S.tr.length*0.35)+')';g.beginPath();g.arc(T(q.x),U(q.y),RP*e*(0.4+0.6*i/S.tr.length),0,7);g.fill();}
  /* le palet */
  const p=S.p;
  g.save();g.shadowColor='#ffd84a';g.shadowBlur=12;g.fillStyle='#1a1a24';g.beginPath();g.arc(T(p.x),U(p.y),RP*e,0,7);g.fill();g.restore();
  g.strokeStyle='#ffd84a';g.lineWidth=Math.max(1.5,e*0.9);g.beginPath();g.arc(T(p.x),U(p.y),RP*e*0.7,0,7);g.stroke();
  /* les poussoirs */
  pous(S.m2,'#ff5ab0','#8a1050');pous(S.m1,'#5ae8ff','#106a8a');
}
function pous(m,c,o){const e=ECH,x=T(m.x),y=U(m.y);
  g.fillStyle='rgba(0,0,0,.25)';g.beginPath();g.ellipse(x+e,y+e*1.6,RM*e,RM*e*0.9,0,0,7);g.fill();
  g.save();g.shadowColor=c;g.shadowBlur=16;g.fillStyle=o;g.beginPath();g.arc(x,y,RM*e,0,7);g.fill();g.restore();
  const l=g.createRadialGradient(x-RM*e*0.3,y-RM*e*0.3,0,x,y,RM*e);l.addColorStop(0,'#fff');l.addColorStop(.35,c);l.addColorStop(1,o);
  g.fillStyle=l;g.beginPath();g.arc(x,y,RM*e*0.82,0,7);g.fill();
  g.fillStyle=o;g.beginPath();g.arc(x,y,RM*e*0.38,0,7);g.fill();
  g.fillStyle='rgba(255,255,255,.55)';g.beginPath();g.arc(x-RM*e*0.12,y-RM*e*0.14,RM*e*0.16,0,7);g.fill();}
function rr(x,y,w,h,r){g.beginPath();g.moveTo(x+r,y);g.arcTo(x+w,y,x+w,y+h,r);g.arcTo(x+w,y+h,x,y+h,r);g.arcTo(x,y+h,x,y,r);g.arcTo(x,y,x+w,y,r);g.closePath();}

/* ---------------- la boucle ---------------- */
let tPrec=0;
function boucle(t){
  if(!actif)return;
  const dt=Math.min(0.033,(t-tPrec)/1000||0.016);tPrec=t;
  if(S){
    /* mon poussoir suit le doigt, très vite mais pas instantanément */
    if(doigt&&S.phase!=='fin'&&S.phase!=='menu')bouger(S.m1,doigt.x,doigt.y,VMAX*1.6,dt,true);
    else{S.m1.vx=0;S.m1.vy=0;}
    if(S.mode==='bot')pasBot(dt);
    else if(NET)NET.pas(dt);
    S.flash=Math.max(0,S.flash-dt*2.5);
    S.tr.push({x:S.p.x,y:S.p.y});if(S.tr.length>9)S.tr.shift();
    dessiner();
  }
  raf=requestAnimationFrame(boucle);
}
function compteRebours(dt){
  S.cd-=dt;const cd=el.querySelector('#ahCd');
  if(S.cd>0){const n=Math.ceil(S.cd/0.55);cd.hidden=false;cd.textContent=n>2?'3':n>1?'2':'1';}
  else{cd.hidden=true;S.phase='jeu';bip(988,0.12,0.06);}
}
function pasBot(dt){
  if(S.phase==='cd'){compteRebours(dt);bot(dt);return;}
  if(S.phase!=='jeu')return;
  bot(dt);
  const r=rouler(dt);if(r)but(r);
}

/* ---------------- les écrans ---------------- */
let NIV_SEL='moyen';
function menu(){
  const ov=el.querySelector('#ahOv');ov.hidden=false;
  el.querySelector('#ahN2').textContent='FONFON';el.querySelector('#ahN1').textContent='TOI';
  ov.innerHTML='<div class="bx"><h2>AIR HOCKEY</h2><p>Premier à '+GAGNE+' buts. Glisse ton doigt pour pousser.</p>'+
    '<div class="lb">CONTRE FONFON</div><div class="niv">'+
    Object.keys(NIV).map(k=>'<button class="b'+(k===NIV_SEL?' on':'')+'" data-n="'+k+'">'+NIV[k].nom+'</button>').join('')+'</div>'+
    '<button class="go" id="ahBot">Jouer contre Fonfon</button>'+
    '<div class="lb">EN LIGNE</div><button class="go rose" id="ahNet">Chercher un adversaire</button></div>';
  ov.querySelectorAll('[data-n]').forEach(b=>b.onclick=()=>{NIV_SEL=b.dataset.n;menu();});
  ov.querySelector('#ahBot').onclick=()=>{ov.hidden=true;nouvelle('bot',NIV_SEL);engager(true);bip(660,0.1,0.05);};
  ov.querySelector('#ahNet').onclick=()=>chercher();
}
function fin(){
  const ov=el.querySelector('#ahOv'),moi=S.s1>S.s2;
  const nom=S.mode==='bot'?'Fonfon':(NET&&NET.lui||'ton adversaire');
  ov.hidden=false;
  ov.innerHTML='<div class="bx"><h2>'+(moi?'VICTOIRE !':'PERDU…')+'</h2><p>'+S.s1+' – '+S.s2+' contre '+nom+'</p>'+
    (S.mode==='bot'?'<button class="go" id="ahRe">Rejouer · '+NIV[S.niv].nom+'</button>':'<button class="go rose" id="ahRe">Nouvel adversaire</button>')+
    '<button class="go" id="ahMenu" style="background:rgba(14,28,56,.9);color:#e8f4ff;box-shadow:none;border:1px solid rgba(90,232,255,.4)">Menu</button></div>';
  bip(moi?1046:196,0.4,0.07,'triangle');
  if(S.mode!=='bot'&&NET){try{NET.final&&NET.final();}catch(x){}const n=NET;setTimeout(()=>n.quitter(false),600);NET=null;}
  ov.querySelector('#ahRe').onclick=()=>{if(S.mode==='bot'){ov.hidden=true;nouvelle('bot',S.niv);engager(true);}else chercher();};
  ov.querySelector('#ahMenu').onclick=()=>{nouvelle('bot',NIV_SEL);menu();};
}

/* =====================================================================
   EN LIGNE
   Le salon : chacun s'y annonce. Dès que deux joueurs s'y voient, les
   deux plus anciens se prennent, et ouvrent une table rien qu'à eux.
   ===================================================================== */
async function client(){
  if(window.__AH_SB)return window.__AH_SB;
  try{return OPT&&OPT.supa?await OPT.supa():null;}catch(x){return null;}
}
async function chercher(){
  const ov=el.querySelector('#ahOv');ov.hidden=false;
  ov.innerHTML='<div class="bx"><h2>EN LIGNE</h2><p>On cherche un adversaire dans le complexe…</p><div class="att"><i></i><i></i><i></i></div>'+
    '<button class="go" id="ahAn" style="background:rgba(14,28,56,.9);color:#e8f4ff;box-shadow:none;border:1px solid rgba(90,232,255,.4)">Annuler</button></div>';
  ov.querySelector('#ahAn').onclick=()=>{if(NET)NET.quitter(true);NET=null;menu();};
  const sb=await client();
  if(!sb){ov.querySelector('p').textContent='Le salon en ligne ne répond pas. Réessaie dans un instant.';return;}
  if(NET)NET.quitter(true);
  NET=enLigne(sb);
}
function enLigne(sb){
  const moi=String((OPT&&OPT.id)||('anon-'+Math.random().toString(36).slice(2,9)));
  const pseudo=String((OPT&&OPT.pseudo)||'Docker').slice(0,16);
  const N={lui:null,hote:false,ch:null,salon:null,vu:0,envoi:0,fini:false,cible:null,dern:null};
  const t0=Date.now();
  N.salon=sb.channel('ah-salon',{config:{presence:{key:moi}}});
  const apparier=()=>{
    if(N.ch||N.fini)return;
    const st=N.salon.presenceState();
    const tous=Object.keys(st).map(k=>Object.assign({id:k},(st[k]&&st[k][0])||{}));
    /* quelqu'un m'a deja choisi : je le rejoins */
    let a=tous.find(x=>x.occupe&&x.avec===moi);
    if(!a){
      const L=tous.filter(x=>!x.occupe).sort((p,q)=>(p.t-q.t)||(p.id<q.id?-1:1));
      const i=L.findIndex(x=>x.id===moi);if(i<0)return;
      a=L[i%2===0?i+1:i-1];}
    if(!a)return;
    N.lui=a.pseudo||'Docker';N.luiId=a.id;N.hote=moi<a.id;
    table('ah-t-'+(moi<a.id?moi+'-'+a.id:a.id+'-'+moi));
  };
  N.salon.on('presence',{event:'sync'},apparier).subscribe(async(s)=>{
    if(s==='SUBSCRIBED'){try{await N.salon.track({pseudo:pseudo,t:t0});}catch(x){}}});
  function table(nom){
    try{N.salon.track({pseudo:pseudo,t:t0,occupe:true,avec:N.luiId});}catch(x){}
    N.ch=sb.channel(nom,{config:{broadcast:{self:false}}});
    N.ch.on('broadcast',{event:'m'},({payload})=>recu(payload));
    N.ch.subscribe((s)=>{if(s==='SUBSCRIBED'){N.vu=Date.now();envoyer({k:'salut',p:pseudo});}});
    const ov=el.querySelector('#ahOv');const pp=ov.querySelector('p');if(pp)pp.textContent='Adversaire trouvé : '+N.lui+'. On se met en place…';
  }
  function envoyer(o){try{N.ch&&N.ch.send({type:'broadcast',event:'m',payload:o});}catch(x){}}
  function recu(o){
    N.vu=Date.now();
    if(o.k==='salut'){
      if(!N.pret){N.pret=true;envoyer({k:'salut',p:pseudo});demarrer();}
      return;}
    if(o.k==='bye'){if(!N.fini){N.fini=true;partie('Ton adversaire a quitté la table.');}return;}
    if(N.hote&&o.k==='m'){N.cible={x:TW-o.x,y:TH-o.y};return;}
    if(!N.hote&&o.k==='s'){
      /* tout arrive retourné : l'hôte joue en bas chez lui, donc en haut chez nous */
      S.p.x=TW-o.px;S.p.y=TH-o.py;S.p.vx=-o.vx;S.p.vy=-o.vy;
      S.m2.x=TW-o.hx;S.m2.y=TH-o.hy;
      const s1=o.s2,s2=o.s1;if(s1!==S.s1||s2!==S.s2){
        const cote=s1>S.s1?'bas':'haut';S.s1=s1;S.s2=s2;majScore();S.flash=1;S.flashCote=cote;bip(cote==='bas'?880:220,0.25,0.08,'sawtooth');}
      if(o.ph!==S.phase){S.phase=o.ph;if(o.ph==='cd')S.cd=o.cd;if(o.ph==='fin')fin();}
      if(o.ph==='cd')S.cd=o.cd;
      return;}
  }
  function demarrer(){
    el.querySelector('#ahOv').hidden=true;
    nouvelle('net');el.querySelector('#ahN2').textContent=String(N.lui).toUpperCase();el.querySelector('#ahN1').textContent='TOI';
    if(N.hote)engager(Math.random()<0.5);else{S.phase='cd';S.cd=1.6;}
  }
  function partie(msg){
    const ov=el.querySelector('#ahOv');ov.hidden=false;
    ov.innerHTML='<div class="bx"><h2>FIN</h2><p>'+msg+'</p><button class="go rose" id="ahRe">Nouvel adversaire</button>'+
      '<button class="go" id="ahMenu" style="background:rgba(14,28,56,.9);color:#e8f4ff;box-shadow:none;border:1px solid rgba(90,232,255,.4)">Menu</button></div>';
    ov.querySelector('#ahRe').onclick=()=>chercher();ov.querySelector('#ahMenu').onclick=()=>{menu();};
    N.quitter(false);
  }
  N.pas=function(dt){
    if(!N.pret)return;
    if(Date.now()-N.vu>6000&&!N.fini){N.fini=true;partie('La connexion avec ton adversaire est perdue.');return;}
    N.envoi+=dt;
    if(N.hote){
      if(N.cible){const m=S.m2;const ox=m.x,oy=m.y;
        bouger(m,N.cible.x,N.cible.y,VMAX*2,dt,false);}
      if(S.phase==='cd'){compteRebours(dt);}
      else if(S.phase==='jeu'){const r=rouler(dt);if(r)but(r);}
      if(N.envoi>=1/30&&S.phase!=='fin'){N.envoi=0;
        envoyer({k:'s',px:+S.p.x.toFixed(2),py:+S.p.y.toFixed(2),vx:+S.p.vx.toFixed(1),vy:+S.p.vy.toFixed(1),
          hx:+S.m1.x.toFixed(2),hy:+S.m1.y.toFixed(2),s1:S.s1,s2:S.s2,ph:S.phase,cd:+(S.cd||0).toFixed(2)});}
    }else{
      /* l'invité fait glisser le palet entre deux nouvelles de l'hôte */
      if(S.phase==='cd'){S.cd-=dt;const cd=el.querySelector('#ahCd');if(S.cd>0){const n=Math.ceil(S.cd/0.55);cd.hidden=false;cd.textContent=n>2?'3':n>1?'2':'1';}else cd.hidden=true;}
      else{el.querySelector('#ahCd').hidden=true;}
      if(S.phase==='jeu'){S.p.x+=S.p.vx*dt;S.p.y+=S.p.vy*dt;S.p.x=Math.max(RP,Math.min(TW-RP,S.p.x));}
      if(N.envoi>=1/30){N.envoi=0;envoyer({k:'m',x:+S.m1.x.toFixed(2),y:+S.m1.y.toFixed(2)});}
    }
  };
  N.final=function(){if(N.hote)envoyer({k:'s',px:S.p.x,py:S.p.y,vx:0,vy:0,hx:S.m1.x,hy:S.m1.y,s1:S.s1,s2:S.s2,ph:'fin',cd:0});};
  N.quitter=function(prevenir){
    if(prevenir&&N.ch)envoyer({k:'bye'});
    N.fini=true;
    try{N.salon&&N.salon.untrack&&N.salon.untrack();}catch(x){}
    try{N.salon&&sb.removeChannel?sb.removeChannel(N.salon):N.salon.unsubscribe();}catch(x){}
    const c=N.ch;N.ch=null;
    setTimeout(()=>{try{c&&(sb.removeChannel?sb.removeChannel(c):c.unsubscribe());}catch(x){}},300);
    if(NET===N)NET=null;
  };
  return N;
}

/* ---------------- ouvrir / fermer ---------------- */
function ouvrir(opt){
  OPT=opt||{};monter();el.hidden=false;actif=true;cadrer();
  nouvelle('bot',NIV_SEL);menu();doigt=null;
  tPrec=performance.now();cancelAnimationFrame(raf);raf=requestAnimationFrame(boucle);
}
function fermer(){
  if(NET){NET.quitter(true);NET=null;}
  actif=false;cancelAnimationFrame(raf);if(el)el.hidden=true;
  el.querySelector('#ahCd').hidden=true;
  if(OPT&&typeof OPT.fermer==='function')OPT.fermer();
}
window.AirHockey={ouvrir:ouvrir,fermer:fermer,_etat:()=>S};
})();
