/* =====================================================================
   LE GRAND CASINO DU PHARO — un lieu à part (casino.html), Belle Époque.
   De hautes fenêtres en arc sur la mer de nuit (la lune, le Frioul, le
   phare), des lustres de cristal, du marbre en damier, un tapis rouge
   jusqu'à la grande cagnotte dorée. Les tables : les machines à sous,
   la roulette, le vingt-et-un de Fonfon, les tickets à gratter à la caisse. Les jeux sont dans casinojeux.js ; tout
   se tire côté serveur (casino_coup, casino_21_*).
   Chargé par moteur.js (eval direct) : il voit personne, joueur, e,
   sauver, vibrer, texteVolant, chargerMorceau, VW, VH, GESTE, DEF_AP…
   ===================================================================== */
(()=>{
const W=1000,H=880,MUR=236;
const DEPART=[500,820];
const hA=(x,y,k)=>{let n=((x*73856093)^(y*19349663)^(k*83492791))|0;n=(n^(n>>>13))*1274126177|0;return((n^(n>>>16))>>>0)/4294967296;};
const R=(g,x,y,w,h,c)=>{g.fillStyle=c;g.fillRect(x,y,w,h);};
const lin=(g,x0,y0,x1,y1,st)=>{const gr=g.createLinearGradient(x0,y0,x1,y1);st.forEach(([o,c])=>gr.addColorStop(o,c));return gr;};
const rad=(g,x,y,r0,r1,st)=>{const gr=g.createRadialGradient(x,y,r0,x,y,r1);st.forEach(([o,c])=>gr.addColorStop(o,c));return gr;};
function toile(L,HH){const D=2,c=document.createElement('canvas');c.width=Math.ceil(L*D);c.height=Math.ceil(HH*D);const g=c.getContext('2d');g.setTransform(D,0,0,D,0,0);return {c,g};}
const now=()=>performance.now()/1000;
const OR=['#fff2b8','#f0c860','#c8922a','#8a5a14'];
const orG=(g,x0,y0,x1,y1)=>lin(g,x0,y0,x1,y1,[[0,OR[0]],[.35,OR[1]],[.7,OR[2]],[1,OR[3]]]);
const SERIF='"Playfair Display",Georgia,"Times New Roman",serif';

/* les emplacements */
const FEN=[110,290,710,890];          /* les quatre fenêtres en arc */
const LUSTRES=[200,800];
const CAG={x:500,y:96,w:276,h:104};    /* le grand tableau de la cagnotte, au mur */
const SLOTS=[64,120,176,232,288].map(x=>({x,y:296}));
const ROUL={x:500,y:452};
const BJ={x:830,y:452};
const TREUIL={x:170,y:656};
const CLOUS={x:880,y:730};
const CAISSE={x:120,y:812};
const PALMES=[[372,272],[628,272],[34,560],[966,560]];
const COLS=[[330,600],[670,600]];

/* ---------- LE MUR : moulures, fenêtres sur la mer, rideaux, lustres ---------- */
function fenetre(g,cx){const x0=cx-52,x1=cx+52,y0=36,y1=176,ar=52;
  /* le ciel de nuit et la mer, vus par l'arche */
  g.save();g.beginPath();g.moveTo(x0,y1);g.lineTo(x0,y0+ar);g.arc(cx,y0+ar,52,Math.PI,0);g.lineTo(x1,y1);g.closePath();g.clip();
  g.fillStyle=lin(g,0,y0,0,y1,[[0,'#0c1240'],[.45,'#24205a'],[.62,'#4a3070'],[.63,'#101a3c'],[1,'#0a1028']]);g.fillRect(x0,y0,104,y1-y0);
  for(let i=0;i<26;i++){const sx=x0+hA(cx,i,1)*104,sy=y0+hA(cx,i,2)*70;g.fillStyle='rgba(255,255,255,'+(.35+hA(cx,i,3)*.6)+')';g.fillRect(sx,sy,hA(cx,i,4)<.2?1.4:.8,hA(cx,i,4)<.2?1.4:.8);}
  const hor=y0+(y1-y0)*.62;
  if(cx===290||cx===710){const mx=cx===290?cx+18:cx-16,my=y0+34;g.fillStyle=rad(g,mx,my,2,30,[[0,'rgba(255,246,210,.5)'],[1,'rgba(255,246,210,0)']]);g.fillRect(mx-30,my-30,60,60);
    g.fillStyle='#fff6dc';g.beginPath();g.arc(mx,my,9,0,7);g.fill();g.fillStyle='rgba(200,190,160,.5)';g.beginPath();g.arc(mx-3,my-2,2.2,0,7);g.arc(mx+3,my+3,1.6,0,7);g.fill();
    for(let k=0;k<9;k++){g.fillStyle='rgba(255,240,190,'+(.55-k*.05)+')';const w=10-k*.7+hA(cx,k,9)*4;g.fillRect(mx-w/2+hA(cx,k,7)*3-1.5,hor+3+k*4.2,w,1.2);}}
  /* le Frioul, le château d'If, le phare */
  g.fillStyle='#16183a';g.beginPath();g.moveTo(x0,hor);
  if(cx<500){g.lineTo(x0+10,hor-6);g.lineTo(x0+30,hor-9);g.lineTo(x0+52,hor-4);g.lineTo(x0+70,hor-2);}else{g.lineTo(x0+40,hor-1);g.lineTo(x0+56,hor-7);g.lineTo(x0+80,hor-11);g.lineTo(x1,hor-5);}
  g.lineTo(x1,hor);g.closePath();g.fill();
  if(cx===110){g.fillStyle='#1c1e44';g.fillRect(x0+60,hor-11,14,9);g.fillRect(x0+64,hor-15,6,5);}
  if(cx===890){g.fillStyle='#1c1e44';g.fillRect(x0+82,hor-24,4,15);g.fillStyle='rgba(255,230,150,.9)';g.fillRect(x0+82,hor-26,4,3);}
  for(let k=0;k<14;k++){g.fillStyle='rgba(120,140,220,'+(.10+hA(cx,k,5)*.12)+')';g.fillRect(x0+hA(cx,k,6)*96,hor+6+hA(cx,k,8)*(y1-hor-8),6+hA(cx,k,2)*10,1);}
  if(cx===110||cx===710){g.fillStyle='rgba(255,210,120,.9)';g.fillRect(cx+(cx===110?-20:24),hor+10,2,1.4);g.fillRect(cx+(cx===110?-14:30),hor+11,1.4,1);}
  /* le reflet de la salle dans la vitre */
  g.fillStyle='rgba(255,220,160,.06)';g.beginPath();g.moveTo(x0,y1);g.lineTo(x0+40,y0);g.lineTo(x0+58,y0);g.lineTo(x0+18,y1);g.fill();
  g.restore();
  /* les montants et l'encadrement doré */
  g.strokeStyle='rgba(40,24,8,.55)';g.lineWidth=2;g.beginPath();g.moveTo(cx,y0);g.lineTo(cx,y1);g.moveTo(x0,y0+92);g.lineTo(x1,y0+92);g.moveTo(cx-52,y0+ar);g.lineTo(cx+52,y0+ar);g.stroke();
  g.strokeStyle=orG(g,x0,y0,x1,y1);g.lineWidth=4;g.beginPath();g.moveTo(x0,y1);g.lineTo(x0,y0+ar);g.arc(cx,y0+ar,52,Math.PI,0);g.lineTo(x1,y1);g.stroke();
  g.lineWidth=1;g.strokeStyle='rgba(255,244,200,.7)';g.beginPath();g.moveTo(x0-1.5,y1);g.lineTo(x0-1.5,y0+ar);g.arc(cx,y0+ar,53.5,Math.PI,-Math.PI/2);g.stroke();
  /* la clef de voûte */
  g.fillStyle=orG(g,cx-7,y0-8,cx+7,y0+4);g.beginPath();g.moveTo(cx-7,y0-7);g.lineTo(cx+7,y0-7);g.lineTo(cx+4,y0+5);g.lineTo(cx-4,y0+5);g.fill();
  /* l'appui */
  g.fillStyle=orG(g,x0-6,y1,x0-6,y1+8);g.fillRect(x0-8,y1,120,6);R(g,x0-8,y1+6,120,2,'rgba(0,0,0,.3)');
  /* les rideaux de velours, retenus par une embrasse */
  for(const s of [-1,1]){const bx=s<0?x0-8:x1+8;g.save();
    g.fillStyle=lin(g,bx-14*s,0,bx+18*s,0,[[0,'#5a0a14'],[.4,'#a81c2a'],[.7,'#7a0e1c'],[1,'#4a0610']]);
    g.beginPath();g.moveTo(bx-14*s,y0-14);g.lineTo(bx+16*s,y0-14);g.quadraticCurveTo(bx+20*s,y0+60,bx+6*s,y0+92);g.quadraticCurveTo(bx+14*s,y0+130,bx+22*s,y1+30);g.lineTo(bx-14*s,y1+30);g.closePath();g.fill();
    g.strokeStyle='rgba(0,0,0,.22)';g.lineWidth=1;for(let k=1;k<4;k++){g.beginPath();g.moveTo(bx+(k*7-10)*s,y0-12);g.quadraticCurveTo(bx+(k*6-4)*s,y0+92,bx+(k*7-8)*s,y1+28);g.stroke();}
    g.fillStyle=orG(g,bx,y0+88,bx+10*s,y0+98);g.beginPath();g.ellipse(bx+6*s,y0+93,5,3,0,0,7);g.fill();g.fillRect(bx+5*s-1,y0+95,2,10);g.beginPath();g.moveTo(bx+6*s-3,y0+104);g.lineTo(bx+6*s+3,y0+104);g.lineTo(bx+6*s+2,y0+112);g.lineTo(bx+6*s-2,y0+112);g.fill();
    g.restore();}
  /* la cantonnière */
  g.fillStyle=lin(g,0,y0-18,0,y0-2,[[0,'#7a0e1c'],[1,'#a81c2a']]);g.beginPath();g.moveTo(x0-24,y0-18);g.lineTo(x1+24,y0-18);g.lineTo(x1+24,y0-6);
  for(let k=0;k<=6;k++){const xx=x1+24-k*(152/6);g.quadraticCurveTo(xx-152/12,y0+4,xx-152/6,y0-6);}g.closePath();g.fill();
  R(g,x0-24,y0-20,152,3,OR[1]);for(let k=0;k<12;k++){g.fillStyle=OR[2];g.fillRect(x0-22+k*12.6,y0-6+Math.abs(Math.sin(k*.52))*6,2,4);}}
function lustre(g,cx){const y=24;
  R(g,cx-.5,0,1,y,OR[2]);
  g.fillStyle=rad(g,cx,y+26,4,70,[[0,'rgba(255,236,170,.5)'],[.4,'rgba(255,220,140,.16)'],[1,'rgba(255,220,140,0)']]);g.fillRect(cx-70,y-44,140,140);
  g.fillStyle=orG(g,cx-30,y+10,cx+30,y+30);g.beginPath();g.ellipse(cx,y+24,32,7,0,0,7);g.fill();g.fillStyle='rgba(60,30,6,.4)';g.beginPath();g.ellipse(cx,y+25,26,4,0,0,7);g.fill();
  g.fillStyle=orG(g,cx-12,y+6,cx+12,y+14);g.beginPath();g.ellipse(cx,y+10,13,4,0,0,7);g.fill();
  for(let k=0;k<9;k++){const a=k/8*Math.PI,px=cx-30+k*7.5,py=y+30+Math.sin(a)*8;g.strokeStyle='rgba(255,255,255,.5)';g.lineWidth=.6;g.beginPath();g.moveTo(px,y+26);g.lineTo(px,py);g.stroke();
    g.fillStyle='rgba(220,240,255,.95)';g.beginPath();g.moveTo(px,py);g.lineTo(px+2,py+4);g.lineTo(px,py+8);g.lineTo(px-2,py+4);g.fill();}
  for(let k=0;k<7;k++){const px=cx-24+k*8;g.fillStyle='#fff8e8';g.fillRect(px-1,y+13,2,7);g.fillStyle='#ffe090';g.beginPath();g.ellipse(px,y+11,1.4,2.4,0,0,7);g.fill();}
  g.fillStyle='rgba(220,240,255,.95)';g.beginPath();g.moveTo(cx,y+34);g.lineTo(cx+3,y+42);g.lineTo(cx,y+50);g.lineTo(cx-3,y+42);g.fill();}
function pilastre(g,x){R(g,x-11,18,22,MUR-74,lin(g,x-11,0,x+11,0,[[0,'#d8c6a0'],[.5,'#f6ecd4'],[1,'#c8b088']]));
  for(let k=0;k<3;k++)R(g,x-7+k*6,34,2,MUR-108,'rgba(120,90,40,.16)');
  g.fillStyle=orG(g,x-15,18,x+15,32);g.fillRect(x-15,18,30,12);g.beginPath();g.ellipse(x-11,30,4,3,0,0,7);g.ellipse(x+11,30,4,3,0,0,7);g.fill();
  g.fillStyle=orG(g,x-14,MUR-62,x+14,MUR-54);g.fillRect(x-14,MUR-62,28,6);}
function peindreSol(g){
  /* le mur : un papier damassé crème et or */
  g.fillStyle=lin(g,0,0,0,MUR,[[0,'#d8c094'],[.6,'#ead8b0'],[1,'#d4bc8c']]);g.fillRect(0,0,W,MUR);
  g.save();g.globalAlpha=.12;g.fillStyle='#8a6420';for(let x=10;x<W;x+=28)for(let y=40;y<MUR-60;y+=32){const o=((y/32)|0)%2?14:0;g.beginPath();g.ellipse(x+o,y,3,7,0,0,7);g.fill();g.beginPath();g.ellipse(x+o,y+11,6,2,0,0,7);g.fill();}g.restore();
  /* la corniche dorée */
  R(g,0,0,W,18,lin(g,0,0,0,18,[[0,'#6a4612'],[.5,'#d8a840'],[1,'#8a5a14']]));for(let x=4;x<W;x+=10)R(g,x,12,5,5,'rgba(60,30,4,.4)');R(g,0,18,W,2,'#fff0c0');
  /* le lambris d'acajou du bas, et sa main courante dorée */
  R(g,0,MUR-58,W,58,lin(g,0,MUR-58,0,MUR,[[0,'#5a2a14'],[.5,'#3c180a'],[1,'#2a1006']]));
  for(let x=10;x<W;x+=62){g.strokeStyle='rgba(240,200,110,.4)';g.lineWidth=1;g.strokeRect(x+.5,MUR-48.5,50,38);g.strokeStyle='rgba(0,0,0,.3)';g.strokeRect(x+2.5,MUR-46.5,46,34);}
  R(g,0,MUR-62,W,5,orG(g,0,MUR-62,0,MUR-57));R(g,0,MUR-4,W,4,'#1a0a04');
  for(const x of [20,200,380,620,800,980])pilastre(g,x);
  for(const x of FEN)fenetre(g,x);
  /* le grand cadre de la cagnotte (les chiffres sont posés par-dessus, ils bougent) */
  {const {x,y,w,h}=CAG;g.fillStyle='rgba(0,0,0,.35)';g.fillRect(x-w/2+4,y-h/2+6,w,h);
   g.fillStyle=orG(g,x-w/2,y-h/2,x+w/2,y+h/2);g.fillRect(x-w/2-8,y-h/2-8,w+16,h+16);
   g.fillStyle='#2a0a10';g.fillRect(x-w/2,y-h/2,w,h);g.fillStyle=lin(g,0,y-h/2,0,y+h/2,[[0,'#4a0c1a'],[1,'#1a0408']]);g.fillRect(x-w/2+4,y-h/2+4,w-8,h-8);
   g.strokeStyle='rgba(255,240,190,.6)';g.lineWidth=1;g.strokeRect(x-w/2-4.5,y-h/2-4.5,w+9,h+9);
   /* le fronton et la couronne */
   g.fillStyle=orG(g,x-60,y-h/2-36,x+60,y-h/2-8);g.beginPath();g.moveTo(x-90,y-h/2-8);g.quadraticCurveTo(x,y-h/2-52,x+90,y-h/2-8);g.closePath();g.fill();
   g.fillStyle='#4a0c1a';g.beginPath();g.moveTo(x-74,y-h/2-10);g.quadraticCurveTo(x,y-h/2-42,x+74,y-h/2-10);g.closePath();g.fill();
   g.font='900 12px '+SERIF;g.textAlign='center';g.textBaseline='middle';g.fillStyle='#ffe8a0';g.fillText('GRAND CASINO',x,y-h/2-20);
   g.fillStyle=OR[1];g.font='italic 700 9px '+SERIF;g.fillText('— la cagnotte du port —',x,y-h/2+13);}
  for(const x of LUSTRES)lustre(g,x);
  /* LE SOL : marbre en damier, veiné, et ses filets d'or */
  const T=40;for(let y=MUR,j=0;y<H;y+=T,j++)for(let x=0,i=0;x<W;x+=T,i++){const n=(i+j)%2;
    g.fillStyle=n?lin(g,x,y,x+T,y+T,[[0,'#2c2622'],[1,'#1c1714']]):lin(g,x,y,x+T,y+T,[[0,'#f4ecdc'],[1,'#e2d6be']]);g.fillRect(x,y,T,T);
    g.strokeStyle=n?'rgba(255,255,255,.07)':'rgba(120,100,70,.2)';g.lineWidth=.6;g.beginPath();const a=hA(i,j,1)*T;g.moveTo(x,y+a);g.bezierCurveTo(x+T*.3,y+a+8,x+T*.6,y+hA(i,j,2)*T,x+T,y+hA(i,j,3)*T);g.stroke();}
  g.strokeStyle='rgba(200,160,70,.45)';g.lineWidth=1;for(let y=MUR;y<H;y+=T){g.beginPath();g.moveTo(0,y+.5);g.lineTo(W,y+.5);g.stroke();}for(let x=0;x<W;x+=T){g.beginPath();g.moveTo(x+.5,MUR);g.lineTo(x+.5,H);g.stroke();}
  /* l'ombre du mur sur le sol */
  g.fillStyle=lin(g,0,MUR,0,MUR+40,[[0,'rgba(20,8,0,.45)'],[1,'rgba(20,8,0,0)']]);g.fillRect(0,MUR,W,40);
  /* les tapis : grand tapis de la roulette, ceux des tables, et le tapis rouge de l'entrée */
  tapis(g,ROUL.x-190,ROUL.y-120,380,230,'#6a0c1c','#3c0610');
  tapis(g,BJ.x-130,BJ.y-100,260,190,'#123a2a','#0a2418');
  tapis(g,20,MUR+20,310,110,'#3a1a5a','#22103a');
  g.fillStyle=lin(g,460,0,540,0,[[0,'#7a0c18'],[.5,'#b81c2c'],[1,'#7a0c18']]);g.fillRect(462,ROUL.y+112,76,H-ROUL.y-112);
  R(g,458,ROUL.y+112,4,H-ROUL.y-112,OR[1]);R(g,538,ROUL.y+112,4,H-ROUL.y-112,OR[1]);
  for(let y=ROUL.y+124;y<H;y+=22){g.fillStyle='rgba(255,200,120,.12)';g.beginPath();g.moveTo(500,y);g.lineTo(508,y+6);g.lineTo(500,y+12);g.lineTo(492,y+6);g.fill();}
  /* la rosace devant la cagnotte */
  {const cx=500,cy=MUR+30;g.fillStyle=rad(g,cx,cy,2,40,[[0,'rgba(255,220,140,.5)'],[1,'rgba(255,220,140,0)']]);g.fillRect(cx-40,cy-20,80,40);}
  /* le seuil de l'entrée */
  R(g,430,H-10,140,10,orG(g,430,H-10,430,H));R(g,436,H-7,128,4,'#2a1006');
  /* les flaques de lumière des lustres sur le sol */
  for(const x of LUSTRES){g.fillStyle=rad(g,x,MUR+50,4,120,[[0,'rgba(255,220,150,.16)'],[1,'rgba(255,220,150,0)']]);g.fillRect(x-120,MUR-70,240,240);}
  g.fillStyle=rad(g,500,520,20,420,[[0,'rgba(255,210,140,.08)'],[1,'rgba(0,0,0,.16)']]);g.fillRect(0,MUR,W,H-MUR);}
function tapis(g,x,y,w,h,c1,c2){g.fillStyle='rgba(0,0,0,.25)';g.fillRect(x+3,y+4,w,h);g.fillStyle=c2;g.fillRect(x,y,w,h);
  g.fillStyle=lin(g,x,y,x,y+h,[[0,c1],[.5,c2],[1,c1]]);g.fillRect(x+8,y+8,w-16,h-16);
  g.strokeStyle=OR[1];g.lineWidth=2;g.strokeRect(x+5,y+5,w-10,h-10);g.lineWidth=1;g.strokeStyle='rgba(255,230,160,.5)';g.strokeRect(x+11.5,y+11.5,w-23,h-23);
  g.fillStyle='rgba(240,200,110,.22)';for(let i=x+22;i<x+w-16;i+=22)for(let j=y+22;j<y+h-16;j+=22){g.beginPath();g.moveTo(i,j-4);g.lineTo(i+4,j);g.lineTo(i,j+4);g.lineTo(i-4,j);g.fill();}
  for(let i=x+2;i<x+w;i+=4){R(g,i,y-3,1.5,3,'#e8d8b0');R(g,i,y+h,1.5,3,'#e8d8b0');}}
function sol(){const c=document.createElement('canvas');c.width=W;c.height=H;peindreSol(c.getContext('2d'));return c;}
function solFin(){const c=document.createElement('canvas');c.width=W*2;c.height=H*2;const g=c.getContext('2d');g.setTransform(2,0,0,2,0,0);peindreSol(g);return c;}

/* ---------- LE MOBILIER, gravé une fois ---------- */
const CACHE={};
function symbole(g,k,x,y,s){g.save();g.translate(x,y);g.scale(s,s);
  if(k===0){g.fillStyle='#8ab0c8';g.beginPath();g.ellipse(0,0,7,3,0,0,7);g.fill();g.beginPath();g.moveTo(5,0);g.lineTo(9,-3);g.lineTo(9,3);g.fill();g.fillStyle='#2a3a4a';g.fillRect(-5,-1,1.4,1.4);}
  else if(k===1){g.fillStyle='#c8904a';g.fillRect(-6,-5,12,10);g.fillStyle='#8a5a2a';g.fillRect(-6,-2,12,1.4);g.fillRect(-6,2,12,1.4);g.fillStyle='#e85a2a';g.beginPath();g.arc(-2,-5,2.2,0,7);g.arc(2,-6,2,0,7);g.fill();}
  else if(k===2){g.fillStyle='#f0b020';g.fillRect(-1,-7,2,14);g.fillRect(-1,-7,9,2);g.fillStyle='#2a2a2a';g.fillRect(6,-5,1,5);g.fillStyle='#e04a2a';g.fillRect(4,0,5,3);}
  else if(k===3){g.strokeStyle='#4a6a8a';g.lineWidth=2;g.beginPath();g.moveTo(0,-6);g.lineTo(0,6);g.moveTo(-4,-3);g.lineTo(4,-3);g.stroke();g.beginPath();g.arc(0,1,6,.2,Math.PI-.2);g.stroke();g.beginPath();g.arc(0,-7,1.6,0,7);g.stroke();}
  else {g.fillStyle=rad(g,-2,-2,1,7,[[0,'#ffffff'],[.5,'#f0e8ff'],[1,'#b8a8d8']]);g.beginPath();g.arc(0,0,6,0,7);g.fill();}
  g.restore();}
function graverMachine(v){const k='mac'+v;if(CACHE[k])return CACHE[k];const Wd=48,Hd=96,s=92;const {c,g}=toile(Wd,Hd);const cx=Wd/2;
  const C=[['#c81c2c','#7a0a14'],['#1c4ac8','#0a1a6a'],['#1c8a4a','#0a4a24'],['#8a1cc8','#4a0a6a'],['#c86a1c','#6a3008']][v%5];
  g.fillStyle='rgba(0,0,0,.4)';g.beginPath();g.ellipse(cx,s-2,20,4,0,0,7);g.fill();
  /* le socle */
  g.fillStyle=lin(g,0,s-22,0,s,[[0,'#2a1a10'],[1,'#120804']]);g.fillRect(cx-18,s-22,36,20);R(g,cx-18,s-23,36,2,OR[2]);
  /* le corps */
  g.fillStyle=lin(g,cx-18,0,cx+18,0,[[0,C[1]],[.3,C[0]],[.7,C[0]],[1,C[1]]]);g.beginPath();g.moveTo(cx-18,s-22);g.lineTo(cx-18,26);g.quadraticCurveTo(cx-18,6,cx,6);g.quadraticCurveTo(cx+18,6,cx+18,26);g.lineTo(cx+18,s-22);g.closePath();g.fill();
  g.strokeStyle=orG(g,0,6,0,s);g.lineWidth=2;g.stroke();
  /* le fronton et ses ampoules (allumées par-dessus) */
  g.fillStyle='#1a0a08';g.beginPath();g.ellipse(cx,20,12,8,0,0,7);g.fill();g.fillStyle=orG(g,cx-10,14,cx+10,26);g.font='900 8px '+SERIF;g.textAlign='center';g.textBaseline='middle';g.fillText('777',cx,21);
  /* l'écran et ses trois rouleaux */
  R(g,cx-15,32,30,22,'#120806');g.fillStyle=lin(g,0,34,0,52,[[0,'#bdb6a8'],[.5,'#ffffff'],[1,'#bdb6a8']]);for(let i=0;i<3;i++)g.fillRect(cx-14+i*9.6,34,8.6,18);
  symbole(g,[0,2,4,1,3][v%5],cx-9.4,43,.62);symbole(g,[2,4,1,3,0][v%5],cx,43,.62);symbole(g,[4,1,3,0,2][v%5],cx+9.4,43,.62);
  R(g,cx-15,42.5,30,1,'rgba(230,30,40,.8)');g.strokeStyle=OR[1];g.lineWidth=1.2;g.strokeRect(cx-15.5,31.5,31,23);
  /* la tablette, les boutons */
  g.fillStyle=lin(g,0,58,0,66,[[0,'#3a2a1a'],[1,'#1a0e06']]);g.beginPath();g.moveTo(cx-20,58);g.lineTo(cx+20,58);g.lineTo(cx+18,66);g.lineTo(cx-18,66);g.fill();R(g,cx-20,57,40,1.5,OR[1]);
  for(const [dx,cl] of [[-10,'#ff4a4a'],[-2,'#ffd23a'],[6,'#4aff7a']]){g.fillStyle=cl;g.beginPath();g.ellipse(cx+dx,61,2.4,1.4,0,0,7);g.fill();}
  R(g,cx-8,68,16,3,'#0a0604');R(g,cx-6,72,12,6,'rgba(0,0,0,.35)');
  /* le bras */
  g.strokeStyle='#c8c8d0';g.lineWidth=2;g.beginPath();g.moveTo(cx+19,44);g.lineTo(cx+23,40);g.lineTo(cx+23,22);g.stroke();g.fillStyle='#d81c2c';g.beginPath();g.arc(cx+23,20,3.4,0,7);g.fill();g.fillStyle='rgba(255,255,255,.6)';g.fillRect(cx+21.5,18,1.4,1.4);
  g.fillStyle=orG(g,cx+18,40,cx+24,48);g.fillRect(cx+18,40,5,8);
  /* un reflet sur la carrosserie */
  g.fillStyle='rgba(255,255,255,.12)';g.fillRect(cx-15,26,3,s-50);
  return CACHE[k]={toile:c,W:Wd,H:Hd,sol:s};}
function graverTabouret(){if(CACHE.tab)return CACHE.tab;const {c,g}=toile(22,30);g.fillStyle='rgba(0,0,0,.35)';g.beginPath();g.ellipse(11,27,7,2,0,0,7);g.fill();
  g.strokeStyle=OR[2];g.lineWidth=1.4;g.beginPath();g.moveTo(6,26);g.lineTo(8,12);g.moveTo(16,26);g.lineTo(14,12);g.moveTo(7,20);g.lineTo(15,20);g.stroke();
  g.fillStyle=lin(g,0,6,0,14,[[0,'#d82c3c'],[1,'#7a0c18']]);g.beginPath();g.ellipse(11,10,8,4,0,0,7);g.fill();g.fillStyle='rgba(255,255,255,.25)';g.beginPath();g.ellipse(9,9,3,1.2,0,0,7);g.fill();
  return CACHE.tab={toile:c,W:22,H:30,sol:27};}
function graverTableRoulette(){if(CACHE.rt)return CACHE.rt;const Wd=270,Hd=132,s=124;const {c,g}=toile(Wd,Hd);const cx=Wd/2,cy=58;
  g.fillStyle='rgba(0,0,0,.4)';g.beginPath();g.ellipse(cx,s-6,128,16,0,0,7);g.fill();
  /* les pieds tournés */
  for(const dx of [-100,-40,40,100]){g.fillStyle=lin(g,cx+dx-3,0,cx+dx+3,0,[[0,'#3a1a08'],[.5,'#7a3a14'],[1,'#3a1a08']]);g.fillRect(cx+dx-3,cy+40,6,s-cy-46);R(g,cx+dx-4,s-8,8,3,OR[2]);}
  /* le flanc d'acajou */
  g.fillStyle=lin(g,0,cy+30,0,cy+50,[[0,'#6a2a0e'],[1,'#3a1406']]);g.beginPath();g.ellipse(cx,cy+8,128,46,0,0,Math.PI);g.lineTo(cx-128,cy);g.fill();
  g.fillStyle='#4a1c08';g.fillRect(cx-128,cy,256,9);
  /* le plateau : bord, tapis vert, tableau des numéros */
  g.fillStyle=lin(g,0,cy-48,0,cy+46,[[0,'#8a4a1a'],[1,'#5a2a0c']]);g.beginPath();g.ellipse(cx,cy,128,46,0,0,7);g.fill();
  g.strokeStyle=orG(g,cx-128,0,cx+128,0);g.lineWidth=1.5;g.beginPath();g.ellipse(cx,cy,124,43,0,0,7);g.stroke();
  g.fillStyle=lin(g,0,cy-40,0,cy+40,[[0,'#1a7a44'],[1,'#0e5a30']]);g.beginPath();g.ellipse(cx,cy,118,39,0,0,7);g.fill();
  /* la grille des numéros, à droite de la roue */
  const gx=cx-12,gy=cy-22,cw=9.6,ch=12;g.save();g.beginPath();g.ellipse(cx,cy,116,37,0,0,7);g.clip();
  R(g,gx-10,gy,10,ch*3,'#1a8a4a');g.fillStyle='#fff';g.font='700 6px Arial';g.textAlign='center';g.textBaseline='middle';g.fillText('0',gx-5,gy+ch*1.5);
  const ROUGES=[1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36];
  for(let col=0;col<12;col++)for(let row=0;row<3;row++){const n=col*3+(3-row);R(g,gx+col*cw,gy+row*ch,cw,ch,ROUGES.includes(n)?'#b81c24':'#1a1614');g.fillStyle='#f6ecd4';g.font='700 4.6px Arial';g.fillText(String(n),gx+col*cw+cw/2,gy+row*ch+ch/2);}
  g.strokeStyle='rgba(255,255,255,.75)';g.lineWidth=.5;for(let col=0;col<=12;col++){g.beginPath();g.moveTo(gx+col*cw,gy);g.lineTo(gx+col*cw,gy+ch*3);g.stroke();}for(let row=0;row<=3;row++){g.beginPath();g.moveTo(gx-10,gy+row*ch);g.lineTo(gx+cw*12,gy+row*ch);g.stroke();}
  for(let k=0;k<3;k++){g.strokeRect(gx+k*cw*4,gy+ch*3+1,cw*4,8);g.fillStyle='#f6ecd4';g.font='700 4.4px Arial';g.fillText(['1–12','13–24','25–36'][k],gx+k*cw*4+cw*2,gy+ch*3+5);}
  g.restore();
  /* la cuvette de la roue (la roue elle-même tourne par-dessus) */
  g.fillStyle='#2a1006';g.beginPath();g.ellipse(cx-74,cy,34,25,0,0,7);g.fill();g.strokeStyle=orG(g,cx-108,0,cx-40,0);g.lineWidth=2;g.stroke();
  /* quelques plaques et jetons posés */
  for(const [x,y,cl] of [[cx+30,cy+24,'#d82c3c'],[cx+52,cy-14,'#2a6ad8'],[cx+80,cy+4,'#f0c040'],[cx+14,cy-6,'#2a2a2a']])for(let k=0;k<3;k++){g.fillStyle=cl;g.beginPath();g.ellipse(x,y-k*1.4,3.4,1.8,0,0,7);g.fill();g.strokeStyle='rgba(255,255,255,.7)';g.lineWidth=.5;g.stroke();}
  return CACHE.rt={toile:c,W:Wd,H:Hd,sol:s,cy};}
let ROUE_IMG=null;
function roueImg(){if(ROUE_IMG)return ROUE_IMG;const S=72,{c,g}=toile(S,S),o=S/2;const ORD=[0,32,15,19,4,21,2,25,17,34,6,27,13,36,11,30,8,23,10,5,24,16,33,1,20,14,31,9,22,18,29,7,28,12,35,3,26];
  for(let i=0;i<37;i++){const a0=i/37*Math.PI*2,a1=(i+1)/37*Math.PI*2;g.fillStyle=i===0?'#1a8a4a':(i%2?'#b81c24':'#1a1614');g.beginPath();g.moveTo(o,o);g.arc(o,o,33,a0,a1);g.closePath();g.fill();}
  g.strokeStyle=OR[1];g.lineWidth=1.2;g.beginPath();g.arc(o,o,33,0,7);g.stroke();g.beginPath();g.arc(o,o,24,0,7);g.stroke();
  g.fillStyle=lin(g,0,o-20,0,o+20,[[0,'#8a4a1a'],[1,'#4a1c08']]);g.beginPath();g.arc(o,o,22,0,7);g.fill();
  g.strokeStyle=orG(g,o-10,o-10,o+10,o+10);g.lineWidth=2;for(let k=0;k<4;k++){const a=k*Math.PI/2;g.beginPath();g.moveTo(o,o);g.lineTo(o+Math.cos(a)*14,o+Math.sin(a)*14);g.stroke();}
  g.fillStyle=orG(g,o-5,o-5,o+5,o+5);g.beginPath();g.arc(o,o,5,0,7);g.fill();void ORD;
  return ROUE_IMG=c;}
function graverTable21(){if(CACHE.bj)return CACHE.bj;const Wd=220,Hd=110,s=102;const {c,g}=toile(Wd,Hd);const cx=Wd/2,cy=26;
  g.fillStyle='rgba(0,0,0,.4)';g.beginPath();g.ellipse(cx,s-5,98,13,0,0,7);g.fill();
  for(const dx of [-70,0,70]){g.fillStyle=lin(g,cx+dx-3,0,cx+dx+3,0,[[0,'#3a1a08'],[.5,'#7a3a14'],[1,'#3a1a08']]);g.fillRect(cx+dx-3,cy+50,6,s-cy-56);R(g,cx+dx-4,s-8,8,3,OR[2]);}
  /* le demi-cercle */
  g.fillStyle=lin(g,0,cy,0,cy+64,[[0,'#6a2a0e'],[1,'#3a1406']]);g.beginPath();g.moveTo(cx-104,cy);g.ellipse(cx,cy,104,62,0,0,Math.PI);g.closePath();g.fill();
  g.fillStyle=lin(g,0,cy-6,0,cy+58,[[0,'#8a4a1a'],[1,'#5a2a0c']]);g.beginPath();g.moveTo(cx-104,cy);g.ellipse(cx,cy,104,54,0,0,Math.PI);g.closePath();g.fill();
  g.fillStyle=lin(g,0,cy,0,cy+50,[[0,'#1a7a44'],[1,'#0e5a30']]);g.beginPath();g.moveTo(cx-94,cy);g.ellipse(cx,cy,94,46,0,0,Math.PI);g.closePath();g.fill();
  R(g,cx-104,cy-3,208,4,'#3a1406');R(g,cx-104,cy-4,208,1.5,OR[1]);
  g.strokeStyle='rgba(255,230,160,.7)';g.lineWidth=.8;g.beginPath();g.ellipse(cx,cy,70,30,0,.1,Math.PI-.1);g.stroke();
  g.fillStyle='rgba(255,236,180,.9)';g.font='700 5.2px '+SERIF;g.textAlign='center';g.fillText('LE VINGT-ET-UN PAIE 3 POUR 2',cx,cy+38);
  g.font='italic 600 4.6px '+SERIF;g.fillStyle='rgba(255,236,180,.7)';g.fillText('Fonfon tire jusqu’à 17',cx,cy+45);
  /* les places des joueurs, le sabot, les jetons de la banque */
  for(let k=0;k<5;k++){const a=Math.PI*(.15+k*.175),x=cx+Math.cos(a)*62,y=cy+Math.sin(a)*28;g.strokeStyle='rgba(255,255,255,.6)';g.lineWidth=.6;g.strokeRect(x-5,y-3.5,10,7);}
  g.fillStyle='#1a1614';g.fillRect(cx+56,cy+2,18,10);g.fillStyle='#f6f2ea';g.fillRect(cx+58,cy+3,14,6);R(g,cx+56,cy+2,18,1,OR[1]);
  for(let i=0;i<5;i++)for(let k=0;k<4;k++){g.fillStyle=['#d82c3c','#2a6ad8','#2a2a2a','#f0c040','#1c8a4a'][i];g.fillRect(cx-36+i*8,cy+2-k*1.2,6,2);}
  return CACHE.bj={toile:c,W:Wd,H:Hd,sol:s};}
function graverTreuil(){if(CACHE.tr)return CACHE.tr;const Wd=150,Hd=150,s=142;const {c,g}=toile(Wd,Hd);const cx=Wd/2;
  g.fillStyle='rgba(0,0,0,.4)';g.beginPath();g.ellipse(cx,s-4,62,10,0,0,7);g.fill();
  /* l'estrade d'acajou */
  g.fillStyle=lin(g,0,s-26,0,s,[[0,'#6a2a0e'],[1,'#2a1006']]);g.fillRect(cx-60,s-24,120,20);g.fillStyle=lin(g,0,s-34,0,s-22,[[0,'#8a4a1a'],[1,'#5a2a0c']]);g.beginPath();g.ellipse(cx,s-26,60,9,0,0,7);g.fill();R(g,cx-60,s-25,120,1.5,OR[1]);
  /* la petite grue de laiton */
  g.strokeStyle=orG(g,cx-40,20,cx+20,s);g.lineWidth=3;g.beginPath();g.moveTo(cx-30,s-30);g.lineTo(cx-30,22);g.lineTo(cx+40,22);g.stroke();
  g.lineWidth=1.2;for(let y=30;y<s-34;y+=10){g.beginPath();g.moveTo(cx-34,y);g.lineTo(cx-26,y+10);g.moveTo(cx-26,y);g.lineTo(cx-34,y+10);g.stroke();}
  for(let x=cx-26;x<cx+38;x+=10){g.beginPath();g.moveTo(x,18);g.lineTo(x+10,26);g.stroke();}
  g.fillStyle='#3a2a1a';g.fillRect(cx-36,14,14,12);g.fillStyle='#ffd23a';g.fillRect(cx-34,16,4,3);
  R(g,cx-46,20,12,6,'#5a4a3a');
  /* le grand cadran à aiguille (le chiffre bouge par-dessus) */
  g.fillStyle=orG(g,cx+8,s-90,cx+56,s-40);g.beginPath();g.arc(cx+32,s-62,24,0,7);g.fill();g.fillStyle='#1a0a06';g.beginPath();g.arc(cx+32,s-62,20,0,7);g.fill();
  g.strokeStyle='rgba(255,240,200,.8)';g.lineWidth=.8;for(let k=0;k<11;k++){const a=Math.PI*.8+k/10*Math.PI*1.4;g.beginPath();g.moveTo(cx+32+Math.cos(a)*15,s-62+Math.sin(a)*15);g.lineTo(cx+32+Math.cos(a)*18,s-62+Math.sin(a)*18);g.stroke();}
  g.fillStyle='#f0c860';g.font='900 7px '+SERIF;g.textAlign='center';g.fillText('LE TREUIL',cx,s-6);
  return CACHE.tr={toile:c,W:Wd,H:Hd,sol:s};}
function graverClous(){if(CACHE.cl)return CACHE.cl;const Wd=130,Hd=160,s=152;const {c,g}=toile(Wd,Hd);const cx=Wd/2;
  g.fillStyle='rgba(0,0,0,.4)';g.beginPath();g.ellipse(cx,s-4,56,9,0,0,7);g.fill();
  g.fillStyle=lin(g,0,s-22,0,s,[[0,'#3a1a08'],[1,'#1a0804']]);g.fillRect(cx-52,s-22,104,18);R(g,cx-52,s-23,104,2,OR[1]);
  /* le grand cadre doré */
  g.fillStyle=orG(g,cx-56,6,cx+56,s-22);g.beginPath();g.moveTo(cx-56,s-22);g.lineTo(cx-56,26);g.quadraticCurveTo(cx,-6,cx+56,26);g.lineTo(cx+56,s-22);g.closePath();g.fill();
  g.fillStyle=lin(g,0,20,0,s-30,[[0,'#2a0a3a'],[1,'#120418']]);g.beginPath();g.moveTo(cx-48,s-28);g.lineTo(cx-48,30);g.quadraticCurveTo(cx,4,cx+48,30);g.lineTo(cx+48,s-28);g.closePath();g.fill();
  g.fillStyle='#ffe8a0';g.font='900 7px '+SERIF;g.textAlign='center';g.fillText('LE MUR À CLOUS',cx,25);
  /* les clous */
  for(let r=0;r<9;r++)for(let k=0;k<=r+2;k++){const x=cx+(k-(r+2)/2)*9,y=36+r*9.5;g.fillStyle='#e8e8f0';g.beginPath();g.arc(x,y,1.3,0,7);g.fill();g.fillStyle='rgba(255,255,255,.5)';g.fillRect(x-.8,y-.8,.8,.8);}
  /* les cases du bas, du rouge au vert */
  const CL=['#ff3a5a','#ff7a3a','#ffb43a','#d8d83a','#7ad84a','#d8d83a','#ffb43a','#ff7a3a','#ff3a5a'],TX=['29','4','1','.4','.2','.4','1','4','29'];
  for(let k=0;k<9;k++){const x=cx-44+k*9.8;g.fillStyle=CL[k];g.fillRect(x+.6,s-42,8.6,12);g.fillStyle='#1a0a06';g.font='800 3.8px Arial';g.fillText('×'+TX[k],x+4.9,s-34.4);}
  return CACHE.cl={toile:c,W:Wd,H:Hd,sol:s};}
function graverCaisse(){if(CACHE.ca)return CACHE.ca;const Wd=150,Hd=120,s=112;const {c,g}=toile(Wd,Hd);const cx=Wd/2;
  g.fillStyle='rgba(0,0,0,.4)';g.fillRect(cx-70,s-6,140,8);
  /* le guichet d'acajou, la grille de laiton, l'enseigne */
  g.fillStyle=lin(g,0,s-50,0,s,[[0,'#6a2a0e'],[1,'#2a1006']]);g.fillRect(cx-68,s-50,136,46);
  for(let x=cx-62;x<cx+62;x+=31){g.strokeStyle='rgba(240,200,110,.45)';g.lineWidth=1;g.strokeRect(x+.5,s-44.5,26,32);}
  g.fillStyle=lin(g,0,s-58,0,s-48,[[0,'#a85a24'],[1,'#6a2a0e']]);g.fillRect(cx-72,s-58,144,9);R(g,cx-72,s-59,144,2,OR[1]);
  g.fillStyle='rgba(60,30,10,.3)';g.fillRect(cx-64,10,128,s-70);
  g.strokeStyle=orG(g,cx-64,10,cx+64,s-60);g.lineWidth=1.4;for(let x=cx-60;x<=cx+60;x+=8){g.beginPath();g.moveTo(x,24);g.lineTo(x,s-60);g.stroke();}
  g.beginPath();g.moveTo(cx-64,24);g.lineTo(cx+64,24);g.stroke();
  g.fillStyle=orG(g,cx-64,0,cx+64,24);g.beginPath();g.moveTo(cx-68,24);g.quadraticCurveTo(cx,-4,cx+68,24);g.closePath();g.fill();
  g.fillStyle='#4a0c1a';g.font='900 9px '+SERIF;g.textAlign='center';g.fillText('LA CAISSE',cx,19);
  /* le passe-monnaie et les tickets à gratter en éventail */
  g.fillStyle='#1a0a06';g.beginPath();g.ellipse(cx,s-58,16,4,0,0,Math.PI);g.fill();
  for(let k=0;k<5;k++){g.save();g.translate(cx+30,s-60);g.rotate(-.5+k*.22);g.fillStyle=['#ffd23a','#ff4a8a','#4ad8ff','#7aff8a','#ff9a3a'][k];g.fillRect(-4,-14,8,12);g.fillStyle='rgba(180,180,190,.9)';g.fillRect(-3,-11,6,5);g.restore();}
  return CACHE.ca={toile:c,W:Wd,H:Hd,sol:s};}
function graverPalmier(){if(CACHE.pa)return CACHE.pa;const Wd=70,Hd=110,s=106;const {c,g}=toile(Wd,Hd);const cx=Wd/2;
  g.fillStyle='rgba(0,0,0,.4)';g.beginPath();g.ellipse(cx,s-2,15,4,0,0,7);g.fill();
  g.fillStyle=orG(g,cx-14,s-28,cx+14,s);g.beginPath();g.moveTo(cx-14,s-28);g.lineTo(cx+14,s-28);g.lineTo(cx+10,s-2);g.lineTo(cx-10,s-2);g.closePath();g.fill();R(g,cx-15,s-30,30,4,OR[0]);
  g.strokeStyle='#5a3a1a';g.lineWidth=4;g.beginPath();g.moveTo(cx,s-28);g.quadraticCurveTo(cx-2,s-60,cx+2,s-74);g.stroke();
  for(let k=0;k<9;k++){const a=-Math.PI/2+(k-4)*.42,L=26+hA(k,1,1)*8;g.strokeStyle=k%2?'#2a6a2a':'#3a8a3a';g.lineWidth=1.4;
    for(let j=0;j<12;j++){const t=j/12,x=cx+2+Math.cos(a)*L*t,y=s-74+Math.sin(a)*L*t+t*t*16;g.beginPath();g.moveTo(x,y);g.lineTo(x+Math.cos(a+1.3)*6*(1-t*.6),y+Math.sin(a+1.3)*6*(1-t*.6)+3);g.moveTo(x,y);g.lineTo(x+Math.cos(a-1.3)*6*(1-t*.6),y+Math.sin(a-1.3)*6*(1-t*.6)+3);g.stroke();}}
  return CACHE.pa={toile:c,W:Wd,H:Hd,sol:s};}
function graverColonne(){if(CACHE.co)return CACHE.co;const Wd=34,Hd=170,s=164;const {c,g}=toile(Wd,Hd);const cx=Wd/2;
  g.fillStyle='rgba(0,0,0,.45)';g.beginPath();g.ellipse(cx,s-2,15,4,0,0,7);g.fill();
  g.fillStyle=orG(g,cx-15,s-14,cx+15,s);g.fillRect(cx-15,s-14,30,12);
  g.fillStyle=lin(g,cx-10,0,cx+10,0,[[0,'#c8b088'],[.45,'#fffaf0'],[1,'#b89c70']]);g.fillRect(cx-10,24,20,s-38);
  for(let k=0;k<4;k++)R(g,cx-7+k*4.6,26,1.2,s-42,'rgba(120,90,40,.18)');
  g.fillStyle=orG(g,cx-16,4,cx+16,26);g.fillRect(cx-16,10,32,14);g.beginPath();g.ellipse(cx-12,24,5,4,0,0,7);g.ellipse(cx+12,24,5,4,0,0,7);g.fill();R(g,cx-17,6,34,5,OR[0]);
  return CACHE.co={toile:c,W:Wd,H:Hd,sol:s};}
function graverBanquette(){if(CACHE.bq)return CACHE.bq;const Wd=110,Hd=54,s=50;const {c,g}=toile(Wd,Hd);
  g.fillStyle='rgba(0,0,0,.4)';g.beginPath();g.ellipse(55,s-2,50,5,0,0,7);g.fill();
  g.fillStyle=lin(g,0,6,0,30,[[0,'#a81c2a'],[1,'#5a0a14']]);g.beginPath();g.moveTo(6,30);g.quadraticCurveTo(6,6,30,8);g.lineTo(80,8);g.quadraticCurveTo(104,6,104,30);g.closePath();g.fill();
  g.fillStyle='rgba(0,0,0,.22)';for(let x=18;x<96;x+=14)for(let y=14;y<28;y+=8){g.beginPath();g.arc(x+(y%16?7:0),y,1,0,7);g.fill();}
  g.fillStyle=lin(g,0,28,0,42,[[0,'#c82c3a'],[1,'#7a0c18']]);g.fillRect(6,28,98,14);R(g,6,42,98,3,OR[2]);
  for(const x of [10,100]){R(g,x-2,44,4,6,OR[2]);}
  return CACHE.bq={toile:c,W:Wd,H:Hd,sol:s};}
function graverCordon(){if(CACHE.cd)return CACHE.cd;const {c,g}=toile(14,40);g.fillStyle='rgba(0,0,0,.35)';g.beginPath();g.ellipse(7,37,5,1.6,0,0,7);g.fill();
  g.fillStyle=orG(g,4,0,10,40);g.fillRect(5.5,8,3,28);g.beginPath();g.ellipse(7,36,5,2,0,0,7);g.fill();g.beginPath();g.arc(7,7,3,0,7);g.fill();return CACHE.cd={toile:c,W:14,H:40,sol:37};}
const VIDE=()=>({toile:document.createElement('canvas'),W:1,H:1,sol:0});
const GRAVEURS={x_jol_cas_mac_sol:graverMachine,x_jol_cas_tab_sol:graverTabouret,x_jol_cas_rt_sol:graverTableRoulette,x_jol_cas_bj_sol:graverTable21,x_jol_cas_tr_sol:graverTreuil,x_jol_cas_cl_sol:graverClous,
  x_jol_cas_ca_sol:graverCaisse,x_jol_cas_pa_sol:graverPalmier,x_jol_cas_co_sol:graverColonne,x_jol_cas_bq_sol:graverBanquette,x_jol_cas_cd_sol:graverCordon};
function graver(t,v){const r=(GRAVEURS[t]||VIDE)(v||0);return {toile:r.toile,W:r.W,H:r.H,sol:r.sol};}

/* ---------- LES GENS ---------- */
const AP=(o)=>Object.assign({},DEF_AP,{bas:0,souliers:1,chaussures:'#1a1a22',sac:0,chapeau:0,raye:0,motif:0,barbe:0,_civil:true,_pnj:true},o);
const CROUPIER={x:ROUL.x+40,y:ROUL.y-60,ap:AP({peau:2,cheveux:1,coiffe:9,veste:'#16161c',pantalon:'#16161c',_bij:'bij_chaine_or'}),dir:'bas'};
const FONFON={x:BJ.x,y:BJ.y-44,ap:AP({peau:3,cheveux:0,coiffe:1,barbe:3,veste:'#5a0a14',pantalon:'#16161c'}),dir:'bas'};
const CAISSIERE={x:CAISSE.x,y:CAISSE.y-62,ap:AP({peau:1,cheveux:7,coiffe:6,veste:'#16161c',pantalon:'#16161c',_bij:'bij_perles'}),dir:'bas'};
const PORTIER={x:420,y:818,ap:AP({peau:5,cheveux:0,coiffe:1,veste:'#5a0a14',pantalon:'#16161c',_lun:'lun_noires'}),dir:'bas'};
const CLIENTS=[
  {x:SLOTS[1].x,y:SLOTS[1].y+24,ap:AP({peau:4,cheveux:3,coiffe:7,veste:'#e8c040',pantalon:'#2a2a34'}),dir:'haut',jeu:1},
  {x:SLOTS[3].x,y:SLOTS[3].y+24,ap:AP({peau:1,cheveux:2,coiffe:3,barbe:2,veste:'#2a4a8a',pantalon:'#1a1a22'}),dir:'haut',jeu:3},
  {x:ROUL.x-70,y:ROUL.y+70,ap:AP({peau:6,cheveux:4,coiffe:4,veste:'#f6f4ee',pantalon:'#16161c',_bij:'bij_chaine_or'}),dir:'haut'},
  {x:ROUL.x+20,y:ROUL.y+76,ap:AP({peau:2,cheveux:7,coiffe:12,veste:'#a81c2a',pantalon:'#a81c2a',_bij:'bij_perles'}),dir:'haut'},
  {x:ROUL.x+96,y:ROUL.y+60,ap:AP({peau:3,cheveux:1,coiffe:0,barbe:1,veste:'#16161c',pantalon:'#16161c'}),dir:'haut'},
  {x:BJ.x-56,y:BJ.y+62,ap:AP({peau:5,cheveux:5,coiffe:10,veste:'#1c6a4a',pantalon:'#1a1a22'}),dir:'haut'},
  {x:BJ.x+58,y:BJ.y+60,ap:AP({peau:2,cheveux:0,coiffe:2,barbe:3,veste:'#6a4a2a',pantalon:'#2a2a34',_lun:'lun_aviateur'}),dir:'haut'},
  {x:760,y:740,ap:AP({peau:4,cheveux:6,coiffe:5,veste:'#2a2a6a',pantalon:'#16161c'}),dir:'droite'}];

const SPR=new Map();
function poser(g,k,x,y,w,h,ox,oy,fn){const E=Math.max(1,Math.min(4,Math.round(g.getTransform?g.getTransform().a:2)||2)),key=k+'@'+E;let c=SPR.get(key);
  if(!c){c=document.createElement('canvas');c.width=Math.ceil(w*E);c.height=Math.ceil(h*E);const q=c.getContext('2d');q.setTransform(E,0,0,E,ox*E,oy*E);const sG=GESTE;try{GESTE={t:0};fn(q);}catch(z){}finally{GESTE=sG;}SPR.set(key,c);}
  g.drawImage(c,Math.round(x)-ox,Math.round(y)-oy,w,h);}
const vu=(x,y,cx,cy,m,up)=>{const X=x-cx,Y=y-cy;return X>-m&&X<VW+m&&Y>-60-(up||0)&&Y<VH+(up||90);};
function gens(P,k){return {y:P.y,f:(g,cx,cy)=>{if(vu(P.x,P.y,cx,cy,40))poser(g,k,P.x-cx,P.y-cy,60,80,30,64,q=>personne(q,0,0,P.ap,P.dir,0,false));}};}

/* ---------- CE QUI BOUGE ---------- */
let CAG_C=0,CAG_AFF=0;   /* la cagnotte, en centimes : la vraie, et celle qu'on affiche (elle rattrape la vraie) */
async function lireCagnotte(){try{if(typeof sb!=='undefined'&&sb&&sb.from){const r=await sb.from('casino_cagnotte').select('cents').eq('cle','port').limit(1);if(r&&r.data&&r.data[0])CAG_C=+r.data[0].cents||CAG_C;}}catch(x){}}
window.CASINO_CAGNOTTE=v=>{if(typeof v==='number'&&v>0)CAG_C=v;return CAG_C;};
function euros(c){return Math.floor((c||0)/100).toLocaleString('fr-FR').replace(/ | /g,' ')+' €';}
function dessinerCagnotte(g,cx,cy){const t=now(),{x,y,w,h}=CAG,X=x-cx,Y=y-cy;if(!vu(x,y,cx,cy,w,h))return;
  if(CAG_AFF<CAG_C)CAG_AFF=Math.min(CAG_C,CAG_AFF+Math.max(1,(CAG_C-CAG_AFF)*.04));else CAG_AFF=CAG_C;
  /* la guirlande d'ampoules qui court autour du cadre */
  const per=2*(w+h+32),N=44;for(let i=0;i<N;i++){let d=i/N*per,px,py;const L=w+16,Hh=h+16;
    if(d<L){px=X-L/2+d;py=Y-Hh/2;}else if((d-=L)<Hh){px=X+L/2;py=Y-Hh/2+d;}else if((d-=Hh)<L){px=X+L/2-d;py=Y+Hh/2;}else{d-=L;px=X-L/2;py=Y+Hh/2-d;}
    const on=((i+Math.floor(t*8))%4)<2;g.fillStyle=on?'#fff6c0':'#8a6a2a';g.fillRect(Math.round(px)-1,Math.round(py)-1,2,2);if(on){g.fillStyle='rgba(255,230,140,.25)';g.fillRect(Math.round(px)-2,Math.round(py)-2,4,4);}}
  /* le montant, en grosses lettres d'or */
  g.save();g.textAlign='center';g.textBaseline='middle';g.font='900 26px '+SERIF;const s=CAG_C>0?euros(CAG_AFF):'— — —';
  g.fillStyle='rgba(0,0,0,.5)';g.fillText(s,X+1,Y+8);g.fillStyle=lin(g,0,Y-6,0,Y+22,[[0,'#fff8d0'],[.5,'#ffd24a'],[1,'#c8922a']]);g.fillText(s,X,Y+7);g.restore();
  g.fillStyle='rgba(255,236,190,.85)';g.font='700 7px '+SERIF;g.textAlign='center';g.fillText('un coup sur trois mille l’emporte, à n’importe quelle table',X,Y+38);}
function dessinerRoue(g,cx,cy){const t=now(),X=ROUL.x-cx-74,Y=ROUL.y+48-cy-CACHE.rt.sol+CACHE.rt.cy;if(!vu(ROUL.x,ROUL.y,cx,cy,160))return;
  const img=roueImg();g.save();g.translate(X,Y);g.scale(1,.72);g.rotate(t*.9);g.drawImage(img,-36,-36,72,72);g.restore();
  /* la bille qui court dans l'autre sens, puis se pose */
  const ph=t%14,v=ph<8?(1-ph/8)*5+.9:.9,a=ph<8?-(ph*5-ph*ph*.3125)*1.3:t*.9+2.1,r=ph<8?31:26;g.fillStyle='#fff';g.beginPath();g.arc(X+Math.cos(a)*r,Y+Math.sin(a)*r*.72,1.7,0,7);g.fill();void v;
  if(Math.abs(ph-8.02)<.02&&Date.now()-PAROLE>3000){PAROLE=Date.now();try{texteVolant(CROUPIER.x,CROUPIER.y-46,['Rien ne va plus !','Le 17, rouge, impair !','Faites vos jeux !','Le zéro !'][Math.floor(hA(Math.floor(t),1,1)*4)],'#ffe8a0');}catch(x){}}}
let PAROLE=0;
function dessinerMachines(g,cx,cy){const t=now();for(let i=0;i<SLOTS.length;i++){const S=SLOTS[i];if(!vu(S.x,S.y,cx,cy,40,100))continue;const X=S.x-cx,Y=S.y-cy-92;
  for(let k=0;k<6;k++){const a=Math.PI+k/5*Math.PI,on=((k+Math.floor(t*6+i))%3)===0;g.fillStyle=on?'#fff6a0':'#7a5a20';g.fillRect(Math.round(X+Math.cos(a)*13)-1,Math.round(Y+20+Math.sin(a)*9)-1,2,2);}
  /* ceux où quelqu'un joue : les rouleaux tournent, puis s'arrêtent */
  const C=CLIENTS.find(c=>c.jeu===i);if(C){const ph=(t+i*1.7)%5;if(ph<1.6){g.save();g.beginPath();g.rect(X-14,Y+34,29,18);g.clip();for(let r=0;r<3;r++){if(ph>.6+r*.4)continue;const o=((t*90+r*7)%8);g.fillStyle='rgba(40,30,30,.55)';for(let yy=-8;yy<20;yy+=8)g.fillRect(X-14+r*9.6,Y+34+yy+o,8.6,2);}g.restore();}
    else if(ph<2.4&&i===1){g.fillStyle='rgba(255,230,120,'+(.6-(ph-1.6)*.7)+')';g.fillRect(X-15,Y+32,30,22);}}}}
function dessinerTreuil(g,cx,cy){const t=now(),{x,y}=TREUIL;if(!vu(x,y,cx,cy,90,150))return;const X=x-cx,Y=y-cy-142+75;
  /* la caisse qui monte, monte… et retombe */
  const ph=t%7,m=ph<5?Math.min(9.9,.97/Math.max(.02,1-ph/5.6)):1,h=Math.min(70,Math.log(m)*30);
  g.strokeStyle='#2a2a2a';g.lineWidth=.8;g.beginPath();g.moveTo(X+40,Y-53);g.lineTo(X+40,Y+26-h);g.stroke();
  g.fillStyle='#c8904a';g.fillRect(X+33,Y+26-h,14,11);g.fillStyle='#8a5a2a';g.fillRect(X+33,Y+29-h,14,1.2);g.fillRect(X+33,Y+33-h,14,1.2);g.strokeStyle='#5a3a1a';g.lineWidth=.6;g.strokeRect(X+33.3,Y+26.3-h,13.4,10.4);
  const ax=X+32,ay=Y+5,a=Math.PI*.8+Math.min(1,Math.log(m)/Math.log(10))*Math.PI*1.4;g.strokeStyle='#ff4a4a';g.lineWidth=1.2;g.beginPath();g.moveTo(ax,ay);g.lineTo(ax+Math.cos(a)*16,ay+Math.sin(a)*16);g.stroke();
  g.fillStyle=ph<5?'#7aff8a':'#ff5a5a';g.font='900 7px Arial';g.textAlign='center';g.fillText('×'+m.toFixed(2),ax,ay+12);}
function dessinerClous(g,cx,cy){const t=now(),{x,y}=CLOUS;if(!vu(x,y,cx,cy,80,160))return;const X=x-cx,Y=y-cy-152;
  for(let b=0;b<2;b++){const ph=(t+b*2.1)%4.2;if(ph>3)continue;const r=Math.floor(ph/3*9),fr=(ph/3*9)%1;let k=0;for(let i=0;i<r;i++)k+=hA(i,Math.floor((t+b*2.1)/4.2),b)<.5?0:1;
    const px=X+(k-(r)/2)*9+(hA(r,Math.floor((t+b*2.1)/4.2),b)<.5?-4.5:4.5)*fr,py=Y+31+r*9.5+fr*9.5-Math.sin(fr*Math.PI)*3;
    g.fillStyle='#ffe8a0';g.beginPath();g.arc(px,py,2,0,7);g.fill();g.fillStyle='#fff';g.fillRect(px-1,py-1,1,1);}}
function dessinerLustres(g,cx,cy){const t=now();for(const x of LUSTRES){if(!vu(x,40,cx,cy,80,60))continue;for(let k=0;k<5;k++){const a=Math.sin(t*2+k*1.9+x);if(a<.6)continue;g.fillStyle='rgba(255,255,255,'+((a-.6)*2.2)+')';const px=x-cx-26+k*13,py=60-cy+(k%2)*6;g.fillRect(px-1,py,2,.8);g.fillRect(px-.4,py-.6,.8,2);}}
  /* le phare qui balaie, au loin, dans la dernière fenêtre */
  const fx=FEN[3]-cx+30,fy=114-cy;const a=t*1.2;const l=Math.max(0,Math.cos(a));if(l>.05){g.fillStyle='rgba(255,236,170,'+(l*.5)+')';g.beginPath();g.moveTo(fx,fy);g.lineTo(fx-60*Math.sin(a)-6,fy-4);g.lineTo(fx-60*Math.sin(a)+6,fy+4);g.closePath();g.fill();}}
function acteurs(){const L=[];
  L.push({y:-1e5,f:(g,cx,cy)=>{dessinerCagnotte(g,cx,cy);dessinerLustres(g,cx,cy);}});
  L.push({y:SLOTS[0].y+1,f:(g,cx,cy)=>dessinerMachines(g,cx,cy)});
  L.push({y:ROUL.y+49,f:(g,cx,cy)=>dessinerRoue(g,cx,cy)});
  for(const [P,k] of [[CROUPIER,'cr'],[FONFON,'ff'],[CAISSIERE,'cs'],[PORTIER,'po']])L.push(gens(P,k));
  CLIENTS.forEach((P,i)=>L.push(gens(P,'c'+i)));
  return L;}
function figurants(){return [];}

/* ---------- LES TABLES : on s'en approche, on joue ---------- */
async function jeu(f,arg){try{if(!window.casinoJouer)eval(await chargerMorceau('casinojeux.js'));window.casinoJouer(f,arg);}catch(x){try{console.warn('CASINO',x);}catch(_){}}}
function decor(){const D=[];const P=(t,x,y,o)=>D.push(Object.assign({t,x,y,gr:0},o||{}));
  SLOTS.forEach((S,i)=>{P('x_jol_cas_mac_sol',S.x,S.y,{col:[42,20],v:i});if(!CLIENTS.some(c=>c.jeu===i))P('x_jol_cas_vide',S.x,S.y+20,{agir:()=>jeu('sous',{n:i}),libelle:'Jouer',nom:'MACHINE À SOUS',demi:22});});
  P('x_jol_cas_rt_sol',ROUL.x,ROUL.y+48,{col:[250,70]});P('x_jol_cas_vide',ROUL.x,ROUL.y+80,{agir:()=>jeu('roulette'),libelle:'Miser',nom:'LA ROULETTE',demi:130});
  P('x_jol_cas_bj_sol',BJ.x,BJ.y+38,{col:[200,56]});P('x_jol_cas_vide',BJ.x,BJ.y+64,{agir:()=>jeu('vingtun'),libelle:'S’asseoir',nom:'LE VINGT-ET-UN DE FONFON',demi:100});
  P('x_jol_cas_bq_sol',170,690,{col:[100,18]});P('x_jol_cas_pa_sol',96,670,{col:[26,10]});P('x_jol_cas_pa_sol',244,670,{col:[26,10]});
  P('x_jol_cas_bq_sol',880,700,{col:[100,18]});P('x_jol_cas_pa_sol',806,680,{col:[26,10]});P('x_jol_cas_pa_sol',954,680,{col:[26,10]});
  P('x_jol_cas_ca_sol',CAISSE.x,CAISSE.y,{col:[140,40]});P('x_jol_cas_vide',CAISSE.x+10,CAISSE.y+20,{agir:()=>jeu('grattage'),libelle:'Acheter un ticket',nom:'LA CAISSE · TICKETS À GRATTER',demi:70});
  P('x_jol_cas_vide',CAG.x,MUR+26,{agir:()=>jeu('cagnotte',CAG_C),libelle:'Voir la cagnotte',nom:'LA CAGNOTTE DU PORT',demi:80});
  for(const [x,y] of PALMES)P('x_jol_cas_pa_sol',x,y,{col:[26,10]});
  for(const [x,y] of COLS)P('x_jol_cas_co_sol',x,y,{col:[30,10]});
  P('x_jol_cas_bq_sol',700,820,{col:[100,18]});P('x_jol_cas_bq_sol',300,800,{col:[100,18]});
  for(let k=0;k<4;k++){P('x_jol_cas_cd_sol',446,600+k*52,{});P('x_jol_cas_cd_sol',554,600+k*52,{});}
  for(const S of SLOTS)P('x_jol_cas_tab_sol',S.x,S.y+16,{});
  DECOR=D;return D;}
let DECOR=[];
const GENS=()=>[CROUPIER,FONFON,CAISSIERE,PORTIER].concat(CLIENTS);
function bloque(x,y){if(x<14||x>W-14||y<MUR+14||y>H-4)return true;
  if(y>H-14&&(x<440||x>560))return true;
  for(const o of DECOR){if(!o.col)continue;if(Math.abs(x-o.x)<o.col[0]/2&&y>o.y-o.col[1]&&y<o.y+3)return true;}
  for(const P of GENS())if(Math.abs(x-P.x)<7&&Math.abs(y-P.y)<5)return true;
  return false;}

/* ---------- LA FLUIDITÉ : les gens et le mobilier gravés d'avance ---------- */
setTimeout(()=>{try{roueImg();for(const k of ['rt','bj','tr','cl','ca'])void k;}catch(x){}},300);


lireCagnotte();setInterval(()=>{if(!document.hidden)lireCagnotte();},8000);
/* LA SORTIE : par la grande porte, on retrouve la place */
let PARTI=false;
setInterval(()=>{try{if(PARTI||typeof joueur==='undefined'||window.ECRAN_COUVRANT)return;if(joueur.y>H-16&&joueur.x>440&&joueur.x<560){PARTI=true;try{sauver();}catch(x){}
  try{const f=document.createElement('div');f.style.cssText='position:fixed;inset:0;z-index:2147483000;background:#1a0a06;opacity:0;transition:opacity .45s;pointer-events:none';document.body.appendChild(f);requestAnimationFrame(()=>f.style.opacity='1');}catch(x){}
  setTimeout(()=>{const v=window.MA_VERSION?('&v='+encodeURIComponent(window.MA_VERSION)):'';location.href='spawn.html?de=casino'+v+'&t='+Date.now();},480);}}catch(x){}},150);
setTimeout(()=>{const v=document.getElementById('voileCA');if(v){v.style.opacity='0';setTimeout(()=>v.remove(),800);}},700);

return {sol,solFin,decor,bloque,graver,depart:DEPART,figurants,acteurs};
})()
