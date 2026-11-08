/* =====================================================================
   LE STADE — le parvis du Vélodrome, un lieu à part entière (stade.html).
   Même logique de vue que la place : la façade du stade monte à la
   verticale au fond (la vague blanche du toit, la résille, les portes des
   tribunes) ; tout le reste est posé au sol : le parvis, les platanes,
   la billetterie, le camion à chichis, le boulevard Michelet en bas.
   Chargé par moteur.js (eval direct).
   ===================================================================== */
(()=>{
const W=1600, H=800, Y0=372;
const DEPART=[700,716];
const BLEU='#1c4f9c', CIEL='#2a9ad8';
const hA=(x,y,k)=>{let n=((x*73856093)^(y*19349663)^(k*83492791))|0;n=(n^(n>>>13))*1274126177|0;return((n^(n>>>16))>>>0)/4294967296;};
const lin=(g,x0,y0,x1,y1,st)=>{const gr=g.createLinearGradient(x0,y0,x1,y1);st.forEach(([o,c])=>gr.addColorStop(o,c));return gr;};
const R=(g,x,y,w,h,c)=>{g.fillStyle=c;g.fillRect(x,y,w,h);};
function toile(L,HH){const D=2,c=document.createElement('canvas');c.width=Math.ceil(L*D);c.height=Math.ceil(HH*D);const g=c.getContext('2d');g.setTransform(D,0,0,D,0,0);return {c,g};}
function fe(g,cx,cy,rx,ry,pal,n,seed,t){t=t||1;for(let i=0;i<n;i++){const a=hA(i,seed,1)*Math.PI*2,r=Math.sqrt(hA(i,seed,2));const x=cx+Math.cos(a)*rx*r,y=cy+Math.sin(a)*ry*r;
  const lum=((cx-x)/rx+(cy-y)/ry)*.5+hA(i,seed,3)*.4;g.fillStyle=lum>.55?pal[3]:lum>.15?pal[2]:lum>-.3?pal[1]:pal[0];
  g.beginPath();g.ellipse(x,y,(1.2+hA(i,seed,4)*1.6)*t,(.9+hA(i,seed,5)*1)*t,hA(i,seed,6)*3,0,7);g.fill();}}
function ombreSol(g,cx,cy,rx,ry,a){g.fillStyle='rgba(40,34,26,'+(a||.18)+')';g.beginPath();g.ellipse(cx+4,cy+3,rx,ry,0,0,7);g.fill();}
const txt=(g,s,x,y,px,c,al,f)=>{g.fillStyle=c;g.font=(f||'bold')+' '+px+'px "Helvetica Neue",Arial,sans-serif';g.textAlign=al||'center';g.textBaseline='middle';g.fillText(s,x,y);};

/* ---------- LA FAÇADE DU STADE ---------- */
const BX0=40, BX1=W-40;                       /* l'emprise de l'enceinte */
const PLINTHE=Y0-114;                           /* le haut du socle (les portes) */
/* le bord haut du toit : un grand arc, et la vague qui ondule dessus */
const toit=x=>{const u=(x-W/2)/(W/2-BX0);return 58+64*u*u-16*Math.cos(u*Math.PI*2.5);};
const sousToit=x=>toit(x)+22+8*Math.sin((x-BX0)/110);
const PORTES=[{x:250,n:'VIRAGE NORD'},{x:560,n:'TRIBUNE GANAY'},{x:1040,n:'TRIBUNE GANAY'},{x:1350,n:'VIRAGE SUD'}];
const PORTE_L=132, PORTE_H=80;
function ciel(g){
  g.fillStyle=lin(g,0,0,0,Y0,[[0,'#5aa6dc'],[.45,'#9ccbea'],[1,'#e6f2f8']]);g.fillRect(0,0,W,Y0);
  /* quelques nuages de mistral, étirés */
  for(let k=0;k<7;k++){const cx=hA(k,3,1)*W,cy=24+hA(k,3,2)*70,l=80+hA(k,3,3)*120;
    for(let j=0;j<9;j++){g.fillStyle='rgba(255,255,255,'+(.16+hA(k,j,4)*.2)+')';g.beginPath();g.ellipse(cx+(j-4)*l/9,cy+hA(k,j,5)*6-3,l/6,4+hA(k,j,6)*4,0,0,7);g.fill();}}
  /* les collines de Marseille au loin (Marseilleveyre, Saint-Cyr) */
  g.fillStyle='#b4c6d2';g.beginPath();g.moveTo(0,Y0-120);
  for(let x=0;x<=W;x+=20)g.lineTo(x,Y0-150-40*Math.sin(x/260)-22*Math.sin(x/97+1)-hA(x,9,1)*6);g.lineTo(W,Y0);g.lineTo(0,Y0);g.fill();
  g.fillStyle='#a2b6c4';g.beginPath();g.moveTo(0,Y0-100);
  for(let x=0;x<=W;x+=20)g.lineTo(x,Y0-120-26*Math.sin(x/180+2)-hA(x,8,1)*5);g.lineTo(W,Y0);g.lineTo(0,Y0);g.fill();
  /* les immeubles du Rouet, à l'arrière-plan des virages */
  for(let x=0;x<W;x+=34){const h=50+hA(x,7,1)*60,w=24+hA(x,7,2)*14;g.fillStyle=hA(x,7,3)>.5?'#d8d2c4':'#cfc8b8';g.fillRect(x,Y0-h-30,w,h+30);
    for(let yy=Y0-h-24;yy<Y0-34;yy+=9)for(let xx=x+4;xx<x+w-4;xx+=6)R(g,xx,yy,3,4,'rgba(90,110,130,.35)');}
}
/* ---------- LA COQUE BLANCHE, LA BANDE RAYÉE, LES TENTES, LE GRAND ESCALIER PEINT ---------- */
const YC=Y0-128;                               /* le niveau du parvis haut (le pied de la coque) */
const SE=(u,p)=>Math.pow(Math.max(0,1-Math.pow(Math.abs(u),p)),1/p);
const coqueH=x=>{const u=(x-W/2)/(W/2-60);return Math.abs(u)>1?YC:YC-(YC-34)*SE(u,3.2);};
const arcH=x=>{const u=(x-W/2)/560;return Math.abs(u)>1?YC:YC-(YC-150)*SE(u,2.2);};
function enceinte(g){
  /* la coque : un grand dôme blanc, lisse, aux nervures verticales */
  g.save();g.beginPath();g.moveTo(60,YC);for(let x=60;x<=W-60;x+=4)g.lineTo(x,coqueH(x));g.lineTo(W-60,YC);g.closePath();g.clip();
  g.fillStyle=lin(g,60,0,W-60,0,[[0,'#c6ccd2'],[.12,'#eef1f3'],[.5,'#f8f9fa'],[.85,'#e4e8ec'],[1,'#b4bcc4']]);g.fillRect(0,0,W,YC);
  g.fillStyle=lin(g,0,30,0,YC,[[0,'rgba(255,255,255,.5)'],[.5,'rgba(255,255,255,0)'],[1,'rgba(120,130,140,.18)']]);g.fillRect(0,0,W,YC);
  for(let x=64;x<W-60;x+=11){const u=(x-W/2)/(W/2-60);R(g,x,0,.8,YC,'rgba(130,140,150,'+(.16+.2*u*u)+')');}
  g.restore();
  g.strokeStyle='rgba(160,170,180,.8)';g.lineWidth=1.2;g.beginPath();for(let x=60;x<=W-60;x+=4){x===60?g.moveTo(x,coqueH(x)):g.lineTo(x,coqueH(x));}g.stroke();
  /* LE VOLUME : le reflet du soleil sur l'épaule gauche, l'ombre qui tourne à droite, le liseré du bord */
  g.save();g.beginPath();g.moveTo(60,YC);for(let x=60;x<=W-60;x+=4)g.lineTo(x,coqueH(x));g.lineTo(W-60,YC);g.closePath();g.clip();
  g.fillStyle=lin(g,200,0,900,0,[[0,'rgba(255,255,255,0)'],[.45,'rgba(255,255,255,.55)'],[.6,'rgba(255,255,255,.2)'],[1,'rgba(255,255,255,0)']]);g.fillRect(200,0,700,YC);
  g.fillStyle=lin(g,1050,0,W-60,0,[[0,'rgba(90,100,120,0)'],[1,'rgba(70,84,104,.45)']]);g.fillRect(1050,0,W,YC);
  g.fillStyle=lin(g,60,0,260,0,[[0,'rgba(90,100,120,.35)'],[1,'rgba(90,100,120,0)']]);g.fillRect(60,0,200,YC);
  /* les joints horizontaux des panneaux, qui suivent la courbe */
  for(let j=1;j<6;j++){g.strokeStyle='rgba(140,150,160,.25)';g.lineWidth=.8;g.beginPath();for(let x=62;x<=W-62;x+=6){const y=coqueH(x)+j*(YC-coqueH(x))/6;x===62?g.moveTo(x,y):g.lineTo(x,y);}g.stroke();}
  /* le bas de la coque, plus sombre : elle se retourne vers l'intérieur */
  g.fillStyle=lin(g,0,YC-40,0,YC,[[0,'rgba(80,90,100,0)'],[1,'rgba(80,90,100,.3)']]);g.fillRect(0,YC-40,W,40);
  g.restore();
  g.strokeStyle='rgba(255,255,255,.9)';g.lineWidth=1.6;g.beginPath();for(let x=200;x<=900;x+=4){x===200?g.moveTo(x,coqueH(x)+1.5):g.lineTo(x,coqueH(x)+1.5);}g.stroke();

  /* le nom, en lettres d'acier sur la coque */
  g.save();g.shadowColor='rgba(40,50,60,.35)';g.shadowOffsetY=1.6;g.shadowOffsetX=1;txt(g,'Vélodrome',W/2,92,46,'#7a8692','center','600');g.restore();
  /* sous l'arche : la bande rayée noir et blanc, et ses deux rangs de vitres */
  g.save();g.beginPath();g.moveTo(240,YC);for(let x=240;x<=W-240;x+=4)g.lineTo(x,arcH(x));g.lineTo(W-240,YC);g.closePath();g.clip();
  R(g,0,0,W,YC,'#f2f2f0');
  for(let x=240;x<W-240;x+=7){const w=2.4+hA(x,1,2)*3;R(g,x,0,w,YC,'#1e2226');}
  for(const [y,h] of [[182,14],[206,14]]){R(g,240,y,W-480,h,'#24303c');for(let x=244;x<W-244;x+=16){g.fillStyle=lin(g,0,y,0,y+h,[[0,'#5a7488'],[1,'#8aa4b4']]);g.fillRect(x,y+2,14,h-4);}}
  /* l'ombre de la coque sur la bande */
  g.fillStyle=lin(g,0,150,0,215,[[0,'rgba(0,0,10,.6)'],[.5,'rgba(0,0,10,.25)'],[1,'rgba(0,0,0,0)']]);g.fillRect(0,0,W,215);
  /* deux grandes bâches bleues, de part et d'autre */
  for(const bx of [470,1010]){R(g,bx,210,120,30,'#16305e');R(g,bx+2,212,116,26,'#22488a');for(let k=0;k<5;k++)R(g,bx+10+k*22,218,14,14,'rgba(140,190,240,.35)');}
  g.restore();
  g.strokeStyle='#dfe3e6';g.lineWidth=3;g.beginPath();for(let x=240;x<=W-240;x+=4){x===240?g.moveTo(x,arcH(x)):g.lineTo(x,arcH(x));}g.stroke();
  /* la rangée de tentes blanches, sur le parvis haut */
  for(let x=380;x<W-380;x+=46){g.fillStyle='rgba(0,0,0,.15)';g.fillRect(x-17,YC-2,38,3);
    g.fillStyle='#ffffff';g.beginPath();g.moveTo(x-19,YC-12);g.lineTo(x,YC-26);g.lineTo(x+19,YC-12);g.closePath();g.fill();
    g.fillStyle='#d8dde2';g.beginPath();g.moveTo(x,YC-26);g.lineTo(x+19,YC-12);g.lineTo(x+4,YC-12);g.closePath();g.fill();
    R(g,x-18,YC-12,36,10,'rgba(250,250,250,.85)');R(g,x-18,YC-12,1,12,'#9aa2aa');R(g,x+17,YC-12,1,12,'#9aa2aa');}
  /* la rambarde du parvis haut */
  R(g,0,YC,W,4,'#cfd2d4');R(g,0,YC,W,1.2,'#f4f6f8');
}
const ESC0=150, ESC1=W-150, NM=13;          /* le grand escalier, sur presque toute la largeur */
function escalier(g){
  /* les murs bas de part et d'autre */
  R(g,0,YC+4,ESC0,Y0-YC-4,'#d6d2ca');R(g,ESC1,YC+4,W-ESC1,Y0-YC-4,'#d6d2ca');
  R(g,0,YC+4,ESC0,2,'#efebe4');R(g,ESC1,YC+4,W-ESC1,2,'#efebe4');
  const y0=YC+4,hm=(Y0-y0)/NM;
  /* les marches, peintes en blanc */
  for(let k=0;k<NM;k++){const y=y0+k*hm;R(g,ESC0,y,ESC1-ESC0,hm,'#f4f4f2');R(g,ESC0,y+hm*.62,ESC1-ESC0,hm*.38,'#dcdcd8');}
  /* LA FRESQUE, peinte à même les marches */
  g.save();g.beginPath();g.rect(ESC0,y0,ESC1-ESC0,Y0-y0);g.clip();
  /* à gauche : un grand soleil jaune, ses rayons */
  const sx=ESC0+150,sy=Y0+10;
  for(let k=0;k<7;k++){const a=-Math.PI*.95+k*Math.PI*.12;g.fillStyle=k%2?'#f2c43a':'#e8b020';g.beginPath();g.moveTo(sx,sy);g.lineTo(sx+Math.cos(a-.06)*260,sy+Math.sin(a-.06)*260);g.lineTo(sx+Math.cos(a+.06)*260,sy+Math.sin(a+.06)*260);g.fill();}
  g.fillStyle='#f6d050';g.beginPath();g.arc(sx,sy,46,0,7);g.fill();
  /* au centre : le grand écusson bleu ciel à l'ancre, cerné de bleu nuit */
  const cx=W/2-120,cy=y0+(Y0-y0)/2+4,rx=120,ry=56;
  g.fillStyle='#14306a';g.beginPath();g.ellipse(cx,cy,rx+8,ry+6,0,0,7);g.fill();
  g.fillStyle='#2f9ae0';g.beginPath();g.ellipse(cx,cy,rx,ry,0,0,7);g.fill();
  g.fillStyle='#5ab8f0';g.beginPath();g.ellipse(cx-20,cy-14,rx*.7,ry*.5,0,0,7);g.fill();
  /* l'ancre */
  g.strokeStyle='#14306a';g.lineWidth=11;g.lineCap='round';g.beginPath();g.moveTo(cx,cy-40);g.lineTo(cx,cy+34);g.stroke();
  g.beginPath();g.moveTo(cx-34,cy-24);g.lineTo(cx+34,cy-24);g.stroke();
  g.beginPath();g.arc(cx,cy+2,40,Math.PI*.15,Math.PI*.85);g.stroke();
  g.lineWidth=6;g.strokeStyle='#ffffff';g.beginPath();g.moveTo(cx,cy-38);g.lineTo(cx,cy+32);g.stroke();g.beginPath();g.moveTo(cx-32,cy-24);g.lineTo(cx+32,cy-24);g.stroke();g.beginPath();g.arc(cx,cy+2,40,Math.PI*.15,Math.PI*.85);g.stroke();
  g.lineWidth=5;g.strokeStyle='#14306a';g.beginPath();g.arc(cx,cy-47,8,0,7);g.stroke();g.lineCap='butt';
  /* le bandeau blanc en travers, la devise */
  g.save();g.translate(cx,cy+6);g.rotate(-.12);R(g,-150,-13,300,26,'#14306a');R(g,-146,-10,292,20,'#ffffff');txt(g,'MARSEILLE',0,1,17,'#14306a','center','900');g.restore();
  /* à droite : la vague noire et la grande bande bleue en diagonale */
  g.fillStyle='#1a1c20';g.beginPath();g.moveTo(W/2+120,Y0);g.quadraticCurveTo(W/2+200,y0+20,W/2+300,y0);g.lineTo(W/2+330,y0);g.quadraticCurveTo(W/2+300,Y0-40,W/2+420,Y0);g.fill();
  g.fillStyle='#2f9ae0';g.beginPath();g.moveTo(W/2+420,Y0);g.lineTo(W/2+520,y0);g.lineTo(W/2+620,y0);g.lineTo(W/2+520,Y0);g.fill();
  g.fillStyle='#14306a';g.beginPath();g.moveTo(W/2+520,Y0);g.lineTo(W/2+620,y0);g.lineTo(W/2+640,y0);g.lineTo(W/2+540,Y0);g.fill();
  /* encore du jaune, au bout */
  for(let k=0;k<4;k++){g.fillStyle=k%2?'#f2c43a':'#e8b020';g.beginPath();g.moveTo(ESC1-20-k*36,Y0);g.lineTo(ESC1+10-k*36,y0);g.lineTo(ESC1+26-k*36,y0);g.lineTo(ESC1-4-k*36,Y0);g.fill();}
  /* la peinture prend le relief des marches : ombre sous chaque nez */
  for(let k=0;k<NM;k++){const y=y0+k*hm;R(g,ESC0,y+hm*.62,ESC1-ESC0,hm*.38,'rgba(0,0,0,.13)');R(g,ESC0,y,ESC1-ESC0,.9,'rgba(255,255,255,.55)');}
  g.restore();
  /* les rampes, qui découpent l'escalier en volées */
  for(const x of [ESC0+340,W/2+20,ESC1-300]){g.strokeStyle='rgba(0,0,0,.18)';g.lineWidth=2;g.beginPath();g.moveTo(x+2,YC+6);g.lineTo(x+2,Y0+2);g.stroke();
    for(let k=0;k<=NM;k+=3){R(g,x-1,y0+k*hm-14,2,14,'#3a3e44');}g.strokeStyle='#3a3e44';g.lineWidth=1.6;g.beginPath();g.moveTo(x,y0-14);g.lineTo(x,Y0-14);g.stroke();}
  R(g,0,Y0-1,W,2,'rgba(40,40,40,.25)');}
/* ---------- LE PARVIS ---------- */
const BOUL=H-74;                               /* le trottoir du boulevard Michelet */
function parvis(g){
  /* l'enrobé gris clair du parvis, comme sur la photo, poli par les foules */
  g.fillStyle=lin(g,0,Y0,0,BOUL,[[0,'#9a9c9e'],[.5,'#8e9094'],[1,'#86888c']]);g.fillRect(0,Y0,W,BOUL-Y0);
  for(let i=0;i<14000;i++){const x=hA(i,11,1)*W,y=Y0+hA(i,12,1)*(BOUL-Y0),t=hA(i,13,1);R(g,x,y,t>.7?1.2:.8,t>.7?1.2:.8,t>.55?'rgba(255,255,255,.10)':'rgba(30,30,34,.12)');}
  /* les zones plus claires, usées par le passage, en éventail vers l'escalier */
  g.fillStyle=lin(g,0,Y0,0,Y0+160,[[0,'rgba(230,230,224,.14)'],[1,'rgba(230,230,224,0)']]);g.fillRect(ESC0,Y0,ESC1-ESC0,160);
  /* les reprises d'enrobé : des rectangles plus sombres, des joints */
  for(let k=0;k<9;k++){const x=hA(k,21,1)*(W-200)+60,y=Y0+40+hA(k,22,1)*(BOUL-Y0-120),w=60+hA(k,23,1)*120,h=24+hA(k,24,1)*40;
    g.fillStyle='rgba(60,62,66,.06)';g.fillRect(x,y,w,h);}
  /* les fissures, fines, en zigzag */
  g.strokeStyle='rgba(40,40,44,.35)';g.lineWidth=.8;
  for(let k=0;k<16;k++){let x=hA(k,31,1)*W,y=Y0+20+hA(k,32,1)*(BOUL-Y0-40);g.beginPath();g.moveTo(x,y);
    for(let j=0;j<6;j++){x+=(hA(k,j,33)-.3)*22;y+=(hA(k,j,34)-.5)*10;g.lineTo(x,y);}g.stroke();}
  /* les taches d'huile et les chewing-gums */
  for(let k=0;k<10;k++){const x=hA(k,41,1)*W,y=Y0+30+hA(k,42,1)*(BOUL-Y0-60);g.fillStyle='rgba(30,30,40,.14)';g.beginPath();g.ellipse(x,y,8+hA(k,43,1)*14,4+hA(k,44,1)*6,hA(k,45,1),0,7);g.fill();}
  for(let i=0;i<260;i++){const x=hA(i,51,1)*W,y=Y0+8+hA(i,52,1)*(BOUL-Y0-16);g.fillStyle='rgba(50,50,56,.35)';g.beginPath();g.ellipse(x,y,1.3,.8,0,0,7);g.fill();}
  /* les lignes de marquage, à moitié effacées, qui canalisent la foule */
  for(const x of [430,800,1170]){for(let y=Y0+30;y<BOUL-20;y+=34){g.fillStyle='rgba(240,240,232,'+(.22+hA(x,y,1)*.25)+')';g.fillRect(x-2,y,4,20);}}
  for(let x=60;x<W-60;x+=40){g.fillStyle='rgba(250,210,60,'+(.28+hA(x,3,2)*.2)+')';g.fillRect(x,Y0+24,24,3);}
  /* la bordure de pierre au pied de l'escalier */
  R(g,0,Y0,W,8,'#c6c2b8');R(g,0,Y0,W,1.4,'#e8e4dc');R(g,0,Y0+8,W,1.6,'rgba(30,30,30,.3)');
  /* la grille d'avaloir, devant l'escalier */
  for(const x of [330,1270]){R(g,x,Y0+14,36,10,'#4a4c50');for(let i=0;i<8;i++)R(g,x+2+i*4.2,Y0+15,2,8,'#24262a');}
  /* les papiers par terre : tickets, emballages de chichis, une écharpe perdue */
  for(let k=0;k<26;k++){const x=hA(k,61,1)*W,y=Y0+20+hA(k,62,1)*(BOUL-Y0-40),a=hA(k,63,1)*3,t=hA(k,64,1);
    g.save();g.translate(x,y);g.rotate(a);g.fillStyle=t>.7?'#f4f0e4':t>.4?'#e8d8b0':'#f8f8f8';g.fillRect(-3,-1.6,6,3.2);
    if(t<.4){R(g,-3,-1.6,6,.8,'#2f9ae0');}g.restore();}
  g.save();g.translate(1020,Y0+260);g.rotate(.4);for(let i=0;i<8;i++)R(g,i*4,0,4,5,i%2?'#ffffff':'#2f9ae0');R(g,32,1,3,2,'#ffffff');R(g,-3,1,3,2,'#ffffff');g.restore();
  /* le trottoir, la bordure, le boulevard Michelet */
  R(g,0,BOUL,W,10,'#c8c2b6');R(g,0,BOUL,W,1.4,'#f2eee6');R(g,0,BOUL+10,W,3,'#8a8680');
  g.fillStyle=lin(g,0,BOUL+13,0,H,[[0,'#4e5258'],[1,'#5a5e64']]);g.fillRect(0,BOUL+13,W,H-BOUL-13);
  for(let i=0;i<900;i++){const x=hA(i,1,7)*W,y=BOUL+14+hA(i,2,7)*(H-BOUL-14);R(g,x,y,1,1,hA(i,3,7)>.5?'rgba(255,255,255,.07)':'rgba(0,0,0,.1)');}
  for(let x=10;x<W;x+=60)R(g,x,BOUL+40,30,2.4,'rgba(250,250,240,.75)');
  for(let x=W/2-70;x<W/2+70;x+=16)R(g,x,BOUL+15,9,H-BOUL-18,'rgba(248,248,240,.85)');
}
/* ---------- LES CÔTÉS : le mur à l'affiche à gauche, l'immeuble rond et le panneau de la boutique à droite ---------- */
function immeubleRond(g){
  /* derrière la coque, à droite : la tour ronde aux balcons filants */
  const x0=1490,x1=1600,yb=YC,yt=150;
  g.fillStyle=lin(g,x0,0,x1,0,[[0,'#a8a49c'],[.35,'#e8e4dc'],[1,'#b8b4ac']]);g.fillRect(x0,yt,x1-x0,yb-yt);
  for(let y=yt+8;y<yb;y+=16){R(g,x0,y,x1-x0,3,'#f8f6f0');R(g,x0,y+3,x1-x0,1,'rgba(0,0,0,.25)');
    for(let x=x0+4;x<x1;x+=12)R(g,x,y+5,8,8,'rgba(70,90,110,.55)');}
  g.fillStyle='#d8d4cc';g.beginPath();g.ellipse((x0+x1)/2+20,yt,60,8,0,0,7);g.fill();
  /* et un immeuble de bureaux vitré, plus bas */
  R(g,1440,YC-60,60,60,'#4a6c88');for(let y=YC-56;y<YC;y+=8)R(g,1440,y,60,1,'#c8d4de');for(let x=1444;x<1500;x+=10)R(g,x,YC-60,1,60,'#c8d4de');}
function cotes(g){
  /* à gauche : un mur haut, crème, avec la grande affiche du prochain match */
  R(g,0,YC-70,ESC0,Y0-YC+70,'#e2ddd2');R(g,0,YC-70,ESC0,3,'#f6f2ea');R(g,ESC0-4,YC-70,4,Y0-YC+70,'#c8c2b6');
  const ax=14,ay=YC-56,aw=ESC0-34,ah=150;
  R(g,ax+2,ay+2,aw,ah,'rgba(0,0,0,.25)');
  g.fillStyle=lin(g,0,ay,0,ay+ah,[[0,'#0c1a3a'],[.6,'#1c3a7a'],[1,'#2f9ae0']]);g.fillRect(ax,ay,aw,ah);
  /* l'affiche : la pelouse vue d'en haut, les projecteurs, la date */
  for(let k=0;k<5;k++){g.fillStyle='rgba(255,255,255,'+(.1+k*.03)+')';g.beginPath();g.moveTo(ax+aw/2,ay+20);g.lineTo(ax+8+k*(aw-16)/4-6,ay+ah-40);g.lineTo(ax+8+k*(aw-16)/4+6,ay+ah-40);g.fill();}
  g.fillStyle='#2e8a3e';g.beginPath();g.ellipse(ax+aw/2,ay+ah-38,aw*.42,12,0,0,7);g.fill();R(g,ax+aw/2-.5,ay+ah-50,1,24,'rgba(255,255,255,.7)');
  g.strokeStyle='rgba(255,255,255,.7)';g.lineWidth=.8;g.beginPath();g.ellipse(ax+aw/2,ay+ah-38,6,3,0,0,7);g.stroke();
  txt(g,'SAMEDI',ax+aw/2,ay+ah-20,10,'#ffffff','center','900');txt(g,'21H00',ax+aw/2,ay+ah-8,9,'#f2c43a','center','900');
  txt(g,'GRAND MATCH',ax+aw/2,ay+12,9,'#ffffff','center','900');
  R(g,ax,ay,aw,1.2,'rgba(255,255,255,.4)');
  /* à droite : le muret, avec le grand panneau bleu de la boutique */
  R(g,ESC1,YC-20,W-ESC1,Y0-YC+20,'#dcd8ce');R(g,ESC1,YC-20,W-ESC1,2,'#f2eee6');R(g,ESC1,YC-20,4,Y0-YC+20,'#c8c2b6');
  const bx=ESC1+16,by=YC+6;R(g,bx+2,by+2,110,62,'rgba(0,0,0,.25)');R(g,bx,by,110,62,'#2f86d0');R(g,bx,by,110,2,'#7ac0f0');
  R(g,bx+6,by+6,98,1,'rgba(255,255,255,.4)');txt(g,'BOUTIQUE',bx+55,by+22,12,'#ffffff','center','900');txt(g,'DU STADE',bx+55,by+36,9,'#ffffff','center','bold');
  g.fillStyle='#ffffff';g.beginPath();g.moveTo(bx+40,by+50);g.lineTo(bx+70,by+50);g.lineTo(bx+70,by+46);g.lineTo(bx+78,by+52);g.lineTo(bx+70,by+58);g.lineTo(bx+70,by+54);g.lineTo(bx+40,by+54);g.fill();
  R(g,bx+20,by+62,3,Y0-by-62,'#6a7076');R(g,bx+87,by+62,3,Y0-by-62,'#6a7076');}
/* LA FRESQUE VIEILLIE : couleurs passées, marches usées au milieu des volées, éclats */
function usure(g){const y0=YC+4,hm=(Y0-y0)/NM;
  g.save();g.beginPath();g.rect(ESC0,y0,ESC1-ESC0,Y0-y0);g.clip();
  g.fillStyle='rgba(236,234,226,.16)';g.fillRect(ESC0,y0,ESC1-ESC0,Y0-y0);
  for(const x of [ESC0+170,ESC0+340+150,W/2+180,ESC1-150]){g.fillStyle=lin(g,x-70,0,x+70,0,[[0,'rgba(200,196,186,0)'],[.5,'rgba(200,196,186,.35)'],[1,'rgba(200,196,186,0)']]);
    for(let k=0;k<NM;k++)g.fillRect(x-70,y0+k*hm,140,hm*.62);}
  for(let i=0;i<1300;i++){const x=ESC0+hA(i,71,1)*(ESC1-ESC0),k=Math.floor(hA(i,72,1)*NM),y=y0+k*hm+hA(i,73,1)*hm*.6;
    R(g,x,y,1+hA(i,74,1)*3,.8+hA(i,75,1),hA(i,76,1)>.4?'rgba(236,234,228,.45)':'rgba(120,118,112,.3)');}
  /* des coulures sous les grands aplats */
  for(let i=0;i<70;i++){const x=ESC0+hA(i,81,1)*(ESC1-ESC0),y=y0+hA(i,82,1)*(Y0-y0-10);R(g,x,y,1,3+hA(i,83,1)*6,'rgba(0,0,0,.08)');}
  g.restore();
  /* les écharpes nouées aux rampes */
  for(const [x,c] of [[ESC0+340,'#2f9ae0'],[W/2+20,'#14306a'],[ESC1-300,'#2f9ae0']]){const y=y0+hm*4;
    for(let i=0;i<6;i++)R(g,x-1.5,y+i*3,3,3,i%2?'#ffffff':c);for(let i=0;i<4;i++)R(g,x+1.5+i*.6,y+16+i*3,2.4,3,i%2?'#ffffff':c);
    R(g,x-4,y+18,1,3,'#ffffff');R(g,x-2,y+18,1,3,'#ffffff');}}
function peindreSol(g){ciel(g);immeubleRond(g);enceinte(g);escalier(g);usure(g);cotes(g);parvis(g);}
function sol(){const c=document.createElement('canvas');c.width=W;c.height=H;peindreSol(c.getContext('2d'));return c;}
function solFin(){const c=document.createElement('canvas');c.width=W*2;c.height=H*2;const g=c.getContext('2d');g.setTransform(2,0,0,2,0,0);peindreSol(g);return c;}

/* ---------- LES SPRITES ---------- */
const T={};
const memo=(k,f)=>T[k]||(T[k]=f());
/* le platane, tronc tacheté, grille de fonte au pied */
function graverPlatane(v){return memo('pl'+v,()=>{const Wd=120,Hd=150,sol=142,x=60;const {c,g}=toile(Wd,Hd);
  ombreSol(g,x+10,sol-2,40,9,.2);
  R(g,x-14,sol-5,28,7,'#3a3a3a');for(let i=0;i<6;i++)R(g,x-12+i*4.6,sol-4,2.4,5,'#5a5a58');
  g.fillStyle='#b8ae96';g.beginPath();g.moveTo(x-5,sol-3);g.lineTo(x-3.4,sol-70);g.lineTo(x+3.4,sol-70);g.lineTo(x+5,sol-3);g.fill();
  for(let i=0;i<16;i++){g.fillStyle=['#e4dcc4','#8a8670','#d0c8a8'][i%3];g.beginPath();g.ellipse(x-3+hA(i,v,1)*6,sol-8-hA(i,v,2)*60,1.6,3,0,0,7);g.fill();}
  g.strokeStyle='#a89e86';g.lineWidth=2.4;for(const s of [-1,1]){g.beginPath();g.moveTo(x,sol-62);g.quadraticCurveTo(x+s*10,sol-80,x+s*22,sol-92);g.stroke();}
  const P=[['#2e4a22','#46682e','#6a8e3e','#9ab85a'],['#2a4620','#42642a','#648a3a','#92b252']][v%2];
  fe(g,x,sol-102,44,32,P,900,11+v,2.2);fe(g,x-20,sol-90,22,16,P,240,21+v,2);fe(g,x+22,sol-94,22,16,P,240,31+v,2);
  return {toile:c,W:Wd,H:Hd,sol};});}
/* le grand lampadaire du parvis */
function graverLampe(){return memo('lp',()=>{const Wd=40,Hd=130,sol=124,x=20;const {c,g}=toile(Wd,Hd);
  g.fillStyle='rgba(40,34,26,.2)';g.beginPath();g.ellipse(x+12,sol,16,3,0,0,7);g.fill();
  R(g,x-4,sol-6,8,6,'#5a6066');R(g,x-1.6,sol-112,3.2,108,'#6a7076');R(g,x-1.6,sol-112,1,108,'#b0b8c0');
  R(g,x-14,sol-118,28,6,'#4a5056');R(g,x-12,sol-112,24,2,'#fdf6d8');
  return {toile:c,W:Wd,H:Hd,sol};});}
/* les tourniquets devant les portes */
function graverTourniquets(){return memo('tq',()=>{const Wd=PORTE_L+10,Hd=36,sol=30;const {c,g}=toile(Wd,Hd);
  g.fillStyle='rgba(40,34,26,.18)';g.fillRect(6,sol-2,Wd-8,5);
  for(let k=0;k<5;k++){const x=5+k*(PORTE_L/4);R(g,x-4,sol-20,8,20,'#c8ced4');R(g,x-4,sol-20,8,2,'#eef2f6');R(g,x-4,sol-2,8,2,'#7a828a');R(g,x-2,sol-16,4,3,k%2?'#3ac46a':'#e04a3a');
    if(k<4){g.strokeStyle='#9aa2aa';g.lineWidth=1.4;for(let j=0;j<3;j++){g.beginPath();g.moveTo(x+4,sol-12+j*1.4);g.lineTo(x+14,sol-10+j*3);g.stroke();}}}
  return {toile:c,W:Wd,H:Hd,sol};});}
/* la billetterie : une cabine bleue et blanche */
function graverBilletterie(){return memo('bi',()=>{const Wd=150,Hd=112,sol=104,x=28,w=94;const {c,g}=toile(Wd,Hd);
  ombreSol(g,Wd/2,sol-2,62,8,.24);
  /* le corps : tôle laquée blanche, panneaux latéraux bleus */
  g.fillStyle=lin(g,x,0,x+w,0,[[0,'#e8ecf0'],[.4,'#ffffff'],[1,'#d4dae0']]);g.fillRect(x,sol-66,w,66);
  R(g,x,sol-66,8,66,'#22488a');R(g,x+w-8,sol-66,8,66,'#1c3c74');R(g,x,sol-66,w,1.4,'#fff');
  for(let y=sol-60;y<sol-8;y+=6)R(g,x+8,y,w-16,.5,'rgba(120,130,140,.18)');
  R(g,x,sol-8,w,8,'#3a3e44');R(g,x,sol-8,w,1,'#6a7076');
  /* deux guichets, hygiaphone, tablette inox, un guichetier deviné */
  for(let k=0;k<2;k++){const gx=x+14+k*36;R(g,gx,sol-54,30,30,'#2a3a4c');g.fillStyle=lin(g,0,sol-52,0,sol-26,[[0,'#8ab4d0'],[1,'#d4e6f0']]);g.fillRect(gx+2,sol-52,26,26);
    if(k===0){g.fillStyle='#3a4250';g.beginPath();g.arc(gx+15,sol-40,4,0,7);g.fill();R(g,gx+8,sol-36,14,10,'#22488a');}
    g.fillStyle='rgba(30,40,50,.6)';g.beginPath();g.arc(gx+15,sol-34,3,0,7);g.fill();for(let i=0;i<3;i++)R(g,gx+13.4+i*1.2,sol-35.5,.5,3,'#c8d0d8');
    R(g,gx+6,sol-50,7,20,'rgba(255,255,255,.35)');R(g,gx-1,sol-25,32,3,'#d0d6dc');R(g,gx-1,sol-25,32,.8,'#ffffff');
    R(g,gx+10,sol-22,10,1.4,'#1a1c20');}
  /* l'auvent et l'enseigne lumineuse */
  g.fillStyle='#14306a';g.beginPath();g.moveTo(x-6,sol-66);g.lineTo(x+w+6,sol-66);g.lineTo(x+w+2,sol-86);g.lineTo(x-2,sol-86);g.fill();
  R(g,x-6,sol-67,w+12,1.6,'#0a1c44');R(g,x-2,sol-86,w+4,1.4,'#4a7ad0');txt(g,'BILLETTERIE',x+w/2,sol-76,9,'#ffffff','center','900');
  /* l'affiche des tarifs, sur le côté */
  R(g,x+w-6,sol-58,0,0,'#fff');
  /* la file d'attente : poteaux et sangle bleue */
  for(const px of [8,22,Wd-22,Wd-8]){R(g,px-1.4,sol-18,2.8,18,'#b8c0c8');R(g,px-1.4,sol-18,1,18,'#ffffff');R(g,px-3,sol-2,6,2,'#6a7076');}
  g.strokeStyle='#2f9ae0';g.lineWidth=2;g.beginPath();g.moveTo(8,sol-15);g.quadraticCurveTo(15,sol-11,22,sol-15);g.stroke();g.beginPath();g.moveTo(Wd-22,sol-15);g.quadraticCurveTo(Wd-15,sol-11,Wd-8,sol-15);g.stroke();
  /* le panneau sur pied : prochain match */
  return {toile:c,W:Wd,H:Hd,sol};});}
/* le camion à chichis et panisses */
function graverCamion(){return memo('ca',()=>{const Wd=176,Hd=100,sol=94,x=12,w=132;const {c,g}=toile(Wd,Hd);
  ombreSol(g,x+w/2,sol-4,72,9,.26);
  /* la carrosserie crème et jaune, ses arrondis, sa ligne rouge */
  g.fillStyle=lin(g,0,sol-70,0,sol-10,[[0,'#fff1c8'],[.5,'#f8d276'],[1,'#e8b44a']]);g.beginPath();g.roundRect(x,sol-70,w,60,10);g.fill();
  g.strokeStyle='rgba(140,90,20,.5)';g.lineWidth=1;g.stroke();
  R(g,x+2,sol-24,w-4,5,'#c8382a');R(g,x+2,sol-24,w-4,1.2,'#e86a50');
  /* la cabine, à gauche : pare-brise, rétro, phare */
  g.fillStyle=lin(g,0,sol-62,0,sol-40,[[0,'#d8eef8'],[1,'#8cc0dc']]);g.beginPath();g.roundRect(x+4,sol-62,28,22,4);g.fill();
  R(g,x+8,sol-60,6,18,'rgba(255,255,255,.4)');R(g,x-3,sol-50,4,7,'#3a3e44');g.fillStyle='#fffbe0';g.beginPath();g.arc(x+6,sol-18,3,0,7);g.fill();
  /* le comptoir ouvert : l'intérieur chaud, la friteuse, les chichis dorés */
  R(g,x+40,sol-58,84,30,'#3a2a1e');g.fillStyle=lin(g,0,sol-56,0,sol-30,[[0,'#ffe6a8'],[1,'#f2a846']]);g.fillRect(x+42,sol-56,80,26);
  R(g,x+46,sol-50,22,14,'#9aa0a6');R(g,x+47,sol-49,20,4,'#c8a040');
  for(let k=0;k<5;k++){g.strokeStyle='#d89a3a';g.lineWidth=3;g.lineCap='round';g.beginPath();g.moveTo(x+74+k*9,sol-36);g.quadraticCurveTo(x+77+k*9,sol-44,x+74+k*9,sol-50);g.stroke();
    g.strokeStyle='rgba(255,240,200,.8)';g.lineWidth=.8;g.stroke();}g.lineCap='butt';
  g.fillStyle='#3a4250';g.beginPath();g.arc(x+108,sol-46,5,0,7);g.fill();R(g,x+102,sol-41,12,12,'#ffffff');R(g,x+101,sol-52,14,3,'#ffffff');
  R(g,x+40,sol-30,84,3.4,'#d0d6dc');R(g,x+40,sol-30,84,.8,'#ffffff');
  /* l'auvent rayé rouge et blanc, relevé */
  for(let k=0;k<8;k++){g.fillStyle=k%2?'#ffffff':'#d0402a';g.beginPath();g.moveTo(x+38+k*11,sol-70);g.lineTo(x+49+k*11,sol-70);g.lineTo(x+52+k*11,sol-82);g.lineTo(x+41+k*11,sol-82);g.fill();}
  for(let k=0;k<8;k++){g.fillStyle=k%2?'#ffffff':'#d0402a';g.beginPath();g.arc(x+46.5+k*11,sol-82,5.5,Math.PI,0);g.fill();}
  /* l'enseigne sur le toit */
  R(g,x+44,sol-96,76,12,'#c8382a');R(g,x+44,sol-96,76,1.2,'#ff8a70');txt(g,'CHEZ MOMO',x+82,sol-89.6,8.4,'#fff6d8','center','900');
  txt(g,'CHICHIS · PANISSES',x+w/2+10,sol-14.6,7.4,'#ffffff');
  /* la bouteille de gaz, les roues */
  R(g,x+w+1,sol-26,9,18,'#2a7ac8');R(g,x+w+2,sol-30,7,4,'#9aa0a6');
  for(const rx of [x+24,x+w-24]){g.fillStyle='#1a1c20';g.beginPath();g.arc(rx,sol-8,9,0,7);g.fill();g.fillStyle='#8a9098';g.beginPath();g.arc(rx,sol-8,4,0,7);g.fill();R(g,rx-1,sol-9,2,2,'#d0d4d8');}
  /* l'ardoise sur pied, devant */
  const ax=Wd-14;g.strokeStyle='#6a4a2a';g.lineWidth=2;g.beginPath();g.moveTo(ax-8,sol);g.lineTo(ax-4,sol-26);g.lineTo(ax+4,sol-26);g.lineTo(ax+8,sol);g.stroke();
  R(g,ax-8,sol-30,16,20,'#2a2e2c');R(g,ax-8,sol-30,16,1,'#6a4a2a');txt(g,'2€',ax,sol-23,6.6,'#f8f4e8','center','bold');txt(g,'chichi',ax,sol-16,4.4,'#f8f4e8','center','normal');
  return {toile:c,W:Wd,H:Hd,sol};});}
/* le poteau d'arrêt du tram : totem bleu, plan de ligne */
function graverArret(){return memo('ar',()=>{const Wd=40,Hd=96,sol=90,x=20;const {c,g}=toile(Wd,Hd);
  g.fillStyle='rgba(40,34,26,.22)';g.beginPath();g.ellipse(x+8,sol,12,2.6,0,0,7);g.fill();
  R(g,x-2,sol-60,4,60,'#5a6066');R(g,x-9,sol-86,18,30,'#1c4f9c');R(g,x-9,sol-86,18,1.4,'#5a8ad8');
  txt(g,'T',x,sol-78,10,'#ffffff','center','900');R(g,x-7,sol-70,14,10,'#ffffff');txt(g,'Vélodrome',x,sol-65,3.2,'#1c4f9c','center','bold');
  R(g,x-6,sol-50,12,16,'#f4f6f8');for(let i=0;i<4;i++)R(g,x-4,sol-47+i*3.4,8,.8,'#8a96a2');
  return {toile:c,W:Wd,H:Hd,sol};});}
/* le grand mât d'éclairage au pied de l'escalier, deux têtes */
function graverGrandLampe(){return memo('gl',()=>{const Wd=60,Hd=230,sol=224,x=30;const {c,g}=toile(Wd,Hd);
  g.fillStyle='rgba(40,34,26,.22)';g.beginPath();g.ellipse(x+14,sol,20,3.4,0,0,7);g.fill();
  R(g,x-5,sol-10,10,10,'#4a5056');R(g,x-2.4,sol-200,4.8,192,'#5a6066');R(g,x-2.4,sol-200,1.4,192,'#a8b0b8');
  for(const s of [-1,1]){R(g,s<0?x-22:x+2,sol-202,20,3,'#4a5056');R(g,s<0?x-26:x+12,sol-206,14,8,'#3a3e44');R(g,s<0?x-25:x+13,sol-199,12,1.6,'#fdf6d8');}
  return {toile:c,W:Wd,H:Hd,sol};});}
/* le mât à drapeau, aux couleurs du stade */
function graverDrapeau(v){return memo('dr'+v,()=>{const Wd=50,Hd=120,sol=114,x=8;const {c,g}=toile(Wd,Hd);
  g.fillStyle='rgba(40,34,26,.2)';g.beginPath();g.ellipse(x+8,sol,10,2.4,0,0,7);g.fill();
  R(g,x-1.4,sol-110,2.8,110,'#c8ced4');R(g,x-.6,sol-110,.8,110,'#fff');
  g.beginPath();g.arc(x,sol-111,2.4,0,7);g.fillStyle='#e8c860';g.fill();
  for(let k=0;k<3;k++){g.fillStyle=k===1?'#ffffff':(v?CIEL:BLEU);g.beginPath();
    for(let i=0;i<=10;i++){const xx=x+1.4+i*3.6,yy=sol-106+k*8+Math.sin(i*.7+v)*2;i===0?g.moveTo(xx,yy):g.lineTo(xx,yy);}
    for(let i=10;i>=0;i--){const xx=x+1.4+i*3.6,yy=sol-98+k*8+Math.sin(i*.7+v)*2;g.lineTo(xx,yy);}g.fill();}
  return {toile:c,W:Wd,H:Hd,sol};});}
/* le banc de béton, assise en bois */
function graverBanc(){return memo('bc',()=>{const Wd=84,Hd=26,sol=22;const {c,g}=toile(Wd,Hd);
  g.fillStyle='rgba(40,34,26,.2)';g.fillRect(8,sol-1,72,4);
  R(g,4,sol-10,76,10,'#cfcac0');R(g,4,sol-10,76,1.4,'#f0ece4');
  R(g,6,sol-14,72,5,'#b8875a');R(g,6,sol-14,72,1.4,'#dcae7c');for(let x=6;x<78;x+=9)R(g,x,sol-14,.5,5,'rgba(80,50,20,.3)');
  return {toile:c,W:Wd,H:Hd,sol};});}

/* ---------- LE DÉCOR ---------- */
function decor(){const D=[];const P=(t,x,y,o)=>D.push(Object.assign({t,x,y,gr:0},o||{}));
  /* au pied de l'escalier, on ne monte pas : le stade est fermé */
  for(const x of [380,800,1220])P('x_jol_std_vide_sol',x,Y0+14,{col:[1,1],parler:['Le stade est fermé aujourd’hui.','Revenez un soir de match !']});
  /* les drapeaux et les deux grands mâts d'éclairage, de part et d'autre de l'escalier */
  for(const [x,v] of [[205,0],[1395,1]])P('x_jol_std_drapeau_sol',x,Y0+30,{col:[10,6],v});
  for(const x of [ESC0+10,ESC1-10])P('x_jol_std_vide_sol',x,Y0+22,{col:[12,6],anim:'std_lum',spr:'x_jol_std_grandlampe_sol',lum:[[-17,-200,70,'rgba(255,236,190,1)'],[17,-200,70,'rgba(255,236,190,1)'],[0,0,60,'rgba(255,230,180,1)']]});
  /* la billetterie, le camion à chichis */
  P('x_jol_std_vide_sol',470,520,{col:[96,16],anim:'std_lum',spr:'x_jol_std_billetterie_sol',lum:[[0,-50,46,'rgba(190,220,255,1)'],[0,-80,30,'rgba(255,255,255,1)']],parler:['Billetterie du Vélodrome.','Pas de match ce soir… Le prochain arrive bientôt !']});
  P('x_jol_std_vide_sol',1140,530,{col:[132,18],anim:'std_lum',spr:'x_jol_std_camion_sol',lum:[[18,-44,54,'rgba(255,200,120,1)'],[6,-90,26,'rgba(255,120,90,1)']],parler:['Chichis tout chauds, panisses !','Deux euros le chichi, c’est cadeau.','Momo, c’est moi. Trente ans devant ce stade.']});
  /* la rangée de platanes, le long du boulevard, avec ses lampadaires */
  let i=0;for(const x of [90,300,520,1080,1300,1510]){P('x_jol_std_platane_sol',x,BOUL-12,{col:[16,8],v:i++});}
  for(const x of [195,410,1190,1405])P('x_jol_std_vide_sol',x,BOUL-14,{col:[8,6],anim:'std_lum',spr:'x_jol_std_lampe_sol',lum:[[0,-112,40,'rgba(255,230,170,1)'],[0,-10,56,'rgba(255,220,160,1)']]});
  /* l'arrêt de tram, sur le trottoir : on rentre à la Joliette */
  P('x_jol_std_arret_sol',740,BOUL+4,{col:[30,6],agir:rentrer,libelle:'Rentrer en tram',nom:'TRAM'});
  /* des bancs */
  for(const [x,y] of [[200,560],[1400,560],[650,650],[950,650]])P('x_jol_std_banc_sol',x,y,{col:[76,8]});
  /* les pigeons du parvis */
  for(const [x,y] of [[640,470],[1000,610],[300,640]])P('x_jol_std_vide_sol',x,y,{anim:'std_pigeons'});
  /* LA NUIT : la coque éclairée, la bande rayée, les tentes, la fresque, les affiches */
  const L=[];for(let x=140;x<=1460;x+=110)L.push([x-800,coqueH(x)+40-Y0,90,'rgba(215,232,255,1)']);
  for(let x=320;x<=1280;x+=120)L.push([x-800,196-Y0,44,'rgba(255,214,150,1)']);
  for(let x=380;x<=1220;x+=92)L.push([x-800,YC-16-Y0,26,'rgba(255,246,220,1)']);
  for(let x=300;x<=1300;x+=200)L.push([x-800,-60,70,'rgba(235,240,255,1)']);
  for(let x=220;x<=1380;x+=145)L.push([x-800,70,90,'rgba(225,232,255,1)']);   /* la lumière du stade qui déborde sur le parvis */
  for(let x=150;x<=1450;x+=260)L.push([x-800,250,80,'rgba(255,226,170,1)']);
  L.push([75-800,YC+30-Y0,60,'rgba(120,170,255,1)'],[ESC1+70-800,YC+40-Y0,46,'rgba(90,170,255,1)'],[0,-Y0+20,220,'rgba(200,220,255,1)'],[1545-800,200-Y0,40,'rgba(255,220,160,1)']);
  for(const [dx,dy,r,c] of L)P('x_jol_std_vide_sol',800+dx,Y0+1+dy,{anim:'std_lum',lum:[[0,0,r,c]]});
  return D;}
/* un objet qui dessine son sprite, puis ses lumières la nuit */
const SPR={};
ANIM_DECOR.std_lum=(g,o,x,y)=>{
  if(o.spr){const t=SPR[o.spr]||(SPR[o.spr]=graver(o.spr,o.v||0)),X0=Math.round(x-t.W/2),Y1=Math.round(y-t.sol);g.drawImage(t.toile,X0,Y1,t.W,t.H);
    let k=0;try{k=nuitDecor();}catch(e){}if(k>.02){g.globalAlpha=k;g.drawImage(versionNuit(t),X0,Y1,t.W,t.H);g.globalAlpha=1;}}
  if(o.lum&&typeof lueurNuit==='function')for(const [dx,dy,r,c] of o.lum)lueurNuit(g,x+dx,y+dy,r,c);};
/* LES PIGEONS : ils picorent, se dandinent, s'envolent quand on approche, et reviennent */
const VOLEES={};
ANIM_DECOR.std_pigeons=(g,o,x,y)=>{const now=performance.now()/1000;let V=VOLEES[o.x+','+o.y];if(!V)V=VOLEES[o.x+','+o.y]={t:-99};
  let pres=false;try{pres=Math.hypot(joueur.x-o.x,joueur.y-o.y)<70;}catch(e){}
  if(pres&&now-V.t>8)V.t=now;const dt=now-V.t,vol=dt<8;
  for(let k=0;k<6;k++){const bx=x+(hA(k,o.x,1)-.5)*70,by=y+(hA(k,o.y,2)-.5)*30;
    let px=bx,py=by,al=1;
    if(vol){if(dt<2.4){const e=dt/2.4;px=bx+(hA(k,5,3)-.3)*260*e;py=by-200*e*e-30*e;al=1-e;}else if(dt<6.5){continue;}else{const e=(8-dt)/1.5;px=bx+e*80;py=by-e*e*120;al=1-e;}}
    if(al<=0)continue;g.globalAlpha=al;
    const pick=!vol&&Math.sin(now*3+k*2.1)>.6,dir=hA(k,9,9)>.5?1:-1,hop=!vol?Math.max(0,Math.sin(now*1.3+k))*0:0;
    g.fillStyle='rgba(20,20,24,.2)';g.beginPath();g.ellipse(bx,by+1,4,1.2,0,0,7);g.fill();
    g.fillStyle='#8a8e98';g.beginPath();g.ellipse(px,py-3-hop,4.2,2.6,0,0,7);g.fill();
    g.fillStyle='#6a6e7a';g.beginPath();g.ellipse(px-dir*3,py-3.2,2.4,1.4,0,0,7);g.fill();
    g.fillStyle='#5a7a6a';g.beginPath();g.ellipse(px+dir*2.6,py-4.6+(pick?2.2:0),1.6,1.6,0,0,7);g.fill();
    g.fillStyle='#4a4e58';g.beginPath();g.arc(px+dir*3.6,py-5.6+(pick?2.6:0),1.5,0,7);g.fill();
    g.fillStyle='#e8a050';g.fillRect(px+dir*5-(dir<0?1:0),py-5.6+(pick?2.6:0),1,.8);
    if(vol){g.fillStyle='#9aa0aa';const f=Math.sin(now*30+k)*3;g.beginPath();g.ellipse(px-1,py-5-f,4,1.4,f*.2,0,7);g.fill();}
    else{R(g,px-.8,py-.6,.6,1.6,'#d07050');R(g,px+.6,py-.6,.6,1.6,'#d07050');}
  }g.globalAlpha=1;};
/* LES SUPPORTERS : quelques-uns traversent, d'autres font la queue au camion ou discutent */
const TOURNEES=[
  {pts:[[60,600],[1540,600]],v:24,n:2},{pts:[[1540,470],[60,470]],v:20,n:2},
  {pts:[[700,690],[700,420],[900,420],[900,690]],v:18,n:1}];
const POSES=[[1112,566,'haut'],[1128,580,'haut'],[1150,592,'haut'],[452,552,'haut'],[488,556,'haut'],[250,452,'droite'],[278,452,'gauche'],[1330,520,'bas']];
const GENS=[];
(()=>{let k=0;const ap=k=>({peau:[1,3,5,2,6,4][k%6],cheveux:[1,4,6,0,10,2][k%6],coiffe:[0,6,2,15,5,1][k%6],barbe:k%4===1?3:0,haut:[1,1,3,1,6,1][k%6],veste:[18,0,8,24,11,0][k%6],pantalon:[0,7,10,2,8,0][k%6],bas:[0,5,0,2,0,0][k%6],souliers:1,chaussures:[6,0,7,1,9,6][k%6],sac:0,chapeau:0,raye:0,motif:0,_pnj:true});
  for(const T of TOURNEES){let L=0;const seg=[];for(let i=0;i<T.pts.length;i++){const a=T.pts[i],b=T.pts[(i+1)%T.pts.length],d=Math.hypot(b[0]-a[0],b[1]-a[1]);seg.push([a,b,L,d]);L+=d;}
    for(let j=0;j<T.n;j++){GENS.push({seg,L,v:T.v*(0.85+hA(k,3,1)*.3),dec:L*(j/T.n)+hA(k,4,1)*60,sens:1,ap:ap(k),x:0,y:0,dir:'bas',pas:0});k++;}}
  for(const [x,y,d] of POSES){GENS.push({fixe:true,ap:ap(k),x,y,dir:d,pas:0});k++;}})();
function figurants(){const now=Date.now()/1000;
  for(const P of GENS){if(P.fixe)continue;let s=((now*P.v+P.dec)%P.L+P.L)%P.L;
    for(const [a,b,L0,d] of P.seg){if(s<=L0+d){const t=(s-L0)/d;P.x=a[0]+(b[0]-a[0])*t;P.y=a[1]+(b[1]-a[1])*t;
      const dx=b[0]-a[0],dy=b[1]-a[1];P.dir=Math.abs(dx)>Math.abs(dy)?(dx>0?'droite':'gauche'):(dy>0?'bas':'haut');P.pas=now*P.v/9;break;}}}
  return GENS;}

function bloque(x,y){
  if(x<12||x>W-12)return true;
  if(y<Y0+12)return true;
  if(y>H-6)return true;
  for(const o of DECOR){if(!o.col)continue;if(Math.abs(x-o.x)<o.col[0]/2&&y>o.y-o.col[1]&&y<o.y+3)return true;}
  return false;}
const GRAVEURS={x_jol_std_platane_sol:graverPlatane,x_jol_std_lampe_sol:graverLampe,x_jol_std_tourniquets_sol:graverTourniquets,
  x_jol_std_billetterie_sol:graverBilletterie,x_jol_std_camion_sol:graverCamion,x_jol_std_drapeau_sol:graverDrapeau,x_jol_std_banc_sol:graverBanc,x_jol_std_grandlampe_sol:graverGrandLampe,x_jol_std_arret_sol:graverArret,x_jol_std_vide_sol:()=>({toile:document.createElement('canvas'),W:1,H:1,sol:0})};
function graver(t,v){const r=(GRAVEURS[t]||(()=>({toile:document.createElement('canvas'),W:1,H:1,sol:0})))(v||0);return {toile:r.toile,W:r.W,H:r.H,sol:r.sol};}

/* LA SORTIE : en traversant le boulevard, on rentre sur la place de la Joliette */
let PARTI=false;
setInterval(()=>{try{if(PARTI||typeof joueur==='undefined')return;if(joueur.y>H-14)sortir();}catch(x){}},150);
function sortir(){if(PARTI)return;PARTI=true;try{sauver();}catch(x){}
  try{const f=document.createElement('div');f.style.cssText='position:fixed;inset:0;z-index:2147483000;background:#fff8ea;opacity:0;transition:opacity .45s;pointer-events:none';document.body.appendChild(f);requestAnimationFrame(()=>f.style.opacity='1');}catch(x){}
  setTimeout(()=>{const v=window.MA_VERSION?('&v='+encodeURIComponent(window.MA_VERSION)):'';location.href='spawn.html?de=stade'+v;},480);}
/* LE RETOUR : l'arrêt de tram, sur le trottoir du boulevard */
function rentrer(){sortir();}

return {sol,solFin,decor,bloque,graver,depart:DEPART,figurants};
})()
