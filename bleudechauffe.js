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
  const g=cv.getContext('2d');g.imageSmoothingEnabled=false;g.setTransform(1,0,0,1,0,0);g.clearRect(0,0,cv.width,cv.height);g.setTransform(s,0,0,s,0,0);personne(g,NW/2,NH-4,ap,dir||'bas',0,false);g.setTransform(1,0,0,1,0,0);}
/* la vignette d'une pièce : on ne garde que la zone du corps qu'elle habille */
const ZONES={hauts:[8,29,24,16],bas:[8,43,24,17],pieds:[9,56,22,8],tete:[8,13,24,18]};
function vignette(cv,cat,ap){const DPR=Math.max(1,window.devicePixelRatio||1),[sx,sy,w,h]=ZONES[cat],s=Math.max(1,Math.round(2.6*DPR*(cat==='pieds'?1.25:1)));
  cv.width=w*s;cv.height=h*s;cv.style.width=(w*s/DPR)+'px';cv.style.height=(h*s/DPR)+'px';
  const g=cv.getContext('2d');g.imageSmoothingEnabled=false;g.setTransform(s,0,0,s,-sx*s,-sy*s);personne(g,20,62,ap,'bas',0,false);g.setTransform(1,0,0,1,0,0);}

const CSS=`#bdc{position:fixed;inset:0;z-index:5;display:flex;flex-direction:column;background:#f4efe4;color:#1b2a44;font-family:'Baloo 2',system-ui,sans-serif;user-select:none;-webkit-user-select:none;-webkit-tap-highlight-color:transparent}
#bdc *{box-sizing:border-box}
#bdc .hd{flex:none;padding:calc(env(safe-area-inset-top,0px) + 12px) 14px 10px;background:linear-gradient(#1d4a8a,#14325e);border-bottom:3px solid #c8a050}
#bdc .l1{display:flex;align-items:center;gap:8px}#bdc .ens{flex:1;min-width:0}
#bdc .ens b{display:block;font-family:Georgia,serif;font-style:italic;font-weight:900;font-size:24px;color:#f6e6c0;line-height:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;text-shadow:0 2px 0 rgba(0,0,0,.25)}
#bdc .ens small{display:block;font-size:10px;font-weight:800;letter-spacing:2px;color:#9fc0ec;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#bdc .bo{flex:none;border:1.5px solid #e0b860;color:#ffd98a;border-radius:14px;padding:2px 10px;font-weight:800;font-size:13px;background:rgba(0,0,0,.2);white-space:nowrap}
#bdc .x{flex:none;width:38px;height:38px;border-radius:12px;border:1.5px solid #e0b860;background:rgba(0,0,0,.2);color:#ffd98a;font:800 17px 'Baloo 2',sans-serif}
#bdc .pat{display:flex;gap:10px;align-items:flex-end;margin-top:8px}#bdc .pat canvas{flex:none;image-rendering:pixelated}
#bdc .bul{flex:1;min-width:0;position:relative;background:#fffaf0;color:#1b2a44;border-radius:14px;padding:5px 10px;font-weight:700;font-size:13px;line-height:1.3;transition:opacity .2s}
#bdc .bul:before{content:'';position:absolute;left:-8px;bottom:10px;border:8px solid transparent;border-right-color:#fffaf0;border-left:0}
#bdc .store{flex:none;height:12px;background:repeating-linear-gradient(90deg,#1d4a8a 0 14px,#f2e8d2 14px 28px);box-shadow:0 3px 4px rgba(0,0,0,.12)}
#bdc .corps{flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch;overscroll-behavior:contain;padding:12px 12px calc(16px + env(safe-area-inset-bottom,0px))}
#bdc .sc{position:relative;height:232px;border-radius:22px;overflow:hidden;box-shadow:inset 0 0 0 2px #e2d6be}
#bdc .sc canvas.fond{position:absolute;inset:0;width:100%;height:100%}
#bdc .sc canvas.perso{position:absolute;left:50%;bottom:26px;transform:translateX(-50%);image-rendering:pixelated}
#bdc .sc .px{position:absolute;right:12px;top:10px;background:#1d4a8a;color:#ffd98a;border-radius:12px;padding:2px 10px;font-weight:800;font-size:15px;box-shadow:0 2px 0 #0e2a52}
#bdc .sc .px.ok{background:#2f8a4a;color:#fff;box-shadow:0 2px 0 #1e5e30}
#bdc .sc .tr{position:absolute;bottom:14px;width:34px;height:34px;border-radius:50%;border:0;background:rgba(255,255,255,.85);color:#1b2a44;font:800 18px 'Baloo 2',sans-serif;box-shadow:0 2px 0 rgba(0,0,0,.15)}
#bdc .sc .tr.g{left:12px}#bdc .sc .tr.d{right:12px}
#bdc .sc .ef{position:absolute;left:52px;right:52px;bottom:12px;display:flex;flex-wrap:wrap;gap:4px;justify-content:center}
#bdc .eff{display:inline-flex;align-items:center;gap:4px;border-radius:10px;padding:0 8px;font-weight:800;font-size:11.5px;background:#fffaf0;color:#1b2a44;border:1px solid #d8c8a4}
#bdc .eff.n{background:#fff4d8;border-color:#e0b860;color:#7a5410}
#bdc .lb{font-size:11px;font-weight:800;letter-spacing:2px;color:#8a7a5a;margin:12px 2px 6px;display:flex;justify-content:space-between;align-items:center}#bdc .lb i{font-style:normal;letter-spacing:0}
#bdc .lb button{border:0;background:none;font:800 11px 'Baloo 2',sans-serif;letter-spacing:0;color:#1d4a8a;text-decoration:underline;padding:0}
#bdc .su{display:grid;grid-template-columns:repeat(4,1fr);gap:6px}
#bdc .su button{position:relative;border:2px solid #d8c8a4;background:#fff;border-radius:14px;padding:5px 2px;font:800 12.5px 'Baloo 2',sans-serif;color:#1b2a44;display:flex;flex-direction:column;align-items:center;line-height:1.1}
#bdc .su button svg{width:20px;height:20px;fill:#1d4a8a;margin-bottom:1px}
#bdc .su button.on{border-color:#1d4a8a;background:#eaf1fb}
#bdc .su button em{position:absolute;top:4px;right:6px;width:8px;height:8px;border-radius:50%;background:#e0a628}
#bdc .pf{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}
#bdc .pf button{position:relative;border:2px solid #e2d6be;background:#fff;border-radius:14px;padding:6px 4px 7px;font:800 12.5px 'Baloo 2',sans-serif;color:#1b2a44;display:flex;flex-direction:column;align-items:center;gap:2px;line-height:1.15}
#bdc .pf button .vi{width:100%;height:56px;border-radius:10px;background:#f6f1e6;display:grid;place-items:center}
#bdc .pf button canvas{image-rendering:pixelated}
#bdc .pf button.on{border-color:#1d4a8a;background:#f2f7fe}
#bdc .pf .te{display:flex;gap:5px;min-height:14px;margin-top:1px}
#bdc .pf .te span{width:14px;height:14px;border-radius:50%;box-shadow:inset 0 0 0 1.5px rgba(0,0,0,.18)}
#bdc .pf .te span.on{box-shadow:0 0 0 2px #fff,0 0 0 3.5px #1d4a8a}
#bdc .pf small{font-size:11.5px;font-weight:800;color:#a07a30}#bdc .pf small.a{color:#2f8a4a}
#bdc .pf .pt{position:absolute;top:4px;left:4px;font-size:9.5px;font-weight:800;background:#1d4a8a;color:#fff;border-radius:7px;padding:0 5px}
#bdc .go{display:block;width:100%;margin-top:14px;border:0;border-radius:16px;padding:11px;font:800 17px 'Baloo 2',sans-serif;color:#fff;background:linear-gradient(#2f62b0,#1d4a8a);box-shadow:0 4px 0 #0e2a52;line-height:1.1}
#bdc .go small{display:block;font-size:12px;opacity:.85;font-weight:700}#bdc .go:active{transform:translateY(3px);box-shadow:0 1px 0 #0e2a52}
#bdc .go.vert{background:linear-gradient(#4cc070,#2f8a4a);box-shadow:0 4px 0 #1e5e30}#bdc .go[disabled]{opacity:.55}
#bdc .doc{display:block;width:100%;margin-top:8px;border:2px solid #d8c8a4;background:#fff;border-radius:14px;padding:7px;font:800 13px 'Baloo 2',sans-serif;color:#1b2a44}
@media(min-width:720px){#bdc .corps{display:grid;grid-template-columns:1fr 1fr;gap:0 18px;align-content:start;padding:14px 24px}#bdc .sc{height:auto;min-height:340px;grid-row:1/span 8}#bdc .lb:first-of-type{margin-top:0}}`;
const PAROLES=['« Le bleu de chauffe, c’est le costard du port. »','« Essaie, mon grand. Le miroir ne ment jamais. »','« Ça, c’est du solide. Ça a connu trois grèves. »','« Avec ça, même le mistral te respecte. »','« On ne vend pas des habits, on habille des dockers. »'];
function bulle(t){const b=RACINE&&RACINE.querySelector('.bul');if(!b)return;b.style.opacity='0';setTimeout(()=>{b.textContent=t;b.style.opacity='1';},180);}
function vib(x){try{vibrer&&vibrer(x);}catch(_){}}
/* MARCEL, le tailleur : moustache, casquette, veste bleue */
const AP_MARCEL={peau:2,cheveux:6,coiffe:0,barbe:2,haut:0,veste:17,bas:0,pantalon:9,souliers:0,chaussures:3,sac:0,chapeau:1,raye:0,motif:0,_pnj:true};
/* LE FOND DE LA SCÈNE : lambris de chêne, le portant chargé, la lampe, le parquet */
function dessineFond(cv){const W=cv.clientWidth||380,H=cv.clientHeight||232,D=Math.min(2,window.devicePixelRatio||1);cv.width=W*D;cv.height=H*D;const g=cv.getContext('2d');g.setTransform(D,0,0,D,0,0);
  const sol=H-58;let gr=g.createLinearGradient(0,0,0,sol);gr.addColorStop(0,'#efe4cc');gr.addColorStop(1,'#e2d2b0');g.fillStyle=gr;g.fillRect(0,0,W,sol);
  for(let x=0;x<W;x+=26){g.fillStyle='rgba(120,90,50,.12)';g.fillRect(x,0,1,sol);}
  /* le portant, de chaque côté, et ses vêtements */
  const C=['#1d4a8a','#24262a','#e8dcc0','#1e3a6a','#7a2232','#2f5a4a','#c9a24a','#3a3e46','#f2ece0'];
  for(const [x0,x1] of [[14,W*.5-62],[W*.5+62,W-14]]){g.fillStyle='#8a9098';g.fillRect(x0,30,x1-x0,3);g.fillRect(x0,30,2,sol-30);g.fillRect(x1-2,30,2,sol-30);
    for(let x=x0+8,k=Math.round(x0);x<x1-12;x+=15,k++){g.fillStyle='#8a9098';g.fillRect(x+5,26,1,6);const c=C[k%C.length];g.fillStyle=c;g.beginPath();g.moveTo(x,34);g.lineTo(x+12,34);g.lineTo(x+13,78+(k%3)*6);g.lineTo(x-1,78+(k%3)*6);g.fill();
      g.fillStyle='rgba(0,0,0,.12)';g.fillRect(x+5.5,34,1,40);}
    /* une pile de pliés au pied */
    for(let p=0;p<4;p++){g.fillStyle=C[(p*2+Math.round(x0))%C.length];g.fillRect(x0+10,sol-12-p*7,32,7);g.fillStyle='rgba(0,0,0,.12)';g.fillRect(x0+10,sol-6-p*7,32,1);}}
  /* la lampe de laiton au-dessus du tapis */
  g.fillStyle='#6a6e74';g.fillRect(W/2-.5,0,1,16);g.fillStyle='#c8a050';g.beginPath();g.moveTo(W/2-14,24);g.lineTo(W/2+14,24);g.lineTo(W/2+6,14);g.lineTo(W/2-6,14);g.fill();
  gr=g.createRadialGradient(W/2,40,0,W/2,sol-40,150);gr.addColorStop(0,'rgba(255,236,190,.5)');gr.addColorStop(1,'rgba(255,236,190,0)');g.fillStyle=gr;g.fillRect(0,0,W,H);
  /* la plinthe, le parquet, le tapis bleu */
  g.fillStyle='#a87a4a';g.fillRect(0,sol-4,W,6);gr=g.createLinearGradient(0,sol,0,H);gr.addColorStop(0,'#9a6e44');gr.addColorStop(1,'#7e5634');g.fillStyle=gr;g.fillRect(0,sol+2,W,H-sol);
  for(let y=sol+12;y<H;y+=11){g.fillStyle='rgba(0,0,0,.12)';g.fillRect(0,y,W,1);}
  g.fillStyle='rgba(0,0,0,.18)';g.beginPath();g.ellipse(W/2,H-30,70,15,0,0,7);g.fill();g.fillStyle='#1d4a8a';g.beginPath();g.ellipse(W/2,H-32,68,14,0,0,7);g.fill();
  g.strokeStyle='#e0b860';g.lineWidth=2;g.beginPath();g.ellipse(W/2,H-32,58,10,0,0,7);g.stroke();}
function rendreScene(){if(!RACINE)return;dessinePerso(RACINE.querySelector('canvas.perso'),apEssai(),2.6,DIRS[DIR]);
  const L=aPayer(),T=total(),px=RACINE.querySelector('.sc .px');
  const rien=!CATS.some(c=>ESSAI[c]&&!GRATUITS.has(ESSAI[c]))&&!(e.ap&&e.ap._civil);px.style.display=rien?'none':'block';
  if(L.length){px.className='px';px.textContent=T+' €';}else{px.className='px ok';px.textContent=dejaPorte()?'Porté ✓':'À toi ✓';}
  RACINE.querySelector('.sc .ef').innerHTML=CATS.filter(c=>ESSAI[c]&&!GRATUITS.has(ESSAI[c])).map(c=>{const P=PAR_ID[ESSAI[c]];return '<span class="eff'+(aMoi(P.v[0])?'':' n')+'">'+P.m.nom+(P.v[1]?' · '+P.v[1].toLowerCase():'')+'</span>';}).join('');
  const D0=depart();RACINE.querySelector('.lb .rz').style.visibility=CATS.some(c=>ESSAI[c]!==D0[c])?'visible':'hidden';}
function rendreOnglets(){RACINE.querySelectorAll('.su button').forEach(b=>{const c=b.dataset.c;b.classList.toggle('on',c===CAT);const em=b.querySelector('em');const pa=ESSAI[c]&&!aMoi(ESSAI[c]);if(pa&&!em)b.insertAdjacentHTML('beforeend','<em></em>');if(!pa&&em)em.remove();});
  RACINE.querySelector('.lb.ray b').textContent=CATALOGUE[CAT].nom.toUpperCase();RACINE.querySelector('.lb.ray i').textContent=CATALOGUE[CAT].modeles.length+' modèles';}
function rendreRayon(){const G=RACINE.querySelector('.pf');G.innerHTML='';const ap0=apEssai();
  CATALOGUE[CAT].modeles.forEach(m=>{const on=m.v.some(v=>v[0]===ESSAI[CAT]);const choisi=m.v.find(v=>v[0]===ESSAI[CAT])||m.v[0];
    const b=document.createElement('button');if(on)b.className='on';
    const vi=document.createElement('div');vi.className='vi';const cv=document.createElement('canvas');vi.appendChild(cv);b.appendChild(vi);
    vignette(cv,CAT,Object.assign({},ap0,choisi[4],{_pnj:true}));
    let h=m.nom+'<div class="te">';if(m.v.length>1)m.v.forEach(v=>{h+='<span data-id="'+v[0]+'" class="'+(on&&v[0]===choisi[0]?'on':'')+'" style="background:'+v[3]+'"></span>';});h+='</div>';
    h+=aMoi(choisi[0])?'<small class="a">'+(choisi[2]?'À toi ✓':'Gratuit')+'</small>':'<small>'+choisi[2]+' €</small>';
    if(e.ap&&e.ap._civil&&porteDans(CAT,e.ap)===choisi[0])h+='<span class="pt">PORTÉ</span>';
    b.insertAdjacentHTML('beforeend',h);
    b.onclick=ev=>{const sw=ev.target.closest('span[data-id]');const id=sw?sw.dataset.id:(on&&m.v.length>1?m.v[(m.v.indexOf(choisi)+1)%m.v.length][0]:choisi[0]);
      ESSAI[CAT]=id;vib(8);if(Math.random()<.35)bulle(PAROLES[Math.floor(Math.random()*PAROLES.length)]);rendreTout();};
    G.appendChild(b);});}
function rendreCaisse(){const b=RACINE.querySelector('.go');const L=aPayer(),T=total();RACINE.querySelector('.bo').textContent=enEuros(e.euros||0);b.disabled=false;b.className='go';
  if(L.length){b.innerHTML=(L.length>1?'Acheter la tenue · ':'Acheter · ')+T+' €<small>'+L.length+(L.length>1?' pièces':' pièce')+' · il te restera '+enEuros(Math.max(0,(e.euros||0)-T*100))+'</small>';
    if((e.euros||0)<T*100){b.innerHTML='Il te manque '+enEuros(T*100-(e.euros||0))+'<small>'+T+' € pour cette tenue</small>';b.disabled=true;}}
  else if(!CATS.some(c=>ESSAI[c]&&!GRATUITS.has(ESSAI[c]))&&!(e.ap&&e.ap._civil)){b.innerHTML='Choisis un vêtement<small>tu l’essaies tout de suite, sur toi</small>';b.disabled=true;}
  else if(dejaPorte()){b.innerHTML='Tu portes cette tenue<small>essaie une autre pièce pour la changer</small>';b.disabled=true;}
  else{b.className='go vert';b.innerHTML='Porter cette tenue<small>tout est déjà à toi</small>';}
  RACINE.querySelector('.doc').style.display=e.ap&&e.ap._civil?'block':'none';}
function rendreTout(){if(!RACINE)return;rendreScene();rendreOnglets();rendreRayon();rendreCaisse();}
function porterEssai(){const ski=e.ap&&e.ap.ski;const ap=apEssai();delete ap._pnj;ap._civil=true;if(ski)ap.ski=ski;e.ap=ap;try{sauver();}catch(x){}}
async function caisse(){if(ACHAT)return;const L=aPayer(),T=total(),b=RACINE.querySelector('.go');
  if(!L.length){if(dejaPorte())return;porterEssai();vib([10,30,10]);bulle('« Ça te va comme un gant. »');rendreTout();return;}
  if((e.euros||0)<T*100){bulle('« Reviens quand t’auras fait quelques shifts. »');vib(30);return;}
  ACHAT=true;b.disabled=true;b.innerHTML='…';
  for(const id of L){const r=await appelRPC('acheter_vetement',{p_joueur:e.id,p_article:id});
    if(!r||r.erreur){ACHAT=false;bulle('« '+(r&&r.erreur?String(r.erreur):'La caisse fait des siennes, réessaie.')+' »');rendreTout();return;}
    if(typeof r.euros==='number'){e.euros=r.euros;try{majHaut();}catch(x){}}MIENS.add(id);}
  e.garde=[...MIENS];ACHAT=false;porterEssai();try{e.ap._sac={k:'bdc',f:Date.now()+5*60*1000};sauver();monterEnLigne(true);}catch(x){}vib([14,30,14]);bulle(L.length>1?'« Toute la tenue ! Tu vas faire tourner des têtes sur le quai. »':'« Bon choix. Ça te va comme un gant. »');rendreTout();}
function fermer(){if(!RACINE)return;RACINE=null;try{fermeA=Date.now();}catch(x){}try{$('page2').classList.remove('on');}catch(x){}}
window.ouvrirBleuDeChauffe=async function(){
  if(!document.getElementById('bdcCss')){const s=document.createElement('style');s.id='bdcCss';s.textContent=CSS;document.head.appendChild(s);}
  try{(e.garde||[]).forEach(x=>MIENS.add(x));}catch(x){}
  CAT='hauts';DIR=0;ESSAI=depart();
  $('page2Fond').className='';$('page2').classList.add('on');
  $('page2Fond').innerHTML='<div id="bdc" lang="fr"><div class="hd"><div class="l1"><div class="ens"><b>Bleu de Chauffe</b><small>VÊTEMENTS DE TRAVAIL &amp; DE VILLE · DEPUIS 1948</small></div><div class="bo">—</div><button class="x" aria-label="Fermer">✕</button></div>'+
    '<div class="pat"><canvas class="marcel"></canvas><div class="bul">'+PAROLES[0]+'</div></div></div><div class="store"></div>'+
    '<div class="corps"><div class="sc"><canvas class="fond"></canvas><canvas class="perso"></canvas><div class="px"></div><button class="tr g" aria-label="Tourner">‹</button><button class="tr d" aria-label="Tourner">›</button><div class="ef"></div></div>'+
    '<div class="lb"><span>LE RAYON</span><button class="rz">↺ remettre ma tenue</button></div>'+
    '<div class="su">'+CATS.map(c=>'<button data-c="'+c+'">'+ICONES[c]+CATALOGUE[c].nom+'</button>').join('')+'</div>'+
    '<div class="lb ray"><b></b><i></i></div><div class="pf"></div>'+
    '<button class="go"></button><button class="doc">Remettre la tenue de docker</button></div></div>';
  RACINE=$('page2Fond').querySelector('#bdc');const d=RACINE;
  dessinePerso(d.querySelector('canvas.marcel'),AP_MARCEL,1.1,'bas');
  requestAnimationFrame(()=>dessineFond(d.querySelector('canvas.fond')));
  d.querySelector('.x').onclick=fermer;
  d.querySelectorAll('.su button').forEach(b=>b.onclick=()=>{CAT=b.dataset.c;vib(6);rendreOnglets();rendreRayon();});
  d.querySelector('.tr.g').onclick=()=>{DIR=(DIR+1)%4;rendreScene();};d.querySelector('.tr.d').onclick=()=>{DIR=(DIR+3)%4;rendreScene();};
  let x0=null;const sc=d.querySelector('.sc');sc.addEventListener('touchstart',ev=>{x0=ev.touches[0].clientX;},{passive:true});
  sc.addEventListener('touchmove',ev=>{if(x0===null)return;const dx=ev.touches[0].clientX-x0;if(Math.abs(dx)>36){DIR=(DIR+(dx>0?3:1))%4;x0=ev.touches[0].clientX;rendreScene();}},{passive:true});
  sc.addEventListener('touchend',()=>{x0=null;});
  d.querySelector('.rz').onclick=()=>{ESSAI=depart();vib(8);rendreTout();};
  d.querySelector('.doc').onclick=()=>{e.ap=Object.assign({},e.ap);delete e.ap._civil;try{sauver();}catch(x){}bulle('« Retour au boulot, alors ! »');rendreTout();};
  d.querySelector('.go').onclick=caisse;
  rendreTout();
  try{const r=await appelRPC('mes_vetements',{p_joueur:e.id});if(Array.isArray(r)){r.forEach(x=>MIENS.add(x));e.garde=[...MIENS];rendreTout();}}catch(x){}};
})();
