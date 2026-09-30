/* =====================================================================
   PARIS — l'avenue. Chargé par jeu.html seulement quand on y est.
   Évalué DANS la portée du jeu : il voit toutes ses fonctions.
   ===================================================================== */
(()=>{
const alea=(n)=>{const v=Math.sin(n*127.1+311.7)*43758.5453;return v-Math.floor(v);};
const al=(n)=>{const v=Math.sin(n*12.9898)*43758.5453;return v-Math.floor(v);};
let g=null,P=null;      /* la toile courante : chaque graveur les branche avant de dessiner */

/* LA PIERRE DE TAILLE DE PARIS : blonde, grise, presque blanche — pas d'enduit ocre */
const ENDUITS=[
{o:'#9a9280',s:'#c0b8a2',p:'#d8d0b8',c:'#e6dfc8',h:'#f2ecd8',nom:'pierre blonde'},
{o:'#8e8c84',s:'#b4b2a8',p:'#cccabe',c:'#dcdacd',h:'#ebe9dd',nom:'pierre grise'},
{o:'#97907e',s:'#bdb6a0',p:'#d4ceb6',c:'#e2ddc6',h:'#efebd6',nom:'pierre claire'},
{o:'#8a8478',s:'#aea89a',p:'#c6c0b0',c:'#d6d0c0',h:'#e6e0d0',nom:'pierre froide'}];
const VOLETS=[{o:'#41505c',p:'#5f7382',h:'#8098a8'},{o:'#3a4a44',p:'#566c64',h:'#7a9088'},
{o:'#4a4438',p:'#6a6252',h:'#8e8674'},{o:'#3f4652',p:'#5c6676',h:'#808a9c'}];
const PI_X={o:'#7d6a4a',s:'#9e8a64',p:'#bba57c',c:'#cdb88e',h:'#dfcca4',e:'#ebdcb8'};
/* LE ZINC DE PARIS : gris bleuté, avec ses joints debout */
const TU_M={o:'#3f4750',s:'#535d68',p:'#68737f',c:'#7b8794',h:'#95a1ae',faite:'#aab6c2'};
function enduit(R,x0,y0,w,h,E,graine){
R(x0,y0,w,h,E.p);
for(let i=0;i<w*h/7;i++){
const x=x0+alea(i*1.37+graine)*w, y=y0+alea(i*2.11+graine*3)*h;
R(x,y,1,1,[E.c,E.s,E.c,E.h][i%4]);
}
for(let i=0;i<6;i++)R(x0+alea(i+graine)*w,y0+h-10-alea(i*3+graine)*6,3+alea(i*7)*6,8,'rgba(90,60,30,.10)');
}
function chaine(R,x,y0,h,cote){
for(let y=y0,k=0;y<y0+h;y+=6,k++){
const w=k%2?7:10, xx=cote<0?x:x-w;
R(xx,y,w,5,PI_X.c);R(xx,y,w,1,PI_X.e);R(xx,y+5,w,1,PI_X.o);
R(cote<0?xx+w-1:xx,y,1,5,PI_X.s);
}
}
function fenetreM(R,g,x,y,E,V,etat){
R(x-3,y-4,19,26,PI_X.c);R(x-3,y-4,19,2,PI_X.e);R(x-3,y-4,2,26,PI_X.h);
R(x,y,13,20,'#26303a');
R(x+1,y+1,5,18,'#3a4a58');R(x+7,y+1,5,18,'#3a4a58');R(x+6,y,1,20,'#1a2028');
g.fillStyle='rgba(220,235,245,.22)';g.beginPath();g.moveTo(x+1,y+14);g.lineTo(x+6,y+2);g.lineTo(x+9,y+2);g.lineTo(x+4,y+14);g.fill();
if(etat==='ferme'){
R(x,y,13,20,V.p);for(let s=1;s<20;s+=2)R(x,y+s,13,1,V.o);R(x+6,y,1,20,V.o);R(x,y,13,1,V.h);
}else{
[[x-7,6],[x+14,6]].forEach(([vx,w])=>{R(vx,y,w,20,V.p);for(let s=1;s<20;s+=2)R(vx,y+s,w,1,V.o);
R(vx,y,w,1,V.h);R(vx+(vx<x?w-1:0),y,1,20,V.o);});
}
R(x-4,y+20,21,3,PI_X.c);R(x-4,y+20,21,1,PI_X.e);R(x-3,y+23,19,1,'rgba(40,25,10,.3)');
}
function balconM(R,x,y,w){
R(x,y,w,3,PI_X.p);R(x,y,w,1,PI_X.e);R(x+1,y+3,w-2,2,'rgba(40,25,10,.35)');
R(x,y-11,w,1,'#1f2224');R(x,y-1,w,1,'#1f2224');
for(let k=0;k<w;k+=3)R(x+k,y-11,1,11,'#2a2e30');
for(let k=1;k<w-2;k+=6){R(x+k,y-7,3,1,'#2a2e30');R(x+k+1,y-8,1,3,'#2a2e30');}
}
function toitCanal(R,cx,bas,larg,haut){
/* LE TOIT MANSARDÉ EN ZINC : un brisis raide, un terrasson plat, des joints debout */
const brisis=Math.round(haut*0.62), terr=haut-brisis;
/* le brisis : presque vertical, il s'affine à peine */
for(let i=0;i<brisis;i++){
  const t=i/brisis, y=bas-i, retrait=Math.round(t*5);
  const x0=cx-larg/2-8+retrait, l2=larg+16-retrait*2;
  const c=t<0.2?TU_M.s:(t<0.55?TU_M.p:(t<0.85?TU_M.c:TU_M.h));
  R(x0,y,l2,1,c);}
/* les joints debout du brisis */
for(let x=cx-larg/2-6;x<cx+larg/2+8;x+=11){
  R(x,bas-brisis,2,brisis,TU_M.o);R(x+2,bas-brisis,1,brisis,TU_M.h);}
/* le terrasson : la pente douce du haut */
for(let i=0;i<terr;i++){
  const t=i/terr, y=bas-brisis-i, retrait=Math.round(5+t*14);
  const x0=cx-larg/2-8+retrait, l2=larg+16-retrait*2;
  R(x0,y,l2,1,t<0.5?TU_M.s:TU_M.o);}
/* la corniche de zinc, et le chéneau */
R(cx-larg/2-11,bas-2,larg+22,4,TU_M.o);R(cx-larg/2-11,bas-2,larg+22,1,TU_M.faite);
R(cx-larg/2-9,bas+2,larg+18,2,'rgba(30,36,42,.35)');
/* les lucarnes du brisis */
[-1,1].forEach(s2=>{const lx=cx+s2*(larg*0.26)-9;
  R(lx,bas-brisis+4,18,16,TU_M.s);R(lx,bas-brisis+4,18,2,TU_M.h);
  R(lx+3,bas-brisis+8,12,11,'#2b3038');R(lx+4,bas-brisis+9,10,9,'#8fc4d4');
  R(lx+4,bas-brisis+9,10,3,'#b3dce8');
  R(lx-2,bas-brisis+2,22,3,TU_M.o);});
/* deux souches de cheminée en brique, coiffées de zinc */
[-1,1].forEach(s2=>{const hx=cx+s2*(larg*0.42)-4;
  R(hx,bas-brisis-10,9,14,'#8a5a42');R(hx,bas-brisis-10,9,2,'#a8725a');
  R(hx-2,bas-brisis-13,13,4,TU_M.p);
  R(hx+1,bas-brisis-16,3,4,'#5a5f66');R(hx+5,bas-brisis-16,3,4,'#5a5f66');});
}

function graverImmeuble(v){
const W=182,Ht=312,cx=W/2,sol=Ht-8;   /* Paris : quatre étages, façades jointives */
const c=document.createElement('canvas');
const D=Math.max(1,Math.min(2,Math.floor(window.devicePixelRatio||1)));
c.width=W*D;c.height=Ht*D;
const g=c.getContext('2d');g.setTransform(D,0,0,D,0,0);g.imageSmoothingEnabled=false;
const R=(x,y,w,h,col)=>{g.fillStyle=col;g.fillRect(x|0,y|0,Math.max(1,w|0),Math.max(1,h|0));};
const E=ENDUITS[v%4], V=VOLETS[(v*3+1)%4];
const BL=182, x0=0, rez=40, etage=34, ETAGES=4, murH=rez+etage*ETAGES+8, basToit=sol-murH;
g.fillStyle='rgba(40,30,18,.18)';g.fillRect(2,sol+1,W-4,5);
toitCanal(R,cx,basToit,BL-14,30);
[[x0+22,-24],[x0+BL-30,-18]].forEach(([x,dy])=>{R(x,basToit+dy-10,9,12,PI_X.p);R(x,basToit+dy-10,9,2,PI_X.e);
R(x-1,basToit+dy-12,11,3,PI_X.s);R(x+2,basToit+dy-14,2,3,'#6e2c16');R(x+5,basToit+dy-14,2,3,'#6e2c16');});
for(let r=0;r<3;r++){const y=basToit+3+r*3,ret=r*2;
for(let x=x0-4+ret;x<x0+BL+4-ret;x+=4){R(x,y,3,3,r%2?TU_M.s:TU_M.c);R(x,y,3,1,TU_M.h);}}
enduit(R,x0,basToit+12,BL,murH-12,E,v*17+3);
R(x0,basToit+12,BL,3,'rgba(40,20,10,.28)');                    /* l'ombre sous la génoise */
chaine(R,x0,basToit+12,murH-rez-12,-1);chaine(R,x0+BL,basToit+12,murH-rez-12,1);
for(let n=0;n<ETAGES;n++){
const yF=basToit+20+n*etage;
R(x0,yF+etage-6,BL,4,PI_X.c);R(x0,yF+etage-6,BL,1,PI_X.e);R(x0,yF+etage-2,BL,1,'rgba(40,25,10,.25)');  /* le bandeau */
for(let k=0;k<5;k++){
const fx=x0+14+k*33;
const ferme=alea(v*9+n*4+k)<0.25;
fenetreM(R,g,fx,yF,E,V,ferme?'ferme':'ouvert');
if(!ferme&&n===1&&(k+v)%3===0)for(let f=0;f<12;f+=4){R(fx+f,yF+18,4,4,'#a55a3a');R(fx+f,yF+15,4,3,['#6fbf5a','#d9576b','#e8c06a'][f/4]);}
}
if(n===0||n===ETAGES-1){balconM(R,x0+10,yF+23,BL-20);}                     /* le balcon filant du premier */
if(n===2&&v%2===0){                                           /* du linge qui sèche entre deux fenêtres */
g.strokeStyle='rgba(60,60,60,.6)';g.lineWidth=.5;g.beginPath();g.moveTo(x0+34,yF+6);g.lineTo(x0+72,yF+6);g.stroke();
[['#f2efe4',38],['#6a9ad0',48],['#d9576b',58]].forEach(([col,lx])=>{R(x0+lx,yF+6,7,9,col);R(x0+lx,yF+6,7,1,'rgba(0,0,0,.15)');});
}
}
const yR=sol-rez;
for(let y=yR;y<sol;y+=6){const d=((y-yR)/6)%2?10:0;R(x0,y,BL,6,PI_X.p);R(x0,y,BL,1,PI_X.h);
for(let x=x0+d;x<x0+BL;x+=20)R(x,y,1,6,PI_X.s);}
R(x0-2,yR-2,BL+4,3,PI_X.c);R(x0-2,yR-2,BL+4,1,PI_X.e);
/* LE REZ-DE-CHAUSSÉE : UNE SEULE GRANDE DEVANTURE par immeuble.
   Soubassement de pierre, boiserie pleine largeur, vaste vitrine à meneaux,
   porte vitrée sur le côté, store rayé et enseigne lisible. */
const bois=[{o:'#14342a',p:'#1f5040',h:'#2f7058',ens:'#0e2a22'},
            {o:'#17283e',p:'#264566',h:'#3a6690',ens:'#101e30'},
            {o:'#3e1c1a',p:'#5e2e2a',h:'#84443e',ens:'#2c1412'},
            {o:'#3a2c14',p:'#584422',h:'#7c6034',ens:'#281e0e'},
            {o:'#2a1c34',p:'#42304e',h:'#5e4870',ens:'#1e1426'},
            {o:'#1a2e34',p:'#2a4a54',h:'#3e6a78',ens:'#122026'}][v%6];
/* le soubassement de pierre, sous la devanture */
for(let y=sol-10;y<sol;y+=6)for(let x=x0;x<x0+BL;x+=20){
  R(x,y,19,5,PI_X.c);R(x,y,19,1,PI_X.e);R(x+19,y,1,6,PI_X.o);}
/* la boiserie, pleine largeur */
const dy=yR+2, dh=sol-10-dy;
R(x0+2,dy,BL-4,dh,bois.o);
R(x0+2,dy,BL-4,3,bois.h);
/* les deux pilastres d'angle, cannelés */
[x0+2,x0+BL-14].forEach(px=>{
  R(px,dy,12,dh,bois.p);R(px,dy,12,2,bois.h);
  for(let k=0;k<3;k++)R(px+3+k*3,dy+18,1,dh-22,bois.o);
  R(px-1,dy+12,14,4,bois.h);R(px-1,dy+dh-6,14,4,bois.h);});
/* LE BANDEAU D'ENSEIGNE : haut, mouluré, lisible */
R(x0+2,dy,BL-4,20,bois.ens);
R(x0+4,dy+2,BL-8,16,bois.p);R(x0+5,dy+3,BL-10,14,bois.ens);
R(x0+4,dy+2,BL-8,1,bois.h);R(x0+4,dy+18,BL-8,2,bois.o);
g.font='700 9px Georgia,serif';g.textAlign='center';g.fillStyle='#d8bd78';
g.fillText('À  L O U E R',x0+BL/2,dy+14,BL-24);g.textAlign='left';
/* LE STORE, sur toute la largeur */
for(let k=0;k<Math.floor((BL-28)/11);k++){
  R(x0+14+k*11,dy+20,10,13,k%2?'#a8452f':'#f2ece0');
  R(x0+14+k*11,dy+31,10,4,k%2?'#8a3624':'#ddd6c4');}
R(x0+12,dy+19,BL-24,2,'#2a2018');
/* LA GRANDE VITRINE : elle occupe désormais toute la devanture */
const vy=dy+38, vh=dh-46, vx=x0+16, vw=BL-32;
R(vx-3,vy-3,vw+6,vh+6,bois.p);R(vx-3,vy-3,vw+6,2,bois.h);
R(vx,vy,vw,vh,'#161e24');
R(vx+3,vy+3,vw-6,vh-6,'#cfe2ea');
/* le reflet en diagonale */
for(let d=0;d<vh-6;d++)R(vx+3+Math.round(d*0.85),vy+3+d,14,1,'rgba(255,255,255,.26)');
for(let d=0;d<vh-6;d++)R(vx+22+Math.round(d*0.85),vy+3+d,5,1,'rgba(255,255,255,.18)');
R(vx+3,vy+3,vw-6,7,'#e8f2f6');
/* les meneaux */
for(let k=1;k<4;k++)R(vx+k*(vw/4)-1,vy,3,vh,'#161e24');
R(vx,vy+Math.round(vh*0.62),vw,3,'#161e24');
/* la barre de seuil en laiton */
R(vx-3,vy+vh+3,vw+6,3,'#8a6a20');R(vx-3,vy+vh+3,vw+6,1,'#c9a24a');
/* la marche de seuil */
R(x0+10,sol-12,BL-20,3,PI_X.h);R(x0+10,sol-12,BL-20,1,PI_X.e);
const sorte='fini';
if(false){
const noir={o:'#0e0e10',p:'#1c1c20',c:'#26262c',h:'#3a3a42'};
R(x0+6,yR+2,BL-12,rez-2,noir.o);R(x0+8,yR+4,BL-16,rez-6,noir.p);R(x0+8,yR+4,BL-16,1,noir.h);
R(x0+10,yR+5,BL-20,9,'#000000');R(x0+10,yR+13,BL-20,1,'#c9a24a');
g.font='700 8px Georgia,serif';g.textAlign='center';g.fillStyle='#e8c06a';g.fillText('MY design HAIR',cx-6,yR+12,BL-40);g.textAlign='left';
const vx=x0+12, vw=BL-50, vy=yR+16, vh=rez-18;
R(vx-1,vy-1,vw+2,vh+2,'#c9a24a');R(vx,vy,vw,vh,'#2a2e36');
R(vx+vw-30,vy+2,22,12,'#8fa3ab');R(vx+vw-29,vy+3,20,10,'#b9ccd4');
for(let k=0;k<6;k++){R(vx+vw-30+k*4.2,vy+1,2,1,'#fff6d0');}
R(vx+vw-26,vy+13,14,6,'#1a1a1a');R(vx+vw-27,vy+12,16,2,'#2a2a2a');R(vx+vw-20,vy+19,2,vh-20,'#b9c1c7');R(vx+vw-24,vy+vh-2,10,2,'#8f959b');
const hx=vx+16, hy=vy+2;
R(hx-5,hy+10,10,vh-10,'#141418');R(hx-5,hy+10,10,1,'#2a2a30');                /* le t-shirt noir */
R(hx-7,hy+12,14,4,'#c98a5a');R(hx-7,hy+12,14,1,'#e0a878');                     /* les bras croisés */
R(hx-2,hy+8,4,3,'#c98a5a');                                                    /* le cou */
g.fillStyle='#d8a070';g.beginPath();g.ellipse(hx,hy+4,4.2,5,0,0,Math.PI*2);g.fill();   /* le crâne */
R(hx-4,hy+5,1,2,'#c08858');R(hx+3,hy+5,1,2,'#c08858');                         /* les oreilles */
R(hx-2,hy+4,1,1,'#1b1b1b');R(hx+1,hy+4,1,1,'#1b1b1b');                         /* les yeux */
R(hx-3,hy+6,6,3,'#3a2a1c');R(hx-1,hy+7,2,1,'#b06a50');                         /* la barbe, le sourire */
g.fillStyle='rgba(255,255,255,.75)';g.beginPath();g.ellipse(hx-1.5,hy+1,1.6,1,0,0,Math.PI*2);g.fill();  /* le reflet sur le crâne */
g.fillStyle='rgba(220,235,245,.16)';g.beginPath();g.moveTo(vx+26,vy+vh);g.lineTo(vx+36,vy);g.lineTo(vx+42,vy);g.lineTo(vx+32,vy+vh);g.fill();
R(x0+BL-34,yR+16,18,rez-16,'#c9a24a');R(x0+BL-33,yR+17,16,rez-17,'#2a2e36');R(x0+BL-20,yR+28,1,6,'#e8c06a');
R(x0+BL-12,yR+4,5,26,'#f4f0e4');R(x0+BL-13,yR+3,7,2,'#c9a24a');R(x0+BL-13,yR+30,7,2,'#c9a24a');
}else if(sorte==='bar'){
devanture({o:'#1e3a2c',p:'#2c5440',c:'#346448',h:'#4a7a5c'},'BAR DE LA MARINE');
[x0+14,x0+BL-58].forEach(vx=>{R(vx+2,yR+rez-12,40,3,'#b9c1c7');
for(let k=0;k<9;k++)R(vx+4+k*4,yR+22+(k%2)*2,2,6,['#3a7a4a','#c9a24a','#8a2a2a','#e8e0c0'][k%4]);});
for(let r=0;r<4;r++)for(let k=0;k<BL-4;k+=8){R(x0+2+k,yR-4+r*3,4,3,r<2?'#c0392b':'#a93226');R(x0+6+k,yR-4+r*3,4,3,r<2?'#f4f0e4':'#dcd6c6');}
for(let k=0;k<BL-4;k+=8){R(x0+2+k,yR+8,4,2,'#c0392b');R(x0+6+k,yR+8,4,2,'#f4f0e4');}
R(x0+2,yR+10,BL-4,1,'rgba(40,20,10,.35)');
}else if(sorte==='savon'){
devanture({o:'#2a3a5a',p:'#3a5078',c:'#46608a',h:'#6a84ac'},'SAVONNERIE');
[x0+14,x0+BL-58].forEach(vx=>{for(let r=0;r<3;r++)for(let k=0;k<5-r;k++){
const sx=vx+6+k*7+r*3.5, sy=yR+rez-12-r*6;R(sx,sy,6,5,(k+r)%2?'#8a9a4a':'#e8dcae');R(sx,sy,6,1,'rgba(255,255,255,.35)');}});
}else if(sorte==='santons'){
devanture({o:'#5a2a2a',p:'#7a3a36',c:'#8a4640',h:'#a8605a'},'SANTONS');
[x0+14,x0+BL-58].forEach(vx=>{for(let r=0;r<2;r++){R(vx+2,yR+rez-10-r*9,40,2,'#8a6238');
for(let k=0;k<6;k++){const sx=vx+5+k*6,sy=yR+rez-17-r*9;R(sx,sy,3,6,['#c0392b','#2d6fb0','#e8c06a','#3f8a4a','#f2efe4'][(k+r)%5]);R(sx,sy-2,3,2,'#e0b48a');}}});

}
R(x0+BL-6,basToit+12,2,murH-12,'#8a867a');R(x0+BL-7,basToit+12,1,murH-12,'#b9b4a2');   /* la descente d'eau */
const n2=document.createElement('canvas');n2.width=W*D;n2.height=Ht*D;
const h2=n2.getContext('2d');h2.setTransform(D,0,0,D,0,0);
h2.fillStyle='rgba(16,20,44,.42)';h2.fillRect(x0-8,basToit-30,BL+16,murH+34);   /* le voile ne déborde pas du toit */
[[x0+22,-24],[x0+BL-30,-18]].forEach(([x,dy])=>h2.fillRect(x-1,basToit+dy-14,11,dy+16));
for(let n=0;n<ETAGES;n++){const yF=basToit+20+n*etage;
for(let k=0;k<4;k++){if(alea(v*9+n*4+k)<0.25||alea(v*5+n*7+k*3)<0.4)continue;
const fx=x0+16+k*31;h2.fillStyle='#ffd98a';h2.fillRect(fx+1,yF+1,11,18);h2.fillStyle='#fff0c0';h2.fillRect(fx+2,yF+2,4,7);
h2.fillStyle='rgba(120,70,20,.5)';h2.fillRect(fx+6,yF,1,20);}}
if(sorte!=='porte'){h2.fillStyle='#ffcf7a';[x0+15,x0+BL-57].forEach(vx=>h2.fillRect(vx,yR+19,42,rez-24));
const l=h2.createRadialGradient(cx,sol,4,cx,sol,60);l.addColorStop(0,'rgba(255,200,110,.45)');l.addColorStop(1,'rgba(255,200,110,0)');
h2.fillStyle=l;h2.fillRect(cx-60,sol-60,120,68);}
return {toile:c,W,H:Ht,sol,nuit:n2};
}

/* ================= LES PLATANES ================= */
function grille(x,y,r){
  P(x-r-2,y-r*0.66-2,r*2+4,r*1.32+4,'#4a5058');P(x-r-2,y-r*0.66-2,r*2+4,2,'#6a7078');
  P(x-r,y-r*0.66,r*2,r*1.32,'#2b3036');
  for(let i=-r+4;i<r-2;i+=5)P(x+i,y-r*0.66+2,3,r*1.32-4,'#3f454c');
  for(let j=-r*0.66+4;j<r*0.66-2;j+=5)P(x-r+2,y+j,r*2-4,3,'#3f454c');
  P(x-4,y-3,8,6,'#5a4a2e');}
/* ===== LE HOUPPIER ROND : des disques qui se chevauchent, pas des étages ===== */
function masse(cx,cy,rx,ry,tons,graine){
  for(let y=-ry;y<=ry;y++){
    const dx=Math.round(rx*Math.sqrt(Math.max(0,1-(y/ry)*(y/ry))));
    /* le bord ondule : c'est ce qui casse la forme géométrique */
    const on=Math.round((al(graine+y*0.7)-0.5)*6);
    for(let x=-dx+on;x<=dx+on;x++){
      const d=Math.sqrt((x/rx)*(x/rx)+(y/ry)*(y/ry));
      const n=al(graine+x*0.31+y*0.57);
      let t;
      if(d>0.86)t=0;                 /* le bord, sombre */
      else if(y<-ry*0.2&&d<0.7)t=n<.4?3:2;   /* le dessus, éclairé */
      else t=n<.3?0:(n<.62?1:2);
      P(cx+x,cy+y,1,1,tons[t]);}}}
function trouees(cx,cy,rx,ry,n,graine,col){
  for(let i=0;i<n;i++){const a=al(graine+i*3)*6.283,r=Math.sqrt(al(graine+i*7));
    const x=cx+Math.cos(a)*r*rx*0.8,y=cy+Math.sin(a)*r*ry*0.8;
    P(x,y,3+al(i)*3,2+al(i*3)*2,col);}}
function tronc(x,y,h,lg,c1,c2,tex){
  for(let k=0;k<3;k++)P(x-h*0.44+k*4,y+3+k*2,h*0.88-k*8,3,'rgba(50,56,40,'+(0.15-k*0.04)+')');
  grille(x,y,Math.round(lg*1.6));
  for(let yy=0;yy<h;yy++){const k=yy/h;
    const w=lg*(1+0.22*(1-k));   /* le tronc s'évase au pied */
    P(x-w/2,y-h+yy,w,1,'rgb('+(c1[0]+(c2[0]-c1[0])*k|0)+','+(c1[1]+(c2[1]-c1[1])*k|0)+','+(c1[2]+(c2[2]-c1[2])*k|0)+')');}
  if(tex)tex(x,y,h,lg);}
/* 1 · PLATANE : une grosse masse ronde, deux bosses latérales */
function platane(x,y,e){ e=e||1;
  tronc(x,y,50*e,14*e,[200,190,166],[176,168,148],(x,y,h,lg)=>{
    for(let i=0;i<34;i++){const px=x-lg/2+al(i*3)*lg,py=y-h+2+al(i*7)*(h-6);
      const n=al(i*5);P(px,py,4,5,n<.38?'#8a9a72':(n<.7?'#c2bca0':'#6f7d5c'));}
    P(x-lg/2,y-h,3,h,'#e2dcc4');
    P(x-lg/2-13,y-h+3,13,5,'#b0a888');P(x+lg/2,y-h+1,13,5,'#b0a888');});
  const T=['#2f5a2a','#3f6a34','#4e8140','#61a050'];
  masse(x-26*e,y-82*e,30*e,26*e,T,3.1);
  masse(x+27*e,y-78*e,29*e,25*e,T,7.7);
  masse(x,y-96*e,38*e,31*e,T,11.3);
  masse(x-10*e,y-62*e,34*e,24*e,T,17.9);
  masse(x+14*e,y-60*e,30*e,22*e,T,23.5);
  trouees(x,y-84*e,54*e,34*e,22,5.5,'#6fb058');
  trouees(x,y-84*e,52*e,32*e,10,9.5,'#274a22');}


/* on grave le platane sur sa propre toile, pour en faire un objet de décor */
function graverPlatane(v){
  const W=104,H=136,D=2,c=document.createElement('canvas');
  c.width=W*D;c.height=H*D;
  const g2=c.getContext('2d');g2.setTransform(D,0,0,D,0,0);g2.imageSmoothingEnabled=false;
  g=g2;P=(x,y,w,h,col)=>{g2.fillStyle=col;g2.fillRect(Math.round(x),Math.round(y),Math.max(1,Math.round(w)),Math.max(1,Math.round(h)));};
  platane(W/2,H-12,0.72);
  g=null;P=null;
  return {toile:c,W,H,sol:H-8,nuit:null};
}
/* ================= LE BANC ================= */
function graverBanc(){
  const W=72,H=46,D=2,c=document.createElement('canvas');
  c.width=W*D;c.height=H*D;
  const g2=c.getContext('2d');g2.setTransform(D,0,0,D,0,0);g2.imageSmoothingEnabled=false;
  const R=(x,y,w,h,col)=>{g2.fillStyle=col;g2.fillRect(x|0,y|0,Math.max(1,w|0),Math.max(1,h|0));};
  const y=H-10;
  R(4,y+6,64,4,'rgba(50,56,40,.18)');
  /* les pieds de fonte, à volutes */
  [6,54].forEach(px=>{R(px,y-2,10,12,'#3a3f46');R(px-2,y+8,14,4,'#4a5058');
    R(px-1,y-6,12,5,'#4a5058');R(px+3,y-14,4,10,'#3a3f46');});
  /* l'assise en lattes */
  for(let k=0;k<3;k++)R(4,y-4-k*5,64,4,k%2?'#8a6238':'#9a7146');
  /* le dossier */
  for(let k=0;k<4;k++)R(4,y-22-k*6,64,5,k%2?'#8a6238':'#9a7146');
  R(4,y-46+6,64,2,'#a5764a');
  /* les accoudoirs */
  [2,66].forEach(px=>{R(px,y-24,5,22,'#3a3f46');R(px-1,y-26,7,3,'#4a5058');});
  return {toile:c,W,H,sol:H-4,nuit:null};
}
/* ================= LE MOBILIER DU TROTTOIR ================= */
function surToile(W,H,peindre){
  const D=2,c=document.createElement('canvas');
  c.width=W*D;c.height=H*D;
  const g2=c.getContext('2d');g2.setTransform(D,0,0,D,0,0);g2.imageSmoothingEnabled=false;
  const R=(x,y,w,h,col)=>{g2.fillStyle=col;g2.fillRect(x|0,y|0,Math.max(1,w|0),Math.max(1,h|0));};
  peindre(R,g2,W,H);
  return {toile:c,W,H,sol:H-4,nuit:null};
}
/* le lampadaire de fonte, à deux lanternes */
function graverLampadaire(){
  return surToile(46,104,(R,g2,W,H)=>{
    const x=W/2,y=H-8;
    R(x-11,y+2,22,4,'rgba(50,56,40,.2)');
    /* la base moulurée */
    R(x-10,y-8,20,10,'#3a3f46');R(x-10,y-8,20,2,'#5a6068');
    R(x-7,y-16,14,9,'#434950');R(x-5,y-22,10,7,'#3a3f46');
    /* le fût, cannelé */
    for(let yy=0;yy<52;yy++){const w=7-yy*0.02;
      R(x-w/2,y-22-yy,w,1,yy%11<1?'#5a6068':'#3f454c');}
    R(x-3,y-74,2,52,'#555b63');
    /* la couronne et ses deux potences */
    R(x-9,y-82,18,6,'#434950');R(x-9,y-82,18,2,'#5f666e');
    [-1,1].forEach(s2=>{
      for(let k=0;k<9;k++)R(x+s2*(4+k),y-82-Math.round(Math.sin(k/9*1.5)*5),3,3,'#434950');
      const lx=x+s2*14;
      R(lx-6,y-94,13,12,'#3a3f46');R(lx-5,y-93,11,9,'#f6e6a8');
      R(lx-5,y-93,11,3,'#fffbe0');R(lx-7,y-97,15,4,'#434950');
      R(lx-2,y-100,4,4,'#3a3f46');});
    /* la lanterne centrale, plus haute */
    R(x-8,y-104,16,14,'#3a3f46');R(x-7,y-103,14,11,'#f6e6a8');
    R(x-7,y-103,14,3,'#fffbe0');R(x-9,y-109,18,5,'#434950');
    R(x-3,y-113,6,5,'#3a3f46');});
}
/* la colonne Morris, pour les affiches */
function graverColonne(){
  return surToile(56,140,(R,g2,W,H)=>{
    const x=W/2,y=H-8;
    R(x-16,y+2,32,4,'rgba(50,56,40,.2)');
    R(x-16,y-10,32,12,'#2f3a34');R(x-16,y-10,32,2,'#45544c');
    /* le fût couvert d'affiches */
    const aff=['#b4302c','#1d5b7a','#c9a24a','#2f6a4a','#8a4a8a'];
    for(let yy=0;yy<86;yy++){
      const w=26-yy*0.02;
      R(x-w/2,y-10-yy,w,1,'#243028');}
    for(let k=0;k<4;k++){const ay=y-24-k*20;
      R(x-11,ay-16,22,17,aff[k%5]);R(x-11,ay-16,22,3,'rgba(255,255,255,.25)');
      for(let l=0;l<3;l++)R(x-8,ay-11+l*4,16-l*3,2,'rgba(255,255,255,.35)');}
    R(x-13,y-98,26,5,'#2f3a34');
    /* le dôme vert et sa pointe */
    for(let i=0;i<9;i++){const w=28-i*3;R(x-w/2,y-104-i*3,w,4,i%2?'#2f5a3a':'#3f7a52');}
    R(x-2,y-134,4,8,'#c9a24a');R(x-4,y-138,8,5,'#e0bc68');});
}
/* la bouche d'incendie et la corbeille, menu fretin utile */
function graverCorbeille(){
  return surToile(30,50,(R,g2,W,H)=>{
    const x=W/2,y=H-6;
    R(x-9,y+1,18,3,'rgba(50,56,40,.2)');
    R(x-3,y-16,6,16,'#3a3f46');R(x-8,y-20,16,5,'#434950');
    for(let yy=0;yy<22;yy++)R(x-9,y-42+yy,18,1,yy%5<1?'#5a6068':'#414850');
    R(x-10,y-44,20,4,'#5a6068');R(x-10,y-44,20,1,'#767e88');});
}
/* ================= LES VOITURES ================= */
const MODELES=[
 {nom:'La citadine',   corps:'#b4302c',sombre:'#8e211e',clair:'#d05a52',L:74, l:38},
 {nom:'La berline',    corps:'#1d3f66',sombre:'#132c49',clair:'#2f5f8a',L:96, l:42},
 {nom:'La décapotable',corps:'#c9a24a',sombre:'#9e7c2c',clair:'#e0bc68',L:88, l:40,toit:'#2b2118'},
 {nom:'La familiale',  corps:'#2f6a4a',sombre:'#215034',clair:'#3f8a62',L:104,l:44},
 {nom:'Le taxi',       corps:'#f0d78a',sombre:'#c4aa58',clair:'#f8e8b4',L:92, l:42,toitOuvrant:1},
 {nom:'La sportive',   corps:'#e8e4dc',sombre:'#b8b4ac',clair:'#ffffff',L:86, l:36,bande:'#b4302c'}];
/* la carrosserie, vue du dessus, tournée vers la droite */
function graverVoiture(n){
  const o=MODELES[n%MODELES.length];
  const W=o.L+22,H=o.l+22,D=2,c=document.createElement('canvas');
  c.width=W*D;c.height=H*D;
  const g2=c.getContext('2d');g2.setTransform(D,0,0,D,0,0);g2.imageSmoothingEnabled=false;
  const R=(x,y,w,h,col)=>{if(w<=0||h<=0)return;g2.fillStyle=col;g2.fillRect(x|0,y|0,Math.max(1,w|0),Math.max(1,h|0));};
  const x=W/2,y=H/2,L=o.L,l=o.l;
  R(x-L/2+3,y-l/2+4,L,l,'rgba(20,24,28,.26)');
  [[-L*0.3,-1],[-L*0.3,1],[L*0.28,-1],[L*0.28,1]].forEach(([dx,s2])=>{
    R(x+dx-7,y+s2*(l/2)-4,15,7,'#1b1e22');R(x+dx-6,y+s2*(l/2)-3,13,2,'#2e3338');});
  for(let i=0;i<l;i++){const t=Math.abs(i-l/2)/(l/2);
    R(x-L/2,y-l/2+i,L,1,t<0.25?o.clair:(t<0.62?o.corps:o.sombre));}
  for(let i=0;i<5;i++){
    R(x-L/2+i,y-l/2+(5-i),1,l-(5-i)*2,o.corps);
    R(x+L/2-i-1,y-l/2+(4-i),1,l-(4-i)*2,o.corps);}
  R(x-L*0.12,y-l/2+3,L*0.2,l-6,'#2b3038');
  R(x-L*0.11,y-l/2+4,L*0.18,l-8,'#8fc4d4');R(x-L*0.11,y-l/2+4,L*0.18,3,'#b3dce8');
  R(x+L*0.2,y-l/2+3,L*0.13,l-6,'#2b3038');R(x+L*0.21,y-l/2+4,L*0.11,l-8,'#7fb4c8');
  R(x-L*0.1,y-l/2+3,L*0.3,l-6,o.toit||o.clair);
  R(x-L*0.1,y-2,L*0.3,1,'rgba(255,255,255,.18)');
  R(x-L*0.08,y-l/2+2,L*0.26,2,'#5f7a88');R(x-L*0.08,y+l/2-4,L*0.26,2,'#5f7a88');
  for(let k=0;k<2;k++)R(x-L*0.46,y-6+k*11,L*0.3,1,'rgba(255,255,255,.12)');
  R(x-L/2+1,y-l/2+3,4,5,'#f6f0c8');R(x-L/2+1,y+l/2-8,4,5,'#f6f0c8');
  R(x+L/2-4,y-l/2+3,3,5,'#c03a2a');R(x+L/2-4,y+l/2-8,3,5,'#c03a2a');
  R(x-L*0.06,y-l/2-2,4,3,o.sombre);R(x-L*0.06,y+l/2-1,4,3,o.sombre);
  R(x-L/2,y-l/2+9,3,l-18,o.sombre);R(x+L/2-2,y-l/2+8,2,l-16,'#9aa0a8');
  if(o.bande)R(x-L/2+6,y-2,L-12,4,o.bande);
  if(o.toitOuvrant){R(x-L*0.02,y-5,L*0.12,10,'#1b2228');R(x-L*0.01,y-4,L*0.1,8,'#3a4a54');}
  return {toile:c,W,H,sol:H-4,nuit:null,nom:o.nom,L:o.L,l:o.l};
}
/* ================= L'ÉPICERIE FINE =================
   Une devanture bleu nuit : bandeau émaillé à lettres blanches, vitrine à
   trois travées avec ses étagères garnies, soubassement de carreaux blancs,
   et deux lanternes en col de cygne. */
function graverEpicerie(){
  const W=182,H=160,D=2,c=document.createElement('canvas');
  c.width=W*D;c.height=H*D;
  const g2=c.getContext('2d');g2.setTransform(D,0,0,D,0,0);g2.imageSmoothingEnabled=false;
  const R=(x,y,w,h,col)=>{if(w<=0||h<=0)return;g2.fillStyle=col;g2.fillRect(x|0,y|0,Math.max(1,w|0),Math.max(1,h|0));};
  const hs=n=>{const v=Math.sin(n*12.9898)*43758.5453;return v-Math.floor(v);};
  const dy=6,dh=H-12,bas=dy+dh;
  R(4,dy,W-8,dh,'#17283e');R(4,dy,W-8,3,'#3a6690');
  /* le bandeau émaillé */
  R(6,dy+2,W-12,30,'#101e30');R(8,dy+4,W-16,26,'#1d3f66');R(8,dy+4,W-16,1,'#4f7ba8');
  g2.font='700 14px Georgia,serif';g2.textAlign='center';g2.fillStyle='#f2f8fc';
  g2.fillText('ÉPICERIE FINE',W/2,dy+23);g2.textAlign='left';
  for(let k=0;k<Math.floor((W-16)/10);k++)R(10+k*10,dy+29,8,1,'rgba(160,200,230,.4)');
  /* le carrelage du soubassement */
  for(let y=bas-40;y<bas;y+=10)for(let x=8;x<W-8;x+=13){
    const n=hs(x*0.4+y*0.3);
    R(x,y,12,9,n<.3?'#dce8ee':(n<.6?'#cfe0e8':'#e8f2f6'));R(x,y,12,1,'#f2f8fa');}
  /* la vitrine et ses étagères */
  const vy=dy+38,vh=bas-40-vy,vx=16,vw=W-32;
  R(vx-4,vy-4,vw+8,vh+8,'#264566');R(vx-4,vy-4,vw+8,2,'#4f7ba8');
  R(vx,vy,vw,vh,'#0e1518');R(vx+3,vy+3,vw-6,vh-6,'#cfe2ea');
  for(let d=0;d<vh-6;d++)R(vx+3+Math.round(d*0.85),vy+3+d,13,1,'rgba(255,255,255,.28)');
  for(let k=1;k<3;k++)R(vx+k*(vw/3)-1,vy,3,vh,'#0e1518');
  for(let r=0;r<3;r++){const y=vy+14+r*((vh-18)/3);
    R(vx+5,y+12,vw-10,3,'#6a4a2a');
    for(let f=0;f<7;f++){const px=vx+8+f*((vw-18)/7);
      R(px,y,11,12,['#8a2f22','#c9a24a','#2f6a4a','#a8452f'][(f+r)%4]);
      R(px,y,11,3,'rgba(255,255,255,.35)');}}
  /* les deux lanternes en col de cygne */
  [12,W-18].forEach(x=>{const s2=(x<W/2)?1:-1;
    for(let k=0;k<6;k++)R(x+s2*k*2,dy+34-Math.round(Math.sin(k/6*1.5)*5),3,3,'#2b3138');
    R(x+(s2>0?10:-16),dy+38,12,9,'#2b3138');R(x+(s2>0?11:-15),dy+39,10,6,'#f6e6a8');});
  return {toile:c,W,H,sol:H-4,nuit:null};
}
return {graverImmeuble,graverPlatane,graverBanc,graverLampadaire,graverColonne,graverCorbeille,
        graverVoiture,MODELES,graverEpicerie};
})()
