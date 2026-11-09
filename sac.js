/* =====================================================================
   LE SAC — refait pour le nouveau jeu.
   Une vraie grille d'inventaire : des cases, chaque objet en pixel art
   avec son nombre ; on touche une case pour la fiche de l'objet. Les
   outils à part, en haut. La charge en points de couture.
   Un écran à part, chargé à la demande par moteur.js (eval direct) :
   il voit e, OBJETS, ICONES, sacNom, completerLesIcones, vibrer.
   ===================================================================== */
(()=>{
const CSS=`#sacN{position:fixed;inset:0;z-index:2147482100;display:flex;flex-direction:column;background:#f6f1e6;color:#2a2016;font-family:'Baloo 2',system-ui,sans-serif;user-select:none;-webkit-user-select:none;-webkit-tap-highlight-color:transparent;transform:translateY(100%);transition:transform .28s cubic-bezier(.2,.8,.2,1)}
#sacN.on{transform:none}#sacN *{box-sizing:border-box}#sacN svg{display:block}
#sacN .hd{flex:none;display:flex;align-items:center;gap:12px;padding:calc(env(safe-area-inset-top,0px) + 14px) 16px 10px}
#sacN .hd .ic{flex:none;width:52px;height:52px;border-radius:16px;background:#ffe2c0;display:grid;place-items:center;box-shadow:0 3px 0 #e8c8a0}
#sacN .hd .tt{flex:1;min-width:0}#sacN .hd .tt b{display:block;font-size:24px;font-weight:800;line-height:1}
#sacN .hd .tt small{display:block;font-size:12.5px;font-weight:700;color:#8a7a5a;margin-top:2px}
#sacN .x{flex:none;width:40px;height:40px;border-radius:50%;border:0;background:#fff;box-shadow:0 3px 0 #ddd3c0;font:800 16px 'Baloo 2',system-ui,sans-serif;color:#2a2016}
#sacN .ch{flex:none;margin:0 16px 12px;display:flex;align-items:center;gap:10px}
#sacN .ch .bar{flex:1;height:14px;border-radius:7px;background:#e6dccb;position:relative;overflow:hidden;box-shadow:inset 0 2px 0 rgba(0,0,0,.06)}
#sacN .ch .bar i{position:absolute;left:0;top:0;bottom:0;border-radius:7px;background:linear-gradient(#f2b860,#e08a2a)}
#sacN .ch .bar i.plein{background:linear-gradient(#f07a6a,#d8402a)}
#sacN .ch .bar:after{content:'';position:absolute;left:6px;right:6px;top:6px;border-top:2px dashed rgba(255,255,255,.55)}
#sacN .ch b{flex:none;font-size:15px;font-weight:800}#sacN .ch b small{font-size:12px;color:#8a7a5a}
#sacN .corps{flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch;touch-action:pan-y;padding:0 16px calc(24px + env(safe-area-inset-bottom));overscroll-behavior:contain}
#sacN .lb{font:800 12px 'Baloo 2',system-ui,sans-serif;letter-spacing:2px;color:#8a7a5a;margin:6px 2px 8px}
#sacN .outils{display:flex;gap:8px;overflow-x:auto;padding-bottom:4px;margin-bottom:10px;scrollbar-width:none}#sacN .outils::-webkit-scrollbar{display:none}
#sacN .outils span{flex:none;display:flex;align-items:center;gap:6px;background:#fff;border-radius:14px;padding:6px 12px 6px 8px;box-shadow:0 3px 0 #ddd3c0;font-size:13.5px;font-weight:800}
#sacN .grille{display:grid;grid-template-columns:repeat(4,1fr);gap:8px}
#sacN .case{position:relative;aspect-ratio:1;border:0;border-radius:18px;background:#fff;box-shadow:0 3px 0 #ddd3c0;display:grid;place-items:center;padding:0;font-family:inherit}
#sacN .case:active{transform:translateY(2px);box-shadow:0 1px 0 #ddd3c0}
#sacN .case.vide{background:#efe8da;box-shadow:inset 0 2px 0 rgba(0,0,0,.05)}
#sacN .case.on{box-shadow:0 0 0 3px #e8a040,0 3px 0 #c8802a}
#sacN .case u{position:absolute;right:5px;bottom:5px;min-width:22px;height:20px;border-radius:10px;background:#2a2016;color:#fff;font:800 12px/20px 'Baloo 2',system-ui,sans-serif;text-align:center;padding:0 6px;text-decoration:none}
#sacN .case .em{font-size:30px}
#sacN .fiche{position:fixed;left:12px;right:12px;bottom:calc(14px + env(safe-area-inset-bottom));z-index:3;background:#2a2016;color:#fff;border-radius:22px;padding:14px;display:flex;gap:14px;align-items:center;box-shadow:0 12px 30px rgba(0,0,0,.35);transform:translateY(calc(100% + 60px));visibility:hidden;transition:transform .22s cubic-bezier(.2,.8,.2,1)}
#sacN .fiche.on{transform:none;visibility:visible}
#sacN .fiche .gi{flex:none;width:72px;height:72px;border-radius:18px;background:#fff7e8;display:grid;place-items:center}
#sacN .fiche .tx{flex:1;min-width:0}#sacN .fiche .tx b{display:block;font-size:18px;font-weight:800;line-height:1.1}
#sacN .fiche .tx p{margin:3px 0 6px;font-size:13px;font-weight:600;line-height:1.3;color:#d8ccb4}
#sacN .fiche .tx span{display:inline-block;font-size:12px;font-weight:800;background:rgba(255,255,255,.12);border-radius:8px;padding:1px 8px;margin-right:4px}
#sacN .fiche .ff{position:absolute;top:6px;right:6px;width:40px;height:40px;border-radius:50%;border:0;background:rgba(255,255,255,.1);color:#d8ccb4;font:800 16px 'Baloo 2',system-ui,sans-serif}
#sacN .fiche .tx{padding-right:30px}
#sacN .vide2{text-align:center;padding:30px 20px 10px;color:#8a7a5a;font-weight:700;font-size:15px;line-height:1.4}
#sacN .vide2 svg{margin:0 auto 10px}`;
const CSS_V={
/* A — LA DEMI-FEUILLE : le jeu reste visible en haut ; on ferme en touchant le jeu, en glissant vers le bas, ou avec le gros bouton */
A:`#sacN{background:rgba(10,14,20,.45);transform:none!important;opacity:0;transition:opacity .2s}#sacN.on{opacity:1}
#sacN .pan{position:absolute;left:0;right:0;bottom:0;height:72%;background:#f6f1e6;border-radius:26px 26px 0 0;display:flex;flex-direction:column;transform:translateY(100%);transition:transform .26s cubic-bezier(.2,.8,.2,1);box-shadow:0 -10px 30px rgba(0,0,0,.3)}
#sacN.on .pan{transform:translateY(var(--dy,0px))}#sacN .pan.glisse{transition:none}
#sacN .poig{flex:none;height:26px;display:grid;place-items:center;touch-action:none}#sacN .poig i{width:48px;height:5px;border-radius:3px;background:#d0c6b2}
#sacN .hd{padding-top:0}
#sacN .bas{flex:none;padding:8px 16px calc(12px + env(safe-area-inset-bottom));background:#f6f1e6;border-top:1px solid #e6dccb}
#sacN .ferme{width:100%;height:54px;border:0;border-radius:18px;background:#2a2016;color:#fff;font:800 17px 'Baloo 2',system-ui,sans-serif;box-shadow:0 4px 0 #000}
#sacN .fiche{bottom:calc(82px + env(safe-area-inset-bottom))}`,
/* B — LA LISTE : plein écran, de grandes lignes lisibles (icône, nom, nombre), le bouton Fermer sous le pouce */
B:`#sacN .grille{display:flex;flex-direction:column;gap:8px}
#sacN .case{aspect-ratio:auto;height:64px;display:flex;align-items:center;justify-content:flex-start;gap:12px;padding:0 14px 0 10px;text-align:left}
#sacN .case.vide{display:none}#sacN .case .nm{flex:1;min-width:0;font-size:16px;font-weight:800;color:#2a2016;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#sacN .case .bx{flex:none;width:48px;height:48px;border-radius:14px;background:#f6f1e6;display:grid;place-items:center}
#sacN .case u{position:static;height:28px;min-width:40px;line-height:28px;font-size:15px;border-radius:14px}
#sacN .hd .x{display:none}
#sacN .bas{flex:none;padding:8px 16px calc(12px + env(safe-area-inset-bottom));background:linear-gradient(transparent,#f6f1e6 30%)}
#sacN .ferme{width:100%;height:56px;border:0;border-radius:18px;background:#e8c06a;color:#2a2016;font:800 18px 'Baloo 2',system-ui,sans-serif;box-shadow:0 4px 0 #b8902a}
#sacN .fiche{bottom:calc(84px + env(safe-area-inset-bottom))}`,
/* C — LA BOÎTE : une carte au centre, le jeu autour ; une grande croix, on touche dehors pour fermer ; le nom sous chaque objet */
C:`#sacN{background:rgba(10,14,20,.55);transform:none!important;opacity:0;transition:opacity .2s;align-items:center;justify-content:center;padding:calc(env(safe-area-inset-top,0px) + 16px) 14px calc(env(safe-area-inset-bottom,0px) + 16px)}#sacN.on{opacity:1}
#sacN .pan{width:100%;max-width:440px;max-height:100%;background:#f6f1e6;border-radius:28px;display:flex;flex-direction:column;overflow:hidden;box-shadow:0 20px 50px rgba(0,0,0,.4);transform:scale(.92);transition:transform .25s cubic-bezier(.2,.8,.2,1)}#sacN.on .pan{transform:none}
#sacN .hd{padding-top:14px}#sacN .x{width:48px;height:48px;font-size:20px;background:#2a2016;color:#fff;box-shadow:0 3px 0 #000}
#sacN .corps{flex:1 1 auto;min-height:0}
#sacN .grille{grid-template-columns:repeat(3,1fr)}#sacN .case{aspect-ratio:auto;height:96px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px}
#sacN .case .nm{font-size:11.5px;font-weight:800;color:#6a5a40;max-width:92%;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#sacN .case u{top:6px;bottom:auto}
#sacN .fiche{position:absolute;left:10px;right:10px;bottom:10px}
#sacN .pan{position:relative}`};
const V=()=>window.SAC_V||'A';   /* A retenu ; B et C gardés pour mémoire */
const PIX_SAC=['.....aaaaaa.....','....a......a....','...bbbbbbbbbb...','..bccccccccccb..','.bccccccccccccb.','.bcddddddddddcb.','.bcdccccccccdcb.','.bcdccccccccdcb.','.bcddddffddddcb.','.bccccceecccccb.','.bccccccccccccb.','.bdddddddddddddb','.bccccccccccccb.','.bccccccccccccb.','..bbbbbbbbbbbb..','................'];
const PAL={a:'#5a3418',b:'#5a3418',c:'#e8923a',d:'#b8622a',e:'#5a3418',f:'#f2c94c'};
function sacSvg(t){let r='';PIX_SAC.forEach((l,y)=>[...l].forEach((c,x)=>{if(c!=='.')r+='<rect x="'+x+'" y="'+y+'" width="1" height="1" fill="'+PAL[c]+'"/>';}));return '<svg viewBox="0 0 16 16" width="'+t+'" height="'+t+'" shape-rendering="crispEdges">'+r+'</svg>';}
const ic=(k,t)=>{try{return ICONES[k]?'<svg viewBox="0 0 16 16" width="'+t+'" height="'+t+'" shape-rendering="crispEdges">'+ICONES[k]+'</svg>':'<span class="em">📦</span>';}catch(x){return '<span class="em">📦</span>';}};
const nom=k=>{try{return sacNom(k);}catch(x){return k;}};
const esc=s=>String(s||'').replace(/[<>&"]/g,c=>({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;'})[c]);
let RAC=null,SEL=null;
function fiche(k,n){const F=RAC.querySelector('.fiche'),O=(typeof OBJETS!=='undefined'&&OBJETS[k])||{};
  F.innerHTML='<button class="ff">✕</button><span class="gi">'+ic(k,56)+'</span><span class="tx"><b>'+esc(nom(k))+'</b>'+(O.d?'<p>'+esc(O.d)+'</p>':'<p></p>')+'<span>× '+n+'</span>'+(O.poids>1?'<span>'+(O.poids*n)+' kg</span>':'')+'</span>';
  F.classList.add('on');F.querySelector('.ff').onclick=()=>{F.classList.remove('on');SEL=null;RAC.querySelectorAll('.case.on').forEach(c=>c.classList.remove('on'));};}
function remplir(){try{completerLesIcones();}catch(x){}
  const tout=Object.entries(e.sac||{}).filter(([k,v])=>+v>0);
  const outil=k=>typeof OBJETS!=='undefined'&&OBJETS[k]&&OBJETS[k].outil;
  const objets=tout.filter(([k])=>!outil(k)).sort((a,b)=>(b[1]-a[1])||nom(a[0]).localeCompare(nom(b[0]))),outils=tout.filter(([k])=>outil(k));
  const charge=tout.reduce((t,[,v])=>t+(+v||0),0),max=e.sacMax||60,p=Math.max(0,Math.min(1,charge/Math.max(1,max)));
  RAC.querySelector('.hd .tt small').textContent=objets.length?objets.length+' sorte'+(objets.length>1?'s':'')+' d’objet'+(objets.length>1?'s':''):'rien pour l’instant';
  RAC.querySelector('.ch').innerHTML='<span class="bar"><i class="'+(p>=.9?'plein':'')+'" style="width:'+Math.round(p*100)+'%"></i></span><b>'+charge+'<small> / '+max+'</small></b>';
  let h='';
  if(outils.length)h+='<div class="lb">TES OUTILS</div><div class="outils">'+outils.map(([k])=>'<span>'+ic(k,22)+esc(nom(k))+'</span>').join('')+'</div>';
  if(!objets.length)h+='<div class="vide2">'+sacSvg(84)+'Ton sac est vide.<br>Pêche, ramasse, coupe, creuse :<br>tout ce que tu trouves arrive ici.</div>';
  else{const col=V()==='C'?3:4,nb=V()==='B'?0:Math.max(col*3,Math.ceil(objets.length/col)*col);h+='<div class="lb">DANS LE SAC</div><div class="grille">'+
    objets.map(([k,v])=>'<button class="case" data-k="'+esc(k)+'" data-n="'+v+'">'+(V()==='B'?'<span class="bx">'+ic(k,36)+'</span><span class="nm">'+esc(nom(k))+'</span>':ic(k,40)+(V()==='C'?'<span class="nm">'+esc(nom(k))+'</span>':''))+'<u>'+v+'</u></button>').join('')+
    Array.from({length:Math.max(0,nb-objets.length)},()=>'<span class="case vide"></span>').join('')+'</div>';}
  RAC.querySelector('.corps').innerHTML=h;
  RAC.querySelectorAll('.case[data-k]').forEach(b=>b.onclick=()=>{try{vibrer(6);}catch(x){}RAC.querySelectorAll('.case.on').forEach(c=>c.classList.remove('on'));b.classList.add('on');SEL=b.dataset.k;fiche(b.dataset.k,+b.dataset.n);});}
/* LA FERMETURE, À TOUTE ÉPREUVE : la croix, le gros bouton, toucher le fond, glisser vers le bas,
   le bouton Retour d'Android (on pose un pas dans l'historique), la touche Échap. */
let HIST=false;
function fermer(depuisRetour){if(!RAC)return;window.ECRAN_COUVRANT=false;const R0=RAC;RAC=null;R0.classList.remove('on');setTimeout(()=>R0.remove(),280);
  removeEventListener('popstate',surRetour);removeEventListener('keydown',surTouche);if(HIST&&!depuisRetour){HIST=false;try{history.back();}catch(x){}}HIST=false;}
function surRetour(){fermer(true);}
function surTouche(ev){if(ev.key==='Escape')fermer();}
window.ouvrirSacNeuf=function(){if(RAC)return;const v=V();
  let st=document.getElementById('sacNCss');if(!st){st=document.createElement('style');st.id='sacNCss';document.head.appendChild(st);}st.textContent=CSS+CSS_V[v];
  const d=document.createElement('div');d.id='sacN';RAC=d;
  const hd='<div class="hd"><span class="ic">'+sacSvg(36)+'</span><span class="tt"><b>Ton sac</b><small></small></span><button class="x" aria-label="Fermer le sac">✕</button></div><div class="ch"></div><div class="corps"></div>';
  const bas=v==='C'?'':'<div class="bas"><button class="ferme">'+(v==='A'?'Fermer le sac':'Refermer le sac')+'</button></div>';
  d.innerHTML=(v==='B'?hd+bas:'<div class="pan">'+(v==='A'?'<div class="poig"><i></i></div>':'')+hd+bas+'<div class="fiche"></div></div>')+(v==='B'?'<div class="fiche"></div>':'');
  document.body.appendChild(d);remplir();requestAnimationFrame(()=>d.classList.add('on'));setTimeout(()=>{if(RAC===d)window.ECRAN_COUVRANT=true;},300);
  const f=()=>{try{vibrer(8);}catch(x){}fermer();};
  d.querySelectorAll('.x,.ferme').forEach(b=>b.onclick=f);
  d.addEventListener('click',ev=>{if(ev.target===d)f();});
  /* glisser la feuille vers le bas (A) */
  const pan=d.querySelector('.pan'),poig=d.querySelector('.poig');
  if(poig&&pan){let y0=null;poig.addEventListener('pointerdown',ev=>{y0=ev.clientY;pan.classList.add('glisse');try{poig.setPointerCapture(ev.pointerId);}catch(x){}});
    poig.addEventListener('pointermove',ev=>{if(y0==null)return;pan.style.setProperty('--dy',Math.max(0,ev.clientY-y0)+'px');});
    const fin=ev=>{if(y0==null)return;const dy=ev.clientY-y0;y0=null;pan.classList.remove('glisse');pan.style.setProperty('--dy','0px');if(dy>80)f();};
    poig.addEventListener('pointerup',fin);poig.addEventListener('pointercancel',fin);}
  try{history.pushState({sac:1},'');HIST=true;}catch(x){}
  addEventListener('popstate',surRetour);addEventListener('keydown',surTouche);};
})();
