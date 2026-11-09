/* =====================================================================
   LES RÉGLAGES — refaits pour le nouveau jeu : la même feuille que le Sac.
   Des groupes clairs, des interrupteurs larges, tout se règle sur place
   (pas de sous-écran). Ils pilotent les mêmes réglages que l'ancien écran
   (REG, appliquerReglages, mettrePerf, renommer_joueur…). Un écran à part,
   chargé à la demande par moteur.js (eval direct).
   ===================================================================== */
(()=>{
const CSS=`#regN{position:fixed;inset:0;z-index:2147482100;font-family:'Baloo 2',system-ui,sans-serif;color:#2a2016;user-select:none;-webkit-user-select:none;-webkit-tap-highlight-color:transparent;background:rgba(10,14,20,.45);opacity:0;transition:opacity .2s}
#regN.on{opacity:1}#regN *{box-sizing:border-box}#regN *::after{content:none!important;display:none!important}#regN img,#regN canvas,#regN svg{image-rendering:pixelated}
#regN .pan{position:absolute;left:0;right:0;bottom:0;height:84%;background:#f6f1e6;border-radius:26px 26px 0 0;display:flex;flex-direction:column;transform:translateY(100%);transition:transform .26s cubic-bezier(.2,.8,.2,1);box-shadow:0 -10px 30px rgba(0,0,0,.3)}
#regN.on .pan{transform:translateY(var(--dy,0px))}#regN .pan.glisse{transition:none}
#regN .poig{flex:none;height:24px;display:grid;place-items:center;touch-action:none}#regN .poig i{width:48px;height:5px;border-radius:3px;background:#d0c6b2}
#regN .hd{flex:none;display:flex;align-items:center;gap:12px;padding:0 16px 12px}
#regN .hd .ic{flex:none;width:52px;height:52px;border-radius:16px;display:grid;place-items:center}
#regN .hd .tt{flex:1;min-width:0}#regN .hd .tt b{display:block;font-size:24px;font-weight:800;line-height:1}#regN .hd .tt small{display:block;font-size:12.5px;font-weight:700;color:#8a7a5a;margin-top:2px}
#regN .x{flex:none;width:40px;height:40px;border-radius:50%;border:0;background:#fff;box-shadow:0 3px 0 #ddd3c0;font:800 16px 'Baloo 2',system-ui,sans-serif;color:#2a2016}
#regN .corps{flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch;touch-action:pan-y;padding:0 16px 16px;overscroll-behavior:contain;position:relative}
#regN .bas{flex:none;display:flex;gap:10px;padding:8px 16px calc(12px + env(safe-area-inset-bottom));border-top:1px solid #e6dccb;background:#f6f1e6}
#regN .bas button{height:54px;border:0;border-radius:18px;font:800 17px 'Baloo 2',system-ui,sans-serif}
#regN .fermeB{flex:1;background:#2a2016;color:#fff;box-shadow:0 4px 0 #000}
#regN .lb{font:800 12px 'Baloo 2',system-ui,sans-serif;letter-spacing:2px;color:#8a7a5a;margin:12px 2px 8px}
#regN .grp{background:#fff;border-radius:20px;box-shadow:0 3px 0 #ddd3c0;overflow:hidden}
#regN .row{display:flex;align-items:center;gap:12px;min-height:60px;padding:8px 12px;border:0;width:100%;background:none;text-align:left;font-family:inherit;color:inherit}
#regN .row+.row{border-top:1px solid #f0e8d8}
#regN .row .pic{flex:none;width:38px;height:38px;border-radius:12px;display:grid;place-items:center;font-size:19px}
#regN .row .t{flex:1;min-width:0}#regN .row .t b{display:block;font-size:16px;font-weight:800;line-height:1.15}#regN .row .t small{display:block;font-size:12.5px;font-weight:700;color:#8a7a5a;line-height:1.25}
#regN .row .fl{flex:none;font-size:22px;color:#c8bca4;font-weight:800}
#regN .sw{flex:none;width:54px;height:32px;border-radius:16px;background:#e2d8c6;position:relative;transition:background .15s}
#regN .sw i{position:absolute;left:3px;top:3px;width:26px;height:26px;border-radius:50%;background:#fff;box-shadow:0 2px 3px rgba(0,0,0,.2);transition:left .15s}
#regN .sw.on{background:#3a9a5a}#regN .sw.on i{left:25px}
#regN .row.col{flex-wrap:wrap}#regN .seg{display:flex;gap:4px;width:100%;background:#f2ecdf;border-radius:12px;padding:3px;margin-top:2px}
#regN .seg button{flex:1;border:0;border-radius:9px;padding:8px 2px;background:none;font:800 13.5px 'Baloo 2',system-ui,sans-serif;color:#8a7a5a}
#regN .seg button.on{background:#2a2016;color:#fff}
#regN .ex{padding:0 12px 12px;display:none}#regN .ex.on{display:block}
#regN .ex input{width:100%;height:50px;border:2px solid #e6dccb;border-radius:14px;padding:0 14px;font:800 17px 'Baloo 2',system-ui,sans-serif;color:#2a2016;background:#faf6ee;outline:0}
#regN .ex input:focus{border-color:#e8b040}
#regN .ex .act{width:100%;height:50px;margin-top:8px;border:0;border-radius:14px;background:linear-gradient(#ffd86a,#f2b030);color:#3a2408;font:800 16px 'Baloo 2',system-ui,sans-serif;box-shadow:0 3px 0 #b8801a}
#regN .ex .act.dg{background:#d8402a;color:#fff;box-shadow:0 3px 0 #8a2010}
#regN .ex p{margin:0 0 8px;font-size:13px;font-weight:700;color:#6a5a40;line-height:1.35}
#regN .row.dg .t b{color:#c8402a}
#regN .etat{flex:none;font:800 12.5px 'Baloo 2',system-ui,sans-serif;color:#3a9a5a}#regN .etat.neuf{color:#c8801a}
#regN .bul{position:fixed;left:50%;bottom:calc(92px + env(safe-area-inset-bottom));transform:translateX(-50%) translateY(10px);background:#2a2016;color:#fff;border-radius:14px;padding:8px 16px;font:800 14px 'Baloo 2',system-ui,sans-serif;opacity:0;transition:.2s;pointer-events:none;white-space:nowrap;z-index:5}
#regN .bul.on{opacity:1;transform:translateX(-50%)}
#regN .pied{text-align:center;font-size:12px;font-weight:700;color:#a89a84;margin:16px 0 4px}`;
let RAC=null,HIST=false;
function fermer(depuisRetour){if(!RAC)return;window.ECRAN_COUVRANT=false;const R0=RAC;RAC=null;R0.classList.remove('on');setTimeout(()=>R0.remove(),280);
  removeEventListener('popstate',surRetour);removeEventListener('keydown',surTouche);if(HIST&&!depuisRetour){HIST=false;try{history.back();}catch(x){}}HIST=false;}
function surRetour(){fermer(true);}function surTouche(ev){if(ev.key==='Escape')fermer();}
/* la feuille : on la ferme par le gros bouton, la croix, le fond, un glissé vers le bas, Retour, Échap */
function feuille(css,cssId,tete){let st=document.getElementById(cssId);if(!st){st=document.createElement('style');st.id=cssId;document.head.appendChild(st);}st.textContent=css;
  const d=document.createElement('div');d.id='regN';RAC=d;
  d.innerHTML='<div class="pan"><div class="poig"><i></i></div><div class="hd">'+tete+'<button class="x" aria-label="Fermer">✕</button></div><div class="corps"></div><div class="bas"><button class="fermeB">Fermer les réglages</button></div></div>';
  document.body.appendChild(d);requestAnimationFrame(()=>d.classList.add('on'));setTimeout(()=>{if(RAC===d)window.ECRAN_COUVRANT=true;},300);
  const fm=()=>{try{vibrer(8);}catch(x){}fermer();};d.querySelectorAll('.x,.fermeB').forEach(b=>b.onclick=fm);d.addEventListener('click',ev=>{if(ev.target===d)fm();});
  const pan=d.querySelector('.pan'),poig=d.querySelector('.poig');let y0=null;
  poig.addEventListener('pointerdown',ev=>{y0=ev.clientY;pan.classList.add('glisse');try{poig.setPointerCapture(ev.pointerId);}catch(x){}});
  poig.addEventListener('pointermove',ev=>{if(y0==null)return;pan.style.setProperty('--dy',Math.max(0,ev.clientY-y0)+'px');});
  const fin=ev=>{if(y0==null)return;const dy=ev.clientY-y0;y0=null;pan.classList.remove('glisse');pan.style.setProperty('--dy','0px');if(dy>80)fm();};poig.addEventListener('pointerup',fin);poig.addEventListener('pointercancel',fin);
  try{history.pushState({ecran:'regN'},'');HIST=true;}catch(x){}addEventListener('popstate',surRetour);addEventListener('keydown',surTouche);return d;}

const esc=s=>String(s||'').replace(/[<>&"]/g,c=>({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;'})[c]);
const vib=x=>{try{vibrer(x);}catch(_){}};
function bulle(t){const b=RAC&&RAC.querySelector('.bul');if(!b)return;b.textContent=t;b.classList.remove('on');void b.offsetWidth;b.classList.add('on');clearTimeout(bulle.t);bulle.t=setTimeout(()=>b.classList.remove('on'),2200);}
const on=k=>REG[k]!==false&&REG[k]!==undefined;
const sw=(k,v)=>'<span class="sw'+(v?' on':'')+'"><i></i></span>';
const row=(o)=>'<button class="row'+(o.cl?' '+o.cl:'')+'"'+(o.d?' data-'+o.d[0]+'="'+o.d[1]+'"':'')+'><span class="pic" style="background:'+o.c+'">'+o.ic+'</span><span class="t"><b>'+o.n+'</b>'+(o.s?'<small>'+o.s+'</small>':'')+'</span>'+(o.droite||'')+'</button>';
const seg=(cle,noms,act)=>'<div class="seg">'+noms.map(([v,n])=>'<button data-seg="'+cle+':'+v+'"'+(String(act)===String(v)?' class="on"':'')+'>'+n+'</button>').join('')+'</div>';
const segRow=(o,cle,noms,act)=>'<div class="row col"><span class="pic" style="background:'+o.c+'">'+o.ic+'</span><span class="t"><b>'+o.n+'</b>'+(o.s?'<small>'+o.s+'</small>':'')+'</span>'+seg(cle,noms,act)+'</div>';
let OUV='';
/* un réglage peut vider la toile du jeu (netteté) : on la laisse se redessiner un instant */
function respire(){window.ECRAN_COUVRANT=false;setTimeout(()=>{if(RAC)window.ECRAN_COUVRANT=true;},180);}
function peindre(){if(!RAC)return;const C=RAC.querySelector('.corps'),y=C.scrollTop;let perf='auto';try{perf=perfChoisie();}catch(x){}
  const vib0=(()=>{try{return vibreurDispo();}catch(x){return false;}})();const NIVS=[[0,'Muet'],[1,'Bas'],[2,'Moyen'],[3,'Fort']];
  let h='<div class="lb">SON ET VIBRATIONS</div><div class="grp">'+
    row({ic:'🔊',c:'#ffe8c8',n:'Les sons',s:'Tous les bruits du jeu',d:['sw','sons'],droite:sw('sons',on('sons'))})+
    row({ic:'📳',c:'#dcf4e0',n:'Vibrer',s:vib0?'Quand tu touches, récoltes, gagnes':'Pas possible sur ce téléphone',d:vib0?['sw','vibre']:null,droite:vib0?sw('vibre',!!REG.vibre):''})+
    (on('sons')?segRow({ic:'🔔',c:'#f2ecdf',n:'Les effets',s:'Récolter, vendre, gagner'},'sGestes',NIVS,REG.sGestes===undefined?2:REG.sGestes|0)+(window.MUSIQUE_PRETE?segRow({ic:'🎵',c:'#f2e0ff',n:'La musique'},'sMus',NIVS,REG.sMus===undefined?2:REG.sMus|0):''):'')+
  '</div><div class="lb">AFFICHAGE</div><div class="grp">'+
    segRow({ic:'🌙',c:'#dce4ff',n:'Jour et nuit',s:'Suivre l’heure de Marseille, ou toujours clair'},'ciel',[['heure','Suivre l’heure'],['jour','Plein jour']],REG.ciel==='jour'?'jour':'heure')+
    segRow({ic:'⚡',c:'#fff0c8',n:'Performance',s:perf==='fluide'?'Décor allégé, batterie ménagée':perf==='beaute'?'Le plus beau, plus gourmand':'Le jeu s’adapte à ton téléphone'},'perf',[['auto','Auto'],['fluide','Fluidité'],['beaute','Beauté']],perf)+
    row({ic:'💥',c:'#ffe0dc',n:'Secouer aux impacts',s:'L’écran tremble quand ça cogne',d:['sw','secousses'],droite:sw('secousses',REG.secousses!==false)})+
  '</div><div class="lb">TON COMPTE</div><div class="grp">'+
    row({ic:'✏️',c:'#fff0c8',n:'Ton pseudo',s:esc(e.pseudo||'sans nom'),d:['ouv','pseudo'],droite:'<span class="fl">›</span>'})+
    '<div class="ex'+(OUV==='pseudo'?' on':'')+'" data-ex="pseudo"><p>Il s’affiche au classement, sur la place et dans le courrier.</p><input maxlength="18" value="'+esc(e.pseudo||'')+'" aria-label="Nouveau pseudo"><button class="act" data-act="pseudo">Changer de pseudo</button></div>'+
    row({ic:'#️⃣',c:'#f2ecdf',n:'Ton identifiant',s:'Touche pour le copier',d:['act','id']})+
  '</div><div class="lb">AIDE</div><div class="grp">'+
    row({ic:'❓',c:'#f2e0ff',n:'Comment jouer',s:'Le guide du port',d:['act','aide'],droite:'<span class="fl">›</span>'})+
    row({ic:'🔄',c:'#dcf4e0',n:'Mettre à jour',s:'Version '+esc(window.MA_VERSION||'?'),d:['act','maj'],droite:'<span class="etat" id="regMaj">…</span>'})+
    row({ic:'🗑️',c:'#ffe0dc',n:'Repartir de zéro',s:'Efface ta partie sur ce téléphone',d:['ouv','raz'],cl:'dg',droite:'<span class="fl">›</span>'})+
    '<div class="ex'+(OUV==='raz'?' on':'')+'" data-ex="raz"><p>L’inventaire, l’argent et ce que tu as cassé sur CE téléphone. Ton compte, ton classement et tes tenues restent.</p><button class="act dg" data-act="raz">Tout effacer</button></div>'+
  '</div><div class="pied">Ces réglages restent sur ce téléphone.</div>';
  C.innerHTML=h;C.scrollTop=y;
  C.querySelectorAll('[data-sw]').forEach(b=>b.onclick=()=>{const k=b.dataset.sw;REG[k]=k==='vibre'?!REG.vibre:!(REG[k]!==false&&REG[k]!==undefined);try{appliquerReglages();}catch(x){}respire();vib(14);peindre();});
  C.querySelectorAll('[data-seg]').forEach(b=>b.onclick=()=>{const [k,v]=b.dataset.seg.split(':');vib(8);
    if(k==='perf'){try{mettrePerf(v);}catch(x){}}else if(k==='ciel'){REG.ciel=v;try{appliquerReglages();}catch(x){}}else{REG[k]=+v;if(k==='sGestes')REG.sMoments=+v;try{appliquerReglages();}catch(x){}if(k==='sGestes'){try{jouer('hache');}catch(x){}}}
    respire();peindre();});
  C.querySelectorAll('[data-ouv]').forEach(b=>b.onclick=()=>{OUV=OUV===b.dataset.ouv?'':b.dataset.ouv;vib(6);peindre();const i=C.querySelector('.ex.on input');if(i)setTimeout(()=>i.focus(),50);});
  C.querySelectorAll('[data-act]').forEach(b=>b.onclick=()=>agir(b.dataset.act,b));
  fetch('version.json?t='+Date.now(),{cache:'no-store'}).then(r=>r.json()).then(d=>{const q=document.getElementById('regMaj');if(!q)return;const n=d&&d.v&&d.v!==window.MA_VERSION;q.textContent=n?'nouvelle version':'à jour ✓';q.classList.toggle('neuf',!!n);}).catch(()=>{});}
async function agir(a,b){
  if(a==='id'){const t=e.id||'';try{await navigator.clipboard.writeText(t);bulle('Identifiant copié');}catch(x){bulle(t);}return;}
  if(a==='aide'){fermer();setTimeout(()=>{try{ouvrirLAide('debuter');}catch(x){}},200);return;}
  if(a==='maj'){b.querySelector('.t small').textContent='Nettoyage, puis rechargement…';
    try{if(window.caches&&caches.keys){const k=await caches.keys();await Promise.all(k.map(n=>caches.delete(n)));}}catch(x){}
    try{if(navigator.serviceWorker&&navigator.serviceWorker.getRegistrations){const rs=await navigator.serviceWorker.getRegistrations();await Promise.all(rs.map(r=>r.unregister()));}}catch(x){}
    try{sessionStorage.removeItem('bdl.version.vue');}catch(x){}
    const q=new URLSearchParams(location.search);q.set('maj',Date.now());setTimeout(()=>location.replace(location.pathname.split('?')[0]+'?'+q.toString()),250);return;}
  if(a==='raz'){if(b.dataset.sur!=='1'){b.dataset.sur='1';b.textContent='Vraiment ? Touche encore';vib(30);setTimeout(()=>{if(b.isConnected){b.dataset.sur='';b.textContent='Tout effacer';}},4000);return;}
    try{localStorage.removeItem(CLE);}catch(x){}location.reload();return;}
  if(a==='pseudo'){const i=RAC.querySelector('.ex.on input');const t=((i&&i.value)||'').trim();if(t.length<2){bulle('Deux lettres au moins');return;}
    b.disabled=true;b.textContent='…';let d=null;try{d=await appelRPC('renommer_joueur',{p_joueur:e.id,p_pseudo:t});}catch(x){}b.disabled=false;b.textContent='Changer de pseudo';
    if(!d||d.erreur){bulle(d&&d.erreur==='pris'?'Ce pseudo est déjà pris':d&&d.erreur==='taille'?'Entre 2 et 18 lettres':d&&d.erreur==='caracteres'?'Pas de chevrons ni de guillemets':'Ça n’a pas marché');return;}
    e.pseudo=t;try{sauver();envoyerSauvegarde(true);monterEnLigne(true);}catch(x){}OUV='';peindre();bulle('Te voilà '+t);}}
window.ouvrirReglagesNeufs=function(){if(RAC)return;OUV='';
  const d=feuille(CSS,'regNCss','<span class="ic" style="background:#ececf0">⚙️</span><span class="tt"><b>Réglages</b><small>son, affichage, compte</small></span>');
  const b=document.createElement('div');b.className='bul';d.querySelector('.pan').appendChild(b);peindre();};
})();
