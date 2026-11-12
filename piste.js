/* =====================================================================
   LA PISTE — le stade d'athlétisme (piste.html), un lieu à part entière.
   La tribune monte à la verticale au fond ; tout le reste est posé au sol :
   l'anneau de 400 m en tartan rouge, six couloirs, la pelouse et ses
   aires de sauts, la grille du bas par où l'on rentre à la Joliette.
   On y court en tenue d'athlète (choisie aux vestiaires) : 100 m, 400 m,
   800 m, contre son propre fantôme. Chargé par moteur.js (eval direct).
   ===================================================================== */
(()=>{
const W=1600, H=800, Y0=300;
const CX=800, CY=548, DEMI=380, LW=11, NC=6, RI=128;   /* l'anneau : centre, demi-ligne droite, couloirs, rayon intérieur */
const RO=RI+LW*NC;
const X0=CX-DEMI, X1=CX+DEMI;
const DEPART=[800,752];
const hA=(x,y,k)=>{let n=((x*73856093)^(y*19349663)^(k*83492791))|0;n=(n^(n>>>13))*1274126177|0;return((n^(n>>>16))>>>0)/4294967296;};
const R=(g,x,y,w,h,c)=>{g.fillStyle=c;g.fillRect(x,y,w,h);};
const txt=(g,s,x,y,px,c,al,f)=>{g.fillStyle=c;g.font=(f||'900')+' '+px+'px "Helvetica Neue",Arial,sans-serif';g.textAlign=al||'center';g.textBaseline='middle';g.fillText(s,x,y);};

/* ---------- LA GÉOMÉTRIE DE L'ANNEAU ----------
   Un couloir de rayon r : on part de la ligne d'arrivée (en haut, à gauche),
   on court vers la gauche, on descend le virage, on file en bas vers la
   droite, on remonte le second virage et on revient : la pelouse est
   toujours à gauche du coureur, comme sur une vraie piste. */
const rC=c=>RI+LW*(c-.5);
function longueur(r){return 2*Math.PI*r+4*DEMI;}
function pos(s,r){const A=Math.PI*r,L=longueur(r);s=((s%L)+L)%L;
  if(s<A){const t=-Math.PI/2-s/r;return [X0+Math.cos(t)*r,CY+Math.sin(t)*r];}s-=A;
  if(s<2*DEMI)return [X0+s,CY+r];s-=2*DEMI;
  if(s<A){const t=Math.PI/2-s/r;return [X1+Math.cos(t)*r,CY+Math.sin(t)*r];}s-=A;
  return [X1-s,CY-r];}
/* LES ÉPREUVES : une épreuve = un départ, une distance, des bornes tous les 70 px.
   L'échelle : un tour du couloir 1 fait 400 m ; le temps du jeu ×3 donne un temps d'athlète. */
const L1=longueur(rC(1)),M=L1/400;
function epreuve(k,nom,s0,metres,med){const r=rC(1),d=metres*M,pts=[];for(let s=70;s<d;s+=70)pts.push(pos(s0+s,r));pts.push(pos(s0+d,r));
  return {k,nom,start:pos(s0,r),pts,med,fac:3,metres};}
const COURSES=[
  epreuve('piste100','100 m',L1-100*M,100,[10.8,12.2,13.8]),
  epreuve('piste400','400 m',Math.PI*rC(1)+2*DEMI*.25,400,[52,60,70]),
  epreuve('piste800','800 m',Math.PI*rC(1)+2*DEMI*.8,800,[115,130,150])];

/* ---------- LE SOL ---------- */
function tribune(g){
  /* le ciel du soir derrière le toit, quelques nuages */
  const sk=g.createLinearGradient(0,0,0,74);sk.addColorStop(0,'#4a7cc8');sk.addColorStop(1,'#bfe0f6');g.fillStyle=sk;g.fillRect(0,0,W,74);
  for(let i=0;i<9;i++){const x=hA(i,1,4)*W,y=10+hA(i,2,4)*30;g.fillStyle='rgba(255,255,255,.55)';for(const [dx,dy,r] of [[0,0,7],[9,-3,9],[19,0,7],[9,3,7]]){g.beginPath();g.arc(x+dx,y+dy,r,0,7);g.fill();}}
  /* les mâts de projecteurs, derrière */
  for(const x of [210,1390]){R(g,x-3,0,6,64,'#7a828c');R(g,x-3,0,2,64,'#a8b0ba');R(g,x-24,4,48,28,'#2a2e36');for(let i=0;i<4;i++)for(let j=0;j<2;j++){R(g,x-21+i*11,7+j*13,9,10,'#fff6d0');R(g,x-21+i*11,7+j*13,9,3,'#ffffff');}}
  /* le toit en porte-à-faux, ses poutres, son ombre */
  R(g,0,46,W,24,'#26314a');R(g,0,46,W,3,'#5a6a8e');R(g,0,68,W,2,'#141a28');for(let x=20;x<W;x+=80){R(g,x,49,4,19,'#1a2236');R(g,x,49,1,19,'#3a4866');}
  /* les drapeaux sur le toit */
  for(let i=0;i<10;i++){const x=80+i*160,c=['#e84a3a','#ffffff','#7ac8f0','#f5c430','#2e8a4a'][i%5];R(g,x,24,1.4,22,'#d8dce2');g.fillStyle=c;g.beginPath();g.moveTo(x+1.4,24);g.lineTo(x+16,28+Math.sin(i)*2);g.lineTo(x+1.4,33);g.fill();}
  /* les gradins : rangées en perspective, sièges, escaliers, et la foule */
  const Y1=70,Y2=238;
  for(let r=0;r<17;r++){const y=Y1+r*(Y2-Y1)/17,h=(Y2-Y1)/17,c=r%2?'#2766b0':'#2f72c0';R(g,0,y,W,h,c);R(g,0,y+h-2,W,2,'#1a4a86');
    for(let x=4;x<W;x+=9){const esc=(x%160)<14;if(esc){R(g,x-4,y,13,h,r%2?'#b8b2a8':'#c8c2b6');R(g,x-4,y+h-2,13,1,'#8a847a');continue;}
      const hh=hA(x,r,3),dens=.18+.38*Math.max(0,1-Math.abs(x-CX)/700);
      if(hh<dens){const c2=['#f2d0a8','#c8946a','#8a5a3a','#e8b890','#5a3a24'][(hh*50|0)%5],t=['#e84a3a','#f5c430','#ffffff','#3ac0e8','#7ee08a','#1a1a1e','#ff8ab8','#7ac8f0'][(hh*97|0)%8];
        R(g,x,y+3,6,h-4,t);R(g,x,y+3,6,1,'rgba(255,255,255,.25)');R(g,x+1.5,y-.5,3,3.4,c2);R(g,x+1.5,y-.5,3,1,'rgba(0,0,0,.25)');
        if(hh<dens*.15)R(g,x+5,y-3,1.4,3,c2);}         /* un bras levé */
      else{R(g,x,y+2,7,h-5,'rgba(255,255,255,.14)');R(g,x,y+h-4,7,1,'rgba(0,0,0,.15)');}}}
  /* l'ombre du toit sur le haut des gradins */
  const om=g.createLinearGradient(0,Y1,0,Y1+46);om.addColorStop(0,'rgba(10,16,30,.55)');om.addColorStop(1,'rgba(10,16,30,0)');g.fillStyle=om;g.fillRect(0,Y1,W,46);
  /* le grand écran au centre */
  R(g,CX-178,80,356,124,'#2a2e36');R(g,CX-172,86,344,112,'#06070a');R(g,CX-178,80,356,3,'#4a4e58');
  for(let y=88;y<196;y+=2)R(g,CX-170,y,340,1,'rgba(255,255,255,.025)');
  txt(g,'PISTE MUNICIPALE',CX,108,22,'#ffb030');txt(g,'MARSEILLE · ATHLÉTISME',CX,132,13,'#ffd880','700');
  for(let i=0;i<3;i++){R(g,CX-150+i*104,148,92,36,'#14161c');txt(g,['100 M','400 M','800 M'][i],CX-104+i*104,160,13,'#7ee08a');txt(g,'00:00.00',CX-104+i*104,175,10,'#ff6a4a','700');}
  R(g,CX-110,204,10,34,'#3a3e48');R(g,CX+100,204,10,34,'#3a3e48');
  /* le mur des tribunes, ses bâches publicitaires */
  R(g,0,Y2,W,62,'#ece8de');R(g,0,Y2,W,3,'#ffffff');R(g,0,292,W,8,'#bdb6a8');R(g,0,290,W,2,'#d8d2c4');
  const BACHES=[['ALLEZ !','#c0392b'],['MARSEILLE','#1f5fa8'],['ATHLÉ 13','#2e8a4a'],['400 M','#e8702a'],['RECORDS','#5a2ab0'],['SAVON DE M.','#2a8ab0']];
  for(let i=0,x=300;x<W-60;x+=180,i++){if(Math.abs(x+75-CX)<130)continue;const [t,c]=BACHES[i%BACHES.length];R(g,x,250,150,30,c);R(g,x,250,150,3,'rgba(255,255,255,.3)');R(g,x,277,150,3,'rgba(0,0,0,.15)');txt(g,t,x+75,265,15,'#fff');}
  /* les vestiaires, à gauche : un vrai petit bâtiment */
  R(g,34,140,214,160,'#e2d8c4');for(let y=146;y<296;y+=8)R(g,34,y,214,1,'rgba(120,100,70,.12)');
  R(g,28,128,226,14,'#8a3a2a');R(g,28,128,226,3,'#b85a44');R(g,28,141,226,3,'#5a2418');
  R(g,108,206,64,94,'#3a2614');R(g,112,210,56,90,'#6a4428');R(g,112,210,27,90,'#7a5032');R(g,139,250,3,10,'#e8c050');R(g,141,250,3,10,'#e8c050');
  for(const x of [52,192]){R(g,x,176,40,28,'#5a6a7a');R(g,x+2,178,36,24,'#a8d0f0');R(g,x+2,178,36,8,'#d0e8f8');R(g,x+19,178,2,24,'#5a6a7a');}
  R(g,80,152,120,20,'#16213a');R(g,80,152,120,2,'#e8c050');txt(g,'VESTIAIRES',140,162.5,11,'#ffd860');
  R(g,96,286,88,14,'#bdb6a8');                                    /* la marche devant la porte */
  /* l'ombre portée des tribunes sur l'esplanade */
  const os=g.createLinearGradient(0,Y0,0,Y0+34);os.addColorStop(0,'rgba(30,26,20,.32)');os.addColorStop(1,'rgba(30,26,20,0)');g.fillStyle=os;g.fillRect(0,Y0,W,34);}
function anneau(g){
  /* l'esplanade de béton, en dalles */
  R(g,0,Y0,W,H-Y0,'#cdc6b8');for(let y=Y0;y<H;y+=20)R(g,0,y,W,1,'rgba(120,108,90,.18)');for(let y=Y0,k=0;y<H;y+=20,k++)for(let x=(k%2)*20;x<W;x+=40)R(g,x,y,1,20,'rgba(120,108,90,.14)');
  for(let i=0;i<1100;i++){g.fillStyle='rgba(90,80,60,'+(.03+hA(i,1,1)*.05)+')';g.fillRect(hA(i,2,1)*W,Y0+hA(i,3,1)*(H-Y0),1+hA(i,4,1)*2,1);}
  const forme=(r)=>{g.beginPath();g.moveTo(X0,CY-r);g.lineTo(X1,CY-r);g.arc(X1,CY,r,-Math.PI/2,Math.PI/2);g.lineTo(X0,CY+r);g.arc(X0,CY,r,Math.PI/2,Math.PI*1.5);g.closePath();};
  /* la bordure extérieure, son ombre, puis le tartan */
  forme(RO+7);g.fillStyle='rgba(0,0,0,.12)';g.fill();forme(RO+5);g.fillStyle='#e6e2d8';g.fill();
  forme(RO);g.fillStyle='#c65a3c';g.fill();
  g.save();forme(RO);g.clip();
  for(let i=0;i<9000;i++){g.fillStyle=hA(i,7,2)<.5?'rgba(255,210,180,.09)':'rgba(90,20,10,.09)';g.fillRect(X0-RO+hA(i,8,2)*(2*DEMI+2*RO),CY-RO+hA(i,9,2)*2*RO,1,1);}
  /* l'usure du couloir 1, plus foncé là où tout le monde court */
  g.strokeStyle='rgba(90,20,10,.16)';g.lineWidth=LW-3;forme(rC(1));g.stroke();
  g.restore();
  /* la pelouse : des bandes de tonte en damier */
  forme(RI);g.fillStyle='#4c9a46';g.fill();g.save();forme(RI);g.clip();
  for(let x=X0-RI,k=0;x<X1+RI;x+=36,k++)for(let y=CY-RI,j=0;y<CY+RI;y+=36,j++){if((k+j)%2)R(g,x,y,36,36,'rgba(255,255,255,.06)');}
  for(let i=0;i<2500;i++){g.fillStyle=hA(i,3,5)<.5?'rgba(20,60,20,.12)':'rgba(200,255,180,.08)';g.fillRect(X0-RI+hA(i,4,5)*(2*DEMI+2*RI),CY-RI+hA(i,5,5)*2*RI,1,2);}
  /* le terrain au milieu, ses buts */
  g.strokeStyle='rgba(255,255,255,.6)';g.lineWidth=1.4;g.strokeRect(X0+16,CY-96,2*DEMI-32,192);g.beginPath();g.moveTo(CX,CY-96);g.lineTo(CX,CY+96);g.stroke();g.beginPath();g.arc(CX,CY,30,0,7);g.stroke();
  for(const sx of [-1,1]){const gx=CX+sx*(DEMI-16);g.strokeRect(sx<0?gx:gx-50,CY-50,50,100);g.strokeRect(sx<0?gx:gx-18,CY-24,18,48);R(g,sx<0?gx-6:gx,CY-14,6,28,'rgba(255,255,255,.85)');R(g,sx<0?gx-6:gx+5,CY-14,1,28,'#d8d8d8');}
  g.restore();
  /* la bordure intérieure en relief */
  g.lineWidth=3;g.strokeStyle='#f2f2ee';forme(RI);g.stroke();g.lineWidth=1;g.strokeStyle='rgba(0,0,0,.18)';forme(RI-1.6);g.stroke();
  /* les couloirs */
  g.strokeStyle='rgba(255,255,255,.92)';g.lineWidth=1.1;for(let c=1;c<=NC;c++){forme(RI+c*LW);g.stroke();}
  for(let c=1;c<=NC;c++)txt(g,String(c),X0+14,CY-rC(c)+.5,8,'#ffffff');
  /* la ligne d'arrivée : un damier sur les six couloirs, et le poste de chronométrage */
  for(let y=CY-RO;y<CY-RI;y+=3)for(let k=0;k<2;k++)R(g,X0-3+k*3,y,3,3,((y-CY+RO)/3+k)%2<1?'#ffffff':'#1a1a1e');
  R(g,X0-9,CY-RO-30,18,24,'#2a2e36');R(g,X0-7,CY-RO-28,14,10,'#06070a');txt(g,'0.00',X0,CY-RO-23,6,'#ff6a4a');R(g,X0-1,CY-RO-6,2,6,'#5a6068');
  /* les lignes de départ peintes, une par épreuve */
  for(const Q of COURSES){const [sx,sy]=Q.start,[nx,ny]=Q.pts[0],an=Math.atan2(ny-sy,nx-sx);g.save();g.translate(sx,sy);g.rotate(an);
    R(g,-1,-LW/2,2,LW,'#ffffff');g.restore();
    const ox=sy>CY?0:0,oy=sy>CY?-LW*.5-10:LW*.5+10;g.save();g.globalAlpha=.85;txt(g,'DÉPART '+Q.nom,sx+ox,sy+oy,6.5,'#ffffff','800');g.restore();}
  /* le sautoir en longueur : sa piste d'élan, sa planche, son sable */
  R(g,CX-380+40,CY+60,170,10,'#c65a3c');R(g,CX-380+40,CY+60,170,1,'rgba(255,255,255,.6)');R(g,CX-380+40,CY+69,170,1,'rgba(255,255,255,.6)');
  R(g,CX-170,CY+59,6,12,'#f2f2ee');R(g,CX-160,CY+52,80,26,'#c8b07a');R(g,CX-158,CY+54,76,22,'#e8d29a');for(let i=0;i<60;i++)R(g,CX-158+hA(i,6,6)*74,CY+54+hA(i,7,6)*20,1,1,'rgba(160,130,80,.5)');
  /* le saut en hauteur : son tapis bleu, ses poteaux, sa barre */
  R(g,CX+190,CY-74,70,44,'#1f5fa8');R(g,CX+190,CY-74,70,6,'#3a8ad0');R(g,CX+192,CY-66,66,34,'#2a6fba');R(g,CX+184,CY-82,3,22,'#e8e4da');R(g,CX+263,CY-82,3,22,'#e8e4da');R(g,CX+184,CY-82,82,2,'#f5c430');
  /* le lancer du poids : le cercle, son butoir, le secteur */
  g.strokeStyle='#ffffff';g.lineWidth=2;g.beginPath();g.arc(CX+120,CY+60,9,0,7);g.stroke();R(g,CX+128,CY+56,3,8,'#f2f2ee');
  g.lineWidth=1;g.strokeStyle='rgba(255,255,255,.55)';g.beginPath();g.moveTo(CX+129,CY+60);g.lineTo(CX+250,CY+20);g.moveTo(CX+129,CY+60);g.lineTo(CX+250,CY+100);g.stroke();
  /* des haies rangées au bord de l'esplanade, un banc d'athlètes, la fontaine à eau */
  for(let k=0;k<5;k++){const x=1240+k*5,y=320+k*3;R(g,x,y,30,2,'#ffffff');R(g,x+2,y+2,1.4,6,'#2a2e36');R(g,x+26,y+2,1.4,6,'#2a2e36');R(g,x,y,10,2,'#1a1a1e');R(g,x+20,y,10,2,'#1a1a1e');}
  R(g,300,316,90,8,'#2a6fba');R(g,300,316,90,2,'#4a8ad0');R(g,304,324,3,4,'#2a2e36');R(g,383,324,3,4,'#2a2e36');for(const x of [318,346,368])R(g,x,311,10,6,['#e84a3a','#1a1a22','#f5c430'][(x/10|0)%3]);
  R(g,420,312,10,14,'#3a8ad0');R(g,421,308,8,5,'#a8e0ff');
  /* la grille du bas, des lauriers-roses, et son portail ouvert vers la Joliette */
  for(let x=0;x<W;x+=46){if(Math.abs(x-CX)<70)continue;const c=['#e8708a','#f2a8b8','#ffffff'][(x/46|0)%3];for(let i=0;i<14;i++){g.fillStyle=i%3?'#3a7a3a':c;g.beginPath();g.arc(x+hA(x,i,1)*30,H-30+hA(x,i,2)*12,3+hA(x,i,3)*3,0,7);g.fill();}}
  for(let x=0;x<W;x+=8){if(Math.abs(x-CX)<34)continue;R(g,x,H-26,2,22,'#2f4f2f');}R(g,0,H-26,CX-34,2,'#2f4f2f');R(g,CX+34,H-26,W-CX-34,2,'#2f4f2f');
  R(g,CX-38,H-34,6,30,'#243a24');R(g,CX+32,H-34,6,30,'#243a24');R(g,CX-60,H-48,120,12,'#16213a');txt(g,'SORTIE · JOLIETTE',CX,H-42,8,'#ffd860','800');}
function peindreSol(g){tribune(g);anneau(g);}
function sol(){const c=document.createElement('canvas');c.width=W;c.height=H;peindreSol(c.getContext('2d'));return c;}
function solFin(){const c=document.createElement('canvas');c.width=W*2;c.height=H*2;const g=c.getContext('2d');g.setTransform(2,0,0,2,0,0);peindreSol(g);return c;}

/* ---------- LES TENUES D'ATHLÈTE ----------
   Pas de sac sur la piste : débardeur, short, chaussures de course. On les
   choisit aux vestiaires ; le moteur les porte à la place des habits de ville
   tant qu'on est ici (window.AP_FORCE). */
const KITS=[{n:'Phocéen',haut:'#7ac8f0',bas:'#ffffff'},{n:'Massilia',haut:'#ffffff',bas:'#1f5fa8'},{n:'Calanques',haut:'#1a1a22',bas:'#1a1a22',f:'#f5c430'},{n:'Provence',haut:'#e84a3a',bas:'#ffffff'},{n:'Garrigue',haut:'#2e8a4a',bas:'#f2ead6'},{n:'Soleil',haut:'#f5c430',bas:'#1a1a22'}];
const SOULIERS=[{n:'Fluo',c:'#c8ff3a'},{n:'Corail',c:'#ff6a4a'},{n:'Glacier',c:'#5ae0ff'},{n:'Néon rose',c:'#ff4ab8'},{n:'Blanc pur',c:'#f6f6f6'},{n:'Noir mat',c:'#26262c'}];
function kit(){let k={k:0,s:0};try{if(e.kitAthle&&typeof e.kitAthle==='object')k=e.kitAthle;}catch(x){}const K=KITS[k.k%KITS.length],S=SOULIERS[k.s%SOULIERS.length];
  return {haut:4,veste:K.haut,_motif:0,motif:0,raye:0,bas:1,pantalon:K.bas,souliers:1,chaussures:S.c,sac:0,chapeau:0,cos:0,deguisement:0,maillot:0,gilet:0,patin:0,_civil:true};}
function porter(){try{window.AP_FORCE=kit();}catch(x){}}
porter();
function vestiaires(){if(document.getElementById('pstV'))return;let sel={k:0,s:0};try{if(e.kitAthle)sel=Object.assign({},e.kitAthle);}catch(x){}
  const d=document.createElement('div');d.id='pstV';
  d.style.cssText='position:fixed;inset:0;z-index:2147482500;background:rgba(10,16,24,.55);display:flex;align-items:flex-end;justify-content:center;font-family:"Baloo 2",system-ui,sans-serif';
  const carte=(i,a,on)=>'<button data-'+a+'="'+i+'" style="all:unset;box-sizing:border-box;cursor:pointer;text-align:center;background:'+(on?'#fff6d8':'#fff')+';border:3px solid '+(on?'#16213a':'#e2d8c6')+';border-radius:6px;padding:4px 2px 6px;box-shadow:0 3px 0 '+(on?'#16213a':'#e2d8c6')+'"><canvas width="96" height="128" style="width:48px;height:64px;image-rendering:pixelated;display:block;margin:0 auto"></canvas><span style="font:800 11px ui-monospace,monospace;color:#16213a">'+(a==='k'?KITS[i].n:SOULIERS[i].n)+'</span></button>';
  const rendre=()=>{d.innerHTML='<div style="width:min(460px,100%);max-height:88vh;overflow-y:auto;background:#f6efdc;border-radius:22px 22px 0 0;border-top:4px solid #16213a;padding:12px 16px calc(18px + env(safe-area-inset-bottom));box-shadow:0 -10px 30px rgba(0,0,0,.35)">'+
    '<div style="width:44px;height:5px;border-radius:3px;background:#d8ccb4;margin:0 auto 8px"></div><div style="text-align:center;font:900 22px Georgia,serif;color:#16213a">Les vestiaires</div>'+
    '<div style="text-align:center;font:700 12px ui-monospace,monospace;color:#6a5a40;margin-bottom:10px">Sur la piste, on court léger : pas de sac.</div>'+
    '<div style="font:900 11px ui-monospace,monospace;letter-spacing:2px;color:#c0392b;margin:4px 0 6px">LE MAILLOT ET LE SHORT</div><div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px">'+KITS.map((_,i)=>carte(i,'k',i===sel.k)).join('')+'</div>'+
    '<div style="font:900 11px ui-monospace,monospace;letter-spacing:2px;color:#c0392b;margin:12px 0 6px">LES CHAUSSURES DE COURSE</div><div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px">'+SOULIERS.map((_,i)=>carte(i,'s',i===sel.s)).join('')+'</div>'+
    '<button data-ok="1" style="all:unset;box-sizing:border-box;display:block;width:100%;margin-top:14px;text-align:center;background:#16213a;color:#ffd860;border:4px solid #e8c050;box-shadow:0 0 0 3px #16213a;border-radius:4px;padding:12px;font:900 15px ui-monospace,monospace;letter-spacing:2px;cursor:pointer">ENFILER LA TENUE</button></div>';
    d.querySelectorAll('canvas').forEach(cv=>{const b=cv.parentNode,isK=b.dataset.k!==undefined,i=+(isK?b.dataset.k:b.dataset.s);const q=cv.getContext('2d');q.imageSmoothingEnabled=false;
      const keep=window.AP_FORCE;const save=e.kitAthle;e.kitAthle=isK?{k:i,s:sel.s}:{k:sel.k,s:i};const ap=Object.assign({},e.ap||{},kit());e.kitAthle=save;window.AP_FORCE=keep;
      q.setTransform(2,0,0,2,0,0);try{personne(q,24,60,ap,'bas',0,false);}catch(x){}});};
  rendre();document.body.appendChild(d);
  d.addEventListener('click',ev=>{const b=ev.target.closest('button');if(!b){if(ev.target===d)d.remove();return;}
    if(b.dataset.k!==undefined){sel.k=+b.dataset.k;rendre();}else if(b.dataset.s!==undefined){sel.s=+b.dataset.s;rendre();}
    else if(b.dataset.ok){e.kitAthle=sel;porter();try{sauver();}catch(x){}d.remove();try{texteVolant(joueur.x,joueur.y-70,'Tenue enfilée !','#ffd860');}catch(x){}try{vibrer(12);}catch(x){}}});}

/* ---------- LE DÉCOR (des points d'action, tout le reste est au sol) ---------- */
function decor(){const D=[];const P=(t,x,y,o)=>D.push(Object.assign({t,x,y,gr:0},o||{}));
  P('x_jol_pst_vide_sol',140,Y0+30,{col:[1,1],demi:60,agir:vestiaires,libelle:'Se changer',nom:'VESTIAIRES'});
  P('x_jol_pst_vide_sol',CX,Y0+12,{col:[1,1],parler:['Le tableau garde tes meilleurs temps.','Les damiers sur la piste : marche dessus pour lancer une course.','100 m, 400 m, 800 m. Gère ton souffle !']});
  return D;}
const GRAVEURS={x_jol_pst_vide_sol:()=>({toile:document.createElement('canvas'),W:1,H:1,sol:0})};
function graver(t,v){const r=(GRAVEURS[t]||GRAVEURS.x_jol_pst_vide_sol)(v||0);return {toile:r.toile,W:r.W,H:r.H,sol:r.sol};}

/* ---------- LES ATHLÈTES QUI S'ENTRAÎNENT, LES GENS QUI PASSENT ----------
   Les coureurs prennent la vraie foulée de course (enCourse) et leur pas
   avance au même rythme que celui du joueur : CADENCE_PAS × distance. */
const D8=a=>{const k=Math.round(a/(Math.PI/4));return {0:'droite',1:'bas-droite',2:'bas',3:'bas-gauche',4:'gauche','-4':'gauche','-3':'haut-gauche','-2':'haut','-1':'haut-droite'}[k];};
const CAD=(()=>{try{return CADENCE_PAS;}catch(x){return 0.09;}})();
const GENS=[];
(()=>{const peau=[1,3,5,2,6,4];for(let i=0;i<5;i++){const K=KITS[(i+2)%KITS.length];
  GENS.push({c:2+i%5,v:128+i*8,dec:i*700,court:true,ap:{peau:peau[i%6],cheveux:[1,4,6,0,10][i],coiffe:[0,6,2,0,5][i],barbe:i===1?3:0,haut:4,veste:K.haut,pantalon:K.bas,bas:1,souliers:1,chaussures:SOULIERS[(i+1)%6].c,sac:0,chapeau:0,raye:0,motif:0,_civil:true},x:0,y:0,dir:'gauche',pas:0});}
 /* les promeneurs : un entraîneur, deux spectateurs, sur l'esplanade */
 const TOURS=[{pts:[[300,340],[1300,340]],v:34},{pts:[[1500,360],[1500,740],[1100,770],[1500,740]],v:30},{pts:[[110,420],[110,740],[420,770],[110,740]],v:28}];
 TOURS.forEach((T,i)=>{let L=0;const seg=[];for(let k=0;k<T.pts.length;k++){const a=T.pts[k],b=T.pts[(k+1)%T.pts.length],d=Math.hypot(b[0]-a[0],b[1]-a[1]);seg.push([a,b,L,d]);L+=d;}
  GENS.push({tour:{seg,L,v:T.v},court:false,ap:{peau:[2,5,1][i],cheveux:[2,0,7][i],coiffe:[3,0,1][i],barbe:i===0?2:0,haut:[0,1,3][i],veste:['#c0392b','#2a3a5a','#f5c430'][i],pantalon:['#1a1a22','#5a6a7a','#2a3a5a'][i],bas:0,souliers:1,chaussures:'#f2f2f2',sac:0,chapeau:0,raye:0,motif:0,_civil:true},x:0,y:0,dir:'bas',pas:0});});})();
function figurants(){const now=Date.now()/1000;
  for(const P of GENS){
    if(P.tour){const T=P.tour,d=(now*T.v)%T.L;for(const [a,b,L0,dd] of T.seg){if(d<=L0+dd){const t=(d-L0)/dd;P.x=a[0]+(b[0]-a[0])*t;P.y=a[1]+(b[1]-a[1])*t;P.dir=D8(Math.atan2(b[1]-a[1],b[0]-a[0]));break;}}P.pas=now*T.v*CAD;continue;}
    const r=rC(P.c),s=now*P.v+P.dec,[x,y]=pos(s,r),[x2,y2]=pos(s+6,r);P.x=x;P.y=y;P.dir=D8(Math.atan2(y2-y,x2-x));P.pas=s*CAD;}
  return GENS;}

function bloque(x,y){
  if(x<12||x>W-12)return true;
  if(y<Y0+8)return true;
  if(y>H-28&&Math.abs(x-CX)>30)return true;
  if(y>H-4)return true;
  return false;}

/* LA SORTIE : par le portail du bas, on rentre sur la place de la Joliette */
let PARTI=false;
setInterval(()=>{try{if(PARTI||typeof joueur==='undefined')return;if(joueur.y>H-12)sortir();}catch(x){}},150);
function sortir(){if(PARTI)return;PARTI=true;try{window.AP_FORCE=null;}catch(x){}try{sauver();}catch(x){}
  try{const f=document.createElement('div');f.style.cssText='position:fixed;inset:0;z-index:2147483000;background:#fff8ea;opacity:0;transition:opacity .45s;pointer-events:none';document.body.appendChild(f);requestAnimationFrame(()=>f.style.opacity='1');}catch(x){}
  setTimeout(()=>{const v=window.MA_VERSION?('&v='+encodeURIComponent(window.MA_VERSION)):'';location.href='spawn.html?de=piste'+v;},480);}

return {sol,solFin,decor,bloque,graver,depart:DEPART,figurants,courses:COURSES};
})()
