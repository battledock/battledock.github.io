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


/* ---------- LA FAÇADE : LES TERRASSES DU PORT ---------- */
/* LES TERRASSES DU PORT, côté place. Pierre blonde en grands bandeaux, fentes vitrées
   horizontales, une peau d'écailles d'acier sur l'aile droite, un grand hall vitré au
   centre, des vitrines sous un auvent, et la terrasse sur le toit, avec ses parasols,
   ses palmiers et son garde-corps de verre. Toile x2, lumière en haut à gauche. */
function dessinerTerrasses(g,ST){
const W=800,PIED=236,CX=400,noel=!!ST.noel,JOUR=ST.jour!==false;
const h=(x,y,k)=>{let n=((x*73856093)^(y*19349663)^(k*83492791))|0;n=(n^(n>>>13))*1274126177|0;return((n^(n>>>16))>>>0)/4294967296;};
const hx=s=>{const v=parseInt(s.slice(1),16);return[(v>>16)&255,(v>>8)&255,v&255];};
const mix=(a,b,k)=>{const A=hx(a),B=hx(b);return 'rgb('+A.map((v,i)=>Math.round(v+(B[i]-v)*k)).join(',')+')';};
const T=(c,d)=>{const a=hx(c);return '#'+a.map(v=>Math.max(0,Math.min(255,Math.round(v+d))).toString(16).padStart(2,'0')).join('');};
const q=v=>Math.round(v*2)/2;
const R=(x,y,w,hh,c)=>{if(w<=0||hh<=0)return;const X=q(x),Y=q(y);g.fillStyle=c;g.fillRect(X,Y,Math.max(.5,q(x+w)-X),Math.max(.5,q(y+hh)-Y));};
const VG=(x,y,w,hh,c1,c2)=>{for(let k=0;k<hh;k+=.5)R(x,y+k,w,.5,mix(c1,c2,k/Math.max(.5,hh-.5)));};
const HG=(x,y,w,hh,st)=>{for(let k=0;k<w;k+=.5){const t=k/Math.max(.5,w-.5);let i=0;while(i<st.length-2&&t>st[i+1][0])i++;const[t0,c0]=st[i],[t1,c1]=st[i+1];R(x+k,y,.5,hh,mix(c0,c1,Math.min(1,Math.max(0,(t-t0)/(t1-t0)))));}};
const OMB=(x,y,w,hh,a)=>{for(let k=0;k<hh;k+=.5)R(x,y+k,w,.5,'rgba(30,24,16,'+(a*(1-k/hh)).toFixed(3)+')');};
const ARC=(cx,cy,r,c,a0=0,a1=7)=>{g.fillStyle=c;g.beginPath();g.arc(cx,cy,r,a0,a1);g.fill();};
const LUMS=[], BULBES=[];
const vitre=(x,y,w,hh,lum)=>{if(lum){VG(x,y,w,hh,'#ffe2a8','#d08a3a');LUMS.push([x,y,w,hh]);return;}
  VG(x,y,w,hh,'#c6dae6','#4a6a88');g.fillStyle='rgba(255,255,255,.22)';g.beginPath();g.moveTo(x+.5,y+hh*.8);g.lineTo(x+Math.min(w*.35,hh*.7),y+.5);g.lineTo(x+Math.min(w*.35,hh*.7)+2.5,y+.5);g.lineTo(x+3,y+hh*.8);g.closePath();g.fill();};
const texte=(t,x,y,px,c,f)=>{g.fillStyle=c;g.font=(f||'bold '+px+'px "Helvetica Neue",Arial,sans-serif');g.textAlign='center';g.textBaseline='middle';g.fillText(t,x,y);};

const BLOND='#e4cfa2', BLOND_C='#f2e2bf', BLOND_S='#c4ab7c', JOINT='#cdb68a';
const ALU='#7d8288', NOIR='#26282b';
const TOIT=50, CORPS=58, AUVENT=172, SOL=216;
const H0=300, H1=500;                 /* le grand hall vitré */
const E0=560;                         /* l'aile en écailles */

/* ---------- le ciel ---------- */
VG(0,-12,W,70,JOUR?'#7fb4e8':'#1c2450',JOUR?'#dceaf4':'#3a4272');

/* ---------- la terrasse sur le toit ---------- */
/* le pavillon des restaurants, en retrait */
R(60,22,240,28,'#efe6d4');R(60,22,240,1,'#ffffff');for(let x=66;x<300;x+=14){vitre(x,27,10,18,!JOUR&&h(x,1,2)<.7);}
R(520,26,200,24,'#efe6d4');R(520,26,200,1,'#ffffff');for(let x=526;x<720;x+=14){vitre(x,30,10,16,!JOUR&&h(x,2,2)<.7);}
/* une pergola */
for(let x=330;x<480;x+=10)R(x,24,1,26,'#a88a62');R(326,23,158,2,'#b8986c');for(let x=330;x<480;x+=4)R(x,25,2.5,1,'#c8a878');
/* palmiers */
const palmier=(x,y,s)=>{for(let k=0;k<s*22;k+=.5)R(x+Math.sin(k*.06)*1.5,y-k,1.6,.6,mix('#9a7a52','#7a5a3a',k/(s*22)));
  const tx=x+Math.sin(s*22*.06)*1.5,ty=y-s*22;
  for(let a=0;a<8;a++){const an=-Math.PI+a*Math.PI/7;g.strokeStyle=a%2?'#4a8a4a':'#3a7440';g.lineWidth=1.4;g.beginPath();g.moveTo(tx,ty);g.quadraticCurveTo(tx+Math.cos(an)*7,ty+Math.sin(an)*5-3,tx+Math.cos(an)*11,ty+Math.sin(an)*4+3);g.stroke();}};
for(const [x,s] of [[46,1.3],[312,1.1],[496,1.2],[744,1.35]])palmier(x,48,s);
/* des parasols carrés, blancs */
for(const x of [110,170,230,560,620,680]){R(x-.5,34,1,14,'#8a8a8a');g.fillStyle='#fbfaf6';g.beginPath();g.moveTo(x-14,36);g.lineTo(x,30);g.lineTo(x+14,36);g.closePath();g.fill();R(x-14,36,28,1,'#d8d4cc');}
/* le garde-corps de verre */
R(0,TOIT-2,W,.8,ALU);g.fillStyle='rgba(200,230,240,.35)';g.fillRect(0,TOIT-1.2,W,8);for(let x=0;x<W;x+=16)R(x,TOIT-2,.6,9,ALU);
/* les guirlandes guinguette de la terrasse */
for(let x0=40;x0<W-40;x0+=60){for(let t=0;t<=1;t+=1/24)R(x0+t*60,TOIT-14+Math.sin(t*Math.PI)*5,.5,.5,'#3a3a3a');
  for(let k=1;k<24;k+=3){const t=k/24;BULBES.push([x0+t*60,TOIT-13.5+Math.sin(t*Math.PI)*5,noel?['#ff5050','#ffd34a','#5ad06a','#5ab8ff'][(k+x0/60)%4|0]:'#ffe6a8']);}}
/* la dalle du toit */
VG(0,TOIT+6,W,4,'#fbf6ea','#d8ccb0');OMB(0,TOIT+10,W,3,.3);

/* ---------- la pierre blonde, en grands bandeaux horizontaux ---------- */
const pierre=(x0,x1,y0,y1)=>{for(let y=y0;y<y1;y+=12){let x=x0-(((y-y0)/12|0)%2)*30;
  while(x<x1){const w=60,xa=Math.max(x,x0),wa=Math.min(x+w,x1)-xa,d=(h(x|0,y,3)-.5)*10;
    if(wa>0){VG(xa,y,wa,Math.min(12,y1-y),T(BLOND_C,d),T(BLOND,d));R(xa,y,wa,.5,'#fbf0d6');R(xa,y+11.5,wa,.5,JOINT);R(xa,y,.5,12,JOINT);
      for(let k=0;k<5;k++)R(xa+2+h(x|0,y,k)*(wa-4),y+2+h(y,x|0,k)*8,1,.5,'rgba(160,130,90,.25)');}
    x+=w;}}};
pierre(0,H0,CORPS,AUVENT);pierre(H1,E0,CORPS,AUVENT);

/* les longues fentes vitrées, profondes, coupées de lames de pierre */
const fente=(x0,x1,y,hh)=>{R(x0,y,x1-x0,hh,'#1e1f22');vitre(x0+1,y+2,x1-x0-2,hh-3,!JOUR&&h(x0|0,y|0,7)<.75);
  OMB(x0,y,x1-x0,3,.55);R(x0,y+hh,x1-x0,1,'#fbf0d6');
  for(let x=x0+6;x<x1;x+=12)HG(x,y,3,hh,[[0,BLOND_S],[.4,BLOND_C],[1,BLOND_S]]);};
for(const [a,b] of [[16,H0-16],[H1+16,E0-14]]){fente(a,b,78,14);fente(a,b,118,14);}

/* ---------- l'aile en écailles d'acier ---------- */
{const x0=E0,y0=CORPS-4,y1=AUVENT;R(x0,y0,W-x0,y1-y0,'#5a6068');
  g.save();g.beginPath();g.rect(x0,y0,W-x0,y1-y0);g.clip();
  for(let r=0;r<(y1-y0)/7+2;r++){for(let c=-1;c<(W-x0)/10+2;c++){const x=x0+c*10+(r%2)*5,y=y0+r*7;
    const k=(Math.sin(c*.45+r*.3)+1)/2, base=mix('#9aa2aa','#e2e6ea',k);
    g.fillStyle=base;g.beginPath();g.moveTo(x,y-5);g.lineTo(x+5,y);g.lineTo(x,y+5);g.lineTo(x-5,y);g.closePath();g.fill();
    g.fillStyle='rgba(255,255,255,.35)';g.beginPath();g.moveTo(x,y-5);g.lineTo(x-5,y);g.lineTo(x-3.5,y);g.lineTo(x,y-3.5);g.closePath();g.fill();
    g.fillStyle='rgba(30,40,50,.25)';g.beginPath();g.moveTo(x+5,y);g.lineTo(x,y+5);g.lineTo(x,y+3.5);g.lineTo(x+3.5,y);g.closePath();g.fill();
    if(h(c+40,r,9)<.3)R(x-.4,y-.4,.8,.8,'rgba(30,40,50,.5)');}}
  g.restore();R(x0-3,y0,3,y1-y0,'rgba(30,24,16,.25)');}

/* ---------- le grand hall vitré au centre ---------- */
{const y0=CORPS-6;
  HG(H0-6,y0,6,SOL-y0,[[0,BLOND_C],[1,BLOND_S]]);HG(H1,y0,6,SOL-y0,[[0,BLOND_S],[1,'#a88f62']]);
  R(H0,y0,H1-H0,SOL-y0,NOIR);
  vitre(H0+1,y0+1,H1-H0-2,SOL-y0-2,!JOUR);
  if(!JOUR){/* l'atrium éclairé : les niveaux et les gens */for(const ly of [96,136])R(H0+1,ly,H1-H0-2,2,'rgba(90,60,30,.6)');}
  for(let x=H0;x<=H1;x+=10)R(x-.3,y0,.6,SOL-y0,ALU);
  for(let y=y0+20;y<SOL;y+=20)R(H0,y,H1-H0,.8,ALU);
  /* l'enseigne en lettres blanches sur le bandeau du haut */
  R(H0-6,CORPS-14,H1-H0+12,10,'#f4e8cc');R(H0-6,CORPS-14,H1-H0+12,.6,'#ffffff');OMB(H0-6,CORPS-4,H1-H0+12,2,.25);
  texte('LES TERRASSES DU PORT',CX,CORPS-8.7,7,JOUR?'#2a3a4c':'#ffe6b0');
  /* les portes coulissantes et leur auvent */
  R(CX-30,SOL-26,60,26,NOIR);vitre(CX-29,SOL-25,28,25,!JOUR);vitre(CX+1,SOL-25,28,25,!JOUR);R(CX-.5,SOL-26,1,26,NOIR);
  R(CX-44,SOL-32,88,3,'#f4f2ee');R(CX-44,SOL-32,88,.6,'#ffffff');OMB(CX-42,SOL-29,84,3,.3);
  if(noel){/* un grand sapin dans le hall */
    const sx=CX,sb=SOL-30;for(let k=0;k<5;k++){const w=6+k*5,y=sb-46+k*9;g.fillStyle=k%2?'#2f6b3a':'#3a7a44';g.beginPath();g.moveTo(sx,y-6);g.lineTo(sx+w,y+6);g.lineTo(sx-w,y+6);g.closePath();g.fill();}
    for(let k=0;k<18;k++)BULBES.push([sx-18+h(k,1,3)*36*(.4+k/30),sb-44+k*2.4,['#ff5050','#ffd34a','#5ab8ff'][k%3]]);
    BULBES.push([sx,sb-52,'#ffe07a',7]);}
}

/* ---------- l'auvent et les vitrines du rez-de-chaussée ---------- */
const ENS=['MODE','CAFÉ','BEAUTÉ','SPORT','LIBRAIRIE','BIJOUX','DÉCO','GLACES'];
for(const [a,b] of [[0,H0-6],[H1+6,W]]){
  R(a,AUVENT,b-a,SOL-AUVENT,NOIR);
  for(let x=a+2;x<b-4;x+=36){const w=Math.min(32,b-x-4),lum=!JOUR||h(x,5,5)<.4;vitre(x+1,AUVENT+8,w,SOL-AUVENT-10,lum);
    R(x+1,AUVENT+2,w,5,'#1a1b1d');texte(ENS[((x/36)|0)%ENS.length],x+1+w/2,AUVENT+4.6,'',JOUR?'#e8e2d4':'#ffe2a0','bold 3px "Helvetica Neue",Arial,sans-serif');
    if(lum&&JOUR)for(let k=0;k<3;k++)R(x+4+k*9,SOL-14-h(x,k,6)*6,6,12+h(x,k,6)*6,['#c8a07a','#7a8aa0','#e8d8c8','#a86a5a'][(h(x,k,8)*4)|0]);
    R(x+w+1,AUVENT,2,SOL-AUVENT,'#3a3c40');}
}
/* l'auvent, une fine dalle blanche en porte-à-faux */
R(0,AUVENT-4,H0-6,4,'#f6f4f0');R(H1+6,AUVENT-4,W-H1-6,4,'#f6f4f0');R(0,AUVENT-4,H0-6,.6,'#ffffff');R(H1+6,AUVENT-4,W-H1-6,.6,'#ffffff');
OMB(0,AUVENT,H0-6,4,.4);OMB(H1+6,AUVENT,W-H1-6,4,.4);
if(noel){for(let x=0;x<W;x+=.5)if(x<H0-6||x>H1+6)R(x,AUVENT-4.8,.5,.9+h(x*2|0,1,4)*.6,'#f5f8fb');}
/* le trottoir de granit */
VG(0,SOL,W,PIED-SOL,'#55575a','#3a3c3f');R(0,SOL,W,.8,'#9a9ca0');for(let x=0;x<W;x+=24)R(x,SOL,.5,PIED-SOL,'#2a2c2e');

/* ---------- la nuit ---------- */
if(!JOUR){g.save();g.globalCompositeOperation='multiply';g.fillStyle='rgb(124,124,176)';g.fillRect(0,-12,W,PIED+12);g.restore();
  g.save();g.globalCompositeOperation='lighter';
  for(const [x,y,w,hh] of LUMS){g.fillStyle='rgba(120,70,20,.6)';g.fillRect(x,y,w,hh);}
  const r=g.createLinearGradient(0,AUVENT,0,SOL);r.addColorStop(0,'rgba(255,200,120,.25)');r.addColorStop(1,'rgba(255,170,80,0)');g.fillStyle=r;g.fillRect(0,AUVENT,W,SOL-AUVENT);
  g.restore();
  texte('LES TERRASSES DU PORT',CX,CORPS-8.7,7,'#ffe6b0');
  g.save();g.globalCompositeOperation='lighter';const gl=g.createRadialGradient(CX,CORPS-9,2,CX,CORPS-9,60);gl.addColorStop(0,'rgba(255,200,120,.22)');gl.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=gl;g.fillRect(CX-70,CORPS-30,140,40);g.restore();}
for(const [x,y,c,rr] of BULBES){if(!JOUR){g.save();g.globalCompositeOperation='lighter';const r=g.createRadialGradient(x,y,0,x,y,rr||3.4);r.addColorStop(0,c);r.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=r;g.fillRect(x-8,y-8,16,16);g.restore();}
  R(x-.6,y-.6,1.2,1.2,c);R(x-.25,y-.5,.5,.5,'#ffffff');}
}

const NOEL=(()=>{try{const q=new URLSearchParams(location.search).get('noel');if(q!==null)return q==='1';}catch(x){}
  const d=new Date(),m=d.getMonth(),j=d.getDate();return m===10||m===11||(m===0&&j<=6);})();   /* du 1er novembre à l'Épiphanie */
function toileDocks(jour){
  const D=2,c=document.createElement('canvas');c.width=W*D;c.height=250*D;
  const g=c.getContext('2d');g.imageSmoothingEnabled=false;g.setTransform(D,0,0,D,0,12*D);
  dessinerTerrasses(g,{noel:NOEL,jour});return c;}
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
