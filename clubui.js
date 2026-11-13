/* =====================================================================
   LES COMPTOIRS DU DISCO CLUB — le bar à cocktails, le carré VIP,
   le tableau des champions, la platine VIP. Une feuille qui monte du bas.
   Chargé par club.js (eval direct) : voit e, appelRPC, vibrer, texteVolant,
   joueur, sauver, majHaut, enEuros…
   ===================================================================== */
(()=>{
const COCKTAILS=[
 ['neon','Néon Fizz','🍸','Une aura néon rose et bleue qui pulse autour de toi.',800,45],
 ['paillettes','Paillettes Pop','🥂','Une pluie de paillettes dorées tombe sur toi.',1200,45],
 ['bulles','Bulles de Lune','🫧','Des bulles légères montent tout autour de toi.',1500,45],
 ['arc','Arc-en-ciel','🌈','Des anneaux arc-en-ciel tournent à tes pieds.',2500,60],
 ['tornade','Tornade Tropicale','🍹','Tu files 25 % plus vite, avec des tourbillons verts.',4000,45],
 ['etoile','Étoile Filante','✨','Un halo doré et trois étoiles qui tournent autour de ta tête.',8000,60]];
const DORE=['dore','Cocktail Doré','🏆','Réservé aux VIP : halo doré, couronne flottante, pluie d’or. Offert.',0,90];
let RAC=null;
const vib=x=>{try{vibrer(x);}catch(_){}};
const eu=v=>Number(v).toLocaleString('fr-FR')+' €';
const CSS=`#cbu{position:fixed;inset:0;z-index:2147482300;display:flex;align-items:flex-end;justify-content:center;background:rgba(10,2,18,.55);font-family:'Baloo 2',system-ui,sans-serif;color:#f6efff;opacity:0;transition:opacity .2s;user-select:none;-webkit-user-select:none}
#cbu.on{opacity:1}#cbu *{box-sizing:border-box}
#cbu .pan{width:100%;max-width:560px;max-height:88vh;display:flex;flex-direction:column;background:linear-gradient(#2a0a3a,#14061e);border:1px solid rgba(255,106,216,.45);border-bottom:0;border-radius:24px 24px 0 0;box-shadow:0 -10px 40px rgba(255,58,200,.25);transform:translateY(30px);transition:transform .25s}
#cbu.on .pan{transform:none}
#cbu .hd{display:flex;align-items:center;gap:10px;padding:16px 16px 8px}#cbu .hd b{flex:1;font:900 24px/1 'Baloo 2',sans-serif;color:#fff;text-shadow:0 0 8px #ff3ac8}
#cbu .hd small{display:block;font-size:11px;letter-spacing:2px;color:#ffb8ec;font-weight:800;text-shadow:none;margin-top:3px}
#cbu .bo{border:1px solid #ff6ad8;border-radius:999px;padding:3px 10px;font-weight:800;font-size:13px;background:rgba(0,0,0,.35)}
#cbu .x{width:36px;height:36px;border-radius:50%;border:1px solid #ff6ad8;background:rgba(0,0,0,.35);color:#fff;font:800 15px 'Baloo 2',sans-serif}
#cbu .corps{overflow-y:auto;-webkit-overflow-scrolling:touch;padding:6px 14px calc(18px + env(safe-area-inset-bottom,0px))}
#cbu .it{display:flex;align-items:center;gap:12px;width:100%;margin-top:8px;padding:10px 12px;border-radius:16px;border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.05);color:#fff;text-align:left;font-family:inherit}
#cbu .it .ic{font-size:30px;width:40px;text-align:center}#cbu .it .tx{flex:1;min-width:0}#cbu .it b{display:block;font-size:16px}#cbu .it small{display:block;font-size:12px;color:rgba(255,230,250,.75);font-weight:600;line-height:1.25}
#cbu .it .pr{font-weight:900;font-size:14px;color:#ffd23a;white-space:nowrap}#cbu .it.dore{border-color:#e0b040;background:linear-gradient(90deg,rgba(224,176,64,.2),rgba(224,176,64,.05))}#cbu .it[disabled]{opacity:.45}
#cbu .msg{margin-top:10px;text-align:center;font-weight:800;font-size:14px;color:#ffd8f4;min-height:20px}
#cbu .vip{text-align:center;padding:8px 0}#cbu .vip .cr{font-size:44px}#cbu .vip h3{margin:2px 0 4px;font:900 22px 'Baloo 2',sans-serif;color:#ffd23a}
#cbu .li{display:flex;align-items:center;gap:10px;padding:8px 4px;border-bottom:1px solid rgba(255,255,255,.08);font-weight:700;font-size:14px}#cbu .li i{font-style:normal;font-size:20px;width:28px;text-align:center}#cbu .li .vk{margin-left:auto;color:#7aff6a}#cbu .li .vn{margin-left:auto;color:rgba(255,255,255,.4)}
#cbu .go{display:block;width:100%;margin-top:12px;border:0;border-radius:16px;padding:12px;font:800 16px 'Baloo 2',sans-serif;color:#2a0a30;background:linear-gradient(#fff2b8,#e8b838 60%,#c8902a);box-shadow:0 4px 0 #7a5214}#cbu .go[disabled]{opacity:.5}
#cbu .ch{display:flex;align-items:center;gap:10px;padding:9px 8px;border-radius:12px;font-weight:800}#cbu .ch:nth-child(odd){background:rgba(255,255,255,.04)}#cbu .ch.moi{background:rgba(255,58,200,.18);border:1px solid #ff6ad8}
#cbu .ch .rg{width:30px;text-align:center;font-size:18px}#cbu .ch .ps{flex:1;font-size:15px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}#cbu .ch .nv{color:#ffd23a}#cbu .ch .vc{font-size:12px;color:#ffb8ec;margin-left:8px}
#cbu .mus{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:8px}#cbu .mus button{border:1px solid rgba(255,255,255,.18);border-radius:16px;padding:14px 4px;background:rgba(255,255,255,.06);color:#fff;font:800 15px 'Baloo 2',sans-serif}
#cbu .mus button i{display:block;font-style:normal;font-size:28px}#cbu .mus button.on{border-color:#ff6ad8;background:linear-gradient(#ff6ad8,#b81a98);box-shadow:0 0 14px rgba(255,58,200,.5)}`;
function feuille(titre,sous,html){fermer(true);if(!document.getElementById('cbuCss')){const s=document.createElement('style');s.id='cbuCss';s.textContent=CSS;document.head.appendChild(s);}
 const d=document.createElement('div');d.id='cbu';RAC=d;d.innerHTML='<div class="pan"><div class="hd"><b>'+titre+'<small>'+sous+'</small></b><span class="bo">'+enEuros(e.euros||0)+'</span><button class="x" aria-label="Fermer">✕</button></div><div class="corps">'+html+'</div></div>';
 document.body.appendChild(d);requestAnimationFrame(()=>d.classList.add('on'));window.ECRAN_COUVRANT=true;
 d.querySelector('.x').onclick=()=>{vib(8);fermer();};d.addEventListener('click',ev=>{if(ev.target===d){vib(8);fermer();}});return d;}
function fermer(vite){if(!RAC)return;const R0=RAC;RAC=null;window.ECRAN_COUVRANT=false;if(vite){R0.remove();return;}R0.classList.remove('on');setTimeout(()=>R0.remove(),220);}
const solde=()=>{if(RAC)RAC.querySelector('.bo').textContent=enEuros(e.euros||0);};

/* ---------- LE BAR ---------- */
window.ouvrirBarClub=function(o){o=o||{};const L=o.dore?[DORE]:COCKTAILS.concat([DORE]);
 const d=feuille(o.dore?'Le bar VIP':'Le bar à cocktails',o.dore?'RÉSERVÉ AUX VIP · OFFERT':'SANS ALCOOL · EFFETS SPÉCIAUX',
  L.map(c=>'<button class="it'+(c[0]==='dore'?' dore':'')+'" data-k="'+c[0]+'"'+(c[0]==='dore'&&!o.vip?' disabled':'')+'><span class="ic">'+c[2]+'</span><span class="tx"><b>'+c[1]+'</b><small>'+c[3]+' · '+c[5]+' s</small></span><span class="pr">'+(c[4]?eu(c[4]):(o.vip?'Offert':'🔒 VIP'))+'</span></button>').join('')+'<div class="msg"></div>');
 const msg=d.querySelector('.msg');
 d.querySelectorAll('.it').forEach(b=>b.onclick=async()=>{const c=L.find(x=>x[0]===b.dataset.k);if(!c||b.disabled)return;if(c[4]&&(e.euros||0)<c[4]*100){msg.textContent='Il te manque '+eu(Math.ceil((c[4]*100-(e.euros||0))/100))+'.';vib(30);return;}
  vib(10);d.querySelectorAll('.it').forEach(x=>x.disabled=true);msg.textContent='Le barman secoue le shaker…';
  let r=null;try{r=await appelRPC('club_cocktail',{p_k:c[0]});}catch(x){}
  if(!r||!r.ok){msg.textContent=r&&r.erreur==='pas_assez'?'Pas assez d’euros.':r&&r.erreur==='vip'?'Réservé aux VIP.':'Le barman prépare sa carte, reviens très vite !';d.querySelectorAll('.it').forEach(x=>x.disabled=(x.dataset.k==='dore'&&!o.vip));return;}
  if(typeof r.euros==='number'){e.euros=r.euros;try{majHaut();}catch(x){}}
  window.EFFET_CLUB={k:c[0],fin:Date.now()+c[5]*1000};if(c[0]==='tornade')window.BOOST_CAFE={vit:1.25,fin:Date.now()+c[5]*1000};
  try{e.ap=Object.assign({},e.ap||{},{_tasse:{k:'jus',f:Date.now()+30000}});sauver();}catch(x){}
  vib([10,30,10]);fermer();try{texteVolant(joueur.x,joueur.y-64,c[2]+' '+c[1]+' !','#ffd8f4');}catch(x){}});};

/* ---------- LE CARRÉ VIP ---------- */
window.ouvrirVipClub=function(S){S=S||{};const vip=!!S.vip,niv=S.niveau||1,roi=!!(e.cos&&e.cos.disco_roi),pass=!!(e.cos&&e.cos.pass_vip);
 const AV=[['🛁','Le jacuzzi à bulles'],['🏆','Le Cocktail Doré, offert'],['🎧','La platine : tu choisis la musique du club'],['🎉','Le canon à confettis'],['💰','+25 % de gains à la Battle de danse']];
 const html=vip?('<div class="vip"><div class="cr">👑</div><h3>Bienvenue au carré VIP</h3><div class="msg">Le cordon s’ouvre pour toi.</div></div>'+AV.map(a=>'<div class="li"><i>'+a[0]+'</i>'+a[1]+'<span class="vk">✓</span></div>').join(''))
  :('<div class="vip"><div class="cr">🚫</div><h3>Réservé aux VIP</h3><div class="msg">« Pas de nom, pas d’entrée. » Trois façons d’être sur la liste :</div></div>'+
   '<div class="li"><i>💃</i>Atteindre le niveau 10 à la Battle de danse<span class="'+(niv>=10?'vk':'vn')+'">niv. '+niv+' / 10</span></div>'+
   '<div class="li"><i>👑</i>Porter la tenue Le Roi du Disco (vestiaire)<span class="'+(roi?'vk':'vn')+'">'+(roi?'✓':'—')+'</span></div>'+
   '<div class="li"><i>🎟️</i>Prendre le pass VIP, à vie<span class="'+(pass?'vk':'vn')+'">250 000 €</span></div>'+
   '<div style="margin-top:10px;font-weight:800;font-size:13px;color:#ffb8ec">Dans le carré :</div>'+AV.map(a=>'<div class="li"><i>'+a[0]+'</i>'+a[1]+'</div>').join('')+
   '<button class="go" data-a="pass"'+((e.euros||0)<25000000?' disabled':'')+'>'+((e.euros||0)<25000000?'Il te manque '+eu(Math.ceil((25000000-(e.euros||0))/100))+' pour le pass':'Prendre le pass VIP · 250 000 €')+'</button><div class="msg m2"></div>');
 const d=feuille('Le carré VIP',vip?'TU ES SUR LA LISTE':'LA LISTE DU VIDEUR',html);
 const b=d.querySelector('[data-a=pass]');if(b)b.onclick=async()=>{b.disabled=true;b.textContent='…';let r=null;try{r=await appelRPC('acheter_cosmetique',{p_joueur:e.id,p_piece:'pass_vip'});}catch(x){}
  const m=d.querySelector('.m2');if(!r||r.erreur){m.textContent=r&&r.erreur==='piece inconnue'?'Le pass arrive très bientôt !':r&&r.erreur==='pas_assez'?'Pas assez d’euros.':'La caisse fait des siennes, réessaie.';b.disabled=false;b.textContent='Prendre le pass VIP · 250 000 €';return;}
  if(typeof r.euros==='number'){e.euros=r.euros;try{majHaut();}catch(x){}}e.cos=Object.assign({},e.cos||{},{pass_vip:true});vib([20,40,20,40,60]);try{window.CLUB_RAFRAICHIR&&window.CLUB_RAFRAICHIR();}catch(x){}window.ouvrirVipClub(Object.assign({},S,{vip:true}));};};

/* ---------- LE TABLEAU DES CHAMPIONS ---------- */
window.ouvrirChampionsClub=function(L){L=Array.isArray(L)?L:[];const moi=String(e.pseudo||'');const M=['🥇','🥈','🥉'];
 const html=L.length?L.map((C,i)=>'<div class="ch'+(C.pseudo===moi?' moi':'')+'"><span class="rg">'+(M[i]||(i+1))+'</span><span class="ps">'+String(C.pseudo).replace(/[<>&]/g,'')+'</span><span class="nv">niv. '+C.niveau+'</span><span class="vc">'+C.victoires+' vict.</span></div>').join('')
  :'<div class="vip"><div class="cr">🏆</div><h3>Personne encore !</h3><div class="msg">Gagne une Battle de danse : ton nom s’affichera ici, en lettres d’or.</div></div>';
 feuille('Les champions','BATTLE DE DANSE · LES 10 MEILLEURS',html+'<div class="msg">Classés par niveau atteint, puis par victoires.</div>');};

/* ---------- LA PLATINE VIP ---------- */
window.ouvrirMusiqueClub=function(){const S=[['disco','🪩','Disco'],['funk','🎸','Funk'],['house','🎹','House']],c=window.DISCO_STYLE||'disco';
 const d=feuille('La platine VIP','CHOISIS LE SON DU CLUB','<div class="mus">'+S.map(s=>'<button data-s="'+s[0]+'" class="'+(s[0]===c?'on':'')+'"><i>'+s[1]+'</i>'+s[2]+'</button>').join('')+'</div><div class="msg">Toute la salle danse sur ton choix.</div>');
 d.querySelectorAll('.mus button').forEach(b=>b.onclick=()=>{window.DISCO_STYLE=b.dataset.s;vib([8,20,8]);d.querySelectorAll('.mus button').forEach(x=>x.classList.toggle('on',x===b));try{texteVolant(joueur.x,joueur.y-64,'♫ '+b.textContent.trim()+' !','#3af0ff');}catch(x){}});};
})();
