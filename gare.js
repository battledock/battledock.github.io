/* =====================================================================
   LA GARE MARITIME — le premier lieu du port (gare.html). Le ferry pour
   la Corse est à quai, les voitures attendent en files, la Major au
   loin. Poste n°1 : l'embarquement (embarquement.js).
   Par la droite, le quai mène au port qui travaille (travail.html).
   En bas, le passage piéton remonte à la place.
   Chargé par moteur.js (eval direct). Ne touche à rien d'autre.
   ===================================================================== */
(()=>{
const hA=(x,y,k)=>{let n=((x*73856093)^(y*19349663)^(k*83492791))|0;n=(n^(n>>>13))*1274126177|0;return((n^(n>>>16))>>>0)/4294967296;};
const tn=(hex,d)=>{const v=parseInt(hex.slice(1),16);const f=k=>Math.max(0,Math.min(255,((v>>k)&255)+d));return 'rgb('+f(16)+','+f(8)+','+f(0)+')';};
const CCOL=['#c8402a','#2a6ab8','#3a8a5a','#e8a020','#7a3a6a','#4a5a6a','#d86a2a','#2a8a9a','#b8b0a0','#5a2a2a'];
function toile(L,HH){const D=2,c=document.createElement('canvas');c.width=Math.ceil(L*D);c.height=Math.ceil(HH*D);const g=c.getContext('2d');g.setTransform(D,0,0,D,0,0);g.imageSmoothingEnabled=false;return {c,g};}
/* le pinceau : toutes les petites fonctions de dessin travaillent sur un contexte g */
function pinceau(g){
const R=(x,y,w,h,col)=>{g.fillStyle=col;g.fillRect(x,y,w,h);};
const T=(s,x,y,px,col,al)=>{g.fillStyle=col;g.font='bold '+px+'px "Helvetica Neue",Arial,sans-serif';g.textAlign=al||'center';g.textBaseline='middle';g.fillText(s,x,y);};
const ombre=(x,y,w,h,a)=>{g.fillStyle='rgba(10,20,30,'+(a||.3)+')';g.beginPath();g.ellipse(x,y,w,h,0,0,7);g.fill();};
const P={R,T,ombre,
 ciel(h){const gr=g.createLinearGradient(0,0,0,h);gr.addColorStop(0,'#7ab4e0');gr.addColorStop(1,'#d8ecf6');g.fillStyle=gr;g.fillRect(0,0,800,h);},
 mer(y0,y1){for(let y=y0;y<y1;y++){const k=(y-y0)/(y1-y0);R(0,y,800,1,'rgb('+(30+k*26|0)+','+(92+k*40|0)+','+(140+k*20|0)+')');}
  for(let i=0;i<900;i++){const x=hA(i,1,13)*800,y=y0+hA(i,2,13)*(y1-y0),k=(y-y0)/(y1-y0);R(x,y,(3+hA(i,3,13)*10)*(.4+k),.7,hA(i,4,13)<.6?'rgba(255,255,255,'+(.08+k*.12)+')':'rgba(10,40,70,.18)');}},
 ile(x,y,w,h){g.fillStyle='#8a9aa8';g.beginPath();g.moveTo(x,y);g.quadraticCurveTo(x+w*.3,y-h,x+w*.5,y-h*.7);g.quadraticCurveTo(x+w*.7,y-h*1.1,x+w,y);g.fill();},
 beton(x,y,w,h){R(x,y,w,h,'#bdb6a6');for(let yy=y;yy<y+h;yy+=20)for(let xx=x-((yy/20|0)%2)*20;xx<x+w;xx+=40)R(Math.max(x,xx)+.5,yy+.5,Math.min(39,x+w-Math.max(x,xx)-1),19,['#c8c1b1','#c2bbab','#cdc6b6','#beb7a7'][(hA(xx,yy,5)*4)|0]);
  for(let i=0;i<w*h/60;i++)R(x+hA(i,x,6)*w,y+hA(i,y,7)*h,1,1,hA(i,8,8)<.5?'rgba(255,255,255,.25)':'rgba(60,50,40,.12)');},
 quai(y){P.beton(0,y,800,800-y);R(0,y-4,800,5,'#e4ddce');R(0,y-4,800,.8,'#f6f1e6');for(let k=0;k<800;k+=10){R(k,y+8,5,3,'#f2c230');R(k+5,y+8,5,3,'#2a2a2a');}
  R(0,y-6,800,2,'rgba(10,30,40,.35)');for(let x=20;x<800;x+=50){R(x-2,y-1,4,4,'#2a2e34');R(x-3,y-2,6,1.5,'#3a4048');}},
 conteneur(x,y,w,h,col){R(x,y,w,h,col);R(x,y,w,1,tn(col,40));R(x,y+h-1,w,1,tn(col,-50));for(let k=x+2;k<x+w-1;k+=2)R(k,y+1,.5,h-2,tn(col,-22));},
 pile(x,y,nx,ny,seed){for(let j=0;j<ny;j++)for(let i=0;i<nx;i++){const col=CCOL[(hA(i+seed,j,9)*CCOL.length)|0];P.conteneur(x+i*25,y+j*11,24,10,col);if(hA(i,j+seed,3)<.5)P.conteneur(x+i*25,y+j*11-4,24,4,CCOL[(hA(j,i+seed,4)*CCOL.length)|0]);}},
 voiture(x,y,col){R(x,y,18,9,col);R(x+3,y+1,9,7,tn(col,30));R(x+4,y+2,7,5,'#2a3a4a');R(x+1,y+8.5,3,1.5,'#1a1a1a');R(x+13,y+8.5,3,1.5,'#1a1a1a');},
 campingcar(x,y){R(x,y,30,12,'#f6f6f2');R(x+2,y+2,8,4,'#2a3a4a');R(x+12,y+2,14,3,'#9ac8e8');R(x,y+8,30,1.5,'#3a8ac4');R(x+4,y+11,4,2,'#1a1a1a');R(x+22,y+11,4,2,'#1a1a1a');},
 camion(x,y,col){R(x,y,30,9,col);for(let k=x+2;k<x+29;k+=2)R(k,y+1,.5,7,tn(col,-22));R(x-10,y,10,9,'#e8e8e8');R(x-9,y+1,6,3,'#2a3a4a');R(x+3,y+9,4,2,'#1a1a1a');R(x+22,y+9,4,2,'#1a1a1a');},
 remorqueur(x,y){ombre(x+10,y+6,12,4);g.fillStyle='#c8302a';g.beginPath();g.ellipse(x+10,y,12,5,0,0,7);g.fill();R(x+4,y-6,8,6,'#f6f1e6');R(x+5,y-5,6,2,'#2a3a4a');R(x+7,y-10,2,4,'#2a2a2a');},
 pilote(x,y){ombre(x+12,y+6,14,4);g.fillStyle='#f2c230';g.beginPath();g.ellipse(x+12,y,14,5,0,0,7);g.fill();R(x+6,y-7,10,7,'#2a2a2a');R(x+7,y-6,8,2,'#9ac8e8');},
 voilier(x,y,s){g.fillStyle='#f6f6f2';g.beginPath();g.moveTo(x,y);g.lineTo(x,y-26*s);g.lineTo(x+14*s,y-2*s);g.closePath();g.fill();g.fillStyle='#e8eef4';g.beginPath();g.moveTo(x-1,y-2*s);g.lineTo(x-1,y-20*s);g.lineTo(x-9*s,y-2*s);g.closePath();g.fill();R(x-10*s,y,26*s,3*s,'#2a3a5a');},
 ferry(x,y,L){ombre(x+L/2,y+40,L/2+8,10);g.fillStyle='#f6f6f2';g.beginPath();g.moveTo(x,y+4);g.lineTo(x+L-36,y);g.quadraticCurveTo(x+L+6,y+18,x+L-36,y+38);g.lineTo(x,y+38);g.closePath();g.fill();
  R(x,y+28,L-34,10,'#2a6ab8');R(x,y+25,L-34,3,'#f2c230');for(let k=0;k<4;k++){R(x+8+k*8,y-8-k*9,L-80-k*16,10,'#ffffff');for(let w=x+10+k*8;w<x+L-74-k*8;w+=6)R(w,y-6-k*9,4,5,'#2a4a6a');}
  R(x+L-110,y-50,22,20,'#2a6ab8');R(x+L-110,y-50,22,4,'#f2c230');R(x-6,y+8,8,26,'#3a4048');T('CORSE · SARDAIGNE',x+L/2-10,y+16,8,'#2a6ab8');},
 cargo(x,y,L){ombre(x+L/2,y+36,L/2+8,10);g.fillStyle='#1f2a3a';g.beginPath();g.moveTo(x,y+10);g.lineTo(x+L-40,y+4);g.quadraticCurveTo(x+L+6,y+20,x+L-40,y+38);g.lineTo(x,y+36);g.closePath();g.fill();
  R(x,y+30,L-38,8,'#8a2a2a');for(let i=0;i<Math.floor((L-90)/25);i++)for(let j=0;j<4;j++)P.conteneur(x+70+i*25,y-14+j*9,24,9,CCOL[(hA(i,j,21)*CCOL.length)|0]);
  R(x+8,y-34,40,44,'#f2f2ee');R(x+8,y-34,40,3,'#ffffff');for(let k=0;k<5;k++)R(x+11,y-29+k*8,34,3.5,'#2a3a4a');R(x+20,y-46,14,12,'#c8402a');R(x+20,y-46,14,3,'#2a2a2a');T('MEDITERRANÉE EXPRESS',x+L/2+20,y+24,8,'#e8e8e8');},
 roulier(x,y,L){ombre(x+L/2,y+40,L/2+6,10);R(x,y-20,L-30,60,'#3a6a4a');R(x,y-20,L-30,4,'#5a8a6a');R(x,y+30,L-30,10,'#8a2a2a');g.fillStyle='#3a6a4a';g.beginPath();g.moveTo(x+L-30,y-20);g.quadraticCurveTo(x+L+6,y+10,x+L-30,y+40);g.fill();
  R(x+L-90,y-46,40,26,'#f2f2ee');for(let k=0;k<3;k++)R(x+L-86,y-42+k*7,32,3,'#2a3a4a');R(x-8,y+4,12,40,'#5a6470');T('RO-RO · TUNISIE',x+L/2-20,y+10,9,'#f6f1e6');},
 major(x,y,s){const W=200*s,H=60*s;for(let k=0;k<H;k+=4*s){R(x,y-H+k,W,2*s,'#e0d0b0');R(x,y-H+k+2*s,W,2*s,'#7a8a6a');}
  for(const [dx,r] of [[40,22],[100,36],[160,22]]){const cx=x+dx*s,rr=r*s;for(let k=0;k<rr;k+=3*s){g.fillStyle=(k/(3*s)|0)%2?'#e0d0b0':'#7a8a6a';g.beginPath();g.arc(cx,y-H,rr-k,Math.PI,0);g.fill();}R(cx-1.5*s,y-H-rr-12*s,3*s,12*s,'#5a6a4a');}
  for(const dx of [10,190]){R(x+dx*s-8*s,y-H-30*s,16*s,30*s+H,'#e0d0b0');for(let k=0;k<30*s+H;k+=4*s)R(x+dx*s-8*s,y-H-30*s+k,16*s,2*s,'#7a8a6a');}},
 caleSeche(x,y,w,h){R(x,y,w,h,'#7a7468');for(let k=0;k<5;k++)R(x+k*3,y+k*3,w-k*6,h-k*6,['#8a8478','#948e82','#9e988c','#a8a296','#6a645a'][k]);
  const cx=x+w/2,cy=y+h/2;R(cx-170,cy+20,340,6,'#5a4a3a');for(let k=cx-160;k<cx+160;k+=30)R(k,cy+10,12,14,'#6a5a4a');
  g.fillStyle='#8a2a2a';g.beginPath();g.moveTo(cx-180,cy-30);g.lineTo(cx+150,cy-30);g.quadraticCurveTo(cx+200,cy-10,cx+150,cy+12);g.lineTo(cx-180,cy+12);g.closePath();g.fill();
  R(cx-180,cy-30,330,14,'#2a3a5a');R(cx-170,cy-60,60,30,'#f2f2ee');for(let k=0;k<3;k++)R(cx-166,cy-54+k*8,52,3,'#2a3a4a');
  for(let k=0;k<6;k++){R(cx-80+k*36,cy-26,2,40,'#e8b020');R(cx-84+k*36,cy-30,10,2,'#e8b020');}T('CALE SÈCHE · RÉPARATION NAVALE',cx,y+h-10,8,'#f6f1e6');},
};return P;}
/* les objets du décor qu'on contourne : une toile, posée par son pied */
function objet(L,HH,dessin,s){s=s||1;const {c,g}=toile(L*s,HH*s);g.scale(s,s);dessin(g,pinceau(g),L,HH);return {toile:c,W:L*s,H:HH*s,sol:(HH-4)*s};}
async function lancer(f,fn){try{if(!window[fn])eval(await chargerMorceau(f));window[fn]();}catch(x){console.warn('POSTE',f,x);}}
const OBJETS={
 palmier:()=>objet(50,60,(g,P,L,H)=>{const x=L/2,y=H-4;P.ombre(x+6,y,10,3,.22);for(let k=0;k<34;k+=3){g.fillStyle=k%6?'#8a6a42':'#a8845a';g.fillRect(x-1.4+Math.sin(k*.06)*1.5,y-k,2.8,3);}
  const tx=x+Math.sin(2)*1.5,ty=y-34;for(let i=0;i<9;i++){const a=i/9*6.283;g.strokeStyle=i%2?'#3a7a3a':'#4a9a42';g.lineWidth=2.4;g.beginPath();g.moveTo(tx,ty);g.quadraticCurveTo(tx+Math.cos(a)*10,ty+Math.sin(a)*4-6,tx+Math.cos(a)*18,ty+Math.sin(a)*7+4);g.stroke();}g.fillStyle='#5a3a1a';g.fillRect(tx-2,ty-1,4,3);},2.2),
 lampadaire:()=>objet(12,36,(g,P,L,H)=>{const x=L/2,y=H-4;P.ombre(x+2,y,3,1,.2);P.R(x-.6,y-28,1.2,28,'#2f3a34');P.R(x-3,y-30,6,2,'#2f3a34');P.R(x-2,y-29,4,3,'#f6e8b8');},2),
 banc:()=>objet(22,14,(g,P,L,H)=>{const x=L/2,y=H-4;P.R(x-8,y-5,16,2,'#8a5a3a');P.R(x-8,y-8,16,2,'#9a6a42');P.R(x-7,y-3,1.5,3,'#3a3a3a');P.R(x+5.5,y-3,1.5,3,'#3a3a3a');},2.2),
 poste:(n,nom,col)=>objet(120,56,(g,P,L,H)=>{const x=L/2,y=H-4;g.font='bold 6.4px "Helvetica Neue",Arial,sans-serif';const tw=g.measureText(nom).width,pw=tw+28,px=x-pw/2+6;P.ombre(x+3,y,16,4,.25);P.R(x-1,y-26,2,26,'#3a4048');P.R(px-6,y-50,pw,24,col);P.R(px-6,y-50,pw,2,'rgba(255,255,255,.35)');
  g.fillStyle='#fff';g.beginPath();g.arc(px+4,y-38,7,0,7);g.fill();P.T(String(n),px+4,y-37.5,9,col);P.T(nom,px+14,y-38,6.4,'#ffffff','left');},1.6),
 portique:()=>objet(50,200,(g,P,L,H)=>{const x=L/2,y=H-4,h=120,col='#d84a2a';P.R(x-18,y-h,3,h,col);P.R(x+15,y-h,3,h,col);P.R(x-18,y-h,36,5,col);P.R(x-18,y-h+20,36,2,tn(col,-30));
  P.R(x-3,y-h-14,6,14,col);P.R(x-2,y-h-60,4,60,tn(col,-10));P.R(x-8,y-h-4,16,8,'#f2f2ee');P.R(x-6,y-h-2,5,3,'#2a3a4a');for(const dx of [-17,16])P.R(x+dx-3,y-3,7,4,'#3a3a3a');P.ombre(x+20,y+2,22,4,.25);},1.8),
 cavalier:()=>objet(20,26,(g,P,L,H)=>{const x=L/2,y=H-4;P.ombre(x+2,y,8,2,.2);P.R(x-6,y-14,2,14,'#e8b020');P.R(x+4,y-14,2,14,'#e8b020');P.R(x-7,y-16,14,3,'#e8b020');P.R(x-3,y-19,6,4,'#2a3a4a');},2.6),
 pile:(nx,ny,s)=>objet(nx*25+4,ny*11+12,(g,P,L,H)=>{P.ombre(L/2+4,H-3,L/2,4,.25);P.pile(2,8,nx,ny,s);},2.4),
 hangar:(w,h,col,nom)=>objet(w+4,h+14,(g,P,L,H)=>{const x=2,y=H-4;P.R(x,y-h,w,h,col);for(let k=0;k<w;k+=16){g.fillStyle=tn(col,18);g.beginPath();g.moveTo(x+k,y-h);g.lineTo(x+k+8,y-h-8);g.lineTo(x+k+16,y-h);g.fill();}
  for(let k=x+10;k<x+w-10;k+=26){P.R(k,y-22,16,22,tn(col,-50));}P.T(nom,x+w/2,y-h+12,9,'#ffffff');}),
 gare:(w,h)=>objet(w+24,h+30,(g,P,L,H)=>{const x=12,y=H-4;P.R(x,y-h,w,h,'#f4f6f8');g.fillStyle='#2a6ab8';g.beginPath();g.moveTo(x-10,y-h);g.quadraticCurveTo(x+w/2,y-h-26,x+w+10,y-h);g.lineTo(x+w+10,y-h+6);g.quadraticCurveTo(x+w/2,y-h-18,x-10,y-h+6);g.fill();
  for(let k=x+8;k<x+w-8;k+=18){P.R(k,y-h+14,14,h-24,'#7aa8c8');P.R(k,y-h+14,14,3,'rgba(255,255,255,.4)');}P.R(x+w/2-20,y-30,40,30,'#2a3a4a');P.T('GARE MARITIME · CORSE',x+w/2,y-h+8,8,'#2a6ab8');}),
 vide:()=>{const c=document.createElement('canvas');c.width=2;c.height=2;return {toile:c,W:1,H:1,sol:0};}};
function partir(url){try{sauver();}catch(z){}document.body.style.transition='opacity .4s';document.body.style.opacity='0';setTimeout(()=>{location.href=url;},400);}
const DE=(()=>{try{return new URLSearchParams(location.search).get('de')||'';}catch(x){return '';}})();
/* l'eau qui scintille et les mouettes : de petits acteurs */
function scintille(A,y0,y1){const t=performance.now()/1000;for(let i=0;i<30;i++){const x0=hA(i,1,9)*800,yy=y0+hA(i,2,9)*(y1-y0),ph=(t*.6+hA(i,3,9)*6)%6;if(ph>3)continue;
  A.push({y:-1,f:(g,cx,cy)=>{g.fillStyle='rgba(255,255,255,'+(Math.sin(ph/3*Math.PI)*.4).toFixed(2)+')';g.fillRect(Math.round(x0+ph*3-cx),Math.round(yy-cy),6,.7);}});}
  for(let i=0;i<4;i++){const a=t*(.3+i*.07)+i*1.7,x=150+i*170+Math.cos(a)*60,y=y0+40+i*14+Math.sin(a)*20,b=Math.sin(t*9+i)>0;
    A.push({y:99999,f:(g,cx,cy)=>{const X=x-cx,Y=y-cy;g.fillStyle='#fff';g.fillRect(X-1,Y,2,1.4);g.fillStyle='#3a3a3a';if(b){g.fillRect(X-4,Y-1.5,3,.8);g.fillRect(X+1,Y-1.5,3,.8);}else{g.fillRect(X-4,Y+.6,3,.8);g.fillRect(X+1,Y+.6,3,.8);}}});}}

const W=800,H=800,QUAI=400;
const DEPART=DE==='travail'?[772,640]:[410,768];
const VOIT=[];for(let r=0;r<3;r++)for(let i=0;i<9;i++)if(hA(i,r,7)<.72)VOIT.push({x:262+i*56,y:452+r*62,cc:hA(i,r,8)<.15,col:['#c8402a','#3a6ab8','#e8e8e8','#2a2a2a','#e8a020','#3a8a5a'][(i+r)%6]});
function sol(){const c=document.createElement('canvas');c.width=W;c.height=H;const g=c.getContext('2d');g.fillStyle='#c4bdad';g.fillRect(0,0,W,H);g.fillStyle='#3a7aa0';g.fillRect(0,0,W,QUAI);return c;}
function solFin(){const c=document.createElement('canvas');c.width=W*2;c.height=H*2;const g=c.getContext('2d');g.setTransform(2,0,0,2,0,0);const P=pinceau(g);
  P.ciel(70);P.ile(300,70,160,18);P.ile(560,70,220,24);P.major(30,70,.9);P.mer(70,QUAI);
  P.voilier(440,150,.8);P.voilier(250,190,.6);
  P.ferry(160,300,560);
  P.quai(QUAI);
  /* la rampe arrière du ferry, posée sur le quai */
  P.R(150,QUAI-26,46,34,'#5a6470');for(let k=0;k<34;k+=4)P.R(150,QUAI-26+k,46,1.2,'#7a8692');P.R(150,QUAI-26,2,34,'#f2c230');P.R(194,QUAI-26,2,34,'#f2c230');
  /* les files d'attente, peintes au sol, et les voitures */
  for(let r=0;r<4;r++)P.R(240,440+r*62,540,2,'#f6f1e6');
  P.R(232,432,8,192,'#e8402a');
  for(const v of VOIT){g.save();g.translate(v.x,v.y);g.scale(2.2,2.2);if(v.cc)P.campingcar(-2,0);else P.voiture(0,0,v.col);g.restore();}
  /* la promenade : dalles plus claires, et le passage piéton vers la place */
  P.R(240,630,560,50,'rgba(255,255,255,.12)');
  for(let k=0;k<6;k++)P.R(384,722+k*12,52,7,'#f6f1e6');
  P.T('↓ LA PLACE',410,712,8,'#5a5040');
  P.R(780,600,20,80,'rgba(242,194,48,.25)');P.T('→',788,640,12,'#a88a20');
  return c;}
const GR={x_jol_palmier:OBJETS.palmier,x_jol_lampadaire:OBJETS.lampadaire,x_jol_banc:OBJETS.banc,x_jol_gare:()=>OBJETS.gare(200,120),x_jol_poste:()=>OBJETS.poste(1,'EMBARQUEMENT','#2a8a6a'),
  x_jol_panneau:()=>OBJETS.poste('→','LE PORT QUI TRAVAILLE','#5a6470'),x_jol_entree:OBJETS.vide};
const CACHE={};function graver(t,v){return CACHE[t]||(CACHE[t]=(GR[t]||OBJETS.vide)(v));}
function decor(){const D=[];const P=(t,x,y,o)=>D.push(Object.assign({t,x,y,gr:0},o||{}));
  P('x_jol_gare',122,724,{col:[200,30]});
  for(const x of [290,470,650])P('x_jol_palmier',x,760,{col:[8,4]});
  for(const x of [380,560])P('x_jol_banc',x,700,{col:[36,4]});
  for(const x of [40,140,320,520,720])P('x_jol_lampadaire',x,QUAI+30,{col:[3,2]});
  P('x_jol_poste',196,452,{col:[4,3],agir:()=>lancer('embarquement.js','ouvrirEmbarquement'),libelle:'Poste : l’embarquement',nom:'POSTE N°1'});
  P('x_jol_panneau',740,612,{col:[4,3],agir:()=>partir('travail.html?de=gare&t='+Date.now()),libelle:'Aller au port qui travaille',nom:'LE QUAI'});
  return D;}
let parti=false;
function bloque(x,y){
  if(!parti&&x>792&&y>QUAI+10){parti=true;partir('travail.html?de=gare&t='+Date.now());return true;}
  if(!parti&&y>790&&x>380&&x<440){parti=true;partir('spawn.html?de=port&t='+Date.now());return true;}
  if(y<QUAI+14||x<6||x>794||y>794)return true;
  for(const v of VOIT)if(x>v.x-6&&x<v.x+(v.cc?64:42)&&y>v.y-2&&y<v.y+28)return true;
  if(x>20&&x<224&&y>690&&y<726)return true;
  return false;}
const AP0={peau:1,cheveux:1,coiffe:1,barbe:0,haut:2,veste:0,bas:0,pantalon:9,souliers:0,chaussures:0,sac:0,chapeau:0,raye:0,motif:0,_pnj:true};
const PAX=[0,1,2,3].map(i=>({x0:60+i*30,y0:660,x1:180,y1:QUAI+30,k:i/4,s:1,x:0,y:0,ap:Object.assign({},AP0,{peau:1+i,coiffe:i*2%7,haut:[1,3,5,2][i],veste:[19,22,16,24][i]}),dir:'haut',pas:0}));
let TL=performance.now();
function pas(){const n=performance.now(),dt=Math.min(.05,(n-TL)/1000);TL=n;
  for(const f of PAX){f.k+=f.s*dt*.08;if(f.k>1||f.k<0){f.s*=-1;f.k=Math.max(0,Math.min(1,f.k));}f.x=f.x0+(f.x1-f.x0)*f.k;f.y=f.y0+(f.y1-f.y0)*f.k;f.dir=f.s>0?'haut':'bas';f.pas+=dt*8;}
  return PAX;}
function acteurs(){const A=[];scintille(A,80,QUAI-20);
  const t=performance.now()/1000,rx=520+Math.sin(t*.1)*160;A.push({y:-1,f:(g,cx,cy)=>{const P=pinceau(g);g.save();g.translate(-cx,-cy);P.remorqueur(rx,250);P.pilote(660+Math.cos(t*.13)*60,170);g.restore();}});
  return A;}
try{window.__PT={j:()=>joueur};}catch(x){}
return {sol,solFin,decor,bloque,graver,depart:DEPART,figurants:pas,acteurs};
})()
