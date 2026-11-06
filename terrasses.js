/* =====================================================================
   L'INTÉRIEUR DES TERRASSES DU PORT — le rez-de-chaussée, autour de l'atrium.
   Même logique de vue que la place : le mur du fond monte à la verticale
   (rez-de-chaussée, puis le balcon du +1, puis celui du +2) ; tout le reste
   est posé au sol. Les boutiques sont vides : « À LOUER ».
   Chargé par moteur.js (eval direct) quand spawn.html?lieu=terrasses.
   ===================================================================== */
(()=>{
const W=800, H=800, Y0=410, ETAGE=128;
const Q=(()=>{try{return new URLSearchParams(location.search);}catch(x){return new URLSearchParams('');}})();
const ETG=Q.get('lieu')==='terrasses1';                 /* l'étage +1 */
const DEPART=ETG?[600,578]:(Q.get('de')==='etage'?[78,540]:[400,740]), SORTIE_X=400, SORTIE_DEMI=46;
const BLEU='#1f3fa8', BLEU2='#2a6ad0';
const hA=(x,y,k)=>{let n=((x*73856093)^(y*19349663)^(k*83492791))|0;n=(n^(n>>>13))*1274126177|0;return((n^(n>>>16))>>>0)/4294967296;};
const lin=(g,x0,y0,x1,y1,st)=>{const gr=g.createLinearGradient(x0,y0,x1,y1);st.forEach(([o,c])=>gr.addColorStop(o,c));return gr;};
const R=(g,x,y,w,h,c)=>{g.fillStyle=c;g.fillRect(x,y,w,h);};
function toile(L,HH){const D=2,c=document.createElement('canvas');c.width=Math.ceil(L*D);c.height=Math.ceil(HH*D);const g=c.getContext('2d');g.setTransform(D,0,0,D,0,0);return {c,g};}

/* ---------- LE MUR DU FOND ---------- */
function plafond(g,x,y,w,h){g.fillStyle=lin(g,0,y,0,y+h,[[0,'#cdb79a'],[1,'#e2d2bc']]);g.fillRect(x,y,w,h);
  for(let i=0;i<w/22;i++)for(let j=0;j<h/14;j++){const px=x+8+i*22+(j%2)*11,py=y+5+j*14;g.fillStyle='rgba(255,240,200,.25)';g.beginPath();g.ellipse(px,py+1,5,2,0,0,7);g.fill();R(g,px-1,py-.5,2,1,'#fffbe8');}}
function soffite(g,x,y,w,h){g.fillStyle=lin(g,0,y,0,y+h,[[0,'#b9a284'],[1,'#d8c6ac']]);g.fillRect(x,y,w,h);
  for(let xx=x+12;xx<x+w;xx+=26){g.fillStyle='rgba(255,240,200,.35)';g.beginPath();g.ellipse(xx,y+h-1.5,6,2,0,0,7);g.fill();R(g,xx-1,y+h/2,2,1,'#fffbe8');}}
function nez(g,x0,x1,y){R(g,x0,y,x1-x0,10,'#f7f5f1');R(g,x0,y,x1-x0,1,'#ffffff');R(g,x0,y+8,x1-x0,2,'#d8d4cc');
  g.fillStyle='rgba(205,232,240,.33)';g.fillRect(x0,y-15,x1-x0,15);R(g,x0,y-16,x1-x0,2,'#8e969c');R(g,x0,y-16,x1-x0,.5,'#fff');
  for(let x=x0+20;x<x1;x+=40)R(g,x,y-15,.6,15,'rgba(255,255,255,.5)');}
function vitrine(g,x,y,w,h){
  R(g,x,y,w,h,'#2c2e32');R(g,x+2,y+2,w-4,h*.14,'#1c1e22');R(g,x+2,y+2+h*.07,w-4,.5,'rgba(255,255,255,.12)');
  const vy=y+4+h*.14,vh=h-6-h*.14;
  g.fillStyle=lin(g,0,vy,0,vy+vh,[[0,'#56646f'],[.55,'#7c8e9a'],[1,'#aebcc6']]);g.fillRect(x+2,vy,w-4,vh);
  /* l'intérieur vide, deviné : un sol clair, un fond plus sombre */
  R(g,x+2,vy+vh*.72,w-4,vh*.28,'rgba(230,224,214,.35)');
  g.save();g.beginPath();g.rect(x+2,vy,w-4,vh);g.clip();g.fillStyle='rgba(255,255,255,.13)';
  for(let k=0;k<3;k++){const bx=x+w*.1+k*w*.33;g.beginPath();g.moveTo(bx,vy);g.lineTo(bx+vh*.3,vy);g.lineTo(bx+vh*.3-vh*.5,vy+vh);g.lineTo(bx-vh*.5,vy+vh);g.fill();}g.restore();
  const nm=Math.max(1,Math.round(w/40));for(let k=1;k<=nm;k++)R(g,x+2+(w-4)*k/(nm+1)-.6,vy,1.2,vh,'#2c2e32');
  const pw=Math.min(w*.5,48),ph=Math.max(8,Math.min(15,vh*.2)),px=x+w/2-pw/2,py=vy+vh*.32;
  R(g,px+.8,py+.8,pw,ph,'rgba(0,0,0,.25)');R(g,px,py,pw,ph,'#fbf8f0');R(g,px,py,pw,ph*.2,BLEU);
  g.fillStyle='#1e2a3a';g.font='bold '+(ph*.46).toFixed(1)+'px "Helvetica Neue",Arial,sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText('À LOUER',px+pw/2,py+ph*.62);
  R(g,x,y+h-1,w,1,'rgba(0,0,0,.3)');}
function niveau(g,y,n){R(g,0,y,W,110,'#ece6dc');const p=(W-8)/n;
  for(let k=0;k<n;k++)vitrine(g,8+k*p,y+4,p-8,106);
  for(let k=0;k<=n;k++){const x=k*p;g.fillStyle=lin(g,x,0,x+8,0,[[0,'#dcd8d0'],[.5,'#f8f6f0'],[1,'#d0ccc4']]);g.fillRect(x,y,8,110);}}

/* ---------- LE SOL ---------- */
function peindreSol(g){
  plafond(g,0,0,W,26);
  niveau(g,26,6);soffite(g,0,136,W,10);
  nez(g,0,W,146);niveau(g,156,5);soffite(g,0,266,W,10);
  nez(g,0,W,276);niveau(g,286,5);soffite(g,0,396,W,14);R(g,0,Y0-2,W,2,'rgba(0,0,0,.28)');
  /* les grandes dalles de pierre claire, posées en quinconce */
  R(g,0,Y0,W,H-Y0,'#e4ddd2');
  for(let y=Y0;y<H;y+=30)for(let x=-((((y-Y0)/30)|0)%2)*30;x<W;x+=60){
    R(g,x+.4,y+.4,59.2,29.2,['#e9e3d9','#e1dacf','#ece7de','#e5dfd4'][(((x/60)|0)+(((y-Y0)/30)|0)*3)%4]);
    g.strokeStyle='rgba(160,150,135,.18)';g.lineWidth=.4;g.beginPath();const s=hA(x|0,y|0,3);g.moveTo(x+s*60,y+2);g.bezierCurveTo(x+20,y+12,x+40*s,y+18,x+58,y+8+s*18);g.stroke();}
  g.strokeStyle='rgba(150,140,125,.35)';g.lineWidth=.5;for(let y=Y0;y<H;y+=30){g.beginPath();g.moveTo(0,y);g.lineTo(W,y);g.stroke();}
  /* le reflet des vitrines dans la pierre lustrée */
  const p=(W-8)/5;for(let k=0;k<5;k++){g.fillStyle=lin(g,0,Y0,0,Y0+70,[[0,'rgba(90,110,130,.22)'],[1,'rgba(90,110,130,0)']]);g.fillRect(12+k*p,Y0,p-16,70);}
  /* une bande de laiton : la route maritime incrustée, et la rose des vents */
  g.strokeStyle='#b89a5a';g.lineWidth=1.4;g.beginPath();g.moveTo(0,690);g.bezierCurveTo(160,640,260,720,400,676);g.bezierCurveTo(540,632,640,700,W,660);g.stroke();
  g.fillStyle=BLEU;for(let k=0;k<4;k++){const a=k*Math.PI/2;g.beginPath();g.moveTo(400+Math.cos(a)*20,676+Math.sin(a)*9);g.lineTo(400+Math.cos(a+.6)*4,676+Math.sin(a+.6)*2);g.lineTo(400,676);g.fill();}
  g.strokeStyle='#b89a5a';g.lineWidth=.7;g.beginPath();g.ellipse(400,676,15,7,0,0,7);g.stroke();
  /* les murs latéraux */
  R(g,0,Y0,6,H-Y0,'#d8d2c6');R(g,W-6,Y0,6,H-Y0,'#d8d2c6');
  /* l'entrée au sud : seuil et paillasson devant les portes coulissantes */
  R(g,SORTIE_X-60,H-22,120,22,'#45454c');for(let x=SORTIE_X-58;x<SORTIE_X+58;x+=4)R(g,x,H-20,2,18,'#55555e');
  R(g,SORTIE_X-62,H-24,124,2,'#a8adb2');
}
function sol(){const c=document.createElement('canvas');c.width=W;c.height=H;(ETG?peindreEtage:peindreSol)(c.getContext('2d'));return c;}
function solFin(){const c=document.createElement('canvas');c.width=W*2;c.height=H*2;const g=c.getContext('2d');g.setTransform(2,0,0,2,0,0);(ETG?peindreEtage:peindreSol)(g);return c;}

/* ---------- LES ESCALATORS ET LEUR PALIER ---------- */
const EX0=150, EX1=380, GY1=470, GY2=508, PROF=28;
function pictos(g,x0,x1,gy,T,mot){
  const H2=ETAGE;g.save();const ang=Math.atan2(-H2,x1-x0);g.translate(x0+(x1-x0)*.5,gy-H2*.5+T*.55);g.rotate(ang);
  g.fillStyle=BLEU;g.strokeStyle=BLEU;g.lineWidth=1.8;g.lineCap='round';g.lineJoin='round';
  g.font='bold 10px "Helvetica Neue",Arial,sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText(mot,14,.5);
  for(let k=0;k<3;k++){g.beginPath();g.moveTo(-104+k*7,-3.5);g.lineTo(-100+k*7,0);g.lineTo(-104+k*7,3.5);g.stroke();}
  for(let k=0;k<2;k++){g.beginPath();g.moveTo(-78,-2+k*4);g.bezierCurveTo(-74,-6+k*4,-70,2+k*4,-64,-2+k*4);g.stroke();}
  g.beginPath();g.moveTo(-52,0);g.lineTo(-49,-3);g.lineTo(-46,0);g.lineTo(-49,3);g.closePath();g.fill();
  g.beginPath();g.moveTo(84,0);g.bezierCurveTo(88,-4,92,4,96,0);g.stroke();
  g.restore();}
function escalier(g,ox,oy,x0,x1,gy,mot,sens){
  x0-=ox;x1-=ox;gy-=oy;const Hh=ETAGE,D=PROF,T=16,y1=gy-Hh;
  /* l'ombre portée au sol */
  g.fillStyle='rgba(30,26,20,.16)';g.beginPath();g.moveTo(x0-16,gy+3);g.lineTo(x1,gy+3);g.lineTo(x1+10,gy-D+3);g.lineTo(x0-16,gy-D+3);g.fill();
  /* les jupes inox, de part et d'autre des marches */
  const bande=(o,w,c)=>{g.fillStyle=c;g.beginPath();g.moveTo(x0,gy-o);g.lineTo(x1,y1-o);g.lineTo(x1,y1-o-w);g.lineTo(x0,gy-o-w);g.fill();};
  bande(D-3,3,'#c4c9ce');bande(0,3,'#c4c9ce');
  /* les marches : chaque giron strié, l'arête claire, le contremarche sombre */
  const n=40;
  for(let k=0;k<n;k++){const t=k/n,t2=(k+1)/n,xa=x0+(x1-x0)*t,xb=x0+(x1-x0)*t2,ya=gy-Hh*t,yb=gy-Hh*t2,top=3,bot=D-3;
    g.fillStyle='#6c7782';g.beginPath();g.moveTo(xa,ya-top);g.lineTo(xa,yb-top);g.lineTo(xa,yb-bot);g.lineTo(xa,ya-bot);g.fill();   /* contremarche */
    g.fillStyle=lin(g,0,ya-bot,0,ya-top,[[0,'#8e9aa6'],[1,'#a8b4c0']]);g.beginPath();g.moveTo(xa,yb-top);g.lineTo(xb,yb-top);g.lineTo(xb,yb-bot);g.lineTo(xa,yb-bot);g.fill();
    for(let s=yb-bot+2;s<yb-top;s+=2.2){g.fillStyle='rgba(50,60,70,.35)';g.fillRect(xa,s,xb-xa,.5);}
    R(g,xb-.7,yb-bot,.7,bot-top,'#e8d870');   /* la ligne jaune du nez de marche */
  }
  /* peignes d'entrée et de sortie, plaques striées */
  const plaque=(x,y)=>{R(g,x,y-D,18,D,'#bfc4c9');R(g,x,y-D,18,1,'#eef0f2');for(let k=0;k<6;k++)R(g,x+2+k*2.6,y-D+3,.6,D-6,'#8e959c');R(g,x+16,y-D+2,2,D-4,'#e8d870');};
  plaque(x0-18,gy);plaque(x1,y1);
  /* le garde-corps du fond : verre, main courante noire, nez arrondis */
  const verre=(o,dev)=>{g.fillStyle='rgba(205,232,240,.30)';g.beginPath();g.moveTo(x0-8,gy-o);g.lineTo(x1+6,y1-o);g.lineTo(x1+6,y1-o-15);g.lineTo(x0-8,gy-o-15);g.fill();
    g.strokeStyle='rgba(255,255,255,.55)';g.lineWidth=.5;g.beginPath();g.moveTo(x0-4,gy-o-3);g.lineTo(x1+2,y1-o-3);g.stroke();
    g.strokeStyle='#121216';g.lineWidth=2.6;g.lineCap='round';g.beginPath();g.moveTo(x0-8,gy-o-15);g.lineTo(x1+6,y1-o-15);g.stroke();
    g.strokeStyle='rgba(255,255,255,.35)';g.lineWidth=.5;g.beginPath();g.moveTo(x0-8,gy-o-15.8);g.lineTo(x1+6,y1-o-15.8);g.stroke();
    g.fillStyle='#121216';g.beginPath();g.ellipse(x0-9,gy-o-8,2.8,7.8,0,0,7);g.fill();g.beginPath();g.ellipse(x1+7,y1-o-8,2.8,7.8,0,0,7);g.fill();
    if(dev){R(g,x0-12,gy-o-1,8,2,'#2a2a2e');}};
  verre(D-1,false);
  /* le flanc blanc, côté sud, et l'habillage qui descend jusqu'au sol sous la partie haute */
  g.fillStyle=lin(g,0,y1,0,gy+T,[[0,'#ffffff'],[1,'#e8e8e4']]);
  g.beginPath();g.moveTo(x0-8,gy);g.lineTo(x1+6,y1);g.lineTo(x1+6,y1+T);g.lineTo(x0+30,gy-6);g.lineTo(x0+30,gy+2);g.lineTo(x0-8,gy+2);g.fill();
  const xp=x1-74,yp=y1+T+(74/(x1-x0))*Hh;
  g.fillStyle='#f6f6f2';g.beginPath();g.moveTo(xp,yp);g.lineTo(x1+6,y1+T);g.lineTo(x1+6,gy);g.lineTo(xp,gy);g.fill();
  g.fillStyle='rgba(0,0,0,.07)';g.fillRect(xp,gy-5,x1+6-xp,5);R(g,xp,yp,1,gy-yp,'rgba(0,0,0,.08)');
  R(g,x0-8,gy,x0+38-x0,2,'#9aa0a6');
  pictos(g,x0,x1,gy,T,mot);
  /* le garde-corps de devant */
  verre(0,true);
  /* le socle noir de départ */
  R(g,x0-22,gy,24,4,'#2e3034');R(g,x0-22,gy,24,1,'#6a6e74');
}
let TESC=null;
function graverEscalators(){if(TESC)return TESC;
  const ox=EX0-40, top=GY1-ETAGE-PROF-40-140, Wd=(EX1+140)-ox, Hd=GY2+12-top, sol=GY2-top;
  const {c,g}=toile(Wd,Hd);
  /* LE PALIER DU +1, qui s'avance au-dessus de la galerie et reçoit les escalators */
  const lx=EX1+4-ox, lw=124, ly=276-top, lb=GY2-ETAGE-top;
  g.fillStyle=lin(g,0,ly,0,lb,[[0,'#ebe6dc'],[1,'#f2eee6']]);g.fillRect(lx,ly+10,lw,lb-ly-10);
  for(let y=ly+16;y<lb;y+=10)R(g,lx,y,lw,.4,'rgba(150,140,125,.3)');
  /* garde-corps du palier, côté est */
  g.fillStyle='rgba(205,232,240,.33)';g.fillRect(lx+lw-3,ly+10,3,lb-ly-10);
  /* nez de dalle du palier, soffite, poteau */
  R(g,lx,lb,lw,10,'#f7f5f1');R(g,lx,lb,lw,1,'#ffffff');R(g,lx,lb+8,lw,2,'#d8d4cc');
  g.fillStyle='rgba(205,232,240,.33)';g.fillRect(lx+18,lb-15,lw-18,15);R(g,lx+18,lb-16,lw-18,2,'#8e969c');
  g.fillStyle=lin(g,0,lb+10,0,lb+18,[[0,'#b9a284'],[1,'#d8c6ac']]);g.fillRect(lx,lb+10,lw,8);
  for(let x=lx+14;x<lx+lw;x+=26){g.fillStyle='rgba(255,240,200,.35)';g.beginPath();g.ellipse(x,lb+16.5,6,2,0,0,7);g.fill();}
  const px=lx+lw-14;g.fillStyle=lin(g,px,0,px+10,0,[[0,'#d8d4cc'],[.4,'#fbfaf6'],[1,'#c8c4bc']]);g.fillRect(px,lb+18,10,sol-(lb+18));
  g.fillStyle='rgba(30,26,20,.18)';g.beginPath();g.ellipse(px+8,sol+1,10,3,0,0,7);g.fill();
  /* les deux escalators : celui du fond monte, celui de devant descend */
  escalier(g,ox,top,EX0,EX1,GY1,'LA TERRASSE',1);
  escalier(g,ox,top,EX0,EX1,GY2,'LA TERRASSE',-1);
  /* les potelets inox à disque bleu, au départ */
  for(const [x,y,d] of [[EX0-34,GY1-6,0],[EX0-34,GY2-6,1],[EX0-34,GY2+6,0]]){const X=x-ox,Y=y-top;
    g.fillStyle='rgba(30,26,20,.2)';g.beginPath();g.ellipse(X+2,Y,5,1.6,0,0,7);g.fill();
    g.fillStyle=lin(g,X-2.5,0,X+2.5,0,[[0,'#8a8e94'],[.4,'#f0f2f4'],[1,'#7a7e84']]);g.fillRect(X-2.5,Y-34,5,34);R(g,X-3,Y-35,6,2,'#c8ccd0');
    if(d){g.fillStyle=BLEU;g.beginPath();g.arc(X,Y-28,6.5,0,7);g.fill();g.strokeStyle='#fff';g.lineWidth=.9;g.beginPath();g.arc(X,Y-28,4.4,0,7);g.stroke();
      g.fillStyle='#fff';g.beginPath();g.moveTo(X-2,Y-30);g.lineTo(X+2.5,Y-28);g.lineTo(X-2,Y-26);g.fill();}}
  TESC={toile:c,W:Wd,H:Hd,sol,ox};return TESC;}

/* ---------- LA TOUR DES ASCENSEURS PANORAMIQUES ---------- */
const TX=640, TB=560, TW=110, TD=56;
let TTOUR=null;
function graverTour(){if(TTOUR)return TTOUR;const Wd=TW+30,Hd=TB+14,sol=TB;const {c,g}=toile(Wd,Hd);const x=8;
  g.fillStyle='rgba(30,26,20,.2)';g.fillRect(x+6,sol-TD+4,TW,TD);
  /* le socle au sol, vu de dessus */
  R(g,x-4,sol-TD-4,TW+8,TD+8,'#dcd8d0');R(g,x,sol-TD,TW,TD,'#c8ccd0');
  /* la cage de verre, face sud */
  g.fillStyle='rgba(222,238,244,.42)';g.fillRect(x,0,TW,sol);
  /* la charpente blanche : montants, traverses, contreventements */
  for(const dx of [0,TW/2,TW]){g.fillStyle=lin(g,x+dx-3,0,x+dx+3,0,[[0,'#e2e2de'],[.5,'#ffffff'],[1,'#d6d6d2']]);g.fillRect(x+dx-3,0,6,sol);}
  for(let y=sol;y>0;y-=46){R(g,x,y-4,TW,4,'#f6f6f2');R(g,x,y-4,TW,.8,'#ffffff');R(g,x,y,TW,.8,'rgba(0,0,0,.08)');}
  /* les rails et les câbles des deux cabines */
  for(const dx of [TW*.25,TW*.75]){R(g,x+dx-.6,0,1.2,sol,'#b8bec4');R(g,x+dx-9,0,1.6,sol,'#e4e6e8');R(g,x+dx+8,0,1.6,sol,'#e4e6e8');
    for(let y=8;y<sol;y+=14)R(g,x+dx-11,y,22,1.2,'#eceef0');}
  /* le panneau bleu de signalétique, sur la face est */
  R(g,x+TW+2,sol-170,18,80,BLEU2);R(g,x+TW+4,sol-166,14,10,'#fff');R(g,x+TW+5,sol-150,12,1.4,'#d8e8ff');R(g,x+TW+5,sol-145,10,1.4,'#d8e8ff');R(g,x+TW+5,sol-140,12,1.4,'#d8e8ff');
  g.fillStyle=BLEU;g.font='bold 7px Arial';g.textAlign='center';g.fillText('P2',x+TW+11,sol-158);
  R(g,x+TW+4,sol-122,14,10,'#fff');g.fillStyle=BLEU;g.fillText('+1',x+TW+11,sol-114);
  /* les portes palières, au sol */
  for(const dx of [TW*.25,TW*.75]){R(g,x+dx-15,sol-44,30,40,'rgba(200,225,235,.5)');R(g,x+dx-.5,sol-44,1,40,'#a8b0b8');R(g,x+dx-16,sol-46,32,2,'#c8ccd0');}
  TTOUR={toile:c,W:Wd,H:Hd,sol,x0:x};return TTOUR;}
function cabine(g,x,y,w){R(g,x,y,w,34,'rgba(196,226,238,.6)');R(g,x,y,w,2.5,'#f2f4f6');R(g,x+1,y+2,1.2,32,'#e8eaec');R(g,x+w-2.2,y+2,1.2,32,'#e8eaec');
  R(g,x+3,y+20,w-6,.8,'#d0d4d8');/* main courante */
  g.fillStyle='#f6f6f2';g.beginPath();g.moveTo(x-3,y+34);g.lineTo(x+w+3,y+34);g.lineTo(x+w-4,y+46);g.lineTo(x+4,y+46);g.fill();
  R(g,x+w/2-7,y+38,10,2.4,BLEU);R(g,x+w/2+5,y+38,3,2.4,BLEU);
  R(g,x+4,y+16,5,18,'#2a2a34');R(g,x+4,y+9,5,8,'#c84a3a');g.fillStyle='#e0b896';g.beginPath();g.arc(x+6.5,y+7,2.4,0,7);g.fill();
  R(g,x+w-11,y+17,5,17,'#3a3a44');R(g,x+w-11,y+10,5,8,'#e8e4dc');g.fillStyle='#d8a888';g.beginPath();g.arc(x+w-8.5,y+8,2.4,0,7);g.fill();}
function dessinerTour(g,o,x,y){const t=graverTour();const X0=Math.round(x-t.W/2),Y0=Math.round(y-t.sol);g.drawImage(t.toile,X0,Y0,t.W,t.H);
  const s=Date.now()/1000;
  for(const [k,dx] of [[0,TW*.25],[1,TW*.75]]){const a=(Math.sin(s*.22+k*2.3)+1)/2, ymin=-120, ymax=t.sol-48, cy=ymax-(ymax-ymin)*(a*a*(3-2*a));
    cabine(g,X0+t.x0+dx-15,Y0+cy,30);}}

/* ---------- LE MOBILIER : palmiers en bacs blancs, bancs de bois ---------- */
let TPALM=null;
function graverPalmier(){if(TPALM)return TPALM;const Wd=80,Hd=100,sol=94,x=40;const {c,g}=toile(Wd,Hd);
  g.fillStyle='rgba(30,26,20,.2)';g.beginPath();g.ellipse(x+4,sol+1,18,4.5,0,0,7);g.fill();
  g.fillStyle=lin(g,x-15,0,x+15,0,[[0,'#d8d6d0'],[.35,'#fbfaf7'],[1,'#c8c6c0']]);g.beginPath();g.moveTo(x-15,sol-20);g.lineTo(x+15,sol-20);g.lineTo(x+12,sol);g.lineTo(x-12,sol);g.fill();
  g.fillStyle='#ffffff';g.beginPath();g.ellipse(x,sol-20,15,4.5,0,0,7);g.fill();g.fillStyle='#5a4632';g.beginPath();g.ellipse(x,sol-20,12.5,3.3,0,0,7);g.fill();
  g.strokeStyle='#8a6e50';g.lineWidth=3;g.beginPath();g.moveTo(x,sol-21);g.quadraticCurveTo(x+4,sol-46,x+2,sol-70);g.stroke();
  for(let y=sol-24;y>sol-68;y-=4){g.strokeStyle='rgba(60,40,20,.35)';g.lineWidth=.6;g.beginPath();g.moveTo(x-1+(sol-y)*.03,y);g.lineTo(x+2+(sol-y)*.03,y-1);g.stroke();}
  for(let k=0;k<11;k++){const a=-Math.PI/2+(k-5)*.38;const L=26+(k%3)*4;
    g.strokeStyle=['#24502a','#346838','#4e8648'][k%3];g.lineWidth=2.8;g.lineCap='round';g.beginPath();g.moveTo(x+2,sol-70);
    g.quadraticCurveTo(x+2+Math.cos(a)*L*.5,sol-70+Math.sin(a)*L*.5-6,x+2+Math.cos(a)*L,sol-70+Math.sin(a)*L*.55+10);g.stroke();
    g.strokeStyle='rgba(160,210,120,.5)';g.lineWidth=.6;g.beginPath();g.moveTo(x+2,sol-71);g.quadraticCurveTo(x+2+Math.cos(a)*L*.5,sol-71+Math.sin(a)*L*.5-6,x+2+Math.cos(a)*L,sol-71+Math.sin(a)*L*.55+10);g.stroke();}
  TPALM={toile:c,W:Wd,H:Hd,sol};return TPALM;}
let TBANC=null;
function graverBanc(){if(TBANC)return TBANC;const Wd=74,Hd=24,sol=20;const {c,g}=toile(Wd,Hd);
  g.fillStyle='rgba(30,26,20,.2)';g.fillRect(7,sol-1,64,4);
  R(g,5,sol-12,64,9,'#b8875a');R(g,5,sol-12,64,2,'#dcae7c');for(let x=5;x<69;x+=8)R(g,x,sol-12,.5,9,'rgba(80,50,20,.3)');
  R(g,5,sol-3,64,1.4,'#7a5636');for(const x of [10,62]){R(g,x,sol-3,3,4,'#6a6e74');}
  TBANC={toile:c,W:Wd,H:Hd,sol};return TBANC;}


/* =====================================================================
   L'ÉTAGE +1 : marbre blanc, boutiques à louer, le grand vide ovale de
   l'atrium (on voit le rez-de-chaussée en contrebas), l'escalator qui
   arrive au bord, la tour d'ascenseurs qui traverse le plancher.
   ===================================================================== */
const BASE1=290, VX=380, VY=560, VRX=210, VRY=96, TB1=440;
const PLAQUE=[VX+VRX-4, VY-20];      /* la plaque d'arrivée : on y redescend */
function marbreBlanc(g,y0){R(g,0,y0,W,H-y0,'#f4f2ee');
  for(let y=y0;y<H;y+=40)for(let x=0;x<W;x+=40){R(g,x+.3,y+.3,39.4,39.4,['#f6f4f0','#efece6','#f2f0eb'][(((x/40)|0)+((y/40)|0)*2)%3]);
    g.strokeStyle='rgba(150,150,160,.16)';g.lineWidth=.4;const s=hA(x,y,5);g.beginPath();g.moveTo(x+s*40,y);g.bezierCurveTo(x+12,y+14,x+28*s,y+22,x+40,y+10+s*24);g.stroke();}
  g.strokeStyle='rgba(120,120,130,.28)';g.lineWidth=.45;for(let y=y0;y<H;y+=40){g.beginPath();g.moveTo(0,y);g.lineTo(W,y);g.stroke();}for(let x=0;x<W;x+=40){g.beginPath();g.moveTo(x,y0);g.lineTo(x,H);g.stroke();}}
function silhouette(g,x,y,s,c){g.fillStyle='rgba(30,26,20,.2)';g.beginPath();g.ellipse(x,y,8*s,2.4*s,0,0,7);g.fill();R(g,x-5*s,y-22*s,4*s,22*s,'#2a2a34');R(g,x+1*s,y-22*s,4*s,22*s,'#2a2a34');R(g,x-8*s,y-38*s,16*s,17*s,c);g.fillStyle='#e0b896';g.beginPath();g.arc(x,y-43*s,5.5*s,0,7);g.fill();R(g,x-5.5*s,y-49.5*s,11*s,4*s,'#3a2a20');}
function peindreEtage(g){
  g.fillStyle=lin(g,0,0,0,40,[[0,'#a8cce6'],[1,'#e2f0f8']]);g.fillRect(0,0,W,40);for(let x=0;x<W;x+=26)R(g,x,0,1.6,40,'#fafafa');R(g,0,13,W,1.2,'#fafafa');R(g,0,26,W,1.2,'#fafafa');R(g,0,38,W,3,'#dcdad4');
  niveau(g,41,6);soffite(g,0,151,W,10);nez(g,0,W,161);
  niveau(g,171,5);R(g,0,281,W,BASE1-281,'#ece6dc');R(g,0,281,W,1,'#d8d2c6');R(g,0,BASE1-2,W,2,'rgba(0,0,0,.28)');
  marbreBlanc(g,BASE1);
  for(let k=0;k<5;k++){g.fillStyle=lin(g,0,BASE1,0,BASE1+70,[[0,'rgba(90,110,130,.2)'],[1,'rgba(90,110,130,0)']]);g.fillRect(14+k*158,BASE1,142,70);}
  /* dans le vide : le rez-de-chaussée, un étage plus bas */
  g.save();g.beginPath();g.ellipse(VX,VY,VRX,VRY,0,0,Math.PI*2);g.clip();
  R(g,0,VY-VRY,W,VRY*2,'#cfc7ba');R(g,0,VY-VRY,W,12,'#e8e4dc');R(g,0,VY-VRY+12,W,8,'#bba486');
  for(let x=-40;x<W;x+=160)vitrine(g,x+8,VY-VRY+20,144,106);
  R(g,0,VY-VRY+126,W,VRY*2,'#d8d0c4');
  for(let y=VY-VRY+126;y<VY+VRY;y+=30)for(let x=-((((y)/30)|0)%2)*30;x<W;x+=60)R(g,x+.4,y+.4,59.2,29.2,['#d6cec2','#cfc7ba','#dad3c8'][(((x/60)|0)+((y/30)|0))%3]);
  for(const [x,y,c] of [[260,VY+60,'#c84a3a'],[330,VY+80,'#2a5a8a'],[470,VY+70,'#e0c040']])silhouette(g,x,y,.9,c);
  const p=graverPalmier();g.drawImage(p.toile,210-p.W/2,VY+70-p.sol,p.W,p.H);
  g.fillStyle=lin(g,0,VY-VRY,0,VY-VRY+60,[[0,'rgba(0,0,0,.25)'],[1,'rgba(0,0,0,0)']]);g.fillRect(0,VY-VRY,W,60);
  g.fillStyle='rgba(20,20,40,.12)';g.fillRect(0,VY-VRY,W,VRY*2);
  escalier(g,0,0,VX+20,VX+VRX-6,VY+128-20,'LA TERRASSE');
  g.restore();
  g.strokeStyle='#ffffff';g.lineWidth=3;g.beginPath();g.ellipse(VX,VY,VRX,VRY,0,0,Math.PI*2);g.stroke();
  g.strokeStyle='#d8d4cc';g.lineWidth=1;g.beginPath();g.ellipse(VX,VY+2,VRX,VRY,0,0,Math.PI);g.stroke();
  /* la plaque d'arrivée, inox strié, liseré jaune */
  const [px,py]=PLAQUE;R(g,px,py-28,22,28,'#bfc4c9');R(g,px,py-28,22,1,'#eef0f2');for(let k=0;k<6;k++)R(g,px+3+k*2.8,py-25,.6,22,'#8e959c');R(g,px,py-28,2,28,'#e8d870');
  /* les murs latéraux */
  R(g,0,BASE1,6,H-BASE1,'#d8d2c6');R(g,W-6,BASE1,6,H-BASE1,'#d8d2c6');R(g,0,H-6,W,6,'#d8d2c6');}
/* le garde-corps du vide, en seize morceaux triés par profondeur */
const NRAIL=16;
function railBornes(v){const a0=v/NRAIL*Math.PI*2,a1=(v+1)/NRAIL*Math.PI*2;let x0=1e9,x1=-1e9,y1=-1e9,ym=1e9;
  for(let a=a0;a<=a1+1e-6;a+=(a1-a0)/12){const x=VX+Math.cos(a)*VRX,y=VY+Math.sin(a)*VRY;x0=Math.min(x0,x);x1=Math.max(x1,x);y1=Math.max(y1,y);ym=Math.min(ym,y);}
  return {a0,a1,x0,x1,y1,ym};}
const TRAIL={};
function graverRail(v){if(TRAIL[v])return TRAIL[v];const b=railBornes(v);const Wd=Math.ceil(b.x1-b.x0+8),sol=Math.ceil(b.y1-b.ym+20),Hd=sol+4;const {c,g}=toile(Wd,Hd);
  const ox=b.x0-4,oy=b.y1-sol;
  /* le peigne de l'escalator traverse le garde-corps : on laisse l'ouverture */
  for(let a=b.a0;a<b.a1;a+=.012){const x=VX+Math.cos(a)*VRX-ox,y=VY+Math.sin(a)*VRY-oy;if(Math.abs(VX+Math.cos(a)*VRX-PLAQUE[0])<4&&Math.abs(VY+Math.sin(a)*VRY-PLAQUE[1]+14)<16)continue;
    g.fillStyle='rgba(205,232,240,.26)';g.fillRect(x-.8,y-16,1.6,16);}
  for(let a=b.a0;a<b.a1;a+=.3){const x=VX+Math.cos(a)*VRX-ox,y=VY+Math.sin(a)*VRY-oy;R(g,x-.5,y-16,1,16,'rgba(255,255,255,.6)');}
  g.strokeStyle='#a8b0b6';g.lineWidth=1.8;g.beginPath();g.ellipse(VX-ox,VY-16-oy,VRX,VRY,0,b.a0,b.a1);g.stroke();
  g.strokeStyle='rgba(255,255,255,.85)';g.lineWidth=.5;g.beginPath();g.ellipse(VX-ox,VY-16.6-oy,VRX,VRY,0,b.a0,b.a1);g.stroke();
  TRAIL[v]={toile:c,W:Wd,H:Hd,sol,cx:(b.x0+b.x1)/2,y:b.y1};return TRAIL[v];}
function decorEtage(){const D=[];const P=(t,x,y,o)=>D.push(Object.assign({t,x,y,gr:0},o||{}));
  for(let v=0;v<NRAIL;v++){const r=graverRail(v);P('x_jol_tdp_rail_sol',r.cx,Math.ceil(r.y),{v});}
  const t=graverTour();P('x_jol_tdp_tour_sol',TX-TW/2+t.W/2-t.x0,TB1,{anim:'tdp_tour'});
  for(const [x,y] of [[60,460],[740,600],[700,770]])P('x_jol_tdp_palmier',x,y,{col:[26,8]});
  for(const [x,y] of [[120,380],[600,740],[180,740]])P('x_jol_tdp_banc',x,y,{col:[64,8]});
  return D;}
function bloqueEtage(x,y){
  if(x<12||x>W-12||y>H-10||y<BASE1+10)return true;
  const ex=(x-VX)/(VRX+6),ey=(y-VY)/(VRY+8);if(ex*ex+ey*ey<1&&!(x>PLAQUE[0]-6&&Math.abs(y-PLAQUE[1]+14)<16))return true;
  if(x>TX-TW/2-6&&x<TX+TW/2+6&&y>TB1-TD-6&&y<TB1+4)return true;
  for(const o of DECOR){if(!o.col)continue;if(Math.abs(x-o.x)<o.col[0]/2&&y>o.y-o.col[1]&&y<o.y+3)return true;}
  return false;}

/* ---------- LE DÉCOR ET LES OBSTACLES ---------- */
function decor(){if(ETG)return decorEtage();const D=[];const P=(t,x,y,o)=>D.push(Object.assign({t,x,y,gr:0},o||{}));
  const e=graverEscalators();P('x_jol_tdp_escalators_sol',e.ox+e.W/2,GY2+0);
  const t=graverTour();P('x_jol_tdp_tour_sol',TX-TW/2+t.W/2-t.x0,TB,{anim:'tdp_tour'});
  for(const [x,y] of [[90,640],[300,740],[520,600],[730,700]])P('x_jol_tdp_palmier',x,y,{col:[26,8]});
  for(const [x,y] of [[190,620],[180,760],[290,550]])P('x_jol_tdp_banc',x,y,{col:[64,8]});
  return D;}
function bloque(x,y){
  if(ETG)return bloqueEtage(x,y);
  if(x<12||x>W-12)return true;
  if(y<Y0+10)return true;                                   /* les vitrines du fond */
  if(y>H-6&&Math.abs(x-SORTIE_X)>SORTIE_DEMI)return true;
  if(y>H+4)return true;
  if(x>EX0-26&&x<EX1+6&&y>GY1-PROF-2&&y<GY2+4)return true;   /* les escalators */
  if(x>EX1+104&&x<EX1+122&&y>GY2-8&&y<GY2+4)return true;    /* le poteau du palier */
  if(x>TX-TW/2-6&&x<TX+TW/2+6&&y>TB-TD-6&&y<TB+4)return true; /* la tour */
  for(const o of DECOR){if(!o.col)continue;if(Math.abs(x-o.x)<o.col[0]/2&&y>o.y-o.col[1]&&y<o.y+3)return true;}
  return false;}
const GRAVEURS={x_jol_tdp_rail_sol:v=>graverRail(v),x_jol_tdp_escalators_sol:graverEscalators,x_jol_tdp_tour_sol:graverTour,x_jol_tdp_palmier:graverPalmier,x_jol_tdp_banc:graverBanc};
function graver(t,v){const r=(GRAVEURS[t]||(()=>({toile:document.createElement('canvas'),W:1,H:1,sol:0})))(v||0);return {toile:r.toile,W:r.W,H:r.H,sol:r.sol};}

/* LES ESCALATORS : au pied (rez-de-chaussée) on monte ; sur la plaque (étage) on redescend */
let PASSE=false;
const aller=(q)=>{PASSE=true;try{sauver();}catch(x){}setTimeout(()=>{const v=window.MA_VERSION?('&v='+encodeURIComponent(window.MA_VERSION)):'';location.href='spawn.html?'+q+v;},250);};
setInterval(()=>{try{
  if(PASSE||typeof joueur==='undefined')return;
  if(!ETG&&joueur.x<EX0-20&&joueur.x>EX0-60&&joueur.y>GY1-PROF&&joueur.y<GY2+10)aller('lieu=terrasses1');
  if(ETG&&joueur.x>PLAQUE[0]-4&&joueur.x<PLAQUE[0]+24&&joueur.y>PLAQUE[1]-30&&joueur.y<PLAQUE[1]+2)aller('lieu=terrasses&de=etage');
}catch(x){}},150);
/* LA SORTIE : par les portes du sud, on retrouve la place de la Joliette */
let PARTI=false;
setInterval(()=>{try{
  if(ETG||PARTI||typeof joueur==='undefined')return;
  if(joueur.y>H-14&&Math.abs(joueur.x-SORTIE_X)<SORTIE_DEMI){PARTI=true;
    try{sauver();}catch(x){}
    setTimeout(()=>{const v=window.MA_VERSION?('&v='+encodeURIComponent(window.MA_VERSION)):'';location.href='spawn.html?de=terrasses'+v;},300);}
}catch(x){}},150);

ANIM_DECOR.tdp_tour=dessinerTour;
return {sol,solFin,decor,bloque,graver,depart:DEPART};
})()
