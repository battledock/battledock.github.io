/* =====================================================================
   LE TÉLÉPHONE — ouvert depuis le menu rond (moteur.js le charge à la
   demande et l'évalue sur place : il voit vibrer, sauver, e…).
   Un écran d'accueil, le répertoire, et des appels qui se jouent en
   bulles et en choix. Mistral TV t'invite sur son plateau.
   Tout est local.
   ===================================================================== */
(()=>{
const CSS=`#tel{position:fixed;inset:0;z-index:2147482100;background:rgba(8,10,16,.6);display:flex;align-items:center;justify-content:center;opacity:0;transition:opacity .2s;font-family:-apple-system,'Helvetica Neue',Arial,sans-serif;-webkit-tap-highlight-color:transparent;user-select:none;-webkit-user-select:none}
#tel.on{opacity:1}
#tel .app{position:relative;width:min(92vw,370px);height:min(86vh,760px);border-radius:46px;background:#0b0d12;padding:12px;box-shadow:0 0 0 2px #2a2e36,0 30px 80px rgba(0,0,0,.6);transform:translateY(30px) scale(.97);transition:transform .25s cubic-bezier(.2,.8,.2,1)}
#tel.on .app{transform:none}
#tel .ecran{position:relative;width:100%;height:100%;border-radius:36px;overflow:hidden;background:#000;color:#fff}
#tel .encoche{position:absolute;left:50%;top:10px;transform:translateX(-50%);width:96px;height:28px;border-radius:16px;background:#000;z-index:5}
#tel .sb{position:absolute;left:0;right:0;top:0;height:48px;display:flex;justify-content:space-between;align-items:center;padding:0 26px;font-weight:700;font-size:14px;z-index:4}
#tel .vue{position:absolute;inset:0;padding-top:52px;display:none;flex-direction:column}
#tel .vue.on{display:flex}
#tel .acc{background:radial-gradient(120% 70% at 30% 0%,#3a6ab0 0%,#1a2a50 45%,#0b1020 100%)}
#tel .heure{text-align:center;font-weight:200;font-size:66px;line-height:1;margin-top:18px;letter-spacing:-1px}
#tel .date{text-align:center;font-weight:600;font-size:15px;opacity:.85;margin-top:4px}
#tel .apps{display:grid;grid-template-columns:repeat(4,1fr);gap:18px 10px;padding:34px 22px 0}
#tel .ap{border:0;background:none;color:#fff;display:flex;flex-direction:column;align-items:center;gap:5px;font-size:11px;font-weight:600;padding:0}
#tel .ap i{width:58px;height:58px;border-radius:15px;display:grid;place-items:center;font-style:normal;font-size:30px;box-shadow:0 4px 10px rgba(0,0,0,.3)}
#tel .ap.off{opacity:.45}
#tel .dock{position:absolute;left:14px;right:14px;bottom:18px;height:84px;border-radius:28px;background:rgba(255,255,255,.18);backdrop-filter:blur(10px);display:flex;justify-content:space-around;align-items:center}
#tel .barreH{position:absolute;left:50%;bottom:7px;transform:translateX(-50%);width:120px;height:5px;border-radius:3px;background:rgba(255,255,255,.8);z-index:6}
#tel .rep{background:#f2f2f7;color:#111}
#tel .rep h2{font-size:30px;font-weight:800;padding:6px 20px 8px}
#tel .rep .ret{border:0;background:none;color:#0a7aff;font-size:16px;font-weight:600;text-align:left;padding:0 18px}
#tel .liste{margin:6px 14px;background:#fff;border-radius:14px;overflow:hidden}
#tel .ct{display:flex;align-items:center;gap:12px;padding:10px 12px;border:0;background:#fff;width:100%;text-align:left;border-bottom:1px solid #eee}
#tel .ct:last-child{border-bottom:0}
#tel .ct .av{flex:none;width:42px;height:42px;border-radius:50%;display:grid;place-items:center;font-weight:800;color:#fff;font-size:15px}
#tel .ct b{display:block;font-size:16px;color:#111}#tel .ct small{display:block;font-size:12.5px;color:#888}
#tel .ct .ap2{margin-left:auto;color:#34c759;font-size:22px}
#tel .appel{background:linear-gradient(#2a3a4a,#0e141c)}
#tel .qui{text-align:center;margin-top:16px}
#tel .qui .av{width:86px;height:86px;border-radius:50%;margin:0 auto 8px;display:grid;place-items:center;font-weight:800;font-size:30px}
#tel .qui b{display:block;font-size:24px;font-weight:700}#tel .qui small{display:block;font-size:14px;opacity:.7;margin-top:2px}
#tel .fil{flex:1;overflow-y:auto;padding:14px 14px 6px;display:flex;flex-direction:column;gap:7px}
#tel .bu{max-width:82%;padding:8px 12px;border-radius:18px;font-size:15px;line-height:1.3;animation:telB .25s both}
#tel .bu.eux{align-self:flex-start;background:rgba(255,255,255,.14);border-bottom-left-radius:6px}
#tel .bu.moi{align-self:flex-end;background:#0a7aff;border-bottom-right-radius:6px}
#tel .bu.tape{opacity:.7;font-style:italic}
@keyframes telB{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
#tel .chx{padding:8px 14px 10px;display:flex;flex-direction:column;gap:7px}
#tel .chx button{border:0;border-radius:16px;padding:11px 14px;background:rgba(255,255,255,.92);color:#0a2a5a;font-size:15px;font-weight:700;text-align:left}
#tel .chx button.go{background:#34c759;color:#fff;text-align:center}
#tel .racc{margin:6px auto 30px;width:66px;height:66px;border-radius:50%;border:0;background:#ff3b30;color:#fff;font-size:28px;display:grid;place-items:center;box-shadow:0 4px 14px rgba(255,59,48,.4)}
#tel .fermer{position:absolute;top:-46px;right:4px;width:38px;height:38px;border-radius:50%;border:0;background:rgba(255,255,255,.15);color:#fff;font-size:18px}`;
const CONTACTS=[
  {k:'tv',n:'Mistral TV',s:'Rédaction · Le Grand Débat',c:'#e8402a',i:'TV'},
  {k:'radio',n:'Radio Joliette',s:'Standard de l’antenne',c:'#7a3ad8',i:'RJ'},
  {k:'quai',n:'Le Quai',s:'Rédaction du journal',c:'#1d3f74',i:'LQ'},
  {k:'maman',n:'Maman',s:'mobile',c:'#e88aa8',i:'❤'},
  {k:'pizza',n:'Pizza Mamma Dock',s:'Livraison sur le quai',c:'#e8a02a',i:'🍕'},
  {k:'patron',n:'Le Patron',s:'⚠️ ne pas appeler pour rien',c:'#3a3e46',i:'P'}];
const INCONNU={k:'inconnu',n:'Numéro inconnu',s:'',c:'#8a8e94',i:'?'};
let RAC=null,T0=0,TIMER=null;
const vib=x=>{try{vibrer&&vibrer(x);}catch(_){}};
const pause=ms=>new Promise(r=>setTimeout(r,ms));
function vue(n){RAC.querySelectorAll('.vue').forEach(v=>v.classList.toggle('on',v.dataset.v===n));}
function heure(){const d=new Date();return String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0');}
/* une réplique de l'autre côté du fil : d'abord « … », puis le texte */
async function eux(t){const F=RAC.querySelector('.fil');const b=document.createElement('div');b.className='bu eux tape';b.textContent='…';F.appendChild(b);F.scrollTop=1e6;
  await pause(500+Math.min(1400,t.length*18));b.className='bu eux';b.textContent=t;F.scrollTop=1e6;vib(5);}
function moi(t){const F=RAC.querySelector('.fil');const b=document.createElement('div');b.className='bu moi';b.textContent=t;F.appendChild(b);F.scrollTop=1e6;}
function choix(L){return new Promise(ok=>{const C=RAC.querySelector('.chx');C.innerHTML='';
  L.forEach((t,i)=>{const b=document.createElement('button');if(typeof t==='object'){b.className='go';b.textContent=t.go;}else b.textContent=t;
    b.onclick=()=>{vib(8);C.innerHTML='';if(typeof t!=='object')moi(t);ok(i);};C.appendChild(b);});
  RAC.querySelector('.fil').scrollTop=1e6;});}
/* LES CONVERSATIONS */
const APPELS={
  async pizza(){await eux('Pizza Mamma Dock, bonjour ! Qu’est-ce qu’on vous sert ?');
    const i=await choix(['Une Reine','Une 4 fromages','Une spéciale sardine','Surprenez-moi']);const P=['Reine','4 fromages','spéciale sardine','surprise du chef'][i];
    if(i===3)await eux('Ah, la surprise ! Même nous on ne sait pas ce qu’il y a dedans.');
    await eux('Une '+P+', c’est noté. Vous êtes où ?');
    if(window.LABO&&window.LABO.pizza){await choix(['Au Labo, sur le quai.']);await eux('Le livreur part tout de suite. Il est rapide. Enfin, il est motivé.');window.LABO.pizza(P);}
    else{await choix(['Sur le port.']);await eux('Ah, désolé, pour l’instant on ne livre qu’au Labo. C’est une pizzeria expérimentale.');}},
  async patron(){await eux('Ouais ? C’est le patron. Fais vite, j’ai trois bateaux qui attendent.');
    const i=await choix(['Je suis malade, je ne viens pas.','Ma grand-mère se marie.','Une mouette m’a volé mes clés.','Je passe à la télé ce soir.']);
    const R=['Malade ? Hier tu faisais la course de chariots. Envoie un certificat.','Ta grand-mère se marie ? C’est la troisième fois cette année. Elle collectionne ?','… Une mouette. Tes clés.  … HAHAHA ! Allez, prends ta journée, tu l’as méritée.','À la télé ? Je regarderai. Mais demain à 6 h, t’es là.'];
    await eux(R[i]);if(i===2)await eux('Et si tu la retrouves, ramène-la, elle bossera mieux que Bébert.');await choix(['Merci patron']);},
  async inconnu(){await eux('Allô ? C’est pour le canapé Leboncoin ?');
    const i=await choix(['Oui, c’est moi !','Non, vous faites erreur.','Le canapé est vendu, désolé.']);
    if(i===1){await eux('Ah… pardon. Vous ne voulez pas un canapé, du coup ? Il est en cuir. Presque.');await choix(['Non merci.']);return;}
    await eux('Super ! Il est toujours à 50 € ? Il a vraiment les taches de café décrites dans l’annonce ?');
    const j=await choix(['Oui, des taches artistiques.','Les taches sont en option, +20 €.','En fait c’est un pouf.']);
    await eux(['Artistiques ! J’adore. Je passe demain.','En option ?! … C’est raisonnable. Je prends avec.','Un pouf ?! … Bon. J’aime bien les poufs aussi.'][j]);await choix(['À demain !']);await eux('(Tu viens de vendre un canapé que tu n’as pas.)');},
  async tv(){await eux('Allô ? Karima, de Mistral TV. C’est bien vous, le docker dont tout le port parle ?');
    let i=await choix(['Lui-même.','Ça dépend de qui demande…','Non, vous faites erreur.']);
    if(i===2){await eux('Ah… dommage. On cherchait quelqu’un avec du caractère pour Le Grand Débat de ce soir.');i=await choix(['Attendez, c’est moi en fait !','Tant pis.']);if(i===1){await eux('Rappelez si vous changez d’avis !');return;}}
    else if(i===1)await eux('Ha ! Vous avez du répondant, c’est exactement ce qu’il nous faut.');
    await eux('On vous invite sur le plateau du Grand Débat, en direct. Vous venez ? On s’occupe du maquillage.');
    i=await choix(['Avec plaisir !','Je suis un peu timide…','Combien vous me payez ?']);
    if(i===1)await eux('Un docker timide ? Personne ne va y croire. Allez, on compte sur vous !');
    if(i===2)await eux('Un bon sandwich en loge et la gloire éternelle. C’est le tarif.');
    await eux('Rendez-vous au studio. Demandez Nadia, c’est elle qui présente. À tout de suite !');
    try{localStorage.setItem('rdv_tv',JSON.stringify({quand:Date.now()}));}catch(x){}
    const j=await choix([{go:'Aller au studio maintenant'},'Plus tard']);
    if(j===0){fermer();allerAuPlateau();}},
  async radio(){await eux('Radio Joliette, vous êtes en direct ! Vous voulez faire une dédicace ?');
    const i=await choix(['À tous les dockers du port !','Coucou maman !','À la directrice du port… bisous.']);
    await eux(['Et tout le quai qui vous applaudit ! Le standard explose !','Ohhh, c’est mignon. Elle écoute, j’en suis sûre.','Hahaha ! Courageux. Elle va adorer… ou pas.'][i]);
    await eux('Et pour finir, on vous passe quoi ?');
    const j=await choix(['Du rap de chez nous, fort !','Une vieille chanson de marins.','Rien, le silence. Je suis crevé.']);
    await eux(['C’est parti, on monte le son ! Merci et à bientôt sur Radio Joliette !','Ah, la nostalgie du port… On vous la met tout de suite. Merci !','Trente secondes de silence pour les dockers fatigués. Respect. Merci !'][j]);},
  async quai(){await eux('Rédaction du Quai, j’écoute. Une info pour la une de demain ?');
    const i=await choix(['Le blocus de la porte 4 continue !','Un camion de pastis a disparu…','Rien, je voulais juste entendre une voix.']);
    const une=['« Porte 4 : les dockers ne lâchent rien »','« Mystère au port : où est passé le pastis ? »',null][i];
    if(une){await eux('Excellent. Ça fera la une : '+une+'. Merci pour le tuyau !');try{localStorage.setItem('quai_une',JSON.stringify({titre:une,quand:Date.now()}));}catch(x){}}
    else await eux('… Bon. Allez, bonne soirée. Et mangez quelque chose.');},
  async maman(){await eux('Bip. Messagerie de Maman.');await eux('« Allô mon chéri, c’est Maman. Tu as mangé ? T’as pas répondu à mes trois messages. Rappelle-moi, et mets un pull, il y a du mistral. Bisous. »');
    await choix(['Je la rappelle plus tard.']);}};
async function appeler(C){vue('appel');const V=RAC.querySelector('.vue[data-v=appel]');
  V.querySelector('.qui').innerHTML='<div class="av" style="background:'+C.c+'">'+C.i+'</div><b>'+C.n+'</b><small class="st">appel…</small>';
  V.querySelector('.fil').innerHTML='';V.querySelector('.chx').innerHTML='';vib([10,60,10]);
  await pause(1300);if(!RAC)return;T0=Date.now();clearInterval(TIMER);TIMER=setInterval(()=>{const s=Math.floor((Date.now()-T0)/1000),st=RAC&&RAC.querySelector('.st');if(st)st.textContent=String(Math.floor(s/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0');},500);
  try{await APPELS[C.k]();}catch(x){}
  if(!RAC)return;clearInterval(TIMER);const st=RAC.querySelector('.st');if(st)st.textContent='appel terminé';await pause(900);if(RAC&&RAC.querySelector('.vue.on').dataset.v==='appel')vue('rep');}
function allerAuPlateau(){try{sauver();}catch(x){}const f=document.createElement('div');f.style.cssText='position:fixed;inset:0;z-index:2147483000;background:#0b0d14;color:#fff;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;font:800 22px "Baloo 2",sans-serif;opacity:0;transition:opacity .4s';
  f.innerHTML='<div style="font-size:12px;letter-spacing:.35em;color:#ff6a50">● EN DIRECT CE SOIR</div><div>Le Grand Débat</div><div style="font-size:13px;color:#8a96aa">MISTRAL TV</div>';document.body.appendChild(f);requestAnimationFrame(()=>f.style.opacity='1');
  setTimeout(()=>location.href='plateau.html?t='+Date.now(),1300);}
/* LES PHOTOS : on cache le téléphone, on photographie l'écran du jeu, on applique un filtre */
function grille(){const G=RAC&&RAC.querySelector('.grille');if(!G)return;let L=[];try{L=JSON.parse(localStorage.getItem('tel_photos')||'[]');}catch(x){}
  G.innerHTML=L.length?L.map(u=>'<img src="'+u+'" style="width:100%;aspect-ratio:9/16;object-fit:cover;border-radius:4px">').join(''):'<div style="grid-column:1/4;color:#aab;padding:20px;text-align:center;font-size:14px">Aucune photo. Choisis un filtre pour prendre un selfie.</div>';}
function photo(f){if(!RAC)return;const R0=RAC;R0.style.visibility='hidden';vib(10);
  setTimeout(()=>{try{const cv=[...document.querySelectorAll('canvas')].sort((a,b)=>b.width*b.height-a.width*a.height)[0];const w=180,h=320,c=document.createElement('canvas');c.width=w;c.height=h;const g=c.getContext('2d');
    const r=Math.max(w/cv.width,h/cv.height),sw=w/r,sh=h/r;
    if(f==='mistral'){g.globalAlpha=.35;for(let k=0;k<5;k++)g.drawImage(cv,(cv.width-sw)/2-k*8,(cv.height-sh)/2,sw,sh,0,0,w,h);g.globalAlpha=1;g.save();g.translate(w/2,h/2);g.rotate(-.06);g.drawImage(cv,(cv.width-sw)/2,(cv.height-sh)/2,sw,sh,-w/2,-h/2,w,h);g.restore();g.strokeStyle='rgba(255,255,255,.8)';g.lineWidth=2;for(let k=0;k<9;k++){const y=20+k*34;g.beginPath();g.moveTo(10+k*7%40,y);g.lineTo(80+k*13%60,y);g.stroke();}}
    else g.drawImage(cv,(cv.width-sw)/2,(cv.height-sh)/2,sw,sh,0,0,w,h);
    if(f==='soleil'){const gr=g.createLinearGradient(0,0,0,h);gr.addColorStop(0,'rgba(255,120,60,.55)');gr.addColorStop(1,'rgba(140,40,120,.35)');g.fillStyle=gr;g.fillRect(0,0,w,h);g.fillStyle='rgba(255,220,120,.7)';g.beginPath();g.arc(w*.75,h*.2,22,0,7);g.fill();}
    if(f==='mouette'){g.font='64px sans-serif';g.textAlign='center';g.fillText('🐦',w*.72,h*.32);g.font='bold 16px sans-serif';g.fillStyle='#fff';g.strokeStyle='#000';g.lineWidth=3;g.strokeText('KIAAA',w*.72,h*.42);g.fillText('KIAAA',w*.72,h*.42);}
    g.fillStyle='rgba(255,255,255,.85)';g.font='bold 9px sans-serif';g.textAlign='left';g.fillText('Battle Dock · '+new Date().toLocaleDateString('fr-FR'),8,h-8);
    let L=[];try{L=JSON.parse(localStorage.getItem('tel_photos')||'[]');}catch(x){}L.unshift(c.toDataURL('image/jpeg',.72));localStorage.setItem('tel_photos',JSON.stringify(L.slice(0,12)));}catch(x){}
    const fl=document.createElement('div');fl.style.cssText='position:fixed;inset:0;background:#fff;z-index:2147483600;opacity:.9;transition:opacity .35s';document.body.appendChild(fl);requestAnimationFrame(()=>fl.style.opacity='0');setTimeout(()=>fl.remove(),400);
    R0.style.visibility='';grille();},180);}
window.appelEntrant=function(k){if(!RAC)window.ouvrirLeTelephone();setTimeout(()=>appeler(k==='inconnu'?INCONNU:CONTACTS.find(c=>c.k===k)),300);};
function fermer(){if(!RAC)return;const R0=RAC;RAC=null;clearInterval(TIMER);R0.classList.remove('on');setTimeout(()=>R0.remove(),220);try{window.FP_GEL=0;}catch(x){}}
window.ouvrirLeTelephone=function(){if(RAC)return;
  if(!document.getElementById('telCss')){const s=document.createElement('style');s.id='telCss';s.textContent=CSS;document.head.appendChild(s);}
  const d=document.createElement('div');d.id='tel';RAC=d;
  const J=['dimanche','lundi','mardi','mercredi','jeudi','vendredi','samedi'],M=['janvier','février','mars','avril','mai','juin','juillet','août','septembre','octobre','novembre','décembre'],D=new Date();
  d.innerHTML='<div class="app"><button class="fermer" aria-label="Fermer">✕</button><div class="ecran"><div class="encoche"></div><div class="sb"><span class="h">'+heure()+'</span><span>📶 🔋</span></div>'+
    '<div class="vue acc on" data-v="acc"><div class="heure">'+heure()+'</div><div class="date">'+J[D.getDay()]+' '+D.getDate()+' '+M[D.getMonth()]+'</div>'+
      '<div class="apps"><button class="ap" data-a="tel"><i style="background:linear-gradient(#5ce07a,#2ab84a)">📞</i>Téléphone</button><button class="ap off"><i style="background:linear-gradient(#6ae07a,#2ab84a)">💬</i>Messages</button><button class="ap" data-a="photos"><i style="background:linear-gradient(#ffd060,#f08a20)">📷</i>Photos</button><button class="ap off"><i style="background:linear-gradient(#7ac8ff,#2a7ad8)">🌤️</i>Météo</button></div>'+
      '<div class="dock"><button class="ap" data-a="tel"><i style="background:linear-gradient(#5ce07a,#2ab84a)">📞</i></button><button class="ap off"><i style="background:linear-gradient(#6ae07a,#2ab84a)">💬</i></button><button class="ap off"><i style="background:linear-gradient(#ff8a7a,#e04a3a)">🎵</i></button></div></div>'+
    '<div class="vue rep" data-v="rep"><button class="ret">‹ Accueil</button><h2>Contacts</h2><div class="liste">'+CONTACTS.map(c=>'<button class="ct" data-c="'+c.k+'"><span class="av" style="background:'+c.c+'">'+c.i+'</span><span><b>'+c.n+'</b><small>'+c.s+'</small></span><span class="ap2">📞</span></button>').join('')+'</div></div>'+
    '<div class="vue appel" data-v="appel"><div class="qui"></div><div class="fil"></div><div class="chx"></div><button class="racc" aria-label="Raccrocher">✆</button></div>'+
    '<div class="vue photos" data-v="photos"><button class="ret ret2">‹ Accueil</button><h2>Photos</h2><div class="pfil" style="display:flex;gap:6px;padding:0 14px 10px;flex-wrap:wrap"><button data-f="aucun">📷 Normal</button><button data-f="mouette">🐦 Mouette</button><button data-f="mistral">🌬️ Mistral</button><button data-f="soleil">🌅 Coucher de soleil</button></div><div class="grille" style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:3px;padding:0 6px;overflow-y:auto"></div></div>'+
    '<div class="barreH"></div></div></div>';
  document.body.appendChild(d);requestAnimationFrame(()=>d.classList.add('on'));window.FP_GEL=Date.now()+86400000;vib(8);
  d.querySelector('.fermer').onclick=fermer;d.addEventListener('click',ev=>{if(ev.target===d)fermer();});
  d.querySelectorAll('.ap[data-a=tel]').forEach(b=>b.onclick=()=>{vib(6);vue('rep');});
  d.querySelectorAll('.ap.off').forEach(b=>b.onclick=()=>{vib(20);});
  d.querySelector('.ret').onclick=()=>vue('acc');d.querySelector('.ret2').onclick=()=>vue('acc');
  d.querySelectorAll('.ap[data-a=photos]').forEach(b=>b.onclick=()=>{vib(6);vue('photos');grille();});
  d.querySelectorAll('.pfil button').forEach(b=>{b.style.cssText='border:0;border-radius:12px;padding:7px 10px;background:rgba(255,255,255,.9);color:#0a2a5a;font:700 13px system-ui';b.onclick=()=>photo(b.dataset.f);});
  d.querySelectorAll('.ct').forEach(b=>b.onclick=()=>appeler(CONTACTS.find(c=>c.k===b.dataset.c)));
  d.querySelector('.racc').onclick=()=>{clearInterval(TIMER);vib(12);vue('rep');};
  d.querySelector('.barreH').onclick=()=>vue('acc');};
})();
