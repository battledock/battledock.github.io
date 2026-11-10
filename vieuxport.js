/* =====================================================================
   LE VIEUX-PORT — le nouveau port, en U (vieuxport.html).
   En haut, la rangée de façades du quai des Belges, leurs boutiques et
   leurs terrasses ; devant, la grande promenade de granit et l'Ombrière,
   le toit-miroir où l'on se voit la tête en bas. Le bassin descend au
   milieu, plein de bateaux, et le ferry-boat le traverse. À gauche, la
   Rive Neuve et ses pontons ; à droite, le quai du Port et la criée du
   matin. Tout en bas, les deux forts gardent la sortie vers la mer.
   Chargé par moteur.js (eval direct). Ne touche à rien d'autre.
   ===================================================================== */
(()=>{
const W=800, H=800;
const PIED=206, QUAI_HAUT=258, BASSIN_Y=346, BX0=176, BX1=624;   /* le pied des façades, le haut du bassin, ses bords */
const RUE=[722,778];                                                /* la rue qui monte vers la Joliette */
const DEPART=(()=>{try{const q=new URLSearchParams(location.search).get('de');if(q==='croisiere')return [720,330];if(q==='ancien')return [80,330];}catch(x){}return [750,232];})();
const hA=(x,y,k)=>{let n=((x*73856093)^(y*19349663)^(k*83492791))|0;n=(n^(n>>>13))*1274126177|0;return((n^(n>>>16))>>>0)/4294967296;};
const tn=(hex,d)=>{const v=parseInt(hex.slice(1),16);const c=k=>Math.max(0,Math.min(255,((v>>k)&255)+d));return 'rgb('+c(16)+','+c(8)+','+c(0)+')';};
function toile(L,HH){const D=2,c=document.createElement('canvas');c.width=Math.ceil(L*D);c.height=Math.ceil(HH*D);const g=c.getContext('2d');g.setTransform(D,0,0,D,0,0);g.imageSmoothingEnabled=false;
  const R=(x,y,w,h,col)=>{if(w<=0||h<=0)return;g.fillStyle=col;g.fillRect(Math.round(x*2)/2,Math.round(y*2)/2,Math.max(.5,Math.round(w*2)/2),Math.max(.5,Math.round(h*2)/2));};return {c,g,R};}
function feuillage(g,cx,cy,rx,ry,pal,n,seed){for(let i=0;i<n;i++){const a=hA(i,seed,1)*6.283,r=Math.sqrt(hA(i,seed,2)),x=cx+Math.cos(a)*rx*r,y=cy+Math.sin(a)*ry*r;
  const l=((cx-x)/rx+(cy-y)/ry)*.5+hA(i,seed,3)*.4;g.fillStyle=l>.55?pal[3]:l>.15?pal[2]:l>-.3?pal[1]:pal[0];g.beginPath();g.ellipse(x,y,1.4+hA(i,seed,4)*1.8,1+hA(i,seed,5)*1.1,hA(i,seed,6)*3,0,7);g.fill();}}
const dansBassin=(x,y)=>x>BX0&&x<BX1&&y>BASSIN_Y;

/* ---------- LE SOL ---------- */
function sol(){const c=document.createElement('canvas');c.width=W;c.height=H;const g=c.getContext('2d');
  g.fillStyle='#d9cdb4';g.fillRect(0,0,W,H);g.fillStyle='#3a7f9c';g.fillRect(BX0,BASSIN_Y,BX1-BX0,H-BASSIN_Y);return c;}
function solFin(){const S=2,c=document.createElement('canvas');c.width=W*S;c.height=H*S;const g=c.getContext('2d');g.setTransform(S,0,0,S,0,0);
  const R=(x,y,w,h,col)=>{g.fillStyle=col;g.fillRect(x,y,w,h);};
  R(0,0,W,PIED,'#c9c0ae');
  /* le trottoir des terrasses : dalles claires */
  R(0,PIED,W,QUAI_HAUT-PIED,'#cfc6b4');
  for(let y=PIED;y<QUAI_HAUT;y+=13)for(let x=-((y/13|0)%2)*14;x<W;x+=28){R(x+.5,y+.5,27,12,['#ebe3d3','#e5dccb','#efe7d8','#e2d9c7'][(hA(x,y,1)*4)|0]);}
  R(0,PIED,W,4,'rgba(40,30,20,.20)');R(0,QUAI_HAUT-2,W,2,'#cbbfa6');
  /* la promenade : grandes dalles de granit, claires, posées en long */
  R(0,QUAI_HAUT,W,H-QUAI_HAUT,'#c4b89e');
  for(let y=QUAI_HAUT;y<H;y+=18)for(let x=-((y/18|0)%3)*22;x<W;x+=66){const t=['#ddd2bc','#d8cdb6','#e2d8c3','#d3c8b0','#dfd4be'][(hA(x,y,2)*5)|0];R(x+.5,y+.5,65,17,t);
    for(let k=0;k<6;k++)R(x+hA(x,y,k+9)*62,y+hA(x,y,k+19)*15,1,1,hA(x,y,k)<.5?'rgba(255,255,255,.35)':'rgba(90,70,40,.12)');}
  /* une bande de pavés sombres le long du bassin */
  const bande=(x,y,w,h)=>{for(let yy=y;yy<y+h;yy+=4)for(let xx=x-((yy/4|0)%2)*2;xx<x+w;xx+=4)R(Math.max(x,xx),yy,3.4,3.4,['#a89c86','#b0a48e','#9e927c'][(hA(xx,yy,3)*3)|0]);};
  bande(BX0-22,BASSIN_Y-22,BX1-BX0+44,10);bande(BX0-22,BASSIN_Y-12,10,H-BASSIN_Y+12);bande(BX1+12,BASSIN_Y-12,10,H-BASSIN_Y+12);
  /* l'eau du bassin : plus sombre au large, des reflets */
  for(let y=BASSIN_Y;y<H;y++){const k=(y-BASSIN_Y)/(H-BASSIN_Y);R(BX0,y,BX1-BX0,1,'rgb('+(52-k*22|0)+','+(128-k*30|0)+','+(150-k*16|0)+')');}
  for(let i=0;i<1400;i++){const x=BX0+hA(i,1,7)*(BX1-BX0),y=BASSIN_Y+hA(i,2,7)*(H-BASSIN_Y);R(x,y,2+hA(i,3,7)*6,.5,hA(i,4,7)<.5?'rgba(255,255,255,.10)':'rgba(10,40,60,.18)');}
  /* l'ombre du quai sur l'eau et le bord de pierre (la margelle) */
  R(BX0,BASSIN_Y,BX1-BX0,6,'rgba(10,30,40,.35)');R(BX0,BASSIN_Y,6,H-BASSIN_Y,'rgba(10,30,40,.25)');R(BX1-6,BASSIN_Y,6,H-BASSIN_Y,'rgba(10,30,40,.25)');
  const marg=(x,y,w,h)=>{R(x,y,w,h,'#efe6d2');R(x,y,w,1,'#fbf6ea');R(x,y+h-1,w,1,'#bfb196');};
  marg(BX0-6,BASSIN_Y-6,BX1-BX0+12,6);
  for(let y=BASSIN_Y;y<H;y+=1){R(BX0-6,y,6,1,'#efe6d2');R(BX1,y,6,1,'#efe6d2');}R(BX0-1,BASSIN_Y,1,H-BASSIN_Y,'#bfb196');R(BX1+5,BASSIN_Y,1,H-BASSIN_Y,'#bfb196');
  for(let x=BX0;x<BX1;x+=24)R(x,BASSIN_Y-6,.5,6,'#d6cab2');for(let y=BASSIN_Y;y<H;y+=24){R(BX0-6,y,6,.5,'#d6cab2');R(BX1,y,6,.5,'#d6cab2');}
  /* la rue qui monte vers la Joliette */
  R(RUE[0],0,RUE[1]-RUE[0],PIED,'#6a6c72');for(let y=0;y<PIED;y+=10)R(RUE[0]+(RUE[1]-RUE[0])/2-1,y,2,6,'#e9e6dc');
  R(RUE[0]-4,0,4,PIED,'#c9c0ae');R(RUE[1],0,4,PIED,'#c9c0ae');
  /* les plaques des pontons sur l'eau, en bois */
  for(const [x0,x1,y] of PONTONS){for(let x=x0;x<x1;x+=3)R(x,y-5,2.6,10,['#a87a4a','#9a6e40','#b4844e'][(hA(x,y,5)*3)|0]);R(x0,y+5,x1-x0,1.2,'rgba(10,30,40,.35)');}
  return c;}

/* ---------- LES FAÇADES DU QUAI DES BELGES ---------- */
const ENDUITS=['#e9c98e','#e4b27a','#f0dcb4','#d99a6a','#ecd2a2','#e2bf8c','#f3e2c2','#d8a878'];
const VOLETS=['#4f7d6a','#3e6a8a','#7a8a5a','#5a7a9a','#2f6b5a','#8a6a4a'];
const BOUTIQUES=[['BAR DE LA MARINE','#b8322a','#fff3e0'],['TABAC','#2a4a8a','#ffffff'],['SAVONNERIE','#6a8a3a','#fffbe8'],['SANTONS','#8a3a5a','#fff0f4'],['CROUSTI’PORT','#d88a2a','#2a1a0a'],['LA CRIÉE','#2a6a8a','#ffffff'],['GLACES','#e86a8a','#ffffff']];
function graverFacades(){const L=W,HH=PIED+4,{c,g,R}=toile(L,HH),s=PIED;
  /* le ciel derrière les toits */
  const gr=g.createLinearGradient(0,0,0,30);gr.addColorStop(0,'#8ec4e8');gr.addColorStop(1,'#cfe6f4');g.fillStyle=gr;g.fillRect(0,0,L,30);
  let x=0,i=0;const blocs=[];
  while(x<L){let w=[96,108,88,112,100][i%5];if(x<RUE[0]&&x+w>RUE[0]-4)w=RUE[0]-4-x;if(x>=RUE[0]-4&&x<RUE[1]+4){x=RUE[1]+4;continue;}if(x+w>L)w=L-x;if(w<30){x+=w;continue;}blocs.push([x,w,i]);x+=w;i++;}
  for(const [x0,w,k] of blocs){const et=5+((hA(k,1,3)*2)|0),hRdc=34,hEt=24,haut=s-hRdc-et*hEt-8,col=ENDUITS[k%ENDUITS.length],vol=VOLETS[(k*3)%VOLETS.length];
    /* le toit de tuiles, vu d'un peu haut */
    R(x0,haut-10,w,10,'#b4593a');for(let ty=haut-10;ty<haut;ty+=2.5)for(let tx=x0+((ty*2|0)%2)*2;tx<x0+w;tx+=4)R(tx,ty,3,2,hA(tx,ty,4)<.5?'#c86a46':'#a84e32');
    R(x0+w*.2,haut-18,6,9,'#c8a07a');R(x0+w*.2-1,haut-19,8,2,'#8a6a4a');if(w>90){R(x0+w*.7,haut-16,5,7,'#c8a07a');R(x0+w*.7-1,haut-17,7,2,'#8a6a4a');}
    /* l'enduit, sa corniche, ses bandeaux */
    R(x0,haut,w,s-haut,col);R(x0,haut,w,3,tn(col,24));R(x0,haut+3,w,1,tn(col,-30));
    for(let j=0;j<w;j+=3)for(let yy=haut+4;yy<s-hRdc;yy+=3)if(hA(x0+j,yy,6)<.18)R(x0+j,yy,1,1,tn(col,hA(j,yy,7)<.5?-12:10));
    R(x0,haut,1,s-haut,tn(col,-26));R(x0+w-1,haut,1,s-haut,tn(col,14));
    const nf=Math.max(2,Math.floor((w-10)/24)),pas=(w-10)/nf;
    for(let e=0;e<et;e++){const yy=haut+8+e*hEt;R(x0,yy+hEt-3,w,1.5,tn(col,-14));
      for(let f=0;f<nf;f++){const fx=x0+5+f*pas+pas/2-5,ouvert=hA(k,e*9+f,8)<.35;
        R(fx-1,yy-1,12,18,tn(col,-22));R(fx,yy,10,16,'#2a3440');R(fx+1,yy+1,3.5,6,'#4a6a80');R(fx+5.5,yy+1,3.5,6,'#4a6a80');
        if(ouvert){R(fx-5,yy,4.5,16,vol);R(fx+10.5,yy,4.5,16,vol);for(let l=1;l<16;l+=2){R(fx-5,yy+l,4.5,.5,tn(vol,-24));R(fx+10.5,yy+l,4.5,.5,tn(vol,-24));}}
        else{R(fx,yy,10,16,vol);for(let l=1;l<16;l+=2)R(fx,yy+l,10,.5,tn(vol,-24));R(fx+4.8,yy,.5,16,tn(vol,-34));}
        if(e===0||(e===2&&f%2===0)){R(fx-3,yy+15,16,1.5,'#3a3a3a');for(let b=fx-3;b<fx+13;b+=2)R(b,yy+11,.6,4,'#3a3a3a');R(fx-3,yy+11,16,.7,'#3a3a3a');}
        if(hA(k,e*7+f,11)<.15){R(fx+1,yy+12,8,3,'#8a5a3a');R(fx+1,yy+10,2,2,'#e8402a');R(fx+4,yy+10,2,2,'#f2b030');R(fx+7,yy+10,2,2,'#e86aa0');}}}
    /* le rez-de-chaussée : la boutique, son store, son enseigne */
    const B=BOUTIQUES[k%BOUTIQUES.length],y0=s-hRdc;
    R(x0,y0,w,hRdc,tn(col,-8));R(x0,y0,w,2,tn(col,-40));
    R(x0+4,y0+12,w-8,hRdc-12,'#2a3036');R(x0+5,y0+13,w-10,hRdc-14,'#3e5262');
    for(let v=x0+5;v<x0+w-6;v+=16){R(v,y0+13,1,hRdc-14,'#20262c');R(v+3,y0+15,4,8,'rgba(255,255,255,.12)');}
    R(x0+w/2-6,y0+14,12,hRdc-14,'#20262c');R(x0+w/2-5,y0+15,10,hRdc-16,'#5a4a3a');
    R(x0+3,y0+2,w-6,9,B[1]);g.fillStyle=B[2];g.font='bold 6px "Helvetica Neue",Arial,sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText(B[0],x0+w/2,y0+6.8,w-10);
    /* le store rayé, déroulé */
    for(let st=0;st<w-6;st+=6){R(x0+3+st,y0+11,3,6,B[1]);R(x0+6+st,y0+11,3,6,'#f6f1e6');}
    for(let st=0;st<w-6;st+=3)R(x0+3+st,y0+17,3,1.5,st%6?'#f6f1e6':B[1]);
    R(x0+3,y0+18.5,w-6,1,'rgba(0,0,0,.18)');}
  /* les angles de la rue */
  R(RUE[0]-4,0,4,s,'rgba(0,0,0,.18)');R(RUE[1],0,4,s,'rgba(0,0,0,.12)');
  return {toile:c,W:L,H:HH,sol:s};}

/* ---------- LES BATEAUX ---------- */
const COQUES=[['#f6f1e6','#2a6ab8'],['#2a6ab8','#f6f1e6'],['#f6f1e6','#d8402a'],['#3a8a5a','#f2d24a'],['#f2d24a','#2a6ab8'],['#d8402a','#f6f1e6']];
function graverPointu(v){const L=46,HH=24,{c,g,R}=toile(L,HH),[coque,bande]=COQUES[v%COQUES.length],cx=L/2,cy=13;
  g.fillStyle='rgba(10,30,40,.35)';g.beginPath();g.ellipse(cx+1,cy+4,21,6,0,0,7);g.fill();
  const forme=(rx,ry,dy,col)=>{g.fillStyle=col;g.beginPath();g.moveTo(cx-rx,cy+dy);g.quadraticCurveTo(cx,cy-ry+dy,cx+rx,cy+dy);g.quadraticCurveTo(cx,cy+ry+dy,cx-rx,cy+dy);g.fill();};
  forme(21,12,1,tn(coque,-40));forme(20,11,0,coque);forme(19,9,0,bande);forme(18,7.6,0,'#c89a62');
  for(let k=-14;k<15;k+=3)R(cx+k,cy-5,.5,10,'#a87a4a');
  R(cx-6,cy-3.5,10,7,'#f6f1e6');R(cx-6,cy-3.5,10,1.2,'#ffffff');R(cx-5,cy-2,3,2.5,'#3a5a7a');R(cx-1,cy-2,3,2.5,'#3a5a7a');
  R(cx+10,cy-1,4,2,'#6a4a2a');R(cx-17,cy-.5,3,1,'#3a3a3a');
  return {toile:c,W:L,H:HH,sol:cy+6};}
function graverVoilier(v){const L=70,HH=96,{c,g,R}=toile(L,HH),cx=L/2,cy=HH-14,coque=['#ffffff','#e8eef4','#1f3a5a'][v%3];
  g.fillStyle='rgba(10,30,40,.35)';g.beginPath();g.ellipse(cx+2,cy+5,32,7,0,0,7);g.fill();
  const forme=(rx,ry,dy,col)=>{g.fillStyle=col;g.beginPath();g.moveTo(cx-rx,cy+dy);g.lineTo(cx-rx+6,cy-ry+dy);g.quadraticCurveTo(cx+rx-6,cy-ry+dy,cx+rx,cy+dy);g.quadraticCurveTo(cx+rx-6,cy+ry+dy,cx-rx+6,cy+ry+dy);g.closePath();g.fill();};
  forme(31,10,1,'#8a9aa8');forme(30,9.5,0,coque);forme(27,7.6,0,'#c8a06a');for(let k=-24;k<24;k+=2.5)R(cx+k,cy-7,.4,14,'#b08a58');
  R(cx-8,cy-4.5,16,9,'#f6f6f2');R(cx-8,cy-4.5,16,1.2,'#ffffff');R(cx-6,cy-2.5,3,3,'#2a3a4a');R(cx-1.5,cy-2.5,3,3,'#2a3a4a');R(cx+3,cy-2.5,3,3,'#2a3a4a');
  /* le mât, la bôme et la voile ferlée sous sa housse */
  R(cx-1,4,2,cy-6,'#c8ccd0');R(cx-1,4,.7,cy-6,'#ffffff');R(cx-1,cy-12,26,2,'#b8bcc0');
  R(cx,cy-15,25,4,['#2a5a9a','#9a2a2a','#2a7a6a'][v%3]);R(cx,cy-15,25,1,'rgba(255,255,255,.3)');
  g.strokeStyle='rgba(60,60,60,.55)';g.lineWidth=.35;g.beginPath();g.moveTo(cx,5);g.lineTo(cx-28,cy-2);g.moveTo(cx,5);g.lineTo(cx+28,cy-2);g.stroke();
  R(cx-2,3,4,2,'#e8402a');
  return {toile:c,W:L,H:HH,sol:cy+6};}
function graverFerry(){const L=64,HH=40,{c,g,R}=toile(L,HH),cx=L/2,cy=26;
  g.fillStyle='rgba(10,30,40,.35)';g.beginPath();g.ellipse(cx+1,cy+5,30,7,0,0,7);g.fill();
  g.fillStyle='#1f4a8a';g.beginPath();g.roundRect?g.roundRect(cx-29,cy-9,58,18,8):g.rect(cx-29,cy-9,58,18);g.fill();
  g.fillStyle='#f6f1e6';g.beginPath();g.roundRect?g.roundRect(cx-27,cy-8,54,15,7):g.rect(cx-27,cy-8,54,15);g.fill();
  R(cx-27,cy+2,54,3,'#2a6ab8');
  /* le toit-auvent, sur ses montants */
  for(const k of [-18,-6,6,18])R(cx+k,cy-20,1,13,'#3a3a44');
  R(cx-22,cy-24,44,6,'#e8eef4');R(cx-22,cy-24,44,1.2,'#ffffff');R(cx-22,cy-19,44,1,'#a8b4c0');
  g.fillStyle='#1f4a8a';g.font='bold 4.6px "Helvetica Neue",Arial,sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText('FERRY BOAT',cx,cy-21);
  for(const k of [-15,-5,5,15])R(cx+k-2,cy-5,4,4,'#c8a06a');
  return {toile:c,W:L,H:HH,sol:cy+6};}

/* ---------- LE MOBILIER DU QUAI ---------- */
function graverPlatane(v){const L=84,HH=112,{c,g,R}=toile(L,HH),cx=L/2,s=HH-6;
  g.fillStyle='rgba(40,34,26,.22)';g.beginPath();g.ellipse(cx+6,s-1,26,7,0,0,7);g.fill();
  R(cx-3,s-46,6,46,'#a89a7a');for(let y=s-46;y<s;y+=4)R(cx-3+hA(v,y,1)*4,y,2.5,2.5,hA(v,y,2)<.5?'#d8d0b8':'#7a6e56');
  R(cx-9,s-1,18,2,'#6a6458');
  feuillage(g,cx,s-66,36,28,['#3f6a2e','#5a8a3a','#7aa84a','#a2c860'],520,v*7+3);
  return {toile:c,W:L,H:HH,sol:s};}
function graverLampadaire(){const L=24,HH=64,{c,g,R}=toile(L,HH),cx=L/2,s=HH-3;
  g.fillStyle='rgba(40,34,26,.25)';g.beginPath();g.ellipse(cx+2,s,5,1.8,0,0,7);g.fill();
  R(cx-3,s-4,6,4,'#2f3a34');R(cx-1,s-50,2,46,'#2f3a34');R(cx-.6,s-50,.6,46,'#5a6a60');
  R(cx-5,s-56,10,2,'#2f3a34');R(cx-4,s-54,8,7,'#f6e8b8');R(cx-4,s-54,8,1,'#2f3a34');R(cx-.4,s-54,.8,7,'#2f3a34');R(cx-2,s-59,4,3,'#2f3a34');
  return {toile:c,W:L,H:HH,sol:s,feux:[{x:cx,y:s-50,r:26,teinte:'rgba(255,230,170,§)'}]};}
function graverBitte(){const L=10,HH=10,{c,g,R}=toile(L,HH),cx=5,s=8;g.fillStyle='rgba(30,26,18,.3)';g.beginPath();g.ellipse(cx+1,s,3.5,1.4,0,0,7);g.fill();
  R(cx-2.5,s-6,5,6,'#2a2e34');R(cx-3.5,s-7,7,2,'#3a4048');R(cx-2.5,s-6,1,6,'#4a525a');return {toile:c,W:L,H:HH,sol:s};}
function graverParasol(v){const L=60,HH=62,{c,g,R}=toile(L,HH),cx=L/2,s=HH-6,col=[['#b8322a','#f6f1e6'],['#2a4a8a','#f6f1e6'],['#d88a2a','#fff6e0']][v%3];
  g.fillStyle='rgba(40,34,26,.2)';g.beginPath();g.ellipse(cx+4,s,24,6,0,0,7);g.fill();
  for(const [dx,dy] of [[-12,-2],[12,-2],[-12,6],[12,6]]){R(cx+dx-4,s+dy-9,8,6,'#8a5a3a');R(cx+dx-4,s+dy-9,8,1,'#a87a4a');}
  R(cx-6,s-9,12,10,'#f6f1e6');R(cx-6,s-9,12,1,'#ffffff');R(cx-.5,s-40,1,32,'#6a6a6a');
  for(let i=0;i<8;i++){g.fillStyle=col[i%2];g.beginPath();g.moveTo(cx,s-44);const a0=i/8*6.283,a1=(i+1)/8*6.283;g.lineTo(cx+Math.cos(a0)*26,s-34+Math.sin(a0)*9);g.lineTo(cx+Math.cos(a1)*26,s-34+Math.sin(a1)*9);g.closePath();g.fill();}
  return {toile:c,W:L,H:HH,sol:s};}
function graverEtal(v){const L=56,HH=40,{c,g,R}=toile(L,HH),cx=L/2,s=HH-4;
  g.fillStyle='rgba(40,34,26,.22)';g.beginPath();g.ellipse(cx+3,s,24,4,0,0,7);g.fill();
  for(const k of [-22,20])R(cx+k,s-12,2,12,'#8a8a8a');
  R(cx-24,s-16,48,6,'#9aa4ac');R(cx-24,s-16,48,1,'#d8e0e6');R(cx-23,s-15,46,4,'#e8eef2');
  for(let i=0;i<9;i++){const x=cx-21+i*5,col=['#9ab0c0','#c86a5a','#b8c4cc','#d8a050'][(i+v)%4];g.fillStyle=col;g.beginPath();g.ellipse(x,s-13.5,2.4,1,0.3,0,7);g.fill();R(x+1.8,s-14,1,1,'#3a3a3a');}
  R(cx-26,s-30,52,4,'#2a6a8a');for(let k=0;k<52;k+=8)R(cx-26+k,s-30,4,4,'#f6f1e6');for(const k of [-25,23])R(cx+k,s-27,1,12,'#6a6a6a');
  return {toile:c,W:L,H:HH,sol:s};}
function graverFort(cote){const L=170,HH=96,{c,g,R}=toile(L,HH),s=HH-2,pierre='#d8b88a';
  R(0,26,L,s-26,pierre);for(let y=26;y<s;y+=5)for(let x=((y/5|0)%2)*5;x<L;x+=10){R(x,y,9.4,4.4,['#d8b88a','#d0ae80','#e0c294','#c8a676'][(hA(x,y,cote)*4)|0]);}
  for(let x=0;x<L;x+=12){R(x,18,8,9,pierre);R(x,18,8,1.5,'#ecd2a6');}
  R(0,26,L,1.5,'rgba(0,0,0,.2)');
  const tx=cote?L-40:40;g.fillStyle='#d0ae80';g.beginPath();g.ellipse(tx,30,24,10,0,0,7);g.fill();R(tx-24,6,48,24,'#dcbc8e');g.fillStyle='#e6c89a';g.beginPath();g.ellipse(tx,6,24,9,0,0,7);g.fill();
  for(let k=-22;k<22;k+=8)R(tx+k,-1,5,6,'#dcbc8e');R(tx-2,12,4,9,'#3a2a1a');
  R(cote?6:L-22,40,16,14,'#3a2a1a');R(cote?7:L-21,41,14,13,'#2a1e14');
  if(!cote){R(tx-.5,-26,1,24,'#6a6a6a');R(tx+.5,-26,14,9,'#2a4a9a');R(tx+.5,-26,14,3,'#ffffff');}
  return {toile:c,W:L,H:HH+30,sol:s+30};}
function graverBanc(){const L=30,HH=16,{c,g,R}=toile(L,HH),cx=L/2,s=HH-3;g.fillStyle='rgba(40,34,26,.22)';g.beginPath();g.ellipse(cx+2,s,13,2.2,0,0,7);g.fill();
  for(const k of [-11,9])R(cx+k,s-6,2,6,'#2f3a34');R(cx-13,s-7,26,2,'#8a5a3a');R(cx-13,s-9.5,26,2,'#9a6a42');R(cx-13,s-12,26,2,'#8a5a3a');R(cx-13,s-12,26,.6,'#b48452');return {toile:c,W:L,H:HH,sol:s};}
function graverNavette(v){const L=56,HH=74,{c,g,R}=toile(L,HH),cx=L/2,s=HH-4;
  g.fillStyle='rgba(40,34,26,.25)';g.beginPath();g.ellipse(cx+3,s,9,2.4,0,0,7);g.fill();
  R(cx-1.5,s-44,3,44,'#3a4048');R(cx-1.5,s-44,1,44,'#6a727a');
  const col=v?'#6a5a4a':'#1f4a8a';R(cx-26,s-70,52,28,col);R(cx-26,s-70,52,2,'rgba(255,255,255,.3)');R(cx-24,s-68,48,24,tn(col,-12));
  g.fillStyle='#fff';g.font='bold 5.6px "Helvetica Neue",Arial,sans-serif';g.textAlign='center';g.textBaseline='middle';
  if(v){g.fillText('ANCIEN PORT',cx,s-61);g.font='bold 4.4px "Helvetica Neue",Arial,sans-serif';g.fillText('boutiques · métro',cx,s-51);}
  else{g.fillText('TERMINAL',cx,s-62);g.fillText('CROISIÈRES',cx,s-55);g.font='bold 4.2px "Helvetica Neue",Arial,sans-serif';g.fillStyle='#f2c94c';g.fillText('EMBAUCHE DOCKERS',cx,s-47.5);
    R(cx+14,s-66,8,3,'#ffffff');R(cx+15,s-69,5,3,'#ffffff');}
  return {toile:c,W:L,H:HH,sol:s};}
function graverOmbriereVide(){const c=document.createElement('canvas');c.width=2;c.height=2;return {toile:c,W:1,H:1,sol:0};}
const GRAVEURS={x_jol_facades:graverFacades,x_jol_pointu:graverPointu,x_jol_voilier:graverVoilier,x_jol_platane:graverPlatane,x_jol_lampadaire:graverLampadaire,x_jol_bitte:graverBitte,x_jol_parasol:graverParasol,x_jol_etal:graverEtal,
  x_jol_banc:graverBanc,x_jol_navette:graverNavette,x_jol_fort_g:()=>graverFort(0),x_jol_fort_d:()=>graverFort(1),x_jol_entree:graverOmbriereVide};
function graver(t,v){return (GRAVEURS[t]||graverOmbriereVide)(v||0);}

/* ---------- LE DÉCOR ---------- */
const PONTONS=[[BX0,BX0+70,430],[BX0,BX0+70,620],[BX0,BX0+70,730],[BX1-70,BX1,420],[BX1-70,BX1,650]];
const BATEAUX=[];
function decor(){const D=[];const P=(t,x,y,o)=>D.push(Object.assign({t,x,y,gr:0},o||{}));
  P('x_jol_facades',W/2,PIED);
  /* les terrasses devant le Bar de la Marine et les glaciers */
  for(const [x,v] of [[40,0],[110,0],[520,2],[590,1],[660,1]])P('x_jol_parasol',x,248,{v,col:[40,10],bas:4});
  /* les platanes de la Rive Neuve et du quai du Port */
  for(const y of [400,700])P('x_jol_platane',60,y,{v:y,col:[12,6]});
  for(const y of [470,600])P('x_jol_platane',W-60,y,{v:y+1,col:[12,6]});
  P('x_jol_entree',MANEGE.x,MANEGE.y,{col:[100,22]});
  for(const [x,y] of [[140,410],[140,700],[660,540],[660,690],[250,312],[550,312]])P('x_jol_banc',x,y,{col:[26,4]});
  /* les lampadaires */
  for(const [x,y] of [[150,322],[650,322],[120,470],[680,470],[120,640],[680,640],[300,298],[500,298]])P('x_jol_lampadaire',x,y,{col:[4,3]});
  /* les bittes d'amarrage, le long de la margelle */
  for(let x=BX0+20;x<BX1;x+=56)P('x_jol_bitte',x,BASSIN_Y-9,{col:[6,3]});
  for(let y=BASSIN_Y+40;y<H-60;y+=64){P('x_jol_bitte',BX0-12,y,{col:[6,3]});P('x_jol_bitte',BX1+12,y,{col:[6,3]});}
  /* la criée du matin, sur le quai du Port */
  P('x_jol_navette',720,312,{v:0,col:[8,4],agir:()=>partir('croisiere.html?t='+Date.now()),libelle:'Aller au terminal croisières',nom:'NAVETTE · EMBAUCHE'});
  P('x_jol_navette',80,312,{v:1,col:[8,4],agir:()=>partir('jeu.html?carte=extramar&arrivee=1&de=joliette'),libelle:'Aller à l’ancien port',nom:'ANCIEN PORT'});
  P('x_jol_etal',700,360,{v:0,col:[50,6]});P('x_jol_etal',700,400,{v:1,col:[50,6]});
  /* les deux forts, en bas */
  P('x_jol_fort_g',85,H-4,{col:[170,60]});P('x_jol_fort_d',W-85,H-4,{col:[170,60]});
  return D;}

/* les bateaux à quai : ils bougent avec l'eau, donc ce sont des acteurs */
const AMARRES=[];
(function(){let i=0;
  for(let x=BX0+34;x<BX1-20;x+=46)AMARRES.push({t:'pointu',x,y:BASSIN_Y+16,v:i++});
  for(const [x0,x1,y] of PONTONS){const mx=(x0+x1)/2+(x0===BX0?8:-8);AMARRES.push({t:'voilier',x:mx,y:y-11,v:i++,mat:1});AMARRES.push({t:'voilier',x:mx,y:y+25,v:i++,mat:1});}
  for(let y=BASSIN_Y+30;y<H-20;y+=24)if(!PONTONS.some(p=>p[0]===BX0&&Math.abs(p[2]-y)<40)&&Math.abs(y-520)>20){AMARRES.push({t:'pointu',x:BX0+26,y,v:i++});}
  for(let y=BASSIN_Y+30;y<H-20;y+=24)if(!PONTONS.some(p=>p[1]===BX1&&Math.abs(p[2]-y)<40)&&Math.abs(y-520)>20)AMARRES.push({t:'pointu',x:BX1-26,y,v:i++});
})();
const CACHE={};
const can=(t,v)=>CACHE[t+v]||(CACHE[t+v]=t==='pointu'?graverPointu(v):t==='voilier'?graverVoilier(v):graverFerry());
let nk=0;
function poser(g,o,x,y){const k=can(o.t,o.v);g.drawImage(k.toile,Math.round((x-k.W/2)*2)/2,Math.round((y-k.sol)*2)/2,k.W,k.H);
  if(nk>.02){g.globalAlpha=nk*.55;g.fillStyle='#0a1830';g.globalCompositeOperation='source-atop';g.globalCompositeOperation='source-over';g.globalAlpha=1;}}
/* le ferry-boat fait l'aller-retour entre les deux rives */
const FERRY={y:520,x0:BX0+40,x1:BX1-40,periode:40};
function posFerry(){const t=(performance.now()/1000)%FERRY.periode,p=FERRY.periode/2,tr=12;let k;
  if(t<tr)k=t/tr;else if(t<p)k=1;else if(t<p+tr)k=1-(t-p)/tr;else k=0;k=k<.5?2*k*k:1-Math.pow(-2*k+2,2)/2;return FERRY.x0+(FERRY.x1-FERRY.x0)*k;}

/* l'ombrière : le grand toit-miroir où l'on se voit la tête en bas */
const OMB={x0:322,x1:478,y0:272,y1:330};
function dessinerOmbriere(g,cx,cy){
  const X=OMB.x0-cx,Y=OMB.y0-cy,w=OMB.x1-OMB.x0,h=OMB.y1-OMB.y0;
  g.fillStyle='rgba(40,34,26,.18)';g.fillRect(X+8,Y+h+2,w,6);
  for(const px of [12,w/2,w-12])for(const py of [h-6,10]){g.fillStyle='#8a929a';g.fillRect(X+px-1,Y+py-26,2,26);}
  g.save();g.translate(0,-26);
  g.fillStyle='rgba(176,190,200,.80)';g.fillRect(X,Y,w,h);
  /* le reflet : ce qui se passe dessous, retourné */
  g.save();g.beginPath();g.rect(X,Y,w,h);g.clip();
  const sous=[];try{if(joueur.x>OMB.x0-20&&joueur.x<OMB.x1+20&&joueur.y>OMB.y0-10&&joueur.y<OMB.y1+40)sous.push({x:joueur.x,y:joueur.y,ap:e.ap,dir:joueur.dir});}catch(x){}
  for(const f of FIG)if(f.x>OMB.x0-20&&f.x<OMB.x1+20&&f.y>OMB.y0-10&&f.y<OMB.y1+40)sous.push(f);
  g.globalAlpha=.55;for(const s of sous){g.save();const rx=Math.round(s.x-cx),ry=Math.round(OMB.y0+(OMB.y1-s.y)*.9-cy-4);g.translate(rx,ry);g.scale(1,-1);try{personne(g,0,0,s.ap,s.dir==='haut'?'bas':s.dir==='bas'?'haut':s.dir,0,false);}catch(x){}g.restore();}
  g.globalAlpha=1;g.restore();
  const gr=g.createLinearGradient(X,Y,X+w,Y+h);gr.addColorStop(0,'rgba(255,255,255,.35)');gr.addColorStop(.5,'rgba(255,255,255,0)');gr.addColorStop(1,'rgba(255,255,255,.18)');g.fillStyle=gr;g.fillRect(X,Y,w,h);
  g.fillStyle='#e8eef2';g.fillRect(X,Y,w,1);g.fillStyle='#6a747c';g.fillRect(X,Y+h-1,w,1.5);
  g.restore();}

/* le manège de la Rive Neuve : ses chevaux montent et descendent */
const MANEGE={x:92,y:566};
function dessinerManege(g,cx,cy){g.save();g.translate(MANEGE.x-cx,MANEGE.y-cy);g.scale(1.6,1.6);g.translate(-(MANEGE.x-cx),-(MANEGE.y-cy));dessinerManege0(g,cx,cy);g.restore();}
function dessinerManege0(g,cx,cy){const X=MANEGE.x-cx,Y=MANEGE.y-cy,t=performance.now()/1000;
  g.fillStyle='rgba(40,34,26,.25)';g.beginPath();g.ellipse(X+3,Y+2,34,9,0,0,7);g.fill();
  g.fillStyle='#c8a050';g.beginPath();g.ellipse(X,Y-2,32,9,0,0,7);g.fill();g.fillStyle='#e8d0a0';g.beginPath();g.ellipse(X,Y-4,30,8,0,0,7);g.fill();
  const N=6,cav=[];for(let i=0;i<N;i++){const a=t*.9+i/N*6.283,x=X+Math.cos(a)*22,y=Y-4+Math.sin(a)*6,h=Math.sin(t*3+i)*2.5;cav.push({a,x,y,h,i});}
  cav.sort((p,q)=>p.y-q.y);
  const derriere=cav.filter(c=>Math.sin(c.a)<0),devant=cav.filter(c=>Math.sin(c.a)>=0);
  const cheval=c=>{g.fillStyle='#d8c8a0';g.fillRect(c.x-.5,Y-40,1,c.y-Y+40);const hy=c.y-14+c.h,col=['#ffffff','#f2d0a0','#e8b0c0','#c8e0f0','#f6e6a0','#d0f0c8'][c.i];
    g.fillStyle=col;g.fillRect(c.x-5,hy,10,5);g.fillRect(c.x+(Math.cos(c.a)>0?-6:4),hy-4,3,6);g.fillStyle='#8a5a3a';g.fillRect(c.x+(Math.cos(c.a)>0?-6:4),hy-4,3,1.5);
    g.fillStyle=col;g.fillRect(c.x-4,hy+5,1.5,3);g.fillRect(c.x+3,hy+5,1.5,3);g.fillStyle='#d8402a';g.fillRect(c.x-2,hy-1,4,1.5);};
  derriere.forEach(cheval);
  g.fillStyle='#b8322a';g.fillRect(X-2,Y-44,4,40);g.fillStyle='#f2c94c';g.fillRect(X-2,Y-30,4,2);
  devant.forEach(cheval);
  /* le chapiteau rayé */
  for(let i=0;i<12;i++){g.fillStyle=i%2?'#f6f1e6':'#b8322a';g.beginPath();g.moveTo(X,Y-62);const a0=i/12*6.283,a1=(i+1)/12*6.283;g.lineTo(X+Math.cos(a0)*34,Y-44+Math.sin(a0)*9);g.lineTo(X+Math.cos(a1)*34,Y-44+Math.sin(a1)*9);g.closePath();g.fill();}
  for(let i=0;i<24;i++){const a=i/24*6.283;if(Math.sin(a)<-.2)continue;g.fillStyle=((i+(t*4|0))%2)?'#fff2b0':'#c8a050';g.fillRect(X+Math.cos(a)*33-.7,Y-44+Math.sin(a)*9-.7,1.4,1.4);}
  g.fillStyle='#f2c94c';g.fillRect(X-1,Y-67,2,5);g.fillStyle='#2a6ab8';g.fillRect(X+1,Y-67,5,3);}

/* ---------- LES PASSANTS ---------- */
const AP0={peau:1,cheveux:1,coiffe:1,barbe:0,haut:2,veste:0,bas:0,pantalon:9,souliers:0,chaussures:0,sac:0,chapeau:0,raye:0,motif:0,_pnj:true};
const FIG=[[90,300,640,300,{peau:2,coiffe:4,haut:3,veste:16}],[690,280,690,700,{peau:4,cheveux:3,coiffe:5,haut:1,veste:21}],[150,330,150,700,{peau:1,coiffe:2,haut:2,veste:24,barbe:1}],[350,290,450,320,{peau:3,cheveux:2,coiffe:6,haut:5,veste:22}]]
  .map(([x0,y0,x1,y1,a],i)=>({x0,y0,x1,y1,x:x0,y:y0,k:0,s:1,ap:Object.assign({},AP0,a),dir:'bas',pas:0,att:i*2}));
let TL=performance.now();
function pas(){const n=performance.now(),dt=Math.min(.05,(n-TL)/1000);TL=n;
  for(const f of FIG){if(f.att>0){f.att-=dt;continue;}const L=Math.hypot(f.x1-f.x0,f.y1-f.y0)||1;f.k+=f.s*dt*16/L;if(f.k>1||f.k<0){f.s*=-1;f.k=Math.max(0,Math.min(1,f.k));f.att=1+hA(f.x0,f.k*9|0,3)*3;}
    const nx=f.x0+(f.x1-f.x0)*f.k,ny=f.y0+(f.y1-f.y0)*f.k,dx=nx-f.x,dy=ny-f.y;if(Math.abs(dx)>Math.abs(dy))f.dir=dx>0?'droite':'gauche';else if(dy)f.dir=dy>0?'bas':'haut';f.x=nx;f.y=ny;f.pas+=dt*8;}
  return FIG.filter(f=>f.att<=0||true);}

/* les mouettes au-dessus du bassin */
const MOU=[0,1,2,3].map(i=>({cx:300+i*70,cy:440+i*60,r:40+i*14,v:.4+i*.1,p:i*1.7}));
function acteurs(){const A=[];try{nk=nuitDecor();}catch(x){nk=0;}
  for(const o of AMARRES){const ph=performance.now()/1000+o.v*1.3,dy=Math.sin(ph*1.2)*.6;A.push({y:o.y+(o.mat?0:0),f:(g,cx,cy)=>poser(g,o,o.x-cx,o.y-cy+dy)});}
  const fx=posFerry();A.push({y:FERRY.y,f:(g,cx,cy)=>poser(g,{t:'ferry',v:0},fx-cx,FERRY.y-cy+Math.sin(performance.now()/700)*.5)});
  A.push({y:OMB.y1+24,f:(g,cx,cy)=>dessinerOmbriere(g,cx,cy)});
  A.push({y:MANEGE.y+6,f:(g,cx,cy)=>dessinerManege(g,cx,cy)});
  const t=performance.now()/1000;
  for(const m of MOU){const a=t*m.v+m.p,x=m.cx+Math.cos(a)*m.r,y=m.cy+Math.sin(a)*m.r*.5-60,b=Math.sin(t*9+m.p)>0;
    A.push({y:99999,f:(g,cx,cy)=>{const X=x-cx,Y=y-cy;g.fillStyle='rgba(10,30,40,.18)';g.fillRect(X-2,Y+60,4,1);g.fillStyle='#ffffff';g.fillRect(X-1,Y,2,1.4);g.fillStyle='#3a3a3a';
      if(b){g.fillRect(X-4,Y-1.5,3,.8);g.fillRect(X+1,Y-1.5,3,.8);}else{g.fillRect(X-4,Y+.6,3,.8);g.fillRect(X+1,Y+.6,3,.8);}g.fillStyle='#f2b030';g.fillRect(X+1,Y+.2,.8,.5);}});}
  /* les reflets qui glissent sur l'eau */
  for(let i=0;i<26;i++){const x0=BX0+10+hA(i,1,9)*(BX1-BX0-20),y0=BASSIN_Y+14+hA(i,2,9)*(H-BASSIN_Y-20),ph=(t*.6+hA(i,3,9)*6)%6;if(ph>3)continue;
    A.push({y:BASSIN_Y,f:(g,cx,cy)=>{g.fillStyle='rgba(255,255,255,'+(Math.sin(ph/3*Math.PI)*.35).toFixed(2)+')';g.fillRect(Math.round(x0+ph*3-cx),Math.round(y0-cy),5,.6);}});}
  return A;}

/* ---------- LES COLLISIONS ET LA SORTIE ---------- */
function partir(url){try{sauver();}catch(z){}document.body.style.transition='opacity .4s';document.body.style.opacity='0';setTimeout(()=>{location.href=url;},400);}
let partie=false;
function bloque(x,y){
  if(y<PIED+12){if(x>RUE[0]+6&&x<RUE[1]-6){if(y<150&&!partie){partie=true;try{sauver();}catch(z){}document.body.style.transition='opacity .4s';document.body.style.opacity='0';setTimeout(()=>{location.href='spawn.html?de=port&t='+Date.now();},400);}return y<120;}return true;}
  if(x<10||x>W-10||y>H-6)return true;
  if(dansBassin(x,y)&&!PONTONS.some(([a,b,py])=>x>a&&x<b&&Math.abs(y-py)<6))return true;
  if(x<BX0-2&&x>BX0-14&&y>BASSIN_Y)return false;
  for(const o of DECOR_C){if(Math.abs(x-o.x)<o.col[0]/2&&y>o.y-o.col[1]&&y<o.y+(o.bas||3))return true;}
  return false;}
const DECOR_C=decor().filter(o=>o.col);
try{window.__VP={j:()=>joueur,apercu(){const c=document.createElement('canvas');c.width=W*2;c.height=H*2;const g=c.getContext('2d');g.drawImage(solFin(),0,0);g.setTransform(2,0,0,2,0,0);
  const L=decor().map(o=>({y:o.y,f:()=>{const k=graver(o.t,o.v);g.drawImage(k.toile,o.x-k.W/2,o.y-k.sol,k.W,k.H);}})).concat(acteurs().map(a=>({y:a.y,f:()=>a.f(g,0,0)})),pas().map(f=>({y:f.y,f:()=>{try{personne(g,Math.round(f.x),Math.round(f.y),f.ap,f.dir,0,false);}catch(x){}}})));
  L.sort((a,b)=>a.y-b.y).forEach(a=>{try{a.f();}catch(x){}});c.style.cssText='position:fixed;left:0;top:0;width:100vw;height:100vw;z-index:2147483647';document.body.appendChild(c);}};}catch(x){}
return {sol,solFin,decor,bloque,graver,depart:DEPART,figurants:pas,acteurs};
})()
