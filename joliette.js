/* ================= LA PLACE DE LA JOLIETTE =================
   La carte d'arrivée (800 × 800). En haut, la façade des Docks ; devant,
   le trottoir et ses terrasses ; puis la double voie du tram ; puis la
   grande place, sa fontaine, ses platanes et le tableau d'embauche. Tout
   en bas, le passage piéton qui descend vers le port.
   Ce morceau ne touche à rien d'autre : le sol, le décor, les collisions
   et la sortie vivent ici, et le moteur ne fait que les appeler. */
(()=>{
const W=800, H=800;
const DOCKS_PIED=236, TROTTOIR=300, TRAM0=300, TRAM1=362, PLACE_BAS=760;
const SORTIE_X=400, SORTIE_DEMI=44;
const DEPART=[400,676];
const FONT=[400,560];
const h=(x,y,k)=>{let n=(x*374761393+y*668265263+k*1442695041)|0;n=(n^(n>>>13))*1274126177|0;return((n^(n>>>16))>>>0)/4294967296;};
const teinte=(hex,d)=>{const v=parseInt(hex.slice(1),16);const c=k=>Math.max(0,Math.min(255,((v>>k)&255)+d));
  return 'rgb('+c(16)+','+c(8)+','+c(0)+')';};

/* ---------- LE SOL ---------- */
function sol(){
const c=document.createElement('canvas');c.width=W;c.height=H;
const g=c.getContext('2d');g.imageSmoothingEnabled=false;
const R=(x,y,w,hh,col)=>{g.fillStyle=col;g.fillRect(x|0,y|0,Math.max(1,w|0),Math.max(1,hh|0));};

/* le ciel, juste au-dessus de la corniche */
for(let y=0;y<26;y++){const k=y/26;R(0,y,W,1,'rgb('+(118+k*60|0)+','+(170+k*40|0)+','+(222+k*14|0)+')');}

/* la façade des Docks est un objet du décor (x_jol_docks_sol), dessiné au demi-pixel */
R(0,26,W,DOCKS_PIED-26,'#e3d0a8');

/* LE TROTTOIR DES DOCKS : grandes dalles claires */
dalles(g,R,0,DOCKS_PIED,W,TROTTOIR-DOCKS_PIED,['#dcd6cb','#d6d0c4','#e0dad0','#d2ccc0'],46,18);
R(0,DOCKS_PIED,W,3,'rgba(40,30,20,.22)');          /* l'ombre du socle */

/* LE TRAM : bordure, pavés gris, deux voies */
R(0,TRAM0,W,4,'#b9b3a6');R(0,TRAM0,W,1,'#eae4d6');
for(let y=TRAM0+4;y<TRAM1-4;y+=5){let x=-((y/5|0)%2)*5;
  while(x<W){R(x,y,10,5,teinte('#8d8a84',((h(x,y,11)-.5)*16)|0));R(x,y,10,1,'rgba(255,255,255,.10)');R(x,y,1,5,'rgba(0,0,0,.12)');x+=10;}}
for(const ry of [314,326,340,352]){R(0,ry,W,2,'#c8ccd0');R(0,ry+2,W,1,'#4c4f54');}
R(0,TRAM1-4,W,4,'#b9b3a6');R(0,TRAM1-1,W,1,'#7f796c');

/* LA PLACE */
dalles(g,R,0,TRAM1,W,PLACE_BAS-TRAM1,['#e4dccb','#ded6c4','#e8e0d0','#d9d1bf','#e1d9c8'],56,22);
/* l'anneau de pierre ocre autour de la fontaine */
for(let y=TRAM1;y<PLACE_BAS;y++)for(let x=FONT[0]-160;x<FONT[0]+160;x++){
  const dx=(x-FONT[0])/150, dy=(y-FONT[1]+8)/88, r=Math.sqrt(dx*dx+dy*dy);
  if(r>0.9&&r<0.97){const k=h(x>>4,y>>3,51);g.fillStyle=k<.5?'#d3bd98':'#cdb690';g.fillRect(x,y,1,1);}
  else if((r>0.88&&r<=0.9)||(r>=0.97&&r<0.99)){g.fillStyle='#bfa984';g.fillRect(x,y,1,1);}
}
/* les allées des platanes, en gravier */
for(const x0 of [0,W-84]){
  R(x0,TRAM1,84,PLACE_BAS-TRAM1,'#cdbb94');
  for(let i=0;i<2600;i++){const x=x0+h(i,x0,21)*84, y=TRAM1+h(i,x0,22)*(PLACE_BAS-TRAM1);
    R(x,y,1,1,h(i,x0,23)<.5?'#b8a57c':'#ddcba4');}
  R(x0===0?83:x0,TRAM1,1,PLACE_BAS-TRAM1,'#a99772');
}
/* LA RUE DU BAS et le passage piéton qui mène au port */
R(0,PLACE_BAS,W,4,'#b9b3a6');R(0,PLACE_BAS,W,1,'#eee8da');
for(let y=PLACE_BAS+4;y<H;y++)R(0,y,W,1,teinte('#5e6066',((y-PLACE_BAS)%7===0)?-6:0));
for(let i=0;i<1500;i++)R(h(i,1,31)*W,PLACE_BAS+4+h(i,2,31)*36,1,1,h(i,3,31)<.5?'#6c6e74':'#54565c');
for(let x=SORTIE_X-SORTIE_DEMI+4;x<SORTIE_X+SORTIE_DEMI-4;x+=12)R(x,PLACE_BAS+6,7,H-PLACE_BAS-6,'#e9e7e0');
return c;
}
function dalles(g,R,x0,y0,w,hh,tons,tw,th){
  for(let y=y0;y<y0+hh;y+=th){
    let x=x0-(((y-y0)/th|0)%2)*(tw>>1);
    while(x<x0+w){const ww=tw-((h(x,y,41)*10)|0);
      const xa=Math.max(x0,x), wa=Math.min(x+ww,x0+w)-xa, ha=Math.min(th,y0+hh-y);
      if(wa>0){R(xa,y,wa,ha,tons[(h(x,y,42)*tons.length)|0]);
        R(xa,y,wa,1,'rgba(110,104,94,.30)');R(xa,y,1,ha,'rgba(110,104,94,.30)');
        for(let i=0;i<3;i++)R(xa+2+h(x+i,y,43)*(wa-4),y+2+h(x,y+i,44)*(ha-4),2,1,'rgba(255,255,255,.14)');
        if(h(x,y,45)<.08)R(xa+3+h(x,y,46)*(wa-8),y+3+h(y,x,46)*(ha-6),3,1,'rgba(100,96,90,.30)');}
      x+=ww;}
  }
}

/* ---------- LES OBJETS DE LA PLACE ---------- */
function toile(L,HH){const D=Math.max(1,Math.min(2,Math.floor(window.devicePixelRatio||1)));
  const c=document.createElement('canvas');c.width=L*D;c.height=HH*D;
  const g=c.getContext('2d');g.setTransform(D,0,0,D,0,0);g.imageSmoothingEnabled=false;
  const R=(x,y,w,hh,col)=>{g.fillStyle=col;g.fillRect(Math.round(x),Math.round(y),Math.max(1,Math.round(w)),Math.max(1,Math.round(hh)));};
  return {c,g,R};}

function graverParasol(){
const L=56,HH=64,{c,g,R}=toile(L,HH),cx=L/2,s=HH-6;
g.fillStyle='rgba(30,22,14,.22)';g.beginPath();g.ellipse(cx+3,s,24,6,0,0,7);g.fill();
/* deux chaises bistrot */
for(const dx of [-17,13]){R(cx+dx,s-14,5,2,'#3a3a3a');R(cx+dx,s-12,1,12,'#3a3a3a');R(cx+dx+4,s-12,1,12,'#3a3a3a');
  R(cx+dx,s-22,5,9,'#c8a060');R(cx+dx,s-22,5,1,'#e0bc80');}
/* la table ronde */
R(cx-1,s-14,3,14,'#2e2e2e');R(cx-6,s-1,13,2,'#2e2e2e');
g.fillStyle='#f2eee4';g.beginPath();g.ellipse(cx,s-15,9,3,0,0,7);g.fill();
R(cx-2,s-18,3,3,'#b34a3a');R(cx+3,s-17,2,2,'#e8d2a0');
/* le mât et la toile */
R(cx,s-50,2,36,'#e8e2d6');
const B=['#c0392b','#f4ede0'];
for(let i=0;i<8;i++){g.fillStyle=B[i%2];g.beginPath();g.moveTo(cx+1,s-58);
  const a0=Math.PI*(i/8),a1=Math.PI*((i+1)/8);
  g.lineTo(cx+1-Math.cos(a0)*26,s-46+Math.sin(a0)*4);g.lineTo(cx+1-Math.cos(a1)*26,s-46+Math.sin(a1)*4);g.closePath();g.fill();}
R(cx-25,s-46,52,2,'#9c2c20');
for(let x=cx-24;x<cx+26;x+=4)R(x,s-44,2,2,(x>>2)%2?'#c0392b':'#f4ede0');
return {toile:c,W:L,H:HH,sol:s};
}
function graverAbri(){
const L=96,HH=78,{c,g,R}=toile(L,HH),cx=L/2,s=HH-6;
g.fillStyle='rgba(30,22,14,.24)';g.beginPath();g.ellipse(cx+4,s,46,7,0,0,7);g.fill();
R(cx-42,s-2,84,3,'#a8a294');
/* les vitres */
R(cx-40,s-44,80,42,'rgba(170,215,235,.42)');
R(cx-40,s-44,80,1,'rgba(255,255,255,.6)');
for(const x of [cx-40,cx-13,cx+13,cx+39])R(x,s-46,2,46,'#5a6068');
R(cx-36,s-40,6,30,'rgba(255,255,255,.22)');
/* le banc */
R(cx-30,s-16,60,4,'#7a5a3a');R(cx-28,s-12,2,10,'#3a3a3a');R(cx+26,s-12,2,10,'#3a3a3a');
/* le toit */
R(cx-46,s-52,92,7,'#e8e8e6');R(cx-46,s-52,92,1,'#ffffff');R(cx-46,s-46,92,2,'#8a9096');
/* le totem de la station */
R(cx+44,s-64,8,64,'#2f3b4c');R(cx+44,s-64,8,10,'#1e88c8');
g.fillStyle='#ffffff';g.font='bold 7px "Trebuchet MS",sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText('T',cx+48,s-59);
R(cx-24,s-62,48,9,'#1e88c8');
g.font='bold 7px "Trebuchet MS",sans-serif';g.fillText('JOLIETTE',cx,s-57.5);
return {toile:c,W:L+16,H:HH,sol:s};
}
function graverPanneauPort(){
const L=44,HH=62,{c,g,R}=toile(L,HH),cx=L/2,s=HH-6;
g.fillStyle='rgba(30,22,14,.22)';g.beginPath();g.ellipse(cx+2,s,10,3,0,0,7);g.fill();
R(cx-1,s-40,3,40,'#4a4e54');
R(cx-19,s-56,38,20,'#1f5f9a');R(cx-19,s-56,38,1,'#5d9bd0');R(cx-19,s-37,38,1,'#123a60');
g.fillStyle='#ffffff';g.font='bold 8px "Trebuchet MS",sans-serif';g.textAlign='center';g.textBaseline='middle';
g.fillText('LE PORT',cx,s-50);
g.beginPath();g.moveTo(cx-4,s-45);g.lineTo(cx+4,s-45);g.lineTo(cx,s-40);g.closePath();g.fill();
return {toile:c,W:L,H:HH,sol:s};
}
function graverVide(){const c=document.createElement('canvas');c.width=2;c.height=2;return {toile:c,W:1600,H:80,sol:40};}


/* ---------- LA FAÇADE DES DOCKS ---------- */
/* LES DOCKS, ART DÉCO. Une grille stricte : des piliers tous les 40 points, des
   fenêtres empilées entre eux, des allèges en bronze ; un corps central qui monte
   en gradins au-dessus d'un grand portail en retrait. Toile x2, lumière en haut à gauche. */
function dessinerDocksDeco(g,ST){
const W=800,PIED=236,CX=400,noel=!!ST.noel,JOUR=ST.jour!==false;
const h=(x,y,k)=>{let n=((x*73856093)^(y*19349663)^(k*83492791))|0;n=(n^(n>>>13))*1274126177|0;return((n^(n>>>16))>>>0)/4294967296;};
const hx=s=>{const v=parseInt(s.slice(1),16);return[(v>>16)&255,(v>>8)&255,v&255];};
const mix=(a,b,k)=>{const A=hx(a),B=hx(b);return 'rgb('+A.map((v,i)=>Math.round(v+(B[i]-v)*k)).join(',')+')';};
const q=v=>Math.round(v*2)/2;
const R=(x,y,w,hh,c)=>{if(w<=0||hh<=0)return;const X=q(x),Y=q(y);g.fillStyle=c;g.fillRect(X,Y,Math.max(.5,q(x+w)-X),Math.max(.5,q(y+hh)-Y));};
const VG=(x,y,w,hh,c1,c2)=>{for(let k=0;k<hh;k+=.5)R(x,y+k,w,.5,mix(c1,c2,k/Math.max(.5,hh-.5)));};
const HG=(x,y,w,hh,st)=>{for(let k=0;k<w;k+=.5){const t=k/Math.max(.5,w-.5);let i=0;while(i<st.length-2&&t>st[i+1][0])i++;const[t0,c0]=st[i],[t1,c1]=st[i+1];R(x+k,y,.5,hh,mix(c0,c1,Math.min(1,Math.max(0,(t-t0)/(t1-t0)))));}};
const OMB=(x,y,w,hh,a)=>{for(let k=0;k<hh;k+=.5)R(x,y+k,w,.5,'rgba(40,30,20,'+(a*(1-k/hh)).toFixed(3)+')');};
const LUMS=[];

/* la palette : pierre claire, bronze, or */
const PIERRE='#ece3d0', PCLAIR='#f8f2e4', PMI='#ddd2ba', POMB='#bfb197', JOINT='#d3c7ae';
const BRONZE='#4c4639', BRONZE_C='#6e6552', OR='#cfa955', OR_C='#ecd08a';
const ACIER='#262829';
const NEIGE='#f5f8fb';

/* ---------- la géométrie ---------- */
const PAS=40, TOP_AILE=34, FRISE=36, ET0=50, HET=32, NB=4, RDC0=ET0+NB*HET, SOCLE=216;
const C0=320, C1=480;                         /* le corps central */
const PAV=80;                                 /* les pavillons d'extrémité */

/* ---------- le ciel ---------- */
VG(0,-12,W,60,JOUR?'#84b6e6':'#1e2650',JOUR?'#d8e8f3':'#3c4272');
if(!JOUR)for(let i=0;i<120;i++)R(h(i,1,1)*W,-12+h(i,2,1)*40,.5,.5,'rgba(255,255,255,'+(.4+h(i,3,1)*.6).toFixed(2)+')');

/* ---------- le mur de fond (pierre appareillée, joints fins) ---------- */
const mur=(x0,y0,x1,y1,d)=>{R(x0,y0,x1-x0,y1-y0,mix(PIERRE,'#ffffff',d||0));
  for(let y=y0+8;y<y1;y+=8)R(x0,y,x1-x0,.5,JOINT);
  for(let y=y0;y<y1;y+=8)for(let x=x0+(((y-y0)/8|0)%2)*12;x<x1;x+=24)R(x,y,.5,8,JOINT);};
mur(0,TOP_AILE,W,SOCLE);

/* ---------- les silhouettes : pavillons et corps central en gradins ---------- */
const bloc=(x0,x1,y0,y1)=>{VG(x0,y0,x1-x0,y1-y0,PCLAIR,PIERRE);R(x0,y0,x1-x0,1,'#fffaf0');R(x1-1,y0,1,y1-y0,POMB);
  for(let y=y0+8;y<y1;y+=8)R(x0,y,x1-x0,.5,JOINT);};
/* pavillons : un étage de couronnement en plus */
bloc(0,PAV,22,TOP_AILE+2);bloc(W-PAV,W,22,TOP_AILE+2);
/* le corps central : trois gradins */
bloc(C0,C1,20,TOP_AILE+2);bloc(C0+22,C1-22,8,22);bloc(C0+44,C1-44,-6,10);
/* les ailettes verticales qui coiffent le centre */
for(const x of [C0+50,C0+60,C1-62,C1-52]){HG(x,-12,3,8,[[0,PCLAIR],[1,POMB]]);R(x,-12.5,3,1,'#fffaf0');}
/* l'horloge du dernier gradin */
{const cy=2,cx=CX;R(cx-9,cy-7,18,14,'#2c2a26');R(cx-8,cy-6,16,12,JOUR?'#f2ead6':'#ffe2a0');
  for(let k=0;k<12;k++){const a=k*Math.PI/6;R(cx+Math.cos(a)*5.6-.25,cy+Math.sin(a)*4.4-.25,.5,.5,'#3a3226');}
  g.strokeStyle='#2a241c';g.lineWidth=.6;g.beginPath();g.moveTo(cx,cy);g.lineTo(cx,cy-3.5);g.moveTo(cx,cy);g.lineTo(cx+3,cy+.8);g.stroke();
  R(cx-9,cy-7,18,.5,OR);R(cx-9,cy+6.5,18,.5,OR);
  if(!JOUR)LUMS.push([cx-8,cy-6,16,12]);}
/* le navire stylisé du deuxième gradin */
{const y=16;g.fillStyle=OR;g.beginPath();g.moveTo(CX-16,y+2);g.lineTo(CX+16,y+2);g.lineTo(CX+11,y+5);g.lineTo(CX-11,y+5);g.closePath();g.fill();
  R(CX-.4,y-7,.8,9,OR);g.beginPath();g.moveTo(CX+1,y-6);g.lineTo(CX+9,y+1);g.lineTo(CX+1,y+1);g.closePath();g.fill();
  g.beginPath();g.moveTo(CX-1,y-5);g.lineTo(CX-7,y+1);g.lineTo(CX-1,y+1);g.closePath();g.fill();
  for(const s of [-1,1])for(let k=0;k<3;k++)R(CX+s*(22+k*4)-(s<0?3:0),y-2+k*2,3,.6,OR);}

/* ---------- la frise en zigzag, sous l'acrotère ---------- */
const frise=(x0,x1,y)=>{R(x0,y,x1-x0,6,PMI);R(x0,y,x1-x0,.5,'#fffaf0');R(x0,y+6,x1-x0,.5,POMB);
  g.strokeStyle=OR;g.lineWidth=.6;g.beginPath();for(let x=x0;x<=x1;x+=4){g.lineTo(x,y+(((x-x0)/4)%2?1.6:4.4));}g.stroke();
  OMB(x0,y+6.5,x1-x0,2.5,.25);};
frise(0,W,FRISE);frise(C0,C1,24);frise(0,PAV,24);frise(W-PAV,W,24);
/* l'acrotère à redents au-dessus de chaque pilier */
for(let x=0;x<=W;x+=PAS){if(x>C0&&x<C1)continue;const top=(x<=PAV||x>=W-PAV)?18:TOP_AILE-6;
  HG(x-3,top,6,(x<=PAV||x>=W-PAV?22:TOP_AILE)-top+2,[[0,PCLAIR],[.4,'#fffaf0'],[1,POMB]]);R(x-3,top,6,.5,'#ffffff');
  if(noel)R(x-3,top-.8,6,1.2,NEIGE);}
if(noel){R(0,TOP_AILE-.6,W,1,NEIGE);R(0,21.4,PAV,1,NEIGE);R(W-PAV,21.4,PAV,1,NEIGE);R(C0,19.4,C1-C0,1,NEIGE);R(C0+22,7.4,C1-C0-44,1,NEIGE);R(C0+44,-6.6,C1-C0-88,1,NEIGE);}

/* ---------- les travées : fenêtres empilées, allèges en bronze ---------- */
const MOTIFS=['chevron','soleil','grille'];
const allege=(x,y,w,hh,m)=>{R(x,y,w,hh,BRONZE);R(x,y,w,.5,BRONZE_C);R(x,y+hh-.5,w,.5,'#2e2a22');
  g.strokeStyle=OR;g.lineWidth=.5;g.beginPath();
  if(m==='chevron'){for(let k=0;k<3;k++){const yy=y+1.5+k*2;g.moveTo(x+1,yy+2);g.lineTo(x+w/2,yy);g.lineTo(x+w-1,yy+2);}}
  else if(m==='soleil'){for(let k=0;k<9;k++){const a=Math.PI+k*Math.PI/8;g.moveTo(x+w/2,y+hh-1);g.lineTo(x+w/2+Math.cos(a)*(w/2-1),y+hh-1+Math.sin(a)*(hh-2));}}
  else{for(let xx=x+2;xx<x+w-1;xx+=3){g.moveTo(xx,y+1);g.lineTo(xx,y+hh-1);}g.moveTo(x+1,y+hh/2);g.lineTo(x+w-1,y+hh/2);}
  g.stroke();};
const fenetre=(x,y,w,hh,lum)=>{
  R(x-1,y-1,w+2,hh+2,ACIER);
  VG(x,y,w,hh,lum?'#ffdca0':'#b9cfde',lum?'#c87a30':'#3f5f7c');
  if(!lum){g.fillStyle='rgba(255,255,255,.24)';g.beginPath();g.moveTo(x+.5,y+hh*.7);g.lineTo(x+w*.45,y+.5);g.lineTo(x+w*.45+2,y+.5);g.lineTo(x+2.5,y+hh*.7);g.closePath();g.fill();}
  else LUMS.push([x,y,w,hh]);
  for(let k=1;k<3;k++)R(x+w*k/3-.25,y,.5,hh,ACIER);R(x,y+hh*.3,w,.5,ACIER);
  R(x-1.5,y+hh+1,w+3,1,PCLAIR);if(noel)R(x-1.5,y+hh+.4,w+3,.8,NEIGE);};
const travee=(x,ground)=>{                       /* x = bord gauche de la travée (entre deux piliers) */
  const fx=x+7,fw=PAS-14;
  for(let e=0;e<NB;e++){const y=ET0+e*HET;
    R(x+4,y-2,PAS-8,HET,'rgba(60,45,30,.10)');            /* le retrait de la travée */
    fenetre(fx,y,fw,20,!JOUR&&h(x|0,e,11)<.55);
    allege(fx,y+23,fw,7,MOTIFS[(e+((x/PAS)|0))%3]);}
  if(ground){/* le rez-de-chaussée : une haute baie à grille de bronze, pas une porte */
    const y=RDC0+4;R(fx-1,y-1,fw+2,SOCLE-y-3,ACIER);
    VG(fx,y,fw,SOCLE-y-5,!JOUR?'#ffdca0':'#a9c0d0',!JOUR?'#c87a30':'#3a5874');if(!JOUR)LUMS.push([fx,y,fw,SOCLE-y-5]);
    for(let xx=fx+2;xx<fx+fw;xx+=3)R(xx,y,.6,SOCLE-y-5,BRONZE_C);
    g.strokeStyle=OR;g.lineWidth=.6;const cy=y+(SOCLE-y-5)/2;g.beginPath();g.moveTo(fx+fw/2,cy-6);g.lineTo(fx+fw-3,cy);g.lineTo(fx+fw/2,cy+6);g.lineTo(fx+3,cy);g.closePath();g.stroke();
    R(fx,y+4,fw,.6,BRONZE_C);R(fx,SOCLE-10,fw,.6,BRONZE_C);
    VG(fx-2,SOCLE-4,fw+4,1.5,PCLAIR,PMI);}
};
for(let x=0;x<W;x+=PAS){if(x>=C0&&x<C1)continue;travee(x,true);}

/* ---------- les piliers (par-dessus les travées) ---------- */
for(let x=0;x<=W;x+=PAS){if(x>C0&&x<C1)continue;
  R(x+3,TOP_AILE,1.5,SOCLE-TOP_AILE,'rgba(40,30,20,.16)');
  HG(x-3,TOP_AILE-1,6,SOCLE-TOP_AILE+1,[[0,PMI],[.3,'#fffaf0'],[.65,PCLAIR],[1,POMB]]);
  for(let y=RDC0-2;y<SOCLE;y+=6)R(x-3,y,6,.5,JOINT);}
/* bandeau au-dessus du rez-de-chaussée */
R(0,RDC0-2,W,2.5,PCLAIR);R(0,RDC0+.5,W,.5,POMB);OMB(0,RDC0+1,W,2,.2);

/* ---------- le corps central : deux grands pilastres cannelés et le portail en gradins ---------- */
mur(C0,TOP_AILE+2,C1,SOCLE,.15);R(C1,TOP_AILE,3,SOCLE-TOP_AILE,'rgba(40,30,20,.16)');
for(const x of [C0+2,C1-18]){R(x+16,40,2,SOCLE-40,'rgba(40,30,20,.16)');
  HG(x,40,16,SOCLE-40,[[0,PMI],[.25,'#fffaf0'],[.6,PCLAIR],[1,POMB]]);
  for(let k=2;k<16;k+=2.5)R(x+k,48,.5,SOCLE-60,'rgba(150,130,100,.35)');
  for(let k=0;k<3;k++)R(x-1+k*1,40+k*2.5-6,18-k*2,2.5,k%2?PMI:PCLAIR);          /* chapiteau à gradins */
  R(x+4,46,8,.6,OR);}
/* l'inscription */
{const y=46;R(C0+22,y,C1-C0-44,12,'#2b2924');R(C0+22,y,C1-C0-44,.5,OR);R(C0+22,y+11.5,C1-C0-44,.5,OR);
  g.fillStyle=OR_C;g.font='bold 7.5px "Trebuchet MS",Futura,sans-serif';g.textAlign='center';g.textBaseline='middle';
  const t='L E S   D O C K S';g.fillText(t,CX,y+6.3);}
/* le portail : trois cadres en retrait, couronnés en gradins */
const PORT=[[346,454,68],[352,448,74],[358,442,80]];
PORT.forEach(([a,b,t],i)=>{
  const c1=['#f6efe0','#e8dfcb','#d9ceb6'][i];
  R(a,t,b-a,SOCLE-t,c1);R(a,t,1,SOCLE-t,'#fffaf0');R(b-1.5,t,1.5,SOCLE-t,POMB);R(a,t,b-a,1,'#fffaf0');
  R(a+(b-a)/2-8,t-4,16,4,c1);R(a+(b-a)/2-8,t-4,16,.6,'#fffaf0');                 /* le redent au sommet */
  R(a,t+1,b-a,1.5,'rgba(40,30,20,.18)');});
/* l'écran de bronze : soleil levant, vitrage, portes */
{const a=362,b=438,t=84,w=b-a;
  R(a,t,w,SOCLE-t,ACIER);
  /* le soleil */
  const sy=t+34;g.save();g.beginPath();g.rect(a+1,t+1,w-2,sy-t-1);g.clip();
  VG(a+1,t+1,w-2,sy-t,JOUR?'#2a2a26':'#3a3020','#1c1c1a');
  for(let k=0;k<=16;k++){const ang=Math.PI+k*Math.PI/16;g.strokeStyle=k%2?OR:OR_C;g.lineWidth=k%2?.8:1.2;g.beginPath();g.moveTo(CX,sy);g.lineTo(CX+Math.cos(ang)*60,sy+Math.sin(ang)*60);g.stroke();}
  g.fillStyle=OR_C;g.beginPath();g.arc(CX,sy,9,Math.PI,0);g.fill();g.fillStyle=OR;g.beginPath();g.arc(CX,sy,6,Math.PI,0);g.fill();
  g.restore();R(a,sy,w,1.2,OR);
  if(!JOUR)LUMS.push([a+1,t+1,w-2,sy-t-1]);
  /* le vitrage */
  const vy=sy+1.2, dy=SOCLE-34;VG(a+1,vy,w-2,dy-vy,JOUR?'#bcd2e0':'#ffdca0',JOUR?'#47678a':'#c87a30');
  if(JOUR){g.fillStyle='rgba(255,255,255,.22)';g.beginPath();g.moveTo(a+4,dy);g.lineTo(a+30,vy);g.lineTo(a+36,vy);g.lineTo(a+10,dy);g.closePath();g.fill();}else LUMS.push([a+1,vy,w-2,dy-vy]);
  for(let x=a+1;x<b;x+=w/6)R(x,vy,.8,dy-vy,ACIER);R(a,vy+(dy-vy)/2,w,.8,ACIER);
  /* les portes */
  R(a,dy,w,1.5,OR);
  for(const [x0,x1] of [[a+1,CX-.6],[CX+.6,b-1]]){VG(x0,dy+1.5,x1-x0,SOCLE-dy-1.5,JOUR?'#9fb8ca':'#ffd890',JOUR?'#3a5470':'#c06a20');
    R(x0,dy+1.5,1.2,SOCLE-dy-1.5,BRONZE);R(x1-1.2,dy+1.5,1.2,SOCLE-dy-1.5,BRONZE);R(x0,SOCLE-6,x1-x0,6,BRONZE);R(x0,SOCLE-6,x1-x0,.5,BRONZE_C);}
  R(CX-.6,dy,1.2,SOCLE-dy,ACIER);R(CX-9,dy+14,7,1.2,OR_C);R(CX+2,dy+14,7,1.2,OR_C);
  /* la marquise de verre et de bronze */
  R(348,dy-4,104,2,BRONZE);R(348,dy-4,104,.5,OR);R(350,dy-2,100,1,'rgba(200,220,235,.55)');OMB(350,dy-1,100,3,.25);
  for(const x of [356,444])R(x,dy-12,.8,8,BRONZE);
  if(noel){/* couronne de Noël et guirlande du portail */
    g.strokeStyle='#2f6b3a';g.lineWidth=3;g.beginPath();g.arc(CX,dy+12,5,0,7);g.stroke();
    for(let k=0;k<10;k++){const an=k*Math.PI/5;R(CX+Math.cos(an)*5-.4,dy+12+Math.sin(an)*5-.4,.8,.8,k%2?'#ffd25a':'#e8483a');}R(CX-1.6,dy+16.5,3.2,2,'#d23a3a');}
}
/* les deux lanternes verticales */
for(const x of [338,458]){R(x+1.5,150,1,4,ACIER);R(x,154,4,16,ACIER);VG(x+.8,155,2.4,14,JOUR?'#f2ead6':'#ffe0a0',JOUR?'#d8ccb0':'#ffb860');R(x-.5,170,5,1.2,OR);R(x-.5,153,5,1.2,OR);
  if(!JOUR)LUMS.push([x+.8,155,2.4,14]);}

/* ---------- le socle en granit noir poli ---------- */
VG(0,SOCLE,W,PIED-SOCLE,'#3c3a37','#1f1e1c');R(0,SOCLE,W,.8,'#8e8a84');R(0,SOCLE+3,W,.5,'rgba(255,255,255,.12)');
for(let x=0;x<W;x+=PAS)R(x-.25,SOCLE,.5,PIED-SOCLE,'#141312');
if(noel)for(let x=0;x<W;x+=.5){const e=.6+h(x*2|0,3,21)*1.2;R(x,SOCLE-e+.4,.5,e,NEIGE);}

/* ---------- Noël : guirlandes en festons sous la frise, étoile au sommet ---------- */
const bulbes=[];
if(noel){const COUL=['#ff5050','#ffd34a','#5ad06a','#5ab8ff'];
  for(let x0=0;x0<W;x0+=PAS){if(x0>=C0&&x0<C1)continue;for(let t=0;t<=1;t+=1/20)R(x0+t*PAS,FRISE+8+Math.sin(t*Math.PI)*5,.5,.5,'#2a2620');
    for(let k=2;k<20;k+=4){const t=k/20;bulbes.push([x0+t*PAS,FRISE+8.5+Math.sin(t*Math.PI)*5,COUL[(x0/PAS+k)%4]]);}}
  for(let k=0;k<=20;k++){const t=k/20,x=346+t*108,y=68-Math.sin(t*Math.PI)*0-2;if(k%2===0)bulbes.push([x,64,'#ffe6a0']);}
  /* l'étoile */
  const sx=CX,sy=-16;g.fillStyle='#ffe07a';g.beginPath();for(let k=0;k<10;k++){const r=k%2?2:5,a=-Math.PI/2+k*Math.PI/5;g.lineTo(sx+Math.cos(a)*r,sy+Math.sin(a)*r);}g.closePath();g.fill();
  bulbes.push([sx,sy,'#ffe07a',8]);}

/* ---------- la nuit : on assombrit la pierre, on rallume ce qui brille ---------- */
if(!JOUR){g.save();g.globalCompositeOperation='multiply';g.fillStyle='rgb(124,124,176)';g.fillRect(0,-12,W,PIED+12);g.restore();
  g.save();g.globalCompositeOperation='lighter';
  for(const [x,y,w,hh] of LUMS){g.fillStyle='rgba(120,70,20,.62)';g.fillRect(x,y,w,hh);
    const r=g.createRadialGradient(x+w/2,y+hh/2,1,x+w/2,y+hh/2,Math.max(w,hh)*.9);r.addColorStop(0,'rgba(255,170,70,.22)');r.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=r;g.fillRect(x-w,y-hh/2,w*3,hh*2);}
  /* les piliers éclairés depuis le sol */
  for(let x=0;x<=W;x+=PAS){const r=g.createLinearGradient(0,SOCLE,0,SOCLE-90);r.addColorStop(0,'rgba(255,200,130,.22)');r.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=r;g.fillRect(x-4,SOCLE-90,8,90);}
  g.restore();}
for(const [x,y,c,rr] of bulbes){if(!JOUR){g.save();g.globalCompositeOperation='lighter';const r=g.createRadialGradient(x,y,0,x,y,rr||3.4);r.addColorStop(0,c);r.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=r;g.fillRect(x-8,y-8,16,16);g.restore();}
  R(x-.6,y-.6,1.2,1.2,c);R(x-.25,y-.5,.5,.5,'#ffffff');}
}

const NOEL=(()=>{try{const q=new URLSearchParams(location.search).get('noel');if(q!==null)return q==='1';}catch(x){}
  const d=new Date(),m=d.getMonth(),j=d.getDate();return m===10||m===11||(m===0&&j<=6);})();   /* du 1er novembre à l'Épiphanie */
function toileDocks(jour){
  const D=2,c=document.createElement('canvas');c.width=W*D;c.height=250*D;
  const g=c.getContext('2d');g.imageSmoothingEnabled=false;g.setTransform(D,0,0,D,0,12*D);
  dessinerDocksDeco(g,{noel:NOEL,jour});return c;}
let DOCKS_JOUR=null, DOCKS_NUIT=null;
function graverDocks(){if(!DOCKS_JOUR)DOCKS_JOUR=toileDocks(true);return {toile:DOCKS_JOUR,W,H:250,sol:248};}
/* le soir, la façade s'assombrit et ses fenêtres s'allument, au rythme de l'heure du jeu */
function nuitDuMoment(){try{const c=cielDuMoment();return c?Math.max(0,Math.min(1,c.lampes||0)):0;}catch(x){return 0;}}
function dessinerLesDocks(g,o,x,y){
  if(!DOCKS_JOUR)DOCKS_JOUR=toileDocks(true);
  const X0=Math.round(x-W/2), Y0=Math.round(y-248);
  g.drawImage(DOCKS_JOUR,X0,Y0,W,250);
  const k=nuitDuMoment();
  if(k>0.02){if(!DOCKS_NUIT)DOCKS_NUIT=toileDocks(false);g.globalAlpha=k;g.drawImage(DOCKS_NUIT,X0,Y0,W,250);g.globalAlpha=1;}
}

/* LE TRAM : une rame blanche et bleue qui traverse la place toutes les minutes */
let RAME=null;
function graverRame(){
const L=250,HH=56,{c,g,R}=toile(L,HH),s=HH-4;
g.fillStyle='rgba(20,20,26,.28)';g.fillRect(4,s-2,L-8,5);
/* la caisse */
R(6,s-40,L-12,36,'#f3f4f2');
R(6,s-40,L-12,2,'#ffffff');R(6,s-6,L-12,2,'#9aa0a6');
/* le bandeau vitré */
R(10,s-34,L-20,14,'#2e4660');
for(let x=14;x<L-14;x+=18){R(x,s-34,1,14,'#c9d2da');R(x+2,s-32,4,4,'rgba(200,230,255,.35)');}
/* la ligne bleue */
R(6,s-18,L-12,4,'#1e88c8');R(6,s-14,L-12,1,'#13608e');
/* les portes */
for(const x of [44,112,180]){R(x,s-34,14,28,'#c9cfd4');R(x+6,s-34,2,28,'#7a828a');R(x+1,s-32,5,10,'#3e5672');R(x+8,s-32,5,10,'#3e5672');}
/* les deux nez arrondis */
for(const [x,d] of [[2,1],[L-10,-1]]){
  g.fillStyle='#f3f4f2';g.beginPath();g.ellipse(x+4,s-22,8,18,0,0,7);g.fill();
  g.fillStyle='#22364c';g.beginPath();g.ellipse(x+4+d*-1,s-28,5,9,0,0,7);g.fill();
  R(x+2,s-12,4,2,'#ffe6a0');}
/* bogies et pantographe */
for(const x of [30,L/2-10,L-50]){R(x,s-4,20,4,'#2e3036');R(x+3,s-1,5,2,'#55585e');R(x+12,s-1,5,2,'#55585e');}
R(L/2-14,s-44,28,4,'#b0b6bc');g.strokeStyle='#4c5056';g.lineWidth=1.5;g.beginPath();
g.moveTo(L/2-8,s-44);g.lineTo(L/2,s-54);g.lineTo(L/2+8,s-44);g.stroke();R(L/2-6,s-55,12,2,'#4c5056');
return {c,L,HH,s};
}
const PERIODE=46, TRAVERSEE=11;
function dessinerTram(g,o,x,y){
  const t=(Date.now()/1000+(o.sens>0?0:PERIODE/2))%PERIODE;
  if(t>TRAVERSEE)return;
  if(!RAME)RAME=graverRame();
  const k=t/TRAVERSEE, e=k<.5?2*k*k:1-Math.pow(-2*k+2,2)/2;
  const wx=o.sens>0?(-300+e*(W+600)):(W+300-e*(W+600));
  const sx=Math.round(x+(wx-o.x)-RAME.L/2), sy=Math.round(y-RAME.s);
  g.drawImage(RAME.c,sx,sy,RAME.L,RAME.HH);
}

const GRAVEURS={x_jol_docks_sol:graverDocks,x_jol_parasol:graverParasol,x_jol_abri:graverAbri,x_jol_panneau:graverPanneauPort,x_jol_tram:graverVide};
function graver(t){return (GRAVEURS[t]||graverVide)();}

function decor(){
  const D=[];const P=(t,x,y,o)=>D.push(Object.assign({t,x,y,gr:0},o||{}));
  /* la façade des Docks, au demi-pixel */
  P('x_jol_docks_sol',W/2,DOCKS_PIED,{anim:'jol_docks'});
  /* les terrasses devant les Docks */
  for(const x of [92,152,212,588,648,708])P('x_jol_parasol',x,284,{col:[44,12],bas:5});
  /* la station de tram */
  P('x_jol_abri',600,300,{col:[86,6]});
  /* les deux rames, une par voie (elles passent, on ne les heurte pas) */
  P('x_jol_tram',400,330,{anim:'jol_tram',sens:1});
  P('x_jol_tram',400,356,{anim:'jol_tram',sens:-1});
  /* la fontaine au milieu */
  P('x_fontaine',FONT[0],FONT[1],{col:[80,26],bas:8});
  /* les platanes des deux allées */
  for(const y of [430,520,610,700]){P('x_platane',42,y,{col:[12,6]});P('x_platane',W-42,y,{col:[12,6]});}
  /* bancs et réverbères autour de la fontaine */
  for(const [x,y] of [[250,470],[550,470],[250,660],[580,660]])P('bancP',x,y,{col:[23,7]});
  [[150,400],[650,400],[150,740],[650,740],[300,560],[500,560]].forEach(([x,y],i)=>P('lanterneP',x,y,{gr:i+1,col:[4,3]}));
  /* le tableau d'embauche, à deux pas de l'arrivée */
  P('x_tableau',488,662,{col:[34,10]});
  /* le kiosque à journaux */
  P('x_kiosque',150,560,{col:[30,10]});
  /* le panneau du port, au bord du passage piéton */
  P('x_jol_panneau',SORTIE_X+60,PLACE_BAS-2,{col:[6,4]});
  return D;
}

function bloque(x,y){
  if(x<14||x>W-14)return true;
  if(y<DOCKS_PIED+16)return true;                     /* la façade des Docks */
  if(y>PLACE_BAS+4&&Math.abs(x-SORTIE_X)>SORTIE_DEMI)return true;   /* la rue : seulement par le passage */
  if(y>H-4)return true;
  for(const o of DECOR){if(!o.col)continue;
    if(Math.abs(x-o.x)<o.col[0]/2&&y>o.y-o.col[1]&&y<o.y+(o.bas||3))return true;}
  return false;
}

/* LA SORTIE : au bout du passage piéton, on descend au port */
let PARTI=false;
setInterval(()=>{try{
  if(PARTI||typeof joueur==='undefined')return;
  if(joueur.y>PLACE_BAS+22&&Math.abs(joueur.x-SORTIE_X)<SORTIE_DEMI){
    PARTI=true;
    try{texteVolant(joueur.x,joueur.y-40,'Direction le port…','#f0cf7d');}catch(x){}
    try{sauver();}catch(x){}
    setTimeout(()=>{const v=window.MA_VERSION?('&v='+encodeURIComponent(window.MA_VERSION)):'';
      location.href='jeu.html?carte=extramar&arrivee=1&de=joliette'+v;},620);
  }}catch(x){}},150);

ANIM_DECOR.jol_tram=dessinerTram;
ANIM_DECOR.jol_docks=dessinerLesDocks;
return {sol,decor,bloque,graver,depart:DEPART};
})()
