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
/* LES TERRASSES DU PORT, côté ville — version « grand magasin ». Pierre blonde en
   grands blocs, menuiseries champagne, attique vitré sous une casquette blanche, et sur
   le toit la terrasse et ses voiles blanches tendues. Au rez-de-chaussée, de hautes
   vitrines de maisons de luxe, éclairées, sous des marquises de verre ; des oliviers en
   bacs ; un grand hall vitré où l'on devine les escalators. Toile x2. */
function dessinerTerrasses(g,ST){
const W=800,PIED=236,CX=400,JOUR=ST.jour!==false;
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
const halo=(x,y,r,c)=>{const gr=g.createRadialGradient(x,y,0,x,y,r);gr.addColorStop(0,c);gr.addColorStop(1,c.replace(/[\d.]+\)$/,'0)'));g.fillStyle=gr;g.fillRect(x-r,y-r,2*r,2*r);};
const texte=(t,x,y,f,c,esp)=>{g.fillStyle=c;g.font=f;g.textAlign='center';g.textBaseline='middle';if(esp)t=t.split('').join(String.fromCharCode(8202));g.fillText(t,x,y);};
const LUMS=[];
/* le verre : le ciel qui s'y reflète, et la silhouette des platanes de la place */
const reflet=(x,y,w,hh)=>{VG(x,y,w,hh,'#d4e4ee','#55738c');
  for(let k=0;k<w;k+=3){const th=hh*(.25+.2*Math.sin((x+k)*.07)+.1*h((x+k)|0,1,9));g.fillStyle='rgba(70,96,80,.16)';g.fillRect(x+k,y+hh-th,3,th);}
  g.fillStyle='rgba(255,255,255,.22)';g.beginPath();g.moveTo(x+.5,y+hh*.85);g.lineTo(x+Math.min(w*.4,hh*.5),y+.5);g.lineTo(x+Math.min(w*.4,hh*.5)+2.5,y+.5);g.lineTo(x+3,y+hh*.85);g.closePath();g.fill();};
const chaud=(x,y,w,hh)=>{VG(x,y,w,hh,'#fff0d0','#e0a860');LUMS.push([x,y,w,hh]);};

const BLOND='#e4cea0', BLOND_C='#f3e3be', BLOND_S='#c2a678', JOINT='#d6c094';
const CHAMP='#c8b48a', CHAMP_C='#efe2c0', CHAMP_S='#8e7c58', NOIR='#1d1e20';
const CASQ=30, ATT0=34, PIERRE0=62, RDC0=168, SOL=216;
const H0=336, H1=464, E0=688;

/* ---------- le ciel ---------- */
VG(0,-12,W,74,JOUR?'#78b0e6':'#1c2450',JOUR?'#dde9f3':'#3a4272');

/* ---------- la terrasse du toit : ses voiles blanches tendues sur des mâts ---------- */
const voile=(x0,x1,ybas,yhaut)=>{const m=(x0+x1)/2;
  R(x0-.4,yhaut,.8,ybas-yhaut+8,'#9aa0a6');R(x1-.4,yhaut+6,.8,ybas-yhaut+2,'#9aa0a6');
  g.fillStyle=JOUR?'#fbfbf8':'#c8c8d8';g.beginPath();g.moveTo(x0,yhaut);g.quadraticCurveTo(m,yhaut+7,x1,yhaut+6);g.quadraticCurveTo(m+4,ybas-4,m-6,ybas);g.quadraticCurveTo(m-2,ybas-8,x0,yhaut);g.closePath();g.fill();
  g.fillStyle='rgba(120,130,150,.18)';g.beginPath();g.moveTo(x1,yhaut+6);g.quadraticCurveTo(m+4,ybas-4,m-6,ybas);g.quadraticCurveTo(m+6,yhaut+12,x1,yhaut+6);g.fill();
  g.strokeStyle='rgba(140,140,140,.6)';g.lineWidth=.4;g.beginPath();g.moveTo(x0,yhaut);g.quadraticCurveTo(m,yhaut+7,x1,yhaut+6);g.stroke();};
for(let x=18;x<W-40;x+=72){if(x+60>H0&&x<H1)continue;voile(x,x+56,24,2+(x/72%2)*4);}
voile(H0+10,H1-10,22,-6);
/* quelques palmiers dans de grands bacs */
const palmier=(x,y,s)=>{for(let k=0;k<s*20;k+=.5)R(x+Math.sin(k*.07)*1.2,y-k,1.4,.6,mix('#9a7a52','#7a5a3a',k/(s*20)));
  const tx=x+Math.sin(s*20*.07)*1.2,ty=y-s*20;for(let a=0;a<8;a++){const an=-Math.PI+a*Math.PI/7;g.strokeStyle=a%2?'#4f8f50':'#3c7844';g.lineWidth=1.3;g.beginPath();g.moveTo(tx,ty);g.quadraticCurveTo(tx+Math.cos(an)*7,ty+Math.sin(an)*5-3,tx+Math.cos(an)*10,ty+Math.sin(an)*4+3);g.stroke();}
  R(x-3,y-1,7,4,'#d8ccb4');};
for(const x of [10,326,474,790])palmier(x,26,1.1);
/* le garde-corps de verre, main courante inox */
g.fillStyle='rgba(205,232,242,.38)';g.fillRect(0,22,W,8);R(0,21.5,W,.8,'#d8dde2');for(let x=0;x<W;x+=12)R(x,22,.5,8,'#b8bec4');

/* ---------- l'attique vitré, la casquette ---------- */
R(0,ATT0,W,PIERRE0-ATT0,NOIR);
for(let x=0;x<W;x+=20){if(JOUR&&h(x,4,4)>.35)reflet(x+1,ATT0+1,19,PIERRE0-ATT0-2);else chaud(x+1,ATT0+1,19,PIERRE0-ATT0-2);}
for(let x=0;x<=W;x+=20)HG(x-.75,ATT0,1.5,PIERRE0-ATT0,[[0,CHAMP_C],[1,CHAMP_S]]);
R(0,CASQ,W,4,'#f8f7f3');R(0,CASQ,W,.6,'#ffffff');R(0,CASQ+3.5,W,.5,'#cfcac0');OMB(0,ATT0,W,9,.5);


/* ---------- la pierre blonde ---------- */
const pierre=(x0,x1,y0,y1)=>{for(let y=y0;y<y1;y+=18){let x=x0-(((y-y0)/18|0)%2)*30;
  while(x<x1){const w=60,xa=Math.max(x,x0),wa=Math.min(x+w,x1)-xa,hh=Math.min(18,y1-y),d=(h(x|0,y,3)-.5)*7;
    if(wa>0){VG(xa,y,wa,hh,T(BLOND_C,d),T(BLOND,d));R(xa,y,wa,.5,T(BLOND_C,d+10));R(xa,y+hh-.5,wa,.5,JOINT);R(xa,y,.5,hh,JOINT);
      g.strokeStyle='rgba(190,160,110,.18)';g.lineWidth=.4;g.beginPath();const vy=y+3+h(x|0,y,5)*(hh-6);g.moveTo(xa,vy);
      for(let k=0;k<wa;k+=6)g.lineTo(xa+k,vy+Math.sin((x+k)*.2)*1.2);g.stroke();               /* les veines du travertin */
      for(let k=0;k<6;k++)R(xa+2+h(x|0,y,k)*(wa-4),y+2+h(y,x|0,k)*(hh-4),1,.5,'rgba(150,120,80,.2)');}
    x+=w;}}};
pierre(0,H0,PIERRE0,SOL);pierre(H1,E0,PIERRE0,SOL);
R(0,PIERRE0,H0,1.2,'#fbf0d6');R(H1,PIERRE0,E0-H1,1.2,'#fbf0d6');
/* le bandeau de bronze qui court à mi-hauteur */
for(const [a,b] of [[0,H0],[H1,E0]]){R(a,114,b-a,1.6,CHAMP);R(a,114,b-a,.5,CHAMP_C);R(a,115.6,b-a,.5,CHAMP_S);}

/* les hautes baies, cadre champagne, profondeur, lumière dedans */
const baie=(x,y,w,hh)=>{R(x-1.2,y-1.2,w+2.4,hh+2.4,CHAMP_S);HG(x-.8,y-.8,w+1.6,hh+1.6,[[0,CHAMP_C],[.5,CHAMP],[1,CHAMP_S]]);R(x,y,w,hh,NOIR);
  if(JOUR&&h(x|0,y|0,7)>.4)reflet(x+1.5,y+2.5,w-2,hh-3);else chaud(x+1.5,y+2.5,w-2,hh-3);
  R(x,y,1.5,hh,'rgba(20,16,10,.5)');R(x,y,w,2.5,'rgba(20,16,10,.55)');R(x-1.5,y+hh+1.2,w+3,.8,'#fbf0d6');};
for(const [a,b] of [[0,H0],[H1,E0]])for(let x=a+20;x<b-14;x+=48)for(const dx of [0,13]){baie(x+dx,PIERRE0+10,8,40);baie(x+dx,122,8,38);}

/* ---------- l'aile en écailles d'acier champagne ---------- */
{const x0=E0,y0=PIERRE0-2,y1=SOL;R(x0,y0,W-x0,y1-y0,'#6a6458');
  g.save();g.beginPath();g.rect(x0,y0,W-x0,y1-y0);g.clip();
  for(let r=0;r<(y1-y0)/6+2;r++)for(let c=-1;c<(W-x0)/8+2;c++){const x=x0+c*8+(r%2)*4,y=y0+r*6;
    const k=(Math.sin(c*.5+r*.35)+1)/2;g.fillStyle=mix('#a89c84','#f2ead8',k);
    g.beginPath();g.moveTo(x-4,y-1);g.quadraticCurveTo(x,y-5,x+4,y-1);g.lineTo(x+4,y+3);g.quadraticCurveTo(x,y+.5,x-4,y+3);g.closePath();g.fill();
    R(x-3.5,y-1.2,7,.5,'rgba(255,255,255,.45)');R(x-4,y+2.6,8,.5,'rgba(60,50,30,.35)');}
  g.restore();R(x0-2.5,y0,2.5,y1-y0,'rgba(30,24,16,.3)');}

/* ---------- le grand hall ---------- */
{const y0=CASQ+4;
  HG(H0-10,PIERRE0,10,SOL-PIERRE0,[[0,BLOND_C],[1,BLOND_S]]);HG(H1,PIERRE0,10,SOL-PIERRE0,[[0,BLOND_S],[1,'#a48c60']]);
  R(H0,y0,H1-H0,SOL-y0,NOIR);
  /* l'intérieur : la lumière chaude, les niveaux, les escalators en diagonale, un lustre */
  VG(H0+1,y0+1,H1-H0-2,SOL-y0-2,'#fff2d8','#e8b878');LUMS.push([H0+1,y0+1,H1-H0-2,SOL-y0-2]);
  for(const ly of [92,140,186]){R(H0+1,ly,H1-H0-2,2.5,'#c8a878');R(H0+1,ly+2.5,H1-H0-2,1,'rgba(90,60,30,.35)');}
  for(const [x1,y1,x2,y2] of [[H0+14,186,H0+60,140],[H1-14,140,H1-60,92]]){g.strokeStyle='#8e8a84';g.lineWidth=3;g.beginPath();g.moveTo(x1,y1);g.lineTo(x2,y2);g.stroke();g.strokeStyle='#cfcac2';g.lineWidth=1;g.beginPath();g.moveTo(x1,y1-2);g.lineTo(x2,y2-2);g.stroke();}
  for(let k=0;k<14;k++){const x=H0+20+k*6.5;R(x,140-4-h(k,2,2)*2,1.2,4,'#4a3a2a');R(x,186-4-h(k,3,2)*2,1.2,4,'#4a3a2a');}
  R(CX-.3,y0+1,.6,22,'#9a8a6a');for(let k=0;k<9;k++){const a=k*Math.PI/8;R(CX+Math.cos(a)*10-.5,y0+24+Math.sin(a)*3,1,1,'#fff8e0');}halo(CX,y0+25,16,'rgba(255,240,200,.5)');
  /* le reflet du jour par-dessus */
  if(JOUR){g.fillStyle='rgba(205,225,238,.38)';g.fillRect(H0+1,y0+1,H1-H0-2,SOL-y0-2);g.fillStyle='rgba(255,255,255,.25)';g.beginPath();g.moveTo(H0+6,SOL);g.lineTo(H0+70,y0);g.lineTo(H0+80,y0);g.lineTo(H0+16,SOL);g.closePath();g.fill();}
  for(let x=H0;x<=H1;x+=16)HG(x-.6,y0,1.2,SOL-y0,[[0,CHAMP_C],[1,CHAMP_S]]);
  for(let y=y0+24;y<SOL-30;y+=24)R(H0,y,H1-H0,.8,CHAMP);
  /* l'enseigne en lettres dorées sur un bandeau de pierre */
  VG(H0-10,PIERRE0-2,H1-H0+20,14,BLOND_C,BLOND);R(H0-10,PIERRE0-2,H1-H0+20,.6,'#ffffff');OMB(H0-10,PIERRE0+12,H1-H0+20,3,.3);
  texte('LES TERRASSES DU PORT',CX+.4,PIERRE0+5.4,'500 7px Didot,"Bodoni 72",Georgia,serif','rgba(80,60,30,.5)',1);
  texte('LES TERRASSES DU PORT',CX,PIERRE0+5,'500 7px Didot,"Bodoni 72",Georgia,serif','#b08a3e',1);
  /* les oriflammes */
  for(const x of [H0+6,H1-14]){R(x+3.5,y0+30,1,2,'#8a8a8a');VG(x,y0+32,8,44,'#ffffff','#ece6da');g.fillStyle='#ffffff';g.beginPath();g.moveTo(x,y0+76);g.lineTo(x+4,y0+72);g.lineTo(x+8,y0+76);g.fill();
    R(x+1,y0+40,6,.5,'#b08a3e');R(x+1,y0+66,6,.5,'#b08a3e');texte('T',x+4,y0+52,'500 6px Didot,Georgia,serif','#b08a3e');texte('P',x+4,y0+59,'500 6px Didot,Georgia,serif','#b08a3e');}
  /* la porte tambour et l'auvent de verre */
  R(CX-30,SOL-30,60,30,NOIR);VG(CX-29,SOL-29,58,29,'#fff2d8','#e0a860');
  ARC(CX,SOL-15,12,'rgba(40,40,40,.0)');g.strokeStyle=CHAMP;g.lineWidth=1.2;g.beginPath();g.ellipse(CX,SOL-1,12,3,0,Math.PI,0);g.stroke();
  for(const x of [CX-12,CX-4,CX+4,CX+12])R(x-.4,SOL-28,.8,27,CHAMP);R(CX-14,SOL-30,28,2,CHAMP);
  g.fillStyle='rgba(225,240,248,.75)';g.fillRect(CX-46,SOL-36,92,2.5);R(CX-46,SOL-36,92,.5,'#ffffff');R(CX-46,SOL-33.5,92,.5,CHAMP);OMB(CX-44,SOL-33,88,3,.25);
  for(let x=CX-40;x<=CX+40;x+=10){g.save();g.globalAlpha=.6;halo(x,SOL-33,5,'rgba(255,236,190,.9)');g.restore();}
}

/* ---------- les vitrines des maisons de luxe ---------- */
const MAISONS=['JOAILLERIE','PARFUMS','MAROQUINERIE','HORLOGERIE','COUTURE','CHOCOLATIER'];
let im=0;
const vitrine=(x,w)=>{const y=RDC0+6,hh=SOL-y,nom=MAISONS[im%MAISONS.length];im++;
  /* la marquise de verre et son enseigne noire à lettres d'or */
  R(x-6,y-14,w+12,10,NOIR);R(x-6,y-14,w+12,.6,'#4a4a4c');R(x-6,y-4.5,w+12,.5,'#000');
  texte(nom,x+w/2,y-8.8,'500 4.2px Didot,"Bodoni 72",Georgia,serif','#d8b468',1);
  g.fillStyle='rgba(225,240,248,.7)';g.fillRect(x-8,y-4,w+16,2);R(x-8,y-4,w+16,.5,'#ffffff');OMB(x-6,y-2,w+12,3,.3);
  /* l'encadrement champagne, épais */
  HG(x-3,y-1,w+6,hh+1,[[0,CHAMP_C],[.4,CHAMP],[1,CHAMP_S]]);R(x,y+1,w,hh-1,NOIR);
  /* l'intérieur : mur crème, spots, étagères, objets précieux */
  VG(x+1,y+2,w-2,hh-3,'#fff4e0','#e8c890');LUMS.push([x+1,y+2,w-2,hh-3]);
  for(let k=0;k<4;k++){const sx=x+6+k*(w-12)/3;g.save();g.globalAlpha=.8;halo(sx,y+3,7,'rgba(255,250,230,.95)');g.restore();R(sx-.6,y+2,1.2,1.2,'#fffbe8');}
  const type=im%3;
  if(type===0){for(let k=0;k<3;k++){const px=x+8+k*(w-16)/2;R(px-4,SOL-14,8,13,'#2a2624');R(px-4,SOL-14,8,.5,CHAMP);   /* présentoirs */
      g.fillStyle=['#8a4a2a','#2a2a2a','#c89a5a'][k];g.beginPath();g.moveTo(px-4,SOL-15);g.lineTo(px-3,SOL-22);g.lineTo(px+3,SOL-22);g.lineTo(px+4,SOL-15);g.fill();g.strokeStyle='#d8b468';g.lineWidth=.5;g.beginPath();g.arc(px,SOL-22,2.2,Math.PI,0);g.stroke();}}
  else if(type===1){for(let k=0;k<2;k++){const px=x+w*(.3+k*.4);ARC(px,SOL-34,2.4,'#e8e0d4');R(px-3,SOL-31,6,14,['#1e1e22','#7a2a30'][k]);g.fillStyle=['#1e1e22','#7a2a30'][k];g.beginPath();g.moveTo(px-3,SOL-17);g.lineTo(px-5,SOL-4);g.lineTo(px+5,SOL-4);g.lineTo(px+3,SOL-17);g.fill();R(px-.4,SOL-4,.8,3,'#2a2a2a');}}   /* silhouettes de mannequins */
  else{for(const sy of [y+12,y+24])R(x+3,sy,w-6,.8,'#cbb38a');for(let k=0;k<6;k++){const px=x+6+k*(w-12)/5;R(px-1.5,y+8.5,3,3.5,['#d8b468','#e8e0d4','#b06070'][k%3]);R(px-1.5,y+20.5,3,3.5,['#e8e0d4','#d8b468','#4a6a8a'][k%3]);}
    R(x+w/2-6,SOL-12,12,11,'#2a2624');R(x+w/2-6,SOL-12,12,.5,CHAMP);ARC(x+w/2,SOL-14.5,2,'#d8b468');}
  /* le reflet par-dessus, plus léger que la lumière du dedans */
  if(JOUR){g.fillStyle='rgba(255,255,255,.22)';g.beginPath();g.moveTo(x+2,SOL-2);g.lineTo(x+w*.45,y+2);g.lineTo(x+w*.45+4,y+2);g.lineTo(x+6,SOL-2);g.closePath();g.fill();}
  R(x+w/2-.4,y+1,.8,hh-1,CHAMP_S);};
for(const [a,b] of [[0,H0-10],[H1+10,E0]]){const n=Math.floor((b-a)/104);const pas=(b-a)/n;for(let i=0;i<n;i++)vitrine(a+i*pas+18,pas-36);}
/* oliviers en bacs de pierre entre les vitrines */
const olivier=(x)=>{VG(x-6,SOL-10,12,10,'#ece0c6','#c8b48e');R(x-6,SOL-10,12,.6,'#fff8e8');R(x-.6,SOL-24,1.2,14,'#7a6a52');
  for(let k=0;k<26;k++){const a=h(x|0,k,3)*Math.PI*2,r=h(x|0,k,4)*8;ARC(x+Math.cos(a)*r,SOL-28+Math.sin(a)*r*.6,1.6+h(k,x|0,5),k%3?'#8a9a6a':'#a8b48a');}};
for(const [a,b] of [[0,H0-10],[H1+10,E0]]){const n=Math.floor((b-a)/104);const pas=(b-a)/n;for(let i=0;i<=n;i++){const x=a+i*pas;if(x>4&&x<W-4)olivier(Math.min(Math.max(x,10),b-8));}}

/* ---------- le parvis en granit poli, où les vitrines se reflètent ---------- */
VG(0,SOL,W,PIED-SOL,'#4c4e52','#2e3034');R(0,SOL,W,.8,'#a8aaae');for(let x=0;x<W;x+=30)R(x,SOL,.5,PIED-SOL,'#24262a');
for(const [x,y,w] of LUMS.filter(l=>l[1]>RDC0))g.fillStyle='rgba(255,210,150,.10)',g.fillRect(x,SOL+1,w,PIED-SOL-1);

/* ---------- la nuit ---------- */
if(!JOUR){g.save();g.globalCompositeOperation='multiply';g.fillStyle='rgb(120,120,172)';g.fillRect(0,-12,W,PIED+12);g.restore();
  g.save();g.globalCompositeOperation='lighter';for(const [x,y,w,hh] of LUMS){g.fillStyle='rgba(130,80,30,.62)';g.fillRect(x,y,w,hh);}
  const r=g.createLinearGradient(0,SOL,0,SOL-90);r.addColorStop(0,'rgba(255,200,130,.20)');r.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=r;g.fillRect(0,SOL-90,E0,90);
  for(let x=10;x<W;x+=20)halo(x,ATT0+2,10,'rgba(255,220,160,.35)');g.restore();
  texte('LES TERRASSES DU PORT',CX,PIERRE0+5,'500 7px Didot,"Bodoni 72",Georgia,serif','#f2d48a',1);}
}

const NOEL=false;   /* pas de décor de Noël */
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
