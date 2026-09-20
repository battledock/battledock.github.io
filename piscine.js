/* =====================================================================
   LA PISCINE MUNICIPALE DU VIEUX-PORT (chargée par jeu.html seulement quand on y est).
   On entre par le hall (le guichet), on traverse les VESTIAIRES : on entre dans une
   CABINE pour se mettre en maillot ; puis le PÉDILUVE (maillot obligatoire), et le
   BASSIN : lignes d'eau, plongeoir, échelles, transats, le maître-nageur sur sa chaise.
   Dans l'eau, on nage : on ne voit plus que le haut du corps, et des ronds dans l'eau.
   ===================================================================== */
(()=>{
const WW=320, WH=580;
const hs=(i)=>{const s=Math.sin(i*127.1+311.7)*43758.5453;return s-Math.floor(s);};
const mk=(w,h)=>{const c=document.createElement('canvas');c.width=w*2;c.height=h*2;const g=c.getContext('2d');g.setTransform(2,0,0,2,0,0);g.imageSmoothingEnabled=false;
  const F=(x,y,ww,hh,col)=>{if(ww<=0||hh<=0)return;g.fillStyle=col;g.fillRect(Math.round(x*2)/2,Math.round(y*2)/2,Math.max(0.5,Math.round(ww*2)/2),Math.max(0.5,Math.round(hh*2)/2));};return {c,g,F};};
const ombre=(g,x,y,rx,ry)=>{g.fillStyle='rgba(60,90,120,.28)';g.beginPath();g.ellipse(x+1,y+1,rx,ry||rx*0.25,0,0,7);g.fill();};
/* ---------- LE PLAN ---------- */
const BASSIN={x0:44,x1:276,y0:78,y1:262};                 /* l'eau */
const PLAGE={y0:34,y1:300};                               /* le carrelage autour du bassin */
const PEDI={y0:300,y1:326,x0:136,x1:184};                 /* le pédiluve : le passage vers le bassin */
const VEST={y0:326,y1:470};                               /* les vestiaires */
const HALL={y0:470,y1:WH};                                /* le hall d'entrée */
const CABINES=[46,86,126,194,234,274].map((x,i)=>({x,y:VEST.y0+30,i}));
const ARRIVEE=[160,520], SORTIE=[160,566];
const LIGNES=[0.25,0.5,0.75].map(k=>BASSIN.x0+(BASSIN.x1-BASSIN.x0)*k);
const dansEau=(x,y)=>x>BASSIN.x0+3&&x<BASSIN.x1-3&&y>BASSIN.y0+6&&y<BASSIN.y1-2;
/* ---------- LE SOL ---------- */
function sol(){
  const {c,g,F}=mk(WW,WH);
  /* les murs du fond : une grande verrière */
  F(0,0,WW,PLAGE.y0,'#dfeef4');for(let x=0;x<WW;x+=20){F(x,0,1.5,PLAGE.y0,'#7d8a96');}F(0,PLAGE.y0-4,WW,4,'#c4d2da');F(0,10,WW,1.5,'#7d8a96');
  g.fillStyle='rgba(255,255,255,.35)';for(let x=6;x<WW;x+=40){g.beginPath();g.moveTo(x,2);g.lineTo(x+10,2);g.lineTo(x+2,PLAGE.y0-6);g.lineTo(x-8,PLAGE.y0-6);g.fill();}
  /* la plage : carrelage blanc à joints gris, frise bleue */
  for(let y=PLAGE.y0;y<PLAGE.y1;y+=6)for(let x=0;x<WW;x+=6){F(x,y,6,6,((x/6+y/6)%2)?'#f4f8fa':'#eaf2f6');F(x,y,6,0.5,'#d0dce4');F(x,y,0.5,6,'#d0dce4');}
  for(let x=0;x<WW;x+=6)F(x,PLAGE.y1-4,3,4,'#2d6fb0');
  /* le bassin : bleu profond au centre, plus clair au bord, la margelle, les lignes au fond */
  const {x0,x1,y0,y1}=BASSIN;F(x0-6,y0-6,x1-x0+12,y1-y0+12,'#c8d6de');F(x0-6,y0-6,x1-x0+12,1.5,'#ffffff');
  const eau=g.createLinearGradient(0,y0,0,y1);eau.addColorStop(0,'#4ab0d8');eau.addColorStop(1,'#2a82c0');g.fillStyle=eau;g.fillRect(x0,y0,x1-x0,y1-y0);
  for(let k=0;k<5;k++){const lx=x0+(x1-x0)*(k+0.5)/4-((x1-x0)/8);F(lx-1.5,y0+10,3,y1-y0-20,'rgba(20,50,110,.35)');F(lx-5,y0+10,10,2,'rgba(20,50,110,.35)');F(lx-5,y1-12,10,2,'rgba(20,50,110,.35)');}
  g.fillStyle='rgba(255,255,255,.12)';for(let k=0;k<40;k++){const x=x0+hs(k)*(x1-x0), y=y0+hs(k*3)*(y1-y0);g.beginPath();g.ellipse(x,y,6+hs(k*7)*8,1.2,0,0,7);g.fill();}
  F(x0,y0,x1-x0,2,'rgba(0,0,0,.18)');
  /* les chiffres de profondeur sur la margelle */
  g.font='700 5px Georgia';g.fillStyle='#1d4f8a';g.fillText('1,20 m',x0-2,y1+10);g.fillText('2,50 m',x1-22,y0-9);
  /* le pédiluve, et les deux murets qui y mènent */
  F(PEDI.x0,PEDI.y0,PEDI.x1-PEDI.x0,PEDI.y1-PEDI.y0,'#7ac8e8');for(let x=PEDI.x0;x<PEDI.x1;x+=4)F(x,PEDI.y0+6,3,0.8,'rgba(255,255,255,.5)');
  F(0,PEDI.y0,PEDI.x0,PEDI.y1-PEDI.y0,'#c4d2da');F(PEDI.x1,PEDI.y0,WW-PEDI.x1,PEDI.y1-PEDI.y0,'#c4d2da');F(0,PEDI.y0,WW,1.5,'#ffffff');
  g.font='700 4.4px Georgia';g.textAlign='center';g.fillStyle='#1d4f8a';g.fillText('MAILLOT OBLIGATOIRE',80,PEDI.y0+15);g.fillText('BONNET CONSEILLÉ',240,PEDI.y0+15);g.textAlign='left';
  /* les vestiaires : un carrelage bleu pâle ; le mur des cabines */
  for(let y=VEST.y0;y<VEST.y1;y+=5)for(let x=0;x<WW;x+=5){F(x,y,5,5,((x/5+y/5)%2)?'#dcebf4':'#d0e4f0');F(x,y,5,0.5,'#b8ccd8');}
  F(0,VEST.y0,WW,22,'#8ab0c8');F(0,VEST.y0+20,WW,2,'#5a7e98');
  /* le hall : des dalles beiges, un tapis, le guichet */
  for(let y=HALL.y0;y<HALL.y1;y+=8)for(let x=0;x<WW;x+=8){F(x,y,8,8,((x/8+y/8)%2)?'#ece2cc':'#e2d6bc');F(x,y,8,0.5,'#c8bca0');}
  F(0,HALL.y0,WW,3,'#8ab0c8');F(118,WH-26,84,26,'#2d6fb0');F(120,WH-24,80,22,'#3a80c0');
  for(let x=124;x<196;x+=8)F(x,WH-22,4,18,'rgba(255,255,255,.12)');
  g.font='700 5px Georgia';g.textAlign='center';g.fillStyle='#ffffff';g.fillText('SORTIE · LE QUAI',160,WH-10);g.textAlign='left';
  return c;}
let SOL_M=null;
/* ---------- LES OBJETS ---------- */
function graverCabine(i){const W=36,H=46,{c,g,F}=mk(W,H);const cx=W/2,sol=H-3, col=['#e8402a','#f0a830','#3f9e7a','#2d6fb0','#8a4ac0','#e86a8a'][i%6];
  F(cx-16,sol-38,32,38,'#f4f8fa');F(cx-16,sol-38,32,1,'#ffffff');F(cx-17,sol-38,1,38,'#b8ccd8');F(cx+16,sol-38,1,38,'#b8ccd8');
  F(cx-12,sol-34,24,34,col);F(cx-12,sol-34,24,1,'rgba(255,255,255,.5)');F(cx-12,sol-6,24,6,'rgba(0,0,0,.08)');
  F(cx+7,sol-18,2,3,'#c8ccd2');F(cx-4,sol-30,8,6,'#ffffff');g.font='700 4.4px Georgia';g.textAlign='center';g.fillStyle=col;g.fillText(String(i+1),cx,sol-25.5);g.textAlign='left';
  F(cx-12,sol-38,24,3,'#5a7e98');for(let k=0;k<5;k++)F(cx-10+k*5,sol-37.5,2,2,'#dcebf4');                       /* la ventilation */
  return {c,W,H,sol};}
function graverCasiers(){const W=60,H=40,{c,g,F}=mk(W,H);const sol=H-3;ombre(g,W/2,sol,28,2);
  for(let r=0;r<2;r++)for(let k=0;k<6;k++){const x=4+k*9, y=sol-34+r*16;F(x,y,8,15,['#2d6fb0','#3a80c0'][(k+r)%2]);F(x,y,8,0.8,'#6aa8e8');F(x+6,y+6,1,3,'#c8ccd2');F(x+2,y+2,4,1,'#1d4f8a');}
  return {c,W,H,sol};}
function graverBanc(){const W=50,H=16,{c,g,F}=mk(W,H);const sol=H-3;ombre(g,W/2,sol,22,2);
  F(3,sol-7,44,3,'#b08858');F(3,sol-7,44,0.8,'#d0a878');[[6],[42]].forEach(([x])=>F(x,sol-4,2,4,'#8a8f96'));return {c,W,H,sol};}
function graverPlongeoir(){const W=40,H=60,{c,g,F}=mk(W,H);const sol=H-3, cx=W/2;ombre(g,cx,sol,10,2);
  F(cx-8,sol-40,3,40,'#c8ccd2');F(cx+5,sol-40,3,40,'#c8ccd2');for(let y=sol-36;y<sol;y+=6)F(cx-8,y,16,1,'#8a8f96');                 /* l'échelle */
  F(cx-10,sol-44,20,4,'#2d6fb0');F(cx-2,sol-58,4,16,'#e8e2d4');F(cx-2,sol-58,4,1,'#ffffff');F(cx-3,sol-59,6,2,'#2d6fb0');          /* la planche, qui avance au-dessus de l'eau */
  return {c,W,H,sol};}
function graverEchelle(){const W=16,H=20,{c,g,F}=mk(W,H);const sol=H-3;g.strokeStyle='#c8ccd2';g.lineWidth=1.4;
  [[4],[12]].forEach(([x])=>{g.beginPath();g.moveTo(x,sol);g.lineTo(x,sol-10);g.quadraticCurveTo(x,sol-15,x-3,sol-14);g.stroke();});for(let y=sol-8;y<sol;y+=3)F(4,y,8,0.8,'#8a8f96');return {c,W,H,sol};}
function graverTransat(v){const W=20,H=28,{c,g,F}=mk(W,H);const sol=H-3, cx=W/2, col=['#e8402a','#2d6fb0','#f0a830'][v%3];ombre(g,cx,sol,8,2);
  F(cx-6,sol-22,12,20,'#e8e2d4');for(let y=0;y<20;y+=2)F(cx-6,sol-22+y,12,1,(y/2)%2?col:'#ffffff');F(cx-7,sol-22,1,22,'#8a8f96');F(cx+6,sol-22,1,22,'#8a8f96');
  F(cx-4,sol-22,8,3,'#f4f4f4');return {c,W,H,sol};}
function graverChaise(){const W=24,H=56,{c,g,F}=mk(W,H);const sol=H-3, cx=W/2;ombre(g,cx,sol,8,2);
  F(cx-8,sol-40,2,40,'#f4f4f4');F(cx+6,sol-40,2,40,'#f4f4f4');for(let y=sol-34;y<sol;y+=8)F(cx-8,y,16,1.5,'#f4f4f4');
  F(cx-9,sol-42,18,3,'#e8402a');F(cx-8,sol-54,16,12,'#e8402a');F(cx-8,sol-54,16,1,'#f08070');
  g.font='700 3.2px Georgia';g.textAlign='center';g.fillStyle='#fff';g.fillText('MAÎTRE',cx,sol-49.5);g.fillText('NAGEUR',cx,sol-45.5);g.textAlign='left';return {c,W,H,sol};}
function graverGuichet(){const W=70,H=50,{c,g,F}=mk(W,H);const sol=H-3, cx=W/2;ombre(g,cx,sol,32,3);
  F(cx-32,sol-24,64,24,'#2d6fb0');F(cx-32,sol-24,64,2,'#6aa8e8');F(cx-30,sol-20,60,16,'#3a80c0');
  F(cx-24,sol-44,48,20,'#dff4ff');F(cx-24,sol-44,48,1.5,'#ffffff');F(cx-1,sol-44,2,20,'#8ab0c8');
  F(cx-26,sol-48,52,6,'#1d4f8a');g.font='700 4.2px Georgia';g.textAlign='center';g.fillStyle='#fff';g.fillText('ENTRÉES · CAISSE',cx,sol-43.6);g.textAlign='left';
  g.fillStyle='#1d4f8a';g.font='700 3px Georgia';g.fillText('ENTRÉE 0 € · MUNICIPALE',cx-22,sol-26);return {c,W,H,sol};}
/* LES PLOTS DE DÉPART : quatre plots numérotés au bout du bassin, pour la course */
function graverPlots(){const W=200,H=22,{c,g,F}=mk(W,H);const sol=H-3;
  for(let k=0;k<4;k++){const x=16+k*56;ombre(g,x+6,sol,8,1.6);F(x,sol-10,12,10,'#f4f4f4');F(x,sol-10,12,1.5,'#ffffff');F(x,sol-2,12,2,'#c8ccd2');
    F(x+2,sol-8,8,5,['#e8402a','#2d6fb0','#f0a830','#3f9e7a'][k]);g.font='700 4.4px Georgia';g.textAlign='center';g.fillStyle='#fff';g.fillText(String(k+1),x+6,sol-4.2);g.textAlign='left';}
  return {c,W,H,sol};}
function graverBouee(){const W=16,H=16,{c,g,F}=mk(W,H);const sol=H-2;g.strokeStyle='#e8402a';g.lineWidth=2.4;g.beginPath();g.arc(8,7,4.5,0,7);g.stroke();
  g.strokeStyle='#ffffff';for(let q=0;q<4;q++){g.beginPath();g.arc(8,7,4.5,q*Math.PI/2+0.25,q*Math.PI/2+0.75);g.stroke();}return {c,W,H,sol};}
function objets(){const cal={}, L=[];const reg=(nom,J)=>{cal[nom]={toile:J.c,W:J.W,H:J.H,sol:J.sol,nuit:null};};
  CABINES.forEach(C=>{reg('cabine'+C.i,graverCabine(C.i));L.push({t:'x_mo_cabine'+C.i,x:C.x,y:C.y,v:0,col:[16,6],bati:true,demi:12,ouvre:'cabine'});});
  reg('casiers',graverCasiers());L.push({t:'x_mo_casiers',x:40,y:VEST.y1-6,v:0,col:[28,5]});L.push({t:'x_mo_casiers',x:280,y:VEST.y1-6,v:0,col:[28,5]});
  reg('banc',graverBanc());[[110,420],[210,420]].forEach(([x,y])=>L.push({t:'x_mo_banc',x,y,v:0,col:[22,3]}));
  reg('plongeoir',graverPlongeoir());L.push({t:'x_mo_plongeoir',x:(BASSIN.x0+BASSIN.x1)/2,y:BASSIN.y0-4,v:0,col:[10,4]});
  reg('echelle',graverEchelle());[[BASSIN.x0+18,BASSIN.y1+4],[BASSIN.x1-18,BASSIN.y1+4]].forEach(([x,y])=>L.push({t:'x_mo_echelle',x,y,v:0}));
  [0,1,2].forEach(v=>reg('transat'+v,graverTransat(v)));[[18,120,0],[18,170,1],[18,220,2],[302,130,1],[302,200,0]].forEach(([x,y,v])=>L.push({t:'x_mo_transat'+v,x,y,v:0,col:[7,3]}));
  reg('chaise',graverChaise());L.push({t:'x_mo_chaise',x:BASSIN.x1+22,y:BASSIN.y1+18,v:0,col:[8,3]});
  L.push({t:'x_mo_mn',x:BASSIN.x1+22,y:BASSIN.y1+16,v:0,col:[1,1],dir:'gauche',                                      /* le maître-nageur, perché */
    pnj:{peau:4,cheveux:6,coiffe:1,barbe:0,veste:'#e8402a',haut:1,pantalon:'#e8402a',bas:1,chaussures:'#f4f4f4',souliers:2,sac:0,chapeau:1,corps:3}});
  reg('guichet',graverGuichet());L.push({t:'x_mo_guichet',x:252,y:HALL.y0+54,v:0,col:[32,6],bati:true,demi:30,ferme:'La caisse de la piscine'});
  reg('plots',graverPlots());L.push({t:'x_mo_plots',x:(BASSIN.x0+BASSIN.x1)/2,y:BASSIN.y1+12,v:0,col:[4,2],bati:true,demi:100,ouvre:'course'});
  reg('bouee',graverBouee());[[BASSIN.x0-10,BASSIN.y0+40],[BASSIN.x1+10,BASSIN.y0+60]].forEach(([x,y])=>L.push({t:'x_mo_bouee',x,y,v:0}));
  L.push({t:'x_mo_sortie',x:SORTIE[0],y:SORTIE[1],v:0,bati:true,demi:40,ouvre:'sortiePiscine'});cal.sortie={toile:document.createElement('canvas'),W:1,H:1,sol:0,nuit:null};
  return {L,cal};}
/* ---------- CE QUI BOUGE : les reflets qui dansent sur l'eau, les lignes d'eau ---------- */
function vivant(g,camX,camY,t){
  const {x0,x1,y0,y1}=BASSIN;const sc=g.getTransform().a||1, Hv=g.canvas.height/sc;if(y0-camY>Hv||y1-camY<-10)return;
  g.fillStyle='rgba(255,255,255,.35)';
  for(let k=0;k<50;k++){const x=x0+((hs(k)*(x1-x0)+t*6*(k%2?1:-1))%(x1-x0)+(x1-x0))%(x1-x0), y=y0+8+hs(k*3)*(y1-y0-16)+Math.sin(t*1.5+k)*1.2;
    g.fillRect(x-camX,y-camY,3+(k%3),0.6);}
  /* les lignes d'eau : des flotteurs rouges et blancs, qui ondulent */
  LIGNES.forEach(lx=>{for(let y=y0+4;y<y1-2;y+=3){const o=Math.sin(t*2+y*0.2)*0.6;g.fillStyle=Math.floor((y-y0)/3)%4<2?'#e8402a':'#ffffff';g.fillRect(lx-1+o-camX,y-camY,2,2);}});
}
/* on ne passe pas le pédiluve sans maillot ; on ne sort pas des murs */
let AVERTI=0;
const zone=(x,y)=>{
  if(y<PLAGE.y0+4)return true;
  if(y>=PEDI.y0&&y<=PEDI.y1&&(x<PEDI.x0+4||x>PEDI.x1-4))return true;                                     /* les murets du pédiluve */
  if(y<PEDI.y1-2&&!(e&&e.ap&&e.ap.maillot)){                                                               /* maillot obligatoire */
    const n=Date.now();if(n-AVERTI>2500){AVERTI=n;try{texteVolant(joueur.x,joueur.y-56,'Maillot obligatoire ! Change-toi en cabine','#bfe8ff');}catch(err){}}return true;}
  if(y>VEST.y0-2&&y<VEST.y0+14&&!(x>PEDI.x0+4&&x<PEDI.x1-4))return true;                                   /* le mur des cabines (sauf le passage du pédiluve) */
  return false;};
return {WW,WH,objets,solFin:()=>SOL_M||(SOL_M=sol()),zoneInterdite:zone,dansNeige:()=>false,surGlace:()=>false,dansEau,
  dessinerPlace:(g,camX,camY,t)=>vivant(g,camX,camY,t),dessinerTelepherique:()=>{},ARRIVEE,METRO:null};
})()
