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
  /* LE JEU DOIT CONNAÎTRE LE LAISSEZ-PASSER, lui aussi : le Complexe Festif
     s'ouvre pour qui le porte et reste en travaux pour les autres, et c'est
     jeu.html qui décide à l'entrée de la ruelle.
     CE N'EST PAS UNE SERRURE, et il ne faut pas s'en servir comme telle :
     la sauvegarde est sur l'appareil, n'importe qui peut y écrire 'eliasse'
     ou poser bd.passe à la main. C'est un rideau de chantier, pas une
     porte fermée à clé. Le jour où il y aura de l'argent derrière, la
     vérification devra se faire côté serveur. */
  try{window.__PASSE=PASSE;}catch(e){}
  /* LES NOUVEAUTES DE LA 5.0. La liste precedente etait celle de la 3.0 —
     la foret, la maison, le marche — et elle serait restee affichee sous un
     titre « 4.0 » le jour ou l'on fermerait le jeu. On raconte donc ce qui a
     vraiment ete bati depuis : le Complexe Festif et ses deux portes. */
  /* LES NOUVEAUTÉS DE LA 5.1 — Halloween s'invite dans le jeu */
  var NOUV=[
    ['🎃','Halloween à la ferme','Un épouvantail-sorcier au bord du champ et son corbeau, des citrouilles-lanternes le long de toutes les allées, la façade de Madeleine décorée, et un cimetière des légumes où rôde un petit fantôme la nuit.'],
    ['🧺','Les citrouilles de Madeleine','Plante des citrouilles, puis choisis : les vendre, ou les donner à Madeleine. À 200, 500 et 800 dons, trois tenues collector qui ne reviendront jamais : le Seigneur des citrouilles, Tête de citrouille et le Roi de la récolte.'],
    ['👻','50 espèces d’Halloween','Jusqu’au 2 novembre, des poissons étranges mordent au port et au lac : sardine fantôme, rouget vampire, bébé kraken, objets maudits… et, la nuit seulement, deux légendaires : le Léviathan des Ténèbres et le Capitaine Fantôme.'],
    ['🐟','La Marée','Une nouvelle poissonnerie au bout du quai, seul endroit où vendre ta pêche. L’étal de glace, le prix du jour et sa tendance, et un onglet Halloween rien que pour les prises maudites.'],
    ['🎣','Le Pêcheur Heureux refait','Une vraie cabane de pêcheur sur le quai, et une boutique toute neuve : cannes, accessoires, appâts et finitions en cartes claires.'],
    ['🐷','La nouvelle ferme','Une porcherie et ses cochons, un pré à moutons et sa bergerie, et un boulodrome pour jouer à la pétanque contre le village.'],
    ['🏆','La pétanque, en grand','Un nouveau gameplay tactique : poser sa donnée, choisir sa portée, viser au bon moment. Des terrains vivants avec leur public, un Mondial à disputer et ta fiche de joueur.'],
    ['⚓','Le port fait peau neuve','Un quai en granit clair comme le vrai Vieux-Port, une station de métro moderne qui mène à la ferme, à la forêt et à Tokyo.'],
    ['📱','Des menus plus beaux','Des boutiques redessinées, plus claires et plus faciles au doigt, qui s’adaptent à ton téléphone comme à ta tablette.'],
    ['🎁','Et des surprises…','On ne dit rien. Promène-toi la nuit.']];
  var CSS='#bd3{position:fixed;inset:0;z-index:2147483000;overflow-y:auto;overflow-x:hidden;background:radial-gradient(ellipse 120% 60% at 50% 0,#4a2a6a 0,#22123a 45%,#0c0816 100%);color:#f4ecd8;font-family:"Baloo 2","Trebuchet MS",system-ui,sans-serif;-webkit-overflow-scrolling:touch}'+
    '#bd3 .ciel{position:absolute;left:0;right:0;top:0;height:300px;pointer-events:none;overflow:hidden}'+
    '#bd3 .lune{position:absolute;right:8%;top:28px;width:82px;height:82px;border-radius:50%;background:radial-gradient(circle at 40% 40%,#fff6d8,#f0d890 60%,#c8a850);box-shadow:0 0 50px 14px rgba(255,220,140,.35)}'+
    '#bd3 .cs{position:absolute;font-size:20px;animation:bd3v 6s ease-in-out infinite}@keyframes bd3v{0%,100%{transform:translate(0,0)}50%{transform:translate(18px,-10px)}}'+
    '#bd3 .et{position:absolute;width:2px;height:2px;background:#fff;border-radius:50%;opacity:.7}'+
    '#bd3 .in{position:relative;max-width:580px;margin:0 auto;padding:calc(env(safe-area-inset-top,0px) + 34px) 18px calc(env(safe-area-inset-bottom,0px) + 40px)}'+
    '#bd3 .v{display:inline-block;background:#e07a22;color:#2a1004;border-radius:20px;padding:3px 13px;font-weight:800;font-size:12px;letter-spacing:3px;box-shadow:0 3px 0 #7a3a10}'+
    '#bd3 h1{margin:14px 0 4px;font-weight:800;font-size:44px;line-height:1;letter-spacing:1px;color:#fff}#bd3 h1 b{color:#ffb040;text-shadow:0 0 18px rgba(255,140,40,.6)}'+
    '#bd3 h2{margin:0 0 10px;font-weight:800;font-size:21px;line-height:1.15;color:#ffb040}'+
    '#bd3 .mt{font-weight:700;font-size:15px;line-height:1.45;color:#e8dcf4;margin-bottom:6px}'+
    '#bd3 .roue{display:flex;align-items:center;gap:12px;margin:18px 0 24px;padding:14px 16px;border-radius:18px;background:linear-gradient(135deg,rgba(224,122,34,.22),rgba(122,58,184,.22));border:2px solid #e07a22}'+
    '#bd3 .roue .p{flex:none;font-size:34px;animation:bd3p 1.6s ease-in-out infinite}@keyframes bd3p{0%,100%{transform:rotate(-8deg)}50%{transform:rotate(8deg) scale(1.08)}}'+
    '#bd3 .roue b{display:block;font-size:12px;letter-spacing:2px;color:#ffb040}#bd3 .roue strong{display:block;font-size:19px;color:#fff;line-height:1.15}'+
    '#bd3 .roue small{display:block;font:800 14px ui-monospace,monospace;color:#ffd970;margin-top:3px}'+
    '#bd3 .t2{font-weight:800;font-size:12px;letter-spacing:3px;color:#c8a8e8;margin:4px 0 12px}'+
    '#bd3 .g{display:grid;grid-template-columns:1fr;gap:10px}@media (min-width:560px){#bd3 .g{grid-template-columns:1fr 1fr}}'+
    '#bd3 .c{display:flex;gap:12px;background:rgba(255,255,255,.06);border:1px solid rgba(200,168,232,.25);border-radius:16px;padding:12px 14px}'+
    '#bd3 .c .e{flex:none;width:46px;height:46px;border-radius:12px;background:rgba(224,122,34,.18);display:flex;align-items:center;justify-content:center;font-size:26px}'+
    '#bd3 .c b{display:block;font-weight:800;font-size:16.5px;color:#fff;margin-bottom:2px;line-height:1.15}#bd3 .c span{display:block;font-weight:700;font-size:13.5px;color:#d8cce8;line-height:1.4}'+
    '#bd3 .fin{text-align:center;font-weight:700;font-size:14px;color:#c8a8e8;margin-top:22px}';
  /* LA RÉOUVERTURE : le serveur donne l'heure ; on affiche le compte à rebours, et on recharge à l'heure dite */
  var FIN_A=0;
  function reste(){var r=Math.max(0,Math.round((FIN_A-Date.now())/1000));var h=Math.floor(r/3600),m=Math.floor(r%3600/60),x=r%60;
    return r<=0?'C’est l’heure ! On ouvre…':'encore '+(h>0?h+' h '+(m<10?'0':'')+m+' min '+(x<10?'0':'')+x+' s':m+' min '+(x<10?'0':'')+x+' s');}
  function tic(){var el=document.getElementById('bd3r');if(!el)return;el.textContent=reste();
    if(FIN_A&&Date.now()>=FIN_A+3000){location.reload();return;}setTimeout(tic,1000);}
  function montrer(v,d){
    if(d&&typeof d.reste==='number')FIN_A=Date.now()+d.reste*1000;
    if(document.getElementById('bd3'))return;
    var st=document.createElement('style');st.textContent=CSS;document.head.appendChild(st);
    var el=document.createElement('div');el.id='bd3';
    var et='';for(var k=0;k<40;k++)et+='<i class="et" style="left:'+((k*37)%100)+'%;top:'+((k*53)%260)+'px;opacity:'+(0.3+(k%5)/8)+'"></i>';
    var cs='';for(var q=0;q<4;q++)cs+='<span class="cs" style="left:'+[12,30,62,78][q]+'%;top:'+[60,120,150,40][q]+'px;animation-delay:-'+q*1.4+'s">🦇</span>';
    el.innerHTML='<div class="ciel">'+et+'<div class="lune"></div>'+cs+'</div><div class="in"><span class="v">MAINTENANCE · VERSION '+(v||'5.1')+'</span><h1>Battle Dock <b>'+(v||'5.1')+'</b></h1>'+
      '<h2>Halloween s’invite dans le jeu 🎃</h2>'+
      '<div class="mt">Le port, la ferme, la forêt et Tokyo sont fermés le temps d’installer la mise à jour : une nouvelle ferme, des menus plus beaux et plus pratiques, et tout un mois d’Halloween.</div>'+
      '<div class="roue"><span class="p">🎃</span><span><b>RÉOUVERTURE</b><strong>Mardi 20 octobre 2026 à 22h00</strong>'+(FIN_A?'<small id="bd3r">'+reste()+'</small>':'')+'</span></div>'+
      '<div class="t2">LES NOUVEAUTÉS</div><div class="g">'+
      NOUV.map(function(n){return '<div class="c"><div class="e">'+n[0]+'</div><div><b>'+n[1]+'</b><span>'+n[2]+'</span></div></div>';}).join('')+
      '</div><div class="fin">Merci de ta patience — rendez-vous à 22h00 sur le port. 🦇</div></div>';
    (document.body||document.documentElement).appendChild(el);
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
  var FORET_FERMEE=false;   /* ROUVERTE À TOUS. Pour refermer : repasser a true */
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
  var FERME_FERMEE=false;  /* LA FERME EST ROUVERTE. Pour la refermer : repasser a true */
  /* LE JEU DOIT SAVOIR QUE LA FERME EST FERMÉE, lui aussi : sans ce
     drapeau, marcher vers l'ouest du quai chargeait les 1,6 Mo du jeu
     pour n'afficher que l'écran de chantier. Le port lit ce drapeau et
     prévient sur place, sans quitter la carte.
     IL TIENT COMPTE DU LAISSEZ-PASSER. Sans le !PASSE, l'écran de
     chantier s'écartait bien pour qui porte le passe — mais le quai, lui,
     continuait de refuser le chemin de l'ouest : la ferme restait
     inaccessible à celui-là même qui est censé pouvoir y travailler.
     Le drapeau dit « fermée POUR CE JOUEUR », pas « en travaux ». */
  try{window.__FERME_FERMEE=FERME_FERMEE&&!PASSE;}catch(e){}
  /* LE LAISSEZ-PASSER REDEVIENT VALABLE ICI, comme pour la forêt : la
     ferme etant ouverte a tous, l'exception qui l'ignorait n'a plus
     d'objet, et la laisser aurait fait mentir le drapeau le jour ou l'on
     referme. */
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
      '<h2>On la termine<br>aujourd’hui</h2>'+
      '<div class="r"></div>'+
      '<p>Dernière journée de travaux : la ferme sera <b>définitivement terminée ce soir</b>. La ruelle et ses six corps, le porche, le verger, le potager et l’enclos. Le port et la ville restent ouverts.</p>'+
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
  if(FERME_FERMEE&&versLaFerme()&&!PASSE){
    window.__MAINTENANCE=true;   /* posé tout de suite : ferme.html lit ce drapeau avant de rediriger */
    if(document.body)ecranFerme();
    else document.addEventListener('DOMContentLoaded',ecranFerme);
  }
  verifier();
  setInterval(function(){if(!document.getElementById('bd3'))verifier();},60000);   /* si la maintenance commence pendant qu'on joue */
})();
