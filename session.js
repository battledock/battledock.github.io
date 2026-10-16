/* =====================================================================
   LA SESSION DU PORT

   POURQUOI CE FICHIER EXISTE. Un joueur nous a dit « je crois que je
   suis interdit de casino ». Il ne l'etait pas : il jouait tous les
   jours, son compte bougeait, et il n'avait jamais pu miser un centime
   ni prendre un seul jeton.

   LA CAUSE. Le jeu et les salles ne demandent pas la meme chose. Le jeu
   appelle ses fonctions avec p_joueur, c'est-a-dire en DISANT qui il
   est : il marche donc sans session ouverte. Le casino et l'arcade,
   eux, touchent a l'argent — ils lisent auth.uid(), c'est-a-dire qu'ils
   exigent une session PROUVEE. Or jeu.html laissait entrer sans
   session des que la sauvegarde locale portait un identifiant : le
   joueur traversait tout le port sans s'apercevoir de rien, et se
   faisait refouler a la seule porte qui verifie.

   CE QU'ON FAIT. D'abord REVEILLER : une session expiree se rattrape
   presque toujours avec le jeton de rafraichissement, et personne n'a
   rien a faire. Ensuite, si elle est vraiment morte, LE DIRE A L'ENDROIT
   OU CA COINCE, avec le bouton qui repare — au lieu d'un « connecte-toi
   dans le jeu » adresse a quelqu'un qui EST dans le jeu.
   ===================================================================== */
(function(){
  var CSS='#bdSess{position:fixed;left:0;right:0;top:0;z-index:2147482000;'+
    'display:flex;align-items:center;gap:10px;box-sizing:border-box;'+
    'padding:calc(env(safe-area-inset-top,0px) + 9px) 12px 9px;'+
    'background:linear-gradient(180deg,#5a1a14,#3a100c);color:#ffe8d8;'+
    'font-family:\'Baloo 2\',\'Trebuchet MS\',system-ui,sans-serif;'+
    'box-shadow:0 2px 14px rgba(0,0,0,.5)}'+
    '#bdSess .tx{flex:1;min-width:0}'+
    '#bdSess b{display:block;font:700 13px \'Baloo 2\',sans-serif;line-height:1.15}'+
    '#bdSess small{display:block;font:italic 11px Georgia,serif;color:rgba(255,232,216,.8);margin-top:2px}'+
    '#bdSess button{-webkit-appearance:none;appearance:none;flex:none;border:0;border-radius:10px;'+
    'min-height:40px;padding:10px 13px;background:#ffd8c0;color:#3a100c;'+
    'font:700 10px ui-monospace,monospace;letter-spacing:1.4px}'+
    '#bdSess .x{background:rgba(255,232,216,.16);color:#ffe8d8;padding:10px 12px;min-width:40px}';

  /* ON NE REVEILLE QU'UNE FOIS PAR PAGE : deux rafraichissements lances
     en meme temps se volent le jeton et se perdent tous les deux. */
  var ENCOURS=null;
  function reveiller(sb){
    if(!sb||!sb.auth)return Promise.resolve(null);
    if(ENCOURS)return ENCOURS;
    ENCOURS=(async function(){
      var s=null;
      try{var d=await sb.auth.getSession();s=d&&d.data&&d.data.session;}catch(e){}
      if(s&&s.user)return s;
      /* LE RATTRAPAGE. Le jeton d'acces ne vit que quelques heures ; le
         jeton de rafraichissement, lui, dure des semaines. Tant qu'il
         est la, la session se rouvre toute seule et le joueur ne voit
         jamais rien. C'est ce rattrapage qui manquait. */
      try{var r=await sb.auth.refreshSession();
          s=r&&r.data&&r.data.session;}catch(e){}
      return (s&&s.user)?s:null;
    })();
    return ENCOURS;
  }

  function prevenir(ou){
    if(document.getElementById('bdSess'))return;
    try{if(sessionStorage.getItem('bd.sess.vu')==='1')return;}catch(e){}
    var st=document.createElement('style');st.textContent=CSS;document.head.appendChild(st);
    var d=document.createElement('div');d.id='bdSess';
    d.innerHTML='<span class="tx"><b>Ta session a expiré</b>'+
      '<small>Reconnecte-toi pour '+(ou||'Le casino et l’arcade').toLowerCase()+
      ' — même adresse, même mot de passe. Tu retrouves tout.</small></span>'+
      '<button id="bdSessGo">ME RECONNECTER</button>'+
      '<button id="bdSessX" class="x">✕</button>';
    (document.body||document.documentElement).appendChild(d);
    document.getElementById('bdSessGo').onclick=function(){
      /* reco=1 : l'accueil ne renvoie plus tout de suite sur le port, et
         retour= ramène le joueur dans la salle après la connexion */
      var ici=(location.pathname.split('/').pop()||'jeu.html');
      location.href='index.html?reco=1&retour='+encodeURIComponent(ici)+'&v='+(window.MA_VERSION||Date.now());
    };
    document.getElementById('bdSessX').onclick=function(){
      try{sessionStorage.setItem('bd.sess.vu','1');}catch(e){}
      if(d.parentNode)d.parentNode.removeChild(d);
    };
  }
  /* LE MOT QU'ON DIT QUAND UNE MISE EST REFUSEE. « Connecte-toi dans le
     jeu » etait adresse a quelqu'un qui est deja dans le jeu : il ne
     pouvait que croire qu'on lui interdisait la salle. */
  var MOT='Ta session a expiré. Reconnecte-toi avec la même adresse — tu retrouves tout.';
  try{window.BD_SESSION={reveiller:reveiller,prevenir:prevenir,mot:MOT};}catch(e){}
})();
