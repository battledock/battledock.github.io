/* =====================================================================
   LA CORNICHE KENNEDY — un lieu à part entière (corniche.html).
   Au fond, la mer, le Frioul, le château d'If ; les rochers et les
   plongeurs ; la balustrade blanche et le plus long banc du monde ; le
   monument aux morts de l'Armée d'Orient ; la route et ses voitures ;
   en bas le trottoir d'en face et le tram. Chargé par moteur.js.
   ===================================================================== */
(()=>{
const W=1600, H=800;
const DEPART=[740,716];
const hA=(x,y,k)=>{let n=((x*73856093)^(y*19349663)^(k*83492791))|0;n=(n^(n>>>13))*1274126177|0;return((n^(n>>>16))>>>0)/4294967296;};
const lin=(g,x0,y0,x1,y1,st)=>{const gr=g.createLinearGradient(x0,y0,x1,y1);st.forEach(([o,c])=>gr.addColorStop(o,c));return gr;};
const R=(g,x,y,w,h,c)=>{g.fillStyle=c;g.fillRect(x,y,w,h);};
function toile(L,HH){const D=2,c=document.createElement('canvas');c.width=Math.ceil(L*D);c.height=Math.ceil(HH*D);const g=c.getContext('2d');g.setTransform(D,0,0,D,0,0);return {c,g};}
function fe(g,cx,cy,rx,ry,pal,n,seed,t){t=t||1;for(let i=0;i<n;i++){const a=hA(i,seed,1)*Math.PI*2,r=Math.sqrt(hA(i,seed,2));const x=cx+Math.cos(a)*rx*r,y=cy+Math.sin(a)*ry*r;
  const lum=((cx-x)/rx+(cy-y)/ry)*.5+hA(i,seed,3)*.4;g.fillStyle=lum>.55?pal[3]:lum>.15?pal[2]:lum>-.3?pal[1]:pal[0];
  g.beginPath();g.ellipse(x,y,(1.2+hA(i,seed,4)*1.6)*t,(.9+hA(i,seed,5)*1)*t,hA(i,seed,6)*3,0,7);g.fill();}}
function ombreSol(g,cx,cy,rx,ry,a){g.fillStyle='rgba(40,34,26,'+(a||.18)+')';g.beginPath();g.ellipse(cx+4,cy+3,rx,ry,0,0,7);g.fill();}
const txt=(g,s,x,y,px,c,al,f)=>{g.fillStyle=c;g.font=(f||'bold')+' '+px+'px "Helvetica Neue",Arial,sans-serif';g.textAlign=al||'center';g.textBaseline='middle';g.fillText(s,x,y);};

/* ---------- LE FOND : le ciel, les îles, la mer, les rochers au pied de la corniche ---------- */
const HORIZ=130, ROCS=300, BALU=344, BANC_Y=384, ROUTE0=500, ROUTE1=660, RUE=H-74;
const MONU=800;                                  /* le monument aux morts de l'Armée d'Orient */
function ciel(g){
  g.fillStyle=lin(g,0,0,0,HORIZ,[[0,'#4a9edc'],[.6,'#8cc6ec'],[1,'#dceff6']]);g.fillRect(0,0,W,HORIZ);
  for(let k=0;k<6;k++){const cx=hA(k,6,1)*W,cy=16+hA(k,6,2)*60,l=90+hA(k,6,3)*140;
    for(let j=0;j<9;j++){g.fillStyle='rgba(255,255,255,'+(.18+hA(k,j,4)*.22)+')';g.beginPath();g.ellipse(cx+(j-4)*l/9,cy+hA(k,j,5)*6-3,l/6,4+hA(k,j,6)*4,0,0,7);g.fill();}}
  const ile=(x0,x1,h,c,seed)=>{g.fillStyle=c;g.beginPath();g.moveTo(x0,HORIZ);
    for(let x=x0;x<=x1;x+=8){const u=(x-x0)/(x1-x0);g.lineTo(x,HORIZ-h*Math.sin(u*Math.PI)**.6-hA(x,seed,1)*3-Math.sin(x/40+seed)*h*.12);}g.lineTo(x1,HORIZ);g.fill();};
  /* le Frioul à gauche, long ; l'île Maïre et les calanques loin à droite */
  ile(40,700,44,'#a8b8c4',1);ile(160,520,30,'#98aab8',2);ile(1240,1600,60,'#b4c2cc',3);ile(1380,1600,34,'#a4b4c0',4);
  /* le château d'If */
  const cx=930;g.fillStyle='#b4b8b0';g.beginPath();g.moveTo(cx-56,HORIZ);g.quadraticCurveTo(cx-30,HORIZ-18,cx,HORIZ-20);g.quadraticCurveTo(cx+34,HORIZ-18,cx+58,HORIZ);g.fill();
  R(g,cx-32,HORIZ-36,64,18,'#d8d0bc');for(let x=cx-32;x<cx+32;x+=7)R(g,x,HORIZ-39,4,3,'#d8d0bc');R(g,cx-6,HORIZ-48,18,14,'#cfc6b0');
  for(const tx of [cx-27,cx+25]){R(g,tx-5,HORIZ-44,10,26,'#cbc2aa');}R(g,cx+1,HORIZ-58,1,10,'#6a6e74');R(g,cx+2,HORIZ-58,6,3,'#2f6ad0');}
function mer(g){
  g.fillStyle=lin(g,0,HORIZ,0,ROCS+20,[[0,'#1f5f94'],[.5,'#2a7eb0'],[.85,'#2f9cb4'],[1,'#3cb4bc']]);g.fillRect(0,HORIZ,W,ROCS+20-HORIZ);
  for(let i=0;i<1500;i++){const u=hA(i,91,1),y=HORIZ+2+u*u*(ROCS-HORIZ),x=hA(i,92,1)*W,l=(3+u*18)*(.6+hA(i,93,1));
    g.fillStyle=hA(i,94,1)>.45?'rgba(255,255,255,'+(.12+u*.2)+')':'rgba(10,50,90,'+(.12+u*.1)+')';g.fillRect(x,y,l,.6+u*1.2);}
  for(let i=0;i<200;i++){const y=HORIZ+2+hA(i,95,1)*(ROCS-HORIZ-20),x=420+(hA(i,96,1)-.5)*(40+(y-HORIZ)*.9);g.fillStyle='rgba(255,250,220,'+(.35+hA(i,97,1)*.4)+')';g.fillRect(x,y,2+hA(i,98,1)*5,1);}
  R(g,0,HORIZ,W,1,'rgba(255,255,255,.4)');
  /* les rochers blancs de calcaire au pied du mur, l'écume qui les lèche */
  for(let i=0;i<260;i++){const x=hA(i,7,1)*W,y=ROCS-6+hA(i,7,2)*30,r=7+hA(i,7,3)*16;
    g.fillStyle='rgba(20,50,60,.3)';g.beginPath();g.ellipse(x+2,y+3,r,r*.5,0,0,7);g.fill();
    g.fillStyle=['#c8c0ae','#dcd4c2','#b4ac9a','#e8e0cc'][i%4];g.beginPath();g.ellipse(x,y,r,r*.55,hA(i,7,4),0,7);g.fill();
    g.fillStyle='rgba(255,255,255,.3)';g.beginPath();g.ellipse(x-r*.3,y-r*.2,r*.45,r*.2,0,0,7);g.fill();}
  for(let x=0;x<W;x+=3){const y=ROCS-8+Math.sin(x/17)*3+hA(x,9,1)*4;g.fillStyle='rgba(255,255,255,.55)';g.fillRect(x,y,3,1.4);}
  /* le mur de la corniche, en pierre, sous la balustrade */
  g.fillStyle=lin(g,0,ROCS+22,0,BALU,[[0,'#b8ac94'],[1,'#d8ccb2']]);g.fillRect(0,ROCS+22,W,BALU-ROCS-22);
  for(let y=ROCS+24;y<BALU;y+=6)for(let x=(y/6%2)*10;x<W;x+=20){R(g,x,y,.8,6,'rgba(90,76,56,.3)');}
  for(let y=ROCS+24;y<BALU;y+=6)R(g,0,y,W,.8,'rgba(90,76,56,.25)');}
function trottoirs(g){
  /* le trottoir côté mer : grandes dalles claires */
  g.fillStyle=lin(g,0,BALU,0,ROUTE0,[[0,'#e8e2d4'],[1,'#ddd6c6']]);g.fillRect(0,BALU,W,ROUTE0-BALU);
  for(let x=0;x<W;x+=40)R(g,x,BALU,1,ROUTE0-BALU,'rgba(140,130,110,.22)');for(let y=BALU+20;y<ROUTE0;y+=20)R(g,0,y,W,1,'rgba(140,130,110,.18)');
  for(let i=0;i<5000;i++)R(g,hA(i,121,1)*W,BALU+hA(i,122,1)*(ROUTE0-BALU),1,1,'rgba(120,110,90,.14)');
  /* l'esplanade du monument, en demi-cercle */
  g.fillStyle='#ece4d0';g.beginPath();g.ellipse(MONU,BALU+2,150,60,0,0,Math.PI);g.fill();g.strokeStyle='rgba(150,130,100,.35)';g.lineWidth=1;g.beginPath();g.ellipse(MONU,BALU+2,150,60,0,0,Math.PI);g.stroke();
  for(let k=1;k<4;k++){g.beginPath();g.ellipse(MONU,BALU+2,150*k/4,60*k/4,0,0,Math.PI);g.stroke();}
  /* la bordure, la route de la Corniche, ses quatre voies */
  R(g,0,ROUTE0-4,W,4,'#bdb6a8');R(g,0,ROUTE0-4,W,1,'#f2eee6');
  g.fillStyle=lin(g,0,ROUTE0,0,ROUTE1,[[0,'#4c5056'],[1,'#585c62']]);g.fillRect(0,ROUTE0,W,ROUTE1-ROUTE0);
  for(let i=0;i<3000;i++){const x=hA(i,1,8)*W,y=ROUTE0+hA(i,2,8)*(ROUTE1-ROUTE0);R(g,x,y,1,1,hA(i,3,8)>.5?'rgba(255,255,255,.07)':'rgba(0,0,0,.1)');}
  R(g,0,(ROUTE0+ROUTE1)/2-2,W,1.6,'#e8e4d8');R(g,0,(ROUTE0+ROUTE1)/2+1,W,1.6,'#e8e4d8');
  for(const y of [ROUTE0+40,ROUTE1-40])for(let x=10;x<W;x+=50)R(g,x,y,26,2,'rgba(250,250,240,.7)');
  /* le passage piéton, face au monument */
  for(let x=MONU-60;x<MONU+60;x+=14)R(g,x,ROUTE0+4,8,ROUTE1-ROUTE0-8,'rgba(248,248,240,.82)');
  /* le trottoir d'en face, les jardins des villas, la rue du tram */
  R(g,0,ROUTE1,W,4,'#bdb6a8');R(g,0,ROUTE1+3,W,1,'#f2eee6');R(g,0,ROUTE1+4,W,RUE-ROUTE1-4,'#e2dccf');
  for(let x=0;x<W;x+=40)R(g,x,ROUTE1+4,1,RUE-ROUTE1-4,'rgba(140,130,110,.2)');
  R(g,0,RUE,W,10,'#c8c2b6');R(g,0,RUE,W,1.4,'#f2eee6');R(g,0,RUE+10,W,3,'#8a8680');
  g.fillStyle=lin(g,0,RUE+13,0,H,[[0,'#4e5258'],[1,'#5a5e64']]);g.fillRect(0,RUE+13,W,H-RUE-13);
  for(let x=10;x<W;x+=60)R(g,x,RUE+30,30,2.4,'rgba(250,250,240,.75)');
  for(const ry of [H-22,H-8]){R(g,0,ry,W,2.4,'#a8acb0');R(g,0,ry,W,.8,'#e0e4e8');R(g,0,ry+2.4,W,.8,'rgba(0,0,0,.35)');}}
function peindreSol(g){ciel(g);mer(g);trottoirs(g);}
function sol(){const c=document.createElement('canvas');c.width=W;c.height=H;peindreSol(c.getContext('2d'));return c;}
function solFin(){const c=document.createElement('canvas');c.width=W*2;c.height=H*2;const g=c.getContext('2d');g.setTransform(2,0,0,2,0,0);peindreSol(g);return c;}

/* ---------- LES SPRITES ---------- */
const T={};
const memo=(k,f)=>T[k]||(T[k]=f());
/* la balustrade blanche de la Corniche : balustres renflés, main courante */
function graverBalustrade(v){return memo('ba'+v,()=>{const L=v,Hd=34,sol=30;const {c,g}=toile(L,Hd);
  R(g,0,sol-5,L,5,'#e6e0d2');R(g,0,sol-5,L,1,'#ffffff');
  for(let x=4;x<L-2;x+=9){g.fillStyle='#f2eee4';g.beginPath();g.moveTo(x,sol-5);g.quadraticCurveTo(x-2.6,sol-12,x,sol-16);g.lineTo(x+4,sol-16);g.quadraticCurveTo(x+6.6,sol-12,x+4,sol-5);g.fill();
    R(g,x+3,sol-15,1,10,'rgba(120,110,90,.3)');}
  R(g,0,sol-22,L,6,'#f4f0e8');R(g,0,sol-22,L,1.4,'#ffffff');R(g,0,sol-16.8,L,1,'rgba(120,110,90,.35)');
  for(let x=0;x<L;x+=90)R(g,x,sol-24,8,24,'#ece6d8');
  return {toile:c,W:L,H:Hd,sol};});}
/* LE PLUS LONG BANC DU MONDE : béton blanc, d'un seul tenant, face à la mer */
function graverGrandBanc(v){return memo('gb'+v,()=>{const L=v,Hd=24,sol=20;const {c,g}=toile(L,Hd);
  g.fillStyle='rgba(60,50,40,.18)';g.fillRect(2,sol-2,L-2,5);
  R(g,0,sol-13,L,13,'#e8e4dc');R(g,0,sol-13,L,2,'#ffffff');R(g,0,sol-6,L,1,'rgba(120,110,90,.25)');
  for(let x=60;x<L;x+=120)R(g,x,sol-13,1,13,'rgba(120,110,90,.2)');
  return {toile:c,W:L,H:Hd,sol};});}
/* LE MONUMENT AUX MORTS DE L'ARMÉE D'ORIENT : la grande arche qui encadre la mer */
function graverMonument(){return memo('mo',()=>{const Wd=260,Hd=250,sol=240,x=130;const {c,g}=toile(Wd,Hd);
  const pierre=(x0,y0,w,h)=>{g.fillStyle=lin(g,x0,0,x0+w,0,[[0,'#d8ccb0'],[.4,'#f0e6ce'],[1,'#c8bca0']]);g.fillRect(x0,y0,w,h);for(let y=y0+8;y<y0+h;y+=10)R(g,x0,y,w,.7,'rgba(110,94,70,.25)');};
  /* les deux piles massives */
  pierre(x-110,sol-170,56,170);pierre(x+54,sol-170,56,170);
  /* l'arche, et la mer qu'elle encadre (on voit au travers) */
  g.fillStyle=lin(g,0,sol-200,0,sol-170,[[0,'#d8ccb0'],[1,'#e8dec6']]);g.fillRect(x-110,sol-214,220,46);
  g.save();g.beginPath();g.rect(x-54,sol-170,108,170);g.clip();g.restore();
  g.fillStyle='#e8dec6';g.beginPath();g.moveTo(x-54,sol-168);g.lineTo(x-54,sol-140);g.quadraticCurveTo(x-54,sol-168,x,sol-168);g.quadraticCurveTo(x+54,sol-168,x+54,sol-140);g.lineTo(x+54,sol-168);g.fill();
  g.strokeStyle='rgba(110,94,70,.4)';g.lineWidth=1.4;g.beginPath();g.moveTo(x-54,sol);g.lineTo(x-54,sol-140);g.quadraticCurveTo(x-54,sol-166,x,sol-166);g.quadraticCurveTo(x+54,sol-166,x+54,sol-140);g.lineTo(x+54,sol);g.stroke();
  /* l'entablement, l'inscription */
  R(g,x-118,sol-222,236,10,'#f4ecd8');R(g,x-118,sol-222,236,1.4,'#ffffff');R(g,x-114,sol-212,228,1,'rgba(110,94,70,.35)');
  txt(g,"AUX MORTS DE L'ARMÉE D'ORIENT",x,sol-196,7.2,'#6a5a40','center','bold');txt(g,'ET DES TERRES LOINTAINES',x,sol-185,6,'#6a5a40','center','bold');
  /* le socle des statues sur les piles, deux torchères de bronze */
  for(const s of [-1,1]){const px=x+s*104;R(g,px-20,sol-176,40,6,'#f0e6ce');R(g,px-6,sol-200,12,24,'#5a6a4a');g.fillStyle='#4a5a3a';g.beginPath();g.ellipse(px,sol-202,9,4,0,0,7);g.fill();
    g.fillStyle='#e8a040';g.beginPath();g.moveTo(px-5,sol-204);g.quadraticCurveTo(px,sol-222,px+5,sol-204);g.fill();}
  /* les trois marches */
  for(let k=0;k<3;k++)R(g,x-120-k*6,sol-6+k*2,240+k*12,2.4,k%2?'#e6dcc4':'#f2eadA'.replace('A','a'));
  g.fillStyle='rgba(60,50,40,.2)';g.fillRect(x-130,sol,260,4);
  return {toile:c,W:Wd,H:Hd,sol};});}
/* les lampadaires de la Corniche : fût vert foncé, lanterne blanche */
function graverLampeC(){return memo('lc',()=>{const Wd=40,Hd=120,sol=114,x=20;const {c,g}=toile(Wd,Hd);
  g.fillStyle='rgba(40,34,26,.2)';g.beginPath();g.ellipse(x+10,sol,13,2.6,0,0,7);g.fill();
  R(g,x-4,sol-8,8,8,'#2e4a3e');R(g,x-1.6,sol-90,3.2,84,'#2e4a3e');R(g,x-1.6,sol-90,1,84,'#5a7a6a');
  R(g,x-8,sol-108,16,4,'#2e4a3e');R(g,x-6,sol-104,12,14,'#fff6dc');R(g,x-6,sol-104,12,1,'#ffffff');R(g,x-7,sol-91,14,2,'#2e4a3e');g.fillStyle='#2e4a3e';g.beginPath();g.arc(x,sol-110,3,0,7);g.fill();
  return {toile:c,W:Wd,H:Hd,sol};});}
/* le palmier du trottoir d'en face */
function graverPalmier(v){return memo('pm'+v,()=>{const Wd=120,Hd=150,sol=144,x=60;const {c,g}=toile(Wd,Hd);
  ombreSol(g,x+10,sol-2,30,7,.2);
  g.strokeStyle='#9a8264';g.lineWidth=7;g.beginPath();g.moveTo(x,sol);g.quadraticCurveTo(x+6+v*3,sol-60,x+2,sol-112);g.stroke();
  for(let y=sol-6;y>sol-110;y-=6){g.strokeStyle='rgba(80,60,40,.45)';g.lineWidth=1;g.beginPath();g.moveTo(x-3.4+(sol-y)*.02,y);g.lineTo(x+3.4+(sol-y)*.03,y-1);g.stroke();}
  for(let k=0;k<11;k++){const a=-Math.PI+k*Math.PI/10+(hA(k,v,1)-.5)*.2,l=40+hA(k,v,2)*14;
    g.strokeStyle=k%2?'#3a6a30':'#2e5a28';g.lineWidth=3.2;g.beginPath();g.moveTo(x+2,sol-112);g.quadraticCurveTo(x+2+Math.cos(a)*l*.6,sol-120+Math.sin(a)*l*.5,x+2+Math.cos(a)*l,sol-104+Math.sin(a)*l*.35+l*.25);g.stroke();
    g.strokeStyle='rgba(140,190,90,.6)';g.lineWidth=1;g.stroke();}
  return {toile:c,W:Wd,H:Hd,sol};});}
/* la haie et le muret des villas, d'en face */
function graverHaie(v){return memo('ha'+v,()=>{const L=v,Hd=44,sol=40;const {c,g}=toile(L,Hd);
  R(g,0,sol-12,L,12,'#e4d8c0');R(g,0,sol-12,L,1.4,'#f6eedc');
  fe(g,L/2,sol-24,L/2,10,['#1e3a22','#2e5430','#467440','#6e9a58'],Math.round(L*3),v,1.8);
  return {toile:c,W:L,H:Hd,sol};});}
/* LES VOITURES, de profil, qui passent */
const COULEURS=['#c8382a','#f4f4f0','#2a2e34','#2f6ad0','#8a9098','#e8b030','#3a6a4a'];
function graverAuto(v){return memo('au'+v,()=>{const Wd=76,Hd=34,sol=30,x=6,w=64;const {c,g}=toile(Wd,Hd);const col=COULEURS[v%COULEURS.length];
  g.fillStyle='rgba(0,0,0,.3)';g.fillRect(x+2,sol-3,w-2,4);
  g.fillStyle=col;g.beginPath();g.roundRect(x,sol-16,w,11,4);g.fill();
  g.beginPath();g.moveTo(x+14,sol-16);g.lineTo(x+20,sol-26);g.lineTo(x+44,sol-26);g.lineTo(x+52,sol-16);g.fill();
  g.fillStyle='#a8c8dc';g.beginPath();g.moveTo(x+17,sol-16);g.lineTo(x+22,sol-24);g.lineTo(x+31,sol-24);g.lineTo(x+31,sol-16);g.fill();
  g.beginPath();g.moveTo(x+33,sol-16);g.lineTo(x+33,sol-24);g.lineTo(x+43,sol-24);g.lineTo(x+49,sol-16);g.fill();
  g.fillStyle='rgba(255,255,255,.35)';g.fillRect(x+2,sol-14,w-6,1.4);
  R(g,x+w-3,sol-13,3,3,'#fff6c8');R(g,x,sol-13,2.4,3,'#e04030');
  for(const rx of [x+14,x+w-14]){g.fillStyle='#16181c';g.beginPath();g.arc(rx,sol-5,5.4,0,7);g.fill();g.fillStyle='#a8aeb4';g.beginPath();g.arc(rx,sol-5,2.4,0,7);g.fill();}
  return {toile:c,W:Wd,H:Hd,sol};});}
function graverScooter(v){return memo('sc'+v,()=>{const Wd=40,Hd=44,sol=40,x=20;const {c,g}=toile(Wd,Hd);
  g.fillStyle='rgba(0,0,0,.3)';g.fillRect(x-14,sol-3,28,4);
  g.fillStyle=COULEURS[(v+3)%COULEURS.length];g.beginPath();g.roundRect(x-12,sol-14,22,8,3);g.fill();R(g,x+8,sol-26,3,14,'#3a3e44');R(g,x+5,sol-27,8,2,'#3a3e44');
  for(const rx of [x-9,x+10]){g.fillStyle='#16181c';g.beginPath();g.arc(rx,sol-4,4,0,7);g.fill();}
  /* le pilote, casqué */
  R(g,x-6,sol-26,8,12,'#2a3a5a');g.fillStyle='#f4f4f0';g.beginPath();g.arc(x-2,sol-31,5,0,7);g.fill();R(g,x+1,sol-32,4,3,'#2a2e34');R(g,x-6,sol-15,10,3,'#1e2430');
  return {toile:c,W:Wd,H:Hd,sol};});}
function graverArret(){return memo('ar',()=>{const Wd=40,Hd=96,sol=90,x=20;const {c,g}=toile(Wd,Hd);
  g.fillStyle='rgba(40,34,26,.22)';g.beginPath();g.ellipse(x+8,sol,12,2.6,0,0,7);g.fill();
  R(g,x-2,sol-60,4,60,'#5a6066');R(g,x-9,sol-86,18,30,'#1c4f9c');R(g,x-9,sol-86,18,1.4,'#5a8ad8');
  txt(g,'T',x,sol-78,10,'#ffffff','center','900');R(g,x-7,sol-70,14,10,'#ffffff');txt(g,'Corniche',x,sol-65,3.2,'#1c4f9c','center','bold');
  R(g,x-6,sol-50,12,16,'#f4f6f8');for(let i=0;i<4;i++)R(g,x-4,sol-47+i*3.4,8,.8,'#8a96a2');
  return {toile:c,W:Wd,H:Hd,sol};});}
/* le banc de béton, assise en bois */
/* ---------- LE TRAM DU BOULEVARD : il arrive, s'arrête devant le poteau, repart ---------- */
function graverRame(){if(T.rame)return T.rame;
const L=250,HH=56,{c,g}=toile(L,HH),RR=(x,y,w,h,col)=>R(g,x,y,w,h,col),s=HH-4;
g.fillStyle='rgba(20,20,26,.28)';g.fillRect(4,s-2,L-8,5);
/* la caisse */
RR(6,s-40,L-12,36,'#f3f4f2');
RR(6,s-40,L-12,2,'#ffffff');RR(6,s-6,L-12,2,'#9aa0a6');
/* le bandeau vitré */
RR(10,s-34,L-20,14,'#2e4660');
for(let x=14;x<L-14;x+=18){RR(x,s-34,1,14,'#c9d2da');RR(x+2,s-32,4,4,'rgba(200,230,255,.35)');}
/* la ligne bleue */
RR(6,s-18,L-12,4,'#1e88c8');RR(6,s-14,L-12,1,'#13608e');
/* les portes */
for(const x of [44,112,180]){RR(x,s-34,14,28,'#c9cfd4');RR(x+6,s-34,2,28,'#7a828a');RR(x+1,s-32,5,10,'#3e5672');RR(x+8,s-32,5,10,'#3e5672');}
/* les deux nez arrondis */
for(const [x,d] of [[2,1],[L-10,-1]]){
  g.fillStyle='#f3f4f2';g.beginPath();g.ellipse(x+4,s-22,8,18,0,0,7);g.fill();
  g.fillStyle='#22364c';g.beginPath();g.ellipse(x+4+d*-1,s-28,5,9,0,0,7);g.fill();
  RR(x+2,s-12,4,2,'#ffe6a0');}
/* bogies et pantographe */
for(const x of [30,L/2-10,L-50]){RR(x,s-4,20,4,'#2e3036');RR(x+3,s-1,5,2,'#55585e');RR(x+12,s-1,5,2,'#55585e');}
RR(L/2-14,s-44,28,4,'#b0b6bc');g.strokeStyle='#4c5056';g.lineWidth=1.5;g.beginPath();
g.moveTo(L/2-8,s-44);g.lineTo(L/2,s-54);g.lineTo(L/2+8,s-44);g.stroke();RR(L/2-6,s-55,12,2,'#4c5056');
return T.rame={c,L,HH,s};
}
const VOIE=H-12, ARRET_X=800, PER=52;
function posRame(){const t=(Date.now()/1000+13)%PER;const x0=-300,x2=W+300,xa=ARRET_X;
  if(t<8){const k=t/8;return x0+(xa-x0)*(1-Math.pow(1-k,3));}if(t<16)return xa;if(t<24){const k=(t-16)/8;return xa+(x2-xa)*k*k*k;}return null;}
ANIM_DECOR.cor_tram=(g,o,x,y)=>{const wx=posRame();if(wx===null)return;const Rm=graverRame();
  const sx=Math.round(x+(wx-o.x)-Rm.L/2),sy=Math.round(y-Rm.s);g.drawImage(Rm.c,sx,sy,Rm.L,Rm.HH);
  let k=0;try{k=nuitDecor();}catch(e){}
  if(k>.02){if(!Rm.n)Rm.n=versionNuit({toile:Rm.c});g.globalAlpha=k;g.drawImage(Rm.n,sx,sy,Rm.L,Rm.HH);g.globalAlpha=1;
    if(typeof lueurNuit==='function')for(let i=-2;i<=2;i++)lueurNuit(g,sx+Rm.L/2+i*45,sy+Rm.s-26,34,'rgba(255,240,210,1)');}};
const dansRame=(x,y)=>{const wx=posRame();return wx!==null&&Math.abs(x-wx)<123&&y>VOIE-16&&y<VOIE+4;};
/* ---------- LE DÉCOR ---------- */
const VOIES=[{y:546,s:-1,n:3,v:70},{y:574,s:-1,n:2,v:92},{y:604,s:1,n:2,v:84},{y:634,s:1,n:3,v:64}];
const VEH=[];VOIES.forEach((V,i)=>{for(let j=0;j<V.n;j++)VEH.push({V,dec:(W+400)*j/V.n+hA(i,j,1)*160,sc:hA(i,j,2)<.25,v:i*3+j});});
const posVeh=e=>{const t=performance.now()/1000,L=W+400,d=((t*e.V.v+e.dec)%L+L)%L;return e.V.s>0?d-200:W+200-d;};
function decor(){const D=[];const P=(t,x,y,o)=>D.push(Object.assign({t,x,y,gr:0},o||{}));
  /* la mer : les plongeurs sur les rochers, un voilier au large, des nageurs */
  for(const x of [260,1240])P('x_jol_cor_vide_sol',x,ROCS+6,{anim:'cor_plongeur'});
  P('x_jol_cor_vide_sol',300,176,{anim:'cor_voilier',vit:6,dec:300});P('x_jol_cor_vide_sol',1200,160,{anim:'cor_voilier',vit:3.4,dec:1300,v:1});
  for(const [x,y] of [[330,262],[1180,270],[600,240]])P('x_jol_cor_vide_sol',x,y,{anim:'cor_nageur'});
  /* LA BALUSTRADE, coupée par le monument */
  P('x_jol_cor_balu_sol',(0+MONU-130)/2,BALU+8,{v:MONU-130});P('x_jol_cor_balu_sol',(MONU+130+W)/2,BALU+8,{v:W-MONU-130});
  P('x_jol_cor_vide_sol',MONU,BALU+8,{anim:'cor_lum',spr:'x_jol_cor_monument_sol',col:[240,8],lum:[[0,-120,90,'rgba(255,236,200,1)'],[-104,-210,30,'rgba(255,190,110,1)'],[104,-210,30,'rgba(255,190,110,1)']],parler:['Le monument aux morts de l’Armée d’Orient.','Par cette arche, on regarde la mer vers l’Orient.']});
  /* LE GRAND BANC, d'un bout à l'autre */
  P('x_jol_cor_banc_sol',(20+MONU-170)/2,BANC_Y,{v:MONU-170-20,col:[MONU-170-20,8]});P('x_jol_cor_banc_sol',(MONU+170+W-20)/2,BANC_Y,{v:W-20-MONU-170,col:[W-20-MONU-170,8]});
  /* les lampadaires côté mer, la nuit */
  for(const x of [120,420,1180,1480])P('x_jol_cor_vide_sol',x,BALU+30,{col:[8,5],anim:'cor_lum',spr:'x_jol_cor_lampe_sol',lum:[[0,-104,40,'rgba(255,236,190,1)'],[0,-4,60,'rgba(255,226,170,1)']]});
  /* les voitures et les scooters */
  for(const e of VEH)P('x_jol_cor_vide_sol',0,e.V.y,{anim:'cor_veh',e});
  /* le trottoir d'en face : palmiers, lampadaires */
  let i=0;for(const x of [80,340,600,1000,1260,1520])P('x_jol_cor_palmier_sol',x,ROUTE1+40,{col:[10,5],v:i++});
  for(const x of [210,470,1130,1390])P('x_jol_cor_vide_sol',x,ROUTE1+44,{col:[8,5],anim:'cor_lum',spr:'x_jol_cor_lampe_sol',lum:[[0,-104,40,'rgba(255,236,190,1)'],[0,-4,60,'rgba(255,226,170,1)']]});
  /* le tram de la Corniche, son arrêt */
  P('x_jol_cor_tramv_sol',800,VOIE,{anim:'cor_tram'});
  P('x_jol_cor_arret_sol',ARRET_X,RUE+4,{col:[30,6],agir:rentrer,libelle:'Rentrer en tram',nom:'TRAM'});
  return D;}
const SPR={};
ANIM_DECOR.cor_lum=(g,o,x,y)=>{
  if(o.spr){const t=SPR[o.spr]||(SPR[o.spr]=graver(o.spr,o.v||0)),X0=Math.round(x-t.W/2),Y1=Math.round(y-t.sol);g.drawImage(t.toile,X0,Y1,t.W,t.H);
    let k=0;try{k=nuitDecor();}catch(e){}if(k>.02){g.globalAlpha=k;g.drawImage(versionNuit(t),X0,Y1,t.W,t.H);g.globalAlpha=1;}}
  if(o.lum&&typeof lueurNuit==='function')for(const [dx,dy,r,c] of o.lum)lueurNuit(g,x+dx,y+dy,r,c);};
ANIM_DECOR.cor_veh=(g,o,x,y)=>{const e=o.e,wx=posVeh(e),X=x+(wx-o.x);const spr=e.sc?graverScooter(e.v):graverAuto(e.v);
  g.save();g.translate(Math.round(X),Math.round(y));if(e.V.s<0)g.scale(-1,1);g.drawImage(spr.toile,-spr.W/2,-spr.sol,spr.W,spr.H);g.restore();
  let k=0;try{k=nuitDecor();}catch(_){}
  if(k>.02){const n=SPR['n'+(e.sc?'s':'a')+e.v]||(SPR['n'+(e.sc?'s':'a')+e.v]=versionNuit(spr));g.save();g.translate(Math.round(X),Math.round(y));if(e.V.s<0)g.scale(-1,1);g.globalAlpha=k;g.drawImage(n,-spr.W/2,-spr.sol,spr.W,spr.H);g.restore();
    if(typeof lueurNuit==='function'){lueurNuit(g,X+e.V.s*(e.sc?10:32),y-8,30,'rgba(255,246,210,1)');lueurNuit(g,X-e.V.s*30,y-8,12,'rgba(255,60,40,1)');}}};
/* LES PLONGEURS : ils se tiennent au bord du rocher, s'élancent, disparaissent dans l'écume, et remontent */
const AP_PL={peau:3,cheveux:1,coiffe:0,barbe:0,haut:0,veste:0,pantalon:0,bas:0,souliers:0,chaussures:0,sac:0,chapeau:0,raye:0,motif:0,_pnj:true};
ANIM_DECOR.cor_plongeur=(g,o,x,y)=>{const P=8,t=(performance.now()/1000+o.x/97)%P;
  if(t<3.4){/* debout sur le rocher, il se balance */const b=Math.sin(t*3)*.6;
    g.fillStyle='rgba(20,40,50,.3)';g.beginPath();g.ellipse(x,y+1,6,1.6,0,0,7);g.fill();
    g.fillStyle='#c89068';g.fillRect(x-2.4,y-20+b,4.8,10);g.fillRect(x-1.8,y-10,1.6,10);g.fillRect(x+.4,y-10,1.6,10);g.fillStyle='#1e3a8a';g.fillRect(x-2.6,y-11,5.2,3);
    g.fillStyle='#c89068';g.beginPath();g.arc(x,y-23+b,3,0,7);g.fill();g.fillStyle='#2a1e14';g.beginPath();g.arc(x,y-24+b,3,Math.PI,0);g.fill();
    if(t>2.6){g.fillStyle='#c89068';g.fillRect(x-4,y-30,1.4,10);g.fillRect(x+2.6,y-30,1.4,10);}}
  else if(t<4.4){/* le saut, en arc, tête la première */const k=(t-3.4),X=x+k*10,Y=y-24-60*k+80*k*k;
    g.save();g.translate(X,Y);g.rotate(k*2.6);g.fillStyle='#c89068';g.fillRect(-2.4,-10,4.8,10);g.fillRect(-1.6,0,3.2,9);g.fillStyle='#1e3a8a';g.fillRect(-2.6,-1,5.2,3);
    g.beginPath();g.arc(0,-13,3,0,7);g.fill();g.restore();}
  else if(t<5.4){/* l'éclaboussure */const k=t-4.4;for(let i=0;i<10;i++){const a=-Math.PI*(.15+i*.07),r=k*28;g.fillStyle='rgba(255,255,255,'+(1-k)+')';g.fillRect(x+10+Math.cos(a)*r,y-24+Math.sin(a)*r*1.4+k*k*30,1.8,1.8);}
    g.strokeStyle='rgba(255,255,255,'+(1-k)+')';g.lineWidth=1;g.beginPath();g.ellipse(x+10,y-22,4+k*14,1.4+k*3,0,0,7);g.stroke();}
  else{/* il nage vers le rocher */const k=(t-5.4)/(P-5.4),X=x+10-k*10;g.strokeStyle='rgba(255,255,255,.6)';g.lineWidth=.8;g.beginPath();g.ellipse(X,y-22,6,1.6,0,0,7);g.stroke();
    g.fillStyle='#c89068';g.beginPath();g.arc(X,y-24,2.6,0,7);g.fill();g.fillStyle='#2a1e14';g.beginPath();g.arc(X,y-25,2.6,Math.PI,0);g.fill();}};
ANIM_DECOR.cor_nageur=(g,o,x,y)=>{const t=performance.now()/1000+o.x,dx=Math.sin(t*.3)*10,b=Math.sin(t*2)*.6,X=x+dx;
  g.strokeStyle='rgba(255,255,255,.5)';g.lineWidth=.8;g.beginPath();g.ellipse(X,y,6,1.8,0,0,7);g.stroke();
  g.fillStyle='#d8a07a';g.beginPath();g.arc(X,y-2.4+b,2.6,0,7);g.fill();g.fillStyle=['#e8d070','#1a1a1a','#d8402a'][Math.floor(o.x)%3];g.beginPath();g.arc(X,y-3.4+b,2.6,Math.PI,0);g.fill();};
const posVoile=o=>((performance.now()/1000*o.vit+o.dec)%(W+300))-150;
ANIM_DECOR.cor_voilier=(g,o,x,y)=>{const wx=posVoile(o),X=x+(wx-o.x),s=o.v?.7:1;
  g.fillStyle='rgba(255,255,255,.4)';g.fillRect(X-14*s,y+1,10*s,.8);
  g.fillStyle='#f4f4f0';g.beginPath();g.moveTo(X-9*s,y-2);g.lineTo(X+10*s,y-2);g.lineTo(X+7*s,y+1);g.lineTo(X-7*s,y+1);g.fill();
  R(g,X,y-26*s,1,24*s,'#6a6e74');g.fillStyle='#ffffff';g.beginPath();g.moveTo(X+1,y-25*s);g.lineTo(X+12*s,y-4*s);g.lineTo(X+1,y-4*s);g.fill();
  g.fillStyle='#e8eef4';g.beginPath();g.moveTo(X-1,y-22*s);g.lineTo(X-9*s,y-4*s);g.lineTo(X-1,y-4*s);g.fill();};
/* LES GENS DE LA CORNICHE : assis sur le banc face à la mer, promeneurs, joggeurs */
const TOURNEES=[{pts:[[40,440],[1560,440]],v:20,n:3},{pts:[[1560,474],[40,474]],v:16,n:2},{pts:[[40,458],[1560,458]],v:52,n:1},{pts:[[1560,694],[40,694]],v:18,n:2}];
const POSES=[[150,BANC_Y-3,'haut'],[178,BANC_Y-3,'haut'],[410,BANC_Y-3,'haut'],[560,BANC_Y-3,'haut'],[1050,BANC_Y-3,'haut'],[1076,BANC_Y-3,'haut'],[1330,BANC_Y-3,'haut'],[1500,BANC_Y-3,'haut'],[700,420,'haut'],[900,416,'haut']];
const GENS=[];
(()=>{let k=0;const ap=k=>({peau:[1,3,5,2,6,4][k%6],cheveux:[1,4,6,0,10,2][k%6],coiffe:[0,6,2,15,5,1][k%6],barbe:k%4===1?3:0,haut:[1,2,3,5,6,1][k%6],veste:[0,8,0,24,0,11][k%6],pantalon:[2,8,0,2,8,0][k%6],bas:[0,5,0,2,0,0][k%6],souliers:1,chaussures:[6,0,7,1,9,6][k%6],sac:0,chapeau:k%4===0?1:0,raye:0,motif:0,_pnj:true});
  for(const T of TOURNEES){let L=0;const seg=[];for(let i=0;i<T.pts.length;i++){const a=T.pts[i],b=T.pts[(i+1)%T.pts.length],d=Math.hypot(b[0]-a[0],b[1]-a[1]);seg.push([a,b,L,d]);L+=d;}
    for(let j=0;j<T.n;j++){GENS.push({seg,L,v:T.v*(0.85+hA(k,3,1)*.3),dec:L*(j/T.n)+hA(k,4,1)*60,ap:ap(k),x:0,y:0,dir:'bas',pas:0});k++;}}
  for(const [x,y,d] of POSES){GENS.push({fixe:true,ap:ap(k),x,y,dir:d,pas:0});k++;}})();
let MOBILES=null;
function figurants(){const now=Date.now()/1000;
  try{if(!MOBILES)MOBILES=DECOR.filter(o=>o.anim==='cor_tram'||o.anim==='cor_voilier'||o.anim==='cor_veh');
    for(const o of MOBILES){const wx=o.anim==='cor_tram'?posRame():o.anim==='cor_veh'?posVeh(o.e):posVoile(o);if(wx!==null)o.x=wx;}}catch(e){}
  for(const P of GENS){if(P.fixe)continue;let s=((now*P.v+P.dec)%P.L+P.L)%P.L;
    for(const [a,b,L0,d] of P.seg){if(s<=L0+d){const t=(s-L0)/d;P.x=a[0]+(b[0]-a[0])*t;P.y=a[1]+(b[1]-a[1])*t;
      const dx=b[0]-a[0],dy=b[1]-a[1];P.dir=Math.abs(dx)>Math.abs(dy)?(dx>0?'droite':'gauche'):(dy>0?'bas':'haut');P.pas=now*P.v/9;break;}}}
  return GENS;}
function bloque(x,y){
  if(x<12||x>W-12)return true;
  if(y<BALU+14)return true;                                         /* la balustrade */
  if(y>H-6)return true;
  if(dansRame(x,y))return true;
  for(const e of VEH){if(Math.abs(y-e.V.y)<9&&Math.abs(x-posVeh(e))<(e.sc?16:36))return true;}   /* on ne traverse pas une voiture */
  for(const o of DECOR){if(!o.col)continue;if(Math.abs(x-o.x)<o.col[0]/2&&y>o.y-o.col[1]&&y<o.y+3)return true;}
  return false;}
const GRAVEURS={x_jol_cor_balu_sol:graverBalustrade,x_jol_cor_banc_sol:graverGrandBanc,x_jol_cor_monument_sol:graverMonument,x_jol_cor_lampe_sol:graverLampeC,
  x_jol_cor_palmier_sol:graverPalmier,x_jol_cor_arret_sol:graverArret};
function graver(t,v){const r=(GRAVEURS[t]||(()=>({toile:document.createElement('canvas'),W:1,H:1,sol:0})))(v||0);return {toile:r.toile,W:r.W,H:r.H,sol:r.sol};}
let PARTI=false;
function sortir(){if(PARTI)return;PARTI=true;try{sauver();}catch(x){}
  try{const f=document.createElement('div');f.style.cssText='position:fixed;inset:0;z-index:2147483000;background:#0e1a2c;opacity:0;transition:opacity .45s;display:flex;align-items:center;justify-content:center;color:#fff;font:700 18px "Helvetica Neue",Arial,sans-serif';f.textContent='Prochain arrêt : Joliette';document.body.appendChild(f);requestAnimationFrame(()=>f.style.opacity='1');}catch(x){}
  setTimeout(()=>{const v=window.MA_VERSION?('&v='+encodeURIComponent(window.MA_VERSION)):'';location.href='spawn.html?de=stade'+v;},800);}
function rentrer(){sortir();}
return {sol,solFin,decor,bloque,graver,depart:DEPART,figurants};
})()
