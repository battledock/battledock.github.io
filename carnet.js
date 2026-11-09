/* =====================================================================
   LE CARNET — refait pour le nouveau jeu (niveau, récompenses, coffres,
   titres). Même cadre que le Sac : une feuille qui monte, le jeu au-dessus,
   on ferme par le gros bouton, la croix, le fond, un glissé, ou Retour.
   Les données et les actions sont celles du jeu (NIV, reclamerNiveaux,
   ouvrirCoffre, echangerFragments, rpcNiv('titre_choisir')) : rien ne
   change côté serveur. Chargé à la demande par moteur.js (eval direct).
   Trois façons d'afficher les niveaux à l'essai : window.CARNET_V = A, B, C.
   ===================================================================== */
(()=>{
const CSS=`#crn{position:fixed;inset:0;z-index:2147482100;font-family:'Baloo 2',system-ui,sans-serif;color:#2a2016;user-select:none;-webkit-user-select:none;-webkit-tap-highlight-color:transparent;background:rgba(10,14,20,.45);opacity:0;transition:opacity .2s}
#crn.on{opacity:1}#crn *{box-sizing:border-box}#crn img,#crn canvas,#crn svg{image-rendering:pixelated}
#crn .pan{position:absolute;left:0;right:0;bottom:0;height:86%;background:#f6f1e6;border-radius:26px 26px 0 0;display:flex;flex-direction:column;transform:translateY(100%);transition:transform .26s cubic-bezier(.2,.8,.2,1);box-shadow:0 -10px 30px rgba(0,0,0,.3)}
#crn.on .pan{transform:translateY(var(--dy,0px))}#crn .pan.glisse{transition:none}
#crn .poig{flex:none;height:24px;display:grid;place-items:center;touch-action:none}#crn .poig i{width:48px;height:5px;border-radius:3px;background:#d0c6b2}
#crn .hd{flex:none;display:flex;align-items:center;gap:12px;padding:0 16px 10px}
#crn .hd .av{flex:none;width:58px;height:58px;border-radius:18px;background:#fff0c8;box-shadow:0 3px 0 #e8d098;position:relative;overflow:hidden}
#crn .hd .av canvas{position:absolute;left:50%;bottom:-14px;transform:translateX(-50%)}
#crn .hd .tt{flex:1;min-width:0}#crn .hd .tt b{display:block;font-size:24px;font-weight:800;line-height:1}#crn .hd .tt small{display:block;font-size:12.5px;font-weight:700;color:#8a7a5a;margin-top:2px}
#crn .x{flex:none;width:40px;height:40px;border-radius:50%;border:0;background:#fff;box-shadow:0 3px 0 #ddd3c0;font:800 16px 'Baloo 2',system-ui,sans-serif;color:#2a2016}
#crn .xp{flex:none;margin:0 16px 10px;display:flex;align-items:center;gap:10px}
#crn .xp .bar{flex:1;height:14px;border-radius:7px;background:#e6dccb;position:relative;overflow:hidden}#crn .xp .bar i{position:absolute;left:0;top:0;bottom:0;border-radius:7px;background:linear-gradient(#f2d070,#e0a628)}
#crn .xp b{flex:none;font-size:13px;font-weight:800;color:#6a5a40}
#crn .ong{flex:none;display:flex;gap:4px;margin:0 16px 10px;background:#ebe3d2;border-radius:14px;padding:4px}
#crn .ong button{flex:1;border:0;border-radius:11px;padding:7px 4px;background:none;font:800 14px 'Baloo 2',system-ui,sans-serif;color:#8a7a5a;position:relative}
#crn .ong button.on{background:#fff;color:#2a2016;box-shadow:0 2px 0 #ddd3c0}
#crn .ong button em{position:absolute;top:2px;right:8px;min-width:18px;height:18px;border-radius:9px;background:#d8402a;color:#fff;font:800 11px/18px 'Baloo 2',system-ui,sans-serif;font-style:normal}
#crn .corps{flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch;touch-action:pan-y;padding:2px 16px 16px;overscroll-behavior:contain;position:relative}
#crn .bas{flex:none;display:flex;gap:10px;padding:8px 16px calc(12px + env(safe-area-inset-bottom));border-top:1px solid #e6dccb;background:#f6f1e6}
#crn .bas button{height:54px;border:0;border-radius:18px;font:800 17px 'Baloo 2',system-ui,sans-serif}
#crn .fermeB{flex:1;background:#2a2016;color:#fff;box-shadow:0 4px 0 #000}
#crn .rec{flex:1.4;background:linear-gradient(#ffd86a,#f2b030);color:#3a2408;box-shadow:0 4px 0 #b8801a;animation:crnP 1.6s infinite}
@keyframes crnP{50%{transform:translateY(-2px)}}
#crn .lb{font:800 12px 'Baloo 2',system-ui,sans-serif;letter-spacing:2px;color:#8a7a5a;margin:10px 2px 8px}
#crn .rw{display:inline-flex;align-items:center;gap:5px;background:#f6f1e6;border-radius:10px;padding:2px 8px;font-size:12.5px;font-weight:800;margin:3px 4px 0 0}
#crn .go{border:0;border-radius:12px;padding:6px 14px;background:linear-gradient(#ffd86a,#f2b030);color:#3a2408;font:800 13.5px 'Baloo 2',system-ui,sans-serif;box-shadow:0 3px 0 #b8801a}
#crn .vide{text-align:center;padding:24px 10px;color:#8a7a5a;font-weight:700;line-height:1.4}
/* coffres */
#crn .cf{display:flex;align-items:center;gap:12px;background:#fff;border-radius:20px;padding:10px 12px;box-shadow:0 3px 0 #ddd3c0;margin-bottom:10px}
#crn .cf .cfA{flex:none;width:64px;height:56px;display:grid;place-items:center}#crn .cf .cfA svg{width:60px;height:auto}
#crn .cf .t{flex:1;min-width:0}#crn .cf .t b{display:block;font-size:16px;font-weight:800}#crn .cf .t small{font-size:12px;font-weight:700;color:#8a7a5a}
#crn .cf u{flex:none;text-decoration:none;font:800 15px 'Baloo 2',system-ui,sans-serif;color:#8a7a5a;margin-right:2px}
#crn .fr{background:#fff;border-radius:20px;padding:12px;box-shadow:0 3px 0 #ddd3c0;margin-top:4px}
#crn .fr .pt{display:flex;gap:5px;margin:8px 0}#crn .fr .pt i{flex:1;height:12px;border-radius:6px;background:#ebe3d2}#crn .fr .pt i.on{background:linear-gradient(#b89af8,#7a4ad8)}
#crn .fr b{font-size:15px;font-weight:800}#crn .fr small{font-size:12px;font-weight:700;color:#8a7a5a}
#crn .frB{display:flex;gap:8px;margin-top:8px}#crn .frB button{flex:1;border:0!important;box-shadow:none!important;outline:0;border-radius:14px;padding:8px 4px;background:#f6f1e6;font:800 12.5px 'Baloo 2',system-ui,sans-serif;color:#2a2016;display:flex;flex-direction:column;align-items:center}
#crn .frB button:disabled{opacity:.45}#crn .frB button i{font-style:normal;font-size:20px}
/* titres */
#crn .tis{display:grid;grid-template-columns:1fr 1fr;gap:8px}
#crn .ti{border:0;border-radius:16px;padding:12px 10px;background:#fff;box-shadow:0 3px 0 #ddd3c0;text-align:left;font-family:inherit;color:inherit}
#crn .ti b{display:block;font-size:15px;font-weight:800;line-height:1.15}#crn .ti small{font-size:11px;font-weight:800;letter-spacing:.5px;color:#a07a30}
#crn .ti.on{background:#2a2016;color:#fff;box-shadow:0 3px 0 #000}#crn .ti.on small{color:#f2c94c}
#crn .ti.ferme{background:#efe8da;box-shadow:none;color:#a89a84}#crn .ti.ferme small{color:#b0a080}
.zouv,#nivGagne,#motOuv{z-index:2147482600!important}
#crn *::after{content:none!important;display:none!important}`;
const CSS_V={
/* A — LE CHEMIN : une corde verticale, un nœud par niveau ; ta tête sur le tien */
A:`#crn .ch{position:relative;padding-left:4px}
#crn .ch:before{content:'';position:absolute;left:25px;top:10px;bottom:10px;border-left:3px dashed #d8c8a4}
#crn .nv{position:relative;display:flex;gap:12px;align-items:flex-start;padding:7px 0}
#crn .nv .nd{flex:none;position:relative;z-index:1;width:44px;height:44px;border-radius:50%;background:#fff;border:3px solid #d8c8a4;display:grid;place-items:center;font:800 16px 'Baloo 2',system-ui,sans-serif;color:#a89a84}
#crn .nv.fait .nd{background:#3a9a5a;border-color:#3a9a5a;color:#fff}
#crn .nv.dispo .nd{background:#f2b030;border-color:#c8801a;color:#3a2408;box-shadow:0 0 0 5px rgba(242,176,48,.25)}
#crn .nv.ici .nd{overflow:visible}#crn .nv .moi{position:absolute;right:-14px;top:-12px;width:30px;height:30px;border-radius:50%;background:#fff;border:2px solid #2a2016;overflow:hidden}#crn .nv .moi img{width:28px;height:28px}
#crn .nv .c{flex:1;min-width:0;background:#fff;border-radius:16px;padding:8px 10px;box-shadow:0 2px 0 #ddd3c0}
#crn .nv.fait .c{background:transparent;box-shadow:none;padding:4px 2px;opacity:.6}
#crn .nv.ferme .c{background:#faf6ee}
#crn .nv .c b{display:block;font-size:15px;font-weight:800;line-height:1.15}#crn .nv .c small{font-size:11.5px;font-weight:800;color:#a89a84}
#crn .nv.pal .c{background:linear-gradient(#fff6dc,#ffe8a8);box-shadow:0 3px 0 #e0c070}
#crn .nv .cof{float:right;width:46px;margin:-2px -2px 0 6px}#crn .nv .cof svg{width:46px;height:auto}
#crn .nv .c .go{margin-top:6px}`,
/* B — LES CARTES : on fait défiler les niveaux de côté, une grande carte par niveau */
B:`#crn .car{display:flex;gap:12px;overflow-x:auto;scroll-snap-type:x mandatory;margin:0 -16px;padding:6px 16px 14px;scrollbar-width:none;touch-action:pan-x pan-y}#crn .car::-webkit-scrollbar{display:none}
#crn .cd{flex:none;width:76%;scroll-snap-align:center;border-radius:24px;background:#fff;box-shadow:0 4px 0 #ddd3c0;padding:14px;min-height:250px;display:flex;flex-direction:column;position:relative}
#crn .cd .n{font:800 12px 'Baloo 2',system-ui,sans-serif;letter-spacing:2px;color:#a89a84}#crn .cd h4{margin:2px 0 8px;font-size:21px;font-weight:800;line-height:1.1}
#crn .cd .cof{align-self:center;margin:4px 0}#crn .cd .cof svg{width:96px;height:auto}
#crn .cd .rs{flex:1}#crn .cd .rs .rw{display:flex;margin:0 0 5px;padding:6px 10px;border-radius:12px;font-size:13.5px}
#crn .cd .et{margin-top:8px;text-align:center;font:800 13px 'Baloo 2',system-ui,sans-serif;color:#a89a84}
#crn .cd.fait{opacity:.6}#crn .cd.fait .et{color:#3a9a5a}
#crn .cd.dispo{background:linear-gradient(#fff6dc,#ffe8a8);box-shadow:0 4px 0 #e0c070}#crn .cd.dispo .go{width:100%;padding:10px}
#crn .cd.ici:before{content:'TU ES ICI';position:absolute;top:12px;right:12px;background:#2a2016;color:#f2c94c;font:800 10px 'Baloo 2',system-ui,sans-serif;letter-spacing:1px;border-radius:8px;padding:2px 8px}
#crn .pts{display:flex;justify-content:center;gap:4px;margin-top:-4px}#crn .pts i{width:6px;height:6px;border-radius:3px;background:#d8c8a4}#crn .pts i.on{width:18px;background:#2a2016}
#crn .resume{display:flex;gap:10px;margin-top:6px}#crn .resume div{flex:1;background:#fff;border-radius:18px;padding:10px 12px;box-shadow:0 3px 0 #ddd3c0}#crn .resume b{display:block;font-size:20px;font-weight:800;line-height:1}#crn .resume small{font-size:11.5px;font-weight:700;color:#8a7a5a}`,
/* C — LE PROCHAIN CADEAU : ce qui t'attend en grand, puis à réclamer, à venir, déjà pris */
C:`#crn .pro{border-radius:26px;padding:16px;background:linear-gradient(150deg,#2a2016,#4a3420);color:#fff;position:relative;overflow:hidden;box-shadow:0 8px 20px rgba(40,20,0,.25)}
#crn .pro .n{font:800 12px 'Baloo 2',system-ui,sans-serif;letter-spacing:2px;color:#f2c94c}#crn .pro h4{margin:2px 0 8px;font-size:24px;font-weight:800;line-height:1.05}
#crn .pro .rw{background:rgba(255,255,255,.12);color:#fff}
#crn .pro .cof{position:absolute;right:10px;top:12px}#crn .pro .cof svg{width:80px;height:auto}
#crn .pro .reste{margin-top:12px;font-size:13px;font-weight:700;color:#d8ccb4}#crn .pro .reste b{color:#f2c94c}
#crn .li{display:flex;flex-direction:column;gap:8px}
#crn .lg{display:flex;align-items:center;gap:10px;background:#fff;border-radius:16px;padding:9px 12px;box-shadow:0 2px 0 #ddd3c0}
#crn .lg .nd{flex:none;width:38px;height:38px;border-radius:12px;background:#f6f1e6;display:grid;place-items:center;font:800 15px 'Baloo 2',system-ui,sans-serif;color:#8a7a5a}
#crn .lg.dispo{background:linear-gradient(#fff6dc,#ffe8a8);box-shadow:0 2px 0 #e0c070}#crn .lg.dispo .nd{background:#f2b030;color:#3a2408}
#crn .lg .t{flex:1;min-width:0}#crn .lg .t b{display:block;font-size:15px;font-weight:800;line-height:1.15}#crn .lg .t small{display:block;font-size:12px;font-weight:700;color:#8a7a5a;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#crn .lg .cof svg{width:38px;height:auto}
#crn .pris{margin-top:12px;width:100%;border:0;border-radius:14px;padding:10px;background:#ebe3d2;font:800 13.5px 'Baloo 2',system-ui,sans-serif;color:#6a5a40}`};
const V=()=>window.CARNET_V||'A';
const esc=s=>String(s||'').replace(/[<>&"]/g,c=>({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;'})[c]);
const f=n=>(+n||0).toLocaleString('fr-FR');
let RAC=null,ONG='niv',HIST=false;
const tx=r=>{try{return nivTexte(r);}catch(x){return r.nom||r.k||r.t;}};
const icR=r=>{try{return NIV_IC[r.t]||'🎁';}catch(x){return '🎁';}};
const cofSvg=k=>{try{return nivCoffreSVG(k);}catch(x){return '🎁';}};
const recs=p=>{try{return nivRecompenses(p);}catch(x){return (p.recompenses||[]).slice();}};
const xpPour=n=>{try{return nivXpPour(n);}catch(x){return 0;}};
function etat(){const N=NIV&&NIV.niveau,niv=N?N.niveau:1,rec=(NIV&&NIV.reclames)||[],pal=(NIV&&NIV.paliers)||[];
  const dispo=pal.filter(p=>p.niveau<=niv&&!rec.includes(p.niveau)).map(p=>p.niveau);return {N,niv,rec,pal,dispo};}
function tete(){try{return teteDe({ap:e.ap,pseudo:e.pseudo}).toDataURL();}catch(x){return '';}}
function enPied(){const c=document.createElement('canvas'),D=2;c.width=48*D;c.height=70*D;c.style.width='48px';c.style.height='70px';const g=c.getContext('2d');g.imageSmoothingEnabled=false;g.scale(D,D);try{personne(g,24,66,Object.assign({},e.ap,{_pnj:true}),'bas',0,false);}catch(x){}return c;}
const chips=p=>recs(p).map(r=>'<span class="rw">'+icR(r)+' '+esc(tx(r))+'</span>').join('');
/* ---------- l'onglet NIVEAUX, en trois façons ---------- */
function niveauxA(S){let h='<div class="ch">';const t=tete();
  for(const p of S.pal){const n=p.niveau,fait=S.rec.includes(n),dsp=!fait&&n<=S.niv,ici=n===S.niv,pal=!!(p.coffre&&n%5===0);
    h+='<div class="nv '+(fait?'fait':dsp?'dispo':'ferme')+(ici?' ici':'')+(pal?' pal':'')+'" id="crn'+n+'"><span class="nd">'+(fait?'✓':n)+(ici?'<span class="moi"><img src="'+t+'" alt=""></span>':'')+'</span>'+
      '<div class="c">'+(pal?'<span class="cof">'+cofSvg(p.coffre)+'</span>':'')+'<b>'+esc(p.nom)+'</b><small>NIVEAU '+n+(fait?' · PRIS':dsp?' · À RÉCLAMER':' · À '+f(xpPour(n))+' XP')+'</small><div>'+chips(p)+'</div>'+
      (dsp?'<button class="go" data-rec="'+n+'">Réclamer</button>':'')+'</div></div>';}
  return h+'</div>';}
function niveauxB(S){const c=S.pal.map(p=>{const n=p.niveau,fait=S.rec.includes(n),dsp=!fait&&n<=S.niv,ici=n===S.niv;
    return '<div class="cd '+(fait?'fait':dsp?'dispo':'ferme')+(ici?' ici':'')+'" id="crn'+n+'"><div class="n">NIVEAU '+n+'</div><h4>'+esc(p.nom)+'</h4>'+(p.coffre?'<span class="cof">'+cofSvg(p.coffre)+'</span>':'')+
      '<div class="rs">'+recs(p).map(r=>'<span class="rw">'+icR(r)+' '+esc(tx(r))+'</span>').join('')+'</div>'+
      (dsp?'<button class="go" data-rec="'+n+'">Réclamer</button>':'<div class="et">'+(fait?'✓ Déjà pris':'🔒 À '+f(xpPour(n))+' XP')+'</div>')+'</div>';}).join('');
  const prochain=S.pal.find(p=>p.niveau>S.niv);
  return '<div class="car">'+c+'</div><div class="resume"><div><b>'+S.rec.length+' / '+S.pal.length+'</b><small>niveaux réclamés</small></div><div><b>'+(prochain?prochain.niveau:'—')+'</b><small>prochain : '+(prochain?esc(prochain.nom):'tout est pris')+'</small></div></div>';}
function niveauxC(S){const pro=S.pal.find(p=>p.niveau>S.niv);let h='';
  if(pro){const reste=Math.max(0,(S.N.pour||0)-(S.N.dans||0));
    h+='<div class="pro">'+(pro.coffre?'<span class="cof">'+cofSvg(pro.coffre)+'</span>':'')+'<div class="n">PROCHAIN CADEAU · NIVEAU '+pro.niveau+'</div><h4>'+esc(pro.nom)+'</h4><div>'+chips(pro)+'</div><div class="reste">Encore <b>'+f(reste)+' XP</b> pour l’avoir.</div></div>';}
  const dsp=S.pal.filter(p=>S.dispo.includes(p.niveau));
  if(dsp.length)h+='<div class="lb">À RÉCLAMER</div><div class="li">'+dsp.map(p=>'<div class="lg dispo"><span class="nd">'+p.niveau+'</span><span class="t"><b>'+esc(p.nom)+'</b><small>'+recs(p).map(tx).map(esc).join(' · ')+'</small></span><button class="go" data-rec="'+p.niveau+'">Prendre</button></div>').join('')+'</div>';
  const av=S.pal.filter(p=>p.niveau>S.niv).slice(pro?1:0,6);
  if(av.length)h+='<div class="lb">ENSUITE</div><div class="li">'+av.map(p=>'<div class="lg"><span class="nd">'+p.niveau+'</span><span class="t"><b>'+esc(p.nom)+'</b><small>'+recs(p).map(tx).map(esc).join(' · ')+'</small></span>'+(p.coffre?'<span class="cof">'+cofSvg(p.coffre)+'</span>':'')+'</div>').join('')+'</div>';
  h+='<button class="pris" data-pris>Voir les '+S.rec.length+' niveaux déjà pris</button><div class="li" data-pl style="display:none;margin-top:8px">'+S.pal.filter(p=>S.rec.includes(p.niveau)).reverse().map(p=>'<div class="lg" style="opacity:.6"><span class="nd">✓</span><span class="t"><b>'+esc(p.nom)+'</b><small>Niveau '+p.niveau+'</small></span></div>').join('')+'</div>';
  return h;}
/* ---------- COFFRES et TITRES ---------- */
const COF_O=['legendaire','bonne','malle','bois'],COF_D={bois:'3 objets',malle:'4 objets · un rare garanti',bonne:'5 objets · un légendaire garanti',legendaire:'5 objets · deux légendaires garantis'};
function coffres(){const C=(NIV&&NIV.coffres)||{},fr=(NIV&&NIV.fragments)||0,L=COF_O.filter(k=>C[k]>0);let h='';
  h+=L.length?L.map(k=>'<div class="cf"><span class="cfA">'+cofSvg(k)+'</span><span class="t"><b>'+esc((NIV_COF&&NIV_COF[k])||k)+'</b><small>'+COF_D[k]+'</small></span><u>×'+C[k]+'</u><button class="go" data-cof="'+k+'">Ouvrir</button></div>').join('')
    :'<div class="vide">Pas de coffre à ouvrir.<br>Tu en gagnes en réclamant tes niveaux.</div>';
  const fp=Math.min(10,fr);
  h+='<div class="fr"><b>Fragments</b> <small>'+fr+' / 10</small><div class="pt">'+'<i class="on"></i>'.repeat(fp)+'<i></i>'.repeat(10-fp)+'</div><small>'+(fr>=10?'Choisis ton objet légendaire :':'À 10, tu choisis un objet légendaire :')+'</small>'+
    '<div class="frB">'+[['sac','🎒','Sac +5'],['tresor','👑','Trésor'],['bonne','🎁','Bonne Mère']].map(([k,i,t])=>'<button data-fr="'+k+'"'+(fr>=10?'':' disabled')+'><i>'+i+'</i>'+t+'</button>').join('')+'</div></div>';
  return h;}
function titres(S){const mes=(NIV&&NIV.titres)||[];const tous=S.pal.flatMap(p=>(p.recompenses||[]).filter(r=>r.t==='titre').map(r=>({t:r.k,n:p.niveau})));
  return '<div class="lb">TON TITRE S’AFFICHE SOUS TON NOM</div><div class="tis">'+tous.map(o=>{const a=mes.includes(o.t),on=NIV&&NIV.titre===o.t;
    return '<button class="ti'+(on?' on':'')+(a?'':' ferme')+'" data-ti="'+(a?esc(o.t):'')+'"><small>'+(on?'PORTÉ':a?'TOUCHER POUR PORTER':'🔒 NIVEAU '+o.n)+'</small><b>'+esc(o.t)+'</b></button>';}).join('')+'</div>';}
/* ---------- le dessin de l'écran ---------- */
function peindre(){if(!RAC)return;const S=etat(),C=RAC.querySelector('.corps');
  const nCof=Object.values((NIV&&NIV.coffres)||{}).reduce((t,n)=>t+(n||0),0);
  RAC.querySelector('.hd .tt b').textContent='Niveau '+S.niv;
  RAC.querySelector('.hd .tt small').textContent=((NIV&&NIV.titre)?NIV.titre+' · ':'')+(S.N?'encore '+f(Math.max(0,S.N.pour-S.N.dans))+' XP':'…');
  RAC.querySelector('.xp').innerHTML=S.N?'<span class="bar"><i style="width:'+Math.round(Math.min(1,S.N.dans/Math.max(1,S.N.pour))*100)+'%"></i></span><b>'+f(S.N.dans)+' / '+f(S.N.pour)+' XP</b>':'';
  RAC.querySelector('.ong').innerHTML=[['niv','Niveaux',S.dispo.length],['cof','Coffres',nCof],['ti','Titres',0]].map(([k,t,b])=>'<button data-o="'+k+'"'+(ONG===k?' class="on"':'')+'>'+t+(b?'<em>'+b+'</em>':'')+'</button>').join('');
  if(!S.N)C.innerHTML='<div class="vide">On ouvre ton carnet…</div>';
  else if(ONG==='cof')C.innerHTML=coffres();
  else if(ONG==='ti')C.innerHTML=titres(S);
  else C.innerHTML=V()==='B'?niveauxB(S):V()==='C'?niveauxC(S):niveauxA(S);
  /* le bas : réclamer tout si quelque chose attend */
  const B=RAC.querySelector('.bas'),r=B.querySelector('.rec');
  if(S.dispo.length&&ONG==='niv'){if(!r){const b=document.createElement('button');b.className='rec';B.appendChild(b);b.onclick=()=>{const S2=etat();try{vibrer([10,30,10]);}catch(x){}reclamerNiveaux(S2.dispo);};}B.querySelector('.rec').textContent='🎁 Tout réclamer ('+S.dispo.length+')';}
  else if(r)r.remove();
  RAC.querySelectorAll('.ong button').forEach(b=>b.onclick=()=>{ONG=b.dataset.o;try{vibrer(6);}catch(x){}peindre();C.scrollTop=0;});
  C.querySelectorAll('[data-rec]').forEach(b=>b.onclick=()=>{try{vibrer(8);}catch(x){}reclamerNiveaux([+b.dataset.rec]);});
  C.querySelectorAll('[data-cof]').forEach(b=>b.onclick=()=>ouvrirCoffre(b.dataset.cof));
  C.querySelectorAll('[data-fr]').forEach(b=>b.onclick=()=>echangerFragments(b.dataset.fr));
  C.querySelectorAll('[data-ti]').forEach(b=>b.onclick=async()=>{const ti=b.dataset.ti;if(!ti)return;const d=await rpcNiv('titre_choisir',{p_titre:ti});if(d&&!d.erreur&&d.niveau){NIV=d;try{majPlaque(null);}catch(x){}try{vibrer(10);}catch(x){}peindre();}});
  const pr=C.querySelector('[data-pris]');if(pr)pr.onclick=()=>{const l=C.querySelector('[data-pl]');l.style.display=l.style.display==='none'?'flex':'none';};
  /* on amène la vue là où ça se passe */
  if(ONG==='niv'&&S.N&&V()!=='C'){const cible=C.querySelector('#crn'+(S.dispo[0]||S.niv));if(cible){if(V()==='B'){const car=C.querySelector('.car');car.scrollLeft=cible.offsetLeft-(car.clientWidth-cible.clientWidth)/2;}else C.scrollTop=Math.max(0,cible.offsetTop-80);}}}
/* le jeu repeint son ancien carnet après chaque action : on repeint le nôtre aussi */
try{const avant=peindreMonNiveau;peindreMonNiveau=function(){try{avant();}catch(x){}if(RAC)peindre();};}catch(x){}
function fermer(depuisRetour){if(!RAC)return;window.ECRAN_COUVRANT=false;const R0=RAC;RAC=null;R0.classList.remove('on');setTimeout(()=>R0.remove(),280);
  removeEventListener('popstate',surRetour);removeEventListener('keydown',surTouche);if(HIST&&!depuisRetour){HIST=false;try{history.back();}catch(x){}}HIST=false;}
function surRetour(){fermer(true);}function surTouche(ev){if(ev.key==='Escape')fermer();}
window.ouvrirCarnetNeuf=function(ong){if(RAC)return;if(ong)ONG=ong;
  let st=document.getElementById('crnCss');if(!st){st=document.createElement('style');st.id='crnCss';document.head.appendChild(st);}st.textContent=CSS+CSS_V[V()];
  const d=document.createElement('div');d.id='crn';RAC=d;
  d.innerHTML='<div class="pan"><div class="poig"><i></i></div><div class="hd"><span class="av"></span><span class="tt"><b>Niveau</b><small></small></span><button class="x" aria-label="Fermer le carnet">✕</button></div><div class="xp"></div><div class="ong"></div><div class="corps"></div><div class="bas"><button class="fermeB">Fermer le carnet</button></div></div>';
  d.querySelector('.hd .av').appendChild(enPied());
  document.body.appendChild(d);peindre();requestAnimationFrame(()=>d.classList.add('on'));setTimeout(()=>{if(RAC===d)window.ECRAN_COUVRANT=true;},300);
  const fm=()=>{try{vibrer(8);}catch(x){}fermer();};d.querySelectorAll('.x,.fermeB').forEach(b=>b.onclick=fm);d.addEventListener('click',ev=>{if(ev.target===d)fm();});
  const pan=d.querySelector('.pan'),poig=d.querySelector('.poig');let y0=null;
  poig.addEventListener('pointerdown',ev=>{y0=ev.clientY;pan.classList.add('glisse');try{poig.setPointerCapture(ev.pointerId);}catch(x){}});
  poig.addEventListener('pointermove',ev=>{if(y0==null)return;pan.style.setProperty('--dy',Math.max(0,ev.clientY-y0)+'px');});
  const fin=ev=>{if(y0==null)return;const dy=ev.clientY-y0;y0=null;pan.classList.remove('glisse');pan.style.setProperty('--dy','0px');if(dy>80)fm();};poig.addEventListener('pointerup',fin);poig.addEventListener('pointercancel',fin);
  try{history.pushState({carnet:1},'');HIST=true;}catch(x){}addEventListener('popstate',surRetour);addEventListener('keydown',surTouche);
  if(!NIV||Date.now()-NIV_LU>2000)lireNiveau().then(()=>{if(RAC===d)peindre();});};
})();
