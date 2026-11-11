/* =====================================================================
   LE PORT (quai.html) — vidé pour repartir de zéro : la mer en haut et
   le quai de pierre de Marseille. Rien d'autre pour l'instant, et aucune
   sortie automatique (on en part par la carte du menu).
   Chargé par moteur.js (eval direct). Ne touche à rien d'autre.
   ===================================================================== */
(()=>{
const W=800, H=800, NAV=286, QUAI=312;
const DEPART=[400,600];
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
/* =====================================================================
   LE B.C.M.O. — Bureau central de la main-d'œuvre du port : immeuble de
   bureaux en béton des années 60, guichets numérotés, horloge pointeuse,
   panneau d'appel. Gravé une fois, au demi-pixel.
   ===================================================================== */
const BX=400, BY=520, BW=280, BH=172, BSOL=166;      /* le pied de la façade est en BY */
let BCMO=null;
function graverBcmo(){if(BCMO)return BCMO;const D=2,c=document.createElement('canvas');c.width=BW*D;c.height=BH*D;
 const g=c.getContext('2d');g.imageSmoothingEnabled=false;g.setTransform(D,0,0,D,0,0);
 const R=(x,y,w,h,col)=>{g.fillStyle=col;g.fillRect(x,y,w,h);};
 const T=(t,x,y,col,f,al)=>{g.font=f;g.textAlign=al||'center';g.fillStyle=col;g.fillText(t,x,y);};
 const x0=10,x1=BW-10,yT=12,yF=24,yB=BSOL,cx=BW/2;
 /* l'ombre portée au sol */
 const og=g.createLinearGradient(0,yB,0,yB+6);og.addColorStop(0,'rgba(40,30,20,.32)');og.addColorStop(1,'rgba(40,30,20,0)');g.fillStyle=og;g.fillRect(x0-4,yB,x1-x0+8,6);
 /* toit-terrasse, acrotère, édicule technique */
 R(x0-2,yT,x1-x0+4,yF-yT,'#bfb6a6');R(x0-2,yT,x1-x0+4,1,'#ddd5c6');for(let x=x0;x<x1;x+=8)R(x,yT+2,.5,yF-yT-3,'#b0a796');
 R(x0+12,yT-8,26,8,'#a89e8c');R(x0+12,yT-8,26,1,'#cfc6b6');for(let k=0;k<4;k++)R(x0+14+k*6,yT-6,4,5,'#7a7266');
 /* la trame de béton et les fenêtres de bureaux */
 R(x0,yF,x1-x0,yB-yF,'#e6dccb');
 const top=yB-44;
 for(let x=x0;x<=x1;x+=18.5){R(x,yF,2.4,top-yF,'#d4c9b5');R(x,yF,.6,top-yF,'#f0e8da');}
 for(let y=yF;y<top;y+=26){R(x0,y,x1-x0,2,'#d4c9b5');R(x0,y,x1-x0,.6,'#f0e8da');}
 for(let x=x0+2.4;x<x1-4;x+=18.5)for(let y=yF+2;y<top-2;y+=26){const gr=g.createLinearGradient(0,y,0,y+24);gr.addColorStop(0,'#6a90b0');gr.addColorStop(1,'#2a4058');g.fillStyle=gr;g.fillRect(x+1,y+2,14,20);
  if(hA(x|0,y|0,3)<.35)R(x+1,y+2,14,8+hA(x|0,y|0,4)*8,'#e8e0c8');
  R(x+1,y+12,14,.5,'#e6dccb');R(x+7.8,y+2,.5,20,'#e6dccb');
  if(hA(x|0,y|0,5)<.25)R(x+3,y+14,4,6,'#ffe2a8');
  g.fillStyle='rgba(255,255,255,.12)';g.beginPath();g.moveTo(x+2,y+21);g.lineTo(x+8,y+3);g.lineTo(x+10,y+3);g.lineTo(x+4,y+21);g.fill();
  R(x,y+22,16,1.2,'#cfc4ae');}
 /* le bandeau-enseigne */
 R(x0,top-2,x1-x0,10,'#1f3566');R(x0,top-2,x1-x0,.8,'#3a5a9a');R(x0,top+7.4,x1-x0,.6,'#c8a040');
 T("BUREAU CENTRAL DE LA MAIN-D'ŒUVRE DU PORT",cx,top+5,'#f5d27a','800 5px ui-monospace,monospace');
 /* l'enseigne verticale rouge */
 R(x1-13,yF-6,10,60,'#c8323a');R(x1-13,yF-6,10,1,'#e85a5a');R(x1-4,yF-6,1,60,'#8a1a1a');
 'EMBAUCHE'.split('').forEach((ch,i)=>T(ch,x1-8,yF+1.6+i*7,'#fff4d8','800 5.8px ui-monospace,monospace'));
 /* le rez-de-chaussée */
 const rz=yB-36;R(x0,rz,x1-x0,36,'#cfc4ae');for(let x=x0;x<x1;x+=10)R(x,rz,.4,36,'#bdb19a');R(x0,rz,x1-x0,.6,'#e6dccb');
 R(x0-4,rz-2,x1-x0+8,2.4,'#b0a796');R(x0-4,rz-2,x1-x0+8,.6,'#ddd5c6');
 /* les trois guichets */
 const ag={_pnj:true,_civil:true,yeux:1,peau:2,cheveux:2,coiffe:1,haut:4,veste:'#e8e4d8',chapeau:0,bas:0,pantalon:'#3a4048'};
 const AG=[ag,Object.assign({},ag,{peau:3,coiffe:2,cheveux:0,barbe:1}),null];
 GUICHETS.forEach((gx0,i)=>{const x=gx0-BX+cx-8,y=yB-26;R(x-2,y-2,20,22,'#d9cfbd');R(x,y,16,16,'#2a3a4a');
  if(AG[i]){const gr=g.createLinearGradient(0,y,0,y+16);gr.addColorStop(0,'#ffe2a8');gr.addColorStop(1,'#c8904a');g.fillStyle=gr;g.fillRect(x,y,16,16);
   g.save();g.beginPath();g.rect(x,y,16,13);g.clip();try{personne(g,x+8,y+50,AG[i],'bas',0,false);}catch(e){}g.restore();g.setTransform(D,0,0,D,0,0);}
  else{for(let k=x;k<=x+16;k+=1.6)R(k,y,.4,16,'rgba(30,34,40,.75)');}
  R(x-1,y+13,18,2,'#8a8478');R(x-1,y+13,18,.5,'#b0a898');
  R(x+4,y-6,8,4,'#1f3566');T(String(i+1),x+8,y-2.8,'#fff','800 3.2px ui-monospace,monospace');R(x+13,y-5.5,2,2,AG[i]?'#4ac860':'#c8323a');});
 /* la porte vitrée */
 R(cx-11,yB-30,22,30,'#2a3a4a');const pg=g.createLinearGradient(0,yB-28,0,yB);pg.addColorStop(0,'#bfe0f0');pg.addColorStop(1,'#5a7a90');g.fillStyle=pg;g.fillRect(cx-9,yB-28,8.5,28);g.fillRect(cx+.5,yB-28,8.5,28);R(cx-3,yB-16,2,.8,'#c8a040');R(cx+1,yB-16,2,.8,'#c8a040');
 T('ENTRÉE',cx,yB-31.4,'#1f3566','800 2.6px ui-monospace,monospace');
 /* l'horloge pointeuse et ses cartes */
 const px=cx+18;R(px,yB-28,10,14,'#8a8f96');R(px,yB-28,10,.6,'#b0b6bc');g.fillStyle='#f8f4e8';g.beginPath();g.arc(px+5,yB-23,3.4,0,7);g.fill();g.strokeStyle='#2a2a2e';g.lineWidth=.4;g.stroke();g.beginPath();g.moveTo(px+5,yB-23);g.lineTo(px+5,yB-25.4);g.moveTo(px+5,yB-23);g.lineTo(px+6.6,yB-22.4);g.stroke();R(px+2,yB-18,6,2,'#2a2e34');R(px+3,yB-17.5,4,.6,'#f2efe4');
 R(px+12,yB-30,2,20,'#5a5040');for(let k=0;k<6;k++)R(px+12.4,yB-29+k*3,3.6,2.4,['#f2efe4','#ffe2a8','#f2efe4','#bfe0ff','#f2efe4','#ffd0c8'][k]);
 /* le panneau d'appel vitré */
 const bx=PANNEAU-BX+cx-26;R(bx,yB-30,52,22,'#5a5a60');R(bx+1,yB-29,50,20,'#c8b890');
 const aff=(x,y,w,h,col,t)=>{R(x,y,w,h,col);R(x,y,w,.5,'rgba(255,255,255,.6)');if(t)T(t,x+w/2,y+2.6,'#8a2a2a','800 1.8px ui-monospace,monospace');for(let k=0;k<4;k++)R(x+1,y+3.6+k*1.3,w-2-(k%2)*2,.4,'rgba(40,40,40,.45)');R(x+w/2-.4,y-.4,.8,.8,'#c8323a');};
 aff(bx+3,yB-27,9,12,'#f2efe4','APPEL');aff(bx+14,yB-27,9,12,'#ffe2a8','NAVIRES');aff(bx+25,yB-27,9,12,'#f2efe4','PRIMES');aff(bx+36,yB-27,12,9,'#bfe0ff','PORTIQUE');aff(bx+37,yB-16,10,6,'#ffd0c8',null);
 R(bx,yB-30,52,.5,'rgba(255,255,255,.5)');T('APPEL : 7H · 13H · 19H',bx+26,yB-32,'#1f3566','800 2.8px ui-monospace,monospace');
 /* la lanterne */
 const lx=x0+4,ly=yB-30;R(lx-.25,ly-6,.5,6,'#2a2a2e');R(lx-2,ly,4,.6,'#2a2a2e');R(lx-1.6,ly+.6,3.2,4,'#ffd98a');R(lx-2,ly+4.6,4,.6,'#2a2a2e');
 /* le seuil */
 R(cx-16,yB,32,2,'#d8d0c2');R(cx-16,yB,32,.5,'#f0e8da');
 return BCMO={toile:c,W:BW,H:BH,sol:BSOL};}
const GUICHETS=[BX-112,BX-88,BX-64];          /* le centre de chaque guichet, en x du monde */
const PANNEAU=BX+76;
/* en attendant le tableau des vacations : une petite carte au guichet */
function guichet(n){const old=document.getElementById('bcmoMot');if(old)old.remove();
 const d=document.createElement('div');d.id='bcmoMot';d.style.cssText='position:fixed;left:50%;bottom:calc(120px + env(safe-area-inset-bottom));transform:translateX(-50%);z-index:2147482000;width:min(88vw,360px);background:#1b2330;color:#f2efe4;border-radius:18px;padding:14px 16px;box-shadow:0 12px 30px rgba(0,0,0,.4);font-family:"Baloo 2",system-ui,sans-serif';
 d.innerHTML='<b style="display:block;color:#f5d27a;font-size:13px;letter-spacing:.08em">'+(n==='porte'?'BUREAU CENTRAL':n==='panneau'?'PANNEAU D’APPEL':'GUICHET '+n)+'</b><div style="font-weight:700;font-size:16px;line-height:1.3;margin-top:2px">'+(n===3?'Guichet fermé. Passez au 1 ou au 2.':n==='panneau'?'Appel à 7h, 13h et 19h. Le tableau des vacations arrive très bientôt.':'Le tableau des vacations ouvre très bientôt. Repasse nous voir !')+'</div>';
 d.onclick=()=>d.remove();document.body.appendChild(d);setTimeout(()=>{try{d.remove();}catch(x){}},4200);}
function decor(){const D=[];const P=(t,x,y,o)=>D.push(Object.assign({t,x,y,gr:0},o||{}));
 P('x_jol_bcmo',BX,BY);
 GUICHETS.forEach((x,i)=>P('x_jol_entree',x,BY+8,{agir:()=>guichet(i+1),libelle:i===2?'Fermé':'Se présenter',nom:'GUICHET '+(i+1)}));
 P('x_jol_entree',BX,BY+8,{agir:()=>guichet('porte'),libelle:'Entrer',nom:'BUREAU CENTRAL'});
 P('x_jol_entree',PANNEAU,BY+8,{agir:()=>guichet('panneau'),libelle:'Lire',nom:'PANNEAU D’APPEL'});
 return D;}
function graver(t){if(t==='x_jol_bcmo')return graverBcmo();const c=document.createElement('canvas');c.width=2;c.height=2;return {toile:c,W:1,H:1,sol:0};}
function bloque(x,y){if(y<QUAI+10||x<8||x>W-8||y>H-6)return true;if(Math.abs(x-BX)<BW/2-8&&y>BY-BSOL+30&&y<BY+3)return true;return false;}
function pas(){return [];}
function acteurs(){return [];}
try{window.__CR={j:()=>joueur};}catch(x){}
return {sol,solFin,decor,bloque,graver,depart:DEPART,figurants:pas,acteurs};
})()
