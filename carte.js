/* =====================================================================
   LA CARTE — les lieux du jeu, et un bouton pour y aller.
   Un petit plan dessiné (la mer, le port, la place, la galerie), des
   épingles qu'on touche, « tu es ici » qui palpite ; puis la liste.
   La feuille du Sac. Chargée à la demande par moteur.js (eval direct).
   ===================================================================== */
(()=>{
const CSS=`#carN{position:fixed;inset:0;z-index:2147482100;font-family:'Baloo 2',system-ui,sans-serif;color:#2a2016;user-select:none;-webkit-user-select:none;-webkit-tap-highlight-color:transparent;background:rgba(10,14,20,.45);opacity:0;transition:opacity .2s}
#carN.on{opacity:1}#carN *{box-sizing:border-box}#carN *::after{content:none!important;display:none!important}#carN img,#carN canvas,#carN svg{image-rendering:pixelated}
#carN .pan{position:absolute;left:0;right:0;bottom:0;height:84%;background:#f6f1e6;border-radius:26px 26px 0 0;display:flex;flex-direction:column;transform:translateY(100%);transition:transform .26s cubic-bezier(.2,.8,.2,1);box-shadow:0 -10px 30px rgba(0,0,0,.3)}
#carN.on .pan{transform:translateY(var(--dy,0px))}#carN .pan.glisse{transition:none}
#carN .poig{flex:none;height:24px;display:grid;place-items:center;touch-action:none}#carN .poig i{width:48px;height:5px;border-radius:3px;background:#d0c6b2}
#carN .hd{flex:none;display:flex;align-items:center;gap:12px;padding:0 16px 12px}
#carN .hd .ic{flex:none;width:52px;height:52px;border-radius:16px;display:grid;place-items:center}
#carN .hd .tt{flex:1;min-width:0}#carN .hd .tt b{display:block;font-size:24px;font-weight:800;line-height:1}#carN .hd .tt small{display:block;font-size:12.5px;font-weight:700;color:#8a7a5a;margin-top:2px}
#carN .x{flex:none;width:40px;height:40px;border-radius:50%;border:0;background:#fff;box-shadow:0 3px 0 #ddd3c0;font:800 16px 'Baloo 2',system-ui,sans-serif;color:#2a2016}
#carN .corps{flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch;touch-action:pan-y;padding:0 16px 16px;overscroll-behavior:contain;position:relative}
#carN .bas{flex:none;display:flex;gap:10px;padding:8px 16px calc(12px + env(safe-area-inset-bottom));border-top:1px solid #e6dccb;background:#f6f1e6}
#carN .bas button{height:54px;border:0;border-radius:18px;font:800 17px 'Baloo 2',system-ui,sans-serif}
#carN .fermeB{flex:1;background:#2a2016;color:#fff;box-shadow:0 4px 0 #000}
#carN .lb{font:800 12px 'Baloo 2',system-ui,sans-serif;letter-spacing:2px;color:#8a7a5a;margin:12px 2px 8px}
#carN .plan{position:relative;height:250px;border-radius:24px;overflow:hidden;box-shadow:0 3px 0 #ddd3c0;background:#7ab8d8}
#carN .plan canvas{position:absolute;inset:0;width:100%;height:100%}
#carN .pin{position:absolute;transform:translate(-50%,-100%);border:0;background:none;padding:0;display:flex;flex-direction:column;align-items:center;font-family:inherit}
#carN .pin span{background:#2a2016;color:#fff;border-radius:10px;padding:2px 9px;font:800 12px 'Baloo 2',system-ui,sans-serif;white-space:nowrap;box-shadow:0 2px 0 rgba(0,0,0,.25)}
#carN .pin i{width:0;height:0;border:6px solid transparent;border-top-color:#2a2016;margin-top:-1px}
#carN .pin.ici span{background:#e8b030;color:#2a2016}#carN .pin.ici i{border-top-color:#e8b030}
#carN .pin.ici:before{content:'';position:absolute;bottom:-10px;left:50%;width:22px;height:22px;margin-left:-11px;border-radius:50%;background:rgba(232,176,48,.45);animation:carP 1.4s infinite}
@keyframes carP{0%{transform:scale(.4);opacity:1}100%{transform:scale(2.2);opacity:0}}
#carN .li{display:flex;flex-direction:column;gap:10px}
#carN .lieu{display:flex;align-items:center;gap:12px;background:#fff;border-radius:20px;padding:10px 12px;box-shadow:0 3px 0 #ddd3c0}
#carN .lieu .vi{flex:none;width:56px;height:56px;border-radius:16px;display:grid;place-items:center;font-size:28px}
#carN .lieu .t{flex:1;min-width:0}#carN .lieu .t b{display:block;font-size:16.5px;font-weight:800;line-height:1.1}#carN .lieu .t small{display:block;font-size:12.5px;font-weight:700;color:#8a7a5a;line-height:1.25}
#carN .lieu .go{flex:none;height:44px;padding:0 16px;border:0;border-radius:14px;background:linear-gradient(#ffd86a,#f2b030);color:#3a2408;font:800 15px 'Baloo 2',system-ui,sans-serif;box-shadow:0 3px 0 #b8801a}
#carN .lieu.ici{box-shadow:0 0 0 3px #e8b030,0 3px 0 #c8902a}#carN .lieu.ici .go{background:#f2ecdf;color:#a89a84;box-shadow:none}`;
let RAC=null,HIST=false;
function fermer(depuisRetour){if(!RAC)return;window.ECRAN_COUVRANT=false;const R0=RAC;RAC=null;R0.classList.remove('on');setTimeout(()=>R0.remove(),280);
  removeEventListener('popstate',surRetour);removeEventListener('keydown',surTouche);if(HIST&&!depuisRetour){HIST=false;try{history.back();}catch(x){}}HIST=false;}
function surRetour(){fermer(true);}function surTouche(ev){if(ev.key==='Escape')fermer();}
/* la feuille : on la ferme par le gros bouton, la croix, le fond, un glissé vers le bas, Retour, Échap */
function feuille(css,cssId,tete){let st=document.getElementById(cssId);if(!st){st=document.createElement('style');st.id=cssId;document.head.appendChild(st);}st.textContent=css;
  const d=document.createElement('div');d.id='carN';RAC=d;
  d.innerHTML='<div class="pan"><div class="poig"><i></i></div><div class="hd">'+tete+'<button class="x" aria-label="Fermer">✕</button></div><div class="corps"></div><div class="bas"><button class="fermeB">Fermer la carte</button></div></div>';
  document.body.appendChild(d);requestAnimationFrame(()=>d.classList.add('on'));setTimeout(()=>{if(RAC===d)window.ECRAN_COUVRANT=true;},300);
  const fm=()=>{try{vibrer(8);}catch(x){}fermer();};d.querySelectorAll('.x,.fermeB').forEach(b=>b.onclick=fm);d.addEventListener('click',ev=>{if(ev.target===d)fm();});
  const pan=d.querySelector('.pan'),poig=d.querySelector('.poig');let y0=null;
  poig.addEventListener('pointerdown',ev=>{y0=ev.clientY;pan.classList.add('glisse');try{poig.setPointerCapture(ev.pointerId);}catch(x){}});
  poig.addEventListener('pointermove',ev=>{if(y0==null)return;pan.style.setProperty('--dy',Math.max(0,ev.clientY-y0)+'px');});
  const fin=ev=>{if(y0==null)return;const dy=ev.clientY-y0;y0=null;pan.classList.remove('glisse');pan.style.setProperty('--dy','0px');if(dy>80)fm();};poig.addEventListener('pointerup',fin);poig.addEventListener('pointercancel',fin);
  try{history.pushState({ecran:'carN'},'');HIST=true;}catch(x){}addEventListener('popstate',surRetour);addEventListener('keydown',surTouche);return d;}

const vib=x=>{try{vibrer(x);}catch(_){}};
const V=()=>window.MA_VERSION?('&v='+encodeURIComponent(window.MA_VERSION)):'';
/* les lieux : où ils sont sur le plan (en %), où ils mènent */
const LIEUX=[
 {k:'place',n:'Place de la Joliette',d:'La fontaine, le kiosque (journal et vacations), les affiches',ic:'⛲',c:'#fff0c8',x:.56,y:.48,url:()=>'spawn.html?t='+Date.now()+V()},
 {k:'galerie',n:'La Galerie Bleue',d:'Les boutiques, Bleu de Chauffe',ic:'🛍️',c:'#dce8ff',x:.62,y:.24,url:()=>'terrasses.html?de=place&t='+Date.now()+V()},
 {k:'piste',n:'La piste',d:'Le stade d’athlétisme : 100, 400, 800 m',ic:'🏃',c:'#ffe0d0',x:.38,y:.62,url:()=>'piste.html?t='+Date.now()+V()},
 {k:'foire',n:'La fête foraine',d:'Grande roue, chamboule-tout, tir, pêche aux canards',ic:'🎡',c:'#e8dcff',x:.72,y:.70,url:()=>'foire.html?t='+Date.now()+V()}];
function ici(){try{if(window.LIEU_PAGE==='terrasses')return 'galerie';if(CARTE==='extramar')return 'port';if(CARTE==='spawn'&&!window.LIEU_PAGE)return 'place';if(window.LIEU_PAGE==='piste')return 'piste';if(window.LIEU_PAGE==='foire')return 'foire';}catch(x){}return '';}
function plan(cv){const box=cv.parentNode,D=Math.max(1,Math.round(window.devicePixelRatio||2)),W=box.clientWidth,H=box.clientHeight;cv.width=W*D;cv.height=H*D;const g=cv.getContext('2d');g.setTransform(D,0,0,D,0,0);
  /* la mer et ses vaguelettes */
  g.fillStyle='#7ab8d8';g.fillRect(0,0,W,H);g.fillStyle='rgba(255,255,255,.35)';for(let i=0;i<60;i++){const x=(i*73)%W,y=(i*37)%H;g.fillRect(x,y,8,1.5);}
  /* la terre : la ville au nord-est, le port en bas à gauche */
  g.fillStyle='#efe2c4';g.beginPath();g.moveTo(W*.18,0);g.lineTo(W,0);g.lineTo(W,H);g.lineTo(W*.52,H);g.lineTo(W*.5,H*.86);g.lineTo(W*.4,H*.86);g.lineTo(W*.38,H*.56);g.lineTo(W*.2,H*.5);g.lineTo(W*.12,H*.3);g.closePath();g.fill();
  g.strokeStyle='#d8c8a4';g.lineWidth=3;g.stroke();
  /* les quais et les jetées du port */
  g.fillStyle='#d8ccb4';g.fillRect(W*.08,H*.62,W*.3,H*.08);g.fillRect(W*.14,H*.78,W*.26,H*.06);g.fillRect(W*.04,H*.9,W*.36,H*.05);
  const C=['#c8402e','#2a5a8a','#3a7a4a','#c8a040'];for(let i=0;i<10;i++){g.fillStyle=C[i%4];g.fillRect(W*.1+i*W*.025,H*.635,W*.02,H*.03);}
  /* les rues de la ville */
  g.strokeStyle='#fff';g.lineWidth=5;g.lineCap='round';g.beginPath();g.moveTo(W*.4,H*.62);g.lineTo(W*.56,H*.5);g.lineTo(W*.62,H*.26);g.moveTo(W*.56,H*.5);g.lineTo(W*.95,H*.42);g.moveTo(W*.3,H*.2);g.lineTo(W*.95,H*.16);g.stroke();
  /* la place ronde, la galerie */
  g.fillStyle='#e6d6b0';g.beginPath();g.arc(W*.56,H*.5,18,0,7);g.fill();g.fillStyle='#7ab8d8';g.beginPath();g.arc(W*.56,H*.5,6,0,7);g.fill();
  g.fillStyle='#1d4a8a';g.fillRect(W*.55,H*.16,W*.16,H*.1);g.fillStyle='#4a7ad8';g.fillRect(W*.55,H*.16,W*.16,H*.025);
  /* des toits et des arbres */
  for(let i=0;i<14;i++){const x=W*(.68+((i*7)%10)/40),y=H*(.3+((i*3)%7)/18);g.fillStyle=i%3?'#d8805a':'#c86a4a';g.fillRect(x,y,12,9);}
  for(let i=0;i<8;i++){g.fillStyle='#5a9a5a';g.beginPath();g.arc(W*(.42+i*.03),H*(.36+(i%2)*.04),5,0,7);g.fill();}
  /* Notre-Dame au loin, en haut à gauche */
  g.fillStyle='#c8b890';g.fillRect(W*.22,H*.08,10,16);g.fillStyle='#e8c06a';g.fillRect(W*.22+3,H*.08-7,4,7);
  g.fillStyle='rgba(42,32,22,.55)';g.font='800 10px "Baloo 2",system-ui,sans-serif';g.fillText('LA MÉDITERRANÉE',10,H-10);}
function aller(L){if(L.k===ici())return;vib([10,40,10]);try{sauver();}catch(x){}
  const v=document.createElement('div');v.style.cssText='position:fixed;inset:0;z-index:2147483000;background:#2a2016;color:#f2d27a;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;font:800 22px "Baloo 2",system-ui,sans-serif;opacity:0;transition:opacity .3s';
  v.innerHTML='<div style="font-size:44px">'+L.ic+'</div>'+L.n;document.body.appendChild(v);requestAnimationFrame(()=>v.style.opacity='1');setTimeout(()=>location.href=L.url(),650);}
function peindre(){if(!RAC)return;const C=RAC.querySelector('.corps'),i=ici();
  C.innerHTML='<div class="plan"><canvas></canvas>'+LIEUX.map(L=>'<button class="pin'+(L.k===i?' ici':'')+'" data-k="'+L.k+'" style="left:'+(L.x*100)+'%;top:'+(L.y*100)+'%"><span>'+(L.k===i?'Tu es ici':L.n)+'</span><i></i></button>').join('')+'</div>'+
    '<div class="lb">ALLER À</div><div class="li">'+LIEUX.map(L=>'<div class="lieu'+(L.k===i?' ici':'')+'"><span class="vi" style="background:'+L.c+'">'+L.ic+'</span><span class="t"><b>'+L.n+'</b><small>'+L.d+'</small></span><button class="go" data-k="'+L.k+'">'+(L.k===i?'Tu es ici':'Y aller')+'</button></div>').join('')+'</div>';
  plan(C.querySelector('.plan canvas'));
  C.querySelectorAll('[data-k]').forEach(b=>b.onclick=()=>aller(LIEUX.find(L=>L.k===b.dataset.k)));}
window.ouvrirCarteNeuve=function(){if(RAC)return;feuille(CSS,'carNCss','<span class="ic" style="background:#dcf4e0">🗺️</span><span class="tt"><b>Carte</b><small>où aller</small></span>');peindre();};
})();
