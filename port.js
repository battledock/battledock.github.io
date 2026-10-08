const XP={
maisonsY:152,            /* le pied des façades */
quaiY:340,               /* le bord du quai, au-dessus du bassin */
bassinO:170, bassinE:MONDE_L,   /* la mer court jusqu'au bord est */
finVille:1404,                  /* la face est de la derniere facade : la
                                   ville s'arrete la, et l'esplanade mene
                                   aux collines */
pontons:[360,880], pontonL:13,           /* le ponton du milieu (620) est retiré, avec ses voiliers */ pontonFin:470,
metro:[1316,496],      /* le métro reprend la place de l'ancienne gare */
/* LA SORTIE DES BOIS, au bout est de la promenade. Rien n'est bati : un
   panneau dit ou l'on va, et on s'en va en marchant vers l'est, entre la
   derniere facade et l'eau. 'seuil' est la ligne au-dela de laquelle, en
   poussant, on part ; 'arrivee' est l'endroit ou l'on repose le pied. */
sente:{seuil:1690, y0:194, y1:332, arrivee:[1636,258]},
ruelle:{x:630,l:38,haut:30},   /* la montée vers Notre-Dame : axe, demi-largeur, sommet */
boulo:[30,392,120,172],   /* le boulodrome : x, y, largeur, hauteur */
};
const CARGO_X={pile:[1266,566],docks:[1318,446]};
const PAV={poisson:[552,250],peche:[708,250]};
const CABANON=[1320,440];                              /* le cabanon de la bouillabaisse */
/* LA STATION DE L'EST remonte au bout du quai, sur la nouvelle esplanade :
   on prend le velo la ou commence la longue ligne droite, pas au milieu. */
const STATIONS_VELO=[[284,214],[1462,240]];            /* les stations de vélos */
/* sur un vélo : on va plus vite */    /* les deux pavillons du milieu */   /* où l'on prend, où l'on dépose */
const surPonton=(x,y)=>XP.pontons.some(px=>Math.abs(x-px)<XP.pontonL&&y<XP.pontonFin);
const dansLeBassin=(x,y)=>x>XP.bassinO&&x<XP.bassinE&&y>XP.quaiY;
function bloqueExtramar(x,y){
const dansRuelle=Math.abs(x-XP.ruelle.x)<XP.ruelle.l&&y>=XP.ruelle.haut;   /* la montée du casino */
/* LE BAS DE LA CARTE RETIENT TOUT LE MONDE. On s'arrete au bord du quai,
   on continue de pousser vers le sud, et c'est la demi-seconde de poussee
   qui emmene au bois — pas un pas de plus hors du cadre. */
if(x<BORD-12||x>MONDE_L-BORD+12||(y<XP.maisonsY+6&&!dansRuelle)||y>MONDE_H-6)return true;
if(dansLeBassin(x-3,y)||dansLeBassin(x+3,y)||dansLeBassin(x,y+2)){
if(!surPonton(x,y))return true;              /* l'eau : on ne nage pas */
}
for(const o of DECOR){
if(!o.col)continue;
if(Math.abs(x-o.x)<o.col[0]&&y>o.y-o.col[1]&&y<o.y+3)return true;
}
return false;
}
const GX={
plO:52, plE:588, plN:150, plS:560,          /* le plateau */
basil:[320,330],                             /* le pied du fort, au centre */
descente:{x:320,l:18},                       /* l'escalier qui redescend, au sud */
longues:[[150,548],[490,548]],               /* les longues-vues */
};
function bloqueGarde(x,y){
if(Math.abs(x-GX.descente.x)<GX.descente.l&&y>=GX.plS-8&&y<MONDE_H-6)return false;
if(x<GX.plO+10||x>GX.plE-10||y<GX.basil[1]+4||y>GX.plS-6)return true;
for(const o of DECOR){
if(!o.col)continue;
if(Math.abs(x-o.x)<o.col[0]&&y>o.y-o.col[1]&&y<o.y+3)return true;
}
return false;
}
function construireSolGarde(){
const c=document.createElement('canvas');c.width=MONDE_L;c.height=MONDE_H;
const g=c.getContext('2d');
const R=(x,y,w,h,col)=>{g.fillStyle=col;g.fillRect(x|0,y|0,Math.max(1,w|0),Math.max(1,h|0));};
const A=(i)=>alea(i*1.91+0.3);
R(0,0,MONDE_L,MONDE_H,'#b9a888');
for(let y=0;y<MONDE_H;y+=5){
let x=-((y*7)%11);
while(x<MONDE_L){const w=5+Math.floor(A(x*0.7+y)*7);
R(x,y,w,3,['#c9825a','#d49468','#bf7650','#e0c49a','#d8b48a'][Math.floor(A(x+y*3)*5)]);R(x,y+3,w,1,'#8f6a4a');
x+=w+1;}
}
for(let y=0;y<MONDE_H;y++){
const cote=Math.round(130+Math.sin(y/37)*26+Math.sin(y/11)*6+(y>380?(y-380)*0.9:0));
const k=y/MONDE_H;
R(0,y,cote,1,'rgb('+(50+k*10|0)+','+(110+k*20|0)+','+(160+k*10|0)+')');
R(cote,y,2,1,'#e8dcc0');
}
for(let i=0;i<140;i++)R(A(i)*150,A(i+300)*MONDE_H,3,1,'rgba(230,245,255,.35)');
g.fillStyle='rgba(200,215,230,.42)';g.fillRect(0,0,MONDE_L,MONDE_H);
const P=GX;
for(let x=P.plO;x<P.plE;x++){
for(let y=P.plS;y<MONDE_H;y++){
const st=Math.floor((y-P.plS)/5);
R(x,y,1,1,((x+st*7)%13<2)?'#8a7a5c':(((y-P.plS)%5===0)?'#aa9a78':((x*3+y)%11<3?'#d6c8a2':'#c4b48e')));
}
}
R(P.plO-8,P.plN,8,P.plS-P.plN,'#aa9a78');R(P.plE,P.plN,8,P.plS-P.plN,'#aa9a78');
R(P.plO-8,P.plN,1,P.plS-P.plN,'#8a7a5c');R(P.plE+7,P.plN,1,P.plS-P.plN,'#8a7a5c');
R(P.plO,P.plN,P.plE-P.plO,P.plS-P.plN,'#dccfae');
for(let y=P.plN;y<P.plS;y+=12){const d=(y/12)%2?10:0;
R(P.plO,y,P.plE-P.plO,1,'#c2b490');
for(let x=P.plO+d;x<P.plE;x+=20){R(x,y,1,12,'#c2b490');R(x+1,y+1,18,1,'#e8ddc0');
if(A(x*3+y)<.18)R(x+4,y+4,6,3,'rgba(120,100,70,.10)');}}
const mx=320,my=456;
g.fillStyle='#c9b68a';g.beginPath();g.arc(mx,my,46,0,7);g.fill();
g.fillStyle='#e8ddc0';g.beginPath();g.arc(mx,my,42,0,7);g.fill();
g.strokeStyle='#8a7a5c';g.lineWidth=1;g.beginPath();g.arc(mx,my,38,0,7);g.stroke();
for(let k=0;k<16;k++){const a=k*Math.PI/8, r=k%4===0?36:(k%2?18:26);
g.fillStyle=k%4===0?'#2d4a6a':(k%2?'#c9a24a':'#8a2a2a');
g.beginPath();g.moveTo(mx+Math.cos(a)*r,my+Math.sin(a)*r*0.8);
g.lineTo(mx+Math.cos(a+0.22)*6,my+Math.sin(a+0.22)*5);g.lineTo(mx+Math.cos(a-0.22)*6,my+Math.sin(a-0.22)*5);g.fill();}
g.fillStyle='#e8c06a';g.beginPath();g.arc(mx,my,4,0,7);g.fill();
const balustre=(x,y)=>{R(x,y-7,3,7,'#e3d8bc');R(x,y-7,3,1,'#f4ecd4');R(x+1,y-5,1,3,'#cfc2a4');};
for(let x=P.plO;x<P.plE;x+=5){
if(Math.abs(x-P.descente.x)<P.descente.l+4)continue;
balustre(x,P.plS);}
R(P.plO,P.plS-9,P.descente.x-P.descente.l-4-P.plO,3,'#efe4c2');
R(P.descente.x+P.descente.l+4,P.plS-9,P.plE-P.descente.x-P.descente.l-4,3,'#efe4c2');
R(P.plO-2,P.plN,4,P.plS-P.plN,'#e3d8bc');R(P.plE-2,P.plN,4,P.plS-P.plN,'#e3d8bc');
for(let y=P.plN;y<P.plS;y+=6){R(P.plO-2,y,4,1,'#b9ac8c');R(P.plE-2,y,4,1,'#b9ac8c');}
const ex=P.descente.x-P.descente.l, ew=P.descente.l*2;
for(let y=P.plS-8,k=0;y<MONDE_H;y+=5,k++){R(ex,y,ew,5,k%2?'#d9c7a0':'#e2d2ab');R(ex,y,ew,1,'#efe3c4');R(ex,y+4,ew,1,'#b9a57c');}
R(ex-3,P.plS-8,3,MONDE_H-P.plS+8,'#aa9a78');R(ex+ew,P.plS-8,3,MONDE_H-P.plS+8,'#aa9a78');
return c;
}
function graverLaBasilique(){
const W=320,Ht=320,cx=W/2,sol=Ht-6;
const c=document.createElement('canvas');
/* on grave les façades plus finement : les enseignes étaient tracées
   sur une toile deux fois trop petite, puis agrandies à l'écran */
const D=Math.max(2,Math.min(3,Math.ceil(window.devicePixelRatio||2)));
c.width=W*D;c.height=Ht*D;
const g=c.getContext('2d');g.setTransform(D,0,0,D,0,0);g.imageSmoothingEnabled=false;
const R=(x,y,w,h,col)=>{g.fillStyle=col;g.fillRect(x|0,y|0,Math.max(1,w|0),Math.max(1,h|0));};
const PI={o:'#8a7a5c',s:'#aa9a78',p:'#c4b48e',c:'#d6c8a2',h:'#e6dab8',e:'#f2ead0'};
const blanc='#f4efe2', vert='#6f8676', vertS='#56695c';
const raye=(x,y,w,h,pas)=>{for(let j=0;j<h;j++)R(x,y+j,w,1,(Math.floor(j/(pas||4))%2)?vert:blanc);
R(x,y,1,h,'rgba(255,255,255,.45)');R(x+w-1,y,1,h,'rgba(0,0,0,.18)');};
g.fillStyle='rgba(40,30,18,.25)';g.beginPath();g.ellipse(cx+6,sol+3,W*0.46,10,0,0,7);g.fill();
const murH=58, terrH=44, yT=sol-murH-terrH;
R(14,yT,W-28,terrH,'#d8cba8');
for(let y=yT;y<yT+terrH;y+=8){R(14,y,W-28,1,'#c2b490');for(let x=14+((y/8)%2?8:0);x<W-14;x+=16)R(x,y,1,8,'#c2b490');}
R(10,sol-murH,W-20,murH,PI.p);
for(let y=sol-murH;y<sol;y+=6){const d=((y/6)%2)?9:0;R(10,y,W-20,1,PI.s);
for(let x=10+d;x<W-10;x+=18)R(x,y,1,6,PI.s);R(10,y+1,W-20,1,'rgba(255,255,255,.12)');}
for(let x=10;x<W-10;x+=12){R(x,sol-murH-8,8,8,PI.c);R(x,sol-murH-8,8,1,PI.e);R(x+7,sol-murH-8,1,8,PI.s);}   /* les merlons */
R(10,sol-murH,W-20,2,'rgba(40,30,15,.25)');
[40,76,W-84,W-48].forEach(x=>{R(x,sol-38,3,12,'#3a3226');R(x-2,sol-32,7,2,'#3a3226');});
const eL=64, ex=cx-eL/2;
for(let k=0;k<14;k++){const y=sol-4-k*4, w=eL-k*1;R(cx-w/2,y,w,4,k%2?'#e2d2ab':'#ebdcb8');R(cx-w/2,y,w,1,'#f6ecd2');R(cx-w/2,y+3,w,1,PI.s);}
R(ex-6,sol-58,6,58,PI.c);R(ex+eL,sol-58,6,58,PI.c);R(ex-6,sol-58,6,1,PI.e);R(ex+eL,sol-58,6,1,PI.e);
g.strokeStyle='#3b3a36';g.lineWidth=.8;g.beginPath();g.moveTo(ex-3,sol-6);g.lineTo(ex+4,sol-60);g.moveTo(ex+eL+3,sol-6);g.lineTo(ex+eL-4,sol-60);g.stroke();
const nx=cx-78, nL=156, fy=yT+14;                       /* pied de la façade, sur la terrasse */
R(nx+6,fy-126,nL-12,60,'#9aa296');
for(let x=nx+6;x<nx+nL-6;x+=6){R(x,fy-126,1,60,'#7e867a');R(x+1,fy-126,1,60,'#b4bbae');}
R(nx+6,fy-126,nL-12,2,'#c4cabe');
const kx=cx, ky=fy-116;
g.fillStyle='#b8b4a2';g.beginPath();g.ellipse(kx,ky,30,22,0,Math.PI,0);g.fill();
R(kx-32,ky,64,8,'#c4c0ae');raye(kx-32,ky,64,8,2);
for(let a=0;a<7;a++){const t=Math.PI+a*Math.PI/6;g.strokeStyle='#8e8a7a';g.lineWidth=1;g.beginPath();
g.moveTo(kx+Math.cos(t)*30,ky+Math.sin(t)*22);g.lineTo(kx,ky-22);g.stroke();}
g.fillStyle='rgba(255,255,255,.35)';g.beginPath();g.ellipse(kx-10,ky-10,9,7,0,0,7);g.fill();
R(kx-2,ky-30,4,8,'#d8cfae');R(kx-1,ky-38,2,8,'#e8c06a');R(kx-3,ky-35,6,2,'#e8c06a');
[[nx+22,fy-66],[nx+nL-22,fy-66]].forEach(([x,y])=>{g.fillStyle='#b8b4a2';g.beginPath();g.ellipse(x,y,13,10,0,Math.PI,0);g.fill();
g.fillStyle='#e6e2d2';g.beginPath();g.ellipse(x-3,y-3,6,4,0,0,7);g.fill();R(x-1,y-16,2,6,'#e8c06a');R(x-3,y-14,6,1,'#e8c06a');});
raye(nx,fy-66,nL,66,4);
R(nx-2,fy-68,nL+4,3,vertS);R(nx-2,fy-68,nL+4,1,'#8fa096');
[nx+14,nx+36,nx+nL-46,nx+nL-24].forEach(x=>{R(x,fy-50,10,26,'#2e3a44');g.fillStyle='#2e3a44';g.beginPath();g.arc(x+5,fy-50,5,Math.PI,0);g.fill();
R(x+4,fy-50,1,26,'#56695c');R(x-2,fy-24,14,2,PI.e);});
const tx=cx, tl=40, tb=fy+2;
raye(tx-tl/2,tb-110,tl,110,5);
R(tx-tl/2-2,tb-112,tl+4,3,vertS);R(tx-tl/2-2,tb-76,tl+4,3,vertS);R(tx-tl/2-2,tb-44,tl+4,3,vertS);
R(tx-12,tb-34,24,34,'#3a2a1c');g.fillStyle='#3a2a1c';g.beginPath();g.arc(tx,tb-34,12,Math.PI,0);g.fill();
R(tx-14,tb-48,28,2,PI.e);R(tx-1,tb-34,2,34,'#2a1c10');
for(let y=tb-30;y<tb;y+=5)for(let x=tx-10;x<tx+11;x+=5)R(x,y,1,1,'#c9a24a');
R(tx-9,tb-68,18,18,'#e8e2d0');R(tx-8,tb-67,16,16,'#1f2a3a');R(tx-1,tb-66,2,7,'#e8c06a');R(tx,tb-60,6,1,'#e8c06a');
[[-11],[3]].forEach(([dx])=>{R(tx+dx,tb-104,8,22,'#2e3a44');g.fillStyle='#2e3a44';g.beginPath();g.arc(tx+dx+4,tb-104,4,Math.PI,0);g.fill();
R(tx+dx+3,tb-104,1,22,vertS);});
R(tx-3,tb-94,6,6,'#c9a24a');                                                          /* le bourdon */
R(tx-16,tb-120,32,8,blanc);R(tx-16,tb-120,32,1,'#ffffff');R(tx-16,tb-113,32,1,vertS);
R(tx-10,tb-130,20,10,'#d8d2c0');R(tx-10,tb-130,20,1,'#f2ecdc');
R(tx-6,tb-136,12,6,'#bdb7a5');
const vy=tb-136;
R(tx-5,vy-30,10,30,'#c8902a');R(tx-3,vy-30,5,30,'#e8b84a');R(tx-1,vy-30,1,28,'#fff0b8');
R(tx-4,vy-37,8,7,'#e8b84a');R(tx-2,vy-36,3,3,'#fff4c8');                                 /* la tête et la couronne */
R(tx-4,vy-39,8,2,'#f4d98a');for(let k=-3;k<4;k+=2)R(tx+k,vy-41,1,2,'#f4d98a');
R(tx-11,vy-24,6,8,'#d8a03a');R(tx-12,vy-28,5,5,'#e8b84a');R(tx-11,vy-27,2,2,'#fff4c8');     /* l'Enfant */
R(tx-5,vy-8,10,8,'#b88226');
const n2=document.createElement('canvas');n2.width=W*D;n2.height=Ht*D;
const h2=n2.getContext('2d');h2.setTransform(D,0,0,D,0,0);
h2.fillStyle='rgba(14,18,42,.38)';h2.fillRect(10,sol-murH-8,W-20,murH+8);h2.fillRect(14,yT,W-28,terrH);
const l=h2.createRadialGradient(tx,tb-90,6,tx,tb-90,110);l.addColorStop(0,'rgba(255,238,196,.35)');l.addColorStop(1,'rgba(255,238,196,0)');
h2.fillStyle=l;h2.fillRect(tx-110,tb-200,220,220);
h2.fillStyle='#ffd98a';[nx+14,nx+36,nx+nL-46,nx+nL-24].forEach(x=>h2.fillRect(x+1,fy-49,8,24));
h2.fillRect(tx-10,tb-102,4,20);h2.fillRect(tx+4,tb-102,4,20);
h2.fillStyle='#ffe07a';h2.fillRect(tx-5,vy-30,10,30);h2.fillRect(tx-4,vy-37,8,7);h2.fillRect(tx-12,vy-28,7,12);
const hv=h2.createRadialGradient(tx,vy-20,2,tx,vy-20,26);hv.addColorStop(0,'rgba(255,220,120,.8)');hv.addColorStop(1,'rgba(255,220,120,0)');
h2.fillStyle=hv;h2.fillRect(tx-26,vy-46,52,52);
return {toile:c,W,H:Ht,sol,nuit:n2};
}
function graverLaLongueVue(){
const W=24,Ht=30,cx=12,sol=26;
const c=document.createElement('canvas');
/* on grave les façades plus finement : les enseignes étaient tracées
   sur une toile deux fois trop petite, puis agrandies à l'écran */
const D=Math.max(2,Math.min(3,Math.ceil(window.devicePixelRatio||2)));
c.width=W*D;c.height=Ht*D;const g=c.getContext('2d');g.setTransform(D,0,0,D,0,0);
const R=(x,y,w,h,col)=>{g.fillStyle=col;g.fillRect(x|0,y|0,Math.max(1,w|0),Math.max(1,h|0));};
g.fillStyle='rgba(40,30,18,.25)';g.beginPath();g.ellipse(cx,sol+1,7,2,0,0,7);g.fill();
R(cx-1,sol-14,3,14,'#3b4a52');R(cx-4,sol-1,9,2,'#2e3a44');
R(cx-7,sol-20,15,6,'#4f6a78');R(cx-7,sol-20,15,1,'#8fa3ab');R(cx-9,sol-19,3,4,'#2e3a44');R(cx+7,sol-19,3,4,'#2e3a44');
R(cx-2,sol-14,5,3,'#c9a24a');
return {toile:c,W,H:Ht,sol};
}
function semerDecorGarde(){
DECOR=[];
const P=(t,x,y,o)=>DECOR.push(Object.assign({t,x,y,gr:0},o||{}));
P('x_basilique',GX.basil[0],GX.basil[1],{col:[150,24]});
[[130,392],[510,392],[130,480],[510,480],[220,530],[420,530],[92,436],[548,436]].forEach(([x,y])=>P('bancP',x,y));
[[196,356],[444,356],[100,524],[540,524],[250,420],[390,420]].forEach(([x,y],i)=>P('lanterneP',x,y,{gr:i}));
GX.longues.forEach(([x,y])=>P('x_longuevue',x,y,{col:[5,3]}));
[[296,388,'haut',{veste:1,chapeau:1}],[350,396,'haut',{veste:2,cheveux:1}],
[206,470,'gauche',{veste:0,barbe:1}],[456,476,'droite',{veste:2,chapeau:2}]]
.forEach(([x,y,dir,ap],i)=>P('x_bouliste',x,y,{v:i+1,dir,ap,col:[5,3]}));
}
function panoramaGarde(g,W,H,T){
const d=new Date(), m=d.getHours()*60+d.getMinutes();
const nuit=m<400||m>1230;
const R=(x,y,w,h,col)=>{g.fillStyle=col;g.fillRect(x|0,y|0,Math.max(1,w|0),Math.max(1,h|0));};
for(let y=0;y<96;y++){const k=y/96;
R(0,y,W,1,nuit?'rgb('+(12+k*18|0)+','+(18+k*22|0)+','+(46+k*30|0)+')':'rgb('+(110+k*80|0)+','+(170+k*50|0)+','+(225+k*15|0)+')');}
if(nuit){for(let i=0;i<46;i++){R(alea(i)*W,alea(i+50)*80,1,1,i%6?'rgba(200,210,240,.7)':'#fff6d8');}}
for(let y=96;y<150;y++){const k=(y-96)/54;
R(0,y,W,1,nuit?'rgb('+(10+k*10|0)+','+(24+k*20|0)+','+(48+k*20|0)+')':'rgb('+(60+k*10|0)+','+(120+k*20|0)+','+(170+k*10|0)+')');}
for(let i=0;i<40;i++){const x=(alea(i)*W+T/120*(i%3+1))%W,y=100+alea(i+9)*46;R(x,y,3,1,nuit?'rgba(200,210,240,.25)':'rgba(255,255,255,.45)');}
[[22,94,40,6],[58,96,24,4],[120,95,30,5]].forEach(([x,y,w,h])=>{R(x,y,w,h,nuit?'#1c2430':'#8a8a7a');});
R(124,88,12,7,nuit?'#2a3040':'#c9bd9e');R(126,85,3,3,nuit?'#2a3040':'#c9bd9e');R(131,85,3,3,nuit?'#2a3040':'#c9bd9e');
if(nuit&&Math.floor(T/700)%2)R(60,93,2,2,'#fff4c8');
for(let x=0;x<W;x++){const t=Math.round(150+Math.sin(x/11)*3);R(x,t,1,H-t,nuit?'#231e2a':'#b89a74');}
const toits=['#c2663a','#d0764a','#b5552f','#c96a3f'], murs=['#e3b77a','#ecdcbc','#e2a88e','#d8aa62'];
for(let rg=0;rg<9;rg++){const y=150+rg*7+rg*rg*0.35, s2=1+rg*0.45;let x=-(rg*13%9);
while(x<W){const w=Math.round((6+alea(x*0.3+rg)*6)*s2),hm=Math.round(3*s2),ht=Math.round(2*s2);
const bg=96-(rg-2)*5, bd=96+(rg-2)*5;
if(rg>=2&&rg<=6&&x+w>bg-12&&x<bd+12){x+=w+1;continue;}
const k=Math.floor(alea(x+rg*7)*4);
R(x,y,w,hm,nuit?'#2e2836':murs[k]);R(x,y-ht,w,ht,nuit?'#3a2e3a':toits[k]);
if(nuit&&alea(x*3+rg)<.5)R(x+1,y,1,1,'#ffd98a');x+=w+1;}}
const pt=[[86,162],[106,162],[124,196],[68,196]];
g.fillStyle=nuit?'#12223a':'#2c7fa6';g.beginPath();g.moveTo(...pt[0]);pt.slice(1).forEach(p=>g.lineTo(...p));g.closePath();g.fill();
for(let i=0;i<34;i++){const k=alea(i*2.1),y=165+k*28,dx=(y-162)/34*18,x=86-dx+4+alea(i*5.3)*(20+dx*2-8);
R(x,y,2+k*2|0,1,'#f2efe4');R(x+1,y-3-k*3,1,3+k*3|0,'rgba(240,240,240,.55)');}
g.fillStyle='#000';g.beginPath();g.rect(0,0,W,H);g.arc(W/2,H/2,Math.min(W,H)*0.48,0,7,true);g.fill('evenodd');
}
function construireSolExtramar(){
const c=document.createElement('canvas');c.width=MONDE_L;c.height=MONDE_H;
const g=c.getContext('2d');
const R=(x,y,w,h,col)=>{g.fillStyle=col;g.fillRect(x|0,y|0,Math.max(1,w|0),Math.max(1,h|0));};
const A=(i)=>alea(i*1.37+0.5);
R(0,0,MONDE_L,160,'#b8a888');
const pierre=['#e2d2ab','#d9c7a0','#e8d9b6','#d3c097','#dccba5'];
R(0,70,MONDE_L,MONDE_H-70,'#d9c7a0');
for(let y=70;y<MONDE_H;y+=14){
let x=-((y*7)%23);
while(x<MONDE_L){
const w=18+Math.floor(A(x*0.31+y)*16);
R(x,y,w,14,pierre[Math.floor(A(x+y*3.1)*pierre.length)]);
R(x,y,w,1,'#c2ad82');R(x,y,1,14,'#c2ad82');                 /* le joint */
R(x+1,y+1,w-2,1,'rgba(255,255,255,.18)');
if(A(x*1.7+y)<.12)R(x+3+A(x)*8,y+4+A(y)*6,2,1,'#b9a37a');    /* une usure */
x+=w;
}
}
/* LES COLLINES, AU BOUT DE LA VILLE. Elles se posent avant les toits :
   elles sont au fond, les toits passent devant. C'est elles qu'on voit en
   marchant vers l'est, et c'est pour cela qu'on y marche.
   LA COUTURE SE CACHE DERRIERE LA DERNIERE FACADE : les toits du fond
   s'arretaient a 1550, en plein ciel, et on voyait la ville se defaire en
   un tas de tuiles coupees net contre le coteau. Ils s'arretent maintenant
   a l'interieur du dernier immeuble, qui les couvre du sol au faite. */
graverLesCollines(g,XP.finVille-300,MONDE_L,164);
graverLesToitsDuFond(g,XP.finVille-72,160);
{
const cx=XP.ruelle.x, xg=cx-71, xd=cx+71, ym=XP.maisonsY+6;
[[xg,cx-46,1],[cx+46,xd,-1]].forEach(([a,b,sens],j)=>{
for(let y=0;y<ym;y+=4)for(let x=a;x<b;x+=5){R(x,y,5,4,((x+y*3)>>2)%3?'#b85e32':'#c9743e');R(x+4,y,1,4,'#8f3f20');R(x,y,5,1,'#e0925a');}
const fx=Math.round((a+b)/2);R(fx-1,0,3,ym,'#e59a62');R(fx+(sens>0?2:-3),0,1,ym,'#8f3f20');
R(sens>0?a:fx+2,0,sens>0?fx-a-1:b-fx-2,ym,'rgba(60,25,10,.16)');
for(let y=24;y<ym-20;y+=46){R(fx-4,y,8,9,'#d6c6a0');R(fx-4,y,8,2,'#efe6cc');R(fx-5,y-2,10,3,'#9e8a64');}
const mur=sens>0?b-6:a;
R(mur,0,6,ym,['#dfb672','#dca088'][j]);R(mur,0,6,ym,'rgba(0,0,0,.0)');
R(sens>0?mur:mur+5,0,1,ym,'rgba(60,35,15,.35)');
for(let y=18;y<ym-10;y+=34){R(mur+1,y,4,10,'#3a2616');R(mur+1,y,4,1,'#7a5230');           /* une porte */
R(mur+1,y+14,4,5,'#2e3a44');                                                            /* une fenêtre */
R(sens>0?mur-2:mur+6,y-4,2,3,'#3b3a36');R(sens>0?mur-2:mur+6,y-1,2,2,'#ffd98a');}      /* une lanterne */
});
const x0=cx-46, w=92, tx=x0+23, tw=46;   /* l'escalier élargi : il mange la moitié des briques */
for(let y=XP.maisonsY+6,k=0;y>XP.ruelle.haut-14;k++){
const palier=k%6===5, h=palier?10:6, yh=y-h;
R(x0,yh,w,h,palier?'#f3eee4':'#e9e3d6');R(x0,yh,w,1,'#ffffff');R(x0,y-2,w,2,'#bdb4a2');
for(let i=0;i<3;i++){const vx=x0+alea(k*5+i)*w;R(vx,yh+1,1,h-3,'rgba(140,130,120,.35)');R(vx+1,yh+2+alea(i+k)*2,2,1,'rgba(140,130,120,.35)');}   /* les veines du marbre */
R(tx,yh,tw,h,'#9e1822');R(tx,y-2,tw,2,'#6a0e14');R(tx,yh,1,h,'#d8b050');R(tx+tw-1,yh,1,h,'#d8b050');
if(!palier){R(tx-2,y-3,tw+4,1,'#f0cf7d');R(tx-3,y-4,2,2,'#c9a24a');R(tx+tw+1,y-4,2,2,'#c9a24a');}     /* la tringle */
else{
[x0+4,x0+w-7].forEach(px=>{R(px,yh-4,3,10,'#b8902e');R(px+1,yh-4,1,10,'#f0cf7d');R(px-1,yh-6,5,3,'#f0cf7d');R(px-1,yh+5,5,2,'#8a6a20');});
g.strokeStyle='#8a1420';g.lineWidth=1.4;
[x0+5.5,x0+w-5.5].forEach(px=>{g.beginPath();g.moveTo(px,yh-3);g.quadraticCurveTo(px+(px<cx?2.5:-2.5),yh-14,px,yh-26);g.stroke();});
}
y-=h;
}
R(x0-3,0,3,XP.maisonsY+6,'#c9a24a');R(x0-3,0,1,XP.maisonsY+6,'#f0cf7d');                        /* les bordures dorées */
R(x0+w,0,3,XP.maisonsY+6,'#c9a24a');R(x0+w+2,0,1,XP.maisonsY+6,'#8a6a20');
const hy=XP.ruelle.haut-14;
R(x0,0,w,hy,'#2a2420');
g.fillStyle='#e9e3d6';g.beginPath();g.moveTo(x0-4,hy+2);g.lineTo(x0-4,hy-8);g.arc(cx,hy-8,w/2+4,Math.PI,0);g.lineTo(x0+w+4,hy+2);g.lineTo(x0+w,hy+2);
g.lineTo(x0+w,hy-8);g.arc(cx,hy-8,w/2,0,Math.PI,true);g.lineTo(x0,hy+2);g.closePath();g.fill();
g.strokeStyle='#d8b050';g.lineWidth=1;g.beginPath();g.arc(cx,hy-8,w/2+2,Math.PI,0);g.stroke();
const fond=g.createLinearGradient(0,hy,0,hy+24);fond.addColorStop(0,'rgba(20,16,12,.55)');fond.addColorStop(1,'rgba(20,16,12,0)');
g.fillStyle=fond;g.fillRect(x0,hy,w,24);
const ey=Math.max(0,hy-30);
R(cx-34,ey-1,68,17,'#5a0e14');R(cx-33,ey,66,15,'#9e1822');R(cx-33,ey,66,1,'#c83a44');
for(let k=0;k<17;k++){R(cx-33+k*4,ey-1,2,2,k%2?'#fff4b0':'#ffd24a');R(cx-33+k*4,ey+14,2,2,k%2?'#ffd24a':'#fff4b0');}
/* LE COMPLEXE FESTIF, en lettres de pixels : net à toutes les tailles */
{const A2={A:[[0,1,0],[1,0,1],[1,1,1],[1,0,1],[1,0,1]],C:[[1,1,1],[1,0,0],[1,0,0],[1,0,0],[1,1,1]],
 E:[[1,1,1],[1,0,0],[1,1,0],[1,0,0],[1,1,1]],F:[[1,1,1],[1,0,0],[1,1,0],[1,0,0],[1,0,0]],
 I:[[1,1,1],[0,1,0],[0,1,0],[0,1,0],[1,1,1]],L:[[1,0,0],[1,0,0],[1,0,0],[1,0,0],[1,1,1]],
 M:[[1,0,1],[1,1,1],[1,1,1],[1,0,1],[1,0,1]],O:[[1,1,1],[1,0,1],[1,0,1],[1,0,1],[1,1,1]],
 P:[[1,1,1],[1,0,1],[1,1,1],[1,0,0],[1,0,0]],S:[[1,1,1],[1,0,0],[1,1,1],[0,0,1],[1,1,1]],
 T:[[1,1,1],[0,1,0],[0,1,0],[0,1,0],[0,1,0]],X:[[1,0,1],[1,0,1],[0,1,0],[1,0,1],[1,0,1]],
 ' ':[[0],[0],[0],[0],[0]]};
 const lignes=['LE COMPLEXE','FESTIF'];
 lignes.forEach((mot,n)=>{
   let lg=0;for(const ch of mot)lg+=(A2[ch]?A2[ch][0].length:1)+1;
   let px=cx-(lg-1)/2;
   for(const ch of mot){const G=A2[ch]||A2[' '];
     for(let r=0;r<5;r++)for(let c=0;c<G[0].length;c++)if(G[r][c]){
       R(px+c,ey+1+n*6+r+0.5,1,1,'#7a0a10');
       R(px+c,ey+1+n*6+r,1,1,'#ffe49a');}
     px+=G[0].length+1;}});}
}
for(let y=XP.quaiY;y<MONDE_H;y++){
const k=(y-XP.quaiY)/(MONDE_H-XP.quaiY);
for(let x=XP.bassinO;x<XP.bassinE;x+=2){
/* PLUS DE HAUT-FOND A L'EST : la mer sort du cadre, elle ne doit pas
   palir contre un bord qui n'existe plus. */
const bord=Math.min(x-XP.bassinO,(y-XP.quaiY)*1.4);
const p=Math.min(1,bord/90)*0.6+k*0.4;
const r=Math.round(52-p*22), gg=Math.round(168-p*58), b=Math.round(186-p*30);
g.fillStyle='rgb('+r+','+gg+','+b+')';g.fillRect(x,y,2,1);
}
}
for(let i=0;i<420;i++){
const x=XP.bassinO+8+A(i+3000)*(XP.bassinE-XP.bassinO-16), y=XP.quaiY+10+A(i+3400)*(MONDE_H-XP.quaiY-14);
R(x,y,3+A(i)*5,1,i%3?'rgba(160,225,235,.35)':'rgba(20,70,110,.35)');
}
const margelle=(x,y,w,h)=>{R(x,y,w,h,'#bfae88');R(x,y,w,1,'#efe3c4');};
margelle(XP.bassinO-4,XP.quaiY-4,XP.bassinE-XP.bassinO+8,5);
R(XP.bassinO,XP.quaiY+1,XP.bassinE-XP.bassinO,6,'#8f8468');
R(XP.bassinO,XP.quaiY+7,XP.bassinE-XP.bassinO,2,'rgba(10,40,60,.35)');
margelle(XP.bassinO-4,XP.quaiY,5,MONDE_H-XP.quaiY);
/* (plus de margelle a l'est : l'eau continue hors du cadre) */
XP.pontons.forEach(px=>{
const x0=px-XP.pontonL, w=XP.pontonL*2;
R(x0+2,XP.quaiY+2,w,XP.pontonFin-XP.quaiY+2,'rgba(10,40,60,.35)');   /* l'ombre */
for(let y=XP.quaiY-2;y<XP.pontonFin;y+=4){
R(x0,y,w,4,(y/4)%2?'#9a7248':'#a97f52');R(x0,y,w,1,'#c29868');R(x0,y+3,w,1,'#6b4a2c');
}
for(let y=XP.quaiY+20;y<=XP.pontonFin;y+=40){
R(x0-2,y-2,3,6,'#5b3f21');R(x0+w-1,y-2,3,6,'#5b3f21');
}
});
{
const B=XP.boulo, x0=B[0],y0=B[1],w=B[2],h=B[3];
R(x0-3,y0-3,w+6,h+6,'#6b4a2c');R(x0-3,y0-3,w+6,1,'#a97f52');R(x0-3,y0+h+2,w+6,1,'#4f3520');
R(x0,y0,w,h,'#d8bf8c');
for(let i=0;i<900;i++)R(x0+A(i+5000)*w,y0+A(i+6000)*h,1,1,
['#c9ad78','#e6d0a0','#bca06a','#d0b682'][i%4]);
for(let y=y0+2;y<y0+h;y+=3)R(x0+w/2,y,1,2,'#f2efe4');                      /* la ficelle entre les pistes */
const rond=(x,y)=>{g.strokeStyle='rgba(120,90,50,.55)';g.lineWidth=1;g.beginPath();g.ellipse(x,y,6,3,0,0,7);g.stroke();};
rond(x0+w*0.27,y0+h-16);rond(x0+w*0.73,y0+16);
const boule=(x,y)=>{R(x-1,y-1,3,3,'#7d858c');R(x-1,y-1,2,1,'#e1e6ea');R(x+1,y+1,1,1,'#50575c');};
[[0,0],[5,3],[-4,4],[2,-5],[8,-2]].forEach(([dx,dy])=>boule(x0+w*0.27+dx,y0+46+dy));
[[0,0],[-6,2],[4,5]].forEach(([dx,dy])=>boule(x0+w*0.73+dx,y0+h-60+dy));
R(x0+w*0.27+2,y0+44,2,2,'#d0402f');R(x0+w*0.73-2,y0+h-63,2,2,'#e8c06a');
for(let i=0;i<40;i++)R(x0+6+A(i+7000)*(w-12),y0+6+A(i+7100)*(h-12),2,1,'rgba(120,90,50,.18)');
}
R(0,XP.maisonsY-2,MONDE_L,8,'rgba(60,40,20,.12)');
/* LA GRANDE AFFICHE se pose avant le garde-corps : son pied passe
   derriere la balustrade, comme si elle etait plantee de l'autre cote. */
graverLAffiche(g,1596,XP.maisonsY-4,AFFICHE_STYLE);
/* ================= LE GARDE-CORPS DU BOUT =================
   La ou les facades s'arretent, un parapet a balustres separe la
   promenade du coteau. Sans lui le pave et la colline se touchaient sans
   raison, et rien n'expliquait pourquoi on ne monte pas. */
{
const a=XP.finVille, b=MONDE_L, y=XP.maisonsY-2;
R(a,y-9,b-a,3,'#e3d3ad');R(a,y-9,b-a,1,'#f9f0d8');          /* la main courante */
for(let x=a+5;x<b-3;x+=9){                                   /* les balustres */
  R(x,y-6,4,7,'#dccaa4');R(x,y-6,4,1,'#f6ecd2');R(x+3,y-6,1,7,'#ab9a76');
}
R(a,y,b-a,12,'#cfbd97');R(a,y,b-a,3,'#f6ecd2');              /* le socle */
R(a,y+9,b-a,3,'#8e7f5e');R(a,y+11,b-a,1,'#5a4f36');
for(let x=a+11;x<b;x+=15+Math.floor(A(x*0.23)*9))R(x,y,1,9,'#b3a17a');
R(a,y+12,b-a,4,'rgba(60,45,20,.16)');                        /* son ombre */
}
return c;
}
const TU_M={o:'#6e2c16',s:'#8f3f20',p:'#ad542c',c:'#c26a3a',h:'#d8844e',faite:'#e59a62'};
const ENDUITS=[
{o:'#8c6636',s:'#b58646',p:'#d2a45c',c:'#dfb672',h:'#ebca8e',nom:'ocre'},
{o:'#8e5242',s:'#b8705a',p:'#d08a72',c:'#dca088',h:'#e8b8a2',nom:'saumon'},
{o:'#8e7e60',s:'#bba986',p:'#d6c6a0',c:'#e3d6b6',h:'#efe6cc',nom:'crème'},
{o:'#80442a',s:'#a05836',p:'#ba6e46',c:'#c8845a',h:'#d89c74',nom:'ocre rouge'}];
const PI_X={o:'#7d6a4a',s:'#9e8a64',p:'#bba57c',c:'#cdb88e',h:'#dfcca4',e:'#ebdcb8'};
function toitCanal(R,cx,bas,larg,haut){
const rangs=Math.round(haut/4);
for(let rg=rangs-1;rg>=0;rg--){
const t=rg/rangs, y=bas-rg*4, retrait=Math.round(t*12);
const x0=cx-larg/2-8+retrait, l2=larg+16-retrait*2;
for(let x=x0;x<x0+l2;x+=5){
const q=((x*7+rg*13)>>0)%5;
R(x,y,5,5,[TU_M.p,TU_M.c,TU_M.s,TU_M.p,TU_M.c][q]);
R(x+1,y,3,1,rg>rangs*0.55?TU_M.h:TU_M.c);                 /* le dos de la tuile */
R(x+4,y,1,5,TU_M.o);                                       /* le creux entre deux */
}
R(x0,y+4,l2,1,TU_M.o);
if(rg===rangs-1){R(x0-2,y-4,l2+4,5,TU_M.o);R(x0-2,y-4,l2+4,2,TU_M.faite);}
}
}
function enduit(R,x0,y0,w,h,E,graine){
R(x0,y0,w,h,E.p);
for(let i=0;i<w*h/7;i++){
const x=x0+alea(i*1.37+graine)*w, y=y0+alea(i*2.11+graine*3)*h;
R(x,y,1,1,[E.c,E.s,E.c,E.h][i%4]);
}
for(let i=0;i<6;i++)R(x0+alea(i+graine)*w,y0+h-10-alea(i*3+graine)*6,3+alea(i*7)*6,8,'rgba(90,60,30,.10)');
}
function chaine(R,x,y0,h,cote){
for(let y=y0,k=0;y<y0+h;y+=6,k++){
const w=k%2?7:10, xx=cote<0?x:x-w;
R(xx,y,w,5,PI_X.c);R(xx,y,w,1,PI_X.e);R(xx,y+5,w,1,PI_X.o);
R(cote<0?xx+w-1:xx,y,1,5,PI_X.s);
}
}
function fenetreM(R,g,x,y,E,V,etat){
R(x-3,y-4,19,26,PI_X.c);R(x-3,y-4,19,2,PI_X.e);R(x-3,y-4,2,26,PI_X.h);
R(x,y,13,20,'#26303a');
R(x+1,y+1,5,18,'#3a4a58');R(x+7,y+1,5,18,'#3a4a58');R(x+6,y,1,20,'#1a2028');
g.fillStyle='rgba(220,235,245,.22)';g.beginPath();g.moveTo(x+1,y+14);g.lineTo(x+6,y+2);g.lineTo(x+9,y+2);g.lineTo(x+4,y+14);g.fill();
if(etat==='ferme'){
R(x,y,13,20,V.p);for(let s=1;s<20;s+=2)R(x,y+s,13,1,V.o);R(x+6,y,1,20,V.o);R(x,y,13,1,V.h);
}else{
[[x-7,6],[x+14,6]].forEach(([vx,w])=>{R(vx,y,w,20,V.p);for(let s=1;s<20;s+=2)R(vx,y+s,w,1,V.o);
R(vx,y,w,1,V.h);R(vx+(vx<x?w-1:0),y,1,20,V.o);});
}
R(x-4,y+20,21,3,PI_X.c);R(x-4,y+20,21,1,PI_X.e);R(x-3,y+23,19,1,'rgba(40,25,10,.3)');
}
function balconM(R,x,y,w){
R(x,y,w,3,PI_X.p);R(x,y,w,1,PI_X.e);R(x+1,y+3,w-2,2,'rgba(40,25,10,.35)');
R(x,y-11,w,1,'#1f2224');R(x,y-1,w,1,'#1f2224');
for(let k=0;k<w;k+=3)R(x+k,y-11,1,11,'#2a2e30');
for(let k=1;k<w-2;k+=6){R(x+k,y-7,3,1,'#2a2e30');R(x+k+1,y-8,1,3,'#2a2e30');}
}
const VOLETS=[{o:'#3f5a48',p:'#5f8a6c',h:'#7fa88a'},{o:'#35506a',p:'#4f7898',h:'#7aa0bc'},
{o:'#5a5a42',p:'#8a8a64',h:'#aaaa84'},{o:'#3a5a5a',p:'#5a8484',h:'#80a8a8'}];
function graverImmeuble(v){
const W=172,Ht=176,cx=W/2,sol=Ht-8;
const c=document.createElement('canvas');
/* on grave les façades plus finement : les enseignes étaient tracées
   sur une toile deux fois trop petite, puis agrandies à l'écran */
const D=Math.max(2,Math.min(3,Math.ceil(window.devicePixelRatio||2)));
c.width=W*D;c.height=Ht*D;
const g=c.getContext('2d');g.setTransform(D,0,0,D,0,0);g.imageSmoothingEnabled=false;
const R=(x,y,w,h,col)=>{g.fillStyle=col;g.fillRect(x|0,y|0,Math.max(1,w|0),Math.max(1,h|0));};
const E=ENDUITS[v%4], V=VOLETS[(v*3+1)%4];
const BL=138, x0=cx-BL/2, rez=40, etage=34, murH=rez+etage*2+8, basToit=sol-murH;
g.fillStyle='rgba(40,30,18,.26)';g.beginPath();g.ellipse(cx+4,sol+3,BL*0.55,8,0,0,7);g.fill();
toitCanal(R,cx,basToit,BL,30);
[[x0+22,-24],[x0+BL-30,-18]].forEach(([x,dy])=>{R(x,basToit+dy-10,9,12,PI_X.p);R(x,basToit+dy-10,9,2,PI_X.e);
R(x-1,basToit+dy-12,11,3,PI_X.s);R(x+2,basToit+dy-14,2,3,'#6e2c16');R(x+5,basToit+dy-14,2,3,'#6e2c16');});
for(let r=0;r<3;r++){const y=basToit+3+r*3,ret=r*2;
for(let x=x0-4+ret;x<x0+BL+4-ret;x+=4){R(x,y,3,3,r%2?TU_M.s:TU_M.c);R(x,y,3,1,TU_M.h);}}
enduit(R,x0,basToit+12,BL,murH-12,E,v*17+3);
R(x0,basToit+12,BL,3,'rgba(40,20,10,.28)');                    /* l'ombre sous la génoise */
chaine(R,x0,basToit+12,murH-rez-12,-1);chaine(R,x0+BL,basToit+12,murH-rez-12,1);
for(let n=0;n<2;n++){
const yF=basToit+20+n*etage;
R(x0,yF+etage-6,BL,4,PI_X.c);R(x0,yF+etage-6,BL,1,PI_X.e);R(x0,yF+etage-2,BL,1,'rgba(40,25,10,.25)');  /* le bandeau */
for(let k=0;k<4;k++){
const fx=x0+16+k*31;
const ferme=alea(v*9+n*4+k)<0.25;
fenetreM(R,g,fx,yF,E,V,ferme?'ferme':'ouvert');
if(!ferme&&n===1&&(k+v)%3===0)for(let f=0;f<12;f+=4){R(fx+f,yF+18,4,4,'#a55a3a');R(fx+f,yF+15,4,3,['#6fbf5a','#d9576b','#e8c06a'][f/4]);}
}
if(n===0){balconM(R,x0+10,yF+23,BL-20);}                     /* le balcon filant du premier */
if(n===1&&v%2===0){                                           /* du linge qui sèche entre deux fenêtres */
g.strokeStyle='rgba(60,60,60,.6)';g.lineWidth=.5;g.beginPath();g.moveTo(x0+34,yF+6);g.lineTo(x0+72,yF+6);g.stroke();
[['#f2efe4',38],['#6a9ad0',48],['#d9576b',58]].forEach(([col,lx])=>{R(x0+lx,yF+6,7,9,col);R(x0+lx,yF+6,7,1,'rgba(0,0,0,.15)');});
}
}
const yR=sol-rez;
for(let y=yR;y<sol;y+=6){const d=((y-yR)/6)%2?10:0;R(x0,y,BL,6,PI_X.p);R(x0,y,BL,1,PI_X.h);
for(let x=x0+d;x<x0+BL;x+=20)R(x,y,1,6,PI_X.s);}
R(x0-2,yR-2,BL+4,3,PI_X.c);R(x0-2,yR-2,BL+4,1,PI_X.e);
const sorte=v===102?'coiffeur':'porte';
const bois=[{o:'#3a2616',p:'#5a3a20'},{o:'#1e3a2c',p:'#2c5440'},{o:'#22324a',p:'#34506e'},{o:'#4a2420',p:'#6a3430'}][v%4];
const devanture=(peinture,mot)=>{
R(x0+8,yR+4,BL-16,rez-6,peinture.o);R(x0+10,yR+6,BL-20,rez-10,peinture.p);R(x0+10,yR+6,BL-20,1,peinture.h);
R(x0+12,yR+7,BL-24,9,peinture.o);R(x0+13,yR+8,BL-26,7,peinture.c);
g.font='700 7px Georgia,serif';g.textAlign='center';g.fillStyle='#f0cf7d';g.fillText(mot,cx,yR+14,BL-34);g.textAlign='left';
[x0+14,x0+BL-58].forEach(vx=>{R(vx,yR+18,44,rez-22,'#1c242c');R(vx+1,yR+19,42,rez-24,'#2e3a44');
g.fillStyle='rgba(220,235,245,.18)';g.beginPath();g.moveTo(vx+4,yR+rez-6);g.lineTo(vx+16,yR+20);g.lineTo(vx+22,yR+20);g.lineTo(vx+10,yR+rez-6);g.fill();});
R(cx-9,yR+18,18,rez-18,peinture.o);R(cx-8,yR+19,16,rez-19,'#2e3a44');R(cx,yR+19,1,rez-19,peinture.o);
R(cx+4,yR+30,2,2,'#e8c06a');
};
if(sorte==='coiffeur'){
const noir={o:'#0e0e10',p:'#1c1c20',c:'#26262c',h:'#3a3a42'};
R(x0+6,yR+2,BL-12,rez-2,noir.o);R(x0+8,yR+4,BL-16,rez-6,noir.p);R(x0+8,yR+4,BL-16,1,noir.h);
R(x0+10,yR+5,BL-20,9,'#000000');R(x0+10,yR+13,BL-20,1,'#c9a24a');
g.font='700 8px Georgia,serif';g.textAlign='center';g.fillStyle='#e8c06a';g.fillText('MY design HAIR',cx-6,yR+12,BL-40);g.textAlign='left';
const vx=x0+12, vw=BL-50, vy=yR+16, vh=rez-18;
R(vx-1,vy-1,vw+2,vh+2,'#c9a24a');R(vx,vy,vw,vh,'#2a2e36');
R(vx+vw-30,vy+2,22,12,'#8fa3ab');R(vx+vw-29,vy+3,20,10,'#b9ccd4');
for(let k=0;k<6;k++){R(vx+vw-30+k*4.2,vy+1,2,1,'#fff6d0');}
R(vx+vw-26,vy+13,14,6,'#1a1a1a');R(vx+vw-27,vy+12,16,2,'#2a2a2a');R(vx+vw-20,vy+19,2,vh-20,'#b9c1c7');R(vx+vw-24,vy+vh-2,10,2,'#8f959b');
const hx=vx+16, hy=vy+2;
R(hx-5,hy+10,10,vh-10,'#141418');R(hx-5,hy+10,10,1,'#2a2a30');                /* le t-shirt noir */
R(hx-7,hy+12,14,4,'#c98a5a');R(hx-7,hy+12,14,1,'#e0a878');                     /* les bras croisés */
R(hx-2,hy+8,4,3,'#c98a5a');                                                    /* le cou */
g.fillStyle='#d8a070';g.beginPath();g.ellipse(hx,hy+4,4.2,5,0,0,Math.PI*2);g.fill();   /* le crâne */
R(hx-4,hy+5,1,2,'#c08858');R(hx+3,hy+5,1,2,'#c08858');                         /* les oreilles */
R(hx-2,hy+4,1,1,'#1b1b1b');R(hx+1,hy+4,1,1,'#1b1b1b');                         /* les yeux */
R(hx-3,hy+6,6,3,'#3a2a1c');R(hx-1,hy+7,2,1,'#b06a50');                         /* la barbe, le sourire */
g.fillStyle='rgba(255,255,255,.75)';g.beginPath();g.ellipse(hx-1.5,hy+1,1.6,1,0,0,Math.PI*2);g.fill();  /* le reflet sur le crâne */
g.fillStyle='rgba(220,235,245,.16)';g.beginPath();g.moveTo(vx+26,vy+vh);g.lineTo(vx+36,vy);g.lineTo(vx+42,vy);g.lineTo(vx+32,vy+vh);g.fill();
R(x0+BL-34,yR+16,18,rez-16,'#c9a24a');R(x0+BL-33,yR+17,16,rez-17,'#2a2e36');R(x0+BL-20,yR+28,1,6,'#e8c06a');
R(x0+BL-12,yR+4,5,26,'#f4f0e4');R(x0+BL-13,yR+3,7,2,'#c9a24a');R(x0+BL-13,yR+30,7,2,'#c9a24a');
}else if(sorte==='bar'){
devanture({o:'#1e3a2c',p:'#2c5440',c:'#346448',h:'#4a7a5c'},'BAR DE LA MARINE');
[x0+14,x0+BL-58].forEach(vx=>{R(vx+2,yR+rez-12,40,3,'#b9c1c7');
for(let k=0;k<9;k++)R(vx+4+k*4,yR+22+(k%2)*2,2,6,['#3a7a4a','#c9a24a','#8a2a2a','#e8e0c0'][k%4]);});
for(let r=0;r<4;r++)for(let k=0;k<BL-4;k+=8){R(x0+2+k,yR-4+r*3,4,3,r<2?'#c0392b':'#a93226');R(x0+6+k,yR-4+r*3,4,3,r<2?'#f4f0e4':'#dcd6c6');}
for(let k=0;k<BL-4;k+=8){R(x0+2+k,yR+8,4,2,'#c0392b');R(x0+6+k,yR+8,4,2,'#f4f0e4');}
R(x0+2,yR+10,BL-4,1,'rgba(40,20,10,.35)');
}else if(sorte==='savon'){
devanture({o:'#2a3a5a',p:'#3a5078',c:'#46608a',h:'#6a84ac'},'SAVONNERIE');
[x0+14,x0+BL-58].forEach(vx=>{for(let r=0;r<3;r++)for(let k=0;k<5-r;k++){
const sx=vx+6+k*7+r*3.5, sy=yR+rez-12-r*6;R(sx,sy,6,5,(k+r)%2?'#8a9a4a':'#e8dcae');R(sx,sy,6,1,'rgba(255,255,255,.35)');}});
}else if(sorte==='santons'){
devanture({o:'#5a2a2a',p:'#7a3a36',c:'#8a4640',h:'#a8605a'},'SANTONS');
[x0+14,x0+BL-58].forEach(vx=>{for(let r=0;r<2;r++){R(vx+2,yR+rez-10-r*9,40,2,'#8a6238');
for(let k=0;k<6;k++){const sx=vx+5+k*6,sy=yR+rez-17-r*9;R(sx,sy,3,6,['#c0392b','#2d6fb0','#e8c06a','#3f8a4a','#f2efe4'][(k+r)%5]);R(sx,sy-2,3,2,'#e0b48a');}}});
}else{
R(cx-18,yR+2,36,rez-2,PI_X.c);R(cx-18,yR+2,36,1,PI_X.e);
g.fillStyle=bois.o;g.beginPath();g.moveTo(cx-14,sol);g.lineTo(cx-14,yR+18);g.arc(cx,yR+18,14,Math.PI,0);g.lineTo(cx+14,sol);g.fill();
g.fillStyle=bois.p;g.beginPath();g.moveTo(cx-12,sol);g.lineTo(cx-12,yR+18);g.arc(cx,yR+18,12,Math.PI,0);g.lineTo(cx+12,sol);g.fill();
R(cx,yR+6,1,rez-6,bois.o);for(let y=yR+14;y<sol;y+=6)for(let x=cx-10;x<cx+11;x+=5)R(x,y,1,1,'#c9a24a');
R(cx-4,yR+26,3,3,'#c9a24a');R(cx+2,yR+26,3,3,'#c9a24a');
[x0+16,x0+BL-40].forEach(vx=>{R(vx,yR+10,24,20,PI_X.c);R(vx+2,yR+12,20,16,'#26303a');for(let k=3;k<20;k+=4)R(vx+2+k,yR+12,1,16,'#1f2224');});
}
R(x0+BL-6,basToit+12,2,murH-12,'#8a867a');R(x0+BL-7,basToit+12,1,murH-12,'#b9b4a2');   /* la descente d'eau */
const n2=document.createElement('canvas');n2.width=W*D;n2.height=Ht*D;
const h2=n2.getContext('2d');h2.setTransform(D,0,0,D,0,0);
h2.fillStyle='rgba(16,20,44,.42)';h2.fillRect(x0-8,basToit-30,BL+16,murH+34);   /* le voile ne déborde pas du toit */
[[x0+22,-24],[x0+BL-30,-18]].forEach(([x,dy])=>h2.fillRect(x-1,basToit+dy-14,11,dy+16));
for(let n=0;n<2;n++){const yF=basToit+20+n*etage;
for(let k=0;k<4;k++){if(alea(v*9+n*4+k)<0.25||alea(v*5+n*7+k*3)<0.4)continue;
const fx=x0+16+k*31;h2.fillStyle='#ffd98a';h2.fillRect(fx+1,yF+1,11,18);h2.fillStyle='#fff0c0';h2.fillRect(fx+2,yF+2,4,7);
h2.fillStyle='rgba(120,70,20,.5)';h2.fillRect(fx+6,yF,1,20);}}
if(sorte!=='porte'){h2.fillStyle='#ffcf7a';[x0+15,x0+BL-57].forEach(vx=>h2.fillRect(vx,yR+19,42,rez-24));
const l=h2.createRadialGradient(cx,sol,4,cx,sol,60);l.addColorStop(0,'rgba(255,200,110,.45)');l.addColorStop(1,'rgba(255,200,110,0)');
h2.fillStyle=l;h2.fillRect(cx-60,sol-60,120,68);}
return {toile:c,W,H:Ht,sol,nuit:n2};
}
function graverLaGarde(){
const W=190,Ht=196,cx=W/2,sol=Ht-4;
const c=document.createElement('canvas');
/* on grave les façades plus finement : les enseignes étaient tracées
   sur une toile deux fois trop petite, puis agrandies à l'écran */
const D=Math.max(2,Math.min(3,Math.ceil(window.devicePixelRatio||2)));
c.width=W*D;c.height=Ht*D;
const g=c.getContext('2d');g.setTransform(D,0,0,D,0,0);g.imageSmoothingEnabled=false;
const R=(x,y,w,h,col)=>{g.fillStyle=col;g.fillRect(x|0,y|0,Math.max(1,w|0),Math.max(1,h|0));};
const CAL={o:'#8a7a5c',s:'#aa9a78',p:'#c4b48e',c:'#d6c8a2',h:'#e6dab8',e:'#f2ead0'};
const plat=142, pied=sol-4;
const bord=(x)=>{const u=(x-cx)/(W*0.5);return Math.round(plat+Math.pow(Math.abs(u),2.2)*30+Math.sin(x/9)*2);};
for(let x=24;x<W-24;x++){
const b=bord(x);
for(let y=b;y<pied;y++){
const strate=Math.floor((y-b)/5), lum=((x+strate*7)%13<2)?CAL.o:(((y-b)%5===0)?CAL.s:((x*3+y)%11<3?CAL.c:CAL.p));
R(x,y,1,1,lum);
}
R(x,b,1,2,CAL.e);                                           /* l'arête qui prend la lumière */
for(let y=Math.max(0,b-22);y<b;y++)R(x,y,1,1,((x*7+y*3)%9<3)?'#8a9a56':((x+y)%5?'#7a8c4a':'#6a7c40'));
}
g.fillStyle='rgba(60,45,25,.22)';g.beginPath();g.moveTo(cx+30,plat+6);g.lineTo(W-24,plat+30);g.lineTo(W-24,pied);g.lineTo(cx+50,pied);g.fill();
const pin=(x,y,r)=>{R(x-1,y,2,6,'#5b3f21');
g.fillStyle='#2f5b34';g.beginPath();g.ellipse(x,y-2,r,r*0.45,0,0,7);g.fill();
g.fillStyle='#4a7d42';g.beginPath();g.ellipse(x-1,y-3,r*0.7,r*0.3,0,0,7);g.fill();
g.fillStyle='#6a9a58';g.fillRect(x-r*0.4,y-4,r*0.5,1);};
[[34,158,7],[156,156,8],[46,176,6],[144,178,6],[60,138,6],[130,136,7]].forEach(([x,y,r])=>pin(x,y,r));
for(let i=0;i<30;i++){const x=26+alea(i*4.7)*(W-52),y=plat+10+alea(i*2.9)*(pied-plat-14);
if(Math.abs(x-cx)<18)continue;R(x,y,3,2,i%2?'#6a7c40':'#7a8c4a');}
const lacets=[[cx-12,pied],[cx+16,pied-16],[cx-14,pied-32],[cx+12,plat+4]];
for(let i=0;i<lacets.length-1;i++){
const [xa,ya]=lacets[i],[xb,yb]=lacets[i+1];
for(let k=0;k<=12;k++){const x=xa+(xb-xa)*k/12, y=ya+(yb-ya)*k/12;
R(x-5,y-2,11,3,CAL.h);R(x-5,y-2,11,1,CAL.e);R(x-5,y+1,11,1,CAL.o);}
g.strokeStyle='#3b3a36';g.lineWidth=.7;g.beginPath();g.moveTo(xa+6,ya-6);g.lineTo(xb+6,yb-6);g.stroke();
}
const fy=plat-4;
R(cx-52,fy-14,104,16,CAL.p);R(cx-52,fy-14,104,2,CAL.e);
for(let x=cx-52;x<cx+52;x+=8){R(x,fy-18,5,4,CAL.c);R(x,fy-18,5,1,CAL.e);}
for(let y=fy-12;y<fy+2;y+=4)R(cx-52,y,104,1,'rgba(90,70,40,.22)');
R(cx-52,fy+2,104,2,'rgba(40,30,15,.3)');
const by=fy-16;
const raye=(x,y,w,h)=>{for(let j=0;j<h;j++)R(x,y+j,w,1,(Math.floor(j/3)%2)?'#7e9282':'#f4efe2');
R(x,y,1,h,'rgba(255,255,255,.35)');R(x+w-1,y,1,h,'rgba(0,0,0,.18)');};
R(cx-34,by-30,68,8,'#9aa296');R(cx-34,by-30,68,1,'#c4cabe');for(let x=cx-34;x<cx+34;x+=4)R(x,by-29,1,7,'#7e867a');
raye(cx-34,by-22,68,22);
for(let k=0;k<5;k++){const x=cx-28+k*13;R(x,by-17,6,11,'#2e3a44');g.fillStyle='#2e3a44';g.beginPath();g.arc(x+3,by-17,3,Math.PI,0);g.fill();}
R(cx-6,by-14,12,14,'#3a2a1c');g.fillStyle='#3a2a1c';g.beginPath();g.arc(cx,by-14,6,Math.PI,0);g.fill();
[[-22,7],[22,7]].forEach(([dx,r])=>{const x=cx+dx,y=by-30;
g.fillStyle='#c4c0b0';g.beginPath();g.arc(x,y,r,Math.PI,0);g.fill();
g.fillStyle='#e6e2d2';g.beginPath();g.arc(x-1,y-1,r-2,Math.PI,Math.PI*1.6);g.fill();
for(let a=0;a<3;a++)R(x-r+2+a*(r-1),y-r+3,1,r-3,'#9a9688');
R(x-1,y-r-3,2,3,'#e8c06a');});
const tx=cx, tb=by-22;
raye(tx-9,tb-36,18,36);
R(tx-10,tb-37,20,2,'#6f7d70');R(tx-10,tb-21,20,2,'#6f7d70');
R(tx-6,tb-33,5,9,'#2e3a44');R(tx+1,tb-33,5,9,'#2e3a44');
g.fillStyle='#2e3a44';g.beginPath();g.arc(tx-3.5,tb-33,2.5,Math.PI,0);g.fill();g.beginPath();g.arc(tx+3.5,tb-33,2.5,Math.PI,0);g.fill();
R(tx-4,tb-17,8,8,'#e8e2d0');R(tx-3,tb-16,6,6,'#2e3a44');R(tx,tb-16,1,6,'#e8e2d0');R(tx-3,tb-13,6,1,'#e8e2d0');  /* l'horloge */
R(tx-6,tb-43,12,6,'#d6d0be');R(tx-6,tb-43,12,1,'#f2ecdc');R(tx-5,tb-46,10,3,'#bdb7a5');   /* le socle */
const vy=tb-46;
R(tx-3,vy-16,6,16,'#c8902a');R(tx-2,vy-16,3,16,'#e8b84a');R(tx-2,vy-20,4,4,'#e8b84a');R(tx-1,vy-20,2,2,'#fff0b8');
R(tx-5,vy-12,3,4,'#d8a03a');R(tx-6,vy-14,3,3,'#e8b84a');                               /* l'Enfant, sur le bras */
R(tx,vy-15,1,12,'#fff4c8');
const n2=document.createElement('canvas');n2.width=W*D;n2.height=Ht*D;
const h2=n2.getContext('2d');h2.setTransform(D,0,0,D,0,0);
h2.fillStyle='rgba(14,18,42,.5)';for(let x=24;x<W-24;x++){const b=bord(x)-24;h2.fillRect(x,b,1,Ht-b);}
const l=h2.createRadialGradient(tx,tb-20,4,tx,tb-20,56);l.addColorStop(0,'rgba(255,238,196,.42)');l.addColorStop(1,'rgba(255,238,196,0)');
h2.fillStyle=l;h2.fillRect(tx-56,tb-76,112,112);
h2.fillStyle='rgba(255,246,222,.35)';h2.fillRect(cx-34,by-22,68,22);h2.fillRect(tx-9,tb-36,18,36);
h2.fillStyle='#ffe07a';h2.fillRect(tx-3,vy-16,6,16);h2.fillRect(tx-2,vy-20,4,4);h2.fillRect(tx-6,vy-14,4,6);
const hv=h2.createRadialGradient(tx,vy-10,1,tx,vy-10,14);hv.addColorStop(0,'rgba(255,220,120,.8)');hv.addColorStop(1,'rgba(255,220,120,0)');
h2.fillStyle=hv;h2.fillRect(tx-14,vy-24,28,28);
for(let i=0;i<lacets.length;i++){h2.fillStyle='#ffd98a';h2.fillRect(lacets[i][0]+8,lacets[i][1]-10,2,2);}
return {toile:c,W,H:Ht,sol,nuit:n2};
}
/* ================= LA GRANDE AFFICHE DU BOUT DU QUAI =================
   Trois dessins possibles, tous de meme encombrement : 'peinte' (une
   affiche de chemin de fer, coucher de soleil et pinede), 'bois' (le
   panneau de parc, planche epaisse et lettres creusees), 'email' (la
   plaque emaillee bleue des rues de Marseille, en grand). On en change
   avec AFFICHE_STYLE. */
const AFFICHE_STYLE='email';
/* L'ALPHABET, en pixels pleins : net a toutes les tailles, contrairement a
   une police vectorielle que la camera agrandirait. Sept rangs : les deux
   premiers ne servent qu'au chapeau du E. */
const ALPHA_A={
 L:[[0,0,0],[0,0,0],[1,0,0],[1,0,0],[1,0,0],[1,0,0],[1,1,1]],
 A:[[0,0,0],[0,0,0],[0,1,0],[1,0,1],[1,1,1],[1,0,1],[1,0,1]],
 F:[[0,0,0],[0,0,0],[1,1,1],[1,0,0],[1,1,0],[1,0,0],[1,0,0]],
 O:[[0,0,0],[0,0,0],[1,1,1],[1,0,1],[1,0,1],[1,0,1],[1,1,1]],
 R:[[0,0,0],[0,0,0],[1,1,0],[1,0,1],[1,1,0],[1,0,1],[1,0,1]],
 E:[[0,0,0],[0,0,0],[1,1,1],[1,0,0],[1,1,0],[1,0,0],[1,1,1]],
 'Ê':[[0,1,0],[1,0,1],[1,1,1],[1,0,0],[1,1,0],[1,0,0],[1,1,1]],
 T:[[0,0,0],[0,0,0],[1,1,1],[0,1,0],[0,1,0],[0,1,0],[0,1,0]],
 ' ':[[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0]]};
function ecrireA(g,txt,cx,y,s,col,ombre){
const R=(x,yy,w,h,c)=>{g.fillStyle=c;g.fillRect(x|0,yy|0,Math.max(1,w|0),Math.max(1,h|0));};
const L=Array.from(txt);
let lg=0;for(const ch of L)lg+=((ALPHA_A[ch]||ALPHA_A[' '])[0].length+1);
lg-=1;
let px=Math.round(cx-lg*s/2);
for(const ch of L){
  const G=ALPHA_A[ch]||ALPHA_A[' '];
  for(let r=0;r<G.length;r++)for(let c=0;c<G[0].length;c++)if(G[r][c]){
    if(ombre)R(px+c*s+Math.max(1,Math.round(s/2)),y+r*s+Math.max(1,Math.round(s/2)),s,s,ombre);
    R(px+c*s,y+r*s,s,s,col);
  }
  px+=(G[0].length+1)*s;
}
}
function graverLAffiche(g,cx,bas,style){
const R=(x,y,w,h,col)=>{g.fillStyle=col;g.fillRect(x|0,y|0,Math.max(1,w|0),Math.max(1,h|0));};
const A=(i)=>alea(i*1.77+0.31);
/* ELLE DESCEND LE PLUS BAS POSSIBLE. Quand on marche sur le quai, la
   camera ne montre du ciel que les quatre-vingts pixels sous l'horizon :
   une affiche plantee plus haut aurait la tete coupee. Son pied passe
   derriere la balustrade, qui le cache. */
const L=116, H=66, x0=cx-L/2, y0=bas-H-2;
/* LES DEUX PIEDS, plantes derriere le garde-corps */
[cx-34,cx+28].forEach(px=>{
  R(px,y0+H-2,7,20,'#5b4428');R(px,y0+H-2,2,20,'#7d6238');R(px+5,y0+H-2,2,20,'#3f2f1b');
});
if(style!=='bois'){                       /* les deux faces plates ont leur cadre */
  R(x0-5,y0-5,L+10,H+10,'#3a2b18');
  R(x0-5,y0-5,L+10,3,'#6b5330');
  R(x0-5,y0+H+2,L+10,3,'#241a0e');
}
if(style==='peinte'){
  /* L'AFFICHE DE CHEMIN DE FER : un ciel qui tombe du creme a l'abricot,
     le soleil bas, deux plans de pinede, un sentier, et le titre en bas. */
  const cielH=26, col1=y0+cielH;
  for(let y=0;y<cielH;y++){
    const t=y/cielH;
    R(x0,y0+y,L,1,'rgb('+Math.round(248-t*12)+','+Math.round(228-t*46)+','+Math.round(182-t*80)+')');
  }
  g.fillStyle='#f6d98a';g.beginPath();g.arc(cx+30,col1-6,11,0,7);g.fill();
  g.fillStyle='#fbeab8';g.beginPath();g.arc(cx+30,col1-6,6,0,7);g.fill();
  g.fillStyle='#c98f4a';g.beginPath();
  g.moveTo(x0,col1+5);g.quadraticCurveTo(x0+36,col1-10,x0+72,col1+2);
  g.quadraticCurveTo(x0+98,col1+9,x0+L,col1-3);g.lineTo(x0+L,col1+18);g.lineTo(x0,col1+18);g.fill();
  const pin=(px,py,h,col)=>{for(let k=0;k<h;k++){const w=1+Math.round(k*0.8);
    R(px-Math.round(w/2),py-h+k,Math.max(1,w),1,col);} R(px-1,py-2,2,3,col);};
  for(let i=0;i<22;i++)pin(x0+4+A(i*1.3)*(L-8),col1+15,6+Math.round(A(i*2.7)*5),'#7a5a2e');
  for(let i=0;i<20;i++)pin(x0+3+A(i*3.1+7)*(L-6),col1+23,7+Math.round(A(i*4.3)*8),'#3d5b31');
  R(x0,col1+21,L,H-cielH-21,'#2f4a28');
  g.fillStyle='#d8bb7c';g.beginPath();
  g.moveTo(cx-3,col1+15);g.lineTo(cx+3,col1+15);g.lineTo(cx+15,y0+H);g.lineTo(cx-15,y0+H);g.fill();
  /* LE BANDEAU DU TITRE remonte de six pixels : la balustrade du
     garde-corps passe devant le pied de l'affiche et mangeait le bas des
     lettres. */
  const by=y0+H-26;
  R(x0,by,L,22,'#241a0e');R(x0,by,L,2,'#6b5330');
  ecrireA(g,'LA FORÊT',cx,by+3,2,'#f3e3b6','#120c06');
}
else if(style==='email'){
  /* LA PLAQUE EMAILLEE : bleu profond, double filet blanc, lettres
     blanches, quatre boulons et la fleche en bas. */
  R(x0,y0,L,H,'#17365c');
  for(let i=0;i<220;i++)R(x0+A(i)*L,y0+A(i*2.3)*H,1,1,'rgba(255,255,255,.05)');
  R(x0+5,y0+5,L-10,2,'#f2f4f0');R(x0+5,y0+H-7,L-10,2,'#f2f4f0');
  R(x0+5,y0+5,2,H-10,'#f2f4f0');R(x0+L-7,y0+5,2,H-10,'#f2f4f0');
  [[x0+12,y0+12],[x0+L-16,y0+12],[x0+12,y0+H-16],[x0+L-16,y0+H-16]].forEach(([bx,by])=>{
    R(bx,by,4,4,'#c8cdd2');R(bx,by,4,1,'#eef1f4');R(bx+3,by,1,4,'#8f979e');});
  ecrireA(g,'LA FORÊT',cx,y0+12,2,'#f6f8f4','#0d2340');
  const fy=y0+H-24;
  R(cx-30,fy,46,4,'#f6f8f4');
  g.fillStyle='#f6f8f4';g.beginPath();
  g.moveTo(cx+16,fy-5);g.lineTo(cx+32,fy+2);g.lineTo(cx+16,fy+9);g.fill();
}
else {
  /* LE PANNEAU DE PARC : planche epaisse, lettres creusees dans le bois et
     un rameau de pin grave sous le mot. */
  R(x0-6,y0-6,L+12,H+12,'#3f2f1b');
  for(let i=0;i<L+8;i+=7){
    const t=Math.floor(A(i*1.9)*4);
    R(x0-4+i,y0-4,6,H+8,['#7d5f38','#6e5230','#86673d','#6a4e2d'][t]);
    R(x0-4+i,y0-4,1,H+8,'#8f7245');
    for(let k=0;k<H+8;k+=11)R(x0-2+i,y0-2+k+Math.floor(A(i+k)*3),4,1,'rgba(48,32,16,.30)');
  }
  R(x0-4,y0-4,L+8,3,'#9a7a4a');R(x0-4,y0+H+1,L+8,3,'#3f2f1b');
  [[x0+4,y0+4],[x0+L-8,y0+4],[x0+4,y0+H-8],[x0+L-8,y0+H-8]].forEach(([bx,by])=>{
    R(bx,by,3,3,'#c9b48a');R(bx,by,3,1,'#eadfc2');});
  ecrireA(g,'LA FORÊT',cx,y0+10,2,'#f1e2bb','#3a2a14');
  g.strokeStyle='#3f6b3a';g.lineWidth=2;
  g.beginPath();g.moveTo(cx-26,y0+H-20);g.quadraticCurveTo(cx,y0+H-27,cx+26,y0+H-20);g.stroke();
  g.strokeStyle='#4f8445';g.lineWidth=1.4;
  for(let k=-4;k<=4;k++){const px=cx+k*6, py=y0+H-23-Math.round(Math.cos(k/4*1.4)*3);
    g.beginPath();g.moveTo(px,py+2);g.lineTo(px+(k<0?-4:4),py-5);g.stroke();}
}
}
/* ================= LES COLLINES DE L'EST =================
   Trois plans de pinede, du plus lointain au plus proche, chacun un peu
   moins voile que le precedent. Rien d'autre : c'est un horizon, pas un
   decor. */
function graverLesCollines(g,x0,x1,bas){
const R=(x,y,w,h,col)=>{g.fillStyle=col;g.fillRect(x|0,y|0,Math.max(1,w|0),Math.max(1,h|0));};
const A=(i)=>alea(i*2.17+0.9);
/* ELLES MONTENT VERS L'EST. Une crete qui descend en s'eloignant dirait
   que la terre s'arrete par la ; c'est l'inverse qu'on veut faire sentir. */
const PLANS=[
  {dy:98, amp:20, monte:30, col:'#7f98a2', cime:'#8fa8b0', voile:0.52, pins:0, pas:0},
  {dy:70, amp:24, monte:38, col:'#5f7f6c', cime:'#6d8d77', voile:0.30, pins:1, pas:17},
  {dy:40, amp:18, monte:34, col:'#44664f', cime:'#4f7459', voile:0.12, pins:1, pas:13}];
PLANS.forEach((P,n)=>{
  const crete=[];
  for(let x=x0;x<=x1;x++){
    const t=(x-x0)/Math.max(1,x1-x0);
    const y=bas-P.dy-t*(P.monte||0)
            -Math.sin(t*2.4+n*1.9)*P.amp-Math.sin(t*6.7+n*0.7)*P.amp*0.34
            -Math.sin(t*13.1+n)*P.amp*0.12;
    crete[x]=Math.round(y);
    R(x,crete[x],1,bas-crete[x]+2,P.col);
    R(x,crete[x],1,2,P.cime);
  }
  /* la pinede sur la crete : des triangles de trois pixels de large */
  if(P.pins)for(let x=x0+4;x<x1-2;x+=P.pas+Math.floor(A(x*0.3+n)*7)){
    const h=3+Math.floor(A(x*0.7+n*3)*4), y=crete[x];
    for(let k=0;k<h;k++)R(x-Math.min(2,k),y-h+k,1+Math.min(2,k)*2,1,P.col);
  }
  /* le voile atmospherique : le lointain est plus pale */
  g.fillStyle='rgba(196,208,214,'+P.voile.toFixed(2)+')';
  g.fillRect(x0,0,x1-x0+1,bas+2);
});
/* la brume au pied des collines, la ou elles touchent la ville */
const br=g.createLinearGradient(0,bas-26,0,bas+2);
br.addColorStop(0,'rgba(214,222,226,0)');br.addColorStop(1,'rgba(214,222,226,.55)');
g.fillStyle=br;g.fillRect(x0,bas-26,x1-x0+1,28);
}
function graverLesToitsDuFond(g,largeur,hauteur){
const R=(x,y,w,h,col)=>{g.fillStyle=col;g.fillRect(x|0,y|0,Math.max(1,w|0),Math.max(1,h|0));};
for(let rang=0;rang<7;rang++){
const yb=10+rang*20, voile=0.42-rang*0.06;
let x=-((rang*37)%50);
while(x<largeur){
const w=30+Math.floor(alea(x*0.13+rang*7)*34), h=10+Math.floor(alea(x*0.29+rang)*8);
const E=ENDUITS[Math.floor(alea(x+rang*3)*4)];
R(x,yb,w,h+6,E.s);R(x,yb,w,1,E.c);
for(let k=4;k<w-4;k+=8)R(x+k,yb+4,3,4,'#3a3430');
for(let r=0;r<3;r++){R(x-2+r,yb-4-r*3,w+4-r*2,4,r%2?TU_M.s:TU_M.p);
for(let k=0;k<w+4-r*2;k+=4)R(x-2+r+k+3,yb-4-r*3,1,4,TU_M.o);}
R(x-1,yb-12,w+2,2,TU_M.faite);
if(alea(x*3+rang)<.35){R(x+w-10,yb-18,4,6,E.p);R(x+w-11,yb-19,6,2,E.o);}
g.fillStyle='rgba(190,200,210,'+Math.max(0,voile).toFixed(2)+')';g.fillRect(x-2,yb-18,w+4,h+24);
x+=w+2+Math.floor(alea(x+rang*11)*6);
}
}
}
function graverBelArbre(v){
const W=112,Ht=132,cx=56,sol=124;
const c=document.createElement('canvas');
/* on grave les façades plus finement : les enseignes étaient tracées
   sur une toile deux fois trop petite, puis agrandies à l'écran */
const D=Math.max(2,Math.min(3,Math.ceil(window.devicePixelRatio||2)));
c.width=W*D;c.height=Ht*D;const g=c.getContext('2d');g.setTransform(D,0,0,D,0,0);g.imageSmoothingEnabled=false;
const R=(x,y,w,h,col)=>{g.fillStyle=col;g.fillRect(x|0,y|0,Math.max(1,w|0),Math.max(1,h|0));};
const A=(i)=>alea(i*1.93+v*17.1);
g.fillStyle='rgba(40,45,20,.22)';g.beginPath();g.ellipse(cx+10,sol+1,40,9,0,0,7);g.fill();
g.fillStyle='#4a4a44';g.beginPath();g.ellipse(cx,sol,13,4.5,0,0,7);g.fill();
g.strokeStyle='#6a6a62';g.lineWidth=1;g.beginPath();g.ellipse(cx,sol,13,4.5,0,0,7);g.stroke();
for(let k=-10;k<=10;k+=4){R(cx+k,sol-3,1,6,'#2e2e2a');}
g.strokeStyle='#2e2e2a';g.beginPath();g.ellipse(cx,sol,8,2.8,0,0,7);g.stroke();
for(let y=0;y<50;y++){const w=Math.round(12-y*0.08+(y<5?4-y*0.8:0));R(cx-w/2,sol-2-y,w,1,'#b9b29a');}
for(let i=0;i<60;i++){const y=sol-4-A(i)*46, x=cx-5+A(i+40)*9;
R(x,y,2+A(i+9)*3,2+A(i+19)*3,['#8f896c','#d9d4bc','#7a755a','#c9c4a4','#a8a288'][i%5]);}
R(cx+3,sol-50,2,48,'rgba(40,35,20,.25)');                      /* le côté à l'ombre */
g.strokeStyle='#a8a288';g.lineWidth=3;g.beginPath();
g.moveTo(cx-2,sol-48);g.lineTo(cx-16,sol-68);g.moveTo(cx+2,sol-48);g.lineTo(cx+18,sol-66);g.moveTo(cx,sol-50);g.lineTo(cx+2,sol-76);g.stroke();
const tons=v%2?['#2f5a2c','#3f7236','#568a42','#72a352','#95c06a']:['#34602e','#46793a','#5f9446','#7bab58','#a3c874'];
const grappes=[];
for(let i=0;i<34;i++){
const a=A(i*3)*Math.PI*2, r=A(i*5)*34;
grappes.push([cx+Math.cos(a)*r*1.15, sol-84+Math.sin(a)*r*0.72, 9+A(i*7)*8]);
}
grappes.sort((p,q)=>p[1]-q[1]);
grappes.forEach(([x,y,r])=>{g.fillStyle=tons[0];g.beginPath();g.ellipse(x+2,y+3,r,r*0.8,0,0,7);g.fill();});
grappes.forEach(([x,y,r])=>{g.fillStyle=tons[1];g.beginPath();g.ellipse(x,y,r*0.9,r*0.72,0,0,7);g.fill();});
grappes.forEach(([x,y,r])=>{g.fillStyle=tons[2];g.beginPath();g.ellipse(x-r*0.25,y-r*0.22,r*0.6,r*0.46,0,0,7);g.fill();});
grappes.filter(([x,y])=>x<cx+8&&y<sol-80).forEach(([x,y,r])=>{g.fillStyle=tons[3];g.beginPath();g.ellipse(x-r*0.35,y-r*0.3,r*0.35,r*0.26,0,0,7);g.fill();});
for(let i=0;i<260;i++){
const a=A(i*11)*Math.PI*2, r=Math.sqrt(A(i*13))*44;
const x=cx+Math.cos(a)*r*1.1, y=sol-84+Math.sin(a)*r*0.7;
const d=g.getImageData((x*D)|0,(y*D)|0,1,1).data;if(d[3]<200)continue;
R(x,y,1,1,i%4===0?tons[4]:(i%4===1?tons[0]:tons[3]));
}
for(let i=0;i<6;i++){const x=cx-26+A(i*17)*52, y=sol-70+A(i*19)*16;R(x,y,1,3,'#6b5a3a');R(x-1,y+3,3,3,'#8a7a4a');}
return {toile:c,W,H:Ht,sol};
}
function graverLaCriee(){
const W=196,Ht=150,cx=98,sol=142;
const c=document.createElement('canvas');
/* on grave les façades plus finement : les enseignes étaient tracées
   sur une toile deux fois trop petite, puis agrandies à l'écran */
const D=Math.max(2,Math.min(3,Math.ceil(window.devicePixelRatio||2)));
c.width=W*D;c.height=Ht*D;const g=c.getContext('2d');g.setTransform(D,0,0,D,0,0);g.imageSmoothingEnabled=false;
const R=(x,y,w,h,col)=>{g.fillStyle=col;g.fillRect(x|0,y|0,Math.max(1,w|0),Math.max(1,h|0));};
const BL=176,x0=cx-BL/2,murH=54,basToit=sol-murH;
const PI={o:'#8a7a5c',s:'#aa9a78',p:'#c9b68e',c:'#d8c8a2',h:'#e6dab8',e:'#f2ead0'};
g.fillStyle='rgba(40,30,18,.26)';g.beginPath();g.ellipse(cx+4,sol+3,BL*0.55,8,0,0,7);g.fill();
const rangs=12;
for(let rg=rangs-1;rg>=0;rg--){
const y=basToit-rg*6, ret=Math.round(rg/rangs*22), xa=x0-6+ret, l=BL+12-ret*2;
for(let x=xa;x<xa+l;x+=8){
const reflet=((x+rg*11)%40)<8;
R(x,y,8,6,reflet?'#cfe6f0':(rg%2?'#8fb8cc':'#9cc4d6'));R(x,y,8,1,'#e8f4f8');
R(x+7,y,1,6,'#3a4a52');
}
R(xa,y+5,l,1,'#3a4a52');
}
R(cx-30,basToit-rangs*6-6,60,6,'#5a6a72');R(cx-30,basToit-rangs*6-6,60,1,'#b9c8d0');
for(let x=cx-28;x<cx+28;x+=6)R(x,basToit-rangs*6-5,3,4,'#2e3a44');
R(cx-1,basToit-rangs*6-16,2,10,'#3a3a36');R(cx-8,basToit-rangs*6-19,14,4,'#c9a24a');R(cx-11,basToit-rangs*6-18,3,2,'#c9a24a');R(cx+4,basToit-rangs*6-18,1,1,'#1b1b1b');
R(x0-6,basToit,BL+12,4,'#4a5a62');R(x0-6,basToit,BL+12,1,'#8a9aa2');
for(let x=x0-4;x<x0+BL+4;x+=8)R(x,basToit+4,2,3,'#4a5a62');
R(x0,basToit+4,BL,murH-4,PI.p);
for(let y=basToit+4;y<sol;y+=6){const d=((y/6)%2)?10:0;R(x0,y,BL,1,PI.s);R(x0,y+1,BL,1,'rgba(255,255,255,.12)');
for(let x=x0+d;x<x0+BL;x+=20)R(x,y,1,6,PI.s);}
R(x0,basToit+4,BL,2,'rgba(30,20,10,.3)');
for(let k=0;k<=6;k++){const x=x0+k*(BL/6)-3;R(x,basToit+6,6,murH-6,PI.c);R(x,basToit+6,1,murH-6,PI.e);R(x+5,basToit+6,1,murH-6,PI.s);}
for(let k=0;k<6;k++){
const bx=x0+k*(BL/6)+4, bw=BL/6-8, ouverte=k===2||k===3;
g.fillStyle=ouverte?'#2a2218':'#3a4a54';
g.beginPath();g.moveTo(bx,sol);g.lineTo(bx,basToit+22);g.arc(bx+bw/2,basToit+22,bw/2,Math.PI,0);g.lineTo(bx+bw,sol);g.closePath();g.fill();
R(bx-1,basToit+22-bw/2-2,bw+2,2,PI.e);                                         /* la clé de l'arc */
if(!ouverte){
for(let x=bx+4;x<bx+bw;x+=5)R(x,basToit+16,1,sol-basToit-18,'#1f2a30');
for(let y=basToit+26;y<sol;y+=7)R(bx,y,bw,1,'#1f2a30');
g.fillStyle='rgba(220,235,245,.2)';g.beginPath();g.moveTo(bx+2,sol-4);g.lineTo(bx+bw*0.5,basToit+18);g.lineTo(bx+bw*0.7,basToit+18);g.lineTo(bx+bw*0.2,sol-4);g.fill();
}else{
R(bx+2,sol-12,bw-4,4,'#b9c1c7');R(bx+2,sol-12,bw-4,1,'#e1e6ea');
for(let j=0;j<3;j++){R(bx+4+j*8,sol-16,6,4,'#e8f2f6');R(bx+5+j*8,sol-15,4,1,['#9fb3c4','#d0553f','#7d8b96'][j]);}
R(bx+bw/2-2,sol-28,5,12,'#2d6fb0');R(bx+bw/2-2,sol-31,5,3,'#e0b48a');R(bx+bw/2-2,sol-32,5,1,'#3a2a1c');
}
}
R(cx-40,basToit+7,80,10,'#1f2a30');R(cx-39,basToit+8,78,8,'#2e3a44');
g.font='700 8px Georgia,serif';g.textAlign='center';g.fillStyle='#e8c06a';g.fillText('LA CRIÉE',cx,basToit+15,70);
g.fillStyle='#f2ead0';g.beginPath();g.arc(cx,basToit-4,7,0,7);g.fill();
g.strokeStyle='#3a3a36';g.lineWidth=1;g.beginPath();g.arc(cx,basToit-4,7,0,7);g.stroke();
R(cx,basToit-9,1,5,'#1b1b1b');R(cx,basToit-4,4,1,'#1b1b1b');
const n2=document.createElement('canvas');n2.width=W*D;n2.height=Ht*D;
const h2=n2.getContext('2d');h2.setTransform(D,0,0,D,0,0);
h2.fillStyle='rgba(16,20,44,.36)';h2.fillRect(x0,basToit+4,BL,murH-4);
for(let rg=rangs-1;rg>=0;rg--){const y=basToit-rg*6, ret=Math.round(rg/rangs*22), xa=x0-6+ret, l=BL+12-ret*2;
h2.fillStyle='rgba(255,214,140,'+(0.35+0.25*((rg+1)%2))+')';h2.fillRect(xa,y,l,5);}
for(let k=0;k<6;k++){const bx=x0+k*(BL/6)+4, bw=BL/6-8;h2.fillStyle='rgba(255,210,130,.75)';h2.fillRect(bx+1,basToit+20,bw-2,sol-basToit-21);}
const l=h2.createRadialGradient(cx,sol,4,cx,sol,90);l.addColorStop(0,'rgba(255,205,120,.45)');l.addColorStop(1,'rgba(255,205,120,0)');
h2.fillStyle=l;h2.fillRect(cx-90,sol-80,180,90);
return {toile:c,W,H:Ht,sol,nuit:n2};
}
function graverLeCabanon(){
const W=120,Ht=100,cx=60,sol=92;
const c=document.createElement('canvas');
/* on grave les façades plus finement : les enseignes étaient tracées
   sur une toile deux fois trop petite, puis agrandies à l'écran */
const D=Math.max(2,Math.min(3,Math.ceil(window.devicePixelRatio||2)));
c.width=W*D;c.height=Ht*D;const g=c.getContext('2d');g.setTransform(D,0,0,D,0,0);g.imageSmoothingEnabled=false;
const R=(x,y,w,h,col)=>{g.fillStyle=col;g.fillRect(x|0,y|0,Math.max(1,w|0),Math.max(1,h|0));};
const BL=74,x0=cx-BL/2-10,murH=34,basToit=sol-murH-10;
g.fillStyle='rgba(40,30,18,.25)';g.beginPath();g.ellipse(cx,sol+2,52,7,0,0,7);g.fill();
for(let rg=6;rg>=0;rg--){const y=basToit-rg*4, ret=Math.round(rg/7*10), xa=x0-6+ret, l=BL+12-ret*2;
for(let x=xa;x<xa+l;x+=5){R(x,y,5,5,((x+rg*3)>>2)%3?'#ad542c':'#c26a3a');R(x+4,y,1,5,'#6e2c16');R(x+1,y,3,1,'#d8844e');}
if(rg===6){R(xa-2,y-4,l+4,5,'#6e2c16');R(xa-2,y-4,l+4,2,'#e59a62');}}
R(x0+BL-16,basToit-40,8,12,'#d6c6a0');R(x0+BL-17,basToit-42,10,3,'#9e8a64');          /* la cheminée */
R(x0,basToit+2,BL,murH+8,'#8fb8cc');
for(let x=x0;x<x0+BL;x+=5){R(x,basToit+2,1,murH+8,'#6f98ac');}
for(let i=0;i<40;i++)R(x0+alea(i*3.1)*BL,basToit+4+alea(i*5.7)*murH,2,1,'#c9d8de');
R(x0,basToit+2,BL,2,'rgba(30,20,10,.3)');
R(x0+8,sol-30,16,30,'#2a2218');R(x0+8,sol-30,16,1,'#6f98ac');R(x0+24,sol-30,3,30,'#c0392b');
R(x0+40,basToit+12,16,12,'#2e3a44');R(x0+34,basToit+12,6,12,'#c0392b');R(x0+56,basToit+12,6,12,'#c0392b');
R(x0+40,basToit+17,16,1,'#8fb8cc');R(x0+47,basToit+12,1,12,'#8fb8cc');
R(x0+6,basToit+4,BL-12,6,'#f2efe4');
g.font='700 5px Georgia,serif';g.textAlign='center';g.fillStyle='#b5382c';g.fillText('BOUILLABAISSE',x0+BL/2,basToit+9,BL-16);
const tx=x0+BL+2;
R(tx+2,basToit+4,2,sol-basToit-4,'#6b4a2c');R(tx+30,basToit+8,2,sol-basToit-8,'#6b4a2c');
R(tx,basToit+2,34,2,'#8a6238');
for(let i=0;i<34;i++){g.fillStyle=['#4f7a36','#6a9a4a','#3f6a2c'][i%3];g.beginPath();g.ellipse(tx+2+alea(i*2.1)*32,basToit-2+alea(i*3.7)*8,4,3,0,0,7);g.fill();}
for(let i=0;i<5;i++){R(tx+6+i*6,basToit+6,2,3,'#6a3a6a');}
R(tx+6,sol-14,22,6,'#f2efe4');for(let x=tx+6;x<tx+28;x+=4)for(let y=sol-14;y<sol-8;y+=3)if(((x+y)/1|0)%2)R(x,y,2,2,'#c0392b');
R(tx+8,sol-8,2,8,'#6b4a2c');R(tx+24,sol-8,2,8,'#6b4a2c');
R(tx+2,sol-12,4,12,'#8a6238');R(tx+30,sol-12,4,12,'#8a6238');
R(tx+12,sol-17,3,3,'#f2efe4');R(tx+19,sol-17,3,3,'#e8c06a');                              /* une assiette, un verre */
R(x0-14,sol-20,12,18,'#6b4a2c');R(x0-13,sol-19,10,14,'#1f2624');
for(let k=0;k<5;k++)R(x0-12,sol-17+k*2.6,5+(k%2)*3,1,'rgba(240,240,240,.8)');
const n2=document.createElement('canvas');n2.width=W*D;n2.height=Ht*D;
const h2=n2.getContext('2d');h2.setTransform(D,0,0,D,0,0);
h2.fillStyle='rgba(16,20,44,.35)';h2.fillRect(x0,basToit+2,BL,murH+8);
h2.fillStyle='#ffd98a';h2.fillRect(x0+9,sol-29,14,29);h2.fillRect(x0+41,basToit+13,14,10);
const l=h2.createRadialGradient(tx+16,sol-20,2,tx+16,sol-20,40);l.addColorStop(0,'rgba(255,210,130,.5)');l.addColorStop(1,'rgba(255,210,130,0)');
h2.fillStyle=l;h2.fillRect(tx-24,sol-60,80,70);
for(let i=0;i<4;i++){h2.fillStyle='#fff0b0';h2.fillRect(tx+4+i*9,basToit+4,2,2);}         /* une guirlande dans la treille */
return {toile:c,W,H:Ht,sol,nuit:n2};
}
function graverLaStationVelo(){
const W=106,Ht=46,cx=45,sol=40;                    /* 8 px de marge de chaque côté : le 4e vélo n'est plus coupé */
const c=document.createElement('canvas');
/* on grave les façades plus finement : les enseignes étaient tracées
   sur une toile deux fois trop petite, puis agrandies à l'écran */
const D=Math.max(2,Math.min(3,Math.ceil(window.devicePixelRatio||2)));
c.width=W*D;c.height=Ht*D;const g=c.getContext('2d');g.setTransform(D,0,0,D,8*D,0);g.imageSmoothingEnabled=false;
const R=(x,y,w,h,col)=>{g.fillStyle=col;g.fillRect(x|0,y|0,Math.max(1,w|0),Math.max(1,h|0));};
g.fillStyle='rgba(40,30,18,.22)';g.beginPath();g.ellipse(cx,sol+1,40,4,0,0,7);g.fill();
R(8,sol-30,10,30,'#7a1f2b');R(8,sol-30,10,2,'#a8424e');R(10,sol-26,6,5,'#9fd0e8');R(10,sol-18,6,2,'#e8c06a');
R(9,sol-34,8,4,'#f2efe4');R(11,sol-33,4,2,'#7a1f2b');
R(20,sol-8,66,2,'#8f959b');
for(let k=0;k<4;k++)dessinerUnVelo(g,32+k*17,sol-1,'droite',0,k,false);
return {toile:c,W,H:Ht,sol};
}
const POISSONS_MARMITE=['sardine','bogue','girelle','rouget','mulet','saupe','seiche','maquereau','dorade','rascasse','loup','denti','murene','congre','poulpe','saintpierre','thon',
'sar','vieille','grondin','pagre','barracuda','liche','chapon','baliste','raie','coryphene'];
let RECETTE={};
function ouvrirLeCabanon(){
PANNEAU_PERSO=true;
RECETTE={};
dessinerLeCabanon();
$('enLigne').classList.add('on');
}
function dessinerLeCabanon(){
const c=$('carteL');
const tot=Object.values(RECETTE).reduce((t,n)=>t+n,0), esp=Object.values(RECETTE).filter(n=>n>0).length;
const valeur=Object.entries(RECETTE).reduce((t,[k,n])=>t+(PRIX_POISSON[k]||0)*n,0);
const coef=esp>=3?2+(esp-3)*0.25:0, prix=Math.round(valeur*coef);
const pret=tot>=4&&tot<=6&&esp>=3;
let h='<button id="fermerL" aria-label="Fermer">✕</button><div class="titL">LE CABANON · CHEZ FONFON</div>'+
'<div class="videL" style="padding:0 0 10px">« Donne-moi de 4 à 6 poissons, au moins 3 sortes : je te fais la bouillabaisse et je te l’achète. Plus c’est varié, mieux c’est payé. »</div>';
const dispo=POISSONS_MARMITE.filter(k=>(e.sac||{})[k]>0);
if(!dispo.length)h+='<div class="videL">Tu n’as pas de poisson. Va pêcher au bout des pontons !</div>';
h+=dispo.map(k=>{const n=RECETTE[k]||0, max=(e.sac||{})[k];
return '<div class="ligneJ" style="cursor:default"><span style="flex:1"><b>'+(OBJETS[k]?OBJETS[k].nom:k)+'</b><span>'+max+' dans le sac</span></span>'+
'<button class="gris" data-m="'+k+'" style="border:0;border-radius:8px;width:30px;height:30px;background:#3a4a36;color:#f2efe4;font:700 16px Georgia">−</button>'+
'<b style="min-width:22px;text-align:center">'+n+'</b>'+
'<button data-p="'+k+'" style="border:0;border-radius:8px;width:30px;height:30px;background:#e8c06a;color:#2a1d0c;font:700 16px Georgia"'+(n>=max||tot>=6?' disabled':'')+'>+</button></div>';}).join('');
h+='<div class="titL" style="margin-top:12px">DANS LA MARMITE · '+tot+' POISSON'+(tot>1?'S':'')+' · '+esp+' SORTE'+(esp>1?'S':'')+'</div>';
h+='<div class="actionsF"><button id="cuisiner"'+(pret?'':' disabled style="opacity:.45"')+'>'+(pret?'Cuisiner · '+enEuros(prix):(esp<3?'Encore '+(3-esp)+' sorte'+(3-esp>1?'s':''):'4 à 6 poissons'))+'</button></div>';
c.innerHTML=h;
$('fermerL').onclick=fermerL;
c.querySelectorAll('[data-p]').forEach(b=>b.onclick=()=>{RECETTE[b.dataset.p]=(RECETTE[b.dataset.p]||0)+1;dessinerLeCabanon();});
c.querySelectorAll('[data-m]').forEach(b=>b.onclick=()=>{RECETTE[b.dataset.m]=Math.max(0,(RECETTE[b.dataset.m]||0)-1);dessinerLeCabanon();});
if(pret)$('cuisiner').onclick=cuisinerLaBouillabaisse;
}
async function cuisinerLaBouillabaisse(){
const b=$('cuisiner');b.disabled=true;b.textContent='Ça mijote…';
const num=++numAppelSac;
const d=await appelRPC('cuisiner_bouillabaisse',{p_joueur:e.id,p_recette:RECETTE});
if(!d||d.erreur){b.textContent=!d?'Le feu s’est éteint, réessaie':d.erreur;setTimeout(dessinerLeCabanon,1600);return;}
if(d.sac){adopterSac(d,num);e.sac=d.sac;}
e.euros=d.euros;sauver();majHaut();
fermerL();
texteVolant(joueur.x,joueur.y-40,'bouillabaisse · +'+enEuros(d.gain),'#ffd76a');
jouer('vente','moment');vibrer([20,40,20]);
}
function graverPavillon(sorte){
const W=124,Ht=104,cx=62,sol=98;
const c=document.createElement('canvas');
/* on grave les façades plus finement : les enseignes étaient tracées
   sur une toile deux fois trop petite, puis agrandies à l'écran */
const D=Math.max(2,Math.min(3,Math.ceil(window.devicePixelRatio||2)));
c.width=W*D;c.height=Ht*D;const g=c.getContext('2d');g.setTransform(D,0,0,D,0,0);g.imageSmoothingEnabled=false;
const R=(x,y,w,h,col)=>{g.fillStyle=col;g.fillRect(x|0,y|0,Math.max(1,w|0),Math.max(1,h|0));};
const BL=104,x0=cx-BL/2,murH=40,basToit=sol-murH;
const poisson=sorte==='poisson';
g.fillStyle='rgba(40,30,18,.26)';g.beginPath();g.ellipse(cx+3,sol+3,BL*0.56,7,0,0,7);g.fill();
const rangs=8;
for(let rg=rangs-1;rg>=0;rg--){
const y=basToit-rg*4, ret=Math.round(rg/rangs*14), xa=x0-8+ret, l=BL+16-ret*2;
if(poisson){R(xa,y,l,5,rg%2?'#8a9aa6':'#9eb0bc');for(let x=xa;x<xa+l;x+=6)R(x,y,1,5,'#6f808c');R(xa,y,l,1,'#c4d2da');}
else{for(let x=xa;x<xa+l;x+=5){R(x,y,5,5,((x+rg*3)>>2)%3?'#ad542c':'#c26a3a');R(x+4,y,1,5,'#6e2c16');R(x+1,y,3,1,'#d8844e');}}
if(rg===rangs-1){R(xa-2,y-4,l+4,5,poisson?'#5f6f7a':'#6e2c16');R(xa-2,y-4,l+4,2,poisson?'#d6e0e6':'#e59a62');}
}
if(poisson){R(cx-1,basToit-40,2,8,'#5f6f7a');R(cx-7,basToit-43,12,4,'#c4d2da');R(cx-10,basToit-42,3,2,'#c4d2da');R(cx+3,basToit-42,1,1,'#1b1b1b');}
else{R(cx-1,basToit-42,2,10,'#3a3a36');R(cx-6,basToit-44,12,2,'#3a3a36');R(cx+4,basToit-46,3,3,'#3a3a36');}
if(poisson){
for(let y=basToit+2;y<sol-10;y+=4)for(let x=x0;x<x0+BL;x+=4)R(x,y,4,4,((x+y)/4)%2?'#2d6fb0':'#f4f0e4');
for(let x=x0;x<x0+BL;x+=6){R(x,basToit+2,6,3,'#1d4f8a');R(x+2,basToit+3,3,1,'#f4f0e4');}
R(x0,sol-10,BL,10,'#d8c8a2');R(x0,sol-10,BL,1,'#efe3c4');
}else{
R(x0,basToit+2,BL,murH-12,'#dfb672');
for(let i=0;i<180;i++)R(x0+alea(i*1.3)*BL,basToit+2+alea(i*2.7)*(murH-12),1,1,i%2?'#ebca8e':'#c9a05a');
R(x0,sol-10,BL,10,'#bba57c');R(x0,sol-10,BL,1,'#dfcca4');for(let x=x0;x<x0+BL;x+=12)R(x,sol-10,1,10,'#9e8a64');
}
R(x0,basToit+2,BL,2,'rgba(30,20,10,.3)');
const bois=poisson?{o:'#123a66',p:'#1d4f8a',c:'#2d6fb0',h:'#5a8fcf'}:{o:'#1e3a2c',p:'#2c5440',c:'#346448',h:'#4a7a5c'};
R(x0+6,basToit+6,BL-12,11,bois.o);R(x0+7,basToit+7,BL-14,9,bois.p);R(x0+7,basToit+7,BL-14,1,bois.h);
g.font='700 8px Georgia,serif';g.textAlign='center';g.fillStyle='#f0cf7d';
g.fillText(poisson?'LA POISSONNERIE':'PÊCHE & MARINE',cx,basToit+14.5,BL-20);
[x0+8,cx-14,x0+BL-36].forEach((vx,i)=>{
R(vx,basToit+20,28,sol-basToit-22,bois.o);R(vx+1,basToit+21,26,sol-basToit-24,i===1?'#2a2218':'#3a4a54');
if(i!==1){g.fillStyle='rgba(220,235,245,.2)';g.beginPath();g.moveTo(vx+3,sol-4);g.lineTo(vx+12,basToit+22);g.lineTo(vx+17,basToit+22);g.lineTo(vx+8,sol-4);g.fill();}
});
if(poisson){
[x0+9,x0+BL-35].forEach(vx=>{R(vx,sol-10,26,5,'#e8f2f6');for(let k=0;k<4;k++){R(vx+2+k*6,sol-9,5,2,['#9fb3c4','#d0553f','#a9b4ba','#7d8b96'][k]);}});
for(let r=0;r<3;r++)for(let x=x0-4;x<x0+BL+4;x+=8){R(x,basToit+18+r*3,4,3,r<2?'#2d6fb0':'#245c96');R(x+4,basToit+18+r*3,4,3,r<2?'#f4f0e4':'#dcd6c6');}
for(let x=x0-4;x<x0+BL+4;x+=8){R(x,basToit+27,4,2,'#2d6fb0');R(x+4,basToit+27,4,2,'#f4f0e4');}
R(x0+2,sol-2,BL-4,6,'#6b4a2c');R(x0+4,sol-2,BL-8,4,'#e8f2f6');
for(let i=0;i<50;i++)R(x0+4+alea(i*5.1)*(BL-8),sol-2+alea(i*3.3)*4,1,1,'#ffffff');
for(let k=0;k<12;k++){const e2=[['#9fb3c4','#c9d6e0'],['#d0553f','#e8806a'],['#a9b4ba','#e0b43a'],['#7d8b96','#4f5b64'],['#c0607a','#e08aa0']][k%5];
R(x0+6+k*8,sol-1,6,2,e2[0]);R(x0+6+k*8,sol-1,6,1,e2[1]);}
}else{
[x0+9,x0+BL-35].forEach(vx=>{
for(let k=0;k<4;k++){g.strokeStyle=['#8a6238','#e8c06a','#c0392b','#b9c1c7'][k];g.lineWidth=1;g.beginPath();g.moveTo(vx+4+k*6,sol-4);g.lineTo(vx+7+k*6,basToit+22);g.stroke();}
for(let k=0;k<3;k++){g.fillStyle='#1b1b1b';g.beginPath();g.arc(vx+6+k*7,sol-8,2.5,0,7);g.fill();R(vx+5+k*7,sol-9,2,2,'#b9c1c7');}
for(let k=0;k<5;k++)R(vx+3+k*5,basToit+25,3,2,['#e0402f','#ffd76a','#6fbf5a','#5a8fcf','#e08aa0'][k]);});
R(x0+BL-2,sol-26,4,26,'#5a3a20');R(x0+BL-4,sol-26,8,2,'#7a5230');
['#8a6238','#2d4a6a','#e8c06a','#3f8a4a'].forEach((col,k)=>{g.strokeStyle=col;g.lineWidth=1.3;g.beginPath();g.moveTo(x0+BL-1+k*1.5,sol-2);g.lineTo(x0+BL+2+k*2,sol-44);g.stroke();});
R(x0-4,basToit+2,2,14,'#2a2c2e');R(x0-10,basToit+4,8,2,'#2a2c2e');
g.strokeStyle='#b9c1c7';g.lineWidth=1.5;g.beginPath();g.moveTo(x0-8,basToit+6);g.lineTo(x0-8,basToit+14);g.arc(x0-11,basToit+14,3,0,Math.PI);g.stroke();
}
R(cx-1,basToit+21,2,sol-basToit-21,'#1b1510');R(cx+5,sol-18,2,2,'#e8c06a');
const n2=document.createElement('canvas');n2.width=W*D;n2.height=Ht*D;
const h2=n2.getContext('2d');h2.setTransform(D,0,0,D,0,0);
h2.fillStyle='rgba(16,20,44,.38)';h2.fillRect(x0,basToit+2,BL,murH-2);
h2.fillStyle='#ffd98a';[x0+9,cx-13,x0+BL-35].forEach(vx=>h2.fillRect(vx,basToit+21,26,sol-basToit-24));
const l=h2.createRadialGradient(cx,sol,4,cx,sol,70);l.addColorStop(0,'rgba(255,205,120,.5)');l.addColorStop(1,'rgba(255,205,120,0)');
h2.fillStyle=l;h2.fillRect(cx-70,sol-60,140,70);
return {toile:c,W,H:Ht,sol,nuit:n2};
}
function graverArbuste(v){
const W=40,Ht=40,cx=20,sol=36;
const c=document.createElement('canvas');
/* on grave les façades plus finement : les enseignes étaient tracées
   sur une toile deux fois trop petite, puis agrandies à l'écran */
const D=Math.max(2,Math.min(3,Math.ceil(window.devicePixelRatio||2)));
c.width=W*D;c.height=Ht*D;const g=c.getContext('2d');g.setTransform(D,0,0,D,0,0);g.imageSmoothingEnabled=false;
const R=(x,y,w,h,col)=>{g.fillStyle=col;g.fillRect(x|0,y|0,Math.max(1,w|0),Math.max(1,h|0));};
g.fillStyle='rgba(40,30,18,.25)';g.beginPath();g.ellipse(cx+1,sol+1,14,3,0,0,7);g.fill();
R(cx-12,sol-10,24,10,'#c9b68e');R(cx-12,sol-10,24,2,'#e6d8b4');R(cx-12,sol-1,24,1,'#9e8a64');
R(cx-11,sol-8,1,7,'#e6d8b4');R(cx+10,sol-8,1,7,'#a8926a');
const sorte=v%3;
const verts=sorte===2?['#6f8a6a','#8aa684','#56704f']:['#3f6b3a','#5a8a4a','#2f5530'];
const blocs=[[0,-18,11,8],[-6,-14,8,6],[6,-14,8,6],[-3,-23,7,5],[4,-22,6,5]];
blocs.forEach(([dx,dy,rx,ry],i)=>{g.fillStyle=verts[i%3];g.beginPath();g.ellipse(cx+dx,sol+dy,rx,ry,0,0,7);g.fill();});
for(let i=0;i<26;i++){const x=cx-10+alea(i*2.3+v)*20, y=sol-28+alea(i*3.1+v)*16;
if(sorte===0)R(x,y,2,2,i%3?'#e87aa0':'#f4b6c8');            /* laurier-rose */
else if(sorte===1)R(x,y,1,1,'#a8c890');                      /* pittosporum, reflets clairs */
else R(x,y,1,2,i%2?'#8a6ac0':'#a88ad8');}                    /* lavande */
return {toile:c,W,H:Ht,sol};
}
const CANNES=[{id:null,nom:'Ligne à main'},{id:'bambou',nom:'Canne en bambou',prix:1500,effet:'Le cercle 15 % plus lent.'},
{id:'fibre',nom:'Canne en fibre',prix:6000,effet:'Le cercle 25 % plus lent, « bien » plus facile.'},
{id:'carbone',nom:'Canne en carbone',prix:18000,effet:'Le cercle 35 % plus lent, « parfait » plus facile.'},
{id:'maitre',nom:'Canne de maître',prix:50000,effet:'Le cercle 45 % plus lent, « bien » très large. Espadon, poisson-lune, requin.'},
{id:'roi',nom:'Canne du Roi René',prix:150000,effet:'Le cercle 52 % plus lent, « parfait » très large. Hippocampe, calamar géant, cœlacanthe.'}];
const ACCESSOIRES=[{id:'moulinet',nom:'Moulinet',prix:4000,effet:'Une bonne touche compte double, dès la deuxième.'},
{id:'bouchon',nom:'Bouchon plombé',prix:2500,effet:'Ça mord deux fois plus vite.'},
{id:'sondeur',nom:'Sondeur',prix:9000,effet:'Annonce l’espèce avant de ferrer.'},
{id:'glaciere',nom:'Glacière',prix:14000,effet:'Le poisson arrive frais : +12 % à la criée.'}];
const APPATS=[{id:'vers',nom:'Vers de mer',prix:100,effet:'Espèces rares ×2.'},
{id:'crevettes',nom:'Crevettes',prix:150,effet:'Loup, dorade, denti et saupe ×3.'},
{id:'sardine',nom:'Sardine fraîche',prix:200,effet:'Congre et murène ×3 ; thon et légendaires ×2.'},
{id:'crabe',nom:'Crabe mou',prix:400,effet:'Le fond rocheux ×4 : mérou, chapon, rascasse. Chasse les petits.'},
{id:'calamarpetit',nom:'Petit calamar',prix:700,effet:'Les chasseurs de pleine eau ×4 : barracuda, liche, thon.'},
{id:'leurre',nom:'Leurre doré',prix:1800,effet:'Les prises rares ×2,4 — et presque plus de détritus.'},
{id:'esche',nom:'Esche vivante',prix:2600,effet:'Tout le gros ×2,2 : congre, mérou, raie, poulpe.'}];
async function chargerLEquipement(){
const d=await appelRPC('mon_equipement',{p_joueur:e.id});
if(d&&!d.erreur)EQUIP_PECHE=d;
return EQUIP_PECHE;
}
function illustrerArticle(cv,id){
const W=cv.width,H=cv.height,g=cv.getContext('2d');g.imageSmoothingEnabled=false;
const R=(x,y,w,h,col)=>{g.fillStyle=col;g.fillRect(Math.round(x),Math.round(y),Math.max(1,Math.round(w)),Math.max(1,Math.round(h)));};
const al=(n)=>{const v=Math.sin(n*12.9898)*43758.5453;return v-Math.floor(v);};
g.clearRect(0,0,W,H);
/* un fond d'établi discret, pour que l'objet se détache */
for(let y=H-9;y<H;y++)R(0,y,W,1,y<H-6?'#c9a878':'#a5764a');
for(let x=0;x<W;x+=9)R(x,H-9,1,9,'rgba(90,62,30,.22)');
g.fillStyle='rgba(60,40,18,.16)';g.beginPath();g.ellipse(W/2,H-7,W*0.34,3.4,0,0,7);g.fill();
/* ================= LA CANNE =================
   talon de liège, poignée gainée, porte-moulinet, moulinet détaillé,
   anneaux qui diminuent vers le scion, viroles et reflet. */
const canne=(corps,clair,liege,metal,virole,motif,eclat)=>{
  const x0=9,y0=H-13,x1=W-10,y1=9, L=Math.hypot(x1-x0,y1-y0);
  const px=(x1-x0)/L, py=(y1-y0)/L, nx=-py, ny=px;
  /* le talon de liège, épais */
  for(let i=0;i<L*0.2;i++){const x=x0+px*i,y=y0+py*i,e=4.6-i*0.9/L;
    for(let q=-e;q<=e;q+=1)R(x+nx*q,y+ny*q,1.2,1.2,al(i*3+q)<0.4?liege:'#dcc08c');}
  /* la gaine de la poignée */
  for(let i=L*0.2;i<L*0.27;i++){const x=x0+px*i,y=y0+py*i;
    for(let q=-4;q<=4;q+=1)R(x+nx*q,y+ny*q,1.2,1.2,'#2a2a30');}
  /* le blank : s'affine du talon au scion */
  for(let i=L*0.27;i<=L;i++){const k=i/L, x=x0+px*i, y=y0+py*i, e=3.6-k*3.0;
    for(let q=-e;q<=e;q+=1){
      const c = (q<-e*0.3)?clair:((motif&&Math.floor(i/3)%2)?clair:corps);
      R(x+nx*q,y+ny*q,1.2,1.2,c);}
    if(virole&&Math.floor(i)%26===0)for(let q=-e-0.6;q<=e+0.6;q+=1)R(x+nx*q,y+ny*q,1.4,1.4,virole);}
  /* les anneaux, de plus en plus petits */
  for(let a=0;a<5;a++){const k=0.36+a*0.145, x=x0+px*L*k, y=y0+py*L*k, r=2.6-a*0.34;
    for(let t=0;t<6.283;t+=0.5)R(x+nx*(r+1.2)+Math.cos(t)*r*0.7,y+ny*(r+1.2)+Math.sin(t)*r*0.7,1.2,1.2,metal);
    R(x+nx*0.6,y+ny*0.6,1.6,1.6,metal);}
  /* le porte-moulinet et le moulinet */
  const mx=x0+px*L*0.22+nx*5.4, my=y0+py*L*0.22+ny*5.4;
  R(mx-1.6,my-3.4,3.2,7,'#3a3f46');
  for(let t=0;t<6.283;t+=0.16)R(mx-5+Math.cos(t)*4.6,my+1+Math.sin(t)*4.6,1.8,1.8,'#7f868d');
  for(let t=0;t<6.283;t+=0.2)R(mx-5+Math.cos(t)*2.8,my+1+Math.sin(t)*2.8,1.6,1.6,'#c8ced4');
  R(mx-6,my,2.2,2.2,virole||'#e2c070');
  R(mx-9.4,my+0.6,3.4,1.4,'#8a8a92');
  /* le fil, fin, qui suit les anneaux */
  for(let i=L*0.34;i<L;i+=1.4){const x=x0+px*i,y=y0+py*i;R(x+nx*3.4,y+ny*3.4,1,1,'rgba(240,248,252,.55)');}
  if(eclat)for(let k=0;k<8;k++){const i=L*(0.3+al(k)*0.65);
    R(x0+px*i+nx*2,y0+py*i+ny*2,1.6,1.6,'rgba(255,248,210,.9)');}
};
if(id==='bambou')      canne('#b8894c','#d8ad6e','#c9a878','#9aa0a8',null,false,false);
else if(id==='fibre')  canne('#dfe4e8','#f4f7fa','#c9a878','#8fb8cc','#9fc0d0',false,false);
else if(id==='carbone')canne('#23262a','#3d4247','#1a1a1e','#e2c070','#c9a24a',true,false);
else if(id==='maitre') canne('#5a2018','#8a3626','#3a2418','#e2c070','#f0d78a',true,false);
else if(id==='roi')    canne('#c9a24a','#f6e0a8','#3a1a4a','#fff6d0','#ffffff',true,true);
/* ================= LE MOULINET ================= */
else if(id==='moulinet'){
  const cx=W/2,cy=H/2-2;
  for(let t=0;t<6.283;t+=0.08)R(cx+Math.cos(t)*17,cy+Math.sin(t)*17,2.6,2.6,'#2f343a');
  for(let t=0;t<6.283;t+=0.1)R(cx+Math.cos(t)*14,cy+Math.sin(t)*14,2.4,2.4,'#8f959b');
  for(let t=0;t<6.283;t+=0.14)R(cx+Math.cos(t)*10,cy+Math.sin(t)*10,2.2,2.2,'#d8dde2');
  for(let r=0;r<9;r+=1.6)for(let t=0;t<6.283;t+=0.3)R(cx+Math.cos(t)*r,cy+Math.sin(t)*r,1.4,1.4,'rgba(250,252,255,.5)');
  for(let t=0;t<6.283;t+=0.9)R(cx+Math.cos(t)*12,cy+Math.sin(t)*12,3,3,'#3a3f46');
  R(cx-3,cy-3,6,6,'#e2c070');R(cx-1.4,cy-1.4,3,3,'#8a6a20');
  R(cx+16,cy-2,10,3.4,'#8a8a92');R(cx+24,cy-4,4,7,'#c9a878');     /* la manivelle */
  R(cx-20,cy-6,6,12,'#3a3f46');R(cx-20,cy-6,6,3,'#5f666e');        /* le pied */
}
/* ================= LE BOUCHON ================= */
else if(id==='bouchon'){
  const cx=W/2,cy=H/2;
  for(let y=-11;y<=11;y++){const dx=Math.round(9*Math.sqrt(Math.max(0,1-(y/11)*(y/11))));
    for(let x=-dx;x<=dx;x++)R(cx+x,cy+y,1,1,y<0?(x<-dx*0.4?'#e8604a':'#c0392b'):(x<-dx*0.4?'#f6f2ea':'#e2ddd2'));}
  R(cx-1.4,cy-18,3,8,'#8a8a92');R(cx-2.4,cy-19,5,2,'#c8ced4');
  R(cx-1.4,cy+11,3,9,'#c9a878');R(cx-2.4,cy+19,5,2.4,'#8a6238');
  R(cx-5,cy-6,3,3,'rgba(255,255,255,.5)');
}
/* ================= LES APPÂTS ================= */
else if(id==='vers'){
  R(10,H-18,W-20,8,'#6a4a2a');R(10,H-18,W-20,2,'#8a6238');           /* la boîte de terre */
  for(let x=12;x<W-12;x+=3)R(x,H-16,2,5,al(x)<0.5?'#3a2a18':'#4a3524');
  for(let v=0;v<3;v++){const y0=H-22-v*7;
    for(let i=0;i<26;i++){const x=16+i+v*4, y=y0+Math.sin(i/3.2+v)*4;
      R(x,y,2.4,2.4,i%5<3?'#c0604a':'#d8806a');}}
}
else if(id==='crevettes'){
  for(let c=0;c<2;c++){const bx=14+c*26, by=H/2+c*6;
    for(let i=0;i<14;i++){const t=i/14, a=t*2.2;
      const x=bx+Math.cos(a)*11, y=by+Math.sin(a)*8;
      R(x,y,3.4-t,3.4-t,i%3?'#e8805a':'#f4a888');}
    for(let k=0;k<3;k++)R(bx+10,by-6+k*2,5,1.2,'#e8805a');
    R(bx+8,by-7,2,2,'#2a1a14');
    for(let k=0;k<4;k++)R(bx+4-k*2,by+7,1.4,3,'#f4a888');}
}
else if(id==='sardine'||id==='appatSardine'){
  for(let p2=0;p2<2;p2++){const bx=12+p2*28, by=H/2-4+p2*10, lg=26, ht=9;
    for(let i=0;i<lg;i++){const t=i/lg;
      const h=Math.round(ht/2*Math.sqrt(Math.max(0.03,1-Math.pow(t*2-0.85,2))));
      for(let q=-h;q<=h;q++)R(bx+i,by+q,1,1,q<-h*0.3?'#dfe8ee':'#8aa8c0');}
    R(bx+lg,by-4,3,8,'#8aa8c0');R(bx+lg+2,by-6,2.4,4,'#8aa8c0');R(bx+lg+2,by+2,2.4,4,'#8aa8c0');
    R(bx+3,by-1.4,2.4,2.4,'#f4f2ee');R(bx+3.6,by-0.8,1.2,1.2,'#101418');
    for(let k=0;k<5;k++)R(bx+8+k*3,by,1.4,1,'rgba(255,255,255,.35)');}
}
/* ================= LES FINITIONS ================= */
else if(['bleu','rouge','olive','dore','nacre','bois','raies','flamme','ecaille','nuit','corail','abysse','phosphore'].includes(id)){
  const T={bleu:['#1d5b9a','#4f9ad8'],rouge:['#b4302c','#e06a5a'],olive:['#5f7a3a','#90ae60'],
           dore:['#c9a24a','#f0d78a'],nacre:['#cfd8e0','#f4f8fc'],
           bois:['#6a4420','#b8884a'],raies:['#1d3a5a','#f2ece0'],flamme:['#8a2a10','#f0a030'],
           ecaille:['#1d5b4a','#6fd0a8'],nuit:['#101a3a','#3a5a9a'],corail:['#b02a4a','#f08aa0'],
           abysse:['#0a1420','#2a6a8a'],phosphore:['#1a3a1a','#8fe060']}[id];
  const cx=W/2,cy=H/2+2;
  /* le pot, avec son reflet et sa coulure */
  R(cx-11,cy-10,22,22,T[0]);R(cx-11,cy-10,22,5,T[1]);
  R(cx-8,cy-6,5,14,'rgba(255,255,255,.28)');
  R(cx-13,cy-14,26,5,'#8a8a92');R(cx-13,cy-14,26,1.6,'#c8ced4');
  R(cx-4,cy-19,8,5,'#5f666e');
  for(let i=0;i<9;i++)R(cx+10+i,cy+8+i*0.6,2.4,2.4,T[0]);    /* la coulure */
  /* le pinceau posé à côté */
  R(cx-26,cy+2,5,16,'#8a6238');R(cx-26,cy-6,5,9,'#9aa0a8');
  R(cx-26,cy-12,5,7,T[0]);
}
/* ================= CE QUI N'EST PAS ENCORE AU CATALOGUE ================= */
else if(id==='fil'){
  for(let y=0;y<20;y++)R(W/2-11,H/2-10+y,22,1,y%3?'#9fc0d0':'#dfe8ee');
  R(W/2-14,H/2-13,28,4,'#5a6a74');R(W/2-14,H/2+9,28,4,'#5a6a74');
  for(let i=0;i<10;i++)R(W/2+13+i,H/2-11+i*1.4,1.4,1.4,'rgba(240,248,252,.7)');
}
else if(id==='crabe'){
  const cx=W/2,cy=H/2+2;
  for(let y=-7;y<=7;y++){const dx=Math.round(13*Math.sqrt(Math.max(0,1-(y/7)*(y/7))));
    for(let x=-dx;x<=dx;x++)R(cx+x,cy+y,1,1,y<-2?'#e08a6a':'#c0604a');}
  for(let k=0;k<3;k++){R(cx-16-k,cy-2+k*4,6,2,'#c0604a');R(cx+10,cy-2+k*4,6,2,'#c0604a');}
  R(cx-19,cy-9,7,4,'#c0604a');R(cx-22,cy-11,5,3,'#e08a6a');
  R(cx+12,cy-9,7,4,'#c0604a');R(cx+17,cy-11,5,3,'#e08a6a');
  R(cx-5,cy-4,2.4,2.4,'#2a1a14');R(cx+2,cy-4,2.4,2.4,'#2a1a14');
}
else if(id==='calamarpetit'){
  const cx=W/2,cy=H/2-3;
  for(let y=-11;y<=5;y++){const dx=Math.round(8*Math.sqrt(Math.max(0,1-Math.pow((y+3)/9,2))));
    for(let x=-dx;x<=dx;x++)R(cx+x,cy+y,1,1,y<-6?'#f0a8a0':'#b83a3a');}
  R(cx-9,cy-13,18,4,'#d86a5a');
  for(let b=0;b<6;b++){const a2=-0.5+b*0.2;
    for(let i=0;i<12;i++)R(cx+Math.sin(a2)*i*1.2,cy+5+i*1.2+Math.sin(i*0.7+b)*1.6,2,2,i<8?'#b83a3a':'#f0a8a0');}
  R(cx-4,cy-6,2.6,2.6,'#2a1014');R(cx+2,cy-6,2.6,2.6,'#2a1014');
}
else if(id==='leurre'){
  const cx=W/2,cy=H/2;
  for(let i=0;i<24;i++){const t=i/24;
    const h=Math.round(8*Math.sqrt(Math.max(0.04,1-Math.pow(t*2-0.8,2))));
    for(let q=-h;q<=h;q++)R(cx-12+i,cy+q,1,1,q<-h*0.3?'#f6e0a8':'#c9a24a');}
  for(let k=0;k<5;k++)R(cx-8+k*4,cy-1,2,1.4,'rgba(255,255,255,.6)');
  R(cx+12,cy-5,4,10,'#c9a24a');
  R(cx-9,cy-2,2.4,2.4,'#f4f2ee');R(cx-8.6,cy-1.6,1.2,1.2,'#101418');
  for(let k=0;k<2;k++){const hx=cx+2+k*7;R(hx,cy+8,1.6,5,'#c8ced4');
    for(let a2=0;a2<3.2;a2+=0.3)R(hx-Math.sin(a2)*4,cy+13+Math.cos(a2)*4,1.6,1.6,'#c8ced4');}
  R(cx-16,cy-1,5,2,'#8a8a92');
}
else if(id==='esche'){
  R(10,H-20,W-20,12,'#3a4a52');R(10,H-20,W-20,3,'#5a6e78');      /* le seau d'eau */
  for(let x=13;x<W-13;x+=3)R(x,H-17,2,7,'#2f6a8a');
  for(let p2=0;p2<3;p2++){const bx=16+p2*22, by=H-26-p2*5;
    for(let i=0;i<14;i++){const t=i/14;
      const h=Math.round(4*Math.sqrt(Math.max(0.04,1-Math.pow(t*2-0.82,2))));
      for(let q=-h;q<=h;q++)R(bx+i,by+q,1,1,q<0?'#dfe8ee':'#8aa8c0');}
    R(bx+14,by-2,2.4,4,'#8aa8c0');R(bx+2,by-0.8,1.6,1.6,'#101418');}
  for(let k=0;k<6;k++)R(14+k*9,H-24,2,2,'rgba(210,235,245,.6)');
}
else if(id==='sondeur'){
  R(W/2-13,H/2-14,26,24,'#23262a');R(W/2-11,H/2-12,22,17,'#1d4a3a');
  for(let k=0;k<5;k++){const h=4+al(k*7)*9;R(W/2-9+k*4.4,H/2+4-h,3,h,'#8fe0a0');}
  for(let k=0;k<7;k++)R(W/2-10+k*3,H/2-10,2,1.4,'rgba(140,224,160,.4)');
  R(W/2-4,H/2+10,8,3,'#8a8a92');R(W/2-2,H/2+13,4,6,'#5f666e');
  R(W/2+9,H/2-18,3,6,'#8a8a92');                                   /* la sonde */
}
else if(id==='glaciere'){
  R(W/2-16,H/2-6,32,18,'#2f7a8a');R(W/2-16,H/2-6,32,5,'#49a0b2');
  R(W/2-18,H/2-10,36,5,'#3a8a9a');R(W/2-18,H/2-10,36,1.6,'#6fc0d0');
  R(W/2-5,H/2-15,10,5,'#8a8a92');                                  /* la poignée */
  R(W/2-12,H/2+1,10,6,'rgba(255,255,255,.35)');
  for(let k=0;k<3;k++)R(W/2+2+k*4,H/2+2,3,3,'#dff0f8');            /* la glace */
  R(W/2-16,H/2+12,32,3,'#1d5a68');
}
else if(id==='hamecon'){
  const cx=W/2,cy=H/2;
  R(cx-1.4,cy-18,3,16,'#c8ced4');R(cx-3,cy-20,6,3,'#c8ced4');
  for(let a=0;a<3.5;a+=0.12)R(cx-Math.sin(a)*11,cy+2+Math.cos(a)*11,2.6,2.6,'#c8ced4');
  R(cx-12,cy-4,3,5,'#c8ced4');
  R(cx+2,cy-14,4,4,'#e2c070');
}
else R(W/2-8,H/2-8,16,16,'#b8a888');
}
async function ouvrirLaBoutiqueDePeche(){
$('catalogue').classList.add('on');
$('catPages').innerHTML='<div class="catVide">Fanny cherche ses clés…</div>';
await chargerLEquipement();
afficherPecheMarine();
}
function fermerLeCatalogue(){$('catalogue').classList.remove('on');}
function afficherPecheMarine(mot){
/* ================= LA BOUTIQUE DU PÊCHEUR HEUREUX =================
   Onglets, parchemin, cartes à deux colonnes. Les appels serveur ne changent pas. */
const q=EQUIP_PECHE||{canne:0,appats:{},finitions:[]};
$('catArgent').textContent=enEuros(e.euros||0);
if(!window.PECHE_ONGLET)window.PECHE_ONGLET='cannes';
const sacApp=q.appats||{}, fin=q.finitions||[];
/* ce que contient chaque onglet */
const SECTIONS=[
 {id:'cannes',t:'LES CANNES',s:'Chaque canne a son caractère. À toi de trouver la tienne.',ic:'bambou',
  /* UNE CANNE ACHETÉE RESTE À SOI. 'canne' ne dit plus que celle qu'on
     tient ; 'cannes_max' dit jusqu'où l'on est monté. Les cannes déjà
     payées portent donc un bouton CHOISIR — sans quoi acheter la suivante
     effaçait la précédente, et on ne pouvait plus pêcher qu'au large.
     Si le serveur est d'une version plus ancienne et ne renvoie pas
     cannes_max, on retombe sur l'échelle d'avant. */
  l:CANNES.filter(c=>c.id).map((c,k)=>{
    const n=k+1, max=(typeof q.cannes_max==='number')?q.cannes_max:(q.canne||0);
    return {id:c.id,nom:c.nom.replace('Canne en ','').replace('Canne de ','').replace('Canne du ',''),
      prix:c.prix,d:c.effet,cval:n,choix:(n<=max&&n!==q.canne)?'c':null,
      etat: q.canne===n?'equipee' : (n<=max?'possede' : (n===max+1?'achat':'verrou'))};})},
 {id:'access',t:'LES ACCESSOIRES',s:'De petits détails qui font une grande différence.',ic:'moulinet',
  l:ACCESSOIRES.map(a=>({id:a.id,nom:a.nom,prix:a.prix,d:a.effet,
    etat:({moulinet:q.moulinet,bouchon:q.bouchon,sondeur:q.sondeur,glaciere:q.glaciere}[a.id])?'possede':'achat'}))},
 {id:'appats',t:'LES APPÂTS',s:'Choisis celui que tu accroches, rachète quand la boîte est vide.',ic:'vers',
  liste:true,
  l:APPATS.map(a=>({id:a.id,nom:a.nom,prix:a.prix,d:a.effet,
    n:sacApp[a.id]||0,choisi:q.appat===a.id}))},
 {id:'finitions',t:'LES FINITIONS',s:'Parce qu’un bon pêcheur reconnaît sa canne au premier coup d’œil.',ic:'dore',
  l:[['bleu','Bleu marine',500],['rouge','Rouge Estaque',500],['olive','Vert olive',500],
     ['bois','Bois ciré',800],['raies','Rayures de régate',1200],['flamme','Flammes',2000],
     ['dore','Vernis doré',3000],['ecaille','Écailles',4000],['nuit','Bleu de nuit',5000],
     ['nacre','Nacre',6000],['corail','Corail',7000],['abysse','Abysse',12000],
     ['phosphore','Phosphore',20000]]
    .map(([id,nom,prix])=>({id,nom,prix,d:'',
      etat:fin.includes(id)?'possede':'achat',choisi:q.finition===id,choix:'f'}))}
];
const S=SECTIONS.find(x=>x.id===window.PECHE_ONGLET)||SECTIONS[0];
/* les onglets */
const ongl='<div class="pOng">'+SECTIONS.map(x=>
  '<button class="pOngB'+(x.id===S.id?' on':'')+'" data-o="'+x.id+'">'+
  '<canvas data-img="'+x.ic+'" width="68" height="40"></canvas>'+x.t.replace('LES ','')+'</button>').join('')+'</div>';
/* les cartes */
const carte=(a)=>{
  const bouton =
    a.etat==='equipee' ? '<button class="pB eq" disabled>ÉQUIPÉE</button>' :
    a.etat==='possede' ? (a.choix
        ? '<button class="pB '+(a.choisi?'eq':'ch')+'" data-'+a.choix+'="'+(a.cval!==undefined?a.cval:a.id)+'">'+(a.choisi?'CHOISI':'CHOISIR')+'</button>'
        : '<button class="pB eq" disabled>✓ À TOI</button>') :
    a.etat==='verrou'  ? '<button class="pB off" disabled>VERROUILLÉ</button>' :
    '<button class="pB" data-a="'+a.id+'">ACHETER</button>';
  const extra = (typeof a.n==='number'&&a.n>0) ? '<span class="pQte">×'+a.n+'</span>' : '';
  return '<div class="pC'+(a.etat==='verrou'?' gris':'')+'">'+extra+
    '<canvas data-img="'+a.id+'" width="144" height="80"></canvas>'+
    '<b>'+a.nom+'</b><span class="pPx"><u></u>'+enEuros(a.prix)+'</span>'+
    (a.d?'<em>'+a.d+'</em>':'<em></em>')+bouton+'</div>';
};
/* les appâts s'affichent en lignes : on voit d'un coup la boîte et celui qui est accroché */
const ligneAppat=(a)=>{
  const vide=a.n<=0;
  return '<div class="pL'+(a.choisi?' act':'')+(vide?' vide':'')+'">'+
    '<canvas data-img="'+a.id+'" width="144" height="80"></canvas>'+
    '<div class="pLt"><b>'+a.nom+'</b>'+
      '<span class="pLs">'+(vide?'boîte vide':'il t’en reste '+a.n)+'</span>'+
      '<em>'+a.d+'</em></div>'+
    '<div class="pLb">'+
      (a.choisi?'<span class="pTag">ACCROCHÉ</span>'
              :(vide?'':'<button class="pB ch" data-m="'+a.id+'">CHOISIR</button>'))+
      '<button class="pB" data-a="'+a.id+'">'+enEuros(a.prix)+' <small>×10</small></button>'+
    '</div></div>';};
$('catPages').innerHTML = ongl +
  '<div class="pCorps"><h3 class="pT">'+S.t+'</h3><i class="pS">'+S.s+'</i>'+
  (S.liste ? '<div class="pLs2">'+S.l.map(ligneAppat).join('')+'</div>'
           : '<div class="pGr">'+S.l.map(carte).join('')+'</div>')+
  (mot?'<div class="pMot">'+mot+'</div>':'')+'</div>';
/* les dessins */
$('catPages').querySelectorAll('canvas[data-img]').forEach(cv=>illustrerArticle(cv,cv.dataset.img));
/* les gestes */
$('catPages').querySelectorAll('[data-o]').forEach(b=>b.onclick=()=>{
  window.PECHE_ONGLET=b.dataset.o;afficherPecheMarine();});
$('catPages').querySelectorAll('[data-a]').forEach(b=>b.onclick=()=>acheterALaBoutique(b.dataset.a,b));
$('catPages').querySelectorAll('[data-m]').forEach(b=>b.onclick=async()=>{
  const d=await appelRPC('choisir_peche',{p_joueur:e.id,p_appat:b.dataset.m,p_finition:null});
  if(d&&!d.erreur)EQUIP_PECHE=d;afficherPecheMarine();});
$('catPages').querySelectorAll('[data-f]').forEach(b=>b.onclick=async()=>{
  const d=await appelRPC('choisir_peche',{p_joueur:e.id,p_appat:null,p_finition:b.dataset.f});
  if(d&&!d.erreur)EQUIP_PECHE=d;afficherPecheMarine();});
/* REPRENDRE UNE CANNE DÉJÀ ACHETÉE */
$('catPages').querySelectorAll('[data-c]').forEach(b=>b.onclick=async()=>{
  b.disabled=true;b.textContent='…';
  const d=await appelRPC('choisir_peche',{p_joueur:e.id,p_appat:null,p_finition:null,p_canne:+b.dataset.c});
  if(d&&!d.erreur){EQUIP_PECHE=d;jouer('cueille');afficherPecheMarine('« Celle-là ? Bon choix. »');}
  else afficherPecheMarine((d&&d.erreur)||'La boutique n’a pas suivi : recharge la page.');});
}

async function acheterALaBoutique(id,b){
b.disabled=true;b.textContent='…';
const d=await appelRPC('acheter_peche',{p_joueur:e.id,p_article:id});
if(!d||d.erreur){
afficherPecheMarine(!d?'La caisse est bloquée, réessaie.':(d.erreur==='pas assez'?'Il te manque '+enEuros((d.prix||0)-(d.euros||0))+'.':d.erreur));return;
}
e.euros=d.euros;sauver();majHaut();
EQUIP_PECHE=d.equip;
jouer('vente','moment');vibrer([12,30,12]);
afficherPecheMarine('« Et voilà, petit ! Bonne pêche. »');
}
const FERRY={y:584,xo:228,xe:900,trajet:22,pause:4};     /* secondes */
function positionDuFerry(){
const T=Date.now()/1000, cycle=2*(FERRY.trajet+FERRY.pause), t=T%cycle;
const lisse=(k)=>k*k*(3-2*k);
if(t<FERRY.pause)return {x:FERRY.xo,sens:1,v:0};
if(t<FERRY.pause+FERRY.trajet){const k=(t-FERRY.pause)/FERRY.trajet;
return {x:FERRY.xo+(FERRY.xe-FERRY.xo)*lisse(k),sens:1,v:Math.sin(Math.PI*k)};}
if(t<2*FERRY.pause+FERRY.trajet)return {x:FERRY.xe,sens:-1,v:0};
const k=(t-2*FERRY.pause-FERRY.trajet)/FERRY.trajet;
return {x:FERRY.xe-(FERRY.xe-FERRY.xo)*lisse(k),sens:-1,v:Math.sin(Math.PI*k)};
}
const BANCS=[[360,506],[620,508],[880,506],[250,378],[760,376],[1000,378],[500,380]];
function eauVivante(g,camX,camY){
const T=Date.now()/1000;
g.save();
for(const o of DECOR){
if(o.t!=='x_voilier'&&o.t!=='x_barque'&&o.t!=='x_caboteur'&&o.t!=='x_ferry')continue;
const C=XCAL[o.t+(o.v||0)];if(!C)continue;
const sx=o.x-camX, sy=o.y-camY;
if(sx<-C.W||sx>VW+C.W||sy<-10||sy>VH+C.H)continue;
const cle=(o.flip?'r':'d');C.refl=C.refl||{};
if(!C.refl[cle]){const h=Math.ceil(C.H*0.55), c=document.createElement('canvas');c.width=C.W;c.height=h;const q=c.getContext('2d');
q.globalAlpha=o.t==='x_voilier'?0.13:0.18;q.translate(o.flip?C.W:0,0);q.scale(o.flip?-1:1,1);q.translate(C.W/2,C.sol*0.55);q.scale(1,-0.55);
q.drawImage(C.toile,-C.W/2,-C.sol,C.W,C.H);C.refl[cle]={c,oy:C.sol*0.55};}
const R2=C.refl[cle], vague=Math.round(Math.sin(T*1.8+o.x*0.07));
g.drawImage(R2.c,Math.round(sx+vague-C.W/2),Math.round(sy+2-R2.oy),C.W,R2.c.height);
}
g.restore();
BANCS.forEach(([bx,by],j)=>{
if(bx-camX<-40||bx-camX>VW+40||by-camY<-30||by-camY>VH+30)return;
for(let i=0;i<9;i++){
const a=T*(0.5+j*0.07)+i*0.7, r=6+(i%3)*3;
const x=bx+Math.cos(a)*r*1.6-camX, y=by+Math.sin(a)*r*0.7-camY;
const dir=Math.cos(a+Math.PI/2)>0?1:-1;
g.fillStyle='rgba(10,50,75,.38)';g.fillRect(Math.round(x),Math.round(y),4,1);
g.fillRect(Math.round(x)+(dir>0?-1:4),Math.round(y),1,1);
}
});
for(let i=0;i<60;i++){
const bx=XP.bassinO+10+alea(i*9.7+3)*(XP.bassinE-XP.bassinO-20);
const by=XP.quaiY+20+alea(i*5.9+1)*(MONDE_H-XP.quaiY-22);
const x=bx+Math.sin(T*.4+i)*4-camX, y=by+Math.sin(T*.9+i*1.3)*1.5-camY;
if(x<-6||y<-4||x>VW+6||y>VH+4)continue;
const k=(Math.sin(T*1.1+i*2.3)+1)/2;
g.fillStyle='rgba(200,240,250,'+(0.12+k*0.22).toFixed(3)+')';
g.fillRect(Math.round(x),Math.round(y),4+Math.round(k*3),1);
}
}
function graverCroustiPort(){
const base=graverImmeuble(7), W=base.W, H=base.H, sol=base.sol, cx=W/2, BL=138, x0=cx-BL/2, rez=40, yR=sol-rez;
const copie=(src)=>{const c=document.createElement('canvas');c.width=src.width;c.height=src.height;c.getContext('2d').drawImage(src,0,0);return c;};
const peindre=(cv,nuit)=>{const D=cv.width/W, g=cv.getContext('2d');g.setTransform(D,0,0,D,0,0);g.imageSmoothingEnabled=false;
const R=(x,y,w,h,col)=>{g.fillStyle=col;g.fillRect(Math.round(x*2)/2,Math.round(y*2)/2,Math.max(0.5,w),Math.max(0.5,h));};
for(let k=0;k<BL;k+=6)R(x0+k,yR,6,rez,(k/6)%2?'#f4efe6':'#c8281e');
R(x0,yR,BL,1,'#7a1610');R(x0,sol-1,BL,1,'#5a1008');
R(x0+10,yR+14,BL-20,rez-16,nuit?'#ffd88a':'#2e2a2a');
if(!nuit){g.fillStyle='rgba(255,255,255,.14)';g.beginPath();g.moveTo(x0+16,sol-2);g.lineTo(x0+30,yR+14);g.lineTo(x0+38,yR+14);g.lineTo(x0+24,sol-2);g.fill();}
R(x0+14,yR+26,BL-28,6,nuit?'#c8281e':'#8a1e16');R(x0+14,yR+26,BL-28,1,'#f4efe6');                               /* le comptoir */
[[0],[1],[2]].forEach(([k])=>{const mx=x0+22+k*34;R(mx,yR+16,26,8,nuit?'#1a1a1e':'#1a1a1e');R(mx+2,yR+17.5,6,5,'#e8a030');R(mx+10,yR+18,14,1,'#f4efe6');R(mx+10,yR+20,10,1,'#f4efe6');R(mx+10,yR+22,12,1,'#c8281e');});
for(let k=x0+10;k<x0+BL-10;k+=22)R(k,yR+14,1,rez-16,'#5a1008');
R(cx-9,yR+12,18,rez-12,'#5a1008');R(cx-8,yR+13,16,rez-14,nuit?'#ffe0a0':'#3a3636');R(cx-0.5,yR+13,1,rez-14,'#5a1008');R(cx-4,sol-12,2,1,'#e8c06a');R(cx+2,sol-12,2,1,'#e8c06a');
/* LE STORE jaune et rouge, remonté au-dessus de la vitrine */
for(let k=0;k<BL+8;k+=8){const c=((k/8)%2)?'#e8b030':'#c8281e';
  R(x0-4+k,yR-10,8,8,c);
  g.fillStyle=c;g.beginPath();g.arc(x0-4+k+4,yR-2,4,0,Math.PI);g.fill();}
R(x0-4,yR-12,BL+8,2,'#7a1610');
R(x0-2,yR+4,BL+4,1.5,'#7a1610');
/* L'ENSEIGNE PLEINE LARGEUR, comme les autres façades du quai */
const ey=yR-29;
R(x0-6,ey,BL+12,16,'#7a1610');R(x0-4,ey+2,BL+8,12,'#c8281e');
R(x0-4,ey+2,BL+8,1,'#e8b030');R(x0-4,ey+13,BL+8,1,'#8a1a12');
/* les ampoules du pourtour */
for(let k=0;k<Math.floor((BL+8)/9);k++){
  R(x0-4+k*9,ey,2,2,k%2?'#fff4b0':'#ffd24a');
  R(x0-4+k*9,ey+14,2,2,k%2?'#ffd24a':'#fff4b0');}
/* le cornet de frites, à gauche du nom */
R(x0+4,ey+5,7,8,'#e8b030');R(x0+4,ey+5,7,2,'#f6d070');
for(let k=0;k<4;k++)R(x0+5+k*1.6,ey+2+((k%2)?0:1),1.4,4,'#f6e0a8');
g.font='900 9.5px Georgia,serif';g.textAlign='center';g.fillStyle='#7a1610';g.fillText('CROUSTI’PORT',cx+5.6,ey+11.6,BL-30);g.fillStyle=nuit?'#fff6d0':'#ffffff';g.fillText('CROUSTI’PORT',cx+5,ey+11,BL-30);g.textAlign='left';
const lx=x0+30, ly=ey+7;g.fillStyle='#ffffff';g.beginPath();g.arc(lx,ly,8.5,0,7);g.fill();g.fillStyle='#e8b030';g.beginPath();g.arc(lx,ly,8.5,0,7);g.lineWidth=1.2;g.strokeStyle='#e8b030';g.stroke();
R(lx-4,ly-1,7,6,'#f4efe6');R(lx-4,ly-1,7,1,'#d8d0c0');R(lx+2.5,ly+1,3,1.5,'#e8a030');R(lx+2,ly+2.5,2,1.5,'#c8281e');       /* la tête, le bec, la barbe */
R(lx,ly,1,1,'#1a1a1e');R(lx-5,ly-4,8,2.5,'#1d3f8f');R(lx-3,ly-6,5,2.5,'#1d3f8f');R(lx-5,ly-2,9,1,'#1a1a1e');R(lx-2,ly-7,1.5,1.5,'#c8281e');   /* la casquette de marin, et la crête qui dépasse */
const sx=x0+BL-6, sy=yR-30;R(sx,sy+2,1.5,20,'#3a3a40');
g.fillStyle='#f4efe6';g.beginPath();g.moveTo(sx+3,sy);g.lineTo(sx+19,sy);g.lineTo(sx+17,sy+16);g.lineTo(sx+5,sy+16);g.closePath();g.fill();
for(let k=0;k<4;k++){g.fillStyle='#c8281e';g.beginPath();g.moveTo(sx+4+k*4,sy);g.lineTo(sx+6+k*4,sy);g.lineTo(sx+6+k*3.5,sy+16);g.lineTo(sx+5+k*3.5,sy+16);g.closePath();g.fill();}
[[5,-2],[9,-3],[13,-2],[16,-1]].forEach(([dx,dy])=>{g.fillStyle='#c07a30';g.beginPath();g.arc(sx+dx,sy+dy,2.6,0,7);g.fill();g.fillStyle='#e0a050';g.fillRect(sx+dx-1,sy+dy-2,1.5,1);});
if(nuit){const l=g.createRadialGradient(cx,sol,4,cx,sol,70);l.addColorStop(0,'rgba(255,190,110,.5)');l.addColorStop(1,'rgba(255,190,110,0)');g.fillStyle=l;g.fillRect(cx-70,sol-70,140,76);}
};
const toile=copie(base.toile), nuit=copie(base.nuit||base.toile);peindre(toile,false);peindre(nuit,true);
return {toile,W,H,sol,nuit};
}
function chaiseBistro(R,g,x,y,c){R(x-2.5,y-3,5,1.2,c||'#b8864a');R(x-2.5,y-8,1,5,'#4a3a2a');R(x+1.5,y-8,1,5,'#4a3a2a');R(x-2.5,y-8,5,1,'#4a3a2a');for(let k=0;k<2;k++)R(x-2+k*3,y-6,.6,3,c||'#b8864a');R(x-2.2,y-2,.8,3,'#3a3a40');R(x+1.4,y-2,.8,3,'#3a3a40');}
function tableBistro(R,x,y){R(x-4.5,y-5,9,1.5,'#e8e4dc');R(x-4.5,y-5,9,.5,'#fff');R(x-.5,y-3.5,1,4,'#3a3a40');R(x-2.5,y,5,1,'#3a3a40');}
function clientTerrasse(R,x,y,veste,dos){R(x-2,y-12,4,4,'#e0b088');R(x-2.3,y-13,4.6,2,dos?'#3a2a1c':'#6a4a2a');R(x-2.5,y-8,5,5,veste);R(x-2,y-3,1.5,3,'#2a2a30');R(x+.5,y-3,1.5,3,'#2a2a30');}
function carotteTabac(R,g,x,y,nuit){R(x-.5,y-6,1,6,'#3a3a40');g.fillStyle=nuit?'#ff5a3a':'#c8281e';g.beginPath();g.moveTo(x,y);g.lineTo(x+5,y+7);g.lineTo(x,y+14);g.lineTo(x-5,y+7);g.closePath();g.fill();
if(nuit){g.fillStyle='rgba(255,90,58,.35)';g.beginPath();g.arc(x,y+7,10,0,7);g.fill();}g.font='900 3px Arial';g.textAlign='center';g.fillStyle='#fff';g.fillText('TABAC',x,y+8);g.textAlign='left';}
function logoPMU(R,g,x,y){R(x,y,16,9,'#1f7a3a');R(x,y,16,1,'#3aa05a');g.font='900 6px Arial';g.textAlign='center';g.fillStyle='#fff';g.fillText('PMU',x+8,y+7);g.textAlign='left';}
function lueurB(g,cx,sol,nuit,c){if(!nuit)return;const l=g.createRadialGradient(cx,sol,4,cx,sol,80);l.addColorStop(0,c||'rgba(255,210,140,.5)');l.addColorStop(1,'rgba(255,210,140,0)');g.fillStyle=l;g.fillRect(cx-80,sol-80,160,86);}
function graverLeBar(){return devanture(0,(g,R,{sol,cx,BL,x0,rez,yR},nuit)=>{
/* ================= LE BAR DES DOCKS =================
   Même architecture que Le Pêcheur Heureux : corps de devanture, montants
   dorés, deux vitrines chaudes, store à festons, enseigne au-dessus. */
const T={b:'#7a1d22',bh:'#9c2b30',bs:'#4a0e12',or:'#e2c070'};
/* les pièces */
const etagere=(x,y,w,n,esp)=>{R(x,y,w,1,'#6a4a2a');
  for(let k=0;k<n;k++){const c=['#2f6a3a','#8a3a2a','#c9a24a','#2a4a6a','#6a2a4a','#4a6a2a'][k%6];
    R(x+2+k*esp,y-5,2.2,5,c);R(x+2.6+k*esp,y-7.4,1,2.6,c);R(x+2+k*esp,y-5,2.2,.8,'rgba(255,255,255,.4)');}};
const tireuses=(x,y,n)=>{for(let q=0;q<n;q++){
  R(x+q*4,y-7,2.4,7,'#b8bcc4');R(x-0.6+q*4,y-9,3.6,2,'#8a8e96');R(x+0.4+q*4,y,1.6,1.6,'#c9a24a');}};
const tabouret=(x,y)=>{R(x-3,y-6,6,1.8,'#a8322a');R(x-0.8,y-4.4,1.6,4.4,'#3a3f46');R(x-2.4,y,4.8,1,'#3a3f46');};
const ardoise=(x,y,w,h,lignes,taille)=>{R(x,y,w,h,'#2a2a2a');R(x+1,y+1,w-2,h-2,'#3a3a3a');
  g.font='700 '+(taille||2.8)+'px Arial';g.textAlign='center';g.fillStyle='#f0ece0';
  lignes.forEach((l,i)=>g.fillText(l,x+w/2,y+4.6+i*3.6));g.textAlign='left';};
const chevalet=(x,y,lignes)=>{R(x-1,y,16,18,'#5b3f21');ardoise(x,y+1,14,15,lignes,2.1);
  R(x,y+18,2,5,'#5b3f21');R(x+12,y+18,2,5,'#5b3f21');};
const jardiniere=(x,y,w)=>{R(x,y,w,6,'#9a7146');R(x,y,w,1.4,'#b8905c');
  for(let k=0;k<w;k+=3)R(x+k,y-3,2.6,4,'#3f7a3a');
  for(let k=0;k<w;k+=5)R(x+1+k,y-4,1.6,1.6,'#e8c040');};
const pmu=(x,y,w,h)=>{R(x,y,w,h,'#1a7a3a');R(x+1,y+1,w-2,h-2,'#1f8c42');
  g.font='900 '+(h*0.52)+'px Arial';g.textAlign='left';g.fillStyle='#fff';
  g.fillText('PMU',x+1.6,y+h*0.72);
  R(x+w-6,y+h*0.42,4.4,1.6,'#fff');R(x+w-3,y+h*0.3,1.6,1.8,'#fff');
  R(x+w-6,y+h*0.6,1,1.8,'#fff');R(x+w-3.4,y+h*0.6,1,1.8,'#fff');};
const carotte=(x,y)=>{R(x-0.8,y-9,1.8,6,'#3a3f46');
  for(let i=-8;i<=8;i++){const h=Math.round(5*(1-Math.abs(i)/8.5));
    for(let q=-h;q<=h;q++)R(x+q,y+i,1,1,nuit?'#ff5a3a':'#d8402a');}
  if(nuit){g.fillStyle='rgba(255,90,58,.22)';g.beginPath();g.arc(x,y,11,0,7);g.fill();}
  g.font='900 2.6px Arial';g.textAlign='center';g.fillStyle='#fff';
  g.fillText('T',x,y-3.6);g.fillText('A',x,y-0.6);g.fillText('B',x,y+2.4);g.fillText('A',x,y+5.4);g.textAlign='left';};
const fdj=(x,y,w,h)=>{R(x,y,w,h,'#1a2a5a');R(x+1,y+1,w-2,h-2,'#24357a');
  for(let r=0;r<3;r++)for(let q=0;q<3;q++)
    R(x+2+q*(w-4)/3,y+3+r*(h-5)/3,(w-6)/3,(h-7)/3,['#c8402a','#e2c070','#2f7a4a','#8a4a8a','#2a6a9a','#d8782a'][(q+r)%6]);
  R(x+1,y+1,w-2,2.4,'#f2f4f8');
  g.font='900 2px Arial';g.textAlign='center';g.fillStyle='#1a2a5a';g.fillText('FDJ',x+w/2,y+3);g.textAlign='left';};
/* LE CORPS ET LES MONTANTS */
R(x0-2,yR-4,BL+4,rez+4,T.b);R(x0-2,yR-4,BL+4,1.5,T.or);
R(x0-2,sol-6,BL+4,6,T.bs);R(x0-2,sol-6,BL+4,1,T.bh);
[x0,x0+44,x0+BL-50,x0+BL-6].forEach(x=>{
  R(x,yR,6,rez-6,T.bh);R(x+1,yR,1,rez-6,'rgba(255,255,255,.18)');R(x+5,yR,1,rez-6,T.bs);
  R(x-1,yR,8,2,T.or);R(x-1,sol-8,8,2,T.or);});
/* LES DEUX VITRINES */
[[x0+6,38],[x0+BL-44,38]].forEach(([x,w],k)=>{
  R(x,yR+2,w,rez-10,nuit?'#ffe2b0':'#e8d2a8');R(x,yR+2,w,10,nuit?'#f0c890':'#d8bc90');
  for(let q=0;q<3;q++){R(x+4+q*12,yR+4,1,6,'#6a4a2a');R(x+2+q*12,yR+10,5,2,'#fff4d0');}
  R(x,yR+12,w,1,'#b89a6a');
  if(!k){
    /* LE BAR : deux étagères, le zinc, les tireuses, les verres, deux tabourets */
    etagere(x+3,sol-30,32,7,4.2);
    etagere(x+3,sol-23,32,6,4.8);
    R(x+3,sol-16,32,2.6,'#9a6a3a');R(x+3,sol-16,32,.9,'#b8864c');
    tireuses(x+6,sol-17,3);
    for(let q=0;q<4;q++){R(x+20+q*3.4,sol-19.4,2,2.6,'rgba(240,248,252,.8)');
      R(x+20.6+q*3.4,sol-16.8,0.8,1.2,'rgba(240,248,252,.7)');}
    R(x+3,sol-13.4,32,3.4,'#3a2820');
    for(let q=0;q<2;q++){const bx=x+11+q*14;
      R(bx-2.6,sol-12,5.2,1.4,'#a8322a');R(bx-0.7,sol-10.6,1.4,3.6,'#3a3f46');R(bx-2,sol-7,4,.9,'#3a3f46');}
  }else{
    /* LES JEUX : le panneau, puis trois rangs de tickets colorés */
    R(x+3,sol-32,32,7,'#1a2a5a');R(x+4,sol-31,30,5,'#24357a');
    g.font='900 3.4px Arial';g.textAlign='center';g.fillStyle='#f2f4f8';
    g.fillText('JEUX',x+10,sol-26.8);
    g.font='700 2.1px Arial';g.fillStyle='#9fc0e8';
    g.fillText('LOTO · EUROMILLIONS · PMU',x+23,sol-26.8);g.textAlign='left';
    for(let r=0;r<3;r++)for(let q=0;q<6;q++){
      const px=x+4+q*5.2, py=sol-24+r*4.4;
      const c=['#c8402a','#e2c070','#2f7a4a','#8a4a8a','#2a6a9a','#d8782a'][(q+r*2)%6];
      R(px,py,4.4,3.6,c);R(px,py,4.4,1.1,'rgba(255,255,255,.45)');
      R(px+0.8,py+2.2,2.8,0.8,'rgba(0,0,0,.25)');}
    R(x+3,sol-11,32,2,'#9a6a3a');
    R(x+27,sol-11,7,3,'#c8ccd4');R(x+27,sol-11,7,1,'#e4e8ee');
  }
  /* la lumière du dedans : un dégradé chaud qui descend des appliques */
  {const lv=g.createLinearGradient(x,yR+2,x,sol-9);
   lv.addColorStop(0,nuit?'rgba(255,196,96,.42)':'rgba(255,214,140,.26)');
   lv.addColorStop(0.55,nuit?'rgba(255,186,90,.18)':'rgba(255,214,140,.10)');
   lv.addColorStop(1,'rgba(255,186,90,0)');
   g.fillStyle=lv;g.fillRect(x,yR+2,w,rez-11);}
  for(let q=0;q<3;q++){const ax=x+6+q*12;
    g.fillStyle=nuit?'rgba(255,220,150,.22)':'rgba(255,228,170,.14)';
    g.beginPath();g.moveTo(ax,yR+11);g.lineTo(ax-7,sol-9);g.lineTo(ax+9,sol-9);g.closePath();g.fill();}
  R(x,yR+2,w,rez-10,'rgba(255,255,255,.06)');
  g.fillStyle='rgba(255,255,255,.14)';g.beginPath();
  g.moveTo(x+4,sol-8);g.lineTo(x+14,yR+2);g.lineTo(x+19,yR+2);g.lineTo(x+9,sol-8);g.fill();
  R(x+w/2-.5,yR+2,1,rez-10,T.b);R(x,yR+2,w,1.5,T.b);R(x,sol-9,w,1.5,T.b);
  g.font='italic 700 4.6px Georgia,serif';g.textAlign='center';g.fillStyle=T.or;
  g.fillText(k?'Jeux à gratter':'Le comptoir',x+w/2,yR+17.5,w-6);g.textAlign='left';});
/* LA PORTE */
R(cx-8,yR+2,16,rez-8,T.bs);R(cx-7,yR+3,14,rez-10,nuit?'#ffe8b8':'#cfe0e4');
R(cx-.5,yR+3,1,rez-10,T.b);R(cx-7,yR+14,14,1,T.b);
R(cx+2.5,sol-18,1.4,4,T.or);R(cx-3.6,sol-18,1.4,4,T.or);
/* LE STORE, avec BAR · TABAC · PMU */
const sy=yR-11;
R(x0-5,sy,BL+10,9,T.bh);R(x0-5,sy,BL+10,1.4,T.or);
g.font='900 4.2px Arial';g.textAlign='center';g.fillStyle='#f6ece0';
g.fillText('BAR · TABAC · PMU',cx,sy+6.4,BL-20);g.textAlign='left';
for(let k=0;k<Math.floor((BL+10)/11);k++){const px=x0-5+k*11;
  for(let i=0;i<4;i++)R(px+i,sy+9,11-i*2.4,1,T.bh);}
/* L'ENSEIGNE */
const ey=sy-16;
R(x0-6,ey,BL+12,15,T.bs);R(x0-4,ey+2,BL+8,11,T.b);
R(x0-4,ey+2,BL+8,1,T.or);R(x0-4,ey+12,BL+8,1,T.or);
g.font='900 8.6px Georgia,serif';g.textAlign='center';
if(nuit){g.fillStyle='rgba(255,230,180,.22)';for(let r=4;r>0;r--)g.fillText('LE BAR DES DOCKS',cx+6,ey+10.6);}
g.fillStyle='#f8efe0';g.fillText('LE BAR DES DOCKS',cx+6,ey+10.6,BL-26);g.textAlign='left';
/* PMU, rentré dans la façade, et la carotte de tabac */
pmu(x0-4,ey+2,16,10);
carotte(x0+BL+6,ey+13);
/* DEVANT : l'ardoise murale, le tonneau, deux tabourets, une jardinière, un chevalet */
ardoise(x0+1,yR+6,11,13,['CAFÉ','BIÈRE','APÉRO']);
R(x0+18,sol-12,11,10,'#7d5934');R(x0+18,sol-12,11,1.8,'#a5764a');
R(x0+18,sol-8.6,11,1,'#4e3519');R(x0+18,sol-4.6,11,1,'#4e3519');
tabouret(x0+12,sol-2);tabouret(x0+32,sol-2);
jardiniere(x0+BL-26,sol-8,12);
chevalet(x0+BL-13,sol-23,['JEUX À','GRATTER','LOTO','EUROMILLIONS']);
/* la lumière chaude, la nuit */
{const l=g.createRadialGradient(cx,sol-14,5,cx,sol-14,nuit?80:56);
  l.addColorStop(0,nuit?'rgba(255,200,120,.52)':'rgba(255,214,150,.16)');
  l.addColorStop(1,'rgba(255,200,120,0)');
  g.fillStyle=l;g.fillRect(cx-80,sol-86,160,88);}
});}
function graverTerrasse(v){const W=160,H=60,sol=H-4,D=2,c=document.createElement('canvas');c.width=W*D;c.height=H*D;const g=c.getContext('2d');g.setTransform(D,0,0,D,0,0);g.imageSmoothingEnabled=false;
const R=(x,y,w,h,col)=>{g.fillStyle=col;g.fillRect(Math.round(x*2)/2,Math.round(y*2)/2,Math.max(.5,w),Math.max(.5,h));};
const ch=[null,'#b8864a','#c89a5a','#9a2a1e'][v];
[[22,sol-14],[64,sol-6],[108,sol-14],[146,sol-6]].forEach(([x,y],k)=>{g.fillStyle='rgba(0,0,0,.18)';g.beginPath();g.ellipse(x,y+1,9,2,0,0,7);g.fill();
chaiseBistro(R,g,x-8,y,ch);chaiseBistro(R,g,x+8,y,ch);tableBistro(R,x,y);
if(k%2===0){clientTerrasse(R,x-8,y-2,['#2d6fb0','#e8c040','#5d9a4e','#c84a2a'][k],false);R(x-1,y-8,2,3,'#f0e0a0');R(x+1.5,y-7,1.5,2,'#e8c89a');}
else{clientTerrasse(R,x+8,y-2,['#8a5ad8','#3a3a40'][k%2],true);R(x-2,y-7,1.5,2,'#c8e8f0');}});
if(v===3){R(84,4,1.5,sol-10,'#3a3a40');g.fillStyle='#c83a3a';g.beginPath();g.moveTo(58,16);g.quadraticCurveTo(85,-2,112,16);g.closePath();g.fill();for(let k=0;k<6;k++)R(60+k*9,14,4,2,k%2?'#f4ecd8':'#c83a3a');}
return {toile:c,W,H,sol,nuit:null};}
function graverGueridon(){const W=30,H=22,D=2,c=document.createElement('canvas');c.width=W*D;c.height=H*D;const g=c.getContext('2d');g.setTransform(D,0,0,D,0,0);const sol=H-3, cx=W/2;
g.fillStyle='rgba(40,30,18,.25)';g.beginPath();g.ellipse(cx,sol,13,2.5,0,0,7);g.fill();
[[-10],[8]].forEach(([k])=>{g.fillStyle='#8a6a3a';g.fillRect(cx+k,sol-9,3,1.2);g.fillRect(cx+k,sol-9,0.8,9);g.fillRect(cx+k+2.2,sol-9,0.8,9);g.fillRect(cx+k+(k<0?0:2.2),sol-15,0.8,6);});
g.fillStyle='#3a3a40';g.fillRect(cx-0.5,sol-9,1,9);g.fillRect(cx-3,sol-0.5,6,1);g.fillStyle='#e8e2d4';g.beginPath();g.ellipse(cx,sol-10,6,2,0,0,7);g.fill();
g.fillStyle='#f0d890';g.fillRect(cx-3,sol-13,1.6,3);g.fillStyle='rgba(255,255,255,.6)';g.fillRect(cx-3,sol-13,0.5,3);g.fillStyle='#ffffff';g.fillRect(cx+1,sol-12,2,1.5);g.fillStyle='#3a2616';g.fillRect(cx+1.3,sol-12,1.4,0.6);
return {toile:c,W,H,sol,nuit:null};}
function devanture(v,peindre){const base=graverImmeuble(v), W=base.W, H=base.H, sol=base.sol, cx=W/2, BL=138, x0=cx-BL/2, rez=40, yR=sol-rez;
const copie=(src)=>{const c=document.createElement('canvas');c.width=src.width;c.height=src.height;c.getContext('2d').drawImage(src,0,0);return c;};
const go=(cv,nuit)=>{const D=cv.width/W, g=cv.getContext('2d');g.setTransform(D,0,0,D,0,0);g.imageSmoothingEnabled=false;
g.textRendering='geometricPrecision';
const R=(x,y,w,h,col)=>{g.fillStyle=col;g.fillRect(Math.round(x*2)/2,Math.round(y*2)/2,Math.max(0.5,w),Math.max(0.5,h));};peindre(g,R,{W,H,sol,cx,BL,x0,rez,yR},nuit);};
const toile=copie(base.toile), nuit=copie(base.nuit||base.toile);go(toile,false);go(nuit,true);return {toile,W,H,sol,nuit};}
function graverLeFumoir(){return devanture(5,(g,R,{sol,cx,BL,x0,rez,yR},nuit)=>{
R(x0,yR,BL,rez,'#7a4a34');for(let y=yR;y<sol;y+=4)for(let x=x0+((y-yR)/4%2?4:0);x<x0+BL;x+=9)R(x,y,8,3.2,'#8a5a40');
R(x0,yR,BL,1.5,'#3a2216');R(x0,sol-4,BL,4,'#4a2c1e');
R(x0+8,yR+10,BL-16,rez-18,nuit?'#ffcf90':'#231a14');
for(let k=0;k<9;k++){const x=x0+16+k*13;R(x,yR+12,0.8,6,'#c8a868');g.fillStyle=k%2?'#c8813a':'#b06a2a';g.beginPath();g.ellipse(x+0.4,yR+22,3,6,0,0,7);g.fill();g.fillStyle='#8a4a1a';g.fillRect(x-2,yR+26,5,1);}   /* les poissons pendus */
R(cx-10,yR+6,20,rez-6,'#3a2216');R(cx-9,yR+7,18,rez-7,nuit?'#ffe0a0':'#4a3226');R(cx-0.5,yR+7,1,rez-7,'#3a2216');
const ey=yR-15;R(x0+16,ey,BL-32,12,'#3a2216');R(x0+17,ey+1,BL-34,10,'#5a3a26');
g.font='700 7.6px Georgia';g.textAlign='center';g.fillStyle='#f0d890';g.fillText('LE FUMOIR DU QUAI',cx,ey+8.4,BL-40);g.textAlign='left';
const chx=x0+BL-16;R(chx,yR-46,10,32,'#6a3f2a');R(chx,yR-46,10,2,'#8a5a40');
g.fillStyle=nuit?'rgba(220,220,230,.22)':'rgba(240,240,245,.35)';
for(let k=0;k<7;k++){const t=k/7;g.beginPath();g.arc(chx+5+Math.sin(k*1.7)*5,yR-50-k*9,4+k*1.8,0,7);g.fill();}
if(nuit){const l=g.createRadialGradient(cx,sol,4,cx,sol,70);l.addColorStop(0,'rgba(255,190,110,.42)');l.addColorStop(1,'rgba(255,190,110,0)');g.fillStyle=l;g.fillRect(cx-70,sol-70,140,76);}});}
function graverLaPoste(){return devanture(4,(g,R,{sol,cx,BL,x0,rez,yR},nuit)=>{
R(x0,yR-10,BL,rez+10,'#eee6d4');for(let y=yR-10;y<sol;y+=6)R(x0,y,BL,0.5,'#d8cdb8');
R(x0,sol-5,BL,5,'#1d4f8a');
[[-46],[22]].forEach(([k])=>{R(cx+k,yR+8,24,rez-12,nuit?'#ffe8b0':'#3a4450');for(let q=0;q<3;q++)R(cx+k+q*8,yR+8,0.8,rez-12,'#8a8f96');R(cx+k,yR+18,24,0.8,'#8a8f96');});
R(cx-12,yR+4,24,rez-4,'#1d4f8a');R(cx-11,yR+5,22,rez-5,nuit?'#ffe8b8':'#3a4a58');R(cx-0.5,yR+5,1,rez-5,'#1d4f8a');R(cx+4,sol-14,1.5,3,'#f0c040');
const ey=yR-22;R(x0+12,ey,BL-24,12,'#1d4f8a');g.font='700 7.6px Georgia';g.textAlign='center';g.fillStyle='#ffffff';g.fillText('LA POSTE DU VIEUX-PORT',cx,ey+8.6,BL-30);g.textAlign='left';
const bx=x0+BL-18;R(bx,sol-26,14,20,'#f0c040');R(bx,sol-26,14,2,'#ffe070');R(bx+2,sol-22,10,2,'#5a4a10');R(bx+5,sol-6,4,6,'#8a8f96');
g.fillStyle='#1d4f8a';g.font='700 3px Georgia';g.fillText('LETTRES',bx+1,sol-14);
g.strokeStyle='#1d4f8a';g.lineWidth=1.4;g.beginPath();g.arc(cx,yR-3,4.5,0.4,Math.PI*1.6);g.stroke();g.beginPath();g.moveTo(cx+3.5,yR-6);g.lineTo(cx+8,yR-8);g.stroke();
if(nuit){const l=g.createRadialGradient(cx,sol,4,cx,sol,70);l.addColorStop(0,'rgba(255,215,150,.42)');l.addColorStop(1,'rgba(255,215,150,0)');g.fillStyle=l;g.fillRect(cx-70,sol-70,140,76);}});}
function poissonPx(g,x,y,c1,c2,sens){sens=sens||1;g.fillStyle=c1;g.beginPath();g.ellipse(x,y,4.4,1.7,0,0,7);g.fill();g.fillStyle=c2;g.fillRect(x-3,y-1.2,6,0.8);
g.fillStyle=c1;g.beginPath();g.moveTo(x-4*sens,y);g.lineTo(x-6.5*sens,y-2.2);g.lineTo(x-6.5*sens,y+2.2);g.fill();g.fillStyle='#1a1a1a';g.fillRect(x+2.6*sens-0.4,y-0.6,0.8,0.8);}
const PX_P=[['#8aa0b0','#c8d4dc'],['#c86a4a','#e89a7a'],['#6a8aa0','#a8c0d0'],['#d8b060','#f0d890'],['#b04a3a','#e07a5a']];
function graverLaPoissonnerie(){return devanture(1,(g,R,{sol,cx,BL,x0,rez,yR},nuit)=>{
/* ================= LA CRIÉE =================
   L'architecture validée, en vert bouteille : deux étals de glace garnis,
   la balance, les cageots et l'ardoise des cours. */
const T={b:'#1f4a32',bh:'#2d6a47',bs:'#102a1c',store:['#27593b','#e8e0cc'],or:'#e2c070'};
const glace=(x,y,w)=>{for(let i=0;i<7;i++)R(x,y+i,w-i*0.6,1,i<2?'#f0f8fc':'#cfe6f0');};
const poisson=(x,y,lg,c1,c2)=>{
  for(let i=0;i<lg;i++){const t=i/lg,h=Math.round(lg*0.17*Math.sqrt(Math.max(.04,1-Math.pow(t*2-.82,2))));
    for(let q=-h;q<=h;q++)R(x+i,y+q,1,1,q<0?c2:c1);}
  R(x+lg,y-lg*0.14,lg*0.12,lg*0.28,c1);R(x+lg*0.18,y-1,1.4,1.4,'#101418');};
const cageot=(x,y,w,h,cs)=>{R(x,y,w,h,'#9a7146');R(x,y,w,2,'#b8905c');
  for(let i=0;i<w;i+=5)R(x+i,y+2,1.2,h-4,'#7d5934');
  cs.forEach((c,q)=>R(x+2+q*5,y-3,4,4,c));};
const ardoise=(x,y,w,h,l)=>{R(x,y,w,h,'#2a2a2a');R(x+1,y+1,w-2,h-2,'#3a3a3a');
  g.font='700 3px Arial,sans-serif';g.textAlign='center';g.fillStyle='#f0ece0';
  l.forEach((t,i)=>g.fillText(t,x+w/2,y+4.6+i*3.6));g.textAlign='left';};
const balance=(x,y)=>{R(x-1,y-10,2,10,'#8a8a92');R(x-6,y-11,12,2,'#b4bcc4');
  R(x-7,y-9,5,3,'#c8ced4');R(x+2,y-9,5,3,'#c8ced4');R(x-4,y,8,3,'#5a6a74');};
/* le corps et les montants */
R(x0-2,yR-4,BL+4,rez+4,T.b);R(x0-2,yR-4,BL+4,1.5,T.or);
R(x0-2,sol-6,BL+4,6,T.bs);R(x0-2,sol-6,BL+4,1,T.bh);
[x0,x0+44,x0+BL-50,x0+BL-6].forEach(x=>{
  R(x,yR,6,rez-6,T.bh);R(x+1,yR,1,rez-6,'rgba(255,255,255,.18)');R(x+5,yR,1,rez-6,T.bs);
  R(x-1,yR,8,2,T.or);R(x-1,sol-8,8,2,T.or);});
/* les deux étals */
[[x0+6,38],[x0+BL-44,38]].forEach(([x,w],k)=>{
  R(x,yR+2,w,rez-10,nuit?'#ffe2b0':'#e8d2a8');R(x,yR+2,w,10,nuit?'#f0c890':'#d8bc90');
  for(let q=0;q<3;q++){R(x+4+q*12,yR+4,1,6,'#6a4a2a');R(x+2+q*12,yR+10,5,2,'#fff4d0');}
  R(x,yR+12,w,1,'#b89a6a');
  glace(x+3,sol-20,32);
  const C=[['#5f92bc','#a8cde4'],['#b4553a','#e09070'],['#8a93a8','#c8d6e4'],['#7e8f7a','#bccdb8']];
  for(let q=0;q<3;q++){const c=C[(q+k*2)%4];poisson(x+5+q*10,sol-24,9,c[0],c[1]);}
  for(let q=0;q<3;q++){const c=C[(q+k+1)%4];poisson(x+6+q*10,sol-30,8,c[0],c[1]);}
  R(x+3,sol-13,32,2,'#8a6238');
  if(k)balance(x+30,sol-13);
  {const lv=g.createLinearGradient(x,yR+2,x,sol-9);
   lv.addColorStop(0,nuit?'rgba(255,196,96,.42)':'rgba(255,214,140,.26)');
   lv.addColorStop(1,'rgba(255,186,90,0)');g.fillStyle=lv;g.fillRect(x,yR+2,w,rez-11);}
  R(x,yR+2,w,rez-10,'rgba(255,255,255,.06)');
  g.fillStyle='rgba(255,255,255,.14)';g.beginPath();
  g.moveTo(x+4,sol-8);g.lineTo(x+14,yR+2);g.lineTo(x+19,yR+2);g.lineTo(x+9,sol-8);g.fill();
  R(x+w/2-.5,yR+2,1,rez-10,T.b);R(x,yR+2,w,1.5,T.b);R(x,sol-9,w,1.5,T.b);
  g.font='italic 700 4.4px Georgia,serif';g.textAlign='center';g.fillStyle=T.or;
  g.fillText(k?'Pêche du jour':'Arrivage',x+w/2,yR+17.5,w-8);g.textAlign='left';});
/* la porte */
R(cx-8,yR+2,16,rez-8,T.bs);R(cx-7,yR+3,14,rez-10,nuit?'#ffe8b8':'#cfe0e4');
R(cx-.5,yR+3,1,rez-10,T.b);R(cx-7,yR+14,14,1,T.b);
R(cx+2.5,sol-18,1.4,4,T.or);R(cx-3.6,sol-18,1.4,4,T.or);
/* le store */
const sy=yR-10;
for(let k=0;k<BL+8;k++){const c=(k%12<6)?T.store[0]:T.store[1];
  R(x0-4+k,sy,1,8,c);R(x0-4+k,sy+8,1,2,(k%12<6)?T.bs:'#c8c0ac');}
for(let k=0;k<Math.floor((BL+8)/12);k++){const c=(k%2)?T.store[0]:T.store[1];
  for(let i=0;i<5;i++)R(x0-4+k*12+i,sy+10,12-i*2.4,1,c);}
R(x0-4,sy-2,BL+8,2,T.bs);
/* l'enseigne, avec son poisson doré */
const ey=sy-15;
R(x0-6,ey,BL+12,14,T.bs);R(x0-4,ey+2,BL+8,10,T.b);R(x0-4,ey+2,BL+8,1,T.or);
poisson(x0+3,ey+7,10,T.or,'#f6e0a8');
g.font='italic 900 9.5px Georgia,serif';g.textAlign='center';
g.fillStyle='rgba(0,0,0,.4)';g.fillText('La Criée',cx+5.6,ey+10.6,BL-28);
g.fillStyle=T.or;g.fillText('La Criée',cx+5,ey+10,BL-28);g.textAlign='left';
/* devant : les cageots et l'ardoise des cours */
cageot(x0+2,sol-13,24,11,['#9fc0d0','#c0604a','#8aa8c0','#b8ccd8']);
cageot(x0+BL-28,sol-12,24,10,['#8aa8c0','#9fc0d0','#c0604a']);
ardoise(x0+30,sol-22,22,20,['LOUP 38','DORADE 17','SAR 19','ROUGET 9']);
/* la lumière du dedans */
{const l=g.createRadialGradient(cx,sol-14,5,cx,sol-14,nuit?80:56);
 l.addColorStop(0,nuit?'rgba(255,200,120,.5)':'rgba(255,214,150,.16)');
 l.addColorStop(1,'rgba(255,200,120,0)');g.fillStyle=l;g.fillRect(cx-80,sol-86,160,88);}
});}
function graverLaPresse(){return devanture(9,(g,R,{sol,cx,BL,x0,rez,yR},nuit)=>{
/* ================= LA CAPITAINERIE =================
   Bleu marine et laiton : le registre et la lampe à gauche,
   le tableau des avis aux marins à droite, la barre à roue dans l'enseigne. */
const T={b:'#17365a',bh:'#23507e',bs:'#0b1f3a',store:['#1d4a72','#f2ece0'],or:'#e2c070'};
const pavillon=(x,y,c1,c2)=>{R(x,y-14,1.6,18,'#8a8a92');
  for(let i=0;i<10;i++)R(x+2+i,y-13+Math.sin(i*0.5)*1.2,1,7,i<5?c1:c2);};
const hublot=(x,y,r)=>{
  for(let a=0;a<6.283;a+=0.12)R(x+Math.cos(a)*r,y+Math.sin(a)*r,2,2,'#c9a24a');
  for(let a=0;a<6.283;a+=0.14)R(x+Math.cos(a)*(r-2),y+Math.sin(a)*(r-2),2,2,nuit?'#ffe2a8':'#bcd4e0');};
const barre=(x,y,r,c)=>{
  for(let a=0;a<6.283;a+=0.1)R(x+Math.cos(a)*r,y+Math.sin(a)*r,2,2,c);
  for(let k=0;k<8;k++){const a=k*0.785;
    R(x+Math.cos(a)*(r+2.6),y+Math.sin(a)*(r+2.6),2.4,2.4,c);
    for(let t=0;t<r;t+=1.2)R(x+Math.cos(a)*t,y+Math.sin(a)*t,1.4,1.4,c);}};
const tableau=(x,y,w,h,titre,lignes)=>{
  R(x,y,w,h,'#5a3f22');R(x+1.5,y+1.5,w-3,h-3,'#2a2a2a');
  g.font='700 3.2px Arial,sans-serif';g.textAlign='center';g.fillStyle='#f0cf7d';
  g.fillText(titre,x+w/2,y+5.4);
  g.fillStyle='#e0dcd0';g.font='3px Arial,sans-serif';
  lignes.forEach((t,i)=>g.fillText(t,x+w/2,y+9.6+i*3.4));g.textAlign='left';};
const caisse=(x,y,w,h,c)=>{R(x,y,w,h,'#9a7146');R(x,y,w,2,'#b8905c');
  for(let i=0;i<w;i+=5)R(x+i,y+2,1.2,h-4,'#7d5934');
  if(c)R(x+2,y-3,w-4,3,c);};
/* le corps et les montants */
R(x0-2,yR-4,BL+4,rez+4,T.b);R(x0-2,yR-4,BL+4,1.5,T.or);
R(x0-2,sol-6,BL+4,6,T.bs);R(x0-2,sol-6,BL+4,1,T.bh);
[x0,x0+44,x0+BL-50,x0+BL-6].forEach(x=>{
  R(x,yR,6,rez-6,T.bh);R(x+1,yR,1,rez-6,'rgba(255,255,255,.18)');R(x+5,yR,1,rez-6,T.bs);
  R(x-1,yR,8,2,T.or);R(x-1,sol-8,8,2,T.or);});
/* les deux vitrines */
[[x0+6,38],[x0+BL-44,38]].forEach(([x,w],k)=>{
  R(x,yR+2,w,rez-10,nuit?'#ffe2b0':'#e8d2a8');R(x,yR+2,w,10,nuit?'#f0c890':'#d8bc90');
  for(let q=0;q<3;q++){R(x+4+q*12,yR+4,1,6,'#6a4a2a');R(x+2+q*12,yR+10,5,2,'#fff4d0');}
  R(x,yR+12,w,1,'#b89a6a');
  if(!k){                                   /* le bureau : le registre et la lampe */
    R(x+4,sol-16,30,4,'#6a4a2a');R(x+4,sol-17,30,1.4,'#8a6238');
    R(x+8,sol-20,10,4,'#f2ece0');R(x+19,sol-20,10,4,'#e8e2d2');R(x+18,sol-21,2,5,'#c9bda2');
    for(let q=0;q<3;q++){R(x+9,sol-19.4+q*1.2,8,0.8,'#9aa0a8');R(x+20,sol-19.4+q*1.2,8,0.8,'#9aa0a8');}
    R(x+30,sol-26,2,8,'#5a6a74');R(x+27,sol-29,8,3,'#2a3a4a');
    R(x+28,sol-26,6,1.4,nuit?'#ffe2a8':'#d8c890');
    hublot(x+12,sol-30,5);}
  else{                                     /* le tableau des avis */
    tableau(x+3,sol-31,32,22,'AVIS AUX MARINS',['Marée haute 7h12','Vent d’est 15 nd']);
    caisse(x+6,sol-9,12,7,'#c9a24a');
    R(x+21,sol-12,10,10,'#2f6a8a');R(x+21,sol-12,10,2,'#4f9ad8');}
  {const lv=g.createLinearGradient(x,yR+2,x,sol-9);
   lv.addColorStop(0,nuit?'rgba(255,196,96,.42)':'rgba(255,214,140,.26)');
   lv.addColorStop(1,'rgba(255,186,90,0)');g.fillStyle=lv;g.fillRect(x,yR+2,w,rez-11);}
  R(x,yR+2,w,rez-10,'rgba(255,255,255,.06)');
  g.fillStyle='rgba(255,255,255,.14)';g.beginPath();
  g.moveTo(x+4,sol-8);g.lineTo(x+14,yR+2);g.lineTo(x+19,yR+2);g.lineTo(x+9,sol-8);g.fill();
  R(x+w/2-.5,yR+2,1,rez-10,T.b);R(x,yR+2,w,1.5,T.b);R(x,sol-9,w,1.5,T.b);
  g.font='italic 700 4.4px Georgia,serif';g.textAlign='center';g.fillStyle=T.or;
  g.fillText(k?'Avis aux marins':'Registre',x+w/2,yR+17.5,w-8);g.textAlign='left';});
/* la porte */
R(cx-8,yR+2,16,rez-8,T.bs);R(cx-7,yR+3,14,rez-10,nuit?'#ffe8b8':'#cfe0e4');
R(cx-.5,yR+3,1,rez-10,T.b);R(cx-7,yR+14,14,1,T.b);
R(cx+2.5,sol-18,1.4,4,T.or);R(cx-3.6,sol-18,1.4,4,T.or);
/* le store */
const sy=yR-10;
for(let k=0;k<BL+8;k++){const c=(k%12<6)?T.store[0]:T.store[1];
  R(x0-4+k,sy,1,8,c);R(x0-4+k,sy+8,1,2,(k%12<6)?T.bs:'#c8c0ac');}
for(let k=0;k<Math.floor((BL+8)/12);k++){const c=(k%2)?T.store[0]:T.store[1];
  for(let i=0;i<5;i++)R(x0-4+k*12+i,sy+10,12-i*2.4,1,c);}
R(x0-4,sy-2,BL+8,2,T.bs);
/* l'enseigne, avec la barre à roue */
const ey=sy-15;
R(x0-6,ey,BL+12,14,T.bs);R(x0-4,ey+2,BL+8,10,T.b);R(x0-4,ey+2,BL+8,1,T.or);
barre(x0+8,ey+7,5.4,T.or);
g.font='italic 900 8.5px Georgia,serif';g.textAlign='center';
g.fillStyle='rgba(0,0,0,.4)';g.fillText('La Capitainerie',cx+7.6,ey+10.6,BL-34);
g.fillStyle=T.or;g.fillText('La Capitainerie',cx+7,ey+10,BL-34);g.textAlign='left';
/* devant : les pavillons, la bitte et les caisses */
pavillon(x0+3,sol-26,'#c0392b','#f2ece0');
pavillon(x0+BL-6,sol-26,'#2f7a4a','#f2ece0');
R(x0+BL-26,sol-9,8,8,'#3a3f46');R(x0+BL-27,sol-11,10,3,'#5a6a74');
caisse(x0+16,sol-10,14,8,null);
/* la lumière du dedans */
{const l=g.createRadialGradient(cx,sol-14,5,cx,sol-14,nuit?80:56);
 l.addColorStop(0,nuit?'rgba(255,200,120,.5)':'rgba(255,214,150,.16)');
 l.addColorStop(1,'rgba(255,200,120,0)');g.fillStyle=l;g.fillRect(cx-80,sol-86,160,88);}
});}
function restoFonfon(teinte){const T=teinte==='marine'?{b:'#1f3452',bh:'#2c4a72',bs:'#122238',store:['#1f3a6a','#2a4a80'],or:'#e2c070'}:{b:'#5a1a1e',bh:'#7a2a2e',bs:'#3a0c10',store:['#8a1a22','#a8262e'],or:'#e8c46a'};
return devanture(1,(g,R,{sol,cx,BL,x0,rez,yR},nuit)=>{
R(x0-2,yR-4,BL+4,rez+4,T.b);R(x0-2,yR-4,BL+4,1.5,T.or);R(x0-2,sol-6,BL+4,6,T.bs);R(x0-2,sol-6,BL+4,1,T.bh);
[x0,x0+44,x0+BL-50,x0+BL-6].forEach(x=>{R(x,yR,6,rez-6,T.bh);R(x+1,yR,1,rez-6,'rgba(255,255,255,.18)');R(x+5,yR,1,rez-6,T.bs);R(x-1,yR,8,2,T.or);R(x-1,sol-8,8,2,T.or);});
[[x0+6,38],[x0+BL-44,38]].forEach(([x,w],k)=>{const fond=nuit?'#ffe2b0':'#e8d2a8';R(x,yR+2,w,rez-10,fond);
R(x,yR+2,w,10,nuit?'#f0c890':'#d8bc90');for(let q=0;q<3;q++){R(x+4+q*12,yR+4,1,6,'#6a4a2a');R(x+2+q*12,yR+10,5,2,'#fff4d0');}   /* les appliques */
R(x,yR+12,w,1,'#b89a6a');
for(let q=0;q<2;q++){const tx=x+9+q*20,ty=sol-16;R(tx-7,ty,14,4,'#fbfaf6');R(tx-7,ty+4,14,5,'#eeeae2');R(tx-1,ty+9,2,3,'#6a4a2a');
R(tx-4,ty-2,3,2,'#e8703a');R(tx+2,ty-2,3,2,'#e8703a');R(tx-5.5,ty-1,1,1,'#fff');R(tx+.5,ty-5,1,4,'#d8e8f0');R(tx,ty-6,2,1.5,nuit?'#ffd060':'#e8c46a');   /* bouillabaisse, verre, bougie */
}
                    /* le serveur et son plateau */
R(x,yR+2,w,rez-10,'rgba(255,255,255,.06)');g.fillStyle='rgba(255,255,255,.14)';g.beginPath();g.moveTo(x+4,sol-8);g.lineTo(x+14,yR+2);g.lineTo(x+19,yR+2);g.lineTo(x+9,sol-8);g.fill();
R(x+w/2-.5,yR+2,1,rez-10,T.b);R(x,yR+2,w,1.5,T.b);R(x,sol-9,w,1.5,T.b);
g.font='italic 700 4.6px Georgia,serif';g.textAlign='center';g.fillStyle=T.or;g.fillText(k?'Poissons du jour':'Bouillabaisse',x+w/2,yR+17.5,w-6);g.textAlign='left';});
R(cx-10,yR+2,20,rez-8,T.bs);R(cx-9,yR+3,18,rez-10,nuit?'#ffe8b8':'#d8c4a0');R(cx-.5,yR+3,1,rez-10,T.b);R(cx-9,yR+14,18,1,T.b);R(cx+3,sol-18,1.5,4,'#e8c46a');R(cx-4.5,sol-18,1.5,4,'#e8c46a');
R(x0+BL/2-24,yR+8,10,13,T.or);R(x0+BL/2-23,yR+9,8,11,'#f8f2e2');for(let q=0;q<4;q++)R(x0+BL/2-22,yR+11+q*2.4,6,.6,'#6a4a2a');
const sy=yR-10;for(let k=0;k<BL+8;k+=1){const c=k%12<6?T.store[0]:T.store[1];R(x0-4+k,sy,1,9,c);}R(x0-4,sy,BL+8,1.5,'rgba(255,255,255,.2)');
for(let k=0;k<BL+8;k+=12){g.fillStyle=T.store[0];g.beginPath();g.arc(x0-4+k+6,sy+9,6,0,Math.PI);g.fill();}R(x0-4,sy+8.5,BL+8,1,'rgba(0,0,0,.2)');
g.font='700 5px Arial,sans-serif';g.textAlign='center';g.fillStyle='#fff6e0';g.fillText('R E S T A U R A N T   ·   B O U I L L A B A I S S E',cx,sy+6,BL-10);g.textAlign='left';
const ey=yR-26;R(x0+14,ey,BL-28,14,T.b);R(x0+14,ey,BL-28,1.2,T.or);R(x0+14,ey+12.8,BL-28,1.2,T.or);
g.font='italic 900 10.5px Georgia,serif';g.textAlign='center';g.fillStyle='rgba(0,0,0,.4)';g.fillText('Chez Fonfon',cx+.6,ey+10.6,BL-40);g.fillStyle=nuit?'#fff0c0':T.or;g.fillText('Chez Fonfon',cx,ey+10,BL-40);g.textAlign='left';
[[x0+8],[x0+BL-10]].forEach(([x])=>{R(x,ey-2,2,6,'#3a3a40');R(x-2,ey+4,6,8,'#2a2a30');R(x-1,ey+5,4,6,nuit?'#ffe080':'#d8c890');if(nuit){g.fillStyle='rgba(255,220,130,.3)';g.beginPath();g.arc(x+1,ey+8,9,0,7);g.fill();}});
if(nuit){const l=g.createRadialGradient(cx,sol,4,cx,sol,85);l.addColorStop(0,'rgba(255,215,150,.55)');l.addColorStop(1,'rgba(255,215,150,0)');g.fillStyle=l;g.fillRect(cx-85,sol-85,170,92);}});}
const LUP=(g,cx,sol,nuit,c)=>{if(!nuit)return;const l=g.createRadialGradient(cx,sol,4,cx,sol,75);l.addColorStop(0,c||'rgba(255,215,150,.5)');l.addColorStop(1,'rgba(255,215,150,0)');g.fillStyle=l;g.fillRect(cx-75,sol-75,150,80);};
const bouee=(g,x,y,r,c1,c2)=>{g.strokeStyle=c1;g.lineWidth=r*.55;g.beginPath();g.arc(x,y,r,0,7);g.stroke();g.strokeStyle=c2;for(let q=0;q<4;q++){g.beginPath();g.arc(x,y,r,q*Math.PI/2+.2,q*Math.PI/2+.62);g.stroke();}};
const canne=(R,g,x,y,h,c,lance)=>{R(x,y,1,h,'#c8b890');R(x-.4,y+h-6,1.8,6,'#3a3a40');R(x-.6,y+h-9,2.2,2,'#8a8a90');if(lance){g.strokeStyle='rgba(230,230,230,.7)';g.lineWidth=.4;g.beginPath();g.moveTo(x+.5,y);g.quadraticCurveTo(x+6,y+10,x+4,y+h*.6);g.stroke();}R(x-.5,y+h*.35,2,1.2,c);};
const LU=(g,cx,sol,nuit,c)=>{if(!nuit)return;const l=g.createRadialGradient(cx,sol,4,cx,sol,75);l.addColorStop(0,c||'rgba(255,215,150,.5)');l.addColorStop(1,'rgba(255,215,150,0)');g.fillStyle=l;g.fillRect(cx-75,sol-75,150,80);};
function graverLaBoutiquePeche(){return devanture(1,(g,R,{sol,cx,BL,x0,rez,yR},nuit)=>{
/* ================= LE PÊCHEUR HEUREUX =================
   Bâtie comme Chez Fonfon : un corps de devanture, des montants, deux
   vitrines chaudes, un store rayé, une enseigne, puis les objets devant. */
const T={b:'#1b3f52',bh:'#28586f',bs:'#0e2634',store:['#1d5a78','#e8e0cc'],or:'#e2c070'};
const A=(n)=>{const v=Math.sin(n*12.9898)*43758.5453;return v-Math.floor(v);};
/* LE CORPS ET LES MONTANTS, aux mesures de Fonfon */
R(x0-2,yR-4,BL+4,rez+4,T.b);R(x0-2,yR-4,BL+4,1.5,T.or);
R(x0-2,sol-6,BL+4,6,T.bs);R(x0-2,sol-6,BL+4,1,T.bh);
[x0,x0+44,x0+BL-50,x0+BL-6].forEach(x=>{
  R(x,yR,6,rez-6,T.bh);R(x+1,yR,1,rez-6,'rgba(255,255,255,.18)');R(x+5,yR,1,rez-6,T.bs);
  R(x-1,yR,8,2,T.or);R(x-1,sol-8,8,2,T.or);});
/* LES DEUX VITRINES, chaudes comme chez Fonfon */
[[x0+6,38],[x0+BL-44,38]].forEach(([x,w],k)=>{
  const fond=nuit?'#ffe2b0':'#e8d2a8';
  R(x,yR+2,w,rez-10,fond);
  R(x,yR+2,w,10,nuit?'#f0c890':'#d8bc90');
  for(let q=0;q<3;q++){R(x+4+q*12,yR+4,1,6,'#6a4a2a');R(x+2+q*12,yR+10,5,2,'#fff4d0');}
  R(x,yR+12,w,1,'#b89a6a');
  if(!k){
    /* à gauche : les leurres sur deux planches, et un moulinet */
    for(let r=0;r<2;r++){R(x+4,sol-22+r*7,30,1,'#6a4a2a');
      for(let q=0;q<5;q++){const px=x+5+q*6,py=sol-27+r*7;
        R(px,py,4.4,4,['#c8402a','#2f7a4a','#e2c070','#2a6a9a','#8a4a8a'][(q+r)%5]);
        R(px,py,4.4,1.2,'rgba(255,255,255,.45)');
        R(px+1.4,py+4,1.6,1.4,'#9aa0a8');}}
    for(let a=0;a<6.283;a+=0.42)R(x+30+Math.cos(a)*3,sol-13+Math.sin(a)*3,1.4,1.4,'#b4bcc4');
    R(x+29,sol-14,2,2,'#e2c070');
  }else{
    /* à droite : trois cannes dressées, bien espacées, et un filet suspendu */
    for(let i=0;i<16;i+=3)for(let j=0;j<8;j+=3){
      R(x+20+i,yR+14+j,1,1,'#b8a888');R(x+21.5+i,yR+15.5+j,1,1,'#a89878');}
    for(let q=0;q<3;q++){const px=x+8+q*8, h=rez-22;
      for(let i=0;i<h;i++){const w=2-i*1.3/h;R(px-w/2,sol-13-i,w,1,i<5?'#c9a878':'#2a4654');}
      R(px-1.8,sol-18,1.8,3.4,'#3a3f46');
      for(let a=0;a<6.283;a+=0.55)R(px-3.2+Math.cos(a)*1.7,sol-16.3+Math.sin(a)*1.7,1.1,1.1,'#b4bcc4');
      for(let i=0;i<3;i++)R(px-.7,sol-24-i*5,1.4,.7,T.or);}
    R(x+3,sol-13,32,2,'#8a6238');R(x+3,sol-13,32,.7,'#a5764a');
  }
  /* le reflet du verre, exactement comme chez Fonfon */
  R(x,yR+2,w,rez-10,'rgba(255,255,255,.06)');
  g.fillStyle='rgba(255,255,255,.14)';g.beginPath();
  g.moveTo(x+4,sol-8);g.lineTo(x+14,yR+2);g.lineTo(x+19,yR+2);g.lineTo(x+9,sol-8);g.fill();
  R(x+w/2-.5,yR+2,1,rez-10,T.b);R(x,yR+2,w,1.5,T.b);R(x,sol-9,w,1.5,T.b);
  g.font='italic 700 4.6px Georgia,serif';g.textAlign='center';g.fillStyle=T.or;
  g.fillText(k?'Appâts du jour':'Leurres & moulinets',x+w/2,yR+17.5,w-6);g.textAlign='left';});
/* LA PORTE */
R(cx-8,yR+2,16,rez-8,T.bs);R(cx-7,yR+3,14,rez-10,nuit?'#ffe8b8':'#cfe0e4');
R(cx-.5,yR+3,1,rez-10,T.b);R(cx-7,yR+14,14,1,T.b);
R(cx+2.5,sol-18,1.4,4,T.or);R(cx-3.6,sol-18,1.4,4,T.or);
/* L'ARDOISE accrochée près de la porte */
R(cx-24,yR+8,10,13,'#2a2a2a');R(cx-23,yR+9,8,11,'#3a3a3a');
g.font='700 2.6px Arial';g.textAlign='center';g.fillStyle='#f0ece0';
g.fillText('APPÂTS',cx-19,yR+12.6);g.fillText('CANNES',cx-19,yR+16);g.fillText('FILETS',cx-19,yR+19.4);g.textAlign='left';
/* LE STORE RAYÉ, bleu et crème */
const sy=yR-10;
for(let k=0;k<BL+8;k++){const c=(k%12<6)?T.store[0]:T.store[1];
  R(x0-4+k,sy,1,8,c);R(x0-4+k,sy+8,1,2,(k%12<6)?T.bs:'#c8c0ac');}
for(let k=0;k<Math.floor((BL+8)/12);k++){const c=(k%2)?T.store[0]:T.store[1];
  for(let i=0;i<5;i++)R(x0-4+k*12+i,sy+10,12-i*2.4,1,c);}
R(x0-4,sy-2,BL+8,2,T.bs);
/* L'ENSEIGNE, avec son petit poisson */
const ey=sy-15;
R(x0-6,ey,BL+12,14,T.bs);R(x0-4,ey+2,BL+8,10,T.b);R(x0-4,ey+2,BL+8,1,T.or);
(function(px,py,s,c){
  for(let i=0;i<13*s;i++){const t=i/(13*s);
    const h=Math.round(4*s*Math.sqrt(Math.max(0.04,1-Math.pow(t*2-0.82,2))));
    for(let q=-h;q<=h;q++)R(px+i,py+q,1,1,c);}
  R(px+13*s,py-3*s,1.6*s,6*s,c);R(px+14.6*s,py-4.4*s,1.4*s,3*s,c);R(px+14.6*s,py+1.4*s,1.4*s,3*s,c);
  R(px+5*s,py+3*s,4*s,1.4*s,c);R(px+3*s,py-1.2*s,1.6*s,1.6*s,T.b);})(x0+5,ey+7,0.72,T.or);
g.font='italic 900 9.5px Georgia,serif';g.textAlign='center';
g.fillStyle='rgba(0,0,0,.4)';g.fillText('Le Pêcheur Heureux',cx+4.6,ey+10.6,BL-26);
g.fillStyle=T.or;g.fillText('Le Pêcheur Heureux',cx+4,ey+10,BL-26);g.textAlign='left';
/* LE FILET SUSPENDU, sous le store à droite */
for(let i=0;i<22;i+=3)for(let j=0;j<12;j+=3){
  R(x0+BL-26+i,sy+11+j,1,1,nuit?'#8a8068':'#c0b498');
  R(x0+BL-24.5+i,sy+12.5+j,1,1,nuit?'#7a7058':'#b0a488');}
/* LA BOUÉE, à gauche sous le store */
for(let a=0;a<6.283;a+=0.16)R(x0+4+Math.cos(a)*5,sy+17+Math.sin(a)*5,1.6,1.6,(Math.floor(a/0.8)%2)?'#c0392b':'#f2ece0');
/* DEVANT LA BOUTIQUE : trois cannes, une caisse, un seau */
R(x0+BL-16,sol-11,13,9,'#8a6238');R(x0+BL-16,sol-12,13,2,'#a5764a');R(x0+BL-16,sol-4,13,1.4,'#5b3f21');
for(let q=0;q<3;q++){const x=x0+BL-12+q*4, h=22+q*2;
  for(let i=0;i<h;i++){const w=1.8-i*1.2/h;R(x-w/2,sol-12-i,w,1,i<5?'#c9a878':'#2a4654');}
  R(x-1.6,sol-17,1.6,3,'#3a3f46');
  for(let a=0;a<6.283;a+=0.6)R(x-2.9+Math.cos(a)*1.5,sol-15.5+Math.sin(a)*1.5,1,1,'#b4bcc4');
  for(let i=0;i<3;i++)R(x-.7,sol-22-i*5,1.4,.7,T.or);}
/* la caisse de poissons, posée à gauche */
R(x0+2,sol-9,17,7,'#9a7146');R(x0+2,sol-10,17,1.6,'#b8905c');
for(let i=0;i<17;i+=4)R(x0+2+i,sol-8.6,1.2,6,'#7d5934');
for(let q=0;q<3;q++){R(x0+4+q*5,sol-12,4,2.4,'#9fc0d0');R(x0+4+q*5,sol-12,4,.8,'#d8e8f0');}
/* le seau, à côté */
R(x0+22,sol-8,7,6,'#2f7a8a');R(x0+22,sol-8,7,1.2,'#49a0b2');R(x0+21,sol-9,9,1.2,'#3a8a9a');
R(x0+24,sol-11,1,2.4,'#8a8a92');
/* la lumière chaude du dedans, la nuit */
if(nuit){const l=g.createRadialGradient(cx,sol-14,5,cx,sol-14,72);
  l.addColorStop(0,'rgba(255,206,130,.42)');l.addColorStop(1,'rgba(255,206,130,0)');
  g.fillStyle=l;g.fillRect(cx-72,sol-80,144,78);}
});}
function clientCape(R,x,y,cheveux,cape){R(x-5,y-2,10,9,cape||'#f4f4f4');R(x-5,y-2,10,1,'#ffffff');R(x-2.5,y-8,5,6,'#e0b088');R(x-3,y-9,6,3,cheveux);R(x-1,y+7,2,4,'#3a3a40');R(x-4,y+10,8,1.5,'#3a3a40');}
function coiffeur(R,x,y,tablier,cheveux){R(x-2.5,y-16,5,5,'#e0b088');R(x-3,y-17,6,2.5,cheveux);R(x-3,y-11,6,9,tablier);R(x-2.5,y-2,2,6,'#2a2a30');R(x+.5,y-2,2,6,'#2a2a30');R(x+3,y-10,4,1.5,'#e0b088');R(x+6.5,y-11,2,1,'#c8ccd4');R(x+6.5,y-9.5,2,1,'#c8ccd4');}
function poteau(R,px,py,h,e){e=e||1;R(px-2*e,py-4,4*e+2,4,'#d8b050');R(px-2*e,py+h,4*e+2,4,'#d8b050');R(px-1.5*e,py,3*e+2,h,'#ffffff');
for(let k=0;k<h;k+=2){const off=((k*0.9)%(3*e+2));R(px-1.5*e+off,py+k,1.6,2,k%4<2?'#c8281e':'#2d5fb0');}R(px-1*e,py,1,h,'rgba(255,255,255,.4)');R(px-1.5*e-.5,py-7,3*e+3,3,'#e8e8e8');}
function graverLePeigne(){return devanture(4,(g,R,{sol,cx,BL,x0,rez,yR},nuit)=>{
/* ================= LA MARINIÈRE =================
   Boutique de vêtements, sur l'architecture validée du Pêcheur Heureux. */
const T={b:'#1b3f52',bh:'#28586f',bs:'#0e2634',store:['#1d5a78','#e8e0cc'],or:'#e2c070'};
const mannequin=(x,y,haut,bas,tete)=>{
  R(x-1.6,y-26,3.2,4,'#9aa0a8');
  if(tete){for(let a=0;a<6.283;a+=0.3)R(x+Math.cos(a)*3,y-30+Math.sin(a)*3,2,2,'#c9b89a');}
  R(x-5,y-23,10,12,haut);R(x-5,y-23,10,3,'rgba(255,255,255,.3)');
  R(x-7,y-22,2.4,8,haut);R(x+4.6,y-22,2.4,8,haut);
  R(x-4.4,y-11,8.8,11,bas);R(x-0.6,y-11,1.2,11,'rgba(0,0,0,.2)');
  R(x-2.4,y,5,1.6,'#3a3f46');};
const cintre=(x,y,c)=>{R(x-0.6,y-4,1.2,3,'#9aa0a8');R(x-3,y-1.4,6,1.4,'#9aa0a8');
  R(x-4.4,y,8.8,8,c);R(x-6,y+0.6,1.8,5,c);R(x+4.2,y+0.6,1.8,5,c);};
const pile=(x,y,cs)=>{cs.forEach((c,i)=>{R(x,y-i*3,13,2.6,c);R(x,y-i*3,13,0.8,'rgba(255,255,255,.35)');});};
const chapeau=(x,y,c)=>{R(x-6,y,12,1.6,c);R(x-3.4,y-4,7,4,c);R(x-3.4,y-1.4,7,1,'rgba(0,0,0,.25)');};
/* le corps et les montants */
R(x0-2,yR-4,BL+4,rez+4,T.b);R(x0-2,yR-4,BL+4,1.5,T.or);
R(x0-2,sol-6,BL+4,6,T.bs);R(x0-2,sol-6,BL+4,1,T.bh);
[x0,x0+44,x0+BL-50,x0+BL-6].forEach(x=>{
  R(x,yR,6,rez-6,T.bh);R(x+1,yR,1,rez-6,'rgba(255,255,255,.18)');R(x+5,yR,1,rez-6,T.bs);
  R(x-1,yR,8,2,T.or);R(x-1,sol-8,8,2,T.or);});
/* les deux vitrines */
[[x0+6,38],[x0+BL-44,38]].forEach(([x,w],k)=>{
  R(x,yR+2,w,rez-10,nuit?'#ffe2b0':'#e8d2a8');R(x,yR+2,w,10,nuit?'#f0c890':'#d8bc90');
  for(let q=0;q<3;q++){R(x+4+q*12,yR+4,1,6,'#6a4a2a');R(x+2+q*12,yR+10,5,2,'#fff4d0');}
  R(x,yR+12,w,1,'#b89a6a');
  if(!k){mannequin(x+11,sol-12,'#2a4a7a','#3a3f46',true);
    mannequin(x+27,sol-12,'#b4302c','#2a3a4a',false);
    R(x+3,sol-11,32,2,'#8a6238');}
  else{R(x+3,sol-28,32,1.4,'#8a6238');
    [0,1,2,3].forEach(i=>cintre(x+8+i*7,sol-27,['#2f6a4a','#e2c070','#8a4a6a','#2a6a9a'][i]));
    pile(x+5,sol-13,['#dfe4e8','#2a4a7a','#b4302c']);
    pile(x+21,sol-13,['#6a7a4a','#e8c46a']);}
  {const lv=g.createLinearGradient(x,yR+2,x,sol-9);
   lv.addColorStop(0,nuit?'rgba(255,196,96,.42)':'rgba(255,214,140,.26)');
   lv.addColorStop(1,'rgba(255,186,90,0)');g.fillStyle=lv;g.fillRect(x,yR+2,w,rez-11);}
  R(x,yR+2,w,rez-10,'rgba(255,255,255,.06)');
  g.fillStyle='rgba(255,255,255,.14)';g.beginPath();
  g.moveTo(x+4,sol-8);g.lineTo(x+14,yR+2);g.lineTo(x+19,yR+2);g.lineTo(x+9,sol-8);g.fill();
  R(x+w/2-.5,yR+2,1,rez-10,T.b);R(x,yR+2,w,1.5,T.b);R(x,sol-9,w,1.5,T.b);
  g.font='italic 700 4.4px Georgia,serif';g.textAlign='center';g.fillStyle=T.or;
  g.fillText(k?'Chandails':'Vareuses',x+w/2,yR+17.5,w-8);g.textAlign='left';});
/* la porte */
R(cx-8,yR+2,16,rez-8,T.bs);R(cx-7,yR+3,14,rez-10,nuit?'#ffe8b8':'#cfe0e4');
R(cx-.5,yR+3,1,rez-10,T.b);R(cx-7,yR+14,14,1,T.b);
R(cx+2.5,sol-18,1.4,4,T.or);R(cx-3.6,sol-18,1.4,4,T.or);
/* le store */
const sy=yR-10;
for(let k=0;k<BL+8;k++){const c=(k%12<6)?T.store[0]:T.store[1];
  R(x0-4+k,sy,1,8,c);R(x0-4+k,sy+8,1,2,(k%12<6)?T.bs:'#c8c0ac');}
for(let k=0;k<Math.floor((BL+8)/12);k++){const c=(k%2)?T.store[0]:T.store[1];
  for(let i=0;i<5;i++)R(x0-4+k*12+i,sy+10,12-i*2.4,1,c);}
R(x0-4,sy-2,BL+8,2,T.bs);
/* l'enseigne, avec son aiguille et son fil */
const ey=sy-15;
R(x0-6,ey,BL+12,14,T.bs);R(x0-4,ey+2,BL+8,10,T.b);R(x0-4,ey+2,BL+8,1,T.or);
R(x0+3,ey+9,9,1.4,T.or);R(x0+11,ey+8,3,3,T.or);
for(let i=0;i<7;i++)R(x0+4+i*1.4,ey+5+Math.sin(i)*1.6,1.4,1.4,T.or);
g.font='italic 900 9px Georgia,serif';g.textAlign='center';
g.fillStyle='rgba(0,0,0,.4)';g.fillText('La Marinière',cx+5.6,ey+10.6,BL-28);
g.fillStyle=T.or;g.fillText('La Marinière',cx+5,ey+10,BL-28);g.textAlign='left';
/* devant : le portant et le panier à chapeaux */
R(x0+3,sol-24,2,22,'#9aa0a8');R(x0+22,sol-24,2,22,'#9aa0a8');R(x0+3,sol-25,21,2,'#b4bcc4');
[0,1,2].forEach(i=>cintre(x0+8+i*6,sol-23,['#2a4a7a','#b4302c','#2f6a4a'][i]));
R(x0+BL-20,sol-12,16,10,'#9a7146');R(x0+BL-20,sol-12,16,2,'#b8905c');
chapeau(x0+BL-12,sol-14,'#2a3a4a');
/* la lumière du dedans */
{const l=g.createRadialGradient(cx,sol-14,5,cx,sol-14,nuit?80:56);
 l.addColorStop(0,nuit?'rgba(255,200,120,.5)':'rgba(255,214,150,.16)');
 l.addColorStop(1,'rgba(255,200,120,0)');g.fillStyle=l;g.fillRect(cx-80,sol-86,160,88);}
});}
function graverBanderole(l1,l2,W0,haut){const W=W0||86,H=haut||40,D=2,c=document.createElement('canvas');c.width=W*D;c.height=H*D;const g=c.getContext('2d');g.setTransform(D,0,0,D,0,0);
const sol=H-2;[[3],[W-5]].forEach(([x])=>{g.fillStyle='#6b4a28';g.fillRect(x,6,2,sol-6);g.fillStyle='#8a6238';g.fillRect(x,6,0.7,sol-6);});   /* des perches plus longues quand on la tient bien haut */
g.fillStyle='#f4f0e6';g.beginPath();g.moveTo(5,9);g.quadraticCurveTo(W/2,11,W-5,9);g.lineTo(W-5,27);g.quadraticCurveTo(W/2,29.5,5,27);g.closePath();g.fill();
g.fillStyle='rgba(0,0,0,.08)';for(let x=12;x<W-8;x+=14)g.fillRect(x,10,1,17);
g.textAlign='center';g.fillStyle='#c8281e';g.font='900 7px Georgia,serif';g.fillText(l1,W/2,18.5,W-14);g.fillStyle='#1d3f6a';g.font='700 5px Georgia,serif';g.fillText(l2,W/2,25,W-14);
return {toile:c,W,H,sol,nuit:null};}
function graverDrapeauM(v){const W=26,H=46,D=2,c=document.createElement('canvas');c.width=W*D;c.height=H*D;const g=c.getContext('2d');g.setTransform(D,0,0,D,0,0);const sol=H-2;
g.fillStyle='#6b4a28';g.fillRect(5,2,1.5,sol-2);const col=v%2?'#c8281e':'#1d3f6a';
g.fillStyle=col;g.beginPath();g.moveTo(6.5,3);g.quadraticCurveTo(14,1,22,4);g.quadraticCurveTo(20,10,22,16);g.quadraticCurveTo(14,13,6.5,15);g.closePath();g.fill();
g.strokeStyle='#ffffff';g.lineWidth=1.1;g.beginPath();g.moveTo(14,5);g.lineTo(14,12);g.moveTo(11,7);g.lineTo(17,7);g.stroke();g.beginPath();g.arc(14,10.5,3,0.2,Math.PI-0.2);g.stroke();   /* l'ancre des dockers */
return {toile:c,W,H,sol,nuit:null};}
function graverFumigene(){const W=60,H=70,D=2,c=document.createElement('canvas');c.width=W*D;c.height=H*D;const g=c.getContext('2d');g.setTransform(D,0,0,D,0,0);const sol=H-3;
for(let k=0;k<26;k++){const t=k/26, x=W/2+Math.sin(k*1.7)*8*t+t*10, y=sol-6-t*56, r=4+t*11;g.fillStyle='rgba('+(230-k*2)+','+(70+k)+','+(60+k)+','+(0.55-t*0.4).toFixed(2)+')';g.beginPath();g.arc(x,y,r,0,7);g.fill();}
g.fillStyle='#ff5a2a';g.beginPath();g.arc(W/2,sol-4,3,0,7);g.fill();g.fillStyle='#fff0a0';g.beginPath();g.arc(W/2,sol-4,1.4,0,7);g.fill();g.fillStyle='#3a3a40';g.fillRect(W/2-1,sol-3,2,4);
return {toile:c,W,H,sol,nuit:null};}
const SLOGANS=['On lâche rien !','Tous ensemble !','Le port, c’est nous !','Des sous pour les dockers !','Solidarité !','Et un, et deux, et trois zéro !'];
ANIM_DECOR.docker=(g,o,x,y)=>{const t=performance.now()/1000;o._f=o._f||{};
const i=1+Math.floor((t*2.4+o.ph)*2)%PASM, cle=i+(STYLE_FIN()?'f':'c');
if(!o._f[cle]){const src=poseDe(Object.assign({},DEF_AP,o.pnj),o.dir||'bas',i);const c=document.createElement('canvas');c.width=src.width;c.height=src.height;c.getContext('2d').drawImage(src,0,0);o._f[cle]=c;}
const bob=Math.abs(Math.sin((t*2.4+o.ph)*Math.PI))*1.2;
g.drawImage(o._f[cle],Math.round(x-CASE_L/2),Math.round(y-CASE_H+10-bob),CASE_L,CASE_H);
if(o.porteVoix){const c2=poseDe(Object.assign({},DEF_AP,o.pnj),o.dir||'bas',1);
const mx=x-10, my=y-38-bob;g.fillStyle='#e8e2d4';g.beginPath();g.moveTo(mx,my-2);g.lineTo(mx-9,my-5);g.lineTo(mx-9,my+5);g.lineTo(mx,my+2);g.closePath();g.fill();g.fillStyle='#c8281e';g.fillRect(mx-1,my-2,3,4);
const cycle=(t%3.2)/3.2;if(cycle<0.65){g.strokeStyle='rgba(255,255,255,.8)';g.lineWidth=0.8;for(let k=0;k<3;k++){g.beginPath();g.arc(mx-10,my,3+k*3+(t*8%3),Math.PI*0.75,Math.PI*1.25);g.stroke();}
const s=SLOGANS[Math.floor(t/3.2)%SLOGANS.length];g.font='italic 700 7px Georgia';const w=g.measureText(s).width+8;
g.fillStyle='rgba(255,255,255,.95)';g.fillRect(x-w-14,y-66,w,11);g.beginPath();g.moveTo(x-18,y-55);g.lineTo(x-14,y-51);g.lineTo(x-24,y-55);g.fill();
g.fillStyle='#c8281e';g.fillText(s,x-w-10,y-58);}}
};
ANIM_DECOR.banderole=(g,o,x,y)=>{const C=XCAL[o.cal],t=performance.now()/1000;if(!C)return;const a=Math.sin(t*1.7+o.ph)*0.035, b=Math.abs(Math.sin(t*2.4))*1.2;
g.save();g.translate(x,y-b);g.rotate(a);g.drawImage(C.toile,-C.W/2,-C.sol,C.W,C.H);g.restore();};
const TISSUS={};
function tissuDocker(v){if(TISSUS[v])return TISSUS[v];const W=34,H=22,D=3,c=document.createElement('canvas');c.width=W*D;c.height=H*D;const g=c.getContext('2d');g.setTransform(D,0,0,D,0,0);
const fond=v%2?'#c8281e':'#1d3f6a';g.fillStyle=fond;g.fillRect(0,0,W,H);g.fillStyle='#ffffff';g.fillRect(0,0,W,1.2);g.fillRect(0,H-1.2,W,1.2);
g.strokeStyle='#ffffff';g.lineWidth=1;const ax=7,ay=10;g.beginPath();g.moveTo(ax,ay-5);g.lineTo(ax,ay+4);g.moveTo(ax-3,ay-3);g.lineTo(ax+3,ay-3);g.stroke();g.beginPath();g.arc(ax,ay+1.5,3.2,0.25,Math.PI-0.25);g.stroke();
g.fillStyle='#ffffff';g.textAlign='center';g.font='900 5.2px Georgia,serif';g.fillText('DOCKERS',22,10);g.font='700 4.4px Georgia,serif';g.fillStyle=v%2?'#ffd870':'#f2d21a';g.fillText('MARSEILLE',22,16.5);
return TISSUS[v]=c;}
ANIM_DECOR.drapeau=(g,o,x,y)=>{const t=performance.now()/1000, h=46, bob=Math.abs(Math.sin(t*2.4+o.ph))*1.2, T=tissuDocker(o.v), W=34, H=22, k=T.width/W;
g.fillStyle='#6b4a28';g.fillRect(x-1,y-h-bob,1.5,h);g.fillStyle='#d8b050';g.fillRect(x-1.5,y-h-bob-2,2.5,2);
for(let cx=0;cx<W;cx+=2){const v=Math.sin(t*6-cx*0.35+o.ph)*(cx/W)*3;                 /* par bandes de deux points : léger, et ça ondule pareil */
g.drawImage(T,cx*k,0,2*k,T.height,x+0.5+cx,y-h-bob+1+v,2,H);}
g.fillStyle='rgba(0,0,0,.12)';for(let cx=6;cx<W;cx+=10){const v=Math.sin(t*6-cx*0.35+o.ph)*(cx/W)*3;g.fillRect(x+0.5+cx,y-h-bob+1+v,2,H);}};
ANIM_DECOR.fumigene=(g,o,x,y)=>{const t=performance.now()/1000;
for(let k=0;k<22;k++){const age=(t*0.45+k/22+o.ph)%1, dx=Math.sin(k*1.7+t*0.8)*5*age+age*16*(o.vent||1), r=3+age*13;
g.fillStyle='rgba('+Math.round(235-age*40)+','+Math.round(70+age*80)+','+Math.round(70+age*80)+','+((1-age)*0.45).toFixed(2)+')';g.beginPath();g.arc(x+dx,y-6-age*62,r,0,7);g.fill();}
const f=0.7+Math.random()*0.3;g.fillStyle='#3a3a40';g.fillRect(x-1,y-4,2,5);g.fillStyle='rgba(255,90,40,'+f+')';g.beginPath();g.arc(x,y-5,2.8*f,0,7);g.fill();g.fillStyle='#fff0a0';g.fillRect(x-0.8,y-6,1.6,1.6);};
ANIM_DECOR.danseur=(g,o,x,y)=>{const t=performance.now()/1000+o.ph;o._f=o._f||{};
const temps=Math.floor(t*2.6), dir=['bas-gauche','bas','bas-droite','bas'][temps%4], i=1+Math.floor(t*6)%PASM, cle=dir+i+(STYLE_FIN()?'f':'c');
if(!o._f[cle]){const src=poseDe(Object.assign({},DEF_AP,o.pnj),dir,i);const c=document.createElement('canvas');c.width=src.width;c.height=src.height;c.getContext('2d').drawImage(src,0,0);o._f[cle]=c;}
const saut=Math.abs(Math.sin(t*Math.PI*2.6))*4, hanche=Math.sin(t*Math.PI*1.3)*0.16;
g.fillStyle='rgba(40,30,18,.22)';g.beginPath();g.ellipse(x,y+1,7-saut*0.4,1.8,0,0,7);g.fill();
g.save();g.translate(x,y-saut);g.rotate(hanche);g.drawImage(o._f[cle],Math.round(-CASE_L/2),Math.round(-CASE_H+10),CASE_L,CASE_H);g.restore();
if(Math.floor(t*1.3)%3===0){g.fillStyle='#ffffff';g.font='700 8px Georgia';g.fillText('♪',x+8,y-52-saut);g.fillText('♫',x-14,y-46-saut*0.5);}};
ANIM_DECOR.gag=(g,o,x,y)=>{const D=9.5, t=((performance.now()/1000)+o.ph)%D, ap=Object.assign({},DEF_AP,{peau:2,cheveux:4,coiffe:2,veste:'#3a8a5a',haut:1,pantalon:'#2a2a30',corps:2});
const lamp=x, depart=lamp-150, vit=62, choc=(lamp-8-depart)/vit;              /* il arrive de l'ouest, la tête tournée vers les manifestants */
const pose=(dir,i)=>{o._p=o._p||{};const cle=dir+i+(STYLE_FIN()?'f':'c');if(!o._p[cle]){const src=poseDe(ap,dir,i);const c=document.createElement('canvas');c.width=src.width;c.height=src.height;c.getContext('2d').drawImage(src,0,0);o._p[cle]=c;}return o._p[cle];};
if(t<choc){const px=depart+t*vit, pas=t*3;dessinerUnVelo(g,px,y+7,'droite',pas,2,true);
g.drawImage(pose(t>choc-1.2?'haut-droite':'droite',1+Math.floor(t*8)%PASM),Math.round(px-CASE_L/2),Math.round(y-CASE_H+4),CASE_L,CASE_H);
if(t>choc-1.2){g.font='italic 700 7px Georgia';g.fillStyle='#ffffff';g.fillText('Allez les dockers !',px-30,y-58);}return;}
const u=t-choc, px=lamp-8;
if(u<0.35){const recul=u*18;g.save();g.translate(px-recul,y);g.rotate(-u*1.4);dessinerUnVelo(g,0,7,'droite',0,2,false);g.drawImage(pose('droite',0),Math.round(-CASE_L/2),Math.round(-CASE_H+4),CASE_L,CASE_H);g.restore();
g.font='900 12px Georgia';g.fillStyle='#ffe040';g.strokeStyle='#3a2616';g.lineWidth=2;g.strokeText('BONG !',lamp-18,y-58);g.fillText('BONG !',lamp-18,y-58);return;}
const sol=Math.min(1,(u-0.35)/0.25);
g.save();g.translate(px-4,y+5);g.rotate(0.2);g.scale(1,0.55);dessinerUnVelo(g,0,0,'droite',0,2,false);g.restore();
g.save();g.translate(px+2,y+2);g.rotate(-Math.PI/2*sol);g.drawImage(pose('droite',0),Math.round(-CASE_L/2),Math.round(-CASE_H+8),CASE_L,CASE_H);g.restore();
const hx=px+2-36*sol, hy=y-2;
for(let k=0;k<3;k++){const a=u*5+k*2.1, sx=hx+Math.cos(a)*9, sy=hy-8+Math.sin(a)*3;g.fillStyle='#ffe040';g.beginPath();for(let q=0;q<5;q++){const an=q*Math.PI*0.8-Math.PI/2;g.lineTo(sx+Math.cos(an)*2.6,sy+Math.sin(an)*2.6);}g.closePath();g.fill();}
if(u>2.2&&u<5){g.font='italic 700 7px Georgia';g.fillStyle='#ffffff';g.fillText('Aïe… le lampadaire…',hx-10,hy-18);}
if(u>D-choc-0.8){g.globalAlpha=1;}};
ANIM_DECOR.chien=(g,o,x,y)=>{const t=performance.now()/1000, q=Math.sin(t*14)*2, bob=Math.abs(Math.sin(t*4))*0.8, R=(a,b,w,h,c)=>{g.fillStyle=c;g.fillRect(a,b,w,h);};
g.fillStyle='rgba(40,30,18,.25)';g.beginPath();g.ellipse(x,y,9,2,0,0,7);g.fill();
R(x-7,y-9-bob,14,6,'#b07a40');R(x-7,y-9-bob,14,1.5,'#c8904e');R(x-6,y-4,2,4,'#8a5a2a');R(x+4,y-4,2,4,'#8a5a2a');R(x-3,y-4,2,4,'#8a5a2a');R(x+1,y-4,2,4,'#8a5a2a');   /* le corps, les pattes */
R(x-4,y-9-bob,8,6,'#f2d21a');R(x-4,y-7-bob,8,1,'#e8ecf0');                                                                                 /* son petit gilet */
R(x+6,y-14-bob,6,6,'#b07a40');R(x+11,y-12-bob,2,2,'#2a1a10');R(x+8,y-12-bob,1,1,'#1a1a1a');R(x+6,y-15-bob,2,3,'#8a5a2a');                    /* la tête, la truffe, l'oreille */
g.save();g.translate(x-7,y-8-bob);g.rotate(-0.6+q*0.15);R(-5,-1,5,2,'#b07a40');g.restore();                                                   /* la queue qui remue */
if((t%5)<0.8){g.font='italic 700 6px Georgia';g.fillStyle='#ffffff';g.fillText('Ouaf !',x+8,y-19);}};
function semerDecorExtramar(){
DECOR=[];
const P=(t,x,y,o)=>DECOR.push(Object.assign({t,x,y,gr:0},o||{}));
for(let k=0;k<10;k++){
if(k===4)continue;                                                  /* la ruelle du casino (plus de panneau en bois) */
if(k===1){XCAL['x_fonfon0']=restoFonfon('bordeaux');CALQUES_DECO['x_fonfon']=XCAL['x_fonfon0'];P('x_fonfon',70+k*140,XP.maisonsY,{col:[70,24],bati:true,demi:56,ouvre:'bouillabaisse'});continue;}   /* Chez Fonfon, le restaurant de bouillabaisse (à la place du Fumoir) */
if(k===9){XCAL['x_presse0']=graverLaPresse();CALQUES_DECO['x_presse']=XCAL['x_presse0'];P('x_presse',70+k*140,XP.maisonsY,{col:[70,24],bati:true,demi:56,ouvre:'presse'});continue;}   /* la maison de la presse */
if(k===2){XCAL['x_facPeche0']=graverLaBoutiquePeche();CALQUES_DECO['x_facPeche']=XCAL['x_facPeche0'];P('x_facPeche',70+k*140,XP.maisonsY,{col:[70,24],bati:true,demi:56,ouvre:'peche'});continue;}   /* Pêche & Marine */
if(k===6){XCAL['x_facPoisson0']=graverLaPoissonnerie();CALQUES_DECO['x_facPoisson']=XCAL['x_facPoisson0'];P('x_facPoisson',70+k*140,XP.maisonsY,{col:[70,24],bati:true,demi:56,ouvre:'poissonnerie'});continue;}   /* la poissonnerie */
if(k===3){XCAL['x_bar0']=graverLeBar();CALQUES_DECO['x_bar']=XCAL['x_bar0'];P('x_bar',70+k*140,XP.maisonsY,{col:[70,24],bati:true,demi:56,ouvre:'bar'});
continue;}   /* le bar-tabac PMU (sans terrasse) */
if(k===5){XCAL['x_peigne0']=graverLePeigne();CALQUES_DECO['x_peigne']=XCAL['x_peigne0'];P('x_peigne',70+k*140,XP.maisonsY,{col:[70,24],bati:true,demi:56,ouvre:'salon'});continue;}   /* le salon de coiffure */
if(k===7){XCAL['x_crousti0']=graverCroustiPort();CALQUES_DECO['x_crousti']=XCAL['x_crousti0'];P('x_crousti',70+k*140,XP.maisonsY,{col:[70,24],bati:true,demi:56,ouvre:'crousti'});continue;}   /* le fast-food du quai */
P('x_maison',70+k*140,XP.maisonsY,{v:k,col:[70,24]});
}
[44,1190].forEach((x,k)=>{P('x_belArbre',x,XP.maisonsY+60,{v:k,col:[8,4]});P('bancP',x+30,XP.maisonsY+72);});   /* les quatre platanes du quai, chacun avec son banc */
let nv=0;
[360,620,880].forEach(px=>{                     /* on compte aussi l'ancien ponton du milieu : les autres voiliers gardent leur allure */
const la=XP.pontons.includes(px);
for(let y=XP.quaiY+24;y<=XP.pontonFin-6;y+=16){
if(la&&alea(px*0.37+y*1.13)>0.27)P('x_voilier',px-XP.pontonL-27,y,{v:(nv)*7%11});
nv++;
if(la&&alea(px*0.71+y*0.53+9)>0.27)P('x_voilier',px+XP.pontonL+27,y+8,{v:(nv)*7%11,flip:true});
nv++;
}
});
/* LE METRO EST DEPOSE. On ne prend plus la ligne 1 pour aller au bois :
   on y va a pied, par le bas du quai droit. */
[280,420,840,980,1120,1248,1510,1710].forEach((x,i)=>P('lanterneP',x,324,{gr:i}));
[[210,316],[490,316],[770,316],[1050,316],[1190,316],[1316,316],[1600,316]]
.forEach(([x,y])=>P('bancP',x,y));
/* L'ESPLANADE DU BOUT reste nue : les deux platanes et la petite pancarte
   sont retires. C'est la grande affiche, derriere le garde-corps, qui dit
   ou mene le bout du quai. */
for(let x=200;x<MONDE_L-24;x+=74){
if(XP.pontons.some(p=>Math.abs(p-x)<26))continue;
P('x_bitte',x,XP.quaiY-3,{col:[4,3]});
}
[[22,410,0],[90,376,1],[18,512,2],[160,592,3]].forEach(([x,y,v])=>P('x_platane',x,y,{v,col:[7,4]}));
[[56,382],[124,382]].forEach(([x,y])=>P('bancP',x,y));
[[58,552,'haut',{veste:1,chapeau:1}],[76,560,'haut',{veste:2,cheveux:1}],
[122,468,'bas',{veste:0,barbe:1,cheveux:0}],[134,424,'bas',{veste:2,chapeau:2}]]
.forEach(([x,y,dir,ap],i)=>P('x_bouliste',x,y,{v:i,dir,ap,col:[5,3]}));
STATIONS_VELO.forEach(([x,y])=>P('x_stationVelo',x,y,{col:[40,5]}));

DECOR.forEach(o=>{if(o.t.slice(0,2)==='x_')graverX(o.t,o.v);});
DECOR.sort((a,b)=>a.y-b.y);invaliderGrille();
}
;({XP,CARGO_X,PAV,CABANON,STATIONS_VELO,surPonton,dansLeBassin,bloqueExtramar,GX,bloqueGarde,construireSolGarde,graverLaBasilique,graverLaLongueVue,semerDecorGarde,panoramaGarde,construireSolExtramar,TU_M,ENDUITS,PI_X,toitCanal,enduit,chaine,fenetreM,balconM,VOLETS,graverImmeuble,graverLaGarde,graverLesToitsDuFond,graverBelArbre,graverLaCriee,graverLeCabanon,graverLaStationVelo,POISSONS_MARMITE,RECETTE,ouvrirLeCabanon,dessinerLeCabanon,cuisinerLaBouillabaisse,graverPavillon,graverArbuste,CANNES,ACCESSOIRES,APPATS,chargerLEquipement,illustrerArticle,ouvrirLaBoutiqueDePeche,fermerLeCatalogue,afficherPecheMarine,acheterALaBoutique,FERRY,positionDuFerry,BANCS,eauVivante,semerDecorExtramar});