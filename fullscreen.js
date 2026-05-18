// Fullscreen global handler
(function() {
  'use strict';
  
  console.log('🖥️ [FULLSCREEN] Module chargé');

  // Fonction pour basculer le plein écran
  window.toggleFullscreen = function() {
    const elem = document.documentElement;
    
    if (!document.fullscreenElement && !document.webkitFullscreenElement) {
      // Entrer en plein écran
      if (elem.requestFullscreen) {
        elem.requestFullscreen();
      } else if (elem.webkitRequestFullscreen) {
        elem.webkitRequestFullscreen();
      } else if (elem.mozRequestFullScreen) {
        elem.mozRequestFullScreen();
      } else if (elem.msRequestFullscreen) {
        elem.msRequestFullscreen();
      }
      
      // Verrouiller orientation portrait
      if (screen.orientation && screen.orientation.lock) {
        screen.orientation.lock('portrait').catch(() => {});
      }
      
      console.log('✅ [FULLSCREEN] Activé');
    } else {
      // Quitter le plein écran
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
      
      console.log('✅ [FULLSCREEN] Désactivé');
    }
  };

  // Mettre à jour le statut dans paramètres si présent
  function updateFullscreenStatus() {
    const statusElement = document.getElementById('fullscreenStatus');
    if (statusElement) {
      const isFullscreen = document.fullscreenElement || document.webkitFullscreenElement;
      statusElement.textContent = isFullscreen ? 'Plein écran activé' : 'Activer le plein écran';
    }
  }

  // Écouter les changements
  document.addEventListener('fullscreenchange', updateFullscreenStatus);
  document.addEventListener('webkitfullscreenchange', updateFullscreenStatus);
  document.addEventListener('mozfullscreenchange', updateFullscreenStatus);
  document.addEventListener('msfullscreenchange', updateFullscreenStatus);

})();
