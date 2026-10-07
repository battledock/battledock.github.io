/* =====================================================================
   BATTLE DOCK 3.0 — L'ÉCRAN DE MAINTENANCE
   Chargé tout en haut de l'accueil et du jeu. Il demande au serveur si le jeu est en maintenance pour
   ce joueur (seuls les joueurs autorisés passent) ; sinon il recouvre tout avec l'annonce des nouveautés.
   ===================================================================== */
(function(){
  var SB='https://zpfkekiavlfphialvphi.supabase.co', CLE='sb_publishable__dfR2lEOwKjhhtavvJEvGw_KVACZnHP';
  var id='';try{id=(JSON.parse(localStorage.getItem('bdl.pix.v2')||'{}')).id||'';}catch(e){}
  var NOUV=[
    [null,'La forêt, en grand','Le pont est remonté, la rive est s’ouvre de l’autre côté de la rivière, et la forêt devient sa propre carte : elle charge plus vite et ne traîne plus les champs de la ferme derrière elle.','🌲'],
    [null,'Ton terrain, ta maison','Au milieu de la rive est, un terrain piqueté qui n’attend que toi. Rassemble planches, pierres et tuiles, et bâtis ton mas — puis agrandis-le.','🏠'],
    [null,'Le bûcheron fabrique','Sa scierie ne fait plus que des planches : elle cuit les tuiles (une bûche et deux pierres) et taille les poutres (quatre bûches). De quoi monter les murs.','🪚'],
    [null,'Le marché à cours réel','Les prix sont les mêmes pour tout le monde et bougent avec ce que vous vendez. Les flèches à la criée disent si ça monte ou si ça tombe, et la Gazette publie les cours.','📈'],
    [null,'Les œufs, enfin','Ils vont dans ton sac au lieu de se vendre tout seuls — et l’œuf d’or, un sur deux cents, aussi. Le blé récolté, lui, remplit la réserve du poulailler.','🥚'],
    [null,'La cuisine chez Fonfon','Pain, confiture, conserve, soupe et tarte : l’ardoise du chef transforme tes récoltes pendant que tu vaques ailleurs.','🍲'],
    [null,'Les commandes du marché','Trois commandes par jour à la boutique de la ferme, payées jusqu’à 80 % au-dessus du cours.','📋'],
    [null,'Le menu s’étoffe','« En cours » te dit ce qui pousse, ce qui mijote et ce qu’il reste à livrer. « Comment jouer » explique le port en trois onglets illustrés.','📖'],
    [null,'La batterie tient','Le jeu ne dessine plus soixante images par seconde pour rien : trente à l’arrêt, six derrière un menu, aucune en arrière-plan. Et un mode économe dans les réglages.','🔋'],
    [null,'La Gazette illustrée','Trois gravures dessinées au pixel — la mine au petit matin, l’étal de la criée, le quai au crépuscule — avec leur trame d’impression.','📰'],
    [null,'Trois tenues de collection','Le pirate, le smoking doré et l’épouvantail se cachent dans un ticket, un jackpot et une récolte. Huit à trouver en tout.','🎭'],
    [null,'Des surprises…','On ne dit rien. Ouvre l’œil en te promenant.','🎁']];
  var CSS='#bd3{position:fixed;inset:0;z-index:2147483000;overflow-y:auto;background:radial-gradient(ellipse at 50% 0,#2a3e58,#0e1622 70%);color:#f4ecd8;font-family:Georgia,serif;-webkit-overflow-scrolling:touch}'+
    '#bd3 .in{max-width:560px;margin:0 auto;padding:calc(env(safe-area-inset-top,0px) + 28px) 18px calc(env(safe-area-inset-bottom,0px) + 40px)}'+
    '#bd3 .v{display:inline-block;border:1px solid #f0c85a;color:#f0c85a;border-radius:20px;padding:4px 12px;font:700 12px ui-monospace,monospace;letter-spacing:3px}'+
    '#bd3 h1{margin:14px 0 6px;font:900 32px Georgia;letter-spacing:1px;line-height:1.1}#bd3 h1 b{color:#f0c85a}'+
    '#bd3 .mt{font:italic 15px Georgia;opacity:.9;margin-bottom:6px}#bd3 .roue{display:flex;align-items:center;gap:10px;margin:16px 0 22px;padding:12px 14px;border-radius:14px;background:rgba(240,200,90,.12);font:14px Georgia}'+
    '#bd3 .roue i{width:22px;height:22px;border:3px solid rgba(240,200,90,.3);border-top-color:#f0c85a;border-radius:50%;animation:bd3r 1s linear infinite;flex:none}@keyframes bd3r{to{transform:rotate(360deg)}}'+
    '#bd3 .t2{font:700 12px ui-monospace,monospace;letter-spacing:3px;color:#f0c85a;margin:6px 0 12px}'+
    '#bd3 .c{background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);border-radius:18px;overflow:hidden;margin-bottom:14px}'+
    '#bd3 .c img{display:block;width:100%;height:auto;image-rendering:pixelated}#bd3 .c .e{font-size:54px;text-align:center;padding:22px 0 6px}'+
    '#bd3 .c .tx{padding:12px 16px 16px}#bd3 .c b{display:block;font:700 19px Georgia;margin-bottom:4px}#bd3 .c span{font:15px Georgia;opacity:.85;line-height:1.4}'+
    '#bd3 .fin{text-align:center;font:italic 14px Georgia;opacity:.8;margin-top:18px}';
  /* LA RÉOUVERTURE : le serveur donne l'heure ; on affiche le compte à rebours, et on recharge à l'heure dite */
  var FIN_A=0;
  function reste(){var r=Math.max(0,Math.round((FIN_A-Date.now())/1000));var h=Math.floor(r/3600),m=Math.floor(r%3600/60),x=r%60;
    return r<=0?'C’est l’heure ! On ouvre…':(h>0?h+' h '+(m<10?'0':'')+m+' min':m+' min '+(x<10?'0':'')+x+' s');}
  function tic(){var el=document.getElementById('bd3r');if(!el)return;el.textContent=reste();
    if(FIN_A&&Date.now()>=FIN_A+3000){location.reload();return;}setTimeout(tic,1000);}
  function montrer(v,d){
    if(d&&typeof d.reste==='number')FIN_A=Date.now()+d.reste*1000;
    if(document.getElementById('bd3'))return;
    var st=document.createElement('style');st.textContent=CSS;document.head.appendChild(st);
    var d=document.createElement('div');d.id='bd3';
    d.innerHTML='<div class="in"><span class="v">VERSION '+(v||'3.0')+'</span><h1>Battle Dock <b>'+(v||'3.0')+'</b> arrive</h1>'+
      '<div class="mt">Le jeu est fermé le temps d’installer la mise à jour : la forêt s’agrandit, et chacun aura sa maison.</div>'+
      (FIN_A?'<div class="roue"><i></i><span>Réouverture <b>ce soir à 20h00</b><br><small id="bd3r" style="font:700 13px ui-monospace,monospace;color:#f0c85a">'+reste()+'</small></span></div>'
            :'<div class="roue"><i></i>On installe tout ça… Reviens très vite !</div>')+'<div class="t2">LES NOUVEAUTÉS</div>'+
      NOUV.map(function(n){return '<div class="c">'+(n[0]?'<img loading="lazy" src="nouveautes/'+n[0]+'" alt="">':'<div class="e">'+n[3]+'</div>')+
        '<div class="tx"><b>'+n[1]+'</b><span>'+n[2]+'</span></div></div>';}).join('')+
      '<div class="fin">Merci de ta patience — rendez-vous ce soir sur le port.</div></div>';
    (document.body||document.documentElement).appendChild(d);
    try{document.documentElement.style.overflow='hidden';}catch(e){}
    window.__MAINTENANCE=true;
    tic();
  }
  function verifier(){
    fetch(SB+'/rest/v1/rpc/maintenance_pour',{method:'POST',headers:{'apikey':CLE,'Authorization':'Bearer '+CLE,'Content-Type':'application/json'},body:JSON.stringify({p_joueur:id})})
      .then(function(r){return r.json();}).then(function(d){if(d&&d.bloque){if(document.body)montrer(d.version,d);else document.addEventListener('DOMContentLoaded',function(){montrer(d.version,d);});}})
      .catch(function(){});
  }
  /* ================= LA FORÊT EN TRAVAUX =================
     Elle se ferme à part : on n'entre pas dans le bois, le reste du jeu
     continue de tourner. Les joueurs autorisés passent quand même. */
  var FORET_FERMEE=false;   /* la foret est rouverte a tout le monde */
  var FORET_OUVERTS=['e029d1fb-7baa-4225-91fd-5cdbef6f8711'];
  function versLaForet(){
    try{
      var q=new URLSearchParams(location.search);
      if(location.pathname.indexOf('foret.html')>=0)return true;
      if((q.get('carte')||'')==='foret')return true;
      var sv=JSON.parse(localStorage.getItem('bdl.pix.v2')||'{}');
      if(!q.get('carte')&&location.pathname.indexOf('jeu.html')>=0&&sv.carte==='foret')return true;
    }catch(e){}
    return false;
  }
  function ecranForet(){
    var d=document.createElement('div');d.id='bdForet';
    d.style.cssText='position:fixed;inset:0;z-index:99999;background:#101a12;color:#eef6ea;'+
      'font-family:Georgia,serif;display:flex;flex-direction:column;align-items:center;'+
      'justify-content:center;text-align:center;padding:34px 26px';
    d.innerHTML=
      '<div style="font:700 9px Arial;letter-spacing:4px;color:#7fae90">LA FORÊT</div>'+
      '<div style="font:400 34px Georgia;margin:12px 0 4px">Nouveautés en cours d’ajout</div>'+
      '<div style="width:110px;height:1px;margin:18px auto;background:linear-gradient(90deg,transparent,#c9a24a,transparent)"></div>'+
      '<div style="font:italic 15px Georgia;color:#a9c7b4;line-height:1.6;max-width:340px">'+
      'Le bois est fermé le temps d’y planter ce qui manque.<br>Le port et la ferme restent ouverts.</div>'+
      '<button id="bdfRetour" style="margin-top:30px;border:1px solid #c9a24a;border-radius:3px;'+
      'background:rgba(201,162,74,.12);color:#f6efdc;padding:15px 26px;font:700 11px Arial;letter-spacing:3px">'+
      'RETOUR AU PORT</button>';
    (document.body||document.documentElement).appendChild(d);
    try{document.documentElement.style.overflow='hidden';}catch(e){}
    window.__MAINTENANCE=true;
    var b=document.getElementById('bdfRetour');
    if(b)b.onclick=function(){
      try{var sv=JSON.parse(localStorage.getItem('bdl.pix.v2')||'{}');
        sv.carte='extramar';localStorage.setItem('bdl.pix.v2',JSON.stringify(sv));}catch(e){}
      location.href='jeu.html?carte=extramar&v='+Date.now();};
  }
  if(FORET_FERMEE&&versLaForet()&&FORET_OUVERTS.indexOf(id)<0){
    if(document.body)ecranForet();
    else document.addEventListener('DOMContentLoaded',ecranForet);
  }
  /* ================= LA FERME EN TRAVAUX =================
     Même principe que la forêt : seule la ferme se ferme, le port continue
     de tourner. Pour rouvrir : passer FERME_FERMEE à false. */
  var FERME_FERMEE=true;
  var FERME_OUVERTS=[];   /* personne ne passe, toi compris */
  function versLaFerme(){
    try{
      var q=new URLSearchParams(location.search);
      if(location.pathname.indexOf('ferme.html')>=0)return true;
      if((q.get('carte')||'')==='ferme')return true;
      var sv=JSON.parse(localStorage.getItem('bdl.pix.v2')||'{}');
      if(!q.get('carte')&&location.pathname.indexOf('jeu.html')>=0&&sv.carte==='ferme')return true;
    }catch(e){}
    return false;
  }
  var CSS_FERME='#bdFerme{position:fixed;inset:0;z-index:2147483000;overflow:hidden;background:#1a1409;'+
    'color:#f6efdc;font-family:Georgia,serif;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center}'+
    '#bdFerme .scene{position:absolute;inset:0;width:100%;height:100%}'+
    '#bdFerme{justify-content:flex-start}'+
    '#bdFerme .in{position:relative;z-index:2;padding:calc(env(safe-area-inset-top,0px) + 11vh) 26px 0;max-width:360px}'+
    '#bdFerme .k{font:700 9px Arial;letter-spacing:4px;color:#d6b36a}'+
    '#bdFerme h2{margin:12px 0 4px;font:400 34px Georgia;line-height:1.15;color:#fdf6e3}'+
    '#bdFerme .r{width:110px;height:1px;margin:18px auto;background:linear-gradient(90deg,transparent,#c9a24a,transparent)}'+
    '#bdFerme p{margin:0;font:italic 15px Georgia;color:#d9c9a3;line-height:1.6}'+
    '#bdFerme button{margin-top:30px;border:1px solid #c9a24a;border-radius:3px;background:rgba(201,162,74,.14);'+
    'color:#f6efdc;padding:15px 26px;font:700 11px Arial;letter-spacing:3px;cursor:pointer}'+
    '#bdFerme button:active{background:rgba(201,162,74,.28)}'+
    '#bdFerme .ble{transform-origin:bottom center;animation:bdble 4.5s ease-in-out infinite}'+
    '#bdFerme .ble2{animation-duration:6s;animation-delay:-1.5s}'+
    '@keyframes bdble{0%,100%{transform:skewX(0deg)}50%{transform:skewX(-5deg)}}'+
    '#bdFerme .lune{animation:bdlu 6s ease-in-out infinite}'+
    '@keyframes bdlu{0%,100%{opacity:.85}50%{opacity:1}}'+
    '#bdFerme .fum{animation:bdfu 5s linear infinite;transform-origin:center}'+
    '@keyframes bdfu{0%{opacity:0;transform:translateY(0) scale(.7)}30%{opacity:.5}100%{opacity:0;transform:translateY(-34px) scale(1.5)}}';
  function sceneFerme(){
    return '<svg class="scene" viewBox="0 0 400 700" preserveAspectRatio="xMidYMid slice" aria-hidden="true">'+
      '<defs><linearGradient id="bdc" x1="0" y1="0" x2="0" y2="1">'+
      '<stop offset="0" stop-color="#1d1a10"/><stop offset=".38" stop-color="#3d3018"/><stop offset=".62" stop-color="#7a5425"/><stop offset=".78" stop-color="#c8862f"/><stop offset="1" stop-color="#e8b457"/></linearGradient>'+
      '<linearGradient id="bdt" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2e2512"/><stop offset="1" stop-color="#16110a"/></linearGradient>'+
      '<linearGradient id="bdv" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#16110a" stop-opacity=".34"/><stop offset="1" stop-color="#16110a" stop-opacity="0"/></linearGradient>'+
      '</defs>'+
      '<rect width="400" height="700" fill="url(#bdc)"/>'+
      /* lune */
      '<circle class="lune" cx="336" cy="62" r="21" fill="#f6e3b0"/>'+
      '<circle cx="327" cy="55" r="18" fill="#201b10" opacity=".9"/>'+
      '<g fill="#fdf6e3" opacity=".5"><circle cx="60" cy="74" r="1.6"/><circle cx="142" cy="128" r="1.1"/><circle cx="228" cy="52" r="1.4"/><circle cx="356" cy="186" r="1.1"/><circle cx="96" cy="196" r="1.2"/><circle cx="268" cy="156" r="1"/></g>'+
      /* colline */
      '<path d="M0 560 Q130 512 400 548 L400 700 L0 700Z" fill="url(#bdt)"/>'+
      /* silo */
      '<g transform="translate(266 452)"><rect x="0" y="22" width="32" height="104" fill="#1d160c"/><path d="M0 24 Q16 0 32 24Z" fill="#2e2113"/></g>'+
      /* grange */
      '<g transform="translate(112 436)">'+
      '<rect x="0" y="50" width="118" height="82" fill="#23180d"/>'+
      '<path d="M-13 52 L59 6 L131 52Z" fill="#32220f"/>'+
      '<rect x="43" y="88" width="32" height="44" fill="#e8b457" opacity=".9"/>'+
      '<rect x="12" y="66" width="19" height="17" fill="#f6d27a" opacity=".85"/>'+
      '<rect x="88" y="66" width="19" height="17" fill="#f6d27a" opacity=".85"/>'+
      '<rect x="55" y="20" width="8" height="26" fill="#16110a"/>'+
      '<circle class="fum" cx="59" cy="16" r="6" fill="#f6e3b0" opacity=".32"/>'+
      '</g>'+
      /* clôture */
      '<g stroke="#1b1409" stroke-width="5" opacity=".92">'+
      '<path d="M0 604h400M0 626h400"/><path d="M26 586v62M96 590v60M166 594v58M236 596v58M306 594v58M376 590v60"/></g>'+
      /* blé */
      '<g stroke="#6d4a1f" stroke-width="3" opacity=".9">'+
      '<g class="ble"><path d="M20 700v-62M56 700v-52M92 700v-68"/></g>'+
      '<g class="ble ble2"><path d="M140 700v-56M188 700v-66M236 700v-50"/></g>'+
      '<g class="ble"><path d="M288 700v-64M332 700v-54M374 700v-60"/></g></g>'+
      '<rect width="400" height="470" fill="url(#bdv)"/>'+
      '</svg>';
  }
  function ecranFerme(){
    if(document.getElementById('bdFerme'))return;
    var st=document.createElement('style');st.textContent=CSS_FERME;document.head.appendChild(st);
    var d=document.createElement('div');d.id='bdFerme';
    d.innerHTML=sceneFerme()+
      '<div class="in">'+
      '<div class="k">LA FERME</div>'+
      '<h2>Les travaux ont commencé</h2>'+
      '<div class="r"></div>'+
      '<p>La grange est fermée le temps de refaire les enclos et les cultures.<br>Le port et la ville restent ouverts.</p>'+
      '<button id="bdfeRetour">RETOUR AU PORT</button>'+
      '</div>';
    (document.body||document.documentElement).appendChild(d);
    try{document.documentElement.style.overflow='hidden';}catch(e){}
    window.__MAINTENANCE=true;
    var b=document.getElementById('bdfeRetour');
    if(b)b.onclick=function(){
      try{var sv=JSON.parse(localStorage.getItem('bdl.pix.v2')||'{}');
        sv.carte='extramar';localStorage.setItem('bdl.pix.v2',JSON.stringify(sv));}catch(e){}
      location.href='jeu.html?carte=extramar&v='+Date.now();};
  }
  if(FERME_FERMEE&&versLaFerme()&&FERME_OUVERTS.indexOf(id)<0){
    window.__MAINTENANCE=true;   /* posé tout de suite : ferme.html lit ce drapeau avant de rediriger */
    if(document.body)ecranFerme();
    else document.addEventListener('DOMContentLoaded',ecranFerme);
  }
  verifier();
  setInterval(function(){if(!document.getElementById('bd3'))verifier();},60000);   /* si la maintenance commence pendant qu'on joue */
})();
