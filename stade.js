/* =====================================================================
   LE STADE DU VIEUX-PORT (chargé par jeu.html seulement quand on y est).
   Un stade immense : la pelouse tondue en bandes, les lignes, les buts et leurs filets, la piste,
   les tribunes pleines de supporters tout autour (bleu et blanc), les projecteurs.
   Un BALLON au milieu : on le pousse en marchant dedans, il roule, et s'il entre dans un but… BUT !
   La foule fait la ola.
   ===================================================================== */
(()=>{
const WW=760, WH=1080;
const hs=(i)=>{const s=Math.sin(i*127.1+311.7)*43758.5453;return s-Math.floor(s);};
const mk=(w,h)=>{const c=document.createElement('canvas');c.width=w*2;c.height=h*2;const g=c.getContext('2d');g.setTransform(2,0,0,2,0,0);g.imageSmoothingEnabled=false;
  const F=(x,y,ww,hh,col)=>{if(ww<=0||hh<=0)return;g.fillStyle=col;g.fillRect(x,y,ww,hh);};return {c,g,F};};
/* ---------- LE PLAN ---------- */
const TRIB=120;                                            /* l'épaisseur des tribunes */
const PISTE={x0:TRIB,x1:WW-TRIB,y0:TRIB,y1:WH-TRIB-40};    /* la piste qui entoure la pelouse */
const TERRAIN={x0:TRIB+36,x1:WW-TRIB-36,y0:TRIB+40,y1:WH-TRIB-80};
const CX=(TERRAIN.x0+TERRAIN.x1)/2, CY=(TERRAIN.y0+TERRAIN.y1)/2;
const BUT_L=64;                                            /* la largeur des buts */
const TUNNEL={x0:CX-40,x1:CX+40,y0:WH-TRIB-40,y1:WH};      /* le tunnel d'entrée, au sud */
const ARRIVEE=[CX,WH-60], SORTIE=[CX,WH-20];
const COUL=['#2a9ad8','#ffffff','#1d4f8a','#2a9ad8','#ffffff'];
/* ---------- LE SOL ---------- */
function sol(){
  const {c,g,F}=mk(WW,WH);
  /* les tribunes : des gradins, et une foule dense, bleue et blanche */
  F(0,0,WW,WH,'#3a3f4a');
  const gradins=(x0,y0,x1,y1,horiz)=>{for(let k=0;k<(horiz?(y1-y0):(x1-x0));k+=6){
      if(horiz)F(x0,y0+k,x1-x0,6,k%12?'#4a505c':'#545a66');else F(x0+k,y0,6,y1-y0,k%12?'#4a505c':'#545a66');}
    for(let y=y0+2;y<y1-2;y+=5)for(let x=x0+2;x<x1-2;x+=4){const r=hs(x*7.1+y*3.3);if(r<0.08)continue;
      const col=r<0.55?COUL[Math.floor(hs(x+y*13)*5)]:['#e8c49a','#c08a58','#7d4e2a','#f0d0ae'][Math.floor(r*40)%4];
      F(x,y,3,3,col);F(x+0.5,y-1,2,1.2,['#1c140d','#4a3220','#8a5f30','#2a2a2a'][Math.floor(r*97)%4]);}};
  gradins(0,0,WW,TRIB,true);gradins(0,WH-TRIB-40,TUNNEL.x0,WH,true);gradins(TUNNEL.x1,WH-TRIB-40,WW,WH,true);
  gradins(0,TRIB,TRIB,WH-TRIB-40,false);gradins(WW-TRIB,TRIB,WW,WH-TRIB-40,false);
  /* les grandes banderoles de supporters */
  const banderole=(x,y,w,t,col)=>{F(x,y,w,12,col);g.font='900 8px "Trebuchet MS",sans-serif';g.textAlign='center';g.fillStyle=col==='#ffffff'?'#1d4f8a':'#ffffff';g.fillText(t,x+w/2,y+9);g.textAlign='left';};
  banderole(120,40,200,'ALLEZ LE PORT !','#2a9ad8');banderole(440,60,200,'DROIT AU BUT','#ffffff');banderole(40,WH-120,150,'LES DOCKERS','#1d4f8a');banderole(WW-190,WH-120,150,'FIERS !','#2a9ad8');
  /* la piste d'athlétisme, rouge brique, ses couloirs */
  F(PISTE.x0,PISTE.y0,PISTE.x1-PISTE.x0,PISTE.y1-PISTE.y0,'#b8503a');
  for(let k=6;k<34;k+=7){g.strokeStyle='rgba(255,255,255,.5)';g.lineWidth=0.6;g.strokeRect(PISTE.x0+k,PISTE.y0+k,PISTE.x1-PISTE.x0-2*k,PISTE.y1-PISTE.y0-2*k);}
  /* la pelouse, tondue en bandes */
  F(TERRAIN.x0-6,TERRAIN.y0-6,TERRAIN.x1-TERRAIN.x0+12,TERRAIN.y1-TERRAIN.y0+12,'#3a8a3a');
  for(let y=TERRAIN.y0;y<TERRAIN.y1;y+=40)F(TERRAIN.x0,y,TERRAIN.x1-TERRAIN.x0,20,'#47a047');
  g.fillStyle='rgba(0,0,0,.06)';for(let k=0;k<900;k++){const x=TERRAIN.x0+hs(k)*(TERRAIN.x1-TERRAIN.x0), y=TERRAIN.y0+hs(k*5)*(TERRAIN.y1-TERRAIN.y0);g.fillRect(x,y,1,2);}
  /* les lignes */
  g.strokeStyle='#f4f8f4';g.lineWidth=2;g.strokeRect(TERRAIN.x0,TERRAIN.y0,TERRAIN.x1-TERRAIN.x0,TERRAIN.y1-TERRAIN.y0);
  g.beginPath();g.moveTo(TERRAIN.x0,CY);g.lineTo(TERRAIN.x1,CY);g.stroke();g.beginPath();g.arc(CX,CY,56,0,7);g.stroke();g.fillStyle='#f4f8f4';g.beginPath();g.arc(CX,CY,2.5,0,7);g.fill();
  [[TERRAIN.y0,1],[TERRAIN.y1,-1]].forEach(([y,s])=>{g.strokeRect(CX-110,s>0?y:y-100,220,100);g.strokeRect(CX-50,s>0?y:y-36,100,36);
    g.beginPath();g.arc(CX,y+s*72,3,0,7);g.fill();g.beginPath();g.arc(CX,y+s*72,56,s>0?0.72:Math.PI+0.72,s>0?Math.PI-0.72:2*Math.PI-0.72);g.stroke();});
  /* le tunnel d'entrée */
  F(TUNNEL.x0,TUNNEL.y0,TUNNEL.x1-TUNNEL.x0,TUNNEL.y1-TUNNEL.y0,'#2a2e36');for(let y=TUNNEL.y0;y<WH;y+=8)F(TUNNEL.x0+4,y,TUNNEL.x1-TUNNEL.x0-8,1,'#3a3f4a');
  g.font='700 7px "Trebuchet MS"';g.textAlign='center';g.fillStyle='#f4f4f4';g.fillText('SORTIE · LE QUAI',CX,WH-6);g.textAlign='left';
  return c;}
let SOL_M=null;
/* ---------- LES OBJETS ---------- */
function graverBut(haut){const W=BUT_L+10,H=34,{c,g,F}=mk(W,H);const sol=H-3;
  g.fillStyle='rgba(0,0,0,.18)';g.fillRect(4,sol-2,W-8,3);
  g.strokeStyle='rgba(255,255,255,.55)';g.lineWidth=0.5;for(let x=5;x<W-5;x+=3){g.beginPath();g.moveTo(x,sol-26);g.lineTo(x+(haut?0:0),sol-(haut?10:4));g.stroke();}
  for(let y=sol-26;y<sol-4;y+=3){g.beginPath();g.moveTo(5,y);g.lineTo(W-5,y);g.stroke();}
  F(4,sol-28,W-8,2.5,'#ffffff');F(4,sol-28,2.5,26,'#ffffff');F(W-6.5,sol-28,2.5,26,'#ffffff');return {c,W,H,sol};}
function graverProjecteur(){const W=40,H=90,{c,g,F}=mk(W,H);const sol=H-2, cx=W/2;F(cx-1.5,sol-70,3,70,'#8a8f96');
  F(cx-16,sol-88,32,18,'#3a3f4a');for(let r=0;r<3;r++)for(let k=0;k<5;k++){F(cx-14+k*6,sol-86+r*6,4,4,'#fffbe0');}return {c,W,H,sol};}
function graverBanc(){const W=70,H=26,{c,g,F}=mk(W,H);const sol=H-3;F(3,sol-18,64,18,'rgba(200,230,255,.35)');F(3,sol-18,64,1.5,'#c8ccd2');
  for(let k=0;k<6;k++)F(6+k*10,sol-9,8,7,'#2a9ad8');F(3,sol-2,64,2,'#8a8f96');return {c,W,H,sol};}
function graverDrapeau(){const W=12,H=26,{c,g,F}=mk(W,H);const sol=H-2;F(2,sol-22,1.2,22,'#f4f4f4');g.fillStyle='#f0c040';g.beginPath();g.moveTo(3.2,sol-22);g.lineTo(11,sol-19);g.lineTo(3.2,sol-16);g.fill();return {c,W,H,sol};}
function objets(){const cal={}, L=[];const reg=(nom,J)=>{cal[nom]={toile:J.c,W:J.W,H:J.H,sol:J.sol,nuit:null};};
  reg('butH',graverBut(true));reg('butB',graverBut(false));
  L.push({t:'x_mo_butH',x:CX,y:TERRAIN.y0+2,v:0});L.push({t:'x_mo_butB',x:CX,y:TERRAIN.y1+30,v:0});
  reg('proj',graverProjecteur());[[40,110],[WW-40,110],[40,WH-160],[WW-40,WH-160]].forEach(([x,y])=>L.push({t:'x_mo_proj',x,y,v:0,col:[4,3]}));
  reg('banc',graverBanc());[[TRIB+14,CY-60],[TRIB+14,CY+60]].forEach(([x,y])=>L.push({t:'x_mo_banc',x:x+22,y,v:0,col:[30,4]}));
  reg('drap',graverDrapeau());[[TERRAIN.x0,TERRAIN.y0],[TERRAIN.x1,TERRAIN.y0],[TERRAIN.x0,TERRAIN.y1],[TERRAIN.x1,TERRAIN.y1]].forEach(([x,y])=>L.push({t:'x_mo_drap',x,y,v:0}));
  L.push({t:'x_mo_sortie',x:SORTIE[0],y:SORTIE[1],v:0,bati:true,demi:40,ouvre:'sortieStade'});cal.sortie={toile:document.createElement('canvas'),W:1,H:1,sol:0,nuit:null};
  return {L,cal};}
/* ---------- LE BALLON ---------- */
const BALLON={x:CX,y:CY,vx:0,vy:0,rot:0};let BUT=0, OLA=0, tPrec=0;
function ballon(g,camX,camY,t){
  const dt=Math.min(0.05,Math.max(0,t-(tPrec||t)));tPrec=t;
  /* le joueur le pousse : un contact, et le ballon part dans le sens de la marche */
  try{const dx=BALLON.x-joueur.x, dy=BALLON.y-(joueur.y-3), d=Math.hypot(dx,dy);
    if(d<9&&d>0.01){const f=joueur.marche?190:60;BALLON.vx=dx/d*f;BALLON.vy=dy/d*f;BALLON.x=joueur.x+dx/d*9.5;BALLON.y=joueur.y-3+dy/d*9.5;}}catch(err){}
  const v=Math.hypot(BALLON.vx,BALLON.vy);if(v>1){const k=Math.max(0,v-140*dt)/v;BALLON.vx*=k;BALLON.vy*=k;}else{BALLON.vx=0;BALLON.vy=0;}
  BALLON.x+=BALLON.vx*dt;BALLON.y+=BALLON.vy*dt;BALLON.rot+=v*dt*0.2;
  /* les buts : si le ballon franchit la ligne entre les poteaux */
  const dansBut=Math.abs(BALLON.x-CX)<BUT_L/2-4;
  if(dansBut&&(BALLON.y<TERRAIN.y0-2||BALLON.y>TERRAIN.y1+2)&&t-BUT>3){BUT=t;OLA=t;try{texteVolant(joueur.x,joueur.y-60,'BUUUUUT !!!','#ffe070');vibrer([40,60,40,60,120]);jouer('vente','moment');}catch(err){}}
  if(t-BUT>2.2&&BUT&&(BALLON.y<TERRAIN.y0-4||BALLON.y>TERRAIN.y1+4)){BALLON.x=CX;BALLON.y=CY;BALLON.vx=BALLON.vy=0;BUT=0;}     /* engagement */
  /* les rebords : la pelouse est bordée (hors des buts) */
  if(BALLON.x<TERRAIN.x0-24){BALLON.x=TERRAIN.x0-24;BALLON.vx=Math.abs(BALLON.vx)*0.6;}if(BALLON.x>TERRAIN.x1+24){BALLON.x=TERRAIN.x1+24;BALLON.vx=-Math.abs(BALLON.vx)*0.6;}
  if(!dansBut){if(BALLON.y<TERRAIN.y0-24){BALLON.y=TERRAIN.y0-24;BALLON.vy=Math.abs(BALLON.vy)*0.6;}if(BALLON.y>TERRAIN.y1+24){BALLON.y=TERRAIN.y1+24;BALLON.vy=-Math.abs(BALLON.vy)*0.6;}}
  else{if(BALLON.y<TERRAIN.y0-22){BALLON.y=TERRAIN.y0-22;BALLON.vy=0;}if(BALLON.y>TERRAIN.y1+22){BALLON.y=TERRAIN.y1+22;BALLON.vy=0;}}
  const x=BALLON.x-camX, y=BALLON.y-camY;
  g.fillStyle='rgba(0,0,0,.25)';g.beginPath();g.ellipse(x+1,y+2.5,4,1.5,0,0,7);g.fill();
  g.fillStyle='#ffffff';g.beginPath();g.arc(x,y,3.4,0,7);g.fill();g.fillStyle='#1a1a1a';
  for(let k=0;k<3;k++){const a=BALLON.rot+k*2.1;g.beginPath();g.arc(x+Math.cos(a)*1.7,y+Math.sin(a)*1.7,0.9,0,7);g.fill();}
}
/* ---------- LA FOULE VIVANTE : quelques drapeaux qui s'agitent, et la ola après un but ---------- */
function foule(g,camX,camY,t){
  const ola=t-OLA<6?((t-OLA)/6):-1;
  for(let k=0;k<26;k++){const side=k%4, u=hs(k*3.7);let x,y;
    if(side===0){x=40+u*(WW-80);y=20+hs(k)*80;}else if(side===1){x=40+u*(WW-80);y=WH-TRIB-30+hs(k)*120;}else if(side===2){x=20+hs(k)*90;y=TRIB+u*(WH-2*TRIB-60);}else{x=WW-110+hs(k)*90;y=TRIB+u*(WH-2*TRIB-60);}
    const sx=x-camX, sy=y-camY;if(sx<-20||sy<-30||sx>(g.canvas.width/(g.getTransform().a||1))+20||sy>(g.canvas.height/(g.getTransform().d||1))+20)continue;
    const w=Math.sin(t*6+k)*2.5;g.fillStyle='#8a8f96';g.fillRect(sx,sy-12,0.8,12);g.fillStyle=k%2?'#2a9ad8':'#ffffff';g.fillRect(sx+0.8,sy-12+w*0.3,8,5);}
  if(ola>=0){/* la ola : une bande claire qui fait le tour des tribunes */
    const per=2*(WW+WH), pos=ola*per;g.fillStyle='rgba(255,255,255,.28)';
    const bande=(x,y,w,h)=>g.fillRect(x-camX,y-camY,w,h);
    if(pos<WW)bande(pos-30,0,60,TRIB);else if(pos<WW+WH)bande(WW-TRIB,pos-WW-30,TRIB,60);else if(pos<2*WW+WH)bande(2*WW+WH-pos-30,WH-TRIB-40,60,TRIB+40);else bande(0,per-pos-30,TRIB,60);}
}
const zone=(x,y)=>{
  if(y>TUNNEL.y0-4&&x>TUNNEL.x0+6&&x<TUNNEL.x1-6)return y>WH-6;                               /* le tunnel */
  return x<PISTE.x0+2||x>PISTE.x1-2||y<PISTE.y0+2||y>PISTE.y1;};                                 /* les tribunes */
return {WW,WH,objets,solFin:()=>SOL_M||(SOL_M=sol()),zoneInterdite:zone,dansNeige:()=>false,surGlace:()=>false,
  dessinerPlace:(g,camX,camY,t)=>{foule(g,camX,camY,t);ballon(g,camX,camY,t);},dessinerTelepherique:()=>{},ARRIVEE,METRO:null};
})()
