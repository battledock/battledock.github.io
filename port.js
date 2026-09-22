/* =====================================================================
   LE PORT (EXTRAMAR) — chargé par jeu.html seulement quand on est au port.
   Ce code est évalué DANS la portée du jeu : il voit toutes ses fonctions.
   ===================================================================== */
/* =====================================================================
   EXTRAMAR — LE VIEUX PORT
   La deuxième carte du même moteur : jeu.html?carte=extramar.
   Même joueur, même sac, même liste « en ligne » ; un autre sol, un autre
   décor, d'autres collisions. Le métro relie les deux.

   LE PLAN (en points de jeu, sur 1400 × 600) :
     · au nord, une rangée de façades ocre, rose et jaune (y < 150) ;
     · le grand quai dallé de pierre blonde, d'ouest en est ;
     · le bassin, au sud, entre le quai ouest et la jetée est ;
     · trois pontons de bois qui s'avancent dans l'eau, les barques autour ;
     · le cargo amarré contre la jetée, sa grue, et le phare au bout.
   ===================================================================== */
const XP={
  maisonsY:152,            /* le pied des façades */
  quaiY:340,               /* le bord du quai, au-dessus du bassin */
  bassinO:170, bassinE:1210,
  pontons:[360,620,880], pontonL:13, pontonFin:470,
  metro:[250,268],
  ruelle:{x:630,l:22,haut:30},   /* la montée vers Notre-Dame : axe, demi-largeur, sommet */
  boulo:[30,392,120,172],   /* le boulodrome : x, y, largeur, hauteur */
};
const CARGO_X={pile:[1266,566],docks:[1318,446]};
const PAV={poisson:[552,250],peche:[708,250]};
const CABANON=[1320,440];                              /* le cabanon de la bouillabaisse */
const STATIONS_VELO=[[284,214],[1190,238]];            /* les stations de vélos */
/* (gardé dans jeu.html) */                                         /* sur un vélo : on va plus vite */    /* les deux pavillons du milieu */   /* où l'on prend, où l'on dépose */
const surPonton=(x,y)=>XP.pontons.some(px=>Math.abs(x-px)<XP.pontonL&&y<XP.pontonFin);
const dansLeBassin=(x,y)=>x>XP.bassinO&&x<XP.bassinE&&y>XP.quaiY;
function bloqueExtramar(x,y){
  /* la ruelle : seul endroit où l'on passe entre les immeubles, vers le haut */
  const dansRuelle=Math.abs(x-XP.ruelle.x)<XP.ruelle.l&&y>=XP.ruelle.haut;   /* la montée du casino */
  if(x<BORD-12||x>MONDE_L-BORD+12||(y<XP.maisonsY+6&&!dansRuelle)||y>MONDE_H-8)return true;
  if(dansLeBassin(x-3,y)||dansLeBassin(x+3,y)||dansLeBassin(x,y+2)){
    if(!surPonton(x,y))return true;              /* l'eau : on ne nage pas */
  }
  for(const o of DECOR){
    if(!o.col)continue;
    if(Math.abs(x-o.x)<o.col[0]&&y>o.y-o.col[1]&&y<o.y+3)return true;
  }
  return false;
}

/* =====================================================================
   NOTRE-DAME DE LA GARDE — la troisième carte du même moteur :
   jeu.html?carte=garde. On y arrive par la ruelle d'Extramar. Le plateau
   tout en haut de la colline : le fort et la basilique au nord, le grand
   parvis au milieu, la balustrade tout autour — et, par-dessus, la ville
   entière, loin en bas, jusqu'à la mer.
   ===================================================================== */
const GX={
  plO:52, plE:588, plN:150, plS:560,          /* le plateau */
  basil:[320,330],                             /* le pied du fort, au centre */
  descente:{x:320,l:18},                       /* l'escalier qui redescend, au sud */
  longues:[[150,548],[490,548]],               /* les longues-vues */
};
function bloqueGarde(x,y){
  /* l'escalier du sud : on peut s'y engager pour redescendre */
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
  /* 1 · TOUT EN BAS, LA VILLE : des toits minuscules, voilés par l'altitude,
     et la mer qui prend tout l'ouest */
  R(0,0,MONDE_L,MONDE_H,'#b9a888');
  for(let y=0;y<MONDE_H;y+=5){
    let x=-((y*7)%11);
    while(x<MONDE_L){const w=5+Math.floor(A(x*0.7+y)*7);
      R(x,y,w,3,['#c9825a','#d49468','#bf7650','#e0c49a','#d8b48a'][Math.floor(A(x+y*3)*5)]);R(x,y+3,w,1,'#8f6a4a');
      x+=w+1;}
  }
  /* la mer, et la côte découpée */
  for(let y=0;y<MONDE_H;y++){
    const cote=Math.round(130+Math.sin(y/37)*26+Math.sin(y/11)*6+(y>380?(y-380)*0.9:0));
    const k=y/MONDE_H;
    R(0,y,cote,1,'rgb('+(50+k*10|0)+','+(110+k*20|0)+','+(160+k*10|0)+')');
    R(cote,y,2,1,'#e8dcc0');
  }
  for(let i=0;i<140;i++)R(A(i)*150,A(i+300)*MONDE_H,3,1,'rgba(230,245,255,.35)');
  /* le voile de l'altitude sur tout le bas */
  g.fillStyle='rgba(200,215,230,.42)';g.fillRect(0,0,MONDE_L,MONDE_H);
  /* 2 · LE PLATEAU : la falaise de calcaire au sud, le dallage du parvis */
  const P=GX;
  /* la falaise, vue de face, sous la balustrade du sud */
  for(let x=P.plO;x<P.plE;x++){
    for(let y=P.plS;y<MONDE_H;y++){
      const st=Math.floor((y-P.plS)/5);
      R(x,y,1,1,((x+st*7)%13<2)?'#8a7a5c':(((y-P.plS)%5===0)?'#aa9a78':((x*3+y)%11<3?'#d6c8a2':'#c4b48e')));
    }
  }
  /* les flancs est et ouest, vus d'en haut : un rebord de rocher */
  R(P.plO-8,P.plN,8,P.plS-P.plN,'#aa9a78');R(P.plE,P.plN,8,P.plS-P.plN,'#aa9a78');
  R(P.plO-8,P.plN,1,P.plS-P.plN,'#8a7a5c');R(P.plE+7,P.plN,1,P.plS-P.plN,'#8a7a5c');
  /* le dallage : grandes dalles blondes */
  R(P.plO,P.plN,P.plE-P.plO,P.plS-P.plN,'#dccfae');
  for(let y=P.plN;y<P.plS;y+=12){const d=(y/12)%2?10:0;
    R(P.plO,y,P.plE-P.plO,1,'#c2b490');
    for(let x=P.plO+d;x<P.plE;x+=20){R(x,y,1,12,'#c2b490');R(x+1,y+1,18,1,'#e8ddc0');
      if(A(x*3+y)<.18)R(x+4,y+4,6,3,'rgba(120,100,70,.10)');}}
  /* LA ROSE DES VENTS en mosaïque, au milieu du parvis */
  const mx=320,my=456;
  g.fillStyle='#c9b68a';g.beginPath();g.arc(mx,my,46,0,7);g.fill();
  g.fillStyle='#e8ddc0';g.beginPath();g.arc(mx,my,42,0,7);g.fill();
  g.strokeStyle='#8a7a5c';g.lineWidth=1;g.beginPath();g.arc(mx,my,38,0,7);g.stroke();
  for(let k=0;k<16;k++){const a=k*Math.PI/8, r=k%4===0?36:(k%2?18:26);
    g.fillStyle=k%4===0?'#2d4a6a':(k%2?'#c9a24a':'#8a2a2a');
    g.beginPath();g.moveTo(mx+Math.cos(a)*r,my+Math.sin(a)*r*0.8);
    g.lineTo(mx+Math.cos(a+0.22)*6,my+Math.sin(a+0.22)*5);g.lineTo(mx+Math.cos(a-0.22)*6,my+Math.sin(a-0.22)*5);g.fill();}
  g.fillStyle='#e8c06a';g.beginPath();g.arc(mx,my,4,0,7);g.fill();
  /* LA BALUSTRADE : tout le tour du plateau, ouverte au sud sur l'escalier */
  const balustre=(x,y)=>{R(x,y-7,3,7,'#e3d8bc');R(x,y-7,3,1,'#f4ecd4');R(x+1,y-5,1,3,'#cfc2a4');};
  for(let x=P.plO;x<P.plE;x+=5){
    if(Math.abs(x-P.descente.x)<P.descente.l+4)continue;
    balustre(x,P.plS);}
  R(P.plO,P.plS-9,P.descente.x-P.descente.l-4-P.plO,3,'#efe4c2');
  R(P.descente.x+P.descente.l+4,P.plS-9,P.plE-P.descente.x-P.descente.l-4,3,'#efe4c2');
  R(P.plO-2,P.plN,4,P.plS-P.plN,'#e3d8bc');R(P.plE-2,P.plN,4,P.plS-P.plN,'#e3d8bc');
  for(let y=P.plN;y<P.plS;y+=6){R(P.plO-2,y,4,1,'#b9ac8c');R(P.plE-2,y,4,1,'#b9ac8c');}
  /* L'ESCALIER qui redescend vers la ruelle */
  const ex=P.descente.x-P.descente.l, ew=P.descente.l*2;
  for(let y=P.plS-8,k=0;y<MONDE_H;y+=5,k++){R(ex,y,ew,5,k%2?'#d9c7a0':'#e2d2ab');R(ex,y,ew,1,'#efe3c4');R(ex,y+4,ew,1,'#b9a57c');}
  R(ex-3,P.plS-8,3,MONDE_H-P.plS+8,'#aa9a78');R(ex+ew,P.plS-8,3,MONDE_H-P.plS+8,'#aa9a78');
  return c;
}

/* LA BASILIQUE SUR SON FORT, de trois quarts : le soubassement crénelé et
   son grand escalier, la nef rayée et son toit, la coupole, le clocher, et
   tout en haut, la Vierge dorée. */
function graverLaBasilique(){
  const W=320,Ht=320,cx=W/2,sol=Ht-6;
  const c=document.createElement('canvas');
  const D=Math.max(1,Math.min(2,Math.floor(window.devicePixelRatio||1)));
  c.width=W*D;c.height=Ht*D;
  const g=c.getContext('2d');g.setTransform(D,0,0,D,0,0);g.imageSmoothingEnabled=false;
  const R=(x,y,w,h,col)=>{g.fillStyle=col;g.fillRect(x|0,y|0,Math.max(1,w|0),Math.max(1,h|0));};
  const PI={o:'#8a7a5c',s:'#aa9a78',p:'#c4b48e',c:'#d6c8a2',h:'#e6dab8',e:'#f2ead0'};
  const blanc='#f4efe2', vert='#6f8676', vertS='#56695c';
  const raye=(x,y,w,h,pas)=>{for(let j=0;j<h;j++)R(x,y+j,w,1,(Math.floor(j/(pas||4))%2)?vert:blanc);
    R(x,y,1,h,'rgba(255,255,255,.45)');R(x+w-1,y,1,h,'rgba(0,0,0,.18)');};
  g.fillStyle='rgba(40,30,18,.25)';g.beginPath();g.ellipse(cx+6,sol+3,W*0.46,10,0,0,7);g.fill();
  /* 1 · LE FORT : la terrasse vue d'en haut, puis le mur de face */
  const murH=58, terrH=44, yT=sol-murH-terrH;
  R(14,yT,W-28,terrH,'#d8cba8');
  for(let y=yT;y<yT+terrH;y+=8){R(14,y,W-28,1,'#c2b490');for(let x=14+((y/8)%2?8:0);x<W-14;x+=16)R(x,y,1,8,'#c2b490');}
  R(10,sol-murH,W-20,murH,PI.p);
  for(let y=sol-murH;y<sol;y+=6){const d=((y/6)%2)?9:0;R(10,y,W-20,1,PI.s);
    for(let x=10+d;x<W-10;x+=18)R(x,y,1,6,PI.s);R(10,y+1,W-20,1,'rgba(255,255,255,.12)');}
  for(let x=10;x<W-10;x+=12){R(x,sol-murH-8,8,8,PI.c);R(x,sol-murH-8,8,1,PI.e);R(x+7,sol-murH-8,1,8,PI.s);}   /* les merlons */
  R(10,sol-murH,W-20,2,'rgba(40,30,15,.25)');
  /* les meurtrières */
  [40,76,W-84,W-48].forEach(x=>{R(x,sol-38,3,12,'#3a3226');R(x-2,sol-32,7,2,'#3a3226');});
  /* 2 · LE GRAND ESCALIER, taillé dans le fort, jusqu'au porche */
  const eL=64, ex=cx-eL/2;
  for(let k=0;k<14;k++){const y=sol-4-k*4, w=eL-k*1;R(cx-w/2,y,w,4,k%2?'#e2d2ab':'#ebdcb8');R(cx-w/2,y,w,1,'#f6ecd2');R(cx-w/2,y+3,w,1,PI.s);}
  R(ex-6,sol-58,6,58,PI.c);R(ex+eL,sol-58,6,58,PI.c);R(ex-6,sol-58,6,1,PI.e);R(ex+eL,sol-58,6,1,PI.e);
  g.strokeStyle='#3b3a36';g.lineWidth=.8;g.beginPath();g.moveTo(ex-3,sol-6);g.lineTo(ex+4,sol-60);g.moveTo(ex+eL+3,sol-6);g.lineTo(ex+eL-4,sol-60);g.stroke();
  /* 3 · LA NEF : son toit vu d'en haut, qui file vers le fond */
  const nx=cx-78, nL=156, fy=yT+14;                       /* pied de la façade, sur la terrasse */
  R(nx+6,fy-126,nL-12,60,'#9aa296');
  for(let x=nx+6;x<nx+nL-6;x+=6){R(x,fy-126,1,60,'#7e867a');R(x+1,fy-126,1,60,'#b4bbae');}
  R(nx+6,fy-126,nL-12,2,'#c4cabe');
  /* LA GRANDE COUPOLE, à la croisée, avec ses côtes et sa croix */
  const kx=cx, ky=fy-116;
  g.fillStyle='#b8b4a2';g.beginPath();g.ellipse(kx,ky,30,22,0,Math.PI,0);g.fill();
  R(kx-32,ky,64,8,'#c4c0ae');raye(kx-32,ky,64,8,2);
  for(let a=0;a<7;a++){const t=Math.PI+a*Math.PI/6;g.strokeStyle='#8e8a7a';g.lineWidth=1;g.beginPath();
    g.moveTo(kx+Math.cos(t)*30,ky+Math.sin(t)*22);g.lineTo(kx,ky-22);g.stroke();}
  g.fillStyle='rgba(255,255,255,.35)';g.beginPath();g.ellipse(kx-10,ky-10,9,7,0,0,7);g.fill();
  R(kx-2,ky-30,4,8,'#d8cfae');R(kx-1,ky-38,2,8,'#e8c06a');R(kx-3,ky-35,6,2,'#e8c06a');
  /* LES PETITES COUPOLES des chapelles */
  [[nx+22,fy-66],[nx+nL-22,fy-66]].forEach(([x,y])=>{g.fillStyle='#b8b4a2';g.beginPath();g.ellipse(x,y,13,10,0,Math.PI,0);g.fill();
    g.fillStyle='#e6e2d2';g.beginPath();g.ellipse(x-3,y-3,6,4,0,0,7);g.fill();R(x-1,y-16,2,6,'#e8c06a');R(x-3,y-14,6,1,'#e8c06a');});
  /* LA FAÇADE de la nef, rayée, et ses baies en plein cintre */
  raye(nx,fy-66,nL,66,4);
  R(nx-2,fy-68,nL+4,3,vertS);R(nx-2,fy-68,nL+4,1,'#8fa096');
  [nx+14,nx+36,nx+nL-46,nx+nL-24].forEach(x=>{R(x,fy-50,10,26,'#2e3a44');g.fillStyle='#2e3a44';g.beginPath();g.arc(x+5,fy-50,5,Math.PI,0);g.fill();
    R(x+4,fy-50,1,26,'#56695c');R(x-2,fy-24,14,2,PI.e);});
  /* 4 · LE CLOCHER, devant la nef : tour rayée, beffroi, horloge, porche */
  const tx=cx, tl=40, tb=fy+2;
  raye(tx-tl/2,tb-110,tl,110,5);
  R(tx-tl/2-2,tb-112,tl+4,3,vertS);R(tx-tl/2-2,tb-76,tl+4,3,vertS);R(tx-tl/2-2,tb-44,tl+4,3,vertS);
  /* le porche d'entrée, au pied */
  R(tx-12,tb-34,24,34,'#3a2a1c');g.fillStyle='#3a2a1c';g.beginPath();g.arc(tx,tb-34,12,Math.PI,0);g.fill();
  R(tx-14,tb-48,28,2,PI.e);R(tx-1,tb-34,2,34,'#2a1c10');
  for(let y=tb-30;y<tb;y+=5)for(let x=tx-10;x<tx+11;x+=5)R(x,y,1,1,'#c9a24a');
  /* l'horloge */
  R(tx-9,tb-68,18,18,'#e8e2d0');R(tx-8,tb-67,16,16,'#1f2a3a');R(tx-1,tb-66,2,7,'#e8c06a');R(tx,tb-60,6,1,'#e8c06a');
  /* le beffroi : deux baies géminées */
  [[-11],[3]].forEach(([dx])=>{R(tx+dx,tb-104,8,22,'#2e3a44');g.fillStyle='#2e3a44';g.beginPath();g.arc(tx+dx+4,tb-104,4,Math.PI,0);g.fill();
    R(tx+dx+3,tb-104,1,22,vertS);});
  R(tx-3,tb-94,6,6,'#c9a24a');                                                          /* le bourdon */
  /* le lanternon et le socle */
  R(tx-16,tb-120,32,8,blanc);R(tx-16,tb-120,32,1,'#ffffff');R(tx-16,tb-113,32,1,vertS);
  R(tx-10,tb-130,20,10,'#d8d2c0');R(tx-10,tb-130,20,1,'#f2ecdc');
  R(tx-6,tb-136,12,6,'#bdb7a5');
  /* 5 · LA VIERGE À L'ENFANT, toute d'or */
  const vy=tb-136;
  R(tx-5,vy-30,10,30,'#c8902a');R(tx-3,vy-30,5,30,'#e8b84a');R(tx-1,vy-30,1,28,'#fff0b8');
  R(tx-4,vy-37,8,7,'#e8b84a');R(tx-2,vy-36,3,3,'#fff4c8');                                 /* la tête et la couronne */
  R(tx-4,vy-39,8,2,'#f4d98a');for(let k=-3;k<4;k+=2)R(tx+k,vy-41,1,2,'#f4d98a');
  R(tx-11,vy-24,6,8,'#d8a03a');R(tx-12,vy-28,5,5,'#e8b84a');R(tx-11,vy-27,2,2,'#fff4c8');     /* l'Enfant */
  R(tx-5,vy-8,10,8,'#b88226');
  /* LA NUIT */
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
/* LA LONGUE-VUE à pièces, au bord de la balustrade */
function graverLaLongueVue(){
  const W=24,Ht=30,cx=12,sol=26;
  const c=document.createElement('canvas');
  const D=Math.max(1,Math.min(2,Math.floor(window.devicePixelRatio||1)));
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
  /* les bancs du parvis, tournés vers la vue */
  [[130,392],[510,392],[130,480],[510,480],[220,530],[420,530],[92,436],[548,436]].forEach(([x,y])=>P('bancP',x,y));
  /* les lanternes */
  [[196,356],[444,356],[100,524],[540,524],[250,420],[390,420]].forEach(([x,y],i)=>P('lanterneP',x,y,{gr:i}));
  GX.longues.forEach(([x,y])=>P('x_longuevue',x,y,{col:[5,3]}));
  /* des pèlerins et des promeneurs, immobiles */
  [[296,388,'haut',{veste:1,chapeau:1}],[350,396,'haut',{veste:2,cheveux:1}],
   [206,470,'gauche',{veste:0,barbe:1}],[456,476,'droite',{veste:2,chapeau:2}]]
    .forEach(([x,y,dir,ap],i)=>P('x_bouliste',x,y,{v:i+1,dir,ap,col:[5,3]}));
}
/* LE PANORAMA : ce qu'on voit dans la longue-vue */
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
  /* le cercle de la lunette */
  g.fillStyle='#000';g.beginPath();g.rect(0,0,W,H);g.arc(W/2,H/2,Math.min(W,H)*0.48,0,7,true);g.fill('evenodd');
}

/* ---------------- LE SOL : dalles, eau, pontons ---------------- */
function construireSolExtramar(){
  const c=document.createElement('canvas');c.width=MONDE_L;c.height=MONDE_H;
  const g=c.getContext('2d');
  const R=(x,y,w,h,col)=>{g.fillStyle=col;g.fillRect(x|0,y|0,Math.max(1,w|0),Math.max(1,h|0));};
  const A=(i)=>alea(i*1.37+0.5);
  /* la colline derrière les maisons : garrigue et toits lointains */
  R(0,0,MONDE_L,160,'#b8a888');
  /* LE QUAI : dalles de calcaire blond, de tailles inégales */
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
  graverLesToitsDuFond(g,MONDE_L,160);
  /* LA MONTÉE : une ruelle en escaliers entre deux immeubles, bordée de
     petites maisons, qui grimpe vers le CASINO */
  {
    const cx=XP.ruelle.x, xg=cx-71, xd=cx+71, ym=XP.maisonsY+6;
    /* les maisons basses de part et d'autre : toits vus d'en haut, un mur sur la ruelle */
    [[xg,cx-30,1],[cx+30,xd,-1]].forEach(([a,b,sens],j)=>{
      for(let y=0;y<ym;y+=4)for(let x=a;x<b;x+=5){R(x,y,5,4,((x+y*3)>>2)%3?'#b85e32':'#c9743e');R(x+4,y,1,4,'#8f3f20');R(x,y,5,1,'#e0925a');}
      /* le faîtage, qui court le long de la ruelle, et l'ombre du versant */
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
    /* les marches, avec leurs paliers */
    const x0=cx-30, w=60;
    for(let y=ym,k=0;y>XP.ruelle.haut-14;k++){
      const palier=k%6===5, h=palier?10:6;
      R(x0,y-h,w,h,palier?'#e2d2ab':'#dccba5');
      R(x0,y-h,w,1,'#efe3c4');R(x0,y-2,w,2,'#b9a57c');
      for(let i=0;i<4;i++)R(x0+alea(k*7+i)*w,y-h+1+alea(k*3+i)*(h-3),2,1,'rgba(120,90,50,.18)');
      if(palier){R(x0+2,y-h+2,5,5,'#a55a3a');R(x0+2,y-h,5,3,'#6fbf5a');R(x0+w-7,y-h+2,5,5,'#a55a3a');R(x0+w-7,y-h,5,3,'#d9576b');}
      y-=h;
    }
    R(x0-2,0,2,ym,'#b9a57c');R(x0+w,0,2,ym,'#b9a57c');                                          /* les bordures */
    /* le passage voûté, en haut : on devine la suite de la montée */
    const hy=XP.ruelle.haut-14;
    R(x0,0,w,hy,'#2a2420');
    g.fillStyle='#d9c7a0';g.beginPath();g.moveTo(x0-4,hy+2);g.lineTo(x0-4,hy-8);g.arc(cx,hy-8,w/2+4,Math.PI,0);g.lineTo(x0+w+4,hy+2);g.lineTo(x0+w,hy+2);
    g.lineTo(x0+w,hy-8);g.arc(cx,hy-8,w/2,0,Math.PI,true);g.lineTo(x0,hy+2);g.closePath();g.fill();
    for(let a=0;a<9;a++){const t=Math.PI+a*Math.PI/8;R(cx+Math.cos(t)*(w/2+2)-1,hy-8+Math.sin(t)*(w/2+2)-1,2,2,'#b9a57c');}
    const fond=g.createLinearGradient(0,hy,0,hy+24);fond.addColorStop(0,'rgba(20,16,12,.55)');fond.addColorStop(1,'rgba(20,16,12,0)');
    g.fillStyle=fond;g.fillRect(x0,hy,w,24);
    /* l'enseigne du casino, sur la voûte : lettres d'or sur fond rouge */
    R(cx-24,Math.max(0,hy-30),48,10,'#5a1a1a');R(cx-23,Math.max(0,hy-29),46,8,'#8a2a22');
    g.font='700 7px Georgia,serif';g.textAlign='center';g.fillStyle='#f0cf7d';g.fillText('CASINO',cx,Math.max(0,hy-30)+8);g.textAlign='left';
    for(let k=0;k<7;k++){R(cx-22+k*7,Math.max(0,hy-32),2,2,'#ffe07a');}
  }
  /* LE BASSIN : turquoise sur les bords, bleu profond au large */
  for(let y=XP.quaiY;y<MONDE_H;y++){
    const k=(y-XP.quaiY)/(MONDE_H-XP.quaiY);
    for(let x=XP.bassinO;x<XP.bassinE;x+=2){
      const bord=Math.min(x-XP.bassinO,XP.bassinE-x,(y-XP.quaiY)*1.4);
      const p=Math.min(1,bord/90)*0.6+k*0.4;
      const r=Math.round(52-p*22), gg=Math.round(168-p*58), b=Math.round(186-p*30);
      g.fillStyle='rgb('+r+','+gg+','+b+')';g.fillRect(x,y,2,1);
    }
  }
  /* les rides de l'eau, gravées : le mouvement vient par-dessus */
  for(let i=0;i<420;i++){
    const x=XP.bassinO+8+A(i+3000)*(XP.bassinE-XP.bassinO-16), y=XP.quaiY+10+A(i+3400)*(MONDE_H-XP.quaiY-14);
    R(x,y,3+A(i)*5,1,i%3?'rgba(160,225,235,.35)':'rgba(20,70,110,.35)');
  }
  /* LE BORD DU QUAI : la margelle, et le mur qui plonge dans l'eau */
  const margelle=(x,y,w,h)=>{R(x,y,w,h,'#bfae88');R(x,y,w,1,'#efe3c4');};
  margelle(XP.bassinO-4,XP.quaiY-4,XP.bassinE-XP.bassinO+8,5);
  R(XP.bassinO,XP.quaiY+1,XP.bassinE-XP.bassinO,6,'#8f8468');
  R(XP.bassinO,XP.quaiY+7,XP.bassinE-XP.bassinO,2,'rgba(10,40,60,.35)');
  margelle(XP.bassinO-4,XP.quaiY,5,MONDE_H-XP.quaiY);
  margelle(XP.bassinE-1,XP.quaiY,5,MONDE_H-XP.quaiY);
  R(XP.bassinE-7,XP.quaiY+6,6,MONDE_H-XP.quaiY,'rgba(10,40,60,.25)');
  /* LES PONTONS : planches de bois, poteaux dans l'eau */
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
  /* LE BOULODROME, sous les platanes : sable stabilisé, bordure de bois,
     deux pistes, et des boules qui attendent le prochain point */
  {
    const B=XP.boulo, x0=B[0],y0=B[1],w=B[2],h=B[3];
    R(x0-3,y0-3,w+6,h+6,'#6b4a2c');R(x0-3,y0-3,w+6,1,'#a97f52');R(x0-3,y0+h+2,w+6,1,'#4f3520');
    R(x0,y0,w,h,'#d8bf8c');
    for(let i=0;i<900;i++)R(x0+A(i+5000)*w,y0+A(i+6000)*h,1,1,
      ['#c9ad78','#e6d0a0','#bca06a','#d0b682'][i%4]);
    for(let y=y0+2;y<y0+h;y+=3)R(x0+w/2,y,1,2,'#f2efe4');                      /* la ficelle entre les pistes */
    /* les ronds de lancer, tracés du pied */
    const rond=(x,y)=>{g.strokeStyle='rgba(120,90,50,.55)';g.lineWidth=1;g.beginPath();g.ellipse(x,y,6,3,0,0,7);g.stroke();};
    rond(x0+w*0.27,y0+h-16);rond(x0+w*0.73,y0+16);
    /* les boules d'acier et le cochonnet */
    const boule=(x,y)=>{R(x-1,y-1,3,3,'#7d858c');R(x-1,y-1,2,1,'#e1e6ea');R(x+1,y+1,1,1,'#50575c');};
    [[0,0],[5,3],[-4,4],[2,-5],[8,-2]].forEach(([dx,dy])=>boule(x0+w*0.27+dx,y0+46+dy));
    [[0,0],[-6,2],[4,5]].forEach(([dx,dy])=>boule(x0+w*0.73+dx,y0+h-60+dy));
    R(x0+w*0.27+2,y0+44,2,2,'#d0402f');R(x0+w*0.73-2,y0+h-63,2,2,'#e8c06a');
    /* les traces de pas */
    for(let i=0;i<40;i++)R(x0+6+A(i+7000)*(w-12),y0+6+A(i+7100)*(h-12),2,1,'rgba(120,90,50,.18)');
  }
  /* quelques flaques d'ombre au pied des façades */
  R(0,XP.maisonsY-2,MONDE_L,8,'rgba(60,40,20,.12)');
  return c;
}

/* ================= EXTRAMAR, À LA HAUTEUR DU VILLAGE =================
   Même grammaire que les bâtiments du village : vue de trois quarts, le
   toit qu'on voit d'en haut, des matières (enduit, pierre, tuile canal,
   bois, fer), des devantures pleines de choses. */
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
  /* les coulures sous les appuis, les taches d'humidité en bas */
  for(let i=0;i<6;i++)R(x0+alea(i+graine)*w,y0+h-10-alea(i*3+graine)*6,3+alea(i*7)*6,8,'rgba(90,60,30,.10)');
}
function chaine(R,x,y0,h,cote){
  /* la chaîne d'angle : des pierres de taille alternées */
  for(let y=y0,k=0;y<y0+h;y+=6,k++){
    const w=k%2?7:10, xx=cote<0?x:x-w;
    R(xx,y,w,5,PI_X.c);R(xx,y,w,1,PI_X.e);R(xx,y+5,w,1,PI_X.o);
    R(cote<0?xx+w-1:xx,y,1,5,PI_X.s);
  }
}
function fenetreM(R,g,x,y,E,V,etat){
  /* l'encadrement de pierre, la vitre, les persiennes, l'appui */
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
  const D=Math.max(1,Math.min(2,Math.floor(window.devicePixelRatio||1)));
  c.width=W*D;c.height=Ht*D;
  const g=c.getContext('2d');g.setTransform(D,0,0,D,0,0);g.imageSmoothingEnabled=false;
  const R=(x,y,w,h,col)=>{g.fillStyle=col;g.fillRect(x|0,y|0,Math.max(1,w|0),Math.max(1,h|0));};
  const E=ENDUITS[v%4], V=VOLETS[(v*3+1)%4];
  const BL=138, x0=cx-BL/2, rez=40, etage=34, murH=rez+etage*2+8, basToit=sol-murH;
  g.fillStyle='rgba(40,30,18,.26)';g.beginPath();g.ellipse(cx+4,sol+3,BL*0.55,8,0,0,7);g.fill();
  /* le toit de tuiles canal, vu d'en haut, ses cheminées */
  toitCanal(R,cx,basToit,BL,30);
  [[x0+22,-24],[x0+BL-30,-18]].forEach(([x,dy])=>{R(x,basToit+dy-10,9,12,PI_X.p);R(x,basToit+dy-10,9,2,PI_X.e);
    R(x-1,basToit+dy-12,11,3,PI_X.s);R(x+2,basToit+dy-14,2,3,'#6e2c16');R(x+5,basToit+dy-14,2,3,'#6e2c16');});
  /* la génoise : trois rangs de tuiles en bout, sous la toiture */
  for(let r=0;r<3;r++){const y=basToit+3+r*3,ret=r*2;
    for(let x=x0-4+ret;x<x0+BL+4-ret;x+=4){R(x,y,3,3,r%2?TU_M.s:TU_M.c);R(x,y,3,1,TU_M.h);}}
  /* les murs */
  enduit(R,x0,basToit+12,BL,murH-12,E,v*17+3);
  R(x0,basToit+12,BL,3,'rgba(40,20,10,.28)');                    /* l'ombre sous la génoise */
  chaine(R,x0,basToit+12,murH-rez-12,-1);chaine(R,x0+BL,basToit+12,murH-rez-12,1);
  /* les deux étages */
  for(let n=0;n<2;n++){
    const yF=basToit+20+n*etage;
    R(x0,yF+etage-6,BL,4,PI_X.c);R(x0,yF+etage-6,BL,1,PI_X.e);R(x0,yF+etage-2,BL,1,'rgba(40,25,10,.25)');  /* le bandeau */
    for(let k=0;k<4;k++){
      const fx=x0+16+k*31;
      const ferme=alea(v*9+n*4+k)<0.25;
      fenetreM(R,g,fx,yF,E,V,ferme?'ferme':'ouvert');
      /* la vie aux fenêtres : pots, linge */
      if(!ferme&&n===1&&(k+v)%3===0)for(let f=0;f<12;f+=4){R(fx+f,yF+18,4,4,'#a55a3a');R(fx+f,yF+15,4,3,['#6fbf5a','#d9576b','#e8c06a'][f/4]);}
    }
    if(n===0){balconM(R,x0+10,yF+23,BL-20);}                     /* le balcon filant du premier */
    if(n===1&&v%2===0){                                           /* du linge qui sèche entre deux fenêtres */
      g.strokeStyle='rgba(60,60,60,.6)';g.lineWidth=.5;g.beginPath();g.moveTo(x0+34,yF+6);g.lineTo(x0+72,yF+6);g.stroke();
      [['#f2efe4',38],['#6a9ad0',48],['#d9576b',58]].forEach(([col,lx])=>{R(x0+lx,yF+6,7,9,col);R(x0+lx,yF+6,7,1,'rgba(0,0,0,.15)');});
    }
  }
  /* LE REZ-DE-CHAUSSÉE : pierre de taille et devanture */
  const yR=sol-rez;
  for(let y=yR;y<sol;y+=6){const d=((y-yR)/6)%2?10:0;R(x0,y,BL,6,PI_X.p);R(x0,y,BL,1,PI_X.h);
    for(let x=x0+d;x<x0+BL;x+=20)R(x,y,1,6,PI_X.s);}
  R(x0-2,yR-2,BL+4,3,PI_X.c);R(x0-2,yR-2,BL+4,1,PI_X.e);
  /* DES IMMEUBLES D'HABITATION, et une boutique : le salon de coiffure MY design HAIR */
  const sorte=v===102?'coiffeur':'porte';
  const bois=[{o:'#3a2616',p:'#5a3a20'},{o:'#1e3a2c',p:'#2c5440'},{o:'#22324a',p:'#34506e'},{o:'#4a2420',p:'#6a3430'}][v%4];
  const devanture=(peinture,mot)=>{
    R(x0+8,yR+4,BL-16,rez-6,peinture.o);R(x0+10,yR+6,BL-20,rez-10,peinture.p);R(x0+10,yR+6,BL-20,1,peinture.h);
    /* l'enseigne peinte, lettres d'or */
    R(x0+12,yR+7,BL-24,9,peinture.o);R(x0+13,yR+8,BL-26,7,peinture.c);
    g.font='700 7px Georgia,serif';g.textAlign='center';g.fillStyle='#f0cf7d';g.fillText(mot,cx,yR+14,BL-34);g.textAlign='left';
    /* deux vitrines, la porte au milieu */
    [x0+14,x0+BL-58].forEach(vx=>{R(vx,yR+18,44,rez-22,'#1c242c');R(vx+1,yR+19,42,rez-24,'#2e3a44');
      g.fillStyle='rgba(220,235,245,.18)';g.beginPath();g.moveTo(vx+4,yR+rez-6);g.lineTo(vx+16,yR+20);g.lineTo(vx+22,yR+20);g.lineTo(vx+10,yR+rez-6);g.fill();});
    R(cx-9,yR+18,18,rez-18,peinture.o);R(cx-8,yR+19,16,rez-19,'#2e3a44');R(cx,yR+19,1,rez-19,peinture.o);
    R(cx+4,yR+30,2,2,'#e8c06a');
  };
  if(sorte==='coiffeur'){
    /* MY design HAIR : une devanture noire mate, une grande vitrine, et l'homme chauve derrière */
    const noir={o:'#0e0e10',p:'#1c1c20',c:'#26262c',h:'#3a3a42'};
    R(x0+6,yR+2,BL-12,rez-2,noir.o);R(x0+8,yR+4,BL-16,rez-6,noir.p);R(x0+8,yR+4,BL-16,1,noir.h);
    /* l'enseigne : lettres d'or, en minuscules, sur un bandeau noir */
    R(x0+10,yR+5,BL-20,9,'#000000');R(x0+10,yR+13,BL-20,1,'#c9a24a');
    g.font='700 8px Georgia,serif';g.textAlign='center';g.fillStyle='#e8c06a';g.fillText('MY design HAIR',cx-6,yR+12,BL-40);g.textAlign='left';
    /* la grande vitrine */
    const vx=x0+12, vw=BL-50, vy=yR+16, vh=rez-18;
    R(vx-1,vy-1,vw+2,vh+2,'#c9a24a');R(vx,vy,vw,vh,'#2a2e36');
    /* dedans : le miroir à ampoules, le fauteuil de barbier en cuir noir et chrome */
    R(vx+vw-30,vy+2,22,12,'#8fa3ab');R(vx+vw-29,vy+3,20,10,'#b9ccd4');
    for(let k=0;k<6;k++){R(vx+vw-30+k*4.2,vy+1,2,1,'#fff6d0');}
    R(vx+vw-26,vy+13,14,6,'#1a1a1a');R(vx+vw-27,vy+12,16,2,'#2a2a2a');R(vx+vw-20,vy+19,2,vh-20,'#b9c1c7');R(vx+vw-24,vy+vh-2,10,2,'#8f959b');
    /* L'HOMME CHAUVE, en devanture : le crâne qui brille, la barbe taillée, les bras croisés */
    const hx=vx+16, hy=vy+2;
    R(hx-5,hy+10,10,vh-10,'#141418');R(hx-5,hy+10,10,1,'#2a2a30');                /* le t-shirt noir */
    R(hx-7,hy+12,14,4,'#c98a5a');R(hx-7,hy+12,14,1,'#e0a878');                     /* les bras croisés */
    R(hx-2,hy+8,4,3,'#c98a5a');                                                    /* le cou */
    g.fillStyle='#d8a070';g.beginPath();g.ellipse(hx,hy+4,4.2,5,0,0,Math.PI*2);g.fill();   /* le crâne */
    R(hx-4,hy+5,1,2,'#c08858');R(hx+3,hy+5,1,2,'#c08858');                         /* les oreilles */
    R(hx-2,hy+4,1,1,'#1b1b1b');R(hx+1,hy+4,1,1,'#1b1b1b');                         /* les yeux */
    R(hx-3,hy+6,6,3,'#3a2a1c');R(hx-1,hy+7,2,1,'#b06a50');                         /* la barbe, le sourire */
    g.fillStyle='rgba(255,255,255,.75)';g.beginPath();g.ellipse(hx-1.5,hy+1,1.6,1,0,0,Math.PI*2);g.fill();  /* le reflet sur le crâne */
    /* le reflet de la vitre */
    g.fillStyle='rgba(220,235,245,.16)';g.beginPath();g.moveTo(vx+26,vy+vh);g.lineTo(vx+36,vy);g.lineTo(vx+42,vy);g.lineTo(vx+32,vy+vh);g.fill();
    /* la porte vitrée, à droite, et sa poignée dorée */
    R(x0+BL-34,yR+16,18,rez-16,'#c9a24a');R(x0+BL-33,yR+17,16,rez-17,'#2a2e36');R(x0+BL-20,yR+28,1,6,'#e8c06a');
    /* l'enseigne de barbier, le poteau rayé, contre le mur */
    R(x0+BL-12,yR+4,5,26,'#f4f0e4');R(x0+BL-13,yR+3,7,2,'#c9a24a');R(x0+BL-13,yR+30,7,2,'#c9a24a');
  }else if(sorte==='bar'){
    devanture({o:'#1e3a2c',p:'#2c5440',c:'#346448',h:'#4a7a5c'},'BAR DE LA MARINE');
    /* dans la vitrine : le zinc, les bouteilles */
    [x0+14,x0+BL-58].forEach(vx=>{R(vx+2,yR+rez-12,40,3,'#b9c1c7');
      for(let k=0;k<9;k++)R(vx+4+k*4,yR+22+(k%2)*2,2,6,['#3a7a4a','#c9a24a','#8a2a2a','#e8e0c0'][k%4]);});
    /* le store banne, rayé, vu de trois quarts */
    for(let r=0;r<4;r++)for(let k=0;k<BL-4;k+=8){R(x0+2+k,yR-4+r*3,4,3,r<2?'#c0392b':'#a93226');R(x0+6+k,yR-4+r*3,4,3,r<2?'#f4f0e4':'#dcd6c6');}
    for(let k=0;k<BL-4;k+=8){R(x0+2+k,yR+8,4,2,'#c0392b');R(x0+6+k,yR+8,4,2,'#f4f0e4');}
    R(x0+2,yR+10,BL-4,1,'rgba(40,20,10,.35)');
  }else if(sorte==='savon'){
    devanture({o:'#2a3a5a',p:'#3a5078',c:'#46608a',h:'#6a84ac'},'SAVONNERIE');
    /* les pyramides de savons de Marseille, vert olive et crème */
    [x0+14,x0+BL-58].forEach(vx=>{for(let r=0;r<3;r++)for(let k=0;k<5-r;k++){
      const sx=vx+6+k*7+r*3.5, sy=yR+rez-12-r*6;R(sx,sy,6,5,(k+r)%2?'#8a9a4a':'#e8dcae');R(sx,sy,6,1,'rgba(255,255,255,.35)');}});
  }else if(sorte==='santons'){
    devanture({o:'#5a2a2a',p:'#7a3a36',c:'#8a4640',h:'#a8605a'},'SANTONS');
    /* les petites figurines, alignées sur les gradins */
    [x0+14,x0+BL-58].forEach(vx=>{for(let r=0;r<2;r++){R(vx+2,yR+rez-10-r*9,40,2,'#8a6238');
      for(let k=0;k<6;k++){const sx=vx+5+k*6,sy=yR+rez-17-r*9;R(sx,sy,3,6,['#c0392b','#2d6fb0','#e8c06a','#3f8a4a','#f2efe4'][(k+r)%5]);R(sx,sy-2,3,2,'#e0b48a');}}});
  }else{
    /* la porte cochère, cintrée, ses clous et son heurtoir */
    R(cx-18,yR+2,36,rez-2,PI_X.c);R(cx-18,yR+2,36,1,PI_X.e);
    g.fillStyle=bois.o;g.beginPath();g.moveTo(cx-14,sol);g.lineTo(cx-14,yR+18);g.arc(cx,yR+18,14,Math.PI,0);g.lineTo(cx+14,sol);g.fill();
    g.fillStyle=bois.p;g.beginPath();g.moveTo(cx-12,sol);g.lineTo(cx-12,yR+18);g.arc(cx,yR+18,12,Math.PI,0);g.lineTo(cx+12,sol);g.fill();
    R(cx,yR+6,1,rez-6,bois.o);for(let y=yR+14;y<sol;y+=6)for(let x=cx-10;x<cx+11;x+=5)R(x,y,1,1,'#c9a24a');
    R(cx-4,yR+26,3,3,'#c9a24a');R(cx+2,yR+26,3,3,'#c9a24a');
    [x0+16,x0+BL-40].forEach(vx=>{R(vx,yR+10,24,20,PI_X.c);R(vx+2,yR+12,20,16,'#26303a');for(let k=3;k<20;k+=4)R(vx+2+k,yR+12,1,16,'#1f2224');});
  }
  R(x0+BL-6,basToit+12,2,murH-12,'#8a867a');R(x0+BL-7,basToit+12,1,murH-12,'#b9b4a2');   /* la descente d'eau */
  /* LA NUIT : les fenêtres allumées et la devanture */
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

/* LA BONNE MÈRE, EN MAJESTÉ : un éperon de calcaire qui monte derrière le
   quai, ses pins, l'escalier taillé dans la roche ; au sommet, le fort et la
   basilique rayée, vus de trois quarts, et la Vierge dorée. */
function graverLaGarde(){
  const W=190,Ht=196,cx=W/2,sol=Ht-4;
  const c=document.createElement('canvas');
  const D=Math.max(1,Math.min(2,Math.floor(window.devicePixelRatio||1)));
  c.width=W*D;c.height=Ht*D;
  const g=c.getContext('2d');g.setTransform(D,0,0,D,0,0);g.imageSmoothingEnabled=false;
  const R=(x,y,w,h,col)=>{g.fillStyle=col;g.fillRect(x|0,y|0,Math.max(1,w|0),Math.max(1,h|0));};
  const CAL={o:'#8a7a5c',s:'#aa9a78',p:'#c4b48e',c:'#d6c8a2',h:'#e6dab8',e:'#f2ead0'};
  /* 1 · L'ÉPERON : le plateau (vu d'en haut) et la falaise (vue de face) */
  const plat=142, pied=sol-4;
  const bord=(x)=>{const u=(x-cx)/(W*0.5);return Math.round(plat+Math.pow(Math.abs(u),2.2)*30+Math.sin(x/9)*2);};
  for(let x=24;x<W-24;x++){
    const b=bord(x);
    /* la falaise : strates horizontales, fissures verticales */
    for(let y=b;y<pied;y++){
      const strate=Math.floor((y-b)/5), lum=((x+strate*7)%13<2)?CAL.o:(((y-b)%5===0)?CAL.s:((x*3+y)%11<3?CAL.c:CAL.p));
      R(x,y,1,1,lum);
    }
    R(x,b,1,2,CAL.e);                                           /* l'arête qui prend la lumière */
    /* le plateau de garrigue, au-dessus de l'arête */
    for(let y=Math.max(0,b-22);y<b;y++)R(x,y,1,1,((x*7+y*3)%9<3)?'#8a9a56':((x+y)%5?'#7a8c4a':'#6a7c40'));
  }
  /* l'ombre portée sur la droite de l'éperon */
  g.fillStyle='rgba(60,45,25,.22)';g.beginPath();g.moveTo(cx+30,plat+6);g.lineTo(W-24,plat+30);g.lineTo(W-24,pied);g.lineTo(cx+50,pied);g.fill();
  /* des touffes et des pins parasols accrochés à la roche */
  const pin=(x,y,r)=>{R(x-1,y,2,6,'#5b3f21');
    g.fillStyle='#2f5b34';g.beginPath();g.ellipse(x,y-2,r,r*0.45,0,0,7);g.fill();
    g.fillStyle='#4a7d42';g.beginPath();g.ellipse(x-1,y-3,r*0.7,r*0.3,0,0,7);g.fill();
    g.fillStyle='#6a9a58';g.fillRect(x-r*0.4,y-4,r*0.5,1);};
  [[34,158,7],[156,156,8],[46,176,6],[144,178,6],[60,138,6],[130,136,7]].forEach(([x,y,r])=>pin(x,y,r));
  for(let i=0;i<30;i++){const x=26+alea(i*4.7)*(W-52),y=plat+10+alea(i*2.9)*(pied-plat-14);
    if(Math.abs(x-cx)<18)continue;R(x,y,3,2,i%2?'#6a7c40':'#7a8c4a');}
  /* 2 · L'ESCALIER taillé dans la roche, en lacets, avec sa rampe */
  const lacets=[[cx-12,pied],[cx+16,pied-16],[cx-14,pied-32],[cx+12,plat+4]];
  for(let i=0;i<lacets.length-1;i++){
    const [xa,ya]=lacets[i],[xb,yb]=lacets[i+1];
    for(let k=0;k<=12;k++){const x=xa+(xb-xa)*k/12, y=ya+(yb-ya)*k/12;
      R(x-5,y-2,11,3,CAL.h);R(x-5,y-2,11,1,CAL.e);R(x-5,y+1,11,1,CAL.o);}
    g.strokeStyle='#3b3a36';g.lineWidth=.7;g.beginPath();g.moveTo(xa+6,ya-6);g.lineTo(xb+6,yb-6);g.stroke();
  }
  /* 3 · LE FORT, sur le plateau : ses murs et ses créneaux, de trois quarts */
  const fy=plat-4;
  R(cx-52,fy-14,104,16,CAL.p);R(cx-52,fy-14,104,2,CAL.e);
  for(let x=cx-52;x<cx+52;x+=8){R(x,fy-18,5,4,CAL.c);R(x,fy-18,5,1,CAL.e);}
  for(let y=fy-12;y<fy+2;y+=4)R(cx-52,y,104,1,'rgba(90,70,40,.22)');
  R(cx-52,fy+2,104,2,'rgba(40,30,15,.3)');
  /* 4 · LA BASILIQUE : la nef rayée blanc et vert, son toit, ses coupoles */
  const by=fy-16;
  const raye=(x,y,w,h)=>{for(let j=0;j<h;j++)R(x,y+j,w,1,(Math.floor(j/3)%2)?'#7e9282':'#f4efe2');
    R(x,y,1,h,'rgba(255,255,255,.35)');R(x+w-1,y,1,h,'rgba(0,0,0,.18)');};
  /* le toit de la nef, vu d'en haut (pierre grise) */
  R(cx-34,by-30,68,8,'#9aa296');R(cx-34,by-30,68,1,'#c4cabe');for(let x=cx-34;x<cx+34;x+=4)R(x,by-29,1,7,'#7e867a');
  raye(cx-34,by-22,68,22);
  for(let k=0;k<5;k++){const x=cx-28+k*13;R(x,by-17,6,11,'#2e3a44');g.fillStyle='#2e3a44';g.beginPath();g.arc(x+3,by-17,3,Math.PI,0);g.fill();}
  R(cx-6,by-14,12,14,'#3a2a1c');g.fillStyle='#3a2a1c';g.beginPath();g.arc(cx,by-14,6,Math.PI,0);g.fill();
  /* les deux coupoles, avec leurs côtes */
  [[-22,7],[22,7]].forEach(([dx,r])=>{const x=cx+dx,y=by-30;
    g.fillStyle='#c4c0b0';g.beginPath();g.arc(x,y,r,Math.PI,0);g.fill();
    g.fillStyle='#e6e2d2';g.beginPath();g.arc(x-1,y-1,r-2,Math.PI,Math.PI*1.6);g.fill();
    for(let a=0;a<3;a++)R(x-r+2+a*(r-1),y-r+3,1,r-3,'#9a9688');
    R(x-1,y-r-3,2,3,'#e8c06a');});
  /* 5 · LE CLOCHER : tour carrée rayée, baies, socle, et la Vierge */
  const tx=cx, tb=by-22;
  raye(tx-9,tb-36,18,36);
  R(tx-10,tb-37,20,2,'#6f7d70');R(tx-10,tb-21,20,2,'#6f7d70');
  R(tx-6,tb-33,5,9,'#2e3a44');R(tx+1,tb-33,5,9,'#2e3a44');
  g.fillStyle='#2e3a44';g.beginPath();g.arc(tx-3.5,tb-33,2.5,Math.PI,0);g.fill();g.beginPath();g.arc(tx+3.5,tb-33,2.5,Math.PI,0);g.fill();
  R(tx-4,tb-17,8,8,'#e8e2d0');R(tx-3,tb-16,6,6,'#2e3a44');R(tx,tb-16,1,6,'#e8e2d0');R(tx-3,tb-13,6,1,'#e8e2d0');  /* l'horloge */
  R(tx-6,tb-43,12,6,'#d6d0be');R(tx-6,tb-43,12,1,'#f2ecdc');R(tx-5,tb-46,10,3,'#bdb7a5');   /* le socle */
  /* LA VIERGE À L'ENFANT, toute d'or */
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

/* LE PANIER, DERRIÈRE : des rangs de toits qui montent vers le fond, de
   plus en plus pâles — la ville qui continue au-delà du quai */
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
      /* le toit, vu d'en haut */
      for(let r=0;r<3;r++){R(x-2+r,yb-4-r*3,w+4-r*2,4,r%2?TU_M.s:TU_M.p);
        for(let k=0;k<w+4-r*2;k+=4)R(x-2+r+k+3,yb-4-r*3,1,4,TU_M.o);}
      R(x-1,yb-12,w+2,2,TU_M.faite);
      if(alea(x*3+rang)<.35){R(x+w-10,yb-18,4,6,E.p);R(x+w-11,yb-19,6,2,E.o);}
      g.fillStyle='rgba(190,200,210,'+Math.max(0,voile).toFixed(2)+')';g.fillRect(x-2,yb-18,w+4,h+24);
      x+=w+2+Math.floor(alea(x+rang*11)*6);
    }
  }
}

/* ================= LE MILIEU DU VIEUX-PORT =================
   Deux pavillons posés sur le quai, face aux pontons : la POISSONNERIE et la
   boutique PÊCHE & MARINE. Même grammaire que le village : toit vu d'en haut,
   matières, devanture pleine de choses. Et des arbustes en bacs de pierre. */
/* LE BEL ARBRE DU QUAI : un grand platane, houppier en grappes ombrées
   (lumière en haut à gauche), écorce en plaques, et sa grille de pied d'arbre */
function graverBelArbre(v){
  const W=112,Ht=132,cx=56,sol=124;
  const c=document.createElement('canvas');
  const D=Math.max(1,Math.min(2,Math.floor(window.devicePixelRatio||1)));
  c.width=W*D;c.height=Ht*D;const g=c.getContext('2d');g.setTransform(D,0,0,D,0,0);g.imageSmoothingEnabled=false;
  const R=(x,y,w,h,col)=>{g.fillStyle=col;g.fillRect(x|0,y|0,Math.max(1,w|0),Math.max(1,h|0));};
  const A=(i)=>alea(i*1.93+v*17.1);
  /* l'ombre du houppier, portée au sol vers la droite */
  g.fillStyle='rgba(40,45,20,.22)';g.beginPath();g.ellipse(cx+10,sol+1,40,9,0,0,7);g.fill();
  /* la grille de fonte, autour du pied */
  g.fillStyle='#4a4a44';g.beginPath();g.ellipse(cx,sol,13,4.5,0,0,7);g.fill();
  g.strokeStyle='#6a6a62';g.lineWidth=1;g.beginPath();g.ellipse(cx,sol,13,4.5,0,0,7);g.stroke();
  for(let k=-10;k<=10;k+=4){R(cx+k,sol-3,1,6,'#2e2e2a');}
  g.strokeStyle='#2e2e2a';g.beginPath();g.ellipse(cx,sol,8,2.8,0,0,7);g.stroke();
  /* le tronc : large au pied, écorce claire en plaques */
  for(let y=0;y<50;y++){const w=Math.round(12-y*0.08+(y<5?4-y*0.8:0));R(cx-w/2,sol-2-y,w,1,'#b9b29a');}
  for(let i=0;i<60;i++){const y=sol-4-A(i)*46, x=cx-5+A(i+40)*9;
    R(x,y,2+A(i+9)*3,2+A(i+19)*3,['#8f896c','#d9d4bc','#7a755a','#c9c4a4','#a8a288'][i%5]);}
  R(cx+3,sol-50,2,48,'rgba(40,35,20,.25)');                      /* le côté à l'ombre */
  /* les maîtresses branches qui partent */
  g.strokeStyle='#a8a288';g.lineWidth=3;g.beginPath();
  g.moveTo(cx-2,sol-48);g.lineTo(cx-16,sol-68);g.moveTo(cx+2,sol-48);g.lineTo(cx+18,sol-66);g.moveTo(cx,sol-50);g.lineTo(cx+2,sol-76);g.stroke();
  /* LE HOUPPIER : des grappes, de la plus sombre (dessous, droite) à la plus claire (dessus, gauche) */
  const tons=v%2?['#2f5a2c','#3f7236','#568a42','#72a352','#95c06a']:['#34602e','#46793a','#5f9446','#7bab58','#a3c874'];
  const grappes=[];
  for(let i=0;i<34;i++){
    const a=A(i*3)*Math.PI*2, r=A(i*5)*34;
    grappes.push([cx+Math.cos(a)*r*1.15, sol-84+Math.sin(a)*r*0.72, 9+A(i*7)*8]);
  }
  grappes.sort((p,q)=>p[1]-q[1]);
  /* 1 · la masse sombre */
  grappes.forEach(([x,y,r])=>{g.fillStyle=tons[0];g.beginPath();g.ellipse(x+2,y+3,r,r*0.8,0,0,7);g.fill();});
  /* 2 · le corps */
  grappes.forEach(([x,y,r])=>{g.fillStyle=tons[1];g.beginPath();g.ellipse(x,y,r*0.9,r*0.72,0,0,7);g.fill();});
  /* 3 · la lumière, en haut à gauche de chaque grappe */
  grappes.forEach(([x,y,r])=>{g.fillStyle=tons[2];g.beginPath();g.ellipse(x-r*0.25,y-r*0.22,r*0.6,r*0.46,0,0,7);g.fill();});
  grappes.filter(([x,y])=>x<cx+8&&y<sol-80).forEach(([x,y,r])=>{g.fillStyle=tons[3];g.beginPath();g.ellipse(x-r*0.35,y-r*0.3,r*0.35,r*0.26,0,0,7);g.fill();});
  /* 4 · le feuillage, pixel par pixel : des éclats clairs et des trous d'ombre */
  for(let i=0;i<260;i++){
    const a=A(i*11)*Math.PI*2, r=Math.sqrt(A(i*13))*44;
    const x=cx+Math.cos(a)*r*1.1, y=sol-84+Math.sin(a)*r*0.7;
    const d=g.getImageData((x*D)|0,(y*D)|0,1,1).data;if(d[3]<200)continue;
    R(x,y,1,1,i%4===0?tons[4]:(i%4===1?tons[0]:tons[3]));
  }
  /* quelques boules de platane qui pendent */
  for(let i=0;i<6;i++){const x=cx-26+A(i*17)*52, y=sol-70+A(i*19)*16;R(x,y,1,3,'#6b5a3a');R(x-1,y+3,3,3,'#8a7a4a');}
  return {toile:c,W,H:Ht,sol};
}
/* LA CRIÉE : la halle aux poissons, au bout du quai. Un soubassement de pierre,
   de grandes baies cintrées, une verrière à armature de fer vue d'en haut, et
   par les portes ouvertes, les tables où l'on vend la pêche du matin. */
function graverLaCriee(){
  const W=196,Ht=150,cx=98,sol=142;
  const c=document.createElement('canvas');
  const D=Math.max(1,Math.min(2,Math.floor(window.devicePixelRatio||1)));
  c.width=W*D;c.height=Ht*D;const g=c.getContext('2d');g.setTransform(D,0,0,D,0,0);g.imageSmoothingEnabled=false;
  const R=(x,y,w,h,col)=>{g.fillStyle=col;g.fillRect(x|0,y|0,Math.max(1,w|0),Math.max(1,h|0));};
  const BL=176,x0=cx-BL/2,murH=54,basToit=sol-murH;
  const PI={o:'#8a7a5c',s:'#aa9a78',p:'#c9b68e',c:'#d8c8a2',h:'#e6dab8',e:'#f2ead0'};
  g.fillStyle='rgba(40,30,18,.26)';g.beginPath();g.ellipse(cx+4,sol+3,BL*0.55,8,0,0,7);g.fill();
  /* 1 · LA VERRIÈRE, vue d'en haut : des carreaux bleutés dans une résille de fer */
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
  /* le lanterneau d'aération, sur le faîte, et sa girouette en poisson */
  R(cx-30,basToit-rangs*6-6,60,6,'#5a6a72');R(cx-30,basToit-rangs*6-6,60,1,'#b9c8d0');
  for(let x=cx-28;x<cx+28;x+=6)R(x,basToit-rangs*6-5,3,4,'#2e3a44');
  R(cx-1,basToit-rangs*6-16,2,10,'#3a3a36');R(cx-8,basToit-rangs*6-19,14,4,'#c9a24a');R(cx-11,basToit-rangs*6-18,3,2,'#c9a24a');R(cx+4,basToit-rangs*6-18,1,1,'#1b1b1b');
  /* la corniche de fer, sous la verrière */
  R(x0-6,basToit,BL+12,4,'#4a5a62');R(x0-6,basToit,BL+12,1,'#8a9aa2');
  for(let x=x0-4;x<x0+BL+4;x+=8)R(x,basToit+4,2,3,'#4a5a62');
  /* 2 · LES MURS : pierre de taille blonde, en assises */
  R(x0,basToit+4,BL,murH-4,PI.p);
  for(let y=basToit+4;y<sol;y+=6){const d=((y/6)%2)?10:0;R(x0,y,BL,1,PI.s);R(x0,y+1,BL,1,'rgba(255,255,255,.12)');
    for(let x=x0+d;x<x0+BL;x+=20)R(x,y,1,6,PI.s);}
  R(x0,basToit+4,BL,2,'rgba(30,20,10,.3)');
  /* les pilastres entre les baies */
  for(let k=0;k<=6;k++){const x=x0+k*(BL/6)-3;R(x,basToit+6,6,murH-6,PI.c);R(x,basToit+6,1,murH-6,PI.e);R(x+5,basToit+6,1,murH-6,PI.s);}
  /* 3 · LES BAIES : cintrées, vitrées sur les côtés, grandes ouvertes au milieu */
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
      /* à l'intérieur : une table de marée, des caissettes de poisson, un crieur en tablier bleu */
      R(bx+2,sol-12,bw-4,4,'#b9c1c7');R(bx+2,sol-12,bw-4,1,'#e1e6ea');
      for(let j=0;j<3;j++){R(bx+4+j*8,sol-16,6,4,'#e8f2f6');R(bx+5+j*8,sol-15,4,1,['#9fb3c4','#d0553f','#7d8b96'][j]);}
      R(bx+bw/2-2,sol-28,5,12,'#2d6fb0');R(bx+bw/2-2,sol-31,5,3,'#e0b48a');R(bx+bw/2-2,sol-32,5,1,'#3a2a1c');
    }
  }
  /* 4 · L'ENSEIGNE en lettres de fer, et l'horloge au-dessus de l'entrée */
  R(cx-40,basToit+7,80,10,'#1f2a30');R(cx-39,basToit+8,78,8,'#2e3a44');
  g.font='700 8px Georgia,serif';g.textAlign='center';g.fillStyle='#e8c06a';g.fillText('LA CRIÉE',cx,basToit+15,70);
  g.fillStyle='#f2ead0';g.beginPath();g.arc(cx,basToit-4,7,0,7);g.fill();
  g.strokeStyle='#3a3a36';g.lineWidth=1;g.beginPath();g.arc(cx,basToit-4,7,0,7);g.stroke();
  R(cx,basToit-9,1,5,'#1b1b1b');R(cx,basToit-4,4,1,'#1b1b1b');
  /* LA NUIT : la verrière s'allume par-dessous, les baies aussi */
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
/* LE CABANON DE LA BOUILLABAISSE : une cabane de planches peintes au bord de
   l'eau, un toit de tuiles, une treille, et devant, la marmite sur le feu */
function graverLeCabanon(){
  const W=120,Ht=100,cx=60,sol=92;
  const c=document.createElement('canvas');
  const D=Math.max(1,Math.min(2,Math.floor(window.devicePixelRatio||1)));
  c.width=W*D;c.height=Ht*D;const g=c.getContext('2d');g.setTransform(D,0,0,D,0,0);g.imageSmoothingEnabled=false;
  const R=(x,y,w,h,col)=>{g.fillStyle=col;g.fillRect(x|0,y|0,Math.max(1,w|0),Math.max(1,h|0));};
  const BL=74,x0=cx-BL/2-10,murH=34,basToit=sol-murH-10;
  g.fillStyle='rgba(40,30,18,.25)';g.beginPath();g.ellipse(cx,sol+2,52,7,0,0,7);g.fill();
  /* le toit de tuiles, vu d'en haut */
  for(let rg=6;rg>=0;rg--){const y=basToit-rg*4, ret=Math.round(rg/7*10), xa=x0-6+ret, l=BL+12-ret*2;
    for(let x=xa;x<xa+l;x+=5){R(x,y,5,5,((x+rg*3)>>2)%3?'#ad542c':'#c26a3a');R(x+4,y,1,5,'#6e2c16');R(x+1,y,3,1,'#d8844e');}
    if(rg===6){R(xa-2,y-4,l+4,5,'#6e2c16');R(xa-2,y-4,l+4,2,'#e59a62');}}
  R(x0+BL-16,basToit-40,8,12,'#d6c6a0');R(x0+BL-17,basToit-42,10,3,'#9e8a64');          /* la cheminée */
  /* les murs : planches verticales peintes en bleu pâle, un peu écaillées */
  R(x0,basToit+2,BL,murH+8,'#8fb8cc');
  for(let x=x0;x<x0+BL;x+=5){R(x,basToit+2,1,murH+8,'#6f98ac');}
  for(let i=0;i<40;i++)R(x0+alea(i*3.1)*BL,basToit+4+alea(i*5.7)*murH,2,1,'#c9d8de');
  R(x0,basToit+2,BL,2,'rgba(30,20,10,.3)');
  /* la porte ouverte, une fenêtre à volets rouges */
  R(x0+8,sol-30,16,30,'#2a2218');R(x0+8,sol-30,16,1,'#6f98ac');R(x0+24,sol-30,3,30,'#c0392b');
  R(x0+40,basToit+12,16,12,'#2e3a44');R(x0+34,basToit+12,6,12,'#c0392b');R(x0+56,basToit+12,6,12,'#c0392b');
  R(x0+40,basToit+17,16,1,'#8fb8cc');R(x0+47,basToit+12,1,12,'#8fb8cc');
  /* l'enseigne peinte à la main */
  R(x0+6,basToit+4,BL-12,6,'#f2efe4');
  g.font='700 5px Georgia,serif';g.textAlign='center';g.fillStyle='#b5382c';g.fillText('BOUILLABAISSE',x0+BL/2,basToit+9,BL-16);
  /* la treille : poteaux, poutres, et la vigne par-dessus */
  const tx=x0+BL+2;
  R(tx+2,basToit+4,2,sol-basToit-4,'#6b4a2c');R(tx+30,basToit+8,2,sol-basToit-8,'#6b4a2c');
  R(tx,basToit+2,34,2,'#8a6238');
  for(let i=0;i<34;i++){g.fillStyle=['#4f7a36','#6a9a4a','#3f6a2c'][i%3];g.beginPath();g.ellipse(tx+2+alea(i*2.1)*32,basToit-2+alea(i*3.7)*8,4,3,0,0,7);g.fill();}
  for(let i=0;i<5;i++){R(tx+6+i*6,basToit+6,2,3,'#6a3a6a');}
  /* sous la treille : une table à nappe à carreaux et deux chaises */
  R(tx+6,sol-14,22,6,'#f2efe4');for(let x=tx+6;x<tx+28;x+=4)for(let y=sol-14;y<sol-8;y+=3)if(((x+y)/1|0)%2)R(x,y,2,2,'#c0392b');
  R(tx+8,sol-8,2,8,'#6b4a2c');R(tx+24,sol-8,2,8,'#6b4a2c');
  R(tx+2,sol-12,4,12,'#8a6238');R(tx+30,sol-12,4,12,'#8a6238');
  R(tx+12,sol-17,3,3,'#f2efe4');R(tx+19,sol-17,3,3,'#e8c06a');                              /* une assiette, un verre */
  /* l'ardoise du jour, contre le mur */
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
/* LA STATION DE VÉLOS : une borne bordeaux et des vélos à quai */
function graverLaStationVelo(){
  const W=90,Ht=46,cx=45,sol=40;
  const c=document.createElement('canvas');
  const D=Math.max(1,Math.min(2,Math.floor(window.devicePixelRatio||1)));
  c.width=W*D;c.height=Ht*D;const g=c.getContext('2d');g.setTransform(D,0,0,D,0,0);g.imageSmoothingEnabled=false;
  const R=(x,y,w,h,col)=>{g.fillStyle=col;g.fillRect(x|0,y|0,Math.max(1,w|0),Math.max(1,h|0));};
  g.fillStyle='rgba(40,30,18,.22)';g.beginPath();g.ellipse(cx,sol+1,40,4,0,0,7);g.fill();
  /* la borne */
  R(8,sol-30,10,30,'#7a1f2b');R(8,sol-30,10,2,'#a8424e');R(10,sol-26,6,5,'#9fd0e8');R(10,sol-18,6,2,'#e8c06a');
  R(9,sol-34,8,4,'#f2efe4');R(11,sol-33,4,2,'#7a1f2b');
  /* la barre et les vélos accrochés */
  R(20,sol-8,66,2,'#8f959b');
  for(let k=0;k<4;k++)dessinerUnVelo(g,32+k*17,sol-1,'droite',0,k,false);
  return {toile:c,W,H:Ht,sol};
}
/* un vélo : de profil (gauche/droite) ou de face (haut/bas). « pas » avance quand on
   roule : les rayons tournent, le pédalier tourne, les pieds pédalent. */
/* (gardé dans jeu.html) */
/* LA CUISINE : on choisit ses poissons, Fonfon fait la bouillabaisse et l'achète */
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
  const D=Math.max(1,Math.min(2,Math.floor(window.devicePixelRatio||1)));
  c.width=W*D;c.height=Ht*D;const g=c.getContext('2d');g.setTransform(D,0,0,D,0,0);g.imageSmoothingEnabled=false;
  const R=(x,y,w,h,col)=>{g.fillStyle=col;g.fillRect(x|0,y|0,Math.max(1,w|0),Math.max(1,h|0));};
  const BL=104,x0=cx-BL/2,murH=40,basToit=sol-murH;
  const poisson=sorte==='poisson';
  g.fillStyle='rgba(40,30,18,.26)';g.beginPath();g.ellipse(cx+3,sol+3,BL*0.56,7,0,0,7);g.fill();
  /* LE TOIT, vu d'en haut : zinc bleu-gris pour la poissonnerie, tuiles canal pour la boutique */
  const rangs=8;
  for(let rg=rangs-1;rg>=0;rg--){
    const y=basToit-rg*4, ret=Math.round(rg/rangs*14), xa=x0-8+ret, l=BL+16-ret*2;
    if(poisson){R(xa,y,l,5,rg%2?'#8a9aa6':'#9eb0bc');for(let x=xa;x<xa+l;x+=6)R(x,y,1,5,'#6f808c');R(xa,y,l,1,'#c4d2da');}
    else{for(let x=xa;x<xa+l;x+=5){R(x,y,5,5,((x+rg*3)>>2)%3?'#ad542c':'#c26a3a');R(x+4,y,1,5,'#6e2c16');R(x+1,y,3,1,'#d8844e');}}
    if(rg===rangs-1){R(xa-2,y-4,l+4,5,poisson?'#5f6f7a':'#6e2c16');R(xa-2,y-4,l+4,2,poisson?'#d6e0e6':'#e59a62');}
  }
  /* l'épi du faîtage : un poisson de zinc, ou une girouette */
  if(poisson){R(cx-1,basToit-40,2,8,'#5f6f7a');R(cx-7,basToit-43,12,4,'#c4d2da');R(cx-10,basToit-42,3,2,'#c4d2da');R(cx+3,basToit-42,1,1,'#1b1b1b');}
  else{R(cx-1,basToit-42,2,10,'#3a3a36');R(cx-6,basToit-44,12,2,'#3a3a36');R(cx+4,basToit-46,3,3,'#3a3a36');}
  /* LES MURS */
  if(poisson){
    /* carreaux de faïence bleus et blancs, et une frise de vagues */
    for(let y=basToit+2;y<sol-10;y+=4)for(let x=x0;x<x0+BL;x+=4)R(x,y,4,4,((x+y)/4)%2?'#2d6fb0':'#f4f0e4');
    for(let x=x0;x<x0+BL;x+=6){R(x,basToit+2,6,3,'#1d4f8a');R(x+2,basToit+3,3,1,'#f4f0e4');}
    R(x0,sol-10,BL,10,'#d8c8a2');R(x0,sol-10,BL,1,'#efe3c4');
  }else{
    /* enduit ocre, soubassement de pierre */
    R(x0,basToit+2,BL,murH-12,'#dfb672');
    for(let i=0;i<180;i++)R(x0+alea(i*1.3)*BL,basToit+2+alea(i*2.7)*(murH-12),1,1,i%2?'#ebca8e':'#c9a05a');
    R(x0,sol-10,BL,10,'#bba57c');R(x0,sol-10,BL,1,'#dfcca4');for(let x=x0;x<x0+BL;x+=12)R(x,sol-10,1,10,'#9e8a64');
  }
  R(x0,basToit+2,BL,2,'rgba(30,20,10,.3)');
  /* LA DEVANTURE : trois baies, l'enseigne au-dessus */
  const bois=poisson?{o:'#123a66',p:'#1d4f8a',c:'#2d6fb0',h:'#5a8fcf'}:{o:'#1e3a2c',p:'#2c5440',c:'#346448',h:'#4a7a5c'};
  R(x0+6,basToit+6,BL-12,11,bois.o);R(x0+7,basToit+7,BL-14,9,bois.p);R(x0+7,basToit+7,BL-14,1,bois.h);
  g.font='700 8px Georgia,serif';g.textAlign='center';g.fillStyle='#f0cf7d';
  g.fillText(poisson?'LA POISSONNERIE':'PÊCHE & MARINE',cx,basToit+14.5,BL-20);
  [x0+8,cx-14,x0+BL-36].forEach((vx,i)=>{
    R(vx,basToit+20,28,sol-basToit-22,bois.o);R(vx+1,basToit+21,26,sol-basToit-24,i===1?'#2a2218':'#3a4a54');
    if(i!==1){g.fillStyle='rgba(220,235,245,.2)';g.beginPath();g.moveTo(vx+3,sol-4);g.lineTo(vx+12,basToit+22);g.lineTo(vx+17,basToit+22);g.lineTo(vx+8,sol-4);g.fill();}
  });
  if(poisson){
    /* dans les vitrines : la glace et les poissons ; devant, l'étal couvert */
    [x0+9,x0+BL-35].forEach(vx=>{R(vx,sol-10,26,5,'#e8f2f6');for(let k=0;k<4;k++){R(vx+2+k*6,sol-9,5,2,['#9fb3c4','#d0553f','#a9b4ba','#7d8b96'][k]);}});
    /* le store, rayé bleu et blanc, qui avance sur le trottoir */
    for(let r=0;r<3;r++)for(let x=x0-4;x<x0+BL+4;x+=8){R(x,basToit+18+r*3,4,3,r<2?'#2d6fb0':'#245c96');R(x+4,basToit+18+r*3,4,3,r<2?'#f4f0e4':'#dcd6c6');}
    for(let x=x0-4;x<x0+BL+4;x+=8){R(x,basToit+27,4,2,'#2d6fb0');R(x+4,basToit+27,4,2,'#f4f0e4');}
    /* l'étal devant la porte : un lit de glace plein de poissons */
    R(x0+2,sol-2,BL-4,6,'#6b4a2c');R(x0+4,sol-2,BL-8,4,'#e8f2f6');
    for(let i=0;i<50;i++)R(x0+4+alea(i*5.1)*(BL-8),sol-2+alea(i*3.3)*4,1,1,'#ffffff');
    for(let k=0;k<12;k++){const e2=[['#9fb3c4','#c9d6e0'],['#d0553f','#e8806a'],['#a9b4ba','#e0b43a'],['#7d8b96','#4f5b64'],['#c0607a','#e08aa0']][k%5];
      R(x0+6+k*8,sol-1,6,2,e2[0]);R(x0+6+k*8,sol-1,6,1,e2[1]);}
  }else{
    /* dans les vitrines : cannes, moulinets, leurres ; devant, le râtelier de cannes */
    [x0+9,x0+BL-35].forEach(vx=>{
      for(let k=0;k<4;k++){g.strokeStyle=['#8a6238','#e8c06a','#c0392b','#b9c1c7'][k];g.lineWidth=1;g.beginPath();g.moveTo(vx+4+k*6,sol-4);g.lineTo(vx+7+k*6,basToit+22);g.stroke();}
      for(let k=0;k<3;k++){g.fillStyle='#1b1b1b';g.beginPath();g.arc(vx+6+k*7,sol-8,2.5,0,7);g.fill();R(vx+5+k*7,sol-9,2,2,'#b9c1c7');}
      for(let k=0;k<5;k++)R(vx+3+k*5,basToit+25,3,2,['#e0402f','#ffd76a','#6fbf5a','#5a8fcf','#e08aa0'][k]);});
    R(x0+BL-2,sol-26,4,26,'#5a3a20');R(x0+BL-4,sol-26,8,2,'#7a5230');
    ['#8a6238','#2d4a6a','#e8c06a','#3f8a4a'].forEach((col,k)=>{g.strokeStyle=col;g.lineWidth=1.3;g.beginPath();g.moveTo(x0+BL-1+k*1.5,sol-2);g.lineTo(x0+BL+2+k*2,sol-44);g.stroke();});
    /* l'enseigne en potence : un hameçon de fer */
    R(x0-4,basToit+2,2,14,'#2a2c2e');R(x0-10,basToit+4,8,2,'#2a2c2e');
    g.strokeStyle='#b9c1c7';g.lineWidth=1.5;g.beginPath();g.moveTo(x0-8,basToit+6);g.lineTo(x0-8,basToit+14);g.arc(x0-11,basToit+14,3,0,Math.PI);g.stroke();
  }
  /* la porte, au milieu */
  R(cx-1,basToit+21,2,sol-basToit-21,'#1b1510');R(cx+5,sol-18,2,2,'#e8c06a');
  const n2=document.createElement('canvas');n2.width=W*D;n2.height=Ht*D;
  const h2=n2.getContext('2d');h2.setTransform(D,0,0,D,0,0);
  h2.fillStyle='rgba(16,20,44,.38)';h2.fillRect(x0,basToit+2,BL,murH-2);
  h2.fillStyle='#ffd98a';[x0+9,cx-13,x0+BL-35].forEach(vx=>h2.fillRect(vx,basToit+21,26,sol-basToit-24));
  const l=h2.createRadialGradient(cx,sol,4,cx,sol,70);l.addColorStop(0,'rgba(255,205,120,.5)');l.addColorStop(1,'rgba(255,205,120,0)');
  h2.fillStyle=l;h2.fillRect(cx-70,sol-60,140,70);
  return {toile:c,W,H:Ht,sol,nuit:n2};
}
/* L'ARBUSTE, dans son bac de pierre : laurier-rose, pittosporum ou lavande */
function graverArbuste(v){
  const W=40,Ht=40,cx=20,sol=36;
  const c=document.createElement('canvas');
  const D=Math.max(1,Math.min(2,Math.floor(window.devicePixelRatio||1)));
  c.width=W*D;c.height=Ht*D;const g=c.getContext('2d');g.setTransform(D,0,0,D,0,0);g.imageSmoothingEnabled=false;
  const R=(x,y,w,h,col)=>{g.fillStyle=col;g.fillRect(x|0,y|0,Math.max(1,w|0),Math.max(1,h|0));};
  g.fillStyle='rgba(40,30,18,.25)';g.beginPath();g.ellipse(cx+1,sol+1,14,3,0,0,7);g.fill();
  /* le bac : pierre blonde, un rebord qui prend la lumière */
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

/* ================= PÊCHE & MARINE : LA BOUTIQUE =================
   Les prix et les effets sont tenus par le serveur (acheter_peche) ; ici,
   on affiche, on achète, on monte un appât, on applique une finition. */
/* (gardé dans jeu.html) */
const CANNES=[{id:null,nom:'Ligne à main'},{id:'bambou',nom:'Canne en bambou',prix:1500,effet:'Le cercle 15 % plus lent.'},
  {id:'fibre',nom:'Canne en fibre',prix:6000,effet:'Le cercle 25 % plus lent, « bien » plus facile.'},
  {id:'carbone',nom:'Canne en carbone',prix:18000,effet:'Le cercle 35 % plus lent, « parfait » plus facile.'},
  {id:'maitre',nom:'Canne de maître',prix:50000,effet:'Le cercle 45 % plus lent, « bien » très large. Espadon, poisson-lune, requin.'},
  {id:'roi',nom:'Canne du Roi René',prix:150000,effet:'Le cercle 52 % plus lent, « parfait » très large. Hippocampe, calamar géant, cœlacanthe.'}];
const ACCESSOIRES=[{id:'moulinet',nom:'Moulinet',prix:4000,effet:'Une bonne touche compte double, dès la deuxième.'},
  {id:'bouchon',nom:'Bouchon plombé',prix:2500,effet:'Ça mord deux fois plus vite.'}];
const APPATS=[{id:'vers',nom:'Vers de mer',prix:100,effet:'Espèces rares ×2.'},
  {id:'crevettes',nom:'Crevettes',prix:150,effet:'Loup, dorade, denti et saupe ×3.'},
  {id:'sardine',nom:'Sardine fraîche',prix:200,effet:'Congre et murène ×3 ; thon et légendaires ×2.'}];
/* (gardé dans jeu.html) */
async function chargerLEquipement(){
  const d=await appelRPC('mon_equipement',{p_joueur:e.id});
  if(d&&!d.erreur)EQUIP_PECHE=d;
  return EQUIP_PECHE;
}
/* ================= LE CATALOGUE DE PÊCHE & MARINE =================
   Comme un magazine de pêche : un grand titre, des rubriques, et pour chaque
   article son illustration, son baratin, ses caractéristiques, et une
   étiquette de prix. Les illustrations sont dessinées à la main, en pixels. */
function illustrerArticle(cv,id){
  const W=cv.width,H=cv.height,g=cv.getContext('2d');g.imageSmoothingEnabled=false;
  const R=(x,y,w,h,col)=>{g.fillStyle=col;g.fillRect(Math.round(x),Math.round(y),Math.max(1,Math.round(w)),Math.max(1,Math.round(h)));};
  g.clearRect(0,0,W,H);
  /* une canne, en diagonale, avec sa poignée, ses anneaux et son scion */
  const canne=(c1,c2,poignee,anneaux,noeuds,motif)=>{
    const x0=8,y0=H-8,x1=W-8,y1=8, L=Math.hypot(x1-x0,y1-y0);
    for(let i=0;i<=L;i++){const k=i/L, x=x0+(x1-x0)*k, y=y0+(y1-y0)*k, e2=Math.max(1,Math.round(4-k*3));
      const col=k<.22?poignee:(motif&&Math.floor(i/2)%2?c2:c1);
      R(x-e2/2,y-e2/2,e2,e2,col);if(k>=.22&&k<.95)R(x-e2/2,y-e2/2,1,1,'rgba(255,255,255,.45)');
      if(noeuds&&k>.22&&Math.floor(i)%14===0)R(x-2,y-2,4,4,noeuds);}
    for(let a=0;a<5;a++){const k=.35+a*.14, x=x0+(x1-x0)*k, y=y0+(y1-y0)*k;R(x-1,y+1,3,3,anneaux);R(x,y+2,1,1,'#1b1b1b');}
    R(x0+8,y0-14,6,6,'#2a2c2e');R(x0+9,y0-13,4,4,'#b9c1c7');                               /* le moulinet */
  };
  if(id==='bambou')canne('#c9a86a','#b89456','#6b4a2c','#8a8a82','#8a6a3a');
  else if(id==='fibre')canne('#e8e8e2','#d8d8d0','#2e3a44','#b9c1c7');
  else if(id==='carbone')canne('#2a2c2e','#3e4246','#1b1b1b','#e8c06a',null,true);
  else if(id==='maitre')canne('#5a2a1a','#8a3a22','#2a1a10','#e8c06a','#e8c06a',true);
  else if(id==='roi'){canne('#e8c06a','#fff0b8','#3a1a4a','#ffffff','#c9a24a',true);for(let k=0;k<7;k++){g.fillStyle='rgba(255,240,180,.9)';g.fillRect(12+k*14,H-14-k*7,2,2);}}
  else if(id==='moulinet'){
    const cx=W/2,cy=H/2;
    g.fillStyle='#2a2c2e';g.beginPath();g.arc(cx,cy,16,0,7);g.fill();
    g.fillStyle='#8f959b';g.beginPath();g.arc(cx,cy,13,0,7);g.fill();
    g.fillStyle='#e8e8e2';g.beginPath();g.arc(cx,cy,9,0,7);g.fill();
    for(let k=0;k<5;k++)R(cx-9,cy-6+k*3,18,1,'#b9c1c7');                                     /* le fil sur la bobine */
    g.fillStyle='#2a2c2e';g.beginPath();g.arc(cx,cy,3,0,7);g.fill();
    R(cx+14,cy-2,14,3,'#2a2c2e');R(cx+26,cy-6,4,11,'#c9a24a');                              /* la manivelle */
    R(cx-4,cy+16,8,6,'#3a3a36');R(cx-10,cy+21,20,3,'#3a3a36');                               /* le pied */
    R(cx-12,cy-12,5,2,'rgba(255,255,255,.6)');
  }else if(id==='bouchon'){
    const cx=W/2;
    R(cx-1,4,2,H-8,'rgba(240,240,240,.8)');
    g.fillStyle='#f2efe4';g.beginPath();g.ellipse(cx,H/2-6,7,10,0,Math.PI,0);g.fill();
    g.fillStyle='#d0402f';g.beginPath();g.ellipse(cx,H/2-6,7,12,0,0,Math.PI);g.fill();
    R(cx-1,H/2-20,2,6,'#1b1b1b');R(cx-4,H/2-4,2,3,'rgba(255,255,255,.5)');
    g.fillStyle='#5f666c';g.beginPath();g.ellipse(cx,H-12,4,5,0,0,7);g.fill();              /* le plomb */
    R(cx-2,H-15,2,2,'#a4acb3');
  }else if(id==='vers'){
    R(W/2-22,H/2-6,44,20,'#8a6238');R(W/2-20,H/2-4,40,16,'#5a3f21');
    for(let k=0;k<4;k++){g.strokeStyle=['#c0607a','#d07088','#b05068','#e08aa0'][k];g.lineWidth=2.5;g.beginPath();
      g.moveTo(W/2-16+k*9,H/2+8);g.quadraticCurveTo(W/2-10+k*9,H/2-12,W/2-4+k*9,H/2+2);g.stroke();}
    R(W/2-22,H/2-8,44,3,'#a97f52');
  }else if(id==='crevettes'){
    for(let k=0;k<3;k++){const x=W/2-22+k*18, y=H/2-4+(k%2)*6;
      g.strokeStyle='#e8806a';g.lineWidth=4;g.beginPath();g.arc(x+6,y,7,Math.PI*0.2,Math.PI*1.3);g.stroke();
      R(x+11,y-4,3,3,'#1b1b1b');g.strokeStyle='#d0553f';g.lineWidth=.8;g.beginPath();g.moveTo(x+12,y-4);g.lineTo(x+22,y-12);g.stroke();}
  }else if(id==='sardine'){
    for(let k=0;k<3;k++){const y=H/2-10+k*9;
      R(W/2-24,y,40,6,'#9fb3c4');R(W/2-24,y,40,2,'#c9d6e0');R(W/2+16,y-1,6,8,'#8499aa');R(W/2-20,y+2,2,2,'#1b1b1b');}
  }else{
    const f=FINITIONS.find(x=>x.id===id);
    if(f)canne(f.col[0],f.col[1],'#3a2616',f.id==='dore'?'#fff0b8':'#e8c06a',null,f.nacre);
    if(f&&f.nacre)for(let k=0;k<6;k++)R(14+k*16,H-16-k*7,2,2,['#ffd0e8','#d0e8ff','#d8ffd8'][k%3]);
  }
}
async function ouvrirLaBoutiqueDePeche(){
  $('catalogue').classList.add('on');
  $('catPages').innerHTML='<div class="catVide">Fanny cherche ses clés…</div>';
  await chargerLEquipement();
  afficherPecheMarine();
}
function fermerLeCatalogue(){$('catalogue').classList.remove('on');}
/* (gardé dans jeu.html) */
/* (gardé dans jeu.html) */
function afficherPecheMarine(mot){
  const q=EQUIP_PECHE||{canne:0,appats:{},finitions:[]};
  $('catArgent').textContent=enEuros(e.euros||0);
  const etiquette=(prix,note)=>'<div class="catPrix">'+enEuros(prix)+(note?'<small>'+note+'</small>':'')+'</div>';
  const fiche=(id,nom,accroche,effet,prix,bouton,marque)=>
    '<article class="catFiche">'+(marque?'<div class="catMarque">'+marque+'</div>':'')+
    '<div class="catImage"><canvas data-img="'+id+'" width="112" height="64"></canvas></div>'+
    '<div class="catTexte"><h3>'+nom+'</h3><p class="catAccroche">'+accroche+'</p><p class="catEffet">'+effet+'</p>'+
    '<div class="catBas">'+(prix!=null?etiquette(prix):'')+bouton+'</div></div></article>';
  const acheter=(id,txt)=>'<button class="catAcheter" data-a="'+id+'">'+(txt||'Acheter')+'</button>';
  const possede='<span class="catAToi">✓ Dans ton équipement</span>';
  let h='';
  if(mot)h+='<div class="catMot">'+mot+'</div>';
  /* LES CANNES */
  h+='<h2 class="catRubrique"><span>Les cannes</span><i>tu pêches avec : '+CANNES[q.canne||0].nom.toLowerCase()+'</i></h2>';
  const accr={bambou:'La canne de nos grands-pères. Souple, légère, increvable.',
    fibre:'Le bon compromis : nerveuse, sensible, elle sent la touche avant toi.',
    carbone:'La reine des pontons. Pour ceux qui veulent le Vieux Loup.',
    maitre:'Montée à la main par Fanny, sur commande. Pour ceux qui ne craignent rien.',
    roi:'Une seule au monde. On dit qu’elle a sorti un poisson d’avant les dinosaures.'};
  CANNES.slice(1).forEach((k,i)=>{const niv=i+1, a=(q.canne||0)>=niv, libre=(q.canne||0)===niv-1;
    h+=fiche(k.id,k.nom,accr[k.id],k.effet,a?null:k.prix,a?possede:(libre?acheter(k.id):'<span class="catBloque">D’abord la canne d’avant</span>'),
      k.id==='roi'?'PIÈCE UNIQUE':(k.id==='maitre'?'SUR COMMANDE':(k.id==='carbone'?'HAUT DE GAMME':(k.id==='bambou'?'POUR DÉBUTER':null))));});
  /* LES ACCESSOIRES */
  h+='<h2 class="catRubrique"><span>Les accessoires</span></h2>';
  const accrA={moulinet:'Un moulinet à tambour fixe, graissé à l’huile d’olive.',bouchon:'Un bouchon rouge et blanc, lesté juste ce qu’il faut.'};
  ACCESSOIRES.forEach(a=>{h+=fiche(a.id,a.nom,accrA[a.id],a.effet,q[a.id]?null:a.prix,q[a.id]?possede:acheter(a.id),a.id==='moulinet'?'COUP DE CŒUR':null);});
  /* LES APPÂTS */
  h+='<h2 class="catRubrique"><span>Les appâts</span><i>par boîte de 10 lancers · monté : '+(q.appat?APPATS.find(a=>a.id===q.appat).nom.toLowerCase():'aucun')+'</i></h2>';
  const accrP={vers:'Des vers bien vivants, ramassés à marée basse.',crevettes:'Grises, fraîches du matin : le loup ne résiste pas.',sardine:'Coupée en tronçons. Le congre la sent de loin, la nuit.'};
  APPATS.forEach(a=>{const n=(q.appats||{})[a.id]||0;
    h+=fiche(a.id,a.nom+(n?' <span class="catStock">'+n+' en réserve</span>':''),accrP[a.id],a.effet,a.prix,
      (n?'<button class="catMonter'+(q.appat===a.id?' on':'')+'" data-m="'+a.id+'">'+(q.appat===a.id?'✓ Monté':'Monter')+'</button>':'')+acheter(a.id,'+10'));});
  h+='<div class="catLien"><button data-m="aucun">Pêcher sans appât</button></div>';
  /* LES FINITIONS */
  h+='<h2 class="catRubrique"><span>Les finitions</span><i>elles se voient quand tu pêches</i></h2>';
  FINITIONS.forEach(f=>{const a=(q.finitions||[]).includes(f.id);
    h+=fiche(f.id,f.nom,f.nacre?'Une laque irisée qui scintille au soleil.':(f.id==='dore'?'Pour briller sur le quai.':'Une belle peinture, séchée au soleil.'),
      'Cosmétique · s’applique à ta canne, même quand tu en changes.',a?null:f.prix,
      a?'<button class="catMonter'+(q.finition===f.id?' on':'')+'" data-f="'+f.id+'">'+(q.finition===f.id?'✓ Appliquée':'Appliquer')+'</button>':acheter(f.id),
      f.nacre?'ÉDITION RARE':null);});
  h+='<div class="catLien"><button data-f="aucune">Revenir au bois naturel</button></div>';
  h+='<p class="catPied">Pêche & Marine · Quai du Vieux-Port · « Fanny vous conseille, ne repartez pas bredouille. »</p>';
  const lu=$('catPages').scrollTop;
  $('catPages').innerHTML=h;
  $('catPages').scrollTop=mot?Math.max(0,lu):lu;
  $('catPages').querySelectorAll('canvas[data-img]').forEach(cv=>illustrerArticle(cv,cv.dataset.img));
  $('catPages').querySelectorAll('[data-a]').forEach(b=>b.onclick=()=>acheterALaBoutique(b.dataset.a,b));
  $('catPages').querySelectorAll('[data-m]').forEach(b=>b.onclick=async()=>{const d=await appelRPC('choisir_peche',{p_joueur:e.id,p_appat:b.dataset.m,p_finition:null});
    if(d&&!d.erreur)EQUIP_PECHE=d;afficherPecheMarine();});
  $('catPages').querySelectorAll('[data-f]').forEach(b=>b.onclick=async()=>{const d=await appelRPC('choisir_peche',{p_joueur:e.id,p_appat:null,p_finition:b.dataset.f});
    if(d&&!d.erreur)EQUIP_PECHE=d;afficherPecheMarine();});
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
/* ---------------- LES OBJETS : gravés une fois, par variante ---------------- */

/* ================= LE BASSIN VIVANT =================
   Tout ce qui bouge sur l'eau est calculé ici, à chaque image : le Ferry
   Boat qui fait la navette, les reflets des bateaux, les bancs de poissons
   sous la surface. Les mouettes, elles, passent par-dessus tout. */
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
/* les bancs de poissons : là où la pêche est bonne */
const BANCS=[[360,506],[620,508],[880,506],[250,378],[760,376],[1000,378],[500,380]];
function eauVivante(g,camX,camY){
  const T=Date.now()/1000;
  /* 2 · LES REFLETS : chaque coque se mire dans l'eau, un peu tremblée */
  g.save();
  for(const o of DECOR){
    if(o.t!=='x_voilier'&&o.t!=='x_barque'&&o.t!=='x_caboteur'&&o.t!=='x_ferry')continue;
    const C=XCAL[o.t+(o.v||0)];if(!C)continue;
    const sx=o.x-camX, sy=o.y-camY;
    if(sx<-C.W||sx>VW+C.W||sy<-10||sy>VH+C.H)continue;
    /* LE REFLET EST GRAVÉ UNE FOIS : retourné, aplati, déjà transparent. À chaque image, on ne fait
       plus que le poser (avant : un retournement et une transparence recalculés pour chaque coque). */
    const cle=(o.flip?'r':'d');C.refl=C.refl||{};
    if(!C.refl[cle]){const h=Math.ceil(C.H*0.55), c=document.createElement('canvas');c.width=C.W;c.height=h;const q=c.getContext('2d');
      q.globalAlpha=o.t==='x_voilier'?0.13:0.18;q.translate(o.flip?C.W:0,0);q.scale(o.flip?-1:1,1);q.translate(C.W/2,C.sol*0.55);q.scale(1,-0.55);
      q.drawImage(C.toile,-C.W/2,-C.sol,C.W,C.H);C.refl[cle]={c,oy:C.sol*0.55};}
    const R2=C.refl[cle], vague=Math.round(Math.sin(T*1.8+o.x*0.07));
    g.drawImage(R2.c,Math.round(sx+vague-C.W/2),Math.round(sy+2-R2.oy),C.W,R2.c.height);
  }
  g.restore();
  /* 3 · LES BANCS DE POISSONS, sous la surface */
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
  /* 4 · LES VAGUELETTES qui accrochent la lumière */
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

/* ---------------- LE DÉCOR, posé à la main ---------------- */
/* CROUSTI'PORT : le fast-food de poulet frit du quai. Un immeuble comme ses voisins, mais au
   rez-de-chaussée une devanture rouge et blanche, sa grande enseigne, le coq marin à casquette,
   la vitrine et ses menus ; la nuit, tout s'allume. */
function graverCroustiPort(){
  const base=graverImmeuble(7), W=base.W, H=base.H, sol=base.sol, cx=W/2, BL=138, x0=cx-BL/2, rez=40, yR=sol-rez;
  const copie=(src)=>{const c=document.createElement('canvas');c.width=src.width;c.height=src.height;c.getContext('2d').drawImage(src,0,0);return c;};
  const peindre=(cv,nuit)=>{const D=cv.width/W, g=cv.getContext('2d');g.setTransform(D,0,0,D,0,0);g.imageSmoothingEnabled=false;
    const R=(x,y,w,h,col)=>{g.fillStyle=col;g.fillRect(Math.round(x*2)/2,Math.round(y*2)/2,Math.max(0.5,w),Math.max(0.5,h));};
    /* la devanture : de larges bandes rouges et blanches */
    for(let k=0;k<BL;k+=6)R(x0+k,yR,6,rez,(k/6)%2?'#f4efe6':'#c8281e');
    R(x0,yR,BL,1,'#7a1610');R(x0,sol-1,BL,1,'#5a1008');
    /* la grande vitrine, le comptoir derrière, les menus lumineux */
    R(x0+10,yR+14,BL-20,rez-16,nuit?'#ffd88a':'#2e2a2a');
    if(!nuit){g.fillStyle='rgba(255,255,255,.14)';g.beginPath();g.moveTo(x0+16,sol-2);g.lineTo(x0+30,yR+14);g.lineTo(x0+38,yR+14);g.lineTo(x0+24,sol-2);g.fill();}
    R(x0+14,yR+26,BL-28,6,nuit?'#c8281e':'#8a1e16');R(x0+14,yR+26,BL-28,1,'#f4efe6');                               /* le comptoir */
    [[0],[1],[2]].forEach(([k])=>{const mx=x0+22+k*34;R(mx,yR+16,26,8,nuit?'#1a1a1e':'#1a1a1e');R(mx+2,yR+17.5,6,5,'#e8a030');R(mx+10,yR+18,14,1,'#f4efe6');R(mx+10,yR+20,10,1,'#f4efe6');R(mx+10,yR+22,12,1,'#c8281e');});
    for(let k=x0+10;k<x0+BL-10;k+=22)R(k,yR+14,1,rez-16,'#5a1008');
    /* la porte vitrée, au milieu */
    R(cx-9,yR+12,18,rez-12,'#5a1008');R(cx-8,yR+13,16,rez-14,nuit?'#ffe0a0':'#3a3636');R(cx-0.5,yR+13,1,rez-14,'#5a1008');R(cx-4,sol-12,2,1,'#e8c06a');R(cx+2,sol-12,2,1,'#e8c06a');
    /* l'auvent à festons */
    for(let k=0;k<BL;k+=8){R(x0+k,yR+5,8,6,(k/8)%2?'#f4efe6':'#c8281e');g.fillStyle=(k/8)%2?'#f4efe6':'#c8281e';g.beginPath();g.arc(x0+k+4,yR+11,4,0,Math.PI);g.fill();}
    R(x0-2,yR+4,BL+4,1.5,'#7a1610');
    /* LA GRANDE ENSEIGNE, au-dessus de l'auvent */
    const ey=yR-15;R(x0+18,ey,BL-36,14,'#e8b030');R(x0+19,ey+1,BL-38,12,'#c8281e');
    g.font='900 9px Georgia,serif';g.textAlign='center';g.fillStyle='#7a1610';g.fillText('CROUSTI’PORT',cx+8.6,ey+10.6,BL-66);g.fillStyle=nuit?'#fff6d0':'#ffffff';g.fillText('CROUSTI’PORT',cx+8,ey+10,BL-66);g.textAlign='left';
    /* le coq marin à casquette, dans son rond */
    const lx=x0+30, ly=ey+7;g.fillStyle='#ffffff';g.beginPath();g.arc(lx,ly,8.5,0,7);g.fill();g.fillStyle='#e8b030';g.beginPath();g.arc(lx,ly,8.5,0,7);g.lineWidth=1.2;g.strokeStyle='#e8b030';g.stroke();
    R(lx-4,ly-1,7,6,'#f4efe6');R(lx-4,ly-1,7,1,'#d8d0c0');R(lx+2.5,ly+1,3,1.5,'#e8a030');R(lx+2,ly+2.5,2,1.5,'#c8281e');       /* la tête, le bec, la barbe */
    R(lx,ly,1,1,'#1a1a1e');R(lx-5,ly-4,8,2.5,'#1d3f8f');R(lx-3,ly-6,5,2.5,'#1d3f8f');R(lx-5,ly-2,9,1,'#1a1a1e');R(lx-2,ly-7,1.5,1.5,'#c8281e');   /* la casquette de marin, et la crête qui dépasse */
    /* le seau géant, accroché en drapeau au coin de la façade */
    const sx=x0+BL-6, sy=yR-30;R(sx,sy+2,1.5,20,'#3a3a40');
    g.fillStyle='#f4efe6';g.beginPath();g.moveTo(sx+3,sy);g.lineTo(sx+19,sy);g.lineTo(sx+17,sy+16);g.lineTo(sx+5,sy+16);g.closePath();g.fill();
    for(let k=0;k<4;k++){g.fillStyle='#c8281e';g.beginPath();g.moveTo(sx+4+k*4,sy);g.lineTo(sx+6+k*4,sy);g.lineTo(sx+6+k*3.5,sy+16);g.lineTo(sx+5+k*3.5,sy+16);g.closePath();g.fill();}
    [[5,-2],[9,-3],[13,-2],[16,-1]].forEach(([dx,dy])=>{g.fillStyle='#c07a30';g.beginPath();g.arc(sx+dx,sy+dy,2.6,0,7);g.fill();g.fillStyle='#e0a050';g.fillRect(sx+dx-1,sy+dy-2,1.5,1);});
    if(nuit){const l=g.createRadialGradient(cx,sol,4,cx,sol,70);l.addColorStop(0,'rgba(255,190,110,.5)');l.addColorStop(1,'rgba(255,190,110,0)');g.fillStyle=l;g.fillRect(cx-70,sol-70,140,76);}
  };
  const toile=copie(base.toile), nuit=copie(base.nuit||base.toile);peindre(toile,false);peindre(nuit,true);
  return {toile,W,H,sol,nuit};
}
/* LE BAR DES DOCKS : le bar-tabac du quai. Une devanture lie-de-vin, un store rayé vert et blanc,
   l'enseigne, la carotte rouge du tabac, l'affiche « JEUX », le zinc et les bouteilles dans la vitrine,
   deux guéridons en terrasse ; la nuit, le bar s'allume et la carotte brille. */
function chaiseBistro(R,g,x,y,c){R(x-2.5,y-3,5,1.2,c||'#b8864a');R(x-2.5,y-8,1,5,'#4a3a2a');R(x+1.5,y-8,1,5,'#4a3a2a');R(x-2.5,y-8,5,1,'#4a3a2a');for(let k=0;k<2;k++)R(x-2+k*3,y-6,.6,3,c||'#b8864a');R(x-2.2,y-2,.8,3,'#3a3a40');R(x+1.4,y-2,.8,3,'#3a3a40');}
function tableBistro(R,x,y){R(x-4.5,y-5,9,1.5,'#e8e4dc');R(x-4.5,y-5,9,.5,'#fff');R(x-.5,y-3.5,1,4,'#3a3a40');R(x-2.5,y,5,1,'#3a3a40');}
function clientTerrasse(R,x,y,veste,dos){R(x-2,y-12,4,4,'#e0b088');R(x-2.3,y-13,4.6,2,dos?'#3a2a1c':'#6a4a2a');R(x-2.5,y-8,5,5,veste);R(x-2,y-3,1.5,3,'#2a2a30');R(x+.5,y-3,1.5,3,'#2a2a30');}
function carotteTabac(R,g,x,y,nuit){R(x-.5,y-6,1,6,'#3a3a40');g.fillStyle=nuit?'#ff5a3a':'#c8281e';g.beginPath();g.moveTo(x,y);g.lineTo(x+5,y+7);g.lineTo(x,y+14);g.lineTo(x-5,y+7);g.closePath();g.fill();
  if(nuit){g.fillStyle='rgba(255,90,58,.35)';g.beginPath();g.arc(x,y+7,10,0,7);g.fill();}g.font='900 3px Arial';g.textAlign='center';g.fillStyle='#fff';g.fillText('TABAC',x,y+8);g.textAlign='left';}
function logoPMU(R,g,x,y){R(x,y,16,9,'#1f7a3a');R(x,y,16,1,'#3aa05a');g.font='900 6px Arial';g.textAlign='center';g.fillStyle='#fff';g.fillText('PMU',x+8,y+7);g.textAlign='left';}
function lueurB(g,cx,sol,nuit,c){if(!nuit)return;const l=g.createRadialGradient(cx,sol,4,cx,sol,80);l.addColorStop(0,c||'rgba(255,210,140,.5)');l.addColorStop(1,'rgba(255,210,140,0)');g.fillStyle=l;g.fillRect(cx-80,sol-80,160,86);}
/* 1 · LE BAR DES DOCKS, BAR-TABAC PMU : store bordeaux, carotte TABAC lumineuse, logo PMU, écran des courses,
   terrasse de chaises bistrot cannées, habitués attablés, ardoise du plat du jour, présentoir FDJ */
function graverLeBar(){return devanture(0,(g,R,{sol,cx,BL,x0,rez,yR},nuit)=>{
  R(x0,yR,BL,rez,'#6a1a1e');R(x0,yR,BL,1.5,'#d8b050');R(x0,sol-2,BL,2,'#3a0a0e');
  R(x0+8,yR+12,BL-16,rez-16,nuit?'#ffe0a8':'#2a1c18');
  R(x0+14,yR+16,40,2,'#b8b0a0');for(let k=0;k<6;k++)R(x0+16+k*6,yR+13,2,3,['#e8a040','#6ab0e8','#e84a4a'][k%3]);   /* le comptoir, les bouteilles */
  R(x0+BL-44,yR+14,20,12,'#1a2a3a');R(x0+BL-43,yR+15,18,10,nuit?'#6ab04a':'#3a7a2a');for(let k=0;k<4;k++)R(x0+BL-41+k*4,yR+19+(k%2),2,1.5,'#f0e060');   /* l'écran des courses */
  R(cx-8,yR+12,16,rez-12,'#3a0a0e');R(cx-7,yR+13,14,rez-14,nuit?'#ffe8b8':'#4a2a26');
  /* le store bordeaux « BAR · TABAC · PMU » */
  for(let k=0;k<BL;k+=8){R(x0+k,yR+1,8,9,(k/8)%2?'#8a1a22':'#6a1016');g.fillStyle=(k/8)%2?'#8a1a22':'#6a1016';g.beginPath();g.arc(x0+k+4,yR+10,4,0,Math.PI);g.fill();}
  g.font='900 5.5px Arial,sans-serif';g.textAlign='center';g.fillStyle='#f4ecd8';g.fillText('BAR · TABAC · PMU',cx,yR+7.5,BL-20);g.textAlign='left';
  /* l'enseigne peinte au-dessus, la carotte, le logo */
  const ey=yR-15;R(x0+18,ey,BL-36,12,'#f4ecd8');R(x0+18,ey,BL-36,1,'#6a1a1e');R(x0+18,ey+11,BL-36,1,'#6a1a1e');
  g.font='900 7.8px Georgia,serif';g.textAlign='center';g.fillStyle='#6a1a1e';g.fillText('LE BAR DES DOCKS',cx,ey+8.6,BL-44);g.textAlign='left';
  carotteTabac(R,g,x0+BL+3,yR-20,nuit);logoPMU(R,g,x0+2,ey+1);
  /* l'ardoise et le présentoir FDJ devant */
  R(x0+2,sol-18,10,16,'#5b3f21');R(x0+3,sol-17,8,11,'#2e3a34');for(let k=0;k<3;k++)R(x0+4,sol-15+k*3,5,.6,'#f4f0e0');
  R(x0+BL-12,sol-16,9,14,'#e8e4dc');R(x0+BL-12,sol-16,9,3,'#2d6fb0');R(x0+BL-11,sol-12,7,1,'#e8c040');R(x0+BL-11,sol-9,7,1,'#e84a4a');
  lueurB(g,cx,sol,nuit);});}
/* LA TERRASSE, posée sur le quai devant le bar : tables rondes, chaises bistrot, habitués, et un parasol pour le Zinc */
function graverTerrasse(v){const W=160,H=60,sol=H-4,D=2,c=document.createElement('canvas');c.width=W*D;c.height=H*D;const g=c.getContext('2d');g.setTransform(D,0,0,D,0,0);g.imageSmoothingEnabled=false;
  const R=(x,y,w,h,col)=>{g.fillStyle=col;g.fillRect(Math.round(x*2)/2,Math.round(y*2)/2,Math.max(.5,w),Math.max(.5,h));};
  const ch=[null,'#b8864a','#c89a5a','#9a2a1e'][v];
  [[22,sol-14],[64,sol-6],[108,sol-14],[146,sol-6]].forEach(([x,y],k)=>{g.fillStyle='rgba(0,0,0,.18)';g.beginPath();g.ellipse(x,y+1,9,2,0,0,7);g.fill();
    chaiseBistro(R,g,x-8,y,ch);chaiseBistro(R,g,x+8,y,ch);tableBistro(R,x,y);
    if(k%2===0){clientTerrasse(R,x-8,y-2,['#2d6fb0','#e8c040','#5d9a4e','#c84a2a'][k],false);R(x-1,y-8,2,3,'#f0e0a0');R(x+1.5,y-7,1.5,2,'#e8c89a');}
    else{clientTerrasse(R,x+8,y-2,['#8a5ad8','#3a3a40'][k%2],true);R(x-2,y-7,1.5,2,'#c8e8f0');}});
  if(v===3){R(84,4,1.5,sol-10,'#3a3a40');g.fillStyle='#c83a3a';g.beginPath();g.moveTo(58,16);g.quadraticCurveTo(85,-2,112,16);g.closePath();g.fill();for(let k=0;k<6;k++)R(60+k*9,14,4,2,k%2?'#f4ecd8':'#c83a3a');}
  return {toile:c,W,H,sol,nuit:null};}

/* un guéridon de terrasse, ses deux chaises, un verre de pastis et un café */
function graverGueridon(){const W=30,H=22,D=2,c=document.createElement('canvas');c.width=W*D;c.height=H*D;const g=c.getContext('2d');g.setTransform(D,0,0,D,0,0);const sol=H-3, cx=W/2;
  g.fillStyle='rgba(40,30,18,.25)';g.beginPath();g.ellipse(cx,sol,13,2.5,0,0,7);g.fill();
  [[-10],[8]].forEach(([k])=>{g.fillStyle='#8a6a3a';g.fillRect(cx+k,sol-9,3,1.2);g.fillRect(cx+k,sol-9,0.8,9);g.fillRect(cx+k+2.2,sol-9,0.8,9);g.fillRect(cx+k+(k<0?0:2.2),sol-15,0.8,6);});
  g.fillStyle='#3a3a40';g.fillRect(cx-0.5,sol-9,1,9);g.fillRect(cx-3,sol-0.5,6,1);g.fillStyle='#e8e2d4';g.beginPath();g.ellipse(cx,sol-10,6,2,0,0,7);g.fill();
  g.fillStyle='#f0d890';g.fillRect(cx-3,sol-13,1.6,3);g.fillStyle='rgba(255,255,255,.6)';g.fillRect(cx-3,sol-13,0.5,3);g.fillStyle='#ffffff';g.fillRect(cx+1,sol-12,2,1.5);g.fillStyle='#3a2616';g.fillRect(cx+1.3,sol-12,1.4,0.6);
  return {toile:c,W,H,sol,nuit:null};}
/* trois nouvelles devantures, dessinées sur un immeuble du quai comme leurs voisines */
function devanture(v,peindre){const base=graverImmeuble(v), W=base.W, H=base.H, sol=base.sol, cx=W/2, BL=138, x0=cx-BL/2, rez=40, yR=sol-rez;
  const copie=(src)=>{const c=document.createElement('canvas');c.width=src.width;c.height=src.height;c.getContext('2d').drawImage(src,0,0);return c;};
  const go=(cv,nuit)=>{const D=cv.width/W, g=cv.getContext('2d');g.setTransform(D,0,0,D,0,0);g.imageSmoothingEnabled=false;
    const R=(x,y,w,h,col)=>{g.fillStyle=col;g.fillRect(Math.round(x*2)/2,Math.round(y*2)/2,Math.max(0.5,w),Math.max(0.5,h));};peindre(g,R,{W,H,sol,cx,BL,x0,rez,yR},nuit);};
  const toile=copie(base.toile), nuit=copie(base.nuit||base.toile);go(toile,false);go(nuit,true);return {toile,W,H,sol,nuit};}
/* LE FUMOIR DU QUAI : brique, la haute cheminée qui fume, les harengs suspendus derrière la vitre */
function graverLeFumoir(){return devanture(5,(g,R,{sol,cx,BL,x0,rez,yR},nuit)=>{
  R(x0,yR,BL,rez,'#7a4a34');for(let y=yR;y<sol;y+=4)for(let x=x0+((y-yR)/4%2?4:0);x<x0+BL;x+=9)R(x,y,8,3.2,'#8a5a40');
  R(x0,yR,BL,1.5,'#3a2216');R(x0,sol-4,BL,4,'#4a2c1e');
  R(x0+8,yR+10,BL-16,rez-18,nuit?'#ffcf90':'#231a14');
  for(let k=0;k<9;k++){const x=x0+16+k*13;R(x,yR+12,0.8,6,'#c8a868');g.fillStyle=k%2?'#c8813a':'#b06a2a';g.beginPath();g.ellipse(x+0.4,yR+22,3,6,0,0,7);g.fill();g.fillStyle='#8a4a1a';g.fillRect(x-2,yR+26,5,1);}   /* les poissons pendus */
  R(cx-10,yR+6,20,rez-6,'#3a2216');R(cx-9,yR+7,18,rez-7,nuit?'#ffe0a0':'#4a3226');R(cx-0.5,yR+7,1,rez-7,'#3a2216');
  const ey=yR-15;R(x0+16,ey,BL-32,12,'#3a2216');R(x0+17,ey+1,BL-34,10,'#5a3a26');
  g.font='700 7.6px Georgia';g.textAlign='center';g.fillStyle='#f0d890';g.fillText('LE FUMOIR DU QUAI',cx,ey+8.4,BL-40);g.textAlign='left';
  /* la cheminée, et sa fumée qui monte le long de la façade */
  const chx=x0+BL-16;R(chx,yR-46,10,32,'#6a3f2a');R(chx,yR-46,10,2,'#8a5a40');
  g.fillStyle=nuit?'rgba(220,220,230,.22)':'rgba(240,240,245,.35)';
  for(let k=0;k<7;k++){const t=k/7;g.beginPath();g.arc(chx+5+Math.sin(k*1.7)*5,yR-50-k*9,4+k*1.8,0,7);g.fill();}
  if(nuit){const l=g.createRadialGradient(cx,sol,4,cx,sol,70);l.addColorStop(0,'rgba(255,190,110,.42)');l.addColorStop(1,'rgba(255,190,110,0)');g.fillStyle=l;g.fillRect(cx-70,sol-70,140,76);}});}
/* LA POSTE DU VIEUX-PORT : pierre claire, le fronton bleu, la boîte aux lettres jaune, le guichet */
function graverLaPoste(){return devanture(4,(g,R,{sol,cx,BL,x0,rez,yR},nuit)=>{
  R(x0,yR-10,BL,rez+10,'#eee6d4');for(let y=yR-10;y<sol;y+=6)R(x0,y,BL,0.5,'#d8cdb8');
  R(x0,sol-5,BL,5,'#1d4f8a');
  [[-46],[22]].forEach(([k])=>{R(cx+k,yR+8,24,rez-12,nuit?'#ffe8b0':'#3a4450');for(let q=0;q<3;q++)R(cx+k+q*8,yR+8,0.8,rez-12,'#8a8f96');R(cx+k,yR+18,24,0.8,'#8a8f96');});
  R(cx-12,yR+4,24,rez-4,'#1d4f8a');R(cx-11,yR+5,22,rez-5,nuit?'#ffe8b8':'#3a4a58');R(cx-0.5,yR+5,1,rez-5,'#1d4f8a');R(cx+4,sol-14,1.5,3,'#f0c040');
  const ey=yR-22;R(x0+12,ey,BL-24,12,'#1d4f8a');g.font='700 7.6px Georgia';g.textAlign='center';g.fillStyle='#ffffff';g.fillText('LA POSTE DU VIEUX-PORT',cx,ey+8.6,BL-30);g.textAlign='left';
  /* la boîte aux lettres, sur le trottoir */
  const bx=x0+BL-18;R(bx,sol-26,14,20,'#f0c040');R(bx,sol-26,14,2,'#ffe070');R(bx+2,sol-22,10,2,'#5a4a10');R(bx+5,sol-6,4,6,'#8a8f96');
  g.fillStyle='#1d4f8a';g.font='700 3px Georgia';g.fillText('LETTRES',bx+1,sol-14);
  /* le cor de poste, emblème au-dessus de la porte */
  g.strokeStyle='#1d4f8a';g.lineWidth=1.4;g.beginPath();g.arc(cx,yR-3,4.5,0.4,Math.PI*1.6);g.stroke();g.beginPath();g.moveTo(cx+3.5,yR-6);g.lineTo(cx+8,yR-8);g.stroke();
  if(nuit){const l=g.createRadialGradient(cx,sol,4,cx,sol,70);l.addColorStop(0,'rgba(255,215,150,.42)');l.addColorStop(1,'rgba(255,215,150,0)');g.fillStyle=l;g.fillRect(cx-70,sol-70,140,76);}});}
/* LA POISSONNERIE, en façade : faïence bleue et blanche, le store rayé, l'étal de glace pilée et ses poissons */
function poissonPx(g,x,y,c1,c2,sens){sens=sens||1;g.fillStyle=c1;g.beginPath();g.ellipse(x,y,4.4,1.7,0,0,7);g.fill();g.fillStyle=c2;g.fillRect(x-3,y-1.2,6,0.8);
  g.fillStyle=c1;g.beginPath();g.moveTo(x-4*sens,y);g.lineTo(x-6.5*sens,y-2.2);g.lineTo(x-6.5*sens,y+2.2);g.fill();g.fillStyle='#1a1a1a';g.fillRect(x+2.6*sens-0.4,y-0.6,0.8,0.8);}
const PX_P=[['#8aa0b0','#c8d4dc'],['#c86a4a','#e89a7a'],['#6a8aa0','#a8c0d0'],['#d8b060','#f0d890'],['#b04a3a','#e07a5a']];
/* A · LA CRIÉE : bois bleu marine, store rayé, étal de glace pilée dehors, ardoise des prix, filets et lanternes */
function graverLaPoissonnerie(){return devanture(1,(g,R,{sol,cx,BL,x0,rez,yR},nuit)=>{
  R(x0,yR,BL,rez,'#1f3a5a');for(let x=x0;x<x0+BL;x+=6){R(x,yR,1,rez,'#16304c');R(x+1,yR,1,rez,'#28486a');}R(x0,yR,BL,1.5,'#d8b050');R(x0,sol-3,BL,3,'#12263c');
  R(x0+8,yR+12,BL-16,rez-26,nuit?'#ffe6b0':'#223040');for(let k=0;k<6;k++)poissonPx(g,x0+22+k*19,yR+20,PX_P[k%5][0],PX_P[k%5][1]);   /* les poissons suspendus en vitrine */
  R(cx-9,yR+8,18,rez-8,'#12263c');R(cx-8,yR+9,16,rez-10,nuit?'#ffe8b8':'#2a3a4c');R(cx+4,sol-14,1.5,3,'#d8b050');
  /* l'étal dehors : les caisses de bois, la glace pilée, les poissons en rang, les citrons */
  [[x0+4],[x0+BL-50]].forEach(([x])=>{R(x,sol-12,46,10,'#8a6238');R(x,sol-12,46,1.5,'#a8804a');R(x+1,sol-15,44,4,'#e8f4fa');R(x+1,sol-15,44,1,'#ffffff');
    for(let k=0;k<5;k++)poissonPx(g,x+6+k*8.6,sol-13.5,PX_P[(k+1)%5][0],PX_P[(k+1)%5][1],k%2?1:-1);R(x+40,sol-16,3,3,'#f0d040');});
  /* le store rayé bleu et blanc, festonné */
  for(let k=0;k<BL;k+=8){R(x0+k,yR+1,8,8,(k/8)%2?'#ffffff':'#2d6fb0');g.fillStyle=(k/8)%2?'#ffffff':'#2d6fb0';g.beginPath();g.arc(x0+k+4,yR+9,4,0,Math.PI);g.fill();}
  /* l'ardoise des prix, le filet et ses flotteurs */
  R(x0+BL-18,yR+14,14,16,'#5b3f21');R(x0+BL-17,yR+15,12,14,'#2e3a34');for(let k=0;k<4;k++)R(x0+BL-15,yR+17+k*3,8,.7,'#f4f0e0');
  g.strokeStyle='rgba(220,200,160,.8)';g.lineWidth=.5;for(let k=0;k<5;k++){g.beginPath();g.moveTo(x0+4+k*3,yR+10);g.lineTo(x0+4+k*3,yR+28);g.stroke();g.beginPath();g.moveTo(x0+2,yR+12+k*4);g.lineTo(x0+18,yR+12+k*4);g.stroke();}
  R(x0+6,yR+26,3,3,'#e8402a');R(x0+13,yR+27,3,3,'#e8402a');
  /* l'enseigne dorée sur bois, avec le poisson */
  const ey=yR-16;R(x0+10,ey,BL-20,13,'#d8b050');R(x0+11,ey+1,BL-22,11,'#1f3a5a');
  g.font='700 8px Georgia,serif';g.textAlign='center';g.fillStyle=nuit?'#fff0c0':'#f0d890';g.fillText('LA CRIÉE',cx+8,ey+9,BL-50);g.textAlign='left';poissonPx(g,x0+30,ey+6.5,'#f0d890','#fff0c0');
  [[x0+2],[x0+BL-4]].forEach(([x])=>{R(x,ey+2,2,6,'#3a3a40');R(x-1,ey+8,4,5,'#3a3a40');R(x-.5,ey+8.5,3,4,nuit?'#ffe080':'#c8b070');});
  if(nuit){const l=g.createRadialGradient(cx,sol,4,cx,sol,70);l.addColorStop(0,'rgba(255,220,160,.45)');l.addColorStop(1,'rgba(255,220,160,0)');g.fillStyle=l;g.fillRect(cx-70,sol-70,140,76);}});}
/* LA MAISON DE LA PRESSE, en façade sur le quai : vert bouteille à filets d'or, la vitrine aux journaux et aux
   magazines en éventail, le présentoir de quotidiens devant la porte, l'enseigne « PRESSE · JOURNAUX ». */
function graverLaPresse(){return devanture(2,(g,R,{sol,cx,BL,x0,rez,yR},nuit)=>{
  R(x0,yR,BL,rez,'#24503e');R(x0,yR,BL,1.5,'#d8b050');R(x0,sol-2,BL,2,'#163a2c');
  for(let k=x0+4;k<x0+BL-2;k+=30)R(k,yR+3,0.8,rez-5,'#d8b050');                                            /* les filets d'or */
  /* les deux vitrines : des étagères de magazines colorés, des journaux pliés en éventail */
  [[x0+8],[x0+BL-52]].forEach(([x])=>{R(x,yR+8,44,rez-12,nuit?'#ffe6b8':'#26322e');
    for(let r=0;r<2;r++){R(x+1,yR+19+r*11,42,1.2,'#8a6238');for(let k=0;k<7;k++){const c=['#c8402a','#2d6fb0','#e8c040','#5d9a4e','#e86a8a','#f4f0e0','#8a6ad8'][(k+r*3)%7];
      R(x+2+k*6,yR+11+r*11,5,8,c);R(x+2+k*6,yR+11+r*11,5,2.4,'#f4ecd8');R(x+3+k*6,yR+15+r*11,3,.6,'rgba(0,0,0,.35)');}}
    if(!nuit){g.fillStyle='rgba(255,255,255,.12)';g.beginPath();g.moveTo(x+4,sol-4);g.lineTo(x+14,yR+8);g.lineTo(x+20,yR+8);g.lineTo(x+10,sol-4);g.fill();}});
  /* la porte vitrée, sa poignée dorée */
  R(cx-9,yR+6,18,rez-6,'#163a2c');R(cx-8,yR+7,16,rez-8,nuit?'#ffe8b8':'#34423e');R(cx-0.5,yR+7,1,rez-8,'#163a2c');R(cx+4,sol-14,1.5,3,'#d8b050');
  /* le présentoir de quotidiens, devant la porte, et l'affichette du jour */
  R(cx+12,sol-16,12,14,'#5b3f21');for(let k=0;k<3;k++){R(cx+13,sol-15+k*4.5,10,3.8,['#f4ecd8','#e8e0cc','#f4ecd8'][k]);R(cx+14,sol-14+k*4.5,6,.5,'#3a3a40');}
  R(cx-24,sol-18,10,14,'#f4ecd8');R(cx-24,sol-18,10,3,'#c8402a');R(cx-23,sol-13,8,.6,'#3a3a40');R(cx-23,sol-11,6,.6,'#3a3a40');R(cx-23,sol-9,7,.6,'#3a3a40');R(cx-20,sol-4,2,4,'#5b3f21');
  /* l'enseigne, sur son bandeau vert et or */
  const ey=yR-14;R(x0+12,ey,BL-24,13,'#d8b050');R(x0+13,ey+1,BL-26,11,'#24503e');
  g.font='700 7.8px Georgia,serif';g.textAlign='center';g.fillStyle=nuit?'#fff0c0':'#f0d890';g.fillText('PRESSE · JOURNAUX',cx,ey+9,BL-34);g.textAlign='left';
  if(nuit){const l=g.createRadialGradient(cx,sol,4,cx,sol,70);l.addColorStop(0,'rgba(255,210,140,.45)');l.addColorStop(1,'rgba(255,210,140,0)');g.fillStyle=l;g.fillRect(cx-70,sol-70,140,76);}});}
/* CHEZ FONFON : le restaurant de bouillabaisse du quai, bordeaux et or */
function restoFonfon(teinte){const T=teinte==='marine'?{b:'#1f3452',bh:'#2c4a72',bs:'#122238',store:['#1f3a6a','#2a4a80'],or:'#e2c070'}:{b:'#5a1a1e',bh:'#7a2a2e',bs:'#3a0c10',store:['#8a1a22','#a8262e'],or:'#e8c46a'};
  return devanture(1,(g,R,{sol,cx,BL,x0,rez,yR},nuit)=>{
  /* la devanture en bois peint : pilastres moulurés, soubassement, corniche dorée */
  R(x0-2,yR-4,BL+4,rez+4,T.b);R(x0-2,yR-4,BL+4,1.5,T.or);R(x0-2,sol-6,BL+4,6,T.bs);R(x0-2,sol-6,BL+4,1,T.bh);
  [x0,x0+44,x0+BL-50,x0+BL-6].forEach(x=>{R(x,yR,6,rez-6,T.bh);R(x+1,yR,1,rez-6,'rgba(255,255,255,.18)');R(x+5,yR,1,rez-6,T.bs);R(x-1,yR,8,2,T.or);R(x-1,sol-8,8,2,T.or);});
  /* les deux grandes baies : la salle éclairée, nappes blanches, verres, bougies, les convives, un serveur */
  [[x0+6,38],[x0+BL-44,38]].forEach(([x,w],k)=>{const fond=nuit?'#ffe2b0':'#e8d2a8';R(x,yR+2,w,rez-10,fond);
    R(x,yR+2,w,10,nuit?'#f0c890':'#d8bc90');for(let q=0;q<3;q++){R(x+4+q*12,yR+4,1,6,'#6a4a2a');R(x+2+q*12,yR+10,5,2,'#fff4d0');}   /* les appliques */
    R(x,yR+12,w,1,'#b89a6a');
    for(let q=0;q<2;q++){const tx=x+9+q*20,ty=sol-16;R(tx-7,ty,14,4,'#fbfaf6');R(tx-7,ty+4,14,5,'#eeeae2');R(tx-1,ty+9,2,3,'#6a4a2a');
      R(tx-4,ty-2,3,2,'#e8703a');R(tx+2,ty-2,3,2,'#e8703a');R(tx-5.5,ty-1,1,1,'#fff');R(tx+.5,ty-5,1,4,'#d8e8f0');R(tx,ty-6,2,1.5,nuit?'#ffd060':'#e8c46a');   /* bouillabaisse, verre, bougie */
      R(tx-11,ty-6,4,4,'#e0b088');R(tx-11.5,ty-7,5,2,['#3a2a1a','#8a5a2a'][q]);R(tx-12,ty-2,5,6,['#2a4a7a','#8a2a3a'][q]);
      R(tx+7,ty-6,4,4,'#e0b088');R(tx+6.5,ty-7,5,2,['#c8a060','#1a1a1a'][q]);R(tx+7,ty-2,5,6,['#3a6a4a','#c86a8a'][q]);}
    if(k===1){R(x+w-8,sol-26,4,4,'#e0b088');R(x+w-9,sol-22,6,10,'#1a1a1a');R(x+w-8,sol-22,4,3,'#fff');R(x+w-12,sol-19,5,1,'#c8ccd4');}                    /* le serveur et son plateau */
    R(x,yR+2,w,rez-10,'rgba(255,255,255,.06)');g.fillStyle='rgba(255,255,255,.14)';g.beginPath();g.moveTo(x+4,sol-8);g.lineTo(x+14,yR+2);g.lineTo(x+19,yR+2);g.lineTo(x+9,sol-8);g.fill();
    R(x+w/2-.5,yR+2,1,rez-10,T.b);R(x,yR+2,w,1.5,T.b);R(x,sol-9,w,1.5,T.b);
    /* les lettres dorées peintes sur la vitre */
    g.font='italic 700 4.6px Georgia,serif';g.textAlign='center';g.fillStyle=T.or;g.fillText(k?'Poissons du jour':'Bouillabaisse',x+w/2,yR+17.5,w-6);g.textAlign='left';});
  /* la porte vitrée à deux battants, sa poignée de laiton, le menu encadré */
  R(cx-10,yR+2,20,rez-8,T.bs);R(cx-9,yR+3,18,rez-10,nuit?'#ffe8b8':'#d8c4a0');R(cx-.5,yR+3,1,rez-10,T.b);R(cx-9,yR+14,18,1,T.b);R(cx+3,sol-18,1.5,4,'#e8c46a');R(cx-4.5,sol-18,1.5,4,'#e8c46a');
  R(x0+BL/2-24,yR+8,10,13,T.or);R(x0+BL/2-23,yR+9,8,11,'#f8f2e2');for(let q=0;q<4;q++)R(x0+BL/2-22,yR+11+q*2.4,6,.6,'#6a4a2a');
  /* le store banne, rouge profond, festonné, et son lettrage */
  const sy=yR-10;for(let k=0;k<BL+8;k+=1){const c=k%12<6?T.store[0]:T.store[1];R(x0-4+k,sy,1,9,c);}R(x0-4,sy,BL+8,1.5,'rgba(255,255,255,.2)');
  for(let k=0;k<BL+8;k+=12){g.fillStyle=T.store[0];g.beginPath();g.arc(x0-4+k+6,sy+9,6,0,Math.PI);g.fill();}R(x0-4,sy+8.5,BL+8,1,'rgba(0,0,0,.2)');
  g.font='700 5px Arial,sans-serif';g.textAlign='center';g.fillStyle='#fff6e0';g.fillText('R E S T A U R A N T   ·   B O U I L L A B A I S S E',cx,sy+6,BL-10);g.textAlign='left';
  /* l'enseigne en lettres de laiton, sur le bandeau, avec deux lanternes */
  const ey=yR-26;R(x0+14,ey,BL-28,14,T.b);R(x0+14,ey,BL-28,1.2,T.or);R(x0+14,ey+12.8,BL-28,1.2,T.or);
  g.font='italic 900 10.5px Georgia,serif';g.textAlign='center';g.fillStyle='rgba(0,0,0,.4)';g.fillText('Chez Fonfon',cx+.6,ey+10.6,BL-40);g.fillStyle=nuit?'#fff0c0':T.or;g.fillText('Chez Fonfon',cx,ey+10,BL-40);g.textAlign='left';
  [[x0+8],[x0+BL-10]].forEach(([x])=>{R(x,ey-2,2,6,'#3a3a40');R(x-2,ey+4,6,8,'#2a2a30');R(x-1,ey+5,4,6,nuit?'#ffe080':'#d8c890');if(nuit){g.fillStyle='rgba(255,220,130,.3)';g.beginPath();g.arc(x+1,ey+8,9,0,7);g.fill();}});
  /* deux oliviers en pot, de part et d'autre */
  [[x0-2],[x0+BL-6]].forEach(([x])=>{R(x,sol-9,8,9,'#b8643a');R(x,sol-9,8,1.5,'#d8845a');for(let q=0;q<14;q++){g.fillStyle=q%2?'#7a8a5a':'#8a9a6a';g.beginPath();g.ellipse(x+4+Math.cos(q)*5,sol-18+Math.sin(q*1.7)*5,2.5,1.5,q,0,7);g.fill();}R(x+3.5,sol-16,1,7,'#6a5a3a');});
  if(nuit){const l=g.createRadialGradient(cx,sol,4,cx,sol,85);l.addColorStop(0,'rgba(255,215,150,.55)');l.addColorStop(1,'rgba(255,215,150,0)');g.fillStyle=l;g.fillRect(cx-85,sol-85,170,92);}});}

/* LE PÊCHEUR HEUREUX : la boutique de pêche du quai (le nom de la fonction reste, pour ne rien casser) */
const LUP=(g,cx,sol,nuit,c)=>{if(!nuit)return;const l=g.createRadialGradient(cx,sol,4,cx,sol,75);l.addColorStop(0,c||'rgba(255,215,150,.5)');l.addColorStop(1,'rgba(255,215,150,0)');g.fillStyle=l;g.fillRect(cx-75,sol-75,150,80);};
const bouee=(g,x,y,r,c1,c2)=>{g.strokeStyle=c1;g.lineWidth=r*.55;g.beginPath();g.arc(x,y,r,0,7);g.stroke();g.strokeStyle=c2;for(let q=0;q<4;q++){g.beginPath();g.arc(x,y,r,q*Math.PI/2+.2,q*Math.PI/2+.62);g.stroke();}};
const canne=(R,g,x,y,h,c,lance)=>{R(x,y,1,h,'#c8b890');R(x-.4,y+h-6,1.8,6,'#3a3a40');R(x-.6,y+h-9,2.2,2,'#8a8a90');if(lance){g.strokeStyle='rgba(230,230,230,.7)';g.lineWidth=.4;g.beginPath();g.moveTo(x+.5,y);g.quadraticCurveTo(x+6,y+10,x+4,y+h*.6);g.stroke();}R(x-.5,y+h*.35,2,1.2,c);};
/* B · LE PÊCHEUR HEUREUX : jaune soleil et bleu, un grand poisson en tôle peinte comme enseigne, les cannes en éventail,
   le frigo « APPÂTS VIVANTS », les caisses de leurres */
function graverLaBoutiquePeche(){return devanture(1,(g,R,{sol,cx,BL,x0,rez,yR},nuit)=>{
  R(x0,yR,BL,rez,'#f0c030');for(let k=0;k<300;k++)R(x0+((k*37)%BL),yR+((k*53)%rez),1,1,k%2?'#e0b020':'#f8d860');R(x0,sol-3,BL,3,'#1f5aa0');R(x0,yR,BL,2,'#1f5aa0');
  R(x0+8,yR+8,56,rez-12,nuit?'#fff0c8':'#23405a');for(let k=0;k<9;k++){const a=-.55+k*.14;g.save();g.translate(x0+36,sol-6);g.rotate(a);canne(R,g,0,-30,30,['#e8402a','#2a6ab0','#f0c040'][k%3],false);g.restore();}   /* l'éventail de cannes */
  R(cx+2,yR+8,18,rez-8,'#1f5aa0');R(cx+3,yR+9,16,rez-10,nuit?'#ffe8b8':'#2a4a70');R(cx+15,sol-14,1.5,3,'#f0c030');
  R(x0+BL-40,yR+10,32,rez-14,'#e8f2f8');R(x0+BL-40,yR+10,32,5,'#2a8ad8');g.font='700 3.6px Arial';g.fillStyle='#fff';g.fillText('APPÂTS VIVANTS',x0+BL-38.5,yR+14);
  for(let k=0;k<3;k++){R(x0+BL-38,yR+18+k*6,28,4,'#c8dce8');for(let q=0;q<6;q++)R(x0+BL-37+q*4.5,yR+19+k*6,3,2,['#c86a4a','#6a8a3a','#8a6a4a'][q%3]);}
  [[x0+2],[x0+14]].forEach(([x],k)=>{R(x,sol-9,11,7,'#8a6238');for(let q=0;q<4;q++)R(x+1+q*2.6,sol-11,2,3,['#e8402a','#f0c040','#2ab0a0','#e86aa0'][(q+k)%4]);});
  /* le grand poisson de tôle qui dépasse de la façade, avec son nom peint dessus */
  const px=cx+10,py=yR-16;g.fillStyle='#2a8ad8';g.beginPath();g.ellipse(px,py,40,9,0,0,7);g.fill();g.beginPath();g.moveTo(px+36,py);g.lineTo(px+50,py-9);g.lineTo(px+50,py+9);g.closePath();g.fill();
  g.fillStyle='#8ac8f0';g.beginPath();g.ellipse(px-4,py-3,30,3,0,0,7);g.fill();g.fillStyle='#fff';g.beginPath();g.arc(px-30,py-2,2.6,0,7);g.fill();g.fillStyle='#111';g.beginPath();g.arc(px-30,py-2,1.3,0,7);g.fill();
  g.font='900 6.6px Arial';g.textAlign='center';g.fillStyle='#fff';g.fillText('LE PÊCHEUR HEUREUX',px+2,py+2.4,64);g.textAlign='left';R(px-2,py-11,1,3,'#3a3a40');R(px+20,py-11,1,3,'#3a3a40');
  LUP(g,cx,sol,nuit);});}
/* LE HAIR STUDIO : le salon de coiffure du quai (le nom de la fonction reste, pour ne rien casser) */
const LU=(g,cx,sol,nuit,c)=>{if(!nuit)return;const l=g.createRadialGradient(cx,sol,4,cx,sol,75);l.addColorStop(0,c||'rgba(255,215,150,.5)');l.addColorStop(1,'rgba(255,215,150,0)');g.fillStyle=l;g.fillRect(cx-75,sol-75,150,80);};
/* un client assis sous la cape, vu de dos dans le miroir ; un coiffeur debout avec ses ciseaux */
function clientCape(R,x,y,cheveux,cape){R(x-5,y-2,10,9,cape||'#f4f4f4');R(x-5,y-2,10,1,'#ffffff');R(x-2.5,y-8,5,6,'#e0b088');R(x-3,y-9,6,3,cheveux);R(x-1,y+7,2,4,'#3a3a40');R(x-4,y+10,8,1.5,'#3a3a40');}
function coiffeur(R,x,y,tablier,cheveux){R(x-2.5,y-16,5,5,'#e0b088');R(x-3,y-17,6,2.5,cheveux);R(x-3,y-11,6,9,tablier);R(x-2.5,y-2,2,6,'#2a2a30');R(x+.5,y-2,2,6,'#2a2a30');R(x+3,y-10,4,1.5,'#e0b088');R(x+6.5,y-11,2,1,'#c8ccd4');R(x+6.5,y-9.5,2,1,'#c8ccd4');}
function poteau(R,px,py,h,e){e=e||1;R(px-2*e,py-4,4*e+2,4,'#d8b050');R(px-2*e,py+h,4*e+2,4,'#d8b050');R(px-1.5*e,py,3*e+2,h,'#ffffff');
  for(let k=0;k<h;k+=2){const off=((k*0.9)%(3*e+2));R(px-1.5*e+off,py+k,1.6,2,k%4<2?'#c8281e':'#2d5fb0');}R(px-1*e,py,1,h,'rgba(255,255,255,.4)');R(px-1.5*e-.5,py-7,3*e+3,3,'#e8e8e8');}
/* 3 · LE STUDIO : une façade entièrement vitrée, noire et minimaliste, les miroirs à ampoules, le mur de produits
   colorés, un néon blanc « HAIR STUDIO », et les coiffeurs au travail */
function graverLePeigne(){return devanture(4,(g,R,{sol,cx,BL,x0,rez,yR},nuit)=>{
  R(x0-2,yR-12,BL+4,rez+12,'#0e0e10');R(x0+4,yR-8,BL-8,rez+4,nuit?'#fff6e8':'#20242a');
  /* le mur de produits, au fond */
  for(let r=0;r<2;r++){R(x0+8,yR-4+r*7,BL-16,1,'#c8ccd4');for(let k=0;k<22;k++)R(x0+9+k*5.5,yR-9+r*7,3,5,['#e84a8a','#4ab0e8','#f0c040','#5d9a4e','#ffffff','#9a6ad8'][(k+r)%6]);}
  /* les miroirs à ampoules, les fauteuils, les clients et les coiffeurs */
  [[cx-42],[cx-6],[cx+30]].forEach(([x],k)=>{R(x-7,yR+8,14,14,'#9ab0b8');for(let q=0;q<5;q++){R(x-8.5,yR+8+q*3,2,2,nuit?'#fff8c0':'#f0e0a0');R(x+6.5,yR+8+q*3,2,2,nuit?'#fff8c0':'#f0e0a0');}
    clientCape(R,x,sol-13,['#e8c040','#2a2a30','#c84a2a'][k],'#1a1a1c');R(x-6,sol-7,12,2,'#e84a8a');coiffeur(R,x+11,sol-2,'#1a1a1c',['#2a2a30','#e8a040','#6a4a2a'][k]);});
  R(x0+4,sol-3,BL-8,3,'#0e0e10');for(let k=x0+4;k<x0+BL-4;k+=34)R(k,yR-8,1.5,rez+4,'#0e0e10');       /* les montants de la vitre */
  /* le néon blanc sur le bandeau noir */
  const ny=yR-14;R(x0+10,ny-8,BL-20,10,'#0e0e10');g.save();g.font='300 8.5px Arial,sans-serif';g.textAlign='center';if(nuit){g.shadowColor='#ffffff';g.shadowBlur=8;}
  g.fillStyle='#ffffff';g.fillText('H A I R   S T U D I O',cx,ny,BL-24);g.restore();g.textAlign='left';
  LU(g,cx,sol,nuit,'rgba(255,245,230,.5)');});}
/* LA MANIFESTATION DES DOCKERS : un cortège sur le quai, banderoles, drapeaux, fumigènes */
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
/* LA MANIF VIVANTE : les dockers piétinent au rythme, les banderoles tanguent, les drapeaux claquent,
   les fumigènes crachent leur fumée, le délégué scande au mégaphone, et le chien du syndic' remue la queue */
const SLOGANS=['On lâche rien !','Tous ensemble !','Le port, c’est nous !','Des sous pour les dockers !','Solidarité !','Et un, et deux, et trois zéro !'];
ANIM_DECOR.docker=(g,o,x,y)=>{const t=performance.now()/1000;o._f=o._f||{};
  const i=1+Math.floor((t*2.4+o.ph)*2)%PASM, cle=i+(STYLE_FIN()?'f':'c');
  if(!o._f[cle]){const src=poseDe(Object.assign({},DEF_AP,o.pnj),o.dir||'bas',i);const c=document.createElement('canvas');c.width=src.width;c.height=src.height;c.getContext('2d').drawImage(src,0,0);o._f[cle]=c;}
  const bob=Math.abs(Math.sin((t*2.4+o.ph)*Math.PI))*1.2;
  g.drawImage(o._f[cle],Math.round(x-CASE_L/2),Math.round(y-CASE_H+10-bob),CASE_L,CASE_H);
  if(o.porteVoix){const c2=poseDe(Object.assign({},DEF_AP,o.pnj),o.dir||'bas',1);
    /* le mégaphone, et les ondes quand il crie */
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
  /* le tissu claque : chaque colonne est décalée par une vague qui court vers le bout du drapeau */
  for(let cx=0;cx<W;cx+=2){const v=Math.sin(t*6-cx*0.35+o.ph)*(cx/W)*3;                 /* par bandes de deux points : léger, et ça ondule pareil */
    g.drawImage(T,cx*k,0,2*k,T.height,x+0.5+cx,y-h-bob+1+v,2,H);}
  g.fillStyle='rgba(0,0,0,.12)';for(let cx=6;cx<W;cx+=10){const v=Math.sin(t*6-cx*0.35+o.ph)*(cx/W)*3;g.fillRect(x+0.5+cx,y-h-bob+1+v,2,H);}};
ANIM_DECOR.fumigene=(g,o,x,y)=>{const t=performance.now()/1000;
  for(let k=0;k<22;k++){const age=(t*0.45+k/22+o.ph)%1, dx=Math.sin(k*1.7+t*0.8)*5*age+age*16*(o.vent||1), r=3+age*13;
    g.fillStyle='rgba('+Math.round(235-age*40)+','+Math.round(70+age*80)+','+Math.round(70+age*80)+','+((1-age)*0.45).toFixed(2)+')';g.beginPath();g.arc(x+dx,y-6-age*62,r,0,7);g.fill();}
  const f=0.7+Math.random()*0.3;g.fillStyle='#3a3a40';g.fillRect(x-1,y-4,2,5);g.fillStyle='rgba(255,90,40,'+f+')';g.beginPath();g.arc(x,y-5,2.8*f,0,7);g.fill();g.fillStyle='#fff0a0';g.fillRect(x-0.8,y-6,1.6,1.6);};
/* LES DANSEURS : ils sautillent, se déhanchent, se tournent d'un côté puis de l'autre */
ANIM_DECOR.danseur=(g,o,x,y)=>{const t=performance.now()/1000+o.ph;o._f=o._f||{};
  const temps=Math.floor(t*2.6), dir=['bas-gauche','bas','bas-droite','bas'][temps%4], i=1+Math.floor(t*6)%PASM, cle=dir+i+(STYLE_FIN()?'f':'c');
  if(!o._f[cle]){const src=poseDe(Object.assign({},DEF_AP,o.pnj),dir,i);const c=document.createElement('canvas');c.width=src.width;c.height=src.height;c.getContext('2d').drawImage(src,0,0);o._f[cle]=c;}
  const saut=Math.abs(Math.sin(t*Math.PI*2.6))*4, hanche=Math.sin(t*Math.PI*1.3)*0.16;
  g.fillStyle='rgba(40,30,18,.22)';g.beginPath();g.ellipse(x,y+1,7-saut*0.4,1.8,0,0,7);g.fill();
  g.save();g.translate(x,y-saut);g.rotate(hanche);g.drawImage(o._f[cle],Math.round(-CASE_L/2),Math.round(-CASE_H+10),CASE_L,CASE_H);g.restore();
  if(Math.floor(t*1.3)%3===0){g.fillStyle='#ffffff';g.font='700 8px Georgia';g.fillText('♪',x+8,y-52-saut);g.fillText('♫',x-14,y-46-saut*0.5);}};
/* LE GAG : derrière la manif, un cycliste regarde le cortège… et se prend le lampadaire en pleine tête */
ANIM_DECOR.gag=(g,o,x,y)=>{const D=9.5, t=((performance.now()/1000)+o.ph)%D, ap=Object.assign({},DEF_AP,{peau:2,cheveux:4,coiffe:2,veste:'#3a8a5a',haut:1,pantalon:'#2a2a30',corps:2});
  const lamp=x, depart=lamp-150, vit=62, choc=(lamp-8-depart)/vit;              /* il arrive de l'ouest, la tête tournée vers les manifestants */
  const pose=(dir,i)=>{o._p=o._p||{};const cle=dir+i+(STYLE_FIN()?'f':'c');if(!o._p[cle]){const src=poseDe(ap,dir,i);const c=document.createElement('canvas');c.width=src.width;c.height=src.height;c.getContext('2d').drawImage(src,0,0);o._p[cle]=c;}return o._p[cle];};
  if(t<choc){const px=depart+t*vit, pas=t*3;dessinerUnVelo(g,px,y+7,'droite',pas,2,true);
    g.drawImage(pose(t>choc-1.2?'haut-droite':'droite',1+Math.floor(t*8)%PASM),Math.round(px-CASE_L/2),Math.round(y-CASE_H+4),CASE_L,CASE_H);
    if(t>choc-1.2){g.font='italic 700 7px Georgia';g.fillStyle='#ffffff';g.fillText('Allez les dockers !',px-30,y-58);}return;}
  const u=t-choc, px=lamp-8;
  if(u<0.35){const recul=u*18;g.save();g.translate(px-recul,y);g.rotate(-u*1.4);dessinerUnVelo(g,0,7,'droite',0,2,false);g.drawImage(pose('droite',0),Math.round(-CASE_L/2),Math.round(-CASE_H+4),CASE_L,CASE_H);g.restore();
    g.font='900 12px Georgia';g.fillStyle='#ffe040';g.strokeStyle='#3a2616';g.lineWidth=2;g.strokeText('BONG !',lamp-18,y-58);g.fillText('BONG !',lamp-18,y-58);return;}
  /* par terre : le vélo couché, le cycliste allongé, les étoiles qui tournent */
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
/* LE DOCKER EN COLÈRE : un seul docker manifeste, tout seul, avec sa pancarte, sur le quai.
   Il piétine, lève sa pancarte, et lâche un slogan de temps en temps. On peut le rejoindre (il te
   tend un gilet). Un seul personnage animé : léger. */
ANIM_DECOR.solitaire=(g,o,x,y)=>{const t=performance.now()/1000;o._f=o._f||{};
  const i=1+Math.floor(t*4.2)%PASM, cle=i+(STYLE_FIN()?'f':'c');
  if(!o._f[cle]){const src=poseDe(Object.assign({},DEF_AP,o.pnj),'bas',i);const c=document.createElement('canvas');c.width=src.width;c.height=src.height;c.getContext('2d').drawImage(src,0,0);o._f[cle]=c;}
  const bob=Math.abs(Math.sin(t*Math.PI*2.1))*1.2, leve=Math.max(0,Math.sin(t*1.6))*5;
  /* la pancarte, derrière lui, levée en rythme */
  const px=x+11, py=y-62-leve-bob;g.fillStyle='#6b4a28';g.fillRect(px-0.75,py+10,1.5,48);            /* tenue bien haut, au-dessus de sa tête */
  g.fillStyle='#f4efe6';g.fillRect(px-17,py-6,34,17);g.strokeStyle='#8a6238';g.lineWidth=0.8;g.strokeRect(px-17,py-6,34,17);
  g.textAlign='center';g.fillStyle='#c8281e';g.font='900 5.6px Georgia';g.fillText('DOCKERS',px,py+1.5);g.fillStyle='#1d3f6a';g.font='700 4.6px Georgia';g.fillText('EN COLÈRE !',px,py+8);g.textAlign='left';
  g.drawImage(o._f[cle],Math.round(x-CASE_L/2),Math.round(y-CASE_H+10-bob),CASE_L,CASE_H);
  const c=(t%7)/7;if(c<0.4){const s=SLOGANS[Math.floor(t/7)%SLOGANS.length];g.font='italic 700 7px Georgia';const w=g.measureText(s).width+8;
    g.fillStyle='rgba(255,255,255,.95)';g.fillRect(x-w/2,y-80,w,11);g.fillStyle='#c8281e';g.fillText(s,x-w/2+4,y-72);}
};
function poserLaManif(P){
  P('x_docker',1046,286,{v:0,col:[5,3],dir:'bas',anim:'solitaire',bati:true,demi:8,ouvre:'manif',
    pnj:{peau:2,cheveux:1,coiffe:1,barbe:4,veste:'#f2d21a',haut:0,pantalon:'#2a3a5a',chaussures:'#2a2a30',souliers:0,sac:0,chapeau:1,corps:3,gilet:true}});
  CALQUES_DECO['x_docker']={W:60,H:100,sol:90};
}
function semerDecorExtramar(){
  DECOR=[];
  const P=(t,x,y,o)=>DECOR.push(Object.assign({t,x,y,gr:0},o||{}));
  /* LES IMMEUBLES DU QUAI, MITOYENS : une façade continue d'un bout à
     l'autre, comme sur le vrai quai ; au milieu, la Bonne Mère */
  for(let k=0;k<10;k++){
    if(k===4){P('x_panneauG',XP.ruelle.x-38,XP.maisonsY+22,{col:[4,3]});continue;}   /* la ruelle du casino, et son panneau */
    if(k===1){XCAL['x_fonfon0']=restoFonfon('bordeaux');CALQUES_DECO['x_fonfon']=XCAL['x_fonfon0'];P('x_fonfon',70+k*140,XP.maisonsY,{col:[70,24],bati:true,demi:56,ouvre:'bouillabaisse'});continue;}   /* Chez Fonfon, le restaurant de bouillabaisse (à la place du Fumoir) */
    /* (la poste est retirée : un immeuble du quai reprend sa place) */
    if(k===9){XCAL['x_presse0']=graverLaPresse();CALQUES_DECO['x_presse']=XCAL['x_presse0'];P('x_presse',70+k*140,XP.maisonsY,{col:[70,24],bati:true,demi:56,ouvre:'presse'});continue;}   /* la maison de la presse */
    if(k===2){XCAL['x_facPeche0']=graverLaBoutiquePeche();CALQUES_DECO['x_facPeche']=XCAL['x_facPeche0'];P('x_facPeche',70+k*140,XP.maisonsY,{col:[70,24],bati:true,demi:56,ouvre:'peche'});continue;}   /* Pêche & Marine */
    if(k===6){XCAL['x_facPoisson0']=graverLaPoissonnerie();CALQUES_DECO['x_facPoisson']=XCAL['x_facPoisson0'];P('x_facPoisson',70+k*140,XP.maisonsY,{col:[70,24],bati:true,demi:56,ouvre:'poissonnerie'});continue;}   /* la poissonnerie */
    if(k===3){XCAL['x_bar0']=graverLeBar();CALQUES_DECO['x_bar']=XCAL['x_bar0'];P('x_bar',70+k*140,XP.maisonsY,{col:[70,24],bati:true,demi:56,ouvre:'bar'});
      continue;}   /* le bar-tabac PMU (sans terrasse) */
    if(k===5){XCAL['x_peigne0']=graverLePeigne();CALQUES_DECO['x_peigne']=XCAL['x_peigne0'];P('x_peigne',70+k*140,XP.maisonsY,{col:[70,24],bati:true,demi:56,ouvre:'salon'});continue;}   /* le salon de coiffure */
    if(k===7){XCAL['x_crousti0']=graverCroustiPort();CALQUES_DECO['x_crousti']=XCAL['x_crousti0'];P('x_crousti',70+k*140,XP.maisonsY,{col:[70,24],bati:true,demi:56,ouvre:'crousti'});continue;}   /* le fast-food du quai */
    P('x_maison',70+k*140,XP.maisonsY,{v:k,col:[70,24]});
  }
  /* DE GRANDS PLATANES, en alignement le long des façades, chacun avec son banc à l'ombre */
  [44,1190].forEach((x,k)=>{P('x_belArbre',x,XP.maisonsY+60,{v:k,col:[8,4]});P('bancP',x+30,XP.maisonsY+72);});   /* les quatre platanes du quai, chacun avec son banc */
  /* LA FORÊT DE MÂTS : des voiliers serrés de part et d'autre des pontons,
     l'étrave tournée vers les planches */
  let nv=0;
  XP.pontons.forEach(px=>{
    for(let y=XP.quaiY+24;y<=XP.pontonFin-6;y+=16){
      /* quelques anneaux vides : des bateaux sont sortis en mer */
      if(alea(px*0.37+y*1.13)>0.27)P('x_voilier',px-XP.pontonL-27,y,{v:(nv)*7%11});
      nv++;
      if(alea(px*0.71+y*0.53+9)>0.27)P('x_voilier',px+XP.pontonL+27,y+8,{v:(nv)*7%11,flip:true});
      nv++;
    }
  });
  /* la bouche du métro, sur le quai ouest */
  P('metro',XP.metro[0],XP.metro[1],{col:[38,14]});
  /* AU MILIEU DU QUAI, FACE AUX PONTONS : la poissonnerie et la boutique de pêche.
     Entre les deux, le passage vers le ponton du milieu reste libre. */
  /* (la poissonnerie et la boutique de pêche ont quitté le milieu du quai : elles sont en façade) */
  /* LES LANTERNES, en rang régulier au bord de l'eau */
  [280,420,840,980,1120].forEach((x,i)=>P('lanterneP',x,324,{gr:i}));
  /* deux lanternes encadrent l'entrée du ponton du milieu, sans cacher les boutiques */
  [[602,334],[638,334]].forEach(([x,y],i)=>P('lanterneP',x,y,{gr:5+i}));
  /* LES BANCS, entre deux lanternes, tournés vers la mer ; deux autres contre les façades */
  [[210,316],[490,316],[770,316],[1050,316],[1190,316],[1270,560],[1340,560]]
    .forEach(([x,y])=>P('bancP',x,y));
  /* LE GLAÇON D'ART, la charrette des glaçons artisanaux, sur le quai ouest */
  /* LA MANIFESTATION DES DOCKERS, sur le quai est */
  poserLaManif(P);
  /* les bittes d'amarrage, sur la margelle */
  for(let x=200;x<1200;x+=74){
    if(XP.pontons.some(p=>Math.abs(p-x)<26))continue;
    P('x_bitte',x,XP.quaiY-3,{col:[4,3]});
  }
  /* LE BOULODROME : les platanes, les bancs des anciens, les boulistes */
  [[22,410,0],[90,376,1],[18,512,2],[160,592,3]].forEach(([x,y,v])=>P('x_platane',x,y,{v,col:[7,4]}));
  [[56,382],[124,382]].forEach(([x,y])=>P('bancP',x,y));
  /* le coin du kiosque et de la fontaine, entre la terrasse et les boules */
  [[58,552,'haut',{veste:1,chapeau:1}],[76,560,'haut',{veste:2,cheveux:1}],
   [122,468,'bas',{veste:0,barbe:1,cheveux:0}],[134,424,'bas',{veste:2,chapeau:2}]]
    .forEach(([x,y,dir,ap],i)=>P('x_bouliste',x,y,{v:i,dir,ap,col:[5,3]}));
  /* les barques, à couple des pontons */
  /* plus de barques au large : seuls les pontons ont leurs bateaux */
  /* le cargo contre la jetée, sa grue, et le phare au bout */
  /* L'EST : le caboteur à quai, la grue qui le décharge, la pile de caisses,
     les Docks où on les porte ; la Grande Roue sur le quai ; le phare au bout */
  /* L'EST : LE CABANON DE LA BOUILLABAISSE, au bord de l'eau, sur la jetée ;
     il laisse toute la jetée libre autour de lui */
  /* (le cabanon de la bouillabaisse est retiré : la bouillabaisse se cuisine Chez Fonfon, sur le quai) */
  [[1236,476],[1392,476]].forEach(([x,y],i)=>P('lanterneP',x,y,{gr:8+i}));
  /* LES VÉLOS EN LIBRE-SERVICE : une station près du métro, une près du cabanon */
  STATIONS_VELO.forEach(([x,y])=>P('x_stationVelo',x,y,{col:[40,5]}));
  /* on grave tout d'avance : les marges de dessin en ont besoin */
  DECOR.forEach(o=>{if(o.t.slice(0,2)==='x_')graverX(o.t,o.v);});
  DECOR.sort((a,b)=>a.y-b.y);invaliderGrille();
}

/* LE PANNEAU DE CHANTIER, à l'est de la place : la campagne arrive bientôt */


;({XP,CARGO_X,PAV,CABANON,STATIONS_VELO,surPonton,dansLeBassin,bloqueExtramar,GX,bloqueGarde,construireSolGarde,graverLaBasilique,graverLaLongueVue,semerDecorGarde,panoramaGarde,construireSolExtramar,TU_M,ENDUITS,PI_X,toitCanal,enduit,chaine,fenetreM,balconM,VOLETS,graverImmeuble,graverLaGarde,graverLesToitsDuFond,graverBelArbre,graverLaCriee,graverLeCabanon,graverLaStationVelo,POISSONS_MARMITE,RECETTE,ouvrirLeCabanon,dessinerLeCabanon,cuisinerLaBouillabaisse,graverPavillon,graverArbuste,CANNES,ACCESSOIRES,APPATS,chargerLEquipement,illustrerArticle,ouvrirLaBoutiqueDePeche,fermerLeCatalogue,afficherPecheMarine,acheterALaBoutique,FERRY,positionDuFerry,BANCS,eauVivante,semerDecorExtramar});
