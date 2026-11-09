/* =====================================================================
   BLEU DE CHAUFFE — la boutique de vêtements de la Galerie Bleue.
   Un écran à part, chargé à la demande quand on pousse la porte
   (terrasses.js l'évalue sur place : il voit e, appelRPC, enEuros…).
   Le portant défile ; on touche un vêtement, on l'essaie sur le tapis ;
   on l'achète (le serveur débite et garde la trace) ; on le porte.
   Au port, on reste en tenue de docker : la tenue civile se porte ailleurs.
   ===================================================================== */
(()=>{
const CATALOGUE={
  'Hauts':[
    ['h_veste_bleu','Veste de travail','Le bleu de chauffe, coton épais, poches plaquées.',240,{haut:0,veste:17}],
    ['h_veste_noire','Veste noire','La même coupe, en toile noire. Sobre.',260,{haut:0,veste:20}],
    ['h_chemise_lin','Chemise en lin','Écrue, légère, pour les soirs d’été.',160,{haut:2,veste:24}],
    ['h_chemise_bleu','Chemise bleue','Oxford bleu marine, col boutonné.',120,{haut:2,veste:16}],
    ['h_pull_marin','Pull marin','Laine bleu nuit, maille serrée.',140,{haut:3,veste:16}],
    ['h_pull_bordeaux','Pull bordeaux','Le même, couleur vin.',130,{haut:3,veste:22}],
    ['h_tshirt_blanc','T-shirt blanc','Coton lourd, coupe droite.',45,{haut:1,veste:19}],
    ['h_tshirt_vert','T-shirt vert','Vert pin, délavé juste ce qu’il faut.',45,{haut:1,veste:21}],
    ['h_manteau','Manteau','Drap de laine anthracite, pour le mistral.',380,{haut:5,veste:11}],
    ['h_gilet_moutarde','Gilet moutarde','Sans manches, à porter sur une chemise.',95,{haut:6,veste:23}]],
  'Bas':[
    ['b_jean','Jean brut','Toile indigo, coupe droite.',90,{bas:0,pantalon:8}],
    ['b_chino','Chino écru','Léger, se roule aux chevilles.',85,{bas:0,pantalon:10}],
    ['b_noir','Pantalon noir','Pour sortir.',95,{bas:0,pantalon:9}],
    ['b_treillis','Treillis kaki','Poches cargo, toile solide.',75,{bas:3,pantalon:12}],
    ['b_short','Short écru','Pour la plage.',50,{bas:1,pantalon:10}],
    ['b_bermuda','Bermuda bleu','Long, au-dessus du genou.',55,{bas:5,pantalon:0}]],
  'Chaussures':[
    ['c_baskets_blanc','Baskets blanches','Cuir blanc, semelle crème.',110,{souliers:1,chaussures:6}],
    ['c_baskets_marine','Baskets marine','Toile bleu marine.',110,{souliers:1,chaussures:7}],
    ['c_bottes_cuir','Bottes en cuir','Cuir fauve, cousues main.',220,{souliers:0,chaussures:3}],
    ['c_bottillons','Bottillons','Daim brun, à lacets.',180,{souliers:3,chaussures:5}],
    ['c_sandales','Sandales','Cuir, pour l’été.',40,{souliers:2,chaussures:9}]],
  'Casquettes':[
    ['k_aucune','Tête nue','Rien sur la tête.',0,{chapeau:0}],
    ['k_casquette','Casquette','Toile, visière courbe.',35,{chapeau:1}],
    ['k_bonnet','Bonnet','Laine côtelée, pour l’hiver.',30,{chapeau:3}],
    ['k_beret','Béret','Feutre de laine.',45,{chapeau:6}],
    ['k_chapeau','Chapeau','Paille tressée.',90,{chapeau:5}]]};
const CATS=Object.keys(CATALOGUE);
const GRATUITS=new Set(['k_aucune']);
let CAT='Hauts', SEL=0, ESSAI=null, MIENS=new Set(), RACINE=null;
/* la base de l'essayage : ton visage, sans déguisement ni tenue de ski, en tenue civile simple si tu n'en as pas encore */
const base=()=>{const ap=Object.assign({},DEF_AP,e.ap||{},e.ap&&e.ap._civil?{}:{haut:1,veste:19,bas:0,pantalon:8,souliers:1,chaussures:6,chapeau:0,motif:0,raye:0},{sac:0});
  delete ap.deguisement;delete ap.ski;return ap;};
const CSS=`#bdc{position:fixed;inset:0;z-index:2147482000;font-family:"Helvetica Neue",Arial,sans-serif;background:linear-gradient(#e4dccb,#d6c8ae 56%,#8a6440 56%,#6a4a2c);overflow:hidden;opacity:0;transition:opacity .25s;touch-action:manipulation;user-select:none;-webkit-user-select:none}
#bdc .hd{position:absolute;left:0;right:0;top:0;background:#0f2a50;color:#e0b860;text-align:center;padding:calc(12px + env(safe-area-inset-top)) 0 10px;border-bottom:2px solid #c8a050}
#bdc .hd b{font:800 22px "Helvetica Neue",Arial;letter-spacing:.06em;display:block}#bdc .hd small{display:block;color:#c8d8f0;font-size:9px;letter-spacing:.25em;margin-top:3px}
#bdc .x{position:absolute;right:12px;bottom:12px;width:36px;height:36px;border-radius:50%;background:#1d3d6a;color:#fff;border:0;font-size:20px}
#bdc .argent{display:inline-block;margin-top:7px;background:#1d3d6a;color:#e0b860;border-radius:14px;padding:4px 12px;font-weight:700;font-size:12px}
#bdc .rail{position:absolute;left:0;right:0;top:calc(108px + env(safe-area-inset-top));height:120px}
#bdc .barre{position:absolute;left:8px;right:8px;top:14px;height:6px;border-radius:3px;background:linear-gradient(#e2e6ea,#8a9098);box-shadow:0 2px 3px rgba(0,0,0,.2)}
#bdc .cintres{position:absolute;left:0;right:0;top:8px;display:flex;overflow-x:auto;padding:0 10px 10px;gap:4px;scrollbar-width:none}
#bdc .cintres::-webkit-scrollbar{display:none}
#bdc .ci{flex:0 0 70px;text-align:center;position:relative;transition:transform .15s;border:0;background:none;padding:0}
#bdc .ci.on{transform:translateY(8px)}#bdc .ci.on .px{color:#0f2a50}
#bdc .ci canvas{image-rendering:pixelated;display:block;margin:0 auto;width:66px;height:45px}
#bdc .croc{width:2px;height:9px;background:#8a9098;margin:0 auto}#bdc .epaule{width:32px;height:2px;background:#8a9098;margin:0 auto}
#bdc .px{font-size:11px;font-weight:800;color:#a07a30;margin-top:3px}#bdc .px.pok{color:#2f8a4a;background:none}
#bdc .ci.on:after{content:'';position:absolute;left:12px;right:12px;bottom:-8px;height:3px;border-radius:2px;background:#e0b860}
#bdc .cats{position:absolute;left:10px;right:10px;top:calc(238px + env(safe-area-inset-top));display:flex;gap:6px}
#bdc .cats button{flex:1;border:0;padding:9px 0;border-radius:20px;background:rgba(15,42,80,.12);color:#0f2a50;font-weight:700;font-size:12px}#bdc .cats button.on{background:#0f2a50;color:#fff}
#bdc .scene{position:absolute;left:0;right:0;top:calc(282px + env(safe-area-inset-top));bottom:150px}
#bdc canvas.decor{position:absolute;inset:0;width:100%;height:100%}
#bdc .tapis{position:absolute;left:50%;bottom:6px;transform:translateX(-50%);width:220px;height:46px;border-radius:50%;background:radial-gradient(#2a5aa8,#173a6a);box-shadow:0 6px 0 #0f2a50}
#bdc canvas.p{position:absolute;left:50%;bottom:26px;transform:translateX(-50%);image-rendering:pixelated;height:min(88%,264px)}
#bdc *{box-sizing:border-box}
#bdc .fiche{display:block;position:absolute;left:10px;right:10px;bottom:calc(10px + env(safe-area-inset-bottom));background:#fffaf0;border-radius:18px;padding:14px;box-shadow:0 6px 18px rgba(0,0,0,.25)}
#bdc .fiche h3{display:block;font-size:17px;color:#0f2a50;margin:0;font-weight:800}#bdc .fiche p{display:block;font-size:12px;color:#6a7480;margin:3px 0 10px;min-height:16px}
#bdc .btns{display:flex;gap:8px}#bdc .btns button{flex:1;border:0;border-radius:14px;padding:14px 6px;font-weight:800;font-size:15px}
#bdc .b1{background:#e8eef6;color:#0f2a50}#bdc .b2{background:#0f2a50;color:#fff}#bdc .b2 span{color:#e0b860}#bdc .b2.porte{background:#2f8a4a}#bdc .b2:disabled{opacity:.45}
#bdc .mot{position:absolute;left:50%;top:44%;transform:translate(-50%,-50%);background:rgba(15,42,80,.92);color:#fff;padding:10px 16px;border-radius:14px;font-weight:700;font-size:14px;opacity:0;transition:opacity .2s;pointer-events:none;text-align:center;max-width:80%}`;
function dessine(cv,ap,s,dx,dy){const g=cv.getContext('2d');g.imageSmoothingEnabled=false;g.clearRect(0,0,cv.width,cv.height);g.save();g.scale(s,s);personne(g,dx,dy,ap,'bas',0,false);g.restore();}
function mot(t){const m=RACINE&&RACINE.querySelector('.mot');if(!m)return;m.textContent=t;m.style.opacity='1';clearTimeout(mot.t);mot.t=setTimeout(()=>m.style.opacity='0',1600);}
function article(){return CATALOGUE[CAT][SEL];}
function aMoi(id){return GRATUITS.has(id)||MIENS.has(id);}
function porte(A){return Object.keys(A[4]).every(k=>e.ap&&e.ap._civil&&(e.ap[k]||0)===A[4][k]);}

/* LE FOND DE LA BOUTIQUE : lambris de chêne, deux étagères de pliés, le grand miroir, les suspensions */
function decorScene(){const cv=RACINE&&RACINE.querySelector('canvas.decor');if(!cv)return;const W=cv.clientWidth,H=cv.clientHeight,D=Math.min(2,window.devicePixelRatio||1);
  cv.width=W*D;cv.height=H*D;const g=cv.getContext('2d');g.setTransform(D,0,0,D,0,0);const sol=H*.72;
  let gr=g.createLinearGradient(0,0,0,sol);gr.addColorStop(0,'#e9dfca');gr.addColorStop(1,'#dccdb0');g.fillStyle=gr;g.fillRect(0,0,W,sol);
  for(let x=0;x<W;x+=28){g.fillStyle='rgba(120,90,50,.12)';g.fillRect(x,0,1,sol);}
  g.fillStyle='#b88a5a';g.fillRect(0,sol-10,W,10);g.fillStyle='rgba(255,255,255,.3)';g.fillRect(0,sol-10,W,1.4);
  gr=g.createLinearGradient(0,sol,0,H);gr.addColorStop(0,'#9a6e44');gr.addColorStop(1,'#7a5432');g.fillStyle=gr;g.fillRect(0,sol,W,H-sol);
  for(let y=sol+14;y<H;y+=14){g.fillStyle='rgba(0,0,0,.12)';g.fillRect(0,y,W,1);}
  for(let k=0;k<30;k++){const y=sol+Math.floor(k/6)*14,x=(k%6)*80+(Math.floor(k/6)%2)*40;g.fillStyle='rgba(0,0,0,.12)';g.fillRect(x,y,1,14);}
  /* le grand miroir derrière le tapis */
  const mw=Math.min(170,W*.42),mh=sol*.86,mx=W/2-mw/2,my=sol-mh-4;
  g.fillStyle='#c8a050';g.beginPath();g.roundRect(mx-6,my-6,mw+12,mh+12,[mw/2+6,mw/2+6,6,6]);g.fill();
  gr=g.createLinearGradient(mx,my,mx+mw,my+mh);gr.addColorStop(0,'#f6fafc');gr.addColorStop(.5,'#dfe8ec');gr.addColorStop(1,'#c8d4da');g.fillStyle=gr;g.beginPath();g.roundRect(mx,my,mw,mh,[mw/2,mw/2,3,3]);g.fill();
  g.fillStyle='rgba(255,255,255,.5)';g.beginPath();g.moveTo(mx+mw*.2,my+mh*.15);g.lineTo(mx+mw*.32,my+mh*.12);g.lineTo(mx+mw*.12,my+mh*.9);g.lineTo(mx,my+mh*.9);g.fill();
  /* les étagères de pliés, de chaque côté */
  const COUL=['#1d3f74','#2a5aa8','#ece2c8','#3a3e44','#8a2a3a','#2f4a3a','#c9a24a','#f2ece0'];
  for(const [ex,ew] of [[8,mx-22],[mx+mw+14,W-mx-mw-22]]){if(ew<40)continue;
    for(let r=0;r<4;r++){const y=24+r*(sol-40)/4;g.fillStyle='#8a6440';g.fillRect(ex,y+26,ew,4);g.fillStyle='rgba(0,0,0,.15)';g.fillRect(ex,y+30,ew,3);
      for(let k=0;k*22<ew-20;k++){for(let p=0;p<3;p++){g.fillStyle=COUL[(r*3+k+p)%COUL.length];g.fillRect(ex+4+k*22,y+20-p*6,18,6);g.fillStyle='rgba(0,0,0,.12)';g.fillRect(ex+4+k*22,y+25-p*6,18,1);}}}}
  /* trois suspensions de laiton */
  for(const lx of [W*.18,W*.5,W*.82]){g.fillStyle='#6a6e74';g.fillRect(lx-.5,0,1,18);g.fillStyle='#c8a050';g.beginPath();g.moveTo(lx-12,26);g.lineTo(lx+12,26);g.lineTo(lx+5,16);g.lineTo(lx-5,16);g.fill();
    const h=g.createRadialGradient(lx,30,0,lx,30,70);h.addColorStop(0,'rgba(255,236,190,.55)');h.addColorStop(1,'rgba(255,236,190,0)');g.fillStyle=h;g.fillRect(lx-70,20,140,90);}}
function rendre(){if(!RACINE)return;const A=article();
  RACINE.querySelector('.argent').textContent=enEuros(e.euros||0);
  RACINE.querySelectorAll('.cats button').forEach(b=>b.classList.toggle('on',b.dataset.c===CAT));
  const CI=RACINE.querySelector('.cintres');CI.innerHTML='';
  CATALOGUE[CAT].forEach((a,i)=>{const d=document.createElement('button');d.className='ci'+(i===SEL?' on':'');
    d.innerHTML='<div class="croc"></div><div class="epaule"></div>';
    const t=document.createElement('canvas');t.width=96;t.height=128;dessine(t,Object.assign(base(),a[4],{_civil:true,_pnj:true}),2,24,58);
    const cv=document.createElement('canvas');cv.width=44;cv.height=30;const g=cv.getContext('2d');g.imageSmoothingEnabled=false;
    const zone=CAT==='Hauts'?[26,50,44,30]:CAT==='Bas'?[26,80,44,30]:CAT==='Chaussures'?[26,96,44,30]:[26,10,44,30];
    g.drawImage(t,zone[0],zone[1],zone[2],zone[3],0,0,44,30);d.appendChild(cv);
    d.insertAdjacentHTML('beforeend','<div class="px'+(aMoi(a[0])?' pok':'')+'">'+(aMoi(a[0])?'À toi':a[3]+' €')+'</div>');
    d.onclick=()=>{SEL=i;ESSAI=Object.assign(ESSAI||base(),a[4]);try{vibrer&&vibrer(8);}catch(x){}rendre();};CI.appendChild(d);});
  dessine(RACINE.querySelector('canvas.p'),Object.assign({},ESSAI||base(),{_civil:true,_pnj:true}),2,24,58);
  RACINE.querySelector('.fiche h3').textContent=A[1];RACINE.querySelector('.fiche p').textContent=A[2];
  const b2=RACINE.querySelector('.b2');b2.disabled=false;b2.classList.remove('porte');
  if(porte(A)){b2.innerHTML='Porté ✓';b2.disabled=true;b2.classList.add('porte');}
  else if(aMoi(A[0]))b2.innerHTML='Porter';
  else{b2.innerHTML='Acheter <span>'+A[3]+' €</span>';if((e.euros||0)<A[3]*100)b2.disabled=true;}
  RACINE.querySelector('.b1').textContent=e.ap&&e.ap._civil?'Tenue de docker':'Remettre ma tenue';}
function porter(A){const ski=e.ap&&e.ap.ski;e.ap=Object.assign({},base(),A[4],{_civil:true});if(ski)e.ap.ski=ski;delete e.ap._pnj;ESSAI=null;try{sauver();}catch(x){}mot('Tu portes : '+A[1]);rendre();}
async function acheter(){const A=article();if(aMoi(A[0])){porter(A);return;}
  if((e.euros||0)<A[3]*100){mot('Il te manque '+enEuros(A[3]*100-(e.euros||0))+'.');return;}
  const b2=RACINE.querySelector('.b2');b2.disabled=true;b2.textContent='…';
  const r=await appelRPC('acheter_vetement',{p_joueur:e.id,p_article:A[0]});
  if(!r||r.erreur){mot(r&&r.erreur?String(r.erreur):'La caisse n’a pas répondu.');rendre();return;}
  if(typeof r.euros==='number'){e.euros=r.euros;try{majHaut();}catch(x){}}
  MIENS.add(A[0]);try{e.garde=[...MIENS];}catch(x){}try{vibrer&&vibrer([14,26,14]);}catch(x){}porter(A);}
function fermer(){if(!RACINE)return;const R0=RACINE;RACINE=null;R0.style.opacity='0';setTimeout(()=>R0.remove(),260);try{window.FP_GEL=0;}catch(x){}}
window.ouvrirBleuDeChauffe=async function(){if(RACINE)return;
  if(!document.getElementById('bdcCss')){const s=document.createElement('style');s.id='bdcCss';s.textContent=CSS;document.head.appendChild(s);}
  CAT='Hauts';SEL=0;ESSAI=Object.assign(base(),CATALOGUE.Hauts[0][4]);try{(e.garde||[]).forEach(x=>MIENS.add(x));}catch(x){}
  const d=document.createElement('div');d.id='bdc';RACINE=d;
  d.innerHTML='<div class="hd"><b>BLEU DE CHAUFFE</b><small>VÊTEMENTS DE TRAVAIL &amp; DE VILLE</small><div class="argent"></div><button class="x">×</button></div>'+
    '<div class="rail"><div class="barre"></div><div class="cintres"></div></div>'+
    '<div class="cats">'+CATS.map(c=>'<button data-c="'+c+'">'+c+'</button>').join('')+'</div>'+
    '<div class="scene"><canvas class="decor"></canvas><div class="tapis"></div><canvas class="p" width="96" height="128" style="aspect-ratio:3/4"></canvas></div>'+
    '<div class="fiche"><h3></h3><p></p><div class="btns"><button class="b1"></button><button class="b2"></button></div></div><div class="mot"></div>';
  document.body.appendChild(d);requestAnimationFrame(()=>d.style.opacity='1');window.FP_GEL=Date.now()+86400000;
  d.querySelector('.x').onclick=fermer;
  d.querySelectorAll('.cats button').forEach(b=>b.onclick=()=>{CAT=b.dataset.c;SEL=0;ESSAI=Object.assign(ESSAI||base(),CATALOGUE[CAT][0][4]);rendre();RACINE.querySelector('.cintres').scrollLeft=0;});
  d.querySelector('.b2').onclick=acheter;
  d.querySelector('.b1').onclick=()=>{if(ESSAI){ESSAI=null;rendre();return;}
    if(e.ap&&e.ap._civil){e.ap=Object.assign({},e.ap);delete e.ap._civil;try{sauver();}catch(x){}mot('Tu remets la tenue de docker.');}rendre();};
  rendre();requestAnimationFrame(decorScene);
  try{const r=await appelRPC('mes_vetements',{p_joueur:e.id});if(Array.isArray(r)){r.forEach(x=>MIENS.add(x));e.garde=[...MIENS];rendre();}}catch(x){}};
})();
