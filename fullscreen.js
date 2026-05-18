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
      
      // Sauvegarder l'état
      localStorage.setItem('fullscreenEnabled', 'true');
      console.log('✅ [FULLSCREEN] Activé et sauvegardé');
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
      
      // Supprimer l'état
      localStorage.removeItem('fullscreenEnabled');
      console.log('✅ [FULLSCREEN] Désactivé');
    }
  };

  // Restaurer le plein écran au chargement de la page
  function restoreFullscreen() {
    const wasFullscreen = localStorage.getItem('fullscreenEnabled') === 'true';
    
    if (wasFullscreen && !document.fullscreenElement && !document.webkitFullscreenElement) {
      console.log('🔄 [FULLSCREEN] Restauration...');
      
      // Attendre que la page soit complètement chargée + petit délai pour Safari
      setTimeout(() => {
        const elem = document.documentElement;
        
        if (elem.requestFullscreen) {
          elem.requestFullscreen().catch(err => console.log('Fullscreen error:', err));
        } else if (elem.webkitRequestFullscreen) {
          elem.webkitRequestFullscreen();
        } else if (elem.mozRequestFullScreen) {
          elem.mozRequestFullScreen();
        } else if (elem.msRequestFullscreen) {
          elem.msRequestFullscreen();
        }
        
        // Verrouiller orientation
        if (screen.orientation && screen.orientation.lock) {
          screen.orientation.lock('portrait').catch(() => {});
        }
        
        console.log('✅ [FULLSCREEN] Restauré');
      }, 300); // Augmenté de 100ms à 300ms
    }
  }

  // Mettre à jour le statut dans paramètres si présent
  function updateFullscreenStatus() {
    const statusElement = document.getElementById('fullscreenStatus');
    if (statusElement) {
      const isFullscreen = document.fullscreenElement || document.webkitFullscreenElement;
      statusElement.textContent = isFullscreen ? 'Plein écran activé' : 'Activer le plein écran';
    }
  }

  // Si l'utilisateur quitte le plein écran avec ESC, supprimer l'état
  function handleFullscreenChange() {
    const isFullscreen = document.fullscreenElement || document.webkitFullscreenElement;
    
    if (!isFullscreen) {
      localStorage.removeItem('fullscreenEnabled');
      console.log('📱 [FULLSCREEN] Désactivé par l\'utilisateur');
    }
    
    updateFullscreenStatus();
  }

  // Écouter les changements
  document.addEventListener('fullscreenchange', handleFullscreenChange);
  document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
  document.addEventListener('mozfullscreenchange', handleFullscreenChange);
  document.addEventListener('msfullscreenchange', handleFullscreenChange);

  // Restaurer au chargement
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', restoreFullscreen);
  } else {
    restoreFullscreen();
  }
  
  // Également écouter window.load pour plus de sécurité
  window.addEventListener('load', () => {
    const wasFullscreen = localStorage.getItem('fullscreenEnabled') === 'true';
    if (wasFullscreen && !document.fullscreenElement && !document.webkitFullscreenElement) {
      console.log('🔄 [FULLSCREEN] Restauration via window.load');
      setTimeout(() => {
        const elem = document.documentElement;
        if (elem.requestFullscreen) {
          elem.requestFullscreen().catch(() => {});
        } else if (elem.webkitRequestFullscreen) {
          elem.webkitRequestFullscreen();
        }
      }, 200);
    }
  });

})();
