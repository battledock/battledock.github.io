/* =====================================================================
   LE TERMINAL CROISIÈRES — le premier travail de docker occasionnel
   (croisiere.html). Le paquebot est à quai, les passagers descendent,
   leurs valises arrivent sur le tapis. Le docker prend une valise et la
   porte au bon car : l'étiquette dit lequel (rouge, bleu, jaune).
   Une vacation dure 90 secondes. Les malles pèsent lourd mais paient mieux.
   La paie est versée par le serveur (bagages_debut / bagages_fin).
   Chargé par moteur.js (eval direct). Ne touche à rien d'autre.
   ===================================================================== */
(()=>{
const W=800, H=800, NAV=286, QUAI=312, TAPIS_Y=430, TX0=236, TX1=564;
const DEPART=(()=>{try{if(new URLSearchParams(location.search).get('de')==='travail')return [24,520];}catch(x){}return [404,392];})();
const DUREE=90;
const hA=(x,y,k)=>{let n=((x*73856093)^(y*19349663)^(k*83492791))|0;n=(n^(n>>>13))*1274126177|0;return((n^(n>>>16))>>>0)/4294967296;};
const tn=(hex,d)=>{const v=parseInt(hex.slice(1),16);const c=k=>Math.max(0,Math.min(255,((v>>k)&255)+d));return 'rgb('+c(16)+','+c(8)+','+c(0)+')';};
function toile(L,HH){const D=2,c=document.createElement('canvas');c.width=Math.ceil(L*D);c.height=Math.ceil(HH*D);const g=c.getContext('2d');g.setTransform(D,0,0,D,0,0);g.imageSmoothingEnabled=false;
  const R=(x,y,w,h,col)=>{if(w<=0||h<=0)return;g.fillStyle=col;g.fillRect(Math.round(x*2)/2,Math.round(y*2)/2,Math.max(.5,Math.round(w*2)/2),Math.max(.5,Math.round(h*2)/2));};return {c,g,R};}
const vib=x=>{try{vibrer(x);}catch(_){}};
function mot(t,c){let m=document.getElementById('bagMot');if(!m){m=document.createElement('div');m.id='bagMot';m.style.cssText="position:fixed;left:50%;top:24%;transform:translateX(-50%);z-index:2147482000;background:#2a2016;color:#fff;font:800 16px 'Baloo 2',system-ui,sans-serif;padding:9px 16px;border-radius:14px;box-shadow:0 4px 0 #000;transition:opacity .3s;pointer-events:none;white-space:nowrap";document.body.appendChild(m);}
  m.textContent=t;m.style.background=c||'#2a2016';m.style.opacity='1';clearTimeout(mot.t);mot.t=setTimeout(()=>m.style.opacity='0',1600);}

/* les trois cars, leur couleur d'étiquette et leur destination */
const CARS=[{c:'#d8402a',n:'AIX',x:150},{c:'#2a6ab8',n:'CALANQUES',x:400},{c:'#f2b830',n:'AVIGNON',x:650}];
const CAR_Y=716;

/* ---------- LE SOL ---------- */
function sol(){const c=document.createElement('canvas');c.width=W;c.height=H;const g=c.getContext('2d');g.fillStyle='#cfc8b8';g.fillRect(0,0,W,H);g.fillStyle='#24607e';g.fillRect(0,NAV,W,QUAI-NAV);return c;}
function solFin(){const S=2,c=document.createElement('canvas');c.width=W*S;c.height=H*S;const g=c.getContext('2d');g.setTransform(S,0,0,S,0,0);const R=(x,y,w,h,col)=>{g.fillStyle=col;g.fillRect(x,y,w,h);};
  R(0,0,W,NAV,'#2a6a8a');
  for(let y=NAV;y<QUAI;y++){R(0,y,W,1,'rgb('+(36+(y-NAV))+','+(96+(y-NAV))+','+(126+(y-NAV))+')');}
  for(let i=0;i<300;i++)R(hA(i,1,3)*W,NAV+hA(i,2,3)*(QUAI-NAV),3+hA(i,3,3)*6,.5,'rgba(255,255,255,.14)');
  /* le quai : béton clair, joints, et les bandes jaunes de sécurité */
  R(0,QUAI,W,H-QUAI,'#bdb5a4');
  for(let y=QUAI;y<H;y+=24)for(let x=-((y/24|0)%2)*30;x<W;x+=60)R(x+.5,y+.5,59,23,['#cdc6b6','#c8c1b0','#d2cbbb','#c4bdac'][(hA(x,y,4)*4)|0]);
  for(let i=0;i<2600;i++)R(hA(i,4,5)*W,QUAI+hA(i,5,5)*(H-QUAI),1,1,hA(i,6,5)<.5?'rgba(255,255,255,.25)':'rgba(60,50,40,.10)');
  R(0,QUAI,W,6,'#e8e2d4');R(0,QUAI+6,W,1,'#8a8270');
  for(let x=0;x<W;x+=16){R(x,QUAI+10,8,4,'#f2c230');R(x+8,QUAI+10,8,4,'#2a2a2a');}
  /* le passage des piétons, de la passerelle aux cars */
  for(let y=470;y<CAR_Y-40;y+=14)for(const cx of [150,400,650])R(cx-16,y,32,7,'rgba(255,255,255,.55)');
  /* les emplacements des cars, peints au sol */
  for(const C of CARS){R(C.x-66,CAR_Y-30,132,2,'#f6f1e6');R(C.x-66,CAR_Y+16,132,2,'#f6f1e6');R(C.x-66,CAR_Y-30,2,48,'#f6f1e6');R(C.x+64,CAR_Y-30,2,48,'#f6f1e6');}
  return c;}

/* ---------- LE PAQUEBOT ---------- */
function graverPaquebot(){const L=W,HH=NAV+4,{c,g,R}=toile(L,HH),s=NAV;
  const gr=g.createLinearGradient(0,0,0,60);gr.addColorStop(0,'#86c0e8');gr.addColorStop(1,'#d2e8f6');g.fillStyle=gr;g.fillRect(0,0,L,60);
  const X0=-30,X1=L+30;
  /* la coque : blanche, la ligne de flottaison bleue, la bande rouge */
  R(X0,170,X1-X0,s-170,'#f4f6f8');R(X0,s-24,X1-X0,24,'#1f3a6a');R(X0,s-28,X1-X0,4,'#c8302a');R(X0,s-6,X1-X0,6,'#7a2a2a');
  for(let x=X0+20;x<X1;x+=14)R(x,200,6,5,'#2a3a4a');
  for(let x=X0+30;x<X1;x+=30)R(x,230,14,10,'#2a3a4a');
  g.fillStyle='#1f3a6a';g.font='bold 18px "Helvetica Neue",Arial,sans-serif';g.textAlign='left';g.textBaseline='middle';g.fillText('PRINCESSE DU MISTRAL',40,252);
  g.font='bold 9px "Helvetica Neue",Arial,sans-serif';g.fillText('MARSEILLE',44,268);
  /* les ponts : des rangées de balcons qui reculent un peu */
  const ponts=[[150,20],[128,20],[106,20],[84,20],[62,20]];
  ponts.forEach(([y,h],i)=>{const m=i*14;R(X0+m,y,X1-X0-2*m,h,'#fafbfc');R(X0+m,y+h-2,X1-X0-2*m,2,'#c8d0d8');
    for(let x=X0+m+6;x<X1-m-6;x+=12){R(x,y+3,10,11,i%2?'#3a5a7a':'#2a4a6a');R(x,y+3,10,2,'rgba(255,255,255,.25)');R(x,y+13,10,1.2,'#9aa4ae');for(let b=x;b<x+10;b+=2)R(b,y+14,.5,4,'#b8c0c8');}});
  /* les canots de sauvetage, orange */
  for(let x=X0+60;x<X1-40;x+=70){R(x,160,40,9,'#f28a1a');R(x,160,40,2,'#ffb050');R(x+2,169,36,2,'#b85a10');R(x+18,154,4,6,'#9aa4ae');}
  /* la cheminée et le haut */
  R(L/2-200,40,400,22,'#fafbfc');for(let x=L/2-196;x<L/2+196;x+=12)R(x,44,10,10,'#2a4a6a');
  R(L/2+120,6,60,40,'#f4f6f8');R(L/2+120,6,60,10,'#1f3a6a');R(L/2+120,16,60,4,'#c8302a');R(L/2+130,-4,40,10,'#2a2a2a');
  R(L/2-260,30,10,32,'#c8d0d8');R(L/2-262,26,14,4,'#9aa4ae');
  return {toile:c,W:L,H:HH,sol:s};}
function graverPasserelle(){const L=50,HH=70,{c,g,R}=toile(L,HH),cx=L/2,s=HH-2;
  g.fillStyle='rgba(30,30,30,.25)';g.fillRect(cx-12,s-6,30,6);
  R(cx-11,0,22,s,'#9aa4ae');R(cx-9,0,18,s,'#c8d0d8');for(let y=2;y<s;y+=5)R(cx-9,y,18,1.2,'#a8b0b8');
  R(cx-12,0,1.5,s,'#5a6670');R(cx+10.5,0,1.5,s,'#5a6670');for(let y=4;y<s;y+=8){R(cx-13,y,1,6,'#5a6670');R(cx+12,y,1,6,'#5a6670');}
  R(cx-16,0,32,6,'#1f3a6a');g.fillStyle='#fff';g.font='bold 4px "Helvetica Neue",Arial,sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText('BIENVENUE',cx,3.2);
  return {toile:c,W:L,H:HH,sol:s};}

/* ---------- LE TAPIS À BAGAGES ---------- */
function graverTapis(){const L=TX1-TX0+40,HH=40,{c,g,R}=toile(L,HH),s=HH-8;
  g.fillStyle='rgba(30,26,18,.25)';g.fillRect(6,s-2,L-8,8);
  R(10,s-16,L-20,16,'#5a6470');R(10,s-16,L-20,2,'#8a96a2');R(14,s-13,L-28,10,'#2a2e34');
  for(const x of [16,L/2,L-22])R(x,s-4,4,8,'#3a4048');
  R(0,s-24,24,24,'#3a5a7a');R(2,s-22,20,10,'#1f2a34');for(let k=0;k<5;k++)R(4+k*4,s-22,1.5,10,'#5a6a7a');
  g.fillStyle='#f2c230';g.fillRect(L-30,s-24,26,8);g.fillStyle='#2a2016';g.font='bold 4.4px "Helvetica Neue",Arial,sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText('BAGAGES',L-17,s-19.6);
  return {toile:c,W:L,H:HH,sol:s};}
let TAP_OFF=0;
function dessinerBandes(g,cx,cy){const y=TAPIS_Y-21-cy;for(let x=TX0+16;x<TX1+10;x+=8){const xx=x+(TAP_OFF%8);if(xx>TX1+12)continue;g.fillStyle='rgba(255,255,255,.08)';g.fillRect(xx-cx,y,3,10);}}

/* ---------- LES CARS ---------- */
function graverCar(i){const C=CARS[i],L=140,HH=60,{c,g,R}=toile(L,HH),cx=L/2,s=HH-6;
  g.fillStyle='rgba(30,26,18,.28)';g.beginPath();g.ellipse(cx+4,s,66,7,0,0,7);g.fill();
  R(6,10,L-12,s-14,'#f6f6f2');R(6,10,L-12,3,'#ffffff');R(6,s-8,L-12,4,C.c);R(6,22,L-12,2,C.c);
  for(let x=14;x<L-26;x+=17){R(x,13,14,9,'#2a3a4a');R(x,13,14,2,'rgba(255,255,255,.3)');}
  R(L-24,13,14,22,'#2a3a4a');R(L-23,14,4,20,'rgba(255,255,255,.2)');
  R(10,30,24,14,tn(C.c,-10));g.fillStyle=tn(C.c,-50);g.font='bold 9px "Helvetica Neue",Arial,sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText(C.n,L/2,36);
  for(const x of [26,L-30]){g.fillStyle='#1a1a1a';g.beginPath();g.arc(x,s-4,6,0,7);g.fill();g.fillStyle='#8a8a8a';g.beginPath();g.arc(x,s-4,2.5,0,7);g.fill();}
  R(4,6,L-8,5,'#d8dce0');R(L-16,4,8,3,'#f2c230');
  /* la soute ouverte, où l'on charge */
  R(48,s-20,36,13,'#2a2a2a');R(48,s-23,36,3,'#c8ccd0');
  return {toile:c,W:L,H:HH,sol:s};}
function graverBarriere(){const L=40,HH=14,{c,g,R}=toile(L,HH),s=HH-2;R(2,s-8,36,3,'#f2c230');for(let x=2;x<38;x+=8)R(x,s-8,4,3,'#2a2a2a');R(4,s-5,2,5,'#6a6a6a');R(34,s-5,2,5,'#6a6a6a');return {toile:c,W:L,H:HH,sol:s};}
function graverBitte(){const L=10,HH=10,{c,g,R}=toile(L,HH),cx=5,s=8;R(cx-2.5,s-6,5,6,'#2a2e34');R(cx-3.5,s-7,7,2,'#3a4048');return {toile:c,W:L,H:HH,sol:s};}
function graverVide(){const c=document.createElement('canvas');c.width=2;c.height=2;return {toile:c,W:1,H:1,sol:0};}
const GRAVEURS={x_jol_paquebot:graverPaquebot,x_jol_passerelle:graverPasserelle,x_jol_tapis:graverTapis,x_jol_car0:()=>graverCar(0),x_jol_car1:()=>graverCar(1),x_jol_car2:()=>graverCar(2),x_jol_barriere:graverBarriere,x_jol_bitte:graverBitte,x_jol_entree:graverVide};
function graver(t,v){return (GRAVEURS[t]||graverVide)(v||0);}

/* ---------- LES VALISES ---------- */
const TEINTES=['#2a2e34','#8a2a3a','#2a5a4a','#c8c0b0','#4a3a6a','#e86aa0','#3a6ab8'];
const SPR={};
function valiseCanvas(b){const k=b.lourd+'|'+b.t+'|'+b.c;if(SPR[k])return SPR[k];const L=b.lourd?22:14,HH=b.lourd?16:16,{c,g,R}=toile(L,HH);
  if(b.lourd){R(1,4,20,11,'#7a4a2a');R(1,4,20,2,'#9a6a3a');R(1,8.5,20,1.2,'#3a2a1a');for(const x of [3,17])R(x,4,2,11,'#c8a050');R(9,7,4,3,'#c8a050');R(0,14,22,1.5,'rgba(0,0,0,.25)');}
  else{const t=TEINTES[b.t];R(6,0,2,3,'#2a2a2a');R(5,0,4,1,'#2a2a2a');R(1,3,12,12,t);R(1,3,12,1.5,tn(t,40));for(const x of [4,8])R(x,4,.6,10,tn(t,-30));R(1,14,12,1.5,'rgba(0,0,0,.3)');}
  /* l'étiquette de couleur, bien visible */
  R(b.lourd?14:9,b.lourd?2:2,5,4,b.c);R(b.lourd?14:9,b.lourd?2:2,5,1,'#ffffff');
  return SPR[k]={c,L,HH};}

/* ---------- LA VACATION ---------- */
const J={etat:'attente',t0:0,belt:[],main:null,livres:0,malles:0,combo:0,best:0,tombes:0,erreurs:0,prochaine:0,vac:null,fin:null};
const CHEF={x:366,y:388};
function hud(){let d=document.getElementById('bagHud');
  if(J.etat!=='jeu'){if(d)d.remove();return;}
  if(!d){d=document.createElement('div');d.id='bagHud';d.style.cssText="position:fixed;left:50%;top:calc(env(safe-area-inset-top,0px) + 58px);transform:translateX(-50%);z-index:2147481000;display:flex;gap:6px;pointer-events:none;font-family:'Baloo 2',system-ui,sans-serif";document.body.appendChild(d);}
  const r=Math.max(0,DUREE-(performance.now()-J.t0)/1000),urg=r<10;
  const pil=(t,b)=>'<div style="background:'+(b||'#2a2016')+';color:#fff;border-radius:12px;padding:5px 10px;font:900 15px \'Baloo 2\',system-ui,sans-serif;box-shadow:0 3px 0 rgba(0,0,0,.4)">'+t+'</div>';
  d.innerHTML=pil('⏱ '+Math.ceil(r)+' s',urg?'#d8402a':null)+pil('🧳 '+J.livres)+(J.combo>1?pil('×'+J.combo,'#f2a020'):'')+(J.main?pil('→ '+CARS[J.main.car].n,J.main.c):'');}
function commencer(){if(J.etat==='jeu')return;
  if(J.etat==='fin'){mot('Une vacation à la fois !');return;}
  Object.assign(J,{etat:'jeu',t0:performance.now(),belt:[],main:null,livres:0,malles:0,combo:0,best:0,tombes:0,erreurs:0,prochaine:performance.now()+600,vac:null});
  vib([10,40,10]);mot('C’est parti ! Les valises arrivent !','#2a6a8a');
  serveur('bagages_debut',{}).then(r=>{if(r&&r.vacation)J.vac=r.vacation;else J.sansPaie=(r&&r.erreur)||'hors ligne';});}
function prendre(){if(J.etat!=='jeu'){mot('Parle d’abord au chef d’équipe');return;}
  if(J.main){mot('Tu as déjà les mains pleines !');return;}
  let best=null,d=1e9;for(const b of J.belt){const dd=Math.abs(b.x-joueur.x);if(dd<d){d=dd;best=b;}}
  if(!best||d>60){mot('Pas de valise par ici…');return;}
  J.belt.splice(J.belt.indexOf(best),1);J.main=best;vib(best.lourd?[20,30,20]:12);
  try{texteVolant(joueur.x,joueur.y-44,best.lourd?'Oh hisse ! Une malle !':'Hop !',best.lourd?'#f2c94c':'#ffffff');}catch(x){}}
function charger(i){if(J.etat!=='jeu'){mot('Le car attend ses passagers');return;}
  if(!J.main){mot('Va chercher une valise au tapis');return;}
  if(J.main.car!==i){J.combo=0;J.erreurs++;vib([30,40,30]);mot('Mauvais car ! Regarde l’étiquette','#d8402a');
    try{texteVolant(CARS[i].x,CAR_Y-60,ALEA(['Mais c’est pas ma valise !','Je vais pas à '+CARS[J.main.car].n+', moi !','Hé, oh !']),'#ffb0a0');}catch(x){}return;}
  const b=J.main;J.main=null;J.livres++;if(b.lourd)J.malles++;J.combo++;J.best=Math.max(J.best,J.combo);vib(14);
  const pb=b.lourd?3.8:1.2,tip=Math.min(J.combo,10)*.2;
  try{texteVolant(CARS[i].x,CAR_Y-60,'+'+(pb+tip).toFixed(2).replace('.',',')+' €'+(J.combo>2?'  ×'+J.combo:''),'#7ae08a');}catch(x){}
  if(J.combo===5||J.combo===10)mot(J.combo===10?'Dix d’affilée ! Le chef est bluffé !':'Cinq d’affilée ! Pourboires en hausse !','#2a8a4a');}
const ALEA=L=>L[(Math.random()*L.length)|0];
function nouvelleValise(){const car=(Math.random()*3)|0,lourd=Math.random()<.16?1:0;J.belt.push({x:TX0+18,car,c:CARS[car].c,lourd,t:(Math.random()*TEINTES.length)|0,id:Math.random()});}
function finir(){J.etat='fin';hud();J.main=null;
  const euros=J.livres*1.2+J.malles*2.6+Math.min(J.best,10)*.2*J.livres/3;
  const fin={livres:J.livres,malles:J.malles,best:J.best,tombes:J.tombes,erreurs:J.erreurs};
  carteFin(fin,null);
  if(J.vac)serveur('bagages_fin',{p_vac:J.vac,p_valises:J.livres,p_malles:J.malles,p_combo:J.best}).then(r=>carteFin(fin,r||{erreur:'hors ligne'}));
  else carteFin(fin,{erreur:J.sansPaie||'hors ligne'});}
async function serveur(nom,args){try{const h=await entetesSauv();const r=await fetch(URL_SB+'/rest/v1/rpc/'+nom,{method:'POST',headers:Object.assign({'Content-Type':'application/json'},h),body:JSON.stringify(args)});
  const t=await r.text();if(!r.ok)return {erreur:'serveur '+r.status};return JSON.parse(t);}catch(x){return {erreur:'hors ligne'};}}
const CSS_FIN=`#bagFin{position:fixed;inset:0;z-index:2147482100;display:flex;align-items:flex-end;justify-content:center;background:rgba(20,26,40,.4);font-family:'Baloo 2',system-ui,sans-serif;-webkit-tap-highlight-color:transparent}
#bagFin *{box-sizing:border-box}#bagFin *::after{content:none!important;display:none!important}
#bagFin .c{width:min(420px,100%);background:#f6f1e6;border-radius:26px 26px 0 0;padding:20px 20px calc(16px + env(safe-area-inset-bottom));animation:bagUp .4s cubic-bezier(.2,1,.3,1)}@keyframes bagUp{from{transform:translateY(100%)}}
#bagFin small{font:800 11px 'Baloo 2',system-ui,sans-serif;letter-spacing:2px;color:#8a7a5a}#bagFin h2{margin:0 0 10px;font:900 26px/1.05 'Baloo 2',system-ui,sans-serif;color:#2a2016}
#bagFin .g{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:10px}#bagFin .g div{background:#fff;border-radius:14px;padding:8px;text-align:center;box-shadow:0 3px 0 #ddd3c0;font:700 12px 'Baloo 2',system-ui,sans-serif;color:#8a7a5a}
#bagFin .g b{display:block;font:900 22px/1.1 'Baloo 2',system-ui,sans-serif;color:#2a2016}
#bagFin .paie{background:#2a2016;color:#fff;border-radius:16px;padding:12px;text-align:center;font:800 14px 'Baloo 2',system-ui,sans-serif;margin-bottom:10px}#bagFin .paie big{display:block;font:900 30px/1.1 'Baloo 2',system-ui,sans-serif;color:#f2c94c}
#bagFin button{width:100%;border:0;border-radius:18px;padding:14px;font:800 17px 'Baloo 2',system-ui,sans-serif;margin-top:8px}#bagFin .b1{background:linear-gradient(#ffe68a,#f2b030);color:#2a2016;box-shadow:0 4px 0 #a86a10}#bagFin .b2{background:#fff;color:#2a2016;box-shadow:0 4px 0 #ddd3c0}`;
function carteFin(f,r){let d=document.getElementById('bagFin');
  if(!document.getElementById('bagFinCss')){const s=document.createElement('style');s.id='bagFinCss';s.textContent=CSS_FIN;document.head.appendChild(s);}
  if(!d){d=document.createElement('div');d.id='bagFin';document.body.appendChild(d);window.ECRAN_COUVRANT=false;}
  const paie=!r?'<div class="paie">Le chef compte ta paie…</div>':r.erreur?'<div class="paie">'+(r.erreur==='plafond'?'Tu as atteint ton plafond du jour.':r.erreur==='trop'?'Trois vacations par jour au maximum. Reviens demain !':'Paie non versée ('+r.erreur+').')+'</div>':
    '<div class="paie">Ta paie<big>+'+((r.verse||0)/100).toLocaleString('fr-FR',{minimumFractionDigits:2,maximumFractionDigits:2})+' €</big>'+(r.pourboires?'dont '+(r.pourboires/100).toLocaleString('fr-FR',{minimumFractionDigits:2})+' € de pourboires':'')+'</div>';
  d.innerHTML='<div class="c"><small>FIN DE LA VACATION</small><h2>'+(f.livres>=25?'Docker de légende !':f.livres>=15?'Beau boulot, collègue !':f.livres>=6?'Pas mal pour un début':'Les passagers attendent encore…')+'</h2>'+
    '<div class="g"><div><b>'+f.livres+'</b>valises</div><div><b>'+f.malles+'</b>malles</div><div><b>×'+f.best+'</b>meilleure série</div></div>'+paie+
    '<button class="b1">Nouvelle vacation</button><button class="b2">Retour à la place</button></div>';
  if(r&&typeof r.euros==='number'){try{e.euros=r.euros;sauver();majHaut();}catch(x){}}
  d.querySelector('.b1').onclick=()=>{vib(8);d.remove();J.etat='attente';commencer();};
  d.querySelector('.b2').onclick=()=>{vib(8);try{sauver();}catch(x){}document.body.style.transition='opacity .4s';document.body.style.opacity='0';setTimeout(()=>{location.href='spawn.html?de=port&t='+Date.now();},400);};}

/* ---------- LE DÉCOR ---------- */
function decor(){const D=[];const P=(t,x,y,o)=>D.push(Object.assign({t,x,y,gr:0},o||{}));
  P('x_jol_paquebot',W/2,NAV);
  P('x_jol_passerelle',400,NAV+52);
  P('x_jol_tapis',(TX0+TX1)/2,TAPIS_Y,{col:[TX1-TX0+30,14]});
  for(let i=0;i<3;i++)P('x_jol_car'+i,CARS[i].x,CAR_Y+10,{col:[132,28],agir:()=>charger(i),libelle:'Charger la valise',nom:'CAR POUR '+CARS[i].n});
  for(const x of [TX0+40,TX0+120,TX0+200,TX0+280])P('x_jol_entree',x,TAPIS_Y+12,{agir:prendre,libelle:'Prendre une valise',nom:'LE TAPIS'});
  P('x_jol_entree',CHEF.x,CHEF.y+4,{agir:commencer,libelle:'Prendre la vacation',nom:'LE CHEF D’ÉQUIPE'});
  for(let x=40;x<W;x+=80)if(Math.abs(x-400)>40)P('x_jol_bitte',x,QUAI+4,{col:[6,3]});
  for(const x of [80,300,500,720])P('x_jol_barriere',x,CAR_Y-60,{col:[36,3]});
  P('x_jol_entree',40,520,{agir:()=>{try{sauver();}catch(x){}location.href='travail.html?de=croisiere&t='+Date.now();},libelle:'Aller au port qui travaille',nom:'LE QUAI'});
  return D;}

/* ---------- LES PASSANTS ---------- */
const AP0={peau:1,cheveux:1,coiffe:1,barbe:0,haut:2,veste:0,bas:0,pantalon:9,souliers:0,chaussures:0,sac:0,chapeau:0,raye:0,motif:0,_pnj:true};
const CHEF_AP=Object.assign({},AP0,{peau:3,coiffe:2,barbe:1,haut:0,veste:17,pantalon:2});
const PAX=[0,1,2,3,4,5].map(i=>({i,x:400,y:NAV+30,car:i%3,ap:Object.assign({},AP0,{peau:1+(i*3)%5,cheveux:i%4,coiffe:(i*2)%7,haut:[1,2,3,5][i%4],veste:[19,24,22,16,21,23][i],chapeau:i===2?1:0}),dir:'bas',pas:0,att:i*2.4,phase:0}));
let TL=performance.now();
function pas(){const n=performance.now(),dt=Math.min(.05,(n-TL)/1000);TL=n;
  /* le tapis */
  if(J.etat==='jeu'){TAP_OFF+=dt*14;
    if(n>J.prochaine){const r=(n-J.t0)/1000;if(J.belt.length<7)nouvelleValise();J.prochaine=n+Math.max(900,2600-r*18)*(0.8+Math.random()*.4);}
    let lim=TX1-6;J.belt.sort((a,b)=>b.x-a.x);for(const b of J.belt){b.x=Math.min(lim,b.x+dt*22);lim=b.x-(b.lourd?38:26);}
    if(J.belt.length>=7&&J.belt[J.belt.length-1].x<=TX0+30){const b=J.belt.shift();J.tombes++;J.combo=0;mot('Le tapis déborde ! Une valise est tombée','#d8402a');vib([40,30,40]);}
    if((n-J.t0)/1000>=DUREE)finir();hud();}
  /* les passagers descendent la passerelle et vont à leur car */
  const out=[];
  for(const p of PAX){if(p.att>0){p.att-=dt;continue;}
    const C=CARS[p.car],cote=C.x<400?190:610;const pts=[[400,NAV+30],[400,QUAI+40],[cote,QUAI+40],[cote,470],[C.x,470],[C.x,CAR_Y-40]];const NS=pts.length-1;
    p.phase+=dt*.5;const seg=Math.min(NS-.001,p.phase),k=seg-Math.floor(seg),a=pts[Math.floor(seg)],b=pts[Math.floor(seg)+1];
    const nx=a[0]+(b[0]-a[0])*k,ny=a[1]+(b[1]-a[1])*k;if(Math.abs(nx-p.x)>Math.abs(ny-p.y))p.dir=nx>p.x?'droite':'gauche';else p.dir='bas';p.x=nx;p.y=ny;p.pas+=dt*8;
    if(p.phase>=NS){p.phase=0;p.att=3+Math.random()*4;p.car=(Math.random()*3)|0;p.x=400;p.y=NAV+30;continue;}
    out.push(p);}
  out.push({x:CHEF.x,y:CHEF.y,ap:CHEF_AP,dir:'bas',pas:0});
  return out;}

/* ---------- CE QUI BOUGE : les valises, le docker chargé, le chef ---------- */
function acteurs(){const A=[];
  A.push({y:TAPIS_Y-12,f:(g,cx,cy)=>{dessinerBandes(g,cx,cy);
    for(const b of J.belt){const s=valiseCanvas(b),k=1.6;g.drawImage(s.c,Math.round((b.x-s.L*k/2-cx)*2)/2,Math.round((TAPIS_Y-10-s.HH*k-cy)*2)/2,s.L*k,s.HH*k);}}});
  if(J.main){const b=J.main;A.push({y:joueur.y+1,f:(g,cx,cy)=>{const s=valiseCanvas(b),bob=Math.abs(Math.sin(performance.now()/120))*(b.lourd?.4:.8);
    const k=1.6;g.drawImage(s.c,Math.round((joueur.x-s.L*k/2-cx)*2)/2,Math.round((joueur.y-44-s.HH*k+bob-cy)*2)/2,s.L*k,s.HH*k);}});}
  if(J.etat!=='jeu'){A.push({y:CHEF.y+1,f:(g,cx,cy)=>{const t=performance.now()/400,X=CHEF.x-cx,Y=CHEF.y-cy-52+Math.sin(t)*1.5;g.fillStyle='#f2c94c';g.beginPath();g.arc(X,Y,6,0,7);g.fill();g.fillStyle='#2a2016';g.font='900 9px "Baloo 2",system-ui,sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText('!',X,Y+.5);}});}
  /* une flèche au-dessus du bon car */
  if(J.main){const C=CARS[J.main.car];A.push({y:99999,f:(g,cx,cy)=>{const t=performance.now()/200,X=C.x-cx,Y=CAR_Y-62-cy+Math.sin(t)*2;g.fillStyle=C.c;g.beginPath();g.moveTo(X-6,Y);g.lineTo(X+6,Y);g.lineTo(X,Y+7);g.fill();g.strokeStyle='#fff';g.lineWidth=1;g.stroke();}});}
  return A;}

/* ---------- LES COLLISIONS ---------- */
let PARTI_G=false;
function bloque(x,y){if(!PARTI_G&&x<8&&y>QUAI+20){PARTI_G=true;try{sauver();}catch(z){}document.body.style.transition='opacity .4s';document.body.style.opacity='0';setTimeout(()=>{location.href='travail.html?de=croisiere&t='+Date.now();},400);return true;}if(y<QUAI+14||x<8||x>W-8||y>H-6)return true;
  if(x>TX0-6&&x<TX1+26&&y>TAPIS_Y-16&&y<TAPIS_Y+2)return true;
  for(const C of CARS)if(Math.abs(x-C.x)<66&&y>CAR_Y-26&&y<CAR_Y+14)return true;
  return false;}
try{window.__CR={j:()=>joueur,J};}catch(x){}
return {sol,solFin,decor,bloque,graver,depart:DEPART,figurants:pas,acteurs};
})()
