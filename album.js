/* =====================================================================
   L'ALBUM D'AUTOCOLLANTS — six pages de neuf, à compléter.
   Les pochettes (trois autocollants) : une gratuite chaque jour, d'autres
   à 1 500 €, ou contre cinq doublons. Une page complète rapporte 20 000 €,
   l'album entier 250 000 € de plus. Tout se tire côté serveur.
   Chargé par moteur.js (eval direct) : voit e, sb, appelRPC, vibrer, majHaut…
   ===================================================================== */
(()=>{
const PAGES=[
 {n:'Le Port',c1:'#2a6ab8',c2:'#123a6a',ic:'⚓'},{n:'La Place',c1:'#e8a03a',c2:'#8a5a1a',ic:'⛲'},{n:'Marseille',c1:'#3ab8d8',c2:'#1a5a8a',ic:'☀️'},
 {n:'La Galerie',c1:'#4a7ae8',c2:'#1a2a7a',ic:'🛍️'},{n:'Le Club',c1:'#ff3ac8',c2:'#5a0a5a',ic:'🪩'},{n:'Noël',c1:'#d8302a',c2:'#1a5a2a',ic:'🎄'}];
const C=[
 ['port_grue','La grue','🏗️'],['port_conteneur','Le conteneur','📦'],['port_mouette','La mouette','🕊️'],['port_bouee','La bouée','🛟'],['port_ancre','L’ancre','⚓'],['port_cargo','Le cargo','🚢'],['port_casque','Le casque de docker','⛑️'],['port_phare','Le phare','🗼'],['port_or','Le Cargo d’Or','🏆'],
 ['place_fontaine','La fontaine','⛲'],['place_tram','Le tram','🚋'],['place_pigeon','Le pigeon','🐦'],['place_banc','Le banc','🪑'],['place_kiosque','Le kiosque','📰'],['place_affiche','L’affiche','📜'],['place_velo','Le vélo','🚲'],['place_platane','Le platane','🌳'],['place_bonnemere','La Bonne Mère','⛪'],
 ['mars_navette','La navette','🥖'],['mars_savon','Le savon','🧼'],['mars_cigale','La cigale','🦗'],['mars_panisse','La panisse','🍟'],['mars_ballon','Le ballon','⚽'],['mars_calanque','La calanque','🏝️'],['mars_vieuxport','Le Vieux-Port','⛵'],['mars_bouille','La bouillabaisse','🍲'],['mars_soleil','Le Soleil du Midi','🌞'],
 ['gal_cafe','Le café','☕'],['gal_croissant','Le croissant','🥐'],['gal_lunettes','Les lunettes','🕶️'],['gal_basket','La basket','👟'],['gal_sac','Le sac','👜'],['gal_montre','La montre','⌚'],['gal_bague','La bague','💍'],['gal_fleurs','Les fleurs','💐'],['gal_diamant','Le diamant','💎'],
 ['club_boule','La boule à facettes','🪩'],['club_cocktail','Le cocktail','🍹'],['club_vinyle','Le vinyle','💿'],['club_micro','Le micro','🎤'],['club_patins','Les patins','🛼'],['club_dj','Le DJ','🎧'],['club_jacuzzi','Le jacuzzi','🫧'],['club_vip','La couronne VIP','👑'],['club_roi','Le Roi du Disco','🕺'],
 ['noel_sapin','Le sapin','🎄'],['noel_cadeau','Le cadeau','🎁'],['noel_sucre','Le sucre d’orge','🍭'],['noel_bonhomme','Le bonhomme de neige','⛄'],['noel_renne','Le renne','🦌'],['noel_flocon','Le flocon','❄️'],['noel_etoile','L’étoile','⭐'],['noel_calendrier','Le calendrier','📅'],['noel_pere','Le Père Noël','🎅']];
const rar=i=>i%9===8?2:i%9>=5?1:0, RN=['','RARE','LÉGENDE'];
const ID={};C.forEach((c,i)=>ID[c[0]]=i);
let RAC=null,ET={cartes:{},gratuit:false,doublons:0,pages:[]},PG=0,OCC=false;
const vib=x=>{try{vibrer(x);}catch(_){}};
const rpcS=async(n,a)=>{try{if(typeof sb!=='undefined'&&sb&&sb.rpc){const q=await sb.rpc(n,a||{});return q.data!=null?q.data:(q.error?{erreur:q.error.message}:null);}return await appelRPC(n,a||{});}catch(x){return {erreur:'reseau'};}};
const CSS=`#alb{position:fixed;inset:0;z-index:2147482300;display:flex;flex-direction:column;background:linear-gradient(#f6ead0,#e8d8b4);font-family:'Baloo 2',system-ui,sans-serif;color:#2a2016;opacity:0;transition:opacity .2s;user-select:none;-webkit-user-select:none}
#alb.on{opacity:1}#alb *{box-sizing:border-box}
#alb .ahd{flex:none;display:flex;align-items:center;gap:10px;padding:calc(env(safe-area-inset-top,0px) + 12px) 14px 8px;background:linear-gradient(var(--c1),var(--c2));color:#fff;box-shadow:0 4px 0 rgba(0,0,0,.15);transition:background .3s}
#alb .ahd b{flex:1;font:900 24px/1 'Baloo 2',system-ui,sans-serif}#alb .ahd b small{display:block;font-size:11px;letter-spacing:2px;opacity:.85;margin-top:3px}
#alb .ax{width:38px;height:38px;border-radius:50%;border:0;background:rgba(0,0,0,.25);color:#fff;font:800 16px 'Baloo 2',system-ui,sans-serif}
#alb .aong{flex:none;display:flex;gap:6px;overflow-x:auto;padding:10px 12px 6px;-webkit-overflow-scrolling:touch;scrollbar-width:none}
#alb .aong button{flex:none;border:0;border-radius:14px;padding:6px 12px;background:#fff8e8;color:#5a4a3a;font:800 13px 'Baloo 2',system-ui,sans-serif;box-shadow:0 2px 0 #c8b890;position:relative}
#alb .aong button.on{background:var(--c1);color:#fff;box-shadow:0 2px 0 var(--c2)}#alb .aong button em{font-style:normal;font-size:10.5px;opacity:.8;margin-left:4px}
#alb .acorps{flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch;padding:6px 14px calc(16px + env(safe-area-inset-bottom,0px))}
#alb .apage{background:#f3e6c8;border-radius:20px;padding:12px;box-shadow:0 3px 0 #c8b890,inset 0 0 0 2px #efe2c4;position:relative}
#alb .apage:before{content:'';position:absolute;left:50%;top:10px;bottom:10px;width:2px;background:repeating-linear-gradient(#e8d8b4 0 6px,transparent 6px 10px);display:none}
#alb .agr{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}
#alb .cs{aspect-ratio:3/4;border-radius:14px;position:relative;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:2px}
#alb .cs.vide small{font:800 10.5px 'Baloo 2',system-ui,sans-serif;color:#b8a888;margin-top:-4px}#alb .cs .sil{width:92%;opacity:.9}
#alb .st{width:100%;position:relative;transform:rotate(var(--r));filter:drop-shadow(0 1px 0 rgba(120,90,50,.25))}#alb .st img{width:100%;display:block}
#alb .st .sh{position:absolute;inset:0;-webkit-mask-image:var(--m);mask-image:var(--m);-webkit-mask-size:100% 100%;mask-size:100% 100%;background:linear-gradient(110deg,transparent 35%,rgba(255,255,255,.75) 48%,transparent 60%) no-repeat;background-size:250% 100%;animation:albBr 2.8s infinite}
#alb .st.r2 .sh{background:linear-gradient(110deg,transparent 30%,rgba(255,120,220,.45) 40%,rgba(255,255,255,.85) 48%,rgba(120,240,255,.45) 56%,transparent 66%) no-repeat;background-size:250% 100%;animation-duration:2s}
@keyframes albBr{0%{background-position:130% 0}60%,100%{background-position:-30% 0}}
#alb .nm{font:800 10.5px/1.1 'Baloo 2',system-ui,sans-serif;color:#5a4a3a;margin-top:-4px;padding:0 2px}
#alb .rb{position:absolute;top:4%;left:2%;font:900 7.5px 'Baloo 2',system-ui,sans-serif;letter-spacing:1px;border-radius:6px;padding:1px 5px;z-index:2;color:#2a1a08}#alb .rb.r1{background:linear-gradient(#fff2a8,#e8b030)}#alb .rb.r2{background:linear-gradient(90deg,#ff9ae4,#ffd23a,#8af0ff);}
#alb .nb{position:absolute;bottom:14px;right:0;background:#2a2016;color:#fff;border-radius:10px;padding:0 6px;font:900 12px 'Baloo 2',system-ui,sans-serif;z-index:3;border:2px solid #fffaf0}
#alb .apr{margin-top:12px;display:flex;align-items:center;gap:10px;font-weight:800;font-size:14px}#alb .apr .bar{flex:1;height:10px;border-radius:6px;background:#efe2c4;overflow:hidden}#alb .apr .bar i{display:block;height:100%;background:var(--c1);border-radius:6px}
#alb .arec{display:block;width:100%;margin-top:10px;border:0;border-radius:16px;padding:12px;font:800 16px 'Baloo 2',system-ui,sans-serif;color:#2a1a08;background:linear-gradient(#fff2b8,#e8b838 60%,#c8902a);box-shadow:0 4px 0 #7a5214}#alb .arec[disabled]{opacity:.55}
#alb .apo{margin-top:14px;background:#2a2016;color:#fff;border-radius:20px;padding:12px;box-shadow:0 4px 0 #120a06}
#alb .apo h4{margin:0 0 8px;font:900 17px 'Baloo 2',system-ui,sans-serif;display:flex;justify-content:space-between}#alb .apo h4 small{font-size:12px;color:#d8c8a8}
#alb .apo button{display:flex;align-items:center;gap:10px;width:100%;margin-top:6px;border:0;border-radius:14px;padding:10px 12px;font:800 15px 'Baloo 2',system-ui,sans-serif;text-align:left;background:#fff8e8;color:#2a2016}
#alb .apo button b{margin-left:auto;font-size:14px}#alb .apo button.gr{background:linear-gradient(90deg,#7aff8a,#3ac868);color:#0a2a12;animation:albPu 1.4s ease-in-out infinite}#alb .apo button[disabled]{opacity:.4;animation:none}
@keyframes albPu{50%{transform:scale(1.02)}}
#alb .amsg{text-align:center;font-weight:800;font-size:13px;color:#8a6a4a;margin-top:8px;min-height:18px}
#alb #albP{position:fixed;inset:0;z-index:2147482400;background:radial-gradient(circle at 50% 38%,#1f4482,#0b1936 58%,#050a18);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:22px;font-family:'Baloo 2',system-ui,sans-serif;color:#fff;overflow:hidden}
#albP:before{content:'';position:absolute;left:50%;top:38%;width:150vmax;height:150vmax;margin:-75vmax;background:repeating-conic-gradient(rgba(255,226,150,.05) 0 9deg,transparent 9deg 22deg);animation:albTour 26s linear infinite;pointer-events:none}
@keyframes albTour{to{transform:rotate(360deg)}}
#albP>*{position:relative}
#albP .poch{width:176px;height:246px;position:relative;filter:drop-shadow(0 20px 22px rgba(0,0,0,.55));animation:albEntre .7s cubic-bezier(.2,1.45,.4,1) both,albFlotte 2.6s ease-in-out .7s infinite}
@keyframes albEntre{from{transform:translateY(-70vh) rotate(-14deg)}}
@keyframes albFlotte{50%{transform:translateY(-9px) rotate(1.4deg)}}
#albP .ph,#albP .pc{position:absolute;left:0;right:0;background:linear-gradient(160deg,#1b3f80,#0e2450 55%,#1c4f92)}
#albP .ph{top:0;height:30px;background-image:repeating-linear-gradient(90deg,rgba(255,255,255,.2) 0 2px,rgba(0,0,0,.16) 2px 4px),linear-gradient(160deg,#1b3f80,#12306a);border-bottom:1.5px dashed rgba(255,226,150,.75);
 -webkit-mask:conic-gradient(from 135deg at top,#0000,#000 1deg 89deg,#0000 90deg) 50%/11px 100%;mask:conic-gradient(from 135deg at top,#0000,#000 1deg 89deg,#0000 90deg) 50%/11px 100%}
#albP .pc{top:30px;bottom:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:5px;overflow:hidden;text-align:center;
 -webkit-mask:conic-gradient(from -45deg at bottom,#0000,#000 1deg 89deg,#0000 90deg) 50%/11px 100%;mask:conic-gradient(from -45deg at bottom,#0000,#000 1deg 89deg,#0000 90deg) 50%/11px 100%}
#albP .pc:before{content:'';position:absolute;inset:8px 8px 22px;border:1.5px solid rgba(255,226,150,.7);border-radius:8px;box-shadow:inset 0 0 0 3px rgba(255,226,150,.14)}
#albP .pc:after{content:'';position:absolute;inset:0;background:linear-gradient(112deg,transparent 34%,rgba(255,255,255,.36) 47%,rgba(160,220,255,.2) 53%,transparent 64%);background-size:260% 100%;animation:albBrille 2.4s ease-in-out infinite}
@keyframes albBrille{0%{background-position:140% 0}70%,100%{background-position:-60% 0}}
#albP .pc .bas{position:absolute;left:0;right:0;bottom:0;height:20px;background:repeating-linear-gradient(90deg,rgba(255,255,255,.2) 0 2px,rgba(0,0,0,.16) 2px 4px)}
#albP .pc svg{width:62px;height:62px;filter:drop-shadow(0 2px 0 rgba(0,0,0,.3))}
#albP .pc b{font:900 20px/1 'Baloo 2',system-ui,sans-serif;letter-spacing:1px;color:#ffe296;text-shadow:0 2px 0 rgba(0,0,0,.35)}
#albP .pc small{font:800 10.5px 'Baloo 2',system-ui,sans-serif;letter-spacing:4px;text-indent:4px;color:#cfe2ff}
#albP .pc i{font:900 9.5px 'Baloo 2',system-ui,sans-serif;font-style:normal;letter-spacing:1.5px;background:#ffe296;color:#0e2450;border-radius:99px;padding:2px 9px;margin-top:5px}
#albP .eclat{position:absolute;left:50%;top:50%;width:20px;height:20px;margin:-10px;border-radius:50%;background:radial-gradient(circle,#fff,rgba(255,226,150,.9) 40%,transparent 70%);opacity:0;pointer-events:none}
#albP .poch.dechire{animation:none}
#albP .poch.dechire .ph{animation:albArr .5s cubic-bezier(.3,.6,.4,1) forwards}
#albP .poch.dechire .pc{animation:albTombe .5s .16s cubic-bezier(.5,0,.8,.4) forwards}
#albP .poch.dechire .eclat{animation:albEclat .62s .08s ease-out forwards}
@keyframes albArr{35%{transform:translate(4px,-6px) rotate(4deg)}to{transform:translate(70px,-120px) rotate(38deg);opacity:0}}
@keyframes albTombe{20%{transform:scale(1.05)}to{transform:translateY(90px) scale(.92);opacity:0}}
@keyframes albEclat{0%{opacity:1;transform:scale(1)}100%{opacity:0;transform:scale(26)}}
#albP .ouv{font-weight:800;color:#ffe296;opacity:.9;letter-spacing:.5px}
#albP .tri{display:flex;gap:10px}#albP .cs{width:112px;aspect-ratio:auto;perspective:600px}#albP .cs .st{animation:albRe .6s cubic-bezier(.25,1.4,.45,1) backwards}#albP .nm{color:#fff;font-size:12.5px;margin-top:2px}
@keyframes albRe{from{transform:translateY(70px) scale(.55) rotate(-10deg);opacity:0}}
#albP .nf{position:absolute;top:-10px;left:50%;transform:translateX(-50%);background:#ffd23a;color:#2a1a08;font:900 10px 'Baloo 2',system-ui,sans-serif;border-radius:8px;padding:1px 6px;z-index:4;white-space:nowrap}
#albP .acoll{border:0;border-radius:16px;padding:12px 30px;font:900 17px 'Baloo 2',system-ui,sans-serif;background:#fff;color:#2a1a40}`;
function sticker(i,n,rot){const c=C[i],r=rar(i),u=window.AUTOCOLLANT?AUTOCOLLANT(c[0],r,220):'';return '<div class="st r'+r+'" style="--r:'+(rot||0)+'deg;--m:url('+u+')"><img src="'+u+'" alt="">'+(r?'<b class="sh"></b><span class="rb r'+r+'">'+RN[r]+'</span>':'')+'</div><span class="nm">'+c[1]+'</span>'+(n>1?'<span class="nb">×'+n+'</span>':'');}
function rendre(){if(!RAC)return;const P=PAGES[PG];RAC.style.setProperty('--c1',P.c1);RAC.style.setProperty('--c2',P.c2);
 const tot=Object.keys(ET.cartes).filter(k=>ID[k]!==undefined).length;
 RAC.querySelector('.ahd b').innerHTML='📒 Mon album<small>'+tot+' / 54 AUTOCOLLANTS · '+ET.doublons+' DOUBLON'+(ET.doublons>1?'S':'')+'</small>';
 RAC.querySelector('.aong').innerHTML=PAGES.map((p,k)=>{const n=C.slice(k*9,k*9+9).filter(c=>ET.cartes[c[0]]).length;return '<button data-p="'+k+'" class="'+(k===PG?'on':'')+'">'+p.ic+' '+p.n+'<em>'+(ET.pages.includes(k+1)?'✓':n+'/9')+'</em></button>';}).join('');
 RAC.querySelectorAll('.aong button').forEach(b=>b.onclick=()=>{PG=+b.dataset.p;vib(6);rendre();});
 const L=C.slice(PG*9,PG*9+9),pos=L.filter(c=>ET.cartes[c[0]]).length,fait=ET.pages.includes(PG+1);
 RAC.querySelector('.apage').innerHTML='<div class="agr">'+L.map((c,j)=>{const i=PG*9+j,n=ET.cartes[c[0]]||0;return '<div class="cs'+(n?'':' vide')+'">'+(n?sticker(i,n,((i*37)%7)-3):'<img class="sil" src="'+(window.SILHOUETTE?SILHOUETTE(c[0],220):'')+'" alt=""><small>n° '+(i+1)+(rar(i)?' · '+RN[rar(i)].toLowerCase():'')+'</small>')+'</div>';}).join('')+'</div>'+
  '<div class="apr">'+pos+' / 9<span class="bar"><i style="width:'+(pos/9*100)+'%"></i></span>'+(fait?'✓ récompense touchée':'')+'</div>'+
  (fait?'':'<button class="arec"'+(pos<9?' disabled':'')+'>'+(pos<9?'Complète la page : 20 000 € à gagner':'🎉 Toucher 20 000 €')+'</button>');
 const rb=RAC.querySelector('.arec');if(rb)rb.onclick=async()=>{if(OCC)return;OCC=true;rb.disabled=true;rb.textContent='…';const r=await rpcS('album_page',{p_page:PG+1});OCC=false;
  if(!r||!r.ok){msg(r&&r.erreur==='deja'?'Déjà touchée.':'Le serveur ne répond pas, réessaie.');lire();return;}
  if(typeof r.euros==='number'){e.euros=r.euros;try{majHaut();}catch(x){}}ET.pages.push(PG+1);vib([20,40,20,40,80]);msg(r.complet?'ALBUM COMPLET ! +270 000 € 🏆':'+20 000 € ! Page terminée.');rendre();};
 const po=RAC.querySelector('.apo');po.innerHTML='<h4>🎴 Les pochettes<small>3 autocollants chacune</small></h4>'+
  '<button class="gr" data-s="gratuit"'+(ET.gratuit?'':' disabled')+'>🎁 La pochette du jour<b>'+(ET.gratuit?'Gratuite !':'Demain')+'</b></button>'+
  '<button data-s="achat"'+((e.euros||0)<150000?' disabled':'')+'>🛒 Acheter une pochette<b>1 500 €</b></button>'+
  '<button data-s="doublons"'+(ET.doublons<5?' disabled':'')+'>🔁 Échanger 5 doublons<b>'+ET.doublons+' / 5</b></button>';
 po.querySelectorAll('button').forEach(b=>b.onclick=()=>ouvrirPochette(b.dataset.s));}
function msg(t){const m=RAC&&RAC.querySelector('.amsg');if(m)m.textContent=t;}
async function lire(){const r=await rpcS('album_mes',{});if(r&&r.cartes){ET=Object.assign(ET,r);if(!Array.isArray(ET.pages))ET.pages=[];}else if(r&&r.erreur)msg('L’album arrive très bientôt !');rendre();}
/* LA POCHETTE : un sachet bleu nuit serti d'or, crans en haut et en bas, une ancre au centre */
const POCH='<div class="poch"><div class="ph"></div><div class="pc">'
 +'<svg viewBox="0 0 64 64" fill="none" stroke="#ffe296" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><circle cx="32" cy="13" r="6"/><path d="M32 19v36M20 29h24M10 39c2 11 11 16 22 16s20-5 22-16M10 39l-3 7M10 39l7 3M54 39l3 7M54 39l-7 3"/></svg>'
 +'<b>BATTLE DOCK</b><small>AUTOCOLLANTS</small><i>À COLLER DANS L’ALBUM</i><div class="bas"></div></div><div class="eclat"></div></div>';
async function ouvrirPochette(s){if(OCC)return;OCC=true;vib(10);msg('');
 const v=document.createElement('div');v.id='albP';v.innerHTML=POCH+'<div class="ouv">On ouvre…</div>';(RAC||document.body).appendChild(v);
 const r=await rpcS('album_pochette',{p_source:s});await new Promise(k=>setTimeout(k,900));OCC=false;
 if(!r||!r.ok){v.remove();msg(r&&r.erreur==='pas_assez'?'Pas assez d’euros.':r&&r.erreur==='deja'?'Tu as déjà ouvert la pochette du jour.':r&&r.erreur==='doublons'?'Il faut 5 doublons.':'L’album arrive très bientôt !');lire();return;}
 if(typeof r.euros==='number'){e.euros=r.euros;try{majHaut();}catch(x){}}
 devoiler(v,r,(L)=>{const p=L.length?Math.floor(ID[L[0]]/9):PG;PG=isFinite(p)?p:PG;lire();});}
function devoiler(v,r,fin,voir){v.querySelector('.poch').classList.add('dechire');vib([10,30,10]);
 setTimeout(()=>{const L=r.cartes||[],N=r.neuf||[];v.innerHTML=(r.titre?'<div style="font-weight:900;font-size:13px;letter-spacing:2px;opacity:.75">'+r.titre+'</div>':'')+'<div class="tri">'+L.map((id,k)=>{const i=ID[id];return i===undefined?'':'<div class="cs" style="position:relative">'+(N[k]?'<span class="nf">NOUVEAU !</span>':'')+sticker(i,1,0).replace('style="--r:','style="animation-delay:'+(k*.35)+'s;--r:')+'</div>';}).join('')+'</div>'+
  '<div style="font-weight:800;font-size:15px;text-align:center;padding:0 20px">'+(L.some(id=>rar(ID[id])===2)?'✨ UNE LÉGENDE ! ✨':N.some(Boolean)?(L.length>1?'De nouveaux autocollants pour ton album !':'Un nouvel autocollant pour ton album !'):(L.length>1?'Que des doublons… garde-les pour les échanger !':'Un doublon… garde-le pour l’échanger !'))+'</div><button class="acoll">Coller dans l’album</button>'+(voir?'<button class="avoir" style="border:0;background:none;color:#fff;opacity:.75;font:800 14px \'Baloo 2\',system-ui,sans-serif;text-decoration:underline">Voir mon album</button>':'');
  if(L.some(id=>rar(ID[id])===2))vib([30,40,30,40,120]);
  v.querySelector('.acoll').onclick=()=>{vib(8);v.remove();fin(L);};
  const av=v.querySelector('.avoir');if(av)av.onclick=()=>{vib(8);v.remove();fin(L);setTimeout(()=>window.ouvrirAlbum&&ouvrirAlbum(),60);};},640);}
function css(){if(!document.getElementById('albCss')){const s=document.createElement('style');s.id='albCss';s.textContent=CSS;document.head.appendChild(s);}}
/* une pochette gagnée ailleurs (battle, soute, Père Noël, calendrier, trouvaille) */
window.ALB_REVELER=function(r,titre){if(!r||!Array.isArray(r.cartes)||!r.cartes.length)return;css();
 let hote=RAC,tmp=false;if(!hote){hote=document.createElement('div');hote.id='alb';hote.className='on';hote.style.cssText='background:none;pointer-events:none;inset:auto;width:0;height:0';document.body.appendChild(hote);tmp=true;}
 const v=document.createElement('div');v.id='albP';v.style.pointerEvents='auto';v.innerHTML=POCH+'<div class="ouv">'+(titre||'Une pochette pour toi !')+'</div>';hote.appendChild(v);vib(10);
 const k=Object.assign({},r,{titre:titre||''});
 setTimeout(()=>devoiler(v,k,()=>{if(tmp)hote.remove();else lire();},tmp),1100);};
function fermer(){if(!RAC)return;const R0=RAC;RAC=null;window.ECRAN_COUVRANT=false;R0.classList.remove('on');setTimeout(()=>R0.remove(),220);}
window.ouvrirAlbum=async function(){if(RAC)return;try{if(!window.AUTOCOLLANT)eval(await chargerMorceau('autocollants.js'));}catch(x){}if(RAC)return;css();
 const d=document.createElement('div');d.id='alb';RAC=d;d.innerHTML='<div class="ahd"><b></b><button class="ax" aria-label="Fermer">✕</button></div><div class="aong"></div><div class="acorps"><div class="apage"></div><div class="amsg"></div><div class="apo"></div></div>';
 document.body.appendChild(d);requestAnimationFrame(()=>d.classList.add('on'));window.ECRAN_COUVRANT=true;d.querySelector('.ax').onclick=()=>{vib(8);fermer();};rendre();lire();};
})();
