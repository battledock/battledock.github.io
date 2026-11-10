/* =====================================================================
   LE VESTIAIRE — on enfile ce qu'on a acheté chez Bleu de Chauffe.
   La feuille du Sac ; en haut, toi en grand sur le tapis (on te fait
   tourner) ; « Tenue de travail » ou « Ma tenue » ; puis, rayon par rayon,
   les pièces que tu possèdes : on touche, c'est porté, gratuitement.
   La liste des pièces vient du serveur (mes_vetements). Au port, on
   reste en tenue de docker quoi qu'il arrive. Chargé par moteur.js.
   ===================================================================== */
(()=>{
const CSS=`#vesN{position:fixed;inset:0;z-index:2147482100;font-family:'Baloo 2',system-ui,sans-serif;color:#2a2016;user-select:none;-webkit-user-select:none;-webkit-tap-highlight-color:transparent;background:rgba(10,14,20,.45);opacity:0;transition:opacity .2s}
#vesN.on{opacity:1}#vesN *{box-sizing:border-box}#vesN *::after{content:none!important;display:none!important}#vesN img,#vesN canvas,#vesN svg{image-rendering:pixelated}
#vesN .pan{position:absolute;left:0;right:0;bottom:0;height:86%;background:#f6f1e6;border-radius:26px 26px 0 0;display:flex;flex-direction:column;transform:translateY(100%);transition:transform .26s cubic-bezier(.2,.8,.2,1);box-shadow:0 -10px 30px rgba(0,0,0,.3)}
#vesN.on .pan{transform:translateY(var(--dy,0px))}#vesN .pan.glisse{transition:none}
#vesN .poig{flex:none;height:24px;display:grid;place-items:center;touch-action:none}#vesN .poig i{width:48px;height:5px;border-radius:3px;background:#d0c6b2}
#vesN .hd{flex:none;display:flex;align-items:center;gap:12px;padding:0 16px 12px}
#vesN .hd .ic{flex:none;width:52px;height:52px;border-radius:16px;display:grid;place-items:center}
#vesN .hd .tt{flex:1;min-width:0}#vesN .hd .tt b{display:block;font-size:24px;font-weight:800;line-height:1}#vesN .hd .tt small{display:block;font-size:12.5px;font-weight:700;color:#8a7a5a;margin-top:2px}
#vesN .x{flex:none;width:40px;height:40px;border-radius:50%;border:0;background:#fff;box-shadow:0 3px 0 #ddd3c0;font:800 16px 'Baloo 2',system-ui,sans-serif;color:#2a2016}
#vesN .corps{flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch;touch-action:pan-y;padding:0 16px 16px;overscroll-behavior:contain;position:relative}
#vesN .bas{flex:none;display:flex;gap:10px;padding:8px 16px calc(12px + env(safe-area-inset-bottom));border-top:1px solid #e6dccb;background:#f6f1e6}
#vesN .bas button{height:54px;border:0;border-radius:18px;font:800 17px 'Baloo 2',system-ui,sans-serif}
#vesN .fermeB{flex:1;background:#2a2016;color:#fff;box-shadow:0 4px 0 #000}
#vesN .lb{font:800 12px 'Baloo 2',system-ui,sans-serif;letter-spacing:2px;color:#8a7a5a;margin:12px 2px 8px}
#vesN .sc{position:relative;height:210px;border-radius:24px;overflow:hidden;background:linear-gradient(#efe4cc,#e6d6b6);box-shadow:inset 0 0 0 2px #e2d2b0}
#vesN .sc .mur{position:absolute;inset:0 0 54px;background:repeating-linear-gradient(90deg,#f2e8d2 0 26px,#ebdfc4 26px 28px)}
#vesN .sc .sol{position:absolute;left:0;right:0;bottom:0;height:54px;background:repeating-linear-gradient(90deg,#b8865a 0 40px,#a87a50 40px 42px);box-shadow:inset 0 3px 0 rgba(0,0,0,.08)}
#vesN .sc .tapis{position:absolute;left:50%;bottom:18px;width:150px;height:22px;margin-left:-75px;border-radius:50%;background:#c8402e;box-shadow:inset 0 0 0 4px #e8b040}
#vesN .sc canvas{position:absolute;left:50%;bottom:26px;transform:translateX(-50%)}
#vesN .sc .tr{position:absolute;bottom:70px;width:44px;height:44px;border-radius:50%;border:0;background:rgba(255,255,255,.9);box-shadow:0 3px 0 rgba(0,0,0,.12);font:800 20px 'Baloo 2',system-ui,sans-serif;color:#2a2016}
#vesN .sc .tr.g{left:12px}#vesN .sc .tr.d{right:12px}
#vesN .sc .tag{position:absolute;top:10px;left:10px;background:#2a2016;color:#f2d27a;border-radius:10px;padding:2px 10px;font:800 12px 'Baloo 2',system-ui,sans-serif}
#vesN .mode{display:flex;gap:6px;margin-top:10px;background:#ebe3d2;border-radius:16px;padding:4px}
#vesN .mode button{flex:1;height:44px;border:0;border-radius:12px;background:none;font:800 15px 'Baloo 2',system-ui,sans-serif;color:#8a7a5a}
#vesN .mode button.on{background:#fff;color:#2a2016;box-shadow:0 2px 0 #ddd3c0}
#vesN .ray{display:flex;gap:6px;margin-bottom:8px}#vesN .ray button{flex:1;height:42px;border:0;border-radius:14px;background:#fff;box-shadow:0 2px 0 #ddd3c0;font:800 14px 'Baloo 2',system-ui,sans-serif;color:#6a5a40}
#vesN .ray button.on{background:#2a2016;color:#fff;box-shadow:0 2px 0 #000}
#vesN .gr{display:grid;grid-template-columns:1fr 1fr;gap:8px}
#vesN .it{position:relative;border:0;border-radius:18px;background:#fff;box-shadow:0 3px 0 #ddd3c0;padding:10px;display:flex;align-items:center;gap:10px;text-align:left;font-family:inherit;color:inherit;min-height:62px}
#vesN .it .sw{flex:none;width:34px;height:34px;border-radius:50%;box-shadow:inset 0 0 0 2px rgba(0,0,0,.12)}
#vesN .it b{display:block;font-size:14.5px;font-weight:800;line-height:1.1}#vesN .it small{font-size:11.5px;font-weight:700;color:#8a7a5a}
#vesN .it.on{box-shadow:0 0 0 3px #3a9a5a,0 3px 0 #2a7a44}#vesN .it.on small{color:#3a9a5a}
#vesN .vide{text-align:center;padding:18px 10px;color:#8a7a5a;font-weight:700;line-height:1.4;background:#fff;border-radius:18px;box-shadow:0 3px 0 #ddd3c0}
#vesN .vide b{color:#1d4a8a}
#vesN .note{margin:10px 2px 0;font-size:12.5px;font-weight:700;color:#8a7a5a;text-align:center}`;
let RAC=null,HIST=false;
function fermer(depuisRetour){if(!RAC)return;window.ECRAN_COUVRANT=false;const R0=RAC;RAC=null;R0.classList.remove('on');setTimeout(()=>R0.remove(),280);
  removeEventListener('popstate',surRetour);removeEventListener('keydown',surTouche);if(HIST&&!depuisRetour){HIST=false;try{history.back();}catch(x){}}HIST=false;}
function surRetour(){fermer(true);}function surTouche(ev){if(ev.key==='Escape')fermer();}
/* la feuille : on la ferme par le gros bouton, la croix, le fond, un glissé vers le bas, Retour, Échap */
function feuille(css,cssId,tete){let st=document.getElementById(cssId);if(!st){st=document.createElement('style');st.id=cssId;document.head.appendChild(st);}st.textContent=css;
  const d=document.createElement('div');d.id='vesN';RAC=d;
  d.innerHTML='<div class="pan"><div class="poig"><i></i></div><div class="hd">'+tete+'<button class="x" aria-label="Fermer">✕</button></div><div class="corps"></div><div class="bas"><button class="fermeB">Fermer le vestiaire</button></div></div>';
  document.body.appendChild(d);requestAnimationFrame(()=>d.classList.add('on'));setTimeout(()=>{if(RAC===d)window.ECRAN_COUVRANT=true;},300);
  const fm=()=>{try{vibrer(8);}catch(x){}fermer();};d.querySelectorAll('.x,.fermeB').forEach(b=>b.onclick=fm);d.addEventListener('click',ev=>{if(ev.target===d)fm();});
  const pan=d.querySelector('.pan'),poig=d.querySelector('.poig');let y0=null;
  poig.addEventListener('pointerdown',ev=>{y0=ev.clientY;pan.classList.add('glisse');try{poig.setPointerCapture(ev.pointerId);}catch(x){}});
  poig.addEventListener('pointermove',ev=>{if(y0==null)return;pan.style.setProperty('--dy',Math.max(0,ev.clientY-y0)+'px');});
  const fin=ev=>{if(y0==null)return;const dy=ev.clientY-y0;y0=null;pan.classList.remove('glisse');pan.style.setProperty('--dy','0px');if(dy>80)fm();};poig.addEventListener('pointerup',fin);poig.addEventListener('pointercancel',fin);
  try{history.pushState({ecran:'vesN'},'');HIST=true;}catch(x){}addEventListener('popstate',surRetour);addEventListener('keydown',surTouche);return d;}

/* le catalogue de Bleu de Chauffe (mêmes identifiants que le serveur) */
const CATALOGUE={
  hauts:{nom:'Hauts',modeles:[
    {nom:'Les premiers',d:'Tenue d’ancien, réservée aux pionniers (niv. 2 à 5). Non vendue.',v:[['anc_premiers','Tenue d’ancien',0,'#2a5aa8',{haut:1,veste:'#2a5aa8',_motif:'etoile',motif:0,chapeau:1,bas:0,pantalon:'#2a3a5a'}]]},
    {nom:'Ancien du port',d:'Tenue d’ancien (niv. 6 à 12). Non vendue.',v:[['anc_ancien','Tenue d’ancien',0,'#1e3a6a',{haut:3,veste:'#1e3a6a',_motif:'',motif:2,raye:19,chapeau:6,bas:0,pantalon:'#3a4048'}]]},
    {nom:'Vétéran',d:'Tenue d’ancien (niv. 13 à 16). Non vendue.',v:[['anc_veteran','Tenue d’ancien',0,'#3a5a8a',{haut:0,veste:'#3a5a8a',_motif:'retro',motif:0,chapeau:1,bas:0,pantalon:'#2a3a5a'}]]},
    {nom:'Doyen des quais',d:'Tenue d’ancien (niv. 17 à 20). Non vendue.',v:[['anc_doyen','Tenue d’ancien',0,'#1a2a44',{haut:5,veste:'#1a2a44',_motif:'capitaine',motif:0,chapeau:6,bas:0,pantalon:'#4a4e56'}]]},
    {nom:'Légende du port',d:'Tenue d’ancien (niv. 21 et +). Non vendue.',v:[['anc_legende','Tenue d’ancien',0,'#d8a830',{haut:0,veste:'#d8a830',_motif:'docker',motif:0,chapeau:1,bas:0,pantalon:'#1a1a1e'}]]},
    {nom:'Veste de travail',d:'Le bleu de chauffe : coton épais, poches plaquées.',v:[['h_veste_bleu','Bleu',240,'#1d4a8a',{haut:0,veste:17}],['h_veste_noire','Noire',260,'#24262a',{haut:0,veste:20}]]},
    {nom:'Chemise',d:'Col boutonné, manches retroussées.',v:[['h_chemise_lin','Lin écru',160,'#e8dcc0',{haut:2,veste:24}],['h_chemise_bleu','Oxford',120,'#1e3a6a',{haut:2,veste:16}]]},
    {nom:'Pull marin',d:'Laine à maille serrée, chaude et légère.',v:[['h_pull_marin','Bleu nuit',140,'#1e3a6a',{haut:3,veste:16}],['h_pull_bordeaux','Bordeaux',130,'#7a2232',{haut:3,veste:22}]]},
    {nom:'T-shirt',d:'Coton lourd, coupe droite.',v:[['h_tshirt_blanc','Blanc',45,'#f2ece0',{haut:1,veste:19}],['h_tshirt_vert','Vert pin',45,'#2f5a4a',{haut:1,veste:21}]]},
    {nom:'Manteau',d:'Drap de laine anthracite, pour le mistral.',v:[['h_manteau','Anthracite',380,'#3a3e46',{haut:5,veste:11}]]},
    {nom:'Gilet',d:'Sans manches, à porter sur une chemise.',v:[['h_gilet_moutarde','Moutarde',95,'#c9a24a',{haut:6,veste:23}]]},
    {nom:'Pull « Bise de Nadia »',d:'Lot exclusif du Grand Mistral.',v:[['tv_pull_bise','Rose',0,'#e86aa0',{haut:3,veste:28}]]},
    {nom:'Blazer Mistral TV',d:'Lot exclusif du Grand Mistral.',v:[['tv_blazer','Violet',0,'#5a2ab0',{haut:0,veste:29}]]},
    {nom:'Veste à paillettes',d:'Lot exclusif du Grand Mistral.',v:[['tv_veste_or','Or',0,'#e8b830',{haut:0,veste:30}]]}]},
  bas:{nom:'Bas',modeles:[
    {nom:'Pantalon doré',d:'Lot exclusif du Grand Mistral.',v:[['tv_pantalon_or','Or',0,'#d8a830',{bas:0,pantalon:14}]]},
    {nom:'Pantalon',d:'Coupe droite, toile solide.',v:[['b_jean','Jean brut',90,'#1e3a6a',{bas:0,pantalon:8}],['b_chino','Chino écru',85,'#e2d6b8',{bas:0,pantalon:10}],['b_noir','Noir',95,'#24262a',{bas:0,pantalon:9}]]},
    {nom:'Treillis',d:'Poches cargo, toile kaki.',v:[['b_treillis','Kaki',75,'#4a5a3a',{bas:3,pantalon:12}]]},
    {nom:'Short',d:'Pour la plage et les beaux jours.',v:[['b_short','Écru',50,'#e2d6b8',{bas:1,pantalon:10}]]},
    {nom:'Bermuda',d:'Long, au-dessus du genou.',v:[['b_bermuda','Bleu',55,'#2a5aa8',{bas:5,pantalon:0}]]}]},
  pieds:{nom:'Chaussures',modeles:[
    {nom:'Baskets',d:'Semelle crème, confort toute la journée.',v:[['c_baskets_blanc','Blanches',110,'#f2efe8',{souliers:1,chaussures:6}],['c_baskets_marine','Marine',110,'#1e3a6a',{souliers:1,chaussures:7}]]},
    {nom:'Bottes',d:'Cuir fauve, cousues main.',v:[['c_bottes_cuir','Fauve',220,'#9a6a3a',{souliers:0,chaussures:3}]]},
    {nom:'Bottillons',d:'Daim brun, à lacets.',v:[['c_bottillons','Daim',180,'#7a5a3a',{souliers:3,chaussures:5}]]},
    {nom:'Sandales',d:'Cuir, pour l’été.',v:[['c_sandales','Cuir',40,'#b48a5a',{souliers:2,chaussures:9}]]}]},
  tete:{nom:'Tête',modeles:[
    {nom:'Tête nue',d:'Rien sur la tête.',v:[['k_aucune','',0,null,{chapeau:0}]]},
    {nom:'Casquette',d:'Toile, visière courbe.',v:[['k_casquette','',35,null,{chapeau:1}]]},
    {nom:'Bonnet',d:'Laine côtelée, pour l’hiver.',v:[['k_bonnet','',30,null,{chapeau:3}]]},
    {nom:'Béret',d:'Feutre de laine.',v:[['k_beret','',45,null,{chapeau:6}]]},
    {nom:'Chapeau',d:'Paille tressée.',v:[['k_chapeau','',90,null,{chapeau:5}]]}]}};
const CATS=Object.keys(CATALOGUE);

const PAR_ID={};for(const c of CATS)for(const m of CATALOGUE[c].modeles)for(const v of m.v)PAR_ID[v[0]]={cat:c,m,v};
const CHAMPS={hauts:['haut','veste'],bas:['bas','pantalon'],pieds:['souliers','chaussures'],tete:['chapeau']};
const RAYONS=[['hauts','Hauts'],['bas','Bas'],['pieds','Pieds'],['tete','Tête']];
const vib=x=>{try{vibrer(x);}catch(_){}};
const esc=s=>String(s||'').replace(/[<>&"]/g,c=>({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;'})[c]);
let RAY='hauts',DIR=0,MIENS=new Set((e.garde||[]));const DIRS=['bas','gauche','haut','droite'];
const civil=()=>!!(e.ap&&e.ap._civil);
function porteDans(cat,ap){for(const m of CATALOGUE[cat].modeles)for(const v of m.v){if(CHAMPS[cat].every(k=>(ap[k]||0)===(v[4][k]||0)))return v[0];}return null;}
function dessiner(){const cv=RAC&&RAC.querySelector('.sc canvas');if(!cv)return;const s=3,D=Math.max(1,Math.round(window.devicePixelRatio||2));cv.width=48*s*D;cv.height=70*s*D;cv.style.width=48*s+'px';cv.style.height=70*s+'px';
  const q=cv.getContext('2d');q.imageSmoothingEnabled=false;q.setTransform(1,0,0,1,0,0);q.clearRect(0,0,cv.width,cv.height);q.setTransform(s*D,0,0,s*D,0,0);
  const ap=Object.assign({},DEF_AP,e.ap||{},{_pnj:true});if(!civil()){delete ap._civil;}
  try{if(civil())personne(q,24,66,ap,DIRS[DIR],0,false);else{const a2=Object.assign({},e.ap||{});delete a2._civil;delete a2._pnj;personne(q,24,66,a2,DIRS[DIR],0,false);}}catch(x){}
  q.setTransform(1,0,0,1,0,0);}
function porter(id){const P=PAR_ID[id];if(!P)return;const ski=e.ap&&e.ap.ski;
  const ap=Object.assign({},DEF_AP,e.ap||{});if(!civil()){Object.assign(ap,{haut:1,veste:19,bas:0,pantalon:8,souliers:1,chaussures:6,chapeau:0,motif:0,raye:0});}
  delete ap.deguisement;if(P.cat==='hauts'){delete ap._motif;ap.motif=0;}Object.assign(ap,P.v[4],{_civil:true});if(!ap._motif)delete ap._motif;if(ski)ap.ski=ski;e.ap=ap;try{sauver();}catch(x){}vib(10);peindre();}
function peindre(){if(!RAC)return;const C=RAC.querySelector('.corps'),y=C.scrollTop;const civ=civil();
  const miens=CATALOGUE[RAY].modeles.flatMap(m=>m.v.filter(v=>MIENS.has(v[0])||v[0]==='k_aucune').map(v=>({m,v})));
  const porte=civ?porteDans(RAY,e.ap):null;let total=0;for(const c of CATS)for(const m of CATALOGUE[c].modeles)for(const v of m.v)if(MIENS.has(v[0]))total++;
  let h='<div class="sc"><div class="mur"></div><div class="sol"></div><div class="tapis"></div><canvas></canvas><span class="tag">'+(civ?'MA TENUE':'TENUE DE TRAVAIL')+'</span><button class="tr g" aria-label="Tourner">↺</button><button class="tr d" aria-label="Tourner">↻</button></div>'+
    '<div class="mode"><button data-m="travail"'+(civ?'':' class="on"')+'>🦺 Travail</button><button data-m="civil"'+(civ?' class="on"':'')+'>👕 Ma tenue</button></div>';
  if(!total)h+='<div class="lb">TA GARDE-ROBE</div><div class="vide">Ta garde-robe est vide.<br>Passe chez <b>Bleu de Chauffe</b>, à la Galerie Bleue : tout ce que tu achètes arrive ici.</div>';
  else{h+='<div class="lb">TA GARDE-ROBE · '+total+' PIÈCE'+(total>1?'S':'')+'</div><div class="ray">'+RAYONS.map(([k,n])=>'<button data-r="'+k+'"'+(RAY===k?' class="on"':'')+'>'+n+'</button>').join('')+'</div>';
    h+=miens.length?'<div class="gr">'+miens.map(({m,v})=>'<button class="it'+(porte===v[0]?' on':'')+'" data-id="'+v[0]+'"><span class="sw" style="background:'+(v[3]||'#f2ecdf')+'"></span><span><b>'+esc(m.nom)+'</b><small>'+(porte===v[0]?'porté':esc(v[1]||'porter'))+'</small></span></button>').join('')+'</div>'
      :'<div class="vide">Rien dans ce rayon.<br><b>Bleu de Chauffe</b> en a plein.</div>';}
  h+='<div class="note">Au port, tu restes en tenue de docker.</div>';
  C.innerHTML=h;C.scrollTop=y;dessiner();
  C.querySelectorAll('.tr').forEach(b=>b.onclick=()=>{DIR=(DIR+(b.classList.contains('d')?1:3))%4;vib(5);dessiner();});
  C.querySelectorAll('[data-m]').forEach(b=>b.onclick=()=>{vib(10);if(b.dataset.m==='travail'){if(e.ap){e.ap=Object.assign({},e.ap);delete e.ap._civil;}}
    else if(!civil()){const ap=Object.assign({},e.ap||{});ap._civil=true;if(!total)Object.assign(ap,{haut:1,veste:19,bas:0,pantalon:8,souliers:1,chaussures:6,chapeau:0,motif:0,raye:0});e.ap=ap;}
    try{sauver();}catch(x){}peindre();});
  C.querySelectorAll('[data-r]').forEach(b=>b.onclick=()=>{RAY=b.dataset.r;vib(6);peindre();});
  C.querySelectorAll('[data-id]').forEach(b=>b.onclick=()=>porter(b.dataset.id));}
window.ouvrirVestiaireNeuf=async function(){if(RAC)return;
  feuille(CSS,'vesNCss','<span class="ic" style="background:#dce8ff">👕</span><span class="tt"><b>Vestiaire</b><small>tes tenues</small></span>');peindre();
  try{const r=await appelRPC('mes_vetements',{p_joueur:e.id});if(Array.isArray(r)){r.forEach(x=>MIENS.add(x));e.garde=[...MIENS];peindre();}}catch(x){}};
})();
