/* =====================================================================
   L'APPART — chez soi, au-dessus du Vieux-Port. Deux grandes fenêtres sur
   la Bonne Mère (de jour comme de nuit), un mur et un sol au choix, et
   les meubles qu'on a achetés, placés où l'on veut (appartdeco.js).
   La pièce entière (mur, sol, tapis, cadres) est peinte dans une seule
   image, refaite à chaque changement ; les meubles debout sont des
   acteurs, rangés en profondeur avec le joueur.
   Chargé par moteur.js (eval direct).
   ===================================================================== */
(()=>{
const W=640,H=540,MUR=180;
const DEPART=[320,486];
const PORTE={x0:288,x1:352};
const rpcS=async(n,a)=>{try{if(typeof sb!=='undefined'&&sb&&sb.rpc){const q=await sb.rpc(n,a||{});return q.data!=null?q.data:(q.error?{erreur:q.error.message}:null);}return await appelRPC(n,a||{});}catch(x){return {erreur:'reseau'};}};
const lin=(g,x0,y0,x1,y1,st)=>{const r=g.createLinearGradient(x0,y0,x1,y1);st.forEach(([o,c])=>r.addColorStop(o,c));return r;};
const rad=(g,x,y,r0,r1,st)=>{const r=g.createRadialGradient(x,y,r0,x,y,r1);st.forEach(([o,c])=>r.addColorStop(o,c));return r;};
const hA=(a,b,k)=>{let n=((a*73856093)^(b*19349663)^(k*83492791))|0;n=(n^(n>>>13))*1274126177|0;return((n^(n>>>16))>>>0)/4294967296;};
const FEN=[160,480];
const nuit=()=>{const h=new Date().getHours();return h>=20||h<7;};
/* l'état : la déco et les meubles possédés (le serveur fait foi ; sans lui, le téléphone garde la déco) */
const A=window.APPART={deco:JSON.parse(JSON.stringify(window.APPART_DEPART||{mur:'creme',sol:'chene',items:[]})),meubles:{},murs:{},sols:{},serveur:false,pret:false};
/* ---------- la vue par la fenêtre ---------- */
function vue(g,cx,y0,w,h){const N=nuit(),x0=cx-w/2;g.save();g.beginPath();g.rect(x0,y0,w,h);g.clip();
  g.fillStyle=N?lin(g,0,y0,0,y0+h,[[0,'#0a1030'],[.6,'#2a2a5a'],[1,'#3a3060']]):lin(g,0,y0,0,y0+h,[[0,'#6ab8f0'],[.6,'#b8e0ff'],[1,'#ffe8c0']]);g.fillRect(x0,y0,w,h);
  if(N)for(let i=0;i<20;i++){g.fillStyle='rgba(255,255,255,'+(.4+hA(cx,i,1)*.5)+')';g.fillRect(x0+hA(cx,i,2)*w,y0+hA(cx,i,3)*h*.4,1,1);}
  const hz=y0+h*.62;
  /* la colline et Notre-Dame de la Garde, sur la fenêtre de gauche ; les quais en face sur l'autre */
  g.fillStyle=N?'#1a1a3a':'#7a8a6a';g.beginPath();g.moveTo(x0,hz);
  if(cx<W/2){g.quadraticCurveTo(x0+w*.55,y0+h*.18,x0+w,hz-6);}else{g.lineTo(x0+w*.3,hz-8);g.lineTo(x0+w*.7,hz-12);g.lineTo(x0+w,hz-6);}g.lineTo(x0+w,hz);g.fill();
  if(cx<W/2){const bx=x0+w*.56,by=y0+h*.22;g.fillStyle=N?'#c8b890':'#efe6d0';g.fillRect(bx-5,by,10,16);g.fillRect(bx-2,by-12,4,12);g.fillStyle=N?'#ffd860':'#f0c040';g.beginPath();g.arc(bx,by-14,2.6,0,7);g.fill();
    if(N){g.fillStyle='rgba(255,220,120,.25)';g.beginPath();g.arc(bx,by,18,0,7);g.fill();}}
  /* les immeubles du quai, leurs fenêtres allumées la nuit */
  for(let i=0;i<8;i++){const bx=x0+i*w/8,bh=10+hA(cx,i,4)*14;g.fillStyle=N?'#20203a':['#e8c8a0','#f0dcc0','#d8b088'][i%3];g.fillRect(bx,hz-bh,w/8-1,bh);
    for(let k=0;k<3;k++)if(N?hA(cx,i*3+k,5)<.55:hA(cx,i*3+k,5)<.2){g.fillStyle=N?'#ffd870':'#5a6a8a';g.fillRect(bx+2+k*4,hz-bh+3,2,2);}}
  /* le Vieux-Port : l'eau, les mâts des voiliers */
  g.fillStyle=N?lin(g,0,hz,0,y0+h,[[0,'#1a2a5a'],[1,'#0a1430']]):lin(g,0,hz,0,y0+h,[[0,'#2a7ab8'],[1,'#1a4a8a']]);g.fillRect(x0,hz,w,y0+h-hz);
  for(let i=0;i<10;i++){g.fillStyle=N?'rgba(255,220,140,.35)':'rgba(255,255,255,.4)';g.fillRect(x0+hA(cx,i,6)*w,hz+3+hA(cx,i,7)*(h*.3),6,1);}
  g.strokeStyle=N?'rgba(200,200,220,.6)':'rgba(255,255,255,.9)';g.lineWidth=1;for(let i=0;i<7;i++){const mx=x0+6+i*w/7+hA(cx,i,8)*6;g.beginPath();g.moveTo(mx,hz+10);g.lineTo(mx,hz-14-hA(cx,i,9)*8);g.stroke();g.fillStyle=N?'#d8d8e8':'#fff';g.fillRect(mx-5,hz+9,10,3);}
  g.restore();}
/* ---------- la pièce entière, dans une image ---------- */
let SALLE=null,SALLE_K='';
function peindreSalle(g,d){d=d||A.deco;
  /* le mur */
  (window.peindreMurAppart||((g,k,x,y,w,h)=>{g.fillStyle='#f2e6cc';g.fillRect(x,y,w,h);}))(g,d.mur||'creme',0,0,W,MUR);
  g.fillStyle=lin(g,0,0,0,16,[[0,'#fffaf0'],[1,'#d8ccb4']]);g.fillRect(0,0,W,14);g.fillStyle='rgba(0,0,0,.12)';g.fillRect(0,14,W,2);
  /* les fenêtres : embrasure, vue, croisillons, rideaux de lin */
  for(const cx of FEN){const w=124,y0=28,h=118,x0=cx-w/2;g.fillStyle='rgba(0,0,0,.18)';g.fillRect(x0-8,y0-6,w+16,h+18);g.fillStyle='#fffaf0';g.fillRect(x0-6,y0-6,w+12,h+12);
    vue(g,cx,y0,w,h);g.fillStyle='#fffaf0';g.fillRect(cx-2,y0,4,h);g.fillRect(x0,y0+h*.45,w,3);g.fillStyle='rgba(255,255,255,.18)';g.beginPath();g.moveTo(x0,y0+h);g.lineTo(x0+30,y0);g.lineTo(x0+46,y0);g.lineTo(x0+16,y0+h);g.fill();
    g.fillStyle=lin(g,0,y0+h,0,y0+h+10,[[0,'#fffaf0'],[1,'#c8bca4']]);g.fillRect(x0-10,y0+h+4,w+20,8);
    for(const s of [-1,1]){const bx=s<0?x0-4:x0+w+4;g.fillStyle=lin(g,bx-10*s,0,bx+12*s,0,[[0,'rgba(246,236,214,.95)'],[1,'rgba(226,210,180,.95)']]);g.beginPath();g.moveTo(bx-12*s,y0-12);g.lineTo(bx+12*s,y0-12);g.quadraticCurveTo(bx+4*s,y0+h*.5,bx+14*s,y0+h+14);g.lineTo(bx-12*s,y0+h+14);g.closePath();g.fill();
      g.strokeStyle='rgba(0,0,0,.08)';for(let k=0;k<3;k++){g.beginPath();g.moveTo(bx+(k*6-8)*s,y0-10);g.lineTo(bx+(k*6-6)*s,y0+h+12);g.stroke();}}
    g.fillStyle='#8a6a4a';g.fillRect(x0-24,y0-14,w+48,3);}
  /* la plinthe */
  g.fillStyle=lin(g,0,MUR-10,0,MUR,[[0,'#fffaf0'],[1,'#c8bca4']]);g.fillRect(0,MUR-10,W,10);
  /* les cadres au mur */
  for(const it of d.items||[]){const m=window.MEUBLES&&MEUBLES[it.m];if(!m||!m.mur)continue;const s=spriteMeuble(it.m,it.f);if(s)g.drawImage(s.c,it.x-s.ox,it.y-s.oy,s.w,s.h);}
  /* le sol */
  (window.peindreSolAppart||((g,k,x,y,w,h)=>{g.fillStyle='#c8904a';g.fillRect(x,y,w,h);}))(g,d.sol||'chene',0,MUR,W,H-MUR);
  g.fillStyle=lin(g,0,MUR,0,MUR+30,[[0,'rgba(30,15,0,.35)'],[1,'rgba(30,15,0,0)']]);g.fillRect(0,MUR,W,30);
  /* la lumière des fenêtres sur le sol */
  if(!nuit())for(const cx of FEN){g.fillStyle='rgba(255,240,200,.14)';g.beginPath();g.moveTo(cx-62,MUR);g.lineTo(cx+62,MUR);g.lineTo(cx+110,MUR+150);g.lineTo(cx-20,MUR+150);g.closePath();g.fill();}
  else{g.fillStyle='rgba(10,10,40,.12)';g.fillRect(0,0,W,H);}
  /* les tapis */
  for(const it of d.items||[]){const m=window.MEUBLES&&MEUBLES[it.m];if(!m||!m.tapis)continue;const s=spriteMeuble(it.m,it.f);if(s)g.drawImage(s.c,it.x-s.ox,it.y-s.oy,s.w,s.h);}
  /* les bords de la pièce, et la porte */
  g.fillStyle=lin(g,0,0,14,0,[[0,'rgba(0,0,0,.35)'],[1,'rgba(0,0,0,0)']]);g.fillRect(0,MUR,14,H-MUR);g.fillStyle=lin(g,W-14,0,W,0,[[0,'rgba(0,0,0,0)'],[1,'rgba(0,0,0,.35)']]);g.fillRect(W-14,MUR,14,H-MUR);
  g.fillStyle='#5a3a1a';g.fillRect(PORTE.x0-6,H-8,PORTE.x1-PORTE.x0+12,8);g.fillStyle='#8a5a2a';g.fillRect(PORTE.x0,H-6,PORTE.x1-PORTE.x0,6);
  g.fillStyle='#a8502a';g.fillRect(PORTE.x0+4,H-30,PORTE.x1-PORTE.x0-8,20);g.fillStyle='rgba(255,255,255,.2)';g.font='700 7px "Baloo 2",Arial';g.textAlign='center';g.fillText('BIENVENUE',(PORTE.x0+PORTE.x1)/2,H-17);}
function salle(){const k=JSON.stringify([A.deco.mur,A.deco.sol,(A.deco.items||[]).filter(i=>MEUBLES[i.m]&&(MEUBLES[i.m].mur||MEUBLES[i.m].tapis)),nuit()]);if(SALLE&&k===SALLE_K)return SALLE;
  const D=Math.min(2,Math.max(1,Math.round(devicePixelRatio||2))),c=SALLE||document.createElement('canvas');c.width=W*D;c.height=H*D;const g=c.getContext('2d');g.setTransform(D,0,0,D,0,0);g.clearRect(0,0,W,H);peindreSalle(g);SALLE=c;SALLE_K=k;return c;}
function sol(){const c=document.createElement('canvas');c.width=W;c.height=H;const g=c.getContext('2d');g.fillStyle='#c8904a';g.fillRect(0,0,W,H);return c;}
function solFin(){const c=document.createElement('canvas');c.width=W*2;c.height=H*2;const g=c.getContext('2d');g.fillStyle='#c8904a';g.fillRect(0,0,W*2,H*2);return c;}
/* ---------- ce qui se dessine à chaque image ---------- */
const vu=(x,y,cx,cy,mx,my)=>{const X=x-cx,Y=y-cy;return X>-mx&&X<VW+mx&&Y>-20&&Y<VH+(my||140);};
function acteurs(){const L=[];
  L.push({y:-2e5,f:(g,cx,cy)=>{const s=salle();g.drawImage(s,-cx,-cy,W,H);}});
  for(const it of A.deco.items||[]){const m=MEUBLES[it.m];if(!m||m.mur||m.tapis)continue;
    L.push({y:it.y,f:(g,cx,cy)=>{if(!vu(it.x,it.y,cx,cy,m.w,m.h+20))return;const s=spriteMeuble(it.m,it.f);if(s)g.drawImage(s.c,Math.round(it.x-cx-s.ox),Math.round(it.y-cy-s.oy),s.w,s.h);}});}
  /* la lueur des lampes et du juke-box, le soir */
  if(nuit())L.push({y:1e5,f:(g,cx,cy)=>{for(const it of A.deco.items||[]){if(it.m!=='lampadaire'&&it.m!=='jukebox'&&it.m!=='aquarium')continue;g.fillStyle=rad(g,it.x-cx,it.y-cy-40,4,90,[[0,'rgba(255,220,150,.22)'],[1,'rgba(255,220,150,0)']]);g.fillRect(it.x-cx-90,it.y-cy-130,180,180);}}});
  return L;}
function decor(){return [{t:'x_jol_app_vide',x:(PORTE.x0+PORTE.x1)/2,y:H-40,gr:0,agir:()=>decorer(),libelle:'Décorer',nom:'MON APPART',demi:30}];}
function graver(){const c=document.createElement('canvas');c.width=c.height=1;return {toile:c,W:1,H:1,sol:0};}
function figurants(){return [];}
function bloque(x,y){if(x<14||x>W-14||y<MUR+10||y>H-4)return true;if(y>H-16&&(x<PORTE.x0||x>PORTE.x1))return true;
  for(const it of A.deco.items||[]){const m=MEUBLES[it.m];if(!m||m.mur||m.tapis||!m.d)continue;if(Math.abs(x-it.x)<m.w/2-2&&y>it.y-m.d&&y<it.y+3)return true;}
  return false;}
/* ---------- décorer ---------- */
async function decorer(){try{if(!window.ouvrirDecoAppart)eval(await chargerMorceau('appartdeco.js'));window.ouvrirDecoAppart();}catch(x){try{console.warn('DECO',x);}catch(_){}}}
window.APPART_SALLE_IMG=(d,D)=>{const c=document.createElement('canvas');c.width=W*D;c.height=H*D;const g=c.getContext('2d');g.setTransform(D,0,0,D,0,0);peindreSalle(g,d);return c;};
window.APPART_DIM={W,H,MUR,PORTE};
window.APPART_APPLIQUER=d=>{A.deco=d;SALLE_K='';try{if(typeof JOL!=='undefined'&&JOL)JOL.acteurs=acteurs;}catch(x){}};
/* le bouton « Décorer », toujours à portée de pouce */
(()=>{const b=document.createElement('button');b.id='btnDeco';b.innerHTML='<span style="font-size:20px">🛋️</span><span>Décorer</span>';
  b.style.cssText="position:fixed;right:14px;bottom:calc(96px + env(safe-area-inset-bottom));z-index:900;display:flex;align-items:center;gap:6px;border:0;border-radius:22px;padding:9px 14px 9px 11px;font:800 15px 'Baloo 2',system-ui,sans-serif;color:#3a2410;background:linear-gradient(#fffaf0,#f0dcb8);box-shadow:0 4px 0 #a8804a,0 8px 16px rgba(0,0,0,.3)";
  b.onclick=()=>{try{vibrer(8);}catch(x){}decorer();};document.body.appendChild(b);setInterval(()=>{b.style.display=window.ECRAN_COUVRANT?'none':'flex';},300);})();
/* ---------- le chargement ---------- */
async function charger(){const r=await rpcS('appart_moi');
  if(r&&!r.erreur){A.serveur=true;A.meubles=r.meubles||{};A.murs=r.murs||{};A.sols=r.sols||{};if(r.deco&&Array.isArray(r.deco.items))A.deco=r.deco;}
  else{try{const l=JSON.parse(localStorage.getItem('bd_appart')||'null');if(l&&Array.isArray(l.items))A.deco=l;}catch(x){}}
  A.pret=true;SALLE_K='';}

charger();
/* LA SORTIE : la porte, en bas, ramène sur la place */
let PARTI=false;
setInterval(()=>{try{if(PARTI||typeof joueur==='undefined'||window.ECRAN_COUVRANT)return;if(joueur.y>H-12&&joueur.x>PORTE.x0&&joueur.x<PORTE.x1){PARTI=true;try{sauver();}catch(x){}
  try{const f=document.createElement('div');f.style.cssText='position:fixed;inset:0;z-index:2147483000;background:#1a120a;opacity:0;transition:opacity .45s;pointer-events:none';document.body.appendChild(f);requestAnimationFrame(()=>f.style.opacity='1');}catch(x){}
  setTimeout(()=>{const v=window.MA_VERSION?('&v='+encodeURIComponent(window.MA_VERSION)):'';location.href='spawn.html?de=appart'+v+'&t='+Date.now();},480);}}catch(x){}},150);
setTimeout(()=>{const v=document.getElementById('voileAP');if(v){v.style.opacity='0';setTimeout(()=>v.remove(),800);}},700);
return {sol,solFin,decor,bloque,graver,depart:DEPART,figurants,acteurs};
})()
