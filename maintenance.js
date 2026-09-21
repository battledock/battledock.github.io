/* =====================================================================
   BATTLE DOCK 3.0 — L'ÉCRAN DE MAINTENANCE
   Chargé tout en haut de l'accueil et du jeu. Il demande au serveur si le jeu est en maintenance pour
   ce joueur (seuls les joueurs autorisés passent) ; sinon il recouvre tout avec l'annonce des nouveautés.
   ===================================================================== */
(function(){
  var SB='https://zpfkekiavlfphialvphi.supabase.co', CLE='sb_publishable__dfR2lEOwKjhhtavvJEvGw_KVACZnHP';
  var id='';try{id=(JSON.parse(localStorage.getItem('bdl.pix.v2')||'{}')).id||'';}catch(e){}
  var NOUV=[
    ['ferme.jpg','La ferme','Une cour de campagne au bout du village : le Grainetier, le Fournil, le grand moulin, le rucher.'],
    ['potager.jpg','Le potager','Ton champ à toi : bêche, sème, arrose, récolte. 18 cultures, du radis au safran.'],
    ['poulailler.jpg','Le poulailler','Tes poules pondent même quand tu dors. Et un œuf sur deux cents est en or.'],
    [null,'Un jeu plus fluide','Des images deux fois plus légères, surtout sur le port : ça ne rame plus.','⚡'],
    [null,'Des surprises…','On ne dit rien. Ouvre l’œil en te promenant.','🎁'],
    ['marseille.jpg','Marseille embellie','Le Vieux-Port refait : le fumoir, la poste, le Peigne d’Or, la poissonnerie…'],
    ['casino.jpg','Le Grand Casino ouvre','En haut de la montée. Tenue correcte exigée.'],
    ['montagne.jpg','La montagne et sa nouvelle mine','Prends la télécabine jusqu’au sommet de Saumaski.'],
    ['station.jpg','La station de ski','La station, sa patinoire, son école et ses pistes.'],
    ['ski.jpg','Les pistes','Des descentes chronométrées entre les fanions.']];
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
  function montrer(v){
    if(document.getElementById('bd3'))return;
    var st=document.createElement('style');st.textContent=CSS;document.head.appendChild(st);
    var d=document.createElement('div');d.id='bd3';
    d.innerHTML='<div class="in"><span class="v">VERSION '+(v||'3.0')+'</span><h1>Battle Dock <b>'+(v||'3.0')+'</b> arrive</h1>'+
      '<div class="mt">Le jeu est en maintenance le temps d’installer la plus grosse mise à jour de son histoire.</div>'+
      '<div class="roue"><i></i>On installe tout ça… Reviens très vite !</div><div class="t2">LES NOUVEAUTÉS</div>'+
      NOUV.map(function(n){return '<div class="c">'+(n[0]?'<img loading="lazy" src="nouveautes/'+n[0]+'" alt="">':'<div class="e">'+n[3]+'</div>')+
        '<div class="tx"><b>'+n[1]+'</b><span>'+n[2]+'</span></div></div>';}).join('')+
      '<div class="fin">Merci de ta patience — à tout de suite sur le port.</div></div>';
    (document.body||document.documentElement).appendChild(d);
    try{document.documentElement.style.overflow='hidden';}catch(e){}
    window.__MAINTENANCE=true;
  }
  function verifier(){
    fetch(SB+'/rest/v1/rpc/maintenance_pour',{method:'POST',headers:{'apikey':CLE,'Authorization':'Bearer '+CLE,'Content-Type':'application/json'},body:JSON.stringify({p_joueur:id})})
      .then(function(r){return r.json();}).then(function(d){if(d&&d.bloque){if(document.body)montrer(d.version);else document.addEventListener('DOMContentLoaded',function(){montrer(d.version);});}})
      .catch(function(){});
  }
  verifier();
  setInterval(function(){if(!document.getElementById('bd3'))verifier();},60000);   /* si la maintenance commence pendant qu'on joue */
})();
