// =====================================================
// BATTLE DOCK - SYSTÈME D'AVATARS COMPLET
// 15 avatars de dockers pixelisés (8x8)
// =====================================================

const DOCKER_AVATARS = {
  // Avatar 0 - Casque Jaune Classique
  0: [
    [0,0,3,3,3,3,0,0],
    [0,3,3,3,3,3,3,0],
    [3,3,3,3,3,3,3,3],
    [0,1,1,1,1,1,1,0],
    [0,1,2,1,1,2,1,0],
    [0,1,1,1,1,1,1,0],
    [0,1,1,4,4,1,1,0],
    [0,0,1,1,1,1,0,0]
  ],

  // Avatar 1 - Casque Rouge
  1: [
    [0,0,7,7,7,7,0,0],
    [0,7,7,7,7,7,7,0],
    [7,7,7,7,7,7,7,7],
    [0,1,1,1,1,1,1,0],
    [0,1,2,1,1,2,1,0],
    [0,1,1,1,1,1,1,0],
    [0,1,1,4,4,1,1,0],
    [0,0,1,1,1,1,0,0]
  ],

  // Avatar 2 - Casque Bleu
  2: [
    [0,0,8,8,8,8,0,0],
    [0,8,8,8,8,8,8,0],
    [8,8,8,8,8,8,8,8],
    [0,1,1,1,1,1,1,0],
    [0,1,2,1,1,2,1,0],
    [0,1,1,1,1,1,1,0],
    [0,1,1,4,4,1,1,0],
    [0,0,1,1,1,1,0,0]
  ],

  // Avatar 3 - Casque Vert
  3: [
    [0,0,10,10,10,10,0,0],
    [0,10,10,10,10,10,10,0],
    [10,10,10,10,10,10,10,10],
    [0,1,1,1,1,1,1,0],
    [0,1,2,1,1,2,1,0],
    [0,1,1,1,1,1,1,0],
    [0,1,1,4,4,1,1,0],
    [0,0,1,1,1,1,0,0]
  ],

  // Avatar 4 - Casque Orange
  4: [
    [0,0,9,9,9,9,0,0],
    [0,9,9,9,9,9,9,0],
    [9,9,9,9,9,9,9,9],
    [0,1,1,1,1,1,1,0],
    [0,1,2,1,1,2,1,0],
    [0,1,1,1,1,1,1,0],
    [0,1,1,4,4,1,1,0],
    [0,0,1,1,1,1,0,0]
  ],

  // Avatar 5 - Casque Violet
  5: [
    [0,0,11,11,11,11,0,0],
    [0,11,11,11,11,11,11,0],
    [11,11,11,11,11,11,11,11],
    [0,1,1,1,1,1,1,0],
    [0,1,2,1,1,2,1,0],
    [0,1,1,1,1,1,1,0],
    [0,1,1,4,4,1,1,0],
    [0,0,1,1,1,1,0,0]
  ],

  // Avatar 6 - Casque Rose
  6: [
    [0,0,12,12,12,12,0,0],
    [0,12,12,12,12,12,12,0],
    [12,12,12,12,12,12,12,12],
    [0,1,1,1,1,1,1,0],
    [0,1,2,1,1,2,1,0],
    [0,1,1,1,1,1,1,0],
    [0,1,1,4,4,1,1,0],
    [0,0,1,1,1,1,0,0]
  ],

  // Avatar 7 - Casque Cyan
  7: [
    [0,0,13,13,13,13,0,0],
    [0,13,13,13,13,13,13,0],
    [13,13,13,13,13,13,13,13],
    [0,1,1,1,1,1,1,0],
    [0,1,2,1,1,2,1,0],
    [0,1,1,1,1,1,1,0],
    [0,1,1,4,4,1,1,0],
    [0,0,1,1,1,1,0,0]
  ],

  // Avatar 8 - Casque Blanc avec Bandes
  8: [
    [0,0,14,14,14,14,0,0],
    [0,14,7,14,14,7,14,0],
    [14,14,14,14,14,14,14,14],
    [0,1,1,1,1,1,1,0],
    [0,1,2,1,1,2,1,0],
    [0,1,1,1,1,1,1,0],
    [0,1,1,4,4,1,1,0],
    [0,0,1,1,1,1,0,0]
  ],

  // Avatar 9 - Casque Noir avec Ligne Jaune
  9: [
    [0,0,2,2,2,2,0,0],
    [0,2,3,3,3,3,2,0],
    [2,2,2,2,2,2,2,2],
    [0,1,1,1,1,1,1,0],
    [0,1,2,1,1,2,1,0],
    [0,1,1,1,1,1,1,0],
    [0,1,1,4,4,1,1,0],
    [0,0,1,1,1,1,0,0]
  ],

  // Avatar 10 - Casque Doré VIP
  10: [
    [0,0,15,15,15,15,0,0],
    [0,15,15,15,15,15,15,0],
    [15,15,3,15,15,3,15,15],
    [0,1,1,1,1,1,1,0],
    [0,1,2,1,1,2,1,0],
    [0,1,1,1,1,1,1,0],
    [0,1,1,4,4,1,1,0],
    [0,0,1,1,1,1,0,0]
  ],

  // Avatar 11 - Casque Camouflage
  11: [
    [0,0,10,16,10,16,0,0],
    [0,16,10,16,10,16,10,0],
    [10,16,10,16,10,16,10,16],
    [0,1,1,1,1,1,1,0],
    [0,1,2,1,1,2,1,0],
    [0,1,1,1,1,1,1,0],
    [0,1,1,4,4,1,1,0],
    [0,0,1,1,1,1,0,0]
  ],

  // Avatar 12 - Casque Arc-en-ciel
  12: [
    [0,0,7,9,3,10,0,0],
    [0,8,11,12,13,7,9,0],
    [3,10,8,11,12,13,7,9],
    [0,1,1,1,1,1,1,0],
    [0,1,2,1,1,2,1,0],
    [0,1,1,1,1,1,1,0],
    [0,1,1,4,4,1,1,0],
    [0,0,1,1,1,1,0,0]
  ],

  // Avatar 13 - Casque de Chef (avec étoiles)
  13: [
    [0,0,3,3,3,3,0,0],
    [0,3,15,3,3,15,3,0],
    [3,3,3,15,15,3,3,3],
    [0,1,1,1,1,1,1,0],
    [0,1,2,1,1,2,1,0],
    [0,1,1,1,1,1,1,0],
    [0,1,1,4,4,1,1,0],
    [0,0,1,1,1,1,0,0]
  ],

  // Avatar 14 - Casque Légendaire (effet brillant)
  14: [
    [0,0,15,15,15,15,0,0],
    [0,15,14,15,15,14,15,0],
    [15,15,15,14,14,15,15,15],
    [0,1,1,1,1,1,1,0],
    [0,1,2,14,14,2,1,0],
    [0,1,1,1,1,1,1,0],
    [0,1,1,4,4,1,1,0],
    [0,0,1,1,1,1,0,0]
  ]
};

const AVATAR_COLORS = {
  0: 'transparent',
  1: '#ffd7a8',      // Peau
  2: '#000000',      // Noir
  3: '#fbbf24',      // Jaune
  4: '#8b4513',      // Marron
  7: '#dc2626',      // Rouge
  8: '#3b82f6',      // Bleu
  9: '#f97316',      // Orange
  10: '#22c55e',     // Vert
  11: '#a855f7',     // Violet
  12: '#ec4899',     // Rose
  13: '#06b6d4',     // Cyan
  14: '#f3f4f6',     // Blanc/Gris clair
  15: '#ffd700',     // Or
  16: '#166534'      // Vert foncé
};

const AVATAR_NAMES = {
  0: 'Docker Classique',
  1: 'Chef d\'Équipe',
  2: 'Capitaine du Port',
  3: 'Écologiste',
  4: 'Contremaître',
  5: 'Superviseur Royal',
  6: 'Docker Amour',
  7: 'Maître de l\'Eau',
  8: 'Docker Professionnel',
  9: 'Agent de Sécurité',
  10: 'VIP Premium',
  11: 'Commando',
  12: 'Légende Arc-en-ciel',
  13: 'Chef de Quai',
  14: 'Dieu du Dock'
};

const AVATAR_UNLOCK_LEVELS = {
  0: 1,   // Dès le début
  1: 1,   // Dès le début
  2: 1,   // Dès le début
  3: 5,   // Niveau 5
  4: 5,   // Niveau 5
  5: 10,  // Niveau 10
  6: 10,  // Niveau 10
  7: 15,  // Niveau 15
  8: 15,  // Niveau 15
  9: 20,  // Niveau 20
  10: 25, // Niveau 25
  11: 30, // Niveau 30
  12: 35, // Niveau 35
  13: 40, // Niveau 40
  14: 50  // Niveau 50 (max)
};

// =====================================================
// FONCTION DE RENDU D'AVATAR
// =====================================================

function drawDockerAvatar(canvasId, avatarIndex, size = 40) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const avatarData = DOCKER_AVATARS[avatarIndex];
  
  if (!avatarData) {
    console.error('Avatar index invalide:', avatarIndex);
    return;
  }

  const pixelSize = size / 8;
  
  // Clear canvas
  ctx.clearRect(0, 0, size, size);
  
  // Draw pixels
  for (let y = 0; y < 8; y++) {
    for (let x = 0; x < 8; x++) {
      const colorCode = avatarData[y][x];
      if (colorCode !== 0) {
        ctx.fillStyle = AVATAR_COLORS[colorCode];
        ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
      }
    }
  }
}

// =====================================================
// FONCTION POUR VÉRIFIER SI UN AVATAR EST DÉBLOQUÉ
// =====================================================

function isAvatarUnlocked(avatarIndex, userLevel) {
  const requiredLevel = AVATAR_UNLOCK_LEVELS[avatarIndex];
  return requiredLevel !== undefined && userLevel >= requiredLevel;
}

// =====================================================
// FONCTION POUR OBTENIR TOUS LES AVATARS DÉBLOQUÉS
// =====================================================

function getUnlockedAvatars(userLevel) {
  return Object.keys(DOCKER_AVATARS)
    .map(Number)
    .filter(index => isAvatarUnlocked(index, userLevel));
}

// =====================================================
// EXPORT
// =====================================================

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    DOCKER_AVATARS,
    AVATAR_COLORS,
    AVATAR_NAMES,
    AVATAR_UNLOCK_LEVELS,
    drawDockerAvatar,
    isAvatarUnlocked,
    getUnlockedAvatars
  };
}