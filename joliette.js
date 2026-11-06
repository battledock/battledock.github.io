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
/* LES TERRASSES DU PORT, d'après la photo de l'entrée côté boulevard.
   Au centre, l'atrium de verre teinté et son immense chapeau en porte-à-faux, tenu par
   deux mâts à haubans ; deux boîtes vitrées cerclées d'acier rouille, en encorbellement,
   posées sur des colonnes blanches ; le bandeau bleu « Bienvenue ». De chaque côté, les
   ailes en pierre claire : pilastres, panneaux pleins, brise-soleil rouille, grandes baies
   d'affiches, boutiques et stores blancs, et le nom en grandes lettres carrées.
   Toile x2, lumière en haut à gauche. Les portes coulissantes sont dessinées à part,
   à chaque image, pour qu'elles s'ouvrent quand on approche. */
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
    /* la boutique et son store blanc */
    R(x,178,w,SOL-178,'#2a2e32');const lum=!JOUR||h(x|0,7,7)<.6;
    VG(x+1,186,w-2,SOL-187,lum?'#fff0d4':'#9eb4c4',lum?'#d8a868':'#3e5668');if(lum)LUMS.push([x+1,186,w-2,SOL-187]);
    R(x+w/2-.3,186,.6,SOL-186,'#2a2e32');
    if(h(x|0,9,9)<.55){g.fillStyle='#f6f4f0';g.beginPath();g.moveTo(x-2,180);g.lineTo(x+w+2,180);g.lineTo(x+w+5,190);g.lineTo(x-5,190);g.closePath();g.fill();
      R(x-5,190,w+10,.8,'#d6d2ca');OMB(x-4,190.8,w+8,3,.3);}
    else{R(x,179,w,6,'#1e2a3a');texte(['ÉPICERIE','CAFÉ','MODE','SPORT'][((x/54)|0)%4],x+w/2,182.2,'bold 3.4px Arial,sans-serif','#f0f0f0');}
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
  texte(nom,(x0+x1)/2,y0+9,'bold 4.4px "Helvetica Neue",Arial,sans-serif','#ffffff');
  g.fillStyle=coul;g.beginPath();g.arc(x1-10,y0+9,3.4,0,7);g.fill();
  g.fillStyle='rgba(255,255,255,.2)';g.beginPath();g.moveTo(x0+4,y1-3);g.lineTo(x0+20,y0+3);g.lineTo(x0+26,y0+3);g.lineTo(x0+10,y1-3);g.closePath();g.fill();
  OMB(x0,y1,x1-x0,6,.45);};
boite(B0,A0+14,'CAFÉ','#2f6b4f');boite(A1-14,B1,'SALON DE THÉ','#c8a24a');
for(const cx of [B0+28,B1-28]){HG(cx-4,TOIT+66,8,SOL-TOIT-66,[[0,'#c8c8c4'],[.3,'#ffffff'],[.7,'#ecece8'],[1,'#b0b0aa']]);}

/* ---------- le bandeau bleu « Bienvenue » ---------- */
{const y=SOL-63;R(B0-4,y,B1-B0+8,7,BLEU);R(B0-4,y,B1-B0+8,.6,'#4a78c8');R(B0-4,y+6.5,B1-B0+8,.5,'#122e66');
  R(CX-62,y,124,7,'#173f8e');texte('BIENVENUE AUX TERRASSES DU PORT',CX,y+3.7,'bold 4.4px "Helvetica Neue",Arial,sans-serif','#ffffff');
  for(const gx of [CX-74,CX+64]){R(gx,y+1.5,4,4,'#ffffff');R(gx+1,y+2.5,2,2,'#173f8e');R(gx+5,y+1.5,4,4,'#ffffff');R(gx+6,y+2.5,.8,3,'#173f8e');R(gx+7.2,y+2.5,.8,3,'#173f8e');}}
/* l'entrée : un hall éclairé derrière les vitrages ; les portes elles-mêmes sont animées */
{const y=SOL-56;R(B0,y,B1-B0,56,'#1c2a30');VG(B0+1,y+1,B1-B0-2,55,'#e8f0f0','#a8bcbc');
  for(const [px,pw] of PORTES){VG(px-pw/2,y+1,pw,55,'#fff6e2','#f0d0a0');LUMS.push([px-pw/2,y+1,pw,55]);
    for(let k=0;k<3;k++)R(px-pw/2+6+k*12,y+30-k*3,5,24+k*3,['#7a6a5a','#4a5a6a','#9a7a5a'][k]);}
  for(let x=B0;x<=B1;x+=16)if(!PORTES.some(([px,pw])=>x>px-pw/2-pw/2-1&&x<px+pw/2+pw/2+1))R(x-.5,y,1,56,'#1c2a30');R(B0,y+28,B1-B0,.8,'#1c2a30');
  R(B0,y,B1-B0,1,'#1c2a30');}

/* ---------- le pied ---------- */
R(0,SOL,W,PIED-SOL,'#d8cfc2');for(let x=0;x<W;x+=20)R(x,SOL,.4,PIED-SOL,'#c4b8a8');R(0,SOL,W,.6,'#f2ebe0');

/* ---------- la nuit ---------- */
if(!JOUR){g.save();g.globalCompositeOperation='multiply';g.fillStyle='rgb(120,120,172)';g.fillRect(0,-12,W,PIED+12);g.restore();
  g.save();g.globalCompositeOperation='lighter';for(const [x,y,w,hh] of LUMS){g.fillStyle='rgba(130,80,30,.6)';g.fillRect(x,y,w,hh);}g.restore();
  const y=SOL-63;R(B0-4,y,B1-B0+8,7,'#2a62c8');texte('BIENVENUE AUX TERRASSES DU PORT',CX,y+3.7,'bold 4.4px "Helvetica Neue",Arial,sans-serif','#ffffff');
  ecrire();}
}
/* les deux entrées coulissantes : leur place dans la façade (x, largeur) */
const PORTES=[[350,44],[450,44]];
const PORTE_Y=222-56, PH=56;                       /* le haut des portes, dans le repère de la façade */
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
    g.fillStyle='#1c2a30';g.fillRect(x0-lw+2,y,lw-2,PH);g.fillRect(x0+pw,y,lw-2,PH);
    g.fillStyle='rgba(200,225,232,.38)';g.fillRect(x0-lw+3,y+1,lw-4,PH-2);g.fillRect(x0+pw+1,y+1,lw-4,PH-2);
    g.fillStyle='rgba(28,42,48,.95)';g.fillRect(x0-1,y-1.5,pw+2,1.5);
  });
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
