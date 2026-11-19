/* =====================================================================
   LE MODE CONDUITE — LA CORNICHE, VUE DE DESSUS, VERSION POUSSÉE.
   Une vraie route côtière qui serpente : la mer à gauche, la falaise et
   la ville à droite ; des calanques, un tunnel ; trafic varié (taxis, bus,
   police, livreurs) ; roues qui tournent ; feux de freinage ; argent gagné
   au kilomètre, versé à la sortie. Volant d'un pouce, gaz/frein de l'autre.

   Autonome. window.ouvrirConduite() ouvre, le ✕ ferme. Aucun lien avec le
   reste du moteur.
   ===================================================================== */
(function(){
if(window.ouvrirConduite)return;

window.ouvrirConduite=function(opts){
 opts=opts||{};
 if(document.getElementById('condW'))return;

 /* ============== L'ÉCRAN ============== */
 const wrap=document.createElement('div');wrap.id='condW';
 wrap.style.cssText='position:fixed;inset:0;z-index:2147483200;background:#0c1622;overflow:hidden;touch-action:none;'+
   'font-family:"Helvetica Neue",Arial,sans-serif;opacity:0;transition:opacity .4s';
 const cv=document.createElement('canvas');cv.style.cssText='position:absolute;inset:0;width:100%;height:100%;display:block;touch-action:none';
 wrap.appendChild(cv);document.body.appendChild(wrap);
 const ctx=cv.getContext('2d');
 let DPR=Math.min(2,window.devicePixelRatio||1),VW=0,VH=0,SC=1;
 function taille(){VW=wrap.clientWidth;VH=wrap.clientHeight;cv.width=VW*DPR;cv.height=VH*DPR;ctx.setTransform(DPR,0,0,DPR,0,0);SC=Math.max(VW/420,VH/800);}
 taille();addEventListener('resize',taille);
 requestAnimationFrame(()=>wrap.style.opacity='1');

 /* ============== LA ROUTE QUI SERPENTE ============== */
 const ROUTE_DEMI=150, VOIE=ROUTE_DEMI/2;
 const BORD_MER=-ROUTE_DEMI-26, BORD_VILLE=ROUTE_DEMI+26;
 function axeRoute(wy){return Math.sin(wy/420)*48+Math.sin(wy/1100)*70;}

 /* ============== LE DÉCOR QUI CHANGE ============== */
 const T_LONG=4200;
 function troncon(wy){const n=Math.floor(wy/T_LONG), u=(wy-n*T_LONG)/T_LONG;
   const seq=['corniche','calanque','corniche','tunnel'];
   return {type:seq[((n%seq.length)+seq.length)%seq.length],k:u,n};}

 /* ============== LA VOITURE ============== */
 const CAR={x:0,y:0,cap:0,v:0,vlat:0,braq:0,roueT:0};
 const VMAX=640,ACCEL=260,FREIN=460,FROTTE=70;
 let gaz=0,frein=0,volant=0, argent=0, distMemo=0;

 /* ============== TRAFIC VARIÉ ============== */
 const AUTRES=[];
 const MODELES=[
   {t:'berline',c:'#c23a3a',w:24,l:48},
   {t:'berline',c:'#2f6bb0',w:24,l:48},
   {t:'berline',c:'#e8e4da',w:24,l:46},
   {t:'berline',c:'#30303a',w:24,l:46},
   {t:'berline',c:'#36845a',w:24,l:48},
   {t:'taxi',   c:'#ffcf1a',w:25,l:49},
   {t:'bus',    c:'#b84030',w:30,l:88},
   {t:'livreur',c:'#8a6a3a',w:28,l:62},
   {t:'sport',  c:'#e0a828',w:22,l:44},
   {t:'police', c:'#1f3c7a',w:25,l:48}];
 function newAutre(devant){
   const voieDroite=Math.random()<.68;
   const lane=voieDroite?(Math.random()<.5?VOIE*0.5:VOIE*1.4):-(Math.random()<.5?VOIE*0.5:VOIE*1.4);
   const y=CAR.y+(devant?1:-1)*(380+Math.random()*1100);
   const meme=lane>0;
   const vit=meme?(140+Math.random()*180):-(170+Math.random()*180);
   const M=MODELES[(Math.random()*MODELES.length)|0];
   return {x:lane,y,v:vit,m:M,klax:0,roueT:0};
 }
 function pondTrafic(){
   AUTRES.sort((a,b)=>a.y-b.y);
   while(AUTRES.length<12)AUTRES.push(newAutre(Math.random()<.62));
   for(let i=AUTRES.length-1;i>=0;i--)if(Math.abs(AUTRES[i].y-CAR.y)>1700)AUTRES.splice(i,1);
 }
 for(let i=0;i<12;i++)AUTRES.push(newAutre(Math.random()<.5));

 /* ============== COMMANDES : zones DOM séparées ============== */
 const T={volant:null,gaz:null,frein:null};
 let volCx=0;
 const volEl=document.createElement('div');
 volEl.style.cssText='position:absolute;left:0;bottom:0;width:50%;height:50%;z-index:3;touch-action:none;background:transparent';
 const gazEl=document.createElement('div');
 gazEl.style.cssText='position:absolute;right:0;top:40%;width:42%;height:30%;z-index:3;touch-action:none;background:transparent';
 const freinEl=document.createElement('div');
 freinEl.style.cssText='position:absolute;right:0;top:70%;width:42%;height:30%;z-index:3;touch-action:none;background:transparent';
 wrap.appendChild(volEl);wrap.appendChild(gazEl);wrap.appendChild(freinEl);

 volEl.addEventListener('touchstart',e=>{e.preventDefault();e.stopPropagation();const t=e.changedTouches[0];T.volant=t.identifier;volCx=t.clientX;},{passive:false});
 volEl.addEventListener('touchmove',e=>{e.preventDefault();e.stopPropagation();for(const t of e.changedTouches)if(t.identifier===T.volant)volant=Math.max(-1,Math.min(1,(t.clientX-volCx)/(VW*0.22)));},{passive:false});
 const finV=e=>{for(const t of e.changedTouches)if(t.identifier===T.volant){T.volant=null;volant=0;}};
 volEl.addEventListener('touchend',finV,{passive:false});volEl.addEventListener('touchcancel',finV,{passive:false});

 gazEl.addEventListener('touchstart',e=>{e.preventDefault();e.stopPropagation();T.gaz=e.changedTouches[0].identifier;gaz=1;},{passive:false});
 const finG=e=>{for(const t of e.changedTouches)if(t.identifier===T.gaz){T.gaz=null;gaz=0;}};
 gazEl.addEventListener('touchend',finG,{passive:false});gazEl.addEventListener('touchcancel',finG,{passive:false});

 freinEl.addEventListener('touchstart',e=>{e.preventDefault();e.stopPropagation();T.frein=e.changedTouches[0].identifier;frein=1;},{passive:false});
 const finF=e=>{for(const t of e.changedTouches)if(t.identifier===T.frein){T.frein=null;frein=0;}};
 freinEl.addEventListener('touchend',finF,{passive:false});freinEl.addEventListener('touchcancel',finF,{passive:false});

 const K={};addEventListener('keydown',e=>{K[e.key]=1;});addEventListener('keyup',e=>{K[e.key]=0;});

 /* ============== LE ✕ (QUI MARCHE VRAIMENT) ==============
    Posé APRÈS les zones commandes pour être au-dessus ; touchstart ET click,
    chacun stoppe la propagation et appelle fermer(). */
 const sortir=document.createElement('button');
 sortir.textContent='✕';
 sortir.setAttribute('aria-label','Quitter');
 sortir.style.cssText='position:absolute;top:calc(10px + env(safe-area-inset-top));right:14px;z-index:10;width:48px;height:48px;border-radius:50%;border:0;background:rgba(10,18,28,.78);color:#fff;font-size:20px;font-weight:700;cursor:pointer;touch-action:manipulation';
 const faireSortir=e=>{if(e){e.stopPropagation();e.preventDefault();}fermer();};
 sortir.addEventListener('click',faireSortir);
 sortir.addEventListener('touchstart',faireSortir,{passive:false});
 wrap.appendChild(sortir);

 /* ============== DESSIN ============== */
 const PROJ_Y=()=>VH*0.58;
 function pX(wx){return VW/2+(wx-CAR.x)*SC;}
 function pY(wy){return PROJ_Y()-(wy-CAR.y)*SC;}

 function dessinerSol(){
   const trIci=troncon(CAR.y);
   const PAS=3;
   for(let sy=0;sy<VH;sy+=PAS){
     const wy=CAR.y+(PROJ_Y()-sy)/SC;
     const axe=axeRoute(wy);
     const xMer=pX(axe+BORD_MER), xRG=pX(axe-ROUTE_DEMI), xRD=pX(axe+ROUTE_DEMI), xVille=pX(axe+BORD_VILLE);
     const trY=troncon(wy), kTun=trY.type==='tunnel'?(0.5-Math.abs(trY.k-0.5))*2:0;
     ctx.fillStyle=kTun>.05?'#1a1016':'#17688f';ctx.fillRect(0,sy,Math.max(0,xMer),PAS);
     ctx.fillStyle=kTun>.05?'#2a1a20':'#cfc8b8';ctx.fillRect(Math.max(0,xMer),sy,Math.max(0,xRG-Math.max(0,xMer)),PAS);
     ctx.fillStyle=kTun>.4?'#3a3238':'#4a4e54';ctx.fillRect(Math.max(0,xRG),sy,Math.max(0,xRD-Math.max(0,xRG)),PAS);
     ctx.fillStyle=kTun>.05?'#2a1a20':'#cfc8b8';ctx.fillRect(Math.max(0,xRD),sy,Math.max(0,xVille-Math.max(0,xRD)),PAS);
     ctx.fillStyle=kTun>.05?'#1a1016':'#9a6446';ctx.fillRect(Math.max(0,xVille),sy,Math.max(0,VW-Math.max(0,xVille)),PAS);
   }
   /* marquages + rives */
   const off=((CAR.y*SC)%(60*SC)+60*SC)%(60*SC);
   ctx.fillStyle='rgba(248,248,236,.85)';
   for(let sy=-60;sy<VH+60;sy+=36){const y=((sy+off)%(VH+120))-60;const wy=CAR.y+(PROJ_Y()-y)/SC;
     ctx.fillRect(pX(axeRoute(wy))-1.5,y,3,18);}
   ctx.fillStyle='rgba(240,240,230,.55)';
   for(let sy=0;sy<VH;sy+=PAS){const wy=CAR.y+(PROJ_Y()-sy)/SC;const axe=axeRoute(wy);
     ctx.fillRect(pX(axe-ROUTE_DEMI+8),sy,2,PAS);ctx.fillRect(pX(axe+ROUTE_DEMI-8),sy,2,PAS);}
   /* panneau à l'entrée d'une zone */
   if(trIci.k<.08)panneauZone(trIci);
 }
 function panneauZone(tr){
   const nom={corniche:'LA CORNICHE',tunnel:'TUNNEL',calanque:'LES CALANQUES'}[tr.type];
   if(!nom)return;
   const a=1-tr.k*12;if(a<=0)return;
   ctx.save();ctx.globalAlpha=a;
   ctx.fillStyle='rgba(8,16,26,.75)';ctx.fillRect(VW/2-120,88,240,38);
   ctx.strokeStyle='rgba(255,227,150,.9)';ctx.lineWidth=2;ctx.strokeRect(VW/2-120,88,240,38);
   ctx.fillStyle='#ffe396';ctx.font='700 16px "Helvetica Neue"';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(nom,VW/2,107);
   ctx.restore();
 }

 /* objets du bord : palmier / lampe / rocher / colonne-tunnel */
 const BORDS=[];for(let i=0;i<80;i++)BORDS.push({y:i*130,cote:i%2?1:-1,sel:Math.random()});
 function dessinerBords(){
   const trIci=troncon(CAR.y);
   for(const b of BORDS){
     while(b.y<CAR.y-400)b.y+=130*80;while(b.y>CAR.y+1700)b.y-=130*80;
     const trY=troncon(b.y);const axe=axeRoute(b.y);
     const wx=axe+(b.cote>0?ROUTE_DEMI+18:-ROUTE_DEMI-18);
     const X=pX(wx),Y=pY(b.y);
     if(Y<-60||Y>VH+60)continue;
     if(trY.type==='tunnel'){ctx.fillStyle='#1a1116';ctx.fillRect(X-4*SC,Y-30*SC,8*SC,36*SC);
       ctx.fillStyle='#ffcc66';ctx.beginPath();ctx.arc(X,Y-26*SC,3*SC,0,7);ctx.fill();}
     else if(trY.type==='calanque'){ctx.fillStyle='rgba(60,50,40,.3)';ctx.beginPath();ctx.ellipse(X,Y,14*SC,4*SC,0,0,7);ctx.fill();
       ctx.fillStyle='#e8ddc2';ctx.beginPath();ctx.ellipse(X,Y-6*SC,12*SC,8*SC,0,0,7);ctx.fill();
       ctx.fillStyle='#c8bb9c';ctx.beginPath();ctx.ellipse(X+3*SC,Y-3*SC,9*SC,6*SC,0,0,7);ctx.fill();}
     else{if(b.sel<.6)palm(X,Y);else lamp(X,Y);}
   }
   /* plafond de tunnel + lampes au centre */
   if(trIci.type==='tunnel'&&trIci.k>.08&&trIci.k<.92){
     const a=Math.min(1,(.5-Math.abs(trIci.k-.5))*5);
     ctx.fillStyle='rgba(6,2,10,'+(a*.45)+')';ctx.fillRect(0,0,VW,VH);
     ctx.fillStyle='rgba(255,224,160,.75)';
     const off=((CAR.y*SC)%(90*SC)+90*SC)%(90*SC);
     for(let sy=-90;sy<VH+90;sy+=56){const y=((sy+off)%(VH+180))-90;ctx.fillRect(VW/2-24,y,48,4);}
   }
 }
 function palm(X,Y){ctx.fillStyle='rgba(20,30,20,.3)';ctx.beginPath();ctx.ellipse(X,Y,10*SC,3*SC,0,0,7);ctx.fill();
   ctx.fillStyle='#6a4a30';ctx.fillRect(X-1.5*SC,Y-30*SC,3*SC,30*SC);
   ctx.fillStyle='#2f6b38';for(let a=0;a<7;a++){const an=a/7*6.28;ctx.beginPath();ctx.ellipse(X+Math.cos(an)*10*SC,Y-30*SC+Math.sin(an)*5*SC,9*SC,3.5*SC,an,0,7);ctx.fill();}}
 function lamp(X,Y){ctx.fillStyle='rgba(20,20,28,.35)';ctx.beginPath();ctx.ellipse(X,Y,6*SC,2*SC,0,0,7);ctx.fill();
   ctx.fillStyle='#2a2e36';ctx.fillRect(X-1*SC,Y-34*SC,2*SC,34*SC);ctx.fillRect(X-1*SC,Y-34*SC,9*SC,2*SC);
   ctx.fillStyle='#ffd98a';ctx.beginPath();ctx.arc(X+8*SC,Y-33*SC,2.4*SC,0,7);ctx.fill();}

 /* une voiture détaillée */
 function roundRect(x,y,w,h,r){ctx.beginPath();ctx.moveTo(x+r,y);ctx.arcTo(x+w,y,x+w,y+h,r);ctx.arcTo(x+w,y+h,x,y+h,r);ctx.arcTo(x,y+h,x,y,r);ctx.arcTo(x,y,x+w,y,r);ctx.closePath();}
 function dessinerAuto(wx,wy,cap,m,freinOui,roueT){
   const X=pX(wx),Y=pY(wy),W=m.w*SC,L=m.l*SC;
   ctx.save();ctx.translate(X,Y);ctx.rotate(cap);
   ctx.fillStyle='rgba(0,0,0,.3)';roundRect(-W/2+3,-L/2+4,W,L,4*SC);ctx.fill();
   ctx.fillStyle=m.c;roundRect(-W/2,-L/2,W,L,4*SC);ctx.fill();
   ctx.fillStyle='rgba(255,255,255,.14)';ctx.fillRect(-W/2+1,-L/2+3,2,L-6);
   ctx.fillStyle='rgba(0,0,0,.18)';ctx.fillRect(W/2-3,-L/2+3,2,L-6);
   ctx.fillStyle='rgba(28,38,52,.92)';
   ctx.fillRect(-W/2+3,-L/2+L*0.16,W-6,L*0.18);
   ctx.fillRect(-W/2+3,L/2-L*0.28,W-6,L*0.15);
   ctx.fillStyle='rgba(255,255,255,.08)';ctx.fillRect(-W/2+3,-L/2+L*0.37,W-6,L*0.24);
   /* roues qui défilent */
   const rw=3*SC,rh=7*SC;ctx.fillStyle='#16181c';
   const base=[[-W/2-1,-L/2+6],[W/2-rw+1,-L/2+6],[-W/2-1,L/2-6-rh],[W/2-rw+1,L/2-6-rh]];
   for(const [rx,ry] of base){ctx.fillStyle='#16181c';ctx.fillRect(rx,ry,rw,rh);
     ctx.fillStyle='rgba(255,255,255,.22)';const off=(roueT*rh)%rh;ctx.fillRect(rx,ry+off-rh,rw,1);ctx.fillRect(rx,ry+off,rw,1);ctx.fillRect(rx,ry+off+rh*.5,rw,1);}
   /* détails par modèle */
   if(m.t==='taxi'){ctx.fillStyle='#1a1a1a';ctx.fillRect(-W/2+3,-L*0.06,W-6,L*0.08);
     ctx.fillStyle='#fff';ctx.font='700 '+(6*SC).toFixed(1)+'px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('TAXI',0,-L*0.02);}
   if(m.t==='bus'){ctx.strokeStyle='rgba(255,255,255,.4)';ctx.lineWidth=1*SC;
     for(let yy=-L/2+6;yy<L/2-6;yy+=L/5){ctx.beginPath();ctx.moveTo(-W/2+3,yy);ctx.lineTo(W/2-3,yy);ctx.stroke();}}
   if(m.t==='police'){const t=performance.now()/100;const rouge=(t|0)%2===0;
     ctx.fillStyle=rouge?'#ff3030':'#3070ff';ctx.fillRect(-W*0.3,-L*0.08,W*0.3,2*SC);
     ctx.fillStyle=rouge?'#3070ff':'#ff3030';ctx.fillRect(0,-L*0.08,W*0.3,2*SC);
     ctx.fillStyle='#fff';ctx.font='700 '+(5*SC).toFixed(1)+'px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('POLICE',0,-L*0.02);}
   if(m.t==='sport'){ctx.fillStyle='rgba(255,255,255,.35)';ctx.fillRect(-1*SC,-L/2+2,2*SC,L-4);}
   if(m.t==='livreur'){ctx.fillStyle='rgba(255,255,255,.08)';ctx.fillRect(-W/2+3,-L*0.05,W-6,L*0.5);
     ctx.strokeStyle='rgba(0,0,0,.25)';ctx.lineWidth=1*SC;ctx.beginPath();ctx.moveTo(-W/2+3,0);ctx.lineTo(W/2-3,0);ctx.stroke();}
   /* phares + feux arrière */
   ctx.fillStyle='#fff3c0';ctx.fillRect(-W/2+2,-L/2,4*SC,2);ctx.fillRect(W/2-2-4*SC,-L/2,4*SC,2);
   ctx.fillStyle=freinOui?'#ff3838':'#b02020';ctx.fillRect(-W/2+2,L/2-2,4*SC,2);ctx.fillRect(W/2-2-4*SC,L/2-2,4*SC,2);
   if(freinOui){ctx.fillStyle='rgba(255,80,80,.35)';ctx.fillRect(-W/2-2,L/2+1,W+4,3);}
   ctx.restore();
 }

 /* ============== PHYSIQUE ============== */
 function pas(dt){
   if(K['ArrowUp']||K['z'])gaz=1;else if(T.gaz===null)gaz=0;
   if(K['ArrowDown']||K['s'])frein=1;else if(T.frein===null)frein=0;
   if(K['ArrowLeft']||K['q'])volant=-1;else if(K['ArrowRight']||K['d'])volant=1;
   else if(T.volant===null)volant=0;

   CAR.braq+=((volant*0.95)-CAR.braq)*Math.min(1,dt*9);

   if(gaz>0)CAR.v+=ACCEL*gaz*dt;
   if(frein>0)CAR.v-=FREIN*frein*dt;
   CAR.v-=Math.sign(CAR.v)*FROTTE*dt;
   if(gaz===0&&frein===0&&Math.abs(CAR.v)<6)CAR.v=0;
   CAR.v=Math.max(-150,Math.min(VMAX,CAR.v));

   const prise=Math.min(1,Math.abs(CAR.v)/160);
   CAR.cap+=CAR.braq*2.4*prise*dt*(CAR.v<0?-1:1);

   const vx=Math.sin(CAR.cap)*CAR.v, vy=Math.cos(CAR.cap)*CAR.v;
   CAR.vlat+=(-CAR.braq*CAR.v*0.0017)*dt*60;
   CAR.vlat*=Math.pow(0.86,dt*60);
   CAR.x+=(vx+Math.cos(CAR.cap)*CAR.vlat)*dt;
   CAR.y+=(vy-Math.sin(CAR.cap)*CAR.vlat)*dt;

   const axe=axeRoute(CAR.y);
   const hors=Math.abs(CAR.x-axe)>ROUTE_DEMI-10;
   if(hors){CAR.v*=Math.pow(0.5,dt);
     const limG=axe+BORD_MER+14, limD=axe+BORD_VILLE-14;
     CAR.x=Math.max(limG,Math.min(limD,CAR.x));
     if(Math.abs(CAR.x-axe)>ROUTE_DEMI+8)CAR.v*=Math.pow(0.1,dt);}

   if(volant===0&&Math.abs(CAR.braq)<0.05)CAR.cap*=Math.pow(0.6,dt);
   CAR.roueT+=Math.abs(CAR.v)*0.0025;

   for(const o of AUTRES){o.y+=o.v*dt;
     const dx=o.x-CAR.x, dy=o.y-CAR.y;
     const hw=(o.m.w+26)/2, hl=(o.m.l+50)/2;
     if(Math.abs(dx)<hw&&Math.abs(dy)<hl){CAR.v*=0.55;CAR.x-=Math.sign(dx||1)*5;o.x+=Math.sign(dx||1)*2;o.klax=0.6;
       try{navigator.vibrate&&navigator.vibrate(40);}catch(x){}}
     o.roueT+=Math.abs(o.v)*0.0025;
     o.klax=Math.max(0,o.klax-dt);
   }
   pondTrafic();

   if(vy>0){distMemo+=vy*dt;while(distMemo>100){distMemo-=100;argent+=2;}}
 }

 /* ============== HUD ============== */
 function hud(){
   /* volant */
   const cx=VW*0.22,cy=VH-72,r=50;
   ctx.strokeStyle='rgba(255,255,255,.25)';ctx.lineWidth=3;ctx.beginPath();ctx.arc(cx,cy,r,0,7);ctx.stroke();
   ctx.save();ctx.translate(cx,cy);ctx.rotate(CAR.braq*0.95);
   ctx.strokeStyle='rgba(255,255,255,.9)';ctx.lineWidth=5;ctx.beginPath();ctx.arc(0,0,r-8,0,7);ctx.stroke();
   ctx.beginPath();ctx.moveTo(-r+10,0);ctx.lineTo(r-10,0);ctx.moveTo(0,0);ctx.lineTo(0,-(r-10));ctx.stroke();
   ctx.fillStyle='rgba(255,255,255,.95)';ctx.beginPath();ctx.arc(0,0,6,0,7);ctx.fill();ctx.restore();
   ctx.fillStyle='rgba(255,255,255,.55)';ctx.font='11px sans-serif';ctx.textAlign='center';ctx.fillText('VOLANT',cx,cy+r+16);
   /* pédales */
   pedale(VW*0.8,VH-128,'GAZ',gaz>0,'#4caf50');
   pedale(VW*0.8,VH-48,'FREIN',frein>0,'#e14b4b');
   /* compteur */
   const kmh=Math.round(Math.abs(CAR.v)/VMAX*210);
   ctx.fillStyle='rgba(8,16,26,.7)';ctx.fillRect(VW/2-62,VH-62,124,46);
   ctx.strokeStyle='rgba(255,255,255,.14)';ctx.strokeRect(VW/2-62,VH-62,124,46);
   ctx.fillStyle='#fff';ctx.font='700 28px sans-serif';ctx.textAlign='center';ctx.fillText(kmh,VW/2-8,VH-33);
   ctx.fillStyle='rgba(255,255,255,.65)';ctx.font='11px sans-serif';ctx.fillText('km/h',VW/2+30,VH-31);
   /* bandeau haut : distance + argent */
   ctx.fillStyle='rgba(8,16,26,.6)';ctx.fillRect(0,0,VW,34);
   ctx.fillStyle='#fff';ctx.font='700 15px sans-serif';ctx.textAlign='left';
   ctx.fillText('↑ '+(CAR.y/100).toFixed(1).replace('.',',')+' km',14,22);
   ctx.fillStyle='#ffe396';ctx.textAlign='right';
   ctx.fillText('+ '+argent+' €',VW-70,22);
 }
 function pedale(x,y,lab,on,col){ctx.fillStyle=on?col:'rgba(255,255,255,.14)';
   ctx.beginPath();ctx.ellipse(x,y,42,26,0,0,7);ctx.fill();
   ctx.strokeStyle=on?'rgba(255,255,255,.5)':'rgba(255,255,255,.2)';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(x,y,42,26,0,0,7);ctx.stroke();
   ctx.fillStyle=on?'#fff':'rgba(255,255,255,.75)';ctx.font='700 13px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(lab,x,y);}

 /* ============== FERMETURE : verse l'argent, retire tout ============== */
 let arret=false;
 function fermer(){if(arret)return;arret=true;
   try{if(typeof e!=='undefined'&&argent>0){e.euros=(e.euros||0)+argent;try{majHaut&&majHaut();}catch(x){}try{sauver&&sauver();}catch(x){}}}catch(x){}
   wrap.style.opacity='0';
   setTimeout(()=>{try{removeEventListener('resize',taille);}catch(x){}wrap.remove();if(opts.onClose)opts.onClose();},400);}

 /* ============== BOUCLE ============== */
 let prev=performance.now();
 function boucle(now){if(arret)return;
   let dt=(now-prev)/1000;prev=now;if(dt>0.05)dt=0.05;
   pas(dt);
   ctx.clearRect(0,0,VW,VH);
   dessinerSol();dessinerBords();
   for(const o of AUTRES){const meme=o.v>0;dessinerAuto(o.x,o.y,meme?0:Math.PI,o.m,false,o.roueT);}
   const m={t:'perso',c:opts.couleur||'#d7b43a',w:26,l:50};
   dessinerAuto(CAR.x,CAR.y,CAR.cap,m,frein>0,CAR.roueT);
   hud();
   requestAnimationFrame(boucle);
 }
 requestAnimationFrame(boucle);
};
})();
