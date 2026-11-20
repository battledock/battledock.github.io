/* =====================================================================
   LE QUAI DES CONTENEURS (containers.js) — Tape sur les conteneurs
   pour les décharger et gagner de l'argent. Plus tu tapes vite, plus
   le combo monte et plus tu gagnes.
   Rendu avec les mêmes fonctions que le spawn : toile D=2, demi-pixel,
   dégradés, grain hA, ombres elliptiques. Pas de chrono.
   ===================================================================== */
(()=>{
/* ===== OUTILS DE RENDU (identiques au spawn) ===== */
const hA=(x,y,k)=>{let n=((x*73856093)^(y*19349663)^(k*83492791))|0;n=(n^(n>>>13))*1274126177|0;return((n^(n>>>16))>>>0)/4294967296;};
const hx=s=>{const v=parseInt(s.slice(1),16);return[(v>>16)&255,(v>>8)&255,v&255];};
const mix=(a,b,k)=>{const A=hx(a),B=hx(b);return'rgb('+A.map((v,i)=>Math.round(v+(B[i]-v)*k)).join(',')+')';};
const tn=(hex,d)=>{const v=parseInt(hex.slice(1),16);const c=k=>Math.max(0,Math.min(255,((v>>k)&255)+d));return'rgb('+c(16)+','+c(8)+','+c(0)+')';};

/* ===== CONSTANTES DU JEU ===== */
const COULEURS=['#c0392b','#2a5a9a','#3a8a4a','#f0a030','#7a3ad0','#1a6a6a','#c86a2a','#8a2a5a','#2a3a4a','#d8a040'];
const MARQUES=['MSC','CMA CGM','MAERSK','COSCO','HAPAG','ZIM','ONE','OOCL','EVERGREEN','YANG MING'];
/* la cale : 5 colonnes × 4 rangées, coordonnées en unités monde */
const GW=360, GH=640;
const HORIZON=120, MER_FIN=240, QUAI_Y=244, ZONE_TOP=260, ZONE_BOT=580;
const COLS=5, CW_C=50, CH_C=24, TOP_H=5, SIDE_W=5, GAP=6;
const TOTAL_W=COLS*(CW_C+GAP)-GAP, OX=(GW-TOTAL_W)/2;

let RAC=null, CV=null, G=null, RAF=0, DPR=1;
let J=null, FOND=null, particles=[];

/* ===== ÉTAT DU JEU ===== */
function nouveau(){
  J={score:0, combo:1, maxCombo:1, tCombo:0, taps:0, flash:0, conts:[]};
  /* remplir la grille */
  for(let gy=0;gy<4;gy++)for(let gx=0;gx<COLS;gx++)spawnAt(gx,gy);
}
function spawnAt(gx,gy){
  const ci=(gx+gy*3+J.taps)%COULEURS.length;
  J.conts.push({gx,gy, x:OX+gx*(CW_C+GAP), y:ZONE_TOP+gy*(CH_C+TOP_H+GAP+2),
    w:CW_C, h:CH_C, col:COULEURS[ci], marque:MARQUES[ci],
    dead:false, anim:1, tapAnim:0});}
function taper(ex,ey){
  if(!J)return;
  const r=CV.getBoundingClientRect();
  const mx=(ex-r.left)/r.width*GW, my=(ey-r.top)/r.height*GH;
  let touche=false;
  for(let i=J.conts.length-1;i>=0;i--){const c=J.conts[i];if(c.dead)continue;
    if(mx>=c.x&&mx<=c.x+c.w+SIDE_W&&my>=c.y-TOP_H&&my<=c.y+c.h){
      c.dead=true;c.tapAnim=1;
      J.taps++;
      const pts=Math.round(10*(1+J.combo*.5));
      J.score+=pts;J.tCombo=2.5;J.combo=Math.min(12,J.combo+1);
      if(J.combo>J.maxCombo)J.maxCombo=J.combo;
      J.flash=.3;
      try{vibrer(10);}catch(x){}
      /* particules d'éclat */
      for(let j=0;j<16;j++){const a=Math.random()*Math.PI*2,v=1.5+Math.random()*3.5;
        particles.push({x:c.x+c.w/2,y:c.y+c.h/2,vx:Math.cos(a)*v,vy:Math.sin(a)*v-2.5,life:1,col:c.col,sz:2+Math.random()*3});}
      /* texte "+pts" */
      particles.push({x:c.x+c.w/2,y:c.y-8,vx:0,vy:-1.2,life:1.5,text:'+'+pts,col:'#f2d070',sz:0});
      /* respawn après un délai */
      const gx=c.gx,gy=c.gy;
      setTimeout(()=>{if(J)spawnAt(gx,gy);},400+Math.random()*600);
      touche=true;break;}}
  if(!touche){J.combo=1;J.tCombo=0;}}

/* ===== FOND PRÉ-RENDU AU STYLE DU SPAWN ===== */
function fond(){
  const D=2;
  const c=document.createElement('canvas');c.width=GW*D;c.height=GH*D;
  const g=c.getContext('2d');g.setTransform(D,0,0,D,0,0);g.imageSmoothingEnabled=false;
  const R=(x,y,w,h,col)=>{g.fillStyle=col;g.fillRect(Math.round(x*2)/2,Math.round(y*2)/2,Math.max(.5,Math.round(w*2)/2),Math.max(.5,Math.round(h*2)/2));};
  const VG=(x,y,w,h,c1,c2)=>{for(let k=0;k<h;k+=.5)R(x,y+k,w,.5,mix(c1,c2,k/Math.max(.5,h-.5)));};
  const OMB=(x,y,w,h,a)=>{for(let k=0;k<h;k+=.5)R(x,y+k,w,.5,'rgba(30,24,16,'+(a*(1-k/h)).toFixed(3)+')');};
  const ell=(cx,cy,rx,ry,col)=>{g.fillStyle=col;g.beginPath();g.ellipse(cx,cy,rx,ry,0,0,7);g.fill();};
  const texte=(t,x,y,f,col,al)=>{g.fillStyle=col;g.font=f;g.textAlign=al||'center';g.textBaseline='middle';g.fillText(t,x,y);};

  /* ============ CIEL — dégradé doux comme la Corniche ============ */
  VG(0,0,GW,HORIZON,'#4a9edc','#8cc6ec');
  VG(0,HORIZON-20,GW,20,'#8cc6ec','#c8e4f0');
  /* nuages : groupes d'ellipses blanches translucides, 3 plans de profondeur */
  for(let pl=0;pl<3;pl++){
    const ny=10+pl*30, na=.08+pl*.05;
    for(let i=0;i<10;i++){const cx=hA(i+pl*30,7,1)*GW, cy=ny+hA(i+pl*30,7,2)*20;
      const spread=40+hA(i+pl*30,7,3)*80;
      for(let j=0;j<18;j++){
        g.fillStyle='rgba(255,255,255,'+(na+hA(i,j+pl*12,4)*.1).toFixed(2)+')';
        g.beginPath();g.ellipse(cx+(j-9)*spread/15,cy+hA(i,j,5)*6-3,spread/9+hA(i,j,8)*4,2.5+hA(i,j,6)*3,0,0,7);g.fill();}}}
  /* soleil avec halo multi-couches (comme la Corniche) */
  for(const[r,a]of[[40,.06],[28,.12],[18,.22],[10,.45],[5,.8],[2.5,1]]){
    g.fillStyle='rgba(255,'+(238+r/2|0)+','+(175+r|0)+','+a+')';g.beginPath();g.arc(280,42,r,0,7);g.fill();}
  g.fillStyle='#ffffff';g.beginPath();g.arc(278,40,1.5,0,7);g.fill();

  /* ============ MONTAGNES — 2 plans avec silhouettes sinusoïdales + hash ============ */
  g.fillStyle='#8aa8b8';g.beginPath();g.moveTo(0,HORIZON);
  for(let x=0;x<=GW;x+=2)g.lineTo(x,HORIZON-16-Math.sin(x/70)*9-Math.cos(x/35)*3-hA(x,3,21)*3);
  g.lineTo(GW,HORIZON);g.closePath();g.fill();
  /* crêtes éclairées plan 1 */
  for(let i=0;i<50;i++)R(hA(i,1,23)*GW,HORIZON-14+hA(i,2,23)*8,2+hA(i,3,23)*2,.5,'rgba(200,220,240,.3)');
  g.fillStyle='#6a8898';g.beginPath();g.moveTo(0,HORIZON);
  for(let x=0;x<=GW;x+=2)g.lineTo(x,HORIZON-10-Math.sin(x/45)*7-Math.cos(x/22)*4-hA(x,2,22)*2);
  g.lineTo(GW,HORIZON);g.closePath();g.fill();
  for(let i=0;i<40;i++)R(hA(i,4,23)*GW,HORIZON-8+hA(i,5,23)*5,2+hA(i,6,23)*1.5,.5,'rgba(180,200,220,.25)');

  /* ============ MER — dégradé profond, reflets soleil, crêtes de vagues ============ */
  VG(0,HORIZON,GW,MER_FIN-HORIZON,'#1a4a68','#0e2a3e');
  /* reflet doré du soleil */
  for(let y=HORIZON;y<MER_FIN;y++){const k=(y-HORIZON)/(MER_FIN-HORIZON);const w=15+k*55;
    for(let i=0;i<4;i++){const dx=hA(y,i,31)*w*2-w;R(280+dx,y,1.5+hA(y,i,32)*1.5,.5,'rgba(255,220,150,'+(.18*(1-k)).toFixed(2)+')');}}
  /* 3 couches de crêtes de vagues */
  for(let pl=0;pl<3;pl++)for(let i=0;i<140;i++){
    const x=hA(i+pl*200,1,24+pl)*GW, y=HORIZON+6+hA(i+pl*200,2,24+pl)*(MER_FIN-HORIZON-10);
    R(x,y,3+hA(i+pl*200,3,24+pl)*7,.5,'rgba(180,215,235,'+(.1+hA(i+pl*200,4,24+pl)*.18)+')');}
  /* écume au pied du quai */
  for(let i=0;i<80;i++)R(hA(i,1,25)*GW,MER_FIN-3+hA(i,2,25)*2,2+hA(i,3,25)*3,.5,'rgba(255,255,255,'+(.25+hA(i,4,25)*.35)+')');

  /* ============ CARGO AU LOIN — détaillé comme dessinerTerrasses ============ */
  ell(140,MER_FIN-24,70,3,'rgba(0,0,0,.12)');
  /* coque courbe */
  g.fillStyle=mix('#2a4468','#0e243e',.4);g.beginPath();
  g.moveTo(45,MER_FIN-34);g.lineTo(45,MER_FIN-50);g.quadraticCurveTo(55,MER_FIN-54,75,MER_FIN-55);
  g.lineTo(205,MER_FIN-55);g.quadraticCurveTo(222,MER_FIN-52,228,MER_FIN-44);g.quadraticCurveTo(232,MER_FIN-36,228,MER_FIN-30);
  g.lineTo(48,MER_FIN-30);g.closePath();g.fill();
  /* liseré clair */
  g.strokeStyle='#4a6a94';g.lineWidth=.5;g.beginPath();g.moveTo(50,MER_FIN-50);g.quadraticCurveTo(60,MER_FIN-53,75,MER_FIN-54);g.lineTo(205,MER_FIN-54);g.stroke();
  /* bande rouge */
  R(49,MER_FIN-44,180,2.5,'#c82010');R(49,MER_FIN-44,180,.5,'#f04230');
  /* hublots */
  for(let x=56;x<224;x+=6){ell(x,MER_FIN-38,2,2,'#5a5448');ell(x,MER_FIN-38,1.5,1.5,'#17262c');ell(x-.3,MER_FIN-38.3,.6,.6,'#8ab0c8');}
  /* flottaison */
  R(45,MER_FIN-32,183,2.5,'#06162a');
  /* pont blanc */
  VG(68,MER_FIN-66,120,12,'#ffffff','#e2d8c4');R(68,MER_FIN-66,120,1.5,'#ffffff');
  /* vitres panoramiques */
  VG(72,MER_FIN-62,112,6,'#2a4868','#4a6888');
  for(let x=76;x<180;x+=6)R(x,MER_FIN-62,.5,6,'#1a2a3a');
  /* reflet diagonal */
  g.fillStyle='rgba(200,225,240,.2)';g.beginPath();g.moveTo(74,MER_FIN-57);g.lineTo(90,MER_FIN-62);g.lineTo(98,MER_FIN-62);g.lineTo(82,MER_FIN-57);g.closePath();g.fill();
  /* passerelle */
  VG(96,MER_FIN-78,40,12,'#ffffff','#d8ccbc');R(96,MER_FIN-78,40,1.5,'#ffffff');
  VG(100,MER_FIN-76,32,8,'#2a4868','#1a2a3a');
  /* cheminées */
  for(const cx of[104,116]){
    VG(cx,MER_FIN-92,10,16,'#f04230','#9a1800');R(cx,MER_FIN-92,10,2,'#1a1a1a');
    R(cx+2,MER_FIN-84,6,5,'#ffffff');
    g.fillStyle='#1a4a8a';g.beginPath();g.arc(cx+5,MER_FIN-82,1.5,0,7);g.fill();}
  /* conteneurs colorés sur le pont */
  for(const[bx,bc]of[[66,'#c0392b'],[74,'#2a5a9a'],[82,'#3a8a4a'],[90,'#f0a030'],[170,'#7a3ad0'],[178,'#1a6a6a'],[186,'#c86a2a']]){
    R(bx,MER_FIN-57,6,3,bc);R(bx,MER_FIN-60,6,3,tn(bc,20));}
  /* antenne + radar */
  R(115,MER_FIN-98,1,8,'#2a2a30');R(111,MER_FIN-100,8,1.5,'#4a4a52');
  /* drapeau */
  R(115,MER_FIN-106,1,8,'#2a2a30');R(116,MER_FIN-105,8,5,'#ffffff');ell(119,MER_FIN-103,1.5,1.5,'#1a1a1a');

  /* mouettes */
  for(const[mx,my,s]of[[50,30,1],[145,18,1.1],[245,44,.9],[310,28,1],[85,60,.8],[200,35,1]]){
    R(mx,my,s,1,'#fff');R(mx-2*s,my+1,2*s,1,'#fff');R(mx+s,my+1,2*s,1,'#fff');R(mx-3*s,my+2,s,.5,'rgba(255,255,255,.5)');}

  /* ============ BORD DE QUAI — margelle, pavés sombres, caniveau ============ */
  R(0,MER_FIN,GW,3,'#ece4d2');R(0,MER_FIN,GW,.5,'#fbf6ea');R(0,MER_FIN+2.5,GW,.5,'#bfb196');
  /* bande de pavés sombres */
  for(let y=MER_FIN+3;y<MER_FIN+10;y+=3.5)for(let x=0;x<GW;x+=5){
    R(x,y,5,3.5,['#8a847a','#827c72','#928c82'][(hA(x,y,8)*3)|0]);R(x,y,5,.3,'rgba(255,255,255,.08)');R(x,y,.3,3.5,'rgba(0,0,0,.08)');}
  /* caniveau acier */
  R(0,MER_FIN+10,GW,3,'#9aa0a6');for(let x=0;x<GW;x+=2.5)R(x,MER_FIN+10.5,1.5,2,'#4a5058');
  /* bande jaune danger */
  for(let x=0;x<GW;x+=14){R(x,QUAI_Y,10,3,'#f2c418');R(x,QUAI_Y+2.5,10,.5,'#c8a008');}

  /* ============ SOL DU QUAI — dalles opus romain comme la Joliette ============ */
  const OP=[[0,0,24,16],[24,0,16,16],[40,0,24,24],[0,16,16,24],[16,16,24,8],[16,24,24,16],[40,24,24,16]];
  const dalle=(x,y,w,h,col,j)=>{R(x,y,w,h,j||tn(col,-34));R(x+.5,y+.5,w-1,h-1,col);R(x+.5,y+.5,w-1,.5,tn(col,14));R(x+.5,y+.5,.5,h-1,tn(col,8));R(x+.5,y+h-1,w-1,.5,tn(col,-12));};
  const DCOLS=['#c0bbab','#b8b2a2','#c4bead','#b4ada0','#c8c2b2'];
  for(let by=ZONE_TOP-12;by<GH;by+=40)for(let bx=0;bx<GW;bx+=64)for(const[dx,dy,w,h]of OP)
    if(by+dy>=ZONE_TOP-12)dalle(bx+dx,by+dy,w,Math.min(h,GH-by-dy),DCOLS[(hA(bx+dx,by+dy,9)*5)|0],'#9a9488');
  /* grain */
  for(let i=0;i<600;i++){const x=hA(i,1,41)*GW,y=ZONE_TOP+hA(i,2,41)*(GH-ZONE_TOP);
    R(x,y,1,1,hA(i,3,41)<.4?'rgba(50,40,30,.18)':'rgba(255,245,225,.08)');}
  /* traces d'huile */
  for(let i=0;i<10;i++)ell(hA(i,1,42)*GW,ZONE_TOP+20+hA(i,2,42)*(GH-ZONE_TOP-30),8+hA(i,3,42)*10,3+hA(i,4,42)*3,'rgba(30,22,16,.12)');
  /* rails de grue encastrés */
  for(const ry of[ZONE_TOP-4,ZONE_BOT+8]){
    R(0,ry,GW,3.5,'#4a4a52');R(0,ry,GW,.5,'#7a7a82');R(0,ry+3,GW,.5,'#1a1a1a');
    for(let x=6;x<GW;x+=14)R(x,ry+3,3,1.5,'#2a2a30');}
  /* numéro de poste peint au sol (très grand, transparent) */
  g.globalAlpha=.12;g.fillStyle='#f4f0ea';g.font='900 100px system-ui,sans-serif';g.textAlign='center';g.textBaseline='middle';
  g.fillText('5',GW/2,(ZONE_TOP+ZONE_BOT)/2);g.globalAlpha=1;
  /* marquage zone pointillés jaunes */
  g.strokeStyle='rgba(242,196,24,.4)';g.lineWidth=1;g.setLineDash([4,3]);
  g.strokeRect(OX-6,ZONE_TOP-2,TOTAL_W+SIDE_W+12,ZONE_BOT-ZONE_TOP+4);g.setLineDash([]);

  /* ============ LES GRUES PORTIQUES ============ */
  for(const[gx,gDir]of[[4,1],[GW-14,-1]]){
    /* pieds verticaux avec dégradé acier */
    for(const px of[gx+2,gx+18]){VG(px,MER_FIN-6,3,GH-MER_FIN+6,'#5a5e66','#3a3e44');R(px,MER_FIN-6,.5,GH-MER_FIN+6,'#7a7e86');}
    /* traverse haute */
    R(gx,MER_FIN-16,22,3.5,'#4a5060');R(gx,MER_FIN-16,22,.5,'#6a6e78');
    /* flèche (boom) */
    R(gx+(gDir>0?20:-90),MER_FIN-22,100,2.5,'#4a5060');R(gx+(gDir>0?20:-90),MER_FIN-22,100,.5,'#6a6e78');
    /* contre-poids rouge */
    R(gx+(gDir>0?-16:22),MER_FIN-26,16,8,'#c0392b');R(gx+(gDir>0?-16:22),MER_FIN-26,16,1,'#e04030');
    /* cabine jaune avec vitres */
    VG(gx+4,MER_FIN-30,14,12,'#f0c040','#c89a20');R(gx+4,MER_FIN-30,14,1,'#f8d860');
    VG(gx+6,MER_FIN-26,10,6,'#2a4868','#1a2a3a');R(gx+6,MER_FIN-26,10,.5,'#4a6888');
    /* haubans */
    g.strokeStyle='#3a3e46';g.lineWidth=.5;
    g.beginPath();g.moveTo(gx+11,MER_FIN-30);g.lineTo(gx+(gDir>0?108:-78),MER_FIN-20);g.stroke();
    g.beginPath();g.moveTo(gx+11,MER_FIN-30);g.lineTo(gx+(gDir>0?-12:34),MER_FIN-24);g.stroke();
    /* feu rouge */
    R(gx+10,MER_FIN-32,2,2,'#ff3a3a');
    g.fillStyle='rgba(255,60,60,.12)';g.beginPath();g.arc(gx+11,MER_FIN-31,5,0,7);g.fill();}

  /* barre info en bas */
  R(0,ZONE_BOT+20,GW,GH-ZONE_BOT-20,'#0e1626');

  FOND=c;}

/* ===== DESSIN D'UN CONTENEUR 3D ===== */
function drawCont(g,c,time,s){
  if(c.dead&&c.tapAnim<=0)return;
  let sc=c.dead?c.tapAnim:Math.min(1,c.anim);
  if(!c.dead&&c.anim<1)c.anim=Math.min(1,c.anim+.08);
  if(c.dead)c.tapAnim=Math.max(0,c.tapAnim-.035);

  g.save();
  if(sc<1){const cx=c.x+c.w/2,cy=c.y+c.h/2;g.translate(cx*s,cy*s);g.scale(sc,sc);g.translate(-cx*s,-cy*s);}

  const R=(x,y,w,h,col)=>{g.fillStyle=col;g.fillRect(Math.round(x*s),Math.round(y*s),Math.max(1,Math.round(w*s)),Math.max(1,Math.round(h*s)));};
  const ell=(cx,cy,rx,ry,col)=>{g.fillStyle=col;g.beginPath();g.ellipse(cx*s,cy*s,rx*s,ry*s,0,0,7);g.fill();};

  /* ombre */
  ell(c.x+c.w/2,c.y+c.h+3,c.w/2+2,3,'rgba(0,0,0,.18)');
  /* face principale */
  R(c.x,c.y,c.w,c.h,c.col);
  /* nervures */
  for(let nx=c.x+3;nx<c.x+c.w;nx+=3){R(nx,c.y,1,c.h,tn(c.col,-10));R(nx+1,c.y,.5,c.h,tn(c.col,8));}
  /* reflet haut + ombre bas */
  R(c.x+1,c.y+1,c.w-2,1.5,'rgba(255,255,255,.2)');R(c.x,c.y+c.h-1.5,c.w,1.5,tn(c.col,-28));
  /* portes (battants à droite) */
  R(c.x+c.w-11,c.y+2,.5,c.h-4,tn(c.col,-18));R(c.x+c.w-5.5,c.y+2,.5,c.h-4,tn(c.col,-18));
  R(c.x+c.w-9,c.y+c.h/2-2,1,3.5,tn(c.col,-32));R(c.x+c.w-3.5,c.y+c.h/2-2,1,3.5,tn(c.col,-32));
  R(c.x+c.w-7,c.y+c.h/2,1.5,1.5,tn(c.col,-42));
  /* dessus (3D) */
  R(c.x,c.y-TOP_H,c.w,TOP_H,tn(c.col,22));R(c.x,c.y-TOP_H,c.w,.5,tn(c.col,38));
  for(let nx=c.x+3;nx<c.x+c.w;nx+=3)R(nx,c.y-TOP_H,.5,TOP_H,tn(c.col,10));
  /* côté droit (3D) */
  R(c.x+c.w,c.y-TOP_H,SIDE_W,c.h+TOP_H,tn(c.col,-22));R(c.x+c.w,c.y-TOP_H,.5,c.h+TOP_H,tn(c.col,-8));R(c.x+c.w+SIDE_W-.5,c.y-TOP_H,.5,c.h+TOP_H,tn(c.col,-38));
  /* coin raccord */
  R(c.x+c.w,c.y-TOP_H,SIDE_W,TOP_H,tn(c.col,8));
  /* marque */
  g.fillStyle='rgba(255,255,255,.88)';g.font='900 '+Math.round(7*s)+'px system-ui,sans-serif';g.textAlign='left';g.textBaseline='middle';
  g.fillText(c.marque,Math.round((c.x+3)*s),Math.round((c.y+c.h/2-1)*s));
  /* numéro de série */
  g.fillStyle='rgba(255,255,255,.4)';g.font='600 '+Math.round(3.5*s)+'px ui-monospace,monospace';
  g.fillText('MSKU'+(((c.x*73+c.y*17)&0xffffff)>>>0).toString(10).padStart(7,'0'),Math.round((c.x+3)*s),Math.round((c.y+c.h-3)*s));
  /* code ISO */
  g.fillStyle='rgba(255,255,255,.5)';g.font='700 '+Math.round(3*s)+'px ui-monospace';
  g.fillText('22G1',Math.round((c.x+3)*s),Math.round((c.y+3.5)*s));
  /* pastille danger */
  if(c.col==='#c0392b'||c.col==='#f0a030'){R(c.x+c.w-15,c.y+2,4,4,'#f0c040');
    g.fillStyle='#1a1a1a';g.font='900 '+Math.round(3*s)+'px system-ui';g.textAlign='center';
    g.fillText('!',Math.round((c.x+c.w-13)*s),Math.round((c.y+4.5)*s));g.textAlign='left';}

  g.restore();}

/* ===== BOUCLE ===== */
function boucle(t){if(!RAC)return;RAF=requestAnimationFrame(boucle);
  const dt=Math.min(.05,(t-(boucle.t||t))/1000);boucle.t=t;if(!J)return;
  if(J.tCombo>0){J.tCombo-=dt;if(J.tCombo<=0)J.combo=1;}

  if(!FOND)fond();
  /* adapter le canvas au viewport */
  const r=CV.getBoundingClientRect();DPR=Math.min(2.5,devicePixelRatio||1);
  const cw=Math.round(r.width*DPR),ch=Math.round(r.height*DPR);
  if(CV.width!==cw||CV.height!==ch){CV.width=cw;CV.height=ch;}
  const sx=CV.width/GW,sy=CV.height/GH,s=Math.min(sx,sy);
  const ox=(CV.width-GW*s)/2,oy=(CV.height-GH*s)/2;

  G.setTransform(1,0,0,1,0,0);G.fillStyle='#0a1420';G.fillRect(0,0,CV.width,CV.height);
  /* dessiner le fond pré-rendu (stretché au viewport) */
  G.drawImage(FOND,ox,oy,GW*s,GH*s);
  /* conteneurs */
  G.save();G.translate(ox,oy);
  for(const c of J.conts)drawCont(G,c,t,s);
  J.conts=J.conts.filter(c=>!c.dead||c.tapAnim>0);
  /* particules */
  for(let i=particles.length-1;i>=0;i--){
    const p=particles[i];p.x+=p.vx;p.y+=p.vy;p.vy+=.08;p.life-=dt;
    if(p.life<=0){particles.splice(i,1);continue;}
    G.globalAlpha=Math.min(1,p.life);
    if(p.text){G.fillStyle=p.col;G.font='900 '+Math.round(10*s)+'px system-ui';G.textAlign='center';G.textBaseline='middle';G.fillText(p.text,p.x*s,p.y*s);}
    else{G.fillStyle=p.col;G.fillRect(Math.round((p.x-p.sz/2)*s),Math.round((p.y-p.sz/2)*s),Math.round(p.sz*s),Math.round(p.sz*s));}
    G.globalAlpha=1;}
  G.restore();

  /* HUD */
  G.setTransform(1,0,0,1,0,0);
  const u=CV.width/100;
  G.fillStyle='rgba(10,20,30,.72)';G.beginPath();
  const hx=2*u,hy=oy+2*u,hw=CV.width-4*u,hh=8*u,hr=2*u;
  G.moveTo(hx+hr,hy);G.lineTo(hx+hw-hr,hy);G.arcTo(hx+hw,hy,hx+hw,hy+hr,hr);G.lineTo(hx+hw,hy+hh-hr);G.arcTo(hx+hw,hy+hh,hx+hw-hr,hy+hh,hr);G.lineTo(hx+hr,hy+hh);G.arcTo(hx,hy+hh,hx,hy+hh-hr,hr);G.lineTo(hx,hy+hr);G.arcTo(hx,hy,hx+hr,hy,hr);G.closePath();G.fill();
  G.fillStyle='#f2d070';G.font='900 '+Math.round(3.5*u)+'px system-ui';G.textAlign='left';G.textBaseline='middle';
  G.fillText(J.score.toLocaleString('fr-FR')+' €',4*u,hy+hh/2);
  if(J.combo>1){G.fillStyle='#ff6a3a';G.textAlign='center';G.fillText('🔥 ×'+J.combo,CV.width/2,hy+hh/2);}
  G.fillStyle='#8ab0d0';G.textAlign='right';G.font='700 '+Math.round(2.5*u)+'px system-ui';
  G.fillText(J.taps+' conteneurs',CV.width-4*u,hy+hh/2);
  /* flash */
  if(J.flash>0){G.fillStyle='rgba(255,246,210,'+J.flash+')';G.fillRect(0,0,CV.width,CV.height);J.flash=Math.max(0,J.flash-.02);}
}

/* ===== CSS ===== */
const CSS=`
#ctn{position:fixed;inset:0;z-index:2147482000;background:#0a1420;display:flex;flex-direction:column;opacity:0;transition:opacity .25s;touch-action:none;user-select:none;-webkit-user-select:none}
#ctn.on{opacity:1}
#ctn .scene{flex:1;position:relative;overflow:hidden}
#ctn .scene canvas{position:absolute;inset:0;width:100%;height:100%}
#ctn .bar{flex:none;display:flex;gap:8px;padding:8px 12px calc(8px + env(safe-area-inset-bottom));background:#0e1626;justify-content:center}
#ctn .bar button{border:0;border-radius:12px;padding:10px 18px;font:800 14px system-ui;cursor:pointer;-webkit-tap-highlight-color:transparent}
#ctn .x{background:rgba(255,255,255,.12);color:#fff}
#ctn .x:active{background:rgba(255,255,255,.2)}
.ctnFin{position:absolute;inset:0;background:rgba(10,20,34,.8);display:flex;align-items:center;justify-content:center;opacity:0;transition:opacity .3s;z-index:2}
.ctnFin.on{opacity:1}
.ctnFin .t{width:min(320px,88vw);background:#f6edd6;border-radius:20px;padding:22px;text-align:center;box-shadow:0 12px 40px rgba(0,0,0,.4);font-family:system-ui,sans-serif}
.ctnFin .k{font:800 11px system-ui;letter-spacing:2px;color:#8a7a5a}
.ctnFin .sc{font:900 32px system-ui;color:#2a2016;margin:6px 0}
.ctnFin .dt{font:700 13px system-ui;color:#6a5a40}
.ctnFin .nr{font:800 15px system-ui;color:#c8a040;margin:8px 0}
.ctnFin .eu{font:900 20px system-ui;color:#2a8a4a;margin:10px 0 16px}
.ctnFin .bts{display:flex;gap:10px}
.ctnFin .bts button{flex:1;border:0;border-radius:14px;padding:13px;font:800 15px system-ui;cursor:pointer}
.ctnFin .o1{background:#2a5a9a;color:#fff;box-shadow:0 4px 0 #1a3a6a}
.ctnFin .o2{background:rgba(0,0,0,.08);color:#2a2016}
.ctnFin .o1:active,.ctnFin .o2:active{transform:translateY(2px)}`;

function fermer(){if(!RAC)return;cancelAnimationFrame(RAF);const r=RAC;RAC=null;J=null;
  window.ECRAN_COUVRANT=false;r.classList.remove('on');setTimeout(()=>r.remove(),300);}

window.ouvrirConteneurs=function(){if(RAC)return;
  if(!document.getElementById('ctnCss')){const s=document.createElement('style');s.id='ctnCss';s.textContent=CSS;document.head.appendChild(s);}
  const d=document.createElement('div');d.id='ctn';RAC=d;
  d.innerHTML='<div class="scene"><canvas></canvas></div>'
    +'<div class="bar"><button class="x">✕ Quitter</button></div>';
  document.body.appendChild(d);
  CV=d.querySelector('.scene canvas');G=CV.getContext('2d');
  FOND=null;particles=[];
  nouveau();
  requestAnimationFrame(()=>{d.classList.add('on');window.ECRAN_COUVRANT=true;});
  RAF=requestAnimationFrame(boucle);
  CV.addEventListener('pointerdown',ev=>{ev.preventDefault();taper(ev.clientX,ev.clientY);},{passive:false});
  d.querySelector('.x').onclick=fermer;};
})();
