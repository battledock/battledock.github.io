/* =====================================================================
   BATTLE DOCK 3.0 — L'ÉCRAN DE MAINTENANCE
   Chargé tout en haut de l'accueil et du jeu. Il demande au serveur si le jeu est en maintenance pour
   ce joueur (seuls les joueurs autorisés passent) ; sinon il recouvre tout avec l'annonce des nouveautés.
   ===================================================================== */
(function(){
  var SB='https://zpfkekiavlfphialvphi.supabase.co', CLE='sb_publishable__dfR2lEOwKjhhtavvJEvGw_KVACZnHP';
  var id='';try{id=(JSON.parse(localStorage.getItem('bdl.pix.v2')||'{}')).id||'';}catch(e){}
  /* LE LAISSEZ-PASSER : on listait ici l'identifiant du développeur, en clair,
     dans un fichier que tout le monde télécharge. On se contente maintenant
     d'un marqueur posé sur l'appareil : il n'identifie personne et ne se
     devine pas depuis la page. Pour se le poser, une fois, dans la console :
         localStorage.setItem('bd.passe','1')
     Pour le retirer : localStorage.removeItem('bd.passe') */
  var PASSE=false;try{PASSE=localStorage.getItem('bd.passe')==='1';}catch(e){}
  /* LES PSEUDOS QUI PASSENT MALGRÉ LES TRAVAUX. Poser le laissez-passer à la
     main demande une console, ce qu'on n'a pas sur un téléphone : on lit
     donc aussi le pseudo de la sauvegarde locale.
     Ce n'est PAS une serrure — la sauvegarde est sur l'appareil, n'importe
     qui peut y écrire ce pseudo. C'est un raccourci de chantier, et la
     vraie protection est côté serveur. */
  var LAISSES=['eliasse'];
  try{
    var pse=(JSON.parse(localStorage.getItem('bdl.pix.v2')||'{}')).pseudo||'';
    if(LAISSES.indexOf(String(pse).trim().toLowerCase())>=0)PASSE=true;
  }catch(e){}
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
  var FORET_FERMEE=true;    /* pour rouvrir : repasser a false */
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
  /* L'ÉCRAN DE LA FORÊT, bâti comme celui de la ferme : tailles en clamp()
     et hauteurs en dvh, pour qu'il se lise sur un petit Android comme sur
     une tablette, sans que personne ait à pincer. */
  var CSS_FORET='#bdForet{position:fixed;inset:0;z-index:2147483000;overflow:hidden;background:#101810;'+
    'color:#f1efe2;font-family:Georgia,serif;text-align:center;'+
    'display:flex;flex-direction:column;align-items:center;justify-content:space-between;'+
    '-webkit-text-size-adjust:100%;text-size-adjust:100%;touch-action:none;'+
    '-webkit-user-select:none;user-select:none}'+
    '#bdForet .scene{position:absolute;inset:0;width:100%;height:100%;display:block}'+
    '#bdForet .in{position:relative;z-index:2;width:100%;max-width:min(520px,92vw);'+
    'padding:calc(env(safe-area-inset-top,0px) + clamp(26px,7dvh,64px)) clamp(18px,6vw,34px) 0;box-sizing:border-box}'+
    '#bdForet .k{font:700 clamp(10px,2.9vw,13px)/1 Arial,sans-serif;letter-spacing:.38em;color:#d8a24a}'+
    '#bdForet h2{margin:clamp(12px,2.4dvh,20px) 0 0;font:400 clamp(30px,8.4vw,52px)/1.1 Georgia,serif;color:#fdf6e3;'+
    'text-shadow:0 2px 18px rgba(0,0,0,.6)}'+
    '#bdForet .r{width:clamp(90px,26vw,150px);height:1px;margin:clamp(16px,3dvh,26px) auto;'+
    'background:linear-gradient(90deg,transparent,#c9a24a,transparent)}'+
    '#bdForet p{margin:0 auto;max-width:30ch;font:italic clamp(16px,4.2vw,21px)/1.62 Georgia,serif;color:#ddd6bd;'+
    'text-shadow:0 1px 12px rgba(0,0,0,.65)}'+
    '#bdForet .bas{position:relative;z-index:2;width:100%;max-width:min(520px,92vw);'+
    'padding:0 clamp(18px,6vw,34px) calc(env(safe-area-inset-bottom,0px) + clamp(26px,5dvh,52px));box-sizing:border-box}'+
    '#bdForet button{-webkit-appearance:none;appearance:none;width:100%;max-width:340px;'+
    'border:1px solid #c9a24a;border-radius:4px;background:rgba(16,24,16,.55);'+
    'backdrop-filter:blur(3px);-webkit-backdrop-filter:blur(3px);'+
    'color:#f6efdc;padding:clamp(15px,2.1dvh,20px) 20px;font:700 clamp(12px,3.3vw,15px)/1 Arial,sans-serif;'+
    'letter-spacing:.26em;cursor:pointer;touch-action:manipulation}'+
    '#bdForet button:active{background:rgba(201,162,74,.3)}'+
    '@media (min-height:760px){#bdForet .in{padding-top:calc(env(safe-area-inset-top,0px) + 11dvh)}}'+
    '#bdForet .ride{animation:bdri 7s linear infinite}'+
    '@keyframes bdri{0%{transform:translateX(0);opacity:0}15%{opacity:.5}100%{transform:translateX(90px);opacity:0}}'+
    '#bdForet .ride2{animation-duration:9s;animation-delay:-3s}'+
    '#bdForet .ride3{animation-duration:5.5s;animation-delay:-1.5s}'+
    '#bdForet .feuille{animation:bdfe 9s linear infinite}'+
    '@keyframes bdfe{0%{transform:translate(0,0) rotate(0)}100%{transform:translate(38px,210px) rotate(220deg)}}'+
    '#bdForet .feuille2{animation-duration:12s;animation-delay:-5s}'+
    '#bdForet .feuille3{animation-duration:7.5s;animation-delay:-2.5s}'+
    '@media (prefers-reduced-motion:reduce){#bdForet *{animation:none!important}}';
  function sceneForet(){
    return '<svg class="scene" viewBox="0 0 400 760" preserveAspectRatio="xMidYMax slice" aria-hidden="true">'+
      '<defs>'+
      '<linearGradient id="bfc" x1="0" y1="0" x2="0" y2="1">'+
      '<stop offset="0" stop-color="#0e150e"/><stop offset=".42" stop-color="#2a2414"/>'+
      '<stop offset=".72" stop-color="#4a3a1e"/><stop offset="1" stop-color="#5a4526"/></linearGradient>'+
      '<linearGradient id="bfe" x1="0" y1="0" x2="0" y2="1">'+
      '<stop offset="0" stop-color="#3f6a5a"/><stop offset=".45" stop-color="#2a5260"/>'+
      '<stop offset="1" stop-color="#16303f"/></linearGradient>'+
      '<linearGradient id="bfv" x1="0" y1="0" x2="0" y2="1">'+
      '<stop offset="0" stop-color="#0e150e" stop-opacity=".66"/><stop offset=".6" stop-color="#0e150e" stop-opacity=".25"/>'+
      '<stop offset="1" stop-color="#0e150e" stop-opacity="0"/></linearGradient>'+
      '</defs>'+
      '<rect width="400" height="760" fill="url(#bfc)"/>'+
      /* le tapis de feuilles mortes */
      '<g>'+(function(){var o='',T=['#c9821a','#b4552a','#8a3a22','#d8a83a','#9a6a2a'];
        for(var i=0;i<210;i++){var h=(Math.sin(i*12.9898)*43758.5453);h=h-Math.floor(h);
          var h2=(Math.sin(i*78.233)*43758.5453);h2=h2-Math.floor(h2);
          var h3=(Math.sin(i*39.77)*43758.5453);h3=h3-Math.floor(h3);
          o+='<rect x="'+Math.round(h*398)+'" y="'+Math.round(300+h2*310)+'" width="3" height="2" fill="'+T[Math.floor(h3*5)]+'" opacity=".85"/>';}
        return o;})()+'</g>'+
      /* le lac, en bas */
      '<path d="M0 618 Q110 606 212 616 Q310 625 400 612 L400 760 L0 760Z" fill="url(#bfe)"/>'+
      '<path d="M0 614 Q110 602 212 612 Q310 621 400 608 L400 620 L0 626Z" fill="#6a5434"/>'+
      '<g stroke="#b0d8e8" stroke-width="2" opacity=".45" stroke-linecap="round">'+
      '<path class="ride"  d="M30 660h16"/><path class="ride ride2" d="M150 690h20"/>'+
      '<path class="ride ride3" d="M250 648h14"/><path class="ride" d="M310 712h18"/>'+
      '<path class="ride ride2" d="M80 724h16"/></g>'+
      /* le ponton qui avance dans l’eau */
      '<g><rect x="186" y="612" width="18" height="96" fill="#7d5934"/>'+
      '<rect x="186" y="612" width="18" height="3" fill="#a5764a"/>'+
      '<g fill="#5b3f21">'+(function(){var o='';for(var y=620;y<706;y+=10)o+='<rect x="186" y="'+y+'" width="18" height="2"/>';return o;})()+'</g></g>'+
      /* le sentier : il sort du bord gauche et se perd dans les feuilles */
      (function(){var o='',Y=540;
        /* la bande de terre, qui s'amincit vers le bois */
        o+='<path d="M0 '+(Y-19)+' L120 '+(Y-11)+' L150 '+(Y-5)+' L150 '+(Y+5)+' L120 '+(Y+11)+' L0 '+(Y+19)+'Z" fill="#6b5428"/>';
        o+='<path d="M0 '+(Y-19)+' L120 '+(Y-11)+' L150 '+(Y-5)+' L150 '+(Y-2)+' L120 '+(Y-8)+' L0 '+(Y-15)+'Z" fill="#7a6130"/>';
        /* deux ornières qui s'effacent */
        o+='<path d="M0 '+(Y-7)+' L112 '+(Y-3)+' L112 '+(Y-1)+' L0 '+(Y-5)+'Z" fill="#4a3a1b" opacity=".75"/>';
        o+='<path d="M0 '+(Y+7)+' L112 '+(Y+3)+' L112 '+(Y+5)+' L0 '+(Y+9)+'Z" fill="#4a3a1b" opacity=".75"/>';
        /* quelques feuilles qui mordent sur la terre, pour fondre le bord */
        for(var i=0;i<34;i++){var h=((Math.sin(i*12.9898)*43758.5453)%1+1)%1;
          var h2=((Math.sin(i*78.233)*43758.5453)%1+1)%1;
          o+='<rect x="'+Math.round(60+h*95)+'" y="'+Math.round(Y-16+h2*32)+'" width="3" height="2" fill="#9a6a2a" opacity=".8"/>';}
        return o;})()+
      /* les érables, tous sous le bloc de texte */
      (function(){var o='',A=[[46,432,24],[138,392,21],[228,446,23],[318,398,24],[378,462,20],[88,520,19],[272,536,18]];
        for(var i=0;i<A.length;i++){var x=A[i][0],y=A[i][1],r=A[i][2];
          o+='<ellipse cx="'+(x+3)+'" cy="'+(y+3)+'" rx="'+(r*0.9)+'" ry="'+(r*0.26)+'" fill="#0e150e" opacity=".4"/>'+
             '<rect x="'+(x-3)+'" y="'+(y-r*1.2)+'" width="6" height="'+(r*1.2)+'" fill="#5a3f22"/>'+
             '<rect x="'+(x-r)+'" y="'+(y-r*1.85)+'" width="'+(r*2)+'" height="'+(r*0.72)+'" fill="#a33b26"/>'+
             '<rect x="'+(x-r*0.82)+'" y="'+(y-r*2.42)+'" width="'+(r*1.64)+'" height="'+(r*0.66)+'" fill="#b4452a"/>'+
             '<rect x="'+(x-r*0.52)+'" y="'+(y-r*2.9)+'" width="'+(r*1.04)+'" height="'+(r*0.56)+'" fill="#d2762a"/>';}
        return o;})()+
      /* trois feuilles qui tombent */
      '<rect class="feuille"  x="110" y="150" width="4" height="3" fill="#d8a83a"/>'+
      '<rect class="feuille feuille2" x="266" y="120" width="4" height="3" fill="#b4552a"/>'+
      '<rect class="feuille feuille3" x="330" y="180" width="4" height="3" fill="#c9821a"/>'+
      '<rect width="400" height="520" fill="url(#bfv)"/>'+
      '</svg>';
  }
  function ecranForet(){
    if(document.getElementById('bdForet'))return;
    if(!document.querySelector('meta[name="viewport"]')){
      var mv=document.createElement('meta');mv.name='viewport';
      mv.content='width=device-width,initial-scale=1,minimum-scale=1,maximum-scale=1,user-scalable=no,viewport-fit=cover';
      (document.head||document.documentElement).appendChild(mv);
    }
    var st=document.createElement('style');st.textContent=CSS_FORET;document.head.appendChild(st);
    var d=document.createElement('div');d.id='bdForet';
    d.innerHTML=sceneForet()+
      '<div class="in">'+
      '<div class="k">LA FORÊT</div>'+
      '<h2>Le bois<br>est en travaux</h2>'+
      '<div class="r"></div>'+
      '<p>On replante, on redresse les sentiers et on remet le lac d’aplomb. Le port et la ville restent ouverts.</p>'+
      '</div>'+
      '<div class="bas"><button id="bdfRetour">RETOUR AU PORT</button></div>';
    (document.body||document.documentElement).appendChild(d);
    try{document.documentElement.style.overflow='hidden';}catch(e){}
    window.__MAINTENANCE=true;
    var b=document.getElementById('bdfRetour');
    if(b)b.onclick=function(){
      try{var sv=JSON.parse(localStorage.getItem('bdl.pix.v2')||'{}');
        sv.carte='extramar';sv.ext=null;sv.extc=null;
        localStorage.setItem('bdl.pix.v2',JSON.stringify(sv));}catch(e){}
      /* arrivee=1 : sans ce parametre le jeu relit la position d'annexe
         de la sauvegarde — celle de la foret — et posait le joueur a
         l'ouest du port, hors du quai. On arrive par le metro. */
      location.href='jeu.html?carte=extramar&arrivee=1&v='+Date.now();};
  }
  if(FORET_FERMEE&&versLaForet()&&!PASSE){
    window.__MAINTENANCE=true;   /* posé tout de suite : foret.html lit ce drapeau avant de rediriger */
    if(document.body)ecranForet();
    else document.addEventListener('DOMContentLoaded',ecranForet);
  }
  /* ================= LA FERME EN TRAVAUX =================
     Même principe que la forêt : seule la ferme se ferme, le port continue
     de tourner. Pour rouvrir : passer FERME_FERMEE à false. */
  var FERME_FERMEE=true;
  /* LE JEU DOIT SAVOIR QUE LA FERME EST FERMÉE, lui aussi : sans ce
     drapeau, marcher vers l'ouest du quai chargeait les 1,6 Mo du jeu
     pour n'afficher que l'écran de chantier. Le port lit ce drapeau et
     prévient sur place, sans quitter la carte. */
  try{window.__FERME_FERMEE=FERME_FERMEE;}catch(e){}
  /* PERSONNE NE PASSE, LAISSEZ-PASSER COMPRIS. La forêt garde sa
     dérogation ; la ferme, non : on veut la voir fermée comme la voient
     les joueurs. C'est le seul endroit du fichier où PASSE est ignoré. */
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
  /* L'ÉCRAN : il doit tenir sur un petit Android comme sur une tablette, sans
     que personne ait à pincer pour lire. D'où les tailles en clamp() et la
     hauteur en dvh : pas de texte minuscule, pas de zoom. */
  var CSS_FERME='#bdFerme{position:fixed;inset:0;z-index:2147483000;overflow:hidden;background:#17120a;'+
    'color:#f6efdc;font-family:Georgia,serif;text-align:center;'+
    'display:flex;flex-direction:column;align-items:center;justify-content:space-between;'+
    '-webkit-text-size-adjust:100%;text-size-adjust:100%;touch-action:none;'+
    '-webkit-user-select:none;user-select:none}'+
    '#bdFerme .scene{position:absolute;inset:0;width:100%;height:100%;display:block}'+
    '#bdFerme .in{position:relative;z-index:2;width:100%;max-width:min(520px,92vw);'+
    'padding:calc(env(safe-area-inset-top,0px) + clamp(26px,7dvh,64px)) clamp(18px,6vw,34px) 0;box-sizing:border-box}'+
    '#bdFerme .k{font:700 clamp(10px,2.9vw,13px)/1 Arial,sans-serif;letter-spacing:.38em;color:#e0bb6e}'+
    '#bdFerme h2{margin:clamp(12px,2.4dvh,20px) 0 0;font:400 clamp(30px,8.4vw,52px)/1.1 Georgia,serif;color:#fdf6e3;'+
    'text-shadow:0 2px 18px rgba(0,0,0,.55)}'+
    '#bdFerme .r{width:clamp(90px,26vw,150px);height:1px;margin:clamp(16px,3dvh,26px) auto;'+
    'background:linear-gradient(90deg,transparent,#c9a24a,transparent)}'+
    '#bdFerme p{margin:0 auto;max-width:30ch;font:italic clamp(16px,4.2vw,21px)/1.62 Georgia,serif;color:#e2d2ab;'+
    'text-shadow:0 1px 12px rgba(0,0,0,.6)}'+
    '#bdFerme .bas{position:relative;z-index:2;width:100%;max-width:min(520px,92vw);'+
    'padding:0 clamp(18px,6vw,34px) calc(env(safe-area-inset-bottom,0px) + clamp(26px,5dvh,52px));box-sizing:border-box}'+
    '#bdFerme button{-webkit-appearance:none;appearance:none;width:100%;max-width:340px;'+
    'border:1px solid #c9a24a;border-radius:4px;background:rgba(23,18,10,.55);'+
    'backdrop-filter:blur(3px);-webkit-backdrop-filter:blur(3px);'+
    'color:#f6efdc;padding:clamp(15px,2.1dvh,20px) 20px;font:700 clamp(12px,3.3vw,15px)/1 Arial,sans-serif;'+
    'letter-spacing:.26em;cursor:pointer;touch-action:manipulation}'+
    '#bdFerme button:active{background:rgba(201,162,74,.3)}'+
    '@media (min-height:760px){#bdFerme .in{padding-top:calc(env(safe-area-inset-top,0px) + 11dvh)}}'+
    '#bdFerme .ble{transform-origin:bottom center;animation:bdble 5s ease-in-out infinite}'+
    '#bdFerme .ble2{animation-duration:6.5s;animation-delay:-1.8s}'+
    '#bdFerme .ble3{animation-duration:4.2s;animation-delay:-3s}'+
    '@keyframes bdble{0%,100%{transform:skewX(0deg)}50%{transform:skewX(-6deg)}}'+
    '#bdFerme .lune{animation:bdlu 7s ease-in-out infinite}'+
    '@keyframes bdlu{0%,100%{opacity:.86}50%{opacity:1}}'+
    '#bdFerme .lant{animation:bdla 3.4s ease-in-out infinite}'+
    '@keyframes bdla{0%,100%{opacity:.22;r:8}50%{opacity:.4;r:11}}'+
    '@media (prefers-reduced-motion:reduce){#bdFerme *{animation:none!important}}';
  function sceneFerme(){
    return '<svg class="scene" viewBox="0 0 400 760" preserveAspectRatio="xMidYMax slice" aria-hidden="true">'+
      '<defs>'+
      '<linearGradient id="bdc" x1="0" y1="0" x2="0" y2="1">'+
      '<stop offset="0" stop-color="#16130c"/><stop offset=".3" stop-color="#2f2714"/><stop offset=".52" stop-color="#6b4a21"/>'+
      '<stop offset=".68" stop-color="#b9792c"/><stop offset=".8" stop-color="#e3a845"/><stop offset="1" stop-color="#f3cd77"/></linearGradient>'+
      '<linearGradient id="bdt" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#32280f"/><stop offset="1" stop-color="#14100a"/></linearGradient>'+
      '<linearGradient id="bdv" x1="0" y1="0" x2="0" y2="1">'+
      '<stop offset="0" stop-color="#14100a" stop-opacity=".62"/><stop offset=".55" stop-color="#14100a" stop-opacity=".3"/>'+
      '<stop offset="1" stop-color="#14100a" stop-opacity="0"/></linearGradient>'+
      '<radialGradient id="bdh" cx=".5" cy=".5" r=".5">'+
      '<stop offset="0" stop-color="#ffd98a" stop-opacity=".5"/><stop offset="1" stop-color="#ffd98a" stop-opacity="0"/></radialGradient>'+
      '</defs>'+
      '<rect width="400" height="760" fill="url(#bdc)"/>'+
      /* halo du soleil couché, juste au-dessus de l'horizon */
      '<ellipse cx="150" cy="600" rx="230" ry="120" fill="url(#bdh)"/>'+
      /* ÉTOILES : posées bas dans le cadre. L'image est ancrée en bas
         (xMidYMax) donc tout ce qui est trop haut disparaît sur un écran large. */
      '<g class="lune" fill="#fdf6e3" opacity=".42">'+
      '<circle cx="46" cy="252" r="1.6"/><circle cx="128" cy="300" r="1.1"/><circle cx="214" cy="236" r="1.3"/>'+
      '<circle cx="312" cy="286" r="1.1"/><circle cx="366" cy="244" r="1.4"/><circle cx="268" cy="330" r="1"/>'+
      '<circle cx="88" cy="344" r="1.2"/><circle cx="178" cy="372" r="1"/></g>'+
      /* vol d’oiseaux, pour que le ciel ne soit pas vide */
      '<g stroke="#1e1710" stroke-width="2.4" fill="none" opacity=".5" stroke-linecap="round">'+
      '<path d="M96 420q7-7 14 0q7-7 14 0"/><path d="M148 398q6-6 12 0q6-6 12 0"/>'+
      '<path d="M206 432q5-5 10 0q5-5 10 0"/><path d="M252 406q6-6 12 0q6-6 12 0"/></g>'+
      /* collines lointaines */
      '<path d="M0 596 Q90 560 182 584 Q270 606 400 576 L400 760 L0 760Z" fill="#241c0d" opacity=".75"/>'+
      /* colline principale */
      '<path d="M0 630 Q140 586 400 620 L400 760 L0 760Z" fill="url(#bdt)"/>'+
      /* silo */
      '<g transform="translate(276 512)">'+
      '<rect x="0" y="24" width="34" height="116" fill="#1b150b"/>'+
      '<path d="M0 26 Q17 -2 34 26Z" fill="#2c2012"/>'+
      '<g stroke="#120e07" stroke-width="2" opacity=".55"><path d="M0 52h34M0 80h34M0 108h34"/></g></g>'+
      /* grange */
      '<g transform="translate(104 496)">'+
      '<rect x="0" y="54" width="130" height="92" fill="#20160c"/>'+
      '<path d="M-15 56 L65 6 L145 56Z" fill="#30200f"/>'+
      '<path d="M-15 56 L145 56 L145 62 L-15 62Z" fill="#3d2a15"/>'+
      /* porte */
      '<rect x="47" y="96" width="36" height="50" fill="#f0bb58"/>'+
      '<rect x="47" y="96" width="36" height="50" fill="none" stroke="#120e07" stroke-width="2"/>'+
      '<path d="M65 96v50" stroke="#120e07" stroke-width="2"/>'+
      /* fenêtres */
      '<rect x="14" y="70" width="21" height="19" fill="#f8d684"/>'+
      '<rect x="95" y="70" width="21" height="19" fill="#f8d684"/>'+
      /* oculus du pignon */
      '<circle cx="65" cy="40" r="8" fill="#f8d684" opacity=".9"/>'+
      /* cheminée */
      '<rect x="100" y="24" width="9" height="30" fill="#14100a"/>'+
      '</g>'+
      /* lanterne sur son piquet, devant la grange */
      '<g transform="translate(62 598)">'+
      '<rect x="3" y="0" width="4" height="52" fill="#17110a"/>'+
      '<path d="M-5 -4h20v-5h-20z" fill="#17110a"/>'+
      '<circle class="lant" cx="5" cy="4" r="9" fill="#ffd98a" opacity=".3"/>'+
      '<rect x="1" y="0" width="8" height="9" fill="#ffd27a"/></g>'+
      /* bottes de foin */
      '<g fill="#3a2a12">'+
      '<ellipse cx="152" cy="668" rx="25" ry="18"/><ellipse cx="152" cy="668" rx="15" ry="10" fill="#4a371a"/>'+
      '<ellipse cx="330" cy="660" rx="20" ry="14"/><ellipse cx="330" cy="660" rx="11" ry="7" fill="#4a371a"/></g>'+
      /* clôture */
      '<g stroke="#17110a" stroke-width="5" opacity=".95">'+
      '<path d="M0 678h400M0 700h400"/>'+
      '<path d="M24 660v62M94 664v60M164 668v58M234 670v58M304 668v58M374 664v60"/></g>'+
      /* blé au vent */
      '<g stroke="#6b4a1f" stroke-width="3" opacity=".92">'+
      '<g class="ble"><path d="M18 760v-54M52 760v-44M88 760v-60"/></g>'+
      '<g class="ble ble2"><path d="M132 760v-48M176 760v-58M220 760v-42"/></g>'+
      '<g class="ble ble3"><path d="M268 760v-56M310 760v-46M352 760v-52M386 760v-44"/></g></g>'+
      /* voile sombre en haut : le texte doit rester lisible quoi qu'il arrive */
      '<rect width="400" height="520" fill="url(#bdv)"/>'+
      '</svg>';
  }
  function ecranFerme(){
    if(document.getElementById('bdFerme'))return;
    /* LE ZOOM : sans cette balise le téléphone compose la page à 980 px de
       large puis réduit tout — texte minuscule et pincement possible. */
    if(!document.querySelector('meta[name="viewport"]')){
      var mv=document.createElement('meta');mv.name='viewport';
      mv.content='width=device-width,initial-scale=1,minimum-scale=1,maximum-scale=1,user-scalable=no,viewport-fit=cover';
      (document.head||document.documentElement).appendChild(mv);
    }
    var st=document.createElement('style');st.textContent=CSS_FERME;document.head.appendChild(st);
    var d=document.createElement('div');d.id='bdFerme';
    d.innerHTML=sceneFerme()+
      '<div class="in">'+
      '<div class="k">LA FERME</div>'+
      '<h2>Les travaux<br>ont commencé</h2>'+
      '<div class="r"></div>'+
      '<p>La grange est fermée le temps de refaire les enclos et les cultures. <b>Ouverture avant 22h00.</b> Le port et la ville restent ouverts.</p>'+
      '</div>'+
      '<div class="bas"><button id="bdfeRetour">RETOUR AU PORT</button></div>';
    (document.body||document.documentElement).appendChild(d);
    try{document.documentElement.style.overflow='hidden';}catch(e){}
    window.__MAINTENANCE=true;
    var b=document.getElementById('bdfeRetour');
    if(b)b.onclick=function(){
      try{var sv=JSON.parse(localStorage.getItem('bdl.pix.v2')||'{}');
        sv.carte='extramar';sv.ext=null;sv.extc=null;
        localStorage.setItem('bdl.pix.v2',JSON.stringify(sv));}catch(e){}
      /* arrivee=1 : sans ce parametre le jeu relit la position d'annexe
         de la sauvegarde — celle de la foret — et posait le joueur a
         l'ouest du port, hors du quai. On arrive par le metro. */
      location.href='jeu.html?carte=extramar&arrivee=1&v='+Date.now();};
  }
  if(FERME_FERMEE&&versLaFerme()){
    window.__MAINTENANCE=true;   /* posé tout de suite : ferme.html lit ce drapeau avant de rediriger */
    if(document.body)ecranFerme();
    else document.addEventListener('DOMContentLoaded',ecranFerme);
  }
  verifier();
  setInterval(function(){if(!document.getElementById('bd3'))verifier();},60000);   /* si la maintenance commence pendant qu'on joue */
})();
