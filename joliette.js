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
const DEPART=(()=>{try{const q=new URLSearchParams(location.search).get('de');if(q==='terrasses')return [400,262];if(q==='stade')return [600,440];if(q==='piste')return [622,630];if(q==='foire')return [400,700];}catch(x){}return [400,712];})();
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
/* LA RUE DU BAS (plus de passage piéton : le port n'est plus un lieu) */
R(0,PLACE_BAS,W,4,'#b9b3a6');R(0,PLACE_BAS,W,1,'#eee8da');
for(let y=PLACE_BAS+4;y<H;y++)R(0,y,W,1,teinte('#5e6066',((y-PLACE_BAS)%7===0)?-6:0));
for(let i=0;i<1500;i++)R(h(i,1,31)*W,PLACE_BAS+4+h(i,2,31)*36,1,1,h(i,3,31)<.5?'#6c6e74':'#54565c');
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

/* LE PANNEAU D'AFFICHAGE de la place — trois dessins à l'essai (window.AFF_V = A, B ou C) */
function graverPanneauAffiches(){const v=window.AFF_V||'C';return v==='B'?affSucette():v==='C'?affMunicipal():affColonne();}
/* A — LA COLONNE MORRIS : le cylindre vert, son dôme festonné, des affiches tout autour */
function affColonne(){
const L=60,HH=118,{c,g,R}=toile(L,HH),cx=L/2,s=HH-4;
g.fillStyle='rgba(30,22,14,.25)';g.beginPath();g.ellipse(cx+3,s,24,5,0,0,7);g.fill();
/* le socle */
R(cx-21,s-8,42,8,'#1f4a3a');R(cx-21,s-8,42,1.5,'#3a7a5a');R(cx-23,s-2,46,2,'#173a2c');
/* le fût : bande d'affiches courbée (ombrée sur les bords) */
const top=s-84,h=76;
const gr=g.createLinearGradient(cx-19,0,cx+19,0);gr.addColorStop(0,'#c8b890');gr.addColorStop(.3,'#f2e8d0');gr.addColorStop(.75,'#e8dcc0');gr.addColorStop(1,'#a89870');g.fillStyle=gr;g.fillRect(cx-19,top,38,h);
/* affiches posées sur le fût */
const A=[[cx-17,top+4,12,18,'#d84a3a'],[cx-4,top+3,11,22,'#2a5aa8'],[cx+8,top+5,9,17,'#f2c43a'],[cx-16,top+27,10,20,'#3a9a5a'],[cx-5,top+29,13,16,'#7a3ad8'],[cx+9,top+26,8,22,'#e8862a'],[cx-12,top+52,16,18,'#f2ece0'],[cx+5,top+51,11,20,'#1f1a14']];
for(const [x,y,w,hh,col] of A){R(x,y,w,hh,col);R(x+1,y+2,w-2,1.5,'rgba(255,255,255,.7)');R(x+1,y+5,w-4,1,'rgba(255,255,255,.45)');R(x+1,y+hh-4,w-2,2,'rgba(0,0,0,.25)');}
/* l'ombre de rondeur */
const sh=g.createLinearGradient(cx-19,0,cx+19,0);sh.addColorStop(0,'rgba(0,0,0,.28)');sh.addColorStop(.25,'rgba(0,0,0,0)');sh.addColorStop(.7,'rgba(0,0,0,0)');sh.addColorStop(1,'rgba(0,0,0,.32)');g.fillStyle=sh;g.fillRect(cx-19,top,38,h);
/* la corniche, le dôme vert et ses festons */
R(cx-22,top-6,44,6,'#1f5a44');R(cx-22,top-6,44,1.5,'#4a9a74');
for(let k=0;k<7;k++){g.fillStyle='#1f5a44';g.beginPath();g.arc(cx-19+k*6.3,top,3,0,Math.PI);g.fill();}
g.fillStyle='#2a6a50';g.beginPath();g.moveTo(cx-20,top-6);g.quadraticCurveTo(cx-18,top-24,cx,top-26);g.quadraticCurveTo(cx+18,top-24,cx+20,top-6);g.fill();
g.fillStyle='#4a9a74';g.beginPath();g.moveTo(cx-12,top-8);g.quadraticCurveTo(cx-10,top-20,cx-2,top-22);g.lineTo(cx-2,top-19);g.quadraticCurveTo(cx-8,top-17,cx-9,top-8);g.fill();
R(cx-1.5,top-32,3,7,'#1f5a44');g.fillStyle='#e8c06a';g.beginPath();g.arc(cx,top-33,2.4,0,7);g.fill();
return {toile:c,W:L,H:HH,sol:s};}
/* B — LA SUCETTE : un mobilier urbain moderne, cadre gris, vitrine éclairée */
function affSucette(){
const L=48,HH=104,{c,g,R}=toile(L,HH),cx=L/2,s=HH-4;
g.fillStyle='rgba(30,22,14,.25)';g.beginPath();g.ellipse(cx+3,s,18,4,0,0,7);g.fill();
R(cx-6,s-6,12,6,'#3a3e46');R(cx-3,s-26,6,22,'#4a4e58');R(cx-3,s-26,2,22,'#6a6e78');
/* le caisson */
R(cx-20,s-98,40,74,'#3a3e46');R(cx-20,s-98,40,2,'#6a6e78');R(cx+18,s-98,2,74,'#2a2e36');
/* la vitrine éclairée, l'affiche dessous */
const gr=g.createLinearGradient(0,s-94,0,s-28);gr.addColorStop(0,'#fff8e8');gr.addColorStop(1,'#f2e2c0');g.fillStyle=gr;g.fillRect(cx-17,s-95,34,68);
R(cx-14,s-92,28,60,'#2a5aa8');R(cx-14,s-92,28,24,'#4a7ad8');g.fillStyle='#ffe08a';g.beginPath();g.arc(cx+5,s-80,6,0,7);g.fill();
R(cx-12,s-62,24,3,'#fff');R(cx-12,s-57,18,2,'rgba(255,255,255,.7)');R(cx-12,s-53,20,2,'rgba(255,255,255,.7)');R(cx-12,s-42,14,6,'#f2c43a');
g.fillStyle='rgba(255,255,255,.28)';g.beginPath();g.moveTo(cx-17,s-95);g.lineTo(cx-4,s-95);g.lineTo(cx-17,s-60);g.fill();
R(cx-17,s-28,34,3,'#2a2e36');g.fillStyle='#e8c06a';g.font='bold 4px "Trebuchet MS",sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText('À L’AFFICHE',cx,s-26.5);
return {toile:c,W:L,H:HH,sol:s,feux:[{x:cx,y:s-62,r:30,teinte:'rgba(255,236,190,§)'}]};}
/* C — LE PANNEAU MUNICIPAL : métal vert sapin, fronton bleu de la Ville, vitrines à clé */
function affMunicipal(){
const L=104,HH=96,{c,g,R}=toile(L,HH),cx=L/2,s=HH-4;
g.fillStyle='rgba(30,22,14,.24)';g.beginPath();g.ellipse(cx+3,s,46,5,0,0,7);g.fill();
for(const x of [8,L-12]){R(x,s-80,4,80,'#24463a');R(x,s-80,1.4,80,'#4a7a64');R(x-2,s-4,8,4,'#1a3a2e');}
/* le fronton */
R(4,s-90,L-8,14,'#1d3f74');R(4,s-90,L-8,1.6,'#4a7ad0');R(4,s-77,L-8,1.6,'#132a52');
g.fillStyle='#ffffff';g.font='bold 5.6px "Trebuchet MS",sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText('À L’AFFICHE · JOLIETTE',cx,s-83);
for(const x of [10,L-14])R(x,s-87,4,8,'#e8c06a');
/* les deux vitrines */
for(const [x0,w] of [[12,(L-28)/2],[cx+2,(L-28)/2]]){R(x0,s-74,w,50,'#24463a');R(x0+2,s-72,w-4,46,'#c89a5e');
  for(let i=0;i<70;i++){g.fillStyle=i%3?'rgba(120,80,40,.25)':'rgba(255,230,180,.25)';g.fillRect(x0+3+((i*31)%(w-6)),s-71+((i*17)%44),1,1);}
  if(x0===12){/* l'affiche du meeting d'athlétisme, punaisée dans la vitrine de gauche */
   const px=x0+5,py=s-69,pw=w-16,ph=40;g.fillStyle='rgba(60,30,10,.35)';g.fillRect(px+1,py+1.5,pw,ph);
   const gr=g.createLinearGradient(0,py,0,py+ph);gr.addColorStop(0,'#ff8a3a');gr.addColorStop(1,'#c0392b');g.fillStyle=gr;g.fillRect(px,py,pw,ph);
   R(px+2,py+2,pw-4,5,'#1a1a22');g.fillStyle='#ffd860';g.font='bold 3.6px "Trebuchet MS",sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText('MEETING',px+pw/2,py+4.6);
   g.strokeStyle='rgba(255,240,220,.8)';g.lineWidth=.5;for(let k=0;k<3;k++){g.beginPath();g.arc(px+pw/2+3,py+ph-4,8+k*2,Math.PI*1.05,Math.PI*1.75);g.stroke();}
   const rx=px+pw/2;g.fillStyle='#1a1a22';g.beginPath();g.arc(rx+1,py+11,1.6,0,7);g.fill();g.strokeStyle='#1a1a22';g.lineWidth=1.4;g.lineCap='round';
   g.beginPath();g.moveTo(rx+.5,py+12.5);g.lineTo(rx-1,py+19);g.lineTo(rx+3,py+22.5);g.lineTo(rx+2,py+27);g.moveTo(rx-1,py+19);g.lineTo(rx-5,py+22);g.lineTo(rx-7,py+20);g.moveTo(rx,py+14.5);g.lineTo(rx+4,py+16);g.lineTo(rx+5.5,py+14);g.moveTo(rx,py+14.5);g.lineTo(rx-3.5,py+15.5);g.lineTo(rx-5,py+18);g.stroke();g.lineCap='butt';
   g.fillStyle='#fff';g.font='bold 2.6px "Trebuchet MS",sans-serif';g.fillText('PISTE · 100 400 800 M',px+pw/2,py+ph-3);
   g.fillStyle='#c8201a';g.beginPath();g.arc(px+pw/2,py,1.1,0,7);g.fill();}
  else{/* une petite affiche bleue, et une feuille de petites annonces */
   R(x0+5,s-68,w*.48,30,'#173f86');R(x0+7,s-66,w*.48-4,4,'#f2c94c');R(x0+7,s-58,w*.48-4,1,'rgba(255,255,255,.7)');R(x0+7,s-55,w*.3,1,'rgba(255,255,255,.6)');
   R(x0+w*.6,s-66,w*.32,26,'#f6f0e2');for(let k=0;k<6;k++)R(x0+w*.6+2,s-63+k*3,w*.32-4,.6,'rgba(40,30,20,.45)');}
  g.fillStyle='rgba(200,230,255,.22)';g.fillRect(x0+2,s-72,w-4,46);g.fillStyle='rgba(255,255,255,.35)';g.beginPath();g.moveTo(x0+2,s-72);g.lineTo(x0+12,s-72);g.lineTo(x0+2,s-52);g.fill();
  R(x0+w-5,s-50,2,4,'#e8c06a');}
/* la tablette et le pied */
R(10,s-24,L-20,4,'#1a3a2e');R(10,s-24,L-20,1,'#4a7a64');
return {toile:c,W:L,H:HH,sol:s};}
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
  g.font=LOGO;const w1=g.measureText('LA GALERIE').width;
  texte('LA GALERIE',B0-14,TOIT+13,LOGO,'#ffffff','right');texte('BLEUE',B1+14,TOIT+13,LOGO,'#ffffff','left');
  const w2=g.measureText('BLEUE').width;g.restore();
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
  R(CX-62,y,124,7,'#173f8e');texte('BIENVENUE À LA GALERIE BLEUE',CX,y+3.7,'bold 4.4px "Helvetica Neue",Arial,sans-serif','#ffffff');
  for(const gx of [CX-74,CX+64]){R(gx,y+1.5,4,4,'#ffffff');R(gx+1,y+2.5,2,2,'#173f8e');R(gx+5,y+1.5,4,4,'#ffffff');R(gx+6,y+2.5,.8,3,'#173f8e');R(gx+7.2,y+2.5,.8,3,'#173f8e');}}
/* l'entrée : derrière les vitrages, le mail du centre commercial — sol de pierre poli,
   boutiques éclairées au fond, plafond à spots, un escalator, des passants, un palmier en pot.
   Les portes elles-mêmes sont animées à part. */
{const y=SOL-PH, x0=B0, x1=B1;
  R(x0,y,x1-x0,PH,'#1c2a30');
  g.save();g.beginPath();g.rect(x0+1,y+1,x1-x0-2,PH-1);g.clip();
  const FV=2;   /* le hall bleu */
  if(FV===1){
  /* 1 — CE QU'ON TROUVE DEDANS : la verrière, les grandes vitrines, le mur végétal et les banquettes bleues */
  VG(x0,y,x1-x0,10,'#a8cce8','#e4f0f8');for(let x=x0;x<x1;x+=10)R(x,y,.6,10,'#ffffff');R(x0,y+10,x1-x0,1.2,'#e6e2da');
  R(x0,y+11,x1-x0,26,'#ece6dc');
  for(let x=x0+4;x<x1-10;x+=52){R(x,y+13,46,4,'#efe9de');R(x,y+17,46,20,'#2c2e32');VG(x+1.5,y+18,43,18,'#6a7c88','#b4c2cc');R(x+16,y+24,14,4,'#fbf8f0');R(x+16,y+24,14,1,'#1f3fa8');}
  VG(x0,y+37,x1-x0,PH-37,'#ddd6ca','#f2ede4');for(let x=x0;x<x1;x+=14)R(x,y+37,.5,PH-37,'rgba(160,150,130,.3)');
  {const cx=(x0+x1)/2,mw=64,my=y+30;R(cx-mw/2-1,my-1,mw+2,1.2,'#ffffff');R(cx-mw/2,my,mw,16,'#1e3420');
   for(let i=0;i<260;i++){const px=cx-mw/2+((i*37)%mw),py=my+((i*13)%16);g.fillStyle=['#2e5430','#467440','#6e9a58','#3a6028'][i%4];g.fillRect(px,py,1.6,1.2);}
   g.fillStyle='rgba(255,255,255,.9)';g.font='bold 3.4px "Helvetica Neue",Arial';g.textAlign='center';g.textBaseline='middle';g.fillText('LA GALERIE BLEUE',cx,my+8);
   for(const dx of [-22,22]){g.fillStyle='#2e4a8a';g.beginPath();g.ellipse(cx+dx,y+PH-6,12,4,0,0,7);g.fill();g.fillStyle='#3a5aa0';g.beginPath();g.ellipse(cx+dx,y+PH-8,12,4,0,0,7);g.fill();g.fillStyle='#fbfaf6';g.fillRect(cx+dx-5,y+PH-14,10,6);g.fillStyle='#4e8a48';g.beginPath();g.ellipse(cx+dx,y+PH-15,6,3,0,0,7);g.fill();}}
  }else if(FV===2){
  /* 2 — LE HALL BLEU : un grand mur bleu profond, le nom en lumière, des suspensions, un sol miroir */
  VG(x0,y,x1-x0,PH*.62,'#1a3a8e','#2a5ac8');
  for(let x=x0;x<x1;x+=12)R(x,y,.5,PH*.62,'rgba(255,255,255,.06)');
  {const cx=(x0+x1)/2;g.save();g.shadowColor='rgba(200,225,255,.9)';g.shadowBlur=6;g.fillStyle='#ffffff';g.font='bold 7px "Helvetica Neue",Arial';g.textAlign='center';g.textBaseline='middle';g.fillText('LA GALERIE BLEUE',cx,y+PH*.3);g.restore();
   R(cx-30,y+PH*.3+6,60,.6,'rgba(255,255,255,.6)');}
  for(let k=0;k<7;k++){const lx=x0+20+k*(x1-x0-40)/6;R(lx-.2,y,.4,10,'#c8c8c8');g.fillStyle='#e8c870';g.beginPath();g.arc(lx,y+11,2.2,Math.PI,0);g.fill();const gr=g.createRadialGradient(lx,y+12,0,lx,y+12,10);gr.addColorStop(0,'rgba(255,236,190,.7)');gr.addColorStop(1,'rgba(255,236,190,0)');g.fillStyle=gr;g.fillRect(lx-10,y+10,20,14);}
  VG(x0,y+PH*.62,x1-x0,PH*.38,'#e8e2d6','#cfc6b6');g.fillStyle='rgba(42,90,200,.22)';g.fillRect(x0,y+PH*.62,x1-x0,PH*.2);
  }else if(FV===3){
  /* 3 — VERRE TEINTÉ : on ne voit pas dedans, le vitrage renvoie le ciel et la place, avec des lueurs chaudes */
  VG(x0,y,x1-x0,PH,'#7a9cb8','#2a3e52');
  for(let k=0;k<5;k++){const lx=x0+30+k*(x1-x0-60)/4;const gr=g.createRadialGradient(lx,y+PH*.55,0,lx,y+PH*.55,22);gr.addColorStop(0,'rgba(255,214,150,.35)');gr.addColorStop(1,'rgba(255,214,150,0)');g.fillStyle=gr;g.fillRect(lx-22,y,44,PH);}
  g.fillStyle='rgba(255,255,255,.35)';for(let k=0;k<4;k++){const bx=x0+k*70;g.beginPath();g.moveTo(bx,y);g.lineTo(bx+16,y);g.lineTo(bx-14,y+PH);g.lineTo(bx-30,y+PH);g.fill();}
  for(let k=0;k<6;k++){const px=x0+20+k*44;g.fillStyle='rgba(200,140,60,.35)';g.beginPath();g.ellipse(px,y+PH*.72,9,5,0,0,7);g.fill();}
  R(x0,y+PH*.82,x1-x0,PH*.18,'rgba(220,210,190,.25)');
  }else{
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
  }
  g.restore();
  if(FV!==2)for(const [px,pw] of PORTES)LUMS.push([px-pw/2,y+1,pw,PH-1]);
  /* les vitrages fixes, leurs montants */
  g.fillStyle='rgba(200,225,232,.16)';g.fillRect(x0+1,y+1,x1-x0-2,PH-1);
  for(let x=x0;x<=x1;x+=16)if(!PORTES.some(([px,pw])=>x>px-pw-1&&x<px+pw+1))R(x-.5,y,1,PH,'#1c2a30');
  R(x0,y,x1-x0,1.2,'#1c2a30');R(x0,y+PH*.48,x1-x0,.8,'rgba(28,42,48,.8)');}

/* ---------- le pied ---------- */
R(0,SOL,W,PIED-SOL,'#d8cfc2');for(let x=0;x<W;x+=20)R(x,SOL,.4,PIED-SOL,'#c4b8a8');R(0,SOL,W,.6,'#f2ebe0');

/* ---------- la nuit ---------- */
if(!JOUR){g.save();g.globalCompositeOperation='multiply';g.fillStyle='rgb(120,120,172)';g.fillRect(0,-12,W,PIED+12);g.restore();
  g.save();g.globalCompositeOperation='lighter';for(const [x,y,w,hh] of LUMS){g.fillStyle='rgba(130,80,30,.6)';g.fillRect(x,y,w,hh);}g.restore();
  /* le hall bleu, allumé : on le voit briller à travers les portes */
  g.save();g.globalCompositeOperation='lighter';g.fillStyle='rgba(30,70,190,.55)';g.fillRect(B0,SOL-PH,B1-B0,PH*.62);g.fillStyle='rgba(120,110,90,.35)';g.fillRect(B0,SOL-PH*.38,B1-B0,PH*.38);g.restore();
  const y=SOL-PH-7;R(B0-4,y,B1-B0+8,7,'#2a62c8');texte('BIENVENUE À LA GALERIE BLEUE',CX,y+3.7,'bold 4.4px "Helvetica Neue",Arial,sans-serif','#ffffff');
  ecrire();}
}
/* les deux entrées coulissantes : leur place dans la façade (x, largeur) */
const PORTE_Y=222-64;                       /* le haut des portes, dans le repère de la façade */
/* les vantaux, dessinés à chaque image par-dessus la façade, s'écartent quand on s'approche */
const OUVERT=PORTES.map(()=>0);
function dessinerLesPortes(g,X0,Y0){
  const dt=Math.min(.05,(performance.now()-(dessinerLesPortes.t||performance.now()))/1000);dessinerLesPortes.t=performance.now();
  PORTES.forEach(([px,pw],i)=>{
    let pres=false;try{const dx=joueur.x-px,dy=joueur.y-236;pres=Math.abs(dx)<pw*1.1&&dy>-40&&dy<72;}catch(x){}
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

/* ---------- LES JARDINIÈRES ---------- */
function feuillageP(g,R,cx,cy,rx,ry,pal,n,seed,t){const [s,m,c,l]=pal;t=t||1;
  for(let i=0;i<n;i++){const a=hA(i,seed,1)*Math.PI*2,r=Math.sqrt(hA(i,seed,2));const x=cx+Math.cos(a)*rx*r,y=cy+Math.sin(a)*ry*r;
    const lum=((cx-x)/rx+(cy-y)/ry)*.5+hA(i,seed,3)*.4;g.fillStyle=lum>.55?l:lum>.15?c:lum>-.3?m:s;
    g.beginPath();g.ellipse(x,y,(1.2+hA(i,seed,4)*1.4)*t,(.9+hA(i,seed,5)*.9)*t,hA(i,seed,6)*3,0,7);g.fill();}}
/* le bac : pierre claire biseautée, terre sombre, ombre portée */
function bacP(g,R,L,s,h){g.fillStyle='rgba(30,26,18,.22)';g.beginPath();g.ellipse(L/2+5,s+1.5,L/2,3.5,0,0,7);g.fill();
  for(let y=s-h;y<s;y+=.5){const k=(y-s+h)/h;R(4,y,L-8,.6,`rgb(${(232-k*34)|0},${(222-k*34)|0},${(202-k*36)|0})`);}
  R(3,s-h-1.5,L-6,2,'#f6f0e4');R(3,s-h+.5,L-6,.6,'#cfc2a8');R(L-6,s-h,2,h,'rgba(80,60,40,.18)');
  for(let x=18;x<L-8;x+=22)R(x,s-h+1,.6,h-1,'rgba(120,100,70,.25)');
  R(5,s-h-2.5,L-10,1.5,'#4a3a2a');}
function tigeP(g,x,y,dx,h,col,w){g.strokeStyle=col;g.lineWidth=w||.5;g.beginPath();g.moveTo(x,y);g.quadraticCurveTo(x+dx*.2,y-h*.6,x+dx,y-h);g.stroke();}

/* 1. LAVANDE DE PROVENCE : coussins gris-vert, épis violets dégradés */
function massif1(){const L=96,HH=46,{c,g,R}=toileA(L,HH),s=HH-4,h=10;bacP(g,R,L,s,h);const t=s-h-2;
  const GV=['#4a5a4a','#6a7a66','#8a9a84','#b0bca8'];
  for(let k=0;k<5;k++){const x=14+k*17;feuillageP(g,R,x,t-3,9,4,GV,90,k+11);
    for(let i=0;i<16;i++){const dx=(hA(i,k,1)-.5)*16,hh=9+hA(i,k,2)*6,x0=x+dx*.4;tigeP(g,x0,t-2,dx*.5,hh,'#7a8a6a',.5);
      const xe=x0+dx*.5,ye=t-2-hh;for(let j=0;j<4;j++){g.fillStyle=['#5a3a8a','#7a52b0','#9a74cc','#b89ae0'][j];g.beginPath();g.ellipse(xe-dx*.02*j,ye+j*1.1,.9,.8,0,0,7);g.fill();}}}
  for(let i=0;i<14;i++)R(10+hA(i,3,9)*(L-20),t-14-hA(i,4,9)*4,.6,.6,'#f4e8a0');/* abeilles / reflets */
  return c;}
/* 2. BUIS TAILLÉS ET ROSIERS BLANCS : boules nettes, roses crème */
function massif2(){const L=96,HH=46,{c,g,R}=toileA(L,HH),s=HH-4,h=10;bacP(g,R,L,s,h);const t=s-h-2;
  const BU=['#1e3a22','#2e5430','#467440','#6e9a58'],RO=['#2a4a2a','#3e643a','#5a8248','#7aa060'];
  for(const x of [16,L-16]){feuillageP(g,R,x,t-8,10,9,BU,260,x);}
  feuillageP(g,R,L/2,t-7,26,7,RO,260,7);
  for(let i=0;i<22;i++){const x=L/2-24+hA(i,2,3)*48,y=t-12+hA(i,3,3)*8;g.fillStyle='#fbf6ea';g.beginPath();g.arc(x,y,1.7,0,7);g.fill();
    g.fillStyle='#ecdcc0';g.beginPath();g.arc(x+.5,y+.5,.9,0,7);g.fill();R(x-.6,y-.8,.6,.6,'#ffffff');}
  return c;}
/* 3. JARDIN SAUVAGE : graminées dorées, échinacées roses, gaura blanche */
function massif3(){const L=96,HH=46,{c,g,R}=toileA(L,HH),s=HH-4,h=10;bacP(g,R,L,s,h);const t=s-h-2;
  feuillageP(g,R,L/2,t-3,42,4,['#3a4a2a','#5a6a3a','#7a8a4a','#9aaa5a'],220,21);
  for(let i=0;i<70;i++){const x=8+hA(i,1,5)*(L-16),dx=(hA(i,2,5)-.5)*10,hh=10+hA(i,3,5)*14;tigeP(g,x,t,dx,hh,i%2?'#c8b070':'#a89a58',.5);
    if(i%3===0){g.fillStyle='#e8d498';g.beginPath();g.ellipse(x+dx,t-hh,.8,2.2,dx*.08,0,7);g.fill();}}
  for(let i=0;i<12;i++){const x=12+hA(i,4,5)*(L-24),y=t-12-hA(i,5,5)*6;tigeP(g,x,t,0,t-y,'#5a7a40',.6);
    for(let a=0;a<6;a++){g.fillStyle='#d06a98';g.beginPath();g.ellipse(x+Math.cos(a)*1.6,y+Math.sin(a)*.8,1.1,.6,a,0,7);g.fill();}R(x-.8,y-.8,1.6,1.6,'#8a4a1a');}
  for(let i=0;i<26;i++)R(8+hA(i,6,5)*(L-16),t-8-hA(i,7,5)*12,.9,.9,'#fbf6ee');
  return c;}
/* 4. MÉDITERRANÉEN : agapanthes bleues, romarin, sauge, petite boule d'olivier */
function massif4(){const L=96,HH=46,{c,g,R}=toileA(L,HH),s=HH-4,h=10;bacP(g,R,L,s,h);const t=s-h-2;
  feuillageP(g,R,L/2,t-3,42,4,['#2e4a3a','#46644e','#647e62','#8aa082'],240,41);
  for(const x of [20,48,76]){for(let i=0;i<10;i++){const dx=(hA(i,x,1)-.5)*14;tigeP(g,x,t,dx,6,'#3e6a3a',.9);}
    tigeP(g,x,t,1,18,'#5a8a4a',.6);const cy=t-20;for(let i=0;i<26;i++){const a=hA(i,x,2)*7,r=Math.sqrt(hA(i,x,3))*5;g.fillStyle=['#3a5ab0','#5a7ad0','#8aa4ea'][i%3];g.beginPath();g.ellipse(x+1+Math.cos(a)*r,cy+Math.sin(a)*r*.8,1,.7,a,0,7);g.fill();}}
  for(const x of [34,62]){feuillageP(g,R,x,t-6,7,6,['#4a5a52','#6a7a72','#8a9a90','#b0c0b4'],90,x);for(let i=0;i<6;i++)R(x-5+hA(i,x,8)*10,t-10+hA(i,x,9)*6,.7,.7,'#9a8ad8');}
  return c;}
/* 5. AUTOMNE : graminées rousses, asters mauves, sédums cuivrés, érable nain */
function massif5(){const L=96,HH=46,{c,g,R}=toileA(L,HH),s=HH-4,h=10;bacP(g,R,L,s,h);const t=s-h-2;
  feuillageP(g,R,L/2,t-3,42,4,['#4a3a1e','#6a5a2a','#8a7a3a','#aa9a4a'],220,51);
  for(let i=0;i<50;i++){const x=8+hA(i,1,6)*(L-16),dx=(hA(i,2,6)-.5)*12,hh=8+hA(i,3,6)*12;tigeP(g,x,t,dx,hh,['#c08a40','#a86a30','#d8b060'][i%3],.6);}
  feuillageP(g,R,L/2,t-12,12,10,['#6a1e14','#9a2e1a','#c8482a','#e8784a'],240,52);
  for(const x of [18,L-18]){feuillageP(g,R,x,t-5,9,5,['#6a2a1a','#8a3e20','#b0582a','#d07a3a'],120,x);}
  for(let i=0;i<30;i++){const x=10+hA(i,4,6)*(L-20);if(Math.abs(x-L/2)<12)continue;const y=t-6-hA(i,5,6)*6;g.fillStyle=i%2?'#9a7ac8':'#b89ae0';g.beginPath();g.arc(x,y,1.1,0,7);g.fill();R(x-.3,y-.3,.6,.6,'#f0c040');}
  return c;}

const MASSIFS=[massif1,massif3,massif4,massif5];
function graverMassifBeau(v){const c=MASSIFS[(v||0)%4]();return {toile:c,W:96,H:46,sol:42};}

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

/* ---------- LA PLACE RONDE : haie de buis, graminées, banc circulaire, fontaine ---------- */
const PLACE=(()=>{
function mixH(a,b,t){const p=s=>[1,3,5].map(i=>parseInt(s.slice(i,i+2),16));const A=p(a),B=p(b);return 'rgb('+A.map((v,i)=>Math.round(v+(B[i]-v)*t)).join(',')+')';}
/* un anneau de pavés en éventail, ellipse parfaite */
function anneaux(g,cx,cy,RX,RY,n,cols,joint,seed){
  for(let i=0;i<n;i++){const r0=1-i/n,r1=1-(i+1)/n;if(r1<0)break;const ns=Math.max(8,Math.round((12+ r0*60)/2)*2);
    for(let k=0;k<ns;k++){const a0=k/ns*Math.PI*2+(i%2)*Math.PI/ns,a1=a0+Math.PI*2/ns;g.beginPath();g.ellipse(cx,cy,RX*r0,RY*r0,0,a0,a1);g.ellipse(cx,cy,Math.max(.1,RX*r1),Math.max(.1,RY*r1),0,a1,a0,true);g.closePath();
      g.fillStyle=cols[(k+i+((hA(k,i,seed)*3)|0))%cols.length];g.fill();g.strokeStyle=joint;g.lineWidth=.35;g.stroke();}}}
function bord(g,cx,cy,RX,RY,w,c,cl){g.beginPath();g.ellipse(cx,cy,RX,RY,0,0,Math.PI*2);g.closePath();g.moveTo(cx+RX-w,cy);g.ellipse(cx,cy,RX-w,RY-w*RY/RX,0,0,Math.PI*2);g.closePath();g.fillStyle=c;g.fill('evenodd');
  g.strokeStyle=cl;g.lineWidth=.6;g.beginPath();g.ellipse(cx,cy,RX-w,RY-w*RY/RX,0,Math.PI*1.05,Math.PI*1.95);g.stroke();}
/* un bassin rond vu de trois-quarts : paroi, margelle, eau */
function bassin(g,cx,cy,rx,ry,hw,pierre,eau,t){
  g.fillStyle='rgba(40,30,20,.22)';g.beginPath();g.ellipse(cx+6,cy+hw+2,rx+4,ry+3,0,0,7);g.fill();
  const gr=g.createLinearGradient(cx-rx,0,cx+rx,0);gr.addColorStop(0,pierre[2]);gr.addColorStop(.3,pierre[0]);gr.addColorStop(.75,pierre[1]);gr.addColorStop(1,pierre[2]);
  g.fillStyle=gr;g.beginPath();g.ellipse(cx,cy+hw,rx,ry,0,0,Math.PI);g.lineTo(cx-rx,cy);g.ellipse(cx,cy,rx,ry,0,Math.PI,0,true);g.fill();
  g.fillStyle='rgba(255,255,255,.18)';g.fillRect(cx-rx,cy+hw*.15,rx*2,.6);
  g.fillStyle=pierre[3];g.beginPath();g.ellipse(cx,cy,rx,ry,0,0,7);g.fill();
  const ri=rx-3.5,rj=ry-3.5*ry/rx;
  const ge=g.createLinearGradient(0,cy-rj,0,cy+rj);ge.addColorStop(0,eau[0]);ge.addColorStop(.5,eau[1]);ge.addColorStop(1,eau[2]);
  g.fillStyle=ge;g.beginPath();g.ellipse(cx,cy,ri,rj,0,0,7);g.fill();
  g.save();g.beginPath();g.ellipse(cx,cy,ri,rj,0,0,7);g.clip();g.fillStyle='rgba(0,20,40,.25)';g.beginPath();g.ellipse(cx,cy-rj*.55,ri*1.02,rj*.75,0,Math.PI,0);g.ellipse(cx,cy-rj*.35,ri*1.02,rj*.62,0,0,Math.PI,true);g.fill();
  g.strokeStyle='rgba(255,255,255,.35)';g.lineWidth=.5;for(let i=1;i<4;i++){g.beginPath();g.ellipse(cx,cy+1,ri*i/4.5,rj*i/4.5,0,Math.PI*1.1,Math.PI*1.6);g.stroke();}
  for(let i=0;i<30;i++){g.fillStyle='rgba(255,255,255,.5)';g.fillRect(cx-ri+hA(i,t,1)*ri*2,cy-rj*.2+hA(i,t,2)*rj,1.2,.4);}g.restore();
  g.strokeStyle=pierre[4];g.lineWidth=.5;g.beginPath();g.ellipse(cx,cy,rx,ry,0,Math.PI*1.05,Math.PI*1.9);g.stroke();}
function colonne(g,x,y0,y1,w,c){const gr=g.createLinearGradient(x-w/2,0,x+w/2,0);gr.addColorStop(0,c[0]);gr.addColorStop(.35,c[1]);gr.addColorStop(1,c[2]);g.fillStyle=gr;g.fillRect(x-w/2,y1,w,y0-y1);
  g.fillStyle=c[1];g.beginPath();g.ellipse(x,y1,w/2,w/5,0,0,7);g.fill();}
function vasque(g,x,y,rx,ry,dp,P,E){const gr=g.createLinearGradient(x-rx,0,x+rx,0);gr.addColorStop(0,P[2]);gr.addColorStop(.3,P[0]);gr.addColorStop(1,P[2]);
  g.fillStyle=gr;g.beginPath();g.moveTo(x-rx,y);g.bezierCurveTo(x-rx*.8,y+dp,x+rx*.8,y+dp,x+rx,y);g.fill();
  g.fillStyle=P[3];g.beginPath();g.ellipse(x,y,rx,ry,0,0,7);g.fill();g.fillStyle=E;g.beginPath();g.ellipse(x,y+.2,rx-1.6,ry-1,0,0,7);g.fill();
  g.fillStyle='rgba(255,255,255,.4)';g.beginPath();g.ellipse(x-rx*.3,y-.2,rx*.3,ry*.3,0,0,7);g.fill();}
/* nappe d'eau qui retombe d'une vasque */
function nappe(g,x,y,rx,ry,h,a){for(let i=0;i<26;i++){const t=i/25,ang=Math.PI*(.05+.9*t);const px=x+Math.cos(ang)*rx,py=y+Math.sin(ang)*ry;
  g.strokeStyle=`rgba(${200+((i*7)%40)},235,255,${a})`;g.lineWidth=.8;g.beginPath();g.moveTo(px,py);g.quadraticCurveTo(px+Math.cos(ang)*3,py+h*.3,px+Math.cos(ang)*4,py+h);g.stroke();}}
function jet(g,x,y,h,a){for(let i=-2;i<=2;i++){g.strokeStyle=`rgba(225,245,255,${a-Math.abs(i)*.1})`;g.lineWidth=1-Math.abs(i)*.15;g.beginPath();g.moveTo(x+i*.4,y);g.lineTo(x+i*.8,y-h);g.stroke();}
  for(let i=0;i<14;i++){g.fillStyle='rgba(235,250,255,.7)';g.fillRect(x-4+hA(i,x|0,9)*8,y-h-2+hA(i,y|0,9)*6,.7,.7);}}
function arc(g,x0,y0,x1,y1,hh,a){g.strokeStyle=`rgba(220,242,255,${a})`;g.lineWidth=.9;g.beginPath();g.moveTo(x0,y0);g.quadraticCurveTo((x0+x1)/2,Math.min(y0,y1)-hh,x1,y1);g.stroke();
  g.fillStyle='rgba(240,250,255,.6)';for(let i=0;i<4;i++)g.fillRect(x1-1+hA(i,x0|0,3)*2,y1-1+hA(i,y0|0,3)*2,.7,.7);}
const PIERRE=['#f2ead8','#d8ccb2','#b4a68a','#faf4e6','#9a8c72'], EAU=['#3a7ea8','#4a9cc4','#7ac0dc'];

function fe(g,cx,cy,rx,ry,pal,n,seed,t){t=t||1;for(let i=0;i<n;i++){const a=hA(i,seed,1)*Math.PI*2,r=Math.sqrt(hA(i,seed,2));const x=cx+Math.cos(a)*rx*r,y=cy+Math.sin(a)*ry*r;
  const lum=((cx-x)/rx+(cy-y)/ry)*.5+hA(i,seed,3)*.4;g.fillStyle=lum>.55?pal[3]:lum>.15?pal[2]:lum>-.3?pal[1]:pal[0];
  g.beginPath();g.ellipse(x,y,(1+hA(i,seed,4)*1.2)*t,(.8+hA(i,seed,5)*.7)*t,hA(i,seed,6)*3,0,7);g.fill();}}
const GRIS=['#46564a','#62725e','#84947c','#aab8a2'],BUIS=['#1a3420','#28482a','#3e6638','#5e8a4c'],VERT=['#2a4a2a','#3e643a','#5a8248','#7aa060'];
const ombreT=(g,x,y,r)=>{g.fillStyle='rgba(30,26,18,.22)';g.beginPath();g.ellipse(x+2,y+1,r,r*.4,0,0,7);g.fill();};
const T={
 buis:(g,x,y,i)=>{ombreT(g,x,y,5);fe(g,x,y-3.5,5,4,BUIS,50,i);},
 herbe:(g,x,y,i)=>{for(let k=0;k<9;k++){const dx=(hA(k,i,5)-.5)*9,hh=6+hA(k,i,6)*7;g.strokeStyle=k%2?'#c8b070':'#a89a58';g.lineWidth=.45;g.beginPath();g.moveTo(x,y);g.quadraticCurveTo(x+dx*.2,y-hh*.6,x+dx,y-hh);g.stroke();if(k%3==0){g.fillStyle='#ecdca4';g.beginPath();g.ellipse(x+dx,y-hh,.6,1.6,dx*.1,0,7);g.fill();}}},
 blanc:(g,x,y,i)=>{fe(g,x,y-2,4,2.4,VERT,20,i);for(let k=0;k<5;k++){g.fillStyle='#fdfaf2';g.beginPath();g.arc(x-3+hA(k,i,2)*6,y-4+hA(k,i,3)*3,.9,0,7);g.fill();}},
};

const CX=400, CY=582, NSEG=16;
const PORTES_A=[0,Math.PI/2,Math.PI,-Math.PI/2];
const dansPorte=(a,l)=>PORTES_A.some(p=>{let d=Math.abs(a-p);if(d>Math.PI)d=2*Math.PI-d;return d<(l||.30);});   /* .30 : là où rien ne pousse ; on passe à .22 */
/* toutes les plantes, en coordonnées du monde : la haie de buis autour, l'anneau de graminées autour du banc */
const PLANTES=(()=>{const L=[];
  for(let i=0;i<520;i++){const a=hA(i,77,1)*Math.PI*2,r=Math.sqrt(hA(i,77,2)*(1-(166/178)**2)+(166/178)**2);if(dansPorte(Math.atan2(Math.sin(a),Math.cos(a))))continue;L.push({x:CX+Math.cos(a)*178*r,y:CY+Math.sin(a)*112*r,i,f:'buis',a});}
  for(let i=0;i<260;i++){const a=hA(i,2,1)*Math.PI*2,r=.82+Math.sqrt(hA(i,2,2))*.18;if(dansPorte(Math.atan2(Math.sin(a),Math.cos(a))))continue;
    const f=r>.93?'buis':(i%3?'herbe':'blanc');L.push({x:CX+Math.cos(a)*106*r,y:CY+Math.sin(a)*64*r,i:i+1000,f,a});}
  for(const p of L){let a=Math.atan2(p.y-CY,p.x-CX);p.seg=((((a+Math.PI)/(2*Math.PI))*NSEG)|0)%NSEG+(p.i>=1000?NSEG:0);}
  return L;})();
function segments(){const S={};for(const p of PLANTES)(S[p.seg]=S[p.seg]||[]).push(p);
  return Object.keys(S).map(k=>{const L=S[k];let x0=1e9,x1=-1e9,y1=-1e9;for(const p of L){x0=Math.min(x0,p.x);x1=Math.max(x1,p.x);y1=Math.max(y1,p.y);}return {v:+k,x:Math.round((x0+x1)/2),y:Math.ceil(y1)};});}
const SEGS=segments();
function graverSegment(v){const L=PLANTES.filter(p=>p.seg===v).sort((a,b)=>a.y-b.y),sg=SEGS.find(s=>s.v===v);if(!L.length)return {toile:document.createElement('canvas'),W:1,H:1,sol:0};
  let dx=0,dy=0;for(const p of L){dx=Math.max(dx,Math.abs(p.x-sg.x));dy=Math.max(dy,sg.y-p.y);}
  const Wd=Math.ceil(dx*2+24),sol=Math.ceil(dy+20),Hd=sol+6,D=2,c=document.createElement('canvas');c.width=Wd*D;c.height=Hd*D;const g=c.getContext('2d');g.setTransform(D,0,0,D,0,0);
  for(const p of L)T[p.f](g,p.x-sg.x+Wd/2,p.y-sg.y+sol,p.i);return {toile:c,W:Wd,H:Hd,sol};}
/* le sol de la place, peint au demi-pixel par-dessus le sol ordinaire */
function solFin(SOL){const c=document.createElement('canvas');c.width=SOL.width*2;c.height=SOL.height*2;const g=c.getContext('2d');g.imageSmoothingEnabled=false;g.drawImage(SOL,0,0,c.width,c.height);
  g.imageSmoothingEnabled=true;g.setTransform(2,0,0,2,0,0);const cx=CX,cy=CY;
  anneaux(g,cx,cy,160,100,9,['#e6dac2','#dccfb4','#e0d3b8'],'rgba(140,120,90,.4)',4);bord(g,cx,cy,160,100,5,'#bfa982','#e8dcc4');
  const terre=(a0,b0,a1,b1)=>{g.fillStyle='#5a4a36';g.beginPath();g.ellipse(cx,cy,a1,b1,0,0,Math.PI*2);g.closePath();g.moveTo(cx+a0,cy);g.ellipse(cx,cy,a0,b0,0,0,Math.PI*2);g.closePath();g.fill('evenodd');};
  terre(166,104,178,112);terre(84,50,106,64);
  /* les quatre passages dans la haie et dans l'anneau, dallés */
  g.save();g.beginPath();g.ellipse(cx,cy,180,114,0,0,Math.PI*2);g.closePath();g.moveTo(cx+160,cy);g.ellipse(cx,cy,160,100,0,0,Math.PI*2);g.closePath();g.moveTo(cx+108,cy);g.ellipse(cx,cy,108,66,0,0,Math.PI*2);g.closePath();g.moveTo(cx+84,cy);g.ellipse(cx,cy,84,50,0,0,Math.PI*2);g.closePath();g.clip('evenodd');
  for(const a of PORTES_A){g.fillStyle='#ddd0b6';g.beginPath();g.moveTo(cx,cy);g.ellipse(cx,cy,190,120,0,a-.30,a+.30);g.closePath();g.fill();}g.restore();
  for(const a of PORTES_A){g.strokeStyle='rgba(140,120,90,.4)';g.lineWidth=.35;for(let r=.45;r<1.06;r+=.06){g.beginPath();g.ellipse(cx,cy,178*r,112*r,0,a-.30,a+.30);g.stroke();}}
  bord(g,cx,cy,84,50,7,'#e8dcc4','#fbf4e4');g.strokeStyle='#a8987a';g.lineWidth=.6;g.beginPath();g.ellipse(cx,cy,77,45.8,0,0,7);g.stroke();
  anneaux(g,cx,cy,77,45.8,4,['#e6dac2','#dccfb4','#e0d3b8'],'rgba(140,120,90,.4)',9);
  return c;}
/* la fontaine : bassin, fût, vasque ; l'eau scintille */
const FY=CY+18, BY=CY-4;
let TF=null;
function graverFontaine(){if(TF)return TF;const Wd=130,Hd=118,sol=100,D=2,c=document.createElement('canvas');c.width=Wd*D;c.height=Hd*D;const g=c.getContext('2d');g.setTransform(D,0,0,D,0,0);
  const cx=Wd/2,by=sol-(FY-BY);bassin(g,cx,by,54,24,8,PIERRE,EAU,5);colonne(g,cx,by,by-24,10,['#b4a68a','#f2ead8','#a89a7e']);
  vasque(g,cx,by-24,18,6,8,PIERRE,'#5aa8d0');nappe(g,cx,by-24,18,6,22,.5);
  for(let k=0;k<4;k++){const a=k*Math.PI/2+Math.PI/4,x=cx+Math.cos(a)*50,y=by+Math.sin(a)*22;arc(g,x,y,cx+Math.cos(a)*16,by-2+Math.sin(a)*7,12,.7);}jet(g,cx,by-26,12,.8);
  TF={toile:c,W:Wd,H:Hd,sol};return TF;}
function dessinerFontaine(g,o,x,y){const t=graverFontaine();const X0=x-t.W/2,Y0=y-t.sol;g.drawImage(t.toile,X0,Y0,t.W,t.H);
  /* la nuit : la pierre passe au bleu sombre, l'eau s'éclaire par en dessous */
  {const k=nuitDecor();if(k>.02){g.globalAlpha=k;g.drawImage(versionNuit(t),X0,Y0,t.W,t.H);g.globalAlpha=1;
    const wy=Y0+t.sol-(FY-BY);g.save();g.globalCompositeOperation='lighter';
    const gr=g.createRadialGradient(x,wy,2,x,wy,54);gr.addColorStop(0,'rgba(80,230,240,'+(.42*k)+')');gr.addColorStop(.7,'rgba(40,160,210,'+(.22*k)+')');gr.addColorStop(1,'rgba(40,160,210,0)');
    g.fillStyle=gr;g.beginPath();g.ellipse(x,wy,52,22,0,0,Math.PI*2);g.fill();
    g.fillStyle='rgba(120,240,250,'+(.35*k)+')';g.beginPath();g.ellipse(x,wy-24,16,5,0,0,Math.PI*2);g.fill();g.restore();}}
  const cx=x,by=Y0+t.sol-(FY-BY),ph=Date.now()/90;
  for(let i=0;i<18;i++){const k=(ph+i*7.3)%18/18,a=Math.PI*(.08+.84*((i*.37)%1));g.fillStyle='rgba(240,250,255,'+(.8-k*.6)+')';
    g.fillRect(cx+Math.cos(a)*(18+k*3),by-24+Math.sin(a)*6+k*20,.8,.8);}
  for(let i=0;i<8;i++){const k=(ph*.7+i*2.1)%8/8;g.fillStyle='rgba(240,250,255,'+(.9-k*.8)+')';g.fillRect(cx-3+((i*5)%7),by-38-k*3+((i*3)%4),.7,.7);}
  g.strokeStyle='rgba(255,255,255,.35)';g.lineWidth=.5;for(let i=0;i<3;i++){const k=((ph*.05+i/3)%1);g.beginPath();g.ellipse(cx,by,18+k*30,6+k*13,0,0,Math.PI*2);g.globalAlpha=1-k;g.stroke();g.globalAlpha=1;}}
function bloquePlace(x,y){const ex=(x-CX),ey=(y-CY),a=Math.atan2(ey/112,ex/178);
  const r1=Math.hypot(ex/178,ey/112);if(r1<1.01&&r1>.925&&!dansPorte(a,.22))return true;
  const a2=Math.atan2(ey/64,ex/106),r2=Math.hypot(ex/106,ey/64);if(r2<1.02&&r2>.76&&!dansPorte(a2,.22))return true;
  if(Math.hypot((x-CX)/60,(y-BY-6)/37)<1)return true;   /* le bassin, avec sa margelle de devant */return false;}
return {solFin,graverSegment,graverFontaine,dessinerFontaine,bloquePlace,SEGS,FY,CX};
})();

/* ---------- LE KIOSQUE À JOURNAUX (bleu marine, store bordeaux) ---------- */
const KIOSQUE=(()=>{
const lin=(g,x0,y0,x1,y1,st)=>{const gr=g.createLinearGradient(x0,y0,x1,y1);st.forEach(([o,c])=>gr.addColorStop(o,c));return gr;};
const R=(g,x,y,w,h,c)=>{g.fillStyle=c;g.fillRect(x,y,w,h);};
const COUV=[['#c8302a','#f6e8c8'],['#1f4fa8','#ffd84a'],['#f2c230','#1a1a1a'],['#2a8a5a','#ffffff'],['#e8702a','#ffffff'],['#7a3ab8','#ffe0f0'],['#f4f0e6','#c8302a'],['#1a1a22','#f0cf7d'],['#e8487a','#ffffff'],['#2ab0c8','#ffffff']];
/* une couverture de magazine : fond, titre, visage ou photo, accroches */
function couv(g,x,y,w,h,k){const [f,t]=COUV[k%COUV.length];
  R(g,x+.5,y+.5,w,h,'rgba(0,0,0,.28)');R(g,x,y,w,h,f);
  R(g,x+.8,y+.8,w-1.6,h*.2,t);R(g,x+1.2,y+1.2,w*.55,h*.08,f);           /* le titre en réserve */
  if(k%3===0){g.fillStyle='#e0b896';g.beginPath();g.ellipse(x+w*.55,y+h*.6,w*.24,h*.2,0,0,7);g.fill();R(g,x+w*.3,y+h*.78,w*.5,h*.22,t);} /* un visage */
  else if(k%3===1){R(g,x+1,y+h*.3,w-2,h*.42,'rgba(255,255,255,.35)');R(g,x+1,y+h*.55,w-2,h*.17,'rgba(0,0,0,.18)');}                  /* une photo */
  R(g,x+1,y+h*.8,w*.5,.7,t);R(g,x+1,y+h*.88,w*.35,.7,t);
  R(g,x,y,w,.6,'rgba(255,255,255,.35)');}
/* un quotidien plié : manchette, gros titre, colonnes */
function quotidien(g,x,y,w,h,rouge){R(g,x+.5,y+.6,w,h,'rgba(0,0,0,.25)');R(g,x,y,w,h,'#f4f0e4');
  R(g,x+1,y+1,w-2,h*.16,rouge?'#c8302a':'#1a1a1a');R(g,x+1,y+h*.24,w-2,h*.1,'#1a1a1a');
  R(g,x+1,y+h*.4,w*.45,h*.32,'#9a9a9a');for(let i=0;i<5;i++)R(g,x+w*.52,y+h*.4+i*h*.07,w*.42,.5,'#7a7a7a');
  for(let i=0;i<3;i++)R(g,x+1,y+h*.78+i*h*.07,w-2,.5,'#7a7a7a');}
/* une pile de journaux sur le comptoir */
function pile(g,x,y,w,n){for(let i=0;i<n;i++){R(g,x,y-i*1.1,w,1.1,i%2?'#ebe6d8':'#f6f2e6');}R(g,x,y-n*1.1,w,.6,'#1a1a1a');R(g,x+1,y-n*1.1+1,w*.6,.5,'#c8302a');}
/* le vendeur, derrière le comptoir */
function vendeur(g,x,y){R(g,x-7,y-12,14,12,'#3a4a6a');R(g,x-1,y-12,2,5,'#f2efe6');g.fillStyle='#e0b088';g.fillRect(x-4.5,y-22,9,10);R(g,x-5,y-24,10,4,'#5a4030');R(g,x-6,y-24,12,1.6,'#2a2a30');R(g,x-5,y-27,10,3.4,'#2a2a30');/* casquette */
  R(g,x-3,y-18,1.4,1,'#2a1a10');R(g,x+1.6,y-18,1.4,1,'#2a1a10');R(g,x-2,y-14.6,4,.8,'#a86a50');}
function ombre(g,cx,y,rx){g.fillStyle=lin(g,0,y-4,0,y+6,[[0,'rgba(30,26,20,.32)'],[1,'rgba(30,26,20,.12)']]);g.beginPath();g.ellipse(cx+3,y+1.5,rx,6,0,0,7);g.fill();}

/* LE KIOSQUE À JOURNAUX, vu de trois-quarts : face, deux pans coupés, coupole */
function kiosque(g,cx,sol,P){
  const L=84,F=56,x0=cx-L/2,x1=cx+L/2,fx0=cx-F/2,fx1=cx+F/2,HB=60,yh=sol-HB;
  ombre(g,cx,sol,52);
  /* le socle de pierre */
  g.fillStyle=lin(g,0,sol-6,0,sol,[[0,'#bdb4a4'],[1,'#8a8274']]);g.beginPath();g.moveTo(x0-2,sol-6);g.lineTo(x1+2,sol-6);g.lineTo(x1+1,sol);g.lineTo(x0-1,sol);g.fill();R(g,x0-2,sol-6.5,L+4,1,'#d8d0c0');
  /* les pans coupés, gauche et droit, plus sombres, couverts de magazines */
  const pan=(xa,xb,sombre)=>{g.fillStyle=lin(g,xa,0,xb,0,sombre?[[0,P.c2],[1,P.c1]]:[[0,P.c1],[1,P.c2]]);g.fillRect(xa,yh,xb-xa,HB-6);
    for(let r=0;r<4;r++)for(let c=0;c<2;c++)couv(g,xa+1.6+c*6.4,yh+5+r*12.4,5.6,10.6,(r*2+c+(sombre?3:0))*3+1);
    R(g,xa,yh,xb-xa,1.2,P.or);R(g,sombre?xa:xb-1,yh,1,HB-6,'rgba(0,0,0,.35)');};
  pan(x0,fx0,false);pan(fx1,x1,true);
  /* la face : panneaux pleins en bas, fenêtre ouverte au milieu */
  g.fillStyle=lin(g,fx0,0,fx1,0,[[0,P.c1],[.35,P.c0],[1,P.c1]]);g.fillRect(fx0,yh,F,HB-6);
  for(const px of [fx0+2,fx1-2])R(g,px-.7,yh,1.4,HB-6,P.or);
  /* le soubassement à panneaux moulurés */
  for(let k=0;k<3;k++){const px=fx0+4+k*(F-8)/3;g.strokeStyle='rgba(0,0,0,.3)';g.lineWidth=.6;g.strokeRect(px+1,sol-20,(F-8)/3-2,11);g.strokeStyle='rgba(255,255,255,.18)';g.strokeRect(px+1.6,sol-19.4,(F-8)/3-3.2,9.8);}
  /* la fenêtre : intérieur chaud, vendeur, étagères de magazines au fond */
  const wy0=yh+12,wy1=sol-24;g.fillStyle=lin(g,0,wy0,0,wy1,[[0,'#3a2a1c'],[1,'#5a3e26']]);g.fillRect(fx0+5,wy0,F-10,wy1-wy0);
  for(let c=0;c<7;c++)couv(g,fx0+6.5+c*6.3,wy0+1.5,5.2,8,c*2+5);
  g.fillStyle='rgba(255,210,140,.25)';g.fillRect(fx0+5,wy0,F-10,wy1-wy0);
  vendeur(g,cx+6,wy1);
  /* le comptoir de bois, et les piles du jour */
  g.fillStyle=lin(g,0,wy1,0,wy1+5,[[0,'#a8784a'],[1,'#6a4a2a']]);g.fillRect(fx0+2,wy1,F-4,5);R(g,fx0+2,wy1,F-4,1,'#d0a070');
  pile(g,fx0+6,wy1,11,5);pile(g,fx0+19,wy1,11,3);pile(g,cx+14,wy1,10,4);
  /* les quotidiens suspendus à la ficelle, pinces à linge */
  g.strokeStyle='#e8e0cc';g.lineWidth=.4;g.beginPath();g.moveTo(fx0+5,wy0+12);g.quadraticCurveTo(cx,wy0+14,fx1-5,wy0+12);g.stroke();
  for(let i=0;i<4;i++){const qx=fx0+7+i*11.2;quotidien(g,qx,wy0+12.6+Math.sin(i/3*Math.PI)*1.4,9,12,i%2===0);R(g,qx+3.6,wy0+11.6+Math.sin(i/3*Math.PI)*1.4,1.6,2.4,'#c8a060');}
  /* le store qui déborde au-dessus de la fenêtre */
  const sy=wy0-1;for(let i=0;i<8;i++){const a=fx0+1+i*(F-2)/8,b=a+(F-2)/8;g.fillStyle=i%2?P.s1:P.s0;g.beginPath();g.moveTo(a+1,sy-4);g.lineTo(b+1,sy-4);g.lineTo(b,sy+3);g.lineTo(a,sy+3);g.fill();
    g.beginPath();g.arc((a+b)/2,sy+3,(b-a)/2,0,Math.PI);g.fill();}
  R(g,fx0+1,sy-4.6,F-1,1.2,'rgba(0,0,0,.3)');g.fillStyle='rgba(0,0,0,.15)';g.fillRect(fx0+5,sy+5,F-10,3);
  /* la corniche et l'enseigne */
  g.fillStyle=lin(g,0,yh-12,0,yh,[[0,P.c1],[1,P.c2]]);g.beginPath();g.moveTo(x0-4,yh-12);g.lineTo(x1+4,yh-12);g.lineTo(x1+1,yh);g.lineTo(x0-1,yh);g.fill();
  R(g,x0-4,yh-12.6,L+8,1.4,P.or);R(g,x0-1,yh-1.2,L+2,1.2,P.or);
  g.fillStyle=P.or;g.font='bold 8.4px Georgia,"Liberation Serif",serif';g.textAlign='center';g.textBaseline='middle';g.fillText(P.mot,cx,yh-5.8);
  g.fillStyle='rgba(255,255,255,.35)';g.fillText(P.mot,cx-.3,yh-6.2);g.fillStyle=P.or;g.fillText(P.mot,cx,yh-5.8);
  /* la coupole : profil bombé, côtes, puis sa face supérieure en ellipse */
  const dy=yh-12, top=dy-28;
  g.fillStyle=lin(g,x0,0,x1,0,[[0,P.c2],[.3,P.c0],[.55,P.c1],[1,P.c2]]);
  g.beginPath();g.moveTo(x0-4,dy);g.bezierCurveTo(x0-2,dy-16,cx-18,top,cx,top);g.bezierCurveTo(cx+18,top,x1+2,dy-16,x1+4,dy);g.closePath();g.fill();
  g.save();g.clip();for(let i=-6;i<=6;i++){const bx=cx+i*7.4;g.strokeStyle='rgba(0,0,0,.25)';g.lineWidth=.7;g.beginPath();g.moveTo(cx+i*1.2,top);g.quadraticCurveTo(bx,dy-14,cx+i*7.6,dy);g.stroke();
    g.strokeStyle='rgba(255,255,255,.12)';g.beginPath();g.moveTo(cx+i*1.2+.8,top);g.quadraticCurveTo(bx+.8,dy-14,cx+i*7.6+.8,dy);g.stroke();}
  for(let r=1;r<4;r++){g.strokeStyle='rgba(0,0,0,.18)';g.lineWidth=.5;g.beginPath();g.ellipse(cx,dy-r*7,(L/2+4)*(1-r*.2),3,0,0,Math.PI);g.stroke();}
  g.restore();
  /* la frise dentelée au bas de la coupole */
  for(let i=0;i<22;i++){const px=x0-3+i*(L+6)/22;g.fillStyle=P.or;g.beginPath();g.moveTo(px,dy);g.lineTo(px+(L+6)/44,dy+2.4);g.lineTo(px+(L+6)/22,dy);g.fill();}
  /* le lanternon et son épi */
  g.fillStyle=lin(g,cx-5,0,cx+5,0,[[0,P.c2],[.4,P.c0],[1,P.c2]]);g.fillRect(cx-5,top-8,10,8);R(g,cx-6,top-9,12,1.4,P.or);R(g,cx-6,top-.6,12,1,P.or);
  R(g,cx-3,top-6.4,2,4,'rgba(255,220,140,.7)');R(g,cx+1,top-6.4,2,4,'rgba(255,220,140,.7)');
  g.fillStyle=P.c1;g.beginPath();g.moveTo(cx-6,top-9);g.quadraticCurveTo(cx,top-17,cx+6,top-9);g.fill();
  R(g,cx-.6,top-22,1.2,7,P.or);g.fillStyle=P.or;g.beginPath();g.arc(cx,top-22.5,1.8,0,7);g.fill();g.beginPath();g.moveTo(cx-2.4,top-17);g.lineTo(cx,top-19);g.lineTo(cx+2.4,top-17);g.fill();
  /* le chevalet : l'édition du jour */
  const cxv=x1+16;g.fillStyle='rgba(30,26,20,.25)';g.beginPath();g.ellipse(cxv+2,sol+1,10,2.4,0,0,7);g.fill();
  R(g,cxv-1,sol-30,1.4,30,'#3a2a1c');R(g,cxv+12-1,sol-30,1.4,30,'#3a2a1c');
  R(g,cxv-2,sol-32,16,24,'#2a2a2e');R(g,cxv-1,sol-31,14,22,'#f4f0e4');
  g.fillStyle='#1a1a1a';g.font='bold 2.6px Georgia,serif';g.textAlign='center';g.fillText('LE PETIT',cxv+6,sol-27.6);g.fillText('DOCKER',cxv+6,sol-24.8);
  R(g,cxv,sol-22.6,12,.6,'#1a1a1a');g.fillStyle='#c8302a';g.font='bold 2.6px Arial';g.fillText('NOUVEAU !',cxv+6,sol-19.4);
  R(g,cxv+1,sol-17,10,5,'#9a9a9a');for(let i=0;i<2;i++)R(g,cxv+1,sol-11+i*1.5,10,.5,'#7a7a7a');
  /* le présentoir tournant de cartes postales, à gauche */
  const px=x0-12;g.fillStyle='rgba(30,26,20,.25)';g.beginPath();g.ellipse(px+2,sol+1,7,2,0,0,7);g.fill();R(g,px-.6,sol-34,1.2,34,'#5a5e64');
  for(let r=0;r<4;r++){R(g,px-6,sol-34+r*7,12,6,'#e8e4dc');for(let c=0;c<3;c++)R(g,px-5.4+c*3.8,sol-33.4+r*7,3.2,4.8,['#4a9ad0','#e8c040','#e86a3a','#3a9a5a','#f2efe6','#c84a6a'][(r*3+c)%6]);}
  R(g,px-6.5,sol-35,13,1.2,'#5a5e64');
}

const P={c0:'#2e4a78',c1:'#203a62',c2:'#142644',or:'#e8c870',s0:'#9a2a2a',s1:'#f2ebdc',mot:'PRESSE'};
let T=null;
function graver(){if(T)return T;const Wd=136,Hd=140,sol=132,cx=62,D=2;const c=document.createElement('canvas');c.width=Wd*D;c.height=Hd*D;const g=c.getContext('2d');g.setTransform(D,0,0,D,0,0);
  kiosque(g,cx,sol,P);T={toile:c,W:Wd,H:Hd,sol};return T;}
return {graver};})();

/* ---------- LE QUAI : le journal qu'on lit au kiosque ---------- */
/* LE JOURNAL « LE QUAI » : l'édition du jour. La date et le numéro se calculent ; les articles racontent ce qui a changé. */
const JOURNAL={
 une:{tag:'Le port',titre:'Trois navires, une seule soute',img:'navires',
  chapo:'Ferry, croisière, porte-conteneurs : chaque cale a désormais son ambiance. Les bagagistes y gagnent plus, et leur grade multiplie la paie, de ×1 pour l’occasionnel à ×5 pour le directeur du port.'},
 breves:[
  {tag:'Collection',titre:'Douze bagages rares',txt:'Coffre au trésor, valise diplomatique, panier d’oursins… Fusionnez-les pour les ranger dans l’album 📕.',img:'rares'},
  {tag:'Paie',titre:'Le ticket de pointeuse',txt:'Fin de cale : la pointeuse imprime ta feuille, le tampon tombe, tu encaisses.',img:'ticket'},
  {tag:'Joliette',titre:'Le kiosque recrute',txt:'Plus besoin de descendre au port : le kiosquier donne les vacations du jour.',img:'kiosque'},
  {tag:'Météo',titre:'Automne doré',txt:'Les platanes de la place gardent leurs couleurs jusqu’au 20 décembre.',img:'place',pos:'0 100%'}],
 annonce:'On cherche des bagagistes pour la soute. Paie au score, primes de grade. Se présenter au kiosquier.'};
const MOIS=['janvier','février','mars','avril','mai','juin','juillet','août','septembre','octobre','novembre','décembre'],JOURS=['dimanche','lundi','mardi','mercredi','jeudi','vendredi','samedi'];
const CSS_QUAI=`#quaiJ{position:fixed;inset:0;z-index:2147483000;overflow-y:auto;-webkit-overflow-scrolling:touch;opacity:0;transition:opacity .25s;
 background:#e6dac2 url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='32'%3E%3Crect width='64' height='32' fill='%23e3d6bc'/%3E%3Crect x='1' y='1' width='30' height='14' fill='%23ebe0c9'/%3E%3Crect x='33' y='17' width='30' height='14' fill='%23ebe0c9'/%3E%3Crect x='33' y='1' width='30' height='14' fill='%23e8dcc4'/%3E%3Crect x='1' y='17' width='30' height='14' fill='%23e8dcc4'/%3E%3C/svg%3E");background-size:64px 32px;color:#16213a}
#quaiJ.on{opacity:1}#quaiJ *{box-sizing:border-box}
#quaiJ .pap{max-width:480px;margin:calc(env(safe-area-inset-top,0px) + 14px) auto 110px;padding:0 14px;transform:translateY(14px);transition:transform .3s}
#quaiJ.on .pap{transform:none}
#quaiJ .mast{background:#16213a;border:4px solid #e8c050;box-shadow:0 0 0 4px #16213a,0 8px 0 rgba(0,0,0,.22);border-radius:4px;padding:12px 14px 10px;text-align:center;color:#f2ead6}
#quaiJ .mast small{display:block;font:900 10px ui-monospace,monospace;letter-spacing:3px;color:#e8c050}
#quaiJ .mast h1{margin:2px 0 4px;font:900 50px/1 Georgia,'Times New Roman',serif;letter-spacing:-1px;color:#ffd860;text-shadow:0 3px 0 #0a1020}
#quaiJ .mast .ln{display:flex;justify-content:space-between;border-top:2px solid #e8c050;padding-top:5px;font:700 10.5px ui-monospace,monospace;color:#c8d4e4;letter-spacing:.5px}
#quaiJ .bloc{margin-top:22px;background:#f6efdc;border:4px solid #16213a;border-radius:4px;box-shadow:0 6px 0 #16213a;overflow:hidden}
#quaiJ .une img{display:block;width:100%;height:auto;image-rendering:pixelated;border-bottom:4px solid #16213a}
#quaiJ .une .tx{padding:12px 14px 14px}
#quaiJ .tag{display:inline-block;background:#16213a;color:#e8c050;font:900 10px ui-monospace,monospace;letter-spacing:2px;padding:3px 7px;border-radius:2px;text-transform:uppercase}
#quaiJ .une h2{margin:8px 0 6px;font:900 29px/1.05 Georgia,serif;letter-spacing:-.5px}
#quaiJ .une p{margin:0;font:600 15px/1.4 Georgia,serif;color:#3a2e22}
#quaiJ .g{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-top:22px}
#quaiJ .c{background:#f6efdc;border:3px solid #16213a;border-radius:4px;box-shadow:0 5px 0 #16213a;overflow:hidden}
#quaiJ .c img{display:block;width:100%;height:96px;object-fit:cover;image-rendering:pixelated;border-bottom:3px solid #16213a}
#quaiJ .c .in{padding:8px 10px 10px}#quaiJ .c .tag{background:#c0392b;color:#fff;font-size:9px;letter-spacing:1.5px}
#quaiJ .c h3{margin:5px 0 3px;font:900 16px/1.1 Georgia,serif}#quaiJ .c p{margin:0;font:600 12.5px/1.35 Georgia,serif;color:#3a2e22}
#quaiJ .ann{margin-top:22px;border:3px dashed #16213a;border-radius:4px;padding:10px 12px;background:#fff6d8;display:flex;gap:10px;align-items:center}
#quaiJ .ann b{display:block;font:900 11px ui-monospace,monospace;letter-spacing:2px;color:#c0392b}#quaiJ .ann span{font:600 13.5px/1.35 Georgia,serif}
#quaiJ .bar{position:fixed;left:0;right:0;bottom:0;padding:14px 18px calc(16px + env(safe-area-inset-bottom));background:linear-gradient(rgba(230,218,194,0),#e6dac2 45%);display:flex;justify-content:center}
#quaiJ .bar button{all:unset;box-sizing:border-box;width:100%;max-width:440px;text-align:center;background:#16213a;color:#ffd860;border:4px solid #e8c050;box-shadow:0 0 0 4px #16213a,0 6px 0 rgba(0,0,0,.25);border-radius:4px;padding:12px;font:900 15px ui-monospace,monospace;letter-spacing:2px;cursor:pointer}`;
/* LE TRAM : à l'arrêt, on choisit sa destination ; le tram nous y dépose */
const DESTINATIONS=[
  {n:'Vélodrome',d:'Le stade · parvis et grand escalier',page:'stade.html',c:'#2f9ae0'},
  {n:'Plage des Catalans',d:'Le sable, la mer, le château d’If',page:'plage.html',c:'#e8b44a'},
  {n:'La Corniche',d:'Le grand banc, les plongeurs, la mer',page:'corniche.html',c:'#3aa0a0'},
  {n:'Vieux-Port',d:'Bientôt',page:null,c:'#c8604a'}];
function ouvrirTram(){if(document.getElementById('tramM'))return;
  const d=document.createElement('div');d.id='tramM';
  d.style.cssText='position:fixed;inset:0;z-index:2147483000;background:rgba(10,16,30,.55);display:flex;align-items:flex-end;justify-content:center;font-family:"Helvetica Neue",Arial,sans-serif;opacity:0;transition:opacity .2s';
  let h='<div style="width:min(440px,100%);background:#f6f7f8;border-radius:22px 22px 0 0;padding:18px 16px calc(18px + env(safe-area-inset-bottom));box-shadow:0 -10px 40px rgba(0,0,0,.3)">'+
    '<div style="display:flex;align-items:center;gap:10px;margin-bottom:14px"><div style="background:#1c4f9c;color:#fff;font-weight:900;border-radius:8px;padding:5px 9px;font-size:15px">T</div>'+
    '<div><div style="font-weight:800;font-size:18px;color:#16202c">Joliette</div><div style="font-size:13px;color:#6a7480">Où veux-tu aller ?</div></div>'+
    '<button id="tramX" style="margin-left:auto;width:38px;height:38px;border-radius:50%;border:0;background:#e2e6ea;font-size:20px;color:#3a4450">×</button></div>';
  DESTINATIONS.forEach((D,i)=>{const ok=!!D.page;
    h+='<button data-i="'+i+'" style="display:flex;align-items:center;gap:12px;width:100%;text-align:left;border:0;border-radius:14px;padding:14px;margin-bottom:8px;background:'+(ok?'#fff':'#eceff2')+';box-shadow:'+(ok?'0 2px 8px rgba(0,0,0,.08)':'none')+';opacity:'+(ok?1:.55)+'">'+
      '<span style="width:12px;height:12px;border-radius:50%;background:'+D.c+';flex:none"></span>'+
      '<span style="flex:1"><b style="display:block;font-size:16px;color:#16202c">'+D.n+'</b><span style="font-size:13px;color:#6a7480">'+D.d+'</span></span>'+
      (ok?'<span style="font-size:20px;color:#1c4f9c">›</span>':'')+'</button>';});
  d.innerHTML=h+'</div>';document.body.appendChild(d);requestAnimationFrame(()=>d.style.opacity='1');
  const fermer=()=>{d.style.opacity='0';setTimeout(()=>d.remove(),200);};
  d.addEventListener('click',e=>{if(e.target===d)fermer();});d.querySelector('#tramX').onclick=fermer;
  d.querySelectorAll('button[data-i]').forEach(b=>b.onclick=()=>{const D=DESTINATIONS[+b.dataset.i];if(!D.page)return;
    try{vibrer&&vibrer(15);}catch(x){}try{sauver();}catch(x){}
    const f=document.createElement('div');f.style.cssText='position:fixed;inset:0;z-index:2147483001;background:#0e1a2c;opacity:0;transition:opacity .45s;display:flex;align-items:center;justify-content:center;color:#fff;font:700 18px "Helvetica Neue",Arial,sans-serif';f.textContent='Prochain arrêt : '+D.n;document.body.appendChild(f);requestAnimationFrame(()=>f.style.opacity='1');
    setTimeout(()=>{const v=window.MA_VERSION?('?v='+encodeURIComponent(window.MA_VERSION)):'';location.href=D.page+v;},900);});}
let AFF_CHARGE=false;

async function ouvrirAffiches(){try{if(!window.ouvrirLesAffiches)eval(await chargerMorceau('affiches.js'));window.ouvrirLesAffiches();}catch(x){console.warn('AFF',x);}}
/* LE KIOSQUE : on y lit le journal, et on y prend ses vacations de docker (les petites annonces d'embauche) */
async function ouvrirVacationsKiosque(){try{if(!window.ouvrirVacations)eval(await chargerMorceau('vacations.js'));window.ouvrirVacations({journal:ouvrirJournal});}catch(x){console.warn('VAC',x);}}
function ouvrirJournal(){if(document.getElementById('quaiJ'))return;
  if(!document.getElementById('cssQuai')){const st=document.createElement('style');st.id='cssQuai';st.textContent=CSS_QUAI;document.head.appendChild(st);}
  const J=JOURNAL,v=window.MA_VERSION?('?v='+encodeURIComponent(window.MA_VERSION)):'',im=n=>'assets/journal/'+n+'.jpg'+v;
  const t=new Date(),date=JOURS[t.getDay()]+' '+t.getDate()+' '+MOIS[t.getMonth()]+' '+t.getFullYear(),num=4000+Math.floor(t/864e5)%10000;
  const d=document.createElement('div');d.id='quaiJ';
  d.innerHTML='<div class="pap"><div class="mast"><small>LE QUOTIDIEN DE LA JOLIETTE</small><h1>Le Quai</h1><div class="ln"><span>'+date.toUpperCase()+'</span><span>N° '+num+' · 1 €</span></div></div>'+
    '<div class="bloc une"><img src="'+im(J.une.img)+'" alt=""><div class="tx"><span class="tag">'+J.une.tag+'</span><h2>'+J.une.titre+'</h2><p>'+J.une.chapo+'</p></div></div>'+
    '<div class="g">'+J.breves.map(b=>'<div class="c"><img src="'+im(b.img)+'" alt=""'+(b.pos?' style="object-position:'+b.pos+'"':'')+'><div class="in"><span class="tag">'+b.tag+'</span><h3>'+b.titre+'</h3><p>'+b.txt+'</p></div></div>').join('')+'</div>'+
    '<div class="ann"><div><b>PETITE ANNONCE</b><span>'+J.annonce+'</span></div></div>'+
    '</div><div class="bar"><button type="button">REFERMER LE JOURNAL</button></div>';
  document.body.appendChild(d);requestAnimationFrame(()=>d.classList.add('on'));
  const fermer=()=>{d.classList.remove('on');setTimeout(()=>d.remove(),260);};
  d.querySelector('.bar button').addEventListener('click',fermer);
  ['pointerdown','touchstart','keydown'].forEach(t2=>d.addEventListener(t2,ev=>ev.stopPropagation()));
  try{vibrer(8);}catch(x){}}

const GRAVEURS={x_jol_entree:()=>{const c=document.createElement('canvas');c.width=2;c.height=2;return {toile:c,W:1,H:1,sol:0};},x_jol_kiosque:()=>KIOSQUE.graver(),x_jol_place_sol:v=>PLACE.graverSegment(v),x_jol_fontaine_ronde:()=>PLACE.graverFontaine(),x_jol_platane:graverPlatane,x_jol_arbre_magnolia:graverMagnolia,x_jol_pin:graverPin,x_jol_olivier:graverOlivier,x_jol_banc:graverBancBois,x_jol_lampadaire:graverLampadaire,x_jol_massif:graverMassifBeau,x_jol_docks_sol:graverDocks,x_jol_parasol:graverParasol,x_jol_abri:graverAbri,x_jol_panneau:graverPanneauPort,x_jol_affiches:graverPanneauAffiches,x_jol_tram:graverVide};
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
  P('x_jol_abri',600,420,{col:[100,6]});   /* (le menu du tram vers les autres lieux est débranché) */
  /* les deux rames, une par voie ; elles s'arrêtent devant leur station */
  P('x_jol_tram',400,376,{anim:'jol_tram',sens:1,arret:220});
  P('x_jol_tram',400,400,{anim:'jol_tram',sens:-1,arret:600});
  /* la fontaine au milieu, deux oliviers en bacs de part et d'autre */
  P('x_jol_fontaine_ronde',PLACE.CX,PLACE.FY,{anim:'jol_fontaine'});
  for(const s of PLACE.SEGS)P('x_jol_place_sol',s.x,s.y,{v:s.v});
  /* les allées de platanes */
  [470,590,710].forEach((y,i)=>{P('x_jol_platane',42,y,{col:[12,6],v:i});P('x_jol_platane',W-42,y,{col:[12,6],v:i+3});});
  /* les massifs de lavande et de graminées, avec leurs bancs */
  for(const [i,[x,y]] of [[200,470],[600,470],[200,700],[600,700]].entries()){P('x_jol_massif',x,y,{col:[84,14],v:i});P('x_jol_banc',x,y+20,{col:[40,6]});}
  /* des bancs tournés vers la fontaine */
  /* les lampadaires */
  for(const [x,y] of [[120,452],[680,452],[96,668],[680,642],[300,746],[500,746]])P('x_jol_lampadaire',x,y,{col:[4,3]});
  /* le tableau d'embauche, à deux pas de l'arrivée */
  /* le kiosque à journaux */
  for(const [px] of PORTES)P('x_jol_entree',px,DOCKS_PIED+10,{agir:entrerGalerie,libelle:'Entrer',nom:'LA GALERIE BLEUE'});
  P('x_jol_kiosque',156,600,{col:[96,14],agir:ouvrirVacationsKiosque,libelle:'Au kiosque',nom:'KIOSQUE · EMBAUCHE'});
  P('x_jol_entree',PLACE.CX,628,{agir:()=>VOEU.faire(),libelle:'Faire un vœu',nom:'FONTAINE À VŒUX'});
  P('x_jol_affiches',622,600,{col:[90,8],agir:ouvrirAffiches,libelle:'Voir les affiches',nom:'À L’AFFICHE',demi:56});
  return D;
}

function bloque(x,y){
  if(x<14||x>W-14)return true;
  if(y<DOCKS_PIED+16)return true;                     /* la façade des Docks */
  if(y>PLACE_BAS+4)return true;   /* la rue : on ne la traverse plus */
  if(y>H-4)return true;
  if(PLACE.bloquePlace(x,y))return true;
  for(const o of DECOR){if(o.anim==='jol_tram'){try{if(dansLaRame(o,x,y)&&!dansLaRame(o,joueur.x,joueur.y))return true;}catch(e){}continue;}
    if(!o.col)continue;
    if(Math.abs(x-o.x)<o.col[0]/2&&y>o.y-o.col[1]&&y<o.y+(o.bas||3))return true;}
  return false;
}

/* LA SORTIE : au bout du passage piéton, on descend au port */
let PARTI=false;
setInterval(()=>{try{
  if(true||PARTI||typeof joueur==='undefined')return;   /* le port n'est plus un lieu : le travail se prend au kiosque */
  if(joueur.y>PLACE_BAS+22&&Math.abs(joueur.x-SORTIE_X)<SORTIE_DEMI){
    PARTI=true;
    try{texteVolant(joueur.x,joueur.y-40,'Direction le port…','#f0cf7d');}catch(x){}
    try{sauver();}catch(x){}
    setTimeout(()=>{const v=window.MA_VERSION?('&v='+encodeURIComponent(window.MA_VERSION)):'';
      location.href='quai.html?de=joliette'+v;},620);
  }}catch(x){}},150);


/* ON ENTRE À LA GALERIE BLEUE : devant une porte, le bouton « Entrer » ; on passe la porte, l'écran se fond en bleu */
let ENTRE=false;
const VOILE_GB='position:fixed;inset:0;z-index:2147483000;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;pointer-events:none;'+
  'background:radial-gradient(ellipse at 50% 42%,#2a64b8 0%,#173f86 55%,#0c2554 100%);color:#fff;font-family:"Helvetica Neue",Arial,sans-serif;transition:opacity .5s';
const TITRE_GB='<div style="font-size:13px;letter-spacing:.5em;opacity:.75;transform:translateX(.25em)">BIENVENUE À</div>'+
  '<div style="font-weight:800;font-size:30px;letter-spacing:.14em">LA GALERIE BLEUE</div><div style="width:64px;height:2px;background:#8cc4ff;border-radius:2px"></div>';
function entrerGalerie(){if(ENTRE||PARTI)return;ENTRE=true;try{vibrer&&vibrer(12);}catch(x){}
  const px=PORTES.reduce((a,[x])=>Math.abs(x-joueur.x)<Math.abs(a-joueur.x)?x:a,PORTES[0][0]);
  const x0=joueur.x,y0=joueur.y,y1=DOCKS_PIED-26,t0=performance.now(),D=900;
  window.FP_GEL=Date.now()+4000;
  let marche=true;try{Object.defineProperty(joueur,'marche',{configurable:true,get:()=>marche,set:()=>{}});}catch(x){}
  const pas=()=>{const k=Math.min(1,(performance.now()-t0)/D),e=k<.5?2*k*k:1-Math.pow(-2*k+2,2)/2;
    joueur.x=x0+(px-x0)*Math.min(1,k*2.2);joueur.y=y0+(y1-y0)*e;joueur.dir='haut';joueur.dirVue='haut';joueur.pas+=.12;
    if(k<1)requestAnimationFrame(pas);};
  requestAnimationFrame(pas);
  const v=document.createElement('div');v.style.cssText=VOILE_GB+';opacity:0';v.innerHTML=TITRE_GB;
  setTimeout(()=>{document.body.appendChild(v);requestAnimationFrame(()=>v.style.opacity='1');},520);
  setTimeout(()=>{try{sauver();}catch(x){}const q=window.MA_VERSION?('&v='+encodeURIComponent(window.MA_VERSION)):'';location.href='terrasses.html?de=place'+q+'&t='+Date.now();},1250);}

/* ---------- LES PIGEONS : ils picorent sur la place, s'envolent quand on approche, reviennent plus tard ---------- */
const PIGEONS=(()=>{
const PAL={k:'#2e2c3a',g:'#969cac',l:'#c4c8d4',d:'#707688',b:'#282a34',n:'#468c76',p:'#825a96',o:'#f08c32',y:'#ece0ce',f:'#dc7878',t:'#464856'};
const SPR={
marche:['..........kkk...','.........kgllk..','.........kglokyy','.........kgggk..','.....kkkknpnnk..','...kkddddnpnpgk.','.kkdbddbdggnggk.','kttdbddbdgglggk.','.kttddddllglgk..','..kkkkllllllk...','.....kkkkkkk....','......f...f.....'],
marche2:['................','...........kkk..','..........kgllk.','..........kglokyy','.....kkkkknpnnk.','...kkddddnpnpgk.','.kkdbddbdggnggk.','kttdbddbdgglggk.','.kttddddllglgk..','..kkkkllllllk...','.....kkkkkkk....','.....f.....f....'],
picore:['................','................','....kkkkk.......','..kkddddgkk.....','.kdbddbdggnkk...','kttbddbdgggpnk..','kttdddddlggnpk..','.kkkllllllgggkk.','....kkkkkkklokk.','.......f..f.kgkyy','............kk..','................'],
vol1:['..kk............','..kdk...........','...kdk.....kkk..','...kdbk...kgllk.','....kdbk..kglokyy','.kk..kddkkkgggk.','kttkkkddgnpnnk..','.kttddddggnpgk..','..kkkllllllkk...','.....kkkkkk.....','................','................'],
vol2:['................','................','...........kkk..','..........kgllk.','..........kglokyy','.kk.......kgggk.','kttkkkkkkknpnnk.','.kttddddggnpgk..','..kkkdddllllkk..','.....kdbbkkk....','......kddk......','.......kk.......']};
const C={};
for(const k in SPR)for(const s of [1,-1]){const c=document.createElement('canvas');c.width=18;c.height=12;const g=c.getContext('2d');
  SPR[k].forEach((r,y)=>{for(let x=0;x<r.length;x++){const v=PAL[r[x]];if(!v)continue;g.fillStyle=v;g.fillRect(s>0?x:17-x,y,1,1);}});C[k+s]=c;
  const n=document.createElement('canvas');n.width=18;n.height=12;const h=n.getContext('2d');h.drawImage(c,0,0);h.globalCompositeOperation='multiply';h.fillStyle='#5a6490';h.fillRect(0,0,18,12);h.globalCompositeOperation='destination-in';h.drawImage(c,0,0);C[k+s+'n']=n;}
const R=(a,b)=>a+Math.random()*(b-a);
const BANDES=[[330,650,4],[480,520,3],[318,730,3],[560,640,2]];
const L=[];
for(const [hx,hy,n] of BANDES){const bd={hx,hy,etat:'sol',t:0};for(let i=0;i<n;i++){const x=hx+R(-14,14),y=hy+R(-8,8);
  L.push({bd,x,y,z:0,tx:x,ty:y,dir:Math.random()<.5?1:-1,att:R(0,2),pic:0,ph:R(0,9),vx:0,vy:0,vz:0,fin:0});}}
const libre=(x,y)=>{try{return !bloque(x,y);}catch(e){return true;}};
let T0=performance.now();
function pas(){const now=performance.now(),dt=Math.min(.05,(now-T0)/1000);T0=now;
  const jx=joueur.x,jy=joueur.y;
  for(const p of L){const b=p.bd;p.ph+=dt;
    if(p.etat==='vol'){p.x+=p.vx*dt;p.y+=p.vy*dt;p.z+=p.vz*dt;p.vz=Math.min(p.vz+30*dt,90);
      if(p.z>170){p.etat='loin';p.fin=now+R(6000,11000);}continue;}
    if(p.etat==='loin'){if(now>p.fin){if(Math.hypot(jx-b.hx,jy-b.hy)<70){p.fin=now+R(2000,4000);continue;}
        const a=R(0,6.28);p.ox=b.hx+Math.cos(a)*220;p.oy=b.hy+Math.sin(a)*120;p.tx=b.hx+R(-16,16);p.ty=b.hy+R(-9,9);p.t0=now;p.etat='retour';p.dir=p.tx>p.ox?1:-1;}continue;}
    if(p.etat==='retour'){const k=Math.min(1,(now-p.t0)/2600),e=1-Math.pow(1-k,2);p.x=p.ox+(p.tx-p.ox)*e;p.y=p.oy+(p.ty-p.oy)*e;p.z=160*(1-k)*(1-k)+Math.sin(k*Math.PI)*8;
      if(k>=1){p.etat='sol';p.z=0;p.att=R(.3,1.5);}continue;}
    /* au sol : on a peur si quelqu'un s'approche */
    const d=Math.hypot(jx-p.x,jy-p.y);
    if(d<36){for(const q of L)if(q.bd===b&&(q.etat==='sol'||!q.etat)){const a=Math.atan2(q.y-jy,q.x-jx)+R(-.7,.7),v=R(60,85);
        q.etat='vol';q.vx=Math.cos(a)*v;q.vy=Math.sin(a)*v*.6;q.vz=R(40,60);q.dir=q.vx>0?1:-1;q.ph=R(0,1);}
      try{if(!b.flou||now-b.flou>4000){b.flou=now;plumes(p.x,p.y);}}catch(e){}continue;}
    if(p.att>0){p.att-=dt;if(p.pic<=0&&Math.random()<dt*1.4)p.pic=R(.3,.9);if(p.pic>0)p.pic-=dt;
      if(p.att<=0){for(let i=0;i<6;i++){const tx=b.hx+R(-20,20),ty=b.hy+R(-11,11);if(libre(tx,ty)){p.tx=tx;p.ty=ty;break;}}}continue;}
    const dx=p.tx-p.x,dy=p.ty-p.y,dd=Math.hypot(dx,dy);
    if(dd<.6){p.att=R(.6,2.6);continue;}
    const v=Math.min(dd,9*dt);p.x+=dx/dd*v;p.y+=dy/dd*v;if(Math.abs(dx)>.3)p.dir=dx>0?1:-1;}
}
/* trois plumes qui retombent quand ils s'envolent */
const PL=[];
function plumes(x,y){for(let i=0;i<4;i++)PL.push({x:x+R(-6,6),y,z:R(4,12),vx:R(-8,8),t:performance.now(),f:R(0,6)});}
function dessinerPigeon(g,p,cx,cy){
  let k='marche';
  if(p.etat==='vol'||p.etat==='retour'){k=(p.etat==='retour'&&p.z<10)?'vol1':(((p.ph*14)|0)%2?'vol1':'vol2');}
  else if(p.pic>0)k=((p.pic*5)|0)%2?'picore':'marche';
  else if(p.att<=0)k=((p.ph*8)|0)%2?'marche2':'marche';
  const X=p.x-cx,Y=p.y-cy;
  g.fillStyle='rgba(30,26,18,'+(.22*Math.max(.15,1-p.z/120))+')';g.beginPath();g.ellipse(X,Y,4.8*Math.max(.4,1-p.z/200),1.6,0,0,7);g.fill();
  const s=g.imageSmoothingEnabled;g.imageSmoothingEnabled=false;
  const x0=Math.round((X-6.75)*2)/2,y0=Math.round((Y-8.4-p.z)*2)/2;g.drawImage(C[k+p.dir],x0,y0,13.5,9);
  let nk=0;try{nk=nuitDecor();}catch(e){}if(nk>.02){g.globalAlpha=nk;g.drawImage(C[k+p.dir+'n'],x0,y0,13.5,9);g.globalAlpha=1;}g.imageSmoothingEnabled=s;}
function acteurs(){try{pas();}catch(e){}
  const A=[];
  for(const p of L){if(p.etat==='loin')continue;A.push({y:p.z>14?99999:p.y,f:(g,cx,cy)=>dessinerPigeon(g,p,cx,cy)});}
  const now=performance.now();
  for(let i=PL.length-1;i>=0;i--){const q=PL[i],a=(now-q.t)/1000;if(a>1.6){PL.splice(i,1);continue;}
    A.push({y:q.y,f:(g,cx,cy)=>{const z=Math.max(0,q.z-a*9),x=q.x+q.vx*a+Math.sin(a*6+q.f)*2;g.globalAlpha=Math.min(1,(1.6-a)*2);g.fillStyle='#d8dce4';
      g.fillRect(Math.round((x-cx)*2)/2,Math.round((q.y-cy-z)*2)/2,1.5,.5);g.globalAlpha=1;}});}
  return A;}
try{window.__PIG={L,j:()=>joueur};}catch(e){}
return {acteurs};
})();

/* ---------- LA FONTAINE À VŒUX : une pièce par jour, un vœu, une petite fortune ---------- */
const VOEU=(()=>{
const DIRES=['Le mistral tournera en ta faveur.','Un pigeon te portera chance. Ou pas.','Ta prochaine caisse sera bien remplie.','Quelqu’un pense à toi sur le port.','Le soleil se lèvera pour toi, et pour les autres aussi.','Une belle surprise t’attend du côté de la mer.','Ta prochaine pêche sera mémorable.','Tu trouveras ce que tu as perdu. Peut-être.','Un vieux docker te racontera une histoire vraie.','La chance sourit à ceux qui marchent sous les platanes.','Ton vœu est entendu. La fontaine garde le secret.','Évite les mouettes près des sandwichs.'];
const jour=()=>{const d=new Date();return d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate();};
let PIECE=null,RONDS=[];
const CSS=`#voeu{position:fixed;inset:0;z-index:2147482100;display:grid;place-items:center;padding:24px;background:rgba(20,30,50,.45);opacity:0;transition:opacity .25s;font-family:'Baloo 2',system-ui,sans-serif;-webkit-tap-highlight-color:transparent}
#voeu.on{opacity:1}#voeu *{box-sizing:border-box}#voeu *::after{content:none!important;display:none!important}
#voeu .c{position:relative;width:min(320px,86vw);background:#f6f1e6;border-radius:22px;padding:26px 22px 18px;text-align:center;box-shadow:0 6px 0 #ddd3c0,0 20px 40px rgba(0,0,0,.3);transform:translateY(20px) scale(.92);transition:transform .35s cubic-bezier(.2,1.4,.4,1)}
#voeu.on .c{transform:none}
#voeu .pc{width:56px;height:56px;margin:-54px auto 8px;border-radius:50%;background:radial-gradient(circle at 35% 30%,#ffe9a0,#f2b030 55%,#b07810);box-shadow:0 4px 0 #8a5a08,0 0 0 4px #f6f1e6;display:grid;place-items:center;font:900 22px 'Baloo 2',system-ui,sans-serif;color:#7a4a00;animation:vPc 1.2s ease-out}
@keyframes vPc{0%{transform:rotateY(0) translateY(-30px)}60%{transform:rotateY(720deg) translateY(4px)}100%{transform:rotateY(720deg)}}
#voeu .k{font:800 11px 'Baloo 2',system-ui,sans-serif;letter-spacing:2px;color:#8a7a5a}
#voeu h3{margin:2px 0 10px;font:900 24px/1.05 'Baloo 2',system-ui,sans-serif;color:#2a2016}
#voeu p{margin:0 0 16px;font:700 17px/1.3 'Baloo 2',system-ui,sans-serif;color:#2a2016}
#voeu button{width:100%;border:0;border-radius:16px;padding:13px;background:#2a2016;color:#fff;font:800 16px 'Baloo 2',system-ui,sans-serif;box-shadow:0 4px 0 #000}
#voeu .s{margin-top:10px;font:700 12px 'Baloo 2',system-ui,sans-serif;color:#8a7a5a}`;
function carte(t){if(!document.getElementById('voeuCss')){const s=document.createElement('style');s.id='voeuCss';s.textContent=CSS;document.head.appendChild(s);}
  const d=document.createElement('div');d.id='voeu';d.innerHTML='<div class="c"><div class="pc">€</div><div class="k">FONTAINE À VŒUX</div><h3>Ton vœu du jour</h3><p>'+t+'</p><button>Merci la fontaine</button><div class="s">Reviens demain pour un nouveau vœu.</div></div>';
  document.body.appendChild(d);requestAnimationFrame(()=>d.classList.add('on'));
  let fini=false;const f=()=>{if(fini)return;fini=true;d.classList.remove('on');setTimeout(()=>d.remove(),250);};
  d.onclick=ev=>{if(ev.target===d)f();};d.querySelector('button').onclick=()=>{try{vibrer(8);}catch(x){}f();};}
function faire(){
  let j=null;try{j=localStorage.getItem('voeu_jour');}catch(x){}
  if(j===jour()){try{texteVolant(joueur.x,joueur.y-40,'Un vœu par jour… reviens demain','#f0cf7d');}catch(x){}return;}
  if(PIECE)return;
  try{localStorage.setItem('voeu_jour',jour());}catch(x){}
  try{vibrer(10);}catch(x){}
  const tx=PLACE.CX+(Math.random()*30-15),ty=592+Math.random()*6;
  PIECE={x0:joueur.x,y0:joueur.y-18,tx,ty,t0:performance.now()};
  const dire=DIRES[(Math.random()*DIRES.length)|0];
  setTimeout(()=>{RONDS.push({x:tx,y:ty,t:performance.now()});try{vibrer([6,40,6]);}catch(x){}},900);
  setTimeout(()=>carte(dire),1500);}
function acteurs(){const A=[],now=performance.now();
  if(PIECE){const k=(now-PIECE.t0)/900;if(k>=1)PIECE=null;else{const P=PIECE,x=P.x0+(P.tx-P.x0)*k,y=P.y0+(P.ty-P.y0)*k-Math.sin(k*Math.PI)*46;
    A.push({y:99999,f:(g,cx,cy)=>{const w=Math.abs(Math.cos(k*20))*2.6+.5;g.fillStyle='#b07810';g.fillRect(x-cx-w/2,y-cy-1.5,w,3);g.fillStyle='#ffd860';g.fillRect(x-cx-w/2+.3,y-cy-1.2,Math.max(.3,w-.6),2);
      if(((now/60)|0)%3===0){g.fillStyle='#fff';g.fillRect(x-cx+1,y-cy-2.5,.8,.8);}}});}}
  for(let i=RONDS.length-1;i>=0;i--){const r=RONDS[i],a=(now-r.t)/1400;if(a>1){RONDS.splice(i,1);continue;}
    A.push({y:r.y+40,f:(g,cx,cy)=>{g.strokeStyle='rgba(255,255,255,'+(1-a)+')';g.lineWidth=.7;for(const q of [0,.25]){const b=Math.max(0,a-q);if(b<=0)continue;g.beginPath();g.ellipse(r.x-cx,r.y-cy,2+b*16,1+b*6,0,0,7);g.stroke();}
      if(a<.35){g.fillStyle='rgba(220,245,255,'+(1-a*2.5)+')';for(let k=0;k<6;k++){const an=k/6*6.28;g.fillRect(r.x-cx+Math.cos(an)*a*14,r.y-cy-Math.sin(a*9)*5-Math.abs(Math.sin(an))*3,.8,.8);}}}});}
  return A;}
return {faire,acteurs};
})();

/* ---------- LE MOT D'ACCUEIL : la toute première fois sur la place ---------- */
(()=>{let deja=null;try{deja=localStorage.getItem('jol_bienvenue');}catch(x){}
if(deja&&!window.BIENV_TOUJOURS)return;
const ic=(k)=>{const S={
 gal:'<rect x="1" y="4" width="14" height="10" fill="#1f4a96"/><rect x="1" y="2" width="14" height="3" fill="#2a64b8"/><rect x="6" y="8" width="4" height="6" fill="#f2c94c"/><rect x="2" y="6" width="3" height="3" fill="#8cc4ff"/><rect x="11" y="6" width="3" height="3" fill="#8cc4ff"/>',
 port:'<rect x="0" y="11" width="16" height="5" fill="#3a8ac4"/><rect x="0" y="11" width="16" height="1" fill="#9ad4f0"/><rect x="3" y="7" width="10" height="4" fill="#d8402a"/><rect x="5" y="3" width="2" height="4" fill="#2a2016"/><rect x="7" y="4" width="5" height="3" fill="#f6f1e6"/>',
 font:'<rect x="1" y="11" width="14" height="4" fill="#b4a68a"/><rect x="2" y="12" width="12" height="2" fill="#4a9cc4"/><rect x="7" y="5" width="2" height="6" fill="#d8ccb2"/><rect x="4" y="4" width="8" height="2" fill="#f2ead8"/><rect x="7" y="1" width="2" height="3" fill="#9ad4f0"/><rect x="12" y="7" width="3" height="3" fill="#f2b030"/>',
 aff:'<rect x="2" y="2" width="12" height="11" fill="#c89a5e"/><rect x="3" y="3" width="5" height="6" fill="#fdf6e3"/><rect x="9" y="4" width="4" height="5" fill="#173f86"/><rect x="5" y="2" width="1" height="1" fill="#e8302a"/><rect x="10" y="3" width="1" height="1" fill="#e8302a"/><rect x="7" y="13" width="2" height="3" fill="#2f6b4a"/>'};
 return '<svg viewBox="0 0 16 16" width="34" height="34" shape-rendering="crispEdges">'+S[k]+'</svg>';};
const CSS=`#bienv{position:fixed;inset:0;z-index:2147482100;display:flex;align-items:flex-end;justify-content:center;background:rgba(20,26,40,.35);opacity:0;transition:opacity .3s;font-family:'Baloo 2',system-ui,sans-serif;-webkit-tap-highlight-color:transparent}
#bienv.on{opacity:1}#bienv *{box-sizing:border-box}#bienv *::after{content:none!important;display:none!important}
#bienv .c{width:min(420px,100%);background:#f6f1e6;border-radius:26px 26px 0 0;padding:22px 20px calc(16px + env(safe-area-inset-bottom));box-shadow:0 -10px 30px rgba(0,0,0,.25);transform:translateY(100%);transition:transform .45s cubic-bezier(.2,1,.3,1)}
#bienv.on .c{transform:none}
#bienv .k{font:800 11px 'Baloo 2',system-ui,sans-serif;letter-spacing:2px;color:#8a7a5a}
#bienv h2{margin:0 0 4px;font:900 27px/1.05 'Baloo 2',system-ui,sans-serif;color:#2a2016}
#bienv .st{margin:0 0 14px;font:700 15px/1.3 'Baloo 2',system-ui,sans-serif;color:#5a4a32}
#bienv .l{display:flex;align-items:center;gap:12px;background:#fff;border-radius:16px;padding:8px 12px;margin-bottom:8px;box-shadow:0 3px 0 #ddd3c0;opacity:0;transform:translateY(8px);animation:bvIn .35s forwards}
#bienv .l svg{flex:none;image-rendering:pixelated}
#bienv .l b{display:block;font:800 15px/1.1 'Baloo 2',system-ui,sans-serif;color:#2a2016}#bienv .l span{font:700 12.5px/1.2 'Baloo 2',system-ui,sans-serif;color:#8a7a5a}
@keyframes bvIn{to{opacity:1;transform:none}}
#bienv button{width:100%;margin-top:6px;border:0;border-radius:18px;padding:14px;background:#2a2016;color:#fff;font:800 17px 'Baloo 2',system-ui,sans-serif;box-shadow:0 4px 0 #000}`;
const L=[['gal','La Galerie Bleue','Tout en haut, sous les docks : boutiques et café'],['port','Le kiosque','À gauche de la fontaine : le journal et les vacations, pour travailler'],['font','La fontaine à vœux','Au milieu de la place : un vœu par jour'],['aff','À l’affiche','Le panneau à droite de la fontaine']];
let calme=0;const guet=setInterval(()=>{const occupe=window.ECRAN_COUVRANT||document.getElementById('dimEcran')||document.hidden;calme=occupe?0:calme+1;if(calme<3)return;clearInterval(guet);if(document.getElementById('bienv'))return;
  try{localStorage.setItem('jol_bienvenue','1');}catch(x){}
  if(!document.getElementById('bvCss')){const s=document.createElement('style');s.id='bvCss';s.textContent=CSS;document.head.appendChild(s);}
  const d=document.createElement('div');d.id='bienv';
  d.innerHTML='<div class="c"><div class="k">BIENVENUE</div><h2>Place de la Joliette</h2><p class="st">Le cœur du quartier. D’ici, tu vas partout.</p>'+
    L.map((r,i)=>'<div class="l" style="animation-delay:'+(.25+i*.08)+'s">'+ic(r[0])+'<div><b>'+r[1]+'</b><span>'+r[2]+'</span></div></div>').join('')+'<button>C’est parti</button></div>';
  document.body.appendChild(d);requestAnimationFrame(()=>requestAnimationFrame(()=>d.classList.add('on')));
  let fini=false;const f=()=>{if(fini)return;fini=true;try{vibrer(8);}catch(x){}d.classList.remove('on');setTimeout(()=>d.remove(),350);};
  d.onclick=ev=>{if(ev.target===d)f();};d.querySelector('button').onclick=f;},500);
})();

ANIM_DECOR.jol_tram=dessinerTram;
ANIM_DECOR.jol_docks=dessinerLesDocks;
ANIM_DECOR.jol_fontaine=PLACE.dessinerFontaine;
return {sol,decor,bloque,graver,depart:DEPART,solFin:PLACE.solFin,acteurs:()=>PIGEONS.acteurs().concat(VOEU.acteurs())};
})()
