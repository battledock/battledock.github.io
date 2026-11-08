/* =====================================================================
   LA PLAGE DES CATALANS — un lieu à part entière (plage.html).
   Même logique de vue : au fond, l'horizon, le Frioul et le château d'If ;
   la mer, puis le sable, posés au sol ; en bas la promenade et la rue des
   Catalans, où passe le tram. Chargé par moteur.js (eval direct).
   ===================================================================== */
(()=>{
const W=1600, H=800;
const DEPART=[740,716];
const hA=(x,y,k)=>{let n=((x*73856093)^(y*19349663)^(k*83492791))|0;n=(n^(n>>>13))*1274126177|0;return((n^(n>>>16))>>>0)/4294967296;};
const lin=(g,x0,y0,x1,y1,st)=>{const gr=g.createLinearGradient(x0,y0,x1,y1);st.forEach(([o,c])=>gr.addColorStop(o,c));return gr;};
const R=(g,x,y,w,h,c)=>{g.fillStyle=c;g.fillRect(x,y,w,h);};
function toile(L,HH){const D=2,c=document.createElement('canvas');c.width=Math.ceil(L*D);c.height=Math.ceil(HH*D);const g=c.getContext('2d');g.setTransform(D,0,0,D,0,0);return {c,g};}
function fe(g,cx,cy,rx,ry,pal,n,seed,t){t=t||1;for(let i=0;i<n;i++){const a=hA(i,seed,1)*Math.PI*2,r=Math.sqrt(hA(i,seed,2));const x=cx+Math.cos(a)*rx*r,y=cy+Math.sin(a)*ry*r;
  const lum=((cx-x)/rx+(cy-y)/ry)*.5+hA(i,seed,3)*.4;g.fillStyle=lum>.55?pal[3]:lum>.15?pal[2]:lum>-.3?pal[1]:pal[0];
  g.beginPath();g.ellipse(x,y,(1.2+hA(i,seed,4)*1.6)*t,(.9+hA(i,seed,5)*1)*t,hA(i,seed,6)*3,0,7);g.fill();}}
function ombreSol(g,cx,cy,rx,ry,a){g.fillStyle='rgba(40,34,26,'+(a||.18)+')';g.beginPath();g.ellipse(cx+4,cy+3,rx,ry,0,0,7);g.fill();}
const txt=(g,s,x,y,px,c,al,f)=>{g.fillStyle=c;g.font=(f||'bold')+' '+px+'px "Helvetica Neue",Arial,sans-serif';g.textAlign=al||'center';g.textBaseline='middle';g.fillText(s,x,y);};

/* ---------- LE FOND : le ciel, le Frioul, le château d'If, la mer ---------- */
const HORIZ=150, RIVAGE=404, PROM=636, RUE=H-74;
function ciel(g){
  g.fillStyle=lin(g,0,0,0,HORIZ,[[0,'#4a9edc'],[.6,'#8cc6ec'],[1,'#d8eef6']]);g.fillRect(0,0,W,HORIZ);
  for(let k=0;k<6;k++){const cx=hA(k,5,1)*W,cy=20+hA(k,5,2)*60,l=90+hA(k,5,3)*140;
    for(let j=0;j<9;j++){g.fillStyle='rgba(255,255,255,'+(.18+hA(k,j,4)*.22)+')';g.beginPath();g.ellipse(cx+(j-4)*l/9,cy+hA(k,j,5)*6-3,l/6,4+hA(k,j,6)*4,0,0,7);g.fill();}}
  /* les îles du Frioul, longues et pâles, et Ratonneau devant */
  const ile=(x0,x1,h,c,seed)=>{g.fillStyle=c;g.beginPath();g.moveTo(x0,HORIZ);
    for(let x=x0;x<=x1;x+=8){const u=(x-x0)/(x1-x0);g.lineTo(x,HORIZ-h*Math.sin(u*Math.PI)**.6-hA(x,seed,1)*3-Math.sin(x/40+seed)*h*.12);}g.lineTo(x1,HORIZ);g.fill();};
  ile(820,1560,40,'#a8b8c4',1);ile(980,1380,30,'#98aab8',2);
  g.fillStyle='rgba(255,255,255,.18)';for(let x=840;x<1540;x+=14)R(g,x,HORIZ-6-hA(x,3,1)*14,1,4,'rgba(240,236,224,.5)');
  /* le château d'If, sur son rocher */
  const cx=560;g.fillStyle='#b4b8b0';g.beginPath();g.moveTo(cx-70,HORIZ);g.quadraticCurveTo(cx-40,HORIZ-22,cx,HORIZ-24);g.quadraticCurveTo(cx+44,HORIZ-22,cx+72,HORIZ);g.fill();
  R(g,cx-40,HORIZ-44,80,22,'#d8d0bc');R(g,cx-40,HORIZ-44,80,2,'#efe8d6');for(let x=cx-40;x<cx+40;x+=8)R(g,x,HORIZ-48,5,4,'#d8d0bc');
  R(g,cx-8,HORIZ-60,22,18,'#cfc6b0');for(let x=cx-8;x<cx+14;x+=6)R(g,x,HORIZ-63,4,3,'#cfc6b0');
  for(const tx of [cx-34,cx+30]){R(g,tx-6,HORIZ-54,12,32,'#cbc2aa');R(g,tx-7,HORIZ-56,14,3,'#dcd4c0');}
  R(g,cx+1,HORIZ-72,1,12,'#6a6e74');R(g,cx+2,HORIZ-72,7,4,'#2f6ad0');R(g,cx+2,HORIZ-68,7,.01,'#fff');
  R(g,cx-30,HORIZ-36,60,1,'rgba(0,0,0,.15)');for(let x=cx-28;x<cx+28;x+=10)R(g,x,HORIZ-34,2,4,'#7a7464');}
function mer(g){
  g.fillStyle=lin(g,0,HORIZ,0,RIVAGE,[[0,'#1f5f94'],[.35,'#2a7eb0'],[.75,'#2fa8bc'],[.92,'#5ccbc4'],[1,'#9ae2d4']]);g.fillRect(0,HORIZ,W,RIVAGE-HORIZ);
  /* le fond clair près du bord : sable sous l'eau */
  g.fillStyle=lin(g,0,RIVAGE-70,0,RIVAGE,[[0,'rgba(240,220,170,0)'],[1,'rgba(240,220,170,.35)']]);g.fillRect(0,RIVAGE-70,W,70);
  /* les rides et les reflets, plus serrés au loin */
  for(let i=0;i<1800;i++){const u=hA(i,91,1),y=HORIZ+2+u*u*(RIVAGE-HORIZ-6),x=hA(i,92,1)*W,l=(3+u*18)*(.6+hA(i,93,1));
    g.fillStyle=hA(i,94,1)>.45?'rgba(255,255,255,'+(.12+u*.2)+')':'rgba(10,50,90,'+(.12+u*.1)+')';g.fillRect(x,y,l,.6+u*1.2);}
  /* le scintillement du soleil, en colonne */
  for(let i=0;i<220;i++){const y=HORIZ+2+hA(i,95,1)*(RIVAGE-HORIZ-40),x=1180+(hA(i,96,1)-.5)*(40+(y-HORIZ)*.9);g.fillStyle='rgba(255,250,220,'+(.35+hA(i,97,1)*.4)+')';g.fillRect(x,y,2+hA(i,98,1)*5,1);}
  R(g,0,HORIZ,W,1,'rgba(255,255,255,.4)');
  /* les rochers des deux digues, qui ferment la plage */
  const roc=(x0,x1,y0,y1,seed)=>{for(let i=0;i<120;i++){const x=x0+hA(i,seed,1)*(x1-x0),y=y0+hA(i,seed,2)*(y1-y0),r=6+hA(i,seed,3)*14;
    g.fillStyle='rgba(20,40,50,.25)';g.beginPath();g.ellipse(x+2,y+3,r,r*.55,0,0,7);g.fill();
    g.fillStyle=['#8a8478','#a49c8c','#bab2a0','#9a9282'][i%4];g.beginPath();g.ellipse(x,y,r,r*.6,hA(i,seed,4),0,7);g.fill();
    g.fillStyle='rgba(255,255,255,.22)';g.beginPath();g.ellipse(x-r*.3,y-r*.25,r*.45,r*.22,0,0,7);g.fill();}};
  roc(0,120,250,RIVAGE+30,7);roc(1480,1600,230,RIVAGE+30,8);
  /* la ligne des bouées jaunes, tendue, qui ferme la zone de baignade */
  g.strokeStyle='rgba(255,255,255,.35)';g.lineWidth=.8;g.beginPath();g.moveTo(130,300);g.lineTo(1470,300);g.stroke();}
function sable(g){
  g.fillStyle=lin(g,0,RIVAGE,0,PROM,[[0,'#c8ae84'],[.06,'#dcc49a'],[.12,'#ead6ac'],[1,'#f2e2bc']]);g.fillRect(0,RIVAGE,W,PROM-RIVAGE);
  /* le sable mouillé qui brille */
  g.fillStyle='rgba(255,255,255,.18)';g.fillRect(0,RIVAGE+2,W,3);
  for(let i=0;i<9000;i++){const x=hA(i,101,1)*W,y=RIVAGE+hA(i,102,1)*(PROM-RIVAGE);R(g,x,y,1,1,hA(i,103,1)>.5?'rgba(255,250,236,.4)':'rgba(150,120,80,.25)');}
  /* les rides laissées par le vent */
  for(let k=0;k<60;k++){const x=hA(k,104,1)*W,y=RIVAGE+30+hA(k,105,1)*(PROM-RIVAGE-50);g.strokeStyle='rgba(170,140,96,.25)';g.lineWidth=1;g.beginPath();g.moveTo(x,y);g.quadraticCurveTo(x+14,y-3,x+30,y);g.stroke();}
  /* des traces de pas qui descendent à l'eau */
  for(const [x0,y0,x1] of [[420,PROM-10,470],[1150,PROM-10,1100],[820,PROM-10,800]]){for(let k=0;k<16;k++){const t=k/15,x=x0+(x1-x0)*t+(k%2?3:-3),y=y0-(y0-RIVAGE-12)*t;g.fillStyle='rgba(150,118,80,.35)';g.beginPath();g.ellipse(x,y,1.6,2.4,0,0,7);g.fill();}}
  /* coquillages, un seau, une pelle */
  for(let i=0;i<50;i++){const x=hA(i,111,1)*W,y=RIVAGE+8+hA(i,112,1)*60;g.fillStyle=['#fff6ea','#f0d8c8','#e8e0d0'][i%3];g.beginPath();g.ellipse(x,y,1.4,1,0,0,7);g.fill();}
  R(g,640,RIVAGE+40,8,7,'#e04a3a');R(g,639,RIVAGE+39,10,1.4,'#f87060');R(g,652,RIVAGE+44,8,2,'#2f9ae0');
  /* l'ombre de la promenade sur le haut de la plage */
  g.fillStyle=lin(g,0,PROM-14,0,PROM,[[0,'rgba(80,60,30,0)'],[1,'rgba(80,60,30,.22)']]);g.fillRect(0,PROM-14,W,14);}
const ESCS=[[380,120],[1180,120]];                /* les deux escaliers qui descendent sur le sable */
function promenade(g){
  R(g,0,PROM,W,RUE-PROM,'#e2dccf');
  for(let x=0;x<W;x+=48)R(g,x,PROM,1,RUE-PROM,'rgba(140,130,110,.25)');for(let y=PROM+24;y<RUE;y+=24)R(g,0,y,W,1,'rgba(140,130,110,.2)');
  for(let i=0;i<4000;i++){R(g,hA(i,121,1)*W,PROM+hA(i,122,1)*(RUE-PROM),1,1,'rgba(120,110,90,.15)');}
  /* le muret et le garde-corps au bord, sauf aux escaliers */
  R(g,0,PROM,W,8,'#cfc6b2');R(g,0,PROM,W,1.4,'#f4eee0');R(g,0,PROM+8,W,1.4,'rgba(0,0,0,.2)');
  for(const [x,w] of ESCS){R(g,x-w/2,PROM-2,w,12,'#e8e0cc');for(let k=0;k<4;k++)R(g,x-w/2,PROM-2+k*3,w,1,'rgba(120,100,70,.35)');}
  /* la rue des Catalans et ses rails */
  R(g,0,RUE,W,10,'#c8c2b6');R(g,0,RUE,W,1.4,'#f2eee6');R(g,0,RUE+10,W,3,'#8a8680');
  g.fillStyle=lin(g,0,RUE+13,0,H,[[0,'#4e5258'],[1,'#5a5e64']]);g.fillRect(0,RUE+13,W,H-RUE-13);
  for(let i=0;i<900;i++){const x=hA(i,1,7)*W,y=RUE+14+hA(i,2,7)*(H-RUE-14);R(g,x,y,1,1,hA(i,3,7)>.5?'rgba(255,255,255,.07)':'rgba(0,0,0,.1)');}
  for(let x=10;x<W;x+=60)R(g,x,RUE+30,30,2.4,'rgba(250,250,240,.75)');
  for(const ry of [H-22,H-8]){R(g,0,ry,W,2.4,'#a8acb0');R(g,0,ry,W,.8,'#e0e4e8');R(g,0,ry+2.4,W,.8,'rgba(0,0,0,.35)');}}
/* le garde-corps : un objet à part, pour qu'il passe devant le joueur qui est sur le sable */
function graverGardeCorps(v){return memo('gc'+v,()=>{const L=v,Hd=26,sol=22;const {c,g}=toile(L,Hd);
  R(g,0,sol-17,L,2.4,'#f2f4f6');R(g,0,sol-17,L,.8,'#ffffff');R(g,0,sol-8,L,1,'#c8ccd0');
  for(let x=2;x<L;x+=16){R(g,x,sol-17,2,17,'#d8dce0');R(g,x,sol-17,.7,17,'#ffffff');}
  return {toile:c,W:L,H:Hd,sol};});}
function peindreSol(g){ciel(g);mer(g);sable(g);promenade(g);}
function sol(){const c=document.createElement('canvas');c.width=W;c.height=H;peindreSol(c.getContext('2d'));return c;}
function solFin(){const c=document.createElement('canvas');c.width=W*2;c.height=H*2;const g=c.getContext('2d');g.setTransform(2,0,0,2,0,0);peindreSol(g);return c;}

/* ---------- LES SPRITES DE LA PLAGE ---------- */
const T={};
const memo=(k,f)=>T[k]||(T[k]=f());
const RAYURES=[['#e04a3a','#ffffff'],['#2f86d0','#ffffff'],['#f2b632','#ffffff'],['#2a9a7a','#f4ecd8'],['#1c4f9c','#f2c43a']];
/* le parasol planté, rayé, sa toile qui donne de l'ombre */
function graverParasol(v){return memo('pa'+v,()=>{const Wd=90,Hd=90,sol=84,x=45;const {c,g}=toile(Wd,Hd);const [c0,c1]=RAYURES[v%RAYURES.length];
  g.fillStyle='rgba(120,90,50,.28)';g.beginPath();g.ellipse(x+10,sol-2,36,11,0,0,7);g.fill();
  R(g,x-1,sol-60,2.2,60,'#e8e4dc');R(g,x-1,sol-60,.8,60,'#ffffff');
  for(let k=0;k<8;k++){const a0=Math.PI+k*Math.PI/8,a1=a0+Math.PI/8;g.fillStyle=k%2?c1:c0;g.beginPath();g.moveTo(x,sol-74);
    g.lineTo(x+Math.cos(a0)*40,sol-58+Math.sin(a0)*-0);g.quadraticCurveTo(x+Math.cos((a0+a1)/2)*44,sol-55,x+Math.cos(a1)*40,sol-58);g.closePath();g.fill();}
  g.fillStyle='rgba(0,0,0,.12)';g.beginPath();g.moveTo(x,sol-74);g.lineTo(x+40,sol-58);g.lineTo(x+4,sol-58);g.fill();
  for(let k=0;k<=8;k++){const a=Math.PI+k*Math.PI/8;g.fillStyle=k%2?c0:c1;g.beginPath();g.arc(x+Math.cos(a)*40,sol-57.5,2.4,0,Math.PI);g.fill();}
  R(g,x-1.5,sol-77,3,4,'#ffffff');
  return {toile:c,W:Wd,H:Hd,sol};});}
/* la serviette étendue, et ce qu'on a laissé dessus */
function graverServiette(v){return memo('sv'+v,()=>{const Wd=60,Hd=34,sol=30;const {c,g}=toile(Wd,Hd);const [c0,c1]=RAYURES[(v+2)%RAYURES.length];
  g.save();g.translate(30,sol-12);g.rotate((hA(v,1,1)-.5)*.3);
  R(g,-22,-10,44,20,c1);for(let k=0;k<5;k++)R(g,-22+k*9,-10,4.5,20,c0);R(g,-22,-10,44,1,'rgba(255,255,255,.5)');R(g,-22,9,44,1,'rgba(0,0,0,.15)');
  if(v%3===0){R(g,-16,-6,8,10,'#f4f0e4');R(g,-15,-5,6,8,'#3a4a8a');}           /* un livre */
  if(v%3===1){g.fillStyle='#1a1c20';g.beginPath();g.ellipse(-8,-2,3,2,0,0,7);g.ellipse(-1,-2,3,2,0,0,7);g.fill();R(g,-6,-2.4,4,.8,'#1a1c20');}   /* des lunettes */
  R(g,10,-8,6,14,'#2f9ae0');R(g,11,-10,4,3,'#ffffff');                            /* une bouteille d'eau */
  g.restore();
  if(v%2===0){g.fillStyle='#c8382a';g.beginPath();g.roundRect(44,sol-14,12,10,3);g.fill();R(g,46,sol-16,8,2,'#a02a20');}   /* un sac */
  return {toile:c,W:Wd,H:Hd,sol};});}
/* le filet de beach-volley, ses deux poteaux, ses lignes au sol */
function graverFilet(){return memo('fi',()=>{const Wd=220,Hd=70,sol=64;const {c,g}=toile(Wd,Hd);
  g.fillStyle='rgba(120,90,50,.18)';g.fillRect(14,sol-1,Wd-28,4);
  for(const x of [14,Wd-14]){R(g,x-2,sol-56,4,56,'#e8e4dc');R(g,x-2,sol-56,1.4,56,'#ffffff');R(g,x-3,sol-58,6,3,'#c8382a');}
  R(g,14,sol-50,Wd-28,2,'#ffffff');R(g,14,sol-34,Wd-28,1.4,'#ffffff');
  g.strokeStyle='rgba(30,30,34,.55)';g.lineWidth=.6;for(let x=16;x<Wd-14;x+=4){g.beginPath();g.moveTo(x,sol-48);g.lineTo(x,sol-34);g.stroke();}
  for(let y=sol-46;y<sol-34;y+=4){g.beginPath();g.moveTo(14,y);g.lineTo(Wd-14,y);g.stroke();}
  for(const x of [14,Wd-14])for(const s of [-1,1]){g.strokeStyle='rgba(255,255,255,.6)';g.lineWidth=.6;g.beginPath();g.moveTo(x,sol-56);g.lineTo(x+s*8,sol);g.stroke();}
  return {toile:c,W:Wd,H:Hd,sol};});}
/* le terrain de volley, tracé au sol par des sangles bleues */
function graverTerrain(){return memo('te',()=>{const Wd=240,Hd=150,sol=75;const {c,g}=toile(Wd,Hd);
  g.strokeStyle='#2f86d0';g.lineWidth=2.4;g.strokeRect(6,6,Wd-12,Hd-12);g.strokeStyle='rgba(255,255,255,.4)';g.lineWidth=.8;g.strokeRect(6,5,Wd-12,Hd-12);
  return {toile:c,W:Wd,H:Hd,sol};});}
/* le poste de secours, sur pilotis, drapeau vert : baignade surveillée */
function graverPoste(){return memo('po',()=>{const Wd=100,Hd=140,sol=134,x=50;const {c,g}=toile(Wd,Hd);
  g.fillStyle='rgba(120,90,50,.25)';g.beginPath();g.ellipse(x+12,sol-2,44,9,0,0,7);g.fill();
  for(const px of [x-28,x+24])R(g,px,sol-46,4,46,'#d8d0c0');g.strokeStyle='#c8c0ae';g.lineWidth=2;g.beginPath();g.moveTo(x-26,sol-4);g.lineTo(x+26,sol-44);g.moveTo(x+26,sol-4);g.lineTo(x-26,sol-44);g.stroke();
  for(let k=0;k<7;k++)R(g,x+30,sol-6-k*6,12,1.6,'#a89c88');R(g,x+30,sol-46,1.4,46,'#a89c88');R(g,x+41,sol-46,1.4,46,'#a89c88');
  g.fillStyle=lin(g,x-36,0,x+36,0,[[0,'#e8eef4'],[.5,'#ffffff'],[1,'#d4dce4']]);g.fillRect(x-36,sol-86,72,40);
  R(g,x-36,sol-52,72,6,'#2f86d0');R(g,x-28,sol-80,56,18,'#2a3a4c');g.fillStyle=lin(g,0,sol-78,0,sol-64,[[0,'#8ab4d0'],[1,'#d4e6f0']]);g.fillRect(x-26,sol-78,52,14);
  R(g,x-40,sol-90,80,5,'#c8382a');R(g,x-40,sol-90,80,1.4,'#ff7060');txt(g,'SECOURS',x,sol-57,6.4,'#ffffff','center','900');
  R(g,x+30,sol-126,1.6,38,'#6a6e74');g.fillStyle='#2ab45a';g.beginPath();g.moveTo(x+31.6,sol-126);g.lineTo(x+48,sol-121);g.lineTo(x+31.6,sol-115);g.fill();
  return {toile:c,W:Wd,H:Hd,sol};});}
/* la douche de plage, inox */
function graverDouche(){return memo('do',()=>{const Wd=30,Hd=80,sol=74,x=15;const {c,g}=toile(Wd,Hd);
  g.fillStyle='rgba(60,60,60,.25)';g.beginPath();g.ellipse(x+3,sol,10,3,0,0,7);g.fill();R(g,x-8,sol-2,16,3,'#9aa0a6');
  R(g,x-1.6,sol-64,3.2,62,'#c8ccd2');R(g,x-1.6,sol-64,1,62,'#ffffff');R(g,x-1.6,sol-64,10,2.4,'#c8ccd2');g.fillStyle='#9aa0a6';g.beginPath();g.ellipse(x+8,sol-61,3.4,1.6,0,0,7);g.fill();
  R(g,x+2,sol-36,5,4,'#2f86d0');return {toile:c,W:Wd,H:Hd,sol};});}
/* le kiosque à glaces, sur la promenade */
function graverGlacier(){return memo('gl',()=>{const Wd=120,Hd=110,sol=104,x=14,w=92;const {c,g}=toile(Wd,Hd);
  ombreSol(g,Wd/2,sol-2,52,8,.24);
  g.fillStyle=lin(g,x,0,x+w,0,[[0,'#f6e8d0'],[.5,'#fff8ec'],[1,'#e8d6b8']]);g.fillRect(x,sol-62,w,62);
  for(let k=0;k<6;k++)R(g,x+k*w/6,sol-20,w/12,20,'#f0a8b8');R(g,x,sol-22,w,2,'#ffffff');
  R(g,x+10,sol-54,w-20,28,'#3a2e24');g.fillStyle=lin(g,0,sol-52,0,sol-28,[[0,'#d8f0f8'],[1,'#a8d4e4']]);g.fillRect(x+12,sol-52,w-24,24);
  for(let k=0;k<6;k++){g.fillStyle=['#f4c4d0','#fff2c8','#c8e8c0','#8a5a3a','#f4f0e8','#c8a0e0'][k];g.beginPath();g.ellipse(x+20+k*11,sol-34,4.4,3,0,0,7);g.fill();}
  for(let k=0;k<7;k++){g.fillStyle=k%2?'#ffffff':'#f07090';g.beginPath();g.moveTo(x-4+k*14,sol-62);g.lineTo(x+10+k*14,sol-62);g.lineTo(x+12+k*14,sol-74);g.lineTo(x-2+k*14,sol-74);g.fill();}
  /* le cornet géant sur le toit */
  g.fillStyle='#d8a058';g.beginPath();g.moveTo(x+w/2-8,sol-80);g.lineTo(x+w/2+8,sol-80);g.lineTo(x+w/2,sol-62);g.fill();
  g.fillStyle='#f4c4d0';g.beginPath();g.arc(x+w/2,sol-84,9,0,7);g.fill();g.fillStyle='#fff2c8';g.beginPath();g.arc(x+w/2-2,sol-92,7,0,7);g.fill();
  txt(g,'GLACES',x+w/2,sol-11,8,'#ffffff','center','900');
  return {toile:c,W:Wd,H:Hd,sol};});}
/* le ponton flottant de la baignade */
function graverPonton(){return memo('pt',()=>{const Wd=110,Hd=40,sol=30;const {c,g}=toile(Wd,Hd);
  g.fillStyle='rgba(10,40,70,.3)';g.fillRect(8,sol-6,96,10);R(g,6,sol-16,98,14,'#c8b088');for(let x=6;x<104;x+=7)R(g,x,sol-16,.8,14,'rgba(90,60,30,.4)');
  R(g,6,sol-16,98,1.4,'#e8d4b0');R(g,6,sol-3,98,3,'#f2f4f6');R(g,80,sol-30,1.6,15,'#c8ccd2');R(g,92,sol-30,1.6,15,'#c8ccd2');for(let k=0;k<3;k++)R(g,80,sol-28+k*5,13,1,'#c8ccd2');
  return {toile:c,W:Wd,H:Hd,sol};});}
/* un grand pin parasol, sur la promenade */
function graverPin(v){return memo('pi'+v,()=>{const Wd=160,Hd=170,sol=162,x=80;const {c,g}=toile(Wd,Hd);
  ombreSol(g,x+16,sol-2,56,12,.2);
  g.strokeStyle='#7a5a42';g.lineWidth=6;g.beginPath();g.moveTo(x,sol);g.bezierCurveTo(x-6,sol-40,x+16,sol-70,x+6,sol-110);g.stroke();
  g.strokeStyle='#9a7a5a';g.lineWidth=2;g.beginPath();g.moveTo(x-1,sol);g.bezierCurveTo(x-7,sol-40,x+15,sol-70,x+5,sol-110);g.stroke();
  for(const [dx,dy,rx] of [[-30,-120,42],[26,-124,44],[0,-136,50]])fe(g,x+dx,sol+dy,rx,16,['#1e3a22','#2e5430','#4a7438','#6e9a50'],520,v*7+dx,2.2);
  return {toile:c,W:Wd,H:Hd,sol};});}
/* le grand lampadaire du parvis */
function graverLampe(){return memo('lp',()=>{const Wd=40,Hd=130,sol=124,x=20;const {c,g}=toile(Wd,Hd);
  g.fillStyle='rgba(40,34,26,.2)';g.beginPath();g.ellipse(x+12,sol,16,3,0,0,7);g.fill();
  R(g,x-4,sol-6,8,6,'#5a6066');R(g,x-1.6,sol-112,3.2,108,'#6a7076');R(g,x-1.6,sol-112,1,108,'#b0b8c0');
  R(g,x-14,sol-118,28,6,'#4a5056');R(g,x-12,sol-112,24,2,'#fdf6d8');
  return {toile:c,W:Wd,H:Hd,sol};});}
/* le poteau d'arrêt du tram : totem bleu, plan de ligne */
function graverArret(){return memo('ar',()=>{const Wd=40,Hd=96,sol=90,x=20;const {c,g}=toile(Wd,Hd);
  g.fillStyle='rgba(40,34,26,.22)';g.beginPath();g.ellipse(x+8,sol,12,2.6,0,0,7);g.fill();
  R(g,x-2,sol-60,4,60,'#5a6066');R(g,x-9,sol-86,18,30,'#1c4f9c');R(g,x-9,sol-86,18,1.4,'#5a8ad8');
  txt(g,'T',x,sol-78,10,'#ffffff','center','900');R(g,x-7,sol-70,14,10,'#ffffff');txt(g,'Catalans',x,sol-65,3.2,'#1c4f9c','center','bold');
  R(g,x-6,sol-50,12,16,'#f4f6f8');for(let i=0;i<4;i++)R(g,x-4,sol-47+i*3.4,8,.8,'#8a96a2');
  return {toile:c,W:Wd,H:Hd,sol};});}
/* le banc de béton, assise en bois */
function graverBanc(){return memo('bc',()=>{const Wd=84,Hd=26,sol=22;const {c,g}=toile(Wd,Hd);
  g.fillStyle='rgba(40,34,26,.2)';g.fillRect(8,sol-1,72,4);
  R(g,4,sol-10,76,10,'#cfcac0');R(g,4,sol-10,76,1.4,'#f0ece4');
  R(g,6,sol-14,72,5,'#b8875a');R(g,6,sol-14,72,1.4,'#dcae7c');for(let x=6;x<78;x+=9)R(g,x,sol-14,.5,5,'rgba(80,50,20,.3)');
  return {toile:c,W:Wd,H:Hd,sol};});}


/* ---------- LE TRAM DU BOULEVARD : il arrive, s'arrête devant le poteau, repart ---------- */
function graverRame(){if(T.rame)return T.rame;
const L=250,HH=56,{c,g}=toile(L,HH),RR=(x,y,w,h,col)=>R(g,x,y,w,h,col),s=HH-4;
g.fillStyle='rgba(20,20,26,.28)';g.fillRect(4,s-2,L-8,5);
/* la caisse */
RR(6,s-40,L-12,36,'#f3f4f2');
RR(6,s-40,L-12,2,'#ffffff');RR(6,s-6,L-12,2,'#9aa0a6');
/* le bandeau vitré */
RR(10,s-34,L-20,14,'#2e4660');
for(let x=14;x<L-14;x+=18){RR(x,s-34,1,14,'#c9d2da');RR(x+2,s-32,4,4,'rgba(200,230,255,.35)');}
/* la ligne bleue */
RR(6,s-18,L-12,4,'#1e88c8');RR(6,s-14,L-12,1,'#13608e');
/* les portes */
for(const x of [44,112,180]){RR(x,s-34,14,28,'#c9cfd4');RR(x+6,s-34,2,28,'#7a828a');RR(x+1,s-32,5,10,'#3e5672');RR(x+8,s-32,5,10,'#3e5672');}
/* les deux nez arrondis */
for(const [x,d] of [[2,1],[L-10,-1]]){
  g.fillStyle='#f3f4f2';g.beginPath();g.ellipse(x+4,s-22,8,18,0,0,7);g.fill();
  g.fillStyle='#22364c';g.beginPath();g.ellipse(x+4+d*-1,s-28,5,9,0,0,7);g.fill();
  RR(x+2,s-12,4,2,'#ffe6a0');}
/* bogies et pantographe */
for(const x of [30,L/2-10,L-50]){RR(x,s-4,20,4,'#2e3036');RR(x+3,s-1,5,2,'#55585e');RR(x+12,s-1,5,2,'#55585e');}
RR(L/2-14,s-44,28,4,'#b0b6bc');g.strokeStyle='#4c5056';g.lineWidth=1.5;g.beginPath();
g.moveTo(L/2-8,s-44);g.lineTo(L/2,s-54);g.lineTo(L/2+8,s-44);g.stroke();RR(L/2-6,s-55,12,2,'#4c5056');
return T.rame={c,L,HH,s};
}
const VOIE=H-12, ARRET_X=800, PER=52;
function posRame(){const t=(Date.now()/1000+13)%PER;const x0=-300,x2=W+300,xa=ARRET_X;
  if(t<8){const k=t/8;return x0+(xa-x0)*(1-Math.pow(1-k,3));}if(t<16)return xa;if(t<24){const k=(t-16)/8;return xa+(x2-xa)*k*k*k;}return null;}
ANIM_DECOR.plg_tram=(g,o,x,y)=>{const wx=posRame();if(wx===null)return;const Rm=graverRame();
  const sx=Math.round(x+(wx-o.x)-Rm.L/2),sy=Math.round(y-Rm.s);g.drawImage(Rm.c,sx,sy,Rm.L,Rm.HH);
  let k=0;try{k=nuitDecor();}catch(e){}
  if(k>.02){if(!Rm.n)Rm.n=versionNuit({toile:Rm.c});g.globalAlpha=k;g.drawImage(Rm.n,sx,sy,Rm.L,Rm.HH);g.globalAlpha=1;
    if(typeof lueurNuit==='function')for(let i=-2;i<=2;i++)lueurNuit(g,sx+Rm.L/2+i*45,sy+Rm.s-26,34,'rgba(255,240,210,1)');}};
const dansRame=(x,y)=>{const wx=posRame();return wx!==null&&Math.abs(x-wx)<123&&y>VOIE-16&&y<VOIE+4;};
/* ---------- LE DÉCOR ---------- */
function decor(){const D=[];const P=(t,x,y,o)=>D.push(Object.assign({t,x,y,gr:0},o||{}));
  /* LA MER : la vague qui va et vient, les bouées, le ponton, des nageurs, des voiliers au large */
  for(let x=50;x<W;x+=100)P('x_jol_plg_vide_sol',x,RIVAGE,{anim:'plg_vague'});
  for(let x=160;x<=1440;x+=110)P('x_jol_plg_vide_sol',x,300,{anim:'plg_bouee'});
  P('x_jol_plg_ponton_sol',820,262,{});
  for(const [x,y] of [[520,352],[700,334],[980,318],[1110,366],[300,372]])P('x_jol_plg_vide_sol',x,y,{anim:'plg_nageur'});
  P('x_jol_plg_vide_sol',300,196,{anim:'plg_voilier',vit:7,dec:0});P('x_jol_plg_vide_sol',900,176,{anim:'plg_voilier',vit:4,dec:900,v:1});
  /* LE SABLE : parasols, serviettes, le poste de secours, le volley, les douches */
  P('x_jol_plg_poste_sol',230,476,{col:[70,10],parler:['Baignade surveillée, drapeau vert.','L’eau est bonne ! Restez entre les bouées jaunes.']});
  P('x_jol_plg_terrain_sol',1340,520,{});P('x_jol_plg_filet_sol',1340,522,{col:[200,6]});
  let i=0;for(const [x,y] of [[480,486],[600,560],[740,470],[880,548],[1010,480],[520,616],[760,600],[1100,600],[360,560],[960,612]]){
    P('x_jol_plg_parasol_sol',x,y,{col:[6,4],v:i});P('x_jol_plg_serviette_sol',x+26+(i%2)*8,y+12,{v:i});i++;}
  for(const x of [ESCS[0][0]-84,ESCS[1][0]+84])P('x_jol_plg_douche_sol',x,PROM-12,{col:[10,5]});
  /* LE GARDE-CORPS, entre les escaliers */
  {let x0=0;for(const [x,w] of ESCS){P('x_jol_plg_gc_sol',(x0+x-w/2)/2,PROM+10,{v:Math.round(x-w/2-x0)});x0=x+w/2;}P('x_jol_plg_gc_sol',(x0+W)/2,PROM+10,{v:Math.round(W-x0)});}
  /* LA PROMENADE : le glacier, les pins, les bancs face à la mer, les lampadaires */
  P('x_jol_plg_vide_sol',560,706,{col:[96,14],anim:'plg_lum',spr:'x_jol_plg_glacier_sol',lum:[[0,-40,50,'rgba(255,200,220,1)']],parler:['Glaces artisanales ! Pistache, citron, navette…','La navette, c’est la spécialité de Marseille, fils.']});
  for(const [x,v] of [[60,0],[1540,2]])P('x_jol_plg_pin_sol',x,716,{col:[10,6],v});
  for(const x of [900,1300])P('x_jol_plg_banc_sol',x,664,{col:[76,8]});
  for(const x of [330,700,1130,1400])P('x_jol_plg_vide_sol',x,722,{col:[8,6],anim:'plg_lum',spr:'x_jol_plg_lampe_sol',lum:[[0,-112,40,'rgba(255,230,170,1)'],[0,-10,56,'rgba(255,220,160,1)']]});
  /* l'arrêt de tram et le tram de la rue des Catalans */
  P('x_jol_plg_tramv_sol',800,VOIE,{anim:'plg_tram'});
  P('x_jol_plg_arret_sol',ARRET_X,RUE+4,{col:[30,6],agir:rentrer,libelle:'Rentrer en tram',nom:'TRAM'});
  /* LA NUIT : la lune sur l'eau */
  P('x_jol_plg_vide_sol',1180,HORIZ-80,{anim:'plg_lune'});
  for(let y=HORIZ+20;y<RIVAGE;y+=34)P('x_jol_plg_vide_sol',1180,y,{anim:'plg_lum',lum:[[0,0,26+(y-HORIZ)*.12,'rgba(200,215,255,1)']]});
  return D;}
const SPR={};
ANIM_DECOR.plg_lum=(g,o,x,y)=>{
  if(o.spr){const t=SPR[o.spr]||(SPR[o.spr]=graver(o.spr,o.v||0)),X0=Math.round(x-t.W/2),Y1=Math.round(y-t.sol);g.drawImage(t.toile,X0,Y1,t.W,t.H);
    let k=0;try{k=nuitDecor();}catch(e){}if(k>.02){g.globalAlpha=k;g.drawImage(versionNuit(t),X0,Y1,t.W,t.H);g.globalAlpha=1;}}
  if(o.lum&&typeof lueurNuit==='function')for(const [dx,dy,r,c] of o.lum)lueurNuit(g,x+dx,y+dy,r,c);};
/* LA VAGUE : une nappe d'eau qui monte sur le sable et redescend, son liseré d'écume */
ANIM_DECOR.plg_vague=(g,o,x,y)=>{const t=performance.now()/1000;
  for(let i=-52;i<52;i+=2){const wx=o.x+i;const a=Math.sin(t*.7+wx/260)*.5+Math.sin(t*.45-wx/140)*.5;const d=4+a*7+Math.sin(wx/23+t)*1.2;
    g.fillStyle='rgba(150,225,215,.55)';g.fillRect(x+i,y-6,2,6+d);g.fillStyle='rgba(255,255,255,'+(.7+a*.2)+')';g.fillRect(x+i,y+d-1,2,1.6);
    if(hA(wx,1,1)>.6){g.fillStyle='rgba(255,255,255,.5)';g.fillRect(x+i,y+d-3,1.4,1);}
    g.fillStyle='rgba(120,90,50,.12)';g.fillRect(x+i,y+d+.6,2,2.4+(1-a)*2);}};
ANIM_DECOR.plg_bouee=(g,o,x,y)=>{const t=performance.now()/1000,b=Math.sin(t*1.6+o.x/60)*1;
  g.fillStyle='rgba(10,40,70,.25)';g.beginPath();g.ellipse(x,y+2,5,1.6,0,0,7);g.fill();
  g.fillStyle='#f2c232';g.beginPath();g.arc(x,y-2+b,3.6,0,7);g.fill();g.fillStyle='#fff6c0';g.beginPath();g.arc(x-1,y-3+b,1.2,0,7);g.fill();
  g.strokeStyle='rgba(255,255,255,.5)';g.lineWidth=.6;g.beginPath();g.ellipse(x,y+1,6+b,1.4,0,0,7);g.stroke();};
ANIM_DECOR.plg_nageur=(g,o,x,y)=>{const t=performance.now()/1000+o.x,dx=Math.sin(t*.3)*10,b=Math.sin(t*2)*.6,br=Math.sin(t*3);
  const X=x+dx;g.strokeStyle='rgba(255,255,255,.55)';g.lineWidth=.8;g.beginPath();g.ellipse(X,y,7,2,0,0,7);g.stroke();
  g.fillStyle=['#e0b088','#8a5a3a','#f0c8a0','#c08860'][Math.floor(o.x)%4];g.beginPath();g.arc(X,y-3+b,3,0,7);g.fill();
  g.fillStyle=['#1a1a1a','#d8402a','#2f6ad0','#e8d070'][Math.floor(o.y)%4];g.beginPath();g.arc(X,y-4+b,3,Math.PI,0);g.fill();
  if(br>.3){g.fillStyle='#e0b088';g.fillRect(X+4,y-6,1.6,4);}if(br<-.3){g.fillStyle='#e0b088';g.fillRect(X-5.6,y-6,1.6,4);}};
/* LES VOILIERS, qui traversent lentement l'horizon */
const posVoile=o=>((performance.now()/1000*o.vit+o.dec)%(W+300))-150;
ANIM_DECOR.plg_voilier=(g,o,x,y)=>{const wx=posVoile(o),X=x+(wx-o.x),s=o.v?.7:1;
  g.fillStyle='rgba(255,255,255,.4)';g.fillRect(X-14*s,y+1,10*s,.8);
  g.fillStyle='#f4f4f0';g.beginPath();g.moveTo(X-9*s,y-2);g.lineTo(X+10*s,y-2);g.lineTo(X+7*s,y+1);g.lineTo(X-7*s,y+1);g.fill();
  R(g,X,y-26*s,1,24*s,'#6a6e74');g.fillStyle='#ffffff';g.beginPath();g.moveTo(X+1,y-25*s);g.lineTo(X+12*s,y-4*s);g.lineTo(X+1,y-4*s);g.fill();
  g.fillStyle='#e8eef4';g.beginPath();g.moveTo(X-1,y-22*s);g.lineTo(X-9*s,y-4*s);g.lineTo(X-1,y-4*s);g.fill();};
/* LA LUNE, la nuit */
ANIM_DECOR.plg_lune=(g,o,x,y)=>{let k=0;try{k=nuitDecor();}catch(e){}if(k<.05)return;g.globalAlpha=k;
  g.fillStyle='#f4f0e0';g.beginPath();g.arc(x,y,13,0,7);g.fill();g.fillStyle='rgba(200,196,180,.6)';g.beginPath();g.arc(x-4,y-3,3,0,7);g.arc(x+5,y+4,2,0,7);g.fill();g.globalAlpha=1;
  if(typeof lueurNuit==='function')lueurNuit(g,x,y,60,'rgba(220,225,255,1)');};
/* LES PROMENEURS ET LES BAIGNEURS */
const TOURNEES=[
  {pts:[[140,432],[1460,432]],v:16,n:3},{pts:[[1560,692],[40,692]],v:22,n:3},
  {pts:[[200,600],[1150,600],[1150,520],[200,520]],v:14,n:1}];
const POSES=[[1270,472,'bas'],[1410,472,'bas'],[1270,570,'haut'],[1410,570,'haut'],[540,730,'haut'],[575,740,'haut'],[500,500,'bas'],[915,560,'gauche'],[250,520,'haut']];
const GENS=[];
(()=>{let k=0;const ap=k=>({peau:[1,3,5,2,6,4][k%6],cheveux:[1,4,6,0,10,2][k%6],coiffe:[0,6,2,15,5,1][k%6],barbe:k%4===1?3:0,haut:[1,2,3,5,6,1][k%6],veste:0,pantalon:[2,8,0,2,8,0][k%6],bas:[0,5,0,2,0,0][k%6],souliers:1,chaussures:[6,0,7,1,9,6][k%6],sac:0,chapeau:k%3===0?1:0,raye:0,motif:0,_pnj:true});
  for(const T of TOURNEES){let L=0;const seg=[];for(let i=0;i<T.pts.length;i++){const a=T.pts[i],b=T.pts[(i+1)%T.pts.length],d=Math.hypot(b[0]-a[0],b[1]-a[1]);seg.push([a,b,L,d]);L+=d;}
    for(let j=0;j<T.n;j++){GENS.push({seg,L,v:T.v*(0.85+hA(k,3,1)*.3),dec:L*(j/T.n)+hA(k,4,1)*60,ap:ap(k),x:0,y:0,dir:'bas',pas:0});k++;}}
  for(const [x,y,d] of POSES){GENS.push({fixe:true,ap:ap(k),x,y,dir:d,pas:0});k++;}})();
let MOBILES=null;
function figurants(){const now=Date.now()/1000;
  /* les objets qui se déplacent : on garde leur x sur l'écran, pour qu'ils ne soient pas écartés du dessin */
  try{if(!MOBILES)MOBILES=DECOR.filter(o=>o.anim==='plg_tram'||o.anim==='plg_voilier');for(const o of MOBILES){const wx=o.anim==='plg_tram'?posRame():posVoile(o);if(wx!==null)o.x=wx;}}catch(e){}
  for(const P of GENS){if(P.fixe)continue;let s=((now*P.v+P.dec)%P.L+P.L)%P.L;
    for(const [a,b,L0,d] of P.seg){if(s<=L0+d){const t=(s-L0)/d;P.x=a[0]+(b[0]-a[0])*t;P.y=a[1]+(b[1]-a[1])*t;
      const dx=b[0]-a[0],dy=b[1]-a[1];P.dir=Math.abs(dx)>Math.abs(dy)?(dx>0?'droite':'gauche'):(dy>0?'bas':'haut');P.pas=now*P.v/9;break;}}}
  return GENS;}

/* LA BAIGNADE : dans l'eau, le corps s'enfonce ; on redessine la mer par-dessus, jusqu'à la ligne de flottaison */
const dansLEau=y=>y<RIVAGE+4;
const prof=y=>Math.max(0,Math.min(1,(RIVAGE+4-y)/46));
let DERN=null,ECLAB=[];
/* on photographie l'eau juste avant que le baigneur soit dessiné, et on la repose par-dessus son corps */
const BUFS={};
function zone(x,y,camX,camY){const d=prof(y),t=performance.now()/1000,h=3+d*30,X=x-camX,Y=y-camY,l=34,top=Math.round(Y-h+Math.sin(t*2.4+x)*0.8);return {X,Y,l,top,hh:Math.round(Y+3)-top,d};}
function photo(ctx,camX,camY,x,y,cle){const z=zone(x,y,camX,camY);if(z.d<=0)return;const m=ctx.getTransform();
  const dx=Math.round(m.a*(z.X-z.l/2)+m.e),dy=Math.round(m.d*z.top+m.f),dw=Math.max(1,Math.round(m.a*z.l)),dh=Math.max(1,Math.round(m.d*z.hh));
  let B=BUFS[cle];if(!B){B=BUFS[cle]=document.createElement('canvas');}if(B.width!==dw||B.height!==dh){B.width=dw;B.height=dh;}
  const q=B.getContext('2d');q.clearRect(0,0,dw,dh);q.drawImage(ctx.canvas,dx,dy,dw,dh,0,0,dw,dh);B._z=z;}
function eau(ctx,camX,camY,x,y,bouge,cle){const B=BUFS[cle];if(!B||!B._z)return;const z=B._z;if(z.d<=0)return;const t=performance.now()/1000;
  ctx.drawImage(B,z.X-z.l/2,z.top,z.l,z.hh);
  const r=9+Math.sin(t*3)*1.2+(bouge?2:0);
  ctx.strokeStyle='rgba(255,255,255,.75)';ctx.lineWidth=1;ctx.beginPath();ctx.ellipse(z.X,z.top+1,r,2.4,0,0,7);ctx.stroke();
  ctx.strokeStyle='rgba(255,255,255,.35)';ctx.beginPath();ctx.ellipse(z.X,z.top+1.4,r+5+((t*8)%6),3.4,0,0,7);ctx.stroke();
  if(bouge&&Math.random()<.5)ECLAB.push({x:x+(Math.random()-.5)*14,y:y-(z.Y-z.top),vy:-30-Math.random()*30,vx:(Math.random()-.5)*30,t:t});}
function acteurs(){const L=[];let j=null;try{j=joueur;}catch(e){}
  if(j&&dansLEau(j.y)){const bouge=DERN&&Math.hypot(j.x-DERN[0],j.y-DERN[1])>.3;DERN=[j.x,j.y];
    L.push({y:j.y-.01,f:(ctx,cx,cy)=>photo(ctx,cx,cy,j.x,j.y,'moi')});
    L.push({y:j.y+.01,f:(ctx,cx,cy)=>{eau(ctx,cx,cy,j.x,j.y,bouge,'moi');
      const t=performance.now()/1000;ECLAB=ECLAB.filter(e=>t-e.t<.5);for(const e of ECLAB){const k=t-e.t;ctx.fillStyle='rgba(255,255,255,'+(1-k*2)+')';ctx.fillRect(e.x+e.vx*k-cx,e.y+e.vy*k+90*k*k-cy,1.6,1.6);}}});}
  else DERN=j?[j.x,j.y]:null;
  try{for(const [k,a] of AUTRES){if(a&&dansLEau(a.y)){L.push({y:a.y-.01,f:(ctx,cx,cy)=>photo(ctx,cx,cy,a.x,a.y,'a'+k)});L.push({y:a.y+.01,f:(ctx,cx,cy)=>eau(ctx,cx,cy,a.x,a.y,false,'a'+k)});}}}catch(e){}
  return L;}
function bloque(x,y){
  if(x<12||x>W-12)return true;
  if(y<304)return true;                                              /* on nage jusqu'à la ligne des bouées, pas plus loin */
  if(Math.abs(x-820)<58&&y<268)return true;                           /* le ponton */
  if((x<128||x>1472)&&y<RIVAGE+38)return true;                        /* les rochers des digues */
  if(y>PROM-6&&y<PROM+12&&!ESCS.some(([ex,w])=>Math.abs(x-ex)<w/2-6))return true;   /* le muret, sauf aux escaliers */
  if(y>H-6)return true;
  if(dansRame(x,y))return true;
  for(const o of DECOR){if(!o.col)continue;if(Math.abs(x-o.x)<o.col[0]/2&&y>o.y-o.col[1]&&y<o.y+3)return true;}
  return false;}
const GRAVEURS={x_jol_plg_parasol_sol:graverParasol,x_jol_plg_serviette_sol:graverServiette,x_jol_plg_filet_sol:graverFilet,x_jol_plg_terrain_sol:graverTerrain,
  x_jol_plg_poste_sol:graverPoste,x_jol_plg_douche_sol:graverDouche,x_jol_plg_glacier_sol:graverGlacier,x_jol_plg_ponton_sol:graverPonton,x_jol_plg_pin_sol:graverPin,
  x_jol_plg_gc_sol:graverGardeCorps,x_jol_plg_banc_sol:graverBanc,x_jol_plg_lampe_sol:graverLampe,x_jol_plg_arret_sol:graverArret};
function graver(t,v){const r=(GRAVEURS[t]||(()=>({toile:document.createElement('canvas'),W:1,H:1,sol:0})))(v||0);return {toile:r.toile,W:r.W,H:r.H,sol:r.sol};}
let PARTI=false;
function sortir(){if(PARTI)return;PARTI=true;try{sauver();}catch(x){}
  try{const f=document.createElement('div');f.style.cssText='position:fixed;inset:0;z-index:2147483000;background:#0e1a2c;opacity:0;transition:opacity .45s;display:flex;align-items:center;justify-content:center;color:#fff;font:700 18px "Helvetica Neue",Arial,sans-serif';f.textContent='Prochain arrêt : Joliette';document.body.appendChild(f);requestAnimationFrame(()=>f.style.opacity='1');}catch(x){}
  setTimeout(()=>{const v=window.MA_VERSION?('&v='+encodeURIComponent(window.MA_VERSION)):'';location.href='spawn.html?de=stade'+v;},800);}
function rentrer(){sortir();}
return {sol,solFin,decor,bloque,graver,depart:DEPART,figurants,acteurs};
})()
