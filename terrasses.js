/* =====================================================================
   L'INTÉRIEUR DE LA GALERIE BLEUE — le rez-de-chaussée, autour de l'atrium.
   Même logique de vue que la place : le mur du fond monte à la verticale
   (rez-de-chaussée, puis le balcon du +1, puis celui du +2) ; tout le reste
   est posé au sol. Les boutiques sont vides : « À LOUER ».
   Chargé par moteur.js (eval direct) par terrasses.html (le rez-de-chaussée) et terrasses.html?niveau=1 (l’étage).
   ===================================================================== */
(()=>{
const W=1600, H=800, Y0=330, ETAGE=128;   /* un seul niveau, deux fois plus large */
const Q=(()=>{try{return new URLSearchParams(location.search);}catch(x){return new URLSearchParams('');}})();
const ETG=false;   /* plus d'étage : un seul grand niveau */                 /* l'étage +1 */
const DEPART=[800,700], SORTIE_X=800, SORTIE_DEMI=46;
const MUR_S=H-70, PL=136;      /* le mur de l'entrée, au sud, et la largeur des portes */
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
/* les grandes boutiques du fond : largeurs variées, la locomotive au centre */
const BOUT=[180,200,240,330,240,200,180];
/* LES MAISONS : chaque local a sa façade, sa matière, son cadre */
const STYLES=[
 {nom:'marbre',bandeau:'#f4f1ec',veine:'rgba(150,150,160,.35)',cadre:'#b89a5a'},
 {nom:'noyer',bandeau:'#6a4428',lame:'#5a3820',cadre:'#1e1e22',store:['#1e4a36','#2c6a4e']},
 {nom:'granit',bandeau:'#23252b',grain:'rgba(255,255,255,.18)',cadre:'#c8a860'},
 null,
 {nom:'laiton',bandeau:'#b89050',brosse:'rgba(255,240,200,.28)',cadre:'#7a5a2a'},
 {nom:'creme',bandeau:'#efe6d2',cadre:'#ffffff',store:['#1c2c58','#f4f0e6']},
 {nom:'ocre',bandeau:'#c8783e',cadre:'#5a3020',store:['#a84a24','#e8c8a0']}];
/* l'intérieur d'un local vide, éclairé : murs chauds, parquet, étagères, spots */
function vitrineEclairee(g,x,y,w,h,S){
  R(g,x,y,w,h,S.cadre);const vx=x+3,vy=y+3,vw=w-6,vh=h-6;
  g.fillStyle=lin(g,0,vy,0,vy+vh,[[0,'#fff3dc'],[.62,'#f0dcb8'],[.63,'#d8b88a'],[1,'#c8a070']]);g.fillRect(vx,vy,vw,vh);
  /* le fond : des étagères vides, une porte de réserve */
  for(let k=0;k<3;k++){const ey=vy+vh*(.22+k*.13);R(g,vx+8,ey,vw*.36,2,'#e8d8bc');R(g,vx+8,ey+2,vw*.36,1,'rgba(0,0,0,.12)');R(g,vx+vw-8-vw*.36,ey,vw*.36,2,'#e8d8bc');R(g,vx+vw-8-vw*.36,ey+2,vw*.36,1,'rgba(0,0,0,.12)');}
  R(g,vx+vw/2-12,vy+vh*.2,24,vh*.42,'#e6d2ae');R(g,vx+vw/2+7,vy+vh*.42,2,4,'#b89a5a');
  /* le parquet en perspective */
  for(let k=0;k<10;k++){g.strokeStyle='rgba(120,80,40,.25)';g.lineWidth=.6;g.beginPath();g.moveTo(vx+vw*k/9,vy+vh*.63);g.lineTo(vx+vw/2+(k/9-.5)*vw*1.6,vy+vh);g.stroke();}
  /* les spots et leurs halos */
  for(let k=0;k<4;k++){const sx=vx+vw*(k+.5)/4;R(g,sx-2,vy+2,4,2,'#fffbe8');g.fillStyle='rgba(255,246,220,.35)';g.beginPath();g.moveTo(sx-2,vy+4);g.lineTo(sx+2,vy+4);g.lineTo(sx+14,vy+vh*.63);g.lineTo(sx-14,vy+vh*.63);g.fill();}
  /* deux présentoirs vides */
  for(const f of [.3,.7]){const px=vx+vw*f;R(g,px-10,vy+vh*.66,20,10,'#f6efe2');R(g,px-10,vy+vh*.66,20,1.4,'#ffffff');R(g,px-10,vy+vh*.66+10,20,2,'rgba(0,0,0,.15)');}
  /* le vitrage : reflets, montants, la porte */
  g.save();g.beginPath();g.rect(vx,vy,vw,vh);g.clip();g.fillStyle='rgba(255,255,255,.16)';
  for(let k=0;k<3;k++){const bx=vx+vw*.08+k*vw*.34;g.beginPath();g.moveTo(bx,vy);g.lineTo(bx+vh*.25,vy);g.lineTo(bx+vh*.25-vh*.45,vy+vh);g.lineTo(bx-vh*.45,vy+vh);g.fill();}g.restore();
  const nm=Math.max(2,Math.round(w/60));for(let k=1;k<nm;k++)R(g,vx+vw*k/nm-.8,vy,1.6,vh,S.cadre);
  /* la vitrophanie élégante : un bandeau translucide « À LOUER » */
  const by=vy+vh*.44,bh=Math.max(14,vh*.12);g.fillStyle='rgba(31,63,168,.86)';g.fillRect(vx,by,vw,bh);R(g,vx,by,vw,1,'#c8a860');R(g,vx,by+bh-1,vw,1,'#c8a860');
  g.fillStyle='#ffffff';g.font='bold '+(bh*.42).toFixed(1)+'px "Helvetica Neue",Arial,sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText('À LOUER',vx+vw/2,by+bh*.4);
  g.fillStyle='rgba(255,255,255,.75)';g.font=(bh*.26).toFixed(1)+'px "Helvetica Neue",Arial,sans-serif';g.fillText('LA GALERIE BLEUE',vx+vw/2,by+bh*.76);}
function boutique(g,x,y,w,h,S){
  /* le bandeau d'enseigne, dans la matière de la maison */
  R(g,x,y,w,30,S.bandeau);
  if(S.veine)for(let k=0;k<5;k++){g.strokeStyle=S.veine;g.lineWidth=.6;g.beginPath();g.moveTo(x+k*w/5,y);g.bezierCurveTo(x+k*w/5+20,y+10,x+k*w/5+10,y+20,x+k*w/5+40,y+30);g.stroke();}
  if(S.lame)for(let xx=x;xx<x+w;xx+=6)R(g,xx,y,1,30,S.lame);
  if(S.grain)for(let k=0;k<w*2;k++)R(g,x+hA(k,y,5)*w,y+hA(k,y,6)*30,.8,.8,S.grain);
  if(S.brosse)for(let yy=y;yy<y+30;yy+=2)R(g,x,yy,w,.6,S.brosse);
  R(g,x,y+28,w,2,'rgba(0,0,0,.25)');R(g,x,y,w,1,'rgba(255,255,255,.35)');
  /* deux appliques dorées */
  for(const f of [.2,.8]){const lx=x+w*f;R(g,lx-5,y+4,10,3,'#c8a860');g.fillStyle='rgba(255,236,190,.4)';g.beginPath();g.moveTo(lx-4,y+7);g.lineTo(lx+4,y+7);g.lineTo(lx+10,y+28);g.lineTo(lx-10,y+28);g.fill();}
  vitrineEclairee(g,x,y+30,w,h-30,S);
  /* le store, pour les maisons qui en ont un */
  if(S.store){const sy=y+30,n=Math.round(w/16);for(let k=0;k<n;k++){g.fillStyle=S.store[k%2];g.beginPath();g.moveTo(x+k*w/n,sy);g.lineTo(x+(k+1)*w/n,sy);g.lineTo(x+(k+1)*w/n+1,sy+14);g.lineTo(x+k*w/n+1,sy+14);g.fill();
    g.beginPath();g.arc(x+(k+.5)*w/n+1,sy+14,w/n/2,0,Math.PI);g.fill();}g.fillStyle='rgba(0,0,0,.18)';g.fillRect(x+3,sy+18,w-6,3);}}
function peindreSol(g){
  /* la verrière : ciel, montants blancs, la lumière qui tombe */
  g.fillStyle=lin(g,0,0,0,64,[[0,'#9cc6e6'],[1,'#e4f0f8']]);g.fillRect(0,0,W,64);
  for(let x=0;x<W;x+=32)R(g,x,0,2,64,'#fafafa');R(g,0,20,W,1.4,'#fafafa');R(g,0,42,W,1.4,'#fafafa');R(g,0,62,W,4,'#e6e2da');
  /* la corniche de pierre et les boutiques, sur toute la largeur */
  R(g,0,66,W,Y0-66,'#ece6dc');R(g,0,66,W,8,'#f6f2ea');R(g,0,74,W,2,'#d6cebe');
  let x=0;const p=(W-BOUT.reduce((a,b)=>a+b,0))/(BOUT.length+1);
  for(let i=0;i<BOUT.length;i++){
    g.fillStyle=lin(g,x,0,x+p,0,[[0,'#dcd8d0'],[.5,'#fbfaf6'],[1,'#d0ccc4']]);g.fillRect(x,76,p,Y0-76);x+=p;
    if(STYLES[i])boutique(g,x,80,BOUT[i],Y0-84,STYLES[i]);x+=BOUT[i];}
  g.fillStyle=lin(g,x,0,x+p,0,[[0,'#dcd8d0'],[.5,'#fbfaf6'],[1,'#d0ccc4']]);g.fillRect(x,76,W-x,Y0-76);
  R(g,0,Y0-4,W,4,'#cfc8ba');R(g,0,Y0-1,W,1,'rgba(0,0,0,.28)');
  /* les grandes dalles de pierre claire, posées en quinconce */
  R(g,0,Y0,W,H-Y0,'#e4ddd2');
  for(let y=Y0;y<H;y+=30)for(let x=-((((y-Y0)/30)|0)%2)*30;x<W;x+=60){
    R(g,x+.4,y+.4,59.2,29.2,['#e9e3d9','#e1dacf','#ece7de','#e5dfd4'][(((x/60)|0)+(((y-Y0)/30)|0)*3)%4]);
    g.strokeStyle='rgba(160,150,135,.18)';g.lineWidth=.4;g.beginPath();const s=hA(x|0,y|0,3);g.moveTo(x+s*60,y+2);g.bezierCurveTo(x+20,y+12,x+40*s,y+18,x+58,y+8+s*18);g.stroke();}
  g.strokeStyle='rgba(150,140,125,.35)';g.lineWidth=.5;for(let y=Y0;y<H;y+=30){g.beginPath();g.moveTo(0,y);g.lineTo(W,y);g.stroke();}
  /* le reflet des vitrines et la lumière de la verrière sur la pierre lustrée */
  x=p;for(let i=0;i<BOUT.length;i++){g.fillStyle=lin(g,0,Y0,0,Y0+90,[[0,'rgba(90,110,130,.22)'],[1,'rgba(90,110,130,0)']]);g.fillRect(x+6,Y0,BOUT[i]-12,90);x+=BOUT[i]+p;}
  for(let k=0;k<8;k++){const cx=100+k*200,cy=470;const gr=g.createRadialGradient(cx,cy,4,cx,cy,110);gr.addColorStop(0,'rgba(255,248,226,.45)');gr.addColorStop(1,'rgba(255,248,226,0)');g.fillStyle=gr;g.beginPath();g.ellipse(cx,cy,120,46,0,0,7);g.fill();}
  /* la grande allée : une bande de marbre plus sombre, bordée de laiton */
  R(g,0,500,W,40,'rgba(170,150,120,.16)');R(g,0,499,W,1.4,'#c8a860');R(g,0,540,W,1.4,'#c8a860');
  /* LE HALL BLEU : au fond, le grand mur végétal ; devant, une allée de marbre bleu nuit jusqu'à l'entrée */
  {const x0=635,x1=965;
   murVegetal(g,x0,Y0-4,x1-x0,Y0-84,false);
   g.save();g.shadowColor='rgba(220,240,255,.95)';g.shadowBlur=10;g.fillStyle='#ffffff';g.font='bold 22px "Helvetica Neue",Arial,sans-serif';g.textAlign='center';g.textBaseline='middle';
   g.fillText('LA GALERIE BLEUE',800,186);g.shadowBlur=0;g.fillText('LA GALERIE BLEUE',800,186);g.restore();R(g,710,204,180,1.2,'rgba(255,255,255,.75)');
   g.fillStyle=lin(g,0,Y0,0,H,[[0,'#16306e'],[1,'#22449a']]);g.fillRect(x0,Y0,x1-x0,H-Y0);
   for(let y=Y0;y<H;y+=30)R(g,x0,y,x1-x0,.8,'rgba(255,255,255,.07)');for(let x=x0+55;x<x1;x+=55)R(g,x,Y0,.6,H-Y0,'rgba(255,255,255,.05)');
   R(g,x0-2,Y0,2,H-Y0,'#c8a860');R(g,x1,Y0,2,H-Y0,'#c8a860');
   /* le reflet du mur vert dans le marbre, et les halos des suspensions */
   g.fillStyle=lin(g,0,Y0,0,Y0+80,[[0,'rgba(90,160,110,.28)'],[1,'rgba(90,160,110,0)']]);g.fillRect(x0,Y0,x1-x0,80);
   for(let k=0;k<3;k++)for(const dx of [-72,72]){const lx=800+dx,ly=410+k*100;g.save();g.translate(lx,ly);g.scale(1,.32);const gr=g.createRadialGradient(0,0,0,0,0,36);gr.addColorStop(0,'rgba(255,230,170,.5)');gr.addColorStop(1,'rgba(255,230,170,0)');g.fillStyle=gr;g.beginPath();g.arc(0,0,36,0,7);g.fill();g.restore();}}
  /* ===== LA LUMIÈRE ET LES MATIÈRES ===== */
  {const p=(W-BOUT.reduce((a,b)=>a+b,0))/(BOUT.length+1);let x=p;
   /* la lumière chaude des vitrines éclairées se répand sur la pierre */
   for(let i=0;i<BOUT.length;i++){if(STYLES[i]){g.fillStyle=lin(g,0,Y0,0,Y0+120,[[0,'rgba(255,214,150,.42)'],[1,'rgba(255,214,150,0)']]);
     g.beginPath();g.moveTo(x+6,Y0);g.lineTo(x+BOUT[i]-6,Y0);g.lineTo(x+BOUT[i]+30,Y0+120);g.lineTo(x-30,Y0+120);g.closePath();g.fill();}x+=BOUT[i]+p;}}
  /* les rais de lumière de la verrière, en biais, sur toute la galerie */
  g.save();g.globalCompositeOperation='screen';
  for(let k=0;k<9;k++){const bx=40+k*190;g.fillStyle=lin(g,0,Y0,0,H,[[0,'rgba(255,250,232,.22)'],[1,'rgba(255,250,232,0)']]);
    g.beginPath();g.moveTo(bx,Y0);g.lineTo(bx+46,Y0);g.lineTo(bx+46+140,H);g.lineTo(bx+140,H);g.closePath();g.fill();}
  g.restore();
  /* LE COIN CAFÉ : un grand rond de parquet de chêne, cerclé de laiton */
  {const cx=320,cy=630,rx=230,ry=118;g.save();g.beginPath();g.ellipse(cx,cy,rx,ry,0,0,7);g.clip();
   g.fillStyle='#c8955a';g.fillRect(cx-rx,cy-ry,rx*2,ry*2);
   for(let y=cy-ry;y<cy+ry;y+=7)for(let x=cx-rx-((y/7|0)%3)*20;x<cx+rx;x+=60){R(g,x+.4,y+.4,59.2,6.2,['#c8955a','#bd8a50','#d4a068','#c4905a'][(((x/60)|0)+(y/7|0))%4]);}
   g.fillStyle='rgba(255,240,210,.18)';g.beginPath();g.ellipse(cx-40,cy-50,rx*.7,ry*.35,0,0,7);g.fill();g.restore();
   g.strokeStyle='#c8a860';g.lineWidth=2.4;g.beginPath();g.ellipse(cx,cy,rx,ry,0,0,7);g.stroke();g.strokeStyle='rgba(255,240,200,.6)';g.lineWidth=.6;g.beginPath();g.ellipse(cx,cy,rx-2,ry-1.2,0,Math.PI,2*Math.PI);g.stroke();}
  /* LE COIN JARDIN : une grande ellipse de pierre claire bordée de massifs, gravier blond */
  {const cx=1290,cy=630,rx=240,ry=122;
   g.fillStyle='#e6dccb';g.beginPath();g.ellipse(cx,cy,rx,ry,0,0,7);g.fill();
   for(let i=0;i<2400;i++){const a=hA(i,9,1)*Math.PI*2,r=Math.sqrt(hA(i,9,2));R(g,cx+Math.cos(a)*rx*.86*r,cy+Math.sin(a)*ry*.86*r,1,1,hA(i,9,3)<.5?'#d4c6ae':'#f2ead8');}
   g.strokeStyle='#c8bca4';g.lineWidth=3;g.beginPath();g.ellipse(cx,cy,rx*.88,ry*.88,0,0,7);g.stroke();
   /* la couronne de massifs : buis, graminées, petites fleurs */
   for(let i=0;i<3200;i++){const a=hA(i,10,1)*Math.PI*2;if(Math.abs(Math.sin(a))<.16)continue;const r=.88+hA(i,10,2)*.14;const x=cx+Math.cos(a)*rx*r,y=cy+Math.sin(a)*ry*r;
     g.fillStyle=['#2e5430','#467440','#6e9a58','#3a6028'][i%4];g.beginPath();g.ellipse(x,y-hA(i,10,4)*6,3.2,2.2,a,0,7);g.fill();
     if(i%7===0){g.fillStyle=['#f4f0e4','#e8a0c0','#c8a8e8'][i%3];g.fillRect(x,y-2,1.4,1.4);}}}
  /* la pierre lustrée : quelques éclats de lumière et des veines dorées */
  for(let k=0;k<70;k++){const x=hA(k,3,9)*W,y=Y0+40+hA(k,4,9)*(H-Y0-60);if(x>630&&x<970)continue;g.strokeStyle='rgba(200,168,96,.22)';g.lineWidth=.6;g.beginPath();g.moveTo(x,y);g.bezierCurveTo(x+20,y+6,x+30,y-4,x+60,y+4);g.stroke();}
  /* le vignettage doux sur les bords */
  g.fillStyle=lin(g,0,0,140,0,[[0,'rgba(60,50,40,.18)'],[1,'rgba(60,50,40,0)']]);g.fillRect(0,Y0,140,H-Y0);
  g.fillStyle=lin(g,W,0,W-140,0,[[0,'rgba(60,50,40,.18)'],[1,'rgba(60,50,40,0)']]);g.fillRect(W-140,Y0,140,H-Y0);
  /* les murs latéraux */
  R(g,0,Y0,6,H-Y0,'#d8d2c6');R(g,W-6,Y0,6,H-Y0,'#d8d2c6');
  /* LA SORTIE SANS MUR : la galerie continue vers le bas ; le jour de la place arrive doucement */
  g.fillStyle=lin(g,0,H-90,0,H,[[0,'rgba(255,250,236,0)'],[1,'rgba(255,248,228,.55)']]);g.fillRect(0,H-90,W,90);
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
  escalier(g,ox,top,EX0,EX1,GY1,'GALERIE BLEUE',1);
  escalier(g,ox,top,EX0,EX1,GY2,'GALERIE BLEUE',-1);
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
  escalier(g,0,0,VX+20,VX+VRX-6,VY+128-20,'GALERIE BLEUE');
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


/* ---------- L'ÎLOT : le mur végétal et ses deux banquettes rondes ---------- */
const hB=(x,y,k)=>{let n=((x*73856093)^(y*19349663)^(k*83492791))|0;n=(n^(n>>>13))*1274126177|0;return((n^(n>>>16))>>>0)/4294967296;};
const Lg=(g,x0,y0,x1,y1,st)=>{const gr=g.createLinearGradient(x0,y0,x1,y1);st.forEach(([o,c])=>gr.addColorStop(o,c));return gr;};
function fe(g,cx,cy,rx,ry,pal,n,seed,t){t=t||1;for(let i=0;i<n;i++){const a=hB(i,seed,1)*Math.PI*2,r=Math.sqrt(hB(i,seed,2));const x=cx+Math.cos(a)*rx*r,y=cy+Math.sin(a)*ry*r;
  const lum=((cx-x)/rx+(cy-y)/ry)*.5+hB(i,seed,3)*.4;g.fillStyle=lum>.55?pal[3]:lum>.15?pal[2]:lum>-.3?pal[1]:pal[0];
  g.beginPath();g.ellipse(x,y,(1.2+hB(i,seed,4)*1.6)*t,(.9+hB(i,seed,5)*1)*t,hB(i,seed,6)*3,0,7);g.fill();}}
const VERTS=[['#1e3a22','#2e5430','#467440','#6e9a58'],['#22401e','#3a6028','#5a8a3a','#8ab45a'],['#1a3428','#2a4e3a','#3e7050','#64986e']];
function ombreSol(g,cx,cy,rx,ry,a){g.fillStyle='rgba(40,30,20,'+(a||.18)+')';g.beginPath();g.ellipse(cx+4,cy+3,rx,ry,0,0,7);g.fill();}
/* une banquette ronde de velours, autour d'un bac planté */
function banquette(g,cx,cy,R,P){const ry=R*.42,H=12;ombreSol(g,cx,cy,R+4,ry+3,.2);
  /* le socle et l'assise, face avant visible */
  g.fillStyle=Lg(g,cx-R,0,cx+R,0,[[0,P.f2],[.35,P.f0],[1,P.f2]]);g.beginPath();g.ellipse(cx,cy,R,ry,0,0,Math.PI);g.lineTo(cx-R,cy-H);g.ellipse(cx,cy-H,R,ry,0,Math.PI,0,true);g.fill();
  g.fillStyle='rgba(0,0,0,.25)';g.beginPath();g.ellipse(cx,cy,R,ry,0,0,Math.PI);g.ellipse(cx,cy-2,R,ry,0,Math.PI,0,true);g.fill();
  /* capitons */
  for(let k=1;k<12;k++){const a=k/12*Math.PI;g.fillStyle='rgba(0,0,0,.18)';g.fillRect(cx+Math.cos(a)*R-.5,cy-H+Math.sin(a)*ry+2,1,H-4);}
  g.fillStyle=P.f1;g.beginPath();g.ellipse(cx,cy-H,R,ry,0,0,7);g.fill();
  g.fillStyle='rgba(255,255,255,.18)';g.beginPath();g.ellipse(cx-R*.2,cy-H-ry*.3,R*.6,ry*.35,0,0,7);g.fill();
  /* le dossier central : un muret courbe */
  const r2=R*.5,ry2=r2*.42;g.fillStyle=Lg(g,cx-r2,0,cx+r2,0,[[0,'#d8d4cc'],[.4,'#fbfaf6'],[1,'#c8c4bc']]);
  g.beginPath();g.ellipse(cx,cy-H,r2,ry2,0,0,Math.PI);g.lineTo(cx-r2,cy-H-14);g.ellipse(cx,cy-H-14,r2,ry2,0,Math.PI,0,true);g.fill();
  g.fillStyle='#5a4632';g.beginPath();g.ellipse(cx,cy-H-14,r2-2,ry2-1.5,0,0,7);g.fill();
  /* la plante au centre */
  P.plante(g,cx,cy-H-14);}
function olivierB(g,x,y){g.strokeStyle='#6e6252';g.lineWidth=2.6;g.beginPath();g.moveTo(x,y);g.bezierCurveTo(x-4,y-12,x+5,y-22,x,y-34);g.stroke();
  g.lineWidth=1.6;g.beginPath();g.moveTo(x,y-22);g.lineTo(x-9,y-32);g.moveTo(x+1,y-26);g.lineTo(x+9,y-36);g.stroke();
  fe(g,x,y-42,22,13,['#4a5a42','#6a7a5c','#8a9c7a','#b4c4a0'],420,7);}
function fougeres(g,x,y){fe(g,x,y-6,18,7,VERTS[1],220,8,1.2);for(let k=0;k<8;k++){const a=-Math.PI/2+(k-3.5)*.35;g.strokeStyle='#3e7a3a';g.lineWidth=1.6;g.beginPath();g.moveTo(x,y-6);g.quadraticCurveTo(x+Math.cos(a)*10,y-6+Math.sin(a)*12,x+Math.cos(a)*20,y-4+Math.sin(a)*8);g.stroke();}}
/* le mur végétal : un grand panneau autoportant couvert de plantes */
function murVegetal(g,x,y,w,h,logo){ombreSol(g,x+w/2,y,w/2+6,6,.22);
  g.fillStyle='#e8e6e0';g.fillRect(x-4,y-h-6,w+8,6);g.fillStyle='#ffffff';g.fillRect(x-4,y-h-6,w+8,1.4);   /* le chapeau */
  g.fillStyle='#d8d4cc';g.fillRect(x-4,y-h,4,h);g.fillRect(x+w,y-h,4,h);g.fillStyle='#bdb8ae';g.fillRect(x-4,y-8,w+8,8);
  g.fillStyle='#1e3420';g.fillRect(x,y-h,w,h-8);
  for(let k=0;k<3;k++){const pal=VERTS[k];for(let i=0;i<Math.round(w*h/9);i++){const px=x+hB(i,k,11)*w,py=y-h+hB(i,k,12)*(h-8);const lum=hB(i,k,13)+(1-(py-(y-h))/h)*.3;
    g.fillStyle=lum>1?pal[3]:lum>.7?pal[2]:lum>.4?pal[1]:pal[0];g.beginPath();g.ellipse(px,py,1.6+hB(i,k,14)*1.6,1.1+hB(i,k,15),hB(i,k,16)*3,0,7);g.fill();}}
  for(let i=0;i<Math.round(w*h/90);i++){g.fillStyle=['#f2efe6','#e8a0c0','#f0cf6a','#c8a8e8'][i%4];g.fillRect(x+hB(i,5,21)*w,y-h+hB(i,5,22)*(h-10),1.4,1.4);}
  /* le dégradé d'ombre en bas, les spots qui l'éclairent */
  g.fillStyle=Lg(g,0,y-30,0,y-8,[[0,'rgba(0,0,0,0)'],[1,'rgba(0,0,0,.35)']]);g.fillRect(x,y-30,w,22);
  for(let i=0;i<4;i++){const sx=x+w*(i+.5)/4;g.fillStyle='rgba(255,240,200,.18)';g.beginPath();g.moveTo(sx-4,y-h);g.lineTo(sx+4,y-h);g.lineTo(sx+14,y-h+40);g.lineTo(sx-14,y-h+40);g.fill();}
  if(logo){g.fillStyle='rgba(255,255,255,.92)';g.font='bold 9px "Helvetica Neue",Arial';g.textAlign='center';g.fillText('LA GALERIE',x+w/2,y-h+h*.45);g.font='7px "Helvetica Neue",Arial';g.fillText('BLEUE',x+w/2,y-h+h*.45+10);}}

const MURV=[800,640,204,70], BANQ=[[728,700],[872,700]], RBQ=44;
let TMUR=null,TBQ=null;
function graverMur(){if(TMUR)return TMUR;const [,,w,h]=MURV,Wd=w+30,sol=h+14,Hd=sol+12;const {c,g}=toile(Wd,Hd);murVegetal(g,15,sol,w,h,true);TMUR={toile:c,W:Wd,H:Hd,sol};return TMUR;}
const BLEUV={f0:'#2e4a8a',f1:'#3a5aa0',f2:'#1e3266',plante:fougeres};
const TBQV={};const CREME={f0:'#e8dcc4',f1:'#f4ead6',f2:'#c8b898',plante:fougeres};
function graverBanquette(v){if(TBQV[v|0])return TBQV[v|0];const ry=RBQ*.42,Wd=RBQ*2+20,cyL=82,Hd=Math.ceil(cyL+ry+8);const {c,g}=toile(Wd,Hd);banquette(g,Wd/2,cyL,RBQ,v?CREME:BLEUV);return TBQV[v|0]={toile:c,W:Wd,H:Hd,sol:cyL+ry};}

/* ---------- LES PASSANTS : ils font leur tour dans la galerie ---------- */
const TOURNEES=[
  {pts:[[120,580],[660,580],[660,720],[120,720]],v:26,n:2},
  {pts:[[110,522],[560,522],[560,640],[250,640],[250,522]],v:22,n:2},
  {pts:[[40,432],[560,432],[560,468],[40,468]],v:18,n:1}];
const GENS=[];
(()=>{let k=0;for(const T of TOURNEES){let L=0;const seg=[];for(let i=0;i<T.pts.length;i++){const a=T.pts[i],b=T.pts[(i+1)%T.pts.length],d=Math.hypot(b[0]-a[0],b[1]-a[1]);seg.push([a,b,L,d]);L+=d;}
  for(let j=0;j<T.n;j++){GENS.push({seg,L,v:T.v*(0.85+hA(k,3,1)*.3),dec:L*(j/T.n)+hA(k,4,1)*60,sens:j%2?-1:1,
    ap:{peau:[1,3,5,2,6][k%5],cheveux:[1,4,6,0,10][k%5],coiffe:[0,6,2,15,5][k%5],barbe:k%4===1?3:0,haut:[1,2,3,5,6][k%5],veste:[18,0,8,24,11][k%5],pantalon:[0,7,10,2,8][k%5],bas:[0,5,0,2,0][k%5],souliers:1,chaussures:[6,0,7,1,9][k%5],sac:k%3===0?2:0,chapeau:0,raye:0,motif:0,_pnj:true},x:0,y:0,dir:'bas',pas:0});k++;}}})();
function figurants(){const now=Date.now()/1000;
  for(const P of GENS){let s=((now*P.v*P.sens+P.dec)%P.L+P.L)%P.L;
    for(const [a,b,L0,d] of P.seg){if(s<=L0+d){const t=(s-L0)/d;const nx=a[0]+(b[0]-a[0])*t,ny=a[1]+(b[1]-a[1])*t;
      let dx=(b[0]-a[0])*P.sens,dy=(b[1]-a[1])*P.sens;P.dir=Math.abs(dx)>Math.abs(dy)?(dx>0?'droite':'gauche'):(dy>0?'bas':'haut');
      P.x=nx;P.y=ny;P.pas=now*P.v/9;break;}}}
  return GENS;}

/* une suspension dorée : son fil monte vers la verrière, sa lumière tombe sur l'allée */
let TSUS=null;
function graverSusp(){if(TSUS)return TSUS;const Wd=20,Hd=96,sol=94;const {c,g}=toile(Wd,Hd);
  R(g,9.7,0,.6,64,'rgba(150,150,150,.7)');g.fillStyle='#d8b060';g.beginPath();g.arc(10,70,6,Math.PI,0);g.fill();g.fillStyle='#b8904a';g.fillRect(4,70,12,1);
  g.fillStyle='#fff6d8';g.beginPath();g.ellipse(10,70.6,4.4,1.5,0,0,7);g.fill();
  const gr=g.createRadialGradient(10,72,0,10,72,10);gr.addColorStop(0,'rgba(255,236,190,.7)');gr.addColorStop(1,'rgba(255,236,190,0)');g.fillStyle=gr;g.fillRect(0,62,20,20);
  TSUS={toile:c,W:Wd,H:Hd,sol};return TSUS;}
/* ---------- LES COINS DE VIE ---------- */
/* l'îlot café : comptoir rond, machine, ardoise, suspensions */
function cafe(g,cx,cy){const R=40,ry=17,H=20;ombreSol(g,cx,cy,R+6,ry+4,.22);
  /* la marquise au-dessus : un anneau de bois suspendu, avec ses lampes */
  g.fillStyle=Lg(g,cx-R,0,cx+R,0,[[0,'#f4f2ee'],[.4,'#ffffff'],[1,'#d8d4cc']]);g.beginPath();g.ellipse(cx,cy,R,ry,0,0,Math.PI);g.lineTo(cx-R,cy-H);g.ellipse(cx,cy-H,R,ry,0,Math.PI,0,true);g.fill();
  g.fillStyle='#1f3fa8';g.beginPath();g.ellipse(cx,cy-6,R,ry,0,.1,Math.PI-.1);g.ellipse(cx,cy-8,R,ry,0,Math.PI-.1,.1,true);g.fill();
  g.fillStyle='#b8875a';g.beginPath();g.ellipse(cx,cy-H,R+2,ry+1.5,0,0,7);g.fill();g.fillStyle='#d8a874';g.beginPath();g.ellipse(cx,cy-H-1,R+1,ry+.5,0,0,7);g.fill();
  g.fillStyle='#5a4632';g.beginPath();g.ellipse(cx,cy-H-1,R-9,ry-5,0,0,7);g.fill();   /* l'intérieur */
  /* la machine à espresso, les tasses, les viennoiseries */
  g.fillStyle='#c8ccd2';g.fillRect(cx-10,cy-H-14,20,12);g.fillStyle='#e8ecf0';g.fillRect(cx-10,cy-H-14,20,2);g.fillStyle='#2a2a30';g.fillRect(cx-7,cy-H-9,14,3);g.fillStyle='#c83a2a';g.fillRect(cx+5,cy-H-12,2,2);
  for(let k=0;k<4;k++){g.fillStyle='#fff';g.fillRect(cx-28+k*5,cy-H-4,3,3);}g.fillStyle='#e0a050';for(let k=0;k<3;k++){g.beginPath();g.ellipse(cx+20+k*5,cy-H-3,2.4,1.6,0,0,7);g.fill();}
  /* le barista */
  g.fillStyle='#2a2a34';g.fillRect(cx-2,cy-H-22,7,10);g.fillStyle='#e0b088';g.fillRect(cx-1,cy-H-30,6,7);g.fillStyle='#3a2a20';g.fillRect(cx-1.5,cy-H-31,7,3);g.fillStyle='#f4f0e4';g.fillRect(cx-2,cy-H-20,7,6);
  /* les suspensions : trois globes laiton au-dessus du comptoir */
  for(const dx of [-22,0,22]){g.fillStyle='#7a7e84';g.fillRect(cx+dx-.3,cy-H-90,.6,48);g.fillStyle='rgba(255,220,150,.25)';g.beginPath();g.ellipse(cx+dx,cy-H-36,12,6,0,0,7);g.fill();
    g.fillStyle='#d8b060';g.beginPath();g.arc(cx+dx,cy-H-42,4.6,Math.PI,0);g.fill();g.fillStyle='#fff3c8';g.beginPath();g.ellipse(cx+dx,cy-H-41.6,3.4,1.4,0,0,7);g.fill();}
  /* l'ardoise sur pied */
  g.fillStyle='#3a2a1c';g.fillRect(cx+R+6,cy-26,1.4,26);g.fillStyle='#22262a';g.fillRect(cx+R+2,cy-34,16,18);g.fillStyle='#b8875a';g.fillRect(cx+R+1,cy-35,18,1.4);
  g.fillStyle='#f4f0e4';g.font='bold 5px Arial';g.textAlign='center';g.fillText('CAFÉ',cx+R+10,cy-28);g.fillRect(cx+R+4,cy-25,12,.6);g.fillRect(cx+R+4,cy-22,10,.6);g.fillRect(cx+R+4,cy-19,11,.6);
  /* les tabourets hauts devant */
  for(const a of [.5,1.1,1.7,2.3]){const tx=cx+Math.cos(a)*(R+10),ty=cy+Math.sin(a)*(ry+6);g.fillStyle='rgba(30,26,20,.2)';g.beginPath();g.ellipse(tx+1,ty+1,4,1.4,0,0,7);g.fill();g.fillStyle='#4a4c52';g.fillRect(tx-.6,ty-12,1.2,12);g.fillStyle='#1f3fa8';g.beginPath();g.ellipse(tx,ty-12,4,1.8,0,0,7);g.fill();}}
function tableRonde(g,x,y){ombreSol(g,x,y,8,2.6,.2);g.fillStyle='#4a4c52';g.fillRect(x-.8,y-12,1.6,12);g.fillStyle='#f4f2ee';g.beginPath();g.ellipse(x,y-12,8,3.2,0,0,7);g.fill();g.fillStyle='#fff';g.fillRect(x-2,y-14,3,2);
  for(const dx of [-12,12]){g.fillStyle='#b8875a';g.fillRect(x+dx-3,y-8,6,2);g.fillStyle='#4a4c52';g.fillRect(x+dx-.5,y-6,1,6);g.fillRect(x+dx+(dx<0?-3:2),y-14,1,7);}}

let TCAFE=null,TTAB=null,TOLB=null;
function graverCafe(){if(TCAFE)return TCAFE;const Wd=150,Hd=160,sol=132;const {c,g}=toile(Wd,Hd);cafe(g,70,sol-17);TCAFE={toile:c,W:Wd,H:Hd,sol};return TCAFE;}
function graverTable(){if(TTAB)return TTAB;const Wd=40,Hd=26,sol=22;const {c,g}=toile(Wd,Hd);tableRonde(g,20,sol);TTAB={toile:c,W:Wd,H:Hd,sol};return TTAB;}
const MIEL={f0:'#c8955a',f1:'#d8a874',f2:'#9a6a3a',plante:olivierB};const RBO=54;
function graverBanqOlivier(){if(TOLB)return TOLB;const ry=RBO*.42,Wd=RBO*2+20,cyL=110,Hd=Math.ceil(cyL+ry+8);const {c,g}=toile(Wd,Hd);banquette(g,Wd/2,cyL,RBO,MIEL);TOLB={toile:c,W:Wd,H:Hd,sol:cyL+ry};return TOLB;}

/* ---------- 5. LA FICHE D'UN LOCAL, quand on touche sa vitrine ---------- */
const LOCAUX=(()=>{const L=[];let x=0;const p=(W-BOUT.reduce((a,b)=>a+b,0))/(BOUT.length+1);const NOMS=['A1','A2','A3',null,'B1','B2','B3'];
  const OU=['Côté café, en entrée de galerie','Côté café, sous les appliques','Face au café, près du hall bleu',null,'Face au jardin, près du hall bleu','Côté jardin, très passant','Côté jardin, en bout de galerie'];
  for(let i=0;i<BOUT.length;i++){x+=p;if(STYLES[i])L.push({id:NOMS[i],x:x+BOUT[i]/2,w:BOUT[i],m2:Math.round(BOUT[i]*.42),loyer:Math.round(BOUT[i]*16/100)*100,ou:OU[i],style:STYLES[i].nom,x0:x});x+=BOUT[i];}return L;})();
const MATIERE={marbre:'Marbre blanc et laiton',noyer:'Noyer, store vert sapin',granit:'Granit noir et or',laiton:'Laiton brossé',creme:'Pierre crème, store marine',ocre:'Ocre provençal, store terracotta'};
function ouvrirFiche(L){if(document.getElementById('ficheL'))return;
  if(!document.getElementById('cssFicheL')){const st=document.createElement('style');st.id='cssFicheL';st.textContent=`
#ficheL{position:fixed;inset:0;z-index:2147483000;display:flex;align-items:flex-end;justify-content:center;background:rgba(8,14,34,.55);opacity:0;transition:opacity .2s;font-family:'Baloo 2',Arial,sans-serif}
#ficheL.on{opacity:1}#ficheL .f{width:100%;max-width:460px;background:#f8f4ec;border-radius:24px 24px 0 0;padding:10px 18px calc(18px + env(safe-area-inset-bottom));transform:translateY(30px);transition:transform .25s;box-shadow:0 -10px 40px rgba(0,0,0,.4)}
#ficheL.on .f{transform:none}#ficheL .poi{width:44px;height:5px;border-radius:3px;background:#d8ccb4;margin:0 auto 12px}
#ficheL canvas{display:block;width:100%;border-radius:14px}#ficheL small{display:block;margin-top:12px;font:800 11px 'Baloo 2';letter-spacing:3px;color:#1f3fa8}
#ficheL h3{margin:2px 0 8px;font:400 28px 'Lilita One','Baloo 2';color:#1c2450}
#ficheL .g{display:grid;grid-template-columns:1fr 1fr;gap:8px}#ficheL .g div{background:#fff;border-radius:12px;padding:8px 12px;box-shadow:inset 0 0 0 1.5px #e8dfcc}
#ficheL .g i{display:block;font:800 10px 'Baloo 2';font-style:normal;letter-spacing:1.3px;color:#9a8a6a;text-transform:uppercase}#ficheL .g b{font:700 16px 'Baloo 2';color:#2a2018}
#ficheL .r{margin-top:12px;width:100%;height:56px;border:0;border-radius:16px;font:400 22px 'Lilita One';color:#fff;background:linear-gradient(#2e5ad0,#1f3fa8);box-shadow:0 4px 0 #142c78}
#ficheL .m{min-height:20px;margin-top:8px;text-align:center;font:700 14px 'Baloo 2';color:#1f3fa8}
#ficheL .x{display:block;margin:6px auto 0;background:none;border:0;font:700 14px 'Baloo 2';color:#9a8a6a}`;document.head.appendChild(st);}
  const d=document.createElement('div');d.id='ficheL';
  d.innerHTML='<div class="f"><div class="poi"></div><canvas width="600" height="300"></canvas><small>LOCAL '+L.id+' · LA GALERIE BLEUE</small><h3>Une boutique à toi</h3>'+
   '<div class="g"><div><i>Surface</i><b>'+L.m2+' m²</b></div><div><i>Loyer</i><b>'+L.loyer.toLocaleString('fr-FR')+' € / semaine</b></div><div><i>Emplacement</i><b>'+L.ou+'</b></div><div><i>Façade</i><b>'+MATIERE[L.style]+'</b></div></div>'+
   '<button class="r" type="button">Réserver ce local</button><div class="m"></div><button class="x" type="button">Fermer</button></div>';
  document.body.appendChild(d);
  try{const cv=d.querySelector('canvas'),k=cv.getContext('2d');const s=solFin();const sx=(L.x0-10)*2,sw=(L.w+20)*2;k.drawImage(s,sx,140,sw,(Y0-60)*2,0,0,600,300);}catch(x){}
  requestAnimationFrame(()=>d.classList.add('on'));
  const fermer=()=>{d.classList.remove('on');setTimeout(()=>d.remove(),220);};
  d.querySelector('.x').onclick=fermer;d.addEventListener('click',ev=>{if(ev.target===d)fermer();});
  ['pointerdown','touchstart','keydown'].forEach(tp=>d.addEventListener(tp,ev=>ev.stopPropagation()));
  d.querySelector('.r').onclick=()=>{let deja=[];try{deja=JSON.parse(localStorage.getItem('bdl.galerie.voeux')||'[]');}catch(x){}
    if(deja.indexOf(L.id)<0)deja.push(L.id);try{localStorage.setItem('bdl.galerie.voeux',JSON.stringify(deja));}catch(x){}
    d.querySelector('.m').textContent='Noté ! Les réservations ouvrent bientôt : le local '+L.id+' t’est mis de côté.';try{vibrer(10);}catch(x){}};
  try{vibrer(8);}catch(x){}}

/* ---------- LE DÉCOR ET LES OBSTACLES ---------- */
function decor(){const D=[];const P=(t,x,y,o)=>D.push(Object.assign({t,x,y,gr:0},o||{}));
  /* les palmiers contre les vitrines, entre deux maisons */
  for(const [x,y] of [[30,420],[1570,420],[580,420],[1020,420]])P('x_jol_tdp_palmier',x,y,{col:[26,8]});
  /* le hall bleu : ses suspensions et ses deux banquettes crème */
  for(let k=0;k<3;k++)for(const dx of [-72,72])P('x_jol_tdp_susp_sol',800+dx,410+k*100);
  for(const [x,y] of BANQ)P('x_jol_tdp_banquette_sol',x,Math.round(y+RBQ*.42),{col:[RBQ*2,40],v:1});
  /* LE COIN CAFÉ, à gauche : le comptoir rond, ses tables */
  P('x_jol_tdp_cafe_sol',320,620,{col:[96,30]});
  for(const [x,y] of [[170,580],[470,580],[150,660],[490,660],[200,720],[440,720],[320,735],[230,540],[410,540]])P('x_jol_tdp_table_sol',x,y,{col:[22,6]});
  /* LE COIN JARDIN, à droite : la grande banquette à l'olivier, des bancs, des fougères */
  P('x_jol_tdp_olivier_sol',1290,Math.round(620+RBO*.42),{col:[RBO*2,46]});
  for(const [x,y] of [[1160,690],[1420,690],[1160,560],[1420,560]])P('x_jol_tdp_banc',x,y,{col:[64,8]});
  /* LES LOCAUX : on touche la vitrine pour voir la fiche */
  return D;}
function bloque(x,y){
  if(ETG)return bloqueEtage(x,y);
  if(x<12||x>W-12)return true;
  if(y<Y0+10)return true;                                   /* les vitrines du fond */
  if(y>H-6)return true;
  for(const o of DECOR){if(!o.col)continue;if(Math.abs(x-o.x)<o.col[0]/2&&y>o.y-o.col[1]&&y<o.y+3)return true;}
  return false;}
const GRAVEURS={x_jol_tdp_cafe_sol:graverCafe,x_jol_tdp_table_sol:graverTable,x_jol_tdp_olivier_sol:graverBanqOlivier,x_jol_tdp_susp_sol:graverSusp,x_jol_tdp_murveg_sol:graverMur,x_jol_tdp_banquette_sol:v=>graverBanquette(v),x_jol_tdp_panneau_sol:graverPanneau,x_jol_tdp_portes_sol:()=>({toile:document.createElement('canvas'),W:1,H:1,sol:0}),x_jol_tdp_vide_sol:()=>({toile:document.createElement('canvas'),W:1,H:1,sol:0}),x_jol_tdp_rail_sol:v=>graverRail(v),x_jol_tdp_escalators_sol:graverEscalators,x_jol_tdp_tour_sol:graverTour,x_jol_tdp_palmier:graverPalmier,x_jol_tdp_banc:graverBanc};
function graver(t,v){const r=(GRAVEURS[t]||(()=>({toile:document.createElement('canvas'),W:1,H:1,sol:0})))(v||0);return {toile:r.toile,W:r.W,H:r.H,sol:r.sol};}

/* LES ESCALATORS : au pied (rez-de-chaussée) on monte ; sur la plaque (étage) on redescend */
let PASSE=false;
const aller=(q)=>{PASSE=true;try{sauver();}catch(x){}setTimeout(()=>{const v=window.MA_VERSION?('&v='+encodeURIComponent(window.MA_VERSION)):'';location.href='terrasses.html?'+q+v;},250);};
setInterval(()=>{try{
  if(PASSE||typeof joueur==='undefined')return;
  if(!ETG&&joueur.x<EX0-20&&joueur.x>EX0-60&&joueur.y>GY1-PROF&&joueur.y<GY2+10)aller('niveau=1');
  if(ETG&&joueur.x>PLAQUE[0]-4&&joueur.x<PLAQUE[0]+24&&joueur.y>PLAQUE[1]-30&&joueur.y<PLAQUE[1]+2)aller('de=etage');
}catch(x){}},150);
/* LA SORTIE : par les portes du sud, on retrouve la place de la Joliette */
let PARTI=false;
setInterval(()=>{try{
  if(ETG||PARTI||typeof joueur==='undefined')return;
  if(joueur.y>H-22){sortir();}
}catch(x){}},150);
function sortir(){if(PARTI)return;PARTI=true;
  try{sauver();}catch(x){}
  /* le fondu : la galerie s'efface dans la lumière du jour */
  try{const f=document.createElement('div');f.style.cssText='position:fixed;inset:0;z-index:2147483000;background:#fff8ea;opacity:0;transition:opacity .45s;pointer-events:none';document.body.appendChild(f);requestAnimationFrame(()=>f.style.opacity='1');}catch(x){}
  setTimeout(()=>{const v=window.MA_VERSION?('&v='+encodeURIComponent(window.MA_VERSION)):'';location.href='spawn.html?de=terrasses'+v;},480);}

/* ---------- LES PORTES DE SORTIE, vues de l'intérieur : elles s'ouvrent à l'approche ---------- */
let OUV=0;
function dessinerPortes(g,o,x,y){
  const dx=joueur.x-SORTIE_X,dy=joueur.y-MUR_S,pres=Math.abs(dx)<90&&dy>-90;
  OUV+=((pres?1:0)-OUV)*0.12;const e=OUV*OUV*(3-2*OUV);
  const L=PL,top=y-(H-MUR_S)+4,x0=x-L/2,hh=y-top;
  /* le jour dehors : ciel, la place, un platane */
  g.fillStyle=lin(g,0,top,0,y,[[0,'#bcdcf0'],[.5,'#eef4f6'],[.51,'#d8cdb8'],[1,'#cbbfa6']]);g.fillRect(x0,top,L,hh);
  for(let k=0;k<8;k++)R(g,x0+k*L/8,top+hh*.51,.5,hh*.49,'rgba(0,0,0,.1)');
  g.fillStyle='#c8862a';g.beginPath();g.ellipse(x0+24,top+hh*.32,16,10,0,0,7);g.fill();g.fillStyle='#e0a83a';g.beginPath();g.ellipse(x0+20,top+hh*.28,10,6,0,0,7);g.fill();R(g,x0+23,top+hh*.36,2.4,hh*.18,'#cfc6b4');
  /* les deux vantaux, qui glissent derrière les dormants */
  const vw=L/2-4,dec=e*(vw-6);
  g.save();g.beginPath();g.rect(x0,top,L,hh);g.clip();
  for(const s of [-1,1]){const vx=s<0?x-vw-dec:x+dec;
    g.fillStyle='rgba(200,228,238,.5)';g.fillRect(vx,top+3,vw,hh-3);
    R(g,vx,top+3,vw,2.4,'#5a5c62');R(g,vx,y-3,vw,3,'#5a5c62');R(g,s<0?vx+vw-2.4:vx,top+3,2.4,hh-3,'#5a5c62');R(g,s<0?vx:vx+vw-1.4,top+3,1.4,hh-3,'#5a5c62');
    R(g,s<0?vx+vw-8:vx+5,top+hh*.52,3,10,'#c8ccd2');
    g.fillStyle='rgba(255,255,255,.25)';g.beginPath();g.moveTo(vx+8,top+5);g.lineTo(vx+20,top+5);g.lineTo(vx+6,y-4);g.lineTo(vx-6,y-4);g.fill();}
  g.restore();
  /* dormants et caisson du mécanisme, bronze sombre */
  R(g,x0-8,top,8,hh,'#3a3c42');R(g,x0+L,top,8,hh,'#3a3c42');R(g,x0-8,top,1.4,hh,'#6a6e76');R(g,x0+L+6.6,top,1.4,hh,'#2a2c30');
  R(g,x0-10,top-12,L+20,13,'#3a3c42');R(g,x0-10,top-12,L+20,1.6,'#70747c');R(g,x0-10,top,L+20,1,'rgba(0,0,0,.4)');
  /* le panneau vert SORTIE, lumineux */
  const sx=x,sy=top-28;g.fillStyle='rgba(90,208,138,.25)';g.beginPath();g.ellipse(sx,sy+7,30,12,0,0,7);g.fill();
  R(g,sx-22,sy,44,14,'#0e8a3a');R(g,sx-22,sy,44,1.4,'#7ae0a6');R(g,sx-22,sy+12.6,44,1.4,'#06622a');
  g.fillStyle='#fff';g.font='bold 8px "Helvetica Neue",Arial,sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText('SORTIE',sx+5,sy+7.4);
  g.beginPath();g.arc(sx-15,sy+3.6,1.5,0,7);g.fill();R(g,sx-16,sy+5.4,2.2,6,'#fff');R(g,sx-18,sy+7,6,1.2,'#fff');
  R(g,sx-.5,top-14,1,0,'#666');
  /* le seuil inox */
  R(g,x0-8,y-2,L+16,2,'#c8ccd0');}
/* le panneau bleu suspendu, dans le style des Terrasses */
let TPAN=null;
function graverPanneau(){if(TPAN)return TPAN;const Wd=116,Hd=150,sol=146;const {c,g}=toile(Wd,Hd);const x=10,y=0;
  R(g,22,0,1.2,40,'#6a6e74');R(g,Wd-24,0,1.2,40,'#6a6e74');
  R(g,x+1,42,96,30,'rgba(0,0,0,.18)');R(g,x,40,96,30,BLEU);R(g,x,40,96,1.6,'#5a7ae0');R(g,x,68.4,96,1.6,'#162e80');
  g.fillStyle='#fff';g.beginPath();g.moveTo(x+7,50);g.lineTo(x+17,50);g.lineTo(x+12,58);g.closePath();g.fill();
  g.font='bold 7.4px "Helvetica Neue",Arial,sans-serif';g.textAlign='left';g.textBaseline='middle';g.fillText('Place de la Joliette',x+22,50.5);
  g.font='7px "Helvetica Neue",Arial,sans-serif';g.fillStyle='#d8e4ff';g.fillText('Sortie · Tram T2 · T3',x+22,61);
  /* son ombre au sol, très loin dessous */
  TPAN={toile:c,W:Wd,H:Hd,sol};return TPAN;}


return {sol,solFin,decor,bloque,graver,depart:DEPART,figurants:()=>[]};
})()
