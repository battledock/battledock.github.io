/* =====================================================================
   LE MODE CONDUITE — LA CORNICHE, VUE DE DESSUS.
   Une longue route côtière qui défile : la mer à gauche, la falaise et la
   ville à droite. On tient le volant d'un doigt, l'accélérateur et le frein
   de l'autre. La voiture a de l'inertie, elle glisse un peu en virage, le
   moteur se fait entendre. On double le trafic, on évite l'accrochage.

   Autonome : un calque plein écran, sa propre boucle, aucun lien avec le
   reste du moteur. window.ouvrirConduite() le lance ; il se referme seul.
   ===================================================================== */
(function(){
if(window.ouvrirConduite)return;

window.ouvrirConduite=function(opts){
 opts=opts||{};
 if(document.getElementById('condW'))return;

 /* --------- l'écran --------- */
 const wrap=document.createElement('div');wrap.id='condW';
 wrap.style.cssText='position:fixed;inset:0;z-index:2147483200;background:#0c1622;overflow:hidden;touch-action:none;'+
   'font-family:"Helvetica Neue",Arial,sans-serif;opacity:0;transition:opacity .4s';
 const cv=document.createElement('canvas');cv.style.cssText='position:absolute;inset:0;width:100%;height:100%;display:block';
 wrap.appendChild(cv);
 document.body.appendChild(wrap);
 const ctx=cv.getContext('2d');
 let DPR=Math.min(2,window.devicePixelRatio||1),VW=0,VH=0,SC=1;
 function taille(){VW=wrap.clientWidth;VH=wrap.clientHeight;cv.width=VW*DPR;cv.height=VH*DPR;ctx.setTransform(DPR,0,0,DPR,0,0);
   SC=Math.max(VW/420,VH/760);}            /* l'échelle : la voiture fait ~la même taille partout */
 taille();addEventListener('resize',taille);

 requestAnimationFrame(()=>wrap.style.opacity='1');

 /* =================== LE MONDE =================== */
 /* La route est verticale. x : la position en travers (0 = axe). La mer est à
    gauche (x très négatif), la falaise à droite (x très positif). On avance en
    y (vers le haut) : worldY augmente. */
 const h=(a,b,k)=>{let n=((a*73856093)^(b*19349663)^(k*83492791))|0;n=(n^(n>>>13))*1274126177|0;return((n^(n>>>16))>>>0)/4294967296;};
 const ROUTE_DEMI=150;                       /* la demi-largeur de la chaussée, en unités monde */
 const VOIE=ROUTE_DEMI/2;                     /* deux voies de chaque côté de l'axe → 2 sens possibles */
 const BORD_MER=-ROUTE_DEMI-26, BORD_VILLE=ROUTE_DEMI+26;

 /* =================== LA VOITURE =================== */
 const CAR={x:VOIE*0.5,y:0,            /* position monde */
   cap:0,                              /* le cap : 0 = tout droit vers le haut ; radians, + = vers la droite */
   v:0,                                /* la vitesse le long du cap (unités/s) */
   vlat:0,                             /* la glisse latérale */
   braq:0};                            /* l'angle du volant courant (lissé) */
 const VMAX=560, ACCEL=240, FREIN=420, FROTTE=70;
 let gaz=0,frein=0,volant=0;           /* commandes 0..1 et -1..1 */

 /* =================== LE TRAFIC =================== */
 const AUTRES=[];
 const COUL=['#c23a3a','#2f6bb0','#e0a828','#e8e4da','#36845a','#8a4ab0','#d86a2c','#30303a'];
 function pondTrafic(){
   /* on garde une dizaine de voitures autour de la nôtre */
   AUTRES.sort((a,b)=>a.y-b.y);
   while(AUTRES.length<11){
     const devant=Math.random()<.62, voieDroite=Math.random()<.7;
     const lane=voieDroite?(Math.random()<.5?VOIE*0.5:VOIE*1.4):-(Math.random()<.5?VOIE*0.5:VOIE*1.4);
     const y=CAR.y+(devant?1:-1)*(360+Math.random()*900);
     const meme=lane>0;                 /* à droite : même sens que nous (vers le haut) */
     const vit=meme?(150+Math.random()*120):-(170+Math.random()*120);
     AUTRES.push({x:lane,y,v:vit,c:COUL[(Math.random()*COUL.length)|0],w:24,l:46,klax:0});
   }
   /* enlever celles trop loin */
   for(let i=AUTRES.length-1;i>=0;i--){if(Math.abs(AUTRES[i].y-CAR.y)>1500)AUTRES.splice(i,1);}
 }
 for(let i=0;i<11;i++)pondTrafic();

 /* =================== LES COMMANDES TACTILES =================== */
 const T={volant:null,pedale:null};
 function zoneDe(x){return x<VW*0.5?'volant':'pedale';}
 let volCx=0,pedBas=0,pedType=0;
 wrap.addEventListener('touchstart',e=>{e.preventDefault();for(const t of e.changedTouches){const z=zoneDe(t.clientX);
   if(z==='volant'&&T.volant===null){T.volant=t.identifier;volCx=t.clientX;}
   else if(z==='pedale'&&T.pedale===null){T.pedale=t.identifier;pedBas=t.clientY;pedType=t.clientY>VH*0.62?1:0;}}
   maj(e);},{passive:false});
 wrap.addEventListener('touchmove',e=>{e.preventDefault();maj(e);},{passive:false});
 const fin=e=>{e.preventDefault();for(const t of e.changedTouches){
   if(t.identifier===T.volant){T.volant=null;volant=0;}
   if(t.identifier===T.pedale){T.pedale=null;gaz=0;frein=0;}}};
 wrap.addEventListener('touchend',fin,{passive:false});wrap.addEventListener('touchcancel',fin,{passive:false});
 function maj(e){for(const t of e.touches){
   if(t.identifier===T.volant){volant=Math.max(-1,Math.min(1,(t.clientX-volCx)/(VW*0.22)));}
   if(t.identifier===T.pedale){const monte=pedType===0; if(monte){gaz=1;frein=0;}else{frein=1;gaz=0;}}}}
 /* clavier, pour tester au bureau */
 const K={};
 addEventListener('keydown',e=>{K[e.key]=1;});addEventListener('keyup',e=>{K[e.key]=0;});

 /* =================== LE DESSIN DU DÉCOR =================== */
 /* On projette (wx,wy) monde → écran. La voiture reste aux ~68% de la hauteur,
    centrée en x. 1 unité monde = SC pixels. */
 const PROJ_Y=()=>VH*0.56;
 function pX(wx){return VW/2+(wx-CAR.x)*SC;}
 function pY(wy){return PROJ_Y()-(wy-CAR.y)*SC;}

 function fondBande(y0,y1,col){ctx.fillStyle=col;ctx.fillRect(0,y0,VW,y1-y0);}

 function dessinerRoute(){
   /* la mer (gauche), la chaussée (centre), la falaise/ville (droite) : des
      bandes verticales, bornées par la position en travers. */
   const xMerFin=pX(BORD_MER), xRouteG=pX(-ROUTE_DEMI), xRouteD=pX(ROUTE_DEMI), xVille=pX(BORD_VILLE);
   /* la mer */
   ctx.fillStyle='#17688f';ctx.fillRect(0,0,Math.max(0,xMerFin),VH);
   let g=ctx.createLinearGradient(0,0,Math.max(1,xMerFin),0);g.addColorStop(0,'#0d4866');g.addColorStop(1,'#2f88ad');
   ctx.fillStyle=g;ctx.fillRect(0,0,Math.max(0,xMerFin),VH);
   /* le liseré d'écume + le muret */
   if(xMerFin>0&&xMerFin<VW){ctx.fillStyle='#e8ede4';ctx.fillRect(xMerFin-6,0,6,VH);ctx.fillStyle='#b9b09a';ctx.fillRect(xMerFin,0,10,VH);
     ctx.fillStyle='#8a8170';ctx.fillRect(xMerFin+10,0,2,VH);}
   /* le trottoir mer */
   ctx.fillStyle='#cfc8b8';ctx.fillRect(Math.max(0,xMerFin+12),0,Math.max(0,xRouteG-(xMerFin+12)),VH);
   /* la chaussée */
   ctx.fillStyle='#4a4e54';ctx.fillRect(Math.max(0,xRouteG),0,Math.max(0,xRouteD-xRouteG),VH);
   /* le grain + les marquages qui défilent */
   const off=((CAR.y*SC)%(60*SC));
   ctx.fillStyle='rgba(248,248,236,.8)';
   const xAxe=pX(0);
   for(let sy=-60;sy<VH+60;sy+=36){const y=((sy+off)% (VH+120))-60;ctx.fillRect(xAxe-1.5,y,3,18);}
   /* les lignes de rive */
   ctx.fillStyle='rgba(240,240,230,.6)';ctx.fillRect(pX(-ROUTE_DEMI+8),0,2,VH);ctx.fillRect(pX(ROUTE_DEMI-8),0,2,VH);
   /* le trottoir ville + la falaise */
   ctx.fillStyle='#cfc8b8';ctx.fillRect(Math.max(0,xRouteD),0,Math.max(0,xVille-xRouteD),VH);
   let gv=ctx.createLinearGradient(xVille,0,VW,0);gv.addColorStop(0,'#c98f63');gv.addColorStop(1,'#9a6446');
   ctx.fillStyle=gv;ctx.fillRect(Math.max(0,xVille),0,VW,VH);
   ctx.fillStyle='rgba(60,40,24,.2)';for(let sy=0;sy<VH;sy+=26){const y=((sy-off*.6)%VH+VH)%VH;ctx.fillRect(Math.max(0,xVille),y,VW,1);}
 }
 /* des palmiers et lampadaires plantés le long, qui défilent */
 const BORDS=[];for(let i=0;i<60;i++)BORDS.push({y:i*220,cote:i%2?1:-1,t:h(i,1,7)<.6?'palm':'lamp'});
 function dessinerBords(){
   for(const b of BORDS){
     while(b.y<CAR.y-300)b.y+=220*60;while(b.y>CAR.y+1600)b.y-=220*60;
     const wx=b.cote>0?ROUTE_DEMI+16:-ROUTE_DEMI-16, X=pX(wx),Y=pY(b.y);
     if(Y<-40||Y>VH+40)continue;
     if(b.t==='palm'){ctx.fillStyle='rgba(20,30,20,.3)';ctx.beginPath();ctx.ellipse(X,Y,10*SC,3*SC,0,0,7);ctx.fill();
       ctx.fillStyle='#6a4a30';ctx.fillRect(X-1.5*SC,Y-30*SC,3*SC,30*SC);
       ctx.fillStyle='#2f6b38';for(let a=0;a<7;a++){const an=a/7*6.28;ctx.beginPath();ctx.ellipse(X+Math.cos(an)*10*SC,Y-30*SC+Math.sin(an)*5*SC,9*SC,3.5*SC,an,0,7);ctx.fill();}}
     else{ctx.fillStyle='rgba(20,20,28,.35)';ctx.beginPath();ctx.ellipse(X,Y,6*SC,2*SC,0,0,7);ctx.fill();
       ctx.fillStyle='#2a2e36';ctx.fillRect(X-1*SC,Y-34*SC,2*SC,34*SC);ctx.fillRect(X-1*SC,Y-34*SC,9*SC,2*SC);
       ctx.fillStyle='#ffd98a';ctx.beginPath();ctx.arc(X+8*SC,Y-33*SC,2.4*SC,0,7);ctx.fill();}
   }
 }

 /* =================== LE DESSIN D'UNE VOITURE =================== */
 function voiture(wx,wy,cap,col,w,l,phare){
   const X=pX(wx),Y=pY(wy),W=w*SC,L=l*SC;
   ctx.save();ctx.translate(X,Y);ctx.rotate(cap);
   /* l'ombre */
   ctx.fillStyle='rgba(0,0,0,.28)';ctx.fillRect(-W/2+2,-L/2+3,W,L);
   /* la carrosserie, coins arrondis */
   const r=4*SC;ctx.fillStyle=col;ctx.beginPath();
   ctx.moveTo(-W/2+r,-L/2);ctx.arcTo(W/2,-L/2,W/2,L/2,r);ctx.arcTo(W/2,L/2,-W/2,L/2,r);ctx.arcTo(-W/2,L/2,-W/2,-L/2,r);ctx.arcTo(-W/2,-L/2,W/2,-L/2,r);ctx.closePath();ctx.fill();
   /* les reflets clairs sur les flancs */
   ctx.fillStyle='rgba(255,255,255,.14)';ctx.fillRect(-W/2+1,-L/2+2,2,L-4);
   ctx.fillStyle='rgba(0,0,0,.16)';ctx.fillRect(W/2-3,-L/2+2,2,L-4);
   /* le pare-brise avant et la lunette arrière */
   ctx.fillStyle='rgba(30,40,54,.9)';ctx.fillRect(-W/2+3,-L/2+L*0.18,W-6,L*0.16);
   ctx.fillRect(-W/2+3,L/2-L*0.30,W-6,L*0.14);
   /* le toit */
   ctx.fillStyle='rgba(255,255,255,.08)';ctx.fillRect(-W/2+3,-L/2+L*0.36,W-6,L*0.26);
   /* les phares */
   if(phare){ctx.fillStyle='#fff3c0';ctx.fillRect(-W/2+2,-L/2,4*SC,3);ctx.fillRect(W/2-2-4*SC,-L/2,4*SC,3);
     ctx.fillStyle='#b83030';ctx.fillRect(-W/2+2,L/2-2,3*SC,2);ctx.fillRect(W/2-2-3*SC,L/2-2,3*SC,2);}
   ctx.restore();
 }

 /* =================== LA PHYSIQUE =================== */
 function pas(dt){
   /* commandes clavier */
   if(K['ArrowUp']||K['z'])gaz=1;else if(T.pedale===null)gaz=K['ArrowUp']?1:gaz;
   if(K['ArrowDown']||K['s'])frein=1;
   if(K['ArrowUp']&&!K['ArrowDown'])gaz=1;if(!K['ArrowUp']&&K['ArrowDown']){frein=1;gaz=0;}
   if(K['ArrowLeft']||K['q'])volant=-1;else if(K['ArrowRight']||K['d'])volant=1;else if(T.volant===null&&!(K['a']))volant=volant;
   if(!K['ArrowLeft']&&!K['ArrowRight']&&T.volant===null)volant=volant;

   /* le volant se lisse vers la commande */
   CAR.braq+=((volant*0.9)-CAR.braq)*Math.min(1,dt*8);

   /* vitesse : gaz / frein / frottement */
   if(gaz>0)CAR.v+=ACCEL*gaz*dt;
   if(frein>0)CAR.v-=FREIN*frein*dt;
   CAR.v-=Math.sign(CAR.v)*FROTTE*dt;
   if(gaz===0&&frein===0&&Math.abs(CAR.v)<6)CAR.v=0;
   CAR.v=Math.max(-120,Math.min(VMAX,CAR.v));

   /* la direction tourne d'autant plus qu'on roule vite, mais pas à l'arrêt */
   const prise=Math.min(1,Math.abs(CAR.v)/160);
   CAR.cap+=CAR.braq*2.4*prise*dt*(CAR.v<0?-1:1);

   /* avance selon le cap, avec une glisse latérale qui s'amortit (dérapage) */
   const vx=Math.sin(CAR.cap)*CAR.v, vy=Math.cos(CAR.cap)*CAR.v;
   CAR.vlat+=(-CAR.braq*CAR.v*0.0016)*dt*60;        /* le train arrière chasse un peu */
   CAR.vlat*=Math.pow(0.86,dt*60);
   CAR.x+=(vx+Math.cos(CAR.cap)*CAR.vlat)*dt;
   CAR.y+=(vy-Math.sin(CAR.cap)*CAR.vlat)*dt;

   /* les bords : on ralentit fort si on sort de la chaussée (bitume → trottoir) */
   const hors=Math.abs(CAR.x)>ROUTE_DEMI-10;
   if(hors){CAR.v*=Math.pow(0.4,dt);CAR.x=Math.max(BORD_MER+14,Math.min(BORD_VILLE-14,CAR.x));
     if(Math.abs(CAR.x)>ROUTE_DEMI+8){CAR.v*=Math.pow(0.1,dt);}}

   /* le cap revient doucement dans l'axe quand on lâche le volant */
   if(volant===0&&Math.abs(CAR.braq)<0.05)CAR.cap*=Math.pow(0.6,dt);

   /* le trafic avance, on gère l'accrochage */
   for(const o of AUTRES){o.y+=o.v*dt;
     const dx=o.x-CAR.x, dy=o.y-CAR.y;
     if(Math.abs(dx)<20&&Math.abs(dy)<46){
       /* collision : on se repousse, grosse perte de vitesse, klaxon */
       CAR.v*=0.5;CAR.x-=Math.sign(dx||1)*4;o.x+=Math.sign(dx||1)*2;o.klax=0.5;
       try{navigator.vibrate&&navigator.vibrate(40);}catch(x){}
     }
     o.klax=Math.max(0,o.klax-dt);
   }
   pondTrafic();

   DIST+=Math.max(0,vy)*dt;
 }
 let DIST=0;

 /* =================== L'INTERFACE =================== */
 function hud(){
   /* le volant, en bas à gauche */
   const cx=VW*0.2,cy=VH-74,r=52;
   ctx.strokeStyle='rgba(255,255,255,.3)';ctx.lineWidth=3;ctx.beginPath();ctx.arc(cx,cy,r,0,7);ctx.stroke();
   ctx.save();ctx.translate(cx,cy);ctx.rotate(CAR.braq*0.9);
   ctx.strokeStyle='rgba(255,255,255,.85)';ctx.lineWidth=5;ctx.beginPath();ctx.arc(0,0,r-8,0,7);ctx.stroke();
   ctx.beginPath();ctx.moveTo(-r+10,0);ctx.lineTo(r-10,0);ctx.moveTo(0,0);ctx.lineTo(0,-(r-10));ctx.stroke();
   ctx.fillStyle='rgba(255,255,255,.9)';ctx.beginPath();ctx.arc(0,0,6,0,7);ctx.fill();ctx.restore();
   ctx.fillStyle='rgba(255,255,255,.5)';ctx.font='11px "Helvetica Neue"';ctx.textAlign='center';ctx.fillText('VOLANT',cx,cy+r+16);
   /* les pédales, en bas à droite */
   const px=VW*0.82;
   pedale(px,VH-108,'GAZ',gaz>0,'#4caf50');
   pedale(px,VH-48,'FREIN',frein>0,'#e14b4b');
   /* le compteur */
   const kmh=Math.round(Math.abs(CAR.v)/560*180);
   ctx.fillStyle='rgba(8,16,26,.65)';ctx.fillRect(VW/2-56,VH-58,112,40);
   ctx.fillStyle='#fff';ctx.font='700 26px "Helvetica Neue"';ctx.textAlign='center';ctx.fillText(kmh,VW/2-6,VH-33);
   ctx.fillStyle='rgba(255,255,255,.6)';ctx.font='11px "Helvetica Neue"';ctx.fillText('km/h',VW/2+28,VH-31);
   /* la distance */
   ctx.fillStyle='rgba(255,255,255,.85)';ctx.font='700 15px "Helvetica Neue"';ctx.textAlign='left';
   ctx.fillText((DIST/100).toFixed(1).replace('.',',')+' km',14,30);
 }
 function pedale(x,y,lab,on,col){ctx.fillStyle=on?col:'rgba(255,255,255,.14)';
   ctx.beginPath();ctx.ellipse(x,y,38,22,0,0,7);ctx.fill();
   ctx.fillStyle=on?'#fff':'rgba(255,255,255,.7)';ctx.font='700 13px "Helvetica Neue"';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(lab,x,y);}

 /* le bouton sortir */
 const sortir=document.createElement('button');
 sortir.textContent='✕';
 sortir.style.cssText='position:absolute;top:calc(10px + env(safe-area-inset-top));right:14px;z-index:5;width:40px;height:40px;border-radius:50%;border:0;background:rgba(10,18,28,.6);color:#fff;font-size:18px';
 sortir.onclick=()=>fermer();
 wrap.appendChild(sortir);
 function fermer(){arret=true;wrap.style.opacity='0';setTimeout(()=>{try{removeEventListener('resize',taille);}catch(x){}wrap.remove();if(opts.onClose)opts.onClose();},400);}

 /* =================== LA BOUCLE =================== */
 let arret=false,prev=performance.now();
 function boucle(now){if(arret)return;
   let dt=(now-prev)/1000;prev=now;if(dt>0.05)dt=0.05;
   pas(dt);
   /* le ciel en haut, léger */
   ctx.clearRect(0,0,VW,VH);
   dessinerRoute();
   dessinerBords();
   /* le trafic derrière nous d'abord (plus bas à l'écran = plus proche) */
   for(const o of AUTRES){const meme=o.v>0;voiture(o.x,o.y,meme?0:Math.PI,o.c,o.w,o.l,true);}
   /* notre voiture */
   voiture(CAR.x,CAR.y,CAR.cap,opts.couleur||'#d7b43a',26,50,true);
   hud();
   requestAnimationFrame(boucle);
 }
 requestAnimationFrame(boucle);
};
})();
