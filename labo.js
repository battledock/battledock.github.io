/* =====================================================================
   LE LABO — un quai à part pour tout essayer (labo.html).
   Chaque idée a sa station : le kiosque du Quai, Mistral TV (quiz,
   cuisine, météo), le vendeur de sardines, Gégé et sa mauvaise foi,
   la bouée pour Momo, le karaoké, la pétanque avec Marius, Bébert qui
   dort, le container mystère, la course de chariots, Dédé pour les
   farces, la mouette voleuse, les émotes. Le téléphone ajoute la
   pizzeria, le patron, un mauvais numéro et les photos.
   Tout est local. Chargé par moteur.js (eval direct).
   ===================================================================== */
(()=>{
const W=800, H=1100, X0=314, X1=500, MER=300;
const DEPART=[400,160];
window.LABO={};
const hA=(x,y,k)=>{let n=((x*73856093)^(y*19349663)^(k*83492791))|0;n=(n^(n>>>13))*1274126177|0;return((n^(n>>>16))>>>0)/4294967296;};
const lin=(g,x0,y0,x1,y1,st)=>{const gr=g.createLinearGradient(x0,y0,x1,y1);st.forEach(([o,c])=>gr.addColorStop(o,c));return gr;};
const R=(g,x,y,w,h,c)=>{g.fillStyle=c;g.fillRect(x,y,w,h);};
function toile(L,HH){const D=2,c=document.createElement('canvas');c.width=Math.ceil(L*D);c.height=Math.ceil(HH*D);const g=c.getContext('2d');g.setTransform(D,0,0,D,0,0);return {c,g};}
function fe(g,cx,cy,rx,ry,pal,n,seed,t){t=t||1;for(let i=0;i<n;i++){const a=hA(i,seed,1)*Math.PI*2,r=Math.sqrt(hA(i,seed,2));const x=cx+Math.cos(a)*rx*r,y=cy+Math.sin(a)*ry*r;
  const lum=((cx-x)/rx+(cy-y)/ry)*.5+hA(i,seed,3)*.4;g.fillStyle=lum>.55?pal[3]:lum>.15?pal[2]:lum>-.3?pal[1]:pal[0];
  g.beginPath();g.ellipse(x,y,(1.2+hA(i,seed,4)*1.6)*t,(.9+hA(i,seed,5)*1)*t,hA(i,seed,6)*3,0,7);g.fill();}}
function ombreSol(g,cx,cy,rx,ry,a){g.fillStyle='rgba(40,34,26,'+(a||.18)+')';g.beginPath();g.ellipse(cx+4,cy+3,rx,ry,0,0,7);g.fill();}
const txt=(g,s,x,y,px,c,al,f)=>{g.fillStyle=c;g.font=(f||'bold')+' '+px+'px "Helvetica Neue",Arial,sans-serif';g.textAlign=al||'center';g.textBaseline='middle';g.fillText(s,x,y);};

function mot(t){let m=document.getElementById('blcMot');if(!m){m=document.createElement('div');m.id='blcMot';m.style.cssText='position:fixed;left:50%;top:22%;transform:translateX(-50%);z-index:2147482400;background:rgba(20,22,26,.9);color:#fff;padding:9px 16px;border-radius:14px;font:800 15px "Baloo 2",sans-serif;pointer-events:none;transition:opacity .2s;opacity:0;text-align:center';document.body.appendChild(m);}
  m.textContent=t;m.style.opacity='1';clearTimeout(mot.t);mot.t=setTimeout(()=>m.style.opacity='0',1800);}
/* LA BOÎTE DE DIALOGUE : le portrait, la réplique, les choix */
function portrait(cv,ap){const s=3,NW=40,NH=40;cv.width=NW*s;cv.height=NH*s;cv.style.width=NW*1.6+'px';cv.style.height=NH*1.6+'px';const g=cv.getContext('2d');g.imageSmoothingEnabled=false;g.setTransform(s,0,0,s,0,-12*s);personne(g,20,62,ap,'bas',0,false);g.setTransform(1,0,0,1,0,0);}
function dialogue({nom,ap,texte,choix}){return new Promise(ok=>{const old=document.getElementById('blcDia');if(old)old.remove();
  const d=document.createElement('div');d.id='blcDia';d.style.cssText='position:fixed;left:0;right:0;bottom:0;z-index:2147482600;background:#1b1d22;color:#fff;border-radius:22px 22px 0 0;padding:14px 14px calc(14px + env(safe-area-inset-bottom));box-shadow:0 -10px 30px rgba(0,0,0,.45);font-family:"Baloo 2",system-ui,sans-serif;transform:translateY(100%);transition:transform .2s';
  d.innerHTML='<div style="display:flex;gap:10px;align-items:flex-start"><canvas style="flex:none;border-radius:14px;background:#2a2e36;image-rendering:pixelated"></canvas><div style="flex:1;min-width:0"><b style="display:block;color:#ffd98a;font-size:14px;letter-spacing:.06em">'+nom.toUpperCase()+'</b><div style="font-weight:700;font-size:16px;line-height:1.3">'+texte+'</div></div></div><div class="ch" style="display:flex;flex-direction:column;gap:7px;margin-top:12px"></div>';
  if(ap)portrait(d.querySelector('canvas'),ap);else d.querySelector('canvas').style.display='none';
  const C=d.querySelector('.ch');choix.forEach((c,i)=>{const b=document.createElement('button');b.textContent=c;b.style.cssText='border:0;border-radius:14px;padding:11px 12px;text-align:left;background:#2e323b;color:#fff;font:800 15px "Baloo 2",sans-serif;box-shadow:0 3px 0 #15171b';
    b.onclick=()=>{try{vibrer&&vibrer(8);}catch(x){}d.style.transform='translateY(100%)';setTimeout(()=>d.remove(),200);ok(i);};C.appendChild(b);});
  document.body.appendChild(d);requestAnimationFrame(()=>d.style.transform='none');});}


const LS=(k,v)=>{try{if(v===undefined)return JSON.parse(localStorage.getItem(k)||'null');localStorage.setItem(k,JSON.stringify(v));}catch(x){return null;}};
const vib=x=>{try{vibrer&&vibrer(x);}catch(_){}};
const pause=ms=>new Promise(r=>setTimeout(r,ms));
const ALEA=L=>L[Math.floor(Math.random()*L.length)];
const ap=(o)=>Object.assign({peau:1,cheveux:1,coiffe:1,barbe:0,haut:2,veste:0,bas:0,pantalon:9,souliers:0,chaussures:0,sac:0,chapeau:0,raye:0,motif:0,_pnj:true},o);
const AP={fanfan:ap({peau:2,cheveux:6,coiffe:0,barbe:2,haut:7,chapeau:1}),gege:ap({peau:3,cheveux:0,coiffe:2,barbe:1,haut:4,veste:11}),
  momo:ap({peau:5,cheveux:0,coiffe:3,haut:1,_nage:true}),marius:ap({peau:2,cheveux:6,coiffe:4,barbe:3,haut:0,chapeau:1}),
  bebert:ap({peau:1,cheveux:2,coiffe:1,barbe:2,haut:2,veste:16}),dede:ap({peau:4,cheveux:3,coiffe:2,haut:6}),
  gilbert:ap({peau:1,cheveux:6,coiffe:3,haut:5,veste:23}),chef:ap({peau:2,cheveux:0,coiffe:0,barbe:1,haut:0}),
  livreur:ap({peau:3,cheveux:1,coiffe:2,haut:3,chapeau:1}),mime:ap({peau:0,cheveux:0,coiffe:0,haut:0,raye:1}),
  public1:ap({peau:1,cheveux:3,coiffe:5,haut:6}),public2:ap({peau:4,cheveux:1,coiffe:2,haut:3}),public3:ap({peau:2,cheveux:6,coiffe:1,haut:7})};
function une(t){const L=LS('labo_unes')||[];L.unshift({t,q:Date.now()});LS('labo_unes',L.slice(0,8));}
/* ---------- LA JAUGE : un curseur qui va et vient, on tape au bon moment ---------- */
function jauge(titre,vitesse){return new Promise(ok=>{const d=document.createElement('div');
  d.style.cssText='position:fixed;left:14px;right:14px;bottom:calc(30px + env(safe-area-inset-bottom));z-index:2147482700;background:#1b1d22;color:#fff;border-radius:20px;padding:14px;font-family:"Baloo 2",sans-serif;box-shadow:0 10px 30px rgba(0,0,0,.45);touch-action:none';
  d.innerHTML='<b style="display:block;text-align:center;font-size:16px;margin-bottom:10px">'+titre+'</b><div style="position:relative;height:30px;border-radius:15px;background:linear-gradient(90deg,#c8302a,#f2c43a 38%,#3ac860 46%,#3ac860 54%,#f2c43a 62%,#c8302a)"><i style="position:absolute;top:-5px;width:6px;height:40px;border-radius:3px;background:#fff;box-shadow:0 0 8px #000;left:0"></i></div><div style="text-align:center;margin-top:10px;font-weight:800;color:#ffd98a">TAPE !</div>';
  document.body.appendChild(d);const cur=d.querySelector('i'),t0=performance.now();let fin=false,p=0;
  const boucle=()=>{if(fin)return;p=(Math.sin((performance.now()-t0)/1000*(vitesse||2.6))+1)/2;cur.style.left='calc('+(p*100)+'% - 3px)';requestAnimationFrame(boucle);};boucle();
  d.addEventListener('pointerdown',ev=>{ev.preventDefault();if(fin)return;fin=true;vib(15);const prec=Math.max(0,1-Math.abs(p-.5)*2);
    d.lastChild.textContent=prec>.9?'PARFAIT !':prec>.65?'Pas mal':prec>.35?'Bof…':'Raté !';setTimeout(()=>{d.remove();ok(prec);},650);});});}
/* ---------- LE SOL PEINT : le quai, la mer à gauche, les containers à droite ---------- */
function peindreSol(g){
  g.fillStyle='#14181e';g.fillRect(0,0,W,H);
  /* la mer, à gauche du quai */
  g.fillStyle=lin(g,0,0,MER,0,[[0,'#1a4a6a'],[1,'#2a6a8a']]);g.fillRect(0,0,MER,H);
  for(let y=6;y<H;y+=14)for(let x=(y%28?8:0);x<MER;x+=26){g.fillStyle='rgba(255,255,255,'+(.06+hA(x,y,1)*.08)+')';g.fillRect(x,y,10,1.4);}
  /* le quai : dalles claires, bordure de pierre */
  R(g,MER,0,W-MER,H,'#cfc4ae');
  for(let y=0;y<H;y+=26)for(let x=MER+((y/26)%2?0:20);x<W;x+=40){R(g,x,y,39,25,hA(x,y,2)>.5?'#d6cbb5':'#c9bea8');R(g,x,y+25,40,1,'rgba(90,80,64,.25)');R(g,x+39,y,1,26,'rgba(90,80,64,.2)');}
  R(g,MER,0,10,H,'#a89a80');R(g,MER,0,2,H,'#e8dcc4');for(let y=40;y<H;y+=150){R(g,MER+12,y,7,7,'#3a3e44');R(g,MER+13,y-3,5,3,'#4a4e54');}
  /* les containers, à droite : un mur coloré */
  const C=['#b8402e','#2a5a8a','#3a7a4a','#c8a040','#a85a2a','#2a4a6a'];
  for(let y=0,k=0;y<H;y+=58,k++){const c=C[k%C.length];R(g,512,y,W-512,56,c);for(let x=516;x<W;x+=5)R(g,x,y+3,1.4,50,'rgba(0,0,0,.16)');R(g,512,y,W-512,2,'rgba(255,255,255,.3)');R(g,512,y+54,W-512,2,'rgba(0,0,0,.35)');
    txt(g,['MSK','CMA','EVR','DCK','LAB','MRS'][k%6],552,y+28,10,'rgba(255,255,255,.55)','center','900');}
  R(g,506,0,6,H,'rgba(0,0,0,.25)');
  /* la banderole d'entrée */
  R(g,300,92,200,22,'#1d3f74');R(g,300,92,200,2,'#3a6ab4');txt(g,'🧪 LE LABO · TOUT TESTER ICI',400,103,9,'#ffd98a','center','900');R(g,300,114,3,18,'#5a5e66');R(g,497,114,3,18,'#5a5e66');
  txt(g,'▲ SORTIE',400,128,7,'#5a5040','center','900');
  /* le terrain de pétanque */
  g.fillStyle='#b8a078';g.fillRect(330,508,140,74);for(let i=0;i<500;i++){g.fillStyle=hA(i,5,1)>.5?'#a89068':'#c8b088';g.fillRect(330+hA(i,5,2)*140,508+hA(i,5,3)*74,1.4,1.4);}
  g.strokeStyle='#8a7050';g.lineWidth=2;g.strokeRect(330,508,140,74);
  /* le circuit des chariots : des chevrons au sol */
  g.strokeStyle='rgba(242,196,58,.55)';g.lineWidth=3;g.setLineDash([8,8]);g.beginPath();g.moveTo(400,800);for(const [x,y] of FLAGS)g.lineTo(x,y);g.lineTo(400,800);g.stroke();g.setLineDash([]);
  for(let x=360;x<440;x+=8){R(g,x,796,8,4,(x/8)%2?'#111':'#fff');R(g,x,800,8,4,(x/8)%2?'#fff':'#111');}
  /* les plaques des stations, peintes au sol */
  for(const s of PLAQUES){R(g,s[0]-30,s[1]+10,60,11,'rgba(20,24,30,.82)');txt(g,s[2],s[0],s[1]+15.5,5.6,'#ffd98a','center','900');}}
const FLAGS=[[338,860],[464,920],[340,990],[460,1036]];
const PLAQUES=[[345,210,'📰 KIOSQUE'],[460,210,'📺 MISTRAL TV'],[345,320,'🐟 SARDINES'],[460,320,'🗣️ MAUVAISE FOI'],[330,430,'🛟 BOUÉE'],[460,430,'🎤 KARAOKÉ'],
  [345,660,'😴 BÉBERT'],[460,660,'📦 MYSTÈRE'],[345,770,'🍌 DÉDÉ'],[460,770,'🏁 CHARIOTS']];
function sol(){const c=document.createElement('canvas');c.width=W;c.height=H;peindreSol(c.getContext('2d'));return c;}
function solFin(){const c=document.createElement('canvas');c.width=W*2;c.height=H*2;const g=c.getContext('2d');g.setTransform(2,0,0,2,0,0);peindreSol(g);return c;}
/* ---------- LES STATIONS (dessinées à la volée) ---------- */
const now=()=>performance.now()/1000;
function bulle(g,x,y,t,c){g.font='900 7px "Helvetica Neue",Arial,sans-serif';const w=g.measureText(t).width+10;g.fillStyle='rgba(255,255,255,.95)';g.beginPath();g.roundRect(x-w/2,y-9,w,12,5);g.fill();
  g.beginPath();g.moveTo(x-3,y+3);g.lineTo(x+1,y+7);g.lineTo(x+3,y+3);g.fill();txt(g,t,x,y-3,7,c||'#1a1c22','center','900');}
const emo=(g,e,x,y,px)=>{g.font=(px||10)+'px sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText(e,x,y);};
const ANIM={};
ANIM.kiosque=(g,x,y)=>{R(g,x-20,y-34,40,34,'#2a5a3a');R(g,x-22,y-40,44,7,'#1d3f2a');R(g,x-22,y-40,44,1.5,'#4a8a5a');R(g,x-16,y-30,32,18,'#f2ece0');
  txt(g,'LE QUAI',x,y-27,4.2,'#1d3f74','center','900');R(g,x-13,y-24,26,1,'#888');R(g,x-13,y-21,18,1,'#aaa');R(g,x-13,y-18,22,1,'#aaa');R(g,x-14,y-10,28,8,'#c8402e');txt(g,'À LA UNE',x,y-6,3.8,'#fff','center','900');};
ANIM.tv=(g,x,y)=>{R(g,x-1.5,y-22,3,22,'#3a3e46');R(g,x-10,y-2,20,3,'#2a2e36');R(g,x-24,y-50,48,30,'#1a1c24');const t=now();
  const gr=g.createLinearGradient(x-22,0,x+22,0);gr.addColorStop(0,'#0a2a8a');gr.addColorStop(1,'#3a1a8a');g.fillStyle=gr;g.fillRect(x-22,y-48,44,26);
  txt(g,'MISTRAL',x,y-40,5.4,'#fff','center','900');txt(g,'TV',x,y-33,5.4,'#ff6a50','center','900');if(Math.floor(t*2)%2){R(g,x-20,y-46,3,3,'#e8302a');}
  txt(g,'QUIZ · CUISINE · MÉTÉO',x,y-26,2.8,'#a8c8ff','center','900');};
ANIM.etal=(g,x,y)=>{R(g,x-22,y-16,44,14,'#8a5a3a');R(g,x-22,y-16,44,2,'#a8784a');R(g,x-24,y-38,48,6,'#2a6ad8');for(let k=0;k<6;k++)R(g,x-24+k*8,y-32,8,4,k%2?'#fff':'#2a6ad8');R(g,x-22,y-32,2,18,'#5a3a2a');R(g,x+20,y-32,2,18,'#5a3a2a');
  for(let k=0;k<7;k++){g.fillStyle='#a8b8c8';g.beginPath();g.ellipse(x-16+k*5.3,y-18,2.4,1.2,.3,0,7);g.fill();}};
ANIM.caisse=(g,x,y)=>{R(g,x-12,y-10,24,10,'#a8784a');R(g,x-12,y-10,24,1.5,'#c8985a');txt(g,'VÉRITÉ',x,y-5,3.6,'#3a2a1a','center','900');};
ANIM.bouee=(g,x,y)=>{R(g,x-1.5,y-30,3,30,'#e8e0d0');R(g,x-8,y-30,16,3,'#e8e0d0');if(!BOUEE.vol){g.strokeStyle='#e8402a';g.lineWidth=4;g.beginPath();g.arc(x,y-18,7,0,7);g.stroke();g.strokeStyle='#fff';g.lineWidth=4;for(let k=0;k<4;k++){g.beginPath();g.arc(x,y-18,7,k*Math.PI/2,k*Math.PI/2+.4);g.stroke();}}};
ANIM.micro=(g,x,y)=>{R(g,x-1,y-26,2,26,'#3a3e46');R(g,x-7,y-1,14,2,'#2a2e36');g.fillStyle='#2a2e36';g.beginPath();g.arc(x,y-28,3,0,7);g.fill();
  R(g,x+14,y-22,12,22,'#1a1c22');g.fillStyle='#3a3e46';g.beginPath();g.arc(x+20,y-14,4,0,7);g.fill();g.beginPath();g.arc(x+20,y-5,2.4,0,7);g.fill();
  if(KARA.on){const t=now();for(let k=0;k<3;k++){emo(g,'♪',x+8+Math.sin(t*3+k)*10,y-34-((t*20+k*10)%26),7);}}};
ANIM.palette=(g,x,y)=>{R(g,x-20,y-8,40,8,'#a8784a');for(let k=0;k<4;k++)R(g,x-20+k*11,y-8,6,8,'#8a5a3a');R(g,x-20,y-9,40,2,'#c8985a');};
ANIM.container=(g,x,y)=>{const o=MYST.ouv,ph=MYST.t?Math.min(1,(now()-MYST.t)/0.5):0;
  R(g,x-28,y-36,56,36,'#c8402e');for(let xx=x-26;xx<x+26;xx+=4)R(g,xx,y-34,1.2,32,'rgba(0,0,0,.18)');R(g,x-28,y-36,56,2,'rgba(255,255,255,.3)');
  if(o){R(g,x-24,y-32,48,32,'#1a1210');const a=ph*20;R(g,x-28-a,y-34,4+a*.2,34,'#a8301e');R(g,x+24+a-a*.2,y-34,4+a*.2,34,'#a8301e');}
  else{R(g,x-1,y-34,2,34,'#7a2012');R(g,x-6,y-20,3,8,'#c8c8c8');R(g,x+3,y-20,3,8,'#c8c8c8');txt(g,'?',x,y-44-Math.abs(Math.sin(now()*3))*3,10,'#ffd98a','center','900');}};
ANIM.chariot=(g,x,y)=>{if(COURSE.on)return;dessinerChariot(g,x,y,'droite');};
function dessinerChariot(g,x,y,dir){const s=dir==='gauche'?-1:1;g.save();g.translate(x,y);g.scale(s,1);
  g.fillStyle='rgba(0,0,0,.3)';g.fillRect(-16,-1,32,4);R(g,-14,-16,24,12,'#f2c43a');R(g,-14,-16,24,2,'#ffe08a');R(g,-12,-30,2,14,'#2a2e36');R(g,4,-30,2,14,'#2a2e36');R(g,-12,-31,18,2,'#2a2e36');
  R(g,12,-30,3,28,'#3a3e46');R(g,14,-4,9,2,'#5a5e66');g.fillStyle='#1a1c22';g.beginPath();g.arc(-8,-3,4,0,7);g.arc(6,-3,4,0,7);g.fill();g.restore();}
ANIM.drapeau=(g,x,y,o)=>{const act=COURSE.on&&COURSE.k===o.k;R(g,x-1,y-26,2,26,'#e8e0d0');g.fillStyle=act?'#3ac860':'#e8402a';g.beginPath();g.moveTo(x+1,y-26);g.lineTo(x+14,y-22+Math.sin(now()*6)*1.5);g.lineTo(x+1,y-17);g.fill();txt(g,String(o.k+1),x+6,y-21.5,4.6,'#fff','center','900');
  if(act){g.strokeStyle='rgba(58,200,96,'+(.5+.4*Math.sin(now()*8))+')';g.lineWidth=2;g.beginPath();g.ellipse(x,y,16,6,0,0,7);g.stroke();}};
const TYPES={};for(const k in ANIM){ANIM_DECOR['lab_'+k]=(g,o,x,y)=>ANIM[k](g,x,y,o);}
/* ---------- LES PERSONNAGES QUI BOUGENT ---------- */
const DEDE={x:345,y:742,dir:'droite',pas:0,etat:'marche',t:0,banane:null,pizza:null};
const MOUETTE={x:440,y:170,etat:'pose',sandwich:false,vol:null,essais:0,repos:0};
let SANDWICH=true;
const BOUEE={vol:null};
const KARA={on:false,jets:[]};
const MYST={ouv:false,t:0,quoi:null,parts:[]};
const COURSE={on:false,k:0,t0:0};
const BEBERT={reveil:0,quoi:null};
const PET={boules:[],coch:null};
const SCOOT={on:false,x:0,y:0,cible:null,t:0,cb:null};
let EMOTE=null,VENT=0,DIRECT_TV=false;
function dessinerMouette(g,x,y,vole){const t=now();g.fillStyle='#f2f0ea';g.beginPath();g.ellipse(x,y-5,6,3.4,0,0,7);g.fill();g.beginPath();g.arc(x+5,y-8,2.6,0,7);g.fill();
  R(g,x+7,y-8.5,3,1.4,'#f2b43a');R(g,x+5.5,y-9,1,1,'#111');R(g,x-8,y-6,4,2,'#9aa0a8');
  const a=vole?Math.sin(t*22)*5:0;g.fillStyle='#c8ccd2';g.beginPath();g.moveTo(x-3,y-6);g.lineTo(x+2,y-6);g.lineTo(x-1,y-11-a);g.fill();
  if(!vole){R(g,x-1,y-2,1,2,'#f2b43a');R(g,x+2,y-2,1,2,'#f2b43a');}}
function acteurs(){const t=now(),L=[];
  /* Momo dans l'eau */
  L.push({y:430,f:(c,cx,cy)=>{personne(c,272-cx,438-cy+Math.sin(t*2)*1.2,AP.momo,'droite',0,false);if(BOUEE.dans>Date.now()){c.strokeStyle='#e8402a';c.lineWidth=3;c.beginPath();c.ellipse(272-cx,432-cy,9,4,0,0,7);c.stroke();}
    if(BOUEE.msg&&BOUEE.msg.t>Date.now())bulle(c,272-cx,400-cy,BOUEE.msg.s);}});
  /* la bouée en vol */
  if(BOUEE.vol){const v=BOUEE.vol,p=Math.min(1,(Date.now()-v.t0)/700);const x=v.x0+(v.x1-v.x0)*p,y=v.y0+(v.y1-v.y0)*p-Math.sin(p*Math.PI)*40;
    L.push({y:y+30,f:(c,cx,cy)=>{c.strokeStyle='#e8402a';c.lineWidth=3;c.beginPath();c.arc(x-cx,y-cy,6,0,7);c.stroke();}});if(p>=1)BOUEE.vol=null;}
  /* les PNJ fixes */
  const fix=(nom,x,y,dir,b)=>L.push({y,f:(c,cx,cy)=>{personne(c,x-cx,y-cy,AP[nom],dir,0,false);if(b)b(c,x-cx,y-cy);}});
  fix('fanfan',345,306,'bas');fix('gege',460,302,'bas',(c,x,y)=>{if(Math.floor(t/3)%3===0)bulle(c,x,y-40,'J’ai raison !');});
  fix('marius',462,540,'gauche',(c,x,y)=>{if(PET.msg&&PET.msg.t>Date.now())bulle(c,x,y-40,PET.msg.s);});
  fix('public1',440,454,'haut');fix('public2',490,458,'haut');fix('public3',464,472,'haut');
  /* Bébert sur sa palette */
  L.push({y:658,f:(c,cx,cy)=>{const x=345-cx,y=652-cy,rv=BEBERT.reveil>Date.now();
    if(rv){personne(c,x,y-(Math.max(0,BEBERT.reveil-Date.now()-4500)/100),AP.bebert,'bas',0,false);bulle(c,x,y-42,BEBERT.quoi||'!!');}
    else{c.save();c.translate(x,y-4);c.rotate(-Math.PI/2);personne(c,0,8,AP.bebert,'bas',0,false);c.restore();for(let k=0;k<3;k++)txt(c,'z',x+8+k*4,y-14-((t*10+k*6)%18),5+k*1.5,'rgba(255,255,255,.85)','center','900');}
    if(BEBERT.eau>Date.now()){for(let k=0;k<14;k++){c.fillStyle='rgba(120,180,255,.8)';c.fillRect(x-12+hA(k,1,1)*24,y-20+((Date.now()/20+k*7)%22),1.5,3);}}
    if(BEBERT.notes>Date.now()){for(let k=0;k<3;k++)emo(c,'🎵',x-10+k*10,y-30-Math.sin(t*6+k)*4,8);}}});
  /* Dédé et ses farces */
  L.push({y:DEDE.y,f:(c,cx,cy)=>{const x=DEDE.x-cx,y=DEDE.y-cy;
    if(DEDE.etat==='glisse'){const p=Math.min(1,(Date.now()-DEDE.t)/400);c.save();c.translate(x,y);c.rotate(p*Math.PI/2*(DEDE.dir==='droite'?-1:1));personne(c,0,0,AP.dede,DEDE.dir,0,false);c.restore();
      for(let k=0;k<4;k++)emo(c,'⭐',x+Math.cos(t*5+k*1.6)*12,y-14+Math.sin(t*5+k*1.6)*4,6);bulle(c,x,y-34,'AÏE AÏE AÏE');}
    else{personne(c,x,y,AP.dede,DEDE.dir,DEDE.pas,DEDE.etat==='marche');if(DEDE.msg&&DEDE.msg.t>Date.now())bulle(c,x,y-40,DEDE.msg.s);if(DEDE.mange>Date.now())emo(c,'🍕',x+6,y-18,8);}}});
  if(DEDE.banane)L.push({y:DEDE.banane.y-1,f:(c,cx,cy)=>emo(c,'🍌',DEDE.banane.x-cx,DEDE.banane.y-cy-3,9)});
  /* la mouette */
  L.push({y:MOUETTE.y+(MOUETTE.vol?60:0),f:(c,cx,cy)=>{let x=MOUETTE.x,y=MOUETTE.y,h=0;
    if(MOUETTE.vol){const v=MOUETTE.vol,p=Math.min(1,(Date.now()-v.t0)/v.d);x=v.x0+(v.x1-v.x0)*p;y=v.y0+(v.y1-v.y0)*p;h=Math.sin(p*Math.PI)*46;}
    c.fillStyle='rgba(0,0,0,.18)';c.beginPath();c.ellipse(x-cx,y-cy,5,1.6,0,0,7);c.fill();dessinerMouette(c,x-cx,y-cy-h,!!MOUETTE.vol);
    if(MOUETTE.sandwich)emo(c,'🥪',x-cx+10,y-cy-h-8,7);if(MOUETTE.msg&&MOUETTE.msg.t>Date.now())bulle(c,x-cx,y-cy-h-18,MOUETTE.msg.s);}});
  /* le livreur en scooter */
  if(SCOOT.on)L.push({y:SCOOT.y,f:(c,cx,cy)=>{const x=SCOOT.x-cx,y=SCOOT.y-cy;R(c,x-12,y-10,24,7,'#e8402a');c.fillStyle='#1a1c22';c.beginPath();c.arc(x-9,y-2,3.4,0,7);c.arc(x+9,y-2,3.4,0,7);c.fill();R(c,x-14,y-24,12,12,'#c8302a');txt(c,'PIZZA',x-8,y-18,3,'#fff','center','900');
    personne(c,x+2,y-6,AP.livreur,'bas',0,false);if(SCOOT.msg&&SCOOT.msg.t>Date.now())bulle(c,x,y-46,SCOOT.msg.s);}});
  /* le contenu du container mystère */
  for(const p of MYST.parts){const a=(Date.now()-p.t0)/1000;if(a>4)continue;const x=p.x+p.vx*a,y=p.y+p.vy*a+60*a*a;L.push({y:670,f:(c,cx,cy)=>emo(c,p.e,x-cx,Math.min(y,p.sol)-cy,9)});}
  if(MYST.mime>Date.now())L.push({y:690,f:(c,cx,cy)=>{const x=462-cx,y=690-cy;personne(c,x,y,AP.mime,'bas',0,false);const k=Math.sin(t*4)*2;R(c,x-12+k,y-30,2,20,'rgba(255,255,255,.5)');bulle(c,x,y-42,'(mur invisible)');}});
  /* le karaoké : tomates et fleurs */
  for(const j of KARA.jets){const p=(Date.now()-j.t0)/600;if(p>1.6)continue;const q=Math.min(1,p);const x=j.x0+(462-j.x0)*q,y=j.y0+(424-j.y0)*q-Math.sin(q*Math.PI)*24;L.push({y:470,f:(c,cx,cy)=>emo(c,j.e,x-cx,y-cy-10,8)});}
  /* la pétanque : cochonnet et boules */
  L.push({y:512,f:(c,cx,cy)=>{if(PET.coch){c.fillStyle='#f2c43a';c.beginPath();c.arc(PET.coch.x-cx,PET.coch.y-cy,1.8,0,7);c.fill();}
    for(const b of PET.boules){const p=Math.min(1,(Date.now()-b.t0)/600);const x=b.x0+(b.x-b.x0)*p,y=b.y0+(b.y-b.y0)*p-Math.sin(p*Math.PI)*22;c.fillStyle=b.moi?'#c8ccd4':'#7a5a3a';c.beginPath();c.arc(x-cx,y-cy,3,0,7);c.fill();c.fillStyle='rgba(255,255,255,.5)';c.fillRect(x-cx-1.5,y-cy-1.5,1.2,1.2);}}});
  /* le chariot sous le joueur, pendant la course */
  if(COURSE.on)L.push({y:joueur.y-.5,f:(c,cx,cy)=>dessinerChariot(c,joueur.x-cx,joueur.y-cy+4,joueur.dir==='gauche'?'gauche':'droite')});
  /* les émotes, au-dessus du joueur */
  if(EMOTE&&EMOTE.fin>Date.now())L.push({y:joueur.y+1,f:(c,cx,cy)=>{const x=joueur.x-cx,y=joueur.y-cy;
    if(EMOTE.k==='applaudir'){emo(c,'👏',x+(Math.sin(t*14)>0?-6:6),y-44,10);}
    if(EMOTE.k==='pleurer'){for(let k=0;k<6;k++){const a=((Date.now()/400)+k/6)%1;c.fillStyle='rgba(90,160,255,.9)';c.fillRect(x+(k%2?3:-3)+(k%2?1:-1)*a*8,y-30+a*14,1.6,2.6);}emo(c,'😭',x,y-46,10);}
    if(EMOTE.k==='mouette'){bulle(c,x,y-44,'KIAAA KIAAA !');emo(c,'🕊️',x+(Math.sin(t*4)*10),y-60,9);}
    if(EMOTE.k==='danse'){for(let k=0;k<3;k++)emo(c,'🎵',x-12+k*12,y-44-Math.sin(t*6+k)*4,8);}}});
  if(VENT>Date.now())L.push({y:joueur.y+2,f:(c,cx,cy)=>{for(let k=0;k<10;k++){const a=((Date.now()/300)+k/10)%1;c.fillStyle='rgba(255,255,255,.7)';c.fillRect(joueur.x-cx-60+a*120,joueur.y-cy-40+hA(k,2,1)*40,14,1.2);}bulle(c,joueur.x-cx,joueur.y-cy-44,'AAAAH LE MISTRAL');}});
  return L;}
/* ---------- LE PAS DU MONDE (appelé à chaque image) ---------- */
let TL=performance.now(),DERN_TRI=0;
function pas(){const n=performance.now(),dt=Math.min(.05,(n-TL)/1000);TL=n;let bouge=false;
  /* Dédé fait les cent pas */
  if(DEDE.etat==='marche'){const cible=DEDE.dir==='droite'?400:322;const d=cible-DEDE.x;DEDE.x+=Math.sign(d)*Math.min(Math.abs(d),dt*26);DEDE.pas+=dt*8;bouge=true;
    if(Math.abs(d)<1)DEDE.dir=DEDE.dir==='droite'?'gauche':'droite';
    if(DEDE.banane&&Math.abs(DEDE.x-DEDE.banane.x)<4){DEDE.etat='glisse';DEDE.t=Date.now();vib([20,40,20]);mot('🍌 Dédé a glissé !');setTimeout(()=>{DEDE.banane=null;DEDE.etat='marche';DEDE.msg={s:'C’est qui le rigolo ?!',t:Date.now()+2500};},2600);}}
  /* la mouette : elle guette ton sandwich */
  if(!MOUETTE.vol){const d=Math.hypot(joueur.x-MOUETTE.x,joueur.y-MOUETTE.y);
    if(SANDWICH&&!MOUETTE.sandwich&&d<26&&Date.now()>MOUETTE.repos&&!(window.FP_GEL>Date.now())){SANDWICH=false;MOUETTE.sandwich=true;MOUETTE.essais=0;majSandwich();vib([30,40,30]);mot('🐦 La mouette t’a volé ton sandwich !');envolerMouette();}
    else if(!MOUETTE.sandwich&&d>60&&Math.random()<dt*.15&&SANDWICH)allerVers(joueur.x+(Math.random()*60-30),joueur.y-20);}
  else if(Date.now()-MOUETTE.vol.t0>=MOUETTE.vol.d){MOUETTE.x=MOUETTE.vol.x1;MOUETTE.y=MOUETTE.vol.y1;MOUETTE.vol=null;bouge=true;}
  /* le scooter */
  if(SCOOT.on&&SCOOT.cible){const c=SCOOT.cible(),dx=c.x-SCOOT.x,dy=c.y-SCOOT.y,d=Math.hypot(dx,dy);if(d>3){const v=Math.min(d,dt*110);SCOOT.x+=dx/d*v;SCOOT.y+=dy/d*v;}else{const cb=SCOOT.cb;SCOOT.cible=null;SCOOT.cb=null;cb&&cb();}}
  /* la course de chariots */
  if(COURSE.on){const f=FLAGS[COURSE.k];if(Math.hypot(joueur.x-f[0],joueur.y-f[1])<22){vib(15);COURSE.k++;if(COURSE.k>=FLAGS.length)COURSE.k=-1;mot(COURSE.k<0?'Retour à la ligne !':'Drapeau '+(COURSE.k+1)+' !');}
    if(COURSE.k<0&&Math.abs(joueur.y-800)<12&&Math.abs(joueur.x-400)<44)finCourse();majChrono();}
  /* le mistral pousse */
  if(VENT>Date.now()){const nx=joueur.x+dt*90;if(!bloque(nx,joueur.y))joueur.x=nx;}
  if(bouge&&n-DERN_TRI>120){DERN_TRI=n;for(const o of DECOR){if(o.suit==='dede'){o.x=DEDE.x;o.y=DEDE.y;}if(o.suit==='mouette'){o.x=MOUETTE.x;o.y=MOUETTE.y;}}DECOR.sort((a,b)=>a.y-b.y);try{invaliderGrille();}catch(x){}}
  /* la sortie, en haut */
  if(!SORTI&&joueur.y<140){SORTI=true;try{sauver();}catch(x){}location.href='spawn.html?t='+Date.now();}
  return [];}
let SORTI=false;
function allerVers(x,y,d){x=Math.max(X0+6,Math.min(X1-6,x));y=Math.max(150,Math.min(1040,y));MOUETTE.vol={x0:MOUETTE.x,y0:MOUETTE.y,x1:x,y1:y,t0:Date.now(),d:d||1100};}
function envolerMouette(){let x,y,k=0;do{x=X0+10+Math.random()*(X1-X0-20);y=Math.max(170,Math.min(1030,joueur.y+(Math.random()*200-100)));k++;}while(Math.hypot(x-joueur.x,y-joueur.y)<70&&k<20);allerVers(x,y,1300);}
function majSandwich(){let b=document.getElementById('labSand');if(!b){b=document.createElement('div');b.id='labSand';b.style.cssText='position:fixed;left:12px;top:calc(env(safe-area-inset-top,0px) + 118px);z-index:2147481000;background:rgba(10,12,20,.82);color:#fff;border-radius:12px;padding:4px 10px;font:800 13px "Baloo 2",sans-serif;pointer-events:none';document.body.appendChild(b);}
  b.textContent=SANDWICH?'🥪 ton sandwich':'🥪 volé ! attrape la mouette';}
/* ---------- LES INTERACTIONS ---------- */
const gel=on=>{window.FP_GEL=on?Date.now()+86400000:0;};
async function dire(nom,a,texte,choix){return dialogue({nom,ap:a,texte,choix:choix||['…']});}
/* 📰 le kiosque */
async function kiosque(){const U=LS('quai_une'),L=LS('labo_unes')||[];
  const d=document.createElement('div');d.style.cssText='position:fixed;inset:0;z-index:2147482700;background:rgba(10,12,16,.6);display:grid;place-items:center;padding:20px';
  const tit=(U&&U.titre)||'« Le port attend son héros »';
  d.innerHTML='<div style="background:#f4efe2;color:#1a1a1a;max-width:360px;width:100%;border-radius:6px;padding:18px 16px;font-family:Georgia,serif;box-shadow:0 20px 50px rgba(0,0,0,.5);transform:rotate(-1.2deg)"><div style="text-align:center;font:900 30px Georgia,serif;letter-spacing:.04em;border-bottom:3px double #1a1a1a;padding-bottom:4px">LE QUAI</div><div style="display:flex;justify-content:space-between;font:700 10px sans-serif;margin:4px 0 10px;color:#555"><span>MARSEILLE</span><span>'+new Date().toLocaleDateString('fr-FR')+'</span><span>1,20 €</span></div><div style="font:900 21px/1.15 Georgia,serif">'+tit+'</div><div style="height:70px;margin:10px 0;background:repeating-linear-gradient(90deg,#d8d0c0 0 4px,#cfc6b4 4px 8px);border:1px solid #bbb;display:grid;place-items:center;font:italic 12px Georgia;color:#666">(photo floue d’un docker)</div>'+
    (L.length?'<div style="font:700 11px sans-serif;color:#c8402e;margin-bottom:4px">EN BREF</div>'+L.slice(0,5).map(x=>'<div style="font:700 13px/1.3 Georgia;border-top:1px solid #ccc;padding:5px 0">'+x.t+'</div>').join(''):'<div style="font:italic 13px Georgia;color:#666">Rien d’autre ce matin. Fais parler de toi dans le Labo.</div>')+
    '<button style="margin-top:12px;width:100%;border:0;border-radius:10px;padding:10px;background:#1a1a1a;color:#fff;font:800 14px sans-serif">Replier le journal</button></div>';
  document.body.appendChild(d);d.querySelector('button').onclick=()=>d.remove();}
/* 📺 Mistral TV */
async function tv(){const i=await dire('Mistral TV',null,'Quelle émission tu veux faire ?',['❓ Questions pour un docker','🍳 Top Docker (cuisine)','🌬️ La météo en direct','Rien']);
  if(i===0)return quiz();if(i===1)return cuisine();if(i===2)return meteo();}
async function quiz(){gel(1);const Q=[['Combien de bras a une grue portique ?',['Un seul, mais costaud','Quatre','Ça dépend de son humeur'],0],
  ['Que dit-on quand le mistral souffle à 100 km/h ?',['« Il fait frais »','« Ça rafraîchit »','Les deux, et on reste en t-shirt'],2],
  ['Quel est le meilleur ami du docker ?',['La mouette','Le café','Le chef d’équipe'],1],
  ['Un container fait combien de pieds ?',['20 ou 40','12, comme un mille-pattes paresseux','Aucun, il ne marche pas'],0]];let sc=0;
  await dire('Gilbert',AP.gilbert,'« Bonsoir bonsoir ! Bienvenue dans <b>Questions pour un docker</b> ! Quatre questions, un champion. Top ! »');
  for(const [q,c,b] of Q){const r=await dire('Gilbert',AP.gilbert,'« '+q+' »',c);if(r===b){sc++;mot('✅ Bonne réponse !');}else mot('❌ Raté…');await pause(500);}
  await dire('Gilbert',AP.gilbert,sc===4?'« QUATRE SUR QUATRE ! Vous repartez avec le dictionnaire et un porte-clés grue ! »':sc>=2?'« '+sc+' sur 4 ! Honorable ! On vous offre la version de poche du jeu. »':'« '+sc+' sur 4… On vous raccompagne, avec le sourire. »',['Merci Gilbert']);
  if(sc===4)une('« Un docker rafle tout à Questions pour un docker »');gel(0);}
async function cuisine(){gel(1);await dire('Chef Toinou',AP.chef,'« Bienvenue dans <b>Top Docker</b> ! Ce soir : la bouillabaisse. Rate le moins possible. »');
  const a=await dire('Chef Toinou',AP.chef,'« D’abord, le poisson ? »',['Des rascasses, comme il faut','Des bâtonnets panés','Une sardine, toute seule, pour le symbole']);
  const b=await dire('Chef Toinou',AP.chef,'« Le bouillon, tu le chauffes comment ? »',['Doucement, avec amour','Au chalumeau de l’atelier','Je le laisse au soleil sur le quai']);
  const c=await dire('Chef Toinou',AP.chef,'« Et pour finir ? »',['Rouille et croûtons','Ketchup','Je goûte… et je rajoute de l’eau']);
  const s=[a===0,b===0,c===0].filter(Boolean).length;
  await dire('Chef Toinou',AP.chef,s===3?'« Mais… c’est excellent ! Tu as raté ta vocation ! »':s===2?'« Mangeable. Ta grand-mère serait presque fière. »':s===1?'« J’ai goûté. J’ai prié. »':'« Je… je vais appeler les pompiers, c’est plus prudent. »',['Merci chef']);
  if(s===3)une('« Top Docker : la bouillabaisse du siècle sort du port »');if(s===0)une('« Top Docker : les pompiers appelés sur le plateau »');gel(0);}
async function meteo(){gel(1);await dire('La régie',null,'« Antenne dans 3, 2, 1… Tu présentes la météo en direct. Souris ! »',['Bonsoir Marseille !']);
  const i=await dire('Toi, à l’antenne',null,'Ce soir sur Marseille…',['Grand soleil, aucun vent !','Un petit mistral, rien de grave','Tempête, tout le monde à l’abri']);
  gel(0);VENT=Date.now()+2600;vib([60,40,60]);mot('🌬️ Le mistral t’emporte en plein direct !');await pause(2700);
  await dire('La régie',null,i===0?'« « Aucun vent », hein ? 4 millions de gens t’ont vu t’envoler. Tu es la vidéo la plus vue de la semaine. »':i===1?'« Un petit mistral… On t’a cherché dix minutes. »':'« Au moins, tu avais prévenu. Bravo pour l’honnêteté ! »',['Je reviens…']);
  une('« Météo : le présentateur emporté par le mistral en direct »');}
/* 🐟 Fanfan et sa sardine */
async function sardines(){const i=await dire('Fanfan',AP.fanfan,'« Approche, petit ! Tu sais que c’est une sardine qui a bouché le Vieux-Port ? Une seule ! »',['N’importe quoi.','Je te crois, Fanfan.','Elle était grosse comment ?']);
  if(i===0){const j=await dire('Fanfan',AP.fanfan,'« N’importe quoi ?! Mon grand-père l’a vue ! Elle faisait trois mètres ! Quatre, même ! »',['Hier tu disais deux.','D’accord, d’accord.']);
    if(j===0)await dire('Fanfan',AP.fanfan,'« Hier elle était plus jeune. Elles grandissent, les sardines. »',['…']);}
  else if(i===1)await dire('Fanfan',AP.fanfan,'« Enfin quelqu’un d’intelligent ! Tiens, prends-en une, elle est de la famille. »',['Merci ?']);
  else await dire('Fanfan',AP.fanfan,'« Grosse comme un bus. Un bus avec des écailles. Et elle chantait. »',['Elle chantait quoi ?']).then(()=>dire('Fanfan',AP.fanfan,'« Ça, mon petit, c’est un secret de famille. »',['…']));}
/* 🗣️ Gégé et la mauvaise foi */
const THESES=[['L’OM a perdu à cause du vent.',['Le vent soufflait pour les deux équipes.','C’était un vent marseillais, il nous aimait trop.','Le vent n’existe pas, c’est un complot des Parisiens.']],
  ['Le pastis, c’est plus rafraîchissant que l’eau.',['L’eau, c’est mieux pour la santé.','L’eau, c’est du pastis qui a oublié de se maquiller.','Les poissons boivent de l’eau, et regarde leur tête.']],
  ['Marseille, c’est plus grand que Paris.',['Non, Paris a plus d’habitants.','Marseille, c’est grand dans le cœur.','Si tu comptes la mer, on gagne largement.']]];
async function gege(){gel(1);const [th,ar]=ALEA(THESES);let pts=0;
  await dire('Gégé',AP.gege,'« Concours de mauvaise foi ! Ma thèse : '+th+' Contredis-moi, si tu l’oses. »',['Je relève le défi']);
  const i=await dire('Toi',null,'Ton argument :',ar);pts+=[0,1,2][i];
  const j=await dire('Gégé',AP.gege,'« '+(i===0?'Un argument logique ? Ici ? Honteux !':i===1?'Pas mal, pas mal…':'… Je… j’avoue que je n’ai rien à répondre.')+' Mais j’ai une preuve : mon cousin. »',['Ton cousin n’est pas une preuve.','Mon cousin à moi dit le contraire.','J’ai deux cousins, j’ai gagné.']);pts+=[0,1,2][j];
  await pause(300);const gagne=pts>=3;
  await dire('Le public',null,gagne?'👏 Le public tranche : <b>victoire de la mauvaise foi</b> ! Gégé est vexé.':'🍅 Le public tranche : Gégé gagne. Tu as été beaucoup trop honnête.',['OK']);
  if(gagne)une('« Concours de mauvaise foi : Gégé battu sur son propre terrain »');gel(0);}
/* 🛟 la bouée pour Momo */
async function bouee(){if(BOUEE.vol)return;gel(1);const p=await jauge('Vise Momo !',2.8);gel(0);
  BOUEE.vol={x0:330,y0:408,x1:p>.65?272:(p>.35?254:330),y1:p>.65?430:(p>.35?448:190),t0:Date.now()};await pause(750);
  if(p>.65){BOUEE.dans=Date.now()+6000;BOUEE.msg={s:'Sauvé ! (et vexé)',t:Date.now()+3000};une('« Sauvetage parfait sur le quai : Momo vexé mais vivant »');}
  else if(p>.35)BOUEE.msg={s:'À côté ! Je nage…',t:Date.now()+3000};
  else{BOUEE.msg={s:'Elle est partie où ?!',t:Date.now()+3000};mot('La bouée est partie sur la mouette 🐦');}}
/* 🎤 le karaoké */
const CHANSONS=[['Le mistral de mon cœur','Il souffle, il souffle, il emporte mon cœur… et mon chapeau'],
  ['Docker un jour, docker toujours','Je soulève des boîtes, et toi tu soulèves mon âme'],['La sardine qui chantait faux','Elle chantait faux, mais elle chantait fort, ô sardine !']];
async function karaoke(){if(KARA.on)return;const i=await dire('Le karaoké',null,'Choisis ta chanson :',CHANSONS.map(c=>'🎵 '+c[0]).concat(['Non merci']));if(i>=3)return;
  gel(1);KARA.on=true;mot('🎤 « '+CHANSONS[i][1]+' »');await pause(900);let s=0;
  for(let k=0;k<3;k++){s+=await jauge(['Le couplet !','Le refrain !','La note finale !'][k],2.4+k*.6);}
  s/=3;const fl=s>.6;for(let k=0;k<10;k++)KARA.jets.push({e:fl?(k%2?'🌹':'🌸'):'🍅',x0:436+Math.random()*56,y0:470,t0:Date.now()+k*90});
  await pause(1600);KARA.jets=[];KARA.on=false;gel(0);
  await dire('Le public',null,s>.85?'🌹 Standing ovation ! On t’appelle « la Voix du port ».':fl?'🌸 Des fleurs ! Le public a aimé (enfin, presque tout le monde).':'🍅 Pluie de tomates. Au moins, tu repars avec de quoi faire une sauce.',['Saluer']);
  if(s>.85)une('« Karaoké : la Voix du port fait pleurer le quai »');}
/* 🎯 la pétanque contre Marius */
async function petanque(){gel(1);PET.boules=[];PET.coch={x:400+Math.random()*30-15,y:528};let moi=0,lui=0;
  await dire('Marius',AP.marius,'« Une partie ? Trois boules chacun. Et je te préviens : je ne triche jamais. Presque. »',['On y va']);
  for(let k=0;k<3;k++){const p=await jauge('Ta boule n°'+(k+1),2.6+k*.4);const d=(1-p)*34+Math.random()*4,a=Math.random()*7;
    PET.boules.push({moi:true,x0:400,y0:600,x:PET.coch.x+Math.cos(a)*d,y:PET.coch.y+Math.sin(a)*d*.5,t0:Date.now(),d});await pause(700);
    const dl=6+Math.random()*24,b2=Math.random()*7;PET.boules.push({moi:false,x0:456,y0:540,x:PET.coch.x+Math.cos(b2)*dl,y:PET.coch.y+Math.sin(b2)*dl*.5,t0:Date.now(),d:dl});await pause(800);}
  const bm=Math.min(...PET.boules.filter(b=>b.moi).map(b=>b.d)),bl=Math.min(...PET.boules.filter(b=>!b.moi).map(b=>b.d));
  PET.msg={s:'Elle est à moi !',t:Date.now()+3000};
  const c=await dire('Marius',AP.marius,'« '+(bm<bl?'Hmm. Celle-là… je mesure avec mon pied. Elle est à moi.':'Ha ! Elle est à moi, c’est évident !')+' »',['On mesure au mètre.','Je mesure avec une sardine.','Laisse tomber, Marius.']);
  let gagne=bm<bl;if(c===1)gagne=Math.random()<.5;if(c===2)gagne=false;
  await dire('Marius',AP.marius,c===1?(gagne?'« La sardine a parlé… Tu gagnes. Mais je conteste. »':'« La sardine est formelle : c’est moi ! »'):gagne?'« … Bon. D’accord. Mais le terrain penchait. »':'« Victoire de Marius ! Comme d’habitude ! »',['Revanche plus tard']);
  if(gagne)une('« Pétanque : Marius battu, il accuse le terrain »');setTimeout(()=>{PET.boules=[];PET.coch=null;},4000);gel(0);}
/* 😴 Bébert qui dort */
async function bebert(){if(BEBERT.reveil>Date.now())return;const i=await dire('Bébert',AP.bebert,'Bébert dort sur sa palette. Il ronfle comme un cargo.',['📯 Klaxon','🪣 Seau d’eau','⏰ Réveil qui chante','Le laisser dormir']);
  if(i===3){mot('Chut… 😴');return;}vib([40,30,40]);BEBERT.reveil=Date.now()+5200;
  if(i===0)BEBERT.quoi='QUOI ?! LE BATEAU EST LÀ ?!';if(i===1){BEBERT.eau=Date.now()+1400;BEBERT.quoi='JE NAGE ! JE NAGE !';}if(i===2){BEBERT.notes=Date.now()+5000;BEBERT.quoi='Maman, c’est toi ?';}
  await pause(2600);await dire('Bébert',AP.bebert,ALEA(['« Je dormais pas, je vérifiais l’intérieur de mes paupières. »','« Je me reposais les yeux. Pour mieux bosser. »','« Si le chef demande, j’étais en réunion. »']),['Bien sûr, Bébert']);}
/* 📦 le container mystère */
const MYSTERES=[['🦆','Mille canards en plastique !'],['🍍','Des ananas. Beaucoup d’ananas.'],['mime','Un mime. Il est coincé dans une boîte invisible.'],['🐟','Des sardines. Fanfan dit que c’est sa famille.']];
async function container(){const jour=new Date().toDateString(),deja=LS('labo_myst')===jour;
  if(MYST.ouv){const i=await dire('Le container',null,'Déjà ouvert'+(deja?' aujourd’hui':'')+'. (Mode test : tu peux recommencer.)',['Refermer et rouvrir','Laisser']);if(i===1)return;MYST.ouv=false;await pause(300);}
  LS('labo_myst',jour);MYST.ouv=true;MYST.t=now();vib([20,60,20]);const [e,t]=ALEA(MYSTERES);mot('📦 '+t);
  if(e==='mime')MYST.mime=Date.now()+7000;else{MYST.parts=[];for(let k=0;k<16;k++)MYST.parts.push({e,x:460,y:640,vx:(Math.random()-.5)*90,vy:-60-Math.random()*60,t0:Date.now()+k*60,sol:680+Math.random()*30});}
  if(e==='🦆')une('« Mystère sur le port : mille canards en plastique sortent d’un container »');}
/* 🏁 la course de chariots */
function majChrono(){let b=document.getElementById('labChrono');if(!COURSE.on){if(b)b.remove();return;}
  if(!b){b=document.createElement('div');b.id='labChrono';b.style.cssText='position:fixed;left:50%;top:calc(env(safe-area-inset-top,0px) + 74px);transform:translateX(-50%);z-index:2147481000;background:rgba(10,12,20,.88);color:#fff;border-radius:14px;padding:5px 14px;font:800 14px "Baloo 2",sans-serif;pointer-events:none;white-space:nowrap';document.body.appendChild(b);}
  const t=((Date.now()-COURSE.t0)/1000).toFixed(1).replace('.',','),rec=LS('labo_chariot');b.innerHTML='🏁 '+t+' s · '+(COURSE.k<0?'retour à la ligne':'drapeau '+(COURSE.k+1)+'/4')+(rec?' · record '+rec.toFixed(1).replace('.',',')+' s':'');}
async function chariot(){if(COURSE.on){const i=await dire('Chariot',null,'Abandonner la course ?',['Oui, je descends','Non, je continue']);if(i===0){COURSE.on=false;majChrono();}return;}
  const i=await dire('Le chef de quai',AP.bebert,'« Course de chariots ! Passe les 4 drapeaux dans l’ordre et reviens à la ligne. Le chrono part quand tu montes. »',['Monter dans le chariot','Plus tard']);if(i)return;
  try{joueur.x=400;joueur.y=806;}catch(x){}COURSE.on=true;COURSE.k=0;COURSE.t0=Date.now();mot('3, 2, 1… PARTEZ ! 🏁');vib([20,80,20]);}
function finCourse(){const t=(Date.now()-COURSE.t0)/1000;COURSE.on=false;majChrono();const rec=LS('labo_chariot');const nouveau=!rec||t<rec;if(nouveau)LS('labo_chariot',t);
  vib([30,50,30,50,30]);dire('Le chef de quai',AP.bebert,'« '+t.toFixed(1).replace('.',',')+' secondes ! '+(nouveau?'NOUVEAU RECORD DU QUAI !':'Le record tient toujours : '+rec.toFixed(1).replace('.',',')+' s.')+' »',['Encore !']);
  if(nouveau)une('« Course de chariots : record du quai pulvérisé en '+t.toFixed(1).replace('.',',')+' s »');}
/* 🍌 les farces à Dédé */
async function dede(){const i=await dire('Dédé',AP.dede,'Dédé fait les cent pas en parlant tout seul de son match de foot.',['🍌 Poser une peau de banane','🍕 Lui envoyer une pizza','Lui dire bonjour']);
  if(i===0){if(DEDE.banane){mot('Il y en a déjà une !');return;}const bx=DEDE.dir==='droite'?Math.min(396,DEDE.x+44):Math.max(326,DEDE.x-44);DEDE.banane={x:bx,y:DEDE.y};mot('🍌 Banane posée… attends.');}
  if(i===1){if(SCOOT.on){mot('Le livreur est déjà en route');return;}livrer(()=>({x:DEDE.x+16,y:DEDE.y}),async()=>{DEDE.etat='stop';SCOOT.msg={s:'Pizza pour Dédé !',t:Date.now()+2200};await pause(1500);
    DEDE.msg={s:'J’ai rien commandé !',t:Date.now()+2200};await pause(2200);DEDE.msg={s:'… bon, je la mange.',t:Date.now()+2400};DEDE.mange=Date.now()+5000;await pause(1200);repartir();DEDE.etat='marche';});mot('🛵 Le livreur arrive chez Dédé…');}
  if(i===2)await dire('Dédé',AP.dede,'« Salut ! Tu as vu le match ? L’arbitre, je te jure… »',['(t’éloigner doucement)']);}
/* 🛵 la livraison (pizza du téléphone ou farce) */
function livrer(cible,cb){SCOOT.on=true;SCOOT.x=400;SCOOT.y=150;SCOOT.cible=cible;SCOOT.cb=cb;}
function repartir(){SCOOT.cible=()=>({x:400,y:120});SCOOT.cb=()=>{SCOOT.on=false;};}
window.LABO.pizza=function(nom){if(SCOOT.on)return false;livrer(()=>({x:joueur.x+18,y:joueur.y}),async()=>{gel(1);const faux=Math.random()<1/3;
  const r=await dire('Le livreur',AP.livreur,faux?'« Une pizza ananas-sardine, c’est bien vous ? … Non ? Bah c’est ce qu’il y a. »':'« Une '+nom+' ! Désolé pour le retard, y avait une mouette sur le scooter. »',faux?['Je prends quand même','Je rappelle la pizzeria']:['Merci !']);
  if(faux&&r===1)await dire('Le livreur',AP.livreur,'« Ils vont vous dire que c’est une spécialité. »',['…']);gel(0);repartir();mot('🍕 Miam.');});return true;};
/* 🐦 la mouette : l'attraper */
async function mouette(){if(MOUETTE.vol)return;if(!MOUETTE.sandwich){MOUETTE.msg={s:'KIAAA',t:Date.now()+1200};return;}
  MOUETTE.essais++;vib(20);if(MOUETTE.essais<3){MOUETTE.msg={s:'Trop lent !',t:Date.now()+1200};mot('Raté ! Elle s’envole encore ('+MOUETTE.essais+'/3)');envolerMouette();return;}
  MOUETTE.sandwich=false;SANDWICH=true;MOUETTE.repos=Date.now()+30000;majSandwich();mot('🥪 Sandwich récupéré ! (un peu picoré)');une('« Course-poursuite sur le quai : un docker reprend son sandwich à une mouette »');allerVers(440,170,1500);}
/* ---------- LES ÉMOTES : un bouton à part, au-dessus du menu ---------- */
function poserEmotes(){if(document.getElementById('labEmo'))return;const b=document.createElement('button');b.id='labEmo';b.textContent='😀';
  b.style.cssText='position:fixed;right:14px;bottom:calc(84px + env(safe-area-inset-bottom));z-index:2147481900;width:54px;height:54px;border-radius:18px;border:0;background:#fff;font-size:26px;box-shadow:0 4px 0 #c8bfa8,0 8px 18px rgba(0,0,0,.25)';
  b.onclick=async()=>{vib(8);const i=await dialogue({nom:'Émotes',ap:null,texte:'Exprime-toi :',choix:['💃 Danser','👏 Applaudir','😭 Pleurer','🐦 Faire la mouette','Fermer']});
    const K=['danse','applaudir','pleurer','mouette'][i];if(!K)return;EMOTE={k:K,fin:Date.now()+3500};
    if(K==='danse'){const D=['bas','gauche','haut','droite'];let k=0;const it=setInterval(()=>{k++;try{joueur.dir=D[k%4];}catch(x){}if(Date.now()>EMOTE.fin){clearInterval(it);try{joueur.dir='bas';}catch(x){}}},160);}};
  document.body.appendChild(b);}
/* ---------- LE TÉLÉPHONE SONNE (mauvais numéro), une fois ---------- */
setTimeout(async()=>{try{if(!window.ouvrirLeTelephone)eval(await chargerMorceau('telephone.js'));}catch(x){}},1500);
setTimeout(function sonner(){if(document.getElementById('blcDia')||window.FP_GEL>Date.now())return setTimeout(sonner,8000);
  const t=document.createElement('button');t.style.cssText='position:fixed;left:50%;top:calc(env(safe-area-inset-top,0px) + 120px);transform:translateX(-50%);z-index:2147482500;border:0;border-radius:18px;padding:10px 18px;background:#34c759;color:#fff;font:800 15px "Baloo 2",sans-serif;box-shadow:0 8px 20px rgba(0,0,0,.3);animation:labSonne .5s infinite alternate';
  t.textContent='📞 Numéro inconnu… Décrocher';if(!document.getElementById('labCss')){const s=document.createElement('style');s.id='labCss';s.textContent='@keyframes labSonne{from{transform:translateX(-50%) rotate(-2deg)}to{transform:translateX(-50%) rotate(2deg)}}';document.head.appendChild(s);}
  vib([200,100,200]);t.onclick=()=>{t.remove();window.appelEntrant&&window.appelEntrant('inconnu');};document.body.appendChild(t);setTimeout(()=>t.remove(),15000);},30000);
/* ---------- LE DÉCOR ---------- */
function decor(){const D=[];const P=(a,x,y,o)=>D.push(Object.assign({t:'x_jol_lab_'+a+'_sol',x,y,gr:0,anim:'lab_'+a},o||{}));
  P('kiosque',345,210,{col:[40,8],agir:kiosque,libelle:'Lire le journal',nom:'LE KIOSQUE DU QUAI',demi:36});
  P('tv',460,210,{col:[24,6],agir:tv,libelle:'Passer à la télé',nom:'MISTRAL TV',demi:36});
  P('etal',345,320,{col:[44,8],agir:sardines,libelle:'Parler à Fanfan',nom:'LES SARDINES',demi:36});
  P('caisse',460,320,{col:[24,6],agir:gege,libelle:'Défier Gégé',nom:'MAUVAISE FOI',demi:36});
  P('bouee',330,430,{col:[10,4],agir:bouee,libelle:'Lancer la bouée',nom:'MOMO EST À L’EAU',demi:36});
  P('micro',460,430,{col:[30,6],agir:karaoke,libelle:'Chanter',nom:'KARAOKÉ',demi:36});
  D.push({t:'x_jol_lab_vide_sol',x:400,y:600,gr:0,agir:petanque,libelle:'Jouer aux boules',nom:'PÉTANQUE AVEC MARIUS',demi:40});
  P('palette',345,660,{col:[40,6],agir:bebert,libelle:'Réveiller Bébert',nom:'BÉBERT DORT',demi:36});
  P('container',460,660,{col:[56,10],agir:container,libelle:'Ouvrir',nom:'LE CONTAINER MYSTÈRE',demi:40});
  D.push({t:'x_jol_lab_vide_sol',x:345,y:742,gr:0,suit:'dede',agir:dede,libelle:'Faire une farce',nom:'DÉDÉ',demi:36});
  P('chariot',460,770,{col:[32,6],agir:chariot,libelle:'Course de chariots',nom:'LE CHARIOT',demi:36});
  FLAGS.forEach(([x,y],k)=>P('drapeau',x,y,{k}));
  D.push({t:'x_jol_lab_vide_sol',x:440,y:170,gr:0,suit:'mouette',agir:mouette,libelle:'Attraper la mouette',nom:'LA MOUETTE',demi:30});
  return D;}
function bloque(x,y){if(x<X0||x>X1)return true;if(y<126||y>1050)return true;
  for(const o of DECOR){if(!o.col)continue;if(Math.abs(x-o.x)<o.col[0]/2&&y>o.y-o.col[1]&&y<o.y+3)return true;}return false;}
function graver(){return {toile:document.createElement('canvas'),W:1,H:1,sol:0};}
setTimeout(()=>{majSandwich();poserEmotes();mot('🧪 Le Labo · balade-toi, tout se teste ici');},800);
return {sol,solFin,decor,bloque,graver,depart:DEPART,figurants:pas,acteurs};
})()
