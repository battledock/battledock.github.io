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
/* LES DOCKS, version architecturale (dôme haussmannien). Toile x2 (demi-pixel). La lumière vient du haut à gauche.
   ST.style : 'haussmann' | 'beauxarts' | 'verriere' ; ST.noel */
function dessinerDocks2(g,ST){
const W=800, PIED=236, style=ST.style, noel=!!ST.noel, JOUR=!!ST.jour, FEUX=ST.feux||[], OY=ST.oy||0;const LUMS=[];
const feu=(x,y,w,hh,r,v)=>FEUX.push({x:x+w/2,y:y+hh/2+OY,w,h:hh,r:r||Math.max(14,w*2),vitre:v||'#ffd48a'});
const h=(x,y,k)=>{let n=((x*73856093)^(y*19349663)^(k*83492791))|0;n=(n^(n>>>13))*1274126177|0;return((n^(n>>>16))>>>0)/4294967296;};
const hx=s=>{const v=parseInt(s.slice(1),16);return[(v>>16)&255,(v>>8)&255,v&255];};
const T=(c,d)=>{const a=hx(c);return 'rgb('+a.map(v=>Math.max(0,Math.min(255,Math.round(v+d)))).join(',')+')';};
const mix=(a,b,k)=>{const A=hx(a),B=hx(b);return 'rgb('+A.map((v,i)=>Math.round(v+(B[i]-v)*k)).join(',')+')';};
const q=v=>Math.round(v*2)/2;
const R=(x,y,w,hh,c)=>{const X=q(x),Y=q(y),W2=Math.max(.5,q(x+w)-X),H2=Math.max(.5,q(y+hh)-Y);if(w<=0||hh<=0)return;g.fillStyle=c;g.fillRect(X,Y,W2,H2);};
const P=(x,y,c)=>R(x,y,.5,.5,c);
const VG=(x,y,w,hh,c1,c2)=>{for(let k=0;k<hh;k+=.5)R(x,y+k,w,.5,mix(c1,c2,k/Math.max(.5,hh-.5)));};
const HG=(x,y,w,hh,stops)=>{for(let k=0;k<w;k+=.5){const t=k/Math.max(.5,w-.5);let i=0;while(i<stops.length-2&&t>stops[i+1][0])i++;
  const [t0,c0]=stops[i],[t1,c1]=stops[i+1];R(x+k,y,.5,hh,mix(c0,c1,Math.min(1,Math.max(0,(t-t0)/(t1-t0)))));}};
const OMB=(x,y,w,hh,a)=>{for(let k=0;k<hh;k+=.5)R(x,y+k,w,.5,'rgba(50,34,18,'+(a*(1-k/hh)).toFixed(3)+')');};
const ARC=(cx,cy,r,c,a0=Math.PI,a1=0)=>{g.fillStyle=c;g.beginPath();g.arc(cx,cy,r,a0,a1);g.fill();};

const PIERRE='#e6d6b4', CLAIR='#f6ead0', MI='#d8c49c', OMBRE='#b19a72', SOMBRE='#8f7a58', JOINT='#c9b48c';
const ZINC='#7d8a98', ZINC_C='#a9b6c2', ZINC_S='#5c6874';
const VERRE1='#a9c4d8', VERRE2='#3f5a74';

/* ===== le ciel ===== */
VG(0,0,W,50,(noel&&!JOUR)?'#1c2448':(noel?'#9fb8d4':'#7fb3e6'),(noel&&!JOUR)?'#3a3f6e':(noel?'#dfe8f0':'#cfe3f2'));
if(noel&&!JOUR)for(let i=0;i<180;i++)P(h(i,1,1)*W,h(i,2,1)*44,'rgba(255,255,255,'+(.35+h(i,3,1)*.65).toFixed(2)+')');

/* ===== géométrie ===== */
const TOIT0=14, CORN=46, ET=[{y:58,hh:38},{y:96,hh:38},{y:134,hh:36}], RDC0=176, SOCLE=230;
const BAIE=32;
const CX=W/2, AC0=CX-80, AC1=CX+80;            /* avant-corps central */
const PAV=[[0,84],[W-84,W]];                   /* pavillons d'angle */
const baies=[];for(let x=20;x<W-10;x+=BAIE){const c=x+6.5;if(c>AC0-8&&c<AC1+8)continue;if(c<PAV[0][1]+2&&c>PAV[0][1]-14)continue;if(c>PAV[1][0]-2&&c<PAV[1][0]+14)continue;baies.push(x);}
const baiesAC=[CX-56,CX-6.5-6,CX+30];          /* trois baies au centre */

/* ===== le toit ===== */
if(style!=='beauxarts'){
  /* mansarde en zinc : le brisis, les ardoises, les lucarnes */
  VG(0,TOIT0,W,CORN-TOIT0,ZINC_C,ZINC);
  for(let x=0;x<W;x+=3){R(x,TOIT0,.5,CORN-TOIT0,ZINC_S);R(x+.5,TOIT0,.5,CORN-TOIT0,'rgba(255,255,255,.18)');}
  for(let y=TOIT0+4;y<CORN;y+=4)R(0,y,W,.5,'rgba(40,50,60,.18)');
  R(0,TOIT0-1.5,W,1.5,'#56616c');R(0,TOIT0-1.5,W,.5,'#c4ced8');
  for(let x=10;x<W;x+=6){R(x,TOIT0-3.5,.5,2,'#56616c');ARC(x+.25,TOIT0-4,.8,'#56616c',0,7);}   /* crête */
  for(const x of [60,250,550,740]){VG(x,0,10,TOIT0,'#d6c3a0','#b9a47e');R(x-1,0,12,2,'#9e8a66');R(x+2,1,1.5,1,'#6a5a46');R(x+6,1,1.5,1,'#6a5a46');}
  /* lucarnes */
  for(const x of baies){const lx=x+1, lw=11;
    if(noel)R(lx-3,TOIT0+2.5,lw+6,1,'#f4f8fc');
    VG(lx-2,TOIT0+5,lw+4,CORN-TOIT0-6,CLAIR,MI);
    R(lx,TOIT0+9,lw,CORN-TOIT0-11,VERRE2);VG(lx+.5,TOIT0+9.5,lw-1,CORN-TOIT0-12,VERRE1,VERRE2);
    R(lx+lw/2-.25,TOIT0+9,.5,CORN-TOIT0-11,'#efe6d4');R(lx,TOIT0+20,lw,.5,'#efe6d4');
    g.fillStyle=CLAIR;g.beginPath();g.moveTo(lx-3.5,TOIT0+6);g.lineTo(lx+lw/2,TOIT0);g.lineTo(lx+lw+3.5,TOIT0+6);g.closePath();g.fill();
    g.fillStyle=OMBRE;g.beginPath();g.moveTo(lx+lw/2,TOIT0);g.lineTo(lx+lw+3.5,TOIT0+6);g.lineTo(lx+lw+2,TOIT0+6);g.closePath();g.fill();
    R(lx-3.5,TOIT0+6,lw+7,1,OMBRE);
    if(noel){g.fillStyle='#f4f8fc';g.beginPath();g.moveTo(lx-3.5,TOIT0+6);g.lineTo(lx+lw/2,TOIT0);g.lineTo(lx+lw+3.5,TOIT0+6);g.lineTo(lx+lw+2,TOIT0+5.4);g.lineTo(lx+lw/2,TOIT0+1);g.lineTo(lx-2,TOIT0+5.4);g.closePath();g.fill();}
    R(lx+lw+2,TOIT0+7,1,CORN-TOIT0-8,'rgba(40,50,60,.35)');
  }
}
/* ===== le mur, appareillé ===== */
for(let y=CORN;y<RDC0;y+=4.5){let x=-(((y/4.5)|0)%2)*9;
  while(x<W){const w=16+((h(x|0,y*2|0,3)*8)|0), d=((h(x|0,y*2|0,4)-.5)*10)-(y-CORN)*.05;
    R(x,y,w,4.5,T(PIERRE,d));R(x,y,w,.5,T(CLAIR,d));R(x,y+4,w,.5,T(JOINT,d-4));R(x,y,.5,4.5,T(JOINT,d-8));x+=w;}}
/* pavillons d'angle : chaînes d'angle en bossage */
for(const [a,b] of PAV){
  for(const x of [a,b-12])for(let y=CORN;y<RDC0;y+=9){const L=((y/9)|0)%2?12:8;const xx=x===a?a:b-L;
    VG(xx,y,L,8.5,CLAIR,MI);R(xx,y+8.5,L,.5,OMBRE);R(xx+L-.5,y,.5,9,OMBRE);}
}
/* ===== l'avant-corps central : il avance, il projette son ombre ===== */
R(AC1,CORN,3,RDC0-CORN,'rgba(60,40,20,.20)');R(AC1+3,CORN,2,RDC0-CORN,'rgba(60,40,20,.08)');
for(let y=CORN;y<RDC0;y+=4.5){let x=AC0-(((y/4.5)|0)%2)*9;
  while(x<AC1){const w=Math.min(18,AC1-x), d=((h(x|0,y*2|0,5)-.5)*8)+6;
    R(Math.max(x,AC0),y,w-(x<AC0?AC0-x:0),4.5,T(PIERRE,d));R(Math.max(x,AC0),y,w,.5,T(CLAIR,d));R(Math.max(x,AC0),y+4,w,.5,T(JOINT,d-2));x+=w;}}
R(AC0,CORN,.5,RDC0-CORN,CLAIR);R(AC1-.5,CORN,.5,RDC0-CORN,OMBRE);

/* ===== bandeaux et corniche ===== */
const corniche=(y)=>{
  R(0,y-4,W,1.5,T(CLAIR,6));R(0,y-2.5,W,.5,OMBRE);
  for(let x=0;x<W;x+=4.5){VG(x,y-2,2.5,4,CLAIR,MI);R(x+2.5,y-2,.5,4,OMBRE);}   /* modillons */
  VG(0,y+2,W,2.5,CLAIR,MI);R(0,y+4.5,W,.5,SOMBRE);OMB(0,y+5,W,4,.28);};
corniche(CORN);
for(const e of ET){const yb=e.y+e.hh-2;R(0,yb,W,2,T(CLAIR,2));R(0,yb+2,W,.5,OMBRE);OMB(0,yb+2.5,W,2,.18);}

/* ===== balustrade (beaux-arts) ou balcon filant ===== */
const balustres=(x0,x1,y,hh)=>{R(x0,y,x1-x0,1.5,CLAIR);R(x0,y+1.5,x1-x0,.5,OMBRE);
  for(let x=x0+1;x<x1-2;x+=3){HG(x,y+2,2,hh-4,[[0,CLAIR],[.4,'#fbf3e0'],[1,OMBRE]]);
    R(x-.25,y+2+(hh-4)*.45,2.5,1,'rgba(0,0,0,0)');HG(x-.5,y+2+(hh-4)*.55,3,1.5,[[0,CLAIR],[1,OMBRE]]);}
  R(x0,y+hh-2,x1-x0,2,MI);R(x0,y+hh-.5,x1-x0,.5,SOMBRE);};
const ferronnerie=(x0,x1,y,hh)=>{const F='#26262a';R(x0,y,x1-x0,.8,F);R(x0,y+hh-.5,x1-x0,.5,F);
  for(let x=x0;x<x1;x+=4){R(x,y,.5,hh,F);g.strokeStyle=F;g.lineWidth=.5;g.beginPath();g.arc(x+2,y+hh*.35,1.2,0,7);g.stroke();
    g.beginPath();g.moveTo(x+.5,y+hh*.7);g.quadraticCurveTo(x+2,y+hh*.45,x+3.5,y+hh*.7);g.stroke();}
  R(x0,y+.8,x1-x0,.5,'rgba(255,255,255,.12)');};

/* ===== les fenêtres ===== */
const fenetre=(x,y,fw,fh,opt)=>{
  const lum=!JOUR&&h(x|0,y|0,11)<.6;if(lum)LUMS.push([x+1,y+1,fw-1.5,fh-1]);
  /* chambranle à crossettes */
  VG(x-2.5,y-2.5,fw+5,fh+4,CLAIR,MI);R(x+fw+2,y-2.5,.5,fh+4,OMBRE);
  R(x-3.5,y-3,1,2.5,CLAIR);R(x+fw+2.5,y-3,1,2.5,MI);
  if(opt.arc){ARC(x+fw/2,y,fw/2+2.5,CLAIR);}
  /* l'embrasure, la profondeur */
  R(x,y,fw,fh,'#2a2a2e');if(opt.arc)ARC(x+fw/2,y,fw/2,'#2a2a2e');
  /* le vitrage */
  const v1=lum?'#ffd890':VERRE1, v2=lum?'#d27a2a':VERRE2;
  VG(x+1,y+1,fw-1.5,fh-1,v1,v2);if(opt.arc)ARC(x+fw/2,y+.5,fw/2-1,v1);
  R(x+1,y+1,1,fh-1,'rgba(0,0,0,.25)');R(x+1,y+1,fw-1.5,.8,'rgba(0,0,0,.25)');           /* l'ombre de l'embrasure */
  if(!lum){g.fillStyle='rgba(255,255,255,.28)';g.beginPath();g.moveTo(x+2,y+fh*.15);g.lineTo(x+5,y+1.5);g.lineTo(x+7,y+1.5);g.lineTo(x+2,y+fh*.5);g.closePath();g.fill();}
  /* rideaux */
  if(h(x|0,y|0,12)<.45){R(x+1.5,y+1.5,2.5,fh-3,lum?'#f6d8a8':'#efe7d8');R(x+fw-3.5,y+1.5,2,fh-3,lum?'#f6d8a8':'#efe7d8');}
  /* les menuiseries */
  const M='#f3eee4';R(x+fw/2-.25,y,.5,fh,M);for(let k=1;k<3;k++)R(x+.5,y+fh*k/3,fw-1,.5,M);R(x+.5,y+fh*.68,fw-1,.5,M);
  /* l'appui */
  VG(x-3,y+fh,fw+6,2,CLAIR,MI);R(x-3,y+fh+2,fw+6,.5,SOMBRE);OMB(x-3,y+fh+2.5,fw+6,2,.25);
  if(noel)R(x-3,y+fh-.5,fw+6,1,'#f4f8fc');
  /* couronnement */
  if(opt.fronton==='tri'){g.fillStyle=CLAIR;g.beginPath();g.moveTo(x-4.5,y-3);g.lineTo(x+fw/2,y-9);g.lineTo(x+fw+4.5,y-3);g.closePath();g.fill();
    g.fillStyle=OMBRE;g.beginPath();g.moveTo(x+fw/2,y-9);g.lineTo(x+fw+4.5,y-3);g.lineTo(x+fw+3,y-3);g.closePath();g.fill();R(x-4.5,y-3,fw+9,1,MI);OMB(x-4.5,y-2,fw+9,1.5,.25);
    if(noel){g.fillStyle='#f4f8fc';g.beginPath();g.moveTo(x-4.5,y-3);g.lineTo(x+fw/2,y-9);g.lineTo(x+fw+4.5,y-3);g.lineTo(x+fw/2,y-8);g.closePath();g.fill();}}
  else if(opt.fronton==='seg'){ARC(x+fw/2,y-1,fw/2+4.5,CLAIR,Math.PI,0);ARC(x+fw/2,y-1,fw/2+3,MI,Math.PI,0);R(x-4.5,y-2,fw+9,1.5,MI);OMB(x-4.5,y-.5,fw+9,1.5,.25);
    if(noel)ARC(x+fw/2,y-1.5,fw/2+4.5,'#f4f8fc',Math.PI*1.08,Math.PI*1.92);}
  else{VG(x-3,y-4,fw+6,2,CLAIR,MI);VG(x+fw/2-2,y-5.5,4,5,CLAIR,MI);R(x+fw/2+1.5,y-5.5,.5,5,OMBRE);}   /* linteau et clé */
  if(opt.balcon){const by=y+fh-7;
    VG(x-4.5,by+6.5,fw+9,2,CLAIR,MI);OMB(x-4.5,by+8.5,fw+9,3,.3);
    for(const cx of [x-2.5,x+fw+.5]){VG(cx,by+8.5,2,4,MI,OMBRE);ARC(cx+1,by+12.5,1.2,OMBRE,0,Math.PI);}   /* consoles */
    ferronnerie(x-4,x+fw+4,by,6.5);
    if(noel){for(let k=0;k<fw+8;k+=1.2){ARC(x-4+k,by+.3+Math.sin(k)*.4,.9,'#2f6b3a',0,7);}for(let k=1;k<fw+7;k+=2.6)P(x-4+k,by-.4,['#ff5a4a','#ffd25a','#7ad0ff'][(k|0)%3]);}
  }
};
const fenetres=(xs,dx)=>{for(const x0 of xs){const x=x0+dx;
  fenetre(x,ET[0].y+8,13,25,{fronton:((x0/BAIE)|0)%2?'tri':'seg',balcon:true});
  fenetre(x,ET[1].y+7,13,24,{});
  fenetre(x,ET[2].y+6,13,21,{arc:style==='haussmann'});}};
fenetres(baies,0);

/* balcon filant au troisième (haussmann, verrière) */
if(style!=='beauxarts'){const y=ET[2].y+21;VG(0,y+6,W,2,CLAIR,MI);OMB(0,y+8,W,3,.25);for(let x=8;x<W;x+=BAIE/2)VG(x,y+8,1.5,3,MI,OMBRE);ferronnerie(0,W,y-.5,6.5);}

/* ===== le centre, selon le style ===== */
if(style==='haussmann'){
  /* trois baies à balcons, et un dôme à l'impériale avec son œil-de-bœuf */
  for(const x of baiesAC){fenetre(x,ET[0].y+8,14,25,{fronton:'tri',balcon:true});fenetre(x,ET[1].y+7,14,24,{balcon:true});fenetre(x,ET[2].y+6,14,21,{arc:true});}
  const dy0=-6;
  g.fillStyle=ZINC;g.beginPath();g.moveTo(AC0+4,CORN-3);g.bezierCurveTo(AC0+10,dy0+20,CX-30,dy0+4,CX,dy0+2);g.bezierCurveTo(CX+30,dy0+4,AC1-10,dy0+20,AC1-4,CORN-3);g.closePath();g.fill();
  for(let x=AC0+8;x<AC1-6;x+=3){const t=(x-CX)/(AC1-AC0)*2;g.strokeStyle=Math.abs(t)<.6?ZINC_C:ZINC_S;g.lineWidth=.5;g.beginPath();g.moveTo(x,CORN-4);g.lineTo(CX+(x-CX)*.25,dy0+6);g.stroke();}
  g.fillStyle='rgba(255,255,255,.15)';g.beginPath();g.moveTo(AC0+20,CORN-4);g.bezierCurveTo(AC0+24,20,CX-24,dy0+8,CX-6,dy0+4);g.lineTo(CX-10,dy0+8);g.bezierCurveTo(CX-30,16,AC0+34,26,AC0+30,CORN-4);g.closePath();g.fill();
  if(noel){g.fillStyle='#f4f8fc';g.beginPath();g.moveTo(AC0+10,22);g.bezierCurveTo(AC0+16,10,CX-30,dy0+5,CX,dy0+3);g.bezierCurveTo(CX+30,dy0+5,AC1-16,10,AC1-10,22);g.bezierCurveTo(AC1-20,14,CX+30,dy0+8,CX,dy0+7);g.bezierCurveTo(CX-30,dy0+8,AC0+20,14,AC0+10,22);g.fill();}
  /* œil-de-bœuf et horloge */
  ARC(CX,24,10,CLAIR,0,7);ARC(CX,24,8.5,MI,0,7);ARC(CX,24,7,'#f4eedf',0,7);
  g.strokeStyle='#3a3026';g.lineWidth=.6;g.beginPath();g.arc(CX,24,7,0,7);g.stroke();
  for(let k=0;k<12;k++){const a=k*Math.PI/6;P(CX+Math.cos(a)*5.7-.25,24+Math.sin(a)*5.7-.25,'#3a3026');}
  g.lineWidth=.8;g.beginPath();g.moveTo(CX,24);g.lineTo(CX,19.5);g.moveTo(CX,24);g.lineTo(CX+3.5,25.5);g.stroke();
  for(const [a,c] of [[0,'#e8d6a8'],[Math.PI/2,'#e8d6a8']]){}
  R(CX-1,-2,2,8,'#5a5a5a');ARC(CX,-2,2,'#c9a44a',0,7);   /* l'épi de faîtage */
  /* consoles du grand balcon central */
}
if(style==='beauxarts'){
  /* balustrade sur tout le toit, statues, colonnade et fronton sculpté */
  balustres(0,W,CORN-14,12);
  for(let x=24;x<W;x+=100){if(Math.abs(x-CX)<90)continue;VG(x,CORN-18,6,18,CLAIR,MI);R(x+5.5,CORN-18,.5,18,OMBRE);
    ARC(x+3,CORN-21,3.5,'#c8b48e',Math.PI,0);R(x-.5,CORN-18.5,7,1,MI);   /* pot à feu */
    if(noel)R(x-.5,CORN-22,7,1.5,'#f4f8fc');}
  /* colonnes colossales */
  for(const x of baiesAC)fenetre(x+3,ET[0].y+8,12,25,{balcon:false,fronton:'seg'}),fenetre(x+3,ET[1].y+7,12,24,{}),fenetre(x+3,ET[2].y+6,12,21,{});
  const COL=[AC0+6,CX-40,CX+30,AC1-16];
  for(const x of COL){const y0=CORN+10,y1=RDC0-2;
    R(x+10,y0,3,y1-y0,'rgba(60,40,20,.22)');                                   /* l'ombre portée sur le mur */
    HG(x,y0,10,y1-y0,[[0,MI],[.25,'#fff6e2'],[.55,CLAIR],[1,OMBRE]]);
    for(let k=1.5;k<10;k+=2)R(x+k,y0+4,.5,y1-y0-8,'rgba(120,96,60,.22)');      /* les cannelures */
    VG(x-1.5,y1-4,13,2,CLAIR,MI);VG(x-2.5,y1-2,15,2,CLAIR,OMBRE);              /* base */
    VG(x-2,y0-1,14,3,CLAIR,MI);for(let k=0;k<5;k++)ARC(x-1+k*3,y0+2.5,1.6,k%2?MI:'#efe2c2',0,Math.PI);   /* chapiteau à feuilles */
    ARC(x-1.5,y0-1,1.5,CLAIR,0,7);ARC(x+11.5,y0-1,1.5,MI,0,7);VG(x-3,y0-4,16,3,'#fbf2de',MI);}
  /* entablement et fronton */
  VG(AC0-2,CORN+2,AC1-AC0+4,6,CLAIR,MI);R(AC0-2,CORN+8,AC1-AC0+4,.5,SOMBRE);OMB(AC0-2,CORN+8.5,AC1-AC0+4,3,.3);
  g.fillStyle='#fbf2de';g.beginPath();g.moveTo(AC0-6,CORN+2);g.lineTo(CX,CORN-30);g.lineTo(AC1+6,CORN+2);g.closePath();g.fill();
  g.fillStyle=MI;g.beginPath();g.moveTo(AC0+4,CORN);g.lineTo(CX,CORN-25);g.lineTo(AC1-4,CORN);g.closePath();g.fill();
  g.fillStyle=OMBRE;g.beginPath();g.moveTo(CX,CORN-30);g.lineTo(AC1+6,CORN+2);g.lineTo(AC1+3,CORN+2);g.lineTo(CX,CORN-27);g.closePath();g.fill();
  /* le bas-relief : un navire, des figures */
  const S='#c7b087',SC='#e8d8b4';
  g.fillStyle=S;g.beginPath();g.moveTo(CX-22,CORN-4);g.lineTo(CX+22,CORN-4);g.lineTo(CX+16,CORN);g.lineTo(CX-16,CORN);g.closePath();g.fill();
  R(CX-.5,CORN-20,1,16,S);g.fillStyle=SC;g.beginPath();g.moveTo(CX+1,CORN-19);g.quadraticCurveTo(CX+12,CORN-12,CX+1,CORN-6);g.fill();
  g.beginPath();g.moveTo(CX-1,CORN-17);g.quadraticCurveTo(CX-10,CORN-11,CX-1,CORN-6);g.fill();
  for(const [fx,s] of [[CX-38,1],[CX+38,-1]]){ARC(fx,CORN-11,2,SC,0,7);g.fillStyle=SC;g.beginPath();g.moveTo(fx-3,CORN-1);g.quadraticCurveTo(fx,CORN-12,fx+3,CORN-1);g.fill();
    g.strokeStyle=S;g.lineWidth=.8;g.beginPath();g.moveTo(fx,CORN-8);g.lineTo(fx+s*8,CORN-13);g.stroke();}
  /* statues aux acrotères */
  for(const [sx,k] of [[CX,0],[AC0-4,1],[AC1+4,2]]){const sy=k?CORN-14:CORN-30;
    VG(sx-4,sy-2,8,3,CLAIR,MI);g.fillStyle=k===1?'#d9c7a2':'#e9dbbb';
    g.beginPath();g.moveTo(sx-3,sy-2);g.quadraticCurveTo(sx-4,sy-12,sx,sy-14);g.quadraticCurveTo(sx+4,sy-12,sx+3,sy-2);g.fill();
    ARC(sx,sy-15.5,2,'#eee2c6',0,7);R(sx+1,sy-12,.8,9,'rgba(120,96,60,.35)');
    g.strokeStyle='#d9c7a2';g.lineWidth=1;g.beginPath();g.moveTo(sx+1,sy-11);g.lineTo(sx+5,sy-17);g.stroke();
    if(noel)ARC(sx,sy-16.8,2,'#f4f8fc',Math.PI,0);}
  if(noel){g.fillStyle='#f4f8fc';g.beginPath();g.moveTo(AC0-6,CORN+2);g.lineTo(CX,CORN-30);g.lineTo(AC1+6,CORN+2);g.lineTo(AC1+4,CORN+2);g.lineTo(CX,CORN-28.5);g.lineTo(AC0-4,CORN+2);g.closePath();g.fill();R(0,CORN-14.5,W,1,'#f4f8fc');}
}
if(style==='verriere'){
  /* la grande verrière en arc, comme une halle de gare */
  for(const x of [AC0+6,AC1-20]){fenetre(x,ET[0].y+8,13,25,{fronton:'tri',balcon:true});fenetre(x,ET[1].y+7,13,24,{});fenetre(x,ET[2].y+6,13,21,{arc:true});}
  const vx0=CX-46,vx1=CX+46,vy=CORN+10,vb=RDC0+2,r=46;
  /* l'arc de pierre */
  ARC(CX,vy+r-4,r+6,CLAIR,Math.PI,0);ARC(CX,vy+r-4,r+3,MI,Math.PI,0);R(vx0-6,vy+r-4,6,vb-vy-r+4,CLAIR);R(vx1,vy+r-4,6,vb-vy-r+4,MI);
  for(let k=0;k<15;k++){const a0=Math.PI+k*Math.PI/15,a1=a0+Math.PI/15;g.fillStyle=k%2?'#efe2c4':'#e2d0aa';g.beginPath();
    g.moveTo(CX+Math.cos(a0)*(r+3),vy+r-4+Math.sin(a0)*(r+3));g.lineTo(CX+Math.cos(a0)*(r+7),vy+r-4+Math.sin(a0)*(r+7));g.lineTo(CX+Math.cos(a1)*(r+7),vy+r-4+Math.sin(a1)*(r+7));g.lineTo(CX+Math.cos(a1)*(r+3),vy+r-4+Math.sin(a1)*(r+3));g.closePath();g.fill();}
  VG(CX-3,vy-12,6,8,'#fbf2de',MI);
  /* le vitrage */
  g.save();g.beginPath();g.arc(CX,vy+r-4,r,Math.PI,0);g.lineTo(vx1,vb);g.lineTo(vx0,vb);g.closePath();g.clip();
  VG(vx0,vy-6,vx1-vx0,vb-vy+6,noel?'#ffd38a':'#c6dcea',noel?'#c86a24':'#4a6884');
  if(!noel){g.fillStyle='rgba(255,255,255,.25)';g.beginPath();g.moveTo(vx0+8,vb);g.lineTo(vx0+40,vy);g.lineTo(vx0+52,vy);g.lineTo(vx0+20,vb);g.closePath();g.fill();}
  g.strokeStyle='#2c3a48';g.lineWidth=1;for(let k=1;k<10;k++){const a=Math.PI+k*Math.PI/10;g.beginPath();g.moveTo(CX,vy+r+10);g.lineTo(CX+Math.cos(a)*r*1.4,vy+r-4+Math.sin(a)*r*1.4);g.stroke();}
  g.lineWidth=.6;for(let rr=14;rr<r;rr+=10){g.beginPath();g.arc(CX,vy+r-4,rr,Math.PI,0);g.stroke();}
  for(let y=vy+r-4;y<vb;y+=8)R(vx0,y,vx1-vx0,.8,'#2c3a48');for(let x=vx0;x<vx1;x+=9.2)R(x,vy+r-4,.8,vb-vy-r+4,'#2c3a48');
  g.restore();
  g.strokeStyle='#2c3a48';g.lineWidth=1.5;g.beginPath();g.arc(CX,vy+r-4,r,Math.PI,0);g.stroke();
  /* horloge dans l'arc */
  ARC(CX,vy+14,7,'#f4eedf',0,7);g.strokeStyle='#2c3a48';g.lineWidth=1;g.beginPath();g.arc(CX,vy+14,7,0,7);g.stroke();
  g.lineWidth=.8;g.beginPath();g.moveTo(CX,vy+14);g.lineTo(CX,vy+9.5);g.moveTo(CX,vy+14);g.lineTo(CX+3.5,vy+15.5);g.stroke();
}

/* ===== le rez-de-chaussée : bossages, arcades, devantures ===== */
VG(0,RDC0,W,SOCLE-RDC0,MI,'#cdb68c');
for(let y=RDC0;y<SOCLE;y+=6){R(0,y,W,1.2,'#a88f66');R(0,y+1.2,W,.5,CLAIR);}
for(let y=RDC0;y<SOCLE;y+=12)for(let x=(((y-RDC0)/6|0)%2)*14;x<W;x+=28){R(x,y+1.2,.8,4.8,'#a88f66');}
R(0,RDC0-1,W,1.5,CLAIR);OMB(0,RDC0+.5,W,3,.3);
const DEV=[['#2f4a3a','CAFÉ DES DOCKS'],['#6a2430','PÂTISSERIE'],['#22364e','LIBRAIRIE'],['#3a3a3e','MAISON DU SAVON'],['#5a3a22','ÉPICERIE FINE'],['#2f4a3a','FLEURISTE']];
let id=0;
const arcade=(x,aw,porte)=>{const ay=RDC0+16, r=aw/2;
  /* claveaux en bossage */
  for(let k=0;k<11;k++){const a0=Math.PI+k*Math.PI/11,a1=a0+Math.PI/11;g.fillStyle=k%2?'#eadbb8':'#d9c49c';g.beginPath();
    g.moveTo(x+r+Math.cos(a0)*r,ay+Math.sin(a0)*r);g.lineTo(x+r+Math.cos(a0)*(r+5),ay+Math.sin(a0)*(r+5));g.lineTo(x+r+Math.cos(a1)*(r+5),ay+Math.sin(a1)*(r+5));g.lineTo(x+r+Math.cos(a1)*r,ay+Math.sin(a1)*r);g.closePath();g.fill();}
  /* mascaron sur la clé */
  VG(x+r-2.5,ay-r-6,5,6.5,'#f4e8cc','#cbb48a');P(x+r-1.2,ay-r-3.5,'#7a6648');P(x+r+.7,ay-r-3.5,'#7a6648');R(x+r-.75,ay-r-1.8,1.5,.5,'#7a6648');
  /* l'ouverture et sa profondeur */
  ARC(x+r,ay,r,'#1d232c');R(x,ay,aw,SOCLE-ay,'#1d232c');
  const [c,txt]=DEV[id%DEV.length];id++;
  const lum=JOUR?h(x|0,3,17)<.5:true;if(!JOUR)LUMS.push([x+2,ay+6,aw-4,20]);
  /* imposte en éventail */
  ARC(x+r,ay+.5,r-1.5,lum?'#f0c070':'#5d7890');g.strokeStyle='#1d232c';g.lineWidth=.5;g.beginPath();
  for(let k=1;k<7;k++){const a=Math.PI+k*Math.PI/7;g.moveTo(x+r,ay+.5);g.lineTo(x+r+Math.cos(a)*(r-1.5),ay+.5+Math.sin(a)*(r-1.5));}g.stroke();
  ARC(x+r,ay+.5,3,'#1d232c');
  /* la devanture en bois peint */
  R(x+1,ay+1,aw-2,SOCLE-ay-1,c);R(x+1,ay+1,aw-2,.5,T(c,40));
  R(x+1.5,ay+1.5,aw-3,4,T(c,-14));g.fillStyle='#e6c66e';g.font='bold 2.4px Georgia,serif';g.textAlign='center';g.textBaseline='middle';g.fillText(txt,x+r,ay+3.6);
  if(porte){R(x+r-4,ay+7,8,SOCLE-ay-8,T(c,-18));VG(x+r-3,ay+8,6,12,lum?'#ffd890':'#8aa4ba',lum?'#c86a24':'#3a5470');R(x+r-.25,ay+8,.5,SOCLE-ay-9,T(c,-30));P(x+r+2,ay+24,'#e6c66e');}
  for(const sx of porte?[x+2.5,x+r+5]:[x+2.5]){const sw=porte?r-7.5:aw-5;VG(sx,ay+7,sw,18,lum?'#ffe0a0':'#9ab4c8',lum?'#d0782a':'#3e5a74');
    if(!lum){g.fillStyle='rgba(255,255,255,.22)';g.beginPath();g.moveTo(sx+1,ay+20);g.lineTo(sx+sw*.6,ay+7.5);g.lineTo(sx+sw*.6+2,ay+7.5);g.lineTo(sx+2.5,ay+20);g.closePath();g.fill();}
    for(let k=0;k<3;k++)R(sx+1+k*sw/3.2,ay+21-h(x|0,k,18)*5,sw/4,4+h(x|0,k,18)*5,['#b07a4a','#d8b080','#6a8a5a','#e8d8c0'][(h(x|0,k,19)*4)|0]);
    R(sx,ay+25,sw,SOCLE-ay-26,T(c,-10));R(sx+.5,ay+26,sw-1,SOCLE-ay-28,T(c,6));}
  /* les appliques en fonte */
  for(const lx of [x-4,x+aw+2.5]){R(lx+.5,ay+2,1,1,'#222');R(lx,ay+3,2,4,'#222');R(lx+.4,ay+3.5,1.2,3,!JOUR?'#ffd88a':'#e8e0c8');R(lx+.7,ay+7,.6,1.5,'#222');}
  if(noel){g.strokeStyle='#2f6b3a';g.lineWidth=1.4;g.beginPath();g.arc(x+r,ay+14,3,0,7);g.stroke();for(let k=0;k<8;k++)P(x+r+Math.cos(k*.785)*3,ay+14+Math.sin(k*.785)*3,k%2?'#3f8a4a':'#d83a3a');R(x+r-1,ay+16.5,2,1.2,'#d83a3a');
    g.strokeStyle='#f4f8fc';g.lineWidth=1.3;g.beginPath();g.arc(x+r,ay-.3,r+5.2,Math.PI*1.12,Math.PI*1.88);g.stroke();}
};
for(const x of baies)arcade(x-2,17,h(x,9,9)<.5);
/* le grand portail central */
{const pw=style==='verriere'?60:44,ay=RDC0+20,r=pw/2,x=CX-r;
  R(x-8,RDC0,pw+16,SOCLE-RDC0,'#efe2c2');for(let y=RDC0;y<SOCLE;y+=6)R(x-8,y,pw+16,1,'#c9b084');
  for(let k=0;k<13;k++){const a0=Math.PI+k*Math.PI/13,a1=a0+Math.PI/13;g.fillStyle=k%2?'#f6ead0':'#e2cfa8';g.beginPath();
    g.moveTo(CX+Math.cos(a0)*r,ay+Math.sin(a0)*r);g.lineTo(CX+Math.cos(a0)*(r+6),ay+Math.sin(a0)*(r+6));g.lineTo(CX+Math.cos(a1)*(r+6),ay+Math.sin(a1)*(r+6));g.lineTo(CX+Math.cos(a1)*r,ay+Math.sin(a1)*r);g.closePath();g.fill();}
  ARC(CX,ay,r,'#1a2028');R(x,ay,pw,SOCLE-ay,'#1a2028');
  ARC(CX,ay+.5,r-2,noel?'#f2c06a':'#7c98b0');g.strokeStyle='#1a2028';g.lineWidth=.7;g.beginPath();for(let k=1;k<10;k++){const a=Math.PI+k*Math.PI/10;g.moveTo(CX,ay);g.lineTo(CX+Math.cos(a)*(r-2),ay+Math.sin(a)*(r-2));}g.stroke();ARC(CX,ay,4,'#1a2028');
  for(const sx of [x+2,CX+1]){const sw=r-3;VG(sx,ay+1,sw,SOCLE-ay-1,'#7a5434','#5a3c24');for(let k=0;k<3;k++){R(sx+2,ay+4+k*11,sw-4,8,'#664628');R(sx+2,ay+4+k*11,sw-4,.5,'#9a7448');R(sx+2,ay+11.5+k*11,sw-4,.5,'#3e2a18');}}
  R(CX-2.5,ay+18,.8,3,'#e2c060');R(CX+1.7,ay+18,.8,3,'#e2c060');
  /* le cartouche au-dessus */
  VG(CX-26,RDC0-10,52,9,'#2a3a50','#1e2a3c');R(CX-26,RDC0-10,52,.5,'#6a84a0');R(CX-25,RDC0-9,50,.5,'#c9a04a');R(CX-25,RDC0-2.5,50,.5,'#c9a04a');
  g.fillStyle='#ecc86a';g.font='bold 6px Georgia,serif';g.textAlign='center';g.textBaseline='middle';g.fillText(noel?'JOYEUX NOËL':'LES DOCKS',CX,RDC0-5.3);
  for(const lx of [x-14,x+pw+10]){R(lx+1,ay-6,2,2,'#222');R(lx,ay-4,4,7,'#222');R(lx+.8,ay-3.2,2.4,5.4,'#ffd88a');R(lx+1.2,ay+3,1.6,10,'#222');}
  if(noel){g.strokeStyle='#2f6b3a';g.lineWidth=3;g.beginPath();g.arc(CX,ay+14,6,0,7);g.stroke();for(let k=0;k<12;k++)P(CX+Math.cos(k*.52)*6,ay+14+Math.sin(k*.52)*6,k%2?'#ffd25a':'#ff5a4a');R(CX-2,ay+19,4,2.5,'#d23a3a');}
}
/* le socle de granit */
VG(0,SOCLE,W,PIED-SOCLE,'#9a948a','#6e695f');R(0,SOCLE,W,.5,'#c8c2b6');for(let x=0;x<W;x+=22)R(x,SOCLE,.5,PIED-SOCLE,'#5e5a52');
if(noel)for(let x=0;x<W;x+=.5){const e=.6+h(x*2|0,3,21)*1.4;R(x,SOCLE-e+.5,.5,e,'#f2f6fa');}

/* ===== la nuit (calque du soir) et Noël ===== */
if(!JOUR){g.save();g.globalCompositeOperation='multiply';g.fillStyle='rgb(128,128,178)';g.fillRect(-10,-20,W+20,PIED+20);g.restore();
  g.save();g.globalCompositeOperation='lighter';
  for(const [x,y,w,hh] of LUMS){g.fillStyle='rgba(110,64,18,.6)';g.fillRect(x,y,w,hh);const r2=g.createRadialGradient(x+w/2,y+hh/2,1,x+w/2,y+hh/2,w*1.3);r2.addColorStop(0,'rgba(255,170,70,.25)');r2.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=r2;g.fillRect(x-w,y-w/2,w*3,hh+w);}
  const gr=g.createLinearGradient(0,RDC0,0,SOCLE);gr.addColorStop(0,'rgba(255,170,80,0)');gr.addColorStop(1,'rgba(255,170,80,.14)');g.fillStyle=gr;g.fillRect(0,RDC0,W,SOCLE-RDC0);
  g.restore();}
if(noel){
  const amp=(x,y,c,r=3.4)=>{if(JOUR){R(x-.75,y-.75,1.5,1.5,c);R(x-.25,y-.5,.5,.5,'#ffffff');return;}g.save();g.globalCompositeOperation='lighter';const gr=g.createRadialGradient(x,y,0,x,y,r);gr.addColorStop(0,c);gr.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=gr;g.fillRect(x-r,y-r,2*r,2*r);g.restore();R(x-.5,y-.5,1,1,'#fffbe8');};
  const COUL=['#ff5050','#ffd34a','#5ad06a','#5ab8ff','#ff9a3a'];
  for(let x0=0;x0<W;x0+=BAIE){for(let t=0;t<=1;t+=1/16)R(x0+t*BAIE,CORN+8+Math.sin(t*Math.PI)*6,.5,.5,'#222');
    for(let k=1;k<16;k+=3){const t=k/16;amp(x0+t*BAIE,CORN+8.5+Math.sin(t*Math.PI)*6,COUL[((x0/BAIE)+k)%5]);}}
  for(let x=0;x<W;x+=4)amp(x,RDC0-1.5,'#ffd88a',3);
}
}

const NOEL=(()=>{try{const q=new URLSearchParams(location.search).get('noel');if(q!==null)return q==='1';}catch(x){}
  const d=new Date(),m=d.getMonth(),j=d.getDate();return m===10||m===11||(m===0&&j<=6);})();   /* du 1er novembre à l'Épiphanie */
function toileDocks(jour){
  const D=2,c=document.createElement('canvas');c.width=W*D;c.height=250*D;
  const g=c.getContext('2d');g.imageSmoothingEnabled=false;g.setTransform(D,0,0,D,0,12*D);
  dessinerDocks2(g,{style:'haussmann',noel:NOEL,jour,oy:12});return c;}
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
