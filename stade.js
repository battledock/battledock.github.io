/* =====================================================================
   LE STADE — le parvis du Vélodrome, un lieu à part entière (stade.html).
   Même logique de vue que la place : la façade du stade monte à la
   verticale au fond (la vague blanche du toit, la résille, les portes des
   tribunes) ; tout le reste est posé au sol : le parvis, les platanes,
   la billetterie, le camion à chichis, le boulevard Michelet en bas.
   Chargé par moteur.js (eval direct).
   ===================================================================== */
(()=>{
const W=1600, H=800, Y0=372;
const DEPART=[800,690];
const BLEU='#1c4f9c', CIEL='#2a9ad8';
const hA=(x,y,k)=>{let n=((x*73856093)^(y*19349663)^(k*83492791))|0;n=(n^(n>>>13))*1274126177|0;return((n^(n>>>16))>>>0)/4294967296;};
const lin=(g,x0,y0,x1,y1,st)=>{const gr=g.createLinearGradient(x0,y0,x1,y1);st.forEach(([o,c])=>gr.addColorStop(o,c));return gr;};
const R=(g,x,y,w,h,c)=>{g.fillStyle=c;g.fillRect(x,y,w,h);};
function toile(L,HH){const D=2,c=document.createElement('canvas');c.width=Math.ceil(L*D);c.height=Math.ceil(HH*D);const g=c.getContext('2d');g.setTransform(D,0,0,D,0,0);return {c,g};}
function fe(g,cx,cy,rx,ry,pal,n,seed,t){t=t||1;for(let i=0;i<n;i++){const a=hA(i,seed,1)*Math.PI*2,r=Math.sqrt(hA(i,seed,2));const x=cx+Math.cos(a)*rx*r,y=cy+Math.sin(a)*ry*r;
  const lum=((cx-x)/rx+(cy-y)/ry)*.5+hA(i,seed,3)*.4;g.fillStyle=lum>.55?pal[3]:lum>.15?pal[2]:lum>-.3?pal[1]:pal[0];
  g.beginPath();g.ellipse(x,y,(1.2+hA(i,seed,4)*1.6)*t,(.9+hA(i,seed,5)*1)*t,hA(i,seed,6)*3,0,7);g.fill();}}
function ombreSol(g,cx,cy,rx,ry,a){g.fillStyle='rgba(40,34,26,'+(a||.18)+')';g.beginPath();g.ellipse(cx+4,cy+3,rx,ry,0,0,7);g.fill();}
const txt=(g,s,x,y,px,c,al,f)=>{g.fillStyle=c;g.font=(f||'bold')+' '+px+'px "Helvetica Neue",Arial,sans-serif';g.textAlign=al||'center';g.textBaseline='middle';g.fillText(s,x,y);};

/* ---------- LA FAÇADE DU STADE ---------- */
const BX0=40, BX1=W-40;                       /* l'emprise de l'enceinte */
const PLINTHE=Y0-114;                           /* le haut du socle (les portes) */
/* le bord haut du toit : un grand arc, et la vague qui ondule dessus */
const toit=x=>{const u=(x-W/2)/(W/2-BX0);return 58+64*u*u-16*Math.cos(u*Math.PI*2.5);};
const sousToit=x=>toit(x)+22+8*Math.sin((x-BX0)/110);
const PORTES=[{x:250,n:'VIRAGE NORD'},{x:560,n:'TRIBUNE GANAY'},{x:1040,n:'TRIBUNE GANAY'},{x:1350,n:'VIRAGE SUD'}];
const PORTE_L=132, PORTE_H=80;
function ciel(g){
  g.fillStyle=lin(g,0,0,0,Y0,[[0,'#5aa6dc'],[.45,'#9ccbea'],[1,'#e6f2f8']]);g.fillRect(0,0,W,Y0);
  /* quelques nuages de mistral, étirés */
  for(let k=0;k<7;k++){const cx=hA(k,3,1)*W,cy=24+hA(k,3,2)*70,l=80+hA(k,3,3)*120;
    for(let j=0;j<9;j++){g.fillStyle='rgba(255,255,255,'+(.16+hA(k,j,4)*.2)+')';g.beginPath();g.ellipse(cx+(j-4)*l/9,cy+hA(k,j,5)*6-3,l/6,4+hA(k,j,6)*4,0,0,7);g.fill();}}
  /* les collines de Marseille au loin (Marseilleveyre, Saint-Cyr) */
  g.fillStyle='#b4c6d2';g.beginPath();g.moveTo(0,Y0-120);
  for(let x=0;x<=W;x+=20)g.lineTo(x,Y0-150-40*Math.sin(x/260)-22*Math.sin(x/97+1)-hA(x,9,1)*6);g.lineTo(W,Y0);g.lineTo(0,Y0);g.fill();
  g.fillStyle='#a2b6c4';g.beginPath();g.moveTo(0,Y0-100);
  for(let x=0;x<=W;x+=20)g.lineTo(x,Y0-120-26*Math.sin(x/180+2)-hA(x,8,1)*5);g.lineTo(W,Y0);g.lineTo(0,Y0);g.fill();
  /* les immeubles du Rouet, à l'arrière-plan des virages */
  for(let x=0;x<W;x+=34){const h=50+hA(x,7,1)*60,w=24+hA(x,7,2)*14;g.fillStyle=hA(x,7,3)>.5?'#d8d2c4':'#cfc8b8';g.fillRect(x,Y0-h-30,w,h+30);
    for(let yy=Y0-h-24;yy<Y0-34;yy+=9)for(let xx=x+4;xx<x+w-4;xx+=6)R(g,xx,yy,3,4,'rgba(90,110,130,.35)');}
}
function enceinte(g){
  /* le corps du stade, derrière la résille : béton clair, en bandeaux */
  g.save();g.beginPath();g.moveTo(BX0,PLINTHE);for(let x=BX0;x<=BX1;x+=8)g.lineTo(x,sousToit(x)-2);g.lineTo(BX1,PLINTHE);g.closePath();g.clip();
  g.fillStyle=lin(g,0,40,0,PLINTHE,[[0,'#6f7c88'],[.4,'#a6b0b8'],[1,'#d8dcdc']]);g.fillRect(BX0,0,BX1-BX0,PLINTHE);
  for(let y=120;y<PLINTHE;y+=34){R(g,BX0,y,BX1-BX0,6,'rgba(250,250,248,.75)');R(g,BX0,y+6,BX1-BX0,1.4,'rgba(60,70,80,.35)');}
  /* l'ombre portée du toit */
  g.fillStyle=lin(g,0,60,0,190,[[0,'rgba(30,40,60,.55)'],[1,'rgba(30,40,60,0)']]);g.fillRect(BX0,0,BX1-BX0,200);
  /* les escaliers intérieurs, devinés en diagonale */
  for(let x=BX0+90;x<BX1;x+=230){g.strokeStyle='rgba(60,70,84,.35)';g.lineWidth=3;g.beginPath();g.moveTo(x,PLINTHE-4);g.lineTo(x+70,150);g.stroke();}
  g.restore();
  /* LA RÉSILLE : les grands arcs blancs croisés, qui portent le toit */
  g.save();g.beginPath();g.moveTo(BX0,PLINTHE);for(let x=BX0;x<=BX1;x+=8)g.lineTo(x,sousToit(x));g.lineTo(BX1,PLINTHE);g.closePath();g.clip();
  for(let x=BX0-260;x<BX1+260;x+=64){for(const s of [-1,1]){
    g.strokeStyle='rgba(40,50,70,.28)';g.lineWidth=7;g.beginPath();g.moveTo(x+3,PLINTHE+2);g.quadraticCurveTo(x+s*90+3,(PLINTHE+60)/2,x+s*200+3,40);g.stroke();
    g.strokeStyle='#f6f7f8';g.lineWidth=5;g.beginPath();g.moveTo(x,PLINTHE);g.quadraticCurveTo(x+s*90,(PLINTHE+60)/2,x+s*200,40);g.stroke();
    g.strokeStyle='rgba(255,255,255,.9)';g.lineWidth=1.2;g.beginPath();g.moveTo(x-1.5,PLINTHE);g.quadraticCurveTo(x+s*90-1.5,(PLINTHE+60)/2,x+s*200-1.5,40);g.stroke();}}
  g.restore();
  /* LE TOIT : la grande vague blanche, sa tranche, son dessous translucide */
  g.fillStyle=lin(g,0,40,0,180,[[0,'#dfe6ec'],[1,'#b8c4ce']]);g.beginPath();g.moveTo(BX0-20,toit(BX0-20)+4);
  for(let x=BX0-20;x<=BX1+20;x+=6)g.lineTo(x,toit(x));for(let x=BX1+20;x>=BX0-20;x-=6)g.lineTo(x,sousToit(x));g.closePath();g.fill();
  /* les nervures du dessous */
  for(let x=BX0;x<BX1;x+=18){g.strokeStyle='rgba(120,134,150,.45)';g.lineWidth=1;g.beginPath();g.moveTo(x,toit(x)+5);g.lineTo(x+4,sousToit(x+4));g.stroke();}
  /* la tranche, d'un blanc éclatant, au soleil */
  g.strokeStyle='#ffffff';g.lineWidth=5;g.beginPath();for(let x=BX0-20;x<=BX1+20;x+=6){x===BX0-20?g.moveTo(x,toit(x)):g.lineTo(x,toit(x));}g.stroke();
  g.strokeStyle='rgba(150,165,180,.7)';g.lineWidth=1.2;g.beginPath();for(let x=BX0-20;x<=BX1+20;x+=6){x===BX0-20?g.moveTo(x,toit(x)+3):g.lineTo(x,toit(x)+3);}g.stroke();
  /* les mâts d'éclairage, plantés dans le toit */
  for(const x of [BX0+40,BX1-40]){const y=toit(x);R(g,x-2,y-70,4,72,'#8a96a2');R(g,x-1,y-70,1.2,72,'#d8e0e8');
    R(g,x-16,y-90,32,22,'#5a6672');for(let i=0;i<4;i++)for(let j=0;j<3;j++)R(g,x-14+i*7.4,y-88+j*6.8,6,5.4,'#f4f8ff');}
}
function porte(g,P){const x0=P.x-PORTE_L/2,y1=Y0-2,y0=y1-PORTE_H;
  /* l'ouverture : le hall sombre, les grilles levées, un escalier qui monte */
  g.fillStyle=lin(g,0,y0,0,y1,[[0,'#1c2430'],[1,'#3a4452']]);g.fillRect(x0,y0,PORTE_L,PORTE_H);
  for(let k=0;k<6;k++){R(g,x0+20+k*3,y0+30-k*5,PORTE_L-40-k*6,3,'rgba(140,150,164,'+(.35-k*.04)+')');}
  R(g,x0,y0,PORTE_L,7,'#8e98a4');for(let x=x0;x<x0+PORTE_L;x+=4)R(g,x,y0+1,.7,6,'rgba(0,0,0,.3)');   /* le rideau métallique remonté */
  /* les poteaux et le linteau bleu */
  R(g,x0-6,y0-4,6,PORTE_H+4,'#e8eaec');R(g,x0+PORTE_L,y0-4,6,PORTE_H+4,'#e8eaec');R(g,x0-6,y0-4,1.4,PORTE_H+4,'#fff');
  R(g,x0-10,y0-22,PORTE_L+20,18,BLEU);R(g,x0-10,y0-22,PORTE_L+20,1.6,'#5a8ad8');R(g,x0-10,y0-5.6,PORTE_L+20,1.6,'#0e2e66');
  txt(g,P.n,P.x,y0-13,8.4,'#ffffff');
  /* la lumière du jour qui entre */
  g.fillStyle='rgba(255,250,236,.08)';g.beginPath();g.moveTo(x0,y1);g.lineTo(x0+PORTE_L,y1);g.lineTo(x0+PORTE_L-30,y0+10);g.lineTo(x0+30,y0+10);g.fill();}
function socle(g){
  g.fillStyle=lin(g,0,PLINTHE,0,Y0,[[0,'#eceeee'],[1,'#d6d8d6']]);g.fillRect(BX0,PLINTHE,BX1-BX0,Y0-PLINTHE);
  R(g,BX0,PLINTHE,BX1-BX0,3,'#ffffff');R(g,BX0,PLINTHE+3,BX1-BX0,1.4,'rgba(80,90,100,.3)');
  for(let x=BX0;x<BX1;x+=80)R(g,x,PLINTHE+4,1,Y0-PLINTHE-4,'rgba(90,100,110,.2)');
  /* le nom, en grandes lettres bleues sur le socle */
  g.save();g.shadowColor='rgba(0,20,60,.25)';g.shadowOffsetY=1.5;txt(g,'VÉLODROME',W/2,PLINTHE+48,44,BLEU,'center','900');g.restore();
  R(g,W/2-160,PLINTHE+76,300,2.4,CIEL);txt(g,'STADE DE MARSEILLE',W/2,PLINTHE+90,10,'#4a5866','center','bold');
  for(const P of PORTES)porte(g,P);
  /* le pied du socle */
  R(g,BX0,Y0-3,BX1-BX0,3,'#b8bcbe');R(g,0,Y0,W,2,'rgba(40,40,40,.25)');}
/* ---------- LE PARVIS ---------- */
const BOUL=H-74;                               /* le trottoir du boulevard Michelet */
function parvis(g){
  g.fillStyle=lin(g,0,Y0,0,BOUL,[[0,'#d9d3c8'],[1,'#e6e1d6']]);g.fillRect(0,Y0,W,BOUL-Y0);
  /* les grandes dalles de béton clair, en quinconce */
  for(let y=Y0+2,j=0;y<BOUL;y+=26,j++){for(let x=(j%2)*32-32;x<W;x+=64){const t=hA(x,y,1);
    g.fillStyle='rgba('+(t>.5?'255,252,244':'170,160,146')+','+(.06+t*.08)+')';g.fillRect(x+1,y+1,62,24);
    R(g,x,y,64,.8,'rgba(120,110,96,.28)');R(g,x,y,.8,26,'rgba(120,110,96,.22)');}}
  /* les allées bleues qui mènent aux portes */
  for(const P of PORTES){g.fillStyle='rgba(42,154,216,.16)';g.fillRect(P.x-PORTE_L/2+8,Y0+2,PORTE_L-16,130);
    for(let y=Y0+10;y<Y0+130;y+=14)R(g,P.x-PORTE_L/2+8,y,PORTE_L-16,1,'rgba(255,255,255,.35)');}
  /* LA ROSACE au centre : un ballon de mosaïque dans le dallage */
  const cx=W/2,cy=560,r=74;
  g.fillStyle='rgba(60,50,40,.12)';g.beginPath();g.ellipse(cx+3,cy+3,r+10,r*.5+6,0,0,7);g.fill();
  g.fillStyle='#f4f2ec';g.beginPath();g.ellipse(cx,cy,r+8,r*.5+4,0,0,7);g.fill();
  g.strokeStyle=BLEU;g.lineWidth=3;g.beginPath();g.ellipse(cx,cy,r+8,r*.5+4,0,0,7);g.stroke();
  g.strokeStyle=CIEL;g.lineWidth=1.4;g.beginPath();g.ellipse(cx,cy,r+3,r*.5+1.5,0,0,7);g.stroke();
  /* les rayons, comme un soleil */
  for(let k=0;k<24;k++){const a=k/24*Math.PI*2;g.fillStyle=k%2?'rgba(28,79,156,.85)':'rgba(255,255,255,.9)';
    g.beginPath();g.moveTo(cx+Math.cos(a)*r*.44,cy+Math.sin(a)*r*.22);g.lineTo(cx+Math.cos(a+.13)*r,cy+Math.sin(a+.13)*r*.5);g.lineTo(cx+Math.cos(a-.13)*r,cy+Math.sin(a-.13)*r*.5);g.fill();}
  /* le ballon au milieu */
  g.fillStyle='#ffffff';g.beginPath();g.ellipse(cx,cy,r*.42,r*.21,0,0,7);g.fill();g.strokeStyle='#1c2430';g.lineWidth=1.4;g.stroke();
  const pent=(px,py,s)=>{g.fillStyle='#1c2430';g.beginPath();for(let i=0;i<5;i++){const a=-Math.PI/2+i*Math.PI*2/5;g.lineTo(px+Math.cos(a)*s,py+Math.sin(a)*s*.5);}g.fill();};
  pent(cx,cy,9);for(let i=0;i<5;i++){const a=-Math.PI/2+i*Math.PI*2/5;pent(cx+Math.cos(a)*22,cy+Math.sin(a)*11,5);}
  /* le trottoir, la bordure, le boulevard Michelet */
  R(g,0,BOUL,W,10,'#c8c2b6');R(g,0,BOUL,W,1.4,'#f2eee6');R(g,0,BOUL+10,W,3,'#8a8680');
  g.fillStyle=lin(g,0,BOUL+13,0,H,[[0,'#4e5258'],[1,'#5a5e64']]);g.fillRect(0,BOUL+13,W,H-BOUL-13);
  for(let i=0;i<900;i++){const x=hA(i,1,7)*W,y=BOUL+14+hA(i,2,7)*(H-BOUL-14);R(g,x,y,1,1,hA(i,3,7)>.5?'rgba(255,255,255,.07)':'rgba(0,0,0,.1)');}
  for(let x=10;x<W;x+=60)R(g,x,BOUL+40,30,2.4,'rgba(250,250,240,.75)');
  /* le passage piéton, face au stade */
  for(let x=W/2-70;x<W/2+70;x+=16)R(g,x,BOUL+15,9,H-BOUL-18,'rgba(248,248,240,.85)');
}
function peindreSol(g){ciel(g);enceinte(g);socle(g);parvis(g);}
function sol(){const c=document.createElement('canvas');c.width=W;c.height=H;peindreSol(c.getContext('2d'));return c;}
function solFin(){const c=document.createElement('canvas');c.width=W*2;c.height=H*2;const g=c.getContext('2d');g.setTransform(2,0,0,2,0,0);peindreSol(g);return c;}

/* ---------- LES SPRITES ---------- */
const T={};
const memo=(k,f)=>T[k]||(T[k]=f());
/* le platane, tronc tacheté, grille de fonte au pied */
function graverPlatane(v){return memo('pl'+v,()=>{const Wd=120,Hd=150,sol=142,x=60;const {c,g}=toile(Wd,Hd);
  ombreSol(g,x+10,sol-2,40,9,.2);
  R(g,x-14,sol-5,28,7,'#3a3a3a');for(let i=0;i<6;i++)R(g,x-12+i*4.6,sol-4,2.4,5,'#5a5a58');
  g.fillStyle='#b8ae96';g.beginPath();g.moveTo(x-5,sol-3);g.lineTo(x-3.4,sol-70);g.lineTo(x+3.4,sol-70);g.lineTo(x+5,sol-3);g.fill();
  for(let i=0;i<16;i++){g.fillStyle=['#e4dcc4','#8a8670','#d0c8a8'][i%3];g.beginPath();g.ellipse(x-3+hA(i,v,1)*6,sol-8-hA(i,v,2)*60,1.6,3,0,0,7);g.fill();}
  g.strokeStyle='#a89e86';g.lineWidth=2.4;for(const s of [-1,1]){g.beginPath();g.moveTo(x,sol-62);g.quadraticCurveTo(x+s*10,sol-80,x+s*22,sol-92);g.stroke();}
  const P=[['#2e4a22','#46682e','#6a8e3e','#9ab85a'],['#2a4620','#42642a','#648a3a','#92b252']][v%2];
  fe(g,x,sol-102,44,32,P,900,11+v,2.2);fe(g,x-20,sol-90,22,16,P,240,21+v,2);fe(g,x+22,sol-94,22,16,P,240,31+v,2);
  return {toile:c,W:Wd,H:Hd,sol};});}
/* le grand lampadaire du parvis */
function graverLampe(){return memo('lp',()=>{const Wd=40,Hd=130,sol=124,x=20;const {c,g}=toile(Wd,Hd);
  g.fillStyle='rgba(40,34,26,.2)';g.beginPath();g.ellipse(x+12,sol,16,3,0,0,7);g.fill();
  R(g,x-4,sol-6,8,6,'#5a6066');R(g,x-1.6,sol-112,3.2,108,'#6a7076');R(g,x-1.6,sol-112,1,108,'#b0b8c0');
  R(g,x-14,sol-118,28,6,'#4a5056');R(g,x-12,sol-112,24,2,'#fdf6d8');
  return {toile:c,W:Wd,H:Hd,sol};});}
/* les tourniquets devant les portes */
function graverTourniquets(){return memo('tq',()=>{const Wd=PORTE_L+10,Hd=36,sol=30;const {c,g}=toile(Wd,Hd);
  g.fillStyle='rgba(40,34,26,.18)';g.fillRect(6,sol-2,Wd-8,5);
  for(let k=0;k<5;k++){const x=5+k*(PORTE_L/4);R(g,x-4,sol-20,8,20,'#c8ced4');R(g,x-4,sol-20,8,2,'#eef2f6');R(g,x-4,sol-2,8,2,'#7a828a');R(g,x-2,sol-16,4,3,k%2?'#3ac46a':'#e04a3a');
    if(k<4){g.strokeStyle='#9aa2aa';g.lineWidth=1.4;for(let j=0;j<3;j++){g.beginPath();g.moveTo(x+4,sol-12+j*1.4);g.lineTo(x+14,sol-10+j*3);g.stroke();}}}
  return {toile:c,W:Wd,H:Hd,sol};});}
/* la billetterie : une cabine bleue et blanche */
function graverBilletterie(){return memo('bi',()=>{const Wd=110,Hd=96,sol=90,x=8,w=94;const {c,g}=toile(Wd,Hd);
  ombreSol(g,Wd/2,sol-2,50,7,.22);
  g.fillStyle=lin(g,x,0,x+w,0,[[0,'#f4f6f8'],[.5,'#ffffff'],[1,'#dde2e6']]);g.fillRect(x,sol-62,w,62);
  R(g,x,sol-6,w,6,BLEU);R(g,x,sol-62,w,1.4,'#fff');
  for(let k=0;k<2;k++){const gx=x+10+k*42;R(g,gx,sol-50,32,28,'#2a3a4c');g.fillStyle=lin(g,0,sol-50,0,sol-22,[[0,'#7aa6c6'],[1,'#c4dcea']]);g.fillRect(gx+2,sol-48,28,24);
    R(g,gx+6,sol-36,6,12,'#3a4a5a');R(g,gx+1,sol-22,30,3,'#c8ccd0');R(g,gx+12,sol-30,8,6,'rgba(255,255,255,.4)');}
  /* l'auvent bleu et l'enseigne */
  g.fillStyle=BLEU;g.beginPath();g.moveTo(x-4,sol-62);g.lineTo(x+w+4,sol-62);g.lineTo(x+w,sol-80);g.lineTo(x,sol-80);g.fill();
  R(g,x-4,sol-63,w+8,1.6,'#0e2e66');txt(g,'BILLETTERIE',x+w/2,sol-71,8.6,'#ffffff');
  return {toile:c,W:Wd,H:Hd,sol};});}
/* le camion à chichis et panisses */
function graverCamion(){return memo('ca',()=>{const Wd=150,Hd=92,sol=86,x=10,w=128;const {c,g}=toile(Wd,Hd);
  ombreSol(g,Wd/2,sol-4,68,8,.24);
  g.fillStyle=lin(g,0,sol-66,0,sol-10,[[0,'#ffe3a0'],[1,'#f4c45a']]);g.beginPath();g.roundRect(x,sol-66,w,56,8);g.fill();
  R(g,x,sol-22,w,4,'#d0402a');
  /* la cabine, à gauche */
  R(g,x+4,sol-58,26,22,'#9cc8e4');R(g,x+4,sol-58,26,2,'#e6f4fc');
  /* le comptoir, l'auvent rayé */
  R(g,x+40,sol-54,82,26,'#3a2e24');g.fillStyle=lin(g,0,sol-54,0,sol-28,[[0,'#ffd88a'],[1,'#f0a848']]);g.fillRect(x+42,sol-52,78,22);
  for(let k=0;k<6;k++){g.fillStyle='#e8c070';g.beginPath();g.ellipse(x+50+k*12,sol-36,4,2,0,0,7);g.fill();}
  for(let k=0;k<8;k++){g.fillStyle=k%2?'#ffffff':'#d0402a';g.beginPath();g.moveTo(x+38+k*11,sol-66);g.lineTo(x+49+k*11,sol-66);g.lineTo(x+51+k*11,sol-76);g.lineTo(x+40+k*11,sol-76);g.fill();}
  R(g,x+40,sol-28,82,3,'#c8ccd0');
  txt(g,'CHICHIS · PANISSES',x+w/2+12,sol-15,7.4,'#ffffff');
  /* les roues */
  for(const rx of [x+22,x+w-22]){g.fillStyle='#22252a';g.beginPath();g.arc(rx,sol-8,8,0,7);g.fill();g.fillStyle='#8a9098';g.beginPath();g.arc(rx,sol-8,3.4,0,7);g.fill();}
  return {toile:c,W:Wd,H:Hd,sol};});}
/* le mât à drapeau, aux couleurs du stade */
function graverDrapeau(v){return memo('dr'+v,()=>{const Wd=50,Hd=120,sol=114,x=8;const {c,g}=toile(Wd,Hd);
  g.fillStyle='rgba(40,34,26,.2)';g.beginPath();g.ellipse(x+8,sol,10,2.4,0,0,7);g.fill();
  R(g,x-1.4,sol-110,2.8,110,'#c8ced4');R(g,x-.6,sol-110,.8,110,'#fff');
  g.beginPath();g.arc(x,sol-111,2.4,0,7);g.fillStyle='#e8c860';g.fill();
  for(let k=0;k<3;k++){g.fillStyle=k===1?'#ffffff':(v?CIEL:BLEU);g.beginPath();
    for(let i=0;i<=10;i++){const xx=x+1.4+i*3.6,yy=sol-106+k*8+Math.sin(i*.7+v)*2;i===0?g.moveTo(xx,yy):g.lineTo(xx,yy);}
    for(let i=10;i>=0;i--){const xx=x+1.4+i*3.6,yy=sol-98+k*8+Math.sin(i*.7+v)*2;g.lineTo(xx,yy);}g.fill();}
  return {toile:c,W:Wd,H:Hd,sol};});}
/* le banc de béton, assise en bois */
function graverBanc(){return memo('bc',()=>{const Wd=84,Hd=26,sol=22;const {c,g}=toile(Wd,Hd);
  g.fillStyle='rgba(40,34,26,.2)';g.fillRect(8,sol-1,72,4);
  R(g,4,sol-10,76,10,'#cfcac0');R(g,4,sol-10,76,1.4,'#f0ece4');
  R(g,6,sol-14,72,5,'#b8875a');R(g,6,sol-14,72,1.4,'#dcae7c');for(let x=6;x<78;x+=9)R(g,x,sol-14,.5,5,'rgba(80,50,20,.3)');
  return {toile:c,W:Wd,H:Hd,sol};});}

/* ---------- LE DÉCOR ---------- */
function decor(){const D=[];const P=(t,x,y,o)=>D.push(Object.assign({t,x,y,gr:0},o||{}));
  /* les tourniquets devant chaque porte : on ne rentre pas sans billet */
  for(const Q of PORTES)P('x_jol_std_tourniquets_sol',Q.x,Y0+40,{col:[PORTE_L+8,10],parler:['Le stade est fermé aujourd’hui.','Revenez un soir de match !']});
  /* les drapeaux, entre les portes */
  for(const [x,v] of [[96,0],[404,1],[1196,0],[1504,1]])P('x_jol_std_drapeau_sol',x,Y0+30,{col:[10,6],v});
  /* la billetterie, à gauche de la rosace ; le camion à chichis, à droite */
  P('x_jol_std_billetterie_sol',470,520,{col:[96,16],parler:['Billetterie du Vélodrome.','Pas de match ce soir… Le prochain arrive bientôt !']});
  P('x_jol_std_camion_sol',1140,530,{col:[128,18],parler:['Chichis tout chauds, panisses !','Deux euros le chichi, c’est cadeau.']});
  /* la rangée de platanes, le long du boulevard, avec ses lampadaires */
  let i=0;for(const x of [90,300,520,1080,1300,1510]){P('x_jol_std_platane_sol',x,BOUL-12,{col:[16,8],v:i++});}
  for(const x of [195,410,1190,1405])P('x_jol_std_lampe_sol',x,BOUL-14,{col:[8,6]});
  /* des bancs, à l'ombre */
  for(const [x,y] of [[200,560],[1400,560],[650,650],[950,650]])P('x_jol_std_banc_sol',x,y,{col:[76,8]});
  return D;}
function bloque(x,y){
  if(x<12||x>W-12)return true;
  if(y<Y0+12)return true;
  if(y>H-6)return true;
  for(const o of DECOR){if(!o.col)continue;if(Math.abs(x-o.x)<o.col[0]/2&&y>o.y-o.col[1]&&y<o.y+3)return true;}
  return false;}
const GRAVEURS={x_jol_std_platane_sol:graverPlatane,x_jol_std_lampe_sol:graverLampe,x_jol_std_tourniquets_sol:graverTourniquets,
  x_jol_std_billetterie_sol:graverBilletterie,x_jol_std_camion_sol:graverCamion,x_jol_std_drapeau_sol:graverDrapeau,x_jol_std_banc_sol:graverBanc};
function graver(t,v){const r=(GRAVEURS[t]||(()=>({toile:document.createElement('canvas'),W:1,H:1,sol:0})))(v||0);return {toile:r.toile,W:r.W,H:r.H,sol:r.sol};}

/* LA SORTIE : en traversant le boulevard, on rentre sur la place de la Joliette */
let PARTI=false;
setInterval(()=>{try{if(PARTI||typeof joueur==='undefined')return;if(joueur.y>H-14)sortir();}catch(x){}},150);
function sortir(){if(PARTI)return;PARTI=true;try{sauver();}catch(x){}
  try{const f=document.createElement('div');f.style.cssText='position:fixed;inset:0;z-index:2147483000;background:#fff8ea;opacity:0;transition:opacity .45s;pointer-events:none';document.body.appendChild(f);requestAnimationFrame(()=>f.style.opacity='1');}catch(x){}
  setTimeout(()=>{const v=window.MA_VERSION?('&v='+encodeURIComponent(window.MA_VERSION)):'';location.href='spawn.html?de=stade'+v;},480);}

return {sol,solFin,decor,bloque,graver,depart:DEPART,figurants:()=>[]};
})()
