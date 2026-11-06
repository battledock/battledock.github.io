/* ================= LA PLACE DE LA JOLIETTE =================
   La carte d'arrivée (800 × 800). En haut, la façade des Docks ; devant,
   le trottoir et ses terrasses ; puis la double voie du tram ; puis la
   grande place, sa fontaine, ses platanes et le tableau d'embauche. Tout
   en bas, le passage piéton qui descend vers le port.
   Ce morceau ne touche à rien d'autre : le sol, le décor, les collisions
   et la sortie vivent ici, et le moteur ne fait que les appeler. */
(()=>{
const W=800, H=800;
const DOCKS_PIED=236, TROTTOIR=346, TRAM0=346, TRAM1=422, PLACE_BAS=760;
const SORTIE_X=400, SORTIE_DEMI=44;
const DEPART=[400,712];
const FONT=[400,592];
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

/* LE PARVIS DES TERRASSES : grandes dalles claires et bandes incrustées plus sombres */
dalles(g,R,0,DOCKS_PIED,W,TROTTOIR-DOCKS_PIED,['#e6e0d6','#e2dcd2','#eae4da','#ded8cc'],46,18);
for(let x=20;x<W;x+=80){R(x,DOCKS_PIED+16,40,6,'#c8bcaa');R(x,DOCKS_PIED+16,40,.5,'#d8ccba');R(x+20,DOCKS_PIED+34,40,6,'#c8bcaa');}
R(0,DOCKS_PIED,W,3,'rgba(40,30,20,.22)');          /* l'ombre du socle */
/* les grilles d'arbres, en fonte, au pied des pins du parvis */
for(const x of [40,250,550,760]){g.fillStyle='#5a5650';g.beginPath();g.ellipse(x,342,13,5,0,0,7);g.fill();
  g.strokeStyle='#3a3834';g.lineWidth=1;for(let r=3;r<13;r+=3){g.beginPath();g.ellipse(x,342,r,r*.38,0,0,7);g.stroke();}}

/* LE TRAM : bordure, pavés gris, deux voies, et le quai de la station côté place */
R(0,TRAM0,W,4,'#b9b3a6');R(0,TRAM0,W,1,'#eae4d6');
for(let y=TRAM0+4;y<402;y+=5){let x=-((y/5|0)%2)*5;
  while(x<W){R(x,y,10,5,teinte('#8d8a84',((h(x,y,11)-.5)*16)|0));R(x,y,10,1,'rgba(255,255,255,.10)');R(x,y,1,5,'rgba(0,0,0,.12)');x+=10;}}
for(const ry of [360,372,384,396]){R(0,ry,W,2,'#c8ccd0');R(0,ry+2,W,1,'#4c4f54');}
/* le quai : béton clair, la bande d'éveil podotactile, le liseré blanc du bord */
R(0,402,W,16,'#d6d2ca');R(0,402,W,1,'#f2f0ea');R(0,403,W,1.5,'#f8f8f4');
for(let x=1;x<W;x+=3)R(x,406,1.4,1.4,'#e8d070');for(let x=2.5;x<W;x+=3)R(x,408,1.4,1.4,'#e8d070');
for(let x=0;x<W;x+=24)R(x,402,.5,16,'#c2beb4');
R(0,418,W,4,'#b9b3a6');R(0,TRAM1-1,W,1,'#7f796c');

/* LA PLACE : de grandes dalles claires, quadrillées de bandes de pierre plus sombre */
dalles(g,R,0,TRAM1,W,PLACE_BAS-TRAM1,['#ebe4d6','#e6dfd0','#efe8da','#e2dbcc','#e8e1d3'],56,22);
for(let x=84;x<W-84;x+=104){R(x,TRAM1,4,PLACE_BAS-TRAM1,'#d4c8b2');R(x,TRAM1,1,PLACE_BAS-TRAM1,'#c4b8a0');}
for(let y=TRAM1+40;y<PLACE_BAS;y+=88){R(84,y,W-168,4,'#d4c8b2');R(84,y,W-168,1,'#c4b8a0');}
/* le parvis rond de la fontaine : des anneaux de pavés en éventail */
for(let y=TRAM1;y<PLACE_BAS;y++)for(let x=FONT[0]-170;x<FONT[0]+170;x++){
  const dx=(x-FONT[0])/160, dy=(y-FONT[1]+10)/100, r=Math.sqrt(dx*dx+dy*dy);
  if(r>1)continue;
  const ang=Math.atan2(dy,dx), anneau=(r*9)|0, sect=((ang+Math.PI)/(Math.PI*2)*(18+anneau*6))|0;
  let c=((anneau+sect)%2)?'#e4d6bc':'#dccaa8';
  if(r>.95)c='#c2ae88';else if(Math.abs(r*9-Math.round(r*9))<.06)c='#cbb994';
  g.fillStyle=c;g.fillRect(x,y,1,1);
}
/* les allées des pins, en sable stabilisé */
for(const x0 of [0,W-84]){
  R(x0,TRAM1,84,PLACE_BAS-TRAM1,'#d8c8a2');
  for(let i=0;i<2600;i++){const x=x0+h(i,x0,21)*84, y=TRAM1+h(i,x0,22)*(PLACE_BAS-TRAM1);
    R(x,y,1,1,h(i,x0,23)<.5?'#c4b28a':'#e6d6b2');}
  R(x0===0?82:x0,TRAM1,2,PLACE_BAS-TRAM1,'#bfae88');
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
/* l'abri de la station : poteaux d'acier fins, vitres claires à points sérigraphiés, toit
   à liseré bleu éclairé par-dessous, banc de bois, borne d'information et distributeur */
const L=120,HH=84,{c,g,R}=toile(L,HH),cx=L/2-8,s=HH-6;
g.fillStyle='rgba(30,22,14,.24)';g.beginPath();g.ellipse(cx+4,s+1,48,6,0,0,7);g.fill();
/* le fond vitré */
g.fillStyle='rgba(190,222,236,.40)';g.fillRect(cx-42,s-46,84,44);
for(let x=cx-41;x<cx+42;x+=2.5)for(let y=s-44;y<s-38;y+=2.5)R(x,y,.8,.8,'rgba(255,255,255,.55)');   /* les points sérigraphiés */
g.fillStyle='rgba(255,255,255,.28)';g.beginPath();g.moveTo(cx-38,s-4);g.lineTo(cx-20,s-44);g.lineTo(cx-14,s-44);g.lineTo(cx-32,s-4);g.closePath();g.fill();
for(const x of [cx-42,cx-14,cx+14,cx+41])R(x,s-48,1.2,48,'#5a6068');
R(cx-42,s-24,84,.8,'#5a6068');
/* le plan du réseau, rétroéclairé */
R(cx+16,s-40,22,26,'#f4f2ea');R(cx+16,s-40,22,1,'#1e88c8');
g.strokeStyle='#1e88c8';g.lineWidth=.8;g.beginPath();g.moveTo(cx+18,s-20);g.lineTo(cx+26,s-30);g.lineTo(cx+36,s-30);g.stroke();
g.strokeStyle='#e8a030';g.beginPath();g.moveTo(cx+18,s-34);g.lineTo(cx+28,s-24);g.lineTo(cx+36,s-18);g.stroke();
for(const [px,py] of [[cx+26,s-30],[cx+28,s-24],[cx+22,s-25]]){g.fillStyle='#ffffff';g.beginPath();g.arc(px,py,1.2,0,7);g.fill();g.strokeStyle='#2a2a2a';g.lineWidth=.4;g.stroke();}
/* le banc */
R(cx-36,s-15,44,3,'#b07a48');R(cx-36,s-15,44,.6,'#d09a62');R(cx-34,s-12,1.4,10,'#4a4a4a');R(cx+6,s-12,1.4,10,'#4a4a4a');
/* le toit : une dalle fine, liseré bleu, lumière dessous */
R(cx-48,s-56,96,6,'#f2f2f0');R(cx-48,s-56,96,.8,'#ffffff');R(cx-48,s-51,96,1.8,'#1e88c8');
const gl=g.createLinearGradient(0,s-49,0,s-36);gl.addColorStop(0,'rgba(255,248,220,.55)');gl.addColorStop(1,'rgba(255,248,220,0)');g.fillStyle=gl;g.fillRect(cx-46,s-49,92,13);
/* la borne d'information, le logo du tram */
R(cx+50,s-66,10,66,'#2f3b4c');R(cx+50,s-66,10,.8,'#4a5a70');R(cx+51,s-64,8,8,'#1e88c8');
g.fillStyle='#ffffff';g.font='bold 6px "Trebuchet MS",sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText('T',cx+55,s-59.6);
R(cx+51.5,s-52,7,9,'#0e1a26');R(cx+52.5,s-50.5,5,.8,'#f0b040');R(cx+52.5,s-48.5,4,.8,'#7ad0ff');R(cx+52.5,s-46.5,5,.8,'#7ad0ff');
/* le distributeur de titres */
R(cx-60,s-30,10,30,'#c8ccd2');R(cx-60,s-30,10,.8,'#eef0f2');R(cx-58,s-26,6,5,'#20303c');R(cx-57,s-18,4,1.4,'#2a2a2a');R(cx-51,s-30,1,30,'#9aa0a8');
return {toile:c,W:L+16,H:HH,sol:s,feux:[{x:cx+8,y:s-46,r:30,teinte:'rgba(255,240,200,§)'},{x:cx+27,y:s-28,w:22,h:26,r:18,vitre:'#f6f4ea'}]};
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
/* LES TERRASSES DU PORT, d'après la photo de l'entrée côté boulevard.
   Au centre, l'atrium de verre teinté et son immense chapeau en porte-à-faux, tenu par
   deux mâts à haubans ; deux boîtes vitrées cerclées d'acier rouille, en encorbellement,
   posées sur des colonnes blanches ; le bandeau bleu « Bienvenue ». De chaque côté, les
   ailes en pierre claire : pilastres, panneaux pleins, brise-soleil rouille, grandes baies
   d'affiches, boutiques et stores blancs, et le nom en grandes lettres carrées.
   Toile x2, lumière en haut à gauche. Les portes coulissantes sont dessinées à part,
   à chaque image, pour qu'elles s'ouvrent quand on approche. */
const PORTES=[[350,52],[450,52]], PH=64;   /* les deux entrées coulissantes : x, largeur ; leur hauteur */
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
const texte=(t,x,y,f,c,al)=>{g.fillStyle=c;g.font=f;g.textAlign=al||'center';g.textBaseline='middle';g.fillText(t,x,y);};
const LUMS=[];

const PIERRE='#e9dfd2', PIERRE_C='#f6efe6', PIERRE_S='#cbbcaa', JOINT='#d8ccbc', PANNEAU='#d2c6b6';
const ROUILLE='#7a3f2a', ROUILLE_C='#a2583a', ROUILLE_S='#4e2618';
const VERRE='#17262c', MONTANT='#2f6466', BLEU='#2050a6';
const SOL=222;
const A0=322, A1=478;                 /* l'atrium */
const B0=272, B1=528;                 /* l'emprise des boîtes et du bandeau */
const TOIT=70;                        /* le haut des ailes */

/* ---------- le ciel ---------- */
VG(0,-12,W,90,JOUR?'#1f86d0':'#141c44',JOUR?'#58b2ea':'#323a6a');

/* ---------- les ailes : le toit en débord et ses sheds vitrés ---------- */
for(const [a,b] of [[0,B0],[B1,W]]){
  for(let x=a+6;x<b-20;x+=34){g.fillStyle=JOUR?'#9fb6c4':'#5a6680';g.beginPath();g.moveTo(x,TOIT-4);g.lineTo(x+16,TOIT-14);g.lineTo(x+32,TOIT-4);g.closePath();g.fill();
    g.fillStyle=JOUR?'#c8dae4':'#7a86a0';g.beginPath();g.moveTo(x,TOIT-4);g.lineTo(x+16,TOIT-14);g.lineTo(x+16,TOIT-4);g.closePath();g.fill();
    for(let k=2;k<32;k+=4)R(x+k,TOIT-12+Math.abs(k-16)*.6,.4,10-Math.abs(k-16)*.6,'rgba(60,80,90,.4)');}
  /* la casquette et ses bracons en V */
  R(a-(a?0:6),TOIT-6,b-a+(a?6:6),3,'#ece6dc');R(a-(a?0:6),TOIT-3,b-a+(a?6:6),1.4,ROUILLE);OMB(a,TOIT-1.6,b-a,3,.25);
  for(let x=a+18;x<b-8;x+=54){g.strokeStyle='#5a5a5a';g.lineWidth=.6;g.beginPath();g.moveTo(x-6,TOIT-3);g.lineTo(x,TOIT+1);g.lineTo(x+6,TOIT-3);g.stroke();}
  for(let x=a+12;x<b-6;x+=54){R(x,TOIT-12,10,6,'#d6ccbe');R(x,TOIT-12,10,.6,'#f2ece2');}   /* les édicules du toit */
}

/* ---------- la pierre claire, en grands carreaux ---------- */
const pierre=(x0,x1,y0,y1)=>{for(let y=y0;y<y1;y+=9){for(let x=x0;x<x1;x+=18){const d=(h(x|0,y,3)-.5)*6;
  R(x,y,Math.min(18,x1-x),Math.min(9,y1-y),T(PIERRE,d));R(x,y,Math.min(18,x1-x),.4,T(PIERRE_C,d));R(x,y,.4,9,JOINT);}}};
for(const [a,b] of [[0,B0],[B1,W]])pierre(a,b,TOIT,SOL);

/* les travées : pilastres, panneau plein, brise-soleil, baie d'affiche, boutique */
const AFF=[['#3a72b8','#c8dcf0'],['#e8e4dc','#2a2a2a'],['#2d5fa8','#9ec4ea'],['#efe8de','#6a4a3a'],['#3a72b8','#c8dcf0']];
for(const [a,b] of [[0,B0],[B1,W]]){
  for(let x=a+(a?14:4);x<b-20;x+=54){const w=40;
    /* le panneau plein, en retrait */
    R(x,98,w,30,PANNEAU);OMB(x,98,w,4,.35);R(x,98,1.5,30,'rgba(30,24,16,.18)');
    /* brise-soleil rouille */
    R(x-1,128,w+2,6,ROUILLE);for(let k=0;k<6;k+=1.5)R(x-1,128+k,w+2,.5,ROUILLE_C);R(x-1,133.5,w+2,.5,ROUILLE_S);OMB(x,134,w,2,.3);
    /* la grande baie et son affiche */
    R(x,135,w,38,'#20262a');
    const [c1,c2]=AFF[((x/54)|0)%AFF.length];
    VG(x+1,136,w-2,36,c1,c2);
    if(c1==='#3a72b8'||c1==='#2d5fa8'){for(let i=0;i<20;i++)R(x+2+h(x|0,i,4)*(w-6),137+h(i,x|0,5)*32,3,2,'rgba(255,255,255,.55)');}
    else{R(x+w/2-3,140,6,6,'#3a2a22');R(x+w/2-4,146,8,20,'#2a2a2a');R(x+w/2-6,166,12,4,'#2a2a2a');}
    for(let k=1;k<4;k++)R(x+k*w/4-.3,135,.6,38,'#f2f2f0');R(x,135,w,.8,'#f2f2f0');
    g.fillStyle='rgba(255,255,255,.18)';g.beginPath();g.moveTo(x+2,172);g.lineTo(x+16,136);g.lineTo(x+20,136);g.lineTo(x+6,172);g.closePath();g.fill();
    R(x-1,173,w+2,4,ROUILLE);R(x-1,173,w+2,.6,ROUILLE_C);OMB(x,177,w,2,.3);
    /* la boutique : cadre de bronze, imposte, vitrine éclairée, store à lambrequin, buis en pots */
    {const y0=178,yi=187;const lum=!JOUR||h(x|0,7,7)<.7;
      R(x-.5,y0,w+1,SOL-y0,'#2c2622');R(x,y0,w,1,'#6a5a44');
      /* l'imposte vitrée */
      VG(x+1.5,y0+1.5,w-3,yi-y0-2.5,'#d8e6ee','#8aa4b4');for(let k=1;k<4;k++)R(x+1.5+k*(w-3)/4-.25,y0+1.5,.5,yi-y0-2.5,'#2c2622');
      R(x,yi-1,w,1.2,'#2c2622');R(x,yi-1,w,.4,'#b89a62');
      /* la vitrine : un intérieur chaud, des étagères, quelques objets, deux spots */
      if(lum){VG(x+1.5,yi,w-3,SOL-yi-4,'#fff3dc','#e2b878');LUMS.push([x+1.5,yi,w-3,SOL-yi-4]);}
      else VG(x+1.5,yi,w-3,SOL-yi-4,'#a8bccb','#405a6c');
      const t=((x/54)|0)%3;
      if(t===0){for(const sy of [yi+9,yi+18]){R(x+3,sy,w-6,.8,'#8a6a44');for(let k=0;k<6;k++)R(x+5+k*(w-10)/5,sy-3-h(x|0,k+sy,2)*2,2.4,3+h(x|0,k+sy,2)*2,['#c86a4a','#e8d8b8','#5a7a8a','#d8a848'][(k+sy)%4]);}}
      else if(t===1){for(let k=0;k<2;k++){const px=x+w*(.3+k*.4);R(px-.3,yi+4,.6,4,'#5a4a3a');g.fillStyle=['#2a2a2e','#8a3a3a'][k];g.beginPath();g.moveTo(px-3,yi+8);g.lineTo(px+3,yi+8);g.lineTo(px+4.5,SOL-6);g.lineTo(px-4.5,SOL-6);g.closePath();g.fill();R(px-1.5,yi+5.5,3,2.5,'#e6d6c0');}}
      else{R(x+w/2-7,SOL-14,14,10,'#5a4636');R(x+w/2-7,SOL-14,14,.6,'#b89a62');for(let k=0;k<3;k++)R(x+w/2-5+k*4,SOL-18-k,3,4+k,['#e8c8a0','#c89a6a','#f2e2c8'][k]);}
      if(lum)for(const sx of [x+w*.3,x+w*.7]){const gr=g.createRadialGradient(sx,yi+1,0,sx,yi+1,8);gr.addColorStop(0,'rgba(255,252,236,.9)');gr.addColorStop(1,'rgba(255,252,236,0)');g.fillStyle=gr;g.fillRect(sx-8,yi,16,10);}
      g.fillStyle='rgba(255,255,255,.2)';g.beginPath();g.moveTo(x+2,SOL-5);g.lineTo(x+w*.5,yi+.5);g.lineTo(x+w*.5+3,yi+.5);g.lineTo(x+5,SOL-5);g.closePath();g.fill();
      R(x+w/2-.4,yi,.8,SOL-yi-4,'#2c2622');
      /* le soubassement de bronze, la poignée dorée */
      R(x,SOL-4,w,4,'#2c2622');R(x,SOL-4,w,.4,'#6a5a44');R(x+w/2+1.2,yi+12,.6,6,'#d8b468');
      /* le store à lambrequin, crème liseré */
      g.fillStyle='#f4efe4';g.beginPath();g.moveTo(x-1.5,y0+.5);g.lineTo(x+w+1.5,y0+.5);g.lineTo(x+w+4,y0+8);g.lineTo(x-4,y0+8);g.closePath();g.fill();
      g.fillStyle='rgba(120,100,70,.12)';g.beginPath();g.moveTo(x+w+1.5,y0+.5);g.lineTo(x+w+4,y0+8);g.lineTo(x+w*.6,y0+8);g.closePath();g.fill();
      for(let k=0;k<w+8;k+=4){g.fillStyle='#f4efe4';g.beginPath();g.arc(x-4+k+2,y0+8,2,0,Math.PI);g.fill();}
      R(x-4,y0+7.6,w+8,.6,'#c8a868');OMB(x-3,y0+10,w+6,4,.25);
      /* deux buis en pots */
      for(const bx of [x-3,x+w+3]){R(bx-2.5,SOL-6,5,6,'#3a3430');R(bx-2.5,SOL-6,5,.6,'#6a5a44');
        g.fillStyle='#3e6a3e';g.beginPath();g.arc(bx,SOL-9,3.6,0,7);g.fill();g.fillStyle='#5a8a4e';g.beginPath();g.arc(bx-1,SOL-10,2,0,7);g.fill();}
    }
  }
  /* les pilastres de pierre, leurs petites lanternes */
  for(let x=a+(a?14:4)-7;x<b;x+=54){R(x+6,TOIT,1.5,SOL-TOIT,'rgba(30,24,16,.18)');HG(x-1,TOIT,8,SOL-TOIT,[[0,PIERRE_S],[.3,PIERRE_C],[1,PIERRE_S]]);
    for(let y=TOIT+9;y<SOL;y+=9)R(x-1,y,8,.4,JOINT);
    R(x+2.5,150,2,1,'#3a3a3a');R(x+2,151,3,4,'#3a3a3a');R(x+2.5,151.5,2,3,JOUR?'#e8e2d0':'#ffd890');if(!JOUR)LUMS.push([x+2.5,151.5,2,3]);}
}

/* le nom, en grandes lettres carrées sur l'attique */
const LOGO='bold 12px "Arial Black","Helvetica Neue",Arial,sans-serif';
const glyphe=(x,y)=>{R(x,y,11,8,'#ffffff');R(x+2,y+2,7,4,PIERRE);R(x+9,y+2,2,4,PIERRE);
  R(x+14,y,11,8,'#ffffff');R(x+16,y+2,2,6,PIERRE);R(x+21,y+2,2,6,PIERRE);};
const ecrire=()=>{g.save();g.shadowColor='rgba(60,40,20,.45)';g.shadowOffsetY=.8;g.shadowBlur=.6;
  g.font=LOGO;const w1=g.measureText('LES TERRASSES').width;
  texte('LES TERRASSES',B0-14,TOIT+13,LOGO,'#ffffff','right');texte('DU PORT',B1+14,TOIT+13,LOGO,'#ffffff','left');
  const w2=g.measureText('DU PORT').width;g.restore();
  glyphe(B0-14-w1-34,TOIT+9);glyphe(B1+14+w2+8,TOIT+9);};
ecrire();
/* ---------- l'atrium de verre teinté ---------- */
R(B0,TOIT+14,B1-B0,SOL-TOIT-14,VERRE);VG(B0+1,TOIT+15,B1-B0-2,SOL-TOIT-16,'#24404a','#0e181e');
for(let x=B0;x<=B1;x+=19.5)R(x-.6,TOIT+14,1.2,SOL-TOIT-14,MONTANT);for(let y=TOIT+36;y<SOL;y+=22)R(B0,y,B1-B0,1,MONTANT);
R(A0,TOIT-6,A1-A0,SOL-TOIT+6,VERRE);
VG(A0+1,TOIT-5,A1-A0-2,SOL-TOIT+4,'#2a4a54','#101c22');
/* reflets, ciel et intérieur : des taches bleu-vert, une passerelle */
for(let i=0;i<40;i++){const x=A0+4+h(i,1,11)*(A1-A0-12),y=TOIT+h(i,2,11)*(SOL-TOIT-30);R(x,y,4+h(i,3,11)*10,2+h(i,4,11)*5,['rgba(80,170,200,.35)','rgba(40,90,100,.4)','rgba(150,210,230,.25)'][i%3]);}
R(A0+20,118,A1-A0-40,3,'rgba(60,140,160,.6)');
for(let x=A0;x<=A1;x+=19.5)R(x-.6,TOIT-6,1.2,SOL-TOIT+6,MONTANT);
for(let y=TOIT+14;y<SOL;y+=22)R(A0,y,A1-A0,1,MONTANT);
if(!JOUR)LUMS.push([A0+1,TOIT-5,A1-A0-2,SOL-TOIT+4]);

/* ---------- le grand chapeau, en porte-à-faux au-dessus de l'atrium ---------- */
{const ar=TOIT-6, av=32, l0=A0-22,l1=A1+22, f0=B0-30,f1=B1+30;
  /* la sous-face, vue d'en bas : une grille de panneaux clairs sur poutres rouille */
  g.fillStyle=JOUR?'#d4d6d4':'#8a8c9a';g.beginPath();g.moveTo(l0,ar);g.lineTo(l1,ar);g.lineTo(f1,av);g.lineTo(f0,av);g.closePath();g.fill();
  for(let k=1;k<24;k++){const t=k/24;g.strokeStyle='rgba(60,64,66,.45)';g.lineWidth=.5;g.beginPath();g.moveTo(l0+(l1-l0)*t,ar);g.lineTo(f0+(f1-f0)*t,av);g.stroke();}
  for(let k=1;k<6;k++){const t=k/6,y=ar+(av-ar)*t,x0=l0+(f0-l0)*t,x1=l1+(f1-l1)*t;g.strokeStyle='rgba(60,64,66,.45)';g.lineWidth=.5;g.beginPath();g.moveTo(x0,y);g.lineTo(x1,y);g.stroke();}
  for(const t of [.18,.38,.62,.82]){g.strokeStyle=ROUILLE;g.lineWidth=1.6;g.beginPath();g.moveTo(l0+(l1-l0)*t,ar);g.lineTo(f0+(f1-f0)*t,av);g.stroke();}
  /* le bord avant, mince, en acier */
  R(f0,av-1.6,f1-f0,1.8,ROUILLE_S);R(f0,av-1.6,f1-f0,.5,ROUILLE_C);
  /* les deux mâts et leurs haubans */
  for(const mx of [CX-46,CX+46]){const top=av-18;R(mx-.6,top,1.2,ar-top,ROUILLE_S);
    g.strokeStyle='#4a3a32';g.lineWidth=.45;g.beginPath();
    for(const [x,y] of [[f0+(mx<CX?10:180),av],[f0+(mx<CX?90:250),av-1],[mx-26,av-2],[mx+26,av-2]]){g.moveTo(mx,top);g.lineTo(x,y);}g.stroke();
    g.beginPath();g.moveTo(mx-14,top+6);g.lineTo(mx,top);g.lineTo(mx+14,top+6);g.stroke();}
  OMB(A0,ar,A1-A0,6,.4);
}

/* ---------- les deux boîtes vitrées en encorbellement, et leurs colonnes ---------- */
const boite=(x0,x1,nom,coul)=>{const y0=TOIT+14,y1=TOIT+66;
  R(x0,y0,x1-x0,y1-y0,ROUILLE);R(x0,y0,x1-x0,.8,ROUILLE_C);R(x0,y1-1,x1-x0,1,ROUILLE_S);
  VG(x0+2.5,y0+2.5,x1-x0-5,y1-y0-5,JOUR?'#5e8a8c':'#ffe2b0',JOUR?'#20363a':'#d89a58');if(!JOUR)LUMS.push([x0+2.5,y0+2.5,x1-x0-5,y1-y0-5]);
  /* dedans : des suspensions, des tables, un comptoir */
  for(let k=0;k<4;k++){const lx=x0+10+k*(x1-x0-20)/3;R(lx-.25,y0+2.5,.5,8,'#2a2a2a');R(lx-2,y0+10.5,4,2,'#e8c88a');}
  R(x0+6,y1-14,x1-x0-12,1,'#3a2a22');for(let k=0;k<5;k++)R(x0+8+k*(x1-x0-16)/4,y1-13,1,8,'#3a2a22');
  for(let k=1;k<3;k++)R(x0+k*(x1-x0)/3-.4,y0+2.5,.8,y1-y0-5,ROUILLE);R(x0+2.5,y0+16,x1-x0-5,.8,ROUILLE);
  g.fillStyle='rgba(255,255,255,.2)';g.beginPath();g.moveTo(x0+4,y1-3);g.lineTo(x0+20,y0+3);g.lineTo(x0+26,y0+3);g.lineTo(x0+10,y1-3);g.closePath();g.fill();
  OMB(x0,y1,x1-x0,6,.45);};
boite(B0,A0+14,'CAFÉ','#2f6b4f');boite(A1-14,B1,'SALON DE THÉ','#c8a24a');
for(const cx of [B0+14,B1-14]){HG(cx-4,TOIT+66,8,SOL-TOIT-66,[[0,'#c8c8c4'],[.3,'#ffffff'],[.7,'#ecece8'],[1,'#b0b0aa']]);}

/* ---------- le bandeau bleu « Bienvenue » ---------- */
{const y=SOL-PH-7;R(B0-4,y,B1-B0+8,7,BLEU);R(B0-4,y,B1-B0+8,.6,'#4a78c8');R(B0-4,y+6.5,B1-B0+8,.5,'#122e66');
  R(CX-62,y,124,7,'#173f8e');texte('BIENVENUE AUX TERRASSES DU PORT',CX,y+3.7,'bold 4.4px "Helvetica Neue",Arial,sans-serif','#ffffff');
  for(const gx of [CX-74,CX+64]){R(gx,y+1.5,4,4,'#ffffff');R(gx+1,y+2.5,2,2,'#173f8e');R(gx+5,y+1.5,4,4,'#ffffff');R(gx+6,y+2.5,.8,3,'#173f8e');R(gx+7.2,y+2.5,.8,3,'#173f8e');}}
/* l'entrée : derrière les vitrages, le mail du centre commercial — sol de pierre poli,
   boutiques éclairées au fond, plafond à spots, un escalator, des passants, un palmier en pot.
   Les portes elles-mêmes sont animées à part. */
{const y=SOL-PH, x0=B0, x1=B1;
  R(x0,y,x1-x0,PH,'#1c2a30');
  g.save();g.beginPath();g.rect(x0+1,y+1,x1-x0-2,PH-1);g.clip();
  /* le plafond et ses spots */
  VG(x0,y,x1-x0,14,'#f4efe6','#ddd4c4');for(let x=x0+8;x<x1;x+=16){R(x-1.5,y+5,3,1,'#fffbe8');const gr=g.createRadialGradient(x,y+6,0,x,y+6,9);gr.addColorStop(0,'rgba(255,248,226,.8)');gr.addColorStop(1,'rgba(255,248,226,0)');g.fillStyle=gr;g.fillRect(x-9,y+3,18,12);}
  /* le mur du fond : des vitrines éclairées */
  R(x0,y+14,x1-x0,24,'#e8ddcc');
  for(let x=x0+6;x<x1-20;x+=44){R(x,y+16,36,22,'#3a3230');VG(x+1,y+17,34,21,'#fff2d8','#e6b878');
    for(let k=0;k<4;k++)R(x+4+k*8,y+26-((k*7)%5),5,12+((k*7)%5),['#c86a4a','#e8d8b8','#5a7a8a','#d8a848'][k]);
    R(x,y+15,36,1.4,'#2a2420');}
  /* le sol poli, qui reflète */
  VG(x0,y+38,x1-x0,PH-38,'#d8d0c2','#f2ece2');for(let x=x0;x<x1;x+=14)R(x,y+38,.5,PH-38,'rgba(160,150,130,.35)');
  for(let x=x0+6;x<x1-20;x+=44){g.fillStyle='rgba(255,220,160,.25)';g.fillRect(x+1,y+39,34,8);}
  /* un escalator vers l'étage, à droite */
  g.strokeStyle='#7a7c80';g.lineWidth=3;g.beginPath();g.moveTo(x1-60,y+PH-4);g.lineTo(x1-24,y+16);g.stroke();
  g.strokeStyle='#c8ccd0';g.lineWidth=1;g.beginPath();g.moveTo(x1-62,y+PH-7);g.lineTo(x1-26,y+13);g.stroke();
  /* un palmier en pot, à gauche */
  R(x0+18,y+PH-12,10,11,'#e8e0d2');R(x0+22.5,y+PH-30,1.4,18,'#8a6a4a');
  for(let k=0;k<7;k++){const a=-Math.PI+k*Math.PI/6;g.strokeStyle=k%2?'#4a8a4a':'#3a7440';g.lineWidth=1.2;g.beginPath();g.moveTo(x0+23,y+PH-30);g.quadraticCurveTo(x0+23+Math.cos(a)*6,y+PH-34+Math.sin(a)*3,x0+23+Math.cos(a)*10,y+PH-28+Math.sin(a)*2);g.stroke();}
  /* des passants */
  const passant=(x,c1,c2)=>{g.fillStyle='#e0c0a0';g.beginPath();g.arc(x,y+PH-27,2.2,0,7);g.fill();R(x-2.6,y+PH-24.5,5.2,11,c1);R(x-2.2,y+PH-13.5,1.8,11,c2);R(x+.4,y+PH-13.5,1.8,11,c2);};
  passant(x0+70,'#3a5a8a','#2a2a30');passant(x0+124,'#c8a070','#4a4a52');passant(x0+168,'#8a3a3a','#2a2a30');passant(x0+206,'#e8e2d6','#3a3a40');
  g.restore();
  for(const [px,pw] of PORTES)LUMS.push([px-pw/2,y+1,pw,PH-1]);
  /* les vitrages fixes, leurs montants */
  g.fillStyle='rgba(200,225,232,.16)';g.fillRect(x0+1,y+1,x1-x0-2,PH-1);
  for(let x=x0;x<=x1;x+=16)if(!PORTES.some(([px,pw])=>x>px-pw-1&&x<px+pw+1))R(x-.5,y,1,PH,'#1c2a30');
  R(x0,y,x1-x0,1.2,'#1c2a30');R(x0,y+PH*.48,x1-x0,.8,'rgba(28,42,48,.8)');}

/* ---------- le pied ---------- */
R(0,SOL,W,PIED-SOL,'#d8cfc2');for(let x=0;x<W;x+=20)R(x,SOL,.4,PIED-SOL,'#c4b8a8');R(0,SOL,W,.6,'#f2ebe0');

/* ---------- la nuit ---------- */
if(!JOUR){g.save();g.globalCompositeOperation='multiply';g.fillStyle='rgb(120,120,172)';g.fillRect(0,-12,W,PIED+12);g.restore();
  g.save();g.globalCompositeOperation='lighter';for(const [x,y,w,hh] of LUMS){g.fillStyle='rgba(130,80,30,.6)';g.fillRect(x,y,w,hh);}g.restore();
  const y=SOL-PH-7;R(B0-4,y,B1-B0+8,7,'#2a62c8');texte('BIENVENUE AUX TERRASSES DU PORT',CX,y+3.7,'bold 4.4px "Helvetica Neue",Arial,sans-serif','#ffffff');
  ecrire();}
}
/* les deux entrées coulissantes : leur place dans la façade (x, largeur) */
const PORTE_Y=222-64;                       /* le haut des portes, dans le repère de la façade */
/* les vantaux, dessinés à chaque image par-dessus la façade, s'écartent quand on s'approche */
const OUVERT=PORTES.map(()=>0);
function dessinerLesPortes(g,X0,Y0){
  const dt=Math.min(.05,(performance.now()-(dessinerLesPortes.t||performance.now()))/1000);dessinerLesPortes.t=performance.now();
  PORTES.forEach(([px,pw],i)=>{
    let pres=false;try{const dx=joueur.x-px,dy=joueur.y-236;pres=Math.abs(dx)<pw*1.1&&dy>-6&&dy<72;}catch(x){}
    OUVERT[i]+=((pres?1:0)-OUVERT[i])*Math.min(1,dt*7);
    const o=OUVERT[i], lw=pw/2, dec=o*(lw-2), y=Y0+PORTE_Y+12, x0=X0+px-pw/2;
    for(const [s,bx] of [[-1,x0],[1,x0+lw]]){const x=bx+s*dec;
      g.fillStyle='rgba(28,42,48,.95)';g.fillRect(x,y,lw,.8);g.fillRect(x,y+PH-.8,lw,.8);g.fillRect(x,y,.8,PH);g.fillRect(x+lw-.8,y,.8,PH);
      g.fillStyle='rgba(190,220,228,.28)';g.fillRect(x+.8,y+.8,lw-1.6,PH-1.6);
      g.fillStyle='rgba(255,255,255,.28)';g.beginPath();g.moveTo(x+1.5,y+PH-4);g.lineTo(x+lw*.7,y+1.5);g.lineTo(x+lw*.7+2,y+1.5);g.lineTo(x+3.5,y+PH-4);g.closePath();g.fill();
      g.fillStyle='#c8d0d4';g.fillRect(x+(s<0?lw-3:1.6),y+PH*.45,1.4,8);}
    /* les deux caissons fixes de part et d'autre, où les vantaux viennent se ranger */
    for(const cxx of [x0-lw+2,x0+pw]){g.fillStyle='rgba(200,225,232,.22)';g.fillRect(cxx,y,lw-2,PH);g.fillStyle='rgba(28,42,48,.95)';g.fillRect(cxx,y,lw-2,1);g.fillRect(cxx,y+PH-1,lw-2,1);g.fillRect(cxx,y,1,PH);g.fillRect(cxx+lw-3,y,1,PH);}
    g.fillStyle='rgba(28,42,48,.95)';g.fillRect(x0-1,y-1.5,pw+2,1.5);
  });
}

const NOEL=false;
/* les platanes prennent leurs couleurs d'automne du 22 septembre au 20 décembre (?automne=0 ou 1 pour forcer) */
const AUTOMNE=(()=>{try{const q=new URLSearchParams(location.search).get('automne');if(q!==null)return q==='1';}catch(x){}
  const d=new Date(),m=d.getMonth(),j=d.getDate();return (m===8&&j>=22)||m===9||m===10||(m===11&&j<=20);})();   /* pas de décor de Noël */
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
  try{dessinerLesPortes(g,X0,Y0);}catch(x){}
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
/* LA RAME S'ARRÊTE À LA STATION : elle arrive en freinant, attend, repart en accélérant. */
const PERIODE=52, ARRIVEE=8, ARRET=8, DEPART_T=8, LONG_RAME=250;
function posTram(o){
  const t=(Date.now()/1000+(o.sens>0?0:PERIODE/2))%PERIODE, x0=o.sens>0?-300:W+300, x2=o.sens>0?W+300:-300, xa=o.arret;
  if(t<ARRIVEE){const k=t/ARRIVEE;return x0+(xa-x0)*(1-Math.pow(1-k,3));}
  if(t<ARRIVEE+ARRET)return xa;
  if(t<ARRIVEE+ARRET+DEPART_T){const k=(t-ARRIVEE-ARRET)/DEPART_T;return xa+(x2-xa)*k*k*k;}
  return null;}
function dessinerTram(g,o,x,y){
  const wx=posTram(o);if(wx===null)return;
  if(!RAME)RAME=graverRame();
  const sx=Math.round(x+(wx-o.x)-RAME.L/2), sy=Math.round(y-RAME.s);
  g.drawImage(RAME.c,sx,sy,RAME.L,RAME.HH);
}
/* la rame est un obstacle : on ne la traverse pas */
function dansLaRame(o,x,y){const wx=posTram(o);if(wx===null)return false;return Math.abs(x-wx)<LONG_RAME/2-4&&y>o.y-14&&y<o.y+3;}


/* ---------- LES ARBRES, LES BANCS, LES MASSIFS DE LA PLACE ---------- */
function graverPin(){
const L=130,HH=150,{c,g,R}=toile(L,HH),cx=L/2,s=HH-6;
g.fillStyle='rgba(30,26,18,.22)';g.beginPath();g.ellipse(cx+14,s+1,46,9,0,0,7);g.fill();
/* le tronc, élancé et un peu penché, l'écorce rousse en plaques */
const tr=(t)=>cx+Math.sin(t*2.2)*5-t*4;
for(let y=s;y>s-96;y-=.5){const t=(s-y)/96,x=tr(t),w=5.2-t*2;R(x-w/2,y,w,.6,t<.5?'#7a5642':'#8a6248');
  if(((y*2)|0)%5===0)R(x-w/2+(((y*7)|0)%3)*.6,y,w*.45,.5,'#5a3c2c');R(x+w/2-.8,y,.8,.6,'#4a3022');}
/* les branches qui s'ouvrent */
for(const [dx,dy] of [[-26,-18],[22,-14],[-8,-24],[10,-26]]){const x0=tr(.9),y0=s-88;g.strokeStyle='#6a4a36';g.lineWidth=1.6;g.beginPath();g.moveTo(x0,y0);g.quadraticCurveTo(x0+dx*.4,y0+dy*.8,x0+dx,y0+dy);g.stroke();}
/* le parasol : une couronne plate faite de touffes, sombre dessous, claire dessus */
const touffe=(x,y,r,c)=>{g.fillStyle=c;g.beginPath();g.ellipse(x,y,r,r*.6,0,0,7);g.fill();};
const C0=s-112;
for(let i=0;i<46;i++){const a=(i/46)*Math.PI*2,rr=12+((i*37)%30);touffe(cx-4+Math.cos(a)*rr*1.5,C0+6+Math.sin(a)*rr*.32,9,'#24402a');}
for(let i=0;i<60;i++){const a=(i*2.399),rr=Math.sqrt(i/60)*46;touffe(cx-4+Math.cos(a)*rr,C0+Math.sin(a)*rr*.3,8,'#2f5636');}
for(let i=0;i<40;i++){const a=(i*2.399),rr=Math.sqrt(i/40)*40;touffe(cx-10+Math.cos(a)*rr,C0-3+Math.sin(a)*rr*.26,6,'#40703f');}
for(let i=0;i<26;i++){const a=(i*2.399),rr=Math.sqrt(i/26)*30;touffe(cx-16+Math.cos(a)*rr,C0-6+Math.sin(a)*rr*.22,4,'#5c8c4c');}
for(let i=0;i<40;i++){const a=i*2.399,rr=Math.sqrt(i/40)*44;R(cx-4+Math.cos(a)*rr,C0+Math.sin(a)*rr*.3,1,1,'#78a45a');}
return {toile:c,W:L,H:HH,sol:s};
}
function graverOlivier(){
const L=44,HH=58,{c,g,R}=toile(L,HH),cx=L/2,s=HH-6;
g.fillStyle='rgba(30,26,18,.22)';g.beginPath();g.ellipse(cx+4,s+1,18,4,0,0,7);g.fill();
/* le bac de pierre */
for(let y=s-14;y<s;y+=.5){const k=(y-s+14)/14;R(cx-13,y,26,.6,k<.1?'#f4ecdc':`rgb(${(226-k*30)|0},${(214-k*30)|0},${(192-k*30)|0})`);}
R(cx-14,s-15,28,1.5,'#f6f0e4');R(cx+12,s-14,1,14,'rgba(80,60,40,.25)');
/* le tronc tortueux */
g.strokeStyle='#6e6252';g.lineWidth=2.4;g.beginPath();g.moveTo(cx,s-15);g.bezierCurveTo(cx-4,s-22,cx+4,s-26,cx-1,s-32);g.stroke();
g.lineWidth=1.2;g.beginPath();g.moveTo(cx-1,s-30);g.lineTo(cx-8,s-38);g.moveTo(cx,s-31);g.lineTo(cx+7,s-39);g.stroke();
/* le feuillage argenté */
for(let i=0;i<60;i++){const a=i*2.399,rr=Math.sqrt(i/60)*15;g.fillStyle=i%3?'#8a9a72':'#a8b88e';g.beginPath();g.ellipse(cx+Math.cos(a)*rr,s-40+Math.sin(a)*rr*.6,2.6,1.6,a,0,7);g.fill();}
for(let i=0;i<18;i++){const a=i*2.399,rr=Math.sqrt(i/18)*11;R(cx-3+Math.cos(a)*rr,s-44+Math.sin(a)*rr*.5,1,1,'#cfd8bc');}
return {toile:c,W:L,H:HH,sol:s};
}
function graverBancBois(){
const L=46,HH=26,{c,g,R}=toile(L,HH),cx=L/2,s=HH-6;
g.fillStyle='rgba(30,26,18,.22)';g.beginPath();g.ellipse(cx+3,s+1,21,3.5,0,0,7);g.fill();
/* deux socles de pierre */
for(const x of [cx-17,cx+11]){R(x,s-8,6,8,'#d8cdb8');R(x,s-8,6,.6,'#f2eadc');R(x+5.4,s-8,.6,8,'#b0a48c');}
/* l'assise et le dossier en lattes de bois */
for(let k=0;k<3;k++){R(cx-20,s-10+k*1.4,40,1.1,['#c08a56','#a87444','#b47e4c'][k]);}
R(cx-20,s-6,40,.6,'#6a4628');
for(let k=0;k<3;k++)R(cx-20,s-19+k*2.2,40,1.6,['#c89260','#b07a48','#bc864e'][k]);
for(const x of [cx-16,cx+15])R(x,s-19,1,10,'#4a4a4a');
return {toile:c,W:L,H:HH,sol:s};
}
function graverLampadaire(){
const L=30,HH=76,{c,g,R}=toile(L,HH),cx=L/2,s=HH-6;
g.fillStyle='rgba(30,26,18,.22)';g.beginPath();g.ellipse(cx+2,s,5,1.6,0,0,7);g.fill();
R(cx-2,s-3,4,3,'#3a3c40');R(cx-.9,s-62,1.8,60,'#4a4c52');R(cx-.9,s-62,.6,60,'#7a7c82');
R(cx-.9,s-62,10,1.6,'#4a4c52');R(cx+6,s-61,6,2.4,'#3a3c40');R(cx+6.5,s-58.6,5,.8,'#fff4d0');
return {toile:c,W:L,H:HH,sol:s,feux:[{x:cx+9,y:4,r:34,teinte:'rgba(255,226,160,§)'}]};
}
function graverMassif(){
const L=92,HH=30,{c,g,R}=toile(L,HH),cx=L/2,s=HH-6;
/* la bordure de pierre et la terre */
R(4,s-12,L-8,12,'#d8ccb4');R(5,s-11,L-10,10,'#6a5a44');R(4,s-12,L-8,.8,'#f2eadc');R(4,s-.6,L-8,.6,'#a89a80');
/* lavandes, graminées, petites fleurs blanches */
for(let i=0;i<70;i++){const x=7+((i*37)%(L-14)),y=s-3-((i*13)%8);
  if(i%3===0){g.strokeStyle='#8aa06a';g.lineWidth=.6;for(let k=-1;k<=1;k++){g.beginPath();g.moveTo(x,y);g.lineTo(x+k*2,y-7);g.stroke();}}
  else if(i%3===1){R(x-.4,y-6,.8,6,'#6a8a5a');for(let k=0;k<3;k++)R(x-.8,y-6-k*1.2,1.6,1,k%2?'#9a7ac8':'#8a68b8');}
  else{g.fillStyle='#4e7a48';g.beginPath();g.arc(x,y-2,2.4,0,7);g.fill();R(x-.5,y-3.5,1,1,'#f4f0e4');}}
return {toile:c,W:L,H:HH,sol:s};
}

/* ---------- LES ARBRES CHOISIS : PLATANES ET MAGNOLIAS ---------- */
function toileA(L,HH){const D=2,c=document.createElement('canvas');c.width=L*D;c.height=HH*D;const g=c.getContext('2d');g.setTransform(D,0,0,D,0,0);g.imageSmoothingEnabled=false;
  const R=(x,y,w,hh,col)=>{g.fillStyle=col;g.fillRect(Math.round(x*2)/2,Math.round(y*2)/2,Math.max(.5,Math.round(w*2)/2),Math.max(.5,Math.round(hh*2)/2));};return {c,g,R};}
const hA=(x,y,k)=>{let n=((x*73856093)^(y*19349663)^(k*83492791))|0;n=(n^(n>>>13))*1274126177|0;return((n^(n>>>16))>>>0)/4294967296;};
const ombreA=(g,x,y,rx,ry)=>{g.fillStyle='rgba(30,26,18,.24)';g.beginPath();g.ellipse(x,y,rx,ry,0,0,7);g.fill();};
/* une boule de feuillage : sombre en bas à droite, claire en haut à gauche, grain de feuilles */
function feuillage(g,R,cx,cy,rx,ry,pal,n,seed){
  const [s,m,c,l]=pal;
  for(let i=0;i<n;i++){const a=hA(i,seed,1)*Math.PI*2,r=Math.sqrt(hA(i,seed,2));const x=cx+Math.cos(a)*rx*r,y=cy+Math.sin(a)*ry*r;
    const lum=((cx-x)/rx+(cy-y)/ry)*.5+hA(i,seed,3)*.4;const col=lum>.55?l:lum>.15?c:lum>-.3?m:s;
    g.fillStyle=col;g.beginPath();g.ellipse(x,y,2.2+hA(i,seed,4)*2.2,1.6+hA(i,seed,5)*1.4,hA(i,seed,6)*3,0,7);g.fill();}}

/* 1. LE PLATANE : tronc tacheté, canopée ample */
function arbrePlatane(v){const L=120,HH=150,{c,g,R}=toileA(L,HH),cx=L/2,s=HH-6;ombreA(g,cx+16,s+1,48,9);
  for(let y=s;y>s-70;y-=.5){const t=(s-y)/70,w=14-t*5+(t<.08?(.08-t)*60:0);R(cx-w/2,y,w,.6,'#b8ae92');}
  for(let i=0;i<110;i++){const y=s-2-hA(i,1,7)*66,t=(s-y)/70,w=14-t*5;R(cx-w/2+hA(i,2,7)*(w-3),y,2.5+hA(i,3,7)*3,2+hA(i,4,7)*2.5,['#d8d0b0','#8a8a6a','#a6a284','#e6e0c8'][i%4]);}
  R(cx+3,s-70,1.6,70,'rgba(60,50,30,.25)');
  for(const [dx,dy] of [[-22,-30],[20,-26],[-6,-36],[8,-34]]){g.strokeStyle='#a89e82';g.lineWidth=2.2;g.beginPath();g.moveTo(cx,s-66);g.quadraticCurveTo(cx+dx*.4,s-66+dy*.6,cx+dx,s-66+dy);g.stroke();}
  const ETE=['#3a5a2c','#4f7a36','#6f9a44','#9cc05a'];
  if(!AUTOMNE){feuillage(g,R,cx,s-84,48,14,ETE,260,4);feuillage(g,R,cx-28,s-100,32,24,ETE,320,1);feuillage(g,R,cx+28,s-102,32,24,ETE,320,2);feuillage(g,R,cx,s-120,38,24,ETE,360,3);}
  else{/* L'AUTOMNE, UN PEU DE TOUT : chaque arbre mêle l'or, le roux, le cuivre et un reste de vert, dans des proportions à lui */
    const DORE=['#7a5a1e','#b8862a','#dcb440','#f2d870'], ROUX=['#6a2e18','#a84a20','#d4742c','#eeaa4a'], CUIVRE=['#5a3a20','#8a5a2a','#b07a3a','#c89a58'], VERT=['#4a5a2c','#6a7a36','#8a9a44','#b0b85a'];
    const M=[[ROUX,DORE,CUIVRE,DORE],[DORE,DORE,ROUX,VERT],[CUIVRE,ROUX,DORE,ROUX],[DORE,VERT,ROUX,DORE],[ROUX,CUIVRE,DORE,DORE],[DORE,ROUX,VERT,CUIVRE]][(v||0)%6];
    feuillage(g,R,cx,s-84,48,14,M[0],260,4);feuillage(g,R,cx-28,s-100,32,24,M[1],320,1);feuillage(g,R,cx+28,s-102,32,24,M[2],320,2);feuillage(g,R,cx,s-120,38,24,M[3],360,3);
    /* quelques touffes d'une autre couleur, mêlées dans la masse */
    feuillage(g,R,cx-10,s-108,40,26,M[(v+1)%4],120,5+(v||0));
    /* le tapis de feuilles mortes au pied */
    const T=['#d8a830','#c0602a','#9a6a38','#e8c050','#a04020','#b08048'];
    for(let i=0;i<300;i++){const a=hA(i,7+(v||0),61)*Math.PI*2,r=Math.sqrt(hA(i,8,61));g.fillStyle=T[(i+(v||0))%T.length];g.beginPath();g.ellipse(cx+10+Math.cos(a)*r*56,s+Math.sin(a)*r*10,1.4,.9,a,0,7);g.fill();}}
  return {c,W:L,H:HH,s};}
/* 5. LE MAGNOLIA : feuilles vernissées sombres, grandes fleurs blanches */
function arbreMagnolia(){const L=110,HH=140,{c,g,R}=toileA(L,HH),cx=L/2,s=HH-6;ombreA(g,cx+12,s+1,38,8);
  for(let y=s;y>s-40;y-=.5){const t=(s-y)/40,w=7-t*2;R(cx-w/2,y,w,.6,'#5a5048');}
  const P=['#1e3a24','#2c5232','#3e6e40','#6a9a5c'];
  feuillage(g,R,cx,s-58,34,26,P,320,31);feuillage(g,R,cx-4,s-88,28,24,P,280,32);feuillage(g,R,cx+2,s-112,18,16,P,160,33);
  for(let i=0;i<22;i++){const x=cx-30+hA(i,1,34)*60,y=s-120+hA(i,2,34)*84;if(Math.abs(x-cx)/34+Math.abs(y-(s-80))/56>1.1)continue;
    g.fillStyle='#fbf8f0';g.beginPath();g.ellipse(x,y,2.4,1.8,0,0,7);g.fill();g.fillStyle='#e8e0cc';g.beginPath();g.ellipse(x+.8,y+.6,1.2,.9,0,0,7);g.fill();}
  return {c,W:L,H:HH,s};}

function graverPlatane(v){const t=arbrePlatane(v);return {toile:t.c,W:t.W,H:t.H,sol:t.s};}
function graverMagnolia(){const t=arbreMagnolia();return {toile:t.c,W:t.W,H:t.H,sol:t.s};}

const GRAVEURS={x_jol_platane:graverPlatane,x_jol_arbre_magnolia:graverMagnolia,x_jol_pin:graverPin,x_jol_olivier:graverOlivier,x_jol_banc:graverBancBois,x_jol_lampadaire:graverLampadaire,x_jol_massif:graverMassif,x_jol_docks_sol:graverDocks,x_jol_parasol:graverParasol,x_jol_abri:graverAbri,x_jol_panneau:graverPanneauPort,x_jol_tram:graverVide};
function graver(t,v){return (GRAVEURS[t]||graverVide)(v||0);}

function decor(){
  const D=[];const P=(t,x,y,o)=>D.push(Object.assign({t,x,y,gr:0},o||{}));
  /* la façade des Docks, au demi-pixel */
  P('x_jol_docks_sol',W/2,DOCKS_PIED,{anim:'jol_docks'});
  /* le parvis : des magnolias dans leurs grilles, deux terrasses de café */
  for(const x of [40,250,550,760])P('x_jol_arbre_magnolia',x,342,{col:[10,5]});
  for(const x of [110,170,630,690])P('x_jol_parasol',x,290,{col:[44,12],bas:5});
  /* les deux stations : une sur le parvis pour la voie du haut, une sur le quai côté place */
  P('x_jol_abri',220,350,{col:[100,6]});
  P('x_jol_abri',600,420,{col:[100,6]});
  /* les deux rames, une par voie ; elles s'arrêtent devant leur station */
  P('x_jol_tram',400,376,{anim:'jol_tram',sens:1,arret:220});
  P('x_jol_tram',400,400,{anim:'jol_tram',sens:-1,arret:600});
  /* la fontaine au milieu, deux oliviers en bacs de part et d'autre */
  P('x_fontaine',FONT[0],FONT[1],{col:[80,26],bas:8});
  P('x_jol_olivier',290,598,{col:[26,10]});P('x_jol_olivier',510,598,{col:[26,10]});
  /* les allées de platanes */
  [470,590,710].forEach((y,i)=>{P('x_jol_platane',42,y,{col:[12,6],v:i});P('x_jol_platane',W-42,y,{col:[12,6],v:i+3});});
  /* les massifs de lavande et de graminées, avec leurs bancs */
  for(const [x,y] of [[200,470],[600,470],[200,700],[600,700]]){P('x_jol_massif',x,y,{col:[84,14]});P('x_jol_banc',x,y+20,{col:[40,6]});}
  /* des bancs tournés vers la fontaine */
  for(const [x,y] of [[300,526],[500,526],[296,652],[504,652]])P('x_jol_banc',x,y,{col:[40,6]});
  /* les lampadaires */
  for(const [x,y] of [[120,452],[680,452],[120,642],[680,642],[300,746],[500,746]])P('x_jol_lampadaire',x,y,{col:[4,3]});
  /* le tableau d'embauche, à deux pas de l'arrivée */
  P('x_tableau',488,694,{col:[34,10]});
  /* le kiosque à journaux */
  P('x_kiosque',150,600,{col:[30,10]});
  return D;
}

function bloque(x,y){
  if(x<14||x>W-14)return true;
  if(y<DOCKS_PIED+16)return true;                     /* la façade des Docks */
  if(y>PLACE_BAS+4&&Math.abs(x-SORTIE_X)>SORTIE_DEMI)return true;   /* la rue : seulement par le passage */
  if(y>H-4)return true;
  for(const o of DECOR){if(o.anim==='jol_tram'){try{if(dansLaRame(o,x,y)&&!dansLaRame(o,joueur.x,joueur.y))return true;}catch(e){}continue;}
    if(!o.col)continue;
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
