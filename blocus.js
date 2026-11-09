/* =====================================================================
   LE BLOCUS — une carte d'essai à part (blocus.html).
   La porte 4 du port, un matin de grève. On attrape les poubelles à
   roulettes, on les pousse devant la porte ; à quatre, le blocus tient
   et le camion reste dehors à klaxonner. On peut aussi y mettre le feu.
   Tout est local : rien n'est envoyé au serveur, tout repart à zéro
   quand on recharge. Chargé par moteur.js (eval direct).
   ===================================================================== */
(()=>{
const W=800, H=800;
const DEPART=[400,700];
const hA=(x,y,k)=>{let n=((x*73856093)^(y*19349663)^(k*83492791))|0;n=(n^(n>>>13))*1274126177|0;return((n^(n>>>16))>>>0)/4294967296;};
const lin=(g,x0,y0,x1,y1,st)=>{const gr=g.createLinearGradient(x0,y0,x1,y1);st.forEach(([o,c])=>gr.addColorStop(o,c));return gr;};
const R=(g,x,y,w,h,c)=>{g.fillStyle=c;g.fillRect(x,y,w,h);};
function toile(L,HH){const D=2,c=document.createElement('canvas');c.width=Math.ceil(L*D);c.height=Math.ceil(HH*D);const g=c.getContext('2d');g.setTransform(D,0,0,D,0,0);return {c,g};}
function fe(g,cx,cy,rx,ry,pal,n,seed,t){t=t||1;for(let i=0;i<n;i++){const a=hA(i,seed,1)*Math.PI*2,r=Math.sqrt(hA(i,seed,2));const x=cx+Math.cos(a)*rx*r,y=cy+Math.sin(a)*ry*r;
  const lum=((cx-x)/rx+(cy-y)/ry)*.5+hA(i,seed,3)*.4;g.fillStyle=lum>.55?pal[3]:lum>.15?pal[2]:lum>-.3?pal[1]:pal[0];
  g.beginPath();g.ellipse(x,y,(1.2+hA(i,seed,4)*1.6)*t,(.9+hA(i,seed,5)*1)*t,hA(i,seed,6)*3,0,7);g.fill();}}
function ombreSol(g,cx,cy,rx,ry,a){g.fillStyle='rgba(40,34,26,'+(a||.18)+')';g.beginPath();g.ellipse(cx+4,cy+3,rx,ry,0,0,7);g.fill();}
const txt=(g,s,x,y,px,c,al,f)=>{g.fillStyle=c;g.font=(f||'bold')+' '+px+'px "Helvetica Neue",Arial,sans-serif';g.textAlign=al||'center';g.textBaseline='middle';g.fillText(s,x,y);};

/* ---------- LE FOND : la porte du port, ses grues, ses conteneurs ; la route qui y mène ---------- */
const Y0=300;                                     /* le pied de la clôture et de la porte */
const PX0=270,PX1=530;                            /* la largeur de la porte */
const ZONE={x0:250,x1:550,y0:Y0+14,y1:Y0+110};   /* devant la porte : là où le blocus tient */
const BESOIN=4;                                   /* combien de poubelles pour bloquer */
function ciel(g){
  g.fillStyle=lin(g,0,0,0,170,[[0,'#7aa8d0'],[1,'#d8e6ee']]);g.fillRect(0,0,W,Y0);
  /* les portiques à conteneurs, au loin */
  for(const [x,h] of [[90,150],[330,170],[640,160]]){g.fillStyle='#8a9aa8';R(g,x,40+170-h,6,h,'#8a98a6');R(g,x+70,40+170-h,6,h,'#8a98a6');R(g,x-30,40+170-h,150,8,'#7a8896');
    R(g,x+60,40+170-h-30,4,30,'#7a8896');g.strokeStyle='#7a8896';g.lineWidth=1.2;g.beginPath();g.moveTo(x+62,40+170-h-30);g.lineTo(x-30,40+170-h);g.moveTo(x+62,40+170-h-30);g.lineTo(x+120,40+170-h);g.stroke();
    R(g,x+20,40+170-h+8,14,10,'#c8a040');}
  /* les piles de conteneurs */
  const COUL=['#b8402e','#2a5a8a','#3a7a4a','#c8a040','#8a8e94','#a85a2a','#2a4a6a','#d8d4cc'];
  for(let x=-10,k=0;x<W;x+=58,k++){const n=1+Math.floor(hA(k,3,1)*3);for(let j=0;j<n;j++){const y=Y0-34-j*26,c=COUL[(k*3+j)%COUL.length];
    R(g,x,y-22,56,24,c);for(let xx=x+3;xx<x+54;xx+=4)R(g,xx,y-20,1.2,20,'rgba(0,0,0,.18)');R(g,x,y-22,56,1.4,'rgba(255,255,255,.3)');R(g,x,y+1,56,1.4,'rgba(0,0,0,.3)');}}
  g.fillStyle='rgba(216,230,238,.35)';g.fillRect(0,0,W,Y0-40);}
function cloture(g){
  /* le grillage, de part et d'autre de la porte */
  for(const [x0,x1] of [[0,PX0-24],[PX1+24,W]]){R(g,x0,Y0-64,x1-x0,64,'rgba(60,70,80,.08)');
    g.strokeStyle='rgba(70,80,90,.55)';g.lineWidth=.7;for(let x=x0-64;x<x1;x+=8){g.beginPath();g.moveTo(Math.max(x0,x),Y0-64+Math.max(0,x0-x));g.lineTo(Math.min(x1,x+64),Y0-Math.max(0,x+64-x1));g.stroke();g.beginPath();g.moveTo(Math.max(x0,x),Y0-Math.max(0,x0-x));g.lineTo(Math.min(x1,x+64),Y0-64+Math.max(0,x+64-x1));g.stroke();}
    for(let x=x0;x<=x1;x+=60)R(g,x,Y0-70,3,70,'#6a747e');R(g,x0,Y0-66,x1-x0,2,'#6a747e');
    /* le barbelé */
    g.strokeStyle='#5a6470';g.lineWidth=.8;for(let x=x0;x<x1;x+=6){g.beginPath();g.arc(x,Y0-72,3,0,Math.PI*2);g.stroke();}}
  /* la banderole sur le grillage, à gauche */
  g.save();g.translate(30,Y0-56);R(g,0,0,190,34,'#f2ece0');R(g,0,0,190,34,'#f2ece0');for(let k=0;k<6;k++)R(g,k*38,0,1,34,'rgba(0,0,0,.05)');
  txt(g,'DOCKERS EN LUTTE',95,12,15,'#c8302a','center','900');txt(g,'LE PORT C’EST NOUS',95,27,9,'#1d3f74','center','900');
  R(g,-2,-2,4,4,'#3a3e44');R(g,188,-2,4,4,'#3a3e44');g.restore();
  /* à droite : un drapeau rouge accroché */
  R(g,PX1+90,Y0-130,2,70,'#5a6470');g.fillStyle='#c8302a';g.beginPath();g.moveTo(PX1+92,Y0-130);g.quadraticCurveTo(PX1+112,Y0-124,PX1+130,Y0-128);g.lineTo(PX1+130,Y0-104);g.quadraticCurveTo(PX1+112,Y0-100,PX1+92,Y0-106);g.fill();}
function porte(g){
  /* les deux piliers de béton, la poutre et l'enseigne */
  for(const x of [PX0-24,PX1]){g.fillStyle=lin(g,x,0,x+24,0,[[0,'#c8c4ba'],[.5,'#e2ded4'],[1,'#b8b4aa']]);g.fillRect(x,Y0-150,24,150);for(let y=Y0-146;y<Y0;y+=14)R(g,x,y,24,.8,'rgba(0,0,0,.12)');
    for(let y=Y0-40;y<Y0;y+=10)R(g,x,y,24,5,'rgba(200,48,42,.0)');}
  R(g,PX0-30,Y0-176,PX1-PX0+60,30,'#1d3f74');R(g,PX0-30,Y0-176,PX1-PX0+60,2,'#5a8ad0');R(g,PX0-30,Y0-148,PX1-PX0+60,2,'#0e2448');
  txt(g,'PORT DE MARSEILLE',W/2,Y0-166,13,'#ffffff','center','900');txt(g,'PORTE 4 · ACCÈS POIDS LOURDS',W/2,Y0-154,7.4,'#a8c4ec','center','bold');
  /* derrière la porte : la route du port qui s'enfonce, un camion au loin */
  g.fillStyle=lin(g,0,Y0-146,0,Y0,[[0,'#8a929a'],[1,'#5a6066']]);g.fillRect(PX0,Y0-146,PX1-PX0,146);
  for(let y=Y0-140;y<Y0;y+=22)R(g,W/2-1.5,y,3,10,'rgba(250,250,240,.6)');
  /* le portail coulissant, à moitié tiré */
  const px=PX0+(PX1-PX0)*.55;R(g,px,Y0-60,PX1-px,60,'rgba(80,90,100,.18)');for(let x=px;x<PX1;x+=7)R(g,x,Y0-60,1.6,60,'#6a747e');R(g,px,Y0-60,PX1-px,2.4,'#6a747e');R(g,px,Y0-30,PX1-px,1.6,'#6a747e');
  /* la guérite du gardien, à droite */
  const gx=PX1+34;R(g,gx,Y0-74,64,74,'#e8e4da');R(g,gx,Y0-74,64,2,'#ffffff');R(g,gx-4,Y0-80,72,8,'#1d3f74');
  R(g,gx+8,Y0-62,48,26,'#24303c');g.fillStyle=lin(g,0,Y0-60,0,Y0-38,[[0,'#8ab4d0'],[1,'#d4e6f0']]);g.fillRect(gx+10,Y0-60,44,22);
  g.fillStyle='#3a4250';g.beginPath();g.arc(gx+30,Y0-46,4,0,7);g.fill();R(g,gx+24,Y0-42,12,4,'#1d3f74');
  txt(g,'GARDIEN',gx+32,Y0-26,6,'#1d3f74','center','900');R(g,gx+20,Y0-18,24,18,'#c8c4ba');
  R(g,0,Y0-1,W,2,'rgba(30,30,30,.3)');}
function route(g){
  /* le bitume du rond-point d'accès, ses taches, ses marquages */
  g.fillStyle=lin(g,0,Y0,0,H,[[0,'#5a5e64'],[1,'#666a70']]);g.fillRect(0,Y0,W,H-Y0);
  for(let i=0;i<9000;i++){const x=hA(i,1,7)*W,y=Y0+hA(i,2,7)*(H-Y0);R(g,x,y,1,1,hA(i,3,7)>.5?'rgba(255,255,255,.07)':'rgba(0,0,0,.12)');}
  for(let k=0;k<14;k++){const x=hA(k,41,1)*W,y=Y0+40+hA(k,42,1)*(H-Y0-60);g.fillStyle='rgba(20,20,30,.22)';g.beginPath();g.ellipse(x,y,10+hA(k,43,1)*18,5+hA(k,44,1)*7,hA(k,45,1),0,7);g.fill();}
  /* les trottoirs de béton à gauche et à droite */
  for(const [x0,x1] of [[0,210],[590,W]]){R(g,x0,Y0,x1-x0,H-Y0,'#a8a49c');for(let y=Y0;y<H;y+=24)R(g,x0,y,x1-x0,1,'rgba(0,0,0,.12)');for(let x=x0;x<x1;x+=36)R(g,x,Y0,1,H-Y0,'rgba(0,0,0,.1)');
    for(let i=0;i<2500;i++)R(g,x0+hA(i,51,x0)*(x1-x0),Y0+hA(i,52,x0)*(H-Y0),1,1,'rgba(60,60,60,.12)');}
  R(g,208,Y0,4,H-Y0,'#d8d4cc');R(g,588,Y0,4,H-Y0,'#d8d4cc');
  /* les flèches au sol, la ligne STOP devant la porte */
  for(let y=Y0+140;y<H;y+=60)R(g,W/2-2,y,4,30,'rgba(250,250,240,.7)');
  R(g,PX0,Y0+120,PX1-PX0,5,'rgba(250,250,240,.8)');txt(g,'STOP',W/2,Y0+150,22,'rgba(250,250,240,.75)','center','900');
  for(const x of [330,470]){g.fillStyle='rgba(250,250,240,.7)';g.beginPath();g.moveTo(x,Y0+230);g.lineTo(x+10,Y0+210);g.lineTo(x+20,Y0+230);g.lineTo(x+14,Y0+230);g.lineTo(x+14,Y0+260);g.lineTo(x+6,Y0+260);g.lineTo(x+6,Y0+230);g.fill();}
  /* la zone du blocus, tracée à la craie par les copains */
  g.setLineDash([6,5]);g.strokeStyle='rgba(255,220,120,.55)';g.lineWidth=2;g.strokeRect(ZONE.x0,ZONE.y0,ZONE.x1-ZONE.x0,ZONE.y1-ZONE.y0);g.setLineDash([]);
  txt(g,'ICI ON BLOQUE',W/2,ZONE.y1-10,9,'rgba(255,220,120,.6)','center','900');}
function peindreSol(g){ciel(g);cloture(g);porte(g);route(g);}
function sol(){const c=document.createElement('canvas');c.width=W;c.height=H;peindreSol(c.getContext('2d'));return c;}
function solFin(){const c=document.createElement('canvas');c.width=W*2;c.height=H*2;const g=c.getContext('2d');g.setTransform(2,0,0,2,0,0);peindreSol(g);return c;}

/* ---------- LES SPRITES ---------- */
const T={};const memo=(k,f)=>T[k]||(T[k]=f());
const BACS=[['#2f6a3a','#1e4a28'],['#6a6e74','#4a4e54'],['#2f6a3a','#c8a020'],['#3a5a8a','#24406a']];
/* la poubelle à roulettes : cuve, couvercle, poignée, deux roues */
function graverBac(v,brule){return memo('bac'+v+(brule?'b':''),()=>{const Wd=44,Hd=48,sol=42,x=22;const {c,g}=toile(Wd,Hd);const [cu,co]=brule?['#2a2624','#1a1816']:BACS[v%BACS.length];
  ombreSol(g,x,sol-1,17,4,.3);
  g.fillStyle=cu;g.beginPath();g.moveTo(x-15,sol-36);g.lineTo(x+15,sol-36);g.lineTo(x+13,sol-6);g.lineTo(x-13,sol-6);g.fill();
  g.fillStyle='rgba(255,255,255,.12)';g.fillRect(x-13,sol-34,4,26);g.fillStyle='rgba(0,0,0,.18)';g.fillRect(x+8,sol-34,5,26);
  for(const yy of [sol-28,sol-18])g.fillRect(x-14,yy,28,1.4);
  if(brule){/* fondue, noircie, encore fumante */g.fillStyle='#3a2a20';g.beginPath();g.moveTo(x-16,sol-36);g.quadraticCurveTo(x-6,sol-30,x,sol-38);g.quadraticCurveTo(x+8,sol-31,x+16,sol-37);g.lineTo(x+15,sol-33);g.lineTo(x-15,sol-33);g.fill();
    for(let i=0;i<14;i++){g.fillStyle=hA(i,v,1)>.5?'rgba(120,60,20,.6)':'rgba(0,0,0,.5)';g.fillRect(x-12+hA(i,v,2)*24,sol-32+hA(i,v,3)*24,2,2);}}
  else{g.fillStyle=co;g.beginPath();g.moveTo(x-17,sol-36);g.lineTo(x+17,sol-36);g.lineTo(x+16,sol-41);g.lineTo(x-16,sol-41);g.fill();R(g,x-16,sol-41,32,1.2,'rgba(255,255,255,.25)');
    R(g,x-6,sol-44,12,3,'#24262a');txt(g,'PROPRETÉ',x,sol-22,3.6,'rgba(255,255,255,.55)','center','bold');}
  for(const rx of [x-10,x+10]){g.fillStyle='#16181a';g.beginPath();g.arc(rx,sol-5,4,0,7);g.fill();g.fillStyle='#6a6e74';g.beginPath();g.arc(rx,sol-5,1.4,0,7);g.fill();}
  return {toile:c,W:Wd,H:Hd,sol};});}
/* le décor du piquet : palettes, pneus, barrière, brasero, chaises */
function graverPalettes(){return memo('pa',()=>{const Wd=70,Hd=40,sol=34;const {c,g}=toile(Wd,Hd);ombreSol(g,35,sol-1,30,5,.25);
  for(let k=0;k<4;k++){const y=sol-6-k*7;R(g,6,y,58,2,'#c49a62');R(g,6,y+2,58,1,'#8a6a3a');for(const x of [6,32,60])R(g,x,y+2,4,5,'#a87e4a');}return {toile:c,W:Wd,H:Hd,sol};});}
function graverPneus(){return memo('pn',()=>{const Wd=56,Hd=44,sol=38;const {c,g}=toile(Wd,Hd);ombreSol(g,28,sol-1,24,5,.3);
  for(const [x,y] of [[18,sol-6],[38,sol-6],[28,sol-16],[18,sol-26],[38,sol-26]].slice(0,4)){g.fillStyle='#1e2022';g.beginPath();g.ellipse(x,y,11,5,0,0,7);g.fill();g.fillStyle='#3a3e42';g.beginPath();g.ellipse(x,y-1,11,4,0,0,7);g.fill();g.fillStyle='#16181a';g.beginPath();g.ellipse(x,y-1,5,2,0,0,7);g.fill();}
  return {toile:c,W:Wd,H:Hd,sol};});}
function graverVauban(){return memo('va',()=>{const Wd=90,Hd=40,sol=34;const {c,g}=toile(Wd,Hd);
  for(const x of [6,82]){R(g,x,sol-28,2.4,28,'#b8bcc0');g.fillStyle='#8a8e92';g.fillRect(x-6,sol-1,14,2);}R(g,6,sol-28,78,2.4,'#c8ccd0');R(g,6,sol-6,78,2,'#c8ccd0');for(let x=10;x<82;x+=5)R(g,x,sol-26,1,20,'#b0b4b8');
  R(g,24,sol-24,42,12,'#f2ece0');txt(g,'GRÈVE',45,sol-18,7.4,'#c8302a','center','900');return {toile:c,W:Wd,H:Hd,sol};});}
function graverBrasero(){return memo('br',()=>{const Wd=40,Hd=40,sol=34;const {c,g}=toile(Wd,Hd);ombreSol(g,20,sol-1,14,3,.3);
  g.fillStyle='#4a4e52';g.beginPath();g.moveTo(8,sol-22);g.lineTo(32,sol-22);g.lineTo(30,sol-4);g.lineTo(10,sol-4);g.fill();for(let k=0;k<4;k++){g.fillStyle='#1a1c1e';g.fillRect(12+k*5,sol-16,2,6);}
  R(g,10,sol-4,2,4,'#3a3e42');R(g,28,sol-4,2,4,'#3a3e42');return {toile:c,W:Wd,H:Hd,sol};});}
function graverLampe(){return memo('lp',()=>{const Wd=40,Hd=130,sol=124,x=20;const {c,g}=toile(Wd,Hd);
  g.fillStyle='rgba(40,34,26,.2)';g.beginPath();g.ellipse(x+12,sol,16,3,0,0,7);g.fill();
  R(g,x-4,sol-6,8,6,'#5a6066');R(g,x-1.6,sol-112,3.2,108,'#6a7076');R(g,x-1.6,sol-112,1,108,'#b0b8c0');
  R(g,x-14,sol-118,28,6,'#4a5056');R(g,x-12,sol-112,24,2,'#fdf6d8');return {toile:c,W:Wd,H:Hd,sol};});}

/* ---------- LES POUBELLES : on les prend, on les pose, on les allume ---------- */
const BAC_POS=[[90,470,0],[150,520,1],[70,600,2],[160,650,3],[640,460,1],[710,520,0],[650,610,3],[730,680,2]];
let PORTE=null;                      /* la poubelle qu'on pousse */
const FEU_DUREE=40000;
function decor(){const D=[];const P=(t,x,y,o)=>D.push(Object.assign({t,x,y,gr:0},o||{}));
  BAC_POS.forEach(([x,y,v],i)=>P('x_jol_blc_vide_sol',x,y,{anim:'blc_bac',bac:true,v,col:[30,8],agir:agirBac,libelle:'Poubelle',nom:'PRENDRE · ALLUMER',demi:22}));
  /* le piquet de grève, sur le trottoir de gauche, et la barrière */
  P('x_jol_blc_palettes_sol',60,380,{col:[60,8]});P('x_jol_blc_pneus_sol',150,372,{col:[46,8]});
  P('x_jol_blc_vide_sol',110,420,{anim:'blc_brasero',col:[24,6],parler:['On tient depuis six heures du matin.','Tant que la direction ne recule pas, rien ne rentre.']});
  P('x_jol_blc_vauban_sol',690,380,{col:[84,6]});
  for(const x of [240,560])P('x_jol_blc_vide_sol',x,Y0+6,{anim:'blc_lum',spr:'x_jol_blc_lampe_sol',lum:[[0,-112,40,'rgba(255,230,170,1)'],[0,-10,50,'rgba(255,220,160,1)']],col:[8,5]});
  /* le camion qui veut entrer */
  P('x_jol_blc_vide_sol',W/2,H-10,{anim:'blc_camion'});
  return D;}
const bacs=()=>DECOR.filter(o=>o.bac);
function surPlace(o){return !o.porte&&o.x>ZONE.x0&&o.x<ZONE.x1&&o.y>ZONE.y0&&o.y<ZONE.y1+10;}
function nbBloque(){return bacs().filter(surPlace).length;}
const blocusTient=()=>nbBloque()>=BESOIN;
function libeller(o){if(o.porte){o.libelle='Poser';o.nom='LA POUBELLE';}else if(o.feu&&!o.brule){o.libelle='Ça brûle !';o.nom='RECULE';}else if(o.brule){o.libelle='Pousser';o.nom='CARCASSE';}else{o.libelle='Poubelle';o.nom='PRENDRE · ALLUMER';}}
function reordonner(){DECOR.sort((a,b)=>a.y-b.y);invaliderGrille();}
function agirBac(o){
  if(o.porte){poser(o);return;}
  if(o.feu&&!o.brule){mot('Trop chaud, attends que ça retombe.');return;}
  if(PORTE){mot('Tu pousses déjà une poubelle.');return;}
  if(o.brule){prendre(o);return;}
  choix(o);}
function prendre(o){PORTE=o;o.porte=true;o.col0=o.col;o.col=null;libeller(o);try{vibrer&&vibrer(10);}catch(x){}}
function poser(o){o.porte=false;o.col=o.col0||[30,8];o.y=Math.max(Y0+16,Math.min(H-8,o.y));o.x=Math.max(16,Math.min(W-16,o.x));PORTE=null;libeller(o);reordonner();try{vibrer&&vibrer(12);}catch(x){}majBlocus();}
function allumer(o){o.feu=Date.now();o.col=[44,14];libeller(o);try{vibrer&&vibrer([20,40,20]);}catch(x){}
  setTimeout(()=>{o.brule=true;o.col=[30,8];libeller(o);},FEU_DUREE);}
/* le petit choix : pousser ou allumer */
function choix(o){fermerChoix();const d=document.createElement('div');d.id='blcChoix';
  d.style.cssText='position:fixed;left:0;right:0;bottom:0;z-index:2147482500;padding:14px 14px calc(16px + env(safe-area-inset-bottom));background:#1b1d22;border-radius:22px 22px 0 0;box-shadow:0 -8px 26px rgba(0,0,0,.4);font-family:"Baloo 2",system-ui,sans-serif;display:flex;gap:10px;transform:translateY(100%);transition:transform .18s';
  const bt=(t,s,c,o2)=>'<button data-a="'+o2+'" style="flex:1;border:0;border-radius:16px;padding:12px 6px;background:'+c+';color:#fff;font:800 17px \'Baloo 2\',sans-serif;line-height:1.1;box-shadow:0 4px 0 rgba(0,0,0,.35)">'+t+'<small style="display:block;font-size:11.5px;opacity:.85;font-weight:700">'+s+'</small></button>';
  d.innerHTML=bt('Pousser','la déplacer','#3a6aa8','p')+bt('Allumer','y mettre le feu','#d8541e','f')+'<button data-a="x" style="flex:0 0 52px;border:0;border-radius:16px;background:#2e3138;color:#cfd4dc;font:800 20px sans-serif">✕</button>';
  document.body.appendChild(d);requestAnimationFrame(()=>d.style.transform='none');
  d.onclick=ev=>{const b=ev.target.closest('button');if(!b)return;const a=b.dataset.a;fermerChoix();if(a==='p')prendre(o);else if(a==='f')allumer(o);};}
function fermerChoix(){const d=document.getElementById('blcChoix');if(d)d.remove();}
/* le message du jour, et le bandeau du blocus */
function mot(t){let m=document.getElementById('blcMot');if(!m){m=document.createElement('div');m.id='blcMot';m.style.cssText='position:fixed;left:50%;top:22%;transform:translateX(-50%);z-index:2147482400;background:rgba(20,22,26,.9);color:#fff;padding:9px 16px;border-radius:14px;font:800 15px "Baloo 2",sans-serif;pointer-events:none;transition:opacity .2s;opacity:0;text-align:center';document.body.appendChild(m);}
  m.textContent=t;m.style.opacity='1';clearTimeout(mot.t);mot.t=setTimeout(()=>m.style.opacity='0',1800);}
let DEJA=false;
function majBlocus(){let b=document.getElementById('blcBan');if(!b){b=document.createElement('div');b.id='blcBan';b.style.cssText='position:fixed;left:50%;top:calc(env(safe-area-inset-top,0px) + 74px);transform:translateX(-50%);z-index:2147482300;border-radius:14px;padding:5px 14px;font:800 14px "Baloo 2",sans-serif;pointer-events:none;white-space:nowrap;box-shadow:0 4px 12px rgba(0,0,0,.25);transition:background .3s';document.body.appendChild(b);}
  const n=nbBloque();if(n>=BESOIN){b.style.background='#c8302a';b.style.color='#fff';b.innerHTML='🔥 BLOCUS · le port est bloqué';if(!DEJA){DEJA=true;mot('Blocus en place ! Plus rien ne rentre.');try{vibrer&&vibrer([30,60,30,60,30]);}catch(x){}}}
  else{DEJA=false;b.style.background='rgba(20,22,26,.85)';b.style.color='#ffd98a';b.innerHTML='Blocus : '+n+' / '+BESOIN+' poubelles devant la porte';}}
setTimeout(majBlocus,600);

/* ---------- LES ANIMATIONS ---------- */
const SPR={};
ANIM_DECOR.blc_lum=(g,o,x,y)=>{if(o.spr){const t=SPR[o.spr]||(SPR[o.spr]=graver(o.spr,o.v||0)),X0=Math.round(x-t.W/2),Y1=Math.round(y-t.sol);g.drawImage(t.toile,X0,Y1,t.W,t.H);
    let k=0;try{k=nuitDecor();}catch(e){}if(k>.02){g.globalAlpha=k;g.drawImage(versionNuit(t),X0,Y1,t.W,t.H);g.globalAlpha=1;}}
  if(o.lum&&typeof lueurNuit==='function')for(const [dx,dy,r,c] of o.lum)lueurNuit(g,x+dx,y+dy,r,c);};
/* LE FEU : des centaines de petites lueurs qui montent en se refroidissant (blanc, jaune, orange, rouge),
   additionnées les unes aux autres comme de la vraie lumière ; puis la fumée, épaisse, qui roule vers le ciel */
const BLOBS={};
function blob(c){if(BLOBS[c])return BLOBS[c];const k=document.createElement('canvas');k.width=k.height=64;const q=k.getContext('2d');
  const gr=q.createRadialGradient(32,32,0,32,32,32);gr.addColorStop(0,c);gr.addColorStop(.35,c.replace(/,1\)$/,',.55)'));gr.addColorStop(1,c.replace(/,1\)$/,',0)'));q.fillStyle=gr;q.fillRect(0,0,64,64);return BLOBS[c]=k;}
const RAMPE=['rgba(255,222,140,1)','rgba(255,180,60,1)','rgba(255,130,30,1)','rgba(230,70,15,1)','rgba(140,30,10,1)'];
const hF=(i,k)=>{let n=(i*2654435761^k*40503)>>>0;n=(n^(n>>>15))*2246822519>>>0;return (n>>>0)/4294967296;};
function flammes(g,x,y,f,t,seed){const top=y-36;
  /* la fumée d'abord, derrière : grosses volutes sombres qui s'élargissent et dérivent avec le vent */
  for(let i=0;i<26;i++){const ph=((t*.2+i/26+seed*.13)%1),dr=ph*ph;
    const sx=x+(hF(i,1)-.5)*12+dr*50+Math.sin(t*.9+i*1.9)*6*ph,sy=top-22-ph*200,r=10+ph*40;
    const c=Math.round(40+ph*70);g.globalAlpha=(ph<.15?ph/.15:1)*(1-ph)*.75*f;g.drawImage(blob('rgba('+c+','+c+','+(c+6)+',1)'),sx-r,sy-r,r*2,r*2);}
  g.globalAlpha=1;
  /* la lueur sur le sol et sur la poubelle */
  let h=g.createRadialGradient(x,top+6,2,x,top+6,74);h.addColorStop(0,'rgba(255,150,50,'+(.32*f)+')');h.addColorStop(1,'rgba(255,110,30,0)');g.fillStyle=h;g.fillRect(x-74,top-68,148,148);
  /* les flammes : particules additives, du cœur blanc aux pointes rouges */
  g.save();g.globalCompositeOperation='lighter';
  const N=64;
  for(let i=0;i<N;i++){const vit=.9+hF(i,2)*.9,ph=((t*vit+hF(i,3))%1);
    const largeur=12*(1-ph*.85),dx=(hF(i,4)-.5)*2*largeur+Math.sin(t*6+i*2.3)*2.2*ph;
    const sx=x+dx,sy=top+2-ph*(44+hF(i,5)*34)*f;
    const r=(8*(1-ph)+2.4)*(.7+hF(i,6)*.6)*(.55+.45*f);
    const k=Math.min(RAMPE.length-1,Math.floor(ph*1.15*RAMPE.length+hF(i,7)*.8));
    g.globalAlpha=(ph<.1?ph/.1:1)*(1-ph*.6)*.34*f;g.drawImage(blob(RAMPE[k]),sx-r,sy-r*1.35,r*2,r*2.7);}
  /* le cœur, à ras du bord : un lit de braises éclatant */
  for(let i=0;i<7;i++){const sx=x-11+i*3.6+Math.sin(t*13+i)*1.2,r=5+Math.sin(t*9+i*1.7)*1.2;g.globalAlpha=.4*f;g.drawImage(blob(RAMPE[1+i%2]),sx-r,top-r*.6,r*2,r*1.2);}
  g.restore();g.globalAlpha=1;
  /* les étincelles qui s'échappent, en zigzag */
  for(let i=0;i<10;i++){const ph=((t*(.5+hF(i,8)*.6)+hF(i,9))%1),sx=x+(hF(i,10)-.5)*20+Math.sin(t*5+i*3)*6*ph+ph*12,sy=top-6-ph*90;
    g.globalAlpha=(1-ph)*f;g.fillStyle=ph<.4?'#fff2b0':'#ff9a3a';g.fillRect(sx,sy,1.4,1.4);}
  g.globalAlpha=1;}
ANIM_DECOR.blc_bac=(g,o,x,y)=>{const t=performance.now()/1000;
  let X=x,Y=y;
  const spr=graverBac(o.v,!!o.brule),X0=Math.round(X-spr.W/2),Y1=Math.round(Y-spr.sol);
  g.drawImage(spr.toile,X0,Y1,spr.W,spr.H);
  let k=0;try{k=nuitDecor();}catch(e){}if(k>.02){g.globalAlpha=k;g.drawImage(versionNuit(spr),X0,Y1,spr.W,spr.H);g.globalAlpha=1;}
  if(o.feu){const age=(Date.now()-o.feu)/FEU_DUREE;let f=age<.08?age/.08:age>.85?Math.max(0,(1-age)/.15):1;
    if(o.brule){/* la carcasse fume encore un peu */for(let i=0;i<5;i++){const kk=((t*.25+i/5)%1);g.fillStyle='rgba(90,90,96,'+(.3*(1-kk))+')';g.beginPath();g.arc(X+kk*kk*16,Y-34-kk*90,4+kk*14,0,7);g.fill();}}
    else{g.globalAlpha=Math.min(.85,age*1.4);const sb=graverBac(o.v,true);g.drawImage(sb.toile,X0,Y1,sb.W,sb.H);g.globalAlpha=1;flammes(g,X,Y,f,t,o.v);if(typeof lueurNuit==='function')lueurNuit(g,X,Y-30,70,'rgba(255,150,60,1)');}}
  if(o.porte){g.strokeStyle='rgba(255,217,138,.8)';g.lineWidth=1.4;g.setLineDash([3,3]);g.beginPath();g.ellipse(X,Y,20,5,0,0,7);g.stroke();g.setLineDash([]);}};
ANIM_DECOR.blc_brasero=(g,o,x,y)=>{const t=performance.now()/1000,s=graverBrasero();g.drawImage(s.toile,Math.round(x-s.W/2),Math.round(y-s.sol),s.W,s.H);
  for(let i=0;i<4;i++){const fx=x-6+i*4,hh=6+Math.sin(t*10+i*1.7)*3;g.fillStyle=i%2?'#ffb02a':'#ff6a1a';g.beginPath();g.moveTo(fx-2.4,y-22);g.quadraticCurveTo(fx,y-22-hh,fx+2.4,y-22);g.fill();}
  for(let i=0;i<6;i++){const k=((t*.3+i/6)%1);g.fillStyle='rgba(120,120,126,'+(.35*(1-k))+')';g.beginPath();g.arc(x+k*10,y-26-k*60,3+k*9,0,7);g.fill();}
  if(typeof lueurNuit==='function')lueurNuit(g,x,y-20,46,'rgba(255,160,70,1)');};
/* LE CAMION : il arrive, la porte s'ouvre et il rentre… sauf quand le blocus tient : il klaxonne et attend */
let CAM={y:H+140,etat:'arrive',t:0};
function camionPas(dt){const arret=ZONE.y1+90;
  if(CAM.etat==='arrive'){CAM.y-=dt*60;if(blocusTient()&&CAM.y<=arret+20){CAM.y=arret+20;CAM.etat='bloque';CAM.t=0;}else if(CAM.y<Y0+30){CAM.etat='rentre';}}
  else if(CAM.etat==='bloque'){CAM.t+=dt;if(!blocusTient())CAM.etat='arrive';}
  else if(CAM.etat==='rentre'){CAM.y-=dt*60;if(CAM.y<Y0-60){CAM.y=H+260;CAM.etat='arrive';}}}
let DERN_T=performance.now();
ANIM_DECOR.blc_camion=(g,o,x,y)=>{const now=performance.now(),dt=Math.min(.1,(now-DERN_T)/1000);DERN_T=now;camionPas(dt);
  const Y=y+(CAM.y-o.y),X=x;if(CAM.etat==='rentre'&&CAM.y<Y0+4)return;
  /* l'arrière d'une remorque porte-conteneur : portes, feux, plaque */
  g.fillStyle='rgba(0,0,0,.3)';g.fillRect(X-50,Y-4,100,8);
  R(g,X-48,Y-118,96,110,'#b8402e');for(let xx=X-46;xx<X+46;xx+=5)R(g,xx,Y-116,1.4,106,'rgba(0,0,0,.18)');R(g,X-48,Y-118,96,2,'rgba(255,255,255,.3)');
  R(g,X-1,Y-116,2,106,'#6a2418');for(const bx of [X-30,X-12,X+10,X+28])R(g,bx,Y-110,2,98,'#8a8e94');
  R(g,X-48,Y-10,96,8,'#2a2c30');R(g,X-44,Y-8,10,4,'#e04030');R(g,X+34,Y-8,10,4,'#e04030');R(g,X-12,Y-9,24,6,'#f2f0e6');txt(g,'GD-413-PM',X,Y-6,4,'#1a1a1a','center','bold');
  for(const rx of [X-38,X-24,X+24,X+38]){R(g,rx-5,Y-4,10,8,'#16181a');}
  if(CAM.etat==='bloque'){const k=Math.floor(CAM.t*2)%4;if(k<2){g.fillStyle='rgba(255,255,255,.95)';g.beginPath();g.roundRect(X-30,Y-150,60,22,8);g.fill();txt(g,'TÛÛÛT !',X,Y-139,10,'#c8302a','center','900');}
    if(typeof lueurNuit==='function'){lueurNuit(g,X-39,Y-6,16,'rgba(255,60,40,1)');lueurNuit(g,X+39,Y-6,16,'rgba(255,60,40,1)');}}};
/* chaque image : la poubelle qu'on pousse suit le joueur, devant lui */
function figurants(){try{if(PORTE){const d=joueur.dir||'bas',o=PORTE;const off={bas:[0,16],haut:[0,-12],gauche:[-20,3],droite:[20,3]}[d]||[0,16];
    const nx=joueur.x+off[0],ny=joueur.y+off[1];if(Math.abs(nx-o.x)>.2||Math.abs(ny-o.y)>.2){o.x=nx;o.y=Math.max(Y0+16,ny);reordonner();majBlocus();}}}catch(e){}
  return [];}
function bloque(x,y){
  if(x<10||x>W-10)return true;
  if(y<Y0+12)return true;
  if(y>H-6)return true;
  if(CAM.y>Y0+20&&Math.abs(x-W/2)<52&&y>CAM.y-14&&y<CAM.y+6)return true;
  for(const o of DECOR){if(!o.col)continue;if(Math.abs(x-o.x)<o.col[0]/2&&y>o.y-o.col[1]&&y<o.y+3)return true;}
  return false;}
const GRAVEURS={x_jol_blc_palettes_sol:graverPalettes,x_jol_blc_pneus_sol:graverPneus,x_jol_blc_vauban_sol:graverVauban,x_jol_blc_lampe_sol:graverLampe};
function graver(t,v){const r=(GRAVEURS[t]||(()=>({toile:document.createElement('canvas'),W:1,H:1,sol:0})))(v||0);return {toile:r.toile,W:r.W,H:r.H,sol:r.sol};}
return {sol,solFin,decor,bloque,graver,depart:DEPART,figurants};
})()
