/* =====================================================================
   LA FÊTE FORAINE DU PRADO (foire.html) — un lieu à part entière.
   Même facture que la place et le stade : couleurs de plein jour (la nuit,
   le moteur assombrit et allume nos lampes), sol en dalles de pierre,
   objets gravés au demi-pixel, ombres douces, reflets, dégradés.
   Au fond : le ciel, les collines, Notre-Dame, les toits de Marseille et la
   grande roue. Devant : les baraques, les platanes, le carrousel, les
   auto-tamponneuses, la barbe à papa, le marchand de ballons.
   Les jeux se jouent dans leur propre écran (forain.js).
   Chargé par moteur.js (eval direct).
   ===================================================================== */
(()=>{
const W=1800, H=1400, Y0=430;
const CX=900;
const DEPART=[900,1330];
const hA=(x,y,k)=>{let n=((x*73856093)^(y*19349663)^(k*83492791))|0;n=(n^(n>>>13))*1274126177|0;return((n^(n>>>16))>>>0)/4294967296;};
const COUL=['#d8382e','#f2b632','#2f7fd0','#3aa05a','#f07aa0','#8a5ad8','#f0882a','#22a0a0'];
const CAR={x:300,y:860,r:118};
const TAMP={x0:1330,y0:720,x1:1730,y1:950};

/* une toile gravée au demi-pixel, comme les objets de la place */
function toile(L,HH){const D=2;const c=document.createElement('canvas');c.width=L*D;c.height=HH*D;const g=c.getContext('2d');g.setTransform(D,0,0,D,0,0);g.imageSmoothingEnabled=true;
  const R=(x,y,w,hh,col)=>{g.fillStyle=col;g.fillRect(x,y,w,hh);};return {c,g,R};}
const ombre=(g,x,y,rx,ry,a)=>{g.fillStyle='rgba(40,30,20,'+(a||.22)+')';g.beginPath();g.ellipse(x,y,rx,ry,0,0,7);g.fill();};
const VG=(g,x,y,w,h,c1,c2)=>{const q=g.createLinearGradient(0,y,0,y+h);q.addColorStop(0,c1);q.addColorStop(1,c2);g.fillStyle=q;g.fillRect(x,y,w,h);};
const rond=(g,x,y,r,c)=>{g.fillStyle=c;g.beginPath();g.arc(x,y,r,0,7);g.fill();};
const ell=(g,x,y,rx,ry,c)=>{g.fillStyle=c;g.beginPath();g.ellipse(x,y,rx,ry,0,0,7);g.fill();};
const R2=(g,x,y,w,h,c)=>{g.fillStyle=c;g.fillRect(x,y,w,h);};
const arrondi=(g,x,y,w,h,r)=>{g.beginPath();g.moveTo(x+r,y);g.arcTo(x+w,y,x+w,y+h,r);g.arcTo(x+w,y+h,x,y+h,r);g.arcTo(x,y+h,x,y,r);g.arcTo(x,y,x+w,y,r);g.closePath();};
const ecrire=(g,s,x,y,px,c,ombreC)=>{g.font='900 '+px+'px "Arial Black","Helvetica Neue",Arial,sans-serif';g.textAlign='center';g.textBaseline='middle';if(ombreC){g.fillStyle=ombreC;g.fillText(s,x+.8,y+.9);}g.fillStyle=c;g.fillText(s,x,y);};
/* une ampoule de fête : un globe, son reflet ; éteinte elle reste dorée */
function ampoule(g,x,y,on,c){if(on){g.fillStyle='rgba(255,236,170,.32)';g.beginPath();g.arc(x,y,4.2,0,7);g.fill();}g.fillStyle=on?(c||'#fff6d0'):'#c8a050';g.beginPath();g.arc(x,y,1.7,0,7);g.fill();g.fillStyle=on?'#ffffff':'#e8cc80';g.fillRect(x-.8,y-.9,.8,.8);}
const lum=(g,x,y,r,c)=>{try{lueurNuit(g,x,y,r,c||'rgba(255,220,150,1)');}catch(z){}};

/* ---------- LE SOL : losanges pastel, allée bleu nuit étoilée d'or ---------- */
function solVariante(g,R){const AL0=Y0+112;
 const ETOILE=(x,y,r,c)=>{g.fillStyle=c;g.beginPath();for(let k=0;k<10;k++){const a=-Math.PI/2+k*Math.PI/5,rr=k%2?r*.45:r;g.lineTo(x+Math.cos(a)*rr,y+Math.sin(a)*rr);}g.fill();};
 const AMPOULES=()=>{for(const s of [-1,1]){const bx=CX+s*88-(s<0?6:0);R(bx,AL0,6,H-AL0,'#7a2a26');R(bx,AL0,6,1,'#b8504a');for(let y=AL0+6;y<H;y+=13){g.fillStyle='rgba(255,220,120,.35)';g.beginPath();g.arc(bx+3,y,4,0,7);g.fill();g.fillStyle='#ffe7a0';g.beginPath();g.arc(bx+3,y,2.2,0,7);g.fill();R(bx+2,y-1.4,1,1,'#fff');}}};
 const CONFETTIS=(n,sd)=>{const C=['#e8443c','#f2b630','#3aa0e0','#5cc05a','#e05ca8','#9a5ce0'];for(let i=0;i<n;i++){const x=hA(i,1,sd)*W,y=Y0+hA(i,2,sd)*(H-Y0);g.save();g.translate(x,y);g.rotate(hA(i,3,sd)*6);g.fillStyle=C[(hA(i,4,sd)*6)|0];g.fillRect(-1.2,-.7,2.4,1.4);g.restore();}};
 const TICKETS=(n,sd)=>{for(let i=0;i<n;i++){const x=hA(i,5,sd)*W,y=Y0+30+hA(i,6,sd)*(H-Y0-40);g.save();g.translate(x,y);g.rotate(hA(i,7,sd)*6);g.fillStyle='rgba(0,0,0,.15)';g.fillRect(-4,-1.5,9,5);g.fillStyle=hA(i,8,sd)<.5?'#f0c040':'#e86a5a';g.fillRect(-4.5,-2.5,9,5);g.fillStyle='rgba(255,255,255,.6)';g.fillRect(-2.5,-.5,5,.8);g.restore();}};
  /* les losanges pastel : rose, menthe, citron, crème, lavande */
  const P=['#f6c6d0','#bfe8d6','#f8e7a4','#f4ecdc','#cfd8f6'];const S=22;
  for(let y=Y0-S;y<H+S;y+=S/2)for(let x=-S;x<W+S;x+=S){const ox=(((y-Y0)/(S/2))|0)%2?S/2:0,cx=x+ox,cy=y;const c=P[(hA(cx|0,cy|0,101)*5)|0];
    g.fillStyle=c;g.beginPath();g.moveTo(cx,cy-S/2);g.lineTo(cx+S/2,cy);g.lineTo(cx,cy+S/2);g.lineTo(cx-S/2,cy);g.fill();
    g.strokeStyle='rgba(255,255,255,.75)';g.lineWidth=1;g.stroke();g.fillStyle='rgba(255,255,255,.35)';g.fillRect(cx-3,cy-4,3,1);}
  for(let y=AL0;y<H;y++){g.fillStyle=y%9<5?'#22305e':'#24335f';g.fillRect(CX-82,y,164,1);}
  for(let y=AL0+30;y<H;y+=70){ETOILE(CX,y,14,'#e8b84a');ETOILE(CX,y,8,'#f8dc84');ETOILE(CX-48,y+35,6,'#e8b84a');ETOILE(CX+48,y+35,6,'#e8b84a');}
  AMPOULES();CONFETTIS(800,102);TICKETS(25,103);}

/* ---------- LE SOL ET LE FOND ---------- */
function peindreSol(g){
  const R=(x,y,w,h,c)=>{g.fillStyle=c;g.fillRect(x,y,w,h);};
  /* le ciel de Marseille, et quelques nuages */
  const ci=g.createLinearGradient(0,0,0,Y0-60);ci.addColorStop(0,'#6fb2e6');ci.addColorStop(.7,'#a6d2f0');ci.addColorStop(1,'#d6ebf4');g.fillStyle=ci;g.fillRect(0,0,W,Y0);
  for(const [x,y,s] of [[180,70,1],[620,40,.8],[1180,90,1.1],[1580,50,.9],[1000,150,.7]]){g.fillStyle='rgba(255,255,255,.85)';for(let i=0;i<7;i++){g.beginPath();g.ellipse(x+(i-3)*16*s,y+Math.abs(i-3)*3*s,22*s,12*s,0,0,7);g.fill();}g.fillStyle='rgba(200,220,236,.6)';g.beginPath();g.ellipse(x,y+10*s,58*s,6*s,0,0,7);g.fill();}
  /* les collines calcaires et la garrigue */
  g.fillStyle='#b8c8c0';g.beginPath();g.moveTo(0,Y0-120);for(let x=0;x<=W;x+=20)g.lineTo(x,Y0-120-Math.sin(x/210)*26-Math.sin(x/90)*8);g.lineTo(W,Y0);g.lineTo(0,Y0);g.fill();
  const nx=1380;g.fillStyle='#9aae9a';g.beginPath();g.moveTo(0,Y0-90);for(let x=0;x<=W;x+=10)g.lineTo(x,Y0-90-Math.max(0,150-Math.abs(x-nx)*.75)-Math.sin(x/60)*4);g.lineTo(W,Y0);g.lineTo(0,Y0);g.fill();
  for(let i=0;i<220;i++){const x=hA(i,1,2)*W,yb=Y0-90-Math.max(0,150-Math.abs(x-nx)*.75);g.fillStyle=i%3?'#7a9a74':'#d8d0bc';g.beginPath();g.ellipse(x,yb+6+hA(i,2,2)*30,3+hA(i,3,2)*3,2,0,0,7);g.fill();}
  /* Notre-Dame de la Garde, sa tour, la Bonne Mère dorée */
  {const ny=Y0-236;g.fillStyle='#e8dcc4';g.fillRect(nx-26,ny+34,52,30);g.fillRect(nx-11,ny-2,22,38);g.fillRect(nx-7,ny-18,14,18);g.fillRect(nx-4,ny-30,8,14);
   for(let i=0;i<6;i++){g.fillStyle=i%2?'#c8a888':'#e8dcc4';g.fillRect(nx-26,ny+38+i*4,52,2);}g.fillStyle='#b89a7a';g.fillRect(nx-26,ny+34,52,2);g.fillRect(nx+8,ny-2,3,38);
   for(let i=0;i<4;i++){g.fillStyle='#6a5a4a';g.beginPath();g.arc(nx-18+i*12,ny+50,3,Math.PI,0);g.fill();g.fillRect(nx-21+i*12,ny+50,6,6);}
   g.fillStyle='#e8b830';g.fillRect(nx-2,ny-44,4,14);g.fillRect(nx-4,ny-34,8,3);g.beginPath();g.arc(nx,ny-46,2.4,0,7);g.fill();}
  /* les toits de Marseille : façades crème, tuiles rouges, volets */
  for(let i=0;i<70;i++){const x=Math.round(i*27+hA(i,7,1)*8),hb=Math.round(26+hA(i,8,1)*40),wb=Math.round(24+hA(i,9,1)*10),y=Y0-hb;if(Math.abs(x+wb/2-nx)<40&&hb>40)continue;
    const fac=['#efe2c8','#e8d2b0','#f2e8d6','#e4c8a8','#ead8bc'][i%5];R(x,y,wb,hb,fac);R(x+wb-3,y,3,hb,'rgba(120,90,60,.18)');
    g.fillStyle='#c0603a';g.beginPath();g.moveTo(x-2,y+1);g.lineTo(x+wb/2,y-7);g.lineTo(x+wb+2,y+1);g.fill();g.fillStyle='#a04a2c';g.fillRect(x-2,y,wb+4,1.5);
    for(let r=0;r<Math.floor((hb-6)/11);r++)for(let k=0;k<Math.floor(wb/8);k++){const fx=x+3+k*8,fy=y+5+r*11;R(fx,fy,4,6,'#5a6a7a');R(fx-1.5,fy,1.5,6,['#3a7a6a','#5a8ab0','#c87a3a'][i%3]);R(fx+4,fy,1.5,6,['#3a7a6a','#5a8ab0','#c87a3a'][i%3]);}}
  solVariante(g,R);
  /* le pied du fond : un muret de pierre, sous les baraques */
  VG(g,0,Y0,W,10,'#cbbcaa','#e0d4c2');R(0,Y0,W,1.5,'#f6efe6');R(0,Y0+10,W,2,'rgba(60,40,20,.18)');
  /* les tickets, les confettis */
  for(let i=0;i<260;i++){const x=hA(i,21,2)*W,y=Y0+30+hA(i,22,2)*(H-Y0-40);g.fillStyle=COUL[i%8];g.globalAlpha=.7;g.fillRect(x,y,1.5,1.5);}g.globalAlpha=1;
  for(let i=0;i<16;i++){const x=hA(i,31,2)*W,y=Y0+40+hA(i,32,2)*(H-Y0-60);R(x,y,5,3,'#f6eed8');R(x,y,1.5,3,'#d8382e');}
  /* LA PISTE DES AUTO-TAMPONNEUSES : un plancher de tôle polie, une bordure en caoutchouc */
  {const {x0,y0,x1,y1}=TAMP,tw=x1-x0,th=y1-y0;ombre(g,(x0+x1)/2,y1+8,tw/2+30,14,.2);
   R(x0-14,y0-14,tw+28,th+28,'#2a2a30');R(x0-12,y0-12,tw+24,th+24,'#e8b830');R(x0-9,y0-9,tw+18,th+18,'#1e1e24');
   const pl=g.createLinearGradient(x0,y0,x1,y1);pl.addColorStop(0,'#8a94a6');pl.addColorStop(.5,'#a8b2c4');pl.addColorStop(1,'#7a8496');g.fillStyle=pl;g.fillRect(x0,y0,tw,th);
   for(let y=y0;y<y1;y+=20)R(x0,y,tw,1,'rgba(40,46,60,.25)');for(let x=x0;x<x1;x+=40)R(x,y0,1,th,'rgba(40,46,60,.25)');
   for(let i=0;i<120;i++)R(x0+hA(i,5,7)*tw,y0+hA(i,6,7)*th,3,.8,'rgba(255,255,255,.18)');
   g.fillStyle='rgba(255,255,255,.12)';g.beginPath();g.moveTo(x0+40,y0);g.lineTo(x0+120,y0);g.lineTo(x0+40,y1);g.lineTo(x0-40,y1);g.fill();}
  /* l'aire du carrousel : un dallage en rosace */
  {const {x,y}=CAR;for(let r=150;r>0;r-=12){g.fillStyle=(r/12)%2?'#ddd2c0':'#e8decc';g.beginPath();g.ellipse(x,y+10,r,r*.4,0,0,7);g.fill();}g.strokeStyle='rgba(110,100,90,.25)';g.lineWidth=1;for(let i=0;i<16;i++){const a=i/16*Math.PI*2;g.beginPath();g.moveTo(x,y+10);g.lineTo(x+Math.cos(a)*150,y+10+Math.sin(a)*60);g.stroke();}}
  /* l'entrée : le tapis rouge */
  R(CX-54,H-74,108,74,'#9a2a30');for(let y=H-72;y<H;y+=6)R(CX-54,y,108,1,'rgba(0,0,0,.08)');R(CX-54,H-74,2,74,'#e8b830');R(CX+52,H-74,2,74,'#e8b830');
}
function sol(){const c=document.createElement('canvas');c.width=W;c.height=H;peindreSol(c.getContext('2d'));return c;}
function solFin(){const c=document.createElement('canvas');c.width=W*2;c.height=H*2;const g=c.getContext('2d');g.setTransform(2,0,0,2,0,0);peindreSol(g);return c;}

/* ---------- LES BARAQUES ---------- */
const BAR=[
 {k:'chamboule',x:CX-240,y:720,nom:'CHAMBOULE-TOUT',c1:'#c8322a',c2:'#f6efe0',ens:'#1f3a7a',dedans:'boites'},
 {k:'tir',x:CX-240,y:990,nom:'TIR AUX CANARDS',c1:'#1f5aa8',c2:'#f2c232',ens:'#8a1a2a',dedans:'canards'},
 {k:'peche',x:CX+240,y:720,nom:'PÊCHE AUX CANARDS',c1:'#1a9a8a',c2:'#f6efe0',ens:'#4a2a7a',dedans:'bassin'},
 {k:'lots',x:CX+240,y:990,nom:'LOTS & TICKETS',c1:'#6a34b8',c2:'#f2c232',ens:'#1a1a2a',dedans:'lots'}];
const BW=240,BH=236;
const AMP={};
/* une peluche : tête ronde, oreilles, museau */
function peluche(g,x,y,s,c){ell(g,x,y+5*s,5*s,5.5*s,c);rond(g,x,y-2*s,4.6*s,c);rond(g,x-3.6*s,y-5.6*s,1.8*s,c);rond(g,x+3.6*s,y-5.6*s,1.8*s,c);
  ell(g,x,y-.6*s,2.2*s,1.6*s,'#fff2e0');rond(g,x-1.8*s,y-2.8*s,.6*s,'#2a1a1a');rond(g,x+1.8*s,y-2.8*s,.6*s,'#2a1a1a');rond(g,x,y-1.2*s,.6*s,'#2a1a1a');
  g.fillStyle='rgba(255,255,255,.25)';g.beginPath();g.arc(x-1.6*s,y-4.2*s,1.2*s,0,7);g.fill();}
function facade(B){const amp=[];AMP[B.k]=amp;const {c,g,R}=toile(BW,BH);const cx=BW/2,s=BH-4;
  ombre(g,cx,s,BW/2-4,6,.28);
  VG(g,8,74,BW-16,s-74,'#7a4e30','#5a3622');for(let x=12;x<BW-12;x+=9)R(x,74,.6,s-74,'rgba(40,20,10,.35)');
  const iy=86,ih=s-130;VG(g,16,iy,BW-32,ih,'#fbe8c8','#e2c49a');for(let x=16;x<BW-16;x+=10)R(x,iy,4,ih,'rgba(200,60,40,.07)');
  if(B.dedans==='boites'){R(40,s-60,BW-80,5,'#8a5a32');R(40,s-60,BW-80,1.2,'#b88050');R(40,s-55,BW-80,2,'rgba(40,20,10,.4)');
    for(let r=0;r<4;r++)for(let k=0;k<4-r;k++){const x=cx-30+k*20+r*10-8,y=s-60-13-r*13.5,cc=['#c8322a','#2a6ac8','#e8b02a','#3a9a4a'][(r+k)%4];
      const q=g.createLinearGradient(x,0,x+16,0);q.addColorStop(0,cc);q.addColorStop(.35,'#ffffff');q.addColorStop(.5,cc);q.addColorStop(1,'#3a1a10');g.fillStyle=q;g.fillRect(x,y,16,13);
      R(x,y,16,2,'#e8e8ec');R(x,y+11,16,2,'#c8c8d0');R(x+5,y+4,6,5,'#f6efe0');}
    for(const x of [30,BW-30])for(let r=0;r<3;r++)peluche(g,x,iy+16+r*22,1.7,['#f08ab0','#8ac8f0','#f2c232'][r]);}
  if(B.dedans==='canards'){for(let r=0;r<2;r++){const y=iy+30+r*30;R(20,y+12,BW-40,3,'#6a5a4a');R(20,y+12,BW-40,1,'#a89a8a');
      for(let k=0;k<8;k++){const x=28+k*24+(r?12:0),cc=r?'#f2c232':'#f6f6f6',o=r?'#c8901a':'#c0c0c8';ell(g,x+6,y+6,8,5,cc);rond(g,x+12,y-1,4,cc);g.fillStyle='#f0882a';g.beginPath();g.moveTo(x+15.5,y-1.5);g.lineTo(x+19,y);g.lineTo(x+15.5,y+.8);g.fill();
        rond(g,x+13,y-2,.7,'#1a1a1a');ell(g,x+4,y+7,4,2,o);R(x+5,y+11,2,2,'#4a4a4a');}}
    for(let i=0;i<5;i++){const x=34+i*42;rond(g,x,iy+12,6,'#f6efe0');rond(g,x,iy+12,4.4,'#c8322a');rond(g,x,iy+12,2.6,'#f6efe0');rond(g,x,iy+12,1.2,'#c8322a');}}
  if(B.dedans==='bassin'){const by=s-70;ell(g,cx,by+12,BW/2-22,15,'#2a5a8a');const q=g.createLinearGradient(0,by,0,by+24);q.addColorStop(0,'#6ad0f0');q.addColorStop(1,'#2a8ac0');g.fillStyle=q;g.beginPath();g.ellipse(cx,by+10,BW/2-26,12,0,0,7);g.fill();
    for(let k=0;k<9;k++){const x=32+k*21,y=by+6+(k%2)*6,cc=['#f2c232','#f2c232','#f08ab0','#8ac8f0'][k%4];ell(g,x,y,5,3.4,cc);rond(g,x+3.5,y-3,2.6,cc);R(x+5.5,y-3.4,2.4,1.2,'#f0882a');rond(g,x+4,y-3.5,.5,'#1a1a1a');}
    for(let i=0;i<14;i++)R(30+i*13,by+5+(i%3)*5,6,.8,'rgba(255,255,255,.55)');
    for(let k=0;k<6;k++)peluche(g,30+k*36,iy+20,2,['#f08ab0','#8ac8f0','#f2c232','#a88af0','#7ad08a','#f0a060'][k]);}
  if(B.dedans==='lots'){for(let r=0;r<3;r++){const y=iy+22+r*24;R(18,y+10,BW-36,3,'#8a5a32');R(18,y+10,BW-36,1,'#b88050');for(let k=0;k<9;k++)peluche(g,26+k*21,y,1.25,['#f08ab0','#8ac8f0','#f2c232','#a88af0','#7ad08a','#f0a060'][(k+r*2)%6]);}
    R(cx-34,s-62,68,16,'#3a2a20');R(cx-32,s-60,64,12,'#cfe8f4');R(cx-32,s-60,64,3,'#ffffff');ecrire(g,'TICKETS',cx,s-53.5,8,'#c8322a');}
  for(let i=0;i<12;i++){const x=20+i*17.5;g.fillStyle=COUL[i%8];g.beginPath();g.moveTo(x,iy+2);g.lineTo(x+14,iy+2);g.lineTo(x+7,iy+11);g.fill();}g.fillStyle='rgba(40,20,10,.5)';g.fillRect(18,iy+1,BW-36,1);
  g.fillStyle=B.c1;g.fillRect(6,s-46,BW-12,40);VG(g,6,s-46,BW-12,40,'rgba(255,255,255,.12)','rgba(0,0,0,.25)');
  R(4,s-50,BW-8,6,'#a87038');R(4,s-50,BW-8,1.5,'#d8a060');R(6,s-44,BW-12,2,'#e8b830');R(6,s-8,BW-12,2,'#e8b830');
  for(let k=0;k<5;k++){const x=28+k*46;ell(g,x,s-26,13,9,'#e8b830');ell(g,x,s-26,11,7.4,B.c2);ell(g,x-3,s-28,4,2,'rgba(255,255,255,.6)');}
  for(const x of [4,BW-12]){VG(g,x,60,8,s-60,'#f2d27a','#c8962a');g.save();g.beginPath();g.rect(x,60,8,s-60);g.clip();g.strokeStyle=B.c1;g.lineWidth=3;for(let y=50;y<s+10;y+=10){g.beginPath();g.moveTo(x-2,y+8);g.lineTo(x+10,y);g.stroke();}g.restore();R(x+1,60,1.5,s-60,'rgba(255,255,255,.4)');}
  const ay=42,ah=26;for(let i=0;i<15;i++){const x0=i*16,col=i%2?B.c2:B.c1;g.fillStyle=col;g.beginPath();g.moveTo(x0+2,ay);g.lineTo(x0+14,ay);g.lineTo(x0+16,ay+ah);g.lineTo(x0,ay+ah);g.fill();}
  const sh=g.createLinearGradient(0,ay,0,ay+ah);sh.addColorStop(0,'rgba(255,255,255,.35)');sh.addColorStop(.3,'rgba(255,255,255,0)');sh.addColorStop(1,'rgba(0,0,0,.22)');g.fillStyle=sh;g.fillRect(0,ay,BW,ah);
  for(let i=0;i<15;i++){g.fillStyle=i%2?B.c2:B.c1;g.beginPath();g.arc(i*16+8,ay+ah,8,0,Math.PI);g.fill();}
  R(0,ay-2,BW,3,'#7a2a1a');VG(g,8,ay+ah+8,BW-16,6,'rgba(0,0,0,.25)','rgba(0,0,0,0)');
  g.fillStyle='#a8782a';arrondi(g,14,0,BW-28,42,10);g.fill();g.fillStyle='#f2d27a';arrondi(g,16,1.5,BW-32,39,9);g.fill();g.fillStyle=B.ens;arrondi(g,20,5,BW-40,31,7);g.fill();
  VG(g,20,5,BW-40,12,'rgba(255,255,255,.14)','rgba(255,255,255,0)');
  ecrire(g,B.nom,cx,21,B.nom.length>15?14.5:16,'#ffe9a8','rgba(0,0,0,.6)');
  for(let x=24;x<=BW-24;x+=10)amp.push([x,3]);for(let x=24;x<=BW-24;x+=10)amp.push([x,39]);
  return c;}
const FAC={};function fac(B){return FAC[B.k]||(FAC[B.k]=facade(B));}
function ampoulesBaraque(g,B,ox,oy,t){const A=AMP[B.k]||[];for(let i=0;i<A.length;i++){const [x,y]=A[i];ampoule(g,ox+x,oy+y,((i+Math.floor(t*4))%3)!==0);}}

/* ---------- LA GRANDE ROUE ---------- */
const ROUE={x:CX,y:Y0-210,r:182,n:16};
function nacelle(g,x,y,c){g.fillStyle='#8a90a0';g.fillRect(x-.6,y,1.2,6);
  g.fillStyle=c;g.beginPath();g.moveTo(x-9,y+6);g.quadraticCurveTo(x,y+1,x+9,y+6);g.fill();
  const q=g.createLinearGradient(x-9,0,x+9,0);q.addColorStop(0,c);q.addColorStop(.3,'#ffffff');q.addColorStop(.45,c);q.addColorStop(1,'#2a2a3a');
  g.fillStyle=q;arrondi(g,x-8,y+6,16,14,3);g.fill();g.fillStyle=c;g.fillRect(x-8,y+13,16,7);g.fillStyle='#2a3a5a';g.fillRect(x-5.5,y+8,11,5);g.fillStyle='rgba(255,255,255,.35)';g.fillRect(x-5.5,y+8,3,5);
  g.fillStyle='rgba(0,0,0,.25)';g.fillRect(x-8,y+18,16,2);}
function dessinerRoue(g,ox,oy,t){const {r,n}=ROUE,X=ROUE.x+ox,Y=ROUE.y+oy,Ys=Y0+oy+4,a0=t*.11;
  for(const s of [-1,1]){const fx=X+s*122;g.strokeStyle='#d8dce6';g.lineWidth=5;g.beginPath();g.moveTo(X+s*4,Y);g.lineTo(fx,Ys);g.stroke();g.strokeStyle='#ffffff';g.lineWidth=1.2;g.beginPath();g.moveTo(X+s*2,Y);g.lineTo(fx-s*2,Ys);g.stroke();
    g.strokeStyle='#9aa0b0';g.lineWidth=.8;for(let k=1;k<9;k++){const u=k/9;g.beginPath();g.moveTo(X+(fx-X)*u-3,Y+(Ys-Y)*u);g.lineTo(X+(fx-X)*(u+.06)+3,Y+(Ys-Y)*(u+.06));g.stroke();}
    ell(g,fx,Ys,9,3,'#6a6e78');}
  g.strokeStyle='#b8bcc8';g.lineWidth=2.4;g.beginPath();g.moveTo(X-64,Y+(Ys-Y)*.53);g.lineTo(X+64,Y+(Ys-Y)*.53);g.stroke();
  g.strokeStyle='#f2f4f8';g.lineWidth=3;g.beginPath();g.arc(X,Y,r,0,7);g.stroke();g.strokeStyle='#d8dce6';g.lineWidth=2;g.beginPath();g.arc(X,Y,r-14,0,7);g.stroke();
  g.strokeStyle='#b8bcc8';g.lineWidth=.9;for(let i=0;i<n*2;i++){const a=a0+i/(n*2)*Math.PI*2,b=a+Math.PI/n;g.beginPath();g.moveTo(X+Math.cos(a)*(r-14),Y+Math.sin(a)*(r-14));g.lineTo(X+Math.cos(b)*r,Y+Math.sin(b)*r);g.stroke();}
  g.strokeStyle='#e8ecf2';g.lineWidth=1.3;for(let i=0;i<n;i++){const a=a0+i/n*Math.PI*2;for(const d of [-.012,.012]){g.beginPath();g.moveTo(X,Y);g.lineTo(X+Math.cos(a+d)*r,Y+Math.sin(a+d)*r);g.stroke();}}
  rond(g,X,Y,17,'#e8b830');rond(g,X,Y,13,'#c8322a');g.fillStyle='#f2d27a';for(let i=0;i<8;i++){const a=i/8*Math.PI*2+a0;g.beginPath();g.moveTo(X,Y);g.lineTo(X+Math.cos(a-.15)*12,Y+Math.sin(a-.15)*12);g.lineTo(X+Math.cos(a+.15)*12,Y+Math.sin(a+.15)*12);g.fill();}rond(g,X,Y,4,'#ffffff');
  for(let i=0;i<80;i++){const a=a0+i/80*Math.PI*2;ampoule(g,X+Math.cos(a)*r,Y+Math.sin(a)*r,((i+Math.floor(t*7))%4)===0,COUL[i%8]);}
  for(let i=0;i<n;i++){const a=a0+i/n*Math.PI*2;nacelle(g,X+Math.cos(a)*r,Y+Math.sin(a)*r,COUL[i%8]);}
  lum(g,X,Y,80,'rgba(255,210,120,1)');for(let i=0;i<8;i++){const a=a0+i/8*Math.PI*2;lum(g,X+Math.cos(a)*r,Y+Math.sin(a)*r,70,['rgba(255,90,80,1)','rgba(255,220,120,1)','rgba(110,180,255,1)','rgba(255,140,200,1)'][i%4]);}}
const CABANE=(()=>{const L=170,HH=104,{c,g,R}=toile(L,HH),s=HH-4;ombre(g,L/2,s,L/2-6,5,.25);
  VG(g,12,40,L-24,s-40,'#f6efe0','#e2d4bc');for(let x=12;x<L-12;x+=8)R(x,40,.5,s-40,'rgba(120,90,60,.15)');
  for(let i=0;i<11;i++){g.fillStyle=i%2?'#f6efe0':'#c8322a';g.beginPath();g.moveTo(i*16+2,26);g.lineTo(i*16+14,26);g.lineTo(i*16+16,42);g.lineTo(i*16,42);g.fill();}for(let i=0;i<11;i++){g.fillStyle=i%2?'#f6efe0':'#c8322a';g.beginPath();g.arc(i*16+8,42,8,0,Math.PI);g.fill();}
  R(22,56,58,34,'#5a3622');const q=g.createLinearGradient(0,58,0,88);q.addColorStop(0,'#cfeaf6');q.addColorStop(1,'#8ac0dc');g.fillStyle=q;g.fillRect(24,58,54,30);R(24,58,16,30,'rgba(255,255,255,.25)');R(24,74,54,2,'#5a3622');
  R(96,50,52,50,'#5a3622');VG(g,98,52,48,48,'#9a5a32','#7a4422');R(138,76,3,3,'#e8b830');
  g.fillStyle='#a8782a';arrondi(g,26,0,118,26,8);g.fill();g.fillStyle='#1f3a7a';arrondi(g,29,2.5,112,21,6);g.fill();ecrire(g,'GRANDE ROUE',L/2,13.5,12.5,'#ffe9a8','rgba(0,0,0,.6)');
  R(28,90,48,10,'#f6efe0');R(28,90,48,1.5,'#c8322a');ecrire(g,'UN TOUR !',52,95.5,7.5,'#c8322a');return c;})();

/* ---------- LE CARROUSEL ---------- */
/* ---------- LE CARROUSEL : un manège à chevaux de bois, à l'ancienne ---------- */
const CARV='1';
const CPAL=CARV==='2'?{toit:['#f6c6d0','#fff6ec'],bande:'#2f8a8a',bande2:'#226a6a',jupe:'#e87898',jupe2:'#c85a7a',panneau:'#bfe8d6',plancher:['#f4ecdc','#e2d4bc']}
                     :{toit:['#c8322a','#fff6ec'],bande:'#1f3a7a',bande2:'#152a5c',jupe:'#a8262c',jupe2:'#7a1a20',panneau:'#f2e2c4',plancher:['#efe2c8','#d8c4a2']};
const CHEV=['#fbf4e6','#f2c84a','#f08aa8','#7ab8e8','#b49ae8','#fbf4e6','#8ad09a','#f08aa8'];
const OR=(g,x0,x1)=>{const q=g.createLinearGradient(x0,0,x1,0);q.addColorStop(0,'#a8782a');q.addColorStop(.45,'#ffe9a0');q.addColorStop(.6,'#f2c650');q.addColorStop(1,'#9a6a20');return q;};
function chevalBois(g,x,y,c,dir,s,plume){g.save();g.translate(x,y);g.scale(dir*s*.3,s*.3);
  const OL='rgba(70,40,30,.85)',fonce=c2=>c2;
  const jambe=(pts,w0,w1,col)=>{g.lineCap='round';g.lineJoin='round';
    for(const [lw,cc] of [[w0+3,OL],[w0,col]]){g.strokeStyle=cc;g.lineWidth=lw;g.beginPath();g.moveTo(pts[0][0],pts[0][1]);g.lineTo(pts[1][0],pts[1][1]);g.stroke();}
    for(const [lw,cc] of [[w1+3,OL],[w1,col]]){g.strokeStyle=cc;g.lineWidth=lw;g.beginPath();g.moveTo(pts[1][0],pts[1][1]);g.lineTo(pts[2][0],pts[2][1]);g.stroke();}
    const [hx,hy]=pts[2],[px,py]=pts[1],a=Math.atan2(hy-py,hx-px);g.save();g.translate(hx,hy);g.rotate(a);g.fillStyle=OL;g.fillRect(-1,-w1/2-1.5,7,w1+3);g.fillStyle='#d8a838';g.fillRect(0,-w1/2-.2,5,w1+.4);g.fillStyle='#fff0a0';g.fillRect(1,-w1/2,1.4,w1);g.restore();};
  /* la queue, derrière */
  g.lineCap='round';for(const [lw,cc] of [[11,OL],[8,'#d8a030'],[3,'#ffe48a']]){g.strokeStyle=cc;g.lineWidth=lw;g.beginPath();g.moveTo(-32,4);g.bezierCurveTo(-44,-6,-54,4,-52,20);g.stroke();g.beginPath();g.moveTo(-33,6);g.bezierCurveTo(-48,0,-60,12,-58,26);g.stroke();}
  /* les jambes du côté loin, un peu dans l'ombre */
  g.globalAlpha=.82;jambe([[-20,22],[-31,34],[-44,40]],9,6,c);jambe([[26,18],[32,31],[24,39]],8,5.5,c);g.globalAlpha=1;
  /* le corps */
  const corps=()=>{g.beginPath();g.moveTo(-30,2);g.bezierCurveTo(-18,-4,-4,3,10,0);g.bezierCurveTo(16,-3,20,-16,26,-30);g.bezierCurveTo(28,-36,30,-40,32,-42);
    g.lineTo(31,-52);g.lineTo(36.5,-44);g.bezierCurveTo(42,-44,50,-36,56,-25);g.bezierCurveTo(58.5,-21,57.5,-17,54,-16);g.lineTo(47,-16);
    g.bezierCurveTo(43,-17,41,-21,40,-25);g.bezierCurveTo(38,-14,37,-2,35,8);g.bezierCurveTo(34,18,28,26,18,27);g.lineTo(-18,27);
    g.bezierCurveTo(-28,27,-36,20,-36,10);g.bezierCurveTo(-36,5,-34,2,-30,2);g.closePath();};
  corps();g.fillStyle=c;g.fill();
  g.save();corps();g.clip();
  const lu=g.createRadialGradient(0,-10,4,0,0,60);lu.addColorStop(0,'rgba(255,255,255,.45)');lu.addColorStop(.5,'rgba(255,255,255,0)');lu.addColorStop(1,'rgba(60,30,20,.0)');g.fillStyle=lu;g.fillRect(-50,-60,120,100);
  const ve=g.createLinearGradient(0,6,0,26);ve.addColorStop(0,'rgba(60,30,20,0)');ve.addColorStop(1,'rgba(60,30,20,.38)');g.fillStyle=ve;g.fillRect(-50,0,120,30);
  g.strokeStyle='rgba(70,40,30,.22)';g.lineWidth=1.2;g.beginPath();g.moveTo(22,4);g.quadraticCurveTo(15,14,24,23);g.moveTo(-20,6);g.quadraticCurveTo(-28,12,-24,23);g.stroke();
  g.fillStyle='rgba(255,255,255,.55)';g.beginPath();g.ellipse(46,-34,6,2,.9,0,7);g.fill();g.beginPath();g.ellipse(-16,3,9,2,-.1,0,7);g.fill();
  g.restore();corps();g.strokeStyle=OL;g.lineWidth=1.6;g.stroke();
  /* les jambes du côté proche : devant repliées, derrière tendues */
  jambe([[-24,20],[-38,30],[-52,32]],10,6.5,c);jambe([[22,18],[36,26],[28,36]],9,6,c);
  /* le tapis de selle, à franges d'or */
  g.fillStyle='#1f3a7a';g.beginPath();g.moveTo(-18,0);g.lineTo(12,-1);g.lineTo(10,14);for(let k=0;k<6;k++)g.quadraticCurveTo(7-k*5,18,4-k*5.4,14);g.lineTo(-18,14);g.closePath();g.fill();g.strokeStyle=OL;g.lineWidth=1.2;g.stroke();
  g.strokeStyle='#e8b830';g.lineWidth=1.4;g.beginPath();g.moveTo(-16,12);for(let k=0;k<6;k++)g.quadraticCurveTo(7-k*5-3,16,4-k*5.4,12.5);g.stroke();
  for(let k=0;k<6;k++){g.fillStyle='#f2c84a';g.beginPath();g.arc(6-k*5.2,16.5,1.3,0,7);g.fill();}
  /* la selle rouge, son troussequin et son pommeau */
  g.fillStyle='#b8262a';g.beginPath();g.moveTo(-15,-6);g.quadraticCurveTo(-13,0,-2,0);g.quadraticCurveTo(8,0,11,-6);g.lineTo(13,-1);g.quadraticCurveTo(0,4,-17,0);g.closePath();g.fill();g.strokeStyle=OL;g.lineWidth=1.2;g.stroke();
  g.fillStyle='#ff6a5a';g.beginPath();g.ellipse(-3,-1,7,1.3,0,0,7);g.fill();g.fillStyle='#e8b830';g.beginPath();g.arc(11.5,-6.2,2,0,7);g.fill();g.beginPath();g.arc(-15,-6.5,2,0,7);g.fill();
  /* l'étrier */
  g.strokeStyle='#e8b830';g.lineWidth=1.2;g.beginPath();g.moveTo(-2,2);g.lineTo(-3,20);g.stroke();g.strokeRect(-6,20,6,3);
  /* le poitrail : une sangle bleue piquée de pierres */
  g.strokeStyle=OL;g.lineWidth=5;g.beginPath();g.moveTo(11,3);g.quadraticCurveTo(26,6,35,1);g.stroke();g.strokeStyle='#1f3a7a';g.lineWidth=3.4;g.stroke();
  for(let k=0;k<4;k++){const u=(k+.5)/4,bx=11+24*u,by=3+Math.sin(u*Math.PI)*2.2-u*2;g.fillStyle=['#e8443c','#f2c84a','#3aa05a','#e8443c'][k];g.beginPath();g.arc(bx,by,1.4,0,7);g.fill();}
  /* la crinière dorée, en mèches qui volent */
  for(let k=0;k<7;k++){const u=k/6,mx=31-u*19,my=-43+u*40,len=11-u*2;
    g.fillStyle=OL;g.beginPath();g.moveTo(mx+1,my-1);g.quadraticCurveTo(mx-len*.6,my-1,mx-len,my+len*.7);g.quadraticCurveTo(mx-len*.3,my+3,mx+2,my+4);g.fill();
    g.fillStyle=k%2?'#f2c050':'#e0a030';g.beginPath();g.moveTo(mx,my);g.quadraticCurveTo(mx-len*.55,my,mx-len+1.2,my+len*.6);g.quadraticCurveTo(mx-len*.3,my+2.4,mx+1.4,my+3);g.fill();
    g.strokeStyle='rgba(255,240,170,.9)';g.lineWidth=.8;g.beginPath();g.moveTo(mx-1,my+.8);g.quadraticCurveTo(mx-len*.45,my+1,mx-len*.8,my+len*.45);g.stroke();}
  g.fillStyle='#e0a030';g.beginPath();g.moveTo(33,-43);g.quadraticCurveTo(39,-43,41,-38);g.quadraticCurveTo(37,-40,33,-39);g.fill();
  /* la bride, la têtière dorée, les rênes */
  g.strokeStyle='#e8b830';g.lineWidth=1.6;g.beginPath();g.moveTo(35,-43);g.lineTo(42.5,-20);g.moveTo(41,-26);g.lineTo(55,-22);g.moveTo(47,-17);g.quadraticCurveTo(30,-10,12,-3);g.stroke();
  g.fillStyle='#f2c84a';g.beginPath();g.arc(42,-23,1.8,0,7);g.fill();g.fillStyle='#e8443c';g.beginPath();g.arc(36.8,-38,1.5,0,7);g.fill();
  /* l'œil, les naseaux, la bouche */
  g.fillStyle='#2a1a14';g.beginPath();g.ellipse(43,-33.5,2.2,1.7,.3,0,7);g.fill();g.fillStyle='#ffffff';g.beginPath();g.arc(43.6,-34.1,.75,0,7);g.fill();
  g.strokeStyle=OL;g.lineWidth=1;g.beginPath();g.moveTo(40.5,-36);g.quadraticCurveTo(43,-37,45.6,-35.4);g.stroke();
  g.fillStyle='rgba(70,40,30,.75)';g.beginPath();g.ellipse(54.6,-20.5,1.3,.8,.6,0,7);g.fill();g.strokeStyle=OL;g.lineWidth=.9;g.beginPath();g.moveTo(54.5,-16.8);g.lineTo(50,-17.2);g.stroke();
  /* le plumet */
  g.fillStyle=OL;g.beginPath();g.ellipse(32.5,-54,3.6,7.6,.35,0,7);g.fill();g.fillStyle=plume||'#e8443c';g.beginPath();g.ellipse(32.5,-54,2.6,6.6,.35,0,7);g.fill();g.fillStyle='rgba(255,255,255,.5)';g.beginPath();g.ellipse(31.6,-56,.9,3.6,.35,0,7);g.fill();
  g.restore();}
/* un point sur l'ellipse */
const EP=(X,Y,rx,ry,a)=>[X+Math.cos(a)*rx,Y+Math.sin(a)*ry];
function bandeCourbe(g,X,Y,rx,ry,h,a0,a1,fill){const n=10;g.beginPath();for(let k=0;k<=n;k++){const a=a0+(a1-a0)*k/n,[px,py]=EP(X,Y,rx,ry,a);if(k)g.lineTo(px,py);else g.moveTo(px,py);}
  for(let k=n;k>=0;k--){const a=a0+(a1-a0)*k/n,[px,py]=EP(X,Y,rx,ry,a);g.lineTo(px,py+h);}g.closePath();g.fillStyle=fill;g.fill();}
function dessinerCarrousel(g,ox,oy,t,devant){const {x,y,r}=CAR,X=x+ox,Y=y+oy,ry=r*.36,a0=t*.42,P=CPAL;
  const ty=Y-168,rt=r+16,rty=rt*.36,BH=24;
  if(!devant){ombre(g,X,Y+10,r+14,ry+10,.3);
    /* la marche de bois, tout autour */
    g.fillStyle='#9a7a52';g.beginPath();g.ellipse(X,Y+9,r+9,ry+5,0,0,7);g.fill();g.fillStyle='#c8a878';g.beginPath();g.ellipse(X,Y+7,r+9,ry+4,0,0,7);g.fill();g.strokeStyle='rgba(90,60,30,.35)';g.lineWidth=.8;for(let k=0;k<40;k++){const a=k/40*Math.PI*2;const [px,py]=EP(X,Y+7,r+9,ry+4,a);if(Math.sin(a)>0){g.beginPath();g.moveTo(px,py);g.lineTo(px,py+2);g.stroke();}}
    /* la jupe du plancher : des panneaux peints, cerclés d'or */
    bandeCourbe(g,X,Y-8,r,ry,14,0,Math.PI,P.jupe);
    for(let k=0;k<14;k++){const a=(k+.5)/14*Math.PI,[px,py]=EP(X,Y-8,r,ry,a),w=Math.max(1,Math.abs(Math.sin(a))*r*Math.PI/14*.62);
      g.fillStyle=P.jupe2;g.fillRect(px-w/2,py+3,w,8);g.strokeStyle='#e8b830';g.lineWidth=.8;g.strokeRect(px-w/2,py+3,w,8);if(w>6)rond(g,px,py+7,1.4,'#f2d27a');}
    bandeCourbe(g,X,Y-8,r,ry,1.6,0,Math.PI,'#f2d27a');bandeCourbe(g,X,Y+5,r,ry,1.4,0,Math.PI,'#a8782a');
    /* le plancher : des lames en rayons */
    const pl=g.createLinearGradient(0,Y-8-ry,0,Y-8+ry);pl.addColorStop(0,P.plancher[0]);pl.addColorStop(1,P.plancher[1]);g.fillStyle=pl;g.beginPath();g.ellipse(X,Y-8,r,ry,0,0,7);g.fill();
    g.save();g.beginPath();g.ellipse(X,Y-8,r,ry,0,0,7);g.clip();g.strokeStyle='rgba(120,90,60,.22)';g.lineWidth=.8;for(let k=0;k<24;k++){const a=a0+k/24*Math.PI*2;g.beginPath();g.moveTo(X,Y-8);g.lineTo(X+Math.cos(a)*r,Y-8+Math.sin(a)*ry);g.stroke();}
    for(const f of [.45,.75])g.beginPath(),g.ellipse(X,Y-8,r*f,ry*f,0,0,7),g.stroke();g.restore();
    g.strokeStyle='#e8b830';g.lineWidth=2;g.beginPath();g.ellipse(X,Y-8,r-1,ry-.5,0,0,7);g.stroke();
    /* la colonne centrale : miroirs et dorures */
    const cw=34;VG(g,X-cw/2,ty+BH,cw,Y-8-(ty+BH),'#f2d27a','#b8862a');
    for(let k=0;k<5;k++){const yy=ty+BH+8+k*25;const m=g.createLinearGradient(X-cw/2,0,X+cw/2,0);m.addColorStop(0,'#7a9ab8');m.addColorStop(.35,'#f4faff');m.addColorStop(.6,'#b8d0e4');m.addColorStop(1,'#5a7a98');
      for(const dx of [-12,0,12]){g.fillStyle=m;arrondi(g,X+dx-4.5,yy,9,19,4);g.fill();g.strokeStyle='#a8782a';g.lineWidth=.8;g.stroke();}}
    R2(g,X-cw/2,Y-22,cw,14,P.bande);R2(g,X-cw/2,Y-22,cw,1.5,'#f2d27a');ecrire(g,'♪',X,Y-15,9,'#f2d27a');
    /* le plafond, vu de dessous */
    g.fillStyle=P.bande2;g.beginPath();g.ellipse(X,ty+BH,rt-2,rty-1,0,Math.PI,0);g.fill();
    for(let k=0;k<16;k++){const a=Math.PI+k/16*Math.PI,a2=Math.PI+(k+1)/16*Math.PI;g.fillStyle=k%2?'rgba(255,255,255,.08)':'rgba(0,0,0,.1)';g.beginPath();g.moveTo(X,ty+BH);const [p1x,p1y]=EP(X,ty+BH,rt-2,rty-1,a),[p2x,p2y]=EP(X,ty+BH,rt-2,rty-1,a2);g.lineTo(p1x,p1y);g.lineTo(p2x,p2y);g.fill();}
  }
  /* les chevaux et leurs barres torsadées */
  for(let i=0;i<8;i++){const a=a0+i/8*Math.PI*2,s=Math.sin(a);if((s>0)!==!!devant)continue;
    const hx=X+Math.cos(a)*(r-24),hy=Y-8+s*(ry-9),bob=Math.sin(t*2.6+i*1.7)*6,dir=Math.cos(a+Math.PI/2)>0?1:-1,sc=.92+.12*(s+1)/2;
    const top=ty+BH+s*(rty-6)+2;chevalBois(g,hx,hy-20+bob,CHEV[i],dir,sc*1.35,['#e8443c','#2f7fd0','#3aa05a','#f2c84a'][i%4]);
g.fillStyle=OR(g,hx-1.6,hx+1.6);g.fillRect(hx-1.5,top,3,hy-top);
    g.fillStyle='rgba(120,70,10,.45)';for(let yy=top+((t*20)%6);yy<hy;yy+=6){g.beginPath();g.moveTo(hx-1.5,yy);g.lineTo(hx+1.5,yy-2.4);g.lineTo(hx+1.5,yy-1.2);g.lineTo(hx-1.5,yy+1.2);g.fill();}
    rond(g,hx,top+1,2,'#f2d27a');
    }
  if(devant){
    /* le toit : un chapiteau rayé, aux pans légèrement bombés */
    const ap=ty-62;
    for(let k=0;k<16;k++){const a=Math.PI*(k/16),a2=Math.PI*((k+1)/16);if(Math.sin((a+a2)/2)<-.01)continue;
      const [p1x,p1y]=EP(X,ty,rt,rty,a),[p2x,p2y]=EP(X,ty,rt,rty,a2);g.fillStyle=P.toit[k%2];g.beginPath();g.moveTo(X,ap);
      g.quadraticCurveTo((X+p2x)/2+(p2x-X)*.08,(ap+p2y)/2+6,p2x,p2y);g.lineTo(p1x,p1y);g.quadraticCurveTo((X+p1x)/2+(p1x-X)*.08,(ap+p1y)/2+6,X,ap);g.fill();}
    for(let k=0;k<16;k++){const a=Math.PI+k/16*Math.PI;}
    /* l'ombre et la lumière du toit */
    const sh=g.createLinearGradient(X-rt,0,X+rt,0);sh.addColorStop(0,'rgba(0,0,0,.22)');sh.addColorStop(.38,'rgba(255,255,255,.18)');sh.addColorStop(.55,'rgba(255,255,255,0)');sh.addColorStop(1,'rgba(0,0,0,.28)');
    g.fillStyle=sh;g.beginPath();g.moveTo(X,ap);g.quadraticCurveTo(X+rt*.6,ap+40,X+rt,ty);g.ellipse(X,ty,rt,rty,0,0,Math.PI);g.quadraticCurveTo(X-rt*.6,ap+40,X,ap);g.fill();
    /* le bandeau : des tableaux encadrés d'or, avec des miroirs */
    bandeCourbe(g,X,ty,rt,rty,BH,0,Math.PI,P.bande);
    for(let k=0;k<12;k++){const a=(k+.5)/12*Math.PI,[px,py]=EP(X,ty,rt,rty,a),w=Math.abs(Math.sin(a))*rt*Math.PI/12*.78;if(w<3)continue;
      g.fillStyle='#e8b830';arrondi(g,px-w/2-1,py+3,w+2,BH-6,3);g.fill();
      if(k%2){const m=g.createLinearGradient(px-w/2,0,px+w/2,0);m.addColorStop(0,'#8aa8c4');m.addColorStop(.4,'#f6fbff');m.addColorStop(1,'#6a8aa8');g.fillStyle=m;}else g.fillStyle=P.panneau;
      arrondi(g,px-w/2+.5,py+4.5,w-1,BH-9,2.5);g.fill();
      if(!(k%2)&&w>10){ell(g,px,py+BH/2,w*.18,3.2,'#c8322a');ell(g,px-w*.22,py+BH/2+1,w*.1,2,'#3aa05a');ell(g,px+w*.22,py+BH/2+1,w*.1,2,'#3aa05a');}}
    bandeCourbe(g,X,ty,rt,rty,2,0,Math.PI,'#f2d27a');bandeCourbe(g,X,ty+BH-2,rt,rty,2,0,Math.PI,'#a8782a');
    /* les festons sous le bandeau */
    for(let k=0;k<24;k++){const a=(k+.5)/24*Math.PI,[px,py]=EP(X,ty+BH,rt,rty,a),w=Math.abs(Math.sin(a))*rt*Math.PI/24;if(w<2)continue;g.fillStyle=k%2?P.toit[0]:'#f2d27a';g.beginPath();g.arc(px,py,w/2,0,Math.PI);g.fill();}
    /* la crête : des écussons dorés au bord du toit */
    for(let k=0;k<12;k++){const a=k/12*Math.PI,[px,py]=EP(X,ty,rt,rty,a);if(Math.sin(a)<.05&&k)continue;g.fillStyle=OR(g,px-5,px+5);g.beginPath();g.moveTo(px-5,py+1);g.quadraticCurveTo(px-5,py-8,px,py-11);g.quadraticCurveTo(px+5,py-8,px+5,py+1);g.fill();rond(g,px,py-4,1.6,['#c8322a','#2f7fd0','#3aa05a'][k%3]);}
    /* les ampoules qui courent */
    for(let k=0;k<30;k++){const a=k/29*Math.PI,[px,py]=EP(X,ty,rt,rty,a);ampoule(g,px,py+1,((k+Math.floor(t*6))%3)!==0);const [qx,qy]=EP(X,ty+BH,rt,rty,a);ampoule(g,qx,qy,((k+1+Math.floor(t*6))%3)!==0);}
    /* le sommet : une boule d'or, un fanion */
    g.fillStyle=OR(g,X-8,X+8);g.beginPath();g.moveTo(X-9,ap+3);g.quadraticCurveTo(X,ap-6,X+9,ap+3);g.fill();rond(g,X,ap-6,5.5,'#e8b830');rond(g,X-1.6,ap-7.6,1.8,'#fff4c0');
    g.fillStyle='#8a90a0';g.fillRect(X-.7,ap-34,1.4,28);const fl=Math.sin(t*4)*2;g.fillStyle='#c8322a';g.beginPath();g.moveTo(X+.7,ap-34);g.quadraticCurveTo(X+10,ap-32+fl,X+20,ap-29+fl);g.lineTo(X+.7,ap-24);g.fill();
    lum(g,X,Y-150,170,'rgba(255,210,150,1)');lum(g,X-100,ty+10,90,'rgba(255,140,140,1)');lum(g,X+100,ty+10,90,'rgba(255,230,160,1)');}}

/* ---------- LES AUTO-TAMPONNEUSES ---------- */
const AUTOS=[];for(let i=0;i<6;i++)AUTOS.push({x:TAMP.x0+50+hA(i,1,9)*(TAMP.x1-TAMP.x0-100),y:TAMP.y0+40+hA(i,2,9)*(TAMP.y1-TAMP.y0-80),a:hA(i,3,9)*6.28,v:46+hA(i,4,9)*30,c:COUL[(i*3)%8],choc:0});
let tAuto=0;
function bougerAutos(dt){for(const A of AUTOS){A.a+=(hA(Math.floor(tAuto*.5),AUTOS.indexOf(A),5)-.5)*dt*1.6;A.x+=Math.cos(A.a)*A.v*dt;A.y+=Math.sin(A.a)*A.v*dt*.7;
   if(A.x<TAMP.x0+26||A.x>TAMP.x1-26){A.a=Math.PI-A.a;A.x=Math.max(TAMP.x0+26,Math.min(TAMP.x1-26,A.x));A.choc=.3;}
   if(A.y<TAMP.y0+26||A.y>TAMP.y1-10){A.a=-A.a;A.y=Math.max(TAMP.y0+26,Math.min(TAMP.y1-10,A.y));A.choc=.3;}A.choc=Math.max(0,A.choc-dt);}
  for(let i=0;i<AUTOS.length;i++)for(let j=i+1;j<AUTOS.length;j++){const a=AUTOS[i],b=AUTOS[j],dx=b.x-a.x,dy=(b.y-a.y)*1.4,d=Math.hypot(dx,dy);if(d<38&&d>0){const t=a.a;a.a=b.a;b.a=t;a.x-=dx/d*3;b.x+=dx/d*3;a.y-=dy/d*2;b.y+=dy/d*2;a.choc=b.choc=.35;}}}
const PERSOS_AUTO=[{peau:2,cheveux:1,coiffe:2,haut:1,veste:'#e8302a'},{peau:5,cheveux:0,coiffe:3,haut:0,veste:'#2a3a5a'},{peau:1,cheveux:3,coiffe:5,haut:3,veste:'#ff9ab8'},{peau:4,cheveux:6,coiffe:1,haut:1,veste:'#ffd24a'},{peau:3,cheveux:2,coiffe:0,haut:4,veste:'#7ee08a'},{peau:6,cheveux:7,coiffe:6,haut:0,veste:'#9a7aff'}];
function dessinerAuto(g,A,ox,oy,i,t){const X=A.x+ox,Y=A.y+oy,dir=Math.cos(A.a)>=0?1:-1;
  ombre(g,X,Y+3,25,7,.3);
  ell(g,X,Y-2,25,9,'#1e1e24');ell(g,X,Y-4,24,7.5,'#3a3a44');
  try{const ap=Object.assign({bas:0,pantalon:'#2a2a34',souliers:0,chaussures:0,sac:0,chapeau:0,raye:0,motif:0,barbe:0,_civil:true},PERSOS_AUTO[i]);
    g.save();g.beginPath();g.rect(X-30,Y-64,60,52);g.clip();personne(g,X-dir*3,Y+4,ap,dir>0?'droite':'gauche',0,false);g.restore();}catch(z){}
  g.fillStyle=A.c;g.beginPath();g.moveTo(X-20,Y-6);g.quadraticCurveTo(X-21,Y-17,X-12,Y-17);g.lineTo(X+dir*4,Y-17);g.quadraticCurveTo(X+dir*20,Y-22,X+dir*21,Y-8);g.lineTo(X+20,Y-6);g.closePath();g.fill();
  const q=g.createLinearGradient(0,Y-20,0,Y-4);q.addColorStop(0,'rgba(255,255,255,.55)');q.addColorStop(.3,'rgba(255,255,255,0)');q.addColorStop(1,'rgba(0,0,0,.35)');g.fillStyle=q;g.fill();
  g.fillStyle='rgba(255,255,255,.55)';g.fillRect(X-14,Y-16,10,1.6);rond(g,X+dir*18,Y-11,2,'#fff6d0');
  g.strokeStyle='#c8ccd8';g.lineWidth=1.2;g.beginPath();g.moveTo(X-dir*13,Y-16);g.lineTo(X-dir*13,Y-74);g.stroke();
  if(A.choc>0||hA(Math.floor(t*12),i,2)<.1){g.fillStyle='#fff6a0';for(let k=0;k<5;k++)g.fillRect(X-dir*13+(hA(k,Math.floor(t*30),i)-.5)*10,Y-76+(hA(k,i,Math.floor(t*30))-.5)*6,1.4,1.4);}}

/* ---------- LES PLATANES DU PRADO ---------- */
function platane(){const L=150,HH=190,{c,g,R}=toile(L,HH),cx=L/2,s=HH-6;ombre(g,cx+10,s,48,10,.24);
  for(let y=s;y>s-108;y-=.5){const t=(s-y)/108,x=cx+Math.sin(t*2.4)*4-t*3,w=9-t*3;R(x-w/2,y,w,.6,'#b8ad90');if(hA((y*2)|0,1,3)<.35)R(x-w/2+hA((y*2)|0,2,3)*w*.6,y,w*.4,.6,['#8a9a6a','#d8ceb4','#9a8a6a'][(hA((y*2)|0,3,3)*3)|0]);R(x+w/2-1.2,y,1.2,.6,'rgba(60,50,30,.35)');}
  g.strokeStyle='#a89a7a';g.lineWidth=3;for(const [dx,dy] of [[-30,-26],[28,-22],[-6,-34],[12,-36]]){const x0=cx-3,y0=s-100;g.beginPath();g.moveTo(x0,y0);g.quadraticCurveTo(x0+dx*.4,y0+dy*.7,x0+dx,y0+dy);g.stroke();}
  const t=(x,y,r,col)=>{g.fillStyle=col;g.beginPath();g.ellipse(x,y,r,r*.78,0,0,7);g.fill();};const C0=s-136;
  for(let i=0;i<60;i++){const a=i*2.399,rr=Math.sqrt(i/60)*56;t(cx+Math.cos(a)*rr,C0+14+Math.sin(a)*rr*.55,13,'#3a5a2a');}
  for(let i=0;i<70;i++){const a=i*2.399,rr=Math.sqrt(i/70)*52;t(cx-4+Math.cos(a)*rr,C0+4+Math.sin(a)*rr*.5,11,'#4f7a36');}
  for(let i=0;i<46;i++){const a=i*2.399,rr=Math.sqrt(i/46)*42;t(cx-10+Math.cos(a)*rr,C0-4+Math.sin(a)*rr*.45,8,'#6a9a44');}
  for(let i=0;i<26;i++){const a=i*2.399,rr=Math.sqrt(i/26)*30;t(cx-16+Math.cos(a)*rr,C0-10+Math.sin(a)*rr*.4,5,'#8ab85a');}
  for(let i=0;i<50;i++){const a=i*2.399,rr=Math.sqrt(i/50)*50;R(cx-6+Math.cos(a)*rr,C0+Math.sin(a)*rr*.5,1.5,1.2,'#a8cc72');}
  return c;}
let PLATANE=null;
const PLATANES=[[40,Y0+28],[560,Y0+30],[1240,Y0+30],[1760,Y0+28],[40,1380],[520,1390],[1280,1390],[1760,1380]];

/* ---------- LES PETITS COMMERCES ---------- */
const CONFISERIE=(()=>{const L=124,HH=128,{c,g,R}=toile(L,HH),s=HH-4,cx=L/2;ombre(g,cx,s,56,5,.25);
  VG(g,8,52,L-16,s-52,'#f6efe8','#e8d8d0');for(let x=8;x<L-8;x+=11)R(x,52,5,s-52,'rgba(240,120,160,.35)');
  for(let i=0;i<8;i++){g.fillStyle=i%2?'#ffffff':'#f07aa0';g.beginPath();g.moveTo(i*15.5+2,32);g.lineTo(i*15.5+13.5,32);g.lineTo(i*15.5+15.5,50);g.lineTo(i*15.5,50);g.fill();}for(let i=0;i<8;i++){g.fillStyle=i%2?'#ffffff':'#f07aa0';g.beginPath();g.arc(i*15.5+7.75,50,7.75,0,Math.PI);g.fill();}
  VG(g,0,32,L,18,'rgba(255,255,255,.3)','rgba(0,0,0,.12)');
  g.fillStyle='#a8782a';arrondi(g,14,4,L-28,28,8);g.fill();g.fillStyle='#f07aa0';arrondi(g,17,6.5,L-34,23,6);g.fill();ecrire(g,'BARBE À PAPA',cx,18.5,10,'#ffffff','rgba(120,20,60,.6)');
  R(10,92,L-20,8,'#a86a3a');R(10,92,L-20,1.5,'#d89a60');
  for(let k=0;k<4;k++){const x=24+k*25,col=['#ffaad0','#a8dcff','#ffffff','#ffc8e4'][k];g.strokeStyle='#e8d8b0';g.lineWidth=1.5;g.beginPath();g.moveTo(x,90);g.lineTo(x,80);g.stroke();
    for(let j=0;j<9;j++)ell(g,x+(hA(k,j,1)-.5)*10,72+(hA(k,j,2)-.5)*9,5,4,col);ell(g,x-3,69,3,2,'rgba(255,255,255,.8)');}
  return c;})();
const CAMION=(()=>{const L=176,HH=116,{c,g,R}=toile(L,HH),s=HH-4;ombre(g,L/2,s,82,6,.28);
  const q=g.createLinearGradient(0,30,0,96);q.addColorStop(0,'#fbf6ec');q.addColorStop(1,'#e6dcc8');g.fillStyle=q;arrondi(g,4,30,L-8,66,10);g.fill();
  R(4,80,L-8,10,'#c8322a');R(4,80,L-8,1.5,'#e86a5a');R(4,40,L-8,4,'#c8322a');
  R(22,46,108,30,'#5a3622');VG(g,24,48,104,26,'#fbe8c8','#e2c49a');
  for(let k=0;k<6;k++){const x=34+k*17;g.strokeStyle='#8a5a32';g.lineWidth=1;g.beginPath();g.moveTo(x,58);g.lineTo(x,50);g.stroke();rond(g,x,63,5,'#c8222a');g.fillStyle='rgba(255,255,255,.55)';g.beginPath();g.arc(x-1.8,61.5,1.6,0,7);g.fill();}
  R(140,46,28,30,'#5a3622');const v=g.createLinearGradient(0,48,0,74);v.addColorStop(0,'#cfeaf6');v.addColorStop(1,'#8ac0dc');g.fillStyle=v;g.fillRect(142,48,24,26);R(142,48,8,26,'rgba(255,255,255,.3)');
  g.fillStyle='#a8782a';arrondi(g,12,2,L-24,28,8);g.fill();g.fillStyle='#c8322a';arrondi(g,15,4.5,L-30,23,6);g.fill();ecrire(g,'CHURROS · POMMES D’AMOUR',L/2,16.5,9,'#ffffff','rgba(90,10,10,.6)');
  for(const x of [34,142]){rond(g,x,s-8,11,'#1e1e24');rond(g,x,s-8,7,'#5a5e68');rond(g,x,s-8,3,'#d8dce6');}
  return c;})();
const PINCES=(()=>{const L=156,HH=116,{c,g,R}=toile(L,HH),s=HH-4;ombre(g,L/2,s,74,5,.25);
  for(let i=0;i<3;i++){const x=i*52+2,col=['#c8322a','#2a6ac8','#6a34b8'][i];
    g.fillStyle=col;arrondi(g,x,10,48,s-10,5);g.fill();const q=g.createLinearGradient(x,0,x+48,0);q.addColorStop(0,'rgba(0,0,0,.1)');q.addColorStop(.3,'rgba(255,255,255,.3)');q.addColorStop(.5,'rgba(255,255,255,0)');q.addColorStop(1,'rgba(0,0,0,.35)');g.fillStyle=q;arrondi(g,x,10,48,s-10,5);g.fill();
    R(x+6,22,36,42,'#1a2a40');const v=g.createLinearGradient(0,22,0,64);v.addColorStop(0,'#3a5a8a');v.addColorStop(1,'#1a2a40');g.fillStyle=v;g.fillRect(x+7,23,34,40);
    for(let k=0;k<6;k++)peluche(g,x+13+(k%3)*11,52+((k/3)|0)*6,.9,['#f08ab0','#f2c232','#8ac8f0','#7ad08a','#a88af0','#f0a060'][(k+i)%6]);
    g.strokeStyle='#d8dce6';g.lineWidth=1;g.beginPath();g.moveTo(x+24,24);g.lineTo(x+24,36);g.moveTo(x+20,40);g.lineTo(x+24,36);g.lineTo(x+28,40);g.stroke();
    g.fillStyle='rgba(255,255,255,.3)';g.beginPath();g.moveTo(x+8,23);g.lineTo(x+16,23);g.lineTo(x+8,40);g.fill();
    R(x+6,70,36,16,'#2a2a34');rond(g,x+15,78,3.6,'#e83a2a');rond(g,x+14,77,1.2,'#ffa090');R(x+27,75,9,6,'#f2c232');R(x+9,90,30,12,'#14141a');
    g.fillStyle='#f2c232';arrondi(g,x+6,1,36,12,4);g.fill();ecrire(g,'PINCE',x+24,7.2,7,col);}
  return c;})();
const BALLONS=[[0,0,'#d8382e'],[-12,6,'#f2b632'],[12,5,'#2f7fd0'],[-6,-12,'#f07aa0'],[8,-11,'#3aa05a'],[-18,-6,'#8a5ad8'],[18,-6,'#f0882a'],[0,-22,'#22a0a0']];
function ballon(g,bx,by,c){g.fillStyle=c;g.beginPath();g.ellipse(bx,by,5.5,6.6,0,0,7);g.fill();g.beginPath();g.moveTo(bx-1.2,by+6.2);g.lineTo(bx+1.2,by+6.2);g.lineTo(bx,by+8);g.fill();g.fillStyle='rgba(255,255,255,.6)';g.beginPath();g.ellipse(bx-2,by-2.6,1.4,2.2,-.4,0,7);g.fill();}
function dessinerBallons(g,X,Y,t){g.strokeStyle='rgba(240,240,248,.85)';g.lineWidth=.5;for(const [dx,dy] of BALLONS){const bx=X+dx+Math.sin(t*1.3+dx)*2,by=Y-70+dy+Math.sin(t*1.7+dy)*1.5;g.beginPath();g.moveTo(X+3,Y-22);g.quadraticCurveTo(X+dx*.3,Y-40,bx,by+8);g.stroke();}
  for(const [dx,dy,c] of BALLONS)ballon(g,X+dx+Math.sin(t*1.3+dx)*2,Y-70+dy+Math.sin(t*1.7+dy)*1.5,c);}
const TABLE=(()=>{const L=80,HH=80,{c,g,R}=toile(L,HH),s=HH-3,cx=L/2;ombre(g,cx,s,30,5,.22);
  /* deux chaises de bistrot */
  for(const dx of [-22,22]){R(cx+dx-5,s-16,10,2.5,'#c8322a');R(cx+dx-5,s-28,2,14,'#8a1a1a');R(cx+dx+(dx<0?-5:3),s-14,1.5,14,'#2a2a30');R(cx+dx+(dx<0?3:-5),s-14,1.5,14,'#2a2a30');}
  /* la table ronde */
  R(cx-1,s-20,2,20,'#2a2a30');R(cx-7,s-2,14,2,'#2a2a30');ell(g,cx,s-21,14,4,'#f4ecdc');ell(g,cx,s-22,14,3.6,'#ffffff');
  ell(g,cx-4,s-23,2,1.2,'#e8b830');R(cx+3,s-27,3,5,'#f07aa0');
  /* le parasol rayé */
  R(cx-.8,s-66,1.6,46,'#e8e0d0');for(let k=0;k<8;k++){g.fillStyle=k%2?'#f6efe0':'#c8322a';g.beginPath();g.moveTo(cx,s-72);g.lineTo(cx-34+k*8.5,s-56);g.lineTo(cx-34+(k+1)*8.5,s-56);g.fill();}
  for(let k=0;k<8;k++){g.fillStyle=k%2?'#f6efe0':'#c8322a';g.beginPath();g.arc(cx-29.75+k*8.5,s-56,4.25,0,Math.PI);g.fill();}
  rond(g,cx,s-73,1.6,'#e8b830');return c;})();
const TERRASSE=[[1440,1150],[1600,1150],[1520,1260],[1680,1260]];
const BANC=(()=>{const L=64,HH=30,{c,g,R}=toile(L,HH),s=HH-3;ombre(g,L/2,s,30,3,.22);R(6,s-10,3,10,'#2a3a32');R(L-9,s-10,3,10,'#2a3a32');for(let k=0;k<3;k++){R(3,s-22+k*4,L-6,3,'#a8703a');R(3,s-22+k*4,L-6,.8,'#d09a5a');}R(3,s-12,L-6,3,'#94602e');return c;})();
const LAMPADAIRE=(()=>{const L=24,HH=100,{c,g,R}=toile(L,HH),s=HH-3,cx=L/2;ombre(g,cx,s,8,2.5,.25);
  R(cx-4,s-8,8,8,'#24382e');R(cx-1.6,s-76,3.2,70,'#2a4034');R(cx-1.6,s-76,1,70,'#4a6a5a');R(cx-3,s-40,6,3,'#24382e');
  g.fillStyle='#24382e';g.beginPath();g.moveTo(cx-8,s-76);g.lineTo(cx+8,s-76);g.lineTo(cx+5,s-92);g.lineTo(cx-5,s-92);g.fill();
  const v=g.createLinearGradient(0,s-90,0,s-78);v.addColorStop(0,'#fff8dc');v.addColorStop(1,'#f2d890');g.fillStyle=v;g.fillRect(cx-4.5,s-89,9,12);R(cx-6,s-95,12,3,'#24382e');rond(g,cx,s-97,2,'#24382e');return c;})();
const LAMPES=[[120,700],[480,700],[120,1080],[480,1080],[1280,1060],[1760,1060],[1280,640],[1760,640],[CX-104,1360],[CX+104,1360]];

/* ---------- L'ARCHE D'ENTRÉE ---------- */
const ARCHE=(()=>{const L=270,HH=196,{c,g,R}=toile(L,HH),X=L/2,s=HH-4;
  for(const sd of [-1,1]){const x=X+sd*108;ombre(g,x,s,14,4,.28);VG(g,x-9,46,18,s-46,'#f2d27a','#c8962a');g.save();g.beginPath();g.rect(x-9,46,18,s-46);g.clip();g.strokeStyle='#c8322a';g.lineWidth=5;for(let y=30;y<s+20;y+=16){g.beginPath();g.moveTo(x-12,y+12);g.lineTo(x+12,y);g.stroke();}g.restore();R(x-7,46,2.5,s-46,'rgba(255,255,255,.4)');
    rond(g,x,40,12,'#a8782a');rond(g,x,40,10,'#f2d27a');rond(g,x-3,37,3.5,'#fff6d0');}
  g.lineWidth=28;g.strokeStyle='#a8782a';g.beginPath();g.ellipse(X,82,120,60,0,Math.PI*1.04,Math.PI*1.96);g.stroke();g.lineWidth=24;g.strokeStyle='#1f3a7a';g.beginPath();g.ellipse(X,82,120,60,0,Math.PI*1.04,Math.PI*1.96);g.stroke();
  g.lineWidth=1.5;g.strokeStyle='#f2d27a';for(const d of [-11,11]){g.beginPath();g.ellipse(X,82,120+d,60+d,0,Math.PI*1.04,Math.PI*1.96);g.stroke();}
  ecrire(g,'FÊTE FORAINE',X,28,16,'#ffe9a8','rgba(0,0,0,.6)');ecrire(g,'DU PRADO',X,46,9,'#ffffff','rgba(0,0,0,.6)');
  return c;})();
const ARCHE_AMP=[];for(let k=0;k<28;k++){const a=Math.PI*1.05+k/27*Math.PI*.9;ARCHE_AMP.push([135+Math.cos(a)*134,82+Math.sin(a)*74]);}

/* ---------- LES ACTEURS : tout ce qui bouge ou se superpose, trié par profondeur ---------- */
let tPrec=0;
const now=()=>performance.now()/1000;
const D2=(g,img,x,y,w,h)=>{g.imageSmoothingEnabled=true;g.drawImage(img,x,y,w,h);};
const MARCHAND={peau:3,cheveux:0,coiffe:2,barbe:3,haut:2,veste:'#d82a2a',bas:0,pantalon:'#2a2a3a',souliers:1,chaussures:'#1a1a1a',sac:0,chapeau:0,raye:1,motif:0,_civil:true,_lot:'f_chapeau'};
const FILE=[{peau:2,cheveux:3,coiffe:5,haut:1,veste:'#3a9ad8'},{peau:5,cheveux:0,coiffe:2,haut:0,veste:'#e8302a'},{peau:1,cheveux:6,coiffe:4,haut:3,veste:'#ffd24a',_lot:'f_ballon'},{peau:4,cheveux:2,coiffe:1,haut:1,veste:'#5ec04a'}].map(a=>Object.assign({bas:0,pantalon:'#2a2a3a',souliers:1,chaussures:'#f2f2f2',sac:0,chapeau:0,raye:0,motif:0,barbe:0,_civil:true},a));
function acteurs(){const L=[];if(!PLATANE)PLATANE=platane();
  L.push({y:Y0-60,f:(g,camX,camY)=>dessinerRoue(g,-camX,-camY,now())});
  L.push({y:Y0-2,f:(g,camX,camY)=>D2(g,CABANE,CX-85-camX,Y0-104-camY,170,104)});
  for(const B of BAR)L.push({y:B.y,f:(g,camX,camY)=>{const ox=B.x-BW/2-camX,oy=B.y-BH-camY;D2(g,fac(B),ox,oy,BW,BH);ampoulesBaraque(g,B,ox,oy,now());for(const fx of [40,BW/2,BW-40])lum(g,ox+fx,oy+120,95);lum(g,ox+BW/2,oy+20,70,'rgba(255,240,200,1)');}});
  for(const [x,y] of PLATANES)L.push({y,f:(g,camX,camY)=>D2(g,PLATANE,x-75-camX,y-184-camY,150,190)});
  L.push({y:CAR.y-CAR.r*.36-8,f:(g,camX,camY)=>dessinerCarrousel(g,-camX,-camY,now(),false)});
  L.push({y:CAR.y+CAR.r*.36,f:(g,camX,camY)=>dessinerCarrousel(g,-camX,-camY,now(),true)});
  L.push({y:TAMP.y0-12,f:(g,camX,camY)=>{const X0=TAMP.x0-camX,X1=TAMP.x1-camX,Yt=TAMP.y0-12-camY;for(const x of [X0-8,X1+2])VG(g,x,Yt-150,6,150,'#e8ecf2','#a8b0bc');VG(g,X0-10,Yt-158,X1-X0+20,8,'#2a3a6a','#1a2448');}});
  AUTOS.forEach((A,i)=>L.push({get y(){return A.y;},f:(g,camX,camY)=>{const t=now();if(i===0){const dt=Math.min(.05,t-(tPrec||t));tPrec=t;tAuto+=dt;bougerAutos(dt);}dessinerAuto(g,A,-camX,-camY,i,t);}}));
  L.push({y:TAMP.y1+16,f:(g,camX,camY)=>{const X0=TAMP.x0-camX,X1=TAMP.x1-camX,Yb=TAMP.y1+16-camY,t=now();
    for(const x of [X0-10,X1+4]){VG(g,x,Yb-220,7,220,'#ffffff','#a8b0bc');R2(g,x+5,Yb-220,2,220,'rgba(0,0,0,.18)');}
    g.fillStyle='#a8782a';arrondi(g,X0-18,Yb-246,X1-X0+36,32,6);g.fill();VG(g,X0-15,Yb-243,X1-X0+30,26,'#2a4a9a','#1a2a6a');
    ecrire(g,'AUTO-TAMPONNEUSES',(X0+X1)/2,Yb-230,15,'#ffe9a8','rgba(0,0,0,.6)');
    for(let k=0;k<30;k++){const x=X0-12+k*(X1-X0+24)/29;ampoule(g,x,Yb-246,((k+Math.floor(t*6))%3)===0);ampoule(g,x,Yb-214,((k+1+Math.floor(t*6))%3)===0);}
    lum(g,(X0+X1)/2,Yb-228,120,'rgba(140,190,255,1)');lum(g,X0+60,Yb-110,140,'rgba(120,170,255,1)');lum(g,X1-60,Yb-110,140,'rgba(255,140,200,1)');}});
  L.push({y:1250,f:(g,camX,camY)=>{D2(g,CONFISERIE,CX-240-62-camX,1250-124-camY,124,128);lum(g,CX-240-camX,1250-60-camY,90,'rgba(255,150,200,1)');}});
  L.push({y:1300,f:(g,camX,camY)=>{const X=CX+150-camX,Y=1300-camY;try{personne(g,X,Y,MARCHAND,'bas',0,false);}catch(z){}dessinerBallons(g,X,Y,now());}});
  L.push({y:1220,f:(g,camX,camY)=>{const X=300-78-camX,Y=1220-112-camY;D2(g,PINCES,X,Y,156,116);const t=now();for(let i=0;i<3;i++){const on=((i+Math.floor(t*3))%2)===0;g.fillStyle=on?'rgba(255,246,208,.9)':'rgba(200,160,80,.5)';g.fillRect(X+i*52+8,Y+11,32,1.6);lum(g,X+i*52+25,Y+45,70,['rgba(255,100,100,1)','rgba(110,170,255,1)','rgba(190,130,255,1)'][i]);}}});
  L.push({y:1250,f:(g,camX,camY)=>{D2(g,CAMION,CX+240-88-camX,1250-112-camY,176,116);lum(g,CX+240-camX,1250-60-camY,100,'rgba(255,200,150,1)');}});
  for(const [x,y] of TERRASSE)L.push({y,f:(g,camX,camY)=>D2(g,TABLE,x-40-camX,y-76-camY,80,80)});
  for(const [x,y] of [[300,1060],[150,600],[460,600],[1530,1040]])L.push({y,f:(g,camX,camY)=>D2(g,BANC,x-32-camX,y-27-camY,64,30)});
  for(const [x,y] of LAMPES)L.push({y,f:(g,camX,camY)=>{const X=x-12-camX,Y=y-97-camY;D2(g,LAMPADAIRE,X,Y,24,100);lum(g,X+12,Y+14,120,'rgba(255,236,170,1)');}});
  L.push({y:H+40,f:(g,camX,camY)=>{const t=now();const P=[[CX-104,580],[CX+104,700],[CX-104,840],[CX+104,970],[CX-104,1110],[CX+104,1240]];
    for(let i=0;i<P.length-1;i++){const a=P[i],b=P[i+1],n=18;g.strokeStyle='rgba(40,30,30,.8)';g.lineWidth=.8;g.beginPath();
      for(let k=0;k<=n;k++){const u=k/n,x=a[0]+(b[0]-a[0])*u-camX,y=a[1]+(b[1]-a[1])*u-150+Math.sin(u*Math.PI)*18-camY;if(k)g.lineTo(x,y);else g.moveTo(x,y);}g.stroke();
      for(let k=1;k<n;k++){const u=k/n,x=a[0]+(b[0]-a[0])*u-camX,y=a[1]+(b[1]-a[1])*u-150+Math.sin(u*Math.PI)*18-camY,on=Math.sin(t*2.6+k+i*2)>0;ampoule(g,x,y+2.5,on,COUL[(k+i)%8]);if(on&&k%3===0)lum(g,x,y+3,34);}}
    for(const [x,y] of P){const X=x-camX,Y=y-camY;VG(g,X-1.5,Y-152,3,152,'#4a6a5a','#24382e');ell(g,X,Y,4,1.6,'rgba(40,30,20,.3)');}}});
  L.push({y:Y0+40,f:(g,camX,camY)=>{const t=now(),M=[40,300,560,760,1040,1240,1500,1760];for(let i=0;i<M.length-1;i++){const a=M[i],b=M[i+1],n=Math.round((b-a)/16);g.strokeStyle='rgba(40,30,30,.8)';g.lineWidth=.8;g.beginPath();
      for(let k=0;k<=n;k++){const u=k/n,x=a+(b-a)*u-camX,y=Y0-94+Math.sin(u*Math.PI)*24-camY;if(k)g.lineTo(x,y);else g.moveTo(x,y);}g.stroke();
      for(let k=1;k<n;k++){const u=k/n,x=a+(b-a)*u-camX,y=Y0-94+Math.sin(u*Math.PI)*24-camY,on=Math.sin(t*2.2+k*.9+i)>.1;ampoule(g,x,y+2.5,on,COUL[(k+i)%8]);if(on&&k%3===0)lum(g,x,y+3,34);}}
    for(const x of M){const X=x-camX,Y=Y0+18-camY;VG(g,X-2,Y-112,4,112,'#4a6a5a','#24382e');ell(g,X,Y,5,2,'rgba(40,30,20,.3)');}}});
  for(let k=0;k<4;k++)L.push({y:Y0+56+k*2,f:(g,camX,camY)=>{try{personne(g,CX+40+k*16-camX,Y0+56+k*2-camY,FILE[k],'haut',0,false);}catch(z){}}});
  for(const P of GENS)if(P.ballon)L.push({get y(){return P.y+1;},f:(g,camX,camY)=>{const X=P.x-camX,Y=P.y-camY,t=now(),bx=X+8+Math.sin(t*1.3+P.dec)*2,by=Y-72;g.strokeStyle='rgba(240,240,248,.85)';g.lineWidth=.5;g.beginPath();g.moveTo(X+6,Y-24);g.quadraticCurveTo(X+10,Y-48,bx,by+8);g.stroke();ballon(g,bx,by,P.ballon);}});
  L.push({y:H-6,f:(g,camX,camY)=>{const X=CX-135-camX,Y=H-6-196-camY;D2(g,ARCHE,X,Y,270,196);const t=now();for(let k=0;k<ARCHE_AMP.length;k++){const [x,y]=ARCHE_AMP[k];ampoule(g,X+x,Y+y,((k+Math.floor(t*6))%3)===0);}lum(g,X+135,Y+40,130,'rgba(255,220,150,1)');}});
  return L;}

/* ---------- LES PROMENEURS ---------- */
const D8=a=>{const k=Math.round(a/(Math.PI/4));return {0:'droite',1:'bas-droite',2:'bas',3:'bas-gauche',4:'gauche','-4':'gauche','-3':'haut-gauche','-2':'haut','-1':'haut-droite'}[k];};
const CAD=(()=>{try{return CADENCE_PAS;}catch(x){return 0.09;}})();
const GENS=[];
(()=>{const TOURS=[
  {pts:[[CX-40,1320],[CX-40,600],[CX+40,600],[CX+40,1320]],v:30},
  {pts:[[CX+30,560],[CX+30,1300],[CX-30,1300],[CX-30,560]],v:27},
  {pts:[[120,640],[480,640],[500,1080],[120,1080]],v:24},
  {pts:[[1290,1000],[1760,1000],[1760,660],[1290,660]],v:26},
  {pts:[[CX-50,760],[560,760],[560,1040],[CX-50,1040]],v:22},
  {pts:[[40,520],[1760,520]],v:32},
  {pts:[[CX+50,760],[1240,760],[1240,1040],[CX+50,1040]],v:25},
  {pts:[[1760,540],[40,540]],v:28},
  {pts:[[CX-60,1300],[200,1300],[200,1140],[CX-60,1120]],v:23},
  {pts:[[CX+60,1300],[1380,1320],[1760,1100],[CX+60,1100]],v:25},
  {pts:[[480,640],[CX-60,600],[CX-60,1300],[480,1300]],v:21},
  {pts:[[1300,620],[CX+60,600],[CX+60,1200],[1300,1200]],v:27}];
  const AP=[{peau:2,cheveux:2,coiffe:3,barbe:2,haut:0,veste:'#c0392b',pantalon:'#1a1a22'},{peau:5,cheveux:0,coiffe:0,haut:1,veste:'#2a3a5a',pantalon:'#5a6a7a'},{peau:1,cheveux:7,coiffe:1,haut:3,veste:'#f5c430',pantalon:'#2a3a5a'},
   {peau:3,cheveux:3,coiffe:5,haut:1,veste:'#ff9ab8',pantalon:'#3a3a5a'},{peau:6,cheveux:4,coiffe:2,haut:0,veste:'#7ee08a',pantalon:'#2a2a34'},{peau:4,cheveux:1,coiffe:6,barbe:3,haut:2,veste:'#9a7aff',pantalon:'#1a1a22'},{peau:2,cheveux:6,coiffe:4,haut:1,veste:'#ff9a4a',pantalon:'#4a3a2a'},{peau:1,cheveux:5,coiffe:3,haut:0,veste:'#2ab0a0',pantalon:'#2a2a34'},
   {peau:3,cheveux:1,coiffe:2,haut:1,veste:'#e8302a',pantalon:'#2a3a5a'},{peau:5,cheveux:3,coiffe:5,haut:3,veste:'#ffd24a',pantalon:'#3a2a20'},{peau:2,cheveux:4,coiffe:0,barbe:2,haut:0,veste:'#2a3a5a',pantalon:'#1a1a22'},{peau:6,cheveux:6,coiffe:3,haut:1,veste:'#ff9ab8',pantalon:'#2a2a34'}];
  const BAL=['#d8382e',null,'#f2b632',null,'#2f7fd0',null,'#f07aa0',null,null,'#3aa05a',null,null];const LOT=[null,'f_chapeau',null,'f_coeur',null,null,null,'f_peluche','f_couronne',null,'f_chapeau',null];
  TOURS.forEach((T,i)=>{let L=0;const seg=[];for(let k=0;k<T.pts.length;k++){const a=T.pts[k],b=T.pts[(k+1)%T.pts.length],d=Math.hypot(b[0]-a[0],b[1]-a[1]);seg.push([a,b,L,d]);L+=d;}
   GENS.push({tour:{seg,L,v:T.v},dec:i*1.7,court:false,ballon:BAL[i],ap:Object.assign({bas:0,souliers:1,chaussures:'#f2f2f2',sac:0,chapeau:0,raye:0,motif:0,barbe:0,_civil:true},AP[i],LOT[i]?{_lot:LOT[i]}:{}),x:0,y:0,dir:'bas',pas:0});});})();
function figurants(){const n=Date.now()/1000;
  for(const P of GENS){const T=P.tour,d=(n*T.v+P.dec*100)%T.L;for(const [a,b,L0,dd] of T.seg){if(d<=L0+dd){const t=(d-L0)/dd;P.x=a[0]+(b[0]-a[0])*t;P.y=a[1]+(b[1]-a[1])*t;P.dir=D8(Math.atan2(b[1]-a[1],b[0]-a[0]));break;}}P.pas=(n*T.v+P.dec*100)*CAD;}
  return GENS;}

/* ---------- LES JEUX ---------- */
async function jouer(k){try{if(!window.ouvrirForain)eval(await chargerMorceau('forain.js'));window.ouvrirForain(k);}catch(x){console.warn('FORAIN',x);}}
function decor(){const D=[];const P=(t,x,y,o)=>D.push(Object.assign({t,x,y,gr:0},o||{}));
  for(const B of BAR)P('x_jol_pst_vide_sol',B.x,B.y+30,{col:[1,1],demi:70,agir:()=>jouer(B.k),libelle:B.k==='lots'?'Échanger mes tickets':(B.k==='peche'?'Pêcher':'Jouer'),nom:B.nom});
  P('x_jol_pst_vide_sol',CX,Y0+34,{col:[1,1],demi:70,agir:()=>jouer('roue'),libelle:'Faire un tour',nom:'GRANDE ROUE'});
  return D;}
const GRAVEURS={x_jol_pst_vide_sol:()=>({toile:document.createElement('canvas'),W:1,H:1,sol:0})};
function graver(t,v){const r=(GRAVEURS[t]||GRAVEURS.x_jol_pst_vide_sol)(v||0);return {toile:r.toile,W:r.W,H:r.H,sol:r.sol};}

function bloque(x,y){
  if(x<12||x>W-12)return true;
  if(y<Y0+20)return true;
  if(((x-CAR.x)/(CAR.r+10))**2+((y-CAR.y)/(CAR.r*.42+8))**2<1)return true;
  if(x>TAMP.x0-16&&x<TAMP.x1+16&&y>TAMP.y0-16&&y<TAMP.y1+18)return true;
  for(const B of BAR)if(Math.abs(x-B.x)<112&&y>B.y-44&&y<B.y+6)return true;
  if(Math.abs(x-(CX-240))<60&&y>1222&&y<1254)return true;
  if(Math.abs(x-(CX+240))<84&&y>1222&&y<1254)return true;
  if(Math.abs(x-300)<76&&y>1192&&y<1224)return true;
  for(const [tx,ty] of TERRASSE)if(Math.abs(x-tx)<26&&y>ty-12&&y<ty+2)return true;
  for(const [px,py] of PLATANES)if(Math.abs(x-px)<9&&Math.abs(y-py)<6)return true;
  if(y>H-44&&Math.abs(x-CX)>52)return true;
  if(y>H-4)return true;
  return false;}

let PARTI=false;
setInterval(()=>{try{if(PARTI||typeof joueur==='undefined')return;if(joueur.y>H-12)sortir();}catch(x){}},150);
function sortir(){if(PARTI)return;PARTI=true;try{sauver();}catch(x){}
  try{const f=document.createElement('div');f.style.cssText='position:fixed;inset:0;z-index:2147483000;background:#fff8ea;opacity:0;transition:opacity .45s;pointer-events:none';document.body.appendChild(f);requestAnimationFrame(()=>f.style.opacity='1');}catch(x){}
  setTimeout(()=>{const v=window.MA_VERSION?('&v='+encodeURIComponent(window.MA_VERSION)):'';location.href='spawn.html?de=foire'+v;},480);}

return {sol,solFin,decor,bloque,graver,depart:DEPART,figurants,acteurs};
})()
