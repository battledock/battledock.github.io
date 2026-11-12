/* =====================================================================
   LA FÊTE FORAINE DU PRADO (foire.html) — un lieu à part entière.
   Tout est dessiné en vrai pixel art, à la grille des personnages (un pixel
   du monde = un pixel de sprite) : pas de dégradés lisses, pas de cercles
   flous, des contours sombres, la lumière posée en tramage.
   Au fond, sous le ciel du soir : la grande roue, la ville, Notre-Dame.
   Devant : les baraques en volume, le carrousel, les auto-tamponneuses,
   la barbe à papa, le marchand de ballons, des guirlandes d'ampoules.
   Les jeux se jouent dans leur propre écran (forain.js).
   Chargé par moteur.js (eval direct).
   ===================================================================== */
(()=>{
const W=1800, H=1100, Y0=430;
const CX=900;
const DEPART=[900,1040];
const hA=(x,y,k)=>{let n=((x*73856093)^(y*19349663)^(k*83492791))|0;n=(n^(n>>>13))*1274126177|0;return((n^(n>>>16))>>>0)/4294967296;};
const R=(g,x,y,w,h,c)=>{g.fillStyle=c;g.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h));};
const toile=(w,h,f)=>{const c=document.createElement('canvas');c.width=w;c.height=h;const g=c.getContext('2d');g.imageSmoothingEnabled=false;f(g);return c;};
/* LES OUTILS DU PIXEL ART */
function disque(g,cx,cy,r,c){g.fillStyle=c;for(let y=-r;y<=r;y++){const w=Math.floor(Math.sqrt(r*r-y*y)+.5);g.fillRect(Math.round(cx-w),Math.round(cy+y),w*2+1,1);}}
function anneau(g,cx,cy,r,c,ep){g.fillStyle=c;const n=Math.ceil(r*7);for(let i=0;i<n;i++){const a=i/n*Math.PI*2;g.fillRect(Math.round(cx+Math.cos(a)*r-ep/2),Math.round(cy+Math.sin(a)*r-ep/2),ep,ep);}}
function ligne(g,x0,y0,x1,y1,c,ep){ep=ep||1;g.fillStyle=c;x0=Math.round(x0);y0=Math.round(y0);x1=Math.round(x1);y1=Math.round(y1);const dx=Math.abs(x1-x0),dy=-Math.abs(y1-y0),sx=x0<x1?1:-1,sy=y0<y1?1:-1;let e=dx+dy,n=0;
  for(;;){g.fillRect(x0-(ep>>1),y0-(ep>>1),ep,ep);if((x0===x1&&y0===y1)||n++>4000)break;const e2=2*e;if(e2>=dy){e+=dy;x0+=sx;}if(e2<=dx){e+=dx;y0+=sy;}}}
/* un texte net, en pixels : on l'écrit à part et on ne garde que les pixels francs */
function texte(g,s,x,y,px,c,ombre,al){const w=Math.ceil(s.length*px*.75)+8,h=px+8,t=toile(w,h,q=>{q.font='900 '+px+'px "Baloo 2","Arial Black",Arial,sans-serif';q.textAlign='left';q.textBaseline='middle';q.fillStyle='#000';q.fillText(s,4,h/2+1);});
  const q=t.getContext('2d'),D=q.getImageData(0,0,w,h);let mx=0;for(let i=3;i<D.data.length;i+=4){D.data[i]=D.data[i]>110?255:0;if(D.data[i])mx=Math.max(mx,(i>>2)%w);}
  const coul=(cc)=>{const k=toile(w,h,()=>{});const kq=k.getContext('2d');const E=kq.createImageData(w,h);const n=parseInt(cc.slice(1),16);for(let i=0;i<E.data.length;i+=4){if(D.data[i+3]){E.data[i]=n>>16;E.data[i+1]=n>>8&255;E.data[i+2]=n&255;E.data[i+3]=255;}}kq.putImageData(E,0,0);return k;};
  const tw=mx-3,x0=Math.round(al==='left'?x:x-tw/2)-4,y0=Math.round(y-h/2);
  if(ombre){const o=coul(ombre);g.drawImage(o,x0+1,y0+1);g.drawImage(o,x0,y0+1);}g.drawImage(coul(c),x0,y0);}
/* l'éclat d'une ampoule allumée : une petite croix de lumière, pas un carré flou */
function eclat(g,x,y){g.fillStyle='rgba(255,236,170,.45)';g.fillRect(Math.round(x)-3,Math.round(y),7,1);g.fillRect(Math.round(x),Math.round(y)-3,1,7);g.fillStyle='rgba(255,236,170,.25)';g.fillRect(Math.round(x)-2,Math.round(y)-2,5,5);}
/* le tramage : une couleur posée un pixel sur deux (la lumière, les ombres) */
function trame(g,x,y,w,h,c,dens){g.fillStyle=c;for(let j=0;j<h;j++)for(let i=(j%2);i<w;i+=2)if(dens===undefined||hA(x+i,y+j,77)<dens)g.fillRect(x+i,y+j,1,1);}
/* une flaque de lumière tramée : trois anneaux de densité décroissante */
function flaque(g,cx,cy,rx,ry,c){g.fillStyle=c;for(let y=-ry;y<=ry;y++)for(let x=-rx;x<=rx;x++){const d=(x*x)/(rx*rx)+(y*y)/(ry*ry);if(d>1)continue;const X=cx+x,Y=cy+y;
  const p=d<.25?1:d<.55?((X+Y)%2?1:0):((X%2===0&&Y%2===0)?1:0);if(p)g.fillRect(X,Y,1,1);}}

const P_NUIT={ciel:['#141a4a','#1c1f5a','#2a2468','#3a2a74','#57307c','#7a3a7e','#a2477a','#c85a72','#e8786a','#f89a6a','#ffbd78'],
  pave:['#4a4258','#544a62','#5e546c','#3e3650'],ombre:'#2a2236',contour:'#1a1020'};
const COUL=['#e8302a','#ffd24a','#3a9ad8','#5ec04a','#ff7aa0','#9a6aff','#ff9a2a','#2ab0a0'];
const CAR={x:470,y:800,r:118};
const TAMP={x0:1180,y0:690,x1:1560,y1:900};

/* ---------- LE SOL ET LE CIEL ---------- */
function peindreSol(g){
  /* le ciel en bandes (pas de dégradé lisse) avec une frange tramée entre deux bandes */
  const C=P_NUIT.ciel,bh=Math.ceil(Y0/C.length);for(let i=0;i<C.length;i++){R(g,0,i*bh,W,bh,C[i]);if(i<C.length-1){g.fillStyle=C[i+1];for(let x=0;x<W;x+=2)g.fillRect(x+(i%2),i*bh+bh-2,1,1);for(let x=1;x<W;x+=2)g.fillRect(x,i*bh+bh-1,1,1);}}
  /* les étoiles, la lune */
  for(let i=0;i<170;i++){const x=Math.floor(hA(i,1,3)*W),y=Math.floor(hA(i,2,3)*Y0*.5);const b=hA(i,4,3);R(g,x,y,1,1,b<.7?'#8a90c8':'#ffffff');if(b>.94){R(g,x-1,y,3,1,'#c8ccf0');R(g,x,y-1,1,3,'#c8ccf0');R(g,x,y,1,1,'#fff');}}
  disque(g,1520,92,24,'#3a3a7a');disque(g,1520,92,20,'#f4ecd0');disque(g,1514,86,4,'#d8ccaa');disque(g,1528,98,3,'#d8ccaa');disque(g,1522,82,2,'#d8ccaa');R(g,1507,82,4,8,'#fffaf0');
  /* les collines, Notre-Dame de la Garde sur la plus haute */
  const nx=1380;for(let x=0;x<W;x++){const h=Math.round(80+Math.sin(x/260)*22+Math.max(0,140-Math.abs(x-nx)*.7));R(g,x,Y0-h,1,h,'#2c1c4a');R(g,x,Y0-h,1,1,'#4a2e66');}
  const ny=Y0-226;R(g,nx-24,ny+30,48,32,'#22163c');R(g,nx-12,ny-4,24,36,'#22163c');R(g,nx-7,ny-20,14,18,'#22163c');R(g,nx-4,ny-32,8,14,'#22163c');
  for(let i=0;i<6;i++)R(g,nx-20+i*8,ny+40,3,6,'#ffd27a');for(let i=0;i<3;i++)R(g,nx-8+i*7,ny+6,3,5,'#ffd27a');
  R(g,nx-2,ny-46,4,12,'#ffd24a');R(g,nx-1,ny-49,2,3,'#ffe88a');trame(g,nx-12,ny-56,24,26,'#ffd24a',.22);
  /* la ville au loin : des immeubles et leurs fenêtres allumées */
  for(let i=0;i<64;i++){const x=Math.round(i*29+hA(i,7,1)*10),hb=Math.round(24+hA(i,8,1)*56),wb=Math.round(24+hA(i,9,1)*10),y=Y0-hb;if(Math.abs(x+wb/2-nx)<44)continue;
    R(g,x,y,wb,hb,i%2?'#1e1438':'#241a42');R(g,x,y,wb,1,'#3a2a5a');R(g,x+wb-2,y,2,hb,'#160e2c');
    for(let r=0;r<Math.floor(hb/9);r++)for(let k=0;k<Math.floor(wb/7);k++)if(hA(i*13+k,r,5)<.42)R(g,x+3+k*7,y+4+r*9,3,4,hA(i,k*7+r,6)<.75?'#ffd27a':'#8ac0ff');}
  /* LE SOL : des pavés, un par un, avec leur arête claire et leur ombre */
  R(g,0,Y0,W,H-Y0,P_NUIT.pave[3]);
  for(let y=Y0;y<H;y+=7){const dec=((y-Y0)/7)%2?5:0;for(let x=-dec;x<W;x+=10){const c=P_NUIT.pave[Math.floor(hA(x,y,3)*3)];R(g,x+1,y+1,8,5,c);R(g,x+1,y+1,8,1,'#6a6078');R(g,x+1,y+6,8,1,P_NUIT.ombre);}}
  /* l'allée centrale : un pavage plus clair */
  for(let y=Y0+110;y<H;y+=6)for(let x=CX-84;x<CX+84;x+=12){const o=((y-Y0)/6)%2?6:0;R(g,x+o,y,11,5,hA(x,y,9)<.5?'#7a6a72':'#72626c');R(g,x+o,y,11,1,'#8a7a80');}
  R(g,CX-86,Y0+110,2,H-Y0-110,'#2a2236');R(g,CX+84,Y0+110,2,H-Y0-110,'#2a2236');
  /* le trottoir devant les baraques */
  R(g,0,Y0,W,22,'#6a5e70');for(let x=0;x<W;x+=16){R(g,x,Y0,15,21,hA(x,1,4)<.5?'#726678':'#6a5e70');R(g,x,Y0,15,1,'#8a7e90');}R(g,0,Y0+21,W,2,'#2a2236');
  /* les flaques de lumière chaude, tramées */
  for(const x of [170,430,900,1370,1630])flaque(g,x,Y0+46,120,34,'#7a6276');
  for(const x of [170,430,900,1370,1630])flaque(g,x,Y0+40,70,20,'#8e7080');
  for(const [x,y] of LAMPES)flaque(g,x,y+4,46,16,'#76607a');
  flaque(g,CAR.x,CAR.y+6,150,62,'#7a5a80');flaque(g,(TAMP.x0+TAMP.x1)/2,(TAMP.y0+TAMP.y1)/2+10,240,110,'#4a5a80');
  flaque(g,CX,H-60,120,40,'#9a6a5a');
  /* les confettis, les tickets par terre */
  for(let i=0;i<340;i++){const x=Math.floor(hA(i,21,2)*W),y=Math.floor(Y0+30+hA(i,22,2)*(H-Y0-40));R(g,x,y,1,1,COUL[i%8]);if(i%9===0)R(g,x,y,2,1,COUL[(i+3)%8]);}
  for(let i=0;i<14;i++){const x=Math.floor(hA(i,31,2)*W),y=Math.floor(Y0+40+hA(i,32,2)*(H-Y0-60));R(g,x,y,4,3,'#f2e8d0');R(g,x,y,1,3,'#e8302a');}
  /* LA PISTE DES AUTO-TAMPONNEUSES : un plancher de tôle, une bordure de caoutchouc */
  const tx=TAMP.x0,ty=TAMP.y0,tw=TAMP.x1-TAMP.x0,th=TAMP.y1-TAMP.y0;
  R(g,tx-12,ty-12,tw+24,th+24,P_NUIT.contour);R(g,tx-10,ty-10,tw+20,th+20,'#2a2a3a');
  for(let x=tx-10;x<tx+tw+10;x+=12){R(g,x,ty-10,6,8,'#ffd24a');R(g,x+6,ty-10,6,8,'#1a1a22');}
  for(let y=ty;y<ty+th;y+=16)for(let x=tx;x<tx+tw;x+=16){R(g,x,y,16,16,'#4a5266');R(g,x,y,15,15,'#525a70');R(g,x+2,y+2,2,2,'#6a7288');R(g,x+12,y+12,2,2,'#6a7288');}
  trame(g,tx,ty,tw,th,'#6a7aa8',.18);
  /* l'aire du carrousel : un pavage rond */
  for(let y=-58;y<=58;y++){const w=Math.round(Math.sqrt(1-(y*y)/(58*58))*156);R(g,CAR.x-w,CAR.y+12+y,w*2,1,(y%4===0)?'#5a4a62':'#625270');}
  /* l'entrée : le tapis rouge */
  R(g,CX-56,H-74,112,74,'#6a1a24');R(g,CX-54,H-74,108,74,'#8a2a30');for(let y=H-72;y<H;y+=6)R(g,CX-54,y,108,1,'#7a2028');R(g,CX-54,H-74,3,74,'#ffd24a');R(g,CX+51,H-74,3,74,'#ffd24a');
}
function sol(){const c=document.createElement('canvas');c.width=W;c.height=H;peindreSol(c.getContext('2d'));return c;}
/* la version fine : le même dessin agrandi au plus proche, pour que les pixels restent des pixels */
function solFin(s){const c=document.createElement('canvas');c.width=W*2;c.height=H*2;const g=c.getContext('2d');g.imageSmoothingEnabled=false;g.drawImage(s||sol(),0,0,W*2,H*2);return c;}

/* ---------- LES BARAQUES, EN VOLUME ---------- */
const BAR=[
 {k:'chamboule',x:170,nom:'CHAMBOULE-TOUT',c1:'#d82a2a',c2:'#f6f0e2',ens:'#1f3a8a',dedans:'boites'},
 {k:'tir',x:430,nom:'TIR AUX CANARDS',c1:'#1f5fa8',c2:'#ffd24a',ens:'#8a1a2a',dedans:'canards'},
 {k:'peche',x:1370,nom:'PÊCHE AUX CANARDS',c1:'#1aa090',c2:'#f6f0e2',ens:'#5a2a8a',dedans:'bassin'},
 {k:'lots',x:1630,nom:'LOTS & TICKETS',c1:'#7a3ad0',c2:'#ffd24a',ens:'#1a1a2a',dedans:'lots'}];
const BW=236,BH=214;
const AMP={};
function facade(B){const amp=[];AMP[B.k]=amp;return toile(BW,BH,g=>{
  const L=(x,y,w,h,c)=>R(g,x,y,w,h,c),K=P_NUIT.contour;
  L(10,70,BW-20,BH-70,K);L(12,72,BW-24,BH-74,'#3a2236');L(16,86,BW-32,BH-130,'#2a1828');
  for(let y=0;y<40;y++)for(let x=16+(y%2);x<BW-16;x+=2)if(hA(x,y,4)<(1-y/40)*.7)L(x,86+y,1,1,'#6a4a50');
  if(B.dedans==='boites'){L(48,150,140,6,'#6a3a1a');L(48,150,140,1,'#9a6a3a');L(48,156,140,2,K);
    for(let r=0;r<4;r++)for(let k=0;k<4-r;k++){const x=Math.round(118-38+k*19+r*9.5),y=150-12-r*13;const c=['#d82a2a','#2a7ad8','#ffd24a','#5ec04a'][(r+k)%4];L(x,y,14,12,K);L(x+1,y+1,12,10,c);L(x+1,y+1,12,2,'#f6f0e2');L(x+1,y+9,12,2,'#f6f0e2');L(x+3,y+3,2,6,'#ffffff');L(x+10,y+3,2,6,'rgba(0,0,0,.25)');}
    for(const x of [26,BW-46])for(let r=0;r<3;r++){L(x,98+r*16,20,14,K);L(x+1,99+r*16,18,12,['#ff7aa0','#7ad0ff','#ffd24a'][r]);L(x+5,101+r*16,2,2,K);L(x+12,101+r*16,2,2,K);}}
  if(B.dedans==='canards'){for(let r=0;r<2;r++){L(18,112+r*28,BW-36,3,'#8a7a6a');L(18,115+r*28,BW-36,1,K);
      for(let k=0;k<8;k++){const x=24+k*24+(r?12:0),y=100+r*28,c=r?'#ffd24a':'#f2f2f2',o=r?'#c89a20':'#b8b8c8';L(x-1,y+3,16,10,K);L(x,y+4,14,8,c);L(x+9,y-1,8,7,K);L(x+10,y,6,5,c);L(x+16,y+2,4,2,'#ff8a2a');L(x+13,y+1,1,1,K);L(x+1,y+9,8,2,o);}}
    L(BW/2-36,160,72,4,'#3a2a20');for(let i=0;i<5;i++){L(30+i*40,94,10,10,'#ffd24a');L(32+i*40,96,6,6,'#d82a2a');L(34+i*40,98,2,2,'#ffd24a');}}
  if(B.dedans==='bassin'){L(18,142,BW-36,24,K);L(20,144,BW-40,20,'#1a6aa0');L(20,144,BW-40,2,'#6ac0e8');trame(g,20,148,BW-40,14,'#2a8ac8',.4);
    for(let k=0;k<9;k++){const x=26+k*21,y=148+(k%2)*6,c=['#ffd24a','#ffd24a','#ff9ab8','#7ad0ff'][k%4];L(x-1,y-1,12,8,K);L(x,y,10,6,c);L(x+6,y-5,6,6,K);L(x+7,y-4,4,4,c);L(x+11,y-3,3,2,'#ff7a2a');}
    for(let k=0;k<5;k++){const x=26+k*40,c=['#ff7aa0','#7ad0ff','#ffd24a','#b08aff','#7ee08a'][k];L(x-1,99,24,30,K);L(x,100,22,28,c);L(x+2,96,7,7,K);L(x+13,96,7,7,K);L(x+3,97,5,5,c);L(x+14,97,5,5,c);L(x+6,107,2,2,K);L(x+14,107,2,2,K);L(x+9,112,4,2,'#e8302a');}}
  if(B.dedans==='lots'){for(let r=0;r<3;r++){L(18,112+r*20,BW-36,3,'#8a5a2a');L(18,115+r*20,BW-36,1,K);
      for(let k=0;k<9;k++){const c=['#ff7aa0','#7ad0ff','#ffd24a','#b08aff','#7ee08a','#ff9a4a'][(k+r*2)%6],x=22+k*21,y=98+r*20;L(x-1,y-1,15,15,K);L(x,y,13,13,c);L(x+1,y-4,4,4,c);L(x+8,y-4,4,4,c);L(x+3,y+4,2,2,K);L(x+8,y+4,2,2,K);L(x+5,y+8,3,2,'#e8302a');}}
    L(BW/2-30,150,60,10,K);L(BW/2-28,151,56,8,'#9ad0f0');L(BW/2-4,153,8,4,K);}
  for(const x of [2,BW-12]){L(x,58,10,BH-58,K);for(let y=60;y<BH;y+=2)L(x+1,y,8,2,((y/2+((y/8)|0))%4<2)?B.c1:B.c2);L(x+1,60,2,BH-60,'rgba(255,255,255,.2)');L(x+7,60,2,BH-60,'rgba(0,0,0,.25)');}
  L(6,BH-44,BW-12,44,K);L(8,BH-42,BW-16,40,B.c1);L(8,BH-42,BW-16,4,'#f6f0e2');L(8,BH-38,BW-16,1,K);
  for(let x=16;x<BW-20;x+=28){L(x,BH-32,16,24,K);L(x+1,BH-31,14,22,B.c2);L(x+1,BH-31,14,2,'#ffffff');L(x+13,BH-31,2,22,'rgba(0,0,0,.18)');}
  L(8,BH-6,BW-16,4,'rgba(0,0,0,.35)');
  for(let x=0;x<BW;x+=16){const c=((x/16)%2)?B.c2:B.c1;L(x,42,16,26,c);L(x,42,16,3,'rgba(255,255,255,.35)');trame(g,x,58,16,10,'rgba(0,0,0,.25)');}
  for(let x=0;x<BW;x+=16){const c=((x/16)%2)?B.c2:B.c1;for(let y=0;y<7;y++){const w=Math.round(Math.sqrt(1-(y*y)/49)*8);L(x+8-w,68+y,w*2,1,c);}L(x,68,16,1,'rgba(0,0,0,.3)');}
  L(0,40,BW,3,K);
  L(14,2,BW-28,40,K);L(16,4,BW-32,36,'#ffd24a');L(19,7,BW-38,30,B.ens);L(19,7,BW-38,2,'rgba(255,255,255,.18)');
  for(let x=24;x<BW-24;x+=10)amp.push([x,5]);for(let x=24;x<BW-24;x+=10)amp.push([x,38]);
  texte(g,B.nom,BW/2,22,B.nom.length>15?15:17,'#ffffff','#000000');
  L(BW/2-14,0,28,4,K);L(BW/2-12,0,24,3,'#ffd24a');
});}
const FAC={};function fac(B){return FAC[B.k]||(FAC[B.k]=facade(B));}
function ampoulesBaraque(g,B,ox,oy,t){const A=AMP[B.k]||[];for(let i=0;i<A.length;i++){const [x,y]=A[i],on=((i+Math.floor(t*4))%3)!==0,c=on?(i%2?'#fff6c0':'#ffd24a'):'#7a5a30';
   const X=Math.round(ox+x),Y=Math.round(oy+y);R(g,X-1,Y-1,3,3,'#1a1020');R(g,X,Y,1,1,c);R(g,X-1,Y,3,1,c);R(g,X,Y-1,1,3,c);if(on){eclat(g,X,Y);}}}

/* ---------- LA GRANDE ROUE, EN PIXELS ---------- */
const ROUE={x:CX,y:Y0-206,r:180,n:16};
const NAC={};function nacelle(c){return NAC[c]||(NAC[c]=toile(20,22,g=>{const K='#1a1020';R(g,9,0,2,6,'#c8ccd8');R(g,1,6,18,15,K);R(g,2,7,16,13,c);R(g,2,7,16,3,'#ffffff');R(g,4,11,12,5,'#1a2440');R(g,5,12,3,3,'#3a4a70');R(g,2,18,16,2,'rgba(0,0,0,.3)');R(g,0,20,20,2,K);}));}
let ROUE_T=null;
function dessinerRoue(g,ox,oy,t){const {r,n}=ROUE,S=2*r+60;if(!ROUE_T)ROUE_T=document.createElement('canvas');const c=ROUE_T;if(c.width!==S){c.width=S;c.height=S;}
  const q=c.getContext('2d');q.clearRect(0,0,S,S);q.imageSmoothingEnabled=false;const cx=S/2,cy=S/2,a0=t*.12;
  anneau(q,cx,cy,r,'#1a1020',4);anneau(q,cx,cy,r,'#e8ecf4',2);anneau(q,cx,cy,r-14,'#1a1020',3);anneau(q,cx,cy,r-14,'#b8c0d0',1);
  for(let i=0;i<n*2;i++){const a=a0+i/(n*2)*Math.PI*2;ligne(q,cx+Math.cos(a)*(r-14),cy+Math.sin(a)*(r-14),cx+Math.cos(a+Math.PI/n)*r,cy+Math.sin(a+Math.PI/n)*r,'#9aa0b8',1);}
  for(let i=0;i<n;i++){const a=a0+i/n*Math.PI*2;ligne(q,cx,cy,cx+Math.cos(a)*(r-1),cy+Math.sin(a)*(r-1),'#c8ccd8',1);}
  disque(q,cx,cy,15,'#1a1020');disque(q,cx,cy,13,'#ffd24a');disque(q,cx,cy,8,'#d82a2a');disque(q,cx,cy,3,'#ffd24a');
  for(let i=0;i<72;i++){const a=a0+i/72*Math.PI*2,on=((i+Math.floor(t*7))%4)===0,x=Math.round(cx+Math.cos(a)*r),y=Math.round(cy+Math.sin(a)*r);R(q,x-1,y-1,3,3,on?'#fff6c0':COUL[i%8]);if(on){eclat(q,x,y);}}
  g.imageSmoothingEnabled=false;
  const X=Math.round(ROUE.x+ox),Y=Math.round(ROUE.y+oy),Ys=Math.round(Y0+oy+2);
  for(const s of [-1,1]){ligne(g,X,Y,X+s*118,Ys,'#1a1020',7);ligne(g,X,Y,X+s*118,Ys,'#c8ccd8',4);ligne(g,X+s*2,Y+4,X+s*116,Ys-2,'#ffffff',1);}
  ligne(g,X-62,Math.round(Y+(Ys-Y)*.52),X+62,Math.round(Y+(Ys-Y)*.52),'#9aa0b8',3);
  g.drawImage(c,X-S/2,Y-S/2);
  for(let i=0;i<n;i++){const a=a0+i/n*Math.PI*2,nx=Math.round(X+Math.cos(a)*r),ny=Math.round(Y+Math.sin(a)*r);g.drawImage(nacelle(COUL[i%8]),nx-10,ny-1);}}
const CABANE=toile(160,100,g=>{const K='#1a1020';R(g,10,34,140,66,K);R(g,12,36,136,64,'#3a2236');R(g,0,24,160,14,K);for(let x=2;x<158;x+=12){R(g,x,26,6,10,'#d82a2a');R(g,x+6,26,6,10,'#f6f0e2');}
  R(g,20,48,54,34,K);R(g,22,50,50,30,'#7ad0ff');R(g,22,50,50,5,'#c8f0ff');trame(g,22,58,50,22,'#4a9ad0',.35);R(g,22,66,50,2,K);
  R(g,88,44,48,56,K);R(g,90,46,44,54,'#7a3a22');R(g,90,46,44,3,'#9a5a32');R(g,124,72,4,4,'#ffd24a');
  R(g,24,0,112,24,K);R(g,26,2,108,20,'#1f3a8a');R(g,26,2,108,2,'#3a5aa8');texte(g,'GRANDE ROUE',80,12,13,'#ffd24a','#000000');
  R(g,26,84,44,12,K);R(g,27,85,42,10,'#f6f0e2');texte(g,'UN TOUR !',48,90,9,'#d82a2a');});

/* ---------- LE CARROUSEL ---------- */
const CHEV=['#f6f6f6','#ffd24a','#ff9ab8','#9ad8ff','#c8a8ff','#f6f6f6','#ffd24a','#ff9ab8'];
const CHE={};function cheval(c,dir){const k=c+dir;return CHE[k]||(CHE[k]=toile(30,26,g=>{const K='#1a1020',f=(x,y,w,h,cc)=>R(g,dir>0?x:30-x-w,y,w,h,cc);
  f(4,8,20,10,K);f(5,9,18,8,c);f(20,2,7,10,K);f(21,3,5,8,c);f(24,0,5,5,K);f(25,1,3,3,c);f(26,5,4,2,K);
  f(6,17,3,8,K);f(19,17,3,8,K);f(7,17,1,7,c);f(20,17,1,7,c);f(1,9,4,6,K);f(2,10,2,5,'#c8a040');f(19,2,3,9,'#c8a040');
  f(10,7,8,4,K);f(11,8,6,2,'#d82a2a');f(23,4,1,1,K);f(5,9,18,2,'rgba(255,255,255,.4)');}));}
const TOIT={};
function dessinerCarrousel(g,ox,oy,t,devant){const {x,y,r}=CAR,X=Math.round(x+ox),Y=Math.round(y+oy),ry=Math.round(r*.36),a0=t*.5,K='#1a1020';
  if(!devant){
    for(let j=-ry;j<=ry;j++){const w=Math.round(Math.sqrt(1-(j*j)/(ry*ry))*r);R(g,X-w,Y+j,w*2,1,'#8a2a3a');}
    for(let j=-ry;j<=ry;j++){const w=Math.round(Math.sqrt(1-(j*j)/(ry*ry))*(r-2));R(g,X-w,Y-5+j,w*2,1,j<-ry+3?'#e86a6a':'#c8404a');}
    for(let i=0;i<48;i++){const a=i/48*Math.PI*2;R(g,Math.round(X+Math.cos(a)*(r-6)),Math.round(Y-5+Math.sin(a)*(ry-2)),2,1,'#ffd24a');}
    R(g,X-11,Y-134,22,130,K);R(g,X-9,Y-132,18,126,'#ffd24a');for(let k=0;k<7;k++)R(g,X-9,Y-126+k*18,18,6,'#d82a2a');R(g,X-9,Y-132,4,126,'rgba(255,255,255,.3)');}
  for(let i=0;i<8;i++){const a=a0+i/8*Math.PI*2,s=Math.sin(a);if((s>0)!==!!devant)continue;
    const hx=Math.round(X+Math.cos(a)*(r-26)),hy=Math.round(Y-5+s*(ry-10)),bob=Math.round(Math.sin(t*3+i*1.3)*5),dir=Math.cos(a+Math.PI/2)>0?1:-1;
    R(g,hx-1,Y-150,2,hy-20-(Y-150)+bob,'#ffd24a');R(g,hx,Y-150,1,hy-20-(Y-150)+bob,'#fff2a0');
    g.drawImage(cheval(CHEV[i],dir),hx-15,hy-36+bob);}
  if(devant){const ty=Y-152;
    if(!TOIT.c)TOIT.c=toile(2*r+30,80,q=>{const cx=r+15;for(let j=0;j<50;j++){const w=Math.round((j/50)*(r+10));for(let xx=-w;xx<w;xx++){const seg=Math.floor(((xx/(w||1))+1)*4);R(q,cx+xx,j,1,1,seg%2?'#f6f0e2':'#d82a2a');}R(q,cx-w-1,j,1,1,K);R(q,cx+w,j,1,1,K);}
      R(q,3,50,2*r+24,10,K);R(q,4,51,2*r+22,8,'#ffd24a');
      for(let k=0;k<14;k++){const fx=4+k*(2*r+22)/14,fw=(2*r+22)/14,c=k%2?'#d82a2a':'#f6f0e2';for(let jj=0;jj<6;jj++){const w=Math.round(Math.sqrt(1-(jj*jj)/36)*fw/2);R(q,Math.round(fx+fw/2-w),59+jj,w*2,1,c);}}});
    g.drawImage(TOIT.c,X-r-15,ty-50);
    for(let k=0;k<22;k++){const on=((k+Math.floor(t*5))%3)===0,fx=Math.round(X-r-8+k*(2*r+16)/21);R(g,fx-1,ty+3,3,3,on?'#fff6c0':'#a87a30');if(on){eclat(g,fx,ty+1+3);}}
    disque(g,X,ty-52,5,K);disque(g,X,ty-52,4,'#ffd24a');R(g,X,ty-74,2,20,K);R(g,X+2,ty-74,12,4,'#d82a2a');R(g,X+2,ty-70,8,3,'#d82a2a');}}

/* ---------- LES AUTO-TAMPONNEUSES ---------- */
const AUTOS=[];for(let i=0;i<6;i++)AUTOS.push({x:TAMP.x0+50+hA(i,1,9)*(TAMP.x1-TAMP.x0-100),y:TAMP.y0+40+hA(i,2,9)*(TAMP.y1-TAMP.y0-80),a:hA(i,3,9)*6.28,v:46+hA(i,4,9)*30,c:COUL[(i*3)%8],choc:0});
let tAuto=0;
function bougerAutos(dt){for(const A of AUTOS){A.a+=(hA(Math.floor(tAuto*.5),AUTOS.indexOf(A),5)-.5)*dt*1.6;A.x+=Math.cos(A.a)*A.v*dt;A.y+=Math.sin(A.a)*A.v*dt*.7;
   if(A.x<TAMP.x0+24||A.x>TAMP.x1-24){A.a=Math.PI-A.a;A.x=Math.max(TAMP.x0+24,Math.min(TAMP.x1-24,A.x));A.choc=.3;}
   if(A.y<TAMP.y0+24||A.y>TAMP.y1-10){A.a=-A.a;A.y=Math.max(TAMP.y0+24,Math.min(TAMP.y1-10,A.y));A.choc=.3;}A.choc=Math.max(0,A.choc-dt);}
  for(let i=0;i<AUTOS.length;i++)for(let j=i+1;j<AUTOS.length;j++){const a=AUTOS[i],b=AUTOS[j],dx=b.x-a.x,dy=(b.y-a.y)*1.4,d=Math.hypot(dx,dy);if(d<36&&d>0){const t=a.a;a.a=b.a;b.a=t;a.x-=dx/d*3;b.x+=dx/d*3;a.y-=dy/d*2;b.y+=dy/d*2;a.choc=b.choc=.35;}}}
const PERSOS_AUTO=[{peau:2,cheveux:1,coiffe:2,haut:1,veste:'#e8302a'},{peau:5,cheveux:0,coiffe:3,haut:0,veste:'#2a3a5a'},{peau:1,cheveux:3,coiffe:5,haut:3,veste:'#ff9ab8'},{peau:4,cheveux:6,coiffe:1,haut:1,veste:'#ffd24a'},{peau:3,cheveux:2,coiffe:0,haut:4,veste:'#7ee08a'},{peau:6,cheveux:7,coiffe:6,haut:0,veste:'#9a7aff'}];
const CAISSE={};function caisse(c,dir){const k=c+dir;return CAISSE[k]||(CAISSE[k]=toile(48,26,g=>{const K='#1a1020',f=(x,y,w,h,cc)=>R(g,dir>0?x:48-x-w,y,w,h,cc);
  f(2,12,44,13,K);f(3,13,42,11,'#2a2a34');f(3,22,42,2,'#14141a');
  f(5,4,38,14,K);f(6,5,36,12,c);f(6,5,36,3,'rgba(255,255,255,.4)');f(30,1,13,10,K);f(31,2,11,8,c);f(31,2,11,2,'rgba(255,255,255,.4)');f(40,8,3,3,'#fff6c0');f(6,14,36,3,'rgba(0,0,0,.2)');}));}
function dessinerAuto(g,A,ox,oy,i,t){const X=Math.round(A.x+ox),Y=Math.round(A.y+oy),dir=Math.cos(A.a)>=0?1:-1;
  trame(g,X-24,Y+2,48,6,'rgba(0,0,0,.6)');
  try{const ap=Object.assign({bas:0,pantalon:'#2a2a34',souliers:0,chaussures:0,sac:0,chapeau:0,raye:0,motif:0,barbe:0,_civil:true},PERSOS_AUTO[i]);
    g.save();g.beginPath();g.rect(X-30,Y-62,60,50);g.clip();personne(g,X-dir*4,Y+4,ap,dir>0?'droite':'gauche',0,false);g.restore();}catch(z){}
  g.drawImage(caisse(A.c,dir),X-24,Y-20);
  R(g,X-dir*14,Y-72,1,58,'#c8ccd8');R(g,X-dir*14-1,Y-74,3,3,'#1a1020');
  if(A.choc>0||hA(Math.floor(t*12),i,2)<.1){for(let k=0;k<5;k++)R(g,X-dir*14+Math.round((hA(k,Math.floor(t*30),i)-.5)*10),Y-76+Math.round((hA(k,i,Math.floor(t*30))-.5)*6),1,1,k%2?'#fff6a0':'#7ad0ff');}}

/* ---------- LES GUIRLANDES D'AMPOULES ---------- */
const MATS=[40,300,560,760,1040,1240,1500,1760];
function dessinerGuirlandes(g,ox,oy,t){for(let i=0;i<MATS.length-1;i++){const a=MATS[i],b=MATS[i+1],n=Math.round((b-a)/16);let px=null,py=null;
  for(let k=0;k<=n;k++){const u=k/n,x=Math.round(a+(b-a)*u+ox),y=Math.round(Y0-92+Math.sin(u*Math.PI)*24+oy);if(px!==null)ligne(g,px,py,x,y,'#1a1020',1);px=x;py=y;
    if(k>0&&k<n){const c=COUL[(k+i)%8],on=Math.sin(t*2.2+k*.9+i)>.1;R(g,x-1,y+1,3,4,'#1a1020');R(g,x,y+2,1,2,on?c:'#3a2a40');if(on&&k%3===0)lum(g,x,y+3,34,'rgba(255,220,150,1)');}}}}

/* ---------- LES ÉCHOPPES ---------- */
const CONFISERIE=toile(120,120,g=>{const K='#1a1020';R(g,8,46,104,74,K);R(g,10,48,100,70,'#f6f0e2');for(let x=10;x<110;x+=10)R(g,x,48,5,70,'#ff9ab8');
  R(g,0,30,120,18,K);for(let x=2;x<118;x+=12){R(g,x,32,6,14,'#ff7aa0');R(g,x+6,32,6,14,'#ffffff');}
  for(let x=0;x<120;x+=12)for(let y=0;y<5;y++){const w=Math.round(Math.sqrt(1-(y*y)/25)*6);R(g,x+6-w,46+y,w*2,1,(x/12)%2?'#ffffff':'#ff7aa0');}
  R(g,20,4,80,26,K);R(g,22,6,76,22,'#ff7aa0');texte(g,'BARBE À PAPA',60,17,11,'#ffffff','#7a1a4a');
  R(g,10,88,100,8,K);R(g,12,89,96,6,'#c87a3a');
  for(let k=0;k<4;k++){const x=22+k*24;disque(g,x,74,9,K);disque(g,x,74,8,['#ff9ac8','#9ad8ff','#ffffff','#ffc0e0'][k]);disque(g,x-3,71,3,'#ffffff');R(g,x-1,82,2,7,'#e8d8b0');}});
const BALLONS=[[0,0,'#e8302a'],[-12,6,'#ffd24a'],[12,5,'#3a9ad8'],[-6,-12,'#ff7aa0'],[8,-11,'#5ec04a'],[-18,-6,'#9a6aff'],[18,-6,'#ff9a2a'],[0,-22,'#2ab0a0']];
function ballon(g,bx,by,c){for(let j=-7;j<=7;j++){const w=Math.round(Math.sqrt(1-(j*j)/49)*5.5);R(g,bx-w-1,by+j,w*2+2,1,'#1a1020');}for(let j=-6;j<=6;j++){const w=Math.round(Math.sqrt(1-(j*j)/36)*4.5);R(g,bx-w,by+j,w*2,1,c);}R(g,bx-2,by-4,2,3,'rgba(255,255,255,.6)');R(g,bx,by+7,1,2,c);}
function dessinerBallons(g,X,Y,t){for(const [dx,dy,c] of BALLONS){const bx=Math.round(X+dx+Math.sin(t*1.3+dx)*2),by=Math.round(Y-70+dy+Math.sin(t*1.7+dy)*1.5);ligne(g,X+2,Y-22,bx,by+8,'#e8e8f0',1);}
  for(const [dx,dy,c] of BALLONS){const bx=Math.round(X+dx+Math.sin(t*1.3+dx)*2),by=Math.round(Y-70+dy+Math.sin(t*1.7+dy)*1.5);ballon(g,bx,by,c);}}
const BANC=toile(60,24,g=>{const K='#1a1020';R(g,2,4,56,6,K);R(g,3,5,54,4,'#9a5a32');R(g,3,5,54,1,'#c07a42');R(g,2,12,56,6,K);R(g,3,13,54,4,'#8a4a2a');R(g,6,17,4,7,K);R(g,50,17,4,7,K);});
const POUB=toile(18,24,g=>{const K='#1a1020';R(g,1,2,16,22,K);R(g,2,3,14,20,'#2a7a4a');for(let y=6;y<22;y+=4)R(g,2,y,14,1,'#1a5a3a');R(g,0,0,18,4,K);R(g,1,1,16,2,'#3a9a5a');});

/* les lampadaires de la place */
const LAMPES=[[260,700],[660,560],[1140,560],[1620,720],[700,900],[1100,900],[300,920],[1500,1000]];
const LAMPADAIRE=toile(22,96,g=>{const K='#1a1020';R(g,9,14,4,80,K);R(g,10,15,2,78,'#3a3a4a');R(g,6,90,10,6,K);R(g,7,91,8,4,'#2a2a3a');
  R(g,3,4,16,12,K);R(g,4,5,14,10,'#2a2a3a');R(g,6,7,10,7,'#fff2b0');R(g,6,7,10,2,'#ffffff');R(g,2,2,18,3,K);R(g,9,0,4,3,K);});
/* trois machines à pince, des peluches derrière la vitre */
const PINCES=toile(150,110,g=>{const K='#1a1020';for(let i=0;i<3;i++){const x=i*50,c=['#d82a2a','#2a7ad8','#7a3ad0'][i];R(g,x+2,10,46,100,K);R(g,x+4,12,42,96,c);R(g,x+4,12,42,3,'rgba(255,255,255,.35)');
  R(g,x+8,22,34,40,K);R(g,x+9,23,32,38,'#1a2440');trame(g,x+9,23,32,38,'#3a5a8a',.25);
  for(let k=0;k<6;k++){const px=x+11+(k%3)*10,py=48+Math.floor(k/3)*6;R(g,px,py,7,7,['#ff7aa0','#ffd24a','#7ad0ff','#7ee08a','#b08aff','#ff9a4a'][(k+i)%6]);R(g,px+1,py+2,1,1,K);R(g,px+4,py+2,1,1,K);}
  R(g,x+24,24,2,12,'#c8ccd8');R(g,x+20,36,10,3,'#c8ccd8');R(g,x+20,38,2,4,'#c8ccd8');R(g,x+28,38,2,4,'#c8ccd8');
  R(g,x+8,66,34,16,K);R(g,x+9,67,32,14,'#2a2a3a');disque(g,x+16,74,3,'#d82a2a');R(g,x+28,71,8,6,'#ffd24a');R(g,x+10,86,30,10,K);R(g,x+11,87,28,8,'#1a1020');
  R(g,x+6,2,38,10,K);R(g,x+7,3,36,8,'#ffd24a');texte(g,'PINCE',x+25,7,7,c);}});
/* le camion de churros et de pommes d'amour */
const CAMION=toile(170,110,g=>{const K='#1a1020';R(g,2,30,166,64,K);R(g,4,32,162,60,'#f6f0e2');R(g,4,32,162,6,'#e8302a');R(g,4,84,162,8,'#d82a2a');
  R(g,20,44,110,32,K);R(g,22,46,106,28,'#3a2236');trame(g,22,46,106,28,'#6a4a50',.3);
  for(let k=0;k<6;k++){disque(g,32+k*17,62,5,K);disque(g,32+k*17,62,4,'#d82a2a');R(g,30+k*17,59,2,2,'#ff9a9a');R(g,32+k*17,54,1,4,'#8a5a2a');}
  R(g,136,44,26,40,K);R(g,138,46,22,26,'#7ad0ff');R(g,138,46,22,4,'#c8f0ff');
  R(g,10,0,150,28,K);R(g,12,2,146,24,'#e8302a');texte(g,'CHURROS · POMMES D’AMOUR',85,14,10,'#ffffff','#5a0a10');
  disque(g,30,98,10,K);disque(g,30,98,7,'#3a3a4a');disque(g,30,98,3,'#c8ccd8');disque(g,140,98,10,K);disque(g,140,98,7,'#3a3a4a');disque(g,140,98,3,'#c8ccd8');
  R(g,0,74,170,4,'#ffd24a');});

/* ---------- L'ARCHE D'ENTRÉE ---------- */
const ARCHE=toile(260,190,g=>{const K='#1a1020',X=130;
  for(const s of [-1,1]){const x=X+s*104-9;R(g,x,40,18,150,K);for(let y=42;y<190;y+=2)R(g,x+1,y,16,2,((y/2+((y/8)|0))%4<2)?'#d82a2a':'#f6f0e2');R(g,x+1,42,3,148,'rgba(255,255,255,.25)');
    disque(g,x+9,36,10,K);disque(g,x+9,36,8,'#ffd24a');disque(g,x+7,34,3,'#fff6c0');}
  for(let x=-118;x<=118;x++){const yb=Math.round(70-Math.sqrt(1-(x*x)/(118*118))*58);R(g,X+x,yb-2,1,30,K);R(g,X+x,yb,1,26,'#1f3a8a');R(g,X+x,yb,1,2,'#ffd24a');R(g,X+x,yb+24,1,2,'#ffd24a');}
  texte(g,'FÊTE FORAINE',X,30,17,'#ffffff','#000000');texte(g,'DU PRADO',X,47,10,'#ffd24a','#000000');});
const ARCHE_AMP=[];for(let k=0;k<26;k++){const x=-114+k*228/25;ARCHE_AMP.push([Math.round(130+x),Math.round(70-Math.sqrt(1-(x*x)/(118*118))*58)-4]);}

/* ---------- LES ACTEURS ---------- */
let tPrec=0,TITRE_T=null;
const now=()=>performance.now()/1000;
/* les lumières de la nuit : le moteur les allume quand le soir tombe */
const lum=(g,x,y,r,c)=>{try{lueurNuit(g,x,y,r,c||'rgba(255,220,150,1)');}catch(z){}};
const FILE=[{peau:2,cheveux:3,coiffe:5,haut:1,veste:'#3a9ad8'},{peau:5,cheveux:0,coiffe:2,haut:0,veste:'#e8302a'},{peau:1,cheveux:6,coiffe:4,haut:3,veste:'#ffd24a',_lot:'f_ballon'},{peau:4,cheveux:2,coiffe:1,haut:1,veste:'#5ec04a'}].map(a=>Object.assign({bas:0,pantalon:'#2a2a3a',souliers:1,chaussures:'#f2f2f2',sac:0,chapeau:0,raye:0,motif:0,barbe:0,_civil:true},a));
const MARCHAND={peau:3,cheveux:0,coiffe:2,barbe:3,haut:2,veste:'#d82a2a',bas:0,pantalon:'#2a2a3a',souliers:1,chaussures:'#1a1a1a',sac:0,chapeau:0,raye:1,motif:0,_civil:true,_lot:'f_chapeau'};
function acteurs(){const L=[];
  L.push({y:Y0-60,f:(g,camX,camY)=>{const t=now();dessinerRoue(g,-camX,-camY,t);const X=ROUE.x-camX,Y=ROUE.y-camY;lum(g,X,Y,80,'rgba(255,210,120,1)');for(let i=0;i<8;i++){const a=t*.12+i/8*Math.PI*2;lum(g,X+Math.cos(a)*ROUE.r,Y+Math.sin(a)*ROUE.r,70,['rgba(255,90,80,1)','rgba(255,220,120,1)','rgba(110,180,255,1)','rgba(255,140,200,1)'][i%4]);}}});
  L.push({y:Y0-2,f:(g,camX,camY)=>{g.imageSmoothingEnabled=false;g.drawImage(CABANE,Math.round(CX-80-camX),Math.round(Y0-100-camY));}});
  for(const B of BAR)L.push({y:Y0+6,f:(g,camX,camY)=>{g.imageSmoothingEnabled=false;const ox=Math.round(B.x-BW/2-camX),oy=Math.round(Y0+6-BH-camY);g.drawImage(fac(B),ox,oy);ampoulesBaraque(g,B,ox,oy,now());for(const fx of [40,BW/2,BW-40])lum(g,ox+fx,oy+110,95);lum(g,ox+BW/2,oy+22,70,'rgba(255,240,200,1)');}});
  for(const x of MATS)L.push({y:Y0+18,f:(g,camX,camY)=>{const X=Math.round(x-camX),Y=Math.round(Y0+18-camY);R(g,X-3,Y-112,6,112,'#1a1020');R(g,X-2,Y-111,4,110,'#5a4a5a');R(g,X-2,Y-111,1,110,'#7a6a7a');R(g,X-5,Y-4,10,4,'#1a1020');R(g,X-4,Y-114,8,4,'#ffd24a');}});
  L.push({y:Y0+40,f:(g,camX,camY)=>dessinerGuirlandes(g,-camX,-camY,now())});
  L.push({y:CAR.y-CAR.r*.36,f:(g,camX,camY)=>dessinerCarrousel(g,-camX,-camY,now(),false)});
  L.push({y:CAR.y+CAR.r*.36,f:(g,camX,camY)=>{dessinerCarrousel(g,-camX,-camY,now(),true);const X=CAR.x-camX,Y=CAR.y-camY;lum(g,X,Y-150,150,'rgba(255,200,140,1)');lum(g,X-90,Y-140,90,'rgba(255,120,120,1)');lum(g,X+90,Y-140,90,'rgba(255,230,150,1)');}});
  AUTOS.forEach((A,i)=>L.push({get y(){return A.y;},f:(g,camX,camY)=>{const t=now();if(i===0){const dt=Math.min(.05,t-(tPrec||t));tPrec=t;tAuto+=dt;bougerAutos(dt);}dessinerAuto(g,A,-camX,-camY,i,t);}}));
  L.push({y:TAMP.y1+14,f:(g,camX,camY)=>{const X0=Math.round(TAMP.x0-camX),X1=Math.round(TAMP.x1-camX),Yb=Math.round(TAMP.y1+14-camY),K='#1a1020';
    for(const x of [X0-8,X1+2]){R(g,x,Yb-214,7,214,K);R(g,x+1,Yb-213,5,212,'#c8ccd8');R(g,x+1,Yb-213,1,212,'#ffffff');}
    R(g,X0-14,Yb-232,X1-X0+28,24,K);R(g,X0-12,Yb-230,X1-X0+24,20,'#1f3a8a');R(g,X0-12,Yb-230,X1-X0+24,2,'#3a5aa8');
    const t=now();for(let x=X0-6;x<X1+8;x+=12){const on=((x/12+Math.floor(t*6))|0)%3===0;R(g,x-1,Yb-212,3,3,on?'#fff6c0':'#a87a30');}
    lum(g,(X0+X1)/2,Yb-220,120,'rgba(140,190,255,1)');lum(g,X0+60,Yb-110,140,'rgba(120,170,255,1)');lum(g,X1-60,Yb-110,140,'rgba(255,140,200,1)');
    if(!TITRE_T)TITRE_T=toile(380,20,q=>texte(q,'AUTO-TAMPONNEUSES',190,10,14,'#ffd24a','#000000'));g.drawImage(TITRE_T,Math.round((X0+X1)/2-190),Yb-230);}});
  L.push({y:640,f:(g,camX,camY)=>{g.imageSmoothingEnabled=false;g.drawImage(CONFISERIE,Math.round(720-60-camX),Math.round(640-120-camY));lum(g,720-camX,640-60-camY,90,'rgba(255,150,200,1)');}});
  L.push({y:672,f:(g,camX,camY)=>{const X=Math.round(1090-camX),Y=Math.round(672-camY);try{personne(g,X,Y,MARCHAND,'bas',0,false);}catch(z){}dessinerBallons(g,X,Y,now());}});
  for(const [x,y] of [[620,980],[1180,980],[300,600],[1500,600]])L.push({y,f:(g,camX,camY)=>{g.drawImage(BANC,Math.round(x-30-camX),Math.round(y-20-camY));}});
  for(const [x,y] of [[660,990],[1140,990],[260,610],[1540,610]])L.push({y,f:(g,camX,camY)=>{g.drawImage(POUB,Math.round(x-9-camX),Math.round(y-22-camY));}});
  for(const P of GENS)if(P.ballon)L.push({get y(){return P.y+1;},f:(g,camX,camY)=>{const X=Math.round(P.x-camX),Y=Math.round(P.y-camY),t=now(),bx=Math.round(X+8+Math.sin(t*1.3+P.dec)*2),by=Y-72;
    ligne(g,X+6,Y-24,bx,by+8,'#e8e8f0',1);ballon(g,bx,by,P.ballon);}});
  for(const [x,y] of LAMPES)L.push({y,f:(g,camX,camY)=>{const X=Math.round(x-11-camX),Y=Math.round(y-94-camY);g.drawImage(LAMPADAIRE,X,Y);lum(g,X+11,Y+10,120,'rgba(255,236,170,1)');}});
  L.push({y:1000,f:(g,camX,camY)=>{const X=Math.round(1380-75-camX),Y=Math.round(1000-110-camY);g.drawImage(PINCES,X,Y);const t=now();for(let i=0;i<3;i++){const on=((i+Math.floor(t*3))%2)===0;R(g,X+i*50+8,Y+12,34,2,on?'#fff6c0':'#a87a30');lum(g,X+i*50+25,Y+45,70,['rgba(255,100,100,1)','rgba(110,170,255,1)','rgba(190,130,255,1)'][i]);}}});
  L.push({y:990,f:(g,camX,camY)=>{g.drawImage(CAMION,Math.round(380-85-camX),Math.round(990-110-camY));lum(g,380-camX,990-60-camY,100,'rgba(255,200,150,1)');}});
  /* les guirlandes tendues au-dessus de l'allée, en zigzag (elles passent au-dessus de tout) */
  L.push({y:H+40,f:(g,camX,camY)=>{const t=now();const P=[[CX-130,560],[CX+130,640],[CX-130,720],[CX+130,800],[CX-130,880],[CX+130,960]];
    for(let i=0;i<P.length-1;i++){const a=P[i],b=P[i+1],n=16;let px=null,py=null;for(let k=0;k<=n;k++){const u=k/n,x=Math.round(a[0]+(b[0]-a[0])*u-camX),y=Math.round(a[1]+(b[1]-a[1])*u-110+Math.sin(u*Math.PI)*18-camY);
      if(px!==null)ligne(g,px,py,x,y,'#1a1020',1);px=x;py=y;if(k>0&&k<n){const on=Math.sin(t*2.6+k+i*2)>0;R(g,x-1,y+1,3,4,'#1a1020');R(g,x,y+2,1,2,on?COUL[(k+i)%8]:'#3a2a40');if(on){eclat(g,x,y+3);}}}}
    for(const [x,y] of P){const X=Math.round(x-camX),Y=Math.round(y-camY);R(g,X-2,Y-112,4,112,'#1a1020');R(g,X-1,Y-111,2,110,'#5a4a5a');}}});
  /* la file d'attente devant la grande roue */
  for(let k=0;k<4;k++)L.push({y:Y0+56+k*2,f:(g,camX,camY)=>{try{personne(g,Math.round(CX+40+k*16-camX),Math.round(Y0+56+k*2-camY),FILE[k],'haut',0,false);}catch(z){}}});
  L.push({y:H-6,f:(g,camX,camY)=>{const X=Math.round(CX-130-camX),Y=Math.round(H-6-190-camY);g.drawImage(ARCHE,X,Y);const t=now();lum(g,X+130,Y+40,130,'rgba(255,220,150,1)');lum(g,X+26,Y+40,80,'rgba(255,120,110,1)');lum(g,X+234,Y+40,80,'rgba(255,120,110,1)');for(let k=0;k<ARCHE_AMP.length;k++){const [x,y]=ARCHE_AMP[k],on=((k+Math.floor(t*6))%3)===0;R(g,X+x-1,Y+y-1,3,3,on?'#fff6c0':'#a87a30');if(on){eclat(g,X+x,Y+y);}}}});
  return L;}

/* ---------- LES PROMENEURS ---------- */
const D8=a=>{const k=Math.round(a/(Math.PI/4));return {0:'droite',1:'bas-droite',2:'bas',3:'bas-gauche',4:'gauche','-4':'gauche','-3':'haut-gauche','-2':'haut','-1':'haut-droite'}[k];};
const CAD=(()=>{try{return CADENCE_PAS;}catch(x){return 0.09;}})();
const GENS=[];
(()=>{const TOURS=[
  {pts:[[CX-40,1000],[CX-40,560],[300,520],[120,560],[300,520],[CX-40,560]],v:30},
  {pts:[[CX+40,560],[1500,520],[1700,560],[1500,520],[CX+40,560],[CX+40,980]],v:27},
  {pts:[[200,620],[640,700],[760,980],[200,960]],v:24},
  {pts:[[1100,980],[1100,700],[1640,640],[1700,960]],v:26},
  {pts:[[CX+20,700],[CX+20,1000]],v:22},
  {pts:[[40,500],[1760,500]],v:32},
  {pts:[[620,940],[300,1000],[620,940],[CX-60,700]],v:25},
  {pts:[[1760,520],[40,520]],v:28},
  {pts:[[560,620],[560,960],[820,960],[820,620]],v:23},
  {pts:[[1000,640],[1000,960],[1640,980],[1640,640]],v:25},
  {pts:[[120,700],[120,1000],[600,1020]],v:21},
  {pts:[[1700,700],[1700,1000],[1200,1020]],v:27}];
  const AP=[{peau:2,cheveux:2,coiffe:3,barbe:2,haut:0,veste:'#c0392b',pantalon:'#1a1a22'},{peau:5,cheveux:0,coiffe:0,haut:1,veste:'#2a3a5a',pantalon:'#5a6a7a'},{peau:1,cheveux:7,coiffe:1,haut:3,veste:'#f5c430',pantalon:'#2a3a5a'},
   {peau:3,cheveux:3,coiffe:5,haut:1,veste:'#ff9ab8',pantalon:'#3a3a5a'},{peau:6,cheveux:4,coiffe:2,haut:0,veste:'#7ee08a',pantalon:'#2a2a34'},{peau:4,cheveux:1,coiffe:6,barbe:3,haut:2,veste:'#9a7aff',pantalon:'#1a1a22'},{peau:2,cheveux:6,coiffe:4,haut:1,veste:'#ff9a4a',pantalon:'#4a3a2a'},{peau:1,cheveux:5,coiffe:3,haut:0,veste:'#2ab0a0',pantalon:'#2a2a34'},
   {peau:3,cheveux:1,coiffe:2,haut:1,veste:'#e8302a',pantalon:'#2a3a5a'},{peau:5,cheveux:3,coiffe:5,haut:3,veste:'#ffd24a',pantalon:'#3a2a20'},{peau:2,cheveux:4,coiffe:0,barbe:2,haut:0,veste:'#2a3a5a',pantalon:'#1a1a22'},{peau:6,cheveux:6,coiffe:3,haut:1,veste:'#ff9ab8',pantalon:'#2a2a34'}];
  const BAL=['#e8302a',null,'#ffd24a',null,'#3a9ad8',null,'#ff7aa0',null,null,'#5ec04a',null,null];const LOT=[null,'f_chapeau',null,'f_coeur',null,null,null,'f_peluche','f_couronne',null,'f_chapeau',null];
  TOURS.forEach((T,i)=>{let L=0;const seg=[];for(let k=0;k<T.pts.length;k++){const a=T.pts[k],b=T.pts[(k+1)%T.pts.length],d=Math.hypot(b[0]-a[0],b[1]-a[1]);seg.push([a,b,L,d]);L+=d;}
   GENS.push({tour:{seg,L,v:T.v},dec:i*1.7,court:false,ballon:BAL[i],ap:Object.assign({bas:0,souliers:1,chaussures:'#f2f2f2',sac:0,chapeau:0,raye:0,motif:0,barbe:0,_civil:true},AP[i],LOT[i]?{_lot:LOT[i]}:{}),x:0,y:0,dir:'bas',pas:0});});})();
function figurants(){const n=Date.now()/1000;
  for(const P of GENS){const T=P.tour,d=(n*T.v+P.dec*100)%T.L;for(const [a,b,L0,dd] of T.seg){if(d<=L0+dd){const t=(d-L0)/dd;P.x=a[0]+(b[0]-a[0])*t;P.y=a[1]+(b[1]-a[1])*t;P.dir=D8(Math.atan2(b[1]-a[1],b[0]-a[0]));break;}}P.pas=(n*T.v+P.dec*100)*CAD;}
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

function bloque(x,y){
  if(x<12||x>W-12)return true;
  if(y<Y0+20)return true;
  if(((x-CAR.x)/(CAR.r+10))**2+((y-CAR.y)/(CAR.r*.42+8))**2<1)return true;
  if(x>TAMP.x0-14&&x<TAMP.x1+14&&y>TAMP.y0-14&&y<TAMP.y1+16)return true;
  if(x>660&&x<780&&y>600&&y<644)return true;
  if(x>1305&&x<1455&&y>975&&y<1004)return true;
  if(x>295&&x<465&&y>960&&y<994)return true;
  if(y>H-44&&Math.abs(x-CX)>52)return true;
  if(y>H-4)return true;
  return false;}

let PARTI=false;
setInterval(()=>{try{if(PARTI||typeof joueur==='undefined')return;if(joueur.y>H-12)sortir();}catch(x){}},150);
function sortir(){if(PARTI)return;PARTI=true;try{sauver();}catch(x){}
  try{const f=document.createElement('div');f.style.cssText='position:fixed;inset:0;z-index:2147483000;background:#1a1030;opacity:0;transition:opacity .45s;pointer-events:none';document.body.appendChild(f);requestAnimationFrame(()=>f.style.opacity='1');}catch(x){}
  setTimeout(()=>{const v=window.MA_VERSION?('&v='+encodeURIComponent(window.MA_VERSION)):'';location.href='spawn.html?de=foire'+v;},480);}

return {sol,solFin,decor,bloque,graver,depart:DEPART,figurants,acteurs};
})()
