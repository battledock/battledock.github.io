# GUIDE D'INTÉGRATION DU SYSTÈME D'AVATARS
# Battle Dock - 15 Avatars Pixelisés

## 📦 FICHIERS CRÉÉS

1. **avatars.js** - Système complet d'avatars
   - 15 designs uniques
   - Fonction drawDockerAvatar()
   - Système de déblocage par niveau
   - Noms et couleurs

2. **modifier-profil.html** - Page de sélection d'avatar
   - Grille de 15 avatars
   - Indication verrouillé/débloqué
   - Sauvegarde dans Supabase

## 🔧 INTÉGRATION DANS LES PAGES

### Étape 1 : Inclure le script
Ajouter dans le `<head>` ou avant `</body>` :

```html
<script src="avatars.js"></script>
```

### Étape 2 : Canvas HTML
Créer un canvas pour l'avatar :

```html
<canvas id="avatarCanvas" width="40" height="40"></canvas>
```

### Étape 3 : Dessiner l'avatar
Dans le JavaScript, après avoir récupéré avatar_emoji de Supabase :

```javascript
const avatarIndex = parseInt(profile.avatar_emoji) || 0;
drawDockerAvatar('avatarCanvas', avatarIndex, 40);
```

## 📋 PAGES À METTRE À JOUR

### ✅ game.html (FAIT)
- Inclure `<script src="avatars.js"></script>`
- Canvas dans la barre du haut
- Appeler `drawDockerAvatar('avatar', avatarIndex, 40)`

### ✅ travail.html (FAIT)
- Inclure `<script src="avatars.js"></script>`
- Canvas dans le header profil
- Appeler `drawDockerAvatar('avatarCanvas', avatarIndex, 40)`

### ⏳ À FAIRE :

#### leaderboard.html
```javascript
// Dans la boucle des joueurs:
players.forEach((player, i) => {
  const html = `
    <div class="player-card">
      <canvas id="avatar-${player.user_id}" width="50" height="50"></canvas>
      <span>${player.username}</span>
    </div>
  `;
  // Après insertion HTML:
  drawDockerAvatar(`avatar-${player.user_id}`, parseInt(player.avatar_emoji) || 0, 50);
});
```

#### amis.html
```javascript
// Pour chaque ami:
friends.forEach(friend => {
  const html = `
    <div class="friend-card">
      <canvas id="friend-${friend.user_id}" width="50" height="50"></canvas>
      ...
    </div>
  `;
  // Dessiner:
  drawDockerAvatar(`friend-${friend.user_id}`, parseInt(friend.avatar_emoji) || 0, 50);
});
```

#### chat-global.html
```javascript
// Pour chaque message:
messages.forEach((msg, i) => {
  const html = `
    <div class="message">
      <canvas id="msg-avatar-${i}" width="40" height="40"></canvas>
      ...
    </div>
  `;
  // Dessiner:
  drawDockerAvatar(`msg-avatar-${i}`, parseInt(msg.avatar_emoji) || 0, 40);
});
```

## 🎨 LES 15 AVATARS

0. Docker Classique (Jaune) - NIV 1
1. Chef d'Équipe (Rouge) - NIV 1
2. Capitaine du Port (Bleu) - NIV 1
3. Écologiste (Vert) - NIV 5
4. Contremaître (Orange) - NIV 5
5. Superviseur Royal (Violet) - NIV 10
6. Docker Amour (Rose) - NIV 10
7. Maître de l'Eau (Cyan) - NIV 15
8. Docker Professionnel (Blanc/Rouge) - NIV 15
9. Agent de Sécurité (Noir/Jaune) - NIV 20
10. VIP Premium (Or) - NIV 25
11. Commando (Camouflage) - NIV 30
12. Légende Arc-en-ciel (Multi) - NIV 35
13. Chef de Quai (Jaune/Or) - NIV 40
14. Dieu du Dock (Or/Blanc) - NIV 50

## 🔒 SYSTÈME DE DÉBLOCAGE

```javascript
// Vérifier si un avatar est débloqué:
const isUnlocked = isAvatarUnlocked(avatarIndex, userLevel);

// Obtenir tous les avatars débloqués:
const unlockedAvatars = getUnlockedAvatars(userLevel);

// Afficher seulement les débloqués:
unlockedAvatars.forEach(index => {
  // Afficher avatar...
});
```

## 🎯 TAILLES RECOMMANDÉES

- Barre du haut / Header : 40px × 40px
- Profil détaillé : 60px × 60px ou 80px × 80px
- Liste de joueurs : 50px × 50px
- Messages / Chat : 32px × 32px ou 40px × 40px
- Miniature : 32px × 32px

## 📝 EXEMPLE COMPLET

```html
<!DOCTYPE html>
<html>
<head>
  <title>Ma Page</title>
</head>
<body>
  <!-- Canvas pour l'avatar -->
  <canvas id="myAvatar" width="50" height="50"></canvas>

  <!-- Scripts -->
  <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.39.0/dist/umd/supabase.min.js"></script>
  <script src="avatars.js"></script>
  <script>
    const supabaseClient = createClient(supabaseUrl, supabaseKey);
    const userId = localStorage.getItem('userId');

    async function loadProfile() {
      const { data } = await supabaseClient
        .from('profiles')
        .select('avatar_emoji')
        .eq('user_id', userId)
        .single();

      if (data) {
        const avatarIndex = parseInt(data.avatar_emoji) || 0;
        drawDockerAvatar('myAvatar', avatarIndex, 50);
      }
    }

    loadProfile();
  </script>
</body>
</html>
```

## ✨ STYLE CSS RECOMMANDÉ

```css
canvas {
  image-rendering: pixelated;
  image-rendering: -moz-crisp-edges;
  image-rendering: crisp-edges;
}

.avatar-container {
  background: linear-gradient(135deg, #4A9BC7, #3182ce);
  border-radius: 12px;
  border: 3px solid white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  padding: 5px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
```

## 🚀 DÉPLOIEMENT

1. Upload avatars.js sur le serveur
2. Upload modifier-profil.html
3. Mettre à jour toutes les pages listées
4. Tester chaque avatar (0-14)
5. Vérifier le système de déblocage par niveau

---

**Système complet et prêt à l'emploi ! 🎮**