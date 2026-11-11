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
   LA MAISON DES DOCKERS — le bureau d'embauche : maison provençale ocre,
   toit de tuiles, volets bleus, grand porche, guichet dans la vitrine de
   gauche, ardoise « Appel du jour ». À la taille des personnages.
   Gravée une fois, au demi-pixel.
   ===================================================================== */
const BX=400, BY=520, BW=360, OFFY=62, BH=186, BSOL=174;   /* BSOL : le pied de la façade dans la toile */
let MAISON=null;
function graverMaison(){if(MAISON)return MAISON;const K=2,W=BW,c=document.createElement('canvas');c.width=BW*K;c.height=BH*K;
 const g=c.getContext('2d');g.imageSmoothingEnabled=false;g.setTransform(K,0,0,K,0,-OFFY*K);
 const R=(x,y,w,h,col)=>{g.fillStyle=col;g.fillRect(x,y,w,h);};
 const T=(t,x,y,col,f,al)=>{g.font=f;g.textAlign=al||'center';g.fillStyle=col;g.fillText(t,x,y);};
 const tn=(hex,d)=>{const v=parseInt(hex.slice(1),16);const f=k=>Math.max(0,Math.min(255,((v>>k)&255)+d));return 'rgb('+f(16)+','+f(8)+','+f(0)+')';};
function ombreSol(x,y,w,h){const gr=g.createLinearGradient(0,y,0,y+h);gr.addColorStop(0,'rgba(40,30,20,.32)');gr.addColorStop(1,'rgba(40,30,20,0)');g.fillStyle=gr;g.fillRect(x,y,w,h);}
function lanterne(x,y){R(x-.25,y-6,.5,6,'#2a2a2e');R(x-2,y,4,.6,'#2a2a2e');R(x-1.6,y+.6,3.2,4,'#ffd98a');R(x-1.6,y+.6,3.2,.6,'#2a2a2e');R(x-.2,y+.6,.4,4,'#2a2a2e');R(x-2,y+4.6,4,.6,'#2a2a2e');
 const gr=g.createRadialGradient(x,y+2.5,0,x,y+2.5,10);gr.addColorStop(0,'rgba(255,220,140,.35)');gr.addColorStop(1,'rgba(255,220,140,0)');g.fillStyle=gr;g.fillRect(x-10,y-8,20,20);}
function pots(x,y){R(x-3.5,y-4,7,4,'#b85a36');R(x-3.5,y-4,7,.6,'#d87a52');R(x-3,y-.4,6,.4,'#8a3a22');for(let i=0;i<9;i++){g.fillStyle=['#3a6a3a','#4a8a44','#2e5a32'][i%3];g.beginPath();g.arc(x-3+hA(i,x,2)*6,y-5-hA(i,y,3)*4,1.6+hA(i,3,x)*1,0,7);g.fill();}
 for(let i=0;i<4;i++){g.fillStyle=['#e84a6a','#f2f0e8','#e8b830'][i%3];g.beginPath();g.arc(x-2.5+hA(i,9,x)*5,y-6-hA(i,8,y)*3,.7,0,7);g.fill();}}
function ardoise(x,y,w,h,titre,lignes){R(x-2,y-2,w+4,h+4,'#5a3a1e');R(x-2,y-2,w+4,.8,'#8a6a42');R(x,y,w,h,'#22302a');
 for(let i=0;i<70;i++)R(x+hA(i,1,7)*w,y+hA(i,2,7)*h,2.4,.3,'rgba(255,255,255,.05)');
 T(titre,x+w/2,y+6,'#f2efe4','800 4.6px ui-monospace,monospace');R(x+4,y+8,w-8,.4,'rgba(255,255,255,.5)');
 const L=lignes||[['07h','MSC FANTASIA','Bagages','90 €','#bfe0ff'],['09h','CMA CGM ROOSEVELT','Portique','160 €','#ffd98a'],['13h','PIANA','Embarquement','120 €','#c8f0c0'],['19h','MSC FANTASIA','Bagages nuit','COMPLET','#ffb0a0']];
 const st=(h-12)/L.length;L.forEach((l,i)=>{const yy=y+14+i*st;T(l[0],x+4,yy,'#e8e4d8','700 3.4px ui-monospace,monospace','left');T(l[1],x+13,yy,'#fff','700 3.4px ui-monospace,monospace','left');T(l[2],x+w*.58,yy,l[4],'700 3.4px ui-monospace,monospace','left');T(l[3],x+w-4,yy,l[3]==='COMPLET'?'#ff8a7a':'#f5d27a','800 3.4px ui-monospace,monospace','right');});
 R(x+2,y+h-2,w-4,1.2,'#d8d0c0');for(let k=0;k<3;k++)R(x+6+k*3,y+h-2.6,2,1,'#f2efe4');}
function porte2(x,y,w,h,c,vitre){R(x-3,y-3,w+6,h+3,tn(c,-30));R(x,y,w,h,c);const m=w/2;
 for(const s of [0,1]){const px=x+s*m;R(px+2,y+3,m-4,h*.42,vitre?'#9ac0d8':tn(c,14));R(px+2,y+h*.5,m-4,h*.44,tn(c,14));if(vitre){g.fillStyle='rgba(255,255,255,.22)';g.beginPath();g.moveTo(px+3,y+h*.4);g.lineTo(px+m*.6,y+4);g.lineTo(px+m*.8,y+4);g.lineTo(px+5,y+h*.4);g.fill();}}
 R(x+m-.5,y,1,h,tn(c,-40));R(x+m-4,y+h*.5,1.4,4,'#e8c060');R(x+m+2.6,y+h*.5,1.4,4,'#e8c060');}
function volet(x,y,w,h,c){R(x,y,w,h,c);for(let k=y+2;k<y+h-1;k+=2.2)R(x+1,k,w-2,.8,tn(c,-24));R(x,y,w,.8,tn(c,22));}
function fenRect(x,y,w,h){R(x-2,y-2,w+4,h+4,'#efe2c4');const gr=g.createLinearGradient(0,y,0,y+h);gr.addColorStop(0,'#6a9ac0');gr.addColorStop(1,'#203a56');g.fillStyle=gr;g.fillRect(x,y,w,h);R(x+w/2-.4,y,.8,h,'#efe2c4');R(x,y+h*.4,w,.8,'#efe2c4');g.fillStyle='rgba(255,255,255,.18)';g.beginPath();g.moveTo(x+2,y+h-2);g.lineTo(x+w*.5,y+2);g.lineTo(x+w*.62,y+2);g.lineTo(x+4,y+h-2);g.fill();R(x-3,y+h+2,w+6,2,'#d8c8a6');}

/* ======== G · LA MAISON DES DOCKERS (provençale, à taille réelle) ======== */
function maison(){const x0=18,x1=W-18,yB=236,rdc=86,et=58,cx=(x0+x1)/2,yF=yB-rdc-et;
 ombreSol(x0-4,yB,x1-x0+8,9);
 /* le toit de tuiles */
 const yR=yF-22;for(let y=yR;y<yF-4;y+=3.4)for(let x=x0-6+((y|0)%2)*2;x<x1+6;x+=4.2){const c=['#c4643c','#b85a36','#cc7046','#ba5e3a'][(hA(x|0,y|0,4)*4)|0];R(x,y,4.2,3.4,c);R(x,y,.6,3.4,tn(c,-30));R(x+.6,y,3.6,.6,tn(c,22));}
 R(x0-6,yR-2.4,x1-x0+12,2.6,'#9a4626');R(x0-6,yR-2.4,x1-x0+12,.6,'#c06440');
 R(x0-5,yF-4,x1-x0+10,4,'#f4ead4');for(let x=x0-5;x<x1+5;x+=2.6){g.fillStyle='#b85a36';g.beginPath();g.arc(x+1.3,yF-1.5,1.2,0,Math.PI);g.fill();}
 /* les murs ocre */
 R(x0,yF,x1-x0,yB-yF,'#e3b97c');for(let i=0;i<60;i++)R(x0+hA(i,3,9)*(x1-x0),yF+hA(i,4,9)*(yB-yF),4+hA(i,5,9)*10,2+hA(i,6,9)*4,'rgba(255,240,210,.18)');
 for(let i=0;i<30;i++)R(x0+hA(i,7,9)*(x1-x0),yF+hA(i,8,9)*(yB-yF),3+hA(i,9,9)*8,1.5+hA(i,1,9)*3,'rgba(150,90,40,.12)');
 for(const qx of [x0,x1-8])for(let y=yF;y<yB-10;y+=9){const w=((y/9|0)%2)?8:6,xx=qx===x0?x0:x1-w;R(xx,y,w,8.4,'#f2e4c4');R(xx,y+8.4,w,.6,'#c8a874');}
 /* le bandeau peint entre les étages */
 R(x0,yB-rdc-6,x1-x0,6,'#f2e4c4');R(x0,yB-rdc,x1-x0,.8,'#c8a874');
 T('EMBAUCHE DES DOCKERS',cx,yB-rdc-12,'#7a2a1a','800 9px Georgia,serif');T('PORT DE MARSEILLE',cx,yB-rdc-24,'rgba(122,42,26,.6)','700 4.2px Georgia,serif');
 /* étage : fenêtres à volets bleus */
 for(const fx of [x0+26,x0+78,x1-104,x1-52]){fenRect(fx,yF+8,24,30);volet(fx-15,yF+8,13,30,'#3c7fa8');volet(fx+26,yF+8,13,30,'#3c7fa8');}
 /* rez-de-chaussée : socle, grand porche cintré, deux vitrines */
 R(x0,yB-12,x1-x0,12,'#c8a874');R(x0,yB-12,x1-x0,.8,'#e8d0a0');for(let x=x0;x<x1;x+=18)R(x,yB-12,.5,12,'#a88a5a');
 const dw=46,dh=72,dx=cx-dw/2,dy=yB-dh;
 g.fillStyle='#f2e4c4';g.beginPath();g.moveTo(dx-5,yB);g.lineTo(dx-5,dy+dw/2);g.arc(cx,dy+dw/2,dw/2+5,Math.PI,0);g.lineTo(dx+dw+5,yB);g.fill();
 g.save();g.beginPath();g.moveTo(dx,yB);g.lineTo(dx,dy+dw/2);g.arc(cx,dy+dw/2,dw/2,Math.PI,0);g.lineTo(dx+dw,yB);g.clip();
 porte2(dx,dy,dw,dh,'#2f5d4a',false);g.fillStyle='#ffd98a';g.beginPath();g.arc(cx,dy+dw/2,dw/2-3,Math.PI,0);g.fill();for(let i=1;i<6;i++){const a=Math.PI+i*Math.PI/6;g.strokeStyle='#2f5d4a';g.lineWidth=1;g.beginPath();g.moveTo(cx,dy+dw/2);g.lineTo(cx+Math.cos(a)*dw/2,dy+dw/2+Math.sin(a)*dw/2);g.stroke();}
 g.restore();R(cx-30,yB,60,3,'#d0c2a2');R(cx-30,yB,60,.6,'#e8dcc0');
 for(const fx of [x0+20,x1-56]){const fw=36,fh=50,fy=yB-12-fh-6;g.fillStyle='#f2e4c4';g.beginPath();g.moveTo(fx-3,fy+fh+3);g.lineTo(fx-3,fy+fw/2);g.arc(fx+fw/2,fy+fw/2,fw/2+3,Math.PI,0);g.lineTo(fx+fw+3,fy+fh+3);g.fill();
  const gr=g.createLinearGradient(0,fy,0,fy+fh);gr.addColorStop(0,'#ffe8b8');gr.addColorStop(1,'#c8904a');g.fillStyle=gr;g.beginPath();g.moveTo(fx,fy+fh);g.lineTo(fx,fy+fw/2);g.arc(fx+fw/2,fy+fw/2,fw/2,Math.PI,0);g.lineTo(fx+fw,fy+fh);g.fill();
  R(fx+fw/2-.5,fy+2,1,fh-2,'#5a3a1e');R(fx,fy+fw/2,fw,1,'#5a3a1e');R(fx-4,fy+fh,fw+8,3,'#d8c8a6');}
 /* dans la vitrine de gauche : un agent au guichet */
 g.save();const fx=x0+20,fy=yB-12-56;g.beginPath();g.rect(fx,fy+18,36,30);g.clip();personne(g,fx+18,fy+66,{_pnj:true,_civil:true,yeux:1,peau:2,cheveux:2,coiffe:1,haut:4,veste:'#e8e4d8',pantalon:'#3a4048'},'bas',0,false);g.restore();g.setTransform(K,0,0,K,0,-OFFY*K);
 R(fx-1,fy+42,38,3,'#8a5a32');T('GUICHET',fx+18,fy+14,'#7a2a1a','800 4px ui-monospace,monospace');
 /* le grand tableau noir, à hauteur d'homme, sous la vitrine de droite */
 ardoise(cx+38,yB-rdc+6,64,32,'APPEL DU JOUR',[['07h','FANTASIA','Bagages','90 €','#bfe0ff'],['09h','ROOSEVELT','Portique','160 €','#ffd98a'],['13h','PIANA','Embarq.','120 €','#c8f0c0']]);
 lanterne(dx-12,dy+10);lanterne(dx+dw+12,dy+10);
 pots(x0+10,yB+4);pots(x1-10,yB+4);}


 try{maison();}catch(x){console.warn('MAISON',x);}
 return MAISON={toile:c,W:BW,H:BH,sol:BSOL};}
const GUICHETS=[BX-124];            /* la vitrine du guichet, en x du monde */
const PANNEAU=BX+70;               /* l'ardoise de l'appel */
/* en attendant le tableau des vacations : une petite carte au guichet */
async function guichet(n){try{if(!window.ouvrirVacations)eval(await chargerMorceau('vacations.js'));window.ouvrirVacations();return;}catch(x){console.warn('VAC',x);}
 function vieux(n){const old=document.getElementById('bcmoMot');if(old)old.remove();
 const d=document.createElement('div');d.id='bcmoMot';d.style.cssText='position:fixed;left:50%;bottom:calc(120px + env(safe-area-inset-bottom));transform:translateX(-50%);z-index:2147482000;width:min(88vw,360px);background:#1b2330;color:#f2efe4;border-radius:18px;padding:14px 16px;box-shadow:0 12px 30px rgba(0,0,0,.4);font-family:"Baloo 2",system-ui,sans-serif';
 d.innerHTML='<b style="display:block;color:#f5d27a;font-size:13px;letter-spacing:.08em">'+(n==='porte'?'EMBAUCHE DES DOCKERS':n==='panneau'?'APPEL DU JOUR':'LE GUICHET')+'</b><div style="font-weight:700;font-size:16px;line-height:1.3;margin-top:2px">'+(n==='panneau'?'Appel à 7h, 13h et 19h. Le tableau des vacations arrive très bientôt.':'Le tableau des vacations ouvre très bientôt. Repasse nous voir !')+'</div>';
 d.onclick=()=>d.remove();document.body.appendChild(d);setTimeout(()=>{try{d.remove();}catch(x){}},4200);}vieux(n);}
function decor(){const D=[];const P=(t,x,y,o)=>D.push(Object.assign({t,x,y,gr:0},o||{}));
 P('x_jol_maison',BX,BY);
 P('x_jol_entree',GUICHETS[0],BY+8,{agir:()=>guichet(1),libelle:'Se présenter',nom:'LE GUICHET'});
 P('x_jol_entree',BX,BY+8,{agir:()=>guichet('porte'),libelle:'Entrer',nom:'EMBAUCHE DES DOCKERS'});
 P('x_jol_entree',PANNEAU,BY+8,{agir:()=>guichet('panneau'),libelle:'Lire',nom:'APPEL DU JOUR'});
 return D;}
function graver(t){if(t==='x_jol_maison')return graverMaison();const c=document.createElement('canvas');c.width=2;c.height=2;return {toile:c,W:1,H:1,sol:0};}
function bloque(x,y){if(y<QUAI+10||x<8||x>W-8||y>H-6)return true;if(Math.abs(x-BX)<BW/2-22&&y>BY-150&&y<BY+3)return true;return false;}
function pas(){return [];}
function acteurs(){return [];}
try{window.__CR={j:()=>joueur};}catch(x){}
return {sol,solFin,decor,bloque,graver,depart:DEPART,figurants:pas,acteurs};
})()
