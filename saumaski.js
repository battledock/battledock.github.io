/* =====================================================================
   SAUMASKI — la station de ski (chargé par jeu.html seulement à Saumaski), au bout de la ligne 1. Une carte à part,
   plate, comme le port. Tout y est fermé pour l'instant : on s'y promène.
   ===================================================================== */
(()=>{
const WW=360, WH=470, SOLSTYLE='lames';            /* d'après le croquis : en long, assez large, et de la neige sous la place */
let BARRIERE='lisses';            /* d'après le croquis : en long, et assez large */            /* en long : la largeur d'un écran de téléphone */            /* une carte en long, à la verticale */
const hs=(i)=>{const s=Math.sin(i*127.1+311.7)*43758.5453;return s-Math.floor(s);};
const mk=(w,h)=>{const c=document.createElement('canvas');c.width=w*2;c.height=h*2;const g=c.getContext('2d');g.setTransform(2,0,0,2,0,0);g.imageSmoothingEnabled=false;
  const F=(x,y,ww,hh,col)=>{if(ww<=0||hh<=0)return;g.fillStyle=col;g.fillRect(Math.round(x*2)/2,Math.round(y*2)/2,Math.max(0.5,Math.round(ww*2)/2),Math.max(0.5,Math.round(hh*2)/2));};return {c,g,F};};
const ombre=(g,x,y,rx,ry)=>{g.fillStyle='rgba(80,100,135,.32)';g.beginPath();g.ellipse(x+2,y+1,rx,ry||rx*0.2,0,0,7);g.fill();};
/* ---------- LES PALETTES ---------- */
const BOIS={s:'#3d2a17',o:'#5b3f21',p:'#7d5934',c:'#96703f',h:'#b08858'};
const PIERRE={o:'#5f666c',s:'#6f767c',p:'#7e868d',c:'#8f979e',h:'#a4acb3',t:'#bcc4ca'};
const NEIGE={o:'#c8d6e2',s:'#dae4ec',p:'#eaf1f6',c:'#f4f8fa',h:'#ffffff'};
/* ---------- LES OUTILS DE DESSIN ---------- */
function toitNeige(F,g,cx,bas,larg,haut,tuile){             /* un toit à deux pans vu de face, chargé de neige, avec ses glaçons */
  const rangs=Math.round(haut/1.6);
  for(let k=0;k<rangs;k++){const t=k/rangs, w=larg-t*larg*0.72, y=bas-k*1.6;
    const neige=t>0.25||hs(k*3.1+larg)<0.15;
    F(cx-w/2,y-1.6,w,1.6,neige?(k%2?NEIGE.c:NEIGE.p):(k%2?tuile[0]:tuile[1]));
    if(!neige)for(let x=cx-w/2;x<cx+w/2;x+=4)F(x,y-1.6,0.5,1.6,tuile[2]);}
  F(cx-larg*0.14,bas-rangs*1.6-1.5,larg*0.28,2,NEIGE.h);                                        /* le faîtage, bourrelet de neige */
  for(let x=cx-larg/2;x<cx+larg/2;x+=0.5){const dy=Math.sin(x*1.3)*0.5;F(x,bas+dy,0.5,1.8,NEIGE.h);}   /* la corniche de neige qui déborde */
  for(let x=cx-larg/2+1;x<cx+larg/2-1;x+=2.5){const l=1+hs(x*3+larg)*4;F(x,bas+1.5,0.5,l,'rgba(220,244,255,.9)');F(x,bas+1.5+l-0.5,0.5,0.5,'#ffffff');}   /* les glaçons */
  g.fillStyle='rgba(60,80,110,.25)';g.fillRect(cx-larg/2,bas+1.8,larg,1.2);
}
function madriers(F,x,y,w,h,base){                           /* un mur de rondins, bout à bout, avec leurs têtes aux angles */
  for(let r=0;r<h;r+=2.5){F(x,y+r,w,2.5,r%5?base:BOIS.p);F(x,y+r,w,0.5,BOIS.h);F(x,y+r+2,w,0.5,BOIS.s);
    for(let k=0;k<w;k+=7)if(hs(k+r*3+x)<0.35)F(x+k,y+r+1,2,0.5,BOIS.o);}
  for(let r=0;r<h;r+=2.5){[x-1.5,x+w-0.5].forEach(xx=>{F(xx,y+r,2,2.5,BOIS.c);F(xx+0.5,y+r+0.5,1,1.5,BOIS.o);});}   /* les têtes de rondins */
}
function soubassement(F,x,y,w,h){for(let r=0;r<h;r+=3.5){const dec=(r/3.5)%2?3:0;for(let k=-dec;k<w;k+=6){const kk=Math.max(0,k), ww=Math.min(5.5,w-kk,k+6-kk);if(ww<=0)continue;
  const t=hs(x+k*1.7+r*3);F(x+kk,y+r,ww,3,t<0.3?PIERRE.s:(t<0.7?PIERRE.p:PIERRE.c));F(x+kk,y+r,ww,0.5,PIERRE.t);F(x+kk,y+r+3,ww,0.5,PIERRE.o);}}}
function fenetre(F,x,y,w,h,nuit,volets){
  if(volets){F(x-3,y-0.5,2.5,h+1,'#2d6fb0');F(x+w+0.5,y-0.5,2.5,h+1,'#2d6fb0');for(let k=0;k<h;k+=1.5){F(x-3,y+k,2.5,0.5,'#1f4f80');F(x+w+0.5,y+k,2.5,0.5,'#1f4f80');}
    F(x-2,y+h/2-1,0.5,2,'#f0cf7d');}                                                             /* les volets, et leur cœur découpé */
  F(x-0.5,y-0.5,w+1,h+1,BOIS.s);F(x,y,w,h,nuit?'#f0c060':'#3a5a7a');F(x,y,w/2-0.25,h,nuit?'#f8d888':'#5a8aaa');F(x+w/2-0.25,y,0.5,h,BOIS.o);F(x,y+h/2-0.25,w,0.5,BOIS.o);
  if(!nuit)F(x+0.5,y+0.5,w*0.25,0.5,'rgba(255,255,255,.6)');
  F(x-1,y+h+0.5,w+2,1.5,BOIS.c);F(x-1,y+h,w+2,1,NEIGE.h);                                         /* l'appui, et sa neige */
  F(x-0.5,y+h+2,w+1,2.5,'#8a5a3a');for(let k=0;k<w;k+=1.5)F(x+k,y+h+1.5,1,1,['#d8342a','#f0c040','#e86a8a'][Math.floor(hs(k+x)*3)]);   /* la jardinière d'hiver */
}
function enseigne(g,F,cx,y,w,txt,taille,fond){F(cx-w/2,y,w,taille+4,fond||BOIS.s);F(cx-w/2,y,w,0.5,BOIS.c);F(cx-w/2,y+taille+3.5,w,0.5,'#1a120a');
  g.font='700 '+taille+'px Georgia,serif';g.textAlign='center';g.fillStyle='#1a120a';g.fillText(txt,cx+0.4,y+taille+1.4,w-4);g.fillStyle='#f0cf7d';g.fillText(txt,cx,y+taille+1,w-4);g.textAlign='left';}
/* ================== LE SOL ================== */
function graverSol(){
  const {c,g,F}=mk(WW,WH);
  for(let y=0;y<WH;y++)for(let x=0;x<WW;x++){const n=hs(Math.floor(x/6)*1.3+Math.floor(y/5)*2.1)*0.6+hs(Math.floor(x/13)*3.7+Math.floor(y/11)*1.9)*0.4;F(x,y,1,1,n<0.3?NEIGE.p:(n<0.8?NEIGE.c:NEIGE.h));}
  for(let y=0;y<WH;y+=2){g.fillStyle='rgba(120,150,190,'+(0.035+0.03*Math.sin(y/50+1)).toFixed(3)+')';g.fillRect(0,y,WW,2);}
  /* LA PLACE : un grand rectangle aux coins arrondis, pavé, déneigé par allées */
  const PX0=150,PX1=490,PY0=140,PY1=340,RC=26;   /* la place */
  const dansPlace=(x,y)=>{if(x<PX0||x>PX1||y<PY0||y>PY1)return false;const cx=Math.max(PX0+RC,Math.min(PX1-RC,x)),cy=Math.max(PY0+RC,Math.min(PY1-RC,y));return Math.hypot(x-cx,y-cy)<=RC;};
  /* LE BAS DE LA CARTE : un grand plancher, d'un bord à l'autre, autour de la gare ; il rejoint la place par un large raccord arrondi */
  const HAUT_BAS=318;
  const dansBas=(x,y)=>{if(y<HAUT_BAS-10||x<0||x>WW)return false;const bord=HAUT_BAS+Math.sin(x/37)*3;if(y>=bord)return true;
    return x>PX0-18&&x<PX1+18&&y>=bord-10;};
  const dans=(x,y)=>dansPlace(x,y)||dansBas(x,y);
  /* LE PLANCHER DE LA PLACE, en mélèze : les lames ou les chevrons, chacune avec sa teinte, son veinage,
     ses joints sombres et ses clous ; la neige balayée dans les allées, restée en poudre sur les bords */
  const LAME=['#b88a5a','#a87a4c','#c49868','#9a6e42','#b08050'];
  if(SOLSTYLE==='lames'){
    for(let y=PY0;y<WH;y+=4)for(let x=-20;x<WW;){const long=16+Math.floor(hs(x*0.7+y)*3)*6, dec=((y-PY0)/4)%3*7;const px=x+dec;
      const t=hs(px*0.37+y*1.3), col=LAME[Math.floor(t*5)];
      for(let xx=px;xx<px+long;xx+=1){if(!dans(xx,y+2))continue;F(xx,y,1,3.5,col);
        if(hs(xx*1.7+y)<0.25)F(xx,y+1+hs(xx)*2,1,0.5,'rgba(90,55,25,.35)');}
      for(let xx=px;xx<px+long;xx+=1)if(dans(xx,y+2)){F(xx,y,1,0.5,'rgba(255,230,190,.35)');F(xx,y+3.5,1,0.5,'#5a3a1e');}
      if(dans(px,y+2))F(px,y,0.5,4,'#5a3a1e');[px+1.5,px+long-2].forEach(cx=>{if(dans(cx,y+2)){F(cx,y+1,0.5,0.5,'#3a2a1e');F(cx,y+2.5,0.5,0.5,'#3a2a1e');}});
      x+=long;}
  }else{
    /* les chevrons (point de Hongrie) : des lames courtes, en V, qui dessinent des flèches */
    for(let y=PY0;y<PY1;y+=0.5)for(let x=PX0;x<PX1;x+=0.5)if(dans(x,y))F(x,y,0.5,0.5,'#5a3a1e');       /* le fond, sous les lames */
    for(let y=PY0-16;y<PY1+16;y+=5)for(let k=0;k<(PX1-PX0)/16+2;k++){const bx=PX0-16+k*16;
      [[0,1],[8,-1]].forEach(([dx,sens],q)=>{const t=hs(bx*0.37+y*1.3+q), col=LAME[Math.floor(t*5)];
        for(let u=0;u<12;u+=0.5){const x=bx+dx+u*0.7, yy=y+u*0.42*sens+(sens<0?5:0);if(!dans(x,yy))continue;F(x,yy,0.5,2.5,col);
          if(u<0.5||u>=11.5)F(x,yy,0.5,2.5,'#5a3a1e');if(hs(x*3+yy)<0.2)F(x,yy+1,0.5,0.5,'rgba(90,55,25,.35)');}
        for(let u=0;u<12;u+=0.5){const x=bx+dx+u*0.7, yy=y+u*0.42*sens+(sens<0?5:0);if(dans(x,yy)){F(x,yy,0.5,0.5,'rgba(255,230,190,.3)');F(x,yy+2.5,0.5,0.5,'#5a3a1e');}}});}
  }
  /* la neige : balayée dans les allées, en poudre ailleurs, en congère le long des bords */
  const allee=(x,y)=>Math.abs(x-320)<18||Math.abs(y-250)<14||Math.abs(Math.hypot(x-320,y-250)-46)<12;
  /* (plus de taches de neige sur le plancher : il est balayé, net) */
  /* la bordure : des rondins couchés, coiffés de neige */
  for(let x=0;x<WW;x+=0.5)for(let y=PY0-4;y<WH;y+=0.5){if(dans(x,y))continue;const bord=dans(x+3,y)||dans(x-3,y)||dans(x,y+3)||dans(x,y-3);if(!bord)continue;
    if(Math.abs(x-320)<18||Math.abs(y-250)<14)continue;const t=hs(x*3+y*7);F(x,y,0.5,0.5,t<0.3?'#6b4a28':(t<0.7?'#7d5934':'#8a6238'));}
  for(let x=0;x<WW;x+=0.5)for(let y=PY0-5;y<WH;y+=0.5){if(dans(x,y))continue;const b=dans(x,y+4)&&!dans(x,y+1);if(b&&!(Math.abs(x-320)<18))F(x,y,0.5,0.5,NEIGE.h);}
  /* LA PATINOIRE, dans le quart sud-est : la glace bleutée, les traces de patins, sa bande de bois */
  const RX=412,RY=298,RW=46,RH=22;
  for(let y=RY-RH;y<RY+RH;y+=0.5)for(let x=RX-RW;x<RX+RW;x+=0.5){const q=((x-RX)/RW)**2+((y-RY)/RH)**2;if(q>1)continue;
    const n=hs(Math.floor(x*2)*0.7+Math.floor(y*2)*1.3);F(x,y,0.5,0.5,q>0.9?'#a8cce0':(n<0.4?'#cfe6f2':(n<0.8?'#dcedf6':'#e8f4fa')));}
  g.strokeStyle='rgba(255,255,255,.7)';g.lineWidth=0.4;for(let k=0;k<7;k++){g.beginPath();g.ellipse(RX+Math.sin(k)*6,RY+Math.cos(k*2)*3,RW*(0.35+k*0.08),RH*(0.3+k*0.08),k*0.3,0,Math.PI*1.4);g.stroke();}
  g.fillStyle='rgba(255,255,255,.35)';g.beginPath();g.ellipse(RX-14,RY-8,14,3,-0.2,0,7);g.fill();
  /* les chemins qui partent de la place : vers les pistes (nord), vers la luge (ouest), vers la forêt (est) */
  const chemin=(pts,l)=>{for(let k=0;k<pts.length-1;k++){const [ax,ay]=pts[k],[bx,by]=pts[k+1],n=Math.hypot(bx-ax,by-ay);
    for(let s2=0;s2<=n;s2+=1){const x=ax+(bx-ax)*s2/n,y=ay+(by-ay)*s2/n;for(let d=-l/2;d<l/2;d+=1){const t=hs(Math.round(x+d)*1.7+Math.round(y)*0.9);
      const px=Math.abs(bx-ax)>Math.abs(by-ay)?x:x+d, py=Math.abs(bx-ax)>Math.abs(by-ay)?y+d:y;if(dans(px,py))continue;F(px,py,1,1,t<0.5?'#dde6ee':'#d2dde8');}}}};
  chemin([[320,140],[320,70],[330,0]],22);chemin([[150,250],[80,250],[20,280]],16);chemin([[490,250],[560,236],[640,240]],16);chemin([[320,340],[320,420]],20);
  /* LE RUISSEAU GELÉ, à l'ouest, et ses berges */
  for(let y=0;y<HAUT_BAS-4;y++){const x=58+Math.sin(y/37)*10+Math.sin(y/13)*3;             /* il passe sous le plancher du bas */F(x-7,y,14,1,'#b8d8ec');F(x-5,y,10,1,'#cfe6f4');if(hs(y)<0.3)F(x-3+hs(y*3)*6,y,2,0.5,'#ffffff');F(x-8,y,1.5,1,NEIGE.h);F(x+6.5,y,1.5,1,NEIGE.h);}
  /* la piste de luge, à l'ouest : une pente damée et ses traces */
  g.strokeStyle='rgba(150,170,195,.5)';g.lineWidth=0.6;for(let k=0;k<4;k++){g.beginPath();g.moveTo(8+k*6,130);g.quadraticCurveTo(30+k*6,200,20+k*6,270);g.stroke();}
  /* des traces de pas partout dans la neige */
  for(let k=0;k<400;k++){const x=hs(k*3.3)*WW, y=hs(k*7.1)*WH;if(dans(x,y))continue;F(x,y,1.5,1,'#d6e0ea');F(x+0.5,y+1,0.5,0.5,'#c4d0dc');}
  return c;
}
/* ================== LES BÂTIMENTS ================== */
/* LA STATION DE MÉTRO : un pavillon de pierre et de bois, une verrière en marquise sur l'escalier, l'horloge, le grand M */
/* LE SAPIN ENNEIGÉ, REFAIT : un épicéa aux étages de branches tombantes, chaque étage
   chargé d'un coussin de neige, un cœur sombre, une silhouette irrégulière, le puits de
   neige à son pied ; variante « nu » (mélèze d'hiver) pour varier la forêt */
function sapin(h,variante){
  const W=Math.round(h*0.95)+4,H=h+8,{c,g,F}=mk(W,H);const cx=W/2,sol=H-4;
  const rnd=(k)=>hs(h*13.7+k*3.1+(variante||0)*7.7);
  /* l'ombre bleue, et le creux de neige autour du pied */
  g.fillStyle='rgba(80,105,145,.30)';g.beginPath();g.ellipse(cx+3,sol+0.5,W*0.36,2.8,0,0,7);g.fill();
  g.fillStyle='rgba(120,150,190,.35)';g.beginPath();g.ellipse(cx,sol-0.5,3.5,1.2,0,0,7);g.fill();
  F(cx-1,sol-h*0.16,2,h*0.16,'#4a321c');F(cx-1,sol-h*0.16,0.5,h*0.16,'#6b4a28');
  if(variante===9){                                                 /* le mélèze d'hiver : des branches nues, une neige légère */
    F(cx-0.75,sol-h,1.5,h*0.9,'#5a3e24');
    for(let k=0;k<11;k++){const y=sol-h*0.2-k*h*0.07, l=h*(0.32-k*0.025);[[-1],[1]].forEach(([s])=>{
      g.strokeStyle='#6b4a2e';g.lineWidth=0.6;g.beginPath();g.moveTo(cx,y);g.quadraticCurveTo(cx+s*l*0.5,y-1,cx+s*l,y+1.5);g.stroke();
      F(cx+s*l*0.6-0.5,y-0.8,1.5,0.5,NEIGE.h);});}
    return {c,W,H,sol};}
  const etages=6;
  for(let e=0;e<etages;e++){
    const t=e/etages, yb=sol-h*0.12-t*h*0.78, w=h*(0.46-t*0.37)*(0.9+rnd(e)*0.2), hh=h*0.2;
    /* l'étage : une jupe de branches qui retombent, dentelée */
    g.fillStyle=e%2?'#1f4a36':'#244f3a';g.beginPath();g.moveTo(cx,yb-hh);
    for(let k=0;k<=8;k++){const u=k/8, x=cx-w+u*w*2, y=yb+Math.sin(u*Math.PI)*1.2+(k%2?1.2:0);g.lineTo(x,y);}g.closePath();g.fill();
    g.fillStyle='#16382a';g.beginPath();g.moveTo(cx,yb-hh*0.7);g.lineTo(cx-w*0.25,yb);g.lineTo(cx+w*0.25,yb);g.closePath();g.fill();   /* le cœur sombre */
    /* la lumière à droite, les aiguilles */
    g.fillStyle='rgba(90,140,100,.45)';g.beginPath();g.moveTo(cx+1,yb-hh+1);g.lineTo(cx+w*0.8,yb-0.5);g.lineTo(cx+w*0.2,yb-0.5);g.closePath();g.fill();
    for(let k=0;k<Math.round(w);k++){const x=cx-w+rnd(e*31+k)*w*2, y=yb-rnd(e*17+k)*hh*0.8;F(x,y,0.5,0.5,rnd(k+e*5)<0.5?'#2f6a4a':'#12301f');}
    /* le coussin de neige posé sur l'étage : épais au centre, qui s'amincit, qui coule un peu */
    g.fillStyle=NEIGE.h;g.beginPath();g.moveTo(cx-w*0.82,yb-hh*0.18);
    g.quadraticCurveTo(cx-w*0.35,yb-hh*0.55,cx,yb-hh*0.98);g.quadraticCurveTo(cx+w*0.4,yb-hh*0.5,cx+w*0.78,yb-hh*0.12);
    g.quadraticCurveTo(cx+w*0.4,yb-hh*0.3,cx,yb-hh*0.62);g.quadraticCurveTo(cx-w*0.4,yb-hh*0.36,cx-w*0.82,yb-hh*0.18);g.fill();
    g.fillStyle='rgba(170,195,225,.6)';g.beginPath();g.moveTo(cx-w*0.8,yb-hh*0.16);g.quadraticCurveTo(cx-w*0.4,yb-hh*0.34,cx,yb-hh*0.6);g.lineTo(cx,yb-hh*0.52);
    g.quadraticCurveTo(cx-w*0.4,yb-hh*0.26,cx-w*0.8,yb-hh*0.16);g.fill();                                              /* l'ombre bleue sous la neige */
    for(let k=0;k<3;k++){const x=cx-w*0.6+rnd(e*9+k)*w*1.2;F(x,yb-hh*0.2,0.5,1+rnd(k)*1.5,NEIGE.h);}                  /* des paquets qui pendent */
  }
  /* la pointe, sa neige */
  F(cx-0.5,sol-h*0.98,1,3,'#1f4a36');F(cx-0.75,sol-h,1.5,1.5,NEIGE.h);
  return {c,W,H,sol};
}
/* LA GARE DE SAUMASKI : une vraie gare de montagne. Rez-de-chaussée de pierre en arcades,
   étage de bois à balcon, grand toit débordant, clocheton à horloge, verrière d'entrée,
   escalier qui descend aux quais, le grand M lumineux. */
function graverMetro(nuit){
  const W=150,H=150,{c,g,F}=mk(W,H);const cx=W/2,sol=H-6;ombre(g,cx,sol,68,7);
  const pierre=(x,y,w,h)=>{for(let r=0;r<h;r+=4){const dec=(r/4)%2?4:0;for(let k=-dec;k<w;k+=8){const kk=Math.max(0,k),ww=Math.min(7.5,w-kk,k+8-kk);if(ww<=0)continue;
    const t=hs(x+k*2.3+r*1.7);F(x+kk,y+r,ww,3.5,t<0.35?'#cfc6b0':(t<0.75?'#ddd4be':'#c2b8a0'));F(x+kk,y+r,ww,0.5,'#efe8d6');F(x+kk+ww-0.5,y+r,0.5,3.5,'#a0967e');F(x+kk,y+r+3.5,ww,0.5,'#8a806a');}}};
  /* LES DEUX AILES : pierre en bas, bois en haut, petits toits */
  [[-1],[1]].forEach(([s])=>{const x0=cx+s*44-(s<0?24:0);
    pierre(x0,sol-26,24,26);madriers(F,x0,sol-44,24,18,'#8a5a3a');
    toitNeige(F,g,x0+12,sol-44,32,14,['#5a4a3e','#6a5a4c','#3e3228']);
    fenetre(F,x0+8,sol-40,8,8,nuit,true);
    /* l'arcade : une porte en plein cintre, vitrée */
    g.fillStyle=nuit?'#f0c060':'#3a5a7a';g.beginPath();g.moveTo(x0+6,sol);g.lineTo(x0+6,sol-14);g.quadraticCurveTo(x0+12,sol-21,x0+18,sol-14);g.lineTo(x0+18,sol);g.closePath();g.fill();
    g.strokeStyle='#8a806a';g.lineWidth=1.2;g.beginPath();g.moveTo(x0+5.5,sol);g.lineTo(x0+5.5,sol-14);g.quadraticCurveTo(x0+12,sol-22,x0+18.5,sol-14);g.lineTo(x0+18.5,sol);g.stroke();
    F(x0+11.75,sol-20,0.5,20,'#5a4a3a');F(x0+6,sol-10,12,0.5,'#5a4a3a');if(!nuit)F(x0+7,sol-15,3,0.5,'rgba(255,255,255,.5)');});
  /* LE CORPS CENTRAL : plus haut, arcades de pierre, étage à balcon */
  pierre(cx-30,sol-34,60,34);
  madriers(F,cx-30,sol-62,60,28,'#9a6a44');
  /* le balcon de bois découpé, qui court sur toute la façade */
  F(cx-33,sol-37,66,2,BOIS.o);for(let k=-33;k<33;k+=3){F(cx+k,sol-43,2.5,6,BOIS.c);F(cx+k+1,sol-41,0.5,2,BOIS.s);}F(cx-33,sol-44,66,1.5,BOIS.p);F(cx-33,sol-44.5,66,1,NEIGE.h);
  [[-22],[-8],[6],[20]].forEach(([k])=>fenetre(F,cx+k-3,sol-57,7,9,nuit,true));
  /* le grand toit, et son pignon à la date */
  toitNeige(F,g,cx,sol-62,82,34,['#5a4a3e','#6a5a4c','#3e3228']);
  g.fillStyle=BOIS.c;g.beginPath();g.moveTo(cx-18,sol-64);g.lineTo(cx,sol-82);g.lineTo(cx+18,sol-64);g.closePath();g.fill();
  for(let k=-16;k<17;k+=2.5)F(cx+k,sol-64-Math.max(0,16-Math.abs(k))*1.05,0.5,Math.max(0,16-Math.abs(k))*1.05,BOIS.o);
  g.font='700 3.4px Georgia';g.textAlign='center';g.fillStyle='#f0e0b0';g.fillText('1926',cx,sol-67);g.textAlign='left';
  /* LE CLOCHETON : une petite tour de bois, son horloge, son bulbe de zinc, sa girouette */
  F(cx-7,sol-104,14,20,BOIS.p);F(cx-7,sol-104,14,0.5,BOIS.h);for(let k=0;k<14;k+=2.5)F(cx-7+k,sol-104,0.5,20,BOIS.o);
  g.fillStyle='#f4efe0';g.beginPath();g.arc(cx,sol-94,5,0,7);g.fill();g.strokeStyle=BOIS.s;g.lineWidth=0.8;g.beginPath();g.arc(cx,sol-94,5,0,7);g.stroke();
  for(let k=0;k<12;k++){const a=k/12*6.283;F(cx+Math.cos(a)*4-0.25,sol-94+Math.sin(a)*4-0.25,0.5,0.5,'#3a2a1a');}
  g.strokeStyle='#1a120a';g.lineWidth=0.6;g.beginPath();g.moveTo(cx,sol-94);g.lineTo(cx,sol-97.3);g.moveTo(cx,sol-94);g.lineTo(cx+2.5,sol-93);g.stroke();
  g.fillStyle='#6f7a84';g.beginPath();g.moveTo(cx-9,sol-104);g.quadraticCurveTo(cx-8,sol-113,cx,sol-118);g.quadraticCurveTo(cx+8,sol-113,cx+9,sol-104);g.closePath();g.fill();
  g.fillStyle='rgba(255,255,255,.35)';g.beginPath();g.moveTo(cx+1,sol-116);g.quadraticCurveTo(cx+6,sol-112,cx+7,sol-105);g.lineTo(cx+4,sol-105);g.quadraticCurveTo(cx+4,sol-111,cx+1,sol-116);g.fill();
  g.fillStyle=NEIGE.h;g.beginPath();g.moveTo(cx-8,sol-108);g.quadraticCurveTo(cx-4,sol-114,cx,sol-117);g.quadraticCurveTo(cx+3,sol-113,cx+6,sol-108);g.quadraticCurveTo(cx,sol-111,cx-8,sol-108);g.fill();
  F(cx-0.25,sol-126,0.5,8,'#3a3a40');F(cx-3,sol-124,6,1,'#3a3a40');F(cx+1,sol-125.5,3,1.5,'#c9a24a');                   /* la girouette */
  /* LA VERRIÈRE D'ENTRÉE : une grande baie en plein cintre, l'escalier qui descend aux quais */
  g.fillStyle='#1a1c24';g.beginPath();g.moveTo(cx-17,sol);g.lineTo(cx-17,sol-22);g.quadraticCurveTo(cx,sol-38,cx+17,sol-22);g.lineTo(cx+17,sol);g.closePath();g.fill();
  const lum=g.createLinearGradient(0,sol,0,sol-30);lum.addColorStop(0,nuit?'rgba(255,210,140,.6)':'rgba(255,230,180,.3)');lum.addColorStop(1,'rgba(255,230,180,0)');g.fillStyle=lum;g.fillRect(cx-17,sol-34,34,34);
  for(let k=0;k<7;k++){const y=sol-3-k*2.8, w=28-k*2.6;F(cx-w/2,y,w,2.3,k%2?'#5c5a55':'#6d6b65');F(cx-w/2,y,w,0.5,'#9a968c');}
  F(cx-0.25,sol-35,0.5,35,'#2a2e36');for(let k=-12;k<13;k+=6)F(cx+k,sol-30+Math.abs(k)*0.4,0.5,10,'#2a2e36');F(cx-17,sol-20,34,0.5,'#2a2e36');
  g.strokeStyle='#8a806a';g.lineWidth=1.6;g.beginPath();g.moveTo(cx-17.5,sol);g.lineTo(cx-17.5,sol-22);g.quadraticCurveTo(cx,sol-39,cx+17.5,sol-22);g.lineTo(cx+17.5,sol);g.stroke();
  /* la marquise de fer forgé, en éventail, enneigée */
  g.fillStyle='rgba(180,210,230,.55)';g.beginPath();g.moveTo(cx-26,sol-24);g.lineTo(cx+26,sol-24);g.lineTo(cx+21,sol-30);g.lineTo(cx-21,sol-30);g.closePath();g.fill();
  for(let k=-24;k<25;k+=4)F(cx+k,sol-30,0.5,6,'#2a2e36');F(cx-26,sol-24.5,52,1,'#2a2e36');F(cx-21,sol-30.5,42,0.8,'#2a2e36');F(cx-21,sol-31.5,42,1.2,NEIGE.h);
  for(let k=-25;k<26;k+=3)F(cx+k,sol-23.5,0.5,1+hs(k)*2,'rgba(220,244,255,.9)');
  [[-26],[25]].forEach(([k])=>{F(cx+k,sol-24,1,24,'#2a2e36');F(cx+k+0.25,sol-24,0.5,24,'#5a5e66');});
  /* la plaque émaillée, sous le balcon */
  F(cx-20,sol-36,40,6,'#1d3f8f');F(cx-20,sol-36,40,0.5,'#4d6fc8');F(cx-19,sol-35.5,38,0.5,'#e9e6db');F(cx-19,sol-30.5,38,0.5,'#e9e6db');
  g.font='700 4.4px Georgia,serif';g.textAlign='center';g.fillStyle='#ffffff';g.fillText('LA MONTAGNE',cx,sol-31.6,36);g.textAlign='left';
  /* le grand M lumineux, sur son mât, et les lanternes */
  const tx=cx-62;F(tx-1,sol-58,2.5,58,'#4d5760');F(tx-1,sol-58,1,58,'#7a848c');
  F(tx-7,sol-72,15,15,'#1d4f9a');F(tx-7,sol-72,15,1,'#4d7fc8');F(tx-7,sol-58,15,1,'#12356a');F(tx-7,sol-73.5,15,1.5,NEIGE.h);
  F(tx-4.5,sol-69,2,10,'#ffffff');F(tx+3,sol-69,2,10,'#ffffff');for(let k=0;k<5;k++){F(tx-2.5+k*0.5,sol-68+k,1.5,1.5,'#ffffff');F(tx+1.5-k*0.5,sol-68+k,1.5,1.5,'#ffffff');}
  [[-30],[30]].forEach(([k])=>{F(cx+k,sol-36,0.5,3,'#2a2e36');F(cx+k-2,sol-33.5,4.5,5,'#2a2e36');F(cx+k-1.5,sol-33,3.5,4,nuit?'#ffd27a':'#e8dcb0');});
  /* les marches du parvis, et la neige tassée devant */
  F(cx-34,sol-1,68,2,PIERRE.c);F(cx-34,sol-1,68,0.5,PIERRE.t);
  return {c,W,H,sol};
}

/* L'HÔTEL DES CIMES : trois niveaux, balcons de bois découpé, volets bleus */
function graverHotel(nuit){
  const W=96,H=118,{c,g,F}=mk(W,H);const cx=W/2,sol=H-5;ombre(g,cx,sol,44,6);
  soubassement(F,cx-40,sol-12,80,12);madriers(F,cx-40,sol-62,80,50,'#8a5a3a');
  toitNeige(F,g,cx,sol-62,94,30,['#5a4a3e','#6a5a4c','#3e3228']);
  [[-30],[-12],[6],[24]].forEach(([k])=>{fenetre(F,cx+k,sol-56,7,8,nuit,true);fenetre(F,cx+k,sol-35,7,8,nuit,true);});
  /* le balcon de l'étage : planches découpées en cœur, neige sur la main courante */
  F(cx-40,sol-26,80,1.5,BOIS.o);for(let k=-40;k<40;k+=3){F(cx+k,sol-26,2.5,6,BOIS.c);F(cx+k+1,sol-24,0.5,1.5,BOIS.s);}F(cx-40,sol-27,80,1,BOIS.p);F(cx-40,sol-27.5,80,0.8,NEIGE.h);
  /* la porte, l'auvent, le paillasson */
  F(cx-7,sol-15,14,15,BOIS.s);F(cx-6,sol-14,5.5,14,BOIS.c);F(cx+0.5,sol-14,5.5,14,BOIS.c);F(cx-2,sol-7,1,1,'#f0cf7d');F(cx+1,sol-7,1,1,'#f0cf7d');
  F(cx-10,sol-18,20,2,BOIS.o);F(cx-10,sol-18.5,20,1,NEIGE.h);F(cx-8,sol+0.5,16,2,'#8a3a2a');
  enseigne(g,F,cx,sol-78,52,'HÔTEL DES CIMES',5);
  return {c,W,H,sol};
}
/* LA LOCATION DE SKIS : vitrine, skis alignés dehors, enseigne suspendue */
function graverLocation(nuit){
  const W=84,H=84,{c,g,F}=mk(W,H);const cx=W/2,sol=H-5;ombre(g,cx,sol,38,5);
  soubassement(F,cx-34,sol-8,68,8);madriers(F,cx-34,sol-36,68,28,'#9a6a44');
  toitNeige(F,g,cx,sol-36,80,22,['#8a3a2a','#9a4a34','#5a2418']);
  /* la vitrine : skis et casques en devanture */
  F(cx-26,sol-28,30,18,BOIS.s);F(cx-25,sol-27,28,16,nuit?'#f8d888':'#3a5a7a');
  for(let k=0;k<7;k++){F(cx-23+k*3.8,sol-26,1.5,14,['#c0392b','#2d6fb0','#f0c040','#3f9e7a','#e86a8a','#1a1a2a','#c0392b'][k]);F(cx-23+k*3.8,sol-26,1.5,0.5,'#ffffff');}
  if(!nuit)F(cx-24,sol-26,6,0.5,'rgba(255,255,255,.6)');
  F(cx+8,sol-24,10,24,BOIS.s);F(cx+9,sol-23,8,23,BOIS.c);F(cx+15,sol-12,1,1,'#f0cf7d');F(cx+9,sol-22,8,6,nuit?'#f0c060':'#5a8aaa');
  /* le râtelier de skis dehors, sous la neige */
  F(cx-34,sol-3,20,1.5,BOIS.o);for(let k=0;k<6;k++){F(cx-33+k*3.4,sol-22,1.5,20,['#2d6fb0','#c0392b','#f0c040','#1a1a2a','#3f9e7a','#e86a8a'][k]);F(cx-33+k*3.4,sol-22.5,1.5,1,NEIGE.h);}
  F(cx-34,sol-15,20,1.5,BOIS.o);
  enseigne(g,F,cx,sol-50,44,'LOCATION · SKIS',4.5);
  return {c,W,H,sol};
}
/* LE REFUGE : le café, sa terrasse, ses transats et parasols, le poêle qui fume */
function graverCafe(nuit){
  const W=90,H=80,{c,g,F}=mk(W,H);const cx=W/2-6,sol=H-14;ombre(g,cx,sol,36,5);
  soubassement(F,cx-30,sol-8,60,8);madriers(F,cx-30,sol-32,60,24,'#7a4a2a');
  toitNeige(F,g,cx,sol-32,72,20,['#5a4a3e','#6a5a4c','#3e3228']);
  fenetre(F,cx-24,sol-27,10,9,nuit,false);fenetre(F,cx+13,sol-27,10,9,nuit,false);
  F(cx-5,sol-20,10,20,BOIS.s);F(cx-4,sol-19,8,19,BOIS.c);F(cx-4,sol-18,8,8,nuit?'#f0c060':'#5a8aaa');F(cx+2,sol-9,1,1,'#f0cf7d');
  F(cx+18,sol-48,6,14,'#6a6258');F(cx+18,sol-48,6,1,NEIGE.h);                                     /* la cheminée */
  enseigne(g,F,cx,sol-44,40,'LE REFUGE',5);
  /* la terrasse de planches, devant : tables, transats, parasols repliés */
  F(cx-34,sol+1,78,11,BOIS.p);for(let k=-34;k<44;k+=4){F(cx+k,sol+1,3.5,11,k%8?BOIS.p:BOIS.c);F(cx+k+3.5,sol+1,0.5,11,BOIS.s);}F(cx-34,sol+1,78,0.5,BOIS.h);
  [[-20],[6],[30]].forEach(([k],i)=>{F(cx+k-4,sol+3,8,3,BOIS.c);F(cx+k-4,sol+3,8,0.5,BOIS.h);F(cx+k-0.5,sol+6,1,4,BOIS.o);
    F(cx+k-0.25,sol-14,0.5,17,'#3a3a40');g.fillStyle=i%2?'#c0392b':'#2d6fb0';g.beginPath();g.moveTo(cx+k-3,sol-4);g.lineTo(cx+k,sol-15);g.lineTo(cx+k+3,sol-4);g.closePath();g.fill();
    F(cx+k-2,sol+3.5,1.5,1.5,'#f4efe0');F(cx+k+1,sol+3.5,1.5,1.5,'#8a4a2a');});                    /* chocolat chaud, vin chaud */
  return {c,W,H,sol};
}
/* LA CAISSE DES FORFAITS : un kiosque de bois, son guichet, les cordons de la file */
function graverForfaits(nuit){
  const W=44,H=54,{c,g,F}=mk(W,H);const cx=W/2,sol=H-5;ombre(g,cx,sol,18,4);
  madriers(F,cx-14,sol-26,28,26,'#9a6a44');toitNeige(F,g,cx,sol-26,36,16,['#8a3a2a','#9a4a34','#5a2418']);
  F(cx-9,sol-21,18,9,BOIS.s);F(cx-8,sol-20,16,7,nuit?'#f0c060':'#5a8aaa');F(cx-10,sol-12,20,1.5,BOIS.c);F(cx-10,sol-12.5,20,0.8,NEIGE.h);
  F(cx-5,sol-19,3,3,'#e8bd92');F(cx-5,sol-20,3,1,'#6a3a1a');                                      /* la caissière, derrière la vitre */
  enseigne(g,F,cx,sol-36,30,'FORFAITS',4.5,'#1d3f6a');
  [[-18],[18]].forEach(([k])=>{F(cx+k,sol-8,1,8,'#b88a3a');F(cx+k-0.5,sol-8.5,2,1,'#f0cf7d');});g.strokeStyle='#8a2418';g.lineWidth=0.8;g.beginPath();g.moveTo(cx-18,sol-7);g.quadraticCurveTo(cx-9,sol-4,cx,sol-7);g.stroke();
  return {c,W,H,sol};
}
/* LE PLAN DES PISTES, sur son panneau de bois */
function graverPlan(){
  const W=40,H=40,{c,g,F}=mk(W,H);const cx=W/2,sol=H-3;ombre(g,cx,sol,14,2.5);
  F(cx-12,sol-16,1.5,16,BOIS.o);F(cx+10.5,sol-16,1.5,16,BOIS.o);F(cx-15,sol-34,30,20,BOIS.s);F(cx-14,sol-33,28,18,'#f4efe0');
  g.fillStyle='#dfe8ee';g.beginPath();g.moveTo(cx-13,sol-16);g.lineTo(cx-2,sol-32);g.lineTo(cx+4,sol-26);g.lineTo(cx+9,sol-31);g.lineTo(cx+13,sol-16);g.closePath();g.fill();
  [['#3f9e7a',-8],['#2d6fb0',-2],['#c0392b',4],['#1a1a2a',9]].forEach(([col,x])=>{g.strokeStyle=col;g.lineWidth=0.7;g.beginPath();g.moveTo(cx+x*0.4,sol-29);g.quadraticCurveTo(cx+x,sol-22,cx+x*1.1,sol-17);g.stroke();});
  F(cx-15,sol-35,30,1.5,NEIGE.h);g.font='700 3px Georgia';g.fillStyle='#3a2616';g.textAlign='center';g.fillText('LES PISTES',cx,sol-14.2,26);g.textAlign='left';
  return {c,W,H,sol};
}
function graverLampadaire(){const W=12,H=44,{c,g,F}=mk(W,H);const cx=W/2,sol=H-3;ombre(g,cx,sol,4,1.5);
  F(cx-2,sol-3,4,3,'#2a2e36');F(cx-0.75,sol-30,1.5,28,'#2a2e36');F(cx-0.25,sol-30,0.5,28,'#5a5e66');F(cx-3,sol-38,6,8,'#2a2e36');F(cx-2.5,sol-37.5,5,6.5,'#e8dcb0');
  F(cx-3.5,sol-40,7,2,'#2a2e36');F(cx-3.5,sol-41,7,1.2,NEIGE.h);return {c,W,H,sol,lampe:[cx,sol-34]};}
function graverBanc(){const W=30,H=16,{c,g,F}=mk(W,H);const cx=W/2,sol=H-3;ombre(g,cx,sol,12,2);
  for(let r=0;r<3;r++){F(cx-12,sol-8+r*2,24,1.8,r?BOIS.p:BOIS.c);}F(cx-12,sol-8.5,24,1,NEIGE.h);F(cx-10,sol-3,1.5,3,'#2a2e36');F(cx+8.5,sol-3,1.5,3,'#2a2e36');return {c,W,H,sol};}
function graverLuge(){const W=18,H=10,{c,g,F}=mk(W,H);const cx=W/2,sol=H-2;ombre(g,cx,sol,7,1.5);
  F(cx-7,sol-4,14,2.5,'#c0392b');F(cx-7,sol-4,14,0.5,'#e86a5a');g.strokeStyle='#3a3a40';g.lineWidth=0.7;g.beginPath();g.moveTo(cx-7,sol-1);g.lineTo(cx+6,sol-1);g.quadraticCurveTo(cx+9,sol-1,cx+8,sol-4);g.stroke();return {c,W,H,sol};}
function graverBonhomme(){const W=18,H=26,{c,g,F}=mk(W,H);const cx=W/2,sol=H-3;ombre(g,cx,sol,6,1.8);
  [[0,-4,5.5],[0,-12,4],[0,-18,3]].forEach(([a,b,r])=>{g.fillStyle='#f4f8fa';g.beginPath();g.arc(cx+a,sol+b,r,0,7);g.fill();g.fillStyle='rgba(120,150,190,.3)';g.beginPath();g.arc(cx+a+1,sol+b+1,r*0.8,0,Math.PI);g.fill();});
  F(cx-1.2,sol-19,0.8,0.8,'#1a1a1a');F(cx+0.8,sol-19,0.8,0.8,'#1a1a1a');F(cx,sol-18,3,0.8,'#e8782a');F(cx-4,sol-15,8,1.5,'#c0392b');F(cx+2,sol-15,1.5,4,'#c0392b');
  F(cx-2.5,sol-24,5,3,'#2a2a30');F(cx-3.5,sol-21.5,7,1,'#2a2a30');return {c,W,H,sol};}
/* LE GRAND SAPIN DE LA PLACE, son banc circulaire */
function graverGrandSapin(){const s=sapin(66,7);return s;}
/* LA GARE DE DÉPART DU TÉLÉSIÈGE */
const CABLE_H=44, ECART=9, LIFT_X=320, GARE_Y=66;
function graverGare(){
  const W=86,H=CABLE_H+36,{c,g,F}=mk(W,H);const cx=W/2,sol=H-4;ombre(g,cx,sol,38,5);
  F(cx-34,sol-6,68,6,BOIS.p);for(let k=-34;k<34;k+=5){F(cx+k,sol-6,4.5,6,k%10?BOIS.p:BOIS.c);F(cx+k+4.5,sol-6,0.5,6,BOIS.s);}F(cx-34,sol-6,68,0.5,BOIS.h);
  [[-26],[22]].forEach(([k])=>{F(cx+k,sol-CABLE_H-6,4,CABLE_H,'#5a6a7a');F(cx+k,sol-CABLE_H-6,1,CABLE_H,'#8aa0b4');});
  F(cx-30,sol-CABLE_H-8,60,3,'#4a5664');toitNeige(F,g,cx,sol-CABLE_H-9,72,16,['#8a3a2a','#9a4a34','#5a2418']);
  F(cx-40,sol-26,14,20,'#c8b890');F(cx-38,sol-22,10,7,'#5a8ab0');toitNeige(F,g,cx-33,sol-27,18,6,['#6a6e74','#7a7e84','#4a4e54']);
  F(cx-16,sol-CABLE_H-4,32,6,'#1d3f6a');F(cx-16,sol-CABLE_H-4,32,0.5,'#4d7fc8');g.font='700 4px Georgia';g.textAlign='center';g.fillStyle='#fff';g.fillText('TÉLÉSIÈGE',cx,sol-CABLE_H+0.8,30);g.textAlign='left';
  return {c,W,H,sol};
}
function graverPylone(){const W=40,H=CABLE_H+16,{c,g,F}=mk(W,H);const cx=W/2,sol=H-3;ombre(g,cx,sol,8,2.5);
  F(cx-5,sol-3,10,3,'#8a8e94');F(cx-1.5,sol-CABLE_H-2,3,CABLE_H,'#5a6a7a');F(cx-1.5,sol-CABLE_H-2,1,CABLE_H,'#8aa0b4');
  F(cx-ECART-4,sol-CABLE_H-3,2*ECART+8,2,'#4a5664');F(cx-ECART-4,sol-CABLE_H-4,2*ECART+8,1,NEIGE.h);return {c,W,H,sol};}
function siege(g,x,yC){const F=(a,b,w,h,col)=>{g.fillStyle=col;g.fillRect(a,b,w,h);};
  F(x-0.5,yC,1,20,'#3a4654');F(x-2,yC-1,4,2,'#2e3640');F(x-12,yC+19,24,1.2,'#3a4654');
  F(x-11,yC+22,22,5,'#1d3f6a');F(x-11,yC+22,22,1,'#3d6fa8');F(x-12,yC+27,24,2.5,'#2a4f86');F(x-12,yC+27,24,0.5,'#5a8fd0');F(x-12,yC+26.5,24,0.6,NEIGE.h);
  g.fillStyle='rgba(90,110,140,.22)';g.beginPath();g.ellipse(x+2,yC+CABLE_H+1,9,1.8,0,0,7);g.fill();}
function volant(g,x,y,ang){g.save();g.translate(x,y);g.scale(1,0.42);g.fillStyle='#3a4654';g.beginPath();g.arc(0,0,ECART+2,0,7);g.fill();
  g.strokeStyle='#5a6a7a';g.lineWidth=0.8;for(let k=0;k<6;k++){const a=ang+k*Math.PI/3;g.beginPath();g.moveTo(0,0);g.lineTo(Math.cos(a)*ECART,Math.sin(a)*ECART);g.stroke();}
  g.fillStyle='#c4ccd2';g.beginPath();g.arc(0,0,2,0,7);g.fill();g.restore();}
function graverChaletNom(nom,teinte){const W=70,H=70,{c,g,F}=mk(W,H);const cx=W/2,sol=H-5;ombre(g,cx,sol,30,5);
  soubassement(F,cx-26,sol-7,52,7);madriers(F,cx-26,sol-30,52,23,teinte);toitNeige(F,g,cx,sol-30,64,18,['#5a4a3e','#6a5a4c','#3e3228']);
  fenetre(F,cx-20,sol-24,9,8,false,true);F(cx+2,sol-20,10,20,BOIS.s);F(cx+3,sol-19,8,19,BOIS.c);F(cx+3,sol-18,8,6,'#5a8aaa');F(cx+9.5,sol-9,1,1,'#f0cf7d');
  for(let k=0;k<4;k++){F(cx-22+k*4,sol-6,3,5,['#c0392b','#2d6fb0','#f0c040','#3f9e7a'][k]);F(cx-22+k*4,sol-6.5,3,1,NEIGE.h);}   /* les bonnets et les cartes postales en devanture */
  enseigne(g,F,cx,sol-44,40,nom,4.5);return {c,W,H,sol};}
function graverBande(rw,rh){const W=rw*2+8,H=rh*2+14,{c,g,F}=mk(W,H);const cx=W/2,cy=H/2+2;
  /* seulement l'arc de devant : la bande qui passe devant la glace (celle de derrière est dans le sol) */
  for(let a=0;a<Math.PI;a+=0.01){const x=cx+Math.cos(a)*(rw+1), y=cy+Math.sin(a)*(rh+1);F(x-0.5,y-3,1.2,3,a%0.2<0.1?BOIS.c:BOIS.p);F(x-0.5,y-3.5,1.2,0.8,NEIGE.h);}
  for(let a=Math.PI;a<Math.PI*2;a+=0.01){const x=cx+Math.cos(a)*(rw+1), y=cy+Math.sin(a)*(rh+1);F(x-0.5,y-2,1.2,2,BOIS.o);F(x-0.5,y-2.5,1.2,0.8,NEIGE.h);}
  return {c,W,H,sol:cy+rh+2};}
function graverBrasero(){const W=20,H=20,{c,g,F}=mk(W,H);const cx=W/2,sol=H-3;ombre(g,cx,sol,7,2);
  F(cx-6,sol-6,12,4,'#3a3a40');F(cx-6,sol-6,12,0.8,'#6a6f74');F(cx-4,sol-2,1,2,'#2a2a30');F(cx+3,sol-2,1,2,'#2a2a30');
  for(let k=0;k<5;k++)F(cx-5+k*2.2,sol-7,2,1.5,'#5b3f21');return {c,W,H,sol};}
function graverSkis(){const W=26,H=24,{c,g,F}=mk(W,H);const cx=W/2,sol=H-2;ombre(g,cx,sol,11,2);
  F(cx-11,sol-12,22,2,BOIS.o);F(cx-11,sol-2,22,2,BOIS.o);F(cx-11,sol-12,1.5,12,BOIS.o);F(cx+9.5,sol-12,1.5,12,BOIS.o);
  const cols=['#c0392b','#2d6fb0','#f0c040','#3f9e7a','#e86a8a'];for(let k=0;k<5;k++){F(cx-9+k*4,sol-21,1.5,20,cols[k]);F(cx-9+k*4,sol-21.5,1.5,1,NEIGE.h);}
  F(cx-11,sol-12.5,22,0.8,NEIGE.h);return {c,W,H,sol};}
function graverPont(){const W=40,H=18,{c,g,F}=mk(W,H);const cx=W/2,sol=H-3;ombre(g,cx,sol,17,2.5);
  F(cx-16,sol-9,32,9,BOIS.p);for(let k=-16;k<16;k+=3){F(cx+k,sol-9,2.5,9,k%6?BOIS.p:BOIS.c);F(cx+k+2.5,sol-9,0.5,9,BOIS.s);}F(cx-16,sol-9.5,32,1,NEIGE.h);
  [[-16],[15]].forEach(([k])=>{F(cx+k,sol-14,1.5,14,BOIS.o);F(cx+k,sol-14.5,1.5,1,NEIGE.h);});F(cx-16,sol-12,32,1,BOIS.o);F(cx-16,sol-12.5,32,0.8,NEIGE.h);return {c,W,H,sol};}
function graverPoteau(txt){const W=34,H=26,{c,g,F}=mk(W,H);const cx=W/2,sol=H-3;ombre(g,cx,sol,5,1.5);
  F(cx-0.75,sol-18,1.5,18,BOIS.o);F(cx-14,sol-20,28,6,BOIS.c);F(cx-14,sol-20,28,0.5,BOIS.h);F(cx-14,sol-21,28,1,NEIGE.h);
  g.font='700 4px Georgia';g.fillStyle='#2a1a0e';g.textAlign='center';g.fillText(txt,cx,sol-15.6,26);g.textAlign='left';return {c,W,H,sol};}

/* 9 · LE TILLEUL ENNEIGÉ : le même arbre que sur la place du village, feuille à feuille, sous la neige */
function tilleul(h,v){const Wd=Math.round(h*1.05)+6,Hd=h+6,{c,g,F}=mk(Wd,Hd);const cx=Wd/2,sol=Hd-3;ombre(g,cx,sol,Wd*0.36);
  for(let r=0;r<h*0.42;r++){const y=sol-r,w=r<3?5:3.5;F(cx-w/2,y,w,1,'#6b4a28');F(cx-w/2,y,1,1,'#4a321a');F(cx+w/2-1,y,1,1,'#8a6238');}
  const R=h*0.34, cy=sol-h*0.62;
  [[0,0,1,'#2f6b34'],[-0.45,0.2,0.7,'#3d7d3f'],[0.45,0.15,0.68,'#356f38'],[-0.1,-0.4,0.62,'#4f9147']].forEach(([dx,dy,k,col])=>{g.fillStyle=col;g.beginPath();g.ellipse(cx+dx*R,cy+dy*R,R*k,R*k*0.82,0,0,7);g.fill();});
  for(let k=0;k<R*9;k++){const a=hs(k*7.3+v*11)*6.283, rr=Math.sqrt(hs(k*3.1+v))*R;const lx=cx+Math.cos(a)*rr, ly=cy+Math.sin(a)*rr*0.82, haut=Math.sin(a)<-0.2;
    F(lx,ly,1.5,1,haut?(Math.cos(a)>0.3?'#8ec46a':'#6fae57'):(Math.sin(a)>0.4?'#24582a':'#3d7d3f'));}
  /* la neige posée sur le dessus du feuillage, en plaques, et qui déborde un peu */
  for(let k=0;k<R*7;k++){const a=Math.PI+hs(k*5.3+v)*Math.PI, rr=(0.55+hs(k*2.1)*0.45)*R;const lx=cx+Math.cos(a)*rr, ly=cy+Math.sin(a)*rr*0.82-1;
    F(lx,ly,2,1.2,hs(k)<0.3?NEIGE.c:NEIGE.h);}
  g.fillStyle='rgba(170,195,225,.4)';g.beginPath();g.ellipse(cx,cy-R*0.3,R*0.7,R*0.12,0,0,Math.PI);g.fill();
  return {c,W:Wd,H:Hd,sol};}
/* les objets de la carte : chaque calque est gravé une fois, puis posé */
function objets(){
  const L=[];const cal={};
  const reg=(nom,C,N)=>{cal[nom]={toile:C.c,W:C.W,H:C.H,sol:C.sol,nuit:N?N.c:null};return nom;};
  const P=(nom,x,y,x2)=>L.push(Object.assign({t:'x_mo_'+nom,x,y,v:0},x2||{}));
  reg('hotel',graverHotel(false),graverHotel(true));reg('location',graverLocation(false),graverLocation(true));
  reg('cafe',graverCafe(false),graverCafe(true));reg('forfaits',graverForfaits(false),graverForfaits(true));
  reg('gare',graverMetro(false),graverMetro(true));
  P('hotel',196,150,{col:[40,14],bati:true,ferme:'L’Hôtel des Cimes',demi:34});
  P('cafe',540,318,{col:[30,12],bati:true,ferme:'Le Refuge',demi:26});
  /* des tilleuls enneigés, comme sur la place du village (plus de sapins, sauf le grand sapin décoré) */
  const T=[tilleul(34,1),tilleul(40,2),tilleul(30,3),tilleul(44,4)];T.forEach((c,i)=>reg('tilleul'+i,c));
  reg('grandsapin',sapin(66,7));reg('plan',graverPlan());reg('lampe',graverLampadaire());reg('banc',graverBanc());reg('luge',graverLuge());reg('bonhomme',graverBonhomme());
  reg('souvenirs',graverChaletNom('BUVETTE','#8a3a2a'));reg('pont',graverPont());reg('bande',graverBande(46,22));reg('brasero',graverBrasero());reg('skis',graverSkis());
  reg('pisteN',graverPoteau('PISTES ↑'));reg('pisteO',graverPoteau('← LUGE'));reg('pisteE',graverPoteau('FORÊT →'));reg('telesiege',graverGare());
  P('grandsapin',320,252,{col:[8,5],grand:true});
  [[300,266],[340,266],[300,236],[340,236],[210,292],[246,292],[228,318]].forEach(([x,y])=>P('banc',x,y,{col:[12,3]}));
  [[176,180],[464,180],[176,318],[464,318],[290,150],[350,150],[290,338],[350,338]].forEach(([x,y])=>P('lampe',x,y,{col:[2,2],lampe:true}));
  P('bande',412,298+22+2,{});P('brasero',228,300,{col:[6,3],feu:true});P('skis',486,176,{col:[11,3]});P('skis',150,190,{col:[11,3]});
  P('plan',386,128,{col:[13,3]});P('bonhomme',472,338,{col:[5,3]});P('luge',486,330,{});P('luge',30,280,{});P('luge',40,262,{});P('bonhomme',210,300,{col:[5,3]});
  P('souvenirs',112,332,{col:[28,12],bati:true,ouvre:'buvette',demi:26});
  P('pont',58+Math.sin(250/37)*10+Math.sin(250/13)*3,258,{});

  /* PLUS DE REMONTÉES : la montagne devient un site minier. L'entrée de la galerie prend la place du télésiège. */
  /* (ancienne carte : plus utilisée) */
  for(let k=0;k<150;k++){const x=hs(k*2.3)*WW, y=8+hs(k*5.1)*(WH-10);            /* quelques arbres, pas une forêt */
    if(x>130&&x<510&&y>100&&y<380)continue;if(y>306)continue;               /* le bas est planché */if(Math.abs(x-320)<24&&y<150)continue;if(Math.abs(y-250)<20&&(x<150||x>490))continue;if(Math.abs(x-320)<22&&y>330)continue;
    if(Math.abs(x-(58+Math.sin(y/37)*10))<12)continue;if(x<50&&y>120&&y<290)continue;if(Math.hypot(x-112,y-320)<50)continue;if(Math.hypot(x-560,y-310)<78)continue;if(Math.hypot(x-320,y-398)<78)continue;if(Math.hypot(x-196,y-150)<70)continue;
    P('tilleul'+Math.floor(hs(k*7)*4),x,y,{col:[4,3]});}
  return {L,cal};
}
/* LA PLACE VIDE : un grand rectangle de planches, bordé de rondins. Rien d'autre pour l'instant. */
/* LA PLACE : en haut, un champ de neige ; au milieu, un large escalier de bois ; en bas, le plancher */
let TEXTURE_NEIGE='poudreuse';
function graverBouche(nuit){
  const W=90,H=96,{c,g,F}=mk(W,H);const cx=W/2-6,sol=H-6;ombre(g,cx,sol,36,5);
  /* la trémie et l'escalier qui s'enfonce */
  F(cx-18,sol-24,36,24,'#3a3530');
  for(let k=0;k<7;k++){const y=sol-22+k*3.1, w=30-k*0.8;F(cx-w/2,y,w,3,k%2?'#6d6b65':'#7e7b74');F(cx-w/2,y,w,0.5,'#a8a498');F(cx-w/2,y+2.6,w,0.5,'#4a4640');}
  const fo=g.createLinearGradient(0,sol-24,0,sol);fo.addColorStop(0,nuit?'rgba(255,210,140,.1)':'rgba(10,12,20,.55)');fo.addColorStop(1,nuit?'rgba(255,210,140,.45)':'rgba(10,12,20,0)');g.fillStyle=fo;g.fillRect(cx-16,sol-24,32,24);
  /* les deux murets de pierre, coiffés de neige */
  [[-20],[16]].forEach(([k])=>{for(let r=0;r<5;r++)F(cx+k,sol-24+r*5,4,4.5,r%2?'#cfc6b0':'#ddd4be');F(cx+k,sol-24,4,24,'rgba(0,0,0,0)');
    for(let r=0;r<5;r++){F(cx+k,sol-24+r*5,4,0.5,'#efe8d6');F(cx+k+3.5,sol-24+r*5,0.5,4.5,'#8a806a');}F(cx+k-0.5,sol-25.5,5,2,NEIGE.h);});
  /* l'auvent : quatre poteaux, deux pans de bardeaux, la neige et les glaçons */
  [[-19],[18]].forEach(([k])=>{F(cx+k,sol-46,2.5,22,'#6b4a28');F(cx+k,sol-46,0.8,22,'#8a6238');});
  toitNeige(F,g,cx,sol-46,50,18,['#5a4a3e','#6a5a4c','#3e3228']);
  /* le pignon, et la plaque émaillée */
  g.fillStyle='#8a6238';g.beginPath();g.moveTo(cx-14,sol-48);g.lineTo(cx,sol-60);g.lineTo(cx+14,sol-48);g.closePath();g.fill();
  for(let k=-12;k<13;k+=2.5)F(cx+k,sol-48-Math.max(0,12-Math.abs(k))*0.95,0.5,Math.max(0,12-Math.abs(k))*0.95,'#5b3f21');
  F(cx-15,sol-47,30,6,'#1d3f8f');F(cx-15,sol-47,30,0.5,'#4d6fc8');F(cx-14,sol-46.5,28,0.5,'#e9e6db');F(cx-14,sol-41.5,28,0.5,'#e9e6db');
  g.font='700 4.2px Georgia,serif';g.textAlign='center';g.fillStyle='#ffffff';g.fillText('LA MONTAGNE',cx,sol-42.6,26);g.textAlign='left';
  /* une lanterne sous l'auvent */
  F(cx-0.25,sol-41,0.5,2,'#2a2e36');F(cx-2,sol-39,4,4.5,'#2a2e36');F(cx-1.5,sol-38.5,3,3.5,nuit?'#ffd27a':'#e8dcb0');
  /* le M sur son mât, à droite */
  const tx=cx+30;F(tx-1,sol-50,2.5,50,'#4d5760');F(tx-1,sol-50,1,50,'#7a848c');
  F(tx-7,sol-64,15,14,'#1d4f9a');F(tx-7,sol-64,15,1,'#4d7fc8');F(tx-7,sol-51,15,1,'#12356a');F(tx-7,sol-65.5,15,1.5,NEIGE.h);
  F(tx-4.5,sol-61,2,10,'#ffffff');F(tx+3,sol-61,2,10,'#ffffff');for(let k=0;k<5;k++){F(tx-2.5+k*0.5,sol-60+k,1.5,1.5,'#ffffff');F(tx+1.5-k*0.5,sol-60+k,1.5,1.5,'#ffffff');}
  return {c,W,H,sol};
}
/* LES BOUTIQUES : alignées au fond du plancher, face à la neige, comme une rue de station.
   Toutes fermées pour l'instant : on lit leur enseigne, on ne peut pas entrer. */
/* LE TÉLÉPHÉRIQUE : une gare de béton et de bois, un grand volant, deux câbles qui filent vers le
   sommet (hors de la carte), et deux cabines rouges qui vont et viennent en se croisant */
/* LA DISPOSITION (d'après le croquis) : un fond de montagnes ; en haut, dans la neige, le téléphérique
   à gauche et les boutiques à droite ; l'escalier ; en bas, le métro, la place de planches, la neige */
const MONT=110, ESC_Y=384, MARCHES=4, MARCHE_H=6, BAS_Y=ESC_Y+MARCHES*MARCHE_H, NEIGE_Y=BAS_Y;
const PLACE={x:80,y:508,w:200,h:108};
const COUR={x0:150,x1:352,y0:200,y1:262,passage:[258,292]};      /* la cour des boutiques */
const PATIN={x0:44,x1:326,y0:646,y1:868,r:34,porte:[166,204]};    /* la patinoire, sous la place ; on y entre par le haut */
const TPH={x:80,y:296,h:64,ecart:10,cx:113};
/* LA FILE D'ATTENTE : un plancher devant la gare, fermé de cordes. On entre en bas à droite, sous un
   portique ; trois allées en serpentin ; en haut, les tourniquets, puis la porte d'embarquement. */
function graverMine(nuit){const W=104,H=96,{c,g,F}=mk(W,H);
    /* LA MINE DES CIMES : falaise en strates, entrée voûtée boisée, rails, wagonnet, lanterne.
       Même recette que la forêt : texture par demi-pixel, bruit, ombres portées, neige posée. */
    const sol=H-22, mx=W*0.46, al=hs;
    const R=(x,y,w,h,col)=>{if(w<=0||h<=0)return;g.fillStyle=col;g.fillRect(Math.round(x*2)/2,Math.round(y*2)/2,w,h);};
    const bord=(y)=>W*0.80-y*0.22+Math.sin(y/11)*5+Math.sin(y/29)*7;
    const roche=['#4a515c','#545b67','#5e6672','#69717d','#747c88'];
    for(let y=0;y<sol+6;y++){const larg=bord(y);
      for(let x=0;x<larg;x++){const bande=Math.floor((y*0.9+Math.sin(x/9)*3+Math.sin(x/23)*5)/4);
        let i2=((bande%3)+3)%3+1;
        if(al(x*2.1+y*1.7)<0.18)i2=Math.max(0,i2-1);
        if(al(x*3.3+y*0.9)>0.92)i2=Math.min(4,i2+1);
        R(x,y,1,1,roche[i2]);
        if(al(x*5.1+y*2.7)>0.988)R(x,y,1,1,'#98a0ac');}
      if(y%4===0)R(0,y,larg,0.5,'rgba(26,32,40,.35)');
      R(larg-2,y,2,1,'#838b97');
      if(Math.abs(bord(y-1)-larg)>1.2)R(larg-4,y,5,1.5,'#eef6fb');}
    g.strokeStyle='rgba(24,30,38,.5)';g.lineWidth=0.5;
    [[14,4],[44,0],[74,8]].forEach(([x0,y0],k2)=>{g.beginPath();g.moveTo(x0,y0);
      for(let y=y0;y<sol-6;y+=6)g.lineTo(x0+Math.sin((y+k2*9)/7)*4,y);g.stroke();});
    for(let x=0;x<bord(0);x++){const e2=3+Math.sin(x/7)*1.5+al(x)*2;R(x,0,1,e2,'#f4fafd');R(x,e2,1,1,'#d8e6f2');}
    const base=sol, lE=15, hE=34;
    g.fillStyle='#0d1216';g.beginPath();g.moveTo(mx-lE,base);g.lineTo(mx-lE,base-hE+lE);
    g.arc(mx,base-hE+lE,lE,Math.PI,0);g.lineTo(mx+lE,base);g.closePath();g.fill();
    for(let i2=0;i2<3;i2++){g.fillStyle='rgba(18,24,30,'+(0.25+i2*0.22)+')';
      g.beginPath();g.ellipse(mx,base-hE*0.5,lE-4-i2*3.5,hE*0.36-i2*3,0,0,7);g.fill();}
    for(let i2=0;i2<8;i2++){const w=lE*0.7-i2*1.5,y=base-3-i2*2.6;R(mx-w,y,w*2,0.6,'rgba(126,136,148,'+(0.45-i2*0.05)+')');}
    const bois=(x,y,w,h)=>{for(let j=0;j<h;j++){const k2=al((x+j)*1.9);R(x,y+j,w,1,k2<0.3?'#6a4a2a':(k2<0.7?'#7d5934':'#8a6238'));}
      R(x,y,w,1,'#a5764a');R(x,y+h-1,w,1,'#4a3218');};
    bois(mx-lE-4.5,base-hE+lE,4.5,hE-lE);bois(mx+lE,base-hE+lE,4.5,hE-lE);
    g.save();g.beginPath();g.rect(mx-lE-6,base-hE-2,2*lE+12,lE+4);g.clip();
    g.strokeStyle='#7d5934';g.lineWidth=4.5;g.beginPath();g.arc(mx,base-hE+lE,lE+2.2,Math.PI,0);g.stroke();
    g.strokeStyle='#a5764a';g.lineWidth=1;g.beginPath();g.arc(mx,base-hE+lE,lE+4.2,Math.PI,0);g.stroke();g.restore();
    [[-lE-2.5,base-6],[lE+1,base-6],[-lE-2.5,base-hE+lE+3],[lE+1,base-hE+lE+3]].forEach(([dx,y])=>{R(mx+dx,y,2,2,'#39454f');R(mx+dx,y,1,1,'#7a828c');});
    for(let x=mx-lE-8;x<mx+lE+8;x++){const d2=Math.abs(x-mx)/(lE+8);R(x,base-hE+lE-Math.sqrt(Math.max(0,1-d2*d2))*lE-3,1,1.5+al(x),'#f2f9fd');}
    R(mx-16,base-hE-6,32,7,'#2a1a0e');R(mx-15,base-hE-5,30,5,'#3a2616');
    g.font='700 3.8px Georgia';g.textAlign='center';g.fillStyle='#f0cf7d';g.fillText('MINE DES CIMES',mx,base-hE-0.8,28);g.textAlign='left';
    R(mx+lE+5,base-hE+lE-2,1.5,5,'#39454f');R(mx+lE+3,base-hE+lE+3,6,7,'#c9a24a');R(mx+lE+4,base-hE+lE+4,4,5,nuit?'#fff0c0':'#ffe9a8');
    if(nuit){const gr=g.createRadialGradient(mx+lE+6,base-hE+lE+6,2,mx+lE+6,base-hE+lE+6,26);
      gr.addColorStop(0,'rgba(255,214,130,.35)');gr.addColorStop(1,'rgba(255,214,130,0)');g.fillStyle=gr;g.fillRect(mx-12,base-hE,62,48);}
    for(let i2=0;i2<13;i2++){const y=base+1+i2*2.4, e2=i2*0.85;
      R(mx-9-e2,y,18+e2*2,1.4,'#5b3f21');R(mx-9-e2,y,18+e2*2,0.5,'#7d5934');}
    for(let i2=0;i2<34;i2++){const y=base+i2*0.95, e2=i2*0.33;
      R(mx-7.5-e2,y,1.6,1,'#98a0aa');R(mx+5.9+e2,y,1.6,1,'#98a0aa');
      R(mx-7.5-e2,y,0.6,1,'#c6ced8');R(mx+5.9+e2,y,0.6,1,'#c6ced8');}
    (function(){const x=mx+2,y=H-8;
      g.fillStyle='rgba(120,140,160,.3)';g.beginPath();g.ellipse(x+1,y+3,13,3,0,0,7);g.fill();
      for(let j=0;j<12;j++){const k2=al((x+j)*2.3);R(x-11,y-12+j,22,1,k2<0.35?'#6a4a2a':(k2<0.7?'#7d5934':'#8a6238'));}
      R(x-11,y-12,22,1.5,'#a5764a');R(x-11,y-1,22,1.5,'#4a3218');R(x-11,y-12,1.5,12,'#5b3f21');R(x+9.5,y-12,1.5,12,'#5b3f21');
      R(x-12,y-9,24,1,'#39454f');R(x-12,y-4,24,1,'#39454f');
      for(let k2=0;k2<10;k2++)R(x-8+al(k2*3)*15,y-14+al(k2*5)*2.5,2.5,2,al(k2)<0.5?'#8c94a0':'#6d7581');
      [[-7,2],[6,2]].forEach(([dx,dy])=>{g.fillStyle='#39454f';g.beginPath();g.arc(x+dx,y+dy,2.6,0,7);g.fill();
        g.fillStyle='#727c88';g.beginPath();g.arc(x+dx,y+dy,1.2,0,7);g.fill();});})();
    (function(){const x=mx-30,y=base+9;
      g.fillStyle='rgba(120,140,160,.3)';g.beginPath();g.ellipse(x+1,y+2,9,2.5,0,0,7);g.fill();
      for(let j=0;j<9;j++){const k2=al((x+j)*1.7);R(x-8,y-9+j,16,1,k2<0.4?'#7d5934':'#8a6238');}
      R(x-8,y-9,16,1.5,'#a5764a');R(x-8,y-1,16,1,'#4a3218');R(x-8,y-5,16,0.8,'#6a4a2a');
      R(x+11,y-15,1.6,15,'#8a6238');R(x+8,y-18,8,3,'#9aa2ac');R(x+8,y-18,8,1,'#c6ced8');
      for(let k2=0;k2<12;k2++)R(x-20+al(k2*3)*13,y-2+al(k2*5)*4,2.5,2,al(k2*7)<0.5?'#7d8590':'#5e6672');})();
    return {c,W,H,sol:H-2};
  }
const FQ={x0:TPH.x-60,x1:TPH.x+60,y0:TPH.y+4,y1:TPH.y+78,entree:[TPH.x+38,TPH.x+60]};
const FILE=(()=>{const {x0,x1,y0,y1,entree}=FQ, r1=y0+26, r2=y0+50;
  return [[x0,y0,x0,y1],[x0,y1,entree[0],y1],[x1,y0,x1,y1],      /* le cadre : gauche, bas (jusqu'à l'entrée), droite */
          [x0+22,r2,x1,r2],[x0,r1,x1-22,r1]];})();                   /* les deux cordes du serpentin */
/* LE TAMPON DE PIXELS : écrire directement dans l'image est cent fois plus rapide qu'un fillRect par pixel */
const RGB_CACHE={};
function rgbDe(hex){let c=RGB_CACHE[hex];if(!c){const n=parseInt(hex.slice(1),16);c=RGB_CACHE[hex]=[(n>>16)&255,(n>>8)&255,n&255];}return c;}
function tampon(g,y0,y1){const W2=g.canvas.width, a=Math.max(0,Math.floor(y0*2)), b=Math.min(g.canvas.height,Math.ceil(y1*2));
  const im=g.getImageData(0,a,W2,Math.max(1,b-a)), d=im.data;
  return {pose:(x,y,hex)=>{const X=Math.round(x*2), Y=Math.round(y*2)-a;if(X<0||X>=W2||Y<0||Y>=b-a)return;const o=(Y*W2+X)*4, c=rgbDe(hex);d[o]=c[0];d[o+1]=c[1];d[o+2]=c[2];d[o+3]=255;},
    voile:(x,yA,yB,r,gg,bb,al)=>{const X=Math.round(x*2);if(X<0||X>=W2)return;for(let Y=Math.max(0,Math.round(yA*2)-a);Y<Math.min(b-a,Math.round(yB*2)-a);Y++){const o=(Y*W2+X)*4;
      d[o]=d[o]*(1-al)+r*al;d[o+1]=d[o+1]*(1-al)+gg*al;d[o+2]=d[o+2]*(1-al)+bb*al;}},
    fin:()=>g.putImageData(im,0,a)};}
/* LE FOND DE MONTAGNES, trois styles possibles */
let FOND='alpin';
function fondMontagnes(g,F){
  /* une arête de montagne : des sommets et des cols, puis du détail par déplacement du point milieu */
  const arete=(pics,graine,rugo)=>{const pts=[];pics.forEach(p=>pts.push(p));
    let seg=pts.slice();for(let niv=0;niv<6;niv++){const n=[];for(let i=0;i<seg.length-1;i++){const [x1,y1]=seg[i],[x2,y2]=seg[i+1];
      n.push([x1,y1]);n.push([(x1+x2)/2,(y1+y2)/2+(hs(graine+niv*97+i*13)-0.5)*rugo*Math.abs(x2-x1)*0.5]);}n.push(seg[seg.length-1]);seg=n;}
    const y=new Float32Array(WW*2+2);for(let i=0;i<seg.length-1;i++){const [x1,y1]=seg[i],[x2,y2]=seg[i+1];
      for(let x=Math.max(0,Math.floor(x1*2));x<=Math.min(WW*2,Math.ceil(x2*2));x++){const t=(x/2-x1)/Math.max(0.001,x2-x1);y[x]=y1+(y2-y1)*Math.max(0,Math.min(1,t));}}
    return y;};
  if(FOND==='alpin'||FOND==='couchant'){
    const soir=FOND==='couchant';
    /* le ciel */
    const ciel=g.createLinearGradient(0,0,0,MONT);
    if(soir){ciel.addColorStop(0,'#3a3a78');ciel.addColorStop(0.45,'#b8688a');ciel.addColorStop(0.8,'#f0a070');ciel.addColorStop(1,'#f8d0a0');}
    else{ciel.addColorStop(0,'#5f8fc4');ciel.addColorStop(0.6,'#a9c8e6');ciel.addColorStop(1,'#e2edf6');}
    g.fillStyle=ciel;g.fillRect(0,0,WW,MONT);
    if(!soir)for(let k=0;k<5;k++){const x=hs(k*7)*WW, y=8+hs(k*3)*22;g.fillStyle='rgba(255,255,255,.7)';g.beginPath();g.ellipse(x,y,14+hs(k)*12,2.5,0,0,7);g.fill();g.beginPath();g.ellipse(x+8,y-1.5,8,2,0,0,7);g.fill();}
    else{g.fillStyle='rgba(255,230,180,.9)';g.beginPath();g.arc(WW*0.78,64,9,0,7);g.fill();}
    /* trois chaînes, de la plus lointaine à la plus proche : chaque colonne est éclairée ou dans l'ombre selon la pente */
    const chaines=[
      {pics:[[0,58],[40,38],[82,52],[128,22],[170,44],[214,30],[262,48],[300,26],[360,46]],g:11,r:0.5,base:88,loin:1},
      {pics:[[0,70],[34,52],[70,64],[118,34],[150,56],[196,40],[236,62],[284,38],[330,58],[360,50]],g:37,r:0.6,base:98,loin:0.55},
      {pics:[[0,86],[46,70],[92,84],[140,62],[186,80],[230,66],[276,82],[322,68],[360,80]],g:71,r:0.55,base:110,loin:0}];
    const T=tampon(g,0,MONT+1);
    chaines.forEach((ch,ci)=>{const y=arete(ch.pics,ch.g,ch.r);
      /* les sommets de l'arête : chaque point de la montagne appartient au versant d'un sommet */
      const pics=[];for(let X=4;X<WW*2-4;X++){if(y[X]<=y[X-4]&&y[X]<=y[X+4]&&y[X]<y[X-1]+0.01&&y[X]<=y[X+1])pics.push(X);}
      const bruit=(x,yy)=>Math.sin(x/7.3+ci)*0.5+Math.sin(yy/5.1+x/13)*0.5;
      for(let X=0;X<=WW*2;X++){const x=X/2, top=y[X];
        let pk=pics[0]||0;for(const q of pics)if(Math.abs(q-X)<Math.abs(pk-X))pk=q;
        for(let yy=Math.floor(top*2)/2;yy<ch.base;yy+=0.5){const prof=yy-top;
          /* le fil de l'arête descend du sommet en biais : à gauche, la lumière ; à droite, l'ombre */
          const fil=pk/2+(yy-y[pk])*0.45+bruit(x,yy)*1.2;const eclaire=x<fil;
          const ligneNeige=(ci===2?7:16)+Math.sin(x/11+ci*3)*4+Math.sin(x/4.3)*1.5;
          const c9=Math.floor(x/13+ci*7), dansC=Math.abs((x%13)-6.5)<(1.2-(prof-ligneNeige)/(ligneNeige*1.4))*1.6;
          const couloir=hs(c9*3.7)<0.3&&prof<ligneNeige*2.2&&dansC;           /* quelques couloirs de neige, qui s'effilent vers le bas */
          let col;
          if(prof<ligneNeige||couloir){col=soir?(eclaire?'#ffcdb4':'#b494bc'):(eclaire?'#ffffff':'#c4d4e6');
            if(!eclaire&&prof<2)col=soir?'#c8a8cc':'#d6e2ee';}
          else{const strate=Math.floor((yy*0.9+x*0.25*(eclaire?1:-1))/2.5)%2;
            col=soir?(eclaire?(strate?'#8e6c8c':'#82627f'):(strate?'#4c3c60':'#46375a')):(eclaire?(strate?'#8c97a6':'#828d9c'):(strate?'#5c687a':'#546072'));}
          T.pose(x,yy,col);}
        if(ch.loin>0){if(soir)T.voile(x,top,ch.base,206,150,176,0.5*ch.loin);else T.voile(x,top,ch.base,196,214,236,0.6*ch.loin);}
        T.pose(x,top,soir?'#fff0e0':'#ffffff');}});
    T.fin();
    /* la forêt de sapins, au pied, et la brume */
    for(let x=0;x<WW;x+=1.5){const h=6+hs(x*2.1)*6;g.fillStyle=soir?'#2a2438':'#1f3a2e';g.beginPath();g.moveTo(x-1.8,MONT);g.lineTo(x,MONT-h);g.lineTo(x+1.8,MONT);g.fill();
      F(x-0.5,MONT-h+1,1,0.5,soir?'#d8b0c0':'#e8f0f4');}
    const brume=g.createLinearGradient(0,MONT-14,0,MONT);brume.addColorStop(0,'rgba(255,255,255,0)');brume.addColorStop(1,soir?'rgba(250,210,200,.35)':'rgba(255,255,255,.45)');
    g.fillStyle=brume;g.fillRect(0,MONT-14,WW,14);
  }else{
    /* L'AFFICHE : aplats, un grand sommet emblématique, le soleil, trois plans nets */
    g.fillStyle='#f4e4c0';g.fillRect(0,0,WW,MONT);
    g.fillStyle='#f0b050';g.beginPath();g.arc(WW*0.22,30,13,0,7);g.fill();g.fillStyle='#f4c870';g.beginPath();g.arc(WW*0.22,30,9,0,7);g.fill();
    const plan=(pts,col,neige)=>{g.fillStyle=col;g.beginPath();g.moveTo(0,MONT);pts.forEach(([x,y])=>g.lineTo(x,y));g.lineTo(WW,MONT);g.closePath();g.fill();
      if(neige)neige.forEach(([x,y,w])=>{g.fillStyle='#ffffff';g.beginPath();g.moveTo(x,y);g.lineTo(x-w,y+w*1.2);g.lineTo(x-w*0.4,y+w*0.9);g.lineTo(x,y+w*1.4);g.lineTo(x+w*0.5,y+w*0.8);g.lineTo(x+w,y+w*1.1);g.closePath();g.fill();});};
    plan([[0,62],[50,44],[90,58],[140,36],[190,52],[230,40],[290,56],[330,42],[360,50]],'#7fa4c8',[[140,36,10],[230,40,8],[330,42,7],[50,44,7]]);
    plan([[0,80],[40,70],[80,76],[200,12],[226,40],[250,56],[300,70],[360,66]],'#3f6a9a',[[200,12,16]]);
    g.fillStyle='#2f5580';g.beginPath();g.moveTo(200,12);g.lineTo(226,40);g.lineTo(250,56);g.lineTo(300,70);g.lineTo(300,110);g.lineTo(210,110);g.closePath();g.fill();   /* le versant à l'ombre */
    plan([[0,98],[60,88],[120,94],[180,86],[240,92],[300,84],[360,92]],'#244a3a');
    for(let x=0;x<WW;x+=3){g.fillStyle='#1a3a2e';g.beginPath();g.moveTo(x-2,MONT);g.lineTo(x,MONT-5-hs(x)*4);g.lineTo(x+2,MONT);g.fill();}
  }
  /* ===== LA MINE : un massif de premier plan, modelé, et sa tête de galerie en bois =====
     Le fond reste en aplats (c'est loin) ; ici on est tout près, donc pixel fin et relief. */
  {const mx=180, base=MONT+4, haut=64, larg=52;
   /* PLUS DE MASSIF : la galerie s'ouvre à même la montagne du fond.
      Il ne reste qu'un collet de roche autour de l'ouverture, pour qu'elle s'y creuse. */
   {const T=['#33587a','#2b4c69','#234058','#1b3348'];
    for(let y=base-34;y<base+2;y+=0.5){
      const l=26+ (base-y)*0.12 - Math.abs(Math.sin((base-y)/9))*3;
      for(let x=mx-l;x<mx+l;x+=0.5){
        const u=(x-(mx-l))/(2*l);let i2=u<0.34?0:(u<0.6?1:(u<0.8?2:3));
        if(hs(x*2.7+y*1.9)>0.972)i2=Math.max(0,i2-1);
        F(x,y,0.5,0.5,T[i2]);}
      F(mx-l,y,1,0.5,'#5b86ad');F(mx+l-1,y,1,0.5,'#16293c');
      if(Math.abs(y%8)<0.5)F(mx-l+2,y,l*1.1,0.5,'rgba(20,32,46,.22)');}
    /* un peu de neige sur le rebord du collet et des gravats au pied */
    for(let x=mx-28;x<mx+28;x+=0.5){const e=1.5+Math.sin(x/6)*0.8+hs(x)*1.2;F(x,base-34,0.5,e,'#eef6fb');}
    for(let i2=0;i2<160;i2++){const a=(hs(i2*3)-0.5)*62, d=hs(i2*7);
      F(mx+a*(0.6+d*0.5),base+d*7,0.5+hs(i2*5)*1.5,0.5,hs(i2)<.5?'#7c8794':'#5d6773');}}
   /* l'embrasure : quatre profondeurs jusqu'au noir */
   const arche=(l,h,col)=>{g.fillStyle=col;g.beginPath();g.moveTo(mx-l,base);g.lineTo(mx-l,base-h+l);
     g.arc(mx,base-h+l,l,Math.PI,0);g.lineTo(mx+l,base);g.closePath();g.fill();};
   g.fillStyle='rgba(28,36,48,.25)';g.beginPath();g.ellipse(mx,base+7,32,6,0,0,7);g.fill();
   arche(19,28,'#16304a');arche(15,24,'#0b1a2a');arche(11,19,'#050d16');
   /* LA TÊTE DE GALERIE EN BOIS : montants à chanfrein, poutre épaisse, jambes de force */
   const poteau=(x)=>{F(x,base-27,6,27,'#6a4a2a');F(x+0.8,base-27,3.6,27,'#8a6238');
     F(x+0.8,base-27,1.2,27,'#a5764a');F(x+4.8,base-27,1.2,27,'#4a3218');
     for(let k=0;k<5;k++)F(x+1,base-25+k*5.5,3.6,0.5,'rgba(60,40,20,.35)');};
   poteau(mx-24);poteau(mx+18);
   F(mx-28,base-32,56,5.6,'#6a4a2a');F(mx-28,base-32,56,3.2,'#8a6238');
   F(mx-28,base-32,56,1.2,'#a5764a');F(mx-28,base-27,56,1.2,'#4a3218');
   g.fillStyle='#fff';g.beginPath();g.moveTo(mx-29,base-32);g.lineTo(mx-17,base-36);g.lineTo(mx-5,base-33.4);
   g.lineTo(mx+7,base-37);g.lineTo(mx+18,base-34);g.lineTo(mx+29,base-32);g.closePath();g.fill();
   [[-1],[1]].forEach(([s2])=>{g.save();g.translate(mx+s2*23,base-25);g.rotate(s2*0.5);
     F(-1.6,0,3.2,12,'#7d5934');F(-1.6,0,1,12,'#a5764a');g.restore();});
   /* l'écriteau : juste MINE */
   F(mx-13,base-25,26,8,'#6a4a2a');F(mx-12,base-24,24,6,'#8a6238');F(mx-12,base-24,24,1.2,'#a5764a');
   g.font='700 5px Georgia';g.textAlign='center';g.fillStyle='#2a1a0e';g.fillText('MINE',mx+0.4,base-19.2,22);
   g.fillStyle='#f4e2ae';g.fillText('MINE',mx,base-19.6,22);g.textAlign='left';
   /* la lanterne et sa lueur */
   F(mx+28,base-16,1.8,9,'#2f3a46');F(mx+25.4,base-10.5,6.4,7.5,'#8a6a28');F(mx+26.2,base-9.8,4.8,6,'#c9a24a');
   F(mx+26.8,base-9.2,3.6,4.8,'#ffe9a8');
   {const gr=g.createRadialGradient(mx+28.6,base-7,1,mx+28.6,base-7,22);
    gr.addColorStop(0,'rgba(255,214,130,.34)');gr.addColorStop(1,'rgba(255,214,130,0)');g.fillStyle=gr;g.fillRect(mx+6,base-29,46,42);}
   /* le stock de madriers et la congère du seuil */
   for(let i2=0;i2<3;i2++){const y=base-3-i2*3.4;F(mx-46,y+2.8,17,1.4,'rgba(28,36,48,.2)');
     F(mx-46,y,17,3.2,'#7d5934');F(mx-46,y,17,1,'#a5764a');}
   g.fillStyle='#dfeaf4';g.beginPath();g.moveTo(mx-29,base+4);g.quadraticCurveTo(mx-13,base-1.5,mx,base+0.5);
   g.quadraticCurveTo(mx+13,base-1.5,mx+29,base+4);g.lineTo(mx+29,base+6);g.lineTo(mx-29,base+6);g.closePath();g.fill();
   g.fillStyle='#ffffff';g.beginPath();g.moveTo(mx-24,base+3.2);g.quadraticCurveTo(mx,base+0.6,mx+24,base+3.2);
   g.lineTo(mx+24,base+4.2);g.lineTo(mx-24,base+4.2);g.closePath();g.fill();
  }
}
function solVide(){
  const {c,g,F}=mk(WW,WH);
  const neige=(y0,y1)=>{
    /* écrite directement dans l'image : le relief (lent) calculé un point sur deux, le grain par un hachage entier (rapide) */
    const W2=WW*2, a0=Math.floor(y0*2), a1=Math.min(WH*2,Math.ceil(y1*2)), im=g.getImageData(0,a0,W2,a1-a0), d=im.data;
    const P=['#e4ecf4','#dde7f0','#ffffff','#fbfdfe','#f3f7fa','#f6f9fb','#f9fbfd'].map(rgbDe);
    for(let Y=a0;Y<a1;Y++){const y=Y/2;let r=0;
      for(let X=0;X<W2;X++){if((X&1)===0){const x=X/2;r=Math.sin(x/47+y/61)*0.6+Math.sin(x/19-y/27)*0.25+Math.sin((x-y)/83)*0.5;}
        let h=(X*374761393+Y*668265263)|0;h=Math.imul(h^(h>>>13),1274126177);const t=((h^(h>>>16))>>>0)/4294967296;
        const c=t>0.992?P[2]:(r<-0.55?(t<0.5?P[0]:P[1]):(r>0.55?(t<0.5?P[2]:P[3]):(t<0.33?P[4]:(t<0.66?P[5]:P[6]))));
        const o=((Y-a0)*W2+X)*4;d[o]=c[0];d[o+1]=c[1];d[o+2]=c[2];d[o+3]=255;}}
    g.putImageData(im,0,a0);
    /* LA NEIGE DAMÉE : de longues rides de vent à crête claire, des creux bleutés très doux,
       des cristaux qui accrochent la lumière. */
    for(let i=0;i<Math.round((y1-y0)*0.16);i++){
      const y=y0+4+hs(i*3+y0)*(y1-y0-8), amp=1.1+hs(i+y0)*1.7, lg=40+hs(i*5+y0)*130, x0=hs(i*7+y0)*WW-24;
      for(let x=x0;x<x0+lg;x+=0.5){const yy=y+Math.sin((x-x0)/17)*amp;
        F(x,yy,0.5,1.2,'rgba(205,220,235,.5)');F(x,yy-1,0.5,0.6,'rgba(255,255,255,.75)');}}
    for(let i=0;i<Math.round((y1-y0)*0.06);i++){
      const x=hs(i*9+y0)*WW, y=y0+8+hs(i*11+y0)*(y1-y0-16);
      g.fillStyle='rgba(196,214,232,.30)';g.beginPath();g.ellipse(x,y,9+hs(i+y0)*15,3+hs(i*2+y0)*3,0,0,7);g.fill();}
    for(let k=0;k<(y1-y0)*1.4;k++){const x=hs(k*3.7+y0)*WW, y=y0+hs(k*5.3+y0)*(y1-y0);F(x,y,0.5,0.5,'#ffffff');if(k%11===0){F(x-1,y,2.5,0.5,'#ffffff');F(x,y-1,0.5,2.5,'#ffffff');}}
    for(let k=0;k<(y1-y0)*0.35;k++){const x=hs(k*2.9+y0)*WW, y=y0+hs(k*6.1+y0)*(y1-y0);
      F(x,y,1,1,'#ffffff');F(x-0.5,y+0.5,2,0.5,'rgba(255,255,255,.75)');}};
  /* 1 · LE FOND DE MONTAGNES, avec la mine */
  fondMontagnes(g,F);
  /* 2 · LA NEIGE, du pied de la montagne jusqu'en bas : plus de cour, plus d'escalier, plus de place */
  neige(MONT,WH);
  return c;
}
let SOL_MEMO=null;
function solFin(){if(!SOL_MEMO)SOL_MEMO=solVide();return SOL_MEMO;}        /* fabriqué une seule fois : le revenir de l'arrière-plan ne le refait plus */
function graverTelepherique(nuit){
  const W=112,H=118,{c,g,F}=mk(W,H);const cx=W/2,sol=H-6;ombre(g,cx,sol,50,6);
  F(cx-44,sol-12,88,12,'#9a9690');F(cx-44,sol-12,88,1,'#c4c0b8');for(let k=-44;k<44;k+=11)F(cx+k,sol-12,0.5,12,'#7a766e');
  for(let k=0;k<3;k++){F(cx-10,sol-3-k*3,20,3,k%2?'#8a8680':'#a8a49c');F(cx-10,sol-3-k*3,20,0.5,'#d0ccc4');}
  [[-42],[38]].forEach(([k])=>{F(cx+k,sol-58,4,46,'#4a5664');F(cx+k,sol-58,1,46,'#8aa0b4');});
  for(let k=-38;k<38;k+=4){F(cx+k,sol-58,4,20,k%8?'#8a5a3a':'#7a4a2a');F(cx+k+3.5,sol-58,0.5,20,'#4a2a18');}
  F(cx-38,sol-38,76,26,nuit?'#f0c870':'#2e3a48');for(let k=-38;k<38;k+=12)F(cx+k,sol-38,1,26,'#3a4450');F(cx-38,sol-26,76,1,'#3a4450');
  if(!nuit){g.fillStyle='rgba(255,255,255,.18)';g.beginPath();g.moveTo(cx-34,sol-13);g.lineTo(cx-20,sol-37);g.lineTo(cx-12,sol-37);g.lineTo(cx-26,sol-13);g.closePath();g.fill();}
  /* la porte d'embarquement, au bout de la file */
  F(cx-8,sol-30,16,18,'#1a1c24');F(cx-8,sol-30,16,1,'#8a8f96');F(cx-0.25,sol-30,0.5,18,'#8a8f96');
  F(cx-50,sol-64,100,6,'#3a3a40');F(cx-50,sol-64,100,1,'#6a6a70');F(cx-51,sol-67,102,3.5,'#ffffff');
  for(let k=-50;k<51;k+=3)F(cx+k,sol-58,0.5,1+hs(k)*3,'rgba(220,244,255,.9)');
  F(cx+18,sol-78,30,11,'#c0392b');F(cx+18,sol-78,30,1.5,'#e05a4a');F(cx+18,sol-68,30,1,'#8a2418');F(cx+17,sol-80,32,2.5,'#ffffff');   /* le capot du volant, côté câbles */
  F(cx-26,sol-56,52,8,'#1d3f6a');F(cx-26,sol-56,52,0.5,'#4d7fc8');
  g.font='700 5px Georgia';g.textAlign='center';g.fillStyle='#ffffff';g.fillText('TÉLÉPHÉRIQUE',cx,sol-50.3,48);g.textAlign='left';
  return {c,W,H,sol};
}
function cabine(g,x,yCable,bal,nuit){
  const F=(a,b,w,h,col)=>{g.fillStyle=col;g.fillRect(a,b,w,h);};
  F(x-6,yCable-2,12,3,'#3a3a40');F(x-5,yCable-3,3,1.5,'#6a6a70');F(x+2,yCable-3,3,1.5,'#6a6a70');
  g.save();g.translate(x,yCable+1);g.rotate(bal);
  F(-0.5,0,1.5,12,'#3a3a40');F(-5,11,10,1.5,'#3a3a40');
  F(-13,12,26,22,'#c0392b');F(-13,12,26,1.5,'#e05a4a');F(-13,32.5,26,1.5,'#8a2418');F(12.5,12,0.5,22,'#8a2418');
  F(-11,15,22,9,nuit?'#f8d888':'#2e3a48');for(let k=-11;k<11;k+=5.5)F(k,15,0.5,9,'#8a2418');
  if(!nuit)F(-10,16,4,0.5,'rgba(255,255,255,.6)');
  F(-14,11,28,1.5,'#ffffff');F(-3,26,6,6,'#a8302a');F(-1,28,0.5,1,'#f0cf7d');
  g.restore();
}
/* LA TÉLÉCABINE : une gare d'acier et de verre au toit courbe vert, et une ribambelle de petites
   cabines ovales de couleur qui montent et descendent en boucle, sans jamais s'arrêter */
function graverTelecabine(nuit){
  const W=112,H=100,{c,g,F}=mk(W,H);const cx=W/2,sol=H-6;ombre(g,cx,sol,50,6);
  /* LE SOCLE de béton banché : planches de coffrage, trous de banche, une arête éclairée */
  F(cx-44,sol-10,88,10,'#9a9690');for(let y=sol-10;y<sol;y+=2.5)F(cx-44,y,88,0.5,'rgba(0,0,0,.08)');
  for(let k=-40;k<44;k+=11){F(cx+k,sol-7,1,1,'#6f6b64');F(cx+k,sol-3,1,1,'#6f6b64');}F(cx-44,sol-10,88,0.5,'#d0ccc4');F(cx-44,sol-0.5,88,0.5,'#5f5b54');
  for(let k=0;k<3;k++){F(cx-9,sol-2.5-k*2.5,18,2.5,k%2?'#8a8680':'#a8a49c');F(cx-9,sol-2.5-k*2.5,18,0.5,'#d8d4cc');F(cx-9,sol-0.5-k*2.5,18,0.5,'#6f6b64');}
  /* LA HALLE VITRÉE : poteaux d'acier, traverses, verres légèrement teintés, reflets en biais, montants */
  F(cx-41,sol-47,82,37,'#4a5664');
  for(let k=-40;k<40;k+=8){const j=k+40;F(cx+k+0.5,sol-46,7,17,nuit?'#f0c870':(j%16?'#2e3a48':'#34414f'));F(cx+k+0.5,sol-28.5,7,18,nuit?'#e8b860':(j%16?'#2a3644':'#303d4b'));}
  for(let k=-40;k<=40;k+=8){F(cx+k,sol-47,0.5,37,'#8a98a8');F(cx+k+0.5,sol-47,0.5,37,'#5a6674');}
  F(cx-41,sol-29,82,1,'#8a98a8');F(cx-41,sol-28,82,0.5,'#5a6674');F(cx-41,sol-47,82,0.8,'#aab6c4');
  if(!nuit){g.fillStyle='rgba(255,255,255,.14)';g.beginPath();g.moveTo(cx-37,sol-11);g.lineTo(cx-24,sol-46);g.lineTo(cx-18,sol-46);g.lineTo(cx-31,sol-11);g.closePath();g.fill();
    g.fillStyle='rgba(255,255,255,.08)';g.beginPath();g.moveTo(cx+10,sol-11);g.lineTo(cx+22,sol-46);g.lineTo(cx+25,sol-46);g.lineTo(cx+13,sol-11);g.closePath();g.fill();}
  /* à l'intérieur : le volant qui tourne, et une cabine à quai */
  F(cx+4,sol-41,26,2,'rgba(90,100,110,.6)');g.fillStyle='rgba(63,158,122,.85)';g.beginPath();g.ellipse(cx+18,sol-22,7,7,0,0,7);g.fill();
  g.fillStyle='rgba(20,30,40,.7)';g.beginPath();g.ellipse(cx+18,sol-24,5,3.5,0,0,7);g.fill();F(cx+15,sol-26,1.5,2,'rgba(255,255,255,.4)');
  /* la porte d'embarquement : deux battants de verre sombre, poignées d'inox, bandeau vert */
  F(cx-7,sol-27,14,17,'#1a1c24');F(cx-6.5,sol-26.5,6.2,16,'#232834');F(cx+0.3,sol-26.5,6.2,16,'#232834');F(cx-0.25,sol-27,0.5,17,'#8a8f96');
  F(cx-2,sol-19,0.8,4,'#d8dee4');F(cx+1.2,sol-19,0.8,4,'#d8dee4');F(cx-7,sol-28,14,1,'#3f9e7a');F(cx-7,sol-27.5,14,0.4,'#6fce9a');
  /* LE TOIT COURBE : tôle verte à joints debout, rive sombre, neige épaisse, glaçons */
  g.fillStyle='#3f9e7a';g.beginPath();g.moveTo(cx-48,sol-47);g.quadraticCurveTo(cx,sol-73,cx+48,sol-47);g.lineTo(cx+48,sol-43);g.quadraticCurveTo(cx,sol-68,cx-48,sol-43);g.closePath();g.fill();
  for(let k=-46;k<48;k+=4){const u=(k+48)/96, y=sol-47-Math.sin(u*Math.PI)*12.5;F(cx+k,y,0.5,4,'#2f7a5e');F(cx+k+0.5,y,0.5,4,'#5fbe96');}
  g.fillStyle='#246248';g.beginPath();g.moveTo(cx-48,sol-43.5);g.quadraticCurveTo(cx,sol-68.5,cx+48,sol-43.5);g.lineTo(cx+48,sol-42.5);g.quadraticCurveTo(cx,sol-67.5,cx-48,sol-42.5);g.closePath();g.fill();
  g.fillStyle='#ffffff';g.beginPath();g.moveTo(cx-46,sol-48);g.quadraticCurveTo(cx,sol-76,cx+46,sol-48);g.quadraticCurveTo(cx,sol-70,cx-46,sol-48);g.fill();
  g.fillStyle='rgba(170,195,225,.6)';g.beginPath();g.moveTo(cx-44,sol-48);g.quadraticCurveTo(cx,sol-71,cx+44,sol-48);g.quadraticCurveTo(cx,sol-69.5,cx-44,sol-48);g.fill();
  for(let k=-45;k<46;k+=2.5){const u=(k+48)/96, y=sol-43-Math.sin(u*Math.PI)*12.5;F(cx+k,y,0.5,0.8+hs(k)*3,'rgba(220,244,255,.95)');F(cx+k,y+0.8+hs(k)*3,0.5,0.5,'#ffffff');}
  /* l'enseigne : lettres blanches sur bandeau bleu, deux spots */
  F(cx-25,sol-60,50,8,'#12356a');F(cx-24.5,sol-59.5,49,7,'#1d3f6a');F(cx-24.5,sol-59.5,49,0.5,'#4d7fc8');
  g.font='700 5px Georgia';g.textAlign='center';g.fillStyle='rgba(0,0,0,.35)';g.fillText('TÉLÉCABINE',cx+0.4,sol-54.1,44);g.fillStyle='#ffffff';g.fillText('TÉLÉCABINE',cx,sol-54.5,44);g.textAlign='left';
  [[-26],[23]].forEach(([k])=>{F(cx+k,sol-62,3,1.5,'#3a3e46');F(cx+k+1,sol-61,1,1,nuit?'#ffe8a0':'#c8ccd0');});
  return {c,W,H,sol};}
/* une petite cabine ovale : sa pince, sa suspente, sa coque de couleur, sa vitre, son reflet */
function oeuf(g,x,y,col,bal,nuit){
  const F=(a,b,w,h,c)=>{g.fillStyle=c;g.fillRect(a,b,w,h);};
  /* la pince et ses galets, sur le câble */
  F(x-3,y-2,6,2.5,'#3a3a40');F(x-3,y-2,6,0.5,'#6a6e76');F(x-2.5,y-3,1.5,1.2,'#9aa2a8');F(x+1,y-3,1.5,1.2,'#9aa2a8');F(x-0.25,y-2.5,0.5,0.5,'#d8dee4');
  g.save();g.translate(x,y);g.rotate(bal);
  F(-0.5,0.5,1,5.5,'#3a3a40');F(-0.25,0.5,0.5,5.5,'#6a6e76');F(-3.5,5.5,7,1,'#3a3a40');                      /* la suspente, le bras */
  /* la coque : un œuf de couleur, ombré par couches, un liseré clair sur le haut */
  const clair=col+'', R=8;
  g.fillStyle=col;g.beginPath();g.ellipse(0,13,R,R,0,0,7);g.fill();
  g.fillStyle='rgba(0,0,0,.12)';g.beginPath();g.ellipse(1.8,14.5,6.8,6,0,0,7);g.fill();
  g.fillStyle='rgba(0,0,0,.14)';g.beginPath();g.ellipse(2.8,16.5,4.8,3.4,0,0,Math.PI);g.fill();
  g.fillStyle='rgba(255,255,255,.28)';g.beginPath();g.ellipse(-3,9,3,2,-0.5,0,7);g.fill();
  g.strokeStyle='rgba(255,255,255,.35)';g.lineWidth=0.5;g.beginPath();g.arc(0,13,R-0.4,Math.PI*1.1,Math.PI*1.75);g.stroke();
  /* la vitre panoramique, son joint, son reflet, la silhouette d'un passager */
  g.fillStyle='#1a2230';g.beginPath();g.ellipse(0,11.2,6.2,4.2,0,0,7);g.fill();
  g.fillStyle=nuit?'#f8d888':'#2e3a48';g.beginPath();g.ellipse(0,11,5.6,3.7,0,0,7);g.fill();
  if(!nuit){g.fillStyle='rgba(20,26,34,.9)';g.fillRect(1.5,10,2,3);g.fillRect(1.8,9,1.4,1);}
  g.fillStyle='rgba(255,255,255,.55)';g.fillRect(-4.2,9,1.6,2.6);g.fillRect(-3,8.3,2.6,0.5);
  /* la jointure de la porte, la bande de couleur, le numéro, la neige sur le toit */
  F(-0.25,15.5,0.5,5,'rgba(0,0,0,.25)');F(-7,16,14,0.8,'rgba(255,255,255,.35)');F(-2,17.5,1,1,'#ffffff');F(-0.5,17.5,1,1,'#ffffff');
  g.fillStyle='#ffffff';g.beginPath();g.ellipse(0,5.9,4.5,1.3,0,Math.PI,0);g.fill();F(-4,5.8,8,0.6,'#ffffff');
  g.restore();
}
/* chaque cabine est gravée une fois (par couleur, de jour et de nuit), puis simplement posée */
const CABINES={};
function spriteCabine(col,nuit){const cle=col+(nuit?'n':'j');let C=CABINES[cle];if(C)return C;
  const S=4, W=22, H=34, c=document.createElement('canvas');c.width=W*S;c.height=H*S;const g=c.getContext('2d');g.setTransform(S,0,0,S,0,0);
  oeuf(g,W/2,4,col,0,nuit);return CABINES[cle]={c,W,H,ox:W/2,oy:4};}
function dessinerTelepherique(g,camX,camY,t,nuit){
  const sc=g.getTransform().a||1, Hv=g.canvas.height/sc, Wv=g.canvas.width/sc;
  const x0=TPH.cx-camX, y0=TPH.y-TPH.h+4-camY, yHaut=34-camY;
  if(x0<-40||x0>Wv+40||y0<-40||yHaut>Hv+40)return;                                        /* la ligne n'est pas à l'écran */
  g.fillStyle='#2e3640';[-TPH.ecart,TPH.ecart].forEach(d=>g.fillRect(x0+d-0.25,Math.max(yHaut,-4),0.5,y0-Math.max(yHaut,-4)));
  const cols=['#c0392b','#f0c040','#2d6fb0','#3f9e7a','#e86a8a','#8a4ac0'];
  const n=4, v=0.03, bal=Math.sin(t*1.3)*0.035;
  const poser=(x,y,col,b)=>{if(y<-40||y>Hv+8)return;const C=spriteCabine(col,nuit);g.save();g.translate(x,y);g.rotate(b);g.drawImage(C.c,-C.ox,-C.oy,C.W,C.H);g.restore();};
  for(let k=0;k<n;k++){const u=((t*v+k/n)%1);
    const yU=y0+(yHaut+18-y0)*u, yD=yHaut+18+(y0-(yHaut+18))*u;
    poser(x0+TPH.ecart,yU,cols[k%6],bal);poser(x0-TPH.ecart,yD,cols[(k+3)%6],-bal);}
}
function graverPyloneT(){const W=40,H=TPH.h+30,{c,g,F}=mk(W,H);const cx=W/2,sol=H-4;ombre(g,cx,sol,12,3);
  /* un pylône en treillis d'acier, qui s'effile vers le haut, et sa tête à galets */
  for(let y=0;y<TPH.h+6;y+=0.5){const k=y/(TPH.h+6), w=9-k*5;F(cx-w,sol-y,1,0.5,'#6a7684');F(cx+w-1,sol-y,1,0.5,'#4a5664');}
  for(let y=4;y<TPH.h;y+=7){const k=y/(TPH.h+6), w=9-k*5;g.strokeStyle='#5a6674';g.lineWidth=0.5;g.beginPath();g.moveTo(cx-w,sol-y);g.lineTo(cx+w,sol-y-7);g.moveTo(cx+w,sol-y);g.lineTo(cx-w,sol-y-7);g.stroke();}
  F(cx-TPH.ecart-4,sol-TPH.h-8,2*TPH.ecart+8,3,'#3a4654');F(cx-TPH.ecart-4,sol-TPH.h-9,2*TPH.ecart+8,1,'#ffffff');
  F(cx-8,sol-2,16,3,'#9a9690');F(cx-8,sol-2,16,0.5,'#c4c0b8');
  return {c,W,H,sol};}
/* LA BOUCHE DU MÉTRO, EN LONG (comme sur le croquis) : un large escalier qui descend sous un long auvent
   de bois, chargé de neige ; la plaque au milieu, un M à chaque bout, des lanternes sous l'auvent */
function graverBoucheLongue(nuit){
  /* LA TRÉMIE DU MÉTRO, À LA MONTAGNE : une margelle de pierre, une rambarde de fer,
     la plaque émaillée en hauteur, l'escalier qui descend dans le noir. */
  const W=90,H=64,{c,g,F}=mk(W,H);const cx=W/2,sol=H-6;
  ombre(g,cx,sol,26,4);
  /* l'escalier */
  F(cx-15,sol-16,30,16,'#141a20');
  for(let i=0;i<5;i++){const y=sol-15+i*3, w=26-i*1.2;
    F(cx-w/2,y,w,1.6,nuit?'#46515c':'#3d4650');F(cx-w/2,y,w,0.5,nuit?'#6c7784':'#5c6772');}
  F(cx-15,sol-17,30,1.5,'#98a0aa');
  /* la margelle de pierre, de chaque côté */
  [[-17],[17]].forEach(([d])=>{for(let y=sol-18;y<sol;y+=4)
    for(let x=cx+d-3;x<cx+d+3;x+=3)F(x,y,3,3.6,hs(x+y)<.5?'#9ba3ad':'#aab2bc');
    F(cx+d-3,sol-19,6,1.2,'#c2cad4');F(cx+d-3,sol-1,6,1,'#6e7680');});
  F(cx-20,sol-19,40,2,'#b8c0ca');F(cx-20,sol-19,40,0.6,'#d6dee6');F(cx-20,sol-1,40,1.5,'#6e7680');
  /* la rambarde : deux montants, deux lisses, des barreaux */
  [[-17],[17]].forEach(([d])=>{F(cx+d-0.8,sol-31,1.6,13,'#39454f');F(cx+d-0.4,sol-31,0.6,13,'#66727e');
    F(cx+d-2.4,sol-32.4,4.8,1.6,'#5c6772');});
  F(cx-18,sol-29,36,1.3,'#39454f');F(cx-18,sol-29,36,0.4,'#66727e');F(cx-18,sol-24.5,36,1,'#39454f');
  for(let x=cx-16;x<cx+16;x+=4)F(x,sol-29,0.8,9,'#39454f');
  /* la plaque émaillée, au-dessus */
  F(cx-15,sol-40,30,7,'#12406e');F(cx-14,sol-39,28,5,'#1d5b96');F(cx-14,sol-39,28,1,'#4d87c8');
  g.font='700 4px Georgia';g.textAlign='center';g.fillStyle='#eaf4fb';g.fillText('LA MONTAGNE',cx,sol-34.4,26);g.textAlign='left';
  /* le totem M, planté à gauche */
  F(cx-25,sol-22,1.8,22,'#39454f');F(cx-29,sol-31,10,9,'#1d5b96');F(cx-29,sol-31,10,1,'#4d87c8');
  g.font='700 7px Arial';g.textAlign='center';g.fillStyle='#ffffff';g.fillText('M',cx-24,sol-24);g.textAlign='left';
  /* la neige : sur la margelle, sur la lisse, et la congère au pied */
  for(let x=cx-21;x<cx+21;x++){const e=1.2+Math.abs(Math.sin(x/5))*1.1+hs(x)*0.8;F(x,sol-20.5,1,e,'#f2f9fd');}
  for(let x=cx-18;x<cx+18;x+=1)if(hs(x)<0.6)F(x,sol-30,1,0.8,'#eef6fb');
  g.fillStyle='#e7f0f8';g.beginPath();g.moveTo(cx-26,sol+2);g.quadraticCurveTo(cx-12,sol-2.5,cx,sol-0.5);
  g.quadraticCurveTo(cx+12,sol-2.5,cx+26,sol+2);g.lineTo(cx+26,sol+4);g.lineTo(cx-26,sol+4);g.closePath();g.fill();
  g.fillStyle='#ffffff';g.beginPath();g.moveTo(cx-21,sol+1.2);g.quadraticCurveTo(cx,sol-1.4,cx+21,sol+1.2);
  g.lineTo(cx+21,sol+2.2);g.lineTo(cx-21,sol+2.2);g.closePath();g.fill();
  if(nuit){const gl=g.createRadialGradient(cx,sol-18,2,cx,sol-18,26);
    gl.addColorStop(0,'rgba(255,224,150,.22)');gl.addColorStop(1,'rgba(255,224,150,0)');g.fillStyle=gl;g.fillRect(cx-28,sol-44,56,48);}
  return {c,W,H,sol};
}
/* LA PLACE, HABILLÉE : un grand foyer de pierre au centre, ses bancs à plaids en rond, quatre
   lampadaires aux coins reliés par des guirlandes, des transats face au soleil, des bacs de bruyère */
function graverFoyer(){
  const W=46,H=32,{c,g,F}=mk(W,H);const cx=W/2,sol=H-6;ombre(g,cx,sol,21,4);
  g.fillStyle='#5f5a52';g.beginPath();g.ellipse(cx,sol-3.5,18,7.5,0,0,7);g.fill();
  /* les pierres du cercle, une par une : face claire en haut, ombre en bas, un peu de neige posée */
  for(let k=0;k<20;k++){const a=k/20*6.283, x=cx+Math.cos(a)*16, y=sol-4+Math.sin(a)*6.4, w=3.5+hs(k)*1.5, t=hs(k*3);
    F(x-w/2,y-2,w,3,t<0.4?'#8a847a':(t<0.7?'#9a948a':'#7e786e'));F(x-w/2,y-2,w,0.5,'#c8c2b6');F(x-w/2,y+0.5,w,0.5,'#5a554c');F(x-w/2+0.5,y-1.5,0.5,0.5,'#d8d2c6');
    if(Math.sin(a)<-0.2&&hs(k*5)<0.6)F(x-w/2+0.5,y-2.5,w-1,0.5,'#ffffff');}
  g.fillStyle='#241a12';g.beginPath();g.ellipse(cx,sol-4.5,12.5,4.8,0,0,7);g.fill();
  for(let k=0;k<40;k++){const x=cx-10+hs(k)*20, y=sol-6.5+hs(k*3)*4;F(x,y,0.5+hs(k*9)*1,0.5,['#e8602a','#ffb040','#c8401a','#ff8a3a'][k%4]);}   /* les braises, en grains */
  [[-6,-1.5,0.45],[5,0,-0.55],[0,1.2,0.08]].forEach(([dx,dy,a])=>{g.save();g.translate(cx+dx,sol-5+dy);g.rotate(a);
    F(-7,-1.2,14,2.6,'#5b3f21');F(-7,-1.2,14,0.5,'#8a6238');F(-7,1,14,0.4,'#3a2614');F(-7.5,-1.2,1,2.6,'#c8a070');F(-7.25,-0.6,0.5,1.2,'#8a6238');   /* l'écorce, la section claire, ses cernes */
    F(4,-1,2,0.5,'#e8602a');g.restore();});
  return {c,W,H,sol};}
function graverBancPlaid(v){
  const W=36,H=20,{c,g,F}=mk(W,H);const cx=W/2,sol=H-3;ombre(g,cx,sol,15,2);
  /* les pieds de fonte, les lattes du dossier et de l'assise, les boulons */
  [[-13],[11]].forEach(([k])=>{F(cx+k,sol-4,2,4,'#2e2e34');F(cx+k,sol-4,0.5,4,'#5a5a62');F(cx+k-0.5,sol-0.5,3,0.5,'#1a1a1e');F(cx+k,sol-11,2,6,'#2e2e34');});
  for(let r=0;r<3;r++){const y=sol-11+r*1.6;F(cx-15,y,30,1.2,r%2?'#a07848':'#8a6238');F(cx-15,y,30,0.4,'#c8a070');}           /* le dossier */
  for(let r=0;r<3;r++){const y=sol-6+r*1.3;F(cx-15,y,30,1.1,r%2?'#96703f':'#a07848');F(cx-15,y,30,0.4,'#caa274');}           /* l'assise */
  [[-12],[12]].forEach(([k])=>{F(cx+k,sol-10.5,0.5,0.5,'#1a1a1e');F(cx+k,sol-5.5,0.5,0.5,'#1a1a1e');});
  /* le plaid, plié en deux sur l'assise : un vrai tartan, franges comprises */
  const pl=[['#a8342a','#1f3a2a','#e8d8b0'],['#2d4f7a','#6a2a2a','#e8d8b0'],['#3a6a44','#a8342a','#f0e0b8']][v%3];
  const px=cx-5+v*2.5, py=sol-8.5;F(px,py,11,5,pl[0]);
  for(let k=0;k<11;k+=2.5){F(px+k,py,0.8,5,pl[1]);F(px+k+1.2,py,0.3,5,pl[2]);}for(let k=0;k<5;k+=2){F(px,py+k,11,0.6,pl[1]);F(px,py+k+0.8,11,0.3,pl[2]);}
  F(px,py,11,0.5,'rgba(255,255,255,.2)');for(let k=0;k<11;k+=1)F(px+k,py+5,0.4,1,pl[0]);                                  /* les franges */
  return {c,W,H,sol};}
function graverTransat(v){
  const W=20,H=24,{c,g,F}=mk(W,H);const cx=W/2,sol=H-3;ombre(g,cx,sol,8,2);
  const toile=[['#c0392b','#f4efe0'],['#2d6fb0','#f4efe0'],['#e8a030','#f4efe0']][v%3];
  /* le cadre de hêtre, ses articulations, la toile rayée qui se creuse, le coussin */
  [[-6.5],[5.5]].forEach(([k])=>{F(cx+k,sol-15,1,15,'#9a7040');F(cx+k,sol-15,0.4,15,'#c8a070');F(cx+k,sol-8,1,0.8,'#5a3a1e');});
  F(cx-6.5,sol-2,12,1,'#8a6238');F(cx-6.5,sol-15,12,1,'#8a6238');F(cx-6.5,sol-15,12,0.4,'#c8a070');
  for(let y=0;y<12.5;y+=0.5){const creux=Math.sin(y/12.5*Math.PI)*0.8;F(cx-5.5+creux*0.2,sol-14+y,11-creux*0.4,0.5,(Math.floor(y/1.5)%2)?toile[0]:toile[1]);}
  g.fillStyle='rgba(0,0,0,.12)';g.fillRect(cx-5.5,sol-9,11,5);
  F(cx-3.5,sol-13,7,3,'#ece4d4');F(cx-3.5,sol-13,7,0.5,'#ffffff');F(cx-3.5,sol-10.5,7,0.5,'#c8bca8');
  return {c,W,H,sol};}
function graverBac(){
  const W=28,H=20,{c,g,F}=mk(W,H);const cx=W/2,sol=H-3;ombre(g,cx,sol,12,2);
  for(let k=-12;k<12;k+=3){F(cx+k,sol-8,3,8,k%6?'#7d5934':'#6b4a28');F(cx+k,sol-8,0.5,8,'#a07848');F(cx+k+2.5,sol-8,0.5,8,'#4a321a');}
  F(cx-12.5,sol-8.5,25,1,'#8a6238');F(cx-12.5,sol-8.5,25,0.4,'#c8a070');F(cx-12,sol-2,24,0.5,'#2e2e34');F(cx-12,sol-6,24,0.5,'#2e2e34');   /* les cerclages */
  for(let k=0;k<44;k++){const x=cx-11+hs(k)*22, h=2+hs(k*3)*4;F(x,sol-8.5-h,0.5,h,'#4f6a3a');
    for(let f=0;f<h;f+=1)F(x+(f%2?0.5:-0.5),sol-8.5-h+f,0.5,0.5,hs(k*5+f)<0.5?'#b05a9a':'#d07ab8');F(x,sol-8.5-h,0.5,0.5,'#f0b0e0');}
  for(let k=0;k<6;k++)F(cx-10+hs(k*7)*20,sol-10-hs(k*9)*3,1.5,0.5,'#ffffff');
  return {c,W,H,sol};}
function graverPanneauAlt(){
  const W=42,H=36,{c,g,F}=mk(W,H);const cx=W/2,sol=H-3;ombre(g,cx,sol,11,2);
  F(cx-1.5,sol-23,3,23,'#5b3f21');F(cx-1.5,sol-23,1,23,'#7d5934');F(cx+1,sol-23,0.5,23,'#3a2614');
  F(cx-18,sol-32,36,12,'#6b4a28');F(cx-17,sol-31,34,10,'#8a6238');for(let k=0;k<10;k+=2.5)F(cx-17,sol-31+k,34,0.4,'rgba(60,35,15,.3)');
  F(cx-18,sol-32,36,0.5,'#a5764a');F(cx-18.5,sol-33,37,1.5,'#ffffff');[[-16],[15.5]].forEach(([k])=>{F(cx+k,sol-30,0.5,0.5,'#2e2218');F(cx+k,sol-22.5,0.5,0.5,'#2e2218');});
  g.font='700 5px Georgia';g.textAlign='center';g.fillStyle='#e8d0a0';g.fillText('LA MONTAGNE',cx+0.4,sol-25.1,30);g.fillStyle='#2a1a0e';g.fillText('LA MONTAGNE',cx,sol-25.5,30);
  g.font='italic 700 3.6px Georgia';g.fillStyle='#2a1a0e';g.fillText('— 1 850 m —',cx,sol-21.6,30);g.textAlign='left';
  return {c,W,H,sol};}
function graverLampadaireFin(){
  const W=18,H=54,{c,g,F}=mk(W,H);const cx=W/2,sol=H-3;ombre(g,cx,sol,5,2);
  F(cx-2.5,sol-3,5,3,'#2a2e36');F(cx-2.5,sol-3,5,0.5,'#5a5e66');F(cx-2,sol-4,4,1,'#3a3e46');
  F(cx-0.75,sol-32,1.5,28,'#2a2e36');F(cx-0.75,sol-32,0.5,28,'#6a6e76');for(let y=sol-28;y<sol-6;y+=6)F(cx-1.25,y,2.5,0.8,'#3a3e46');   /* le fût cannelé, ses bagues */
  F(cx-3.5,sol-42,7,10,'#2a2e36');F(cx-3,sol-41.5,6,9,'#e8dcb0');F(cx-0.25,sol-41.5,0.5,9,'#2a2e36');F(cx-3,sol-37.25,6,0.5,'#2a2e36');   /* la lanterne, ses vitres */
  F(cx-2.5,sol-41,1,4,'rgba(255,255,255,.7)');F(cx-4,sol-43,8,1.5,'#2a2e36');F(cx-3,sol-44.5,6,1.5,'#2a2e36');F(cx-0.5,sol-46,1,1.5,'#2a2e36');
  F(cx-4,sol-44,8,1,'#ffffff');F(cx-1,sol-46.5,2,0.5,'#ffffff');
  /* LA NEIGE POSÉE SUR LE CHAPEAU, LE HALO CHAUD ET LA GIVRE SUR LE FÛT */
  for(let x=cx-4.5;x<cx+4.5;x++){const e=1+Math.abs(Math.sin(x))*0.8;F(x,sol-45.5,1,e,'#f4fafd');}
  F(cx-3,sol-33,6,1,'#f0e4b8');F(cx-2.5,sol-41.5,1,9,'rgba(255,255,255,.55)');
  {const gl=g.createRadialGradient(cx,sol-37,1,cx,sol-37,16);
   gl.addColorStop(0,'rgba(255,224,150,.30)');gl.addColorStop(1,'rgba(255,224,150,0)');
   g.fillStyle=gl;g.fillRect(cx-16,sol-53,32,32);}
  F(cx-1.25,sol-14,2.5,1,'#cfe0ee');F(cx-1.25,sol-22,2.5,1,'#cfe0ee');
  return {c,W,H,sol,lampe:[cx,sol-37]};}
/* LES GUIRLANDES entre les lampadaires, et le feu du foyer : vivants */
let LUEUR=null;
function lueurDuFeu(){if(LUEUR)return LUEUR;const c=document.createElement('canvas');c.width=c.height=136;const q=c.getContext('2d');
  const gl=q.createRadialGradient(68,68,2,68,68,68);gl.addColorStop(0,'rgba(255,170,70,.35)');gl.addColorStop(1,'rgba(255,170,70,0)');q.fillStyle=gl;q.fillRect(0,0,136,136);return LUEUR=c;}
function dessinerPlace(g,camX,camY,t,nuit){
  {const sc=g.getTransform().a||1, Hv=g.canvas.height/sc, Wv=g.canvas.width/sc;
   if(COUR.x0-camX>Wv+20||COUR.x1-camX<-20||COUR.y0-60-camY>Hv||COUR.y1-camY<-20)return;}   /* la place n'est pas à l'écran */
  const P={x:COUR.x0+6,y:COUR.y0+4,w:COUR.x1-COUR.x0-12,h:COUR.y1-COUR.y0-6}, coins=[[P.x+12,P.y+14],[P.x+P.w-12,P.y+14],[P.x+P.w-12,P.y+P.h-4],[P.x+12,P.y+P.h-4]];
  const tete=(a)=>[a[0]-camX,a[1]-34-camY];
  const guirlande=(a,b,k0)=>{const [x1,y1]=tete(a),[x2,y2]=tete(b);g.strokeStyle='rgba(40,30,20,.7)';g.lineWidth=0.4;g.beginPath();g.moveTo(x1,y1);
    g.quadraticCurveTo((x1+x2)/2,(y1+y2)/2+10,x2,y2);g.stroke();
    for(let k=1;k<14;k++){const u=k/14, x=(1-u)*(1-u)*x1+2*(1-u)*u*(x1+x2)/2+u*u*x2, y=(1-u)*(1-u)*y1+2*(1-u)*u*((y1+y2)/2+10)+u*u*y2;
      const on=Math.sin(t*2.4+k*1.3+k0)>-0.3;g.fillStyle='#2a2a2a';g.fillRect(x-0.25,y-0.5,0.5,0.5);g.fillStyle=on?['#ffd27a','#ff8a7a','#8ad0ff','#b8ff9a'][(k+k0)%4]:'rgba(90,80,70,.8)';g.fillRect(x-0.5,y,1,1.5);if(on){g.fillStyle='rgba(255,255,255,.8)';g.fillRect(x-0.25,y+0.25,0.5,0.5);}
      if(on&&nuit){g.fillStyle='rgba(255,220,140,.18)';g.fillRect(x-2,y-1.5,4,4);}}};
  guirlande(coins[0],coins[1],1);guirlande(coins[1],coins[2],2);guirlande(coins[2],coins[3],3);guirlande(coins[3],coins[0],0);   /* tout le tour de la place */
  /* les flammes du foyer */
  const fx=P.x+P.w/2-camX, fy=P.y+P.h/2+6-camY;
  for(let k=0;k<26;k++){const q=((t*1.8+k/26)%1);g.globalAlpha=(1-q)*0.95;g.fillStyle=q<0.25?'#fff4b0':(q<0.5?'#ffc050':(q<0.75?'#ff8030':'#d84a20'));const w=Math.max(0.5,(1-q)*1.5);g.fillRect(fx-6+Math.sin(t*7+k*2)*3.5+(k%6)*2,fy-8-q*15,w,w*1.4);}
  for(let k=0;k<5;k++){const q=((t*1.2+k/5)%1);g.globalAlpha=1-q;g.fillStyle='#ffd070';g.fillRect(fx-4+Math.sin(k*3+t*2)*5,fy-12-q*24,0.5,0.5);}   /* les étincelles */
  g.globalAlpha=1;{const R=nuit?34:20;g.drawImage(lueurDuFeu(),fx-R,fy-10-R,R*2,R*2);}
  for(let k=0;k<3;k++){const q=((t*0.4+k/3)%1);g.globalAlpha=(1-q)*0.35;g.fillStyle='#d8dce2';g.beginPath();g.ellipse(fx+Math.sin(q*5+k)*3,fy-22-q*26,2+q*4,1.5+q*3,0,0,7);g.fill();}
  g.globalAlpha=1;
}
/* LE PORTIQUE D'ENTRÉE DE LA FILE : deux poteaux de bois, une traverse, l'enseigne TÉLÉCABINE,
   un fanion, et le petit panneau du temps d'attente */
function graverPortique(){
  const W=34,H=46,{c,g,F}=mk(W,H);const cx=W/2,sol=H-3;
  /* deux poteaux de mélèze, leur fibre, leurs sabots de fer, la neige à leur pied */
  [[-11],[10]].forEach(([k])=>{F(cx+k,sol-35,2.5,35,'#6b4a28');F(cx+k,sol-35,0.8,35,'#8a6238');F(cx+k+2,sol-35,0.5,35,'#3a2614');
    for(let y=sol-33;y<sol-3;y+=3)F(cx+k+1,y+hs(y+k)*2,0.5,1.5,'#5a3a1e');F(cx+k-0.5,sol-4,3.5,2,'#3a3a40');F(cx+k-0.5,sol-4,3.5,0.5,'#6a6e76');F(cx+k-1,sol-1,4.5,1.5,'#ffffff');});
  /* la traverse, ses chevilles, la neige et les glaçons */
  F(cx-14,sol-39,28,4.5,'#7d5934');F(cx-14,sol-39,28,0.8,'#a5764a');F(cx-14,sol-35,28,0.5,'#4a321a');for(let k=-13;k<14;k+=4)F(cx+k,sol-38,0.5,3,'rgba(90,55,25,.4)');
  F(cx-12,sol-37.5,1,1,'#3a2614');F(cx+11,sol-37.5,1,1,'#3a2614');F(cx-14.5,sol-40.5,29,1.8,'#ffffff');F(cx-14,sol-40.8,20,0.5,'#f0f6fa');
  for(let k=-13;k<14;k+=2)F(cx+k,sol-34.5,0.5,0.8+hs(k)*2.2,'rgba(220,244,255,.95)');
  /* l'enseigne : deux chaînettes, un panneau émaillé bleu, un liseré blanc */
  F(cx-7,sol-34.5,0.5,2,'#6a6e76');F(cx+6.5,sol-34.5,0.5,2,'#6a6e76');
  F(cx-11,sol-33,22,6.5,'#12356a');F(cx-10.5,sol-32.5,21,5.5,'#1d3f6a');F(cx-10,sol-32,20,0.4,'#e9e6db');F(cx-10,sol-27.4,20,0.4,'#e9e6db');
  g.font='700 3.4px Georgia';g.textAlign='center';g.fillStyle='#ffffff';g.fillText('TÉLÉCABINE',cx,sol-28.6,19);g.textAlign='left';
  /* le fanion vert sur son mât */
  F(cx+12.5,sol-46,0.5,8,'#3a3a40');F(cx+13,sol-46,5,3,'#3f9e7a');F(cx+13,sol-46,5,0.6,'#6fce9a');F(cx+17,sol-45,1,1,'#2f7a5e');
  /* le petit panneau « attente » : cadre, cadran, aiguille */
  F(cx-14.5,sol-15,0.5,15,'#5b3f21');F(cx-17,sol-21,5.5,6.5,'#5b3f21');F(cx-16.5,sol-20.5,4.5,5.5,'#f4efe0');
  g.strokeStyle='#3a2616';g.lineWidth=0.35;g.beginPath();g.arc(cx-14.25,sol-17.75,1.6,0,7);g.stroke();g.beginPath();g.moveTo(cx-14.25,sol-17.75);g.lineTo(cx-14.25,sol-19);g.moveTo(cx-14.25,sol-17.75);g.lineTo(cx-13.3,sol-17.2);g.stroke();
  return {c,W,H,sol};}
/* L'ÉCOLE DE SKI : un chalet peint en rouge, volets et chaînages blancs, un flocon sur l'enseigne,
   une guirlande de fanions sur le faîtage, le tableau des cours, un râtelier de petits skis */
function graverEcoleSki(nuit){
  const W=96,H=92,{c,g,F}=mk(W,H);const cx=W/2,sol=H-5;ombre(g,cx,sol,42,6);
  soubassement(F,cx-38,sol-8,76,8);
  for(let k=-38;k<38;k+=3){F(cx+k,sol-40,3,32,(k/3)%2?'#b8392c':'#a8322a');F(cx+k,sol-40,0.5,32,'#d8584a');F(cx+k+2.5,sol-40,0.5,32,'#7a2018');}
  F(cx-40,sol-40,3,32,'#f4efe0');F(cx+37,sol-40,3,32,'#f4efe0');for(let y=sol-40;y<sol-8;y+=4){F(cx-40,y,3,0.5,'#c8bca8');F(cx+37,y,3,0.5,'#c8bca8');}
  toitNeige(F,g,cx,sol-40,92,26,['#5a4a3e','#6a5a4c','#3e3228']);
  const fan=['#c0392b','#f4efe0','#2d6fb0','#f0c040','#3f9e7a'];
  [[-1],[1]].forEach(([sgn])=>{
    g.strokeStyle='#3a3a40';g.lineWidth=0.3;g.beginPath();g.moveTo(cx,sol-67);g.quadraticCurveTo(cx+sgn*22,sol-51,cx+sgn*44,sol-43);g.stroke();
    for(let k=0;k<9;k++){const u=(k+0.5)/9, x=(1-u)*(1-u)*cx+2*(1-u)*u*(cx+sgn*22)+u*u*(cx+sgn*44), y=(1-u)*(1-u)*(sol-67)+2*(1-u)*u*(sol-51)+u*u*(sol-43);
      g.fillStyle=fan[(k+(sgn>0?2:0))%5];g.beginPath();g.moveTo(x-1.6,y);g.lineTo(x+1.6,y);g.lineTo(x,y+3.2);g.closePath();g.fill();}});
  [[-30],[16]].forEach(([k])=>{F(cx+k,sol-33,12,11,'#3a2014');F(cx+k+0.5,sol-32.5,11,10,nuit?'#f0c060':'#3a5a7a');F(cx+k+5.75,sol-32.5,0.5,10,'#f4efe0');F(cx+k+0.5,sol-27.75,11,0.5,'#f4efe0');
    if(!nuit)F(cx+k+1,sol-32,3,0.5,'rgba(255,255,255,.6)');F(cx+k-3,sol-33,2.5,11,'#f4efe0');F(cx+k+12.5,sol-33,2.5,11,'#f4efe0');F(cx+k-1,sol-21.5,14,1.5,'#f4efe0');F(cx+k-1,sol-22.5,14,1,'#ffffff');});
  F(cx-7,sol-26,14,18,'#3a2014');F(cx-6.5,sol-25.5,6,17,nuit?'#e8b860':'#4a6a8a');F(cx+0.5,sol-25.5,6,17,nuit?'#e8b860':'#4a6a8a');F(cx-0.5,sol-25.5,1,17,'#3a2014');
  F(cx-2,sol-17,1,1.5,'#f0cf7d');F(cx+1,sol-17,1,1.5,'#f0cf7d');F(cx-9,sol-28,18,2,'#f4efe0');F(cx-9,sol-28.8,18,0.8,'#ffffff');
  F(cx-30,sol-46,60,9,'#12356a');F(cx-29.5,sol-45.5,59,8,'#1d3f6a');F(cx-29.5,sol-45.5,59,0.5,'#4d7fc8');
  const flocon=(x,y)=>{g.strokeStyle='#ffffff';g.lineWidth=0.5;for(let a=0;a<6;a++){const an=a*Math.PI/3;g.beginPath();g.moveTo(x,y);g.lineTo(x+Math.cos(an)*3,y+Math.sin(an)*3);g.stroke();}};
  flocon(cx-24,sol-41.5);flocon(cx+24,sol-41.5);
  g.font='700 4.6px Georgia';g.textAlign='center';g.fillStyle='#ffffff';g.fillText('ÉCOLE DE SKI',cx,sol-39.8,40);g.textAlign='left';
  F(cx-38,sol-21,13,13,'#5b3f21');F(cx-37.5,sol-20.5,12,12,'#f4efe0');
  ['#3f9e7a','#2d6fb0','#c0392b','#1a1a1e'].forEach((col,k)=>{F(cx-36.5,sol-19+k*2.6,2,2,col);F(cx-34,sol-18.5+k*2.6,7,0.6,'#8a7a5a');});
  F(cx+26,sol-4,14,1.2,'#6b4a28');F(cx+26,sol-11,14,1.2,'#6b4a28');
  for(let k=0;k<5;k++){F(cx+27+k*2.6,sol-15,1.2,14,['#c0392b','#f0c040','#2d6fb0','#e86a8a','#3f9e7a'][k]);F(cx+27+k*2.6,sol-15.5,1.2,0.8,'#ffffff');}
  return {c,W,H,sol};}
/* LE MONITEUR : combinaison rouge, bonnet blanc, lunettes sur le front, bâtons plantés, skis aux pieds */
function graverMoniteur(){
  const W=26,H=46,{c,g,F}=mk(W,H);const cx=W/2,sol=H-3;ombre(g,cx,sol,8,2);
  F(cx-9,sol-1,18,1,'#c0392b');F(cx-9,sol+0.5,18,0.8,'#8a2418');F(cx-9.5,sol-1.5,1.5,1,'#c0392b');
  F(cx-3,sol-15,2.6,14,'#a02a20');F(cx+0.4,sol-15,2.6,14,'#b8352a');F(cx-3.2,sol-3,3,2,'#2a2a30');F(cx+0.2,sol-3,3,2,'#2a2a30');
  F(cx-4.5,sol-29,9,15,'#c0392b');F(cx-4.5,sol-29,9,0.8,'#e05a4a');F(cx-4.5,sol-22,9,1,'#f4efe0');F(cx-0.25,sol-28,0.5,13,'#8a2418');
  F(cx-7,sol-28,2.6,11,'#b8352a');F(cx+4.4,sol-28,2.6,11,'#b8352a');F(cx-7,sol-18,2.6,2,'#2a2a30');F(cx+4.4,sol-18,2.6,2,'#2a2a30');
  F(cx-2.2,sol-33,4.4,4.5,'#e8bd92');F(cx-1.2,sol-31.5,0.8,0.8,'#2a1a10');F(cx+0.6,sol-31.5,0.8,0.8,'#2a1a10');F(cx-0.8,sol-29.8,1.6,0.5,'#a8604a');
  F(cx-2.8,sol-37,5.6,4,'#f4efe0');F(cx-2.8,sol-37,5.6,0.6,'#ffffff');F(cx-0.8,sol-38.5,1.6,1.6,'#c0392b');
  F(cx-2.6,sol-34,5.2,1.3,'#2d6fb0');F(cx-2,sol-33.8,1.5,0.6,'#a8d8ff');
  F(cx-8,sol-19,0.8,18,'#8a8f96');F(cx+7.2,sol-19,0.8,18,'#8a8f96');F(cx-8.6,sol-2,2,0.6,'#3a3a40');F(cx+6.6,sol-2,2,0.6,'#3a3a40');
  return {c,W,H,sol};}
function graverPiquet(rouge){const W=6,H=18,{c,g,F}=mk(W,H);const cx=3,sol=H-2;
  F(cx-0.5,sol-14,1,14,rouge?'#c0392b':'#2d6fb0');for(let y=sol-14;y<sol;y+=3)F(cx-0.5,y,1,1.2,'#ffffff');F(cx-1.5,sol-0.5,3,1,'#ffffff');return {c,W,H,sol};}
function graverPanneauEcole(){const W=34,H=30,{c,g,F}=mk(W,H);const cx=W/2,sol=H-3;
  F(cx-0.75,sol-18,1.5,18,'#5b3f21');F(cx-15,sol-26,30,9,'#1d3f6a');F(cx-15,sol-26,30,0.5,'#4d7fc8');F(cx-15.5,sol-27,31,1.2,'#ffffff');
  g.font='700 3.2px Georgia';g.textAlign='center';g.fillStyle='#fff';g.fillText('JARDIN DES NEIGES',cx,sol-21.3,28);g.textAlign='left';return {c,W,H,sol};}
function graverPorteMine(){const W=56,H=10,{c,g,F}=mk(W,H);F(0,H-3,W,3,'rgba(40,30,20,.18)');return {c,W,H,sol:H};}
function objetsVides(){
  /* LA MONTAGNE, DÉPOUILLÉE : il ne reste que le fond avec la mine, la neige,
     et la bouche du métro. Tout le reste (chalets, cour, école, boutiques,
     lampadaires, bancs) est déposé. */
  const cal={}, L=[];
  const reg=(nom,J,N)=>{cal[nom]={toile:J.c,W:J.W,H:J.H,sol:J.sol,nuit:N?N.c:null};};
  reg('gare',graverBoucheLongue(false),graverBoucheLongue(true));
  L.push({t:'x_mo_gare',x:180,y:WH-30,v:0,bati:true,demi:42,ouvre:'metro',col:[42,10]});
  reg('galerie',graverPorteMine());
  L.push({t:'x_mo_galerie',x:180,y:MONT+16,v:0,bati:true,demi:26,ferme:'La galerie du Puits n°1',col:[26,4]});
  return {L,cal};
}
const zoneInterdite=(x,y)=>{
  if(y<MONT+8)return true;                                                                        /* les montagnes, au fond */
  /* (plus de bande de patinoire) */                                                                   /* la bande de la patinoire */
  /* PLUS DE REMONTÉES : la file, le couloir sous les câbles et l'enclos de la gare ne bloquent plus.
     On marche partout sur le carreau. */
  return false;};
const surGlace=(x,y)=>false;const surGlaceAncien=(x,y)=>{const P=PATIN, cx=Math.max(P.x0+P.r,Math.min(P.x1-P.r,x)), cy=Math.max(P.y0+P.r,Math.min(P.y1-P.r,y));return Math.hypot(x-cx,y-cy)<=P.r-4;};
const surBande=(x,y)=>false;const surBandeAncien=(x,y)=>{const P=PATIN, cx=Math.max(P.x0+P.r,Math.min(P.x1-P.r,x)), cy=Math.max(P.y0+P.r,Math.min(P.y1-P.r,y)), d=Math.hypot(x-cx,y-cy)-(P.r-2);
  if(Math.abs(d)>2.6)return false;if(y<P.y0+8&&x>P.porte[0]+2&&x<P.porte[1]-2)return false;return true;};
const dansNeige=(x,y)=>{if(surGlace(x,y))return false;if(y>ESC_Y-2&&y<BAS_Y+2)return false;if(false&&x>PLACE.x-3&&x<PLACE.x+PLACE.w+3&&y>PLACE.y-3&&y<PLACE.y+PLACE.h+3)return false;return y>MONT;};
/* =====================================================================
   LE SOMMET — 2 450 m. On y arrive par la télécabine (forfait du jour).
   Le panorama et la mer de nuages ; la gare d'arrivée ; la terrasse
   panoramique et sa longue-vue ; le restaurant d'altitude ; l'entrée de
   la mine des Cimes ; le départ de la piste, pour redescendre à ski.
   ===================================================================== */
const SOMMET=(()=>{
  const SW=320, SH=460, HAUT=118;
  const GARE={x:160,y:430,cx:160}, RESTO={x:252,y:318}, MINE={x:62,y:318}, DEPART={x:246,y:196}, TERR={x0:18,x1:150,y0:132,y1:196};
  function sol(){
    const {c,g,F}=mk(SW,SH);
    /* le ciel, très bleu là-haut */
    const ciel=g.createLinearGradient(0,0,0,HAUT);ciel.addColorStop(0,'#3f78c0');ciel.addColorStop(0.7,'#8fbce4');ciel.addColorStop(1,'#d8e8f4');g.fillStyle=ciel;g.fillRect(0,0,SW,HAUT);
    /* les sommets voisins, qui dépassent de la mer de nuages */
    const pic=(cx,h,w,col,ombreC)=>{g.fillStyle=col;g.beginPath();g.moveTo(cx-w,HAUT-18);g.lineTo(cx-w*0.2,HAUT-18-h*0.8);g.lineTo(cx,HAUT-18-h);g.lineTo(cx+w*0.35,HAUT-18-h*0.7);g.lineTo(cx+w,HAUT-18);g.closePath();g.fill();
      g.fillStyle=ombreC;g.beginPath();g.moveTo(cx,HAUT-18-h);g.lineTo(cx+w*0.35,HAUT-18-h*0.7);g.lineTo(cx+w,HAUT-18);g.lineTo(cx+w*0.1,HAUT-18);g.closePath();g.fill();
      g.fillStyle='#ffffff';g.beginPath();g.moveTo(cx-w*0.32,HAUT-18-h*0.62);g.lineTo(cx-w*0.2,HAUT-18-h*0.8);g.lineTo(cx,HAUT-18-h);g.lineTo(cx+w*0.2,HAUT-18-h*0.8);g.lineTo(cx+w*0.1,HAUT-18-h*0.66);g.lineTo(cx-w*0.05,HAUT-18-h*0.74);g.closePath();g.fill();};
    pic(40,52,46,'#7e94ae','#5f7690');pic(118,76,56,'#8aa0ba','#687e98');pic(210,64,50,'#7e94ae','#5f7690');pic(290,82,52,'#8aa0ba','#687e98');
    /* la mer de nuages, en boules douces, à nos pieds */
    for(let k=0;k<46;k++){const x=hs(k*3.1)*SW, y=HAUT-22+hs(k*7.7)*20, r=10+hs(k)*16;g.fillStyle=k%3?'#f4f8fb':'#e6eef6';g.beginPath();g.ellipse(x,y,r,r*0.45,0,0,7);g.fill();}
    g.fillStyle='rgba(255,255,255,.6)';g.fillRect(0,HAUT-4,SW,4);
    /* le plateau du sommet : neige tassée, rochers qui percent */
    {const T=tampon(g,HAUT,SH);for(let y=HAUT;y<SH;y+=0.5)for(let x=0;x<SW;x+=0.5){const r=Math.sin(x/37+y/51)*0.6+Math.sin(x/17-y/23)*0.3;const t=hs(Math.round(x*2)*0.71+Math.round(y*2)*1.37);
      T.pose(x,y,r<-0.5?(t<0.5?'#e2eaf2':'#dbe4ee'):(r>0.5?'#ffffff':(t<0.5?'#f2f6fa':'#f7fafc')));}T.fin();}
    for(let k=0;k<16;k++){const x=hs(k*9.1)*SW, y=HAUT+30+hs(k*4.3)*(SH-60);if(Math.hypot(x-GARE.x,y-GARE.y)<70||Math.hypot(x-RESTO.x,y-RESTO.y)<60||Math.hypot(x-DEPART.x,y-DEPART.y)<50)continue;
      if(x>TERR.x0-6&&x<TERR.x1+6&&y<TERR.y1+10)continue;const r=5+hs(k)*8;
      g.fillStyle='#6f6e72';g.beginPath();g.ellipse(x,y,r,r*0.55,0,0,7);g.fill();g.fillStyle='#8a898e';g.beginPath();g.ellipse(x-r*0.3,y-r*0.2,r*0.5,r*0.3,0,0,7);g.fill();
      g.fillStyle='#ffffff';g.beginPath();g.ellipse(x-r*0.1,y-r*0.42,r*0.7,r*0.2,0,Math.PI,0);g.fill();}
    /* LA FALAISE DE LA MINE, à gauche : de la roche en strates, une trouée sombre */
    for(let y=HAUT+60;y<MINE.y+4;y+=0.5)for(let x=0;x<MINE.x+38-(y-HAUT-60)*0.05;x+=0.5){const st=Math.floor((y+Math.sin(x/6)*2)/3)%2;F(x,y,0.5,0.5,st?'#6f6e72':'#7e7c80');}
    for(let x=0;x<MINE.x+36;x+=0.5)F(x,HAUT+59,0.5,2+Math.sin(x/5)*0.8,'#ffffff');
    /* les sentiers tassés : de la gare vers la terrasse, le restaurant, la mine, le départ */
    const sentier=(pts)=>{for(let i=0;i<pts.length-1;i++){const [x1,y1]=pts[i],[x2,y2]=pts[i+1],n=Math.hypot(x2-x1,y2-y1);
      for(let s=0;s<n;s+=0.5){const x=x1+(x2-x1)*s/n, y=y1+(y2-y1)*s/n;g.fillStyle='rgba(180,196,214,.22)';g.fillRect(x-5,y-1,10,2);}}};
    sentier([[GARE.x,GARE.y-10],[GARE.x,360],[RESTO.x-10,RESTO.y+8]]);sentier([[GARE.x,360],[MINE.x+20,MINE.y+8]]);
    sentier([[GARE.x,360],[160,240],[DEPART.x,DEPART.y+10]]);sentier([[160,240],[90,TERR.y1+6]]);
    /* LA TERRASSE PANORAMIQUE : des planches, un garde-corps face au vide */
    {const T0=TERR;F(T0.x0,T0.y0,T0.x1-T0.x0,T0.y1-T0.y0,'#4e3218');
     for(let y=T0.y0;y<T0.y1;y+=3)for(let x=T0.x0-20;x<T0.x1;){const l=18+Math.floor(hs(x*0.7+y)*3)*6, px=Math.max(T0.x0,x+((y-T0.y0)/3)%3*6), l2=Math.min(l,T0.x1-px);
       if(l2>0){F(px,y,l2,2.5,['#c09264','#b38456','#cc9f70','#a67a4e'][Math.floor(hs(px*0.37+y*1.3)*4)]);F(px,y,l2,0.5,'rgba(255,236,200,.4)');F(px,y,0.5,3,'#3a2410');}x+=l;}
     for(let x=T0.x0;x<T0.x1;x+=0.5){F(x,T0.y0-6,0.5,1.2,'#6b4a28');F(x,T0.y0-3,0.5,1,'#6b4a28');F(x,T0.y0-6.6,0.5,0.6,'#ffffff');}
     for(let x=T0.x0;x<=T0.x1;x+=12){F(x-0.5,T0.y0-8,1.5,8,'#5b3f21');F(x-0.5,T0.y0-8.5,1.5,1,'#ffffff');}}
    /* la barrière du bout du monde : le vide est là-bas, derrière */
    for(let x=0;x<SW;x+=0.5){F(x,HAUT+2,0.5,1.2,'#6b4a28');F(x,HAUT+5,0.5,1,'#6b4a28');}for(let x=0;x<SW;x+=16){F(x,HAUT,1.5,9,'#5b3f21');F(x,HAUT-0.5,1.5,1,'#ffffff');}
    /* le panneau d'altitude, planté dans la neige */
    F(292,HAUT+30,1.5,16,'#5b3f21');F(272,HAUT+22,42,10,'#1d3f6a');F(272,HAUT+22,42,0.5,'#4d7fc8');F(271,HAUT+21,44,1.2,'#ffffff');
    g.font='700 4px Georgia';g.textAlign='center';g.fillStyle='#fff';g.fillText('SOMMET · 2 450 M',293,HAUT+28.6,40);g.textAlign='left';
    return c;}
  let SOL_M=null;
  /* L'ENTRÉE DE LA MINE : un cadre de bois dans la roche, des rails qui sortent, un wagonnet, une lanterne */
  /* (graverMine est défini plus haut, pour la station et le sommet) */

  /* LE DÉPART DE LA PISTE : un portique rouge, la banderole, deux fanions, le panneau des pistes */
  function graverDepart(){const W=64,H=50,{c,g,F}=mk(W,H);const cx=W/2,sol=H-3;
    [[-22],[20]].forEach(([k])=>{F(cx+k,sol-36,2.5,36,'#c0392b');F(cx+k,sol-36,0.8,36,'#e05a4a');F(cx+k-0.5,sol-1,3.5,1.5,'#ffffff');});
    F(cx-24,sol-40,48,8,'#c0392b');F(cx-24,sol-40,48,1,'#e05a4a');F(cx-25,sol-41.5,50,1.5,'#ffffff');
    g.font='700 4.2px Georgia';g.textAlign='center';g.fillStyle='#fff';g.fillText('DÉPART · PISTE DES CIMES',cx,sol-34.6,44);g.textAlign='left';
    for(let x=cx-20;x<cx+20;x+=4)F(x,sol-1,2,1,'#1a1a1a');                                                               /* la ligne de départ */
    [[-14,'#c0392b'],[12,'#2d6fb0']].forEach(([k,col])=>{F(cx+k,sol-16,0.8,16,'#3a3a40');F(cx+k+0.8,sol-16,5,3.5,col);});
    return {c,W,H,sol};}
  /* LA LONGUE-VUE : un pied de fonte, un tube de laiton, sa monnaie */
  function graverLongueVue(){const W=16,H=26,{c,g,F}=mk(W,H);const cx=W/2,sol=H-2;
    F(cx-3,sol-1,6,1.5,'#2a2e36');F(cx-0.75,sol-12,1.5,11,'#3a3e46');F(cx-2,sol-14,4,3,'#2a2e36');
    g.save();g.translate(cx,sol-15);g.rotate(-0.25);F(-6,-2,11,4,'#c9a24a');F(-6,-2,11,1,'#f0cf7d');F(4,-2.5,2,5,'#8a6a28');F(-7,-1.5,1.5,3,'#1a1a1e');g.restore();
    return {c,W,H,sol};}
  function objets(){const cal={}, L=[];const reg=(nom,J,N)=>{cal[nom]={toile:J.c,W:J.W,H:J.H,sol:J.sol,nuit:N?N.c:null};};
    reg('gareS',graverTelecabine(false),graverTelecabine(true));reg('resto',graverChaletNom('LE 2450','#6b4424'));reg('mine',graverMine(false),graverMine(true));
    reg('depart',graverDepart());reg('vue',graverLongueVue());reg('bancS',graverBancPlaid(0));reg('lampeS',graverLampadaireFin());
    const P=(nom,x,y,x2)=>L.push(Object.assign({t:'x_mo_'+nom,x,y,v:0},x2||{}));
    P('gareS',GARE.x,GARE.y,{col:[44,12],bati:true,demi:10,ouvre:'descenteTC'});
    P('resto',RESTO.x,RESTO.y,{col:[28,12],bati:true,demi:24,ferme:'Le restaurant « Le 2450 »'});
    P('mine',MINE.x,MINE.y,{col:[20,6],bati:true,demi:16,ferme:'La mine des Cimes'});
    P('depart',DEPART.x,DEPART.y,{bati:true,demi:18,ouvre:'pistes'});
    P('vue',60,TERR.y0+10,{col:[3,2],bati:true,demi:4,ouvre:'longuevue'});P('vue',120,TERR.y0+10,{col:[3,2],bati:true,demi:4,ouvre:'longuevue'});
    P('bancS',90,TERR.y1-10,{col:[13,3]});
    [[GARE.x-60,GARE.y-40],[GARE.x+60,GARE.y-40],[160,250],[RESTO.x-40,RESTO.y+14]].forEach(([x,y])=>P('lampeS',x,y,{col:[2,2]}));
    return {L,cal};}
  /* les câbles descendent vers la station ; les cabines arrivent d'en bas, repartent vers le bas */
  function cables(g,camX,camY,t,nuit){const x0=GARE.cx-camX, y0=GARE.y-60-camY, yBas=SH+260-camY;
    const sc=g.getTransform().a||1, Hv=g.canvas.height/sc;if(y0>Hv+40)return;
    g.fillStyle='#2e3640';[-10,10].forEach(d=>g.fillRect(x0+d-0.25,y0,0.5,yBas-y0));
    const cols=['#c0392b','#f0c040','#2d6fb0','#3f9e7a','#e86a8a','#8a4ac0'];
    for(let k=0;k<4;k++){const u=((t*0.03+k/4)%1);
      [[y0+(yBas-y0)*(1-u),10,cols[k%6]],[y0+(yBas-y0)*u,-10,cols[(k+3)%6]]].forEach(([y,d,col])=>{if(y<-40||y>Hv+8)return;const C=spriteCabine(col,nuit);
        g.save();g.translate(x0+d,y);g.rotate(Math.sin(t*1.3)*0.03);g.drawImage(C.c,-C.ox,-C.oy,C.W,C.H);g.restore();});}}
  const zone=(x,y)=>{if(y<HAUT+10)return true;                                                     /* la barrière du bout du monde */
    if(x<MINE.x+36&&y>HAUT+58&&y<MINE.y-2&&!(Math.abs(x-MINE.x)<14&&y>MINE.y-20))return true;          /* la falaise */
    return false;};
  return {WW:SW,WH:SH,objets,solFin:()=>SOL_M||(SOL_M=sol()),zoneInterdite:zone,dansNeige:(x,y)=>y>HAUT&&!(x>TERR.x0&&x<TERR.x1&&y>TERR.y0&&y<TERR.y1),
    surGlace:()=>false,dessinerTelepherique:()=>{},ARRIVEE:[GARE.x+4,GARE.y+14],METRO:null};
})();
return {sommet:SOMMET,WW,WH,surGlace,fond:(f)=>{FOND=f;},dessinerPlace:()=>{},barriere:(b)=>{BARRIERE=b;},zoneInterdite,dansNeige,dessinerTelepherique:()=>{},objets:objetsVides,solFin,LIFT_X,GARE_Y,CABLE_H,ECART,ARRIVEE:[180,WH-64],METRO:null,NEIGE_Y,texture:(t)=>{TEXTURE_NEIGE=t;}};
})()
