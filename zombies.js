/* =====================================================================
   LES ZOMBIES DU PORT — un lieu à part (zombies.html) : le terminal de la
   Joliette, la nuit. On y joue avec son propre personnage, dans le même
   monde que la place : hangar, conteneurs empilés, fûts, bittes, quai et
   eau noire, réverbères, un fût qui brûle. Les zombies sont des gens du
   port, dessinés comme les autres, le teint verdi, les yeux qui luisent.
   Le joueur marche comme partout ; le tir vise tout seul ; une grenade
   pour les foules. Les vagues montent ; le Roi des Docks toutes les cinq.
   Le serveur tient la paie (zombies_partie, zombies_fin).
   Chargé par moteur.js (eval direct).
   ===================================================================== */
(()=>{
const W=1000,H=860,MUR=196,QUAI=752;
const DEPART=[500,560];
const PORTE={y0:470,y1:540};      /* le portail grillagé, à gauche : retour sur la place */
const rpcS=async(n,a)=>{try{if(typeof sb!=='undefined'&&sb&&sb.rpc){const q=await sb.rpc(n,a||{});return q.data!=null?q.data:(q.error?{erreur:q.error.message}:null);}return await appelRPC(n,a||{});}catch(x){return {erreur:'reseau'};}};
const hA=(x,y,k)=>{let n=((x*73856093)^(y*19349663)^(k*83492791))|0;n=(n^(n>>>13))*1274126177|0;return((n^(n>>>16))>>>0)/4294967296;};
const R=(g,x,y,w,h,c)=>{g.fillStyle=c;g.fillRect(x,y,w,h);};
const lin=(g,x0,y0,x1,y1,st)=>{const r=g.createLinearGradient(x0,y0,x1,y1);st.forEach(([o,c])=>r.addColorStop(o,c));return r;};
const rad=(g,x,y,r0,r1,st)=>{const r=g.createRadialGradient(x,y,r0,x,y,r1);st.forEach(([o,c])=>r.addColorStop(o,c));return r;};
function toile(L,HH){const D=2,c=document.createElement('canvas');c.width=Math.ceil(L*D);c.height=Math.ceil(HH*D);const g=c.getContext('2d');g.setTransform(D,0,0,D,0,0);return {c,g};}
const now=()=>performance.now()/1000;
/* les teints des morts-vivants, ajoutés à la palette le temps de la nuit */
const PZ=PALETTES.peau.length;PALETTES.peau.push('#8fb878','#7ea86a','#9cc488','#8a8ab0','#a0b070');

/* ---------- l'implantation ---------- */
const CONTS=[{x:236,y:356,w:150,c:'#b8432e',e:1,n:'MARSALIA'},{x:450,y:330,w:150,c:'#2e5f9a',e:2,n:'BATTLE LINES'},{x:742,y:350,w:150,c:'#3f7d4f',e:1,n:'PHOCÉE'},
  {x:860,y:560,w:120,c:'#c8862a',e:1,n:'MASSALIA'},{x:300,y:640,w:150,c:'#6a4a8a',e:2,n:'CALANQUES'},{x:600,y:660,w:120,c:'#a83a3a',e:1,n:'MARSALIA'},{x:120,y:610,w:110,c:'#2e7a8a',e:1,n:'FRIOUL'}];
const FUTS=[[520,470],[536,480],[506,486],[660,470],[180,470],[194,482]];
const FEU={x:560,y:500};           /* le fût qui brûle, au milieu du terminal */
const LAMPES=[[96,236],[368,236],[640,236],[912,236],[200,732],[700,732],[960,470],[40,700]];
const PALETTES_=[[880,430],[100,410]];
const CHARIOT={x:860,y:330};
const CONES=[[400,520],[424,526],[680,560],[150,720],[780,720]];
const VOLETS=[180,500,820];         /* les trois rideaux du hangar, d'où ils sortent */

/* ---------- LE SOL : le hangar, le bitume, les rails, le quai, l'eau ---------- */
function peindreSol(g){
  /* la façade du hangar : tôle ondulée, rouille, rideaux de fer */
  g.fillStyle=lin(g,0,0,0,MUR,[[0,'#2e3640'],[1,'#4a5662']]);g.fillRect(0,0,W,MUR);
  for(let x=0;x<W;x+=6){g.fillStyle='rgba(255,255,255,.05)';g.fillRect(x,0,2,MUR-24);g.fillStyle='rgba(0,0,0,.18)';g.fillRect(x+3,0,1.5,MUR-24);}
  for(let i=0;i<26;i++){const x=hA(i,1,3)*W,l=20+hA(i,2,3)*70;g.fillStyle=lin(g,0,30,0,30+l,[[0,'rgba(150,70,30,.45)'],[1,'rgba(150,70,30,0)']]);g.fillRect(x,30+hA(i,3,3)*40,3+hA(i,4,3)*4,l);}
  R(g,0,0,W,12,'#1a2028');R(g,0,12,W,3,'#5a6672');
  g.font='900 22px "Baloo 2",Arial';g.textAlign='center';g.textBaseline='middle';g.fillStyle='rgba(230,220,190,.75)';g.fillText('HANGAR 14 · JOLIETTE',W/2,40);g.fillStyle='rgba(230,220,190,.3)';g.fillRect(W/2-150,55,300,2);
  for(const cx of VOLETS){const x0=cx-74,y0=70,w=148,h=MUR-70-24;
    g.fillStyle='#14181e';g.fillRect(x0-6,y0-6,w+12,h+6);
    const ouv=cx===500?28:cx===820?12:0;
    g.fillStyle='#050608';g.fillRect(x0,y0+h-ouv,w,ouv);
    for(let y=y0;y<y0+h-ouv;y+=5){g.fillStyle=((y-y0)/5|0)%2?'#5a646e':'#4a545e';g.fillRect(x0,y,w,5);g.fillStyle='rgba(0,0,0,.25)';g.fillRect(x0,y+4,w,1);}
    g.fillStyle='rgba(120,60,30,.35)';for(let i=0;i<6;i++)g.fillRect(x0+hA(cx,i,1)*w,y0+hA(cx,i,2)*h*.6,2,20+hA(cx,i,3)*30);
    for(let i=0;i<w;i+=16){g.fillStyle=(i/16|0)%2?'#e8b81a':'#1a1a1a';g.beginPath();g.moveTo(x0+i,y0+h-ouv);g.lineTo(x0+i+16,y0+h-ouv);g.lineTo(x0+i+8,y0+h-ouv-8);g.lineTo(x0+i-8,y0+h-ouv-8);g.fill();}
    g.fillStyle='#2a3038';g.fillRect(x0-8,y0-14,w+16,10);g.fillStyle='#d8d0b8';g.font='800 9px "Baloo 2",Arial';g.fillText('QUAI '+(VOLETS.indexOf(cx)+1),cx,y0-9);
    /* des mains vertes sur le rideau entrouvert */
    if(ouv){g.fillStyle='rgba(120,190,90,.7)';for(const dx of [-40,-12,30]){g.beginPath();g.ellipse(cx+dx,y0+h-ouv-2,4,2.5,0,0,7);g.fill();for(let f=0;f<4;f++)g.fillRect(cx+dx-3+f*2,y0+h-ouv-7,1.2,4);}}}
  /* un tag, vite fait, sur la tôle */
  g.save();g.translate(330,150);g.rotate(-.12);g.font='900 26px "Baloo 2",Arial';g.lineWidth=3;g.strokeStyle='rgba(20,20,20,.6)';g.strokeText('FUYEZ',0,0);g.fillStyle='rgba(210,40,50,.75)';g.fillText('FUYEZ',0,0);g.restore();
  g.fillStyle=lin(g,0,MUR-24,0,MUR,[[0,'#3a4048'],[1,'#22272e']]);g.fillRect(0,MUR-24,W,24);
  /* LE BITUME : grain, fissures, taches d'huile, flaques */
  g.fillStyle='#363b42';g.fillRect(0,MUR,W,QUAI-MUR);
  for(let i=0;i<5000;i++){const x=hA(i,7,1)*W,y=MUR+hA(i,8,1)*(QUAI-MUR);g.fillStyle=hA(i,9,1)<.5?'rgba(255,255,255,.035)':'rgba(0,0,0,.09)';g.fillRect(x,y,1.5,1.5);}
  for(let i=0;i<22;i++){const x=hA(i,1,5)*W,y=MUR+20+hA(i,2,5)*(QUAI-MUR-40);g.fillStyle='rgba(10,12,16,.35)';g.beginPath();g.ellipse(x,y,14+hA(i,3,5)*30,6+hA(i,4,5)*12,hA(i,5,5)*3,0,7);g.fill();
    g.fillStyle='rgba(120,90,160,.06)';g.beginPath();g.ellipse(x+4,y-2,8,3,0,0,7);g.fill();}
  g.strokeStyle='rgba(10,10,12,.55)';g.lineWidth=1;for(let i=0;i<30;i++){let x=hA(i,1,6)*W,y=MUR+hA(i,2,6)*(QUAI-MUR);g.beginPath();g.moveTo(x,y);for(let k=0;k<5;k++){x+=(hA(i,k,7)-.5)*30;y+=(hA(i,k,8)-.5)*20;g.lineTo(x,y);}g.stroke();}
  /* les marquages : allées, places, flèches */
  g.fillStyle='rgba(230,190,40,.55)';for(let x=20;x<W-20;x+=48)g.fillRect(x,MUR+28,26,4);for(let x=20;x<W-20;x+=48)g.fillRect(x,QUAI-40,26,4);
  g.strokeStyle='rgba(240,240,230,.28)';g.lineWidth=2.5;for(let i=0;i<4;i++)g.strokeRect(620+i*86,MUR+48,74,40);
  g.fillStyle='rgba(240,240,230,.3)';for(const [x,y] of [[120,520],[880,640]]){g.beginPath();g.moveTo(x,y);g.lineTo(x+30,y);g.lineTo(x+30,y-8);g.lineTo(x+46,y+5);g.lineTo(x+30,y+18);g.lineTo(x+30,y+10);g.lineTo(x,y+10);g.closePath();g.fill();}
  /* les rails, qui traversent le terminal */
  for(const y of [436,456]){g.fillStyle='#5a4a3c';g.fillRect(0,y,W,3);}for(let x=0;x<W;x+=16){g.fillStyle='#3a2e24';g.fillRect(x,430,8,34);g.fillStyle='rgba(0,0,0,.25)';g.fillRect(x,462,8,2);}
  for(const y of [436,456]){g.fillStyle='#a8aeb6';g.fillRect(0,y,W,1.5);}
  /* une plaque d'égout, des flaques qui reflètent les réverbères */
  g.fillStyle='#22262c';g.beginPath();g.ellipse(410,590,15,9,0,0,7);g.fill();g.strokeStyle='#4a5058';g.lineWidth=1;for(let k=-2;k<=2;k++){g.beginPath();g.moveTo(398,590+k*3);g.lineTo(422,590+k*3);g.stroke();}
  for(const [x,y,w] of [[380,250,60],[660,560,80],[150,560,50],[820,680,70],[480,720,60]]){g.fillStyle='rgba(20,30,46,.85)';g.beginPath();g.ellipse(x,y,w/2,w/6,0,0,7);g.fill();g.fillStyle='rgba(255,220,150,.18)';g.beginPath();g.ellipse(x-4,y-1,w/5,w/16,0,0,7);g.fill();g.strokeStyle='rgba(140,170,210,.25)';g.lineWidth=1;g.beginPath();g.ellipse(x,y,w/2-2,w/6-1,0,Math.PI*1.1,Math.PI*1.9);g.stroke();}
  /* LE QUAI : bordure de pierre, bittes, pneus ; l'eau noire */
  g.fillStyle=lin(g,0,QUAI-10,0,QUAI+10,[[0,'#8a8478'],[1,'#5a564e']]);g.fillRect(0,QUAI-10,W,18);for(let x=0;x<W;x+=40){g.fillStyle='rgba(0,0,0,.25)';g.fillRect(x,QUAI-10,1.5,18);}
  g.fillStyle=lin(g,0,QUAI+8,0,H,[[0,'#0c1626'],[1,'#050a14']]);g.fillRect(0,QUAI+8,W,H-QUAI-8);
  for(let i=0;i<120;i++){const x=hA(i,1,9)*W,y=QUAI+14+hA(i,2,9)*(H-QUAI-20);g.fillStyle='rgba(120,150,200,'+(.05+hA(i,3,9)*.08)+')';g.fillRect(x,y,6+hA(i,4,9)*14,1);}
  for(let i=0;i<5;i++){const x=80+i*210;g.fillStyle='#1a1a1e';g.beginPath();g.ellipse(x,QUAI+4,10,7,0,0,7);g.fill();g.strokeStyle='#2a2a30';g.lineWidth=3;g.beginPath();g.ellipse(x,QUAI+4,7,4,0,0,7);g.stroke();}
  /* LE GRILLAGE à gauche, son portail ouvert vers la place */
  for(let y=MUR;y<QUAI-12;y+=4){if(y>PORTE.y0&&y<PORTE.y1)continue;g.fillStyle='rgba(170,180,190,.35)';g.fillRect(2,y,8,1);}
  for(const y of [PORTE.y0,PORTE.y1]){g.fillStyle='#5a6068';g.fillRect(0,y-4,12,8);}
  g.fillStyle='rgba(255,230,160,.12)';g.fillRect(0,PORTE.y0,26,PORTE.y1-PORTE.y0);
  /* l'ombre du hangar sur la cour */
  g.fillStyle=lin(g,0,MUR,0,MUR+40,[[0,'rgba(0,0,0,.45)'],[1,'rgba(0,0,0,0)']]);g.fillRect(0,MUR,W,40);}
function sol(){const c=document.createElement('canvas');c.width=W;c.height=H;peindreSol(c.getContext('2d'));return c;}
function solFin(){const c=document.createElement('canvas');c.width=W*2;c.height=H*2;const g=c.getContext('2d');g.setTransform(2,0,0,2,0,0);peindreSol(g);return c;}

/* ---------- LE MOBILIER DU TERMINAL, gravé une fois ---------- */
const CACHE={};
function conteneur(g,x0,yb,w,c,nom,porte){/* une boîte de 3/4 : le toit, la face, les nervures, la rouille */
  const hF=58,hT=18,yT=yb-hF-hT;
  g.fillStyle=c;g.fillRect(x0,yT,w,hT);g.fillStyle='rgba(255,255,255,.22)';g.fillRect(x0,yT,w,hT);
  for(let x=x0+3;x<x0+w;x+=6){g.fillStyle='rgba(0,0,0,.12)';g.fillRect(x,yT+2,2,hT-3);}
  g.fillStyle='rgba(0,0,0,.3)';g.fillRect(x0,yT+hT-2,w,2);
  g.fillStyle=c;g.fillRect(x0,yb-hF,w,hF);
  for(let x=x0+2;x<x0+w-2;x+=5){g.fillStyle='rgba(255,255,255,.1)';g.fillRect(x,yb-hF+3,2,hF-6);g.fillStyle='rgba(0,0,0,.22)';g.fillRect(x+2.5,yb-hF+3,1.5,hF-6);}
  g.fillStyle='rgba(0,0,0,.35)';g.fillRect(x0,yb-hF,w,3);g.fillRect(x0,yb-4,w,4);g.fillStyle='rgba(0,0,0,.2)';g.fillRect(x0,yb-hF,3,hF);g.fillRect(x0+w-3,yb-hF,3,hF);
  for(let i=0;i<5;i++){const rx=x0+hA(x0,i,1)*w,ry=yb-hF+hA(x0,i,2)*hF;g.fillStyle='rgba(120,60,24,.35)';g.fillRect(rx,ry,2+hA(x0,i,3)*6,6+hA(x0,i,4)*16);}
  if(porte){const px=x0+w-46;g.strokeStyle='rgba(0,0,0,.4)';g.lineWidth=1;g.strokeRect(px+.5,yb-hF+4.5,20,hF-9);g.strokeRect(px+22.5,yb-hF+4.5,20,hF-9);
    for(const bx of [px+6,px+15,px+28,px+37]){g.fillStyle='#c8ccd2';g.fillRect(bx,yb-hF+3,1.6,hF-6);g.fillStyle='#8a9098';g.fillRect(bx-1.5,yb-hF/2-2,4.5,4);}}
  g.fillStyle='rgba(255,255,255,.82)';g.font='900 11px "Baloo 2",Arial';g.textAlign='left';g.textBaseline='middle';g.fillText(nom,x0+10,yb-hF+16);
  g.font='700 6px Arial';g.fillStyle='rgba(255,255,255,.6)';g.fillText('MSKU '+(4000000+((x0*97)|0)%999999),x0+10,yb-hF+28);}
function graverConteneur(v){const k='ct'+v;if(CACHE[k])return CACHE[k];const C=CONTS[v],w=C.w,etages=C.e,Hd=etages*76+30,s=Hd-6;const {c,g}=toile(w+16,Hd);
  g.fillStyle='rgba(0,0,0,.5)';g.fillRect(10,s-4,w,12);
  for(let e_=0;e_<etages;e_++){const cc=e_?['#d8a02a','#3a6a9a','#8a3a3a','#4a8a5a'][(v+e_)%4]:C.c;conteneur(g,4,s-e_*76,w,cc,e_?['CMA','MED','RORO','SUD'][(v+e_)%4]:C.n,e_===0&&v%2===0);}
  return CACHE[k]={toile:c,W:w+16,H:Hd,sol:s};}
function graverFut(v){const k='fu'+v;if(CACHE[k])return CACHE[k];const {c,g}=toile(26,36);const col=['#2a5a9a','#b8432e','#3a7a4a'][v%3];
  g.fillStyle='rgba(0,0,0,.45)';g.beginPath();g.ellipse(13,32,11,4,0,0,7);g.fill();
  g.fillStyle=col;g.fillRect(3,8,20,24);g.fillStyle=lin(g,3,0,23,0,[[0,'rgba(0,0,0,.4)'],[.35,'rgba(255,255,255,.18)'],[1,'rgba(0,0,0,.45)']]);g.fillRect(3,8,20,24);
  for(const y of [14,24]){g.fillStyle='rgba(0,0,0,.3)';g.fillRect(3,y,20,2);}g.fillStyle=col;g.beginPath();g.ellipse(13,8,10,4,0,0,7);g.fill();g.fillStyle='rgba(0,0,0,.35)';g.beginPath();g.ellipse(13,8,7,2.6,0,0,7);g.fill();
  g.fillStyle='rgba(120,60,24,.4)';g.fillRect(6,18,4,9);g.fillStyle='#e8c81a';g.beginPath();g.moveTo(13,17);g.lineTo(17,23);g.lineTo(9,23);g.closePath();g.fill();
  return CACHE[k]={toile:c,W:26,H:36,sol:32};}
function graverFeu(){if(CACHE.feu)return CACHE.feu;const {c,g}=toile(32,40);g.fillStyle='rgba(0,0,0,.45)';g.beginPath();g.ellipse(16,36,13,4,0,0,7);g.fill();
  g.fillStyle=lin(g,4,0,28,0,[[0,'#1a1a1e'],[.4,'#4a4a52'],[1,'#141418']]);g.fillRect(4,12,24,24);for(const y of [18,28]){g.fillStyle='rgba(0,0,0,.35)';g.fillRect(4,y,24,2);}
  g.fillStyle='rgba(255,120,30,.35)';for(let i=0;i<4;i++)g.fillRect(7+i*5,26,2,3);g.fillStyle='#2a2a30';g.beginPath();g.ellipse(16,12,12,4.5,0,0,7);g.fill();g.fillStyle='#ff8a1a';g.beginPath();g.ellipse(16,12,9,3,0,0,7);g.fill();
  return CACHE.feu={toile:c,W:32,H:40,sol:36};}
function graverLampe(){if(CACHE.la)return CACHE.la;const {c,g}=toile(40,150);g.fillStyle='rgba(0,0,0,.45)';g.beginPath();g.ellipse(20,146,9,3,0,0,7);g.fill();
  g.fillStyle=lin(g,16,0,24,0,[[0,'#2a3038'],[.5,'#6a747e'],[1,'#22282e']]);g.fillRect(17,22,6,124);g.fillStyle='#2a3038';g.fillRect(14,138,12,8);
  g.fillStyle='#3a4048';g.fillRect(20,16,16,4);g.fillStyle='#1a1e24';g.beginPath();g.moveTo(26,20);g.lineTo(40,20);g.lineTo(38,26);g.lineTo(28,26);g.closePath();g.fill();g.fillStyle='#fff2c0';g.fillRect(29,25,8,2);
  return CACHE.la={toile:c,W:40,H:150,sol:146};}
function graverPalette(){if(CACHE.pa)return CACHE.pa;const {c,g}=toile(64,46);g.fillStyle='rgba(0,0,0,.45)';g.fillRect(4,38,58,8);
  for(const y of [34,26]){g.fillStyle='#a8743a';g.fillRect(2,y,60,6);g.fillStyle='rgba(0,0,0,.25)';for(const x of [2,28,54])g.fillRect(x,y+4,8,2);}
  for(let i=0;i<5;i++){const x=6+(i%3)*18+(i>2?9:0),y=i>2?6:18;g.fillStyle=lin(g,0,y,0,y+12,[[0,'#e8dcc0'],[1,'#b8a888']]);g.beginPath();g.ellipse(x+8,y+6,10,7,0,0,7);g.fill();g.fillStyle='rgba(0,0,0,.15)';g.fillRect(x+2,y+5,12,1.5);g.fillStyle='#5a3a1a';g.font='700 4px Arial';g.fillText('CAFÉ',x+3,y+9);}
  return CACHE.pa={toile:c,W:64,H:46,sol:42};}
function graverChariot(){if(CACHE.ch)return CACHE.ch;const {c,g}=toile(84,84);g.fillStyle='rgba(0,0,0,.45)';g.beginPath();g.ellipse(42,78,38,6,0,0,7);g.fill();
  /* le mât et les fourches */
  g.fillStyle='#2a2a2e';g.fillRect(10,10,5,66);g.fillRect(22,10,5,66);g.fillStyle='#4a4a52';g.fillRect(8,10,22,4);g.fillStyle='#6a6e76';g.fillRect(0,68,30,4);g.fillRect(0,58,30,3);
  /* la caisse jaune, la cabine */
  g.fillStyle=lin(g,0,30,0,76,[[0,'#ffd23a'],[1,'#c89a10']]);g.fillRect(28,44,52,30);g.fillStyle='rgba(0,0,0,.2)';g.fillRect(28,70,52,4);
  g.strokeStyle='#2a2a2e';g.lineWidth=3;g.beginPath();g.moveTo(34,44);g.lineTo(38,16);g.lineTo(70,16);g.lineTo(74,44);g.stroke();g.fillStyle='rgba(120,160,200,.25)';g.fillRect(40,18,28,24);
  g.fillStyle='#1a1a1e';g.fillRect(52,34,8,10);for(const x of [38,70]){g.fillStyle='#16161a';g.beginPath();g.arc(x,74,8,0,7);g.fill();g.fillStyle='#5a5e66';g.beginPath();g.arc(x,74,3.4,0,7);g.fill();}
  g.fillStyle='#e8501a';g.fillRect(72,36,6,4);g.fillStyle='#2a2a2e';g.font='900 7px Arial';g.fillText('LOCK 3',48,60);
  return CACHE.ch={toile:c,W:84,H:84,sol:78};}
function graverCone(){if(CACHE.co)return CACHE.co;const {c,g}=toile(16,22);g.fillStyle='rgba(0,0,0,.4)';g.fillRect(1,18,15,4);g.fillStyle='#1a1a1e';g.fillRect(1,17,14,3);
  g.fillStyle='#ff6a1a';g.beginPath();g.moveTo(4,17);g.lineTo(8,2);g.lineTo(12,17);g.closePath();g.fill();g.fillStyle='#f6f2ea';g.fillRect(5,9,6,3);return CACHE.co={toile:c,W:16,H:22,sol:19};}
function graverBitte(){if(CACHE.bi)return CACHE.bi;const {c,g}=toile(22,22);g.fillStyle='rgba(0,0,0,.4)';g.beginPath();g.ellipse(11,19,9,3,0,0,7);g.fill();
  g.fillStyle=lin(g,4,0,18,0,[[0,'#1a1a1e'],[.5,'#3a3a42'],[1,'#141418']]);g.fillRect(5,8,12,11);g.beginPath();g.ellipse(11,8,8,3.5,0,0,7);g.fillStyle='#2a2a30';g.fill();return CACHE.bi={toile:c,W:22,H:22,sol:19};}
const GRAVEURS={x_jol_zo_ct_sol:graverConteneur,x_jol_zo_fu_sol:graverFut,x_jol_zo_feu_sol:graverFeu,x_jol_zo_la_sol:graverLampe,x_jol_zo_pa_sol:graverPalette,x_jol_zo_ch_sol:graverChariot,x_jol_zo_co_sol:graverCone,x_jol_zo_bi_sol:graverBitte};
function graver(t,v){const f=GRAVEURS[t];if(!f){const c=document.createElement('canvas');c.width=c.height=1;return {toile:c,W:1,H:1,sol:0};}const r=f(v||0);return {toile:r.toile,W:r.W,H:r.H,sol:r.sol};}
let DECOR=[];
function decor(){const D=[];const P=(t,x,y,o)=>D.push(Object.assign({t,x,y,gr:0},o||{}));
  CONTS.forEach((C,i)=>P('x_jol_zo_ct_sol',C.x,C.y,{v:i,col:[C.w+4,42]}));
  FUTS.forEach(([x,y],i)=>P('x_jol_zo_fu_sol',x,y,{v:i,col:[20,10]}));P('x_jol_zo_feu_sol',FEU.x,FEU.y,{col:[24,10]});
  for(const [x,y] of LAMPES)P('x_jol_zo_la_sol',x,y,{col:[8,5]});for(const [x,y] of PALETTES_)P('x_jol_zo_pa_sol',x,y,{col:[58,18]});
  P('x_jol_zo_ch_sol',CHARIOT.x,CHARIOT.y,{col:[76,24]});for(const [x,y] of CONES)P('x_jol_zo_co_sol',x,y,{col:[12,6]});
  for(let i=0;i<5;i++)P('x_jol_zo_bi_sol',80+i*210+40,QUAI-6,{col:[16,8]});
  P('x_jol_zo_vide',60,(PORTE.y0+PORTE.y1)/2,{agir:()=>sortir(),libelle:'Rentrer',nom:'LE PORTAIL · RETOUR SUR LA PLACE',demi:34});
  DECOR=D;return D;}
function bloque(x,y){if(x<12||x>W-12||y<MUR+6||y>QUAI-14)return true;if(x<16&&(y<PORTE.y0||y>PORTE.y1))return true;
  for(const o of DECOR){if(!o.col)continue;if(Math.abs(x-o.x)<o.col[0]/2&&y>o.y-o.col[1]&&y<o.y+3)return true;}return false;}
const libreZ=(x,y,r)=>!bloque(x,y)&&!bloque(x-r,y)&&!bloque(x+r,y);

/* ---------- LES ZOMBIES : des gens du port, dessinés comme les autres ---------- */
const AP=o=>Object.assign({},DEF_AP,{bas:0,souliers:1,chaussures:'#2a1a10',sac:0,chapeau:0,raye:0,motif:0,barbe:0,_civil:true,_pnj:true},o);
const LOOK=[{veste:'#e8b83a',pantalon:'#2a3a5a',cheveux:2,coiffe:3},{veste:'#e8603a',pantalon:'#3a3a3a',cheveux:0,coiffe:1},{veste:'#4a6a8a',pantalon:'#2a2a2a',cheveux:4,coiffe:6},
  {veste:'#8a8a7a',pantalon:'#3a2a1a',cheveux:1,coiffe:9},{veste:'#c8c0a8',pantalon:'#1a2a3a',cheveux:3,coiffe:12},{veste:'#3a7a4a',pantalon:'#2a2a3a',cheveux:5,coiffe:4},{veste:'#a83a3a',pantalon:'#3a3a4a',cheveux:6,coiffe:7}];
const TYPES={
 marcheur:{pv:30,v:30,deg:12,r:8,pts:10,ech:1,peau:0},
 coureur:{pv:18,v:66,deg:9,r:8,pts:15,ech:.95,peau:2},
 cracheur:{pv:34,v:28,deg:10,r:8,pts:20,ech:1.02,peau:4},
 costaud:{pv:140,v:20,deg:24,r:12,pts:40,ech:1.35,peau:3},
 roi:{pv:900,v:24,deg:34,r:18,pts:300,ech:1.9,peau:1}};
const SPR=new Map();
function spriteZ(k,look,dir,pas){const key=k+look+dir+pas;let s=SPR.get(key);if(s)return s;const T=TYPES[k],E=T.ech,w=Math.ceil(64*E),h=Math.ceil(84*E),D=2;
  const c=document.createElement('canvas');c.width=w*D;c.height=h*D;const q=c.getContext('2d');q.setTransform(D*E,0,0,D*E,32*D*E,68*D*E);
  const L=LOOK[look%LOOK.length],ap=AP(Object.assign({peau:PZ+T.peau},L,k==='costaud'?{veste:'#5a3a6a'}:{},k==='roi'?{veste:'#f0c040',pantalon:'#3a1a4a',_lun:'lun_noires'}:{}));
  const sG=GESTE;try{GESTE={t:0};personne(q,0,0,ap,dir,pas,true);}catch(z){}finally{GESTE=sG;}
  /* le teint de la nuit : un voile vert-de-gris sur tout le corps, des taches, des accrocs */
  q.setTransform(D,0,0,D,0,0);q.globalCompositeOperation='source-atop';q.fillStyle='rgba(70,120,60,.28)';q.fillRect(0,0,w,h);
  q.fillStyle='rgba(30,40,20,.45)';for(let i=0;i<9;i++){const x=hA(look,i,11)*w,y=h*.35+hA(look,i,12)*h*.55;q.beginPath();q.ellipse(x,y,1.5+hA(look,i,13)*3,1+hA(look,i,14)*2,0,0,7);q.fill();}
  q.fillStyle='rgba(0,0,0,.35)';for(let i=0;i<4;i++){const x=hA(look,i,15)*w,y=h*.45+hA(look,i,16)*h*.3;q.fillRect(x,y,3,1.2);}
  q.globalCompositeOperation='source-over';
  if(k==='roi'){q.setTransform(D*E,0,0,D*E,32*D*E,68*D*E);q.fillStyle='#f0c040';q.beginPath();q.moveTo(-7,-49);q.lineTo(-7,-57);q.lineTo(-3.5,-53);q.lineTo(0,-59);q.lineTo(3.5,-53);q.lineTo(7,-57);q.lineTo(7,-49);q.closePath();q.fill();q.fillStyle='#d82c3c';q.beginPath();q.arc(0,-52.5,1.4,0,7);q.fill();}
  s={c,w,h,ox:32*E,oy:68*E};SPR.set(key,s);if(SPR.size>500){const it=SPR.keys();for(let i=0;i<100;i++)SPR.delete(it.next().value);}return s;}
const dir8=(dx,dy)=>{const a=Math.atan2(dy,dx),i=((Math.round(a/(Math.PI/4))%8)+8)%8;return ['droite','bas-droite','bas','bas-gauche','gauche','haut-gauche','haut','haut-droite'][i];};
const dir4=(dx,dy)=>Math.abs(dx)>Math.abs(dy)?(dx>0?'droite':'gauche'):(dy>0?'bas':'haut');

/* ---------- LES ARMES, LES BONUS ---------- */
const ARMES={pistolet:{nom:'Pistolet',ic:'🔫',deg:11,cad:3.4,v:520,disp:.04,n:1,c:'#2a2a30',l:9,duree:0},mitraillette:{nom:'Mitraillette',ic:'🔥',deg:8,cad:10,v:580,disp:.1,n:1,c:'#1a1a1e',l:12,duree:18},
  pompe:{nom:'Fusil à pompe',ic:'💥',deg:9,cad:1.4,v:480,disp:.3,n:7,c:'#5a3a1a',l:13,duree:18},laser:{nom:'Fusil laser',ic:'⚡',deg:22,cad:4.4,v:820,disp:0,n:1,c:'#3ad8ff',l:14,duree:15,perce:true}};
const BONUS={soin:{nom:'Trousse de soin',c:'#ff5a6a'},vite:{nom:'Café serré',c:'#c8783a'},bouclier:{nom:'Gilet pare-balles',c:'#5ab8ff'},double:{nom:'Balles dorées',c:'#ffb43a'},mitraillette:{nom:'Mitraillette',c:'#ff6a2a',arme:1},pompe:{nom:'Fusil à pompe',c:'#8a5a2a',arme:1},laser:{nom:'Fusil laser',c:'#3ad8ff',arme:1}};
function dessinerBonus(g,k,x,y,t){const B=BONUS[k],b=Math.sin(t*4)*2;g.fillStyle='rgba(0,0,0,.4)';g.beginPath();g.ellipse(x,y,9,3.5,0,0,7);g.fill();g.save();g.translate(x,y-12+b);
  g.fillStyle=rad(g,0,0,1,16,[[0,'rgba(255,240,180,.5)'],[1,'rgba(255,240,180,0)']]);g.fillRect(-16,-16,32,32);
  if(B.arme){g.rotate(-.3);g.fillStyle=B.c;g.fillRect(-10,-2.5,20,5);g.fillStyle='#1a1a1e';g.fillRect(-10,-2.5,6,8);g.fillRect(2,-5,3,3);if(k==='laser'){g.fillStyle='#bff6ff';g.fillRect(6,-1,4,2);}}
  else if(k==='soin'){g.fillStyle='#f6f2ea';g.fillRect(-8,-6,16,12);g.fillStyle='#e82a3a';g.fillRect(-1.6,-4,3.2,8);g.fillRect(-4,-1.6,8,3.2);}
  else if(k==='vite'){g.fillStyle='#f6f2ea';g.beginPath();g.moveTo(-5,-6);g.lineTo(5,-6);g.lineTo(4,6);g.lineTo(-4,6);g.fill();g.fillStyle='#5a3a1a';g.fillRect(-4.5,-5,9,3);g.strokeStyle='#f6f2ea';g.lineWidth=1.4;g.beginPath();g.arc(6,0,2.6,-1.4,1.4);g.stroke();}
  else if(k==='bouclier'){g.fillStyle='#2a3a5a';g.fillRect(-7,-7,14,14);g.fillStyle='#5ab8ff';g.fillRect(-7,-7,14,3);g.fillStyle='#e8e8ee';g.font='800 5px Arial';g.textAlign='center';g.fillText('GILET',0,3);}
  else{g.fillStyle='#ffd23a';for(let i=0;i<3;i++){g.fillRect(-6+i*4.5,-6,3,10);g.beginPath();g.arc(-4.5+i*4.5,-6,1.5,Math.PI,0);g.fill();}}
  g.restore();}

/* ---------- L'ÉTAT DE LA PARTIE ---------- */
const S={on:false,mort:false,pv:100,inv:0,cad:0,ang:0,vague:0,reste:0,entre:2.5,score:0,tues:0,arme:ARMES.pistolet,armeFin:0,bonus:{vite:0,bouclier:0,double:0},greCd:0,t:0,id:null,flash:0,secoue:0};
let Z=[],BAL=[],PART=[],OBJ=[],CRA=[],TXT=[],LUMS=[];
const rnd=(a,b)=>a+Math.random()*(b-a);
function nouvelle(){Object.assign(S,{on:true,mort:false,pv:100,inv:0,cad:0,vague:0,reste:0,entre:2.5,score:0,tues:0,arme:ARMES.pistolet,armeFin:0,bonus:{vite:0,bouclier:0,double:0},greCd:0,t:0,id:null});
  Z=[];BAL=[];PART=[];OBJ=[];CRA=[];TXT=[];LUMS=[];window.BOOST_CAFE=null;rpcS('zombies_partie').then(r=>{if(r&&r.id)S.id=r.id;});majHud();}
function vagueSuivante(){S.vague++;const boss=S.vague%5===0,n=4+S.vague*3;S.reste=n+(boss?1:0);
  const L=[];for(let i=0;i<n;i++){const r=Math.random();L.push(S.vague>=6&&r<.12?'costaud':S.vague>=3&&r<.32?'cracheur':S.vague>=2&&r<.55?'coureur':'marcheur');}if(boss)L.push('roi');
  let i=0;const sp=()=>{if(!S.on||S.mort)return;if(i>=L.length)return;apparaitre(L[i++]);setTimeout(sp,Math.max(220,1000-S.vague*60));};setTimeout(sp,600);
  banniere(boss?'Le Roi des Docks':'Vague '+S.vague,boss?'il sort du hangar… avec sa cour':(S.vague===1?'les rideaux du hangar se lèvent…':n+' zombies'));son('vague');majHud();}
function apparaitre(k){const T=TYPES[k];let x,y;
  for(let essai=0;essai<30;essai++){const src=Math.random();
    if(src<.55){const v=VOLETS[Math.floor(Math.random()*3)];x=v+rnd(-50,50);y=MUR+12;}       /* par les rideaux du hangar */
    else if(src<.8){x=rnd(40,W-40);y=QUAI-18;}                                           /* ils remontent du quai */
    else{x=W-16;y=rnd(MUR+20,QUAI-30);}                                                   /* par la droite */
    if(libreZ(x,y,T.r)&&Math.hypot(x-joueur.x,y-joueur.y)>140)break;}
  const m=1+Math.max(0,S.vague-1)*.08;Z.push({k,x,y,pv:T.pv*m,pvm:T.pv*m,v:T.v*(1+Math.min(.5,S.vague*.025))*rnd(.9,1.1),r:T.r,look:Math.floor(Math.random()*LOOK.length),f:Math.random()*4,flash:0,cd:rnd(1.5,3),kx:0,ky:0,dir:'bas',sort:0});
  for(let i=0;i<8;i++)PART.push({x,y,vx:rnd(-30,30),vy:rnd(-40,-10),vie:rnd(.4,.8),c:'rgba(60,70,60,.6)',r:rnd(3,6),fum:1});}
function cible(){const rx=VW/2-10,ry=VH/2-14;let best=null,bd=1e9;for(const z of Z){if(Math.abs(z.x-joueur.x)>rx||Math.abs(z.y-joueur.y)>ry)continue;const d=(z.x-joueur.x)**2+(z.y-joueur.y)**2;if(d<bd&&d<170*170){bd=d;best=z;}}return best;}
function tirer(c){const T=TYPES[c.k],ty=c.y-30*T.ech,a0=Math.atan2(ty-(joueur.y-30),c.x-joueur.x);S.ang=a0;const dbl=S.bonus.double>S.t?2:1;
  joueur.dirVue=dir8(Math.cos(a0),Math.sin(a0));
  for(let i=0;i<S.arme.n;i++){const a=a0+(Math.random()-.5)*S.arme.disp*2;BAL.push({x:joueur.x+Math.cos(a0)*18,y:joueur.y-30+Math.sin(a0)*18,vx:Math.cos(a)*S.arme.v*rnd(.92,1.05),vy:Math.sin(a)*S.arme.v*rnd(.92,1.05),deg:S.arme.deg*dbl,vie:.65,perce:S.arme.perce,touches:new Set()});}
  son(S.arme===ARMES.pompe?'pompe':'tir');S.flash=.06;for(let i=0;i<4;i++)PART.push({x:joueur.x+Math.cos(a0)*22,y:joueur.y-30+Math.sin(a0)*22,vx:Math.cos(a0+rnd(-.6,.6))*rnd(60,160),vy:Math.sin(a0+rnd(-.6,.6))*rnd(60,160),vie:.1,c:'#fff2a0',r:1.6});
  /* la douille qui saute */
  PART.push({x:joueur.x,y:joueur.y-30,vx:rnd(-40,40),vy:rnd(-90,-50),vie:.5,c:'#d8a840',r:1.6,grav:1});}
function grenade(){if(!S.on||S.mort||S.greCd>S.t)return;S.greCd=S.t+7;const c=cible();const tx=c?c.x:joueur.x+Math.cos(S.ang)*120,ty=c?c.y:joueur.y+Math.sin(S.ang)*120;
  OBJ.push({t:'gre',x:joueur.x,y:joueur.y-30,x0:joueur.x,y0:joueur.y-30,tx,ty,t0:S.t,d:.55});try{vibrer(15);}catch(x){}}
function boum(x,y){son('boum');try{vibrer([40,30,60]);}catch(e_){}S.secoue=.4;for(let i=0;i<50;i++){const a=Math.random()*Math.PI*2,v=rnd(40,240);PART.push({x,y:y-6,vx:Math.cos(a)*v,vy:Math.sin(a)*v*.6,vie:rnd(.3,.8),c:['#ffd23a','#ff8a2a','#ff4a1a','#fff2a0'][i%4],r:rnd(2,4.5)});}
  for(let i=0;i<14;i++)PART.push({x:x+rnd(-14,14),y:y-6,vx:rnd(-20,20),vy:rnd(-50,-20),vie:rnd(.8,1.6),c:'rgba(40,40,44,.55)',r:rnd(6,12),fum:1});
  LUMS.push({x,y,r:170,vie:.35});for(const z of Z){const d=Math.hypot(z.x-x,z.y-y);if(d<80)blesser(z,70*(1-d/110)*(S.bonus.double>S.t?2:1),(z.x-x)/(d||1)*260,(z.y-y)/(d||1)*260);}}
function blesser(z,dg,kx,ky){z.pv-=dg;z.flash=.08;z.kx+=kx||0;z.ky+=ky||0;TXT.push({x:z.x+rnd(-6,6),y:z.y-62*TYPES[z.k].ech,t:String(Math.round(dg)),vie:.6});son('touche');if(z.pv<=0&&!z.mort){z.mort=true;tuer(z);}}
function tuer(z){const T=TYPES[z.k];S.score+=T.pts*(1+Math.floor(S.vague/5));S.tues++;S.reste--;son('mort');
  for(let i=0;i<(z.k==='roi'?50:14);i++){const a=Math.random()*Math.PI*2,v=rnd(20,110);PART.push({x:z.x,y:z.y-24*T.ech,vx:Math.cos(a)*v,vy:Math.sin(a)*v,vie:rnd(.4,.9),c:i%3?'rgba(90,110,80,.7)':'rgba(140,200,110,.8)',r:rnd(3,7),fum:1});}
  const ch=z.k==='roi'?1:z.k==='costaud'?.5:.09;if(Math.random()<ch){const L=Object.keys(BONUS);const k=S.vague<2?['soin','vite','mitraillette'][Math.floor(Math.random()*3)]:L[Math.floor(Math.random()*L.length)];OBJ.push({t:'bonus',k,x:z.x,y:z.y,vie:12});}
  if(z.k==='roi'){S.score+=500;banniere('Le Roi est tombé !','+500 points');}majHud();}
function prendre(k){son('bonus');try{vibrer([10,20,10]);}catch(x){}const B=BONUS[k];if(B.arme){S.arme=ARMES[k];S.armeFin=S.t+S.arme.duree;}else if(k==='soin')S.pv=Math.min(100,S.pv+35);
  else{S.bonus[k]=S.t+12;if(k==='vite')window.BOOST_CAFE={vit:1.45,fin:Date.now()+12000};}
  try{texteVolant(joueur.x,joueur.y-70,B.nom+(k==='soin'?' : +35':'')+' !','#fff2a0');}catch(x){}majHud();}

/* ---------- LE SON ---------- */
let AC=null;function ac(){try{if(typeof A==='function')return A();}catch(x){}try{if(!AC)AC=new (window.AudioContext||window.webkitAudioContext)();return AC;}catch(x){return null;}}
function bruit(d,f,v){const a=ac();if(!a)return;try{const n=Math.floor(a.sampleRate*d),b=a.createBuffer(1,n,a.sampleRate),c=b.getChannelData(0);for(let i=0;i<n;i++)c[i]=(Math.random()*2-1)*Math.pow(1-i/n,2);const s=a.createBufferSource();s.buffer=b;const fi=a.createBiquadFilter();fi.type='lowpass';fi.frequency.value=f;const gn=a.createGain();gn.gain.value=v;s.connect(fi);fi.connect(gn);gn.connect(a.destination);s.start();}catch(x){}}
function note(f,d,ty,v,t0,f2){const a=ac();if(!a)return;try{const t=a.currentTime+(t0||0),o=a.createOscillator(),gn=a.createGain();o.type=ty;o.frequency.setValueAtTime(f,t);if(f2)o.frequency.exponentialRampToValueAtTime(f2,t+d);gn.gain.setValueAtTime(v,t);gn.gain.exponentialRampToValueAtTime(.0001,t+d);o.connect(gn);gn.connect(a.destination);o.start(t);o.stop(t+d+.02);}catch(x){}}
let dT=0;function son(k){if(k==='tir'){const n=performance.now();if(n-dT<45)return;dT=n;bruit(.07,S.arme===ARMES.laser?6000:2200,.1);}else if(k==='pompe')bruit(.18,1400,.22);else if(k==='touche')note(180,.05,'square',.025);
  else if(k==='mort'){note(130,.3,'sawtooth',.045,0,55);}else if(k==='boum'){bruit(.6,500,.45);note(70,.5,'sine',.25,0,30);}else if(k==='aie')note(220,.15,'square',.05,0,120);
  else if(k==='bonus')[660,880,1320].forEach((f,i)=>note(f,.12,'triangle',.07,i*.06));else if(k==='vague'){note(110,.9,'sawtooth',.05,0,70);note(165,.9,'sawtooth',.035,.05,100);}else if(k==='grogne')note(80+Math.random()*40,.5,'sawtooth',.02,0,55);}

/* ---------- LA BOUCLE DU JEU ---------- */
let last=performance.now();
function pas(n){requestAnimationFrame(pas);const dt=Math.min(.05,(n-last)/1000);last=n;if(!S.on||S.mort||window.ECRAN_COUVRANT||typeof joueur==='undefined')return;S.t+=dt;
  if(S.armeFin&&S.t>S.armeFin){S.arme=ARMES.pistolet;S.armeFin=0;majHud();}
  S.cad-=dt;const c=cible();if(c&&S.cad<=0){tirer(c);S.cad=1/S.arme.cad;}
  for(const z of Z){const T=TYPES[z.k];const dx=joueur.x-z.x,dy=joueur.y-z.y,d=Math.hypot(dx,dy)||1;
    let vx=dx/d*z.v,vy=dy/d*z.v;for(const o of Z){if(o===z)continue;const ex=z.x-o.x,ey=z.y-o.y,ee=ex*ex+ey*ey,rr=(z.r+o.r)**2;if(ee<rr&&ee>.01){const e_=Math.sqrt(ee);vx+=ex/e_*50;vy+=ey/e_*50;}}
    if(z.k==='cracheur'&&d<220&&d>80){vx*=.2;vy*=.2;z.cd-=dt;if(z.cd<=0){z.cd=rnd(2,3.2);CRA.push({x:z.x,y:z.y-40,vx:dx/d*170,vy:dy/d*170,vie:2});note(300,.15,'sine',.035,0,120);}}
    const mx=(vx+z.kx)*dt,my=(vy+z.ky)*dt;
    if(libreZ(z.x+mx,z.y+my,z.r)){z.x+=mx;z.y+=my;}else if(libreZ(z.x+mx,z.y,z.r))z.x+=mx;else if(libreZ(z.x,z.y+my,z.r))z.y+=my;
    else{const s_=(Math.floor(z.f/3)%2)?1:-1;const px=-dy/d*z.v*dt*s_,py=dx/d*z.v*dt*s_;if(libreZ(z.x+px,z.y+py,z.r)){z.x+=px;z.y+=py;}}
    z.f+=dt*(z.k==='coureur'?10:5.5);z.dir=dir4(vx,vy);z.kx*=Math.pow(.02,dt);z.ky*=Math.pow(.02,dt);if(z.flash>0)z.flash-=dt;
    if(d<z.r+12&&S.inv<=0){if(S.bonus.bouclier>S.t){z.kx-=dx/d*300;z.ky-=dy/d*300;}else{S.pv-=T.deg;S.inv=.6;son('aie');try{vibrer(60);}catch(x){}S.secoue=.25;majHud();}}
    if(Math.random()<dt*.05)son('grogne');}
  Z=Z.filter(z=>!z.mort);S.inv-=dt;
  for(const b of BAL){b.x+=b.vx*dt;b.y+=b.vy*dt;b.vie-=dt;if(bloque(b.x,b.y+30)){b.vie=0;for(let i=0;i<3;i++)PART.push({x:b.x,y:b.y,vx:rnd(-60,60),vy:rnd(-60,60),vie:.15,c:'#ffe8a0',r:1.4});continue;}
    for(const z of Z){if(b.touches.has(z))continue;const T=TYPES[z.k],zy=z.y-30*T.ech;if(Math.abs(b.x-z.x)<z.r+4&&Math.abs(b.y-zy)<26*T.ech){b.touches.add(z);blesser(z,b.deg,b.vx*.15,b.vy*.15);if(!b.perce){b.vie=0;break;}}}}
  BAL=BAL.filter(b=>b.vie>0);
  for(const s of CRA){s.x+=s.vx*dt;s.y+=s.vy*dt;s.vie-=dt;if(bloque(s.x,s.y+40))s.vie=0;if(s.vie>0&&Math.abs(s.x-joueur.x)<10&&Math.abs(s.y-(joueur.y-30))<26){s.vie=0;if(S.bonus.bouclier<=S.t){S.pv-=8;son('aie');try{vibrer(40);}catch(x){}majHud();}}}
  CRA=CRA.filter(s=>s.vie>0);
  for(const o of OBJ){if(o.t==='gre'){const u=(S.t-o.t0)/o.d;o.x=o.x0+(o.tx-o.x0)*u;o.y=o.y0+(o.ty-o.y0)*u-Math.sin(u*Math.PI)*60;if(u>=1){o.fini=1;boum(o.tx,o.ty);}}
    else{o.vie-=dt;if(o.vie<=0)o.fini=1;if((o.x-joueur.x)**2+(o.y-joueur.y)**2<22*22){o.fini=1;prendre(o.k);}}}
  OBJ=OBJ.filter(o=>!o.fini);
  for(const p of PART){p.x+=p.vx*dt;p.y+=p.vy*dt;if(p.grav)p.vy+=300*dt;else{p.vx*=.93;p.vy*=.93;}if(p.fum)p.r+=dt*6;p.vie-=dt;}PART=PART.filter(p=>p.vie>0);if(PART.length>420)PART.splice(0,PART.length-420);
  for(const t of TXT){t.y-=30*dt;t.vie-=dt;}TXT=TXT.filter(t=>t.vie>0);for(let i=LUMS.length-1;i>=0;i--){LUMS[i].vie-=dt;if(LUMS[i].vie<=0)LUMS.splice(i,1);}
  if(S.flash>0)S.flash-=dt;if(S.secoue>0)S.secoue-=dt;
  if(S.reste<=0&&Z.length===0){S.entre-=dt;if(S.entre<=0){S.entre=3;if(S.vague)S.score+=S.vague*100;vagueSuivante();}}
  if(S.pv<=0)mourir();
  const gc=document.getElementById('zGreC');if(gc)gc.style.height=S.greCd>S.t?((S.greCd-S.t)/7*100)+'%':'0';}
requestAnimationFrame(pas);

/* ---------- CE QUI SE DESSINE ---------- */
const vu=(x,y,cx,cy,m)=>{const X=x-cx,Y=y-cy;return X>-m&&X<VW+m&&Y>-m-60&&Y<VH+m;};
let NUIT=null;
function dessinerNuit(g,cx,cy){const t=now(),NW=Math.ceil(VW*1.5),NH=Math.ceil(VH*1.5);if(!NUIT)NUIT=document.createElement('canvas');if(NUIT.width!==NW||NUIT.height!==NH){NUIT.width=NW;NUIT.height=NH;}
  const n=NUIT.getContext('2d'),k=NW/VW;n.globalCompositeOperation='source-over';n.clearRect(0,0,NW,NH);n.fillStyle='rgba(6,10,26,.82)';n.fillRect(0,0,NW,NH);n.globalCompositeOperation='destination-out';
  const trou=(x,y,r,a)=>{const X=(x-cx)*k,Y=(y-cy)*k,Rr=r*k;const gr=n.createRadialGradient(X,Y,0,X,Y,Rr);gr.addColorStop(0,'rgba(0,0,0,'+a+')');gr.addColorStop(.55,'rgba(0,0,0,'+(a*.65)+')');gr.addColorStop(1,'rgba(0,0,0,0)');n.fillStyle=gr;n.fillRect(X-Rr,Y-Rr,Rr*2,Rr*2);};
  trou(joueur.x,joueur.y-24,110,.92);
  for(const [x,y] of LAMPES)trou(x+12,y-6,104+Math.sin(t*9+x)*1.5,.92);
  trou(FEU.x,FEU.y-14,90+Math.sin(t*13)*6+Math.sin(t*7)*4,.95);
  for(const v of VOLETS)trou(v,58,60,.5);
  {const X=(joueur.x-cx)*k,Y=(joueur.y-30-cy)*k,Rr=230*k,a=S.ang;const gr=n.createRadialGradient(X,Y,0,X,Y,Rr);gr.addColorStop(0,'rgba(0,0,0,.85)');gr.addColorStop(1,'rgba(0,0,0,0)');n.fillStyle=gr;n.beginPath();n.moveTo(X,Y);n.arc(X,Y,Rr,a-.4,a+.4);n.closePath();n.fill();}
  if(S.flash>0)trou(joueur.x+Math.cos(S.ang)*22,joueur.y-30+Math.sin(S.ang)*22,100,.9);for(const l of LUMS)trou(l.x,l.y,l.r,Math.min(1,l.vie*3));
  for(const s of CRA)trou(s.x,s.y,24,.6);for(const o of OBJ)if(o.t==='bonus')trou(o.x,o.y-10,32,.75);
  g.drawImage(NUIT,0,0,VW,VH);
  /* les teintes chaudes : réverbères, feu ; et la lune sur l'eau */
  g.globalCompositeOperation='lighter';
  for(const [x,y] of LAMPES){if(!vu(x,y,cx,cy,120))continue;const X=x+12-cx,Y=y-6-cy;g.fillStyle=rad(g,X,Y,0,90,[[0,'rgba(255,190,100,.18)'],[1,'rgba(255,190,100,0)']]);g.fillRect(X-90,Y-90,180,180);
    g.fillStyle='rgba(255,236,180,.9)';g.fillRect(x+9-cx,y-128-cy+4,8,2);g.fillStyle=rad(g,x+13-cx,y-122-cy,0,14,[[0,'rgba(255,230,160,.6)'],[1,'rgba(255,230,160,0)']]);g.fillRect(x-1-cx,y-136-cy,28,28);}
  {const X=FEU.x-cx,Y=FEU.y-24-cy,f=1+Math.sin(t*11)*.08+Math.sin(t*5.3)*.06;g.fillStyle=rad(g,X,Y,0,80*f,[[0,'rgba(255,140,50,.32)'],[1,'rgba(255,120,40,0)']]);g.fillRect(X-80,Y-80,160,160);}
  if(S.flash>0){g.fillStyle='rgba(255,220,140,.3)';g.beginPath();g.arc(joueur.x+Math.cos(S.ang)*22-cx,joueur.y-30+Math.sin(S.ang)*22-cy,10,0,7);g.fill();}
  g.globalCompositeOperation='source-over';
  /* la brume qui traîne au ras du sol */
  for(let i=0;i<6;i++){const x=((i*230+t*12)%(W+300))-150-cx,y=MUR+120+i*90-cy;g.fillStyle=rad(g,x,y,0,120,[[0,'rgba(150,170,190,.06)'],[1,'rgba(150,170,190,0)']]);g.fillRect(x-120,y-60,240,120);}}
function acteurs(){const L=[];const t=now();
  /* le fût qui brûle : des flammes, des étincelles */
  L.push({y:FEU.y+1,f:(g,cx,cy)=>{if(!vu(FEU.x,FEU.y,cx,cy,60))return;const X=FEU.x-cx,Y=FEU.y-24-cy;for(let i=0;i<7;i++){const ph=(t*2.2+i*.37)%1,h=16+i%3*5;g.fillStyle=i%2?'rgba(255,200,60,'+(.9-ph*.8)+')':'rgba(255,110,30,'+(.85-ph*.7)+')';g.beginPath();g.ellipse(X-7+i*2.4+Math.sin(t*9+i)*2,Y-ph*h,3.4-ph*2,6-ph*3,0,0,7);g.fill();}
    for(let i=0;i<5;i++){const ph=(t*.9+i*.21)%1;g.fillStyle='rgba(255,200,120,'+(1-ph)+')';g.fillRect(X-6+Math.sin(i*3+t)*10,Y-10-ph*50,1.4,1.4);}}});
  /* les zombies */
  for(const z of Z)L.push({y:z.y,f:(g,cx,cy)=>{if(!vu(z.x,z.y,cx,cy,60))return;const T=TYPES[z.k],s=spriteZ(z.k,z.look,z.dir,Math.floor(z.f)%4);const X=Math.round(z.x-cx),Y=Math.round(z.y-cy),pen=Math.sin(z.f*1.6)*.06;
    g.fillStyle='rgba(0,0,0,.35)';g.beginPath();g.ellipse(X,Y,z.r+3,(z.r+3)*.4,0,0,7);g.fill();g.save();g.translate(X,Y);g.rotate(pen);g.drawImage(s.c,-s.ox,-s.oy,s.w,s.h);
    if(z.flash>0){g.globalCompositeOperation='lighter';g.globalAlpha=.55;g.drawImage(s.c,-s.ox,-s.oy,s.w,s.h);}g.restore();
    if(z.pv<z.pvm){const w=z.k==='roi'?56:22,yb=Y-s.oy-2;g.fillStyle='rgba(0,0,0,.6)';g.fillRect(X-w/2,yb,w,3);g.fillStyle=z.k==='roi'?'#ff5a3a':'#9aff6a';g.fillRect(X-w/2,yb,w*Math.max(0,z.pv/z.pvm),3);}}});
  /* les bonus, les grenades, les balles, les crachats, les particules */
  L.push({y:1e5-10,f:(g,cx,cy)=>{
    for(const o of OBJ){if(o.t==='bonus'){if(o.vie<3&&Math.sin(t*20)<0)continue;dessinerBonus(g,o.k,o.x-cx,o.y-cy,t);}else{g.fillStyle='#3a4a2a';g.beginPath();g.arc(o.x-cx,o.y-cy,3.4,0,7);g.fill();g.fillStyle='#ff3a2a';g.fillRect(o.x-cx-1,o.y-cy-5,2,2);}}
    for(const b of BAL){g.strokeStyle=S.arme===ARMES.laser?'#9af2ff':'#fff2a0';g.lineWidth=S.arme===ARMES.laser?2:1.3;g.beginPath();g.moveTo(b.x-cx,b.y-cy);g.lineTo(b.x-b.vx*.02-cx,b.y-b.vy*.02-cy);g.stroke();}
    for(const s of CRA){g.fillStyle='rgba(200,255,74,.35)';g.beginPath();g.arc(s.x-cx,s.y-cy,6,0,7);g.fill();g.fillStyle='#c8ff4a';g.beginPath();g.arc(s.x-cx,s.y-cy,3.4,0,7);g.fill();}
    for(const p of PART){g.globalAlpha=Math.min(1,p.vie*2.5);g.fillStyle=p.c;if(p.fum){g.beginPath();g.arc(p.x-cx,p.y-cy,p.r,0,7);g.fill();}else g.fillRect(p.x-cx-p.r/2,p.y-cy-p.r/2,p.r,p.r);}g.globalAlpha=1;}});
  /* la nuit, par-dessus tout ; puis les yeux qui luisent, les chiffres */
  L.push({y:1e5,f:(g,cx,cy)=>{dessinerNuit(g,cx,cy);
    for(const z of Z){if(!vu(z.x,z.y,cx,cy,40)||z.dir==='haut')continue;const T=TYPES[z.k],E=T.ech,X=z.x-cx,Y=z.y-cy-41*E,col=z.k==='cracheur'?'220,255,80':z.k==='roi'?'255,80,60':'170,255,100';
      g.fillStyle='rgba('+col+',.28)';g.beginPath();g.arc(X,Y,5*E,0,7);g.fill();g.fillStyle='rgba('+col+',1)';const o=z.dir==='gauche'?-2:z.dir==='droite'?2:0;g.fillRect(X-3*E+o,Y-.6,1.6*E,1.4);g.fillRect(X+1.4*E+o,Y-.6,1.6*E,1.4);}
    for(const tx of TXT){g.globalAlpha=Math.min(1,tx.vie*2.5);g.font='800 9px "Baloo 2",Arial';g.textAlign='center';g.fillStyle='#000';g.fillText(tx.t,tx.x-cx+.7,tx.y-cy+.7);g.fillStyle='#fff';g.fillText(tx.t,tx.x-cx,tx.y-cy);}g.globalAlpha=1;
    if(S.bonus.bouclier>S.t){g.strokeStyle='rgba(90,184,255,'+(.5+.3*Math.sin(t*8))+')';g.lineWidth=1.6;g.beginPath();g.ellipse(joueur.x-cx,joueur.y-28-cy,20,30,0,0,7);g.stroke();}}});
  return L;}
/* l'arme dans la main du joueur, tournée vers la cible */
window.AURA_DEVANT=(g,px,py)=>{if(!S.on||S.mort)return;const a=S.ang;g.save();g.translate(px,py-30);g.rotate(a);if(Math.cos(a)<0)g.scale(1,-1);
  g.fillStyle='#e8b088';g.fillRect(2,-1.6,6,3.2);g.fillStyle=S.arme.c;g.fillRect(6,-2.6,S.arme.l,4.2);g.fillStyle='#16161a';g.fillRect(6,0,3,4.5);if(S.arme===ARMES.pompe){g.fillStyle='#8a5a2a';g.fillRect(9,1,6,2.4);}
  if(S.flash>0){g.fillStyle='rgba(255,240,160,.95)';g.beginPath();g.moveTo(6+S.arme.l,-.4);g.lineTo(6+S.arme.l+9,-3.4);g.lineTo(6+S.arme.l+11,-.4);g.lineTo(6+S.arme.l+9,2.6);g.closePath();g.fill();}g.restore();};
function figurants(){return [];}

/* ---------- L'INTERFACE ---------- */
const CSS=`#zh{position:fixed;left:0;right:0;top:calc(62px + env(safe-area-inset-top));display:flex;align-items:flex-start;gap:10px;padding:0 12px;pointer-events:none;z-index:950;font-family:'Baloo 2',system-ui,sans-serif;color:#fff}
#zh .pv{flex:1;max-width:170px}#zh .bar{height:12px;border-radius:6px;background:rgba(0,0,0,.55);box-shadow:inset 0 0 0 1.5px rgba(255,255,255,.18);overflow:hidden}#zh .bar i{display:block;height:100%;width:100%;background:linear-gradient(#8aff8a,#2ab84a);transition:width .15s}#zh .bar i.bas{background:linear-gradient(#ff8a7a,#d82a2a)}
#zh small{display:block;font-weight:800;font-size:12px;text-shadow:0 1px 2px #000;margin-top:2px}#zh .sc{margin-left:auto;text-align:right;text-shadow:0 2px 3px #000}#zh .sc b{display:block;font:800 22px/1 'Baloo 2',sans-serif}
#zGre{position:fixed;right:18px;bottom:calc(150px + env(safe-area-inset-bottom));width:70px;height:70px;border-radius:50%;border:3px solid rgba(255,255,255,.4);background:radial-gradient(circle at 40% 35%,#6a7a4a,#2a3a1a);box-shadow:0 6px 16px rgba(0,0,0,.5);overflow:hidden;z-index:950;padding:0}
#zGre i{position:absolute;left:0;right:0;bottom:0;background:rgba(0,0,0,.6)}#zGre canvas{position:relative;z-index:1;width:70px;height:70px}
#zBan{position:fixed;left:0;right:0;top:30%;text-align:center;pointer-events:none;opacity:0;transform:scale(.85);transition:opacity .4s,transform .4s;z-index:950;font-family:'Baloo 2',sans-serif}
#zBan.on{opacity:1;transform:none}#zBan b{display:block;font:400 50px/1 'Creepster','Baloo 2',cursive;color:#a8ff7a;text-shadow:0 0 18px rgba(120,255,90,.6),0 4px 0 #1a3a10}#zBan small{font-weight:800;font-size:16px;color:#fff;text-shadow:0 2px 3px #000}
#zFin{position:fixed;inset:0;z-index:2147482300;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;padding:24px;text-align:center;background:radial-gradient(ellipse at 50% 30%,rgba(30,60,20,.92),rgba(4,6,10,.97) 70%);font-family:'Baloo 2',sans-serif;color:#fff}
#zFin h1{margin:0;font:400 54px/.95 'Creepster','Baloo 2',cursive;color:#a8ff7a;text-shadow:0 0 22px rgba(120,255,90,.55),0 5px 0 #1a3a10}
#zFin .res{display:grid;grid-template-columns:1fr 1fr;gap:8px;width:100%;max-width:320px}#zFin .res div{background:rgba(255,255,255,.08);border-radius:14px;padding:8px}#zFin .res b{display:block;font-size:24px}#zFin .res small{opacity:.75;font-weight:700}
#zFin .gain{font:800 26px 'Baloo 2',sans-serif;color:#ffd84a}#zFin .cls{width:100%;max-width:320px;font-weight:700;font-size:14px;background:rgba(0,0,0,.35);border-radius:14px;padding:8px 12px;text-align:left}#zFin .cls div{display:flex;justify-content:space-between}#zFin .cls .moi{color:#a8ff7a}
#zFin .gros{border:0;border-radius:18px;padding:15px 34px;font:800 20px 'Baloo 2',sans-serif;color:#0a1a04;background:linear-gradient(#c8ff9a,#6ad83a);box-shadow:0 5px 0 #2a7a14,0 10px 22px rgba(0,0,0,.5)}#zFin .lien{border:0;background:none;color:#fff;opacity:.8;font:800 15px 'Baloo 2',sans-serif;text-decoration:underline}`;
(()=>{if(!document.getElementById('zCss')){const l=document.createElement('link');l.rel='stylesheet';l.href='https://fonts.googleapis.com/css2?family=Creepster&display=swap';document.head.appendChild(l);const s=document.createElement('style');s.id='zCss';s.textContent=CSS;document.head.appendChild(s);}
  const h=document.createElement('div');h.id='zh';h.innerHTML='<div class="pv"><div class="bar"><i id="zPv"></i></div><small id="zVa">Vague 1</small><small id="zAr">Pistolet</small></div><div class="sc"><b id="zSc">0</b><small id="zTu">0 zombie</small></div>';document.body.appendChild(h);
  const b=document.createElement('button');b.id='zGre';b.setAttribute('aria-label','Grenade');const c=document.createElement('canvas');c.width=140;c.height=140;const q=c.getContext('2d');q.scale(2,2);
  q.fillStyle=rad(q,32,36,2,16,[[0,'#8a9a5a'],[1,'#3a4a1a']]);q.beginPath();q.ellipse(35,40,13,15,0,0,7);q.fill();q.strokeStyle='rgba(0,0,0,.35)';q.lineWidth=1;for(const y of [33,40,47]){q.beginPath();q.moveTo(23,y);q.lineTo(47,y);q.stroke();}
  q.fillStyle='#5a5e66';q.fillRect(30,21,10,7);q.strokeStyle='#c8ccd2';q.lineWidth=2;q.beginPath();q.arc(45,22,5,0,7);q.stroke();q.fillStyle='#fff';q.font='800 9px "Baloo 2",Arial';q.textAlign='center';q.fillText('GRENADE',35,64);
  b.appendChild(c);const i=document.createElement('i');i.id='zGreC';i.style.height='0';b.appendChild(i);b.addEventListener('pointerdown',ev=>{ev.stopPropagation();ev.preventDefault();grenade();});document.body.appendChild(b);
  const n=document.createElement('div');n.id='zBan';n.innerHTML='<b id="zBanB"></b><small id="zBanS"></small>';document.body.appendChild(n);
  setInterval(()=>{const v=window.ECRAN_COUVRANT||!S.on||S.mort;h.style.display=v?'none':'flex';b.style.display=v?'none':'block';},250);})();
let banT=0;function banniere(a,b){const n=document.getElementById('zBan');if(!n)return;document.getElementById('zBanB').textContent=a;document.getElementById('zBanS').textContent=b||'';n.classList.add('on');clearTimeout(banT);banT=setTimeout(()=>n.classList.remove('on'),2300);}
function majHud(){const g_=id=>document.getElementById(id);if(!g_('zPv'))return;const pv=Math.max(0,S.pv);g_('zPv').style.width=pv+'%';g_('zPv').className=pv<35?'bas':'';g_('zVa').textContent='Vague '+Math.max(1,S.vague);
  g_('zAr').textContent=S.arme.ic+' '+S.arme.nom+(S.armeFin?' · '+Math.max(0,Math.ceil(S.armeFin-S.t))+' s':'');g_('zSc').textContent=S.score.toLocaleString('fr-FR');g_('zTu').textContent=S.tues+' zombie'+(S.tues>1?'s':'');}
setInterval(()=>{if(S.on&&S.armeFin)majHud();},500);
async function mourir(){if(S.mort)return;S.mort=true;son('mort');try{vibrer([80,60,200]);}catch(x){}window.BOOST_CAFE=null;
  const rec=Math.max(+(localStorage.getItem('bd_zomb_rec')||0),S.score);try{localStorage.setItem('bd_zomb_rec',rec);}catch(x){}
  const f=document.createElement('div');f.id='zFin';f.innerHTML='<h1>Dévoré…</h1><div class="res"><div><b>'+S.score.toLocaleString('fr-FR')+'</b><small>points</small></div><div><b>'+S.vague+'</b><small>vague</small></div><div><b>'+S.tues+'</b><small>zombies</small></div><div><b>'+rec.toLocaleString('fr-FR')+'</b><small>ton record</small></div></div><div class="gain"></div><div class="cls" style="display:none"></div><button class="gros">REJOUER</button><button class="lien">Rentrer sur la place</button>';
  setTimeout(()=>{document.body.appendChild(f);window.ECRAN_COUVRANT=true;},900);
  f.querySelector('.gros').onclick=()=>{f.remove();window.ECRAN_COUVRANT=false;Z=[];try{joueur.x=DEPART[0];joueur.y=DEPART[1];}catch(x){}nouvelle();};f.querySelector('.lien').onclick=()=>sortir();
  const r=S.id?await rpcS('zombies_fin',{p_id:S.id,p_score:S.score,p_vague:S.vague,p_tues:S.tues}):null;
  if(r&&r.ok){if(r.gain>0){f.querySelector('.gain').textContent='+ '+Math.floor(r.gain/100).toLocaleString('fr-FR')+' €';try{e.euros=r.euros;majHaut();sauver();}catch(x){}}else if(r.plafond)f.querySelector('.gain').textContent='Plafond du jour atteint : la gloire seulement !';
    if(Array.isArray(r.classement)&&r.classement.length){const c=f.querySelector('.cls');c.innerHTML='<div style="opacity:.7;justify-content:center">🏆 Les meilleurs survivants</div>'+r.classement.map((x,i)=>'<div'+(x.moi?' class="moi"':'')+'><span>'+(i+1)+'. '+String(x.pseudo||'?').replace(/[<>&]/g,'')+'</span><b>'+(+x.score).toLocaleString('fr-FR')+'</b></div>').join('');c.style.display='';}}}
let PARTI=false;function sortir(){if(PARTI)return;PARTI=true;S.on=false;window.BOOST_CAFE=null;try{sauver();}catch(x){}
  try{const f=document.createElement('div');f.style.cssText='position:fixed;inset:0;z-index:2147483000;background:#06080f;opacity:0;transition:opacity .45s;pointer-events:none';document.body.appendChild(f);requestAnimationFrame(()=>f.style.opacity='1');}catch(x){}
  setTimeout(()=>{const v=window.MA_VERSION?('&v='+encodeURIComponent(window.MA_VERSION)):'';location.href='spawn.html?de=zombies'+v+'&t='+Date.now();},480);}
setInterval(()=>{try{if(!PARTI&&typeof joueur!=='undefined'&&joueur.x<16&&joueur.y>PORTE.y0&&joueur.y<PORTE.y1)sortir();}catch(x){}},150);
/* LA PARTIE COMMENCE dès que le voile se lève */
setTimeout(()=>{const v=document.getElementById('voileZO');if(v){v.style.opacity='0';setTimeout(()=>v.remove(),800);}nouvelle();},1400);

return {sol,solFin,decor,bloque,graver,depart:DEPART,figurants,acteurs};
})()
