/* =====================================================================
   LE PORT (quai.html) — vidé pour repartir de zéro : la mer en haut et
   le quai de pierre de Marseille. Rien d'autre pour l'instant, et aucune
   sortie automatique (on en part par la carte du menu).
   Chargé par moteur.js (eval direct). Ne touche à rien d'autre.
   ===================================================================== */
(()=>{
const W=800, H=800, NAV=286, QUAI=312;
const DEPART=[400,480];
const hA=(x,y,k)=>{let n=((x*73856093)^(y*19349663)^(k*83492791))|0;n=(n^(n>>>13))*1274126177|0;return((n^(n>>>16))>>>0)/4294967296;};
function sol(){const c=document.createElement('canvas');c.width=W;c.height=H;const g=c.getContext('2d');g.fillStyle='#e4d8bd';g.fillRect(0,0,W,H);g.fillStyle='#2a6a8a';g.fillRect(0,0,W,QUAI);return c;}
function solFin(){const S=2,c=document.createElement('canvas');c.width=W*S;c.height=H*S;const g=c.getContext('2d');g.setTransform(S,0,0,S,0,0);const R=(x,y,w,h,col)=>{g.fillStyle=col;g.fillRect(x,y,w,h);};
  R(0,0,W,NAV,'#2a6a8a');
  for(let y=NAV;y<QUAI;y++){R(0,y,W,1,'rgb('+(36+(y-NAV))+','+(96+(y-NAV))+','+(126+(y-NAV))+')');}
  for(let i=0;i<300;i++)R(hA(i,1,3)*W,NAV+hA(i,2,3)*(QUAI-NAV),3+hA(i,3,3)*6,.5,'rgba(255,255,255,.14)');
    /* la mer, plus profonde vers le haut */
  for(let y=0;y<NAV;y++){const k=y/NAV;R(0,y,W,1,'rgb('+(26+k*10|0)+','+(84+k*12|0)+','+(116+k*10|0)+')');}
  for(let i=0;i<900;i++)R(hA(i,7,3)*W,hA(i,8,3)*NAV,3+hA(i,9,3)*8,.5,hA(i,10,3)<.6?'rgba(255,255,255,.12)':'rgba(10,30,50,.2)');
/* LE QUAI DE PIERRE DE MARSEILLE : la margelle claire au bord de l'eau,
     une bande de pavés sombres, un caniveau d'acier, puis la pierre claire
     posée en opus romain (grands et petits carrés mêlés). */
  const tn2=(hex,d)=>{const v=parseInt(hex.slice(1),16);const f=k=>Math.max(0,Math.min(255,((v>>k)&255)+d));return 'rgb('+f(16)+','+f(8)+','+f(0)+')';};
  const dalle=(x,y,w,h,col,j)=>{R(x,y,w,h,j||tn2(col,-34));R(x+.5,y+.5,w-1,h-1,col);R(x+.5,y+.5,w-1,.5,tn2(col,14));R(x+.5,y+.5,.5,h-1,tn2(col,8));R(x+.5,y+h-1,w-1,.5,tn2(col,-12));};
  R(0,QUAI-3,W,3,'rgba(10,30,40,.3)');
  R(0,QUAI,W,7,'#ece4d2');R(0,QUAI,W,1,'#fbf6ea');R(0,QUAI+6,W,1,'#bfb196');for(let x=0;x<W;x+=24)R(x,QUAI,.5,7,'#d6cab2');
  for(let y=QUAI+7;y<QUAI+28;y+=5)for(let x=-((y/5|0)%2)*3;x<W;x+=6)dalle(x,y,6,5,['#8a847a','#827c72','#928c82'][(hA(x,y,8)*3)|0],'#5a554c');
  R(0,QUAI+28,W,4,'#9aa0a6');for(let x=0;x<W;x+=3)R(x,QUAI+28.6,1.8,2.8,'#4a5058');
  const OP=[[0,0,24,16],[24,0,16,16],[40,0,24,24],[0,16,16,24],[16,16,24,8],[16,24,24,16],[40,24,24,16]];
  for(let by=QUAI+32;by<H;by+=40)for(let bx=0;bx<W;bx+=64)for(const [dx,dy,w,h] of OP)if(by+dy<H)dalle(bx+dx,by+dy,w,Math.min(h,H-by-dy),['#eadfc6','#e4d8bd','#efe5ce','#e0d4b8','#e8dcc2'][(hA(bx+dx,by+dy,9)*5)|0],'#bfb196');
  return c;}
function decor(){return [];}
function graver(){const c=document.createElement('canvas');c.width=2;c.height=2;return {toile:c,W:1,H:1,sol:0};}
function bloque(x,y){return y<QUAI+10||x<8||x>W-8||y>H-6;}
function pas(){return [];}
function acteurs(){return [];}
try{window.__CR={j:()=>joueur};}catch(x){}
return {sol,solFin,decor,bloque,graver,depart:DEPART,figurants:pas,acteurs};
})()
