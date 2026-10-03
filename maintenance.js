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
  verifier();
  setInterval(function(){if(!document.getElementById('bd3'))verifier();},60000);   /* si la maintenance commence pendant qu'on joue */
})();
