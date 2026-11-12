/* =====================================================================
   LA FÊTE FORAINE DU PRADO (foire.html) — un lieu à part entière.
   Au fond, sous le ciel du soir : la grande roue qui tourne, la silhouette
   de Marseille et Notre-Dame de la Garde. Devant : les baraques (chamboule-
   tout, tir aux canards, pêche aux canards, le guichet des lots), le
   carrousel, la piste des auto-tamponneuses, des guirlandes d'ampoules.
   Les jeux se jouent dans leur propre écran (forain.js) et rapportent des
   tickets, qu'on échange au guichet contre des lots.
   Chargé par moteur.js (eval direct).
   ===================================================================== */
(()=>{
const W=1800, H=1100, Y0=430;
const CX=900;
const DEPART=[900,1040];
const hA=(x,y,k)=>{let n=((x*73856093)^(y*19349663)^(k*83492791))|0;n=(n^(n>>>13))*1274126177|0;return((n^(n>>>16))>>>0)/4294967296;};
const R=(g,x,y,w,h,c)=>{g.fillStyle=c;g.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h));};
const txt=(g,s,x,y,px,c,al,f)=>{g.fillStyle=c;g.font=(f||'900')+' '+px+'px "Baloo 2","Helvetica Neue",Arial,sans-serif';g.textAlign=al||'center';g.textBaseline='middle';g.fillText(s,x,y);};
const toile=(w,h,f)=>{const c=document.createElement('canvas');c.width=w;c.height=h;const g=c.getContext('2d');g.imageSmoothingEnabled=false;f(g);return c;};

/* ---------- LE SOL ET LE CIEL ---------- */
function peindreSol(g){
  /* le ciel du soir : bleu nuit en haut, rose et orangé à l'horizon */
  const ci=g.createLinearGradient(0,0,0,Y0);ci.addColorStop(0,'#141a4a');ci.addColorStop(.42,'#33266e');ci.addColorStop(.74,'#a2477a');ci.addColorStop(.92,'#f2885e');ci.addColorStop(1,'#ffc078');
  g.fillStyle=ci;g.fillRect(0,0,W,Y0);
  for(let i=0;i<140;i++){const x=hA(i,1,3)*W,y=hA(i,2,3)*Y0*.55;g.fillStyle='rgba(255,255,255,'+(.25+hA(i,3,3)*.6)+')';g.fillRect(Math.round(x),Math.round(y),hA(i,4,3)<.12?2:1,hA(i,4,3)<.12?2:1);}
  /* la lune */
  g.fillStyle='rgba(255,246,220,.18)';g.beginPath();g.arc(1520,92,34,0,7);g.fill();g.fillStyle='#fff4d8';g.beginPath();g.arc(1520,92,22,0,7);g.fill();g.fillStyle='rgba(220,200,160,.5)';g.beginPath();g.arc(1513,86,4,0,7);g.arc(1527,99,3,0,7);g.fill();
  /* les collines et Notre-Dame de la Garde */
  g.fillStyle='#3a2458';g.beginPath();g.moveTo(0,Y0-70);for(let x=0;x<=W;x+=20)g.lineTo(x,Y0-80-Math.sin(x/260)*22-Math.max(0,140-Math.abs(x-1380)*.7));g.lineTo(W,Y0);g.lineTo(0,Y0);g.fill();
  const nx=1380,ny=Y0-224;R(g,nx-22,ny+30,44,30,'#2a1a44');R(g,nx-10,ny-6,20,40,'#2a1a44');R(g,nx-6,ny-22,12,18,'#2a1a44');R(g,nx-3,ny-34,6,14,'#2a1a44');
  g.fillStyle='#ffd25a';g.fillRect(nx-2,ny-44,4,10);g.fillStyle='rgba(255,210,90,.35)';g.beginPath();g.arc(nx,ny-40,9,0,7);g.fill();
  for(let i=0;i<5;i++)R(g,nx-16+i*8,ny+38,3,5,'rgba(255,220,140,.7)');
  /* la ville au loin, ses fenêtres allumées */
  for(let i=0;i<60;i++){const x=i*31+hA(i,7,1)*10,h=24+hA(i,8,1)*56,y=Y0-h;if(Math.abs(x-nx)<60)continue;R(g,x,y,26+hA(i,9,1)*10,h,i%2?'#24183e':'#2c1e48');
    for(let k=0;k<6;k++)if(hA(i,k,5)<.45)R(g,x+3+(k%3)*7,y+5+Math.floor(k/3)*9,3,4,hA(i,k,6)<.7?'#ffd27a':'#9ad0ff');}
  /* le sol de la foire : un bitume chaud, une grande allée pavée */
  const so=g.createLinearGradient(0,Y0,0,H);so.addColorStop(0,'#5e4e5c');so.addColorStop(1,'#6e5e66');g.fillStyle=so;g.fillRect(0,Y0,W,H-Y0);
  for(let i=0;i<2600;i++){const x=hA(i,11,2)*W,y=Y0+hA(i,12,2)*(H-Y0);g.fillStyle=hA(i,13,2)<.5?'rgba(0,0,0,.10)':'rgba(255,255,255,.05)';g.fillRect(Math.round(x),Math.round(y),2,1);}
  /* l'allée centrale, de l'entrée à la grande roue */
  g.fillStyle='#8a7a76';g.fillRect(CX-90,Y0+40,180,H-Y0-40);for(let y=Y0+40;y<H;y+=18)for(let x=CX-90+((y/18)%2?9:0);x<CX+90;x+=18){R(g,x,y,17,17,hA(x,y,4)<.5?'#9a8a84':'#90807c');R(g,x,y,17,1,'rgba(255,255,255,.08)');}
  /* l'allée des baraques, au pied du fond */
  g.fillStyle='#86766e';g.fillRect(0,Y0+40,W,70);for(let x=0;x<W;x+=18)for(let y=Y0+40;y<Y0+110;y+=18){R(g,x,y,17,17,hA(x,y,5)<.5?'#968680':'#8c7c76');}
  R(g,0,Y0+108,W,3,'rgba(0,0,0,.25)');
  /* les flaques de lumière chaude sous les baraques et les manèges */
  const halo=(x,y,r,c)=>{const q=g.createRadialGradient(x,y,4,x,y,r);q.addColorStop(0,c);q.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=q;g.fillRect(x-r,y-r,2*r,2*r);};
  for(const x of [170,430,900,1370,1630])halo(x,Y0+60,180,'rgba(255,200,110,.32)');
  halo(470,800,220,'rgba(255,180,220,.28)');halo(1360,800,240,'rgba(140,210,255,.24)');halo(CX,H-40,180,'rgba(255,200,120,.2)');
  /* les confettis et les tickets tombés par terre */
  for(let i=0;i<260;i++){const x=hA(i,21,2)*W,y=Y0+120+hA(i,22,2)*(H-Y0-140);g.fillStyle=['#ff5a7a','#ffd24a','#5ad0ff','#7ee08a','#ffffff'][i%5];g.globalAlpha=.5;g.fillRect(Math.round(x),Math.round(y),2,2);}g.globalAlpha=1;
  /* la piste des auto-tamponneuses : un plancher de métal, une bordure de caoutchouc */
  const tx=TAMP.x0,ty=TAMP.y0,tw=TAMP.x1-TAMP.x0,th=TAMP.y1-TAMP.y0;
  R(g,tx-10,ty-10,tw+20,th+20,'#1a1a22');R(g,tx-8,ty-8,tw+16,th+16,'#e8c050');R(g,tx-5,ty-5,tw+10,th+10,'#2a2a36');
  for(let x=tx;x<tx+tw;x+=24)for(let y=ty;y<ty+th;y+=24){R(g,x,y,23,23,((x+y)/24)%2?'#5a6070':'#525866');R(g,x+2,y+2,3,3,'rgba(255,255,255,.12)');}
  for(let x=tx-8;x<tx+tw+8;x+=16)R(g,x,ty-8,8,3,'#1a1a22');
  /* l'aire du carrousel */
  g.fillStyle='rgba(0,0,0,.25)';g.beginPath();g.ellipse(CAR.x,CAR.y+8,CAR.r+20,CAR.r*.42+12,0,0,7);g.fill();
  /* l'entrée, en bas : le sol rouge du tapis */
  R(g,CX-56,H-70,112,70,'#8a2a30');for(let y=H-70;y<H;y+=6)R(g,CX-56,y,112,1,'rgba(0,0,0,.12)');
}
function sol(){const c=document.createElement('canvas');c.width=W;c.height=H;peindreSol(c.getContext('2d'));return c;}
function solFin(){const c=document.createElement('canvas');c.width=W*2;c.height=H*2;const g=c.getContext('2d');g.setTransform(2,0,0,2,0,0);peindreSol(g);return c;}

/* ---------- LES BARAQUES ----------
   Une façade de foire : un auvent rayé à festons, une enseigne bordée d'ampoules,
   le comptoir, et ce qu'on voit derrière (les boîtes, les canards, le bassin). */
const BAR=[
 {k:'chamboule',x:170,nom:'CHAMBOULE-TOUT',c1:'#e8302a',c2:'#ffffff',enseigne:'#1f3a8a',prix:3,dedans:'boites'},
 {k:'tir',x:430,nom:'TIR AUX CANARDS',c1:'#1f5fa8',c2:'#ffd24a',enseigne:'#8a1a2a',prix:4,dedans:'canards'},
 {k:'peche',x:1370,nom:'PÊCHE AUX CANARDS',c1:'#2ab0a0',c2:'#ffffff',enseigne:'#6a2a8a',prix:2,dedans:'bassin'},
 {k:'lots',x:1630,nom:'LOTS & TICKETS',c1:'#7a3ad0',c2:'#ffd24a',enseigne:'#1a1a2a',prix:0,dedans:'lots'}];
const BW=232,BH=196;
function facade(B){return toile(BW,BH,g=>{
  const L=(x,y,w,h,c)=>R(g,x,y,w,h,c);
  /* les poteaux et le fond */
  L(8,46,BW-16,BH-46,'#2a1a26');L(14,92,BW-28,70,'#1a1018');
  /* ce qu'on voit derrière le comptoir */
  if(B.dedans==='boites'){for(let r=0;r<3;r++)for(let k=0;k<3-r;k++){const x=BW/2-27+k*18+r*9,y=140-r*16;L(x,y,14,15,['#e8302a','#3a8ad8','#ffd24a'][(r+k)%3]);L(x,y,14,2,'#ffffff');L(x+10,y+2,2,13,'rgba(0,0,0,.25)');}
    L(BW/2-40,155,80,5,'#8a5a30');for(const x of [30,BW-46])for(let r=0;r<2;r++)L(x+r*4,110+r*18,14,15,['#ffd24a','#e8302a'][r]);}
  if(B.dedans==='canards'){for(let r=0;r<2;r++){L(18,104+r*26,BW-36,4,'#6a5a4a');for(let k=0;k<7;k++){const x=26+k*27+(r?13:0),y=92+r*26;L(x,y+3,14,9,r?'#ffd24a':'#f2f2f2');L(x+10,y,7,7,r?'#ffd24a':'#f2f2f2');L(x+16,y+3,4,2,'#ff8a2a');L(x+12,y+2,2,2,'#1a1a1a');}}
    for(const x of [28,BW-42])L(x,150,14,6,'#5a3a2a');L(BW/2-30,150,60,4,'#3a2a20');}
  if(B.dedans==='bassin'){L(20,128,BW-40,30,'#1a6a9a');L(20,128,BW-40,3,'#7ad0f0');for(let k=0;k<8;k++){const x=30+k*22,y=134+(k%2)*8;L(x,y,10,7,'#ffd24a');L(x+7,y-4,6,6,'#ffd24a');L(x+12,y-2,3,2,'#ff7a2a');}
    for(let k=0;k<5;k++){const x=24+k*40;L(x,100,22,24,['#ff7aa0','#7ad0ff','#ffd24a','#9a7aff','#7ee08a'][k]);L(x+4,96,6,6,['#ff7aa0','#7ad0ff','#ffd24a','#9a7aff','#7ee08a'][k]);L(x+12,96,6,6,['#ff7aa0','#7ad0ff','#ffd24a','#9a7aff','#7ee08a'][k]);L(x+6,106,2,2,'#1a1a1a');L(x+14,106,2,2,'#1a1a1a');}}
  if(B.dedans==='lots'){for(let r=0;r<3;r++){L(18,100+r*20,BW-36,3,'#6a4a2a');for(let k=0;k<8;k++){const c=['#ff7aa0','#7ad0ff','#ffd24a','#9a7aff','#7ee08a','#ff9a4a'][(k+r*2)%6],x=24+k*23,y=86+r*20;L(x,y,14,14,c);L(x+2,y-3,4,4,c);L(x+8,y-3,4,4,c);L(x+4,y+4,2,2,'#1a1a1a');L(x+8,y+4,2,2,'#1a1a1a');}}}
  /* le comptoir */
  L(4,BH-38,BW-8,38,B.c1);L(4,BH-38,BW-8,5,'#ffffff');for(let x=14;x<BW-10;x+=26)L(x,BH-30,13,28,B.c2);L(4,BH-6,BW-8,6,'rgba(0,0,0,.3)');
  /* l'auvent rayé et ses festons */
  for(let x=0;x<BW;x+=20){L(x,30,20,30,((x/20)%2)?B.c2:B.c1);}
  for(let x=0;x<BW;x+=20){g.fillStyle=((x/20)%2)?B.c2:B.c1;g.beginPath();g.arc(x+10,60,10,0,Math.PI);g.fill();}
  L(0,30,BW,3,'rgba(255,255,255,.4)');
  /* les poteaux */
  for(const x of [0,BW-8]){L(x,30,8,BH-30,'#d8b060');L(x+5,30,3,BH-30,'#8a6a30');}
  /* l'enseigne */
  L(16,0,BW-32,32,'#ffd24a');L(19,3,BW-38,26,B.enseigne);
  g.fillStyle='#ffffff';g.font='900 '+(B.nom.length>15?14:16)+'px "Baloo 2","Helvetica Neue",Arial,sans-serif';g.textAlign='center';g.textBaseline='middle';
  g.fillStyle='rgba(0,0,0,.4)';g.fillText(B.nom,BW/2+1,17+1);g.fillStyle='#ffffff';g.fillText(B.nom,BW/2,17);
  if(false){L(BW-58,BH-60,48,18,'#ffffff');L(BW-56,BH-58,44,14,'#e8302a');g.font='900 11px "Baloo 2",Arial,sans-serif';g.fillStyle='#fff';g.fillText(B.prix+' €',BW-34,BH-51);}
});}
const FAC={};function fac(B){return FAC[B.k]||(FAC[B.k]=facade(B));}

/* ---------- LA GRANDE ROUE ---------- */
const ROUE={x:CX,y:Y0-200,r:176,n:16};
const COUL=['#e8302a','#ffd24a','#3a9ad8','#7ee08a','#ff7aa0','#9a7aff','#ff9a4a','#2ab0a0'];
function dessinerRoue(g,ox,oy,t){const a0=t*.12,{x,y,r,n}=ROUE,X=x+ox,Y=y+oy;
  /* les pieds en A */
  g.strokeStyle='#c8ccd8';g.lineWidth=7;g.beginPath();g.moveTo(X,Y);g.lineTo(X-110,Y0+oy+4);g.moveTo(X,Y);g.lineTo(X+110,Y0+oy+4);g.stroke();
  g.strokeStyle='#8a90a0';g.lineWidth=3;g.beginPath();g.moveTo(X-58,Y+(Y0+oy-Y)*.52);g.lineTo(X+58,Y+(Y0+oy-Y)*.52);g.stroke();
  /* la jante, les rayons */
  g.strokeStyle='rgba(255,255,255,.85)';g.lineWidth=3;g.beginPath();g.arc(X,Y,r,0,7);g.stroke();g.lineWidth=2;g.strokeStyle='rgba(220,226,240,.75)';g.beginPath();g.arc(X,Y,r-12,0,7);g.stroke();
  g.lineWidth=1.5;for(let i=0;i<n;i++){const a=a0+i/n*Math.PI*2;g.beginPath();g.moveTo(X,Y);g.lineTo(X+Math.cos(a)*r,Y+Math.sin(a)*r);g.stroke();}
  /* les ampoules qui courent sur la jante */
  for(let i=0;i<64;i++){const a=a0+i/64*Math.PI*2,on=((i+Math.floor(t*6))%4)===0;const bx=X+Math.cos(a)*r,by=Y+Math.sin(a)*r;
    if(on){g.fillStyle='rgba(255,230,140,.35)';g.beginPath();g.arc(bx,by,6,0,7);g.fill();}g.fillStyle=on?'#fff6c0':COUL[i%8];g.beginPath();g.arc(bx,by,2,0,7);g.fill();}
  /* le moyeu */
  g.fillStyle='#ffd24a';g.beginPath();g.arc(X,Y,14,0,7);g.fill();g.fillStyle='#e8302a';g.beginPath();g.arc(X,Y,7,0,7);g.fill();
  /* les nacelles : elles restent droites, suspendues */
  for(let i=0;i<n;i++){const a=a0+i/n*Math.PI*2,cx=X+Math.cos(a)*r,cy=Y+Math.sin(a)*r,c=COUL[i%8];
    g.strokeStyle='#d8dce8';g.lineWidth=1.5;g.beginPath();g.moveTo(cx,cy);g.lineTo(cx,cy+8);g.stroke();
    g.fillStyle=c;g.beginPath();g.moveTo(cx-11,cy+8);g.lineTo(cx+11,cy+8);g.lineTo(cx+9,cy+24);g.lineTo(cx-9,cy+24);g.closePath();g.fill();
    g.fillStyle='rgba(255,255,255,.3)';g.fillRect(cx-10,cy+8,20,3);g.fillStyle='rgba(20,20,40,.55)';g.fillRect(cx-7,cy+12,14,6);
    g.fillStyle='#fff2b0';g.fillRect(cx-1,cy+25,2,2);}}
/* la cabane de la grande roue, à son pied */
const CABANE=toile(150,92,g=>{R(g,10,30,130,62,'#2a1a3a');R(g,0,20,150,14,'#ffd24a');for(let x=0;x<150;x+=15)R(g,x,20,7,14,'#e8302a');
  R(g,18,44,52,30,'#1a3050');R(g,20,46,48,26,'#7ad0ff');R(g,20,46,48,4,'#c8f0ff');R(g,84,40,46,52,'#5a2a1a');R(g,88,44,38,44,'#7a3a22');R(g,120,64,3,3,'#ffd24a');
  R(g,22,0,106,20,'#1f3a8a');R(g,24,2,102,16,'#e8302a');g.fillStyle='#fff';g.font='900 12px "Baloo 2",Arial,sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText('GRANDE ROUE',75,10);
  R(g,28,76,36,12,'#ffffff');g.fillStyle='#e8302a';g.font='900 9px "Baloo 2",Arial,sans-serif';g.fillText('UN TOUR !',46,82);});

/* ---------- LE CARROUSEL ---------- */
const CAR={x:470,y:800,r:118};
const CHEV=['#ffffff','#ffd24a','#ff9ab8','#9ad8ff','#c8a8ff','#ffffff','#ffd24a','#ff9ab8'];
function dessinerCarrousel(g,ox,oy,t,devant){const {x,y,r}=CAR,X=x+ox,Y=y+oy,ry=r*.36,a0=t*.55;
  if(!devant){
    /* le plancher et la colonne centrale */
    g.fillStyle='#8a2a3a';g.beginPath();g.ellipse(X,Y,r,ry,0,0,7);g.fill();g.fillStyle='#b8404a';g.beginPath();g.ellipse(X,Y-4,r,ry,0,0,7);g.fill();
    g.strokeStyle='#ffd24a';g.lineWidth=2;g.beginPath();g.ellipse(X,Y-4,r-4,ry-2,0,0,7);g.stroke();
    g.fillStyle='#ffd24a';g.fillRect(X-9,Y-128,18,124);g.fillStyle='#e8302a';for(let k=0;k<6;k++)g.fillRect(X-9,Y-120+k*20,18,6);}
  /* les chevaux de bois, derrière puis devant la colonne */
  for(let i=0;i<8;i++){const a=a0+i/8*Math.PI*2,s=Math.sin(a),front=s>0;if(front!==!!devant)continue;
    const hx=X+Math.cos(a)*(r-24),hy=Y-4+s*(ry-10),bob=Math.sin(t*3+i*1.3)*6,sc=.85+.15*(s+1)/2,c=CHEV[i];
    g.strokeStyle='#ffd24a';g.lineWidth=2;g.beginPath();g.moveTo(hx,Y-132);g.lineTo(hx,hy-6);g.stroke();
    const dir=Math.cos(a+Math.PI/2)>0?1:-1;g.save();g.translate(hx,hy-24+bob);g.scale(sc*dir,sc);
    g.fillStyle=c;g.fillRect(-14,-6,26,11);g.fillRect(8,-16,8,14);g.fillRect(12,-20,9,8);g.fillRect(-12,5,4,12);g.fillRect(6,5,4,12);g.fillRect(-16,-4,4,9);
    g.fillStyle='#e8302a';g.fillRect(-6,-9,10,4);g.fillStyle='#1a1a1a';g.fillRect(17,-17,2,2);g.fillStyle='#c8a040';g.fillRect(9,-20,3,10);
    g.restore();}
  if(devant){
    /* le toit à festons, ses ampoules */
    const ty=Y-150;g.fillStyle='#e8302a';g.beginPath();g.moveTo(X,ty-46);g.lineTo(X+r+8,ty+8);g.lineTo(X-r-8,ty+8);g.closePath();g.fill();
    for(let k=0;k<8;k++){g.fillStyle=k%2?'#ffffff':'#e8302a';g.beginPath();g.moveTo(X,ty-46);g.lineTo(X-r-8+k*(2*r+16)/8,ty+8);g.lineTo(X-r-8+(k+1)*(2*r+16)/8,ty+8);g.closePath();g.fill();}
    g.fillStyle='#ffd24a';g.fillRect(X-r-10,ty+6,2*r+20,8);
    for(let k=0;k<12;k++){const fx=X-r-10+k*(2*r+20)/12;g.fillStyle=k%2?'#e8302a':'#ffffff';g.beginPath();g.arc(fx+(2*r+20)/24,ty+14,(2*r+20)/24,0,Math.PI);g.fill();}
    for(let k=0;k<20;k++){const on=((k+Math.floor(t*5))%3)===0,fx=X-r-6+k*(2*r+12)/19;g.fillStyle=on?'#fff6c0':'#a87a30';g.beginPath();g.arc(fx,ty+10,on?2.4:1.8,0,7);g.fill();}
    g.fillStyle='#ffd24a';g.beginPath();g.arc(X,ty-50,6,0,7);g.fill();
    g.fillStyle='#e8302a';g.fillRect(X-1,ty-70,2,18);g.beginPath();g.moveTo(X+1,ty-70);g.lineTo(X+14,ty-65);g.lineTo(X+1,ty-60);g.fill();}}

/* ---------- LES AUTO-TAMPONNEUSES ----------
   Six voitures qui se cognent et rebondissent, avec leur perche à étincelles. */
const TAMP={x0:1180,y0:690,x1:1560,y1:900};
const AUTOS=[];for(let i=0;i<6;i++)AUTOS.push({x:TAMP.x0+50+hA(i,1,9)*(TAMP.x1-TAMP.x0-100),y:TAMP.y0+40+hA(i,2,9)*(TAMP.y1-TAMP.y0-80),a:hA(i,3,9)*6.28,v:46+hA(i,4,9)*30,c:COUL[(i*3)%8],choc:0});
let tAuto=0;
function bougerAutos(dt){for(const A of AUTOS){A.a+=(hA(Math.floor(tAuto*.5),AUTOS.indexOf(A),5)-.5)*dt*1.6;A.x+=Math.cos(A.a)*A.v*dt;A.y+=Math.sin(A.a)*A.v*dt*.7;
   if(A.x<TAMP.x0+22||A.x>TAMP.x1-22){A.a=Math.PI-A.a;A.x=Math.max(TAMP.x0+22,Math.min(TAMP.x1-22,A.x));A.choc=.3;}
   if(A.y<TAMP.y0+20||A.y>TAMP.y1-12){A.a=-A.a;A.y=Math.max(TAMP.y0+20,Math.min(TAMP.y1-12,A.y));A.choc=.3;}A.choc=Math.max(0,A.choc-dt);}
  for(let i=0;i<AUTOS.length;i++)for(let j=i+1;j<AUTOS.length;j++){const a=AUTOS[i],b=AUTOS[j],dx=b.x-a.x,dy=(b.y-a.y)*1.4,d=Math.hypot(dx,dy);if(d<34&&d>0){const t=a.a;a.a=b.a;b.a=t;a.x-=dx/d*3;b.x+=dx/d*3;a.y-=dy/d*2;b.y+=dy/d*2;a.choc=b.choc=.35;}}}
const PERSOS_AUTO=[{peau:2,cheveux:1,coiffe:2,haut:1,veste:'#e8302a'},{peau:5,cheveux:0,coiffe:3,haut:0,veste:'#2a3a5a'},{peau:1,cheveux:3,coiffe:5,haut:3,veste:'#ff9ab8'},{peau:4,cheveux:6,coiffe:1,haut:1,veste:'#ffd24a'},{peau:3,cheveux:2,coiffe:0,haut:4,veste:'#7ee08a'},{peau:6,cheveux:7,coiffe:6,haut:0,veste:'#9a7aff'}];
function dessinerAuto(g,A,ox,oy,i,t){const X=A.x+ox,Y=A.y+oy,dir=Math.cos(A.a)>=0?1:-1;
  g.fillStyle='rgba(0,0,0,.35)';g.beginPath();g.ellipse(X,Y+3,22,8,0,0,7);g.fill();
  g.fillStyle='#1a1a22';g.beginPath();g.ellipse(X,Y,22,9,0,0,7);g.fill();
  g.fillStyle=A.c;g.fillRect(X-18,Y-14,36,14);g.fillStyle='rgba(255,255,255,.35)';g.fillRect(X-18,Y-14,36,3);g.fillRect(X+dir*10,Y-20,dir*8,7);
  /* le conducteur */
  try{const ap=Object.assign({bas:0,pantalon:'#2a2a34',souliers:0,chaussures:0,sac:0,chapeau:0,raye:0,motif:0,barbe:0,_civil:true},PERSOS_AUTO[i]);
    g.save();g.beginPath();g.rect(X-30,Y-60,60,48);g.clip();personne(g,X-dir*2,Y+6,ap,dir>0?'droite':'gauche',0,false);g.restore();}catch(z){}
  g.fillStyle=A.c;g.fillRect(X-18,Y-12,36,8);
  /* la perche et ses étincelles au plafond */
  g.strokeStyle='#c8ccd8';g.lineWidth=1.5;g.beginPath();g.moveTo(X-dir*12,Y-12);g.lineTo(X-dir*12,Y-70);g.stroke();
  if(A.choc>0||hA(Math.floor(t*12),i,2)<.12){g.fillStyle='#fff6a0';for(let k=0;k<4;k++)g.fillRect(X-dir*12+(hA(k,Math.floor(t*30),i)-.5)*10,Y-72+(hA(k,i,Math.floor(t*30))-.5)*6,2,2);}}

/* ---------- LES GUIRLANDES D'AMPOULES ---------- */
const GUIRL=[];(()=>{const P=[[40],[300],[560],[760],[1040],[1240],[1500],[1760]].map(a=>[a[0],0]);
  for(let i=0;i<P.length-1;i++)GUIRL.push([P[i],P[i+1]]);})();
function dessinerGuirlandes(g,ox,oy,t){
  for(const [a,b] of GUIRL){const vert=a[0]===b[0],n=vert?14:16;
    g.strokeStyle='rgba(30,20,30,.8)';g.lineWidth=1;g.beginPath();
    const hy=u=>Y0+20-110+Math.sin(u*Math.PI)*24+oy;
    for(let k=0;k<=n;k++){const u=k/n,x=a[0]+(b[0]-a[0])*u+ox,y=hy(u);if(k)g.lineTo(x,y);else g.moveTo(x,y);}g.stroke();
    for(let k=1;k<n;k++){const u=k/n,x=a[0]+(b[0]-a[0])*u+ox,y=hy(u),c=COUL[(k+(vert?3:0))%8],on=Math.sin(t*2+k*.9+a[0])>.2;
      if(on){g.fillStyle='rgba(255,230,160,.22)';g.beginPath();g.arc(x,y+3,6,0,7);g.fill();}g.fillStyle=on?c:'#3a3040';g.beginPath();g.arc(x,y+3,2.4,0,7);g.fill();}}}
/* les mâts des guirlandes, plantés devant les baraques */
const MATS=[40,300,560,760,1040,1240,1500,1760];

/* ---------- L'ARCHE D'ENTRÉE ---------- */
function dessinerArche(g,ox,oy,t){const X=CX+ox,Y=H-10+oy;
  for(const s of [-1,1]){g.fillStyle='#e8302a';g.fillRect(X+s*96-8,Y-120,16,120);g.fillStyle='#ffd24a';for(let k=0;k<6;k++)g.fillRect(X+s*96-8,Y-112+k*20,16,5);}
  g.fillStyle='#1f3a8a';g.beginPath();g.moveTo(X-112,Y-118);g.quadraticCurveTo(X,Y-178,X+112,Y-118);g.lineTo(X+112,Y-96);g.quadraticCurveTo(X,Y-154,X-112,Y-96);g.closePath();g.fill();
  g.strokeStyle='#ffd24a';g.lineWidth=3;g.stroke();
  for(let k=0;k<22;k++){const u=k/21,x=X-108+216*u,y=Y-118-Math.sin(u*Math.PI)*58,on=((k+Math.floor(t*6))%3)===0;g.fillStyle=on?'#fff6c0':'#a87a30';g.beginPath();g.arc(x,y,on?2.6:1.8,0,7);g.fill();}
  g.save();g.fillStyle='#ffffff';g.font='900 15px "Baloo 2",Arial,sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText('FÊTE FORAINE',X,Y-130);g.font='800 9px "Baloo 2",Arial,sans-serif';g.fillStyle='#ffd24a';g.fillText('DU PRADO',X,Y-115);g.restore();}

/* ---------- LES ACTEURS : tout ce qui bouge, trié par profondeur ---------- */
let tPrec=0;
function acteurs(){const L=[];
  L.push({y:Y0-60,f:(g,camX,camY)=>{const t=performance.now()/1000;dessinerRoue(g,-camX,-camY,t);}});
  L.push({y:Y0-2,f:(g,camX,camY)=>{g.imageSmoothingEnabled=false;g.drawImage(CABANE,CX-75-camX,Y0-92-camY);}});
  for(const B of BAR)L.push({y:Y0+6,f:(g,camX,camY)=>{g.imageSmoothingEnabled=false;g.drawImage(fac(B),B.x-BW/2-camX,Y0+6-BH-camY);}});
  for(const x of MATS)L.push({y:Y0+20,f:(g,camX,camY)=>{const X=x-camX,Y=Y0+20-camY;R(g,X-2,Y-112,4,112,'#2a2030');R(g,X-1,Y-112,1,112,'#5a4a5a');R(g,X-4,Y-4,8,4,'#1a1018');}});
  L.push({y:Y0+40,f:(g,camX,camY)=>{const t=performance.now()/1000;dessinerGuirlandes(g,-camX,-camY,t);}});
  L.push({y:CAR.y-CAR.r*.36,f:(g,camX,camY)=>{const t=performance.now()/1000;dessinerCarrousel(g,-camX,-camY,t,false);}});
  L.push({y:CAR.y+CAR.r*.36,f:(g,camX,camY)=>{const t=performance.now()/1000;dessinerCarrousel(g,-camX,-camY,t,true);}});
  /* les auto-tamponneuses : on les fait avancer une fois par image */
  AUTOS.forEach((A,i)=>L.push({get y(){return A.y;},f:(g,camX,camY)=>{const t=performance.now()/1000;if(i===0){const dt=Math.min(.05,t-(tPrec||t));tPrec=t;tAuto+=dt;bougerAutos(dt);}dessinerAuto(g,A,-camX,-camY,i,t);}}));
  /* le plafond grillagé des tamponneuses, devant */
  L.push({y:TAMP.y1+12,f:(g,camX,camY)=>{const X0=TAMP.x0-camX,X1=TAMP.x1-camX,Yb=TAMP.y1+12-camY;for(const x of [X0-6,X1+2])R(g,x,Yb-200,5,200,'#c8ccd8');
    g.fillStyle='#1f3a8a';g.fillRect(X0-12,Yb-214,X1-X0+24,16);g.fillStyle='#ffd24a';g.fillRect(X0-12,Yb-214,X1-X0+24,3);
    g.fillStyle='#fff';g.font='900 13px "Baloo 2",Arial,sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText('AUTO-TAMPONNEUSES',(X0+X1)/2,Yb-206);}});
  /* les ballons des enfants */
  for(const P of GENS)if(P.ballon)L.push({get y(){return P.y+1;},f:(g,camX,camY)=>{const X=P.x-camX,Y=P.y-camY,t=performance.now()/1000,bx=X+8+Math.sin(t*1.3+P.dec)*3,by=Y-74;
    g.strokeStyle='rgba(240,240,240,.8)';g.lineWidth=1;g.beginPath();g.moveTo(X+5,Y-26);g.quadraticCurveTo(X+10,Y-50,bx,by+10);g.stroke();
    g.fillStyle=P.ballon;g.beginPath();g.ellipse(bx,by,8,10,0,0,7);g.fill();g.fillStyle='rgba(255,255,255,.5)';g.fillRect(bx-4,by-6,2,3);}});
  L.push({y:H-10,f:(g,camX,camY)=>{const t=performance.now()/1000;dessinerArche(g,-camX,-camY,t);}});
  return L;}

/* ---------- LES PROMENEURS ---------- */
const D8=a=>{const k=Math.round(a/(Math.PI/4));return {0:'droite',1:'bas-droite',2:'bas',3:'bas-gauche',4:'gauche','-4':'gauche','-3':'haut-gauche','-2':'haut','-1':'haut-droite'}[k];};
const CAD=(()=>{try{return CADENCE_PAS;}catch(x){return 0.09;}})();
const GENS=[];
(()=>{const TOURS=[
  {pts:[[CX-40,1000],[CX-40,560],[300,520],[120,560],[300,520],[CX-40,560]],v:30},
  {pts:[[CX+40,560],[1500,520],[1700,560],[1500,520],[CX+40,560],[CX+40,980]],v:27},
  {pts:[[200,600],[700,620],[760,980],[200,960]],v:24},
  {pts:[[1100,980],[1100,640],[1700,620],[1700,960]],v:26},
  {pts:[[CX+20,700],[CX+20,1000]],v:22},
  {pts:[[40,520],[1760,520]],v:32},
  {pts:[[620,940],[300,1000],[620,940],[CX-60,700]],v:25}];
  const AP=[{peau:2,cheveux:2,coiffe:3,barbe:2,haut:0,veste:'#c0392b',pantalon:'#1a1a22'},{peau:5,cheveux:0,coiffe:0,haut:1,veste:'#2a3a5a',pantalon:'#5a6a7a'},{peau:1,cheveux:7,coiffe:1,haut:3,veste:'#f5c430',pantalon:'#2a3a5a'},
   {peau:3,cheveux:3,coiffe:5,haut:1,veste:'#ff9ab8',pantalon:'#3a3a5a'},{peau:6,cheveux:4,coiffe:2,haut:0,veste:'#7ee08a',pantalon:'#2a2a34'},{peau:4,cheveux:1,coiffe:6,barbe:3,haut:2,veste:'#9a7aff',pantalon:'#1a1a22'},{peau:2,cheveux:6,coiffe:4,haut:1,veste:'#ff9a4a',pantalon:'#4a3a2a'}];
  const BAL=['#ff4a6a',null,'#ffd24a',null,'#5ad0ff',null,'#ff7aa0'];
  TOURS.forEach((T,i)=>{let L=0;const seg=[];for(let k=0;k<T.pts.length;k++){const a=T.pts[k],b=T.pts[(k+1)%T.pts.length],d=Math.hypot(b[0]-a[0],b[1]-a[1]);seg.push([a,b,L,d]);L+=d;}
   GENS.push({tour:{seg,L,v:T.v},dec:i*1.7,court:false,ballon:BAL[i],ap:Object.assign({bas:0,souliers:1,chaussures:'#f2f2f2',sac:0,chapeau:0,raye:0,motif:0,barbe:0,_civil:true},AP[i]),x:0,y:0,dir:'bas',pas:0});});})();
function figurants(){const now=Date.now()/1000;
  for(const P of GENS){const T=P.tour,d=(now*T.v+P.dec*100)%T.L;for(const [a,b,L0,dd] of T.seg){if(d<=L0+dd){const t=(d-L0)/dd;P.x=a[0]+(b[0]-a[0])*t;P.y=a[1]+(b[1]-a[1])*t;P.dir=D8(Math.atan2(b[1]-a[1],b[0]-a[0]));break;}}P.pas=(now*T.v+P.dec*100)*CAD;}
  return GENS;}

/* ---------- LES JEUX ---------- */
async function jouer(k){try{if(!window.ouvrirForain)eval(await chargerMorceau('forain.js'));window.ouvrirForain(k);}catch(x){console.warn('FORAIN',x);}}
function decor(){const D=[];const P=(t,x,y,o)=>D.push(Object.assign({t,x,y,gr:0},o||{}));
  P('x_jol_pst_vide_sol',170,Y0+34,{col:[1,1],demi:70,agir:()=>jouer('chamboule'),libelle:'Jouer',nom:'CHAMBOULE-TOUT'});
  P('x_jol_pst_vide_sol',430,Y0+34,{col:[1,1],demi:70,agir:()=>jouer('tir'),libelle:'Jouer',nom:'TIR AUX CANARDS'});
  P('x_jol_pst_vide_sol',CX,Y0+34,{col:[1,1],demi:70,agir:()=>jouer('roue'),libelle:'Faire un tour',nom:'GRANDE ROUE'});
  P('x_jol_pst_vide_sol',1370,Y0+34,{col:[1,1],demi:70,agir:()=>jouer('peche'),libelle:'Pêcher',nom:'PÊCHE AUX CANARDS'});
  P('x_jol_pst_vide_sol',1630,Y0+34,{col:[1,1],demi:70,agir:()=>jouer('lots'),libelle:'Échanger mes tickets',nom:'LOTS & TICKETS'});
  return D;}
const GRAVEURS={x_jol_pst_vide_sol:()=>({toile:document.createElement('canvas'),W:1,H:1,sol:0})};
function graver(t,v){const r=(GRAVEURS[t]||GRAVEURS.x_jol_pst_vide_sol)(v||0);return {toile:r.toile,W:r.W,H:r.H,sol:r.sol};}

/* on ne traverse ni les baraques, ni le carrousel, ni la piste des tamponneuses */
function bloque(x,y){
  if(x<12||x>W-12)return true;
  if(y<Y0+20)return true;
  if(((x-CAR.x)/(CAR.r+10))**2+((y-CAR.y)/(CAR.r*.42+8))**2<1)return true;
  if(x>TAMP.x0-12&&x<TAMP.x1+12&&y>TAMP.y0-12&&y<TAMP.y1+14)return true;
  if(y>H-44&&Math.abs(x-CX)>52)return true;
  if(y>H-4)return true;
  return false;}

/* LA SORTIE : par l'arche du bas, on rentre sur la place de la Joliette */
let PARTI=false;
setInterval(()=>{try{if(PARTI||typeof joueur==='undefined')return;if(joueur.y>H-12)sortir();}catch(x){}},150);
function sortir(){if(PARTI)return;PARTI=true;try{sauver();}catch(x){}
  try{const f=document.createElement('div');f.style.cssText='position:fixed;inset:0;z-index:2147483000;background:#1a1030;opacity:0;transition:opacity .45s;pointer-events:none';document.body.appendChild(f);requestAnimationFrame(()=>f.style.opacity='1');}catch(x){}
  setTimeout(()=>{const v=window.MA_VERSION?('&v='+encodeURIComponent(window.MA_VERSION)):'';location.href='spawn.html?de=foire'+v;},480);}


return {sol,solFin,decor,bloque,graver,depart:DEPART,figurants,acteurs};
})()
