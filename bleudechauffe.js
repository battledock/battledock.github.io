/* =====================================================================
   BLEU DE CHAUFFE — la boutique de vêtements de la Galerie Bleue.
   Un écran à part, chargé à la demande quand on pousse la porte
   (terrasses.js l'évalue sur place : il voit e, appelRPC, enEuros,
   personne, DEF_AP, sauver, vibrer…).

   L'essayage se fait par TENUE : on essaie un haut, un bas, des
   chaussures, une casquette ; le bandeau du bas fait le compte de ce
   qu'il reste à payer, et on achète la tenue d'un coup. Ce qu'on a déjà
   se porte sans payer. Le serveur débite et garde la trace de chaque
   pièce (acheter_vetement). Au port, on reste en tenue de docker.
   ===================================================================== */
(()=>{
/* LE CATALOGUE : des modèles, chacun en une ou plusieurs couleurs. Les identifiants (et leurs prix) sont ceux du serveur. */
const CATALOGUE={
  hauts:{nom:'Hauts',modeles:[
    {nom:'Veste de travail',d:'Le bleu de chauffe : coton épais, poches plaquées.',v:[['h_veste_bleu','Bleu',240,'#1d4a8a',{haut:0,veste:17}],['h_veste_noire','Noire',260,'#24262a',{haut:0,veste:20}]]},
    {nom:'Chemise',d:'Col boutonné, manches retroussées.',v:[['h_chemise_lin','Lin écru',160,'#e8dcc0',{haut:2,veste:24}],['h_chemise_bleu','Oxford',120,'#1e3a6a',{haut:2,veste:16}]]},
    {nom:'Pull marin',d:'Laine à maille serrée, chaude et légère.',v:[['h_pull_marin','Bleu nuit',140,'#1e3a6a',{haut:3,veste:16}],['h_pull_bordeaux','Bordeaux',130,'#7a2232',{haut:3,veste:22}]]},
    {nom:'T-shirt',d:'Coton lourd, coupe droite.',v:[['h_tshirt_blanc','Blanc',45,'#f2ece0',{haut:1,veste:19}],['h_tshirt_vert','Vert pin',45,'#2f5a4a',{haut:1,veste:21}]]},
    {nom:'Manteau',d:'Drap de laine anthracite, pour le mistral.',v:[['h_manteau','Anthracite',380,'#3a3e46',{haut:5,veste:11}]]},
    {nom:'Gilet',d:'Sans manches, à porter sur une chemise.',v:[['h_gilet_moutarde','Moutarde',95,'#c9a24a',{haut:6,veste:23}]]}]},
  bas:{nom:'Bas',modeles:[
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
const ICONES={
  hauts:'<svg viewBox="0 0 24 24"><path d="M8 3l4 2 4-2 5 3-2 5-2-1v11H7V10l-2 1-2-5z"/></svg>',
  bas:'<svg viewBox="0 0 24 24"><path d="M6 3h12l1 18h-5l-2-11-2 11H5z"/></svg>',
  pieds:'<svg viewBox="0 0 24 24"><path d="M3 15c2 0 4-1 5-4l2-6h4l-1 7c3 1 6 2 7 4v3H3z"/></svg>',
  tete:'<svg viewBox="0 0 24 24"><path d="M4 15c0-5 3.5-8 8-8s8 3 8 8z"/><path d="M14 15h8v2h-8z"/></svg>'};
/* les pièces gratuites, et le rangement par pièce */
const GRATUITS=new Set(['k_aucune']);
const PAR_ID={};for(const c of CATS)for(const m of CATALOGUE[c].modeles)for(const v of m.v)PAR_ID[v[0]]={cat:c,m,v};
const CHAMPS={hauts:['haut','veste'],bas:['bas','pantalon'],pieds:['souliers','chaussures'],tete:['chapeau']};

let RACINE=null,CAT='hauts',DIR=0,ESSAI={},MIENS=new Set(),ACHAT=false;
const DIRS=['bas','gauche','haut','droite'];
/* la base : ton visage, sans déguisement ni tenue de ski ; tenue civile simple si tu n'en as pas encore */
const base=()=>{const ap=Object.assign({},DEF_AP,e.ap||{},e.ap&&e.ap._civil?{}:{haut:1,veste:19,bas:0,pantalon:8,souliers:1,chaussures:6,chapeau:0,motif:0,raye:0},{sac:0});
  delete ap.deguisement;delete ap.ski;return ap;};
/* la pièce que tu portes dans chaque rayon (déduite de ton apparence) */
/* ce que tu portes déjà, rayon par rayon (rien si tu es encore en docker, sauf la tête nue) */
function depart(){const b=base(),civ=!!(e.ap&&e.ap._civil),o={};for(const c of CATS){const id=porteDans(c,b);o[c]=civ||GRATUITS.has(id)?id:null;}return o;}
function porteDans(cat,ap){for(const m of CATALOGUE[cat].modeles)for(const v of m.v){if(CHAMPS[cat].every(k=>(ap[k]||0)===(v[4][k]||0)))return v[0];}return null;}
const aMoi=id=>GRATUITS.has(id)||MIENS.has(id);
/* l'apparence d'essai : ta base, plus chaque pièce essayée */
function apEssai(){const ap=base();for(const c of CATS){const id=ESSAI[c];if(id)Object.assign(ap,PAR_ID[id].v[4]);}return Object.assign(ap,{_civil:true,_pnj:true});}
function aPayer(){return CATS.map(c=>ESSAI[c]).filter(id=>id&&!aMoi(id));}
function total(){return aPayer().reduce((s,id)=>s+PAR_ID[id].v[2],0);}
function dejaPorte(){if(!e.ap||!e.ap._civil)return false;return CATS.every(c=>!ESSAI[c]||porteDans(c,e.ap)===ESSAI[c]);}

/* LE PERSONNAGE NET : dessiné à sa taille réelle, puis agrandi par un nombre entier de pixels écran */
function dessinePerso(cv,ap,taille,dir){const NW=40,NH=66,DPR=Math.max(1,window.devicePixelRatio||1);const s=Math.max(1,Math.round(taille*DPR));
  if(cv.width!==NW*s){cv.width=NW*s;cv.height=NH*s;cv.style.width=(NW*s/DPR)+'px';cv.style.height=(NH*s/DPR)+'px';}
  const t=document.createElement('canvas');t.width=NW;t.height=NH;const q=t.getContext('2d');q.imageSmoothingEnabled=false;personne(q,NW/2,NH-4,ap,dir||'bas',0,false);
  const g=cv.getContext('2d');g.imageSmoothingEnabled=false;g.clearRect(0,0,cv.width,cv.height);g.drawImage(t,0,0,NW*s,NH*s);}
/* la vignette d'une pièce : on ne garde que la zone du corps qu'elle habille */
const ZONES={hauts:[8,29,24,16],bas:[8,43,24,17],pieds:[9,56,22,8],tete:[8,13,24,18]};
function vignette(cv,cat,ap){const DPR=Math.max(1,window.devicePixelRatio||1),[sx,sy,w,h]=ZONES[cat],s=Math.max(1,Math.round(2.6*DPR*(cat==='pieds'?1.25:1)));
  cv.width=w*s;cv.height=h*s;cv.style.width=(w*s/DPR)+'px';cv.style.height=(h*s/DPR)+'px';
  const t=document.createElement('canvas');t.width=40;t.height=66;const q=t.getContext('2d');q.imageSmoothingEnabled=false;personne(q,20,62,ap,'bas',0,false);
  const g=cv.getContext('2d');g.imageSmoothingEnabled=false;g.drawImage(t,sx,sy,w,h,0,0,w*s,h*s);}

const CSS=`@keyframes bdcIn{from{transform:translateY(14px);opacity:0}to{transform:none;opacity:1}}
@keyframes bdcPop{0%{transform:scale(1)}40%{transform:scale(1.06)}100%{transform:scale(1)}}
#bdc{position:fixed;inset:0;z-index:2147482000;display:flex;flex-direction:column;font-family:"Baloo 2","Helvetica Neue",Arial,sans-serif;color:#fff;
  background:radial-gradient(120% 60% at 50% 18%,#2d63b0 0%,#163b78 45%,#0b1f45 100%);opacity:0;transition:opacity .22s;user-select:none;-webkit-user-select:none;touch-action:manipulation;-webkit-tap-highlight-color:transparent}
#bdc *{box-sizing:border-box;margin:0;padding:0;font-family:inherit}
#bdc button{border:0;background:none;color:inherit;cursor:pointer}
#bdc .barre{display:flex;align-items:center;gap:10px;padding:calc(10px + env(safe-area-inset-top)) 12px 6px}
#bdc .fermer{width:40px;height:40px;border-radius:14px;background:rgba(255,255,255,.12);display:flex;align-items:center;justify-content:center;font-size:20px;font-weight:700}
#bdc .titre{flex:1;line-height:1}#bdc .titre b{display:block;font-size:20px;font-weight:700;letter-spacing:.02em}#bdc .titre small{font-size:11px;color:#9fc0ec;letter-spacing:.14em;font-weight:500}
#bdc .bourse{display:flex;align-items:center;gap:6px;background:rgba(5,16,40,.55);border-radius:14px;padding:6px 11px;font-weight:700;font-size:15px;color:#ffd36a}
#bdc .bourse i{width:14px;height:14px;border-radius:50%;background:radial-gradient(circle at 35% 35%,#ffe9a0,#e0a628);box-shadow:inset 0 -1px 0 rgba(0,0,0,.25)}
#bdc .scene{position:relative;flex:0 0 auto;height:min(31vh,250px);display:flex;align-items:flex-end;justify-content:center}
#bdc .halo{position:absolute;left:50%;bottom:6px;width:260px;height:260px;transform:translateX(-50%);border-radius:50%;background:radial-gradient(rgba(255,214,130,.34),rgba(255,214,130,0) 62%);pointer-events:none}
#bdc .socle{position:absolute;left:50%;bottom:10px;transform:translateX(-50%);width:170px;height:38px;border-radius:50%;background:radial-gradient(#3d72cc 0%,#1d4588 70%);box-shadow:0 6px 0 #0b2856,0 14px 22px rgba(0,0,0,.35)}
#bdc .socle:after{content:'';position:absolute;inset:6px 18px;border-radius:50%;border:2px solid rgba(255,255,255,.14)}
#bdc canvas.perso{position:relative;margin-bottom:26px;image-rendering:pixelated}
#bdc .tourner{position:absolute;bottom:22px;width:40px;height:40px;border-radius:50%;background:rgba(255,255,255,.12);font-size:20px;font-weight:700;display:flex;align-items:center;justify-content:center}
#bdc .tourner.g{left:calc(50% - 128px)}#bdc .tourner.d{right:calc(50% - 128px)}
#bdc .annuler{position:absolute;top:6px;right:12px;font-size:12px;font-weight:700;color:#cfe0f8;background:rgba(255,255,255,.1);border-radius:12px;padding:5px 10px;display:none}
#bdc .annuler.on{display:block}
#bdc .docker{position:absolute;top:6px;left:12px;font-size:12px;font-weight:700;color:#cfe0f8;background:rgba(255,255,255,.1);border-radius:12px;padding:5px 10px;display:none}
#bdc .docker.on{display:block}
#bdc .onglets{display:flex;gap:6px;padding:4px 12px 0}
#bdc .onglets button{flex:1;display:flex;flex-direction:column;align-items:center;gap:1px;padding:8px 0 6px;border-radius:16px 16px 0 0;background:rgba(255,255,255,.08);color:#9fc0ec;font-weight:700;font-size:12px;position:relative}
#bdc .onglets svg{width:20px;height:20px;fill:currentColor}
#bdc .onglets button.on{background:#f6f1e6;color:#0e2348}
#bdc .onglets button em{position:absolute;top:5px;right:calc(50% - 22px);width:9px;height:9px;border-radius:50%;background:#ffb92e;box-shadow:0 0 0 2px #163b78}
#bdc .onglets button.on em{box-shadow:0 0 0 2px #f6f1e6}
#bdc .rayon{flex:1;min-height:0;margin:0 12px;background:#f6f1e6;border-radius:0 0 20px 20px;overflow-y:auto;padding:10px 10px 12px;-webkit-overflow-scrolling:touch}
#bdc .grille{display:grid;grid-template-columns:repeat(3,1fr);gap:9px}
#bdc .carte{position:relative;background:#fff;border-radius:16px;padding:8px 6px 8px;text-align:center;color:#0e2348;box-shadow:0 3px 0 #ddd3c0;transition:transform .12s;animation:bdcIn .25s both}
#bdc .carte:active{transform:scale(.96)}
#bdc .carte.on{box-shadow:0 0 0 3px #ffb92e,0 3px 0 #c88a10}
#bdc .carte .fond{height:68px;border-radius:12px;background:linear-gradient(#eef3fa,#dde7f4);display:flex;align-items:center;justify-content:center;margin-bottom:5px}
#bdc .carte canvas{image-rendering:pixelated}
#bdc .carte b{display:block;font-size:13px;font-weight:700;line-height:1.1}
#bdc .carte .teintes{display:flex;justify-content:center;gap:6px;margin:5px 0 3px;min-height:16px}
#bdc .carte .teintes span{width:16px;height:16px;border-radius:50%;box-shadow:inset 0 0 0 1.5px rgba(0,0,0,.15)}
#bdc .carte .teintes span.on{box-shadow:0 0 0 2px #fff,0 0 0 4px #0e2348}
#bdc .carte .prix{display:inline-block;margin-top:2px;font-size:13px;font-weight:700;border-radius:10px;padding:1px 9px;background:#ffb92e;color:#4a2e00;box-shadow:0 2px 0 #c88a10}
#bdc .carte .prix.a{background:#2f8a4a;color:#fff;box-shadow:0 2px 0 #1e5e30}
#bdc .carte .badge{position:absolute;top:6px;left:6px;font-size:10px;font-weight:700;background:#0e2348;color:#fff;border-radius:8px;padding:1px 6px}
#bdc .caisse{padding:10px 12px calc(12px + env(safe-area-inset-bottom));display:flex;align-items:center;gap:10px}
#bdc .resume{flex:1;min-width:0;line-height:1.15}
#bdc .resume b{display:block;font-size:15px;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#bdc .resume small{display:block;font-size:12px;color:#9fc0ec;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#bdc .acheter{flex:0 0 auto;min-width:150px;border-radius:18px;padding:13px 16px;background:#ffb92e;color:#3e2600;font-size:17px;font-weight:700;box-shadow:0 5px 0 #c88a10;transition:transform .1s}
#bdc .acheter:active{transform:translateY(3px);box-shadow:0 2px 0 #c88a10}
#bdc .acheter.vert{background:#3fae5f;color:#fff;box-shadow:0 5px 0 #237a3c}
#bdc .acheter.gris{background:#5a6e8e;color:#d8e2f0;box-shadow:0 5px 0 #3a4a66}
#bdc .acheter.pop{animation:bdcPop .35s}
#bdc .mot{position:absolute;left:50%;top:38%;transform:translate(-50%,-50%) scale(.96);background:rgba(5,16,40,.92);color:#fff;padding:11px 18px;border-radius:16px;font-weight:700;font-size:15px;opacity:0;transition:opacity .2s,transform .2s;pointer-events:none;text-align:center;max-width:80%}
#bdc .mot.on{opacity:1;transform:translate(-50%,-50%) scale(1)}`;

function mot(t){const m=RACINE&&RACINE.querySelector('.mot');if(!m)return;m.textContent=t;m.classList.add('on');clearTimeout(mot.t);mot.t=setTimeout(()=>m.classList.remove('on'),1700);}
function vib(x){try{vibrer&&vibrer(x);}catch(_){}}
function rendreScene(){dessinePerso(RACINE.querySelector('canvas.perso'),apEssai(),3,DIRS[DIR]);
  const D0=depart(),modif=CATS.some(c=>ESSAI[c]!==D0[c]);
  RACINE.querySelector('.annuler').classList.toggle('on',modif);
  RACINE.querySelector('.docker').classList.toggle('on',!!(e.ap&&e.ap._civil));}
function rendreOnglets(){RACINE.querySelectorAll('.onglets button').forEach(b=>{const c=b.dataset.c;b.classList.toggle('on',c===CAT);
  const em=b.querySelector('em');const pastille=ESSAI[c]&&!aMoi(ESSAI[c]);if(pastille&&!em)b.insertAdjacentHTML('beforeend','<em></em>');if(!pastille&&em)em.remove();});}
function rendreRayon(){const G=RACINE.querySelector('.grille');G.innerHTML='';const ap0=apEssai();
  CATALOGUE[CAT].modeles.forEach((m,i)=>{const choisi=m.v.find(v=>v[0]===ESSAI[CAT])||m.v[0];const on=m.v.some(v=>v[0]===ESSAI[CAT]);
    const c=document.createElement('button');c.className='carte'+(on?' on':'');c.style.animationDelay=(i*25)+'ms';
    const fond=document.createElement('div');fond.className='fond';const cv=document.createElement('canvas');fond.appendChild(cv);c.appendChild(fond);
    vignette(cv,CAT,Object.assign({},ap0,choisi[4],{_pnj:true}));
    const porte=e.ap&&e.ap._civil&&porteDans(CAT,e.ap)===choisi[0];
    let h='<b>'+m.nom+'</b><div class="teintes">';if(m.v.length>1)m.v.forEach(v=>{h+='<span data-id="'+v[0]+'" class="'+(v[0]===choisi[0]&&on?'on':'')+'" style="background:'+v[3]+'"></span>';});h+='</div>';
    h+=aMoi(choisi[0])?'<span class="prix a">'+(choisi[2]?'À toi ✓':'Gratuit')+'</span>':'<span class="prix">'+choisi[2]+' €</span>';
    if(porte)h+='<span class="badge">Porté</span>';
    c.insertAdjacentHTML('beforeend',h);
    c.onclick=ev=>{const sw=ev.target.closest('span[data-id]');const id=sw?sw.dataset.id:(on&&m.v.length>1?(m.v[(m.v.indexOf(choisi)+1)%m.v.length][0]):choisi[0]);
      ESSAI[CAT]=id;vib(8);rendreTout();};
    G.appendChild(c);});}
function rendreCaisse(){const b=RACINE.querySelector('.acheter'),r=RACINE.querySelector('.resume');const L=aPayer(),T=total();
  RACINE.querySelector('.bourse span').textContent=enEuros(e.euros||0);
  b.className='acheter';
  if(L.length){r.innerHTML='<b>'+L.map(id=>PAR_ID[id].m.nom).join(' + ')+'</b><small>'+(L.length>1?L.length+' pièces à payer':'1 pièce à payer')+' · il te reste '+enEuros(Math.max(0,(e.euros||0)-T*100))+'</small>';
    b.innerHTML='Acheter · '+T+' €';if((e.euros||0)<T*100)b.classList.add('gris');}
  else if(!CATS.some(c=>ESSAI[c]&&!GRATUITS.has(ESSAI[c]))&&!(e.ap&&e.ap._civil)){r.innerHTML='<b>Touche un vêtement</b><small>Tu l’essaies tout de suite, sur toi.</small>';b.innerHTML='Essayer';b.classList.add('gris');}
  else if(dejaPorte()){r.innerHTML='<b>Tu portes cette tenue</b><small>Essaie une autre pièce pour la changer.</small>';b.innerHTML='Porté ✓';b.classList.add('gris');}
  else{r.innerHTML='<b>Tout est à toi</b><small>Tu peux la porter tout de suite.</small>';b.innerHTML='Porter';b.classList.add('vert');}}
function rendreTout(){if(!RACINE)return;rendreScene();rendreOnglets();rendreRayon();rendreCaisse();}
function porterEssai(){const ski=e.ap&&e.ap.ski;const ap=apEssai();delete ap._pnj;ap._civil=true;if(ski)ap.ski=ski;e.ap=ap;try{sauver();}catch(x){}}
async function caisse(){if(ACHAT)return;const L=aPayer(),T=total(),b=RACINE.querySelector('.acheter');
  if(!L.length){if(dejaPorte()||!CATS.some(c=>ESSAI[c]&&!GRATUITS.has(ESSAI[c])))return;porterEssai();vib([10,30,10]);b.classList.add('pop');mot('Nouvelle tenue !');rendreTout();return;}
  if((e.euros||0)<T*100){mot('Il te manque '+enEuros(T*100-(e.euros||0))+'.');vib(30);return;}
  ACHAT=true;b.innerHTML='…';
  for(const id of L){const r=await appelRPC('acheter_vetement',{p_joueur:e.id,p_article:id});
    if(!r||r.erreur){ACHAT=false;mot(r&&r.erreur?String(r.erreur):'La caisse n’a pas répondu.');rendreTout();return;}
    if(typeof r.euros==='number'){e.euros=r.euros;try{majHaut();}catch(x){}}MIENS.add(id);}
  e.garde=[...MIENS];ACHAT=false;porterEssai();vib([14,30,14]);b.classList.add('pop');mot(L.length>1?'Tenue achetée et portée !':'Achetée et portée !');rendreTout();}
function fermer(){if(!RACINE)return;const R0=RACINE;RACINE=null;R0.style.opacity='0';setTimeout(()=>R0.remove(),240);try{window.FP_GEL=0;}catch(x){}}
window.ouvrirBleuDeChauffe=async function(){if(RACINE)return;
  if(!document.getElementById('bdcCss')){const s=document.createElement('style');s.id='bdcCss';s.textContent=CSS;document.head.appendChild(s);}
  try{(e.garde||[]).forEach(x=>MIENS.add(x));}catch(x){}
  CAT='hauts';DIR=0;ESSAI=depart();
  const d=document.createElement('div');d.id='bdc';RACINE=d;
  d.innerHTML='<div class="barre"><button class="fermer">✕</button><div class="titre"><b>BLEU DE CHAUFFE</b><small>VÊTEMENTS DE TRAVAIL &amp; DE VILLE</small></div><div class="bourse"><i></i><span></span></div></div>'+
    '<div class="scene"><div class="halo"></div><div class="socle"></div><canvas class="perso"></canvas><button class="tourner g">‹</button><button class="tourner d">›</button><button class="annuler">↺ Ma tenue</button><button class="docker">Tenue de docker</button></div>'+
    '<div class="onglets">'+CATS.map(c=>'<button data-c="'+c+'">'+ICONES[c]+CATALOGUE[c].nom+'</button>').join('')+'</div>'+
    '<div class="rayon"><div class="grille"></div></div>'+
    '<div class="caisse"><div class="resume"></div><button class="acheter"></button></div><div class="mot"></div>';
  document.body.appendChild(d);requestAnimationFrame(()=>d.style.opacity='1');window.FP_GEL=Date.now()+86400000;
  d.querySelector('.fermer').onclick=fermer;
  d.querySelectorAll('.onglets button').forEach(b=>b.onclick=()=>{CAT=b.dataset.c;vib(6);rendreOnglets();rendreRayon();d.querySelector('.rayon').scrollTop=0;});
  d.querySelector('.tourner.g').onclick=()=>{DIR=(DIR+1)%4;rendreScene();};d.querySelector('.tourner.d').onclick=()=>{DIR=(DIR+3)%4;rendreScene();};
  /* on fait tourner le personnage en glissant le doigt sur la scène */
  let x0=null;const sc=d.querySelector('.scene');sc.addEventListener('touchstart',ev=>{x0=ev.touches[0].clientX;},{passive:true});
  sc.addEventListener('touchmove',ev=>{if(x0===null)return;const dx=ev.touches[0].clientX-x0;if(Math.abs(dx)>40){DIR=(DIR+(dx>0?3:1))%4;x0=ev.touches[0].clientX;rendreScene();}},{passive:true});
  sc.addEventListener('touchend',()=>{x0=null;});
  d.querySelector('.annuler').onclick=()=>{ESSAI=depart();vib(8);rendreTout();};
  d.querySelector('.docker').onclick=()=>{e.ap=Object.assign({},e.ap);delete e.ap._civil;try{sauver();}catch(x){}mot('Tenue de docker remise.');rendreTout();};
  d.querySelector('.acheter').onclick=caisse;
  rendreTout();
  try{const r=await appelRPC('mes_vetements',{p_joueur:e.id});if(Array.isArray(r)){r.forEach(x=>MIENS.add(x));e.garde=[...MIENS];rendreTout();}}catch(x){}};
})();
