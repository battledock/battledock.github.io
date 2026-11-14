/* =====================================================================
   LE PARRAINAGE — un lien à partager ; l'ami qui arrive par ce lien
   reçoit 5 000 € dès son entrée au port, le parrain une pochette de trois
   autocollants. Un seul filleul par joueur, un seul parrain par filleul :
   le serveur en décide (parrainage_moi, parrainage_valider).
   Chargé par moteur.js (eval direct) : voit sb, e, vibrer, majHaut, sauver.
   ===================================================================== */
(()=>{
const CSS=`#par{position:fixed;inset:0;z-index:2147482300;display:flex;align-items:flex-end;justify-content:center;background:rgba(6,10,24,.55);opacity:0;transition:opacity .2s;font-family:'Baloo 2',system-ui,sans-serif}
#par.on{opacity:1}#par *{box-sizing:border-box}
#par .pc{width:100%;max-width:460px;border-radius:26px 26px 0 0;padding:20px 18px calc(22px + env(safe-area-inset-bottom));background:linear-gradient(#fffaf0,#f6ead0);color:#3a2410;box-shadow:0 -10px 30px rgba(0,0,0,.35);transform:translateY(30px);transition:transform .25s cubic-bezier(.3,1.3,.5,1)}
#par.on .pc{transform:none}
#par .pt{display:flex;align-items:center;gap:10px}#par .pt b{flex:1;font:900 22px 'Baloo 2',system-ui,sans-serif}
#par .px{width:38px;height:38px;border-radius:50%;border:0;background:rgba(58,36,16,.1);color:#3a2410;font-size:17px}
#par .cad{margin:14px 0 12px;border-radius:20px;padding:16px;text-align:center;background:linear-gradient(135deg,#ffe680,#ffb43a 60%,#ff8a3a);box-shadow:0 5px 0 #b8701c,0 10px 20px rgba(0,0,0,.18);color:#3a1a04}
#par .cad big{display:block;font:900 30px 'Baloo 2',system-ui,sans-serif;line-height:1.1}
#par .lien{display:flex;gap:6px;align-items:center;background:#fff;border:2px dashed #d8b878;border-radius:14px;padding:10px 12px;font-weight:800;font-size:14px;word-break:break-all}
#par .lig{display:flex;gap:8px;margin-top:10px}
#par .bt{flex:1;border:0;border-radius:14px;padding:13px;font:900 16px 'Baloo 2',system-ui,sans-serif;color:#fff;background:linear-gradient(#3ac86a,#1c8a4a);box-shadow:0 4px 0 #0e5a2a}
#par .bt.b2{background:linear-gradient(#5a8ad8,#2a5aa8);box-shadow:0 4px 0 #1a3a7a}
#par .bt:active{transform:translateY(3px);box-shadow:none}#par .bt[disabled]{filter:grayscale(1) opacity(.5)}
#par .st{margin-top:12px;padding:10px 12px;border-radius:12px;background:rgba(58,36,16,.07);font-weight:700;font-size:14px;line-height:1.35}
#par .pok{color:#1c8a4a;font-weight:900}
#parF{position:fixed;inset:0;z-index:2147482600;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;padding:24px;text-align:center;background:radial-gradient(circle,#ffcf5a 0%,#e8702a 55%,#5a1a08 100%);color:#fff;font-family:'Baloo 2',system-ui,sans-serif;animation:parIn .45s cubic-bezier(.3,1.4,.5,1)}
#parF b{font:900 22px 'Baloo 2',system-ui,sans-serif;text-shadow:0 2px 0 rgba(0,0,0,.25)}#parF big{font:900 52px 'Baloo 2',system-ui,sans-serif;text-shadow:0 4px 0 rgba(0,0,0,.25)}
#parF button{margin-top:10px;border:0;border-radius:16px;padding:14px 30px;font:900 18px 'Baloo 2',system-ui,sans-serif;color:#5a2a08;background:#fff;box-shadow:0 5px 0 rgba(0,0,0,.25)}
@keyframes parIn{from{opacity:0;transform:scale(1.25)}}`;
const css=()=>{if(!document.getElementById('parCss')){const s=document.createElement('style');s.id='parCss';s.textContent=CSS;document.head.appendChild(s);}};
const vib=x=>{try{vibrer(x);}catch(_){}};
const lienDe=c=>location.origin+'/?p='+c;
let RAC=null;
function fermer(){if(!RAC)return;const r=RAC;RAC=null;window.ECRAN_COUVRANT=false;r.classList.remove('on');setTimeout(()=>r.remove(),230);}
window.ouvrirParrainage=async function(){css();if(RAC)fermer();
  const d=document.createElement('div');d.id='par';d.innerHTML='<div class="pc"><div class="pt"><b>Parraine un ami</b><button class="px" aria-label="Fermer">✕</button></div>'+
   '<div class="cad">Ton ami reçoit<big>5 000 €</big>dès son arrivée au port</div><div class="corps"><div class="st">Un instant…</div></div></div>';
  document.body.appendChild(d);RAC=d;window.ECRAN_COUVRANT=true;requestAnimationFrame(()=>d.classList.add('on'));
  d.querySelector('.px').onclick=()=>{vib(8);fermer();};d.addEventListener('pointerdown',ev=>{if(ev.target===d)fermer();});
  let r=null;try{if(typeof sb!=='undefined'&&sb&&sb.rpc){const q=await sb.rpc('parrainage_moi');r=q.data||(q.error?{erreur:q.error.message}:null);}}catch(x){}
  if(!RAC||RAC!==d)return;const C=d.querySelector('.corps');
  if(!r||r.erreur){C.innerHTML='<div class="st">'+(r&&/connexion|JWT/i.test(r.erreur)?'Connecte-toi pour parrainer un ami.':'Le parrainage ouvre très bientôt.')+'</div>';return;}
  const L=lienDe(r.code);
  C.innerHTML=(r.a_filleul?'':'<div class="lien"><span style="flex:1">'+L.replace(/^https?:\/\//,'')+'</span></div><div class="lig"><button class="bt pa">Partager</button><button class="bt b2 co">Copier</button></div>')+
   '<div class="st">'+(r.a_filleul?'<span class="pok">✓ Ton filleul : '+(r.filleul||'un ami')+'</span><br>Un seul parrainage par joueur : le tien est fait. Merci !':'Envoie ce lien à <b>un</b> ami qui n’a pas encore de compte. Toi, tu reçois une <b>pochette de 3 autocollants</b> quand il arrive.<br><small>Un seul filleul par joueur.</small>')+
   (r.parrain?'<br><br>Toi, tu es arrivé grâce à <b>'+r.parrain+'</b>.':'')+'</div>';
  const pa=C.querySelector('.pa'),co=C.querySelector('.co');
  const msg='Viens jouer avec moi à Battle Dock, sur le port de Marseille ! Avec mon lien, tu reçois 5 000 € dès ton arrivée : ';
  if(pa){if(!navigator.share)pa.style.display='none';pa.onclick=async()=>{vib(8);try{await navigator.share({title:'Battle Dock',text:msg,url:L});}catch(x){}};}
  if(co)co.onclick=async()=>{vib(8);let ok=false;try{await navigator.clipboard.writeText(msg+L);ok=true;}catch(x){}
    if(!ok){try{const t=document.createElement('textarea');t.value=msg+L;document.body.appendChild(t);t.select();ok=document.execCommand('copy');t.remove();}catch(x){}}
    co.textContent=ok?'Copié ✓':'Copie impossible';setTimeout(()=>{if(co.isConnected)co.textContent='Copier';},1800);};};
/* LA FÊTE DU FILLEUL, à son entrée au port */
window.feterParrainage=function(r){css();vib([30,40,30,40,120]);const f=document.createElement('div');f.id='parF';
  f.innerHTML='<b>Bienvenue au port !</b><div style="font-weight:800;font-size:16px;opacity:.95">'+(r.parrain?r.parrain+' t’a invité. Cadeau :':'Ton cadeau de bienvenue :')+'</div><big>+ 5 000 €</big><button>Merci !</button>';
  document.body.appendChild(f);window.ECRAN_COUVRANT=true;f.querySelector('button').onclick=()=>{vib(8);window.ECRAN_COUVRANT=false;f.style.transition='opacity .3s';f.style.opacity='0';setTimeout(()=>f.remove(),320);};};
})();
