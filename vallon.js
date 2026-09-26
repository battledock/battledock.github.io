/* ===================== LE VALLON =====================
   Le quartier des cabanons, au-dessus du port : terre battue, restanques,
   collines de garrigue — et ton terrain, avec ton cabanon. */
(()=>{
const WW=420, WH=560, SOL=170;
const al=(n)=>{const v=Math.sin(n*12.9898)*43758.5453;return v-Math.floor(v);};
const METRO={x:92,y:SOL+84};
const TERRAIN={x:WW-160,y:SOL+96,w:126,h:78};
const FONT={x:Math.round(WW*0.42),y:SOL+178};
function mk(W,H){const c=document.createElement('canvas');c.width=W;c.height=H;
  const g=c.getContext('2d');g.imageSmoothingEnabled=false;
  const F=(x,y,w,h,col)=>{g.fillStyle=col;g.fillRect(x|0,y|0,Math.max(1,w|0),Math.max(1,h|0));};
  return {c,g,F};}
function terreBattue(g,R,x0,y0,x1,y1){
  const L=Math.round(x1-x0), Hh=Math.round(y1-y0);
  const P=(x,y,w,h,col)=>{g.fillStyle=col;g.fillRect(x|0,y|0,Math.max(1,w|0),Math.max(1,h|0));};
  /* la terre : quatre tons, un pixel à la fois */
  const T=['#a58d5a','#9b8352','#af9764','#917a4a'];
  for(let y=y0;y<y1;y++)for(let x=x0;x<x1;x++){
    const n=al(x*0.9+y*1.7);
    P(x,y,1,1,T[n<.28?0:(n<.56?1:(n<.82?2:3))]);}
  /* les bandes claires : le passage usé */
  for(const ox of [x0+L*0.34,x0+L*0.66]){
    for(let y=y0;y<y1;y++){const w=Math.round(10+Math.sin(y/28)*3);
      for(let x=Math.round(ox-w/2);x<ox+w/2;x++)
        if(al(x*1.3+y*0.7)<0.45)P(x,y,1,1,'#b79d66');}}
  /* le gravier */
  for(let i=0;i<Math.round(L*Hh*0.010);i++){
    const x=Math.round(x0+al(i*3.1)*L), y=Math.round(y0+al(i*4.7)*Hh), r=1+Math.round(al(i)*2);
    P(x,y,r+1,r,al(i*7)<.5?'#9a9182':'#82796c');P(x,y,r+1,1,'#c3bbaa');}
  /* les touffes d'herbe rase */
  for(let i=0;i<Math.round(L*Hh*0.0026);i++){
    const x=Math.round(x0+al(i*9)*L), y=Math.round(y0+al(i*11)*Hh);
    if(al(i*13)<0.45)continue;
    P(x,y-2,1,3,'#6f8a4a');P(x+1,y-3,1,4,'#59743a');P(x+2,y-1,1,2,'#7d9a54');
    P(x-1,y-1,1,2,'#59743a');}
  /* les traces de pas */
  for(let i=0;i<Math.round(L*Hh*0.0007);i++){
    const x=Math.round(x0+al(i*17)*L), y=Math.round(y0+al(i*7)*Hh);
    P(x,y,3,2,'#8d7649');P(x+4,y+5,3,2,'#8d7649');}
  /* quelques plaques sèches, plus claires */
  for(let i=0;i<9;i++){
    const cx=Math.round(x0+al(i*23)*L), cy=Math.round(y0+al(i*19)*Hh), rx=10+Math.round(al(i)*16);
    for(let x=cx-rx;x<cx+rx;x++){
      const k=Math.abs(x-cx)/rx, h=Math.round(4*(1-k*k));
      for(let y=cy-h;y<cy+h;y++)if(al(x*0.7+y*1.1)<0.55)P(x,y,1,1,'#bda368');}}
}

/* ---------- LE SOL : collines au fond, terre battue devant ---------- */
let SOL_CAL=null;
function sol(){
  if(SOL_CAL)return SOL_CAL;
  const {c,g,F:px}=mk(WW,WH);
  const R=(x,y,w,h,col)=>px(x,y,w,h,col);
  const CIEL=Math.round(SOL*0.44);
  const CIELS=['#7fb4dc','#8dbde2','#9bc6e6','#a9cfea','#b7d8ee','#c5e0f1','#d3e8f4'];
  for(let y=0;y<CIEL;y++)px(0,y,WW,1,CIELS[Math.min(6,Math.floor(y/CIEL*7))]);
  {const sx0=WW-56, sy0=16;
   for(let r=9;r>0;r--)px(sx0-r,sy0-r,r*2,r*2,r>7?'rgba(255,236,178,.22)':(r>5?'#ffeeb4':'#fff6d2'));}
  function colline(base,amp,seed,pal,densite){
    const haut=[];
    for(let x=0;x<WW;x++){
      const h=Math.round(base-amp*(0.42+0.58*Math.abs(Math.sin(x*0.013+seed)))-al(x*0.35+seed)*4);
      haut[x]=h;
      for(let y=h;y<base+46;y++){const n=al(x*0.7+y*1.3+seed);
        px(x,y,1,1,n<.34?pal[0]:(n<.68?pal[1]:pal[2]));}
      px(x,h,1,2,pal[3]);px(x,h+2,1,1,pal[2]);}
    for(let i=0;i<densite;i++){
      const x=Math.round(al(i*3.3+seed)*WW), h=haut[x]||base;
      const y=Math.round(h+2+al(i*5+seed)*(base-h)*0.8), t=al(i*7+seed);
      if(t<0.3){px(x,y-6,1,7,pal[4]);px(x-5,y-9,11,3,pal[5]);px(x-3,y-11,7,2,pal[6]);px(x-6,y-7,13,2,pal[5]);}
      else if(t<0.62){for(let k=0;k<9;k++){const w=Math.max(1,Math.round(1+(k/9)*3));
        px(x-Math.floor(w/2),y-9+k,w,1,k<5?pal[6]:pal[5]);}}
      else {px(x-2,y-2,5,2,pal[5]);px(x-1,y-3,3,1,pal[6]);px(x-3,y,7,1,pal[5]);}}}
  colline(CIEL+10,34,0.7,['#93a58d','#8b9d85','#9bad95','#adbfa5','#5d6b52','#6f8060','#7f9070'],56);
  colline(CIEL+26,24,3.1,['#7f9276','#778a6e','#87997e','#9aac8e','#4f6046','#5f7254','#6d8062'],80);
  const TER=['#a08654','#96794b','#aa9060'];
  for(let r=0;r<3;r++){
    const y=CIEL+30+r*13;
    for(let yy=y-8;yy<y;yy++)for(let x=0;x<WW;x++){const n=al(x*0.9+yy*1.7+r);
      px(x,yy,1,1,n<.34?TER[0]:(n<.68?TER[1]:TER[2]));}
    for(let i=0;i<9;i++){const x=Math.round(al(i*13+r*3)*WW);
      px(x,y-12,2,5,'#7a6644');px(x-4,y-16,9,4,r%2?'#8fa07e':'#9ab08a');
      px(x-3,y-18,7,2,'#a6bb96');px(x-5,y-14,11,2,r%2?'#839472':'#8ea37e');}
    for(let x=0;x<WW;x+=7){const n=al(x*0.5+r);
      px(x,y,6,7,n<.33?'#c6bb9f':(n<.66?'#b8ab90':'#d1c6aa'));
      px(x,y,6,1,'#e2d8bd');px(x,y+6,6,1,'#6e654e');px(x+6,y,1,7,'#8e846a');}}
  {const y0=CIEL+30+2*13+7;
   for(let y=y0;y<SOL;y++)for(let x=0;x<WW;x++){const n=al(x*0.9+y*1.7);
     px(x,y,1,1,n<.34?'#a89158':(n<.68?'#9c8550':'#b49c62'));}
   for(let i=0;i<80;i++){const x=Math.round(al(i*9)*WW), y=Math.round(y0+al(i*11)*(SOL-y0));
     px(x,y-2,1,3,'#6f8a4a');px(x+1,y-3,1,4,'#59743a');px(x+2,y-1,1,2,'#6f8a4a');}}
  for(let x=0;x<WW;x+=7){const n=al(x*0.5+9);
    px(x,SOL-9,6,9,n<.33?'#c6bb9f':(n<.66?'#b8ab90':'#d1c6aa'));
    px(x,SOL-9,6,1,'#e2d8bd');px(x,SOL-2,6,1,'#6e654e');px(x+6,SOL-9,1,9,'#8e846a');}
  /* la ruelle */
  terreBattue(g,R,0,SOL,WW,WH);
  px(0,SOL,WW,3,'#9a8a62');px(0,SOL+3,WW,1,'#7e7050');
  /* l'escalier du bout */
  for(let i=0;i<7;i++)px(Math.round(WW*0.44)-30+i*2,WH-40+i*5,60-i*4,4,i%2?'#b3a483':'#c1b291');
  SOL_CAL=c;return c;}
function cabanonDessin(g,R,x,y,ech,etat,plan){
  const L=Math.round(58*ech), Hh=Math.round(38*ech);
  if(etat===0){
    /* le terrain vide : piquets et cordeau */
    g.fillStyle='rgba(40,44,34,.18)';g.beginPath();g.ellipse(x,y+3,L*0.6,7*ech,0,0,7);g.fill();
    for(let i=0;i<4;i++){const px=x-L/2+ (i%2)*L, py=y-(i<2?26*ech:0);
      R(px-1.4,py-10*ech,3,10*ech,'#8a6238');R(px-2.4,py-11*ech,5,2,'#c9a878');}
    g.strokeStyle='rgba(240,236,220,.7)';g.setLineDash([4,4]);g.lineWidth=1;
    g.beginPath();g.rect(x-L/2,y-26*ech,L,26*ech);g.stroke();g.setLineDash([]);
    if(plan){g.font='700 6px Georgia';g.fillStyle='#8a7a56';g.textAlign='center';
      g.fillText('À BÂTIR',x,y-12*ech);g.textAlign='left';}
    return;}
  const gros=etat>1;
  const LL=gros?L*1.35:L;
  g.fillStyle='rgba(40,44,34,.24)';g.beginPath();g.ellipse(x+2,y+4,LL*0.6,8*ech,0,0,7);g.fill();
  /* les murs, crépi rose des cabanons */
  for(let yy=y-Hh;yy<y;yy++){const k=(yy-(y-Hh))/Hh;
    g.fillStyle=`rgb(${226-k*24|0},${196-k*22|0},${168-k*20|0})`;g.fillRect(Math.round(x-LL/2),Math.round(yy),Math.round(LL),1);}
  for(let i=0;i<90;i++){const px=x-LL/2+al(i*3)*LL, py=y-Hh+al(i*7)*Hh;
    R(px,py,1.4,1,al(i)<.5?'rgba(160,126,96,.2)':'rgba(255,238,214,.22)');}
  R(x-LL/2,y-Hh,LL,2,'#f0d8c0');R(x-LL/2,y-2,LL,2,'#a8896e');
  /* le toit de tuiles */
  for(let r=0;r<3;r++){const yy=y-Hh-4*ech+r*3*ech;
    for(let px=x-LL/2-4*ech+r*2*ech;px<x+LL/2+4*ech-r*2*ech;px+=4*ech)
      R(px,yy,3*ech,3*ech,r%2?'#a8452f':'#c46a4a');}
  /* la porte et la fenêtre */
  R(x-7*ech,y-20*ech,14*ech,20*ech,'#6a4a2a');R(x-7*ech,y-20*ech,14*ech,1.6*ech,'#8a6238');
  R(x-6*ech,y-19*ech,12*ech,18*ech,'#7d5934');R(x+3*ech,y-11*ech,2*ech,2*ech,'#c9a24a');
  R(x+LL/2-20*ech,y-26*ech,13*ech,11*ech,'#3c3c46');
  R(x+LL/2-19*ech,y-25*ech,11*ech,9*ech,'#9fd0dc');R(x+LL/2-19*ech,y-25*ech,11*ech,3*ech,'#c2e4ec');
  R(x+LL/2-22*ech,y-27*ech,4*ech,13*ech,'#3f7a5a');R(x+LL/2-7*ech,y-27*ech,4*ech,13*ech,'#3f7a5a');
  if(gros){
    R(x-LL/2+6*ech,y-26*ech,13*ech,11*ech,'#3c3c46');
    R(x-LL/2+7*ech,y-25*ech,11*ech,9*ech,'#9fd0dc');
    R(x-LL/2+4*ech,y-27*ech,4*ech,13*ech,'#3f7a5a');R(x-LL/2+19*ech,y-27*ech,4*ech,13*ech,'#3f7a5a');
    /* la cheminée */
    R(x+LL/2-16*ech,y-Hh-16*ech,7*ech,14*ech,'#b06a4a');R(x+LL/2-17*ech,y-Hh-18*ech,9*ech,3*ech,'#c98a6a');}
  /* le numéro et la treille */
  R(x-3*ech,y-23*ech,6*ech,4*ech,'#1d4f8a');
  g.font='700 '+Math.round(3.4*ech)+'px Georgia';g.textAlign='center';g.fillStyle='#eaf4fb';
  g.fillText('14',x,y-20.2*ech);g.textAlign='left';
  for(let i=0;i<8;i++)R(x-LL/2+2+i*(LL/8),y-Hh-6*ech,LL/9,1.6*ech,'#4a8a45');
}
/* ---------- LA TERRE BATTUE ---------- */
function terreBattue(g,R,x0,y0,x1,y1){
  const L=Math.round(x1-x0), Hh=Math.round(y1-y0);
  const P=(x,y,w,h,col)=>{g.fillStyle=col;g.fillRect(x|0,y|0,Math.max(1,w|0),Math.max(1,h|0));};
  /* la terre : quatre tons, un pixel à la fois */
  const T=['#a58d5a','#9b8352','#af9764','#917a4a'];
  for(let y=y0;y<y1;y++)for(let x=x0;x<x1;x++){
    const n=al(x*0.9+y*1.7);
    P(x,y,1,1,T[n<.28?0:(n<.56?1:(n<.82?2:3))]);}
  /* les bandes claires : le passage usé */
  for(const ox of [x0+L*0.34,x0+L*0.66]){
    for(let y=y0;y<y1;y++){const w=Math.round(10+Math.sin(y/28)*3);
      for(let x=Math.round(ox-w/2);x<ox+w/2;x++)
        if(al(x*1.3+y*0.7)<0.45)P(x,y,1,1,'#b79d66');}}
  /* le gravier */
  for(let i=0;i<Math.round(L*Hh*0.010);i++){
    const x=Math.round(x0+al(i*3.1)*L), y=Math.round(y0+al(i*4.7)*Hh), r=1+Math.round(al(i)*2);
    P(x,y,r+1,r,al(i*7)<.5?'#9a9182':'#82796c');P(x,y,r+1,1,'#c3bbaa');}
  /* les touffes d'herbe rase */
  for(let i=0;i<Math.round(L*Hh*0.0026);i++){
    const x=Math.round(x0+al(i*9)*L), y=Math.round(y0+al(i*11)*Hh);
    if(al(i*13)<0.45)continue;
    P(x,y-2,1,3,'#6f8a4a');P(x+1,y-3,1,4,'#59743a');P(x+2,y-1,1,2,'#7d9a54');
    P(x-1,y-1,1,2,'#59743a');}
  /* les traces de pas */
  for(let i=0;i<Math.round(L*Hh*0.0007);i++){
    const x=Math.round(x0+al(i*17)*L), y=Math.round(y0+al(i*7)*Hh);
    P(x,y,3,2,'#8d7649');P(x+4,y+5,3,2,'#8d7649');}
  /* quelques plaques sèches, plus claires */
  for(let i=0;i<9;i++){
    const cx=Math.round(x0+al(i*23)*L), cy=Math.round(y0+al(i*19)*Hh), rx=10+Math.round(al(i)*16);
    for(let x=cx-rx;x<cx+rx;x++){
      const k=Math.abs(x-cx)/rx, h=Math.round(4*(1-k*k));
      for(let y=cy-h;y<cy+h;y++)if(al(x*0.7+y*1.1)<0.55)P(x,y,1,1,'#bda368');}}
}

/* ---------- LES OBJETS ---------- */
function graverCabanon(etat){const W=150,H=86,{c,g,F}=mk(W,H);
  const R=(x,y,w,h,col)=>F(x,y,w,h,col);
  cabanonDessin(g,R,W/2,H-4,1,etat,false);
  return {c,W,H,sol:H-4};}
function graverFontaine(){const W=48,H=42,{c,g,F}=mk(W,H);const cx=W/2,sol=H-3;
  F(cx-21,sol-1,43,4,'rgba(50,46,30,.2)');
  F(cx-20,sol-8,40,9,'#b3a483');F(cx-20,sol-8,40,1,'#c9bda2');F(cx-20,sol,40,1,'#8e8268');
  F(cx-16,sol-7,32,6,'#7fa0a0');F(cx-14,sol-7,28,2,'#9fbcbc');
  for(let k=0;k<10;k++)F(cx-14+al(k*3)*28,sol-6,2,1,'#cfe6e6');
  F(cx-6,sol-31,12,23,'#c1b291');F(cx-6,sol-31,12,1,'#d8c9a6');F(cx+4,sol-31,2,23,'#a2937a');
  F(cx-8,sol-33,16,2,'#b3a483');F(cx-8,sol-33,16,1,'#cfc2a4');
  F(cx-2,sol-23,4,2,'#5a5a4a');
  for(let k=0;k<8;k++)F(cx-1,sol-21+k*2,1,2,'#bfe1e6');
  return {c,W,H,sol};}
function graverFiguier(){const W=44,H=52,{c,g,F}=mk(W,H);const cx=W/2,sol=H-3;
  F(cx-14,sol-1,29,4,'rgba(40,52,32,.20)');
  F(cx-3,sol-24,6,24,'#8a7a5a');F(cx-3,sol-24,2,24,'#a5946e');F(cx+2,sol-24,1,24,'#6a5a3e');
  [[-16,-30,32,7,'#3f7a3f'],[-13,-36,26,6,'#4a8a45'],[-9,-41,18,5,'#57a04e'],
   [-18,-26,36,5,'#357033'],[-12,-22,24,4,'#3f7a3f']].forEach(([dx,dy,w,h,col])=>F(cx+dx,sol+dy,w,h,col));
  for(let k=0;k<18;k++)F(cx-15+al(k*3)*30,sol-40+al(k*5)*18,2,2,'#6fb85e');
  return {c,W,H,sol};}
function graverCypres(h){const W=18,H=h+8,{c,g,F}=mk(W,H);const cx=W/2,sol=H-3;
  F(cx-4,sol,9,2,'rgba(60,54,36,.22)');
  for(let k=0;k<h;k++){const p=k/h, w=Math.max(2,Math.round(2+p*7));
    F(cx-Math.floor(w/2),sol-h+k,w,1,p<0.35?'#4f6a3c':(p<0.72?'#425c33':'#37502c'));
    if(al(k+h)<0.25)F(cx-Math.floor(w/2)+1,sol-h+k,1,1,'#5f7f49');}
  F(cx-1,sol-3,3,4,'#6a4a2a');F(cx-1,sol-3,1,4,'#8a6238');
  return {c,W,H,sol};}
function graverMetro(){const W=92,H=72,{c,g,F}=mk(W,H);const cx=W/2,sol=H-3;
  const L=58,P=30;
  F(cx-L/2+2,sol-1,L,3,'rgba(40,44,34,.22)');
  for(let i=0;i<L;i+=9)F(cx-L/2+i,sol-10,8,10,al(i)<.5?'#cbbb96':'#c2b28d');
  F(cx-L/2,sol,L,2,'#a89a7c');
  F(cx-L*0.36,sol-10-P+10,Math.round(L*0.72),P-10,'#2b2620');
  for(let i=0;i<7;i++){const k=i/7;
    F(cx-L*0.34+k*L*0.06,sol-11-k*(P-10),L*0.68-k*L*0.12,2,`rgb(${160-k*70|0},${152-k*66|0},${132-k*58|0})`);}
  [[-1],[1]].forEach(([s2])=>{const rx=cx+s2*L*0.40;F(rx-1,sol-P-8,2,P+6,'#3f4a52');F(rx-1,sol-P-8,1,P+6,'#5d6a74');});
  F(cx-L*0.42,sol-P-8,L*0.84,2,'#3f4a52');F(cx-L*0.42,sol-P*0.55,L*0.84,2,'#3f4a52');
  F(cx+L*0.52,sol-P-14,3,P+12,'#4a5560');
  F(cx+L*0.44,sol-P-26,15,14,'#1d4f8a');F(cx+L*0.45,sol-P-25,13,12,'#2a6aa8');
  g.font='700 9px Georgia';g.textAlign='center';g.fillStyle='#eaf4fb';g.fillText('M',cx+L*0.515,sol-P-15.6);
  F(cx-L*0.52,sol-P-22,Math.round(L*0.9),11,'#1d4f8a');F(cx-L*0.51,sol-P-21,Math.round(L*0.88),9,'#2a6aa8');
  g.font='700 5.4px Georgia';g.fillStyle='#eaf4fb';g.fillText('LE VALLON',cx-L*0.07,sol-P-14.4);g.textAlign='left';
  for(let i=0;i<5;i++)F(cx-L*0.46+i*L*0.2,sol-P-23.4,2,2,'#cfe0ef');
  return {c,W,H,sol};}
function graverPanneau(){const W=72,H=40,{c,g,F}=mk(W,H);const cx=W/2,sol=H-2;
  F(cx-1,sol-20,3,20,'#6a5f42');
  F(cx-32,sol-34,66,15,'#1d4f8a');F(cx-31,sol-33,64,13,'#2a6aa8');
  g.font='700 6px Georgia';g.textAlign='center';g.fillStyle='#eaf4fb';g.fillText('LE VALLON',cx,sol-24);g.textAlign='left';
  return {c,W,H,sol};}
/* l'état du cabanon : le jeu le met à jour, on le lit ici */
function etatCabanon(){try{const v=localStorage.getItem('bdl.cabanon');
  if(!v)return 0;const o=JSON.parse(v);return o.bati?(o.niveau>0?2:1):0;}catch(x){return 0;}}
function objets(){
  const cal={}, L=[];
  const reg=(nom,J)=>{cal[nom]={toile:J.c,W:J.W,H:J.H,sol:J.sol,nuit:null};};
  reg('vaCab',graverCabanon(etatCabanon()));
  reg('vaFont',graverFontaine());reg('vaFig',graverFiguier());
  reg('vaCyp',graverCypres(36));reg('vaCyp2',graverCypres(26));
  reg('vaMetro',graverMetro());reg('vaPan',graverPanneau());
  const P=(nom,x,y,x2)=>L.push(Object.assign({t:'x_mo_'+nom,x,y,v:0},x2||{}));
  P('vaMetro',METRO.x,METRO.y,{col:[30,8],bati:true,demi:26,ouvre:'metroVallon'});
  P('vaCab',TERRAIN.x+TERRAIN.w/2,TERRAIN.y+TERRAIN.h,
    {col:etatCabanon()?[36,10]:[10,4],bati:!!etatCabanon(),demi:34,ouvre:'chantierVallon'});
  P('vaFont',FONT.x,FONT.y,{col:[20,6]});
  P('vaFig',52,SOL+90,{col:[4,3]});P('vaFig',WW-52,SOL+232,{col:[4,3]});
  P('vaCyp',26,SOL+16,{col:[4,3]});P('vaCyp2',WW-34,SOL+22,{col:[4,3]});
  P('vaCyp2',Math.round(WW*0.66),SOL+10,{col:[4,3]});
  P('vaPan',Math.round(WW*0.52),SOL+40,{col:[3,2]});
  return {L,cal};}
const zone=(x,y)=>y<SOL+16;                     /* on ne monte pas dans la colline */
return {WW,WH,objets,solFin:sol,zoneInterdite:zone,dansNeige:()=>false,surGlace:()=>false,
  dessinerTelepherique:()=>{},ARRIVEE:[METRO.x+26,METRO.y+34],METRO:[METRO.x,METRO.y],
  TERRAIN:TERRAIN, rafraichir:()=>{SOL_CAL=null;}};
})()
