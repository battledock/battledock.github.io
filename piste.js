/* =====================================================================
   LA PISTE — le stade d'athlétisme (piste.html), un lieu à part entière.
   La tribune monte à la verticale au fond ; tout le reste est posé au sol :
   l'anneau de 400 m en tartan rouge, six couloirs, la pelouse et ses
   aires de sauts, la grille du bas par où l'on rentre à la Joliette.
   On y court en tenue d'athlète (choisie aux vestiaires) : 100 m, 400 m,
   800 m, contre son propre fantôme. Chargé par moteur.js (eval direct).
   ===================================================================== */
(()=>{
const W=2000, H=1040, Y0=380;
const CX=1000, CY=712, DEMI=470, LW=18, NC=6, RI=150;   /* l'anneau : centre, demi-ligne droite, couloirs, rayon intérieur */
const RO=RI+LW*NC;
const X0=CX-DEMI, X1=CX+DEMI;
const DEPART=[1000,1000];
const hA=(x,y,k)=>{let n=((x*73856093)^(y*19349663)^(k*83492791))|0;n=(n^(n>>>13))*1274126177|0;return((n^(n>>>16))>>>0)/4294967296;};
const R=(g,x,y,w,h,c)=>{g.fillStyle=c;g.fillRect(x,y,w,h);};
function fe(g,cx,cy,rx,ry,pal,n,seed,t){t=t||1;for(let i=0;i<n;i++){const a=hA(i,seed,1)*Math.PI*2,r=Math.sqrt(hA(i,seed,2));const x=cx+Math.cos(a)*rx*r,y=cy+Math.sin(a)*ry*r;
  const lum=((cx-x)/rx+(cy-y)/ry)*.5+hA(i,seed,3)*.4;g.fillStyle=lum>.55?pal[3]:lum>.15?pal[2]:lum>-.3?pal[1]:pal[0];
  g.beginPath();g.ellipse(x,y,(1.2+hA(i,seed,4)*1.6)*t,(.9+hA(i,seed,5)*1)*t,hA(i,seed,6)*3,0,7);g.fill();}}
const OLIV=['#4a5a34','#6a7a4a','#8a9a64','#b0bc88'],LAUR=['#2f5a2a','#45773a','#5e9450','#82b06a'];
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
/* LES LIGNES DE DÉPART : un tour du couloir 1 fait 400 m. Chaque ligne ouvre la course,
   qui se court dans son propre écran (course.js), contre cinq adversaires. */
const L1=longueur(rC(1)),M=L1/400;
const DEPARTS=[{ep:['100','100h'],s:L1-100*M,nom:'100 M · 100 M HAIES'},{ep:['400','400h','4x100'],s:Math.PI*rC(1)+2*DEMI*.22,nom:'400 M · HAIES · RELAIS'},{ep:['800'],s:Math.PI*rC(1)+2*DEMI*.78,nom:'800 M'}];
DEPARTS.forEach(D=>{D.p=pos(D.s,rC(1));D.q=pos(D.s+6,rC(1));});
async function courir(ep){try{if(!window.ouvrirCourse)eval(await chargerMorceau('course.js'));window.ouvrirCourse(ep,{kit:kit(),ap:e.ap});}catch(x){console.warn('COURSE',x);}}
/* ---------- LE SOL ---------- */
/* la foule : de vrais petits personnages, dessinés comme ceux du jeu, assis rang par rang */
const FANS=(()=>{const L=[],cols=['#e84a3a','#f5c430','#ffffff','#3ac0e8','#7ee08a','#1a1a22','#ff8ab8','#7ac8f0','#2a6fba','#f28a2a'];
  for(let i=0;i<18;i++)L.push({peau:1+(i*5)%6,cheveux:(i*7)%11,coiffe:(i*3)%8,barbe:i%5===0?2:0,haut:[0,1,3,4][i%4],veste:cols[(i*3)%cols.length],pantalon:'#2a3a5a',bas:0,souliers:1,chaussures:'#f2f2f2',sac:0,chapeau:i%7===3?1:0,raye:0,motif:0,_civil:true});return L;})();
function foule(g,x0,x1,y0,rangs,hr,dens,exclu){
  for(let r=0;r<rangs;r++){const yb=y0+(r+1)*hr,prof=r/(rangs-1),sc=.74+.1*prof,sb=Math.round((1-prof)*-26),C=(h)=>{const v=parseInt(h.slice(1),16),f=k=>Math.max(0,Math.min(255,((v>>k)&255)+sb));return 'rgb('+f(16)+','+f(8)+','+f(0)+')';};
    /* la marche du gradin, son nez de béton */
    R(g,x0,yb-hr,x1-x0,hr,C('#2b6cb8'));R(g,x0,yb-hr,x1-x0,3,C('#d8d4ca'));R(g,x0,yb-hr+3,x1-x0,2,C('#9a968c'));
    const pas=24;
    for(let x=x0+12+(r%2)*12;x<x1-10;x+=pas){if(exclu&&exclu(x,yb))continue;const esc=((x-x0+40)%320)<26;
      if(esc){R(g,x-12,yb-hr,24,hr,C('#c8c2b6'));for(let k=0;k<3;k++)R(g,x-12,yb-hr+k*(hr/3),24,2,C('#a8a296'));R(g,x+11,yb-hr,2,hr,C('#8a929c'));continue;}
      const h=hA(x,r,9),d=dens*(.55+.45*Math.max(0,1-Math.abs(x-CX)/1000));
      /* le siège : coque bleue moulée */
      R(g,x-8,yb-21,16,13,C('#3a8ad8'));R(g,x-8,yb-21,16,3,C('#6aaaf0'));R(g,x-8,yb-9,16,2,C('#1f5596'));
      if(h<d){g.save();g.translate(x,yb-6);g.scale(sc,sc);try{personne(g,0,0,FANS[(h*997|0)%FANS.length],'bas',0,false);}catch(z){}g.restore();
        if(h<d*.07){const fc=['#ffffff','#7ac8f0','#f5c430','#e84a3a'][(h*400|0)%4];R(g,x+9,yb-62,1.5,30,'#d8dce2');R(g,x+10.5,yb-62,18,11,fc);R(g,x+10.5,yb-62,18,2,'rgba(255,255,255,.4)');}}}
    /* le dossier de la rangée devant cache les jambes */
    R(g,x0,yb-8,x1-x0,8,C('#2766b0'));R(g,x0,yb-8,x1-x0,2,C('#4a86d0'));R(g,x0,yb-1,x1-x0,1,'rgba(0,0,0,.3)');}}
function tribune(g){
  /* le ciel du soir derrière le toit, quelques nuages */
  const sk=g.createLinearGradient(0,0,0,90);sk.addColorStop(0,'#4a7cc8');sk.addColorStop(1,'#bfe0f6');g.fillStyle=sk;g.fillRect(0,0,W,90);
  for(let i=0;i<11;i++){const x=hA(i,1,4)*W,y=10+hA(i,2,4)*30;g.fillStyle='rgba(255,255,255,.55)';for(const [dx,dy,r] of [[0,0,8],[10,-3,10],[21,0,8],[10,3,8]]){g.beginPath();g.arc(x+dx,y+dy,r,0,7);g.fill();}}
  /* les mâts de projecteurs */
  for(const x of [330,1670]){R(g,x-4,0,8,84,'#7a828c');R(g,x-4,0,3,84,'#a8b0ba');R(g,x-30,4,60,32,'#2a2e36');for(let i=0;i<5;i++)for(let j=0;j<2;j++){R(g,x-27+i*11,7+j*14,9,11,'#fff6d0');R(g,x-27+i*11,7+j*14,9,3,'#ffffff');}}
  /* le toit en porte-à-faux, ses poutres, ses drapeaux */
  R(g,0,60,W,30,'#26314a');R(g,0,60,W,4,'#5a6a8e');R(g,0,88,W,3,'#141a28');for(let x=20;x<W;x+=90){R(g,x,64,5,24,'#1a2236');R(g,x,64,1.5,24,'#3a4866');}
  for(let i=0;i<12;i++){const x=90+i*165,c=['#e84a3a','#ffffff','#7ac8f0','#f5c430','#2e8a4a'][i%5];R(g,x,34,1.6,26,'#d8dce2');g.fillStyle=c;g.beginPath();g.moveTo(x+1.6,34);g.lineTo(x+20,39+Math.sin(i)*2);g.lineTo(x+1.6,45);g.fill();}
  /* la foule, sur huit rangs ; le grand écran et les vestiaires prennent leur place */
  const ecran=(x,yb)=>Math.abs(x-CX)<225&&yb<270,vest=(x)=>x<310,shop=(x,yb)=>x>320&&x<660&&yb>200;
  foule(g,0,W,91,5,41.6,.92,(x,yb)=>ecran(x,yb)||vest(x)||shop(x,yb));
  const om=g.createLinearGradient(0,91,0,150);om.addColorStop(0,'rgba(10,16,30,.5)');om.addColorStop(1,'rgba(10,16,30,0)');g.fillStyle=om;g.fillRect(300,91,W-300,59);
  /* le grand écran, sur ses pieds */
  R(g,CX-210,98,420,150,'#2a2e36');R(g,CX-203,105,406,136,'#06070a');R(g,CX-210,98,420,4,'#4a4e58');for(let y=107;y<240;y+=2)R(g,CX-201,y,402,1,'rgba(255,255,255,.025)');
  for(const ax of [CX-196,CX+180]){R(g,ax,248,16,52,'#3a3e48');R(g,ax,248,4,52,'#5a606a');}
  /* le mur des tribunes, ses bâches publicitaires */
  R(g,0,299,W,81,'#ece8de');R(g,0,299,W,3,'#ffffff');for(let x=0;x<W;x+=60){R(g,x,302,1,66,'rgba(120,110,90,.14)');}for(let i=0;i<300;i++)R(g,hA(i,4,8)*W,302+hA(i,5,8)*64,1+hA(i,6,8)*2,1,'rgba(120,110,90,.12)');
  R(g,0,362,W,8,'#d6cfc0');R(g,0,362,W,2,'#f2ede2');R(g,0,370,W,10,'#bdb6a8');R(g,0,368,W,2,'#d8d2c4');
  const BACHES=[['ALLEZ !','#c0392b'],['MARSEILLE','#1f5fa8'],['ATHLÉ 13','#2e8a4a'],['400 M','#e8702a'],['RECORDS','#5a2ab0'],['SAVON DE M.','#2a8ab0']];
  for(let i=0,x=330;x<W-60;x+=200,i++){if(x<680)continue;const [t,c]=BACHES[i%BACHES.length];R(g,x-2,314,174,40,'rgba(0,0,0,.18)');R(g,x,312,170,38,c);const gr=g.createLinearGradient(0,312,0,350);gr.addColorStop(0,'rgba(255,255,255,.22)');gr.addColorStop(.5,'rgba(255,255,255,0)');gr.addColorStop(1,'rgba(0,0,0,.18)');g.fillStyle=gr;g.fillRect(x,312,170,38);
   for(const ox of [4,160])R(g,x+ox,315,5,5,'#d8dce2');for(const ox of [4,160])R(g,x+ox,342,5,5,'#d8dce2');txt(g,t,x+86,332,17,'rgba(0,0,0,.25)');txt(g,t,x+85,331,17,'#fff');}
  /* L'ATHLÉ SHOP : une boutique creusée sous la tribune. Store rayé, grande vitrine
     (un mannequin en tenue, des chaussures sur des socles), enseigne lumineuse. */
  {const sx=330,sw=320,st=214,sol=380;
   R(g,sx-6,st-6,sw+12,sol-st+6,'#2a2e36');R(g,sx,st,sw,sol-st,'#3a3e46');
   /* l'enseigne */
   R(g,sx+40,st+4,sw-80,26,'#16213a');R(g,sx+40,st+4,sw-80,2,'#e8c050');R(g,sx+40,st+28,sw-80,2,'#e8c050');txt(g,'ATHLÉ SHOP',sx+sw/2,st+17.5,15,'#ffd860');
   for(const ax of [sx+28,sx+sw-36]){R(g,ax,st+10,8,14,'#fff2b0');R(g,ax,st+10,8,3,'#ffffff');}
   /* le store rayé rouge et blanc, son festonnage */
   for(let x=sx-8;x<sx+sw+8;x+=16){R(g,x,st+34,8,18,'#d8402a');R(g,x+8,st+34,8,18,'#f6f0e2');g.fillStyle=((x-sx)/16|0)%2?'#f6f0e2':'#d8402a';g.beginPath();g.arc(x+4,st+52,4,0,Math.PI);g.fill();g.fillStyle='#f6f0e2';g.beginPath();g.arc(x+12,st+52,4,0,Math.PI);g.fill();}
   R(g,sx-8,st+32,sw+16,3,'#a83020');
   /* la vitrine : fond lumineux, reflets */
   const vx=sx+14,vy=st+62,vw=170,vh=sol-st-74;const vg=g.createLinearGradient(0,vy,0,vy+vh);vg.addColorStop(0,'#fff6dc');vg.addColorStop(1,'#e8d8b0');g.fillStyle=vg;g.fillRect(vx,vy,vw,vh);
   /* un mannequin en tenue de course, sur son pied */
   R(g,vx+34,vy+vh-6,20,4,'#8a929c');R(g,vx+43,vy+vh-22,2,16,'#8a929c');
   g.save();g.translate(vx+44,vy+vh-14);g.scale(.95,.95);try{personne(g,0,0,{peau:0,cheveux:7,coiffe:0,haut:4,veste:'#e84a3a',pantalon:'#1a1a22',bas:1,souliers:1,chaussures:'#ffd040',sac:0,_civil:true,_pnj:true},'bas',0,false);}catch(z){}g.restore();
   /* les chaussures sur leurs socles */
   const CH=['#c8ff3a','#ff6a4a','#5ae0ff','#ffd040'];CH.forEach((c,k)=>{const bx=vx+82+k*22,by=vy+vh-18-(k%2)*16;R(g,bx,by,18,4,'#f2ede2');R(g,bx,by+4,18,14+(k%2)*16,'#d8d2c4');
    R(g,bx+2,by-5,14,5,c);R(g,bx+2,by-1,14,1,'#f6f6f6');R(g,bx+11,by-8,5,3,c);R(g,bx+3,by-4,2,1,'rgba(255,255,255,.6)');});
   g.fillStyle='rgba(255,255,255,.35)';g.beginPath();g.moveTo(vx,vy);g.lineTo(vx+30,vy);g.lineTo(vx,vy+40);g.fill();g.beginPath();g.moveTo(vx+90,vy);g.lineTo(vx+104,vy);g.lineTo(vx+70,vy+vh);g.lineTo(vx+56,vy+vh);g.fill();
   R(g,vx-3,vy-3,vw+6,3,'#8a929c');R(g,vx-3,vy+vh,vw+6,3,'#8a929c');R(g,vx-3,vy,3,vh,'#8a929c');R(g,vx+vw,vy,3,vh,'#8a929c');
   /* la porte vitrée ouverte, et le tapis */
   const dx=sx+202,dw=100;R(g,dx,vy,dw,vh,'#1a1e26');R(g,dx+4,vy+4,dw/2-6,vh-4,'#4a6a80');R(g,dx+dw/2+2,vy+4,dw/2-6,vh-4,'#4a6a80');
   R(g,dx+10,vy+14,dw-20,vh-24,'#f6e8c8');for(let k=0;k<5;k++)R(g,dx+14+k*14,vy+22,10,22,['#e84a3a','#1f5fa8','#2e8a4a','#f5c430','#ffffff'][k]);   /* les maillots aux cintres, au fond */
   R(g,dx+14,vy+20,dw-28,2,'#8a929c');
   R(g,dx-6,sol-4,dw+12,4,'#c0392b');}
  /* LES VESTIAIRES, à gauche : un pavillon de club, en pierre claire de Marseille,
     toit de tuiles canal, enseigne émaillée, double porte vitrée, volets bleus. */
  {const bx=26,by=188,bw=270,bh=192,sol=380;
   /* l'ombre portée sur l'esplanade */
   g.fillStyle='rgba(40,30,20,.22)';g.beginPath();g.moveTo(bx+bw,sol);g.lineTo(bx+bw+26,sol+14);g.lineTo(bx+26,sol+14);g.lineTo(bx,sol);g.fill();
   /* la façade en moellons */
   R(g,bx,by,bw,bh,'#e6dcc6');
   for(let y=by+4,k=0;y<sol-14;y+=9,k++)for(let x=bx+((k%2)*13);x<bx+bw;x+=26){const t=hA(x,y,2);R(g,x,y,25,8,t<.33?'#ede4d0':t<.66?'#e2d7c0':'#dccfb6');R(g,x,y+8,25,1,'rgba(120,100,70,.22)');R(g,x+25,y,1,8,'rgba(120,100,70,.18)');}
   /* le soubassement en pierre plus sombre, et les chaînes d'angle */
   R(g,bx,sol-16,bw,16,'#b8ab92');R(g,bx,sol-16,bw,2,'#d0c4aa');for(let x=bx;x<bx+bw;x+=30)R(g,x,sol-16,1,16,'rgba(80,60,40,.3)');
   for(const cx2 of [bx,bx+bw-14])for(let y=by,k=0;y<sol-16;y+=14,k++)R(g,cx2+(k%2?2:0),y,12,13,k%2?'#d6caae':'#cfc2a4');
   /* le toit de tuiles canal, avec sa génoise */
   R(g,bx-10,by-6,bw+20,6,'#f2ead8');R(g,bx-10,by-2,bw+20,2,'#c8bc9e');
   for(let r=0;r<3;r++){const yy=by-26+r*7;for(let x=bx-14+(r%2)*6;x<bx+bw+14;x+=12){R(g,x,yy,11,8,r===2?'#a8442a':'#c0583a');R(g,x,yy,11,2,'#d8805a');R(g,x+10,yy,1,8,'#7a2a18');}}
   R(g,bx-16,by-30,bw+32,5,'#8a3420');R(g,bx-16,by-30,bw+32,2,'#b85a3c');
   /* l'enseigne émaillée, bleu de France, lettres d'or, deux appliques */
   const ex=bx+bw/2-86,ey=by+14;R(g,ex-3,ey-3,178,32,'#0f1830');R(g,ex,ey,172,26,'#1f3f86');R(g,ex+3,ey+3,166,20,'#2a52a0');R(g,ex+3,ey+3,166,2,'#4a7ad0');
   txt(g,'VESTIAIRES',ex+86,ey+14,15,'#ffd860');for(const ax of [ex-14,ex+178]){R(g,ax,ey+4,8,4,'#2a2e36');R(g,ax+1,ey+8,6,8,'#fff2b0');R(g,ax+1,ey+8,6,2,'#ffffff');}
   /* la marquise vitrée au-dessus des portes */
   R(g,bx+bw/2-58,by+60,116,6,'#2a3a4a');for(let x=bx+bw/2-56;x<bx+bw/2+58;x+=14)R(g,x,by+66,2,6,'#2a3a4a');R(g,bx+bw/2-58,by+58,116,2,'#a8d0e8');
   /* la double porte vitrée */
   const px=bx+bw/2-40,py=by+76,pw=80,ph=sol-16-py;R(g,px-6,py-6,pw+12,ph+6,'#cfc2a4');R(g,px-4,py-4,pw+8,ph+4,'#3a2a1a');
   for(const ox of [0,pw/2+1]){R(g,px+ox,py,pw/2-1,ph,'#5a3a22');R(g,px+ox+5,py+6,pw/2-11,ph*.55,'#9cc8e0');R(g,px+ox+5,py+6,pw/2-11,6,'#cfe6f2');R(g,px+ox+5,py+6+ph*.3,pw/2-11,2,'#5a3a22');
    g.fillStyle='rgba(255,255,255,.35)';g.beginPath();g.moveTo(px+ox+7,py+8);g.lineTo(px+ox+16,py+8);g.lineTo(px+ox+7,py+28);g.fill();
    R(g,px+ox+5,py+ph*.68,pw/2-11,ph*.25,'#6a4628');R(g,px+ox+7,py+ph*.7,pw/2-15,ph*.21,'#7a5232');}
   R(g,px+pw/2-5,py+ph*.5,3,12,'#e8c050');R(g,px+pw/2+3,py+ph*.5,3,12,'#e8c050');
   /* deux fenêtres à volets bleus, un pictogramme de coureur */
   for(const wx of [bx+30,bx+bw-82]){R(g,wx-12,by+92,12,52,'#2a6fba');R(g,wx+52,by+92,12,52,'#2a6fba');for(let k=0;k<6;k++){R(g,wx-12,by+95+k*8,12,2,'#1f5596');R(g,wx+52,by+95+k*8,12,2,'#1f5596');}
    R(g,wx-2,by+88,56,60,'#cfc2a4');R(g,wx,by+90,52,52,'#f6f0e0');R(g,wx+3,by+93,46,46,'#7aaed0');R(g,wx+3,by+93,46,14,'#a8d0e8');R(g,wx+25,by+93,2,46,'#f6f0e0');R(g,wx+3,by+114,46,2,'#f6f0e0');
    R(g,wx-4,by+146,60,5,'#cfc2a4');R(g,wx-2,by+141,56,5,'#3a6a3a');for(let k=0;k<7;k++){g.fillStyle=['#e84a3a','#f2a8b8','#ffffff','#e84a3a'][k%4];g.beginPath();g.arc(wx+3+k*7.5,by+140,2.4,0,7);g.fill();}}
   R(g,bx+bw/2-12,by+40,24,14,'#ffffff');g.strokeStyle='#1f3f86';g.lineWidth=2;g.lineCap='round';const cx3=bx+bw/2,cy3=by+47;
   g.beginPath();g.moveTo(cx3-1,cy3-3);g.lineTo(cx3-3,cy3+2);g.lineTo(cx3+1,cy3+5);g.moveTo(cx3-3,cy3+2);g.lineTo(cx3-7,cy3+4);g.moveTo(cx3-1,cy3-1);g.lineTo(cx3+4,cy3);g.moveTo(cx3-1,cy3-1);g.lineTo(cx3-5,cy3-1);g.stroke();g.fillStyle='#1f3f86';g.beginPath();g.arc(cx3+1,cy3-6,1.8,0,7);g.fill();g.lineCap='butt';
   /* les trois marches, deux pots d'olivier, un banc */
   for(let k=0;k<3;k++)R(g,px-14-k*6,sol-16+k*5+16-15,pw+28+k*12,5,k%2?'#c8bca2':'#d6cab0');
   for(const ox of [px-34,px+pw+18]){R(g,ox,sol-30,18,16,'#b8603a');R(g,ox-2,sol-32,22,4,'#d0784a');R(g,ox+2,sol-28,14,2,'rgba(0,0,0,.2)');
    for(let k=0;k<16;k++){g.fillStyle=k%3?'#6a8a4a':'#8aa86a';g.beginPath();g.arc(ox+9+Math.cos(k*1.7)*9*hA(k,ox,3),sol-42-Math.abs(Math.sin(k*2.3))*12,3.4,0,7);g.fill();}R(g,ox+8,sol-40,2,10,'#6a4a2a');}
   R(g,bx+18,sol-6,60,4,'#7a5232');R(g,bx+18,sol-10,60,3,'#9a6a42');R(g,bx+22,sol-2,3,4,'#3a2a1a');R(g,bx+71,sol-2,3,4,'#3a2a1a');}
  /* l'ombre portée des tribunes sur l'esplanade */
  const os=g.createLinearGradient(0,Y0,0,Y0+40);os.addColorStop(0,'rgba(30,26,20,.32)');os.addColorStop(1,'rgba(30,26,20,0)');g.fillStyle=os;g.fillRect(0,Y0,W,40);}
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
  g.strokeStyle='rgba(255,255,255,.92)';g.lineWidth=1.6;for(let c=1;c<=NC;c++){forme(RI+c*LW);g.stroke();}
  for(let c=1;c<=NC;c++)txt(g,String(c),X0+18,CY-rC(c)+.5,11,'#ffffff');
  /* la ligne d'arrivée : un damier sur les six couloirs, et le poste de chronométrage */
  for(let y=CY-RO;y<CY-RI;y+=4)for(let k=0;k<2;k++)R(g,X0-4+k*4,y,4,4,((y-CY+RO)/4+k)%2<1?'#ffffff':'#1a1a1e');
  R(g,X0-9,CY-RO-30,18,24,'#2a2e36');R(g,X0-7,CY-RO-28,14,10,'#06070a');txt(g,'0.00',X0,CY-RO-23,6,'#ff6a4a');R(g,X0-1,CY-RO-6,2,6,'#5a6068');
  /* les lignes de départ peintes, une par épreuve */
  for(const Q of DEPARTS){const [sx,sy]=Q.p,[nx,ny]=Q.q,an=Math.atan2(ny-sy,nx-sx);g.save();g.translate(sx,sy);g.rotate(an);
    R(g,-1.5,-LW/2,3,LW,'#ffffff');g.restore();
    const ox=sy>CY?0:0,oy=sy>CY?-LW*.5-10:LW*.5+10;g.save();g.globalAlpha=.85;txt(g,'DÉPART · '+Q.nom,sx+ox,sy+oy,9,'#ffffff','800');g.restore();}
  /* le sautoir en longueur : sa piste d'élan, sa planche, son sable */
  R(g,CX-380+40,CY+60,170,10,'#c65a3c');R(g,CX-380+40,CY+60,170,1,'rgba(255,255,255,.6)');R(g,CX-380+40,CY+69,170,1,'rgba(255,255,255,.6)');
  R(g,CX-170,CY+59,6,12,'#f2f2ee');R(g,CX-160,CY+52,80,26,'#c8b07a');R(g,CX-158,CY+54,76,22,'#e8d29a');for(let i=0;i<60;i++)R(g,CX-158+hA(i,6,6)*74,CY+54+hA(i,7,6)*20,1,1,'rgba(160,130,80,.5)');
  /* le saut en hauteur : son tapis bleu, ses poteaux, sa barre */
  R(g,CX+190,CY-74,70,44,'#1f5fa8');R(g,CX+190,CY-74,70,6,'#3a8ad0');R(g,CX+192,CY-66,66,34,'#2a6fba');R(g,CX+184,CY-82,3,22,'#e8e4da');R(g,CX+263,CY-82,3,22,'#e8e4da');R(g,CX+184,CY-82,82,2,'#f5c430');
  /* le lancer du poids : le cercle, son butoir, le secteur */
  g.strokeStyle='#ffffff';g.lineWidth=2;g.beginPath();g.arc(CX+120,CY+60,9,0,7);g.stroke();R(g,CX+128,CY+56,3,8,'#f2f2ee');
  g.lineWidth=1;g.strokeStyle='rgba(255,255,255,.55)';g.beginPath();g.moveTo(CX+129,CY+60);g.lineTo(CX+250,CY+20);g.moveTo(CX+129,CY+60);g.lineTo(CX+250,CY+100);g.stroke();
  /* des haies rangées au bord de l'esplanade, un banc d'athlètes, la fontaine à eau */
  for(let k=0;k<5;k++){const x=1560+k*5,y=398+k*3;R(g,x,y,30,2,'#ffffff');R(g,x+2,y+2,1.4,6,'#2a2e36');R(g,x+26,y+2,1.4,6,'#2a2e36');R(g,x,y,10,2,'#1a1a1e');R(g,x+20,y,10,2,'#1a1a1e');}
  R(g,400,396,90,8,'#2a6fba');R(g,400,396,90,2,'#4a8ad0');R(g,404,404,3,4,'#2a2e36');R(g,483,404,3,4,'#2a2e36');for(const x of [418,446,468])R(g,x,391,10,6,['#e84a3a','#1a1a22','#f5c430'][(x/10|0)%3]);
  R(g,520,392,10,14,'#3a8ad0');R(g,521,388,8,5,'#a8e0ff');
  /* le bas : un muret de pierre claire, sa rambarde bleu de Marseille, des oliviers en bac,
     et le portail en fer forgé ouvert vers la Joliette */
  const MY=H-34;
  for(let x=0;x<W;x+=180){if(Math.abs(x+90-CX)<120)continue;const tx=x+90,ty=MY-8;
    g.fillStyle='rgba(40,34,26,.2)';g.beginPath();g.ellipse(tx+6,ty+2,30,7,0,0,7);g.fill();
    R(g,tx-14,ty-14,28,16,'#c0703a');R(g,tx-16,ty-17,32,5,'#d8884a');R(g,tx-14,ty-4,28,2,'rgba(0,0,0,.18)');R(g,tx-2,ty-38,4,24,'#6a4a2a');R(g,tx-1,ty-38,1,24,'#8a6a40');
    fe(g,tx,ty-52,26,18,OLIV,140,x|0,1.4);}
  for(let x=0;x<W;x+=40){if(Math.abs(x+20-CX)<60)continue;R(g,x,MY,40,28,'#d8cdb4');const t=hA(x,7,2);R(g,x+1,MY+1,38,12,t<.5?'#e2d8c0':'#dcd0b6');R(g,x+1,MY+14,18,12,'#d2c6aa');R(g,x+21,MY+14,18,12,'#dacfb4');R(g,x,MY,40,1,'#f2ead8');R(g,x+39,MY,1,28,'rgba(120,100,70,.3)');}
  R(g,0,MY-3,CX-60,4,'#f0e8d6');R(g,CX+60,MY-3,W-CX-60,4,'#f0e8d6');R(g,0,MY+1,CX-60,1,'#b8ac90');R(g,CX+60,MY+1,W-CX-60,1,'#b8ac90');
  /* la rambarde : main courante, lisse basse, barreaux */
  for(const [a,b] of [[0,CX-60],[CX+60,W]]){R(g,a,MY-26,b-a,4,'#1f4f96');R(g,a,MY-26,b-a,1.5,'#4a80c8');R(g,a,MY-12,b-a,2,'#1f4f96');
    for(let x=a+4;x<b;x+=9){R(g,x,MY-22,2,20,'#2a5aa0');R(g,x,MY-22,1,20,'#5a8ad0');}for(let x=a;x<b;x+=90){R(g,x,MY-30,4,28,'#183e78');R(g,x-1,MY-32,6,3,'#4a80c8');}}
  /* le portail, deux piliers de pierre et leurs boules */
  for(const px of [CX-74,CX+60]){R(g,px,MY-42,14,70,'#cfc2a4');R(g,px,MY-42,14,2,'#ece2c8');R(g,px+11,MY-42,3,70,'#b8ab90');R(g,px-2,MY-46,18,5,'#e2d6bc');g.fillStyle='#e8dcc2';g.beginPath();g.arc(px+7,MY-50,6,0,7);g.fill();g.fillStyle='#fff6e0';g.fillRect(px+4,MY-54,3,3);}
  R(g,CX-60,MY+20,120,8,'#bdb6a8');R(g,CX-70,H-62,140,14,'#16213a');R(g,CX-70,H-62,140,2,'#e8c050');txt(g,'SORTIE · JOLIETTE',CX,H-55,9,'#ffd860','800');
  /* l'esplanade : usure devant les tribunes, taches, deux bancs */
  for(let i=0;i<40;i++){g.fillStyle='rgba(255,250,235,.10)';g.beginPath();g.ellipse(hA(i,9,4)*W,Y0+30+hA(i,8,4)*40,30+hA(i,7,4)*40,6,0,0,7);g.fill();}
  for(const bx of [700,1300]){const by=Y0+44;R(g,bx,by,70,5,'#9a6a42');R(g,bx,by,70,2,'#c08a58');R(g,bx,by-10,70,4,'#9a6a42');R(g,bx+4,by+5,3,6,'#3a3e46');R(g,bx+63,by+5,3,6,'#3a3e46');g.fillStyle='rgba(40,34,26,.18)';g.fillRect(bx+2,by+11,70,3);}}
function peindreSol(g){tribune(g);anneau(g);}
function sol(){const c=document.createElement('canvas');c.width=W;c.height=H;peindreSol(c.getContext('2d'));return c;}
function solFin(){const c=document.createElement('canvas');c.width=W*2;c.height=H*2;const g=c.getContext('2d');g.setTransform(2,0,0,2,0,0);peindreSol(g);return c;}

/* ---------- LES TENUES D'ATHLÈTE ----------
   Pas de sac sur la piste : débardeur, short, chaussures de course. On les
   choisit aux vestiaires ; le moteur les porte à la place des habits de ville
   tant qu'on est ici (window.AP_FORCE). */
const KITS=[{n:'Phocéen',haut:'#7ac8f0',bas:'#ffffff',nv:0},{n:'Massilia',haut:'#ffffff',bas:'#1f5fa8',nv:1},{n:'Calanques',haut:'#1a1a22',bas:'#1a1a22',nv:2},{n:'Provence',haut:'#e84a3a',bas:'#ffffff',nv:3},{n:'Garrigue',haut:'#2e8a4a',bas:'#f2ead6',nv:4},{n:'Soleil',haut:'#f5c430',bas:'#1a1a22',nv:5},{n:'Or olympique',haut:'#e8c040',bas:'#e8c040',nv:6}];
const SOULIERS=[{n:'Fluo',c:'#c8ff3a',nv:0},{n:'Corail',c:'#ff6a4a',nv:1},{n:'Glacier',c:'#5ae0ff',nv:2},{n:'Néon rose',c:'#ff4ab8',nv:3},{n:'Blanc pur',c:'#f6f6f6',nv:0},{n:'Noir mat',c:'#26262c',nv:4},{n:'Or olympique',c:'#ffd040',nv:6}];
const CATS=['Débutant','Club','Régional','Interrégional','National','Élite','Olympique'];
function cat(){let m=0;try{for(const k in (e.athNiv||{}))m=Math.max(m,e.athNiv[k]|0);}catch(x){}return m;}
/* Ce qu'on a acheté à l'Athlé Shop (synchronisé avec le serveur à l'arrivée) */
const SHOP_K=[{id:'m_retro',n:'Rétro 84',haut:'#f2ede2',bas:'#1f5fa8'},{id:'m_endoume',n:'Club d’Endoume',haut:'#2e8a4a',bas:'#ffffff'},{id:'m_turquoise',n:'Turquoise',haut:'#2ac0c8',bas:'#16213a'},{id:'m_nuit',n:'Nuit étoilée',haut:'#16213a',bas:'#16213a'},{id:'m_corail',n:'Corail',haut:'#ff7a5a',bas:'#ffffff'},{id:'p_legende',n:'Légende',haut:'#ffffff',bas:'#e8c040'}];
const SHOP_S=[{id:'c_pointes',n:'Pointes de sprint',c:'#e84a3a'},{id:'c_menthe',n:'Menthe',c:'#7ee0b0'},{id:'c_carbone',n:'Carbone',c:'#2a2a30'},{id:'c_glacier',n:'Glacier Pro',c:'#a8e8ff'},{id:'p_pointes_or',n:'Pointes d’or',c:'#ffd040'}];
const SHOP_A=[{id:'a_bandeau',n:'Bandeau'},{id:'a_manchettes',n:'Manchettes'},{id:'a_lunettes',n:'Lunettes miroir'},{id:'a_montre',n:'Montre GPS'}];
const a_moi=id=>{try{return !!(e.athShop&&e.athShop[id]);}catch(x){return false;}};
(async()=>{try{for(let i=0;i<40&&!(typeof sb!=='undefined'&&sb&&sb.rpc);i++)await new Promise(r=>setTimeout(r,250));let data=null;if(typeof sb!=='undefined'&&sb&&sb.rpc){const {data:d,error}=await sb.rpc('athle_mes_articles');if(!error)data=d;}else if(typeof appelRPC==='function')data=await appelRPC('athle_mes_articles',{});if(Array.isArray(data)&&data.length){const m=Object.assign({},e.athShop||{});data.forEach(k=>m[k]=true);e.athShop=m;porter();try{sauver();}catch(x){}}}catch(x){}})();
/* la liste de ce qu'on peut enfiler : les tenues gagnées en course, et celles achetées */
function listeK(){return KITS.map((K,i)=>Object.assign({key:i},K)).concat(SHOP_K.filter(x=>a_moi(x.id)).map(x=>Object.assign({key:x.id,nv:0,achat:1},x)));}
function listeS(){return SOULIERS.map((S,i)=>Object.assign({key:i},S)).concat(SHOP_S.filter(x=>a_moi(x.id)).map(x=>Object.assign({key:x.id,nv:0,achat:1},x)));}
function listeA(){return [{key:'',n:'Aucun',nv:0}].concat(SHOP_A.filter(x=>a_moi(x.id)).map(x=>Object.assign({key:x.id,nv:0,achat:1},x)));}
function kit(){let k={k:0,s:0,a:''};try{if(e.kitAthle&&typeof e.kitAthle==='object')k=Object.assign(k,e.kitAthle);}catch(x){}
  const LK=listeK(),LS=listeS();let K=LK.find(x=>x.key===k.k)||LK[0],S=LS.find(x=>x.key===k.s)||LS[0];if(K.nv>cat())K=LK[0];if(S.nv>cat())S=LS[0];
  const A=k.a&&a_moi(k.a)?k.a:'';
  return {haut:4,veste:K.haut,_motif:0,motif:0,raye:0,bas:1,pantalon:K.bas,souliers:1,chaussures:S.c,sac:0,chapeau:0,cos:0,deguisement:0,maillot:0,gilet:0,patin:0,_civil:true,_acc:A||undefined};}
function porter(){try{window.AP_FORCE=kit();}catch(x){}}
porter();
/* LA VITRINE : tes médailles et les photos de tes podiums */
const MEDAILLE=c=>'<svg viewBox="0 0 14 18" width="28" shape-rendering="crispEdges"><path d="M3 0h3v6H3zM8 0h3v6H8z" fill="#1f5fa8"/><path d="M5 0h1v6H5zM8 0h1v6H8z" fill="#e84a3a"/><rect x="2" y="7" width="10" height="10" fill="#2a2016"/><rect x="3" y="8" width="8" height="8" fill="'+c+'"/><rect x="4" y="9" width="3" height="2" fill="#fff" opacity=".6"/></svg>';
const NOMS_EP={'100':'100 m','100h':'100 m haies','400':'400 m','400h':'400 m haies','800':'800 m','4x100':'4 × 100 m','long':'Longueur'};
function vitrine(){let m={};try{m=e.athMed||{};}catch(x){}let L=[];try{L=JSON.parse(localStorage.getItem('bd_athAlbum')||'[]');}catch(x){}
  const tot=(m.or|0)+(m.argent|0)+(m.bronze|0);
  return '<div style="font:900 11px ui-monospace,monospace;letter-spacing:2px;color:#c0392b;margin:12px 0 6px">TA VITRINE</div>'+
   '<div style="background:#16213a;border-radius:6px;padding:10px;box-shadow:inset 0 0 0 3px #e8c050">'+
   '<div style="display:flex;justify-content:space-around;align-items:center">'+[['or','#f5c430'],['argent','#d8dce2'],['bronze','#d0884a']].map(([k,c])=>'<div style="display:flex;align-items:center;gap:6px;color:#fff;font:900 18px ui-monospace,monospace">'+MEDAILLE(c)+'× '+(m[k]|0)+'</div>').join('')+'</div>'+
   (L.length?'<div style="display:flex;gap:8px;overflow-x:auto;margin-top:10px;padding-bottom:4px">'+L.map((p,i)=>'<button data-ph="'+i+'" style="all:unset;flex:none;cursor:pointer;width:118px"><img src="'+p.img+'" style="width:118px;display:block;border:2px solid #e8c050;border-radius:2px"><span style="display:block;font:800 9.5px ui-monospace,monospace;color:#ffd880;margin-top:3px">'+(['🥇','🥈','🥉'][p.pl-1]||'')+' '+(NOMS_EP[p.ep]||p.ep)+'</span></button>').join('')+'</div>':
    '<div style="margin-top:8px;text-align:center;font:700 11px ui-monospace,monospace;color:#8ab0d8">'+(tot?'':'Monte sur un podium pour gagner ta première médaille. ')+'Chaque podium te laisse une photo ici.</div>')+'</div>';}
function vestiaires(){if(document.getElementById('pstV'))return;let sel={k:0,s:0,a:''};try{if(e.kitAthle)sel=Object.assign(sel,e.kitAthle);}catch(x){}
  const d=document.createElement('div');d.id='pstV';
  d.style.cssText='position:fixed;inset:0;z-index:2147482500;background:rgba(10,16,24,.55);display:flex;align-items:flex-end;justify-content:center;font-family:"Baloo 2",system-ui,sans-serif';
  const carte=(it,a,on)=>{const lk=it.nv>cat();return '<button data-'+a+'="'+it.key+'"'+(lk?' data-lock="1"':'')+' style="all:unset;box-sizing:border-box;cursor:pointer;position:relative;text-align:center;background:'+(on?'#fff6d8':'#fff')+';border:3px solid '+(on?'#16213a':'#e2d8c6')+';border-radius:6px;padding:4px 2px 6px;box-shadow:0 3px 0 '+(on?'#16213a':'#e2d8c6')+';'+(lk?'opacity:.55':'')+'"><canvas width="96" height="128" style="width:48px;height:64px;image-rendering:pixelated;display:block;margin:0 auto;'+(lk?'filter:grayscale(1)':'')+'"></canvas><span style="font:800 11px ui-monospace,monospace;color:#16213a">'+it.n+'</span>'+(lk?'<span style="display:block;font:800 10px ui-monospace,monospace;color:#c0392b">🔒 '+CATS[it.nv]+'</span>':it.achat?'<span style="display:block;font:800 9.5px ui-monospace,monospace;color:#2e7d4f">ATHLÉ SHOP</span>':'')+'</button>';};
  const sect=(t)=>'<div style="font:900 11px ui-monospace,monospace;letter-spacing:2px;color:#c0392b;margin:12px 0 6px">'+t+'</div>';
  const rendre=()=>{d.innerHTML='<div style="width:min(460px,100%);max-height:88vh;overflow-y:auto;background:#f6efdc;border-radius:22px 22px 0 0;border-top:4px solid #16213a;padding:12px 16px calc(18px + env(safe-area-inset-bottom));box-shadow:0 -10px 30px rgba(0,0,0,.35)">'+
    '<div style="width:44px;height:5px;border-radius:3px;background:#d8ccb4;margin:0 auto 8px"></div><div style="text-align:center;font:900 22px Georgia,serif;color:#16213a">Les vestiaires</div>'+
    '<div style="text-align:center;font:700 11.5px ui-monospace,monospace;color:#2e5a3a;background:#e6f6e8;border-radius:4px;padding:5px;margin:6px 0 4px">Catégorie <b>'+CATS[cat()]+'</b> · 🔒 se gagnent en course · le reste s’achète à l’Athlé Shop</div>'+
    vitrine()+sect('LE MAILLOT ET LE SHORT')+'<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px">'+listeK().map(it=>carte(it,'k',it.key===sel.k)).join('')+'</div>'+
    sect('LES CHAUSSURES DE COURSE')+'<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px">'+listeS().map(it=>carte(it,'s',it.key===sel.s)).join('')+'</div>'+
    sect('L’ACCESSOIRE')+'<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px">'+listeA().map(it=>carte(it,'a',it.key===(sel.a||''))).join('')+'</div>'+
    '<button data-ok="1" style="all:unset;box-sizing:border-box;display:block;width:100%;margin-top:14px;text-align:center;background:#16213a;color:#ffd860;border:4px solid #e8c050;box-shadow:0 0 0 3px #16213a;border-radius:4px;padding:12px;font:900 15px ui-monospace,monospace;letter-spacing:2px;cursor:pointer">ENFILER LA TENUE</button></div>';
    d.querySelectorAll('canvas').forEach(cv=>{const b=cv.parentNode,ds=b.dataset;const tmp=Object.assign({},sel);
      if(ds.k!==undefined)tmp.k=isNaN(+ds.k)?ds.k:+ds.k;if(ds.s!==undefined)tmp.s=isNaN(+ds.s)?ds.s:+ds.s;if(ds.a!==undefined)tmp.a=ds.a;
      const q=cv.getContext('2d');q.imageSmoothingEnabled=false;const save=e.kitAthle;e.kitAthle=tmp;const ap=Object.assign({},e.ap||{},kit());e.kitAthle=save;
      q.setTransform(2,0,0,2,0,0);try{personne(q,24,60,ap,'bas',0,false);}catch(x){}});};
  rendre();document.body.appendChild(d);
  d.addEventListener('click',ev=>{const b=ev.target.closest('button');if(!b){if(ev.target===d)d.remove();return;}
    if(b.dataset.ph!==undefined){let L=[];try{L=JSON.parse(localStorage.getItem('bd_athAlbum')||'[]');}catch(x){}const p=L[+b.dataset.ph];if(!p)return;
      const z=document.createElement('div');z.style.cssText='position:fixed;inset:0;z-index:2147482600;background:rgba(6,8,12,.92);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;padding:16px';
      z.innerHTML='<img src="'+p.img+'" style="width:min(100%,520px);border:4px solid #e8c050;border-radius:3px"><div style="font:900 15px ui-monospace,monospace;color:#ffd860">'+(['🥇','🥈','🥉'][p.pl-1]||'')+' '+(NOMS_EP[p.ep]||p.ep)+' · '+(p.ep==='long'?p.v.toFixed(2)+' m':ft(p.v,p.ep))+'</div><div style="font:700 11px ui-monospace,monospace;color:#8ab0d8">'+new Date(p.d).toLocaleDateString('fr-FR')+' · touche pour fermer</div>';
      z.onclick=()=>z.remove();document.body.appendChild(z);return;}
    if(b.dataset.lock){try{vibrer(30);}catch(x){}return;}
    const v=x=>isNaN(+x)||x===''?x:+x;
    if(b.dataset.k!==undefined){sel.k=v(b.dataset.k);rendre();}else if(b.dataset.s!==undefined){sel.s=v(b.dataset.s);rendre();}else if(b.dataset.a!==undefined){sel.a=b.dataset.a;rendre();}
    else if(b.dataset.ok){e.kitAthle=sel;porter();try{sauver();}catch(x){}d.remove();try{texteVolant(joueur.x,joueur.y-70,'Tenue enfilée !','#ffd860');}catch(x){}try{vibrer(12);}catch(x){}}});}

async function ouvrirShop(){try{if(!window.ouvrirAthleShop)eval(await chargerMorceau('athleshop.js'));window.ouvrirAthleShop({kit:kit,ap:()=>e.ap,apres:()=>{porter();}});}catch(x){console.warn('SHOP',x);}}
/* ---------- LE DÉCOR (des points d'action, tout le reste est au sol) ---------- */
function decor(){const D=[];const P=(t,x,y,o)=>D.push(Object.assign({t,x,y,gr:0},o||{}));
  P('x_jol_pst_vide_sol',161,Y0+30,{col:[1,1],demi:60,agir:vestiaires,libelle:'Se changer',nom:'VESTIAIRES'});
  P('x_jol_pst_vide_sol',482,Y0+22,{col:[1,1],demi:60,agir:ouvrirShop,libelle:'Entrer',nom:'ATHLÉ SHOP'});
  P('x_jol_pst_vide_sol',CX,Y0+24,{col:[1,1],demi:70,agir:classement,libelle:'Voir le classement',nom:'GRAND ÉCRAN'});
  P('x_jol_pst_vide_sol',CX-330,CY+65,{col:[1,1],demi:50,agir:()=>courir(['long']),libelle:'Sauter',nom:'SAUT EN LONGUEUR'});
  for(const D of DEPARTS)P('x_jol_pst_vide_sol',D.p[0],D.p[1]+(D.p[1]<CY?10:-10),{col:[1,1],demi:46,agir:()=>courir(D.ep),libelle:'Prendre le départ',nom:D.nom});
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
 const TOURS=[{pts:[[420,420],[1580,420]],v:34},{pts:[[1900,460],[1900,960],[1450,990],[1900,960]],v:30},{pts:[[110,520],[110,960],[520,990],[110,960]],v:28}];
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
  if(y>H-44&&Math.abs(x-CX)>52)return true;
  if(y>H-4)return true;
  return false;}

/* LA SORTIE : par le portail du bas, on rentre sur la place de la Joliette */
let PARTI=false;
setInterval(()=>{try{if(PARTI||typeof joueur==='undefined')return;if(joueur.y>H-12)sortir();}catch(x){}},150);
function sortir(){if(PARTI)return;PARTI=true;try{window.AP_FORCE=null;}catch(x){}try{sauver();}catch(x){}
  try{const f=document.createElement('div');f.style.cssText='position:fixed;inset:0;z-index:2147483000;background:#fff8ea;opacity:0;transition:opacity .45s;pointer-events:none';document.body.appendChild(f);requestAnimationFrame(()=>f.style.opacity='1');}catch(x){}
  setTimeout(()=>{const v=window.MA_VERSION?('&v='+encodeURIComponent(window.MA_VERSION)):'';location.href='spawn.html?de=piste'+v;},480);}

/* LE GRAND ÉCRAN : les records du stade (le meilleur de tous les joueurs, avec son nom) et les tiens.
   Dessiné à chaque image (quelques textes), pour qu'il soit à jour dès la fin d'une course. */
const EPS=[['100','100 M'],['100h','100 H'],['400','400 M'],['400h','400 H'],['800','800 M'],['4x100','4×100'],['long','LONG.']];
function ft(t,k){if(!t)return k==='long'?'-.--':'--.--';if(k==='long')return t.toFixed(2)+'m';if(t>=60){const m=Math.floor(t/60),r=t-m*60;return m+':'+(r<10?'0':'')+r.toFixed(2);}return t.toFixed(2);}
/* les records du stade, demandés au serveur à l'arrivée puis chaque minute */
async function stade(){try{for(let i=0;i<40&&!(typeof sb!=='undefined'&&sb&&sb.rpc);i++)await new Promise(r=>setTimeout(r,250));if(!(typeof sb!=='undefined'&&sb&&sb.rpc))return;
  const {data,error}=await sb.rpc('athle_records_stade');if(!error&&data&&typeof data==='object'){const o={};for(const k in data)o[k]=data[k];window.ATH_STADE=o;}}catch(x){}}

stade();setInterval(()=>{if(!document.hidden)stade();},60000);
function acteurs(){return [{y:Y0-60,f:(g,camX,camY)=>{const x0=CX-camX,y0=-camY;if(x0<-260||x0>(g.canvas.width+260)||y0+250<0)return;
  g.save();g.translate(x0,y0);const T=(s,x,y,px,c,f)=>{g.fillStyle=c;g.font=(f||'900')+' '+px+'px ui-monospace,monospace';g.textAlign='center';g.textBaseline='middle';g.fillText(s,x,y);};
  g.fillStyle='#06070a';g.fillRect(-200,106,400,134);for(let y=108;y<238;y+=2){g.fillStyle='rgba(255,255,255,.03)';g.fillRect(-200,y,400,1);}
  const ST=window.ATH_STADE||null;let rec={},niv={};try{rec=e.chronos||{};niv=e.athNiv||{};}catch(x){}
  T(ST?'★ RECORDS DU STADE ★':'TES RECORDS',0,126,14,'#ffb030');T('au pied de l’écran : le classement général',0,143,7,'#7a8aa0','800');
  const CAT=['Débutant','Club','Régional','Interrég.','National','Élite','Olymp.'];
  EPS.forEach(([k,n],i)=>{const x=-171+i*57,r=rec['ath_'+k],sr=ST&&ST[k];g.fillStyle='#14161c';g.fillRect(x-26,152,52,82);g.fillStyle='#1f2430';g.fillRect(x-26,152,52,2);
    T(n,x,161,8,'#7ee08a');
    if(ST){T(sr?ft(sr.v/100,k):'—',x,175,10,sr?'#ff6a4a':'#5a3a30');T(sr?String(sr.p||'?').slice(0,8):'à prendre',x,187,7,sr?'#ffffff':'#6a6a74','800');
      g.fillStyle='#262b38';g.fillRect(x-20,195,40,1);T('TOI '+ft(r&&r.t,k),x,206,7,r?'#ffd880':'#6a5a40','800');T(CAT[niv[k]|0].toUpperCase(),x,222,6,'#7a8aa0','800');}
    else{T(ft(r&&r.t,k),x,184,11,r?'#ff6a4a':'#5a3a30');T(CAT[niv[k]|0].toUpperCase(),x,212,7,'#ffd880','800');}});
  g.restore();}}];}
/* LE CLASSEMENT GÉNÉRAL : les 20 meilleurs de chaque épreuve, tous joueurs confondus */
function classement(){if(document.getElementById('pstC'))return;let ong='100';
  const d=document.createElement('div');d.id='pstC';
  d.style.cssText='position:fixed;inset:0;z-index:2147482500;background:rgba(10,16,24,.6);display:flex;align-items:flex-end;justify-content:center;font-family:"Baloo 2",system-ui,sans-serif';
  const fv=(k,v)=>k==='long'?(v/100).toFixed(2)+' m':ft(v/100,k);
  const rendre=(data,err)=>{d.innerHTML='<div style="width:min(460px,100%);max-height:88vh;display:flex;flex-direction:column;background:#0b0d12;border-radius:18px 18px 0 0;border-top:4px solid #e8c050;box-shadow:0 -10px 30px rgba(0,0,0,.4);padding:10px 12px calc(16px + env(safe-area-inset-bottom));color:#fff">'+
    '<div style="width:44px;height:5px;border-radius:3px;background:#3a4050;margin:0 auto 8px"></div>'+
    '<div style="text-align:center;font:900 11px ui-monospace,monospace;letter-spacing:3px;color:#7ee08a">PISTE MUNICIPALE</div><div style="text-align:center;font:900 22px ui-monospace,monospace;color:#ffb030;margin:2px 0 8px">CLASSEMENT GÉNÉRAL</div>'+
    '<div style="display:flex;gap:4px;overflow-x:auto;padding-bottom:6px">'+EPS.map(([k,n])=>'<button data-o="'+k+'" style="all:unset;flex:none;cursor:pointer;padding:6px 9px;border-radius:3px;font:900 11px ui-monospace,monospace;'+(k===ong?'background:#ffb030;color:#0b0d12':'background:#14161c;color:#8ab0d8;border:1px solid #262b38')+'">'+n+'</button>').join('')+'</div>'+
    '<div style="flex:1;overflow-y:auto;margin-top:4px">'+(err?'<div style="padding:28px 8px;text-align:center;font:700 13px ui-monospace,monospace;color:#8a96aa">'+err+'</div>':
      !data.top||!data.top.length?'<div style="padding:28px 8px;text-align:center;font:700 13px ui-monospace,monospace;color:#8a96aa">Personne n’a encore de temps homologué ici.<br>Le premier record est à prendre !</div>':
      data.top.map((r,i)=>'<div style="display:flex;align-items:center;gap:8px;padding:7px 8px;border-bottom:1px solid #1a1e28;font:800 13px ui-monospace,monospace;'+(r.moi?'background:#2a2410;color:#ffd860':'color:#e6e8ee')+'"><span style="width:26px;color:'+(i===0?'#f5c430':i===1?'#d8dce2':i===2?'#d0884a':'#5a6478')+'">'+(i+1)+'</span><b style="flex:1;font-weight:800;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'+String(r.p||'?').replace(/</g,'')+'</b><em style="font-style:normal;color:'+(r.moi?'#ffd860':'#ff6a4a')+'">'+fv(ong,r.v)+'</em></div>').join(''))+'</div>'+
    (data&&data.moi?'<div style="margin-top:8px;padding:8px;border-radius:4px;background:#14161c;font:800 12.5px ui-monospace,monospace;color:#ffd860;text-align:center">Toi : '+fv(ong,data.moi.v)+' · '+data.moi.rang+(data.moi.rang===1?'er':'e')+' sur '+data.total+'</div>':
      '<div style="margin-top:8px;padding:8px;border-radius:4px;background:#14161c;font:700 12px ui-monospace,monospace;color:#8a96aa;text-align:center">Cours cette épreuve pour entrer au classement.</div>')+
    '<div style="margin-top:6px;text-align:center;font:700 10.5px ui-monospace,monospace;color:#5a6478">Vent de plus de +2,0 m/s : perf non homologuée</div></div>';};
  const charger=async()=>{rendre({},'Chargement…');try{if(!(typeof sb!=='undefined'&&sb&&sb.rpc))throw 0;const {data,error}=await sb.rpc('athle_classement',{p_epreuve:ong});if(error||!data)throw 0;rendre(data);}catch(x){rendre({},'Le classement est indisponible pour le moment.');}};
  document.body.appendChild(d);charger();
  d.addEventListener('click',ev=>{const b=ev.target.closest('button');if(b&&b.dataset.o){ong=b.dataset.o;charger();return;}if(ev.target===d)d.remove();});}
/* au pied de la tribune, face au grand écran, la caméra lève les yeux */
function regardY(x,y){const fy=Math.max(0,Math.min(1,(Y0+150-y)/110)),fx=Math.max(0,Math.min(1,(330-Math.abs(x-CX))/80));return .36*fy*fx;}
return {sol,solFin,decor,bloque,graver,depart:DEPART,figurants,acteurs,regardY};
})()
