/* =====================================================================
   LE PORT (quai.html) — LE QUAI DE LA CORSE : on arrive sur le môle, le
   grand ferry Kalliste de Corsica Linea est à quai, la gare maritime à
   gauche, les montagnes de la Corse au loin par-dessus la mer.
   Chargé par moteur.js (eval direct). Ne touche à rien d'autre.
   ===================================================================== */
(()=>{
const W=800, H=800, NAV=286, QUAI=312;
const DEPART=[400,560];
const hA=(x,y,k)=>{let n=((x*73856093)^(y*19349663)^(k*83492791))|0;n=(n^(n>>>13))*1274126177|0;return((n^(n>>>16))>>>0)/4294967296;};
function sol(){const c=document.createElement('canvas');c.width=W;c.height=H;const g=c.getContext('2d');g.fillStyle='#e4d8bd';g.fillRect(0,0,W,H);g.fillStyle='#2a6a8a';g.fillRect(0,0,W,QUAI);return c;}
function solFin(){const S=2,c=document.createElement('canvas');c.width=W*S;c.height=H*S;const g=c.getContext('2d');g.setTransform(S,0,0,S,0,0);
  const R=(x,y,w,h,col)=>{g.fillStyle=col;g.fillRect(x,y,w,h);};
  const tn2=(hex,d)=>{const v=parseInt(hex.slice(1),16);const f=k=>Math.max(0,Math.min(255,((v>>k)&255)+d));return 'rgb('+f(16)+','+f(8)+','+f(0)+')';};
  const dalle=(x,y,w,h,col,j)=>{R(x,y,w,h,j||tn2(col,-34));R(x+.5,y+.5,w-1,h-1,col);R(x+.5,y+.5,w-1,.5,tn2(col,14));R(x+.5,y+.5,.5,h-1,tn2(col,8));R(x+.5,y+h-1,w-1,.5,tn2(col,-12));};
  const lin=(x0,y0,x1,y1,st)=>{const gr=g.createLinearGradient(x0,y0,x1,y1);st.forEach(([o,c])=>gr.addColorStop(o,c));return gr;};
  const ell=(cx,cy,rx,ry,col)=>{g.fillStyle=col;g.beginPath();g.ellipse(cx,cy,rx,ry,0,0,7);g.fill();};
  const HORIZ=120;
  /* CIEL en dégradé */
  g.fillStyle=lin(0,0,0,HORIZ,[[0,'#4a9edc'],[.5,'#8cc6ec'],[.85,'#c8e4f0'],[1,'#dceff6']]);g.fillRect(0,0,W,HORIZ);
  /* nuages d'ellipses */
  for(let k=0;k<9;k++){const cx=hA(k,7,1)*W,cy=20+hA(k,7,2)*70,l=130+hA(k,7,3)*180;
    for(let j=0;j<12;j++){ell(cx+(j-6)*l/12,cy+hA(k,j,5)*7-3,l/8,5+hA(k,j,6)*5,'rgba(255,255,255,'+(.18+hA(k,j,4)*.26)+')');}}
  /* soleil chaud */
  ell(650,60,54,54,'rgba(255,236,170,.25)');ell(650,60,32,32,'rgba(255,236,170,.45)');ell(650,60,16,16,'rgba(255,246,208,.9)');ell(648,58,6,6,'#ffffff');
  /* MONTAGNES AU LOIN : la Corse en silhouette */
  g.fillStyle='#8aa8b8';g.beginPath();g.moveTo(0,HORIZ);
  for(let x=0;x<=W;x+=4){const y=HORIZ-22-Math.sin(x/70)*16-hA(x,3,21)*5;g.lineTo(x,y);}
  g.lineTo(W,HORIZ);g.closePath();g.fill();
  g.fillStyle='#6a8898';g.beginPath();g.moveTo(0,HORIZ);
  for(let x=0;x<=W;x+=3){const y=HORIZ-12-Math.sin(x/45)*10-Math.cos(x/22)*4-hA(x,2,22)*3;g.lineTo(x,y);}
  g.lineTo(W,HORIZ);g.closePath();g.fill();
  for(let i=0;i<60;i++){const x=hA(i,1,23)*W,y=HORIZ-18+hA(i,2,23)*10;R(x,y,3+hA(i,3,23)*2,1,'rgba(180,200,220,.35)');}
  /* MER : dégradé profond */
  g.fillStyle=lin(0,HORIZ,0,QUAI,[[0,'#1a4a68'],[.4,'#2a5a78'],[.7,'#1a3e5a'],[1,'#0e2a3e']]);g.fillRect(0,HORIZ,W,QUAI-HORIZ);
  /* reflet doré sous le soleil */
  for(let y=HORIZ;y<QUAI;y++){const k=(y-HORIZ)/(QUAI-HORIZ),lar=40+k*80;
    for(let i=0;i<4;i++){const dx=hA(y,i,31)*lar*2-lar;R(650+dx,y,2+hA(y,i,32)*2,1,'rgba(255,220,150,'+(.25*(1-k))+')');}}
  /* crêtes de vagues */
  for(let i=0;i<260;i++){const x=hA(i,1,24)*W,y=HORIZ+10+hA(i,2,24)*(QUAI-HORIZ-14),l=4+hA(i,3,24)*9;
    R(x,y,l,1,'rgba(180,215,235,'+(.2+hA(i,4,24)*.35)+')');}
  /* écume au pied du quai */
  for(let i=0;i<150;i++){const x=hA(i,1,25)*W,y=QUAI-4+hA(i,2,25)*3;R(x,y,2+hA(i,3,25)*4,1,'rgba(255,255,255,'+(.4+hA(i,4,25)*.4)+')');}

  /* ============ LE FERRY KALLISTE à quai (dans le fond) ============ */
  const FX=400, FY=280; /* base du ferry (pied dans l'eau) */
  /* ombre sous la coque */
  ell(FX,FY-2,340,8,'rgba(0,0,0,.35)');
  /* COQUE sombre avec dégradé */
  g.fillStyle=lin(0,FY-90,0,FY-5,[[0,'#2a4468'],[.4,'#1a3458'],[.8,'#0e243e'],[1,'#0a1e3a']]);
  g.beginPath();
  g.moveTo(FX-320,FY-5);g.lineTo(FX-320,FY-85);g.quadraticCurveTo(FX-300,FY-90,FX-260,FY-93);
  g.lineTo(FX+240,FY-93);g.quadraticCurveTo(FX+300,FY-90,FX+320,FY-78);g.quadraticCurveTo(FX+335,FY-68,FX+328,FY-28);
  g.quadraticCurveTo(FX+320,FY-8,FX+300,FY-2);g.lineTo(FX-300,FY-2);g.quadraticCurveTo(FX-318,FY-2,FX-320,FY-5);
  g.closePath();g.fill();
  /* liseré clair */
  g.strokeStyle='#4a6a94';g.lineWidth=1;g.beginPath();
  g.moveTo(FX-310,FY-85);g.quadraticCurveTo(FX-290,FY-89,FX-260,FY-91);g.lineTo(FX+240,FY-91);g.quadraticCurveTo(FX+296,FY-87,FX+318,FY-76);g.stroke();
  /* bande orange/rouge Corsica Linea */
  g.fillStyle=lin(0,FY-49,0,FY-35,[[0,'#f04230'],[.3,'#d82810'],[1,'#8a1800']]);
  g.beginPath();g.moveTo(FX-310,FY-49);g.lineTo(FX+320,FY-49);g.lineTo(FX+326,FY-35);g.lineTo(FX-316,FY-35);g.closePath();g.fill();
  R(FX-310,FY-49,634,1,'#ff5a3a');
  /* nom KALLISTE */
  g.fillStyle='#ffffff';g.font='bold italic 18px Georgia,serif';g.textAlign='center';g.textBaseline='middle';g.fillText('KALLISTE',FX,FY-42);
  /* flottaison sombre */
  R(FX-320,FY-15,648,6,'#06162a');R(FX-320,FY-9,648,2,'#0e243e');
  /* hublots : 3 rangées */
  for(let r=0;r<3;r++){for(let x=FX-304;x<FX+300;x+=15){
    ell(x+5,FY-80+r*10,5,5,'#8a8478');ell(x+5,FY-80+r*10,4,4,'#5a5448');ell(x+5,FY-80+r*10,3,3,'#1a2a3a');
    ell(x+5,FY-81+r*10,2.5,2.5,'#4a6888');ell(x+4,FY-81+r*10,1.2,1.2,'#8ab0c8');ell(x+3.5,FY-81.5+r*10,.6,.6,'#ffffff');}}
  /* PONT SUPÉRIEUR BLANC */
  g.fillStyle=lin(0,FY-156,0,FY-94,[[0,'#ffffff'],[.3,'#f4eee2'],[1,'#e2d8c4']]);g.fillRect(FX-260,FY-156,440,62);
  R(FX-260,FY-156,440,3,'#ffffff');R(FX-260,FY-97,440,3,'#a89880');
  /* grande rangée de vitres */
  g.fillStyle=lin(0,FY-148,0,FY-106,[[0,'#2a4868'],[.4,'#4a6888'],[.8,'#6a8aa8'],[1,'#3a5068']]);g.fillRect(FX-252,FY-148,424,42);
  for(let x=FX-244;x<FX+168;x+=10){R(x,FY-148,1,42,'#1a2a3a');}
  g.fillStyle='rgba(180,210,235,.35)';
  for(let i=0;i<4;i++){g.beginPath();g.moveTo(FX-240+i*100,FY-144);g.lineTo(FX-180+i*100,FY-144);g.lineTo(FX-220+i*100,FY-108);g.lineTo(FX-260+i*100,FY-108);g.closePath();g.fill();}
  /* PASSERELLE COMMANDEMENT */
  g.fillStyle=lin(0,FY-201,0,FY-156,[[0,'#ffffff'],[.4,'#f4eee2'],[1,'#d8ccbc']]);g.fillRect(FX-160,FY-201,240,46);
  R(FX-160,FY-201,240,3,'#ffffff');R(FX-160,FY-158,240,3,'#a89880');
  g.fillStyle=lin(0,FY-194,0,FY-164,[[0,'#2a4868'],[.5,'#4a6888'],[1,'#1a2a3a']]);g.fillRect(FX-150,FY-194,220,30);
  for(let x=FX-140;x<FX+70;x+=10){R(x,FY-192,1,26,'#5a7898');}
  /* ANTENNE + RADAR */
  R(FX-44,FY-226,2,25,'#2a2a30');R(FX-52,FY-231,18,3,'#4a4a52');
  g.strokeStyle='#2a2a30';g.lineWidth=1;g.beginPath();g.arc(FX-43,FY-238,5,-Math.PI*.3,-Math.PI*.7,true);g.stroke();
  R(FX-44,FY-240,2,4,'#8a8478');
  /* 3 CHEMINÉES rouges avec étoile Corsica Linea */
  for(const cx of [FX-132,FX-60,FX+12]){
    g.fillStyle=lin(cx,FY-266,cx+28,FY-266,[[0,'#f04230'],[.4,'#d82810'],[1,'#9a1800']]);
    g.beginPath();g.moveTo(cx,FY-196);g.lineTo(cx,FY-260);g.quadraticCurveTo(cx,FY-266,cx+5,FY-266);g.lineTo(cx+23,FY-266);g.quadraticCurveTo(cx+28,FY-266,cx+28,FY-260);g.lineTo(cx+28,FY-196);g.closePath();g.fill();
    R(cx,FY-266,28,3,'#1a1a1a');R(cx,FY-263,28,1,'#4a4a52');
    R(cx+2,FY-238,24,18,'#ffffff');R(cx+2,FY-238,24,1,'#e0e4e8');R(cx+2,FY-221,24,1,'#a8a498');
    /* étoile bleu marine */
    g.fillStyle='#1a4a8a';const scx=cx+14,scy=FY-229;
    g.beginPath();g.moveTo(scx,scy-5);g.lineTo(scx+1.5,scy-1.5);g.lineTo(scx+5,scy-1);g.lineTo(scx+2,scy+1.5);
    g.lineTo(scx+3,scy+5);g.lineTo(scx,scy+2.5);g.lineTo(scx-3,scy+5);g.lineTo(scx-2,scy+1.5);
    g.lineTo(scx-5,scy-1);g.lineTo(scx-1.5,scy-1.5);g.closePath();g.fill();}
  /* MÂT + drapeau Corse (tête de maure) */
  R(FX-5,FY-284,2,22,'#2a2a30');R(FX-3,FY-282,24,14,'#ffffff');R(FX-3,FY-282,24,1,'#e0e4e8');R(FX-3,FY-270,24,2,'#a8a498');
  ell(FX+6,FY-275,4.5,4.5,'#1a1a1a');R(FX+2,FY-277,10,1,'#ffffff');
  /* CANOTS DE SAUVETAGE orange */
  for(const bx of [FX-240,FX-150,FX+70,FX+160]){
    R(bx-1,FY-102,30,3,'rgba(0,0,0,.3)');
    g.fillStyle=lin(bx,FY-108,bx,FY-100,[[0,'#ffb060'],[.5,'#e8702a'],[1,'#a84810']]);
    g.beginPath();g.moveTo(bx,FY-108);g.lineTo(bx+28,FY-108);g.quadraticCurveTo(bx+30,FY-103,bx+28,FY-100);g.lineTo(bx,FY-100);g.quadraticCurveTo(bx-2,FY-103,bx,FY-108);g.closePath();g.fill();
    R(bx+2,FY-107,24,1,'#ffb060');R(bx+2,FY-100,3,5,'#2a2a30');R(bx+23,FY-100,3,5,'#2a2a30');}
  /* RAMPE DE CHARGEMENT ouverte à gauche vers le quai */
  g.fillStyle=lin(0,FY-86,0,FY-8,[[0,'#0a1420'],[1,'#1a2838']]);g.fillRect(FX-320,FY-86,70,78);
  R(FX-320,FY-86,70,2,'#3a5068');R(FX-320,FY-10,70,2,'#000000');R(FX-320,FY-86,2,78,'#2a3a4a');R(FX-252,FY-86,2,78,'#000000');
  ell(FX-285,FY-46,22,30,'rgba(255,220,150,.15)');

  /* ============ LA GARE MARITIME à gauche (au bord du quai) ============ */
  const GX=14, GY=QUAI+6;
  /* ombre */
  ell(GX+40,GY+200,52,5,'rgba(40,30,20,.3)');
  /* bâtiment ocre clair, 2 étages */
  g.fillStyle=lin(0,GY,0,GY+194,[[0,'#f6efe4'],[.3,'#ece3d4'],[1,'#d8ccbc']]);g.fillRect(GX,GY-3,100,197);
  for(let y=GY;y<GY+194;y+=10){for(let x=GX;x<GX+100;x+=16){const d=hA(x,y,61)*8-4;R(x,y,16,10,tn2('#ece3d4',d|0));R(x,y,16,.5,'#f6efe4');R(x,y,.5,10,'#d8ccbc');}}
  /* corniche débord sombre */
  R(GX-6,GY-7,112,8,'#3a3a40');R(GX-6,GY-7,112,2,'#5a5a60');R(GX-6,GY+1,112,1,'#1a1a1a');
  /* enseigne bleue GARE MARITIME */
  g.fillStyle=lin(0,GY+3,0,GY+19,[[0,'#2a5a9a'],[.5,'#1a4a8a'],[1,'#0e3570']]);g.fillRect(GX+2,GY+3,96,16);
  R(GX+2,GY+3,96,1,'#4a7ac8');R(GX+2,GY+17,96,2,'#0a2550');
  g.fillStyle='#ffffff';g.font='bold 9px Arial,sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText('GARE MARITIME',GX+50,GY+11);
  /* étage 1 — vitres */
  g.fillStyle=lin(0,GY+27,0,GY+83,[[0,'#3a5068'],[.5,'#2a4868'],[1,'#1a2a3a']]);g.fillRect(GX+6,GY+27,88,56);
  R(GX+6,GY+27,88,2,'#4a6888');R(GX+6,GY+81,88,2,'#0a1420');
  for(let x=GX+22;x<GX+92;x+=14){R(x,GY+27,2,56,'#5a5a60');}
  for(let i=0;i<6;i++){const vx=GX+8+i*14;
    g.fillStyle=lin(vx,GY+29,vx+12,GY+81,[[0,'#4a6888'],[.3,'#6a8aa8'],[.7,'#5a7898'],[1,'#2a3a4a']]);g.fillRect(vx,GY+29,12,52);
    g.fillStyle='rgba(200,225,240,.35)';g.beginPath();g.moveTo(vx+1,GY+33);g.lineTo(vx+5,GY+33);g.lineTo(vx+2,GY+79);g.lineTo(vx,GY+79);g.closePath();g.fill();}
  /* corniche intermédiaire */
  R(GX,GY+85,100,6,'#f6efe4');R(GX,GY+85,100,2,'#ffffff');R(GX,GY+89,100,1,'#c4b298');
  /* étage 2 */
  g.fillStyle=lin(0,GY+93,0,GY+143,[[0,'#3a5068'],[.5,'#2a4868'],[1,'#1a2a3a']]);g.fillRect(GX+6,GY+93,88,50);
  R(GX+6,GY+93,88,2,'#4a6888');R(GX+6,GY+141,88,2,'#0a1420');
  for(let x=GX+22;x<GX+92;x+=14){R(x,GY+93,2,50,'#5a5a60');}
  for(let i=0;i<6;i++){const vx=GX+8+i*14;
    g.fillStyle=lin(vx,GY+95,vx+12,GY+141,[[0,'#4a6888'],[.5,'#6a8aa8'],[1,'#2a3a4a']]);g.fillRect(vx,GY+95,12,46);
    g.fillStyle='rgba(200,225,240,.3)';g.beginPath();g.moveTo(vx+1,GY+99);g.lineTo(vx+5,GY+99);g.lineTo(vx+2,GY+139);g.lineTo(vx,GY+139);g.closePath();g.fill();}
  /* portes auto en bas */
  R(GX+34,GY+150,32,40,'#1a1a24');R(GX+34,GY+150,32,2,'#4a4a52');R(GX+34,GY+188,32,2,'#000000');
  R(GX+49,GY+152,2,36,'#f2d070');R(GX+34,GY+150,32,1,'#6a6a70');
  /* tapis d'accueil rouge */
  R(GX+30,GY+188,40,4,'#8a2018');R(GX+30,GY+188,40,1,'#c42018');

  /* ============ LE QUAI DE PIERRE DE MARSEILLE ============ */
  R(0,QUAI-3,W,3,'rgba(10,30,40,.3)');
  R(0,QUAI,W,7,'#ece4d2');R(0,QUAI,W,1,'#fbf6ea');R(0,QUAI+6,W,1,'#bfb196');for(let x=0;x<W;x+=24)R(x,QUAI,.5,7,'#d6cab2');
  for(let y=QUAI+7;y<QUAI+28;y+=5)for(let x=-((y/5|0)%2)*3;x<W;x+=6)dalle(x,y,6,5,['#8a847a','#827c72','#928c82'][(hA(x,y,8)*3)|0],'#5a554c');
  R(0,QUAI+28,W,4,'#9aa0a6');for(let x=0;x<W;x+=3)R(x,QUAI+28.6,1.8,2.8,'#4a5058');
  const OP=[[0,0,24,16],[24,0,16,16],[40,0,24,24],[0,16,16,24],[16,16,24,8],[16,24,24,16],[40,24,24,16]];
  for(let by=QUAI+32;by<H;by+=40)for(let bx=0;bx<W;bx+=64)for(const [dx,dy,w,h] of OP)if(by+dy<H)dalle(bx+dx,by+dy,w,Math.min(h,H-by-dy),['#eadfc6','#e4d8bd','#efe5ce','#e0d4b8','#e8dcc2'][(hA(bx+dx,by+dy,9)*5)|0],'#bfb196');
  /* ligne jaune bord */
  for(let x=0;x<W;x+=32)R(x,QUAI+34,22,6,'#f2c418');
  for(let x=0;x<W;x+=32)R(x,QUAI+40,22,1,'#c8a008');
  /* flaques */
  for(const [fx,fy,fw,fh] of [[150,460,56,12],[340,520,46,8],[600,480,42,14]]){
    ell(fx,fy,fw/2,fh/2,'rgba(28,50,66,.55)');ell(fx-fw/6,fy-fh/4,fw/3.5,fh/4,'rgba(140,180,200,.4)');ell(fx-fw/3,fy-fh/3,fw/8,fh/8,'rgba(255,255,255,.3)');}
  /* grain / salissures */
  for(let i=0;i<40;i++){const cx=hA(i,1,42)*W,cy=QUAI+50+hA(i,2,42)*(H-QUAI-60);ell(cx,cy,8+hA(i,3,42)*8,3+hA(i,4,42)*2,'rgba(30,22,16,.12)');}
  return c;}

/* ============ GRAVEURS pour les décors interactifs ============ */
const tn3=(hex,d)=>{const v=parseInt(hex.slice(1),16);const f=k=>Math.max(0,Math.min(255,((v>>k)&255)+d));return 'rgb('+f(16)+','+f(8)+','+f(0)+')';};

/* --- LE PANNEAU "QUAI DE LA CORSE" --- */
let PANNEAU=null;
function graverPanneau(){if(PANNEAU)return PANNEAU;
  const K=3, PW=150, PH=170, SOL=160;
  const c=document.createElement('canvas');c.width=PW*K;c.height=PH*K;
  const g=c.getContext('2d');g.imageSmoothingEnabled=false;g.setTransform(K,0,0,K,0,0);
  const R=(x,y,w,h,col)=>{g.fillStyle=col;g.fillRect(x,y,w,h);};
  const T=(t,x,y,px,c,al,f)=>{g.font=(f||'bold')+' '+px+'px '+'Arial,sans-serif';g.textAlign=al||'center';g.textBaseline='middle';g.fillStyle=c;g.fillText(t,x,y);};
  /* ombre au sol */
  g.fillStyle='rgba(40,30,20,.3)';g.beginPath();g.ellipse(PW/2,SOL+4,34,4,0,0,7);g.fill();
  /* poteaux */
  R(14,35,4,125,'#4a4438');R(14,35,2,125,'#6a6a58');
  R(132,35,4,125,'#4a4438');R(132,35,2,125,'#6a6a58');
  /* cadre bois foncé */
  const gr=g.createLinearGradient(0,10,0,150);gr.addColorStop(0,'#8a6a3a');gr.addColorStop(.5,'#6a4a28');gr.addColorStop(1,'#4a3418');g.fillStyle=gr;g.fillRect(10,10,130,140);
  R(10,10,130,4,'#a08858');R(10,146,130,4,'#2a1a08');R(10,10,4,140,'#a08858');R(136,10,4,140,'#2a1a08');
  /* fond crème */
  R(16,16,118,128,'#f4eee2');R(16,16,118,1,'#ffffff');R(16,143,118,1,'#c4b298');
  for(let i=0;i<120;i++){const x=16+hA(i,1,71)*118,y=16+hA(i,2,71)*128;R(x,y,1,1,'rgba(90,70,50,.15)');}
  /* bandeau rouge Corsica Linea */
  const g2=g.createLinearGradient(16,16,16,40);g2.addColorStop(0,'#f04230');g2.addColorStop(.5,'#d82810');g2.addColorStop(1,'#8a1800');g.fillStyle=g2;g.fillRect(16,16,118,24);
  R(16,38,118,1,'#5a0e00');
  T('QUAI DE LA CORSE',75,28,13,'#ffffff','center','bold italic');
  /* destinations avec flèche dorée */
  const DEST=['AJACCIO','BASTIA','ÎLE-ROUSSE','PORTO-VECCHIO','PROPRIANO'];
  g.fillStyle='#4a3418';
  DEST.forEach((d,i)=>{
    g.fillStyle='#c89a40';g.beginPath();
    g.moveTo(24,54+i*16);g.lineTo(32,58+i*16);g.lineTo(24,62+i*16);g.closePath();g.fill();
    T(d,38,58+i*16,10,'#4a3418','left','bold');
  });
  /* ancre dorée en bas */
  g.fillStyle='#c89a40';g.beginPath();g.arc(75,134,3,0,7);g.fill();
  R(74,136,2,10,'#c89a40');R(68,140,14,2,'#c89a40');
  g.strokeStyle='#c89a40';g.lineWidth=1.5;
  g.beginPath();g.arc(71,146,5,Math.PI,Math.PI*1.9);g.stroke();
  g.beginPath();g.arc(79,146,5,Math.PI*1.1,0);g.stroke();
  return PANNEAU={toile:c,W:PW,H:PH,sol:SOL};}

/* --- BOLLARD d'amarrage --- */
let BOLLARD=null;
function graverBollard(){if(BOLLARD)return BOLLARD;
  const K=4, PW=16, PH=28, SOL=24;
  const c=document.createElement('canvas');c.width=PW*K;c.height=PH*K;
  const g=c.getContext('2d');g.imageSmoothingEnabled=false;g.setTransform(K,0,0,K,0,0);
  g.fillStyle='rgba(40,30,20,.4)';g.beginPath();g.ellipse(8,SOL+1,7,2,0,0,7);g.fill();
  const gr=g.createLinearGradient(3,6,13,26);gr.addColorStop(0,'#4a4a52');gr.addColorStop(.5,'#2a2a30');gr.addColorStop(1,'#15151a');g.fillStyle=gr;g.fillRect(3,6,10,20);
  g.fillStyle='#2a2a30';g.beginPath();g.ellipse(8,6,6,2,0,0,7);g.fill();
  g.fillStyle='#4a4a52';g.beginPath();g.ellipse(8,5,5,1.5,0,0,7);g.fill();
  g.fillStyle='rgba(255,255,255,.2)';g.fillRect(4,8,2,16);
  return BOLLARD={toile:c,W:PW,H:PH,sol:SOL};}

/* --- LAMPADAIRE du quai --- */
let LAMPE=null;
function graverLampe(){if(LAMPE)return LAMPE;
  const K=3, PW=24, PH=120, SOL=116;
  const c=document.createElement('canvas');c.width=PW*K;c.height=PH*K;
  const g=c.getContext('2d');g.imageSmoothingEnabled=false;g.setTransform(K,0,0,K,0,0);
  const R=(x,y,w,h,col)=>{g.fillStyle=col;g.fillRect(x,y,w,h);};
  g.fillStyle='rgba(40,30,20,.3)';g.beginPath();g.ellipse(12,SOL+2,8,2,0,0,7);g.fill();
  /* mât */
  const gr=g.createLinearGradient(10,20,14,20);gr.addColorStop(0,'#2a2a30');gr.addColorStop(.5,'#4a4a52');gr.addColorStop(1,'#1a1a20');g.fillStyle=gr;g.fillRect(10,10,4,106);
  /* base */
  R(6,110,12,6,'#2a2a30');R(6,110,12,1,'#4a4a52');
  /* bras */
  R(10,14,10,2,'#2a2a30');
  /* lanterne */
  const g2=g.createLinearGradient(16,14,24,24);g2.addColorStop(0,'#f4eee2');g2.addColorStop(.5,'#e0d8c4');g2.addColorStop(1,'#8a8478');g.fillStyle=g2;g.fillRect(16,14,8,10);
  R(16,14,8,1,'#ffffff');
  /* globe lumineux */
  g.fillStyle='rgba(255,236,170,.6)';g.beginPath();g.ellipse(20,22,4,2,0,0,7);g.fill();
  R(18,21,4,2,'#ffe8a0');
  return LAMPE={toile:c,W:PW,H:PH,sol:SOL};}
/* --- action : ouvre les bagages --- */
function ouvrirBagages(){try{if(window.ouvrirBagages!==arguments.callee&&window.ouvrirBagages){window.ouvrirBagages();return;}}catch(x){}
  const old=document.getElementById('bcmoCorse');if(old)old.remove();
  const d=document.createElement('div');d.id='bcmoCorse';
  d.style.cssText='position:fixed;left:50%;bottom:calc(120px + env(safe-area-inset-bottom));transform:translateX(-50%);z-index:2147482000;width:min(88vw,360px);background:#1b2330;color:#f2efe4;border-radius:18px;padding:14px 16px;box-shadow:0 12px 30px rgba(0,0,0,.4);font-family:"Baloo 2",system-ui,sans-serif';
  d.innerHTML='<b style="display:block;color:#f5d27a;font-size:13px;letter-spacing:.08em">QUAI DE LA CORSE</b><div style="font-weight:700;font-size:16px;line-height:1.3;margin-top:4px">Ferry Kalliste à quai pour Ajaccio, Bastia, Île-Rousse, Porto-Vecchio et Propriano. Chargement des bagages bientôt disponible.</div>';
  d.onclick=()=>d.remove();document.body.appendChild(d);setTimeout(()=>{try{d.remove();}catch(x){}},4500);}

function decor(){const D=[];const P=(t,x,y,o)=>D.push(Object.assign({t,x,y,gr:0},o||{}));
  /* panneau destinations — accès au futur jeu des bagages */
  P('x_corse_panneau',140,520,{col:[42,14],agir:ouvrirBagages,libelle:'Lire',nom:'QUAI DE LA CORSE'});
  /* bollards d'amarrage le long du bord */
  for(const bx of [220,340,460,580,700])P('x_corse_bollard',bx,QUAI+32,{col:[12,6]});
  /* lampadaires du quai */
  for(const bx of [270,530,720])P('x_corse_lampe',bx,660,{col:[8,4]});
  return D;}

function graver(t){
  if(t==='x_corse_panneau')return graverPanneau();
  if(t==='x_corse_bollard')return graverBollard();
  if(t==='x_corse_lampe')return graverLampe();
  const c=document.createElement('canvas');c.width=2;c.height=2;return {toile:c,W:1,H:1,sol:0};}
function bloque(x,y){if(y<QUAI+32||x<8||x>W-8||y>H-6)return true;return false;}
function pas(){return [];}
function acteurs(){return [];}
try{window.__CR={j:()=>joueur};}catch(x){}
return {sol,solFin,decor,bloque,graver,depart:DEPART,figurants:pas,acteurs};
})()
