/* =====================================================================
   BATTLE DOCK — LE GESTE DE RETOUR

   SUR IPHONE, UN DOIGT QUI PART DU BORD GAUCHE FAIT RECULER SAFARI D'UNE
   PAGE. Aucun preventDefault ne l'arrete : c'est un geste du systeme, pas
   un evenement de la page. On ouvrait l'etable, on grattait un ticket, on
   faisait glisser un doigt un peu trop a gauche — et l'ecran se refermait
   en revenant a la page precedente. De l'interieur, ça ressemblait a
   « les menus ne marchent pas ».

   ON NE L'EMPECHE DONC PAS, ON L'ATTRAPE. Chaque page pose une entree
   d'historique de garde. Quand le geste la consomme, on la remet aussitot
   et l'on referme le panneau ouvert au lieu de quitter l'ecran : le geste
   devient « fermer », ce qu'il aurait du etre. S'il n'y a rien d'ouvert,
   il ne se passe rien du tout — on reste dans le jeu.

   ET PENDANT UN GESTE EN COURS, il ne se passe rien non plus : gratter un
   ticket, c'est justement balayer l'ecran de gauche a droite. La page
   pose window.__retourVerrou a l'horloge courante tant que le doigt
   travaille, et le retour est ignore pendant une seconde et demie.
   ===================================================================== */
(function(){
  if(window.__retourPose)return;
  window.__retourPose=true;

  /* Les panneaux du jeu s'ouvrent tous de la meme façon : une classe
     « on » sur un element connu. L'ordre compte — le premier trouve est
     celui qu'on ferme, donc les plus superposes d'abord. */
  var PANNEAUX=['petanque','panorama','catalogue','carnetP','porte',
                'page2','pan','enLigne','annonce','voyage'];

  function garde(){
    try{
      if(history.state&&history.state.bd)return;
      history.pushState({bd:1},'');
    }catch(e){}
  }

  function verrouille(){
    try{
      var t=window.__retourVerrou||0;
      return (Date.now()-t)<1500;
    }catch(e){return false;}
  }

  /* les surcouches creees a la volee, posees directement sur le corps */
  function volante(){
    try{return document.querySelector('.gt,.crv-ticket');}catch(e){return null;}
  }

  function fermerLeDessus(){
    var v=volante();
    if(v){try{v.remove();}catch(e){}return true;}
    for(var i=0;i<PANNEAUX.length;i++){
      var el=document.getElementById(PANNEAUX[i]);
      if(!el||!el.classList||!el.classList.contains('on'))continue;
      /* ON PASSE PAR LA CROIX QUAND IL Y EN A UNE : elle fait le menage
         que le simple retrait de la classe ne ferait pas. */
      var x=el.querySelector('[aria-label="Fermer"]');
      if(x&&typeof x.onclick==='function'){
        try{x.onclick(new Event('click'));return true;}catch(e){}
      }
      el.classList.remove('on');
      return true;
    }
    return false;
  }

  try{
    garde();
    addEventListener('popstate',function(){
      garde();
      if(verrouille())return;
      fermerLeDessus();
    });
    /* au retour depuis le cache de Safari, l'entree de garde a disparu */
    addEventListener('pageshow',function(){garde();});
  }catch(e){}

  /* LE REBOND ELASTIQUE DE SAFARI tire la page entiere quand on glisse
     vers le bas dans un panneau arrive en bout de course. Rien a voir
     avec le retour, mais c'est la meme impression : l'ecran bouge tout
     seul. Une ligne de style suffit a le couper. */
  try{
    var st=document.createElement('style');
    st.textContent='html,body{overscroll-behavior:none;-webkit-overflow-scrolling:touch}';
    (document.head||document.documentElement).appendChild(st);
  }catch(e){}
})();
