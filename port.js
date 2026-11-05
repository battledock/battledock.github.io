const XP={
maisonsY:152,            /* le pied des façades */
quaiY:362,   /* RESSERRE : le fond, le quai et la mer tiennent dans un ecran de telephone */
               /* le bord du quai, au-dessus du bassin — descendu de 240 pour la grande place */
bassinO:0, bassinE:MONDE_L,     /* LA MER SORT DU CADRE DES DEUX COTES.
                                   Elle s'arretait a 170 pour laisser une
                                   langue de terre au boulodrome ; le quai
                                   s'ouvrant aussi a l'ouest, cette terre
                                   n'avait plus de raison d'etre et la
                                   petanque est partie avec elle. */
/* LA RANGEE EST RECENTREE DANS LE CADRE. Elle commencait a 70, collee au
   bord ouest, et laissait 356 px de quai nu a l'est contre rien a l'ouest.
   Son axe de depart passe a 250 : les dix facades couvrent 180 -> 1580, et
   il reste EXACTEMENT 180 px de chaque cote. Aucun immeuble n'est retire,
   aucune boutique ne bouge dans la rangee — tout glisse ensemble, la
   ruelle de Notre-Dame comprise, qui est calee sur la meme grille (k=4). */
rangX0:250,                     /* l'axe de la premiere facade ; les suivantes a +140 */
finVille:1584,                  /* la face est de la derniere facade : la
                                   ville s'arrete la, et l'esplanade mene
                                   aux collines */
debutVille:176,                 /* sa face ouest, le pendant exact : les deux
                                   esplanades font 176 px au meme pixel */
/* pontons retirés */
metro:[1316,736],      /* le métro reprend la place de l'ancienne gare */
/* LA SORTIE DES BOIS, au bout est de la promenade. Rien n'est bati : un
   panneau dit ou l'on va, et on s'en va en marchant vers l'est, entre la
   derniere facade et l'eau. 'seuil' est la ligne au-dela de laquelle, en
   poussant, on part ; 'arrivee' est l'endroit ou l'on repose le pied. */
/* LE SEUIL EST A L'ENTREE DU COULOIR, PLUS AU BOUT. Il etait a 1690,
   soit 54 px apres le point d'arrivee : en revenant du bois, il fallait
   retraverser toute l'esplanade avant que le depart redevienne possible,
   et l'on croyait le passage casse. A 1660 il garde 24 px de marge sur
   l'arrivee — assez pour qu'on ne reparte pas par accident en posant le
   pied — et le depart se declenche des qu'on entre dans la bande. */
sente:{seuil:1660, y0:194, y1:572, arrivee:[1636,258]},
/* LA SORTIE DES CHAMPS, au bout ouest de la promenade : le pendant exact
   de la sente du bois, de l'autre cote du quai. Meme bande, meme demi-
   seconde de poussee, mais vers l'ouest. 'seuil' est la ligne en deca de
   laquelle on part ; 'arrivee' est l'endroit ou l'on repose le pied en
   revenant. Le platane de l'ouest a ete retire : il tenait pile dans la
   bande et on se cognait dedans avant d'avoir pu pousser. */
chemin:{seuil:100, y0:194, y1:572, arrivee:[124,258]},   /* 100 et non 70 : meme marge de 24 px sur l'arrivee que le cote est */
ruelle:{x:880,l:140,haut:30},   /* la montée vers Notre-Dame : axe entre k=4 et k=5, couvre les deux slots */
};
const CARGO_X={pile:[1266,806],docks:[1318,686]};
const PAV={};
/* (CABANON retiré) */
/* LES DEUX STATIONS sont au bout du quai, sur leur esplanade : on prend le
   velo la ou commence la longue ligne droite, pas au milieu. Celle de
   l'ouest etait restee a 284, au milieu de rien ; elle rejoint son
   esplanade, a la meme distance de la ville que sa jumelle de l'est. */
/* A 58 PX DE LA VILLE DES DEUX COTES, puisque les deux esplanades font
   desormais la meme largeur. Leur emprise de collision (40 px de
   demi-largeur) reste en dehors des deux couloirs de sortie. */
const STATIONS_VELO=[[118,240],[1642,240]];            /* les stations de vélos */
/* sur un vélo : on va plus vite */    /* les deux pavillons du milieu */   /* où l'on prend, où l'on dépose */
const surPonton=(x,y)=>false;   /* pontons retirés */
const dansLeBassin=(x,y)=>x>XP.bassinO&&x<XP.bassinE&&y>XP.quaiY;
function bloqueExtramar(x,y){
/* ruelle/escalier retire */
/* LE BAS DE LA CARTE RETIENT TOUT LE MONDE. On s'arrete au bord du quai,
   on continue de pousser vers le sud, et c'est la demi-seconde de poussee
   qui emmene au bois — pas un pas de plus hors du cadre. */
if(x<XP.debutVille+8||x>XP.finVille-8||y<XP.maisonsY+8||y>MONDE_H-6)return true;   /* on ne marche plus dans le bassin du fond */
if(dansLeBassin(x-3,y)||dansLeBassin(x+3,y)||dansLeBassin(x,y+2)){
if(!surPonton(x,y))return true;              /* l'eau : on ne nage pas */
}
if(typeof window!=='undefined'&&window.barriereBloque&&window.barriereBloque(x,y))return true;   /* la barrière du bout est */
/* embaucheBloque retiré — plus de bâtiment d'embauche sur le quai */
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
/* ================= L'APPAREIL DU PAVE =================
   LE QUAI SE LISAIT COMME UN MUR DE BRIQUES VU DE FACE. Trois raisons, et
   la troisieme etait la vraie :
     - des pierres de 14 de haut pour 18 a 34 de large, donc presque
       carrees : un pave est beaucoup plus large que haut ;
     - un appareil trop regulier, chaque rang decale du meme pas, ce qui
       est exactement l'appareil en panneresse d'un mur ;
     - et surtout un filet BLANC pose sous le joint du haut de chaque
       pierre. Ce filet, c'est le dessus eclaire d'une brique. Il ne se
       voit que sur une surface VERTICALE, et c'est lui qui dressait le
       quai tout entier.
   On aplatit : des dalles deux fois plus larges que hautes, un decalage
   de rang tire au hasard, de loin en loin une longue dalle qui casse
   l'alignement, plus aucun filet de lumiere sur les aretes, et des joints
   sombres et faibles, pareils des quatre cotes — de la poussiere entre
   les pierres, pas du mortier.

   LES DEUX PASSES PARTAGENT CE TRACE. Le sol de base et le sol fin
   posent leurs joints aux memes endroits ; calcules chacun de son cote,
   ils finiraient par se decaler et l'on verrait deux pavages l'un sur
   l'autre. */
function dallesDuQuai(cb){
  const A=(i)=>alea(i*1.37+0.5);
  /* LE PAVE COMMENCE AU PIED DES FACADES, PAS A 70.
     Il partait de 70, c'est-a-dire 80 px au-dessus du sol : tout ce qui
     est peint par-dessus avec de la transparence — les trois plans de
     collines et leur voile atmospherique, la brume, les toits du fond —
     laissait voir la grille des dalles au travers. On avait un quadrillage
     de briques dans le ciel, derriere les affiches et sur les collines.
     On ne pave donc plus que le sol, a partir de six pixels au-dessus du
     pied des facades ; au-dessus, l'aplat de fond suffit, il est de toute
     facon couvert par les immeubles ou par les collines. */
  let y=XP.maisonsY-6;
  while(y<MONDE_H){
    /* CHAQUE RANG A SA PROPRE HAUTEUR. Des rangs tous egaux, c'est de
       l'appareil de briques quoi qu'on fasse aux proportions : l'oeil lit
       la regularite avant de lire la forme. Entre 8 et 15, il lit des
       dalles posees. */
    const h=22;                                /* LE GRANIT DU VIEUX-PORT : des bandes regulieres */
    let x=-Math.floor(A(y*0.77)*60);
    while(x<MONDE_L){
      const w=44+Math.floor(A(x*0.31+y)*3)*11;   /* 44, 55 ou 66 : de grandes dalles polies */
      cb(x,y,w,h);
      x+=w;
    }
    y+=h;
  }
}
/* ================= LE PORT AUTONOME, AU FOND =================
   Ce qu'on voit depuis le quai : le bassin, et de l'autre cote la
   Joliette. A gauche les portiques de Mourepiane et un porte-conteneurs
   a quai ; au milieu la tour CMA CGM, La Marseillaise, les Docks, le
   silo d'Arenc et un ferry a la gare maritime ; puis La Major, le fort
   Saint-Jean, le MuCEM, et Notre-Dame de la Garde sur sa colline.
   Tout est pose au pixel, comme le reste du port. */
function graverLePortAutonome(g,ambiance,couches){
const M=MONDE_L, HZ=108, EAU=140;
const aube=ambiance==='aube', nuit=ambiance==='nuit', soir=ambiance==='soir'||aube;
const LUM=[], lum=(x,y,w,h,c,v)=>LUM.push([x,y,w,h,c,v]);   /* les lumieres qui s'allument : posees apres la teinte */
const allume=k=>nuit?k:(aube?k*0.12:(ambiance==='soir'?k*0.22:0));   /* la part des fenetres eclairees */
const A=(i)=>alea(i*1.37+0.5);
const hex=h=>[parseInt(h.slice(1,3),16),parseInt(h.slice(3,5),16),parseInt(h.slice(5,7),16)];
const BAYER=[0,8,2,10,12,4,14,6,3,11,1,9,15,7,13,5];
const seuil=(x,y)=>(BAYER[(y&3)*4+(x&3)]+0.5)/16;
const SOLEIL=aube?{x:1700,y:82}:(soir?{x:430,y:66}:null);   /* le soir derriere les portiques, l'aube derriere les collines */
const LUNE={x:960,y:24};

/* ---------- LE CIEL : des bandes tramees, comme un vrai ciel de pixel ---------- */
{
const stops=nuit?[[0,'#060a1e'],[0.45,'#0f1838'],[0.8,'#1f2a54'],[1,'#36406e']]
 :aube?[[0,'#26305f'],[0.3,'#4e5288'],[0.56,'#a07898'],[0.78,'#eaa08e'],[1,'#ffd6a6']]
 :soir?[[0,'#27386e'],[0.28,'#4c4f8c'],[0.52,'#9c6c8e'],[0.74,'#e3926a'],[1,'#fbd08c']]
 :[[0,'#2a64ad'],[0.32,'#4486c9'],[0.66,'#83b6e2'],[1,'#cfe3ee']];
const coul=t=>{for(let i=1;i<stops.length;i++)if(t<=stops[i][0]){const a=stops[i-1],b=stops[i],u=(t-a[0])/(b[0]-a[0]),ca=hex(a[1]),cb=hex(b[1]);return ca.map((v,j)=>Math.round(v+(cb[j]-v)*u));}return hex(stops[stops.length-1][1]);};
const N=18, PAL=[];for(let k=0;k<=N;k++)PAL.push(coul(k/N));
const img=g.getImageData(0,0,M,EAU), d=img.data;
for(let y=0;y<EAU;y++)for(let x=0;x<M;x++){
  let t=Math.min(1,y/HZ);
  if(SOLEIL){const dx=(x-SOLEIL.x)/260, dy=(y-SOLEIL.y)/90; t=Math.min(1,t+0.42*Math.exp(-(dx*dx+dy*dy)));}
  const f=t*N, k=Math.floor(f), lv=Math.min(N,(f-k)>seuil(x,y)?k+1:k), c=PAL[lv], o=(y*M+x)*4;
  d[o]=c[0];d[o+1]=c[1];d[o+2]=c[2];d[o+3]=255;
}
g.putImageData(img,0,0);
}
let G=g;   /* la toile ou l'on peint : le ciel, ou les nuages a part */
const R=(x,y,w,h,col)=>{G.fillStyle=col;G.fillRect(x|0,y|0,Math.max(1,w|0),Math.max(1,h|0));};
if(SOLEIL){
  const S=aube?['#ffcfae','#ffe2c4','#fff4e4']:['#ffd890','#ffe7a8','#fff6d6'];
  for(let r=16;r>9;r--)for(let y=-r;y<=r;y++){const hw=Math.round(Math.sqrt(r*r-y*y));for(let x=-hw;x<=hw;x++)if(((x+y)&1)===0||r<12)R(SOLEIL.x+x,SOLEIL.y+y,1,1,r<12?S[1]:S[0]);}
  for(let y=-9;y<=9;y++){const hw=Math.round(Math.sqrt(81-y*y));R(SOLEIL.x-hw,SOLEIL.y+y,hw*2+1,1,S[2]);}
}
if(nuit){
  /* les etoiles, plus nombreuses en haut, et quelques-unes qui brillent en croix */
  for(let i=0;i<420;i++){const x=A(i*3.7+90)*M, y=Math.floor(Math.pow(A(i*5.3+40),1.6)*(HZ-20));
    const v=A(i*7.1);R(x,y,1,1,v<0.6?'rgba(200,214,255,.45)':(v<0.9?'rgba(235,240,255,.75)':'#ffffff'));
    if(v>0.975){R(x-1,y,1,1,'rgba(220,230,255,.4)');R(x+1,y,1,1,'rgba(220,230,255,.4)');R(x,y-1,1,1,'rgba(220,230,255,.4)');R(x,y+1,1,1,'rgba(220,230,255,.4)');}}
  /* la lune, son halo en anneaux trames, ses mers */
  for(let r=22;r>8;r--)for(let y=-r;y<=r;y++){const hw=Math.round(Math.sqrt(r*r-y*y));for(let x=-hw;x<=hw;x++)if(((x*3+y*5+r)%7)===0)R(LUNE.x+x,LUNE.y+y,1,1,'rgba(200,210,240,'+(0.05+(22-r)*0.012).toFixed(3)+')');}
  for(let y=-7;y<=7;y++){const hw=Math.round(Math.sqrt(49-y*y));R(LUNE.x-hw,LUNE.y+y,hw*2+1,1,'#f2eed8');R(LUNE.x+Math.max(0,hw-2),LUNE.y+y,Math.min(2,hw+1),1,'#d4cfb4');}
  [[-3,-2,2,2],[1,1,3,2],[-1,3,2,1],[2,-4,1,1]].forEach(m=>R(LUNE.x+m[0],LUNE.y+m[1],m[2],m[3],'#cdc7a8'));
}

/* LES COUCHES, pour que le fond vive : le ciel seul, les nuages qui
   derivent, et le decor avec son bassin. */
const copie=(src,h)=>{const c=document.createElement('canvas');c.width=M;c.height=h;c.getContext('2d').drawImage(src,0,0);return c;};
let gn=null;
if(couches){couches.ciel=copie(g.canvas,EAU);const cn=document.createElement('canvas');cn.width=M;cn.height=HZ;gn=cn.getContext('2d');G=gn;}
/* ---------- LES NUAGES : trois tons, le dessous plat ---------- */
const NU=nuit?['#56609a','#3a4274','#262d54']:(aube?['#ffd8c8','#e8a4a6','#8e7298']:(soir?['#ffe2c0','#f1aa92','#a87896']:['#ffffff','#e3edf6','#b4c8de']));
function nuage(cx,cy,l,graine){
  const bulles=[];const n=4+Math.floor(A(graine)*4);
  for(let i=0;i<n;i++){const u=i/(n-1)-0.5;bulles.push([cx+u*l+(A(graine+i*3.1)-0.5)*8,cy-(1-Math.abs(u)*1.6)*l*0.18-A(graine+i*5.3)*4,l*0.16+A(graine+i*7.7)*l*0.12]);}
  const bas=cy+3, x0=cx-l*0.75, x1=cx+l*0.75, y0=cy-l*0.6;
  for(let y=Math.floor(y0);y<=bas;y++)for(let x=Math.floor(x0);x<=x1;x++){
    let dedans=false,haut=99;
    for(const b of bulles){const dx=(x-b[0])/(b[2]*1.5),dy=(y-b[1])/b[2];if(dx*dx+dy*dy<=1){dedans=true;haut=Math.min(haut,(y-(b[1]-b[2]))/(b[2]*2));}}
    if(!dedans)continue;
    const v=haut+(bas-y<3?0.5:0)+(x-cx)/l*0.25;
    const tn=v<0.35?0:(v<0.7?1:2), nx=v<0.35?1:2;
    const frac=v<0.35?v/0.35:(v<0.7?(v-0.35)/0.35:1);
    R(x,y,1,1,NU[(frac>0.75&&seuil(x,y)<(frac-0.75)*4&&tn<2)?nx:tn]);
  }
}
[[150,28,70,1],[520,18,54,2],[860,40,46,3],[1090,22,64,4],[1420,30,58,5],[1690,16,44,6],[300,54,34,7],[1260,58,30,8]].forEach(n=>nuage(n[0],n[1],n[2],n[3]*11.3));
if(!nuit)for(let i=0;i<14;i++){const x=A(i*9.1)*M,y=6+A(i*4.4)*40,l=20+A(i*2.2)*60;R(x,y,l,1,soir?'rgba(255,220,190,.35)':'rgba(255,255,255,.30)');R(x+l*0.2,y+1,l*0.5,1,soir?'rgba(255,220,190,.18)':'rgba(255,255,255,.16)');}

if(couches){couches.nuages=gn.canvas;g.drawImage(gn.canvas,0,0);G=g;}
/* ---------- LE DECOR SE PEINT A PART, pour qu'on puisse l'eclairer ---------- */
const s=document.createElement('canvas');s.width=M;s.height=EAU;
const q=s.getContext('2d');
const qm=document.createElement('canvas').getContext('2d');qm.canvas.width=M;qm.canvas.height=EAU;   /* les monuments eclaires, a part */
let Q=q;
const P=(x,y,w,h,col)=>{Q.fillStyle=col;Q.fillRect(x|0,y|0,Math.max(1,w|0),Math.max(1,h|0));};
const px=(x,y,c)=>P(x,y,1,1,c);
const ligne=(x0,y0,x1,y1,c)=>{x0=Math.round(x0);y0=Math.round(y0);x1=Math.round(x1);y1=Math.round(y1);const dx=Math.abs(x1-x0),dy=-Math.abs(y1-y0),sx=x0<x1?1:-1,sy=y0<y1?1:-1;let e=dx+dy;for(let n=0;n<2000;n++){px(x0,y0,c);if(x0===x1&&y0===y1)break;const e2=2*e;if(e2>=dy){e+=dy;x0+=sx;}if(e2<=dx){e+=dx;y0+=sy;}}};
const sn=(v)=>(Math.sin(v)+1)/2;
const brume=(col,k)=>{const h=hex(col),b=hex(soir?'#e8a888':'#c6dbe8');return'rgb('+h.map((v,j)=>Math.round(v+(b[j]-v)*k)).join(',')+')';};

/* les chaines de collines, au plus loin : l'Estaque, l'Etoile, Marseilleveyre */
const crete1=x=>HZ-20-20*sn(x*0.0032+0.6)-9*sn(x*0.011+2.1)-3*sn(x*0.043);
for(let x=0;x<M;x++){
  const t=Math.round(crete1(x)), monte=crete1(x+4)<crete1(x);
  P(x,t,1,HZ-t,soir?'#8e7898':'#9aaec6');
  P(x,t,1,monte?4:1,soir?'#b28ea2':'#b6c5d6');
  if(A(x*0.37)<0.3)px(x,t+3+Math.floor(A(x*1.3)*8),soir?'#7e6a8c':'#8ea2bc');
}
/* la colline de la Garde, et les pentes ou grimpe la ville */
const garde=x=>{const u=(x-1540)/150;return 70+54*u*u;};
const crete2=x=>Math.min(HZ-9-4*sn(x*0.021)-3*sn(x*0.057),garde(x));
for(let x=600;x<M;x++){
  const t=Math.round(crete2(x));if(t>=HZ)continue;
  P(x,t,1,HZ-t,soir?'#7a5e66':'#7d8c72');
  P(x,t,1,1,soir?'#a87e78':'#9aa886');
  if(t<HZ-14){for(let y=t+2;y<HZ;y+=2){const r=A(x*1.7+y*3.3);
               if(r<0.16)P(x,y,2,2,soir?'#5e4652':'#5a6a52');else if(r<0.24)px(x,y,soir?'#94706c':'#93a07e');
               const cal=sn(x*0.09+y*0.31)*sn(x*0.023-y*0.17);if(cal>0.72&&A(x*3.1+y)<0.7)px(x,y,soir?'#c8a08c':'#cfcbb8');}}
}
/* les iles du Frioul, tout au bout */
for(let x=1640;x<M;x++){const t=Math.round(HZ-4-6*sn(x*0.05)*sn(x*0.013+1));P(x,t,1,HZ-t,soir?'#a68c9e':'#aebdcc');}

/* LA VILLE : quelques centaines de facades, des plus lointaines aux plus proches */
const FAC=[['#d2a45c','#dfb672','#b58646'],['#d08a72','#dca088','#b8705a'],['#d6c6a0','#e3d6b6','#bba986'],['#ba6e46','#c8845a','#a05836'],['#e4ddd0','#f0ebe2','#c2bbad'],['#c9c1b2','#d8d2c6','#aaa294']];
const imm=[];
for(let i=0;i<1100;i++){
  const x=600+A(i*1.91)*(M-600), haut=Math.max(crete2(x)+5,64);
  if(crete2(x)<74&&A(i*3.3)<0.75)continue;          /* le haut de la Garde reste en garrigue */
  imm.push({x,b:haut+Math.sqrt(A(i*2.7))*(HZ-2-haut),w:6+Math.floor(A(i*4.1)*10),h:4+Math.floor(A(i*5.9)*7),f:FAC[Math.floor(A(i*6.7)*FAC.length)],i});
}
imm.sort((a,b)=>a.b-b.b);
for(const m of imm){
  const k=Math.max(0,Math.min(0.55,(HZ-m.b)/70)), y=m.b-m.h, x=m.x|0;
  P(x,y,m.w,HZ-y,brume(m.f[0],k));
  P(x,y,m.w,1,brume(m.f[1],k));
  P(x+m.w-1,y,1,HZ-y,brume(m.f[2],k));
  if(m.i%3)P(x-1,y-1,m.w+2,1,brume(A(m.i)<0.5?'#ad542c':'#8f3f20',k));
  for(let wy=y+2;wy<m.b-1;wy+=3)for(let wx=x+1;wx<x+m.w-2;wx+=3){px(wx,wy,brume(A(wx*1.3+wy)<0.15?'#f0e4c0':'#5a4a40',k));
    /* LA NUIT, des immeubles entiers restent noirs, d'autres ont quelques fenetres
       allumees, rangees dans leur grille ; plus loin, plus faibles. */
    if(A(m.i*3.3)>0.35&&A(wx*2.9+wy*1.7)<allume(0.30)){const loin=k>0.3;
      lum(wx,wy,1,1,loin?['#b88a50','#c89a5c'][Math.floor(A(wx+wy)*2)]:['#ffd27a','#ffe2a0','#f4b860'][Math.floor(A(wx+wy*3)*3)],1);}}
}

/* le quai d'en face, sur lequel tout repose */
P(0,HZ-1,M,1,'#d8ccb0');P(0,HZ,M,2,'#8a7e68');
for(let x=12;x<M;x+=38+Math.floor(A(x*0.7)*14))if(A(x*1.9)<allume(1)*1.4)lum(x,HZ-3,1,1,'#ffb860');   /* les lampadaires du quai d'en face */
/* les villages de l'Estaque : quelques points au pied des collines, alignes sur la cote */
for(let x=4;x<620;x+=7+Math.floor(A(x*1.9)*9))if(A(x*4.3)<allume(0.7))lum(x,HZ-6-Math.floor(A(x*2.7)*3),1,1,A(x)<0.5?'#ffc880':'#e8b070');

/* ---------- LES CONTENEURS ---------- */
const CT=[['#2a5d9f','#3f78bd','#1d4475'],['#c23a2c','#d95646','#8e271e'],['#e8e4dc','#f6f3ee','#bdb8ae'],['#2f7d4f','#43a067','#215a38'],['#d9822b','#ee9c48','#a85f1a'],['#7a7f86','#959aa1','#5a5e64'],['#8a4b2c','#a8633f','#653620'],['#1f8a8a','#35a8a8','#156464'],['#d8c23a','#ecd85a','#a8941f'],['#4a3f7a','#655899','#332b57']];
function conteneur(x,y,w,c){
  P(x,y,w,5,c[0]);P(x,y,w,1,c[1]);P(x,y+4,w,1,c[2]);
  for(let i=1;i<w-1;i+=2)P(x+i,y+1,1,3,c[2]);
  P(x+w-1,y,1,5,c[2]);
}
function pile(x0,x1,base,maxT,graine){
  for(let x=x0;x<x1;){
    const w=A(x*0.7+graine)<0.7?12:6, t=1+Math.floor(A(x*1.3+graine)*maxT);
    for(let k=0;k<t;k++)conteneur(x,base-5*(k+1),w,CT[Math.floor(A(x*2.1+k*7.3+graine)*CT.length)]);
    x+=w+(A(x+graine)<0.12?4:0);
  }
}
pile(0,600,HZ-3,4,1);pile(0,140,HZ,3,2);

/* ---------- LE PORTE-CONTENEURS ---------- */
{
const x0=150,x1=560,pont=HZ-12;
for(let x=x0;x<x1;x++){
  const u=x-x0, t=u<16?pont+Math.round((16-u)*0.5)-4:pont;   /* l'etrave relevee */
  const b=u<16?HZ+1-Math.round((16-u)*0.4):HZ+1;
  if(u<16&&x<x0+4)continue;
  P(x,t,1,b-t,'#1c2a48');px(x,t,'#3c5280');
  P(x,b-2,1,2,'#a8322a');
}
P(x0+30,pont+4,26,1,'#e8ecf0');                 /* le nom, tout petit */
for(let x=x0+18;x<492;x+=13){
  const t=2+Math.floor(A(x*0.9)*4);
  for(let k=0;k<t;k++)conteneur(x,pont-5*(k+1),12,CT[Math.floor(A(x*3.7+k*5.1)*CT.length)]);
}
P(498,pont-40,30,40,'#eef0f2');P(524,pont-40,4,40,'#c2c9d1');P(495,pont-40,36,2,'#ffffff');
P(496,pont-37,34,2,'#28405e');
for(let y=pont-32;y<pont-2;y+=4)for(let x=500;x<522;x+=3){P(x,y,2,1,'#5a6f88');if(A(x*1.3+y)<allume(0.6))lum(x,y,2,1,'#ffe0a0');}
lum(497,pont-37,32,1,nuit?'#ffeec0':'rgba(0,0,0,0)');
for(let x=168;x<492;x+=26)if(nuit)lum(x,pont-1,1,1,'#fff6dc');   /* les feux de pont */
P(532,pont-46,9,46,'#1c2a48');P(532,pont-40,9,2,'#ffffff');P(532,pont-37,9,2,'#c23a2c');
ligne(512,pont-40,512,pont-52,'#c2c9d1');P(509,pont-50,7,1,'#c2c9d1');
}

/* ---------- LES PORTIQUES : bleus, ajoures, les fleches au-dessus du bassin ---------- */
const GR={p:'#3567a6',s:'#22497c',h:'#6a9ad2'};
function treillis(xa,ya,xb,yb,ep,c,c2){
  const L=Math.hypot(xb-xa,yb-ya),ux=(xb-xa)/L,uy=(yb-ya)/L,nx=-uy*ep,ny=ux*ep;
  ligne(xa,ya,xb,yb,c);ligne(xa+nx,ya+ny,xb+nx,yb+ny,c);
  for(let d=0,k=0;d<L-3;d+=4,k++){const a=k%2?0:1;ligne(xa+ux*d+nx*a,ya+uy*d+ny*a,xa+ux*(d+4)+nx*(1-a),ya+uy*(d+4)+ny*(1-a),c2);}
}
function portique(x0,releve,graine){
  const yT=HZ-64, l=28;
  for(const lx of [x0,x0+l]){P(lx,yT,3,HZ-yT,GR.p);P(lx,yT,1,HZ-yT,GR.h);P(lx+2,yT,1,HZ-yT,GR.s);P(lx-2,HZ-3,7,3,GR.s);}
  P(x0,HZ-24,l+3,2,GR.p);P(x0,HZ-24,l+3,1,GR.h);
  ligne(x0+2,HZ-23,x0+l,yT+2,GR.s);ligne(x0+l,HZ-23,x0+2,yT+2,GR.s);
  const ax=x0+l/2+1, ay=yT-22;
  ligne(x0+1,yT,ax,ay,GR.p);ligne(x0+l+1,yT,ax,ay,GR.p);ligne(ax,ay,ax,yT,GR.s);
  P(ax-1,ay-2,3,3,GR.p);px(ax,ay-3,'#e04030');
  treillis(x0-42,yT,x0+l+3,yT,3,GR.p,GR.s);
  P(x0-46,yT-6,10,8,'#d8dde3');P(x0-46,yT-6,10,1,'#ffffff');               /* le contrepoids */
  ligne(ax,ay,x0-40,yT,GR.s);
  P(x0+3,yT-8,l-4,7,'#eef1f4');P(x0+3,yT-8,l-4,1,'#ffffff');P(x0+l-2,yT-8,1,7,'#b9c2cc');
  P(x0+6,yT-5,l-10,1,'#7b8794');
  if(nuit){lum(x0+6,yT-5,l-10,1,'#ffe6a0');lum(ax,ay-3,1,1,'#ff3a2a');lum(x0+2,HZ-26,l,1,'rgba(255,230,170,.0)');}
  if(releve){
    treillis(x0+l+3,yT,x0+l+42,yT-56,3,GR.p,GR.s);
    ligne(ax,ay,x0+l+40,yT-54,GR.s);
    P(x0+l+39,yT-58,4,2,'#e04030');P(x0+l+39,yT-56,4,1,'#ffffff');if(nuit)lum(x0+l+40,yT-58,2,1,'#ff3a2a');
  }else{
    const bout=x0+l+64;
    treillis(x0+l+3,yT,bout,yT,3,GR.p,GR.s);
    ligne(ax,ay,x0+l+34,yT,GR.s);ligne(ax,ay,bout-2,yT,GR.s);
    P(bout-4,yT,4,4,'#e04030');P(bout-4,yT+1,4,1,'#ffffff');if(nuit){lum(bout-3,yT+1,2,2,'#ff3a2a');}
    /* le chariot, les cables et le palonnier ne sont plus graves : ils bougent (animerLesPortiques) */
  }
}
portique(60,true,1);portique(205,false,2);portique(350,false,3);portique(520,true,4);

/* ---------- LA TOUR CMA CGM : deux demi-tours de verre et l'ossature blanche ---------- */
{
const cx=660, VE=soir?['#f0b890','#b08098','#5e5a84','#3e3c66']:['#b6d6ee','#86b2dc','#5a8cbc','#3e6a98'];
for(let y=8;y<HZ;y++){
  const t=(y-8)/(HZ-8), wl=Math.round(11+6*Math.sin(Math.PI*Math.min(1,t*1.15)));
  for(let x=cx-wl;x<cx;x++){const v=Math.min(3,Math.floor(t*3.2+((x-cx+wl)/wl)*0.6+(seuil(x,y)-0.5)*0.6));px(x,y,VE[v]);}
  if(y>=22){const t2=(y-22)/(HZ-22), wr=Math.round(10+4*Math.sin(Math.PI*Math.min(1,t2*1.1)));
    for(let x=cx+2;x<cx+2+wr;x++){const v=Math.min(3,1+Math.floor(t2*2.4+(seuil(x,y)-0.5)*0.6));px(x,y,VE[v]);}
    px(cx+1+wr,y,'#2a3a54');}
  P(cx,y,2,1,'#22324a');
  px(cx-wl,y,'#eef2f5');
  if(y%4===0){P(cx-wl,y,wl,1,'rgba(30,50,80,.35)');P(cx+2,y,12,1,'rgba(30,50,80,.30)');}
  if(y%4===2&&nuit)for(let x=cx-wl+1;x<cx+12;x+=4)if(x!==cx&&x!==cx+1&&A(x*2.3+y*1.1)<0.55)lum(x,y,3,1,A(x+y)<0.7?'#cfe6ff':'#fff2c8');
}
for(let y=14;y<HZ;y+=10)ligne(cx-14,y,cx-2,y+10,'#e6ecf1');
P(cx-12,8,12,1,'#ffffff');P(cx+2,22,11,1,'#ffffff');if(nuit){lum(cx-12,8,12,1,'#bfe0ff');lum(cx-1,6,1,2,'#ff3a2a');}
}
/* La Marseillaise, ses brise-soleil bleu-blanc-rouge */
for(let x=692;x<716;x++)for(let y=30;y<HZ;y++){
  const band=Math.floor((y+Math.floor(A(x*0.7)*6))/7), r=A(x*3.1+band*11.7);
  px(x,y,x>=713?'#4a4a58':(r<0.34?'#c0392b':(r<0.62?'#2e5d93':(r<0.85?'#e9e4dc':'#9aa0a8'))));
}
P(691,29,26,1,'#d8d8d8');
for(let y=32;y<HZ-2;y+=3)for(let x=693;x<712;x+=2)if(A(x*3.3+y*1.9)<allume(0.3))lum(x,y,1,1,'#ffe2a0');
if(nuit)lum(703,27,1,2,'#ff3a2a');

/* Les Docks, la longue facade en pierre */
P(728,HZ-21,140,21,'#d8c8a6');P(728,HZ-21,140,1,'#efe2c4');P(728,HZ-22,140,1,'#a8967a');
for(let x=728;x<868;x+=35)P(x,HZ-21,2,21,'#c4b292');
for(const wy of [HZ-17,HZ-12])for(let x=732;x<866;x+=5){P(x,wy,2,3,'#4a4038');if(A(x*1.7+wy)<allume(0.55))lum(x,wy,2,3,A(x)<0.5?'#ffd890':'#ffeec4');}
for(let x=731;x<866;x+=7){P(x,HZ-6,4,6,'#3e3530');px(x,HZ-7,'#3e3530');px(x+3,HZ-7,'#3e3530');}
/* le silo d'Arenc */
P(878,HZ-34,32,34,'#d3cbbb');P(878,HZ-34,32,2,'#e8e2d6');
for(let x=880;x<910;x+=4)P(x,HZ-30,1,30,'#b7ae9e');P(906,HZ-34,4,34,'#b0a796');
P(878,HZ-26,32,2,'#5a5248');if(nuit)lum(893,HZ-35,1,1,'#ff3a2a');

/* ---------- LE FERRY, a la gare maritime ---------- */
{
const x0=930,x1=1098;
for(let x=x0;x<x1;x++){const u=x-x0, t=HZ-13+(u<18?Math.round((18-u)*0.15):0), b=HZ+1-(u<18?Math.round((18-u)*0.6):0);
  P(x,t,1,b-t,'#f2f3f1');P(x,HZ-4,1,2,'#2a4f8f');P(x,b-1,1,1,'#a8322a');}
for(let x=x0+12;x<x1-6;x+=3){px(x,HZ-9,'#2a3c58');if(A(x*2.1)<allume(0.8))lum(x,HZ-9,1,1,'#ffe8a8');}
const tiers=[[946,1090,HZ-21,HZ-13],[962,1082,HZ-28,HZ-21],[988,1062,HZ-34,HZ-28]];
for(const t of tiers){P(t[0],t[2],t[1]-t[0],t[3]-t[2],'#f6f7f5');P(t[0],t[2],t[1]-t[0],1,'#ffffff');P(t[1]-2,t[2],2,t[3]-t[2],'#c8ccd0');
  P(t[0]+2,t[2]+2,t[1]-t[0]-6,2,'#2c4060');for(let x=t[0]+3;x<t[1]-4;x+=4)px(x,t[2]+2,'#e8ecf0');
  for(let x=t[0]+2;x<t[1]-4;x+=2)if(A(x*1.9+t[2])<allume(0.85))lum(x,t[2]+2,2,2,'#fff0c4');}
if(nuit){lum(1000,HZ-45,1,1,'#ffffff');lum(1042,HZ-47,1,1,'#ff3a2a');for(let x=950;x<1086;x+=11)lum(x+2,HZ-20,2,1,'#ffcf80');}
for(let x=950;x<1086;x+=11){P(x,HZ-19,6,2,'#e8762a');px(x,HZ-20,'#ffffff');}
P(988,HZ-34,10,4,'#1e2c40');
P(1036,HZ-46,13,12,'#f6f7f5');P(1036,HZ-46,13,2,'#1a1a1a');P(1036,HZ-41,13,2,'#2a4f8f');P(1047,HZ-46,2,12,'#c8ccd0');
ligne(1000,HZ-34,1000,HZ-44,'#c8ccd0');P(997,HZ-42,7,1,'#c8ccd0');
}

Q=qm;
{
/* ---------- LA MAJOR : la cathedrale romano-byzantine, rayee vert et blanc ----------
   De gauche a droite : les deux tours de la facade et leurs petites coupoles,
   la nef et ses deux coupoles, la grande coupole sur son tambour a la
   croisee, puis le chevet et ses coupoles qui descendent. Le tout pose sur
   les voutes de l'esplanade. La lumiere vient de la gauche. */
const W=['#fbf6ea','#eee4cc','#d9cbaa','#b8a67e'], G=['#9cb49a','#6f8a72','#55705c','#435a4a'];
const DK='#2e2826', DK2='#4a3e38';
/* un mur raye : deux rangs de pierre blanche, un rang de marbre vert */
const raye=(x,y,w,h)=>{for(let j=0;j<h;j++){const yy=y+j, vert=((yy%3)+3)%3===2, C=vert?G:W;
  P(x,yy,w,1,C[1]);px(x,yy,C[0]);if(w>4){P(x+w-2,yy,2,1,C[2]);}if(w>8)P(x+w-1,yy,1,1,C[3]);}};
const corniche=(x,y,w)=>{P(x-1,y,w+2,1,W[0]);P(x-1,y+1,w+2,1,W[3]);};
const baie=(x,y,w,h,c)=>{P(x,y+1,w,h-1,c||DK);if(w>2)P(x+1,y,w-2,1,c||DK);P(x,y+h,w,1,W[0]);};
/* une coupole : rayee, nervuree, eclairee de gauche, un rien en ogive */
const coupole=(cx,base,r,lant)=>{
  const Hh=Math.round(r*1.12);
  for(let j=0;j<=Hh;j++){const t=j/Hh, hw=Math.max(1,Math.round(r*Math.sqrt(1-Math.pow(1-t,1.7)))), y=base-Hh+j;
    const vert=Math.floor(j/2)%2===1, C=vert?G:W;
    for(let x=-hw;x<=hw;x++){const u=x/hw, l=-u*0.75+(1-t)*0.35;
      let k=l>0.45?0:(l>0.0?1:(l>-0.45?2:3));
      const nerv=hw>3&&[-0.62,-0.22,0.22,0.62].some(n=>Math.abs(u-n)<0.5/hw);
      if(nerv)k=Math.min(3,k+1);
      px(cx+x,y,C[k]);}}
  P(cx-r,base,r*2+1,1,W[3]);
  if(lant){const lh=Math.max(3,Math.round(r*0.4));P(cx-1,base-Hh-lh,3,lh,W[1]);P(cx+1,base-Hh-lh,1,lh,W[2]);
    P(cx-2,base-Hh-lh-1,5,1,G[1]);px(cx,base-Hh-lh-2,W[0]);
    P(cx,base-Hh-lh-6,1,4,'#7a6a50');P(cx-1,base-Hh-lh-5,3,1,'#7a6a50');}
};
/* un tambour : le cylindre sous la coupole, perce de baies */
const tambour=(cx,base,r,h)=>{raye(cx-r,base-h,r*2+1,h);for(let x=cx-r+2;x<cx+r-1;x+=4)baie(x,base-h+2,2,h-4);corniche(cx-r,base-h-1,r*2+1);};
const x0=1092, sol=HZ-12;
/* la grande coupole de la croisee, au fond */
tambour(x0+120,sol-24,15,11);coupole(x0+120,sol-36,16,true);
/* les bras du transept, un peu plus hauts que la nef */
raye(x0+100,sol-28,40,28);corniche(x0+100,sol-29,40);
for(let x=x0+104;x<x0+137;x+=6)baie(x,sol-23,3,9);
P(x0+116,sol-34,9,6,W[1]);P(x0+117,sol-35,7,1,W[0]);px(x0+120,sol-33,DK);   /* le fronton et son oculus */
/* la nef */
raye(x0+44,sol-22,58,22);corniche(x0+44,sol-23,58);
for(let x=x0+47;x<x0+100;x+=7){baie(x,sol-18,3,8);P(x-1,sol-6,5,1,W[2]);}
for(let x=x0+45;x<x0+101;x+=2)px(x,sol-21,DK2);                               /* la galerie d'arcatures */
tambour(x0+60,sol-23,5,4);coupole(x0+60,sol-28,6,true);
tambour(x0+84,sol-23,5,4);coupole(x0+84,sol-28,6,true);
/* le chevet : l'abside et ses coupoles qui descendent */
raye(x0+140,sol-20,22,20);corniche(x0+140,sol-21,22);for(let x=x0+143;x<x0+160;x+=5)baie(x,sol-16,2,7);
tambour(x0+150,sol-21,5,3);coupole(x0+150,sol-25,7,true);
raye(x0+162,sol-13,12,13);corniche(x0+162,sol-14,12);coupole(x0+168,sol-15,5,true);
/* la facade et ses deux tours */
raye(x0+20,sol-30,24,30);corniche(x0+20,sol-31,24);
for(let k=0;k<5;k++)P(x0+32-k*2,sol-36+k,k*4+1,1,k%2?G[1]:W[1]);            /* le pignon */
P(x0+27,sol-22,10,22,W[2]);baie(x0+28,sol-21,8,20,DK);P(x0+31,sol-20,2,2,'#c89a50');   /* le grand portail */
P(x0+26,sol-25,12,2,W[0]);
for(const tx of [x0+6,x0+44-6-8]){
  const tw=14, th=50;
  raye(tx,sol-th,tw,th);corniche(tx,sol-th-1,tw);corniche(tx,sol-th+14,tw);
  baie(tx+3,sol-th+3,3,9);baie(tx+8,sol-th+3,3,9);                          /* le beffroi */
  baie(tx+5,sol-th+20,4,10);baie(tx+5,sol-14,4,8);
  for(const cx of [tx,tx+tw-1]){P(cx,sol-th-4,1,3,W[1]);px(cx,sol-th-5,W[0]);}   /* les pinacles */
  coupole(tx+7,sol-th-2,6,true);
}
/* les voutes de l'esplanade, au pied de la cathedrale */
P(x0-4,sol,184,12,W[2]);P(x0-4,sol,184,1,W[0]);P(x0-4,sol+1,184,1,W[3]);
for(let x=x0-2;x<x0+178;x+=8){P(x+1,sol+5,5,7,'#6a5a4c');P(x+2,sol+4,3,1,'#6a5a4c');P(x+1,sol+5,1,7,'#4e4238');P(x+6,sol+3,2,9,W[1]);px(x+6,sol+3,W[0]);}
for(let x=x0-4;x<x0+180;x+=2)px(x,sol-1,W[1]);                                 /* la balustrade */
if(nuit)for(let x=x0+2;x<x0+176;x+=8)lum(x+1,sol+6,4,4,'#e8a050');
}

/* ---------- LE FORT SAINT-JEAN ---------- */
{
const PI=['#cdb48a','#e2cca2','#a8916a'];
P(1270,HZ-15,100,15,PI[0]);P(1270,HZ-15,100,1,PI[1]);for(let y=HZ-12;y<HZ;y+=3)for(let x=1270+(y%2)*3;x<1370;x+=7)P(x,y,4,1,PI[2]);
for(let x=1270;x<1370;x+=4)P(x,HZ-17,2,2,PI[0]);
P(1282,HZ-36,18,21,PI[0]);P(1282,HZ-36,18,1,PI[1]);P(1298,HZ-36,2,21,PI[2]);
for(let x=1281;x<1301;x+=3)P(x,HZ-38,2,2,PI[0]);P(1281,HZ-34,20,1,'#7a6648');
P(1289,HZ-28,1,4,'#4a3c2c');P(1293,HZ-22,1,4,'#4a3c2c');
P(1350,HZ-33,10,18,PI[0]);P(1350,HZ-33,1,18,PI[1]);P(1358,HZ-33,2,18,PI[2]);
P(1352,HZ-39,6,6,PI[1]);P(1353,HZ-37,4,2,'#4a3c2c');P(1351,HZ-40,8,1,PI[2]);
}
/* ---------- LE MUCEM, sa resille de beton ---------- */
{
P(1386,HZ-25,72,25,'#2e3034');
for(let y=HZ-24;y<HZ;y++)for(let x=1387;x<1457;x++){
  const a=((x+Math.round(1.2*Math.sin(y*0.7+x*0.4)))%5+5)%5===0, b=((y+Math.round(1.2*Math.sin(x*0.55+y*0.2)))%5+5)%5===0;
  if(a||b)px(x,y,(A(x*1.3+y*2.1)<0.5)?'#a0948a':'#857a70');
  else if(A(x*1.7+y*3.1)<0.10)px(x,y,'#6a6058');
}
P(1386,HZ-25,72,1,'#a89c8e');P(1456,HZ-25,2,25,'#2a2c30');
ligne(1366,HZ-17,1392,HZ-26,'#5b534c');ligne(1366,HZ-16,1392,HZ-25,'#3a3530');
}
if(nuit){for(let x=1277;x<1372;x+=18)lum(x,HZ-1,1,1,'#fff2c0');for(let x=1505;x<1572;x+=18)lum(x,HZ-1,1,1,'#fff2c0');}   /* les projecteurs des forts */
/* le fort Saint-Nicolas, de l'autre cote de la passe */
P(1500,HZ-11,70,11,'#c6ad84');P(1500,HZ-11,70,1,'#dcc6a0');for(let x=1500;x<1570;x+=4)P(x,HZ-13,2,2,'#c6ad84');

/* ---------- NOTRE-DAME DE LA GARDE, la Bonne Mere ----------
   Sur son rocher : les remparts du vieux fort, la basilique rayee et sa
   coupole, et le clocher carre qui porte la Vierge doree a l'Enfant,
   tournee vers la mer. La lumiere vient de la gauche. */
{
const cx=1540, sol=Math.round(garde(cx));
const W=['#fbf6ea','#ece2c8','#d4c5a2','#b09c74'], G=['#9cb49a','#6f8a72','#55705c','#435a4a'];
const DK='#2e2826';
const raye=(x,y,w,h)=>{for(let j=0;j<h;j++){const yy=y+j, vert=((yy%3)+3)%3===2, C=vert?G:W;P(x,yy,w,1,C[1]);px(x,yy,C[0]);if(w>4)P(x+w-2,yy,2,1,C[2]);}};
const corniche=(x,y,w)=>{P(x-1,y,w+2,1,W[0]);P(x-1,y+1,w+2,1,W[3]);};
const baie=(x,y,w,h)=>{P(x,y+1,w,h-1,DK);if(w>2)P(x+1,y,w-2,1,DK);};
/* le rocher calcaire sous le fort : des falaises en strates, de la garrigue */
Q=q;   /* le rocher n'est pas eclaire la nuit : seul le monument l'est */
for(let x=cx-30;x<=cx+30;x++){const u=(x-cx)/30, top=sol+1+Math.round(u*u*7), bas=sol+9+Math.round(Math.abs(u)*5)-Math.round(A(x*0.7)*3);
  for(let y=top;y<bas;y++){const r=A(x*1.7+y*2.3), strate=((y+Math.floor(x/7))%3===0);
    let c=y===top?'#f2ead6':(u>0.25?(strate?'#b4aa90':'#c8bea4'):(strate?'#c9bfa5':'#ded5bd'));
    if(r<0.07)c='#8e846c';if(r>0.9&&y>top+1)c='#6f7d5c';px(x,y,c);}}
Q=qm;
/* les remparts et les bastions */
const R0=sol+2;
P(cx-34,R0-10,68,10,W[2]);P(cx-34,R0-10,68,1,W[0]);P(cx-34,R0-9,68,1,W[1]);
for(let x=cx-34;x<cx+34;x+=3)P(x,R0-12,2,2,W[1]);                               /* les creneaux */
for(let y=R0-8;y<R0;y+=2)for(let x=cx-33+((y>>1)%2)*3;x<cx+33;x+=6)P(x,y,4,1,W[3]);   /* l'appareil */
P(cx+26,R0-10,8,10,W[3]);                                                         /* le flanc a l'ombre */
P(cx-40,R0-6,8,6,W[2]);P(cx-40,R0-6,8,1,W[0]);P(cx+32,R0-6,8,6,W[3]);          /* les bastions bas */
baie(cx-4,R0-7,5,7);P(cx-5,R0-8,7,1,W[0]);                                       /* la porte du fort */
for(let k=0;k<6;k++)P(cx-30+k*3,R0+2+k,4,1,'#cfc5ac');                           /* la rampe qui monte */
/* la basilique : la nef rayee a droite du clocher */
const nb=R0-10;
raye(cx-2,nb-14,26,14);corniche(cx-2,nb-15,26);
for(let x=cx+1;x<cx+22;x+=5)baie(x,nb-11,2,6);
raye(cx+24,nb-9,6,9);P(cx+29,nb-9,1,9,W[3]);                                      /* le chevet */
/* la coupole, sur son tambour */
raye(cx+7,nb-19,11,4);corniche(cx+7,nb-20,11);for(let x=cx+9;x<cx+17;x+=3)px(x,nb-17,DK);
{const ccx=cx+12, b=nb-20, r=6, Hh=7;
 for(let j=0;j<=Hh;j++){const t=j/Hh, hw=Math.max(1,Math.round(r*Math.sqrt(1-Math.pow(1-t,1.7)))), y=b-Hh+j, C=Math.floor(j/2)%2?G:W;
   for(let x=-hw;x<=hw;x++){const l=-x/hw*0.75+(1-t)*0.3;px(ccx+x,y,C[l>0.45?0:(l>0?1:(l>-0.45?2:3))]);}}
 P(ccx-1,b-Hh-3,3,3,W[1]);px(ccx,b-Hh-4,W[0]);P(ccx,b-Hh-7,1,3,'#c89a3a');P(ccx-1,b-Hh-6,3,1,'#c89a3a');}
/* LE CLOCHER : carre, rayé, le beffroi et ses grandes baies, la balustrade */
const tx=cx-13, tw=12, tb=R0-10, tt=tb-31;
raye(tx,tt,tw,tb-tt);
corniche(tx,tt+12,tw);corniche(tx,tt+21,tw);
baie(tx+3,tt+23,6,7);P(tx+5,tt+23,2,7,W[2]);                                    /* la grande baie basse */
baie(tx+2,tt+3,3,8);baie(tx+7,tt+3,3,8);                                         /* le beffroi */
P(tx+1,tt+11,tw-2,1,W[3]);
corniche(tx,tt-1,tw);for(let x=tx-1;x<tx+tw+1;x+=2)px(x,tt-2,W[1]);               /* la balustrade */
/* le piedestal octogonal de la statue */
const pc=tx+6;
P(pc-4,tt-8,8,6,W[1]);px(pc-4,tt-8,W[0]);P(pc+2,tt-8,2,6,W[2]);
for(let x=pc-3;x<pc+3;x+=2)P(x,tt-7,1,4,W[3]);
P(pc-5,tt-9,10,1,W[0]);P(pc-3,tt-11,6,2,W[1]);P(pc+1,tt-11,2,2,W[2]);
/* LA BONNE MERE : la Vierge doree, l'Enfant sur le bras, tournee vers la mer */
{const OR={'0':'#fff4c0','1':'#f2c94e','2':'#cf9a2c','3':'#8e6018'}, sb=tt-11;
 const M=['...0...','..011..','..112..','.01122.','0011122','0111122','.011122','..11122','..11223','..11223','.011223','.011223','.111223','0111223','1122233'];
 const top=sb-M.length;
 M.forEach((r,j)=>{for(let i=0;i<7;i++){const ch=r[i];if(ch!=='.')px(pc-3+i,top+j,OR[ch]);}});
 if(!nuit){px(pc-1,top+1,'#ffffff');px(pc-2,top+5,'#ffffff');}

}
}

Q=q;
/* ---------- LA LUMIERE DU MOMENT SUR LE DECOR ----------
   Le soir : rasante et chaude, le contre-jour sous le soleil.
   L'aube : rose et mauve, le contre-jour a l'est.
   La nuit : tout plonge dans le bleu, sauf ce que Marseille eclaire —
   la Bonne Mere, La Major, le fort, et le MuCEM allume de l'interieur. */
const teinter=(cv,monu)=>{
  const im=cv.getImageData(0,0,M,EAU),dd=im.data;
  for(let o=0;o<dd.length;o+=4){if(!dd[o+3])continue;
    const i=o/4, x=i%M, y=(i-x)/M;
    if(nuit){
      const som=dd[o]+dd[o+1]+dd[o+2];
      if(monu&&x>=1386&&x<1458){   /* le MuCEM : la resille en ombre chinoise sur l'interieur allume */
        if(som<200){const v=(y-(HZ-25))/25;dd[o]=118+v*26;dd[o+1]=76+v*16;dd[o+2]=42;}else{dd[o]=34;dd[o+1]=28;dd[o+2]=30;}continue;}
      /* LES PROJECTEURS eclairent par en bas : le pied est dore, le haut retombe dans la nuit */
      if(monu&&som>380){let f=0.42+0.58*Math.min(1,Math.max(0,y/HZ));
        /* LES FORTS : des projecteurs espaces au pied du mur, chacun son cone de lumiere */
        const fort=(x>=1268&&x<1376)||(x>=1496&&x<1574);
        if(fort){const x0=x<1400?1268:1496, k=Math.round((x-x0-9)/18), sx=x0+9+k*18, h=Math.max(0,HZ-y);
          const cone=Math.exp(-Math.pow((x-sx)/(4+h*0.35),2))*Math.exp(-h/34);
          f=0.30+0.85*cone;}
        dd[o]=Math.min(255,dd[o]*0.80*f+22);dd[o+1]=dd[o+1]*0.64*f+14;dd[o+2]=dd[o+2]*0.40*f+18;continue;}
      if(monu){dd[o]=dd[o]*0.42+20;dd[o+1]=dd[o+1]*0.36+14;dd[o+2]=dd[o+2]*0.34+16;continue;}
      dd[o]=dd[o]*0.20+6;dd[o+1]=dd[o+1]*0.25+10;dd[o+2]=dd[o+2]*0.40+26;
    }else if(aube){
      const prox=Math.exp(-Math.pow((x-SOLEIL.x)/320,2));
      dd[o]=Math.min(255,dd[o]*0.82+30);dd[o+1]=dd[o+1]*0.70+16;dd[o+2]=Math.min(255,dd[o+2]*0.74+36);
      if(prox>0.2){dd[o]*=1-prox*0.42;dd[o+1]*=1-prox*0.48;dd[o+2]*=1-prox*0.36;}
    }else{
      const prox=Math.exp(-Math.pow((x-SOLEIL.x)/300,2));
      dd[o]=Math.min(255,dd[o]*0.86+34);dd[o+1]=dd[o+1]*0.72+12;dd[o+2]=dd[o+2]*0.66+22;
      if(prox>0.2){dd[o]*=1-prox*0.45;dd[o+1]*=1-prox*0.5;dd[o+2]*=1-prox*0.4;}
    }
  }
  cv.putImageData(im,0,0);
};
if(ambiance!=='jour'){teinter(q,false);teinter(qm,true);}
q.drawImage(qm.canvas,0,0);
/* les lumieres, par-dessus la teinte : un petit halo, puis le point.
   Celles de la ville sont derriere les monuments : on ne les voit pas a travers. */
const DEVANT=[[150,560,HZ-62],[638,682,6],[690,717,28],[727,869,HZ-22],[877,911,HZ-35],[928,1100,HZ-48],[1086,1276,HZ-80],[1496,1584,0],[1268,1374,HZ-42],[1364,1460,HZ-27],[1498,1572,HZ-14]];
for(const l of LUM){if(l[5]&&DEVANT.some(d=>l[0]>=d[0]&&l[0]<d[1]&&l[1]>=d[2]))continue;if(l[4].indexOf('rgba(0,0,0,0)')===0||l[4].indexOf(',.0)')>0)continue;
  if(nuit&&(l[2]>1||l[4]==='#ff3a2a')){q.fillStyle=l[4]==='#ff3a2a'?'rgba(255,70,50,.22)':'rgba(255,200,120,.16)';q.fillRect(l[0]-1,l[1]-1,l[2]+2,l[3]+2);}
  P(l[0],l[1],l[2],l[3],l[4]);}
g.drawImage(s,0,0);

/* les goelands (ils volent, quand le fond vit) */
if(!nuit&&!couches)for(let i=0;i<9;i++){const x=Math.round(80+A(i*13.1)*(M-160)),y=Math.round(12+A(i*7.9)*50);
  R(x,y,1,1,soir?'#3a2c38':'#5a6270');R(x+4,y,1,1,soir?'#3a2c38':'#5a6270');R(x+1,y+1,3,1,soir?'#ffe6d0':'#ffffff');if(i%2)R(x+2,y+2,1,1,soir?'#c8a090':'#c8d0d8');}

/* ---------- LE BASSIN : le reflet de tout ce qui est au-dessus, tremble ---------- */
for(let y=HZ+2;y<EAU;y++){
  const k=y-(HZ+2), src=Math.max(0,HZ-1-Math.round(k*1.25));
  const dx=Math.round(Math.sin(y*0.9)*1.6+Math.sin(y*0.37+1)*1.2);
  g.drawImage(g.canvas,0,src,M,1,dx,y,M,1);
}
{
const fond=g.createLinearGradient(0,HZ+2,0,EAU);
fond.addColorStop(0,nuit?'rgba(6,10,30,.78)':(aube?'rgba(96,72,120,.74)':(soir?'rgba(70,50,96,.74)':'rgba(36,104,148,.74)')));   /* le reflet n'est plus qu'un souvenir */
fond.addColorStop(1,nuit?'rgba(4,8,24,.90)':(aube?'rgba(52,42,92,.88)':(soir?'rgba(40,30,70,.88)':'rgba(20,70,116,.88)')));
g.fillStyle=fond;g.fillRect(0,HZ+2,M,EAU-HZ-2);
}
for(let i=0;i<1600;i++){
  const x=A(i*2.3+40)*M, y=HZ+3+Math.floor(A(i*3.9+70)*(EAU-HZ-4)), l=2+Math.floor(A(i*5.7)*6);
  R(x,y,l,1,i%3?(nuit?'rgba(120,140,200,.10)':(aube?'rgba(255,196,196,.16)':(soir?'rgba(255,200,150,.18)':'rgba(190,230,245,.20)'))):'rgba(8,30,56,.14)');
}
if(SOLEIL)for(let i=0;i<500;i++){
  const y=HZ+3+Math.floor(A(i*4.1+9)*(EAU-HZ-4)), sp=10+(y-HZ)*2.2, x=SOLEIL.x+(A(i*6.3)-0.5)*2*sp;
  R(x,y,2+A(i)*5,1,(aube?'rgba(255,214,190,':'rgba(255,226,150,')+(0.25+A(i*8.8)*0.5).toFixed(2)+')');
}
if(nuit){
  /* le chemin de lune */
  for(let i=0;i<260;i++){const y=HZ+3+Math.floor(A(i*4.7+3)*(EAU-HZ-4)), sp=4+(y-HZ)*0.9, x=LUNE.x+(A(i*6.9)-0.5)*2*sp;
    R(x,y,1+A(i)*3,1,'rgba(230,232,210,'+(0.12+A(i*8.1)*0.28).toFixed(2)+')');}
  /* chaque lumiere du bord jette son trait tremblant dans le bassin */
  for(const l of LUM){if(l[1]<HZ-36||A(l[0]*1.3+l[1])>((l[2]>1||l[4]==='#ff3a2a')?0.35:0.015))continue;
    const c=hex(l[4].length===7?l[4]:'#ffd890');
    for(let y=HZ+3;y<EAU;y+=2){const u=(y-HZ)/(EAU-HZ), a=0.28*(1-u);if(A(l[0]+y*1.7)<0.4)continue;
      R(l[0]+Math.round(Math.sin(y*0.9+l[0])*1.5),y,1+Math.floor(A(y+l[0])*2),1,'rgba('+c.join(',')+','+a.toFixed(2)+')');}}
}
R(0,HZ+2,M,1,'rgba(10,20,30,.35)');

/* la margelle de notre quai, au bord du bassin */
R(0,EAU,M,6,'#c7b792');R(0,EAU,M,1,'#4a5a62');R(0,EAU+1,M,1,'#efe3c4');R(0,EAU+5,M,1,'#a8976e');
for(let x=0;x<M;x+=46+Math.floor(A(x)*20))R(x,EAU+1,1,5,'#a8976e');
if(couches){
  const d=document.createElement('canvas');d.width=M;d.height=EAU;const dg=d.getContext('2d');
  dg.drawImage(s,0,0);dg.drawImage(g.canvas,0,HZ+2,M,EAU-HZ-2,0,HZ+2,M,EAU-HZ-2);
  couches.decor=d;couches.HZ=HZ;couches.EAU=EAU;couches.amb=ambiance;
  couches.rouges=LUM.filter(l=>l[4]==='#ff3a2a').map(l=>[l[0],l[1],l[2],l[3]]);
  couches.soleil=SOLEIL;couches.lune=nuit?LUNE:null;
}
}
const AMBIANCE_PORT='jour';
/* ================= L'HEURE DU PORT =================
   Le fond suit l'heure du monde, la meme que la lumiere du jeu : l'aube
   rose, le plein jour, le couchant derriere les portiques, puis la nuit,
   la Bonne Mere eclairee et les lumieres de la Joliette dans le bassin.
   Entre deux moments, les deux images se fondent l'une dans l'autre.
   Le bandeau se pose APRES la lumiere du moment : il porte deja la sienne. */
const PANO={};
function couchesDuPort(a){if(!PANO[a]){const k={}, c=document.createElement('canvas');c.width=MONDE_L;c.height=146;
graverLePortAutonome(c.getContext('2d'),a,k);PANO[a]=k;}return PANO[a];}
function panoramaDuPort(a){return couchesDuPort(a).decor;}
const HEURES_PORT=[[0,'nuit'],[5.0,'nuit'],[6.3,'aube'],[7.2,'aube'],[8.6,'jour'],[17.2,'jour'],[18.6,'soir'],[19.9,'soir'],[21.2,'nuit'],[24,'nuit']];
function heureDuPort(){
let h=12;
try{if(typeof REG!=='undefined'&&REG.ciel==='jour')return['jour','jour',0];
const m=(typeof minuteDuJour==='function')?minuteDuJour():null;
if(m===null){const d=new Date();h=d.getHours()+d.getMinutes()/60;}else h=m/60;}catch(x){}
for(let i=0;i<HEURES_PORT.length-1;i++){const a=HEURES_PORT[i],b=HEURES_PORT[i+1];
if(h>=a[0]&&h<=b[0]){const t=(h-a[0])/Math.max(0.001,b[0]-a[0]);return[a[1],b[1],t*t*(3-2*t)];}}
return['nuit','nuit',0];
}
/* ================= LE FOND QUI VIT =================
   Chaque image, on recompose la petite part du fond qui est a l'ecran
   (cent a deux cents pixels de large : rien a payer) :
     — les nuages derivent lentement vers l'est, derriere la ville ;
     — le bassin ondule, rang par rang, et le soleil (ou la lune) y scintille ;
     — la nuit, les feux rouges des portiques et des tours clignotent ;
     — des goelands passent, et une pilotine fait la navette dans le bassin.
   Entre deux moments de la journee, on compose les deux et on les fond. */
const TAMPONS=[null,null];
function tampon(i,w,h){let c=TAMPONS[i];if(!c){c=TAMPONS[i]=document.createElement('canvas');}
if(c.width<w||c.height<h){c.width=Math.max(c.width,w);c.height=Math.max(c.height,h);}const q=c.getContext('2d');q.imageSmoothingEnabled=false;q.clearRect(0,0,c.width,c.height);return c;}
function composerLePort(K,i,x0,w,T){
const M=MONDE_L, H=K.EAU, c=tampon(i,w,H), q=c.getContext('2d');
q.drawImage(K.ciel,x0,0,w,H,0,0,w,H);
/* les nuages : une bande qui fait le tour du monde */
const off=((T*1.6)%M+M)%M;
for(const k of [0,-1,1]){const dx=off+k*M-x0;if(dx>w||dx+M<0)continue;q.drawImage(K.nuages,dx,0);}
const HZ=K.HZ;
q.drawImage(K.decor,x0,0,w,HZ+2,0,0,w,HZ+2);
for(let y=HZ+2;y<H;y++){const u=(y-HZ)/(H-HZ), dx=Math.round(Math.sin(T*1.4+y*0.75)*(0.6+u*1.2));
  q.drawImage(K.decor,x0,y,w,1,dx,y,w,1);if(dx>0)q.drawImage(K.decor,x0,y,1,1,0,y,dx,1);}
/* PLUS DE SCINTILLEMENTS : poses dans le cadre de l'ecran et non dans le monde, ils restaient colles a l'ecran quand on marchait. */
const nuit=K.amb==='nuit';
/* les feux qui clignotent */
if(nuit)for(let j=0;j<K.rouges.length;j++){const l=K.rouges[j], x=l[0]-x0;if(x<-3||x>w+3)continue;
  const on=Math.floor(T*0.9+j*0.37)%2===0;
  q.fillStyle=on?'rgba(255,70,50,.35)':'#121a34';q.fillRect(x-1,l[1]-1,l[2]+2,l[3]+2);
  if(on){q.fillStyle='#ff4a36';q.fillRect(x,l[1],l[2],l[3]);}}
return c;
}
const GOELAND_G={
plane:['..GG.......GG..',
       '.GGGG.....GGGG.',
       'DgG..GWWWG..GgD',
       'D.....wWWEY...D',
       '.......ww......'],
milieu:['...............',
        '.GGGG.....GGGG.',
        'DGGgGGWWWGGgGGD',
        '......wWWEY....',
        '.......ww......'],
haut:['DD...........DD',
      '.GG.........GG.',
      '..GG.......GG..',
      '...gGGWWWGGg...',
      '......wWWEY....',
      '.......ww......'],
bas:['...............',
     '......WWW......',
     '....GGWWWEY....',
     '..GGg.www.gGG..',
     '.GG.........GG.',
     'DD...........DD']};
const GOELAND_P={
plane:['.GG...GG.','DG.GWG.GD','....wY...'],
milieu:['.........','DGGGWGGGD','....wY...'],
haut:['D.......D','.G.....G.','..GGWGG..','....wY...'],
bas:['...GWY...','.GG.w.GG.','D.......D']};
function animerLePort(ctx,amb,camX,camY,lw,h,T){
const M=MONDE_L, HZ=108, EAU=140;
ctx.save();ctx.translate(-camX,-camY);
ctx.beginPath();ctx.rect(camX,camY,lw,h);ctx.clip();
/* LES GOELANDS, dessines au pixel : le corps blanc, la tete et son bec
   jaune vers la ou ils vont, les ailes grises en M aux bouts noirs. Ils
   planent longtemps, puis battent trois fois des ailes. Les plus proches
   sont plus grands, les lointains plus petits et plus haut. */
if(amb!=='nuit'){
  const PAL=amb==='jour'?{W:'#ffffff',w:'#d6dce3',G:'#bcc5cf',g:'#97a2ae',D:'#24262a',E:'#24262a',Y:'#e8a820'}
                        :{W:'#ffe4cc',w:'#d8b4a8',G:'#b89aa6',g:'#8e7484',D:'#2e2228',E:'#2e2228',Y:'#e89a40'};
  const peindre=(spr,X,Y,versGauche)=>{const h=spr.length, w=spr[0].length, x0=Math.round(X-w/2), y0=Math.round(Y-h/2);
    for(let j=0;j<h;j++)for(let i=0;i<w;i++){const ch=spr[j][versGauche?w-1-i:i];if(ch==='.')continue;ctx.fillStyle=PAL[ch];ctx.fillRect(x0+i,y0+j,1,1);}};
  for(let i=0;i<7;i++){
    const grand=i<3, SP=grand?GOELAND_G:GOELAND_P;
    const v=(grand?11:6)+alea(i*3.3)*7, dir=i%2?1:-1, x=((alea(i*5.7)*M+dir*T*v)%M+M)%M;
    const y=Math.round((grand?24:8)+alea(i*9.1)*(grand?26:30)+Math.sin(T*0.35+i*1.7)*4);   /* dans le ciel, au-dessus des toits */
    if(x<camX-10||x>camX+lw+10)continue;
    /* le cycle : douze temps de plane, puis trois battements (milieu, haut, milieu, bas) */
    const t=(T*7+i*5.3)%24, k=Math.floor(t);
    const fr=k<12?'plane':['milieu','haut','milieu','bas'][(k-12)%4];
    peindre(SP[fr],x,y,dir<0);
  }
}
/* LES PORTIQUES TRAVAILLENT. Le chariot court sous la fleche, va chercher
   un conteneur sur le porte-conteneurs, le remonte, rentre entre les pieds
   et le pose sur le quai. Un cavalier arrive, l'enjambe, le leve et
   l'emmene. Un cycle de quarante secondes, decale d'un portique a l'autre. */
animerLesPortiques(ctx,amb,T,camX,lw);
/* LA PILOTINE : elle traverse le bassin en un peu plus de trois minutes, et revient */
{const per=200, u=(T%(per*2))/per, aller=u<1, k=aller?u:2-u, x=Math.round(-40+k*(M+80)), y=HZ+19, d=aller?1:-1;
 if(x>camX-60&&x<camX+lw+60){
  const nuit=amb==='nuit';
  const coque=nuit?'#1a1e2e':'#c8402c', bord=nuit?'#2a2e40':'#1c2230', cab=nuit?'#3a4058':(amb==='jour'?'#f2f2ee':'#f0d6c4');
  for(let s=1;s<=22;s++){const a=(1-s/22)*0.5;ctx.fillStyle='rgba(255,255,255,'+(nuit?a*0.4:a).toFixed(2)+')';
    ctx.fillRect(x-d*(10+s),y+3+((s+Math.floor(T*6))%3===0?0:1),1,1);if(s<12){ctx.fillRect(x-d*(10+s),y+5+Math.floor(s/4),1,1);}}
  ctx.fillStyle=bord;ctx.fillRect(x-10,y+2,20,3);
  ctx.fillStyle=coque;ctx.fillRect(x-10,y,20,2);ctx.fillRect(x+d*10,y,d>0?2:-2,2);
  ctx.fillStyle=cab;ctx.fillRect(x-4-d*2,y-4,8,4);
  ctx.fillStyle=nuit?'#ffe6a0':'#2a3c58';ctx.fillRect(x-3-d*2,y-3,6,1);
  ctx.fillStyle=nuit?'#c8ccd0':'#1c2230';ctx.fillRect(x-d*2,y-7,1,3);
  if(nuit){ctx.fillStyle='#ff4a36';ctx.fillRect(x-d*8,y-1,1,1);ctx.fillStyle='#4aff8a';ctx.fillRect(x+d*8,y-1,1,1);ctx.fillStyle='#ffffff';ctx.fillRect(x-d*2,y-8,1,1);}
  ctx.fillStyle='rgba(255,255,255,.55)';ctx.fillRect(x+d*11,y+4,2,1);
 }}
ctx.restore();
}

const CT_ANIM=[['#2a5d9f','#3f78bd','#1d4475'],['#c23a2c','#d95646','#8e271e'],['#e8e4dc','#f6f3ee','#bdb8ae'],['#2f7d4f','#43a067','#215a38'],['#d9822b','#ee9c48','#a85f1a'],['#7a7f86','#959aa1','#5a5e64']];
function animerLesPortiques(ctx,amb,T,camX,lw){
const HZ=108, yT=HZ-64, l=28, pont=HZ-12, nuit=amb==='nuit';
const A=(i)=>alea(i*1.37+0.5);
const ombre=nuit?0.45:(amb==='jour'?0:0.18);
const fonce=(c)=>{if(!ombre)return c;const n=parseInt(c.slice(1),16),f=v=>Math.round(v*(1-ombre)+ (nuit?18:40)*ombre);
  return 'rgb('+f(n>>16&255)+','+f(n>>8&255)+','+f(n&255)+')';};
const R=(x,y,w,h,c)=>{ctx.fillStyle=fonce(c);ctx.fillRect(Math.round(x),Math.round(y),w,h);};
const lueur=(x,y,w,h,c)=>{ctx.fillStyle=c;ctx.fillRect(Math.round(x),Math.round(y),w,h);};
const ease=(u)=>{u=Math.max(0,Math.min(1,u));return u*u*(3-2*u);};
const seg=(t,a,b)=>(t-a)/(b-a);
const boite=(x,y,c)=>{R(x,y,12,5,c[0]);R(x,y,12,1,c[1]);R(x,y+4,12,1,c[2]);for(let i=1;i<11;i+=2)R(x+i,y+1,1,3,c[2]);R(x+11,y,1,5,c[2]);};
for(const [x0,pile,dec] of [[205,259,0],[350,415,17]]){
  if(x0-60>camX+lw||660<camX)continue;
  const P=40, t=((T+dec)%P+P)%P, cycle=Math.floor((T+dec)/P);
  const coul=CT_ANIM[Math.floor(alea(cycle*7.1+x0)*CT_ANIM.length)];
  const haut=2+Math.floor(A(pile*0.9)*4), dessus=pont-5*haut;   /* le haut de la pile, au pixel pres */
  const xc=x0+l/2-4, xs=pile+6, yRepos=yT+14, ySol=HZ-5;
  let tx=xc, sy=yRepos, porte=false, auSol=false;
  if(t<6){tx=xc+(xs-xc)*ease(t/6);}
  else if(t<9){tx=xs;sy=yRepos+(dessus-1-yRepos)*ease(seg(t,6,9));}
  else if(t<10){tx=xs;sy=dessus-1;}
  else if(t<13){tx=xs;sy=dessus-1+(yRepos-dessus+1)*ease(seg(t,10,13));porte=true;}
  else if(t<19){tx=xs+(xc-xs)*ease(seg(t,13,19));porte=true;}
  else if(t<22){sy=yRepos+(ySol-1-yRepos)*ease(seg(t,19,22));porte=true;}
  else if(t<23){sy=ySol-1;auSol=true;}
  else if(t<26){sy=ySol-1+(yRepos-ySol+1)*ease(seg(t,23,26));auSol=true;}
  else auSol=true;
  /* SOUS LE PONT, le conteneur passe derriere les piles du navire : il
     descend sur le quai, cache par la coque. */
  let yCache=pont;for(let x=168;x<492;x+=13)if(x<xc+6&&x+12>xc-6)yCache=Math.min(yCache,pont-5*(2+Math.floor(A(x*0.9)*4)));
  const cache=t>=19&&t<26;
  /* le chariot et sa cabine */
  R(tx-4,yT+4,9,3,'#d8dde3');R(tx-4,yT+4,9,1,'#ffffff');R(tx+1,yT+7,4,3,'#eef1f4');R(tx+2,yT+8,2,1,'#2a3c58');
  if(nuit)lueur(tx+2,yT+8,2,1,'#ffe6a0');
  if(cache){ctx.save();ctx.beginPath();ctx.rect(camX-10,0,lw+20,yCache);ctx.clip();}
  R(tx-3,yT+7,1,sy-yT-7,'#2a2a2a');R(tx+3,yT+7,1,sy-yT-7,'#2a2a2a');                 /* les cables */
  R(tx-6,sy,13,2,'#e8b020');R(tx-6,sy+1,13,1,'#b08010');                               /* le palonnier */
  if(porte)boite(tx-6,sy+2,coul);
  if(cache)ctx.restore();
  /* LE CAVALIER, derriere le navire on ne le voit pas ; il sort par
     l'arriere, son conteneur entre les jambes, et file sur le quai. */
  if(false&&t>=27){   /* cavaliers retirés */
    const cx=548+100*ease(seg(t,27,38)), cy=HZ-11, a=Math.max(0,1-seg(t,36.5,39));
    ctx.save();ctx.beginPath();ctx.rect(561,0,400,140);ctx.clip();
    const ga=ctx.globalAlpha;ctx.globalAlpha=ga*a;
    const J='#e8c020', Jo='#a88a10', haut2=HZ-14;
    for(const lx of [cx-9,cx+8]){R(lx,haut2,2,HZ-haut2-2,J);R(lx+1,haut2,1,HZ-haut2-2,Jo);R(lx-1,HZ-2,4,2,'#1a1a1a');}
    R(cx-9,haut2-1,19,2,J);R(cx-9,haut2,19,1,Jo);
    R(cx+8,haut2-5,5,4,'#f2f0e8');R(cx+9,haut2-4,3,2,'#2a3c58');if(nuit)lueur(cx+9,haut2-4,3,2,'#ffe6a0');
    const on=Math.floor(T*3)%2===0;lueur(cx,haut2-2,1,1,on?'#ff9a2a':fonce('#a85a10'));
    R(cx-4,haut2+1,1,cy-haut2-1,'#2a2a2a');R(cx+4,haut2+1,1,cy-haut2-1,'#2a2a2a');R(cx-6,cy,13,1,'#555555');
    boite(cx-6,cy+1,coul);
    if(nuit){lueur(cx+13,HZ-5,1,1,'#fff2c0');}
    ctx.globalAlpha=ga;ctx.restore();
  }
}
}
let PANO_ATTENTE=false;
function dessinerLePanorama(ctx,camX,camY,lw,lh){
if(camY>=140)return;
const[a,b,t]=heureDuPort(), h=Math.min(lh,140-camY), T=Date.now()/1000;
const base=t<0.5?a:b, autre=t<0.5?b:a, k=t<0.5?t:1-t;
const x0=Math.max(0,Math.floor(camX)), w=Math.min(MONDE_L-x0,Math.ceil(lw)+1);
const c1=composerLePort(couchesDuPort(base),0,x0,w,T);
ctx.drawImage(c1,0,camY,w,h,x0-camX,0,w,h);
if(base!==autre&&k>0.01){
  if(PANO[autre]){const c2=composerLePort(PANO[autre],1,x0,w,T);const ga=ctx.globalAlpha;ctx.globalAlpha=k;ctx.drawImage(c2,0,camY,w,h,x0-camX,0,w,h);ctx.globalAlpha=ga;}
  else if(!PANO_ATTENTE){PANO_ATTENTE=true;(window.requestIdleCallback||setTimeout)(()=>{try{couchesDuPort(autre);}catch(x){}PANO_ATTENTE=false;});}
}
animerLePort(ctx,base,camX,camY,lw,h,T);
}
function construireSolExtramar(){
const c=document.createElement('canvas');c.width=MONDE_L;c.height=MONDE_H;
const g=c.getContext('2d');
const R=(x,y,w,h,col)=>{g.fillStyle=col;g.fillRect(x|0,y|0,Math.max(1,w|0),Math.max(1,h|0));};
const A=(i)=>alea(i*1.37+0.5);
R(0,0,MONDE_L,160,'#b8a888');
/* LES CINQ TONS SE RESSERRENT. Ils allaient de #d3c097 a #e8d9b6 : chaque
   dalle se detachait de sa voisine, et un damier contraste se lit comme un
   parement, jamais comme un sol. Resserres, le pavage redevient une
   SURFACE sur laquelle le grain et l'usure font le relief. */
const pierre=['#d6d2ca','#d2cec5','#dad6ce','#cfcbc2','#d4d0c8','#ccc8bf'];   /* granit clair, poli */
R(0,70,MONDE_L,MONDE_H-70,'#d4d0c8');
dallesDuQuai((x,y,w,h)=>{
R(x,y,w,h,pierre[Math.floor(A(x+y*3.1)*pierre.length)]);
R(x,y,w,1,'rgba(118,114,106,.30)');R(x,y,1,h,'rgba(118,114,106,.30)');   /* le joint, pareil des quatre cotes et presque efface */
for(let i=0;i<3;i++)                                                    /* le grain, DEDANS la dalle et non sur son arete */
R(x+3+A(x*1.9+y+i)*(w-7),y+2+A(x*2.3+y*1.1+i)*17,2,1,'rgba(255,255,255,.12)');
if(A(x*1.7+y)<.10)R(x+3+A(x)*(w-9),y+3+A(y)*15,3,1,'rgba(110,108,104,.35)');           /* une usure */
})
graverLePortAutonome(g,AMBIANCE_PORT);   /* le fond : le Port Autonome, de Mourepiane a la Bonne Mere */

/* escalier du complexe festif retire */

for(let y=XP.quaiY;y<MONDE_H;y++){
const k=(y-XP.quaiY)/(MONDE_H-XP.quaiY);
for(let x=XP.bassinO;x<XP.bassinE;x+=2){
/* PLUS DE HAUT-FOND NI A L'EST NI A L'OUEST : la mer sort du cadre des
   deux cotes, elle ne doit pas palir contre un bord qui n'existe plus. */
const bord=(y-XP.quaiY)*1.4;
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
/* (plus de margelle ni a l'ouest ni a l'est : l'eau continue hors du cadre) */
/* pontons retirés — plus de tablier de bois dans le bassin */
/* (le boulodrome etait grave ici : il est sous l'eau desormais) */
/* (le tremplin etait grave ici : le quai est redevenu plat) */
R(0,XP.maisonsY-2,MONDE_L,8,'rgba(60,40,20,.12)');
/* (le sol fin, au demi-pixel, est peint par affinerLeSolExtramar) */
/* affiches foret/ferme retirees */
/* ================= PLUS DE GARDE-CORPS AU BOUT =================
   Une balustrade fermait les deux esplanades. Elle expliquait pourquoi on
   ne monte pas au coteau, mais elle barrait la vue d'un mur clair en
   travers du seul endroit ouvert de la carte. C'est la poussee d'une
   demi-seconde qui raconte la sortie maintenant, et les collines se
   gagnent a pied : la barriere n'avait plus de role que decoratif, et son
   decor etait un mur. */
/* (la place mediterraneenne a ete retiree) */
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
   Quatre dessins possibles, tous de meme encombrement : 'peinte' (une
   affiche de chemin de fer, coucher de soleil et pinede), 'peinte_ferme'
   (la meme serie, mais le mas, les cypres et les sillons), 'bois' (le
   panneau de parc, planche epaisse et lettres creusees) et 'email' (la
   plaque emaillee bleue des rues de Marseille, en grand).

   LE STYLE N'EST PLUS UN REGLAGE UNIQUE : chaque bout du quai nomme le
   sien a l'appel, dans construireSolExtramar. Les deux en service sont
   les deux affiches peintes — meme construction, memes mesures, meme
   bandeau de titre, et pour seule difference le pays qu'elles montrent. */
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
 /* LE M EST LE SEUL A CINQ COLONNES. Sur trois, ses deux obliques se
    rejoignent des la premiere ligne et il devient un N : « LA FERME » se
    lisait « LA FERNE ». ecrireA mesure chaque glyphe, il n'y a donc rien
    d'autre a changer pour qu'il prenne ses deux pixels de plus. */
 M:[[0,0,0,0,0],[0,0,0,0,0],[1,0,0,0,1],[1,1,0,1,1],[1,0,1,0,1],[1,0,0,0,1],[1,0,0,0,1]],
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
/* LE MOT ET LE SENS sont passes en argument : la meme affiche sert aux
   deux bouts du quai, « LA FORÊT » a l'est, « LA FERME » a l'ouest, et la
   fleche de la plaque emaillee pointe vers la sortie correspondante. */
function graverLAffiche(g,cx,bas,style,mot,sens){
mot=mot||'LA FORÊT';sens=(sens===-1?-1:1);
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
  ecrireA(g,mot,cx,by+3,2,'#f3e3b6','#120c06');
}
else if(style==='peinte_ferme'){
  /* LA MEME AFFICHE DE CHEMIN DE FER, MAIS LES CHAMPS. Celle de la foret
     montre une pinede ; celle-ci montre ce qu'on va trouver a l'ouest : le
     mas a toit rouge, les cypres en rideau, les sillons et les epis, le
     soleil bas. Meme construction, memes mesures, meme bandeau de titre —
     seuls les motifs changent, pour que les deux bouts du quai restent
     deux affiches de la meme serie et non deux objets differents. */
  const cielH=24, col1=y0+cielH;
  for(let y=0;y<cielH;y++){const t=y/cielH;
    R(x0,y0+y,L,1,'rgb('+Math.round(250-t*10)+','+Math.round(232-t*40)+','+Math.round(190-t*66)+')');}
  /* LE SOLEIL EST DU COTE OU L'ON VA : a l'ouest sur l'affiche de la
     ferme, comme il l'est a l'est sur celle de la foret. */
  const sx=cx+34*sens;
  g.fillStyle='#f6d98a';g.beginPath();g.arc(sx,col1-7,10,0,7);g.fill();
  g.fillStyle='#fbeab8';g.beginPath();g.arc(sx,col1-7,5,0,7);g.fill();
  g.fillStyle='#b98a52';g.beginPath();                      /* la colline */
  g.moveTo(x0,col1+4);g.quadraticCurveTo(x0+40,col1-9,x0+78,col1+1);
  g.quadraticCurveTo(x0+102,col1+7,x0+L,col1-2);g.lineTo(x0+L,col1+14);g.lineTo(x0,col1+14);g.fill();
  const cypres=(px,py,h)=>{for(let k=0;k<h;k++){const w=1+Math.round(k*0.22);
    R(px-Math.round(w/2),py-h+k,Math.max(1,w),1,k<2?'#4a6b3a':'#2f4a28');}};
  [[x0+14,13],[x0+20,16],[x0+26,11],[x0+96,14],[x0+102,10]].forEach(([px,h])=>cypres(px,col1+13,h));
  const my=col1+6;                                          /* le mas */
  R(cx-6*sens,my-1,26,13,'#e3d2ab');R(cx-6*sens,my-1,26,1,'#f4ecd8');
  R(cx-8*sens,my-6,30,5,'#b5552f');R(cx-8*sens,my-6,30,1,'#c96a3f');
  R(cx-1*sens,my+5,4,7,'#5b3f21');R(cx+8*sens,my+3,4,4,'#3a4a58');R(cx+14*sens,my+3,4,4,'#3a4a58');
  R(x0,col1+13,L,H-cielH-13,'#c9a44e');                     /* le champ */
  for(let r=0;r<9;r++){const y=col1+15+r*3;
    for(let x=x0;x<x0+L;x+=4)R(x+((r*2)%4),y,3,1,r%2?'#b58b38':'#d8b65e');}
  for(let i=0;i<26;i++){const px=x0+3+A(i*2.9)*(L-6), py=col1+16+A(i*4.1)*18;
    R(px,py-3,1,3,'#8a6a2c');R(px-1,py-4,3,1,'#e8c86a');}   /* les epis */
  const by=y0+H-24;
  R(x0,by,L,21,'#241a0e');R(x0,by,L,2,'#6b5330');
  ecrireA(g,mot,cx,by+3,2,'#f3e3b6','#120c06');
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
  ecrireA(g,mot,cx,y0+12,2,'#f6f8f4','#0d2340');
  const fy=y0+H-24;
  R(sens>0?cx-30:cx-16,fy,46,4,'#f6f8f4');
  g.fillStyle='#f6f8f4';g.beginPath();
  g.moveTo(cx+16*sens,fy-5);g.lineTo(cx+32*sens,fy+2);g.lineTo(cx+16*sens,fy+9);g.fill();
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
  ecrireA(g,mot,cx,y0+10,2,'#f1e2bb','#3a2a14');
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
/* graverLesToitsDuFond retire */

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
/* (graverLeCabanon retiré — plus de pêche/bouillabaisse) */
function graverLaStationVelo(){
/* LA TOILE EST CALEE SUR L'ENCRE, PAS SUR LE SUPPOSE. Mesure faite dans
   un navigateur : un velo deborde de 9 px a gauche et de 18 a droite de
   son point d'ancrage. Le quatrieme est ancre en 83, son encre va donc
   jusqu'a 101, et la toile s'arretait a 98 : la roue avant etait coupee
   net sur 29 lignes. On garde cx=45 au centre exact de la vignette — sans
   quoi la station se decalerait de quelques pixels sur le quai — et on
   ouvre le cadre a 56 px de part et d'autre, soit 2 px d'air apres la
   roue. */
/* QUATRE TROTTINETTES AU LIEU DE QUATRE VELOS, et la vignette se
   resserre avec elles : une trottinette tient dans 24 px de long contre
   32 pour un velo, et son guidon monte moins haut qu'une selle. Mesure
   refaite dans un navigateur, comme pour les velos — c'est elle qui fixe
   le cadre, pas le suppose. */
const W=104,Ht=42,cx=42,sol=36;
const c=document.createElement('canvas');
/* on grave les façades plus finement : les enseignes étaient tracées
   sur une toile deux fois trop petite, puis agrandies à l'écran */
const D=Math.max(2,Math.min(3,Math.ceil(window.devicePixelRatio||2)));
c.width=W*D;c.height=Ht*D;const g=c.getContext('2d');g.setTransform(D,0,0,D,10*D,0);g.imageSmoothingEnabled=false;
const R=(x,y,w,h,col)=>{g.fillStyle=col;g.fillRect(x|0,y|0,Math.max(1,w|0),Math.max(1,h|0));};
g.fillStyle='rgba(40,30,18,.22)';g.beginPath();g.ellipse(cx,sol+1,40,4,0,0,7);g.fill();
R(8,sol-30,10,30,'#7a1f2b');R(8,sol-30,10,2,'#a8424e');R(10,sol-26,6,5,'#9fd0e8');R(10,sol-18,6,2,'#e8c06a');
R(9,sol-34,8,4,'#f2efe4');R(11,sol-33,4,2,'#7a1f2b');
R(18,sol-7,62,2,'#8f959b');
/* RANGEES EN EPI, le nez vers la borne, et DEUX COUCHES par machine
   pour que le guidon de l'une passe devant le plateau de la suivante —
   c'est ce qui fait un rang serre plutot que quatre dessins poses. */
for(let k=0;k<4;k++)dessinerUneTrottinette(g,26+k*15,sol-1,'droite',k*0.8,0,0);
for(let k=0;k<4;k++)dessinerUneTrottinette(g,26+k*15,sol-1,'droite',k*0.8,0,1);
return {toile:c,W,H:Ht,sol};
}
/* TON BATEAU : le pointu amarré DANS L'EAU, au bout du ponton de l'est.
   La même peinture qu'au large — c'est le même bateau. */
function graverTonBateau(){
const LH=96, HW=15, W=HW*2+16, Ht=LH+28, cx=W/2, y0=14, sol=Ht-6;
const c=document.createElement('canvas');
const D=Math.max(2,Math.min(3,Math.ceil(window.devicePixelRatio||2)));
c.width=W*D;c.height=Ht*D;const g=c.getContext('2d');g.setTransform(D,0,0,D,0,0);g.imageSmoothingEnabled=false;
if(typeof peindreCoque==='function')peindreCoque(g,cx,y0,LH,HW);
/* les amarres vers le ponton */
g.strokeStyle='#cdbc94';g.lineWidth=1;
g.beginPath();g.moveTo(cx-HW,y0+14);g.lineTo(cx-HW-11,y0+2);g.stroke();
g.beginPath();g.moveTo(cx-HW+2,y0+LH-20);g.lineTo(cx-HW-10,y0+LH-30);g.stroke();
return {toile:c,W,H:Ht,sol};
}
/* (Chez Fonfon / bouillabaisse retiré — plus de pêche) */
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
/* (pêche retirée) */
const FERRY={y:824,xo:228,xe:900,trajet:22,pause:4};     /* secondes */
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
const BANCS=[[360,746],[620,748],[880,746],[250,618],[760,616],[1000,618],[500,620]];
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
   Même architecture que les boutiques : corps de devanture, montants
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
/* (poissonPx et PX_P retirés) */
/* ================= LE GLACIER DU PORT (l'ancienne Criée) ================= */
function cfStore(g,R,x0,BL,sy,c1,c2,ombre){for(let k=0;k<BL+8;k++){const c=(k%12<6)?c1:c2;R(x0-4+k,sy,1,8,c);R(x0-4+k,sy+8,1,2,(k%12<6)?ombre:'rgba(0,0,0,.15)');}
 for(let k=0;k<Math.floor((BL+8)/12);k++){const c=(k%2)?c1:c2;for(let i=0;i<5;i++)R(x0-4+k*12+i,sy+10,12-i*2.4,1,c);}R(x0-4,sy-2,BL+8,2,ombre);}
function cfVitre(g,R,x,y,w,h,nuit,teinte){R(x,y,w,h,nuit?'#ffe6b8':(teinte||'#cfe2ea'));
 g.fillStyle='rgba(255,255,255,.22)';g.beginPath();g.moveTo(x+4,y+h);g.lineTo(x+12,y);g.lineTo(x+17,y);g.lineTo(x+9,y+h);g.fill();
 if(nuit){const l=g.createLinearGradient(x,y,x,y+h);l.addColorStop(0,'rgba(255,190,90,.35)');l.addColorStop(1,'rgba(255,190,90,0)');g.fillStyle=l;g.fillRect(x,y,w,h);}}
function cfLueur(g,cx,sol,nuit,col){if(!nuit)return;const l=g.createRadialGradient(cx,sol,4,cx,sol,80);l.addColorStop(0,'rgba('+(col||'255,190,110')+',.42)');l.addColorStop(1,'rgba('+(col||'255,190,110')+',0)');g.fillStyle=l;g.fillRect(cx-80,sol-80,160,86);}
function cfCornet(g,R,x,y,s,boules){/* un cornet : biscuit + boules */
 g.fillStyle='#d8a050';g.beginPath();g.moveTo(x-4*s,y);g.lineTo(x+4*s,y);g.lineTo(x,y+11*s);g.fill();
 g.strokeStyle='#a87030';g.lineWidth=.5*s;for(let i=-2;i<=2;i++){g.beginPath();g.moveTo(x+i*1.6*s-2*s,y);g.lineTo(x+i*1.6*s+2*s,y+6*s);g.stroke();}
 boules.forEach((c,i)=>{g.fillStyle=c;g.beginPath();g.arc(x+(i===1?2*s:i===2?-2*s:0),y-(i===0?2.5*s:6*s),4.2*s,0,7);g.fill();g.fillStyle='rgba(255,255,255,.4)';g.beginPath();g.arc(x+(i===1?2*s:i===2?-2*s:0)-1.4*s,y-(i===0?3.6*s:7*s),1.2*s,0,7);g.fill();});}


/* ===== LE KARTING DU QUAI : un garage vert profond, laiton, damier, pneus ===== */
function graverLeKarting(){return devanture(8,(g,R,{sol,cx,BL,x0,rez,yR},nuit)=>{
 const V='#17211a',VC='#2f4433',OR='#d8bf6a';
 R(x0-2,yR-4,BL+4,rez+4,V);R(x0-2,yR-4,BL+4,1.5,OR);R(x0-2,sol-6,BL+4,6,'#0e1510');R(x0-2,sol-6,BL+4,1,VC);
 /* le damier sous l'enseigne */
 for(let i=0;i<BL+4;i+=3)for(let j=0;j<2;j++)R(x0-2+i,yR-4+1.5+j*1.5,1.5,1.5,((i/3|0)+j)%2?'#f4f4f0':'#1a1a1e');
 /* la grande porte de garage ouverte : un kart orange dedans */
 const px=cx-30,pw=60,py=yR+6,ph=rez-12;R(px-2,py-2,pw+4,ph+2,OR);R(px,py,pw,ph,nuit?'#3a2e1e':'#20201e');
 for(let k=0;k<4;k++)R(px,py+k*2,pw,1,'#3a3a36');                       /* le rideau relevé */
 R(px+4,sol-14,pw-8,1,'rgba(255,255,255,.08)');
 const kx=cx-13,ky=sol-13;R(kx,ky+4,26,5,'#e8761e');R(kx+2,ky+3,22,1,'#ff9a44');R(kx-2,ky+7,6,5,'#141418');R(kx+22,ky+7,6,5,'#141418');R(kx+8,ky,10,4,'#24242a');
 g.fillStyle='#ffd04a';g.beginPath();g.arc(kx+13,ky-1,3.2,0,7);g.fill();R(kx+11,ky-2,4,1.2,'#1e2a38');R(kx+24,ky+1,1,7,'#8a8e96');
 /* les piles de pneus de chaque côté */
 for(const bx of [x0+8,x0+BL-22])for(let k=0;k<4;k++){R(bx,sol-8-k*5,14,4.4,'#141418');R(bx+1,sol-8-k*5,12,1,'#4a4a52');R(bx+5,sol-7-k*5,4,2,k%2?'#c8322a':'#f2eee4');}
 /* les vitrines : les coupes et les casques */
 [[x0+4,26],[x0+BL-30,26]].forEach(([x,w],k)=>{cfVitre(g,R,x,yR+3,w,13,nuit,'#d8e4e0');
   if(k===0){g.fillStyle=OR;for(let i=0;i<3;i++){R(x+4+i*7,yR+10,4,4,OR);R(x+5+i*7,yR+14,2,2,OR);}}
   else{for(let i=0;i<3;i++){g.fillStyle=['#e82a2a','#2a6ad8','#2ac84a'][i];g.beginPath();g.arc(x+6+i*7,yR+11,2.8,0,7);g.fill();R(x+4.4+i*7,yR+10,3,1,'#1e2a38');}}});
 /* l'enseigne */
 const ey=yR-22;R(x0-6,ey,BL+12,16,V);R(x0-6,ey,BL+12,1.5,OR);R(x0-6,ey+14.5,BL+12,1.5,OR);
 for(const xx of [x0-3,x0+BL-5])for(let i=0;i<4;i++)for(let j=0;j<4;j++)R(xx+i*2,ey+4+j*2,2,2,(i+j)%2?'#f4f4f0':'#1a1a1e');
 g.font='italic 900 9px Georgia';g.textAlign='center';g.fillStyle=OR;g.fillText('Karting du Quai',cx,ey+11,BL-30);
 g.font='700 3.6px Arial';g.fillStyle='#93a68c';g.fillText('GRAND PRIX · TROIS TOURS',cx,yR-1.2);g.textAlign='left';
 /* le drapeau à damier qui flotte sur le toit */
 R(x0+BL-12,ey-16,1,16,'#c8c8c0');for(let i=0;i<5;i++)for(let j=0;j<3;j++)R(x0+BL-11+i*2,ey-16+j*2+Math.sin(i)*.6,2,2,(i+j)%2?'#f4f4f0':'#1a1a1e');
 cfLueur(g,cx,sol,nuit,'255,200,120');});}
/* ===== LA LOCATION DE KAYAKS : turquoise et blanc, kayaks au râtelier ===== */
function graverLesKayaks(){return devanture(2,(g,R,{sol,cx,BL,x0,rez,yR},nuit)=>{
 const T='#1e9aa6',TC='#6ad0c4',TS='#0e5a72',BL2='#f4f2e8';
 R(x0-2,yR-4,BL+4,rez+4,BL2);R(x0-2,yR-4,BL+4,1.5,T);R(x0-2,sol-6,BL+4,6,TS);R(x0-2,sol-6,BL+4,1,T);
 for(let i=0;i<BL+4;i+=8)R(x0-2+i,yR-2,4,rez-4,'rgba(30,154,166,.08)');
 /* la porte vitrée */
 R(cx-9,yR+4,18,rez-10,T);cfVitre(g,R,cx-8,yR+5,16,rez-12,nuit,'#d8f0f0');R(cx-.5,yR+5,1,rez-12,T);
 /* le râtelier : trois kayaks posés de chant de chaque côté */
 const kay=(x,y,c,c2)=>{g.fillStyle=c;g.beginPath();g.ellipse(x,y,22,2.6,0,0,7);g.fill();g.fillStyle=c2;g.fillRect(x-20,y-1.4,40,.8);g.fillStyle='#1a1a1e';g.beginPath();g.ellipse(x+2,y-.6,4,1.2,0,0,7);g.fill();};
 for(const [bx,s] of [[x0+26,1],[x0+BL-26,-1]]){R(bx-20,sol-30,1.5,24,'#8a6a4a');R(bx+18,sol-30,1.5,24,'#8a6a4a');
   kay(bx,sol-26,'#e8761e','#ffa050');kay(bx,sol-19,'#2a6ad8','#5a8af0');kay(bx,sol-12,'#2ac84a','#6ae07a');}
 /* pagaies croisées et gilets */
 g.strokeStyle='#2a2b30';g.lineWidth=1;g.beginPath();g.moveTo(cx-20,yR+4);g.lineTo(cx-12,yR+20);g.moveTo(cx+20,yR+4);g.lineTo(cx+12,yR+20);g.stroke();
 R(cx-22,yR+2,4,5,BL2);R(cx+18,yR+2,4,5,BL2);
 R(x0+52,yR+4,7,8,'#ffd21a');R(x0+54,yR+4,3,2,'#e8761e');R(x0+BL-59,yR+4,7,8,'#e8344a');R(x0+BL-57,yR+4,3,2,'#ffd21a');
 /* le store turquoise */
 cfStore(g,R,x0,BL,yR-10,T,BL2,TS);
 /* l'enseigne en vague */
 const ey=yR-26;R(x0-6,ey,BL+12,15,T);R(x0-4,ey+2,BL+8,11,'#f4fbfa');
 for(let i=0;i<BL+8;i+=6){g.fillStyle=T;g.beginPath();g.arc(x0-4+i+3,ey+13,3,0,Math.PI);g.fill();}
 g.font='italic 900 9px Georgia';g.textAlign='center';g.fillStyle=TS;g.fillText('Kayaks des Calanques',cx,ey+10,BL-14);g.textAlign='left';
 /* une bouée orange sur le toit */
 g.fillStyle='#ff6a1a';g.beginPath();g.arc(x0+10,ey-5,5,0,7);g.fill();g.fillStyle='#f4f2e8';g.beginPath();g.arc(x0+10,ey-5,2.4,0,7);g.fill();
 cfLueur(g,cx,sol,nuit,'150,230,230');});}

/* ===== A · LE GLACIER DU VIEUX-PORT : rose et menthe, gros cornet, bacs de glace ===== */
function graverLeGlacier(){return devanture(1,(g,R,{sol,cx,BL,x0,rez,yR},nuit)=>{
 const RO='#f4a6c0',RC='#ffd0e0',MT='#8ad8c0',MC='#c8f4e4',BR='#6a3a3a';
 R(x0-2,yR-4,BL+4,rez+4,RO);R(x0-2,yR-4,BL+4,1.5,'#fff');R(x0-2,sol-6,BL+4,6,MT);R(x0-2,sol-6,BL+4,1,MC);
 for(const x of [x0,x0+44,x0+BL-50,x0+BL-6]){R(x,yR,6,rez-6,RC);R(x+5,yR,1,rez-6,'#d880a0');}
 /* la vitrine des bacs */
 [[x0+6,38],[x0+BL-44,38]].forEach(([x,w],k)=>{cfVitre(g,R,x,yR+2,w,rez-10,nuit,'#e8f6f8');
  R(x+2,sol-20,w-4,9,'#dfe8ec');R(x+2,sol-20,w-4,1,'#fff');
  const B=['#f4e8c8','#7a4a2a','#f48aa8','#9ae0a0','#ffe070','#c8a0ff'];
  for(let i=0;i<5;i++){const c=B[(i+k*3)%6];R(x+4+i*6.6,sol-19,5.6,6,'#b8c8d0');g.fillStyle=c;g.beginPath();g.ellipse(x+6.8+i*6.6,sol-19,2.8,1.8,0,0,7);g.fill();}
  R(x,yR+2,w,1.5,RO);R(x,sol-9,w,1.5,RO);R(x+w/2-.5,yR+2,1,9,RO);
  g.font='italic 700 4.4px Georgia';g.textAlign='center';g.fillStyle='#c8406a';g.fillText(k?'Sorbets maison':'Glaces artisanales',x+w/2,yR+9,w-6);g.textAlign='left';});
 /* la porte */
 R(cx-8,yR+2,16,rez-8,'#d880a0');cfVitre(g,R,cx-7,yR+3,14,rez-10,nuit,'#e8f6f8');R(cx-.5,yR+3,1,rez-10,'#d880a0');R(cx+3,sol-18,1.4,4,'#fff');
 /* le store rose et blanc */
 const sy=yR-10;cfStore(g,R,x0,BL,sy,'#f48aa8','#fff4f8','#c85a80');
 /* l'enseigne en vague */
 const ey=sy-16;R(x0-6,ey,BL+12,15,MT);R(x0-4,ey+2,BL+8,11,'#fff8fa');
 for(let i=0;i<BL+8;i+=6){g.fillStyle=MT;g.beginPath();g.arc(x0-4+i+3,ey+13,3,0,Math.PI);g.fill();}
 g.font='italic 900 9px Georgia';g.textAlign='center';g.fillStyle='#e0507a';g.fillText('Le Glacier du Port',cx,ey+10,BL-30);g.textAlign='left';
 /* le cornet géant sur le toit */
 cfCornet(g,R,x0+BL-6,ey-6,1.5,['#f48aa8','#9ae0a0','#ffe070']);
 cfCornet(g,R,x0+6,ey-6,1.3,['#7a4a2a','#f4e8c8']);
 /* devant : chariot à glaces et petite table */
 R(x0+4,sol-14,26,10,'#fff');R(x0+4,sol-14,26,2,MT);R(x0+8,sol-4,4,4,'#3a3a3a');R(x0+22,sol-4,4,4,'#3a3a3a');
 R(x0+15,sol-30,1,16,'#ccc');g.fillStyle='#f48aa8';g.beginPath();g.moveTo(x0+3,sol-28);g.quadraticCurveTo(x0+16,sol-38,x0+29,sol-28);g.fill();
 R(x0+BL-22,sol-10,10,1.4,'#fff');R(x0+BL-17.5,sol-10,1,8,'#ccc');R(x0+BL-20,sol-12,5,2,'#f48aa8');
 cfLueur(g,cx,sol,nuit,'255,170,200');});}

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
/* ================= LE BAR DES DOCKS, CHIC ET MODERNE ================= */
function b2Lg(g,x0,y0,x1,y1,st){const l=g.createLinearGradient(x0,y0,x1,y1);st.forEach(s=>l.addColorStop(s[0],s[1]));return l;}
function b2Bouteilles(g,R,x,y,w,n){/* une étagère éclairée par en dessous */const C=['#2f6a3a','#7a2a1a','#c89a3a','#3a5a8a','#d8d8d8','#5a2a5a','#a8582a'];
 for(let i=0;i<n;i++){const bx=x+1+i*(w-2)/n,c=C[(i*3+Math.round(x))%C.length],h=4.5+((i*7)%3);R(bx,y-h,1.6,h,c);R(bx+.3,y-h-1.5,1,1.5,c);R(bx+.2,y-h+1,.5,h-2,'rgba(255,255,255,.45)');}
 R(x,y,w,1,'#d8b878');R(x,y+1,w,.5,'rgba(0,0,0,.4)');g.fillStyle=b2Lg(g,0,y-8,0,y,[[0,'rgba(255,210,140,0)'],[1,'rgba(255,210,140,.35)']]);g.fillRect(x,y-8,w,8);}
function b2Perso(g,R,x,y,c,dos){/* un client assis ou le barman, en ombre chaude */R(x-2,y-9,4,6,c);R(x-1.5,y-12,3,3,'#e0b088');R(x-1.6,y-12.6,3.2,1.4,dos?'#3a2a20':'#2a1a14');}
function b2Interieur(g,R,x,y,w,h,opt){/* un intérieur de bar chaud, vu à travers une grande vitre */
 g.fillStyle=b2Lg(g,0,y,0,y+h,[[0,'#3a2418'],[.55,'#6a3e24'],[1,'#2a1a12']]);g.fillRect(x,y,w,h);
 /* le mur du fond en carreaux zellige */for(let yy=y+2;yy<y+h*0.55;yy+=2)for(let xx=x;xx<x+w;xx+=2)if((xx+yy)%4===0)R(xx,yy,1.5,1.5,'rgba(60,120,110,.35)');
 b2Bouteilles(g,R,x+3,y+h*0.26,w-6,Math.floor(w/3));b2Bouteilles(g,R,x+3,y+h*0.5,w-6,Math.floor(w/3.4));
 /* les suspensions en globe */for(let i=0;i<Math.floor(w/14);i++){const lx=x+8+i*14;R(lx,y,.5,4,'#1a1a1a');g.fillStyle='#ffe2a0';g.beginPath();g.arc(lx+.25,y+5.5,1.8,0,7);g.fill();
  const lg=g.createRadialGradient(lx,y+5.5,0,lx,y+5.5,9);lg.addColorStop(0,'rgba(255,220,150,.55)');lg.addColorStop(1,'rgba(255,220,150,0)');g.fillStyle=lg;g.fillRect(lx-9,y-3,18,18);}
 /* le comptoir en marbre */const cy=y+h*0.72;R(x,cy,w,2,'#e8e2d4');R(x,cy+2,w,.6,'#b8b0a0');R(x,cy+2.6,w,h-(cy-y)-2.6,'#2a1a12');for(let i=0;i<w;i+=3)R(x+i,cy+3,.5,h-(cy-y)-3,'rgba(255,200,120,.12)');
 if(opt&&opt.barman)b2Perso(g,R,x+w*0.62,cy,'#f4ecd8');
 /* les clients sur leurs tabourets, de dos */if(opt&&opt.clients)for(let i=0;i<opt.clients;i++){const px=x+6+i*(w-12)/Math.max(1,opt.clients-1);b2Perso(g,R,px,cy+6,['#2a4a6a','#8a3a2a','#3a5a3a'][i%3],true);R(px-.4,cy+6,.8,h-(cy-y)-6,'#8a6a40');}}
function b2Vitre(g,x,y,w,h){/* le reflet : une bande claire en biais, une ombre en haut */g.save();g.beginPath();g.rect(x,y,w,h);g.clip();
 g.fillStyle='rgba(255,255,255,.10)';g.beginPath();g.moveTo(x+w*0.15,y+h);g.lineTo(x+w*0.35,y);g.lineTo(x+w*0.45,y);g.lineTo(x+w*0.25,y+h);g.fill();
 g.fillStyle='rgba(255,255,255,.06)';g.beginPath();g.moveTo(x+w*0.5,y+h);g.lineTo(x+w*0.62,y);g.lineTo(x+w*0.66,y);g.lineTo(x+w*0.54,y+h);g.fill();
 g.fillStyle=b2Lg(g,0,y,0,y+6,[[0,'rgba(0,0,0,.45)'],[1,'rgba(0,0,0,0)']]);g.fillRect(x,y,w,6);g.restore();}
function b2Olivier(g,R,x,y){R(x-5,y-8,10,8,'#8a8478');R(x-5,y-8,10,1,'#a8a294');R(x-5,y-1,10,1,'#5a564e');R(x-.6,y-16,1.2,8,'#6a5040');
 for(let i=0;i<14;i++){const a=i*2.4,r=3+(i%3)*1.4;g.fillStyle=['#6a8a4a','#7a9a5a','#58763e','#8aa86a'][i%4];g.beginPath();g.ellipse(x+Math.cos(a)*r,y-19+Math.sin(a)*r*0.8,2.2,1.3,a,0,7);g.fill();}}
function b2Applique(g,R,x,y,nuit){R(x-1,y,2,4,'#c9a24a');R(x-.5,y-1,1,1,'#c9a24a');g.fillStyle='#fff0c0';g.beginPath();g.moveTo(x-2,y);g.lineTo(x+2,y);g.lineTo(x+1,y-3);g.lineTo(x-1,y-3);g.fill();
 const lg=g.createRadialGradient(x,y,0,x,y,nuit?16:9);lg.addColorStop(0,'rgba(255,220,150,.55)');lg.addColorStop(1,'rgba(255,220,150,0)');g.fillStyle=lg;g.fillRect(x-16,y-16,32,32);}
function b2Carotte(g,R,x,y){g.fillStyle='#c8262a';g.beginPath();g.moveTo(x,y-8);g.lineTo(x+4.5,y);g.lineTo(x,y+8);g.lineTo(x-4.5,y);g.fill();g.fillStyle='rgba(255,255,255,.25)';g.beginPath();g.moveTo(x,y-8);g.lineTo(x+4.5,y);g.lineTo(x,y);g.fill();
 g.font='800 2.4px Arial';g.textAlign='center';g.fillStyle='#fff';g.fillText('TABAC',x,y+.9);g.textAlign='left';R(x-.4,y-11,.8,3,'#2a2a2a');R(x-3,y-11,6,.8,'#2a2a2a');}
/* G · LE BAR DES DOCKS, CHIC ET MODERNE : panneaux cannelés anthracite, laiton, grand store vert, intérieur chaud */
function graverLeBarModerne(){return devanture(3,(g,R,{sol,cx,BL,x0,rez,yR},nuit)=>{
 const top=yR-18;
 /* les panneaux cannelés */g.fillStyle=b2Lg(g,0,top,0,sol,[[0,'#2a2c30'],[1,'#1c1e22']]);g.fillRect(x0-3,top,BL+6,sol-top);
 for(let x=x0-3;x<x0+BL+3;x+=2){R(x,top,.5,sol-top,'rgba(255,255,255,.07)');R(x+1.5,top,.5,sol-top,'rgba(0,0,0,.25)');}
 R(x0-3,top,BL+6,.8,'#d8b468');R(x0-3,sol-5,BL+6,.8,'#d8b468');R(x0-3,sol-4.2,BL+6,4.2,'#141518');
 /* l'enseigne en lettres de laiton rétroéclairées */const ey=top+5.4;
 g.save();g.font='800 9.5px Georgia,serif';g.textAlign='center';g.shadowColor='rgba(255,210,130,.95)';g.shadowBlur=6;g.fillStyle='rgba(255,200,120,.0)';
 g.fillStyle=nuit?'#fff0c8':'#e8c47a';g.fillText('LE BAR DES DOCKS',cx,ey+3.4,BL-30);g.restore();
 g.font='700 2.8px Arial';g.textAlign='center';g.fillStyle='#b89a60';g.fillText('BAR  ·  COCKTAILS  ·  TABAC  ·  DEPUIS 1931',cx,ey+7.4,BL-30);g.textAlign='left';
 /* le store droit, vert profond, avec son ombre */const sy=yR-3;g.fillStyle=b2Lg(g,0,sy,0,sy+7,[[0,'#2e5a46'],[1,'#1c3a2c']]);g.beginPath();g.moveTo(x0-1,sy);g.lineTo(x0+BL+1,sy);g.lineTo(x0+BL+5,sy+7);g.lineTo(x0-5,sy+7);g.fill();
 for(let x=x0;x<x0+BL;x+=8)R(x,sy,.5,7,'rgba(0,0,0,.18)');R(x0-5,sy+7,BL+10,2,'#16302a');R(x0-5,sy+7,BL+10,.5,'#4a8a6a');
 g.fillStyle='rgba(0,0,0,.35)';g.fillRect(x0-1,sy+9,BL+2,3);
 /* les deux grandes baies */const vy=sy+12,vh=sol-5-vy;
 for(const [x,w,o] of [[x0+3,46,{}],[x0+BL-49,46,{}]]){R(x-1.2,vy-1.2,w+2.4,vh+2.4,'#c9a24a');b2Interieur(g,R,x,vy,w,vh,o);b2Vitre(g,x,vy,w,vh);
  g.font='italic 700 3.4px Georgia';g.textAlign='center';g.fillStyle='rgba(232,196,122,.95)';g.fillText(x<cx?'Cocktails maison':'Bières · Vins · Tapas',x+w/2,vy+vh-2,w-6);g.textAlign='left';}
 /* l'entrée en retrait */const dx=cx-15,dw=30;R(dx,vy-1,dw,vh+1,'#0e0f12');R(dx+2,vy+1,dw-4,vh-1,'#16171a');
 R(dx+3,vy+2,dw/2-4,vh-3,'#2a1a12');b2Interieur(g,R,dx+3,vy+2,dw/2-4,vh-3,{});b2Vitre(g,dx+3,vy+2,dw/2-4,vh-3);
 R(dx+dw/2+1,vy+2,dw/2-4,vh-3,'#2a1a12');b2Interieur(g,R,dx+dw/2+1,vy+2,dw/2-4,vh-3,{});b2Vitre(g,dx+dw/2+1,vy+2,dw/2-4,vh-3);
 R(cx-2.5,vy+vh*0.35,1,9,'#e8c47a');R(cx+1.5,vy+vh*0.35,1,9,'#e8c47a');R(dx+2,sol-5,dw-4,1,'#c9a24a');
 b2Applique(g,R,dx-3,vy+6,nuit);b2Applique(g,R,dx+dw+3,vy+6,nuit);
 /* les oliviers en pots, le chevalet */b2Olivier(g,R,x0-4,sol+1);b2Olivier(g,R,x0+BL+4,sol+1);
 R(x0+BL-60,sol-14,.8,14,'#2a2a2a');R(x0+BL-52,sol-14,.8,14,'#2a2a2a');R(x0+BL-61,sol-17,10,10,'#1a1a1c');R(x0+BL-60.5,sol-16.5,9,9,'#2a2c30');
 g.font='700 2.2px Arial';g.fillStyle='#e8c47a';g.fillText('HAPPY',x0+BL-59.5,sol-13.5);g.fillText('HOUR',x0+BL-59.5,sol-11);g.fillStyle='#f0f0e8';g.fillText('18h-20h',x0+BL-59.5,sol-8.5);
 b2Carotte(g,R,x0+BL+9,yR-12);
 if(nuit){const l=g.createRadialGradient(cx,sol,4,cx,sol,95);l.addColorStop(0,'rgba(255,200,130,.55)');l.addColorStop(1,'rgba(255,200,130,0)');g.fillStyle=l;g.fillRect(cx-95,sol-95,190,100);}});}
/* (restoFonfon retiré — plus de pêche) */
function clientCape(R,x,y,cheveux,cape){R(x-5,y-2,10,9,cape||'#f4f4f4');R(x-5,y-2,10,1,'#ffffff');R(x-2.5,y-8,5,6,'#e0b088');R(x-3,y-9,6,3,cheveux);R(x-1,y+7,2,4,'#3a3a40');R(x-4,y+10,8,1.5,'#3a3a40');}
function coiffeur(R,x,y,tablier,cheveux){R(x-2.5,y-16,5,5,'#e0b088');R(x-3,y-17,6,2.5,cheveux);R(x-3,y-11,6,9,tablier);R(x-2.5,y-2,2,6,'#2a2a30');R(x+.5,y-2,2,6,'#2a2a30');R(x+3,y-10,4,1.5,'#e0b088');R(x+6.5,y-11,2,1,'#c8ccd4');R(x+6.5,y-9.5,2,1,'#c8ccd4');}
function poteau(R,px,py,h,e){e=e||1;R(px-2*e,py-4,4*e+2,4,'#d8b050');R(px-2*e,py+h,4*e+2,4,'#d8b050');R(px-1.5*e,py,3*e+2,h,'#ffffff');
for(let k=0;k<h;k+=2){const off=((k*0.9)%(3*e+2));R(px-1.5*e+off,py+k,1.6,2,k%4<2?'#c8281e':'#2d5fb0');}R(px-1*e,py,1,h,'rgba(255,255,255,.4)');R(px-1.5*e-.5,py-7,3*e+3,3,'#e8e8e8');}
function graverLePeigne(){return devanture(4,(g,R,{sol,cx,BL,x0,rez,yR},nuit)=>{
/* ================= LA MARINIÈRE =================
   Boutique de vêtements, sur l'architecture validée des boutiques. */
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

/* graverLeHangar retire */


function semerDecorExtramar(){
DECOR=[];
const P=(t,x,y,o)=>DECOR.push(Object.assign({t,x,y,gr:0},o||{}));
/* batiments (x_maison) retires */
/* platanes et bancs des facades retires */
/* LA STATION DE TOKYO (facade k=2) : c'est la que le train part. */
/* station de tokyo retirée */
P('x_tableau', Math.floor(MONDE_L/2), XP.maisonsY+120, {col:[30,10]});
/* hangar idle docker retire */

/* voiliers et pontons retirés */
/* LE METRO EST DEPOSE. On ne prend plus la ligne 1 pour aller au bois :
   on y va a pied, par le bas du quai droit. */
/* les réverbères et les bancs du quai sont en dur ; ceux des deux bouts (280, 390, 1496, 1510) sont retirés */
[420,840,980,1120,1248,1710].forEach((x,i)=>P('lanterneP',x,XP.quaiY-16,{gr:i+1,col:[4,3]}));
[88,670,950,1230,1370,1672]
.forEach(x=>P('bancP',x,XP.quaiY-24,{col:[23,7]}));
/* L'ESPLANADE DU BOUT reste nue : les deux platanes et la petite pancarte
   sont retires. C'est la grande affiche, derriere le garde-corps, qui dit
   ou mene le bout du quai. */
for(let x=24;x<MONDE_L-24;x+=74){
P('x_bitte',x,XP.quaiY-3,{col:[4,3]});
}
/* LA LANGUE DE TERRE DU SUD-OUEST EST SOUS L'EAU : avec elle partent les
   quatre platanes, les deux bancs et les quatre boulistes qui s'y
   tenaient. Les boulistes de Notre-Dame-de-la-Garde, eux, ne bougent pas. */
STATIONS_VELO.forEach(([x,y])=>P('x_stationVelo',x,y,{col:[40,5]}));
/* ton bateau retiré */

DECOR.forEach(o=>{if(o.t.slice(0,2)==='x_')graverX(o.t,o.v);});
DECOR.sort((a,b)=>a.y-b.y);invaliderGrille();
}
/* ================= LE SOL AU DEMI-PIXEL =================
   Le sol du port est gravé à un pixel de jeu par pixel de toile, puis
   étiré par la caméra : au palier « nette », sur un écran à trois points
   par pixel, chaque pixel du pavé devient un carré de six. C'est lui, et
   pas les personnages, qui donne au port son air de gros carrés.

   Le jeu sait déjà afficher un sol en double définition — SOL_FIN, dessiné
   en camX*2 — mais aucune carte ne s'en servait. On construit donc une
   seconde toile deux fois plus grande : la première est agrandie dedans,
   telle quelle, puis on repasse par-dessus ce qui gagne à être fin — les
   joints du pavé, son grain, les rides de l'eau et le reflet des façades.
   Tout le reste du décor est inchangé, au pixel près. */
function affinerLeSolExtramar(sol){
const c=document.createElement('canvas');
c.width=MONDE_L*2;c.height=MONDE_H*2;
const g=c.getContext('2d');g.imageSmoothingEnabled=false;
g.drawImage(sol,0,0,MONDE_L*2,MONDE_H*2);          /* la base, telle quelle */
g.setTransform(2,0,0,2,0,0);g.imageSmoothingEnabled=false;
const R=(x,y,w,h,col)=>{g.fillStyle=col;g.fillRect(x,y,w,h);};
const A=(i)=>alea(i*1.37+0.5);
/* LE MASQUE DU TREMPLIN EST PARTI AVEC LUI. Il reservait au milieu du
   quai un rectangle ou ni les joints des dalles ni les 26 000 grains
   de pierre ne tombaient, pour que le bois de la rampe ne prenne pas
   l'air d'un pave un peu plus sombre. Sans rampe, ce rectangle lisse
   se serait vu comme une dalle posee la. */
/* ---- LE PAVÉ : des joints d'un demi-pixel, un grain plus fin ---- */
dallesDuQuai((x,y,w,h)=>{
  if(y>=XP.quaiY-4)return;                       /* au-dela c'est l'eau */
  R(x,y,w,0.5,'rgba(112,108,100,.42)');
  R(x,y,0.5,h,'rgba(112,108,100,.42)');
  R(x,y+0.5,w,0.5,'rgba(255,255,255,.30)');   /* l'arete polie */
  R(x+w-0.5,y+0.5,0.5,h-0.5,'rgba(90,88,84,.12)');
  /* PLUS DE FILET CLAIR SOUS LE JOINT : c'etait le dessus eclaire d'une
     brique, et c'est lui qui dressait le quai en mur. */
});
for(let i=0;i<26000;i++){
  const x=A(i*1.7)*MONDE_L, y=XP.maisonsY-6+A(i*2.9)*(XP.quaiY-XP.maisonsY+2);
  R(x,y,0.5,0.5,(i%3)?'rgba(255,255,255,.16)':'rgba(90,90,100,.12)');
}
for(let i=0;i<900;i++){
  const x=A(i*3.3+7)*MONDE_L, y=XP.maisonsY-6+A(i*4.1+2)*(XP.quaiY-XP.maisonsY+2);
  R(x,y,1+A(i)*2,0.5,'rgba(100,98,94,.10)');
}

/* ombres des facades retirees */

/* ================= LA LUMIÈRE SUR LE QUAI =================
   Un dégradé chaud depuis le haut-gauche, un refroidissement vers l'eau :
   la pierre cesse d'être un aplat et prend le soleil. */
{
const haut=g.createLinearGradient(0,XP.maisonsY,MONDE_L*0.55,XP.quaiY);
haut.addColorStop(0,'rgba(255,226,160,.13)');
haut.addColorStop(0.55,'rgba(255,238,200,.04)');
haut.addColorStop(1,'rgba(96,118,140,.07)');
g.fillStyle=haut;g.fillRect(0,XP.maisonsY,MONDE_L,XP.quaiY-XP.maisonsY);
/* l'humidité au bord de l'eau : la pierre y est plus sombre et plus froide */
for(let y=0;y<22;y++){
  const t=y/22, a=0.16*t*t;
  R(0,XP.quaiY-22+y,MONDE_L,0.5,'rgba(74,92,104,'+a.toFixed(3)+')');
}
}

/* ================= L'EAU =================
   Elle était un dégradé et quatre cents traits. On lui donne ce qui fait
   une eau de port : l'ombre du quai juste sous la margelle, le reflet
   coloré de la ville qui tremble, les rides fines, et le soleil qui
   s'éparpille en paillettes dans une bande. */
const eauH=MONDE_H-XP.quaiY;
/* l'ombre portée du quai sur l'eau */
for(let y=0;y<14;y++){
  const t=y/14, a=0.30*(1-t)*(1-t);
  R(XP.bassinO,XP.quaiY+2+y,XP.bassinE-XP.bassinO,0.5,'rgba(10,34,54,'+a.toFixed(3)+')');
}
/* LE REFLET DE LA VILLE. Chaque façade de la rangée jette sa couleur dans
   l'eau, étalée et tremblante. Les enduits sont ceux des immeubles, pris
   dans le même ordre : la ville se reconnaît dans son port. */
{
const REF=['#dfb672','#dca088','#d6c6a0','#c8845a','#1d3a5a','#9e1822','#b8853e','#e3d6b6'];
for(let x=XP.bassinO+2;x<XP.bassinE-2;x+=0.5){
  const k=Math.max(0,Math.round((x-XP.rangX0)/140));
  const col=REF[k%REF.length];
  const h=16+A(k*3.1)*10;
  for(let y=0;y<h;y++){
    const t=y/h;
    const d=Math.sin((x*0.07)+(y*0.55))*1.2*(0.3+t);
    const a=0.16*(1-t)*(1-t);
    if(a<0.004)continue;
    g.globalAlpha=a;R(x+d,XP.quaiY+5+y,0.5,0.5,col);g.globalAlpha=1;
  }
}
}
/* les rides, fines */
for(let i=0;i<14000;i++){
  const x=XP.bassinO+2+A(i*1.9+11)*(XP.bassinE-XP.bassinO-4);
  const y=XP.quaiY+6+A(i*3.7+5)*(eauH-8);
  const l=1+A(i*5.1)*3;
  R(x,y,l,0.5,(i%4)?'rgba(186,232,240,.17)':'rgba(14,58,98,.17)');
}
/* LES PAILLETTES DU SOLEIL, dans une bande oblique */
for(let i=0;i<2600;i++){
  const x=XP.bassinO+A(i*2.3+3)*(XP.bassinE-XP.bassinO);
  const y=XP.quaiY+8+A(i*4.7+9)*(eauH-12);
  const bande=1-Math.min(1,Math.abs((y-XP.quaiY)-(eauH*0.42)-Math.sin(x*0.013)*26)/44);
  if(bande<=0.05)continue;
  const a=(0.10+A(i*6.1)*0.42)*bande;
  R(x,y,0.5+A(i)*1,0.5,'rgba(255,250,224,'+a.toFixed(3)+')');
  if(A(i*7.7)>0.86)R(x,y-0.5,0.5,0.5,'rgba(255,255,255,'+(a*0.8).toFixed(3)+')');
}
/* le fond, plus profond au large */
{
const fond=g.createLinearGradient(0,XP.quaiY,0,MONDE_H);
fond.addColorStop(0,'rgba(6,34,62,0)');
fond.addColorStop(1,'rgba(6,30,58,.22)');
g.fillStyle=fond;g.fillRect(XP.bassinO,XP.quaiY,XP.bassinE-XP.bassinO,eauH);
}
/* la margelle reprend sa lumière par-dessus l'eau */
R(XP.bassinO-4,XP.quaiY-4,XP.bassinE-XP.bassinO+8,0.5,'rgba(255,248,226,.40)');
g.setTransform(1,0,0,1,0,0);
return c;
}
;({XP,CARGO_X,PAV,STATIONS_VELO,surPonton,dansLeBassin,bloqueExtramar,GX,bloqueGarde,construireSolGarde,graverLaBasilique,graverLaLongueVue,semerDecorGarde,panoramaGarde,construireSolExtramar,TU_M,ENDUITS,PI_X,toitCanal,enduit,chaine,fenetreM,balconM,VOLETS,graverImmeuble,graverLaGarde,graverBelArbre,graverLaCriee,graverLaStationVelo,graverTonBateau,graverArbuste,FERRY,positionDuFerry,BANCS,eauVivante,semerDecorExtramar,affinerLeSolExtramar,graverLePortAutonome,dessinerLePanorama,heureDuPort});