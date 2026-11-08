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
/* ---------- LA COQUE BLANCHE, LA BANDE RAYÉE, LES TENTES, LE GRAND ESCALIER PEINT ---------- */
const YC=Y0-128;                               /* le niveau du parvis haut (le pied de la coque) */
const SE=(u,p)=>Math.pow(Math.max(0,1-Math.pow(Math.abs(u),p)),1/p);
const coqueH=x=>{const u=(x-W/2)/(W/2-60);return Math.abs(u)>1?YC:YC-(YC-34)*SE(u,3.2);};
const arcH=x=>{const u=(x-W/2)/560;return Math.abs(u)>1?YC:YC-(YC-150)*SE(u,2.2);};
function enceinte(g){
  /* la coque : un grand dôme blanc, lisse, aux nervures verticales */
  g.save();g.beginPath();g.moveTo(60,YC);for(let x=60;x<=W-60;x+=4)g.lineTo(x,coqueH(x));g.lineTo(W-60,YC);g.closePath();g.clip();
  g.fillStyle=lin(g,60,0,W-60,0,[[0,'#c6ccd2'],[.12,'#eef1f3'],[.5,'#f8f9fa'],[.85,'#e4e8ec'],[1,'#b4bcc4']]);g.fillRect(0,0,W,YC);
  g.fillStyle=lin(g,0,30,0,YC,[[0,'rgba(255,255,255,.5)'],[.5,'rgba(255,255,255,0)'],[1,'rgba(120,130,140,.18)']]);g.fillRect(0,0,W,YC);
  for(let x=64;x<W-60;x+=11){const u=(x-W/2)/(W/2-60);R(g,x,0,.8,YC,'rgba(130,140,150,'+(.16+.2*u*u)+')');}
  g.restore();
  g.strokeStyle='rgba(160,170,180,.8)';g.lineWidth=1.2;g.beginPath();for(let x=60;x<=W-60;x+=4){x===60?g.moveTo(x,coqueH(x)):g.lineTo(x,coqueH(x));}g.stroke();
  /* le nom, en lettres d'acier sur la coque */
  g.save();g.shadowColor='rgba(40,50,60,.35)';g.shadowOffsetY=1.6;g.shadowOffsetX=1;txt(g,'Vélodrome',W/2,92,46,'#7a8692','center','600');g.restore();
  /* sous l'arche : la bande rayée noir et blanc, et ses deux rangs de vitres */
  g.save();g.beginPath();g.moveTo(240,YC);for(let x=240;x<=W-240;x+=4)g.lineTo(x,arcH(x));g.lineTo(W-240,YC);g.closePath();g.clip();
  R(g,0,0,W,YC,'#f2f2f0');
  for(let x=240;x<W-240;x+=7){const w=2.4+hA(x,1,2)*3;R(g,x,0,w,YC,'#1e2226');}
  for(const [y,h] of [[182,14],[206,14]]){R(g,240,y,W-480,h,'#24303c');for(let x=244;x<W-244;x+=16){g.fillStyle=lin(g,0,y,0,y+h,[[0,'#5a7488'],[1,'#8aa4b4']]);g.fillRect(x,y+2,14,h-4);}}
  /* l'ombre de la coque sur la bande */
  g.fillStyle=lin(g,0,150,0,200,[[0,'rgba(0,0,0,.35)'],[1,'rgba(0,0,0,0)']]);g.fillRect(0,0,W,200);
  /* deux grandes bâches bleues, de part et d'autre */
  for(const bx of [470,1010]){R(g,bx,210,120,30,'#16305e');R(g,bx+2,212,116,26,'#22488a');for(let k=0;k<5;k++)R(g,bx+10+k*22,218,14,14,'rgba(140,190,240,.35)');}
  g.restore();
  g.strokeStyle='#dfe3e6';g.lineWidth=3;g.beginPath();for(let x=240;x<=W-240;x+=4){x===240?g.moveTo(x,arcH(x)):g.lineTo(x,arcH(x));}g.stroke();
  /* la rangée de tentes blanches, sur le parvis haut */
  for(let x=380;x<W-380;x+=46){g.fillStyle='rgba(0,0,0,.15)';g.fillRect(x-17,YC-2,38,3);
    g.fillStyle='#ffffff';g.beginPath();g.moveTo(x-19,YC-12);g.lineTo(x,YC-26);g.lineTo(x+19,YC-12);g.closePath();g.fill();
    g.fillStyle='#d8dde2';g.beginPath();g.moveTo(x,YC-26);g.lineTo(x+19,YC-12);g.lineTo(x+4,YC-12);g.closePath();g.fill();
    R(g,x-18,YC-12,36,10,'rgba(250,250,250,.85)');R(g,x-18,YC-12,1,12,'#9aa2aa');R(g,x+17,YC-12,1,12,'#9aa2aa');}
  /* la rambarde du parvis haut */
  R(g,0,YC,W,4,'#cfd2d4');R(g,0,YC,W,1.2,'#f4f6f8');
}
const ESC0=150, ESC1=W-150, NM=13;          /* le grand escalier, sur presque toute la largeur */
function escalier(g){
  /* les murs bas de part et d'autre */
  R(g,0,YC+4,ESC0,Y0-YC-4,'#d6d2ca');R(g,ESC1,YC+4,W-ESC1,Y0-YC-4,'#d6d2ca');
  R(g,0,YC+4,ESC0,2,'#efebe4');R(g,ESC1,YC+4,W-ESC1,2,'#efebe4');
  const y0=YC+4,hm=(Y0-y0)/NM;
  /* les marches, peintes en blanc */
  for(let k=0;k<NM;k++){const y=y0+k*hm;R(g,ESC0,y,ESC1-ESC0,hm,'#f4f4f2');R(g,ESC0,y+hm*.62,ESC1-ESC0,hm*.38,'#dcdcd8');}
  /* LA FRESQUE, peinte à même les marches */
  g.save();g.beginPath();g.rect(ESC0,y0,ESC1-ESC0,Y0-y0);g.clip();
  /* à gauche : un grand soleil jaune, ses rayons */
  const sx=ESC0+150,sy=Y0+10;
  for(let k=0;k<7;k++){const a=-Math.PI*.95+k*Math.PI*.12;g.fillStyle=k%2?'#f2c43a':'#e8b020';g.beginPath();g.moveTo(sx,sy);g.lineTo(sx+Math.cos(a-.06)*260,sy+Math.sin(a-.06)*260);g.lineTo(sx+Math.cos(a+.06)*260,sy+Math.sin(a+.06)*260);g.fill();}
  g.fillStyle='#f6d050';g.beginPath();g.arc(sx,sy,46,0,7);g.fill();
  /* au centre : le grand écusson bleu ciel à l'ancre, cerné de bleu nuit */
  const cx=W/2-120,cy=y0+(Y0-y0)/2+4,rx=120,ry=56;
  g.fillStyle='#14306a';g.beginPath();g.ellipse(cx,cy,rx+8,ry+6,0,0,7);g.fill();
  g.fillStyle='#2f9ae0';g.beginPath();g.ellipse(cx,cy,rx,ry,0,0,7);g.fill();
  g.fillStyle='#5ab8f0';g.beginPath();g.ellipse(cx-20,cy-14,rx*.7,ry*.5,0,0,7);g.fill();
  /* l'ancre */
  g.strokeStyle='#14306a';g.lineWidth=11;g.lineCap='round';g.beginPath();g.moveTo(cx,cy-40);g.lineTo(cx,cy+34);g.stroke();
  g.beginPath();g.moveTo(cx-34,cy-24);g.lineTo(cx+34,cy-24);g.stroke();
  g.beginPath();g.arc(cx,cy+2,40,Math.PI*.15,Math.PI*.85);g.stroke();
  g.lineWidth=6;g.strokeStyle='#ffffff';g.beginPath();g.moveTo(cx,cy-38);g.lineTo(cx,cy+32);g.stroke();g.beginPath();g.moveTo(cx-32,cy-24);g.lineTo(cx+32,cy-24);g.stroke();g.beginPath();g.arc(cx,cy+2,40,Math.PI*.15,Math.PI*.85);g.stroke();
  g.lineWidth=5;g.strokeStyle='#14306a';g.beginPath();g.arc(cx,cy-47,8,0,7);g.stroke();g.lineCap='butt';
  /* le bandeau blanc en travers, la devise */
  g.save();g.translate(cx,cy+6);g.rotate(-.12);R(g,-150,-13,300,26,'#14306a');R(g,-146,-10,292,20,'#ffffff');txt(g,'MARSEILLE',0,1,17,'#14306a','center','900');g.restore();
  /* à droite : la vague noire et la grande bande bleue en diagonale */
  g.fillStyle='#1a1c20';g.beginPath();g.moveTo(W/2+120,Y0);g.quadraticCurveTo(W/2+200,y0+20,W/2+300,y0);g.lineTo(W/2+330,y0);g.quadraticCurveTo(W/2+300,Y0-40,W/2+420,Y0);g.fill();
  g.fillStyle='#2f9ae0';g.beginPath();g.moveTo(W/2+420,Y0);g.lineTo(W/2+520,y0);g.lineTo(W/2+620,y0);g.lineTo(W/2+520,Y0);g.fill();
  g.fillStyle='#14306a';g.beginPath();g.moveTo(W/2+520,Y0);g.lineTo(W/2+620,y0);g.lineTo(W/2+640,y0);g.lineTo(W/2+540,Y0);g.fill();
  /* encore du jaune, au bout */
  for(let k=0;k<4;k++){g.fillStyle=k%2?'#f2c43a':'#e8b020';g.beginPath();g.moveTo(ESC1-20-k*36,Y0);g.lineTo(ESC1+10-k*36,y0);g.lineTo(ESC1+26-k*36,y0);g.lineTo(ESC1-4-k*36,Y0);g.fill();}
  /* la peinture prend le relief des marches : ombre sous chaque nez */
  for(let k=0;k<NM;k++){const y=y0+k*hm;R(g,ESC0,y+hm*.62,ESC1-ESC0,hm*.38,'rgba(0,0,0,.13)');R(g,ESC0,y,ESC1-ESC0,.9,'rgba(255,255,255,.55)');}
  g.restore();
  /* les rampes, qui découpent l'escalier en volées */
  for(const x of [ESC0+340,W/2+20,ESC1-300]){g.strokeStyle='rgba(0,0,0,.18)';g.lineWidth=2;g.beginPath();g.moveTo(x+2,YC+6);g.lineTo(x+2,Y0+2);g.stroke();
    for(let k=0;k<=NM;k+=3){R(g,x-1,y0+k*hm-14,2,14,'#3a3e44');}g.strokeStyle='#3a3e44';g.lineWidth=1.6;g.beginPath();g.moveTo(x,y0-14);g.lineTo(x,Y0-14);g.stroke();}
  R(g,0,Y0-1,W,2,'rgba(40,40,40,.25)');}
/* ---------- LE PARVIS ---------- */
const BOUL=H-74;                               /* le trottoir du boulevard Michelet */
function parvis(g){
  g.fillStyle=lin(g,0,Y0,0,BOUL,[[0,'#d9d3c8'],[1,'#e6e1d6']]);g.fillRect(0,Y0,W,BOUL-Y0);
  /* les grandes dalles de béton clair, en quinconce */
  for(let y=Y0+2,j=0;y<BOUL;y+=26,j++){for(let x=(j%2)*32-32;x<W;x+=64){const t=hA(x,y,1);
    g.fillStyle='rgba('+(t>.5?'255,252,244':'170,160,146')+','+(.06+t*.08)+')';g.fillRect(x+1,y+1,62,24);
    R(g,x,y,64,.8,'rgba(120,110,96,.28)');R(g,x,y,.8,26,'rgba(120,110,96,.22)');}}
  /* les allées bleues qui mènent aux portes */
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
function peindreSol(g){ciel(g);enceinte(g);escalier(g);parvis(g);}
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
  /* au pied de l'escalier, on ne monte pas : le stade est fermé */
  P('x_jol_std_vide_sol',W/2,Y0+14,{col:[1,1],parler:['Le stade est fermé aujourd’hui.','Revenez un soir de match !']});
  /* les drapeaux, entre les portes */
  for(const [x,v] of [[110,0],[1490,1]])P('x_jol_std_drapeau_sol',x,Y0+30,{col:[10,6],v});
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
  x_jol_std_billetterie_sol:graverBilletterie,x_jol_std_camion_sol:graverCamion,x_jol_std_drapeau_sol:graverDrapeau,x_jol_std_banc_sol:graverBanc,x_jol_std_vide_sol:()=>({toile:document.createElement('canvas'),W:1,H:1,sol:0})};
function graver(t,v){const r=(GRAVEURS[t]||(()=>({toile:document.createElement('canvas'),W:1,H:1,sol:0})))(v||0);return {toile:r.toile,W:r.W,H:r.H,sol:r.sol};}

/* LA SORTIE : en traversant le boulevard, on rentre sur la place de la Joliette */
let PARTI=false;
setInterval(()=>{try{if(PARTI||typeof joueur==='undefined')return;if(joueur.y>H-14)sortir();}catch(x){}},150);
function sortir(){if(PARTI)return;PARTI=true;try{sauver();}catch(x){}
  try{const f=document.createElement('div');f.style.cssText='position:fixed;inset:0;z-index:2147483000;background:#fff8ea;opacity:0;transition:opacity .45s;pointer-events:none';document.body.appendChild(f);requestAnimationFrame(()=>f.style.opacity='1');}catch(x){}
  setTimeout(()=>{const v=window.MA_VERSION?('&v='+encodeURIComponent(window.MA_VERSION)):'';location.href='spawn.html?de=stade'+v;},480);}

return {sol,solFin,decor,bloque,graver,depart:DEPART,figurants:()=>[]};
})()
